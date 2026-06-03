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
  const issueSlug = searchParams.get("issueSlug");
  const fp = searchParams.get("fp");
  const subscriberId = searchParams.get("subscriberId");

  if (!issueSlug) {
    return NextResponse.json({ error: "issueSlug required" }, { status: 400 });
  }

  const supabase = getSupabase();

  const { data: votes } = await supabase
    .from("story_votes")
    .select("story_id")
    .eq("issue_slug", issueSlug);

  const counts: Record<string, number> = {};
  for (const v of votes ?? []) {
    counts[v.story_id] = (counts[v.story_id] ?? 0) + 1;
  }

  let myVote: string | null = null;
  if (subscriberId) {
    const { data } = await supabase
      .from("story_votes")
      .select("story_id")
      .eq("issue_slug", issueSlug)
      .eq("subscriber_id", subscriberId)
      .single();
    myVote = data?.story_id ?? null;
  } else if (fp) {
    const { data } = await supabase
      .from("story_votes")
      .select("story_id")
      .eq("issue_slug", issueSlug)
      .eq("fingerprint", fp)
      .single();
    myVote = data?.story_id ?? null;
  }

  const total = (votes ?? []).length;

  return NextResponse.json({ counts, myVote, total });
}

export async function POST(req: NextRequest) {
  let body: {
    issueSlug?: string;
    storyId?: string;
    fingerprint?: string;
    subscriberId?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { issueSlug, storyId, fingerprint, subscriberId } = body;

  if (!issueSlug || !storyId) {
    return NextResponse.json(
      { error: "issueSlug and storyId required" },
      { status: 400 },
    );
  }

  if (!fingerprint && !subscriberId) {
    return NextResponse.json(
      { error: "fingerprint or subscriberId required" },
      { status: 400 },
    );
  }

  const rateLimitKey = `vote:${fingerprint ?? subscriberId}`;
  const { allowed } = checkRateLimit(rateLimitKey, 30, 60 * 60 * 1000);
  if (!allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Try again later." },
      { status: 429 },
    );
  }

  const supabase = getSupabase();

  if (subscriberId) {
    const { data: existing } = await supabase
      .from("story_votes")
      .select("id")
      .eq("issue_slug", issueSlug)
      .eq("subscriber_id", subscriberId)
      .single();

    if (existing) {
      await supabase
        .from("story_votes")
        .update({ story_id: storyId })
        .eq("id", existing.id);
    } else {
      await supabase.from("story_votes").insert({
        issue_slug: issueSlug,
        story_id: storyId,
        subscriber_id: subscriberId,
        fingerprint,
      });
    }
  } else {
    const { data: existing } = await supabase
      .from("story_votes")
      .select("id")
      .eq("issue_slug", issueSlug)
      .eq("fingerprint", fingerprint!)
      .single();

    if (existing) {
      await supabase
        .from("story_votes")
        .update({ story_id: storyId })
        .eq("id", existing.id);
    } else {
      await supabase.from("story_votes").insert({
        issue_slug: issueSlug,
        story_id: storyId,
        fingerprint,
      });
    }
  }

  return NextResponse.json({ ok: true });
}
