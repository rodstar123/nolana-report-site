import { createClient } from "@supabase/supabase-js";
import { getSubscriber } from "@/lib/get-subscriber";
import { notFound } from "next/navigation";
import Link from "next/link";
import { StoryCard, type StoryData } from "@/components/StoryCard";
import { UpgradeBanner } from "@/components/UpgradeBanner";
import { IssueFooter } from "@/components/IssueFooter";
import NRIHeatmap from "@/components/NRIHeatmap";
import ReadersPickVote from "@/components/ReadersPickVote";
import { TrackBriefingView } from "@/components/TrackBriefingView";

export const revalidate = 3600;

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

function parseTemperature(md: string) {
  const lines = md.split("\n");
  const label = (lines[0] || "")
    .replace(/^##\s*This Week's Business Temperature:\s*/, "")
    .trim();
  const body = lines.slice(1).join("\n").trim();
  const moveMatch = body.match(/\*\*The move:\*\*\s*(.+)/);
  return {
    label,
    content: body.replace(/\*\*The move:\*\*.+/, "").trim(),
    move: moveMatch ? moveMatch[1].trim() : null,
  };
}

function parseMoneyMap(md: string) {
  const lines = md.split("\n").filter((l) => l.trim().startsWith("|"));
  if (lines.length < 3) return null;
  const parseRow = (line: string) =>
    line
      .split("|")
      .slice(1, -1)
      .map((c) => c.trim());
  return { headers: parseRow(lines[0]), rows: lines.slice(2).map(parseRow) };
}

function parseMoves(md: string) {
  return md
    .split("\n")
    .filter((l) => /^\d+\./.test(l.trim()))
    .map((l) => l.replace(/^\d+\.\s*/, "").trim());
}

export async function generateStaticParams() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return [];
  const supabase = getSupabase();
  const { data } = await supabase
    .from("issues")
    .select("slug")
    .eq("is_published", true);
  return (data ?? []).map((issue: { slug: string }) => ({ slug: issue.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return {};
  const supabase = getSupabase();
  const { data: issue } = await supabase
    .from("issues")
    .select("title")
    .eq("slug", params.slug)
    .single();

  if (!issue) return {};
  return {
    title: `${issue.title} | The Nolana Report`,
    description: `RGV business intelligence briefing — ${issue.title}. Business openings, permits, trade signals, and investment stories scored and summarized.`,
  };
}

export default async function IssuePage({
  params,
}: {
  params: { slug: string };
}) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) notFound();

  const supabase = getSupabase();
  let subscriber: Awaited<ReturnType<typeof getSubscriber>> = null;
  try {
    subscriber = await getSubscriber();
  } catch {
    // Auth failure must never crash the page — render as free tier
  }
  const canSeePro = subscriber?.tier === "pro" || subscriber?.tier === "intel";

  const { data: issue } = await supabase
    .from("issues")
    .select("*")
    .eq("slug", params.slug)
    .eq("is_published", true)
    .single();

  if (!issue) notFound();

  const { data: stories } = await supabase
    .from("stories")
    .select("*")
    .eq("issue_id", issue.id)
    .order("position", { ascending: true });

  const allStories = (stories ?? []) as StoryData[];
  const freeStories = allStories.filter((s) => s.is_free);
  const proStories = allStories.filter((s) => !s.is_free);

  const readingTime = Math.max(
    3,
    Math.ceil(
      allStories.reduce((sum, s) => {
        const text = `${s.headline} ${s.summary} ${s.why_it_matters ?? ""}`;
        return sum + text.split(/\s+/).length;
      }, 0) / 250,
    ),
  );

  const nriScores = allStories
    .map((s) => s.nolana_score)
    .filter((s): s is number => s !== null);

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const iss = issue as any;
  const tempData = iss.business_temperature
    ? parseTemperature(iss.business_temperature)
    : null;
  const moneyMapData = iss.valley_money_map
    ? parseMoneyMap(iss.valley_money_map)
    : null;
  const movesData = iss.three_moves ? parseMoves(iss.three_moves) : null;
  const quietSignalText = iss.quiet_signal
    ? (iss.quiet_signal as string)
        .replace(/^##\s*The Quiet Signal\s*\n?/, "")
        .trim() || null
    : null;
  /* eslint-enable @typescript-eslint/no-explicit-any */

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `The Nolana Report — ${issue.title}`,
    datePublished: issue.published_at,
    publisher: {
      "@type": "Organization",
      name: "The Nolana Report",
      url: "https://nolanareport.com",
    },
    description: `${issue.stories_count} stories scored this week.`,
    isAccessibleForFree: false,
    hasPart: proStories.map(() => ({
      "@type": "WebPageElement",
      isAccessibleForFree: false,
      cssSelector: ".pro-story",
    })),
  };

  return (
    <main className="min-h-screen py-24 px-4 bg-cream dark:bg-dark-bg transition-colors duration-300">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <TrackBriefingView
        issueSlug={issue.slug}
        issueTitle={issue.title}
        tier={subscriber?.tier}
      />

      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex items-center gap-4">
          <Link
            href="/issues"
            className="font-body text-sm text-teal hover:text-teal-light dark:text-teal-light dark:hover:text-teal transition-colors"
          >
            ← All Issues
          </Link>
        </div>

        <span className="section-label mb-4 block">
          Week of{" "}
          {new Date(issue.published_at).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </span>
        <h1 className="font-display font-bold text-navy dark:text-dark-text text-4xl mt-2 mb-2">
          {issue.title}
        </h1>
        <p className="font-body text-slate-light dark:text-dark-muted text-sm mb-8">
          {issue.stories_count} stories scored
          {canSeePro ? " · Full access" : " · 5 free stories"}
          {" · ~"}
          {readingTime} min read
        </p>

        {issue.opening && (
          <div className="mb-12 pb-10 border-b border-cream-dark dark:border-dark-border space-y-4">
            {issue.opening
              .split("\n\n")
              .filter(Boolean)
              .map((para: string, i: number) => (
                <p
                  key={i}
                  className="font-editorial text-[19px] leading-[1.85] text-charcoal dark:text-dark-text prose-nolana"
                >
                  {para.trim()}
                </p>
              ))}
          </div>
        )}

        {/* Business Temperature — free */}
        {tempData && (
          <div className="mb-10 p-6 bg-gradient-to-br from-teal/5 to-gold/5 dark:from-teal/10 dark:to-gold/10 border border-teal/20 dark:border-teal/30 rounded-xl">
            <h2 className="font-display font-bold text-navy dark:text-dark-text text-xl mb-3">
              This Week&rsquo;s Business Temperature:{" "}
              <span className="text-teal dark:text-teal-light">
                {tempData.label}
              </span>
            </h2>
            {tempData.content
              .split("\n\n")
              .filter(Boolean)
              .map((p: string, i: number) => (
                <p
                  key={i}
                  className="font-editorial text-[17px] text-slate dark:text-dark-muted leading-relaxed mb-3"
                >
                  {p.trim()}
                </p>
              ))}
            {tempData.move && (
              <p className="font-body text-[15px] text-teal dark:text-teal-light font-semibold mt-4 pt-4 border-t border-teal/20">
                The move: {tempData.move}
              </p>
            )}
          </div>
        )}

        {/* NRI Heatmap — score distribution */}
        {nriScores.length > 0 && (
          <div className="mb-10 p-5 bg-warm-white dark:bg-dark-card border border-cream-dark dark:border-dark-border rounded-xl">
            <p className="font-body text-xs text-slate-light dark:text-dark-dim uppercase tracking-wide font-semibold mb-3">
              Score Distribution
            </p>
            <NRIHeatmap scores={nriScores} />
          </div>
        )}

        {/* Free stories */}
        <h2 className="font-display font-bold text-navy dark:text-dark-text text-2xl mb-6">
          Top Stories This Week
        </h2>
        <div className="space-y-4 mb-8">
          {freeStories.map((story) => (
            <StoryCard key={story.id} story={story} issueSlug={issue.slug} />
          ))}
        </div>

        {/* Upgrade banner */}
        {!canSeePro && proStories.length > 0 && (
          <UpgradeBanner
            remaining={proStories.length}
            total={allStories.length}
            email={subscriber?.email}
          />
        )}

        {/* Pro stories */}
        {canSeePro && proStories.length > 0 && (
          <>
            <h2 className="font-display font-bold text-navy dark:text-dark-text text-2xl mb-6 mt-12">
              Full Briefing
            </h2>
            <div className="space-y-4">
              {proStories.map((story) => (
                <div key={story.id} className="pro-story">
                  <StoryCard story={story} issueSlug={issue.slug} />
                </div>
              ))}
            </div>
          </>
        )}

        {/* Locked preview for free users */}
        {!canSeePro && proStories.length > 0 && (
          <div className="mt-4 space-y-4 pointer-events-none select-none opacity-40">
            {proStories.slice(0, 2).map((story) => (
              <div key={story.id} className="pro-story">
                <StoryCard story={story} locked />
              </div>
            ))}
          </div>
        )}

        {/* Valley Money Map — pro only */}
        {canSeePro && moneyMapData && (
          <div className="mt-12 mb-8 bg-warm-white dark:bg-dark-card border border-cream-dark dark:border-dark-border rounded-xl p-7">
            <h2 className="font-display font-bold text-navy dark:text-dark-text text-xl mb-5">
              The Valley Money Map
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm font-body">
                <thead>
                  <tr className="border-b border-cream-dark dark:border-dark-border">
                    {moneyMapData.headers.map((h: string, i: number) => (
                      <th
                        key={i}
                        className="text-left py-2.5 px-3 text-slate-light dark:text-dark-dim font-semibold uppercase tracking-wide text-xs"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {moneyMapData.rows.map((row: string[], i: number) => (
                    <tr
                      key={i}
                      className="border-b border-cream-dark/50 dark:border-dark-border/50 last:border-0"
                    >
                      {row.map((cell: string, j: number) => (
                        <td
                          key={j}
                          className="py-2.5 px-3 text-charcoal dark:text-dark-text"
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3 Moves This Week — pro only */}
        {canSeePro && movesData && movesData.length > 0 && (
          <div className="mb-8 bg-warm-white dark:bg-dark-card border border-cream-dark dark:border-dark-border rounded-xl p-7">
            <h2 className="font-display font-bold text-navy dark:text-dark-text text-xl mb-5">
              3 Moves This Week
            </h2>
            <ol className="space-y-4">
              {movesData.map((move: string, i: number) => {
                const boldMatch = move.match(/^\*\*(.+?)\*\*\s*(.*)/);
                return (
                  <li
                    key={i}
                    className="font-editorial text-[17px] text-charcoal dark:text-dark-text leading-relaxed pl-2"
                  >
                    <span className="font-mono text-sm text-teal dark:text-teal-light font-bold mr-2">
                      {i + 1}.
                    </span>
                    {boldMatch ? (
                      <>
                        <strong className="font-body font-semibold text-navy dark:text-dark-text">
                          {boldMatch[1]}
                        </strong>{" "}
                        {boldMatch[2]}
                      </>
                    ) : (
                      move
                    )}
                  </li>
                );
              })}
            </ol>
          </div>
        )}

        {/* The Quiet Signal — free */}
        {quietSignalText && (
          <div className="mt-12 mb-8 p-6 bg-navy/[0.03] dark:bg-dark-card border-l-4 border-gold dark:border-gold/70 rounded-r-xl">
            <h2 className="font-display font-bold text-navy dark:text-dark-text text-xl mb-3">
              The Quiet Signal
            </h2>
            {quietSignalText
              .split("\n\n")
              .filter(Boolean)
              .map((p: string, i: number) => (
                <p
                  key={i}
                  className="font-editorial text-[17px] text-slate dark:text-dark-muted leading-relaxed mb-3 last:mb-0"
                >
                  {p.trim()}
                </p>
              ))}
          </div>
        )}

        {/* Reader's Pick vote */}
        <ReadersPickVote
          issueSlug={issue.slug}
          stories={allStories.map((s) => ({
            id: s.id,
            headline: s.headline,
            is_free: s.is_free,
          }))}
          canSeePro={canSeePro}
        />

        {/* Bottom conversion / actions footer */}
        {canSeePro ? (
          <IssueFooter
            variant="pro"
            issueUrl={`https://nolanareport.com/issues/${issue.slug}`}
          />
        ) : (
          <IssueFooter
            variant="free"
            freeCount={freeStories.length}
            totalCount={allStories.length}
          />
        )}
      </div>
    </main>
  );
}
