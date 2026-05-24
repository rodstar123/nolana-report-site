"use client";
import { useState } from "react";
import { motion } from "framer-motion";

interface Props {
  lang?: "en" | "es";
}

const copy = {
  en: {
    placeholder: "your@email.com",
    submitIdle: "Subscribe Free",
    submitLoading: "Subscribing…",
    checkbox: "I agree to receive The Nolana Report weekly via email",
    confirmHeading: "Check your inbox 📬",
    confirmBody: (email: string) =>
      `We just sent a confirmation email to ${email}. You must click the confirmation link inside to start receiving The Nolana Report. If you don't see it, check your spam or promotions folder.`,
    confirmSmall:
      "Didn't get it? Wait a minute and check spam, or try subscribing again.",
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
    errorFallback: "Algo salió mal.",
    errorConn: "Error de conexión — intenta de nuevo.",
  },
};

export default function SignupForm({ lang = "en" }: Props) {
  const [email, setEmail] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const t = copy[lang];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!agreed) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setSubmittedEmail(email);
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
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="max-w-md w-full rounded-xl border border-teal/40 bg-teal/10 backdrop-blur-sm px-6 py-5"
        role="alert"
        aria-live="polite"
      >
        <div className="flex items-start gap-3 mb-3">
          {/* Mail icon */}
          <div className="w-9 h-9 rounded-full bg-teal/20 flex items-center justify-center flex-shrink-0 mt-0.5">
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
          <h3 className="font-display font-bold text-warm-white text-lg leading-tight">
            {t.confirmHeading}
          </h3>
        </div>
        <p className="font-body text-slate-light text-sm leading-relaxed mb-3">
          {t.confirmBody(submittedEmail)}
        </p>
        <p
          className="font-body text-xs leading-relaxed"
          style={{ color: "rgba(148,163,184,0.55)" }}
        >
          {t.confirmSmall}
        </p>
      </motion.div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 max-w-md w-full"
    >
      <div className="flex flex-col sm:flex-row gap-3">
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

      {/* Consent checkbox */}
      <label className="flex items-start gap-2.5 cursor-pointer group">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mt-0.5 w-4 h-4 flex-shrink-0 cursor-pointer accent-teal"
        />
        <span className="font-body text-slate-light text-xs leading-relaxed group-hover:text-warm-white transition-colors duration-150">
          {t.checkbox}
        </span>
      </label>

      {status === "error" && (
        <p className="text-red-400 text-xs font-body" role="alert">
          {errorMsg}
        </p>
      )}
    </form>
  );
}
