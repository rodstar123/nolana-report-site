"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { trackEvent } from "@/lib/analytics";

interface Props {
  remaining: number;
  total: number;
  email?: string;
}

export function UpgradeBanner({ remaining, total }: Props) {
  const [loading, setLoading] = useState(false);
  const t = useTranslations("issue");

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: "pro" }),
      });
      const data = (await res.json()) as { url?: string };
      if (data.url) {
        trackEvent("upgrade_click", { plan: "pro", source: "paywall" });
        window.location.href = data.url;
        return;
      }
    } catch {}
    setLoading(false);
  };

  return (
    <div
      className="my-10 p-8 rounded-2xl text-center"
      style={{
        background: "linear-gradient(135deg, #0f1722 0%, #1a2332 100%)",
        border: "2px solid rgba(212,168,67,0.3)",
      }}
    >
      <h3 className="font-display font-bold text-warm-white text-2xl mb-2">
        {t("upgradeBanner.heading")}
      </h3>
      <p className="font-body text-slate-light mb-5">
        {t("upgradeBanner.reading", { shown: total - remaining, total })}
      </p>
      <p className="font-body text-sm text-gold font-semibold mb-3">
        {t("upgradeBanner.proGets")}
      </p>
      <ul className="font-body text-sm text-slate-light mb-6 space-y-1.5 max-w-sm mx-auto text-left list-disc pl-5">
        <li>{t("upgradeBanner.feature1")}</li>
        <li>{t("upgradeBanner.feature2")}</li>
        <li>{t("upgradeBanner.feature3")}</li>
        <li>{t("upgradeBanner.feature4")}</li>
        <li>{t("upgradeBanner.feature5")}</li>
        <li>{t("upgradeBanner.feature6")}</li>
      </ul>
      <button
        onClick={handleUpgrade}
        disabled={loading}
        className="bg-teal hover:bg-teal-light text-white font-body font-bold px-8 py-4 rounded-xl text-base transition-colors duration-200 min-h-[52px] disabled:opacity-60 disabled:cursor-wait"
      >
        {loading ? t("upgradeBanner.loading") : t("upgradeBanner.cta")}
      </button>
      <p className="font-body text-slate-light text-xs mt-4">
        {t("upgradeBanner.fineprint")}
      </p>
    </div>
  );
}
