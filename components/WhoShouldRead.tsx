import { getTranslations } from "next-intl/server";

interface Story {
  headline: string;
  summary: string;
  section: string;
  why_it_matters: string | null;
}

interface Props {
  stories: Story[];
}

const SECTION_AUDIENCE_KEYS: Record<string, string[]> = {
  new_business_pulse: ["new_business_pulse_1", "new_business_pulse_2"],
  gov_economic_watch: ["gov_economic_watch_1", "gov_economic_watch_2"],
  cross_border_trade: ["cross_border_trade_1", "cross_border_trade_2"],
  community_buzz: ["community_buzz_1", "community_buzz_2"],
  industrial_investment: ["industrial_investment_1", "industrial_investment_2"],
};

function extractKeywords(text: string): string[] {
  const keywords: string[] = [];
  const lower = text.toLowerCase();
  if (lower.includes("avocado") || lower.includes("produce"))
    keywords.push("produce");
  if (lower.includes("shipyard") || lower.includes("port"))
    keywords.push("port");
  if (lower.includes("hurricane") || lower.includes("storm"))
    keywords.push("weather");
  if (lower.includes("child care") || lower.includes("childcare"))
    keywords.push("childcare");
  if (lower.includes("health") || lower.includes("hospital"))
    keywords.push("health");
  if (lower.includes("construction") || lower.includes("build"))
    keywords.push("construction");
  if (lower.includes("restaurant") || lower.includes("food"))
    keywords.push("food");
  if (lower.includes("tech") || lower.includes("software"))
    keywords.push("tech");
  return keywords;
}

const KEYWORD_KEYS = [
  "produce",
  "port",
  "weather",
  "childcare",
  "health",
  "construction",
  "food",
  "tech",
] as const;

export default async function WhoShouldRead({ stories }: Props) {
  const t = await getTranslations("whoShouldRead");

  const audiences = new Map<string, string>();

  const sections = new Set(stories.map((s) => s.section));
  sections.forEach((section) => {
    const keys = SECTION_AUDIENCE_KEYS[section];
    if (keys) {
      const key = keys[0];
      audiences.set(key, t(`sectionAudiences.${key}`));
    }
  });

  const allText = stories
    .map((s) => `${s.headline} ${s.summary} ${s.why_it_matters ?? ""}`)
    .join(" ");
  const keywords = extractKeywords(allText);
  keywords.forEach((kw) => {
    if (KEYWORD_KEYS.includes(kw as (typeof KEYWORD_KEYS)[number])) {
      audiences.set(`kw_${kw}`, t(`keywordAudiences.${kw}`));
    }
  });

  const items = Array.from(audiences.values()).slice(0, 5);
  if (items.length < 3) {
    const fallbacks = [t("fallback1"), t("fallback2"), t("fallback3")];
    for (const fb of fallbacks) {
      if (items.length >= 5) break;
      if (!items.includes(fb)) items.push(fb);
    }
  }

  return (
    <div className="mt-12 mb-8 p-6 bg-warm-white dark:bg-dark-card border border-cream-dark dark:border-dark-border rounded-xl">
      <h3 className="font-display font-bold text-navy dark:text-dark-text text-lg mb-4">
        {t("title")}
      </h3>
      <ul className="space-y-2.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-3">
            <svg
              className="w-4 h-4 text-teal dark:text-teal-light flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12l2 2 4-4"
              />
            </svg>
            <span className="font-body text-sm text-charcoal dark:text-dark-text leading-relaxed">
              {item}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
