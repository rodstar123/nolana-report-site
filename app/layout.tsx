import type { Metadata } from "next";
import "./globals.css";
import Navigation from "@/components/Navigation";
import LenisProvider from "@/components/LenisProvider";

export const metadata: Metadata = {
  title: "The Nolana Report — Business Intelligence for the Rio Grande Valley",
  description:
    "Every Monday, 30 stories that matter most to your Valley business — scored, summarized, ready to act on. Lo que se mueve en el Valle.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://nolanareport.com",
  ),
  openGraph: {
    title: "The Nolana Report",
    description: "Lo que se mueve en el Valle",
    images: ["/images/og-social-card.png"],
    siteName: "The Nolana Report",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Nolana Report",
    description: "Lo que se mueve en el Valle",
    images: ["/images/og-social-card.png"],
  },
  other: {
    publisher: "National Bookkeeping Company®",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <LenisProvider>
          <Navigation />
          <main>{children}</main>
        </LenisProvider>
      </body>
    </html>
  );
}
