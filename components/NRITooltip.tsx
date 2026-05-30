"use client";
import { useState, useRef, useCallback, useEffect } from "react";

interface Props {
  children: React.ReactNode;
}

export default function NRITooltip({ children }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

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
          className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 bg-navy-deep border border-white/10 rounded-xl p-4 shadow-2xl"
        >
          <p className="font-body text-warm-white text-sm font-semibold mb-1.5">
            Nolana Relevance Index (NRI)
          </p>
          <p className="font-body text-slate-light text-xs leading-relaxed mb-3">
            Every story is scored 0&ndash;100 by business relevance, urgency,
            and market impact. Higher scores mean a stronger signal for Valley
            business owners.
          </p>
          <div className="grid grid-cols-2 gap-2">
            {[
              {
                label: "85-100",
                name: "Critical",
                color: "var(--nri-critical-ring)",
              },
              { label: "70-84", name: "High", color: "var(--nri-high-ring)" },
              {
                label: "55-69",
                name: "Moderate",
                color: "var(--nri-moderate-ring)",
              },
              { label: "<55", name: "Watch", color: "var(--nri-watch-ring)" },
            ].map((t) => (
              <div key={t.name} className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ background: t.color }}
                />
                <span className="font-mono text-[10px] text-slate-light">
                  {t.label} {t.name}
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
