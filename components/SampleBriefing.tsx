import { getTranslations, getLocale } from "next-intl/server";
import BriefingCard from "./BriefingCard";
import PaywallBlur from "./PaywallBlur";
import SectionReveal from "./SectionReveal";
import { getLatestIssue } from "@/lib/latest-issue";

export default async function SampleBriefing() {
  const issue = await getLatestIssue();
  // Graceful empty state — render nothing rather than a broken/empty section.
  if (!issue || issue.stories.length === 0) return null;

  const t = await getTranslations("sampleBriefing");
  const tIssue = await getTranslations("issue");
  const locale = await getLocale();
  const isEs = locale === "es";

  // Map real stories → BriefingCard props (locale-aware). BriefingCard renders
  // ONLY free fields (headline, summary, why-it-matters); it never renders Smart
  // Move or Nolana Take, so Pro content is structurally never exposed here.
  const cards = issue.stories.slice(0, 5).map((s) => ({
    score: s.nolana_score ?? 0,
    headline: isEs && s.headline_es ? s.headline_es : s.headline,
    summary: isEs && s.summary_es ? s.summary_es : s.summary,
    whyItMatters:
      (isEs && s.why_it_matters_es ? s.why_it_matters_es : s.why_it_matters) ??
      undefined,
    source: s.source_name ?? "",
    tag: tIssue.has(`sectionLabels.${s.section}`)
      ? tIssue(`sectionLabels.${s.section}`)
      : s.section,
    section: s.section,
  }));

  // Rank-gated like issue pages: rank 1 free; lower ranks blurred teaser.
  const freeCards = cards.slice(0, 2);
  const lockedCards = cards.slice(2);

  const readingTime = Math.max(
    3,
    Math.ceil(
      issue.stories.reduce((sum, s) => {
        const text = `${s.headline} ${s.summary} ${s.why_it_matters ?? ""}`;
        return sum + text.split(/\s+/).length;
      }, 0) / 250,
    ),
  );

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
            <span className="section-label mb-4">{t("label")}</span>
            <div className="flex flex-wrap items-baseline gap-4 mt-4 mb-5">
              <h2
                className="font-display font-bold text-navy"
                style={{ fontSize: "clamp(1.75rem, 4vw, 2.75rem)" }}
              >
                {t("headline")}
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
                {t("minRead", { minutes: String(readingTime) })}
              </span>
            </div>
            <p className="font-editorial text-slate text-lg leading-relaxed max-w-2xl">
              {t.rich("intro", {
                nri: (chunks) => (
                  <span className="font-semibold text-teal">{chunks}</span>
                ),
              })}
            </p>
            <p className="font-body text-slate-light text-sm mt-4 italic">
              {t("disclaimer")}
            </p>
          </div>
        </SectionReveal>

        <div className="space-y-5">
          {freeCards.map((card, i) => (
            <SectionReveal key={card.headline} delay={i * 0.1}>
              <BriefingCard {...card} showReactions />
            </SectionReveal>
          ))}

          {lockedCards.length > 0 && (
            <div
              className="paywall-blur-mask relative pointer-events-none select-none"
              aria-hidden="true"
            >
              {lockedCards.map((card) => (
                <div key={card.headline} className="mt-5">
                  <BriefingCard {...card} showReactions={false} />
                </div>
              ))}
            </div>
          )}
        </div>

        {lockedCards.length > 0 && <PaywallBlur />}
      </div>
    </section>
  );
}
