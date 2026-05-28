import crypto from "crypto";
import { SupabaseClient } from "@supabase/supabase-js";
import type {
  AgentName,
  AgentRunStats,
  ScoredItem,
  RawItem,
  FullTextResult,
} from "./types";

export function urlHash(url: string): string {
  return crypto.createHash("sha256").update(url.trim()).digest("hex");
}

export async function checkDuplicate(
  supabase: SupabaseClient,
  hash: string,
): Promise<boolean> {
  const { data } = await supabase
    .from("raw_items")
    .select("id")
    .eq("url_hash", hash)
    .maybeSingle();
  return data !== null;
}

export async function upsertRawItem(
  supabase: SupabaseClient,
  item: RawItem,
  scored: ScoredItem,
  fullText: FullTextResult,
  hash: string,
): Promise<{ ok: boolean; error: string | null }> {
  const { error } = await supabase.from("raw_items").upsert(
    {
      url: item.url,
      url_hash: hash,
      agent: item.agent,
      title: item.title.slice(0, 500),
      snippet: item.snippet?.slice(0, 1000) ?? null,
      full_text: fullText.text,
      fetch_method: fullText.method,
      source_name: item.source,
      category: scored.category,
      summary: scored.summary,
      language: scored.language,
      relevance_score: scored.score,
      original_date: item.original_date || null,
      instant_alerted: scored.score >= 95,
      included_in_briefing: false,
    },
    { onConflict: "url_hash", ignoreDuplicates: true },
  );
  if (error) {
    return {
      ok: false,
      error: `raw_items upsert: ${error.code} ${error.message}`,
    };
  }
  return { ok: true, error: null };
}

export async function recordHealth(
  supabase: SupabaseClient,
  agent: AgentName,
  name: string,
  url: string,
  ok: boolean,
  itemCount: number,
): Promise<void> {
  const { data: row } = await supabase
    .from("source_health")
    .select("consecutive_failures")
    .eq("agent", agent)
    .eq("source_url", url)
    .maybeSingle();

  const fails = ok ? 0 : (row?.consecutive_failures ?? 0) + 1;
  const now = new Date().toISOString();

  await supabase.from("source_health").upsert(
    {
      agent,
      source_name: name,
      source_url: url,
      status: fails >= 3 ? "down" : "up",
      ...(ok ? { last_success_at: now } : { last_failure_at: now }),
      consecutive_failures: fails,
      last_item_count: itemCount,
      last_checked_at: now,
    },
    { onConflict: "agent,source_url" },
  );
}

export async function checkSourceHealth(
  supabase: SupabaseClient,
  agent: AgentName,
  sourceUrl: string,
): Promise<{ consecutiveFailures: number }> {
  const { data } = await supabase
    .from("source_health")
    .select("consecutive_failures")
    .eq("agent", agent)
    .eq("source_url", sourceUrl)
    .maybeSingle();
  return { consecutiveFailures: data?.consecutive_failures ?? 0 };
}

export async function writeAgentLog(
  supabase: SupabaseClient,
  stats: AgentRunStats,
): Promise<{ ok: boolean; error: string | null }> {
  const { error } = await supabase.from("agent_logs").insert({
    agent: stats.agent,
    run_started_at: stats.runStartedAt,
    run_finished_at: stats.runFinishedAt ?? new Date().toISOString(),
    sources_attempted: stats.sourcesAttempted,
    sources_succeeded: stats.sourcesSucceeded,
    sources_failed: stats.sourcesFailed,
    items_fetched: stats.itemsFetched,
    items_new: stats.itemsNew,
    items_scored: stats.itemsScored,
    items_ingested: stats.itemsIngested,
    tokens_used: stats.tokensUsed,
    errors: stats.errors as unknown as Record<string, unknown>[],
  });
  if (error) {
    return {
      ok: false,
      error: `agent_logs insert: ${error.code} ${error.message}`,
    };
  }
  return { ok: true, error: null };
}
