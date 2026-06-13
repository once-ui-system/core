# Once UI — decoration recipes

Curated decorative patterns that keep pages premium without going over the top.
Use them verbatim, then adjust values. All units follow rules.md #21–24.

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
      x: 50, y: 0,
      width: 150, height: 80,
      opacity: 60,
    }}
    dots={{ display: true, color: "neutral-alpha-weak", size: "2", opacity: 40 }}
  />
  <Column zIndex={1} horizontal="center" gap="24" maxWidth={48}>
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

## 4. BlobFx ambient panel

Self-contained drifting brand/accent blobs (already blurred and pointer-transparent). Use behind a final CTA or feature visual — counts as continuous motion:

```tsx
<Card fillWidth radius="l" border="neutral-alpha-weak" overflow="hidden" padding="48">
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
    <RevealFx key={item.id} trigger={seen} translateY="8" delay={index * 0.1}>
      <Card ... />
    </RevealFx>
  ))}
</Grid>
```

For stats, drive `CountFx` value from the same latch: `<CountFx value={seen ? 2400 : 0} separator="," />`.

## Anti-patterns

- Glow with `colorStart: "brand-background-weak"` — invisible against the page; use alpha tokens.
- `width: 500` gradients — that's 125% of the container blown past its edges; stay ≤ 200 for glows.
- Background layers without `top="0" left="0"` inside padded parents — misaligned.
- Decorating every section — if everything glows, nothing does.
- Two different Fx components fighting in one viewport (MatrixFx + BlobFx side by side).
- `overflow="hidden"` on a full-bleed section (no radius) — clips the glow into a hard-edged band.
- Animating one item out of a sibling set (only the highlighted card) — stagger all or animate none.
