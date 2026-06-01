"use client";

interface ScoreBucket {
  range: string;
  label: string;
  count: number;
  color: string;
}

const BUCKETS_CONFIG = [
  {
    range: "9–10",
    label: "Critical",
    color: "var(--nri-critical-ring)",
    min: 9,
  },
  { range: "7–8", label: "High", color: "var(--nri-high-ring)", min: 7 },
  {
    range: "5–6",
    label: "Moderate",
    color: "var(--nri-moderate-ring)",
    min: 5,
  },
  { range: "3–4", label: "Watch", color: "var(--nri-watch-ring)", min: 0 },
];

function buildBuckets(scores: number[]): ScoreBucket[] {
  return BUCKETS_CONFIG.map((cfg, i) => {
    const max = i === 0 ? 11 : BUCKETS_CONFIG[i - 1].min;
    const count = scores.filter((s) => s >= cfg.min && s < max).length;
    return { range: cfg.range, label: cfg.label, count, color: cfg.color };
  });
}

interface Props {
  scores: number[];
  animated?: boolean;
}

export default function NRIHeatmap({ scores, animated }: Props) {
  const buckets = buildBuckets(scores);
  const total = scores.length;

  if (total === 0) return null;

  return (
    <div
      className="w-full"
      role="img"
      aria-label={`NRI score distribution: ${buckets.map((b) => `${b.count} ${b.label.toLowerCase()}`).join(", ")}`}
    >
      <p className="font-body text-xs text-slate-light dark:text-dark-dim leading-relaxed mb-3">
        How this week&apos;s stories scored on the Nolana Relevance Index
      </p>
      <div className="flex h-4 rounded-full overflow-hidden gap-0.5">
        {buckets.map((bucket) =>
          bucket.count > 0 ? (
            <div
              key={bucket.label}
              className={`h-full rounded-full ${animated ? "nri-heatmap-bar origin-left" : "transition-all duration-500"}`}
              style={{
                width: `${(bucket.count / total) * 100}%`,
                background: bucket.color,
                opacity: 0.85,
                ...(animated ? { transform: "scaleX(0)" } : {}),
              }}
            />
          ) : null,
        )}
      </div>
      <div className="grid grid-cols-2 sm:flex sm:justify-between gap-1.5 sm:gap-0 mt-3">
        {buckets.map((bucket) => {
          const dimmed = bucket.count === 0;
          return (
            <div
              key={bucket.label}
              className={`flex items-center gap-1.5 ${animated ? "nri-heatmap-label" : ""} ${dimmed ? "opacity-30" : ""}`}
              style={animated ? { opacity: dimmed ? 0.3 : 0 } : undefined}
            >
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ background: bucket.color }}
              />
              <span className="font-mono text-[11px] text-slate-light dark:text-dark-dim">
                {bucket.label}
                <span className="text-[10px] ml-0.5 opacity-60">
                  ({bucket.range})
                </span>
                {bucket.count > 0 && (
                  <span className="font-semibold ml-1">{bucket.count}</span>
                )}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
