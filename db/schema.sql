-- The Nolana Report — Supabase Schema
-- Run this in the Supabase SQL editor: supabase.com → Project → SQL Editor

-- ============================================================
-- TABLES
-- ============================================================

CREATE TABLE subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  tier TEXT NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'pro', 'intel')),
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT,
  subscribed_at TIMESTAMPTZ DEFAULT now(),
  tier_updated_at TIMESTAMPTZ DEFAULT now(),
  referral_code TEXT UNIQUE DEFAULT encode(gen_random_bytes(6), 'hex'),
  referred_by UUID REFERENCES subscribers(id),
  email_verified BOOLEAN DEFAULT false,
  unsubscribed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_subscribers_email ON subscribers(email);
CREATE INDEX idx_subscribers_stripe_customer ON subscribers(stripe_customer_id);
CREATE INDEX idx_subscribers_stripe_sub ON subscribers(stripe_subscription_id);
CREATE INDEX idx_subscribers_tier ON subscribers(tier);

-- ----

CREATE TABLE issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,           -- e.g. '2026-05-19'
  title TEXT NOT NULL,                  -- e.g. 'Week of May 19, 2026'
  published_at TIMESTAMPTZ,
  is_published BOOLEAN DEFAULT false,
  stories_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_issues_slug ON issues(slug);
CREATE INDEX idx_issues_published ON issues(is_published, published_at DESC);

-- ----

CREATE TABLE stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id UUID NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,           -- display order 1-30
  is_free BOOLEAN DEFAULT false,       -- true for stories 1-5
  section TEXT NOT NULL CHECK (section IN (
    'new_business_pulse',
    'gov_economic_watch',
    'cross_border_trade',
    'community_buzz',
    'industrial_investment'
  )),
  headline TEXT NOT NULL,
  summary TEXT NOT NULL,
  why_it_matters TEXT,
  source_name TEXT,
  source_url TEXT,
  source_date DATE,
  nolana_score INTEGER CHECK (nolana_score BETWEEN 1 AND 10),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_stories_issue ON stories(issue_id, position);
CREATE INDEX idx_stories_free ON stories(issue_id, is_free);

-- ----

CREATE TABLE email_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscriber_id UUID NOT NULL REFERENCES subscribers(id),
  issue_id UUID REFERENCES issues(id),
  email_type TEXT NOT NULL CHECK (email_type IN ('briefing', 'welcome', 'upgrade', 'digest')),
  sent_at TIMESTAMPTZ DEFAULT now(),
  resend_id TEXT
);

CREATE INDEX idx_email_log_subscriber ON email_log(subscriber_id, sent_at DESC);
CREATE INDEX idx_email_log_issue ON email_log(issue_id);

-- ----

CREATE TABLE tips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscriber_id UUID REFERENCES subscribers(id),
  what_happened TEXT NOT NULL,
  location TEXT,
  when_observed DATE,
  submitter_name TEXT,
  submitted_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE tips ENABLE ROW LEVEL SECURITY;

-- Public: read published issues
CREATE POLICY "Anyone can read published issues"
  ON issues FOR SELECT USING (is_published = true);

-- Public: read free stories
CREATE POLICY "Anyone can read free stories"
  ON stories FOR SELECT USING (is_free = true);

-- Service role (used by API routes) bypasses RLS automatically.
-- Pro/Intel story access is enforced in application logic, not RLS.

-- ============================================================
-- SEED: first issue (Week of May 19, 2026)
-- Run after the tables are created. Update UUIDs as needed.
-- ============================================================

-- INSERT INTO issues (slug, title, published_at, is_published, stories_count)
-- VALUES ('2026-05-19', 'Week of May 19, 2026', '2026-05-19 12:00:00+00', true, 4);

-- Then insert stories with that issue's id:
-- INSERT INTO stories (issue_id, position, is_free, section, headline, summary, why_it_matters, source_name, nolana_score)
-- VALUES (
--   '<issue-uuid>',
--   1, true,
--   'industrial_investment',
--   'New Manufacturing Facility to Open in Edinburg FTZ — 200 Jobs Expected',
--   'A Monterrey-based auto parts supplier announced a $14M facility...',
--   '200 expected jobs may increase demand for payroll, staffing...',
--   'Monitor / Edinburg Economic Development',
--   9
-- );
