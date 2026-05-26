# Source Automation Local Run

- Generated: 2026-05-26T10:22:31.990Z
- Updated: 2026-05-26T10:32:46.494Z
- Status: ready_for_review

## Steps

- required passed: `/opt/homebrew/bin/pnpm sources:automation-run` (3206ms)
- optional passed: `/opt/homebrew/bin/pnpm sources:inspect-instagram` (572803ms)
- optional passed: `/opt/homebrew/bin/pnpm exec node --env-file=.env.local scripts/apply-sql-files.mjs data/intake/instagram-post-observations.sql` (989ms)
- optional passed: `/opt/homebrew/bin/pnpm sources:inspect-official-sites` (28783ms)
- optional passed: `/opt/homebrew/bin/pnpm exec node --env-file=.env.local scripts/apply-sql-files.mjs data/intake/official-site-observations.sql` (876ms)
- optional passed: `/opt/homebrew/bin/pnpm sources:promote-observations` (1696ms)
- optional passed: `/opt/homebrew/bin/pnpm exec node --env-file=.env.local scripts/apply-sql-files.mjs data/intake/source-observation-promotions.sql` (993ms)
- required passed: `/opt/homebrew/bin/pnpm sources:automation-run` (4918ms)
- required passed: `/opt/homebrew/bin/pnpm sources:automation-health` (228ms)

## Summary

- Required failures: 0
- Optional failures: 0
- Passed: 9
- Skipped: 0

## Next Actions

- No local runner action required.
