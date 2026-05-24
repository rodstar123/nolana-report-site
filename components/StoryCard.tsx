const SECTION_LABELS: Record<string, string> = {
  new_business_pulse: "New Business Pulse",
  gov_economic_watch: "Gov & Economic Watch",
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
}

interface Props {
  story: StoryData;
  locked?: boolean;
}

export function StoryCard({ story, locked = false }: Props) {
  const tagStyle = SECTION_COLORS[story.section] ?? {
    bg: "rgba(74,85,104,0.10)",
    color: "#4a5568",
  };

  return (
    <article
      className={`bg-warm-white border border-cream-dark rounded-xl p-6 transition-all duration-200 ${
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
        {story.nolana_score && (
          <span
            className="inline-flex items-center font-mono font-bold text-xs rounded px-2 py-1 flex-shrink-0"
            style={{
              background: "rgba(212,168,67,0.15)",
              color: "#b8860b",
              letterSpacing: "0.02em",
            }}
          >
            NRI {story.nolana_score}/10
          </span>
        )}
      </div>

      <h3 className="font-display font-bold text-charcoal text-xl leading-snug mb-3">
        {story.headline}
      </h3>

      {locked ? (
        <p className="font-body text-slate-light italic text-sm">
          Upgrade to Pro to read the full story.
        </p>
      ) : (
        <>
          <p className="font-body text-slate text-[15px] mb-4 leading-relaxed">
            {story.summary}
          </p>

          {story.why_it_matters && (
            <div className="mt-3 pt-3 border-t border-cream-dark mb-4">
              <p className="font-body text-[13px] text-slate leading-relaxed">
                <span className="font-semibold text-charcoal">
                  Why it matters:
                </span>{" "}
                {story.why_it_matters}
              </p>
            </div>
          )}

          <div className="flex items-center gap-3 flex-wrap">
            {story.source_name && (
              <span className="font-body text-xs text-slate-light uppercase tracking-wide">
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
              <span className="font-body text-xs text-slate-light">
                {new Date(story.source_date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            )}
          </div>
        </>
      )}
    </article>
  );
}
