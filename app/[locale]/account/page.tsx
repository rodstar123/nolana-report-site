import { getSubscriber } from "@/lib/get-subscriber";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { createClient } from "@supabase/supabase-js";
import { AccountUpgradeSection } from "@/components/AccountUpgradeSection";
import { UpgradeButton } from "@/components/UpgradeButton";
import { ManageBillingButton } from "@/components/ManageBillingButton";
import { CopyButton } from "@/components/CopyButton";
import { LogOutButton } from "@/components/LogOutButton";
import { PreferencesCard } from "@/components/PreferencesCard";
import { TrackEmailVerified } from "@/components/TrackEmailVerified";

const BADGE_STYLES = {
  free: "bg-white/8 text-slate-light border border-white/12",
  pro: "bg-teal/10 text-teal-light border border-teal/25",
  intel: "bg-gold/10 text-gold border border-gold/25",
} as const;

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

async function getLatestIssue() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return null;
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
  const { data } = await admin
    .from("issues")
    .select("slug, title, published_at")
    .eq("is_published", true)
    .order("published_at", { ascending: false })
    .limit(1)
    .single();
  return data as { slug: string; title: string; published_at: string } | null;
}

export default async function AccountPage({
  searchParams,
}: {
  searchParams: { upgraded?: string };
}) {
  const [subscriber, latestIssue] = await Promise.all([
    getSubscriber(),
    getLatestIssue(),
  ]);

  if (!subscriber) redirect("/login");

  const tier = subscriber.tier as "free" | "pro" | "intel";
  const justUpgraded = searchParams.upgraded === "true";
  const displayName = subscriber.name ?? subscriber.email;

  const t = await getTranslations("account");
  const tierT = t.raw(`tiers.${tier}`) as {
    label: string;
    tagline: string;
    price: string;
  };

  return (
    <main
      className="min-h-screen pb-24"
      style={{
        background:
          "linear-gradient(160deg, #0b1320 0%, #0f1722 40%, #111d2e 100%)",
      }}
    >
      <TrackEmailVerified />
      <div className="max-w-3xl mx-auto px-4 pt-20 space-y-5">
        {/* Welcome header */}
        <div
          className="rounded-2xl p-8 border border-white/8"
          style={{ background: "rgba(15,23,34,0.8)" }}
        >
          {justUpgraded && (
            <div className="mb-6 px-4 py-3 rounded-lg bg-teal/10 border border-teal/25">
              <p className="font-body text-sm font-semibold text-teal-light">
                {t("welcomePro")}
              </p>
            </div>
          )}

          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="font-body text-slate-light text-sm mb-1">
                {t("welcomeBack")}
              </p>
              <h1 className="font-display font-bold text-warm-white text-3xl md:text-4xl leading-tight">
                {displayName}
              </h1>
            </div>
            <span
              className={`font-body font-bold text-sm px-4 py-1.5 rounded-full tracking-wider uppercase ${BADGE_STYLES[tier]}`}
            >
              {tierT.label}
            </span>
          </div>

          <p className="font-editorial text-slate-light text-base mt-4 leading-relaxed">
            {tierT.tagline}
          </p>

          {tier === "free" && (
            <div
              className="mt-6 rounded-xl p-px"
              style={{
                background:
                  "linear-gradient(135deg, rgba(212,168,67,0.4) 0%, rgba(212,168,67,0.1) 100%)",
              }}
            >
              <div className="rounded-xl bg-navy-deep px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="font-body font-bold text-warm-white text-base">
                    {t("unlockFull")}
                  </p>
                  <p className="font-body text-slate-light text-sm mt-0.5">
                    {t("foundingRate")}
                  </p>
                </div>
                <UpgradeButton
                  label={t("upgradePro")}
                  plan="pro"
                  email={subscriber.email}
                />
              </div>
            </div>
          )}
        </div>

        {/* Subscription card */}
        <div
          className="rounded-2xl p-8 border border-white/8"
          style={{ background: "rgba(15,23,34,0.8)" }}
        >
          <p className="font-body text-xs text-slate-light uppercase tracking-widest mb-6">
            {t("subscription")}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
            <div>
              <p className="font-body text-xs text-slate-light uppercase tracking-widest mb-1.5">
                {t("plan")}
              </p>
              <p className="font-body font-bold text-warm-white text-lg">
                {tierT.label}
              </p>
              <p className="font-body text-slate-light text-sm">
                {tierT.price}
              </p>
            </div>
            <div>
              <p className="font-body text-xs text-slate-light uppercase tracking-widest mb-1.5">
                {t("memberSince")}
              </p>
              <p className="font-body text-warm-white">
                {formatDate(subscriber.created_at)}
              </p>
            </div>
            <div>
              <p className="font-body text-xs text-slate-light uppercase tracking-widest mb-1.5">
                {t("email")}
              </p>
              <p className="font-body text-warm-white text-sm break-all">
                {subscriber.email}
              </p>
            </div>
          </div>

          {tier !== "free" && subscriber.current_period_end && (
            <div className="mb-6">
              <p className="font-body text-xs text-slate-light uppercase tracking-widest mb-1.5">
                {t("renews")}
              </p>
              <p className="font-body text-warm-white">
                {formatDate(subscriber.current_period_end)}
              </p>
            </div>
          )}

          {tier !== "free" && subscriber.stripe_customer_id && (
            <ManageBillingButton customerId={subscriber.stripe_customer_id} />
          )}

          {tier === "free" && (
            <AccountUpgradeSection email={subscriber.email} />
          )}
        </div>

        {/* Email Preferences */}
        <PreferencesCard
          initialUnsubscribed={subscriber.unsubscribed}
          initialAlertEmail={subscriber.alert_preferences?.email ?? true}
          initialLangPref={subscriber.language_preference ?? "en"}
          tier={tier}
        />

        {/* Telegram */}
        <div
          className="rounded-2xl border border-white/8 overflow-hidden"
          style={{ background: "rgba(15,23,34,0.8)" }}
        >
          <div className="px-6 py-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#229ED9]/15 flex items-center justify-center shrink-0">
                <svg
                  className="w-5 h-5 text-[#229ED9]"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                </svg>
              </div>
              <div>
                <p className="font-body font-semibold text-warm-white text-sm">
                  {t("telegram.heading")}
                </p>
                <p className="font-body text-slate-light text-xs mt-0.5">
                  {t("telegram.body")}
                </p>
              </div>
            </div>
            <a
              href="https://t.me/NolanaReport"
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 font-body text-sm font-semibold text-[#229ED9] hover:text-[#1a8bc2] transition-colors"
            >
              {t("telegram.join")}
            </a>
          </div>
        </div>

        {/* Past Issues */}
        <div
          className="rounded-2xl border border-white/8 overflow-hidden"
          style={{ background: "rgba(15,23,34,0.8)" }}
        >
          <div className="px-8 py-5 border-b border-white/6 flex items-center justify-between">
            <p className="font-body text-xs text-slate-light uppercase tracking-widest">
              {t("pastIssues")}
            </p>
            <Link
              href="/issues"
              className="font-body text-xs text-teal-light hover:text-teal transition-colors"
            >
              {t("viewAll")}
            </Link>
          </div>

          {latestIssue ? (
            <Link
              href={`/issues/${latestIssue.slug}` as "/issues"}
              className="block px-8 py-5 hover:bg-white/3 transition-colors group"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-body text-xs text-slate-light uppercase tracking-widest mb-1">
                    {t("latestBriefing")}
                  </p>
                  <p className="font-editorial font-semibold text-warm-white text-base group-hover:text-teal-light transition-colors">
                    {latestIssue.title}
                  </p>
                  <p className="font-body text-slate-light text-xs mt-1">
                    {formatDate(latestIssue.published_at)}
                  </p>
                </div>
                <span className="font-body text-teal-light text-sm shrink-0 group-hover:translate-x-0.5 transition-transform">
                  {t("read")}
                </span>
              </div>
            </Link>
          ) : (
            <div className="px-8 py-5">
              <p className="font-body text-slate-light text-sm">
                {t("firstIssue")}
              </p>
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div
          className="rounded-2xl border border-white/8 divide-y divide-white/6"
          style={{ background: "rgba(15,23,34,0.8)" }}
        >
          <div className="px-6 py-4 flex items-center justify-between">
            <div>
              <p className="font-body font-semibold text-warm-white text-sm">
                {t("sendTip")}
              </p>
              <p className="font-body text-slate-light text-xs mt-0.5">
                {t("tipBody")}
              </p>
            </div>
            <Link
              href="/signals"
              className="font-body text-sm text-teal-light hover:text-teal transition-colors font-semibold"
            >
              {t("send")}
            </Link>
          </div>

          <div className="px-6 py-4">
            <div className="flex items-center justify-between mb-2">
              <p className="font-body font-semibold text-warm-white text-sm">
                {t("referral")}
              </p>
              <div className="flex items-center gap-3">
                <span className="font-mono text-gold text-sm tracking-wider">
                  {subscriber.referral_code}
                </span>
                <CopyButton text={subscriber.referral_code} />
              </div>
            </div>
            <p className="font-body text-slate-light text-xs leading-relaxed">
              {t("referralBody")}
            </p>
          </div>

          <div className="px-6 py-4 flex items-center justify-between">
            <p className="font-body text-slate-light text-sm">
              {t("signedInAs")}{" "}
              <span className="text-warm-white">{subscriber.email}</span>
            </p>
            <LogOutButton />
          </div>
        </div>
      </div>
    </main>
  );
}
