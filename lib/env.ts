import { z } from "zod";

/**
 * Validated server environment for the Nolana pipeline.
 *
 * Import `serverEnv()` in API routes instead of reading `process.env` directly.
 * The first call validates every required variable and throws a single, clear
 * error listing everything missing/malformed. Result is memoized, so subsequent
 * calls are free.
 *
 * Lazy on purpose: validating at module load would break `next build` in
 * environments without the secrets. Calling it inside a route handler fails
 * fast at invocation (server-only) with a precise message — and never ships
 * SUPABASE_SERVICE_ROLE_KEY into a client bundle.
 */
const schema = z.object({
  // --- Core: Supabase ---
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),

  // --- Core: cron auth + LLM ---
  CRON_SECRET: z.string().min(1),
  ANTHROPIC_API_KEY: z.string().startsWith("sk-ant-"),

  // --- Core: alerts (non-negotiable — see error-resilience skill) ---
  TELEGRAM_NOLANA_BOT_TOKEN: z.string().min(1),
  NOE_TELEGRAM_CHAT_ID: z.string().min(1),
  TELEGRAM_NOLANA_CHANNEL_ID: z.string().min(1),

  // --- Core: email delivery ---
  RESEND_API_KEY: z.string().startsWith("re_"),
  RESEND_FROM: z.string().email().default("nolana@mail.nationalboco.com"),

  // --- Scoring config ---
  DAILY_TOKEN_CAP: z.coerce.number().int().positive().default(250_000),

  // --- Optional: full-text scrapers (pipeline degrades to snippet if absent) ---
  FIRECRAWL_API_KEY: z.string().optional(),
  BRIGHT_DATA_API_KEY: z.string().optional(),

  // --- Optional: legacy Notion (removed after Phase 7 cutover) ---
  NOTION_RGV_RAW_DB_ID: z.string().optional(),
  NOTION_RGV_HEALTH_DB_ID: z.string().optional(),
  NOTION_RGV_BRIEFINGS_PARENT_ID: z.string().optional(),

  // --- Optional: billing (Stripe) ---
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),

  // --- Optional: anti-bot ---
  TURNSTILE_SECRET_KEY: z.string().optional(),
});

export type ServerEnv = z.infer<typeof schema>;

let cached: ServerEnv | null = null;

export function serverEnv(): ServerEnv {
  if (cached) return cached;
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `  - ${i.path.join(".") || "(root)"}: ${i.message}`)
      .join("\n");
    throw new Error(
      `[env] Invalid or missing environment variables:\n${issues}\n` +
        `Set them in Vercel (printf … | vercel env add) or .env.local.`,
    );
  }
  cached = parsed.data;
  return cached;
}
