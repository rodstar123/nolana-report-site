"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { BrandMark } from "@/components/BrandMark";

const PLAN_KEY = "nolana_pending_plan";

async function triggerCheckout(plan: string, email: string): Promise<boolean> {
  const res = await fetch("/api/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ plan, email }),
  });
  const data = (await res.json()) as { url?: string };
  if (data.url) {
    window.location.href = data.url;
    return true;
  }
  return false;
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [exchanging, setExchanging] = useState(false);
  const router = useRouter();
  const t = useTranslations("login");

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("error") === "auth_failed") {
      setError(t("errorExpired"));
    }
  }, [t]);

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash.includes("access_token")) return;

    setExchanging(true);

    const params = new URLSearchParams(hash.substring(1));
    const access_token = params.get("access_token");
    const refresh_token = params.get("refresh_token") ?? "";

    if (!access_token) {
      setError(t("errorInvalid"));
      setExchanging(false);
      return;
    }

    const supabase = createSupabaseBrowserClient();
    supabase.auth
      .setSession({ access_token, refresh_token })
      .then(async ({ data, error: sessionError }) => {
        if (sessionError) {
          console.error("[login] setSession error:", sessionError);
          setError(sessionError.message);
          setExchanging(false);
          return;
        }
        if (!data.session) return;

        const pendingPlan = localStorage.getItem(PLAN_KEY);
        if (pendingPlan && data.session.user.email) {
          localStorage.removeItem(PLAN_KEY);
          const sent = await triggerCheckout(
            pendingPlan,
            data.session.user.email,
          );
          if (sent) return;
        }

        const searchParams = new URLSearchParams(window.location.search);
        const redirectTo = searchParams.get("redirectTo") ?? "/account";
        router.push(redirectTo);
      });
  }, [router, t]);

  if (exchanging) {
    return (
      <main className="min-h-screen bg-navy flex items-center justify-center px-4">
        <div className="text-center">
          <p className="font-body text-slate-light text-lg">{t("signingIn")}</p>
        </div>
      </main>
    );
  }

  if (sent) {
    return (
      <main className="min-h-screen bg-navy flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <h1 className="font-display font-bold text-warm-white text-3xl mb-4">
            {t("checkInbox")}
          </h1>
          <p className="font-body text-slate-light text-lg leading-relaxed mb-6">
            {t("sentLink")}{" "}
            <span className="text-gold font-semibold">{email}</span>.{" "}
            {t("clickToAccess")}
          </p>
          <p className="font-body text-slate-light text-sm">
            {t("didntGet")}{" "}
            <button
              onClick={() => setSent(false)}
              className="text-teal-light underline underline-offset-2 hover:text-teal transition-colors"
            >
              {t("tryAgain")}
            </button>
            .
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-navy flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="flex justify-center mb-8">
          <Link
            href="/"
            className="flex items-center gap-2.5 group"
            aria-label="The Nolana Report — home"
          >
            <BrandMark
              size={20}
              className="text-gold flex-shrink-0 transition-opacity duration-200 group-hover:opacity-80"
            />
            <span className="font-display font-bold text-gold text-xl tracking-widest uppercase transition-opacity duration-200 group-hover:opacity-80">
              The Nolana Report
            </span>
          </Link>
        </div>
        <h1 className="font-display font-bold text-warm-white text-3xl mb-2">
          {t("signIn")}
        </h1>
        <p className="font-body text-slate-light mb-8">{t("subtitle")}</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("placeholder")}
            required
            aria-label="Email address"
            className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-warm-white placeholder-slate-light font-body text-base focus:outline-none focus:border-teal focus:ring-1 focus:ring-teal min-h-[44px]"
          />
          {error && (
            <p className="font-body text-red-400 text-sm" role="alert">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading || !email}
            className="w-full bg-teal hover:bg-teal-light text-white font-body font-bold text-base py-3 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
          >
            {loading ? t("sending") : t("submit")}
          </button>
        </form>

        <p className="font-body text-slate-light text-sm text-center mt-6">
          {t("notSubscriber")}{" "}
          <Link
            href="/"
            className="text-teal-light underline underline-offset-2 hover:text-teal transition-colors"
          >
            {t("signUpFree")}
          </Link>
        </p>
      </div>
    </main>
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const plan = new URLSearchParams(window.location.search).get("plan");
    if (plan) localStorage.setItem(PLAN_KEY, plan);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = (await res.json()) as { success?: boolean; error?: string };

    if (!res.ok || !data.success) {
      setError(data.error ?? t("errorFallback"));
      localStorage.removeItem(PLAN_KEY);
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  }
}
