import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nolana Report Archive — RGV Business Intelligence",
  description:
    "Every weekly RGV business intelligence briefing — scored, sourced, and searchable. The Nolana Report archives by National Bookkeeping Company.",
  openGraph: {
    title: "Nolana Report Archive — RGV Business Intelligence",
    description:
      "Every weekly RGV business intelligence briefing — scored, sourced, and searchable.",
    url: "https://nolanareport.com/issues",
    siteName: "The Nolana Report",
    images: [
      {
        url: "https://nolanareport.com/images/og-social-card.png",
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Nolana Report Archive — RGV Business Intelligence",
    description:
      "Every weekly RGV business intelligence briefing — scored, sourced, and searchable.",
  },
};

export const revalidate = 3600;

interface IssueRow {
  id: string;
  slug: string;
  title: string;
  published_at: string;
  stories_count: number;
  business_temperature: string | null;
  nri_sub_growth: number | null;
  nri_sub_development: number | null;
  nri_sub_policy: number | null;
  nri_sub_trade: number | null;
}

async function getIssues(): Promise<IssueRow[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return [];

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const { data } = await supabase
    .from("issues")
    .select(
      "id, slug, title, published_at, stories_count, business_temperature, nri_sub_growth, nri_sub_development, nri_sub_policy, nri_sub_trade",
    )
    .eq("is_published", true)
    .order("published_at", { ascending: false });

  return (data ?? []) as IssueRow[];
}

function extractTempLabel(md: string): string | null {
  const match = md.match(/^##\s*This Week's Business Temperature:\s*(.+)/m);
  return match ? match[1].trim() : null;
}

function getNRIRange(issue: IssueRow): string | null {
  const subs = [
    issue.nri_sub_growth,
    issue.nri_sub_development,
    issue.nri_sub_policy,
    issue.nri_sub_trade,
  ].filter((v): v is number => v !== null && v !== undefined);
  if (subs.length === 0) return null;
  return `${Math.min(...subs)}–${Math.max(...subs)}`;
}

const ITEMS_PER_PAGE = 12;

export default async function IssuesPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const issues = await getIssues();
  const currentPage = Math.max(1, parseInt(searchParams.page ?? "1", 10) || 1);
  const totalPages = Math.ceil(issues.length / ITEMS_PER_PAGE);
  const pageIssues = issues.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  return (
    <main className="min-h-screen py-24 px-4 bg-cream dark:bg-dark-bg transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        <div className="mb-10">
          <Link
            href="/"
            className="font-body text-sm text-teal hover:text-teal-light dark:text-teal-light dark:hover:text-teal transition-colors"
          >
            &larr; The Nolana Report
          </Link>
        </div>

        <span className="section-label mb-4 block">Archive</span>
        <h1 className="font-display font-bold text-navy dark:text-dark-text text-4xl mt-2 mb-3">
          The Nolana Report Archive
        </h1>
        <p className="font-editorial text-slate dark:text-dark-muted text-lg mb-12">
          Every Monday briefing, scored and sourced.
        </p>

        {issues.length === 0 ? (
          <div className="bg-warm-white dark:bg-dark-card border border-cream-dark dark:border-dark-border rounded-xl p-12 text-center">
            <p className="font-body text-slate-light dark:text-dark-dim">
              First issue coming Monday. Subscribe to get it in your inbox.
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {pageIssues.map((issue) => {
                const tempLabel = issue.business_temperature
                  ? extractTempLabel(issue.business_temperature)
                  : null;
                const nriRange = getNRIRange(issue);
                const readTime = Math.max(
                  3,
                  Math.ceil((issue.stories_count * 80) / 250),
                );

                return (
                  <Link
                    key={issue.id}
                    href={`/issues/${issue.slug}`}
                    className="block bg-warm-white dark:bg-dark-card border border-cream-dark dark:border-dark-border rounded-xl p-6 hover:shadow-lg hover:-translate-y-0.5 hover:border-teal/20 dark:hover:border-teal/30 transition-all duration-200"
                  >
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h2 className="font-display font-bold text-charcoal dark:text-dark-text text-xl">
                        {issue.title}
                      </h2>
                      {tempLabel && (
                        <span className="flex-shrink-0 inline-flex items-center bg-teal/8 dark:bg-teal/15 border border-teal/15 dark:border-teal/25 rounded-full px-3 py-1">
                          <span className="font-body text-teal dark:text-teal-light text-xs font-semibold whitespace-nowrap">
                            {tempLabel}
                          </span>
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mt-3">
                      <span className="font-body text-slate-light dark:text-dark-dim text-sm">
                        {new Date(issue.published_at).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          },
                        )}
                      </span>
                      {issue.stories_count > 0 && (
                        <>
                          <span className="text-slate-light/40 dark:text-dark-dim/40">
                            &middot;
                          </span>
                          <span className="font-body text-slate-light dark:text-dark-dim text-sm">
                            {issue.stories_count} stories
                          </span>
                        </>
                      )}
                      {nriRange && (
                        <>
                          <span className="text-slate-light/40 dark:text-dark-dim/40">
                            &middot;
                          </span>
                          <span className="font-mono text-xs text-gold dark:text-gold">
                            NRI {nriRange}
                          </span>
                        </>
                      )}
                      {issue.stories_count > 0 && (
                        <>
                          <span className="text-slate-light/40 dark:text-dark-dim/40">
                            &middot;
                          </span>
                          <span className="font-body text-slate-light dark:text-dark-dim text-sm">
                            ~{readTime} min
                          </span>
                        </>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>

            {totalPages > 1 && (
              <nav
                className="mt-10 flex items-center justify-center gap-2"
                aria-label="Archive pagination"
              >
                {currentPage > 1 && (
                  <Link
                    href={`/issues?page=${currentPage - 1}`}
                    className="font-body text-sm font-semibold text-teal dark:text-teal-light hover:text-teal-light dark:hover:text-teal px-4 py-2 rounded-lg border border-teal/20 dark:border-teal/30 transition-colors"
                  >
                    &larr; Prev
                  </Link>
                )}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <Link
                      key={page}
                      href={`/issues?page=${page}`}
                      className={`font-body text-sm font-semibold px-3.5 py-2 rounded-lg transition-colors ${
                        page === currentPage
                          ? "bg-teal text-white"
                          : "text-slate-light dark:text-dark-dim hover:bg-teal/10 dark:hover:bg-teal/15"
                      }`}
                    >
                      {page}
                    </Link>
                  ),
                )}
                {currentPage < totalPages && (
                  <Link
                    href={`/issues?page=${currentPage + 1}`}
                    className="font-body text-sm font-semibold text-teal dark:text-teal-light hover:text-teal-light dark:hover:text-teal px-4 py-2 rounded-lg border border-teal/20 dark:border-teal/30 transition-colors"
                  >
                    Next &rarr;
                  </Link>
                )}
              </nav>
            )}
          </>
        )}
      </div>
    </main>
  );
}
