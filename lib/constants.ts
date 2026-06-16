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

// DATA_BAR_METRICS removed May 2026 — the homepage snapshot bar now sources
// live values from Supabase + public FX/CBP APIs via lib/snapshot.ts. Do not
// reintroduce hardcoded metrics here (they caused stale "this week" data).
