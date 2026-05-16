# Source Automation Run

- Generated: 2026-05-16T12:05:20.078Z
- Updated: 2026-05-16T12:05:25.899Z
- Status: ready_for_review



## Commands

- passed: `curl -I --max-time 10 https://example.com` (176ms, attempt 1)
- passed: `pnpm db:verify:remote` (1131ms, attempt 1)
- passed: `pnpm sources:plan-refresh` (1145ms, attempt 1)
- passed: `pnpm sources:match-instagram` (1039ms, attempt 1)
- passed: `pnpm sources:monitor` (2326ms, attempt 1)

## Summary

- databaseReachable: true
- gyms.total: 192
- gyms.with_instagram: 97
- gyms.official_site_verified: 76
- gyms.directory_only: 116
- eventsByReviewStatus.approved: 45
- eventsByReviewStatus.pending: 5
- eventsByReviewStatus.rejected: 1
- scheduledEventsByCategory.competition: 16
- scheduledEventsByCategory.construction: 1
- scheduledEventsByCategory.event: 8
- scheduledEventsByCategory.opening_change: 1
- scheduledEventsByCategory.private_booking: 1
- scheduledEventsByCategory.route_set: 18
- sourceStatus.approved: 175
- sourceStatus.candidate: 1
- sourceStatus.paused: 20
- sourceType.aggregator_instagram: 11
- sourceType.media_summary: 1
- sourceType.official_instagram: 116
- sourceType.official_site: 67
- sourceType.operator_owned_page: 1
- dueApprovedSources: 64
- instagramPostSources: 48
- approvedSourceRotation: 96
- operatorBatch: 16
- candidateSources: 0
- candidateMatches.candidates: 0
- candidateMatches.gyms: 192
- candidateMatches.matched: 0
- candidateMatches.highConfidence: 0
- candidateMatches.needsReview: 0
- candidateMatches.unmatched: 0
- upcomingEvents: 35
- gymDisciplineCandidates: 119
- closureVerificationCandidates: 80
- publicNetworkReachable: true

## Next Actions

- Inspect official Instagram recent-post queue first (48 source(s)); record post URLs in source_post_observations or reproducible SQL patches.
- Inspect 64 due approved source(s) from inspectNow first.
- Inspect operatorBatch next; it currently has 16 approved source(s).
- Recheck upcomingEventRecheck for items starting within the next 30 days (35 queued).
- Classify gym disciplines only from official site/SNS evidence; leave directory-only rows as クライミング (119 queued).
- Verify closure, relocation, and rename risk with official evidence first; require two independent current sources if the official source is unavailable (80 queued).
