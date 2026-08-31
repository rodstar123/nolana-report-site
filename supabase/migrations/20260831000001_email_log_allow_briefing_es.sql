-- email_log.email_type never accepted 'briefing_es', the type the Spanish
-- briefing pass writes (app/api/send-briefing/route.ts). Bilingual delivery
-- shipped 2026-06-08 (1b96e7c); from then until 2026-08-31 every ES log insert
-- failed with a 23514 check violation that the route discarded unread.
--
-- The emails themselves were delivered the whole time — Resend confirms 2 ES
-- sends on 2026-08-17, 08-24 and 08-31, all last_event=delivered. Only the
-- logging was blind, which made the ES edition look permanently undelivered.
--
-- Applied to production 2026-08-31.
ALTER TABLE email_log DROP CONSTRAINT email_log_email_type_check;
ALTER TABLE email_log ADD CONSTRAINT email_log_email_type_check
  CHECK (email_type = ANY (ARRAY['briefing','briefing_es','welcome','upgrade','digest']));
