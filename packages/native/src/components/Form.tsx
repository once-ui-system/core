import {
  Children,
  cloneElement,
  isValidElement,
  type ReactElement,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useTheme } from "../theme/ThemeProvider";
import type { SpacingToken, TShirtSizes } from "../types";
import { BREAKPOINTS, type Breakpoint, Column, type FlexProps, Row } from "./Flex";
import {
  FormCellContext,
  type FormCellCorners,
  FormFieldContext,
  type FormStatus,
  FormStatusContext,
} from "./FormContext";

/** Columns, flat or per breakpoint, cascading xl → xs as in core. */
export type FormColumns = number | Partial<Record<Breakpoint, number>>;

export interface FormProps extends Omit<FlexProps, "direction"> {
  /**
   * Gap and grouping as one decision, as in core. `"stacked"` fuses the
   * fields onto shared borders and rounds only the group's outer corners;
   * `"tight"` (8) and `"spacious"` (24) keep every field its own control.
   */
  density?: "stacked" | "tight" | "spacious";
  /** Columns: a number, or per breakpoint like `{ xs: 1, m: 2 }`. A child's `span` takes several. */
  columns?: FormColumns;
  /** Size for every field inside. A field that sets its own keeps it. */
  size?: TShirtSizes;
  /**
   * Core renders a real `<form>` with `"form"`. React Native has no form
   * element: here `"form"` lets a `SubmitButton` inside call `onSubmit`.
   */
  as?: "div" | "form";
  /**
   * Called by a `SubmitButton` inside. Return a promise and the form is
   * pending until it settles: the button shows its spinner and ignores taps.
   */
  onSubmit?: () => unknown;
  /** Marks the form as submitting from outside. Wins over the state `onSubmit` tracks. */
  pending?: boolean;
  children?: ReactNode;
}

const GAP: Record<NonNullable<FormProps["density"]>, SpacingToken> = {
  stacked: "0",
  tight: "8",
  spacious: "24",
};

interface Placement {
  row: number;
  col: number;
  span: number;
}

/** Row-major placement of items that declare only a span, as CSS grid places them. */
export function place(spans: number[], columns: number): Placement[] {
  const placements: Placement[] = [];
  let row = 0;
  let col = 0;
  for (const raw of spans) {
    const span = Math.min(Math.max(1, Math.floor(raw)), columns);
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

/** Which corners of each cell lie on the outside of the group, and which edges it shares. */
export function corners(placements: Placement[], columns: number) {
  const rows = placements.length ? Math.max(...placements.map((p) => p.row)) + 1 : 0;
  const owner: (number | undefined)[][] = Array.from({ length: rows }, () =>
    Array.from({ length: columns }, () => undefined),
  );
  placements.forEach((p, i) => {
    for (let c = p.col; c < p.col + p.span; c += 1) owner[p.row][c] = i;
  });
  const taken = (r: number, c: number) =>
    r >= 0 && r < rows && c >= 0 && c < columns && owner[r][c] !== undefined;
  return placements.map((p) => {
    const cols = Array.from({ length: p.span }, (_, i) => p.col + i);
    const top = cols.every((c) => !taken(p.row - 1, c));
    const bottom = cols.every((c) => !taken(p.row + 1, c));
    const left = !taken(p.row, p.col - 1);
    const right = !taken(p.row, p.col + p.span);
    const round: FormCellCorners = {
      tl: top && left,
      tr: top && right,
      bl: bottom && left,
      br: bottom && right,
    };
    return { round, fuseTop: !top, fuseLeft: !left };
  });
}

/**
 * The column count at a width: the widest value given, then each breakpoint
 * the width falls within, larger first, as Flex applies breakpoint props.
 */
function columnsAt(
  columns: FormColumns | undefined,
  width: number,
  limits: Record<Breakpoint, number>,
) {
  if (typeof columns === "number") return Math.max(1, Math.floor(columns));
  if (!columns) return 1;
  const widest = BREAKPOINTS.find((bp) => columns[bp] !== undefined);
  let current = widest ? (columns[widest] as number) : 1;
  for (const bp of BREAKPOINTS) {
    const value = columns[bp];
    if (value !== undefined && width <= limits[bp]) current = value;
  }
  return Math.max(1, Math.floor(current));
}

/**
 * Core's `Form`: spacing, columns and grouping for a set of fields, a size
 * for all of them, and the submit state a `SubmitButton` shows. With
 * `density="stacked"` the fields share their borders and only the group's
 * outer corners stay round, worked out from the fields that rendered.
 */
export function Form({
  density = "tight",
  columns,
  size,
  as = "div",
  onSubmit,
  pending,
  children,
  ...column
}: FormProps) {
  const theme = useTheme();
  const outer = useContext(FormFieldContext);
  const outerStatus = useContext(FormStatusContext);
  const [inFlight, setInFlight] = useState(0);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const isPending = pending ?? inFlight > 0;
  const submit = useCallback(() => {
    if (!onSubmit || isPending) return;
    const result = onSubmit();
    if (!result || typeof (result as Promise<unknown>).then !== "function") return;
    setInFlight((n) => n + 1);
    const settle = () => {
      if (mounted.current) setInFlight((n) => Math.max(0, n - 1));
    };
    (result as Promise<unknown>).then(settle, (error: unknown) => {
      settle();
      throw error;
    });
  }, [onSubmit, isPending]);

  // A layout-only Form inside a Fieldset passes the outer form's state through.
  const providesStatus = as === "form" || pending !== undefined;
  const status = useMemo<FormStatus>(
    () => (providesStatus ? { pending: isPending, submit } : outerStatus),
    [providesStatus, isPending, submit, outerStatus],
  );
  const defaults = useMemo(
    () => ({ size: size ?? outer.size, disabled: outer.disabled }),
    [size, outer.size, outer.disabled],
  );

  // A child that says it draws nothing (FormErrorSummary with no errors) takes no
  // cell, so it leaves no gap at the top of the form.
  const items = (
    Children.toArray(children).filter(isValidElement) as ReactElement<{ span?: number }>[]
  ).filter(
    (child) =>
      !(child.type as { drawsNothing?: (props: unknown) => boolean }).drawsNothing?.(child.props),
  );
  const count = columnsAt(columns, theme.width, theme.breakpoints);
  const spans = items.map((child) =>
    typeof child.props.span === "number" && Number.isFinite(child.props.span)
      ? child.props.span
      : 1,
  );
  const placements = place(spans, count);
  const cells = corners(placements, count);
  const stacked = density === "stacked";
  const gap = theme.space(GAP[density]);

  const rows: ReactNode[][] = [];
  items.forEach((child, i) => {
    const { row, span } = placements[i];
    const cell = cells[i];
    rows[row] ??= [];
    const field = cloneElement(child, { span: undefined });
    rows[row].push(
      <Column
        key={child.key ?? i}
        // Flex shares the row by span; the basis 0 keeps the gaps out of the sum.
        style={{
          flexGrow: span,
          flexBasis: 0,
          minWidth: 0,
          ...(stacked && cell.fuseTop ? { marginTop: -1 } : {}),
          ...(stacked && cell.fuseLeft ? { marginLeft: -1 } : {}),
        }}
      >
        {stacked ? (
          <FormCellContext.Provider value={cell.round}>{field}</FormCellContext.Provider>
        ) : (
          field
        )}
      </Column>,
    );
  });

  return (
    <Column
      fillWidth
      gap={GAP[density]}
      aria-busy={providesStatus && isPending ? true : undefined}
      {...column}
    >
      <FormFieldContext.Provider value={defaults}>
        <FormStatusContext.Provider value={status}>
          {rows.map((cellsInRow, r) => {
            // A short last row keeps the column widths: empty tracks fill the rest.
            const used = placements.filter((p) => p.row === r).reduce((n, p) => n + p.span, 0);
            return (
              // biome-ignore lint/suspicious/noArrayIndexKey: rows are positional
              <Row key={r} fillWidth style={{ gap }}>
                {cellsInRow}
                {used < count && <Column style={{ flexGrow: count - used, flexBasis: 0 }} />}
              </Row>
            );
          })}
        </FormStatusContext.Provider>
      </FormFieldContext.Provider>
    </Column>
  );
}
