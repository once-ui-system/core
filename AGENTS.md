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
- The root `dev:core` script uses `bun`, which is **not installed**. Use the pnpm flow instead (`cd apps/dev && pnpm dev`).

### Running the apps (dev mode)
- `apps/dev`: `cd apps/dev && pnpm dev` → http://localhost:3000
- `apps/docs`: `cd apps/docs && pnpm dev` → also defaults to port 3000. **Both apps use port 3000**, so when running both at once give one a different port, e.g. `pnpm dev --port 3001`. (Running root `pnpm dev` / `turbo dev` starts both and will collide on 3000.)

### Tests / lint (standard commands live in each `package.json`)
- Tests: `pnpm --filter @once-ui-system/core test` (Vitest). Note: 4 tests (`Dialog` inert + `ScrollLock` wheel) currently fail under the pinned jsdom (68/72 pass); this is a pre-existing jsdom-behavior issue, not an env problem.
- Lint, pre-existing breakage to be aware of (do not "fix" as part of env setup):
  - `pnpm --filter @once-ui-system/core lint` (Biome) fails because `biome.json` files use the `1.9.4` schema while the pinned CLI is `2.4.13` (unknown keys `ignore`, `organizeImports`).
  - `apps/dev` `pnpm lint` fails because its script is `next lint`, which was removed in Next 16.
  - `apps/docs` `pnpm lint` (Next 15) works and reports no errors.
