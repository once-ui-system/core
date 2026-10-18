# AGENTS.md

## Cursor Cloud specific instructions

This is the **Once UI** monorepo (pnpm workspaces + Turborepo). It is frontend-only:
a publishable React/Next.js design system plus two Next.js apps. There is **no database,
auth, backend, or secrets** — nothing external needs to be provisioned.

Workspaces:
- `packages/core` (`@once-ui-system/core`) — the design system library (the product). Built with `tsc` + `sass` to `dist/`.
- `packages/foundations` (`@once-ui-system/foundations`) — tokens and utility styles; **private**, inlined into core at build time.
- `packages/fx` (`@once-ui-system/fx`) and `packages/blocks` (`@once-ui-system/blocks`) — 3.0: the effects, and Banner, Book, LogoCloud, ScrollToTop, StylePanel and StyleOverlay, on top of core (a peer); built and tested against core's `dist` (build core first). **Private** until their npm names exist. Core must not import either.
- `apps/dev` — Next.js 16 sandbox for developing/testing components (primary contributor playground; see `CONTRIBUTING.md`).
- `apps/docs` — Next.js 16 documentation site.

### Environment / setup notes
- Node: the repo requires **Node >=22.12.0** (`engines` in the root and docs `package.json`). A `preinstall` hook (`scripts/check-node.mjs`) stops an older Node with an explanation: Sass loads chokidar 5, which is ESM-only, through `require()`, and that works only from 22.12.0.
- `pnpm install` builds `packages/foundations` and `packages/core` through their `prepare` scripts, so `dist/` and the generated `ai/` artifacts are ready after install. If the apps ever fail to resolve `@once-ui-system/core`, rebuild it with `pnpm --filter @once-ui-system/core build`.
- The build regenerates `packages/core/ai/{spec,catalog,manifest,tokens,functions}.json`, `ai/components/`, `ai/bundles/` and `src/data/emoji-data.json`. During a release cycle they are regenerated once on the merged tree, so don't commit the copies a local build leaves behind (`git checkout -- packages/core/ai packages/core/src/data` before committing).
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
- Tests: `pnpm --filter @once-ui-system/core test` (Vitest + jsdom, axe helper in `src/test/axe.ts`). Baseline (2026-10-10): **54 files / 505 tests** pass at the 2.1 cycle's base commit (`f7a2897`, after the mechanical Biome sweep); the agent-harness workstream (W4) brings it to **58 files / 578 tests**. A failing test is a real regression. The one exception seen so far is load: with the CPU saturated, a few timer-driven jsdom tests (`codeblock-collapse`, `datepicker-dropdowns`) can time out, and pass on their own. The CSS API-surface suite snapshots token/class *names*: an intentional rename requires `pnpm --filter @once-ui-system/core exec vitest run -u` and review of the snapshot diff. The repo-level `pnpm test` also runs the 2.0 codemod's tests (`scripts/codemod-2.0.test.mjs`).
- Package checks: `pnpm --filter @once-ui-system/core check:package` (publint + arethetypeswrong under the `esm-only` profile; advisory in CI). Since 3.0 the package is real ESM (`"type": "module"`, NodeNext, `.js` extensions on every relative import, so plain Node resolves it; the components still import their `.module.css`, which needs a bundler or a CSS loader) and both pass. The excluded entry points are the CSS and Markdown files, which attw cannot type. Source imports name the emitted file (`./Button.js`, `../components/index.js`); `tsc -p tsconfig.build.json` fails on one that does not.
- Typecheck: `pnpm --filter @once-ui-system/core typecheck` — **0 errors** on `main` since 1.8.0 (the ~235 pre-existing errors were fixed by PR #115). A non-zero result is now a real regression.
- Lint: all three packages run Biome 2.5.6 (`pnpm lint` = `biome check .`) with configs on the matching 2.5.6 schema, git-ignore integration on (build output like `dist`/`.next` is excluded), and generated artifacts (`ai/catalog.json`, `ai/manifest.json`, `ai/spec.json`, `ai/tokens.json`, `ai/functions.json`, `ai/components/`, `ai/bundles/`, `src/data/emoji-data.json`) excluded from checks. ESLint was removed (Next 16 dropped `next lint`; the leftover configs/deps were dead).
  - Known error inventory (2026-10-10, `biome check .` per package; do not "fix" as part of env setup): `packages/core` **171** errors (519 → 173 after the mechanical format/import sweep that opened the 2.1 cycle, then 2 fewer with the W4 validator rewrite; what is left are real lint findings, largest `noArrayIndexKey` and `useExhaustiveDependencies`), `apps/dev` 47, `apps/docs` 278 (the blocks surface added most of them), `packages/foundations` 5. Burn-down is parked for 2.2 (`ROADMAP.md` §4); don't introduce NEW diagnostics — format touched files with `npx biome check --write --linter-enabled=false <files>`.

### Once UI codegen harness

Before generating or editing Once UI UI code in `packages/core` or `apps/*`:

1. Read `packages/core/ai/manifest.json` (or `@once-ui-system/core/ai/manifest.json` from npm)
2. Load bootstrap: `rules.compact.md` + `catalog.json`
3. Match intent via `ai/tasks/index.json` - read the task's bundle `ai/bundles/{id}.json` (task + slices + types + gotchas in one file); fetch other slices from `ai/components/` only if needed, and never `spec.json`
4. Validate: `pnpm --filter @once-ui-system/core validate-ai-code path/to/file.tsx` (`--fix` applies the mechanical fixes; `--next`/`--no-next` override Next.js detection)

Consumer apps: run `npx once-ui-init-agent` once after install to scaffold project `AGENTS.md`, `CLAUDE.md` and `.cursor/rules/once-ui-codegen.mdc`. In a Next.js app, `LayoutProvider` comes from `@once-ui-system/core/next`.

Harness sources vs. generated files: `ai/rules*.md`, `layouts.md`, `recipes.md`, `gotchas.json`, `tasks/`, `examples/` and `catalog.seed.json` (the catalog's purposes, tags and pairings — every component in the spec needs an entry, or `ai-catalog.test.ts` fails) are written by hand. `spec.json`, `catalog.json`, `manifest.json`, `tokens.json`, `functions.json`, `components/` and `bundles/` come from `scripts/generate-ai-spec.cjs`.

Do not use full MDX doc pages for codegen — use the harness (bootstrap about 30KB, plus one 14–23KB bundle per task). Guide: https://docs.once-ui.com/ai-coding

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
