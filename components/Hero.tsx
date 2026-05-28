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
      className="relative min-h-screen flex items-center overflow-hidden"
      style={{ background: "#faf9f7" }}
    >
      {/* Left panel: white background, headline + form */}
      <div className="relative z-10 w-full lg:w-[55%] px-8 lg:px-16 py-24 flex flex-col justify-center min-h-screen">
        <div className="max-w-xl">
          {/* Brand lockup */}
          <div className="hero-brand opacity-0 flex items-center gap-2.5 mb-7">
            <BrandMark size={24} color="#d4a843" />
            <span className="font-body font-bold text-gold text-xs tracking-[0.22em] uppercase">
              The Nolana Report
            </span>
          </div>

          {/* Section label */}
          <div className="hero-label opacity-0 mb-5">
            <span className="section-label !text-teal">
              RGV Business Intelligence
            </span>
          </div>

          {/* Main headline */}
          <h1
            className="hero-title font-display font-extrabold text-charcoal opacity-0 mb-5"
            style={{
              fontSize: "clamp(2.25rem, 5vw, 3.5rem)",
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
            className="hero-tagline font-body text-slate opacity-0 mb-9 leading-relaxed"
            style={{
              fontSize: "clamp(1rem, 1.6vw, 1.125rem)",
              maxWidth: "30rem",
            }}
          >
            30 scored stories. One weekly email. What moves in the Valley
            &mdash; before it hits the news.{" "}
            <span className="text-charcoal font-semibold">
              In your inbox by 7&nbsp;AM.
            </span>
          </p>

          {/* CTA form — light variant */}
          <div className="hero-form opacity-0 mb-5 max-w-md">
            <SignupForm variant="light" />
          </div>

          {/* Supporting links */}
          <div className="hero-social-proof opacity-0 flex items-center gap-1 flex-wrap">
            <span className="font-body text-slate/60 text-sm">
              Free forever &mdash;
            </span>
            <a
              href="#sample-issue"
              className="font-body text-sm text-teal hover:text-teal-light transition-colors underline underline-offset-2"
            >
              View Sample Issue &rarr;
            </a>
          </div>
        </div>
      </div>

      {/* Right panel: navy diagonal with iPhone mockup */}
      <div
        className="hidden lg:flex hero-split-right absolute inset-y-0 right-0 w-[50%] items-center justify-center overflow-hidden"
        style={{
          background: "#0a1628",
        }}
      >
        {/* Teal ambient glow behind phone */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 55% 45%, rgba(13,115,119,0.14) 0%, transparent 60%)",
          }}
        />

        {/* 270 arc motif — large, faded behind phone */}
        <div
          aria-hidden="true"
          className="hero-arc absolute pointer-events-none"
          style={{
            width: "500px",
            height: "500px",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          <BrandMark size={500} color="#d4a843" strokeWidth={0.8} />
        </div>

        {/* iPhone 16 Pro mockup — oversized for impact */}
        <div className="hero-mockup relative z-10 w-full h-full flex items-center justify-center pl-8">
          <Image
            src="/images/hero-iphone-mockup.png"
            alt="iPhone 16 Pro showing The Nolana Report newsletter with scored business stories"
            width={896}
            height={1200}
            priority
            className="object-contain"
            style={{
              width: "min(95%, 560px)",
              height: "auto",
              maxHeight: "92vh",
              filter:
                "drop-shadow(0 20px 60px rgba(0,0,0,0.5)) drop-shadow(0 4px 16px rgba(0,0,0,0.3))",
            }}
          />
        </div>
      </div>

      {/* Mobile: navy accent strip (below form, sm only) */}
      <div
        className="lg:hidden absolute bottom-0 left-0 right-0 h-16"
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
          className="w-5 h-5 text-teal"
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
