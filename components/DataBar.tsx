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
      <div className="max-w-6xl mx-auto px-6 py-10">
        <p className="font-body text-warm-white/60 text-xs uppercase tracking-widest text-center mb-6">
          This week&apos;s intelligence snapshot
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
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
                  className="font-normal text-warm-white/65 ml-1"
                  style={{ fontSize: "clamp(0.85rem, 1.5vw, 1rem)" }}
                >
                  {metric.suffix}
                </span>
              </div>
              <div className="font-body text-warm-white text-sm font-semibold uppercase tracking-widest mt-2">
                {metric.label}
              </div>
            </div>
          ))}
        </div>
        <p className="font-mono text-warm-white/35 text-xs text-center mt-6">
          {updatedLabel}
        </p>
      </div>
    </div>
  );
}
