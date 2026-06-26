import { createClient } from "@supabase/supabase-js";

export function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isBotEmail(email: string): boolean {
  const local = email.split("@")[0];
  if (/\.{2,}/.test(local)) return true;
  const dots = (local.match(/\./g) ?? []).length;
  if (dots >= 4) return true;
  if (/\.\d+$/.test(local)) return true;
  const segments = local.split(".");
  const singleCharSegments = segments.filter((s) => s.length === 1).length;
  if (singleCharSegments >= 3) return true;
  if (dots >= 3 && dots / local.length > 0.25) return true;
  return false;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function isBlockedDomain(
  email: string,
  supabase: any,
): Promise<boolean> {
  const domain = email.split("@")[1]?.toLowerCase();
  if (!domain) return true;
  if (domain.endsWith(".ru")) return true;
  const { data } = await supabase
    .from("blocked_domains")
    .select("domain")
    .eq("domain", domain)
    .single();
  return !!data;
}

const EXEMPT_DOMAINS = new Set([
  "gmail.com",
  "yahoo.com",
  "hotmail.com",
  "outlook.com",
  "icloud.com",
  "aol.com",
  "protonmail.com",
  "proton.me",
  "me.com",
  "live.com",
  "msn.com",
  "mail.com",
]);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function isDomainBurst(
  email: string,
  supabase: any,
): Promise<boolean> {
  const domain = email.split("@")[1]?.toLowerCase();
  if (!domain || EXEMPT_DOMAINS.has(domain)) return false;
  const cutoff = new Date(Date.now() - 86_400_000).toISOString();
  const { count } = await supabase
    .from("subscribers")
    .select("id", { count: "exact", head: true })
    .gte("created_at", cutoff)
    .like("email", `%@${domain}`);
  return (count ?? 0) >= 2;
}

export function getClientIp(req: Request): string {
  const headers = req.headers;
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    "unknown"
  );
}

// Supabase-backed rate limiting (survives cold starts)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function checkRateLimit(
  key: string,
  maxCount: number,
  windowMs: number,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
): Promise<boolean> {
  const now = new Date();
  const windowStart = new Date(now.getTime() - windowMs);

  const { data } = await supabase
    .from("signup_rate_limits")
    .select("count, window_start")
    .eq("key", key)
    .single();

  if (!data) {
    await supabase.from("signup_rate_limits").upsert({
      key,
      count: 1,
      window_start: now.toISOString(),
    });
    return false;
  }

  const entryStart = new Date(data.window_start);
  if (entryStart < windowStart) {
    await supabase
      .from("signup_rate_limits")
      .update({
        count: 1,
        window_start: now.toISOString(),
      })
      .eq("key", key);
    return false;
  }

  if (data.count >= maxCount) return true;

  await supabase
    .from("signup_rate_limits")
    .update({
      count: data.count + 1,
    })
    .eq("key", key);
  return false;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function logBlockedSignup(
  email: string,
  ip: string,
  reason: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
) {
  await supabase.from("blocked_signups").insert({ email, ip, reason }).single();
}

// Funnel observability: record silent-path exits (Turnstile fail, invalid
// email/payload, honeypot) that write no subscriber row. Never throws — a
// logging failure must not break a real signup.
export async function logSignupAttempt(
  email: string | null,
  ip: string,
  reason: string,
  statusCode: number,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
) {
  try {
    await supabase
      .from("signup_attempts")
      .insert({ email, ip, reason, status_code: statusCode });
  } catch (e) {
    console.error("[signup] logSignupAttempt failed:", e);
  }
}
