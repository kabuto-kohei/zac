# Source Freshness Operations

Zac's core data value is turning public official gym information into calendar
items that help users decide where and when to climb. The pipeline should favor
freshness, evidence, and source links without becoming an Instagram replacement.

## Operating Model

Zac does not build an alternate Instagram viewer. Instagram is nevertheless the
first freshness signal for most climbing gyms; official websites are the stable
baseline and cross-check source. The operating model has five stages:

1. Register official sites and official Instagram profiles in `event_sources`.
2. Generate review queues from DB state, with official Instagram post checks first.
3. Use Browser/Computer Use or a normal browser to inspect public official pages.
4. Record inspected Instagram post URLs in `source_post_observations`.
5. Reflect only confirmed updates into `events` / `gyms` as structured data.

The public UI may show only title, short summary, category, date/time, source
link, source label, and a minimal short quote. It must not show copied images,
videos, or full Instagram captions.

## Commands

Run the full automation preflight and packet generation:

```bash
pnpm sources:automation-run
```

This command executes the remote DB verification, refresh planning, Instagram
candidate matching, and source monitor generation in sequence. It writes:

- `data/intake/source-automation-run.json`
- `data/intake/source-automation-run.md`
- `data/intake/source-refresh-plan.json`
- `data/intake/instagram-source-match-report.json`
- `data/intake/source-monitor-run.json`
- `data/intake/source-monitor-run.md`

Verify remote DB reachability and counts:

```bash
pnpm db:verify:remote
```

Generate broad refresh queues:

```bash
pnpm sources:plan-refresh
```

Match Instagram candidates against the gym DB:

```bash
pnpm sources:match-instagram
```

Generate the automation packet:

```bash
pnpm sources:monitor
```

`sources:monitor` generates:

- `data/intake/source-monitor-run.json`
- `data/intake/source-monitor-run.md`

These files list official sources to inspect, candidate sources to verify, and
upcoming events to recheck. They do not fetch external post bodies or media.
The highest-priority queue is `instagramPostInspection`, which lists approved
official Instagram profiles whose recent public posts/reels should be reviewed.

The monitor accepts optional batch-size environment variables:

- `ZAC_SOURCE_DUE_HOURS`: due threshold for approved sources. Default: `6`.
- `ZAC_INSTAGRAM_DUE_HOURS`: due threshold for official Instagram post checks. Default: `1`.
- `ZAC_INSTAGRAM_POST_SOURCE_LIMIT`: official Instagram post-check batch size. Default: `48`.
- `ZAC_SOURCE_APPROVED_LIMIT`: approved source rotation size. Default: `96`.
- `ZAC_SOURCE_STALE_LIMIT`: due approved source batch size. Default: `64`.
- `ZAC_SOURCE_CANDIDATE_LIMIT`: candidate source batch size. Default: `96`.
- `ZAC_SOURCE_EVENT_LIMIT`: upcoming event recheck batch size. Default: `120`.
- `ZAC_GYM_DISCIPLINE_LIMIT`: gym discipline verification batch size. Default: `120`.

When no approved source is due, the monitor still emits `operatorBatch` from the
approved-source rotation. Automations should keep processing that batch so the
system does not wait passively for the next due threshold.

## Cadence

Recommended cadence:

- Hourly quick pulse: verify DB and inspect `instagramPostInspection` first.
- Every 6 hours: inspect broader approved official Instagram/site rotation and recheck upcoming calendar items.
- Daily: verify candidate Instagram sources and promote only officially confirmed profiles.
- Weekly: backfill missing gym Instagram accounts through official sites, chain pages, and public business profiles.
- Monthly: recheck closure, relocation, rename, and account-change risk.

Codex app automation:

- Name: `Zac official source freshness monitor`
- ID: `zac-official-source-freshness-monitor`
- Interval: hourly after the cleanup pass
- Workspace: `/Users/kkabuto/dev/zac`
- Required first command: `pnpm sources:automation-run`
- Fallback command order when the orchestrator needs manual recovery:
  1. `pnpm db:verify:remote`
  2. `pnpm sources:plan-refresh`
  3. `pnpm sources:match-instagram`
  4. `pnpm sources:monitor`

The Supabase pooler can hit connection limits if DB commands run in parallel.
Automation must run DB commands sequentially. `sources:automation-run` handles
that sequencing and produces a single run report.

The DB utility scripts perform a short DNS preflight/retry before connecting to
the remote database. If the Supabase pooler returns a transient DNS or network
error such as `ENOTFOUND`, rerun the same command order after the retry window;
do not mark the source queue itself as empty or complete from a failed DB read.
`sources:automation-run` retries transient command failures up to 5 times with a
longer backoff by default, because Supabase pooler DNS can recover after tens of
seconds rather than immediately.

When remote DB reachability remains blocked but a recent
`data/intake/source-monitor-run.json` exists, `sources:automation-run` writes
`status = degraded_review_ready` instead of stopping the whole routine. In that
mode automation may continue read-only official-source inspection from the
last-known monitor packet and may prepare reproducible seed/SQL patches, but it
must not run remote DB writes or mark queue work complete until
`pnpm db:verify:remote` passes again.

## Computer Use Review

Rules for Browser/Computer Use:

- Open `instagramPostInspection` first. For each approved official Instagram
  source, inspect recent public posts/reels since the last observation.
- Record each reviewed post URL in `source_post_observations`. Calendar-worthy
  posts get classification, title, short summary, dates, and a short quote;
  irrelevant posts get `review_status = ignored` plus a short decision note.
- Then open `sourceUrl` for other approved sources.
- Do not save full post bodies, images, or videos.
- Extract only event name, date/time, location, category, booking requirement, and source URL.
- Keep uncertain extraction as `events.review_status = pending` and do not publish it.
- For multi-day events, route sets, and construction, mark only the start date on the calendar and show the full period on the detail page.
- For closure, relocation, and rename checks, prefer official notices. If the
  official source is unavailable or removed, require two independent current
  sources before setting a gym to `status = closed`. Partial evidence stays
  `published` and remains queued for recheck.

## Reflection Path

Confirmed events should be reflected through reproducible seeds or explicit SQL
patches.

Required fields:

- `category`: `competition`, `event`, `lesson`, `route_set`, `notice`, `recruit`
- `title`
- `summary`
- `starts_at`
- `ends_at`
- `source_url`
- `source_account`
- `source_policy = summary_with_link`
- `review_status`
- `status = scheduled`

`route_set`, `notice`, `construction`, and `opening-change` must not be mixed
with competitions or general events in UI. They belong in the set/operations
group.

Inspected Instagram posts should be reflected in `source_post_observations`
even when no public event is created. This keeps the next automation run from
repeating the same post and creates an audit trail of what was considered.
Only store source URL, post date when visible, classification, short summary,
short quote, review status, and decision note.

Confirmed gym closure or active-status corrections should be reflected through
reproducible seeds or explicit SQL patches. `status = closed` hides the gym from
public listing while preserving the record and its evidence. Do not use
`deleted_at` for ordinary closure handling unless there is a separate data
deletion reason.

## Long-Term Guardrails

- Prefer official APIs or direct gym/operator feeds over Browser/Computer Use.
- Do not depend on large-scale unofficial Instagram scraping.
- Do not auto-publish uncertain extraction. Use pending review.
- Every reflected item must retain a source link.
