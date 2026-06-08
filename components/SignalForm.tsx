"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

interface Props {
  subscriberName?: string | null;
  subscriberEmail?: string;
}

export function SignalForm({ subscriberName, subscriberEmail }: Props) {
  const today = new Date().toISOString().split("T")[0];
  const t = useTranslations("signals");

  const [what, setWhat] = useState("");
  const [where, setWhere] = useState("");
  const [when, setWhen] = useState(today);
  const [name, setName] = useState(subscriberName ?? "");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!what.trim()) return;
    setLoading(true);
    setError("");

    const res = await fetch("/api/signals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        what_happened: what,
        location: where || undefined,
        when_observed: when || undefined,
        submitter_name: name || undefined,
      }),
    });

    setLoading(false);

    if (!res.ok) {
      setError(t("errorFallback"));
      return;
    }

    setDone(true);
  };

  if (done) {
    return (
      <div className="text-center py-12">
        <div className="w-12 h-12 rounded-full bg-teal/15 border border-teal/30 flex items-center justify-center mx-auto mb-5">
          <svg
            className="w-6 h-6 text-teal-light"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h2 className="font-display font-bold text-warm-white text-2xl mb-3">
          {t("successHeading")}
        </h2>
        <p className="font-editorial text-slate-light text-base leading-relaxed max-w-sm mx-auto">
          {t("successBody")}
        </p>
        {subscriberEmail && (
          <p className="font-body text-slate-light text-xs mt-4">
            {t("successContact")}
          </p>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block font-body text-xs text-slate-light uppercase tracking-widest mb-2">
          {t("whatLabel")}{" "}
          <span className="text-teal-light normal-case tracking-normal">
            {t("required")}
          </span>
        </label>
        <textarea
          value={what}
          onChange={(e) => setWhat(e.target.value)}
          required
          rows={4}
          placeholder={t("whatPlaceholder")}
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/12 text-warm-white placeholder-slate-light/50 font-body text-sm leading-relaxed focus:outline-none focus:border-teal/50 focus:ring-1 focus:ring-teal/30 resize-none transition-colors"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block font-body text-xs text-slate-light uppercase tracking-widest mb-2">
            {t("whereLabel")}{" "}
            <span className="normal-case tracking-normal text-slate-light/60">
              {t("whereHint")}
            </span>
          </label>
          <input
            type="text"
            value={where}
            onChange={(e) => setWhere(e.target.value)}
            placeholder={t("wherePlaceholder")}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/12 text-warm-white placeholder-slate-light/50 font-body text-sm focus:outline-none focus:border-teal/50 focus:ring-1 focus:ring-teal/30 transition-colors min-h-[44px]"
          />
        </div>
        <div>
          <label className="block font-body text-xs text-slate-light uppercase tracking-widest mb-2">
            {t("whenLabel")}{" "}
            <span className="normal-case tracking-normal text-slate-light/60">
              {t("optional")}
            </span>
          </label>
          <input
            type="date"
            value={when}
            onChange={(e) => setWhen(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/12 text-warm-white font-body text-sm focus:outline-none focus:border-teal/50 focus:ring-1 focus:ring-teal/30 transition-colors min-h-[44px] [color-scheme:dark]"
          />
        </div>
      </div>

      <div>
        <label className="block font-body text-xs text-slate-light uppercase tracking-widest mb-2">
          {t("nameLabel")}{" "}
          <span className="normal-case tracking-normal text-slate-light/60">
            {t("optional")}
          </span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("namePlaceholder")}
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/12 text-warm-white placeholder-slate-light/50 font-body text-sm focus:outline-none focus:border-teal/50 focus:ring-1 focus:ring-teal/30 transition-colors min-h-[44px]"
        />
        <p className="font-body text-xs text-slate-light/60 mt-1.5">
          {t("namePrivacy")}
        </p>
      </div>

      {error && (
        <p className="font-body text-red-400 text-sm" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading || !what.trim()}
        className="w-full bg-teal hover:bg-teal-light disabled:opacity-40 disabled:cursor-not-allowed text-white font-body font-bold text-base py-3.5 rounded-xl transition-colors duration-200 min-h-[48px]"
      >
        {loading ? t("sending") : t("submit")}
      </button>
    </form>
  );
}
