# Analytics dashboard

KPI stat cards, charts area, recent-activity list

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

### Grid
Mixins: CommonProps, DisplayProps, GridProps, SizeProps, SpacingProps, StyleProps.
- xl, l, m, s, xs?: GridBreakpointProps
- position?: CSSProperties["position"] = relative
- scrollbar?: "default" | "minimal" = minimal

### Heading
Mixins: CommonProps, DisplayProps, SpacingProps, TextProps.
Avoid: Layout props: it takes padding, margin, flex and s={{ hide }} but no other breakpoint props, border, radius or background; wrap it in a Row for those. A key cap is Kbd
- wrap?: CSSProperties["textWrap"] = balance

### Text
Mixins: CommonProps, DisplayProps, SpacingProps, TextProps.
Avoid: Layout props: it takes padding, margin, flex and s={{ hide }} but no other breakpoint props, border, radius or background; wrap it in a Row for those. A key cap is Kbd

### Background
Extends Flex.
Mixins: CommonProps, DisplayProps, FlexProps, SizeProps, SpacingProps, StyleProps.
- gradient?: GradientProps = {}
- dots?: DotsProps = {}
- grid?: GridProps = {}
- lines?: LinesProps = {}
- mask?: MaskProps
- className?: string
- style?: React.CSSProperties
- children?: React.ReactNode

### CountFx
Extends Text.
Mixins: CommonProps, DisplayProps, SpacingProps, TextProps.
- value: number
- speed?: number = 1000
- easing?: "linear" | "ease-out" | "ease-in-out" = ease-out
- format?: (value: number) => string
- separator?: string
- decimals?: number
- effect?: "simple" | "wheel" | "smooth" = simple
- children?: React.ReactNode

### StatusIndicator
Extends Flex.
Mixins: CommonProps, DisplayProps, FlexProps, SizeProps, SpacingProps, StyleProps.
- size?: CondensedTShirtSizes = m
- color?: StatusIndicatorColor = blue
- ariaLabel?: string = `${color} status indicator`
- className?: string
- style?: React.CSSProperties

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

### Tag
Extends Flex.
Mixins: CommonProps, DisplayProps, FlexProps, SizeProps, SpacingProps, StyleProps.
- scheme?: ColorScheme | "gradient" = neutral
- size?: CondensedTShirtSizes = m
- label?: string = ""
- prefixIcon, suffixIcon?: IconName
- children?: ReactNode

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

### LineChart (from `@once-ui-system/core/data`)
Extends Flex.
Mixins: ChartProps, CommonProps, DisplayProps, FlexProps, SizeProps, SpacingProps, StyleProps.
- curve?: curveType = natural
- reverseY, reverseX, error, loading?: boolean = false
- animation, tooltip?: boolean = true
- animationBegin, animationDuration?: number
- animationEasing?: unknown
- xAxisType?: "number" | "category"
- xDomain?: [number, number]
- data-viz-style?: DataStyle | (string & {})
- legend?: LegendConfig = {}
- grid, axis?: "x" | "y" | "both" | "none" = both
- border?: Colors | "surface" | "transparent" | boolean = neutral-alpha-weak

### BarChart (from `@once-ui-system/core/data`)
Extends Flex.
Mixins: ChartProps, CommonProps, DisplayProps, FlexProps, SizeProps, SpacingProps, StyleProps.
- barWidth?: BarWidth = l
- hover, reverseY, reverseX, error, loading?: boolean = false
- data-viz-style?: DataStyle | (string & {})
- legend?: LegendConfig = {}
- tooltip?: boolean = true
- grid?: "x" | "y" | "both" | "none" = y
- axis?: "x" | "y" | "both" | "none" = both
- border?: Colors | "surface" | "transparent" | boolean = neutral-alpha-weak

### ChartHeader (from `@once-ui-system/core/data`)
Extends Column, Flex.
Mixins: CommonProps, DisplayProps, FlexProps, SizeProps, SpacingProps, StyleProps.
- title, description?: React.ReactNode
- dateRange?: DateRange
- date?: DateConfig
- onDateRangeChange?: (range: DateRange) => void
- presets?: PresetsConfig = { display: true, granularity: "week" }

### RevealFx
Extends Flex.
Mixins: CommonProps, DisplayProps, FlexProps, SizeProps, SpacingProps, StyleProps.
- children: React.ReactNode
- speed?: "slow" | "medium" | "fast" | number = medium
- delay?: number = 0
- revealedByDefault?: boolean = false
- translateY?: number | SpacingToken
- revealed?: boolean
- style?: React.CSSProperties
- className?: string

### Line
Extends Flex.
Mixins: CommonProps, DisplayProps, FlexProps, SizeProps, SpacingProps, StyleProps.
- vert?: boolean
- style?: React.CSSProperties

### Drawer
Extends Flex.
Mixins: CommonProps, DisplayProps, FlexProps, SizeProps, SpacingProps, StyleProps.
- open: boolean
- onClose: () => void
- side?: "left" | "right" | "top" | "bottom" = right
- size?: "s" | "m" | "l" | "full" = m
- title, description, footer, children?: ReactNode
- showClose, closeOnClickaway?: boolean = true
- flush?: boolean = false
- initialFocusRef, returnFocusRef?: RefObject<HTMLElement | null>

### NavItem
Extends ToggleButton.
- label: ReactNode
- icon?: IconName
- prefix?: ReactNode
- badge?: number | ReactNode
- indicator?: boolean

### ToggleButton
- label, children?: ReactNode
- selected, rounded, fillWidth, truncate, disabled?: boolean = false
- variant?: "ghost" | "outline" | "subtle" = ghost
- size?: TShirtSizes = m
- radius?: RadiusSize
- corners?: "none" | "top" | "right" | "bottom" | "left" | "top-left" | "top-right" | "bottom-right" | "bottom-left"
- horizontal?: "start" | "center" | "end" | "between" = center
- weight?: "default" | "strong" = default
- prefixIcon, suffixIcon?: IconName
- className, href?: string
- style?: React.CSSProperties

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

### Skeleton
Extends Flex.
Mixins: CommonProps, DisplayProps, FlexProps, SizeProps, SpacingProps, StyleProps.
- shape?: "line" | "circle" | "block" = line
- size?: "xl" | "l" | "m" | "s" | "xs" = m
- delay?: number
- style?: React.CSSProperties
- className?: string

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

### GridProps
- columns, rows?: GridSize
- minColumnWidth?: number | SpacingToken | CSSUnit

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

### ChartProps
- title, description, emptyState, errorState?: React.ReactNode
- series: SeriesConfig | SeriesConfig[]
- data: readonly DataPoint[] | readonly object[]
- legend?: LegendConfig
- date?: DateConfig
- error, tooltip, loading?: boolean
- grid, axis?: "x" | "y" | "both" | "none"
- variant?: ChartVariant

## Types

```ts
// type BarWidth is one of these strings: number xl l m s xs fill
type BaseColor = "page" | "surface" | "overlay" | "transparent" | `${"neutral" | "brand" | "accent" | "info" | "danger" | "warning" | "success"}-${"weak" | "medium" | "strong"}` | `${"neutral" | "brand" | "accent" | "info" | "danger" | "warning" | "success"}-alpha-${"weak" | "medium" | "strong"}`
type BlendMode = "color" | "normal" | "screen" | "overlay" | "multiply" | "darken" | "lighten" | "difference" | "exclusion" | "hue" | "saturation" | "luminosity" | `color-${"dodge" | "burn"}` | "hard-light" | "soft-light" | "plus-lighter"
type BlurSize = "xl" | "l" | "m" | "s" | "xs"
type BorderStyle = "rounded" | "playful" | "conservative" | "sharp"
type BreakpointKey = "xl" | "l" | "m" | "s" | "xs"
type ButtonOption = { value: string; description?: ReactNode; style?: React.CSSProperties; className?: string; children?: ReactNode; horizontal?: "start" | "center" | "end" | "between"; radius?: RadiusSize; fillWidth?: boolean; rounded?: boolean; label?: ReactNode; disabled?: boolean; size?: TShirtSizes; corners?: "none" | "top" | "right" | "bottom" | "left" | "top-left" | "top-right" | "bottom-right" | "bottom-left"; variant?: "ghost" | "outline" | "subtle"; weight?: "default" | "strong"; truncate?: boolean; prefixIcon?: IconName; suffixIcon?: IconName; href?: string }
type CSSUnit = `${number}px` | `${number}rem` | `${number}em` | `${number}%` | `${number}vh` | `${number}dvh` | `${number}vw` | `calc(${string})`
type ChartVariant = "flat" | "outline" | "gradient"
// type ColorScheme is one of these strings: neutral brand accent info danger warning success
type ColorValue = string & {} | `${"neutral" | "brand" | "accent" | "info" | "danger" | "warning" | "success"}-${"weak" | "medium" | "strong"}` | `${"neutral" | "brand" | "accent" | "info" | "danger" | "warning" | "success"}-alpha-${"weak" | "medium" | "strong"}`
type ColorWeight = "weak" | "medium" | "strong"
type Colors = `${"neutral" | "brand" | "accent" | "info" | "danger" | "warning" | "success"}-${"weak" | "medium" | "strong"}` | `${"neutral" | "brand" | "accent" | "info" | "danger" | "warning" | "success"}-alpha-${"weak" | "medium" | "strong"}`
type ColumnHide = Partial<Record<BreakpointKey, boolean>>
type CondensedTShirtSizes = "l" | "m" | "s"
type CursorPresetValue = "soft" | "rounded" | "dot" | "system"
type DataPoint = { [key: string]?: string | number | Date | undefined; label?: string }
type DataStyle = "categorical" | "divergent" | "sequential"
type DateConfig = { start?: Date; end?: Date; max?: Date; min?: Date; dual?: boolean; format?: string; presets?: PresetsConfig; selector?: boolean; onChange?: (range: DateRange) => void }
type DateRange = { startDate: Date | undefined; endDate: Date | undefined }
type DotsProps = { display?: boolean; opacity?: DisplayProps["opacity"]; color?: ColorValue; size?: SpacingToken }
// type FieldSize is one of these strings: xl l m s xs xxs
// type FlexValue is one of these strings: 0 1 2 3 4 5 6 7 8 9 10 11 12
type GradientProps = { display?: boolean; opacity?: DisplayProps["opacity"]; x?: number; y?: number; width?: number; height?: number; tilt?: number; colorStart?: ColorValue; colorEnd?: ColorValue }
// type GridBreakpointProps: an object of these Grid props, all optional (padding* is padding, paddingX, paddingTop and the rest):
// style textVariant textSize textType textWeight background solid border* radius shadow padding* margin* gap top right bottom left width height maxWidth minWidth minHeight maxHeight fit* fill* aspectRatio onBackground onSolid align hide pointerEvents position overflow* scrollbar transition opacity zIndex dark light columns rows
// type GridSize is one of these strings: 1 2 3 4 5 6 7 8 9 10 11 12
// type IconName is one of these names, and only these:
// symbol security opacity dark light copy help filter info danger warning code link menu search time video image enter send checkbox document grid adjustments arrowDown arrowLeft arrowRight arrowUp arrowUpRight ball banknotes barChart bell bolt book bookmark calendar cart chat check chevronDoubleLeft chevronDoubleRight chevronDown chevronLeft chevronRight chevronUp chevronsLeftRight clipboard close computer cube dislike download edit eye eyeDropper eyeOff file flag folder food forward gift globe grip heart home inbox like linearGauge lock logout mail maximize minimize minus moreHorizontal newspaper organization pause paw payment people person personRemove play plus radialGauge refresh return screen settings smiley sparkle star starFill store tag trash trend trendDown trendUp upload volume volumeOff wordmark world
type LegendConfig = { display?: boolean; direction?: "row" | "column"; position?: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "top-center" | "bottom-center" }
type LinesProps = { display?: boolean; opacity?: DisplayProps["opacity"]; size?: SpacingToken; thickness?: number; angle?: number; color?: ColorValue }
type MaskProps = Mask props
// type Opacity is one of these strings: 0 10 20 30 40 50 60 70 80 90 100
type PresetsConfig = { display: boolean; granularity: "year" | "month" | "week" }
type RadiusNest = "4" | "8"
// type RadiusSize is one of these strings: xl l m s xs none full
type ScrollerLabels = { previous?: string; next?: string }
type SeriesConfig = { key: string; color?: ColorValue }
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
// type curveType is one of these strings: step linear basis basisClosed basisOpen bumpX bumpY bump linearClosed natural monotoneX monotoneY monotone stepBefore stepAfter
```

## Gotchas

- The x axis reads the first key of data[0] that is not a series key (date, label, month). Put that key first in every point and list only the plotted keys in series: series={[{ key: "visitors" }]} with data={[{ date: "Oct 1", visitors: 1840 }]}.
- x/y are percent positions of the container (50/50 = center).
- StatusIndicator takes color, not variant: a palette name ("green", "red", "gray") or a theme role ("success", "danger", "brand").
- Never cast an icon name with `as IconName`: the cast compiles a name the registry does not have, and it renders nothing. Use a name from iconNames; in data, type the field as IconName ({ icon: IconName }[]) or write the literal `as const`, so the type check still runs.
- Field heights run a step above Button's: Input size xs is 40px, s 48px, m 56px (the default). A field beside a size="s" Button (32px), as in a toolbar or filter row, takes size="xxs", which is 32px too; Form size="xxs" sets it for every field inside. An xxs field has no floating label: label shows as the placeholder, so keep label for the accessible name.
- Fixed in 2.1: a Button or IconButton that is a DropdownWrapper trigger renders a real <button type="button"> with aria-haspopup and aria-expanded, so it is reachable by keyboard. Pass it as trigger as is; do not add type="button" or a no-op onClick, or wrap it in a focusable Row, to make it one.
- Do not pass the same text as both title prop and children — it renders twice.
- Write 2.x prop names, not 1.x ones from memory: open (not isOpen), checked (not isChecked), SegmentedControl value/onChange/defaultValue (not selected/onToggle/defaultSelected), Tag scheme (not variant), field size/prefix/suffix/corners (not height/hasPrefix/hasSuffix/radius). The validator names the 2.x prop.
- Tag and Badge are divs by default; inside a sentence (<Text as="p">, <p>) give them as="span".
- overflow="hidden" on full-bleed sections clips glows into hard bands — only use when parent has radius.

## Quality bar

- Column surface recipe — not Card
- CountFx or display-strong-s with viewport latch
- Inside an app: the layout shell below — the pane scrolls with height="below-header", the sidebar hides at s and a Drawer holds the same nav on a phone

## Recipes

### 7. Reveal stagger (entry, not ambient)

Entrance animation for **one** key set per page, viewport-triggered and latched so it plays once, when actually seen:

```tsx
const ref = useRef<HTMLDivElement>(null);
const inViewport = useInViewport(ref);
const [seen, setSeen] = useState(false);
useEffect(() => {
  if (inViewport) setSeen(true);
}, [inViewport]);

<Grid ref={ref} columns="3" gap="16" s={{ columns: 1 }}>
  {items.map((item, index) => (
    <RevealFx key={item.id} revealed={seen} translateY="8" delay={index * 100}>
      <Card ... />
    </RevealFx>
  ))}
</Grid>
```

For stats, drive `CountFx` value from the same latch: `<CountFx value={seen ? 2400 : 0} separator="," />`.

## Layout shell

### 1. App shell with a sidebar

The one agents get wrong most often. A dashboard built without this scrolls the
whole document, so the header and sidebar slide away and the nav has to be
scrolled back to.

```tsx
// The drawer is open for the path it was opened on: a link in it closes it.
const [menuPath, setMenuPath] = useState<string | null>(null);
const menuOpen = menuPath === pathname;

<Column fill horizontal="center" flex={1}>
  <Row height="56" fillWidth vertical="center" paddingX="16" gap="8">  {/* 56px: --header-height */}
    <Row hide s={{ hide: false }}>
      <IconButton icon="moreHorizontal" variant="tertiary" tooltip="Menu"
        aria-expanded={menuOpen} onClick={() => setMenuPath(pathname)} />
    </Row>
    {/* logo, search, account */}
  </Row>
  <Row fill paddingX="8">
    <Column s={{ hide: true }} maxWidth={18} fitHeight position="sticky" top="56">
      <SideNav nav={nav} pathname={pathname} />
    </Column>
    <Row fill horizontal="center" topRadius="l" overflow="hidden">
      <Row
        height="below-header"
        overflowY="auto"
        topRadius="l"
        horizontal="center"
        fillWidth
        background="surface">
        <Column maxWidth="xl" gap="m" paddingY="32" fitHeight>
          {children}
        </Column>
      </Row>
    </Row>
  </Row>
  <Drawer open={menuOpen} onClose={() => setMenuPath(null)} side="left" size="s" title="Menu" flush>
    <Column paddingTop="64" paddingBottom="16">
      <SideNav nav={nav} pathname={pathname} />
    </Column>
  </Drawer>
</Column>
```

What each part is doing:

- **The pane scrolls, not the page.** `height="below-header"` plus
  `overflowY="auto"` is what keeps the header and sidebar in place. It is
  `calc(100dvh - var(--header-height))`, written once as a utility class:
  `dvh`, not `vh` — on mobile `vh` ignores the browser chrome and the pane runs
  off-screen. Never restate the header height in a `calc()` of your own.
- **`--header-height`** is 56px (`var(--static-space-56)`) by default, the
  header this recipe uses. A shell with a different header sets it once on
  `:root`; `height`, `minHeight` and `maxHeight` all take `"below-header"`,
  and a mobile menu hanging from the header takes `maxHeight="below-header"`.
- **`position="sticky" top="56"`** on the sidebar, matching the header height
  (`top="calc(var(--header-height))"` follows a non-default one). `fitHeight`
  so it does not stretch and fight the sticky.
- **`topRadius="l"` + `background="surface"`** is what makes the content read as
  a panel sitting on the page rather than the page itself. The radius is on the
  top only, since the bottom is off-screen.
- **`s={{ hide: true }}`** rather than a media query. The mobile nav is a
  separate surface, not this one reflowed: a **`Drawer`** from the left,
  holding the same `SideNav`, opened by a header button that only shows at `s`
  (`hide s={{ hide: false }}`). Drawer brings the focus trap, scroll lock,
  Escape and focus return a hand-made overlay misses; `flush` keeps its
  `title` for screen readers only. Tie it to the path it was opened on, as
  above, and following a link closes it without an effect.
- **`maxWidth="xl"`** inside the pane. A dashboard is wider than a document;
  `"m"` is for reading.

## Gold example (`examples/dashboard.tsx`)

```tsx
"use client";

import {
  Button,
  Column,
  CountFx,
  Grid,
  Heading,
  Icon,
  Line,
  RevealFx,
  Row,
  SegmentedControl,
  StatusIndicator,
  Table,
  Tag,
  Text,
  useInViewport,
} from "@once-ui-system/core";
/**
 * Gold example: dashboard
 * Target: KPI stat row, chart placeholders, recent activity table
 */
import { useEffect, useRef, useState } from "react";

const stats = [
  { label: "Revenue", value: 128400, prefix: "$", change: "+12.4%", up: true },
  { label: "Active users", value: 2847, change: "+8.1%", up: true },
  { label: "Churn rate", value: 2.1, suffix: "%", change: "−0.3%", up: true },
  { label: "Support tickets", value: 34, change: "+4", up: false },
];

const activity = {
  headers: [
    { content: "Event", key: "event" },
    { content: "User", key: "user" },
    { content: "Status", key: "status" },
    { content: "Time", key: "time" },
  ],
  rows: [
    [
      "Plan upgraded to Pro",
      "jane@acme.co",
      <Tag size="s" scheme="success">
        Completed
      </Tag>,
      "2m ago",
    ],
    [
      "New signup",
      "alex@studio.io",
      <Tag size="s" scheme="brand">
        New
      </Tag>,
      "14m ago",
    ],
    [
      "Payment failed",
      "ops@build.dev",
      <Tag size="s" scheme="danger">
        Action
      </Tag>,
      "1h ago",
    ],
  ],
};

export function DashboardExample() {
  const [range, setRange] = useState("7d");
  const statsRef = useRef<HTMLDivElement>(null);
  const inViewport = useInViewport(statsRef);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    if (inViewport) setSeen(true);
  }, [inViewport]);

  return (
    <Column as="main" fillWidth horizontal="center" paddingY="48" paddingX="24" gap="40">
      <Column maxWidth="l" gap="40">
        <Row
          fillWidth
          horizontal="between"
          vertical="end"
          gap="24"
          s={{ direction: "column", horizontal: "start" }}
        >
          <Column gap="8">
            <Text variant="label-default-s" onBackground="brand-medium">
              Analytics
            </Text>
            <Heading as="h1" variant="display-strong-s">
              Overview
            </Heading>
          </Column>
          <SegmentedControl
            value={range}
            onChange={setRange}
            buttons={[
              { value: "7d", label: "7 days" },
              { value: "30d", label: "30 days" },
              { value: "90d", label: "90 days" },
            ]}
          />
        </Row>

        <Grid ref={statsRef} columns="4" gap="16" m={{ columns: 2 }} s={{ columns: 1 }}>
          {stats.map((stat, index) => (
            <RevealFx key={stat.label} fill revealed={seen} translateY="8" delay={index * 100}>
              <Column background="surface" border radius="l" padding="24" gap="16">
                <Row fillWidth horizontal="between" vertical="center">
                  <Text variant="label-default-s" onBackground="neutral-weak">
                    {stat.label}
                  </Text>
                  <StatusIndicator color={stat.up ? "green" : "orange"} />
                </Row>
                <Row vertical="end" gap="4">
                  {stat.prefix && <Text variant="display-strong-xs">{stat.prefix}</Text>}
                  <CountFx
                    variant="display-strong-xs"
                    value={seen ? stat.value : 0}
                    speed={1200}
                    separator=","
                  />
                  {stat.suffix && <Text variant="display-strong-xs">{stat.suffix}</Text>}
                </Row>
                <Text
                  variant="label-default-s"
                  onBackground={stat.up ? "success-medium" : "warning-medium"}
                >
                  {stat.change}
                </Text>
              </Column>
            </RevealFx>
          ))}
        </Grid>

        <Grid columns="2" gap="24" s={{ columns: 1 }}>
          <Column background="surface" border radius="l" padding="24" gap="16" minHeight={32}>
            <Heading as="h2" variant="heading-strong-s">
              Revenue trend
            </Heading>
            <Column flex={1} center background="neutral-alpha-weak" radius="m" padding="48">
              <Icon name="linearGauge" size="l" onBackground="neutral-weak" />
              <Text variant="label-default-s" onBackground="neutral-weak">
                Chart area — use recharts or your data viz module
              </Text>
            </Column>
          </Column>
          <Column background="surface" border radius="l" padding="24" gap="16" minHeight={32}>
            <Heading as="h2" variant="heading-strong-s">
              Signups by channel
            </Heading>
            <Column flex={1} center background="neutral-alpha-weak" radius="m" padding="48">
              <Icon name="radialGauge" size="l" onBackground="neutral-weak" />
              <Text variant="label-default-s" onBackground="neutral-weak">
                Chart area
              </Text>
            </Column>
          </Column>
        </Grid>

        <Column background="surface" border radius="l" padding="24" gap="24">
          <Row fillWidth horizontal="between" vertical="center">
            <Heading as="h2" variant="heading-strong-s">
              Recent activity
            </Heading>
            <Button variant="tertiary" size="s" label="View all" />
          </Row>
          <Line />
          <Table fillWidth data={activity} />
        </Column>
      </Column>
    </Column>
  );
}
```
