"use client";
import { useState, useEffect, useCallback } from "react";

interface Story {
  id: string;
  headline: string;
  is_free: boolean;
}

interface Props {
  issueSlug: string;
  stories: Story[];
  canSeePro: boolean;
}

function getFingerprint(): string {
  try {
    let fp = localStorage.getItem("nri-fp");
    if (fp) return fp;
    fp = crypto.randomUUID();
    localStorage.setItem("nri-fp", fp);
    return fp;
  } catch {
    return crypto.randomUUID();
  }
}

export default function ReadersPickVote({
  issueSlug,
  stories,
  canSeePro,
}: Props) {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [myVote, setMyVote] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fp = getFingerprint();
    fetch(`/api/story-vote?issueSlug=${issueSlug}&fp=${fp}`)
      .then((r) => r.json())
      .then((data) => {
        setCounts(data.counts ?? {});
        setMyVote(data.myVote ?? null);
        setTotal(data.total ?? 0);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [issueSlug]);

  const vote = useCallback(
    async (storyId: string) => {
      if (submitting) return;
      setSubmitting(true);

      const oldVote = myVote;
      const oldCounts = { ...counts };
      const oldTotal = total;

      const newCounts = { ...counts };
      if (oldVote) {
        newCounts[oldVote] = Math.max(0, (newCounts[oldVote] ?? 0) - 1);
      }
      newCounts[storyId] = (newCounts[storyId] ?? 0) + 1;
      const newTotal = oldVote ? total : total + 1;

      setMyVote(storyId);
      setCounts(newCounts);
      setTotal(newTotal);

      try {
        await fetch("/api/story-vote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            issueSlug,
            storyId,
            fingerprint: getFingerprint(),
          }),
        });
      } catch {
        setMyVote(oldVote);
        setCounts(oldCounts);
        setTotal(oldTotal);
      } finally {
        setSubmitting(false);
      }
    },
    [issueSlug, myVote, counts, total, submitting],
  );

  const topStoryId =
    total > 0
      ? Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0]
      : null;

  const visibleStories = canSeePro ? stories : stories.filter((s) => s.is_free);
  const lockedStories = canSeePro ? [] : stories.filter((s) => !s.is_free);

  if (loading) {
    return (
      <div className="mt-12 mb-8 p-6 bg-warm-white dark:bg-dark-card border border-cream-dark dark:border-dark-border rounded-xl">
        <div className="animate-pulse space-y-3">
          <div className="h-5 bg-cream-dark dark:bg-dark-border rounded w-64" />
          <div className="h-4 bg-cream-dark dark:bg-dark-border rounded w-48" />
          <div className="space-y-2 mt-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-12 bg-cream-dark dark:bg-dark-border rounded-lg"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-12 mb-8 p-6 bg-warm-white dark:bg-dark-card border border-cream-dark dark:border-dark-border rounded-xl">
      <div className="flex items-center gap-2 mb-1">
        <svg
          className="w-5 h-5 text-gold"
          fill="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
        <h3 className="font-display font-bold text-navy dark:text-dark-text text-lg">
          Reader&apos;s Pick
        </h3>
      </div>
      <p className="font-body text-slate-light dark:text-dark-muted text-sm mb-5">
        Which story mattered most to you this week?
        {total > 0 && (
          <span className="ml-1 font-mono text-xs">
            ({total} vote{total !== 1 ? "s" : ""})
          </span>
        )}
      </p>

      <div className="space-y-2">
        {visibleStories.map((story) => {
          const voteCount = counts[story.id] ?? 0;
          const pct = total > 0 ? Math.round((voteCount / total) * 100) : 0;
          const isMyVote = myVote === story.id;
          const isTop = story.id === topStoryId && total > 0;

          return (
            <button
              key={story.id}
              type="button"
              onClick={() => vote(story.id)}
              disabled={submitting}
              className={`w-full text-left rounded-lg p-3.5 transition-all duration-200 relative overflow-hidden group ${
                isMyVote
                  ? "border-2 border-teal bg-teal/5 dark:bg-teal/10"
                  : "border border-cream-dark dark:border-dark-border hover:border-teal/40 dark:hover:border-teal/30 bg-cream/50 dark:bg-dark-bg/50"
              }`}
            >
              {myVote && (
                <div
                  className="absolute inset-y-0 left-0 bg-teal/8 dark:bg-teal/15 transition-all duration-500 rounded-lg"
                  style={{ width: `${pct}%` }}
                />
              )}
              <div className="relative flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-4.5 h-4.5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                      isMyVote
                        ? "border-teal bg-teal"
                        : "border-slate-light/40 dark:border-dark-dim/40 group-hover:border-teal/60"
                    }`}
                  >
                    {isMyVote && (
                      <svg
                        className="w-2.5 h-2.5 text-white"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={3}
                        viewBox="0 0 24 24"
                      >
                        <path d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span
                    className={`font-body text-sm leading-snug truncate ${
                      isMyVote
                        ? "font-semibold text-navy dark:text-dark-text"
                        : "text-charcoal dark:text-dark-text"
                    }`}
                  >
                    {story.headline}
                  </span>
                  {isTop && (
                    <span className="flex-shrink-0 inline-flex items-center gap-1 bg-gold/15 border border-gold/25 text-gold rounded-full px-2 py-0.5 text-[10px] font-body font-bold uppercase tracking-wide">
                      <svg
                        className="w-2.5 h-2.5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                      Pick
                    </span>
                  )}
                </div>
                {myVote && (
                  <span className="flex-shrink-0 font-mono text-xs text-slate-light dark:text-dark-dim tabular-nums">
                    {pct}%
                  </span>
                )}
              </div>
            </button>
          );
        })}

        {lockedStories.length > 0 && (
          <div className="mt-3 pt-3 border-t border-cream-dark dark:border-dark-border">
            <p className="font-body text-xs text-slate-light dark:text-dark-dim mb-2 italic">
              {lockedStories.length} more stories in the full briefing
            </p>
            {lockedStories.map((story) => {
              const voteCount = counts[story.id] ?? 0;
              const pct = total > 0 ? Math.round((voteCount / total) * 100) : 0;
              const isTop = story.id === topStoryId && total > 0;

              return (
                <div
                  key={story.id}
                  className="w-full text-left rounded-lg p-3.5 border border-cream-dark/50 dark:border-dark-border/50 bg-cream/30 dark:bg-dark-bg/30 mb-2 relative overflow-hidden opacity-60"
                >
                  {myVote && (
                    <div
                      className="absolute inset-y-0 left-0 bg-teal/5 transition-all duration-500 rounded-lg"
                      style={{ width: `${pct}%` }}
                    />
                  )}
                  <div className="relative flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-4 h-4 rounded-full border-2 border-slate-light/20 flex-shrink-0" />
                      <span className="font-body text-sm text-slate-light dark:text-dark-dim truncate blur-[3px]">
                        {story.headline}
                      </span>
                      {isTop && (
                        <span className="flex-shrink-0 inline-flex items-center gap-1 bg-gold/15 border border-gold/25 text-gold rounded-full px-2 py-0.5 text-[10px] font-body font-bold uppercase tracking-wide">
                          <svg
                            className="w-2.5 h-2.5"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                          </svg>
                          Pick
                        </span>
                      )}
                    </div>
                    {myVote && (
                      <span className="flex-shrink-0 font-mono text-xs text-slate-light/50 tabular-nums">
                        {pct}%
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
