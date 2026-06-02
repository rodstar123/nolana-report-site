"use client";
import SectionReveal from "./SectionReveal";

interface Feature {
  title: string;
  description: string;
  pro: boolean;
  icon: React.ReactNode;
  accent: string;
}

const FEATURES: Feature[] = [
  {
    title: "Business Temperature",
    description:
      "The strategic read: where money is moving and where pressure is building.",
    pro: false,
    accent: "#0d7377",
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
        <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" />
      </svg>
    ),
  },
  {
    title: "The Move Bar",
    description:
      "Every story ends with a specific action a real operator can take this week.",
    pro: false,
    accent: "#0d7377",
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
        <polyline points="9 18 15 12 9 6" />
      </svg>
    ),
  },
  {
    title: "NRI Sub-Scores",
    description:
      "Four dimensions per story: Money Impact, Urgency, Local Reach, Risk.",
    pro: false,
    accent: "#0d7377",
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
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    ),
  },
  {
    title: "Valley Money Map",
    description: "Who's winning, who's exposed, where to position.",
    pro: true,
    accent: "#d4a843",
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
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
  {
    title: "3 Moves This Week",
    description: "Cross-story actions tagged by industry.",
    pro: true,
    accent: "#d4a843",
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
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
  },
  {
    title: "The Quiet Signal",
    description: "The story that matters more than its noise level suggests.",
    pro: false,
    accent: "#0d7377",
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
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
  },
];

export default function InsideEveryIssue() {
  return (
    <section
      className="py-12 md:py-28 relative overflow-hidden grid-overlay"
      style={{
        background: "linear-gradient(to bottom, #0f1722 0%, #1a2332 100%)",
      }}
    >
      <div className="relative z-10 max-w-6xl mx-auto px-5 sm:px-6 lg:px-8">
        <SectionReveal>
          <div className="text-center mb-8 md:mb-14">
            <span className="section-label justify-center mb-4">
              <span className="text-teal-light">Inside Every Issue</span>
            </span>
            <h2
              className="font-display font-bold text-warm-white mt-4 mb-5"
              style={{ fontSize: "clamp(1.75rem, 4vw, 2.75rem)" }}
            >
              Not just news. A decision toolkit.
            </h2>
            <p className="font-editorial text-slate-light text-lg max-w-2xl mx-auto leading-relaxed">
              Every Monday briefing includes these sections &mdash; designed to
              help you move faster than operators who only read headlines.
            </p>
          </div>
        </SectionReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {FEATURES.map((feature, i) => (
            <SectionReveal key={feature.title} delay={i * 0.07}>
              <div
                className="glass-nolana rounded-xl p-5 sm:p-6 flex flex-col gap-3 h-full transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
                style={{
                  borderLeftWidth: "3px",
                  borderLeftStyle: "solid",
                  borderLeftColor: feature.accent,
                }}
              >
                {/* Header: icon + title + pro badge */}
                <div className="flex items-start gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{
                      background: feature.pro
                        ? "rgba(212,168,67,0.12)"
                        : "rgba(13,115,119,0.12)",
                      color: feature.accent,
                    }}
                  >
                    {feature.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-display font-bold text-warm-white text-base leading-tight">
                        {feature.title}
                      </h3>
                      {feature.pro && (
                        <span
                          className="inline-flex items-center gap-1 font-body font-bold uppercase tracking-widest flex-shrink-0"
                          style={{
                            fontSize: "9px",
                            padding: "2px 7px",
                            borderRadius: "4px",
                            background: "rgba(212,168,67,0.15)",
                            color: "#d4a843",
                            border: "1px solid rgba(212,168,67,0.3)",
                          }}
                        >
                          <svg
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="w-2.5 h-2.5"
                            aria-hidden="true"
                          >
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                          </svg>
                          Pro
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="font-body text-slate-light text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </SectionReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
