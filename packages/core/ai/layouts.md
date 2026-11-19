# Once UI — application layouts

Recipes for the shells a product sits inside, as opposed to the decoration in
`recipes.md`. Each is the shape a working product converged on, not a sketch.

Use them verbatim, then adjust. The values that look arbitrary usually are not —
the notes say which ones matter and why.

Recipes 1–3 compile: they are also `ai/examples/app-shell.tsx`, which `pnpm
typecheck` covers, so a renamed prop breaks the recipe rather than leaving it
quietly wrong.

## 1. App shell with a sidebar

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

## 2. Data-driven navigation

```tsx
import { Nav, NavGroup, NavItem, selectNavHref } from "@once-ui-system/core";

const current = selectNavHref(pathname, nav.flatMap((i) =>
  i.items ? i.items.map((s) => s.href) : [i.href],
));

<Nav fill paddingX="8" tone="brand" aria-label="Main">
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

## 3. Editor shell

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

## 4. App header on a phone

A header that only wraps leaves the avatar orphaned on a line of its own. On
a phone it is three rows: logo and account, then search, then the primary
action at full width.

```tsx
<Column fillWidth gap="12" paddingX="16" paddingY="12">
  <Row fillWidth vertical="center" gap="16">
    <Logo icon="/logo.svg" href="/" />
    <Row flex={1} s={{ hide: true }}>{search}</Row>
    <Row s={{ hide: true }}><Button prefixIcon="plus">New booking</Button></Row>
    <Avatar value="AP" size="s" style={{ marginLeft: "auto" }} />
  </Row>
  <Column hide s={{ hide: false }} fillWidth gap="8">
    {search}
    <Button fillWidth prefixIcon="plus">New booking</Button>
  </Column>
</Column>
```

- `search` is one element, `<Input id="search" size="xxs" label="Search"
  prefix={<Icon name="search" size="xs" />} />`, placed once per layout; only one
  of the two rows is ever shown.
- `marginLeft: "auto"` keeps the avatar at the right edge on every width.

## 5. Plan or map canvas

Floor plans, seat maps and site maps are inline SVG, not absolutely
positioned boxes. A `viewBox` at 100% width fits any screen; a fixed-width
canvas clips on a phone. Give the canvas no `minWidth`: it scales with its box. Fixtures stay neutral, with one accent for state.

```tsx
<Column fillWidth background="surface" border radius="l" padding="16">
  <svg viewBox="0 0 800 500" width="100%" role="group" aria-label="Floor plan"
    style={{ display: "block", height: "auto" }}>
    <rect width="800" height="500" fill="var(--neutral-background-weak)" />    {/* floor */}
    <rect x="24" y="24" width="240" height="32" fill="var(--neutral-solid-medium)" /> {/* bar */}
    <rect x="0" y="0" width="800" height="8" fill="var(--neutral-alpha-strong)" />  {/* window wall */}
    {tables.map((t) => (
      <g key={t.id} className={styles.item} tabIndex={0} role="button"
        aria-label={`Table ${t.label}, ${t.seats} seats`} aria-pressed={t.id === selectedId}
        onClick={() => setSelectedId(t.id)}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSelectedId(t.id); } }}>
        <circle className={styles.ring} cx={t.x} cy={t.y} r={50} fill="transparent" strokeWidth={4}
          stroke={t.id === selectedId ? "var(--brand-solid-strong)" : "none"} />
        <circle cx={t.x} cy={t.y} r={36} fill={`var(--data-${zoneColor[t.zone]})`} />
        <text x={t.x} y={t.y} textAnchor="middle" dominantBaseline="central"
          fill="var(--neutral-on-background-strong)">{t.label}</text>
      </g>
    ))}
  </svg>
</Column>
```

```css
/* canvas.module.css */
.item { cursor: pointer; outline: none; }
.item:focus-visible .ring { stroke: var(--neutral-on-background-strong); stroke-dasharray: 6 4; }
```

- **Hit size.** Every item is at least 44px across at a 360px-wide phone:
  `44 * viewBoxWidth / 360` units (about 100 in an 800-wide plan). The
  transparent `ring` circle carries the hit area when the drawing is smaller.
- **Fixtures in distinct fills.** Floor, walls, bar and windows each take their
  own neutral (`background`, `solid`, `alpha`), so they never read as seats.
- **Groups from the categorical palette.** A zone, section or table type is a
  `var(--data-{name})` colour (`blue`, `emerald`, `orange`, `violet`…), which
  `DataThemeProvider mode="categorical"` defines in both themes. Name each
  group in a legend too, so colour is never the only cue.
- **Focus is drawn in CSS.** SVG elements take no `outline`; the
  `:focus-visible` rule draws the ring, distinct from the brand selection ring.

## 6. Selection with a details panel

A selected item gets a brand ring and a raised fill: `border="brand-medium"
background="brand-alpha-weak"` on a row or tile, the brand `ring` on a canvas
item. Its details sit beside the list or canvas on desktop, and in a `Drawer`
from the bottom on a phone.

```tsx
const { maxWidth } = useLayout();
const phone = maxWidth("s");

<Row fillWidth gap="24">
  <Column flex={1}>{/* list or canvas */}</Column>
  <Column s={{ hide: true }} width={320} fitHeight position="sticky" top="24"
    background="surface" border radius="l" padding="24" gap="16">
    {selected ? <Details item={selected} /> : <Text onBackground="neutral-weak">Select a table to see its details.</Text>}
  </Column>
</Row>
<Drawer open={phone && Boolean(selected)} onClose={() => setSelectedId(null)} side="bottom" title={selected?.label}>
  {selected && <Details item={selected} />}
</Drawer>
```

- One `Details` component, two homes: the panel and the drawer never drift apart.
- The empty panel says what to do, so the column is never blank.

## Anti-patterns

- A dashboard with no scrolling pane — the whole document scrolls and the nav
  leaves with it.
- `100vh` in an app shell. Use `100dvh`; `vh` is wrong on mobile the moment the
  browser chrome shows or hides.
- A sticky sidebar without `fitHeight` — it stretches to the row and the sticky
  never engages.
- A mobile menu built from an absolute `Column` and a `zIndex`. Use `Drawer`.
- `pathname === href` or `startsWith` for nav selection. Use `selectNavHref`.
- Icons on both a NavGroup and its children — two columns of icons, no hierarchy.
- `overflow` on the SplitView instead of on its panels — the divider stops
  tracking the pointer.
- A floor plan or map at a fixed pixel width — it clips on a phone. Use an SVG
  `viewBox` at 100% width.
