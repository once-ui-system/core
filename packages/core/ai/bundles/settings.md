# Settings page

Vertical section tabs, profile form, settings rows with one control each, grouped sub-settings, danger zone

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

### Heading
Mixins: CommonProps, LeafProps, TextProps.
Avoid: Layout props: it takes padding, margin, flex and s={{ hide }} but no other breakpoint props, border, radius or background; wrap it in a Row for those. A key cap is Kbd
- wrap?: CSSProperties["textWrap"] = balance
- opacity?: Opacity

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

### Tabs
Mixins: CommonProps, DisplayProps, FlexProps, SizeProps, SpacingProps, StyleProps.
- value, defaultValue?: string
- onValueChange?: (value: string) => void
- orientation?: "horizontal" | "vertical" = horizontal
- activation?: "automatic" | "manual" = automatic
- children?: ReactNode

### TabList
Mixins: CommonProps, DisplayProps, FlexProps, SizeProps, SpacingProps, StyleProps.
- children?: ReactNode

### Tab
Extends ToggleButton.
Mixins: LeafProps.
- value: string
- children?: ReactNode
- disabled?: boolean = false

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

### TabPanel
Mixins: CommonProps, DisplayProps, FlexProps, SizeProps, SpacingProps, StyleProps.
- value: string
- keepMounted?: boolean = false
- children?: ReactNode

### Form
- density?: "stacked" | "tight" | "spacious" = tight
- columns?: FormColumns
- size?: FieldSize
- as?: "div" | "form" = div
- onSubmit?: (event: React.FormEvent<HTMLFormElement>) => unknown
- pending?: boolean
- className?: string
- style?: React.CSSProperties
- children?: React.ReactNode

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

### Select
Extends Input, Dropdown.
Mixins: LeafProps.
- options: SelectOptionType[]
- value, defaultValue?: string | string[]
- onValueChange?: (value: string | string[]) => void
- open?: boolean
- defaultOpen, searchable, multiple?: boolean = false
- onOpenChange?: (open: boolean) => void
- emptyState?: ReactNode = No results
- placement?: Placement
- labels?: SelectLabels
- fillWidth?: boolean = true

### Dropdown
- fillWidth, disabled, contents, closeAfterClick, handleArrowNavigation, open, nested, disableTriggerClick?: boolean
- minWidth, maxWidth, minHeight?: number | CSSUnit
- placement?: Placement
- trigger: ReactNode
- children?: ReactNode
- openOn?: "click" | "contextmenu" = click
- selectedOption, className, dropdownId?: string
- style?: React.CSSProperties
- onSelect?: (value: string) => void
- onOpenChange?: (open: boolean) => void
- navigationLayout?: NavigationLayout
- columns?: number | string
- optionsCount?: number
- onFocusCapture, onBlurCapture?: React.FocusEventHandler<HTMLDivElement>

### Setting
Mixins: CommonProps, DisplayProps, FlexProps, SizeProps, SpacingProps, StyleProps.
- label, description, info?: React.ReactNode
- controlWidth, axisWidth?: number | CSSUnit
- children, control?: ReactNode
- axes?: { label: React.ReactNode; control: React.ReactNode }[]
- open?: boolean

### Tooltip
Mixins: CommonProps, DisplayProps, FlexProps, SizeProps, SpacingProps, StyleProps.
- label, content, children?: ReactNode
- size?: React.ComponentProps<typeof Icon>["size"]
- placement?: Placement
- delay?: number
- prefixIcon, suffixIcon?: IconName
- className?: string
- style?: React.CSSProperties

### Switch
Mixins: LeafProps.
- size?: TShirtSizes
- error, auto, checked, disabled?: boolean
- errorMessage?: ReactNode
- label, description?: React.ReactNode
- id, name, value?: string
- iconButtonProps?: IconButtonProps
- defaultChecked, loading, reverse?: boolean = false
- onCheckedChange?: (checked: boolean) => void

### Slider
Mixins: LeafProps.
- range?: boolean
- value, defaultValue?: number | [number, number]
- onValueChange?: ((value: number) => void) | ((value: [number, number]) => void)
- onValueCommit?: (value: number) => void
- min?: number = 0
- max?: number = 100
- step?: number = 1
- label?: string
- showValue, disabled, error?: boolean = false
- errorMessage?: ReactNode
- size?: TShirtSizes
- minDistance?: number
- formatValue?: (value: number) => string
- thumbLabels?: [string, string]

### NumberInput
Extends Input.
Mixins: LeafProps.
- value, defaultValue, min, max, padStart?: number
- onValueChange?: (value: number) => void
- step?: number = 1

### Checkbox
Mixins: LeafProps.
- size?: TShirtSizes
- error, disabled, auto, checked?: boolean
- errorMessage?: ReactNode
- label, description?: React.ReactNode
- id?: string
- iconButtonProps?: IconButtonProps
- defaultChecked, indeterminate?: boolean = false
- onCheckedChange?: (checked: boolean) => void
- hoverable?: boolean = true

### MediaUpload (from `@once-ui-system/core/media`)
Mixins: CommonProps, DisplayProps, FlexProps, SizeProps, SpacingProps, StyleProps.
- onFileUpload?: (file: File) => Promise<void>
- compress?: boolean = true
- aspectRatio?: string = 16 / 9
- className?: string
- style?: React.CSSProperties
- initialPreviewImage?: string | null = null
- emptyState?: React.ReactNode = Drag and drop or click to browse
- quality?: number = 0.8
- sizes?: string | number
- children?: React.ReactNode
- convertTypes?: string[] = ["image/png", "image/webp", "image/jpg"]
- resizeMaxWidth, resizeMaxHeight?: number = 1920
- resizeWidth, resizeHeight?: number = 1200
- loading?: boolean = false
- accept?: string = image/*

### Avatar
Mixins: LeafProps.
- size?: TShirtSizes | number | CSSUnit = m
- value, src?: string
- unoptimized, loading, empty?: boolean
- icon?: IconName
- statusIndicator?: { scheme: StatusIndicatorScheme; tone?: undefined } | { tone: Tone; scheme?: undefined }
- style?: CSSProperties = {}

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

### NavItem
Extends ToggleButton.
Mixins: LeafProps.
- label: ReactNode
- icon?: IconName
- prefix?: ReactNode
- badge?: number | ReactNode
- indicator?: boolean

### Grid
Mixins: CommonProps, DisplayProps, GridProps, SizeProps, SpacingProps, StyleProps.
- as?: ElementType
- position?: CSSProperties["position"] = relative
- scrollbar?: "default" | "minimal" = minimal
- masonry?: boolean

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

### Icon
Mixins: LeafProps.
- name: IconName
- onBackground, onSolid?: `${ColorScheme}-${ColorWeight}`
- size?: TShirtSizes = m
- decorative?: boolean = true
- tooltip?: ReactNode
- tooltipPosition?: "top" | "bottom" | "left" | "right" = top

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
- cursor?: CSSProperties["cursor"] | "interactive" | ReactNode
- blendMode?: BlendMode
- blur, backdropBlur?: BlurSize | number | CSSUnit
- theme?: "light" | "dark"
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
type BlendMode = "color" | "screen" | "normal" | "multiply" | "overlay" | "darken" | "lighten" | "difference" | "exclusion" | "hue" | "saturation" | "luminosity" | `color-${"dodge" | "burn"}` | "hard-light" | "soft-light" | "plus-lighter"
type BlurSize = "s" | "xl" | "l" | "m" | "xs"
type BorderStyle = "rounded" | "playful" | "conservative" | "sharp"
type Breakpoint = "s" | "xl" | "l" | "m" | "xs"
type BreakpointKey = "s" | "xl" | "l" | "m" | "xs"
// type ButtonVariant is one of these strings: link ghost subtle primary secondary tertiary
type CSSUnit = `${number}px` | `${number}rem` | `${number}em` | `${number}ch` | `${number}%` | `${number}vh` | `${number}vw` | `${number}dvh` | `${number}dvw` | `${number}svh` | `${number}svw` | `${number}lvh` | `${number}lvw` | `${number}vmin` | `${number}vmax` | `${number}cqw` | `${number}cqh` | `calc(${string})` | `min(${string})` | `max(${string})` | `clamp(${string})` | `var(${string})`
// type ColorScheme is one of these strings: neutral brand accent info danger warning success
type ColorWeight = "strong" | "medium" | "weak"
type Colors = `${"neutral" | "brand" | "accent" | "info" | "danger" | "warning" | "success"}-${"strong" | "medium" | "weak"}` | `${"neutral" | "brand" | "accent" | "info" | "danger" | "warning" | "success"}-alpha-${"strong" | "medium" | "weak"}`
type ColumnHide = Partial<Record<BreakpointKey, boolean>>
// type FieldSize is one of these strings: s xl l m xs xxs
// type FlexBreakpointProps: an object of these Flex props, all optional (padding* is padding, paddingX, paddingTop and the rest):
// center style direction horizontal vertical wrap flex textVariant background solid border* radius shadow padding* margin* gap top right bottom left width height maxWidth minWidth minHeight maxHeight fit* fill* aspectRatio onBackground onSolid align hide pointerEvents position overflow* scrollbar transition opacity zIndex
// type FlexValue is one of these strings: 0 1 10 2 3 4 9 12 5 8 6 7 11
type FormColumns = "number" | Partial<Record<Breakpoint, number>>
// type GridBreakpointProps: an object of these Grid props, all optional (padding* is padding, paddingX, paddingTop and the rest):
// style textVariant background solid border* radius shadow padding* margin* gap top right bottom left width height maxWidth minWidth minHeight maxHeight fit* fill* aspectRatio onBackground onSolid align hide pointerEvents position overflow* scrollbar transition opacity zIndex columns rows
// type GridSize is one of these strings: 1 10 2 3 4 9 12 5 8 6 7 11
type IconButtonProps = IconButton props
// type IconName is one of these names, and only these:
// symbol code link menu search time video filter image security opacity info danger warning adjustments arrowDown arrowLeft arrowRight arrowUp arrowUpRight ball banknotes barChart bell bolt book bookmark calendar cart chat check checkbox chevronDoubleLeft chevronDoubleRight chevronDown chevronLeft chevronRight chevronUp chevronsLeftRight clipboard close computer copy cube dark dislike document download edit enter eye eyeDropper eyeOff file flag folder food forward gift globe grid grip heart help home inbox light like linearGauge lock logout mail mapPin maximize minimize minus moreHorizontal newspaper organization pause paw payment people person personRemove phone play plus radialGauge refresh return screen send settings smiley sparkle star starFill store tag trash trend trendDown trendUp upload volume volumeOff wordmark world
type NavigationLayout = "grid" | "row" | "column"
// type Opacity is one of these strings: 0 10 20 30 40 50 60 70 80 90 100
type OptionProps = Option props
type Placement = "top" | "right" | "bottom" | "left" | `${"top" | "right" | "bottom" | "left"}-${"end" | "start"}`
type RadiusNest = "4" | "8"
// type RadiusSize is one of these strings: s xl l m xs none full
type SelectLabels = { search?: string; clear?: string }
type SelectOptionType = Omit<OptionProps, "selected">
type ShadowSize = "s" | "xl" | "l" | "m" | "xs"
type SolidType = "color" | "contrast" | "inverse"
// type SpacingToken is one of these strings: s xl l m xs 0 32 1 2 4 64 160 12 8 16 20 24 40 48 56 72 80 104 128
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
```

## Gotchas

- Fixed in 2.1: Select closes on pick and stays closed — focus returning to the field no longer reopens it — and a multiple Select stays open while picking. Use Select with value and onValueChange; do not build a local picker from Dropdown and Options to get this.
- Fixed in 2.1: NumberInput follows its value prop after mount (an undo, a reset, a change made elsewhere) without rewriting what the user is typing. Pass value and onValueChange; do not remount it with a key to push a new value in.
- Never cast an icon name with `as IconName`: the cast compiles a name the registry does not have, and it renders nothing. Use a name from iconNames; in data, type the field as IconName ({ icon: IconName }[]) or write the literal `as const`, so the type check still runs.
- Field heights run a step above Button's: Input size xs is 40px, s 48px, m 56px (the default). A field beside a size="s" Button (32px), as in a toolbar or filter row, takes size="xxs", which is 32px too; Form size="xxs" sets it for every field inside. An xxs field has no floating label: label shows as the placeholder, so keep label for the accessible name.
- Fixed in 2.1: a Button or IconButton that is a Dropdown trigger renders a real <button type="button"> with aria-haspopup and aria-expanded, so it is reachable by keyboard. Pass it as trigger as is; do not add type="button" or a no-op onClick, or wrap it in a focusable Row, to make it one.
- Fixed in 2.1: a context menu is <Dropdown openOn="contextmenu" trigger={region}>{options}</Dropdown> (2.x ContextMenu): a real menu (menu and menuitem roles, arrow keys, Home/End, Escape returns focus) that opens at the pointer and stays on screen. The trigger region gets a box; set contents to render none (display: contents), so an absolutely positioned or grid/flex child keeps its own layout. Use it instead of a hand-made right-click menu.
- Pass a Tag's text once, as label or as children — with both, the children are dropped. Badge and Chip are Tag in 3.0.
- Write 2.x prop names, not 1.x ones from memory: open (not isOpen), checked (not isChecked), SegmentedControl value/onValueChange/defaultValue (not selected/onToggle/defaultSelected), Tag tone (not scheme or variant), Button tone="danger" (not variant="danger"), Text/Heading textVariant (not variant), field size/prefix/suffix/corners (not height/hasPrefix/hasSuffix/radius). The validator names the 2.x prop.
- Tag is a div by default; inside a sentence (<Text as="p">, <p>) give it as="span".
- overflow="hidden" on full-bleed sections clips glows into hard bands — only use when parent has radius.
- Leaf components (Button, IconButton, ToggleButton, the fields, Switch, Checkbox, RadioButton, Text, Heading, Icon, Avatar, Spinner, StatusIndicator, Kbd, InlineCode, ProgressBar, Logo, SmartLink, NavIcon) take only margins, flex, fillWidth, position, top/right/bottom/left, className and style besides their own props. Padding, background, border, radius, sizes, hide and breakpoints go on a Row around it (a Column around Text or Heading; <Row fit> for an Icon's box).

## Quality bar

- Tabs orientation="vertical" with s={{ direction: "column" }} (and the TabList s={{ direction: "row" }}), one TabPanel per section, keepMounted on a form panel. Sections that are routes use NavItem href instead
- One Setting per control — label and description left, control right. A list of Settings needs no surface around it
- Setting with a header control and open={enabled}, so sub-settings sit inside its box; Setting axes={…} for X/Y pairs
- info on a Setting (a Tooltip with content and no children: an info icon) instead of a description line that is only needed once
- Profile fields in a Form (columns per breakpoint), not hand-spaced Columns
- background="surface" border radius="l" padding="24"
- border="danger-alpha-medium" on danger actions only

## Gold example (`examples/settings.tsx`)

```tsx
"use client";

/**
 * Gold example: settings
 * Target: a vertical tab list beside the panel (above it on a phone), a
 * profile form, settings rows with one control each, a group whose
 * sub-settings sit inside it, and a danger zone.
 *
 * The section nav is `Tabs` with `orientation="vertical"`: one `TabPanel` per
 * section, so only the chosen section renders, the list gets the tab roles
 * and arrow keys, and a phone gets the list above the panel from one
 * breakpoint prop. Sections that are routes of their own use `NavItem href`
 * instead. `keepMounted` keeps the profile form's unsaved input when the
 * user looks at another tab.
 *
 * `Setting` is the row — label and description on the left, one control on
 * the right — and stacks into a panel on its own, so a list of them needs no
 * surface around it. With `control` and `open` it is a group that keeps its sub-settings inside its box,
 * which is what keeps the relationship readable in a long panel.
 */
import {
  Avatar,
  Button,
  Column,
  Form,
  Heading,
  Input,
  NumberInput,
  Row,
  Select,
  Setting,
  Switch,
  Tab,
  TabList,
  TabPanel,
  Tabs,
  Text,
  useToast,
} from "@once-ui-system/core";
import { useState } from "react";

export function SettingsExample() {
  // addToast is stable: call it from handlers and effects directly.
  const { addToast } = useToast();
  const [timezone, setTimezone] = useState("utc");
  const [updates, setUpdates] = useState(true);
  const [digest, setDigest] = useState(true);
  const [digestHour, setDigestHour] = useState(9);

  return (
    <Column as="main" fillWidth horizontal="center" paddingY="48" paddingX="24">
      <Column maxWidth="l" gap="40">
        <Column gap="12">
          <Text textVariant="label-default-s" onBackground="brand-medium">
            Settings
          </Text>
          <Heading as="h1" textVariant="display-strong-s">
            Manage your workspace
          </Heading>
        </Column>

        <Tabs defaultValue="profile" orientation="vertical" gap="32" s={{ direction: "column" }}>
          <TabList aria-label="Settings sections" minWidth="14rem" s={{ direction: "row" }}>
            <Tab value="profile" size="l" prefixIcon="person">
              Profile
            </Tab>
            <Tab value="notifications" size="l" prefixIcon="bell">
              Notifications
            </Tab>
            <Tab value="workspace" size="l" prefixIcon="settings">
              Workspace
            </Tab>
          </TabList>

          <TabPanel value="profile" keepMounted>
            <Column background="surface" border radius="l" padding="24" gap="24">
              <Heading as="h2" textVariant="heading-strong-m">
                Profile
              </Heading>
              <Row gap="16" vertical="center">
                <Avatar size="l" value="AP" />
                <Column gap="8">
                  <Button size="s" variant="secondary">
                    Upload photo
                  </Button>
                  <Text textVariant="label-default-s" onBackground="neutral-weak">
                    JPG or PNG, max 2 MB
                  </Text>
                </Column>
              </Row>
              <Form
                as="form"
                columns={{ xl: 2, s: 1 }}
                onSubmit={(event) => event.preventDefault()}
              >
                <Input id="name" label="Display name" />
                <Input id="email" label="Email" type="email" />
                <Select
                  id="timezone"
                  label="Timezone"
                  value={timezone}
                  onValueChange={(value) => setTimezone(value as string)}
                  options={[
                    { value: "utc", label: "UTC" },
                    { value: "cet", label: "Central European Time" },
                    { value: "est", label: "Eastern Time" },
                  ]}
                />
              </Form>
              <Row gap="12">
                <Button onClick={() => addToast({ tone: "success", message: "Profile saved" })}>
                  Save changes
                </Button>
                <Button variant="secondary">Cancel</Button>
              </Row>
            </Column>
          </TabPanel>

          <TabPanel value="notifications" gap="8">
            <Heading as="h2" textVariant="heading-strong-m" marginBottom="8">
              Notifications
            </Heading>
            <Setting label="Product updates" description="Release notes and changelog">
              <Switch
                checked={updates}
                onCheckedChange={() => setUpdates(!updates)}
                aria-label="Product updates"
              />
            </Setting>
            <Setting
              label="Weekly digest"
              info="A summary of the week's activity, sent once."
              control={
                <Switch
                  checked={digest}
                  onCheckedChange={() => setDigest(!digest)}
                  aria-label="Weekly digest"
                />
              }
              open={digest}
            >
              <Setting label="Send at" description="Hour of the day, in your timezone">
                <NumberInput
                  id="digest-hour"
                  min={0}
                  max={23}
                  value={digestHour}
                  onValueChange={setDigestHour}
                />
              </Setting>
            </Setting>
          </TabPanel>

          <TabPanel value="workspace">
            <Column
              background="surface"
              border="danger-alpha-medium"
              radius="l"
              padding="24"
              gap="16"
            >
              <Heading as="h2" textVariant="heading-strong-m" onBackground="danger-medium">
                Danger zone
              </Heading>
              <Text textVariant="body-default-s" onBackground="neutral-weak">
                Permanently delete your workspace and all associated data.
              </Text>
              <Row>
                <Button tone="danger" size="s">
                  Delete workspace
                </Button>
              </Row>
            </Column>
          </TabPanel>
        </Tabs>
      </Column>
    </Column>
  );
}
```
