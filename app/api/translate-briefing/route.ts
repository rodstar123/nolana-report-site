import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cdtSlug } from "@/lib/cdt";

export const maxDuration = 300;

const TRANSLATION_SYSTEM_PROMPT = `You are the Spanish voice of The Nolana Report, a weekly business intelligence briefing for the Rio Grande Valley.

Your job: take the completed English briefing and rewrite it in natural RGV Spanish. This is NOT a literal translation. You are producing the Spanish EDITION — as if a sharp, bilingual Valley business writer wrote it from scratch.

Voice rules:
- Write in natural RGV Spanish — the way Valley business owners talk. Not textbook Castilian. Not Mexico City formal. Valle del Río Grande.
- "Negocio" over "empresa" for small businesses. "Checar" is fine. "Platicar" over "conversar."
- Terms that stay in English because that's how they're used locally: payroll, bookkeeping, LLC, SmartBook, NRI score, strip mall, franchise, drive-thru, retail, wholesale, bid, permit, zoning, freight brokers, customs broker, capability statement, grants, import/export brokers, warehouse, child care, startups, tech, IT, event planners.
- Tone: direct, personal, Morning Brew style. Not corporate. Not academic. Like a sharp friend who knows business — but in Spanish.
- Headlines should punch. Short. Active verbs.
- "Nolana Take" sections should feel opinionated and conversational.
- Adapt, don't translate. If a phrase doesn't land in Spanish, rewrite it so it does.

Field-specific rules:
- business_temperature: Translate the full markdown body. Keep the label (e.g. "Warming") in English if no natural Spanish equivalent; otherwise translate.
- valley_money_map: This is a markdown table. Translate headers and cell text. Keep dollar amounts, entity names, and program names as-is.
- three_moves: Translate each move. Keep **bold** markdown formatting. Industry terms stay in English per the rule above.
- quiet_signal: Translate the narrative text. Keep entity/company names as-is.
- breathers: This is a JSON array of objects with "type" and "text" fields. Translate the "text" values. Keep the "type" values exactly as-is. Preserve all other fields (numeric, structural) unchanged.
- summary: Short story blurb. Translate naturally.
- who_should_act: This is an array of audience tags (e.g. "Retail operators", "Freight brokers"). Translate each tag using RGV Spanglish — keep industry terms in English where Valley operators actually use the English term.

You will receive the full English briefing as JSON. Return the same JSON structure with all text fields translated to RGV Spanish. Preserve all field names exactly. Do not modify any numeric fields or structural data.

Return ONLY valid JSON. No markdown fences. No preamble.`;

interface StoryInput {
  id: string;
  headline: string;
  signal: string | null;
  why_it_matters: string | null;
  smart_move: string | null;
  nolana_take: string | null;
  summary: string | null;
  who_should_act: string[] | null;
}

interface TranslatedIssue {
  title: string;
  headline: string;
  opening: string;
  owners_move: string;
  risk_radar: string;
  thinking_question: string;
  before_you_go: string;
  business_temperature: string;
  valley_money_map: string;
  three_moves: string;
  quiet_signal: string;
  breathers: Array<{ type: string; text: string; [key: string]: unknown }>;
}

interface TranslatedStory {
  id: string;
  headline: string;
  signal: string;
  why_it_matters: string;
  smart_move: string;
  nolana_take: string;
  summary: string;
  who_should_act: string[];
}

export async function GET(req: NextRequest) {
  const cronHeader = req.headers.get("x-vercel-cron");
  const authHeader = req.headers.get("authorization");
  const isAuthorized =
    authHeader === `Bearer ${process.env.CRON_SECRET}` || cronHeader === "1";
  if (!isAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    return NextResponse.json(
      { error: "Missing Supabase configuration" },
      { status: 500 },
    );
  }

  const slug = req.nextUrl.searchParams.get("slug") || cdtSlug();

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
  );

  const { data: issue } = await supabase
    .from("issues")
    .select(
      "title, headline, title_es, headline_es, opening_es, owners_move_es, risk_radar_es, thinking_question_es, before_you_go_es, business_temperature_es, valley_money_map_es, three_moves_es, quiet_signal_es, breathers_es",
    )
    .eq("slug", slug)
    .single();

  if (!issue) {
    return NextResponse.json({ error: "Issue not found" }, { status: 404 });
  }

  const { data: stories } = await supabase
    .from("stories")
    .select(
      "position, headline, headline_es, signal_es, why_it_matters_es, smart_move_es, nolana_take_es, summary_es, who_should_act_es",
    )
    .eq(
      "issue_id",
      (await supabase.from("issues").select("id").eq("slug", slug).single())
        .data?.id ?? "",
    )
    .order("position", { ascending: true });

  return NextResponse.json({
    slug,
    issue,
    stories: stories ?? [],
  });
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
  let backfill = false;
  try {
    const body = await req.json();
    slug = body.slug || cdtSlug();
    backfill = body.backfill === true;
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
      .select("*")
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
      .select("*")
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
        headline: issue.headline ?? "",
        opening: issue.opening ?? "",
        owners_move: issue.owners_move ?? "",
        risk_radar: issue.risk_radar ?? "",
        thinking_question: issue.thinking_question ?? "",
        before_you_go: issue.before_you_go ?? "",
        business_temperature: issue.business_temperature ?? "",
        valley_money_map: issue.valley_money_map ?? "",
        three_moves: issue.three_moves ?? "",
        quiet_signal: issue.quiet_signal ?? "",
        breathers: issue.breathers ?? [],
      },
      stories: (stories ?? []).map((s: StoryInput) => ({
        id: s.id,
        headline: s.headline ?? "",
        signal: s.signal ?? "",
        why_it_matters: s.why_it_matters ?? "",
        smart_move: s.smart_move ?? "",
        nolana_take: s.nolana_take ?? "",
        summary: s.summary ?? "",
        who_should_act: s.who_should_act ?? [],
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
        max_tokens: 32000,
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

    /* eslint-disable @typescript-eslint/no-explicit-any */
    const issueUpdate: Record<string, any> = {};
    const iss = issue as any;
    const setIf = (col: string, val: unknown) => {
      if (backfill && iss[col] != null) return;
      issueUpdate[col] = val ?? null;
    };
    setIf("title_es", translated.issue.title || null);
    setIf("headline_es", translated.issue.headline || null);
    setIf("opening_es", translated.issue.opening || null);
    setIf("owners_move_es", translated.issue.owners_move || null);
    setIf("risk_radar_es", translated.issue.risk_radar || null);
    setIf("thinking_question_es", translated.issue.thinking_question || null);
    setIf("before_you_go_es", translated.issue.before_you_go || null);
    setIf(
      "business_temperature_es",
      translated.issue.business_temperature || null,
    );
    setIf("valley_money_map_es", translated.issue.valley_money_map || null);
    setIf("three_moves_es", translated.issue.three_moves || null);
    setIf("quiet_signal_es", translated.issue.quiet_signal || null);
    setIf(
      "breathers_es",
      translated.issue.breathers?.length ? translated.issue.breathers : null,
    );
    /* eslint-enable @typescript-eslint/no-explicit-any */

    const { error: issueUpdateErr } =
      Object.keys(issueUpdate).length > 0
        ? await supabase.from("issues").update(issueUpdate).eq("id", issue.id)
        : { error: null };

    if (issueUpdateErr) {
      return NextResponse.json(
        { error: `Issue update failed: ${issueUpdateErr.message}` },
        { status: 500 },
      );
    }

    let storiesUpdated = 0;
    const storyLookup = new Map(
      (stories ?? []).map((s: { id: string } & Record<string, unknown>) => [
        s.id,
        s,
      ]),
    );
    for (const ts of translated.stories) {
      if (!ts.id) continue;
      /* eslint-disable @typescript-eslint/no-explicit-any */
      const existing = storyLookup.get(ts.id) as
        | Record<string, any>
        | undefined;
      const storyUpdate: Record<string, any> = {};
      const setStoryIf = (col: string, val: unknown) => {
        if (backfill && existing?.[col] != null) return;
        storyUpdate[col] = val ?? null;
      };
      setStoryIf("headline_es", ts.headline || null);
      setStoryIf("signal_es", ts.signal || null);
      setStoryIf("why_it_matters_es", ts.why_it_matters || null);
      setStoryIf("smart_move_es", ts.smart_move || null);
      setStoryIf("nolana_take_es", ts.nolana_take || null);
      setStoryIf("summary_es", ts.summary || null);
      setStoryIf(
        "who_should_act_es",
        ts.who_should_act?.length ? ts.who_should_act : null,
      );
      /* eslint-enable @typescript-eslint/no-explicit-any */

      if (Object.keys(storyUpdate).length === 0) {
        storiesUpdated++;
        continue;
      }
      const { error: storyErr } = await supabase
        .from("stories")
        .update(storyUpdate)
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
