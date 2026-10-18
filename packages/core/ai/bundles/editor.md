# Editor shell

A toolbar, a resizable two-pane split (layers and canvas) and a timeline spanning both — video editor, page builder, diff view

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
| Screen-reader text, skip link | `VisuallyHidden` |
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
| `MediaAudioPlayer`, `MediaVideoPlayer`, `Scrubber`, `CompareImage` | `@once-ui-system/core/media` |
| `EmojiPicker` | `@once-ui-system/core/emoji` |
| `LayoutProvider` in a **Next.js** app; `createOgFetchRoute`, `createOgProxyRoute` | `@once-ui-system/core/next` |
| `defineConfig`, `OnceUIConfig` in `once-ui.config` | `@once-ui-system/core/config` (also on the root) |
| the effects: `RevealFx`, `CountFx`, `TypeFx`, `MatrixFx`, `Effect`, every `*Fx` | `@once-ui-system/fx` (a package: install it) |
| `Banner`, `Book`, `LogoCloud`, `ScrollToTop`, `StylePanel`, `StyleOverlay` | `@once-ui-system/blocks` (a package: install it) |

Naming one of these from the root does not resolve — except `defineConfig`,
which is on both, and `LayoutProvider`, which resolves and then silently
renders links and images as plain `<a>` and `<img>` in a Next.js app. `IconName` is a real union, so an unregistered icon
name is a type error, not a blank space — take names (the IconName type below).

### Types — the common type errors

Every type a prop names is defined in the slice's (or bundle's) `types`.

- Responsive `xl`/`l`/`m`/`s`/`xs` props exist only on `Flex`, `Row`, `Column` and `Grid`. To change a `Button`, `Text` or anything else at a breakpoint, wrap it in one of those. Leaves (`Button`, the fields and controls, `Text`, `Heading`, `Icon`, `Avatar`, `Kbd`…) take only margins, `flex`, `fillWidth`, `position` and offsets, `className` and `style`: padding, background, border, radius, sizes and `hide` go on a wrapper too.
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

Props marked `?` are optional; `= x` is the default. A component's mixins add the props listed under Mixins.

### Column
Mixins: CommonProps, DisplayProps, FlexProps, SizeProps, SpacingProps, StyleProps.
Use instead of Flex with direction="column".

### Row
Mixins: CommonProps, DisplayProps, FlexProps, SizeProps, SpacingProps, StyleProps.
Use instead of Flex with direction="row".

### SplitView
Mixins: CommonProps, DisplayProps, FlexProps, SizeProps, SpacingProps, StyleProps.
- leftPanel: ReactNode
- rightPanel: ReactNode
- labels?: { left: string; right: string }
- collapseBelow?: BreakpointKey | false = s
- defaultSplit?: number = 0.3
- minSplit?: number = 0.2
- maxSplit?: number = 0.8

### Scrubber (from `@once-ui-system/core/media`)
Mixins: CommonProps, DisplayProps, FlexProps, SizeProps, SpacingProps, StyleProps.
- duration: number
- value: number
- onValueChange: (time: number) => void
- tracks?: ScrubberTrack[] = []
- selected?: string | null = null
- onSelectedChange?: (blockId: string | null) => void
- onBlockChange?: (trackId: string, blockId: string, next: { start: number; end: number }) => void
- onGestureStart?: () => void
- onBlockContextMenu?: (event: React.MouseEvent, trackId: string, blockId: string) => void
- showTime?: boolean = true
- formatTime?: (time: number) => string = defaultFormatTime
- step?: number

### ToggleButton
Mixins: LeafProps.
- label?: ReactNode
- selected?: boolean = false
- variant?: "ghost" | "outline" | "subtle" = ghost
- size?: TShirtSizes
- radius?: RadiusSize
- corners?: "none" | "top" | "right" | "bottom" | "left" | "top-left" | "top-right" | "bottom-right" | "bottom-left"
- rounded?: boolean = false
- horizontal?: "start" | "center" | "end" | "between" = center
- weight?: "default" | "strong" = default
- truncate?: boolean = false
- disabled?: boolean = false
- prefixIcon?: IconName
- suffixIcon?: IconName
- children?: ReactNode
- href?: string

### IconButton
Mixins: LeafProps.
- icon?: IconName = refresh
- id?: string
- size?: TShirtSizes
- corners?: "none" | "top" | "right" | "bottom" | "left" | "top-left" | "top-right" | "bottom-right" | "bottom-left"
- rounded?: boolean = false
- tooltip?: ReactNode
- tooltipPosition?: "top" | "bottom" | "left" | "right" = top
- variant?: ButtonVariant = primary
- tone?: Tone
- loading?: boolean = false
- disabled?: boolean = false
- href?: string
- children?: ReactNode

### Text
Mixins: CommonProps, LeafProps, TextProps.
- opacity?: Opacity

### Media
Mixins: CommonProps, DisplayProps, FlexProps, SizeProps, SpacingProps, StyleProps.
Avoid: Raw img elements
- aspectRatio?: string = original
- height?: number | CSSUnit
- alt?: string = ""
- loading?: boolean = false
- objectFit?: CSSProperties["objectFit"] = cover
- enlarge?: boolean = false
- src: string
- unoptimized?: boolean = false
- sizes?: string | number = 100vw
- priority?: boolean
- caption?: ReactNode
- stretch?: boolean = false
- fillWidth?: boolean = true
- loop?: boolean = true
- autoplay?: boolean = true
- sound?: boolean = false
- controls?: boolean = false
- style?: CSSProperties
- className?: string

### MediaVideoPlayer (from `@once-ui-system/core/media`)
- src: string
- autoplay?: boolean = false
- loop?: boolean = false
- muted?: boolean = true
- objectFit?: CSSProperties["objectFit"] = cover
- className?: string

### Grid
Extends ServerGrid.
Mixins: CommonProps, DisplayProps, GridProps, SizeProps, SpacingProps, StyleProps.
- position?: CSSProperties["position"] = relative
- scrollbar?: "default" | "minimal" = minimal
- masonry?: boolean

### Heading
Mixins: CommonProps, LeafProps, TextProps.
- wrap?: CSSProperties["textWrap"] = balance
- opacity?: Opacity

### Button
Mixins: LeafProps.
- variant?: ButtonVariant = primary
- tone?: Tone
- size?: TShirtSizes
- corners?: "none" | "top" | "right" | "bottom" | "left" | "top-left" | "top-right" | "bottom-right" | "bottom-left"
- label?: string
- weight?: "default" | "strong" = strong
- rounded?: boolean
- prefixIcon?: IconName
- suffixIcon?: IconName
- loading?: boolean = false
- disabled?: boolean = false
- horizontal?: "start" | "center" | "end" | "between" = center
- children?: ReactNode
- href?: string
- id?: string
- arrowIcon?: boolean = false

### Icon
Mixins: LeafProps.
- name: IconName
- onBackground?: `${ColorScheme}-${ColorWeight}`
- onSolid?: `${ColorScheme}-${ColorWeight}`
- size?: TShirtSizes = m
- decorative?: boolean = true
- tooltip?: ReactNode
- tooltipPosition?: "top" | "bottom" | "left" | "right" = top

### Input
Mixins: LeafProps.
- id: string
- label?: string
- placeholder?: string
- size?: TShirtSizes
- error?: boolean = false
- errorMessage?: ReactNode
- description?: ReactNode
- corners?: "none" | "top" | "right" | "bottom" | "left" | "top-left" | "top-right" | "bottom-right" | "bottom-left"
- prefix?: ReactNode
- suffix?: ReactNode
- variant?: "default" | "ghost" = default
- focusRing?: boolean = false
- characterCount?: boolean
- cursor?: undefined | "interactive"
- onValueChange?: (value: string) => void
- validate?: (value: ReactNode) => ReactNode | null
- loading?: boolean = false
- reveal?: boolean = true
- span?: number
- fillWidth?: boolean = true

### Textarea
Mixins: LeafProps.
- id: string
- label?: string
- placeholder?: string
- lines?: number | "auto" = auto
- size?: TShirtSizes
- error?: boolean = false
- errorMessage?: ReactNode
- description?: ReactNode
- corners?: "none" | "top" | "right" | "bottom" | "left" | "top-left" | "top-right" | "bottom-right" | "bottom-left"
- prefix?: ReactNode
- suffix?: ReactNode
- variant?: "default" | "ghost" = default
- focusRing?: boolean = false
- characterCount?: boolean
- resize?: "horizontal" | "vertical" | "both" | "none" = vertical
- onValueChange?: (value: string) => void
- validate?: (value: ReactNode) => ReactNode | null
- disabled?: boolean = false
- span?: number
- fillWidth?: boolean = true

### Tag
Mixins: CommonProps, DisplayProps, FlexProps, SizeProps, SpacingProps, StyleProps.
Avoid: Passing the same text as label and children — the children are dropped
- tone?: Tone
- variant?: "default" | "gradient" | "announce" = default
- size?: TShirtSizes
- label?: string = ""
- prefixIcon?: IconName
- suffixIcon?: IconName
- href?: string
- arrow?: boolean
- effect?: boolean = variant === "announce"
- selected?: boolean
- onClick?: MouseEventHandler<HTMLDivElement>
- onRemove?: () => void
- removeButtonProps?: Partial<IconButtonProps>
- children?: ReactNode

### Avatar
Mixins: LeafProps.
- size?: TShirtSizes | number | CSSUnit = m
- value?: string
- src?: string
- unoptimized?: boolean
- loading?: boolean
- empty?: boolean
- icon?: IconName
- statusIndicator?: { scheme: "green" | "yellow" | "red" | "gray"; }
- style?: CSSProperties = {}

### Dialog
Mixins: CommonProps, DisplayProps, FlexProps, SizeProps, SpacingProps, StyleProps.
- open: boolean
- onClose: () => void
- title: ReactNode | string
- description?: ReactNode
- children?: ReactNode
- footer?: ReactNode
- variant?: "center" | "sheet" = center
- backdrop?: ReactNode
- base?: boolean
- stack?: boolean
- flush?: boolean = false
- showClose?: boolean = true
- onHeightChange?: (height: number) => void
- minHeight?: number
- closeOnClickaway?: boolean = true

### Skeleton
Mixins: CommonProps, DisplayProps, FlexProps, SizeProps, SpacingProps, StyleProps.
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
- onBackground?: Colors
- onSolid?: Colors
- align?: CSSProperties["textAlign"]
- children?: ReactNode
- className?: string
- style?: React.CSSProperties

### DisplayProps
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
- showIn?: "dark" | "light"

### FlexProps
- center?: boolean
- s?: FlexBreakpointProps
- direction?: "row" | "column" | "row-reverse" | "column-reverse"
- horizontal?: "start" | "center" | "end" | "between" | "around" | "even" | "stretch"
- vertical?: "start" | "center" | "end" | "between" | "around" | "even" | "stretch" | "baseline"
- wrap?: boolean
- flex?: FlexValue
- xl?: FlexBreakpointProps
- l?: FlexBreakpointProps
- m?: FlexBreakpointProps
- xs?: FlexBreakpointProps

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
- padding?: SpacingToken | number | CSSUnit
- paddingLeft?: SpacingToken | number | CSSUnit
- paddingRight?: SpacingToken | number | CSSUnit
- paddingTop?: SpacingToken | number | CSSUnit
- paddingBottom?: SpacingToken | number | CSSUnit
- paddingX?: SpacingToken | number | CSSUnit
- paddingY?: SpacingToken | number | CSSUnit
- margin?: SpacingToken | number | CSSUnit | "auto"
- marginLeft?: SpacingToken | number | CSSUnit | "auto"
- marginRight?: SpacingToken | number | CSSUnit | "auto"
- marginTop?: SpacingToken | number | CSSUnit | "auto"
- marginBottom?: SpacingToken | number | CSSUnit | "auto"
- marginX?: SpacingToken | number | CSSUnit | "auto"
- marginY?: SpacingToken | number | CSSUnit | "auto"
- gap?: SpacingToken | number | CSSUnit | "-1"
- top?: SpacingToken | number | CSSUnit
- right?: SpacingToken | number | CSSUnit
- bottom?: SpacingToken | number | CSSUnit
- left?: SpacingToken | number | CSSUnit
- translateX?: SpacingToken | number | CSSUnit
- translateY?: SpacingToken | number | CSSUnit

### StyleProps
- textVariant?: TextVariant
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
- blur?: BlurSize | number | CSSUnit
- backdropBlur?: BlurSize | number | CSSUnit
- theme?: "light" | "dark"
- themeBorder?: BorderStyle
- themeSolid?: SolidType
- themeSurface?: SurfaceStyle
- radius?: RadiusSize | `${RadiusSize}-${RadiusNest}`

### LeafProps
- margin?: SpacingToken | number | CSSUnit | "auto"
- marginTop?: SpacingToken | number | CSSUnit | "auto"
- marginRight?: SpacingToken | number | CSSUnit | "auto"
- marginBottom?: SpacingToken | number | CSSUnit | "auto"
- marginLeft?: SpacingToken | number | CSSUnit | "auto"
- marginX?: SpacingToken | number | CSSUnit | "auto"
- marginY?: SpacingToken | number | CSSUnit | "auto"
- flex?: FlexValue
- fillWidth?: boolean
- position?: CSSProperties["position"]
- top?: SpacingToken | number | CSSUnit
- right?: SpacingToken | number | CSSUnit
- bottom?: SpacingToken | number | CSSUnit
- left?: SpacingToken | number | CSSUnit
- className?: string
- style?: CSSProperties

### TextProps
- as?: ElementType
- textVariant?: TextVariant
- wrap?: CSSProperties["textWrap"]
- family?: TextType
- weight?: TextWeight
- truncate?: boolean

### GridProps
- columns?: GridSize
- minColumnWidth?: number | SpacingToken | CSSUnit
- rows?: GridSize
- xl?: GridBreakpointProps
- l?: GridBreakpointProps
- m?: GridBreakpointProps
- s?: GridBreakpointProps
- xs?: GridBreakpointProps

## Types

```ts
type BlendMode = "color" | "screen" | "normal" | "multiply" | "overlay" | "darken" | "lighten" | "difference" | "exclusion" | "hue" | "saturation" | "luminosity" | `color-${"dodge" | "burn"}` | "hard-light" | "soft-light" | "plus-lighter"
type BlurSize = "s" | "xl" | "l" | "m" | "xs"
type BorderStyle = "rounded" | "playful" | "conservative" | "sharp"
type BreakpointKey = "s" | "xl" | "l" | "m" | "xs"
type ButtonVariant = "link" | "ghost" | "subtle" | "primary" | "secondary" | "tertiary"
type CSSUnit = `${number}px` | `${number}rem` | `${number}em` | `${number}ch` | `${number}%` | `${number}vh` | `${number}vw` | `${number}dvh` | `${number}dvw` | `${number}svh` | `${number}svw` | `${number}lvh` | `${number}lvw` | `${number}vmin` | `${number}vmax` | `${number}cqw` | `${number}cqh` | `calc(${string})` | `min(${string})` | `max(${string})` | `clamp(${string})` | `var(${string})`
type ColorScheme = "neutral" | "brand" | "accent" | "info" | "danger" | "warning" | "success"
type ColorWeight = "strong" | "medium" | "weak"
type Colors = `${"neutral" | "brand" | "accent" | "info" | "danger" | "warning" | "success"}-${"strong" | "medium" | "weak"}` | `${"neutral" | "brand" | "accent" | "info" | "danger" | "warning" | "success"}-alpha-${"strong" | "medium" | "weak"}`
type DisplayProps = the DisplayProps mixin above
type FlexBreakpointProps = Exclude<GridBreakpointProps, "columns" | "rows"> | "center" | "direction" | "horizontal" | "vertical" | "wrap" | "flex"
type FlexValue = "0" | "1" | "10" | "2" | "3" | "4" | "8" | "12" | "5" | "6" | "7" | "9" | "11"
type GridBreakpointProps = Exclude<FlexBreakpointProps, "center" | "direction" | "horizontal" | "vertical" | "wrap" | "flex"> | "columns" | "rows"
type GridProps = the GridProps mixin above
type GridSize = "1" | "10" | "2" | "3" | "4" | "8" | "12" | "5" | "6" | "7" | "9" | "11"
type IconButtonProps = IconButton props
type IconName = "symbol" | "code" | "link" | "search" | "time" | "video" | "filter" | "image" | "security" | "opacity" | "info" | "danger" | "warning" | "adjustments" | "arrowLeft" | "arrowRight" | "arrowUpRight" | "ball" | "banknotes" | "barChart" | "bell" | "bolt" | "book" | "bookmark" | "calendar" | "cart" | "chat" | "check" | "checkbox" | "chevronDoubleLeft" | "chevronDoubleRight" | "chevronDown" | "chevronLeft" | "chevronRight" | "chevronUp" | "chevronsLeftRight" | "clipboard" | "close" | "computer" | "copy" | "dark" | "dislike" | "document" | "download" | "edit" | "enter" | "eye" | "eyeDropper" | "eyeOff" | "file" | "flag" | "folder" | "food" | "forward" | "gift" | "globe" | "heart" | "help" | "home" | "inbox" | "light" | "like" | "linearGauge" | "lock" | "logout" | "mail" | "maximize" | "minimize" | "minus" | "moreHorizontal" | "organization" | "pause" | "paw" | "payment" | "person" | "personRemove" | "play" | "plus" | "radialGauge" | "refresh" | "return" | "screen" | "send" | "settings" | "smiley" | "sparkle" | "star" | "starFill" | "store" | "tag" | "trash" | "trend" | "trendDown" | "trendUp" | "upload" | "volume" | "volumeOff" | "wordmark" | "world"
type Opacity = "0" | "10" | "20" | "30" | "40" | "50" | "60" | "70" | "80" | "90" | "100"
type RadiusNest = "4" | "8"
type RadiusSize = "s" | "xl" | "l" | "m" | "xs" | "none" | "full"
type ScrubberBlock = { id: string; start: number; end: number; label?: React.ReactNode; tone?: Tone; locked?: boolean }
type ScrubberTrack = { id: string; blocks: ScrubberBlock[]; height?: SpacingToken; tone?: Tone; movable?: boolean; resizable?: boolean; onAdd?: (time: number) => void }
type ShadowSize = "s" | "xl" | "l" | "m" | "xs"
type SolidType = "color" | "contrast" | "inverse"
type SpacingToken = "s" | "xl" | "l" | "m" | "xs" | "0" | "32" | "1" | "2" | "4" | "64" | "160" | "8" | "12" | "16" | "20" | "24" | "40" | "48" | "56" | "72" | "80" | "104" | "128"
type StyleProps = the StyleProps mixin above
type SurfaceStyle = "filled" | "translucent"
type TShirtSizes = "s" | "xl" | "l" | "m" | "xs"
type TextType = "body" | "code" | "label" | "heading" | "display"
type TextVariant = `${"body" | "code" | "label" | "heading" | "display"}-${"strong" | "default" | "normal" | "medium"}-${"xl" | "xs" | "s" | "l" | "m"}`
type TextWeight = "strong" | "default" | "normal" | "medium"
type ToastContextProps = { toasts: Toast[]; addToast: (toast: Omit<Toast, "id">) => string; removeToast: (id: string) => void }
type Tone = "neutral" | "brand" | "accent" | "info" | "danger" | "warning" | "success"
type UserSelect = "text" | "auto" | "none" | "all"
```

## Gotchas

- Timeline lays a sequence of steps down the page. For a video or audio editor's timeline — a playhead over stacked tracks of movable, trimmable blocks — use Scrubber. Do not build one out of Flex and absolute positioning.
- Use fill not fillWidth fillHeight; center not horizontal="center" vertical="center"; Row/Column not Flex direction=, and Row for a Flex with no direction (Flex defaults to row). Flex is for a direction that changes at a breakpoint.
- zIndex is for an isolated stacking group: an absolute decorative layer and its content sibling (zIndex={1}), or a sticky header over its pane. Never on a lone element, never a page-wide ladder of 3 / 5 / 9 — restructure the tree instead.
- Icon names must come from the IconName type below, and IconName is a real union in 2.0 (an unregistered name is a type error, not a blank space). Do not guess a plausible name, and do not cast one with `as IconName` to silence the check. Brand marks are not in the set — an app registers those itself by augmenting IconLibraryOverrides.
- Responsive xl/l/m/s/xs props exist only on Flex, Row, Column and Grid. Button, Text, Heading and the rest have none: to change one at a breakpoint, wrap it in a Row or Column and put the breakpoint prop there (s={{ hide: true }}).
- A number on any size, spacing or offset prop is on the token scale in 3.0 (it was rem in 2.x): width={32} renders as width="32" (2rem, 32 px at the defaults, scaled by data-scaling), maxWidth={40} is 2.5rem. For 40rem write the string, maxWidth="40rem". An icon or avatar box is usually "24" to "48", or 24 to 48 as numbers.
- gap, padding and margin take spacing tokens ("0", "1", "2", "4", "8", "12", "16", "20", "24", "32", "40", "48", "56", "64", "72", "80", "104", "128", "160", or xs–xl). "6" and "10" are not tokens and are type errors.
- Row, Column and Grid have no span prop: a Grid child spanning columns uses style={{ gridColumn: "span 2" }}.
- Time is milliseconds everywhere in 3.0: RevealFx (duration, delay), ShineFx and CountFx (duration), TypeFx (charDuration, delay, hold), CelebrationFx and WeatherFx (duration — 5000, not 5), MatrixFx bulge.duration, FlipFx autoFlipInterval, Animation and HoverCard (delay, duration; HoverCard placement="cover" also hideDelay) and Skeleton (delay). Stagger with delay={index * 100}, never index * 0.1 (that was 1.8.x; 0.1 is a tenth of a millisecond, i.e. no stagger). speed is only a multiplier (1 the default, 0.5 half) or "slow"/"medium"/"fast" (0.5/1/2), on MatrixFx, WeatherFx, ParticleFx, CelebrationFx, Effect, Scroller auto, GlitchFx and LetterFx; RevealFx/ShineFx/CountFx speed is duration and TypeFx speed is charDuration since 3.0.
- Never cast an icon name with `as IconName`: the cast compiles a name the registry does not have, and it renders nothing. Use a name from iconNames; in data, type the field as IconName ({ icon: IconName }[]) or write the literal `as const`, so the type check still runs.
- In a Next.js app, import LayoutProvider from "@once-ui-system/core/next", not the package root. The root export installs the plain DOM adapters, so SmartLink, Button/Card/ToggleButton with href, Media, Logo, MegaMenu and Kbar render a plain <a> and <img>: no client-side navigation, no next/image, and no error to say so. An app that composes NextAdapterProvider (or AdapterProvider with nextAdapters) itself is already covered.
- Fixed in 2.1: a Button or IconButton that is a Dropdown trigger renders a real <button type="button"> with aria-haspopup and aria-expanded, so it is reachable by keyboard. Pass it as trigger as is; do not add type="button" or a no-op onClick, or wrap it in a focusable Row, to make it one.
- Pass a Tag's text once, as label or as children — with both, the children are dropped. Badge and Chip are Tag in 3.0.
- Colors are semantic tokens ({tone}-{weight}), never hex/rgb. background also accepts surface | overlay | page | transparent.
- Inline SVG paint is not a hex or rgb literal either: write fill or stroke as currentColor and set the colour with onBackground on the wrapper, or name a token as var(--brand-solid-strong). A literal never follows the theme.
- Write 2.x prop names, not 1.x ones from memory: open (not isOpen), checked (not isChecked), SegmentedControl value/onValueChange/defaultValue (not selected/onToggle/defaultSelected), Tag tone (not scheme or variant), Button tone="danger" (not variant="danger"), Text/Heading textVariant (not variant), field size/prefix/suffix/corners (not height/hasPrefix/hasSuffix/radius). The validator names the 2.x prop.
- Theme a subtree with the typed props theme, themeBorder, themeSolid and themeSurface — on Flex, Row, Column, Grid and every component built on them (Background, Tag, the effects) — not raw data-theme, data-border, data-solid or data-surface. Keep the raw attribute only where no prop exists: data-border="rounded" on Button and IconButton, data-brand anywhere.
- Never write props equal to defaults or implied by another prop on the element: position="relative", direction on Row/Column, variant="primary" on Button, fillWidth beside maxWidth (maxWidth already fills the width), minWidth={0} beside fillWidth (fillWidth already sets min-width: 0).
- Bare border (and borderTop, borderBottom, borderX, …) draws the default border: --default-border, neutral-alpha-weak unless the app sets it in its custom CSS. Do not write border="neutral-alpha-weak" to get it, which pins the colour; name a colour only to deviate, e.g. border="neutral-alpha-medium" or border="brand-alpha-medium".
- Gap between page sections: 80–160 (typical 104). Inside sections: 24–40.
- Hero = display-strong-l/xl; section titles = display-strong-xs/s — never heading-* for section titles.
- overflow="hidden" on full-bleed sections clips glows into hard bands — only use when parent has radius.
- Leaf components (Button, IconButton, ToggleButton, the fields, Switch, Checkbox, RadioButton, Text, Heading, Icon, Avatar, Spinner, StatusIndicator, Kbd, InlineCode, ProgressBar, Logo, SmartLink, NavIcon) take only margins, flex, fillWidth, position, top/right/bottom/left, className and style besides their own props. Padding, background, border, radius, sizes, hide and breakpoints go on a Row around it (a Column around Text or Heading; <Row fit> for an Icon's box).

## Quality bar

- The shell takes the viewport (height="100dvh", never 100vh) and each pane scrolls on its own
- overflowY="auto" on each SplitView panel, never on the SplitView; set labels so the tabs it collapses into below collapseBelow are named
- Scrubber is a sibling of the SplitView, spanning both panes; onGestureStart pauses playback
- IconButtons with tooltips in a Row with borderBottom; one primary action at most

## Layout shell

### 3. Editor shell

Two panes and a timeline — the shape of a video editor, a page builder, a
diff view. `ai/examples/editor.tsx` (task bundle `editor`) is the whole page
around it: toolbar, layer list, canvas and a working timeline.

```tsx
<Column fill>
  <SplitView
    fill
    leftPanel={<Column fill overflowY="auto">{/* layers, blocks, files */}</Column>}
    rightPanel={<Column fill overflowY="auto">{/* canvas, preview */}</Column>}
    defaultSplit={0.28}
    minSplit={0.2}
    maxSplit={0.6}
    collapseBelow="s"
    labels={{ left: "Layers", right: "Canvas" }}
  />
  <Scrubber
    duration={duration}
    value={time}
    onValueChange={setTime}
    tracks={tracks}
    onGestureStart={pause}
  />
</Column>
```

- **`overflowY="auto"` on each panel, not on the SplitView.** The divider needs
  the container to stay put while the panes scroll independently.
- **`collapseBelow` + `labels`.** Below the breakpoint the split becomes tabs, and
  `labels` is what they say. Without it the tabs are unlabelled.
- **`onGestureStart` pauses playback.** Scrubbing while playing fights the
  playhead — the drag sets a time, playback immediately moves it.
- **The timeline is a sibling of the split, not inside it.** It spans both panes,
  and putting it in one makes the divider drag it.

## Gold example (`examples/editor.tsx`)

```tsx
"use client";

/**
 * Gold example: editor shell
 * Target: a toolbar, two panes that scroll on their own, and a timeline that
 * spans both — the shape of a video editor, a page builder or a diff view.
 *
 * `ai/layouts.md` §3 says why each piece sits where it does: overflow on the
 * panels and not the SplitView, labels for the tabs it collapses into, the
 * timeline as a sibling of the split, playback paused while scrubbing.
 */
import { Column, IconButton, Row, SplitView, Text, ToggleButton } from "@once-ui-system/core";
import { Scrubber } from "@once-ui-system/core/media";
import { useState } from "react";

type Track = NonNullable<React.ComponentProps<typeof Scrubber>["tracks"]>[number];

const DURATION = 30;

const initialTracks: Track[] = [
  {
    id: "video",
    tone: "brand",
    movable: true,
    resizable: true,
    blocks: [
      { id: "intro", start: 0, end: 6, label: "Intro" },
      { id: "demo", start: 6, end: 22, label: "Demo" },
      { id: "outro", start: 22, end: 30, label: "Outro" },
    ],
  },
  {
    id: "audio",
    tone: "accent",
    blocks: [{ id: "music", start: 0, end: 30, label: "Music", locked: true }],
  },
];

export function EditorExample() {
  const [tracks, setTracks] = useState(initialTracks);
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [selected, setSelected] = useState<string | null>("intro");

  const blocks = tracks.flatMap((track) => track.blocks);
  const current = blocks.find((block) => block.id === selected);

  return (
    <Column fillWidth height="100dvh">
      <Row
        fillWidth
        horizontal="between"
        vertical="center"
        gap="8"
        paddingX="12"
        paddingY="8"
        borderBottom
      >
        <Row gap="8" vertical="center">
          <IconButton
            icon={playing ? "pause" : "play"}
            variant="tertiary"
            tooltip={playing ? "Pause" : "Play"}
            onClick={() => setPlaying(!playing)}
          />
          <Text textVariant="label-default-s" onBackground="neutral-weak">
            Untitled project
          </Text>
        </Row>
        <IconButton icon="download" variant="secondary" tooltip="Export" />
      </Row>

      <SplitView
        fill
        defaultSplit={0.28}
        minSplit={0.2}
        maxSplit={0.6}
        collapseBelow="s"
        labels={{ left: "Layers", right: "Canvas" }}
        leftPanel={
          <Column fill overflowY="auto" padding="8" gap="4">
            {blocks.map((block) => (
              <ToggleButton
                key={block.id}
                fillWidth
                horizontal="start"
                selected={block.id === selected}
                onClick={() => setSelected(block.id)}
              >
                {block.label}
              </ToggleButton>
            ))}
          </Column>
        }
        rightPanel={
          <Column fill overflowY="auto" padding="24" center background="surface">
            <Column maxWidth="40rem" aspectRatio="16/9" radius="l" border background="page" center>
              <Text textVariant="label-default-s" onBackground="neutral-weak">
                {current ? current.label : "Nothing selected"}
              </Text>
            </Column>
          </Column>
        }
      />

      <Column fillWidth paddingX="12" paddingY="8" borderTop>
        <Scrubber
          duration={DURATION}
          value={time}
          onValueChange={setTime}
          tracks={tracks}
          selected={selected}
          onSelectedChange={setSelected}
          onGestureStart={() => setPlaying(false)}
          onBlockChange={(trackId, blockId, next) =>
            setTracks((all) =>
              all.map((track) =>
                track.id !== trackId
                  ? track
                  : {
                      ...track,
                      blocks: track.blocks.map((block) =>
                        block.id === blockId ? { ...block, ...next } : block,
                      ),
                    },
              ),
            )
          }
        />
      </Column>
    </Column>
  );
}
```
