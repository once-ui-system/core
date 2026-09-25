# Migrating Once UI Core

One section per major. Each is written to be worked top to bottom: the steps are
in the order that keeps the app buildable between them, and everything not
listed is unchanged.

The changelog is the record of *what* changed and why
([CHANGELOG.md](CHANGELOG.md)); this file is the list of what you have to *do*.

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
