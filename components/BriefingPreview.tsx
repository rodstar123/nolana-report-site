"use client";

import { useEffect, useState } from "react";
import { MOCK_STORIES } from "@/lib/constants";

const PREVIEW = MOCK_STORIES.slice(0, 3);

function scoreStyle(s: number) {
  if (s >= 90)
    return {
      color: "#d4a843",
      bg: "rgba(212,168,67,0.1)",
      border: "rgba(212,168,67,0.28)",
    };
  if (s >= 80)
    return {
      color: "#10a3a8",
      bg: "rgba(16,163,168,0.1)",
      border: "rgba(16,163,168,0.28)",
    };
  return {
    color: "#718096",
    bg: "rgba(113,128,150,0.08)",
    border: "rgba(113,128,150,0.2)",
  };
}

const TAG_COLOR: Record<string, string> = {
  "Industrial Watch": "#d4a843",
  "Cross-Border": "#10a3a8",
  "Gov Watch": "#93c5fd",
  "Business Pulse": "#6ee7b7",
};

export default function BriefingPreview() {
  const [revealed, setRevealed] = useState([false, false, false]);

  useEffect(() => {
    const timers = PREVIEW.map((_, i) =>
      setTimeout(
        () =>
          setRevealed((prev) => {
            const next = [...prev];
            next[i] = true;
            return next;
          }),
        700 + i * 380,
      ),
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="briefing-float relative select-none" aria-hidden="true">
      {/* Ambient glow */}
      <div
        className="absolute -inset-8 -z-10 rounded-3xl blur-3xl pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 40%, rgba(212,168,67,0.18) 0%, rgba(13,115,119,0.1) 55%, transparent 80%)",
        }}
      />

      <div
        className="relative overflow-hidden rounded-2xl"
        style={{
          width: "clamp(300px, 92vw, 390px)",
          background: "rgba(5,11,20,0.97)",
          border: "1px solid rgba(212,168,67,0.16)",
          boxShadow:
            "0 40px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(212,168,67,0.06), inset 0 1px 0 rgba(212,168,67,0.07)",
        }}
      >
        {/* ── From line — email context ── */}
        <div
          className="px-5 py-2 flex items-center gap-2"
          style={{
            background: "rgba(212,168,67,0.03)",
            borderBottom: "1px solid rgba(255,255,255,0.04)",
          }}
        >
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 font-display font-bold text-xs"
            style={{ background: "rgba(212,168,67,0.15)", color: "#d4a843" }}
          >
            N
          </div>
          <div className="flex-1 min-w-0">
            <p
              className="font-body text-xs leading-none"
              style={{ color: "#4a5e6e" }}
            >
              <span style={{ color: "#5a7080" }}>
                briefing@nolanareport.com
              </span>
            </p>
          </div>
          <span
            className="font-mono text-xs flex-shrink-0"
            style={{ color: "#2a3e4e" }}
          >
            Mon 7:00 AM
          </span>
        </div>

        {/* ── Header ── */}
        <div
          className="px-5 pt-4 pb-3.5"
          style={{ borderBottom: "1px solid rgba(212,168,67,0.1)" }}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p
                className="font-body text-xs font-bold uppercase tracking-widest mb-1"
                style={{ color: "#3a5060" }}
              >
                Week of May 19, 2026
              </p>
              <p
                className="font-display font-bold leading-tight"
                style={{ color: "#d4a843", fontSize: "15px" }}
              >
                30 Stories Scored
              </p>
              <p
                className="font-body text-xs mt-0.5"
                style={{ color: "#3a5060" }}
              >
                The Nolana Report &nbsp;·&nbsp; RGV Business Intelligence
              </p>
            </div>
            <div
              className="flex-shrink-0 rounded-md px-2.5 py-1 flex items-center gap-1.5"
              style={{
                background: "rgba(16,185,129,0.08)",
                border: "1px solid rgba(16,185,129,0.2)",
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ background: "#10b981" }}
              />
              <span
                className="font-mono text-xs font-bold"
                style={{ color: "#10b981" }}
              >
                LIVE
              </span>
            </div>
          </div>
        </div>

        {/* ── Stories ── */}
        <div>
          {PREVIEW.map((story, i) => {
            const sc = scoreStyle(story.score);
            const isLast = i === PREVIEW.length - 1;
            return (
              <div
                key={story.score}
                className="px-5 py-4"
                style={{
                  borderBottom: isLast
                    ? "none"
                    : "1px solid rgba(255,255,255,0.04)",
                  transition: "opacity 0.55s ease, transform 0.55s ease",
                  opacity: revealed[i] ? 1 : 0,
                  transform: revealed[i] ? "translateY(0)" : "translateY(10px)",
                  ...(isLast
                    ? {
                        maskImage:
                          "linear-gradient(to bottom, black 0%, black 20%, transparent 90%)",
                        WebkitMaskImage:
                          "linear-gradient(to bottom, black 0%, black 20%, transparent 90%)",
                        paddingBottom: "2.5rem",
                      }
                    : {}),
                }}
              >
                <div className="flex items-start gap-3">
                  {/* Score badge */}
                  <div
                    className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center font-mono font-bold text-xs"
                    style={{
                      color: sc.color,
                      background: sc.bg,
                      border: `1px solid ${sc.border}`,
                    }}
                  >
                    {story.score}
                  </div>
                  <div className="flex-1 min-w-0">
                    {/* Tag */}
                    <p
                      className="font-body text-xs font-bold uppercase tracking-widest mb-1.5"
                      style={{ color: TAG_COLOR[story.tag] ?? "#718096" }}
                    >
                      {story.tag}
                    </p>
                    {/* Headline */}
                    <p
                      className="font-body font-semibold text-sm leading-snug line-clamp-2"
                      style={{ color: "#dde4ec" }}
                    >
                      {story.headline}
                    </p>
                    {/* Why it matters — first two stories only */}
                    {i < 2 && (
                      <p
                        className="font-body text-xs mt-1.5 leading-relaxed line-clamp-2"
                        style={{ color: "#3a5060" }}
                      >
                        <span style={{ color: "#4a6272" }}>
                          Why it matters:
                        </span>{" "}
                        {story.whyItMatters}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Footer ── */}
        <div
          className="px-5 py-3 flex items-center justify-between"
          style={{
            borderTop: "1px solid rgba(255,255,255,0.04)",
            background: "rgba(212,168,67,0.02)",
          }}
        >
          <span className="font-body text-xs" style={{ color: "#2e4050" }}>
            + 27 more stories in this edition
          </span>
          <span
            className="font-mono text-xs font-bold tracking-wider"
            style={{ color: "#d4a843" }}
          >
            PRO EDITION →
          </span>
        </div>
      </div>
    </div>
  );
}
