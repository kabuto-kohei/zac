# Source Automation Local Run

- Generated: 2026-05-17T07:57:11.303Z
- Updated: 2026-05-17T07:59:20.531Z
- Status: ready_for_review

## Steps

- required passed: `pnpm sources:automation-run` (5809ms)
- optional passed: `pnpm sources:inspect-instagram` (110634ms)
- optional passed: `pnpm exec node --env-file=.env.local scripts/apply-sql-files.mjs data/intake/instagram-post-observations.sql` (1140ms)
- optional passed: `pnpm sources:inspect-official-sites` (2568ms)
- optional passed: `pnpm exec node --env-file=.env.local scripts/apply-sql-files.mjs data/intake/official-site-observations.sql` (1008ms)
- optional passed: `pnpm sources:promote-observations` (1224ms)
- optional passed: `pnpm exec node --env-file=.env.local scripts/apply-sql-files.mjs data/intake/source-observation-promotions.sql` (955ms)
- required passed: `pnpm sources:automation-run` (5669ms)
- required passed: `pnpm sources:automation-health` (213ms)

## Summary

- Required failures: 0
- Optional failures: 0
- Passed: 9
- Skipped: 0

## Next Actions

- No local runner action required.
