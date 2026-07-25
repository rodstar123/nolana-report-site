-- Additive, non-destructive: record WHEN a subscriber confirmed their email.
-- Nullable, no backfill — existing email_verified boolean stays as-is.
ALTER TABLE subscribers
  ADD COLUMN IF NOT EXISTS email_verified_at timestamptz;
