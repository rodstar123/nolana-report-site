import { createClient } from "@supabase/supabase-js";
import { getSubscriber } from "@/lib/get-subscriber";
import { notFound } from "next/navigation";
import Link from "next/link";
import { StoryCard, type StoryData } from "@/components/StoryCard";
import { UpgradeBanner } from "@/components/UpgradeBanner";
import { IssueFooter } from "@/components/IssueFooter";
import NRIHeatmap from "@/components/NRIHeatmap";
import NRITooltip from "@/components/NRITooltip";
import { TrackBriefingView } from "@/components/TrackBriefingView";
import ReadersPickVote from "@/components/ReadersPickVote";
import WhoShouldRead from "@/components/WhoShouldRead";
import { OwnersMove } from "@/components/OwnersMove";
import { RiskRadar } from "@/components/RiskRadar";
import { ThinkingQuestion } from "@/components/ThinkingQuestion";
import { BeforeYouGo } from "@/components/BeforeYouGo";
import { ThreeMovesSection } from "@/components/ThreeMovesSection";
import NRILegend from "@/components/NRILegend";
import BreatherBlock, { type BreatherData } from "@/components/BreatherBlock";

export const revalidate = 3600;

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

function parseTemperature(md: string) {
  const cutoff = md.search(/\n---|\n###/);
  const safe = cutoff > 0 ? md.slice(0, cutoff) : md;
  const lines = safe.split("\n");
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

function parseMoves(md: string) {
  return md
    .split("\n")
    .filter((l) => /^\d+\./.test(l.trim()))
    .map((l) => l.replace(/^\d+\.\s*/, "").trim());
}

function extractOpening(text: string): string {
  const cut = text.search(/\n---|\n##/);
  const intro = cut > 0 ? text.slice(0, cut) : text;
  return intro.trim();
}

function stripMarkdown(text: string): string {
  return text.replace(/\*\*/g, "");
}

function renderMarkdownBold(text: string) {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
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
    .select("title, published_at, opening")
    .eq("slug", params.slug)
    .single();

  if (!issue) return {};

  const dateLabel = new Date(issue.published_at).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const title = `Week of ${dateLabel} — The Nolana Report | RGV Business Intelligence`;
  const rawDesc = issue.opening
    ? stripMarkdown(issue.opening).slice(0, 155).replace(/\n/g, " ").trim() +
      (issue.opening.length > 155 ? "..." : "")
    : `RGV business intelligence briefing — ${issue.title}. Business openings, permits, trade signals, and investment stories scored and summarized.`;
  const description = rawDesc;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://nolanareport.com/issues/${params.slug}`,
      siteName: "The Nolana Report",
      type: "article",
      publishedTime: issue.published_at,
      images: [
        {
          url: "https://nolanareport.com/images/og-social-card.png",
          width: 1200,
          height: 630,
          alt: `The Nolana Report — ${issue.title}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
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
  const ownersMoveText = iss.owners_move ?? null;
  const riskRadarText = iss.risk_radar ?? null;
  const thinkingQuestionText = iss.thinking_question ?? null;
  const beforeYouGoText = iss.before_you_go ?? null;

  const rawBreathers: BreatherData[] = Array.isArray(iss.breathers)
    ? (iss.breathers as BreatherData[]).filter((b) => b && b.type && b.text)
    : [];

  const nudgeTemplates = [
    `Seeing something that affects your business? Pro members get the full ${allStories.length}-story breakdown → Unlock Pro`,
    "The stories behind the paywall scored higher. Just saying. → Unlock Pro",
    "Which story mattered most? Vote in Reader's Pick below ↓",
  ];

  function buildBreatherQueue(
    storyList: StoryData[],
    isFree: boolean,
  ): Map<number, BreatherData> {
    const queue = new Map<number, BreatherData>();
    const used = new Set<string>();
    const positions = isFree ? [2, 4] : [];
    if (!isFree) {
      for (let i = 3; i < storyList.length; i += 3) positions.push(i);
    }

    const aggByType = new Map<string, BreatherData>();
    for (const b of rawBreathers) aggByType.set(b.type, b);

    const prefOrder: string[][] = isFree
      ? [
          ["stat_callout", "pull_quote", "valley_vs_national"],
          ["quick_math", "progress_bar", "this_time_last_year"],
        ]
      : [
          ["stat_callout"],
          ["pull_quote"],
          ["quick_math"],
          ["this_time_last_year"],
          ["valley_vs_national"],
          ["forward_this"],
          ["nudge"],
          ["progress_bar"],
        ];

    for (let pi = 0; pi < positions.length; pi++) {
      const pos = positions[pi];
      const prefs = prefOrder[pi % prefOrder.length];
      let chosen: BreatherData | null = null;

      for (const pref of prefs) {
        if (used.has(pref)) continue;
        if (pref === "pull_quote") {
          const nearby = storyList
            .slice(Math.max(0, pos - 2), pos + 1)
            .filter((s) => s.nolana_take)
            .sort((a, b) => (b.nolana_score ?? 0) - (a.nolana_score ?? 0));
          if (nearby.length > 0) {
            chosen = { type: "pull_quote", text: nearby[0].nolana_take! };
            break;
          }
        } else if (pref === "nudge") {
          chosen = {
            type: "nudge",
            text: nudgeTemplates[pi % nudgeTemplates.length],
          };
          break;
        } else if (pref === "progress_bar") {
          chosen = {
            type: "progress_bar",
            text: "",
            readCount: pos,
            freeCount: isFree ? storyList.length : storyList.length,
            totalCount: allStories.length,
          };
          break;
        } else {
          const agg = aggByType.get(pref);
          if (agg) {
            chosen = agg;
            break;
          }
        }
      }

      if (!chosen) {
        const fallbacks = ["nudge", "progress_bar"];
        for (const fb of fallbacks) {
          if (used.has(fb)) continue;
          if (fb === "nudge") {
            chosen = {
              type: "nudge",
              text: nudgeTemplates[pi % nudgeTemplates.length],
            };
            break;
          }
          if (fb === "progress_bar") {
            chosen = {
              type: "progress_bar",
              text: "",
              readCount: pos,
              freeCount: storyList.length,
              totalCount: allStories.length,
            };
            break;
          }
        }
      }

      if (chosen) {
        queue.set(pos, chosen);
        used.add(chosen.type);
      }
    }
    return queue;
  }

  const freeBreathers = buildBreatherQueue(freeStories, true);
  const proBreathers = canSeePro
    ? buildBreatherQueue(proStories, false)
    : new Map<number, BreatherData>();

  const nriSubs = [
    { label: "Growth", value: iss.nri_sub_growth as number | null },
    { label: "Development", value: iss.nri_sub_development as number | null },
    { label: "Policy", value: iss.nri_sub_policy as number | null },
    { label: "Trade", value: iss.nri_sub_trade as number | null },
  ].filter((s) => s.value !== null && s.value !== undefined);
  /* eslint-enable @typescript-eslint/no-explicit-any */

  const dateLabel = new Date(issue.published_at).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const articleDescription = issue.opening
    ? stripMarkdown(issue.opening).slice(0, 155).replace(/\n/g, " ").trim()
    : `${issue.stories_count} stories scored this week.`;

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: `Week of ${dateLabel} — The Nolana Report`,
    datePublished: issue.published_at,
    dateModified: issue.updated_at ?? issue.published_at,
    author: {
      "@type": "Organization",
      name: "The Nolana Report",
    },
    publisher: {
      "@type": "Organization",
      name: "The Nolana Report",
      logo: {
        "@type": "ImageObject",
        url: "https://nolanareport.com/images/logo-nolana-report.png",
      },
    },
    description: articleDescription,
    inLanguage: "en",
    isAccessibleForFree: false,
    hasPart: {
      "@type": "WebPageElement",
      isAccessibleForFree: false,
      cssSelector: ".pro-story",
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://nolanareport.com/issues/${issue.slug}`,
    },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://nolanareport.com",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Archive",
        item: "https://nolanareport.com/issues",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: issue.title,
        item: `https://nolanareport.com/issues/${issue.slug}`,
      },
    ],
  };

  return (
    <main className="min-h-screen py-24 px-4 bg-cream dark:bg-dark-bg transition-colors duration-300">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
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
        <h1 className="font-display font-bold text-navy dark:text-dark-text text-4xl mt-2 mb-4">
          {issue.title}
        </h1>
        <div className="flex flex-wrap items-center gap-2 mb-8">
          <span className="inline-flex items-center gap-1.5 bg-teal/8 dark:bg-teal/15 border border-teal/15 dark:border-teal/25 rounded-full px-3 py-1">
            <svg
              className="w-3.5 h-3.5 text-teal dark:text-teal-light"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" strokeWidth={2} />
              <polyline
                points="12 6 12 12 16 14"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="font-body text-teal dark:text-teal-light text-xs font-semibold">
              ~{readingTime} min read
            </span>
          </span>
          <span className="inline-flex items-center gap-1.5 bg-slate-light/8 dark:bg-dark-dim/15 border border-slate-light/15 dark:border-dark-border rounded-full px-3 py-1">
            <span className="font-body text-slate dark:text-dark-muted text-xs font-semibold">
              {allStories.length} stories
            </span>
          </span>
          {nriScores.length > 0 && (
            <span className="inline-flex items-center gap-1.5 bg-gold/8 dark:bg-gold/15 border border-gold/15 dark:border-gold/25 rounded-full px-3 py-1">
              <NRITooltip>
                <span className="font-body text-gold dark:text-gold text-xs font-semibold">
                  NRI range {Math.min(...nriScores)}&ndash;
                  {Math.max(...nriScores)}
                </span>
              </NRITooltip>
            </span>
          )}
          <span className="font-body text-slate-light dark:text-dark-dim text-xs">
            {canSeePro ? "Full access" : `${freeStories.length} free stories`}
          </span>
        </div>

        {issue.opening && (
          <div className="mb-12 pb-10 border-b border-cream-dark dark:border-dark-border space-y-4">
            {extractOpening(issue.opening)
              .split("\n\n")
              .filter(Boolean)
              .map((para: string, i: number) => (
                <p
                  key={i}
                  className="font-editorial text-[17px] leading-[1.8] text-charcoal dark:text-dark-text prose-nolana"
                >
                  {renderMarkdownBold(para.trim())}
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
                  className="font-editorial text-[16px] text-slate dark:text-dark-muted leading-[1.75] mb-3"
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

        {/* Owner's Move of the Week — free */}
        {ownersMoveText && <OwnersMove markdown={ownersMoveText} />}

        {/* NRI Heatmap — score distribution */}
        {nriScores.length > 0 && (
          <div className="mb-10 p-5 bg-warm-white dark:bg-dark-card border border-cream-dark dark:border-dark-border rounded-xl">
            <div className="flex items-center gap-2 mb-3">
              <p className="font-body text-xs text-slate-light dark:text-dark-dim uppercase tracking-wide font-semibold">
                Score Distribution
              </p>
              <NRITooltip>
                <span className="sr-only">What is the NRI?</span>
              </NRITooltip>
            </div>
            <NRIHeatmap scores={nriScores} />
          </div>
        )}

        {/* NRI Sub-Scores — issue-level pulse */}
        {nriSubs.length > 0 && (
          <div className="mb-10 flex flex-wrap gap-3">
            {nriSubs.map((sub) => {
              const val = sub.value as number;
              const color =
                val >= 7
                  ? "bg-teal/15 text-teal dark:bg-teal/25 dark:text-teal-light border-teal/30"
                  : val >= 5
                    ? "bg-gold/15 text-gold-dark dark:bg-gold/25 dark:text-gold border-gold/30"
                    : "bg-slate-light/15 text-slate dark:bg-dark-dim/25 dark:text-dark-muted border-slate-light/30";
              return (
                <span
                  key={sub.label}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-[14px] font-body font-semibold ${color}`}
                >
                  {sub.label}
                  <span className="font-mono text-[14px] font-bold">
                    {val}/10
                  </span>
                </span>
              );
            })}
          </div>
        )}

        {/* NRI methodology legend — collapsible */}
        {nriScores.length > 0 && (
          <div className="mb-10">
            <NRILegend />
          </div>
        )}

        {/* Free stories with breathers */}
        <h2 className="font-display font-bold text-navy dark:text-dark-text text-2xl mb-6">
          Top Stories This Week
        </h2>
        <div className="space-y-4 mb-8">
          {freeStories.map((story, idx) => (
            <div key={story.id}>
              <StoryCard story={story} />
              {freeBreathers.has(idx + 1) && (
                <div className="my-4">
                  <BreatherBlock data={freeBreathers.get(idx + 1)!} />
                </div>
              )}
            </div>
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
              {proStories.map((story, idx) => (
                <div key={story.id} className="pro-story">
                  <StoryCard story={story} />
                  {proBreathers.has(idx + 1) && (
                    <div className="my-4">
                      <BreatherBlock data={proBreathers.get(idx + 1)!} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {/* Locked story previews for free users */}
        {!canSeePro && proStories.length > 0 && (
          <div className="mt-6 mb-8 p-6 bg-warm-white dark:bg-dark-card border border-cream-dark dark:border-dark-border rounded-xl">
            <p className="font-body text-sm text-slate-light dark:text-dark-dim font-semibold mb-4">
              {proStories.length} more{" "}
              {proStories.length === 1 ? "story" : "stories"} in the full
              briefing
            </p>
            <ul className="space-y-2">
              {proStories.map((story) => (
                <li key={story.id} className="flex items-center gap-3">
                  <svg
                    className="w-3 h-3 text-gold/60 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM12 17c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1s3.1 1.39 3.1 3.1v2z" />
                  </svg>
                  <span className="font-body text-sm text-charcoal dark:text-dark-text">
                    {story.headline}
                  </span>
                  {story.nolana_score && (
                    <span className="font-mono text-[11px] text-slate-light dark:text-dark-dim ml-auto flex-shrink-0">
                      NRI {story.nolana_score}/10
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Risk Radar — free */}
        {riskRadarText && <RiskRadar markdown={riskRadarText} />}

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

        {/* 3 Moves This Week — Move #1 free, #2-3 teased */}
        {movesData && movesData.length > 0 && (
          <ThreeMovesSection moves={movesData} canSeePro={canSeePro} />
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
                  className="font-editorial text-[16px] text-slate dark:text-dark-muted leading-[1.75] mb-3 last:mb-0"
                >
                  {p.trim()}
                </p>
              ))}
          </div>
        )}

        {/* The Thinking Question — free */}
        {thinkingQuestionText && (
          <ThinkingQuestion markdown={thinkingQuestionText} />
        )}

        {/* Reader's Pick */}
        <ReadersPickVote
          issueSlug={issue.slug}
          stories={allStories.map((s) => ({
            id: s.id,
            headline: s.headline,
            is_free: s.is_free,
          }))}
          canSeePro={canSeePro}
        />

        {/* Who Should Read This */}
        <WhoShouldRead
          stories={allStories.map((s) => ({
            headline: s.headline,
            summary: s.summary,
            section: s.section,
            why_it_matters: s.why_it_matters,
          }))}
        />

        {/* Before You Go — free */}
        {beforeYouGoText && <BeforeYouGo markdown={beforeYouGoText} />}

        {/* Bottom conversion / actions footer */}
        {canSeePro ? (
          <IssueFooter
            variant="pro"
            issueUrl={`https://nolanareport.com/issues/${issue.slug}`}
            referralCode={subscriber?.referral_code}
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
