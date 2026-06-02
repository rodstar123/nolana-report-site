"use client";
import NRITooltip from "./NRITooltip";
import QuickReactions from "./QuickReactions";
import ReadersPickBadge from "./ReadersPickBadge";

const SECTION_LABELS: Record<string, string> = {
  new_business_pulse: "New Business Pulse",
  gov_economic_watch: "Opportunity Radar",
  cross_border_trade: "Cross-Border & Trade",
  community_buzz: "Community Buzz",
  industrial_investment: "Industrial & Investment Watch",
};

const SECTION_COLORS: Record<string, { bg: string; color: string }> = {
  new_business_pulse: { bg: "rgba(13,115,119,0.10)", color: "#0d7377" },
  gov_economic_watch: { bg: "rgba(26,35,50,0.10)", color: "#1a2332" },
  cross_border_trade: { bg: "rgba(196,154,48,0.12)", color: "#8a6c00" },
  community_buzz: { bg: "rgba(99,102,241,0.10)", color: "#4f46e5" },
  industrial_investment: { bg: "rgba(212,168,67,0.15)", color: "#b8860b" },
};

function getNRIStyle(score: number) {
  if (score >= 9)
    return { background: "var(--nri-hot-bg)", color: "var(--nri-hot-color)" };
  if (score >= 7)
    return {
      background: "var(--nri-solid-bg)",
      color: "var(--nri-solid-color)",
    };
  return { background: "var(--nri-mid-bg)", color: "var(--nri-mid-color)" };
}

export interface StoryData {
  id: string;
  headline: string;
  summary: string;
  why_it_matters: string | null;
  source_name: string | null;
  source_url: string | null;
  source_date: string | null;
  nolana_score: number | null;
  section: string;
  is_free: boolean;
  position: number;
  money_impact: string | null;
  urgency: string | null;
  local_reach: string | null;
  risk: string | null;
}

interface Props {
  story: StoryData;
  locked?: boolean;
  issueSlug?: string;
}

export function StoryCard({ story, locked = false, issueSlug }: Props) {
  const tagStyle = SECTION_COLORS[story.section] ?? {
    bg: "rgba(74,85,104,0.10)",
    color: "#4a5568",
  };

  return (
    <article
      className={`bg-warm-white dark:bg-dark-card border border-cream-dark dark:border-dark-border rounded-xl p-7 transition-all duration-200 ${
        locked ? "opacity-60" : "hover:shadow-lg hover:-translate-y-0.5"
      }`}
    >
      <div className="flex items-start justify-between gap-4 mb-4">
        <span
          className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-body font-bold uppercase tracking-wide flex-shrink-0"
          style={{ background: tagStyle.bg, color: tagStyle.color }}
        >
          {SECTION_LABELS[story.section] ?? story.section}
        </span>
        <div className="flex items-center gap-2 flex-shrink-0">
          {issueSlug && (
            <ReadersPickBadge issueSlug={issueSlug} storyId={story.id} />
          )}
          {story.nolana_score && (
            <NRITooltip>
              <span
                className="inline-flex items-center font-mono font-bold text-xs rounded px-2.5 py-1.5 flex-shrink-0"
                style={{
                  letterSpacing: "0.02em",
                  ...getNRIStyle(story.nolana_score),
                }}
              >
                NRI {story.nolana_score}/10
              </span>
            </NRITooltip>
          )}
        </div>
      </div>

      <h3 className="font-display font-bold text-charcoal dark:text-dark-text text-[21px] leading-snug mb-3">
        {story.headline}
      </h3>

      {!locked &&
        (story.money_impact ||
          story.urgency ||
          story.local_reach ||
          story.risk) && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {(
              [
                { label: "Money", value: story.money_impact },
                { label: "Urgency", value: story.urgency },
                { label: "Reach", value: story.local_reach },
                { label: "Risk", value: story.risk },
              ] as { label: string; value: string | null }[]
            )
              .filter(
                (s): s is { label: string; value: string } => s.value !== null,
              )
              .map((s) => (
                <span
                  key={s.label}
                  className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium tracking-wide ${
                    s.value === "High"
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                      : s.value === "Med"
                        ? "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                        : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500"
                  }`}
                >
                  {s.label}: {s.value}
                </span>
              ))}
          </div>
        )}

      {locked ? (
        <p className="font-body text-slate-light dark:text-dark-dim italic text-sm">
          Upgrade to Pro to read the full story.
        </p>
      ) : (
        <>
          <p className="font-editorial text-slate dark:text-dark-muted text-[17px] mb-5 leading-relaxed">
            {story.summary}
          </p>

          {story.why_it_matters && (
            <div className="mt-4 mb-5 pl-4 border-l-[3px] border-teal bg-teal/5 dark:bg-teal/10 rounded-r-md py-3">
              <p className="font-body text-[15px] text-slate dark:text-dark-muted leading-relaxed">
                <span className="font-semibold text-teal dark:text-teal-light">
                  Why it matters:
                </span>{" "}
                {story.why_it_matters}
              </p>
            </div>
          )}

          <div className="mt-4 mb-3">
            <QuickReactions storyId={story.id} />
          </div>

          <div className="flex items-center justify-between gap-3 flex-wrap mt-3">
            <div className="flex items-center gap-3 flex-wrap">
              {story.source_name && (
                <span className="font-body text-xs text-slate-light dark:text-dark-dim uppercase tracking-wide">
                  {story.source_url ? (
                    <a
                      href={story.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-teal transition-colors underline underline-offset-2"
                    >
                      {story.source_name}
                    </a>
                  ) : (
                    story.source_name
                  )}
                </span>
              )}
              {story.source_date && (
                <span className="font-body text-xs text-slate-light dark:text-dark-dim">
                  {new Date(story.source_date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              )}
            </div>
            {story.source_url && (
              <a
                href={story.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-body text-xs font-semibold text-teal dark:text-teal-light hover:text-teal-light dark:hover:text-teal transition-colors whitespace-nowrap"
              >
                Read the full story →
              </a>
            )}
          </div>
        </>
      )}
    </article>
  );
}
