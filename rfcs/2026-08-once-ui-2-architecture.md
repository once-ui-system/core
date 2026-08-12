# RFC: Once UI 2.0 — package architecture

- **Status:** Draft — needs Lorant's go/no-go (Roadmap Week 3 gate)
- **Date:** 2026-08-12
- **Owner:** Lorant (sign-off) · drafted from verified repo state at `packages/core` v1.8.2
- **Supersedes:** the Week 3 sketch in `ROADMAP.md` ("core / blocks / server") — see §9 for how the two reconcile

## 1. Summary

Split the single `@once-ui-system/core` package into a small family of scoped
packages so that:

1. **Foundations (tokens + styles) stand alone** — usable from any stack,
   including non-React ones.
2. **Data-viz is opt-in** — `recharts` stops being a dependency for consumers
   who never render a chart.
3. **Next.js becomes optional** — components fall back to standard DOM
   (`<a>`, `<img>`, History API) when Next is absent; a thin bindings package
   restores the Next-optimized behavior.
4. **Test coverage becomes a release gate**, not an afterthought — including
   the package-resolution tests that would have caught the 1.8.0 `exports`
   regression class before review.

This is the 2.0 breaking release. Everything before the final peer-dependency
flip ships incrementally on 1.x.

## 2. Verified current state

Measured in-repo at v1.8.2 — not assumed:

| Concern | Reality |
| --- | --- |
| Next.js imports | **7 files only:** `components/Media.tsx` (next/image), `components/ElementType.tsx` + `components/Logo.tsx` (next/link), `modules/navigation/Kbar.tsx` + `MegaMenu.tsx` (next/navigation), `modules/seo/Schema.tsx` (next/script), `server/og-utils.ts` (next/server). Yet `next >=15.5` is a hard peerDependency for every consumer. |
| Charts | Already isolated in `modules/data/` (7 chart components + gauges + legend/tooltip) behind a lazy `rechartsLoader.ts`, but `recharts ^3.10` is a hard `dependency` of core. |
| Tokens + styles | `src/tokens/` + `src/styles/` ≈ 8,100 lines of SCSS, compiled to `dist/css/tokens.css` + `dist/css/styles.css`. Zero React coupling. `sass` is a peerDependency of the whole package. |
| Tests | 4 suites (`Dialog`, `ScrollLock`, `og-url-validation`, `safe-html`), 92 passing tests. ~180 component files otherwise untested. |
| Existing seeds | `./server` subpath already isolated (`07d5f92`); `utils/MissingDependency.tsx` already implements a "dependency absent → render explanation" fallback; `ElementType` already renders a plain `<a>` for external links. |
| Consumers (in-org) | magic: 556 imports, all from the root entry. chirio: 33 root + 2 `./server`. supa-social: workspace apps on 1.8.2. All root-entry — a codemod migration is mechanical. |

The architecture cost of 2.0 is therefore **much smaller than the package
boundary suggests**: the framework coupling is 7 files, and the heaviest
dependency (recharts) is already behind a loader.

## 3. Target package layout

All packages live in this monorepo (`packages/*`), versioned in lockstep
(see §7).

```
packages/
├── foundations/   @once-ui-system/foundations   tokens + styles + token types
├── core/          @once-ui-system/core          React components, hooks, contexts (framework-agnostic)
├── data/          @once-ui-system/data          charts, gauges (owns recharts)
├── nextjs/        @once-ui-system/nextjs        Next.js bindings + server utils (owns next peer)
└── codemod/       @once-ui-system/codemod       1.x → 2.0 import rewriter (dev-time only)
```

### `@once-ui-system/foundations`

- Contents: `src/tokens/`, `src/styles/`, plus the token-value types that
  today live in `types.ts` (`SpacingToken`, `RadiusSize`, `ColorScheme`, …)
  and the theme/scheme data-attribute contract.
- **No React, no JS runtime requirement.** Ships compiled
  `tokens.css` / `styles.css` plus the SCSS sources for teams that want to
  build custom themes. This is the package a Vue/Svelte/plain-HTML project
  can adopt.
- Consumers of `sass` sources opt in; CSS-only consumers need **no sass
  peer dependency** — this removes sass from core's peer list entirely.

### `@once-ui-system/core` (2.0)

- React components, hooks, contexts. Depends on `foundations`.
- **No `next` peer dependency, no `recharts` dependency.**
- Framework coupling is resolved by an **adapter provider** (§4).
- Keeps the existing subpath exports map shape (`./components`, `./hooks`,
  `./contexts`, …) — the barrel structure survives the split.

### `@once-ui-system/data`

- Everything in `modules/data/` today. Owns the `recharts` dependency
  (kept behind the existing lazy loader so SSR/code-splitting behavior is
  unchanged). Depends on `core` for chart chrome (`ChartHeader`, `Legend`
  compose core primitives).
- Consumers who don't chart never download recharts (~430 kB before
  compression) or its d3 tree.

### `@once-ui-system/nextjs`

- The 7 Next-coupled surfaces, re-exported with their Next behavior:
  `Media` (next/image), link adapter (next/link), navigation adapter
  (next/navigation for `Kbar`/`MegaMenu`), `Schema`/`Meta` (next/script,
  App Router metadata helpers), and today's `./server` og-utils.
- Owns the `next >=15.5` peer dependency and the optional `sharp` peer.
- Primary export is `OnceUINextProvider` (or provider props) that plugs the
  Next adapters into core — one line in `layout.tsx` and every core
  component silently upgrades to next/image + next/link.

### `@once-ui-system/codemod`

- jscodeshift/ts-morph transform: rewrites 1.x imports to 2.0 packages,
  flags chart usages (add `data` dep), flags server-util usages (add
  `nextjs` dep). magic's 556 root-entry imports are exactly the shape this
  handles mechanically.

## 4. Framework adapter design (the "fallback from Next" mechanism)

Follow the proven pattern (Chakra, Mantine, React-Aria all converged here):
core defines a small **adapter context** with DOM-standard defaults, and
framework packages override it.

```tsx
// core: contexts/AdapterProvider.tsx
interface OnceUIAdapters {
  Link: React.ComponentType<AdapterLinkProps>;    // default: <a>
  Image: React.ComponentType<AdapterImageProps>;  // default: <img> (lazy, srcSet passthrough)
  usePathname: () => string;                       // default: window.location + popstate
  useNavigate: () => (href: string) => void;       // default: history.pushState / location.assign
}
```

- `ElementType`, `Logo`, `SmartLink` render `adapters.Link` for internal
  hrefs (external links already use plain `<a>` today — unchanged).
- `Media` renders `adapters.Image`; the DOM default supports
  `loading="lazy"`, `sizes`, and aspect-ratio exactly as today minus Next's
  optimizer. The existing `unoptimized` prop becomes the default behavior of
  the default adapter — no API change for Next users.
- `Kbar`/`MegaMenu` consume `usePathname`/`useNavigate` from the adapter
  instead of importing next/navigation. They move back from "Next-only" to
  core, which is where they belong once decoupled.
- `@once-ui-system/nextjs` ships the four Next implementations and a
  provider that installs them.

**Hard rule:** core must never `import "next/*"`, enforced by a lint rule
and a CI check (§6), so the boundary cannot silently regress the way
server-only code leaked before `07d5f92`.

What stays Next-only (no fallback, lives in `nextjs`): `Schema`/`Meta`
(App Router metadata model), og-utils (`NextResponse`), anything importing
`next/server`.

## 5. Test-coverage plan

Coverage today protects almost nothing; 2.0 moves code across package
boundaries, so **tests land before extraction, not after**. Ordered by
protection-per-effort:

1. **Package-contract tests (new, highest value).** For each built package:
   `publint` + `arethetypeswrong` in CI, plus install-the-tarball fixtures —
   a Next app, a Vite React app, and a bare-node CJS `require()`. This is
   the test class that (a) would have caught the #115 `exports`/`require`
   regression and (b) is the only real proof of the 2.0 promise "works
   without Next".
2. **Interaction tests (Vitest + Testing Library).** Target the ~20
   most-used interactive components first — forms (Input, Select, Checkbox,
   Switch, DatePicker), overlays (Dialog, DropdownWrapper, ContextMenu,
   HoverCard), disclosure (Accordion), navigation (Kbar). Aligns with the
   roadmap's Week 5 a11y pass: write the a11y assertions (keyboard nav,
   ARIA, focus trap) into these same tests via `vitest-axe`.
3. **Adapter-fallback tests.** Every adapter default rendered without any
   provider (jsdom): links navigate, images lazy-load, Kbar filters and
   navigates via History API. Run the same suite again with mock Next
   adapters installed to prove behavioral parity.
4. **Type tests** (`vitest --typecheck` + `expect-type`) for the public
   prop surfaces, so prop renames/widenings (the `TextWeight` class of
   change) are explicit diffs.
5. **Token/CSS snapshot guard.** Compiled `tokens.css`/`styles.css` checked
   against a committed snapshot; a token rename or removal fails CI until
   the snapshot is intentionally updated — makes the foundations package's
   API changes reviewable.
6. **Visual regression (lightweight).** Playwright screenshots of
   `apps/dev`'s `ComponentsCheckPage` per theme (light/dark), diffed in CI.
   Defer Storybook/Chromatic — the check page already exists and covers
   every component.
7. **Coverage ratchet.** Per-package V8 coverage thresholds in CI that only
   go up: start at the measured baseline, raise with each milestone. No
   blanket "80% or bust" — ratcheting avoids a coverage-theater sprint.

## 6. Tooling & infrastructure changes

- **Versioning/publishing: Changesets**, fixed (lockstep) version group for
  all runtime packages. `RELEASING.md` gains a section on multi-package
  releases; the "Lorant executes publish" rule is unchanged.
- **Build:** keep `tsc` + sass per package (it works and preserves the
  current dist shape); each package gets its own exports map with
  `types`/`import`/`require` conditions, validated by publint in CI
  (see §5.1) rather than by review vigilance.
- **Boundary enforcement:** Biome/dependency-cruiser rules — core may not
  import `next/*` or `recharts`; foundations may not import React;
  `data`/`nextjs` may not deep-import core internals (public API only).
- **AI harness becomes multi-package:** `ai/manifest.json` gains a package
  field per component; `catalog.json` splits per package with a root
  aggregate; `rules.compact.md` documents the adapter provider. The Week 2
  `llms.txt` work should emit one index per package plus a root map, so
  agent consumers resolve "which package do I install" without guessing.
- **Bundle budgets:** `size-limit` entries for core root import,
  one leaf component, and `data`'s lazy chunk — regression-gated in CI.
- **RSC posture (decide in review):** recommendation — keep today's model
  (server-compatible primitives + `"use client"` leaves, `ServerFlex`/
  `ServerGrid` intact); do not attempt a full RSC re-architecture inside
  2.0. One breaking axis per major.

## 7. Migration & compatibility

- **`@once-ui-system/core` keeps its name** as the React package — the
  2.0 root import surface stays close to 1.x, so most consumers upgrade by
  (a) installing `foundations` (or letting core's dependency pull it),
  (b) adding `nextjs` + provider if they're on Next, (c) adding `data` if
  they chart. The codemod automates all three.
- Core 2.0 re-exports foundations' token types (`SpacingToken` etc.) so
  type imports don't break.
- CSS entry compatibility: `@once-ui-system/core/css/tokens.css` remains as
  a re-export of foundations' CSS for one major, marked deprecated.
- Migration guide ships with the release (roadmap Week 7 already reserves
  this); in-org proof: run the codemod on **chirio** first (35 imports,
  uses `./server` — exercises the `nextjs` move), then magic (556 imports,
  scale test), before publishing 2.0.

## 8. Sequencing

Each phase is shippable and reversible; only Phase 5 is breaking.

| Phase | Ships as | Content | Gate |
| --- | --- | --- | --- |
| 0 | 1.x CI | Test infrastructure first: publint/attw + tarball fixtures, interaction tests for top-20 components, CSS snapshot guard, boundary lint rules | this RFC approved |
| 1 | 1.9 minor | Extract `foundations` (tokens/styles/token types); core depends on it and re-exports everything — zero consumer change | Phase 0 green |
| 2 | 1.9/1.10 minor | Adapter provider inside core with DOM defaults; Next imports become the *installed defaults* when `next` resolves (behavior identical for Next users); adapter-fallback tests | Phase 1 |
| 3 | 1.10 minor | Extract `data` package; core's chart exports become deprecated re-exports; recharts stays a core dep until 2.0 (non-breaking) | Phase 2 |
| 4 | prerelease | Extract `nextjs` package; codemod written; chirio + magic migrated as canaries on 2.0.0-rc | Phase 3 |
| 5 | **2.0.0** | Flip: core drops `next`/`recharts`/`sass` peers+deps, deprecated re-exports removed, migration guide + changelog published | Lorant's release sign-off |

Estimated effort respects the existing 8-week roadmap: Phases 0–1 fit
Weeks 3–5 alongside the planned a11y/regression work (the test items are
shared); Phases 2–3 land within the Week 6 minor; Phases 4–5 are the
next-quarter headline, which Week 8's planning slot should schedule.

## 9. Relationship to the ROADMAP Week 3 sketch

The roadmap sketched `core / blocks / server`. This RFC keeps the *server
isolation* goal (absorbed into `nextjs`) and *defers the blocks split*: a
`blocks` (compositions) package has no dependency-weight or
framework-coupling payoff today — it's an organizational split, and doing
it inside 2.0 doubles the migration surface for no consumer benefit. It
remains a candidate for 2.x once Studio's registry work makes the
primitives/compositions boundary load-bearing.

## 10. Open decisions (need input)

1. **Package naming:** `foundations` vs `tokens`; `nextjs` vs `next`
   (npm allows `@once-ui-system/next` but it reads ambiguously in imports).
2. **Icons:** `react-icons` stays a core dependency (tree-shakeable) or
   splits into an optional icons package. Recommendation: stay in core for
   2.0; revisit if size-limit data argues otherwise.
3. **Lockstep vs independent versions.** Recommendation: lockstep through
   2.x — the support matrix of independent versions isn't worth it at
   this team size.
4. **Sass sources in foundations:** ship SCSS sources for theme authors
   (recommended) or compiled CSS only.
5. **RSC posture** per §6 — confirm "no RSC re-architecture in 2.0".
