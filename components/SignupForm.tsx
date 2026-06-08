"use client";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useLocale } from "next-intl";
import { trackEvent } from "@/lib/analytics";

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

interface Props {
  variant?: "dark" | "light";
}

type FormStatus =
  | "idle"
  | "loading"
  | "success"
  | "already_subscribed"
  | "pending_confirmation"
  | "error";

const copy = {
  en: {
    placeholder: "your@email.com",
    submitIdle: "Get the Free Monday Brief",
    submitLoading: "Subscribing…",
    checkbox: "I agree to receive The Nolana Report weekly via email",
    confirmHeading: "Almost there! Confirm your email.",
    confirmBody: (email: string) =>
      `We just sent a confirmation link to ${email}. Click it to activate your subscription. No confirmation = no briefing.`,
    confirmSmall: "Don't see it? Check your spam folder.",
    alreadyHeading: "You're already subscribed!",
    alreadyBody:
      "This email is already receiving The Nolana Report. Check your inbox on Mondays at 7 AM CST.",
    pendingHeading: "Almost there! Confirm your email.",
    pendingBody: (email: string) =>
      `We just sent a confirmation link to ${email}. Click it to activate your subscription. No confirmation = no briefing.`,
    pendingSmall: "Don't see it? Check your spam folder.",
    errorFallback: "Something went wrong.",
    errorConn: "Connection error — try again.",
  },
  es: {
    placeholder: "tu@correo.com",
    submitIdle: "Suscríbete Gratis",
    submitLoading: "Suscribiendo…",
    checkbox:
      "Acepto recibir El Reporte Nolana semanalmente por correo electrónico",
    confirmHeading: "¡Casi listo! Confirma tu correo.",
    confirmBody: (email: string) =>
      `Acabamos de enviar un enlace de confirmación a ${email}. Haz clic para activar tu suscripción. Sin confirmación = sin reporte.`,
    confirmSmall: "¿No lo ves? Revisa tu carpeta de spam.",
    alreadyHeading: "¡Ya estás suscrito!",
    alreadyBody:
      "Este correo ya está recibiendo El Reporte Nolana. Revisa tu bandeja los lunes a las 7 AM CST.",
    pendingHeading: "¡Casi listo! Confirma tu correo.",
    pendingBody: (email: string) =>
      `Acabamos de enviar un enlace de confirmación a ${email}. Haz clic para activar tu suscripción. Sin confirmación = sin reporte.`,
    pendingSmall: "¿No lo ves? Revisa tu carpeta de spam.",
    errorFallback: "Algo salió mal.",
    errorConn: "Error de conexión — intenta de nuevo.",
  },
};

function InfoCard({
  variant,
  heading,
  body,
  small,
  lightMode = false,
}: {
  variant: "teal" | "amber";
  heading: string;
  body: string;
  small?: string;
  lightMode?: boolean;
}) {
  const isTeal = variant === "teal";

  if (!isTeal) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 14, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="max-w-lg w-full rounded-2xl bg-white border-2 border-amber-400 px-8 py-8 shadow-[0_4px_32px_rgba(245,158,11,0.18)]"
        role="alert"
        aria-live="polite"
      >
        <div className="flex flex-col items-center text-center gap-4">
          <motion.div
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center"
          >
            <svg
              className="w-8 h-8 text-amber-500"
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
          </motion.div>
          <h3 className="font-display font-bold text-2xl leading-tight text-gray-900">
            {heading}
          </h3>
          <p className="font-body text-lg leading-relaxed text-gray-700">
            {body}
          </p>
          {small && (
            <p className="font-body text-sm leading-relaxed text-gray-400">
              {small}
            </p>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className={`max-w-md w-full rounded-xl px-6 py-5 ${
        lightMode
          ? "border border-teal/30 bg-teal/5"
          : "border border-teal/40 bg-teal/10"
      }`}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start gap-3 mb-3">
        <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 bg-teal/20">
          <svg
            className="w-5 h-5 text-teal-light"
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
        <h3
          className={`font-display font-bold text-lg leading-tight ${
            lightMode ? "text-charcoal" : "text-warm-white"
          }`}
        >
          {heading}
        </h3>
      </div>
      <p
        className={`font-body text-sm leading-relaxed mb-3 ${
          lightMode ? "text-slate" : "text-slate-light"
        }`}
      >
        {body}
      </p>
      {small && (
        <p
          className="font-body text-xs leading-relaxed"
          style={{ color: "rgba(148,163,184,0.55)" }}
        >
          {small}
        </p>
      )}
    </motion.div>
  );
}

type LangPref = "en" | "es" | "both";

const langCopy = {
  en: {
    label: "Receive your briefing in:",
    en: "English",
    es: "Español",
    both: "Both",
  },
  es: {
    label: "Recibe tu reporte en:",
    en: "English",
    es: "Español",
    both: "Ambos",
  },
};

function LangPills({
  value,
  onChange,
  locale,
  isLight,
}: {
  value: LangPref;
  onChange: (v: LangPref) => void;
  locale: "en" | "es";
  isLight: boolean;
}) {
  const lc = langCopy[locale];
  const options: { key: LangPref; label: string }[] = [
    { key: "en", label: lc.en },
    { key: "es", label: lc.es },
    { key: "both", label: lc.both },
  ];
  return (
    <div className="flex flex-col gap-1.5">
      <span
        className={`font-body text-xs ${isLight ? "text-slate/70" : "text-slate-light/70"}`}
      >
        {lc.label}
      </span>
      <div className="flex gap-2">
        {options.map((o) => (
          <button
            key={o.key}
            type="button"
            onClick={() => onChange(o.key)}
            className={`font-body text-xs px-3 py-1.5 rounded-full border transition-colors duration-200 min-h-[32px] ${
              value === o.key
                ? "bg-teal border-teal text-white font-semibold"
                : isLight
                  ? "border-cream-dark text-slate hover:border-teal/50"
                  : "border-[#2a3a4d] text-slate-light hover:border-teal/50"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function SignupForm({ variant = "dark" }: Props) {
  const locale = useLocale() as "en" | "es";
  const [email, setEmail] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [langPref, setLangPref] = useState<LangPref>(
    locale === "es" ? "es" : "en",
  );
  const [status, setStatus] = useState<FormStatus>("idle");
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const t = copy[locale];

  const isLight = variant === "light";
  const styles = {
    input: isLight
      ? "w-full px-5 py-4 rounded-xl bg-white border border-cream-dark text-charcoal placeholder-slate-light font-body text-base focus:outline-none focus:border-teal focus:ring-2 focus:ring-teal/20 min-h-[52px] shadow-sm"
      : "w-full px-5 py-4 rounded-xl bg-[#1a2a3d] border border-[#2a3a4d] text-warm-white placeholder-[#6b7a8d] font-body text-base focus:outline-none focus:border-teal focus:ring-2 focus:ring-teal/20 min-h-[52px]",
    button: isLight
      ? "w-full bg-teal hover:bg-teal-light text-white font-body font-bold text-base py-4 px-8 rounded-xl transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed min-h-[52px] shadow-md"
      : "w-full bg-teal hover:bg-teal-light text-white font-body font-bold text-base py-4 px-8 rounded-xl transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed min-h-[52px]",
    checkbox: isLight
      ? `font-body text-sm leading-snug transition-colors duration-200 ${agreed ? "text-slate" : "text-slate/60"}`
      : `font-body text-sm leading-snug transition-colors duration-200 ${agreed ? "text-slate-light" : "text-slate-light/60"}`,
    error: isLight
      ? "text-red-600 text-sm font-body"
      : "text-red-400 text-sm font-body",
  };

  const turnstileToken = useRef("");
  const widgetContainerRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);

  useEffect(() => {
    if (!TURNSTILE_SITE_KEY || !widgetContainerRef.current || widgetId.current)
      return;
    const existing = document.getElementById("cf-turnstile-script");
    const init = () => {
      if (!widgetContainerRef.current || widgetId.current) return;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      widgetId.current = (window as any).turnstile?.render(
        widgetContainerRef.current,
        {
          sitekey: TURNSTILE_SITE_KEY,
          size: "invisible",
          callback: (token: string) => {
            turnstileToken.current = token;
          },
          "expired-callback": () => {
            turnstileToken.current = "";
          },
        },
      );
    };
    if (existing) {
      init();
    } else {
      const script = document.createElement("script");
      script.id = "cf-turnstile-script";
      script.src =
        "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.onload = init;
      document.head.appendChild(script);
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!agreed) return;
    const normalized = email.toLowerCase().trim();
    setStatus("loading");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: normalized,
          turnstileToken: turnstileToken.current,
          website: honeypot,
          language_preference: langPref,
        }),
      });
      const data = await res.json();

      if (data.reason === "already_subscribed") {
        setSubmittedEmail(normalized);
        setStatus("already_subscribed");
      } else if (data.reason === "pending_confirmation") {
        setSubmittedEmail(normalized);
        setStatus("pending_confirmation");
      } else if (res.ok && data.ok) {
        setSubmittedEmail(normalized);
        setEmail("");
        setStatus("success");
        trackEvent("subscribe_free", { tier: "free" });
      } else {
        setErrorMsg(data.error ?? t.errorFallback);
        setStatus("error");
      }
    } catch {
      setErrorMsg(t.errorConn);
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <InfoCard
        variant="amber"
        heading={t.confirmHeading}
        body={t.confirmBody(submittedEmail)}
        small={t.confirmSmall}
        lightMode={isLight}
      />
    );
  }

  if (status === "already_subscribed") {
    return (
      <InfoCard
        variant="teal"
        heading={t.alreadyHeading}
        body={t.alreadyBody}
        lightMode={isLight}
      />
    );
  }

  if (status === "pending_confirmation") {
    return (
      <InfoCard
        variant="amber"
        heading={t.pendingHeading}
        body={t.pendingBody(submittedEmail)}
        small={t.pendingSmall}
        lightMode={isLight}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-full">
      <div ref={widgetContainerRef} aria-hidden="true" />
      <input
        name="website"
        type="text"
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        style={{ display: "none" }}
      />
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={t.placeholder}
        required
        aria-label="Email address"
        className={styles.input}
      />

      <LangPills
        value={langPref}
        onChange={setLangPref}
        locale={locale}
        isLight={isLight}
      />

      <label className="flex items-center gap-3 cursor-pointer group">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="w-4 h-4 flex-shrink-0 cursor-pointer accent-teal"
        />
        <span className={styles.checkbox}>{t.checkbox}</span>
      </label>

      <button
        type="submit"
        disabled={status === "loading" || !agreed}
        className={styles.button}
      >
        {status === "loading" ? t.submitLoading : t.submitIdle}
      </button>

      {status === "error" && (
        <p className={styles.error} role="alert">
          {errorMsg}
        </p>
      )}
    </form>
  );
}
