# Zac Repository Instructions

This is the Zac product repository. The managing org-os repository is
`/Users/kkabuto/dev/org-os-zac`.

## Source Of Truth

- Follow `docs/19_fixed_pre_implementation_decisions.md` when documents differ.
- Use `docs/28_design_consistency_audit.md` as the current design consistency review.
- Keep implementation inside this repository; org-os state and planning files belong in `org-os-zac`.

## Guardrails

- Do not implement billing, production release, auth/role changes, destructive data work, secrets, or migrations without explicit human approval.
- Do not place secret values in code, docs, logs, or `.env.example`.
- Keep changes narrow and verify with the smallest relevant command.
- Commit and push timing follows the managing org-os judgment in `/Users/kkabuto/dev/org-os-zac`.
- Commit messages must be concise Japanese summaries.
- Use configured external tools and services when they are necessary, without bypassing human-gate boundaries.
- Computer Use is permitted for local browser or desktop verification when useful.

## Verification

- Use `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`, and `pnpm check`.
- The repo is pinned to Node.js 22 via `.nvmrc` and `.node-version`.
