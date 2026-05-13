# Source Automation Local Run

- Generated: 2026-05-13T04:14:36.859Z
- Updated: 2026-05-13T04:15:05.783Z
- Status: ready_for_review

## Steps

- required passed: `pnpm sources:automation-run` (6806ms)
- optional passed: `pnpm sources:inspect-instagram` (8365ms)
- optional passed: `pnpm exec node --env-file=.env.local scripts/apply-sql-files.mjs data/intake/instagram-post-observations.sql` (1383ms)
- optional passed: `pnpm sources:promote-observations` (1592ms)
- optional passed: `pnpm exec node --env-file=.env.local scripts/apply-sql-files.mjs data/intake/source-observation-promotions.sql` (1027ms)
- required passed: `pnpm sources:automation-run` (9409ms)
- required passed: `pnpm sources:automation-health` (337ms)

## Summary

- Required failures: 0
- Optional failures: 0
- Passed: 7
- Skipped: 0

## Next Actions

- No local runner action required.
