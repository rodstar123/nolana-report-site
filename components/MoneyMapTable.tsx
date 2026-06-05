"use client";

import { useState, useMemo } from "react";

interface RelatedStory {
  headline: string;
  section: string;
  nolana_score: number | null;
}

interface Props {
  headers: string[];
  rows: string[][];
  stories: RelatedStory[];
  issueDate: string;
  issueSlug: string;
}

type SortCol = 0 | 1 | 2;
type SortDir = "asc" | "desc";

const SIGNAL_COLORS: Record<string, string> = {
  strong:
    "bg-[#E6F5F5] text-[#0A5C5E] dark:bg-teal/25 dark:text-teal-light border-teal/30",
  moderate:
    "bg-[#FAEEDA] text-[#854F0B] dark:bg-gold/25 dark:text-gold border-gold/30",
  emerging:
    "bg-slate-light/15 text-slate dark:bg-dark-dim/25 dark:text-dark-muted border-slate-light/30",
  weak: "bg-[#FAECE7] text-[#712B13] dark:bg-red-900/20 dark:text-red-400 border-red-300/30",
};

function getSignalColor(signal: string): string {
  const lower = signal.toLowerCase();
  if (lower.includes("strong")) return SIGNAL_COLORS.strong;
  if (lower.includes("moderate")) return SIGNAL_COLORS.moderate;
  if (lower.includes("emerging") || lower.includes("early"))
    return SIGNAL_COLORS.emerging;
  if (lower.includes("weak") || lower.includes("declining"))
    return SIGNAL_COLORS.weak;
  return SIGNAL_COLORS.moderate;
}

function matchStories(row: string[], stories: RelatedStory[]): RelatedStory[] {
  const rowText = row.join(" ").toLowerCase();
  const words = rowText
    .split(/\s+/)
    .filter((w) => w.length > 4)
    .slice(0, 8);
  return stories.filter((s) => {
    const hLower = s.headline.toLowerCase();
    return words.some((w) => hLower.includes(w));
  });
}

export default function MoneyMapTable({
  headers,
  rows,
  stories,
  issueDate,
  issueSlug,
}: Props) {
  const [sortCol, setSortCol] = useState<SortCol | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  const handleSort = (col: SortCol) => {
    if (sortCol === col) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortCol(col);
      setSortDir("asc");
    }
  };

  const sortedRows = useMemo(() => {
    const indexed = rows.map((row, i) => ({ row, i }));
    if (sortCol === null) return indexed;
    indexed.sort((a, b) => {
      const va = (a.row[sortCol] ?? "").toLowerCase();
      const vb = (b.row[sortCol] ?? "").toLowerCase();
      const cmp = va.localeCompare(vb);
      return sortDir === "asc" ? cmp : -cmp;
    });
    return indexed;
  }, [rows, sortCol, sortDir]);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <span className="font-body text-sm text-slate-light dark:text-dark-dim">
          From the{" "}
          <a
            href={`/issues/${issueSlug}`}
            className="text-teal dark:text-teal-light hover:underline font-semibold"
          >
            {issueDate} briefing
          </a>
        </span>
        <span className="text-slate-light/40 dark:text-dark-dim/40">
          &middot;
        </span>
        <span className="font-body text-sm text-slate-light dark:text-dark-dim">
          {rows.length} signals tracked
        </span>
      </div>

      <div className="overflow-x-auto rounded-xl border border-cream-dark dark:border-dark-border">
        <table className="w-full text-sm font-body">
          <thead>
            <tr className="bg-warm-white dark:bg-dark-card border-b border-cream-dark dark:border-dark-border">
              {headers.map((h, i) => (
                <th
                  key={i}
                  onClick={() => handleSort(i as SortCol)}
                  className="text-left py-3.5 px-4 text-slate-light dark:text-dark-dim font-semibold uppercase tracking-wide text-xs cursor-pointer hover:text-teal dark:hover:text-teal-light transition-colors select-none"
                >
                  <span className="inline-flex items-center gap-1.5">
                    {h}
                    {sortCol === i && (
                      <span className="text-teal dark:text-teal-light">
                        {sortDir === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedRows.map(({ row, i: origIdx }) => {
              const isExpanded = expandedRow === origIdx;
              const related = matchStories(row, stories);

              return (
                <tr
                  key={origIdx}
                  onClick={() => setExpandedRow(isExpanded ? null : origIdx)}
                  className={`border-b border-cream-dark/50 dark:border-dark-border/50 last:border-0 cursor-pointer transition-colors ${
                    isExpanded
                      ? "bg-teal/[0.04] dark:bg-teal/[0.08]"
                      : "hover:bg-cream/60 dark:hover:bg-dark-card/60"
                  }`}
                >
                  {row.map((cell, j) => (
                    <td
                      key={j}
                      className={`py-3.5 px-4 text-charcoal dark:text-dark-text ${
                        j === 0 ? "font-semibold" : ""
                      }`}
                    >
                      {j === 0 ? (
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold border ${getSignalColor(cell)}`}
                        >
                          {cell}
                        </span>
                      ) : (
                        cell
                      )}
                      {j === row.length - 1 &&
                        isExpanded &&
                        related.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-cream-dark/50 dark:border-dark-border/50">
                            <p className="font-body text-xs text-slate-light dark:text-dark-dim uppercase tracking-wide font-semibold mb-2">
                              Related stories
                            </p>
                            <ul className="space-y-1.5">
                              {related.map((s, si) => (
                                <li
                                  key={si}
                                  className="font-body text-xs text-charcoal dark:text-dark-text flex items-center gap-2"
                                >
                                  <span className="w-1.5 h-1.5 rounded-full bg-teal/50 flex-shrink-0" />
                                  {s.headline}
                                  {s.nolana_score && (
                                    <span className="font-mono text-[10px] text-slate-light dark:text-dark-dim">
                                      NRI {s.nolana_score}
                                    </span>
                                  )}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-4 font-body text-xs text-slate-light dark:text-dark-dim italic">
        Click any row to see related stories. Click column headers to sort.
      </p>
    </div>
  );
}
