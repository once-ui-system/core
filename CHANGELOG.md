# Changelog

All notable changes to `@once-ui-system/core` are documented in this file. It is the
source of truth for release content going forward — GitHub release notes and any
published changelog pages are generated from it, not the other way around.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and
version numbers follow the criteria defined in [RELEASING.md](RELEASING.md).

Entries before 1.7.13 are reconstructed from GitHub releases and git history and may be
incomplete; reconciling them against actual npm release history is a scheduled roadmap
item (see `ROADMAP.md`, Week 4).

## [Unreleased] — proposed as 1.8.0

Proposed release bundling community PR [#115](https://github.com/once-ui-system/core/pull/115)
(@divyanshudhruv), the Prism grammar fix [#117](https://github.com/once-ui-system/core/pull/117),
and the dependency-advisory patches. Classified **minor**, not patch: it adds new
component props and widens `TextWeight`, swaps a runtime dependency
(`classnames` → `clsx`), and changes the package `exports` map. Final contents and the
publish itself are the maintainer's call.

### Added

- `Dialog`: `flush` prop (full-bleed, headerless dialogs) and `hideClose` prop ([#115])
- `Checkbox` / `RadioButton`: `hoverable` prop to suppress the hover pulse ([#115])
- `CodeBlock`: `background` and `hideCode` props ([#115])
- `TextWeight`: new `normal` (400) and `medium` (500) variants with matching
  `--font-weight-display-*` tokens and `.font-normal` / `.font-medium` utilities ([#115])
- Per-component responsive breakpoint prop types (`FlexBreakpointProps`,
  `GridBreakpointProps`, `TextBreakpointProps`, …) ([#115])

### Fixed

- `Checkbox` / `RadioButton`: SSR hydration mismatches — ids now come from `useId()`
  instead of `Math.random()` ([#115])
- `RadioButton`: unchecked border visible in dark mode ([#115])
- Charts (`BarChart`, `LineChart`, `LineBarChart`, `PieChart`): empty charts no longer
  collapse to zero height ([#115])
- `CodeBlock`: Prism grammars now resolve for `md`, `mdx`, `dockerfile`, and shell
  aliases (`sh`/`shell`/`zsh`); plain-text languages no longer warn ([#117])
- Sass deprecation warning from an unused `@import` in `Toaster.module.scss` ([#115])

### Changed

- `classnames` replaced with `clsx` (identical API, smaller bundle) ([#115])
- Package `exports` map: `require` conditions replaced with `types` conditions on all
  subpaths — flagged during review; see [#115] for the CJS-consumer implications
- Several components converted from `React.FC` to `forwardRef` ([#115])
- `DropdownWrapper` floating-ui sizing/flip behavior (affects `Select`, `DateInput`,
  `DateRangeInput`, `ContextMenu`, `EmojiPicker`, `MegaMenu`) ([#115])
- `DatePicker`: year picker layout simplified, default year range widened to ±25 ([#115])
- Runtime deps bumped within their majors: `@floating-ui/react-dom`, `date-fns`,
  `react-icons`, `recharts`; `sharp` peer range widened to allow `^0.35` ([#115])

### Security

- Patched 7 transitive dependency advisories via `pnpm.overrides` (`postcss`, `ws`,
  `flatted`, `yaml`, `immutable`, `fast-uri`, `@eslint/plugin-kit`). None of the
  package's own runtime dependencies were affected — see the 2026-07-28 triage in
  `ROADMAP.md` §5.

[#115]: https://github.com/once-ui-system/core/pull/115
[#117]: https://github.com/once-ui-system/core/pull/117

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
