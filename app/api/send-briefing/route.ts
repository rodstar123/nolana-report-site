import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";
import {
  buildBriefingEmail,
  extractTemperatureLabel,
  type Story,
} from "@/lib/email/briefing-template";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

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

  // Determine which language pass this is
  const langParam = req.nextUrl.searchParams.get("lang") as "en" | "es" | null;
  const sendLocale: "en" | "es" = langParam === "es" ? "es" : "en";

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

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const iss = issue as any;
  /* eslint-enable @typescript-eslint/no-explicit-any */

  // Check if Spanish translations exist for this issue
  const hasSpanishTranslation = !!(iss.title_es && iss.opening_es);

  // If this is a Spanish pass but translations don't exist, skip
  if (sendLocale === "es" && !hasSpanishTranslation) {
    console.warn(
      `[send-briefing] Spanish translations not available for ${issue.slug} — skipping ES delivery`,
    );
    return NextResponse.json({
      sent: 0,
      failed: 0,
      locale: "es",
      skipped: true,
      reason: "no_spanish_translation",
    });
  }

  // Build localized story array for Spanish
  const localizedStories: Story[] =
    sendLocale === "es"
      ? (stories as (Story & Record<string, any>)[]).map((s) => ({
          ...s,
          headline: s.headline_es ?? s.headline,
          signal: s.signal_es ?? s.signal,
          why_it_matters: s.why_it_matters_es ?? s.why_it_matters,
          smart_move: s.smart_move_es ?? s.smart_move,
          nolana_take: s.nolana_take_es ?? s.nolana_take,
        }))
      : (stories as Story[]);

  // Localized issue fields
  const localizedTitle =
    sendLocale === "es" && iss.title_es ? iss.title_es : issue.title;
  const localizedOpening =
    sendLocale === "es" && iss.opening_es ? iss.opening_es : issue.opening;
  const localizedOwnersMove =
    sendLocale === "es" && iss.owners_move_es
      ? iss.owners_move_es
      : iss.owners_move;
  const localizedRiskRadar =
    sendLocale === "es" && iss.risk_radar_es
      ? iss.risk_radar_es
      : iss.risk_radar;
  const localizedThinkingQuestion =
    sendLocale === "es" && iss.thinking_question_es
      ? iss.thinking_question_es
      : iss.thinking_question;
  const localizedBeforeYouGo =
    sendLocale === "es" && iss.before_you_go_es
      ? iss.before_you_go_es
      : iss.before_you_go;

  // Build email options for this locale
  function buildEmailOpts(tier: "free" | "pro" | "intel") {
    return {
      issueTitle: localizedTitle,
      issueSlug: issue.slug,
      stories: localizedStories,
      tier,
      opening: localizedOpening ?? null,
      businessTemperature: iss.business_temperature ?? null,
      valleyMoneyMap: iss.valley_money_map ?? null,
      threeMoves: iss.three_moves ?? null,
      quietSignal: iss.quiet_signal ?? null,
      ownersMove: localizedOwnersMove ?? null,
      riskRadar: localizedRiskRadar ?? null,
      thinkingQuestion: localizedThinkingQuestion ?? null,
      beforeYouGo: localizedBeforeYouGo ?? null,
      breathers: iss.breathers ?? null,
      locale: sendLocale,
    };
  }

  // Subject line
  const dateLang = sendLocale === "es" ? "es-MX" : "en-US";
  const dateLabel = new Date(issue.published_at).toLocaleDateString(dateLang, {
    month: "long",
    day: "numeric",
  });

  function buildSubject(): string {
    if (sendLocale === "es") {
      const esHeadline = iss.headline_es as string | null;
      if (esHeadline) return esHeadline;
      return `Reporte Nolana — ${dateLabel} — ${localizedStories.length} historias del Valle`;
    }
    const enHeadline = iss.headline as string | null;
    if (enHeadline) return enHeadline;
    const tempLabel = iss.business_temperature
      ? extractTemperatureLabel(iss.business_temperature as string)
      : null;
    return tempLabel
      ? `${tempLabel} — The Nolana Report, Week of ${dateLabel}`
      : `The Nolana Report — Week of ${dateLabel}`;
  }

  const emailType =
    sendLocale === "es" ? "briefing_es" : ("briefing" as string);

  // TEST MODE: ?test_email=someone@example.com&tier=pro|free&lang=es
  const testEmail = req.nextUrl.searchParams.get("test_email");
  if (testEmail) {
    const testTier = (req.nextUrl.searchParams.get("tier") || "pro") as
      | "free"
      | "pro"
      | "intel";
    const testHtml = buildBriefingEmail(buildEmailOpts(testTier));
    const htmlSizeKB = Math.round(Buffer.byteLength(testHtml, "utf-8") / 1024);
    const subjectLine = buildSubject();

    const { data, error } = await resend.emails.send({
      from: "The Nolana Report <briefing@mail.nationalboco.com>",
      to: testEmail,
      subject: `[TEST v4 ${testTier} ${sendLocale}] ${subjectLine}`,
      html: testHtml,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({
      test: true,
      tier: testTier,
      locale: sendLocale,
      sent_to: testEmail,
      html_size_kb: htmlSizeKB,
      resend_id: data?.id,
    });
  }

  // Fetch subscribers filtered by language preference
  const { data: subscribers } = await supabase
    .from("subscribers")
    .select("*")
    .eq("unsubscribed", false)
    .eq("email_verified", true);

  if (!subscribers?.length) {
    return NextResponse.json({
      sent: 0,
      failed: 0,
      locale: sendLocale,
      note: "No subscribers",
    });
  }

  // Filter by language preference for this pass
  const eligible = subscribers.filter((s) => {
    const pref = s.language_preference ?? "en";
    if (sendLocale === "en") return pref === "en" || pref === "both";
    if (sendLocale === "es") return pref === "es" || pref === "both";
    return false;
  });

  // Dedup: skip subscribers who already received this issue in this locale
  const { data: alreadySent } = await supabase
    .from("email_log")
    .select("subscriber_id")
    .eq("issue_id", issue.id)
    .eq("email_type", emailType);
  const alreadySentIds = new Set(
    (alreadySent ?? []).map((r) => r.subscriber_id),
  );
  const pending = eligible.filter((s) => !alreadySentIds.has(s.id));

  if (!pending.length) {
    return NextResponse.json({
      sent: 0,
      failed: 0,
      locale: sendLocale,
      note: `All ${sendLocale} subscribers already received this issue`,
    });
  }

  const results = {
    sent: 0,
    failed: 0,
    locale: sendLocale,
    errors: [] as string[],
  };
  const subjectLine = buildSubject();

  // Send sequentially — Resend free tier is 5 req/sec; 250ms gap is safe
  for (const sub of pending) {
    try {
      const html = buildBriefingEmail(buildEmailOpts(sub.tier));

      const { data, error } = await resend.emails.send({
        from: "The Nolana Report <briefing@mail.nationalboco.com>",
        to: sub.email,
        subject: subjectLine,
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
          email_type: emailType,
          resend_id: data?.id,
        });
      }
    } catch (err: unknown) {
      results.failed++;
      results.errors.push(
        `${sub.email}: ${err instanceof Error ? err.message : "unknown error"}`,
      );
    }
    await new Promise((r) => setTimeout(r, 250));
  }

  // Warm ISR cache for the locale
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://nolanareport.com";
  const localePrefix = sendLocale === "es" ? "/es" : "";
  try {
    await fetch(`${baseUrl}${localePrefix}/issues/${issue.slug}`, {
      headers: { "x-purpose": "cache-warm" },
    });
  } catch {
    // Non-fatal
  }

  // After EN pass completes, trigger ES pass non-blocking
  // Natural EN processing time (250ms * N subscribers) provides spacing
  if (sendLocale === "en" && hasSpanishTranslation) {
    const esUrl = `${baseUrl}/api/send-briefing?lang=es`;
    try {
      await fetch(esUrl, {
        headers: {
          "Content-Type": "application/json",
          "x-vercel-cron": "1",
        },
      });
    } catch (err) {
      console.warn("[send-briefing] ES trigger failed (non-blocking):", err);
    }
  }

  return NextResponse.json(results);
}
