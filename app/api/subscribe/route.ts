import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendWelcomeEmail } from "@/lib/email/welcome";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
  let body: { email?: string; referral_code?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { email, referral_code } = body;
  if (!email || !isValidEmail(email)) {
    return NextResponse.json(
      { error: "Valid email required" },
      { status: 400 },
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
