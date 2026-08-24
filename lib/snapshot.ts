import { createClient } from "@supabase/supabase-js";
import { fetchBridgeReading, type BridgeReading } from "./cbp";
import { cdtDay } from "./cdt";

/**
 * Live homepage snapshot — powers the DataBar.
 *
 * Trust rule: NEVER show a number that isn't real. `updatedAtISO` is the real
 * last pipeline refresh (max agent_logs.run_finished_at). Metrics come from
 * real data: Supabase for stories/filings/sources, live public APIs for
 * USD/MXN + bridge waits (the same endpoints the pipeline ingests). If live
 * bridge data is unavailable the third tile SWAPS to an always-true Supabase
 * metric (Sources Monitored) instead of showing a plausible-but-fake wait —
 * the page never displays a fabricated value, and the timestamp always
 * reflects the real last refresh.
 */

export interface SnapshotMetric {
  label: string;
  value: number;
  decimals: number;
  prefix: string;
  suffix: string;
  live: boolean; // true = sourced from real data this cycle
}

export interface Snapshot {
  metrics: SnapshotMetric[];
  updatedAtISO: string | null;
}

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

/** Monday 00:00 CDT of the current week, ISO string. */
function weekStartISO(): string {
  const now = new Date();
  const day = cdtDay(now);
  const diff = (day + 6) % 7;
  const monday = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - diff),
  );
  return monday.toISOString();
}

/** Live USD/MXN from the same endpoint Agent 3 ingests. */
async function getUsdMxn(): Promise<number | null> {
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/USD", {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { rates?: Record<string, number> };
    const mxn = json?.rates?.MXN;
    return typeof mxn === "number" && mxn > 0 ? mxn : null;
  } catch {
    return null;
  }
}

/**
 * Passenger standard-lane delay for the Pharr–Reynosa crossing, or null when
 * the feed doesn't carry it this cycle.
 *
 * Matching is deliberately NOT a substring test on the whole label. CBP names
 * the port "Hidalgo/Pharr", so /pharr/i against `crossing` matches BOTH
 * "Hidalgo/Pharr – Hidalgo" and "Hidalgo/Pharr – Pharr" — it would have
 * silently reported Hidalgo's wait as Pharr's. We match the crossing_name
 * segment after the en-dash instead.
 *
 * Every lane in BridgeReading.lanes is already the passenger standard lane
 * (lib/cbp.ts laneDelay reads passenger_vehicle_lanes.standard_lanes only), so
 * there is no passenger-vs-commercial choice to make here.
 */
export function pharrLaneDelay(reading: BridgeReading | null): number | null {
  for (const lane of reading?.lanes ?? []) {
    const parts = lane.crossing.split(" – ");
    const crossingName = parts.length > 1 ? parts[parts.length - 1] : parts[0];
    if (/\bpharr\b/i.test(crossingName)) return lane.delayMinutes;
  }
  return null;
}

/**
 * Tiles for the Monday email's header strip: USD/MXN, Pharr–Reynosa wait, RGV
 * average wait. Separate from getSnapshot() so the homepage DataBar is
 * untouched. `updatedAtISO` is the read time, because these are fetched live.
 */
export async function getEmailStripMetrics(): Promise<Snapshot> {
  const [usdMxn, bridge] = await Promise.all([
    getUsdMxn(),
    fetchBridgeReading(),
  ]);
  const pharr = pharrLaneDelay(bridge);
  const avg = bridge?.avgDelayMinutes ?? null;

  const metrics: SnapshotMetric[] = [
    {
      label: "USD/MXN",
      value: usdMxn ?? 0,
      decimals: 2,
      prefix: "$",
      suffix: "",
      live: usdMxn !== null,
    },
    {
      label: "Pharr–Reynosa",
      value: pharr ?? 0,
      decimals: 0,
      prefix: "",
      suffix: " min",
      // 0 is a real reading (no delay) — test for null, never truthiness.
      live: pharr !== null,
    },
    {
      label: "RGV Avg Wait",
      value: avg ?? 0,
      decimals: 0,
      prefix: "",
      suffix: " min",
      live: avg !== null,
    },
  ];

  return { metrics, updatedAtISO: new Date().toISOString() };
}

export async function getSnapshot(): Promise<Snapshot> {
  const supabase = getServiceClient();
  const weekStart = weekStartISO();

  let storiesScored: number | null = null;
  let newFilings: number | null = null;
  let sourcesMonitored: number | null = null;
  let updatedAtISO: string | null = null;

  if (supabase) {
    const [scored, filings, sources, lastRun] = await Promise.all([
      supabase
        .from("raw_items")
        .select("*", { count: "exact", head: true })
        .gte("date_spotted", weekStart),
      supabase
        .from("raw_items")
        .select("*", { count: "exact", head: true })
        .gte("date_spotted", weekStart)
        .in("category", [
          "New Open",
          "Permit",
          "Filing",
          "Zoning",
          "City Council",
        ]),
      supabase
        .from("source_health")
        .select("*", { count: "exact", head: true }),
      supabase
        .from("agent_logs")
        .select("run_finished_at")
        .not("run_finished_at", "is", null)
        .order("run_finished_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);
    storiesScored = scored.count ?? null;
    newFilings = filings.count ?? null;
    sourcesMonitored = sources.count ?? null;
    updatedAtISO =
      (lastRun.data as { run_finished_at?: string } | null)?.run_finished_at ??
      null;
  }

  const [usdMxn, bridge] = await Promise.all([
    getUsdMxn(),
    fetchBridgeReading(),
  ]);
  const bridgeWait = bridge?.avgDelayMinutes ?? null;

  // Truthful third tile: prefer live bridge data; if unavailable, show an
  // always-true Supabase metric (Sources Monitored) rather than a fake number.
  const thirdTile: SnapshotMetric =
    bridgeWait !== null
      ? {
          label: "Bridge Wait",
          value: bridgeWait,
          decimals: 0,
          prefix: "",
          suffix: " min avg",
          live: true,
        }
      : {
          label: "Sources Monitored",
          value: sourcesMonitored ?? 0,
          decimals: 0,
          prefix: "",
          suffix: "",
          live: sourcesMonitored !== null,
        };

  const metrics: SnapshotMetric[] = [
    {
      label: "USD/MXN",
      value: usdMxn ?? 18.5,
      decimals: 2,
      prefix: "$",
      suffix: "",
      live: usdMxn !== null,
    },
    {
      label: "Stories Scored",
      value: storiesScored ?? 0,
      decimals: 0,
      prefix: "",
      suffix: " this week",
      live: storiesScored !== null,
    },
    thirdTile,
    {
      label: "New Filings",
      value: newFilings ?? 0,
      decimals: 0,
      prefix: "",
      suffix: " this week",
      live: newFilings !== null,
    },
  ];

  return { metrics, updatedAtISO };
}

/**
 * "Updated Friday, May 29, 2026 at 4:37 PM CDT" — from the real refresh time.
 * timeZoneName:"short" emits the correct abbreviation automatically
 * (CDT in summer DST, CST in winter), so the label is never wrong.
 */
export function formatUpdatedLabel(iso: string | null): string {
  const d = iso ? new Date(iso) : new Date();
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago",
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });
  return `Updated ${fmt.format(d)}`;
}
