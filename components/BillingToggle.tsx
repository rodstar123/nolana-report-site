"use client";

interface Props {
  value: "monthly" | "yearly";
  onChange: (v: "monthly" | "yearly") => void;
}

export function BillingToggle({ value, onChange }: Props) {
  return (
    <div className="inline-flex items-center gap-1 bg-white/6 border border-white/10 rounded-full p-1">
      <button
        onClick={() => onChange("monthly")}
        className={`font-body font-semibold text-sm px-5 py-2.5 rounded-full transition-all min-h-[44px] duration-200 ${
          value === "monthly"
            ? "bg-teal text-white shadow-sm"
            : "text-slate-light hover:text-warm-white"
        }`}
      >
        Monthly
      </button>
      <button
        onClick={() => onChange("yearly")}
        className={`font-body font-semibold text-sm px-5 py-2.5 rounded-full transition-all min-h-[44px] duration-200 inline-flex items-center gap-2 ${
          value === "yearly"
            ? "bg-teal text-white shadow-sm"
            : "text-slate-light hover:text-warm-white"
        }`}
      >
        Yearly
        <span
          className={`text-xs font-bold px-2 py-0.5 rounded-full transition-colors duration-200 ${
            value === "yearly"
              ? "bg-white/20 text-white"
              : "bg-gold/15 text-gold"
          }`}
        >
          2 months free
        </span>
      </button>
    </div>
  );
}
