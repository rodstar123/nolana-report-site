import { getSubscriber } from "@/lib/get-subscriber";
import Link from "next/link";
import { SignalForm } from "@/components/SignalForm";

export const metadata = {
  title: "Send a Business Tip | The Nolana Report",
  description:
    "Know something we should cover? Send us a tip and help sharpen next Monday's briefing.",
};

export default async function SignalsPage() {
  const subscriber = await getSubscriber();

  return (
    <main
      className="min-h-screen px-4 pb-24"
      style={{
        background:
          "linear-gradient(160deg, #0b1320 0%, #0f1722 40%, #111d2e 100%)",
      }}
    >
      {/* pt-24 clears fixed global nav (h-16) + back-link row */}
      <div className="max-w-xl mx-auto pt-24 pb-6">
        <Link
          href="/account"
          className="font-body text-xs text-slate-light hover:text-teal-light transition-colors tracking-widest uppercase"
        >
          ← My Account
        </Link>
      </div>

      <div className="max-w-xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <p className="font-body text-xs text-teal-light uppercase tracking-widest mb-3">
            Business Tip
          </p>
          <h1 className="font-display font-bold text-warm-white text-3xl md:text-4xl leading-tight mb-4">
            Know something we should cover?
          </h1>
          <p className="font-editorial text-slate-light text-base leading-relaxed">
            Saw a new store opening? Heard about a company moving in? Noticed
            construction on a new project? Tell us and we&apos;ll look into it
            for next Monday&apos;s briefing.
          </p>
        </div>

        {/* Form card */}
        <div
          className="rounded-2xl p-8 border border-white/8"
          style={{ background: "rgba(15,23,34,0.85)" }}
        >
          <SignalForm
            subscriberName={subscriber?.name}
            subscriberEmail={subscriber?.email}
          />
        </div>

        <p className="font-body text-slate-light/50 text-xs text-center mt-6 leading-relaxed">
          Tips are reviewed before publication. Sending a tip does not guarantee
          it appears in the briefing.
        </p>
      </div>
    </main>
  );
}
