import { SITE_URL } from "@/lib/constants";

/**
 * Pick the single strongest story card from a published issue.
 *
 * Ranking is fully deterministic — same issue in, same card out — so a rerun
 * with ?issue_id= regenerates copy for the same story rather than quietly
 * switching horses and upserting mismatched rows over the previous run.
 *
 * NOTE ON SECTIONS: the five real values are the agent slugs below. There is no
 * "Money Map" or "RGV Wins" section — "Valley Money Map" is an issue-level
 * markdown column, not a story section. The order here is Noe's ruling
 * (2026-09-13): money-bearing sections first.
 */

/** Tie-break 2. Lower wins. */
const SECTION_RANK: Record<string, number> = {
  industrial_investment: 0,
  new_business_pulse: 1,
  cross_border_trade: 2,
  gov_economic_watch: 3,
  community_buzz: 4,
};
const SECTION_RANK_UNKNOWN = 5;

/**
 * Place names used by tie-break 1. Not exhaustive geography — these are the
 * datelines that actually appear in RGV business copy.
 */
const RGV_PLACES = [
  "Rio Grande Valley",
  "RGV",
  "Brownsville",
  "McAllen",
  "Harlingen",
  "Edinburg",
  "Mission",
  "Pharr",
  "Weslaco",
  "Mercedes",
  "San Benito",
  "Los Fresnos",
  "Rio Grande City",
  "Roma",
  "La Feria",
  "Donna",
  "Alamo",
  "San Juan",
  "Hidalgo",
  "Cameron County",
  "Willacy",
  "Starr County",
  "Port of Brownsville",
  "Port Isabel",
  "South Padre Island",
  "Raymondville",
  "Palmview",
  "La Joya",
  "Matamoros",
  "Reynosa",
  "Nuevo Progreso",
  "Laredo",
  "Boca Chica",
];

/** Corporate/entity markers that survive Title Case (see caveat below). */
const ENTITY_SUFFIX =
  /\b(Inc|LLC|L\.L\.C|Corp|Corporation|Technologies|Industries|Holdings|Group|Partners|Ventures|Systems|Logistics|Motors|Foods|Bank|Capital|Energy|Aerospace|Labs)\b/;

/** Possessive proper noun — "Saronic's", "Brownsville's". */
const POSSESSIVE_ENTITY = /\b[A-Z][\w&.-]*(?:'s|’s)\b/;

const MONEY = /\$\s?\d/;
const DIGIT = /\d/;

export interface StoryRow {
  id: string;
  position: number;
  section: string;
  nolana_score: number | null;
  headline: string;
  summary: string | null;
  why_it_matters: string | null;
  smart_move: string | null;
  source_name: string | null;
  source_url: string | null;
  headline_es: string | null;
  summary_es: string | null;
  why_it_matters_es: string | null;
  smart_move_es: string | null;
}

export interface IssueRow {
  id: string;
  slug: string;
  title: string;
  published_at: string | null;
}

export interface StorySelection {
  issue: IssueRow;
  story: StoryRow;
  /** Public EN issue URL, no UTMs. */
  enUrl: string;
  /** Public ES issue URL, no UTMs. */
  esUrl: string;
  /** True only when the selected card has real Spanish of its own. */
  spanishAvailable: boolean;
  /** Human-readable account of which rule decided, for the run report. */
  tieBreak: string;
  /** Signals tie-break 1 found on the winning headline. */
  specificity: string[];
  candidateCount: number;
}

/**
 * Tie-break 1: does the headline name something concrete?
 *
 * CAVEAT, and it matters: these headlines are written in Title Case, so every
 * content word is capitalised. Capitalisation therefore carries no signal and
 * a generic proper-noun detector would fire on "Shipyard" and "Jobs". What is
 * left that genuinely discriminates is a dollar figure, any digit, a known RGV
 * place, a corporate suffix, or a possessive. A headline with none of those is
 * the abstract kind we want to rank below.
 */
export function specificitySignals(headline: string): string[] {
  const signals: string[] = [];
  if (MONEY.test(headline)) signals.push("dollar-figure");
  else if (DIGIT.test(headline)) signals.push("number");

  const place = RGV_PLACES.find((p) =>
    new RegExp(`\\b${p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(
      headline,
    ),
  );
  if (place) signals.push(`place:${place}`);

  if (ENTITY_SUFFIX.test(headline)) signals.push("entity-suffix");
  else if (POSSESSIVE_ENTITY.test(headline)) signals.push("possessive-entity");

  return signals;
}

const sectionRank = (s: string): number =>
  SECTION_RANK[s] ?? SECTION_RANK_UNKNOWN;

const hasText = (v: string | null | undefined): boolean =>
  typeof v === "string" && v.trim().length > 0;

/**
 * Spanish is emitted only when the card carries its own Spanish. A blank string
 * counts as missing: publish_translation() uses coalesce, so an empty value is
 * indistinguishable from an absent one and would produce an empty ES post.
 */
export function hasSpanish(story: StoryRow): boolean {
  return hasText(story.headline_es) && hasText(story.summary_es);
}

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
type Db = any;

const STORY_COLUMNS =
  "id, position, section, nolana_score, headline, summary, why_it_matters, " +
  "smart_move, source_name, source_url, headline_es, summary_es, " +
  "why_it_matters_es, smart_move_es";

/**
 * Load an issue (the given one, or the latest published) and return its single
 * strongest card. Throws rather than returning null: every caller here treats
 * "no issue" or "no scored stories" as a run failure worth a Telegram line.
 */
export async function selectStory(
  db: Db,
  issueId?: string,
): Promise<StorySelection> {
  const issueQuery = db
    .from("issues")
    .select("id, slug, title, published_at")
    .eq("is_published", true);

  const { data: issue, error: issueErr } = issueId
    ? await issueQuery.eq("id", issueId).maybeSingle()
    : await issueQuery
        .order("published_at", { ascending: false })
        .limit(1)
        .maybeSingle();

  if (issueErr) throw new Error(`issues fetch: ${issueErr.message}`);
  if (!issue) {
    throw new Error(
      issueId
        ? `No published issue with id ${issueId}`
        : "No published issue found",
    );
  }

  const { data: stories, error: storiesErr } = await db
    .from("stories")
    .select(STORY_COLUMNS)
    .eq("issue_id", issue.id);

  if (storiesErr) throw new Error(`stories fetch: ${storiesErr.message}`);

  const scored = ((stories ?? []) as StoryRow[]).filter(
    (s) => s.nolana_score != null,
  );
  if (scored.length === 0) {
    throw new Error(`Issue ${issue.slug} has no scored stories`);
  }

  const ranked = [...scored].sort((a, b) => {
    const byScore = (b.nolana_score ?? 0) - (a.nolana_score ?? 0);
    if (byScore !== 0) return byScore;

    const aSpecific = specificitySignals(a.headline).length > 0 ? 1 : 0;
    const bSpecific = specificitySignals(b.headline).length > 0 ? 1 : 0;
    if (aSpecific !== bSpecific) return bSpecific - aSpecific;

    const bySection = sectionRank(a.section) - sectionRank(b.section);
    if (bySection !== 0) return bySection;

    return a.position - b.position;
  });

  const story = ranked[0];
  const runnerUp = ranked[1];

  return {
    issue: issue as IssueRow,
    story,
    enUrl: `${SITE_URL}/issues/${issue.slug}`,
    esUrl: `${SITE_URL}/es/issues/${issue.slug}`,
    spanishAvailable: hasSpanish(story),
    tieBreak: describeTieBreak(story, runnerUp, scored),
    specificity: specificitySignals(story.headline),
    candidateCount: scored.length,
  };
}

/** Name the rule that actually separated the winner from the runner-up. */
function describeTieBreak(
  winner: StoryRow,
  runnerUp: StoryRow | undefined,
  all: StoryRow[],
): string {
  if (!runnerUp) return "only one scored story";

  const topScore = winner.nolana_score ?? 0;
  const atTop = all.filter((s) => (s.nolana_score ?? 0) === topScore).length;

  if ((runnerUp.nolana_score ?? 0) < topScore) {
    return `score (${topScore}, sole highest of ${all.length} scored stories)`;
  }

  const wSpecific = specificitySignals(winner.headline).length > 0;
  const rSpecific = specificitySignals(runnerUp.headline).length > 0;
  if (wSpecific !== rSpecific) {
    return `score tied at ${topScore} across ${atTop} stories → tie-break 1 (headline specificity: ${specificitySignals(winner.headline).join(", ")})`;
  }

  if (sectionRank(winner.section) !== sectionRank(runnerUp.section)) {
    return `score tied at ${topScore} across ${atTop} stories, both specific → tie-break 2 (section ${winner.section} outranks ${runnerUp.section})`;
  }

  return `score tied at ${topScore} across ${atTop} stories, same section ${winner.section} → tie-break 3 (position ${winner.position} < ${runnerUp.position})`;
}
