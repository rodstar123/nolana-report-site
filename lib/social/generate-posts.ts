import type { StorySelection } from "./select-story";

/**
 * Generate ready-to-paste social copy from one story card.
 *
 * NOTHING HERE POSTS ANYWHERE. The output is text destined for a Telegram
 * message that Noe reads and pastes by hand. `platform` is a style label, not
 * a destination — there is no social-platform API, SDK or credential in this
 * module, and none should ever be added to it.
 *
 * Output is taken through a TOOL CALL, never JSON.parse of a text block. Asking
 * for "only valid JSON" in prose does not survive contact with real copy: the
 * translator's 2026-07-27 validation produced unescaped straight quotes inside
 * a string value, invalid at char 916, with stop_reason=end_turn — the model
 * had finished cleanly and only the FORMAT was wrong. A tool schema makes
 * well-formed JSON the API's problem instead of a regex's.
 */

export const MODEL = "claude-sonnet-4-6";
export const MAX_TOKENS = 2000;

export type Platform = "facebook" | "linkedin" | "reddit" | "x";
export type Lang = "en" | "es";

interface PostSpec {
  platform: Platform;
  lang: Lang;
  /** Section header used in the Telegram message, in display order. */
  label: string;
  unit: "words" | "chars";
  min: number;
  max: number;
  brief: string;
}

/**
 * Declared in the order the Telegram message prints them. The ES entries are
 * dropped wholesale when the card has no Spanish of its own.
 */
export const POST_SPECS: PostSpec[] = [
  {
    platform: "facebook",
    lang: "en",
    label: "FACEBOOK (EN)",
    unit: "words",
    min: 60,
    max: 120,
    brief:
      "60-120 words. Written for an RGV business-owner group. Lead with the concrete fact, one sentence on why it matters to a local owner, end with the link line. No hashtags.",
  },
  {
    platform: "facebook",
    lang: "es",
    label: "FACEBOOK (ES)",
    unit: "words",
    min: 60,
    max: 120,
    brief:
      "60-120 words. Same brief as the English Facebook post, in natural RGV Spanish. This is NOT a translation of the English post — write it fresh from the Spanish card fields. No code-switching: do not mix English words into the Spanish sentences beyond proper nouns and the glossary terms. No hashtags.",
  },
  {
    platform: "linkedin",
    lang: "en",
    label: "LINKEDIN",
    unit: "words",
    min: 80,
    max: 150,
    brief:
      "80-150 words. Slightly more analytical than the Facebook post. One line break between ideas. Max 3 hashtags at the end.",
  },
  {
    platform: "reddit",
    lang: "en",
    label: "REDDIT r/RGV",
    unit: "words",
    min: 50,
    max: 100,
    brief:
      "50-100 words, plain and non-promotional, for r/RGV. Cite the original source by name. The link line goes last and is phrased exactly as: I write a weekly roundup on this if useful: {link}",
  },
  {
    platform: "x",
    lang: "en",
    label: "X (EN)",
    unit: "chars",
    min: 0,
    max: 260,
    brief: "260 characters or fewer, including the link.",
  },
  {
    platform: "x",
    lang: "es",
    label: "X (ES)",
    unit: "chars",
    min: 0,
    max: 260,
    brief:
      "260 characters or fewer, including the link. Natural RGV Spanish written fresh from the Spanish card fields, not a translation of the English post.",
  },
];

const SYSTEM_PROMPT = `You are the social editor for The Nolana Report, a weekly business intelligence briefing for the Rio Grande Valley. You write short posts that get a Valley business owner to open one specific story.

You will be given ONE story card from this week's issue and a list of posts to write. Write only the posts asked for.

RULES — these are absolute:
Every post must state at least one specific fact from the card (name, place, number). No generic "big changes coming to the Valley" copy.
Do not restate the card title as the first line.
Never fabricate a fact, quote, or number not present in the card.
The link line uses the exact URL passed in; never alter it.
Output only JSON: { "posts": [ { "platform": "", "lang": "", "body": "" }, ... ] }.

That JSON is returned by calling the emit_posts tool. Do not write it into a text reply.

VOICE:
- Direct, concrete, Morning Brew register. Never corporate, never breathless.
- No emoji unless the platform brief asks for one. It does not.
- Do not open with "Big news" or any variant of "you won't believe".
- Spanish posts address the reader as TÚ, never usted. No formal imperatives — "Checa", "Mira", "Agrega", never "Cheque", "Mire", "Agregue".
- These terms stay in English in Spanish copy: payroll, bookkeeping, LLC, NRI, Money Map, Valley Money Map, Nolana Take, permit, bid, grants, capability statement, freight brokers, customs broker, retail, wholesale, warehouse, startups, franchise.
- Brand nouns (The Nolana Report, Money Map, Nolana Take, NRI) are never translated and never inflected.
- Keep dollar amounts, dates, company names and program names exactly as the card has them.

LENGTH IS A HARD CONSTRAINT. Count before you answer. A post outside its stated range is a failed post.

The body you return is pasted verbatim by a human. Include the link line inside the body. Do not add commentary, labels, or platform names to the body.`;

/**
 * GENERIC AND IDENTICAL ON EVERY CALL, including retries.
 *
 * Anthropic caches the prompt prefix in the order tools -> system -> messages.
 * A per-call tool schema would change the very first cached block and miss the
 * cache on every request. Everything that varies between calls — which posts to
 * write, the card, the links — lives in the user message instead.
 */
const EMIT_TOOL = {
  name: "emit_posts",
  description:
    "Return the finished social posts. One object per requested platform/lang pair, with the body exactly as it should be pasted.",
  input_schema: {
    type: "object" as const,
    properties: {
      posts: {
        type: "array" as const,
        items: {
          type: "object" as const,
          properties: {
            platform: { type: "string" as const },
            lang: { type: "string" as const },
            body: { type: "string" as const },
          },
          required: ["platform", "lang", "body"],
        },
      },
    },
    required: ["posts"],
  },
};

export interface GeneratedPost {
  platform: Platform;
  lang: Lang;
  label: string;
  body: string;
  link: string;
  words: number;
  chars: number;
  limitLabel: string;
  withinLimit: boolean;
  attempts: number;
}

export interface GenerationResult {
  posts: GeneratedPost[];
  model: string;
  /** Posts still outside their limit after the one permitted retry. */
  violations: string[];
  /** Requested but never returned by the model. */
  missing: string[];
  inputTokens: number;
  outputTokens: number;
  calls: number;
}

const key = (p: Platform, l: Lang) => `${p}:${l}`;

/** Whitespace-separated tokens. The URL counts as one word, as a reader sees it. */
export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function buildLink(
  issueUrl: string,
  platform: Platform,
  slug: string,
): string {
  return `${issueUrl}?utm_source=${platform}&utm_medium=social&utm_campaign=monday-${slug}`;
}

function limitLabel(spec: PostSpec): string {
  return spec.unit === "chars"
    ? `<= ${spec.max} chars`
    : `${spec.min}-${spec.max} words`;
}

function measure(spec: PostSpec, body: string) {
  const words = countWords(body);
  const chars = body.length;
  const withinLimit =
    spec.unit === "chars"
      ? chars <= spec.max
      : words >= spec.min && words <= spec.max;
  return { words, chars, withinLimit };
}

/** Hashtag count, reported for LinkedIn. Not a retry trigger — length is. */
export function countHashtags(body: string): number {
  return (body.match(/(?:^|\s)#[^\s#]+/g) ?? []).length;
}

function cardFields(sel: StorySelection, lang: Lang): Record<string, string> {
  const s = sel.story;
  const pick = (en: string | null, es: string | null): string | null =>
    lang === "es" && es && es.trim() ? es : en;

  const out: Record<string, string> = {};
  const add = (k: string, v: string | null | undefined) => {
    if (v && v.trim()) out[k] = v.trim();
  };

  add("headline", pick(s.headline, s.headline_es));
  add("summary", pick(s.summary, s.summary_es));
  add("why_it_matters", pick(s.why_it_matters, s.why_it_matters_es));
  add("smart_move", pick(s.smart_move, s.smart_move_es));
  add("source_name", s.source_name);
  add("source_url", s.source_url);
  return out;
}

function buildUserMessage(
  sel: StorySelection,
  specs: PostSpec[],
  links: Map<string, string>,
  retryNote?: string,
): string {
  const byLang = new Map<Lang, Record<string, string>>();
  for (const spec of specs) {
    if (!byLang.has(spec.lang))
      byLang.set(spec.lang, cardFields(sel, spec.lang));
  }

  const cardBlocks = Array.from(byLang.entries())
    .map(
      ([lang, fields]) =>
        `STORY CARD (${lang.toUpperCase()}):\n${JSON.stringify(fields, null, 2)}`,
    )
    .join("\n\n");

  const requests = specs
    .map((spec) => {
      const link = links.get(key(spec.platform, spec.lang)) ?? "";
      return (
        `- platform: "${spec.platform}", lang: "${spec.lang}"\n` +
        `  constraints: ${spec.brief}\n` +
        `  limit: ${limitLabel(spec)}\n` +
        `  link (use exactly, do not alter): ${link}`
      );
    })
    .join("\n");

  return (
    `${cardBlocks}\n\n` +
    `The summary field is the story's single fact. Do not treat any other field as a second, independent fact.\n\n` +
    `WRITE THESE POSTS:\n${requests}\n\n` +
    (retryNote ? `${retryNote}\n\n` : "") +
    `Return every post above via the emit_posts tool, with platform and lang echoed exactly as given.`
  );
}

interface ApiResult {
  posts: Array<{ platform?: string; lang?: string; body?: string }>;
  inputTokens: number;
  outputTokens: number;
}

async function callModel(
  apiKey: string,
  userMessage: string,
): Promise<ApiResult> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      // Array form with cache_control so the identical prefix is cached across
      // the main call and any retries instead of being re-billed each time.
      system: [
        {
          type: "text",
          text: SYSTEM_PROMPT,
          cache_control: { type: "ephemeral" },
        },
      ],
      tools: [EMIT_TOOL],
      tool_choice: { type: "tool", name: EMIT_TOOL.name },
      messages: [{ role: "user", content: userMessage }],
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Anthropic ${res.status}: ${body.slice(0, 300)}`);
  }

  const json = (await res.json()) as {
    content?: Array<{
      type?: string;
      text?: string;
      name?: string;
      input?: Record<string, unknown>;
    }>;
    usage?: { input_tokens?: number; output_tokens?: number };
    stop_reason?: string;
  };

  const toolBlock = (json.content ?? []).find(
    (b) => b.type === "tool_use" && b.name === EMIT_TOOL.name,
  );
  const raw = toolBlock?.input?.posts;

  if (!Array.isArray(raw)) {
    const textBlock =
      (json.content ?? []).find((b) => b.type === "text")?.text ?? "";
    // stop_reason names the failure: "max_tokens" is a truncation (raise
    // MAX_TOKENS), anything else is the model declining to call the tool.
    throw new Error(
      `emit_posts not returned — stop_reason=${json.stop_reason ?? "unknown"} ` +
        `tool_block=${toolBlock ? "yes" : "no"} ` +
        `input_keys=[${toolBlock?.input ? Object.keys(toolBlock.input).join(",") : ""}] :: ${textBlock.slice(0, 300)}`,
    );
  }

  return {
    posts: raw as ApiResult["posts"],
    inputTokens: json.usage?.input_tokens ?? 0,
    outputTokens: json.usage?.output_tokens ?? 0,
  };
}

/**
 * One call for the whole set, then at most ONE retry per post that came back
 * outside its limit. A post that is still over after its retry is returned
 * anyway and flagged in the Telegram message — Noe can trim four words faster
 * than a failed run can be re-triggered.
 */
export async function generatePosts(
  sel: StorySelection,
): Promise<GenerationResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not set");

  const specs = POST_SPECS.filter(
    (s) => s.lang === "en" || sel.spanishAvailable,
  );

  const links = new Map<string, string>();
  for (const spec of specs) {
    const base = spec.lang === "es" ? sel.esUrl : sel.enUrl;
    links.set(
      key(spec.platform, spec.lang),
      buildLink(base, spec.platform, sel.issue.slug),
    );
  }

  let inputTokens = 0;
  let outputTokens = 0;
  let calls = 0;

  const first = await callModel(apiKey, buildUserMessage(sel, specs, links));
  calls++;
  inputTokens += first.inputTokens;
  outputTokens += first.outputTokens;

  const bodies = new Map<string, string>();
  for (const p of first.posts) {
    if (!p.platform || !p.lang || typeof p.body !== "string") continue;
    bodies.set(key(p.platform as Platform, p.lang as Lang), p.body.trim());
  }

  const posts: GeneratedPost[] = [];
  const missing: string[] = [];
  const violations: string[] = [];

  for (const spec of specs) {
    const k = key(spec.platform, spec.lang);
    let body = bodies.get(k);
    let attempts = 1;

    if (!body) {
      missing.push(`${spec.platform}/${spec.lang}`);
      continue;
    }

    let m = measure(spec, body);

    if (!m.withinLimit) {
      const was =
        spec.unit === "chars" ? `${m.chars} chars` : `${m.words} words`;
      const note =
        `RETRY: your previous ${spec.platform} (${spec.lang}) post was ${was}, ` +
        `outside the required ${limitLabel(spec)}. Rewrite ONLY that post so it fits. ` +
        `Keep the same specific fact and the same link line.`;
      try {
        const retry = await callModel(
          apiKey,
          buildUserMessage(sel, [spec], links, note),
        );
        calls++;
        inputTokens += retry.inputTokens;
        outputTokens += retry.outputTokens;
        attempts = 2;

        const retried = retry.posts.find(
          (p) => p.platform === spec.platform && p.lang === spec.lang,
        );
        if (retried?.body) {
          const retriedBody = retried.body.trim();
          const rm = measure(spec, retriedBody);
          // Keep the retry only if it is an improvement; a worse second draft
          // should not replace a near-miss first one.
          if (rm.withinLimit || !m.withinLimit) {
            body = retriedBody;
            m = rm;
          }
        }
      } catch (err) {
        console.error(
          `[social/generate] retry failed for ${k}:`,
          err instanceof Error ? err.message : String(err),
        );
      }

      if (!m.withinLimit) {
        const now =
          spec.unit === "chars" ? `${m.chars} chars` : `${m.words} words`;
        violations.push(
          `${spec.platform}/${spec.lang}: ${now} (limit ${limitLabel(spec)})`,
        );
      }
    }

    posts.push({
      platform: spec.platform,
      lang: spec.lang,
      label: spec.label,
      body,
      link: links.get(k) ?? "",
      words: m.words,
      chars: m.chars,
      limitLabel: limitLabel(spec),
      withinLimit: m.withinLimit,
      attempts,
    });
  }

  return {
    posts,
    model: MODEL,
    violations,
    missing,
    inputTokens,
    outputTokens,
    calls,
  };
}
