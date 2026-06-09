"use client";

import { usePathname } from "next/navigation";

const BASE = "https://nolanareport.com";

export function HreflangLinks() {
  const fullPath = usePathname();
  const isEs = fullPath.startsWith("/es/") || fullPath === "/es";
  const path = isEs ? fullPath.replace(/^\/es(?=\/|$)/, "") || "/" : fullPath;

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
