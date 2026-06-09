"use client";

import Link from "next/link";

interface Props {
  moves: string[];
  canSeePro: boolean;
  title?: string;
}

const BOLD_PATTERN = /^\*\*(.+?)\*\*\s*(.*)/;

function truncateWords(text: string, wordCount: number): string {
  const words = text.split(/\s+/);
  if (words.length <= wordCount) return text;
  return words.slice(0, wordCount).join(" ") + "…";
}

function MoveItem({ move, index }: { move: string; index: number }) {
  const boldMatch = move.match(BOLD_PATTERN);
  return (
    <li className="font-editorial text-[17px] text-charcoal dark:text-dark-text leading-relaxed pl-2">
      <span className="font-mono text-sm text-teal dark:text-teal-light font-bold mr-2">
        {index + 1}.
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
}

function LockedMoveItem({ move, index }: { move: string; index: number }) {
  // Strip bold markers to get plain text for truncation
  const plainText = move.replace(/\*\*/g, "");
  const truncated = truncateWords(plainText, 15);

  return (
    <li className="relative overflow-hidden font-editorial text-[17px] text-charcoal dark:text-dark-text leading-relaxed pl-2">
      <span className="font-mono text-sm text-teal dark:text-teal-light font-bold mr-2">
        {index + 1}.
      </span>
      {truncated}
      {/* Gradient overlay fades text to card background */}
      <div
        className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-r from-transparent to-warm-white dark:to-dark-card pointer-events-none"
        aria-hidden="true"
      />
    </li>
  );
}

export function ThreeMovesSection({
  moves,
  canSeePro,
  title = "3 Moves This Week",
}: Props) {
  if (!moves || moves.length === 0) return null;

  return (
    <div className="mb-8 bg-warm-white dark:bg-dark-card border border-cream-dark dark:border-dark-border rounded-xl p-7">
      <h2 className="font-display font-bold text-navy dark:text-dark-text text-xl mb-5">
        {title}
      </h2>
      <ol className="space-y-4">
        {canSeePro ? (
          // Pro view — all moves rendered in full
          moves.map((move, i) => <MoveItem key={i} move={move} index={i} />)
        ) : (
          // Free teaser — move #1 full, moves #2+ blurred with gradient
          <>
            <MoveItem move={moves[0]} index={0} />
            {moves.slice(1).map((move, i) => (
              <LockedMoveItem key={i + 1} move={move} index={i + 1} />
            ))}
          </>
        )}
      </ol>

      {!canSeePro && (
        <p className="mt-5 pt-4 border-t border-cream-dark dark:border-dark-border">
          <Link
            href="/subscribe"
            className="font-body text-sm text-teal dark:text-teal-light hover:text-teal-light dark:hover:text-teal font-semibold transition-colors"
          >
            See all {moves.length} moves → Unlock Pro
          </Link>
        </p>
      )}
    </div>
  );
}
