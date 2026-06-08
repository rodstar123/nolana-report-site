import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { PUBLISHER_URL } from "@/lib/constants";

export default async function NBCBanner() {
  const t = await getTranslations("nbcBanner");

  return (
    <div className="nbc-banner">
      <div className="nbc-banner__border" />
      <div className="nbc-banner__accent" />

      <div className="nbc-banner__content">
        <div className="nbc-banner__label">{t("label")}</div>

        <h3 className="nbc-banner__headline">{t("headline")}</h3>

        <div className="nbc-banner__desc">
          {t.rich("description", {
            strong: (chunks) => (
              <strong className="nbc-banner__smartbook">{chunks}</strong>
            ),
          })}
        </div>

        <a
          href={PUBLISHER_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="nbc-banner__cta"
        >
          {t("cta")}
        </a>
      </div>

      <div className="nbc-banner__image-wrap">
        <Image
          src="/images/nbc-office.webp"
          alt="National Bookkeeping Company office"
          width={600}
          height={360}
          className="nbc-banner__image"
        />
        <div className="nbc-banner__image-fade" />
      </div>
    </div>
  );
}
