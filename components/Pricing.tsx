"use client";
import { useEffect, useRef, useState } from "react";
import { TIERS } from "@/lib/constants";
import SectionReveal from "./SectionReveal";
import { pricingEntrance } from "@/lib/animations";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { BillingToggle } from "./BillingToggle";
import { trackEvent } from "@/lib/analytics";

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

    // Try to pre-fill email if user is logged in, but never block on it
    let email: string | undefined;
    try {
      const supabase = createSupabaseBrowserClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      email = user?.email ?? undefined;
    } catch {
      // Auth check failed — proceed without email, Stripe will collect it
    }

    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan: tierId, ...(email && { email }) }),
    });
    const data = (await res.json()) as { url?: string; error?: string };
    if (data.url) {
      const eventName = tierId.startsWith("intel")
        ? "subscribe_intel"
        : "upgrade_click";
      trackEvent(eventName, { plan: tierId, source: "pricing" });
      window.location.href = data.url;
    } else {
      setLoadingPlan(null);
    }
  };

  return (
    <section
      ref={sectionRef}
      id="pricing"
      className="relative py-12 md:py-28 card-stack overflow-hidden grid-overlay"
      style={{
        background:
          "radial-gradient(ellipse at center, #1a2332 0%, #0f1722 100%)",
      }}
    >
      {/* Gold drift lines */}
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

      <div className="relative z-10 max-w-6xl mx-auto px-6 lg:px-8">
        <SectionReveal>
          <div className="text-center mb-12">
            <span className="section-label justify-center mb-4">
              <span className="text-teal-light">Pricing</span>
            </span>
            <h2
              className="font-display font-bold text-warm-white mt-4 mb-5"
              style={{ fontSize: "clamp(1.75rem, 4vw, 2.75rem)" }}
            >
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center mb-12">
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
                className={`price-card-${tier.id} relative rounded-2xl p-6 sm:p-8 flex flex-col transition-all duration-300 hover:-translate-y-1 ${
                  tier.highlight
                    ? "glass-nolana !bg-teal/90 !border-teal-light/40 shadow-2xl shadow-teal/20 md:scale-105 -order-1 md:order-none"
                    : "glass-nolana"
                }`}
              >
                {tier.highlight && (
                  <div className="pro-glow" aria-hidden="true" />
                )}

                {tier.highlight && tier.badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gold text-navy-deep text-xs font-bold font-body px-4 py-1.5 rounded-full uppercase tracking-widest whitespace-nowrap shadow-lg">
                    {tier.badge}
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="font-display font-bold text-warm-white text-2xl mb-1">
                    {tier.name}
                  </h3>
                  <p className="font-body text-xs text-teal-light/80 font-semibold mb-4 leading-snug">
                    {tier.tagline}
                  </p>
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="font-mono font-bold text-gold text-4xl">
                      {priceLabel}
                    </span>
                  </div>
                  {showFoundingBadge && (
                    <div className="inline-flex items-center bg-gold/12 border border-gold/25 rounded-lg px-3 py-1.5 mb-3">
                      <span className="text-gold text-xs font-bold font-body">
                        {tier.foundingBadge}
                      </span>
                    </div>
                  )}
                  {showYearlySavings && (
                    <div className="inline-flex items-center bg-gold/12 border border-gold/25 rounded-lg px-3 py-1.5 mb-3">
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
                      <svg
                        className="w-4 h-4 text-teal-light mt-0.5 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
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
                  className={`block w-full text-center py-3.5 px-6 rounded-xl font-body font-bold text-sm transition-all duration-200 min-h-[48px] leading-[28px] cursor-pointer disabled:opacity-60 disabled:cursor-wait hover:-translate-y-0.5 ${
                    tier.highlight
                      ? "bg-warm-white text-navy hover:bg-cream hover:shadow-lg"
                      : "border border-white/15 text-warm-white hover:border-teal hover:text-teal-light hover:shadow-lg hover:shadow-teal/10"
                  }`}
                >
                  {loadingPlan === planId ? "Loading…" : tier.cta}
                </button>
              </div>
            );
          })}
        </div>

        <SectionReveal delay={0.3}>
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 bg-gold/10 border border-gold/20 rounded-lg px-5 py-2.5">
              <svg
                className="w-4 h-4 text-gold flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              <p className="font-body text-gold text-sm font-bold">
                $7/mo founding rate &mdash; locked forever for the first 100
                subscribers
              </p>
            </div>
            <p className="font-body text-warm-white/50 text-xs">
              First month free &middot; Cancel anytime &middot; No contracts
            </p>
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}
