"use client";
import { useState } from "react";

export default function SignupForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus("success");
        setMessage("You're in. Check your inbox.");
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.error ?? "Something went wrong.");
      }
    } catch {
      setStatus("error");
      setMessage("Connection error — try again.");
    }
  }

  if (status === "success") {
    return (
      <div className="hero-form bg-teal/10 border border-teal/30 rounded-lg px-6 py-4 text-center max-w-md w-full">
        <p className="font-body text-teal-light font-semibold">✓ {message}</p>
        <p className="font-body text-slate-light text-sm mt-1">
          First briefing arrives Monday morning.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="hero-form flex flex-col sm:flex-row gap-3 max-w-md w-full"
    >
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
        required
        aria-label="Email address"
        className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-warm-white placeholder-slate-light font-body text-sm focus:outline-none focus:border-teal focus:ring-1 focus:ring-teal backdrop-blur-sm min-h-[44px]"
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className="px-6 py-3 bg-teal hover:bg-teal-light text-white font-body font-bold text-sm rounded-lg transition-colors duration-200 disabled:opacity-60 whitespace-nowrap min-h-[44px]"
      >
        {status === "loading" ? "Subscribing…" : "Subscribe Free"}
      </button>
      {status === "error" && (
        <p className="w-full text-red-400 text-xs mt-1 font-body" role="alert">
          {message}
        </p>
      )}
    </form>
  );
}
