"use client";
import SectionReveal from "./SectionReveal";

interface TierCard {
  tier: string;
  badge: string | null;
  badgeColor: string;
  price: string;
  headline: string;
  items: { label: string; highlight?: boolean }[];
  accent: string;
  accentBg: string;
  borderColor: string;
}

const TIERS: TierCard[] = [
  {
    tier: "Free",
    badge: null,
    badgeColor: "",
    price: "$0",
    headline: "Stay Aware",
    accent: "#0d7377",
    accentBg: "rgba(13,115,119,0.06)",
    borderColor: "rgba(13,115,119,0.2)",
    items: [
      { label: "Business Temperature reading" },
      {
        label:
          "6 scored stories every Monday — including the week's #1 story in full",
      },
      { label: "The Quiet Signal (closing insight)" },
      { label: "Live data bar (USD/MXN, bridge wait)" },
      { label: "Telegram breaking alerts" },
    ],
  },
  {
    tier: "Pro",
    badge: "$7/mo — founding rate",
    badgeColor: "#d4a843",
    price: "$7/mo",
    headline: "Stay Ahead",
    accent: "#0d7377",
    accentBg: "rgba(13,115,119,0.04)",
    borderColor: "rgba(13,115,119,0.35)",
    items: [
      { label: "Everything in Free", highlight: true },
      { label: "Full briefing — all scored stories" },
      { label: "NRI sub-score breakdowns (Money, Urgency, Reach, Risk)" },
      { label: "Valley Money Map" },
      { label: "3 Moves This Week" },
      { label: "Full archive access" },
      { label: "Breaking news email alerts" },
    ],
  },
  {
    tier: "Intel",
    badge: null,
    badgeColor: "",
    price: "$19/mo",
    headline: "See the Bigger Moves",
    accent: "#d4a843",
    accentBg: "rgba(212,168,67,0.04)",
    borderColor: "rgba(212,168,67,0.25)",
    items: [
      { label: "Everything in Pro", highlight: true },
      { label: "Custom keyword alerts" },
      { label: "Monthly Intel deep dives" },
      { label: "Priority access to new features" },
    ],
  },
];

function CheckIcon({ color }: { color: string }) {
  return (
    <svg
      className="w-4 h-4 mt-0.5 flex-shrink-0"
      fill="none"
      stroke={color}
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
  );
}

export default function WhatYouGet() {
  return (
    <section
      className="py-12 md:py-28 relative overflow-hidden"
      style={{
        background: "linear-gradient(to bottom, #f4f1ec 0%, #e8e3db 100%)",
      }}
    >
      <div
        className="ambient-orb"
        style={
          {
            width: "60px",
            height: "60px",
            top: "12%",
            left: "5%",
            "--float-duration": "16s",
            "--float-delay": "0s",
          } as React.CSSProperties
        }
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-6xl mx-auto px-6 lg:px-8">
        <SectionReveal>
          <div className="text-center mb-8 md:mb-16">
            <span className="section-label justify-center mb-4">
              What You Get
            </span>
            <h2
              className="font-display font-bold text-navy mt-4 mb-5"
              style={{ fontSize: "clamp(1.75rem, 4vw, 2.75rem)" }}
            >
              Three tiers. One goal: better decisions.
            </h2>
            <p className="font-body text-slate max-w-xl mx-auto text-lg leading-relaxed">
              Start free. Upgrade when you want the full picture.
            </p>
          </div>
        </SectionReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {TIERS.map((card, i) => (
            <SectionReveal key={card.tier} delay={i * 0.1}>
              <div
                className="relative rounded-2xl p-7 sm:p-8 flex flex-col h-full transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
                style={{
                  background:
                    card.tier === "Pro"
                      ? "var(--warm-white)"
                      : "var(--warm-white)",
                  border: `1.5px solid ${card.borderColor}`,
                }}
              >
                {/* Founding badge */}
                {card.badge && (
                  <div
                    className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-xs font-bold font-body px-4 py-1 rounded-full uppercase tracking-wide whitespace-nowrap shadow-sm"
                    style={{
                      background: card.badgeColor,
                      color: "#1a2332",
                    }}
                  >
                    {card.badge}
                  </div>
                )}

                {/* Tier name + price */}
                <div className="mb-5">
                  <div className="flex items-baseline gap-3 mb-1">
                    <h3
                      className="font-display font-bold text-2xl"
                      style={{ color: card.accent }}
                    >
                      {card.tier}
                    </h3>
                    <span className="font-mono font-bold text-navy text-xl">
                      {card.price}
                    </span>
                  </div>
                  <p className="font-body text-slate text-sm font-semibold">
                    {card.headline}
                  </p>
                </div>

                {/* Feature list */}
                <ul className="space-y-3 flex-1">
                  {card.items.map((item) => (
                    <li
                      key={item.label}
                      className="flex items-start gap-2.5 text-sm font-body"
                    >
                      <CheckIcon color={card.accent} />
                      <span
                        className={
                          item.highlight
                            ? "text-slate font-semibold"
                            : "text-slate"
                        }
                      >
                        {item.label}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <a
                  href={card.tier === "Free" ? "#signup" : "#pricing"}
                  className="mt-6 block w-full text-center py-3 px-6 rounded-xl font-body font-bold text-sm transition-all duration-200 hover:-translate-y-0.5"
                  style={
                    card.tier === "Pro"
                      ? {
                          background: card.accent,
                          color: "#fff",
                        }
                      : {
                          border: `1.5px solid ${card.borderColor}`,
                          color: card.accent,
                        }
                  }
                >
                  {card.tier === "Free"
                    ? "Subscribe Free"
                    : card.tier === "Pro"
                      ? "Join Pro"
                      : "Join Intel"}
                </a>
              </div>
            </SectionReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
