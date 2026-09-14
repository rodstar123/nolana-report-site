-- social_posts.updated_at
--
-- The upsert keys on (issue_id, platform, lang), and ON CONFLICT DO UPDATE
-- never touches a column the write does not name — so created_at kept the
-- first run's timestamp and a rerun was invisible in the table. The route now
-- sets updated_at explicitly on every write, so the pair reads as "first
-- generated / last regenerated".
--
-- Backfilled from created_at so existing rows are not left null.

alter table social_posts
  add column if not exists updated_at timestamptz not null default now();

update social_posts set updated_at = created_at where updated_at > created_at;
