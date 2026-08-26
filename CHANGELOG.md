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
