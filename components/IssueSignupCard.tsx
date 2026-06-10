"use client";

import { useTranslations } from "next-intl";
import SignupForm from "./SignupForm";

export function IssueSignupCard() {
  const t = useTranslations("issue");

  return (
    <div
      id="subscribe-free"
      className="my-6 p-7 bg-warm-white dark:bg-dark-card border border-cream-dark dark:border-dark-border rounded-xl scroll-mt-24"
    >
      <h3 className="font-display font-bold text-charcoal dark:text-dark-text text-xl mb-2">
        {t("inlineCapture.heading")}
      </h3>
      <p className="font-body text-slate dark:text-dark-muted text-[15px] leading-relaxed mb-5">
        {t("inlineCapture.body")}
      </p>
      <SignupForm variant="light" ctaLabel={t("inlineCapture.cta")} />
      <p className="font-body text-slate-light dark:text-dark-dim text-xs mt-3 text-center">
        {t("inlineCapture.microcopy")}
      </p>
    </div>
  );
}
