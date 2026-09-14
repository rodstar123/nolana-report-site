-- Monday social-post generator: storage for ready-to-paste posts.
--
-- Nothing in this feature posts to any external platform. The route generates
-- copy, stores it here, and sends it to Noe's Telegram DM. Noe posts by hand.
-- There is deliberately no platform API, SDK, token or credential anywhere in
-- this path — the `platform` column is a label on a piece of text, not a
-- destination.
--
-- One row per (issue, platform, lang). The unique constraint below is what
-- makes the route idempotent: a manual rerun with ?issue_id= upserts over the
-- previous attempt instead of stacking duplicate copy for the same slot.

create table if not exists social_posts (
  id          uuid primary key default gen_random_uuid(),
  issue_id    uuid not null references issues (id) on delete cascade,

  -- Denormalised on purpose: the copy is only intelligible next to the story
  -- it was written from, and stories can be re-aggregated.
  story_title text,

  platform    text not null check (platform in ('facebook', 'linkedin', 'reddit', 'x')),
  lang        text not null check (lang in ('en', 'es')),
  body        text not null,

  -- Public issue URL with UTMs, exactly as it appears in the post body. Stored
  -- separately so a bad link is greppable without parsing the copy.
  link        text,

  model       text,
  created_at  timestamptz not null default now(),

  constraint social_posts_issue_platform_lang_unique unique (issue_id, platform, lang)
);

create index if not exists social_posts_issue_idx on social_posts (issue_id);

-- Written and read only by the service role (the /api/social-posts route).
-- No anon/authenticated policy is granted, so RLS denies everything else.
-- This copy is unpublished draft marketing material; it has no business being
-- readable from the browser.
alter table social_posts enable row level security;
