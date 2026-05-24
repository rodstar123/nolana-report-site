import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Issue Archive | The Nolana Report",
  description:
    "Every weekly RGV business intelligence briefing — scored, sourced, and searchable.",
};

export const revalidate = 3600; // ISR: revalidate every hour

async function getIssues() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return [];

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const { data } = await supabase
    .from("issues")
    .select("id, slug, title, published_at, stories_count")
    .eq("is_published", true)
    .order("published_at", { ascending: false });

  return data ?? [];
}

export default async function IssuesPage() {
  const issues = await getIssues();

  return (
    <main
      className="min-h-screen py-24 px-4"
      style={{ background: "linear-gradient(to bottom, #f4f1ec, #e8e3db)" }}
    >
      <div className="max-w-4xl mx-auto">
        <div className="mb-10">
          <Link
            href="/"
            className="font-body text-sm text-teal hover:text-teal-light transition-colors"
          >
            ← The Nolana Report
          </Link>
        </div>

        <span className="section-label mb-4 block">Archive</span>
        <h1 className="font-display font-bold text-navy text-4xl mt-2 mb-3">
          Issue Archive
        </h1>
        <p className="font-editorial text-slate text-lg mb-12">
          Every Monday briefing, scored and sourced.
        </p>

        {issues.length === 0 ? (
          <div className="bg-warm-white border border-cream-dark rounded-xl p-12 text-center">
            <p className="font-body text-slate-light">
              First issue coming Monday. Subscribe to get it in your inbox.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {issues.map(
              (issue: {
                id: string;
                slug: string;
                title: string;
                published_at: string;
                stories_count: number;
              }) => (
                <Link
                  key={issue.id}
                  href={`/issues/${issue.slug}`}
                  className="block bg-warm-white border border-cream-dark rounded-xl p-6 hover:shadow-lg hover:-translate-y-0.5 hover:border-teal/20 transition-all duration-200"
                >
                  <h2 className="font-display font-bold text-charcoal text-xl mb-1">
                    {issue.title}
                  </h2>
                  <p className="font-body text-slate-light text-sm">
                    {new Date(issue.published_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                    {issue.stories_count > 0 &&
                      ` · ${issue.stories_count} stories scored`}
                  </p>
                </Link>
              ),
            )}
          </div>
        )}
      </div>
    </main>
  );
}
