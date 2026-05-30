"use client";
import { useEffect } from "react";
import Image from "next/image";
import { heroEntrance } from "@/lib/animations";
import { BrandMark } from "./BrandMark";
import SignupForm from "./SignupForm";

export default function Hero() {
  useEffect(() => {
    heroEntrance();
  }, []);

  return (
    <section
      id="signup"
      className="relative min-h-screen flex items-center overflow-x-clip overflow-y-visible grid-overlay"
      style={{
        background:
          "linear-gradient(135deg, #0a1628 0%, #0f2035 50%, #0a1628 100%)",
      }}
    >
      <div className="relative z-10 w-full flex flex-col lg:flex-row items-center min-h-screen">
        {/* Left: headline + form */}
        <div className="w-full lg:w-[55%] px-6 sm:px-10 lg:px-16 py-20 lg:py-24 flex flex-col justify-center">
          <div className="max-w-xl">
            {/* Brand lockup */}
            <div className="hero-brand opacity-0 flex items-center gap-2.5 mb-8">
              <BrandMark size={24} color="#d4a843" />
              <span className="font-body font-bold text-gold text-xs tracking-[0.22em] uppercase">
                The Nolana Report
              </span>
            </div>

            {/* Section label */}
            <div className="hero-label opacity-0 mb-5">
              <span className="section-label !text-teal-light">
                RGV Business Intelligence
              </span>
            </div>

            {/* Headline */}
            <h1
              className="hero-title font-display font-extrabold text-warm-white opacity-0 mb-6"
              style={{
                fontSize: "clamp(2.25rem, 5vw, 3.75rem)",
                lineHeight: 1.06,
                letterSpacing: "-0.015em",
              }}
            >
              Lo que se mueve
              <br />
              <span className="text-gold">en el Valle</span>
            </h1>

            {/* Value prop */}
            <p
              className="hero-tagline font-body text-slate-light opacity-0 mb-10 leading-relaxed"
              style={{
                fontSize: "clamp(1rem, 1.6vw, 1.15rem)",
                maxWidth: "30rem",
              }}
            >
              30 scored stories. One weekly email. What moves in the Valley
              &mdash; before it hits the news.{" "}
              <span className="text-warm-white font-semibold">
                In your inbox by 7&nbsp;AM.
              </span>
            </p>

            {/* Signup form — dark variant */}
            <div className="hero-form opacity-0 mb-6 max-w-md">
              <SignupForm variant="dark" />
            </div>

            {/* Supporting links */}
            <div className="hero-social-proof opacity-0 flex items-center gap-1 flex-wrap">
              <span className="font-body text-warm-white/50 text-sm">
                Free forever &mdash;
              </span>
              <a
                href="#sample-issue"
                className="font-body text-sm text-teal-light hover:text-teal transition-colors underline underline-offset-2"
              >
                View Sample Issue &rarr;
              </a>
            </div>

            {/* Telegram */}
            <div className="hero-social-proof opacity-0 mt-4 flex items-center gap-2">
              <svg
                className="w-4 h-4 text-[#229ED9] flex-shrink-0"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
              </svg>
              <a
                href="https://t.me/NolanaReport"
                target="_blank"
                rel="noopener noreferrer"
                className="font-body text-sm text-warm-white/50 hover:text-[#229ED9] transition-colors"
              >
                Instant RGV alerts on Telegram &rarr;
              </a>
            </div>
          </div>
        </div>

        {/* Right: iPhone mockup */}
        <div className="w-full lg:w-[45%] flex items-end justify-end relative pb-8 lg:pb-0 lg:min-h-screen overflow-visible">
          {/* Teal ambient glow */}
          <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse at 60% 45%, rgba(13,115,119,0.15) 0%, transparent 55%)",
            }}
          />

          {/* 270 arc motif */}
          <div
            aria-hidden="true"
            className="hero-arc absolute pointer-events-none"
            style={{
              width: "600px",
              height: "600px",
              top: "50%",
              left: "55%",
              transform: "translate(-50%, -50%)",
            }}
          >
            <BrandMark size={600} color="#d4a843" strokeWidth={0.6} />
          </div>

          {/* Phone — no card, editorial bleed right */}
          <div
            className="hero-mockup relative z-10"
            style={{ marginRight: "-12%", marginBottom: "-2%" }}
          >
            <Image
              src="/images/hero-nolana-mockup.webp"
              alt="iPhone showing The Nolana Report with scored business stories"
              width={673}
              height={731}
              priority
              className="object-contain"
              style={{
                height: "72vh",
                width: "auto",
                maxWidth: "none",
                filter:
                  "drop-shadow(0 32px 80px rgba(0,0,0,0.5)) drop-shadow(0 8px 24px rgba(0,0,0,0.3))",
              }}
            />
          </div>
        </div>
      </div>

      {/* Mobile navy fade at bottom */}
      <div
        className="lg:hidden absolute bottom-0 left-0 right-0 h-20"
        aria-hidden="true"
        style={{
          background: "linear-gradient(to top, #0a1628, transparent)",
        }}
      />

      {/* Scroll chevron */}
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 animate-bounce cursor-pointer"
        aria-label="Scroll to data bar"
        role="button"
        tabIndex={0}
        onClick={() => {
          document
            .getElementById("data-bar")
            ?.scrollIntoView({ behavior: "smooth" });
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ")
            document
              .getElementById("data-bar")
              ?.scrollIntoView({ behavior: "smooth" });
        }}
      >
        <svg
          className="w-5 h-5 text-teal-light"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
    </section>
  );
}
