import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import AdvertiseForm from "@/components/AdvertiseForm";

export const metadata: Metadata = {
  title: "Advertise — The Nolana Report",
  description:
    "Reach Rio Grande Valley business owners every Monday. Sponsorship opportunities with The Nolana Report.",
};

export default async function AdvertisePage() {
  const t = await getTranslations("advertise");
  const audienceItems = t.raw("audienceItems") as string[];
  const formatItems = t.raw("formatItems") as string[];

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
          className="font-display font-bold text-charcoal mb-3"
          style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)" }}
        >
          {t("title")}
        </h1>
        <p className="font-body text-slate text-base leading-relaxed mb-12">
          {t("subtitle")}
        </p>

        <div className="prose-nolana font-body text-slate space-y-10 leading-relaxed">
          <section>
            <h2 className="font-display font-bold text-charcoal text-xl mb-4">
              {t("audienceHeading")}
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-slate">
              {audienceItems.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="font-display font-bold text-charcoal text-xl mb-4">
              {t("formatHeading")}
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-slate">
              {formatItems.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
            <div
              className="mt-6 rounded-xl p-5"
              style={{
                background: "rgba(13,115,119,0.06)",
                border: "1px solid rgba(13,115,119,0.12)",
              }}
            >
              <p className="font-body text-sm text-slate leading-relaxed">
                {t("formatCallout")}
              </p>
            </div>
          </section>

          <section>
            <h2 className="font-display font-bold text-charcoal text-xl mb-4">
              {t("interestedHeading")}
            </h2>
            <p className="mb-6">{t("interestedBody")}</p>

            <AdvertiseForm />

            <p className="font-body text-slate-light text-xs mt-6">
              {t("emailDirect")}{" "}
              <a
                href="mailto:info@nationalboco.com"
                className="text-teal hover:text-teal-light underline transition-colors"
              >
                info@nationalboco.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
