# Source Automation Local Run

- Generated: 2026-05-13T08:04:53.174Z
- Updated: 2026-05-13T08:08:44.147Z
- Status: ready_for_review

## Steps

- required passed: `/opt/homebrew/bin/pnpm sources:automation-run` (6974ms)
- optional passed: `/opt/homebrew/bin/pnpm sources:inspect-instagram` (211068ms)
- optional passed: `/opt/homebrew/bin/pnpm exec node --env-file=.env.local scripts/apply-sql-files.mjs data/intake/instagram-post-observations.sql` (1625ms)
- optional passed: `/opt/homebrew/bin/pnpm sources:promote-observations` (1967ms)
- optional passed: `/opt/homebrew/bin/pnpm exec node --env-file=.env.local scripts/apply-sql-files.mjs data/intake/source-observation-promotions.sql` (884ms)
- required passed: `/opt/homebrew/bin/pnpm sources:automation-run` (8177ms)
- required passed: `/opt/homebrew/bin/pnpm sources:automation-health` (271ms)

## Summary

- Required failures: 0
- Optional failures: 0
- Passed: 7
- Skipped: 0

## Next Actions

- No local runner action required.
