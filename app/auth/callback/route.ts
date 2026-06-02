import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { EmailOtpType } from "@supabase/supabase-js";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const redirectTo = searchParams.get("redirectTo") ?? "/account";

  const supabase = await createSupabaseServerClient();

  if (supabase) {
    let authError = false;
    if (code) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) authError = true;
    } else if (token_hash && type) {
      const { error } = await supabase.auth.verifyOtp({ token_hash, type });
      if (error) authError = true;
    } else {
      authError = true;
    }

    if (authError) {
      return NextResponse.redirect(
        new URL("/login?error=auth_failed", req.url),
      );
    }
  }

  const dest = new URL(redirectTo, req.url);
  dest.searchParams.set("verified", "1");
  return NextResponse.redirect(dest);
}
