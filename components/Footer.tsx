import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { PUBLISHER, PUBLISHER_URL } from "@/lib/constants";
import SignupForm from "./SignupForm";
import NBCBanner from "./NBCBanner";

export default async function Footer() {
  const year = new Date().getFullYear();
  const t = await getTranslations("footer");
  const tAd = await getTranslations("adSlot");

  const footerLinks = [
    { label: t("privacy"), href: "/privacy" },
    { label: t("terms"), href: "/terms" },
    { label: t("contact"), href: "mailto:info@nationalboco.com" },
    { label: t("telegram"), href: "https://t.me/NolanaReport" },
    { label: t("advertise"), href: "/advertise" },
  ];

  const nbcServices = [
    { label: t("smartbook"), href: PUBLISHER_URL },
    { label: t("taxCoordination"), href: PUBLISHER_URL },
    { label: t("businessConsulting"), href: PUBLISHER_URL },
  ];

  return (
    <footer
      className="border-t border-white/5"
      style={{
        background: "linear-gradient(to bottom, #0f1722 0%, #0a1221 100%)",
      }}
    >
      {/* Final CTA block */}
      <div className="py-12 md:py-20 border-b border-white/5">
        <div className="max-w-lg mx-auto px-6 lg:px-8 text-center">
          <h2 className="font-display font-bold text-warm-white text-2xl md:text-3xl mb-4">
            {t("ctaHeadline")}
          </h2>
          <p className="font-body text-slate-light text-sm mb-8 leading-relaxed">
            {t("ctaBody")}
          </p>
          <div className="max-w-sm mx-auto">
            <SignupForm variant="dark" />
          </div>
        </div>
      </div>

      {/* Open Ad Slot */}
      <div className="max-w-6xl mx-auto px-6 lg:px-8 pt-12">
        <div className="mb-10">
          <p
            className="text-center text-xs uppercase tracking-[3px] mb-2"
            style={{ color: "rgba(212,168,83,0.55)" }}
          >
            {tAd("advertisement")}
          </p>
          <div
            style={{
              maxWidth: "900px",
              margin: "0 auto",
              border: "1px dashed rgba(91,164,164,0.25)",
              borderRadius: "12px",
              padding: "32px 24px",
              textAlign: "center",
              background: "rgba(91,164,164,0.02)",
            }}
          >
            <p
              style={{
                fontSize: "14px",
                letterSpacing: "3px",
                textTransform: "uppercase",
                color: "rgba(91,164,164,0.7)",
                fontWeight: 600,
                margin: 0,
              }}
            >
              {tAd("headline")}
            </p>
            <p
              style={{
                fontSize: "13px",
                color: "rgba(138,150,173,0.7)",
                marginTop: "6px",
                marginBottom: 0,
              }}
            >
              {tAd("subtitle")}
            </p>
            <a
              href="/advertise"
              className="hover:underline"
              style={{
                display: "inline-block",
                fontSize: "12px",
                color: "#D4A853",
                marginTop: "10px",
                textDecoration: "none",
              }}
            >
              {tAd("cta")}
            </a>
          </div>
        </div>
      </div>

      {/* NBC Publisher Banner */}
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="mb-12">
          <p
            className="text-center text-xs uppercase tracking-[3px] mb-2"
            style={{ color: "rgba(212,168,83,0.55)" }}
          >
            {tAd("advertisement")}
          </p>
          <NBCBanner />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="relative inline-flex items-center justify-center">
                <div
                  className="absolute rounded-full z-0"
                  style={{
                    inset: "-10px",
                    background:
                      "radial-gradient(circle, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0) 70%)",
                  }}
                />
                <Image
                  src="/images/nolana-logo-64.webp"
                  alt="The Nolana Report"
                  width={28}
                  height={28}
                  className="relative z-10 h-7 w-7 flex-shrink-0"
                />
              </div>
              <h3 className="font-display font-bold text-gold text-xl tracking-widest uppercase">
                The Nolana Report
              </h3>
            </div>
            <p className="font-body text-slate-light text-sm leading-relaxed">
              {t("tagline")}
            </p>
            <p className="font-body text-slate-light text-xs mt-3">
              {t("publishedBy")}{" "}
              <a
                href={PUBLISHER_URL}
                className="text-teal-light hover:text-teal underline underline-offset-2 transition-colors"
              >
                {PUBLISHER}
              </a>
            </p>
          </div>

          <div>
            <h4 className="font-body font-bold text-warm-white text-sm uppercase tracking-widest mb-4">
              {t("linksHeading")}
            </h4>
            <ul className="space-y-2.5 font-body text-sm">
              {footerLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-slate-light hover:text-teal-light transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-body font-bold text-warm-white text-sm uppercase tracking-widest mb-4">
              {t("nbcServicesHeading")}
            </h4>
            <ul className="space-y-2.5 font-body text-sm">
              {nbcServices.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-slate-light hover:text-teal-light transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 py-8 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="font-body text-slate-light text-xs">
            {t("copyright", { year: String(year), publisher: PUBLISHER })}
          </p>
          <p className="font-body text-slate-light text-xs italic">
            {t("motto")}
          </p>
        </div>

        <div className="pb-24 lg:pb-8 pt-2 text-center">
          <p className="font-body text-sm text-slate-light/75">
            {t("createdBy")}{" "}
            <a
              href="https://thunderloud.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-teal-light hover:underline underline-offset-2 transition-colors"
            >
              ThunderLoud
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
