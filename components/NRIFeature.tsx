"use client";
import SectionReveal from "./SectionReveal";
import ScoreBadge from "./ScoreBadge";
import NRIHeatmap from "./NRIHeatmap";
import NRITooltip from "./NRITooltip";

export default function NRIFeature() {
  return (
    <section
      className="py-12 md:py-28 relative overflow-hidden grid-overlay"
      style={{
        background: "linear-gradient(to bottom, #0f1722 0%, #1a2332 100%)",
      }}
    >
      <div className="relative z-10 max-w-6xl mx-auto px-6 lg:px-8">
        <SectionReveal>
          <div className="text-center mb-8 md:mb-14">
            <span className="section-label justify-center mb-4">
              <span className="text-teal-light">The NRI</span>
            </span>
            <h2
              className="font-display font-bold text-warm-white mt-4 mb-5"
              style={{ fontSize: "clamp(1.75rem, 4vw, 2.75rem)" }}
            >
              Not all stories matter equally.
            </h2>
            <p className="font-editorial text-slate-light text-lg max-w-2xl mx-auto leading-relaxed">
              Every story is scored by the{" "}
              <NRITooltip>
                <span className="font-semibold text-teal-light">
                  Nolana Relevance Index
                </span>
              </NRITooltip>{" "}
              &mdash; so you know what deserves your attention and what&apos;s
              just noise.
            </p>
          </div>
        </SectionReveal>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <SectionReveal delay={0.1}>
            <div className="space-y-6">
              <div className="glass-nolana rounded-xl p-6">
                <h3 className="font-display font-bold text-warm-white text-lg mb-3">
                  Three dimensions, one score
                </h3>
                <div className="space-y-4">
                  {[
                    {
                      name: "Business Relevance",
                      desc: "How directly does this affect Valley businesses?",
                      icon: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",
                    },
                    {
                      name: "Urgency",
                      desc: "Is there a deadline, window, or time-sensitive opportunity?",
                      icon: "M12 2v10l4.5 4.5",
                    },
                    {
                      name: "Market Impact",
                      desc: "Could this shift demand, pricing, jobs, or competition?",
                      icon: "M22 12h-4l-3 9L9 3l-3 9H2",
                    },
                  ].map((dim) => (
                    <div key={dim.name} className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg bg-teal/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg
                          className="w-4.5 h-4.5 text-teal-light"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path d={dim.icon} />
                        </svg>
                      </div>
                      <div>
                        <p className="font-body text-warm-white text-sm font-semibold">
                          {dim.name}
                        </p>
                        <p className="font-body text-slate-light text-xs leading-relaxed">
                          {dim.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-nolana rounded-xl p-6">
                <p className="font-body text-warm-white/60 text-xs uppercase tracking-widest font-semibold mb-3">
                  This week&apos;s distribution
                </p>
                <NRIHeatmap />
              </div>
            </div>
          </SectionReveal>

          <SectionReveal delay={0.2}>
            <div className="flex flex-col items-center gap-6">
              <p className="font-body text-slate-light text-sm text-center max-w-sm">
                The higher the NRI score, the more actionable the story is for
                your business. Here&apos;s what each tier means:
              </p>
              <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
                {[
                  { score: 92, desc: "New FTZ facility — 200 jobs" },
                  { score: 84, desc: "USD/MXN shift — retail surge" },
                  { score: 68, desc: "SpaceX launch — Isla Blanca" },
                  { score: 45, desc: "Council meeting — routine agenda" },
                ].map((ex) => (
                  <div
                    key={ex.score}
                    className="glass-nolana rounded-xl p-4 flex flex-col items-center gap-2 text-center"
                  >
                    <ScoreBadge score={ex.score} size={52} showLabel />
                    <p className="font-body text-slate-light text-xs leading-snug">
                      {ex.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </SectionReveal>
        </div>
      </div>
    </section>
  );
}
