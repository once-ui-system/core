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
- Tests: `pnpm --filter @once-ui-system/core test` (Vitest). Baseline once PR #124 lands (verified 2026-08-12): **all 9 suites / 108 tests pass** (previously 5/92 since the 1.8.0 merge; #124 adds framework-boundary, CSS API-surface, package-exports and interactive-control suites). The historical jsdom failures and the `scrollLockState` collection error were fixed by PRs #115/#120 — a failing test is now a real regression. The CSS API-surface suite snapshots token/class *names*: an intentional rename requires `pnpm --filter @once-ui-system/core exec vitest run -u` and review of the snapshot diff.
- Package checks: `pnpm --filter @once-ui-system/core check:package` (publint + arethetypeswrong, advisory). Known-failing baseline (2026-08-12): dist is ESM syntax in `.js` files without `"type": "module"` and uses extensionless imports, so plain Node cannot load the package (bundler-only); fixing the module format is a 2.0 build decision (see `rfcs/2026-08-once-ui-2-architecture.md` §6) — don't "fix" it ad hoc.
- Typecheck: `pnpm --filter @once-ui-system/core typecheck` — **0 errors** on `main` since 1.8.0 (the ~235 pre-existing errors were fixed by PR #115). A non-zero result is now a real regression.
- Lint: all three packages run Biome 2.5.6 (`pnpm lint` = `biome check .`) with configs on the matching 2.5.6 schema, git-ignore integration on (build output like `dist`/`.next` is excluded), and generated artifacts (`ai/catalog.json`, `ai/manifest.json`, `ai/spec.json`, `ai/components/`, `src/data/emoji-data.json`) excluded from checks. ESLint was removed (Next 16 dropped `next lint`; the leftover configs/deps were dead).
  - Known error inventory (2026-07-30, do not "fix" as part of env setup): `packages/core` 488 errors (177 import-organization + 139 formatting — mechanically fixable, held for a dedicated sweep because it touches ~209 files — plus ~172 real lint findings, largest: `noArrayIndexKey` 66, `useExhaustiveDependencies` 64), `apps/dev` 43, `apps/docs` 160. Burn-down is a scheduled roadmap item; don't introduce NEW diagnostics.

### Once UI codegen harness

Before generating or editing Once UI UI code in `packages/core` or `apps/*`:

1. Read `packages/core/ai/manifest.json` (or `@once-ui-system/core/ai/manifest.json` from npm)
2. Load bootstrap: `rules.compact.md` + `catalog.json`
3. Match intent via `ai/tasks/index.json` - fetch task bundle + component slices
4. Validate: `pnpm --filter @once-ui-system/core validate-ai-code path/to/file.tsx`

Consumer apps: run `npx once-ui-init-agent` once after install to scaffold project `AGENTS.md` + `.cursor/rules/once-ui-codegen.mdc`.

Do not use full MDX doc pages for codegen — use the harness (~6–10KB per task). Guide: https://docs.once-ui.com/once-ui/ai-coding

## Social distribution (daily cloud agent)

Social distribution is a normal responsibility of this repo's daily agent, under the
distributed editorial ownership model on the Dopler Notes site ("The Dopler Universe",
site id `4610996c-e6c5-4b5b-af4f-b63ea70d9bd5` — private, drafts-only, never published).

- **Editorial scope owned by this agent:** Once UI **OSS releases, technical changes and
  education**, posted to the shared `once_ui` Instagram account. The account is shared
  with the Studio agent (blocks/designs/workflows/commercial use cases) — the shared
  calendar decides who posts on a given day; at most one post per day on the account.
- **Required reading before proposing or scheduling any post:** `/social/strategy.mdx`,
  `/social/once-ui.mdx` (this agent's account page), and `/social/calendar.mdx` on the
  Notes site. No exceptions. Posts must serve the current business strategy (for Core:
  win one meaningful infrastructure sponsor by demonstrating adoption, quality and
  relevance to agent-generated interfaces) — completed work is not inherently worthy
  of a post.
- **End of every run**, execute the social-distribution protocol in `/operations.mdx`:
  inspect new work and the Aveiro content digest → identify **at most one** strong
  public narrative → check the shared calendar for duplication and timing conflicts →
  validate every claim against a public source → create platform-native copy → put the
  canonical link in the first Threads comment when useful → attach only verified media
  (real rendered UI, never fabricated screenshots) → submit via
  `aveiro_social_create_draft` (human review queue) → record the result in
  `/social/calendar.mdx`. If the update has no strong narrative, check for a timeless
  educational angle; if nothing is found, report **"no strong post today"** — never
  generate filler.
- **Safeguards unchanged:** the information classification in `/operations.mdx` applies
  (only Public material in posts); every post requires human approval in the Aveiro
  dashboard — agents can only create drafts, and a proposed schedule alone never
  publishes; the Notes site stays unpublished.
