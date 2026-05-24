import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy — The Nolana Report",
  description: "Privacy policy for The Nolana Report newsletter.",
  robots: { index: false, follow: false },
};

export default function PrivacyPage() {
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
          Privacy Policy
        </h1>
        <p className="font-body text-slate-light text-sm mb-10">
          Last updated: May 2026
        </p>

        <div className="prose-nolana font-body text-slate space-y-8 leading-relaxed">
          <section>
            <h2 className="font-display font-bold text-charcoal text-xl mb-3">
              What We Collect
            </h2>
            <p>
              When you subscribe to The Nolana Report, we collect your email
              address and the date of your subscription. We do not collect
              payment information directly — billing is handled by Stripe.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-charcoal text-xl mb-3">
              How We Use It
            </h2>
            <p>
              Your email is used solely to deliver The Nolana Report newsletter
              and transactional emails related to your subscription (receipts,
              plan changes). We do not sell or share your email with third
              parties for marketing purposes.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-charcoal text-xl mb-3">
              Third-Party Services
            </h2>
            <p>We use the following services to operate the newsletter:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2 text-slate">
              <li>Resend — email delivery</li>
              <li>Stripe — subscription billing</li>
              <li>Vercel — website hosting</li>
              <li>Google Analytics — aggregate site analytics (anonymized)</li>
            </ul>
            <p className="mt-3">
              Each service operates under its own privacy policy.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-charcoal text-xl mb-3">
              Your Rights
            </h2>
            <p>
              You may unsubscribe at any time by clicking the unsubscribe link
              in any newsletter email. To request deletion of your data, email
              us at{" "}
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
              The Nolana Report is published by National Bookkeeping Company®,
              315 W Nolana Ave, McAllen, TX 78504.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-charcoal text-xl mb-3">
              Updates
            </h2>
            <p>
              We may update this policy as the service evolves. Material changes
              will be communicated via newsletter.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
