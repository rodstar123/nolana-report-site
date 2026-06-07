import Link from "next/link";

export interface BreatherData {
  type: string;
  number?: string;
  text: string;
  storyName?: string;
  readCount?: number;
  freeCount?: number;
  totalCount?: number;
}

function StatCallout({ data }: { data: BreatherData }) {
  return (
    <div className="py-10 text-center">
      <p className="font-display font-bold text-[36px] leading-tight text-teal dark:text-teal-light mb-2">
        {data.number}
      </p>
      <p className="font-body text-[15px] text-slate dark:text-dark-muted leading-relaxed max-w-md mx-auto">
        {data.text}
      </p>
    </div>
  );
}

function QuickMath({ data }: { data: BreatherData }) {
  return (
    <div className="py-8 px-6 border border-cream-dark dark:border-dark-border rounded-xl">
      <div className="flex items-start gap-3">
        <span className="text-lg mt-0.5 flex-shrink-0" aria-hidden="true">
          🧮
        </span>
        <p className="font-body text-[15px] text-charcoal dark:text-dark-text leading-[1.7]">
          {data.text}
        </p>
      </div>
    </div>
  );
}

function ThisTimeLastYear({ data }: { data: BreatherData }) {
  return (
    <div className="py-8 text-center max-w-lg mx-auto">
      <p className="font-body text-[11px] text-slate-light dark:text-dark-dim uppercase tracking-[2px] font-semibold mb-3">
        ↩ This Time Last Year
      </p>
      <p className="font-editorial text-[15px] text-slate dark:text-dark-muted leading-[1.7] italic">
        {data.text}
      </p>
    </div>
  );
}

function ValleyVsNational({ data }: { data: BreatherData }) {
  return (
    <div className="py-8 text-center max-w-lg mx-auto">
      <p className="font-body text-[11px] text-slate-light dark:text-dark-dim uppercase tracking-[2px] font-semibold mb-3">
        📍 Valley vs. National
      </p>
      <p className="font-body text-[15px] text-charcoal dark:text-dark-text leading-[1.7]">
        {data.text}
      </p>
    </div>
  );
}

function ForwardThis({ data }: { data: BreatherData }) {
  return (
    <div className="py-8 text-center max-w-lg mx-auto">
      <p className="font-body text-[15px] text-slate dark:text-dark-muted leading-relaxed">
        <span className="mr-1.5" aria-hidden="true">
          📤
        </span>
        {data.text}
      </p>
    </div>
  );
}

function PullQuote({ data }: { data: BreatherData }) {
  return (
    <div className="py-12 text-center max-w-xl mx-auto">
      <div className="w-12 h-px bg-cream-dark dark:bg-dark-border mx-auto mb-6" />
      <p className="font-editorial text-[21px] leading-[1.6] text-charcoal dark:text-dark-text italic">
        {data.text}
      </p>
      <div className="w-12 h-px bg-cream-dark dark:bg-dark-border mx-auto mt-6" />
    </div>
  );
}

function Nudge({ data }: { data: BreatherData }) {
  return (
    <div className="py-6 text-center">
      <p className="font-body text-[14px] text-slate-light dark:text-dark-dim leading-relaxed">
        {data.text.replace(/→.*$/, "").trim()}{" "}
        <Link
          href="/subscribe"
          className="text-teal dark:text-teal-light font-medium hover:underline"
        >
          {data.text.match(/→\s*(.+)$/)?.[1] || "Unlock Pro →"}
        </Link>
      </p>
    </div>
  );
}

function ProgressBar({ data }: { data: BreatherData }) {
  const read = data.readCount ?? 0;
  const free = data.freeCount ?? 0;
  const total = data.totalCount ?? 0;
  const pct = free > 0 ? Math.min(100, Math.round((read / free) * 100)) : 0;
  const remaining = total - free;

  return (
    <div className="py-6 max-w-md mx-auto">
      <div className="h-1 bg-cream-dark dark:bg-dark-border rounded-full overflow-hidden mb-2">
        <div
          className="h-full bg-teal dark:bg-teal-light rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="font-body text-[13px] text-slate-light dark:text-dark-dim text-center">
        You&apos;ve read {read} of {free} free stories.{" "}
        {remaining > 0 && (
          <Link
            href="/subscribe"
            className="text-teal dark:text-teal-light font-medium hover:underline"
          >
            {remaining} more in the full briefing →
          </Link>
        )}
      </p>
    </div>
  );
}

const RENDERERS: Record<string, React.FC<{ data: BreatherData }>> = {
  stat_callout: StatCallout,
  quick_math: QuickMath,
  this_time_last_year: ThisTimeLastYear,
  valley_vs_national: ValleyVsNational,
  forward_this: ForwardThis,
  pull_quote: PullQuote,
  nudge: Nudge,
  progress_bar: ProgressBar,
};

export default function BreatherBlock({ data }: { data: BreatherData }) {
  const Renderer = RENDERERS[data.type];
  if (!Renderer) return null;
  return <Renderer data={data} />;
}
