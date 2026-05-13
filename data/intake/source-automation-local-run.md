# Source Automation Local Run

- Generated: 2026-05-13T03:52:09.782Z
- Updated: 2026-05-13T03:52:43.300Z
- Status: ready_for_review

## Steps

- required passed: `/opt/homebrew/bin/pnpm sources:automation-run` (10462ms)
- optional passed: `/opt/homebrew/bin/pnpm sources:inspect-instagram` (8453ms)
- optional passed: `/opt/homebrew/bin/pnpm exec node --env-file=.env.local scripts/apply-sql-files.mjs data/intake/instagram-post-observations.sql` (1379ms)
- optional passed: `/opt/homebrew/bin/pnpm sources:promote-observations` (1408ms)
- optional passed: `/opt/homebrew/bin/pnpm exec node --env-file=.env.local scripts/apply-sql-files.mjs data/intake/source-observation-promotions.sql` (1161ms)
- required passed: `/opt/homebrew/bin/pnpm sources:automation-run` (10409ms)
- required passed: `/opt/homebrew/bin/pnpm sources:automation-health` (240ms)

## Summary

- Required failures: 0
- Optional failures: 0
- Passed: 7
- Skipped: 0

## Next Actions

- No local runner action required.
