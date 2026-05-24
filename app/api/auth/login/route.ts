import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  const { email } = (await req.json()) as { email: string };
  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
  const anonClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  if (!email) {
    return NextResponse.json({ error: "Email required" }, { status: 400 });
  }

  // Upsert subscriber row (create if new, leave if existing)
  await adminClient
    .from("subscribers")
    .upsert(
      { email, email_verified: true },
      { onConflict: "email", ignoreDuplicates: true },
    );

  // Send magic link
  const { error } = await anonClient.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
