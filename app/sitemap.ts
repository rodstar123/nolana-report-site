import { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";

export const revalidate = 3600;

const BASE = "https://nolanareport.com";

export async function generateSitemaps() {
  return [{ id: 0 }, { id: 1 }];
}

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

export default async function sitemap({
  id,
}: {
  id: number;
}): Promise<MetadataRoute.Sitemap> {
  if (id === 0) {
    const now = new Date();
    return [
      ...bilingual("/", {
        lastModified: now,
        changeFrequency: "weekly",
        priority: 1.0,
      }),
      ...bilingual("/issues", {
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.9,
      }),
      ...bilingual("/money-map", {
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.8,
      }),
      ...bilingual("/advertise", {
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.7,
      }),
      ...bilingual("/signals", {
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.7,
      }),
      ...bilingual("/privacy", {
        lastModified: now,
        changeFrequency: "yearly",
        priority: 0.3,
      }),
      ...bilingual("/terms", {
        lastModified: now,
        changeFrequency: "yearly",
        priority: 0.3,
      }),
    ];
  }

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    return [];
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

  return (issues ?? []).flatMap((issue) =>
    bilingual(`/issues/${issue.slug}`, {
      lastModified: new Date(issue.published_at),
      changeFrequency: "weekly",
      priority: 0.9,
    }),
  );
}
