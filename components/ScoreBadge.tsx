"use client";

interface Props {
  score: number;
  size?: number;
  showLabel?: boolean;
}

function getNRITier(score: number) {
  if (score >= 85)
    return {
      ring: "var(--nri-critical-ring)",
      bg: "var(--nri-critical-bg)",
      label: "Critical",
      glow: true,
    };
  if (score >= 70)
    return {
      ring: "var(--nri-high-ring)",
      bg: "var(--nri-high-bg)",
      label: "High",
      glow: false,
    };
  if (score >= 55)
    return {
      ring: "var(--nri-moderate-ring)",
      bg: "var(--nri-moderate-bg)",
      label: "Moderate",
      glow: false,
    };
  return {
    ring: "var(--nri-watch-ring)",
    bg: "var(--nri-watch-bg)",
    label: "Watch",
    glow: false,
  };
}

export { getNRITier };

export default function ScoreBadge({ score, size = 44, showLabel }: Props) {
  const tier = getNRITier(score);
  const radius = (size - 6) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const gap = circumference - progress;

  return (
    <div
      className={`inline-flex flex-col items-center gap-1 flex-shrink-0 ${tier.glow ? "nri-glow" : ""}`}
      role="img"
      aria-label={`NRI score ${score} out of 100 — ${tier.label}`}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={3}
          className="text-slate-light/15"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={tier.ring}
          strokeWidth={3}
          strokeDasharray={`${progress} ${gap}`}
          strokeLinecap="round"
          className="transition-all duration-700"
        />
        <text
          x={size / 2}
          y={size / 2}
          textAnchor="middle"
          dominantBaseline="central"
          fill={tier.ring}
          fontSize={size * 0.32}
          fontFamily="'Playfair Display', Georgia, serif"
          fontWeight="700"
          transform={`rotate(90, ${size / 2}, ${size / 2})`}
        >
          {score}
        </text>
      </svg>
      {showLabel && (
        <span
          className="font-mono text-[9px] uppercase tracking-widest font-bold"
          style={{ color: tier.ring }}
        >
          {tier.label}
        </span>
      )}
    </div>
  );
}
