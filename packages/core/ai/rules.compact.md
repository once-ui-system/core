# Once UI — compact codegen rules

Load with task bundle from `@once-ui-system/core/ai/tasks/{intent}.json`. For production-quality composition, read matching Pro blocks from `examples/blocks/manifest.json`. Fetch component slices on demand.

## Layout

| Write | Never write |
|-------|-------------|
| `<Column gap="16">` | `<Flex direction="column">` |
| `<Row gap="16">` | `<Flex direction="row">` |
| `fill` | `fillWidth fillHeight` |
| `fit` | `fitWidth fitHeight` |
| `center` | `horizontal="center" vertical="center"` |

- `Flex` only when direction changes at breakpoints: `<Row s={{ direction: "column" }}>`
- Page skeleton: `Column as="main" fillWidth horizontal="center"` → content `Column maxWidth="l"` → sections
- Section gaps: `"104"` between sections, `"24"`–`"40"` inside. Never `"48"` between major sections.
- Responsive: breakpoint props `xl l m s xs` — never media queries for layout

## Surfaces

Static panel recipe (pricing tiers, stats, settings sections):

```tsx
<Column background="surface" border="neutral-alpha-weak" radius="l" padding="24" gap="16">
```

- `Card` = interactive only (`href` or `onClick`). Static panels = Column + surface recipe.
- Colors: `{scheme}-{weight}` or `{scheme}-alpha-{weight}`. Never hex/rgb.
- `background` also: `surface | overlay | page | transparent`

## Typography

- Hero: `display-strong-l` or `display-strong-xl`
- Section titles: `display-strong-xs` or `display-strong-s` — not `heading-*`
- Eyebrow: `<Text variant="label-default-s" onBackground="brand-medium">`
- Text on layout: `textVariant` + `onBackground` on Row/Column instead of nesting Text

## Decoration

Absolute layers always: `position="absolute" top="0" left="0" fill pointerEvents="none"`, content `zIndex={1}`.

- Gradient `width`: quarter-percent (400 = 100%). Glows: 100–200.
- Glow colors: `brand-alpha-medium`, not `brand-background-weak`
- Ambient layers on full-bleed section wrapper, outside `maxWidth` column
- Budget: one ambient layer per section; motion in hero + one CTA max

## Motion

- `RevealFx delay` in **seconds**: `delay={index * 0.1}`
- `RevealFx translateY`: number = rem; prefer `"8"`–`"16"` tokens
- Viewport-trigger with `useInViewport` + latch; `CountFx` driven by `value`, no trigger prop
- Animate all siblings in a set or none — never one lone animated card

## Components

| Need | Use |
|------|-----|
| Image | `Media` |
| Link | `SmartLink` / `Button href` |
| Status dot | `StatusIndicator` |
| Loading | `Spinner` / `Skeleton` |
| Scroll fade | `Fade` as edge strip, not wrapper |
| Icons | `IconName` from spec only |
| Logos grid | `LogoCloud` with `columns` set |

## Defaults — omit these

`position="relative"`, `direction` on Row/Column, `variant="primary"` on Button, `size="m"` when default.

## Before building

If design intent unclear, ask: content style, layout width, color approach, decoration level, imagery. Default: restrained, centered `maxWidth="m"`, single brand accent, one subtle gradient, no placeholder images.
