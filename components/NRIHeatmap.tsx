"use client";

const SAMPLE_WEEK = [
  {
    range: "85-100",
    label: "Critical",
    count: 4,
    color: "var(--nri-critical-ring)",
  },
  { range: "70-84", label: "High", count: 9, color: "var(--nri-high-ring)" },
  {
    range: "55-69",
    label: "Moderate",
    count: 12,
    color: "var(--nri-moderate-ring)",
  },
  { range: "<55", label: "Watch", count: 5, color: "var(--nri-watch-ring)" },
];

const TOTAL = SAMPLE_WEEK.reduce((s, b) => s + b.count, 0);

export default function NRIHeatmap() {
  return (
    <div
      className="w-full"
      role="img"
      aria-label="NRI score distribution for a sample week: 4 critical, 9 high, 12 moderate, 5 watch"
    >
      <div className="flex h-3 rounded-full overflow-hidden gap-0.5">
        {SAMPLE_WEEK.map((bucket) => (
          <div
            key={bucket.label}
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${(bucket.count / TOTAL) * 100}%`,
              background: bucket.color,
              opacity: 0.85,
            }}
          />
        ))}
      </div>
      <div className="grid grid-cols-2 sm:flex sm:justify-between gap-1.5 sm:gap-0 mt-2.5">
        {SAMPLE_WEEK.map((bucket) => (
          <div key={bucket.label} className="flex items-center gap-1.5">
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ background: bucket.color }}
            />
            <span className="font-mono text-[10px] text-slate-light">
              {bucket.label} ({bucket.count})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
