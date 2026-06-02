import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/signup-guards";
import { sendWelcomeEmail } from "@/lib/email/welcome";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  const email = searchParams.get("email")?.toLowerCase().trim();

  if (!token || !email) {
    return NextResponse.redirect(new URL("/?verify=invalid", req.url));
  }

  const supabase = getAdminClient();

  const { data: sub } = await supabase
    .from("subscribers")
    .select("id, email_verified, verification_token")
    .eq("email", email)
    .single();

  if (!sub || sub.verification_token !== token) {
    return NextResponse.redirect(new URL("/?verify=invalid", req.url));
  }

  if (sub.email_verified) {
    return NextResponse.redirect(new URL("/?verify=already", req.url));
  }

  const { error } = await supabase
    .from("subscribers")
    .update({ email_verified: true, verification_token: null })
    .eq("id", sub.id);

  if (error) {
    console.error("[verify-email] update failed:", error);
    return NextResponse.redirect(new URL("/?verify=error", req.url));
  }

  try {
    await sendWelcomeEmail(email);
  } catch (e) {
    console.error("[verify-email] welcome email failed:", e);
  }

  return NextResponse.redirect(new URL("/?verify=success", req.url));
}
