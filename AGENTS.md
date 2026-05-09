# Zac Repository Instructions

This is the Zac product repository. The managing org-os repository is
`/Users/kkabuto/dev/org-os-zac`.

## Source Of Truth

- Follow `docs/19_fixed_pre_implementation_decisions.md` when documents differ.
- Use `docs/28_design_consistency_audit.md` as the current design consistency review.
- Keep implementation inside this repository; org-os state and planning files belong in `org-os-zac`.
- For planning, backlog, and cross-step coordination, use `/Users/kkabuto/dev/org-os-zac`.

## Guardrails

- The user delegates non-billing work when needed, including implementation,
  verification, file organization, commit, and push.
- Do not perform billing, subscription, purchase, or payment-setting actions.
- For production release, auth/role changes, destructive data work, secret
  management, or migrations, proceed only when the task scope requires it and
  record evidence, verification, and rollback notes.
- Do not read, print, or modify `.env`, `.env.*`, credentials, or secret values.
- Do not place secret values in code, docs, logs, or `.env.example`.
- Keep changes narrow and verify with the smallest relevant command.
- Commit and push timing follows task need and the managing org-os judgment in `/Users/kkabuto/dev/org-os-zac`.
- Commit messages must be concise Japanese summaries.
- Use configured external tools and services when they are necessary, without bypassing human-gate boundaries.
- Computer Use is permitted for local browser or desktop verification when useful.

## Verification

- Use `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`, and `pnpm check`.
- The repo is pinned to Node.js 22 via `.nvmrc` and `.node-version`.

## Daily Codex Use

- Treat this repo as the Zac product boundary in the Codex app.
- Use Worktree mode for parallel or medium-sized implementation tasks.
- Use the IDE extension for focused edits in already-open files.
- Use the CLI for local investigation and targeted verification.
- Do not place org-os backlog, state, dispatch, or report files in this repo.
- Use the repo-local `zac-product-task` skill for implementation, bugfix,
  UI/API, and verification work.
- For cross-step planning or self-driving cycles, switch to
  `/Users/kkabuto/dev/org-os-zac`.
