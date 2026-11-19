# Once UI — decoration and restraint recipes

Curated patterns that keep pages premium without going over the top: decorative
layers that carry a section, controls that earn their room back, and the brand
world a product's own landing page starts from (#9). Use them
verbatim, then adjust values. All units follow rules.md #21–24.

## Budget (hard limits)

- **One ambient background layer per section**, and only in sections that anchor the page (hero, highlighted card, final CTA). Plain sections stay plain — contrast is what makes the decorated ones read as premium.
- **Continuous motion** (MatrixFx flicker, BlobFx drift) in at most **two places per page**, never adjacent.
- **One accent family per page.** Decorations use `brand-*` (or `neutral-*`); never mix brand + accent + schemes in decoration.
- Every decorative layer: `position="absolute" top="0" left="0" fill pointerEvents="none"`, content sibling `zIndex={1}`, parent `overflow="hidden"`.

## 1. Hero glow + dots

Soft brand glow from the top edge with a subtle dot texture. The workhorse ambient layer.

Placement matters: the wrapper is **full-bleed** (`fillWidth`, outside any `maxWidth` column) and has **no** `overflow="hidden"` — the gradient fades out via `colorEnd: "static-transparent"`. Clipping it inside a narrow container produces a hard-edged band.

```tsx
<Column fillWidth horizontal="center" paddingY="80">
  <Background
    position="absolute" top="0" left="0" fill pointerEvents="none"
    gradient={{
      display: true,
      colorStart: "brand-alpha-medium",
      colorEnd: "static-transparent",
      x: "50%", y: 0,
      width: "150%", height: "80%",
      opacity: 60,
    }}
    dots={{ display: true, color: "neutral-alpha-weak", size: "2", opacity: 40 }}
  />
  <Column zIndex={1} horizontal="center" gap="24" maxWidth="48rem">
    {/* hero content */}
  </Column>
</Column>
```

## 2. MatrixFx hero strip (with fade-out)

Animated matrix field behind a hero, faded into the page with a `page-background` gradient so it doesn't compete with content. Pair exactly like this:

```tsx
<Column fillWidth minHeight="s" center overflow="hidden">
  <MatrixFx
    position="absolute" top="0" left="0" fill
    flicker size={1.5} spacing={8}
    colors={["brand-solid-strong"]}
    bulge={{ type: "wave", duration: 3000, intensity: 20, repeat: true }}
  />
  <Background
    position="absolute" top="0" left="0" fill pointerEvents="none"
    gradient={{ display: true, colorStart: "page-background", x: 0, y: "50%", width: "150%", height: "300%" }}
  />
  <Column zIndex={1} center gap="16" padding="48">
    {/* hero content */}
  </Column>
</Column>
```

## 3. Highlighted card glow

For the emphasized item in a set (e.g. "most popular" pricing tier). Border + top glow, nothing else:

```tsx
<Card fillWidth padding="24" radius="l" background="surface" border="brand-alpha-medium" overflow="hidden">
  <Background
    position="absolute" top="0" left="0" fill pointerEvents="none"
    gradient={{
      display: true,
      colorStart: "brand-alpha-medium",
      colorEnd: "static-transparent",
      x: "50%", y: 0,
      width: "200%", height: "60%",
      opacity: 50,
    }}
  />
  <Column zIndex={1} gap="20" fillWidth>
    {/* card content */}
  </Column>
</Card>
```

## 4. BlobFx ambient panel

Self-contained drifting brand/accent blobs (already blurred and pointer-transparent). Use behind a final CTA or feature visual — counts as continuous motion:

```tsx
<Card fillWidth radius="l" border overflow="hidden" padding="48">
  <BlobFx position="absolute" top="0" left="0" fill opacity={60} seed={2} />
  <Column zIndex={1} center gap="24">
    {/* CTA content */}
  </Column>
</Card>
```

## 5. Technical texture (lines / grid)

Diagonal lines or grid texture for footers of cards, table headers, "engineering" flavored strips. No motion:

```tsx
<Background
  position="absolute" top="0" left="0" fill pointerEvents="none"
  lines={{ display: true, color: "neutral-alpha-weak", angle: -45, size: "4" }}
/>
```

## 6. Section divider

Between major sections when the gap alone isn't enough — a short line, optionally with an eyebrow:

```tsx
<Column fillWidth horizontal="center" gap="16">
  <Line width="40" />
</Column>
```

## 7. Reveal stagger (entry, not ambient)

Entrance animation for **one** key set per page (rules.md #27–28), viewport-triggered and latched so it plays once, when actually seen (rules.md #29):

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

## 8. Reveal on hover (controls that earn their room back)

A control that must be reachable from every page but is used once a session does
not need permanent width. Show its current state; reveal the options on hover or
focus.

`ThemeSwitcher` ships this as a prop:

```tsx
<ThemeSwitcher collapsed />
```

For any other toggle group, the pattern is the same three rules — and all three
are load-bearing, because hover-to-reveal is one of the easiest ways to ship an
inaccessible control:

- **Open on `:focus-within` as well as `:hover`,** and keep the hidden options
  focusable. Collapse them with `max-width: 0` and `overflow: hidden`, never
  `display: none` or `visibility: hidden` — those remove the tab stops, and then
  the only way to reach the options is with a mouse.
- **Stay open under `@media (hover: none)`.** On a touch device the first tap
  lands on the visible control, which means the tap that was meant to open the
  group has already committed to an option.
- **Animate width only, and drop it under `prefers-reduced-motion`.** The
  control must do exactly the same thing with the transition off.

```scss
.group { overflow: hidden; }
.group .option { overflow: hidden; max-width: var(--static-space-40); transition: max-width var(--transition-duration-micro-medium) ease; }
.group .option.inactive { max-width: 0; opacity: 0; }
.group:hover .option.inactive,
.group:focus-within .option.inactive { max-width: var(--static-space-40); opacity: 1; }

@media (hover: none) { .group .option.inactive { max-width: var(--static-space-40); opacity: 1; } }
@media (prefers-reduced-motion: reduce) { .group .option { transition: none; } }
```

Use it for theme, density, or view-mode switchers in a header or a footer. Do
not use it for anything a visitor needs to *see* the state of at a glance across
options, for primary navigation, or for a destructive action — a control that
hides until pointed at is a control nobody finds.

## 9. Brand world (find the world first)

For a product's own landing page or homepage hero. The template hero (a text-effect headline, a CTA pair, a logo cloud, a glow behind it) is what every product has: it is one option, not the default. Make a first screen that would look wrong with a competitor's logo on it.

**Direction card, before any code.** A world is one place the product's work already happens in, taken from what the product does, never from its category (launch videos: a film set at the start of a screening; venue bookings: a kitchen's ticket rail). One line each:

- **World:** the place, in five words. **Vibe:** its light and mood.
- **Type:** one display face with character (condensed, rounded, serif, extended) and a mono for metadata, never only the default sans.
- **Palette:** a ground (near-black, a tinted dark, or paper) and ONE hot focal colour; a second only as a small accent.
- **Layout:** the first screen as a picture. **Cast:** who acts in the scene (a mascot family, or the product's own objects: tickets, posters, cards), each with a job. **Signature motion:** one loop that shows the work happening.

**Write three worlds and pick on purpose.** Drop the name pun (Ember: a fire, a hearth); every model reaches for it first. Drop the house default: a charcoal ground, one orange, a Fraunces headline and a tilted paper card. Prefer the world with the most objects to turn sections into, or show the person all three.

**The first screen is a scene of the work:** believable content (questions and answers, file names, times, prices, statuses) with mono metadata under each item. The headline is a split poster: the plain half in the text colour, the promise in the focal colour, up to 10–12vw, tight leading. Under it, one plain sentence of what the product does and for whom, and a small price or free-plan line.

**Carry the world through the page:** its language in the nav, eyebrows, pricing and closing CTA; each section an object of the world (examples as posters, how-it-works as a storyboard, plans as tickets), not a three-card grid; one texture per section. Cast members keep their proportions: vary size, never scaleX/scaleY.

**Build it with the system.** One `StyleScope` (or the app's config) holds the look: `brandSeed` = the focal colour, `pageBackground`/`surfaceBackground` = the ground, `fonts` with the display face on `heading` and the mono on `code`/`label`, loaded with `next/font`. Re-tune the display tokens inside that scope in one sheet (`--font-size-display-xl: clamp(64px, 12vw, 180px); --line-height-display-xl: 0.8em;`). Layout, type, buttons and lists stay components and props. Custom CSS only for artwork (the cast, the world's props, textures, keyframes): classes named for what they draw (`.emChair`, `.emStrip`) in that one sheet, scoped under the page class, the one place hex is fine. The scene is artwork, outside the one-ambient-layer budget; every other section keeps it.

**Check it like a designer:** screenshot 1440 and 390 wide (the scene still reads on a phone, nothing scrolls sideways); headings really in the display face; a light paper scope really light; the swap test (cover the name: could it be a competitor's?); the category test (does it read as "an AI SaaS landing page"?); the focal colour only on the promise, the primary button and one thing in the scene.

## Anti-patterns

- **Hover-only reveals.** A group that opens on `:hover` but not `:focus-within`, or that collapses with `display: none`, is unreachable by keyboard and unusable by touch. See #8.

- Glow with `colorStart: "brand-background-weak"` — invisible against the page; use alpha tokens.
- `width: 500` gradients — that's 125% of the container blown past its edges; stay ≤ 200 for glows.
- Background layers without `top="0" left="0"` inside padded parents — misaligned.
- Decorating every section — if everything glows, nothing does.
- Two different Fx components fighting in one viewport (MatrixFx + BlobFx side by side).
- `overflow="hidden"` on a full-bleed section (no radius) — clips the glow into a hard-edged band.
- Animating one item out of a sibling set (only the highlighted card) — stagger all or animate none.
