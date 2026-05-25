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
      className="relative min-h-screen flex items-center grain-overlay overflow-hidden"
      style={{
        background:
          "linear-gradient(150deg, #0a1628 0%, #0b1e22 30%, #0f1722 65%, #111d2e 100%)",
      }}
    >
      {/* Teal ambient — right side, frames the phone */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 80% 55%, rgba(13,115,119,0.13) 0%, transparent 50%)",
        }}
      />
      {/* Gold ambient — top left, frames the headline */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 5% 15%, rgba(212,168,67,0.07) 0%, transparent 40%)",
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-28 w-full">
        <div className="flex flex-col lg:flex-row items-center gap-14 lg:gap-20">
          {/* ── Left column ── */}
          <div className="flex-1 w-full max-w-xl lg:max-w-none">
            {/* Brand lockup */}
            <div className="hero-brand opacity-0 flex items-center gap-2.5 mb-7">
              <BrandMark size={20} color="#d4a843" />
              <span className="font-body font-bold text-gold text-xs tracking-[0.22em] uppercase">
                The Nolana Report
              </span>
            </div>

            {/* Section label */}
            <div className="hero-label opacity-0 mb-5">
              <span className="section-label text-teal-light">
                RGV Business Intelligence
              </span>
            </div>

            {/* Main headline */}
            <h1
              className="hero-title font-display font-extrabold text-warm-white opacity-0 mb-5"
              style={{
                fontSize: "clamp(2.25rem, 5.5vw, 3.75rem)",
                lineHeight: 1.08,
                letterSpacing: "-0.01em",
              }}
            >
              Lo que se mueve
              <br />
              en el Valle
            </h1>

            {/* Subhead */}
            <p
              className="hero-tagline font-body text-slate-light opacity-0 mb-9 leading-relaxed"
              style={{
                fontSize: "clamp(1rem, 1.6vw, 1.125rem)",
                maxWidth: "36rem",
              }}
            >
              Every Monday, get 30 business stories scored by relevance —
              openings, permits, government moves, trade signals, and investment
              activity shaping the Valley.{" "}
              <span className="text-warm-white/70 font-semibold">
                In your inbox by 7 AM.
              </span>
            </p>

            {/* CTA form */}
            <div className="hero-form opacity-0 mb-5 max-w-sm">
              <SignupForm />
            </div>

            {/* Supporting links */}
            <div className="hero-social-proof opacity-0 flex items-center gap-1 flex-wrap">
              <span className="font-body text-slate-light/60 text-sm">
                Free forever —
              </span>
              <a
                href="#sample-issue"
                className="font-body text-sm text-teal-light hover:text-warm-white transition-colors underline underline-offset-2"
              >
                View Sample Issue →
              </a>
            </div>
          </div>

          {/* ── Right column: phone mockup ── */}
          <div className="flex-shrink-0 flex justify-center w-full lg:w-auto">
            <PhoneEmailMockup />
          </div>
        </div>
      </div>

      {/* Scroll chevron */}
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce cursor-pointer"
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
