"use client";

import { trackEvent } from "@/lib/analytics";

interface Props {
  label: string;
  email: string;
  plan?: string;
  priceId?: string;
}

export function UpgradeButton({ label, plan, priceId, email }: Props) {
  const handleClick = async () => {
    const payload = plan ? { plan, email } : { priceId, email };
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = (await res.json()) as { url?: string };
    if (data.url) {
      trackEvent("upgrade_click", {
        plan: plan ?? "custom",
        source: "account",
      });
      window.location.href = data.url;
    }
  };

  return (
    <button
      onClick={handleClick}
      className="inline-flex items-center bg-teal hover:bg-teal-light text-white font-body font-bold text-sm px-5 py-3 rounded-lg transition-colors duration-200 min-h-[44px]"
    >
      {label}
    </button>
  );
}
