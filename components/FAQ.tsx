"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import SectionReveal from "./SectionReveal";

function FAQItem({
  question,
  answer,
  delay,
  defaultOpen = false,
}: {
  question: string;
  answer: string;
  delay: number;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

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
  const t = useTranslations("faq");
  const items = t.raw("items") as { question: string; answer: string }[];

  return (
    <section
      className="py-12 md:py-28 card-stack"
      aria-label="Frequently asked questions"
      style={{
        background: "linear-gradient(to bottom, #f4f1ec 0%, #e8e3db 100%)",
      }}
    >
      <div className="max-w-3xl mx-auto px-6 lg:px-8">
        <SectionReveal>
          <div className="mb-8 md:mb-14">
            <span className="section-label mb-4">{t("label")}</span>
            <h2
              className="font-display font-bold text-navy mt-4 mb-3"
              style={{ fontSize: "clamp(1.75rem, 4vw, 2.75rem)" }}
            >
              {t("headline")}
            </h2>
            <p className="font-body text-slate text-lg">{t("subtitle")}</p>
          </div>
        </SectionReveal>

        <div className="space-y-4">
          {items.map((faq, i) => (
            <FAQItem
              key={faq.question}
              question={faq.question}
              answer={faq.answer}
              delay={i * 0.07}
              defaultOpen={i < 2}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
