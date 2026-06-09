import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export const metadata: Metadata = {
  title: "Privacy Policy — The Nolana Report",
  description: "Privacy policy for The Nolana Report newsletter.",
  robots: { index: false, follow: false },
};

export default async function PrivacyPage() {
  const t = await getTranslations("privacy");
  const thirdPartyItems = t.raw("thirdPartyItems") as string[];

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
              {t("collectHeading")}
            </h2>
            <p>{t("collectBody")}</p>
          </section>

          <section>
            <h2 className="font-display font-bold text-charcoal text-xl mb-3">
              {t("useHeading")}
            </h2>
            <p>{t("useBody")}</p>
          </section>

          <section>
            <h2 className="font-display font-bold text-charcoal text-xl mb-3">
              {t("thirdPartyHeading")}
            </h2>
            <p>{t("thirdPartyIntro")}</p>
            <ul className="list-disc pl-5 space-y-1 mt-2 text-slate">
              {thirdPartyItems.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
            <p className="mt-3">{t("thirdPartyNote")}</p>
          </section>

          <section>
            <h2 className="font-display font-bold text-charcoal text-xl mb-3">
              {t("rightsHeading")}
            </h2>
            <p>
              {t("rightsBody")}{" "}
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
            <p>{t("publisherBody")}</p>
          </section>

          <section>
            <h2 className="font-display font-bold text-charcoal text-xl mb-3">
              {t("updatesHeading")}
            </h2>
            <p>{t("updatesBody")}</p>
          </section>
        </div>
      </div>
    </main>
  );
}
