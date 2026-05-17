# Source Automation Local Run

- Generated: 2026-05-17T17:23:40.244Z
- Updated: 2026-05-17T17:27:06.556Z
- Status: ready_for_review

## Steps

- required passed: `/opt/homebrew/bin/pnpm sources:automation-run` (5628ms)
- optional passed: `/opt/homebrew/bin/pnpm sources:inspect-instagram` (125515ms)
- optional passed: `/opt/homebrew/bin/pnpm exec node --env-file=.env.local scripts/apply-sql-files.mjs data/intake/instagram-post-observations.sql` (1364ms)
- optional passed: `/opt/homebrew/bin/pnpm sources:inspect-official-sites` (64804ms)
- optional passed: `/opt/homebrew/bin/pnpm exec node --env-file=.env.local scripts/apply-sql-files.mjs data/intake/official-site-observations.sql` (1137ms)
- optional passed: `/opt/homebrew/bin/pnpm sources:promote-observations` (1164ms)
- optional passed: `/opt/homebrew/bin/pnpm exec node --env-file=.env.local scripts/apply-sql-files.mjs data/intake/source-observation-promotions.sql` (1019ms)
- required passed: `/opt/homebrew/bin/pnpm sources:automation-run` (5450ms)
- required passed: `/opt/homebrew/bin/pnpm sources:automation-health` (221ms)

## Summary

- Required failures: 0
- Optional failures: 0
- Passed: 9
- Skipped: 0

## Next Actions

- No local runner action required.
