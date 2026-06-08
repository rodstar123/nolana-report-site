"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const t = useTranslations("account");

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="font-body text-xs px-3 py-1.5 rounded-md border border-gold/30 text-gold hover:bg-gold/10 transition-colors duration-200 min-h-[32px]"
    >
      {copied ? t("copied") : t("copy")}
    </button>
  );
}
