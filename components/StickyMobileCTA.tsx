"use client";
import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

export default function StickyMobileCTA() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [done, setDone] = useState(false);
  const turnstileToken = useRef("");
  const widgetContainerRef = useRef<HTMLDivElement>(null);
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

  useEffect(() => {
    if (!TURNSTILE_SITE_KEY) return;
    let cancelled = false;
    // The container is always mounted (off-screen), so render once the
    // Turnstile global is ready. Poll because the shared script may have been
    // added by SignupForm and may still be loading when this effect runs.
    const tryRender = () => {
      if (cancelled || widgetId.current || !widgetContainerRef.current) return;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const turnstile = (window as any).turnstile;
      if (!turnstile) {
        setTimeout(tryRender, 100);
        return;
      }
      widgetId.current = turnstile.render(widgetContainerRef.current, {
        sitekey: TURNSTILE_SITE_KEY,
        size: "invisible",
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
      script.onload = tryRender;
      document.head.appendChild(script);
    }
    tryRender();
    return () => {
      cancelled = true;
    };
  }, []);

  const dismiss = () => {
    setDismissed(true);
    try {
      sessionStorage.setItem("sticky-cta-dismissed", "1");
    } catch {}
  };

  // Turnstile solves async (managed mode). Wait for the token before POSTing
  // so we never submit an empty token. Resolves "" on timeout.
  const waitForToken = (timeoutMs = 8000): Promise<string> => {
    if (turnstileToken.current) return Promise.resolve(turnstileToken.current);
    return new Promise((resolve) => {
      const startedAt = Date.now();
      const interval = setInterval(() => {
        if (turnstileToken.current) {
          clearInterval(interval);
          resolve(turnstileToken.current);
        } else if (Date.now() - startedAt > timeoutMs) {
          clearInterval(interval);
          resolve("");
        }
      }, 150);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || loading || verifying) return;
    setErrorMsg("");

    // Guard: do not POST until Turnstile has produced a token. The invisible
    // widget auto-runs once on render; if that token is missing/expired,
    // actively run a fresh challenge before waiting.
    let token = turnstileToken.current;
    if (!token) {
      setVerifying(true);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const turnstile = (window as any).turnstile;
      if (turnstile && widgetId.current) {
        turnstile.reset(widgetId.current);
        turnstile.execute(widgetId.current);
      }
      token = await waitForToken();
      setVerifying(false);
      if (!token) {
        setErrorMsg(t("verifyTimeout"));
        return;
      }
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
        setErrorMsg(t("verifyTimeout"));
      }
    } catch {
      setErrorMsg(t("verifyTimeout"));
    } finally {
      setLoading(false);
    }
  };

  // Always-mounted, off-screen Turnstile host. Kept out of the conditional
  // sticky bar so the invisible widget can render/execute even before the bar
  // is visible (invisible Turnstile cannot run on a display:none node).
  const turnstileHost = (
    <div
      ref={widgetContainerRef}
      id="cf-turnstile-sticky"
      aria-hidden="true"
      style={{
        position: "absolute",
        left: "-9999px",
        top: 0,
        width: 0,
        height: 0,
        overflow: "hidden",
      }}
    />
  );

  if (dismissed || !visible) return turnstileHost;

  return (
    <>
      {turnstileHost}
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
            <>
              <form onSubmit={handleSubmit} className="flex items-center gap-2">
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
                  disabled={loading || verifying}
                  className="flex-shrink-0 bg-teal hover:bg-teal-light text-white font-body font-bold text-sm px-4 py-2.5 rounded-lg transition-colors min-h-[44px] disabled:opacity-50"
                >
                  {verifying ? t("verifying") : loading ? "..." : t("submit")}
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
              </form>
              {errorMsg && (
                <p
                  className="font-body text-amber-300 text-xs mt-1.5 px-1"
                  role="alert"
                >
                  {errorMsg}
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
