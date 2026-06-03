interface Story {
  headline: string;
  summary: string;
  section: string;
  why_it_matters: string | null;
}

interface Props {
  stories: Story[];
}

const SECTION_AUDIENCES: Record<string, string[]> = {
  new_business_pulse: [
    "Small business owners watching new competitors and market shifts",
    "Commercial real estate operators tracking new leases and permits",
  ],
  gov_economic_watch: [
    "Government contractors and grant-seekers monitoring public opportunities",
    "Nonprofit leaders and community developers tracking policy changes",
  ],
  cross_border_trade: [
    "Logistics operators moving goods through Brownsville and Laredo",
    "Import/export brokers navigating cross-border trade flows",
  ],
  community_buzz: [
    "Retail and food-service operators reading local demand signals",
    "Event planners and hospitality managers tracking community trends",
  ],
  industrial_investment: [
    "Industrial developers and warehouse operators in the Valley",
    "Investors evaluating RGV real estate and infrastructure projects",
  ],
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

const KEYWORD_AUDIENCES: Record<string, string> = {
  produce: "Avocado brokers and haulers in the McAllen supply chain",
  port: "Port operators and maritime logistics teams in Brownsville",
  weather: "Facility managers and insurers preparing for hurricane season",
  childcare:
    "Child care and health facility operators ahead of new regulations",
  health: "Healthcare providers and medical practice administrators",
  construction: "General contractors and construction firms tracking permits",
  food: "Restaurant owners and food-service operators watching trends",
  tech: "Tech startup founders and IT service providers in the Valley",
};

export default function WhoShouldRead({ stories }: Props) {
  const audiences = new Set<string>();

  const sections = new Set(stories.map((s) => s.section));
  sections.forEach((section) => {
    const pool = SECTION_AUDIENCES[section];
    if (pool) audiences.add(pool[0]);
  });

  const allText = stories
    .map((s) => `${s.headline} ${s.summary} ${s.why_it_matters ?? ""}`)
    .join(" ");
  const keywords = extractKeywords(allText);
  keywords.forEach((kw) => {
    if (KEYWORD_AUDIENCES[kw]) audiences.add(KEYWORD_AUDIENCES[kw]);
  });

  const items = Array.from(audiences).slice(0, 5);
  if (items.length < 3) {
    const fallbacks = [
      "Valley operators making decisions with real-time business intelligence",
      "Anyone tracking where money is moving in the Rio Grande Valley",
      "Business owners who want to know before their competitors do",
    ];
    for (const fb of fallbacks) {
      if (items.length >= 5) break;
      if (!items.includes(fb)) items.push(fb);
    }
  }

  return (
    <div className="mt-12 mb-8 p-6 bg-warm-white dark:bg-dark-card border border-cream-dark dark:border-dark-border rounded-xl">
      <h3 className="font-display font-bold text-navy dark:text-dark-text text-lg mb-4">
        Who Should Read This Issue?
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
