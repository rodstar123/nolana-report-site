"use client";

import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = (await res.json()) as { success?: boolean; error?: string };

    if (!res.ok || !data.success) {
      setError(data.error ?? "Something went wrong. Try again.");
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  };

  if (sent) {
    return (
      <main className="min-h-screen bg-navy flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <h1 className="font-display font-bold text-warm-white text-3xl mb-4">
            Check your inbox
          </h1>
          <p className="font-body text-slate-light text-lg leading-relaxed mb-6">
            We sent a login link to{" "}
            <span className="text-gold font-semibold">{email}</span>. Click the
            link to access your account.
          </p>
          <p className="font-body text-slate-light text-sm">
            Didn&apos;t get it? Check spam, or{" "}
            <button
              onClick={() => setSent(false)}
              className="text-teal-light underline underline-offset-2 hover:text-teal transition-colors"
            >
              try again
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
        <div className="text-center mb-8">
          <Link
            href="/"
            className="font-display font-bold text-gold text-xl tracking-widest uppercase"
          >
            The Nolana Report
          </Link>
        </div>
        <h1 className="font-display font-bold text-warm-white text-3xl mb-2">
          Sign in
        </h1>
        <p className="font-body text-slate-light mb-8">
          Enter your email and we&apos;ll send a login link. No password needed.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@business.com"
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
            {loading ? "Sending…" : "Send Login Link"}
          </button>
        </form>

        <p className="font-body text-slate-light text-sm text-center mt-6">
          Not a subscriber yet?{" "}
          <Link
            href="/"
            className="text-teal-light underline underline-offset-2 hover:text-teal transition-colors"
          >
            Sign up free
          </Link>
        </p>
      </div>
    </main>
  );
}
