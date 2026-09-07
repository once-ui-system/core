# Contributing to Once UI

First off, thank you for taking the time to contribute! Once UI is an indie project built by creators who care deeply about great interfaces, systems thinking, and developer experience. Every bug report, feature suggestion, or pull request helps.

## Monorepo structure

This repo uses a monorepo layout with pnpm workspaces and Turborepo:

| Path | Description |
|------|-------------|
| `packages/core` | The Once UI package [@once-ui-system/core](https://www.npmjs.com/package/@once-ui-system/core) — all components, tokens, and utilities |
| `packages/foundations` | Tokens, styles, and token-value types. Core consumes it at build time and inlines its SCSS/CSS into `dist`; it is not published to npm |
| `apps/dev` | Local sandbox app for testing components (Next.js 16, port 3001) |
| `apps/docs` | Documentation site at [docs.once-ui.com](https://docs.once-ui.com) (Next.js 16, port 3000) |

For the full directory layout and conventions, see [ARCHITECTURE.md](./ARCHITECTURE.md).

## Requirements

**Node `>=22.12.0`** (`.nvmrc` pins 22), and pnpm 10.

Two separate reasons for that floor:

- **22.12.0 is where `require()` of an ESM module landed.** Sass depends on
  chokidar 5, which is ESM-only, and loads it through `require()`. On an older
  Node the foundations build dies with an `ERR_REQUIRE_ESM` stack trace from
  inside Sass that names neither Node nor the real constraint. Node 21.x is the
  nastiest case — it satisfies a naive `>=20` range but was retired before the
  backport, so it passes the check and still cannot build.
- **Node 20 reached end of life on 2026-04-30**, and Vercel stops building
  projects on Node 20 or older from 2026-10-01. The 20.19 line could technically
  run the build, but there is no reason to keep a dead runtime in the supported
  set.

**macOS / Linux** (nvm reads `.nvmrc`):

```bash
nvm install && nvm use
node --version   # expect v22.x
```

**Windows** — nvm-windows does *not* read `.nvmrc`, so name the version:

```powershell
nvm install 22
nvm use 22
node --version   # expect v22.x
```

Switching Node in one terminal does not affect terminals that are already
open, and some editors spawn their own shell — if a build still reports the
old version, reopen it.

`pnpm install` and the foundations build both run `scripts/check-node.mjs`,
which fails with the version it found and how to fix it rather than letting
Sass throw `ERR_REQUIRE_ESM` from somewhere deep in `node_modules`.

## Running the dev environment

The dev app is symlinked to the core package for rapid iteration.

```bash
pnpm install
pnpm dev
```

This boots both apps in parallel via Turborepo:
- **Docs** → `http://localhost:3000`
- **Dev sandbox** → `http://localhost:3001`

To iterate on the library while running the dev app:

```bash
# Terminal 1 — watch mode for the library
pnpm --filter @once-ui-system/core dev

# Terminal 2 — dev app
pnpm dev:dev
```

## Rebuilding the library

If apps fail to resolve `@once-ui-system/core`, rebuild it:

```bash
pnpm --filter @once-ui-system/core build
```

The build runs: `clean` → `generate-emoji-data` → `generate-ai-spec` → `tsc` → `copy-files` → `build:css`

## Running tests

```bash
pnpm test
```

This runs all tests via Turbo. To run only core tests:

```bash
pnpm test:core
```

Note: A small number of tests may fail under jsdom due to incomplete support for `inert` attribute and real wheel/touch events. This is a known jsdom limitation, not an environment issue.

## Linting and formatting

The project uses [Biome](https://biomejs.dev/) for linting and formatting (replaces ESLint + Prettier):

```bash
pnpm lint          # lint everything
pnpm format        # format all files
pnpm format:check  # check formatting without modifying
pnpm typecheck     # typecheck everything
```

## Contributing guidelines

### Bug reports

Use [this template](https://github.com/once-ui-system/core/issues/new?labels=bug&template=bug_report.md).

Include screenshots, steps to reproduce, and your environment if possible.

### Feature requests

Use [this template](https://github.com/once-ui-system/core/issues/new?labels=feature%20request&template=feature_request.md).

We prioritize improvements that serve real use cases or improve design/dev workflow.

### Pull requests

We welcome PRs for:
- UI component fixes or improvements
- Accessibility enhancements
- Performance tweaks
- New utilities or design patterns that fit the system
- Documentation improvements

Before submitting a PR:
1. Test your changes in `apps/dev` — use `ComponentsCheckPage.tsx` to verify components visually
2. Run tests: `pnpm test`
3. Run typecheck: `pnpm typecheck:core` (or `pnpm typecheck` for all workspaces)
4. If you modified `packages/core`, rebuild the library: `pnpm --filter @once-ui-system/core build`
5. Reference an issue when applicable

### Code conventions

- Follow our [component conventions](https://docs.once-ui.com/once-ui/basics/components) and file structure.
- Use the naming system and design tokens already defined in the project.
- Components should be server-compatible or marked `"use client"`.
- Use `forwardRef` and accept `className`/`style` overrides.
- Export new components through `src/components/index.ts` → `src/index.ts`.
- Use SCSS modules (`.module.scss`) for scoped component styles.
- Run `pnpm format` before committing to ensure consistent formatting.

### Next.js 16 migration notes

If you're working with the docs app, note these Next.js 16 changes:
- `middleware.ts` has been renamed to `proxy.ts` with the exported function renamed from `middleware` to `proxy`.
- `next lint` has been removed — use `pnpm lint` (Biome) instead.
- Turbopack is now the default bundler for both dev and build.
- `params` and `searchParams` in pages/layouts are now `Promise` objects and must be awaited.

## Join the community

We hang out in the [Design Engineers Club](https://discord.com/invite/5EyAQ4eNdS) on Discord. Come ask questions, share builds, or just vibe with others building cool things.

## Indie credits

This is an indie-built system. We appreciate contributors deeply. You may get featured in the docs or invited to inner-circle experiments if you consistently help improve Once UI.

Thanks again,
— Lorant
