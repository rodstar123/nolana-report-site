import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  getAdminClient,
  isValidEmail,
  isBotEmail,
  isBlockedDomain,
  getClientIp,
  checkRateLimit,
  logBlockedSignup,
} from "@/lib/signup-guards";

export async function POST(req: NextRequest) {
  const { email } = (await req.json()) as { email: string };

  if (!email || !isValidEmail(email)) {
    return NextResponse.json(
      { error: "Valid email required" },
      { status: 400 },
    );
  }

  const normalized = email.toLowerCase().trim();
  const adminClient = getAdminClient();
  const ip = getClientIp(req);

  const ipLimited = await checkRateLimit(
    `login:${ip}`,
    3,
    3_600_000,
    adminClient,
  );
  if (ipLimited) {
    await logBlockedSignup(normalized, ip, "login_rate_limit", adminClient);
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 },
    );
  }

  if (isBotEmail(normalized)) {
    await logBlockedSignup(normalized, ip, "bot_email_pattern", adminClient);
    return NextResponse.json(
      { error: "Unable to process request." },
      { status: 400 },
    );
  }

  const blocked = await isBlockedDomain(normalized, adminClient);
  if (blocked) {
    await logBlockedSignup(normalized, ip, "blocked_domain", adminClient);
    return NextResponse.json(
      { error: "Unable to process request." },
      { status: 400 },
    );
  }

  // Only allow login for verified subscribers — unverified/unknown emails
  // must go through the subscribe flow to avoid duplicate confirmation emails
  const { data: subscriber } = await adminClient
    .from("subscribers")
    .select("id, email_verified")
    .eq("email", normalized)
    .single();

  if (!subscriber || !subscriber.email_verified) {
    return NextResponse.json(
      {
        error: !subscriber
          ? "No subscription found. Please subscribe first."
          : "Please confirm your email first — check your inbox for the verification link.",
        code: !subscriber ? "not_subscribed" : "not_verified",
      },
      { status: 403 },
    );
  }

  const anonClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  const { error } = await anonClient.auth.signInWithOtp({
    email: normalized,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
