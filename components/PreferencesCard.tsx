"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { trackEvent } from "@/lib/analytics";

type LangPref = "en" | "es" | "both";

interface Props {
  initialUnsubscribed: boolean;
  initialAlertEmail: boolean;
  initialLangPref: LangPref;
  tier: "free" | "pro" | "intel";
}

function Toggle({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2 focus-visible:ring-offset-navy ${
        disabled
          ? "cursor-not-allowed opacity-40 bg-white/10"
          : checked
            ? "cursor-pointer bg-teal"
            : "cursor-pointer bg-white/15"
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

const LANG_OPTIONS: { key: LangPref; en: string; es: string }[] = [
  { key: "en", en: "English", es: "English" },
  { key: "es", en: "Español", es: "Español" },
  { key: "both", en: "Both", es: "Ambos" },
];

export function PreferencesCard({
  initialUnsubscribed,
  initialAlertEmail,
  initialLangPref,
  tier,
}: Props) {
  const [briefingOn, setBriefingOn] = useState(!initialUnsubscribed);
  const [alertOn, setAlertOn] = useState(initialAlertEmail);
  const [langPref, setLangPref] = useState<LangPref>(initialLangPref);
  const [saved, setSaved] = useState(false);
  const t = useTranslations("account.preferences");

  const showSaved = useCallback(() => {
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }, []);

  async function updatePref(payload: {
    unsubscribed?: boolean;
    alert_email?: boolean;
    language_preference?: string;
  }) {
    await fetch("/api/preferences", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    showSaved();
  }

  function toggleBriefing(val: boolean) {
    setBriefingOn(val);
    updatePref({ unsubscribed: !val });
    if (!val) trackEvent("unsubscribe", { source: "preferences" });
  }

  function toggleAlert(val: boolean) {
    setAlertOn(val);
    updatePref({ alert_email: val });
  }

  function changeLang(val: LangPref) {
    setLangPref(val);
    updatePref({ language_preference: val });
  }

  const isPaid = tier === "pro" || tier === "intel";

  return (
    <div
      className="rounded-2xl border border-white/8 divide-y divide-white/6"
      style={{ background: "rgba(15,23,34,0.8)" }}
    >
      <div className="px-8 py-5 flex items-center justify-between">
        <p className="font-body text-xs text-slate-light uppercase tracking-widest">
          {t("heading")}
        </p>
        {saved && (
          <span className="font-body text-xs text-teal-light animate-pulse">
            {t("saved")}
          </span>
        )}
      </div>

      <div className="px-6 py-4 flex items-center justify-between gap-4">
        <div>
          <p className="font-body font-semibold text-warm-white text-sm">
            {t("briefing")}
          </p>
          <p className="font-body text-slate-light text-xs mt-0.5">
            {t("briefingDesc")}
          </p>
        </div>
        <Toggle checked={briefingOn} onChange={toggleBriefing} />
      </div>

      <div className="px-6 py-4 flex items-center justify-between gap-4">
        <div>
          <p className="font-body font-semibold text-warm-white text-sm">
            {t("alerts")}
          </p>
          <p className="font-body text-slate-light text-xs mt-0.5">
            {isPaid ? t("alertsActive") : t("alertsLocked")}
          </p>
        </div>
        <Toggle
          checked={isPaid ? alertOn : false}
          onChange={toggleAlert}
          disabled={!isPaid}
        />
      </div>

      <div className="px-6 py-4 flex items-center justify-between gap-4">
        <div>
          <p className="font-body font-semibold text-warm-white text-sm">
            {t("language")}
          </p>
          <p className="font-body text-slate-light text-xs mt-0.5">
            {t("languageDesc")}
          </p>
        </div>
        <div className="flex gap-1.5">
          {LANG_OPTIONS.map((o) => (
            <button
              key={o.key}
              type="button"
              onClick={() => changeLang(o.key)}
              className={`font-body text-xs px-3 py-1.5 rounded-full border transition-colors duration-200 min-h-[32px] ${
                langPref === o.key
                  ? "bg-teal border-teal text-white font-semibold"
                  : "border-white/15 text-slate-light hover:border-teal/50"
              }`}
            >
              {t(`langOption.${o.key}`)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
