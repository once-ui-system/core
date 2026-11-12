# Map app

A map-first app: full-bleed Map with floating panels for the list and the selected item, markers that cluster, areas, filters, and every loading, empty and error state

This file is complete for this task: the rules (all of `rules.compact.md`), the props, mixins and types of every component below, every gotcha for these components, the quality bar and a gold example. Write the page from it; reading the rules, catalog, gotchas, manifest or examples again only adds cost. Open `components/<Name>.json` only for a component not listed here, and then every one you need in a single step.

## Rules

### Layout

| Write | Never write |
|-------|-------------|
| `<Column gap="16">` | `<Flex direction="column">` |
| `<Row gap="16">` | `<Flex direction="row">`, or `<Flex>` with no direction |
| `fill` | `fillWidth fillHeight` |
| `fit` | `fitWidth fitHeight` |
| `center` | `horizontal="center" vertical="center"` |
| `maxWidth="l"` | `fillWidth maxWidth="l"` |
| `fillWidth` | `fillWidth minWidth={0}` |
| `width={32} height={32}` (a number is the token: `32` = `"32"` = 2rem), `maxWidth="40rem"` | `maxWidth={40}` for 40rem (that was 2.x: `40` is now `"40"`, 2.5rem) |
| `border` | `border="neutral-alpha-weak"` |
| `<Logo wordmark={{ light, dark }} />` | a `<Logo showIn="dark">` and a `<Logo showIn="light">` |

- Units: a number is on the **token scale** on every size, spacing and offset prop: `16` = `"16"` = 1rem, scaled by `data-scaling`; a digit string is the spacing token (`"16"`); any CSS length string passes through (`"320px"` never scales, `"50%"`, `"100dvh"`). `Mask`/`Background` percentages are strings (`x="50%"`)
- Control size for a whole app: `density: "compact" | "normal" | "spacious"` in the config `style` (`data-density`), not `size="s"` on every Button; it also picks scaling 95/100/105 unless `scaling` is set. Give `size` only where one control differs
- `Flex` only when direction changes at breakpoints: `<Row s={{ direction: "column" }}>`
- Subtree theme: `theme`, `themeBorder`, `themeSolid`, `themeSurface` on Flex/Row/Column/Grid and components built on them (`Background`, `Tag`, effects) — not raw `data-theme`/`data-border`/`data-solid`. `Button`/`IconButton` have no typed prop: keep `data-border="rounded"`
- App theme in `once-ui.config` `style`: `defaultTheme: "light"` = starts light, visitor can switch (`theme: "light"` forces it and `setTheme` does nothing). Exact brand colour: `brand: "custom", brandSeed: "#hex"` (the hex is step 500, every brand solid in both themes); show it on the current page with `<Nav tone="brand">`. `brandScale` only for a full brand book, 100 darkest to 1200 lightest. Page/card colour: `pageBackground`/`surfaceBackground` (token or colour, or `{ light, dark }`), not overrides of semantic CSS variables
- Page skeleton: `Column as="main" fillWidth horizontal="center"` → content `Column maxWidth="l"` → sections
- Section gaps: `"104"` between sections, `"24"`–`"40"` inside.
- Responsive: breakpoint props `xl l m s xs` — never media queries for layout

### Surfaces

Static panel recipe (pricing tiers, stats, settings sections):

```tsx
<Column background="surface" border radius="l" padding="24" gap="16">
```

- Bare `border`/`borderTop` = the default border. Name a colour only to deviate: `border="brand-alpha-medium"`.
- `Card` = interactive only (`href` or `onClick`). Static panels = Column + surface recipe.
- Colors: `{tone}-{weight}` or `{tone}-alpha-{weight}`. Never hex/rgb — inline SVG `fill`/`stroke` included: `currentColor` or `var(--brand-solid-strong)`.
- `background` also: `surface | overlay | page | transparent`
- Same-shaped records: one surface, divided rows (`borderTop={i > 0}`), or a `Table`; never a card per row
- One raised `surface` for content on `page`; sections inside are spacing + `borderTop`, not grey cards
- Alerts: `Feedback`, never a hand-built `role="alert"` box
- Charts: `@once-ui-system/core/data` (`LineChart`, `BarChart`…), never hand-drawn SVG; `height="16rem"` (a string), series `color: "brand-strong"`
- Brand mark: `<Logo text="Name" monogram="N" />` (its initial, or an `icon`; beside a `Mascot`, only `text`; never a letter tile), never `Icon` + `Text`; a bare `monogram` is a placeholder shape
- Critical outranks status: `Feedback tone="danger"` or `Tag prefixIcon`; urgent is `danger`/`warning`, never `info`

### Typography

- Hero: `display-strong-l` or `display-strong-xl`
- Section titles: `display-strong-xs` or `display-strong-s` — not `heading-*`
- Eyebrow: `<Text textVariant="label-default-s" onBackground="brand-medium">`
- Text on layout: `textVariant` + `onBackground` on Row/Column instead of nesting Text
- App text a user must read (metadata, cells): `body-default-s` minimum, never `xs` `neutral-weak`

### Decoration

Absolute layers always: `position="absolute" top="0" left="0" fill pointerEvents="none"`, content `zIndex={1}`.

- `zIndex` only inside that layer group (or on a sticky header over its pane). Never on a lone element, never a page-wide ladder.

- Gradient `width`: quarter-percent (400 = 100%). Glows: 100–200.
- Glow colors: `brand-alpha-medium`, not `brand-background-weak`
- Ambient layers on full-bleed section wrapper, outside `maxWidth` column
- Budget: one ambient layer per section; motion in hero + one CTA max

### Motion

- Every `duration`, `delay` and interval is **milliseconds**: `delay={index * 100}` — `* 0.1` was 1.8.x; `CelebrationFx`/`WeatherFx` `duration={5000}`, not `{5}`. `RevealFx`/`ShineFx`/`CountFx` take `duration`, `TypeFx` `charDuration` (`speed` there was 2.x)
- `speed` is only a multiplier, `1` the default, or `"slow"`/`"medium"`/`"fast"` (0.5/1/2): `MatrixFx`, `WeatherFx`, `ParticleFx`, `CelebrationFx`, `Effect`, `Scroller` `auto.speed`, `GlitchFx`, `LetterFx`
- `RevealFx translateY`: a number is the token scale (`16` = 1rem); prefer `"8"`–`"16"` tokens
- Viewport-reveal with `useInViewport` + latch into `RevealFx revealed`; `CountFx` driven by `value`, no trigger prop
- Animate all siblings in a set or none — never one lone animated card

### Components

| Need | Use |
|------|-----|
| Image | `Media` |
| Link | `SmartLink` / `Button href` |
| Status dot | `StatusIndicator` |
| Loading | `Spinner` / `Skeleton` |
| Scroll fade | `Fade` as edge strip, not wrapper |
| Icons | `IconName` (the IconName type below) only |
| Logos grid | `LogoCloud` with `columns` set |
| Tabs | `Tabs` > `TabList` > `Tab`, `TabPanel` (`orientation="vertical"` for a settings nav) |
| Pick one of a few | A form value with a label (timezone, country, role on a form): `Select`. A toolbar view control or action (sort, filter, export): `Dropdown` with `Option`s and `trigger={<Button variant="secondary" suffixIcon="chevronDown">Role: Admin</Button>}`, the label naming the current choice (a long, searchable filter list: `Select size="xxs" searchable` with a `label`). Two to four choices always shown: `SegmentedControl` |
| Mobile nav, side sheet | `Drawer`, not a hand-made overlay |
| Page trail | `Breadcrumbs items={[...]}` |
| Keyboard shortcut | `useHotkeys("mod+k", fn)` + `Kbd keys="mod+k" label="Search"` |
| Screen-reader text, skip link | `VisuallyHidden` (skip link: `<VisuallyHidden as="a" href="#main" focusable>`) |
| Native attributes | Every component also takes its element's own: `aria-*`, `id`, `role`, `onClick`; `type` on `Button`; `value`, `onChange`, `type` on `Input` |
| MDX content | `mdxComponents` / `createMdxComponents` from `/mdx` |
| Multi-part component | List prop (`items`, `columns`, `options`) for same-shaped data, else plain named parts (`SortableItem`, `StylePanelBrand`); never `Sortable.Item` |
| Brand mark (header, sidebar, splash, favicon-sized) | `Logo text="Name" monogram="N"` (the initial; or `icon`/`wordmark`), never a drawn SVG or Icon + Text |
| An assistant, guide or character | `Mascot` (`state` idle/listening/thinking/speaking, `mood`, `accessory`, `color`, `eyes`) — never a hand-drawn SVG creature |
| AI or long work in progress | `WorkingIndicator` (its verbs, or yours); `Mascot state="thinking"` beside it in a chat |
| File or photo upload | `MediaUpload` from `/media` (drop, paste, preview, loading, error) or `ChatComposer attach`, never `<input type="file">` |
| Places, routes, areas | `Map` from `/map` with `MapMarkers`/`MapPin`/`MapPopup`/`MapCircle`, never a static image or a list of addresses. Never `setStyle`, fetch the style JSON, `new maplibregl.Map` or import `maplibre-gl/dist/maplibre-gl.css` (Map brings its own styles): the basemap goes blank. Your own layers (zones, heat): `const { map, styleVersion } = useMap()` and `addSource`/`addLayer` in an effect keyed on `styleVersion`, removed on cleanup |
| A clickable map point | `MapPin onClick` (it is the button; never wrap it in `Button`/`Link`), its `aria-label` starting with its visible text |
| Steps, history, a run's progress | `Timeline` |

Before writing a component of your own, check `catalog.json`: if one of its purposes fits, use it and give it your content.

### Build it to ship, not to screenshot

Even when the brief says nothing about data, build the app as if a backend were coming tomorrow. 90% of briefs won't ask; every one expects it.

- **Data layer:** a `lib/data.ts` (or `lib/api.ts`) of typed async functions, `getX()`, `createX()`, `updateX()`, returning typed records. Behind them, mock data with a short delay (`await wait(400)`). Screens call these functions, never import the mock array, so a real API replaces the functions and no screen changes.
- **Four states on every screen that loads data:** loading (`Skeleton` shaped like the content, never a lone spinner on a whole page), empty (a title, one line of help and the action that fills it), error, filled. **Error is rendered, not just caught:** keep it in state (`const [error, setError] = useState<Error | null>(null)`, set in `catch`) and render `Feedback tone="danger"` with a Retry `Button` in place of the content; a `catch` that only logs or toasts a read is a blank screen.
  ```tsx
  const [state, setState] = useState<{ status: "loading" | "error" | "ready"; data: Job[] }>({ status: "loading", data: [] });
  const load = useCallback(() => {
    setState((s) => ({ ...s, status: "loading" }));
    getJobs().then((data) => setState({ status: "ready", data })).catch(() => setState((s) => ({ ...s, status: "error" })));
  }, []);
  useEffect(load, [load]);
  if (state.status === "error") return <Feedback tone="danger" title="Jobs didn't load"><Button size="s" variant="secondary" label="Retry" onClick={load} /></Feedback>;
  ```
- **Writes:** optimistic update, `loading` on the pressed `Button`, rollback plus `addToast({ tone: "danger" })` on failure; a sent chat message gets `status` and `onRetry`.
- **Forms:** `Form` with field errors and `FormErrorSummary`, disabled submit while saving.

### Imports

Most things come from the package root. These do not — each component below says where it
comes from when it is not the root:

| Import | From |
|--------|------|
| charts, gauges, chart chrome | `@once-ui-system/core/data` |
| `CodeBlock` | `@once-ui-system/core/code` (needs `prismjs`) |
| `MediaUpload` | `@once-ui-system/core/media` (needs `compressorjs`) |
| `Map`, `MapMarker(s)`, `MapPin`, `MapPopup`, `MapCircle` | `@once-ui-system/core/map` (needs `maplibre-gl`) |
| `mdxComponents`, `createMdxComponents`, `Mdx*` elements | `@once-ui-system/core/mdx` (needs `prismjs`) |
| `MediaAudioPlayer`, `MediaVideoPlayer`, `Scrubber`, `CompareImage` | `@once-ui-system/core/media` |
| `EmojiPicker` | `@once-ui-system/core/emoji` |
| `LayoutProvider` in a **Next.js** app; `createOgFetchRoute`, `createOgProxyRoute` | `@once-ui-system/core/next` |
| `defineConfig`, `OnceUIConfig` in `once-ui.config` | `@once-ui-system/core/config` (also on the root) |
| the effects: `RevealFx`, `CountFx`, `TypeFx`, `MatrixFx`, `Effect`, every `*Fx` | `@once-ui-system/fx` (a package: install it) |
| `Banner`, `Book`, `LogoCloud`, `ScrollToTop`, `StylePanel`, `StyleOverlay` | `@once-ui-system/blocks` (a package: install it) |

Naming one of these from the root does not resolve — except `defineConfig`,
which is on both, and `LayoutProvider`, which resolves and then silently
renders links and images as plain `<a>` and `<img>` in a Next.js app. `IconName` is a real union, so an unregistered icon
name is a type error, not a blank space — take names (the IconName type below). Brand marks
are not in the set: an app registers them by augmenting `IconLibraryOverrides`.

### Types — the common type errors

Every type a prop names is defined in the slice's (or bundle's) `types`.

- Responsive `xl`/`l`/`m`/`s`/`xs` props exist only on `Flex`, `Row`, `Column` and `Grid`. To change a `Button`, `Text` or anything else at a breakpoint, wrap it in one of those; `Text` and `Heading` take only `s={{ hide: true }}`. Leaves (`Button`, the fields and controls, `Text`, `Heading`, `Icon`, `Avatar`, `Kbd`…) take only margins, `flex`, `fillWidth`, `position` and offsets, `className` and `style`: padding, background, border, radius, sizes and anything else at a breakpoint go on a wrapper too.
- `vertical`/`horizontal` take `start | center | end | between | around | even | stretch` — no `baseline`; for baseline-aligned text write `style={{ alignItems: "baseline" }}`.
- Spacing (`gap`, `padding`, …) takes the SpacingToken values below: `"4"`, `"8"`, `"12"`, `"16"`, `"20"`, `"24"`, `"32"`, `"40"`… — there is no `"6"` or `"10"`.
- `as` on `Flex`/`Row`/`Column`/`Grid` types the element's attributes and ref: `<Column as="form" onSubmit={…}>`, `<Row as="button" type="submit">`. `as="ul"`/`"ol"` drops bullets and indent, `as="button"` the button chrome; other components take no `as`.
- `Row`, `Column` and `Grid` have no `span`: a child spanning grid columns uses `style={{ gridColumn: "span 2" }}`.
- `variant` is appearance (Button: `primary | secondary | tertiary | ghost | link`), `tone` the palette (`brand | accent | neutral | info | success | warning | danger`) on Button, IconButton, Tag, Feedback, Toast and `addToast`: `<Button tone="danger">`. Text/Heading take `textVariant`. Badge and Chip are `Tag` (`variant="announce"`; `selected`/`onRemove` make a toggle).
- `Checkbox`, `Switch` and `RadioButton` take `checked` + `onCheckedChange(checked)` (`onToggle` was 2.x, `isChecked` 1.x); `onChange` is the native event of their input.
- Don't wrap primary content (headlines, prices, KPIs, CTAs) in `RevealFx`: it stays blurred until the reveal ends. Use it on secondary sections, with `duration={1000}`.

### Defaults — omit these

`position="relative"`, `direction` on Row/Column, `variant="primary"` on Button, `size="m"` when default, `fillWidth` beside `maxWidth`, `minWidth={0}` beside `fillWidth`, a border colour that restates the default.

### Before building

If design intent unclear, ask: content style, layout width, color approach, decoration level, imagery. Default: restrained, centered `maxWidth="m"`, single brand accent, one subtle gradient, no placeholder images.

An app: set the theme first, chosen for the domain, never the template's default blue on grey: `brand`, `accent` and `neutral` (or `brandSeed`), `solid: "color"`, a `--font-heading` via `next/font`; no ambient decoration. Consumer and care apps go warm (`orange`/`yellow`/`moss` brand on `sand` or `rose`); health and outdoors `green`/`emerald`/`aqua` on `mint` or `sand`; creative tools `violet`/`magenta` on `dusk`; operations, incident and map tools dark first (`theme: "dark"`), a quiet brand on `slate`, status tones carry meaning. One shell (header, nav, panels) for every route of the app, in its `layout.tsx`. Phone header, plan canvas, selection: `ai/layouts.md`.

Make it look designed, not stock:

- One idea carries the screen. A map app is the map, full-bleed and dark first, its lists and details on floating `surface` panels (`border`, `radius="l"`, `shadow="l"`, `position="absolute"`), never a map in a card; the selected place's panel acts on it (a write through the data hook, optimistic with rollback). An area gets one small label at its centre, none below zoom 11. A chat with an assistant gives it a face, and the face is the hero: a `Mascot` shaped into the product with `bodyPath` (a pot, a leaf: a path in 200 × 200) and an `accessory` (a sprout, a hat: SVG, same box), not the default blob; big in the welcome (`size="xl"`, `poke`), then `size={64}` in the header with its `state` following the reply, not just a small avatar per reply; one `Mascot` per view: in the header on the chat route only; beside an `EmptyState`, only its own; a photo is `MediaUpload` or `ChatComposer attach`; the empty chat is a welcome over a brand `Background` (`gradient`) with suggestion `Tag`s.
- The brand is identity, not paint: `Logo` in the header, the `Mascot`'s `color`, `Nav tone="brand"`, one brand action per view, and the brand on what is selected (a `selected` Card or row, the active tab, the active pin). Never tint every surface.
- No empty panes: every region has content, an empty state, or collapses away; text over an image or map sits in a panel and wraps or `truncate`s.
- Work apps: `density: "compact"`, `border: "conservative"`, dark first. Hierarchy from type and spacing, not nested grey cards.
- Say what matters at a glance: a strip of the 3–4 numbers the user acts on (label, `heading-strong` value, status `Tag`), colour that means a status, labels, not decoration.
- Map labels stay readable: `MapMarkers cluster`; a unit or place is `MapPin icon="…" tone="…"` labelled with its status (type as icon, status as tone and word; its name when active); never a bare text pill; kinds never overlap; a legend panel (collapsed below `l`) names tones and areas.
- Every action shows its result where it happened (a split block becomes two, an assigned pin changes colour); one that cannot apply does the nearest useful thing or is disabled with a reason; never a toast alone. No empty bands: a timeline takes its content's height.
- Data colours carry through: a status or category is the block's, pin's or `Tag`'s `tone`.
- Secondary pages keep the shell and brand; items are Cards with status and actions. One preview per thing.
- Tablet keeps the desktop structure, narrower (`SplitView collapseBelow="s"`, side panels in a `Drawer`), never the phone layout.
- Headers keep their nav at every width (below `m`: a menu `IconButton` opening a `Drawer`). The chat composer keeps its own height; never `fill` it.
- Tablet and phone keep the main canvas (map, preview, timeline, chat) on screen: side lists become a `Drawer`, a bottom sheet or a `SegmentedControl` tab below `m`; never the canvas pushed off screen.

## Components

Props marked `?` are optional; `= x` is the default; `- a, b?: T` is two props of type `T`. A component's mixins add the props listed under Mixins.

### Map (from `@once-ui-system/core/map`)
Mixins: CommonProps, DisplayProps, FlexProps, SizeProps, SpacingProps, StyleProps.
- viewport, defaultViewport?: MapViewport
- onViewportChange?: (viewport: MapViewport) => void
- bounds?: readonly LngLat[]
- boundsPadding, boundsMaxZoom, minZoom, maxZoom?: number
- mapStyle?: MapStyle
- tint, controls, interactive, cooperativeGestures?: boolean
- projection?: MapProjection
- buildings?: MapBuildings
- onMapClick?: (position: LngLat) => void
- onMapLoad?: (map: MapLibreMap) => void
- workerUrl?: string
- transformRequest?: MapOptions["transformRequest"]
- labels?: Partial<MapLabels>
- children?: React.ReactNode

### MapMarkers (from `@once-ui-system/core/map`)
- items: readonly T[]
- renderItem?: (item: T) => React.ReactNode
- activeId?: string
- cluster?: boolean | MapClusterOptions = false
- renderCluster?: (cluster: { items: T[]; position: LngLat; zoomIn: () => void; }) => React.ReactNode
- clusterLabel?: (count: number) => string = (count) => `${count} places, zoom in`

### MapPin (from `@once-ui-system/core/map`)
- children, prefix?: React.ReactNode
- icon?: IconName
- variant?: "pill" | "icon" | "dot"
- active?: boolean = false
- tone?: MapTone
- href?: string
- onClick?: (event: React.MouseEvent<HTMLElement>) => void

### MapPopup (from `@once-ui-system/core/map`)
Mixins: CommonProps, DisplayProps, FlexProps, SizeProps, SpacingProps, StyleProps.
- position: LngLat
- children: React.ReactNode
- onClose?: () => void
- gap?: number = 40
- closeLabel?: string = Close

### MapCircle (from `@once-ui-system/core/map`)
- position: LngLat
- radius: number
- tone?: MapTone = brand
- opacity?: number = 0.2

### Column
Mixins: CommonProps, DisplayProps, FlexProps, SizeProps, SpacingProps, StyleProps.
Use instead of Flex with direction="column".

### Row
Mixins: CommonProps, DisplayProps, FlexProps, SizeProps, SpacingProps, StyleProps.
Use instead of Flex with direction="row".

### Text
Mixins: CommonProps, LeafProps, TextProps.
Avoid: Layout props: it takes padding, margin, flex and s={{ hide }} but no other breakpoint props, border, radius or background; wrap it in a Row for those. A key cap is Kbd
- opacity?: Opacity

### Button
Mixins: LeafProps.
- variant?: ButtonVariant = primary
- tone?: Tone
- size?: TShirtSizes
- corners?: "none" | "top" | "right" | "bottom" | "left" | "top-left" | "top-right" | "bottom-right" | "bottom-left"
- label, href, id?: string
- weight?: "default" | "strong" = strong
- rounded?: boolean
- prefixIcon, suffixIcon?: IconName
- loading, disabled, arrowIcon?: boolean = false
- horizontal?: "start" | "center" | "end" | "between" = center
- children?: ReactNode
- onClick?: React.MouseEventHandler<HTMLElement>

### Card
Mixins: CommonProps, DisplayProps, FlexProps, SizeProps, SpacingProps, StyleProps.
Avoid: Static panels (pricing tiers, testimonials, stats) — use Column + surface recipe
- children?: React.ReactNode
- href, className?: string
- onClick?: () => void
- fillHeight, selected?: boolean
- style?: React.CSSProperties

### Tag
Mixins: CommonProps, DisplayProps, FlexProps, SizeProps, SpacingProps, StyleProps.
Avoid: Passing the same text as label and children — the children are dropped
- tone?: Tone
- variant?: "default" | "gradient" | "announce" = default
- size?: TShirtSizes
- label?: string = ""
- prefixIcon, suffixIcon?: IconName
- dot, arrow, selected, interactive?: boolean
- href?: string
- effect?: boolean = variant === "announce"
- onClick?: MouseEventHandler<HTMLDivElement>
- onRemove?: () => void
- removeButtonProps?: Partial<IconButtonProps>
- as?: "div" | "span"
- children?: ReactNode

### SegmentedControl
Extends Scroller.
Mixins: CommonProps, DisplayProps, FlexProps, SizeProps, SpacingProps, StyleProps.
- buttons: ButtonOption[]
- value, defaultValue, className?: string
- onValueChange?: (value: string, event?: React.MouseEvent<HTMLButtonElement>) => void
- disabled, compact?: boolean = false
- fillWidth, sliding, scroll?: boolean = true
- semantics?: "tabs" | "radio" = tabs
- style?: React.CSSProperties

### Scroller
Mixins: CommonProps, DisplayProps, FlexProps, SizeProps, SpacingProps, StyleProps.
- children?: React.ReactNode
- direction?: "row" | "column"
- fadeColor?: BaseColor
- onItemClick, onActiveChange?: (index: number) => void
- radius?: RadiusSize
- labels?: ScrollerLabels
- auto?: boolean | ScrollerAuto
- controlPlacement?: ScrollTrackControlPlacement
- infinite, draggable, clip?: boolean
- markers?: boolean | "top" | "bottom"
- step, active?: number
- proximity?: boolean | number
- tile?: React.ComponentProps<typeof Column>

### Timeline
Mixins: CommonProps, DisplayProps, FlexProps, SizeProps, SpacingProps, StyleProps.
Avoid: A media editor's timeline — use Scrubber
- items: TimelineItem[]
- alignment?: "left" | "right" = left
- size?: TShirtSizes = m

### Logo
Mixins: LeafProps.
- size?: TShirtSizes = m
- icon, wordmark?: LogoSource
- text, href?: string
- monogram?: boolean | string
- showIn?: "dark" | "light"
- brand?: { copy?: boolean; url?: string }

### Skeleton
Mixins: CommonProps, DisplayProps, FlexProps, SizeProps, SpacingProps, StyleProps.
- width, height, minHeight, maxHeight?: number | StaticSpacingToken | CSSUnit
- minWidth, maxWidth?: number | SpacingToken | CSSUnit
- shape?: "line" | "circle" | "block" = line
- size?: "xl" | "l" | "m" | "s" | "xs" = m
- delay?: number
- style?: React.CSSProperties
- className?: string

### Feedback
Mixins: CommonProps, DisplayProps, FlexProps, SizeProps, SpacingProps, StyleProps.
- tone?: Tone = info
- showIcon?: boolean = true
- icon?: IconName
- title, description, className?: string
- showCloseButton?: boolean = false
- onClose?: () => void
- style?: React.CSSProperties
- children?: ReactNode

### Drawer
Mixins: CommonProps, DisplayProps, FlexProps, SizeProps, SpacingProps, StyleProps.
- open: boolean
- onClose: () => void
- side?: "left" | "right" | "top" | "bottom" = right
- size?: "s" | "m" | "l" | "full" = m
- title, description, footer, children?: ReactNode
- showClose, closeOnClickaway?: boolean = true
- closeLabel?: string = Close
- flush?: boolean = false
- initialFocusRef, returnFocusRef?: RefObject<HTMLElement | null>

### Grid
Mixins: CommonProps, DisplayProps, GridProps, SizeProps, SpacingProps, StyleProps.
- as?: ElementType
- position?: CSSProperties["position"] = relative
- scrollbar?: "default" | "minimal" = minimal
- masonry?: boolean

### Heading
Mixins: CommonProps, LeafProps, TextProps.
Avoid: Layout props: it takes padding, margin, flex and s={{ hide }} but no other breakpoint props, border, radius or background; wrap it in a Row for those. A key cap is Kbd
- wrap?: CSSProperties["textWrap"] = balance
- opacity?: Opacity

### IconButton
Mixins: LeafProps.
- icon?: IconName = refresh
- id, href?: string
- size?: TShirtSizes
- corners?: "none" | "top" | "right" | "bottom" | "left" | "top-left" | "top-right" | "bottom-right" | "bottom-left"
- rounded, loading, disabled?: boolean = false
- tooltip, children?: ReactNode
- tooltipPosition?: "top" | "bottom" | "left" | "right" = top
- variant?: ButtonVariant = primary
- tone?: Tone
- onClick?: React.MouseEventHandler<HTMLElement>

### Icon
Mixins: LeafProps.
- name: IconName
- onBackground, onSolid?: `${ColorScheme}-${ColorWeight}`
- size?: TShirtSizes = m
- decorative?: boolean = true
- tooltip?: ReactNode
- tooltipPosition?: "top" | "bottom" | "left" | "right" = top

### Input
Mixins: LeafProps.
- id: string
- label, placeholder?: string
- size?: FieldSize
- error, focusRing, loading?: boolean = false
- errorMessage, description, prefix, suffix?: ReactNode
- corners?: "none" | "top" | "right" | "bottom" | "left" | "top-left" | "top-right" | "bottom-right" | "bottom-left"
- variant?: "default" | "ghost" = default
- characterCount?: boolean
- cursor?: undefined | "interactive"
- onValueChange?: (value: string) => void
- validate?: (value: ReactNode) => ReactNode | null
- reveal, fillWidth?: boolean = true
- span?: number

### Textarea
Mixins: LeafProps.
- id: string
- label, placeholder?: string
- lines?: number | "auto" = auto
- size?: FieldSize
- error, focusRing, disabled?: boolean = false
- errorMessage, description, prefix, suffix?: ReactNode
- corners?: "none" | "top" | "right" | "bottom" | "left" | "top-left" | "top-right" | "bottom-right" | "bottom-left"
- variant?: "default" | "ghost" = default
- characterCount?: boolean
- resize?: "horizontal" | "vertical" | "both" | "none" = vertical
- onValueChange?: (value: string) => void
- validate?: (value: ReactNode) => ReactNode | null
- span?: number
- fillWidth?: boolean = true

### Avatar
Mixins: LeafProps.
- size?: TShirtSizes | number | CSSUnit = m
- value, src?: string
- unoptimized, loading, empty?: boolean
- icon?: IconName
- statusIndicator?: { scheme: StatusIndicatorScheme; tone?: undefined } | { tone: Tone; scheme?: undefined }
- style?: CSSProperties = {}

### Dialog
Mixins: CommonProps, DisplayProps, FlexProps, SizeProps, SpacingProps, StyleProps.
- open: boolean
- onClose: () => void
- title: ReactNode | string
- description, children, footer, backdrop?: ReactNode
- variant?: "center" | "sheet" = center
- base, stack?: boolean
- flush?: boolean = false
- showClose, closeOnClickaway?: boolean = true
- closeLabel?: string = Close
- onHeightChange?: (height: number) => void
- minHeight?: number

### VisuallyHidden
- children?: ReactNode
- focusable?: boolean = false
- className?: string
- style?: React.CSSProperties
- as?: ElementType = span

## Hooks

- `useToast`: `() => ToastContextProps`

## Mixins

### CommonProps
- onBackground, onSolid?: Colors
- align?: CSSProperties["textAlign"]
- children?: ReactNode
- className?: string
- style?: React.CSSProperties

### DisplayProps
- inline, hide?: boolean
- pointerEvents?: "none" | "all" | "auto"
- userSelect?: UserSelect
- position?: CSSProperties["position"]
- overflow?: CSSProperties["overflow"]
- overflowX?: CSSProperties["overflowX"]
- overflowY?: CSSProperties["overflowY"]
- scrollbar?: "default" | "minimal"
- transition?: "micro-short" | "micro-medium" | "micro-long" | "macro-short" | "macro-medium" | "macro-long"
- opacity?: Opacity
- zIndex?: -1 | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | "-1" | "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10"
- showIn?: "dark" | "light"

### FlexProps
- center, wrap?: boolean
- s, xl, l, m, xs?: FlexBreakpointProps
- direction?: "row" | "column" | "row-reverse" | "column-reverse"
- horizontal?: "start" | "center" | "end" | "between" | "around" | "even" | "stretch"
- vertical?: "start" | "center" | "end" | "between" | "around" | "even" | "stretch" | "baseline"
- flex?: FlexValue

### SizeProps
- width?: number | SpacingToken | CSSUnit | "auto" | "fit"
- height?: number | SpacingToken | CSSUnit | "below-header" | "fit"
- maxWidth, minWidth?: number | SpacingToken | CSSUnit
- minHeight, maxHeight?: number | SpacingToken | CSSUnit | "below-header"
- fit, fitWidth, fitHeight, fill, fillWidth, fillHeight?: boolean
- aspectRatio?: CSSProperties["aspectRatio"]

### SpacingProps
- padding, paddingLeft, paddingRight, paddingTop, paddingBottom, paddingX, paddingY, top, right, bottom, left, translateX, translateY?: SpacingToken | number | CSSUnit
- margin, marginLeft, marginRight, marginTop, marginBottom, marginX, marginY?: SpacingToken | number | CSSUnit | "auto"
- gap?: SpacingToken | number | CSSUnit | "-1"

### StyleProps
- textVariant?: TextVariant
- background?: Colors | "surface" | "overlay" | "page" | "transparent"
- solid?: Colors
- borderTop, borderRight, borderBottom, borderLeft, borderX, borderY, border?: Colors | "surface" | "transparent" | boolean
- borderStyle?: "solid" | "dashed"
- borderWidth?: 1 | 2 | 4 | 8 | "1" | "2" | "4" | "8"
- topRadius, rightRadius, bottomRadius, leftRadius, topLeftRadius, topRightRadius, bottomLeftRadius, bottomRightRadius?: RadiusSize
- shadow?: ShadowSize
- emphasis?: boolean | "edge" | "glow" | "aura"
- cursor?: CSSProperties["cursor"] | "interactive" | CursorPresetValue | ReactNode
- blendMode?: BlendMode
- blur, backdropBlur?: BlurSize | number | CSSUnit
- theme?: "light" | "dark" | "invert"
- themeBorder?: BorderStyle
- themeSolid?: SolidType
- themeSurface?: SurfaceStyle
- radius?: RadiusSize | `${RadiusSize}-${RadiusNest}`

### LeafProps
- margin, marginTop, marginRight, marginBottom, marginLeft, marginX, marginY?: SpacingToken | number | CSSUnit | "auto"
- flex?: FlexValue
- fillWidth?: boolean
- position?: CSSProperties["position"]
- top, right, bottom, left?: SpacingToken | number | CSSUnit
- className?: string
- style?: CSSProperties

### TextProps
- as?: ElementType
- textVariant?: TextVariant
- wrap?: CSSProperties["textWrap"]
- family?: TextType
- weight?: TextWeight
- truncate?: boolean
- xl, l, m, s, xs?: TextBreakpointHide

### GridProps
- columns, rows?: GridSize
- minColumnWidth?: number | SpacingToken | CSSUnit
- xl, l, m, s, xs?: GridBreakpointProps

## Types

```ts
type BaseColor = Colors | "page" | "surface" | "overlay" | "transparent"
type BlendMode = "color" | "screen" | "normal" | "multiply" | "overlay" | "darken" | "lighten" | "difference" | "exclusion" | "hue" | "saturation" | "luminosity" | `color-${"dodge" | "burn"}` | "hard-light" | "soft-light" | "plus-lighter"
type BlurSize = "s" | "xl" | "l" | "m" | "xs"
type BorderStyle = "rounded" | "playful" | "conservative" | "sharp"
type ButtonOption = LeafProps & { value: string; description?: ReactNode; label?: ReactNode; children?: ReactNode; horizontal?: "start" | "center" | "end" | "between"; radius?: RadiusSize; disabled?: boolean; href?: string; size?: TShirtSizes; corners?: "none" | "top" | "right" | "bottom" | "left" | "top-left" | "top-right" | "bottom-right" | "bottom-left"; variant?: "ghost" | "outline" | "subtle"; tone?: Tone; weight?: "default" | "strong"; truncate?: boolean; rounded?: boolean; prefixIcon?: IconName; suffixIcon?: IconName }
// type ButtonVariant is one of these strings: link ghost subtle primary secondary tertiary
type CSSUnit = `${number}px` | `${number}rem` | `${number}em` | `${number}ch` | `${number}%` | `${number}vh` | `${number}vw` | `${number}dvh` | `${number}dvw` | `${number}svh` | `${number}svw` | `${number}lvh` | `${number}lvw` | `${number}vmin` | `${number}vmax` | `${number}cqw` | `${number}cqh` | `calc(${string})` | `min(${string})` | `max(${string})` | `clamp(${string})` | `var(${string})`
// type ColorScheme is one of these strings: neutral brand accent info danger warning success
type ColorWeight = "strong" | "medium" | "weak"
type Colors = Exclude<BaseColor, "page" | "surface" | "overlay" | "transparent">
type CursorPresetValue = "rounded" | "soft" | "dot" | "system"
// type FieldSize is one of these strings: s xl l m xs xxs
// type FlexBreakpointProps: an object of these Flex props, all optional (padding* is padding, paddingX, paddingTop and the rest):
// center style direction horizontal vertical wrap flex textVariant background solid border* radius shadow padding* margin* gap top right bottom left width height maxWidth minWidth minHeight maxHeight fit* fill* aspectRatio onBackground onSolid align hide pointerEvents position overflow* scrollbar transition opacity zIndex
// type FlexValue is one of these strings: 0 1 10 2 3 4 9 12 5 8 6 7 11
// type GridBreakpointProps: an object of these Grid props, all optional (padding* is padding, paddingX, paddingTop and the rest):
// style textVariant background solid border* radius shadow padding* margin* gap top right bottom left width height maxWidth minWidth minHeight maxHeight fit* fill* aspectRatio onBackground onSolid align hide pointerEvents position overflow* scrollbar transition opacity zIndex columns rows
// type GridSize is one of these strings: 1 10 2 3 4 9 12 5 8 6 7 11
type IconButtonProps = IconButton props
// type IconName is one of these names, and only these:
// symbol code link menu search time video filter image security opacity download info danger warning adjustments arrowDown arrowLeft arrowRight arrowUp arrowUpRight ball banknotes barChart bell bolt book bookmark calendar cart chat check checkbox chevronDoubleLeft chevronDoubleRight chevronDown chevronLeft chevronRight chevronUp chevronsLeftRight clipboard close computer copy cube dark dislike document edit enter eye eyeDropper eyeOff file flag folder food forward gift globe grid grip heart help home inbox light like linearGauge lock logout mail mapPin maximize minimize minus moreHorizontal newspaper organization pause paw payment people person personRemove phone play plus radialGauge refresh return screen send settings smiley sparkle star starFill store tag trash trend trendDown trendUp upload volume volumeOff wordmark world
type LegacyToast = { variant?: Tone; tone?: Tone; children?: ReactNode; message?: ReactNode; action?: ReactNode; duration?: number }
type LngLat = { [key: number]?: number }
type LogoSource = "string" | { light: string; dark: string; }
type MapBuildings = "flat" | "3d"
type MapClusterOptions = { radius?: number; maxZoom?: number; minPoints?: number }
type MapLabels = { map: string; zoomIn: string; zoomOut: string; unavailable: string }
type MapProjection = "globe" | "mercator"
type MapStyle = "string" | "StyleSpecification" | { light: MapStyleSource; dark: MapStyleSource; }
type MapStyleSource = "string" | "StyleSpecification"
// type MapTone is one of these strings: neutral brand accent info danger warning success
type MapViewport = { center: LngLat; zoom: number; bearing?: number; pitch?: number }
// type Opacity is one of these strings: 0 10 20 30 40 50 60 70 80 90 100
type RadiusNest = "4" | "8"
// type RadiusSize is one of these strings: s xl l m xs none full
type ScrollTrackControlPlacement = `${"top" | "bottom"}-${"end" | "start" | "center" | "between"}`
type ScrollerAuto = { speed?: Speed; hover?: "slow" | "pause" | "none"; reverse?: boolean; gap?: number | string }
type ScrollerLabels = { previous?: string; next?: string }
type ShadowSize = "s" | "xl" | "l" | "m" | "xs"
type SolidType = "color" | "contrast" | "inverse"
// type SpacingToken is one of these strings: s xl l m xs 0 32 1 2 4 64 160 12 8 16 20 24 40 48 56 72 80 104 128
type Speed = "number" | "medium" | "slow" | "fast"
// type StaticSpacingToken is one of these strings: 0 32 1 2 4 64 160 12 8 16 20 24 40 48 56 72 80 104 128
// type StatusIndicatorScheme is one of these strings: blue indigo violet magenta pink red orange yellow moss green emerald aqua cyan sand gray slate rose mint dusk
type SurfaceStyle = "filled" | "translucent"
type TShirtSizes = "s" | "xl" | "l" | "m" | "xs"
type TextBreakpointHide = { hide?: boolean }
type TextType = "body" | "code" | "label" | "heading" | "display"
type TextVariant = `${"body" | "code" | "label" | "heading" | "display"}-${"strong" | "default" | "normal" | "medium"}-${"xl" | "xs" | "s" | "l" | "m"}`
type TextWeight = "strong" | "default" | "normal" | "medium"
type TimelineItem = { label?: React.ReactNode; description?: React.ReactNode; tone?: Tone; marker?: React.ReactNode; children?: React.ReactNode }
type ToastContextProps = { toasts: Toast[]; addToast: (toast: Omit<Toast, "id"> | LegacyToast) => string; removeToast: (id: string) => void }
// type Tone is one of these strings: neutral brand accent info danger warning success
type UserSelect = "text" | "auto" | "none" | "all"
```

## Gotchas

- Never cast an icon name with `as IconName`: the cast compiles a name the registry does not have, and it renders nothing. Use a name from iconNames; in data, type the field as IconName ({ icon: IconName }[]) or write the literal `as const`, so the type check still runs.
- Field heights run a step above Button's: Input size xs is 40px, s 48px, m 56px (the default). A field beside a size="s" Button (32px), as in a toolbar or filter row, takes size="xxs", which is 32px too; Form size="xxs" sets it for every field inside. An xxs field has no floating label: label shows as the placeholder, so keep label for the accessible name.
- Fixed in 2.1: a Button or IconButton that is a Dropdown trigger renders a real <button type="button"> with aria-haspopup and aria-expanded, so it is reachable by keyboard. Pass it as trigger as is; do not add type="button" or a no-op onClick, or wrap it in a focusable Row, to make it one.
- Pass a Tag's text once, as label or as children — with both, the children are dropped. Badge and Chip are Tag in 3.0.
- Timeline lays a sequence of steps down the page. For a video or audio editor's timeline — a playhead over stacked tracks of movable, trimmable blocks — use Scrubber. Do not build one out of Flex and absolute positioning.
- Write 3.0 prop names, not 1.x or 2.x ones from memory: open (not isOpen), checked (not isChecked), SegmentedControl value/onValueChange/defaultValue (not selected/onToggle/defaultSelected), Tag tone (not scheme or variant), Button tone="danger" (not variant="danger"), Text/Heading textVariant (not variant), field size/prefix/suffix/corners (not height/hasPrefix/hasSuffix/radius), Table onSelectedChange (not onSelectionChange), CodeBlock collapsible (not isCollapsible). The validator names the 3.0 prop.
- No designed logo yet: <Logo text="Acme" monogram /> sets the name in type beside a favicon-style mark (a bare shape, black or white with the theme). Never draw an icon or wordmark SVG yourself; a hand-made mark looks worse than the monogram. When the owner's SVGs exist, pass them as icon (it replaces the monogram) and wordmark (an image source, not text).
- Tag is a div by default; inside a sentence (<Text as="p">, <p>) give it as="span".
- overflow="hidden" on full-bleed sections clips glows into hard bands — only use when parent has radius.
- Leaf components (Button, IconButton, ToggleButton, the fields, Switch, Checkbox, RadioButton, Text, Heading, Icon, Avatar, Spinner, StatusIndicator, Kbd, InlineCode, ProgressBar, Logo, SmartLink, NavIcon) take only margins, flex, fillWidth, position, top/right/bottom/left, className and style besides their own props. Padding, background, border, radius, sizes, hide and breakpoints go on a Row around it (a Column around Text or Heading; <Row fit> for an Icon's box).
- Positions are [longitude, latitude], not [lat, lng]. Map needs a height (or fill inside a sized parent); it shadows the global Map, so import it as another name in a file that also uses new Map().
- A Button in a form that should submit it needs type="submit": with neither onClick, href nor type it renders a div, unlike a native <button>.
- Show a field's error after it is blurred or the form is submitted, never on open: keep a touched flag per field and pass errorMessage={touched.email ? errors.email : undefined}. A form or Dialog that opens with red required-field errors reads as broken.

## Quality bar

- The Map fills the screen (fill, height="100dvh"); lists and details float over it as panels (background="surface", border, radius="l", shadow="l", position="absolute" with offsets), never a map in a card beside a table
- MapMarkers with cluster and activeId; MapPin tone carries status with a text label too; selecting in the list frames the item on the map
- Logo in the panel header; status as Tags with tone and words, urgent ones danger
- On a phone the list panel becomes a bottom sheet (s={{ … }} on the panel) or a Drawer; the map stays full-bleed
- Every view that loads data shows loading (Skeleton shaped like the content), empty (title, one line, the action that fills it), error (Feedback tone="danger" with Retry) and filled, through a typed lib/ data layer of async functions over mock data — even when the brief never mentions data
- Writes are optimistic: loading on the pressed Button, rollback plus addToast({ tone: "danger" }) when the save fails

## Gold example (`examples/map-app.tsx`)

```tsx
"use client";

/**
 * Gold example: a map app, built to ship.
 * Target: the map is the screen. It is full-bleed, with floating panels over
 * it for the list and the selected item, the brand mark in the corner, and
 * every state a real backend produces: loading, empty (also when a filter
 * hides everything), error with retry, and a failed write that rolls back.
 *
 * The data layer sits at the top, in what would be `lib/jobs.ts`: typed async
 * functions over mock data with a delay. The screen calls only these, so a
 * real API replaces their bodies and nothing else changes.
 */
import {
  Button,
  Card,
  Column,
  Feedback,
  Logo,
  Row,
  SegmentedControl,
  Skeleton,
  Tag,
  Text,
  Timeline,
  useToast,
} from "@once-ui-system/core";
import {
  type LngLat,
  // biome-ignore lint/suspicious/noShadowRestrictedNames: the component's own name
  Map,
  MapCircle,
  MapMarkers,
  MapPin,
} from "@once-ui-system/core/map";
import { useCallback, useEffect, useState } from "react";

// ── lib/jobs.ts ──────────────────────────────────────────────────────────

export type JobStatus = "open" | "assigned" | "late";
export type Job = {
  id: string;
  title: string;
  address: string;
  position: LngLat;
  status: JobStatus;
  /** What kind of job: the pin's icon (its status is the pin's tone). */
  kind: "home" | "bolt";
  /** Metres round the address the job may be anywhere in. */
  radius: number;
  history: { label: string; at: string }[];
};

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const seed: Job[] = [
  {
    id: "j1",
    title: "Boiler service",
    address: "Andrássy út 12",
    position: [19.0583, 47.5025],
    status: "open",
    kind: "home",
    radius: 150,
    history: [{ label: "Reported", at: "08:10" }],
  },
  {
    id: "j2",
    title: "Lift inspection",
    address: "Váci utca 40",
    position: [19.0526, 47.4927],
    status: "late",
    kind: "bolt",
    radius: 120,
    history: [
      { label: "Reported", at: "07:20" },
      { label: "Due", at: "09:00" },
    ],
  },
];

export const jobs = {
  async list(): Promise<Job[]> {
    await wait(500);
    return seed;
  },
  /** Rejects when the server refuses, so the screen can roll back. */
  async assign(id: string): Promise<Job> {
    await wait(700);
    const job = seed.find((j) => j.id === id);
    if (!job) throw new Error("Not found");
    return { ...job, status: "assigned" };
  },
};

// ── the screen ───────────────────────────────────────────────────────────

const STATUS: Record<JobStatus, { label: string; tone: "brand" | "success" | "danger" }> = {
  open: { label: "Open", tone: "brand" },
  assigned: { label: "Assigned", tone: "success" },
  late: { label: "Late", tone: "danger" },
};

type Filter = "all" | JobStatus;

export function MapAppExample() {
  const { addToast } = useToast();
  const [state, setState] = useState<"loading" | "error" | "ready">("loading");
  const [items, setItems] = useState<Job[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    setState("loading");
    jobs
      .list()
      .then((data) => {
        setItems(data);
        setState("ready");
      })
      .catch(() => setState("error"));
  }, []);
  useEffect(load, [load]);

  const shown = items.filter((j) => filter === "all" || j.status === filter);
  const selected = items.find((j) => j.id === selectedId);

  // Optimistic: the job turns assigned at once and goes back if the server refuses.
  const assign = async (job: Job) => {
    setSaving(true);
    setItems((list) => list.map((j) => (j.id === job.id ? { ...j, status: "assigned" } : j)));
    try {
      await jobs.assign(job.id);
    } catch {
      setItems((list) => list.map((j) => (j.id === job.id ? job : j)));
      addToast({ tone: "danger", message: `Couldn't assign ${job.title}. Try again.` });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Column fill height="100dvh">
      <Map
        fill
        bounds={shown.map((j) => j.position)}
        defaultViewport={{ center: [19.0402, 47.4979], zoom: 12 }}
      >
        <MapMarkers
          items={shown}
          activeId={selectedId ?? undefined}
          cluster
          renderItem={(job) => (
            // Type as the icon, status as the tone, both at rest; the name only when selected.
            <MapPin
              icon={job.kind}
              tone={STATUS[job.status].tone}
              active={job.id === selectedId}
              onClick={() => setSelectedId(job.id)}
              aria-label={`${job.title}, ${STATUS[job.status].label}`}
            >
              {job.id === selectedId ? job.title : STATUS[job.status].label}
            </MapPin>
          )}
        />
        {selected && (
          <MapCircle
            position={selected.position}
            radius={selected.radius}
            tone={STATUS[selected.status].tone}
          />
        )}
      </Map>

      {/* The list floats over the map; on a phone it becomes the bottom sheet. */}
      <Column
        position="absolute"
        top="16"
        left="16"
        width={22}
        maxHeight="calc(100% - 2rem)"
        background="surface"
        border
        radius="l"
        shadow="l"
        overflow="hidden"
        s={{ position: "absolute", top: undefined, bottom: "0", left: "0", width: "100%" }}
      >
        <Row padding="16" gap="12" vertical="center" horizontal="between" borderBottom>
          <Logo text="Fjell Service" monogram="F" size="s" />
          <Tag label={`${items.filter((j) => j.status === "late").length} late`} tone="danger" />
        </Row>
        <Column padding="12" borderBottom>
          <SegmentedControl
            compact
            value={filter}
            onValueChange={(value) => setFilter(value as Filter)}
            buttons={[
              { value: "all", label: "All" },
              { value: "open", label: "Open" },
              { value: "late", label: "Late" },
            ]}
          />
        </Column>
        <Column overflowY="auto" padding="8" gap="4">
          {state === "loading" &&
            [0, 1, 2].map((i) => <Skeleton key={i} shape="block" height={56} />)}
          {state === "error" && (
            <Feedback tone="danger" title="Jobs didn't load">
              <Button size="s" variant="secondary" label="Retry" onClick={load} />
            </Feedback>
          )}
          {state === "ready" && shown.length === 0 && (
            <Column padding="16" gap="8" horizontal="center">
              <Text textVariant="label-strong-m">
                {items.length === 0 ? "No jobs today" : "Nothing matches"}
              </Text>
              <Text textVariant="body-default-s" onBackground="neutral-weak" align="center">
                {items.length === 0
                  ? "New jobs appear here as they come in."
                  : "Try another filter."}
              </Text>
              {items.length > 0 && (
                <Button
                  size="s"
                  variant="secondary"
                  label="Show all"
                  onClick={() => setFilter("all")}
                />
              )}
            </Column>
          )}
          {state === "ready" &&
            shown.map((job) => (
              <Card
                key={job.id}
                selected={job.id === selectedId}
                fillWidth
                padding="12"
                radius="m"
                gap="12"
                vertical="center"
                horizontal="between"
                onClick={() => setSelectedId(job.id)}
              >
                <Column>
                  <Text textVariant="label-strong-s">{job.title}</Text>
                  <Text textVariant="body-default-s" onBackground="neutral-weak">
                    {job.address}
                  </Text>
                </Column>
                <Tag size="s" label={STATUS[job.status].label} tone={STATUS[job.status].tone} />
              </Card>
            ))}
        </Column>
      </Column>

      {selected && (
        <Column
          position="absolute"
          top="16"
          right="16"
          width={20}
          background="surface"
          border
          radius="l"
          shadow="l"
          padding="20"
          gap="16"
          s={{ hide: true }}
        >
          <Column gap="4">
            <Text textVariant="heading-strong-s">{selected.title}</Text>
            <Text textVariant="body-default-s" onBackground="neutral-weak">
              {selected.address}
            </Text>
          </Column>
          <Timeline
            size="xs"
            items={selected.history.map((h) => ({
              label: h.label,
              description: h.at,
              tone: "brand",
            }))}
          />
          <Button
            label={selected.status === "assigned" ? "Assigned" : "Assign to me"}
            disabled={selected.status === "assigned"}
            loading={saving}
            onClick={() => assign(selected)}
          />
        </Column>
      )}
    </Column>
  );
}
```
