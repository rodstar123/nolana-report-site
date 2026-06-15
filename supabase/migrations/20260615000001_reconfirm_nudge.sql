-- One-off re-confirmation nudge to unconfirmed subscribers.
-- Idempotency guard: stamped once the nudge is sent so it can never re-send.
ALTER TABLE subscribers
  ADD COLUMN IF NOT EXISTS reconfirm_nudge_sent_at timestamptz;
