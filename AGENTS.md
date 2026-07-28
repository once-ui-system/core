# AGENTS.md

## Cursor Cloud specific instructions

This is the **Once UI** monorepo (pnpm workspaces + Turborepo). It is frontend-only:
a publishable React/Next.js design system plus two Next.js apps. There is **no database,
auth, backend, or secrets** — nothing external needs to be provisioned.

Workspaces:
- `packages/core` (`@once-ui-system/core`) — the design system library (the product). Built with `tsc` + `sass` to `dist/`.
- `apps/dev` — Next.js 16 sandbox for developing/testing components (primary contributor playground; see `CONTRIBUTING.md`).
- `apps/docs` — Next.js 15 documentation site.

### Environment / setup notes
- Node: the repo declares `engines.node: 20.x`, but the VM ships Node 22 (LTS). There is **no `engine-strict`**, and Next 15/16 both support Node 22, so the harmless `Unsupported engine` warning during install can be ignored.
- `pnpm install` builds `packages/core` automatically via the `apps/docs` `postinstall` hook, so `dist/` is ready after install. If the apps ever fail to resolve `@once-ui-system/core`, rebuild it with `pnpm --filter @once-ui-system/core build`.
- To live-iterate on the library while running an app, run `pnpm --filter @once-ui-system/core dev` (tsc watch) alongside the app.

### Running the apps

| Command | What it does |
|---|---|
| `pnpm dev` | All dev servers in parallel (docs - :3000, dev - :3001, core watch) |
| `pnpm dev:core` | Core library TypeScript watch mode only |
| `pnpm dev:docs` | Docs app only - http://localhost:3000 |
| `pnpm dev:dev` | Dev sandbox app only - http://localhost:3001 |
| `pnpm build` | Build everything (library + apps) |
| `pnpm build:core` | Build just the library |
| `pnpm build:docs` | Build docs + its dependencies |
| `pnpm build:dev` | Build dev app + its dependencies |
| `pnpm start` | Start all built apps (docs - :3000, dev - :3001) |
| `pnpm start:docs` | Start built docs app only |
| `pnpm start:dev` | Start built dev app only |
| `pnpm lint` | Lint everything via Turbo |
| `pnpm format` | Format all files |
| `pnpm typecheck` | Typecheck everything in parallel |
| `pnpm test` | Run all tests via Turbo |
| `pnpm clean` | Clean all build artifacts |

### Port assignments
- **docs** - port 3000 (primary documentation site)
- **dev** - port 3001 (development sandbox)

The dev app has `--port 3001` baked into its `dev` script, so `turbo dev` runs both without collision.

### Individual app dev commands
- `apps/dev`: `cd apps/dev && pnpm dev` - http://localhost:3001
- `apps/docs`: `cd apps/docs && pnpm dev` - http://localhost:3000

### Tests / lint (standard commands live in each `package.json`)
- Tests: `pnpm --filter @once-ui-system/core test` (Vitest). Note: 4 tests (`Dialog` inert + `ScrollLock` wheel) currently fail under the pinned jsdom (68/72 pass); this is a pre-existing jsdom-behavior issue, not an env problem.
- Lint, pre-existing breakage to be aware of (do not "fix" as part of env setup):
  - `pnpm --filter @once-ui-system/core lint` (Biome) fails because `biome.json` files use the `1.9.4` schema while the pinned CLI is `2.4.13` (unknown keys `ignore`, `organizeImports`).
  - `apps/dev` `pnpm lint` fails because its script is `next lint`, which was removed in Next 16.
  - `apps/docs` `pnpm lint` (Next 15) works and reports no errors.

### Once UI codegen harness

Before generating or editing Once UI UI code in `packages/core` or `apps/*`:

1. Read `packages/core/ai/manifest.json` (or `@once-ui-system/core/ai/manifest.json` from npm)
2. Load bootstrap: `rules.compact.md` + `catalog.json`
3. Match intent via `ai/tasks/index.json` - fetch task bundle + component slices
4. Validate: `pnpm --filter @once-ui-system/core validate-ai-code path/to/file.tsx`

Consumer apps: run `npx once-ui-init-agent` once after install to scaffold project `AGENTS.md` + `.cursor/rules/once-ui-codegen.mdc`.

Do not use full MDX doc pages for codegen — use the harness (~6–10KB per task). Guide: https://docs.once-ui.com/once-ui/ai-coding
