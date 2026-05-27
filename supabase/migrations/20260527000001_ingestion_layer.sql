-- The Nolana Report — ingestion layer (Phase 1 of the n8n→Vercel/Supabase migration)
-- Replaces the Notion raw/health stores; adds run observability.
-- Idempotent: safe to re-run. Apply via Supabase SQL editor or `supabase db push`.
-- Types mirror lib/supabase/database.types.ts; design from the nolana-pipeline skill.

-- ============================================================
-- raw_items — replaces Notion NOTION_RGV_RAW_DB_ID
-- ============================================================
CREATE TABLE IF NOT EXISTS raw_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL,
  url_hash TEXT UNIQUE NOT NULL,                 -- sha256(url.trim()); dedup key
  agent TEXT NOT NULL CHECK (agent IN ('Agent 1','Agent 2','Agent 3','Agent 4','Agent 5')),
  title TEXT NOT NULL,
  snippet TEXT,
  full_text TEXT,
  fetch_method TEXT,                             -- firecrawl | bright_data | none
  source_name TEXT,
  category TEXT,                                 -- New Open|Closing|Permit|City Council|Grant|Zoning|Tariff|Bridge|FX|Buzz|Event|Other
  summary TEXT,
  language TEXT DEFAULT 'EN' CHECK (language IN ('EN','ES')),
  relevance_score INT CHECK (relevance_score BETWEEN 0 AND 100),
  original_date DATE,
  date_spotted TIMESTAMPTZ DEFAULT now(),
  instant_alerted BOOLEAN DEFAULT false,         -- score >= 95
  included_in_briefing BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_raw_items_spotted  ON raw_items(date_spotted DESC);
CREATE INDEX IF NOT EXISTS idx_raw_items_score    ON raw_items(relevance_score DESC);
CREATE INDEX IF NOT EXISTS idx_raw_items_agent    ON raw_items(agent);
CREATE INDEX IF NOT EXISTS idx_raw_items_briefing ON raw_items(included_in_briefing, date_spotted DESC);

-- ============================================================
-- source_health — replaces NOTION_RGV_HEALTH_DB_ID (now written, not just queried)
-- ============================================================
CREATE TABLE IF NOT EXISTS source_health (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent TEXT NOT NULL,
  source_name TEXT NOT NULL,
  source_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'up' CHECK (status IN ('up','down')),
  last_success_at TIMESTAMPTZ,
  last_failure_at TIMESTAMPTZ,
  consecutive_failures INT DEFAULT 0,
  last_item_count INT DEFAULT 0,
  last_checked_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (agent, source_url)
);
CREATE INDEX IF NOT EXISTS idx_source_health_status ON source_health(status);

-- ============================================================
-- agent_logs — new; per-run observability
-- ============================================================
CREATE TABLE IF NOT EXISTS agent_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent TEXT NOT NULL,                           -- 'Agent 1'..'Agent 5' or 'aggregator'
  run_started_at TIMESTAMPTZ NOT NULL,
  run_finished_at TIMESTAMPTZ,
  sources_attempted INT DEFAULT 0,
  sources_succeeded INT DEFAULT 0,
  sources_failed INT DEFAULT 0,
  items_fetched INT DEFAULT 0,
  items_new INT DEFAULT 0,                        -- after url_hash dedup
  items_scored INT DEFAULT 0,
  items_ingested INT DEFAULT 0,                   -- score >= 40
  tokens_used INT DEFAULT 0,
  errors JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_agent_logs_agent ON agent_logs(agent, run_started_at DESC);

-- ============================================================
-- ROW LEVEL SECURITY — internal tables: service_role only (it bypasses RLS).
-- RLS enabled with NO policies => anon/authenticated cannot read or write.
-- ============================================================
ALTER TABLE raw_items     ENABLE ROW LEVEL SECURITY;
ALTER TABLE source_health ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_logs    ENABLE ROW LEVEL SECURITY;
