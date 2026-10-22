# Chat UI

Message list with avatars, typing indicator, composer with send and attach, conversation list

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

## Components

Props marked `?` are optional; `= x` is the default; `- a, b?: T` is two props of type `T`. A component's mixins add the props listed under Mixins.

### ChatMessageList
Mixins: CommonProps, DisplayProps, FlexProps, SizeProps, SpacingProps, StyleProps.
- stickToBottom?: boolean = true
- onReachStart?: () => void
- aria-label?: string

### ChatMessage
Mixins: CommonProps, DisplayProps, FlexProps, SizeProps, SpacingProps, StyleProps.
- children, name, attachments, footer, actions?: ReactNode
- from?: "self" | "other" = other
- avatarProps?: AvatarProps
- time?: ChatTime
- status?: ChatMessageStatus
- statusLabels?: Partial<Record<ChatMessageStatus, string>>
- onRetry?: () => void
- retryLabel?: string = Retry
- grouped?: boolean = false
- variant?: "bubble" | "plain" = bubble

### ChatComposer
Mixins: CommonProps, DisplayProps, FlexProps, SizeProps, SpacingProps, StyleProps.
- onSend: (message: ChatComposerMessage) => void | Promise<void>
- value, aria-label, id?: string
- defaultValue?: string = ""
- onValueChange?: (value: string) => void
- placeholder?: string = Write a message
- attach?: boolean | { accept?: string; multiple?: boolean } = false
- sendOnEnter?: boolean = true
- loading, disabled?: boolean = false
- sendLabel?: string = Send
- attachLabel?: string = Attach files
- removeLabel?: (fileName: string) => string = (fileName) => `Remove ${fileName}`
- prefix, actions, toolbar, hint?: ReactNode
- sendIcon?: IconName = send
- maxLength?: number

### TypingIndicator
Mixins: CommonProps, DisplayProps, FlexProps, SizeProps, SpacingProps, StyleProps.
- label?: ReactNode
- aria-label?: string
- bubble?: boolean = true

### ConversationItem
Mixins: CommonProps, DisplayProps, FlexProps, SizeProps, SpacingProps, StyleProps.
- name: ReactNode
- preview?: ReactNode
- time?: ChatTime
- avatarProps?: AvatarProps
- unread?: number | boolean
- unreadLabel?: (count: number | true) => string = defaultUnreadLabel
- selected, typing?: boolean = false
- typingLabel?: ReactNode = typing…
- href?: string
- onClick?: (event: React.MouseEvent<HTMLElement>) => void

### Column
Mixins: CommonProps, DisplayProps, FlexProps, SizeProps, SpacingProps, StyleProps.
Use instead of Flex with direction="column".

### Row
Mixins: CommonProps, DisplayProps, FlexProps, SizeProps, SpacingProps, StyleProps.
Use instead of Flex with direction="row".

### SplitView
Mixins: CommonProps, DisplayProps, FlexProps, SizeProps, SpacingProps, StyleProps.
- leftPanel, rightPanel: ReactNode
- labels?: { left: string; right: string }
- collapseBelow?: BreakpointKey | false = s
- defaultSplit?: number = 0.3
- minSplit?: number = 0.2
- maxSplit?: number = 0.8

### Avatar
Mixins: LeafProps.
- size?: TShirtSizes | number | CSSUnit = m
- value, src?: string
- unoptimized, loading, empty?: boolean
- icon?: IconName
- statusIndicator?: { scheme: StatusIndicatorScheme; tone?: undefined } | { tone: Tone; scheme?: undefined }
- style?: CSSProperties = {}

### Text
Mixins: CommonProps, LeafProps, TextProps.
Avoid: Layout props: it takes padding, margin, flex and s={{ hide }} but no other breakpoint props, border, radius or background; wrap it in a Row for those. A key cap is Kbd
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

### EmojiPicker (from `@once-ui-system/core/emoji`)
Mixins: CommonProps, DisplayProps, FlexProps, SizeProps, SpacingProps, StyleProps.
- onSelect: (emoji: string) => void
- trigger?: React.ReactNode
- open?: boolean
- defaultOpen?: boolean = false
- onOpenChange?: (open: boolean) => void
- placement?: Placement
- closeAfterClick?: boolean = true
- dropdownProps?: Omit< DropdownProps, "trigger" | "children" | "dropdown" | "open" | "onOpenChange" >
- onClose?: () => void
- className?: string
- background?: StyleProps["background"]
- columns?: GridSize
- style?: React.CSSProperties

### Fade
Mixins: CommonProps, DisplayProps, FlexProps, SizeProps, SpacingProps, StyleProps.
Avoid: Wrapping content — it is an absolute edge overlay, not a container
- className?: string
- to?: "bottom" | "top" | "left" | "right" = bottom
- base?: BaseColor = page
- blur?: number | CSSUnit
- pattern?: { display?: boolean; size?: SpacingToken; } = { display: false, size: "4", }
- style?: React.CSSProperties
- children?: ReactNode

### Kbd
Mixins: LeafProps.
- keys?: string | readonly string[]
- label?: string | ReactNode
- children?: ReactNode

### User
- name, tag, className?: string
- children, subline, dropdown?: React.ReactNode
- tagProps?: TagProps
- loading?: boolean
- avatarProps?: AvatarProps
- selected?: boolean = false
- onSelect?: (value: string) => void
- placement?: Placement
- minWidth?: DropdownProps["minWidth"]
- maxWidth?: DropdownProps["maxWidth"]
- minHeight?: DropdownProps["minHeight"]
- style?: React.CSSProperties

### Line
Mixins: CommonProps, DisplayProps, FlexProps, SizeProps, SpacingProps, StyleProps.
- vert?: boolean
- style?: React.CSSProperties

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
- cursor?: CSSProperties["cursor"] | "interactive" | CursorPresetValue | ReactNode
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
type AvatarProps = Avatar props
type AwaitedReactNode = "undefined" | "null" | "string" | "number" | "bigint" | "false" | "true" | "ReactPortal" | ReactElement<unknown, string | JSXElementConstructor<any>> | "Iterable<ReactNode>"
type BaseColor = Colors | "page" | "surface" | "overlay" | "transparent"
type BlendMode = "color" | "screen" | "normal" | "multiply" | "overlay" | "darken" | "lighten" | "difference" | "exclusion" | "hue" | "saturation" | "luminosity" | `color-${"dodge" | "burn"}` | "hard-light" | "soft-light" | "plus-lighter"
type BlurSize = "s" | "xl" | "l" | "m" | "xs"
type BorderStyle = "rounded" | "playful" | "conservative" | "sharp"
type BreakpointKey = "s" | "xl" | "l" | "m" | "xs"
// type ButtonVariant is one of these strings: link ghost subtle primary secondary tertiary
type CSSUnit = `${number}px` | `${number}rem` | `${number}em` | `${number}ch` | `${number}%` | `${number}vh` | `${number}vw` | `${number}dvh` | `${number}dvw` | `${number}svh` | `${number}svw` | `${number}lvh` | `${number}lvw` | `${number}vmin` | `${number}vmax` | `${number}cqw` | `${number}cqh` | `calc(${string})` | `min(${string})` | `max(${string})` | `clamp(${string})` | `var(${string})`
type ChatComposerMessage = { text: string; files: File[] }
type ChatMessageStatus = "sending" | "sent" | "delivered" | "read" | "failed"
type ChatTime = "undefined" | "null" | "string" | "number" | "bigint" | "false" | "true" | ReactElement<unknown, string | JSXElementConstructor<any>> | "Iterable<ReactNode>" | "ReactPortal" | "Promise<AwaitedReactNode>" | "Date"
// type ColorScheme is one of these strings: neutral brand accent info danger warning success
type ColorWeight = "strong" | "medium" | "weak"
type Colors = Exclude<BaseColor, "page" | "surface" | "overlay" | "transparent">
type CursorPresetValue = "rounded" | "soft" | "dot" | "system"
type DropdownProps = Dropdown props
// type FieldSize is one of these strings: s xl l m xs xxs
// type FlexBreakpointProps: an object of these Flex props, all optional (padding* is padding, paddingX, paddingTop and the rest):
// center style direction horizontal vertical wrap flex textVariant background solid border* radius shadow padding* margin* gap top right bottom left width height maxWidth minWidth minHeight maxHeight fit* fill* aspectRatio onBackground onSolid align hide pointerEvents position overflow* scrollbar transition opacity zIndex
// type FlexValue is one of these strings: 0 1 10 2 3 4 9 12 5 8 6 7 11
// type GridBreakpointProps: an object of these Grid props, all optional (padding* is padding, paddingX, paddingTop and the rest):
// style textVariant background solid border* radius shadow padding* margin* gap top right bottom left width height maxWidth minWidth minHeight maxHeight fit* fill* aspectRatio onBackground onSolid align hide pointerEvents position overflow* scrollbar transition opacity zIndex columns rows
// type GridSize is one of these strings: 1 10 2 3 4 9 12 5 8 6 7 11
type IconButtonProps = IconButton props
// type IconName is one of these names, and only these:
// symbol code link menu search time video filter image security opacity info danger warning adjustments arrowDown arrowLeft arrowRight arrowUp arrowUpRight ball banknotes barChart bell bolt book bookmark calendar cart chat check checkbox chevronDoubleLeft chevronDoubleRight chevronDown chevronLeft chevronRight chevronUp chevronsLeftRight clipboard close computer copy cube dark dislike document download edit enter eye eyeDropper eyeOff file flag folder food forward gift globe grid grip heart help home inbox light like linearGauge lock logout mail mapPin maximize minimize minus moreHorizontal newspaper organization pause paw payment people person personRemove phone play plus radialGauge refresh return screen send settings smiley sparkle star starFill store tag trash trend trendDown trendUp upload volume volumeOff wordmark world
// type Opacity is one of these strings: 0 10 20 30 40 50 60 70 80 90 100
type Placement = "top" | "right" | "bottom" | "left" | `${"top" | "right" | "bottom" | "left"}-${"end" | "start"}`
type RadiusNest = "4" | "8"
// type RadiusSize is one of these strings: s xl l m xs none full
type ShadowSize = "s" | "xl" | "l" | "m" | "xs"
type SolidType = "color" | "contrast" | "inverse"
// type SpacingToken is one of these strings: s xl l m xs 0 32 1 2 4 64 160 12 8 16 20 24 40 48 56 72 80 104 128
// type StaticSpacingToken is one of these strings: 0 32 1 2 4 64 160 12 8 16 20 24 40 48 56 72 80 104 128
// type StatusIndicatorScheme is one of these strings: blue indigo violet magenta pink red orange yellow moss green emerald aqua cyan sand gray slate rose mint dusk
type SurfaceStyle = "filled" | "translucent"
type TShirtSizes = "s" | "xl" | "l" | "m" | "xs"
type TagProps = Tag props
type TextBreakpointHide = { hide?: boolean }
type TextType = "body" | "code" | "label" | "heading" | "display"
type TextVariant = `${"body" | "code" | "label" | "heading" | "display"}-${"strong" | "default" | "normal" | "medium"}-${"xl" | "xs" | "s" | "l" | "m"}`
type TextWeight = "strong" | "default" | "normal" | "medium"
type ToastContextProps = { toasts: Toast[]; addToast: (toast: Omit<Toast, "id">) => string; removeToast: (id: string) => void }
// type Tone is one of these strings: neutral brand accent info danger warning success
type UserSelect = "text" | "auto" | "none" | "all"
```

## Gotchas

- Pass a Tag's text once, as label or as children — with both, the children are dropped. Badge and Chip are Tag in 3.0.
- Never cast an icon name with `as IconName`: the cast compiles a name the registry does not have, and it renders nothing. Use a name from iconNames; in data, type the field as IconName ({ icon: IconName }[]) or write the literal `as const`, so the type check still runs.
- Field heights run a step above Button's: Input size xs is 40px, s 48px, m 56px (the default). A field beside a size="s" Button (32px), as in a toolbar or filter row, takes size="xxs", which is 32px too; Form size="xxs" sets it for every field inside. An xxs field has no floating label: label shows as the placeholder, so keep label for the accessible name.
- Fixed in 2.1: a Button or IconButton that is a Dropdown trigger renders a real <button type="button"> with aria-haspopup and aria-expanded, so it is reachable by keyboard. Pass it as trigger as is; do not add type="button" or a no-op onClick, or wrap it in a focusable Row, to make it one.
- Write 2.x prop names, not 1.x ones from memory: open (not isOpen), checked (not isChecked), SegmentedControl value/onValueChange/defaultValue (not selected/onToggle/defaultSelected), Tag tone (not scheme or variant), Button tone="danger" (not variant="danger"), Text/Heading textVariant (not variant), field size/prefix/suffix/corners (not height/hasPrefix/hasSuffix/radius). The validator names the 2.x prop.
- Tag is a div by default; inside a sentence (<Text as="p">, <p>) give it as="span".
- overflow="hidden" on full-bleed sections clips glows into hard bands — only use when parent has radius.
- Leaf components (Button, IconButton, ToggleButton, the fields, Switch, Checkbox, RadioButton, Text, Heading, Icon, Avatar, Spinner, StatusIndicator, Kbd, InlineCode, ProgressBar, Logo, SmartLink, NavIcon) take only margins, flex, fillWidth, position, top/right/bottom/left, className and style besides their own props. Padding, background, border, radius, sizes, hide and breakpoints go on a Row around it (a Column around Text or Heading; <Row fit> for an Icon's box).

## Gold example (`examples/blocks/Chat1.tsx`)

```tsx
"use client";

import { Avatar, Column, Row, Text } from "@once-ui-system/core";
import { useState } from "react";
import type { ChatMember } from "./content/chat1content";
import { chatMembers } from "./content/chat1content";
import { Feed3 } from "./Feed3";
import { Sidebar4 } from "./Sidebar4";
import { Sidebar5 } from "./Sidebar5";
import { Table1 } from "./Table1";

type MemberRow = ChatMember["members"][number] & { group: string };

export const Chat1 = () => {
  const [activeItem, setActiveItem] = useState<string | undefined>(undefined);

  const membersData = chatMembers.flatMap((section) =>
    (section.members ?? []).map((m) => ({
      ...m,
      group: section.title,
    })),
  );

  const membersColumns = [
    {
      key: "member",
      title: <Text textVariant="label-default-s">Member</Text>,
      render: (item: MemberRow) => (
        <Row fillWidth gap="12" vertical="center">
          <Avatar src={item.avatar || undefined} />
          <Column fillWidth>
            <Text textVariant="label-default-s">{item.name}</Text>
            <Text textVariant="body-default-xs" onBackground="neutral-weak" truncate>
              {item.status}
            </Text>
          </Column>
        </Row>
      ),
    },
    {
      key: "group",
      title: <Text textVariant="label-default-s">Role</Text>,
      render: (item: MemberRow) => (
        <Text textVariant="label-default-s" onBackground="neutral-weak">
          {item.group}
        </Text>
      ),
    },
    {
      key: "status",
      title: <Text textVariant="label-default-s">Bio</Text>,
      render: (item: MemberRow) => (
        <Text textVariant="label-default-s" onBackground="neutral-weak" truncate>
          {item.bio || "—"}
        </Text>
      ),
    },
  ];

  return (
    <Row fill>
      <Sidebar4 activeItem={activeItem} onSelectItem={setActiveItem} />
      {activeItem === "Members" ? (
        <Row fillWidth padding="24">
          <Table1
            fitHeight
            background="surface"
            data={membersData}
            columns={membersColumns}
            selectable
            getId={(i: MemberRow) => i.name}
            heading={<Text textVariant="label-default-m">Members</Text>}
            showSearch
            filterFn={(item: MemberRow, q: string) =>
              [item.name, item.status, item.bio, item.group]
                .filter(Boolean)
                .some((v: string) => v.toLowerCase().includes(q))
            }
          />
        </Row>
      ) : (
        <Feed3 />
      )}
      <Sidebar5 />
    </Row>
  );
};
```
