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

export async function POST(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
  let body: { email?: string; referral_code?: string; turnstileToken?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
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

  const turnstileOk = await verifyTurnstile(turnstileToken);
  if (!turnstileOk) {
    return NextResponse.json(
      { error: "Human verification failed" },
      { status: 403 },
    );
  }

  const normalized = email.toLowerCase().trim();

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
