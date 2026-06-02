import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import Navigation from "@/components/Navigation";
import LenisProvider from "@/components/LenisProvider";

export const metadata: Metadata = {
  title: "The Nolana Report | RGV Business Intelligence & Weekly Business News",
  description:
    "Get the weekly Rio Grande Valley business intelligence briefing covering new businesses, permits, trade, bridge waits, government moves, and industrial investment across McAllen and the RGV.",
  keywords:
    "Rio Grande Valley, RGV, McAllen, Edinburg, Brownsville, Pharr, Harlingen, business news, business intelligence, cross-border trade, economic development, South Texas, Hidalgo County, Cameron County",
  authors: [{ name: "National Bookkeeping Company" }],
  publisher: "National Bookkeeping Company®",
  creator: "The Nolana Report",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://nolanareport.com",
  ),
  // Relative canonical/url resolve against metadataBase (non-www) — no host
  // literal to drift, self-referential per route via each page's own metadata.
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
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

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "NewsMediaOrganization",
  "@id": "https://nolanareport.com/#organization",
  name: "The Nolana Report",
  alternateName: "Nolana Report",
  url: "https://nolanareport.com",
  logo: {
    "@type": "ImageObject",
    url: "https://nolanareport.com/images/og-social-card.png",
    width: 1344,
    height: 752,
  },
  description:
    "Get the weekly Rio Grande Valley business intelligence briefing covering new businesses, permits, trade, bridge waits, government moves, and industrial investment across McAllen and the RGV.",
  foundingDate: "2026",
  address: {
    "@type": "PostalAddress",
    streetAddress: "315 W Nolana Ave",
    addressLocality: "McAllen",
    addressRegion: "TX",
    postalCode: "78504",
    addressCountry: "US",
  },
  areaServed: [
    { "@type": "Place", name: "Rio Grande Valley" },
    {
      "@type": "City",
      name: "McAllen",
      address: {
        "@type": "PostalAddress",
        addressRegion: "TX",
        addressCountry: "US",
      },
    },
  ],
  parentOrganization: {
    "@type": "Organization",
    name: "National Bookkeeping Company",
    url: "https://nationalboco.com",
  },
  publisher: {
    "@type": "Organization",
    name: "National Bookkeeping Company",
    url: "https://nationalboco.com",
  },
  contactPoint: {
    "@type": "ContactPoint",
    email: "info@nationalboco.com",
    contactType: "customer service",
  },
  sameAs: ["https://t.me/NolanaReport"],
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": "https://nolanareport.com/#website",
  name: "The Nolana Report",
  alternateName: "Nolana Report",
  url: "https://nolanareport.com",
  description:
    "Weekly briefing covering new businesses, government moves, cross-border trade, and industrial investment across McAllen, Edinburg, Brownsville, and the RGV.",
  publisher: {
    "@id": "https://nolanareport.com/#organization",
  },
  inLanguage: "en-US",
};

const periodicalSchema = {
  "@context": "https://schema.org",
  "@type": "Periodical",
  name: "The Nolana Report",
  url: "https://nolanareport.com",
  publisher: {
    "@id": "https://nolanareport.com/#organization",
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
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Anti-flash: apply dark class before hydration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=localStorage.getItem('nolana-theme');if(s==='dark'||(s===null&&window.matchMedia('(prefers-color-scheme:dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}})()`,
          }}
        />
        {/* Font performance — preconnect + stylesheet link avoids @import waterfall */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          as="style"
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,800;1,400;1,700&family=DM+Sans:wght@400;500;700&family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,600;1,8..60,400&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,800;1,400;1,700&family=DM+Sans:wght@400;500;700&family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,600;1,8..60,400&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          media="print"
          // @ts-expect-error onLoad not typed on link
          onLoad="this.media='all'"
        />
        {/* Hero image preload — reduces LCP */}
        <link rel="preload" as="image" href="/images/hero-nolana-mockup.webp" />
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
        {/* Structured data — Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
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
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-L73X8VT5S1"
          strategy="afterInteractive"
        />
        <Script id="gtag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-L73X8VT5S1');
          `}
        </Script>
        <LenisProvider>
          <Navigation />
          <main aria-label="Main content">{children}</main>
        </LenisProvider>
      </body>
    </html>
  );
}
