# Chat UI

An assistant or team chat: conversation list, thread with a typing or working state, composer with send and attach, the assistant's Mascot, every loading, empty and error state

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

### ChatMessageList
Mixins: CommonProps, DisplayProps, FlexProps, SizeProps, SpacingProps, StyleProps.
- stickToBottom?: boolean = true
- onReachStart?: () => void
- aria-label?: string
- stack?: boolean = false
- stackWithin?: number = 5

### ChatMessage
Mixins: CommonProps, DisplayProps, FlexProps, SizeProps, SpacingProps, StyleProps.
- children, name, attachments, footer, actions?: ReactNode
- from?: "self" | "other" = other
- avatarProps?: AvatarProps
- time?: ChatTime
- timeFormat?: ChatTimeFormat = clock
- status?: ChatMessageStatus
- statusLabels?: Partial<Record<ChatMessageStatus, string>>
- onRetry?: () => void
- retryLabel?: string = Retry
- grouped?: boolean = false
- stack?: "start" | "middle" | "end"
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
- onClick?: React.MouseEventHandler<HTMLElement>

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
- position?: CSSProperties["position"] = relative

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

### Mascot
Mixins: LeafProps.
- working?: "cube" | "d20"
- effects?: boolean | MascotEffect[]
- poke, brows, cheeks?: boolean
- state?: MascotState = idle
- mood?: MascotMood = neutral
- seed?: string | number
- accessory?: React.ReactNode
- lookAt?: "pointer" | "center" | { x: number; y: number } = pointer
- level, roundness, aspect, eyeSize, eyeSpacing, eyeHeight?: number
- source?: AudioLevelSource | null
- size?: "s" | "m" | "l" | "xl" | number | CSSUnit = l
- aria-label, bodyPath, eyeColor?: string
- color?: "brand" | "accent" | "neutral" | (string & {})
- surface?: "glossy" | "matte" | "flat" | "glass"
- eyes?: "tile" | "pill" | "round" | "wide" | "dot" | { path: string }
- mouth?: "none" | "smile" | "dot" | "line"
- personality?: "calm" | "default" | "bouncy"
- sides?: "classic" | "tints" | "mono" | Partial<Record<"top" | "front" | "right" | "bottom" | "back" | "left", string>>
- face?: "3d" | "flat"

### Logo
Mixins: LeafProps.
- size?: TShirtSizes = m
- icon, wordmark?: LogoSource
- text, href?: string
- monogram?: boolean | string
- showIn?: "dark" | "light"
- brand?: { copy?: boolean; url?: string }

### WorkingIndicator
Mixins: LeafProps.
- verbs?: readonly string[] = workingVerbs
- label, detail?: ReactNode
- interval?: number = 2800
- shuffle, shimmer?: boolean = true
- showElapsed?: boolean = false
- startedAt?: Date | number
- loader?: ReactNode | false
- size?: "s" | "m" | "l" = m
- aria-label?: string

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
type AudioLevelSource = "HTMLMediaElement" | "MediaStream" | "AnalyserNode"
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
type ChatTimeFormat = "relative" | "clock"
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
// symbol code link menu search time video filter image security opacity download info danger warning adjustments arrowDown arrowLeft arrowRight arrowUp arrowUpRight ball banknotes barChart bell bolt book bookmark calendar cart chat check checkbox chevronDoubleLeft chevronDoubleRight chevronDown chevronLeft chevronRight chevronUp chevronsLeftRight clipboard close computer copy cube dark dislike document edit enter eye eyeDropper eyeOff file flag folder food forward gift globe grid grip heart help home inbox light like linearGauge lock logout mail mapPin maximize minimize minus moreHorizontal newspaper organization pause paw payment people person personRemove phone play plus radialGauge refresh return screen send settings smiley sparkle star starFill store tag trash trend trendDown trendUp upload volume volumeOff wordmark world
type LegacyToast = { variant?: Tone; tone?: Tone; children?: ReactNode; message?: ReactNode; action?: ReactNode; duration?: number }
type LogoSource = "string" | { light: string; dark: string; }
// type MascotEffect is one of these strings: heartEyes starEyes laughEyes blush sweat tears anger hearts sparkles question
// type MascotMood is one of these strings: neutral happy surprised sad skeptical wink focused determined love excited laughing embarrassed crying angry confused
type MascotState = "idle" | "listening" | "thinking" | "speaking" | "sleeping"
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
type ToastContextProps = { toasts: Toast[]; addToast: (toast: Omit<Toast, "id"> | LegacyToast) => string; removeToast: (id: string) => void }
// type Tone is one of these strings: neutral brand accent info danger warning success
type UserSelect = "text" | "auto" | "none" | "all"
```

## Gotchas

- Pass a Tag's text once, as label or as children — with both, the children are dropped. Badge and Chip are Tag in 3.0.
- Never cast an icon name with `as IconName`: the cast compiles a name the registry does not have, and it renders nothing. Use a name from iconNames; in data, type the field as IconName ({ icon: IconName }[]) or write the literal `as const`, so the type check still runs.
- Field heights run a step above Button's: Input size xs is 40px, s 48px, m 56px (the default). A field beside a size="s" Button (32px), as in a toolbar or filter row, takes size="xxs", which is 32px too; Form size="xxs" sets it for every field inside. An xxs field has no floating label: label shows as the placeholder, so keep label for the accessible name.
- Fixed in 2.1: a Button or IconButton that is a Dropdown trigger renders a real <button type="button"> with aria-haspopup and aria-expanded, so it is reachable by keyboard. Pass it as trigger as is; do not add type="button" or a no-op onClick, or wrap it in a focusable Row, to make it one.
- Write 3.0 prop names, not 1.x or 2.x ones from memory: open (not isOpen), checked (not isChecked), SegmentedControl value/onValueChange/defaultValue (not selected/onToggle/defaultSelected), Tag tone (not scheme or variant), Button tone="danger" (not variant="danger"), Text/Heading textVariant (not variant), field size/prefix/suffix/corners (not height/hasPrefix/hasSuffix/radius), Table onSelectedChange (not onSelectionChange), CodeBlock collapsible (not isCollapsible). The validator names the 3.0 prop.
- No designed logo yet: <Logo text="Acme" monogram /> sets the name in type beside a favicon-style mark (a bare shape, black or white with the theme). Never draw an icon or wordmark SVG yourself; a hand-made mark looks worse than the monogram. When the owner's SVGs exist, pass them as icon (it replaces the monogram) and wordmark (an image source, not text).
- Tag is a div by default; inside a sentence (<Text as="p">, <p>) give it as="span".
- overflow="hidden" on full-bleed sections clips glows into hard bands — only use when parent has radius.
- Leaf components (Button, IconButton, ToggleButton, the fields, Switch, Checkbox, RadioButton, Text, Heading, Icon, Avatar, Spinner, StatusIndicator, Kbd, InlineCode, ProgressBar, Logo, SmartLink, NavIcon) take only margins, flex, fillWidth, position, top/right/bottom/left, className and style besides their own props. Padding, background, border, radius, sizes, hide and breakpoints go on a Row around it (a Column around Text or Heading; <Row fit> for an Icon's box).
- A Button in a form that should submit it needs type="submit": with neither onClick, href nor type it renders a div, unlike a native <button>.
- Show a field's error after it is blurred or the form is submitted, never on open: keep a touched flag per field and pass errorMessage={touched.email ? errors.email : undefined}. A form or Dialog that opens with red required-field errors reads as broken.

## Quality bar

- An assistant has a face: Mascot in the header (state follows the work: thinking while it answers) and large in the empty state; the brand mark is Logo, never a drawn SVG
- Every view that loads data shows loading (Skeleton shaped like the content), empty (title, one line, the action that fills it), error (Feedback tone="danger" with Retry) and filled, through a typed lib/ data layer of async functions over mock data — even when the brief never mentions data
- A sent message shows status sending, then sent; a failed one shows status failed with onRetry; attachments go through ChatComposer attach
- An empty thread is a welcome: the Mascot, one question, and two to four suggestion Tags that send themselves

## Gold example (`examples/chat.tsx`)

```tsx
"use client";

/**
 * Gold example: an assistant chat, built to ship.
 * Target: a conversation list and a thread with an assistant that has a face
 * (Mascot), a brand mark (Logo), attachments through the composer, and every
 * state a real backend produces: loading, empty, error, sending, failed with
 * retry, and the assistant working.
 *
 * The data layer sits at the top, in what would be `lib/assistant.ts`: typed
 * async functions over mock data with a delay. The screens call only these
 * functions, so a real API replaces their bodies and no screen changes.
 */
import {
  Background,
  Button,
  ChatComposer,
  type ChatComposerMessage,
  ChatMessage,
  ChatMessageList,
  type ChatMessageStatus,
  Column,
  ConversationItem,
  Feedback,
  IconButton,
  Line,
  Logo,
  Mascot,
  Row,
  Skeleton,
  Tag,
  Text,
  useToast,
  WorkingIndicator,
} from "@once-ui-system/core";
import { useCallback, useEffect, useState } from "react";

// ── lib/assistant.ts ─────────────────────────────────────────────────────

export type Message = {
  id: string;
  from: "self" | "assistant";
  text: string;
  sentAt: Date;
  status?: ChatMessageStatus;
};

export type Conversation = { id: string; title: string; preview: string; updatedAt: Date };

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const conversations: Conversation[] = [
  {
    id: "c1",
    title: "Trip to Lisbon",
    preview: "Three days is enough for…",
    updatedAt: new Date(),
  },
  { id: "c2", title: "Weekly plan", preview: "Move the review to…", updatedAt: new Date() },
];
const threads: Record<string, Message[]> = { c1: [], c2: [] };

export const assistant = {
  async listConversations(): Promise<Conversation[]> {
    await wait(400);
    return conversations;
  },
  async getMessages(conversationId: string): Promise<Message[]> {
    await wait(300);
    return threads[conversationId] ?? [];
  },
  /** Resolves with the assistant's reply; rejects when the request fails. */
  async send(conversationId: string, text: string, files: File[]): Promise<Message> {
    await wait(1200);
    const reply: Message = {
      id: crypto.randomUUID(),
      from: "assistant",
      text: files.length
        ? `Got ${files.length} file(s). ${text}`
        : `Here is what I found about “${text}”.`,
      sentAt: new Date(),
    };
    threads[conversationId] = [...(threads[conversationId] ?? []), reply];
    return reply;
  },
};

// ── the screen ───────────────────────────────────────────────────────────

type Load<T> = { status: "loading" } | { status: "error" } | { status: "ready"; data: T };

const SUGGESTIONS = ["Plan my week", "Summarise a file", "Ideas for a trip"];

// The mascot shaped into the product, not the default body: Sol plans your
// days, so it is a warm pebble with a crown of sun rays. A plant app would
// draw a pot and a sprout, a water app a drop. Paths sit in a 200 × 200 box.
const SOL = {
  bodyPath:
    "M100 28C152 28 180 64 180 110C180 156 148 182 100 182C52 182 20 156 20 110C20 64 48 28 100 28Z",
  accessory: (
    <g stroke="var(--accent-solid-strong)" strokeWidth={8} strokeLinecap="round">
      <path d="M100 18V4" />
      <path d="M68 24L58 10" />
      <path d="M132 24L142 10" />
    </g>
  ),
  mouth: "smile",
  cheeks: true,
} as const;

export function ChatExample() {
  const { addToast } = useToast();
  const [list, setList] = useState<Load<Conversation[]>>({ status: "loading" });
  const [activeId, setActiveId] = useState<string | null>(null);
  const [thread, setThread] = useState<Load<Message[]>>({ status: "loading" });
  const [working, setWorking] = useState(false);

  const loadList = useCallback(() => {
    setList({ status: "loading" });
    assistant
      .listConversations()
      .then((data) => {
        setList({ status: "ready", data });
        setActiveId((id) => id ?? data[0]?.id ?? null);
      })
      .catch(() => setList({ status: "error" }));
  }, []);

  const loadThread = useCallback((id: string) => {
    setThread({ status: "loading" });
    assistant
      .getMessages(id)
      .then((data) => setThread({ status: "ready", data }))
      .catch(() => setThread({ status: "error" }));
  }, []);

  useEffect(loadList, [loadList]);
  useEffect(() => {
    if (activeId) loadThread(activeId);
  }, [activeId, loadThread]);

  const messages = thread.status === "ready" ? thread.data : [];
  const setMessages = (update: (current: Message[]) => Message[]) =>
    setThread((t) => (t.status === "ready" ? { status: "ready", data: update(t.data) } : t));

  // Optimistic: the message shows at once as sending, turns failed with a
  // retry when the request fails, and the assistant's face says it is working.
  const send = async ({ text, files }: ChatComposerMessage, retryId?: string) => {
    if (!activeId) return;
    const id = retryId ?? crypto.randomUUID();
    const mine: Message = { id, from: "self", text, sentAt: new Date(), status: "sending" };
    setMessages((current) =>
      retryId ? current.map((m) => (m.id === id ? mine : m)) : [...current, mine],
    );
    setWorking(true);
    try {
      const reply = await assistant.send(activeId, text, files);
      setMessages((current) => [
        ...current.map((m) => (m.id === id ? { ...m, status: "sent" as const } : m)),
        reply,
      ]);
    } catch {
      setMessages((current) =>
        current.map((m) => (m.id === id ? { ...m, status: "failed" as const } : m)),
      );
      addToast({ tone: "danger", message: "The assistant couldn't answer. Try again." });
    } finally {
      setWorking(false);
    }
  };

  const welcome = thread.status === "ready" && messages.length === 0 && !working;

  return (
    <Row fill height="100dvh" background="page">
      <Column width={20} borderRight padding="12" gap="8" s={{ hide: true }}>
        <Row paddingX="8" paddingY="8" horizontal="between" vertical="center">
          <Logo text="Sol" size="s" />
          <IconButton icon="plus" variant="tertiary" tooltip="New chat" />
        </Row>
        {list.status === "loading" &&
          [0, 1, 2].map((i) => <Skeleton key={i} shape="block" height={56} />)}
        {list.status === "error" && (
          <Feedback tone="danger" title="Chats didn't load">
            <Button size="s" variant="secondary" label="Retry" onClick={loadList} />
          </Feedback>
        )}
        {list.status === "ready" && list.data.length === 0 && (
          <Text onBackground="neutral-weak" textVariant="body-default-s" marginX="8">
            No chats yet. Start one with the + button.
          </Text>
        )}
        {list.status === "ready" &&
          list.data.map((c) => (
            <ConversationItem
              key={c.id}
              name={c.title}
              preview={c.preview}
              time={c.updatedAt}
              selected={c.id === activeId}
              onClick={() => setActiveId(c.id)}
            />
          ))}
      </Column>

      <Column fill>
        <Row paddingX="20" paddingY="12" gap="12" vertical="center" borderBottom>
          {/* One Mascot per view: the welcome below has it while the chat is empty. */}
          {!welcome && (
            <Mascot
              {...SOL}
              size={64}
              state={working ? "thinking" : "idle"}
              color="brand"
              aria-label="Sol"
            />
          )}
          <Column>
            <Text textVariant="label-strong-m">Sol</Text>
            <Text textVariant="body-default-xs" onBackground="neutral-weak">
              {working ? "Thinking…" : "Your assistant"}
            </Text>
          </Column>
        </Row>

        {thread.status === "loading" && (
          <Column fill padding="24" gap="16">
            <Skeleton shape="block" width={24} height={48} />
            <Skeleton shape="block" width={32} height={64} style={{ alignSelf: "flex-end" }} />
          </Column>
        )}
        {thread.status === "error" && (
          <Column fill center padding="24">
            <Feedback
              tone="danger"
              title="This chat didn't load"
              description="Check your connection and try again."
            >
              <Button
                size="s"
                variant="secondary"
                label="Retry"
                onClick={() => activeId && loadThread(activeId)}
              />
            </Feedback>
          </Column>
        )}
        {welcome && (
          // The empty state is the assistant's welcome: its face, one line, and a way to start.
          <Column fill center gap="16" padding="24">
            <Background
              position="absolute"
              top="0"
              left="0"
              fill
              pointerEvents="none"
              gradient={{
                display: true,
                colorStart: "brand-alpha-weak",
                colorEnd: "static-transparent",
                x: "50%",
                y: "40%",
                width: "80%",
                height: "70%",
              }}
            />
            <Mascot
              {...SOL}
              size="xl"
              mood="happy"
              color="brand"
              poke
              aria-label="Sol says hello"
            />
            <Text textVariant="heading-strong-m">What can I help with?</Text>
            <Row gap="8" wrap horizontal="center">
              {SUGGESTIONS.map((s) => (
                <Tag key={s} label={s} onClick={() => send({ text: s, files: [] })} />
              ))}
            </Row>
          </Column>
        )}
        {thread.status === "ready" && (messages.length > 0 || working) && (
          <ChatMessageList fill paddingX="20" paddingY="16" aria-label="Messages">
            {messages.map((m) => (
              <ChatMessage
                key={m.id}
                from={m.from === "self" ? "self" : "other"}
                time={m.sentAt}
                status={m.status}
                onRetry={
                  m.status === "failed" ? () => send({ text: m.text, files: [] }, m.id) : undefined
                }
              >
                {m.text}
              </ChatMessage>
            ))}
            {working && <WorkingIndicator size="s" />}
          </ChatMessageList>
        )}

        <Line />
        <Column padding="16">
          <ChatComposer
            onSend={(message) => send(message)}
            attach={{ accept: "image/*,.pdf" }}
            loading={working}
            disabled={!activeId || thread.status !== "ready"}
            placeholder="Ask Sol anything"
          />
        </Column>
      </Column>
    </Row>
  );
}
```
