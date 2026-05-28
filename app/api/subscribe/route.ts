import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendWelcomeEmail } from "@/lib/email/welcome";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Block bot-pattern emails: 5+ dots in local part, or ends in 2-digit numeric suffix
function isBotEmail(email: string): boolean {
  const local = email.split("@")[0];
  const dots = (local.match(/\./g) ?? []).length;
  if (dots >= 5) return true;
  if (/\.\d{2}$/.test(local)) return true;
  return false;
}

const BLOCKED_DOMAINS = new Set([
  "chameleongroup.co",
  "a7gi.ru",
  "sigizmundgrp.com",
  "guerrillamail.com",
  "tempmail.com",
  "mailinator.com",
  "yopmail.com",
  "throwaway.email",
  "guerrillamail.info",
  "grr.la",
  "sharklasers.com",
  "guerrillamail.net",
  "guerrillamail.de",
  "trbvm.com",
]);

function isBlockedDomain(email: string): boolean {
  const domain = email.split("@")[1]?.toLowerCase();
  if (!domain) return true;
  if (domain.endsWith(".ru")) return true;
  return BLOCKED_DOMAINS.has(domain);
}

// IP rate limiting: 3 signups per hour (in-memory, resets on cold start)
const ipTimestamps = new Map<string, number[]>();
const IP_WINDOW_MS = 3_600_000;
const IP_MAX = 3;

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

function isIpLimited(ip: string): boolean {
  const now = Date.now();
  const hits = (ipTimestamps.get(ip) ?? []).filter(
    (t) => now - t < IP_WINDOW_MS,
  );
  if (hits.length >= IP_MAX) return true;
  hits.push(now);
  ipTimestamps.set(ip, hits);
  return false;
}

// Validate Cloudflare Turnstile token — no-op if TURNSTILE_SECRET_KEY not set
async function verifyTurnstile(token: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;
  if (!token) return false;
  try {
    const resp = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ secret, response: token }),
      },
    );
    const data = await resp.json();
    return data.success === true;
  } catch {
    return true; // fail open — don't block real users on Turnstile outage
  }
}

// Domain burst: block if 3+ signups from the same domain in 24h
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function isDomainBurst(email: string, supabase: any): Promise<boolean> {
  const domain = email.split("@")[1]?.toLowerCase();
  if (!domain) return false;
  // Skip common providers
  const freeProviders = new Set([
    "gmail.com",
    "yahoo.com",
    "hotmail.com",
    "outlook.com",
    "icloud.com",
    "aol.com",
    "live.com",
    "protonmail.com",
    "proton.me",
    "me.com",
    "msn.com",
    "mail.com",
  ]);
  if (freeProviders.has(domain)) return false;
  const cutoff = new Date(Date.now() - 86_400_000).toISOString();
  const { count } = await supabase
    .from("subscribers")
    .select("id", { count: "exact", head: true })
    .gte("created_at", cutoff)
    .like("email", `%@${domain}`);
  return (count ?? 0) >= 3;
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  if (isIpLimited(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 },
    );
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
  let body: {
    email?: string;
    referral_code?: string;
    turnstileToken?: string;
    website?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Honeypot — bots fill hidden fields
  if (body.website) {
    return NextResponse.json({ ok: true });
  }

  const { email, referral_code, turnstileToken = "" } = body;
  if (!email || !isValidEmail(email)) {
    return NextResponse.json(
      { error: "Valid email required" },
      { status: 400 },
    );
  }

  if (isBotEmail(email)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  if (isBlockedDomain(email)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  const turnstileOk = await verifyTurnstile(turnstileToken);
  if (!turnstileOk) {
    return NextResponse.json(
      { error: "Human verification failed" },
      { status: 403 },
    );
  }

  const normalized = email.toLowerCase().trim();

  const burst = await isDomainBurst(normalized, supabase);
  if (burst) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  // Check for existing subscriber
  const { data: existing } = await supabase
    .from("subscribers")
    .select("id, unsubscribed")
    .eq("email", normalized)
    .single();

  if (existing && !existing.unsubscribed) {
    return NextResponse.json({ ok: false, reason: "already_subscribed" });
  }

  // Resolve referrer
  let referredBy: string | null = null;
  if (referral_code) {
    const { data: referrer } = await supabase
      .from("subscribers")
      .select("id")
      .eq("referral_code", referral_code)
      .single();
    referredBy = referrer?.id ?? null;
  }

  // Upsert subscriber
  const { error } = await supabase.from("subscribers").upsert(
    {
      email: normalized,
      tier: "free",
      email_verified: true,
      unsubscribed: false,
      referred_by: referredBy,
    },
    { onConflict: "email" },
  );

  if (error) {
    console.error("[subscribe] supabase error:", error);
    return NextResponse.json(
      { ok: false, error: "Subscription failed — try again." },
      { status: 500 },
    );
  }

  // Send welcome email
  try {
    await sendWelcomeEmail(normalized);
  } catch (e) {
    console.error("[subscribe] welcome email failed:", e);
    // Don't fail the subscription if email fails
  }

  return NextResponse.json({ ok: true });
}
