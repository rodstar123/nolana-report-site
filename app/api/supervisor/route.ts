import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { AGENT_NAME_TO_SLUG, type AgentName } from "@/lib/agents/types";

export const maxDuration = 300;

const ALL_AGENTS: AgentName[] = [
  "Agent 1",
  "Agent 2",
  "Agent 3",
  "Agent 4",
  "Agent 5",
];

async function sendTelegram(text: string): Promise<void> {
  const token = process.env.TELEGRAM_NOLANA_BOT_TOKEN;
  const chatId = process.env.NOE_TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
    });
  } catch {
    console.error("[supervisor] Telegram send failed");
  }
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronHeader = req.headers.get("x-vercel-cron");
  const isAuthorized =
    authHeader === `Bearer ${process.env.CRON_SECRET}` || cronHeader === "1";
  if (!isAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setUTCHours(0, 0, 0, 0);
  const isMonday = now.getUTCDay() === 1;
  const dateStr = now.toISOString().slice(0, 10);
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? "https://www.nolanareport.com";

  const lines: string[] = [];
  const retries: Array<{ agent: string; ok: boolean; detail: string }> = [];

  // --- Step 1: Check which agents ran today ---
  const { data: todayLogs } = await supabase
    .from("agent_logs")
    .select("agent, items_ingested, sources_failed, sources_attempted")
    .gte("run_started_at", startOfDay.toISOString());

  const ran = new Set((todayLogs ?? []).map((l: { agent: string }) => l.agent));
  const missing = ALL_AGENTS.filter((a) => !ran.has(a));

  // --- Step 2: Auto-re-run missing agents ---
  if (missing.length > 0) {
    lines.push(
      `⚠️ Missing agents detected: ${missing.join(", ")}. Retrying...`,
    );

    const retryPromises = missing.map(async (agent) => {
      const slug = AGENT_NAME_TO_SLUG[agent];
      try {
        const res = await fetch(`${baseUrl}/api/agents/${slug}`, {
          headers: { Authorization: `Bearer ${process.env.CRON_SECRET}` },
        });
        const data = (await res.json()) as Record<string, unknown>;
        return {
          agent,
          ok: res.ok,
          detail: res.ok
            ? `✅ recovered — ${data.itemsIngested ?? 0} ingested`
            : `❌ retry failed: ${data.error ?? "unknown"}`,
        };
      } catch (err) {
        return {
          agent,
          ok: false,
          detail: `❌ ${err instanceof Error ? err.message : "fetch failed"}`,
        };
      }
    });

    const results = await Promise.allSettled(retryPromises);
    for (const r of results) {
      if (r.status === "fulfilled") retries.push(r.value);
    }
    for (const r of retries) {
      lines.push(`  ${r.agent}: ${r.detail}`);
    }
  } else {
    lines.push("✅ All 5 agents ran today.");
  }

  // --- Step 3: Zero-ingestion check ---
  const { count: todayItemCount } = await supabase
    .from("raw_items")
    .select("*", { count: "exact", head: true })
    .gte("date_spotted", startOfDay.toISOString());

  if ((todayItemCount ?? 0) === 0) {
    lines.push("🔴 Zero items ingested today across all agents.");
  } else {
    lines.push(`📊 Items ingested today: ${todayItemCount}`);
  }

  // --- Step 4: Down sources ---
  const { data: downSources } = await supabase
    .from("source_health")
    .select("agent, source_name, consecutive_failures")
    .gte("consecutive_failures", 3);

  if (downSources && downSources.length > 0) {
    lines.push(
      `⚠️ Degraded sources (3+ fails): ${downSources
        .map(
          (s: {
            source_name: string;
            agent: string;
            consecutive_failures: number;
          }) => `${s.source_name} (${s.agent}, ${s.consecutive_failures}×)`,
        )
        .join(", ")}`,
    );
  } else {
    lines.push("✅ All sources healthy.");
  }

  // --- Step 5: Monday aggregator + briefing validation ---
  let aggregatorHalted = false;
  if (isMonday && now.getUTCHours() >= 13) {
    const { data: aggLog } = await supabase
      .from("agent_logs")
      .select("items_ingested, errors")
      .eq("agent", "aggregator")
      .gte("run_started_at", startOfDay.toISOString())
      .order("run_started_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!aggLog) {
      lines.push(
        "🔴 MONDAY CHECK: Aggregator has NOT run. Briefing will not send.",
      );
    } else if ((aggLog.items_ingested ?? 0) === 0) {
      lines.push(
        "🔴 MONDAY CHECK: Aggregator ran but wrote 0 stories. Halting send.",
      );
      aggregatorHalted = true;
    } else {
      const todaySlug = dateStr;
      const { data: issue } = await supabase
        .from("issues")
        .select("id, stories_count, opening")
        .eq("slug", todaySlug)
        .maybeSingle();

      if (!issue) {
        lines.push(
          "🔴 MONDAY CHECK: No issue created for today. Halting send.",
        );
        aggregatorHalted = true;
      } else if (!issue.opening || (issue.stories_count ?? 0) === 0) {
        lines.push(
          `🔴 MONDAY CHECK: Issue exists but empty (opening=${!!issue.opening}, stories=${issue.stories_count}). Halting send.`,
        );
        await supabase
          .from("issues")
          .update({ is_published: false })
          .eq("id", issue.id);
        aggregatorHalted = true;
      } else {
        lines.push(
          `✅ MONDAY CHECK: Briefing ready — ${issue.stories_count} stories, opening present.`,
        );
      }
    }
  }

  // --- Step 6: Post daily summary ---
  const summary =
    `🔍 <b>Nolana Supervisor — ${dateStr}</b>\n\n` + lines.join("\n");
  await sendTelegram(summary);

  return NextResponse.json({
    ok: true,
    date: dateStr,
    agentsMissing: missing,
    retries,
    todayItems: todayItemCount ?? 0,
    aggregatorHalted,
    lines,
  });
}
