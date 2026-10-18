# Pricing page

Three tiers, highlighted middle tier, feature comparison table, FAQ accordion

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

- `RevealFx delay` (and `ShineFx`/`CountFx`/`TypeFx speed`) in **milliseconds**: `delay={index * 100}` — `* 0.1` was 1.8.x. `speed` on `MatrixFx`, `WeatherFx`, `ParticleFx` is a multiplier
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
| Keyboard shortcut | `useHotkeys("mod+k", fn)` + `KeyTip keys="mod+k"` |
| Screen-reader text, skip link | `VisuallyHidden` (no `href`: wrap the link, `<VisuallyHidden focusable><a href="#main">Skip to content</a></VisuallyHidden>`) |
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
name is a type error, not a blank space — take names (the IconName type below).

### Types — the common type errors

Every type a prop names is defined in the slice's (or bundle's) `types`.

- Responsive `xl`/`l`/`m`/`s`/`xs` props exist only on `Flex`, `Row`, `Column` and `Grid`. To change a `Button`, `Text` or anything else at a breakpoint, wrap it in one of those.
- `vertical`/`horizontal` take `start | center | end | between | around | even | stretch` — no `baseline`.
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

Props marked `?` are optional; `= x` is the default. A component's mixins add the props listed under Mixins.

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
- xl?: GridBreakpointProps
- l?: GridBreakpointProps
- m?: GridBreakpointProps
- s?: GridBreakpointProps
- xs?: GridBreakpointProps
- position?: CSSProperties["position"] = relative
- scrollbar?: "default" | "minimal" = minimal

### Heading
Mixins: CommonProps, DisplayProps, SpacingProps, TextProps.
- wrap?: CSSProperties["textWrap"] = balance

### Text
Mixins: CommonProps, DisplayProps, SpacingProps, TextProps.

### Button
- variant?: "primary" | "secondary" | "tertiary" | "quaternary" | "subtle" | "danger" | "success" | "warning" | "ghost" | "link" = primary
- size?: TShirtSizes = m
- corners?: "none" | "top" | "right" | "bottom" | "left" | "top-left" | "top-right" | "bottom-right" | "bottom-left"
- label?: string
- weight?: "default" | "strong" = strong
- rounded?: boolean
- prefixIcon?: IconName
- suffixIcon?: IconName
- loading?: boolean = false
- disabled?: boolean = false
- fillWidth?: boolean = false
- horizontal?: "start" | "center" | "end" | "between" = center
- children?: ReactNode
- href?: string
- className?: string
- style?: React.CSSProperties
- id?: string
- arrowIcon?: boolean = false
- color?: `${ColorScheme}-${ColorWeight}`

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

### MatrixFx
Extends Flex.
Mixins: CommonProps, DisplayProps, FlexProps, SizeProps, SpacingProps, StyleProps.
- speed?: number = 1
- colors?: string[] = ["brand-solid-medium"]
- size?: number = 3
- spacing?: number = 3
- revealFrom?: "center" | "top" | "bottom" | "left" | "right" = center
- trigger?: "hover" | "instant" | "mount" | "click" | "manual" = instant
- active?: boolean = false
- flicker?: boolean = false
- bulge?: BulgeConfig
- fps?: number = 60
- reducedMotion?: boolean | "auto" = auto
- children?: React.ReactNode

### BlobFx
Extends Row, Flex.
Mixins: CommonProps, DisplayProps, FlexProps, SizeProps, SpacingProps, StyleProps.
- seed?: number = 0

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

### SegmentedControl
Extends Scroller, Flex.
Mixins: CommonProps, DisplayProps, FlexProps, SizeProps, SpacingProps, StyleProps.
- buttons: ButtonOption[]
- onChange?: (value: string, event?: React.MouseEvent<HTMLButtonElement>) => void
- defaultValue?: string
- fillWidth?: boolean = true
- value?: string
- compact?: boolean = false
- className?: string
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

### Table
Extends Flex.
Mixins: CommonProps, DisplayProps, FlexProps, SizeProps, SpacingProps, StyleProps.
- data: { headers: TableHeader[]; rows: ReactNode[][]; }
- onRowClick?: (rowIndex: number) => void
- searchable?: boolean = false
- searchPlaceholder?: string = Search...
- striped?: boolean = false
- hoverable?: boolean = true
- compact?: boolean = false
- loading?: boolean = false
- emptyState?: ReactNode
- actions?: TableAction[]
- stickyHeader?: boolean = false
- rowClassName?: (rowIndex: number) => string
- cellClassName?: (rowIndex: number, cellIndex: number) => string
- paginated?: boolean = false
- defaultPageSize?: number = 10
- pageSizeOptions?: number[] = [5, 10, 20, 50]
- loadingState?: ReactNode

### AccordionGroup
Extends Flex.
Mixins: CommonProps, DisplayProps, FlexProps, SizeProps, SpacingProps, StyleProps.
- items: AccordionItem[]
- size?: CondensedTShirtSizes = m
- autoCollapse?: boolean = true
- className?: string
- style?: React.CSSProperties

### Tag
Extends Flex.
Mixins: CommonProps, DisplayProps, FlexProps, SizeProps, SpacingProps, StyleProps.
- scheme?: ColorScheme | "gradient" = neutral
- size?: CondensedTShirtSizes = m
- label?: string = ""
- prefixIcon?: IconName
- suffixIcon?: IconName
- children?: ReactNode

### Icon
Extends Flex.
Mixins: CommonProps, DisplayProps, FlexProps, SizeProps, SpacingProps, StyleProps.
- name: IconName
- onBackground?: `${ColorScheme}-${ColorWeight}`
- onSolid?: `${ColorScheme}-${ColorWeight}`
- size?: TShirtSizes = m
- decorative?: boolean = true
- tooltip?: ReactNode
- tooltipPosition?: "top" | "bottom" | "left" | "right" = top
- className?: string
- style?: React.CSSProperties

### IconButton
- icon?: IconName = refresh
- id?: string
- size?: TShirtSizes = m
- corners?: "none" | "top" | "right" | "bottom" | "left" | "top-left" | "top-right" | "bottom-right" | "bottom-left"
- rounded?: boolean = false
- tooltip?: ReactNode
- tooltipPosition?: "top" | "bottom" | "left" | "right" = top
- variant?: "primary" | "secondary" | "tertiary" | "quaternary" | "subtle" | "danger" | "success" | "warning" | "ghost" | "link" = primary
- loading?: boolean = false
- disabled?: boolean = false
- className?: string
- style?: React.CSSProperties
- href?: string
- children?: ReactNode
- color?: `${ColorScheme}-${ColorWeight}`
- ariaLabel?: string

### Input
- id: string
- label?: string
- placeholder?: string
- size?: TShirtSizes
- error?: boolean = false
- errorMessage?: ReactNode
- description?: ReactNode
- corners?: "none" | "top" | "right" | "bottom" | "left" | "top-left" | "top-right" | "bottom-right" | "bottom-left"
- className?: string
- style?: React.CSSProperties
- prefix?: ReactNode
- suffix?: ReactNode
- variant?: "default" | "ghost" = default
- focusRing?: boolean = false
- characterCount?: boolean
- cursor?: undefined | "interactive"
- validate?: (value: ReactNode) => ReactNode | null
- loading?: boolean = false
- span?: number

### Textarea
- id: string
- label?: string
- placeholder?: string
- lines?: number | "auto" = auto
- size?: TShirtSizes
- error?: boolean = false
- errorMessage?: ReactNode
- description?: ReactNode
- corners?: "none" | "top" | "right" | "bottom" | "left" | "top-left" | "top-right" | "bottom-right" | "bottom-left"
- className?: string
- prefix?: ReactNode
- suffix?: ReactNode
- variant?: "default" | "ghost" = default
- focusRing?: boolean = false
- characterCount?: boolean
- resize?: "horizontal" | "vertical" | "both" | "none" = vertical
- validate?: (value: ReactNode) => ReactNode | null
- disabled?: boolean = false
- span?: number

### Badge
Extends Flex.
Mixins: CommonProps, DisplayProps, FlexProps, SizeProps, SpacingProps, StyleProps.
Avoid: Passing the same text as title and children — both render
- title?: string
- icon?: IconName
- arrow?: boolean = href ? true : false
- children?: React.ReactNode
- href?: string
- effect?: boolean = true
- className?: string
- style?: React.CSSProperties
- id?: string

### Avatar
Extends Flex.
Mixins: CommonProps, DisplayProps, FlexProps, SizeProps, SpacingProps, StyleProps.
- size?: TShirtSizes | number = m
- value?: string
- src?: string
- unoptimized?: boolean
- loading?: boolean
- empty?: boolean
- icon?: IconName
- statusIndicator?: { color: "green" | "yellow" | "red" | "gray"; }
- style?: React.CSSProperties = {}
- className?: string

### Dialog
Extends Flex.
Mixins: CommonProps, DisplayProps, FlexProps, SizeProps, SpacingProps, StyleProps.
- open: boolean
- onClose: () => void
- title: ReactNode | string
- description?: ReactNode
- children?: ReactNode
- footer?: ReactNode
- base?: boolean
- stack?: boolean
- flush?: boolean = false
- showClose?: boolean = !hideClose
- hideClose?: boolean = false
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
- onBackground?: Colors
- onSolid?: Colors
- align?: CSSProperties["textAlign"]

### DisplayProps
- as?: ElementType
- inline?: boolean
- hide?: boolean
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
- dark?: boolean
- light?: boolean

### FlexProps
- direction?: "row" | "column" | "row-reverse" | "column-reverse"
- horizontal?: "start" | "center" | "end" | "between" | "around" | "even" | "stretch"
- vertical?: "start" | "center" | "end" | "between" | "around" | "even" | "stretch"
- center?: boolean
- wrap?: boolean
- flex?: FlexValue

### SizeProps
- width?: number | SpacingToken | CSSUnit
- height?: number | SpacingToken | CSSUnit | "below-header"
- maxWidth?: number | SpacingToken | CSSUnit
- minWidth?: number | SpacingToken | CSSUnit
- minHeight?: number | SpacingToken | CSSUnit | "below-header"
- maxHeight?: number | SpacingToken | CSSUnit | "below-header"
- fit?: boolean
- fitWidth?: boolean
- fitHeight?: boolean
- fill?: boolean
- fillWidth?: boolean
- fillHeight?: boolean
- aspectRatio?: CSSProperties["aspectRatio"]

### SpacingProps
- padding?: SpacingToken | number
- paddingLeft?: SpacingToken | number
- paddingRight?: SpacingToken | number
- paddingTop?: SpacingToken | number
- paddingBottom?: SpacingToken | number
- paddingX?: SpacingToken | number
- paddingY?: SpacingToken | number
- margin?: SpacingToken | number
- marginLeft?: SpacingToken | number
- marginRight?: SpacingToken | number
- marginTop?: SpacingToken | number
- marginBottom?: SpacingToken | number
- marginX?: SpacingToken | number
- marginY?: SpacingToken | number
- gap?: SpacingToken | number | "-1"
- top?: SpacingToken | number | CSSUnit
- right?: SpacingToken | number | CSSUnit
- bottom?: SpacingToken | number | CSSUnit
- left?: SpacingToken | number | CSSUnit
- translateX?: SpacingToken | number | CSSUnit
- translateY?: SpacingToken | number | CSSUnit

### StyleProps
- textVariant?: TextVariant
- textSize?: TextSize
- textType?: TextType
- textWeight?: TextWeight
- background?: Colors | "surface" | "overlay" | "page" | "transparent"
- solid?: Colors
- borderTop?: Colors | "surface" | "transparent" | boolean
- borderRight?: Colors | "surface" | "transparent" | boolean
- borderBottom?: Colors | "surface" | "transparent" | boolean
- borderLeft?: Colors | "surface" | "transparent" | boolean
- borderX?: Colors | "surface" | "transparent" | boolean
- borderY?: Colors | "surface" | "transparent" | boolean
- border?: Colors | "surface" | "transparent" | boolean
- borderStyle?: "solid" | "dashed"
- borderWidth?: 1 | 2 | 4 | 8 | "1" | "2" | "4" | "8"
- topRadius?: RadiusSize
- rightRadius?: RadiusSize
- bottomRadius?: RadiusSize
- leftRadius?: RadiusSize
- topLeftRadius?: RadiusSize
- topRightRadius?: RadiusSize
- bottomLeftRadius?: RadiusSize
- bottomRightRadius?: RadiusSize
- shadow?: ShadowSize
- cursor?: CSSProperties["cursor"] | "interactive" | ReactNode
- blendMode?: BlendMode
- blur?: BlurSize | number
- backdropBlur?: BlurSize | number
- theme?: "light" | "dark"
- themeBorder?: BorderStyle
- themeSolid?: SolidType
- themeSurface?: SurfaceStyle
- radius?: RadiusSize | `${RadiusSize}-${RadiusNest}`

### GridProps
- columns?: GridSize
- minColumnWidth?: number | SpacingToken | CSSUnit
- rows?: GridSize

### TextProps
- as?: T
- variant?: TextVariant
- wrap?: CSSProperties["textWrap"]
- size?: TextSize
- weight?: TextWeight
- family?: TextType
- truncate?: boolean

## Types

```ts
type AccordionItem = { title: React.ReactNode; content: React.ReactNode }
type BaseColor = "page" | "surface" | "overlay" | "transparent" | `${"neutral" | "brand" | "accent" | "info" | "danger" | "warning" | "success"}-${"weak" | "medium" | "strong"}` | `${"neutral" | "brand" | "accent" | "info" | "danger" | "warning" | "success"}-alpha-${"weak" | "medium" | "strong"}`
type BlendMode = "color" | "normal" | "screen" | "overlay" | "multiply" | "darken" | "lighten" | "difference" | "exclusion" | "hue" | "saturation" | "luminosity" | `color-${"dodge" | "burn"}` | "hard-light" | "soft-light" | "plus-lighter"
type BlurSize = "xl" | "l" | "m" | "s" | "xs"
type BorderStyle = "rounded" | "playful" | "conservative" | "sharp"
type BulgeConfig = { type?: "ripple" | "wave"; duration?: number; intensity?: number; repeat?: boolean; delay?: number }
type ButtonOption = { value: string; style?: React.CSSProperties; className?: string; children?: ReactNode; horizontal?: "start" | "center" | "end" | "between"; radius?: RadiusSize; fillWidth?: boolean; label?: ReactNode; disabled?: boolean; size?: TShirtSizes; corners?: "none" | "top" | "right" | "bottom" | "left" | "top-left" | "top-right" | "bottom-right" | "bottom-left"; variant?: "ghost" | "outline" | "subtle"; weight?: "default" | "strong"; truncate?: boolean; rounded?: boolean; prefixIcon?: IconName; suffixIcon?: IconName; href?: string }
type CSSUnit = `${number}px` | `${number}rem` | `${number}em` | `${number}%` | `${number}vh` | `${number}dvh` | `${number}vw` | `calc(${string})`
type ColorScheme = "neutral" | "brand" | "accent" | "info" | "danger" | "warning" | "success"
type ColorValue = string & {} | `${"neutral" | "brand" | "accent" | "info" | "danger" | "warning" | "success"}-${"weak" | "medium" | "strong"}` | `${"neutral" | "brand" | "accent" | "info" | "danger" | "warning" | "success"}-alpha-${"weak" | "medium" | "strong"}`
type ColorWeight = "weak" | "medium" | "strong"
type Colors = `${"neutral" | "brand" | "accent" | "info" | "danger" | "warning" | "success"}-${"weak" | "medium" | "strong"}` | `${"neutral" | "brand" | "accent" | "info" | "danger" | "warning" | "success"}-alpha-${"weak" | "medium" | "strong"}`
type CondensedTShirtSizes = "l" | "m" | "s"
type DotsProps = { display?: boolean; opacity?: DisplayProps["opacity"]; color?: ColorValue; size?: SpacingToken }
type FlexValue = "0" | "1" | "8" | "10" | "2" | "3" | "4" | "12" | "5" | "6" | "7" | "9" | "11"
type GradientProps = { display?: boolean; opacity?: DisplayProps["opacity"]; x?: number; y?: number; width?: number; height?: number; tilt?: number; colorStart?: ColorValue; colorEnd?: ColorValue }
type GridBreakpointProps = "style" | "textVariant" | "textSize" | "textType" | "textWeight" | "background" | "solid" | "borderTop" | "borderRight" | "borderBottom" | "borderLeft" | "borderX" | "borderY" | "border" | "borderStyle" | "borderWidth" | "radius" | "shadow" | "padding" | "paddingLeft" | "paddingRight" | "paddingTop" | "paddingBottom" | "paddingX" | "paddingY" | "margin" | "marginLeft" | "marginRight" | "marginTop" | "marginBottom" | "marginX" | "marginY" | "gap" | "top" | "right" | "bottom" | "left" | "width" | "height" | "maxWidth" | "minWidth" | "minHeight" | "maxHeight" | "fit" | "fitWidth" | "fitHeight" | "fill" | "fillWidth" | "fillHeight" | "aspectRatio" | "onBackground" | "onSolid" | "align" | "hide" | "pointerEvents" | "position" | "overflow" | "overflowX" | "overflowY" | "scrollbar" | "transition" | "opacity" | "zIndex" | "dark" | "light" | "columns" | "rows"
type GridSize = "1" | "8" | "10" | "2" | "3" | "4" | "12" | "5" | "6" | "7" | "9" | "11"
type IconName = "symbol" | "security" | "opacity" | "dark" | "light" | "copy" | "help" | "filter" | "info" | "danger" | "warning" | "code" | "link" | "search" | "time" | "video" | "image" | "enter" | "send" | "checkbox" | "document" | "adjustments" | "arrowLeft" | "arrowRight" | "arrowUpRight" | "ball" | "banknotes" | "barChart" | "bell" | "bolt" | "book" | "bookmark" | "calendar" | "cart" | "chat" | "check" | "chevronDoubleLeft" | "chevronDoubleRight" | "chevronDown" | "chevronLeft" | "chevronRight" | "chevronUp" | "chevronsLeftRight" | "clipboard" | "close" | "computer" | "dislike" | "download" | "edit" | "eye" | "eyeDropper" | "eyeOff" | "file" | "flag" | "folder" | "food" | "forward" | "gift" | "globe" | "heart" | "home" | "inbox" | "like" | "linearGauge" | "lock" | "logout" | "mail" | "maximize" | "minimize" | "minus" | "moreHorizontal" | "organization" | "pause" | "paw" | "payment" | "person" | "personRemove" | "play" | "plus" | "radialGauge" | "refresh" | "return" | "screen" | "settings" | "smiley" | "sparkle" | "star" | "starFill" | "store" | "tag" | "trash" | "trend" | "trendDown" | "trendUp" | "upload" | "volume" | "volumeOff" | "wordmark" | "world"
type LinesProps = { display?: boolean; opacity?: DisplayProps["opacity"]; size?: SpacingToken; thickness?: number; angle?: number; color?: ColorValue }
type MaskProps = Mask props
type Opacity = "0" | "10" | "20" | "30" | "40" | "50" | "60" | "70" | "80" | "90" | "100"
type RadiusNest = "4" | "8"
type RadiusSize = "xl" | "l" | "m" | "s" | "xs" | "none" | "full"
type ScrollerLabels = { previous?: string; next?: string }
type ShadowSize = "xl" | "l" | "m" | "s" | "xs"
type SolidType = "color" | "contrast" | "inverse"
type SpacingToken = "xl" | "l" | "m" | "s" | "xs" | "0" | "32" | "1" | "2" | "4" | "64" | "160" | "8" | "12" | "16" | "20" | "24" | "40" | "48" | "56" | "72" | "80" | "104" | "128"
type SurfaceStyle = "filled" | "translucent"
type TShirtSizes = "xl" | "l" | "m" | "s" | "xs"
type TableAction = { icon: string; label?: string; tooltip?: string; variant?: "primary" | "secondary" | "tertiary" | "danger"; onClick: (rowIndex: number) => void; disabled?: (rowIndex: number) => boolean }
type TableHeader = { content: ReactNode; key: string; sortable?: boolean; width?: string; align?: "left" | "center" | "right" }
type TextSize = "xl" | "l" | "m" | "s" | "xs"
type TextType = "label" | "body" | "code" | "heading" | "display"
type TextVariant = `${"label" | "body" | "code" | "heading" | "display"}-${"default" | "medium" | "strong" | "normal"}-${"xl" | "xs" | "l" | "m" | "s"}`
type TextWeight = "default" | "medium" | "strong" | "normal"
type ToastContextProps = { toasts: Toast[]; addToast: (toast: Omit<Toast, "id">) => string; removeToast: (id: string) => void }
type UserSelect = "auto" | "none" | "text" | "all"
```

## Gotchas

- Card is for interactive surfaces only (href or onClick). Static panels use Column + background="surface" border radius="l".
- Timing props on RevealFx (delay, speed), ShineFx (speed), CountFx (speed), TypeFx (speed, delay), Animation and HoverCard (delay, duration), Hover (delay, hideDelay) and Skeleton (delay) are milliseconds — stagger with delay={index * 100}, never index * 0.1 (that was 1.8.x; 2.0 reads 0.1 as a tenth of a millisecond, i.e. no stagger). speed on MatrixFx, WeatherFx, ParticleFx, CelebrationFx and Effect is a multiplier, where 0.5 is half speed.
- LogoCloud extends Grid — always set columns and responsive overrides or logos stack in one column.
- Use fill not fillWidth fillHeight; center not horizontal="center" vertical="center"; Row/Column not Flex direction=, and Row for a Flex with no direction (Flex defaults to row). Flex is for a direction that changes at a breakpoint.
- Gap between page sections: 80–160 (typical 104). Inside sections: 24–40.
- Entry animation budget: hero + at most 1–2 key moments. Animate coherent blocks all-or-none within a sibling set.
- Responsive xl/l/m/s/xs props exist only on Flex, Row, Column and Grid. Button, Text, Heading and the rest have none: to change one at a breakpoint, wrap it in a Row or Column and put the breakpoint prop there (s={{ hide: true }}). Width props take a number, a spacing token or a CSS unit, never "auto": to undo a width at a breakpoint write s={{ fillWidth: true }} or s={{ width: "100%" }}. Text and Heading take padding but no radius, border or flex; put those on the wrapper.
- A number on width, height, minWidth or minHeight is rem, not px: width={32} is 512 px. For a pixel size write the spacing token string, width="32" (32 px), or the rem value, width={2}. Token strings stop at the spacing scale ("160" is the largest), so height="320" is a type error: write height={20}. An icon or avatar box is usually "24" to "48".
- gap, padding and margin take spacing tokens ("0", "1", "2", "4", "8", "12", "16", "20", "24", "32", "40", "48", "56", "64", "72", "80", "104", "128", "160", or xs–xl). "6" and "10" are not tokens and are type errors.
- Row, Column and Grid have no span and no type prop. A clickable row is a Button (or a native <button>), and a Grid child spanning columns uses style={{ gridColumn: "span 2" }}.
- Never wrap primary content (headlines, prices, KPIs, CTAs) in RevealFx: it stays blurred and unreadable until the reveal ends. Reveal secondary sections only, with speed="fast".
- Quarter-percent units: 400 = 100% of container. Soft glows use width 100–200, not 500.
- x/y are percent positions of the container (50/50 = center).
- Every absolute decorative layer needs top="0" left="0" or it offsets by parent padding.
- translateY as a number is in rem. Use translateY={1} or token "16" (1rem); 16 means 16rem.
- Icon names must come from the IconName type below, and IconName is a real union in 2.0 (an unregistered name is a type error, not a blank space). Do not guess a plausible name, and do not cast one with `as IconName` to silence the check. Brand marks are not in the set — an app registers those itself by augmenting IconLibraryOverrides.
- Never cast an icon name with `as IconName`: the cast compiles a name the registry does not have, and it renders nothing. Use a name from iconNames; in data, type the field as IconName ({ icon: IconName }[]) or write the literal `as const`, so the type check still runs.
- In a Next.js app, import LayoutProvider from "@once-ui-system/core/next", not the package root. The root export installs the plain DOM adapters, so SmartLink, Button/Card/ToggleButton with href, Media, Logo, MegaMenu and Kbar render a plain <a> and <img>: no client-side navigation, no next/image, and no error to say so. An app that composes NextAdapterProvider (or AdapterProvider with nextAdapters) itself is already covered.
- Fixed in 2.1: a Button or IconButton that is a DropdownWrapper trigger renders a real <button type="button"> with aria-haspopup and aria-expanded, so it is reachable by keyboard. Pass it as trigger as is; do not add type="button" or a no-op onClick, or wrap it in a focusable Row, to make it one.
- Do not pass the same text as both title prop and children — it renders twice.
- Colors are semantic tokens ({scheme}-{weight}), never hex/rgb. background also accepts surface | overlay | page | transparent.
- Inline SVG paint is not a hex or rgb literal either: write fill or stroke as currentColor and set the colour with onBackground on the wrapper, or name a token as var(--brand-solid-strong). A literal never follows the theme.
- *-background-weak is nearly the page color — invisible as accent. Use alpha tokens (brand-alpha-medium) for glows.
- Write 2.x prop names, not 1.x ones from memory: open (not isOpen), checked (not isChecked), SegmentedControl value/onChange/defaultValue (not selected/onToggle/defaultSelected), Tag scheme (not variant), field size/prefix/suffix/corners (not height/hasPrefix/hasSuffix/radius). The validator names the 2.x prop.
- Theme a subtree with the typed props theme, themeBorder, themeSolid and themeSurface — on Flex, Row, Column, Grid and every component built on them (Background, Tag, Badge, the effects) — not raw data-theme, data-border, data-solid or data-surface. Keep the raw attribute only where no prop exists: data-border="rounded" on Button and IconButton, data-brand anywhere.
- Never write props equal to defaults or implied by another prop on the element: position="relative", direction on Row/Column, variant="primary" on Button, fillWidth beside maxWidth (maxWidth already fills the width), minWidth={0} beside fillWidth (fillWidth already sets min-width: 0).
- Bare border (and borderTop, borderBottom, borderX, …) draws the default border: --default-border, neutral-alpha-weak unless the app sets it in its custom CSS. Do not write border="neutral-alpha-weak" to get it, which pins the colour; name a colour only to deviate, e.g. border="neutral-alpha-medium" or border="brand-alpha-medium".
- zIndex is for an isolated stacking group: an absolute decorative layer and its content sibling (zIndex={1}), or a sticky header over its pane. Never on a lone element, never a page-wide ladder of 3 / 5 / 9 — restructure the tree instead.
- Hero = display-strong-l/xl; section titles = display-strong-xs/s — never heading-* for section titles.
- CountFx has no trigger prop — drive value from useInViewport latch instead.
- overflow="hidden" on full-bleed sections clips glows into hard bands — only use when parent has radius.
- vertical and horizontal take start, center, end, between, around, even or stretch. There is no baseline; for baseline-aligned text use style={{ alignItems: "baseline" }}.
- Wrap a Column in a native <form onSubmit={handleSubmit}>. Column as="form" keeps the div event types, so a FormEvent<HTMLFormElement> handler (and noValidate) is a type error.

## Quality bar

- 104
- Column background="surface" border radius="l" — not Card
- border="brand-alpha-medium" + Background gradient glow

## Recipes

### 2. MatrixFx hero strip (with fade-out)

Animated matrix field behind a hero, faded into the page with a `page-background` gradient so it doesn't compete with content. Pair exactly like this:

```tsx
<Column fillWidth minHeight="s" center overflow="hidden">
  <MatrixFx
    position="absolute" top="0" left="0" fill
    flicker size={1.5} spacing={8}
    colors={["brand-solid-strong"]}
    bulge={{ type: "wave", duration: 3, intensity: 20, repeat: true }}
  />
  <Background
    position="absolute" top="0" left="0" fill pointerEvents="none"
    gradient={{ display: true, colorStart: "page-background", x: 0, y: 50, width: 150, height: 300 }}
  />
  <Column zIndex={1} center gap="16" padding="48">
    {/* hero content */}
  </Column>
</Column>
```
### 3. Highlighted card glow

For the emphasized item in a set (e.g. "most popular" pricing tier). Border + top glow, nothing else:

```tsx
<Card fillWidth padding="24" radius="l" background="surface" border="brand-alpha-medium" overflow="hidden">
  <Background
    position="absolute" top="0" left="0" fill pointerEvents="none"
    gradient={{
      display: true,
      colorStart: "brand-alpha-medium",
      colorEnd: "static-transparent",
      x: 50, y: 0,
      width: 200, height: 60,
      opacity: 50,
    }}
  />
  <Column zIndex={1} gap="20" fillWidth>
    {/* card content */}
  </Column>
</Card>
```
### 4. BlobFx ambient panel

Self-contained drifting brand/accent blobs (already blurred and pointer-transparent). Use behind a final CTA or feature visual — counts as continuous motion:

```tsx
<Card fillWidth radius="l" border overflow="hidden" padding="48">
  <BlobFx position="absolute" top="0" left="0" fill opacity={60} seed={2} />
  <Column zIndex={1} center gap="24">
    {/* CTA content */}
  </Column>
</Card>
```

## Gold example (`examples/pricing.tsx`)

```tsx
"use client";

import {
  Background,
  BlobFx,
  Button,
  Column,
  CountFx,
  Grid,
  Heading,
  Icon,
  MatrixFx,
  RevealFx,
  Row,
  SegmentedControl,
  Table,
  Tag,
  Text,
  useInViewport,
} from "@once-ui-system/core";
/**
 * Gold example: pricing
 * Target: three tiers, highlighted middle, comparison table, split FAQ, ambient CTA
 */
import { useEffect, useRef, useState } from "react";

type Billing = "monthly" | "yearly";

const tiers = [
  {
    name: "Starter",
    description: "For solo builders shipping their first product.",
    price: { monthly: 19, yearly: 15 },
    features: ["3 projects", "5 team members", "Core analytics"],
    cta: "Start with Starter",
  },
  {
    name: "Pro",
    description: "For growing teams that need speed and depth.",
    price: { monthly: 49, yearly: 39 },
    features: ["Unlimited projects", "25 team members", "API access", "Priority support"],
    cta: "Start free trial",
    highlighted: true,
  },
  {
    name: "Enterprise",
    description: "For organizations with security and scale requirements.",
    features: ["Unlimited everything", "SSO / SAML", "Dedicated success manager"],
    cta: "Talk to sales",
  },
];

export function PricingExample() {
  const [billing, setBilling] = useState<Billing>("monthly");
  const tiersRef = useRef<HTMLDivElement>(null);
  const tiersInViewport = useInViewport(tiersRef);
  const [tiersSeen, setTiersSeen] = useState(false);
  useEffect(() => {
    if (tiersInViewport) setTiersSeen(true);
  }, [tiersInViewport]);

  return (
    <Column as="main" fillWidth horizontal="center" gap="104" paddingBottom="104">
      <Column fillWidth center overflow="hidden" paddingY="80">
        <MatrixFx
          position="absolute"
          top="0"
          left="0"
          fill
          flicker
          size={1.5}
          spacing={8}
          colors={["brand-solid-strong"]}
          bulge={{ type: "wave", duration: 3, intensity: 20, repeat: true }}
        />
        <Background
          position="absolute"
          top="0"
          left="0"
          fill
          pointerEvents="none"
          gradient={{
            display: true,
            colorStart: "page-background",
            x: 0,
            y: 50,
            width: 150,
            height: 300,
          }}
        />
        <Column zIndex={1} center gap="24" padding="48" maxWidth={48}>
          <Text variant="label-default-s" onBackground="brand-medium">
            Pricing
          </Text>
          <Heading as="h1" variant="display-strong-xl" align="center">
            Pay for momentum, not seats
          </Heading>
          <Text variant="body-default-l" onBackground="neutral-weak" align="center">
            Start free, scale when you're ready.
          </Text>
        </Column>
      </Column>

      <Column fillWidth horizontal="center">
        <Column maxWidth="l" gap="40">
          <Row
            fillWidth
            horizontal="between"
            vertical="end"
            gap="24"
            s={{ direction: "column", horizontal: "start" }}
          >
            <Heading as="h2" variant="display-strong-xs">
              Three plans, one decision
            </Heading>
            <SegmentedControl
              value={billing}
              onChange={(value) => setBilling(value as Billing)}
              buttons={[
                { value: "monthly", label: "Monthly" },
                { value: "yearly", label: "Yearly −20%" },
              ]}
            />
          </Row>

          <Grid ref={tiersRef} columns="3" gap="24" s={{ columns: 1 }}>
            {tiers.map((tier, index) => (
              <RevealFx
                key={tier.name}
                fill
                revealed={tiersSeen}
                translateY="8"
                delay={index * 100}
              >
                <Column
                  fill
                  background="surface"
                  border={tier.highlighted ? "brand-alpha-medium" : "neutral-alpha-weak"}
                  radius="l"
                  padding="32"
                  overflow="hidden"
                >
                  {tier.highlighted && (
                    <Background
                      position="absolute"
                      top="0"
                      left="0"
                      fill
                      pointerEvents="none"
                      gradient={{
                        display: true,
                        colorStart: "brand-alpha-medium",
                        colorEnd: "static-transparent",
                        x: 50,
                        y: 0,
                        width: 200,
                        height: 60,
                        opacity: 50,
                      }}
                    />
                  )}
                  <Column zIndex={1} fill gap="24">
                    <Row fillWidth horizontal="between" vertical="center">
                      <Heading as="h3" variant="heading-strong-m">
                        {tier.name}
                      </Heading>
                      {tier.highlighted && <Tag scheme="brand" size="s" label="Most popular" />}
                    </Row>
                    <Text variant="body-default-s" onBackground="neutral-weak">
                      {tier.description}
                    </Text>
                    {tier.price ? (
                      <Row vertical="end" gap="2">
                        <Text variant="display-strong-s">$</Text>
                        <CountFx
                          variant="display-strong-s"
                          value={tier.price[billing]}
                          effect="wheel"
                          speed={400}
                        />
                        <Text
                          variant="label-default-s"
                          onBackground="neutral-weak"
                          paddingBottom="4"
                          paddingLeft="4"
                        >
                          / mo
                        </Text>
                      </Row>
                    ) : (
                      <Text variant="display-strong-s">Custom</Text>
                    )}
                    <Column flex={1} gap="12">
                      {tier.features.map((feature) => (
                        <Row key={feature} gap="12" vertical="center">
                          <Icon name="checkbox" size="xs" onBackground="brand-medium" />
                          <Text variant="body-default-s">{feature}</Text>
                        </Row>
                      ))}
                    </Column>
                    <Button
                      fillWidth
                      variant={tier.highlighted ? "primary" : "secondary"}
                      arrowIcon={tier.highlighted}
                    >
                      {tier.cta}
                    </Button>
                  </Column>
                </Column>
              </RevealFx>
            ))}
          </Grid>
        </Column>
      </Column>

      <Column
        fillWidth
        horizontal="center"
        background="neutral-alpha-weak"
        paddingY="80"
        paddingX="24"
      >
        <Column maxWidth="l" gap="40">
          <Heading as="h2" variant="display-strong-xs">
            Every feature, side by side
          </Heading>
          <Table
            fillWidth
            data={{
              headers: [
                { content: "Feature", key: "feature" },
                { content: "Starter", key: "starter" },
                { content: "Pro", key: "pro" },
              ],
              rows: [
                ["Projects", "3", "Unlimited"],
                ["API access", "—", "✓"],
              ],
            }}
          />
        </Column>
      </Column>

      <Column fillWidth horizontal="center">
        <Column maxWidth="l" radius="xl" border overflow="hidden" padding="64" center>
          <BlobFx position="absolute" top="0" left="0" fill opacity={60} seed={2} />
          <Column zIndex={1} center gap="24" maxWidth={40}>
            <Heading as="h2" variant="display-strong-s" align="center">
              Ship your next launch on Pro
            </Heading>
            <Button arrowIcon>Start free trial</Button>
          </Column>
        </Column>
      </Column>
    </Column>
  );
}
```
