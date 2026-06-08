import { createClient } from "@supabase/supabase-js";
import { getTranslations } from "next-intl/server";

async function getActiveSubscriberCount(): Promise<number> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return 0;

  const supabase = createClient(url, key);
  const { count } = await supabase
    .from("subscribers")
    .select("*", { count: "exact", head: true })
    .eq("unsubscribed", false)
    .eq("email_verified", true);

  return count ?? 0;
}

export default async function SocialProof() {
  const count = await getActiveSubscriberCount();
  if (count === 0) return null;

  const t = await getTranslations("socialProof");
  const label =
    count >= 50
      ? t("trusted", { count: String(count) })
      : t("join", { count: String(count) });

  return (
    <section
      className="relative py-6 md:py-8 border-b border-teal/10"
      style={{
        background: "linear-gradient(to bottom, #0a1628 0%, #0f1722 100%)",
      }}
    >
      <div className="max-w-4xl mx-auto px-6 flex items-center justify-center gap-3">
        <div className="flex -space-x-2" aria-hidden="true">
          {[...Array(Math.min(count, 5))].map((_, i) => (
            <div
              key={i}
              className="w-8 h-8 rounded-full border-2 border-navy-deep flex items-center justify-center"
              style={{
                background: [
                  "linear-gradient(135deg, #0d7377, #10a3a8)",
                  "linear-gradient(135deg, #d4a843, #e8c16a)",
                  "linear-gradient(135deg, #1a2332, #2d3748)",
                  "linear-gradient(135deg, #0d7377, #10a3a8)",
                  "linear-gradient(135deg, #d4a843, #e8c16a)",
                ][i],
              }}
            >
              <svg
                className="w-4 h-4 text-white/80"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </div>
          ))}
        </div>

        <p className="font-body text-warm-white/70 text-sm font-medium">
          {label}
        </p>
      </div>
    </section>
  );
}
