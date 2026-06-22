"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslations } from "next-intl";

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

export default function StickyMobileCTA() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [done, setDone] = useState(false);
  const turnstileToken = useRef("");
  const widgetId = useRef<string | null>(null);
  const t = useTranslations("stickyMobileCTA");

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (sessionStorage.getItem("sticky-cta-dismissed") === "1") {
        setDismissed(true);
        return;
      }
    } catch {}

    const heroEl = document.getElementById("signup");
    const pricingEl = document.getElementById("pricing");
    if (!heroEl) return;

    const observer = new IntersectionObserver(
      (entries) => {
        let heroVisible = false;
        let pricingVisible = false;
        entries.forEach((e) => {
          if (e.target.id === "signup") heroVisible = e.isIntersecting;
          if (e.target.id === "pricing") pricingVisible = e.isIntersecting;
        });
        setVisible(!heroVisible && !pricingVisible);
      },
      { threshold: 0.1 },
    );

    observer.observe(heroEl);
    if (pricingEl) observer.observe(pricingEl);
    return () => observer.disconnect();
  }, [dismissed]);

  // Callback ref: the sticky bar (and its Turnstile container) mounts/unmounts
  // as the user scrolls, so render the visible widget when the node attaches
  // and tear it down when it detaches. Polls for the Turnstile global because
  // the shared script may still be loading when the bar first appears.
  const turnstileRef = useCallback((node: HTMLDivElement | null) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const turnstile = (window as any).turnstile;
    if (!node) {
      if (turnstile && widgetId.current) {
        try {
          turnstile.remove(widgetId.current);
        } catch {}
      }
      widgetId.current = null;
      turnstileToken.current = "";
      return;
    }
    if (!TURNSTILE_SITE_KEY || widgetId.current) return;

    const render = () => {
      if (widgetId.current) return;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ts = (window as any).turnstile;
      if (!ts) {
        setTimeout(render, 100);
        return;
      }
      widgetId.current = ts.render(node, {
        sitekey: TURNSTILE_SITE_KEY,
        size: "flexible",
        callback: (token: string) => {
          turnstileToken.current = token;
        },
        "expired-callback": () => {
          turnstileToken.current = "";
        },
      });
    };

    if (!document.getElementById("cf-turnstile-script")) {
      const script = document.createElement("script");
      script.id = "cf-turnstile-script";
      script.src =
        "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.onload = render;
      document.head.appendChild(script);
    }
    render();
  }, []);

  const dismiss = () => {
    setDismissed(true);
    try {
      sessionStorage.setItem("sticky-cta-dismissed", "1");
    } catch {}
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || loading) return;
    setErrorMsg("");

    // Guard: the visible widget fires its success callback once solved. Do not
    // POST until the token ref is populated.
    const token = turnstileToken.current;
    if (!token) {
      setErrorMsg(t("verifyIncomplete"));
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          turnstileToken: token,
          website: "",
        }),
      });
      if (res.ok) {
        setDone(true);
        setTimeout(dismiss, 5000);
      } else {
        setErrorMsg(t("verifyIncomplete"));
      }
    } catch {
      setErrorMsg(t("verifyIncomplete"));
    } finally {
      setLoading(false);
    }
  };

  if (dismissed || !visible) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 lg:hidden sticky-cta-enter">
      <div
        className="bg-navy-deep/95 backdrop-blur-lg border-t border-white/10 px-4 py-3 shadow-2xl"
        style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
      >
        {done ? (
          <div className="flex items-center gap-3 justify-center py-1">
            <div className="w-10 h-10 rounded-full bg-amber-400/20 flex items-center justify-center flex-shrink-0 animate-pulse">
              <svg
                className="w-5 h-5 text-amber-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div className="text-left">
              <p className="font-body text-amber-300 text-sm font-bold leading-tight">
                {t("confirmHeading")}
              </p>
              <p className="font-body text-amber-200/60 text-xs leading-tight mt-0.5">
                {t("confirmBody")}
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("placeholder")}
                required
                aria-label="Email for free brief"
                className="flex-1 min-w-0 px-3 py-2.5 rounded-lg bg-[#1a2a3d] border border-[#2a3a4d] text-warm-white placeholder-[#6b7a8d] font-body text-base focus:outline-none focus:border-teal min-h-[44px]"
              />
              <button
                type="submit"
                disabled={loading}
                className="flex-shrink-0 bg-teal hover:bg-teal-light text-white font-body font-bold text-sm px-4 py-2.5 rounded-lg transition-colors min-h-[44px] disabled:opacity-50"
              >
                {loading ? "..." : t("submit")}
              </button>
              <button
                type="button"
                onClick={dismiss}
                className="flex-shrink-0 p-2 text-slate-light hover:text-warm-white transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Dismiss"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div
              ref={turnstileRef}
              id="cf-turnstile-sticky"
              className="min-h-[65px]"
            />
            {errorMsg && (
              <p className="font-body text-amber-300 text-xs px-1" role="alert">
                {errorMsg}
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
