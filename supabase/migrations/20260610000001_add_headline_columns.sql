-- Editorial headline columns for issue pages
ALTER TABLE issues ADD COLUMN IF NOT EXISTS headline TEXT;
ALTER TABLE issues ADD COLUMN IF NOT EXISTS headline_es TEXT;
