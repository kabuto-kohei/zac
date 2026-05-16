# Zac V1 Public Scope

## Goal

Zac V1 is a focused public information product:

- Browse a calendar of climbing gym events, competitions, route setting, opening changes, private bookings, and related official announcements.
- Browse listed gym information.
- Let logged-in users submit information update requests for listed gyms and events.

Social/activity features remain implementation assets for V2 or later, but they
are not part of the V1 public surface.

## V1 User Surface

Public users can:

- Open the event calendar.
- Filter/read event categories such as competitions, route sets, opening changes, and private bookings.
- Open event details with official source links when available.
- Browse listed gyms.
- Open gym details with official website or Instagram links when available.

Logged-in users can additionally:

- Submit gym information update requests.
- Submit event information update requests.
- Submit new event listing requests.
- Report closure, relocation, long-term closure, or source-link issues.

Update requests are review queue items. They do not immediately change public
data.

## V2 Or Later

The following features are intentionally out of V1 public scope:

- Session plans and participation.
- Climbing logs.
- Posts, comments, likes, and saved posts.
- Notifications.
- Personal activity feed.
- Image uploads for posts/logs.
- Broader social graph and recommendations.

Routes may remain in the codebase as V2 assets, but the V1 navigation and direct
entry points should show V2 placeholders instead of active social workflows.

## Admin And Automation Boundary

Admin V1 supports:

- Event creation, editing, and review.
- Event candidate review from source automation.
- Gym status management.
- Update request and report review through the reports queue.
- Audit logs for management actions.

Automation V1 supports:

- Official source collection.
- Instagram observation storage without copied media or full captions.
- Draft/pending event candidate staging.
- Conservative gym/event verification.
- Health and readiness gates.

Public publication still requires Admin review unless a future confidence rule is separately designed and verified.

## Release Criteria

V1 is acceptable when:

- Public navigation focuses on calendar and gym browsing.
- Logged-in update request submission works for gyms and events.
- Admin can see and update request status.
- Source automation health and readiness remain `ok: true`.
- Existing hidden V2 features do not block build, tests, or public browsing.
