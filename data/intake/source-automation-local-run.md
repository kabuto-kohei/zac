# Source Automation Local Run

- Generated: 2026-05-18T23:52:51.587Z
- Updated: 2026-05-18T23:55:32.042Z
- Status: ready_for_review

## Steps

- required passed: `/opt/homebrew/bin/pnpm sources:automation-run` (8245ms)
- optional passed: `/opt/homebrew/bin/pnpm sources:inspect-instagram` (119020ms)
- optional passed: `/opt/homebrew/bin/pnpm exec node --env-file=.env.local scripts/apply-sql-files.mjs data/intake/instagram-post-observations.sql` (1891ms)
- optional passed: `/opt/homebrew/bin/pnpm sources:inspect-official-sites` (18405ms)
- optional passed: `/opt/homebrew/bin/pnpm exec node --env-file=.env.local scripts/apply-sql-files.mjs data/intake/official-site-observations.sql` (1438ms)
- optional passed: `/opt/homebrew/bin/pnpm sources:promote-observations` (2106ms)
- optional passed: `/opt/homebrew/bin/pnpm exec node --env-file=.env.local scripts/apply-sql-files.mjs data/intake/source-observation-promotions.sql` (1672ms)
- required passed: `/opt/homebrew/bin/pnpm sources:automation-run` (7459ms)
- required passed: `/opt/homebrew/bin/pnpm sources:automation-health` (207ms)

## Summary

- Required failures: 0
- Optional failures: 0
- Passed: 9
- Skipped: 0

## Next Actions

- No local runner action required.
