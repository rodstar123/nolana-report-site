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
      className="relative flex items-center overflow-hidden"
      style={{
        background: "linear-gradient(to bottom, #faf9f7 0%, #f4f1ec 100%)",
        minHeight: "auto",
      }}
    >
      {/* Subtle teal radial accent */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none hidden lg:block"
        style={{
          background:
            "radial-gradient(ellipse at 75% 50%, rgba(13,115,119,0.04) 0%, transparent 50%)",
        }}
      />

      {/* Content grid */}
      <div className="relative z-10 w-full">
        <div className="w-full max-w-7xl mx-auto px-5 sm:px-10 lg:px-16 py-12 sm:py-16 lg:py-24">
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
            {/* LEFT — Copy + Signup */}
            <div className="flex-1 max-w-xl lg:max-w-lg xl:max-w-xl">
              {/* Brand lockup */}
              <div className="hero-brand opacity-0 flex items-center gap-2.5 mb-5 lg:mb-8">
                <BrandMark size={22} color="#0d7377" />
                <span className="font-body font-bold text-teal text-xs tracking-[0.22em] uppercase">
                  The Nolana Report
                </span>
              </div>

              {/* Read time badge */}
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
                    ~7 min read every Monday
                  </span>
                </span>
              </div>

              {/* Headline — benefit-driven */}
              <h1
                className="hero-title font-display font-extrabold text-navy opacity-0 mb-4 lg:mb-5"
                style={{
                  fontSize: "clamp(1.75rem, 4.5vw, 3.25rem)",
                  lineHeight: 1.08,
                  letterSpacing: "-0.015em",
                }}
              >
                The RGV business briefing that tells you{" "}
                <span className="text-teal">what to do about it</span>
              </h1>

              {/* Supporting copy */}
              <p
                className="hero-tagline font-body text-slate opacity-0 mb-6 lg:mb-8 leading-relaxed"
                style={{
                  fontSize: "clamp(0.9rem, 1.5vw, 1.05rem)",
                  maxWidth: "28rem",
                }}
              >
                Every Monday: scored stories, market signals, and the moves
                smart Valley operators are making &mdash; so you can move first.
              </p>

              {/* Signup form — light variant for white bg */}
              <div className="hero-form opacity-0 mb-5 lg:mb-6 max-w-md">
                <SignupForm variant="light" />
              </div>

              {/* Best for line */}
              <div className="hero-social-proof opacity-0 mb-3 lg:mb-4">
                <p className="font-body text-xs text-slate-light uppercase tracking-[0.12em] font-semibold mb-1.5">
                  Best for
                </p>
                <p className="font-body text-slate text-xs sm:text-[13px] leading-relaxed">
                  logistics operators &middot; contractors &middot;
                  import/exporters &middot; commercial real estate &middot;
                  small business owners &middot; anyone who moves money in the
                  Valley
                </p>
              </div>

              {/* Supporting links */}
              <div className="hero-social-proof opacity-0 flex items-center gap-3 flex-wrap">
                <span className="font-body text-slate-light text-sm">
                  Free forever &mdash;
                </span>
                <a
                  href="#sample-issue"
                  className="font-body text-sm text-teal hover:text-teal-light transition-colors underline underline-offset-2"
                >
                  View sample issue
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
                  Telegram alerts
                </a>
              </div>
            </div>

            {/* RIGHT — iPhone Mockup Image */}
            <div className="flex-shrink-0 flex justify-center lg:justify-end lg:flex-1">
              <div className="hero-mockup opacity-0 relative">
                <Image
                  src="/images/hero-iphone-mockup.webp"
                  alt="iPhone showing The Nolana Report with scored business stories and NRI badges"
                  width={600}
                  height={450}
                  priority
                  className="object-contain rounded-2xl"
                  style={{
                    maxHeight: "260px",
                    width: "auto",
                    filter: "drop-shadow(0 20px 60px rgba(0,0,0,0.15))",
                  }}
                  sizes="(max-width: 768px) 320px, 600px"
                />
                {/* Desktop: larger */}
                <style jsx>{`
                  @media (min-width: 1024px) {
                    :global(.hero-mockup img) {
                      max-height: 420px !important;
                    }
                  }
                `}</style>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom divider line */}
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
