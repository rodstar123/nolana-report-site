import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { AGENT_NAME_TO_SLUG, type AgentName } from "@/lib/agents/types";
import { fetchBridgeReading } from "@/lib/cbp";
import { sendTelegram } from "@/lib/agents/alerter";
import { cdtSlug, cdtDay, cdtStartOfDay } from "@/lib/cdt";

export const maxDuration = 300;

const ALL_AGENTS: AgentName[] = [
  "Agent 1",
  "Agent 2",
  "Agent 3",
  "Agent 4",
  "Agent 5",
];

function getLastMondayBriefingTime(now: Date): Date {
  const d = new Date(now);
  const day = cdtDay(d);
  const daysSinceMonday = day === 0 ? 6 : day - 1;
  d.setUTCDate(d.getUTCDate() - daysSinceMonday);
  d.setUTCHours(13, 30, 0, 0);
  if (d > now) d.setUTCDate(d.getUTCDate() - 7);
  return d;
}

function daysUntilNextMonday(now: Date): number {
  const day = cdtDay(now);
  if (day === 0) return 1;
  if (day === 1) return 7;
  return 8 - day;
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

  try {
    const now = new Date();
    const startOfDay = cdtStartOfDay(now);
    const isMonday = cdtDay(now) === 1;
    const dateStr = cdtSlug(now);
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ?? "https://nolanareport.com";

    const lines: string[] = [];
    const retries: Array<{ agent: string; ok: boolean; detail: string }> = [];

    // --- Step 1: Check which agents ran today ---
    const { data: todayLogs } = await supabase
      .from("agent_logs")
      .select(
        "agent, items_ingested, sources_failed, sources_attempted, items_fetched",
      )
      .gte("run_started_at", startOfDay.toISOString())
      .not("agent", "eq", "aggregator");

    const ran = new Set(
      (todayLogs ?? []).map((l: { agent: string }) => l.agent),
    );
    const missing = ALL_AGENTS.filter((a) => !ran.has(a));

    // --- Step 2: Auto-re-run missing agents ---
    if (missing.length > 0) {
      lines.push(
        `⚠️ Missing agents detected: ${missing.join(", ")}. Retrying...`,
      );

      const retryPromises = missing.map(async (agent) => {
        const slug = AGENT_NAME_TO_SLUG[agent];
        const retryStartedAt = new Date().toISOString();
        try {
          const res = await fetch(`${baseUrl}/api/agents/${slug}`, {
            headers: { Authorization: `Bearer ${process.env.CRON_SECRET}` },
          });
          const data = (await res.json()) as Record<string, unknown>;
          if (!res.ok) {
            await supabase.from("agent_logs").insert({
              agent,
              run_started_at: retryStartedAt,
              run_finished_at: new Date().toISOString(),
              sources_attempted: 0,
              sources_succeeded: 0,
              sources_failed: 0,
              items_fetched: 0,
              items_new: 0,
              items_scored: 0,
              items_ingested: 0,
              tokens_used: 0,
              errors: [
                {
                  ts: retryStartedAt,
                  agent,
                  source: null,
                  type: "fetch",
                  message: `Supervisor retry failed: ${data.error ?? "unknown"} (HTTP ${res.status})`,
                },
              ],
            });
          }
          return {
            agent,
            ok: res.ok,
            detail: res.ok
              ? `✅ recovered — ${data.itemsIngested ?? 0} ingested`
              : `❌ retry failed: ${data.error ?? "unknown"}`,
          };
        } catch (err) {
          const message = err instanceof Error ? err.message : "fetch failed";
          await supabase.from("agent_logs").insert({
            agent,
            run_started_at: retryStartedAt,
            run_finished_at: new Date().toISOString(),
            sources_attempted: 0,
            sources_succeeded: 0,
            sources_failed: 0,
            items_fetched: 0,
            items_new: 0,
            items_scored: 0,
            items_ingested: 0,
            tokens_used: 0,
            errors: [
              {
                ts: retryStartedAt,
                agent,
                source: null,
                type: "fetch",
                message: `Supervisor retry exception: ${message}`,
              },
            ],
          });
          return {
            agent,
            ok: false,
            detail: `❌ ${message}`,
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

    // --- Step 2b: Per-agent health status ---
    interface AgentLog {
      agent: string;
      items_ingested: number | null;
      sources_failed: number | null;
      sources_attempted: number | null;
      items_fetched: number | null;
    }
    for (const log of (todayLogs ?? []) as AgentLog[]) {
      const failed = log.sources_failed ?? 0;
      const ingested = log.items_ingested ?? 0;
      if (failed > 0) {
        lines.push(
          `  ⚠️ ${log.agent}: ${ingested} ingested, ${failed} source(s) failed`,
        );
      } else if (ingested === 0) {
        lines.push(`  ℹ️ ${log.agent}: no new content (0 sources failed)`);
      }
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

    // --- Step 3b: Weekly pipeline + top stories + source breakdown ---
    const lastBriefing = getLastMondayBriefingTime(now);
    const { data: weeklyItems } = await supabase
      .from("raw_items")
      .select("title, relevance_score, source_name, date_spotted")
      .gte("date_spotted", lastBriefing.toISOString())
      .gte("relevance_score", 50)
      .order("relevance_score", { ascending: false });

    const pool = weeklyItems ?? [];
    if (pool.length > 0) {
      const avgNri =
        pool.reduce(
          (sum: number, r: { relevance_score: number }) =>
            sum + r.relevance_score,
          0,
        ) /
        pool.length /
        10;
      lines.push(
        `📰 Weekly pipeline: ${pool.length} articles since last Monday briefing (avg NRI: ${avgNri.toFixed(1)})`,
      );

      const top3 = pool.slice(0, 3);
      const topLine = top3
        .map(
          (r: { title: string; relevance_score: number }) =>
            `${r.title.length > 50 ? r.title.slice(0, 47) + "..." : r.title} (NRI ${(r.relevance_score / 10).toFixed(1)})`,
        )
        .join(", ");
      lines.push(`🏆 Top stories: ${topLine}`);
    } else {
      lines.push("📰 Weekly pipeline: 0 articles queued.");
    }

    // Source breakdown (today's items only)
    const { data: todayItems } = await supabase
      .from("raw_items")
      .select("source_name")
      .gte("date_spotted", startOfDay.toISOString());

    if (todayItems && todayItems.length > 0) {
      const counts: Record<string, number> = {};
      for (const item of todayItems) {
        const src = (item as { source_name: string }).source_name ?? "Unknown";
        counts[src] = (counts[src] ?? 0) + 1;
      }
      const breakdown = Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .map(([name, count]) => `${name} ${count}`)
        .join(" | ");
      lines.push(`📡 Source breakdown: ${breakdown}`);
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

    // --- Step 4b: CBP bridge feed shape check ---
    let bridgeShapeBroken = false;
    const bridge = await fetchBridgeReading();
    if (bridge === null) {
      lines.push("⚠️ CBP bridge feed unreachable this run.");
    } else if (bridge.shapeBroken) {
      bridgeShapeBroken = true;
      lines.push(
        "🔴 CBP bridge feed returned 0 RGV crossings — likely a feed shape-change. Agent 3 bridge data + homepage tile are blind until parseBridgeWaits() is fixed.",
      );
    } else if (bridge.lanes.length === 0) {
      lines.push(
        `⚠️ CBP bridge: ${bridge.rgvCrossingsMatched} RGV crossings found but all lanes closed/pending (no usable delay).`,
      );
    } else {
      lines.push(
        `✅ CBP bridge: ${bridge.lanes.length}/${bridge.rgvCrossingsMatched} RGV lanes live, avg ${bridge.avgDelayMinutes} min.`,
      );
    }

    // --- Step 4c: Next briefing countdown ---
    const daysOut =
      isMonday && now.getUTCHours() >= 13 ? 0 : daysUntilNextMonday(now);
    const queuedCount = pool.filter(
      (r: { relevance_score: number }) => r.relevance_score >= 50,
    ).length;
    if (daysOut === 0) {
      lines.push(`📅 Briefing day! | Pipeline: ${queuedCount} articles queued`);
    } else {
      lines.push(
        `📅 Next briefing: Monday (${daysOut} day${daysOut > 1 ? "s" : ""}) | Pipeline: ${queuedCount} articles queued`,
      );
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

    // --- Step 5b: Monday post-briefing delivery summary ---
    if (isMonday && now.getUTCHours() >= 15) {
      const { data: todayIssue } = await supabase
        .from("issues")
        .select("id")
        .eq("slug", dateStr)
        .maybeSingle();

      if (todayIssue) {
        const [emailLogResult, subscriberResult] = await Promise.all([
          supabase
            .from("email_log")
            .select("resend_id", { count: "exact" })
            .eq("issue_id", todayIssue.id)
            .eq("email_type", "briefing"),
          supabase
            .from("subscribers")
            .select("*", { count: "exact", head: true })
            .eq("email_verified", true)
            .eq("unsubscribed", false),
        ]);

        const delivered = emailLogResult.count ?? 0;
        const totalSubs = subscriberResult.count ?? 0;

        // Check Resend for bounces/suppressions — sample up to 10 to stay under rate limits
        let bounced = 0;
        let suppressed = 0;
        const resendKey = process.env.RESEND_API_KEY;
        if (resendKey && emailLogResult.data) {
          const resendIds = emailLogResult.data
            .map((r: { resend_id: string | null }) => r.resend_id)
            .filter(Boolean) as string[];
          const sampleSize = Math.min(resendIds.length, 10);
          const sample = resendIds.slice(0, sampleSize);
          const checks = sample.map(async (id: string) => {
            try {
              const res = await fetch(`https://api.resend.com/emails/${id}`, {
                headers: { Authorization: `Bearer ${resendKey}` },
              });
              if (!res.ok) return null;
              return (await res.json()) as { last_event?: string };
            } catch {
              return null;
            }
          });
          const statuses = await Promise.all(checks);
          for (const s of statuses) {
            if (!s) continue;
            if (s.last_event === "bounced") bounced++;
            if (s.last_event === "complained") suppressed++;
          }
          if (sampleSize < resendIds.length) {
            const scale = resendIds.length / sampleSize;
            bounced = Math.round(bounced * scale);
            suppressed = Math.round(suppressed * scale);
          }
        }

        const notSent = totalSubs - delivered;
        lines.push(
          `📬 Briefing delivered: ${delivered}/${totalSubs}${bounced > 0 ? ` | Bounced: ${bounced}` : ""}${suppressed > 0 ? ` | Suppressed: ${suppressed}` : ""}${notSent > 0 && bounced === 0 && suppressed === 0 ? ` | Skipped: ${notSent}` : ""}`,
        );
        lines.push(`👥 Confirmed subscribers: ${totalSubs}`);
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
      bridgeShapeBroken,
      lines,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[supervisor] Fatal error:", message);
    await sendTelegram(
      `🔴 <b>Nolana Supervisor — CRASH</b>\n\n` +
        `The supervisor failed to complete.\n` +
        `Error: ${message.slice(0, 300)}`,
    );
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
