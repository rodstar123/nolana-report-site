import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cdtSlug } from "@/lib/cdt";

export const maxDuration = 300;

const TRANSLATION_SYSTEM_PROMPT = `You are the Spanish voice of The Nolana Report, a weekly business intelligence briefing for the Rio Grande Valley.

Your job: take the completed English briefing and rewrite it in natural RGV Spanish. This is NOT a literal translation. You are producing the Spanish EDITION — as if a sharp, bilingual Valley business writer wrote it from scratch.

Voice rules:
- Write in natural RGV Spanish — the way Valley business owners talk. Not textbook Castilian. Not Mexico City formal. Valle del Río Grande.
- "Negocio" over "empresa" for small businesses. "Checar" is fine. "Platicar" over "conversar."
- Terms that stay in English because that's how they're used locally: payroll, bookkeeping, LLC, SmartBook, NRI score, strip mall, franchise, drive-thru, retail, wholesale, bid, permit, zoning.
- Tone: direct, personal, Morning Brew style. Not corporate. Not academic. Like a sharp friend who knows business — but in Spanish.
- Headlines should punch. Short. Active verbs.
- "Nolana Take" sections should feel opinionated and conversational.
- Adapt, don't translate. If a phrase doesn't land in Spanish, rewrite it so it does.

You will receive the full English briefing as JSON. Return the same JSON structure with all text fields translated to RGV Spanish. Preserve all field names exactly. Do not modify any numeric fields, arrays (who_should_act), or structural data.

Return ONLY valid JSON. No markdown fences. No preamble.`;

interface StoryInput {
  id: string;
  headline: string;
  signal: string | null;
  why_it_matters: string | null;
  smart_move: string | null;
  nolana_take: string | null;
}

interface TranslatedIssue {
  title: string;
  opening: string;
  owners_move: string;
  risk_radar: string;
  thinking_question: string;
  before_you_go: string;
}

interface TranslatedStory {
  id: string;
  headline: string;
  signal: string;
  why_it_matters: string;
  smart_move: string;
  nolana_take: string;
}

export async function POST(req: NextRequest) {
  const cronHeader = req.headers.get("x-vercel-cron");
  const authHeader = req.headers.get("authorization");
  const isAuthorized =
    authHeader === `Bearer ${process.env.CRON_SECRET}` || cronHeader === "1";
  if (!isAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let slug: string;
  try {
    const body = await req.json();
    slug = body.slug || cdtSlug();
  } catch {
    slug = cdtSlug();
  }

  try {
    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.SUPABASE_SERVICE_ROLE_KEY
    ) {
      return NextResponse.json(
        { error: "Missing Supabase configuration" },
        { status: 500 },
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
    );
    const { data: issue, error: issueErr } = await supabase
      .from("issues")
      .select(
        "id, title, opening, owners_move, risk_radar, thinking_question, before_you_go",
      )
      .eq("slug", slug)
      .single();

    if (issueErr || !issue) {
      return NextResponse.json(
        { error: `Issue not found for slug ${slug}` },
        { status: 404 },
      );
    }

    const { data: stories, error: storiesErr } = await supabase
      .from("stories")
      .select("id, headline, signal, why_it_matters, smart_move, nolana_take")
      .eq("issue_id", issue.id)
      .order("position", { ascending: true });

    if (storiesErr) {
      return NextResponse.json(
        { error: `Failed to fetch stories: ${storiesErr.message}` },
        { status: 500 },
      );
    }

    const payload = {
      issue: {
        title: issue.title ?? "",
        opening: issue.opening ?? "",
        owners_move: issue.owners_move ?? "",
        risk_radar: issue.risk_radar ?? "",
        thinking_question: issue.thinking_question ?? "",
        before_you_go: issue.before_you_go ?? "",
      },
      stories: (stories ?? []).map((s: StoryInput) => ({
        id: s.id,
        headline: s.headline ?? "",
        signal: s.signal ?? "",
        why_it_matters: s.why_it_matters ?? "",
        smart_move: s.smart_move ?? "",
        nolana_take: s.nolana_take ?? "",
      })),
    };

    const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": process.env.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 16000,
        system: TRANSLATION_SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: JSON.stringify(payload, null, 2),
          },
        ],
      }),
    });

    if (!anthropicRes.ok) {
      const errText = await anthropicRes.text();
      return NextResponse.json(
        { error: `Anthropic ${anthropicRes.status}: ${errText.slice(0, 300)}` },
        { status: 502 },
      );
    }

    const anthropicJson = (await anthropicRes.json()) as {
      content?: Array<{ type?: string; text?: string }>;
      usage?: { input_tokens?: number; output_tokens?: number };
    };
    const textBlock = (anthropicJson.content ?? []).find(
      (b) => b.type === "text",
    );
    const rawText = textBlock?.text ?? "";

    let translated: { issue: TranslatedIssue; stories: TranslatedStory[] };
    try {
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      translated = JSON.parse(jsonMatch ? jsonMatch[0] : rawText);
    } catch {
      return NextResponse.json(
        {
          error: "Failed to parse translation JSON",
          raw: rawText.slice(0, 500),
        },
        { status: 502 },
      );
    }

    const { error: issueUpdateErr } = await supabase
      .from("issues")
      .update({
        title_es: translated.issue.title || null,
        opening_es: translated.issue.opening || null,
        owners_move_es: translated.issue.owners_move || null,
        risk_radar_es: translated.issue.risk_radar || null,
        thinking_question_es: translated.issue.thinking_question || null,
        before_you_go_es: translated.issue.before_you_go || null,
      })
      .eq("id", issue.id);

    if (issueUpdateErr) {
      return NextResponse.json(
        { error: `Issue update failed: ${issueUpdateErr.message}` },
        { status: 500 },
      );
    }

    let storiesUpdated = 0;
    for (const ts of translated.stories) {
      if (!ts.id) continue;
      const { error: storyErr } = await supabase
        .from("stories")
        .update({
          headline_es: ts.headline || null,
          signal_es: ts.signal || null,
          why_it_matters_es: ts.why_it_matters || null,
          smart_move_es: ts.smart_move || null,
          nolana_take_es: ts.nolana_take || null,
        })
        .eq("id", ts.id);
      if (!storyErr) storiesUpdated++;
    }

    const charCount =
      JSON.stringify(translated.issue).length +
      JSON.stringify(translated.stories).length;
    const tokens =
      (anthropicJson.usage?.input_tokens ?? 0) +
      (anthropicJson.usage?.output_tokens ?? 0);

    await supabase.from("agent_logs").insert({
      agent: "translator",
      run_started_at: new Date().toISOString(),
      run_finished_at: new Date().toISOString(),
      items_fetched: (stories ?? []).length,
      items_ingested: storiesUpdated,
      tokens_used: tokens,
      errors: [],
    });

    return NextResponse.json({
      ok: true,
      slug,
      storiesTranslated: storiesUpdated,
      totalStories: (stories ?? []).length,
      spanishCharacters: charCount,
      tokensUsed: tokens,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[translate-briefing] error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
