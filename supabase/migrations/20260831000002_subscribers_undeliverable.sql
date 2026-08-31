-- Undeliverable tracking for subscribers.
--
-- A subscriber can be a valid, verified, non-unsubscribed row and still be
-- unreachable: Resend suppresses an address after a hard bounce or a spam
-- complaint, and keeps accepting the send while delivering nothing. Before
-- this, those addresses were indistinguishable from healthy ones — they
-- inflated the "confirmed subscribers" count every Monday and kept drawing
-- sends that could only damage sender reputation.
--
-- undeliverable_at is the marker the send path filters on. It is deliberately
-- separate from `unsubscribed`: the subscriber never asked to leave, so their
-- intent must not be overwritten by our delivery problem. Nulling the column
-- puts an address straight back into the send.
--
-- Applied to production 2026-08-31.
ALTER TABLE subscribers
  ADD COLUMN IF NOT EXISTS undeliverable_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS undeliverable_reason TEXT;

CREATE INDEX IF NOT EXISTS idx_subscribers_undeliverable
  ON subscribers(undeliverable_at)
  WHERE undeliverable_at IS NOT NULL;
