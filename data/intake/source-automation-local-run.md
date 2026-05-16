# Source Automation Local Run

- Generated: 2026-05-16T09:06:22.922Z
- Updated: 2026-05-16T09:12:37.719Z
- Status: ready_for_review

## Steps

- required passed: `/opt/homebrew/bin/pnpm sources:automation-run` (7462ms)
- optional passed: `/opt/homebrew/bin/pnpm sources:inspect-instagram` (357880ms)
- optional passed: `/opt/homebrew/bin/pnpm exec node --env-file=.env.local scripts/apply-sql-files.mjs data/intake/instagram-post-observations.sql` (1158ms)
- optional passed: `/opt/homebrew/bin/pnpm sources:promote-observations` (1127ms)
- optional passed: `/opt/homebrew/bin/pnpm exec node --env-file=.env.local scripts/apply-sql-files.mjs data/intake/source-observation-promotions.sql` (1226ms)
- required passed: `/opt/homebrew/bin/pnpm sources:automation-run` (5723ms)
- required passed: `/opt/homebrew/bin/pnpm sources:automation-health` (214ms)

## Summary

- Required failures: 0
- Optional failures: 0
- Passed: 7
- Skipped: 0

## Next Actions

- No local runner action required.
