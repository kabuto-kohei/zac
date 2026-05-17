# Source Automation Run

- Generated: 2026-05-17T07:59:14.872Z
- Updated: 2026-05-17T07:59:20.306Z
- Status: ready_for_review



## Commands

- passed: `curl -I --max-time 10 https://example.com` (172ms, attempt 1)
- passed: `pnpm db:verify:remote` (1051ms, attempt 1)
- passed: `pnpm sources:plan-refresh` (1261ms, attempt 1)
- passed: `pnpm sources:match-instagram` (1053ms, attempt 1)
- passed: `pnpm sources:monitor` (1892ms, attempt 1)

## Summary

- databaseReachable: true
- gyms.total: 192
- gyms.with_instagram: 97
- gyms.official_site_verified: 76
- gyms.directory_only: 116
- eventsByReviewStatus.approved: 48
- eventsByReviewStatus.pending: 2
- eventsByReviewStatus.rejected: 1
- scheduledEventsByCategory.competition: 18
- scheduledEventsByCategory.construction: 1
- scheduledEventsByCategory.event: 10
- scheduledEventsByCategory.opening_change: 1
- scheduledEventsByCategory.private_booking: 2
- scheduledEventsByCategory.route_set: 19
- sourceStatus.approved: 192
- sourceStatus.candidate: 1
- sourceStatus.paused: 3
- sourceType.aggregator_instagram: 9
- sourceType.media_summary: 1
- sourceType.official_instagram: 118
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
- upcomingEvents: 39
- gymDisciplineCandidates: 119
- closureVerificationCandidates: 80
- publicNetworkReachable: true

## Next Actions

- Inspect official Instagram recent-post queue first (48 source(s)); record post URLs in source_post_observations or reproducible SQL patches.
- Inspect 64 due approved source(s) from inspectNow first.
- Inspect operatorBatch next; it currently has 16 approved source(s).
- Recheck upcomingEventRecheck for items starting within the next 30 days (39 queued).
- Classify gym disciplines only from official site/SNS evidence; leave directory-only rows as クライミング (119 queued).
- Verify closure, relocation, and rename risk with official evidence first; require two independent current sources if the official source is unavailable (80 queued).
