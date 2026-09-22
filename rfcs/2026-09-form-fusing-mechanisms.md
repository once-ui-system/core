# Design note: how `Form` fuses a stacked group

- **Status:** Decided and shipped — mechanism A ("collapse").
- **Date:** 2026-09-21
- **Scope:** `packages/core/src/components/Form.{tsx,module.scss}`, the
  `data-surface` hook on `Input` and `Textarea`.
- **Fixture:** `apps/dev/src/app/(main)/form-check/page.tsx`, cases 3, 8 and 9.
  Both mechanisms render there; case 8 and 9 are mechanism B, kept so this
  comparison stays checkable against something running.

## The question

`density="stacked"` has to make a set of fields read as one control: the
borders between neighbours collapse onto a single hairline, and only the
outside of the group stays round. Two mechanisms can do that. The API is the
same either way, so the choice was made by building both and measuring them,
not by reasoning about them.

## Mechanism A — collapse (shipped)

Every cell keeps the field's own border and background. Cells that are not in
the first row get `margin-top: -1px`; cells that are not in the first column
get `margin-left: -1px`. Two adjacent 1px borders pulled together by 1px
coincide exactly, so the pair paints as one line. This is the same trick
`gap="-1"` already plays for flex — `SegmentedControl` in compact mode and
`DateRangeInput` both use it — done per cell instead, because a cell knows its
row and column and a utility class cannot.

Corners are set through four custom properties on the cell, read by the
field's surface. Which corners are round comes from the occupied region, not
from a child's index: an edge is exposed when nothing occupies the track next
to it, and a corner is round where two exposed edges meet.

**Measured** (case 3, two columns, two spanning rows):

| | result |
|---|---|
| Divider between neighbours | **1px** — surfaces at `x 64–530` and `529–997`, overlapping by exactly 1 |
| Field background | `alpha 0.15` preserved, unchanged from a standalone field |
| Corner radii | `16,0,0,0` · `0,16,0,0` · `0,0,0,0` · `0,0,16,16` |
| Focused cell | `z-index: 1` against 8 neighbours at `auto`; no clipping ancestor |

## Mechanism B — hairline lattice (not shipped)

The container gets `gap: 1px` and a background in the border colour, so the
line shows through the gaps. The fields have to be ghosted, because the line
belongs to the container now and two borders plus a gap would otherwise stack.

**Measured** (cases 8 and 9):

| | ghosted (case 8) | left alone (case 9) |
|---|---|---|
| Divider | 1px | **3px** — 1px border + 1px gap + 1px border |
| Field background | `rgba(0,0,0,0)` — **the fill is gone** | `alpha 0.15`, composited over the line colour |

Three things went wrong, in increasing order of seriousness.

1. **The fill disappears.** Ghosting drops the border *and* the background, so
   the group renders as an empty outlined box with dividers in it, not as a
   column of fields. Getting the Once UI field look back means the cell
   re-implementing `neutral-alpha-weak` itself — the container now owns a
   visual the field is supposed to own.
2. **The translucency problem the brief anticipated is real.** Fields default
   to a 15%-alpha background. Over a container painted the border colour they
   composite against the line rather than the page, so the whole group picks up
   a tint — not only the 1px gaps. The cell has to re-establish an opaque
   backdrop underneath, and that backdrop is a *guess* at what is behind the
   form. Put the group on a `Card` and the fields stop matching what surrounds
   them. Row lines cannot be painted as a background gradient instead, because
   row heights vary with content — a `Textarea` is taller than an `Input`.
3. **It does not avoid the per-cell work.** The obvious way to round the
   outside is `overflow: hidden` on the container, and that is exactly what
   cannot be used: the focus ring is an `outline` with a 2px offset, and
   clipping the container clips the ring. So the corner cells have to restate
   their radius individually — the same per-cell geometry mechanism A needs,
   with the drawbacks above on top.

## Why A won

A keeps the field's own border and background, so a fused field is the same
object it was standing alone — the container adds no visual it has to
maintain. B needs the container to reproduce two of the field's visuals and
guess a third, and still ends up needing per-cell geometry.

There is a fourth point that only showed up once real fields were in the
fixture: `Input` renders its error and description rows *inside* the wrapper
`Form` lays out. Under A that text falls outside the bordered box, which is
right. Under B, where the cell carries the border, an error message would be
drawn inside the group's outline.

## Why the corners are computed in JS, and not as `:nth-child()` rules

CSS child selectors were the obvious answer to the responsive problem, and
they do not work here:

- **Spans defeat nth-child arithmetic.** An item with `span={2}` takes two
  tracks but is one child. In two columns holding four fields where the last
  two span both, the first cell of each row is child 1, 3 and 4 — a set no
  `an + b` can name.
- **The surface is not the child.** `Input` and `Textarea` render an outer
  `Column`, which also holds the error and description rows, wrapping the
  bordered `Row`. `Form > *` reaches the wrapper, never the element carrying
  the radius. Hence `data-surface="field"`, which those two components set and
  `Form` targets within a bounded two levels.

So `Form` simulates grid's row-major auto-placement — once per breakpoint,
over the children that actually rendered — and emits a class per breakpoint.
That covers spans, conditional children and responsive column counts at the
same time, with no measurement and nothing to re-run on resize.

The specificity was not left to source order where it matters. Everything that
has to beat the surface's own `.radius-l` (0,1,0) is at least (0,3,0). Within a
breakpoint, the reset and the rules sit at the same specificity with the reset
written first — the same ordering `grid.generated.scss` already relies on for
its own breakpoint classes.

## Does foundations need a grid negative-gap class?

**No, and it should not get one.** The brief left this open. `gap="-1"`
resolves to `g-vertical--1` / `g-horizontal--1`, which key off
`:not(:first-child)`. In a grid that selector matches the first cell of every
row after the first and drags it sideways, so the flex classes cannot be
borrowed. A correct static utility would have to know the column count *and*
every item's span, which is exactly the information a utility class does not
have and a component does. The per-cell margins belong in `Form`.

Nothing else was missing: the breakpoint column classes (`.m-columns-2` and
friends) already exist in `grid.generated.scss`, and `Form` uses them directly
rather than `Grid`'s `xl`/`l`/`m`/`s`/`xs` props — those switch `Grid` to
`ClientGrid`, which reads `useLayout` and would have made every responsive
`Form` require a `LayoutProvider` above it.

## Known limits

- Only children that mark a surface fuse. That is deliberate — a `Button` or a
  paragraph in a form should keep its own shape — but it does mean a
  third-party field will sit in the grid without joining the group until it
  sets `data-surface`.
- A field with an `errorMessage` or `description` grows its cell downward, so
  the group visually splits at that row. That is the correct reading, but it is
  worth knowing before reaching for `stacked` on a form with dense validation.
- `-1px` is tuned for a 1px border. A theme with a thicker field border would
  leave a seam; nothing in the codebase currently sets one.
