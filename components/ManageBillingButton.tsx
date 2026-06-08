"use client";

import { useTranslations } from "next-intl";

interface Props {
  customerId: string;
}

export function ManageBillingButton({ customerId }: Props) {
  const t = useTranslations("account");

  const handleClick = async () => {
    const res = await fetch("/api/billing-portal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customerId }),
    });
    const data = (await res.json()) as { url?: string };
    if (data.url) window.location.href = data.url;
  };

  return (
    <button
      onClick={handleClick}
      className="inline-flex items-center border border-white/20 hover:border-teal text-slate-light hover:text-teal-light font-body font-bold text-sm px-5 py-3 rounded-lg transition-colors duration-200 min-h-[44px] mt-3"
    >
      {t("manageBilling")}
    </button>
  );
}
