import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  fetchPoolItems,
  dedup,
  buildOpusUserMessage,
  OPUS_SYSTEM_PROMPT,
  parseOpusOutput,
  writeBriefing,
} from "@/lib/agents/aggregator";

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
        max_tokens: 24576,
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
      businessTemperature,
      valleyMoneyMap,
      threeMoves,
      quietSignal,
      ownersMove,
      riskRadar,
      thinkingQuestion,
      beforeYouGo,
    } = parseOpusOutput(briefingMarkdown);
    const { issueId, storiesWritten } = await writeBriefing(
      supabase,
      opening,
      stories,
      poolItems,
      {
        businessTemperature,
        valleyMoneyMap,
        threeMoves,
        quietSignal,
        ownersMove,
        riskRadar,
        thinkingQuestion,
        beforeYouGo,
      },
    );

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
    const slug = new Date().toISOString().slice(0, 10);
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ?? "https://nolanareport.com";
    try {
      await fetch(`${baseUrl}/issues/${slug}`, {
        headers: { "x-purpose": "cache-warm" },
      });
    } catch {
      // Non-fatal — page will still build on first visitor click
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
