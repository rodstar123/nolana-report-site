import type { Metadata } from "next";
import "../globals.css";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { notFound } from "next/navigation";
import Navigation from "@/components/Navigation";
import { HreflangLinks } from "@/components/HreflangLinks";
import { BreadcrumbSchema } from "@/components/BreadcrumbSchema";
import LenisProvider from "@/components/LenisProvider";
import GeoAnalytics from "@/components/GeoAnalytics";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const isEs = params.locale === "es";

  return {
    title:
      "The Nolana Report | RGV Business Intelligence & Weekly Business News",
    description: isEs
      ? "Recibe el reporte semanal de inteligencia de negocios del Valle del Río Grande. Nuevos negocios, comercio transfronterizo, permisos e inversión industrial en McAllen y el RGV."
      : "Get the weekly Rio Grande Valley business intelligence briefing covering new businesses, permits, trade, bridge waits, government moves, and industrial investment across McAllen and the RGV.",
    keywords:
      "Rio Grande Valley, RGV, McAllen, Edinburg, Brownsville, Pharr, Harlingen, business news, business intelligence, cross-border trade, economic development, South Texas, Hidalgo County, Cameron County",
    authors: [{ name: "National Bookkeeping Company" }],
    publisher: "National Bookkeeping Company®",
    creator: "The Nolana Report",
    metadataBase: new URL(
      process.env.NEXT_PUBLIC_SITE_URL ?? "https://nolanareport.com",
    ),
    openGraph: {
      type: "website",
      locale: isEs ? "es_MX" : "en_US",
      alternateLocale: [isEs ? "en_US" : "es_MX"],
      url: "/",
      siteName: "The Nolana Report",
      title: "The Nolana Report — Lo que se mueve en el Valle",
      description: isEs
        ? "Reporte semanal de inteligencia de negocios para el Valle del Río Grande. 30 historias con puntaje y resumen cada lunes."
        : "Weekly business intelligence briefing for the Rio Grande Valley. 30 stories scored and summarized every Monday.",
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
      description: isEs
        ? "Reporte semanal cubriendo nuevos negocios, movimientos del gobierno, comercio transfronterizo en McAllen, Edinburg y el Valle del Río Grande."
        : "Weekly briefing covering new businesses, government moves, cross-border trade across McAllen, Edinburg, and the Rio Grande Valley.",
      images: ["/images/og-social-card.png"],
    },
    icons: {
      icon: "/icon.png",
      apple: "/apple-icon.png",
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
}

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "NewsMediaOrganization",
  "@id": "https://nolanareport.com/#organization",
  name: "The Nolana Report",
  alternateName: "Nolana Report",
  url: "https://nolanareport.com",
  logo: {
    "@type": "ImageObject",
    url: "https://nolanareport.com/icon.png",
    width: 192,
    height: 192,
  },
  description:
    "Get the weekly Rio Grande Valley business intelligence briefing covering new businesses, permits, trade, bridge waits, government moves, and industrial investment across McAllen and the RGV.",
  foundingDate: "2026",
  founder: {
    "@type": "Person",
    name: "Noe Rodriguez",
  },
  inLanguage: ["en", "es"],
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

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const { locale } = params;

  if (!routing.locales.includes(locale as "en" | "es")) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <HreflangLinks />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=localStorage.getItem('nolana-theme');if(s==='dark'||(s===null&&window.matchMedia('(prefers-color-scheme:dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}})()`,
          }}
        />
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
        <link rel="preload" as="image" href="/images/hero-nolana-mockup.webp" />
        <link
          rel="alternate"
          type="application/rss+xml"
          title="The Nolana Report"
          href="/feed.xml"
        />
        <meta name="geo.region" content="US-TX" />
        <meta name="geo.placename" content="McAllen, Texas" />
        <meta name="geo.position" content="26.2034;-98.2300" />
        <meta name="ICBM" content="26.2034, -98.2300" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(periodicalSchema),
          }}
        />
      </head>
      <body>
        <GeoAnalytics />
        <BreadcrumbSchema />
        <NextIntlClientProvider messages={messages}>
          <LenisProvider>
            <Navigation />
            <main aria-label="Main content">{children}</main>
          </LenisProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
