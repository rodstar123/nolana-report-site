import { PUBLISHER, PUBLISHER_URL } from "@/lib/constants";
import SectionReveal from "./SectionReveal";

export default function About() {
  return (
    <section className="bg-cream py-24">
      <div className="max-w-3xl mx-auto px-6">
        <SectionReveal>
          <span className="section-label mb-6">About</span>
          <h2 className="font-display font-bold text-navy text-4xl mt-4 mb-8">
            Published by the people who know your numbers.
          </h2>
        </SectionReveal>

        <SectionReveal delay={0.1}>
          <div className="font-editorial text-slate text-lg leading-relaxed space-y-5">
            <p>
              <strong className="font-semibold text-charcoal">
                The Nolana Report
              </strong>{" "}
              is published by{" "}
              <a
                href={PUBLISHER_URL}
                className="text-teal hover:text-teal-light underline underline-offset-2 transition-colors"
              >
                {PUBLISHER}
              </a>{" "}
              — the bookkeeping and tax coordination firm that has worked
              alongside Valley businesses for years. We see the numbers that
              don&apos;t make the news.
            </p>
            <p>
              We built this briefing because our clients kept asking the same
              question:{" "}
              <em>
                &ldquo;What&apos;s happening in the Valley this week that I
                should know about?&rdquo;
              </em>{" "}
              Now we answer it every Monday, for everyone.
            </p>
            <p>
              The name? Nolana Avenue runs through the heart of every major
              business district in the Valley — from Mission to Pharr, through
              McAllen. It&apos;s the road that connects the Valley&apos;s
              commerce. That felt right.
            </p>
          </div>
        </SectionReveal>

        <SectionReveal delay={0.2}>
          <div className="mt-10 p-6 bg-warm-white border border-cream-dark rounded-xl">
            <p className="font-body text-sm text-slate-light mb-2 uppercase tracking-wider font-semibold">
              Published by
            </p>
            <a
              href={PUBLISHER_URL}
              className="font-display font-bold text-navy text-2xl hover:text-teal transition-colors"
            >
              {PUBLISHER}
            </a>
            <p className="font-body text-slate text-sm mt-2">
              315 W Nolana Ave, McAllen, TX ·{" "}
              <a
                href={PUBLISHER_URL}
                className="text-teal hover:text-teal-light transition-colors"
              >
                nationalboco.com
              </a>
            </p>
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}
