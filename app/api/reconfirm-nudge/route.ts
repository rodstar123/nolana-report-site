import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { createClient } from "@supabase/supabase-js";
import { sendReconfirmNudge } from "@/lib/email/reconfirm-nudge";

export const maxDuration = 120;

type EligibleRow = {
  id: string;
  email: string;
  name: string | null;
  language_preference: string | null;
  verification_token: string | null;
};

function firstNameOf(name: string | null): string | null {
  if (!name) return null;
  const f = name.trim().split(/\s+/)[0];
  return f || null;
}

function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return "***";
  const head = local.slice(0, 2);
  return `${head}${"*".repeat(Math.max(1, local.length - 2))}@${domain}`;
}

export async function GET(req: NextRequest) {
  // Cron-protected — same pattern as /api/aggregator.
  const authHeader = req.headers.get("authorization");
  const cronHeader = req.headers.get("x-vercel-cron");
  const isAuthorized =
    authHeader === `Bearer ${process.env.CRON_SECRET}` || cronHeader === "1";
  if (!isAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dryRun = req.nextUrl.searchParams.get("dry_run") === "1";

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  // Scanner / hosting domains that signed up but aren't real leads. Excluded
  // from the nudge so we never email infrastructure addresses.
  const EXCLUDED_DOMAINS = ["serverius.net"];

  // Eligibility: unconfirmed, not unsubscribed, signed up within 45 days,
  // and never nudged before (idempotency guard).
  let query = supabase
    .from("subscribers")
    .select("id, email, name, language_preference, verification_token")
    .eq("email_verified", false)
    .eq("unsubscribed", false)
    .gt("created_at", new Date(Date.now() - 45 * 86400_000).toISOString())
    .is("reconfirm_nudge_sent_at", null);
  for (const domain of EXCLUDED_DOMAINS) {
    query = query.not("email", "ilike", `%@${domain}`);
  }
  const { data: rows, error: selErr } = await query;

  if (selErr) {
    return NextResponse.json({ error: selErr.message }, { status: 500 });
  }

  const eligible = (rows ?? []) as EligibleRow[];
  const errors: string[] = [];
  let sent_count = 0;
  let en_count = 0;
  let es_count = 0;

  for (const row of eligible) {
    const language = row.language_preference === "es" ? "es" : "en";

    if (dryRun) {
      // Selects + logs only. Sends NOTHING, stamps NOTHING.
      console.log(
        `[reconfirm-nudge:dry_run] ${maskEmail(row.email)} lang=${language}`,
      );
      if (language === "es") es_count++;
      else en_count++;
      continue;
    }

    try {
      // Ensure a valid confirmation token exists (1 eligible row has none).
      // Reuse the existing token when present; otherwise mint one and persist
      // it so /api/verify-email accepts the click.
      let token = row.verification_token;
      if (!token) {
        token = randomBytes(32).toString("hex");
        const { error: tokErr } = await supabase
          .from("subscribers")
          .update({ verification_token: token })
          .eq("id", row.id);
        if (tokErr) throw new Error(`token persist failed: ${tokErr.message}`);
      }

      await sendReconfirmNudge(
        row.email,
        token,
        language,
        firstNameOf(row.name),
      );

      // Stamp AFTER send succeeds so a failed send stays eligible for a retry,
      // and a successful send can never re-fire.
      const { error: stampErr } = await supabase
        .from("subscribers")
        .update({ reconfirm_nudge_sent_at: new Date().toISOString() })
        .eq("id", row.id);
      if (stampErr) throw new Error(`stamp failed: ${stampErr.message}`);

      sent_count++;
      if (language === "es") es_count++;
      else en_count++;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "unknown error";
      errors.push(`${maskEmail(row.email)}: ${msg}`);
      console.error(`[reconfirm-nudge] ${maskEmail(row.email)} failed:`, msg);
    }
  }

  return NextResponse.json({
    dry_run: dryRun,
    eligible_count: eligible.length,
    sent_count,
    en_count,
    es_count,
    errors,
  });
}
