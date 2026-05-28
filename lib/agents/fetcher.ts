import RssParser from "rss-parser";
import type { AgentName, FetchResult, RawItem, SourceConfig } from "./types";

const rssParser = new RssParser({ timeout: 10_000 });

async function fetchWithRetry(
  url: string,
  opts: RequestInit = {},
  timeoutMs = 10_000,
): Promise<Response> {
  for (let attempt = 0; attempt < 2; attempt++) {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      const res = await fetch(url, { ...opts, signal: ctrl.signal });
      clearTimeout(t);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res;
    } catch (err) {
      clearTimeout(t);
      if (attempt === 1) throw err;
      await new Promise((r) => setTimeout(r, 500));
    }
  }
  throw new Error("exhausted retries");
}

function parseRssItems(
  feed: RssParser.Output<Record<string, unknown>>,
  source: SourceConfig,
  agent: AgentName,
): RawItem[] {
  return (feed.items ?? []).map((item) => ({
    title: (item.title ?? "").slice(0, 500),
    url: item.link ?? item.guid ?? "",
    snippet: (item.contentSnippet ?? item.content ?? "").slice(0, 1000),
    source: source.name,
    original_date: item.isoDate ?? item.pubDate ?? "",
    agent,
  }));
}

function parseRedditJson(
  json: unknown,
  source: SourceConfig,
  agent: AgentName,
): RawItem[] {
  const listing = json as {
    data?: { children?: Array<{ data: Record<string, string> }> };
  };
  return (listing?.data?.children ?? []).map((child) => ({
    title: (child.data.title ?? "").slice(0, 500),
    url: child.data.url ?? `https://reddit.com${child.data.permalink ?? ""}`,
    snippet: (child.data.selftext ?? "").slice(0, 1000),
    source: source.name,
    original_date: child.data.created_utc
      ? new Date(Number(child.data.created_utc) * 1000).toISOString()
      : "",
    agent,
  }));
}

function parseFederalRegister(
  json: unknown,
  source: SourceConfig,
  agent: AgentName,
): RawItem[] {
  const fr = json as { results?: Array<Record<string, string>> };
  return (fr?.results ?? []).map((r) => ({
    title: (r.title ?? "").slice(0, 500),
    url: r.html_url ?? "",
    snippet: (r.abstract ?? "").slice(0, 1000),
    source: source.name,
    original_date: r.publication_date ?? "",
    agent,
  }));
}

const RGV_PORTS = /mcallen|hidalgo|anzalduas|pharr/i;
const BRIDGE_DELAY_THRESHOLD = 60;

function parseCbpBridgeWaits(
  json: unknown,
  source: SourceConfig,
  agent: AgentName,
): RawItem[] {
  const cbp = json as { port?: Array<Record<string, unknown>> };
  const items: RawItem[] = [];
  for (const port of cbp?.port ?? []) {
    const portName = String(port.port_name ?? "");
    if (!RGV_PORTS.test(portName)) continue;
    const lanes = port.passenger_vehicle_lanes as
      | { standard_lanes?: { delay_minutes?: number } }
      | undefined;
    const delay = lanes?.standard_lanes?.delay_minutes ?? 0;
    if (delay < BRIDGE_DELAY_THRESHOLD) continue;
    items.push({
      title: `Bridge wait anomaly: ${portName} — ${delay} min delay`,
      url: "https://bwt.cbp.gov/",
      snippet: `Passenger standard-lane delay at ${portName}: ${delay} minutes (threshold: ${BRIDGE_DELAY_THRESHOLD}min).`,
      source: source.name,
      original_date: new Date().toISOString(),
      agent,
    });
  }
  return items;
}

const FX_THRESHOLD_PCT = 1.5;
let lastMxnRate: number | null = null;

function parseFxRate(
  json: unknown,
  source: SourceConfig,
  agent: AgentName,
): RawItem[] {
  const fx = json as {
    rates?: Record<string, number>;
    time_last_update_utc?: string;
  };
  const mxn = fx?.rates?.MXN;
  if (!mxn) return [];
  const prev = lastMxnRate;
  lastMxnRate = mxn;
  if (prev === null) return [];
  const pctChange = Math.abs(((mxn - prev) / prev) * 100);
  if (pctChange < FX_THRESHOLD_PCT) return [];
  return [
    {
      title: `USD/MXN move: ${prev.toFixed(2)} → ${mxn.toFixed(2)} (${pctChange.toFixed(1)}%)`,
      url: "https://open.er-api.com/v6/latest/USD",
      snippet: `USD/MXN exchange rate moved ${pctChange.toFixed(1)}% — from ${prev.toFixed(2)} to ${mxn.toFixed(2)}.`,
      source: source.name,
      original_date: fx.time_last_update_utc ?? new Date().toISOString(),
      agent,
    },
  ];
}

async function fetchRss(
  source: SourceConfig,
  agent: AgentName,
): Promise<{ items: RawItem[]; error: string | null }> {
  try {
    const feed = await rssParser.parseURL(source.url);
    return { items: parseRssItems(feed, source, agent), error: null };
  } catch (e) {
    return { items: [], error: e instanceof Error ? e.message : String(e) };
  }
}

async function fetchJson(
  source: SourceConfig,
  agent: AgentName,
): Promise<{ items: RawItem[]; error: string | null }> {
  try {
    let url = source.url;
    if (source.name === "Federal Register API") {
      const gte = new Date(Date.now() - 7 * 86_400_000)
        .toISOString()
        .slice(0, 10);
      url = url.replace(
        /conditions%5Bpublication_date%5D%5Bgte%5D=[^&]*/,
        `conditions%5Bpublication_date%5D%5Bgte%5D=${gte}`,
      );
    }
    const headers: Record<string, string> = {};
    if (source.name.includes("Reddit")) {
      headers["User-Agent"] = "NolanaReport/1.0 (RGV Intel Pipeline)";
    }
    const res = await fetchWithRetry(url, { headers });
    const json = await res.json();
    let items: RawItem[];
    if (source.name.includes("Reddit")) {
      items = parseRedditJson(json, source, agent);
    } else if (source.name === "Federal Register API") {
      items = parseFederalRegister(json, source, agent);
    } else if (source.name === "CBP Bridge Waits") {
      items = parseCbpBridgeWaits(json, source, agent);
    } else if (source.name === "USD/MXN FX") {
      items = parseFxRate(json, source, agent);
    } else {
      items = [];
    }
    return { items, error: null };
  } catch (e) {
    return { items: [], error: e instanceof Error ? e.message : String(e) };
  }
}

async function fetchScraper(
  source: SourceConfig,
  agent: AgentName,
): Promise<{ items: RawItem[]; error: string | null }> {
  try {
    const res = await fetchWithRetry(source.url, {
      headers: { "User-Agent": "NolanaReport/1.0 (RGV Intel Pipeline)" },
    });
    const html = await res.text();
    const stripped = html
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    if (stripped.length < 50)
      return { items: [], error: "Empty scrape result" };
    return {
      items: [
        {
          title: `${source.name} page content`,
          url: source.url,
          snippet: stripped.slice(0, 1000),
          source: source.name,
          original_date: new Date().toISOString(),
          agent,
        },
      ],
      error: null,
    };
  } catch (e) {
    return { items: [], error: e instanceof Error ? e.message : String(e) };
  }
}

export async function fetchSource(
  source: SourceConfig,
  agent: AgentName,
): Promise<FetchResult> {
  const start = Date.now();
  let result: { items: RawItem[]; error: string | null };

  switch (source.type) {
    case "rss":
      result = await fetchRss(source, agent);
      break;
    case "json":
      result = await fetchJson(source, agent);
      break;
    case "scraper":
      result = await fetchScraper(source, agent);
      break;
    default:
      result = { items: [], error: `Unknown source type: ${source.type}` };
  }

  return {
    source,
    ok: result.error === null,
    items: result.items,
    error: result.error,
    responseMs: Date.now() - start,
  };
}
