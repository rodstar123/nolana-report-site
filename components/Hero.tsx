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
    <section id="signup" className="relative overflow-hidden pt-16">
      {/* ===== DESKTOP (md+): full-width bg image + gradient overlay ===== */}
      <div className="hidden md:block" style={{ minHeight: "600px" }}>
        <div className="absolute inset-0">
          <div className="hero-mockup opacity-0 absolute inset-0">
            <Image
              src="/images/nolana-website-cover.png"
              alt="Business professional reading The Nolana Report"
              fill
              priority
              className="object-cover"
              style={{ objectPosition: "80% 10%" }}
              sizes="100vw"
            />
          </div>
          <div
            className="absolute inset-0 z-[1]"
            aria-hidden="true"
            style={{
              background:
                "linear-gradient(to right, rgba(11,20,38,0.97) 0%, rgba(11,20,38,0.95) 42%, rgba(11,20,38,0.75) 58%, rgba(11,20,38,0.3) 78%, rgba(11,20,38,0.1) 100%)",
            }}
          />
        </div>

        {/* Subtle teal-gold glow at top */}
        <div
          className="absolute inset-0 z-[2] pointer-events-none"
          aria-hidden="true"
          style={{
            background:
              "radial-gradient(ellipse at 30% 0%, rgba(42,157,143,0.12) 0%, rgba(212,168,83,0.06) 30%, transparent 65%)",
          }}
        />

        <div
          className="relative z-[3] w-full flex items-center"
          style={{ minHeight: "600px" }}
        >
          <div className="w-full max-w-7xl mx-auto px-10 lg:px-16 py-16 lg:py-20">
            <div className="max-w-[55%] xl:max-w-[50%]">
              <HeroContent t={t} isMobile={false} />
            </div>
          </div>
        </div>
      </div>

      {/* ===== MOBILE (<md): stacked — image top, content below ===== */}
      <div className="md:hidden flex flex-col">
        {/* Image section */}
        <div className="relative" style={{ height: "300px" }}>
          <div className="hero-mockup opacity-0 absolute inset-0">
            <Image
              src="/images/nolana-website-cover.png"
              alt="Business professional reading The Nolana Report"
              fill
              priority
              className="object-cover"
              style={{ objectPosition: "center 10%" }}
              sizes="100vw"
            />
          </div>
          <div
            className="absolute inset-0 pointer-events-none z-[1]"
            aria-hidden="true"
            style={{
              background:
                "linear-gradient(to bottom, transparent 50%, rgba(11,20,38,1) 100%)",
            }}
          />
        </div>

        {/* Content section */}
        <div
          className="relative"
          style={{
            background: "rgba(11,20,38,1)",
            padding: "24px 20px 32px",
          }}
        >
          {/* Subtle teal-gold glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            aria-hidden="true"
            style={{
              background:
                "radial-gradient(ellipse at 30% 0%, rgba(42,157,143,0.12) 0%, rgba(212,168,83,0.06) 30%, transparent 65%)",
            }}
          />
          <div className="relative z-[1]">
            <HeroContent t={t} isMobile={true} />
          </div>
        </div>
      </div>

      <div
        className="absolute bottom-0 left-0 right-0 h-px z-10"
        aria-hidden="true"
        style={{
          background:
            "linear-gradient(to right, transparent, rgba(42,157,143,0.2), transparent)",
        }}
      />
    </section>
  );
}

function HeroContent({
  t,
  isMobile,
}: {
  t: ReturnType<typeof useTranslations<"hero">>;
  isMobile: boolean;
}) {
  return (
    <>
      <div
        className={`hero-label opacity-0 ${isMobile ? "mb-3" : "mb-4 lg:mb-6"}`}
      >
        <span
          className="inline-flex items-center gap-2 rounded-full px-3 py-1"
          style={{
            border: "1px solid rgba(42,157,143,0.35)",
            background: "rgba(42,157,143,0.1)",
          }}
        >
          <svg
            className="w-3.5 h-3.5"
            style={{ color: "#2A9D8F" }}
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
          <span
            className={`font-body font-semibold tracking-wide ${isMobile ? "text-[11px]" : "text-xs"}`}
            style={{ color: "#2A9D8F" }}
          >
            {t("readTime")}
          </span>
        </span>
      </div>

      <h1
        className={`hero-title font-display font-extrabold opacity-0 ${isMobile ? "mb-4" : "mb-5 lg:mb-6"}`}
        style={{
          fontSize: isMobile ? "28px" : "clamp(1.75rem, 4.5vw, 3.25rem)",
          lineHeight: isMobile ? 1.2 : 1.08,
          letterSpacing: "-0.015em",
          color: "#FFFFFF",
        }}
      >
        {t.rich("headline", {
          highlight: (chunks) => (
            <span style={{ color: "#D4A853" }}>{chunks}</span>
          ),
        })}
      </h1>

      <p
        className={`hero-tagline font-body opacity-0 leading-relaxed ${isMobile ? "mb-5" : "mb-7 lg:mb-8"}`}
        style={{
          fontSize: isMobile ? "15px" : "clamp(0.9rem, 1.5vw, 1.05rem)",
          lineHeight: isMobile ? 1.5 : undefined,
          maxWidth: "28rem",
          color: "#B8C4D0",
        }}
      >
        {t("tagline")}
      </p>

      <div
        className="hero-form opacity-0 max-w-md"
        style={{
          marginTop: isMobile ? "20px" : "28px",
          marginBottom: isMobile ? "20px" : "24px",
        }}
      >
        <SignupForm variant="dark" />
      </div>

      <div
        className={`hero-social-proof opacity-0 ${isMobile ? "mb-2" : "mb-3 lg:mb-4"}`}
        style={{ marginTop: isMobile ? "20px" : "24px" }}
      >
        <p
          className="font-body text-xs uppercase tracking-[0.12em] font-semibold mb-1.5"
          style={{ color: "#2A9D8F" }}
        >
          {t("bestForLabel")}
        </p>
        <p
          className="font-body text-xs sm:text-[13px] leading-relaxed"
          style={{ color: "#8A96AD" }}
        >
          {t("bestForList")}
        </p>
      </div>

      <div className="hero-social-proof opacity-0 flex items-center gap-3 flex-wrap">
        <span className="font-body text-sm" style={{ color: "#8A96AD" }}>
          {t("freeForever")}
        </span>
        <a
          href="#sample-issue"
          className="font-body text-sm transition-colors underline underline-offset-2"
          style={{ color: "#2A9D8F" }}
        >
          {t("viewSample")}
        </a>
        <span style={{ color: "rgba(138,150,173,0.4)" }}>&middot;</span>
        <a
          href="https://t.me/NolanaReport"
          target="_blank"
          rel="noopener noreferrer"
          className="font-body text-sm transition-colors inline-flex items-center gap-1.5"
          style={{ color: "#8A96AD" }}
        >
          <svg
            className="w-3.5 h-3.5"
            style={{ color: "#229ED9" }}
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
          </svg>
          {t("telegramAlerts")}
        </a>
      </div>
    </>
  );
}
