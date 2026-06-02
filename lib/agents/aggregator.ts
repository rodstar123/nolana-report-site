import { SupabaseClient } from "@supabase/supabase-js";
import { getSourceTier } from "./sources";
import type { SourceTier } from "./types";

const STOPWORDS = new Set([
  "a",
  "an",
  "the",
  "and",
  "or",
  "but",
  "in",
  "on",
  "at",
  "to",
  "for",
  "of",
  "with",
  "by",
  "from",
  "is",
  "it",
  "this",
  "that",
  "was",
  "are",
  "be",
  "has",
  "had",
  "not",
  "as",
  "its",
  "his",
  "her",
  "they",
  "we",
  "you",
  "he",
  "she",
  "us",
  "our",
  "your",
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOPWORDS.has(w));
}

function stripPublisherSuffix(title: string): string {
  return title.replace(/\s*[-–—|]\s*[^-–—|]+$/, "").trim();
}

function jaccard(a: string[], b: string[]): number {
  const setA = new Set(a);
  const setB = new Set(b);
  let intersection = 0;
  Array.from(setA).forEach((w) => {
    if (setB.has(w)) intersection++;
  });
  const union = setA.size + setB.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

function extractDollarAmount(text: string): string | null {
  const m = text.match(/\$[\d,.]+\s*[MBmb](?:illion)?/i);
  return m ? m[0].toLowerCase().replace(/,/g, "") : null;
}

const TIER_RANK: Record<SourceTier, number> = {
  local: 4,
  regional: 3,
  national: 2,
  unknown: 1,
  international: 0,
};

function itemTierRank(item: RawItemRow): number {
  const tier = getSourceTier(item.title, item.url, item.source_name ?? "");
  return TIER_RANK[tier];
}

function preferItem(a: RawItemRow, b: RawItemRow): boolean {
  const tierA = itemTierRank(a);
  const tierB = itemTierRank(b);
  if (tierA !== tierB) return tierA >= tierB;
  return (a.relevance_score ?? 0) >= (b.relevance_score ?? 0);
}

const TRADE_CATEGORIES = new Set([
  "Tariff",
  "Bridge",
  "FX",
  "Permit",
  "Grant",
  "Zoning",
]);
const TRADE_REGEX =
  /trade|tariff|bridge|customs|cbp|usmca|maquiladora|nearshoring|freight|logistics|import|export|border.*cross/i;

interface RawItemRow {
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

export async function fetchPoolItems(
  supabase: SupabaseClient,
): Promise<RawItemRow[]> {
  const weekAgo = new Date(Date.now() - 7 * 86_400_000).toISOString();
  const { data, error } = await supabase
    .from("raw_items")
    .select(
      "id,url,url_hash,agent,title,snippet,source_name,category,summary,language,relevance_score,original_date,date_spotted,instant_alerted",
    )
    .gte("date_spotted", weekAgo)
    .gte("relevance_score", 50)
    .eq("included_in_briefing", false)
    .order("relevance_score", { ascending: false })
    .limit(100);
  if (error) throw new Error(`raw_items query: ${error.message}`);
  return (data ?? []) as RawItemRow[];
}

export function dedup(items: RawItemRow[]): {
  kept: RawItemRow[];
  urlDedupCount: number;
  jaccardDedupCount: number;
  reroutedCount: number;
} {
  // Pass 1: URL dedup — keep best source tier, then highest score
  const byUrl = new Map<string, RawItemRow>();
  for (const item of items) {
    const existing = byUrl.get(item.url);
    if (!existing || preferItem(item, existing)) {
      byUrl.set(item.url, item);
    }
  }
  const afterUrl = Array.from(byUrl.values());
  const urlDedupCount = items.length - afterUrl.length;

  // Pass 2: Jaccard title similarity >= 0.30
  const tokenized = afterUrl.map((item) =>
    tokenize(stripPublisherSuffix(item.title)),
  );
  const jaccardDropped = new Set<number>();
  for (let i = 0; i < afterUrl.length; i++) {
    if (jaccardDropped.has(i)) continue;
    for (let j = i + 1; j < afterUrl.length; j++) {
      if (jaccardDropped.has(j)) continue;
      if (jaccard(tokenized[i], tokenized[j]) >= 0.3) {
        const keepI = preferItem(afterUrl[i], afterUrl[j]);
        jaccardDropped.add(keepI ? j : i);
      }
    }
  }
  const afterJaccard = afterUrl.filter((_, i) => !jaccardDropped.has(i));
  const jaccardDedupCount = jaccardDropped.size;

  // Pass 3: Dollar-entity dedup — same $X amount + Jaccard >= 0.20
  const dollarDropped = new Set<number>();
  const tokenized2 = afterJaccard.map((item) =>
    tokenize(stripPublisherSuffix(item.title)),
  );
  for (let i = 0; i < afterJaccard.length; i++) {
    if (dollarDropped.has(i)) continue;
    const dollarI = extractDollarAmount(
      afterJaccard[i].title + " " + (afterJaccard[i].summary ?? ""),
    );
    if (!dollarI) continue;
    for (let j = i + 1; j < afterJaccard.length; j++) {
      if (dollarDropped.has(j)) continue;
      const dollarJ = extractDollarAmount(
        afterJaccard[j].title + " " + (afterJaccard[j].summary ?? ""),
      );
      if (
        dollarJ &&
        dollarI === dollarJ &&
        jaccard(tokenized2[i], tokenized2[j]) >= 0.2
      ) {
        const keepI = preferItem(afterJaccard[i], afterJaccard[j]);
        dollarDropped.add(keepI ? j : i);
      }
    }
  }
  const afterDollar = afterJaccard.filter((_, i) => !dollarDropped.has(i));

  // Agent 3 guard: reroute non-trade stories
  let reroutedCount = 0;
  for (const item of afterDollar) {
    if (item.agent !== "Agent 3") continue;
    const cat = item.category ?? "";
    if (TRADE_CATEGORIES.has(cat)) continue;
    if (TRADE_REGEX.test(item.title + " " + (item.summary ?? ""))) continue;
    reroutedCount++;
    if (cat === "Buzz" || cat === "Event") {
      item.agent = "Agent 4";
    } else {
      item.agent = "Agent 1";
    }
  }

  return {
    kept: afterDollar,
    urlDedupCount,
    jaccardDedupCount: jaccardDedupCount + dollarDropped.size,
    reroutedCount,
  };
}

export function buildOpusUserMessage(
  items: RawItemRow[],
  dedupStats: {
    urlDedupCount: number;
    jaccardDedupCount: number;
    reroutedCount: number;
  },
  totalItems: number,
  downSources: string[],
): string {
  const now = new Date();
  const startDate = new Date(now.getTime() - 7 * 86_400_000)
    .toISOString()
    .slice(0, 10);
  const weekStr = now.toISOString().slice(0, 10);

  const agentToSection: Record<string, string> = {
    "Agent 1": "New Business Pulse",
    "Agent 2": "Opportunity Radar",
    "Agent 3": "Cross-Border & Trade Monitor",
    "Agent 4": "Community Buzz",
    "Agent 5": "Industrial & Investment Watch",
  };

  const grouped = new Map<string, RawItemRow[]>();
  for (const item of items) {
    const section = agentToSection[item.agent] ?? "Community Buzz";
    if (!grouped.has(section)) grouped.set(section, []);
    grouped.get(section)!.push(item);
  }

  let storyData = "";
  let n = 1;
  for (const [section, sectionItems] of Array.from(grouped)) {
    storyData += `--- SUGGESTED SECTION: ${section} ---\n`;
    for (const item of sectionItems) {
      storyData += `[${n}] Title: ${item.title}\n`;
      storyData += `    Source: ${item.source_name ?? "Unknown"} | Score: ${item.relevance_score ?? 0} | Category: ${item.category ?? "Other"} | Date: ${item.original_date ?? item.date_spotted ?? "Unknown"} | Lang: ${item.language ?? "EN"}`;
      if (item.instant_alerted) storyData += " | INSTANT_ALERTED";
      storyData += `\n    Haiku summary: ${item.summary ?? ""}\n`;
      storyData += `    URL: ${item.url}\n`;
      n++;
    }
  }

  let header = `RGV Intel Briefing — Week of ${startDate} to ${weekStr}\n`;
  header += `${items.length} stories after JS dedup (${dedupStats.urlDedupCount + dedupStats.jaccardDedupCount} duplicates removed: ${dedupStats.urlDedupCount} by URL, ${dedupStats.jaccardDedupCount} by Jaccard; ${dedupStats.reroutedCount} Agent 3 stories rerouted). Raw pool was ${totalItems} items scoring >=50.\n`;
  if (downSources.length > 0) {
    header += `Sources down this week: ${downSources.join(", ")}\n`;
  }

  return `${header}\nSTORY DATA:\n${storyData}\nNow write the full briefing following your editorial instructions. Apply semantic dedup, re-score each story, enforce section rules, cap any single source at 8 stories, and write each story in Morning Brew style with original headlines, 2-sentence analysis, The Bottom Line, and source link. Output the 5 section bodies only — no preamble.`;
}

export const OPUS_SYSTEM_PROMPT = `You are the editorial AI for The Nolana Report, an RGV business intelligence briefing published every Monday. Your job is to curate, deduplicate, and write the weekly briefing from the story data provided.

## Semantic Deduplication (do this first)
Before writing anything, scan ALL stories across ALL sections for same-event duplicates. Stories are duplicates if they describe the same underlying event even if the titles and sources differ. Keep only the version with the richest detail and the most authoritative source. Never include two stories about the same event in the final briefing.

**Dollar-amount rule:** Two stories sharing the same specific dollar amount ($1M+) almost always describe the same event from different sources — treat them as duplicates unless the dollar amounts fund entirely different things. Example: a story about "$42.3M UTRGV therapy facility in Harlingen" from RGV Business Journal and another about "$42.3M UTRGV Physical and Occupational Therapy" from ValleyCentral are the same event. Keep the higher-scored, more authoritative source.

## Section Assignment (strict)
Assign each story to exactly one section:
- **New Business Pulse**: New store/restaurant/business openings, expansions, relocations, new startups launching
- **Opportunity Radar**: Grants, funding programs, RFPs, bids, contracts, building permits, business filings, EDC/SBA incentives, workforce programs — money and leads RGV businesses can pursue
- **Cross-Border & Trade Monitor**: International bridge traffic and wait times, CBP/customs policy, imports/exports, maquiladoras, USMCA, Mexican trade policy, binational commerce, freight/logistics, nearshoring announcements
- **Community Buzz**: Local community events, nonprofit activity, education initiatives with a business angle, cultural events with commerce tie-in, human interest stories relevant to business owners
- **Industrial & Investment Watch**: Commercial real estate deals, industrial park permits, infrastructure projects, healthcare facility construction/expansion, university capital projects, EDC announcements, large capital expenditures ($5M+), SpaceX/Starbase, port activity, manufacturing plant openings, warehouse/distribution

IMPORTANT: Healthcare construction, university building projects, large real estate investment, and capital expenditure projects go to Industrial & Investment Watch, NOT Cross-Border & Trade Monitor.

## NRI Scoring (Nolana Relevance Index, 1–10)

Re-score each story you include. The NRI is The Nolana Report's proprietary relevance index.

Score definitions:
- 9–10: Major new business opening, $10M+ investment, policy change with direct and immediate RGV business impact. Rare — but use it when earned.
- 7–8: Significant business activity, meaningful grant ($500K+), infrastructure with clear business impact, bridge/trade anomaly.
- 5–6: Moderate relevance, indirect business impact, workforce or education with clear business angle.
- 3–4: Marginal, narrow-audience, or low-urgency signal. Use it when earned.
- Below 3: DO NOT INCLUDE.

**Forced spread rule:** Use the FULL 1–10 range every week. A week where nothing scores a 9 and nothing scores a 4 or below means the index failed — rescore. Do not cluster everything into 5–8.

**Sub-scores:** Assign four sub-scores to each story, each rated Low / Med / High:
- **Money Impact**: Can this create or protect revenue for RGV businesses?
- **Urgency**: Does action need to happen soon?
- **Local Reach**: How many RGV businesses or industries are affected?
- **Risk**: Could this hurt unprepared businesses?

The four sub-scores MUST vary across the issue. If most stories read Money:High / Urgency:Med / Reach:High / Risk:Low, the sub-scores are decorative noise — rescore until they differentiate. The overall NRI should roughly track the sub-scores.

Target: 20–30 stories total per issue. Quality over quantity.

## The Move Bar (most important editorial rule)

Every story's "The Bottom Line" MUST end in ONE specific, this-week action a named type of operator can take.

PASS — specific and do-able now:
- "get your SAM registration moving"
- "reroute time-sensitive runs to alternate crossings during peak hours"
- "get in front of Mission's buyers before the new org chart hardens"
- "pull your last 90 days of bridge crossing data and identify your slowest windows"
- "call your Brownsville sign vendor and get a storefront quote package ready"

BANNED — never output these or anything like them:
- "get your documents ready"
- "be prepared"
- "stay informed"
- "keep an eye on this"
- "consider your options"
- "monitor the situation"
- "businesses should take note"
- "stay ahead of the curve"

If a story has NO sharp move, do NOT fake one. Instead name the single thing to watch AND the trigger that would make it actionable. A real "watch" beats a fake "move."

Example of an honest watch: "No move yet — but watch for the RFP posting on the Pharr EDC site. The day it drops, have your capability statement ready to submit same-week."

## Content Transformation Rules (NON-NEGOTIABLE)
1. Never copy 3 or more consecutive words from the source headline or snippet. Every headline and summary must be original writing.
2. Headlines must be original and punchy. Never restate the source headline. Use a business angle. Example: "McAllen Airport receives federal grant" becomes "McAllen Airport Lands $7M — Cargo Corridor Eyes Long-Term Growth"
3. Summaries are original analysis, not paraphrase. Write what the news means for RGV business owners.
4. "The Bottom Line" is proprietary forward-looking analysis. One original sentence telling a business owner what to watch, prepare for, or act on — and it MUST clear the Move Bar above.
5. NRI scores are proprietary. Never attribute them to the source.
6. 2-sentence max for the main summary. "The Bottom Line" is exactly 1 sentence.

## Morning Brew Style Guide
- Voice: Conversational but precise. Use contractions. Be direct. Open with "Good morning, Valley."
- Specificity: Always use the actual city name (McAllen, Edinburg, Pharr, Brownsville, Harlingen, Mission, Weslaco). Never "a named RGV city."
- Headlines: Present-tense, active voice, punchy. Use an em dash to add a hook.
- Section intros: Each section opens with ONE italicized editorial sentence framing the week's theme.
- No filler: Never write "As previously reported," "Sources say," "According to officials," "directly impacts RGV businesses."
- Vary framing: "For local operators..." / "Owners in [city] should note..." / "The ripple effect..." / "This means..."

## Source Credibility Hierarchy
When the same story appears from multiple sources, prefer in this order:
1. **Local RGV** (The Monitor, Valley Business Report, MyRGV, RGV Business Journal, Brownsville Herald, ValleyCentral, KRGV, Texas Border Business, Rio Grande Guardian)
2. **Texas regional** (Texas Tribune, Houston Chronicle, Dallas Morning News)
3. **US national / wire** (Reuters, Bloomberg, AP, GlobeNewswire, The Packer, Forbes)
4. **International** (Manila Times, BBC, Al Jazeera, FreshPlaza, etc.) — use only if no US source covers the story. If an international source is the only one, include the story but note the source limitation in your analysis.

## Source Diversity
Cap any single source at 8 stories, choosing the highest-scored ones.

## Output Format

Write the full briefing in this exact order. Each major section is separated by a horizontal rule (---).

---

### 1. OPENING

## Opening
[Exactly 3 paragraphs separated by blank lines (\\n\\n). Morning Brew editorial voice. Never one dense block.

**Paragraph 1 — The Hook** (1 sentence): Start with "Good morning, Valley." + one bold sentence naming the week's single biggest theme. Sets the tone.

**Paragraph 2 — The Tease** (2–4 sentences): The "here's what's inside" paragraph. Name specific stories with exact dollar amounts, city names, company names. Pack in the detail — investors, projects, addresses. This is what earns the open.

**Paragraph 3 — The Forward Hook** (1 sentence): One short sentence that pulls the reader into the briefing. "Let's unpack what it means for your business." energy — not a summary, a door handle.

Rules: Separate ALL 3 paragraphs with \\n\\n in your output. Never merge them into one block. Be specific: dollar figures, city names, company names only. No vague language.
Example (follow this structure exactly):
"Good morning, Valley. Outside money is pouring in — and it's bringing shovels.

A $42.3M UTRGV healthcare campus rising from a former Harlingen retail shell, a $10.5M emergency department breaking ground in Palmview, and an $88M cargo expansion at Anzalduas Bridge gearing up for a September launch. Meanwhile, an Austin investor has quietly assembled a 1,700-unit apartment portfolio across the Valley, and McAllen's airport just locked down $7M in federal dollars.

Let's unpack what it all means for your business."]

---

### 2. THIS WEEK'S BUSINESS TEMPERATURE

Write a section headed:

## This Week's Business Temperature: [2–4 word label]

[2–3 sentences: the strategic read on the week. Where money is moving vs. where pressure is building. End with exactly one line starting with "**The move:**" — this line must clear the Move Bar.]

Example:
## This Week's Business Temperature: Opportunity Rising, Pressure Building

Money is moving into storefronts, airport infrastructure, workforce programs, and supply-chain consolidation. But delays at the bridge, labor uncertainty, and trade questions are creating pressure for operators who depend on timing, compliance, and cross-border movement.

**The move:** lock in your vendor quotes and delivery windows this week — the businesses that move first on these grants and contracts won't wait for stragglers.

This section is shown FREE to all readers.

---

### 3. STORY SECTIONS

Write the 5 section bodies with exactly these section headers. Open each section with one italicized editorial sentence. If a section has no qualifying stories, write "No items this week."

Format each story exactly as:

### [PUNCHY ORIGINAL HEADLINE] (NRI: X/10)
Money: [Low/Med/High] · Urgency: [Low/Med/High] · Reach: [Low/Med/High] · Risk: [Low/Med/High]
[2-sentence original analysis in Morning Brew voice]
**The Bottom Line:** [1 sentence — MUST clear the Move Bar. Specific operator, specific action, this week.]
Source: [source name](url) · [Read the full story →](url)

Use the rocket emoji prefix on the headline for any story where instantAlerted=true.

---

### 4. PRO-ONLY SECTIONS

After all 5 story sections, write two Pro-gated sections:

## The Valley Money Map

| Signal | Where Money Is Moving | Who Wins |
|--------|----------------------|----------|
[3–6 rows synthesized from the highest-NRI stories. Each row names a specific signal, where the money flows, and which operator types benefit.]

## 3 Moves This Week

[Exactly 3 cross-story actions. Each tagged by operator type. Each MUST clear the Move Bar.]

Format:
1. **If you [operator type]:** [specific action that clears the Move Bar]
2. **If you [operator type]:** [specific action that clears the Move Bar]
3. **If you [operator type]:** [specific action that clears the Move Bar]

These two sections are marked PRO-ONLY in the output. The frontend will gate them behind the paywall.

---

### 5. THE QUIET SIGNAL (closer)

## The Quiet Signal

[One non-obvious insight — the story that matters MORE than its noise level suggests. 2–3 sentences explaining why this under-the-radar signal deserves attention and what it could mean if it develops. End with one sentence naming what to watch for next.]

This section is shown FREE to all readers. It closes the briefing.

---

## Final Checklist (verify before outputting)

1. Move Bar: Every "The Bottom Line" names a specific operator and a specific this-week action — or honestly states what to watch and what trigger to wait for. Zero banned phrases anywhere in the briefing.
2. NRI spread: At least one story scores 9+ and at least one scores 4 or below. No clustering in 5–8.
3. Sub-score variance: The four sub-scores vary meaningfully across stories. If they all read the same pattern, rescore.
4. Dedup: No two stories describe the same event.
5. Content originality: No 3+ consecutive words copied from any source headline or snippet.
6. Section order: Opening → Business Temperature → 5 Story Sections → Valley Money Map (PRO) → 3 Moves (PRO) → The Quiet Signal.`;

const SECTION_HEADERS = [
  "New Business Pulse",
  "Opportunity Radar",
  "Cross-Border & Trade Monitor",
  "Community Buzz",
  "Industrial & Investment Watch",
];

const SECTION_TO_ENUM: Record<string, string> = {
  "New Business Pulse": "new_business_pulse",
  "Opportunity Radar": "gov_economic_watch",
  "Cross-Border & Trade Monitor": "cross_border_trade",
  "Community Buzz": "community_buzz",
  "Industrial & Investment Watch": "industrial_investment",
};

interface ParsedStory {
  headline: string;
  nri: number;
  summary: string;
  whyItMatters: string;
  sourceUrl: string;
  sourceName: string;
  section: string;
  instantAlerted: boolean;
  moneyImpact: string | null;
  urgency: string | null;
  localReach: string | null;
  risk: string | null;
}

function extractSectionBlock(
  text: string,
  sectionPrefix: string,
): string | null {
  const idx = text.indexOf(sectionPrefix);
  if (idx < 0) return null;
  const rest = text.slice(idx + 1);
  const nextH2 = rest.search(/\n## /);
  const raw = text.slice(idx, nextH2 >= 0 ? idx + 1 + nextH2 : text.length);
  return raw.replace(/\n---\s*$/, "").trim() || null;
}

export function parseOpusOutput(markdown: string): {
  opening: string;
  stories: ParsedStory[];
  businessTemperature: string | null;
  valleyMoneyMap: string | null;
  threeMoves: string | null;
  quietSignal: string | null;
} {
  const bom = markdown.replace(/^﻿/, "");

  const openingMatch = bom.match(/## Opening\s*\n([\s\S]*?)(?=\n## )/);
  const opening = openingMatch ? openingMatch[1].trim() : "";

  const businessTemperature = extractSectionBlock(
    bom,
    "## This Week's Business Temperature",
  );
  const valleyMoneyMap = extractSectionBlock(bom, "## The Valley Money Map");
  const threeMoves = extractSectionBlock(bom, "## 3 Moves This Week");
  const quietSignal = extractSectionBlock(bom, "## The Quiet Signal");

  const storyBlocks = bom
    .split(/\n(?=###\s)/)
    .filter((b) => b.startsWith("###"));
  const stories: ParsedStory[] = [];

  let currentSection = "community_buzz";
  for (const header of SECTION_HEADERS) {
    if (bom.includes(`## ${header}`)) {
      const sectionStart = bom.indexOf(`## ${header}`);
      for (const block of storyBlocks) {
        const blockStart = bom.indexOf(block);
        if (blockStart > sectionStart) {
          const nextSection = SECTION_HEADERS.find(
            (h) =>
              h !== header &&
              bom.indexOf(`## ${h}`) > sectionStart &&
              bom.indexOf(`## ${h}`) < blockStart,
          );
          if (nextSection) break;
        }
      }
    }
  }

  for (const block of storyBlocks) {
    const blockPos = bom.indexOf(block);
    let matchedSection = "community_buzz";
    let bestDist = Infinity;
    for (const header of SECTION_HEADERS) {
      const headerPos = bom.indexOf(`## ${header}`);
      if (headerPos >= 0 && headerPos < blockPos) {
        const dist = blockPos - headerPos;
        if (dist < bestDist) {
          bestDist = dist;
          matchedSection = SECTION_TO_ENUM[header] ?? "community_buzz";
        }
      }
    }
    currentSection = matchedSection;

    const headlineMatch = block.match(
      /^###\s+(?:🚀\s*|🚨\s*)?(.+?)\s*\(NRI:\s*(\d+)\/10\)/,
    );
    if (!headlineMatch) continue;

    const headline = headlineMatch[1].trim();
    const nri = parseInt(headlineMatch[2], 10);
    if (nri < 3) continue;

    const subScoreMatch = block.match(
      /Money:\s*(Low|Med|High)\s*·\s*Urgency:\s*(Low|Med|High)\s*·\s*Reach:\s*(Low|Med|High)\s*·\s*Risk:\s*(Low|Med|High)/i,
    );

    const instantAlerted =
      block.startsWith("### 🚀") || block.startsWith("### 🚨");

    const bottomLineMatch = block.match(
      /\*\*The Bottom Line:\*\*\s*(.+?)(?:\n|$)/,
    );
    const whyItMatters = bottomLineMatch ? bottomLineMatch[1].trim() : "";

    const sourceMatch = block.match(/Source:\s*\[([^\]]*)\]\(([^)]*)\)/);
    const sourceName = sourceMatch ? sourceMatch[1] : "";
    const sourceUrl = sourceMatch ? sourceMatch[2] : "";

    const lines = block.split("\n");
    const summaryLines: string[] = [];
    let pastHeadline = false;
    for (const line of lines) {
      if (line.startsWith("###")) {
        pastHeadline = true;
        continue;
      }
      if (!pastHeadline) continue;
      if (line.startsWith("**The Bottom Line")) break;
      if (line.startsWith("Source:")) break;
      if (line.startsWith("Money:") && line.includes("Urgency:")) continue;
      if (line.trim()) summaryLines.push(line.trim());
    }
    const summary = summaryLines.join(" ");

    stories.push({
      headline,
      nri,
      summary,
      whyItMatters,
      sourceUrl,
      sourceName,
      section: currentSection,
      instantAlerted,
      moneyImpact: subScoreMatch ? subScoreMatch[1] : null,
      urgency: subScoreMatch ? subScoreMatch[2] : null,
      localReach: subScoreMatch ? subScoreMatch[3] : null,
      risk: subScoreMatch ? subScoreMatch[4] : null,
    });
  }

  return {
    opening,
    stories: stories.slice(0, 30),
    businessTemperature,
    valleyMoneyMap,
    threeMoves,
    quietSignal,
  };
}

function normalizeUrl(url: string): string {
  try {
    const u = new URL(url);
    u.hostname = u.hostname.toLowerCase();
    if (u.pathname.endsWith("/")) u.pathname = u.pathname.slice(0, -1);
    for (const param of [
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_content",
      "utm_term",
      "ref",
      "fbclid",
      "gclid",
    ]) {
      u.searchParams.delete(param);
    }
    return u.toString();
  } catch {
    return url.toLowerCase().replace(/\/+$/, "");
  }
}

export async function writeBriefing(
  supabase: SupabaseClient,
  opening: string,
  stories: ParsedStory[],
  rawItems: RawItemRow[],
  sections: {
    businessTemperature: string | null;
    valleyMoneyMap: string | null;
    threeMoves: string | null;
    quietSignal: string | null;
  },
): Promise<{ issueId: string; storiesWritten: number }> {
  const slug = new Date().toISOString().slice(0, 10);
  const title = `The Nolana Report — Week of ${slug}`;

  const { data: existing } = await supabase
    .from("issues")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  if (existing) {
    return { issueId: existing.id, storiesWritten: 0 };
  }

  const { data: issue, error: issueErr } = await supabase
    .from("issues")
    .insert({
      slug,
      title,
      opening,
      is_published: true,
      published_at: new Date().toISOString(),
      stories_count: stories.length,
      business_temperature: sections.businessTemperature,
      valley_money_map: sections.valleyMoneyMap,
      three_moves: sections.threeMoves,
      quiet_signal: sections.quietSignal,
    })
    .select("id")
    .single();
  if (issueErr || !issue)
    throw new Error(`issues insert: ${issueErr?.message}`);

  const storyRows = stories.map((s, i) => ({
    issue_id: issue.id,
    headline: s.headline,
    summary: s.summary,
    why_it_matters: s.whyItMatters || null,
    nolana_score: s.nri,
    section: s.section,
    source_name: s.sourceName || null,
    source_url: s.sourceUrl || null,
    position: i + 1,
    is_free: i < 5,
    money_impact: s.moneyImpact,
    urgency: s.urgency,
    local_reach: s.localReach,
    risk: s.risk,
  }));

  const { error: storiesErr } = await supabase
    .from("stories")
    .insert(storyRows);
  if (storiesErr) throw new Error(`stories insert: ${storiesErr.message}`);

  const rawUrlMap = new Map(rawItems.map((r) => [normalizeUrl(r.url), r.id]));
  const usedIds: string[] = [];
  for (const s of stories) {
    const normUrl = normalizeUrl(s.sourceUrl);
    const rawId = rawUrlMap.get(normUrl);
    if (rawId) usedIds.push(rawId);
  }
  if (usedIds.length > 0) {
    await supabase
      .from("raw_items")
      .update({ included_in_briefing: true })
      .in("id", usedIds);
  }

  return { issueId: issue.id, storiesWritten: stories.length };
}
