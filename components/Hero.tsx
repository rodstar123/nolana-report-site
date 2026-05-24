"use client";
import { useEffect } from "react";
import { heroEntrance } from "@/lib/animations";
import ParallaxLayer from "./ParallaxLayer";
import SignupForm from "./SignupForm";

export default function Hero() {
  useEffect(() => {
    heroEntrance();
  }, []);

  return (
    <section className="relative min-h-screen flex items-center bg-navy grain-overlay overflow-hidden">
      {/* Layer 1 — video background (slowest parallax 0.3x) */}
      <ParallaxLayer speed={0.3} className="absolute inset-0 z-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover opacity-30 hidden sm:block"
          poster="/images/hero-rgv-golden-hour.webp"
          preload="none"
          aria-hidden="true"
        >
          <source src="/videos/hero-rgv-aerial.mp4" type="video/mp4" />
        </video>
        {/* Mobile: static image instead of video */}
        <div
          className="absolute inset-0 sm:hidden bg-cover bg-center opacity-30"
          style={{
            backgroundImage: "url('/images/hero-rgv-golden-hour.webp')",
          }}
          aria-hidden="true"
        />
        {/* Gradient overlay — 0.35-0.4 opacity top/mid, retains dark base for text */}
        <div className="absolute inset-0 bg-gradient-to-b from-navy-deep/40 via-navy/30 to-navy/85" />
      </ParallaxLayer>

      {/* Layer 2 — ambient shapes (0.6x) */}
      <ParallaxLayer
        speed={0.6}
        className="absolute inset-0 z-0 pointer-events-none"
      >
        <div className="absolute top-1/4 right-1/4 w-72 h-72 rounded-full bg-teal/5 blur-3xl" />
        <div className="absolute bottom-1/3 left-1/6 w-52 h-52 rounded-full bg-gold/5 blur-2xl" />
      </ParallaxLayer>

      {/* Layer 3 — foreground content (1x normal) */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 pt-28 pb-24 text-center w-full">
        <div className="hero-label opacity-0 mb-6 flex justify-center">
          <span className="section-label text-teal-light">
            Business Intelligence for the RGV
          </span>
        </div>

        <h1
          className="hero-title font-display font-extrabold text-warm-white opacity-0 mb-6"
          style={{
            fontSize: "clamp(3rem, 6vw, 4.5rem)",
            lineHeight: 1.12,
            textShadow: "0 2px 20px rgba(0,0,0,0.5)",
          }}
        >
          Lo que se mueve en el Valle
        </h1>

        <p
          className="hero-tagline font-body text-slate-light opacity-0 mb-10 max-w-2xl mx-auto leading-relaxed"
          style={{
            fontSize: "clamp(1.05rem, 2vw, 1.25rem)",
            textShadow: "0 1px 12px rgba(0,0,0,0.4)",
          }}
        >
          Every Monday, we deliver the 30 stories that matter most to your
          business — scored, summarized, and ready to act on.
        </p>

        <div className="flex justify-center mb-8">
          <SignupForm />
        </div>

        <p className="hero-social-proof font-body text-slate-light text-sm opacity-0">
          Join <span className="text-gold font-semibold">18 subscribers</span>{" "}
          already getting the Valley&apos;s sharpest brief
        </p>
      </div>

      {/* Scroll chevron */}
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce"
        aria-hidden="true"
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
