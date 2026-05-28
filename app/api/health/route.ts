import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    return NextResponse.json(
      { status: "degraded", reason: "Missing Supabase credentials" },
      { status: 503 },
    );
  }

  const supabase = createClient(url, key);
  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setUTCHours(0, 0, 0, 0);

  try {
    const [itemsRes, logsRes, healthRes, issuesRes] = await Promise.all([
      supabase
        .from("raw_items")
        .select("*", { count: "exact", head: true })
        .gte("date_spotted", startOfDay.toISOString()),
      supabase
        .from("agent_logs")
        .select("agent,run_started_at")
        .gte("run_started_at", startOfDay.toISOString()),
      supabase
        .from("source_health")
        .select("*", { count: "exact", head: true })
        .eq("status", "down"),
      supabase
        .from("issues")
        .select("slug,published_at")
        .order("published_at", { ascending: false })
        .limit(1),
    ]);

    const todayItems = itemsRes.count ?? 0;
    const agentsRanToday = new Set(
      (logsRes.data ?? []).map((l: { agent: string }) => l.agent),
    ).size;
    const sourcesDown = healthRes.count ?? 0;
    const latestIssue = (issuesRes.data ?? [])[0] as
      | { slug: string; published_at: string }
      | undefined;

    return NextResponse.json({
      status: "ok",
      timestamp: now.toISOString(),
      todayItems,
      agentsRanToday,
      sourcesDown,
      latestIssue: latestIssue
        ? { slug: latestIssue.slug, publishedAt: latestIssue.published_at }
        : null,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { status: "error", reason: message },
      { status: 500 },
    );
  }
}
