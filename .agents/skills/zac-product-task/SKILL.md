---
name: zac-product-task
description: Use for Zac product implementation tasks in /Users/kkabuto/dev/zac, including UI, API, shared package, tests, docs, and local verification. Trigger when the user asks to fix, add, improve, review, or investigate Zac product behavior.
---

# Zac Product Task

Use this skill inside `/Users/kkabuto/dev/zac`.

## Workflow

1. Read `AGENTS.md`, `README.md`, relevant docs under `docs/`, and nearby code.
2. Keep implementation in this repo. Planning/state belongs in
   `/Users/kkabuto/dev/org-os-zac`.
3. Do not read, print, or modify `.env`, `.env.*`, credentials, or secret
   values.
4. Stop for explicit approval before billing, production deploy/release,
   auth/role changes, migrations, destructive data work, secret changes, or
   broad dependency changes.
5. Make the smallest coherent change that follows existing package patterns.
6. Run the lightest meaningful verification first:
   - targeted test when available
   - `pnpm lint`
   - `pnpm typecheck`
   - `pnpm test`
   - `pnpm build`
   - `pnpm check` when broad confidence is needed
7. Summarize changed files, behavior, verification, and residual risk.

## Zac Commands

- Install: `pnpm install`
- Lint: `pnpm lint`
- Typecheck: `pnpm typecheck`
- Test: `pnpm test`
- Build: `pnpm build`
- Full check: `pnpm check`
- Web E2E: `pnpm e2e:web`

## Handoff

If a task needs backlog/state tracking or multi-step dispatch, switch to
`/Users/kkabuto/dev/org-os-zac` and use the org-os workflow.
