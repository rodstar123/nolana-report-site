"use client";
import { useState, useRef, useCallback, useEffect } from "react";
import { useTranslations } from "next-intl";

interface Props {
  children: React.ReactNode;
}

const DIMENSION_KEYS = ["money", "urgency", "reach", "risk"] as const;
const DIMENSION_ICONS = [
  "M12 2v10l4.5 4.5",
  "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
  "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2",
  "M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z",
];

const TOOLTIP_TIERS = [
  { range: "8–10", key: "actNow" as const, color: "var(--nri-critical-ring)" },
  { range: "5–7", key: "monitor" as const, color: "var(--nri-moderate-ring)" },
  { range: "1–4", key: "aware" as const, color: "var(--nri-watch-ring)" },
];

export default function NRITooltip({ children }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const t = useTranslations("nri");

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) close();
    };
    document.addEventListener("keydown", handleKey);
    document.addEventListener("mousedown", handleClick);
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.removeEventListener("mousedown", handleClick);
    };
  }, [open, close]);

  return (
    <div ref={ref} className="relative inline-flex">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className="inline-flex items-center gap-1.5 font-body text-sm text-teal hover:text-teal-light transition-colors cursor-help"
        aria-expanded={open}
        aria-describedby="nri-tooltip"
      >
        {children}
        <svg
          className="w-3.5 h-3.5 opacity-60"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" strokeWidth="2" />
          <path strokeWidth="2" d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
          <circle cx="12" cy="17" r="0.5" fill="currentColor" />
        </svg>
      </button>
      {open && (
        <div
          id="nri-tooltip"
          role="tooltip"
          className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-80 bg-navy-deep border border-white/10 rounded-xl p-4 shadow-2xl"
        >
          <p className="font-body text-warm-white text-sm font-semibold mb-1.5">
            {t("tooltip.title")}
          </p>
          <p className="font-body text-slate-light text-xs leading-relaxed mb-3">
            {t("tooltip.body")}
          </p>
          <div className="grid grid-cols-2 gap-2 mb-3">
            {DIMENSION_KEYS.map((key, i) => (
              <div key={key} className="flex items-start gap-2">
                <svg
                  className="w-3.5 h-3.5 text-teal-light flex-shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d={DIMENSION_ICONS[i]} />
                </svg>
                <div>
                  <p className="font-body text-warm-white text-[11px] font-semibold leading-tight">
                    {t(`tooltip.${key}.label`)}
                  </p>
                  <p className="font-body text-slate-light text-[10px] leading-snug">
                    {t(`tooltip.${key}.desc`)}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-white/10">
            {TOOLTIP_TIERS.map((tier) => (
              <div key={tier.key} className="flex items-center gap-1.5">
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: tier.color }}
                />
                <span className="font-mono text-[10px] text-slate-light">
                  {tier.range} {t(`tooltip.${tier.key}`)}
                </span>
              </div>
            ))}
          </div>
          <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-navy-deep" />
        </div>
      )}
    </div>
  );
}
