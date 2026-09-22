"use client";

import classNames from "clsx";
import React, { forwardRef } from "react";
import type { GridSize, SpacingToken, TShirtSizes } from "../types";
import styles from "./Form.module.scss";
import { FormFieldContext } from "./FormContext";
import { Grid } from "./Grid";

/**
 * Form — spacing density and grouping for a set of fields.
 *
 * `density` is one decision, not two: how much air sits between fields, and
 * whether they read as separate controls or as a single one. `"stacked"` fuses
 * them — adjacent borders collapse onto a shared hairline and only the outer
 * corners of the group stay round. `"tight"` and `"spacious"` are ordinary
 * gaps, where every field keeps its own border and its own radius.
 *
 * The corner assignment is the point of the component. Hand-writing
 * `corners="top" | "none" | "bottom"` down a stack is positional bookkeeping
 * that breaks silently the moment a field is conditionally rendered or
 * reordered — hide the third of four and the group ends on a square edge.
 * Form derives the corners instead, from the children that actually rendered,
 * at every breakpoint.
 */

type Breakpoint = "xl" | "l" | "m" | "s" | "xs";

const BREAKPOINTS: Breakpoint[] = ["xl", "l", "m", "s", "xs"];

/** Columns, either flat or per breakpoint. Breakpoints cascade xl → xs, the
 *  same direction `Grid` cascades them. */
type FormColumns = number | Partial<Record<Breakpoint, number>>;

interface FormProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSubmit"> {
  /**
   * Gap and grouping as one decision. `"stacked"` collapses the gap to a
   * shared hairline and rounds only the outside of the group; `"tight"` and
   * `"spacious"` keep every field its own control.
   */
  density?: "stacked" | "tight" | "spacious";
  /** Grid columns. A number, or a per-breakpoint map like `{ xs: 1, m: 2 }`. */
  columns?: FormColumns;
  /**
   * Size for every field in the form. A field that sets its own `size` keeps
   * it. Passed down by context rather than cloned onto the children, so a
   * child that is not a field does not pick up a stray attribute.
   */
  size?: TShirtSizes;
  /** Render a real `<form>` rather than a `<div>`. */
  as?: "div" | "form";
  onSubmit?: React.FormEventHandler<HTMLFormElement>;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

const DENSITY_GAP: Record<NonNullable<FormProps["density"]>, SpacingToken> = {
  stacked: "0",
  tight: "8",
  spacious: "24",
};

interface Placement {
  row: number;
  col: number;
  span: number;
}

/**
 * Simulate CSS grid's row-major auto-placement for items that declare only a
 * span.
 *
 * This is why the corners are computed here rather than written as
 * `:nth-child()` rules. An item with `span={2}` occupies two tracks but is
 * still one child, so nth-child arithmetic counts the wrong thing as soon as
 * anything spans: in a two-column grid holding four fields where the last two
 * span both columns, the first cell of each row is child 1, 3 and 4 — a set
 * no `an + b` can name. Running this per breakpoint covers the responsive
 * case that defeats corners computed once; see `resolveColumns`.
 */
function place(spans: number[], columns: number): Placement[] {
  const placements: Placement[] = [];
  let row = 0;
  let col = 0;

  for (const raw of spans) {
    const span = Math.min(Math.max(1, Math.floor(raw)), columns);
    // A span that no longer fits the current row moves to the next one and
    // leaves the tail of this row empty — what the browser does.
    if (col + span > columns) {
      row += 1;
      col = 0;
    }
    placements.push({ row, col, span });
    col += span;
    if (col >= columns) {
      row += 1;
      col = 0;
    }
  }

  return placements;
}

type Corner = "tl" | "tr" | "bl" | "br";

interface CellGeometry {
  /** Collapse this cell's top border onto the cell above. */
  fuseTop: boolean;
  /** Collapse this cell's left border onto the cell beside it. */
  fuseLeft: boolean;
  corners: Corner[];
  /** The span actually used, after clamping to the column count. */
  span: number;
}

/**
 * Which edges of a cell lie on the outside of the occupied region, and so
 * which of its corners stay round.
 *
 * A corner is round only where both edges meeting at it are exposed. That is
 * what makes a ragged last row come out right: three fields in two columns
 * leave the second field's bottom-right on the outside of the group, so it
 * keeps that corner even though it is not the last child.
 */
function geometry(placements: Placement[], columns: number): CellGeometry[] {
  const rows = placements.length ? Math.max(...placements.map((p) => p.row)) + 1 : 0;

  // occupancy[row][col] — the index of the cell owning that track, if any.
  const occupancy: (number | undefined)[][] = Array.from({ length: rows }, () =>
    Array.from({ length: columns }, () => undefined),
  );
  placements.forEach((p, index) => {
    for (let c = p.col; c < p.col + p.span; c += 1) {
      occupancy[p.row][c] = index;
    }
  });

  const occupied = (row: number, col: number) =>
    row >= 0 && row < rows && col >= 0 && col < columns && occupancy[row][col] !== undefined;

  return placements.map((p) => {
    const cols = Array.from({ length: p.span }, (_, i) => p.col + i);

    const topExposed = cols.every((c) => !occupied(p.row - 1, c));
    const bottomExposed = cols.every((c) => !occupied(p.row + 1, c));
    const leftExposed = !occupied(p.row, p.col - 1);
    const rightExposed = !occupied(p.row, p.col + p.span);

    const corners: Corner[] = [];
    if (topExposed && leftExposed) corners.push("tl");
    if (topExposed && rightExposed) corners.push("tr");
    if (bottomExposed && leftExposed) corners.push("bl");
    if (bottomExposed && rightExposed) corners.push("br");

    return {
      // Only an interior edge collapses; a cell whose top edge is on the
      // outside has nothing above it to collapse onto.
      fuseTop: !topExposed,
      fuseLeft: !leftExposed,
      corners,
      span: p.span,
    };
  });
}

/** Column count at each breakpoint, cascading xl → xs the way `Grid` does. */
function resolveColumns(columns: FormColumns | undefined): {
  base: number;
  perBreakpoint: Partial<Record<Breakpoint, number>> | undefined;
} {
  if (typeof columns === "number") {
    return { base: Math.max(1, Math.floor(columns)), perBreakpoint: undefined };
  }
  if (!columns) {
    return { base: 1, perBreakpoint: undefined };
  }

  // The widest value given becomes the base, so a map naming only `xs` and `m`
  // still renders something sensible above `m`.
  const widest = BREAKPOINTS.find((bp) => columns[bp] !== undefined);
  const base = widest ? Math.max(1, Math.floor(columns[widest] as number)) : 1;

  const perBreakpoint: Partial<Record<Breakpoint, number>> = {};
  let current = base;
  for (const bp of BREAKPOINTS) {
    const value = columns[bp];
    if (value !== undefined) current = Math.max(1, Math.floor(value));
    perBreakpoint[bp] = current;
  }

  return { base, perBreakpoint };
}

/** `corner-tl` at the base, `m-corner-tl` inside the `m` media query. */
const scoped = (bp: Breakpoint | undefined, name: string) => styles[bp ? `${bp}-${name}` : name];

const Form = forwardRef<HTMLDivElement, FormProps>(
  (
    { density = "tight", columns, size, as = "div", onSubmit, className, style, children, ...rest },
    ref,
  ) => {
    // `toArray` drops the `null`, `undefined` and `false` a conditionally
    // rendered field leaves behind, so everything below is computed over the
    // fields that actually rendered — which is the whole point.
    const items = React.Children.toArray(children).filter(React.isValidElement);

    const spans = items.map((child) => {
      const span = (child.props as { span?: number }).span;
      return typeof span === "number" && Number.isFinite(span) ? span : 1;
    });

    const fieldDefaults = React.useMemo(() => ({ size }), [size]);

    const { base, perBreakpoint } = resolveColumns(columns);
    const stacked = density === "stacked";
    const responsive = perBreakpoint !== undefined;

    const baseGeometry = geometry(place(spans, base), base);

    // Every breakpoint gets a full set of classes, not just the ones whose
    // column count differs. A cell keeps its base classes at all widths, so a
    // breakpoint that places it differently must be able to state the whole
    // answer — reset included — rather than add to a stale one.
    const breakpointGeometry: Partial<Record<Breakpoint, CellGeometry[]>> = {};
    if (perBreakpoint) {
      for (const bp of BREAKPOINTS) {
        const count = perBreakpoint[bp];
        if (count === undefined) continue;
        breakpointGeometry[bp] = geometry(place(spans, count), count);
      }
    }

    const cells = items.map((child, index) => {
      const cellClasses: (string | undefined)[] = [styles.cell];

      const apply = (bp: Breakpoint | undefined, geo: CellGeometry) => {
        if (geo.span > 1) cellClasses.push(scoped(bp, `span-${geo.span}`));
        if (!stacked) return;
        if (geo.fuseTop) cellClasses.push(scoped(bp, "fuse-top"));
        if (geo.fuseLeft) cellClasses.push(scoped(bp, "fuse-left"));
        for (const corner of geo.corners) {
          cellClasses.push(scoped(bp, `corner-${corner}`));
        }
      };

      // With a responsive column map, every viewport is already covered by one
      // of the five breakpoint queries — `xl` is a min-width, `l` a max-width,
      // and the two meet — so base classes would only be a wider answer left
      // lying around for a narrower one to undo.
      if (responsive) {
        for (const bp of BREAKPOINTS) {
          const geo = breakpointGeometry[bp];
          if (!geo) continue;
          cellClasses.push(scoped(bp, "reset"));
          apply(bp, geo[index]);
        }
      } else {
        apply(undefined, baseGeometry[index]);
      }

      return (
        <div
          key={child.key ?? index}
          className={classNames(cellClasses)}
          data-testid={`form-cell-${index}`}
        >
          {/* `span` is a layout instruction addressed to Form, not a field
              prop — strip it so it never reaches the DOM. */}
          {React.cloneElement(child as React.ReactElement<{ span?: number }>, {
            span: undefined,
          })}
        </div>
      );
    });

    // `Grid`'s own `xl`/`l`/`m`/`s`/`xs` props would do this, but they switch it
    // to `ClientGrid`, which reads `useLayout` and so requires a
    // `LayoutProvider` above it. Nothing here is dynamic — foundations already
    // ships `.m-columns-2` and friends — so the classes go on directly and
    // Form keeps working anywhere.
    const columnClasses = perBreakpoint
      ? BREAKPOINTS.filter((bp) => perBreakpoint[bp] !== undefined).map(
          (bp) => `${bp}-columns-${perBreakpoint[bp]}`,
        )
      : [];

    return (
      <Grid
        ref={ref}
        as={as}
        // Only a real `<form>` has a submit event; handing one to a `<div>`
        // would just be a dead listener.
        {...(as === "form" && onSubmit
          ? { onSubmit: onSubmit as unknown as React.FormEventHandler<HTMLDivElement> }
          : {})}
        fillWidth
        columns={String(base) as GridSize}
        gap={DENSITY_GAP[density]}
        className={classNames(styles.form, stacked && styles.stacked, columnClasses, className)}
        style={style}
        data-density={density}
        {...rest}
      >
        <FormFieldContext.Provider value={fieldDefaults}>{cells}</FormFieldContext.Provider>
      </Grid>
    );
  },
);

Form.displayName = "Form";

export type { FormColumns, FormProps };
export { Form };
