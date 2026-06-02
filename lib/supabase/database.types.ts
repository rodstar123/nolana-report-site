export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      agent_logs: {
        Row: {
          agent: string;
          created_at: string | null;
          errors: Json | null;
          id: string;
          items_fetched: number | null;
          items_ingested: number | null;
          items_new: number | null;
          items_scored: number | null;
          run_finished_at: string | null;
          run_started_at: string;
          sources_attempted: number | null;
          sources_failed: number | null;
          sources_succeeded: number | null;
          tokens_used: number | null;
        };
        Insert: {
          agent: string;
          created_at?: string | null;
          errors?: Json | null;
          id?: string;
          items_fetched?: number | null;
          items_ingested?: number | null;
          items_new?: number | null;
          items_scored?: number | null;
          run_finished_at?: string | null;
          run_started_at: string;
          sources_attempted?: number | null;
          sources_failed?: number | null;
          sources_succeeded?: number | null;
          tokens_used?: number | null;
        };
        Update: {
          agent?: string;
          created_at?: string | null;
          errors?: Json | null;
          id?: string;
          items_fetched?: number | null;
          items_ingested?: number | null;
          items_new?: number | null;
          items_scored?: number | null;
          run_finished_at?: string | null;
          run_started_at?: string;
          sources_attempted?: number | null;
          sources_failed?: number | null;
          sources_succeeded?: number | null;
          tokens_used?: number | null;
        };
        Relationships: [];
      };
      email_log: {
        Row: {
          email_type: string;
          id: string;
          issue_id: string | null;
          resend_id: string | null;
          sent_at: string | null;
          subscriber_id: string;
        };
        Insert: {
          email_type: string;
          id?: string;
          issue_id?: string | null;
          resend_id?: string | null;
          sent_at?: string | null;
          subscriber_id: string;
        };
        Update: {
          email_type?: string;
          id?: string;
          issue_id?: string | null;
          resend_id?: string | null;
          sent_at?: string | null;
          subscriber_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "email_log_issue_id_fkey";
            columns: ["issue_id"];
            isOneToOne: false;
            referencedRelation: "issues";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "email_log_subscriber_id_fkey";
            columns: ["subscriber_id"];
            isOneToOne: false;
            referencedRelation: "subscribers";
            referencedColumns: ["id"];
          },
        ];
      };
      issues: {
        Row: {
          created_at: string | null;
          id: string;
          is_published: boolean | null;
          opening: string | null;
          business_temperature: string | null;
          valley_money_map: string | null;
          three_moves: string | null;
          quiet_signal: string | null;
          published_at: string | null;
          slug: string;
          stories_count: number | null;
          title: string;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          is_published?: boolean | null;
          opening?: string | null;
          business_temperature?: string | null;
          valley_money_map?: string | null;
          three_moves?: string | null;
          quiet_signal?: string | null;
          published_at?: string | null;
          slug: string;
          stories_count?: number | null;
          title: string;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          is_published?: boolean | null;
          opening?: string | null;
          business_temperature?: string | null;
          valley_money_map?: string | null;
          three_moves?: string | null;
          quiet_signal?: string | null;
          published_at?: string | null;
          slug?: string;
          stories_count?: number | null;
          title?: string;
        };
        Relationships: [];
      };
      raw_items: {
        Row: {
          agent: string;
          category: string | null;
          created_at: string | null;
          date_spotted: string | null;
          fetch_method: string | null;
          full_text: string | null;
          id: string;
          included_in_briefing: boolean | null;
          instant_alerted: boolean | null;
          language: string | null;
          original_date: string | null;
          relevance_score: number | null;
          snippet: string | null;
          source_name: string | null;
          summary: string | null;
          title: string;
          url: string;
          url_hash: string;
        };
        Insert: {
          agent: string;
          category?: string | null;
          created_at?: string | null;
          date_spotted?: string | null;
          fetch_method?: string | null;
          full_text?: string | null;
          id?: string;
          included_in_briefing?: boolean | null;
          instant_alerted?: boolean | null;
          language?: string | null;
          original_date?: string | null;
          relevance_score?: number | null;
          snippet?: string | null;
          source_name?: string | null;
          summary?: string | null;
          title: string;
          url: string;
          url_hash: string;
        };
        Update: {
          agent?: string;
          category?: string | null;
          created_at?: string | null;
          date_spotted?: string | null;
          fetch_method?: string | null;
          full_text?: string | null;
          id?: string;
          included_in_briefing?: boolean | null;
          instant_alerted?: boolean | null;
          language?: string | null;
          original_date?: string | null;
          relevance_score?: number | null;
          snippet?: string | null;
          source_name?: string | null;
          summary?: string | null;
          title?: string;
          url?: string;
          url_hash?: string;
        };
        Relationships: [];
      };
      source_health: {
        Row: {
          agent: string;
          consecutive_failures: number | null;
          id: string;
          last_checked_at: string | null;
          last_failure_at: string | null;
          last_item_count: number | null;
          last_success_at: string | null;
          source_name: string;
          source_url: string;
          status: string;
        };
        Insert: {
          agent: string;
          consecutive_failures?: number | null;
          id?: string;
          last_checked_at?: string | null;
          last_failure_at?: string | null;
          last_item_count?: number | null;
          last_success_at?: string | null;
          source_name: string;
          source_url: string;
          status?: string;
        };
        Update: {
          agent?: string;
          consecutive_failures?: number | null;
          id?: string;
          last_checked_at?: string | null;
          last_failure_at?: string | null;
          last_item_count?: number | null;
          last_success_at?: string | null;
          source_name?: string;
          source_url?: string;
          status?: string;
        };
        Relationships: [];
      };
      stories: {
        Row: {
          created_at: string | null;
          headline: string;
          id: string;
          is_free: boolean | null;
          issue_id: string;
          nolana_score: number | null;
          position: number;
          section: string;
          source_date: string | null;
          source_name: string | null;
          source_url: string | null;
          summary: string;
          why_it_matters: string | null;
          money_impact: string | null;
          urgency: string | null;
          local_reach: string | null;
          risk: string | null;
        };
        Insert: {
          created_at?: string | null;
          headline: string;
          id?: string;
          is_free?: boolean | null;
          issue_id: string;
          nolana_score?: number | null;
          position: number;
          section: string;
          source_date?: string | null;
          source_name?: string | null;
          source_url?: string | null;
          summary: string;
          why_it_matters?: string | null;
          money_impact?: string | null;
          urgency?: string | null;
          local_reach?: string | null;
          risk?: string | null;
        };
        Update: {
          created_at?: string | null;
          headline?: string;
          id?: string;
          is_free?: boolean | null;
          issue_id?: string;
          nolana_score?: number | null;
          position?: number;
          section?: string;
          source_date?: string | null;
          source_name?: string | null;
          source_url?: string | null;
          summary?: string;
          why_it_matters?: string | null;
          money_impact?: string | null;
          urgency?: string | null;
          local_reach?: string | null;
          risk?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "stories_issue_id_fkey";
            columns: ["issue_id"];
            isOneToOne: false;
            referencedRelation: "issues";
            referencedColumns: ["id"];
          },
        ];
      };
      subscribers: {
        Row: {
          created_at: string | null;
          email: string;
          email_verified: boolean | null;
          id: string;
          name: string | null;
          referral_code: string | null;
          referred_by: string | null;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          subscribed_at: string | null;
          tier: string;
          tier_updated_at: string | null;
          unsubscribed: boolean | null;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          email: string;
          email_verified?: boolean | null;
          id?: string;
          name?: string | null;
          referral_code?: string | null;
          referred_by?: string | null;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          subscribed_at?: string | null;
          tier?: string;
          tier_updated_at?: string | null;
          unsubscribed?: boolean | null;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          email?: string;
          email_verified?: boolean | null;
          id?: string;
          name?: string | null;
          referral_code?: string | null;
          referred_by?: string | null;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          subscribed_at?: string | null;
          tier?: string;
          tier_updated_at?: string | null;
          unsubscribed?: boolean | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "subscribers_referred_by_fkey";
            columns: ["referred_by"];
            isOneToOne: false;
            referencedRelation: "subscribers";
            referencedColumns: ["id"];
          },
        ];
      };
      tips: {
        Row: {
          id: string;
          location: string | null;
          submitted_at: string | null;
          subscriber_id: string | null;
          what_happened: string;
        };
        Insert: {
          id?: string;
          location?: string | null;
          submitted_at?: string | null;
          subscriber_id?: string | null;
          what_happened: string;
        };
        Update: {
          id?: string;
          location?: string | null;
          submitted_at?: string | null;
          subscriber_id?: string | null;
          what_happened?: string;
        };
        Relationships: [
          {
            foreignKeyName: "tips_subscriber_id_fkey";
            columns: ["subscriber_id"];
            isOneToOne: false;
            referencedRelation: "subscribers";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
