import ScoreBadge from "./ScoreBadge";

interface Props {
  score: number;
  headline: string;
  source: string;
  summary: string;
  tag: string;
}

export default function BriefingCard({
  score,
  headline,
  source,
  summary,
  tag,
}: Props) {
  return (
    <article className="bg-warm-white border border-cream-dark rounded-xl p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between gap-4 mb-3">
        <span className="section-label text-[10px]">{tag}</span>
        <ScoreBadge score={score} />
      </div>
      <h3 className="font-display font-bold text-charcoal text-lg leading-snug mb-2">
        {headline}
      </h3>
      <p className="font-editorial text-slate text-sm mb-3 leading-relaxed">
        {summary}
      </p>
      <p className="font-body text-xs text-slate-light uppercase tracking-wide">
        {source}
      </p>
    </article>
  );
}
