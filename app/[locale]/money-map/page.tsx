import { createClient } from "@supabase/supabase-js";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Metadata } from "next";
import MoneyMapTable from "@/components/MoneyMapTable";

export const metadata: Metadata = {
  title: "Valley Money Map — The Nolana Report",
  description:
    "Interactive map of where money is moving in the Rio Grande Valley. Signals, sectors, and who wins — updated every Monday.",
  openGraph: {
    title: "Valley Money Map — The Nolana Report",
    description:
      "Interactive map of where money is moving in the Rio Grande Valley.",
    url: "https://nolanareport.com/money-map",
    siteName: "The Nolana Report",
    images: [
      {
        url: "https://nolanareport.com/images/og-social-card.png",
        width: 1200,
        height: 630,
      },
    ],
  },
};

export const revalidate = 3600;

function parseMoneyMap(md: string) {
  const lines = md.split("\n").filter((l) => l.trim().startsWith("|"));
  if (lines.length < 3) return null;
  const parseRow = (line: string) =>
    line
      .split("|")
      .slice(1, -1)
      .map((c) => c.trim());
  const headers = parseRow(lines[0]);
  const colCount = headers.length;
  const rows = lines.slice(2).map((line) => {
    const cells = parseRow(line);
    if (cells.length <= colCount) return cells;
    return [
      ...cells.slice(0, colCount - 1),
      cells.slice(colCount - 1).join(", "),
    ];
  });
  return { headers, rows };
}

async function getLatestMoneyMap() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return null;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const { data: issue } = await supabase
    .from("issues")
    .select("id, slug, title, published_at, valley_money_map")
    .eq("is_published", true)
    .not("valley_money_map", "is", null)
    .order("published_at", { ascending: false })
    .limit(1)
    .single();

  if (!issue || !issue.valley_money_map) return null;

  const { data: stories } = await supabase
    .from("stories")
    .select("headline, section, nolana_score")
    .eq("issue_id", issue.id)
    .order("position", { ascending: true });

  return {
    issue,
    mapData: parseMoneyMap(issue.valley_money_map),
    stories: (stories ?? []) as Array<{
      headline: string;
      section: string;
      nolana_score: number | null;
    }>,
  };
}

export default async function MoneyMapPage() {
  const result = await getLatestMoneyMap();
  const t = await getTranslations("moneyMap");

  return (
    <main className="min-h-screen py-24 px-4 bg-cream dark:bg-dark-bg transition-colors duration-300">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <Link
            href="/"
            className="font-body text-sm text-teal hover:text-teal-light dark:text-teal-light dark:hover:text-teal transition-colors"
          >
            {t("back")}
          </Link>
        </div>

        <div className="flex items-center gap-3 mb-4">
          <span className="section-label">{t("label")}</span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-body font-bold uppercase tracking-wide bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800/30">
            {t("preview")}
          </span>
        </div>
        <h1 className="font-display font-bold text-navy dark:text-dark-text text-4xl mt-2 mb-3">
          {t("title")}
        </h1>
        <p className="font-editorial text-slate dark:text-dark-muted text-lg mb-10 max-w-2xl">
          {t("subtitle")}
        </p>

        {!result || !result.mapData ? (
          <div className="bg-warm-white dark:bg-dark-card border border-cream-dark dark:border-dark-border rounded-xl p-12 text-center">
            <svg
              className="w-12 h-12 text-gold/40 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="font-body text-slate-light dark:text-dark-dim text-base">
              {t("emptyState")}
            </p>
            <Link
              href="/"
              className="inline-block mt-6 font-body text-sm font-semibold text-teal dark:text-teal-light hover:text-teal-light dark:hover:text-teal border border-teal/20 dark:border-teal/30 px-5 py-2.5 rounded-lg transition-colors"
            >
              {t("subscribeCTA")}
            </Link>
          </div>
        ) : (
          <>
            <MoneyMapTable
              headers={result.mapData.headers}
              rows={result.mapData.rows}
              stories={result.stories}
              issueDate={new Date(result.issue.published_at).toLocaleDateString(
                "en-US",
                {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                },
              )}
              issueSlug={result.issue.slug}
            />

            <div className="mt-12 bg-warm-white dark:bg-dark-card border border-cream-dark dark:border-dark-border rounded-xl p-8 text-center">
              <h2 className="font-display font-bold text-navy dark:text-dark-text text-xl mb-3">
                {t("fullMapHeading")}
              </h2>
              <p className="font-editorial text-slate dark:text-dark-muted text-base mb-6 max-w-lg mx-auto leading-relaxed">
                {t("fullMapBody")}
              </p>
              <Link
                href="/login"
                className="inline-flex items-center font-body text-sm font-bold text-warm-white bg-teal hover:bg-teal-light dark:bg-teal dark:hover:bg-teal-light px-6 py-3 rounded-lg transition-colors"
              >
                {t("unlockPro")}
              </Link>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
