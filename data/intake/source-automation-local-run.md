# Source Automation Local Run

- Generated: 2026-05-20T15:39:12.504Z
- Updated: 2026-05-20T15:41:39.589Z
- Status: ready_for_review

## Steps

- required passed: `/opt/homebrew/bin/pnpm sources:automation-run` (5579ms)
- optional passed: `/opt/homebrew/bin/pnpm sources:inspect-instagram` (111663ms)
- optional passed: `/opt/homebrew/bin/pnpm exec node --env-file=.env.local scripts/apply-sql-files.mjs data/intake/instagram-post-observations.sql` (994ms)
- optional passed: `/opt/homebrew/bin/pnpm sources:inspect-official-sites` (18885ms)
- optional passed: `/opt/homebrew/bin/pnpm exec node --env-file=.env.local scripts/apply-sql-files.mjs data/intake/official-site-observations.sql` (1265ms)
- optional passed: `/opt/homebrew/bin/pnpm sources:promote-observations` (1123ms)
- optional passed: `/opt/homebrew/bin/pnpm exec node --env-file=.env.local scripts/apply-sql-files.mjs data/intake/source-observation-promotions.sql` (889ms)
- required passed: `/opt/homebrew/bin/pnpm sources:automation-run` (6455ms)
- required passed: `/opt/homebrew/bin/pnpm sources:automation-health` (221ms)

## Summary

- Required failures: 0
- Optional failures: 0
- Passed: 9
- Skipped: 0

## Next Actions

- No local runner action required.
