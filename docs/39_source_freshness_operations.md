# Source Freshness Operations

Zac's core data value is turning public official gym information into calendar
items that help users decide where and when to climb. The pipeline should favor
freshness, evidence, and source links without becoming an Instagram replacement.

## Automation Role

The official-source automation is Zac's data-quality operations layer. Its job
is to keep the gym/event database fresh enough for product use while preserving
legal, source, and review safety. It is responsible for:

- Discovering and rotating official source checks across approved gym/operator
  websites and official Instagram profiles.
- Inspecting approved official Instagram profiles through the browser roller
  and persisting minimal `source_post_observations` so the same post is not
  reprocessed forever.
- Classifying source observations into user-impact groups: event, competition,
  route-set, construction/opening-change, private booking, notice, or recruit.
- Staging eligible future observations as draft/pending event candidates.
- Keeping closures, relocations, renames, and gym-discipline values conservative
  until primary-source evidence is available.
- Producing health/readiness evidence that tells an operator whether the system
  can keep running unattended.

It is not responsible for:

- Billing, purchases, subscriptions, payment settings, or paid data access.
- Republishing Instagram as a product, including copied captions, images,
  videos, comments, DMs, stories, passwords, cookies, or session tokens.
- Guessing gym status, boulder/lead discipline, or event dates without source
  evidence.
- Auto-publishing weak or uncertain event candidates.

The intended unattended outcome is therefore "official-source collection,
deduped observation storage, safe candidate staging, and blocker visibility"
rather than "unreviewed public publication of every extracted post." The final
publication step is handled by the Admin candidate-review surface, which lets an
operator approve or reject staged event candidates with an audit trail.

## Unattended OK Contract

Zac may be considered safe for unattended official-source operation only when
all of the following are true:

1. `pnpm sources:automation-health` exits zero.
2. `pnpm sources:automation-readiness` exits zero.
3. Latest `data/intake/source-automation-run.json` is fresh and
   `status = ready_for_review`.
4. Latest `data/intake/source-automation-local-run.json` is fresh and
   `status = ready_for_review`.
5. LaunchAgent `com.zac.source-freshness` is loaded, configured for the current
   three-hour cadence, and its latest exit code is zero.
6. No stale active automation lock exists.
7. The local runner has no optional step failures. Instagram browser source
   failures may remain in the artifact only when the browser session itself is
   authenticated, the inspection command completed, generated SQL was applied,
   and source-level failures were isolated without stopping the run.
8. Observation promotion remains in `draft_review` mode unless a separate
   reviewed release process explicitly enables approved publishing.
9. Codex cron supervision is active and runs both health and readiness gates.
10. The runbook, artifacts, and history are current enough for a future Codex
    session to resume without private context.
11. Admin candidate review is available at `/event-candidates`, backed by
    `/v1/admin/event-candidates` and `/v1/admin/events/:eventId/review`, so
    staged candidates can be approved or rejected without database surgery.
12. Admin Instagram review is available at `/instagram-review`, backed by
    `/v1/admin/instagram-review-queue`, so sources blocked by Instagram login
    or rate limits can still be reviewed through an operator-confirmed path.
13. Instagram browser roller readiness reports browser session state, visited
    sources, failed/deferred sources, posts seen, duplicate skips, and
    observations created.

If any condition is false, the system is still useful, but it is not
"completely unattended OK"; it is in operator-review mode.

## Operating Model

Zac does not build an alternate Instagram viewer. Instagram is nevertheless the
first freshness signal for most climbing gyms; official websites are the stable
baseline and cross-check source. The operating model has six stages:

1. Register official sites and official Instagram profiles in `event_sources`.
2. Generate review queues from DB state, with official Instagram post checks first.
3. Use the Instagram browser roller on approved official Instagram sources only:
   latest-three freshness first, then bounded backfill only when the latest
   visible posts are already known or the account has no observations yet.
4. Record inspected Instagram post URLs in `source_post_observations`.
5. Promote structured observations into draft/pending event candidates.
6. Reflect only Admin-approved candidates into public `events`.

When an Instagram account has not yet been approved as official, event
extraction must not run. It moves through Admin Instagram review:

1. Open `/instagram-review`.
2. Open the Instagram profile and official website link from the row.
3. Decide whether the Instagram account is operated by the target gym or its
   operator. Good evidence includes an official-site link to the profile,
   matching shop name/address, or consistent operator branding.
4. Record `公式として承認`, `非公式として却下`, or `保留` with a short reason.
5. Use `/event-candidates` or `/events` for event publication work after the
   source itself is confirmed.

This path confirms the source. It does not publish events. Event extraction from
approved sources is handled by the browser roller, and public publication still
requires Admin candidate review.

The public UI may show only title, short summary, category, date/time, source
link, source label, and a minimal short quote. It must not show copied images,
videos, or full Instagram captions.

## Commands

Run the full automation preflight and packet generation:

```bash
pnpm sources:automation-run
```

Inspect the current official Instagram post queue with the browser roller and
generate short observation records:

```bash
pnpm sources:inspect-instagram
```

Run the old direct Instagram JSON API inspector only for diagnostics:

```bash
pnpm sources:inspect-instagram-api
```

Prepare the persistent browser session without sharing a password with Codex:

```bash
pnpm sources:instagram-login
```

Check whether the automation is healthy enough to keep running unattended:

```bash
pnpm sources:automation-health
```

Run the same unattended local pipeline that launchd uses, with a durable
per-step result packet:

```bash
pnpm sources:automation-local
```

The local command executes the remote DB verification, refresh planning, Instagram
candidate matching, and source monitor generation in sequence. It writes:

- `data/intake/source-automation-run.json`
- `data/intake/source-automation-run.md`
- `data/intake/source-automation-history.jsonl`
- `data/intake/source-automation-local-run.json`
- `data/intake/source-automation-local-run.md`
- `data/intake/source-refresh-plan.json`
- `data/intake/instagram-source-match-report.json`
- `data/intake/source-monitor-run.json`
- `data/intake/source-monitor-run.md`

Check whether the full unattended contract is satisfied:

```bash
pnpm sources:automation-readiness
```

This writes the latest readiness evidence to:

- `data/intake/source-automation-readiness.json`
- `data/intake/source-automation-readiness.md`

The automation-run first step is a public web preflight
(`curl -I https://example.com`) so the routine can distinguish real
official-source inspection capacity from stale local artifacts. If public web
access is unavailable, the run must be treated as `blocked` and must not use a
stale packet as a completed freshness pass.

The runner also creates `data/intake/source-automation-run.lock.json` while it
is active. A second run must stop with `blocked` instead of competing for the
Supabase pooler. Locks older than `ZAC_AUTOMATION_LOCK_STALE_MINUTES` are
treated as stale and replaced. Each completed, blocked, or degraded run appends
a compact non-secret record to `data/intake/source-automation-history.jsonl`.

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
official Instagram profiles whose recent visible posts/reels should be reviewed
by the browser roller. The queue includes known post URLs so the roller can open
only unknown posts. The production cadence intentionally uses small three-hour
batches instead of a single all-source scrape, so Instagram checkpoint pressure
stays visible and isolated. Within each source, the roller checks the latest
three visible posts/reels for freshness. If those posts are already known, or if
the account has no observations yet, it scrolls within the profile for the next
unknown posts and stops at the per-source limit, visible-post scan limit, or
60-day lookback.

The monitor accepts optional batch-size environment variables:

- `ZAC_SOURCE_DUE_HOURS`: due threshold for approved sources. Default: `6`.
- `ZAC_INSTAGRAM_DUE_HOURS`: due threshold for official Instagram post checks. Default: `12`.
- `ZAC_INSTAGRAM_POST_SOURCE_LIMIT`: official Instagram browser-roller queue batch size. Default: `25`.
- `ZAC_SOURCE_APPROVED_LIMIT`: approved source rotation size. Default: `96`.
- `ZAC_SOURCE_STALE_LIMIT`: due approved source batch size. Default: `64`.
- `ZAC_SOURCE_CANDIDATE_LIMIT`: candidate source batch size. Default: `96`.
- `ZAC_SOURCE_EVENT_LIMIT`: upcoming event recheck batch size. Default: `120`.
- `ZAC_GYM_DISCIPLINE_LIMIT`: gym discipline verification batch size. Default: `120`.

The automation runner accepts operational environment variables:

- `ZAC_AUTOMATION_COMMAND_ATTEMPTS`: retry attempts per command. Default: `5`.
- `ZAC_AUTOMATION_RETRY_BASE_MS`: quadratic retry base delay. Default: `10000`.
- `ZAC_AUTOMATION_COMMAND_TIMEOUT_MS`: per-command timeout. Default: `120000`.
- `ZAC_AUTOMATION_LOCAL_COMMAND_TIMEOUT_MS`: per-command timeout for the local launchd pipeline. Default: `240000`.
- `ZAC_INSTAGRAM_INSPECTION_STEP_TIMEOUT_MS`: local-run timeout for the Instagram inspection step. Default: `900000`.
- `ZAC_INSTAGRAM_BROWSER_USER_DATA_DIR`: persistent browser profile for the Instagram roller. Default: `.zac-browser/instagram`.
- `ZAC_INSTAGRAM_BROWSER_HEADLESS`: run the roller headless. Default: `true`.
- `ZAC_INSTAGRAM_BROWSER_REQUIRE_AUTH`: require a logged-in browser session before inspection. Default: `true`.
- `ZAC_INSTAGRAM_SOURCE_LIMIT`: maximum Instagram sources the browser inspector opens per run. Default: `25`.
- `ZAC_INSTAGRAM_POSTS_PER_SOURCE`: maximum unknown posts/reels opened per source in one run. Default: `6`.
- `ZAC_INSTAGRAM_FRESHNESS_POST_SCAN_LIMIT`: visible latest posts/reels considered before backfill. Default: `12`.
- `ZAC_INSTAGRAM_LOOKBACK_DAYS`: maximum posted-date age for Instagram backfill. Default: `60`.
- `ZAC_INSTAGRAM_PROFILE_POST_SCAN_LIMIT`: maximum visible profile post/reel links considered per source. Default: `24`.
- `ZAC_INSTAGRAM_PROFILE_SCROLL_LIMIT`: maximum profile scroll attempts per source during backfill. Default: `5`.
- `ZAC_INSTAGRAM_BROWSER_SOURCE_DELAY_MS`: delay between source profile inspections. Default: `2500`.
- `ZAC_INSTAGRAM_BROWSER_SOURCE_TIMEOUT_MS`: source-level browser timeout. Default: `60000`.
- `ZAC_INSTAGRAM_BROWSER_POST_TIMEOUT_MS`: post-level browser timeout. Default: `30000`.
- `ZAC_INSTAGRAM_REQUEST_TIMEOUT_MS`: per-request timeout for Instagram profile fetches. Default: `8000`.
- `ZAC_AUTOMATION_LOCK_STALE_MINUTES`: stale lock threshold. Default: `45`.
- `ZAC_AUTOMATION_DEGRADED_EXIT_ZERO`: set to `1` only when a caller explicitly wants degraded runs to exit zero. Default degraded exit is non-zero.
- `ZAC_AUTOMATION_MAX_CONSECUTIVE_NON_READY`: health-check failure threshold for consecutive blocked/degraded runs. Default: `3`.
- `ZAC_AUTOMATION_EXPECTED_INTERVAL_SECONDS`: expected LaunchAgent interval. Default: `10800`.
- `ZAC_AUTOMATION_MAX_LATEST_RUN_AGE_MINUTES`: maximum acceptable age for the latest automation run. Default: `390`.
- `ZAC_AUTOMATION_MAX_LOCAL_RUN_AGE_MINUTES`: maximum acceptable age for the latest local runner packet. Default: `390`.
- `ZAC_AUTOMATION_REQUIRE_LOCAL_RUN`: set to `0` only for non-launchd development or CI checks. Default: enabled on macOS.
- `ZAC_AUTOMATION_MAX_INSTAGRAM_FAILURE_RATIO`: maximum acceptable failed-source ratio in the latest Instagram inspection. Default: `0.25`.

When no approved source is due, the monitor still emits `operatorBatch` from the
approved-source rotation. Automations should keep processing that batch so the
system does not wait passively for the next due threshold.

## Cadence

Recommended cadence:

- Every 3 hours: verify DB, refresh queues, inspect due official-site sources,
  and run health supervision.
- Twice daily through `ZAC_INSTAGRAM_DUE_HOURS=12`: run the Instagram browser
  roller against approved official Instagram sources.
- Every 6 hours: inspect broader approved official-site rotation and recheck upcoming calendar items.
- Daily: verify candidate Instagram sources and promote only officially confirmed profiles.
- Weekly: backfill missing gym Instagram accounts through official sites, chain pages, and public business profiles.
- Monthly: recheck closure, relocation, rename, and account-change risk.

Codex app automation:

- Name: `Zac official source freshness monitor`
- ID: `zac-official-source-freshness-monitor`
- Interval: every 3 hours after the local launchd pass
- Workspace: `/Users/kkabuto/dev/zac`
- Required first commands for Codex cron:
  1. `pnpm sources:automation-health`
  2. `pnpm sources:automation-readiness`
- Role: read the latest local-run artifacts and report blockers. Do not pretend
  Codex cron performed public-source inspection if its sandbox cannot reach the
  public web.
- Fallback command order when the orchestrator needs manual recovery:
  1. `pnpm db:verify:remote`
  2. `pnpm sources:plan-refresh`
  3. `pnpm sources:match-instagram`
  4. `pnpm sources:monitor`

Local macOS runner:

- LaunchAgent template: `ops/launchd/com.zac.source-freshness.plist`
- Installed path: `~/Library/LaunchAgents/com.zac.source-freshness.plist`
- Program: `scripts/run-source-automation-local.sh`
- Cadence: every 3 hours, plus `RunAtLoad`
- Command order: `pnpm sources:automation-run`, Instagram inspection,
  official-site inspection, safe observation promotion, then
  `pnpm sources:automation-health`
- Logs:
  - `data/intake/source-automation-local.out.log`
  - `data/intake/source-automation-local.err.log`
- Durable local runner packet:
  - `data/intake/source-automation-local-run.json`
  - `data/intake/source-automation-local-run.md`

The local LaunchAgent is the source-fetch execution path because it runs in the
user's normal macOS network context. The Codex app cron remains useful for
reporting and supervision, but it must not be the only source-fetch mechanism
when its sandbox cannot resolve public web hosts.

The local runner delegates to `scripts/run-source-automation-local.mjs`. That
orchestrator records every step, continues to the final health check whenever it
can, and writes a non-secret local-run packet even when a required step fails.
It executes `pnpm sources:inspect-instagram`, applies the generated
`data/intake/instagram-post-observations.sql` only after a successful inspection,
converts eligible pending observations into draft event candidates with
`pnpm sources:promote-observations`, applies
`data/intake/source-observation-promotions.sql` only after successful promotion,
and reruns `sources:automation-run` so the latest queue counts reflect newly
observed posts and newly staged candidates. It then runs the health gate before
marking the local runner ready. The readiness gate is intentionally run by the
supervisor outside the local runner so it can judge a completed local-run packet
instead of inspecting itself mid-run. If the browser session is logged out,
checkpointed, or unavailable, the Instagram browser roller writes a deferred
artifact and exits non-zero so the local runner becomes operator-review work.
Source-level browser failures are isolated to the affected source and retried by
a later run instead of being marked complete. The inspection step has a longer
`ZAC_INSTAGRAM_INSPECTION_STEP_TIMEOUT_MS` budget so it can process a meaningful
batch without stalling the whole LaunchAgent. Readiness may remain green only
when the Instagram browser session is ready, the inspection command completed,
and source-level failures stayed within the documented guardrails.

`pnpm sources:automation-health` now checks more than the latest packet status:
the latest run must be fresh, the local runner packet must be fresh, the
LaunchAgent must be loaded, the previous launchd exit code must be successful,
there must be no active lock, and recent history must not show repeated
non-ready runs. This prevents a stale `ready_for_review` artifact from hiding a
stopped local runner.

The Supabase pooler can hit connection limits if DB commands run in parallel.
Automation must run DB commands sequentially. `sources:automation-run` handles
that sequencing and produces a single run report.

The DB utility scripts perform a short DNS preflight/retry before connecting to
the remote database. If the Supabase pooler returns a transient DNS or network
error such as `ENOTFOUND`, rerun the same command order after the retry window;
do not mark the source queue itself as empty or complete from a failed DB read.
`sources:automation-run` retries transient command failures up to 5 times with a
longer backoff by default, because Supabase pooler DNS can recover after tens of
seconds rather than immediately. Supabase pooler `EMAXCONNSESSION` / max-client
errors are also transient and should be retried instead of being reported as a
final operator blocker.

When remote DB reachability remains blocked but a recent
`data/intake/source-monitor-run.json` exists, `sources:automation-run` writes
`status = degraded_review_ready` only if public web DNS is still reachable. In
that mode automation may continue read-only official-source inspection from the
last-known monitor packet and may prepare reproducible seed/SQL patches, but it
must not run remote DB writes or mark queue work complete until
`pnpm db:verify:remote` passes again. If public web DNS is also unavailable,
the run stays `blocked` and exits non-zero so the failure is visible.

## Browser Roller Review

Rules for the Instagram browser roller and any operator Browser/Computer Use
fallback:

- Open `instagramPostInspection` first. Each row must already be an approved
  official Instagram source.
- Use a persistent logged-in browser profile. If login, 2FA, checkpoint, or
  suspicious-activity UI appears, stop the Instagram run and surface
  `login_required` or `checkpoint_required`.
- Inspect the latest three visible posts/reels first.
- If the latest three are already known, or if the account has no observations
  yet, use bounded backfill: scroll within the profile and open the next unknown
  posts until the per-source limit, visible-post scan limit, or 60-day lookback
  is reached.
- Open only post URLs that are not already known in
  `source_post_observations`.
- Record each reviewed post URL in `source_post_observations`. Calendar-worthy
  posts get classification, title, short summary, dates, and a short quote;
  irrelevant posts get `review_status = ignored` plus a short decision note.
- Then open `sourceUrl` for other approved sources.
- Do not save full post bodies, images, videos, comments, DMs, stories,
  passwords, cookies, or session tokens.
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

For Instagram-derived observations, the first reflection step is safer than
direct publishing:

1. `source_post_observations` stores the reviewed post URL and extracted
   calendar fields.
2. `pnpm sources:promote-observations` converts eligible future observations to
   `events.status = draft` and `events.review_status = pending` by default.
3. The public API serves only `review_status = approved` and non-draft events,
   so operator review is required before a new Instagram-derived candidate
   appears on the calendar.
4. Admin candidate review exposes pending/draft candidates, links back to the
   original source, and records approve/reject decisions through the Admin API.
5. Admin Instagram review confirms whether a candidate Instagram account is an
   official gym/operator source. Event creation remains in the observation
   promotion and `/event-candidates` review path.

Required fields:

- `category`: `competition`, `event`, `route_set`, `opening_change`,
  `private_booking`, `construction`
- `title`
- `summary`
- `starts_at`
- `ends_at`
- `source_url`
- `source_account`
- `source_policy = summary_with_link`
- `review_status`
- `status = scheduled`

Before Admin candidate review, calendar-worthy observations must pass through
the category-specific source-candidate formatter. The formatter owns the shape
of `title`, `summary`, `description`, `capacity_text`, `source_quote`,
`decision_note`, and `extraction_confidence` so Instagram, official-site, and
promotion output stays consistent.

The formatter separates public text from operator text:

- Public `summary`, `description`, and `capacity_text` use a short factual tone:
  official-source based, no hype, no copied caption wording, and no internal
  words such as "candidate" or "Admin".
- Operator `decision_note` states why the item was extracted, which category
  shape was used, which date was detected, and what evidence quote should be
  checked before approval.

Category shapes:

- `competition`: public noun isコンペ・大会情報。Capacity text is申込・定員は公式情報で確認。Review focus is開催日、対象店舗、参加条件、申込要否。
- `event`: public noun isイベント情報。Capacity text is参加条件・申込は公式情報で確認。Review focus is開催日、内容、参加条件。
- `route_set`: public noun isセット・ホールド替え情報。Capacity text is対象エリア・利用制限は公式情報で確認。Review focus is対象エリア、作業期間、利用制限。
- `opening_change`: public noun is営業変更情報。Capacity text is営業時間・営業影響は公式情報で確認。Review focus is変更日、営業時間、休業/短縮営業の範囲。
- `private_booking`: public noun is貸切・利用制限情報。Capacity text is一般利用への影響は公式情報で確認。Review focus is貸切日時、一般利用への影響。
- `construction`: public noun is工事・メンテナンス情報。Capacity text is対象エリア・営業影響は公式情報で確認。Review focus is工事期間、対象エリア、営業影響。

`route_set`, `construction`, `opening_change`, and `private_booking` must not be mixed
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
