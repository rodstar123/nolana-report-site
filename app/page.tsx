import Hero from "@/components/Hero";
import DataBar from "@/components/DataBar";
import WhatYouGet from "@/components/WhatYouGet";
import SampleBriefing from "@/components/SampleBriefing";
import Pricing from "@/components/Pricing";
import About from "@/components/About";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is The Nolana Report?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The Nolana Report is a weekly business intelligence briefing for the Rio Grande Valley, covering new businesses, government moves, cross-border trade, and industrial investment across McAllen, Edinburg, Brownsville, and the RGV. Published every Monday by National Bookkeeping Company.",
      },
    },
    {
      "@type": "Question",
      name: "What business news sources cover the Rio Grande Valley?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The Nolana Report aggregates and scores 25+ RGV news sources including KRGV, ValleyCentral, RGV Business Journal, The Monitor, Brownsville Herald, Rio Grande Guardian, Texas Border Business, and Valley Business Report, plus government data from the Federal Register, CBP bridge wait times, and USD/MXN exchange rates.",
      },
    },
    {
      "@type": "Question",
      name: "How much does The Nolana Report cost?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The Nolana Report offers three tiers: Free (weekly summary email + live data bar), Pro at $9/month (full 30-story briefing with score badges and archive access), and Intel at $19/month (Pro features plus monthly deep-dive industry analysis). Founding members get Pro locked at $7/month forever.",
      },
    },
    {
      "@type": "Question",
      name: "What new businesses are opening in McAllen and the RGV?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The Nolana Report tracks new business openings, LLC filings, permits, and expansions across McAllen, Edinburg, Pharr, Mission, Brownsville, Harlingen, and the entire Rio Grande Valley every week. Subscribe free at nolanareport.com to get the latest.",
      },
    },
    {
      "@type": "Question",
      name: "What companies are investing in the Rio Grande Valley?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The Nolana Report's Industrial & Investment Watch tracks manufacturing plants, corporate relocations, Foreign Trade Zone activity, and economic development announcements across the RGV, including EDC news from Edinburg, McAllen, Weslaco, and the Port of Brownsville.",
      },
    },
  ],
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <Hero />
      <DataBar />
      <WhatYouGet />
      <SampleBriefing />
      <Pricing />
      <About />
      <FAQ />
      <Footer />
    </>
  );
}
