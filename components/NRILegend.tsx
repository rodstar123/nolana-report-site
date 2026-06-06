"use client";
import { useState } from "react";

const DIMENSIONS = [
  {
    emoji: "💰",
    label: "Money Impact",
    desc: "Can this create or protect revenue for Valley businesses?",
  },
  {
    emoji: "⏱️",
    label: "Urgency",
    desc: "Does the reader need to act soon?",
  },
  {
    emoji: "📍",
    label: "Local Reach",
    desc: "How many RGV businesses could feel the impact?",
  },
  {
    emoji: "⚠️",
    label: "Risk",
    desc: "Could this hurt unprepared businesses?",
  },
];

const TIERS = [
  {
    range: "9–10",
    label: "Critical",
    color: "var(--nri-critical-ring)",
    fallback: "#ef4444",
  },
  {
    range: "7–8",
    label: "High",
    color: "var(--nri-solid-ring)",
    fallback: "#0d7377",
  },
  {
    range: "5–6",
    label: "Moderate",
    color: "var(--nri-moderate-ring)",
    fallback: "#d4a843",
  },
  {
    range: "3–4",
    label: "Watch",
    color: "var(--nri-watch-ring)",
    fallback: "#94a3b8",
  },
];

export default function NRILegend() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-warm-white dark:bg-dark-card border border-cream-dark dark:border-dark-border rounded-xl">
      {/* Header — always visible, clickable */}
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className="w-full flex items-center justify-between p-5 text-left"
        aria-expanded={expanded}
        aria-controls="nri-legend-content"
      >
        <span className="font-body text-sm font-semibold text-slate-light dark:text-dark-dim uppercase tracking-wide">
          How We Score Stories
        </span>
        <span
          className="text-slate-light dark:text-dark-dim transition-transform duration-200 select-none"
          style={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }}
          aria-hidden="true"
        >
          ▾
        </span>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div id="nri-legend-content" className="px-5 pb-5 space-y-4">
          <p className="font-body text-sm text-slate dark:text-dark-muted leading-relaxed">
            The Nolana Relevance Index (NRI) measures each story across four
            dimensions:
          </p>

          {/* 4 dimensions */}
          <ul className="space-y-2">
            {DIMENSIONS.map((dim) => (
              <li key={dim.label} className="flex items-start gap-2.5">
                <span
                  className="text-base leading-none mt-0.5"
                  aria-hidden="true"
                >
                  {dim.emoji}
                </span>
                <div className="flex gap-1.5 flex-wrap">
                  <span className="font-body text-sm font-semibold text-charcoal dark:text-dark-text">
                    {dim.label}
                  </span>
                  <span className="font-body text-sm text-slate dark:text-dark-muted">
                    — {dim.desc}
                  </span>
                </div>
              </li>
            ))}
          </ul>

          {/* Score tier legend */}
          <div className="pt-3 border-t border-cream-dark dark:border-dark-border space-y-1.5">
            {TIERS.map((tier) => (
              <div key={tier.label} className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ background: tier.color || tier.fallback }}
                />
                <span className="font-mono text-xs text-slate dark:text-dark-muted">
                  <span className="font-semibold">{tier.range}</span>{" "}
                  {tier.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
