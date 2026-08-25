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
 * One implementation on purpose: this invariant is enforced in thirteen
 * handlers, and thirteen copies is thirteen chances for one to drift back open.
 */
export function isCronAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

/**
 * Second, weaker credential: authorizes aggregator dry runs and nothing else.
 *
 * The two secrets are deliberately unequal in power:
 *
 *   CRON_SECRET   — full access. Authorizes every cron route, including the
 *                   aggregator's production path that writes issues/stories
 *                   and sends the briefing. Vercel cron holds this one.
 *   DRYRUN_SECRET — read-only in effect. Authorizes exactly one branch of one
 *                   route: `GET /api/aggregator?dry_run=1`, which reads the
 *                   pool, calls the model, and inserts into aggregator_drafts.
 *                   It can never reach a production write, because the only
 *                   caller that accepts it returns from the dry-run branch
 *                   before the production path is reachable.
 *
 * The split exists so a dry run can be triggered by hand from a laptop without
 * the cron credential ever leaving Vercel. A leaked DRYRUN_SECRET costs model
 * tokens and draft rows; it cannot publish an issue or mail subscribers.
 *
 * Fails closed the same way: unset or empty DRYRUN_SECRET denies every request
 * rather than comparing against the literal string "Bearer undefined".
 */
export function isDryRunAuthorized(req: NextRequest): boolean {
  const secret = process.env.DRYRUN_SECRET;
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
