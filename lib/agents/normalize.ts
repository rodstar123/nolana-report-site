import type { FullTextResult, RawItem } from "./types";

const MAX_PER_SOURCE = 25;

export function normalize(items: RawItem[]): RawItem[] {
  const sevenDaysAgo = Date.now() - 7 * 86_400_000;
  const seen = new Set<string>();
  const out: RawItem[] = [];
  for (const d of items) {
    const t = d.original_date
      ? new Date(d.original_date).getTime()
      : Date.now();
    if (d.original_date && (isNaN(t) || t < sevenDaysAgo)) continue;
    if (!d.url || seen.has(d.url)) continue;
    seen.add(d.url);
    out.push(d);
  }
  const bySource = new Map<string, RawItem[]>();
  for (const item of out) {
    const key = item.source;
    if (!bySource.has(key)) bySource.set(key, []);
    bySource.get(key)!.push(item);
  }
  const capped: RawItem[] = [];
  for (const group of Array.from(bySource.values())) {
    group.sort((a, b) => {
      const ta = a.original_date ? new Date(a.original_date).getTime() : 0;
      const tb = b.original_date ? new Date(b.original_date).getTime() : 0;
      return tb - ta;
    });
    capped.push(...group.slice(0, MAX_PER_SOURCE));
  }
  return capped;
}

async function safeFetch(
  url: string,
  opts: RequestInit,
  timeoutMs: number,
): Promise<Response | null> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...opts, signal: ctrl.signal });
    clearTimeout(t);
    return res.ok ? res : null;
  } catch {
    clearTimeout(t);
    return null;
  }
}

export async function fetchFullText(url: string): Promise<FullTextResult> {
  const fc = process.env.FIRECRAWL_API_KEY;
  if (fc) {
    try {
      const res = await safeFetch(
        "https://api.firecrawl.dev/v2/scrape",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${fc}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            url,
            formats: ["markdown"],
            onlyMainContent: true,
            timeout: 3000,
          }),
        },
        5000,
      );
      if (res) {
        const j = (await res.json()) as {
          success?: boolean;
          data?: { markdown?: string };
        };
        if (j?.success && j?.data?.markdown) {
          return { text: j.data.markdown.slice(0, 6000), method: "firecrawl" };
        }
      }
    } catch {
      /* fall through to Bright Data */
    }
  }

  const bd = process.env.BRIGHT_DATA_API_KEY;
  if (bd) {
    try {
      const res = await safeFetch(
        "https://api.brightdata.com/request",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${bd}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ zone: "unblocker", url, format: "raw" }),
        },
        5000,
      );
      if (res) {
        const raw = await res.text();
        const stripped = raw
          .replace(/<script[\s\S]*?<\/script>/gi, "")
          .replace(/<style[\s\S]*?<\/style>/gi, "")
          .replace(/<[^>]+>/g, " ")
          .replace(/\s+/g, " ")
          .trim();
        if (stripped.length > 100) {
          return { text: stripped.slice(0, 6000), method: "bright_data" };
        }
      }
    } catch {
      /* fall through to snippet */
    }
  }

  return { text: null, method: "none" };
}
