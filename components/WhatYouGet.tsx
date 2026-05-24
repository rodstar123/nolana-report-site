"use client";
import SectionReveal from "./SectionReveal";

type Section = {
  num: string;
  title: string;
  accent: string;
  accentSoft: string;
  tagline: string;
  sample: string;
  exclusive: boolean;
  icon: React.ReactNode;
};

const SECTIONS: Section[] = [
  {
    num: "01",
    title: "New Business Pulse",
    accent: "#0d7377",
    accentSoft: "rgba(13,115,119,0.10)",
    tagline: "Who's opening, expanding, or closing — before the signs go up.",
    sample: "HEB breaks ground on third Valley store — 400 jobs expected",
    exclusive: false,
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-6 h-6"
        aria-hidden="true"
      >
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9,22 9,12 15,12 15,22" />
      </svg>
    ),
  },
  {
    num: "02",
    title: "Gov & Economic Watch",
    accent: "#1a2332",
    accentSoft: "rgba(26,35,50,0.10)",
    tagline: "Permits, grants, and zoning moves that shape your market.",
    sample: "McAllen approves $2.3M downtown streetscape grant",
    exclusive: false,
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-6 h-6"
        aria-hidden="true"
      >
        <line x1="3" y1="22" x2="21" y2="22" />
        <rect x="2" y="8" width="20" height="14" rx="1" />
        <path d="M12 2L2 8h20L12 2z" />
        <line x1="8" y1="12" x2="8" y2="18" />
        <line x1="12" y1="12" x2="12" y2="18" />
        <line x1="16" y1="12" x2="16" y2="18" />
      </svg>
    ),
  },
  {
    num: "03",
    title: "Cross-Border & Trade",
    accent: "#d4a843",
    accentSoft: "rgba(212,168,67,0.12)",
    tagline:
      "Bridge waits, FX shifts, and tariff changes — the numbers that move the Valley.",
    sample: "USD/MXN hits 19.85 — cross-border shoppers surge at La Plaza",
    exclusive: false,
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-6 h-6"
        aria-hidden="true"
      >
        <line x1="2" y1="12" x2="22" y2="12" />
        <polyline points="8,6 2,12 8,18" />
        <polyline points="16,6 22,12 16,18" />
      </svg>
    ),
  },
  {
    num: "04",
    title: "Community Buzz",
    accent: "#6366f1",
    accentSoft: "rgba(99,102,241,0.10)",
    tagline: "Events, sentiment, and the stories everyone's talking about.",
    sample: "SpaceX 12th launch draws thousands to Isla Blanca Park",
    exclusive: false,
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-6 h-6"
        aria-hidden="true"
      >
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    num: "05",
    title: "Industrial & Investment Watch",
    accent: "#d4a843",
    accentSoft: "rgba(212,168,67,0.18)",
    tagline:
      "Manufacturing moves, corporate relocations, and the big money bets.",
    sample: "Monterrey auto supplier announces $14M Edinburg FTZ facility",
    exclusive: true,
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-6 h-6"
        aria-hidden="true"
      >
        <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
        <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
        <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
        <path d="M10 6h4" />
        <path d="M10 10h4" />
        <path d="M10 14h4" />
        <path d="M10 18h4" />
      </svg>
    ),
  },
];

function SectionCard({ section }: { section: Section }) {
  return (
    <div
      className="group rounded-xl overflow-hidden border border-cream-dark hover:-translate-y-1 hover:shadow-xl transition-all duration-300 h-full flex flex-col"
      style={{
        background: section.exclusive
          ? "rgba(212,168,67,0.04)"
          : "var(--warm-white)",
      }}
    >
      {/* Top accent bar */}
      <div
        className="h-1 w-full flex-shrink-0"
        style={{ background: section.accent }}
      />

      {/* Intel Exclusive banner */}
      {section.exclusive && (
        <div
          className="flex items-center gap-2 px-5 py-2"
          style={{ background: "rgba(212,168,67,0.14)" }}
        >
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-3.5 h-3.5 flex-shrink-0"
            style={{ color: "#b8860b" }}
            aria-hidden="true"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          <span
            className="font-body font-bold uppercase tracking-widest text-xs"
            style={{ color: "#b8860b" }}
          >
            Intel Exclusive
          </span>
        </div>
      )}

      {/* Card body */}
      <div className="p-6 flex flex-col flex-1">
        {/* Icon row */}
        <div className="flex items-start justify-between mb-5">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
            style={{
              background: section.accentSoft,
              color: section.accent === "#d4a843" ? "#b8860b" : section.accent,
            }}
          >
            {section.icon}
          </div>
          <span
            className="font-mono text-xs font-semibold mt-1"
            style={{ color: section.accent, opacity: 0.7 }}
          >
            {section.num}
          </span>
        </div>

        {/* Title + tagline */}
        <h3
          className="font-display font-bold mb-2 leading-snug"
          style={{
            fontSize: "1.2rem",
            color: section.exclusive ? "#b8860b" : "var(--charcoal)",
          }}
        >
          {section.title}
        </h3>
        <p className="font-body text-slate text-[15px] leading-relaxed mb-5 flex-1">
          {section.tagline}
        </p>

        {/* Sample headline — teaser preview */}
        <div
          className="border-t pt-4"
          style={{ borderColor: "var(--cream-dark)" }}
        >
          <p
            className="font-body text-xs uppercase tracking-widest mb-1.5"
            style={{ color: section.accent, opacity: 0.75 }}
          >
            This week
          </p>
          <p
            className="font-editorial italic text-[13px] leading-snug"
            style={{ color: "var(--slate-light)" }}
          >
            &ldquo;{section.sample}&rdquo;
          </p>
        </div>
      </div>
    </div>
  );
}

export default function WhatYouGet() {
  const top = SECTIONS.slice(0, 3);
  const bottom = SECTIONS.slice(3);

  return (
    <section className="bg-cream card-stack py-24">
      <div className="max-w-6xl mx-auto px-6">
        <SectionReveal>
          <div className="text-center mb-16">
            <span className="section-label justify-center mb-4">
              The Weekly Briefing
            </span>
            <h2
              className="font-display font-bold text-navy mt-4 mb-4"
              style={{ fontSize: "clamp(1.75rem, 4vw, 2.75rem)" }}
            >
              Everything that moves the needle
            </h2>
            <p className="font-body text-slate max-w-xl mx-auto text-lg leading-relaxed">
              Every Monday, five sections cover every angle of Valley business —
              so you don&apos;t have to chase the news yourself.
            </p>
          </div>
        </SectionReveal>

        {/* Top row — 3 cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {top.map((section, i) => (
            <SectionReveal key={section.title} delay={i * 0.08}>
              <SectionCard section={section} />
            </SectionReveal>
          ))}
        </div>

        {/* Bottom row — 2 cards centered */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="hidden md:block" aria-hidden="true" />
          {bottom.map((section, i) => (
            <SectionReveal key={section.title} delay={(i + 3) * 0.08}>
              <SectionCard section={section} />
            </SectionReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
