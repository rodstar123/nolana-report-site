import type { NextRequest } from "next/server";

/**
 * Bearer-only authorization for cron-invoked routes.
 *
 * Vercel sends `Authorization: Bearer $CRON_SECRET` on every cron invocation
 * when CRON_SECRET is set on the project. That is the documented mechanism and
 * the only signal a caller cannot forge.
 *
 * This replaces a previous `|| cronHeader === "1"` fallback that trusted
 * `x-vercel-cron`, an undocumented header Vercel does not strip from inbound
 * requests — which left every cron route callable by anyone with the URL
 * (verified 2026-08-24: an unauthenticated request carrying that header ran a
 * full aggregator generation).
 *
 * Fails closed. An unset or empty CRON_SECRET denies every request rather than
 * comparing against the literal string "Bearer undefined".
 *
 * One implementation on purpose: this invariant is enforced in twelve handlers,
 * and twelve copies is twelve chances for one to drift back open.
 */
export function isCronAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

/**
 * Headers for server-to-server calls between cron-protected routes (the
 * aggregator triggering the Spanish translation pass, send-briefing triggering
 * its own ES pass). These previously authenticated with `x-vercel-cron: 1` and
 * would 401 silently once the bypass was removed.
 */
export function cronAuthHeaders(): Record<string, string> {
  return { Authorization: `Bearer ${process.env.CRON_SECRET ?? ""}` };
}
