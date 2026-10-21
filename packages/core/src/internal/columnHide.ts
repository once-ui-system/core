import tableStyles from "../components/Table.module.scss";
import type { BreakpointKey } from "../contexts/LayoutProvider";
import { hiddenAboveBreakpoints } from "../utils/layoutClasses";

/**
 * Where a table column hides, by breakpoint: `{ s: true }` hides it at the `s`
 * width and below. `false` shows it again under a wider breakpoint's hide, so
 * `{ m: true, xs: false }` hides it on tablets only.
 */
export type ColumnHide = Partial<Record<BreakpointKey, boolean>>;

const HIDE = {
  xl: tableStyles.hideXl,
  l: tableStyles.hideL,
  m: tableStyles.hideM,
  s: tableStyles.hideS,
  xs: tableStyles.hideXs,
} as const;

const SHOW = {
  xl: undefined,
  l: tableStyles.showL,
  m: tableStyles.showM,
  s: tableStyles.showS,
  xs: tableStyles.showXs,
} as const;

const ORDER = ["xl", "l", "m", "s", "xs"] as const;

/**
 * The classes that hide a header cell and its body cells per breakpoint. Plain
 * CSS media queries, so the column is already hidden in the server render.
 */
export function columnHideClasses(hide: ColumnHide | undefined): string[] {
  if (!hide) return [];
  const hiddenAbove = hiddenAboveBreakpoints(
    undefined,
    ORDER.slice(0, 4).map((bp) => ({ hide: hide[bp] })),
  );
  const classes: string[] = [];
  for (const bp of ORDER) {
    if (hide[bp] === true) classes.push(HIDE[bp]);
    else if (hide[bp] === false && hiddenAbove[bp] && SHOW[bp]) classes.push(SHOW[bp]);
  }
  return classes;
}
