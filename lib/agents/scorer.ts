import type { ScoredItem } from "./types";

const RETRYABLE = new Set([429, 529]);

async function callHaiku(
  prompt: string,
  timeoutMs = 30_000,
): Promise<{ data: Record<string, unknown> | null; error: string | null }> {
  for (let attempt = 0; attempt < 2; attempt++) {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": process.env.ANTHROPIC_API_KEY!,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 256,
          messages: [{ role: "user", content: prompt }],
        }),
        signal: ctrl.signal,
      });
      clearTimeout(t);
      if (res.ok)
        return {
          data: (await res.json()) as Record<string, unknown>,
          error: null,
        };
      if (RETRYABLE.has(res.status) && attempt === 0) {
        await new Promise((r) => setTimeout(r, 15_000));
        continue;
      }
      return {
        data: null,
        error: `Anthropic ${res.status}: ${(await res.text()).slice(0, 300)}`,
      };
    } catch (e) {
      clearTimeout(t);
      if (attempt === 0) {
        await new Promise((r) => setTimeout(r, 15_000));
        continue;
      }
      return { data: null, error: e instanceof Error ? e.message : String(e) };
    }
  }
  return { data: null, error: "exhausted retries" };
}

function parseScore(json: Record<string, unknown>): ScoredItem {
  const content = json.content as Array<{ text?: string }> | undefined;
  const usage = json.usage as
    | { input_tokens?: number; output_tokens?: number }
    | undefined;
  const raw = (content?.[0]?.text ?? "{}")
    .replace(/^```json\s*/i, "")
    .replace(/```\s*$/, "")
    .trim();
  let p = { score: 0, category: "Other", summary: "", language: "EN" };
  try {
    p = JSON.parse(raw);
  } catch {
    p.summary = "Parse error: " + raw.slice(0, 200);
  }
  return {
    score: Math.max(0, Math.min(100, parseInt(String(p.score), 10) || 0)),
    category: p.category || "Other",
    summary: p.summary || "",
    language: (p.language === "ES" ? "ES" : "EN") as "EN" | "ES",
    tokens: (usage?.input_tokens ?? 0) + (usage?.output_tokens ?? 0),
  };
}

export function buildScoringPrompt(
  title: string,
  contentSection: string,
  source: string,
  originalDate: string,
): string {
  return `You are filtering news and social posts for RGV business intelligence.

Score each item 0-100 on relevance to an RGV (McAllen / Edinburg / Pharr / Mission / Weslaco / Brownsville / Harlingen) small-business owner.

Scoring guide:
  95-100 — Direct, immediate impact: new local grant program announced; city council kills/passes a business ordinance; tariff change affecting border trade; major employer opens or closes in RGV.
  70-94  — Clearly relevant: new business opens in named RGV city; permit filed; commercial lease signed; economic development announcement; bridge wait anomaly; FX move ≥1.5%.
  40-69  — Adjacent: Texas-wide policy with likely RGV effect; regional industry trend; large business networking event in RGV.
  10-39  — Tangential: opinion piece mentioning RGV; national story with thin local angle.
  0-9    — Irrelevant: sports, crime without business angle, real estate listings, national news without local hook.

Categories (USE EXACTLY ONE):
  New Open · Closing · Permit · City Council · Grant · Zoning · Tariff · Bridge · FX · Buzz · Event · Other

Edge cases:
  - No full text / paywall → score on title alone, cap at 60
  - Opinion / editorial → max 50 unless announces concrete action

Item:
  Title: ${title}
  ${contentSection}
  Source: ${source}
  Original date: ${originalDate}

Return ONLY valid JSON. No markdown fences, no preamble:
{"score": <int 0-100>, "category": "<exact category>", "summary": "<2-3 sentences plain English>", "language": "EN" | "ES"}`;
}

export async function scoreItem(
  title: string,
  snippet: string,
  fullText: string | null,
  source: string,
  originalDate: string,
): Promise<{ scored: ScoredItem; error: string | null }> {
  const contentSection = fullText
    ? `Full article:\n${fullText}`
    : `Snippet: ${snippet}`;
  const prompt = buildScoringPrompt(
    title,
    contentSection,
    source,
    originalDate,
  );

  const { data, error } = await callHaiku(prompt);
  if (error || !data) {
    return {
      scored: {
        score: 0,
        category: "Other",
        summary: "",
        language: "EN",
        tokens: 0,
      },
      error: error ?? "No response data",
    };
  }
  return { scored: parseScore(data), error: null };
}
