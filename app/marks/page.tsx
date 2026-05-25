import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mark Comparison — The Nolana Report",
  robots: { index: false, follow: false },
};

// ── Mark definitions ──────────────────────────────────────────────────────────

function MarkCurrent({
  size,
  color = "#d4a843",
}: {
  size: number;
  color?: string;
}) {
  const sw = size <= 20 ? 3 : 2.5;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      {/* 270° detection arc — gap opens right */}
      <path
        d="M18.36 18.36A9 9 0 1 1 18.36 5.64"
        stroke={color}
        strokeWidth={sw}
        fill="none"
      />
      <circle cx="12" cy="12" r="2.5" fill={color} />
    </svg>
  );
}

function MarkA({ size, color = "#d4a843" }: { size: number; color?: string }) {
  // Ring + diagonal sweep arm (upper-right, 315° SVG = northeast) + center dot
  const sw = size <= 20 ? 2 : 1.75;
  const arm = size <= 20 ? 2.5 : 2;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      {/* Full ring */}
      <circle cx="12" cy="12" r="9" stroke={color} strokeWidth={sw} />
      {/* Sweep arm — center to upper-right edge (315° = NE in SVG) */}
      <line
        x1="12"
        y1="12"
        x2="18.36"
        y2="5.64"
        stroke={color}
        strokeWidth={arm}
        strokeLinecap="round"
      />
      {/* Station dot */}
      <circle cx="12" cy="12" r="1.75" fill={color} />
    </svg>
  );
}

function MarkB({ size, color = "#d4a843" }: { size: number; color?: string }) {
  // Two concentric quarter-circle arcs radiating from lower-left corner + origin dot
  // Origin at (7.5, 16.5). Arcs sweep to upper-right.
  // r=5: end point = (7.5+5*cos(-45°), 16.5+5*sin(-45°)) ≈ (11.04, 12.96)
  // r=9: end point = (7.5+9*cos(-45°), 16.5+9*sin(-45°)) ≈ (13.86, 10.14)
  const sw = size <= 20 ? 2.75 : 2.25;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      {/* Inner arc r=5 — from (7.5,11.5) to (12.5,16.5), quarter turn */}
      <path
        d="M7.5 11.5A5 5 0 0 1 12.5 16.5"
        stroke={color}
        strokeWidth={sw}
        strokeLinecap="round"
        fill="none"
      />
      {/* Outer arc r=9 — from (7.5,7.5) to (16.5,16.5), quarter turn */}
      <path
        d="M7.5 7.5A9 9 0 0 1 16.5 16.5"
        stroke={color}
        strokeWidth={sw}
        strokeLinecap="round"
        fill="none"
      />
      {/* Origin dot at lower-left corner of the arc fan */}
      <circle cx="7.5" cy="16.5" r="1.75" fill={color} />
    </svg>
  );
}

function MarkC({ size, color = "#d4a843" }: { size: number; color?: string }) {
  // Thin ring + sweep arm (pointing upper-right ~300° SVG) + off-center blip dot
  const ringW = size <= 20 ? 1.75 : 1.25;
  const armW = size <= 20 ? 2.25 : 1.75;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      {/* Radar dish ring — thin */}
      <circle cx="12" cy="12" r="9" stroke={color} strokeWidth={ringW} />
      {/* Sweep arm — pointing NNE (300° SVG ≈ 330° compass) */}
      <line
        x1="12"
        y1="12"
        x2="16.5"
        y2="4.2"
        stroke={color}
        strokeWidth={armW}
        strokeLinecap="round"
      />
      {/* Signal blip — off-center detected target, not at origin */}
      <circle cx="15.5" cy="7.5" r="2" fill={color} />
    </svg>
  );
}

// ── Mark config ───────────────────────────────────────────────────────────────

const MARKS = [
  {
    id: "current",
    label: "Current",
    sublabel: "Arc + Dot",
    desc: "270° detection arc, gap right. Two shapes, center focal point.",
    Mark: MarkCurrent,
  },
  {
    id: "a",
    label: "Option A",
    sublabel: "Radar Sweep",
    desc: "Full ring + diagonal sweep arm + center station. Classic radar sweep.",
    Mark: MarkA,
  },
  {
    id: "b",
    label: "Option B",
    sublabel: "Radar Pulse",
    desc: "Two concentric quarter-arcs radiating from a corner origin. Signal expanding outward.",
    Mark: MarkB,
  },
  {
    id: "c",
    label: "Option C",
    sublabel: "Radar Screen",
    desc: "Thin ring + sweep arm + off-center blip. The mark detects something specific.",
    Mark: MarkC,
  },
];

// ── Page ──────────────────────────────────────────────────────────────────────

export default function MarksPage() {
  return (
    <main
      style={{
        background: "#0a1628",
        minHeight: "100vh",
        padding: "60px 40px",
        fontFamily: "system-ui, sans-serif",
        color: "#e2e8f0",
      }}
    >
      <h1
        style={{
          fontSize: "13px",
          fontWeight: 700,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "#d4a843",
          marginBottom: "8px",
        }}
      >
        The Nolana Report
      </h1>
      <h2
        style={{
          fontSize: "28px",
          fontWeight: 800,
          color: "#f1f5f9",
          marginBottom: "6px",
        }}
      >
        Brand Mark Comparison
      </h2>
      <p style={{ fontSize: "14px", color: "#64748b", marginBottom: "60px" }}>
        Internal review page — not indexed
      </p>

      {/* ── Large comparison ── */}
      <Section label="Large (72px) — on dark">
        <div style={{ display: "flex", gap: "64px", flexWrap: "wrap" }}>
          {MARKS.map(({ id, label, sublabel, desc, Mark }) => (
            <div
              key={id}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "16px",
                width: "140px",
              }}
            >
              <div
                style={{
                  width: "120px",
                  height: "120px",
                  borderRadius: "20px",
                  background: "#0f1722",
                  border: "1px solid rgba(255,255,255,0.08)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Mark size={72} color="#d4a843" />
              </div>
              <div style={{ textAlign: "center" }}>
                <p
                  style={{
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "#f1f5f9",
                    margin: 0,
                  }}
                >
                  {label}
                </p>
                <p
                  style={{
                    fontSize: "11px",
                    color: "#d4a843",
                    marginTop: "2px",
                    marginBottom: "6px",
                  }}
                >
                  {sublabel}
                </p>
                <p
                  style={{
                    fontSize: "11px",
                    color: "#64748b",
                    lineHeight: 1.5,
                    margin: 0,
                  }}
                >
                  {desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Nav context ── */}
      <Section label="Nav context (20px) — lockup with wordmark">
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {MARKS.map(({ id, label, Mark }) => (
            <div
              key={id}
              style={{ display: "flex", alignItems: "center", gap: "32px" }}
            >
              <span
                style={{
                  fontSize: "11px",
                  color: "#475569",
                  width: "80px",
                  flexShrink: 0,
                  textAlign: "right",
                }}
              >
                {label}
              </span>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  background: "#0f1722",
                  padding: "10px 18px",
                  borderRadius: "10px",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <Mark size={20} color="#d4a843" />
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: 700,
                    letterSpacing: "0.2em",
                    textTransform: "uppercase" as const,
                    color: "#d4a843",
                  }}
                >
                  The Nolana Report
                </span>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Favicon simulation ── */}
      <Section label="Favicon (16px) — smallest legible size">
        <div
          style={{
            display: "flex",
            gap: "48px",
            alignItems: "flex-end",
            flexWrap: "wrap",
          }}
        >
          {MARKS.map(({ id, label, Mark }) => (
            <div
              key={id}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "10px",
              }}
            >
              {/* Favicon tile — actual size */}
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "7px",
                  background: "#0f1722",
                  border: "1px solid rgba(255,255,255,0.12)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Mark size={16} color="#d4a843" />
              </div>
              {/* 2× zoom for readability */}
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "10px",
                  background: "#0f1722",
                  border: "1px solid rgba(255,255,255,0.06)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Mark size={32} color="#d4a843" />
              </div>
              <span style={{ fontSize: "11px", color: "#475569" }}>
                {label}
              </span>
            </div>
          ))}
        </div>
        <p style={{ fontSize: "11px", color: "#334155", marginTop: "16px" }}>
          Top row: actual 16px size. Bottom row: 2× zoom for legibility review.
        </p>
      </Section>

      {/* ── Light background verification ── */}
      <Section label="Light background — white / off-white">
        <div style={{ display: "flex", gap: "40px", flexWrap: "wrap" }}>
          {MARKS.map(({ id, label, Mark }) => (
            <div
              key={id}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <div
                style={{
                  width: "100px",
                  height: "100px",
                  borderRadius: "16px",
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Mark size={56} color="#d4a843" />
              </div>
              <span style={{ fontSize: "11px", color: "#475569" }}>
                {label}
              </span>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Single-color stress tests ── */}
      <Section label="Single color — white (reversed)">
        <div style={{ display: "flex", gap: "40px", flexWrap: "wrap" }}>
          {MARKS.map(({ id, label, Mark }) => (
            <div
              key={id}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <div
                style={{
                  width: "80px",
                  height: "80px",
                  borderRadius: "14px",
                  background: "#111827",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Mark size={48} color="#ffffff" />
              </div>
              <span style={{ fontSize: "11px", color: "#475569" }}>
                {label}
              </span>
            </div>
          ))}
        </div>
      </Section>
    </main>
  );
}

function Section({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: "64px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginBottom: "28px",
        }}
      >
        <span
          style={{
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: "0.16em",
            textTransform: "uppercase" as const,
            color: "#475569",
          }}
        >
          {label}
        </span>
        <div
          style={{
            flex: 1,
            height: "1px",
            background: "rgba(255,255,255,0.06)",
          }}
        />
      </div>
      {children}
    </div>
  );
}
