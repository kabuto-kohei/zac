# Source Automation Local Run

- Generated: 2026-05-18T02:33:15.487Z
- Updated: 2026-05-18T02:35:51.161Z
- Status: ready_for_review

## Steps

- required passed: `/opt/homebrew/bin/pnpm sources:automation-run` (5766ms)
- optional passed: `/opt/homebrew/bin/pnpm sources:inspect-instagram` (125161ms)
- optional passed: `/opt/homebrew/bin/pnpm exec node --env-file=.env.local scripts/apply-sql-files.mjs data/intake/instagram-post-observations.sql` (1370ms)
- optional passed: `/opt/homebrew/bin/pnpm sources:inspect-official-sites` (14420ms)
- optional passed: `/opt/homebrew/bin/pnpm exec node --env-file=.env.local scripts/apply-sql-files.mjs data/intake/official-site-observations.sql` (1127ms)
- optional passed: `/opt/homebrew/bin/pnpm sources:promote-observations` (1203ms)
- optional passed: `/opt/homebrew/bin/pnpm exec node --env-file=.env.local scripts/apply-sql-files.mjs data/intake/source-observation-promotions.sql` (891ms)
- required passed: `/opt/homebrew/bin/pnpm sources:automation-run` (5518ms)
- required passed: `/opt/homebrew/bin/pnpm sources:automation-health` (206ms)

## Summary

- Required failures: 0
- Optional failures: 0
- Passed: 9
- Skipped: 0

## Next Actions

- No local runner action required.
