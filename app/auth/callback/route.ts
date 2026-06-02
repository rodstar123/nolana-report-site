import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getAdminClient } from "@/lib/signup-guards";
import type { EmailOtpType } from "@supabase/supabase-js";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const redirectTo = searchParams.get("redirectTo") ?? "/account";

  const supabase = await createSupabaseServerClient();

  let userEmail: string | null = null;

  if (supabase) {
    let authError = false;
    if (code) {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) authError = true;
      else userEmail = data?.session?.user?.email ?? null;
    } else if (token_hash && type) {
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash,
        type,
      });
      if (error) authError = true;
      else userEmail = data?.user?.email ?? null;
    } else {
      authError = true;
    }

    if (authError) {
      return NextResponse.redirect(
        new URL("/login?error=auth_failed", req.url),
      );
    }
  }

  // Mark subscriber as verified — they proved email ownership via magic link
  if (userEmail) {
    const admin = getAdminClient();
    await admin
      .from("subscribers")
      .update({ email_verified: true, verification_token: null })
      .eq("email", userEmail.toLowerCase());
  }

  const dest = new URL(redirectTo, req.url);
  dest.searchParams.set("verified", "1");
  return NextResponse.redirect(dest);
}
