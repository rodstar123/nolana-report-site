"use client";

import { useState, useRef, useEffect, useCallback } from "react";

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

type Status = "idle" | "loading" | "success" | "error";

const inputClass =
  "w-full rounded-lg px-4 py-3 text-sm font-body text-charcoal bg-white border transition-colors focus:outline-none focus:border-teal focus:ring-1 focus:ring-teal/30";
const borderDefault = "border-black/15";

export default function AdvertiseForm() {
  const [name, setName] = useState("");
  const [business, setBusiness] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const turnstileToken = useRef("");
  const widgetContainerRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);

  useEffect(() => {
    if (!TURNSTILE_SITE_KEY || !widgetContainerRef.current || widgetId.current)
      return;

    const existing = document.getElementById("cf-turnstile-script");

    const init = () => {
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

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setStatus("loading");
      setErrorMsg("");

      try {
        const res = await fetch("/api/advertise", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim(),
            business: business.trim(),
            email: email.trim().toLowerCase(),
            message: message.trim(),
            turnstileToken: turnstileToken.current,
            website: honeypot,
          }),
        });

        const data = await res.json();

        if (res.ok && data.ok) {
          setStatus("success");
        } else {
          setErrorMsg(data.error ?? "Something went wrong. Please try again.");
          setStatus("error");
        }
      } catch {
        setErrorMsg("Connection error. Please try again or email us directly.");
        setStatus("error");
      }
    },
    [name, business, email, message, honeypot],
  );

  if (status === "success") {
    return (
      <div
        className="rounded-xl p-6 text-center"
        style={{
          background: "rgba(212,168,83,0.08)",
          border: "1px solid rgba(212,168,83,0.2)",
        }}
      >
        <p className="font-display font-bold text-charcoal text-lg mb-1">
          Thanks for your interest!
        </p>
        <p className="font-body text-slate text-sm">
          We&apos;ll be in touch within 1 business day.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Honeypot */}
      <div className="absolute -left-[9999px]" aria-hidden="true">
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
        />
      </div>

      <div>
        <label
          htmlFor="adv-name"
          className="block font-body text-sm font-medium text-charcoal mb-1"
        >
          Name <span className="text-red-500">*</span>
        </label>
        <input
          id="adv-name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={`${inputClass} ${borderDefault}`}
        />
      </div>

      <div>
        <label
          htmlFor="adv-business"
          className="block font-body text-sm font-medium text-charcoal mb-1"
        >
          Business Name <span className="text-red-500">*</span>
        </label>
        <input
          id="adv-business"
          type="text"
          required
          value={business}
          onChange={(e) => setBusiness(e.target.value)}
          className={`${inputClass} ${borderDefault}`}
        />
      </div>

      <div>
        <label
          htmlFor="adv-email"
          className="block font-body text-sm font-medium text-charcoal mb-1"
        >
          Email <span className="text-red-500">*</span>
        </label>
        <input
          id="adv-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={`${inputClass} ${borderDefault}`}
        />
      </div>

      <div>
        <label
          htmlFor="adv-message"
          className="block font-body text-sm font-medium text-charcoal mb-1"
        >
          Message{" "}
          <span className="font-normal text-slate-light">(optional)</span>
        </label>
        <textarea
          id="adv-message"
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tell us about your business and advertising goals"
          className={`${inputClass} ${borderDefault} resize-y`}
        />
      </div>

      <div ref={widgetContainerRef} aria-hidden="true" />

      {status === "error" && errorMsg && (
        <p className="font-body text-sm text-red-600" role="alert">
          {errorMsg}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="inline-flex items-center gap-2 font-body font-semibold text-sm text-white px-6 py-3 rounded-lg transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
        style={{ background: "var(--teal)" }}
      >
        {status === "loading" ? "Sending..." : "Submit Inquiry →"}
      </button>
    </form>
  );
}
