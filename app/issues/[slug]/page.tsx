import { createClient } from "@supabase/supabase-js";
import { getSubscriber } from "@/lib/get-subscriber";
import { notFound } from "next/navigation";
import Link from "next/link";
import { StoryCard, type StoryData } from "@/components/StoryCard";
import { UpgradeBanner } from "@/components/UpgradeBanner";
import { IssueFooter } from "@/components/IssueFooter";
import NRIHeatmap from "@/components/NRIHeatmap";
import ReadersPickVote from "@/components/ReadersPickVote";

export const revalidate = 3600;

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
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
