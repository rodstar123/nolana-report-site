import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service — The Nolana Report",
  description: "Terms of service for The Nolana Report newsletter.",
  alternates: { canonical: "/terms" },
  robots: { index: false, follow: false },
};

export default function TermsPage() {
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
          className="font-display font-bold text-charcoal mb-2"
          style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)" }}
        >
          Terms of Service
        </h1>
        <p className="font-body text-slate-light text-sm mb-10">
          Last updated: May 2026
        </p>

        <div className="prose-nolana font-body text-slate space-y-8 leading-relaxed">
          <section>
            <h2 className="font-display font-bold text-charcoal text-xl mb-3">
              The Service
            </h2>
            <p>
              The Nolana Report is a weekly business intelligence newsletter
              covering the Rio Grande Valley. It is published by National
              Bookkeeping Company® and delivered to subscribers each Monday.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-charcoal text-xl mb-3">
              Subscription Tiers
            </h2>
            <p>The newsletter is available on three tiers:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2 text-slate">
              <li>
                <strong>Free</strong> — weekly summary, limited story access
              </li>
              <li>
                <strong>Pro ($9/mo)</strong> — full story access, scored
                briefings
              </li>
              <li>
                <strong>Intel ($19/mo)</strong> — Pro plus exclusive industrial
                and cross-border data
              </li>
            </ul>
            <p className="mt-3">
              Paid subscriptions are billed monthly through Stripe. You may
              cancel at any time; access continues through the end of the
              billing period.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-charcoal text-xl mb-3">
              Content
            </h2>
            <p>
              Content in The Nolana Report is editorial in nature and provided
              for informational purposes only. It does not constitute legal,
              financial, or investment advice. Stories are sourced from public
              records, government filings, and local reporting; accuracy is not
              guaranteed and the publisher bears no liability for actions taken
              based on newsletter content.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-charcoal text-xl mb-3">
              Acceptable Use
            </h2>
            <p>
              Subscribers may not redistribute, republish, or resell newsletter
              content without written permission. Sharing individual stories for
              personal, non-commercial purposes is permitted with attribution.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-charcoal text-xl mb-3">
              Cancellation & Refunds
            </h2>
            <p>
              You may cancel your paid subscription at any time. We do not offer
              prorated refunds for partial billing periods. To request a refund
              in exceptional circumstances, contact us at{" "}
              <a
                href="mailto:info@nationalboco.com"
                className="text-teal hover:text-teal-light underline transition-colors"
              >
                info@nationalboco.com
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-charcoal text-xl mb-3">
              Publisher
            </h2>
            <p>
              National Bookkeeping Company®
              <br />
              315 W Nolana Ave, McAllen, TX 78504
              <br />
              <a
                href="mailto:info@nationalboco.com"
                className="text-teal hover:text-teal-light underline transition-colors"
              >
                info@nationalboco.com
              </a>
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-charcoal text-xl mb-3">
              Changes
            </h2>
            <p>
              We may update these terms as the service evolves. Continued
              subscription after notice of changes constitutes acceptance.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
