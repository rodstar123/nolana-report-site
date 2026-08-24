import { Agent } from "undici";

/**
 * undici's default headersTimeout and bodyTimeout are 300s. A long aggregator
 * generation (max_tokens 40000, effort high, non-streaming) runs past that, so
 * the socket was being torn down mid-generation — a transport abort, not an API
 * error, which is why it surfaced as a bare fetch failure with no status code.
 *
 * 780s sits just under the aggregator route's maxDuration of 800s (declared in
 * both app/api/aggregator/route.ts and vercel.json), so a genuinely stuck call
 * still aborts inside the function and returns a real error instead of being
 * killed by the platform. Keep this in step with that ceiling.
 */
export const ANTHROPIC_TIMEOUT_MS = 780_000;

/**
 * Module-scoped so warm invocations reuse the connection pool. Constructing it
 * opens no sockets — the first dispatch does.
 */
export const anthropicDispatcher = new Agent({
  headersTimeout: ANTHROPIC_TIMEOUT_MS,
  bodyTimeout: ANTHROPIC_TIMEOUT_MS,
});
