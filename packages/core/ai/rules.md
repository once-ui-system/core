# Once UI — code generation rules

Rules for writing Once UI code. Follow every rule; each shows the correct form first.

## Before you build

When the request doesn't specify design intent, ask these five questions first (one short message, all at once), then build:

1. **Content style** — bold / restrained / conservative?
2. **Layout** — wide or narrow, centered or left-aligned?
3. **Color** — single accent, bold colors, visually distinct sections?
4. **Decoration** — gradients, MatrixFx, animated blobs, none?
5. **Imagery** — placeholder images, or avatars/logos/icons only?

If you can't ask (or the user says "you decide"), default to: restrained, centered with `maxWidth="m"` content, single brand accent, one subtle gradient (recipes.md #1), no placeholder images (use `Avatar`, `Logo`, `Icon`).

## Layout primitives

1. Use `Row` and `Column` for layout. `Flex` with `direction` is only for dynamic direction. A `Flex` with no direction at all is a `Row` (`Flex` defaults to row).

```tsx
// Good
<Column gap="16">...</Column>
// Bad
<Flex direction="column" gap="16">...</Flex>
```

2. Use shorthands — they replace multi-prop combinations:

| Write | Instead of |
|-------|------------|
| `fill` | `fillWidth fillHeight` |
| `fit` | `fitWidth fitHeight` |
| `center` | `horizontal="center" vertical="center"` |

```tsx
// Good
<Row fill center>...</Row>
// Bad
<Row fillWidth fillHeight horizontal="center" vertical="center">...</Row>
```

3. Never write a prop that equals its default, or one that another prop on the same element already implies. The spec marks defaults with `= value`. Common offenders:
   - `position="relative"` (default on all layout components)
   - `direction="row"` on `Row`, `direction="column"` on `Column`
   - `variant="primary"`, `size="m"` on `Button`
   - `fillWidth` beside `maxWidth` — `maxWidth` already fills the width up to the cap
   - `minWidth={0}` beside `fillWidth` — `fillWidth` already sets `min-width: 0`
   - a colour on `border` (or `borderTop`, `borderBottom`, `borderX`, …) that only restates the default — bare `border` draws the default border, `--default-border` (`neutral-alpha-weak` unless the app sets it in its custom CSS); name a colour only to deviate from it

```tsx
// Good
<Column maxWidth="l" border radius="l">
// Bad
<Column fillWidth maxWidth="l" minWidth={0} position="relative" border="neutral-alpha-weak" radius="l">
```

3b. `zIndex` belongs to a stacking group, not to a page. Use it only inside an isolated group that needs an order — a decorative absolute layer and the content sibling above it (rule 21), a sticky header over the pane it covers — and keep the values small within that group. A `zIndex` on a lone element, or a page-wide ladder of `zIndex={3}`, `{5}`, `{9}`, means the hierarchy is being managed by hand; restructure the tree instead.

## Spacing and sizing

4. Use spacing tokens, never raw CSS: `gap`, `padding`, `margin`, `paddingX/Y`, `marginX/Y` accept the full `SpacingToken` scale (`"0" "1" "2" "4" "8" "12" "16" "20" "24" "32" "40" "48" "56" "64" "80" "104" "128" "160"`, or `"xs" "s" "m" "l" "xl"`). The top of the scale is what rule 17 calls for between sections — it is not an extension, it is part of the same list.

```tsx
// Good
<Column gap="8" padding="24">
// Bad
<div style={{ gap: 8, padding: 24 }}>
```

5. `width`/`height`/`maxWidth`/`minHeight` (and every spacing and offset prop) accept a number in **px** (`width={320}`), a spacing token string (`"16"`), or a CSS length string (`"40rem"`, `"50%"`, `"100dvh"`, `calc(…)`). Prefer tokens; write rem as a string when a size should follow the root font size. `maxWidth={40}` is 40 px, not 40rem (2.x).

6. Only use `style={{}}` for things no token prop covers (e.g. `isolation`, custom filters). If a prop exists, the prop wins.

## Color and surfaces

7. Colors are semantic tokens, never hex/rgb: `{tone}-{weight}` or `{tone}-alpha-{weight}` where tone = `neutral | brand | accent | info | danger | warning | success` and weight = `weak | medium | strong`. A component's palette is its `tone` prop (Button, IconButton, Tag, Feedback, Toast, `addToast`, `StatusIndicator pulse`, gauges, Timeline items); `scheme` is a palette hue (`blue`, `green`…) on the plain StatusIndicator dot and Avatar's `statusIndicator`.
   - `background` also accepts `surface | overlay | page | transparent`
   - `onBackground` colors text/icons on a background
   - Inline SVG paint too: `fill="currentColor"` (colour the wrapper with `onBackground`) or a token, `stroke="var(--brand-solid-strong)"` — never `fill="#15D9EF"`

8. Standard surface recipe: `background="surface"` (or `"overlay"` over imagery) + `border` + `radius="l"`. Bare `border` is the default border; name a colour (`border="neutral-alpha-medium"`, `border="brand-alpha-medium"`) only when the surface should differ from it.

```tsx
<Column background="surface" border radius="l" padding="24" gap="16">
```

## Text

9. Use `Text` and `Heading` with `textVariant="{type}-{weight}-{size}"` (the same prop as on Flex; `variant` was 2.x): type = `body | heading | display | label | code`, weight = `default | strong`, size = `xs | s | m | l | xl`. Examples: `body-default-m`, `heading-strong-s`, `label-default-s`, `display-strong-m`.

10. If a layout component only wraps text, put `textVariant` (and `onBackground`) directly on it instead of nesting a `Text`:

```tsx
// Good
<Row textVariant="label-default-s" onBackground="neutral-weak">Updated today</Row>
// Bad
<Row><Text textVariant="label-default-s" onBackground="neutral-weak">Updated today</Text></Row>
```

## Responsive

11. Use breakpoint props (`xl l m s xs`) with override objects — never media queries or conditional rendering for layout:

```tsx
<Row gap="24" s={{ direction: "column" }}>
<Grid columns="3" s={{ columns: 1 }}>
```

## Components over primitives

12. Reach for the purpose-built component before composing primitives:
    - `Card` is for **interactive** surfaces only (`href` or `onClick`). Static panels (pricing tiers, testimonials, stat boxes) = `Column`/`Row` with the surface recipe (#8), not `Card`
    - Image/video → `Media`, not `img`
    - Links → `SmartLink` / `Button href`, not `a`
    - Status dot → `StatusIndicator`; progress → `ProgressBar`; loading → `Spinner` / `Skeleton`
    - Labels/metadata → `Tag` (`variant="announce"` + `href` for the "New" pill above a hero; `selected` (+ `onClick`) or `onRemove` for a filter toggle), `Kbd`, `InlineCode`. Badge and Chip are Tag in 3.0
    - Tabs → `Tabs` > `TabList` > `Tab` with a `TabPanel` per value (`orientation="vertical"` for a settings nav). `SegmentedControl` picks a value; it is not a tab set
    - Mobile nav, filters, a side sheet → `Drawer` (`side`, `size`); it brings the focus trap, scroll lock and Escape a hand-made overlay misses
    - Where-am-I trail → `Breadcrumbs items={[{ label, href }, ...]}`; the last item is the current page
    - Keyboard shortcuts → `useHotkeys("mod+k", fn)` (it skips while the user types), shown with `Kbd keys="mod+k" label="Search"`
    - Text for screen readers only, skip links → `VisuallyHidden` (`focusable` for a skip link)
    - Markdown/MDX content → `mdxComponents` or `createMdxComponents({...})` from `/mdx` (rule 30), never a hand-written element map

13. Use the distinctive features when the design calls for them — they exist and are cheap:
    - `Dialog` supports `stack` (stacked dialogs) and `base` props, and `variant="sheet"` (a full-height sheet from the bottom, with a `backdrop` slot)
    - Effects: `RevealFx`, `LetterFx`, `TypeFx`, `CountFx`, `GlitchFx`, `HoloFx`, `TiltFx`, `FlipFx`, `MatrixFx`, `BlobFx`, `ParticleFx`, `ShineFx`, `CelebrationFx`
    - `HoverCard` (`placement="cursor"` follows the pointer, `"cover"` draws over the trigger), `Dropdown openOn="contextmenu"` (a right-click menu), `Tooltip content` with no children (an info icon), `EmojiPicker trigger`, `Scroller` (track mode with `infinite`/`markers`/`proximity`, or `auto` for a marquee), `Carousel mode="snap"`, `CompareImage`, `OgCard`, `Timeline`, `Grid masonry`, `InfiniteScroll`, `SegmentedControl`, `Kbar` (command palette)
    - Forms: `Input` (`type="password"` has a show/hide toggle), `OTPInput`, `NumberInput`, `TagInput`, `Select`, `DatePicker` (`range` for a date range), `DateInput` (`range`), `ColorInput`, `Slider` (`range` for a `[min, max]` pair), `Switch`, `Checkbox`, `Tag selected`

14. Buttons: `variant` is the appearance, `primary | secondary | tertiary | ghost | link | subtle` (`primary` is the default), and `tone` the palette, `brand | accent | neutral | info | success | warning | danger`: a destructive button is `<Button tone="danger">`; pair with `prefixIcon`/`suffixIcon` (icon names, not elements). `IconButton` for icon-only actions with `tooltip`.

14b. Icon names must come from `iconNames` in catalog.json (spec.json carries the same list). In 2.0 `IconName` is a real union, so an unregistered name is a type error rather than a blank space — do not guess a plausible one, and never reach for `as IconName` to silence the check. If no registered icon fits, omit the icon. The registry is 99 icons; brand marks (github, discord, google) are deliberately not among them, so an app registers its own.

14c. Components with a text prop render it — never pass the same text as both prop and children, it renders twice:

```tsx
// Good
<Tag size="s">{unread}</Tag>  or  <Tag size="s" label="Save 20%" />
// Bad: one of the two is dropped
<Tag label={`${unread} unread`}>{unread}</Tag>
<Tag label="Save 20%">Save 20%</Tag>
```

14d. `Fade` is an **edge overlay strip** (scroll-fade at the boundary of a scroll container), not a content wrapper. Wrapping a message list or section in `Fade` washes the whole content out:

```tsx
// Good: thin absolute strip over the scroll edge
<Column flex={1} overflowY="auto">...</Column>
<Fade position="absolute" top="0" left="0" fillWidth height="40" to="bottom" base="surface" pointerEvents="none" />
// Bad
<Fade to="top" fill><Column overflowY="auto">...</Column></Fade>
```

## Composition rhythm

15. Page skeleton: `Column as="main" fillWidth horizontal="center"` → content `Column maxWidth={...}` → sections. Gaps between siblings, padding inside surfaces; avoid margins for layout when a parent `gap` can do it.

    `maxWidth` conventions: primary page containers `"xl"`–`"m"` (marketing/landing toward `"xl"`/`"l"`, app and docs content `"m"`). `"s"` is only for narrow reading content (about, legal); `"xs"` for special surfaces (drawers, popovers).

16. One-off theme overrides on a subtree, not custom CSS. On `Flex`/`Row`/`Column`/`Grid`, and on every component built on them whose slice lists the typed props (`Background`, `Tag`, `RevealFx`, `BlobFx`, …), use the typed props: `theme="dark"`, `themeBorder="rounded"`, `themeSolid="contrast"`, `themeSurface="translucent"` (they write `data-theme`, `data-border`, `data-solid`, `data-surface`). Attributes without a prop stay raw: `data-brand="emerald"`, and `data-border="rounded"` on `Button` and `IconButton`, which have no typed prop. `theme="dark"` makes a subtree dark; the `dark` boolean only shows an element in a dark theme.

## Scale and hierarchy (marketing/landing pages)

17. Vertical rhythm is generous. Gap between page sections: `"80"`–`"160"` (typical `"104"`). Gap inside a section: `"24"`–`"40"`. Spacing tokens go up to `"160"` — use the top of the scale between sections, not `"48"`.

18. Heading scale: hero = `display-strong-l` (or `xl`), section headings = `display-strong-xs` or `display-strong-s` — never `heading-*` variants for section titles. Hero supporting text = `body-default-l`; section supporting text = `body-default-m`.

19. Type hierarchy must be monotonic: quotes, testimonials, and body content never render larger than the section heading above them. Testimonial quotes = `body-default-m` max, not `BlockQuote` default size.

20. Don't repeat the same centered heading + subtitle block for every section — it reads dated. Vary: left-aligned headers, heading-only sections, or an eyebrow label above the heading. Eyebrow = plain text, not a `Tag` with an icon:

```tsx
// Good eyebrow
<Text textVariant="label-default-s" onBackground="brand-medium">Pricing</Text>
// Bad eyebrow
<Tag tone="neutral" prefixIcon="sparkle">Pricing</Tag>
```

20b. **Proportion is a decision, not a leftover.** Two columns in a row finish at
roughly the same place, or one of them is wrong. A tall card beside a strip of
small controls leaves a column of dead space that reads as an unfinished page —
and the fix is almost never more whitespace tokens.

Give the thin side real content instead. Tiles grow to carry their own height,
with a placeholder, a preview, a swatch, a count — something true about the
thing they stand for. Then keep them quiet: low-contrast surfaces, small labels,
no competing headline. A grid of twenty loud tiles takes the section away from
the card it was meant to support.

```tsx
// Bad: a tall card and 20 chips, most of the row empty
<Row fillWidth gap="32">
  <Column flex={1} maxWidth="26rem"><FeatureCard /></Column>
  <Column flex={1}><Row wrap gap="4">{items.map(i => <Button key={i} size="s">{i}</Button>)}</Row></Column>
</Row>

// Good: both sides carry weight, the card still leads
<Row fillWidth gap="32">
  <Column flex={2}><FeatureCard /></Column>
  <Column flex={3}>
    <Grid columns={5} s={{ columns: 3 }} gap="8" fillWidth>
      {items.map(i => (
        <Column key={i} aspectRatio="1 / 1" padding="12" radius="l"
                background="page" border vertical="between">
          {/* a preview of the thing, not just its name */}
        </Column>
      ))}
    </Grid>
  </Column>
</Row>
```

Check it by squinting at the two columns' bottom edges. If one ends halfway up
the other, change the flex ratio, the tile size, or what the tiles contain —
in that order.

## Decorative layers

21. Every absolute decorative layer uses the full recipe — `top="0" left="0"` are required or the layer gets offset by parent padding:

```tsx
<Background position="absolute" top="0" left="0" fill pointerEvents="none" ... />
```

Siblings holding content get `zIndex={1}`. That layer and its content sibling are the whole stacking group — nothing else in the section needs a `zIndex` (rule 3b). `overflow="hidden"` goes on the parent **only when it has a radius** (cards, panels) — clipping a full-bleed section turns the glow into a hard-edged band.

21b. Ambient section layers (hero glows) live on the **full-width section wrapper**, outside the `maxWidth` content column, with generous room (`paddingY="80"`+). Inside a narrow container the gradient gets clipped at the container edge and reads as a misplaced card:

```tsx
// Good: full-bleed section, narrow content inside
<Column fillWidth horizontal="center" paddingY="80">
  <Background position="absolute" top="0" left="0" fill pointerEvents="none" gradient={{...}} />
  <Column zIndex={1} maxWidth="48rem">...</Column>
</Column>
```

22. `Background` gradient units: `x`/`y` place the centre as a percentage string of the container (`"50%"`/`"50%"` = center) or px as a number. `width`/`height` are the ellipse's radii, as a percentage string of the container (`"100%"`, the default) or px. A soft corner glow is `width: "100%"`–`"200%"`; `"500%"` overshoots the container. `Mask` is the same: `x`/`y` percentage strings, `radius` a CSS length (`"50vh"`, the default) or px.

23. Color visibility: `*-background-weak` is nearly the page color — it is invisible as an accent. For tints and glows use alpha tokens (`brand-alpha-medium`, `brand-alpha-strong`) or solid tokens (`brand-solid-strong`) and do not stack a low `opacity` on top of an already-weak color.

## Effect units

24. Time is **milliseconds** everywhere: every `duration`, `delay`, `hold` and interval. Stagger with `delay={index * 100}`, never `index * 0.1` (that was 1.8.x, and 2.0 reads it as a tenth of a millisecond, i.e. no stagger at all). That covers `RevealFx` `duration` and `delay`, `ShineFx` and `CountFx` `duration`, `TypeFx` `charDuration`, `delay` and `hold`, `CelebrationFx` and `WeatherFx` `duration` (`5000`, not `5`), `MatrixFx` `bulge.duration`, `FlipFx` `autoFlipInterval`, `Animation`/`HoverCard` `delay` and `duration`, `HoverCard placement="cover"` `hideDelay`, `Skeleton` `delay`. `speed` is only ever a **multiplier** — `1` is the default, `2` twice as fast, `0.5` half — or `"slow"`/`"medium"`/`"fast"` (0.5/1/2), on `MatrixFx`, `WeatherFx`, `ParticleFx`, `CelebrationFx`, `Effect`, `Scroller` `auto.speed`, `GlitchFx` and `LetterFx`. `translateY` as a number is in **px** — use a token like `"16"` (1rem) or `translateY={16}`.

25. `LogoCloud` extends `Grid` — always set `columns` (and responsive overrides), or logos stack in one column: `columns="4" m={{ columns: 3 }} s={{ columns: 2 }}`.
   A logo that changes with the theme is one `Logo` with a source per theme — `<Logo wordmark={{ light: "/logo-light.svg", dark: "/logo-dark.svg" }} />`, and `icon` takes the same pair — not a `<Logo showIn="dark">` beside a `<Logo showIn="light">`. Keep `showIn` for a logo that should only appear in one theme.

26. Use decoration recipes from `recipes.md` verbatim, then adjust. Application shells — a dashboard with a sidebar, a data-driven nav, a two-pane editor — come from `layouts.md` the same way. Budget: at most one ambient background layer per section, ambient motion in at most the hero and final CTA, one accent color family per page.

## Motion

27. Animations are **eye-leading, not eye-grabbing**: they direct attention to the one thing that should be read next, they don't announce themselves. Small distances (`translateY="8"`–`"16"`, i.e. 0.5–1rem, or 8–16 as px numbers), short staggers (`delay={index * 100}` max), and only on elements worth leading the eye to — the hero heading, stat numbers, the highlighted card in a set.

28. Do **not** wrap every section in `RevealFx` — uniform entrance animation on everything reads dated and makes scrolling feel slow. Entry-animation budget per page: the hero, plus at most one or two key moments (stats, a card set). Everything else just renders.

28b. Animate **coherent blocks, all-or-none**. Within a sibling set (cards, list items), either every sibling animates with a stagger or none do — never a single item out of the set (e.g. only the highlighted pricing card). For a hero, reveal it as 1–3 stacked chunks with increasing delay (`0 / 100 / 200`), not individual text fragments. One entrance moment per viewport: if the hero animates, the cards below it don't.

29. Trigger below-the-fold animations with `useInViewport`, latched so they play once. `RevealFx` takes `revealed`; `CountFx` has no trigger prop — drive its `value` instead:

```tsx
const ref = useRef<HTMLDivElement>(null);
const inViewport = useInViewport(ref);
const [seen, setSeen] = useState(false);
useEffect(() => {
  if (inViewport) setSeen(true); // latch: useInViewport flips back to false on scroll-out
}, [inViewport]);

<Column ref={ref} gap="16">
  <RevealFx revealed={seen} translateY="8">...</RevealFx>
  <CountFx value={seen ? 2400 : 0} duration={1500} separator="," variant="display-strong-m" />
</Column>
```

Without this, mount-timed animations play while still off-screen and the user scrolls into an already-finished state.

## Imports

30. Most things come from the package root, but these modules do not, because
their dependencies are optional peers (or, for `EmojiPicker`, a large dataset)
and a root re-export would drag them into every consumer's module graph:

| Import | From | Peer the app installs |
|--------|------|-----------------------|
| charts, gauges, chart chrome | `@once-ui-system/core/data` | `recharts` |
| `CodeBlock` | `@once-ui-system/core/code` | `prismjs` |
| `MediaUpload` | `@once-ui-system/core/media` | `compressorjs` |
| `MediaAudioPlayer`, `MediaVideoPlayer`, `Scrubber`, `CompareImage` | `@once-ui-system/core/media` | none |
| `EmojiPicker` | `@once-ui-system/core/emoji` | none |
| `mdxComponents`, `createMdxComponents`, the `Mdx*` elements | `@once-ui-system/core/mdx` | `prismjs` (for fenced code) |

Naming one of these from the root does not resolve, and there are no deep
imports (`@once-ui-system/core/components/…` is not an entry point).
Each component slice in `ai/components/`, each catalog entry, and each hook or
function in `spec.json`'s `functions` carries the specifier to import it from
when it is not the root; `ai/manifest.json`'s `imports` lists every entry
point with its exports.

```tsx
// MDX through Once UI: headings with anchors, SmartLink, Media, CodeBlock, Table
import { MDXRemote } from "next-mdx-remote/rsc";
import { createMdxComponents, MdxHeading } from "@once-ui-system/core/mdx";

const components = createMdxComponents({
  h2: (props) => <MdxHeading as="h2" marginTop="64" {...props} />, // typed against MDX's props
  Pricing, // an app component, used as <Pricing /> in the content
});
<MDXRemote source={source} components={components} />
```

30b. In a **Next.js** app, `LayoutProvider` comes from
`@once-ui-system/core/next`:

```tsx
import { LayoutProvider } from "@once-ui-system/core/next";
```

The root export resolves and renders, which is what makes it easy to miss: it
installs the plain DOM adapters, so `SmartLink`, `Button`/`Card`/`ToggleButton`
with an `href`, `Media`, `Logo`, `MegaMenu` and `Kbar` render a plain `<a>` and
`<img>` — no client-side navigation, no `next/image`, and no error. The
validator flags it (`LayoutProvider.next`) and `--fix` moves the import. An app
that composes `NextAdapterProvider` itself is already covered.

The same entry has the route handlers `OgCard` and `useOgData` call. Each
returns `{ GET }`, checks every address and redirect is public, and answers at
the paths the client defaults to:

```ts
// app/api/og/fetch/route.ts
import { createOgFetchRoute } from "@once-ui-system/core/next";
export const { GET } = createOgFetchRoute();

// app/api/og/proxy/route.ts
import { createOgProxyRoute } from "@once-ui-system/core/next";
export const { GET } = createOgProxyRoute();
```

Do not hand-write these routes with `handleOGFetch` and a `fetch` of your own.

30c. Type `once-ui.config` with `defineConfig` from
`@once-ui-system/core/config` (the dependency-free entry; the root exports it
too). It rejects a misspelt key or value in `style`, `dataStyle` and `fonts`
and keeps the literal types, so the sections spread into the providers with no
casts:

```tsx
// once-ui.config.ts
import { defineConfig } from "@once-ui-system/core/config";
export const { style, dataStyle } = defineConfig({ style: { brand: "cyan", theme: "system" }, dataStyle: { mode: "categorical" } });

// layout.tsx
<ThemeInit config={style} dataStyle={dataStyle} />
<ThemeProvider {...style}><DataThemeProvider {...dataStyle}>...</DataThemeProvider></ThemeProvider>
```

31. `IconName` is a real union, not `string`. An unregistered name is a type
error now, where it used to render a blank space with a console warning — so
take icon names from `catalog.json`'s `iconNames` rather than guessing a plausible
one. An app registers its own by augmenting `IconLibraryOverrides`.
