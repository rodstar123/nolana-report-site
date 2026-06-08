import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";

export async function getSubscriber() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) return null;

  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const { data } = await adminClient
    .from("subscribers")
    .select("*")
    .eq("email", user.email)
    .single();

  return data as Subscriber | null;
}

export type Subscriber = {
  id: string;
  email: string;
  name: string | null;
  tier: "free" | "pro" | "intel";
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  subscribed_at: string;
  tier_updated_at: string;
  referral_code: string;
  referred_by: string | null;
  email_verified: boolean;
  unsubscribed: boolean;
  alert_preferences: { email: boolean } | null;
  language_preference: "en" | "es" | "both";
  current_period_end: string | null;
  created_at: string;
  updated_at: string;
};
