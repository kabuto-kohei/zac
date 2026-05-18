# Source Automation Local Run

- Generated: 2026-05-18T15:16:34.205Z
- Updated: 2026-05-18T15:19:07.911Z
- Status: ready_for_review

## Steps

- required passed: `pnpm sources:automation-run` (8601ms)
- optional passed: `pnpm sources:inspect-instagram` (119092ms)
- optional passed: `pnpm exec node --env-file=.env.local scripts/apply-sql-files.mjs data/intake/instagram-post-observations.sql` (1179ms)
- optional passed: `pnpm sources:inspect-official-sites` (13118ms)
- optional passed: `pnpm exec node --env-file=.env.local scripts/apply-sql-files.mjs data/intake/official-site-observations.sql` (1562ms)
- optional passed: `pnpm sources:promote-observations` (1773ms)
- optional passed: `pnpm exec node --env-file=.env.local scripts/apply-sql-files.mjs data/intake/source-observation-promotions.sql` (1140ms)
- required passed: `pnpm sources:automation-run` (6997ms)
- required passed: `pnpm sources:automation-health` (231ms)

## Summary

- Required failures: 0
- Optional failures: 0
- Passed: 9
- Skipped: 0

## Next Actions

- No local runner action required.
