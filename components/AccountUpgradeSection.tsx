"use client";

import { useState } from "react";
import { BillingToggle } from "./BillingToggle";

interface Props {
  email: string;
}

const PLANS = {
  monthly: {
    pro: { label: "Founding $7/mo", plan: "pro" },
    intel: { label: "$19/mo", plan: "intel" },
  },
  yearly: {
    pro: { label: "$89/yr", plan: "pro-yearly", savings: "Save $19" },
    intel: { label: "$189/yr", plan: "intel-yearly", savings: "Save $39" },
  },
} as const;

export function AccountUpgradeSection({ email }: Props) {
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleUpgrade = async (plan: string) => {
    setLoadingPlan(plan);
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan, email }),
    });
    const data = (await res.json()) as { url?: string };
    if (data.url) {
      window.location.href = data.url;
    } else {
      setLoadingPlan(null);
    }
  };

  const p = PLANS[billing];

  return (
    <div className="mt-2">
      <div className="flex justify-start mb-5">
        <BillingToggle value={billing} onChange={setBilling} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Pro card */}
        <div className="rounded-xl border border-teal/30 bg-teal/5 p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="font-body font-bold text-teal-light text-sm uppercase tracking-wide">
              Pro
            </p>
            <div className="flex items-center gap-1.5">
              <span className="font-body text-xs text-teal-light/70 bg-teal/10 px-2 py-0.5 rounded-full">
                {p.pro.label}
              </span>
              {"savings" in p.pro && (
                <span className="font-body text-xs text-gold bg-gold/10 px-2 py-0.5 rounded-full">
                  {p.pro.savings}
                </span>
              )}
            </div>
          </div>
          <p className="font-body text-slate-light text-sm leading-relaxed mb-4">
            Full 30-story briefing scored by business relevance. Full archive
            access.
          </p>
          <button
            onClick={() => handleUpgrade(p.pro.plan)}
            disabled={loadingPlan === p.pro.plan}
            className="inline-flex items-center bg-teal hover:bg-teal-light text-white font-body font-bold text-sm px-5 py-3 rounded-lg transition-colors duration-200 min-h-[44px] disabled:opacity-60 disabled:cursor-wait"
          >
            {loadingPlan === p.pro.plan ? "Loading…" : "Join Pro"}
          </button>
        </div>

        {/* Intel card */}
        <div className="rounded-xl border border-gold/20 bg-gold/5 p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="font-body font-bold text-gold text-sm uppercase tracking-wide">
              Intel
            </p>
            <div className="flex items-center gap-1.5">
              <span className="font-body text-xs text-gold/70 bg-gold/10 px-2 py-0.5 rounded-full">
                {p.intel.label}
              </span>
              {"savings" in p.intel && (
                <span className="font-body text-xs text-gold bg-gold/10 px-2 py-0.5 rounded-full">
                  {p.intel.savings}
                </span>
              )}
            </div>
          </div>
          <p className="font-body text-slate-light text-sm leading-relaxed mb-4">
            Pro plus monthly deep dives on trade, industrial activity, and
            investment.
          </p>
          <button
            onClick={() => handleUpgrade(p.intel.plan)}
            disabled={loadingPlan === p.intel.plan}
            className="inline-flex items-center bg-teal hover:bg-teal-light text-white font-body font-bold text-sm px-5 py-3 rounded-lg transition-colors duration-200 min-h-[44px] disabled:opacity-60 disabled:cursor-wait"
          >
            {loadingPlan === p.intel.plan ? "Loading…" : "Join Intel"}
          </button>
        </div>
      </div>
    </div>
  );
}
