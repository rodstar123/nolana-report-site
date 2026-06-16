import ScoreBadge from "./ScoreBadge";
import QuickReactions from "./QuickReactions";

interface Props {
  score: number;
  headline: string;
  source: string;
  summary: string;
  tag: string;
  /** Real-data section key — colors the tag via SECTION_COLORS, locale-independent. */
  section?: string;
  whyItMatters?: string;
  showReactions?: boolean;
}

const TAG_COLORS: Record<string, { bg: string; color: string }> = {
  "Industrial Watch": { bg: "rgba(212,168,67,0.12)", color: "#b8860b" },
  "Cross-Border": { bg: "rgba(16,163,168,0.10)", color: "#0d7377" },
  "Gov Watch": { bg: "rgba(99,102,241,0.10)", color: "#4f46e5" },
  "Business Pulse": { bg: "rgba(13,115,119,0.10)", color: "#0d7377" },
};

// Mirrors StoryCard's section palette so real localized section labels color
// correctly regardless of locale (TAG_COLORS is keyed by English MOCK labels).
const SECTION_COLORS: Record<string, { bg: string; color: string }> = {
  new_business_pulse: { bg: "rgba(13,115,119,0.10)", color: "#0d7377" },
  gov_economic_watch: { bg: "rgba(26,35,50,0.10)", color: "#1a2332" },
  cross_border_trade: { bg: "rgba(196,154,48,0.12)", color: "#8a6c00" },
  community_buzz: { bg: "rgba(99,102,241,0.10)", color: "#4f46e5" },
  industrial_investment: { bg: "rgba(212,168,67,0.15)", color: "#b8860b" },
};

function storyId(headline: string) {
  return headline.toLowerCase().replace(/\s+/g, "-").slice(0, 40);
}

export default function BriefingCard({
  score,
  headline,
  source,
  summary,
  tag,
  section,
  whyItMatters,
  showReactions = true,
}: Props) {
  const tagStyle = (section ? SECTION_COLORS[section] : undefined) ??
    TAG_COLORS[tag] ?? {
      bg: "rgba(74,85,104,0.08)",
      color: "#4a5568",
    };

  return (
    <article className="bg-warm-white border border-cream-dark rounded-xl p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group">
      <div className="flex items-start justify-between gap-4 mb-4">
        <span
          className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-body font-bold uppercase tracking-wide flex-shrink-0"
          style={{ background: tagStyle.bg, color: tagStyle.color }}
        >
          {tag}
        </span>
        <ScoreBadge score={score} size={44} />
      </div>
      <h3 className="font-display font-bold text-charcoal text-xl leading-snug mb-3">
        {headline}
      </h3>
      <p className="font-body text-slate text-[15px] mb-4 leading-relaxed">
        {summary}
      </p>
      {whyItMatters && (
        <div className="mt-3 pt-3 border-t border-cream-dark">
          <p className="font-body text-[13px] text-slate leading-relaxed">
            <span className="font-semibold text-charcoal">Why it matters:</span>{" "}
            {whyItMatters}
          </p>
        </div>
      )}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-cream-dark/60">
        <p className="font-mono text-[11px] text-slate uppercase tracking-wide">
          {source}
        </p>
        {showReactions && <QuickReactions storyId={storyId(headline)} />}
      </div>
    </article>
  );
}
