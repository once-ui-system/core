# Changelog

All notable changes to `@once-ui-system/core` are documented in this file. It is the
source of truth for release content going forward — GitHub release notes and any
published changelog pages are generated from it, not the other way around.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and
version numbers follow the criteria defined in [RELEASING.md](RELEASING.md).

Entries before 1.7.13 are reconstructed from GitHub releases and git history and may be
incomplete; reconciling them against actual npm release history is a scheduled roadmap
item (see `ROADMAP.md`, Week 4).

## [Unreleased]

## [1.9.0] — 2026-08-27

Classified **minor** per [RELEASING.md](RELEASING.md). The trigger is the
shared-internals change: core no longer imports `next/*` at runtime, and the
build now emits foundations' SCSS/CSS into `dist` as deprecated compat entries.
Everything else is additive or internal.

**One migration step for Next.js apps.** No component, prop, export, token, or
CSS class is removed or renamed; no type union narrows; no peer-dependency floor
moves; the package installs exactly the same dependency set as 1.8.3. But
`ElementType` (which backs `SmartLink` and any `Button` / `Card` /
`ToggleButton` with `href`), `Media`, `Logo`, `MegaMenu` and `Kbar` now render
through the adapter layer, whose defaults are plain DOM — `<a>`, `<img>`,
`window.location.assign`. To keep 1.8.x behavior, install the Next adapter once
in the root layout:

```tsx
import { NextAdapterProvider } from "@once-ui-system/core/next";
```

Without it, internal links full-page reload and images skip `next/image`
optimization. The DOM fallbacks are what make core usable outside Next, and are
covered by `adapter-fallbacks.test.tsx`.

`^1.8.x` ranges resolve to this release, so the ThemeInit fix reaches existing
projects on their next install without a version bump — and so does the adapter
change, which is why it needs the provider added at the same time.

### Added

- `@once-ui-system/foundations` — tokens, styles, and token-value types extracted
  into their own package (RFC Phase 1). It is **not published to npm** and is not a
  dependency of this release: core consumes it at build time only and inlines its
  SCSS/CSS into `dist`, so every existing import and CSS entry
  (`@once-ui-system/core/css/tokens.css`) keeps working and consumers install
  nothing new. Publishing it — so a non-React consumer can adopt it directly, and
  as the base the planned Tailwind token bridge maps onto — is a separate decision
  on its own timeline.
- Package-contract and boundary test infrastructure (RFC Phase 0): `check:package`
  (publint + arethetypeswrong), the exports-integrity test, a framework-boundary
  guard (core may not import `next/*`), CSS API-surface snapshots, token
  custom-property/attribute-selector snapshots, and seed interaction tests.

### Changed

- Core no longer imports `next/*` at runtime. Next.js apps keep 1.8.x behavior by
  installing `NextAdapterProvider` from `@once-ui-system/core/next` in the root
  layout; without it the five components listed above fall back to plain DOM.
  Flipping peer dependencies stays a 2.0 concern.

### Fixed

- `ThemeInit`: the inline theme-bootstrap script threw
  `ReferenceError: ThemeInit is not defined` on every page load in every consumer
  app. A `ThemeInit.displayName = "ThemeInit"` assignment had been injected *inside*
  the script's template literal (and the arrow function above it de-indented),
  so the emitted `<script>` referenced a module-scope binding that does not exist
  in the browser. The throw was swallowed by the script's own `try/catch`, which
  then hard-set `data-theme="dark"`.

  Effect: the script's whole point — applying the saved theme and style overrides
  *before* first paint — never ran. A visitor with `data-theme=light` saved got a
  dark flash on every navigation, and saved `data-brand`/`data-neutral` overrides
  flashed the config defaults until React hydrated and the provider corrected them.
  Present in source, so every published version carrying this file is affected.

  The `catch` fallback no longer hardcodes `dark` either: it resolves
  `prefers-color-scheme`, since forcing dark on a light-mode visitor is a worse
  failure than the one it is recovering from.

  A new `theme-init.test.tsx` parses *and executes* the emitted script against
  jsdom — asserting it references nothing from module scope, throws nothing, and
  actually applies saved theme and style overrides — so this class of corruption
  fails tests instead of shipping. Verified end-to-end in a consumer app: with
  a saved `light` theme and `cyan` brand on a dark-preferring OS, first paint went
  from `theme=dark, brand=blue` (plus the console error) to `theme=light,
  brand=cyan` with a clean console.

- `@once-ui-system/foundations` was declared in core's **`dependencies`** as
  `workspace:*`. `pnpm publish` rewrites that protocol to the depended-on package's
  literal version, so the 1.9.0 tarball declared a hard runtime dependency on
  `@once-ui-system/foundations@2.0.0-alpha.0` — an unpublished package. Every
  `npm install @once-ui-system/core@1.9.0` would have failed with E404, and a stable
  minor would have pinned consumers to an alpha. Core has no runtime import of
  foundations (the build inlines its SCSS/CSS into `dist`), so it moves to
  `devDependencies`, which consumers never install. A new
  `publishable-dependencies.test.ts` fails on any workspace-protocol or pre-release
  range in `dependencies`; `publint` and `arethetypeswrong` both pass on the broken
  tarball, because they inspect the package's own structure rather than whether its
  dependency graph resolves.

## [1.8.3] — 2026-08-26

Classified **patch** per [RELEASING.md](RELEASING.md): restores documented behavior
(broken subpath resolution) and AI-harness validity, with no API surface changes.

### Fixed

- The `./icons`, `./types`, and `./interfaces` subpath exports pointed at
  `dist/<name>/index.js` while the build emits `dist/<name>.js`, leaving all three
  unresolvable for every consumer (bundlers included) in the published 1.8.0–1.8.2.
  The exports map now points at the emitted files, and a new
  `package-exports.test.ts` fails on any exports path the build does not produce.
- The AI harness shipped in 1.8.2 was still stamped 1.8.1 (`ai/manifest.json`,
  `ai/catalog.json`, generated 2026-07-30). Artifacts are regenerated at 1.8.3, and a
  new `ai-manifest-sync.test.ts` enforces the AI-consumer rule from RELEASING.md —
  harness version must match package version — so this drift class now fails tests.
- `apps/docs/public/ai/` claimed to be "synced from @once-ui-system/core on build"
  but no sync step existed, so `docs.once-ui.com/ai/*` could serve stale or missing
  artifacts. A `sync-ai` script now runs before every docs dev/build.
- `DropdownWrapper` with `fillWidth`: the size middleware widened only the invisible
  floating container while the visible panel (`Dropdown`) stayed content-sized —
  on `-end` placements the panel rendered detached at the container's left edge,
  reading as broken positioning. The panel now fills the container.
- `DropdownWrapper` with `fillWidth`: removed the hidden 200px width floor
  (`Math.max(triggerWidth, 200)`). `fillWidth` now means exactly the trigger's
  width; small triggers no longer get a dropdown overhanging past their edge.
  Same class of fix as 1.8.2's removal of the 320px content-dropdown floor.

### Changed

- Backfilled changelog for 1.8.2 (below), which was published without an entry.

## [1.8.2] — 2026-08-02

Classified **patch**: single bug fix, no API surface changes. Published without a
changelog entry; backfilled in 1.8.3.

### Fixed

- Removed the forced 320px default min-width on content-sized dropdowns
  (`DropdownWrapper`), restoring content-driven sizing.

## [1.8.1] — 2026-07-30

Classified **patch** per [RELEASING.md](RELEASING.md): bug fixes restoring documented
behavior and AI-harness validity, with no API surface changes.

### Fixed

- `ai/gotchas.json` was invalid JSON in 1.8.0 — the `Icon.names` entry had lost its
  key line, so any consumer of the AI harness that parsed the file failed. Restored the
  key; the file now parses and all 21 gotcha entries are reachable.
- `Table`: corrected CSS module classes and design tokens (`--surface-background`,
  neutral borders, camelCase module classes aligned with `Table.tsx`) so sortable
  headers, column alignment, striped/hover rows, and sticky header render as intended.

### Changed (repo tooling, not published code)

- Biome configs migrated to the 2.5.6 schema (they trailed on 2.4.13 while the CLI was
  2.5.6), with git-ignore integration enabled and generated artifacts excluded from
  checks — lint now reports real findings in shipped source instead of noise from
  `dist/` and generated JSON. `apps/dev` and `apps/docs` got the missing
  `@biomejs/biome` devDependency so their `lint`/`format` scripts actually run.
- Removed dead ESLint remnants (`apps/dev/eslint.config.mjs`,
  `apps/docs/.eslintrc.json`, unused `eslint`/`eslint-config-next` dependencies) —
  Next 16 removed `next lint`, and all lint scripts already point at Biome.

### Security

- Patched 7 transitive dependency advisories via `pnpm.overrides` (`postcss`, `ws`,
  `flatted`, `yaml`, `immutable`, `fast-uri`, `@eslint/plugin-kit`), re-applied against
  the 1.8.0 lockfile, plus `sharp` pinned to `^0.35.3` (libvips CVEs; within the
  package's declared peer range). None of the package's own runtime dependencies were
  affected — see the triage entries in `ROADMAP.md` §5. Remaining audit findings are
  all app-level/dev major-version bumps (`next`, `vite`, `webpack`, `esbuild`,
  `brace-expansion` via minimatch@3), tracked as scoped follow-ups.

## [1.8.0] — 2026-07-29

Community PR [#115](https://github.com/once-ui-system/core/pull/115) (@divyanshudhruv),
the Prism grammar fix [#117](https://github.com/once-ui-system/core/pull/117), and the
release-integration fixes from [#120](https://github.com/once-ui-system/core/pull/120).
Classified **minor** per [RELEASING.md](RELEASING.md): new component props, `TextWeight`
widening, and a runtime dependency swap (`classnames` → `clsx`).

### Added

- `Dialog`: `flush` prop (full-bleed, headerless dialogs) and `hideClose` prop ([#115])
- `Checkbox` / `RadioButton`: `hoverable` prop to suppress the hover pulse ([#115])
- `CodeBlock`: `background` and `hideCode` props ([#115])
- `TextWeight`: new `normal` (400) and `medium` (500) variants with matching
  `--font-weight-display-*` tokens and `.font-normal` / `.font-medium` utilities ([#115])
- Per-component responsive breakpoint prop types (`FlexBreakpointProps`,
  `GridBreakpointProps`, `TextBreakpointProps`, …) ([#115])
- `unoptimized` prop on image-rendering components (`Carousel`, `CompareImage`,
  `OgCard`, `Swiper`) ([#120])

### Fixed

- `Checkbox` / `RadioButton`: SSR hydration mismatches — ids now come from `useId()`
  instead of `Math.random()` ([#115])
- `RadioButton`: unchecked border visible in dark mode ([#115])
- Charts (`BarChart`, `LineChart`, `LineBarChart`, `PieChart`): empty charts no longer
  collapse to zero height ([#115])
- `CodeBlock`: Prism grammars now resolve for `md`, `mdx`, `dockerfile`, and shell
  aliases (`sh`/`shell`/`zsh`); plain-text languages no longer warn ([#117])
- `ScrollLock`: regression fix from release integration; the four long-standing
  jsdom test failures (`Dialog` inert + `ScrollLock` wheel) now pass — full suite
  green at 92/92 ([#120])
- Sass deprecation warning from an unused `@import` in `Toaster.module.scss` ([#115])

### Changed

- `classnames` replaced with `clsx` (identical API, smaller bundle) ([#115])
- Package `exports` map: `types` conditions added on all subpaths (`types` first,
  `import`/`require` preserved — the interim `require` drop was caught in review and
  restored in [#115]); CJS consumers unaffected
- Several components converted from `React.FC` to `forwardRef` ([#115])
- `DropdownWrapper` floating-ui sizing/flip behavior (affects `Select`, `DateInput`,
  `DateRangeInput`, `ContextMenu`, `EmojiPicker`, `MegaMenu`) ([#115])
- `DatePicker`: year picker layout simplified, default year range widened to ±25 ([#115])
- Runtime deps bumped within their majors: `@floating-ui/react-dom`, `date-fns`,
  `react-icons`, `recharts`; `sharp` peer range widened to allow `^0.35` ([#115])

[#115]: https://github.com/once-ui-system/core/pull/115
[#117]: https://github.com/once-ui-system/core/pull/117
[#120]: https://github.com/once-ui-system/core/pull/120

## [1.7.13] — 2026-07-25

- Agent harness discovery: `AGENTS.md` + `ai/manifest.json` shipped in the npm package
  as the authoritative entry point for AI-assisted code generation
- `fix(server)`: stopped re-exporting `./server` from the main package entry — first
  step toward isolating server-only code
- Security: XSS fixes in `Schema` JSON-LD output and `CodeBlock` diff rendering
- Restored `DropdownWrapper`'s `isOpen` prop for backward compatibility
- Docs fixes across the documentation site

## [1.7.0] — 2026-05-06

First community-driven release. Highlights (full notes on
[GitHub](https://github.com/once-ui-system/core/releases/tag/v1.7.0)):

- Recharts, PrismJS, CompressorJS and Sharp became optional/peer dependencies
- New components: `ScrollContainer`, `SplitView`, `Modal`, `BlobFx`, `FadingLettersFx`
- Size and variant expansions across `Button`, `IconButton`, `ToggleButton`, `Input`,
  `Textarea`; `Media` video controls
- Versions 1.7.1–1.7.12 shipped to npm without GitHub releases; their contents are part
  of the Week 4 reconciliation

## [1.6.0] — 2026-02-03

- `Flex`/`Grid`: CSS-value size props, `translateX/Y`, numeric REM spacing, `border`
  boolean shorthands
- New utilities: `ScrollLock`, `ThemeInit`
- `Heading`/`Text`: `family` prop
- Full notes on [GitHub](https://github.com/once-ui-system/core/releases/tag/v1.6.0)

## Earlier

See [GitHub releases](https://github.com/once-ui-system/core/releases) for 1.5.x and
older.
