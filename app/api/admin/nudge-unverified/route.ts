import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { randomBytes } from "crypto";
import { Resend } from "resend";

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
  const resend = new Resend(process.env.RESEND_API_KEY);
  const base = process.env.NEXT_PUBLIC_APP_URL || "https://nolanareport.com";

  // Get blocked domains from blocked_signups table
  const { data: blocked } = await supabase
    .from("blocked_signups")
    .select("email");
  const blockedDomains = new Set(
    (blocked ?? []).map((b: { email: string }) =>
      b.email.split("@")[1]?.toLowerCase(),
    ),
  );
  blockedDomains.add("serverius.net");

  // Fetch unverified subscribers from Jun 1+
  const { data: unverified, error: fetchErr } = await supabase
    .from("subscribers")
    .select("id, email, created_at")
    .eq("email_verified", false)
    .eq("unsubscribed", false)
    .gte("created_at", "2026-06-01T00:00:00Z")
    .order("created_at", { ascending: true });

  if (fetchErr) {
    return NextResponse.json({ error: fetchErr.message }, { status: 500 });
  }

  const results: {
    sent: { email: string; at: string }[];
    skipped: { email: string; reason: string }[];
    errors: { email: string; error: string }[];
  } = { sent: [], skipped: [], errors: [] };

  for (const sub of unverified ?? []) {
    const domain = sub.email.split("@")[1]?.toLowerCase();

    if (blockedDomains.has(domain)) {
      results.skipped.push({ email: sub.email, reason: "blocked_domain" });
      continue;
    }
    if (domain?.endsWith(".ru")) {
      results.skipped.push({ email: sub.email, reason: "ru_domain" });
      continue;
    }

    // Fresh token
    const token = randomBytes(32).toString("hex");
    const { error: updateErr } = await supabase
      .from("subscribers")
      .update({ verification_token: token })
      .eq("id", sub.id);

    if (updateErr) {
      results.errors.push({ email: sub.email, error: updateErr.message });
      continue;
    }

    const link = `${base}/api/verify-email?token=${encodeURIComponent(token)}&email=${encodeURIComponent(sub.email)}`;

    try {
      await resend.emails.send({
        from: "The Nolana Report <briefing@mail.nationalboco.com>",
        to: sub.email,
        subject: "Still want Monday's RGV briefing? One click.",
        html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 20px; color: #1a1a1a;">
        <h1 style="font-size: 22px; font-weight: 700; margin: 0 0 16px 0; color: #1a1a1a;">
          You're almost in
        </h1>
        <p style="font-size: 16px; line-height: 1.6; margin: 0 0 12px 0; color: #333;">
          You signed up for The Nolana Report but haven't confirmed yet. Every Monday, we deliver the only RGV business briefing that scores, ranks, and explains what actually matters in the Valley.
        </p>
        <p style="font-size: 16px; line-height: 1.6; margin: 0 0 24px 0; color: #333;">
          This Monday's issue drops June 8. Tap below to make sure you get it:
        </p>
        <div style="text-align: center; margin: 0 0 24px 0;">
          <a href="${link}"
             style="display: inline-block; background-color: #16a34a; color: #ffffff; font-size: 16px; font-weight: 600; padding: 14px 32px; border-radius: 8px; text-decoration: none;">
            Confirm my subscription
          </a>
        </div>
        <p style="font-size: 13px; line-height: 1.5; color: #888; margin: 0;">
          If you're no longer interested, no action needed — we won't email you again.
        </p>
      </div>
    `,
      });

      results.sent.push({ email: sub.email, at: new Date().toISOString() });
    } catch (e) {
      results.errors.push({
        email: sub.email,
        error: e instanceof Error ? e.message : String(e),
      });
    }

    // Resend rate limit: 10 req/sec on paid, stay safe at 250ms
    await new Promise((r) => setTimeout(r, 250));
  }

  return NextResponse.json({
    total_unverified: unverified?.length ?? 0,
    sent: results.sent.length,
    skipped: results.skipped.length,
    errors: results.errors.length,
    detail: results,
  });
}
