"use client";
import { useEffect, useRef } from "react";
import { paywallPulse } from "@/lib/animations";

export default function PaywallBlur() {
  const ctaRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (ctaRef.current) paywallPulse(ctaRef.current);
  }, []);

  return (
    <div className="relative -mt-32 pt-32 pb-12 bg-gradient-to-t from-cream from-50% via-cream/90 to-transparent">
      <div className="text-center px-6">
        <p className="font-body text-slate text-base mb-2 font-semibold">
          + 26 more stories this week
        </p>
        <p className="font-body text-slate-light text-sm italic mb-8">
          Scored, sourced, and summarized — every Monday before 7am.
        </p>
        <a
          ref={ctaRef}
          href="#pricing"
          className="inline-block bg-teal text-warm-white font-body font-bold px-10 py-4 rounded-xl text-base hover:bg-teal-light transition-colors duration-200 min-h-[52px] leading-[24px] shadow-lg shadow-teal/25"
        >
          Get the full brief every Monday →
        </a>
        <p className="font-body text-slate-light text-xs mt-4">
          First month free · Cancel anytime
        </p>
      </div>
    </div>
  );
}
