import ScoreBadge from "./ScoreBadge";

interface Props {
  score: number;
  headline: string;
  source: string;
  summary: string;
  tag: string;
}

const TAG_COLORS: Record<string, { bg: string; color: string }> = {
  "Industrial Watch": { bg: "rgba(212,168,67,0.15)", color: "#b8860b" },
  "Cross-Border": { bg: "rgba(16,163,168,0.12)", color: "#0d7377" },
  "Gov Watch": { bg: "rgba(99,102,241,0.12)", color: "#4f46e5" },
  "Business Pulse": { bg: "rgba(13,115,119,0.12)", color: "#0d7377" },
};

export default function BriefingCard({
  score,
  headline,
  source,
  summary,
  tag,
}: Props) {
  const tagStyle = TAG_COLORS[tag] ?? {
    bg: "rgba(74,85,104,0.1)",
    color: "#4a5568",
  };

  return (
    <article className="bg-warm-white border border-cream-dark rounded-xl p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
      <div className="flex items-start justify-between gap-4 mb-4">
        <span
          className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-body font-bold uppercase tracking-wide flex-shrink-0"
          style={{ background: tagStyle.bg, color: tagStyle.color }}
        >
          {tag}
        </span>
        <ScoreBadge score={score} />
      </div>
      <h3 className="font-display font-bold text-charcoal text-xl leading-snug mb-3">
        {headline}
      </h3>
      <p className="font-body text-slate text-[15px] mb-4 leading-relaxed">
        {summary}
      </p>
      <p className="font-body text-xs text-slate-light uppercase tracking-wide">
        {source}
      </p>
    </article>
  );
}
