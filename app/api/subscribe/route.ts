import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import {
  getAdminClient,
  isValidEmail,
  isBotEmail,
  isBlockedDomain,
  isDomainBurst,
  getClientIp,
  checkRateLimit,
  logBlockedSignup,
} from "@/lib/signup-guards";
import { sendVerificationEmail } from "@/lib/email/verification";

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
    return true;
  }
}

export async function POST(req: NextRequest) {
  const supabase = getAdminClient();
  const ip = getClientIp(req);

  // Supabase-backed IP rate limit: 3 signups per hour
  const ipLimited = await checkRateLimit(`ip:${ip}`, 3, 3_600_000, supabase);
  if (ipLimited) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 },
    );
  }

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

  const normalized = email.toLowerCase().trim();

  if (isBotEmail(normalized)) {
    await logBlockedSignup(normalized, ip, "bot_email_pattern", supabase);
    return NextResponse.json(
      { error: "Unable to complete signup." },
      { status: 400 },
    );
  }

  const blocked = await isBlockedDomain(normalized, supabase);
  if (blocked) {
    await logBlockedSignup(normalized, ip, "blocked_domain", supabase);
    return NextResponse.json(
      { error: "Unable to complete signup." },
      { status: 400 },
    );
  }

  // Trusted internal callers (NBC proxy) bypass Turnstile
  const internalKey = req.headers.get("x-internal-key");
  const isInternalCaller =
    !!process.env.NOLANA_INTERNAL_KEY &&
    internalKey === process.env.NOLANA_INTERNAL_KEY;

  if (!isInternalCaller) {
    const turnstileOk = await verifyTurnstile(turnstileToken);
    if (!turnstileOk) {
      return NextResponse.json(
        { error: "Human verification failed" },
        { status: 403 },
      );
    }
  }

  const burst = await isDomainBurst(normalized, supabase);
  if (burst) {
    await logBlockedSignup(normalized, ip, "domain_burst", supabase);
    return NextResponse.json(
      { error: "Unable to complete signup." },
      { status: 400 },
    );
  }

  // Check for existing subscriber
  const { data: existing } = await supabase
    .from("subscribers")
    .select("id, unsubscribed, email_verified")
    .eq("email", normalized)
    .single();

  if (existing && !existing.unsubscribed) {
    if (!existing.email_verified) {
      // Resend verification email
      const token = randomBytes(32).toString("hex");
      await supabase
        .from("subscribers")
        .update({ verification_token: token })
        .eq("id", existing.id);
      try {
        await sendVerificationEmail(normalized, token);
      } catch (e) {
        console.error("[subscribe] resend verification failed:", e);
      }
      return NextResponse.json({ ok: true, reason: "pending_confirmation" });
    }
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

  // Generate verification token
  const verificationToken = randomBytes(32).toString("hex");

  // Create subscriber (unverified)
  const { error } = await supabase.from("subscribers").upsert(
    {
      email: normalized,
      tier: "free",
      email_verified: false,
      unsubscribed: false,
      referred_by: referredBy,
      verification_token: verificationToken,
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

  // Send verification email (not welcome — that comes after confirmation)
  try {
    await sendVerificationEmail(normalized, verificationToken);
  } catch (e) {
    console.error("[subscribe] verification email failed:", e);
  }

  return NextResponse.json({ ok: true, reason: "pending_confirmation" });
}
