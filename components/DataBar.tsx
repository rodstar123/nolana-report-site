"use client";
import { useEffect, useRef } from "react";
import { countUpNumbers } from "@/lib/animations";
import { DATA_BAR_METRICS } from "@/lib/constants";

export default function DataBar() {
  const ref = useRef<HTMLDivElement>(null);
  const fired = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !fired.current) {
          fired.current = true;
          if (ref.current) countUpNumbers(ref.current);
        }
      },
      { threshold: 0.3 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="bg-teal relative card-stack">
      <div className="max-w-6xl mx-auto px-6 py-6">
        <div className="grid grid-cols-3 gap-4 divide-x divide-teal-light/30">
          {DATA_BAR_METRICS.map((metric, i) => (
            <div
              key={metric.label}
              className="text-center px-4"
              style={{ transitionDelay: `${i * 150}ms` }}
            >
              <div
                className="font-mono font-bold text-gold"
                style={{ fontSize: "clamp(1.4rem, 3vw, 2rem)" }}
              >
                {metric.prefix}
                <span data-count={metric.value} data-decimals={metric.decimals}>
                  {metric.decimals > 0
                    ? metric.value.toFixed(metric.decimals)
                    : metric.value}
                </span>
                <span className="text-base font-normal text-gold/70 ml-1">
                  {metric.suffix}
                </span>
              </div>
              <div className="font-body text-teal-light/80 text-xs uppercase tracking-widest mt-1">
                {metric.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
