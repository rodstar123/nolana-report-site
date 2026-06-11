import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cdtSlug } from "@/lib/cdt";
import {
  fetchPoolItems,
  dedup,
  buildOpusUserMessage,
  OPUS_SYSTEM_PROMPT,
  parseOpusOutput,
  writeBriefing,
} from "@/lib/agents/aggregator";
import { runAggregatorDryRun } from "@/lib/agents/aggregator-dryrun";

export const maxDuration = 300;

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronHeader = req.headers.get("x-vercel-cron");
  const isAuthorized =
    authHeader === `Bearer ${process.env.CRON_SECRET}` || cronHeader === "1";
  if (!isAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  // Dry-run A/B harness: writes to aggregator_drafts only, never
  // issues/stories. Production cron path below is untouched.
  if (req.nextUrl.searchParams.get("dry_run") === "1") {
    try {
      return await runAggregatorDryRun(req, supabase);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error("[aggregator-dryrun] error:", message);
      return NextResponse.json({ error: message }, { status: 500 });
    }
  }

  try {
    const poolItems = await fetchPoolItems(supabase);
    if (poolItems.length === 0) {
      return NextResponse.json({
        ok: true,
        message: "No items in pool (score>=50, last 7 days, not yet briefed)",
        storiesWritten: 0,
      });
    }

    const { kept, urlDedupCount, jaccardDedupCount, reroutedCount } =
      dedup(poolItems);

    const { data: downSources } = await supabase
      .from("source_health")
      .select("source_name")
      .eq("status", "down");
    const downNames = (downSources ?? []).map(
      (s: { source_name: string }) => s.source_name,
    );

    const userMessage = buildOpusUserMessage(
      kept,
      { urlDedupCount, jaccardDedupCount, reroutedCount },
      poolItems.length,
      downNames,
    );

    const opusRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": process.env.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-opus-4-8",
        max_tokens: 40000,
        thinking: { type: "adaptive" },
        output_config: { effort: "high" },
        system: [
          {
            type: "text",
            text: OPUS_SYSTEM_PROMPT,
            cache_control: { type: "ephemeral" },
          },
        ],
        messages: [{ role: "user", content: userMessage }],
      }),
    });

    if (!opusRes.ok) {
      const errText = await opusRes.text();
      return NextResponse.json(
        { error: `Opus ${opusRes.status}: ${errText.slice(0, 300)}` },
        { status: 502 },
      );
    }

    const opusJson = (await opusRes.json()) as {
      content?: Array<{ type?: string; text?: string }>;
      usage?: { input_tokens?: number; output_tokens?: number };
      stop_reason?: string;
    };
    if (opusJson.stop_reason === "max_tokens") {
      console.warn(
        `[aggregator] Opus response truncated (hit max_tokens). Output tokens: ${opusJson.usage?.output_tokens}`,
      );
    }
    const textBlock = (opusJson.content ?? []).find((b) => b.type === "text");
    const briefingMarkdown = textBlock?.text ?? "";
    const tokens =
      (opusJson.usage?.input_tokens ?? 0) +
      (opusJson.usage?.output_tokens ?? 0);

    const {
      opening,
      stories,
      headline,
      businessTemperature,
      valleyMoneyMap,
      threeMoves,
      quietSignal,
      ownersMove,
      riskRadar,
      thinkingQuestion,
      beforeYouGo,
      breathers,
    } = parseOpusOutput(briefingMarkdown);
    const { issueId, storiesWritten } = await writeBriefing(
      supabase,
      opening,
      stories,
      poolItems,
      {
        headline,
        businessTemperature,
        valleyMoneyMap,
        threeMoves,
        quietSignal,
        ownersMove,
        riskRadar,
        thinkingQuestion,
        beforeYouGo,
        breathers,
      },
    );

    if (storiesWritten > 0 && !breathers) {
      const storySummaries = stories
        .slice(0, 15)
        .map(
          (s, i) =>
            `${i + 1}. "${s.headline}" (NRI ${s.nri}/10) — ${s.summary?.slice(0, 120) ?? ""}`,
        )
        .join("\n");
      try {
        const breatherRes = await fetch(
          "https://api.anthropic.com/v1/messages",
          {
            method: "POST",
            headers: {
              "x-api-key": process.env.ANTHROPIC_API_KEY!,
              "anthropic-version": "2023-06-01",
              "content-type": "application/json",
            },
            body: JSON.stringify({
              model: "claude-haiku-4-5-20251001",
              max_tokens: 1024,
              messages: [
                {
                  role: "user",
                  content: `Generate exactly 5 breather items for an RGV business briefing. Each is a different type. Output ONLY a JSON array — no other text.

Stories this week:
${storySummaries}

Types:
1. stat_callout: {"type":"stat_callout","number":"$3.2B","text":"one sentence"}. Number max 15 chars.
2. quick_math: {"type":"quick_math","text":"napkin math from a story, 1-3 sentences"}
3. this_time_last_year: {"type":"this_time_last_year","text":"This time last year: [then]. This week: [now]."}
4. valley_vs_national: {"type":"valley_vs_national","text":"[National stat]. [Local stat]. [What it means]."}
5. forward_this: {"type":"forward_this","text":"Know a [role] in [city]? Forward the [story] — [reason]."}

Rules: Be specific (real numbers, cities, industries from the stories above). 1-3 sentences each. Valid JSON only.`,
                },
              ],
            }),
          },
        );
        if (breatherRes.ok) {
          const breatherJson = (await breatherRes.json()) as {
            content?: Array<{ type?: string; text?: string }>;
          };
          const breatherText =
            breatherJson.content?.find((b) => b.type === "text")?.text ?? "";
          const jsonMatch = breatherText.match(/\[[\s\S]*\]/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            if (Array.isArray(parsed) && parsed.length > 0) {
              await supabase
                .from("issues")
                .update({ breathers: parsed })
                .eq("id", issueId);
            }
          }
        }
      } catch (e) {
        console.warn("[aggregator] breathers generation failed:", e);
      }
    }

    await supabase.from("agent_logs").insert({
      agent: "aggregator",
      run_started_at: new Date().toISOString(),
      run_finished_at: new Date().toISOString(),
      items_fetched: poolItems.length,
      items_new: kept.length,
      items_ingested: storiesWritten,
      tokens_used: tokens,
      errors: [],
    });

    // Warm the ISR cache so the first subscriber click doesn't cold-start
    const slug = cdtSlug();
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ?? "https://nolanareport.com";
    try {
      await fetch(`${baseUrl}/issues/${slug}`, {
        headers: { "x-purpose": "cache-warm" },
      });
    } catch {
      // Non-fatal — page will still build on first visitor click
    }

    // Trigger Spanish translation pass (non-blocking — English goes out regardless)
    try {
      await fetch(`${baseUrl}/api/translate-briefing`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-vercel-cron": "1",
        },
        body: JSON.stringify({ slug }),
      });
    } catch (translationErr) {
      console.warn(
        "[aggregator] Spanish translation failed (non-blocking):",
        translationErr,
      );
    }

    return NextResponse.json({
      ok: true,
      poolSize: poolItems.length,
      afterDedup: kept.length,
      urlDedupCount,
      jaccardDedupCount,
      reroutedCount,
      storiesWritten,
      issueId,
      opusTokens: tokens,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[aggregator] error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
