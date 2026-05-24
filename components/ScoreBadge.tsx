"use client";
import { useEffect, useRef } from "react";
import { scoreBadgePop } from "@/lib/animations";

interface Props {
  score: number;
}

function getBadgeStyle(score: number) {
  if (score >= 85)
    return { bg: "rgba(212,168,67,0.15)", color: "#b8860b", arrow: "▲" };
  if (score >= 70)
    return { bg: "rgba(13,115,119,0.1)", color: "#0d7377", arrow: "▲" };
  return { bg: "rgba(74,85,104,0.08)", color: "#4a5568", arrow: "▲" };
}

export default function ScoreBadge({ score }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const style = getBadgeStyle(score);

  useEffect(() => {
    if (ref.current) scoreBadgePop(ref.current);
  }, []);

  return (
    <span
      ref={ref}
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono font-semibold flex-shrink-0"
      style={{ background: style.bg, color: style.color }}
    >
      {style.arrow} {score}
    </span>
  );
}
