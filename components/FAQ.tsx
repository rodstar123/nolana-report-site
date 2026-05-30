"use client";
import { useState } from "react";
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

function FAQItem({
  question,
  answer,
  delay,
}: {
  question: string;
  answer: string;
  delay: number;
}) {
  const [open, setOpen] = useState(false);

  return (
    <SectionReveal delay={delay}>
      <div className="bg-warm-white border border-cream-dark rounded-xl overflow-hidden hover:shadow-md hover:border-teal/15 transition-all duration-200">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="w-full flex items-center justify-between p-6 text-left min-h-[64px]"
          aria-expanded={open}
        >
          <h3 className="font-display font-bold text-charcoal text-lg leading-snug pr-4">
            {question}
          </h3>
          <svg
            className={`w-5 h-5 text-teal flex-shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
        {open && (
          <div className="px-6 pb-6 -mt-1">
            <p className="font-body text-slate text-[15px] leading-relaxed">
              {answer}
            </p>
          </div>
        )}
      </div>
    </SectionReveal>
  );
}

export default function FAQ() {
  return (
    <section
      className="py-20 md:py-28 card-stack"
      aria-label="Frequently asked questions"
      style={{
        background: "linear-gradient(to bottom, #f4f1ec 0%, #e8e3db 100%)",
      }}
    >
      <div className="max-w-3xl mx-auto px-6 lg:px-8">
        <SectionReveal>
          <div className="mb-14">
            <span className="section-label mb-4">FAQ</span>
            <h2
              className="font-display font-bold text-navy mt-4 mb-3"
              style={{ fontSize: "clamp(1.75rem, 4vw, 2.75rem)" }}
            >
              Common questions
            </h2>
            <p className="font-body text-slate text-lg">
              Everything you need to know about The Nolana Report.
            </p>
          </div>
        </SectionReveal>

        <div className="space-y-4">
          {FAQS.map((faq, i) => (
            <FAQItem key={faq.question} {...faq} delay={i * 0.07} />
          ))}
        </div>
      </div>
    </section>
  );
}
