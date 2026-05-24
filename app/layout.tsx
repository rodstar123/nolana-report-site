import type { Metadata } from "next";
import "./globals.css";
import Navigation from "@/components/Navigation";
import LenisProvider from "@/components/LenisProvider";

export const metadata: Metadata = {
  title: "The Nolana Report — Business Intelligence for the Rio Grande Valley",
  description:
    "Weekly briefing covering new businesses, government moves, cross-border trade, and industrial investment across McAllen, Edinburg, Brownsville, and the RGV. Scored, summarized, ready to act on. Every Monday.",
  keywords:
    "Rio Grande Valley, RGV, McAllen, Edinburg, Brownsville, Pharr, Harlingen, business news, business intelligence, cross-border trade, economic development, South Texas, Hidalgo County, Cameron County",
  authors: [{ name: "National Bookkeeping Company" }],
  publisher: "National Bookkeeping Company®",
  creator: "The Nolana Report",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://nolanareport.com",
  ),
  alternates: { canonical: "https://nolanareport.com" },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://nolanareport.com",
    siteName: "The Nolana Report",
    title: "The Nolana Report — Lo que se mueve en el Valle",
    description:
      "Weekly business intelligence briefing for the Rio Grande Valley. 30 stories scored and summarized every Monday.",
    images: [
      {
        url: "/images/og-social-card.png",
        width: 1200,
        height: 630,
        alt: "The Nolana Report — Business Intelligence for the RGV",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "The Nolana Report — Business Intelligence for the RGV",
    description:
      "Weekly briefing covering new businesses, government moves, cross-border trade across McAllen, Edinburg, and the Rio Grande Valley.",
    images: ["/images/og-social-card.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "The Nolana Report",
  url: "https://nolanareport.com",
  description:
    "Weekly business intelligence briefing for the Rio Grande Valley",
  publisher: {
    "@type": "Organization",
    name: "National Bookkeeping Company",
    url: "https://nationalboco.com",
    address: {
      "@type": "PostalAddress",
      streetAddress: "315 W Nolana Ave",
      addressLocality: "McAllen",
      addressRegion: "TX",
      postalCode: "78504",
      addressCountry: "US",
    },
  },
};

const periodicalSchema = {
  "@context": "https://schema.org",
  "@type": "Periodical",
  name: "The Nolana Report",
  url: "https://nolanareport.com",
  publisher: {
    "@type": "Organization",
    name: "National Bookkeeping Company",
  },
  about: "Business intelligence for the Rio Grande Valley",
  audience: {
    "@type": "BusinessAudience",
    audienceType: "Small and medium business owners in the Rio Grande Valley",
  },
  isAccessibleForFree: true,
  offers: [
    { "@type": "Offer", name: "Free", price: "0", priceCurrency: "USD" },
    {
      "@type": "Offer",
      name: "Pro",
      price: "9",
      priceCurrency: "USD",
      billingIncrement: "Monthly",
    },
    {
      "@type": "Offer",
      name: "Intel",
      price: "19",
      priceCurrency: "USD",
      billingIncrement: "Monthly",
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Font performance — preconnect before CSS load */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* RSS — reserved for Phase 2 feed */}
        <link
          rel="alternate"
          type="application/rss+xml"
          title="The Nolana Report"
          href="/feed.xml"
        />
        {/* Local SEO geo signals */}
        <meta name="geo.region" content="US-TX" />
        <meta name="geo.placename" content="McAllen, Texas" />
        <meta name="geo.position" content="26.2034;-98.2300" />
        <meta name="ICBM" content="26.2034, -98.2300" />
        {/* Structured data — WebSite */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        {/* Structured data — Periodical */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(periodicalSchema),
          }}
        />
      </head>
      <body>
        <LenisProvider>
          <Navigation />
          <main aria-label="Main content">{children}</main>
        </LenisProvider>
      </body>
    </html>
  );
}
