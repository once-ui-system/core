# Migrating Once UI Core

One section per major. Each is written to be worked top to bottom: the steps are
in the order that keeps the app buildable between them, and everything not
listed is unchanged.

The changelog is the record of *what* changed and why
([CHANGELOG.md](CHANGELOG.md)); this file is the list of what you have to *do*.

---

## 2.x → 3.0

3.0 is in progress on the `feat/3-0-breaking-cleanup` branch and ships first on
the `next` tag. This section grows with the branch; each step lists what the
codemod does and what it reports for you to finish.

### 1. Run the codemod

**Be on 2.x first.** The codemod reads 2.x code. Check what is installed
(`npm ls @once-ui-system/core`), not only the range: a `"latest"` range can
still be pinned to 1.x by a lockfile, as Once UI's own templates were. On a
1.x tree the codemod stops before it writes anything, with "this looks like
1.x: run the 2.0 codemod first", and says why: the installed or locked
version, a chart, `CodeBlock` or `MediaUpload` export imported from the root
barrel, or a prop under its 1.x name (`<Dialog isOpen>`, `<Input hasPrefix>`).
Do the [1.8.x → 2.0](#18x--20) steps, then this one (`--force` runs it
anyway).

```sh
node scripts/codemod-3.0.mjs src --dry   # see what it would change
node scripts/codemod-3.0.mjs src
```

It only touches Once UI's own components (found through your imports, or by
name in MDX), never a same-named component of yours, and running it twice
changes nothing. Run it once, before you write 3.0 code: it reads every bare
number as 2.x did, so on a size you wrote the 3.0 way (`width={200}`) it would
write `"200rem"`. Lines marked `!` are for you to fix by hand, one per site,
each with its file and line. Code you have
already moved to 3.0 can still take the import step on its own
(`scripts/codemod-3.0-imports.mjs`, § 12), which changes nothing else.

It keeps the layout of what it edits (an import written one name per line
stays that way, a closing tag on its own line stays there, an attribute it
adds to an element written one attribute per line goes on a line of its own),
but a rewrite stays on the line it was on, so a line can grow past your print
width: run your formatter on the files it lists afterwards (`biome check
--write`, `prettier --write`); the run ends by saying so. When it makes files
import `@once-ui-system/fx` or `@once-ui-system/blocks`, the closing note
lists each package with the files that import it: add the package to your
dependencies, and if your app generates other apps, to the dependency list
of every template that ships one of those files.

Source kept as text is checked too. JSX in a template literal (a code
sample) is migrated by name, like MDX. A JSON string that is a byte-exact
copy of source the run rewrote (a scaffolder's find/replace anchor, a
template) is rewritten to the migrated text; other JSON strings holding 2.x
JSX are reported with what would change. A string that generates Once UI
source with a prop filled in by code (`` `<Button variant="${v}">` ``) is
reported, since what it writes cannot be read. Content kept outside the repo
(MDX in a CMS or a database still using 2.x tag names and props) is not
migrated: map the old tags in your MDX components, or migrate that content
where it lives.

### 2. React 19

`react` and `react-dom` 19 are the floor. Upgrade them before anything else.

Components take `ref` as an ordinary prop (React 19) instead of going through
`forwardRef`. Nothing to migrate: `ref={…}`, `ComponentProps<typeof X>["ref"]`
and `ComponentRef`/`ElementRef<typeof X>` give the same element types as in
2.x. Only code that treated a component as a `forwardRef` object (typed it as
`ForwardRefExoticComponent`, or read `.render` or `$$typeof`) needs a change.

### 3. Removed names

| 2.x | 3.0 | Codemod |
| --- | --- | --- |
| `Particle` | `ParticleFx` | renames the import and every element |
| Dialog `hideClose` | `showClose={false}` (an expression is negated) | rewrites |
| CodeBlock `highlight` on the root | `highlight` on each entry of `codes` | rewrites an inline `codes` array, reports any other |
| CodeBlock `styleButton` | `actions={<StyleOverlay>…</StyleOverlay>}`, StyleOverlay from `@once-ui-system/blocks` (§ 12) | reports |
| `ariaLabel` on IconButton, Spinner, Switch, Scrubber, StatusIndicator | `aria-label` | renames |
| `BaseBreakpointProps` | `FlexBreakpointProps` or `GridBreakpointProps` | reports |
| `Sortable.Item`, `Sortable.Handle`; `StylePanel.Root`, `StylePanel.Brand` and every other section (F11) | `SortableItem`, `SortableHandle`; `StylePanelRoot`, `StylePanelBrand`…, named exports. A list prop (`items`, `columns`, `options`) for same-shaped data, a named part otherwise, never a dotted name: it fails from a server component | renames every reference and adds the names to the import; `scripts/codemod-3.0-part-names.mjs` runs this step alone |
| `TextBreakpointProps`, `ButtonBreakpointProps`, `InputBreakpointProps` | none: leaves take `LeafProps` and no breakpoints (§ 13) | not rewritten; `tsc` names them |
| `resetScrollLockState`, `resetAdapterWarning`, `warnIfFrameworkUnadapted` | none: they were test-only or internal | reports |

### 4. One value contract: fields

Every field and picker follows one rule: state `X` is `X` / `defaultX` /
`onXChange(next)`, and it is controlled only when `X` is set. `onChange` only
ever means the native DOM event, forwarded to the real `<input>`, so a form
library's `{...register("x")}` spread works on every field that has one. Each
renamed handler keeps its 2.x signature, so the codemod's rename is the whole
migration; a leftover `onChange={(v: number) => …}` is a TypeScript error, not
a silent bug.

| 2.x | 3.0 | Codemod |
| --- | --- | --- |
| NumberInput, ColorInput, TagInput, DateInput `onChange(value)` | `onValueChange(value)`; `onChange` is now the native event of the input | renames |
| DateRangeInput, DatePicker, DateRangePicker `onChange(value)` | `onValueChange(value)` | renames |
| Select `onSelect(value)` | `onValueChange(value)`; `onSelect` stays the action on menus (DropdownWrapper, ContextMenu) | renames |
| DatePicker `defaultDate` (declared, never read) | `defaultValue`, which now works | renames |
| DatePicker `open` | kept, but it only ever re-focused the grid for `autoFocus`; it never showed or hid the picker | reports every use |
| OTPInput spread its div props (`onChange`, `onKeyDown`, `id`, …) onto every digit and dropped `className` | they go on the root, `className` included | nothing to rewrite: check any handler you passed |

Added, nothing to migrate: `onValueChange(value: string)` on Input, Textarea
and PasswordInput, whose `validate` and character count now work uncontrolled;
`defaultValue` on NumberInput, ColorInput, DateInput, DateRangeInput, Select,
DatePicker, DateRangePicker and OTPInput; `value`/`defaultValue`/`onValueChange`
on OTPInput; `open`/`defaultOpen`/`onOpenChange` on Select, DateInput and
DateRangeInput. ColorInput's `value` and handler are no longer required.

### 5. One value contract: controls

The same rule on toggles, groups and disclosure: `checked` / `defaultChecked` /
`onCheckedChange`, `value` / `defaultValue` / `onValueChange`, `open` /
`defaultOpen` / `onOpenChange`, controlled only when the state prop is set.
Checkbox, RadioButton and Switch now put their native input props (`onChange`,
`onBlur`, `name`, `required`, `form`, `data-*`, …) on the hidden `<input>`,
which every change goes through, so `{...register("x")}` works on them too.

| 2.x | 3.0 | Codemod |
| --- | --- | --- |
| Checkbox, RadioButton, Switch `onToggle(checked)` | `onCheckedChange(checked)`; `onChange` is now the input's native event | renames |
| RadioGroup, SegmentedControl, Tabs, Slider, RangeSlider, ThemeSwitcher `onChange(value)` | `onValueChange(value)` (SegmentedControl keeps its `(value, event?)`) | renames |
| StylePanel and `StylePanel.Root` (`StylePanelRoot`) `onChange(next, changed)` | `onValueChange(next, changed)`; `value` alone now makes the panel controlled | renames |
| Pagination `onChange(page)` | `onPageChange(page)`, as on Table | renames |
| FileTree `onExpandChange(ids, item)` | `onExpandedIdsChange(ids, item)`; `onSelectedIdChange(id, item)` is new, `onSelect` stays | renames |
| Scrubber `onChange(time)`, `onSelect(blockId)` | `onValueChange(time)`, `onSelectedChange(blockId)` | renames |
| Accordion, NavGroup `onToggle()` | `onOpenChange(open)`, which receives the next state; a zero-argument toggle still works | renames and reports every use |
| Accordion `open` without `onToggle` was only the starting state | `open` always controls it; use `defaultOpen` for a starting state | renames `open` to `defaultOpen` where no `onToggle`/`onOpenChange` is set; reports it beside a spread or a `defaultOpen`, and an `open={expr}` (2.x also followed the value when it changed later; control it with `onOpenChange` if it does) |
| RevealFx, Carousel `revealedByDefault` | `defaultRevealed` | renames |
| Kbar, KbarContent `inputSize` | `size` | renames |

Behaviour to check: a RadioButton outside a RadioGroup no longer unticks when
it is clicked again, as a native radio; SegmentedControl no longer moves its
selection when controlled and the parent keeps `value`. A wrapper of yours
that reads `props.onToggle` (as the docs' `ClientSwitch` did) needs that read
renamed by hand.

Added, nothing to migrate: `defaultOpen` on Accordion and on each
AccordionGroup item (which also fixes `autoCollapse={false}` items that could
never open); `open`/`defaultOpen`/`onOpenChange` on Kbar; `onValueCommit` on
Slider, on pointer release and after each key; a group `disabled` on
SegmentedControl, whose `onValueChange` is no longer required.

### 6. A number is on the token scale

A bare number has one meaning per kind now: a length is on the **token
scale**, a time is **milliseconds**, and `speed` is a **multiplier**. On the
token scale a number means what the spacing token of the same name means:
`16` = `"16"` = 1rem, and it scales with `data-scaling` as the tokens do
(`calc(1rem * 1.1)` at 110). At the default root size (16px) and scaling, a
number is that many px, so `width={320}` is 320px on a desktop; on a phone,
whose root size is 15px, it is 300px, as `"320"` would be. In 2.x a number
was rem on sizes, spacing and offsets (and vh, a percentage or seconds on a
few props), so `maxWidth={40}` was 640px; in 3.0 it is 2.5rem. Run the
codemod: it writes the rem you had as a string, `maxWidth="40rem"`, which
renders exactly as before and still follows the root font size. Tokens are
unchanged (`padding="16"` is the spacing step), and any CSS length string
now works where a size, spacing or offset is accepted (`"320px"`,
`"40rem"`, `"50%"`, `"100dvh"`, `calc(…)`); write px (`"320px"`) for a
length that must not follow the root size or the scaling. A test that reads
an inline style sees a step as its token (`var(--static-space-16)`) and any
other number as `var(--ou-n-320)`, a custom property the element declares
itself.

| 2.x | 3.0 | Codemod |
| --- | --- | --- |
| `width`, `height`, their `min`/`max`, `minColumnWidth`, `padding*`, `margin*`, `gap`, `top`/`right`/`bottom`/`left`, `translateX`/`Y`, `blur`, `backdropBlur` as a number: rem | the token scale (16 = 1rem) | `{40}` → `"40rem"` on Once UI elements, also inside an inline breakpoint object and in both branches of a ternary of literals |
| Avatar `size`, Media `height`, Carousel `thumbnail.height`, Animation `slideUp`/`Down`/`Left`/`Right`, DropdownWrapper and ContextMenu `minWidth`/`maxWidth`, Setting `controlWidth`, SettingAxes `axisWidth`, CodeBlock `codeHeight`, Fade `blur` as a number: rem | the token scale (each also takes a CSS length string) | `{n}` → `"nrem"` |
| `dataStyle.height` in the config, DataThemeProvider `height`: rem (the default chart height, 24) | the token scale, or a CSS length string (`"24rem"`, the default) | `height: 24` → `"24rem"` inside a `dataStyle: { … }` object or a `const dataStyle = { … }`, and on DataThemeProvider; a TypeScript use site of the rewritten config gets ``height={dataStyle.height as `${number}rem`}``. A `const dataStyle: DataStyleConfig = { … }` with a type of yours keeps its number (rewriting it would break that type) and the use site becomes ``{`${dataStyle.height}rem`}`` |
| Mask `x`/`y`: a percentage; `radius`: vh | a number is on the token scale; `x="50%"`, `radius="50vh"` (the default) as strings | `{50}` → `"50%"`, `radius={n}` → `"nvh"` |
| Background `gradient.x`/`y`: a percentage; `gradient.width`/`height`: a quarter-percent of the 4× layer | a number is on the token scale; a percentage string is of the element (`width: "100%"` is what `100` was, the default) | `n` → `"n%"`, also in `mask={{ x, y, radius }}` |
| CelebrationFx and WeatherFx `duration`, MatrixFx `bulge.duration`, FlipFx `autoFlipInterval`: seconds | milliseconds | `{4}` → `{4000}` (a literal under 50; between 50 and 1000 it asks) |
| RevealFx `speed` (`"fast"`/`"medium"`/`"slow"` or ms) | `duration` in ms (1000/2000/3000) | rewrites |
| ShineFx, CountFx `speed` (ms) | `duration` | renames |
| TypeFx `speed` (ms per character) | `charDuration` | renames |
| ParticleFx `speed`: default 0.3 | a multiplier with 1 as the default (2.x's 0.3): divide a 2.x value by 0.3 | divides a literal by 0.3 to two decimals (`{0.6}` → `{2}`) and removes it when that is 1; an expression that is always a number becomes `{config.speed / 0.3}`; reports any other expression and a literal in MDX |
| AutoScroll, GlitchFx, LetterFx `speed`: a keyword | a multiplier or a keyword, `"slow"`/`"medium"`/`"fast"` = 0.5/1/2 | nothing to rewrite |

`Skeleton` takes its own lengths: `width`, `height`, `minHeight` and
`maxHeight` are a number on the token scale, a static spacing token or a CSS
length, and a t-shirt step (`width="m"`, which 1.x read as a percentage and
Flex would read as a page-wide responsive width) is a type error. `minWidth`
and `maxWidth` take what Flex's do, so `<Skeleton maxWidth="l">` still caps a
placeholder at the `l` container width (`.max-width-l`), as on Flex. A 2.x
`<Skeleton width={12} height={2.5}>` was rem, and the codemod writes it
`width="12rem" height="2.5rem"`; `size` (the line's height or the circle's
diameter) keeps its `xs`…`xl` scale.

Not rewritten, because they were already px, which the token scale renders
the same at the default root size and scaling: Dialog, DateInput and
DateRangeInput `minHeight` (DropdownWrapper's and ContextMenu's are written
`"200px"`, since the Dropdown they merge into read numbers as rem in 2.x);
Animation `blur`; AutoScroll `scrollGap`; Pulse `pulseSize`. These are on the
token scale now too; write `"200px"` where one must stay fixed.

Still device pixels, because they are: `borderWidth` and Background
`lines.thickness` (hairlines), `sizes` (an image hint), InfiniteScroll
`threshold` (an observer margin), MatrixFx `size`/`spacing` (the canvas), and
LinearGauge and RadialGauge `width`/`height` (the drawing's own units: the
gauge scales to its box, so set the box with `maxWidth`).

A variable, arithmetic or a call on one of these props is followed as far as
its value can be read: consts of the file (the one in scope where a name is
declared twice), objects and arrays, a config imported from your own files
(relative, `@/`, tsconfig `paths`, re-exports), the items of an array that is
mapped, a destructured value, a prop typed `number` in the file or in an
imported type, arithmetic, and what a function returns or declares it
returns. When every value it can take is a number, the use site becomes a
template, ``maxWidth={layout.content.width}`` → ``maxWidth={`${layout.content.width}rem`}``,
and the config keeps its number. When none is (`"m" | "l"`, a `` `${n}%` ``
string) it is left alone. A const of this file that holds numbers or
`undefined` and only feeds these props (`const formWidth = wide ? undefined : 32`)
is rewritten where it is defined. What is left is reported, one line per
site: a value that is a number only some of the time, with the lines its
numbers are on (write them as `"Nrem"` there and widen their type to
`` `${number}rem` ``), a value it cannot read, with why (`it is the result of
a call`), a breakpoint object passed by name, and spreads. A number
on one of these props on a component of your own (defined in the file, or
imported from a relative path, `@/`, `~/`, or an alias in your tsconfig or
jsconfig `paths`) becomes a rem string when the codemod can read that the
component hands the prop on to a Once UI layout component (`<Book
minWidth={14}>`, where Book spreads its props onto a `Row`); otherwise it is
reported: write `"14rem"` there if it does. A component that makes the
number rem itself (`minWidth={minWidth ?? 12}` on a Column inside it, which
becomes a template), only uses it in an inline style, or never reads it,
keeps its call sites' numbers. Mask `radius="50"` and the numeric strings in
Background's objects (`x: "50"`) read as the numbers they were.

The codemod does not rewrite a config at its source (apart from
`dataStyle`): its numbers are read where they reach a prop. If you change
one yourself, mind the file: a rem string in a config is a `CSSUnit` only
when TypeScript sees the literal. In a `.ts` config write `width: "44rem" as
const` (or `as const` on the object); a `.js` config infers `string`, which
the props do not take, so there keep the number and write the template at
the use site (``maxWidth={`${layout.content.width}rem`}``), or cast it
(``height={dataStyle.height as `${number}rem`}``). A config comment such as
"units are set in REM" is no longer true of a bare number.

Behaviour to check: keyword speeds that did not divide evenly moved to the
shared scale (GlitchFx `"slow"` is a 5s cycle rather than 3.5s, `"fast"`
1.25s rather than 1.5s, and its `speed` now takes effect at all; LetterFx
`"fast"` steps every 15ms rather than 10ms).

### 7. Exports that became internal

The root barrel drops the parts other components are built from, so what is
left is what an app composes. (`Arrow`, the hover arrow of a card or link,
stays public: a number on its offsets is on the token scale, as everywhere.) The modules still exist inside the package; only
the exports are gone. The codemod reports every import of one, with what to use
instead, and changes the code only where the replacement is exact
(`DialogProvider`, `generateMetadata`).

| 2.x export | 3.0 | Codemod |
| --- | --- | --- |
| `ServerFlex`, `ClientFlex` | `Flex`, which already picks its server or client half | reports |
| `ServerGrid`, `ClientGrid` | `Grid`, likewise | reports |
| `Cursor` | Flex's or Grid's `cursor` prop, given an element | reports |
| `ElementType` | `SmartLink` for a link, `Button` / `IconButton` for an action, a plain `<button type="button">` for a bare one. A whole card that links is `Card href` (or, for a shape of your own, a small component that renders an `<a>` when there is an `href` and a `Row` when there is not, as `Book`'s `BookLink` does in `@once-ui-system/blocks`). To keep 2.x's unstyled element as it was: `const Interactive = ({ href, ...rest }) => href ? <Link href={href} {...rest} /> : <button type="button" {...rest} />` (Link from `next/link` or your router) | rewrites what it rendered where that can be read: no `href` and an `onClick` or a literal `type` → `<button>` (`type="button"` added when none was set), an `http(s)` literal `href` → `<a target="_blank" rel="noreferrer">`, neither → `Flex`; reports an internal or computed `href` and a spread, with the `Interactive` above |
| `InteractiveDetails`, `InteractiveDetailsProps` | `label` and `description` on Checkbox, RadioButton and Switch | reports |
| `Toaster` | nothing: `ToastProvider` renders it; show toasts with `useToast()` | reports |
| `ArrowNavigation`, `ArrowNavigationProps`, `useArrowNavigationContext`, `withArrowNavigation` | the `useArrowNavigation` hook on your own container: pass `containerRef`, call `handleKeyDown` from `onKeyDown` | reports |
| `DialogProvider` | nothing: a `stack` Dialog makes the one beneath it inert by itself (the provider's state was never read) | drops the import, `<DialogProvider>` becomes `<>` |
| `generateMetadata` | `createMetadata` (or `Meta.generate`, unchanged). The old name is Next's route-segment convention, so a page that re-exported it had it called by Next | renames the import and every call; keeps a re-export's public name and reports it |
| `dev` | a logger of your own that logs only in development, as 2.x's did | imports `dev` from your app's own module when exactly one exports it (`export const dev = …`); otherwise reports, with the six lines to paste |
| `getLastOpenedDropdown`, `setLastOpenedDropdown`, `clearLastOpenedDropdown` | nothing: dropdowns close each other | reports |
| `MissingDependency` | nothing: the fallback a chart, CodeBlock or MediaUpload shows when its peer is missing | reports |
| `escapeHtml`, `safeScriptJson`, `sanitizeHref` | a sanitiser of your own; `Schema`, `ThemeInit` and `SmartLink` keep using them | reports |

The rest of core no longer depends on the effects: ProgressBar, RadialGauge and
DataTooltip count up, Carousel and DatePicker reveal, and Table's loading text
shines with internal parts of their own instead of `CountFx`, `RevealFx` and
`ShineFx`. Nothing changes in how they look or what you pass them; it is what
lets the effects move to `@once-ui-system/fx` later.

### 8. Tone and variant

Each visual prop has one meaning now. **`tone`** is the semantic palette,
`brand | accent | neutral | info | success | warning | danger`, on every
component that had one, whatever 2.x called it. **`variant`** is how a
component looks, never its colour. **`scheme`** is a palette hue (`blue`,
`green`…). Text and Heading take **`textVariant`**, the name Flex already used,
so `variant` never means typography.

| 2.x | 3.0 | Codemod |
| --- | --- | --- |
| Button, IconButton `variant="danger"` / `"success"` / `"warning"` | `tone="danger"` (on the default `primary` variant; any variant takes any tone) | rewrites a literal, and a ternary of literals (`variant={bad ? "danger" : "secondary"}` → `variant={bad ? "primary" : "secondary"} tone={bad ? "danger" : undefined}`); reports a variable |
| Button, IconButton `variant="quaternary"` | `variant="ghost"` | rewrites, also inside a ternary |
| Button, IconButton `color="brand-strong"` (it tinted only the icons) | `tone="brand"`, which colours the label and icons together | rewrites and reports, because the label changes colour |
| Table `actions[].variant: "danger"` | `variant: "primary", tone: "danger"` | rewrites an inline array; reports one built elsewhere in the file |
| Feedback, Toast `variant`; `addToast({ variant })` | `tone` (Feedback now takes any tone) | renames, also in each object a ternary passes to `addToast`; the `{ variant }` shorthand becomes `tone: variant`; reports an argument it cannot see |
| Feedback `icon` written bare (MDX's `<Feedback icon>`): named no icon, and 2.x drew an empty gap | the tone's icon unless `icon` names another; a name the library lacks draws no box | reports it: remove it for the tone's icon, or `showIcon={false}` for none |
| Tag, Pulse `scheme`; Tag `scheme="gradient"` | `tone`; `variant="gradient"` | rewrites |
| Scrubber `tracks[].scheme`, `blocks[].scheme`; the `ScrubberTrack["scheme"]` and `ScrubberBlock["scheme"]` types | `tone` | rewrites an inline array, and one built in the file (a const used once, `.map(… => ({ … }))`, `useMemo`); reports the rest |
| Timeline `items[].state` (`"active"`, `"success"`, `"danger"`, `"default"`); `TimelineItem["state"]` | `tone` (`"brand"`, `"success"`, `"danger"`, none) | rewrites an inline array, one built in the file as for Scrubber (a `.map` over any array, a ternary of states), and a `const items: TimelineItem[]` with its `.push`es; reports the rest. Items built in a `.map` are not checked by TypeScript (an object literal returned from a callback has no excess-property check), so a `state:` left behind compiles and is ignored: look for `state:` near Timeline data, or type the array `TimelineItem[]` |
| LinearGauge, RadialGauge `hue="success"` / `hue={[a, b]}` | `tone="success"` (also `"warning"`) / `hueRange={[a, b]}` | rewrites a literal or a ternary of tones; reports a variable |
| StatusIndicator `color`, Avatar `statusIndicator={{ color }}` | `scheme` | renames |
| Text, Heading, ListItem, CountFx, ShineFx, TypeFx, FadingLettersFx `variant` | `textVariant` | renames, also in `ComponentProps<typeof Text>["variant"]` and `TextProps["variant"]` |
| Tag, StatusIndicator, Pulse, Accordion, Pagination `size`: `s` to `l` | `xs` to `xl` | nothing to rewrite |

`subtle` stays a Button and IconButton variant. A free colour prop (Background's
`gradient`, `dots`, `lines` and `grid` colours, ParticleFx `color`, chart series
and gauge `color`) now goes through one resolver: a raw CSS colour (`#fff`,
`rgb()`, `hsl()`, `oklch()`, `white`) passes through, a token name becomes its
custom property, and `brand-weak` is `--brand-on-background-weak`. 2.x wrapped
every value in `var(--…)`, so `#fff` painted nothing; nothing to migrate.

Looks that change: a toned non-primary Button colours its label as well as its
icons; `quaternary` lost its hover fill as `ghost`. A 2.x `color` on an
IconButton is an `<Icon onBackground="…">` passed as its children in 3.0, which
is how CodeBlock's header keeps its grey icons.

### 9. Badge and Chip are Tag

`Badge` and `Chip` are no longer exported. `Tag` takes over both jobs:

- `<Tag variant="announce">` is the announcement pill (2.x Badge), with `href`,
  `arrow` (on by default with `href`) and `effect` (the shine, on by default on
  `announce`). Each tag's arrow follows its own hover, so the `id` that 2.x
  needed on every Badge of a page can go (every Badge defaulted to
  `id="badge"`).
- A Tag with `selected`, `onClick` or `onRemove` is the toggle (2.x Chip):
  `role="button"` with `aria-pressed`, a remove button beside it, drawn
  selected in its tone (`brand` by default). **`selected` defaults to false**;
  Chip's defaulted to true, so a 2.x `<Chip label="x" />` was drawn and
  announced as selected.
- A Tag with only `onClick` keeps 2.x Tag's look, in its tone and size, and
  is now a focusable button that Enter and Space press.

| 2.x | 3.0 | Codemod |
| --- | --- | --- |
| `<Badge title="New" icon="rocket" href="/blog" />` | `<Tag variant="announce" label="New" prefixIcon="rocket" href="/blog" />` | rewrites the element, closing tag, import, `BadgeProps` and `typeof Badge` |
| Badge with both `title` and children | Tag shows its `label`, or its children without one | reports |
| `<Chip label="A" onRemove={drop} iconButtonProps={…} />` | `<Tag selected label="A" onRemove={drop} removeButtonProps={…} />` | rewrites, and writes `selected` where it was left out so the chip keeps its look |
| `Chip` / `Badge` passed as a value (a component map) | `Tag` | reports |
| TagInput's chips | TagInput renders `Tag selected` with a remove button | nothing to do |

A Tag with only `onRemove` is a plain label beside its remove button rather
than a toggle; add `selected` or `onClick` to make it one.

### 10. Components that merged

Twenty-three components fold into the one that already did most of their job.
Each 2.x behaviour is a mode or a prop of the survivor and, except where noted
below the table, looks and behaves the same; the old exports are gone. The codemod rewrites the element, its props and
the import (keeping an alias, adding the survivor once), renames the prop types
(`ModalProps` → `DialogProps`, `DropdownWrapperProps` → `DropdownProps`,
`HoverProps` / `CursorCardProps` → `HoverCardProps`, `DataTableColumn` →
`TableColumn`, `DataTableQuery` → `TableQuery`, `RangeSliderProps` → `SliderProps`, and so on), and reports any
other use of an old name, such as passing it as a value (a mention in a
comment, a string or JSX text is not one). It does the same for
`<core.Modal>` through `import * as core`, importing a survivor that left the
root from its package (`<core.RevealFx>` becomes `<RevealFx>` from
`@once-ui-system/fx`). An old name left as a shorthand key of a component map
(`const components = { ScrollContainer, Text }`, an MDX components object)
becomes `ScrollContainer: Scroller`, which keeps an MDX `<ScrollContainer>` tag
working, with Scroller's props.

| 2.x | 3.0 | Codemod |
| --- | --- | --- |
| `Modal` | `Dialog variant="sheet"`; `backdrop` is a slot of both variants | renames; every prop carries over |
| `Swiper` | `Carousel mode="snap"` | renames; `indicator` (a boolean) becomes Carousel's: `true` is the default, `false` stays, an expression becomes `x ? "line" : false` |
| `ScrollContainer` | `Scroller` in track mode: `draggable`, `infinite`, `markers`, `proximity`, `active` / `onActiveChange`, `step`, `clip`; per-tile props in `tile` | `items` become the children (an inline array is split); tile props move into `tile={{…}}`; adds `draggable` when no track option is set. A spread of a `const` of the file used only there (`{...TILE}`) becomes `tile={TILE}` (or `tile={{ ...TILE, … }}` beside other tile props), its track options (`proximity`) move onto the Scroller, and its rem numbers become rem strings; any other spread is reported, since its props went to every tile in 2.x |
| `AutoScroll` | `Scroller auto={{ speed, hover, reverse, gap }}` (`auto` alone for the defaults) | collects `speed`, `hover`, `reverse` and `scrollGap` into `auto` |
| `InfoTip` | `Tooltip content={…}`: a Tooltip with `content` and no children renders the info icon; with children it describes them | moves the children into `content` and closes the tag |
| `Hover` | `HoverCard placement="cover"`, with `delay`, `hideDelay` | moves `overlay` into the children; reports when the element had children of its own, which 2.x ignored |
| `CursorCard` | `HoverCard placement="cursor"`, its corner as `cursorPlacement` | moves `overlay` into the children and `placement` to `cursorPlacement` |
| `DropdownWrapper` | `Dropdown`: the wrapper's API under the short name; the menu is the children (`dropdown` stays as a deprecated alias) | renames; moves `dropdown` into the children, unwrapping a fragment |
| `Dropdown` (2.x, the bare panel) | internal; use `Dropdown` with a `trigger`, or the panel's own layout for a static one | writes each `<Dropdown>` without `trigger` as what it rendered (`<Row border="neutral-medium" background="surface"><Column flex={1} overflowY="auto" gap="2">…</Column></Row>`, `disabled` as its class, opacity and `aria-disabled`), drops the import when nothing else uses it; reports `onSelect`, a variable `disabled`, `Dropdown` passed as a value (a components map), and `DropdownProps`, whose meaning changed |
| `ContextMenu` | `Dropdown openOn="contextmenu"`, with `disabled` and `contents` | the children become `trigger`, `dropdown` the children |
| `EmojiPickerDropdown` | `EmojiPicker trigger={…}`, with `open` / `defaultOpen` / `onOpenChange`, `placement`, `closeAfterClick` and `dropdownProps` | renames; props that were the dropdown's move into `dropdownProps` |
| `UserMenu` | `User dropdown={…}`, with `selected`, `placement` and the menu's size props | renames; adds `dropdown={null}` when there was none, so the user still renders as a trigger |
| `DataTable` | `Table`: the DataTable API under the short name (`columns`, `rows`, sorting, selection, `pagination`, search and filters, `columnVisibility`, `onQueryChange`, `loading`, `emptyState`), plus `searchable`, `actions`, `onRowClick`, `rowClassName`, `cellClassName`, `loadingState` and `showFirstLast` | renames, with the `DataTable*` types |
| `Table` (2.x, `data={{ headers, rows }}`) | `Table columns={…} rows={…}`: a header's `content` is the column's `header`; rows may still be arrays, read by position | splits an inline `data` or a plain variable (`x.headers.map(…)`, `rows={x.rows}`); `defaultPageSize` → `defaultPerPage`, `pageSizeOptions` → `perPageOptions`; keeps 2.x's page-size select and first/last buttons when paginated; `onRowClick`, `rowClassName`, `cellClassName` and inline `actions` callbacks get the row first; reports any other `data` |
| `DateRangePicker` | `DatePicker range`; `dual` is `months={2}` | adds `range`; `dual` becomes `months={2}` (an expression `x ? 2 : 1`, `false` dropped) |
| `DateRangeInput` | `DateInput range` | adds `range`; every prop carries over |
| `RangeSlider` | `Slider range` | adds `range`; every prop carries over |
| `PasswordInput` | `Input type="password"`, which keeps the show/hide toggle (`reveal={false}` drops it) | renames and sets `type="password"`; reports a `suffix`, which now sits beside the toggle |
| `KeyTip` | `Kbd keys="mod+k" label="Search"` | renames; `keys` and `label` carry over |
| `MasonryGrid` | `Grid masonry` | adds `masonry`; reports `xl`, which MasonryGrid never had |
| `Pulse` | `StatusIndicator pulse`, with `tone`, `size`, `pulseSize` | adds `pulse` |
| `FadingLettersFx` | `TypeFx mode="fade"`, with `state` | `text` → `words`, `animationState` → `state`, `messageIdx={n}` → `delay={n * 2500}` |
| `SettingGroup` | `Setting control={…} open={…}` | renames; adds `open={false}` when neither was set; reports a spread |
| `SettingAxes` | `Setting axes={…}` | renames; every prop carries over |
| `MobileMegaMenu` | `MegaMenu collapseBelow="always"`; `collapseBelow="m"` gives one menu that switches at a breakpoint | renames and adds `collapseBelow="always"` |

Two things work better and you may notice them. Dialog and Drawer share one
overlay core, so Escape closes only the innermost open overlay (a Dialog opened
from a Drawer closes alone), and focus goes back to the trigger as the overlay
starts closing rather than after its exit animation. Clicks outside follow
the same rule: a click in a stacked Dialog no longer closes the one beneath it,
and the Toaster stays clickable while a Dialog is open, so a toast's Undo works.
A Dialog that mounts open now takes focus (its overlay used to be hidden for its
first frame, so focus fell to `<body>`). The Dialog's `role="dialog"`, its name,
its `className` and its `ref` are all on the panel now, not the full-screen
overlay, and an `aria-label` names it instead of the title; a string `title`
renders an `h2`, so the page keeps its only `h1`. Update a test that clicked the
`role="dialog"` element to mean "outside": click its parent, the overlay. An uncontrolled
`EmojiPicker trigger` now closes on a pick; 2.x's `EmojiPickerDropdown` closed
only when controlled.

A few merges look different, by design:

- `Table` (both 2.x Tables) sorts on a click of the header, cycling ascending,
  descending and unsorted; 2.x's "Sorted by X ✕" line under the table is gone.
  Its page controls are Pagination's, with the per-page select beside them,
  instead of the "page / total" text and a separate page-size Select. Loading
  without `loadingState` shows skeleton rows, not the "Loading data..." text.
- `Input type="password"` now shows the reveal toggle everywhere, not only in a
  PasswordInput. The codemod does not add `reveal={false}`: add it where a
  plain masked field was meant.
- A `suffix` on a 2.x PasswordInput was dropped; it now shows, before the toggle.
- `MegaMenu collapseBelow` at a breakpoint renders both the bar and the
  accordion and hides one with CSS.

### 11. Types, resets and aliases

**`as` is typed by the element.** On `Flex`, `Row`, `Column`, `Grid` and
`VisuallyHidden`, `as` decides the attributes and the ref: `<Row as="a"
href="/x">`, `<Column as="form" onSubmit={…}>` with a `FormEvent<HTMLFormElement>`,
`<Row as="button" type="submit">`, and `<Column as="ul" ref={listRef}>` with a
`Ref<HTMLUListElement>`. Code that compiled before still compiles, except
where it relied on the element being typed as a `div`:

- A ref of the wrong element is now an error (`<Column as="ul" ref={divRef}>`).
  Type the ref by the element.
- A component of your own that spreads div props onto `<Column as="ul">` may
  need its props typed for that element: `FlexPropsOf<"ul">`.
- `React.ComponentProps<typeof Flex>` (and `Row`, `Column`, `Grid`) is the
  `div` form, without `as`; `PolymorphicProps<"a", FlexLayoutProps>` is the
  props on another element. `React.ComponentProps<typeof Text>` was `any` and
  is now Text's real props, so a wrapper built on it may find a prop it never
  had (CountFx's 2.x `speed` is `duration`).
- **Components other than those five, Text, Heading, List and Form take no
  `as`.** 2.x let Card, Tag, Avatar and the other Flex-based components accept
  an untyped `as` and pass it on. Wrap them instead:
  `<Column as="li"><Card … /></Column>`. The codemod reports each use.

**Lists and buttons reset.** `<Column as="ul">`, `<Row as="ol">` and `<Grid
as="ul">` render without bullets, indent or margin, and `as="button"` without
the browser's background, border, padding (its `1px 6px` inset too) and font,
and with `type="button"` unless you pass `type`. The resets have zero
specificity, so every prop still applies, and the `style={{ listStyle:
"none", margin: 0, padding: 0 }}` and `all: "unset"` workarounds are no longer
needed (the codemod leaves them: they are harmless).

A 2.x list looked the way the browser draws one. To keep that look, the
codemod writes it back on every `as="ul"` / `as="ol"` layout element:

```tsx
<Column as="ul" gap="8" className="list-disc" paddingLeft="40px" marginY="1em">
```

(`list-decimal` on `ol`), leaving out what the element already sets: its own
`paddingLeft`, `paddingX` or `padding`, a `marginTop` or `marginBottom`, a
`listStyle` in its style, or an inline reset. This is the browser's style
exactly: `40px` and `1em` rather than the `"40"` and `"16"` tokens, which
grow and shrink with the theme's scaling where the browser's indent does
not, and the margin follows the list's font size. `List` is a different look
(a 20px indent and no block margins). A list beside a `className`, a spread
or inside another list is reported instead, since the restore could clash
with it. Remove the restore from a list you wanted bare.

**New values.** `vertical="baseline"` aligns children on their first line of
text (a class, also in breakpoint objects). Margins take `"auto"`:
`marginLeft="auto"`, `marginX="auto"`.

**`DateRange`'s `startDate` and `endDate` are optional**, both ways: a `{
startDate?: Date }` of your own is a `DateRange`, and a range handler typed
with required fields (`(r: { startDate: Date; endDate: Date }) => …`) no
longer fits `onValueChange`. Type it `(r: DateRange)` and check each field
before you use it (a range mid-pick has a start and no end).

**`TextProps` and `HeadingProps` are what a wrapper types its props with.**
They carry `children`, `className`, `style` and the element's HTML attributes
beside the typography and leaf props, so the MDX-components pattern compiles:
`(props: TextProps) => <Text {...props} />`, `({ children, ...rest }:
HeadingProps<"h2">) => …`. They have no padding (§ 13): a wrapper that set
padding puts a `Column` around the text.

**Charts take your row type.** `BarChart`, `LineChart`, `LineBarChart` and
`PieChart` are generic over `data`: `data={rows}` with `rows: RevenueRow[]` needs
no cast, and `series={{ key: "revnue" }}` is a type error. `SeriesConfig<T>`,
`ChartProps<T>` and the chart prop types take the row type; left out, they are
the 2.x `DataPoint` shapes. PieChart `dataKey`/`nameKey` are row keys.

**Checkbox, Switch, RadioButton and RadioGroup** take `error`, `errorMessage`
and `size` (`s`/`m`/`l`; `xs` and `xl` draw as `s` and `l`), as Input does: a
`Form size` reaches them, and a RadioGroup's size reaches its radios. Nothing
changes until you set one; the default is the 2.x look.

**One name per prop.**

| 2.x | 3.0 | Codemod |
| --- | --- | --- |
| `dark` / `light` (Flex, Row, Column, Grid, Logo and the components built on them) | `showIn="dark"` / `showIn="light"` | rewrites; `dark={cond}` becomes `showIn={cond ? "dark" : undefined}`; reports both at once |
| `textSize`, `textWeight`, `textType` on layout components | `textVariant="type-weight-size"` | folds three literals; removes size and weight beside a `textVariant`, which overrode them; reports the rest |
| Text / Heading `size` | `textVariant` (a preset sets family, weight and size; `size` alone only applied under a parent that set the family) | removes it beside `textVariant`, where 2.x ignored it. A Text `size` literal becomes the class 2.x wrote (`size="s"` → `className="font-s"`, merged into a literal className); on a component of yours that hands `size` on to a Text (its props are Text's and it spreads them), it is reported at the call site with the class to write; a Heading `size="m"` goes, `s`/`xs` become `className="font-s"`/`"font-xs"`, and `l`/`xl` go under a parent in the file that sets no family (they did nothing); under one that may, it is reported: write that family's preset (`textVariant="heading-strong-l"`), since 3.0's Heading always sets its own size |
| Text / Heading `weight` beside `textVariant` | kept; it now swaps the preset's weight (2.x ignored it there) | removes it beside `textVariant`, so the page renders as before |

Check a Text that had `size` beside `weight` before you turn it into a
preset. 2.x wrote `font-s` and the weight class, and `font-s` set no size
without a family above it, so the text kept the size it inherited. The
codemod writes that same class, so the page renders as before. A preset sets
the family, so the size it names applies: `<Text size="s" weight="strong">`
written as `textVariant="body-strong-s"` really renders at 14px, where 2.x
showed the inherited 16px. Pick the preset by the size the page showed, or
keep the smaller one if "small" was what was meant.

`weight` and `family` stay on Text and Heading as overrides of the preset, and
the layout shorthands stay (`fill`, `fit`, `center`, `paddingX`/`Y`,
`marginX`/`Y`, `borderX`/`Y`, `topRadius` and its siblings): they set two
props in one and are the most-written props in Once UI code. `Grid` now applies
`textVariant`, which 2.x typed and dropped.

### 12. Packaging and imports

**Import from an entry point.** 3.0 has one entry per feature and no deep
imports. The subset subpaths (`/components`, `/contexts`, `/hooks`, `/icons`,
`/types`, `/interfaces`, `/utils`) and `/modules` only re-exported parts of
the root, and `/components/*` made every file in `dist/components` public,
internals included. Import from the root instead. Four components left it
for a subpath, and twenty-two for a package of their own (below the table):

| 2.x | 3.0 |
| --- | --- |
| `@once-ui-system/core/components`, `/contexts`, `/hooks`, `/icons`, `/types`, `/interfaces`, `/utils`, `/modules`, `/components/<Name>` | `@once-ui-system/core` |
| `EmojiPicker` (root) | `@once-ui-system/core/emoji`, so its emoji data (about 270 KB) is in no bundle that does not render it |
| `Scrubber`, `CompareImage` (root); `MediaAudioPlayer`, `MediaVideoPlayer` (`/components/<Name>`) | `@once-ui-system/core/media`, beside `MediaUpload` |
| The sixteen effects: `BlobFx`, `CelebrationFx`, `CountdownFx`, `CountFx`, `Effect`, `FlipFx`, `GlitchFx`, `HoloFx`, `LetterFx`, `MatrixFx`, `ParticleFx`, `RevealFx`, `ShineFx`, `TiltFx`, `TypeFx`, `WeatherFx`, with their props types | `@once-ui-system/fx` |
| `Banner`, `Book`, `LogoCloud`, `ScrollToTop`, `StylePanel` (with `useStylePanel` and the `StylePanel*` types), `StyleOverlay` | `@once-ui-system/blocks` |

The entry points are `.`, `/config`, `/server`, `/next`, `/data`, `/code`,
`/media`, `/emoji`, `/mdx`, the `css/*` and `ai/*` files, `AGENTS.md` and
`package.json`. The codemod's import pass moves every import, re-export and
`import()` (splitting a statement that mixes names, joining an import of the
subpath you already have), and reports what it cannot move: `Once.EmojiPicker`
or `Once.RevealFx` through a namespace import, `export * from "@once-ui-system/core"` (it no
longer carries the moved names), an internal module `/components/*` exposed
(`FormContext`, `StylePanelSections`…), and any other specifier 3.0 does not
have, such as a `vi.mock()` path. The pass only rewrites import sources, so it
is also safe on code already written for 3.0:

```sh
node scripts/codemod-3.0-imports.mjs src
```

A bundler resolves every specifier under `/media` it reaches, so an app that
imports the players, `Scrubber` or `CompareImage` from there needs
`compressorjs` resolvable for `MediaUpload`'s lazy chunk, as `/media` users
already did. If your bundler fails on a missing `compressorjs`, install it.

**Install the effects and the blocks.** `@once-ui-system/fx` and
`@once-ui-system/blocks` are packages of their own, versioned with core. Each
takes `@once-ui-system/core` (and React 19) as a peer and depends on nothing
core does not already bring (`clsx`), and core no longer carries their code, so
an app that renders no effect ships none of it. Add the ones your app imports
from, at core's version (3.0 ships on the `next` tag first):

```sh
npm install @once-ui-system/core@next @once-ui-system/fx@next @once-ui-system/blocks@next
# or
pnpm add @once-ui-system/core@next @once-ui-system/fx@next @once-ui-system/blocks@next
```

fx and blocks take `@once-ui-system/core` `^3.0.0-0` as a peer, which a 3.0
prerelease satisfies and a 2.x core does not: install core 3.0 with them, or
npm stops with a peer conflict (`ERESOLVE`).

```diff
- import { Column, RevealFx, StylePanel } from "@once-ui-system/core";
+ import { Column } from "@once-ui-system/core";
+ import { RevealFx } from "@once-ui-system/fx";
+ import { StylePanel } from "@once-ui-system/blocks";
```

The import pass moves these imports like the others and, at the end of its
run, names the packages the code now imports from so you know what to add.
Nothing else changes: the components, their props and their CSS are the same,
and core keeps no alias or re-export of them. A namespace import used as the
list of every component (an MDX scope, a playground:
`Object.entries(core)`, `{ ...core }`) no longer holds the effects or the
blocks; spread all three, `{ ...core, ...fx, ...blocks }` with `import * as fx
from "@once-ui-system/fx"` and `import * as blocks from
"@once-ui-system/blocks"` (and `...media`, `...emoji` from
`@once-ui-system/core/media` and `/emoji` for the media players and
EmojiPicker). Where the namespace is only spread, the codemod writes that
spread and the four imports; it reports one read any other way
(`Object.entries(core)`, `for … in`), since nothing fails until a tag is
missing at run time. In Next.js, list the packages in
`transpilePackages` beside `@once-ui-system/core` if you list core there.
CodeBlock's `styleButton` rendered a `StyleOverlay`, which core can no longer
import: CodeBlock takes an `actions` slot instead, so pass
`actions={<StyleOverlay><IconButton icon="sparkle" aria-label="Style" /></StyleOverlay>}`
(the codemod reports each `styleButton`).

**Real ESM.** The package is `"type": "module"`, and its JS names every file
it imports (`./Button.js`), so Node and every bundler resolve it the same way.
There is no `main` and no `require` condition: those pointed at ESM files and
`require()` of them threw. Each entry is `{ types, default }`. In practice:

- TypeScript: `moduleResolution` must be `bundler`, `node16` or `nodenext`
  (`node10`/`node` sees no `exports` and finds nothing). Next.js and Vite
  templates already use `bundler`.
- CommonJS: in Node 22.12+ (or 20.19+), `require()` loads the entries that
  import no CSS (`/config`, `/server`, `/next`); the component entries need a
  bundler there as they did in 2.x. Jest without ESM support needs the package
  transformed (`transformIgnorePatterns`).
- Plain Node, a test runner without a bundler, or SSR code outside one: the
  JS loads, but the components still `import "./X.module.css"`, which needs a
  CSS loader (Vitest, Next.js and Vite provide one). `/config`, `/server` and
  `/next` import no CSS and load in plain Node.
- The bins are `once-ui-init-agent` and `once-ui-validate-ai-code` as before;
  the files behind them are `scripts/*.cjs`. Call them by bin name, or update a
  path that named `scripts/validate-ai-code.js`.

**No Sass.** `sass` is no longer a peer, and the `.module.scss` sources and
`dist/styles/breakpoints.scss` are no longer in the package: the compiled
`.module.css` beside each component is what it always imported. Remove `sass`
from your dependencies unless your own code uses it. An `@use` of a core file
under `dist/` breaks; take the breakpoints from
`@once-ui-system/foundations` (`scss/styles/breakpoints.scss`).

**Smaller install.** The tarball no longer carries a second copy of `ai/`,
`agent/` and the CLI scripts under `dist/`, the test helpers (`dist/test`),
source maps that pointed at the unshipped `src/`, or the harness's generator
input (`ai/catalog.seed.json`, `ai/eval-tasks.md`). Nothing that was reachable
through `exports` or `bin` moved.

### 13. Leaf components take a small prop set

Only the layout components (`Flex`, `Row`, `Column`, `Grid` and the components
built on them, such as `Card`) take the layout props. A **leaf** takes its own
props, the element's attributes, and `LeafProps`:

| `LeafProps` | |
| --- | --- |
| `margin`, `marginTop`, `marginRight`, `marginBottom`, `marginLeft`, `marginX`, `marginY` | spacing token or number, as on `Flex` |
| `flex`, `fillWidth` | how it sits in its row or column |
| `position`, `top`, `right`, `bottom`, `left` | to pin it (an `Avatar` on a corner, a `Button` on a card) |
| `className`, `style` | |

The leaves are `Button`, `IconButton`, `ToggleButton`, `Input`, `Textarea`,
`NumberInput`, `ColorInput`, `DateInput`, `TagInput`, `OTPInput`, `Select`,
`Slider`, `Switch`, `Checkbox`, `RadioButton`, `Text`, `Heading`, `Icon`,
`Avatar`, `Spinner`, `StatusIndicator`, `Kbd`, `InlineCode`, `ProgressBar`,
`Logo`, `SmartLink` and `NavIcon`. Anything else on one is a type error. Put
it on a `Row` around the leaf (a `Column` around `Text` or `Heading`, so the
text keeps its own line):

```tsx
// 2.x
<Button s={{ hide: true }}>Sign up</Button>
<Text paddingX="8" hide>Beta</Text>
<Icon name="check" padding="4" radius="full" background="brand-weak" />

// 3.0
<Row s={{ hide: true }}><Button>Sign up</Button></Row>
<Column paddingX="8" hide><Text>Beta</Text></Column>
<Row fit padding="4" radius="full" background="brand-weak"><Icon name="check" /></Row>
```

What each leaf lost:

| Leaf | Lost | Instead |
| --- | --- | --- |
| `Icon`, `Avatar`, `Spinner`, `StatusIndicator`, `Kbd`, `InlineCode`, `ProgressBar`, `NavIcon` (were `Flex`) | every other layout prop: padding, `gap`, sizes (`width`, `minHeight`, `fit`, `fill`…), `background`, `solid`, `border*`, `radius*`, `shadow`, the theme props, alignment (`center`, `horizontal`, `vertical`, `direction`, `wrap`), `overflow`, `zIndex`, `opacity`, `cursor`, `hide`, `showIn`, `translateX`/`Y`, `textVariant`, `onBackground`, `onSolid`, and the `xl`…`xs` objects | a `Row` around it; for a look of its own (a `Kbd`'s colours), `style` with the token variables |
| `Slider` (its root was a `Flex`) | the same | a `Row` or `Column` around it |
| `Text`, `Heading` | padding, `gap`, `translateX`/`Y`, `overflow*`, `scrollbar`, `zIndex`, `pointerEvents`, `userSelect`, `transition`, `inline`, `hide`, `showIn` | a `Column` around it; they keep their typography props and `opacity` |
| `Button`, `IconButton`, `ToggleButton`, the fields, `Switch`, `Checkbox`, `RadioButton`, `Logo`, `SmartLink` | nothing: they took no layout props, and gain `LeafProps` | |

`TextBreakpointProps`, `ButtonBreakpointProps` and `InputBreakpointProps` are
gone: no component used them. `LeafProps` and `LeafPropsOf<"div">` are
exported for your own leaf components.

`position` on a leaf is written inline, so it beats a component's own
stylesheet (`Button` is `position: relative`). `SmartLink`'s own side margin
applies only when you set no horizontal margin.

**Codemod.** It wraps the leaf where the wrapper renders exactly the same: a
`hide` or a `{{ hide }}` breakpoint on any leaf, padding on `Text` and
`Heading` (the wrapper takes the leaf's margins and `flex`, and keeps its
`fillWidth`), an `Icon`'s box (`padding`, `background`, `solid`, `border*`,
`radius*`) on a `<Row fit>` (`<Row as="span" inline fit>` outside a layout
parent, which is what 2.x's Icon root was), and a `Spinner`'s layout props on
the `<Row center>` its 2.x root was, wherever it sits. A layout parent is a
`Flex`, `Row`, `Column`, `Grid`, `Card`, `Mask` or `Fade` in the same file.
Padding on a `Text` or `Heading` in running text (or beside a `className`,
`style` or handler that a wrapper would separate from it), and on `ListItem`,
`CountFx`, `ShineFx` and `TypeFx`, becomes the inline style 2.x's class was:
`paddingX="4"` → `style={{ paddingLeft: "var(--static-space-4)", paddingRight:
"var(--static-space-4)" }}`. A literal `zIndex` or `opacity` on a leaf becomes
its class (`className="z-index-1"`, `"opacity-60"`), an `InlineCode`
`textVariant` the font classes, and a `Kbd`'s `fit` (already its look) goes.
It adds `Row` or `Column` to your Once UI import, and renames
`Button`/`IconButton` `radius="none"` to `corners="none"`. A type that
picked moved props from the leaf names the Row's
(`Pick<ComponentProps<typeof Icon>, "onBackground" | "background">` →
`Pick<ComponentProps<typeof Icon>, "onBackground"> & Pick<ComponentProps<typeof Row>, "background">`).
A `height` on `Input`, `NumberInput`, `ColorInput` or `Textarea` (2.0 renamed
it `size`) went on to the native element, where it did nothing: the codemod
drops it. A leaf that is a JSX prop's value with only `hide` and `{{ hide }}`
breakpoints (`trigger={<NavIcon hide m={{ hide: false }} />}`), or that sits
in a fragment whose own parent is a layout component or such a slot, is
wrapped whatever its parent; elsewhere the report carries the wrapper to
paste (`<Row hide m={{ hide: false }}><NavIcon …/></Row>`).
A `Kbd`'s `paddingX="4"` / `paddingY="2"` are its own padding and go; and an absolutely placed leaf with a translate moves
its placement (and its `key`) to the Row, which shrink-wraps it. It reports the rest,
with the props to move: a parent it cannot see in the same file (the wrapper
could change its layout), a spread, offsets, styling on a `Button` (a
wrapper's padding is not the button's), sizes on a `ProgressBar` (pointing at
the parent when it holds only the leaf), and a look of its own on a `Kbd`
(`paddingX`), which goes in `style`. A `Kbd` padding that is no spacing token
(`paddingX="1rem"`) wrote a class that does not exist in 2.x, so that side
had no padding at all: the report gives both styles, the 2.x look
(`paddingLeft: 0`) and the size it names. An `Avatar`'s
`borderWidth`/`borderStyle` literals become the classes 2.x wrote
(`className="border-2 border-dashed"`), and `border`/`radius` the `style` they
resolved to (`borderColor: "var(--brand-alpha-medium)"`, `borderRadius:
"var(--radius-m)"`), since 3.0's Avatar sets its own. `node scripts/codemod-3.0-leaf.mjs <dir>` runs this
step on its own. The AI validator reports the same props (`layout.leafProps`)
and names the wrapper.

---

## 1.8.x → 2.0

Eight steps. Most apps finish in the first two, and the codemod does the bulk
of the work in step 1.

### 0. Before you start

Commit or stash. The codemod rewrites files in place, and reading its diff is
how you check it did the right thing.

```bash
npm install @once-ui-system/core@2
```

Nothing will build yet — that is expected, and `tsc` is the checklist for the
rest of this page.

### 1. Run the codemod

It is a single file with no dependencies, and it is not shipped in the package
(it is a one-time tool, not something to carry in `node_modules`):

```bash
curl -O https://raw.githubusercontent.com/once-ui-system/core/main/scripts/codemod-2.0.mjs
node codemod-2.0.mjs src --dry   # read the report first
node codemod-2.0.mjs src
```

It walks `.tsx`, `.jsx` and `.mdx`. **It does not read `.ts`** — an import or a
`ComponentProps<typeof Input>` in a plain `.ts` file is left for `tsc` to find,
which it will.

Every rename it applies is component-scoped: it fires inside a JSX element whose
tag matches, never on a bare attribute name, because several of the old names
(`height`, `radius`, `label`, `icon`, `fill`) are legitimate props on *other*
components and have to survive untouched. It follows import aliases, so
`import { Input as Field }` is migrated too.

Running it twice is a no-op. Running it over code already written against 2.0 is
not — `Skeleton`'s width default cannot tell a line that never named a width in
1.8.x from one deliberately left unset in 2.0 — so run it once, on a 1.8.x tree.

It also moves the relocated imports for step 2, and prints a line per file for
everything it changed.

### 2. Install the peers for charts, `CodeBlock` and `MediaUpload`

These three modules left the root barrel for their own subpaths, which is what
finally makes their dependencies optional:

```diff
- import { LineChart, CodeBlock, MediaUpload } from "@once-ui-system/core";
+ import { LineChart } from "@once-ui-system/core/data";
+ import { CodeBlock } from "@once-ui-system/core/code";
+ import { MediaUpload } from "@once-ui-system/core/media";
```

The codemod moves the imports. Installing what they need is yours, and only for
the subpaths you actually import:

| Subpath | Install |
| --- | --- |
| `@once-ui-system/core/data` | `recharts@^3.10.1` |
| `@once-ui-system/core/code` | `prismjs@^1.30.0` |
| `@once-ui-system/core/media` | `compressorjs@^1.3.0` |

An app that imports none of them installs none of them, and is 13.5M lighter for
it. In 1.8.x all three were resolved into every consumer's module graph whether
or not a chart was ever rendered, so an app with no charts could not build
without recharts installed.

### 3. Fix what the codemod reported but could not rewrite

It prints these as `! … — value changed, fix by hand`. There are four kinds.

**`ColorInput`'s `onChange` hands back the value**, `(value: string) => void`,
like every other `onChange` in the library, instead of a hand-built
`ChangeEvent`:

```diff
- <ColorInput onChange={(e) => setColor(e.target.value)} />
+ <ColorInput onChange={(value) => setColor(value)} />
```

It warns on every call site rather than guessing, because a handler passed by
name cannot be read from the JSX. Under `strictFunctionTypes` a missed one is a
type error, not a silent breakage.

**`RevealFx.delay` and `ShineFx.speed` are milliseconds**, where they were the
library's only two seconds-valued props:

```diff
- <RevealFx delay={0.2} />        <ShineFx speed={0.75} />
+ <RevealFx delay={200} />        <ShineFx speed={750} />
```

A bare literal under 50 is reported as probably-seconds; an expression like
`delay={index * 0.1}` is always reported, because the caller owns the multiplier
and guessing would silently change the timing.

**`Skeleton`'s values are migrated where they can be read.** Its old props meant
different things depending on `shape`, so the codemod rewrites literal cases and
reports computed ones:

```diff
- <Skeleton shape="line" height="s" width="l" delay="3" />
+ <Skeleton shape="line" size="s" width="75%" delay={300} />
```

`width` is now a Flex width like on any other element, `size` is the height of a
`line` or the diameter of a `circle`, and `delay` is milliseconds. A `shape` the
codemod cannot resolve to a literal is reported rather than rewritten.

**`Textarea` heights need a decision.** `lines` defaulted to `3` and now defaults
to `"auto"`, so every textarea that never named one changes from a fixed
three-row box to one that grows with its content. Nothing errors; it just looks
different. Add `lines={3}` where the fixed box was wanted:

```diff
- <Textarea id="notes" label="Notes" />
+ <Textarea id="notes" label="Notes" lines={3} />
```

The codemod cannot make this call for you — a textarea with no `lines` is
indistinguishable from one that wanted the default — so grep for `<Textarea`
and decide per field. It does strip an explicit `lines="auto"`, which is now
redundant. Note that `resize` only applies alongside a numeric `lines`.

**Property accesses are not JSX.** `props.isChecked` on a
`ComponentProps<typeof Checkbox>` is invisible to a regex and is surfaced by
`tsc`. Run `tsc --noEmit` before you call step 3 done.

### 4. Next.js apps: one import

`ElementType` (which backs `SmartLink` and any `Button` / `Card` /
`ToggleButton` with `href`), `Media`, `Logo`, `MegaMenu` and `Kbar` render
through an adapter layer now, whose defaults are plain DOM — `<a>`, `<img>`,
`window.location.assign`. That is what lets core run outside Next at all. Keeping
1.8.x behavior is the import path for `LayoutProvider`:

```diff
- import { LayoutProvider } from "@once-ui-system/core";
+ import { LayoutProvider } from "@once-ui-system/core/next";
```

Same component, same props, with the Next adapters already installed — no
provider is added to your tree. Apps that compose `AdapterProvider` themselves
can keep using `NextAdapterProvider` directly.

Skip this and nothing errors: internal links full-page reload and images skip
`next/image` optimization. It is the one step whose absence is silent, which is
why it is worth doing first if your app is a Next app.

### 5. Icon names are typed

`IconName` was `Record<string, IconType>`-derived, so it collapsed to `string`:
every name compiled, typos included, and a wrong one rendered a blank space with
a console warning. It is a real union now, so `tsc` will point at every icon name
that was never registered.

Expect it to find bugs you already had rather than work you have to do. If the
errors are all real, fix the names. Register app icons by augmenting the
interface, and the names come with them:

```ts
declare module "@once-ui-system/core" {
  interface IconLibraryOverrides {
    rocket: true;
  }
}
```

The registry itself is structural now rather than typed against react-icons, so
lucide, heroicons, react-icons or a hand-written component all satisfy it — core
renders the component with no props and only ever needed "something that returns
an SVG".

### 6. Check your browser floor

Scheme tokens are `oklch()`. Every value round-trips to the hex it replaced, so
nothing renders differently where the function is supported — but an older
browser drops the declaration rather than approximating it, and there is no
fallback. The floor is **Chrome 111, Safari 15.4, Firefox 113** (2022–23).

If you support anything older, 2.0 is not for that app yet. Say so in an issue;
a fallback layer is possible, it just has no demand behind it.

### 7. Breakpoints are fixed

`LayoutProvider` no longer takes a `breakpoints` prop.

```diff
- <LayoutProvider breakpoints={{ xs: 420, s: 560, m: 960, l: 1280, xl: 1600 }}>
+ <LayoutProvider>
```

The five steps are now the only ones: **xs 480, s 768, m 1024, l 1440**, and
`xl` above all of them — `xl` was always `Infinity`, the base state rather than
a media query, which is why no `.xl-` class has ever existed.

This is what lets a responsive `Flex` be a server component. The utility
classes carry those widths inside their `@media` queries, and a prebuilt
stylesheet cannot honour a width the app picks at runtime, because `@media`
does not read custom properties. Supporting both meant two code paths — CSS
classes when your breakpoints matched the defaults, a 450-line runtime hook
that mutated `element.style` when they did not — and the runtime path could
only run after hydration, so a page laid out at desktop widths and then
corrected itself. Fixing the widths removes the second path entirely.

If you were passing custom breakpoints, the nearest equivalent is a media
query of your own in a CSS module. If the defaults genuinely do not fit your
app, open an issue: making them configurable again means generating the CSS in
your build rather than ours, which is a real feature and worth doing for a real
need.

### 8. `ScrollContainer` is a track now

Only for apps that use it. In 1.8 it was a scroll box; in 2.0 the track is laid
out once and moved with a transform, so tiles can peek past the edge, `infinite`
can wrap, and dragging is built in. Three things change for an existing
carousel, and none of them is a type error:

- **Tiles no longer come shaped.** They used to arrive as tall bordered
  portrait cards. Now a tile only refuses to shrink and keeps a `minWidth`
  floor. Props you pass to `ScrollContainer` beyond its own land on every tile,
  so the 1.8 look is these, passed back in:

  ```diff
  - <ScrollContainer items={items} />
  + <ScrollContainer
  +   items={items}
  +   aspectRatio="3/4"
  +   border
  +   radius="xl"
  +   overflow="hidden"
  +   minWidth={28}
  +   maxWidth={48}
  + />
  ```

- **Tiles paint past its edge.** That paint counts toward the page's width, so
  a carousel near the side of the viewport can make a phone scroll sideways.
  Pass `clip` to keep everything inside the component's box, as in 1.8, or clip
  horizontally on an ancestor that spans the viewport.

- **A trackpad's sideways swipe no longer moves it**, because the browser is
  not scrolling anything. Drag (on by default, `draggable={false}` to turn it
  off) and the controls, which are never hidden now, replace it.

### What did not change

Worth knowing so you do not go looking:

- **No component was removed.** Every rename in 2.0 is a prop, with one
  exception that needs no migration: `Particle` is now `ParticleFx`, named like
  the other effects, and `Particle` stays exported as a deprecated alias of it
  until 3.0. Existing imports keep working; switch when convenient. The only
  three that moved are the subpaths in step 2, and they moved rather than went
  away.
- **Stylesheet imports.** `@once-ui-system/core/css/styles.css` and
  `/css/tokens.css` still work, and the CSS behind them is byte-identical. The
  codemod can point them at `@once-ui-system/foundations` with `--css`, but that
  package is not published yet — leave the flag off until it is.
- **`radius="none"`.** Only corner *selection* moved to `corners`; `radius` still
  means roundness, and `none` is a roundness.
- **The four unitless `speed` props** on `CelebrationFx`, `WeatherFx`, `MatrixFx`
  and `ParticleFx`. They are multipliers, not durations, and are unchanged.
- **Peer floors.** React, Next and sharp ranges are what they were.

### Reference: every prop rename

Booleans that toggle visibility read `showX`, leaving the plain name for the
thing itself:

| Component | 1.8.x | 2.0 |
| --- | --- | --- |
| `ProgressBar` | `label` | `showLabel` |
| `Feedback`, `Toast` | `icon` | `showIcon` |
| `DataTooltip` | `colors` | `showSwatches` |

State props drop the `is` / `has` prefix:

| Component | 1.8.x | 2.0 |
| --- | --- | --- |
| `Dialog`, `Modal`, `DatePicker`, `DropdownWrapper`, `EmojiPickerDropdown`, `KbarContent` | `isOpen` | `open` |
| `Checkbox`, `RadioButton`, `Switch` | `isChecked` | `checked` |
| `Checkbox` | `isIndeterminate` | `indeterminate` |
| `DatePicker`, `DropdownWrapper` | `isNested` | `nested` |
| `NavIcon` | `isActive` | `active` |
| `Input`, `Textarea`, `Option` | `hasPrefix` / `hasSuffix` | `prefix` / `suffix` |

Four of those names were held by React's own DOM attribute types, which is why
the prefixes existed. Those components `Omit` the inherited declaration now, so
the native attribute can no longer be forwarded: `<Input size>` is the token
scale, not the HTML character-width attribute.

One name, one meaning:

| Component | 1.8.x | 2.0 |
| --- | --- | --- |
| `Button`, `IconButton`, `Input`, `Textarea`, `ToggleButton` | `radius="top-left"` | `corners="top-left"` |
| `Pulse`, `Tag` | `variant` | `scheme` |
| `Media`, `Carousel`, `Swiper` | `fill` | `stretch` |
| `Input`, `Textarea` | `height` | `size` |
| `SegmentedControl` | `selected` / `onToggle` / `defaultSelected` | `value` / `onChange` / `defaultValue` |
| `RevealFx` | `trigger` | `revealed` |

`fill` on those three shadowed the layout prop of the same name every
Flex-derived component has, so `<Media fill />` did not fill anything — it
dropped the intrinsic aspect ratio and handed sizing to the parent. That is
`stretch` now.

Components deriving their props from `Input` (`Select`, `NumberInput`,
`TagInput`, `ColorInput`, `DateInput`, `DateRangeInput`, `PasswordInput`) and
from `DropdownWrapper` (`EmojiPickerDropdown`) inherit these renames. The codemod
knows their tags.
