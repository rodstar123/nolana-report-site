import { AGENT_CARDS } from "@/lib/constants";
import SectionReveal from "./SectionReveal";

const ICONS: Record<string, JSX.Element> = {
  "New Business Pulse": (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-6 h-6"
    >
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9,22 9,12 15,12 15,22" />
    </svg>
  ),
  "Gov & Economic Watch": (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-6 h-6"
    >
      <line x1="3" y1="22" x2="21" y2="22" />
      <rect x="2" y="8" width="20" height="14" rx="1" />
      <path d="M12 2L2 8h20L12 2z" />
      <line x1="8" y1="12" x2="8" y2="18" />
      <line x1="12" y1="12" x2="12" y2="18" />
      <line x1="16" y1="12" x2="16" y2="18" />
    </svg>
  ),
  "Cross-Border & Trade": (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-6 h-6"
    >
      <line x1="2" y1="12" x2="22" y2="12" />
      <polyline points="8,6 2,12 8,18" />
      <polyline points="16,6 22,12 16,18" />
    </svg>
  ),
  "Community Buzz": (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-6 h-6"
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.64 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.18 6.18l.98-1.9a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  ),
  "Industrial & Investment Watch": (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-6 h-6"
    >
      <rect x="2" y="7" width="20" height="15" rx="1" />
      <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
      <line x1="12" y1="12" x2="12" y2="16" />
      <line x1="10" y1="14" x2="14" y2="14" />
    </svg>
  ),
};

const CARD_ACCENT: Record<
  string,
  { color: string; iconBg: string; iconColor: string }
> = {
  "New Business Pulse": {
    color: "#0d7377",
    iconBg: "rgba(13,115,119,0.1)",
    iconColor: "#0d7377",
  },
  "Gov & Economic Watch": {
    color: "#6366f1",
    iconBg: "rgba(99,102,241,0.1)",
    iconColor: "#6366f1",
  },
  "Cross-Border & Trade": {
    color: "#10a3a8",
    iconBg: "rgba(16,163,168,0.1)",
    iconColor: "#10a3a8",
  },
  "Community Buzz": {
    color: "#718096",
    iconBg: "rgba(113,128,150,0.1)",
    iconColor: "#718096",
  },
  "Industrial & Investment Watch": {
    color: "#d4a843",
    iconBg: "rgba(212,168,67,0.18)",
    iconColor: "#b8860b",
  },
};

export default function WhatYouGet() {
  return (
    <section className="bg-cream card-stack py-24">
      <div className="max-w-6xl mx-auto px-6">
        <SectionReveal>
          <div className="text-center mb-16">
            <span className="section-label justify-center mb-4">
              The Weekly Briefing
            </span>
            <h2 className="font-display font-bold text-navy text-4xl mt-4 mb-4">
              Five sections. Every story scored.
            </h2>
            <p className="font-editorial text-slate max-w-xl mx-auto text-lg leading-relaxed">
              Our AI agents scan 200+ sources each week and surface only what
              moves the needle for RGV businesses.
            </p>
          </div>
        </SectionReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {AGENT_CARDS.map((card, i) => {
            const isGold = card.title === "Industrial & Investment Watch";
            const accent = CARD_ACCENT[card.title] ?? {
              color: "#0d7377",
              iconBg: "rgba(13,115,119,0.1)",
              iconColor: "#0d7377",
            };
            return (
              <SectionReveal key={card.title} delay={i * 0.08}>
                <div
                  className="rounded-xl p-6 md:p-8 border border-l-4 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group h-full"
                  style={{
                    background: isGold
                      ? "rgba(212,168,67,0.05)"
                      : "var(--warm-white)",
                    borderColor: "var(--cream-dark)",
                    borderLeftColor: accent.color,
                  }}
                >
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center mb-5 transition-colors duration-300"
                    style={{
                      background: isGold
                        ? "rgba(212,168,67,0.18)"
                        : accent.iconBg,
                      color: accent.iconColor,
                    }}
                    aria-hidden="true"
                  >
                    {ICONS[card.title]}
                  </div>
                  <h3
                    className="font-display font-bold text-charcoal text-xl mb-2"
                    style={isGold ? { color: "#b8860b" } : {}}
                  >
                    {card.title}
                  </h3>
                  <p className="font-body text-slate text-[15px] leading-relaxed">
                    {card.description}
                  </p>
                  {isGold && (
                    <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-body font-bold uppercase tracking-widest text-gold/80">
                      <span className="w-2 h-2 rounded-full bg-gold inline-block" />
                      Intel Exclusive
                    </div>
                  )}
                </div>
              </SectionReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
