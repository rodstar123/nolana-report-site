"use client";

import { useState } from "react";

interface Props {
  remaining: number;
  email?: string;
}

export function UpgradeBanner({ remaining }: Props) {
  const [loading, setLoading] = useState(false);

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
      <p className="font-mono font-bold text-gold text-3xl mb-1">
        +{remaining}
      </p>
      <h3 className="font-display font-bold text-warm-white text-2xl mb-3">
        more stories scored this week
      </h3>
      <p className="font-body text-slate-light mb-6 max-w-sm mx-auto">
        The signals Valley business owners usually notice too late.
      </p>
      <button
        onClick={handleUpgrade}
        disabled={loading}
        className="bg-teal hover:bg-teal-light text-white font-body font-bold px-8 py-4 rounded-xl text-base transition-colors duration-200 min-h-[52px] disabled:opacity-60 disabled:cursor-wait"
      >
        {loading ? "Loading…" : "Upgrade to Pro — $7/mo founding rate"}
      </button>
      <p className="font-body text-slate-light text-xs mt-4">
        Founding members lock in $7/mo forever · Cancel anytime
      </p>
    </div>
  );
}
