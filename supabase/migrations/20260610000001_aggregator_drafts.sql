-- aggregator_drafts — dry-run model-comparison harness output.
-- Holds parsed (or raw, on parse failure) aggregator output from
-- /api/aggregator?dry_run=1 runs. Never read by the production briefing path.
CREATE TABLE IF NOT EXISTS aggregator_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model TEXT NOT NULL,
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Service-role only (no policies) — same posture as agent_logs
ALTER TABLE aggregator_drafts ENABLE ROW LEVEL SECURITY;
