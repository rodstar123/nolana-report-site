/**
 * CBP Border Wait Times — shared parser for the bwtnew feed.
 *
 * ONE source of truth for the homepage snapshot, the Agent 3 pipeline source,
 * and the Supervisor health check, so a feed shape-change can never silently
 * desync three copies again.
 *
 * Feed reality (confirmed May 2026):
 *  - GET https://bwt.cbp.gov/api/bwtnew returns a TOP-LEVEL ARRAY of ports
 *    (NOT { port: [...] } — the old code assumed the wrapper and got nothing).
 *  - Each port: { port_name, crossing_name, port_status,
 *      passenger_vehicle_lanes: { standard_lanes: {
 *        operational_status, delay_minutes (STRING), lanes_open } } }
 *  - Localized text: status may be Spanish ("demora", "Sin demora",
 *    "Carriles cerrados") or English. So we DO NOT parse status text — we rely
 *    on delay_minutes parsing to a finite number, which is language-agnostic.
 */

export const CBP_BWT_URL = "https://bwt.cbp.gov/api/bwtnew";

// RGV land ports of entry (matches port_name or crossing_name).
export const RGV_BRIDGE_MATCH =
  /brownsville|hidalgo|pharr|anzalduas|progreso|donna|rio grande city|roma|los indios|veterans|gateway|b&m/i;

export interface BridgeLane {
  crossing: string;
  delayMinutes: number;
}

export interface BridgeReading {
  /** RGV crossings whose passenger standard-lane delay parsed to a number. */
  lanes: BridgeLane[];
  /** Mean passenger standard-lane delay across usable RGV lanes, rounded. */
  avgDelayMinutes: number | null;
  /** RGV crossings present in the feed at all (open or closed). */
  rgvCrossingsMatched: number;
  /** True when the feed shape no longer yields ANY RGV crossing — a shape break. */
  shapeBroken: boolean;
}

type RawPort = Record<string, unknown>;

function laneDelay(port: RawPort): number | null {
  const pv = port.passenger_vehicle_lanes as
    | { standard_lanes?: { delay_minutes?: string | number } }
    | undefined;
  const raw = pv?.standard_lanes?.delay_minutes;
  if (raw == null || raw === "") return null; // closed / pending / N/A
  const n = typeof raw === "number" ? raw : parseInt(raw, 10);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

/** Parse the bwtnew payload (array or legacy {port:[]}) into an RGV reading. */
export function parseBridgeWaits(json: unknown): BridgeReading {
  const ports: RawPort[] = Array.isArray(json)
    ? (json as RawPort[])
    : (((json as { port?: RawPort[] })?.port ?? []) as RawPort[]);

  const rgv = ports.filter((p) => {
    const hay = `${p.port_name ?? ""} ${p.crossing_name ?? ""}`;
    return RGV_BRIDGE_MATCH.test(hay);
  });

  const lanes: BridgeLane[] = [];
  for (const p of rgv) {
    const delay = laneDelay(p);
    if (delay == null) continue;
    const crossing = `${p.port_name ?? ""}${
      p.crossing_name ? ` – ${p.crossing_name}` : ""
    }`.trim();
    lanes.push({ crossing, delayMinutes: delay });
  }

  const avgDelayMinutes =
    lanes.length > 0
      ? Math.round(
          lanes.reduce((sum, l) => sum + l.delayMinutes, 0) / lanes.length,
        )
      : null;

  return {
    lanes,
    avgDelayMinutes,
    rgvCrossingsMatched: rgv.length,
    // Shape is broken only when NO RGV crossing is found at all. (All-closed at
    // 3 AM yields rgvCrossingsMatched>0 but lanes=0 — legitimate, not a bug.)
    shapeBroken: rgv.length === 0,
  };
}

/** Fetch + parse the live feed. Returns null reading on network failure. */
export async function fetchBridgeReading(
  revalidateSeconds = 3600,
): Promise<BridgeReading | null> {
  try {
    const res = await fetch(CBP_BWT_URL, {
      next: { revalidate: revalidateSeconds },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return parseBridgeWaits(json);
  } catch {
    return null;
  }
}
