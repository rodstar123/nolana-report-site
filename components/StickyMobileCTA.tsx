"use client";
import { useState, useEffect } from "react";

export default function StickyMobileCTA() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

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

  const dismiss = () => {
    setDismissed(true);
    try {
      sessionStorage.setItem("sticky-cta-dismissed", "1");
    } catch {}
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          turnstileToken: "",
          website: "",
        }),
      });
      if (res.ok) {
        setDone(true);
        setTimeout(dismiss, 2500);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  };

  if (dismissed || !visible) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 lg:hidden sticky-cta-enter">
      <div className="bg-navy-deep/95 backdrop-blur-lg border-t border-white/10 px-4 py-3 shadow-2xl">
        {done ? (
          <p className="font-body text-teal-light text-sm text-center font-semibold">
            You&apos;re on the list!
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              aria-label="Email for free brief"
              className="flex-1 min-w-0 px-3 py-2.5 rounded-lg bg-[#1a2a3d] border border-[#2a3a4d] text-warm-white placeholder-[#6b7a8d] font-body text-sm focus:outline-none focus:border-teal min-h-[44px]"
            />
            <button
              type="submit"
              disabled={loading}
              className="flex-shrink-0 bg-teal hover:bg-teal-light text-white font-body font-bold text-sm px-4 py-2.5 rounded-lg transition-colors min-h-[44px] disabled:opacity-50"
            >
              {loading ? "..." : "Subscribe Free"}
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
        )}
      </div>
    </div>
  );
}
