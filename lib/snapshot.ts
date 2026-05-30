import { createClient } from "@supabase/supabase-js";

/**
 * Live homepage snapshot — powers the DataBar.
 *
 * Trust rule: NEVER show a stale fixed date. `updatedAtISO` is the real
 * last pipeline refresh (max agent_logs.run_finished_at). Numeric metrics
 * are sourced from real data where it exists (Supabase for stories/filings,
 * live public APIs for USD/MXN + bridge waits — the same endpoints the
 * pipeline ingests). If an external value is briefly unavailable we fall
 * back to a neutral seed, but the timestamp always reflects reality.
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

const RGV_PORTS = [
  "Hidalgo",
  "Pharr",
  "Brownsville",
  "Progreso",
  "Rio Grande City",
  "Roma",
  "Los Indios",
  "Anzalduas",
];

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

/** Monday 00:00 UTC of the current week, ISO string. */
function weekStartISO(): string {
  const now = new Date();
  const day = now.getUTCDay(); // 0=Sun … 1=Mon
  const diff = (day + 6) % 7; // days since Monday
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

/** Live avg passenger-lane bridge wait across RGV ports (CBP BWT API). */
async function getBridgeWait(): Promise<number | null> {
  try {
    const res = await fetch("https://bwt.cbp.gov/api/bwtnew", {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const json = (await res.json()) as {
      port?: Array<Record<string, unknown>>;
    };
    const waits: number[] = [];
    for (const port of json?.port ?? []) {
      const portName = (port.port_name as string) ?? "";
      const crossing = port.crossing_name as string | undefined;
      const isRgv = RGV_PORTS.some(
        (p) => portName.includes(p) || (crossing && crossing.includes(p)),
      );
      if (!isRgv) continue;
      const passenger = port.passenger_vehicle_lanes as
        | {
            standard_lanes?: {
              delay_minutes?: string | number;
              operational_status?: string;
            };
          }
        | undefined;
      const status = passenger?.standard_lanes?.operational_status;
      // skip closed lanes (no meaningful wait)
      if (status && /closed/i.test(status)) continue;
      const raw = passenger?.standard_lanes?.delay_minutes;
      if (raw == null || raw === "") continue;
      const delay = typeof raw === "number" ? raw : parseInt(raw, 10);
      if (Number.isFinite(delay) && delay >= 0) waits.push(delay);
    }
    if (waits.length === 0) return null;
    const avg = waits.reduce((a, b) => a + b, 0) / waits.length;
    return Math.round(avg);
  } catch {
    return null;
  }
}

export async function getSnapshot(): Promise<Snapshot> {
  const supabase = getServiceClient();
  const weekStart = weekStartISO();

  let storiesScored: number | null = null;
  let newFilings: number | null = null;
  let updatedAtISO: string | null = null;

  if (supabase) {
    const [scored, filings, lastRun] = await Promise.all([
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
        .from("agent_logs")
        .select("run_finished_at")
        .not("run_finished_at", "is", null)
        .order("run_finished_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);
    storiesScored = scored.count ?? null;
    newFilings = filings.count ?? null;
    updatedAtISO =
      (lastRun.data as { run_finished_at?: string } | null)?.run_finished_at ??
      null;
  }

  const [usdMxn, bridgeWait] = await Promise.all([
    getUsdMxn(),
    getBridgeWait(),
  ]);

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
    {
      label: "Bridge Wait",
      value: bridgeWait ?? 20,
      decimals: 0,
      prefix: "",
      suffix: " min avg",
      live: bridgeWait !== null,
    },
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

/** "Updated Monday, May 25, 2026 at 6:45 AM" style label in CST, from real refresh time. */
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
  });
  // en-US → "Friday, May 29, 2026 at 4:37 PM"
  return `Updated ${fmt.format(d)} CST`;
}
