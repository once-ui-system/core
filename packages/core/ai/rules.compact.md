# Once UI — compact codegen rules

Every task bundle, `ai/bundles/{id}.md`, already carries these rules with its components, types, gotchas and gold example, so with a bundle you don't need this file. Read it when no bundle fits, together with `catalog.json` and the `components/` slices you need. For an app shell, a sidebar nav or an editor, `ai/layouts.md` has the shapes that are hard to get right from props alone.

Read everything you need in one step, before writing: every file you read is sent again on every later turn, so a dozen small reads cost far more than one or two large ones. Never open `spec.json` — it is the full machine spec for tooling, and the bundles, slices, `tokens.json` and `functions.json` already hold everything in it.

## Layout

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

## Surfaces

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
- Brand mark: `<Logo text="Name" monogram="N" />` (its initial, or an `icon`), never `Icon` + `Text`; a bare `monogram` is a placeholder shape
- Critical outranks status: `Feedback tone="danger"` or `Tag prefixIcon`; urgent is `danger`/`warning`, never `info`

## Typography

- Hero: `display-strong-l` or `display-strong-xl`
- Section titles: `display-strong-xs` or `display-strong-s` — not `heading-*`
- Eyebrow: `<Text textVariant="label-default-s" onBackground="brand-medium">`
- Text on layout: `textVariant` + `onBackground` on Row/Column instead of nesting Text
- App text a user must read (metadata, cells): `body-default-s` minimum, never `xs` `neutral-weak`

## Decoration

Absolute layers always: `position="absolute" top="0" left="0" fill pointerEvents="none"`, content `zIndex={1}`.

- `zIndex` only inside that layer group (or on a sticky header over its pane). Never on a lone element, never a page-wide ladder.

- Gradient `width`: quarter-percent (400 = 100%). Glows: 100–200.
- Glow colors: `brand-alpha-medium`, not `brand-background-weak`
- Ambient layers on full-bleed section wrapper, outside `maxWidth` column
- Budget: one ambient layer per section; motion in hero + one CTA max

## Motion

- Every `duration`, `delay` and interval is **milliseconds**: `delay={index * 100}` — `* 0.1` was 1.8.x; `CelebrationFx`/`WeatherFx` `duration={5000}`, not `{5}`. `RevealFx`/`ShineFx`/`CountFx` take `duration`, `TypeFx` `charDuration` (`speed` there was 2.x)
- `speed` is only a multiplier, `1` the default, or `"slow"`/`"medium"`/`"fast"` (0.5/1/2): `MatrixFx`, `WeatherFx`, `ParticleFx`, `CelebrationFx`, `Effect`, `Scroller` `auto.speed`, `GlitchFx`, `LetterFx`
- `RevealFx translateY`: a number is the token scale (`16` = 1rem); prefer `"8"`–`"16"` tokens
- Viewport-reveal with `useInViewport` + latch into `RevealFx revealed`; `CountFx` driven by `value`, no trigger prop
- Animate all siblings in a set or none — never one lone animated card

## Components

| Need | Use |
|------|-----|
| Image | `Media` |
| Link | `SmartLink` / `Button href` |
| Status dot | `StatusIndicator` |
| Loading | `Spinner` / `Skeleton` |
| Scroll fade | `Fade` as edge strip, not wrapper |
| Icons | `IconName`, from `iconNames` in `catalog.json` only |
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

## Build it to ship, not to screenshot

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

## Imports

Most things come from the package root. These do not — the manifest's
`imports` lists every entry point with its exports, and each slice, catalog
entry and `functions.json` entry says `importFrom` when it is not the root:

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
name is a type error, not a blank space — take names from `iconNames` in `catalog.json`. Brand marks
are not in the set: an app registers them by augmenting `IconLibraryOverrides`.

## Types — the common type errors

Every type a prop names is defined in the slice's (or bundle's) `types`.

- Responsive `xl`/`l`/`m`/`s`/`xs` props exist only on `Flex`, `Row`, `Column` and `Grid`. To change a `Button`, `Text` or anything else at a breakpoint, wrap it in one of those; `Text` and `Heading` take only `s={{ hide: true }}`. Leaves (`Button`, the fields and controls, `Text`, `Heading`, `Icon`, `Avatar`, `Kbd`…) take only margins, `flex`, `fillWidth`, `position` and offsets, `className` and `style`: padding, background, border, radius, sizes and anything else at a breakpoint go on a wrapper too.
- `vertical`/`horizontal` take `start | center | end | between | around | even | stretch` — no `baseline`; for baseline-aligned text write `style={{ alignItems: "baseline" }}`.
- Spacing (`gap`, `padding`, …) takes the tokens in `tokens.json`: `"4"`, `"8"`, `"12"`, `"16"`, `"20"`, `"24"`, `"32"`, `"40"`… — there is no `"6"` or `"10"`.
- `as` on `Flex`/`Row`/`Column`/`Grid` types the element's attributes and ref: `<Column as="form" onSubmit={…}>`, `<Row as="button" type="submit">`. `as="ul"`/`"ol"` drops bullets and indent, `as="button"` the button chrome; other components take no `as`.
- `Row`, `Column` and `Grid` have no `span`: a child spanning grid columns uses `style={{ gridColumn: "span 2" }}`.
- `variant` is appearance (Button: `primary | secondary | tertiary | ghost | link`), `tone` the palette (`brand | accent | neutral | info | success | warning | danger`) on Button, IconButton, Tag, Feedback, Toast and `addToast`: `<Button tone="danger">`. Text/Heading take `textVariant`. Badge and Chip are `Tag` (`variant="announce"`; `selected`/`onRemove` make a toggle).
- `Checkbox`, `Switch` and `RadioButton` take `checked` + `onCheckedChange(checked)` (`onToggle` was 2.x, `isChecked` 1.x); `onChange` is the native event of their input.
- Don't wrap primary content (headlines, prices, KPIs, CTAs) in `RevealFx`: it stays blurred until the reveal ends. Use it on secondary sections, with `duration={1000}`.

## Defaults — omit these

`position="relative"`, `direction` on Row/Column, `variant="primary"` on Button, `size="m"` when default, `fillWidth` beside `maxWidth`, `minWidth={0}` beside `fillWidth`, a border colour that restates the default.

## Before building

If design intent unclear, ask: content style, layout width, color approach, decoration level, imagery. Default: restrained, centered `maxWidth="m"`, single brand accent, one subtle gradient, no placeholder images.

An app: set the theme first, chosen for the domain, never the template's default blue on grey: `brand`, `accent` and `neutral` (or `brandSeed`), `solid: "color"`, a `--font-heading` family; no ambient decoration. Consumer and care apps go warm (`orange`/`yellow`/`moss` brand on `sand` or `rose`); health and outdoors `green`/`emerald`/`aqua` on `mint` or `sand`; creative tools `violet`/`magenta` on `dusk`; operations and incident tools a quiet brand on `slate` with the status tones (`danger`, `warning`, `success`) carrying the meaning. One shell (header, nav, panels) for every route of the app, in its `layout.tsx`. Phone header, plan canvas, selection: `ai/layouts.md`.

Make it look designed, not stock:

- One idea carries the screen. A map app is the map, full-bleed (`fill`, `height="100dvh"`), with its lists and details on floating panels over it (`background="surface"`, `border`, `radius="l"`, `shadow="l"`, `position="absolute"` with offsets); not a map in a card beside a table; and the selected place's panel acts on it (assign, resolve, report: a write through the data hook, optimistic with rollback), not only shows it. A chat with an assistant gives the assistant a face: the `Mascot` in the header (`size="m"`) and large in the empty state (`size="xl"`), and kept on screen through the conversation with its `state` (`thinking`, `speaking`) following the reply, so it visibly reacts; a photo the user is asked for is `MediaUpload` (with preview) or `ChatComposer attach`; the empty state is a welcome over a brand `Background` (`gradient`), with suggestion `Tag`s, never a bare page.
- The brand is identity, not paint: `Logo` in the header, the `Mascot`'s `color`, `Nav tone="brand"`, one brand action per view, and the brand on what is selected (a `selected` Card or row, the active tab, the active pin). Never tint every surface or fill every button.
- No empty panes: every region has content, an empty state, or collapses away; text over an image or map sits in a panel and wraps or `truncate`s at every width.
- Work apps: `density: "compact"`, `border: "conservative"`, dark first. Hierarchy from type and spacing, not from grey cards inside grey cards.
- Say what matters at a glance: a header strip of the 3–4 numbers the user acts on (`Row` of label + `heading-strong` value + a status `Tag`), colour that means a status, and labels on things (a map pin's name, a track's name), not decoration.
- Map labels stay readable: `MapMarkers cluster`; a pin shows its text (`MapPin` with children) only when it is active or there are few, a dot otherwise; status as the pin's `tone`, and a legend panel that names the tones and areas.
- Tablet and phone keep the main canvas (map, preview, timeline, chat) on screen: side lists become a `Drawer`, a bottom sheet or a `SegmentedControl` tab below `m`; never open on a list with the canvas pushed off screen or an empty void.
