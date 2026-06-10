"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";

interface ScoreBucket {
  range: string;
  labelKey: string;
  label: string;
  count: number;
  color: string;
}

const BUCKETS_CONFIG = [
  {
    range: "9–10",
    labelKey: "critical",
    color: "var(--nri-critical-ring)",
    min: 9,
  },
  { range: "7–8", labelKey: "high", color: "var(--nri-high-ring)", min: 7 },
  {
    range: "5–6",
    labelKey: "moderate",
    color: "var(--nri-moderate-ring)",
    min: 5,
  },
  { range: "3–4", labelKey: "watch", color: "var(--nri-watch-ring)", min: 0 },
];

interface Props {
  scores: number[];
  animated?: boolean;
}

export default function NRIHeatmap({ scores, animated }: Props) {
  const t = useTranslations("nri");
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const total = scores.length;
  if (total === 0) return null;

  const buckets: ScoreBucket[] = BUCKETS_CONFIG.map((cfg, i) => {
    const max = i === 0 ? 11 : BUCKETS_CONFIG[i - 1].min;
    const count = scores.filter((s) => s >= cfg.min && s < max).length;
    return {
      range: cfg.range,
      labelKey: cfg.labelKey,
      label: t(`tiers.${cfg.labelKey}`),
      count,
      color: cfg.color,
    };
  });

  const storyWord = (n: number) =>
    n === 1 ? t("heatmap.story") : t("heatmap.stories");

  const summaryParts = buckets.filter((b) => b.count > 0);
  const summaryText = summaryParts
    .map(
      (b) =>
        `${b.count} ${storyWord(b.count)} ${t("heatmap.scored")} ${b.range}`,
    )
    .join(", ");

  return (
    <div
      className="w-full"
      role="img"
      aria-label={`NRI score distribution: ${buckets.map((b) => `${b.count} ${b.label.toLowerCase()}`).join(", ")}`}
    >
      <p className="font-body text-[15px] text-charcoal dark:text-dark-text leading-relaxed mb-3">
        {t("heatmap.howScored")}
      </p>

      <div className="relative flex h-5 rounded-full overflow-hidden gap-0.5">
        {buckets.map((bucket, idx) =>
          bucket.count > 0 ? (
            <div
              key={bucket.labelKey}
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
              aria-label={`${bucket.count} ${storyWord(bucket.count)} ${t("heatmap.scored")} ${bucket.range} (${bucket.label})`}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ")
                  setHoveredIdx(hoveredIdx === idx ? null : idx);
              }}
            />
          ) : null,
        )}
      </div>

      <div className="h-6 mt-1.5">
        {hoveredIdx !== null && buckets[hoveredIdx].count > 0 ? (
          <p className="font-mono text-[14px] text-charcoal dark:text-dark-text animate-in fade-in duration-150">
            <span
              className="inline-block w-2 h-2 rounded-full mr-1.5 align-middle"
              style={{ background: buckets[hoveredIdx].color }}
            />
            {buckets[hoveredIdx].count} {storyWord(buckets[hoveredIdx].count)}{" "}
            {t("heatmap.scored")} {buckets[hoveredIdx].range} (
            {buckets[hoveredIdx].label})
          </p>
        ) : (
          <p className="font-body text-[14px] text-slate dark:text-dark-muted">
            {summaryText}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 sm:flex sm:justify-between gap-1.5 sm:gap-0 mt-1">
        {buckets.map((bucket, idx) => {
          const dimmed = bucket.count === 0;
          const active = hoveredIdx === idx;
          return (
            <div
              key={bucket.labelKey}
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
