-- Story Card v2: structured fields (signal, who_should_act, smart_move, nolana_take)
ALTER TABLE stories ADD COLUMN IF NOT EXISTS signal text;
ALTER TABLE stories ADD COLUMN IF NOT EXISTS who_should_act text[];
ALTER TABLE stories ADD COLUMN IF NOT EXISTS smart_move text;
ALTER TABLE stories ADD COLUMN IF NOT EXISTS nolana_take text;
