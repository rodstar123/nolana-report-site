"use client";
import { useEffect, useRef, useState } from "react";
import { TIERS } from "@/lib/constants";
import SectionReveal from "./SectionReveal";
import { pricingEntrance } from "@/lib/animations";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { BillingToggle } from "./BillingToggle";

const YEARLY: Record<string, { label: string; savings: string; plan: string }> =
  {
    pro: {
      label: "$89/yr",
      savings: "Save $19 · 2 months free",
      plan: "pro-yearly",
    },
    intel: {
      label: "$189/yr",
      savings: "Save $39 · 2 months free",
      plan: "intel-yearly",
    },
  };

export default function Pricing() {
  const fired = useRef(false);
  const sectionRef = useRef<HTMLElement>(null);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");

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

  const handleCTA = async (tierId: string) => {
    if (tierId === "free") {
      document.getElementById("signup")?.scrollIntoView({ behavior: "smooth" });
      return;
    }

    setLoadingPlan(tierId);

    const supabase = createSupabaseBrowserClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user?.email) {
      // Logged in — go straight to checkout
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: tierId, email: user.email }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (data.url) {
        window.location.href = data.url;
      } else {
        setLoadingPlan(null);
      }
    } else {
      // Not logged in — send to login with plan intent
      window.location.href = `/login?plan=${tierId}`;
    }
  };

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
          <div className="text-center mb-10">
            <span className="section-label justify-center mb-4">
              <span className="text-teal-light">Pricing</span>
            </span>
            <h2 className="font-display font-bold text-warm-white text-4xl mt-4 mb-4">
              One early signal can pay for the whole year.
            </h2>
            <p className="font-editorial text-slate-light text-lg max-w-xl mx-auto leading-relaxed mb-8">
              A new facility, permit, grant, zoning move, or trade shift can
              create opportunities before your competitors notice.
            </p>
            <div className="flex justify-center">
              <BillingToggle value={billing} onChange={setBilling} />
            </div>
          </div>
        </SectionReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center mb-10">
          {TIERS.map((tier) => {
            const isYearly = billing === "yearly";
            const yearly = YEARLY[tier.id];
            const priceLabel =
              isYearly && yearly ? yearly.label : tier.priceLabel;
            const planId = isYearly && yearly ? yearly.plan : tier.id;
            const showFoundingBadge = !!tier.foundingBadge && !isYearly;
            const showYearlySavings = isYearly && !!yearly;

            return (
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
                  <p className="font-body text-xs text-teal-light/80 font-semibold mb-3 leading-snug">
                    {tier.tagline}
                  </p>
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="font-mono font-bold text-gold text-4xl">
                      {priceLabel}
                    </span>
                  </div>
                  {showFoundingBadge && (
                    <div className="inline-flex items-center bg-gold/10 border border-gold/30 rounded-lg px-3 py-1.5 mb-3">
                      <span className="text-gold text-xs font-bold font-body">
                        {tier.foundingBadge}
                      </span>
                    </div>
                  )}
                  {showYearlySavings && (
                    <div className="inline-flex items-center bg-gold/10 border border-gold/30 rounded-lg px-3 py-1.5 mb-3">
                      <span className="text-gold text-xs font-bold font-body">
                        {yearly.savings}
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
                          tier.highlight
                            ? "text-warm-white"
                            : "text-slate-light"
                        }
                      >
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleCTA(planId)}
                  disabled={loadingPlan === planId}
                  className={`block w-full text-center py-3 px-6 rounded-xl font-body font-bold text-sm transition-colors duration-200 min-h-[44px] leading-[28px] cursor-pointer disabled:opacity-60 disabled:cursor-wait ${
                    tier.highlight
                      ? "bg-warm-white text-navy hover:bg-cream"
                      : "border border-white/20 text-warm-white hover:border-teal hover:text-teal-light"
                  }`}
                >
                  {loadingPlan === planId ? "Loading…" : tier.cta}
                </button>
              </div>
            );
          })}
        </div>

        <SectionReveal delay={0.3}>
          <p className="text-center font-body text-slate-light text-sm">
            Cancel anytime. No contracts. Founding member pricing locks in
            permanently for the first 100 Pro subscribers.
          </p>
        </SectionReveal>
      </div>
    </section>
  );
}
