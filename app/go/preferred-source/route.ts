import { NextResponse, type NextRequest } from "next/server";
import { GA_ID } from "@/lib/analytics";

/**
 * /go/preferred-source — counted redirect to Google's Preferred Sources page.
 *
 * Why this exists: the button used to link straight to google.com carrying
 * utm params, which could never be counted. utm tags are read by the analytics
 * of the DESTINATION site, and the destination is google.com — the reader never
 * lands on nolanareport.com, so our GA4 property never saw the hit. Bouncing
 * through our own origin is the only way to record the click, so the utm params
 * are gone and the outbound URL is clean.
 *
 * Must not be cached: a cached 302 would send later readers straight to Google
 * without passing through here, and the count would silently flatten.
 */
export const dynamic = "force-dynamic";

/** Clean deeplink — no utm params, they never did anything here. */
const GOOGLE_PREFERRED_SOURCE_URL =
  "https://www.google.com/preferences/source?q=nolanareport.com";

/** Allowlisted so a shared or edited link cannot inject junk into GA4. */
const KNOWN_SOURCES = new Set(["email", "site", "footer", "issue"]);

/**
 * GA4 Measurement Protocol needs an api_secret, which is created in GA4 Admin →
 * Data Streams → Measurement Protocol API secrets. Until `GA4_API_SECRET` is set
 * in Vercel the event cannot be sent — so the redirect still happens and the
 * click simply goes uncounted, rather than the link breaking.
 */
async function recordClick(req: NextRequest, source: string): Promise<void> {
  const apiSecret = process.env.GA4_API_SECRET;
  if (!apiSecret) return;

  // GA4 wants a stable client_id. Reuse the browser's existing _ga cookie when
  // there is one (`GA1.1.<a>.<b>` → `<a>.<b>`) so the click joins that user's
  // session; an inbox click usually has no cookie, so fall back to a random id,
  // which GA4 counts as its own user.
  const ga = req.cookies.get("_ga")?.value ?? "";
  const parts = ga.split(".");
  const clientId =
    parts.length >= 4
      ? `${parts[2]}.${parts[3]}`
      : `${Date.now()}.${Math.floor(Math.random() * 1e9)}`;

  try {
    await fetch(
      `https://www.google-analytics.com/mp/collect?measurement_id=${GA_ID}&api_secret=${apiSecret}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: clientId,
          events: [
            {
              name: "preferred_source_click",
              params: {
                source,
                engagement_time_msec: 1,
              },
            },
          ],
        }),
        // Never let a slow analytics call hold up the reader's redirect.
        signal: AbortSignal.timeout(1500),
      },
    );
  } catch {
    // Counting is best-effort. A failed beacon must never cost the reader the
    // redirect they clicked.
  }
}

export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get("src") ?? "";
  const source = KNOWN_SOURCES.has(raw) ? raw : "unknown";

  await recordClick(req, source);

  const res = NextResponse.redirect(GOOGLE_PREFERRED_SOURCE_URL, 302);
  res.headers.set("Cache-Control", "no-store, max-age=0");
  return res;
}
