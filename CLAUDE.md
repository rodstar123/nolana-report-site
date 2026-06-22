# Nolana Report — project rules

Project-specific rules for `nolana-report-site`. Inherits global engineering
discipline from `~/.claude/CLAUDE.md` and agency rules from the monorepo root.

### Timezone (Nolana)

All date/slug/issue logic uses CDT (America/Chicago) via the shared helper.
Never use raw UTC for dates or slugs.
