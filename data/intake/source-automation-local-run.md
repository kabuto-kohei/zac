# Source Automation Local Run

- Generated: 2026-05-16T15:05:26.398Z
- Updated: 2026-05-16T15:09:38.077Z
- Status: ready_for_review

## Steps

- required passed: `/opt/homebrew/bin/pnpm sources:automation-run` (18129ms)
- optional passed: `/opt/homebrew/bin/pnpm sources:inspect-instagram` (117000ms)
- optional passed: `/opt/homebrew/bin/pnpm exec node --env-file=.env.local scripts/apply-sql-files.mjs data/intake/instagram-post-observations.sql` (1380ms)
- optional passed: `/opt/homebrew/bin/pnpm sources:inspect-official-sites` (96030ms)
- optional passed: `/opt/homebrew/bin/pnpm exec node --env-file=.env.local scripts/apply-sql-files.mjs data/intake/official-site-observations.sql` (1546ms)
- optional passed: `/opt/homebrew/bin/pnpm sources:promote-observations` (2863ms)
- optional passed: `/opt/homebrew/bin/pnpm exec node --env-file=.env.local scripts/apply-sql-files.mjs data/intake/source-observation-promotions.sql` (1235ms)
- required passed: `/opt/homebrew/bin/pnpm sources:automation-run` (13281ms)
- required passed: `/opt/homebrew/bin/pnpm sources:automation-health` (202ms)

## Summary

- Required failures: 0
- Optional failures: 0
- Passed: 9
- Skipped: 0

## Next Actions

- No local runner action required.
