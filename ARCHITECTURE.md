# Architecture

This repo is a **pnpm monorepo** managed by [Turborepo](https://turbo.build/repo). It contains one publishable library and two Next.js apps.

```
core/
├── packages/
│   └── core/                  # @once-ui-system/core — the design system library
├── apps/
│   ├── dev/                   # Next.js 16 sandbox for component development
│   └── docs/                  # Next.js 15 documentation site (docs.once-ui.com)
├── ARCHITECTURE.md            # this file
├── CONTRIBUTING.md            # contribution guidelines
├── pnpm-workspace.yaml        # workspace definition
└── turbo.json                 # Turborepo pipeline config
```

---

## `packages/core` — the library

All source lives under `packages/core/src/`. The build produces `dist/` with JS + CSS, published to npm as `@once-ui-system/core`.

### Directory layout

| Path              | Purpose                                                                                                                                                                                      |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/components/` | **React components** (Button, Flex, Dialog, CodeBlock, etc.). Each component has a `.tsx` file and an optional `.module.scss` for scoped styles. Server-compatible or marked `"use client"`. |
| `src/modules/`    | **Complex multi-file features** that compose multiple components (CodeBlock, SEO utilities, media players, navigation helpers). These are too large or coupled to live inside `components/`. |
| `src/tokens/`     | **Design tokens** as SCSS variables — colors, typography, shadows, borders, spacing, layout. These generate `dist/css/tokens.css`. Consumed by both the library and apps.                    |
| `src/styles/`     | **Utility classes** — SCSS that generates classes like `bg-surface`, `p-16`, `radius-m`, `flex-row`. These generate `dist/css/styles.css`.                                                   |
| `src/interfaces/` | TypeScript interfaces for component props (`FlexProps`, `StyleProps`, `SpacingProps`, etc.).                                                                                                 |
| `src/types.ts`    | Shared TypeScript types — `SpacingToken`, `RadiusSize`, `TextWeight`, `ColorScheme`, etc.                                                                                                    |
| `src/hooks/`      | Custom React hooks used across components.                                                                                                                                                   |
| `src/contexts/`   | React context providers (e.g., ScrollLock, ArrowNavigation).                                                                                                                                 |
| `src/data/`       | Static data — icon names, emoji sets, design system constants.                                                                                                                               |
| `src/utils/`      | Pure utility functions (safe HTML, helpers).                                                                                                                                                 |
| `src/server/`     | Server-only utilities (ServerFlex, ServerGrid) for SSR-compatible rendering.                                                                                                                 |
| `src/__tests__/`  | Unit and integration tests (Vitest).                                                                                                                                                         |
| `src/icons.ts`    | Icon name constants and mapping.                                                                                                                                                             |
| `src/index.ts`    | Public API barrel — everything exported from here is available to consumers.                                                                                                                 |
| `ai/`             | AI codegen harness — manifest, task bundles, component slices, examples.                                                                                                                     |
| `scripts/`        | Build helpers — emoji data generation, AI spec generation, file copying.                                                                                                                     |
| `dist/`           | Build output (JS, CSS, types). Generated, not committed.                                                                                                                                     |

### Key conventions

- **Props interfaces** live in `src/interfaces.ts` or colocated in the component file.
- **Tokens** follow the pattern `--{category}-{property}-{weight}` (e.g., `--brand-background-strong`).
- **SCSS modules** use the `.module.scss` convention for scoped styles. Global utilities go in `src/styles/`.
- **Components** use `forwardRef` and accept a `className`/`style` override. Spread remaining props to the root element.
- **Exports** go through `src/components/index.ts` → `src/index.ts`. Always add new components to both.

---

## `apps/dev` — development sandbox

Local playground for developing and testing components. Routes are at `src/app/`. The main test page is `src/components/ComponentsCheckPage.tsx` which renders live variations of every component.

```bash
cd apps/dev && pnpm dev   # http://localhost:3000
```

---

## `apps/docs` — documentation site

The public docs site at [docs.once-ui.com](https://docs.once-ui.com). Content lives in `src/content/once-ui/` as MDX files. Each component has its own MDX page with previews, code examples, and API tables.

```bash
cd apps/docs && pnpm dev   # http://localhost:3000
```

---

## Build pipeline

```bash
pnpm install          # installs all workspaces + builds core via postinstall
pnpm --filter @once-ui-system/core build   # rebuild the library
```

The library build: `tsc` (types + JS) → `sass` (tokens.css + styles.css) → `copy-files` (AI artifacts, styles to dist). Turborepo caches outputs across runs.

---

## Where to contribute

| What you want to do                           | Where to go                                       |
| --------------------------------------------- | ------------------------------------------------- |
| Fix or add a component                        | `packages/core/src/components/`                   |
| Fix or add a complex module (CodeBlock, etc.) | `packages/core/src/modules/`                      |
| Change colors, typography, spacing tokens     | `packages/core/src/tokens/`                       |
| Add or modify utility classes                 | `packages/core/src/styles/`                       |
| Add a new shared type                         | `packages/core/src/types.ts`                      |
| Test a component visually                     | `apps/dev/src/components/ComponentsCheckPage.tsx` |
| Update or add docs page                       | `apps/docs/src/content/once-ui/`                  |
| Change the AI codegen harness                 | `packages/core/ai/`                               |
| Run tests                                     | `pnpm --filter @once-ui-system/core test`         |
