import { MOCK_STORIES } from "@/lib/constants";
import BriefingCard from "./BriefingCard";
import PaywallBlur from "./PaywallBlur";
import SectionReveal from "./SectionReveal";

export default function SampleBriefing() {
  const visibleStories = MOCK_STORIES.slice(0, 2);
  const blurredStories = MOCK_STORIES.slice(2);

  return (
    <section className="bg-cream py-24">
      <div className="max-w-4xl mx-auto px-6">
        <SectionReveal>
          <div className="mb-12">
            <span className="section-label mb-4">
              Sample Issue — Week of May 19
            </span>
            <h2 className="font-display font-bold text-navy text-4xl mt-4 mb-4">
              This week in the Valley
            </h2>
            <p className="font-editorial text-slate text-lg leading-relaxed">
              47 stories scored this week. Here are the top stories — Pro
              subscribers get all 30.
            </p>
          </div>
        </SectionReveal>

        <div className="space-y-4">
          {visibleStories.map((story, i) => (
            <SectionReveal key={story.headline} delay={i * 0.1}>
              <BriefingCard {...story} />
            </SectionReveal>
          ))}

          {/* Blurred paywall preview */}
          <div
            className="paywall-blur-mask relative pointer-events-none select-none"
            aria-hidden="true"
          >
            {blurredStories.map((story) => (
              <div key={story.headline} className="mt-4">
                <BriefingCard {...story} />
              </div>
            ))}
          </div>
        </div>

        <PaywallBlur />
      </div>
    </section>
  );
}
