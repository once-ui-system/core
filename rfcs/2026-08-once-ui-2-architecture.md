# RFC: Once UI 2.0 — package architecture

- **Status:** Accepted, with the package split narrowed — see §11. Built on
  `claude/once-ui-2-release-prep-6dkl9v`; the remaining gate is the 2.0 publish.
- **Date:** 2026-08-12 · package shape revised 2026-09-07
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
   (`<a>`, `<img>`, History API) when Next is absent; a thin bindings subpath
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
| Next.js imports | **8 files only:** `components/Media.tsx` (next/image), `components/ElementType.tsx` + `components/Logo.tsx` (next/link), `modules/navigation/Kbar.tsx` + `MegaMenu.tsx` (next/navigation), `modules/seo/Schema.tsx` (next/script), `modules/seo/Meta.tsx` (type-only `Metadata` import), `server/og-utils.ts` (next/server). Pinned by `src/__tests__/framework-boundary.test.ts`. Yet `next >=15.5` is a hard peerDependency for every consumer. |
| Charts | Already isolated in `modules/data/` (7 chart components + gauges + legend/tooltip) behind a lazy `rechartsLoader.ts`, but `recharts ^3.10` is a hard `dependency` of core. |
| Tokens + styles | `src/tokens/` + `src/styles/` ≈ 8,100 lines of SCSS, compiled to `dist/css/tokens.css` + `dist/css/styles.css`. Zero React coupling. `sass` is a peerDependency of the whole package. |
| Tests | 4 suites (`Dialog`, `ScrollLock`, `og-url-validation`, `safe-html`), 92 passing tests. ~180 component files otherwise untested. |
| Packaging reality | Measured with publint + arethetypeswrong on the packed 1.8.2 tarball: `dist/` is **ESM syntax in `.js` files with no `"type": "module"`**, and the compiled output uses extensionless directory imports (`export * from "./components"`), which Node's own loader rejects. Plain-Node `require()` *and* `import` of the package both fail — the package is **bundler-only today** (webpack/Turbopack/Vite resolve it; Node ≤20 does not, Node ≥22 partially via require(esm)). Additionally, the `./icons`, `./types`, and `./interfaces` subpaths pointed at `dist/<name>/index.js` while the build emits `dist/<name>.js` — unresolvable for every consumer including bundlers (fixed alongside this RFC; guarded by `src/__tests__/package-exports.test.ts`). |
| Existing seeds | `./server` subpath already isolated (`07d5f92`); `utils/MissingDependency.tsx` already implements a "dependency absent → render explanation" fallback; `ElementType` already renders a plain `<a>` for external links. |
| Consumers (in-org) | magic: 556 imports, all from the root entry. chirio: 33 root + 2 `./server`. supa-social: workspace apps on 1.8.2. All root-entry — a codemod migration is mechanical. |

The architecture cost of 2.0 is therefore **much smaller than the package
boundary suggests**: the framework coupling is 7 files, and the heaviest
dependency (recharts) is already behind a loader.

## 3. Target package layout

**Revised 2026-09-07 (Lorant).** Two published packages, not five. A package
earns its own name only if it is worth installing without the others, and
only foundations is: tokens and styles are framework-agnostic and useful to
anyone theming alongside the components rather than with them. Charts, the
Next bindings and the codemod are all meaningless without core, so they ship
as subpaths and a repo script rather than as packages with their own
versions, release notes and support matrix.

```
packages/
├── foundations/   @once-ui-system/foundations   tokens + styles + token types
└── core/          @once-ui-system/core          React components, hooks, contexts
                     ├── /data     charts, gauges         (optional peer: recharts)
                     ├── /code     CodeBlock              (optional peer: prismjs)
                     ├── /media    MediaUpload            (optional peer: compressorjs)
                     └── /next     Next.js bindings       (optional peer: next)

scripts/codemod-2.0.mjs                          1.x → 2.0 rewriter (repo script)
```

Subpaths are what make the heavy dependencies optional at all. A bundler
resolves `await import("recharts")` when it walks a barrel, so while `data`,
`code` and `media` were re-exported from the root, every consumer had all
three specifiers in its module graph — an app that rendered no chart still
failed to build without recharts installed, and the lazy import's `catch()`
never got the chance to run. Reaching them by subpath keeps the specifier out
of the graph of everyone who does not ask for it.

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

### `@once-ui-system/core/data`

- Everything in `modules/data/` today, reached at
  `@once-ui-system/core/data`. `recharts` is an **optional peer**: consumers
  who chart install it, and the existing lazy loader keeps SSR and
  code-splitting behaviour unchanged. `code` (prismjs) and `media`
  (compressorjs) follow the same shape.
- Consumers who don't chart never resolve recharts, never download it
  (~430 kB before compression, 9.5M installed) and never carry its d3 tree.
- Not a package: the chart chrome composes core primitives, so it has no
  meaning installed on its own.

### `@once-ui-system/core/next`

- The 8 Next-coupled surfaces, re-exported with their Next behavior:
  `Media` (next/image), link adapter (next/link), navigation adapter
  (next/navigation for `Kbar`/`MegaMenu`), `Schema`/`Meta` (next/script,
  App Router metadata helpers), and today's `./server` og-utils.
- Carries the `next` peer (optional) and the optional `sharp` peer.
- Primary export is a `LayoutProvider` with the Next adapters pre-installed —
  one import swap in `layout.tsx` and every core component upgrades to
  next/image + next/link.
- Not a package: Next bindings for Once UI are worthless without Once UI.

### The codemod

- `scripts/codemod-2.0.mjs`, run from this repo — a dev-time tool, not
  something anyone installs. It renames the changed props, migrates Skeleton's
  shape-dependent values, moves the relocated imports onto their subpaths, and
  points the stylesheet imports at foundations. Its own tests live beside it
  and run in `pnpm test`.

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
- `@once-ui-system/core/next` ships the four Next implementations and a
  `LayoutProvider` that installs them.

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
- **Build:** the "keep tsc as-is" option is off the table — the
  packed-tarball audit (§2 "Packaging reality") shows today's output is
  loadable only through bundlers. Each 2.0 package must emit output that
  passes publint + arethetypeswrong across all four resolution modes:
  either proper ESM (`"type": "module"` + explicit file extensions, e.g.
  `tsc` with NodeNext resolution) or a dual ESM/CJS build via a bundler
  (tsup/rolldown). Recommendation: **proper ESM-only with explicit
  extensions** — 2.0 is the moment to drop the broken-anyway `require`
  condition rather than start maintaining a dual build. Validated in CI
  by `check:package` (see §5.1), not review vigilance.
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
  (a) installing `foundations` for the stylesheets, (b) importing
  `@once-ui-system/core/next` in `layout.tsx` if they're on Next, and
  (c) installing `recharts`/`prismjs`/`compressorjs` only if they use the
  subpath that needs one. The codemod does every import edit; it cannot add
  a dependency to `package.json`, and says so.
- Core 2.0 re-exports foundations' token types (`SpacingToken` etc.) so
  type imports don't break.
- CSS entry compatibility: `@once-ui-system/core/css/tokens.css` remains for
  one major, serving byte-identical copies vendored from foundations at build
  time. The codemod repoints these imports at
  `@once-ui-system/foundations/css/*`; `apps/dev` and `apps/docs` migrated
  first, and the docs page that teaches the import teaches the new path.
- Migration guide ships with the release (roadmap Week 7 already reserves
  this). In-org proof, measured 2026-09-07 by installing the packed 2.0
  tarball into each app and running the codemod: **1149 type errors across
  six apps → 27**, three of them to zero, with production builds green.
  What remains is app design rather than migration — wrappers republishing
  the old `delay` string union as their own prop type, and the `ColorInput`
  handler signature. Two breaking changes are invisible to the compiler and
  belong in the guide: Skeleton's `width` default (a line that never named a
  width was 50% wide in 1.8.x and collapses to nothing in 2.0), and the
  images-and-links regression for a Next app that skips
  `@once-ui-system/core/next`.

## 8. Sequencing

Each phase is shippable and reversible; only Phase 5 is breaking.

| Phase | Ships as | Content | Gate |
| --- | --- | --- | --- |
| 0 | 1.x CI | Test infrastructure first: publint/attw + tarball fixtures, interaction tests for top-20 components, CSS snapshot guard, boundary lint rules | this RFC approved |
| 1 | 1.9 minor | Extract `foundations` (tokens/styles/token types); core depends on it and re-exports everything — zero consumer change | Phase 0 green |
| 2 | 1.9/1.10 minor | Adapter provider inside core with DOM defaults; Next imports become the *installed defaults* when `next` resolves (behavior identical for Next users); adapter-fallback tests | Phase 1 |
| 3 | **2.0** | `data`/`code`/`media` move to subpaths and their dependencies become optional peers. Breaking, so it lands in 2.0 rather than a minor: the root barrel is what put the specifiers in every consumer's graph, and nothing short of removing them from it makes the dependencies optional | Phase 2 |
| 4 | prerelease | `next` bindings on the `/next` subpath; codemod written and tested; the whole fleet migrated as canaries on the packed tarball | Phase 3 |
| 5 | **2.0.0** | Flip: `sass` peer dropped, deprecated CSS entries kept for one major, migration guide + changelog published. **Publish `foundations` alongside core** — the fleet cannot move off the vendored CSS shim until it exists on npm | Lorant's release sign-off |

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

## 10. Decisions

Resolved 2026-09-07 (Lorant), recorded here so the RFC stops contradicting
what is built:

1. **Package naming and count — settled.** Two packages: `foundations` and
   `core`. `nextjs` vs `next` is moot; the Next bindings are the
   `@once-ui-system/core/next` subpath. See §3.
2. **Sass sources in foundations — settled: ship them.** Already the case:
   `files` includes `scss`, and `./scss/*` is exported, so theme authors get
   sources and CSS-only consumers need no sass peer.
3. **Lockstep vs independent versions — settled: lockstep.** With two
   packages there is no support matrix worth maintaining; foundations and
   core both sit at `2.0.0-alpha.0`.

Still open, and blocking nothing yet:

4. **Icons.** `react-icons` stays a core dependency (tree-shakeable) or
   splits into an optional peer. It is **85M installed** — by far the
   largest thing a consumer downloads, dwarfing the 13.5M just made optional,
   though it tree-shakes to almost nothing in the bundle. Roadmap Week 7's
   "install → first component in under 5 minutes" is the frame for deciding.
   Same question, smaller, for `date-fns` (21M).
5. **RSC posture** per §6 — confirm "no RSC re-architecture in 2.0".

## 11. What changed since the draft

The draft proposed five packages. The build settled on two, for one reason
learned by running it: a package boundary is not what makes a dependency
optional — keeping the specifier out of the consumer's module graph is, and
a subpath does that just as well while costing no extra version, release
note or support matrix. `foundations` remains a package because it is the
one piece that means something without the rest.
