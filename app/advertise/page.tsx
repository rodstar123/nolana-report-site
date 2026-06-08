import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Advertise — The Nolana Report",
  description:
    "Reach Rio Grande Valley business owners every Monday. Sponsorship opportunities with The Nolana Report.",
  alternates: { canonical: "/advertise" },
  robots: { index: false, follow: false },
};

export default function AdvertisePage() {
  return (
    <main className="bg-cream min-h-screen pt-28 pb-24">
      <div className="max-w-2xl mx-auto px-6">
        <div className="mb-10">
          <Link
            href="/"
            className="font-body text-sm text-teal hover:text-teal-light transition-colors"
          >
            ← Back to The Nolana Report
          </Link>
        </div>

        <h1
          className="font-display font-bold text-charcoal mb-3"
          style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)" }}
        >
          Advertise with The Nolana Report
        </h1>
        <p className="font-body text-slate text-base leading-relaxed mb-12">
          Reach Rio Grande Valley business owners, operators, and
          decision-makers every Monday morning.
        </p>

        <div className="prose-nolana font-body text-slate space-y-10 leading-relaxed">
          <section>
            <h2 className="font-display font-bold text-charcoal text-xl mb-4">
              The Audience
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-slate">
              <li>RGV entrepreneurs, small business owners, and executives</li>
              <li>Delivered every Monday via email + web</li>
              <li>Bilingual readership (English &amp; Spanish)</li>
              <li>
                Readers who make purchasing decisions for their businesses
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-display font-bold text-charcoal text-xl mb-4">
              The Format
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-slate">
              <li>
                Sponsored banner displayed on every page of the site — above the
                footer, in a premium placement
              </li>
              <li>
                Inclusion in the weekly email briefing sent to all subscribers
              </li>
              <li>
                Your brand alongside curated RGV business intelligence — not
                buried in a feed
              </li>
            </ul>
            <div
              className="mt-6 rounded-xl p-5"
              style={{
                background: "rgba(13,115,119,0.06)",
                border: "1px solid rgba(13,115,119,0.12)",
              }}
            >
              <p className="font-body text-sm text-slate leading-relaxed">
                Sponsors receive a custom-designed banner card that matches our
                editorial aesthetic — dark theme, gold accents, and your brand
                imagery. We design it for you.
              </p>
            </div>
          </section>

          <section>
            <h2 className="font-display font-bold text-charcoal text-xl mb-4">
              Interested?
            </h2>
            <p className="mb-6">
              We&apos;re selective about sponsors — we only work with businesses
              that serve our readers. If that&apos;s you, let&apos;s talk.
            </p>

            <a
              href="mailto:info@nationalboco.com?subject=Nolana%20Report%20Advertising%20Inquiry"
              className="inline-flex items-center gap-2 font-body font-semibold text-sm text-white px-6 py-3 rounded-lg transition-all duration-200 hover:-translate-y-0.5"
              style={{ background: "var(--teal)" }}
            >
              Contact Us About Sponsorship →
            </a>
            <p className="font-body text-slate-light text-xs mt-3">
              Or email directly:{" "}
              <a
                href="mailto:info@nationalboco.com"
                className="text-teal hover:text-teal-light underline transition-colors"
              >
                info@nationalboco.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
