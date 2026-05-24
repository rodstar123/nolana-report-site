import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";
import { buildBriefingEmail, type Story } from "@/lib/email/briefing-template";

export async function POST(req: NextRequest) {
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

  const results = { sent: 0, failed: 0, errors: [] as string[] };
  const batchSize = 10;

  for (let i = 0; i < subscribers.length; i += batchSize) {
    const batch = subscribers.slice(i, i + batchSize);

    await Promise.all(
      batch.map(async (sub) => {
        try {
          const html = buildBriefingEmail(
            issue.title,
            issue.slug,
            stories as Story[],
            sub.tier,
          );
          const storyCount =
            sub.tier === "free"
              ? stories.filter((s: Story) => s.is_free).length
              : stories.length;

          const { data, error } = await resend.emails.send({
            from: "The Nolana Report <briefing@nolanareport.com>",
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
      }),
    );

    // Respect Resend rate limits between batches
    if (i + batchSize < subscribers.length) {
      await new Promise((r) => setTimeout(r, 1000));
    }
  }

  return NextResponse.json(results);
}
