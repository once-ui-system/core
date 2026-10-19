# App shell

Signed-in app frame shared by several routes: sidebar with nested nav groups and the current route highlighted, header with breadcrumb, account or workspace menu and command palette, phone drawer

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

### Nav
Extends Column, Flex.
Mixins: CommonProps, DisplayProps, FlexProps, SizeProps, SpacingProps, StyleProps.
- density?: NavDensity = normal
- variant?: NavVariant = solid
- rail?: boolean = true

### NavGroup
Extends Flex.
Mixins: CommonProps, DisplayProps, FlexProps, SizeProps, SpacingProps, StyleProps.
- label, children: ReactNode
- icon?: IconName
- open?: boolean
- onToggle?: () => void
- defaultOpen, selected?: boolean = false

### NavItem
Extends ToggleButton.
- label: ReactNode
- icon?: IconName
- badge?: number
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

### Breadcrumbs
Extends Flex.
Mixins: CommonProps, DisplayProps, FlexProps, SizeProps, SpacingProps, StyleProps.
- items: BreadcrumbItem[]
- separator?: ReactNode = <Icon name="chevronRight" size="xs" />
- maxItems?: number
- aria-label?: string

### UserMenu
Extends User, DropdownWrapper.
- selected?: boolean = false
- placement?: Placement
- dropdown?: React.ReactNode
- className?: string
- style?: React.CSSProperties

### User
- name, tag, className?: string
- children, subline?: React.ReactNode
- tagProps?: TagProps = {}
- loading?: boolean = false
- avatarProps?: AvatarProps = {}

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

### Kbar
- items: KbarItem[]
- children?: React.ReactNode
- inputSize?: TShirtSizes
- open?: boolean
- onOpenChange?: (open: boolean) => void

### Kbd
Extends Flex.
Mixins: CommonProps, DisplayProps, FlexProps, SizeProps, SpacingProps, StyleProps.
- label, className?: string
- children?: ReactNode
- style?: React.CSSProperties

### KeyTip
Extends Flex.
Mixins: CommonProps, DisplayProps, FlexProps, SizeProps, SpacingProps, StyleProps.
- keys: string | readonly string[]
- label?: ReactNode

### Line
Extends Flex.
Mixins: CommonProps, DisplayProps, FlexProps, SizeProps, SpacingProps, StyleProps.
- vert?: boolean
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

### Grid
Mixins: CommonProps, DisplayProps, GridProps, SizeProps, SpacingProps, StyleProps.
- xl, l, m, s, xs?: GridBreakpointProps
- position?: CSSProperties["position"] = relative
- scrollbar?: "default" | "minimal" = minimal

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
- statusIndicator?: { color: "green" | "yellow" | "red" | "gray"; }
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

- `selectNavHref`: `(pathname: string, hrefs: string[]) => string | null`
- `useTheme`: `() => ThemeProviderState`
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
- padding, paddingLeft, paddingRight, paddingTop, paddingBottom, paddingX, paddingY, margin, marginLeft, marginRight, marginTop, marginBottom, marginX, marginY?: SpacingToken | number
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
- cursor?: CSSProperties["cursor"] | "interactive" | ReactNode
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
type AvatarProps = Avatar props
type BlendMode = "color" | "normal" | "screen" | "overlay" | "multiply" | "darken" | "lighten" | "difference" | "exclusion" | "hue" | "saturation" | "luminosity" | `color-${"dodge" | "burn"}` | "hard-light" | "soft-light" | "plus-lighter"
type BlurSize = "xl" | "l" | "m" | "s" | "xs"
type BorderStyle = "rounded" | "playful" | "conservative" | "sharp"
type BreadcrumbItem = { label: ReactNode; href?: string; prefixIcon?: IconName }
type CSSUnit = `${number}px` | `${number}rem` | `${number}em` | `${number}%` | `${number}vh` | `${number}dvh` | `${number}vw` | `calc(${string})`
// type ColorScheme is one of these strings: neutral brand accent info danger warning success
type ColorWeight = "weak" | "medium" | "strong"
type Colors = `${"neutral" | "brand" | "accent" | "info" | "danger" | "warning" | "success"}-${"weak" | "medium" | "strong"}` | `${"neutral" | "brand" | "accent" | "info" | "danger" | "warning" | "success"}-alpha-${"weak" | "medium" | "strong"}`
type CondensedTShirtSizes = "l" | "m" | "s"
// type FieldSize is one of these strings: xl l m s xs xxs
// type FlexValue is one of these strings: 0 1 2 3 4 5 6 7 8 9 10 11 12
// type GridBreakpointProps: an object of these Grid props, all optional (padding* is padding, paddingX, paddingTop and the rest):
// style textVariant textSize textType textWeight background solid border* radius shadow padding* margin* gap top right bottom left width height maxWidth minWidth minHeight maxHeight fit* fill* aspectRatio onBackground onSolid align hide pointerEvents position overflow* scrollbar transition opacity zIndex dark light columns rows
// type GridSize is one of these strings: 1 2 3 4 5 6 7 8 9 10 11 12
// type IconName is one of these names, and only these:
// symbol security opacity dark light copy help filter info danger warning code link search time video image enter send checkbox document adjustments arrowLeft arrowRight arrowUpRight ball banknotes barChart bell bolt book bookmark calendar cart chat check chevronDoubleLeft chevronDoubleRight chevronDown chevronLeft chevronRight chevronUp chevronsLeftRight clipboard close computer dislike download edit eye eyeDropper eyeOff file flag folder food forward gift globe grip heart home inbox like linearGauge lock logout mail maximize minimize minus moreHorizontal organization pause paw payment person personRemove play plus radialGauge refresh return screen settings smiley sparkle star starFill store tag trash trend trendDown trendUp upload volume volumeOff wordmark world
type KbarItem = { id: string; name: string; section: string; shortcut?: string[]; keywords?: string; href?: string; perform?: () => void; icon?: IconName; description?: ReactNode; placeholder?: string }
type NavDensity = "normal" | "compact" | "spacious"
type NavVariant = "solid" | "subtle" | "minimal"
type NavigationLayout = "grid" | "row" | "column"
// type Opacity is one of these strings: 0 10 20 30 40 50 60 70 80 90 100
type Placement = "top" | "right" | "bottom" | "left" | `${"top" | "right" | "bottom" | "left"}-${"start" | "end"}`
type RadiusNest = "4" | "8"
// type RadiusSize is one of these strings: xl l m s xs none full
type ShadowSize = "xl" | "l" | "m" | "s" | "xs"
type SolidType = "color" | "contrast" | "inverse"
// type SpacingToken is one of these strings: xl l m s xs 0 1 2 4 8 12 32 64 160 16 20 24 40 48 56 72 80 104 128
type SurfaceStyle = "filled" | "translucent"
type TShirtSizes = "xl" | "l" | "m" | "s" | "xs"
type TableAction = { icon: string; label?: string; tooltip?: string; variant?: "primary" | "secondary" | "tertiary" | "danger"; onClick: (rowIndex: number) => void; disabled?: (rowIndex: number) => boolean }
type TableHeader = { content: ReactNode; key: string; sortable?: boolean; width?: string; align?: "left" | "center" | "right" }
type TagProps = Tag props
type TextBreakpointHide = { hide?: boolean }
type TextSize = "xl" | "l" | "m" | "s" | "xs"
type TextType = "label" | "body" | "code" | "heading" | "display"
type TextVariant = `${"label" | "body" | "code" | "heading" | "display"}-${"default" | "medium" | "strong" | "normal"}-${"xl" | "xs" | "l" | "m" | "s"}`
type TextWeight = "default" | "medium" | "strong" | "normal"
type Theme = "dark" | "light" | "system"
type ThemeProviderState = { theme: Theme; resolvedTheme: "light" | "dark"; setTheme: (theme: Theme) => void }
type ToastContextProps = { toasts: Toast[]; addToast: (toast: Omit<Toast, "id">) => string; removeToast: (id: string) => void }
type UserSelect = "auto" | "none" | "text" | "all"
```

## Gotchas

- Never cast an icon name with `as IconName`: the cast compiles a name the registry does not have, and it renders nothing. Use a name from iconNames; in data, type the field as IconName ({ icon: IconName }[]) or write the literal `as const`, so the type check still runs.
- Field heights run a step above Button's: Input size xs is 40px, s 48px, m 56px (the default). A field beside a size="s" Button (32px), as in a toolbar or filter row, takes size="xxs", which is 32px too; Form size="xxs" sets it for every field inside. An xxs field has no floating label: label shows as the placeholder, so keep label for the accessible name.
- Fixed in 2.1: a Button or IconButton that is a DropdownWrapper trigger renders a real <button type="button"> with aria-haspopup and aria-expanded, so it is reachable by keyboard. Pass it as trigger as is; do not add type="button" or a no-op onClick, or wrap it in a focusable Row, to make it one.
- Do not pass the same text as both title prop and children — it renders twice.
- Write 2.x prop names, not 1.x ones from memory: open (not isOpen), checked (not isChecked), SegmentedControl value/onChange/defaultValue (not selected/onToggle/defaultSelected), Tag scheme (not variant), field size/prefix/suffix/corners (not height/hasPrefix/hasSuffix/radius). The validator names the 2.x prop.
- overflow="hidden" on full-bleed sections clips glows into hard bands — only use when parent has radius.

## Quality bar

- Mount the shell once, in the `layout.tsx` of the routes it frames, and read the route with `usePathname()`; a shell rendered by each page loses its open groups and collapsed state on every navigation
- `selectNavHref` picks the highlighted item and opens the group that holds it
- A collapsed sidebar keeps every item reachable: icons with a tooltip or aria-label, the group label as the icon's name
- At s the sidebar hides and a header button opens the same nav in a left Drawer; following a link closes it
- Breadcrumbs from the route, and the account or workspace switcher as a DropdownWrapper or UserMenu with Option rows
- A header Search button opens Kbar with `open` and `onOpenChange` (no children); ⌘K still toggles it

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
### 2. Data-driven navigation

```tsx
import { Nav, NavGroup, NavItem, selectNavHref } from "@once-ui-system/core";

const current = selectNavHref(pathname, nav.flatMap((i) =>
  i.items ? i.items.map((s) => s.href) : [i.href],
));

<Nav fill paddingX="8" aria-label="Main">
  {nav.map((item) =>
    item.items ? (
      <NavGroup
        key={item.key}
        label={item.label}
        icon={item.icon}
        defaultOpen={item.items.some((s) => s.href === current)}>
        {item.items.map((sub) => (
          <NavItem
            key={sub.href}
            href={sub.href}
            label={sub.label}
            badge={sub.badge}
            selected={sub.href === current}
          />
        ))}
      </NavGroup>
    ) : (
      <NavItem
        key={item.href}
        href={item.href}
        icon={item.icon}
        label={item.label}
        selected={item.href === current}
      />
    ),
  )}
</Nav>
```

- **`Nav` sets the look once.** `density="compact"` for a dashboard's 32px
  rows, `variant="subtle"` or `"minimal"` for a docs or chat sidebar,
  `rail={false}` to drop the line down open groups. Every row inside follows.
- **`selectNavHref` over `===` or `startsWith`.** An equality check leaves a
  nested route (`/settings/billing/invoices/42`) with nothing highlighted; a
  prefix check lights the parent up alongside its child. It returns the longest
  href that matches, which is the right one.
- **Compute `current` once** for the whole tree, not per item — a child needs to
  know about its siblings to know it is the deepest match.
- **`defaultOpen` from the match**, so the group holding the current page is open
  on arrival.
- Child items take **no icon**. The rail inside `NavGroup` carries the hierarchy;
  a second column of icons competes with it.
