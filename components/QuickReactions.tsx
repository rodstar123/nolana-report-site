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

function getSeedCount(storyId: string, key: string): number {
  let hash = 0;
  const s = `${storyId}-${key}`;
  for (let i = 0; i < s.length; i++) {
    hash = ((hash << 5) - hash + s.charCodeAt(i)) | 0;
  }
  return 12 + Math.abs(hash % 36);
}

function storageKey(storyId: string) {
  return `nri-reactions-${storyId}`;
}

export default function QuickReactions({ storyId }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey(storyId));
      if (saved) setSelected(new Set(JSON.parse(saved)));
    } catch {}
  }, [storyId]);

  const toggle = useCallback(
    (key: string) => {
      setSelected((prev) => {
        const next = new Set(prev);
        if (next.has(key)) next.delete(key);
        else next.add(key);
        try {
          localStorage.setItem(
            storageKey(storyId),
            JSON.stringify(Array.from(next)),
          );
        } catch {}
        return next;
      });
    },
    [storyId],
  );

  return (
    <div
      className="flex items-center gap-2"
      role="group"
      aria-label="Quick reactions"
    >
      {REACTIONS.map((r) => {
        const active = selected.has(r.key);
        const count = getSeedCount(storyId, r.key) + (active ? 1 : 0);
        return (
          <button
            key={r.key}
            type="button"
            onClick={() => toggle(r.key)}
            aria-label={`React with ${r.label}`}
            aria-pressed={active}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-body transition-all duration-200 min-h-[32px] ${
              active
                ? "bg-teal/15 border border-teal/30 text-teal"
                : "bg-cream-dark/60 border border-transparent text-slate-light hover:bg-cream-dark hover:border-cream-dark"
            }`}
          >
            <span className="text-sm" aria-hidden="true">
              {r.emoji}
            </span>
            <span className="font-mono text-[11px] tabular-nums">{count}</span>
          </button>
        );
      })}
    </div>
  );
}
