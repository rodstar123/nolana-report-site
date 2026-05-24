import SectionReveal from "./SectionReveal";

const FAQS = [
  {
    question: "What is The Nolana Report?",
    answer:
      "The Nolana Report is a weekly business intelligence briefing for the Rio Grande Valley, covering new businesses, government moves, cross-border trade, and industrial investment across McAllen, Edinburg, Brownsville, and the RGV. Published every Monday by National Bookkeeping Company.",
  },
  {
    question: "What business news sources cover the Rio Grande Valley?",
    answer:
      "The Nolana Report aggregates and scores 25+ RGV news sources including KRGV, ValleyCentral, RGV Business Journal, The Monitor, Brownsville Herald, Rio Grande Guardian, Texas Border Business, and Valley Business Report, plus government data from the Federal Register, CBP bridge wait times, and USD/MXN exchange rates.",
  },
  {
    question: "How much does The Nolana Report cost?",
    answer:
      "The Nolana Report offers three tiers: Free (weekly summary email + live data bar), Pro at $9/month (full 30-story briefing with score badges and archive access), and Intel at $19/month (Pro features plus monthly deep-dive industry analysis). Founding members get Pro locked at $7/month forever.",
  },
  {
    question: "What new businesses are opening in McAllen and the RGV?",
    answer:
      "The Nolana Report tracks new business openings, LLC filings, permits, and expansions across McAllen, Edinburg, Pharr, Mission, Brownsville, Harlingen, and the entire Rio Grande Valley every week. Subscribe free at nolanareport.com to get the latest.",
  },
  {
    question: "What companies are investing in the Rio Grande Valley?",
    answer:
      "The Nolana Report's Industrial & Investment Watch tracks manufacturing plants, corporate relocations, Foreign Trade Zone activity, and economic development announcements across the RGV, including EDC news from Edinburg, McAllen, Weslaco, and the Port of Brownsville.",
  },
];

export default function FAQ() {
  return (
    <section
      className="bg-cream py-24 card-stack"
      aria-label="Frequently asked questions"
    >
      <div className="max-w-3xl mx-auto px-6">
        <SectionReveal>
          <div className="mb-12">
            <span className="section-label mb-4">FAQ</span>
            <h2 className="font-display font-bold text-navy text-4xl mt-4 mb-3">
              Common questions
            </h2>
            <p className="font-body text-slate text-lg">
              Everything you need to know about The Nolana Report.
            </p>
          </div>
        </SectionReveal>

        <div className="space-y-4">
          {FAQS.map((faq, i) => (
            <SectionReveal key={faq.question} delay={i * 0.07}>
              <div className="bg-warm-white border border-cream-dark rounded-xl p-6 hover:shadow-md hover:border-teal/20 transition-all duration-200">
                <h3 className="font-display font-bold text-charcoal text-lg mb-3 leading-snug">
                  {faq.question}
                </h3>
                <p className="font-body text-slate text-[15px] leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            </SectionReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
