import type { SupabaseClient } from "@supabase/supabase-js";
import { OPUS_SYSTEM_PROMPT, parseOpusOutput } from "./aggregator";
import { sendTelegram } from "./alerter";

export const PRIMARY_MODEL = "claude-fable-5";
export const FALLBACK_MODEL = "claude-opus-4-8";

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
 * Primary call on PRIMARY_MODEL. If it refuses or fails a required-section
 * parse, retry exactly once on FALLBACK_MODEL and continue with whichever
 * succeeded. Every attempt's raw output lands in aggregator_drafts.
 */
export async function runAggregatorWithFallback(
  userMessage: string,
  supabase: SupabaseClient,
): Promise<{ chosen: AggregatorAttempt; fallbackFired: boolean }> {
  const first = await attemptModel(PRIMARY_MODEL, userMessage);
  if (first.ok) {
    await recordDraft(supabase, first, "accepted");
    return { chosen: first, fallbackFired: false };
  }

  await recordDraft(supabase, first, `rejected: ${first.trigger}`);
  await sendTelegram(
    `⚠️ Aggregator fallback fired — <b>${PRIMARY_MODEL}</b>: ${first.trigger}. Retrying once with ${FALLBACK_MODEL}.`,
  );

  const second = await attemptModel(FALLBACK_MODEL, userMessage);
  if (second.ok) {
    await recordDraft(supabase, second, "fallback_accepted");
    return { chosen: second, fallbackFired: true };
  }

  if (second.trigger === "refusal" || !second.parsed) {
    await recordDraft(supabase, second, `fallback_rejected: ${second.trigger}`);
    throw new Error(
      `Both models failed — ${PRIMARY_MODEL}: ${first.trigger}; ${FALLBACK_MODEL}: ${second.trigger}`,
    );
  }

  // Opus parsed but with required gaps: pre-Fable production had no parse
  // gate at all, so shipping its partial output is not a regression.
  await recordDraft(
    supabase,
    second,
    `fallback_partial_used: ${second.trigger}`,
  );
  await sendTelegram(
    `⚠️ Aggregator fallback partial — <b>${FALLBACK_MODEL}</b> also hit ${second.trigger}; continuing with its output (pre-fallback behavior).`,
  );
  return { chosen: second, fallbackFired: true };
}
