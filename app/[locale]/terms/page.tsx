import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export const metadata: Metadata = {
  title: "Terms of Service — The Nolana Report",
  description: "Terms of service for The Nolana Report newsletter.",
  robots: { index: false, follow: false },
};

export default async function TermsPage() {
  const t = await getTranslations("terms");
  const tiersItems = t.raw("tiersItems") as string[];

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
          className="font-display font-bold text-charcoal mb-2"
          style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)" }}
        >
          {t("title")}
        </h1>
        <p className="font-body text-slate-light text-sm mb-10">
          {t("lastUpdated")}
        </p>

        <div className="prose-nolana font-body text-slate space-y-8 leading-relaxed">
          <section>
            <h2 className="font-display font-bold text-charcoal text-xl mb-3">
              {t("serviceHeading")}
            </h2>
            <p>{t("serviceBody")}</p>
          </section>

          <section>
            <h2 className="font-display font-bold text-charcoal text-xl mb-3">
              {t("tiersHeading")}
            </h2>
            <p>{t("tiersIntro")}</p>
            <ul className="list-disc pl-5 space-y-1 mt-2 text-slate">
              {tiersItems.map((item, i) => (
                <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
              ))}
            </ul>
            <p className="mt-3">{t("tiersNote")}</p>
          </section>

          <section>
            <h2 className="font-display font-bold text-charcoal text-xl mb-3">
              {t("contentHeading")}
            </h2>
            <p>{t("contentBody")}</p>
          </section>

          <section>
            <h2 className="font-display font-bold text-charcoal text-xl mb-3">
              {t("useHeading")}
            </h2>
            <p>{t("useBody")}</p>
          </section>

          <section>
            <h2 className="font-display font-bold text-charcoal text-xl mb-3">
              {t("cancelHeading")}
            </h2>
            <p>
              {t("cancelBody")}{" "}
              <a
                href="mailto:info@nationalboco.com"
                className="text-teal hover:text-teal-light underline transition-colors"
              >
                info@nationalboco.com
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-charcoal text-xl mb-3">
              {t("publisherHeading")}
            </h2>
            <p>
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
              {t("changesHeading")}
            </h2>
            <p>{t("changesBody")}</p>
          </section>
        </div>
      </div>
    </main>
  );
}
