import { createHash, randomUUID } from "node:crypto";

/**
 * Chunked Spanish translation.
 *
 * The single-call translator was killed by the 300s function ceiling on any
 * issue past ~34k source chars — confirmed 2026-09-12, when 2026-07-27 (38,147
 * chars) returned FUNCTION_INVOCATION_TIMEOUT at 300.31s. Four issues lost
 * their Spanish edition that way.
 *
 * The work is the same; only the shape changes. One call per story card plus
 * one call for the chrome, run concurrently, so ~300s of serial generation
 * becomes ~35-55s of wall clock.
 *
 * Three properties matter more than the speed:
 *
 *  - ATOMIC. Chunks land in `translation_chunks`, never in the live *_es
 *    columns. Only when every chunk for the issue has succeeded does
 *    publish_translation() copy them across in a single transaction. A partial
 *    failure leaves the issue exactly as it was — no Spanish, no half-state.
 *  - RESUMABLE. Chunk rows persist, so a retry re-runs only what failed. The
 *    300s of Sonnet output discarded by the old timeout would have been kept.
 *  - CONSISTENT. Every chunk carries a byte-identical system prompt containing
 *    the glossary and the tú rule, so per-story chunks cannot drift on brand
 *    terms. Identical prefixes are also what makes prompt caching work.
 */

/** Per-chunk output ceilings. Small on purpose: a genuine truncation then costs
 *  one cheap failed chunk with stop_reason="max_tokens" instead of poisoning a
 *  whole run, and it is visible rather than inferred. */
const MAX_TOKENS_STORY = 4000;
const MAX_TOKENS_CHROME = 8000;

/** 10 concurrent calls: 3 waves for a 28-story issue, and a modest ask of the
 *  API for a job that runs once a week. */
export const DEFAULT_CONCURRENCY = 10;

/** Chrome is near-constant at ~6.6-7.6k chars regardless of story count, and it
 *  is the long pole of the run. Past this it should be split into narrative and
 *  structured halves (Noe's ruling 2026-09-12: not now, but this is the
 *  trigger). Crossing it is a warning, never a failure. */
export const CHROME_SPLIT_TRIGGER_CHARS = 8000;

const ISSUE_FIELDS = [
  "title",
  "headline",
  "opening",
  "owners_move",
  "risk_radar",
  "thinking_question",
  "before_you_go",
  "business_temperature",
  "valley_money_map",
  "three_moves",
  "quiet_signal",
] as const;

const STORY_FIELDS = [
  "headline",
  "signal",
  "why_it_matters",
  "smart_move",
  "nolana_take",
  "summary",
] as const;

/**
 * Shared, byte-identical across every chunk — both so the voice cannot drift
 * between story cards and so the cached prefix actually hits.
 *
 * Deliberately a separate copy from the legacy route's prompt rather than a
 * shared import: the legacy path stays reachable as a one-Monday rollback and
 * must not shift under it.
 */
const SYSTEM_PROMPT = `You are the Spanish voice of The Nolana Report, a weekly business intelligence briefing for the Rio Grande Valley.

Your job: rewrite the English fragment you are given in natural RGV Spanish. This is NOT a literal translation. You are producing the Spanish EDITION — as if a sharp, bilingual Valley business writer wrote it from scratch.

Voice rules:
- Natural RGV Spanish — the way Valley business owners talk. Not textbook Castilian. Not Mexico City formal.
- "Negocio" over "empresa" for small businesses. "Checar" is fine. "Platicar" over "conversar."
- Tone: direct, personal, Morning Brew style. Not corporate. Not academic.
- Headlines punch. Short. Active verbs.
- Adapt, don't translate. If a phrase doesn't land in Spanish, rewrite it so it does.
- Wordplay and puns must be adapted to natural Spanish carrying the same meaning — never word-for-word. If no natural adaptation exists, write a plain heading instead.

REGISTER — non-negotiable: address the reader as TÚ throughout. Never usted. No formal imperatives (use "Agrega", "Checa", "Mira" — never "Agregue", "Cheque", "Mire"). Possessive is "tu"/"tus", never "su"/"sus" for the reader.

GLOSSARY — these stay exactly as written, in English:
payroll, bookkeeping, LLC, SmartBook, NRI, NRI score, Money Map, Valley Money Map, Nolana Take, strip mall, franchise, drive-thru, retail, wholesale, bid, permit, zoning, freight brokers, customs broker, capability statement, grants, import/export brokers, warehouse, child care, startups, tech, IT, event planners.
Brand nouns (The Nolana Report, SmartBook, Money Map, Nolana Take, NRI) are never translated and never inflected.

Keep dollar amounts, dates, entity names, company names and program names exactly as they appear. Preserve markdown formatting, including **bold** and table pipes.

Return the result by calling the emit_translation tool, with the source's own keys preserved exactly.`;

/**
 * Output is taken through a tool call, not parsed out of a text reply.
 *
 * Asking for "only valid JSON" in prose does not survive contact with real
 * copy: validation on 2026-07-27 produced
 *   "nolana_take":"...salir a decir "quédense tranquilos", lo mejor es..."
 * — unescaped straight quotes inside a string value, invalid at char 916, with
 * stop_reason=end_turn. The model had finished cleanly; the format was just
 * wrong. A tool schema makes well-formed JSON the API's problem instead of a
 * regex's.
 *
 * The schema is deliberately GENERIC — an open object rather than the specific
 * keys of each chunk. Anthropic caches the prompt prefix in the order
 * tools → system → messages, so a per-chunk tool schema would change the very
 * first cached block and miss the cache on all ~29 calls. Keeping tools and
 * system byte-identical, and putting the per-chunk key list in the user
 * message, is what lets the cache actually hit.
 */
const EMIT_TOOL = {
  name: "emit_translation",
  description:
    "Return the Spanish translation as an object keyed exactly like the source. Strings stay strings; arrays stay arrays of the same length and shape.",
  input_schema: {
    type: "object" as const,
    // No wrapper key and no `required`: the model returns the source's own keys
    // directly. An earlier version nested them under `fields`, which the model
    // ignored — it called the tool correctly (stop_reason=tool_use) but put the
    // keys at the top level, so the extractor found nothing. Matching what it
    // actually does beats insisting on a wrapper it has no reason to honour.
    additionalProperties: true,
  },
};

export interface ChunkSpec {
  chunkKey: string;
  chunkKind: "chrome" | "story";
  storyId: string | null;
  /** English fields for this chunk. */
  source: Record<string, unknown>;
  sourceChars: number;
  sourceHash: string;
  maxTokens: number;
}

export interface ChunkOutcome {
  chunkKey: string;
  status: "ok" | "failed";
  durationMs: number;
  outputTokens: number;
  errorClass?: string;
  message?: string;
}

export interface ChunkedRunResult {
  ok: boolean;
  runId: string;
  slug: string;
  durationMs: number;
  totalChunks: number;
  ranChunks: number;
  skippedChunks: number;
  failed: ChunkOutcome[];
  outcomes: ChunkOutcome[];
  published: boolean;
  storiesUpdated: number;
  chromeChars: number;
  chromeSplitAdvised: boolean;
  error?: string;
}

const hasContent = (v: unknown): boolean => {
  if (v == null) return false;
  if (typeof v === "string") return v.trim().length > 0;
  if (Array.isArray(v)) return v.length > 0;
  return true;
};

const hash = (v: unknown): string =>
  createHash("sha256").update(JSON.stringify(v)).digest("hex").slice(0, 32);

/** Build the full chunk set for an issue. */
export function planChunks(
  issue: Record<string, unknown>,
  stories: Array<Record<string, unknown>>,
): ChunkSpec[] {
  const specs: ChunkSpec[] = [];

  const chromeSource: Record<string, unknown> = {};
  for (const key of ISSUE_FIELDS) {
    if (hasContent(issue[key])) chromeSource[key] = issue[key];
  }
  if (hasContent(issue.breathers)) chromeSource.breathers = issue.breathers;

  const chromeJson = JSON.stringify(chromeSource);
  specs.push({
    chunkKey: "chrome",
    chunkKind: "chrome",
    storyId: null,
    source: chromeSource,
    sourceChars: chromeJson.length,
    sourceHash: hash(chromeSource),
    maxTokens: MAX_TOKENS_CHROME,
  });

  for (const s of stories) {
    const id = String(s.id);
    const source: Record<string, unknown> = {};
    for (const key of STORY_FIELDS) {
      if (hasContent(s[key])) source[key] = s[key];
    }
    if (hasContent(s.who_should_act)) source.who_should_act = s.who_should_act;
    // A story with nothing translatable still gets a chunk, so the completeness
    // check in publish_translation() stays a simple count against stories.
    specs.push({
      chunkKey: `story:${id}`,
      chunkKind: "story",
      storyId: id,
      source,
      sourceChars: JSON.stringify(source).length,
      sourceHash: hash(source),
      maxTokens: MAX_TOKENS_STORY,
    });
  }

  return specs;
}

/** Translate one chunk. Never throws — a failure is a value, so one bad chunk
 *  cannot abort the pool and discard its siblings' work. */
async function translateChunk(
  spec: ChunkSpec,
  apiKey: string,
): Promise<{ outcome: ChunkOutcome; payload: Record<string, unknown> | null }> {
  const started = Date.now();
  const shape = `an object with exactly these keys: ${Object.keys(spec.source).join(", ")}`;

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: spec.maxTokens,
        // Array form with cache_control so the identical prefix is cached
        // across the ~29 calls in a run instead of being re-billed each time.
        system: [
          {
            type: "text",
            text: SYSTEM_PROMPT,
            cache_control: { type: "ephemeral" },
          },
        ],
        tools: [EMIT_TOOL],
        tool_choice: { type: "tool", name: EMIT_TOOL.name },
        messages: [
          {
            role: "user",
            content:
              `Translate every value below into RGV Spanish and return ${shape} ` +
              `inside "fields". Preserve every key exactly.\n\n` +
              JSON.stringify(spec.source, null, 2),
          },
        ],
      }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      return {
        outcome: {
          chunkKey: spec.chunkKey,
          status: "failed",
          durationMs: Date.now() - started,
          outputTokens: 0,
          errorClass: "anthropic_http",
          message: `Anthropic ${res.status}: ${body.slice(0, 200)}`,
        },
        payload: null,
      };
    }

    const json = (await res.json()) as {
      content?: Array<{
        type?: string;
        text?: string;
        name?: string;
        input?: { fields?: Record<string, unknown> };
      }>;
      usage?: { output_tokens?: number };
      stop_reason?: string;
    };
    const outputTokens = json.usage?.output_tokens ?? 0;

    const toolBlock = (json.content ?? []).find(
      (b) => b.type === "tool_use" && b.name === EMIT_TOOL.name,
    );
    const input = toolBlock?.input;
    // Accept either shape: the keys directly on `input` (what the model does),
    // or nested under `fields` if it ever wraps them.
    const fields =
      input && typeof input.fields === "object" && input.fields !== null
        ? (input.fields as Record<string, unknown>)
        : (input as Record<string, unknown> | undefined);

    // The only remaining failure here is the model declining to call the tool
    // at all, or truncating mid-call. stop_reason names which — "max_tokens"
    // is a truncation and means the per-chunk ceiling was too low for this
    // card, which is a different fix from a refusal.
    if (
      !fields ||
      typeof fields !== "object" ||
      Object.keys(fields).length === 0
    ) {
      const textBlock =
        (json.content ?? []).find((b) => b.type === "text")?.text ?? "";
      return {
        outcome: {
          chunkKey: spec.chunkKey,
          status: "failed",
          durationMs: Date.now() - started,
          outputTokens,
          errorClass: "parse_failed",
          message:
            `stop_reason=${json.stop_reason ?? "unknown"} ` +
            `tool_block=${toolBlock ? "yes" : "no"} ` +
            `input_keys=[${input ? Object.keys(input).join(",") : ""}] :: ${textBlock.slice(0, 300)}`,
        },
        payload: null,
      };
    }

    return {
      outcome: {
        chunkKey: spec.chunkKey,
        status: "ok",
        durationMs: Date.now() - started,
        outputTokens,
      },
      payload: fields,
    };
  } catch (err) {
    return {
      outcome: {
        chunkKey: spec.chunkKey,
        status: "failed",
        durationMs: Date.now() - started,
        outputTokens: 0,
        errorClass: "exception",
        message: err instanceof Error ? err.message : "unknown error",
      },
      payload: null,
    };
  }
}

/** Fixed-size worker pool. Keeps concurrency flat rather than firing all ~29
 *  requests at once. */
async function pool<T>(
  items: T[],
  limit: number,
  worker: (item: T) => Promise<void>,
): Promise<void> {
  let next = 0;
  const runners = Array.from(
    { length: Math.min(limit, items.length) },
    async () => {
      for (;;) {
        const i = next++;
        if (i >= items.length) return;
        await worker(items[i]);
      }
    },
  );
  await Promise.all(runners);
}

export async function runChunkedTranslation(opts: {
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  supabase: any;
  slug: string;
  concurrency?: number;
  /** Test hook: force these chunk keys to fail without calling the API, to
   *  prove the partial-failure path leaves the issue untouched. */
  forceFailKeys?: string[];
}): Promise<ChunkedRunResult> {
  const { supabase, slug } = opts;
  const concurrency = opts.concurrency ?? DEFAULT_CONCURRENCY;
  const forceFail = new Set(opts.forceFailKeys ?? []);
  const runId = randomUUID();
  const started = Date.now();

  const { data: issue } = await supabase
    .from("issues")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!issue) {
    return {
      ok: false,
      runId,
      slug,
      durationMs: Date.now() - started,
      totalChunks: 0,
      ranChunks: 0,
      skippedChunks: 0,
      failed: [],
      outcomes: [],
      published: false,
      storiesUpdated: 0,
      chromeChars: 0,
      chromeSplitAdvised: false,
      error: `Issue not found for slug ${slug}`,
    };
  }

  const { data: stories } = await supabase
    .from("stories")
    .select("*")
    .eq("issue_id", issue.id)
    .order("position", { ascending: true });

  const specs = planChunks(issue, stories ?? []);
  const chromeChars =
    specs.find((s) => s.chunkKind === "chrome")?.sourceChars ?? 0;

  // Resume: a chunk already ok for the SAME source hash is not re-run. A hash
  // mismatch means the English changed underneath, so it is re-translated
  // rather than published stale.
  const { data: existing } = await supabase
    .from("translation_chunks")
    .select("chunk_key, status, source_hash")
    .eq("issue_id", issue.id);

  const done = new Map<string, string>();
  for (const row of existing ?? []) {
    if (row.status === "ok" && row.source_hash)
      done.set(row.chunk_key, row.source_hash);
  }

  const toRun = specs.filter((s) => done.get(s.chunkKey) !== s.sourceHash);
  const outcomes: ChunkOutcome[] = [];
  const apiKey = process.env.ANTHROPIC_API_KEY ?? "";

  await pool(toRun, concurrency, async (spec) => {
    const forced = forceFail.has(spec.chunkKey);
    const { outcome, payload } = forced
      ? {
          outcome: {
            chunkKey: spec.chunkKey,
            status: "failed" as const,
            durationMs: 0,
            outputTokens: 0,
            errorClass: "forced_failure",
            message: "deliberate failure injected for validation",
          },
          payload: null,
        }
      : await translateChunk(spec, apiKey);

    outcomes.push(outcome);

    await supabase.from("translation_chunks").upsert(
      {
        issue_id: issue.id,
        chunk_key: spec.chunkKey,
        chunk_kind: spec.chunkKind,
        story_id: spec.storyId,
        run_id: runId,
        status: outcome.status,
        payload: payload,
        error:
          outcome.status === "failed"
            ? { error_class: outcome.errorClass, message: outcome.message }
            : null,
        source_hash: spec.sourceHash,
        source_chars: spec.sourceChars,
        output_tokens: outcome.outputTokens,
        duration_ms: outcome.durationMs,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "issue_id,chunk_key" },
    );
  });

  const failed = outcomes.filter((o) => o.status === "failed");

  // Publish only when the WHOLE set is good. The RPC repeats this check inside
  // its transaction, so this is a fast path, not the guarantee.
  let published = false;
  let storiesUpdated = 0;
  let publishError: string | undefined;

  if (failed.length === 0) {
    const { data: updated, error } = await supabase.rpc("publish_translation", {
      p_issue_id: issue.id,
    });
    if (error) {
      publishError = error.message;
    } else {
      published = true;
      storiesUpdated = typeof updated === "number" ? updated : 0;
    }
  }

  return {
    ok: failed.length === 0 && published,
    runId,
    slug,
    durationMs: Date.now() - started,
    totalChunks: specs.length,
    ranChunks: toRun.length,
    skippedChunks: specs.length - toRun.length,
    failed,
    outcomes,
    published,
    storiesUpdated,
    chromeChars,
    chromeSplitAdvised: chromeChars > CHROME_SPLIT_TRIGGER_CHARS,
    error: publishError,
  };
}
