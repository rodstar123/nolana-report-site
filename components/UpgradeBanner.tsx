"use client";

import { useState } from "react";
import { trackEvent } from "@/lib/analytics";

interface Props {
  remaining: number;
  total: number;
  email?: string;
}

export function UpgradeBanner({ remaining, total }: Props) {
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
        The Full Briefing Is Where the Moves Are
      </h3>
      <p className="font-body text-slate-light mb-5">
        You&rsquo;re reading {total - remaining} of {total} scored stories.
      </p>
      <p className="font-body text-sm text-gold font-semibold mb-3">
        Pro members get:
      </p>
      <ul className="font-body text-sm text-slate-light mb-6 space-y-1.5 max-w-sm mx-auto text-left list-disc pl-5">
        <li>The full weekly RGV business briefing</li>
        <li>The Valley Money Map — where money is moving and who wins</li>
        <li>
          &ldquo;3 Moves This Week&rdquo; — cross-story actions tagged by
          industry
        </li>
        <li>Opportunity and risk breakdowns on every story</li>
        <li>&ldquo;Who should act&rdquo; notes by operator type</li>
        <li>Early signals most owners notice too late</li>
      </ul>
      <button
        onClick={handleUpgrade}
        disabled={loading}
        className="bg-teal hover:bg-teal-light text-white font-body font-bold px-8 py-4 rounded-xl text-base transition-colors duration-200 min-h-[52px] disabled:opacity-60 disabled:cursor-wait"
      >
        {loading ? "Loading…" : "Unlock Pro — $7/mo founding rate"}
      </button>
      <p className="font-body text-slate-light text-xs mt-4">
        Founding members lock in $7/mo forever · Cancel anytime
      </p>
    </div>
  );
}
