import { getTranslations } from "next-intl/server";
import SectionReveal from "./SectionReveal";

const AUDIENCE_KEYS = [
  "businessOwners",
  "investors",
  "professionals",
  "crossBorder",
] as const;

const AUDIENCE_ICONS: React.ReactNode[] = [
  <svg
    key="bo"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.75}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-6 h-6"
    aria-hidden="true"
  >
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9,22 9,12 15,12 15,22" />
  </svg>,
  <svg
    key="inv"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.75}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-6 h-6"
    aria-hidden="true"
  >
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>,
  <svg
    key="pro"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.75}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-6 h-6"
    aria-hidden="true"
  >
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>,
  <svg
    key="cb"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.75}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-6 h-6"
    aria-hidden="true"
  >
    <line x1="2" y1="12" x2="22" y2="12" />
    <polyline points="8,6 2,12 8,18" />
    <polyline points="16,6 22,12 16,18" />
  </svg>,
];

export default async function WhoItsFor() {
  const t = await getTranslations("whoItsFor");

  return (
    <section
      className="py-12 md:py-28 relative overflow-hidden"
      style={{
        background: "linear-gradient(to bottom, #f4f1ec 0%, #e8e3db 100%)",
      }}
    >
      {/* Treated RGV photo background (decorative) + CSS-only parallax.
          Falls back to the section's cream gradient if the image fails. */}
      <div className="who-bg" aria-hidden="true" />
      <div className="who-scrim" aria-hidden="true" />

      <div
        className="ambient-orb"
        style={
          {
            width: "50px",
            height: "50px",
            top: "20%",
            right: "8%",
            "--float-duration": "15s",
            "--float-delay": "-2s",
          } as React.CSSProperties
        }
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-6xl mx-auto px-6 lg:px-8">
        <SectionReveal>
          <div className="text-center mb-8 md:mb-14">
            <span className="section-label justify-center mb-4">
              {t("label")}
            </span>
            <h2
              className="font-display font-bold text-navy mt-4 max-w-3xl mx-auto"
              style={{ fontSize: "clamp(1.5rem, 3.5vw, 2.25rem)" }}
            >
              {t("headline")}
            </h2>
          </div>
        </SectionReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {AUDIENCE_KEYS.map((key, i) => (
            <SectionReveal key={key} delay={i * 0.08}>
              <div className="bg-warm-white border border-cream-dark rounded-xl p-7 flex flex-col gap-4 h-full hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
                <div className="w-12 h-12 rounded-xl bg-teal/8 flex items-center justify-center text-teal flex-shrink-0">
                  {AUDIENCE_ICONS[i]}
                </div>
                <div>
                  <h3 className="font-display font-bold text-navy text-lg mb-2">
                    {t(`audience.${key}.title`)}
                  </h3>
                  <p className="font-body text-slate text-sm leading-relaxed">
                    {t(`audience.${key}.description`)}
                  </p>
                </div>
              </div>
            </SectionReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
