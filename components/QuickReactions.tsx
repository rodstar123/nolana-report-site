"use client";
import { useState, useEffect, useCallback } from "react";

interface Props {
  storyId: string;
}

const REACTIONS = [
  { emoji: "\u{1F44D}", label: "Useful", key: "useful" },
  { emoji: "\u{1F525}", label: "Important", key: "important" },
  { emoji: "\u{1F440}", label: "Watching", key: "watching" },
] as const;

type ReactionKey = (typeof REACTIONS)[number]["key"];

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

export default function QuickReactions({ storyId }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const fp = getFingerprint();
    fetch(`/api/reactions?storyId=${storyId}&fp=${fp}`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        setCounts(data.counts ?? {});
        setSelected(new Set(data.mine ?? []));
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
    return () => {
      cancelled = true;
    };
  }, [storyId]);

  const toggle = useCallback(
    async (key: ReactionKey) => {
      const removing = selected.has(key);
      setSelected((prev) => {
        const next = new Set(prev);
        if (removing) next.delete(key);
        else next.add(key);
        return next;
      });
      setCounts((prev) => ({
        ...prev,
        [key]: Math.max(0, (prev[key] ?? 0) + (removing ? -1 : 1)),
      }));

      try {
        await fetch("/api/reactions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            storyId,
            reaction: key,
            remove: removing,
            fingerprint: getFingerprint(),
          }),
        });
      } catch {}
    },
    [storyId, selected],
  );

  if (!loaded) {
    return (
      <div
        className="flex items-center gap-2 h-8"
        role="group"
        aria-label="Quick reactions"
      >
        {REACTIONS.map((r) => (
          <span
            key={r.key}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-cream-dark/40 dark:bg-dark-border/40 border border-transparent animate-pulse min-h-[32px] w-14"
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className="flex items-center gap-2"
      role="group"
      aria-label="Quick reactions"
    >
      {REACTIONS.map((r) => {
        const active = selected.has(r.key);
        const count = counts[r.key] ?? 0;
        return (
          <button
            key={r.key}
            type="button"
            onClick={() => toggle(r.key)}
            aria-label={`React with ${r.label}`}
            aria-pressed={active}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-body transition-all duration-200 min-h-[32px] ${
              active
                ? "bg-teal/15 border border-teal/30 text-teal dark:text-teal-light"
                : "bg-cream-dark/60 dark:bg-dark-border/60 border border-transparent text-slate-light dark:text-dark-dim hover:bg-cream-dark dark:hover:bg-dark-border hover:border-cream-dark dark:hover:border-dark-border"
            }`}
          >
            <span className="text-sm" aria-hidden="true">
              {r.emoji}
            </span>
            {count > 0 && (
              <span className="font-mono text-[11px] tabular-nums">
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
