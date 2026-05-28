"use client";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

interface Props {
  lang?: "en" | "es";
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
    // new subscriber
    confirmHeading: "You're on the list",
    confirmBody: (email: string) =>
      `Welcome! We just sent a welcome note to ${email}. Your first Monday brief arrives this Monday before 7 AM.`,
    confirmSmall:
      "Didn't get the welcome email? Check spam, or sign in at nolanareport.com/login.",
    // already active
    alreadyHeading: "You're already subscribed! ✅",
    alreadyBody:
      "This email is already receiving The Nolana Report. Check your inbox on Mondays at 7 AM CST.",
    // pending — resent
    pendingHeading: "Check your inbox 📬",
    pendingBody: (email: string) =>
      `We resent the confirmation email to ${email}. Click the link inside to activate your subscription.`,
    // real error
    errorFallback: "Something went wrong.",
    errorConn: "Connection error — try again.",
  },
  es: {
    placeholder: "tu@correo.com",
    submitIdle: "Suscríbete Gratis",
    submitLoading: "Suscribiendo…",
    checkbox:
      "Acepto recibir El Reporte Nolana semanalmente por correo electrónico",
    confirmHeading: "Revisa tu bandeja de entrada 📬",
    confirmBody: (email: string) =>
      `Acabamos de enviar un correo de confirmación a ${email}. Debes hacer clic en el enlace de confirmación para comenzar a recibir El Reporte Nolana. Si no lo ves, revisa tu carpeta de spam o promociones.`,
    confirmSmall:
      "¿No lo recibiste? Espera un momento y revisa spam, o intenta suscribirte de nuevo.",
    alreadyHeading: "¡Ya estás suscrito! ✅",
    alreadyBody:
      "Este correo ya está recibiendo El Reporte Nolana. Revisa tu bandeja los lunes a las 7 AM CST.",
    pendingHeading: "Revisa tu bandeja 📬",
    pendingBody: (email: string) =>
      `Reenviamos el correo de confirmación a ${email}. Haz clic en el enlace para activar tu suscripción.`,
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
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className={`max-w-md w-full rounded-xl px-6 py-5 ${
        isTeal
          ? lightMode
            ? "border border-teal/30 bg-teal/5"
            : "border border-teal/40 bg-teal/10"
          : lightMode
            ? "border border-amber-400/30 bg-amber-100/40"
            : "border border-amber-400/40 bg-amber-400/10"
      }`}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start gap-3 mb-3">
        <div
          className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
            isTeal ? "bg-teal/20" : "bg-amber-400/20"
          }`}
        >
          <svg
            className={`w-5 h-5 ${isTeal ? "text-teal-light" : "text-amber-300"}`}
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
            isTeal
              ? lightMode
                ? "text-charcoal"
                : "text-warm-white"
              : lightMode
                ? "text-amber-800"
                : "text-amber-200"
          }`}
        >
          {heading}
        </h3>
      </div>
      <p
        className={`font-body text-sm leading-relaxed mb-3 ${
          isTeal
            ? lightMode
              ? "text-slate"
              : "text-slate-light"
            : lightMode
              ? "text-amber-700"
              : "text-amber-100/80"
        }`}
      >
        {body}
      </p>
      {small && (
        <p
          className="font-body text-xs leading-relaxed"
          style={{
            color: isTeal ? "rgba(148,163,184,0.55)" : "rgba(252,211,77,0.45)",
          }}
        >
          {small}
        </p>
      )}
    </motion.div>
  );
}

export default function SignupForm({ lang = "en", variant = "dark" }: Props) {
  const [email, setEmail] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [status, setStatus] = useState<FormStatus>("idle");
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const t = copy[lang];

  const isLight = variant === "light";
  const styles = {
    input: isLight
      ? "w-full px-5 py-4 rounded-xl bg-white border border-cream-dark text-charcoal placeholder-slate-light font-body text-base focus:outline-none focus:border-teal focus:ring-2 focus:ring-teal/20 min-h-[52px] shadow-sm"
      : "w-full px-5 py-4 rounded-xl bg-white/8 border border-white/15 text-warm-white placeholder-slate-light font-body text-base focus:outline-none focus:border-teal focus:ring-2 focus:ring-teal/20 min-h-[52px]",
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
        variant="teal"
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
        lightMode={isLight}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-full">
      {/* Cloudflare Turnstile — invisible, activated by NEXT_PUBLIC_TURNSTILE_SITE_KEY */}
      <div ref={widgetContainerRef} aria-hidden="true" />
      {/* Honeypot */}
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

      {/* Consent checkbox */}
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
