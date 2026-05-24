"use client";
import { useEffect, useRef } from "react";
import { TIERS } from "@/lib/constants";
import SectionReveal from "./SectionReveal";
import { pricingEntrance } from "@/lib/animations";

export default function Pricing() {
  const fired = useRef(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !fired.current) {
          fired.current = true;
          observer.disconnect();
          pricingEntrance();
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="pricing"
      className="relative py-24 card-stack overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse at center, #1a2332 0%, #0f1722 100%)",
      }}
    >
      {/* Ambient gold diagonal lines */}
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
        <div
          className="pricing-gold-line"
          style={
            {
              top: "18%",
              left: "8%",
              "--drift-duration": "25s",
              "--drift-delay": "0s",
            } as React.CSSProperties
          }
        />
        <div
          className="pricing-gold-line"
          style={
            {
              top: "52%",
              left: "38%",
              "--drift-duration": "20s",
              "--drift-delay": "-8s",
            } as React.CSSProperties
          }
        />
        <div
          className="pricing-gold-line"
          style={
            {
              top: "35%",
              left: "72%",
              "--drift-duration": "28s",
              "--drift-delay": "-14s",
            } as React.CSSProperties
          }
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        <SectionReveal>
          <div className="text-center mb-16">
            <span className="section-label justify-center mb-4">
              <span className="text-teal-light">Pricing</span>
            </span>
            <h2 className="font-display font-bold text-warm-white text-4xl mt-4 mb-4">
              Intelligence pays for itself.
            </h2>
            <p className="font-editorial text-slate-light text-lg max-w-xl mx-auto leading-relaxed">
              One call you make faster, one deal you close sooner — the briefing
              covers itself.
            </p>
          </div>
        </SectionReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {TIERS.map((tier) => (
            <div
              key={tier.id}
              className={`price-card-${tier.id} relative rounded-2xl p-8 flex flex-col transition-all duration-300 hover:-translate-y-1 ${
                tier.highlight
                  ? "bg-teal border-2 border-teal-light shadow-2xl shadow-teal/20 md:scale-105"
                  : "bg-navy-deep border border-white/10"
              }`}
            >
              {/* Pro card pulsing glow */}
              {tier.highlight && (
                <div className="pro-glow" aria-hidden="true" />
              )}

              {tier.highlight && tier.badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gold text-navy-deep text-xs font-bold font-body px-4 py-1.5 rounded-full uppercase tracking-widest whitespace-nowrap">
                  {tier.badge}
                </div>
              )}

              <div className="mb-6">
                <h3 className="font-display font-bold text-warm-white text-2xl mb-1">
                  {tier.name}
                </h3>
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="font-mono font-bold text-gold text-4xl">
                    {tier.priceLabel}
                  </span>
                </div>
                {tier.foundingBadge && (
                  <div className="inline-flex items-center bg-gold/10 border border-gold/30 rounded-lg px-3 py-1.5 mb-3">
                    <span className="text-gold text-xs font-bold font-body">
                      {tier.foundingBadge}
                    </span>
                  </div>
                )}
                <p className="font-editorial text-slate-light text-sm leading-relaxed">
                  {tier.description}
                </p>
              </div>

              <ul className="space-y-3 flex-1 mb-8">
                {tier.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2 text-sm font-body"
                  >
                    <span className="text-teal-light mt-0.5 flex-shrink-0">
                      ✓
                    </span>
                    <span
                      className={
                        tier.highlight ? "text-warm-white" : "text-slate-light"
                      }
                    >
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <a
                href={tier.id === "free" ? "#" : "#"}
                className={`block text-center py-3 px-6 rounded-xl font-body font-bold text-sm transition-colors duration-200 min-h-[44px] leading-[28px] cursor-pointer ${
                  tier.highlight
                    ? "bg-warm-white text-navy hover:bg-cream"
                    : "border border-white/20 text-warm-white hover:border-teal hover:text-teal-light"
                }`}
              >
                {tier.cta}
              </a>
            </div>
          ))}
        </div>

        <SectionReveal delay={0.3}>
          <p className="text-center font-body text-slate-light text-sm mt-10">
            Cancel anytime. No contracts. Founding member pricing locks in
            permanently for the first 100 Pro subscribers.
          </p>
        </SectionReveal>
      </div>
    </section>
  );
}
