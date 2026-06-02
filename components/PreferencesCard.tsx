"use client";

import { useState, useCallback } from "react";
import { trackEvent } from "@/lib/analytics";

interface Props {
  initialUnsubscribed: boolean;
  initialAlertEmail: boolean;
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

export function PreferencesCard({
  initialUnsubscribed,
  initialAlertEmail,
  tier,
}: Props) {
  const [briefingOn, setBriefingOn] = useState(!initialUnsubscribed);
  const [alertOn, setAlertOn] = useState(initialAlertEmail);
  const [saved, setSaved] = useState(false);

  const showSaved = useCallback(() => {
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }, []);

  async function updatePref(payload: {
    unsubscribed?: boolean;
    alert_email?: boolean;
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

  const isPaid = tier === "pro" || tier === "intel";

  return (
    <div
      className="rounded-2xl border border-white/8 divide-y divide-white/6"
      style={{ background: "rgba(15,23,34,0.8)" }}
    >
      <div className="px-8 py-5 flex items-center justify-between">
        <p className="font-body text-xs text-slate-light uppercase tracking-widest">
          Email Preferences
        </p>
        {saved && (
          <span className="font-body text-xs text-teal-light animate-pulse">
            Saved
          </span>
        )}
      </div>

      <div className="px-6 py-4 flex items-center justify-between gap-4">
        <div>
          <p className="font-body font-semibold text-warm-white text-sm">
            Weekly Briefing Emails
          </p>
          <p className="font-body text-slate-light text-xs mt-0.5">
            Monday morning summary delivered to your inbox
          </p>
        </div>
        <Toggle checked={briefingOn} onChange={toggleBriefing} />
      </div>

      <div className="px-6 py-4 flex items-center justify-between gap-4">
        <div>
          <p className="font-body font-semibold text-warm-white text-sm">
            Breaking News Email Alerts
          </p>
          <p className="font-body text-slate-light text-xs mt-0.5">
            {isPaid
              ? "Real-time alerts when high-scoring stories break"
              : "Available on Pro and Intel plans"}
          </p>
        </div>
        <Toggle
          checked={isPaid ? alertOn : false}
          onChange={toggleAlert}
          disabled={!isPaid}
        />
      </div>
    </div>
  );
}
