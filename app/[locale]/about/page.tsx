import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import SignupForm from "@/components/SignupForm";

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const isEs = params.locale === "es";
  const title = isEs
    ? "Acerca de The Nolana Report — Inteligencia de Negocios del RGV"
    : "About The Nolana Report — RGV Business Intelligence";
  const description = isEs
    ? "Conoce The Nolana Report: el reporte semanal de inteligencia de negocios del Valle del Río Grande, publicado por National Bookkeeping Company en McAllen, TX."
    : "Learn about The Nolana Report — the weekly Rio Grande Valley business intelligence briefing, published by National Bookkeeping Company in McAllen, TX.";
  const ogDescription = isEs
    ? "El reporte semanal de inteligencia de negocios del Valle del Río Grande — con puntaje y resumen cada lunes. Gratis para leer."
    : "The weekly Rio Grande Valley business intelligence briefing — scored and summarized every Monday. Free to read.";
  return {
    title,
    description,
    openGraph: {
      title,
      description: ogDescription,
      url: "https://nolanareport.com/about",
      siteName: "The Nolana Report",
      images: [
        {
          url: "https://nolanareport.com/images/og-social-card.png",
          width: 1200,
          height: 630,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: ogDescription,
    },
  };
}

export default async function AboutPage() {
  const t = await getTranslations("aboutPage");

  return (
    <main className="bg-cream min-h-screen pt-28 pb-24">
      <div className="max-w-2xl mx-auto px-6">
        <div className="mb-10">
          <Link
            href="/"
            className="font-body text-sm text-teal hover:text-teal-light transition-colors"
          >
            {t("back")}
          </Link>
        </div>

        <h1
          className="font-display font-bold text-charcoal mb-6"
          style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)" }}
        >
          {t("title")}
        </h1>

        <p className="font-body text-slate text-lg leading-relaxed mb-12">
          {t("lead")}
        </p>

        <div className="prose-nolana font-body text-slate space-y-8 leading-relaxed">
          <section>
            <h2 className="font-display font-bold text-charcoal text-xl mb-3">
              {t("whoHeading")}
            </h2>
            <p>{t("whoBody")}</p>
            <p className="mt-3">
              National Bookkeeping Company®
              <br />
              315 W Nolana Ave, McAllen, TX 78504
              <br />
              <a
                href="mailto:info@nationalboco.com"
                className="text-teal hover:text-teal-light underline transition-colors"
              >
                info@nationalboco.com
              </a>
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-charcoal text-xl mb-3">
              {t("whatHeading")}
            </h2>
            <p>{t("whatBody")}</p>
          </section>

          <section>
            <h2 className="font-display font-bold text-charcoal text-xl mb-3">
              {t("whyHeading")}
            </h2>
            <p>{t("whyBody")}</p>
          </section>
        </div>

        {/* Closing CTA — reuses the shared SignupForm (free tier), no new form */}
        <div className="mt-16 pt-12 border-t border-cream-dark text-center">
          <h2 className="font-display font-bold text-charcoal text-2xl md:text-3xl mb-3">
            {t("ctaHeading")}
          </h2>
          <p className="font-body text-slate text-sm mb-8 leading-relaxed">
            {t("ctaBody")}
          </p>
          <div className="max-w-sm mx-auto">
            <SignupForm variant="light" />
          </div>
        </div>
      </div>
    </main>
  );
}
