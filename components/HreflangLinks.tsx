"use client";

import { usePathname } from "next/navigation";

const BASE = "https://nolanareport.com";

export function HreflangLinks() {
  const fullPath = usePathname();
  const isEs = fullPath.startsWith("/es/") || fullPath === "/es";
  // Strip a leading locale segment (/en or /es). usePathname() returns the
  // internal "/en" for the unprefixed EN homepage, which previously leaked into
  // the canonical/alternate URLs (e.g. .../en, .../es/en). Stripping both keeps
  // the EN canonical self-referential to the served root.
  const path = fullPath.replace(/^\/(?:en|es)(?=\/|$)/, "") || "/";

  const enUrl = path === "/" ? BASE : `${BASE}${path}`;
  const esUrl = path === "/" ? `${BASE}/es` : `${BASE}/es${path}`;
  const canonical = isEs ? esUrl : enUrl;

  return (
    <>
      <link rel="canonical" href={canonical} />
      <link rel="alternate" hrefLang="en" href={enUrl} />
      <link rel="alternate" hrefLang="es" href={esUrl} />
      <link rel="alternate" hrefLang="x-default" href={enUrl} />
    </>
  );
}
