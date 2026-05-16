# Zac V1 Controlled Launch Runbook

## Purpose

Use this runbook when opening Zac V1 to a small controlled audience. V1 is not a
broad social app launch; it is an information product launch for:

- Event calendar browsing.
- Listed gym browsing.
- Logged-in information update requests.
- Admin review of update requests and event candidates.
- Official-source automation supervision.

Billing, purchase, subscription, payment settings, and secret-management changes
are outside this runbook.

## Launch Readiness Gate

Run these checks before sharing the V1 URL:

```sh
pnpm check
pnpm db:verify:remote
pnpm sources:automation-health
pnpm sources:automation-readiness
pnpm v1:launch-smoke
```

Required result:

- `pnpm check` passes.
- Remote DB is reachable and reports non-zero gyms/events.
- Source automation health is `ok: true`.
- Source automation readiness is `ok: true`.
- V1 launch smoke is `ok: true`.
- API, Web, and Admin production aliases are the canonical URLs.

Canonical URLs:

- API: `https://zac-api.vercel.app`
- Web: `https://zac-web.vercel.app`
- Admin: `https://zac-admin.vercel.app`

## Manual Browser Checks

Use a normal browser before inviting the first users:

1. Open `https://zac-web.vercel.app/`.
2. Confirm the first screen is the event calendar, not a social feed.
3. Open a listed event detail.
4. Confirm the event shows source information when available.
5. Open `https://zac-web.vercel.app/explore`.
6. Search for a known gym and open its detail.
7. Open update request from a gym or event detail.
8. Confirm unauthenticated users see the login requirement.
9. Log in with a controlled test user and submit one harmless update request.
10. Open Admin `/reports` and confirm the request is visible.
11. Mark the request `reviewing` or `resolved` and confirm the action succeeds.

Do not paste access tokens, user emails, UUIDs, or request bodies into chat or
public logs.

## Controlled Audience

Start with a small group:

- 3 to 10 trusted climbers or operators.
- Share the Web URL only.
- Ask them to browse events/gyms and submit corrections.
- Do not present V2 social/activity features as available.

Collect feedback in these buckets:

- Missing event.
- Wrong event date/time.
- Wrong gym address or official link.
- Missing Instagram/website source.
- Closure, relocation, or long-term closure.
- Calendar usability issue.
- Search/usability issue.

## Daily Operations During First Week

Run once per day:

```sh
pnpm db:verify:remote
pnpm sources:automation-health
pnpm sources:automation-readiness
pnpm v1:launch-smoke
```

Admin review:

- Review `/reports` for user-submitted update requests.
- Review `/event-candidates` for automation-staged event candidates.
- Approve only items backed by official evidence.
- Reject or leave pending weak evidence.
- Keep copied Instagram captions/images/videos out of public output.

## Stop Rules

Pause sharing the V1 URL if any of these happen:

- API health is not HTTP 200.
- Source automation health or readiness is not `ok: true`.
- Public pages show draft/pending/rejected event candidates.
- Admin cannot review update requests.
- Users report private/auth data exposure.
- Repeated update requests cannot be saved.
- Production deploy or DB state is uncertain.

Recovery path:

1. Stop inviting new users.
2. Preserve evidence without printing secrets.
3. Re-run the launch readiness gate.
4. Check the latest deploys and source automation artifacts.
5. Revert the last target commit and redeploy if the regression is code-related.

## What V1 Must Not Promise

Do not promise these until V2 or later:

- Personal climbing logs.
- Session planning or participation.
- Posts, comments, likes, or follows.
- Notifications.
- Gym-owner self-service management.
- Fully automatic publication from Instagram.
- Complete coverage of every gym and every event.
