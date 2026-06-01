"use client";
import { useState, useEffect } from "react";

interface Props {
  issueSlug: string;
  storyId: string;
}

let cachedTopStory: { slug: string; storyId: string | null; ts: number } = {
  slug: "",
  storyId: null,
  ts: 0,
};

export default function ReadersPickBadge({ issueSlug, storyId }: Props) {
  const [isTop, setIsTop] = useState(false);

  useEffect(() => {
    const now = Date.now();
    if (cachedTopStory.slug === issueSlug && now - cachedTopStory.ts < 30_000) {
      setIsTop(cachedTopStory.storyId === storyId);
      return;
    }

    fetch(`/api/story-vote?issueSlug=${issueSlug}`)
      .then((r) => r.json())
      .then((data) => {
        const counts = data.counts ?? {};
        const total = data.total ?? 0;
        if (total === 0) {
          cachedTopStory = { slug: issueSlug, storyId: null, ts: now };
          return;
        }
        const top = Object.entries(counts).sort(
          (a, b) => (b[1] as number) - (a[1] as number),
        )[0]?.[0];
        cachedTopStory = {
          slug: issueSlug,
          storyId: top ?? null,
          ts: now,
        };
        setIsTop(top === storyId);
      })
      .catch(() => {});
  }, [issueSlug, storyId]);

  if (!isTop) return null;

  return (
    <span className="inline-flex items-center gap-1 bg-gold/15 border border-gold/25 text-gold rounded-full px-2 py-0.5 text-[10px] font-body font-bold uppercase tracking-wide">
      <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
      Reader&apos;s Pick
    </span>
  );
}
