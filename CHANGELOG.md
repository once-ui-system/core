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

### Fixed

- **`FadingLettersFx` no longer stalls while the page is busy.** It animated
  `filter: blur()`, which browsers cannot hand to the compositor (a changing
  blur radius moves pixels), so the letters ran on the main thread and froze
  mid-blur whenever script ran during their entrance: hydration, a chunk
  loading, a WebGL context starting. The blur is now fixed, on two copies of
  each letter drawn with `::before` and `::after` from a `data-letter`
  attribute, and only `opacity` and `transform` animate, so the whole effect
  runs on the compositor. The look is the old curve, sampled: a heavy blur,
  a light one, then the sharp letter, on the same timings and delays. Each
  letter now wraps its character in an inner span; the copies are generated
  content, so the text is still in the DOM once.
- **A collapsed `ThemeSwitcher` no longer loads open and then snaps shut.**
  The server cannot know the visitor's theme, so the group used to render
  with every option showing and collapse on hydration. It now renders at its
  one-option size, invisible, and appears once the active option is in place,
  with the swap unanimated. Touch devices, which always show every option,
  are unchanged.
- **`ThemeSwitcher direction="column"` reserves the space it draws.** The
  anchor was a hard-coded 40px square, but the options are 32px `IconButton`s
  in a 1px border: 34px. The extra 6px pushed the control off-centre in its
  row. The anchor, and the caps the options open and close to, now follow
  the button size.

## [2.0.0-alpha.2] — 2026-09-23

The third alpha preview, on the same **`alpha`** dist-tag. `npm install
@once-ui-system/core` still resolves the 1.8 line; asking for this one stays
deliberate:

```bash
npm i @once-ui-system/core@alpha
```

Classified as a pre-release of the 2.0 major. The `ScrollContainer` tile
defaults are removed rather than deprecated, which is a major-criteria change
("removing or renaming components, props, tokens, or CSS classes", and
"changing default behavior in ways that alter rendered output for existing
code") — it rides the 2.0 line rather than a minor, and existing carousels need
their shape passed in explicitly. Everything else here is additive or a fix.

Per the AI-consumer rule, `ai/manifest.json`, `ai/catalog.json` and
`ai/spec.json` are regenerated in this release: `ScrollContainer` gained six
props since alpha.1, so an agent validating against the previous harness would
have rejected all of them.

### Added

- **`ScrollContainer` moves a track instead of scrolling a box.** A scroll box
  cannot do any of the three things asked of a carousel: its contents are
  clipped at its own edge by definition, so no tile can peek past it; its
  scroll range has two hard ends, so there is nowhere for a wrap-around to go;
  and the browser owns the easing, so a drag can only set `scrollLeft` and
  hope. The track is now laid out once and moved with a transform, which
  removes all three limits at once and makes the motion a CSS transition the
  component controls.

  New with it: `infinite` continues past the last item into the first in the
  same direction, with no rewind and both controls always enabled; `markers`
  (`true`, `"top"` or `"bottom"`) shows how many items there are and which is
  in front, and jumps to one when pressed; `draggable` (on by default) has the
  track follow a mouse, pen or finger, claiming a gesture for one axis on its
  first movement so a vertical swipe still scrolls the page, and swallowing the
  click at the end of a drag so it does not also open the tile; `step` sets how
  many items a control press moves; and `clip` keeps everything inside the
  component's own box for callers who want the old edges back.

  **This changes existing carousels.** Tiles used to arrive with
  `aspectRatio="3/4"`, `border`, `radius="xl"` and a width range already set,
  so anything that was not a tall bordered portrait card had to override four
  properties before it could begin. A tile now contributes only what a track
  item cannot do without — refusing to shrink, and a `minWidth` floor so a
  carousel of fill-width content has something to fill. Shape and size come
  from the caller, through the same rest props that always landed on the tile.
  Because the browser is no longer doing the scrolling, a trackpad's horizontal
  gesture no longer moves the track, which is why drag is on by default and the
  controls are never hidden.

- **`ThemeSwitcher collapsed` can open downwards, with `direction="column"`.**
  The collapsed group grew sideways, in the flow of the layout, which works
  where it has room beside it and not where it has neighbours: the group
  widening pushes them along, and the option the pointer is resting on slides
  out from under it. In a header that is every time it opens.

  `direction="column"` splits the control into an anchor and a panel. The
  anchor is what the layout sees and stays the size of one option however many
  are showing; the panel is taken out of the flow and hung from the anchor, so
  it grows over the page instead of through the header. Measured in a 56px
  sticky header with neighbours on both sides: nothing beside it moves and the
  header does not change height.

  It opens downwards rather than centring on the active option. An open panel
  is 124px against a 56px header, so anchoring it on the second or third option
  would put its top edge 34px and 76px above the viewport.

  The active option leads. In fixed order the panel's first slot belongs to
  whichever theme is listed first, so the icon already under the pointer
  changes identity as the panel unrolls — hover the moon and the computer
  arrives under your cursor, and a click without looking sets the wrong theme.
  Leading with the active option keeps the invariant that the theme in force is
  the one in the anchor slot, before opening and after choosing. The reorder is
  done in the markup rather than with CSS `order`, so tab order and visual
  order stay the same thing, and stable keys mean a focused button keeps focus
  across the move.

  `direction` defaults to `"row"` and is ignored when the group is not
  collapsed, so nothing that already uses `ThemeSwitcher` changes. Devices that
  cannot hover still get the group always open, and there it takes its space in
  the layout rather than hanging over what is underneath.

- **`ScrollContainer` takes `active` and `onActiveChange`.** `active` brings an
  item to the front by its index, by the shorter way round when `infinite`;
  `onActiveChange` reports the item that arrived there, however it got there.
  Together they let something outside the component stand in for the markers —
  a row of names, a set of thumbnails, a table of contents — which previously
  was not possible at all: the index was internal state, and the forwarded ref
  was never attached to anything, so there was no handle on the run from
  outside.

  `active` is a command rather than a lock, and the effect that reads it is
  keyed on the prop alone. Were it to depend on where the run actually is,
  every drag would be undone a frame after it ended by an effect insisting on
  the last value the caller passed, and the run would fight the pointer. An
  `active` that never changes therefore does not pin the run in place;
  `onActiveChange` is how a caller stays level with it.

- **`ScrollContainer` takes `proximity`.** Tiles scale by their distance from
  the one in front, so the run has a focus that moves with it. It is continuous
  rather than stepped — the scale is computed from the live drag offset divided
  by the tile pitch, so halfway through a drag the outgoing and incoming tiles
  are the same size and the emphasis crosses between them as the pointer moves,
  instead of snapping when the track settles. `true` is a gentle default; a
  number is how much smaller each whole step away is, as a fraction. Tiles stop
  shrinking at 72% so a long run does not trail off into nothing. Off — the
  default — a tile carries no transform at all, not `scale(1)`, so it never
  becomes a containing block for anything the caller positioned inside it.

- **`Form`, a layout for a set of fields.** `density` carries the gap and the
  grouping as one decision, because they are one decision: `"stacked"` fuses
  the fields into a single control, with the borders of neighbours collapsed
  onto one hairline and only the outside of the group left round, while
  `"tight"` and `"spacious"` are ordinary gaps that leave every field its own
  border and radius. `columns` lays the fields out in a grid and takes a
  per-breakpoint map; a field can occupy more than one column with `span`;
  `size` sets the size of every field in the group, and a field that sets its
  own still wins.

  The corners are the point. Passing `corners="top" | "none" | "bottom"` down
  a stack is positional bookkeeping that breaks the moment a field is
  conditionally rendered or reordered — hide the third of four and the group
  ends on a square edge. `Form` derives them from the children that actually
  rendered and from where each one lands in the grid, so a ragged last row, a
  spanning field and a column count that changes with the viewport all come
  out right. A focused field is lifted above its neighbours, and nothing in
  the component clips, so the focus ring stays whole.

  `Input` and `Textarea` gained a `span` prop, read by `Form` and stripped
  before it reaches the DOM, and mark their bordered box with
  `data-surface="field"` so `Form` can reach the element that actually carries
  the radius. Children that do not mark a surface are laid out and spaced but
  keep their own corners.

- **Docs pages say whether you can install what they describe.** A `status`
  frontmatter field — `"alpha"` or `"unreleased"`, absent meaning available on
  `latest` — puts a tag in the sidebar and a notice under the page title.
  `VersionBanner` already said the site documents 2.0, but it says one thing to
  every page, and it cannot tell "shipped in the alpha" from "not published
  anywhere yet": it told both to install `@alpha`, which is wrong for the
  second. It is also above the sidebar, far from where someone arriving from a
  search result starts reading.

  Deliberately a separate axis from `navTag`. That one says *when something
  changed* and decays on a timer — grey at 30 days, gone at 60 — while
  availability stops being true only when a release makes it false, and a page
  can be both new and unreleased at once. Where both apply the sidebar shows
  availability, because in a column that narrow it is the more useful of the
  two.

  Applied to the six pages documenting components that do not exist in 1.8.5:
  `Book`, `Effect`, `InfoTip`, `NavItem`/`NavGroup`, `Scrubber` and `Setting`,
  verified against the published dist-tags rather than assumed. The media
  players page is left alone on purpose — its video half shipped in 1.8.5 and
  only the audio player is new, so the page as a whole is not alpha-only.

- **`Feedback` takes an `icon`.** It was locked to the variant's glyph, with
  `showIcon` only able to turn it off. `icon` accepts any `IconName`, so a
  custom name registered through `IconLibraryOverrides` works here too; leaving
  it out keeps the variant's icon.

- **`Placement`, `Side` and `Alignment` are exported from the package.** The
  `placement` prop of `Select`, `UserMenu`, `ContextMenu`, `CursorCard`,
  `DropdownWrapper` and `Animation` is now typed by our own union rather than
  the positioning library's. Previously all six emitted
  `import { Placement } from "@floating-ui/react-dom"` into their published
  declarations, so consumers resolved a dependency of ours to type a prop of
  ours, and changing positioning library would have been a breaking release
  over twelve string literals. The type is structurally identical, so existing
  code keeps compiling; `@floating-ui/react-dom` is unchanged and still does
  the positioning.

### Changed

- **`Particle` is now `ParticleFx`.** It was the one ambient effect without the
  `Fx` suffix, although `Effect` switches between it and `BlobFx`, `MatrixFx`,
  `WeatherFx` and `CelebrationFx`, and its docs page sat under Components. The
  page is now `/effects/particleFx`, and `/components/particle` redirects there.
  `Particle` is still exported as a `@deprecated` alias of the same component,
  so nothing breaks; it is removed in 3.0. The AI harness lists only
  `ParticleFx`, so generated code uses the new name. `Effect`'s
  `type="particle"` and `particle` props are unchanged: they are effect keys,
  like `blob` and `matrix`.

- **`SettingGroup` is one surface.** The header sat on whatever was behind it
  while the body it reveals painted `surface` on top, so opening a group read
  as a second panel stacked inside the first, and the border around it was the
  default opaque one. The background moves to the group itself, the body stops
  painting its own, and the outer border is `neutral-alpha-weak` — which is
  what a group nested in a panel needs, since it sits on whatever the panel is
  rather than on one assumed backdrop. The hairline between the header and the
  body stays: it is what separates the setting from the settings it gates.

- **A dropdown opens on the option it is already showing.** Every
  `DropdownWrapper`-based list — `Select`, `DatePicker`'s month and year
  selectors, an org switcher — opened focused on its *first* option regardless
  of the current value. On a long list that hides the answer: the year picker
  opened on 2001 with the chosen 2025 scrolled out of sight, and the arrow keys
  then walked from the top rather than from the selection. The panel now opens
  on the option marked `aria-selected="true"`, scrolled into view within the
  panel and never by scrolling the page, and falls back to the first enabled
  option for a list with no selection — a menu or a command palette behaves
  exactly as before. A selected option that is disabled is skipped, and a panel
  that leads with something other than its list, such as a searchable
  `Select`'s query field, still opens on that.

  `Option` already sets `aria-selected` from its `selected` prop, so lists
  built from `Option` need no change.

- **`useArrowNavigation` no longer writes `aria-selected`.** It set the
  attribute from `focusedIndex` on every keystroke, so a screen reader
  announced whichever option the arrow keys had reached as the selected one and
  the option the user had actually chosen as unselected. Highlighting is
  `data-highlighted` and the `highlighted` class, which are unchanged;
  `aria-selected` is the consumer's to author, and is now also what a panel
  reads to decide where to open. Anything that was relying on the hook to
  write it — the pattern the hook's own docs showed — should set it from its
  own selected value instead.

### Fixed

- **A `ScrollContainer` drag follows the pointer.** The effect that restores
  the track's transition one frame after the wrap-around jump ran for any
  `animated === false`, and a drag is the other thing that sets it false. One
  frame into a drag the transition came back on, so every offset update after
  that was eased over `--transition-duration-macro-long` instead of applied:
  the track crawled toward the pointer rather than following it. A 164px drag
  moved the track 46px, in increments of 40, 1, 2, 3. It read as sluggish
  rather than broken because the release is computed from the raw pointer
  delta, not from where the track had got to — the landing was right and the
  journey was not. Tracking is now exact 1:1.

- **A `MegaMenu` panel is measured at the width it is displayed at.** The
  dropdown was measured in one pass: every `fillWidth` child forced to
  `max-content`, the panel set to `width: max-content`, then both the width and
  the height read from that single unconstrained layout. The height that came
  back described a layout the panel is never shown in, and since the box is
  locked to it and clips, whatever the content grew by came off the bottom —
  measured at 14px on a two-column panel, enough to slice the last row. The
  width is now measured first, applied with the children restored, and the
  height read after the reflow. The open animation's `scale(0.9)` is switched
  off for the measurement too, so the numbers describe the panel's layout
  rather than whichever frame of the transition the measuring pass landed on.

- **A labelled `Textarea` no longer grows a scrollbar when you focus it.** The
  floating-label rule set `padding-top` on the value for every field but
  `padding-bottom` only on non-textareas, so a textarea's padding stopped
  adding up to its box. Focusing one floated the label, moved the top padding
  from the centring inset to the label offset, and left the bottom where it
  was: at size m the content needed 51.7px of a 46px box. The box cannot
  absorb it — the textarea is stretched to `--fld-h` by its parent — so the
  extra came off the bottom and the field scrolled its own single line, with a
  scrollbar down the side. Measured at every size: xs through l overflowed by
  up to 5.7px, and xl by 1px, which is still enough for a scrollbar.

  The exclusion is gone, so a floating label sets both paddings on a textarea
  exactly as it does on an input. Nothing without a label changes, because the
  rule only applies once a label is actually floating: a single-line textarea
  still centres its one line at every size, and a multi-line one still has
  equal space above and below. A labelled textarea's bottom padding is now the
  same `--fld-value-bottom` an input uses, which is tight at the smallest
  sizes — 0 at xs — because that is what the token scale leaves once the label
  has taken its share of a one-line box.

- **`Textarea` keeps its label when it also has a placeholder.** It rendered the
  label only when there was no placeholder — `{!placeholder && …}` — so
  `<Textarea label="…" placeholder="…" />` dropped the label from the markup
  entirely. Not mispositioned: absent. And since nothing fell back to
  `aria-label`, the field had no accessible name at all, which a screen reader
  reports as an unlabelled text box.

  `Input` never did this. It renders the label whenever one is given and floats
  it when `isFocused || isFilled || placeholder`, so the two sit together: the
  label above, the placeholder below it. `Textarea` now does the same, and the
  stylesheet needed nothing — `.base:has(.label.floating) .input` already
  clears the room, so the value drops to the floating-label offset on its own.

  Also removed a `[styles.placeholder]: placeholder` class that had no rule
  behind it in `Input.module.scss`, which resolved to `undefined` and put a
  literal `undefined` class on every textarea with a placeholder.

- **`Textarea` measures like the input beside it.** It pinned its own height
  inline — 48px with a placeholder, 56px without — which ignored `size`
  entirely and left a placeholder-only textarea 8px shorter than an `m`
  `Input`. Its first line then sat at the top of the content box while an
  input centres its value, an 11px step that reads as a misplaced placeholder.
  The height now comes from the size token like every other field, and the
  block is padded symmetrically so its first line lands where an input's
  single line does and the rest grows downwards from there. A field with a
  floating label is unaffected; that case still places the value under the
  label.

- **The docs sidebar shows which tag a page carries, not just a dot.** Every
  tagged page writes `navTag: "New"` or `"Update"` in its frontmatter, and the
  sidebar rendered only a coloured `Pulse` — so the two were distinguishable
  only as cyan against green, with the authored word thrown away and the whole
  meaning resting on hue. The dot stays; the word is now beside it.

- **`getPages` read frontmatter keys no page writes.** It took `navTag` and
  `navLabel` from `attributes.tag` and `attributes.tagLabel`, so both were
  always `undefined` on that path while `getNavigation` read the same
  frontmatter correctly.

- **`Feedback` centres its icon when there is nothing to align it with.** The
  root element hardcoded top alignment, which is right beside a heading and
  wrong beside a single line of text — the icon and the message shared only
  their top padding and sat top-flush. It now top-aligns when there is a
  `title` or `children` and centres otherwise. An explicit `vertical` prop
  still overrides the default, as before.

- **`ThemeSwitcher collapsed` was wider than the one button it showed.** The
  two hidden options collapse to zero width, but each still owned its share of
  the group's `gap`, so the pill carried a few pixels of empty space after the
  active theme. A hidden option now takes one gap with it, and the margin
  animates back with the width when the group opens.

- **A `DropdownWrapper` panel no longer slides or flashes as it opens.** The
  open animation scales the panel from 0.9 to 1 about a `transform-origin` that
  the stylesheet hardcoded to `top right`, so on every other placement the edge
  anchored to the trigger travelled by a tenth of the panel's size — measured
  in Chromium, a 480px panel on `bottom-start` drifted 48px sideways while
  opening. The origin is now derived from the placement Floating UI actually
  resolved, which matters because `flip()` is in the middleware: a panel that
  flips above its trigger has to grow from its bottom edge. Separately, Floating
  UI reports `0, 0` until it has measured, so the panel painted one frame at the
  corner of its positioning context before jumping to the trigger. It is now
  `visibility: hidden` for that frame — in the DOM and measurable, just not
  drawn.

- **`DatePicker`'s month and year selectors stay open, and stop throwing focus
  onto the calendar.** Three faults behind the same report, that the picker
  "doesn't feel native":

  - Both selectors could be open at once, stacked over the calendar. Each
    trigger calls `stopPropagation`, so opening one never reached the other's
    outside-click handler. They are now mutually exclusive, the way a native
    select is.
  - Opening either one closed it again about 20ms later. `DropdownWrapper`
    tested "did focus leave the panel?" against the panel element, but the
    panel is wrapped by `FocusTrap` and `ArrowNavigation`, each of which
    renders a focusable container *above* it and focuses that container itself
    as the panel opens. Focus arriving on one of those read as focus leaving.
    Containment is now tested from the portal's outermost element. Autofocus
    also now waits for Floating UI to measure, since a `visibility: hidden`
    element cannot take focus and the attempt was landing nowhere.
  - Closing a selector jumped focus onto a day button instead of leaving it on
    the trigger. `useArrowNavigation` focused `initialFocusedIndex` on every
    mount, and the picker remounts its calendar whenever a selector closes. A
    mount pass now takes focus only when the consumer passed `autoFocus`, or
    when nothing else holds it — after a keyed remount the element that had
    focus is gone, so focusing restores rather than steals.

  `ArrowNavigation`'s own container autofocus was racing the hook's item
  autofocus on a 0ms timer, so a list settled on its first option or on the
  container depending on how much layout work landed in between; it now defers
  to the item. `apps/dev/src/app/(main)/datepicker-check` is the browser
  fixture these were measured against.
- **`FocusTrap` no longer pulls focus back to the first focusable element.**
  Its `autoFocus` ran whether or not focus was already inside the trap, so it
  competed with whoever had placed focus more precisely: measured in Chromium,
  reopening a `DatePicker`'s year list landed on 2024 and was then dragged back
  to 2001 two milliseconds later, and which one won depended on whether
  Floating UI had to measure the panel again. It now defers when focus is
  already inside, which is what a trap is for — keeping focus in, not deciding
  where it sits.

- **A `DropdownWrapper` forgets its focused index when it closes.** The index
  seeds `ArrowNavigation`'s `initialFocusedIndex`, which is read once at mount,
  so the next open started from the last session's index and never resolved the
  current selection at all.

- **Scrolling an option into view no longer moves the page, or lands short.**
  It called `scrollIntoView`, which walks every scrollable ancestor. It now
  scrolls only the nearest scroller inside the panel, measured in layout pixels
  rather than through `getBoundingClientRect` — the panel scales from 0.9 to 1
  as it opens, so rects taken during that animation are up to a tenth short and
  left the selected row 35px below the scrollport, just off the bottom edge.

## [2.0.0-alpha.1] — 2026-09-17

The second alpha preview, on the same **`alpha`** dist-tag. `npm install
@once-ui-system/core` still resolves the 1.8 line; asking for this one stays
deliberate:

```bash
npm i @once-ui-system/core@alpha
```

Mostly regressions the first alpha shipped and the first alpha found — which
is what an alpha is for.

### Fixed

- **`CountFx` no longer freezes when `value` reverts mid-animation.** A run
  started from the last *completed* value, which was recorded only when an
  animation reached its end. Changing `value` back while one was still in
  flight therefore hit the `value === previousValueRef.current` early return
  after the effect cleanup had already cancelled the frame: nothing was left
  driving the number, and the display stayed on whatever intermediate value it
  happened to be showing until some third value came along. A monthly/annual
  pricing toggle clicked twice in quick succession was enough to trigger it.
  Runs now start from whatever is on screen rather than from a completion
  guarded ref, so an interrupted transition reverses from where it got to and
  always settles exactly on the target. The `smooth` effect renders its digit
  wheels from the same origin, which now tracks the run in flight instead of
  the last one that finished. Reported and diagnosed by @chanderlud in
  [#134](https://github.com/once-ui-system/core/issues/134).
- **`DatePicker` and `Carousel` rendered invisible, but interactive, for four
  minutes.** The 2.0 pass that moved `RevealFx.delay` to milliseconds also
  multiplied the two `speed` values in core by a thousand — and `speed` was
  already milliseconds, so the calendar's reveal became a 250-second opacity
  transition and the carousel slide's a 300-second one. The buttons were
  mounted, focusable and clickable underneath; you just could not see them.
  Both are back to 250 and 300, and a test fails on any core component that
  asks `RevealFx` for a reveal slower than five seconds.
- **`Table`'s page-size select was a 2rem sliver, `User`, `UserMenu`, `OgCard`
  and `Avatar` skeletons filled their container.** 2.0 renamed `height` to
  `size` on the field components and replaced `Skeleton`'s own `width` /
  `height` scale with `size`, and the codemod applied that to consumer trees —
  but core's own call sites were never run through it. `height="xs"` on the
  pagination `Select` and the table search, `height="m"` on the `User`
  skeleton and four on `OgCard`'s all landed on the Flex layout prop of the
  same name, where `xs` and `m` are spacing tokens; `Avatar`'s loading circle
  passed `width` / `height` tokens instead of `size`. All are on the 2.0 names,
  the page-size select gets 5rem to show its value, and a test scans every
  component for the 1.8 spellings.
- **`OgCard` showed a loading skeleton over data it was handed.** With both
  `url` and `ogData` set, the fetch for the URL still ran and `loading` stayed
  true until it finished, so the mock-data card drew skeletons over content it
  could already render. Provided data is never fetched for now, and never
  loading.
- **The time picker's header showed `13:14 PM`.** It printed the 24-hour value
  and then appended the meridiem; it prints `01:14 PM` now.
- **The published package now carries its license text.** `package.json` has
  declared `"license": "MIT"` all along, which is what license scanners read,
  but the grant itself never shipped: the MIT file lived only at the monorepo
  root, and npm includes a license only when it finds one in the package
  directory. No tarball up to and including 2.0.0-alpha.0 carried one. The
  notice also now names Dopler, the entity, rather than Once UI, the product.

### Fixed (docs site, not published code)

- **Markdown tables rendered as raw pipes.** The docs pipeline had no GFM, so
  the harness table on the AI coding page and the clamp table on the Input page
  printed their source. `remark-gfm` is in the pipeline now and a markdown
  table renders through the design system's `Table`, like every other table in
  the docs. Two harness links pointed at the wrong files on the way.
- **The `IconButton` custom-content example lost its label on the primary
  button.** The `Text` inside forced `onSolid="neutral-medium"`, a neutral
  on-solid token over a brand solid, which is near-white on the docs' contrast
  solids. A button already sets the text colour for its own surface, so the
  example inherits it.
- **The "Copy for LLM" menu's three options carry prefix icons** (document,
  OpenAI, Claude). The two brand marks come from `react-icons`, registered in
  the docs app's own icon library as the harness rules prescribe.
- **The `Option` prefix example rendered nothing:** it passed `icon` to `Icon`,
  whose prop is `name`.

### Changed

- **Agent guidance: a prop another prop already implies is a default too.** The
  harness told agents to omit `position="relative"` and then shipped examples
  writing `fillWidth` beside `maxWidth` (which already fills the width),
  `minWidth={0}` beside `fillWidth` (which already sets `min-width: 0`), and
  `border="neutral-alpha-weak"` where bare `border` draws the default border —
  the surface recipe itself was written that way, in the rules, the compact
  rules, a task bundle, `AGENTS.md` and 15 example files. All of them now use
  the short forms, and the rules gain the principle behind them plus one on
  `zIndex`: it belongs to an isolated stacking group (a decorative layer and
  its content sibling, a sticky header over its pane), not to a lone element
  or a page-wide ladder.

  `validate-ai-code` enforces the three mechanically, per element rather than
  per file, with `--fix` for each; it also flags a `zIndex` in a file with
  nothing positioned absolute, fixed or sticky. Tag scanning is brace-aware
  now, so a `>` inside an arrow function in a prop no longer ends the tag
  early. Covered by tests.

## [2.0.0-alpha.0] — 2026-09-16

Published to the **`alpha`** dist-tag, not `latest`. `npm install
@once-ui-system/core` keeps resolving 1.8.4, and every `^1.8.x` range in the
wild is unaffected — a prerelease does not satisfy a stable range, not even
`^2.0.0` or `*`. Getting it is deliberate:

```bash
npm i @once-ui-system/core@alpha
```

This is a preview of 2.0, not 2.0. The API below is what we intend to ship,
but the point of an alpha is to find out where that is wrong, so treat it as
open to change and please report what breaks. Three things are known and
deliberate:

- **The published package is bundler-only.** `dist` is ESM syntax in `.js`
  files without `"type": "module"`, so Next.js, Vite and friends load it and
  plain Node `require`/`import` does not. That predates this release; fixing
  the module format is a 2.0 decision that has not been made yet.
- **`@once-ui-system/foundations` is not published.** Core inlines its SCSS and
  CSS at build time, so consumers install nothing new.
- **Breakpoints are fixed.** See `MIGRATING.md` §7.

Heading to **2.0**, not to 1.9. `package.json` carries `2.0.0-alpha.0` so
nothing here can be published as a version nobody chose — 1.9.0 was a working
number bumped ahead of any release decision, and it is now skipped entirely.

The `ThemeInit` fix that briefly lived under a 1.9.0 heading shipped instead as
**1.8.4** (published 2026-08-28), cut from the tree that produced the published
1.8.3 so it reached `^1.8.x` consumers with nothing to migrate. Its entry is
below, in its own release.

Classification is **major** by [RELEASING.md](RELEASING.md)'s own criteria, and
no longer open: props are renamed, three modules leave the root barrel for
subpaths, a type union narrows from `string`, and a browser floor appears where
there was none. What remains is the maintainer's publish decision — whether 2.0
ships as scoped here, or whether any of it waits.

**What a 1.8.x app has to do.** Five things, in the order it makes sense to do
them — [MIGRATING.md](MIGRATING.md) walks each one:

1. Run the codemod. It applies every prop rename below, component-scoped, and is
   a no-op on its own output.
2. Move chart, `CodeBlock` and `MediaUpload` imports to the `/data`, `/code` and
   `/media` subpaths, and install the peer each one names. The codemod does this
   too.
3. Rewrite `ColorInput`'s `onChange` body by hand — the signature changed, and a
   rename cannot express that.
4. Import `LayoutProvider` from `@once-ui-system/core/next`, if the app is a Next
   app, to keep 1.8.x link and image behavior.
5. Check the browser floor: scheme tokens are `oklch()` now, which needs Chrome
   111 / Safari 15.4 / Firefox 113.

Nothing else is required to build. `IconName` is a real union rather than
`string`, so a name that used to render a blank space is now a type error — that
surfaces bugs an app already had, it does not create work.

**The Next.js step in detail.** `ElementType` (which backs `SmartLink` and any
`Button` / `Card` / `ToggleButton` with `href`), `Media`, `Logo`, `MegaMenu` and
`Kbar` now render through the adapter layer, whose defaults are plain DOM —
`<a>`, `<img>`, `window.location.assign`. Keeping 1.8.x behavior is a one-line
change — the import path for `LayoutProvider`:

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
mechanical: the codemod applies the renames component-scoped, following import
aliases, and running it twice is a no-op.

```bash
curl -O https://raw.githubusercontent.com/once-ui-system/core/main/scripts/codemod-2.0.mjs
node codemod-2.0.mjs src --dry   # report only
node codemod-2.0.mjs src
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

**Charts, `CodeBlock` and `MediaUpload` move to their own subpaths.** The lazy
`await import()` and its `catch()` never made `recharts`, `prismjs` and
`compressorjs` optional. A bundler resolves the specifier when it walks the
module graph, so the failure came at resolution and the fallback never ran — and
the root barrel re-exported `code`, `media` and `data`, which put all three
specifiers into every consumer's graph. Reproduced on an app rendering no chart,
no `CodeBlock` and no `MediaUpload`: it still could not build without all three
installed. The plumbing was there; it had never worked.

```diff
- import { LineChart, CodeBlock, MediaUpload } from "@once-ui-system/core";
+ import { LineChart } from "@once-ui-system/core/data";
+ import { CodeBlock } from "@once-ui-system/core/code";
+ import { MediaUpload } from "@once-ui-system/core/media";
```

An app that never imports a subpath never has the specifier, so the three are
optional peers for real — 13.5M of install weight nobody pays for by default —
and the `MissingDependency` fallback finally means what it says. The codemod
moves the imports; 53 files across the fleet named these from the root. Core's
published types no longer import `CurveType` from recharts either, so skipping
the peer no longer breaks typechecking in an app that never touches a chart.

**Icon names are a union, and the registry is not typed against react-icons.**
Core rendered 54 icons through `react-icons`, so every consumer installed 85M for
about 4 kB gzipped of SVG — 68M of it icon families core never touched. It was
never a bundle problem; it was an install problem and a typing problem. The data
is inlined now (`src/icons/data.ts`, generated by `scripts/generate-icons.mjs`
from `icon-manifest.json`), `react-icons` is a devDependency used only to
regenerate it, and a parity test renders all 76 against their originals and
asserts identical markup. A fresh consumer install of core goes from **513M to
47M**.

The type change matters more than the megabytes. `Icon` renders its component
with no props at all, so all core ever needed was "something that returns an
SVG" — yet the registry was typed against react-icons' `IconType`, putting one
vendor in the public API of every app that registered an icon. It is structural
now: react-icons, lucide, heroicons or a hand-written SVG all satisfy it. And
because of that annotation `IconName` collapsed to `string`, so every name
compiled, typos included, and a wrong one meant a console warning and a blank
space. It is a real union now, extended by declaration merging:

```ts
declare module "@once-ui-system/core" {
  interface IconLibraryOverrides {
    rocket: true;
  }
}
```

Turning that on immediately found icons core was already rendering as nothing:
`opacity` and `inbox` in components, `chevronDoubleLeft` and `chevronDoubleRight`
in `Table`'s pagination, and `email`, `loading` plus seventeen more across
fifteen shipped AI example blocks — the blocks agents copy. Those names are
registered where they were sensible (**76 icons**, up from 54) and corrected
where they were not. Brand marks stay out: they are trademarks, they date, and
every app in the fleet already registers its own.

**`Textarea` grows with its content by default.** `lines` was `3`, so every
textarea that never named one was a fixed three-row box with a resize handle.
It is `"auto"` now: the field sizes itself to what is in it, and the handle
appears only on a fixed height, since a textarea that manages its own height has
nothing to hand over.

```diff
- <Textarea id="notes" label="Notes" />              // three fixed rows
+ <Textarea id="notes" label="Notes" />              // grows with content
+ <Textarea id="notes" label="Notes" lines={3} />    // the old behaviour
```

The wrapper keeps `min-height: var(--fld-h)`, so an empty one is still a full
field tall rather than collapsing to a single line. `resize` now only applies
alongside a numeric `lines`. The codemod strips `lines="auto"` where it was
written explicitly, since it says nothing 2.0 does not already do; a numeric or
computed `lines` is left alone.

**Scheme tokens are `oklch()`, which sets a browser floor.** All 285 scheme
values are expressed in OKLCH. Nothing renders differently where the function is
supported — every value round-trips to the hex it replaced, verified by building
the docs and painting each token to a canvas in a real browser, 228 of 228
pixel-identical against the hex at HEAD. What it buys is that the numbers mean
something: `oklch(0.6743 0.1670 261.54)` says "two thirds as light as white,
moderately saturated, blue" where `#5A93FC` says nothing. The cost is that an
older browser drops the declaration rather than approximating it, so the floor is
**Chrome 111, Safari 15.4, Firefox 113** (2022–23), with no fallback. The
`--static-*` values stay hex, because black, white and transparent are clearer
that way. The ramps themselves are untouched.

### Fixed

- **The mega menu's dropdown shadow is no longer clipped.** `MegaMenu` put
  `overflow: hidden` on the positioned box that holds the panel and `shadow="xl"`
  on the surface inside it, so the shadow — drawn outside the surface's border
  box — was cut off at the panel's own edge. The clip is not the mistake: it is
  what keeps the contents inside the box while its width and height animate
  between two groups of different size. An element's own box-shadow, unlike its
  descendants, is not clipped by its own overflow, so the two belong on the same
  element. The clipping box now takes the radius and the shadow and the surface
  gives them up; the 8px top padding moves into `top` in exchange, because the
  two boxes have to coincide exactly for their rounded corners to.

- **`background="transparent"` and `solid="transparent"` do something.** Both
  values were in the prop types with no class behind them: the class helper
  returned `transparent-border` whatever type it was given, so they applied
  nothing to the background and quietly cleared the author's border instead, and
  on the client path the background case returned no class at all. The helper
  now follows its `type` argument, and the two missing utilities
  (`transparent-background`, `transparent-solid`) are generated.

- **`ThemeSwitcher` now exposes which theme is active.** The active option was
  marked only by its `"primary"` variant, so assistive technology had no way to
  tell the three buttons apart. Each now carries `aria-pressed`.

- **A failed emoji fetch no longer fails the build — or the publish.**
  `prepack` runs `pnpm build`, and the build regenerates
  `src/data/emoji-data.json` from GitHub. Behind a proxy, a TLS-intercepting
  network, or offline, that fetch threw and `process.exit(1)` took
  `npm publish` down with it. The categorised file is committed, so a fetch
  failure now keeps it, warns, and lets the build continue; the script exits
  non-zero only when there is genuinely no file to fall back to.
- **Inputs no longer zoom iOS Safari on focus, and the floating label and value
  are placed by ink.** Three separate things were wrong with a field on a phone.
  iOS Safari zooms when a focused control computes below 16px, and
  `--font-scaling-mobile: 15px` put xs, s and m under it — m being the default.
  Raising the mobile root does not fix it (xs and s use `font-s`, still 14px at a
  16px root; clearing 16px that way needs a root of 18.3px, which is no longer a
  dense product UI), so the clamp goes on the focusable control alone, on touch
  only, with a line-height floor of 1.3 beside it — otherwise xs and s would put
  16px glyphs in a 16.88px line box. `l` and `xl` compute identically on touch and
  desktop, as they always did. Placement was the older bug and has nothing to do
  with zoom: every size shared one `padding-top: 1rem` and a hand-picked label
  offset while heights ran 2.5rem to 4.5rem, so at m the gap between the label's
  baseline and the value's cap height was 1.4px, and at xl it was negative — the
  value overlapped the label while 28px of dead space collected underneath. Both
  are derived per size now from where the ink falls (cap height, baseline,
  descender) centred in the box the value really gets; the worst top-to-bottom
  imbalance across the whole scale is under a pixel. xs and s gain a touch-only
  height floor of 40 and 48px — both were under the tap-target minimum, and a
  flat 48 would have cleared it but collapsed the two sizes into each other.
  `fontSizeMap` is gone from both components: the stylesheet owns font-size and
  line-height now, so the clamps can reach them.
- **`StylePanel` wrote two settings straight to `localStorage`.** `data-solid`
  and `data-solid-style` bypassed `ThemeProvider` entirely, so they ignored any
  persistence setting. They go through the provider now. Row dividers also move
  from a per-row border prop to one stylesheet rule, so hiding or reordering rows
  can no longer leave a border on the last one; and only the `DataStyle` row
  reaches for `DataThemeProvider`, where the whole panel used to require one in
  the tree.
- **An operable `Card` with no explicit `radius` got the class
  `radius-undefined`.** The fallback was written `` `radius-${flex.radius}` ||
  "radius-l" ``, and a template literal is a string — truthy even when the value
  inside it is `undefined` — so the `||` never ran and the focus ring had no
  radius to follow. A static `Card` also painted `cursor: interactive`, promising
  a click it had no handler for; the cursor is now tied to `href` / `onClick`
  like the focus ring and the role already were.
- **The AI harness's validator was telling agents to write 1.8.x timings.** Its
  `RevealFx.delay` rule read "delay is in seconds — use index * 0.1", which 2.0
  inverts; it now flags seconds and asks for milliseconds. Two of its rules also
  fired on correct code, which is the worse failure for a tool agents are meant
  to trust: `color.tokens` matched any string shaped like hex, so a table of
  order ids (`"#1024"` is a valid #RGBA literal) failed, as did the `fill` and
  `stroke` of an inline `<svg>` — the exact values 2.0 types as `ColorValue`
  because no token can express them. And `Card.interactive` fired on a `Card`
  handed to a `trigger` prop, which its owner operates. Six of the 26 shipped
  example blocks failed their own validator before this; three do now, and those
  three are judgement calls rather than defects. The rules are covered by tests.
- **The shipped AI examples still used `fill` on `Media` and `Carousel`**, which
  2.0 renames to `stretch` — a rename `tsc` cannot catch, because `fill` stayed
  valid as the layout prop it now means. Corrected in `auth.tsx` and
  `blocks/Streaming1.tsx`.
- **The icon registry was too small for the products built on it.** An audit of
  every `Icon`, `prefixIcon`, `suffixIcon` and `arrowIcon` call across magic,
  motion, studio, scenetic and magic-convert found **127 distinct unregistered
  names over 531 call sites** — every one rendering a blank space today, and
  every one becoming a type error under 2.0's `IconName` union. The registry goes
  **76 to 99**, adding the product-UI glyphs the fleet actually asks for: `home`,
  `folder`, `file`, `image`, `video`, `chat`, `time`, `lock`, `heart`, `tag`,
  `bolt`, `globe`, `star`, `starFill`, `bookmark`, `filter`, `upload`,
  `arrowLeft`, `forward`, `barChart`, `banknotes`, `store` and `organization`.
  That clears 207 of the 531. The parity test covers all 99. Brand marks stay
  out, as they were: they are trademarks, and an app registers its own.
- **The codemod renames six icon names that were only misspelled.** `email`,
  `more`, `conversation`, `sparkles`, `externalLink` and `shop` are not missing
  icons — they are `mail`, `moreHorizontal`, `chat`, `sparkle`, `arrowUpRight`
  and `store` under a name someone guessed, about 46 more call sites. The `name`
  rewrite is scoped to `<Icon>`, since `name` means something else on nearly
  every other component; `window`, `split`, `stop` and `description` are each
  plausibly several things and stay type errors for a human.
- **`ToggleButton` takes a `radius`.** Roundness followed `size`, and `corners`
  could only scope it — so a tall row with modest corners, which is what every
  sidebar in the fleet wants, had no prop at all. Aveiro and Studio both reached
  for `style={{ borderRadius: "var(--radius-m)" }}` instead, five call sites
  between them. It falls back to `size` when unset, so nothing changes for
  anyone not asking.
- **`Kbd` belongs in a sentence.** It renders a `Flex`, and `Flex` is
  `display: flex`, so every key in prose broke the line and stretched to the
  column width. The Scrubber page showed four of them stacked as full-width bars
  between the words describing them. `inline` and `fit` now, both overridable.
- **`Carousel` and `Swiper` blurred the edges of their own images.** Both put a
  `Fade` down each side with `base="transparent"` — a gradient from transparent
  to transparent, which paints nothing. The only thing those elements ever
  rendered was `Fade`'s `backdrop-filter: blur(0.5rem)`, so what reached the
  screen was a 6rem blurred strip over the artwork and no fade at all. Swiper's
  was not even gated: Carousel's at least waited for hover, Swiper's was on the
  whole time. Removed. The chevron already carries its own surface, which is the
  affordance those strips were reaching for; an edge treatment that is wanted can
  come back with a real `base` and a radius.
- **The carousel chevrons had their borders shaved.** Each sits in a wrapper that
  paints an opaque surface behind it, and the wrapper was `radius="l"` with
  `overflow="hidden"` while `IconButton` at size `m` is `radius-m`. The larger
  corner cut into the smaller one, clipping the button's border at all four
  corners. The wrapper matches the button's radius now, and with the radii equal
  there is nothing left to clip.
- **The chart, `CodeBlock` and `MediaUpload` APIs were missing from the spec
  entirely.** Each of these ships as a lazy shell (`X.tsx`) in front of the real
  implementation (`X.impl.tsx`), which is what lets their dependency stay an
  optional peer. The spec generator read the shell only, saw props declared in
  another file, and recorded a wrapper relationship — so all six came out with
  `props: {}` and a phantom `extends: ["X.impl", "interfaces"]` naming types the
  spec never defined. `series` and `data` appeared nowhere in it. The generator
  now treats an `X.impl` sibling as the same component (reading its defaults
  too, since the shell only forwards props) and a module-local `interfaces.ts`
  as a mixin like the global one. `LineChart` goes from 0 to 17 props, `BarChart`
  and `LineBarChart` to 12, `PieChart` to 10, `CodeBlock` to 19, `MediaUpload` to
  17, and `ChartProps` joins the shared mixins rather than being copied four
  times. No other component's props changed. This is what left agents
  extrapolating a chart API from examples — and `BarChart` had no example to
  extrapolate from.
- **A props table printed a mixed union as one unreadable blob.** The docs' table
  split a union into separate values only when *every* member was a quoted
  literal, so `"none" | "percentage" | string[]` on the gauges, or
  `Colors | "surface" | boolean`, fell through and printed raw. Any union splits
  now, on its top-level `|` only — the old naive split would have cut through
  `Record<string, A | B>`.
- **A collapsed `CodeBlock` faded to the wrong colour, and put its button in the
  wrong place.** The fade over a collapsed block was `base="page"` while the
  block paints `surface`, so wherever the two tokens differ — dark mode, where
  page is `lab(2.7%)` and surface `lab(6.8%)` — it laid a band of page colour
  across the bottom of the code. It takes the block's own `background` now, and
  an explicit `style.backgroundColor` carries through to it. `View code` also sat
  dead-centre of the collapsed area, over the code it was covering; it is
  anchored 12px above the bottom edge instead.
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

### Added

- **`ThemeSwitcher` gains `collapsed`.** The control shows only the active theme
  and reveals the rest on hover or focus, for headers and footers where it has
  to be reachable from every page without spending three slots on itself.

  It stays a real toggle group rather than a hover trick: every option keeps its
  tab stop (collapsed with `max-width: 0`, not `display: none`), `:focus-within`
  opens the group so a keyboard visitor can reach all three, and any device
  without hover gets the expanded group from the start — otherwise the only way
  in would be to tap the visible button, which would have already changed the
  theme. The width transition is the only motion and `prefers-reduced-motion`
  removes it.

  ```tsx
  <ThemeSwitcher collapsed />
  ```

- **`focusRing` on `Input` and `Textarea`.** A field draws no focus ring —
  deliberately, that borderless native look is the point — but that leaves a
  keyboard user with nothing to go on, while `Card` and `SmartLink` in this
  same library do show one. `focusRing` opts a field in, using the same
  outline as the `.focus-ring` utility so it matches every other focusable
  thing on the page. Off by default, so nothing changes unless asked. It
  shows on a mouse click too: `:focus-visible` always matches a field that
  takes keyboard input, however that field was focused.

  Not available on `Select`, and omitted from its props rather than accepted
  and ignored: `Select` moves focus off the trigger and into the dropdown, so
  the trigger is not the focused element for most of the interaction and a
  ring keyed to it would light on first focus and then go out with the menu
  still open. Giving `Select` a focus ring means tracking focus across the
  whole control first.

- **`StylePanel` is composable, and its state can be host-owned.** The panel had
  been forked twice — once in Magic's site editor, once on Studio's brand page —
  and both forks diverged on the same three axes, so those are the ones it opens
  up. Every row and group is reachable as a part (`StylePanel.Brand`,
  `StylePanel.Page`, and so on) and the default `StylePanel` is a plain
  composition of them, so a host needing a different arrangement composes the
  parts inside `StylePanel.Root` instead of reimplementing them; one keeping the
  default arrangement hides parts of it with `visibility`. Passing `value` and
  `onChange` takes ownership of the state — the panel then writes nothing to
  `ThemeProvider`, `DataThemeProvider` or storage, and `onChange` receives both
  the whole state and just the keys that changed, the latter being what a caller
  sends to a server. Every row takes a `label` and every group a `title` and
  `description`: a node replaces the default, `false` drops it.
- **`ThemeProvider` takes `persistence`.** `"local"` (the default, unchanged),
  `"none"`, or an adapter that routes storage elsewhere, such as a database.
  `get` stays synchronous because it runs during hydration, where an await would
  show a flash of the wrong theme; `set` and `remove` may return promises.
- **Body text scales without touching headings.** `data-body-size` and
  `data-body-line-height` drive `--font-size-body-multiplier` and
  `--line-height-body-multiplier` — five steps (90–110) and four (90–120)
  respectively, read as percentages. Both multipliers already existed and nothing
  exposed them; `data-scaling` covers the root size, this covers running text.
  `StylePanel`'s new body-text group is opt-in.
- **`generateColorScheme` and `schemeAlphaVariants`.** Studio's brand page has
  had a scheme generator for a while and it already worked in OKLCH internally;
  it moves to core so every app gets it, without chroma-js — the conversions are
  about forty lines of published matrices, and core having just shed react-icons
  is no place to take a dependency for colour maths. One thing changes on the way
  across: holding chroma fixed while lightness climbs asks for a colour that does
  not exist at the light end, and converting that clamps R, G and B separately,
  shifting the hue as it clips. Reducing chroma until the colour fits instead
  cuts the worst error against the built-in schemes from 0.168 to 0.110 OKLab
  ΔE, and about five-fold on the lightest steps. Seventeen tests regenerate each
  built-in scheme from its own step 600 and assert the worst step stays in
  tolerance.
- **`Select` dropped the `className` it was given.** The caller's class sat
  inside `classNames`' object argument, where clsx reads a key as the class
  and its value as a condition — so a truthy `className` put the literal
  string `"className"` on the element and the caller's own class never
  reached the DOM at all.

- **Browser autofill left the label on top of the filled text.** Autofill
  fires no focus, blur or change event, so nothing in `Input` or `Textarea`
  ever learned the field had stopped being empty — the same overlap as the
  `defaultValue` case below, on the one path a user cannot work around by
  clicking into the field. The one thing the browser does emit is an
  animation: an inert keyframe hangs off `:-webkit-autofill` and the
  components listen for it by name, so the label floats the moment the
  browser fills the field. A consumer's own `onAnimationStart` is chained
  rather than dropped.

- **A prefilled field rendered its label on top of its value.** `Input` and
  `Textarea` derived `isFilled` from `props.value` alone, so an uncontrolled
  field — `defaultValue`, which is how a settings form normally renders saved
  data — never floated its label: a profile form came up with every prefilled
  row overlapped at once, and only corrected itself field by field as the user
  focused and blurred each one. `isFilled` is seeded from `defaultValue` too,
  and the effect that syncs it now ignores an `undefined` value instead of
  clobbering that seed back to false on the first render. Browser autofill is
  still not covered — it fires neither focus nor blur — and wants the float
  keyed off CSS rather than React state.

- **The AI spec lists `iconNames`.** `IconName` reached it as an opaque type
  name, so an agent had no way to know what exists and guessed — which is exactly
  how those fifteen example blocks came to name icons that render as nothing.
- **The AI spec resolves the types its props name.** `series: SeriesConfig |
  SeriesConfig[]` pointed at a shape `spec.json` never defined, so the chart API
  was visible but not usable: two clean-context agents hit it independently and
  reverse-engineered the row shape from an example instead. `types` now resolves
  to a fixed point — a shape's own fields name further types, and those are
  exactly the ones needed next — and carries object shapes and aliases beside
  the string unions it already had, 25 entries to 93. `DataPoint` comes with its
  `[key: string]` index signature, which is where a chart's series keys actually
  live and which reading only property signatures had dropped. Resolution goes
  through the type checker rather than the syntax, so `Omit<...>` and `extends`
  resolve to the fields a type has rather than to nothing. Three cases are
  deliberately not inlined: a component's own props say `"Avatar props"` and
  point at the entry that already lists them; a type over 40 fields (because it
  extends a component's whole surface) falls back to its own declared members;
  and `FlexBreakpointProps` lists the 71 prop names that accept a breakpoint
  object, which is the question that type is asked, rather than sixty lines of
  declaration text. A test asserts no prop names a type the spec cannot resolve.
- **The spec preferred a vendored type over ours when the names collided.**
  recharts ships its own `DotsProps`, and indexing `node_modules` for types like
  floating-ui's `Placement` let it shadow `Background`'s — which then dropped out
  entirely, since a vendored type is only ever emitted as a string union. A name
  declared in both places now resolves to ours.
- **The CSS API-surface snapshot recorded a selector that does not exist.**
  Sass keeps `/* */` comments in its output and the extractor matched raw text,
  so a comment in `theme.scss` mentioning `[data-scaling]` was snapshotted as
  part of the public selector surface alongside the four real
  `[data-scaling="90"]`-style rules. Comments are stripped before extraction,
  and the snapshot picks up the nine `data-body-size` / `data-body-line-height`
  selectors that `bodySize` and `bodyLineHeight` had added without it — the
  guard had been failing since the foundations extraction.
- **The generated AI artifacts depended on the checkout's line endings.** A
  multi-line object default (`Fade`'s `pattern`, `RadialGauge`'s `angle`) kept
  its source newlines verbatim, so the committed JSON read `{\r\n ... }` when
  regenerated on a CRLF checkout and `{\n ... }` on an LF one and flip-flopped
  between machines. Defaults are collapsed the way type text already was, and a
  test asserts no artifact carries a carriage return.
- **`KbarItem` and the `MegaMenu` types are exported.** Components took them as
  props but consumers could not name them.
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
- **`ai/layouts.md`** — application shells for the harness, where `recipes.md`
  covers decoration. Three: a dashboard whose pane scrolls rather than its
  document, a data-driven nav, and a two-pane editor with a timeline. Each is the
  shape a working product converged on, and the notes say which values matter —
  `dvh` not `vh`, the sticky offset matching the header, `overflowY` on the
  panels rather than the SplitView. All three also ship as
  `ai/examples/app-shell.tsx` so `pnpm typecheck` covers them: a renamed prop
  breaks the recipe instead of leaving it quietly wrong.
- **`NavItem`, `NavGroup` and `selectNavHref`** — the two rows a product
  sidebar is made of. Every product on Once UI grew its own: Aveiro's is 566
  lines, the docs' 456, Frametic's 52, and all three converged on the same
  grammar — a link that knows whether it is the current page, and a collapsible
  group of those indented behind a vertical rail. `NavItem` carries the icon,
  the label and either a capped count or an unread dot; `NavGroup` is the
  accordion and the rail, uncontrolled until you pass `open`.
  They are rows, not a sidebar: headers, footers, org switchers and storage
  meters differ per product and stay the host's to compose.

  `selectNavHref` is the part worth taking rather than writing again.
  `pathname === href` misses a nested route and `startsWith` lights the parent
  up alongside its child; the answer is the longest href that matches, and it
  existed in exactly one repo.
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

- **Agent guidance.** `ai/rules.md` gains a rule on proportion — two columns in
  a row finish at roughly the same place, and the fix for a half-empty column is
  content in the thin side, not more whitespace. `ai/recipes.md` gains the
  reveal-on-hover pattern with the three rules that keep it accessible, and the
  matching anti-pattern.

- **Spacing utilities are generated, not typed out.** `scss/styles/` was 5,789
  lines of hand-written classes with not one loop in the whole directory —
  every `.p-16`, `.mt-24` and `.g-8` written out in full, `spacing.scss` alone
  1,504 lines of it. The cost was never the typing; it was that a
  hand-maintained matrix drifts silently. Every spacing family carried all 23
  tokens except `mx`, which was missing 48 and 56, and nobody reading 1,504
  lines was going to notice. The matrix now lives in
  `scripts/utilities.spec.mjs` and `scss/styles/spacing.generated.scss` is
  emitted from it — 15 families × 23 tokens, plus the two `g-horizontal--1` / `g-vertical--1` hairline
  helpers that take a child selector and so stay stated explicitly.

  Verified equivalent rather than assumed: comparing the compiled declarations
  of the old and new files selector by selector gives 343 shared rules, **zero
  declaration mismatches**, nothing dropped, and exactly two additions —
  `.mx-48` and `.mx-56`, the drift. The CSS API-surface snapshot, which guards
  all 809 public class names, shows the same two lines and nothing else.

  `position.scss` follows, and it is the clearer case: 1,548 lines because it
  wrote its matrix out five times, once for the base and once inside each of
  the four breakpoints. Generated it is one list of rules and a loop over the
  viewport steps. That file had not drifted — the compiled output matches rule
  for rule, inside every media query, 385 to 385, nothing added, nothing
  dropped, no declaration changed, and the compiled stylesheet is identical to
  the byte.

  Between them, 3,052 hand-written lines become a 94-line spec and a 119-line
  generator. `pnpm check:utilities` fails if the checked-in output does not
  match a fresh run, so it cannot drift from the spec that describes it, and
  `build` regenerates before compiling. A separate test pins the generator's
  breakpoint widths to `breakpoints.scss`, since a generator cannot read a Sass
  variable and the two stating different numbers would tear the layout
  mid-resize.

  With the scale in one place, two gaps in it closed. `--static-space-72`
  (4.5rem) had shipped as a token since the layout layer was written, with no
  utility class in any family and no entry in `StaticSpacingToken` — a step of
  the scale that existed in CSS and was unreachable from either the class names
  or the `padding=` prop. It is now in all three, adding 35 classes: fifteen
  spacing families and four offsets at each of the five viewport steps. A test
  pins `StaticSpacingToken` to the generator's token list in both directions,
  because a class with no token is dead CSS and a token with no class is a prop
  that type-checks and then does nothing.

  `breakpoints.scss` is generated from the same spec rather than pinned to it by
  a test. The widths were stated twice — once for the generator, once in Sass
  for the ten call sites that `@include` the mixins, core component modules
  included — and two copies of a number are a drift waiting to happen. It keeps
  its plain filename, since renaming it would churn every one of those call
  sites for nothing. Generating it changed not one byte of compiled output.

  `flex.scss` follows, and generating it surfaced a third gap — this one with
  teeth. `.<bp>-flex-show` is hidden by a base rule and revealed inside its own
  media query, so the pair reads as "show only at this width". `l`, `m` and `s`
  each had that base rule; `xs` did not, so `.xs-flex-show` was visible at
  every width instead of only the narrowest. Measured in Chromium across five
  viewports, the three siblings computed `none` above their breakpoint and
  `xs` computed `block` at all of them. The class name existed either way, so
  the class-name snapshot could never have caught it; only comparing the four
  rules side by side could, which is exactly what a matrix in a loop does and
  1,500 lines of hand-written CSS does not.

  Generated, that rule exists and the staircase is even. The fix changes
  rendering only for `xs={{ hide: false }}` used *without* a base `hide` —
  which was a silent no-op before — and the fleet's one call site pairs the
  two, so it was correct before and is correct now.

- **`.align-between`, `.align-around` and `.align-even` are gone.** They set
  `align-items: space-between` and its siblings, which are `align-content`
  values and not valid for `align-items`, so the browser dropped the
  declaration and computed `normal` — fifteen classes, counting breakpoints,
  that did nothing at all. Measured before removing them, and again after:
  nothing renders differently, because an element that used to get a class
  doing nothing now gets no class.

  `horizontal` and `vertical` keep their full unions. Which CSS property a
  value reaches depends on `direction` — on a row `horizontal` is
  `justify-content` and `vertical` is `align-items`, and on a column they swap
  — so the same value is meaningful on one axis and meaningless on the other.
  Across the fleet, 275 uses of a distribution value land on `justify-*` and
  work; exactly one lands on `align-*`, in Studio's `ThemeTile`
  (`<Column horizontal="between">`), and that one was already a no-op.

  `border.scss`, `background.scss` and `display.scss` follow, on the same
  terms: compiled rule for rule against the originals, inside every media
  query, with selector lists compared as sets so grouping order is not mistaken
  for behaviour. 124 to 124, 80 to 80, 94 to 94; nothing dropped, nothing
  added, and one declaration changed on purpose — `.radius-none` set
  `border-radius: none`, which the CSS parser rejects outright, so the class
  only ever worked by falling back to the initial `0px`. It says `0` now and
  renders exactly as it did.

  `grid`, `typography`, `color`, `shadow` and `size` complete the sweep, and
  turned up the last two gaps. Grid had the `xs-flex-show` bug at every
  breakpoint rather than one: none of `.l-grid-show`, `.m-grid-show`,
  `.s-grid-show` or `.xs-grid-show` had the base rule that hides them outside
  their own query, so a `Grid` told to show only at one width showed at all of
  them. And `.font-family-display` pointed at `--font-display`, which does not
  exist anywhere in the token layer, so the declaration was invalid and the
  class applied nothing — measured in Chromium, an element carrying it kept
  its inherited font while every sibling class applied the real one. Both
  display classes now read `--font-heading`, which `.font-display` already did.

  `global.scss` and `utilities.scss` stay hand-written. Eleven rules between
  them and not a matrix in sight; generating those would add indirection and
  save nothing.

### Breaking (continued)

- **`LayoutProvider` no longer takes a `breakpoints` prop.** The five steps are
  fixed: xs 480, s 768, m 1024, l 1440, and `xl` above all of them — `xl` was
  always `Infinity`, the base state rather than a media query, which is why no
  `.xl-` class has ever existed.

  This is what lets a responsive `Flex` be a server component. The utility
  classes carry those widths inside their `@media` queries, and a prebuilt
  stylesheet cannot honour a width an app picks at runtime, because `@media`
  does not read custom properties. Supporting both meant two code paths — CSS
  classes when an app's breakpoints matched the defaults, and a 450-line hook
  that read a React context and mutated `element.style` when they did not. The
  second could only run after hydration, so a responsive page was laid out at
  desktop widths in the server's HTML and corrected itself once JavaScript
  arrived.

  Both paths are now one. `useResponsiveClasses` is deleted, `isDefaultBreakpoints`
  is gone from the layout context, and `Flex` and `Grid` render on the server
  whenever every breakpoint value maps to a class — which is all of them except
  free-form sizes, rem numbers, the `style` escape hatch, and `xl`. The
  responsive layout is now in the first paint:

  ```html
  <div class="display-flex position-relative g-16 flex-row s-g-4 xs-g-4" id="gap">
  ```

  That also removes a conditional `useResponsiveClasses` call that sat behind
  an `if` with an eslint-disable on it — a rules-of-hooks violation that would
  have broken the moment the condition changed between renders.

  Only one app in the fleet passed custom breakpoints, and it was this repo's
  own dev harness. `MIGRATING.md` §7 covers the change.

### Fixed

- **`xl` completes the breakpoint scale.** It is the one min-width step,
  `(min-width: 1441px)`, and that is not an exception so much as the only
  honest reading: `xl` has always meant "above all the others" — the layout
  context resolves it as `Infinity` — so a max-width query cannot express it.
  As min-width it matches the context exactly at every width, with no sixth
  bucket invented for the widest screens and no change to what `xl` means.

  `ServerFlex` and `ServerGrid` now start their cascade at `xl`, as their own
  comment had claimed for as long as the code started at `l` and dropped it —
  which is why an `xl` object only ever reached the client component. It
  renders on the server like every other step now, and flows down into the
  narrower ones:

  ```
  <Flex gap="16" xl={{ gap: "4" }} />
  class="… g-16 xl-g-4 l-g-4 m-g-4 s-g-4 xs-g-4"
  ```

- **`Select` tracks focus across the whole control, and takes `focusRing`.**
  Focus moves off the trigger and into the dropdown during a normal
  interaction, so anything keyed to the trigger latched on and never came off.
  Traced in Chromium: `focusin INPUT`, `focusout INPUT -> BUTTON`, and then
  nothing at all while `document.activeElement` quietly became `body` — because
  picking an option removes the focused button from the document, and removing
  a focused element fires no `focusout`. No blur listener, on the trigger or
  the wrapper, can see that.

  Focus is watched at the document instead, on the two events that do fire:
  focus landing elsewhere, and a pointer going down elsewhere. Only mounted
  while focused, so an unfocused `Select` costs nothing. `focusRing` is back in
  `SelectProps` now that the state behind it is honest.

- **A token in a breakpoint prop did nothing.** `s={{ gap: "4" }}` is what the
  docs and every example teach, and it resolved to nothing at all: no `.s-g-4`
  class existed, `ServerFlex` emitted no breakpoint spacing classes, and
  `ClientFlex`'s inline path guards on `typeof value === "number"`, so the
  string fell through all three. Numbers worked, tokens did not, and neither
  said so. Measured in Chromium at 600px before the fix: gap stayed at its
  base 15px and padding at 22.5px; after, both resolve to the 4 token.

  The same hole ran wider than spacing. `ServerFlex` was already writing
  `.<bp>-opacity-*`, `.<bp>-z-index-*`, `.<bp>-transition-*`,
  `.<bp>-pointer-events-*`, `.<bp>-scrollbar-minimal`, `.<bp>-flex-<n>` and
  `.<bp>-flex-wrap` into the DOM, and not one of those classes existed — seven
  more families of breakpoint prop that reached the page as a class name with
  no rule behind it. They exist now.

  The utility sheet grows from 8.6 KB to 14.4 KB gzipped for the whole
  responsive matrix, which is the price of the props working at all.

### Removed

- **The field `focused` / `filled` styling, which never applied.** The rule was
  `.base.focused, .base.filled` — a compound selector needing all three classes
  on one element — but `focused` and `filled` went on the control, and on
  `Select` onto a wrapper, never onto `.base`. It could not match, and the
  border colour it set was the one `.base` already carried, so it was inert
  twice over. Measured in Chromium: the border is identical across empty,
  filled, focused and `Select`. Gone, along with the classes that fed it and
  `Select`'s `isFilled`, which had no call site to set it, its write-only
  `isFocused`, and a `findIndex` in `handleFocus` whose result was discarded
  under a comment promising a highlight it never set.

  Nothing changes visually. A field still shows no focus indicator by default;
  `focusRing` above is the way to ask for one.

### Changed

- **Fields sit their label and value 2px further apart at m, l and xl.**
  `--fld-gap`, the label-to-value distance in em of the value, was one ratio
  (0.25) for every size; m, l and xl now take 0.375 — 4px to 6px at m, 4.5 to
  6.75 at l, 5 to 7.5 at xl. The pair read tight once the label actually
  floated. xs and s are unchanged: their label is scaled down far enough that
  the base ratio still reads open. Field heights do not change — the ink block
  re-centres, so the label rises by half the increase and the value drops by
  half.
- Core no longer imports `next/*` at runtime. Next.js apps keep 1.8.x behavior by
  installing `NextAdapterProvider` from `@once-ui-system/core/next` in the root
  layout; without it the five components listed above fall back to plain DOM.
  Flipping peer dependencies stays a 2.0 concern.

### Changed (docs site, not published code)

- **`Input` had two `## Variants` headings**, one for the `variant` prop and one
  for the four components built on it, which put two identical entries in the
  page's own table of contents. The second is now `## Built on Input`.

- **`basics/structure` was 1,724 lines and four headings.** `## Flex` ran from
  line 12 to line 1,643, absorbing colour, radius, shadow, opacity, cursor,
  zIndex, position and text along the way — a prop reference wearing a concepts
  page's title, while `components/flex` and `components/grid` were 10-line stubs
  pointing back at it. Structure is 162 lines now and describes the model: two
  primitives, the page skeleton, gaps over margins, tokens, breakpoints. The
  reference moved to Flex and Grid, which are real pages with real tables —
  seven of them on Flex, 95 rows. The colour-usage examples the split would have
  dropped moved to `basics/color`, which documented the tokens but never how to
  apply them.
- **The chart pages document themselves now.** `lineChart`, `barChart`,
  `pieChart` and `lineBarChart` carried hand-written tables because the spec had
  nothing to generate from; with the generator fixed they resolve from it, so a
  renamed prop or a changed default cannot drift past them. Defaults come from
  the source rather than from whoever last edited the page. The gauges, which
  were already generated, gained the prose they were missing — the thing that
  made them look unfinished next to their neighbours. `data/setup` gained the
  full `ChartProps` table, which is where every chart's `...chart` row points.
- **Props tables can document a mixin.** `Flex` has 5 props of its own and 83
  across six shared mixins, so the layout pages needed those spelled out rather
  than collapsed into `...flex`. `<PropsTable mixin="SpacingProps" />` resolves
  from the same generated spec, a group at a time, and every other page keeps the
  short spread row. A component no longer lists a spread row pointing at itself.
- **Every page URL loses its `/once-ui/` prefix**, and the nav is restructured
  around it. The old paths 308-redirect from a generated map, so nothing that
  links to them breaks; `scripts/check-urls.mjs` fails the build on an internal
  link no redirect covers.
- **The changelog and roadmap pages are retired.** This file and `ROADMAP.md` are
  the source of truth, and the docs pages drifted from them; the changelog entry
  in the nav points at GitHub releases, which are generated from here.
- **Props tables are generated from `ai/spec.json`** rather than maintained by
  hand, so a table cannot go stale against the type it documents. A page can
  still override or append a row where the generated text needs help.
- **The home page is rebuilt around intent** — learn, or build — with a prompt
  library of copy-pasteable task prompts that point at the AI harness and the
  block catalog, and a curated twelve-component entry path for a first visit.

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
