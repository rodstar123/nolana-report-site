export const SITE_NAME = "The Nolana Report";
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://nolanareport.com";
export const PUBLISHER = "National Bookkeeping Company®";
export const PUBLISHER_URL = "https://nationalboco.com";

export const TIERS = [
  {
    id: "free",
    name: "Free",
    price: 0,
    priceLabel: "Free",
    tagline: "Stay Aware — 6 scored stories every Monday.",
    description: "Weekly summary email + data bar access",
    features: [
      "Business Temperature reading",
      "6 scored stories every Monday — including the week's #1 story in full",
      "The Quiet Signal (closing insight)",
      "Live data bar (USD/MXN, bridge wait)",
      "Telegram alerts — t.me/NolanaReport",
    ],
    cta: "Subscribe Free",
    highlight: false,
    badge: null,
    foundingBadge: null,
    foundingPrice: null,
  },
  {
    id: "pro",
    name: "Pro",
    price: 9,
    priceLabel: "$9/mo",
    foundingPrice: "$7/mo",
    tagline: "Stay Ahead — Full briefing, scored by business relevance.",
    description:
      "Full weekly briefing — every scored story + pro-only sections",
    features: [
      "Everything in Free",
      "Full weekly briefing — all scored stories",
      "NRI sub-breakdowns (Money, Urgency, Reach, Risk)",
      "Valley Money Map",
      "3 Moves This Week",
      "Breaking news email alerts",
      "Full archive access",
    ],
    cta: "Join Pro — $7/mo",
    highlight: true,
    badge: "Most Popular",
    foundingBadge: "$7/mo — founding rate for first 100 subscribers",
  },
  {
    id: "intel",
    name: "Intel",
    price: 19,
    priceLabel: "$19/mo",
    foundingPrice: null,
    tagline:
      "See the Bigger Moves — Monthly deep dives on trade, industrial activity, investment, and market shifts.",
    description: "Pro + Monthly Intel Edition with industry deep dives",
    features: [
      "Everything in Pro",
      "Custom keyword alerts",
      "Monthly Intel deep dives",
      "Priority access to new features",
    ],
    cta: "Join Intel",
    highlight: false,
    badge: null,
    foundingBadge: null,
  },
];

export const AGENT_CARDS = [
  {
    icon: "🏪",
    title: "New Business Pulse",
    description:
      "Who's opening, expanding, or closing — before the signs go up.",
  },
  {
    icon: "🎯",
    title: "Opportunity Radar",
    description:
      "Grants, RFPs, permits, and incentives — money your business can go get.",
  },
  {
    icon: "🌉",
    title: "Cross-Border & Trade",
    description:
      "Bridge waits, tariff shifts, FX moves — the numbers that move the Valley.",
  },
  {
    icon: "📡",
    title: "Community Buzz",
    description:
      "Events, social signals, and local sentiment worth knowing about.",
  },
  {
    icon: "🏭",
    title: "Industrial & Investment Watch",
    description:
      "Manufacturing plants, corporate relocations, FTZ activity, and capital flows.",
  },
];

export const MOCK_STORIES = [
  {
    score: 91,
    headline:
      "New Manufacturing Facility to Open in Edinburg FTZ — 200 Jobs Expected",
    source: "Monitor / Edinburg Economic Development",
    summary:
      "A Monterrey-based auto parts supplier announced a $14M facility inside the Edinburg Foreign Trade Zone, expected to break ground Q3 2026. First Valley FTZ commitment of the year.",
    tag: "Industrial Watch",
    whyItMatters:
      "200 expected jobs may increase demand for payroll, staffing, lunch traffic, industrial services, and nearby commercial activity.",
  },
  {
    score: 84,
    headline:
      "USD/MXN Hits 19.85 — Cross-Border Shoppers Surge at McAllen Retailers",
    source: "Reuters FX / Local Retail Monitor",
    summary:
      "Peso weakness pushed the rate to near 20, driving noticeable foot traffic increases at La Plaza Mall and Palms Crossing. Laredo and McAllen retailers both reported weekend surges.",
    tag: "Cross-Border",
    whyItMatters:
      "Retailers, restaurants, and service businesses near the bridge corridors can expect higher foot traffic and cross-border spending until the rate reverses.",
  },
  {
    score: 78,
    headline:
      "City of McAllen Approves $2.3M Grant for Downtown Streetscape Project",
    source: "McAllen City Council / TxDOT",
    summary:
      "The council unanimously approved matching funds for a Main Street redevelopment phase covering three blocks. Construction expected to begin November 2026.",
    tag: "Gov Watch",
    whyItMatters:
      "Streetscape investment tends to raise nearby property values and attract new retail — contractors, architects, and adjacent commercial landlords should track the timeline.",
  },
  {
    score: 72,
    headline:
      "HEB Breaks Ground on New Mission Location — Third Valley Store This Year",
    source: "H-E-B Corporate / Mission City Hall",
    summary:
      "The 87,000 sq ft store on Shary Road will add 400 jobs. Mission's third HEB; the chain continues aggressive Valley expansion as competitor Walmart remodels two locations.",
    tag: "Business Pulse",
    whyItMatters:
      "Grocery anchors drive surrounding strip center traffic. Suppliers, food vendors, and nearby commercial landlords should watch leasing activity around this corridor.",
  },
];

// DATA_BAR_METRICS removed May 2026 — the homepage snapshot bar now sources
// live values from Supabase + public FX/CBP APIs via lib/snapshot.ts. Do not
// reintroduce hardcoded metrics here (they caused stale "this week" data).
