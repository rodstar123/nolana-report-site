import type { AgentName, ScoredItem } from "./types";

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

function buildOpportunityScoringPrompt(
  title: string,
  contentSection: string,
  source: string,
  originalDate: string,
): string {
  return `You are an "Opportunity Radar" for RGV (Rio Grande Valley, Texas) small-business owners. Your job is to spot actionable money, contracts, permits, and incentives.

Score each item 0-100 on how actionable it is for an RGV small-business owner to pursue or prepare for.

Scoring guide:
  95-100 — Direct, live opportunity: grant/funding program accepting applications NOW; open RFP/bid with a deadline; named EDC/SBA incentive program with clear eligibility; new tax abatement zone announced; programs like BCIC BIG LIFT grant.
  70-94  — Strong lead: building/construction permit filed (subcontractor pipeline); government contract awarded to local firm (validates the pipeline); new business license filed (partnership opportunity); workforce training grant program announced; city/county budget line-item for business assistance.
  50-69  — Useful signal: new zoning approval for commercial use; state-level funding program that MAY reach RGV; EDC announcement without specific amounts; permit trend or data release; regional workforce development initiative.
  30-49  — Weak signal: general government policy discussion without resolution; national SBA news without specific local application; infrastructure project with indirect impact; city council agenda item without actionable detail.
  0-29   — Not actionable: crime, sports, opinion, completed/past-deadline opportunities, national news without RGV connection, routine government proceedings.

Categories (USE EXACTLY ONE):
  Grant · RFP · Permit · Contract · Incentive · Filing · Workforce · Other

Edge cases:
  - No full text / paywall → score on title alone, cap at 60
  - Past-deadline opportunities → max 20
  - Dollar amounts mentioned → boost score by +10 (concrete = actionable)

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
  agent?: AgentName,
): Promise<{ scored: ScoredItem; error: string | null }> {
  const contentSection = fullText
    ? `Full article:\n${fullText}`
    : `Snippet: ${snippet}`;

  const prompt =
    agent === "Agent 2"
      ? buildOpportunityScoringPrompt(
          title,
          contentSection,
          source,
          originalDate,
        )
      : buildScoringPrompt(title, contentSection, source, originalDate);

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
