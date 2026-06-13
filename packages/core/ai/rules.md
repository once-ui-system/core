# Once UI — code generation rules

Rules for writing Once UI code. Follow every rule; each shows the correct form first.

## Before you build

When the request doesn't specify design intent, ask these five questions first (one short message, all at once), then build:

1. **Content style** — bold / restrained / conservative?
2. **Layout** — wide or narrow, centered or left-aligned?
3. **Color** — single accent, bold colors, visually distinct sections?
4. **Decoration** — gradients, MatrixFx, animated blobs, none?
5. **Imagery** — placeholder images, or avatars/logos/icons only?

If you can't ask (or the user says "you decide"), default to: restrained, centered with `maxWidth="m"` content, single brand accent, one subtle gradient (recipes.md #1), no placeholder images (use `Avatar`, `Logo`, `Icon`).

## Layout primitives

1. Use `Row` and `Column` for layout. `Flex` with `direction` is only for dynamic direction.

```tsx
// Good
<Column gap="16">...</Column>
// Bad
<Flex direction="column" gap="16">...</Flex>
```

2. Use shorthands — they replace multi-prop combinations:

| Write | Instead of |
|-------|------------|
| `fill` | `fillWidth fillHeight` |
| `fit` | `fitWidth fitHeight` |
| `center` | `horizontal="center" vertical="center"` |

```tsx
// Good
<Row fill center>...</Row>
// Bad
<Row fillWidth fillHeight horizontal="center" vertical="center">...</Row>
```

3. Never write a prop that equals its default. The spec marks defaults with `= value`. Common offenders:
   - `position="relative"` (default on all layout components)
   - `direction="row"` on `Row`, `direction="column"` on `Column`
   - `variant="primary"`, `size="m"` on `Button`

## Spacing and sizing

4. Use spacing tokens, never raw CSS: `gap`, `padding`, `margin`, `paddingX/Y`, `marginX/Y` accept tokens (`"2" "4" "8" "12" "16" "20" "24" "32" "40" "48" "64"` or `"xs" "s" "m" "l" "xl"`).

```tsx
// Good
<Column gap="8" padding="24">
// Bad
<div style={{ gap: 8, padding: 24 }}>
```

5. `width`/`height`/`maxWidth`/`minHeight` accept numbers (rem), tokens, or CSS units. Prefer numbers/tokens.

6. Only use `style={{}}` for things no token prop covers (e.g. `isolation`, custom filters). If a prop exists, the prop wins.

## Color and surfaces

7. Colors are semantic tokens, never hex/rgb: `{scheme}-{weight}` or `{scheme}-alpha-{weight}` where scheme = `neutral | brand | accent | info | danger | warning | success` and weight = `weak | medium | strong`.
   - `background` also accepts `surface | overlay | page | transparent`
   - `onBackground` colors text/icons on a background

8. Standard surface recipe: `background="surface"` (or `"overlay"` over imagery) + `border="neutral-alpha-weak"` (or `-medium`) + `radius="l"`.

```tsx
<Column background="surface" border="neutral-alpha-weak" radius="l" padding="24" gap="16">
```

## Text

9. Use `Text` and `Heading` with `variant="{type}-{weight}-{size}"`: type = `body | heading | display | label | code`, weight = `default | strong`, size = `xs | s | m | l | xl`. Examples: `body-default-m`, `heading-strong-s`, `label-default-s`, `display-strong-m`.

10. If a layout component only wraps text, put `textVariant` (and `onBackground`) directly on it instead of nesting a `Text`:

```tsx
// Good
<Row textVariant="label-default-s" onBackground="neutral-weak">Updated today</Row>
// Bad
<Row><Text variant="label-default-s" onBackground="neutral-weak">Updated today</Text></Row>
```

## Responsive

11. Use breakpoint props (`xl l m s xs`) with override objects — never media queries or conditional rendering for layout:

```tsx
<Row gap="24" s={{ direction: "column" }}>
<Grid columns="3" s={{ columns: 1 }}>
```

## Components over primitives

12. Reach for the purpose-built component before composing primitives:
    - `Card` is for **interactive** surfaces only (`href` or `onClick`). Static panels (pricing tiers, testimonials, stat boxes) = `Column`/`Row` with the surface recipe (#8), not `Card`
    - Image/video → `Media`, not `img`
    - Links → `SmartLink` / `Button href`, not `a`
    - Status dot → `StatusIndicator`; progress → `ProgressBar`; loading → `Spinner` / `Skeleton`
    - Labels/metadata → `Tag`, `Chip`, `Badge`, `Kbd`, `InlineCode`

13. Use the distinctive features when the design calls for them — they exist and are cheap:
    - `Dialog` supports `stack` (stacked dialogs) and `base` props
    - Effects: `RevealFx`, `LetterFx`, `TypeFx`, `CountFx`, `GlitchFx`, `HoloFx`, `TiltFx`, `FlipFx`, `MatrixFx`, `BlobFx`, `Particle`, `ShineFx`, `CelebrationFx`
    - `CursorCard`, `HoverCard`, `ContextMenu`, `EmojiPicker`, `CompareImage`, `OgCard`, `Timeline`, `MasonryGrid`, `InfiniteScroll`, `SegmentedControl`, `Kbar` (command palette)
    - Forms: `Input`, `PasswordInput`, `OTPInput`, `NumberInput`, `TagInput`, `Select`, `DatePicker`, `DateRangePicker`, `ColorInput`, `Slider`, `Switch`, `Checkbox`, `Chip`

14. Buttons: `variant` = `primary | secondary | tertiary | danger`; pair with `prefixIcon`/`suffixIcon` (icon names, not elements). `IconButton` for icon-only actions with `tooltip`.

14b. Icon names must come from the `IconName` list in spec.json — never invent names (`more`, `bell`, and `arrowRight` don't exist; `close`, `chevronRight`, and `smiley` do). If no icon fits, omit the icon.

14c. Components with a text prop render it — never pass the same text as both prop and children, it renders twice:

```tsx
// Good
<Badge>{unread}</Badge>  or  <Tag size="s">Save 20%</Tag>
// Bad: renders "2 unread2" / "Save 20%Save 20%"
<Badge title={`${unread} unread`}>{unread}</Badge>
<Tag label="Save 20%">Save 20%</Tag>
```

14d. `Fade` is an **edge overlay strip** (scroll-fade at the boundary of a scroll container), not a content wrapper. Wrapping a message list or section in `Fade` washes the whole content out:

```tsx
// Good: thin absolute strip over the scroll edge
<Column flex={1} overflowY="auto">...</Column>
<Fade position="absolute" top="0" left="0" fillWidth height="40" to="bottom" base="surface" pointerEvents="none" />
// Bad
<Fade to="top" fill><Column overflowY="auto">...</Column></Fade>
```

## Composition rhythm

15. Page skeleton: `Column as="main" fillWidth horizontal="center"` → content `Column maxWidth={...}` → sections. Gaps between siblings, padding inside surfaces; avoid margins for layout when a parent `gap` can do it.

    `maxWidth` conventions: primary page containers `"xl"`–`"m"` (marketing/landing toward `"xl"`/`"l"`, app and docs content `"m"`). `"s"` is only for narrow reading content (about, legal); `"xs"` for special surfaces (drawers, popovers).

16. Data attributes for one-off theme overrides: `data-border="rounded"`, `data-brand="emerald"`, `data-solid="contrast"` — not custom CSS.

## Scale and hierarchy (marketing/landing pages)

17. Vertical rhythm is generous. Gap between page sections: `"80"`–`"160"` (typical `"104"`). Gap inside a section: `"24"`–`"40"`. Spacing tokens go up to `"160"` — use the top of the scale between sections, not `"48"`.

18. Heading scale: hero = `display-strong-l` (or `xl`), section headings = `display-strong-xs` or `display-strong-s` — never `heading-*` variants for section titles. Hero supporting text = `body-default-l`; section supporting text = `body-default-m`.

19. Type hierarchy must be monotonic: quotes, testimonials, and body content never render larger than the section heading above them. Testimonial quotes = `body-default-m` max, not `BlockQuote` default size.

20. Don't repeat the same centered heading + subtitle block for every section — it reads dated. Vary: left-aligned headers, heading-only sections, or an eyebrow label above the heading. Eyebrow = plain text, not a `Tag` with an icon:

```tsx
// Good eyebrow
<Text variant="label-default-s" onBackground="brand-medium">Pricing</Text>
// Bad eyebrow
<Tag variant="neutral" prefixIcon="sparkle">Pricing</Tag>
```

## Decorative layers

21. Every absolute decorative layer uses the full recipe — `top="0" left="0"` are required or the layer gets offset by parent padding:

```tsx
<Background position="absolute" top="0" left="0" fill pointerEvents="none" ... />
```

Siblings holding content get `zIndex={1}`. `overflow="hidden"` goes on the parent **only when it has a radius** (cards, panels) — clipping a full-bleed section turns the glow into a hard-edged band.

21b. Ambient section layers (hero glows) live on the **full-width section wrapper**, outside the `maxWidth` content column, with generous room (`paddingY="80"`+). Inside a narrow container the gradient gets clipped at the container edge and reads as a misplaced card:

```tsx
// Good: full-bleed section, narrow content inside
<Column fillWidth horizontal="center" paddingY="80">
  <Background position="absolute" top="0" left="0" fill pointerEvents="none" gradient={{...}} />
  <Column zIndex={1} maxWidth={48}>...</Column>
</Column>
```

22. `Background` gradient units: `x`/`y` are percent positions of the container (50/50 = center). `width`/`height` are quarter-percent units: `400` = 100% of the container, `100` = 25%. A soft corner glow is `width: 100–200`; `width: 500` overshoots the container.

23. Color visibility: `*-background-weak` is nearly the page color — it is invisible as an accent. For tints and glows use alpha tokens (`brand-alpha-medium`, `brand-alpha-strong`) or solid tokens (`brand-solid-strong`) and do not stack a low `opacity` on top of an already-weak color.

## Effect units

24. `RevealFx`: `delay` is in **seconds** — stagger with `delay={index * 0.1}`, never `index * 80`. `translateY` as a number is in **rem** — use `translateY={1}` or a token like `"16"` (1rem); `16` means 16rem.

25. `LogoCloud` extends `Grid` — always set `columns` (and responsive overrides), or logos stack in one column: `columns="4" m={{ columns: 3 }} s={{ columns: 2 }}`.

26. Use decoration recipes from `recipes.md` verbatim, then adjust. Budget: at most one ambient background layer per section, ambient motion in at most the hero and final CTA, one accent color family per page.

## Motion

27. Animations are **eye-leading, not eye-grabbing**: they direct attention to the one thing that should be read next, they don't announce themselves. Small distances (`translateY="8"`–`"16"`, i.e. 0.5–1rem), short staggers (`delay={index * 0.1}` max), and only on elements worth leading the eye to — the hero heading, stat numbers, the highlighted card in a set.

28. Do **not** wrap every section in `RevealFx` — uniform entrance animation on everything reads dated and makes scrolling feel slow. Entry-animation budget per page: the hero, plus at most one or two key moments (stats, a card set). Everything else just renders.

28b. Animate **coherent blocks, all-or-none**. Within a sibling set (cards, list items), either every sibling animates with a stagger or none do — never a single item out of the set (e.g. only the highlighted pricing card). For a hero, reveal it as 1–3 stacked chunks with increasing delay (`0 / 0.1 / 0.2`), not individual text fragments. One entrance moment per viewport: if the hero animates, the cards below it don't.

29. Trigger below-the-fold animations with `useInViewport`, latched so they play once. `RevealFx` takes `trigger`; `CountFx` has no trigger prop — drive its `value` instead:

```tsx
const ref = useRef<HTMLDivElement>(null);
const inViewport = useInViewport(ref);
const [seen, setSeen] = useState(false);
useEffect(() => {
  if (inViewport) setSeen(true); // latch: useInViewport flips back to false on scroll-out
}, [inViewport]);

<Column ref={ref} gap="16">
  <RevealFx trigger={seen} translateY="8">...</RevealFx>
  <CountFx value={seen ? 2400 : 0} speed={1500} separator="," variant="display-strong-m" />
</Column>
```

Without this, mount-timed animations play while still off-screen and the user scrolls into an already-finished state.
