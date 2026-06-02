-- Aggregator v2: issue-level synthesis sections + story-level sub-scores
ALTER TABLE issues ADD COLUMN IF NOT EXISTS business_temperature TEXT;
ALTER TABLE issues ADD COLUMN IF NOT EXISTS valley_money_map TEXT;
ALTER TABLE issues ADD COLUMN IF NOT EXISTS three_moves TEXT;
ALTER TABLE issues ADD COLUMN IF NOT EXISTS quiet_signal TEXT;

ALTER TABLE stories ADD COLUMN IF NOT EXISTS money_impact TEXT;
ALTER TABLE stories ADD COLUMN IF NOT EXISTS urgency TEXT;
ALTER TABLE stories ADD COLUMN IF NOT EXISTS local_reach TEXT;
ALTER TABLE stories ADD COLUMN IF NOT EXISTS risk TEXT;
