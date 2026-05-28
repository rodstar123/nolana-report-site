import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const maxDuration = 60;

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
    console.error("[watchdog] Telegram send failed");
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

  const alerts: string[] = [];
  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setUTCHours(0, 0, 0, 0);
  const isSunday = now.getUTCDay() === 0;
  const isMonday = now.getUTCDay() === 1;

  try {
    const { count: todayItems } = await supabase
      .from("raw_items")
      .select("*", { count: "exact", head: true })
      .gte("date_spotted", startOfDay.toISOString());

    if ((todayItems ?? 0) === 0) {
      alerts.push("⚠️ Zero items ingested today — agents may have failed.");
    }

    const { data: recentLogs } = await supabase
      .from("agent_logs")
      .select("agent,items_ingested,sources_failed,run_started_at")
      .gte("run_started_at", startOfDay.toISOString())
      .order("run_started_at", { ascending: false });

    const agents = ["Agent 1", "Agent 2", "Agent 3", "Agent 4", "Agent 5"];
    const ran = new Set(
      (recentLogs ?? []).map((l: { agent: string }) => l.agent),
    );
    const missing = agents.filter((a) => !ran.has(a));
    if (missing.length > 0) {
      alerts.push(`⚠️ Agents did not run today: ${missing.join(", ")}`);
    }

    if (isMonday && now.getUTCHours() >= 16) {
      const weekAgo = new Date(now.getTime() - 7 * 86_400_000).toISOString();
      const { count: briefingCount } = await supabase
        .from("issues")
        .select("*", { count: "exact", head: true })
        .gte("published_at", weekAgo);
      if ((briefingCount ?? 0) === 0) {
        alerts.push(
          "🔴 No briefing published this week — aggregator may have failed.",
        );
      }
    }

    const { data: downSources } = await supabase
      .from("source_health")
      .select("agent,source_name,consecutive_failures")
      .eq("status", "down");

    if (downSources && downSources.length > 0) {
      const list = downSources
        .map(
          (s: {
            agent: string;
            source_name: string;
            consecutive_failures: number;
          }) =>
            `${s.source_name} (${s.agent}, ${s.consecutive_failures} failures)`,
        )
        .join("\n  ");
      alerts.push(`⚠️ Sources currently down:\n  ${list}`);
    }

    if (isSunday) {
      const { data: allHealth } = await supabase
        .from("source_health")
        .select(
          "agent,source_name,status,consecutive_failures,last_checked_at,last_item_count",
        )
        .order("agent")
        .order("source_name");

      if (allHealth && allHealth.length > 0) {
        let report = "📊 Weekly Source Health Report\n\n";
        for (const h of allHealth as Array<{
          agent: string;
          source_name: string;
          status: string;
          consecutive_failures: number;
          last_item_count: number;
        }>) {
          const icon = h.status === "up" ? "✅" : "❌";
          report += `${icon} ${h.source_name} (${h.agent}) — ${h.status}, ${h.consecutive_failures} fails, last ${h.last_item_count} items\n`;
        }
        await sendTelegram(report);
      }
    }

    if (alerts.length > 0) {
      const msg = `🔍 Nolana Watchdog — ${now.toISOString().slice(0, 10)}\n\n${alerts.join("\n\n")}`;
      await sendTelegram(msg);
    }

    return NextResponse.json({
      ok: true,
      date: now.toISOString().slice(0, 10),
      todayItems: todayItems ?? 0,
      agentsMissing: missing,
      downSources: (downSources ?? []).length,
      alerts: alerts.length,
      isSunday,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[watchdog] error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
