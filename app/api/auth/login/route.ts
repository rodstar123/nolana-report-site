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

  // Rate limit: 3 login attempts per hour per IP
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

  // Upsert subscriber row (don't override email_verified if already set)
  await adminClient
    .from("subscribers")
    .upsert(
      { email: normalized },
      { onConflict: "email", ignoreDuplicates: true },
    );

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
