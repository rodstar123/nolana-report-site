import { cache } from "react";
import { createClient } from "@supabase/supabase-js";

export interface LatestStory {
  id: string;
  headline: string;
  headline_es: string | null;
  summary: string;
  summary_es: string | null;
  why_it_matters: string | null;
  why_it_matters_es: string | null;
  source_name: string | null;
  section: string;
  nolana_score: number | null;
  position: number;
}

export interface LatestIssue {
  id: string;
  slug: string;
  /** Stories ranked by NRI score desc, position asc — matches issue-page gating order. */
  stories: LatestStory[];
}

/**
 * Single source of truth for "the latest published issue + its scored stories."
 * Wrapped in React.cache so multiple consumers in one render (WeekSignals,
 * SampleBriefing) share one fetch instead of duplicating the query.
 * Returns null when no published issue exists so callers can render nothing.
 */
export const getLatestIssue = cache(async (): Promise<LatestIssue | null> => {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return null;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const { data: issue } = await supabase
    .from("issues")
    .select("id, slug")
    .eq("is_published", true)
    .order("published_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!issue) return null;

  const { data: stories } = await supabase
    .from("stories")
    .select(
      "id, headline, headline_es, summary, summary_es, why_it_matters, why_it_matters_es, source_name, section, nolana_score, position",
    )
    .eq("issue_id", issue.id);

  const ranked = ((stories ?? []) as LatestStory[])
    .filter((s) => s.nolana_score != null)
    .sort(
      (a, b) =>
        (b.nolana_score ?? 0) - (a.nolana_score ?? 0) ||
        a.position - b.position,
    );

  return { id: issue.id, slug: issue.slug, stories: ranked };
});
