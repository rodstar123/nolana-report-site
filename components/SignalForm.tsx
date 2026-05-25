"use client";

import { useState } from "react";

interface Props {
  subscriberName?: string | null;
  subscriberEmail?: string;
}

export function SignalForm({ subscriberName, subscriberEmail }: Props) {
  const today = new Date().toISOString().split("T")[0];

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
      setError("Something went wrong. Try again.");
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
          Got it.
        </h2>
        <p className="font-editorial text-slate-light text-base leading-relaxed max-w-sm mx-auto">
          We&apos;ll look into this. If it checks out, you&apos;ll see it in a
          future Monday briefing.
        </p>
        {subscriberEmail && (
          <p className="font-body text-slate-light text-xs mt-4">
            We have your contact on file if we need to follow up.
          </p>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* What */}
      <div>
        <label className="block font-body text-xs text-slate-light uppercase tracking-widest mb-2">
          What&apos;s happening?{" "}
          <span className="text-teal-light normal-case tracking-normal">
            required
          </span>
        </label>
        <textarea
          value={what}
          onChange={(e) => setWhat(e.target.value)}
          required
          rows={4}
          placeholder="Construction crews showed up at the old Sears building on 10th. Looks like they're gutting the interior."
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/12 text-warm-white placeholder-slate-light/50 font-body text-sm leading-relaxed focus:outline-none focus:border-teal/50 focus:ring-1 focus:ring-teal/30 resize-none transition-colors"
        />
      </div>

      {/* Where + When — side by side on desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block font-body text-xs text-slate-light uppercase tracking-widest mb-2">
            Where?{" "}
            <span className="normal-case tracking-normal text-slate-light/60">
              city, intersection, or address — optional
            </span>
          </label>
          <input
            type="text"
            value={where}
            onChange={(e) => setWhere(e.target.value)}
            placeholder="McAllen 10th & Nolana"
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/12 text-warm-white placeholder-slate-light/50 font-body text-sm focus:outline-none focus:border-teal/50 focus:ring-1 focus:ring-teal/30 transition-colors min-h-[44px]"
          />
        </div>
        <div>
          <label className="block font-body text-xs text-slate-light uppercase tracking-widest mb-2">
            When did you notice this?{" "}
            <span className="normal-case tracking-normal text-slate-light/60">
              optional
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

      {/* Name */}
      <div>
        <label className="block font-body text-xs text-slate-light uppercase tracking-widest mb-2">
          Your name{" "}
          <span className="normal-case tracking-normal text-slate-light/60">
            optional
          </span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="First name is fine"
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/12 text-warm-white placeholder-slate-light/50 font-body text-sm focus:outline-none focus:border-teal/50 focus:ring-1 focus:ring-teal/30 transition-colors min-h-[44px]"
        />
        <p className="font-body text-xs text-slate-light/60 mt-1.5">
          We never share who sent a tip.
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
        {loading ? "Sending…" : "Send Tip"}
      </button>
    </form>
  );
}
