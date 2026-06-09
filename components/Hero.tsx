"use client";
import { useEffect } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { heroEntrance } from "@/lib/animations";

import SignupForm from "./SignupForm";

export default function Hero() {
  const t = useTranslations("hero");

  useEffect(() => {
    heroEntrance();
  }, []);

  return (
    <section
      id="signup"
      className="relative overflow-hidden"
      style={{ minHeight: "600px" }}
    >
      <div className="flex flex-col md:flex-row" style={{ minHeight: "600px" }}>
        {/* LEFT — solid cream content area */}
        <div
          className="relative z-10 w-full md:w-[58%] flex items-center"
          style={{ background: "#EDE8E0" }}
        >
          <div className="w-full px-6 sm:px-10 lg:pl-16 lg:pr-10 xl:pl-20 xl:pr-12 py-14 sm:py-16 lg:py-20">
            <div className="max-w-xl">
              <div className="hero-brand opacity-0 mb-5 lg:mb-8">
                <span className="font-body font-bold text-teal text-xs tracking-[0.22em] uppercase">
                  {t("brand")}
                </span>
              </div>

              <div className="hero-label opacity-0 mb-4 lg:mb-6">
                <span className="inline-flex items-center gap-2 bg-teal/8 border border-teal/15 rounded-full px-3.5 py-1.5">
                  <svg
                    className="w-3.5 h-3.5 text-teal"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <circle cx="12" cy="12" r="10" strokeWidth={2} />
                    <polyline
                      points="12 6 12 12 16 14"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="font-body text-teal text-xs font-semibold tracking-wide">
                    {t("readTime")}
                  </span>
                </span>
              </div>

              <h1
                className="hero-title font-display font-extrabold text-navy opacity-0 mb-4 lg:mb-5"
                style={{
                  fontSize: "clamp(1.75rem, 4.5vw, 3.25rem)",
                  lineHeight: 1.08,
                  letterSpacing: "-0.015em",
                }}
              >
                {t.rich("headline", {
                  highlight: (chunks) => (
                    <span className="text-teal">{chunks}</span>
                  ),
                })}
              </h1>

              <p
                className="hero-tagline font-body text-slate opacity-0 mb-6 lg:mb-8 leading-relaxed"
                style={{
                  fontSize: "clamp(0.9rem, 1.5vw, 1.05rem)",
                  maxWidth: "28rem",
                }}
              >
                {t("tagline")}
              </p>

              <div className="hero-form opacity-0 mb-5 lg:mb-6 max-w-md">
                <SignupForm variant="light" />
              </div>

              <div className="hero-social-proof opacity-0 mb-3 lg:mb-4">
                <p className="font-body text-xs text-slate-light uppercase tracking-[0.12em] font-semibold mb-1.5">
                  {t("bestForLabel")}
                </p>
                <p className="font-body text-slate text-xs sm:text-[13px] leading-relaxed">
                  {t("bestForList")}
                </p>
              </div>

              <div className="hero-social-proof opacity-0 flex items-center gap-3 flex-wrap">
                <span className="font-body text-slate-light text-sm">
                  {t("freeForever")}
                </span>
                <a
                  href="#sample-issue"
                  className="font-body text-sm text-teal hover:text-teal-light transition-colors underline underline-offset-2"
                >
                  {t("viewSample")}
                </a>
                <span className="text-slate-light/40">&middot;</span>
                <a
                  href="https://t.me/NolanaReport"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-body text-sm text-slate-light hover:text-[#229ED9] transition-colors inline-flex items-center gap-1.5"
                >
                  <svg
                    className="w-3.5 h-3.5 text-[#229ED9]"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                  </svg>
                  {t("telegramAlerts")}
                </a>
              </div>
            </div>
          </div>

          {/* Teal accent divider — visible on desktop only */}
          <div
            className="hidden md:block absolute top-0 right-0 w-[3px] h-full z-20"
            aria-hidden="true"
            style={{ background: "#2A9D8F" }}
          />
        </div>

        {/* RIGHT — hero image, edge-to-edge */}
        <div className="relative w-full md:w-[42%]">
          {/* Mobile: fixed height with bottom fade */}
          <div className="block md:hidden relative" style={{ height: "280px" }}>
            <Image
              src="/images/nolana-report-hero-2.png"
              alt="Business professional reading The Nolana Report"
              fill
              priority
              className="hero-mockup opacity-0 object-cover object-top"
              sizes="100vw"
            />
            <div
              className="absolute inset-0 pointer-events-none"
              aria-hidden="true"
              style={{
                background:
                  "linear-gradient(to bottom, transparent 70%, #EDE8E0 100%)",
              }}
            />
          </div>

          {/* Desktop: fills the column */}
          <div className="hidden md:block absolute inset-0">
            <Image
              src="/images/nolana-report-hero-2.png"
              alt="Business professional reading The Nolana Report"
              fill
              priority
              className="hero-mockup opacity-0 object-cover object-center"
              sizes="42vw"
            />
          </div>
        </div>
      </div>

      <div
        className="absolute bottom-0 left-0 right-0 h-px z-10"
        aria-hidden="true"
        style={{
          background:
            "linear-gradient(to right, transparent, rgba(13,115,119,0.15), transparent)",
        }}
      />
    </section>
  );
}
