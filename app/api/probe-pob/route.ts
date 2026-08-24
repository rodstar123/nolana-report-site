import { NextRequest, NextResponse } from "next/server";

/**
 * TEMPORARY diagnostic route — remove in the same session it was added.
 *
 * Answers one question: does portofbrownsville.com reject all Vercel egress,
 * or only requests that look like a bot? The feed fetches 200 locally with the
 * rss-parser UA but 403 from production (Agent 3, 2026-08-24 01:23 UTC).
 *
 * Targets are HARDCODED. No query params, no caller-supplied URL — this must
 * never become an open proxy.
 */

export const dynamic = "force-dynamic";
export const maxDuration = 120;

const FEED_URL = "https://www.portofbrownsville.com/feed/";
const HOME_URL = "https://www.portofbrownsville.com/";

const CHROME_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36";

const BROWSER_HEADERS: Record<string, string> = {
  "User-Agent": CHROME_UA,
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
  "Accept-Encoding": "gzip, deflate, br",
  Connection: "keep-alive",
};

const PROFILES: Array<{
  profile: string;
  url: string;
  headers: Record<string, string>;
}> = [
  {
    profile: "1 rss-parser",
    url: FEED_URL,
    headers: { "User-Agent": "rss-parser" },
  },
  {
    profile: "2 NolanaReport UA",
    url: FEED_URL,
    headers: { "User-Agent": "NolanaReport/1.0 (RGV Intel Pipeline)" },
  },
  { profile: "3 browser /feed/", url: FEED_URL, headers: BROWSER_HEADERS },
  {
    profile: "4 feed-reader",
    url: FEED_URL,
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; Feedly/1.0; +http://www.feedly.com/fetcher.html)",
      Accept: "application/rss+xml, application/xml;q=0.9, */*;q=0.8",
    },
  },
  { profile: "5 browser /", url: HOME_URL, headers: BROWSER_HEADERS },
];

const REPORTED_HEADERS = [
  "server",
  "cf-ray",
  "cf-cache-status",
  "x-sucuri-id",
  "x-sucuri-cache",
  "x-powered-by",
  "via",
  "x-cache",
];

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronHeader = req.headers.get("x-vercel-cron");
  const isAuthorized =
    authHeader === `Bearer ${process.env.CRON_SECRET}` || cronHeader === "1";
  if (!isAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results = [];

  for (const p of PROFILES) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 15_000);
    const started = Date.now();
    try {
      const res = await fetch(p.url, {
        headers: p.headers,
        cache: "no-store",
        redirect: "follow",
        signal: ctrl.signal,
      });
      clearTimeout(timer);
      const ms = Date.now() - started;

      const headers: Record<string, string | null> = {};
      for (const h of REPORTED_HEADERS) headers[h] = res.headers.get(h);

      // Cookie NAMES only — never the values.
      const rawCookie = res.headers.get("set-cookie");
      const cookieNames = rawCookie
        ? rawCookie
            .split(/,(?=[^;]+=)/)
            .map((c) => c.split("=")[0]?.trim())
            .filter(Boolean)
        : [];

      const body = await res.text();

      results.push({
        profile: p.profile,
        url: p.url,
        status: res.status,
        ms,
        finalUrl: res.url,
        headers,
        setCookieNames: cookieNames,
        bodyHead: body.slice(0, 300),
      });
    } catch (err: unknown) {
      clearTimeout(timer);
      results.push({
        profile: p.profile,
        url: p.url,
        status: 0,
        ms: Date.now() - started,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return NextResponse.json({
    vercelRegion: process.env.VERCEL_REGION ?? null,
    ranAt: new Date().toISOString(),
    results,
  });
}
