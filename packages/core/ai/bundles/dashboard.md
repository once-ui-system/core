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
| `width={32} height={32}` (a number is the token: `32` = `"32"` = 2rem), `maxWidth="40rem"` | `maxWidth={40}` for 40rem (that was 2.x: `40` is now `"40"`, 2.5rem) |
| `border` | `border="neutral-alpha-weak"` |
| `<Logo wordmark={{ light, dark }} />` | a `<Logo showIn="dark">` and a `<Logo showIn="light">` |

- Units: a number is on the **token scale** on every size, spacing and offset prop: `16` = `"16"` = 1rem, scaled by `data-scaling` (`width={320}`, `padding={24}`, `top={8}`), in breakpoint objects too; a digit string is the spacing token (`"16"`); any CSS length string passes through (`"320px"` never scales, `"50%"`, `"100dvh"`). `Mask`/`Background` percentages are strings (`x="50%"`)
- Control size for a whole app: `density: "compact" | "normal" | "spacious"` in the config `style` (`data-density`), not `size="s"` on every Button; it also picks scaling 95/100/105 unless `scaling` is set. Give `size` only where one control differs
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
- Colors: `{tone}-{weight}` or `{tone}-alpha-{weight}`. Never hex/rgb — inline SVG `fill`/`stroke` included: `currentColor` or `var(--brand-solid-strong)`.
- `background` also: `surface | overlay | page | transparent`

### Typography

- Hero: `display-strong-l` or `display-strong-xl`
- Section titles: `display-strong-xs` or `display-strong-s` — not `heading-*`
- Eyebrow: `<Text textVariant="label-default-s" onBackground="brand-medium">`
- Text on layout: `textVariant` + `onBackground` on Row/Column instead of nesting Text

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
| Mobile nav, side sheet | `Drawer`, not a hand-made overlay |
| Page trail | `Breadcrumbs items={[...]}` |
| Keyboard shortcut | `useHotkeys("mod+k", fn)` + `Kbd keys="mod+k" label="Search"` |
| Screen-reader text, skip link | `VisuallyHidden` (skip link: `<VisuallyHidden as="a" href="#main" focusable>`) |
| Native attributes | Every component also takes its element's own: `aria-*`, `id`, `role`, `onClick`; `type` on `Button`; `value`, `onChange`, `type` on `Input` |
| MDX content | `mdxComponents` / `createMdxComponents` from `/mdx` |
| Multi-part component | List prop (`items`, `columns`, `options`) for same-shaped data, else plain named parts (`SortableItem`, `StylePanelBrand`); never `Sortable.Item` |

### Imports

Most things come from the package root. These do not — each component below says where it
comes from when it is not the root:

| Import | From |
|--------|------|
| charts, gauges, chart chrome | `@once-ui-system/core/data` (needs `recharts`) |
| `CodeBlock` | `@once-ui-system/core/code` (needs `prismjs`) |
| `MediaUpload` | `@once-ui-system/core/media` (needs `compressorjs`) |
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

## Components

Props marked `?` are optional; `= x` is the default; `- a, b?: T` is two props of type `T`. A component's mixins add the props listed under Mixins.

### Column
Mixins: CommonProps, DisplayProps, FlexProps, SizeProps, SpacingProps, StyleProps.
Use instead of Flex with direction="column".

### Row
Mixins: CommonProps, DisplayProps, FlexProps, SizeProps, SpacingProps, StyleProps.
Use instead of Flex with direction="row".

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

### Text
Mixins: CommonProps, LeafProps, TextProps.
Avoid: Layout props: it takes padding, margin, flex and s={{ hide }} but no other breakpoint props, border, radius or background; wrap it in a Row for those. A key cap is Kbd
- opacity?: Opacity

### Background
Mixins: CommonProps, DisplayProps, FlexProps, SizeProps, SpacingProps, StyleProps.
- gradient?: GradientProps = {}
- dots?: DotsProps = {}
- grid?: GridProps = {}
- lines?: LinesProps = {}
- mask?: MaskProps
- className?: string
- style?: React.CSSProperties
- children?: React.ReactNode

### CountFx (from `@once-ui-system/fx`)
Extends Text.
Mixins: CommonProps, LeafProps, TextProps.
- value: number
- duration?: number = 1000
- easing?: "linear" | "ease-out" | "ease-in-out" = ease-out
- format?: (value: number) => string
- separator?: string
- decimals?: number
- effect?: "simple" | "wheel" | "smooth" = simple
- children?: React.ReactNode
- opacity?: Opacity

### StatusIndicator
Mixins: LeafProps.
- size?: TShirtSizes = m
- scheme?: StatusIndicatorScheme = blue
- pulse?: boolean = false
- tone?: Tone
- pulseSize?: string | number

### Table
Mixins: CommonProps, DisplayProps, FlexProps, SizeProps, SpacingProps, StyleProps.
- columns: TableColumn<T>[]
- rows: T[]
- onRowClick?: (row: T, index: number) => void
- searchable, columnsMenu, selectable, paginated, showFirstLast, loading, keepRowsWhileLoading, stickyHeader, striped, compact?: boolean = false
- searchPlaceholder?: string = Search...
- search, aria-label, aria-labelledby?: string
- defaultSearch?: string = ""
- onSearchChange?: (search: string) => void
- matchSearch?: (row: T, query: string) => boolean
- filters, defaultFilters?: TableFilters
- onFiltersChange?: (filters: TableFilters) => void
- columnVisibility, defaultColumnVisibility?: Record<string, boolean>
- onColumnVisibilityChange?: (visibility: Record<string, boolean>) => void
- toolbar, loadingState, emptyState, noResultsState?: ReactNode
- onQueryChange?: (query: TableQuery) => void
- actions?: TableAction<T>[]
- rowClassName?: (row: T, index: number) => string | undefined
- cellClassName?: (row: T, index: number, columnIndex: number) => string | undefined
- getRowId?: (row: T, index: number) => string
- sort?: TableSort | null
- defaultSort?: TableSort | null = null
- onSortChange?: (sort: TableSort | null) => void
- selected, defaultSelected?: string[]
- onSelectionChange?: (selected: string[]) => void
- getRowLabel?: (row: T) => string
- page, perPage, count, total?: number
- defaultPage?: number = 1
- onPageChange?: (page: number) => void
- defaultPerPage?: number = 10
- perPageOptions?: number[]
- onPerPageChange?: (perPage: number) => void
- hoverable?: boolean = true
- labels?: Partial<TableLabels>

### SegmentedControl
Extends Scroller.
Mixins: CommonProps, DisplayProps, FlexProps, SizeProps, SpacingProps, StyleProps.
- buttons: ButtonOption[]
- value, defaultValue, className?: string
- onValueChange?: (value: string, event?: React.MouseEvent<HTMLButtonElement>) => void
- disabled, compact?: boolean = false
- fillWidth, scroll?: boolean = true
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

### Tag
Mixins: CommonProps, DisplayProps, FlexProps, SizeProps, SpacingProps, StyleProps.
Avoid: Passing the same text as label and children — the children are dropped
- tone?: Tone
- variant?: "default" | "gradient" | "announce" = default
- size?: TShirtSizes
- label?: string = ""
- prefixIcon, suffixIcon?: IconName
- href?: string
- arrow, selected, interactive?: boolean
- effect?: boolean = variant === "announce"
- onClick?: MouseEventHandler<HTMLDivElement>
- onRemove?: () => void
- removeButtonProps?: Partial<IconButtonProps>
- as?: "div" | "span"
- children?: ReactNode

### Icon
Mixins: LeafProps.
- name: IconName
- onBackground, onSolid?: `${ColorScheme}-${ColorWeight}`
- size?: TShirtSizes = m
- decorative?: boolean = true
- tooltip?: ReactNode
- tooltipPosition?: "top" | "bottom" | "left" | "right" = top

### LineChart (from `@once-ui-system/core/data`)
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
Mixins: CommonProps, DisplayProps, FlexProps, SizeProps, SpacingProps, StyleProps.
- title, description?: React.ReactNode
- dateRange?: DateRange
- date?: DateConfig
- onDateRangeChange?: (range: DateRange) => void
- presets?: PresetsConfig = { display: true, granularity: "week" }

### RevealFx (from `@once-ui-system/fx`)
Mixins: CommonProps, DisplayProps, FlexProps, SizeProps, SpacingProps, StyleProps.
- children: React.ReactNode
- duration?: number = 2000
- delay?: number = 0
- defaultRevealed?: boolean = false
- translateY?: number | SpacingToken | CSSUnit
- revealed?: boolean
- style?: React.CSSProperties
- className?: string

### Line
Mixins: CommonProps, DisplayProps, FlexProps, SizeProps, SpacingProps, StyleProps.
- vert?: boolean
- style?: React.CSSProperties

### Drawer
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
Mixins: LeafProps.
- label: ReactNode
- icon?: IconName
- prefix?: ReactNode
- badge?: number | ReactNode
- indicator?: boolean

### ToggleButton
Mixins: LeafProps.
- label, children?: ReactNode
- selected, rounded, truncate, disabled?: boolean = false
- variant?: "ghost" | "outline" | "subtle" = ghost
- size?: TShirtSizes
- radius?: RadiusSize
- corners?: "none" | "top" | "right" | "bottom" | "left" | "top-left" | "top-right" | "bottom-right" | "bottom-left"
- horizontal?: "start" | "center" | "end" | "between" = center
- weight?: "default" | "strong" = default
- prefixIcon, suffixIcon?: IconName
- href?: string

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
- onHeightChange?: (height: number) => void
- minHeight?: number

### Skeleton
Mixins: CommonProps, DisplayProps, FlexProps, SizeProps, SpacingProps, StyleProps.
- width, height, minHeight, maxHeight?: number | StaticSpacingToken | CSSUnit
- minWidth, maxWidth?: number | SpacingToken | CSSUnit
- shape?: "line" | "circle" | "block" = line
- size?: "xl" | "l" | "m" | "s" | "xs" = m
- delay?: number
- style?: React.CSSProperties
- className?: string

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
- cursor?: CSSProperties["cursor"] | "interactive" | CursorPresetValue | ReactNode
- blendMode?: BlendMode
- blur, backdropBlur?: BlurSize | number | CSSUnit
- theme?: "light" | "dark"
- themeBorder?: BorderStyle
- themeSolid?: SolidType
- themeSurface?: SurfaceStyle
- radius?: RadiusSize | `${RadiusSize}-${RadiusNest}`

### GridProps
- columns, rows?: GridSize
- minColumnWidth?: number | SpacingToken | CSSUnit
- xl, l, m, s, xs?: GridBreakpointProps

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

### ChartProps
- title, description, emptyState, errorState?: React.ReactNode
- series: SeriesConfig<DataPoint> | SeriesConfig<DataPoint>[]
- data: readonly DataPoint[]
- legend?: LegendConfig
- date?: DateConfig
- error, tooltip, loading?: boolean
- grid, axis?: "x" | "y" | "both" | "none"
- variant?: ChartVariant

## Types

```ts
// type BarWidth is one of these strings: number s xl l m xs fill
type BaseColor = Exclude<ColorValue, string & {}> | "page" | "surface" | "overlay" | "transparent"
type BlendMode = "color" | "screen" | "normal" | "multiply" | "overlay" | "darken" | "lighten" | "difference" | "exclusion" | "hue" | "saturation" | "luminosity" | `color-${"dodge" | "burn"}` | "hard-light" | "soft-light" | "plus-lighter"
type BlurSize = "s" | "xl" | "l" | "m" | "xs"
type BorderStyle = "rounded" | "playful" | "conservative" | "sharp"
type BreakpointKey = "s" | "xl" | "l" | "m" | "xs"
type ButtonOption = LeafProps & { value: string; description?: ReactNode; label?: ReactNode; children?: ReactNode; horizontal?: "start" | "center" | "end" | "between"; radius?: RadiusSize; size?: TShirtSizes; disabled?: boolean; corners?: "none" | "top" | "right" | "bottom" | "left" | "top-left" | "top-right" | "bottom-right" | "bottom-left"; variant?: "ghost" | "outline" | "subtle"; weight?: "default" | "strong"; truncate?: boolean; href?: string; rounded?: boolean; prefixIcon?: IconName; suffixIcon?: IconName }
// type ButtonVariant is one of these strings: link ghost subtle primary secondary tertiary
type CSSUnit = `${number}px` | `${number}rem` | `${number}em` | `${number}ch` | `${number}%` | `${number}vh` | `${number}vw` | `${number}dvh` | `${number}dvw` | `${number}svh` | `${number}svw` | `${number}lvh` | `${number}lvw` | `${number}vmin` | `${number}vmax` | `${number}cqw` | `${number}cqh` | `calc(${string})` | `min(${string})` | `max(${string})` | `clamp(${string})` | `var(${string})`
type ChartVariant = "flat" | "outline" | "gradient"
// type ColorScheme is one of these strings: neutral brand accent info danger warning success
type ColorValue = Exclude<BaseColor, "page" | "surface" | "overlay" | "transparent"> | string & {}
type ColorWeight = "strong" | "medium" | "weak"
type Colors = Exclude<ColorValue, string & {}>
type ColumnHide = Partial<Record<BreakpointKey, boolean>>
type CursorPresetValue = "rounded" | "soft" | "dot" | "system"
type DataPoint = { [key: string]?: string | number | Date | undefined; label?: string }
type DataStyle = "categorical" | "divergent" | "sequential"
type DateConfig = { start?: Date; end?: Date; max?: Date; min?: Date; dual?: boolean; format?: string; presets?: PresetsConfig; selector?: boolean; onChange?: (range: DateRange) => void }
type DateRange = { startDate?: Date; endDate?: Date }
type DotsProps = { display?: boolean; opacity?: DisplayProps["opacity"]; color?: ColorValue; size?: SpacingToken }
// type FieldSize is one of these strings: s xl l m xs xxs
// type FlexBreakpointProps: an object of these Flex props, all optional (padding* is padding, paddingX, paddingTop and the rest):
// center style direction horizontal vertical wrap flex textVariant background solid border* radius shadow padding* margin* gap top right bottom left width height maxWidth minWidth minHeight maxHeight fit* fill* aspectRatio onBackground onSolid align hide pointerEvents position overflow* scrollbar transition opacity zIndex
// type FlexValue is one of these strings: 0 1 10 2 3 4 9 12 5 8 6 7 11
type GradientProps = { display?: boolean; opacity?: DisplayProps["opacity"]; x?: number | CSSUnit; y?: number | CSSUnit; width?: number | CSSUnit; height?: number | CSSUnit; tilt?: number; colorStart?: ColorValue; colorEnd?: ColorValue }
// type GridBreakpointProps: an object of these Grid props, all optional (padding* is padding, paddingX, paddingTop and the rest):
// style textVariant background solid border* radius shadow padding* margin* gap top right bottom left width height maxWidth minWidth minHeight maxHeight fit* fill* aspectRatio onBackground onSolid align hide pointerEvents position overflow* scrollbar transition opacity zIndex columns rows
// type GridSize is one of these strings: 1 10 2 3 4 9 12 5 8 6 7 11
type IconButtonProps = IconButton props
// type IconName is one of these names, and only these:
// symbol code link menu search time video filter image security opacity info danger warning adjustments arrowDown arrowLeft arrowRight arrowUp arrowUpRight ball banknotes barChart bell bolt book bookmark calendar cart chat check checkbox chevronDoubleLeft chevronDoubleRight chevronDown chevronLeft chevronRight chevronUp chevronsLeftRight clipboard close computer copy cube dark dislike document download edit enter eye eyeDropper eyeOff file flag folder food forward gift globe grid grip heart help home inbox light like linearGauge lock logout mail mapPin maximize minimize minus moreHorizontal newspaper organization pause paw payment people person personRemove phone play plus radialGauge refresh return screen send settings smiley sparkle star starFill store tag trash trend trendDown trendUp upload volume volumeOff wordmark world
type LegendConfig = { display?: boolean; direction?: "row" | "column"; position?: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "top-center" | "bottom-center" }
type LinesProps = { display?: boolean; opacity?: DisplayProps["opacity"]; size?: SpacingToken; thickness?: number; angle?: number; color?: ColorValue }
type MaskProps = Mask props
// type Opacity is one of these strings: 0 10 20 30 40 50 60 70 80 90 100
type PresetsConfig = { display: boolean; granularity: "year" | "month" | "week" }
type RadiusNest = "4" | "8"
// type RadiusSize is one of these strings: s xl l m xs none full
type ScrollTrackControlPlacement = `${"top" | "bottom"}-${"end" | "start" | "center" | "between"}`
type ScrollerAuto = { speed?: Speed; hover?: "slow" | "pause" | "none"; reverse?: boolean; gap?: number | string }
type ScrollerLabels = { previous?: string; next?: string }
type SeriesConfig = { key: SeriesKey<DataPoint>; color?: ColorValue }
type SeriesKey = Extract<keyof T, string>
type ShadowSize = "s" | "xl" | "l" | "m" | "xs"
type SolidType = "color" | "contrast" | "inverse"
// type SpacingToken is one of these strings: s xl l m xs 0 32 1 2 4 64 160 12 8 16 20 24 40 48 56 72 80 104 128
type Speed = "number" | "medium" | "slow" | "fast"
// type StaticSpacingToken is one of these strings: 0 32 1 2 4 64 160 12 8 16 20 24 40 48 56 72 80 104 128
// type StatusIndicatorScheme is one of these strings: blue indigo violet magenta pink red orange yellow moss green emerald aqua cyan sand gray slate rose mint dusk
type SurfaceStyle = "filled" | "translucent"
type TShirtSizes = "s" | "xl" | "l" | "m" | "xs"
type TableAction = { icon: string; label?: string; tooltip?: string; variant?: "primary" | "secondary" | "tertiary" | "ghost"; tone?: Tone; onClick: (row: unknown, index: number) => void; disabled?: (row: unknown, index: number) => boolean }
type TableColumn = { key: string; header: ReactNode; cell?: (row: T, index: number) => ReactNode; sortable?: boolean; sort?: (a: T, b: T) => number; align?: "left" | "center" | "right"; width?: string; label?: string; filter?: TableColumnFilter<T>; hide?: ColumnHide }
type TableColumnFilter = { options: { value: string; label: ReactNode }[]; multiple?: boolean; match?: (row: T, value: TableFilterValue) => boolean }
type TableFilterValue = "string" | "string[]"
type TableFilters = { [key: string]?: TableFilterValue }
type TableLabels = { selectAll: string; selectRow: string; pagination: string; search: string; actions: string; filterAll: string; columns: string; noResults: string; noResultsHint: string; clearFilters: string; results: (count: number) => string; previous: string; next: string; first: string; last: string; perPage: string }
type TableQuery = { page: number; perPage: number; sort: TableSort | null; search: string; filters: TableFilters }
type TableSort = { key: string; direction: "asc" | "desc" }
type TextBreakpointHide = { hide?: boolean }
type TextType = "body" | "code" | "label" | "heading" | "display"
type TextVariant = `${"body" | "code" | "label" | "heading" | "display"}-${"strong" | "default" | "normal" | "medium"}-${"xl" | "xs" | "s" | "l" | "m"}`
type TextWeight = "strong" | "default" | "normal" | "medium"
type ToastContextProps = { toasts: Toast[]; addToast: (toast: Omit<Toast, "id">) => string; removeToast: (id: string) => void }
// type Tone is one of these strings: neutral brand accent info danger warning success
type UserSelect = "text" | "auto" | "none" | "all"
// type curveType is one of these strings: step linear basis basisClosed basisOpen bumpX bumpY bump linearClosed natural monotoneX monotoneY monotone stepBefore stepAfter
```

## Gotchas

- The x axis reads the first key of data[0] that is not a series key (date, label, month). Put that key first in every point and list only the plotted keys in series: series={[{ key: "visitors" }]} with data={[{ date: "Oct 1", visitors: 1840 }]}.
- x/y are percent positions of the container (50/50 = center).
- StatusIndicator takes scheme="green" | "red" | "orange" | "sand" etc., a fixed palette hue, or tone="success" | "danger" | "brand" etc., a theme role that follows the theme; not color, its 2.x name, and not variant. Avatar's statusIndicator is { scheme } or { tone }.
- Never cast an icon name with `as IconName`: the cast compiles a name the registry does not have, and it renders nothing. Use a name from iconNames; in data, type the field as IconName ({ icon: IconName }[]) or write the literal `as const`, so the type check still runs.
- Field heights run a step above Button's: Input size xs is 40px, s 48px, m 56px (the default). A field beside a size="s" Button (32px), as in a toolbar or filter row, takes size="xxs", which is 32px too; Form size="xxs" sets it for every field inside. An xxs field has no floating label: label shows as the placeholder, so keep label for the accessible name.
- Fixed in 2.1: a Button or IconButton that is a Dropdown trigger renders a real <button type="button"> with aria-haspopup and aria-expanded, so it is reachable by keyboard. Pass it as trigger as is; do not add type="button" or a no-op onClick, or wrap it in a focusable Row, to make it one.
- Pass a Tag's text once, as label or as children — with both, the children are dropped. Badge and Chip are Tag in 3.0.
- Write 2.x prop names, not 1.x ones from memory: open (not isOpen), checked (not isChecked), SegmentedControl value/onValueChange/defaultValue (not selected/onToggle/defaultSelected), Tag tone (not scheme or variant), Button tone="danger" (not variant="danger"), Text/Heading textVariant (not variant), field size/prefix/suffix/corners (not height/hasPrefix/hasSuffix/radius). The validator names the 2.x prop.
- Tag is a div by default; inside a sentence (<Text as="p">, <p>) give it as="span".
- overflow="hidden" on full-bleed sections clips glows into hard bands — only use when parent has radius.
- Leaf components (Button, IconButton, ToggleButton, the fields, Switch, Checkbox, RadioButton, Text, Heading, Icon, Avatar, Spinner, StatusIndicator, Kbd, InlineCode, ProgressBar, Logo, SmartLink, NavIcon) take only margins, flex, fillWidth, position, top/right/bottom/left, className and style besides their own props. Padding, background, border, radius, sizes, hide and breakpoints go on a Row around it (a Column around Text or Heading; <Row fit> for an Icon's box).

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
    <Column s={{ hide: true }} maxWidth="18rem" fitHeight position="sticky" top="56">
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
  Grid,
  Heading,
  Icon,
  Line,
  Row,
  SegmentedControl,
  StatusIndicator,
  Table,
  Tag,
  Text,
  useInViewport,
} from "@once-ui-system/core";
import { CountFx, RevealFx } from "@once-ui-system/fx";
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

// Rows as arrays of cells: each column shows the cell at its position.
const activity = {
  columns: [
    { header: "Event", key: "event" },
    { header: "User", key: "user" },
    { header: "Status", key: "status" },
    { header: "Time", key: "time" },
  ],
  rows: [
    [
      "Plan upgraded to Pro",
      "jane@acme.co",
      <Tag size="s" tone="success">
        Completed
      </Tag>,
      "2m ago",
    ],
    [
      "New signup",
      "alex@studio.io",
      <Tag size="s" tone="brand">
        New
      </Tag>,
      "14m ago",
    ],
    [
      "Payment failed",
      "ops@build.dev",
      <Tag size="s" tone="danger">
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
            <Text textVariant="label-default-s" onBackground="brand-medium">
              Analytics
            </Text>
            <Heading as="h1" textVariant="display-strong-s">
              Overview
            </Heading>
          </Column>
          <SegmentedControl
            value={range}
            onValueChange={setRange}
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
                  <Text textVariant="label-default-s" onBackground="neutral-weak">
                    {stat.label}
                  </Text>
                  <StatusIndicator scheme={stat.up ? "green" : "orange"} />
                </Row>
                <Row vertical="end" gap="4">
                  {stat.prefix && <Text textVariant="display-strong-xs">{stat.prefix}</Text>}
                  <CountFx
                    textVariant="display-strong-xs"
                    value={seen ? stat.value : 0}
                    duration={1200}
                    separator=","
                  />
                  {stat.suffix && <Text textVariant="display-strong-xs">{stat.suffix}</Text>}
                </Row>
                <Text
                  textVariant="label-default-s"
                  onBackground={stat.up ? "success-medium" : "warning-medium"}
                >
                  {stat.change}
                </Text>
              </Column>
            </RevealFx>
          ))}
        </Grid>

        <Grid columns="2" gap="24" s={{ columns: 1 }}>
          <Column background="surface" border radius="l" padding="24" gap="16" minHeight="32rem">
            <Heading as="h2" textVariant="heading-strong-s">
              Revenue trend
            </Heading>
            <Column flex={1} center background="neutral-alpha-weak" radius="m" padding="48">
              <Icon name="linearGauge" size="l" onBackground="neutral-weak" />
              <Text textVariant="label-default-s" onBackground="neutral-weak">
                Chart area — use recharts or your data viz module
              </Text>
            </Column>
          </Column>
          <Column background="surface" border radius="l" padding="24" gap="16" minHeight="32rem">
            <Heading as="h2" textVariant="heading-strong-s">
              Signups by channel
            </Heading>
            <Column flex={1} center background="neutral-alpha-weak" radius="m" padding="48">
              <Icon name="radialGauge" size="l" onBackground="neutral-weak" />
              <Text textVariant="label-default-s" onBackground="neutral-weak">
                Chart area
              </Text>
            </Column>
          </Column>
        </Grid>

        <Column background="surface" border radius="l" padding="24" gap="24">
          <Row fillWidth horizontal="between" vertical="center">
            <Heading as="h2" textVariant="heading-strong-s">
              Recent activity
            </Heading>
            <Button variant="tertiary" size="s" label="View all" />
          </Row>
          <Line />
          <Table
            fillWidth
            aria-label="Recent activity"
            columns={activity.columns}
            rows={activity.rows}
          />
        </Column>
      </Column>
    </Column>
  );
}
```
