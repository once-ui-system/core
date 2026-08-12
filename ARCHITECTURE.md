# Architecture

This repo is a **pnpm monorepo** managed by [Turborepo](https://turbo.build/repo). It contains two publishable libraries and two Next.js apps. The 2.0 package split is in progress — see `rfcs/2026-08-once-ui-2-architecture.md`.

```text
core/
├── packages/
│   ├── core/                  # @once-ui-system/core — the design system library
│   └── foundations/           # @once-ui-system/foundations — design tokens + utility styles (no React)
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
| `src/modules/`      | **Complex multi-file features** that compose multiple components (CodeBlock, SEO utilities, media players, navigation helpers). These are too large or coupled to live inside `components/`. |
| `src/interfaces.ts` | TypeScript interfaces for component props (`FlexProps`, `StyleProps`, `SpacingProps`, etc.).                                                                                                 |
| `src/types.ts`      | Shared TypeScript types — `SpacingToken`, `RadiusSize`, `TextWeight`, `ColorScheme`, etc.                                                                                                    |
| `src/hooks/`        | Custom React hooks used across components.                                                                                                                                                   |
| `src/contexts/`     | React context providers (e.g., ScrollLock, ArrowNavigation).                                                                                                                                 |
| `src/data/`         | Static data — icon names, emoji sets, design system constants.                                                                                                                               |
| `src/utils/`        | Pure utility functions (safe HTML, helpers).                                                                                                                                                 |
| `src/server/`       | Server-only utilities (ServerFlex, ServerGrid) for SSR-compatible rendering.                                                                                                                 |
| `src/internal/`     | Internal state management utilities.                                                                                                                                                         |
| `src/__tests__/`    | Unit and integration tests (Vitest).                                                                                                                                                         |
| `src/icons.ts`      | Icon name constants and mapping.                                                                                                                                                             |
| `src/index.ts`      | Public API barrel — everything exported from here is available to consumers.                                                                                                                 |
| `ai/`               | AI codegen harness — manifest, task bundles, component slices, examples.                                                                                                                     |
| `scripts/`          | Build helpers — emoji data generation, AI spec generation, file copying.                                                                                                                     |
| `dist/`             | Build output (JS, CSS, types). Generated, not committed.                                                                                                                                     |

### Key conventions

- **Props interfaces** live in `src/interfaces.ts` or colocated in the component file.
- **Tokens** follow the pattern `--{category}-{property}-{weight}` (e.g., `--brand-background-strong`).
- **SCSS modules** use the `.module.scss` convention for scoped styles. Global utilities and design tokens live in `packages/foundations/scss/`; the only foundations file components may reference is `../styles/breakpoints.scss` (a build-time synced copy).
- **Components** use `forwardRef` and accept a `className`/`style` override. Spread remaining props to the root element.
- **Exports** go through: `src/components/index.ts` → `src/index.ts`, plus separate re-exports from `contexts/`, `modules/`, `hooks/`, `utils/`, `types.ts`, `interfaces.ts`, `icons.ts`

---

## `apps/dev` — development sandbox

Local playground for developing and testing components. Routes are at `src/app/`. The main test page is `src/components/ComponentsCheckPage.tsx` which renders live variations of every component.

```bash
cd apps/dev && pnpm dev   # http://localhost:3001
```

---

## `apps/docs` — documentation site

The public docs site at [docs.once-ui.com](https://docs.once-ui.com). Content lives in `src/content/once-ui/` as MDX files. Each component has its own MDX page with previews, code examples, and API tables.

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
pnpm install          # installs all workspaces + builds core via postinstall
pnpm build            # rebuild everything via Turbo
```

The core library build: `clean` → `sync-foundations` (copies `breakpoints.scss` from `packages/foundations`; gitignored) → `generate-emoji-data` → `generate-ai-spec` → `tsc` (types + JS) → `copy-files` → `build:css` (copies foundations' compiled CSS into `dist/css` for the deprecated `@once-ui-system/core/css/*` compat entries). Tokens and utility styles compile in `packages/foundations` (`sass`), which builds first via the workspace dependency. Turborepo caches outputs across runs.

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
| Update or add docs page                       | `apps/docs/src/content/once-ui/`                  |
| Change the AI codegen harness                 | `packages/core/ai/`                               |
| Run tests                                     | `pnpm test`                                       |
