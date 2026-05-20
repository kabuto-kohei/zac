# Source Automation Local Run

- Generated: 2026-05-20T16:14:41.987Z
- Updated: 2026-05-20T16:21:22.595Z
- Status: ready_for_review

## Steps

- required passed: `/opt/homebrew/bin/pnpm sources:automation-run` (6951ms)
- optional passed: `/opt/homebrew/bin/pnpm sources:inspect-instagram` (369030ms)
- optional passed: `/opt/homebrew/bin/pnpm exec node --env-file=.env.local scripts/apply-sql-files.mjs data/intake/instagram-post-observations.sql` (1303ms)
- optional passed: `/opt/homebrew/bin/pnpm sources:inspect-official-sites` (14368ms)
- optional passed: `/opt/homebrew/bin/pnpm exec node --env-file=.env.local scripts/apply-sql-files.mjs data/intake/official-site-observations.sql` (996ms)
- optional passed: `/opt/homebrew/bin/pnpm sources:promote-observations` (1269ms)
- optional passed: `/opt/homebrew/bin/pnpm exec node --env-file=.env.local scripts/apply-sql-files.mjs data/intake/source-observation-promotions.sql` (918ms)
- required passed: `/opt/homebrew/bin/pnpm sources:automation-run` (5548ms)
- required passed: `/opt/homebrew/bin/pnpm sources:automation-health` (212ms)

## Summary

- Required failures: 0
- Optional failures: 0
- Passed: 9
- Skipped: 0

## Next Actions

- No local runner action required.
