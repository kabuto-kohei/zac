# Source Automation Local Run

- Generated: 2026-05-27T05:26:26.613Z
- Updated: 2026-05-27T05:36:17.536Z
- Status: ready_for_review

## Steps

- required passed: `/opt/homebrew/bin/pnpm sources:automation-run` (6747ms)
- optional passed: `/opt/homebrew/bin/pnpm sources:inspect-instagram` (535298ms)
- optional passed: `/opt/homebrew/bin/pnpm exec node --env-file=.env.local scripts/apply-sql-files.mjs data/intake/instagram-post-observations.sql` (1185ms)
- optional passed: `/opt/homebrew/bin/pnpm sources:inspect-official-sites` (36559ms)
- optional passed: `/opt/homebrew/bin/pnpm exec node --env-file=.env.local scripts/apply-sql-files.mjs data/intake/official-site-observations.sql` (1158ms)
- optional passed: `/opt/homebrew/bin/pnpm sources:promote-observations` (1775ms)
- optional passed: `/opt/homebrew/bin/pnpm exec node --env-file=.env.local scripts/apply-sql-files.mjs data/intake/source-observation-promotions.sql` (922ms)
- required passed: `/opt/homebrew/bin/pnpm sources:automation-run` (7052ms)
- required passed: `/opt/homebrew/bin/pnpm sources:automation-health` (214ms)

## Summary

- Required failures: 0
- Optional failures: 0
- Passed: 9
- Skipped: 0

## Next Actions

- No local runner action required.
