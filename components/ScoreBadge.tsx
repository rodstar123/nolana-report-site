"use client";
import { useEffect, useRef } from "react";
import { scoreBadgePop } from "@/lib/animations";

interface Props {
  score: number;
}

function getBadgeStyle(score: number) {
  if (score >= 85)
    return {
      bg: "rgba(212,168,67,0.2)",
      color: "#b8860b",
      arrow: "▲",
      glow: "0 0 10px rgba(212,168,67,0.45)",
    };
  if (score >= 70)
    return {
      bg: "rgba(13,115,119,0.15)",
      color: "#0d7377",
      arrow: "▲",
      glow: "none",
    };
  return {
    bg: "rgba(74,85,104,0.1)",
    color: "#4a5568",
    arrow: "▲",
    glow: "none",
  };
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
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-base font-mono font-bold flex-shrink-0 min-w-[44px] justify-center"
      style={{
        background: style.bg,
        color: style.color,
        boxShadow: style.glow,
      }}
    >
      {style.arrow} {score}
    </span>
  );
}
