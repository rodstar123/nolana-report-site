-- Chunked Spanish translation: staging table + atomic publish.
--
-- Why: the single-call translator was killed by the 300s function ceiling on
-- any issue past ~34k source chars (confirmed 2026-09-12 — 2026-07-27 returned
-- FUNCTION_INVOCATION_TIMEOUT at 300.31s), which silently cost four issues
-- their Spanish edition. Translation now runs as ~29 parallel chunks.
--
-- Nothing here writes to the live *_es columns. Chunks land in staging, and
-- publish_translation() promotes them in ONE transaction only once every chunk
-- for the issue has succeeded. A partial failure therefore leaves the issue
-- exactly as it was: no Spanish, and no half-translated state.

create table if not exists translation_chunks (
  id              uuid primary key default gen_random_uuid(),
  issue_id        uuid not null references issues (id) on delete cascade,

  -- 'chrome' or 'story:<story uuid>'. One row per chunk per issue; the unique
  -- constraint below is what makes every write an idempotent upsert and what
  -- makes a retry resumable.
  chunk_key       text not null,
  chunk_kind      text not null check (chunk_kind in ('chrome', 'story')),
  story_id        uuid references stories (id) on delete cascade,

  -- Groups one attempt, so a run can report on exactly what it did.
  run_id          uuid not null,
  status          text not null default 'pending'
                    check (status in ('pending', 'ok', 'failed')),

  -- Translated fields for this chunk. Shape mirrors the *_es columns it will
  -- be copied into. Null until the chunk succeeds.
  payload         jsonb,
  error           jsonb,

  -- Hash of the ENGLISH source this translation was made from. If the English
  -- is edited afterwards the hash stops matching and the chunk is re-planned,
  -- so stale Spanish can never be published over fresh English.
  source_hash     text,
  source_chars    integer,
  output_tokens   integer,
  duration_ms     integer,
  attempt         integer not null default 1,

  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),

  constraint translation_chunks_issue_key_unique unique (issue_id, chunk_key)
);

create index if not exists translation_chunks_issue_status_idx
  on translation_chunks (issue_id, status);

-- Staging rows are written only by the service role (the translator route).
-- No anon/authenticated policy is granted, so RLS denies everything else.
alter table translation_chunks enable row level security;

/**
 * Promote a fully-translated issue from staging into the live *_es columns.
 *
 * Runs as one transaction: either every field lands or none does. The
 * completeness check is repeated INSIDE the function rather than trusted from
 * the caller, so a concurrent run or a caller bug cannot publish a partial set.
 *
 * Returns the number of stories updated. Raises if the chunk set is incomplete.
 */
-- Deliberately takes only the issue: it publishes whatever is 'ok' for that
-- issue regardless of which run produced it. Filtering by run_id would break
-- resumability, since a resumed attempt legitimately mixes chunks translated
-- by an earlier run with the ones it just retried.
create or replace function publish_translation(
  p_issue_id uuid
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_expected_stories integer;
  v_ok_stories       integer;
  v_ok_chrome        integer;
  v_chrome           jsonb;
  v_updated          integer := 0;
begin
  select count(*) into v_expected_stories
    from stories where issue_id = p_issue_id;

  select count(*) into v_ok_stories
    from translation_chunks
    where issue_id = p_issue_id and chunk_kind = 'story' and status = 'ok';

  select count(*) into v_ok_chrome
    from translation_chunks
    where issue_id = p_issue_id and chunk_kind = 'chrome' and status = 'ok';

  if v_ok_chrome <> 1 then
    raise exception 'publish_translation: chrome chunk not ready for issue %', p_issue_id;
  end if;

  if v_ok_stories <> v_expected_stories then
    raise exception
      'publish_translation: % of % story chunks ready for issue %',
      v_ok_stories, v_expected_stories, p_issue_id;
  end if;

  select payload into v_chrome
    from translation_chunks
    where issue_id = p_issue_id and chunk_kind = 'chrome' and status = 'ok';

  -- coalesce(...) keeps an existing value when a field was legitimately absent
  -- from the source (the translator skips empty fields rather than inventing
  -- them), instead of blanking a column that already had content.
  update issues set
    title_es                = coalesce(v_chrome ->> 'title', title_es),
    headline_es             = coalesce(v_chrome ->> 'headline', headline_es),
    opening_es              = coalesce(v_chrome ->> 'opening', opening_es),
    owners_move_es          = coalesce(v_chrome ->> 'owners_move', owners_move_es),
    risk_radar_es           = coalesce(v_chrome ->> 'risk_radar', risk_radar_es),
    thinking_question_es    = coalesce(v_chrome ->> 'thinking_question', thinking_question_es),
    before_you_go_es        = coalesce(v_chrome ->> 'before_you_go', before_you_go_es),
    business_temperature_es = coalesce(v_chrome ->> 'business_temperature', business_temperature_es),
    valley_money_map_es     = coalesce(v_chrome ->> 'valley_money_map', valley_money_map_es),
    three_moves_es          = coalesce(v_chrome ->> 'three_moves', three_moves_es),
    quiet_signal_es         = coalesce(v_chrome ->> 'quiet_signal', quiet_signal_es),
    breathers_es            = coalesce(v_chrome -> 'breathers', breathers_es)
  where id = p_issue_id;

  update stories s set
    headline_es       = coalesce(c.payload ->> 'headline', s.headline_es),
    signal_es         = coalesce(c.payload ->> 'signal', s.signal_es),
    why_it_matters_es = coalesce(c.payload ->> 'why_it_matters', s.why_it_matters_es),
    smart_move_es     = coalesce(c.payload ->> 'smart_move', s.smart_move_es),
    nolana_take_es    = coalesce(c.payload ->> 'nolana_take', s.nolana_take_es),
    summary_es        = coalesce(c.payload ->> 'summary', s.summary_es),
    who_should_act_es = coalesce(
      case
        when c.payload ? 'who_should_act'
        then (select array_agg(value)
                from jsonb_array_elements_text(c.payload -> 'who_should_act'))
        else null
      end,
      s.who_should_act_es
    )
  from translation_chunks c
  where c.issue_id = p_issue_id
    and c.chunk_kind = 'story'
    and c.status = 'ok'
    and c.story_id = s.id;

  get diagnostics v_updated = row_count;
  return v_updated;
end;
$$;
