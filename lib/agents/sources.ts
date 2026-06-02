import type { AgentName, SourceConfig, SourceTier } from "./types";

export const SOURCES: Record<AgentName, SourceConfig[]> = {
  "Agent 1": [
    {
      name: "Google News Business",
      url: "https://news.google.com/rss/search?q=%28%22McAllen%22+OR+%22RGV%22+OR+%22Edinburg%22+OR+%22Pharr%22+OR+%22Mission%22+OR+%22Weslaco%22%29+business&hl=en-US&gl=US&ceid=US:en",
      type: "rss",
    },
    {
      name: "McAllen City",
      url: "https://news.google.com/rss/search?q=%22City+of+McAllen%22+council+OR+permit+OR+development&hl=en-US&gl=US&ceid=US:en",
      type: "rss",
    },
    {
      name: "The Monitor",
      url: "https://news.google.com/rss/search?q=%22The+Monitor%22+McAllen+OR+RGV+OR+Edinburg&hl=en-US&gl=US&ceid=US:en",
      type: "rss",
    },
    {
      name: "GN MyRGV",
      url: "https://news.google.com/rss/search?q=site:myrgv.com+RGV+OR+McAllen+OR+business&hl=en-US&gl=US&ceid=US:en",
      type: "rss",
    },
    {
      name: "Valley Business Report",
      url: "https://valleybusinessreport.com/feed/",
      type: "rss",
    },
    {
      name: "Texas Border Business",
      url: "https://texasborderbusiness.com/feed/",
      type: "rss",
    },
  ],

  "Agent 2": [
    {
      name: "GN RGV Grants",
      url: "https://news.google.com/rss/search?q=%28%22McAllen%22+OR+%22Edinburg%22+OR+%22Pharr%22+OR+%22Mission%22+OR+%22Brownsville%22+OR+%22Harlingen%22+OR+%22RGV%22+OR+%22Hidalgo+County%22+OR+%22Cameron+County%22%29+%28%22grant%22+OR+%22funding%22+OR+%22incentive%22+OR+%22SBA%22+OR+%22USDA%22%29&hl=en-US&gl=US&ceid=US:en",
      type: "rss",
    },
    {
      name: "GN RGV RFP",
      url: "https://news.google.com/rss/search?q=%28%22McAllen%22+OR+%22Edinburg%22+OR+%22Hidalgo+County%22+OR+%22Cameron+County%22%29+%28%22RFP%22+OR+%22request+for+proposal%22+OR+%22bid%22+OR+%22contract+awarded%22+OR+%22procurement%22%29&hl=en-US&gl=US&ceid=US:en",
      type: "rss",
    },
    {
      name: "GN RGV Permits",
      url: "https://news.google.com/rss/search?q=%28%22McAllen%22+OR+%22Edinburg%22+OR+%22Pharr%22+OR+%22Mission%22+OR+%22Brownsville%22%29+%28%22building+permit%22+OR+%22construction+permit%22+OR+%22site+plan%22+OR+%22business+license%22%29&hl=en-US&gl=US&ceid=US:en",
      type: "rss",
    },
    {
      name: "Federal Register",
      url: "https://www.federalregister.gov/api/v1/articles.json?conditions%5Bterm%5D=Hidalgo+County+McAllen&fields%5B%5D=title&fields%5B%5D=abstract&fields%5B%5D=html_url&fields%5B%5D=publication_date&per_page=20",
      type: "json",
    },
    {
      name: "TX Comptroller",
      url: "https://public.govdelivery.com/topics/TXCOMPT_1/feed.rss",
      type: "rss",
    },
    {
      name: "SBA South Texas",
      url: "https://news.google.com/rss/search?q=%22SBA%22+%28%22South+Texas%22+OR+%22Rio+Grande+Valley%22+OR+%22McAllen%22%29+loan+OR+grant+OR+program&hl=en-US&gl=US&ceid=US:en",
      type: "rss",
    },
    {
      name: "McAllen Agendas",
      url: "https://mcallen.net/government/city-council/agendas",
      type: "scraper",
    },
    {
      name: "Hidalgo County Bids",
      url: "https://news.google.com/rss/search?q=%22Hidalgo+County%22+%28%22bid%22+OR+%22contract%22+OR+%22RFP%22+OR+%22grant%22+OR+%22incentive%22+OR+%22economic+development%22%29&hl=en-US&gl=US&ceid=US:en",
      type: "rss",
    },
    {
      name: "GN EDC Incentives",
      url: "https://news.google.com/rss/search?q=%28%22EDC%22+OR+%22economic+development+corporation%22%29+%28%22McAllen%22+OR+%22Edinburg%22+OR+%22Pharr%22+OR+%22Mission%22+OR+%22Brownsville%22+OR+%22Harlingen%22%29+incentive+OR+grant+OR+%22tax+abatement%22&hl=en-US&gl=US&ceid=US:en",
      type: "rss",
    },
    {
      name: "GN TX Workforce",
      url: "https://news.google.com/rss/search?q=%28%22Texas+Workforce%22+OR+%22TWC%22%29+%28%22RGV%22+OR+%22Rio+Grande+Valley%22+OR+%22McAllen%22%29+training+OR+grant+OR+program&hl=en-US&gl=US&ceid=US:en",
      type: "rss",
    },
  ],

  "Agent 3": [
    {
      name: "CBP Bridge Waits",
      url: "https://bwt.cbp.gov/api/bwtnew",
      type: "json",
    },
    {
      name: "USD/MXN FX",
      url: "https://open.er-api.com/v6/latest/USD",
      type: "json",
    },
    {
      name: "Brownsville Herald",
      url: "https://news.google.com/rss/search?q=%22Brownsville+Herald%22+business+OR+trade+OR+investment&hl=en-US&gl=US&ceid=US:en",
      type: "rss",
    },
    {
      name: "Rio Grande Guardian",
      url: "https://news.google.com/rss/search?q=site:riograndeguardian.com&hl=en-US&gl=US&ceid=US:en",
      type: "rss",
    },
    {
      name: "RGV Business Journal",
      url: "https://www.rgvbusinessjournal.com/feed/",
      type: "rss",
    },
    {
      name: "Port of Brownsville",
      url: "https://www.portofbrownsville.com/feed/",
      type: "rss",
    },
    {
      name: "GN RGV Trade",
      url: "https://news.google.com/rss/search?q=%22Rio+Grande+Valley%22+OR+%22McAllen%22+OR+%22RGV%22+investment+OR+%22trade+zone%22+OR+nearshoring+OR+manufacturing&hl=en-US&gl=US&ceid=US:en",
      type: "rss",
    },
  ],

  "Agent 4": [
    {
      name: "GN Reddit RGV",
      url: "https://news.google.com/rss/search?q=site:reddit.com%2Fr%2FRGV+OR+site:reddit.com%2Fr%2Fmcallen&hl=en-US&gl=US&ceid=US:en",
      type: "rss",
    },
    {
      name: "KRGV",
      url: "https://news.google.com/rss/search?q=site:krgv.com+RGV+business+OR+community&hl=en-US&gl=US&ceid=US:en",
      type: "rss",
    },
    {
      name: "Eventbrite McAllen",
      url: "https://www.eventbrite.com/d/tx--mcallen/business/",
      type: "scraper",
    },
    {
      name: "ValleyCentral",
      url: "https://www.valleycentral.com/feed/",
      type: "rss",
    },
    {
      name: "McAllen City News GN",
      url: "https://news.google.com/rss/search?q=McAllen+Texas+city+news+OR+community+event+OR+local+announcement&hl=en-US&gl=US&ceid=US:en",
      type: "rss",
    },
  ],

  "Agent 5": [
    {
      name: "Edinburg EDC",
      url: "https://news.google.com/rss/search?q=%22Edinburg+EDC%22+OR+%22Edinburg+Economic+Development%22+Texas&hl=en-US&gl=US&ceid=US:en",
      type: "rss",
    },
    {
      name: "McAllen EDC",
      url: "https://news.google.com/rss/search?q=%22McAllen+EDC%22+OR+%22McAllen+Economic+Development%22&hl=en-US&gl=US&ceid=US:en",
      type: "rss",
    },
    {
      name: "Pharr EDC",
      url: "https://news.google.com/rss/search?q=%22Pharr+EDC%22+OR+%22Pharr+Economic+Development%22&hl=en-US&gl=US&ceid=US:en",
      type: "rss",
    },
    {
      name: "Mission EDC",
      url: "https://news.google.com/rss/search?q=%22Mission+EDC%22+OR+%22Mission+Economic+Development%22+Texas&hl=en-US&gl=US&ceid=US:en",
      type: "rss",
    },
    {
      name: "Port of Brownsville",
      url: "https://news.google.com/rss/search?q=%22Port+of+Brownsville%22+OR+%22Brownsville+port%22&hl=en-US&gl=US&ceid=US:en",
      type: "rss",
    },
    {
      name: "SpaceflightNow",
      url: "https://spaceflightnow.com/feed/",
      type: "rss",
    },
    {
      name: "Valley Business Report",
      url: "https://valleybusinessreport.com/feed/",
      type: "rss",
    },
    {
      name: "Texas Border Business",
      url: "https://texasborderbusiness.com/feed/",
      type: "rss",
    },
  ],
};

export function getSourceCount(): number {
  return Object.values(SOURCES).reduce((sum, arr) => sum + arr.length, 0);
}

// ---------------------------------------------------------------------------
// Source quality tier system
// Classifies the actual publisher behind a story into credibility tiers.
// Local RGV > Texas regional > US national > international.
// ---------------------------------------------------------------------------

const SOURCE_TIER_RULES: { tier: SourceTier; patterns: RegExp[] }[] = [
  {
    tier: "local",
    patterns: [
      /\bthe\s*monitor\b/i,
      /\bvalley\s*business\s*report\b/i,
      /\bmyrgv\b/i,
      /\btexas\s*border\s*business\b/i,
      /\brio\s*grande\s*guardian\b/i,
      /\brgv\s*business\s*journal\b/i,
      /\bbrownsville\s*herald\b/i,
      /\bvalley\s*central\b/i,
      /\bvalleycentral\b/i,
      /\bkrgv\b/i,
      /\bport\s*of\s*brownsville\b/i,
      /\bspaceflight\s*now\b/i,
    ],
  },
  {
    tier: "regional",
    patterns: [
      /\btexas\s*tribune\b/i,
      /\bhouston\s*chronicle\b/i,
      /\bdallas\s*morning\b/i,
      /\bsan\s*antonio\s*(express|report|news)/i,
      /\bfort\s*worth\s*star/i,
      /\baustin\s*american/i,
      /\bcorpus\s*christi\s*caller/i,
    ],
  },
  {
    tier: "national",
    patterns: [
      /\breuters\b/i,
      /\bbloomberg\b/i,
      /\bap\b\s*news\b|associated\s*press/i,
      /\bcnbc\b/i,
      /\bwall\s*street\s*journal\b/i,
      /\bnew\s*york\s*times\b/i,
      /\bwashington\s*post\b/i,
      /\bthe\s*packer\b/i,
      /\bfood\s*dive\b/i,
      /\bglobenewswire\b/i,
      /\bbusiness\s*wire\b/i,
      /\bpr\s*newswire\b/i,
      /\bforbes\b/i,
      /\bfortune\b/i,
      /\bmarketwatch\b/i,
      /\busa\s*today\b/i,
      /\bcbs\s*news\b/i,
      /\bnbc\s*news\b/i,
      /\babc\s*news\b/i,
      /\bfox\s*business\b/i,
      /\binvesting\.com\b/i,
      /\bblue\s*book\b/i,
      /\bfederal\s*register\b/i,
    ],
  },
  {
    tier: "international",
    patterns: [
      /\bmanila\s*times\b/i,
      /\bbbc\b/i,
      /\bal\s*jazeera\b/i,
      /\bguardian\b.*\.co\.uk/i,
      /\btimes\s*of\s*india\b/i,
      /\bsouth\s*china\b/i,
      /\bstraits\s*times\b/i,
      /\bnikkei\b/i,
      /\bfreshplaza\b/i,
      /\bfresh\s*fruit\s*portal\b/i,
      /\bthe\s*star\b.*\bmalaysia\b/i,
      /\bgulf\s*news\b/i,
      /\bindependent\.co\.uk\b/i,
      /\btelegraph\.co\.uk\b/i,
      /\bdaily\s*mail\b/i,
    ],
  },
];

export const SOURCE_TIER_MODIFIER: Record<SourceTier, number> = {
  local: 5,
  regional: 3,
  national: 0,
  international: -8,
  unknown: 0,
};

export function extractPublisher(title: string): string | null {
  const m = title.match(/\s*[-–—|]\s*([^-–—|]+)$/);
  return m ? m[1].trim() : null;
}

export function getSourceTier(
  title: string,
  url: string,
  configSourceName: string,
): SourceTier {
  const publisher = extractPublisher(title) ?? "";
  const haystack = `${publisher} ${url} ${configSourceName}`;
  for (const rule of SOURCE_TIER_RULES) {
    for (const pattern of rule.patterns) {
      if (pattern.test(haystack)) return rule.tier;
    }
  }
  return "unknown";
}

export function applySourceQualityModifier(
  score: number,
  tier: SourceTier,
): number {
  return Math.max(0, Math.min(100, score + SOURCE_TIER_MODIFIER[tier]));
}
