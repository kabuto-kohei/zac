# Source Automation Local Run

- Generated: 2026-05-13T15:01:53.442Z
- Updated: 2026-05-13T15:06:14.653Z
- Status: ready_for_review

## Steps

- required passed: `/opt/homebrew/bin/pnpm sources:automation-run` (9684ms)
- optional passed: `/opt/homebrew/bin/pnpm sources:inspect-instagram` (239321ms)
- optional passed: `/opt/homebrew/bin/pnpm exec node --env-file=.env.local scripts/apply-sql-files.mjs data/intake/instagram-post-observations.sql` (3192ms)
- optional passed: `/opt/homebrew/bin/pnpm sources:promote-observations` (1261ms)
- optional passed: `/opt/homebrew/bin/pnpm exec node --env-file=.env.local scripts/apply-sql-files.mjs data/intake/source-observation-promotions.sql` (1512ms)
- required passed: `/opt/homebrew/bin/pnpm sources:automation-run` (6007ms)
- required passed: `/opt/homebrew/bin/pnpm sources:automation-health` (226ms)

## Summary

- Required failures: 0
- Optional failures: 0
- Passed: 7
- Skipped: 0

## Next Actions

- No local runner action required.
