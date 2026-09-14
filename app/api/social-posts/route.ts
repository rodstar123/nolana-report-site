import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { isCronAuthorized } from "@/lib/cron-auth";
import { selectStory } from "@/lib/social/select-story";
import { generatePosts, countHashtags } from "@/lib/social/generate-posts";
import {
  escapeHtml,
  sendSocialTelegram,
  trySendSocialTelegram,
} from "@/lib/social/telegram";

/**
 * Monday social-post generator.
 *
 * Picks the strongest story card from a published issue, writes six (or four)
 * ready-to-paste posts, stores them, and sends them to Noe's Telegram DM.
 *
 * IT POSTS NOTHING ANYWHERE. There is no social-platform API, SDK, token or
 * credential in this route or anything it imports, and none belongs here. Noe
 * posts by hand. `platform` is a label on a piece of text.
 *
 * maxDuration is declared here rather than in vercel.json, matching
 * translate-briefing and watchdog, so Phase 2 adds exactly one cron line and
 * no new function config.
 */
export const maxDuration = 120;
export const dynamic = "force-dynamic";

/** Named so a failure message says which leg broke, not just that one did. */
type Stage = "select" | "generate" | "persist" | "telegram";

export async function GET(req: NextRequest) {
  if (!isCronAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let stage: Stage = "select";
  const startedAt = Date.now();

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    const issueId = req.nextUrl.searchParams.get("issue_id") ?? undefined;
    const selection = await selectStory(supabase, issueId);

    stage = "generate";
    const generated = await generatePosts(selection);

    stage = "persist";
    const rows = generated.posts.map((p) => ({
      issue_id: selection.issue.id,
      story_title: selection.story.headline,
      platform: p.platform,
      lang: p.lang,
      body: p.body,
      link: p.link,
      model: generated.model,
    }));

    const { error: upsertErr } = await supabase
      .from("social_posts")
      .upsert(rows, { onConflict: "issue_id,platform,lang" });
    if (upsertErr) throw new Error(`social_posts upsert: ${upsertErr.message}`);

    stage = "telegram";
    const message = buildTelegramMessage(selection, generated);
    const telegram = await sendSocialTelegram(message);

    return NextResponse.json({
      ok: true,
      issue: { id: selection.issue.id, slug: selection.issue.slug },
      story: {
        id: selection.story.id,
        headline: selection.story.headline,
        section: selection.story.section,
        nolana_score: selection.story.nolana_score,
        position: selection.story.position,
      },
      tieBreak: selection.tieBreak,
      specificity: selection.specificity,
      candidateCount: selection.candidateCount,
      spanishAvailable: selection.spanishAvailable,
      postsGenerated: generated.posts.length,
      posts: generated.posts.map((p) => ({
        platform: p.platform,
        lang: p.lang,
        words: p.words,
        chars: p.chars,
        limit: p.limitLabel,
        withinLimit: p.withinLimit,
        attempts: p.attempts,
        hashtags: countHashtags(p.body),
        link: p.link,
      })),
      violations: generated.violations,
      missing: generated.missing,
      model: generated.model,
      modelCalls: generated.calls,
      inputTokens: generated.inputTokens,
      outputTokens: generated.outputTokens,
      telegram,
      durationMs: Date.now() - startedAt,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error(`[social-posts] failed at stage=${stage}:`, message);
    // Non-throwing on purpose: if the notification threw, it would replace the
    // real cause and the actual failure would be lost.
    await trySendSocialTelegram(
      `🔴 Social posts failed — stage: ${escapeHtml(stage)} — ${escapeHtml(message.slice(0, 300))}`,
    );
    throw err;
  }
}

function buildTelegramMessage(
  selection: Awaited<ReturnType<typeof selectStory>>,
  generated: Awaited<ReturnType<typeof generatePosts>>,
): string {
  const lines: string[] = [
    `📣 Monday posts — ${escapeHtml(selection.issue.slug)}`,
    `Story: ${escapeHtml(selection.story.headline)}`,
  ];

  if (!selection.spanishAvailable) {
    lines.push("ES posts skipped — issue not translated.");
  }
  if (generated.violations.length > 0) {
    lines.push(`⚠️ Over limit: ${escapeHtml(generated.violations.join("; "))}`);
  }
  if (generated.missing.length > 0) {
    lines.push(
      `⚠️ Not returned by the model: ${escapeHtml(generated.missing.join(", "))}`,
    );
  }

  for (const p of generated.posts) {
    lines.push("", `— ${p.label} —`, escapeHtml(p.body));
  }

  return lines.join("\n");
}
