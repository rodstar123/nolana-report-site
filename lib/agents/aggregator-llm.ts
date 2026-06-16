import type { SupabaseClient } from "@supabase/supabase-js";
import { OPUS_SYSTEM_PROMPT, parseOpusOutput } from "./aggregator";
import { sendTelegram } from "./alerter";

// PRIMARY was claude-fable-5 (set 2026-06-10, commit 3569880).
// Anthropic disabled Fable 5 on 2026-06-12 (export-control directive) — claude-fable-5 now 404s.
// Hotfixed PRIMARY → claude-opus-4-8 on 2026-06-14 (commit 43a922b).
// FALLBACK set to claude-sonnet-4-6 (cross-family) on 2026-06-15.
// WHEN FABLE 5 IS RESTORED: promoting it back to PRIMARY (opus-4-8 as fallback) is a deliberate
// cost/quality call — A/B via the dry-run harness first, do not auto-revert.
// Typed as string (not the literal) so PRIMARY/FALLBACK can be swapped without
// tripping TS's no-overlap check on the identical-model guard below.
export const PRIMARY_MODEL: string = "claude-opus-4-8";
// Cross-family fallback (Sonnet 4.6 — already proven in the translation layer)
// so a true Opus outage has a real failover, not a same-model retry.
export const FALLBACK_MODEL: string = "claude-sonnet-4-6";

// trigger prefix marking a thrown HTTP/transport failure (4xx/5xx, 404
// not_found, model-unavailable) — distinct from a refusal or parse failure.
const API_ERROR_PREFIX = "api error:";

type Parsed = ReturnType<typeof parseOpusOutput>;

export interface AggregatorAttempt {
  model: string;
  ok: boolean;
  /** null when ok; "refusal" or "parse failure: <sections>" otherwise */
  trigger: string | null;
  rawMarkdown: string;
  parsed: Parsed | null;
  usage: { input_tokens?: number; output_tokens?: number } | null;
  stopReason: string | null;
}

// Sections writeBriefing cannot ship without. valleyMoneyMap, ownersMove,
// riskRadar, thinkingQuestion, breathers are nullable downstream.
const REQUIRED_SECTIONS: Array<{ key: keyof Parsed; label: string }> = [
  { key: "headline", label: "headline" },
  { key: "opening", label: "opening" },
  { key: "businessTemperature", label: "business temperature" },
  { key: "threeMoves", label: "three moves" },
  { key: "quietSignal", label: "quiet signal" },
  { key: "beforeYouGo", label: "before you go" },
];

function missingRequiredSections(parsed: Parsed): string[] {
  const missing: string[] = [];
  for (const { key, label } of REQUIRED_SECTIONS) {
    const v = parsed[key];
    if (v === null || (typeof v === "string" && v.trim() === "")) {
      missing.push(label);
    }
  }
  if (parsed.stories.length === 0) missing.push("stories");
  return missing;
}

async function attemptModel(
  model: string,
  userMessage: string,
): Promise<AggregatorAttempt> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
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
      // Prompt caching is supported on claude-fable-5 (2048-token minimum
      // prefix; this system prompt is well past that).
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

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`${model} ${res.status}: ${errText.slice(0, 300)}`);
  }

  const json = (await res.json()) as {
    content?: Array<{ type?: string; text?: string }>;
    usage?: { input_tokens?: number; output_tokens?: number };
    stop_reason?: string;
  };

  if (json.stop_reason === "max_tokens") {
    console.warn(
      `[aggregator] ${model} response truncated (hit max_tokens). Output tokens: ${json.usage?.output_tokens}`,
    );
  }

  if (json.stop_reason === "refusal") {
    return {
      model,
      ok: false,
      trigger: "refusal",
      rawMarkdown: "",
      parsed: null,
      usage: json.usage ?? null,
      stopReason: "refusal",
    };
  }

  const textBlock = (json.content ?? []).find((b) => b.type === "text");
  const rawMarkdown = textBlock?.text ?? "";
  const parsed = parseOpusOutput(rawMarkdown);
  const missing = missingRequiredSections(parsed);

  return {
    model,
    ok: missing.length === 0,
    trigger: missing.length > 0 ? `parse failure: ${missing.join(", ")}` : null,
    rawMarkdown,
    parsed,
    usage: json.usage ?? null,
    stopReason: json.stop_reason ?? null,
  };
}

async function recordDraft(
  supabase: SupabaseClient,
  attempt: AggregatorAttempt,
  outcome: string,
): Promise<void> {
  try {
    await supabase.from("aggregator_drafts").insert({
      model: attempt.model,
      payload: {
        production_run: true,
        outcome,
        trigger: attempt.trigger,
        stop_reason: attempt.stopReason,
        usage: attempt.usage,
        raw_markdown: attempt.rawMarkdown,
      },
    });
  } catch (e) {
    console.warn("[aggregator] draft record failed (non-fatal):", e);
  }
}

/**
 * Wraps attemptModel so a THROWN HTTP error (4xx/5xx, 404 not_found,
 * model-unavailable) becomes an ok:false result instead of an uncaught
 * crash. This routes API failures to the same fallback decision as
 * refusals and parse failures. The thrown class is tagged with
 * API_ERROR_PREFIX so callers can tell it apart.
 */
async function safeAttempt(
  model: string,
  userMessage: string,
): Promise<AggregatorAttempt> {
  try {
    return await attemptModel(model, userMessage);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return {
      model,
      ok: false,
      trigger: `${API_ERROR_PREFIX} ${msg}`,
      rawMarkdown: "",
      parsed: null,
      usage: null,
      stopReason: null,
    };
  }
}

/**
 * Primary call on PRIMARY_MODEL. ANY primary failure routes to the fallback
 * decision — refusal, parse failure, OR a thrown API error
 * (HTTP/404/model-unavailable), which previously escaped and crashed the run.
 *
 * Fallback decision:
 *  - Different FALLBACK_MODEL → retry once on it.
 *  - Identical FALLBACK_MODEL + deterministic API error → skip the redundant
 *    retry (it would 404 the same way) and fail loudly.
 *  - Identical FALLBACK_MODEL + refusal/parse failure → still retry once;
 *    these are non-deterministic and a retry can recover (this is the live
 *    config's existing resilience — do not remove it).
 *
 * Total failure throws a structured error AND fires the supervisor alert so
 * the run never dies silently. Every attempt's raw output lands in
 * aggregator_drafts.
 */
export async function runAggregatorWithFallback(
  userMessage: string,
  supabase: SupabaseClient,
): Promise<{ chosen: AggregatorAttempt; fallbackFired: boolean }> {
  const first = await safeAttempt(PRIMARY_MODEL, userMessage);
  if (first.ok) {
    await recordDraft(supabase, first, "accepted");
    console.log(`[aggregator] primary ok (${PRIMARY_MODEL})`);
    return { chosen: first, fallbackFired: false };
  }

  await recordDraft(supabase, first, `rejected: ${first.trigger}`);

  const firstIsApiError = first.trigger?.startsWith(API_ERROR_PREFIX) ?? false;

  // Identical-model guard: retrying the same model after a deterministic API
  // error (404/model-unavailable) would fail identically. Skip and fail loudly.
  if (FALLBACK_MODEL === PRIMARY_MODEL && firstIsApiError) {
    const errMsg = `Aggregator failed — ${PRIMARY_MODEL}: ${first.trigger}. Fallback model is identical (${FALLBACK_MODEL}); skipped redundant retry.`;
    await sendTelegram(
      `⚠️ Aggregator FAILED — <b>${PRIMARY_MODEL}</b>: ${first.trigger}. Fallback model is identical; no retry possible. Briefing NOT generated.`,
    );
    console.error(
      `[aggregator] FAILED (both) — identical-model skip: ${first.trigger}`,
    );
    throw new Error(errMsg);
  }

  await sendTelegram(
    `⚠️ Aggregator fallback fired — <b>${PRIMARY_MODEL}</b>: ${first.trigger}. Retrying once with ${FALLBACK_MODEL}.`,
  );

  const second = await safeAttempt(FALLBACK_MODEL, userMessage);
  if (second.ok) {
    await recordDraft(supabase, second, "fallback_accepted");
    console.log(`[aggregator] fell back to ${FALLBACK_MODEL}`);
    return { chosen: second, fallbackFired: true };
  }

  // Both failed and the fallback produced nothing usable (refusal, API error,
  // or no parse): structured failure + supervisor alert.
  if (second.trigger === "refusal" || !second.parsed) {
    await recordDraft(supabase, second, `fallback_rejected: ${second.trigger}`);
    const errMsg = `Both models failed — ${PRIMARY_MODEL}: ${first.trigger}; ${FALLBACK_MODEL}: ${second.trigger}`;
    await sendTelegram(
      `⚠️ Aggregator FAILED (both) — <b>${PRIMARY_MODEL}</b>: ${first.trigger}; <b>${FALLBACK_MODEL}</b>: ${second.trigger}. Briefing NOT generated.`,
    );
    console.error(`[aggregator] FAILED (both) — ${errMsg}`);
    throw new Error(errMsg);
  }

  // Fallback parsed but with required gaps: pre-Fable production had no parse
  // gate at all, so shipping its partial output is not a regression.
  await recordDraft(
    supabase,
    second,
    `fallback_partial_used: ${second.trigger}`,
  );
  console.log(`[aggregator] fell back to ${FALLBACK_MODEL} (partial)`);
  await sendTelegram(
    `⚠️ Aggregator fallback partial — <b>${FALLBACK_MODEL}</b> also hit ${second.trigger}; continuing with its output (pre-fallback behavior).`,
  );
  return { chosen: second, fallbackFired: true };
}
