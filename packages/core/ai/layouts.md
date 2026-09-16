# Once UI — application layouts

Recipes for the shells a product sits inside, as opposed to the decoration in
`recipes.md`. Each is the shape a working product converged on, not a sketch.

Use them verbatim, then adjust. The values that look arbitrary usually are not —
the notes say which ones matter and why.

All three compile: they are also `ai/examples/app-shell.tsx`, which `pnpm
typecheck` covers, so a renamed prop breaks the recipe rather than leaving it
quietly wrong.

## 1. App shell with a sidebar

The one agents get wrong most often. A dashboard built without this scrolls the
whole document, so the header and sidebar slide away and the nav has to be
scrolled back to.

```tsx
<Column fill horizontal="center" flex={1}>
  <Header />                                       {/* 56px tall */}
  <Row fill paddingX="8">
    <Sidebar s={{ hide: true }} maxWidth={18} fitHeight position="sticky" top="56" />
    <Row fill horizontal="center" topRadius="l" overflow="hidden">
      <Row
        height="calc(100dvh - var(--static-space-56))"
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
</Column>
```

What each part is doing:

- **The pane scrolls, not the page.** `height: calc(100dvh - <header>)` plus
  `overflowY="auto"` is what keeps the header and sidebar in place. `dvh`, not
  `vh` — on mobile `vh` ignores the browser chrome and the pane runs off-screen.
- **`position="sticky" top="56"`** on the sidebar, matching the header height.
  `fitHeight` so it does not stretch and fight the sticky.
- **`topRadius="l"` + `background="surface"`** is what makes the content read as
  a panel sitting on the page rather than the page itself. The radius is on the
  top only, since the bottom is off-screen.
- **`s={{ hide: true }}`** rather than a media query. The mobile nav is a
  separate surface, not this one reflowed.
- **`maxWidth="xl"`** inside the pane. A dashboard is wider than a document;
  `"m"` is for reading.

## 2. Data-driven navigation

```tsx
import { NavGroup, NavItem, selectNavHref } from "@once-ui-system/core";

const current = selectNavHref(pathname, nav.flatMap((i) =>
  i.items ? i.items.map((s) => s.href) : [i.href],
));

<Column fill gap="4" paddingX="8">
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
</Column>
```

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
diff view.

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
    onChange={setTime}
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

## Anti-patterns

- A dashboard with no scrolling pane — the whole document scrolls and the nav
  leaves with it.
- `100vh` in an app shell. Use `100dvh`; `vh` is wrong on mobile the moment the
  browser chrome shows or hides.
- A sticky sidebar without `fitHeight` — it stretches to the row and the sticky
  never engages.
- `pathname === href` or `startsWith` for nav selection. Use `selectNavHref`.
- Icons on both a NavGroup and its children — two columns of icons, no hierarchy.
- `overflow` on the SplitView instead of on its panels — the divider stops
  tracking the pointer.
