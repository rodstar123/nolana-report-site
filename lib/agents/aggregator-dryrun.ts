import { NextRequest, NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  dedup,
  buildOpusUserMessage,
  OPUS_SYSTEM_PROMPT,
  parseOpusOutput,
} from "@/lib/agents/aggregator";
import { sendTelegram } from "@/lib/agents/alerter";

// Structural mirror of aggregator.ts's (non-exported) RawItemRow — kept here
// so the production module stays untouched. dedup()/buildOpusUserMessage()
// accept it via structural typing.
interface PoolRow {
  id: string;
  url: string;
  url_hash: string;
  agent: string;
  title: string;
  snippet: string | null;
  source_name: string | null;
  category: string | null;
  summary: string | null;
  language: string | null;
  relevance_score: number | null;
  original_date: string | null;
  date_spotted: string | null;
  instant_alerted: boolean | null;
}

const ALLOWED_MODELS = new Set([
  "claude-fable-5",
  "claude-opus-4-8",
  "claude-opus-4-7",
  "claude-sonnet-4-6",
]);

const POOL_SELECT =
  "id,url,url_hash,agent,title,snippet,source_name,category,summary,language,relevance_score,original_date,date_spotted,instant_alerted";

/**
 * Dry-run pool fetch. Two modes:
 * - No window_end: identical filters to the live run (last 7 days,
 *   score >= 50, not yet briefed).
 * - window_end given (replay): same 7-day window ending at that instant,
 *   WITHOUT the included_in_briefing filter — the real run already flipped
 *   those rows to true, so filtering on it would reconstruct a different pool.
 */
async function fetchDryRunPool(
  supabase: SupabaseClient,
  windowEnd: Date | null,
): Promise<PoolRow[]> {
  const end = windowEnd ?? new Date();
  const start = new Date(end.getTime() - 7 * 86_400_000).toISOString();
  let query = supabase
    .from("raw_items")
    .select(POOL_SELECT)
    .gte("date_spotted", start)
    .lte("date_spotted", end.toISOString())
    .gte("relevance_score", 50);
  if (!windowEnd) {
    query = query.eq("included_in_briefing", false);
  }
  const { data, error } = await query
    .order("relevance_score", { ascending: false })
    .limit(100);
  if (error) throw new Error(`raw_items query (dry run): ${error.message}`);
  return (data ?? []) as PoolRow[];
}

/** Sections the live writeBriefing path consumes — used to flag parse gaps. */
const SECTION_KEYS = [
  "opening",
  "headline",
  "businessTemperature",
  "valleyMoneyMap",
  "threeMoves",
  "quietSignal",
  "ownersMove",
  "riskRadar",
  "thinkingQuestion",
  "beforeYouGo",
  "breathers",
] as const;

export async function runAggregatorDryRun(
  req: NextRequest,
  supabase: SupabaseClient,
): Promise<NextResponse> {
  const params = req.nextUrl.searchParams;
  const model = params.get("model") ?? "claude-fable-5";
  if (!ALLOWED_MODELS.has(model)) {
    return NextResponse.json(
      {
        error: `Unknown model. Allowed: ${Array.from(ALLOWED_MODELS).join(", ")}`,
      },
      { status: 400 },
    );
  }

  const windowEndRaw = params.get("window_end");
  let windowEnd: Date | null = null;
  if (windowEndRaw) {
    windowEnd = new Date(windowEndRaw);
    if (isNaN(windowEnd.getTime())) {
      return NextResponse.json(
        { error: "window_end must be an ISO 8601 timestamp" },
        { status: 400 },
      );
    }
  }

  const poolItems = await fetchDryRunPool(supabase, windowEnd);
  if (poolItems.length === 0) {
    return NextResponse.json({
      ok: true,
      dryRun: true,
      message: "No items in pool for this window",
      poolSize: 0,
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

  // Identical call shape to the live run, model swapped in. Compatible with
  // claude-fable-5: adaptive is its only thinking on-mode, effort is
  // supported, and no sampling params are sent (they 400 on Fable/4.7+).
  const llmRes = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": process.env.ANTHROPIC_API_KEY!,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model,
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

  if (!llmRes.ok) {
    const errText = await llmRes.text();
    // Single attempt by design — no retry loop on API errors either.
    return NextResponse.json(
      { error: `${model} ${llmRes.status}: ${errText.slice(0, 300)}` },
      { status: 502 },
    );
  }

  const llmJson = (await llmRes.json()) as {
    content?: Array<{ type?: string; text?: string }>;
    usage?: { input_tokens?: number; output_tokens?: number };
    stop_reason?: string;
    stop_details?: { category?: string | null; explanation?: string };
  };

  const basePayload = {
    window_end: (windowEnd ?? new Date()).toISOString(),
    replay: !!windowEnd,
    pool_size: poolItems.length,
    after_dedup: kept.length,
    dedup_stats: { urlDedupCount, jaccardDedupCount, reroutedCount },
    usage: llmJson.usage ?? null,
    stop_reason: llmJson.stop_reason ?? null,
  };

  // Fable can return stop_reason "refusal" — log it, store the evidence,
  // exit cleanly. Never retried.
  if (llmJson.stop_reason === "refusal") {
    console.warn(
      `[aggregator-dryrun] ${model} refused:`,
      llmJson.stop_details?.explanation ?? "(no explanation)",
    );
    const { data: draft } = await supabase
      .from("aggregator_drafts")
      .insert({
        model,
        payload: {
          ...basePayload,
          refusal: true,
          stop_details: llmJson.stop_details ?? null,
        },
      })
      .select("id")
      .single();
    await sendTelegram(
      `🧪 Aggregator dry run complete — <b>${model}</b> returned stop_reason=refusal. Draft ${draft?.id ?? "(insert failed)"} has details. No production writes.`,
    );
    return NextResponse.json({
      ok: false,
      dryRun: true,
      reason: "refusal",
      draftId: draft?.id ?? null,
    });
  }

  const textBlock = (llmJson.content ?? []).find((b) => b.type === "text");
  const rawMarkdown = textBlock?.text ?? "";

  // Parse with the live parser. A failed section is data, not an error —
  // store the raw text regardless and flag what didn't parse.
  let parsed: ReturnType<typeof parseOpusOutput> | null = null;
  const failedSections: string[] = [];
  try {
    parsed = parseOpusOutput(rawMarkdown);
    for (const key of SECTION_KEYS) {
      const v = parsed[key];
      if (v === null || (typeof v === "string" && v.trim() === "")) {
        failedSections.push(key);
      }
    }
    if (parsed.stories.length === 0) failedSections.push("stories");
  } catch (e) {
    failedSections.push(
      `parse_exception: ${e instanceof Error ? e.message : "unknown"}`,
    );
  }

  const { data: draft, error: insertErr } = await supabase
    .from("aggregator_drafts")
    .insert({
      model,
      payload: {
        ...basePayload,
        raw_markdown: rawMarkdown,
        parsed,
        failed_sections: failedSections,
        stories_parsed: parsed?.stories.length ?? 0,
      },
    })
    .select("id")
    .single();
  if (insertErr) {
    return NextResponse.json(
      { error: `aggregator_drafts insert: ${insertErr.message}` },
      { status: 500 },
    );
  }

  await sendTelegram(
    `🧪 Aggregator dry run complete — <b>${model}</b>\n` +
      `Pool ${poolItems.length} → ${kept.length} after dedup · ${parsed?.stories.length ?? 0} stories parsed\n` +
      `Failed sections: ${failedSections.length ? failedSections.join(", ") : "none"}\n` +
      `Draft ${draft.id} · no production writes`,
  );

  return NextResponse.json({
    ok: true,
    dryRun: true,
    model,
    draftId: draft.id,
    poolSize: poolItems.length,
    afterDedup: kept.length,
    storiesParsed: parsed?.stories.length ?? 0,
    failedSections,
    stopReason: llmJson.stop_reason ?? null,
    tokens:
      (llmJson.usage?.input_tokens ?? 0) + (llmJson.usage?.output_tokens ?? 0),
  });
}
