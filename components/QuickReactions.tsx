"use client";
import { useState, useEffect, useCallback, useRef } from "react";

interface Props {
  storyId: string;
}

const REACTIONS = [
  { emoji: "\u{1F44D}", label: "Useful", key: "useful" },
  { emoji: "\u{1F525}", label: "Big Deal", key: "important" },
  { emoji: "\u{1F4AC}", label: "Discuss", key: "watching" },
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
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipTimer = useRef<ReturnType<typeof setTimeout>>();

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

  const handleGroupHover = useCallback((entering: boolean) => {
    clearTimeout(tooltipTimer.current);
    if (entering) {
      tooltipTimer.current = setTimeout(() => setShowTooltip(true), 600);
    } else {
      setShowTooltip(false);
    }
  }, []);

  if (!loaded) {
    return (
      <div className="mt-4 mb-3">
        <div className="flex items-center gap-2 h-8">
          {REACTIONS.map((r) => (
            <span
              key={r.key}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs bg-cream-dark/40 dark:bg-dark-border/40 border border-transparent animate-pulse min-h-[32px] w-20"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 mb-3">
      <p className="font-body text-[11px] text-slate-light dark:text-dark-dim uppercase tracking-wide font-semibold mb-2">
        How valuable was this story?
      </p>
      <div
        className="relative flex items-center gap-2 flex-wrap"
        role="group"
        aria-label="Quick reactions"
        onMouseEnter={() => handleGroupHover(true)}
        onMouseLeave={() => handleGroupHover(false)}
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
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-body transition-all duration-200 min-h-[32px] ${
                active
                  ? "bg-teal/15 border border-teal/30 text-teal dark:text-teal-light font-semibold"
                  : "bg-cream-dark/60 dark:bg-dark-border/60 border border-transparent text-slate-light dark:text-dark-dim hover:bg-cream-dark dark:hover:bg-dark-border hover:border-cream-dark dark:hover:border-dark-border"
              }`}
            >
              <span className="text-sm" aria-hidden="true">
                {r.emoji}
              </span>
              <span className="text-[11px]">{r.label}</span>
              {count > 0 && (
                <span className="font-mono text-[10px] tabular-nums opacity-70">
                  {count}
                </span>
              )}
            </button>
          );
        })}

        {showTooltip && (
          <div className="absolute left-0 -bottom-8 z-30 bg-navy-deep dark:bg-dark-card border border-white/10 dark:border-dark-border rounded-lg px-3 py-1.5 shadow-lg pointer-events-none">
            <p className="font-body text-[10px] text-slate-light dark:text-dark-dim whitespace-nowrap">
              Your reaction helps us improve future briefings
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
