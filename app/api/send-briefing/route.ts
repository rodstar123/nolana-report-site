import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";
import { buildBriefingEmail, type Story } from "@/lib/email/briefing-template";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
  // Auth: accept CRON_SECRET header or Vercel Cron header
  const authHeader = req.headers.get("authorization");
  const cronHeader = req.headers.get("x-vercel-cron");
  const isAuthorized =
    authHeader === `Bearer ${process.env.CRON_SECRET}` || cronHeader === "1";

  if (!isAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Latest published issue
  const { data: issue } = await supabase
    .from("issues")
    .select("*")
    .eq("is_published", true)
    .order("published_at", { ascending: false })
    .limit(1)
    .single();

  if (!issue) {
    return NextResponse.json({ error: "No published issue" }, { status: 404 });
  }

  const { data: stories } = await supabase
    .from("stories")
    .select("*")
    .eq("issue_id", issue.id)
    .order("position", { ascending: true });

  if (!stories?.length) {
    return NextResponse.json({ error: "No stories" }, { status: 404 });
  }

  const { data: subscribers } = await supabase
    .from("subscribers")
    .select("*")
    .eq("unsubscribed", false)
    .eq("email_verified", true);

  if (!subscribers?.length) {
    return NextResponse.json({ sent: 0, failed: 0, note: "No subscribers" });
  }

  // Dedup: skip subscribers who already received this issue
  const { data: alreadySent } = await supabase
    .from("email_log")
    .select("subscriber_id")
    .eq("issue_id", issue.id)
    .eq("email_type", "briefing");
  const alreadySentIds = new Set(
    (alreadySent ?? []).map((r) => r.subscriber_id),
  );
  const pending = subscribers.filter((s) => !alreadySentIds.has(s.id));

  if (!pending.length) {
    return NextResponse.json({
      sent: 0,
      failed: 0,
      note: "All subscribers already received this issue",
    });
  }

  const results = { sent: 0, failed: 0, errors: [] as string[] };

  // Send sequentially — Resend free tier is 5 req/sec; sequential with 250ms gap is safe
  for (const sub of pending) {
    try {
      const html = buildBriefingEmail(
        issue.title,
        issue.slug,
        stories as Story[],
        sub.tier,
        issue.opening ?? null,
      );
      const storyCount =
        sub.tier === "free"
          ? stories.filter((s: Story) => s.is_free).length
          : stories.length;

      const { data, error } = await resend.emails.send({
        from: "The Nolana Report <briefing@mail.nationalboco.com>",
        to: sub.email,
        subject: `${issue.title} — ${storyCount} stories scored | The Nolana Report`,
        html,
      });

      if (error) {
        results.failed++;
        results.errors.push(`${sub.email}: ${error.message}`);
      } else {
        results.sent++;
        await supabase.from("email_log").insert({
          subscriber_id: sub.id,
          issue_id: issue.id,
          email_type: "briefing",
          resend_id: data?.id,
        });
      }
    } catch (err: unknown) {
      results.failed++;
      results.errors.push(
        `${sub.email}: ${err instanceof Error ? err.message : "unknown error"}`,
      );
    }
    // 250ms gap between sends — stays well under Resend's 5 req/sec limit
    await new Promise((r) => setTimeout(r, 250));
  }

  return NextResponse.json(results);
}
