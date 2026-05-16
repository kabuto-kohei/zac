# Source Automation Local Run

- Generated: 2026-05-16T00:23:34.593Z
- Updated: 2026-05-16T00:28:38.593Z
- Status: ready_for_review

## Steps

- required passed: `/opt/homebrew/bin/pnpm sources:automation-run` (6045ms)
- optional passed: `/opt/homebrew/bin/pnpm sources:inspect-instagram` (288553ms)
- optional passed: `/opt/homebrew/bin/pnpm exec node --env-file=.env.local scripts/apply-sql-files.mjs data/intake/instagram-post-observations.sql` (1347ms)
- optional passed: `/opt/homebrew/bin/pnpm sources:promote-observations` (1226ms)
- optional passed: `/opt/homebrew/bin/pnpm exec node --env-file=.env.local scripts/apply-sql-files.mjs data/intake/source-observation-promotions.sql` (1033ms)
- required passed: `/opt/homebrew/bin/pnpm sources:automation-run` (5579ms)
- required passed: `/opt/homebrew/bin/pnpm sources:automation-health` (210ms)

## Summary

- Required failures: 0
- Optional failures: 0
- Passed: 7
- Skipped: 0

## Next Actions

- No local runner action required.
