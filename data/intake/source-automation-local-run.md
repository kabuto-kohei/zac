# Source Automation Local Run

- Generated: 2026-05-16T12:02:23.588Z
- Updated: 2026-05-16T12:05:26.139Z
- Status: ready_for_review

## Steps

- required passed: `/opt/homebrew/bin/pnpm sources:automation-run` (7765ms)
- optional passed: `/opt/homebrew/bin/pnpm sources:inspect-instagram` (109753ms)
- optional passed: `/opt/homebrew/bin/pnpm exec node --env-file=.env.local scripts/apply-sql-files.mjs data/intake/instagram-post-observations.sql` (1399ms)
- optional passed: `/opt/homebrew/bin/pnpm sources:inspect-official-sites` (52506ms)
- optional passed: `/opt/homebrew/bin/pnpm exec node --env-file=.env.local scripts/apply-sql-files.mjs data/intake/official-site-observations.sql` (2602ms)
- optional passed: `/opt/homebrew/bin/pnpm sources:promote-observations` (1276ms)
- optional passed: `/opt/homebrew/bin/pnpm exec node --env-file=.env.local scripts/apply-sql-files.mjs data/intake/source-observation-promotions.sql` (961ms)
- required passed: `/opt/homebrew/bin/pnpm sources:automation-run` (6054ms)
- required passed: `/opt/homebrew/bin/pnpm sources:automation-health` (224ms)

## Summary

- Required failures: 0
- Optional failures: 0
- Passed: 9
- Skipped: 0

## Next Actions

- No local runner action required.
