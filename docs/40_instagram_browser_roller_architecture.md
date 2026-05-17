# Instagram Browser Roller Architecture

## Goal

Zac collects event, competition, route-set, opening-change, and construction
signals from approved official gym Instagram accounts without turning Zac into
an Instagram mirror.

The intended operating split is:

- Automation handles source rotation, browser inspection, deduplication,
  classification, candidate formatting, and health/readiness evidence.
- Admin handles only public publication decisions.
- Users see only Admin-approved calendar and gym information.

## Source Eligibility

The browser roller may inspect only sources that satisfy all conditions:

1. `event_sources.status = 'approved'`.
2. `event_sources.platform = 'instagram'`.
3. `event_sources.source_type = 'official_instagram'`.
4. The source appears in `source-monitor-run.json` under
   `queues.instagramPostInspection`.

Candidate, rejected, paused, aggregator, unknown, or search-discovered accounts
are not eligible for event extraction. They must go through Admin Instagram
review first.

## Runtime Lane

```text
Admin Instagram review
  -> approved official Instagram source
  -> source monitor queue
  -> Instagram browser roller
  -> source_post_observations
  -> source observation promotion
  -> Admin candidate review
  -> public calendar only after approval
```

Official websites remain the stable baseline lane. Instagram is the freshness
lane for gyms that primarily publish updates on Instagram.

## Browser Session

The roller uses a persistent Playwright browser profile:

```text
ZAC_INSTAGRAM_BROWSER_USER_DATA_DIR=.zac-browser/instagram
```

The profile directory is ignored by Git. It may contain browser session state
and must not be copied into commits, artifacts, or logs.

Recommended setup:

1. Use a dedicated Zac operations Instagram account.
2. Run `pnpm sources:instagram-login` and log in manually through the opened
   persistent browser profile.
3. Let the roller reuse that session.
4. If the session itself asks for login, checkpoint, or 2FA, stop the run and
   surface `login_required` or `checkpoint_required` in readiness. If only an
   individual source page triggers a checkpoint, isolate that source as a
   source-level failure and continue the run within the configured budget.

Do not put Instagram email addresses, passwords, cookies, session tokens, or
2FA codes in code, docs, artifacts, commits, or chat.

## Cadence And Scope

Target operating cadence:

- One local automation pass every three hours.
- The browser roller processes a small batch on each pass.
- The daily target is broad coverage by rotation, not a single aggressive
  all-source scrape.

Initial caps:

- `ZAC_INSTAGRAM_POST_SOURCE_LIMIT=25`
- `ZAC_INSTAGRAM_SOURCE_LIMIT=25`
- `ZAC_INSTAGRAM_POSTS_PER_SOURCE=3`
- `ZAC_INSTAGRAM_DUE_HOURS=12`
- `ZAC_INSTAGRAM_BROWSER_SOURCE_DELAY_MS=2500`
- `ZAC_INSTAGRAM_BROWSER_SOURCE_TIMEOUT_MS=60000`
- `ZAC_INSTAGRAM_BROWSER_POST_TIMEOUT_MS=30000`

Scale rule:

- Up to 50 approved gyms: two to three three-hour batches can cover the set.
- 51-100 approved gyms: four three-hour batches cover the set, and the
  remaining daily runs absorb retries and newly due sources.
- 101-200 approved gyms: the eight daily batches can still cover the set once
  per day while reducing checkpoint pressure.
- Over 200 approved gyms: keep important sources in the normal due rotation and
  complete the full set within a 24-48 hour priority rotation.

## Extraction Rules

For each source, the roller opens the profile and reads only the latest visible
post/reel links. It opens only URLs that are not already known in recent
`source_post_observations`.

V1 includes:

- Profile page.
- Latest visible posts.
- Reels that appear as post links.
- Visible post text.
- Visible or parsed posted date when available.
- Source URL and shortcode.

V1 excludes:

- Stories.
- DMs.
- Comments.
- Followers/following lists.
- Full caption storage.
- Image or video storage.
- Password, cookie, or session-token storage.
- Large historical scrolling.

## Candidate Contract

The roller never writes directly to public events. It writes
`source_post_observations`, then the promotion step creates draft/pending event
candidates.

Category shaping is shared with the official-site lane:

- `competition`
- `event`
- `route_set`
- `opening_change`
- `private_booking`
- `construction`
- `notice`
- `recruit`

Calendar-worthy observations are staged with:

- title
- summary
- starts_at / ends_at when extractable
- source URL
- source quote
- extraction confidence
- decision note
- `review_status = pending`

Public visibility is allowed only after Admin candidate review approval.

## Failure Model

Source-level failures must not stop the whole run.

Run-level blocked states:

- `login_required`
- `checkpoint_required` when the browser session itself is blocked
- `browser_unavailable`
- DB write failure

Source-level failures:

- `profile_unavailable`
- `instagram_unavailable`
- `timeout`
- `network`
- `browser_error`
- `checkpoint_required` for an individual profile/post page

Non-failures:

- `no_recent_posts`
- duplicate post URLs
- non-calendar posts recorded as `ignored`

Readiness must expose:

- browser session state
- sources queued / visited / succeeded / failed / deferred
- posts seen
- new posts opened
- duplicate posts skipped
- observations written
- candidates created by the promotion step

## Completion Criteria

The architecture is considered complete only when:

1. `sources:inspect-instagram` uses the browser roller by default.
2. The old direct API inspector is available only as an explicit diagnostic
   command.
3. The monitor passes known post URLs to avoid repeated post detail work.
4. The roller stores only minimal observation data.
5. Admin review remains the only public publication gate.
6. Health/readiness checks include the browser session and roller summary.
7. Credentials and browser profile state are excluded from Git and logs.
8. The local automation lane can run without exposing secrets.
