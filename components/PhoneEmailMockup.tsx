"use client";

import { MOCK_STORIES } from "@/lib/constants";

const STORIES = MOCK_STORIES.slice(0, 3);

function scoreStyle(s: number) {
  if (s >= 90) return { bg: "#fef3c7", text: "#92400e", border: "#fcd34d" };
  if (s >= 80) return { bg: "#ccfbf1", text: "#0d6b70", border: "#5eead4" };
  return { bg: "#e0e7ff", text: "#3730a3", border: "#a5b4fc" };
}

const TAG: Record<string, { bg: string; text: string }> = {
  "Industrial Watch": { bg: "#fef3c7", text: "#92400e" },
  "Cross-Border": { bg: "#ccfbf1", text: "#0d6b70" },
  "Gov Watch": { bg: "#dbeafe", text: "#1e40af" },
  "Business Pulse": { bg: "#d1fae5", text: "#065f46" },
};

export default function PhoneEmailMockup() {
  return (
    /* GSAP targets .hero-preview for opacity + translateX — rotation lives on inner wrapper */
    <div
      className="hero-preview opacity-0 select-none"
      aria-hidden="true"
      style={{ flexShrink: 0, position: "relative" }}
    >
      {/* ── Tilt wrapper ── */}
      <div
        style={{
          position: "relative",
          transform: "rotate(-4deg)",
          transformOrigin: "center 60%",
        }}
      >
        {/* Warm spotlight glow (gold → teal → transparent) */}
        <div
          className="absolute pointer-events-none"
          style={{
            inset: "-80px -55px",
            background:
              "radial-gradient(ellipse at 48% 50%, rgba(212,168,67,0.30) 0%, rgba(13,115,119,0.12) 38%, transparent 66%)",
            filter: "blur(36px)",
            zIndex: 0,
          }}
        />

        {/* ── Hand — right-side grip, dark silhouette (behind phone, z=0) ── */}
        {/* Phone right edge = x≈48 inside this 130px SVG (right:-82px positions SVG so x=48 aligns with phone edge) */}
        <svg
          width="130"
          height="360"
          viewBox="0 0 130 360"
          aria-hidden="true"
          style={{
            position: "absolute",
            right: "-82px",
            top: "95px",
            zIndex: 0,
            filter:
              "drop-shadow(0 14px 32px rgba(0,0,0,0.60)) drop-shadow(0 0 24px rgba(212,168,67,0.10))",
          }}
        >
          {/* Palm body — D-shape, flat left side flush with phone right edge */}
          <path
            d="M 48 26 Q 36 24 34 44 L 32 310 Q 34 348 58 354 L 100 354 Q 128 346 130 314 L 130 44 Q 126 24 106 22 Q 78 18 48 26 Z"
            fill="#1d1208"
          />
          {/* Palm inner highlight — subtle warmth, catches ambient glow */}
          <path
            d="M 52 46 Q 44 46 42 62 L 42 304 Q 44 336 64 341 L 98 341 Q 120 334 122 304 L 122 62 Q 118 48 102 46 Q 78 44 52 46 Z"
            fill="#2d1c10"
            opacity="0.55"
          />

          {/* Index finger knuckle bump */}
          <ellipse cx="48" cy="58" rx="21" ry="26" fill="#1a1006" />
          <ellipse
            cx="57"
            cy="55"
            rx="9"
            ry="14"
            fill="#2d1c10"
            opacity="0.5"
          />

          {/* Middle finger */}
          <ellipse cx="48" cy="118" rx="22" ry="28" fill="#1a1006" />
          <ellipse
            cx="58"
            cy="114"
            rx="10"
            ry="15"
            fill="#2d1c10"
            opacity="0.45"
          />

          {/* Ring finger */}
          <ellipse cx="48" cy="178" rx="21" ry="25" fill="#1a1006" />
          <ellipse
            cx="56"
            cy="175"
            rx="9"
            ry="13"
            fill="#2d1c10"
            opacity="0.4"
          />

          {/* Pinky */}
          <ellipse cx="48" cy="236" rx="16" ry="20" fill="#1a1006" />
          <ellipse
            cx="55"
            cy="233"
            rx="7"
            ry="11"
            fill="#2d1c10"
            opacity="0.35"
          />

          {/* Inter-knuckle crease lines */}
          <path
            d="M 50 86 Q 76 81 110 87"
            stroke="#2d1c10"
            strokeWidth="1.5"
            fill="none"
            opacity="0.45"
          />
          <path
            d="M 50 146 Q 78 141 112 147"
            stroke="#2d1c10"
            strokeWidth="1.5"
            fill="none"
            opacity="0.38"
          />
        </svg>

        {/* ── Phone body (z=1 — covers overlapping knuckle area) ── */}
        <div style={{ position: "relative", zIndex: 1, width: "270px" }}>
          {/* Left volume buttons */}
          {[88, 128].map((top) => (
            <div
              key={top}
              style={{
                position: "absolute",
                left: "-3px",
                top: `${top}px`,
                width: "3px",
                height: "28px",
                background: "#2a2a2e",
                borderRadius: "2px 0 0 2px",
                zIndex: 2,
              }}
            />
          ))}
          {/* Right power button */}
          <div
            style={{
              position: "absolute",
              right: "-3px",
              top: "108px",
              width: "3px",
              height: "52px",
              background: "#2a2a2e",
              borderRadius: "0 2px 2px 0",
              zIndex: 2,
            }}
          />

          {/* Phone frame */}
          <div
            style={{
              background: "#1c1c1e",
              borderRadius: "42px",
              padding: "10px",
              border: "1px solid rgba(255,255,255,0.10)",
              boxShadow:
                "0 50px 120px rgba(0,0,0,0.65), 0 20px 40px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.04)",
            }}
          >
            {/* Screen */}
            <div
              style={{
                width: "100%",
                height: "520px",
                background: "#ffffff",
                borderRadius: "34px",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                position: "relative",
              }}
            >
              {/* Dynamic Island */}
              <div
                style={{
                  position: "absolute",
                  top: "10px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: "76px",
                  height: "22px",
                  background: "#000",
                  borderRadius: "11px",
                  zIndex: 20,
                }}
              />

              {/* Status bar */}
              <div
                style={{
                  height: "42px",
                  paddingTop: "4px",
                  paddingLeft: "20px",
                  paddingRight: "20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexShrink: 0,
                }}
              >
                <span
                  style={{
                    fontFamily: "system-ui, sans-serif",
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "#111827",
                  }}
                >
                  9:41
                </span>
                <div
                  style={{ display: "flex", gap: "5px", alignItems: "center" }}
                >
                  <svg
                    width="15"
                    height="10"
                    viewBox="0 0 15 10"
                    fill="#111827"
                  >
                    <rect x="0" y="5" width="2.5" height="5" rx="0.8" />
                    <rect x="4" y="3" width="2.5" height="7" rx="0.8" />
                    <rect x="8" y="1" width="2.5" height="9" rx="0.8" />
                    <rect
                      x="12"
                      y="0"
                      width="2.5"
                      height="10"
                      rx="0.8"
                      opacity="0.3"
                    />
                  </svg>
                  <svg width="23" height="11" viewBox="0 0 23 11" fill="none">
                    <rect
                      x="0.5"
                      y="0.5"
                      width="18"
                      height="10"
                      rx="2.5"
                      stroke="#111827"
                      strokeWidth="1"
                    />
                    <rect
                      x="1.5"
                      y="1.5"
                      width="14"
                      height="8"
                      rx="1.5"
                      fill="#111827"
                    />
                    <path
                      d="M19.5 3.5v4c1 0 1.5-.9 1.5-2s-.5-2-1.5-2z"
                      fill="#111827"
                    />
                  </svg>
                </div>
              </div>

              {/* Gmail header */}
              <div
                style={{
                  padding: "6px 14px",
                  borderBottom: "1px solid #f3f4f6",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  flexShrink: 0,
                }}
              >
                <span
                  style={{ fontSize: "16px", color: "#374151", lineHeight: 1 }}
                >
                  ←
                </span>
                <span
                  style={{
                    fontFamily: "system-ui, sans-serif",
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "#111827",
                    flex: 1,
                  }}
                >
                  Inbox
                </span>
                <span style={{ fontSize: "13px", color: "#9ca3af" }}>⋮</span>
              </div>

              {/* Subject + sender */}
              <div
                style={{
                  padding: "10px 14px 8px",
                  borderBottom: "1px solid #f3f4f6",
                  flexShrink: 0,
                }}
              >
                <p
                  style={{
                    fontFamily: "system-ui, sans-serif",
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "#111827",
                    marginBottom: "7px",
                    lineHeight: 1.3,
                  }}
                >
                  Week of May 19 — 30 stories scored
                </p>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <div
                    style={{
                      width: "30px",
                      height: "30px",
                      background: "#0f1722",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M18.36 18.36A9 9 0 1 1 18.36 5.64"
                        stroke="#d4a843"
                        strokeWidth="2.5"
                      />
                      <circle cx="12" cy="12" r="2.5" fill="#d4a843" />
                    </svg>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        fontFamily: "system-ui, sans-serif",
                        fontSize: "11px",
                        fontWeight: 600,
                        color: "#374151",
                        lineHeight: 1,
                      }}
                    >
                      The Nolana Report
                    </p>
                    <p
                      style={{
                        fontFamily: "system-ui, sans-serif",
                        fontSize: "9px",
                        color: "#9ca3af",
                        marginTop: "2px",
                      }}
                    >
                      briefing@nolanareport.com
                    </p>
                  </div>
                  <span
                    style={{
                      fontFamily: "system-ui, sans-serif",
                      fontSize: "10px",
                      color: "#9ca3af",
                      flexShrink: 0,
                    }}
                  >
                    Mon 7:00 AM
                  </span>
                </div>
              </div>

              {/* Email body */}
              <div
                style={{ flex: 1, overflow: "hidden", position: "relative" }}
              >
                {/* Brand header — prominent gold, larger than before */}
                <div
                  style={{
                    padding: "11px 14px 9px",
                    borderBottom: "2px solid #fef3c7",
                    background:
                      "linear-gradient(180deg, #fffdf4 0%, #ffffff 100%)",
                    flexShrink: 0,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                      marginBottom: "3px",
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M18.36 18.36A9 9 0 1 1 18.36 5.64"
                        stroke="#d4a843"
                        strokeWidth="2.5"
                      />
                      <circle cx="12" cy="12" r="2.5" fill="#d4a843" />
                    </svg>
                    <span
                      style={{
                        fontFamily: "'Georgia', 'Times New Roman', serif",
                        fontSize: "14px",
                        fontWeight: 700,
                        color: "#d4a843",
                        letterSpacing: "0.07em",
                        textTransform: "uppercase" as const,
                      }}
                    >
                      The Nolana Report
                    </span>
                  </div>
                  <p
                    style={{
                      fontFamily: "system-ui, sans-serif",
                      fontSize: "9.5px",
                      color: "#64748b",
                      letterSpacing: "0.04em",
                      margin: "0 0 4px 0",
                    }}
                  >
                    RGV Business Intelligence
                  </p>
                  <p
                    style={{
                      fontFamily: "system-ui, sans-serif",
                      fontSize: "10px",
                      fontWeight: 600,
                      color: "#374151",
                      lineHeight: 1.4,
                      margin: 0,
                    }}
                  >
                    Your Monday business briefing — 30 stories scored
                  </p>
                </div>

                {/* Stories */}
                {STORIES.map((story, i) => {
                  const sc = scoreStyle(story.score);
                  const tag = TAG[story.tag] ?? {
                    bg: "#f3f4f6",
                    text: "#374151",
                  };
                  return (
                    <div
                      key={story.score}
                      style={{
                        padding: "9px 14px",
                        borderBottom: "1px solid #f9fafb",
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "8px",
                      }}
                    >
                      <div
                        style={{
                          width: "30px",
                          height: "30px",
                          background: sc.bg,
                          border: `1px solid ${sc.border}`,
                          borderRadius: "7px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: "10px",
                          fontWeight: 700,
                          color: sc.text,
                        }}
                      >
                        {story.score}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <span
                          style={{
                            display: "inline-block",
                            background: tag.bg,
                            color: tag.text,
                            fontSize: "7.5px",
                            fontFamily: "system-ui, sans-serif",
                            fontWeight: 700,
                            textTransform: "uppercase" as const,
                            letterSpacing: "0.06em",
                            padding: "2px 5px",
                            borderRadius: "3px",
                            marginBottom: "4px",
                          }}
                        >
                          {story.tag}
                        </span>
                        <p
                          style={
                            {
                              fontFamily: "system-ui, sans-serif",
                              fontSize: "10.5px",
                              fontWeight: 600,
                              color: "#111827",
                              lineHeight: 1.4,
                              overflow: "hidden",
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                            } as React.CSSProperties
                          }
                        >
                          {story.headline}
                        </p>
                        {i === 0 && (
                          <p
                            style={
                              {
                                fontFamily: "system-ui, sans-serif",
                                fontSize: "9px",
                                color: "#6b7280",
                                marginTop: "3px",
                                overflow: "hidden",
                                display: "-webkit-box",
                                WebkitLineClamp: 1,
                                WebkitBoxOrient: "vertical",
                                lineHeight: 1.4,
                              } as React.CSSProperties
                            }
                          >
                            {story.whyItMatters}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Bottom fade */}
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: "90px",
                    background:
                      "linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.85) 50%, #ffffff 100%)",
                    pointerEvents: "none",
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── Thumb — left side, in front of phone (z=3) ── */}
        <svg
          width="28"
          height="102"
          viewBox="0 0 28 102"
          aria-hidden="true"
          style={{
            position: "absolute",
            left: "-10px",
            top: "198px",
            zIndex: 3,
            filter:
              "drop-shadow(-3px 0 12px rgba(0,0,0,0.45)) drop-shadow(0 0 18px rgba(212,168,67,0.08))",
          }}
        >
          {/* Thumb body */}
          <path
            d="M 28 10 Q 24 0 16 0 Q 5 0 2 14 L 0 66 Q 1 86 14 94 Q 24 99 27 88 L 28 76 Z"
            fill="#1d1208"
          />
          {/* Thumb inner — slight warm highlight on pad side */}
          <path
            d="M 25 13 Q 22 5 16 5 Q 10 6 8 17 L 6 62 Q 8 78 16 84"
            stroke="#2d1c10"
            strokeWidth="2.5"
            fill="none"
            opacity="0.55"
          />
        </svg>
      </div>
    </div>
  );
}
