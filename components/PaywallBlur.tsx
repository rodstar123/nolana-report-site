"use client";
import { useEffect, useRef } from "react";
import { paywallPulse } from "@/lib/animations";

export default function PaywallBlur() {
  const ctaRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (ctaRef.current) paywallPulse(ctaRef.current);
  }, []);

  return (
    <div className="relative -mt-16 pt-16 pb-8 bg-gradient-to-t from-cream via-cream/95 to-transparent">
      <div className="text-center px-6">
        <p className="font-editorial text-slate italic mb-6 text-base">
          + 26 more stories this week — scored, sourced, and summarized.
        </p>
        <a
          ref={ctaRef}
          href="#pricing"
          className="inline-block bg-teal text-warm-white font-body font-bold px-8 py-3 rounded-lg text-sm hover:bg-teal-light transition-colors duration-200 min-h-[44px] leading-[28px]"
        >
          Get the full brief every Monday →
        </a>
      </div>
    </div>
  );
}
