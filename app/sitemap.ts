import { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let issues: Array<{ slug: string; published_at: string }> | null = null;

  if (
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
    );

    const { data } = await supabase
      .from("issues")
      .select("slug, published_at")
      .eq("is_published", true)
      .order("published_at", { ascending: false });

    issues = data;
  }

  const issueEntries: MetadataRoute.Sitemap = (issues ?? []).map((issue) => ({
    url: `https://nolanareport.com/issues/${issue.slug}`,
    lastModified: new Date(issue.published_at),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [
    {
      url: "https://nolanareport.com",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: "https://nolanareport.com/issues",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: "https://nolanareport.com/money-map",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...issueEntries,
    {
      url: "https://nolanareport.com/privacy",
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: "https://nolanareport.com/terms",
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.5,
    },
  ];
}
