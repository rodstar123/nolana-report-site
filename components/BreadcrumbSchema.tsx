"use client";

import { usePathname } from "next/navigation";

const BASE = "https://nolanareport.com";

const PAGE_NAMES: Record<string, string> = {
  "/issues": "Archive",
  "/money-map": "Valley Money Map",
  "/advertise": "Advertise",
  "/signals": "Business Tip",
  "/privacy": "Privacy Policy",
  "/terms": "Terms of Service",
};

function toTitle(slug: string) {
  return slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function BreadcrumbSchema() {
  const fullPath = usePathname();
  const isEs = fullPath.startsWith("/es/") || fullPath === "/es";
  const pathname = isEs
    ? fullPath.replace(/^\/es(?=\/|$)/, "") || "/"
    : fullPath;

  if (pathname === "/" || pathname.startsWith("/issues/")) return null;

  const segments = pathname.split("/").filter(Boolean);
  const items = [
    { "@type": "ListItem" as const, position: 1, name: "Home", item: BASE },
  ];

  let currentPath = "";
  segments.forEach((seg, i) => {
    currentPath += `/${seg}`;
    items.push({
      "@type": "ListItem" as const,
      position: i + 2,
      name: PAGE_NAMES[currentPath] || toTitle(seg),
      item: `${BASE}${currentPath}`,
    });
  });

  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
