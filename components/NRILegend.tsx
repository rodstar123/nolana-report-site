"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";

const DIMENSION_KEYS = ["money", "urgency", "reach", "risk"] as const;
const DIMENSION_EMOJIS = ["💰", "⏱️", "📍", "⚠️"];

const TIER_KEYS = ["critical", "high", "moderate", "watch"] as const;
const TIER_RANGES = ["9–10", "7–8", "5–6", "3–4"];
const TIER_COLORS = [
  { color: "var(--nri-critical-ring)", fallback: "#0d7377" },
  { color: "var(--nri-high-ring)", fallback: "#D4880F" },
  { color: "var(--nri-moderate-ring)", fallback: "#d4a843" },
  { color: "var(--nri-watch-ring)", fallback: "#94a3b8" },
];

export default function NRILegend() {
  const [expanded, setExpanded] = useState(false);
  const t = useTranslations("nri");

  return (
    <div className="bg-warm-white dark:bg-dark-card border border-cream-dark dark:border-dark-border rounded-xl">
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className="w-full flex items-center justify-between p-5 text-left"
        aria-expanded={expanded}
        aria-controls="nri-legend-content"
      >
        <span className="font-body text-sm font-semibold text-slate-light dark:text-dark-dim uppercase tracking-wide">
          {t("howWeScore")}
        </span>
        <span
          className="text-slate-light dark:text-dark-dim transition-transform duration-200 select-none"
          style={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }}
          aria-hidden="true"
        >
          ▾
        </span>
      </button>

      {expanded && (
        <div id="nri-legend-content" className="px-5 pb-5 space-y-4">
          <p className="font-body text-sm text-slate dark:text-dark-muted leading-relaxed">
            {t("explanation")}
          </p>

          <ul className="space-y-2">
            {DIMENSION_KEYS.map((key, i) => (
              <li key={key} className="flex items-start gap-2.5">
                <span
                  className="text-base leading-none mt-0.5"
                  aria-hidden="true"
                >
                  {DIMENSION_EMOJIS[i]}
                </span>
                <div className="flex gap-1.5 flex-wrap">
                  <span className="font-body text-sm font-semibold text-charcoal dark:text-dark-text">
                    {t(`dimensions.${key}.label`)}
                  </span>
                  <span className="font-body text-sm text-slate dark:text-dark-muted">
                    — {t(`dimensions.${key}.desc`)}
                  </span>
                </div>
              </li>
            ))}
          </ul>

          <div className="pt-3 border-t border-cream-dark dark:border-dark-border space-y-1.5">
            {TIER_KEYS.map((key, i) => (
              <div key={key} className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{
                    background: TIER_COLORS[i].color || TIER_COLORS[i].fallback,
                  }}
                />
                <span className="font-mono text-xs text-slate dark:text-dark-muted">
                  <span className="font-semibold">{TIER_RANGES[i]}</span>{" "}
                  {t(`tiers.${key}`)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
