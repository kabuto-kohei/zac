# Source Automation Local Run

- Generated: 2026-05-26T09:57:37.407Z
- Updated: 2026-05-26T10:03:03.835Z
- Status: ready_for_review

## Steps

- required passed: `pnpm sources:automation-run` (5190ms)
- optional passed: `pnpm sources:inspect-instagram` (277727ms)
- optional passed: `pnpm exec node --env-file=.env.local scripts/apply-sql-files.mjs data/intake/instagram-post-observations.sql` (805ms)
- optional passed: `pnpm sources:inspect-official-sites` (37065ms)
- optional passed: `pnpm exec node --env-file=.env.local scripts/apply-sql-files.mjs data/intake/official-site-observations.sql` (577ms)
- optional passed: `pnpm sources:promote-observations` (701ms)
- optional passed: `pnpm exec node --env-file=.env.local scripts/apply-sql-files.mjs data/intake/source-observation-promotions.sql` (484ms)
- required passed: `pnpm sources:automation-run` (3648ms)
- required passed: `pnpm sources:automation-health` (222ms)

## Summary

- Required failures: 0
- Optional failures: 0
- Passed: 9
- Skipped: 0

## Next Actions

- No local runner action required.
