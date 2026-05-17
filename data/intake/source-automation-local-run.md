# Source Automation Local Run

- Generated: 2026-05-17T03:17:04.009Z
- Updated: 2026-05-17T03:19:30.754Z
- Status: ready_for_review

## Steps

- required passed: `/opt/homebrew/bin/pnpm sources:automation-run` (5965ms)
- optional passed: `/opt/homebrew/bin/pnpm sources:inspect-instagram` (127637ms)
- optional passed: `/opt/homebrew/bin/pnpm exec node --env-file=.env.local scripts/apply-sql-files.mjs data/intake/instagram-post-observations.sql` (1204ms)
- optional passed: `/opt/homebrew/bin/pnpm sources:inspect-official-sites` (3127ms)
- optional passed: `/opt/homebrew/bin/pnpm exec node --env-file=.env.local scripts/apply-sql-files.mjs data/intake/official-site-observations.sql` (940ms)
- optional passed: `/opt/homebrew/bin/pnpm sources:promote-observations` (1145ms)
- optional passed: `/opt/homebrew/bin/pnpm exec node --env-file=.env.local scripts/apply-sql-files.mjs data/intake/source-observation-promotions.sql` (956ms)
- required passed: `/opt/homebrew/bin/pnpm sources:automation-run` (5558ms)
- required passed: `/opt/homebrew/bin/pnpm sources:automation-health` (204ms)

## Summary

- Required failures: 0
- Optional failures: 0
- Passed: 9
- Skipped: 0

## Next Actions

- No local runner action required.
