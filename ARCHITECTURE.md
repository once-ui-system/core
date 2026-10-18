# Architecture

This repo is a **pnpm monorepo** managed by [Turborepo](https://turbo.build/repo). It contains one published library, the private package it builds its styles from, and two Next.js apps.

The 2.0 package split (`rfcs/2026-08-once-ui-2-architecture.md`) shipped in 2.0.0 up to its last phase: tokens and utility styles live in `packages/foundations` and are inlined into core at build time; charts, `CodeBlock` and `MediaUpload` moved to the `/data`, `/code` and `/media` subpaths with optional peers; the Next.js bindings live on `@once-ui-system/core/next`, and core runs without Next. Since 2.1 the components' Sass modules ship precompiled, so consumers need no Sass. What remains — publishing `foundations`, dropping the now-unneeded `sass` peer, a blocks package — is parked (`ROADMAP.md` §4).

```text
core/
├── packages/
│   ├── core/                  # @once-ui-system/core — the design system library (published)
│   ├── fx/                    # @once-ui-system/fx — the effects, on top of core (3.0)
│   ├── blocks/                # @once-ui-system/blocks — Banner, Book, LogoCloud, StylePanel… (3.0)
│   └── foundations/           # @once-ui-system/foundations — design tokens + utility styles (private, no React)
├── apps/
│   ├── dev/                   # Next.js 16 sandbox for component development
│   └── docs/                  # Next.js 16 documentation site (docs.once-ui.com)
├── ARCHITECTURE.md            # this file
├── CONTRIBUTING.md            # contribution guidelines
├── pnpm-workspace.yaml        # workspace definition
└── turbo.json                 # Turborepo pipeline config
```

---

## `packages/core` — the library

All source lives under `packages/core/src/`. The build produces `dist/` with JS + CSS, published to npm as `@once-ui-system/core`.

### Directory layout

| Path                | Purpose                                                                                                                                                                                      |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/components/`   | **React components** (Button, Flex, Dialog, CodeBlock, etc.). Each component has a `.tsx` file and an optional `.module.scss` for scoped styles. Server-compatible or marked `"use client"`. |
| `src/modules/`      | **Complex multi-file features** that compose multiple components: charts (`data/`), `CodeBlock` (`code/`), `MediaUpload` (`media/`), navigation (MegaMenu, Kbar, HeadingNav) and SEO (`Meta`, `Schema`). `data`, `code` and `media` ship on their own subpaths, never the root barrel, because their dependencies are optional peers. |
| `src/interfaces.ts` | TypeScript interfaces for component props (`FlexProps`, `StyleProps`, `SpacingProps`, etc.).                                                                                                 |
| `src/types.ts`      | Shared TypeScript types — `SpacingToken`, `RadiusSize`, `TextWeight`, `ColorScheme`, etc.                                                                                                    |
| `src/hooks/`        | Custom React hooks used across components.                                                                                                                                                   |
| `src/contexts/`     | React context providers: Layout, Theme, DataTheme, Toast, Icon and Adapter (the framework adapters links and images render through).                                                         |
| `src/next/`         | Next.js adapter bindings, published as `@once-ui-system/core/next` — the only runtime `next/*` imports in core (enforced by `framework-boundary.test.ts`).                                     |
| `src/data/`         | Generated static data (the emoji set).                                                                                                                                                       |
| `src/utils/`        | Pure utility functions (safe HTML, colour schemes, nav matching, spacing styles).                                                                                                            |
| `src/server/`       | Server-only utilities for Open Graph fetching, with public-address URL validation.                                                                                                          |
| `src/internal/`     | Internal state management utilities.                                                                                                                                                         |
| `src/__tests__/`    | Unit and integration tests (Vitest + jsdom); `src/test/` holds the setup and the axe helper.                                                                                                 |
| `src/icons.ts`      | The icon registry and the `IconName` union, built from the inlined SVG data in `src/icons/`.                                                                                                 |
| `src/index.ts`      | Public API barrel — everything exported from here is available to consumers.                                                                                                                 |
| `ai/`               | AI codegen harness — manifest, rules, catalog, task bundles, component slices, gotchas, examples. `spec.json`, `catalog.json`, `manifest.json`, `tokens.json`, `functions.json`, `components/` and `bundles/` are generated from the source, `catalog.seed.json`, `tasks/` and `gotchas.json`. |
| `scripts/`          | Build helpers — emoji data and AI spec generation, file copying — plus the two published CLIs: `validate-ai-code.cjs` and `init-agent.cjs` (CommonJS, hence `.cjs`: the package is `"type": "module"`).                                                    |
| `dist/`             | Build output (JS, CSS, types). Generated, not committed.                                                                                                                                     |

### Key conventions

- **Props interfaces** live in `src/interfaces.ts` or colocated in the component file.
- **Tokens** follow the pattern `--{category}-{property}-{weight}` (e.g., `--brand-background-strong`).
- **SCSS modules** use the `.module.scss` convention for scoped styles. Global utilities and design tokens live in `packages/foundations/scss/`; the only foundations file components may reference is `../styles/breakpoints.scss` (a build-time synced copy).
- **Components** use `forwardRef` and accept a `className`/`style` override. Spread remaining props to the root element.
- **Exports** go through: `src/components/index.ts` → `src/index.ts`, plus separate re-exports from `contexts/`, `modules/`, `hooks/`, `utils/`, `types.ts`, `interfaces.ts`, `icons.ts`. `modules/data`, `modules/code`, `modules/media`, `modules/emoji`, `modules/mdx` and `next/` are their own subpaths (`/data`, `/code`, `/media`, `/emoji`, `/mdx`, `/next`) and are never re-exported from the root; `/media` re-exports the players, `Scrubber` and `CompareImage` from `components/`, and `/emoji` the `EmojiPicker`. Since 3.0 those and `/config`, `/server` and the `css`/`ai` files are the only entry points: there is no `./components/*` and no subset subpath. The package is ESM (`"type": "module"`); relative imports in `src` name the emitted `.js` file, and the build compiles with `module`/`moduleResolution: NodeNext`.

---

## `apps/dev` — development sandbox

Local playground for developing and testing components. Routes are at `src/app/`. The main test page is `src/components/ComponentsCheckPage.tsx` which renders live variations of every component.

```bash
cd apps/dev && pnpm dev   # http://localhost:3001
```

---

## `apps/docs` — documentation site

The public docs site at [docs.once-ui.com](https://docs.once-ui.com). Content lives in `src/content/` as MDX files. Each component has its own MDX page with previews, code examples, and API tables.

```bash
cd apps/docs && pnpm dev   # http://localhost:3000
```

The docs site uses `proxy.ts` (Next.js 16) — `middleware.ts` was removed in Next.js 16. The proxy serves AI-friendly markdown representations of pages.

---

## Tooling

| Tool | Purpose |
|------|---------|
| **pnpm** | Package manager with workspace support |
| **Turborepo** | Build orchestration, caching, and parallel task execution |
| **TypeScript** | Type checking (strict mode) |
| **Biome** | Linting and formatting (replaces ESLint + Prettier) |
| **Vitest** | Unit and integration testing |
| **Sass** | SCSS compilation for design tokens and utility classes |

---

## Build pipeline

```bash
pnpm install          # installs all workspaces + builds foundations and core via their `prepare` scripts
pnpm build            # rebuild everything via Turbo
```

The core library build: `clean` → `sync-foundations` (copies `breakpoints.scss` from `packages/foundations`; gitignored) → `generate-emoji-data` → `generate-ai-spec` → `tsc` (types + JS, NodeNext, no source maps) → `copy-files` (plain `.css` and the emoji JSON only) → `build:css` (copies foundations' compiled CSS into `dist/css` for the deprecated `@once-ui-system/core/css/*` compat entries) → `build:css-modules` (compiles each component's `.module.scss` to `.module.css` and points the emitted JS at it, so consumers need no Sass; the `.scss` sources are not shipped). Tokens and utility styles compile in `packages/foundations` (`sass`), which builds first via the workspace dependency. Turborepo caches outputs across runs.

---

## Where to contribute

| What you want to do                           | Where to go                                       |
| --------------------------------------------- | ------------------------------------------------- |
| Fix or add a component                        | `packages/core/src/components/`                   |
| Fix or add a complex module (CodeBlock, etc.) | `packages/core/src/modules/`                      |
| Change colors, typography, spacing tokens     | `packages/foundations/scss/tokens/`               |
| Add or modify utility classes                 | `packages/foundations/scss/styles/`               |
| Add a new shared type                         | `packages/core/src/types.ts`                      |
| Test a component visually                     | `apps/dev/src/components/ComponentsCheckPage.tsx` |
| Update or add docs page                       | `apps/docs/src/content/`                          |
| Change the AI codegen harness                 | `packages/core/ai/`                               |
| Run tests                                     | `pnpm test`                                       |
