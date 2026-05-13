# Source Automation Run

- Generated: 2026-05-13T15:06:08.656Z
- Updated: 2026-05-13T15:06:14.410Z
- Status: ready_for_review



## Commands

- passed: `curl -I --max-time 10 https://example.com` (170ms, attempt 1)
- passed: `pnpm db:verify:remote` (1213ms, attempt 1)
- passed: `pnpm sources:plan-refresh` (1251ms, attempt 1)
- passed: `pnpm sources:match-instagram` (1062ms, attempt 1)
- passed: `pnpm sources:monitor` (2052ms, attempt 1)

## Summary

- databaseReachable: true
- gyms.total: 192
- gyms.with_instagram: 32
- gyms.official_site_verified: 76
- gyms.directory_only: 116
- eventsByReviewStatus.approved: 31
- eventsByReviewStatus.pending: 4
- scheduledEventsByCategory.competition: 7
- scheduledEventsByCategory.construction: 1
- scheduledEventsByCategory.event: 6
- scheduledEventsByCategory.private_booking: 1
- scheduledEventsByCategory.route_set: 16
- sourceStatus.approved: 100
- sourceStatus.candidate: 95
- sourceType.aggregator_instagram: 1
- sourceType.media_summary: 1
- sourceType.official_instagram: 125
- sourceType.official_site: 67
- sourceType.operator_owned_page: 1
- dueApprovedSources: 64
- instagramPostSources: 14
- approvedSourceRotation: 96
- operatorBatch: 16
- candidateSources: 94
- candidateMatches.candidates: 94
- candidateMatches.gyms: 192
- candidateMatches.matched: 7
- candidateMatches.highConfidence: 2
- candidateMatches.needsReview: 5
- candidateMatches.unmatched: 87
- upcomingEvents: 22
- gymDisciplineCandidates: 119
- closureVerificationCandidates: 80
- publicNetworkReachable: true

## Next Actions

- Inspect official Instagram recent-post queue first (14 source(s)); record post URLs in source_post_observations or reproducible SQL patches.
- Inspect 64 due approved source(s) from inspectNow first.
- Inspect operatorBatch next; it currently has 16 approved source(s).
- Recheck upcomingEventRecheck for items starting within the next 30 days (22 queued).
- Promote candidateVerification only with official-site/profile evidence (94 queued).
- Classify gym disciplines only from official site/SNS evidence; leave directory-only rows as クライミング (119 queued).
- Verify closure, relocation, and rename risk with official evidence first; require two independent current sources if the official source is unavailable (80 queued).
