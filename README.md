# Zac

Zac is a Climb Life OS for climbers. The MVP focuses on the loop:

```text
find a gym -> save it -> create a session plan -> climb -> log it -> create the next plan
```

## Repository Layout

```text
apps/web       User-facing Next.js app
apps/admin     Admin Next.js app
packages/api   Hono API
packages/db    Drizzle schema and DB helpers
packages/shared Shared schemas, constants, and types
packages/config Shared tooling config
infra           Migrations and seeds
openapi         Generated OpenAPI output
docs            Zac v5 design documents
```

The project management org-os repository is `kabuto-kohei/org-os-zac`.

## Getting Started

Install dependencies after Node.js 22 and pnpm are available:

```sh
pnpm install
```

Common commands:

```sh
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm check
```

## Design Source

Implementation should follow `docs/19_fixed_pre_implementation_decisions.md`
first when design documents differ. The current consistency review is
`docs/28_design_consistency_audit.md`.

