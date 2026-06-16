import { createClient } from "@supabase/supabase-js";
import { getTranslations, getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import ScoreBadge from "./ScoreBadge";

interface SignalRow {
  headline: string;
  headline_es: string | null;
  nolana_score: number | null;
}

/**
 * "This Week's Money Signals" — compact proof strip directly below the hero CTA.
 * Surfaces the latest published issue's top NRI-scored stories above the fold so
 * cold visitors see live evidence of the "scored stories" promise. Secondary to
 * the email form: muted, no competing CTA. Renders nothing if no published issue.
 */
export default async function WeekSignals() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return null;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const { data: issue } = await supabase
    .from("issues")
    .select("id, slug")
    .eq("is_published", true)
    .order("published_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!issue) return null;

  const { data: stories } = await supabase
    .from("stories")
    .select("headline, headline_es, nolana_score")
    .eq("issue_id", issue.id)
    .order("nolana_score", { ascending: false, nullsFirst: false })
    .limit(4);

  const rows = ((stories ?? []) as SignalRow[]).filter(
    (s) => s.nolana_score != null,
  );
  if (rows.length === 0) return null;

  const locale = await getLocale();
  const isEs = locale === "es";
  const t = await getTranslations("moneySignals");
  const issueHref = `/issues/${issue.slug}`;

  return (
    <section
      aria-label={t("label")}
      className="relative py-7 md:py-9 border-b border-teal/10"
      style={{
        background: "linear-gradient(to bottom, #0B1428 0%, #0a1628 100%)",
      }}
    >
      <div className="max-w-2xl mx-auto px-6 lg:px-8">
        <p
          className="font-body text-[11px] uppercase tracking-[0.16em] font-semibold mb-4 text-center"
          style={{ color: "#2A9D8F" }}
        >
          {t("label")}
        </p>
        <ul className="space-y-1.5">
          {rows.map((s, i) => {
            const headline = isEs && s.headline_es ? s.headline_es : s.headline;
            return (
              <li key={i}>
                <Link
                  href={issueHref}
                  className="group flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-white/5"
                >
                  <ScoreBadge score={s.nolana_score as number} size={34} />
                  <span className="min-w-0 flex-1 font-body text-sm text-slate-light group-hover:text-warm-white transition-colors truncate">
                    {headline}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
        <div className="text-center mt-4">
          <Link
            href={issueHref}
            className="font-body text-xs text-teal-light/70 hover:text-teal-light underline underline-offset-2 transition-colors"
          >
            {t("viewIssue")}
          </Link>
        </div>
      </div>
    </section>
  );
}
