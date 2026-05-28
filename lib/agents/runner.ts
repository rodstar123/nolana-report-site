import { SupabaseClient } from "@supabase/supabase-js";
import { SOURCES } from "./sources";
import { fetchSource } from "./fetcher";
import { normalize, fetchFullText } from "./normalize";
import { scoreItem } from "./scorer";
import {
  urlHash,
  checkDuplicate,
  upsertRawItem,
  recordHealth,
  checkSourceHealth,
  writeAgentLog,
} from "./writer";
import {
  sendInstantAlert,
  sendRunAlert,
  sendTokenCapAlert,
  sendDbWriteAlert,
} from "./alerter";
import type {
  AgentName,
  AgentRunStats,
  FetchResult,
  PipelineError,
  RawItem,
} from "./types";

export interface RunResult {
  agent: AgentName;
  sourcesAttempted: number;
  sourcesSucceeded: number;
  sourcesFailed: number;
  itemsFetched: number;
  itemsNew: number;
  itemsScored: number;
  itemsIngested: number;
  tokensUsed: number;
  errors: PipelineError[];
  durationMs: number;
}

export async function runAgent(
  agent: AgentName,
  supabase: SupabaseClient,
): Promise<RunResult> {
  const runStartedAt = new Date().toISOString();
  const sources = SOURCES[agent];
  const errors: PipelineError[] = [];
  let sourcesSucceeded = 0;
  let sourcesFailed = 0;
  let itemsFetched = 0;
  let itemsNew = 0;
  let itemsScored = 0;
  let itemsIngested = 0;
  let tokensUsed = 0;
  const dailyTokenCap = parseInt(process.env.DAILY_TOKEN_CAP ?? "250000", 10);
  let tokenCapHit = false;

  const healthChecks = await Promise.allSettled(
    sources.map((s) => checkSourceHealth(supabase, agent, s.url)),
  );

  const fetchPromises = sources.map(async (source, i) => {
    const health =
      healthChecks[i].status === "fulfilled"
        ? healthChecks[i].value
        : { consecutiveFailures: 0 };
    if (health.consecutiveFailures >= 3) {
      return {
        source,
        ok: false,
        items: [] as RawItem[],
        error: "auto-skipped (3+ consecutive failures)",
        responseMs: 0,
        skipped: true,
      } as FetchResult & { skipped: boolean };
    }
    const result = await fetchSource(source, agent);
    return { ...result, skipped: false };
  });

  const settled = await Promise.allSettled(fetchPromises);
  const fetchResults: Array<FetchResult & { skipped: boolean }> = settled.map(
    (r, i) =>
      r.status === "fulfilled"
        ? r.value
        : {
            source: sources[i],
            ok: false,
            items: [],
            error: String(r.reason),
            responseMs: 0,
            skipped: false,
          },
  );

  for (const result of fetchResults) {
    if (!result.skipped) {
      if (result.ok) sourcesSucceeded++;
      else {
        sourcesFailed++;
        errors.push({
          ts: new Date().toISOString(),
          agent,
          source: result.source.name,
          type: "fetch",
          message: result.error ?? "Unknown fetch error",
        });
      }
      await recordHealth(
        supabase,
        agent,
        result.source.name,
        result.source.url,
        result.ok,
        result.items.length,
      );
    }
  }

  const allItems = fetchResults.flatMap((r) => r.items);
  const normalized = normalize(allItems);
  itemsFetched = normalized.length;

  for (const item of normalized) {
    if (tokenCapHit) break;

    const hash = urlHash(item.url);
    const isDup = await checkDuplicate(supabase, hash);
    if (isDup) continue;
    itemsNew++;

    const fullText = await fetchFullText(item.url);
    const { scored, error: scoreError } = await scoreItem(
      item.title,
      item.snippet,
      fullText.text,
      item.source,
      item.original_date,
    );

    if (scoreError) {
      errors.push({
        ts: new Date().toISOString(),
        agent,
        source: item.source,
        type: "score",
        message: scoreError,
        context: { url: item.url },
      });
      continue;
    }

    itemsScored++;
    tokensUsed += scored.tokens;

    if (tokensUsed >= dailyTokenCap) {
      tokenCapHit = true;
      await sendTokenCapAlert(agent, tokensUsed);
      break;
    }

    if (scored.score >= 95) {
      await sendInstantAlert(item, scored);
    }

    if (scored.score >= 40) {
      const { ok, error: writeError } = await upsertRawItem(
        supabase,
        item,
        scored,
        fullText,
        hash,
      );
      if (ok) {
        itemsIngested++;
      } else {
        errors.push({
          ts: new Date().toISOString(),
          agent,
          source: item.source,
          type: "db",
          message: writeError ?? "Unknown write error",
          context: { url: item.url },
        });
        await sendDbWriteAlert(agent, "raw_items", writeError ?? "unknown");
      }
    }
  }

  await sendRunAlert(
    agent,
    sourcesFailed,
    sources.filter(
      (_, i) =>
        !(
          fetchResults[i] &&
          "skipped" in fetchResults[i] &&
          fetchResults[i].skipped
        ),
    ).length,
    itemsIngested,
  );

  const stats: AgentRunStats = {
    agent,
    runStartedAt,
    runFinishedAt: new Date().toISOString(),
    sourcesAttempted:
      sources.length - fetchResults.filter((r) => r.skipped).length,
    sourcesSucceeded,
    sourcesFailed,
    itemsFetched,
    itemsNew,
    itemsScored,
    itemsIngested,
    tokensUsed,
    errors,
  };

  const logResult = await writeAgentLog(supabase, stats);
  if (!logResult.ok) {
    console.error(`[${agent}] Failed to write agent_logs:`, logResult.error);
  }

  return {
    ...stats,
    durationMs: Date.now() - new Date(runStartedAt).getTime(),
  };
}
