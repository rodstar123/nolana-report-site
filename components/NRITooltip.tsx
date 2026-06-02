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
          className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-80 bg-navy-deep border border-white/10 rounded-xl p-4 shadow-2xl"
        >
          <p className="font-body text-warm-white text-sm font-semibold mb-1.5">
            Nolana Relevance Index (NRI)
          </p>
          <p className="font-body text-slate-light text-xs leading-relaxed mb-3">
            Each story is scored 1&ndash;10 based on four dimensions. A score of
            9&ndash;10 means high money + high urgency + wide RGV reach. A score
            of 3&ndash;4 means narrow impact or low urgency. Stories below 3 are
            excluded from the briefing.
          </p>
          <div className="grid grid-cols-2 gap-2 mb-3">
            {[
              {
                icon: "M12 2v10l4.5 4.5",
                label: "Money Impact",
                desc: "Revenue, cost, or capital effect",
              },
              {
                icon: "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
                label: "Urgency",
                desc: "Deadline or time-sensitive window",
              },
              {
                icon: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2",
                label: "Local Reach",
                desc: "How many Valley operators affected",
              },
              {
                icon: "M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z",
                label: "Risk",
                desc: "Downside exposure if you miss it",
              },
            ].map((dim) => (
              <div key={dim.label} className="flex items-start gap-2">
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
                  <path d={dim.icon} />
                </svg>
                <div>
                  <p className="font-body text-warm-white text-[11px] font-semibold leading-tight">
                    {dim.label}
                  </p>
                  <p className="font-body text-slate-light text-[10px] leading-snug">
                    {dim.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-white/10">
            {[
              {
                range: "8–10",
                label: "Act now",
                color: "var(--nri-critical-ring)",
              },
              {
                range: "5–7",
                label: "Monitor",
                color: "var(--nri-moderate-ring)",
              },
              { range: "1–4", label: "Aware", color: "var(--nri-watch-ring)" },
            ].map((t) => (
              <div key={t.label} className="flex items-center gap-1.5">
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: t.color }}
                />
                <span className="font-mono text-[10px] text-slate-light">
                  {t.range} {t.label}
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
