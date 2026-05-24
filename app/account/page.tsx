import { getSubscriber } from "@/lib/get-subscriber";
import { redirect } from "next/navigation";
import Link from "next/link";
import { UpgradeButton } from "@/components/UpgradeButton";
import { ManageBillingButton } from "@/components/ManageBillingButton";

const TIER_LABELS: Record<string, string> = {
  free: "Stay Aware (Free)",
  pro: "Stay Ahead (Pro)",
  intel: "See the Bigger Moves (Intel)",
};

const TIER_COLORS: Record<string, string> = {
  free: "bg-white/10 text-slate-light",
  pro: "bg-teal/20 text-teal-light",
  intel: "bg-gold/20 text-gold",
};

export default async function AccountPage({
  searchParams,
}: {
  searchParams: { upgraded?: string };
}) {
  const subscriber = await getSubscriber();
  if (!subscriber) redirect("/login");

  const justUpgraded = searchParams.upgraded === "true";

  return (
    <main
      className="min-h-screen py-24 px-4"
      style={{ background: "linear-gradient(to bottom, #0f1722, #1a2332)" }}
    >
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <Link
            href="/"
            className="font-body text-sm text-teal-light hover:text-teal transition-colors"
          >
            ← The Nolana Report
          </Link>
        </div>

        <h1 className="font-display font-bold text-warm-white text-4xl mb-8">
          Your Account
        </h1>

        {justUpgraded && (
          <div className="bg-teal/10 border border-teal/30 rounded-xl p-5 mb-6">
            <p className="font-body font-semibold text-teal-light">
              Welcome to Pro. Full briefings start this Monday.
            </p>
          </div>
        )}

        {/* Email */}
        <div className="bg-navy-deep border border-white/10 rounded-xl p-6 mb-4">
          <p className="font-body text-xs text-slate-light uppercase tracking-widest mb-2">
            Email
          </p>
          <p className="font-body text-warm-white text-lg">
            {subscriber.email}
          </p>
        </div>

        {/* Plan */}
        <div className="bg-navy-deep border border-white/10 rounded-xl p-6 mb-4">
          <p className="font-body text-xs text-slate-light uppercase tracking-widest mb-2">
            Current Plan
          </p>
          <div className="flex items-center gap-3 mb-4">
            <span
              className={`font-body font-bold text-lg px-3 py-1 rounded-full text-sm ${TIER_COLORS[subscriber.tier]}`}
            >
              {TIER_LABELS[subscriber.tier]}
            </span>
          </div>

          {subscriber.tier === "free" && (
            <div className="flex flex-wrap gap-3">
              <UpgradeButton
                label="Upgrade to Pro — $7/mo founding rate"
                priceId={
                  process.env.STRIPE_FOUNDING_PRO_PRICE_ID ??
                  process.env.STRIPE_PRO_PRICE_ID ??
                  ""
                }
                email={subscriber.email}
              />
              <UpgradeButton
                label="Upgrade to Intel — $19/mo"
                priceId={process.env.STRIPE_INTEL_PRICE_ID ?? ""}
                email={subscriber.email}
              />
            </div>
          )}

          {subscriber.stripe_customer_id && (
            <ManageBillingButton customerId={subscriber.stripe_customer_id} />
          )}
        </div>

        {/* Member info */}
        <div className="bg-navy-deep border border-white/10 rounded-xl p-6 mb-4">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="font-body text-xs text-slate-light uppercase tracking-widest mb-2">
                Member Since
              </p>
              <p className="font-body text-warm-white">
                {new Date(subscriber.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <div>
              <p className="font-body text-xs text-slate-light uppercase tracking-widest mb-2">
                Referral Code
              </p>
              <p className="font-mono text-gold text-lg tracking-wider">
                {subscriber.referral_code}
              </p>
              <p className="font-body text-slate-light text-xs mt-1">
                Share to give a friend free Pro access
              </p>
            </div>
          </div>
        </div>

        {/* Links */}
        <div className="bg-navy-deep border border-white/10 rounded-xl p-6">
          <Link
            href="/issues"
            className="font-body text-teal-light hover:text-teal transition-colors text-sm"
          >
            Browse all issues →
          </Link>
        </div>
      </div>
    </main>
  );
}
