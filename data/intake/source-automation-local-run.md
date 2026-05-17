# Source Automation Local Run

- Generated: 2026-05-17T00:14:53.987Z
- Updated: 2026-05-17T00:17:03.576Z
- Status: ready_for_review

## Steps

- required passed: `/opt/homebrew/bin/pnpm sources:automation-run` (6442ms)
- optional passed: `/opt/homebrew/bin/pnpm sources:inspect-instagram` (109658ms)
- optional passed: `/opt/homebrew/bin/pnpm exec node --env-file=.env.local scripts/apply-sql-files.mjs data/intake/instagram-post-observations.sql` (1315ms)
- optional passed: `/opt/homebrew/bin/pnpm sources:inspect-official-sites` (2973ms)
- optional passed: `/opt/homebrew/bin/pnpm exec node --env-file=.env.local scripts/apply-sql-files.mjs data/intake/official-site-observations.sql` (976ms)
- optional passed: `/opt/homebrew/bin/pnpm sources:promote-observations` (1353ms)
- optional passed: `/opt/homebrew/bin/pnpm exec node --env-file=.env.local scripts/apply-sql-files.mjs data/intake/source-observation-promotions.sql` (947ms)
- required passed: `/opt/homebrew/bin/pnpm sources:automation-run` (5709ms)
- required passed: `/opt/homebrew/bin/pnpm sources:automation-health` (205ms)

## Summary

- Required failures: 0
- Optional failures: 0
- Passed: 9
- Skipped: 0

## Next Actions

- No local runner action required.
