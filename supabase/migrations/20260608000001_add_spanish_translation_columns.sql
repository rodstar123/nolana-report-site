-- Spanish translation columns for bilingual briefing delivery

-- Issues: editorial sections
ALTER TABLE issues ADD COLUMN IF NOT EXISTS title_es TEXT;
ALTER TABLE issues ADD COLUMN IF NOT EXISTS opening_es TEXT;
ALTER TABLE issues ADD COLUMN IF NOT EXISTS owners_move_es TEXT;
ALTER TABLE issues ADD COLUMN IF NOT EXISTS risk_radar_es TEXT;
ALTER TABLE issues ADD COLUMN IF NOT EXISTS thinking_question_es TEXT;
ALTER TABLE issues ADD COLUMN IF NOT EXISTS before_you_go_es TEXT;

-- Stories: reader-facing content fields
ALTER TABLE stories ADD COLUMN IF NOT EXISTS headline_es TEXT;
ALTER TABLE stories ADD COLUMN IF NOT EXISTS signal_es TEXT;
ALTER TABLE stories ADD COLUMN IF NOT EXISTS why_it_matters_es TEXT;
ALTER TABLE stories ADD COLUMN IF NOT EXISTS smart_move_es TEXT;
ALTER TABLE stories ADD COLUMN IF NOT EXISTS nolana_take_es TEXT;
