"use client";

import { useState } from "react";
import SignupForm from "./SignupForm";

interface FreeFooterProps {
  variant: "free";
  freeCount: number;
  totalCount: number;
  freeCtaPrompt?: string;
  freeCtaLabel?: string;
}

interface ProFooterProps {
  variant: "pro";
  issueUrl: string;
  referralCode?: string | null;
}

type Props = FreeFooterProps | ProFooterProps;

export function IssueFooter(props: Props) {
  if (props.variant === "free") return <FreeConversion {...props} />;
  return <ProActions {...props} />;
}

function FreeConversion({
  freeCount,
  totalCount,
  freeCtaPrompt,
  freeCtaLabel,
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
        Unlock the full briefing &mdash; Valley Money Map, 3 Moves, and every
        scored story with sub-breakdowns.
      </p>
      <button
        onClick={handleUpgrade}
        disabled={loading}
        className="inline-block bg-teal hover:bg-teal-light text-white font-body font-bold px-10 py-4 rounded-xl text-base transition-colors duration-200 min-h-[52px] disabled:opacity-60 disabled:cursor-wait cursor-pointer"
      >
        {loading ? "Loading..." : "Upgrade to Pro →"}
      </button>
      <p className="font-body text-slate-light dark:text-dark-dim text-xs mt-4">
        $7/mo founding rate &middot; locked forever for the first 100
        subscribers
      </p>

      {freeCtaPrompt && (
        <div className="mt-8 pt-8 border-t border-teal/15">
          <p className="font-body text-slate dark:text-dark-muted text-sm mb-4">
            {freeCtaPrompt}
          </p>
          <div className="max-w-sm mx-auto">
            <SignupForm variant="light" ctaLabel={freeCtaLabel} />
          </div>
        </div>
      )}
    </div>
  );
}

function ProActions({
  issueUrl,
  referralCode,
}: Omit<ProFooterProps, "variant">) {
  const [copied, setCopied] = useState(false);

  const shareUrl = referralCode ? `${issueUrl}?ref=${referralCode}` : issueUrl;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const input = document.createElement("input");
      input.value = shareUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="mt-16 mb-8 rounded-2xl px-8 py-10 text-center bg-navy/[0.03] dark:bg-dark-card border border-cream-dark dark:border-dark-border">
      <p className="font-display font-bold text-charcoal dark:text-dark-text text-xl mb-5">
        Share The Nolana Report with a Valley operator who needs it.
      </p>
      <button
        onClick={handleCopy}
        className="inline-flex items-center gap-2 bg-teal/10 hover:bg-teal/15 dark:bg-teal/20 dark:hover:bg-teal/25 text-teal dark:text-teal-light font-body font-bold px-6 py-3 rounded-xl text-sm transition-colors duration-200 cursor-pointer border border-teal/20"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <rect
            x="9"
            y="9"
            width="13"
            height="13"
            rx="2"
            ry="2"
            strokeWidth={2}
          />
          <path
            d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"
            strokeWidth={2}
          />
        </svg>
        {copied ? "Link copied!" : "Copy referral link"}
      </button>
      <div className="mt-6 flex items-center justify-center gap-4 text-sm">
        <a
          href="/api/billing-portal"
          className="font-body font-medium text-slate-light dark:text-dark-dim hover:text-teal dark:hover:text-teal-light transition-colors"
        >
          Manage subscription
        </a>
      </div>
    </div>
  );
}
