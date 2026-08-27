# @once-ui-system/foundations

Design foundations for the Once UI system: design tokens and utility styles.
Framework-agnostic — no React, no JS runtime. Usable from any stack that can
load a stylesheet.

## Usage

Compiled CSS (no sass required):

```ts
import "@once-ui-system/foundations/css/tokens.css";
import "@once-ui-system/foundations/css/styles.css";
```

SCSS sources, for theme authors:

```scss
@use "@once-ui-system/foundations/scss/styles/breakpoints.scss" as breakpoints;
```

## Layout

| Path | Purpose |
| --- | --- |
| `scss/tokens/` | Design tokens — colors, typography, shadows, borders, spacing, layout. Compiles to `dist/css/tokens.css`. |
| `scss/styles/` | Utility classes (`bg-surface`, `p-16`, `radius-m`, …) and the responsive breakpoint mixins. Compiles to `dist/css/styles.css`. |
| `test/` | CSS API-surface guard — snapshots token/class *names* so renames and removals fail CI until intentionally updated. |

This package is the extraction of `packages/core`'s former `src/tokens` and
`src/styles` trees (Once UI 2.0 Phase 1 — see
`rfcs/2026-08-once-ui-2-architecture.md`).
