# The Nolana Report — Pipeline Operations Manual

Production URL: `nolanareport.com`
Stack: Vercel (cron + serverless) · Supabase (Postgres) · Resend (email) · Anthropic API (Haiku + Opus)
Repo: `nolana-report-site` on GitHub (`rodstar123/nolana-report-site`)

---

## Architecture

```
 ┌──────────────────────────────────────────────────────────────────┐
 │                    Vercel Cron Scheduler                         │
 │  06:00-06:20 CDT daily ─── 5 Agents (Haiku scoring)            │
 │  08:30 CDT Monday ──────── Aggregator (Opus briefing)           │
 │  09:00 CDT daily ────────── Watchdog (health check)             │
 │  Sat 20:00 CDT ──────────── Watchdog (weekly source report)     │
 │  10:00 CDT Monday ──────── Send Briefing (Resend email)         │
 └────────────┬───────────────────────────────────────┬────────────┘
              │                                       │
              ▼                                       ▼
 ┌────────────────────────┐          ┌─────────────────────────────┐
 │    Anthropic API        │          │        Supabase              │
 │  Haiku 4.5 — scoring    │          │  raw_items (ingested news)   │
 │  Opus 4.6 — aggregation │          │  source_health (39 sources)  │
 └────────────────────────┘          │  agent_logs (run telemetry)  │
                                      │  issues (weekly briefings)   │
 ┌────────────────────────┐          │  stories (briefing stories)  │
 │  Full-Text Enrichment   │          │  subscribers (email list)    │
 │  Firecrawl → Bright     │          │  email_log (send tracking)   │
 │  Data → snippet fallback│          └─────────────────────────────┘
 └────────────────────────┘                       │
                                                  ▼
                                      ┌─────────────────────────┐
                                      │   Resend (email)         │
                                      │   from: briefing@mail.   │
                                      │   nationalboco.com       │
                                      └─────────────────────────┘
                                                  │
                                                  ▼
                                      ┌─────────────────────────┐
                                      │   Telegram Alerts        │
                                      │   Instant (score>=95)    │
                                      │   Failures, token cap    │
                                      │   Weekly health report   │
                                      └─────────────────────────┘
```

### Data Flow

1. **Agents 1-5** run daily at 06:00-06:20 CDT, staggered 5 min apart
2. Each agent fetches its assigned sources → normalizes → dedup by URL hash → enriches full text (Firecrawl → Bright Data → snippet) → scores with Haiku → ingests items scoring >= 40 into `raw_items`
3. Items scoring >= 95 trigger instant Telegram alerts
4. **Aggregator** runs Monday 08:30 CDT. Pulls items scoring >= 50 from the last 7 days that haven't been briefed yet. Runs 3-pass dedup (URL exact, Jaccard 0.30, dollar-entity 0.20). Sends to Opus 4.6 for editorial writing. Writes `issues` + `stories` rows
5. **Send Briefing** runs Monday 10:00 CDT. Sends the latest issue to all verified subscribers via Resend
6. **Watchdog** runs daily at 09:00 CDT for health checks, and Saturday 20:00 CDT for the weekly source health report

---

## Cron Schedule

All crons are configured in `vercel.json`. Auth: Vercel sets `x-vercel-cron: 1` header automatically.

| Route                               | Cron (UTC)    | CDT         | Frequency | maxDuration |
| ----------------------------------- | ------------- | ----------- | --------- | ----------- |
| `/api/agents/business-pulse`        | `0 11 * * *`  | 06:00 daily | Daily     | 120s        |
| `/api/agents/gov-watch`             | `5 11 * * *`  | 06:05 daily | Daily     | 120s        |
| `/api/agents/cross-border`          | `10 11 * * *` | 06:10 daily | Daily     | 120s        |
| `/api/agents/community-buzz`        | `15 11 * * *` | 06:15 daily | Daily     | 120s        |
| `/api/agents/industrial-investment` | `20 11 * * *` | 06:20 daily | Daily     | 120s        |
| `/api/aggregator`                   | `30 13 * * 1` | 08:30 Mon   | Weekly    | 300s        |
| `/api/watchdog`                     | `0 14 * * *`  | 09:00 daily | Daily     | 60s         |
| `/api/watchdog`                     | `0 1 * * 0`   | Sat 20:00   | Weekly    | 60s         |
| `/api/send-briefing`                | `0 15 * * 1`  | 10:00 Mon   | Weekly    | default     |

---

## Database Schemas

All pipeline tables use RLS with no public policies — only `service_role` key can read/write.

### `raw_items` — ingested news items

| Column                 | Type                 | Notes                                                                                                                  |
| ---------------------- | -------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `id`                   | UUID (PK)            | auto-generated                                                                                                         |
| `url`                  | TEXT NOT NULL        | original article URL                                                                                                   |
| `url_hash`             | TEXT UNIQUE NOT NULL | SHA256 of `url.trim()` — dedup key                                                                                     |
| `agent`                | TEXT NOT NULL        | `Agent 1` through `Agent 5`                                                                                            |
| `title`                | TEXT NOT NULL        | max 500 chars                                                                                                          |
| `snippet`              | TEXT                 | max 1000 chars                                                                                                         |
| `full_text`            | TEXT                 | enriched article text (max 6000 chars)                                                                                 |
| `fetch_method`         | TEXT                 | `firecrawl`, `bright_data`, or `none`                                                                                  |
| `source_name`          | TEXT                 | human-readable source name                                                                                             |
| `category`             | TEXT                 | `New Open`, `Closing`, `Permit`, `City Council`, `Grant`, `Zoning`, `Tariff`, `Bridge`, `FX`, `Buzz`, `Event`, `Other` |
| `summary`              | TEXT                 | Haiku-generated 2-3 sentence summary                                                                                   |
| `language`             | TEXT                 | `EN` or `ES`                                                                                                           |
| `relevance_score`      | INT (0-100)          | Haiku relevance score                                                                                                  |
| `original_date`        | DATE                 | article publication date                                                                                               |
| `date_spotted`         | TIMESTAMPTZ          | when pipeline ingested it                                                                                              |
| `instant_alerted`      | BOOLEAN              | true if score >= 95                                                                                                    |
| `included_in_briefing` | BOOLEAN              | true after aggregator uses it                                                                                          |
| `created_at`           | TIMESTAMPTZ          | row creation time                                                                                                      |

Indexes: `date_spotted DESC`, `relevance_score DESC`, `agent`, `(included_in_briefing, date_spotted DESC)`

### `source_health` — per-source health tracking

| Column                 | Type          | Notes                                           |
| ---------------------- | ------------- | ----------------------------------------------- |
| `id`                   | UUID (PK)     | auto-generated                                  |
| `agent`                | TEXT NOT NULL | which agent owns this source                    |
| `source_name`          | TEXT NOT NULL | human-readable name                             |
| `source_url`           | TEXT NOT NULL | feed/API URL                                    |
| `status`               | TEXT          | `up` or `down` (down = 3+ consecutive failures) |
| `last_success_at`      | TIMESTAMPTZ   | last successful fetch                           |
| `last_failure_at`      | TIMESTAMPTZ   | last failed fetch                               |
| `consecutive_failures` | INT           | resets to 0 on success                          |
| `last_item_count`      | INT           | items returned on last successful fetch         |
| `last_checked_at`      | TIMESTAMPTZ   | last fetch attempt                              |

Unique constraint: `(agent, source_url)`

### `agent_logs` — per-run telemetry

| Column              | Type                 | Notes                                           |
| ------------------- | -------------------- | ----------------------------------------------- |
| `id`                | UUID (PK)            | auto-generated                                  |
| `agent`             | TEXT NOT NULL        | `Agent 1`-`Agent 5` or `aggregator`             |
| `run_started_at`    | TIMESTAMPTZ NOT NULL |                                                 |
| `run_finished_at`   | TIMESTAMPTZ          |                                                 |
| `sources_attempted` | INT                  | excludes circuit-breaker skips                  |
| `sources_succeeded` | INT                  |                                                 |
| `sources_failed`    | INT                  |                                                 |
| `items_fetched`     | INT                  | after normalization                             |
| `items_new`         | INT                  | after URL hash dedup                            |
| `items_scored`      | INT                  | successfully scored by Haiku                    |
| `items_ingested`    | INT                  | score >= 40, written to raw_items               |
| `tokens_used`       | INT                  | Anthropic API tokens consumed                   |
| `errors`            | JSONB                | array of `{ ts, agent, source, type, message }` |
| `created_at`        | TIMESTAMPTZ          |                                                 |

### Pre-existing tables (not created by migration)

- **`issues`** — weekly briefing issues (slug, title, opening, published_at, stories_count)
- **`stories`** — individual briefing stories (issue_id, headline, summary, why_it_matters, nolana_score, section, source_name, source_url, position, is_free)
- **`subscribers`** — email subscribers (email, tier, email_verified, unsubscribed)
- **`email_log`** — tracks which subscribers received which issues (subscriber_id, issue_id, email_type, resend_id)

---

## Environment Variables

All set in Vercel project settings. Never hardcode these.

| Variable                    | Purpose                                               | Where to get it                                               |
| --------------------------- | ----------------------------------------------------- | ------------------------------------------------------------- |
| `CRON_SECRET`               | Auth token for cron endpoints                         | Generate any strong random string. Set in Vercel env vars     |
| `ANTHROPIC_API_KEY`         | Haiku scoring + Opus aggregation                      | Anthropic Console → API Keys                                  |
| `NEXT_PUBLIC_SUPABASE_URL`  | Supabase project URL                                  | Supabase Dashboard → Settings → API                           |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role (bypasses RLS)                  | Supabase Dashboard → Settings → API → `service_role` (secret) |
| `TELEGRAM_BOT_TOKEN`        | Telegram bot for alerts                               | BotFather → `/newbot`                                         |
| `NOE_TELEGRAM_CHAT_ID`      | Noe's Telegram chat ID                                | Send message to bot, check `getUpdates` API                   |
| `RESEND_API_KEY`            | Email delivery                                        | Resend Dashboard → API Keys                                   |
| `FIRECRAWL_API_KEY`         | Full-text enrichment (optional)                       | Firecrawl Dashboard → API Keys                                |
| `BRIGHT_DATA_API_KEY`       | Full-text fallback (optional)                         | Bright Data Dashboard → API tokens                            |
| `DAILY_TOKEN_CAP`           | Max Anthropic tokens per agent run (default: 250,000) | Set manually if needed                                        |

---

## Manual Trigger Commands

All endpoints require `Authorization: Bearer <CRON_SECRET>` header.

### Run a single agent

```bash
# Agent 1 — Business Pulse
curl -s -H "Authorization: Bearer <CRON_SECRET>" \
  "https://nolanareport.com/api/agents/business-pulse"

# Agent 2 — Gov Watch
curl -s -H "Authorization: Bearer <CRON_SECRET>" \
  "https://nolanareport.com/api/agents/gov-watch"

# Agent 3 — Cross-Border
curl -s -H "Authorization: Bearer <CRON_SECRET>" \
  "https://nolanareport.com/api/agents/cross-border"

# Agent 4 — Community Buzz
curl -s -H "Authorization: Bearer <CRON_SECRET>" \
  "https://nolanareport.com/api/agents/community-buzz"

# Agent 5 — Industrial & Investment
curl -s -H "Authorization: Bearer <CRON_SECRET>" \
  "https://nolanareport.com/api/agents/industrial-investment"
```

### Run the aggregator (generates weekly briefing)

```bash
curl -s -H "Authorization: Bearer <CRON_SECRET>" \
  "https://nolanareport.com/api/aggregator"
```

### Run the watchdog

```bash
curl -s -H "Authorization: Bearer <CRON_SECRET>" \
  "https://nolanareport.com/api/watchdog"
```

### Send the briefing email

```bash
curl -s -X POST -H "Authorization: Bearer <CRON_SECRET>" \
  "https://nolanareport.com/api/send-briefing"
```

### Check health (no auth required)

```bash
curl -s "https://nolanareport.com/api/health"
```

Returns: `{ status, timestamp, todayItems, agentsRanToday, sourcesDown, latestIssue }`

---

## How to Add or Remove a Source

### Adding a source

1. Edit `lib/agents/sources.ts`
2. Add a new entry to the appropriate agent's array:
   ```ts
   { name: "Source Name", url: "https://...", type: "rss" | "json" | "scraper" }
   ```
3. If the source is a JSON API with a non-standard format, add a parser function in `lib/agents/fetcher.ts` and wire it into the `fetchJson` switch block
4. Deploy. The agent will pick it up on its next cron run
5. Monitor `source_health` table to confirm it's fetching successfully

### Removing a source

1. Delete the entry from `lib/agents/sources.ts`
2. Optionally clean up the `source_health` row:
   ```sql
   DELETE FROM source_health WHERE source_name = 'Old Source Name';
   ```
3. Deploy

### Source types

| Type      | Parser               | Notes                                                                                 |
| --------- | -------------------- | ------------------------------------------------------------------------------------- |
| `rss`     | `rss-parser` library | Works for any valid RSS/Atom feed                                                     |
| `json`    | Custom per-API       | Reddit, Federal Register, CBP Bridge Waits, FX Rate each have dedicated parsers       |
| `scraper` | Basic HTML strip     | Fetches page, strips tags. Returns 1 item per page. Good for agenda pages, Eventbrite |

---

## How to Adjust Scoring Thresholds

All thresholds are in the codebase, not env vars. Search for the value and edit.

| Threshold             | Current Value | File                            | What it controls                                      |
| --------------------- | ------------- | ------------------------------- | ----------------------------------------------------- |
| Ingest floor          | `>= 40`       | `lib/agents/runner.ts:168`      | Items below this are discarded after scoring          |
| Instant alert         | `>= 95`       | `lib/agents/runner.ts:163`      | Triggers Telegram instant alert                       |
| Aggregator pool       | `>= 50`       | `lib/agents/aggregator.ts:109`  | Only items scoring 50+ enter the weekly briefing pool |
| Jaccard title dedup   | `0.30`        | `lib/agents/aggregator.ts:147`  | Title similarity threshold for dedup                  |
| Dollar-entity dedup   | `0.20`        | `lib/agents/aggregator.ts:173`  | Jaccard threshold when same dollar amount detected    |
| Bridge delay          | `60 min`      | `lib/agents/fetcher.ts:80`      | Only report bridge waits >= 60 minutes                |
| FX move               | `1.5%`        | `lib/agents/fetcher.ts:109`     | Only report USD/MXN moves >= 1.5%                     |
| Daily token cap       | `250,000`     | `lib/agents/runner.ts:56`       | Max tokens per agent run (env: `DAILY_TOKEN_CAP`)     |
| Full-text truncate    | `6,000 chars` | `lib/agents/normalize.ts:63,93` | Max article text sent to Haiku                        |
| Aggregator pool limit | `100`         | `lib/agents/aggregator.ts:113`  | Max items pulled into aggregator                      |
| Story cap             | `30`          | `lib/agents/aggregator.ts:464`  | Max stories per briefing                              |
| Paywall score cap     | `60`          | `lib/agents/scorer.ts:98`       | Items with no full text capped at 60                  |

---

## Alert Response Guide

Alerts are sent to Noe's Telegram via the bot.

| Alert                                  | Meaning                                             | What to do                                                                                                                          |
| -------------------------------------- | --------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `🚨 RGV Intel — High Priority`         | Item scored >= 95. Major breaking RGV business news | No action needed — informational. Story will appear in next briefing                                                                |
| `⚠️ RGV Intel — [Agent] run unhealthy` | >50% sources failed OR 0 items ingested             | Check `agent_logs` for the run's error array. If a specific source is failing, check `source_health`. May be a temporary API outage |
| `⚠️ RGV Intel — daily token cap hit`   | Agent consumed > 250K tokens in one run             | Check if an unusual number of new items flooded in. Increase `DAILY_TOKEN_CAP` env var if needed                                    |
| `🔴 RGV Intel — Supabase write failed` | Database insert/upsert error                        | Check Supabase dashboard for table issues, quotas, or schema changes                                                                |
| `⚠️ RGV Intel — source degraded`       | Source has 3+ consecutive failures                  | Check the source URL manually. If the source is permanently dead, remove it from `sources.ts`                                       |
| `🔍 Nolana Watchdog — [date]`          | Daily health check found issues                     | Read the specific sub-alerts (zero items, missing agents, down sources, missing briefing)                                           |
| `📊 Weekly Source Health Report`       | Saturday report — all 39 sources status             | Review for sources trending toward failure. Proactive maintenance                                                                   |

---

## Troubleshooting Playbook

### No items ingested today

1. Check `/api/health` — is `todayItems` zero?
2. Check `agent_logs` for today:
   ```sql
   SELECT agent, items_fetched, items_ingested, errors
   FROM agent_logs
   WHERE run_started_at >= now() - interval '1 day'
   ORDER BY run_started_at DESC;
   ```
3. If all agents show 0 items fetched: likely a network issue or all sources are down
4. If items are fetched but 0 ingested: scoring might be failing. Check `errors` JSONB for scoring errors
5. Check `ANTHROPIC_API_KEY` is valid — scoring failures mean 0 ingest

### Agent didn't run

1. Check Vercel Function Logs for the agent's route
2. Verify `CRON_SECRET` env var is set in Vercel
3. Manually trigger the agent (see curl commands above)
4. If the manual trigger times out: the agent may be hitting the 120s limit. Check which sources are slow

### Aggregator produced empty briefing

1. Check pool availability:
   ```sql
   SELECT count(*) FROM raw_items
   WHERE relevance_score >= 50
     AND included_in_briefing = false
     AND date_spotted >= now() - interval '7 days';
   ```
2. If pool is empty: agents may not be scoring items high enough, or all items were already briefed
3. Check `ANTHROPIC_API_KEY` — Opus call may be failing
4. Check Vercel logs for `/api/aggregator` route

### Briefing email not sent

1. Check if an issue was published:
   ```sql
   SELECT id, slug, published_at FROM issues ORDER BY published_at DESC LIMIT 1;
   ```
2. Check if subscribers exist:
   ```sql
   SELECT count(*) FROM subscribers WHERE unsubscribed = false AND email_verified = true;
   ```
3. Check `email_log` for the issue:
   ```sql
   SELECT * FROM email_log WHERE issue_id = '<issue-id>';
   ```
4. Verify `RESEND_API_KEY` is valid

### Source stuck as "down"

A source enters `down` status after 3 consecutive failures. To reset:

```sql
UPDATE source_health
SET status = 'up', consecutive_failures = 0
WHERE source_name = 'Source Name';
```

### High token usage

Check which agents are consuming the most tokens:

```sql
SELECT agent, sum(tokens_used) as total_tokens, count(*) as runs
FROM agent_logs
WHERE run_started_at >= now() - interval '7 days'
GROUP BY agent
ORDER BY total_tokens DESC;
```

---

## Source URLs by Agent

### Agent 1 — Business Pulse (6 sources)

| Source                 | Type | URL                                                                                                                     |
| ---------------------- | ---- | ----------------------------------------------------------------------------------------------------------------------- |
| Google News Business   | RSS  | `https://news.google.com/rss/search?q=("McAllen" OR "RGV" OR "Edinburg" OR "Pharr" OR "Mission" OR "Weslaco") business` |
| McAllen City           | RSS  | `https://news.google.com/rss/search?q="City of McAllen" council OR permit OR development`                               |
| The Monitor            | RSS  | `https://news.google.com/rss/search?q="The Monitor" McAllen OR RGV OR Edinburg`                                         |
| MyRGV                  | RSS  | `https://myrgv.com/feed/`                                                                                               |
| Valley Business Report | RSS  | `https://valleybusinessreport.com/feed/`                                                                                |
| Texas Border Business  | RSS  | `https://texasborderbusiness.com/feed/`                                                                                 |

### Agent 2 — Gov & Economic Watch (12 sources)

| Source               | Type    | URL                                                                                                                           |
| -------------------- | ------- | ----------------------------------------------------------------------------------------------------------------------------- |
| GN Gov               | RSS     | `https://news.google.com/rss/search?q=("McAllen" OR "RGV") ("city council" OR "grant" OR "zoning" OR "economic development")` |
| Federal Register API | JSON    | `https://www.federalregister.gov/api/v1/articles.json?conditions[term]=Hidalgo+County+McAllen`                                |
| McAllen Agendas      | Scraper | `https://mcallen.net/government/city-council/agendas`                                                                         |
| Hidalgo County RSS   | RSS     | `https://www.hidalgocounty.us/RSSFeed.aspx?ModID=1`                                                                           |
| McAllen EDC          | RSS     | `https://news.google.com/rss/search?q="McAllen Economic Development" OR "MEDC" McAllen Texas`                                 |
| TX Comptroller       | RSS     | `https://public.govdelivery.com/topics/TXCOMPT_1/feed.rss`                                                                    |
| Cameron County       | RSS     | `https://news.google.com/rss/search?q="Cameron County" commissioners OR budget OR grant Texas`                                |
| City of Edinburg     | RSS     | `https://news.google.com/rss/search?q="City of Edinburg" council OR development Texas`                                        |
| City of Pharr        | RSS     | `https://news.google.com/rss/search?q="City of Pharr" council OR development Texas`                                           |
| City of Mission      | RSS     | `https://news.google.com/rss/search?q="City of Mission" Texas council OR development`                                         |
| TWC RGV              | RSS     | `https://news.google.com/rss/search?q=site:twc.texas.gov RGV OR "Rio Grande Valley"`                                          |
| LRGVDC               | RSS     | `https://news.google.com/rss/search?q="LRGVDC" OR "Lower Rio Grande Valley Development Council"`                              |

### Agent 3 — Cross-Border & Trade (7 sources)

| Source               | Type | URL                                                                                                                                         |
| -------------------- | ---- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| CBP Bridge Waits     | JSON | `https://bwt.cbp.gov/api/bwtnew`                                                                                                            |
| USD/MXN FX           | JSON | `https://open.er-api.com/v6/latest/USD`                                                                                                     |
| Brownsville Herald   | RSS  | `https://news.google.com/rss/search?q="Brownsville Herald" business OR trade OR investment`                                                 |
| Rio Grande Guardian  | RSS  | `https://news.google.com/rss/search?q=site:riograndeguardian.com`                                                                           |
| RGV Business Journal | RSS  | `https://www.rgvbusinessjournal.com/feed/`                                                                                                  |
| Port of Brownsville  | RSS  | `https://www.portofbrownsville.com/feed/`                                                                                                   |
| GN RGV Trade         | RSS  | `https://news.google.com/rss/search?q="Rio Grande Valley" OR "McAllen" OR "RGV" investment OR "trade zone" OR nearshoring OR manufacturing` |

### Agent 4 — Community Buzz (6 sources)

| Source               | Type    | URL                                                                                                     |
| -------------------- | ------- | ------------------------------------------------------------------------------------------------------- |
| Reddit r/RGV         | JSON    | `https://www.reddit.com/r/RGV.json?sort=new&limit=50`                                                   |
| KRGV                 | RSS     | `https://news.google.com/rss/search?q=site:krgv.com RGV business OR community`                          |
| Eventbrite McAllen   | Scraper | `https://www.eventbrite.com/d/tx--mcallen/business/`                                                    |
| old.reddit fallback  | Scraper | `https://old.reddit.com/r/rgv/new/`                                                                     |
| ValleyCentral        | RSS     | `https://www.valleycentral.com/feed/`                                                                   |
| McAllen City News GN | RSS     | `https://news.google.com/rss/search?q=McAllen Texas city news OR community event OR local announcement` |

### Agent 5 — Industrial & Investment (8 sources)

| Source                 | Type | URL                                                                                            |
| ---------------------- | ---- | ---------------------------------------------------------------------------------------------- |
| Edinburg EDC           | RSS  | `https://news.google.com/rss/search?q="Edinburg EDC" OR "Edinburg Economic Development" Texas` |
| McAllen EDC            | RSS  | `https://news.google.com/rss/search?q="McAllen EDC" OR "McAllen Economic Development"`         |
| Pharr EDC              | RSS  | `https://news.google.com/rss/search?q="Pharr EDC" OR "Pharr Economic Development"`             |
| Mission EDC            | RSS  | `https://news.google.com/rss/search?q="Mission EDC" OR "Mission Economic Development" Texas`   |
| Port of Brownsville    | RSS  | `https://news.google.com/rss/search?q="Port of Brownsville" OR "Brownsville port"`             |
| SpaceflightNow         | RSS  | `https://spaceflightnow.com/feed/`                                                             |
| Valley Business Report | RSS  | `https://valleybusinessreport.com/feed/`                                                       |
| Texas Border Business  | RSS  | `https://texasborderbusiness.com/feed/`                                                        |

---

## Key Code Locations

| Module        | Path                                                     | Purpose                                               |
| ------------- | -------------------------------------------------------- | ----------------------------------------------------- |
| Agent runner  | `lib/agents/runner.ts`                                   | Full fetch→score→store orchestration loop             |
| Sources       | `lib/agents/sources.ts`                                  | All 39 source URLs and configs                        |
| Fetcher       | `lib/agents/fetcher.ts`                                  | RSS/JSON/scraper parsers + retry logic                |
| Normalizer    | `lib/agents/normalize.ts`                                | 7-day recency filter, URL dedup, full-text enrichment |
| Scorer        | `lib/agents/scorer.ts`                                   | Haiku API calls, score parsing, prompt template       |
| Writer        | `lib/agents/writer.ts`                                   | Supabase writes, URL hash, circuit breaker            |
| Alerter       | `lib/agents/alerter.ts`                                  | Telegram alerts (instant, run, token cap, DB failure) |
| Aggregator    | `lib/agents/aggregator.ts`                               | 3-pass dedup, Opus prompt, briefing writer            |
| Types         | `lib/agents/types.ts`                                    | TypeScript interfaces for the entire pipeline         |
| Migration SQL | `supabase/migrations/20260527000001_ingestion_layer.sql` | Table definitions                                     |
| Cron config   | `vercel.json`                                            | All cron schedules and function timeouts              |

---

## Models

| Model            | Model ID                    | Used by    | Purpose                                      |
| ---------------- | --------------------------- | ---------- | -------------------------------------------- |
| Claude Haiku 4.5 | `claude-haiku-4-5-20251001` | Agents 1-5 | Scoring items 0-100, categorization, summary |
| Claude Opus 4.6  | `claude-opus-4-6`           | Aggregator | Editorial writing of the weekly briefing     |
