import { AGENT_CARDS } from "@/lib/constants";
import SectionReveal from "./SectionReveal";

export default function WhatYouGet() {
  return (
    <section className="bg-cream card-stack py-24">
      <div className="max-w-6xl mx-auto px-6">
        <SectionReveal>
          <div className="text-center mb-16">
            <span className="section-label justify-center mb-4">
              The Weekly Briefing
            </span>
            <h2 className="font-display font-bold text-navy text-4xl mt-4 mb-4">
              Five sections. Every story scored.
            </h2>
            <p className="font-editorial text-slate max-w-xl mx-auto text-lg leading-relaxed">
              Our AI agents scan 200+ sources each week and surface only what
              moves the needle for RGV businesses.
            </p>
          </div>
        </SectionReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {AGENT_CARDS.map((card, i) => (
            <SectionReveal key={card.title} delay={i * 0.08}>
              <div className="bg-warm-white border border-cream-dark rounded-xl p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group h-full">
                <div
                  className="w-12 h-12 rounded-lg bg-teal/10 flex items-center justify-center text-2xl mb-4 group-hover:bg-teal/20 transition-colors"
                  aria-hidden="true"
                >
                  {card.icon}
                </div>
                <h3 className="font-display font-bold text-charcoal text-lg mb-2">
                  {card.title}
                </h3>
                <p className="font-editorial text-slate text-sm leading-relaxed">
                  {card.description}
                </p>
              </div>
            </SectionReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
