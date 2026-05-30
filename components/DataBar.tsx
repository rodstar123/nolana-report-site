"use client";
import { useEffect, useRef } from "react";
import { countUpNumbers } from "@/lib/animations";
import type { SnapshotMetric } from "@/lib/snapshot";

interface DataBarProps {
  metrics: SnapshotMetric[];
  updatedLabel: string;
}

export default function DataBar({ metrics, updatedLabel }: DataBarProps) {
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
    <div id="data-bar" ref={ref} className="bar-shimmer relative card-stack">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-12">
        <p className="font-body text-warm-white/50 text-xs uppercase tracking-[0.2em] text-center mb-6 md:mb-8 font-semibold">
          This week&apos;s intelligence snapshot
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
          {metrics.map((metric, i) => (
            <div
              key={metric.label}
              className="text-center px-4"
              style={{ transitionDelay: `${i * 150}ms` }}
            >
              <div
                className="font-mono font-bold text-warm-white"
                style={{ fontSize: "clamp(2.25rem, 3vw, 2.75rem)" }}
              >
                {metric.prefix}
                <span data-count={metric.value} data-decimals={metric.decimals}>
                  {metric.decimals > 0
                    ? metric.value.toFixed(metric.decimals)
                    : metric.value}
                </span>
                <span
                  className="font-normal text-warm-white/55 ml-1"
                  style={{ fontSize: "clamp(0.85rem, 1.5vw, 1rem)" }}
                >
                  {metric.suffix}
                </span>
              </div>
              <div className="font-body text-warm-white/80 text-sm font-semibold uppercase tracking-[0.15em] mt-3">
                {metric.label}
              </div>
            </div>
          ))}
        </div>
        <p className="font-mono text-warm-white/30 text-xs text-center mt-8">
          {updatedLabel}
        </p>
      </div>
    </div>
  );
}
