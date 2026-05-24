"use client";
import { useRef, useEffect } from "react";
import SectionReveal from "./SectionReveal";
import { whatYouGetRows } from "@/lib/animations";

type Section = {
  num: string;
  title: string;
  accent: string;
  accentSoft: string;
  scoreBg: string;
  tagline: string;
  sample: string;
  score: number;
  sourceLabel: string;
  exclusive: boolean;
  icon: React.ReactNode;
};

const SECTIONS: Section[] = [
  {
    num: "01",
    title: "New Business Pulse",
    accent: "#0d7377",
    accentSoft: "rgba(13,115,119,0.10)",
    scoreBg: "rgba(13,115,119,0.12)",
    tagline: "Who's opening, expanding, or closing — before the signs go up.",
    sample: "HEB breaks ground on third Valley store — 400 jobs expected",
    score: 87,
    sourceLabel: "RGV Business Monitor",
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
    scoreBg: "rgba(26,35,50,0.12)",
    tagline: "Permits, grants, and zoning moves that shape your market.",
    sample: "McAllen approves $2.3M downtown streetscape grant",
    score: 74,
    sourceLabel: "City Hall",
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
    accent: "#c49a30",
    accentSoft: "rgba(196,154,48,0.12)",
    scoreBg: "rgba(196,154,48,0.15)",
    tagline:
      "Bridge waits, FX shifts, and tariff changes — the numbers that move the Valley.",
    sample: "USD/MXN hits 19.85 — cross-border shoppers surge at La Plaza",
    score: 82,
    sourceLabel: "Border Report",
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
    scoreBg: "rgba(99,102,241,0.12)",
    tagline: "Events, sentiment, and the stories everyone's talking about.",
    sample: "SpaceX 12th launch draws thousands to Isla Blanca Park",
    score: 68,
    sourceLabel: "SpaceX | Isla Blanca",
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
    scoreBg: "rgba(212,168,67,0.20)",
    tagline:
      "Manufacturing moves, corporate relocations, and the big money bets.",
    sample: "Monterrey auto supplier announces $14M Edinburg FTZ facility",
    score: 91,
    sourceLabel: "FTZ Filing",
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

interface RowProps {
  section: Section;
  isLast: boolean;
}

function SectionRow({ section, isLast }: RowProps) {
  const ex = section.exclusive;
  const accentColor = ex ? "#b8860b" : section.accent;
  const scoreColor = ex ? "#b8860b" : section.accent;
  const scoreBg = ex ? "rgba(212,168,67,0.22)" : section.scoreBg;

  return (
    <div
      className={`group relative whatyouget-row ${!isLast ? "border-b" : ""}`}
      style={{
        borderLeftWidth: "4px",
        borderLeftStyle: "solid",
        borderLeftColor: accentColor,
        borderBottomColor: "var(--cream-dark)",
        background: ex ? "rgba(212,168,67,0.038)" : "var(--warm-white)",
      }}
    >
      {/* Watermark number */}
      <span
        className="absolute top-1/2 -translate-y-1/2 left-4 font-display font-bold pointer-events-none select-none"
        style={{
          fontSize: "clamp(72px, 8.5vw, 96px)",
          lineHeight: 1,
          color: "var(--charcoal)",
          opacity: 0.07,
          zIndex: 0,
        }}
        aria-hidden="true"
      >
        {section.num}
      </span>

      {/* Translating content shell */}
      <div
        className="relative z-10 flex flex-col md:flex-row w-full transition-transform duration-200 ease-out group-hover:translate-x-[4px]"
        style={{ willChange: "transform" }}
      >
        {/* Left: icon + title + tagline */}
        <div className="flex items-center gap-5 flex-1 py-6 pl-10 pr-6 md:py-8 md:pl-16 md:pr-10">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: section.accentSoft, color: accentColor }}
          >
            {section.icon}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <h3
                className="font-display font-bold leading-tight"
                style={{
                  fontSize: "clamp(1.05rem, 1.7vw, 1.3rem)",
                  color: accentColor,
                }}
              >
                {section.title}
              </h3>

              {ex && (
                <span
                  className="inline-flex items-center gap-1.5 font-body font-bold uppercase tracking-widest flex-shrink-0 cursor-default"
                  style={{
                    fontSize: "9.5px",
                    padding: "2px 7px",
                    borderRadius: "3px",
                    background: "rgba(212,168,67,0.18)",
                    color: "#b8860b",
                    border: "1px solid rgba(212,168,67,0.42)",
                  }}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-2.5 h-2.5 flex-shrink-0"
                    aria-hidden="true"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  Intel Exclusive
                </span>
              )}
            </div>

            <p
              className="font-body text-[15px] leading-relaxed"
              style={{ color: "var(--slate)" }}
            >
              {section.tagline}
            </p>
          </div>
        </div>

        {/* Right: mini story card */}
        <div
          className="flex-shrink-0 w-full md:w-72 lg:w-80 px-6 py-5 md:py-8 border-t md:border-t-0 md:border-l flex flex-col justify-center gap-2.5"
          style={{
            borderColor: "var(--cream-dark)",
            background: ex ? "rgba(212,168,67,0.05)" : "transparent",
          }}
        >
          <div className="flex items-center gap-2.5 flex-wrap">
            <span
              className="inline-flex items-center gap-1 font-mono font-bold rounded"
              style={{
                fontSize: "11px",
                padding: "2px 7px",
                background: scoreBg,
                color: scoreColor,
                letterSpacing: "0.02em",
              }}
            >
              ▲ {section.score}
            </span>
            <span
              className="font-mono uppercase tracking-wider"
              style={{ fontSize: "10px", color: "var(--slate-light)" }}
            >
              {section.sourceLabel}
            </span>
          </div>

          <p
            className="font-editorial italic leading-snug"
            style={{
              fontSize: "13.5px",
              color: "var(--charcoal)",
              opacity: ex ? 1 : 0.85,
            }}
          >
            &ldquo;{section.sample}&rdquo;
          </p>
        </div>
      </div>
    </div>
  );
}

export default function WhatYouGet() {
  const rowContainerRef = useRef<HTMLDivElement>(null);
  const fired = useRef(false);

  useEffect(() => {
    const el = rowContainerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !fired.current) {
          fired.current = true;
          observer.disconnect();
          whatYouGetRows(el);
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      className="bg-cream card-stack py-24 relative overflow-hidden"
      style={{
        background: "linear-gradient(to bottom, #f4f1ec 0%, #e8e3db 100%)",
      }}
    >
      {/* Ambient teal orbs */}
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
      <div
        className="ambient-orb"
        style={
          {
            width: "40px",
            height: "40px",
            top: "68%",
            right: "7%",
            "--float-duration": "12s",
            "--float-delay": "-5s",
          } as React.CSSProperties
        }
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        {/* Header */}
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

        {/* Magazine TOC rows */}
        <SectionReveal>
          <div
            ref={rowContainerRef}
            className="rounded-xl overflow-hidden"
            style={{ border: "1px solid var(--cream-dark)" }}
          >
            {SECTIONS.map((section, i) => (
              <SectionRow
                key={section.num}
                section={section}
                isLast={i === SECTIONS.length - 1}
              />
            ))}
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}
