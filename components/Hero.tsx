"use client";
import { useEffect } from "react";
import { heroEntrance } from "@/lib/animations";
import { BrandMark } from "./BrandMark";
import SignupForm from "./SignupForm";
import PhoneEmailMockup from "./PhoneEmailMockup";

export default function Hero() {
  useEffect(() => {
    heroEntrance();
  }, []);

  return (
    <section
      id="signup"
      className="relative min-h-screen flex items-center overflow-x-clip overflow-y-visible"
      style={{
        background:
          "linear-gradient(135deg, #0a1628 0%, #0f2035 50%, #0a1628 100%)",
      }}
    >
      {/* Diagonal split overlay — darker left, lighter right panel */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none hidden lg:block"
        style={{
          background:
            "linear-gradient(115deg, transparent 0%, transparent 52%, rgba(13,115,119,0.06) 52%, rgba(13,115,119,0.04) 100%)",
        }}
      />

      {/* Teal ambient glow behind phone area */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none hidden lg:block"
        style={{
          background:
            "radial-gradient(ellipse at 72% 45%, rgba(13,115,119,0.15) 0%, transparent 50%)",
        }}
      />

      {/* Gold ambient glow — subtle warmth top-left */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none hidden lg:block"
        style={{
          background:
            "radial-gradient(ellipse at 20% 30%, rgba(212,168,67,0.06) 0%, transparent 40%)",
        }}
      />

      {/* 270 arc motif — faint behind phone */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-0 hidden lg:block overflow-hidden"
      >
        <div
          className="hero-arc absolute pointer-events-none"
          style={{
            width: "500px",
            height: "500px",
            top: "50%",
            right: "2%",
            transform: "translateY(-50%)",
            opacity: 0,
          }}
        >
          <BrandMark size={500} color="#d4a843" strokeWidth={0.5} />
        </div>
      </div>

      {/* Content grid */}
      <div className="relative z-10 w-full min-h-screen flex items-center">
        <div className="w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-20 lg:py-24">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-8">
            {/* LEFT — Copy + Signup */}
            <div className="flex-1 max-w-xl lg:max-w-lg xl:max-w-xl">
              {/* Brand lockup */}
              <div className="hero-brand opacity-0 flex items-center gap-2.5 mb-8">
                <BrandMark size={24} color="#d4a843" />
                <span className="font-body font-bold text-gold text-xs tracking-[0.22em] uppercase">
                  The Nolana Report
                </span>
              </div>

              {/* Read time badge */}
              <div className="hero-label opacity-0 mb-6">
                <span className="inline-flex items-center gap-2 bg-teal/12 border border-teal/25 rounded-full px-4 py-1.5">
                  <svg
                    className="w-3.5 h-3.5 text-teal-light"
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
                  <span className="font-body text-teal-light text-xs font-semibold tracking-wide">
                    ~7 min read every Monday
                  </span>
                </span>
              </div>

              {/* Headline — benefit-driven */}
              <h1
                className="hero-title font-display font-extrabold text-warm-white opacity-0 mb-5"
                style={{
                  fontSize: "clamp(2rem, 4.5vw, 3.25rem)",
                  lineHeight: 1.08,
                  letterSpacing: "-0.015em",
                }}
              >
                The RGV business briefing that tells you{" "}
                <span className="text-gold">what to do about it</span>
              </h1>

              {/* Supporting copy */}
              <p
                className="hero-tagline font-body text-slate-light opacity-0 mb-8 leading-relaxed"
                style={{
                  fontSize: "clamp(0.95rem, 1.5vw, 1.1rem)",
                  maxWidth: "28rem",
                }}
              >
                Every Monday: scored stories, market signals, and the moves
                smart Valley operators are making &mdash; so you can move first.
              </p>

              {/* Signup form */}
              <div className="hero-form opacity-0 mb-6 max-w-md">
                <SignupForm variant="dark" />
              </div>

              {/* Best for line */}
              <div className="hero-social-proof opacity-0 mb-4">
                <p className="font-body text-xs text-warm-white/40 uppercase tracking-[0.12em] font-semibold mb-2">
                  Best for
                </p>
                <p
                  className="font-body text-warm-white/60 leading-relaxed"
                  style={{ fontSize: "13px" }}
                >
                  logistics operators &middot; contractors &middot;
                  import/exporters &middot; commercial real estate &middot;
                  small business owners &middot; anyone who moves money in the
                  Valley
                </p>
              </div>

              {/* Supporting links */}
              <div className="hero-social-proof opacity-0 flex items-center gap-3 flex-wrap">
                <span className="font-body text-warm-white/40 text-sm">
                  Free forever &mdash;
                </span>
                <a
                  href="#sample-issue"
                  className="font-body text-sm text-teal-light hover:text-teal transition-colors underline underline-offset-2"
                >
                  View sample issue
                </a>
                <span className="text-warm-white/20">&middot;</span>
                <a
                  href="https://t.me/NolanaReport"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-body text-sm text-warm-white/40 hover:text-[#229ED9] transition-colors inline-flex items-center gap-1.5"
                >
                  <svg
                    className="w-3.5 h-3.5 text-[#229ED9]"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                  </svg>
                  Telegram alerts
                </a>
              </div>
            </div>

            {/* RIGHT — Phone Mockup */}
            <div className="flex-shrink-0 flex justify-center lg:justify-end lg:flex-1">
              <div className="hero-mockup opacity-0">
                <PhoneEmailMockup />
              </div>
            </div>
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
