"use client";

import { useState } from "react";

interface FreeFooterProps {
  variant: "free";
  freeCount: number;
  totalCount: number;
}

interface ProFooterProps {
  variant: "pro";
  issueUrl: string;
}

type Props = FreeFooterProps | ProFooterProps;

export function IssueFooter(props: Props) {
  if (props.variant === "free") return <FreeConversion {...props} />;
  return <ProActions {...props} />;
}

function FreeConversion({
  freeCount,
  totalCount,
}: Omit<FreeFooterProps, "variant">) {
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
    <div className="mt-16 mb-8 rounded-2xl px-8 py-12 text-center bg-teal/[0.06] dark:bg-teal/[0.08] border border-teal/20">
      <p className="font-display font-bold text-charcoal dark:text-dark-text text-2xl mb-3">
        You&rsquo;re seeing {freeCount} of {totalCount} stories this week.
      </p>
      <p className="font-body text-slate dark:text-dark-muted text-base max-w-md mx-auto mb-8 leading-relaxed">
        RGV business owners use The Nolana Report to spot opportunities before
        the competition.
      </p>
      <button
        onClick={handleUpgrade}
        disabled={loading}
        className="inline-block bg-teal hover:bg-teal-light text-white font-body font-bold px-10 py-4 rounded-xl text-base transition-colors duration-200 min-h-[52px] disabled:opacity-60 disabled:cursor-wait cursor-pointer"
      >
        {loading ? "Loading…" : "Unlock the full briefing →"}
      </button>
      <p className="font-body text-slate-light dark:text-dark-dim text-xs mt-4">
        Founding members lock in $7/mo forever.
      </p>
    </div>
  );
}

function ProActions({ issueUrl }: Omit<ProFooterProps, "variant">) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(issueUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const input = document.createElement("input");
      input.value = issueUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="mt-16 mb-8 pt-8 border-t border-cream-dark dark:border-dark-border flex items-center justify-center gap-6 flex-wrap">
      <button
        onClick={handleCopy}
        className="font-body text-sm font-medium text-slate dark:text-dark-muted hover:text-teal dark:hover:text-teal-light transition-colors"
      >
        {copied ? "Link copied!" : "Share this briefing"}
      </button>
      <span className="text-cream-dark dark:text-dark-border select-none">
        |
      </span>
      <a
        href="/api/billing-portal"
        className="font-body text-sm font-medium text-slate dark:text-dark-muted hover:text-teal dark:hover:text-teal-light transition-colors"
      >
        Manage subscription
      </a>
    </div>
  );
}
