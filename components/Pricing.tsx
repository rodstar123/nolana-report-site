import { TIERS } from "@/lib/constants";
import SectionReveal from "./SectionReveal";

export default function Pricing() {
  return (
    <section id="pricing" className="bg-navy py-24 card-stack">
      <div className="max-w-6xl mx-auto px-6">
        <SectionReveal>
          <div className="text-center mb-16">
            <span className="section-label justify-center mb-4">
              <span className="text-teal-light">Pricing</span>
            </span>
            <h2 className="font-display font-bold text-warm-white text-4xl mt-4 mb-4">
              Intelligence pays for itself.
            </h2>
            <p className="font-editorial text-slate-light text-lg max-w-xl mx-auto leading-relaxed">
              One call you make faster, one deal you close sooner — the briefing
              covers itself.
            </p>
          </div>
        </SectionReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {TIERS.map((tier, i) => (
            <SectionReveal key={tier.id} delay={i === 1 ? 0 : i * 0.1}>
              <div
                className={`relative rounded-2xl p-8 flex flex-col transition-all duration-300 hover:-translate-y-1 ${
                  tier.highlight
                    ? "bg-teal border-2 border-teal-light shadow-2xl shadow-teal/20 md:scale-105"
                    : "bg-navy-deep border border-white/10"
                }`}
              >
                {tier.highlight && tier.badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gold text-navy-deep text-xs font-bold font-body px-4 py-1.5 rounded-full uppercase tracking-widest whitespace-nowrap">
                    {tier.badge}
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="font-display font-bold text-warm-white text-2xl mb-1">
                    {tier.name}
                  </h3>
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="font-mono font-bold text-gold text-4xl">
                      {tier.priceLabel}
                    </span>
                  </div>
                  {tier.foundingBadge && (
                    <div className="inline-flex items-center bg-gold/10 border border-gold/30 rounded-lg px-3 py-1.5 mb-3">
                      <span className="text-gold text-xs font-bold font-body">
                        {tier.foundingBadge}
                      </span>
                    </div>
                  )}
                  <p className="font-editorial text-slate-light text-sm leading-relaxed">
                    {tier.description}
                  </p>
                </div>

                <ul className="space-y-3 flex-1 mb-8">
                  {tier.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2 text-sm font-body"
                    >
                      <span className="text-teal-light mt-0.5 flex-shrink-0">
                        ✓
                      </span>
                      <span
                        className={
                          tier.highlight
                            ? "text-warm-white"
                            : "text-slate-light"
                        }
                      >
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <a
                  href={tier.id === "free" ? "#" : "#"}
                  className={`block text-center py-3 px-6 rounded-xl font-body font-bold text-sm transition-colors duration-200 min-h-[44px] leading-[28px] ${
                    tier.highlight
                      ? "bg-warm-white text-navy hover:bg-cream"
                      : "border border-white/20 text-warm-white hover:border-teal hover:text-teal-light"
                  }`}
                >
                  {tier.cta}
                </a>
              </div>
            </SectionReveal>
          ))}
        </div>

        <SectionReveal delay={0.3}>
          <p className="text-center font-body text-slate-light text-sm mt-10">
            Cancel anytime. No contracts. Founding member pricing locks in
            permanently for the first 100 Pro subscribers.
          </p>
        </SectionReveal>
      </div>
    </section>
  );
}
