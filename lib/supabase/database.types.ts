/**
 * INTERIM hand-authored Supabase types.
 *
 * `supabase gen types typescript --project-id jgauxsebrrmjavuguepv` requires a
 * login (run `supabase login` or set SUPABASE_ACCESS_TOKEN) AND the ingestion
 * tables to exist. Those tables are created in Phase 1, so this file is a
 * stand-in until then.
 *
 * REGENERATE after Phase 1:
 *   supabase login   # or export SUPABASE_ACCESS_TOKEN=...
 *   npx supabase gen types typescript --project-id jgauxsebrrmjavuguepv \
 *     > lib/supabase/database.types.ts
 *
 * Publishing tables mirror db/schema.sql (+ issues.opening migration).
 * Ingestion tables (raw_items/source_health/agent_logs) mirror the target
 * schema in the nolana-pipeline skill.
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Tier = "free" | "pro" | "intel";
export type EmailType = "briefing" | "welcome" | "upgrade" | "digest";
export type Section =
  | "new_business_pulse"
  | "gov_economic_watch"
  | "cross_border_trade"
  | "community_buzz"
  | "industrial_investment";
export type AgentName =
  | "Agent 1"
  | "Agent 2"
  | "Agent 3"
  | "Agent 4"
  | "Agent 5";
export type SourceStatus = "up" | "down";

export interface Database {
  public: {
    Tables: {
      subscribers: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          tier: Tier;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          subscribed_at: string | null;
          tier_updated_at: string | null;
          referral_code: string | null;
          referred_by: string | null;
          email_verified: boolean | null;
          unsubscribed: boolean | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          email: string;
          name?: string | null;
          tier?: Tier;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          referral_code?: string | null;
          referred_by?: string | null;
          email_verified?: boolean | null;
          unsubscribed?: boolean | null;
        };
        Update: Partial<
          Database["public"]["Tables"]["subscribers"]["Insert"]
        > & {
          tier_updated_at?: string | null;
          updated_at?: string | null;
        };
      };
      issues: {
        Row: {
          id: string;
          slug: string;
          title: string;
          published_at: string | null;
          is_published: boolean | null;
          stories_count: number | null;
          opening: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          slug: string;
          title: string;
          published_at?: string | null;
          is_published?: boolean | null;
          stories_count?: number | null;
          opening?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["issues"]["Insert"]>;
      };
      stories: {
        Row: {
          id: string;
          issue_id: string;
          position: number;
          is_free: boolean | null;
          section: Section;
          headline: string;
          summary: string;
          why_it_matters: string | null;
          source_name: string | null;
          source_url: string | null;
          source_date: string | null;
          nolana_score: number | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          issue_id: string;
          position: number;
          is_free?: boolean | null;
          section: Section;
          headline: string;
          summary: string;
          why_it_matters?: string | null;
          source_name?: string | null;
          source_url?: string | null;
          source_date?: string | null;
          nolana_score?: number | null;
        };
        Update: Partial<Database["public"]["Tables"]["stories"]["Insert"]>;
      };
      email_log: {
        Row: {
          id: string;
          subscriber_id: string;
          issue_id: string | null;
          email_type: EmailType;
          sent_at: string | null;
          resend_id: string | null;
        };
        Insert: {
          id?: string;
          subscriber_id: string;
          issue_id?: string | null;
          email_type: EmailType;
          resend_id?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["email_log"]["Insert"]>;
      };
      tips: {
        Row: {
          id: string;
          subscriber_id: string | null;
          what_happened: string;
          location: string | null;
          when_observed: string | null;
          submitter_name: string | null;
          submitted_at: string | null;
        };
        Insert: {
          id?: string;
          subscriber_id?: string | null;
          what_happened: string;
          location?: string | null;
          when_observed?: string | null;
          submitter_name?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["tips"]["Insert"]>;
      };

      // --- Ingestion layer (created in Phase 1) ---
      raw_items: {
        Row: {
          id: string;
          url: string;
          url_hash: string;
          agent: AgentName;
          title: string;
          snippet: string | null;
          full_text: string | null;
          fetch_method: string | null;
          source_name: string | null;
          category: string | null;
          summary: string | null;
          language: string | null;
          relevance_score: number | null;
          original_date: string | null;
          date_spotted: string | null;
          instant_alerted: boolean | null;
          included_in_briefing: boolean | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          url: string;
          url_hash: string;
          agent: AgentName;
          title: string;
          snippet?: string | null;
          full_text?: string | null;
          fetch_method?: string | null;
          source_name?: string | null;
          category?: string | null;
          summary?: string | null;
          language?: string | null;
          relevance_score?: number | null;
          original_date?: string | null;
          date_spotted?: string | null;
          instant_alerted?: boolean | null;
          included_in_briefing?: boolean | null;
        };
        Update: Partial<Database["public"]["Tables"]["raw_items"]["Insert"]>;
      };
      source_health: {
        Row: {
          id: string;
          agent: string;
          source_name: string;
          source_url: string;
          status: SourceStatus;
          last_success_at: string | null;
          last_failure_at: string | null;
          consecutive_failures: number | null;
          last_item_count: number | null;
          last_checked_at: string | null;
        };
        Insert: {
          id?: string;
          agent: string;
          source_name: string;
          source_url: string;
          status?: SourceStatus;
          last_success_at?: string | null;
          last_failure_at?: string | null;
          consecutive_failures?: number | null;
          last_item_count?: number | null;
          last_checked_at?: string | null;
        };
        Update: Partial<
          Database["public"]["Tables"]["source_health"]["Insert"]
        >;
      };
      agent_logs: {
        Row: {
          id: string;
          agent: string;
          run_started_at: string;
          run_finished_at: string | null;
          sources_attempted: number | null;
          sources_succeeded: number | null;
          sources_failed: number | null;
          items_fetched: number | null;
          items_new: number | null;
          items_scored: number | null;
          items_ingested: number | null;
          tokens_used: number | null;
          errors: Json | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          agent: string;
          run_started_at: string;
          run_finished_at?: string | null;
          sources_attempted?: number | null;
          sources_succeeded?: number | null;
          sources_failed?: number | null;
          items_fetched?: number | null;
          items_new?: number | null;
          items_scored?: number | null;
          items_ingested?: number | null;
          tokens_used?: number | null;
          errors?: Json | null;
        };
        Update: Partial<Database["public"]["Tables"]["agent_logs"]["Insert"]>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
