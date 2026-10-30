# List / table page

A page of records: title with the primary action, a status filter, a searchable, sortable, paginated Table with status tags and row actions, and an empty state

This file is complete for this task: the rules (all of `rules.compact.md`), the props of every component below, their mixins and types, every gotcha for these components, the quality bar and a gold example. Write the page from it; reading the rules, catalog, gotchas, manifest or examples again only adds cost. Open `components/<Name>.json` only for a component not listed here, and then every one you need in a single step.

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
| `width="32" height="32"` (32 px, a spacing token); `height={20}` (320 px: past `"160"` there is no token, use rem) | `width={32} height={32}` (a number is rem: 512 px), `height="320"` (not a token) |
| `border` | `border="neutral-alpha-weak"` |
| `<Logo wordmark={{ light, dark }} />` | a `<Logo dark>` and a `<Logo light>` |

- `Flex` only when direction changes at breakpoints: `<Row s={{ direction: "column" }}>`
- Subtree theme: `theme`, `themeBorder`, `themeSolid`, `themeSurface` on Flex/Row/Column/Grid and components built on them (`Background`, `Tag`, effects) — not raw `data-theme`/`data-border`/`data-solid`. `Button`/`IconButton` have no typed prop: keep `data-border="rounded"`
- App theme in `once-ui.config` `style`: `defaultTheme: "light"` = starts light, visitor can switch (`theme: "light"` forces it and `setTheme` does nothing). Exact brand colours: `brandScale`/`neutralScale` `{ 100: "#…", …, 1200: "#…" }` (with or without a seed; per theme `{ light: {…}, dark: {…} }`), page/card colour: `pageBackground`/`surfaceBackground` (token or colour, or `{ light, dark }`), not overrides of semantic CSS variables
- Page skeleton: `Column as="main" fillWidth horizontal="center"` → content `Column maxWidth="l"` → sections
- Section gaps: `"104"` between sections, `"24"`–`"40"` inside. Never `"48"` between major sections.
- Responsive: breakpoint props `xl l m s xs` — never media queries for layout

### Surfaces

Static panel recipe (pricing tiers, stats, settings sections):

```tsx
<Column background="surface" border radius="l" padding="24" gap="16">
```

- Bare `border` (and `borderTop`, `borderBottom`, …) = the default border. Name a colour only to deviate: `border="brand-alpha-medium"`.
- `Card` = interactive only (`href` or `onClick`). Static panels = Column + surface recipe.
- Colors: `{scheme}-{weight}` or `{scheme}-alpha-{weight}`. Never hex/rgb — inline SVG `fill`/`stroke` included: `currentColor` or `var(--brand-solid-strong)`.
- `background` also: `surface | overlay | page | transparent`

### Typography

- Hero: `display-strong-l` or `display-strong-xl`
- Section titles: `display-strong-xs` or `display-strong-s` — not `heading-*`
- Eyebrow: `<Text variant="label-default-s" onBackground="brand-medium">`
- Text on layout: `textVariant` + `onBackground` on Row/Column instead of nesting Text

### Decoration

Absolute layers always: `position="absolute" top="0" left="0" fill pointerEvents="none"`, content `zIndex={1}`.

- `zIndex` only inside that layer group (or on a sticky header over its pane). Never on a lone element, never a page-wide ladder.

- Gradient `width`: quarter-percent (400 = 100%). Glows: 100–200.
- Glow colors: `brand-alpha-medium`, not `brand-background-weak`
- Ambient layers on full-bleed section wrapper, outside `maxWidth` column
- Budget: one ambient layer per section; motion in hero + one CTA max

### Motion

- `RevealFx delay` (and `ShineFx`/`CountFx`/`TypeFx speed`, `Animation`/`HoverCard`/`Hover`/`Skeleton` delays) in **milliseconds**: `delay={index * 100}` — `* 0.1` was 1.8.x. `speed` on `MatrixFx`, `WeatherFx`, `ParticleFx` is a multiplier
- `RevealFx translateY`: number = rem; prefer `"8"`–`"16"` tokens
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
| Mobile nav, side sheet | `Drawer`, not a hand-made overlay |
| Page trail | `Breadcrumbs items={[...]}` |
| Keyboard shortcut | `useHotkeys("mod+k", fn)` + `KeyTip keys="mod+k"`; a key cap is `Kbd` |
| Screen-reader text, skip link | `VisuallyHidden` (skip link: `<VisuallyHidden as="a" href="#main" focusable>`) |
| Native attributes | Every component also takes its element's own: `aria-*`, `id`, `role`, `onClick`; `type` on `Button`; `value`, `onChange`, `type` on `Input` |
| MDX content | `mdxComponents` / `createMdxComponents` from `/mdx` |

### Imports

Most things come from the package root. These do not — each component below says where it
comes from when it is not the root:

| Import | From |
|--------|------|
| charts, gauges, chart chrome | `@once-ui-system/core/data` (needs `recharts`) |
| `CodeBlock` | `@once-ui-system/core/code` (needs `prismjs`) |
| `MediaUpload` | `@once-ui-system/core/media` (needs `compressorjs`) |
| `Map`, `MapMarker(s)`, `MapPin`, `MapPopup`, `MapCircle` | `@once-ui-system/core/map` (needs `maplibre-gl`) |
| `mdxComponents`, `createMdxComponents`, `Mdx*` elements | `@once-ui-system/core/mdx` (needs `prismjs`) |
| `MediaAudioPlayer`, `MediaVideoPlayer` | `@once-ui-system/core/components/<Name>` |
| `LayoutProvider` in a **Next.js** app; `createOgFetchRoute`, `createOgProxyRoute` | `@once-ui-system/core/next` |
| `defineConfig`, `OnceUIConfig` in `once-ui.config` | `@once-ui-system/core/config` (also on the root) |

Naming one of these from the root does not resolve — except `defineConfig`,
which is on both, and `LayoutProvider`, which resolves and then silently
renders links and images as plain `<a>` and `<img>` in a Next.js app. `IconName` is a real union, so an unregistered icon
name is a type error, not a blank space — take names (the IconName type below). Brand marks
are not in the set: an app registers them by augmenting `IconLibraryOverrides`.

### Types — the common type errors

Every type a prop names is defined in the slice's (or bundle's) `types`.

- Responsive `xl`/`l`/`m`/`s`/`xs` props exist only on `Flex`, `Row`, `Column` and `Grid`. `Text` and `Heading` take only `s={{ hide: true }}`. To change a `Button`, `Text` or anything else at a breakpoint, wrap it in one of those.
- `vertical`/`horizontal` take `start | center | end | between | around | even | stretch` — no `baseline`; for baseline-aligned text write `style={{ alignItems: "baseline" }}`.
- Spacing (`gap`, `padding`, …) takes the SpacingToken values below: `"4"`, `"8"`, `"12"`, `"16"`, `"20"`, `"24"`, `"32"`, `"40"`… — there is no `"6"` or `"10"`.
- `Row`, `Column` and `Grid` have no `span` or `type`. A clickable row is a `Button` or a native `<button>`; a child spanning grid columns uses `style={{ gridColumn: "span 2" }}`.
- A form is a native `<form onSubmit={…}>` around a `Column`. `Column as="form"` types `onSubmit` for a `div`.
- `Checkbox`, `Switch` and `RadioButton` take `checked` + `onToggle(checked)` — `isChecked` was 1.x.
- Don't wrap primary content (headlines, prices, KPIs, CTAs) in `RevealFx`: it stays blurred until the reveal ends. Use it on secondary sections, with `speed="fast"`.

### Defaults — omit these

`position="relative"`, `direction` on Row/Column, `variant="primary"` on Button, `size="m"` when default, `fillWidth` beside `maxWidth`, `minWidth={0}` beside `fillWidth`, a border colour that restates the default.

### Before building

If design intent unclear, ask: content style, layout width, color approach, decoration level, imagery. Default: restrained, centered `maxWidth="m"`, single brand accent, one subtle gradient, no placeholder images.

## Components

Props marked `?` are optional; `= x` is the default; `- a, b?: T` is two props of type `T`. A component's mixins add the props listed under Mixins.

### Column
Extends Flex with direction="column".
Mixins: CommonProps, DisplayProps, FlexProps, SizeProps, SpacingProps, StyleProps.
Use instead of Flex with direction="column".
- children?: React.ReactNode

### Row
Extends Flex with direction="row".
Mixins: CommonProps, DisplayProps, FlexProps, SizeProps, SpacingProps, StyleProps.
Use instead of Flex with direction="row".
- children?: React.ReactNode

### Heading
Mixins: CommonProps, DisplayProps, SpacingProps, TextProps.
Avoid: Layout props: it takes padding, margin, flex and s={{ hide }} but no other breakpoint props, border, radius or background; wrap it in a Row for those. A key cap is Kbd
- wrap?: CSSProperties["textWrap"] = balance

### Text
Mixins: CommonProps, DisplayProps, SpacingProps, TextProps.
Avoid: Layout props: it takes padding, margin, flex and s={{ hide }} but no other breakpoint props, border, radius or background; wrap it in a Row for those. A key cap is Kbd

### Button
- variant?: "primary" | "secondary" | "tertiary" | "quaternary" | "subtle" | "danger" | "success" | "warning" | "ghost" | "link" = primary
- size?: TShirtSizes = m
- corners?: "none" | "top" | "right" | "bottom" | "left" | "top-left" | "top-right" | "bottom-right" | "bottom-left"
- label, href, className, id?: string
- weight?: "default" | "strong" = strong
- rounded?: boolean
- prefixIcon, suffixIcon?: IconName
- loading, disabled, fillWidth, arrowIcon?: boolean = false
- horizontal?: "start" | "center" | "end" | "between" = center
- children?: ReactNode
- style?: React.CSSProperties
- color?: `${ColorScheme}-${ColorWeight}`

### SegmentedControl
Extends Scroller, Flex.
Mixins: CommonProps, DisplayProps, FlexProps, SizeProps, SpacingProps, StyleProps.
- buttons: ButtonOption[]
- onChange?: (value: string, event?: React.MouseEvent<HTMLButtonElement>) => void
- defaultValue, value, className?: string
- fillWidth, scroll?: boolean = true
- compact?: boolean = false
- semantics?: "tabs" | "radio" = tabs
- style?: React.CSSProperties

### Scroller
Extends Flex.
Mixins: CommonProps, DisplayProps, FlexProps, SizeProps, SpacingProps, StyleProps.
- children?: React.ReactNode
- direction?: "row" | "column" = row
- fadeColor?: BaseColor = transparent
- onItemClick?: (index: number) => void
- radius?: RadiusSize
- labels?: ScrollerLabels

### Select
Extends Input, DropdownWrapper.
- options: SelectOptionType[]
- value?: string | string[]
- emptyState?: ReactNode = No results
- onSelect?: (value: string | string[]) => void
- placement?: Placement
- searchable, multiple?: boolean = false
- className?: string
- style?: React.CSSProperties
- fillWidth?: boolean = true
- labels?: SelectLabels

### Input
- id: string
- label, placeholder, className?: string
- size?: FieldSize
- error, focusRing, loading?: boolean = false
- errorMessage, description, prefix, suffix?: ReactNode
- corners?: "none" | "top" | "right" | "bottom" | "left" | "top-left" | "top-right" | "bottom-right" | "bottom-left"
- style?: React.CSSProperties
- variant?: "default" | "ghost" = default
- characterCount?: boolean
- cursor?: undefined | "interactive"
- validate?: (value: ReactNode) => ReactNode | null
- span?: number

### DropdownWrapper
- fillWidth, nested, disableTriggerClick?: boolean = false
- minWidth, maxWidth, minHeight, optionsCount?: number
- placement?: Placement = bottom-start
- trigger, dropdown: ReactNode
- selectedOption, className, dropdownId?: string
- style?: React.CSSProperties
- onSelect?: (value: string) => void
- closeAfterClick, handleArrowNavigation?: boolean = true
- open?: boolean
- onOpenChange?: (open: boolean) => void
- navigationLayout?: NavigationLayout
- columns?: number | string = 8
- onFocusCapture, onBlurCapture?: React.FocusEventHandler<HTMLDivElement>

### Table
Extends Flex.
Mixins: CommonProps, DisplayProps, FlexProps, SizeProps, SpacingProps, StyleProps.
- data: { headers: TableHeader[]; rows: ReactNode[][]; }
- onRowClick?: (rowIndex: number) => void
- searchable, striped, compact, loading, stickyHeader, paginated?: boolean = false
- searchPlaceholder?: string = Search...
- hoverable?: boolean = true
- emptyState, loadingState?: ReactNode
- actions?: TableAction[]
- rowClassName?: (rowIndex: number) => string
- cellClassName?: (rowIndex: number, cellIndex: number) => string
- defaultPageSize?: number = 10
- pageSizeOptions?: number[] = [5, 10, 20, 50]

### Tag
Extends Flex.
Mixins: CommonProps, DisplayProps, FlexProps, SizeProps, SpacingProps, StyleProps.
- scheme?: ColorScheme | "gradient" = neutral
- size?: CondensedTShirtSizes = m
- label?: string = ""
- prefixIcon, suffixIcon?: IconName
- children?: ReactNode

### Skeleton
Extends Flex.
Mixins: CommonProps, DisplayProps, FlexProps, SizeProps, SpacingProps, StyleProps.
- shape?: "line" | "circle" | "block" = line
- size?: "xl" | "l" | "m" | "s" | "xs" = m
- delay?: number
- style?: React.CSSProperties
- className?: string

### Option
Extends Flex.
Mixins: CommonProps, DisplayProps, FlexProps, SizeProps, SpacingProps, StyleProps.
- label, prefix, suffix, description, children?: React.ReactNode
- href?: string
- value: string
- danger, selected, highlighted?: boolean
- disabled?: boolean = false
- tabIndex?: number
- onClick?: (value: string) => void
- onLinkClick?: () => void

### Map (from `@once-ui-system/core/map`)
Extends Flex.
Mixins: CommonProps, DisplayProps, FlexProps, SizeProps, SpacingProps, StyleProps.
- viewport, defaultViewport?: MapViewport
- onViewportChange?: (viewport: MapViewport) => void
- bounds?: readonly LngLat[]
- boundsPadding, boundsMaxZoom, minZoom, maxZoom?: number
- mapStyle?: MapStyle
- tint, controls, interactive, cooperativeGestures?: boolean
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
- variant?: "pill" | "dot"
- active?: boolean = false
- color?: MapColor = brand
- href?: string
- onClick?: (event: React.MouseEvent<HTMLElement>) => void

### MapPopup (from `@once-ui-system/core/map`)
Extends Flex.
Mixins: CommonProps, DisplayProps, FlexProps, SizeProps, SpacingProps, StyleProps.
- position: LngLat
- children: React.ReactNode
- onClose?: () => void
- gap?: number = 40
- closeLabel?: string = Close

### Grid
Mixins: CommonProps, DisplayProps, GridProps, SizeProps, SpacingProps, StyleProps.
- xl, l, m, s, xs?: GridBreakpointProps
- position?: CSSProperties["position"] = relative
- scrollbar?: "default" | "minimal" = minimal

### IconButton
- icon?: IconName = refresh
- id, className, href, ariaLabel?: string
- size?: TShirtSizes = m
- corners?: "none" | "top" | "right" | "bottom" | "left" | "top-left" | "top-right" | "bottom-right" | "bottom-left"
- rounded, loading, disabled?: boolean = false
- tooltip, children?: ReactNode
- tooltipPosition?: "top" | "bottom" | "left" | "right" = top
- variant?: "primary" | "secondary" | "tertiary" | "quaternary" | "subtle" | "danger" | "success" | "warning" | "ghost" | "link" = primary
- style?: React.CSSProperties
- color?: `${ColorScheme}-${ColorWeight}`

### Icon
Extends Flex.
Mixins: CommonProps, DisplayProps, FlexProps, SizeProps, SpacingProps, StyleProps.
- name: IconName
- onBackground, onSolid?: `${ColorScheme}-${ColorWeight}`
- size?: TShirtSizes = m
- decorative?: boolean = true
- tooltip?: ReactNode
- tooltipPosition?: "top" | "bottom" | "left" | "right" = top
- className?: string
- style?: React.CSSProperties

### Textarea
- id: string
- label, placeholder, className?: string
- lines?: number | "auto" = auto
- size?: FieldSize
- error, focusRing, disabled?: boolean = false
- errorMessage, description, prefix, suffix?: ReactNode
- corners?: "none" | "top" | "right" | "bottom" | "left" | "top-left" | "top-right" | "bottom-right" | "bottom-left"
- variant?: "default" | "ghost" = default
- characterCount?: boolean
- resize?: "horizontal" | "vertical" | "both" | "none" = vertical
- validate?: (value: ReactNode) => ReactNode | null
- span?: number

### Badge
Extends Flex.
Mixins: CommonProps, DisplayProps, FlexProps, SizeProps, SpacingProps, StyleProps.
Avoid: Passing the same text as title and children — both render
- title, href, className, id?: string
- icon?: IconName
- arrow?: boolean = href ? true : false
- children?: React.ReactNode
- effect?: boolean = true
- style?: React.CSSProperties

### Avatar
Extends Flex.
Mixins: CommonProps, DisplayProps, FlexProps, SizeProps, SpacingProps, StyleProps.
- size?: TShirtSizes | number = m
- value, src, className?: string
- unoptimized, loading, empty?: boolean
- icon?: IconName
- statusIndicator?: { color: StatusIndicatorColor; }
- style?: React.CSSProperties = {}

### Dialog
Extends Flex.
Mixins: CommonProps, DisplayProps, FlexProps, SizeProps, SpacingProps, StyleProps.
- open: boolean
- onClose: () => void
- title: ReactNode | string
- description, children, footer?: ReactNode
- base, stack?: boolean
- flush, hideClose?: boolean = false
- showClose?: boolean = !hideClose
- onHeightChange?: (height: number) => void
- minHeight?: number
- closeOnClickaway?: boolean = true

### VisuallyHidden
- children?: ReactNode
- as?: React.ElementType = span
- focusable?: boolean = false
- className?: string
- style?: React.CSSProperties

## Hooks

- `useToast`: `() => ToastContextProps`

## Mixins

### CommonProps
- onBackground, onSolid?: Colors
- align?: CSSProperties["textAlign"]

### DisplayProps
- as?: ElementType
- inline, hide, dark, light?: boolean
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

### FlexProps
- direction?: "row" | "column" | "row-reverse" | "column-reverse"
- horizontal, vertical?: "start" | "center" | "end" | "between" | "around" | "even" | "stretch"
- center, wrap?: boolean
- flex?: FlexValue

### SizeProps
- width?: number | SpacingToken | CSSUnit | "auto" | "fit"
- height?: number | SpacingToken | CSSUnit | "below-header" | "fit"
- maxWidth, minWidth?: number | SpacingToken | CSSUnit
- minHeight, maxHeight?: number | SpacingToken | CSSUnit | "below-header"
- fit, fitWidth, fitHeight, fill, fillWidth, fillHeight?: boolean
- aspectRatio?: CSSProperties["aspectRatio"]

### SpacingProps
- padding, paddingLeft, paddingRight, paddingTop, paddingBottom, paddingX, paddingY?: SpacingToken | number
- margin, marginLeft, marginRight, marginTop, marginBottom, marginX, marginY?: SpacingToken | number | "auto"
- gap?: SpacingToken | number | "-1"
- top, right, bottom, left, translateX, translateY?: SpacingToken | number | CSSUnit

### StyleProps
- textVariant?: TextVariant
- textSize?: TextSize
- textType?: TextType
- textWeight?: TextWeight
- background?: Colors | "surface" | "overlay" | "page" | "transparent"
- solid?: Colors
- borderTop, borderRight, borderBottom, borderLeft, borderX, borderY, border?: Colors | "surface" | "transparent" | boolean
- borderStyle?: "solid" | "dashed"
- borderWidth?: 1 | 2 | 4 | 8 | "1" | "2" | "4" | "8"
- topRadius, rightRadius, bottomRadius, leftRadius, topLeftRadius, topRightRadius, bottomLeftRadius, bottomRightRadius?: RadiusSize
- shadow?: ShadowSize
- cursor?: CSSProperties["cursor"] | "interactive" | CursorPresetValue | ReactNode
- blendMode?: BlendMode
- blur, backdropBlur?: BlurSize | number
- theme?: "light" | "dark"
- themeBorder?: BorderStyle
- themeSolid?: SolidType
- themeSurface?: SurfaceStyle
- radius?: RadiusSize | `${RadiusSize}-${RadiusNest}`

### TextProps
- as?: T
- variant?: TextVariant
- wrap?: CSSProperties["textWrap"]
- size?: TextSize
- weight?: TextWeight
- family?: TextType
- truncate?: boolean
- flex?: FlexValue | number
- xl, l, m, s, xs?: TextBreakpointHide

### GridProps
- columns, rows?: GridSize
- minColumnWidth?: number | SpacingToken | CSSUnit

## Types

```ts
type BaseColor = "page" | "surface" | "overlay" | "transparent" | `${"neutral" | "brand" | "accent" | "info" | "danger" | "warning" | "success"}-${"weak" | "medium" | "strong"}` | `${"neutral" | "brand" | "accent" | "info" | "danger" | "warning" | "success"}-alpha-${"weak" | "medium" | "strong"}`
type BlendMode = "color" | "normal" | "screen" | "overlay" | "multiply" | "darken" | "lighten" | "difference" | "exclusion" | "hue" | "saturation" | "luminosity" | `color-${"dodge" | "burn"}` | "hard-light" | "soft-light" | "plus-lighter"
type BlurSize = "xl" | "l" | "m" | "s" | "xs"
type BorderStyle = "rounded" | "playful" | "conservative" | "sharp"
type BreakpointKey = "xl" | "l" | "m" | "s" | "xs"
type ButtonOption = { value: string; description?: ReactNode; style?: React.CSSProperties; className?: string; children?: ReactNode; horizontal?: "start" | "center" | "end" | "between"; radius?: RadiusSize; fillWidth?: boolean; rounded?: boolean; label?: ReactNode; disabled?: boolean; size?: TShirtSizes; corners?: "none" | "top" | "right" | "bottom" | "left" | "top-left" | "top-right" | "bottom-right" | "bottom-left"; variant?: "ghost" | "outline" | "subtle"; weight?: "default" | "strong"; truncate?: boolean; prefixIcon?: IconName; suffixIcon?: IconName; href?: string }
type CSSUnit = `${number}px` | `${number}rem` | `${number}em` | `${number}%` | `${number}vh` | `${number}dvh` | `${number}vw` | `calc(${string})`
// type ColorScheme is one of these strings: neutral brand accent info danger warning success
type ColorWeight = "weak" | "medium" | "strong"
type Colors = `${"neutral" | "brand" | "accent" | "info" | "danger" | "warning" | "success"}-${"weak" | "medium" | "strong"}` | `${"neutral" | "brand" | "accent" | "info" | "danger" | "warning" | "success"}-alpha-${"weak" | "medium" | "strong"}`
type ColumnHide = Partial<Record<BreakpointKey, boolean>>
type CondensedTShirtSizes = "l" | "m" | "s"
type CursorPresetValue = "soft" | "rounded" | "dot" | "system"
// type FieldSize is one of these strings: xl l m s xs xxs
// type FlexValue is one of these strings: 0 1 2 3 4 5 6 7 8 9 10 11 12
// type GridBreakpointProps: an object of these Grid props, all optional (padding* is padding, paddingX, paddingTop and the rest):
// style textVariant textSize textType textWeight background solid border* radius shadow padding* margin* gap top right bottom left width height maxWidth minWidth minHeight maxHeight fit* fill* aspectRatio onBackground onSolid align hide pointerEvents position overflow* scrollbar transition opacity zIndex dark light columns rows
// type GridSize is one of these strings: 1 2 3 4 5 6 7 8 9 10 11 12
// type IconName is one of these names, and only these:
// symbol security opacity dark light copy help filter info danger warning code link menu search time video image enter send checkbox document grid adjustments arrowDown arrowLeft arrowRight arrowUp arrowUpRight ball banknotes barChart bell bolt book bookmark calendar cart chat check chevronDoubleLeft chevronDoubleRight chevronDown chevronLeft chevronRight chevronUp chevronsLeftRight clipboard close computer cube dislike download edit eye eyeDropper eyeOff file flag folder food forward gift globe grip heart home inbox like linearGauge lock logout mail maximize minimize minus moreHorizontal newspaper organization pause paw payment people person personRemove play plus radialGauge refresh return screen settings smiley sparkle star starFill store tag trash trend trendDown trendUp upload volume volumeOff wordmark world
type LngLat = { [key: number]?: number }
type MapClusterOptions = { radius?: number; maxZoom?: number; minPoints?: number }
// type MapColor is one of these strings: neutral brand accent info danger warning success
type MapLabels = { map: string; zoomIn: string; zoomOut: string; unavailable: string }
type MapStyle = "string" | "StyleSpecification" | { light: MapStyleSource; dark: MapStyleSource; }
type MapStyleSource = "string" | "StyleSpecification"
type MapViewport = { center: LngLat; zoom: number; bearing?: number; pitch?: number }
type NavigationLayout = "grid" | "row" | "column"
// type Opacity is one of these strings: 0 10 20 30 40 50 60 70 80 90 100
type OptionProps = Option props
type Placement = "top" | "right" | "bottom" | "left" | `${"top" | "right" | "bottom" | "left"}-${"start" | "end"}`
type RadiusNest = "4" | "8"
// type RadiusSize is one of these strings: xl l m s xs none full
type ScrollerLabels = { previous?: string; next?: string }
type SelectLabels = { search?: string; clear?: string }
type SelectOptionType = Omit<OptionProps, "selected">
type ShadowSize = "xl" | "l" | "m" | "s" | "xs"
type SolidType = "color" | "contrast" | "inverse"
// type SpacingToken is one of these strings: xl l m s xs 0 1 2 4 8 12 32 64 160 16 20 24 40 48 56 72 80 104 128
// type StatusIndicatorColor is one of these strings: neutral brand accent info danger warning success blue indigo violet magenta pink red orange yellow moss green emerald aqua cyan sand gray slate rose mint dusk
type SurfaceStyle = "filled" | "translucent"
type TShirtSizes = "xl" | "l" | "m" | "s" | "xs"
type TableAction = { icon: string; label?: string; tooltip?: string; variant?: "primary" | "secondary" | "tertiary" | "danger"; onClick: (rowIndex: number) => void; disabled?: (rowIndex: number) => boolean }
type TableHeader = { content: ReactNode; key: string; sortable?: boolean; width?: string; align?: "left" | "center" | "right"; hide?: ColumnHide }
type TextBreakpointHide = { hide?: boolean }
type TextSize = "xl" | "l" | "m" | "s" | "xs"
type TextType = "label" | "body" | "code" | "heading" | "display"
type TextVariant = `${"label" | "body" | "code" | "heading" | "display"}-${"default" | "medium" | "strong" | "normal"}-${"xl" | "xs" | "l" | "m" | "s"}`
type TextWeight = "default" | "medium" | "strong" | "normal"
type ToastContextProps = { toasts: Toast[]; addToast: (toast: Omit<Toast, "id">) => string; removeToast: (id: string) => void }
type UserSelect = "auto" | "none" | "text" | "all"
```

## Gotchas

- Fixed in 2.1: Select closes on pick and stays closed — focus returning to the field no longer reopens it — and a multiple Select stays open while picking. Use Select with value and onSelect; do not build a local picker from DropdownWrapper and Options to get this.
- Positions are [longitude, latitude], not [lat, lng]. Map needs a height (or fill inside a sized parent); it shadows the global Map, so import it as another name in a file that also uses new Map().
- Never cast an icon name with `as IconName`: the cast compiles a name the registry does not have, and it renders nothing. Use a name from iconNames; in data, type the field as IconName ({ icon: IconName }[]) or write the literal `as const`, so the type check still runs.
- Field heights run a step above Button's: Input size xs is 40px, s 48px, m 56px (the default). A field beside a size="s" Button (32px), as in a toolbar or filter row, takes size="xxs", which is 32px too; Form size="xxs" sets it for every field inside. An xxs field has no floating label: label shows as the placeholder, so keep label for the accessible name.
- Fixed in 2.1: a Button or IconButton that is a DropdownWrapper trigger renders a real <button type="button"> with aria-haspopup and aria-expanded, so it is reachable by keyboard. Pass it as trigger as is; do not add type="button" or a no-op onClick, or wrap it in a focusable Row, to make it one.
- Do not pass the same text as both title prop and children — it renders twice.
- Write 2.x prop names, not 1.x ones from memory: open (not isOpen), checked (not isChecked), SegmentedControl value/onChange/defaultValue (not selected/onToggle/defaultSelected), Tag scheme (not variant), field size/prefix/suffix/corners (not height/hasPrefix/hasSuffix/radius). The validator names the 2.x prop.
- Tag and Badge are divs by default; inside a sentence (<Text as="p">, <p>) give them as="span".
- overflow="hidden" on full-bleed sections clips glows into hard bands — only use when parent has radius.

## Quality bar

- Title and one primary Button in a Row that stacks at s; per-record actions belong in the Table's actions, not the header
- A component cell (name with email, a status Tag) carries its text as children — Table searches and sorts by the text inside each cell
- Tag with a scheme and a text label, never colour alone
- Offer the way back (clear the filter), not only 'No results'
- Icon actions with tooltips; destructive ones take variant="danger"
- Records with a location: a Map beside the list (MapMarkers with cluster, activeId = the hovered row, bounds = the results' positions); it stacks under the list at s

## Gold example (`examples/list-page.tsx`)

```tsx
"use client";

/**
 * Gold example: list page
 * Target: a page of records — title with the one primary action, a status
 * filter, a searchable, sortable, paginated Table with status tags and row
 * actions, and an empty state that offers a way back.
 *
 * Table searches and sorts by the text inside each cell, so a cell that is a
 * component (the name with its email, the status Tag) should carry its text as
 * children, not only in a prop.
 */
import {
  Button,
  Column,
  Heading,
  Row,
  SegmentedControl,
  Table,
  Tag,
  Text,
} from "@once-ui-system/core";
import { useState } from "react";

type Status = "active" | "invited" | "suspended";

type Member = {
  name: string;
  email: string;
  role: string;
  status: Status;
  lastActive: string;
};

const members: Member[] = [
  {
    name: "Ada Park",
    email: "ada@acme.dev",
    role: "Owner",
    status: "active",
    lastActive: "2026-10-09",
  },
  {
    name: "Bruno Silva",
    email: "bruno@acme.dev",
    role: "Admin",
    status: "active",
    lastActive: "2026-10-08",
  },
  { name: "Chen Wei", email: "chen@acme.dev", role: "Editor", status: "invited", lastActive: "—" },
  {
    name: "Dara Okafor",
    email: "dara@acme.dev",
    role: "Viewer",
    status: "suspended",
    lastActive: "2026-08-21",
  },
];

// The scheme colours the tag and the text says the same thing, so status is
// never carried by colour alone.
const statusTag: Record<Status, { scheme: "success" | "warning" | "danger"; label: string }> = {
  active: { scheme: "success", label: "Active" },
  invited: { scheme: "warning", label: "Invited" },
  suspended: { scheme: "danger", label: "Suspended" },
};

type Filter = "all" | Status;

export function ListPageExample({
  onInvite,
  onEdit,
  onRemove,
}: {
  onInvite?: () => void;
  onEdit?: (member: Member) => void;
  onRemove?: (member: Member) => void;
}) {
  const [filter, setFilter] = useState<Filter>("all");
  const visible = members.filter((member) => filter === "all" || member.status === filter);

  return (
    <Column as="main" fillWidth horizontal="center" paddingY="48" paddingX="24">
      <Column maxWidth="l" gap="24">
        <Row
          fillWidth
          horizontal="between"
          vertical="end"
          gap="16"
          s={{ direction: "column", horizontal: "start" }}
        >
          <Column gap="8">
            <Heading as="h1" variant="display-strong-xs">
              Members
            </Heading>
            <Text variant="body-default-s" onBackground="neutral-weak">
              Everyone with access to this workspace.
            </Text>
          </Column>
          <Button prefixIcon="plus" onClick={onInvite}>
            Invite member
          </Button>
        </Row>

        <SegmentedControl
          fillWidth={false}
          value={filter}
          onChange={(value) => setFilter(value as Filter)}
          buttons={[
            { value: "all", label: "All" },
            { value: "active", label: "Active" },
            { value: "invited", label: "Invited" },
            { value: "suspended", label: "Suspended" },
          ]}
        />

        <Table
          searchable
          searchPlaceholder="Search members"
          paginated
          defaultPageSize={10}
          data={{
            headers: [
              { content: "Name", key: "name", sortable: true },
              { content: "Role", key: "role", sortable: true },
              { content: "Status", key: "status", sortable: true },
              { content: "Last active", key: "lastActive", sortable: true, align: "right" },
            ],
            rows: visible.map((member) => [
              <Column key="name" gap="4">
                <Text variant="label-default-s">{member.name}</Text>
                <Text variant="body-default-xs" onBackground="neutral-weak">
                  {member.email}
                </Text>
              </Column>,
              member.role,
              <Tag key="status" size="s" scheme={statusTag[member.status].scheme}>
                {statusTag[member.status].label}
              </Tag>,
              member.lastActive,
            ]),
          }}
          actions={[
            {
              icon: "edit",
              tooltip: "Edit member",
              onClick: (row) => onEdit?.(visible[row]),
            },
            {
              icon: "trash",
              tooltip: "Remove member",
              variant: "danger",
              onClick: (row) => onRemove?.(visible[row]),
            },
          ]}
          emptyState={
            <Column center gap="12" padding="32">
              <Text variant="body-default-s" onBackground="neutral-weak">
                No members match this filter.
              </Text>
              <Button size="s" variant="secondary" onClick={() => setFilter("all")}>
                Show everyone
              </Button>
            </Column>
          }
        />
      </Column>
    </Column>
  );
}
```
