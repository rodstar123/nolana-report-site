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
      className="relative flex items-center overflow-hidden"
      style={{
        background: "linear-gradient(to bottom, #faf9f7 0%, #f4f1ec 100%)",
        minHeight: "auto",
      }}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none hidden lg:block"
        style={{
          background:
            "radial-gradient(ellipse at 75% 50%, rgba(13,115,119,0.04) 0%, transparent 50%)",
        }}
      />

      <div className="relative z-10 w-full">
        <div className="w-full max-w-7xl mx-auto px-5 sm:px-10 lg:px-16 py-12 sm:py-16 lg:py-24">
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
            <div className="flex-1 max-w-xl lg:max-w-lg xl:max-w-xl">
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

            <div className="flex-shrink-0 flex justify-center lg:justify-end lg:flex-1">
              <div className="hero-mockup opacity-0 relative">
                <Image
                  src="/images/nolana-iphone-hand.png"
                  alt="Hand holding iPhone showing The Nolana Report newsletter with scored business stories"
                  width={400}
                  height={500}
                  priority
                  className="object-contain max-h-[280px] lg:max-h-[460px] w-auto"
                  style={{
                    filter: "drop-shadow(0 16px 48px rgba(0,0,0,0.12))",
                  }}
                  sizes="(max-width: 768px) 280px, 460px"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        aria-hidden="true"
        style={{
          background:
            "linear-gradient(to right, transparent, rgba(13,115,119,0.15), transparent)",
        }}
      />
    </section>
  );
}
