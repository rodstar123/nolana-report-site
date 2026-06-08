import { getTranslations } from "next-intl/server";
import { PUBLISHER, PUBLISHER_URL } from "@/lib/constants";
import SectionReveal from "./SectionReveal";

export default async function About() {
  const t = await getTranslations("about");

  return (
    <section
      className="py-12 md:py-28 relative overflow-hidden"
      style={{
        background: "linear-gradient(to bottom, #f4f1ec 0%, #e8e3db 100%)",
      }}
    >
      <div
        className="ambient-orb"
        style={
          {
            width: "50px",
            height: "50px",
            top: "30%",
            right: "10%",
            "--float-duration": "18s",
            "--float-delay": "-3s",
          } as React.CSSProperties
        }
        aria-hidden="true"
      />
      <div className="relative z-10 max-w-3xl mx-auto px-6 lg:px-8">
        <SectionReveal>
          <span className="section-label mb-6">{t("label")}</span>
          <h2
            className="font-display font-bold text-navy mt-4 mb-8"
            style={{ fontSize: "clamp(1.75rem, 4vw, 2.75rem)" }}
          >
            {t("headline")}
          </h2>
        </SectionReveal>

        <SectionReveal delay={0.1}>
          <div className="font-editorial text-slate text-lg leading-[1.75] space-y-5">
            <p>
              {t.rich("body", {
                link: (chunks) => (
                  <a
                    href={PUBLISHER_URL}
                    className="text-teal hover:text-teal-light underline underline-offset-2 transition-colors"
                  >
                    {chunks}
                  </a>
                ),
                publisher: PUBLISHER,
              })}
            </p>
          </div>
        </SectionReveal>

        <SectionReveal delay={0.2}>
          <div className="mt-10 p-7 bg-warm-white border border-teal/15 rounded-xl shadow-sm">
            <p className="font-body text-sm text-teal uppercase tracking-[0.15em] font-bold mb-3">
              {t("methodLabel")}
            </p>
            <p className="font-editorial text-slate text-base leading-[1.75]">
              {t("methodBody")}
            </p>
          </div>
        </SectionReveal>

        <SectionReveal delay={0.3}>
          <div className="mt-6 p-7 bg-warm-white border border-cream-dark rounded-xl shadow-sm">
            <p className="font-body text-sm text-slate-light mb-2 uppercase tracking-[0.15em] font-bold">
              {t("publishedBy")}
            </p>
            <a
              href={PUBLISHER_URL}
              className="font-display font-bold text-navy text-2xl hover:text-teal transition-colors"
            >
              {PUBLISHER}
            </a>
            <p className="font-body text-slate text-sm mt-2">
              315 W Nolana Ave, McAllen, TX &middot;{" "}
              <a
                href={PUBLISHER_URL}
                className="text-teal hover:text-teal-light transition-colors"
              >
                nationalboco.com
              </a>
            </p>
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}
