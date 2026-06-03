import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { checkRateLimit } from "@/lib/rate-limit";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const storyId = searchParams.get("storyId");
  const issueId = searchParams.get("issueId");
  const fp = searchParams.get("fp");

  if (!storyId && !issueId) {
    return NextResponse.json(
      { error: "storyId or issueId required" },
      { status: 400 },
    );
  }

  const supabase = getSupabase();

  if (issueId) {
    const { data: stories } = await supabase
      .from("stories")
      .select("id")
      .eq("issue_id", issueId);
    const storyIds = (stories ?? []).map((s) => s.id);
    if (storyIds.length === 0) {
      return NextResponse.json({});
    }

    const { data: rows } = await supabase
      .from("story_reactions")
      .select("story_id, reaction")
      .in("story_id", storyIds);

    const result: Record<string, Record<string, number>> = {};
    for (const row of rows ?? []) {
      if (!result[row.story_id]) {
        result[row.story_id] = { useful: 0, interesting: 0, noted: 0 };
      }
      result[row.story_id][row.reaction] =
        (result[row.story_id][row.reaction] ?? 0) + 1;
    }
    return NextResponse.json(result);
  }

  const { data: rows } = await supabase
    .from("story_reactions")
    .select("reaction")
    .eq("story_id", storyId!);

  const counts: Record<string, number> = {};
  for (const row of rows ?? []) {
    counts[row.reaction] = (counts[row.reaction] ?? 0) + 1;
  }

  let mine: string[] = [];
  if (fp) {
    const { data: myRows } = await supabase
      .from("story_reactions")
      .select("reaction")
      .eq("story_id", storyId!)
      .eq("session_fingerprint", fp);
    mine = (myRows ?? []).map((r) => r.reaction);
  }

  return NextResponse.json({ counts, mine });
}

export async function POST(req: NextRequest) {
  let body: {
    storyId?: string;
    reaction?: string;
    remove?: boolean;
    fingerprint?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { storyId, reaction, remove, fingerprint } = body;

  if (!storyId || !reaction) {
    return NextResponse.json(
      { error: "storyId and reaction required" },
      { status: 400 },
    );
  }

  const validReactions = ["useful", "interesting", "noted"];
  if (!validReactions.includes(reaction)) {
    return NextResponse.json({ error: "Invalid reaction" }, { status: 400 });
  }

  if (!fingerprint) {
    return NextResponse.json(
      { error: "fingerprint required" },
      { status: 400 },
    );
  }

  const { allowed } = checkRateLimit(
    `react:${fingerprint}`,
    50,
    60 * 60 * 1000,
  );
  if (!allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Try again later." },
      { status: 429 },
    );
  }

  const supabase = getSupabase();

  if (remove) {
    await supabase
      .from("story_reactions")
      .delete()
      .eq("story_id", storyId)
      .eq("session_fingerprint", fingerprint)
      .eq("reaction", reaction);
  } else {
    await supabase.from("story_reactions").upsert(
      {
        story_id: storyId,
        session_fingerprint: fingerprint,
        reaction,
      },
      { onConflict: "story_id,session_fingerprint,reaction" },
    );
  }

  return NextResponse.json({ ok: true });
}
