# Source Automation Local Run

- Generated: 2026-05-17T07:35:55.715Z
- Updated: 2026-05-17T07:38:55.162Z
- Status: ready_for_review

## Steps

- required passed: `pnpm sources:automation-run` (5493ms)
- optional passed: `pnpm sources:inspect-instagram` (110225ms)
- optional passed: `pnpm exec node --env-file=.env.local scripts/apply-sql-files.mjs data/intake/instagram-post-observations.sql` (1315ms)
- optional passed: `pnpm sources:inspect-official-sites` (53587ms)
- optional passed: `pnpm exec node --env-file=.env.local scripts/apply-sql-files.mjs data/intake/official-site-observations.sql` (1123ms)
- optional passed: `pnpm sources:promote-observations` (1194ms)
- optional passed: `pnpm exec node --env-file=.env.local scripts/apply-sql-files.mjs data/intake/source-observation-promotions.sql` (988ms)
- required passed: `pnpm sources:automation-run` (5292ms)
- required passed: `pnpm sources:automation-health` (221ms)

## Summary

- Required failures: 0
- Optional failures: 0
- Passed: 9
- Skipped: 0

## Next Actions

- No local runner action required.
