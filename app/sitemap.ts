import { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";

export const revalidate = 3600;

const BASE = "https://nolanareport.com";

type ChangeFreq = "weekly" | "monthly" | "yearly";

function bilingual(
  path: string,
  opts: { lastModified: Date; changeFrequency: ChangeFreq; priority: number },
): MetadataRoute.Sitemap {
  const enUrl = path === "/" ? BASE : `${BASE}${path}`;
  const esUrl = path === "/" ? `${BASE}/es` : `${BASE}/es${path}`;
  const alternates = {
    languages: { en: enUrl, es: esUrl, "x-default": enUrl },
  };
  return [
    { url: enUrl, ...opts, alternates },
    { url: esUrl, ...opts, alternates },
  ];
}

// Stable, real last-content-change dates for the genuinely static pages.
// These do NOT change on every build — only edit when the page content changes.
const ADVERTISE_LASTMOD = new Date("2026-06-16");
const LEGAL_LASTMOD = new Date("2026-06-08"); // /privacy + /terms
// Fallback when the DB is unreachable (env vars missing in a given build).
const FALLBACK_CONTENT_LASTMOD = new Date("2026-06-15");

function buildStaticPages(contentLastMod: Date): MetadataRoute.Sitemap {
  // The home, issues, money-map, and signals pages re-render with each weekly
  // issue, so their honest lastmod is the most recent issue's published_at.
  return [
    ...bilingual("/", {
      lastModified: contentLastMod,
      changeFrequency: "weekly",
      priority: 1.0,
    }),
    ...bilingual("/issues", {
      lastModified: contentLastMod,
      changeFrequency: "weekly",
      priority: 0.9,
    }),
    ...bilingual("/money-map", {
      lastModified: contentLastMod,
      changeFrequency: "weekly",
      priority: 0.8,
    }),
    ...bilingual("/signals", {
      lastModified: contentLastMod,
      changeFrequency: "monthly",
      priority: 0.7,
    }),
    ...bilingual("/advertise", {
      lastModified: ADVERTISE_LASTMOD,
      changeFrequency: "monthly",
      priority: 0.7,
    }),
    ...bilingual("/privacy", {
      lastModified: LEGAL_LASTMOD,
      changeFrequency: "yearly",
      priority: 0.3,
    }),
    ...bilingual("/terms", {
      lastModified: LEGAL_LASTMOD,
      changeFrequency: "yearly",
      priority: 0.3,
    }),
  ];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    return buildStaticPages(FALLBACK_CONTENT_LASTMOD);
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
  );

  const { data: issues } = await supabase
    .from("issues")
    .select("slug, published_at")
    .eq("is_published", true)
    .order("published_at", { ascending: false });

  const issuePages = (issues ?? []).flatMap((issue) =>
    bilingual(`/issues/${issue.slug}`, {
      lastModified: new Date(issue.published_at),
      changeFrequency: "weekly",
      priority: 0.9,
    }),
  );

  // Most recent published issue drives the freshness of the weekly content pages.
  const latestContentLastMod = issues?.[0]?.published_at
    ? new Date(issues[0].published_at)
    : FALLBACK_CONTENT_LASTMOD;

  return [...buildStaticPages(latestContentLastMod), ...issuePages];
}
