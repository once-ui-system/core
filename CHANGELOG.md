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

Heading to **2.0**, not to 1.9. `package.json` carries `2.0.0-alpha.0` so
nothing here can be published as a version nobody chose — 1.9.0 was a working
number bumped ahead of any release decision, and it is now skipped entirely.

The `ThemeInit` fix that briefly lived under a 1.9.0 heading shipped instead as
**1.8.4** (published 2026-08-28), cut from the tree that produced the published
1.8.3 so it reached `^1.8.x` consumers with nothing to migrate. Its entry is
below, in its own release.

Classification is **open**. The framework adapter below is a migration step for
Next.js apps, which is not a minor — see the release PR for the options.

**One migration step for Next.js apps.** No component, prop, export, token, or
CSS class is removed or renamed; no type union narrows; no peer-dependency floor
moves; the package installs exactly the same dependency set as 1.8.3. But
`ElementType` (which backs `SmartLink` and any `Button` / `Card` /
`ToggleButton` with `href`), `Media`, `Logo`, `MegaMenu` and `Kbar` now render
through the adapter layer, whose defaults are plain DOM — `<a>`, `<img>`,
`window.location.assign`. Keeping 1.8.x behavior is a one-line change — the
import path for `LayoutProvider`:

```diff
- import { LayoutProvider } from "@once-ui-system/core";
+ import { LayoutProvider } from "@once-ui-system/core/next";
```

That provider is core's `LayoutProvider` with the Next adapters already
installed. No provider is added to the tree and no props change. Apps that
compose `AdapterProvider` themselves can keep using `NextAdapterProvider`
directly.

Without either, internal links full-page reload and images skip `next/image`
optimization. The DOM fallbacks are what make core usable outside Next, and are
covered by `adapter-fallbacks.test.tsx`.

Automatic detection was investigated and rejected on evidence rather than
taste. The bundler half works — a guarded `await import("next/link")` builds
clean under esbuild and Vite with no Next installed, and degrades to the DOM
fallback. React is the blocker: the DOM `useNavigate` returns a closure while
the Next one calls `useRouter` and `useCallback`, so swapping implementations
after mount breaks the rules of hooks. Resolution must therefore settle before
the first render, and a browser bundle has no synchronous way to conditionally
resolve an optional module.

### Breaking

**Prop API standardisation.** Every place where one prop name carried two
meanings, or one meaning went by two names, is resolved. All of it is
mechanical: `scripts/codemod-2.0.mjs` applies the renames component-scoped,
and running it twice is a no-op.

```bash
node scripts/codemod-2.0.mjs src
```

Boolean props that toggle visibility now read `showX`, leaving the plain name
for the thing itself:

| Component | 1.8.x | 2.0 |
| --- | --- | --- |
| `ProgressBar` | `label?: boolean` | `showLabel` |
| `Feedback`, `Toast` | `icon?: boolean` | `showIcon` |
| `DataTooltip` | `colors?: boolean` | `showSwatches` |

State props drop the `is`/`has` prefix, restoring the convention the docs
already prescribed (`basics/components` — "use `open` instead of `isOpen`"):

| Component | 1.8.x | 2.0 |
| --- | --- | --- |
| `Dialog`, `Modal`, `DatePicker`, `DropdownWrapper`, `EmojiPickerDropdown`, `KbarContent` | `isOpen` | `open` |
| `Checkbox`, `RadioButton`, `Switch` | `isChecked` | `checked` |
| `Checkbox` | `isIndeterminate` | `indeterminate` |
| `DatePicker`, `DropdownWrapper` | `isNested` | `nested` |
| `NavIcon` | `isActive` | `active` |
| `Input`, `Textarea`, `Option` | `hasPrefix` / `hasSuffix` | `prefix` / `suffix` |

Four of those names were held by React's own DOM attribute types — `checked`
and `size` on `InputHTMLAttributes`, `prefix` on the base `HTMLAttributes` (the
RDFa attribute) — which is why the prefixes existed at all. Those components
now `Omit` the inherited declaration and declare their own. The cost is that
the native attribute can no longer be forwarded: `<Input size>` is the token
scale, not the HTML character-width attribute.

`radius` now means one thing everywhere — the roundness scale that
`StyleProps` has always defined. Corner selection, which had been overloading
the same name on five components, moves to `corners`:

```diff
- <Button radius="top-left" />
+ <Button corners="top-left" />
  <Button radius="none" />   // unchanged — "none" is roundness, not a corner
```

Affects `Button`, `IconButton`, `Input`, `Textarea`, `ToggleButton`. This is
the one rename the codemod decides by value rather than by name; a computed
`radius={expr}` is reported rather than rewritten.

`variant` now means appearance everywhere. `Pulse` and `Tag` were using it
for a **colour scheme**, which is why the prop had seven incompatible value
spaces across thirteen components; both now take `scheme`.

**Timing props are milliseconds, consistently.** An audit found the library was
split three ways: most timings were already ms (`Animation.duration` and
`.delay`, `TypeFx.speed`/`.delay`, `Hover.delay`/`.hideDelay`,
`GlitchFx.interval`, `Carousel.play.interval`, `CountFx.speed`,
`RevealFx.speed`), two were seconds, and four `speed` props on
`CelebrationFx`, `WeatherFx`, `MatrixFx` and `Particle` are unitless
multipliers that are not durations at all and are unchanged. The two outliers
move to ms:

```diff
- <RevealFx delay={0.2} />        <ShineFx speed={0.75} />
+ <RevealFx delay={200} />        <ShineFx speed={750} />
```

`RevealFx` was the sharpest case: its `delay` was seconds while its own
`speed`, on the next line of the same interface, was already milliseconds.

**`Skeleton` drops its second size scale.** It extends `Flex`, so width is now
expressed the way it is on any other element — `width="80%"`, `maxWidth={24}` —
instead of a five-step scale that only ever meant percentages. What remains is
`size`: the height of a `line`, the diameter of a `circle`. `delay` becomes
milliseconds rather than a `"1".."6"` index into six fixed classes.

```diff
- <Skeleton shape="line" height="s" width="l" delay="3" />
+ <Skeleton shape="line" size="s" width="75%" delay={300} />
```

**`fill` means layout everywhere.** `Media`, `Carousel` and `Swiper` each
declared a `fill` of their own, shadowing the `StyleProps` layout prop of the
same name that every Flex-derived component has (`fillWidth` + `fillHeight`).
So `<Media fill />` did not fill anything — it dropped the intrinsic aspect
ratio and handed sizing to the parent, which is a reasonable thing to want and
not remotely what the name says. That behaviour is now `stretch`, and `fill` on
those three means what it means on everything else.

```diff
- <Media fill />        <Carousel fill />        <Swiper fill />
+ <Media stretch />     <Carousel stretch />     <Swiper stretch />
```

**Colour props that paint into SVG accept tokens again.** `color` on
`LinearGauge`, `RadialGauge`, `Particle` and the chart module, and
`colorStart` / `colorEnd` / `color` on `Background`'s gradient, dots, grid and
lines, were typed as bare `string` — so a design token was accepted but never
suggested, and a typo in one was never caught. They now take `ColorValue`,
which is `Colors | (string & {})`: tokens autocomplete, and a raw `#fff`,
`rgb(...)` or `var(...)` still passes, because these values are painted into
SVG rather than applied through a class.

Other divergences resolved:

- `Input` and `Textarea` take `size` instead of `height`. It was always a
  t-shirt scale rather than a dimension, and only spelled `height` because
  `size` was inherited from the DOM.
- `SegmentedControl` becomes an ordinary controlled input: `selected` → `value`,
  `onToggle` → `onChange`, `defaultSelected` → `defaultValue`. `selected` is a
  boolean on the five other components that have it, and `onToggle` is
  `() => void` on the other four.
- `RevealFx` takes `revealed` instead of `trigger`. It is controlled state;
  `trigger` elsewhere is either the element that opens something or a mode union.
- `ColorInput`'s `onChange` hands back the value, `(value: string) => void`,
  like every other `onChange` in the library, instead of a hand-built
  `ChangeEvent`. **The codemod flags this one but cannot rewrite the callback
  body** — the signature changed, so the handler needs a human.

Components deriving their props from `Input` (`Select`, `NumberInput`,
`TagInput`, `ColorInput`, `DateInput`, `DateRangeInput`, `PasswordInput`) and
from `DropdownWrapper` (`EmojiPickerDropdown`) inherit these renames; the
codemod knows their tags. Property accesses on `ComponentProps<typeof X>`
(`props.isChecked`) are not JSX and are surfaced by `tsc`, not rewritten.

### Fixed

- **`Media` honours `fillWidth={false}`.** It accepted the prop, destructured
  it, and then hardcoded `fillWidth` on the element anyway, so the value was
  silently discarded. Found while renaming `fill` above.
- **`SplitView` works on touch, and collapses to tabs on small screens.** The
  divider listened for `mousedown` and `mousemove` only, so on a touch device it
  could not be dragged at all — no amount of changing direction helped, because
  no drag ever started. It uses pointer events now, which cover mouse, pen and
  touch in one path, with pointer capture so the drag survives the finger
  leaving the handle.

  Below `collapseBelow` (default `s`) the split becomes tabs showing one panel
  at a time, since a resizable split is a poor pattern on a phone in either
  orientation: neither pane is usable at any ratio, and a drag handle competes
  with page scrolling. Pass `labels` to name the tabs.

  Two further faults fixed on the way: `defaultSplit`, `minSplit` and `maxSplit`
  were accepted and then ignored — the hook hardcoded 0.3, 0.2 and 0.8 — and the
  divider was pointer-only despite the docs claiming it was keyboard
  accessible. It is now a focusable `role="separator"` that arrow keys move in
  5% steps and that reports its position through `aria-valuenow`.

- **The date-and-time picker no longer corrupts the time as you edit it.** Two
  faults compounded into what looked like the field flipping between AM and PM
  while typing. `handleTimeChange` takes a 1–12 hour, but the minutes field and
  the AM/PM control both passed `selectedTime.hours`, which is 24-hour — so at
  9:31 PM, editing the minutes re-applied the PM offset (21 + 12 = 33),
  `setHours(33)` rolled the date forward a day, and the hour came back as 09.
  Every further edit compounded it. Verified in a browser: before, editing the
  minutes at `Aug 15, 21:31` produced `Aug 16, 09:45`; after, `Aug 15, 21:45`.
- **The time panel no longer disappears mid-edit.** `DateInput` keyed the picker
  on `value.getTime()`, so every hour, minute or AM/PM change altered the key
  and React unmounted and remounted the whole picker — resetting it to the
  calendar view while the dropdown stayed open, which reads as the picker
  closing itself. The key now depends only on open state; the picker already
  syncs to a changed `value` in an effect.
- **A dropdown no longer closes when a click lands on something unfocusable
  inside it.** `focusout` treated a null `relatedTarget` — the padding of a
  field, the gap between two stepper buttons, a label — as focus leaving the
  panel. A genuine outside click is already handled separately.

- **Icon-only controls announce what they do, not which glyph they use.**
  `IconButton` falls back to the icon *name* as its accessible label when given
  no `tooltip` and no `aria-label` — so a carousel control announced
  "chevronRight button" and table pagination announced "chevronDoubleLeft
  button". The fallback stays, because an unnamed button is worse than a badly
  named one, but core's own components no longer rely on it: 21 call sites
  across `Table`, `Carousel`, `DatePicker`, `ScrollContainer`, `CompareImage`,
  `PasswordInput`, `InteractiveDetails`, `StyleOverlay`, `CodeBlock` and
  `ChartHeader` now carry real labels, and a test fails the build if a new one
  appears.

  `StylePanel`'s four swatch pickers were worse than mislabelled: the click
  handler and `tabIndex` sit on a wrapping `Flex`, so the focusable element was
  a div with no role and no name at all, while the `IconButton` inside was
  decorative. The label, `role="button"` and `aria-pressed` now sit on the
  element that is actually the control.

- **`opacity={0}` and `zIndex={0}` now work.** Both are legal values — `Opacity`
  includes `0`, `zIndex` includes `-1` and `0` — and `.opacity-0` / `.z-index-0`
  ship in the stylesheet, but the class list guarded them on truthiness rather
  than presence, so the single most useful value of each prop (hide a layer, pin
  to the base stacking level) silently did nothing. The responsive `opacity`
  variants already had the correct check; the base value and all four `zIndex`
  breakpoints did not. Found while building a hover cross-fade, where both
  images rendered at full opacity, stacked.

### Added

- **`Logo` takes per-theme sources.** `icon` and `wordmark` now accept
  `{ light, dark }` as well as a plain string, so one element covers both
  themes instead of two rendered side by side with the `light` and `dark`
  props hiding one of them. A row of four client logos was eight elements and
  two places to keep in sync for every change; it is now four and one. Both
  assets are rendered and CSS picks, rather than reading the theme at runtime —
  that keeps `Logo` server-renderable and avoids a flash of the wrong mark on
  first paint. Plain strings are unchanged, and the whole-element `light` /
  `dark` props still work for gating a logo to one theme deliberately.
- **`Book`** — a book with a real 3D cover: perspective on the wrapper, a
  `preserve-3d` context shared by cover and page block, and pages hinged onto
  the cover's right edge, so the hover turn reads correctly from any angle
  rather than only head-on. Motion is hover-gated and disabled under
  `prefers-reduced-motion`; on touch the cover stays square-on. Links through
  `ElementType`, so it routes via the adapter like every other core link.
- **`MediaAudioPlayer`** — play/pause, a scrubbable progress bar and
  elapsed/total time, the audio counterpart to `MediaVideoPlayer` and imported
  from the same `./components/*` subpath rather than the root barrel. It takes
  an `onTimeUpdate` callback so a caller can synchronise something with
  playback — narration highlighting, a transcript, chapter markers — without
  the player needing to know what is being synchronised.
- **`Card` takes `selected`.** Picking one card out of a set — a plan, a
  template, an option in a multi-select list — was every app repainting the
  border and background by hand, each landing on slightly different tokens. The
  prop paints both from the brand scheme, keeps them through hover (the hover
  rule out-specified the background utility class, so a hand-rolled selected
  card went neutral the moment the pointer touched it), and, on a card that is
  actually clickable, announces the state as `aria-pressed`. Both colours are
  defaults: pass `background` or `border` to override either.
- **`Effect`** — one slot for the interchangeable ambient layers. `BlobFx`,
  `MatrixFx`, `WeatherFx`, `Particle` and `CelebrationFx` all paint a
  full-bleed decorative surface behind their content and are, in practice,
  alternatives to each other; swapping one for another meant changing an import
  and rewriting the positioning. `<Effect type="matrix" />` picks between them
  by value, so a template can expose its aesthetic as a single setting, and
  `type="none"` renders the content with no layer at all. `colors` and `speed`
  are shared across the set (`Particle` takes the first colour, `blob` is
  seeded rather than timed); per-effect blocks — `matrix={{ ... }}`,
  `weather={{ ... }}` — configure one without disturbing the others, so all of
  them can be set up front and still switched with one prop.
- **`Scrubber`** — a playhead over time, extracted from Scenetic's editor. With
  no tracks it is a seek bar; with tracks it is an editor timeline: stacked
  layers of blocks sharing one playhead, each selectable, movable and
  trimmable, with pointer events throughout so it works with a finger as well
  as a mouse, and a `role="slider"` track so the playhead is reachable without
  one. It is deliberately not `Timeline`, which lays out a sequence of steps
  down the page — the two were the same word for unrelated things, which is
  why this one is named for the gesture instead.

  Editing is offered, not applied: `onBlockChange` reports absolute times
  clamped to the timeline and measured from where the gesture started (not
  accumulated per pointer move, so a block cannot drift away from the pointer
  over a long drag), and the block renders wherever the caller puts it. A
  minimum length, overlap rules and snapping stay with the application, and
  refusing a change is simply not applying it. `onGestureStart` fires once per
  drag, which is one undo entry per gesture rather than one per pointer move.
  `onChange` and `onSelect` are both DOM handlers on the inherited
  `HTMLAttributes`, so they are omitted and redeclared — the same resolution
  the rest of 2.0 uses for `checked`, `size` and `prefix`.
- **`Setting`, `SettingGroup`, `SettingAxes` and `InfoTip`** — the settings row
  that Aveiro, Frametic and Scenetic had each grown a private copy of. Label
  (with an optional hover explainer and description) on the left, one control on
  the right, in a bordered row that stacks into a panel. Aveiro's version took
  every control as a typed prop — `switch`, `slider`, `dropdown`, `media` — so
  the component had to know about every control that would ever sit in it; this
  one takes the control as children and composes with anything, including
  controls that do not exist yet. `SettingGroup` nests sub-settings *inside* its
  box so the relationship survives a long scrolling panel, and `SettingAxes`
  carries the axes of one property side by side rather than as two rows that
  read as unrelated settings.
- `LayoutProvider` is now also exported from `@once-ui-system/core/next`, with the
  Next adapters pre-installed. It makes the adapter migration a single import-path
  change rather than a new provider in the tree, and it is what a codemod can apply
  mechanically. `NextAdapterProvider` is unchanged and still exported for apps that
  compose their own adapters.
- **Core installs and runs without Next.js.** `next` (along with `sass` and
  `sharp`) is now an optional peer dependency, and the last runtime `next/*`
  imports are gone: `Schema` emits a plain `<script type="application/ld+json">`
  instead of `next/script`, `server/og-utils` returns a standard `Response`
  instead of `NextResponse`, and `Meta.generate` declares its own return type
  rather than importing Next's `Metadata`. The only file in the package that
  touches `next/*` is the opt-in `@once-ui-system/core/next` adapter, and the
  framework-boundary test now pins the allowlist to that one file.

  Verified by packing the tarball and server-rendering `SmartLink`, `Button`,
  `Media`, `Row`, `Column`, `Text` and `Schema` in a React app with no `next`
  in `node_modules`.

  Next.js apps are unaffected in every respect except the adapter step above —
  the peer range is unchanged when Next *is* present.

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

- `@once-ui-system/foundations` was declared in core's **`dependencies`** as
  `workspace:*`. `pnpm publish` rewrites that protocol to the depended-on package's
  literal version, so the packed tarball declared a hard runtime dependency on
  `@once-ui-system/foundations@2.0.0-alpha.0` — an unpublished package. Every
  `npm install @once-ui-system/core` would have failed with E404, and a stable
  release would have pinned consumers to an alpha. Core has no runtime import of
  foundations (the build inlines its SCSS/CSS into `dist`), so it moves to
  `devDependencies`, which consumers never install. A new
  `publishable-dependencies.test.ts` fails on any workspace-protocol or pre-release
  range in `dependencies`; `publint` and `arethetypeswrong` both pass on the broken
  tarball, because they inspect the package's own structure rather than whether its
  dependency graph resolves.

## [1.8.4] — 2026-08-28

Classified **patch** per [RELEASING.md](RELEASING.md): a single bug fix, no
API change of any kind. Cut from the tree that produced the published 1.8.3
rather than from `main`, so it carries none of the 2.0 architecture work in
flight on the release branch — the fix reaches `^1.8.x` consumers on their
next install, with nothing to migrate.

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
