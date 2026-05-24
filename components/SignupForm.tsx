"use client";
import { useState } from "react";
import { motion } from "framer-motion";

interface Props {
  lang?: "en" | "es";
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
}: {
  variant: "teal" | "amber";
  heading: string;
  body: string;
  small?: string;
}) {
  const isTeal = variant === "teal";
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className={`max-w-md w-full rounded-xl px-6 py-5 ${
        isTeal
          ? "border border-teal/40 bg-teal/10"
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
            isTeal ? "text-warm-white" : "text-amber-200"
          }`}
        >
          {heading}
        </h3>
      </div>
      <p
        className={`font-body text-sm leading-relaxed mb-3 ${
          isTeal ? "text-slate-light" : "text-amber-100/80"
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

export default function SignupForm({ lang = "en" }: Props) {
  const [email, setEmail] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [status, setStatus] = useState<FormStatus>("idle");
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const t = copy[lang];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!agreed) return;
    const normalized = email.toLowerCase().trim();
    setStatus("loading");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalized }),
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
      />
    );
  }

  if (status === "already_subscribed") {
    return (
      <InfoCard
        variant="teal"
        heading={t.alreadyHeading}
        body={t.alreadyBody}
      />
    );
  }

  if (status === "pending_confirmation") {
    return (
      <InfoCard
        variant="amber"
        heading={t.pendingHeading}
        body={t.pendingBody(submittedEmail)}
      />
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col items-center gap-3 max-w-md w-full"
    >
      <div className="flex flex-col sm:flex-row gap-3 w-full">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t.placeholder}
          required
          aria-label="Email address"
          className="flex-1 w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-warm-white placeholder-slate-light font-body text-[16px] focus:outline-none focus:border-teal focus:ring-1 focus:ring-teal backdrop-blur-sm min-h-[44px]"
        />
        <button
          type="submit"
          disabled={status === "loading" || !agreed}
          className="w-full sm:w-auto px-6 py-3 bg-teal hover:bg-teal-light text-white font-body font-bold text-base rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap min-h-[44px]"
        >
          {status === "loading" ? t.submitLoading : t.submitIdle}
        </button>
      </div>

      {/* Consent checkbox — centered, full width, readable */}
      <label className="flex items-center gap-3 cursor-pointer group w-full justify-center">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="w-5 h-5 flex-shrink-0 cursor-pointer accent-teal"
        />
        <span
          className={`font-body text-base leading-snug transition-colors duration-200 ${
            agreed ? "text-warm-white" : "text-slate-light"
          }`}
        >
          {t.checkbox}
        </span>
      </label>

      {status === "error" && (
        <p
          className="text-red-400 text-sm font-body w-full text-center"
          role="alert"
        >
          {errorMsg}
        </p>
      )}
    </form>
  );
}
