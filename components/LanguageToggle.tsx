"use client";

import { useLocale } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";

export default function LanguageToggle() {
  const locale = useLocale();
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-1 text-sm font-body">
      <Link
        href={pathname}
        locale="en"
        className={`min-h-[44px] flex items-center px-1 transition-colors duration-200 ${
          locale === "en"
            ? "text-teal font-bold"
            : "text-slate-light hover:text-warm-white"
        }`}
        aria-label="Switch to English"
      >
        EN
      </Link>
      <span className="text-slate-light/50 select-none">|</span>
      <Link
        href={pathname}
        locale="es"
        className={`min-h-[44px] flex items-center px-1 transition-colors duration-200 ${
          locale === "es"
            ? "text-teal font-bold"
            : "text-slate-light hover:text-warm-white"
        }`}
        aria-label="Cambiar a español"
      >
        ES
      </Link>
    </div>
  );
}
