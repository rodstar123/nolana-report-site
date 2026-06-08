"use client";
import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { paywallPulse } from "@/lib/animations";

export default function PaywallBlur() {
  const ctaRef = useRef<HTMLAnchorElement>(null);
  const t = useTranslations("paywallBlur");

  useEffect(() => {
    if (ctaRef.current) paywallPulse(ctaRef.current);
  }, []);

  return (
    <div className="relative -mt-32 pt-32 pb-12 bg-gradient-to-t from-cream-dark from-50% via-cream-dark/90 to-transparent">
      <div className="text-center px-6">
        <p className="font-body text-slate text-base mb-2 font-semibold">
          {t("moreStories")}
        </p>
        <p className="font-body text-slate-light text-sm italic mb-8">
          {t("subtitle")}
        </p>
        <a
          ref={ctaRef}
          href="#signup"
          className="inline-block bg-teal text-warm-white font-body font-bold px-8 py-4 rounded-xl text-base hover:bg-teal-light hover:-translate-y-0.5 transition-all duration-200 min-h-[52px] leading-[24px] shadow-lg shadow-teal/20"
        >
          {t("cta")}
        </a>
        <p className="font-body text-slate-light text-xs mt-4">
          {t("fineprint")}
        </p>
      </div>
    </div>
  );
}
