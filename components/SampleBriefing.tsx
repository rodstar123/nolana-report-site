import { MOCK_STORIES } from "@/lib/constants";
import BriefingCard from "./BriefingCard";
import PaywallBlur from "./PaywallBlur";
import SectionReveal from "./SectionReveal";

function estimateReadingTime(stories: typeof MOCK_STORIES): number {
  const totalWords = stories.reduce((sum, s) => {
    const text = `${s.headline} ${s.summary} ${s.whyItMatters ?? ""}`;
    return sum + text.split(/\s+/).length;
  }, 0);
  return Math.max(3, Math.ceil(totalWords / 250));
}

export default function SampleBriefing() {
  const readingTime = estimateReadingTime(MOCK_STORIES);

  return (
    <section
      id="sample-issue"
      className="py-12 md:py-28"
      style={{
        background: "linear-gradient(to bottom, #f4f1ec 0%, #e8e3db 100%)",
      }}
    >
      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        <SectionReveal>
          <div className="mb-8 md:mb-14">
            <span className="section-label mb-4">Sample Issue</span>
            <div className="flex flex-wrap items-baseline gap-4 mt-4 mb-5">
              <h2
                className="font-display font-bold text-navy"
                style={{ fontSize: "clamp(1.75rem, 4vw, 2.75rem)" }}
              >
                This week in the Valley
              </h2>
              <span className="inline-flex items-center gap-1.5 bg-teal/8 border border-teal/15 rounded-full px-3 py-1 font-mono text-xs text-teal font-semibold">
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="10" strokeWidth="2" />
                  <path strokeWidth="2" d="M12 6v6l4 2" />
                </svg>
                ~{readingTime} min read
              </span>
            </div>
            <p className="font-editorial text-slate text-lg leading-relaxed max-w-2xl">
              Every Monday, we score 30+ RGV business stories by the{" "}
              <span className="font-semibold text-teal">
                Nolana Relevance Index
              </span>
              . Here are sample top stories &mdash; Pro subscribers get the full
              briefing.
            </p>
            <p className="font-body text-slate-light text-sm mt-4 italic">
              Sample format shown for demonstration. Real issues include direct
              source links to public records, city agendas, filings, and local
              media.
            </p>
          </div>
        </SectionReveal>

        <div className="space-y-5">
          {MOCK_STORIES.slice(0, 2).map((story, i) => (
            <SectionReveal key={story.headline} delay={i * 0.1}>
              <BriefingCard {...story} showReactions />
            </SectionReveal>
          ))}

          {/* Blurred paywall preview */}
          <div
            className="paywall-blur-mask relative pointer-events-none select-none"
            aria-hidden="true"
          >
            {MOCK_STORIES.slice(2).map((story) => (
              <div key={story.headline} className="mt-5">
                <BriefingCard {...story} showReactions={false} />
              </div>
            ))}
          </div>
        </div>

        <PaywallBlur />
      </div>
    </section>
  );
}
