"use client";
import { useState } from "react";

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
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (total === 0) return null;

  const summaryParts = buckets.filter((b) => b.count > 0);
  const summaryText = summaryParts
    .map((b) => `${b.count} stories scored ${b.range}`)
    .join(", ");

  return (
    <div
      className="w-full"
      role="img"
      aria-label={`NRI score distribution: ${buckets.map((b) => `${b.count} ${b.label.toLowerCase()}`).join(", ")}`}
    >
      <p className="font-body text-[15px] text-charcoal dark:text-dark-text leading-relaxed mb-3">
        How this week&apos;s stories scored on the Nolana Relevance Index
      </p>

      {/* Heat strip with hover tooltips */}
      <div className="relative flex h-5 rounded-full overflow-hidden gap-0.5">
        {buckets.map((bucket, idx) =>
          bucket.count > 0 ? (
            <div
              key={bucket.label}
              className={`h-full rounded-full cursor-default transition-opacity ${animated ? "nri-heatmap-bar origin-left" : "transition-all duration-500"} ${hoveredIdx !== null && hoveredIdx !== idx ? "opacity-40" : "opacity-85"}`}
              style={{
                width: `${(bucket.count / total) * 100}%`,
                background: bucket.color,
                ...(animated ? { transform: "scaleX(0)" } : {}),
              }}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              onClick={() => setHoveredIdx(hoveredIdx === idx ? null : idx)}
              role="button"
              tabIndex={0}
              aria-label={`${bucket.count} stories scored ${bucket.range} (${bucket.label})`}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ")
                  setHoveredIdx(hoveredIdx === idx ? null : idx);
              }}
            />
          ) : null,
        )}
      </div>

      {/* Hover/tap summary */}
      <div className="h-6 mt-1.5">
        {hoveredIdx !== null && buckets[hoveredIdx].count > 0 ? (
          <p className="font-mono text-[14px] text-charcoal dark:text-dark-text animate-in fade-in duration-150">
            <span
              className="inline-block w-2 h-2 rounded-full mr-1.5 align-middle"
              style={{ background: buckets[hoveredIdx].color }}
            />
            {buckets[hoveredIdx].count}{" "}
            {buckets[hoveredIdx].count === 1 ? "story" : "stories"} scored{" "}
            {buckets[hoveredIdx].range} ({buckets[hoveredIdx].label})
          </p>
        ) : (
          <p className="font-body text-[14px] text-slate dark:text-dark-muted">
            {summaryText}
          </p>
        )}
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 sm:flex sm:justify-between gap-1.5 sm:gap-0 mt-1">
        {buckets.map((bucket, idx) => {
          const dimmed = bucket.count === 0;
          const active = hoveredIdx === idx;
          return (
            <div
              key={bucket.label}
              className={`flex items-center gap-1.5 cursor-default transition-opacity ${animated ? "nri-heatmap-label" : ""} ${dimmed ? "opacity-30" : active ? "opacity-100" : hoveredIdx !== null ? "opacity-40" : ""}`}
              style={animated ? { opacity: dimmed ? 0.3 : 0 } : undefined}
              onMouseEnter={() => !dimmed && setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ background: bucket.color }}
              />
              <span className="font-mono text-[14px] text-charcoal dark:text-dark-text">
                {bucket.label}
                <span className="text-[12px] ml-0.5 opacity-60">
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
