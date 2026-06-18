import type { Metadata } from "next";
import { getSubscriber } from "@/lib/get-subscriber";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { SignalForm } from "@/components/SignalForm";

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const isEs = params.locale === "es";
  return {
    title: isEs
      ? "Mándenos un Dato de Negocios | The Nolana Report"
      : "Send a Business Tip | The Nolana Report",
    description: isEs
      ? "¿Sabe de algo que deberíamos cubrir? Mándenos un dato y ayúdenos a afinar el reporte del próximo lunes."
      : "Know something we should cover? Send us a tip and help sharpen next Monday's briefing.",
  };
}

export default async function SignalsPage() {
  const subscriber = await getSubscriber();
  const t = await getTranslations("signals");

  return (
    <main
      className="min-h-screen px-4 pb-24"
      style={{
        background:
          "linear-gradient(160deg, #0b1320 0%, #0f1722 40%, #111d2e 100%)",
      }}
    >
      <div className="max-w-xl mx-auto pt-24 pb-6">
        <Link
          href="/account"
          className="font-body text-xs text-slate-light hover:text-teal-light transition-colors tracking-widest uppercase"
        >
          {t("back")}
        </Link>
      </div>

      <div className="max-w-xl mx-auto">
        <div className="mb-10">
          <p className="font-body text-xs text-teal-light uppercase tracking-widest mb-3">
            {t("label")}
          </p>
          <h1 className="font-display font-bold text-warm-white text-3xl md:text-4xl leading-tight mb-4">
            {t("headline")}
          </h1>
          <p className="font-editorial text-slate-light text-base leading-relaxed">
            {t("subtitle")}
          </p>
        </div>

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
          {t("disclaimer")}
        </p>
      </div>
    </main>
  );
}
