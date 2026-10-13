/** A page number, or a gap standing for the pages left out on that side. */
export type PaginationItem = number | "start-ellipsis" | "end-ellipsis";

const range = (start: number, end: number): number[] =>
  end < start ? [] : Array.from({ length: end - start + 1 }, (_, index) => start + index);

/**
 * The pages to draw for `page` of `total`: `boundaries` pages at each end,
 * `siblings` on each side of the current page, and an ellipsis for each run of
 * pages left out.
 *
 * The number of items stays the same wherever the current page is, so the
 * control does not change width as the reader pages through. An ellipsis that
 * would stand for a single page draws that page instead: a gap is never
 * smaller than the button it replaces.
 */
export function paginationItems(
  page: number,
  total: number,
  siblings: number,
  boundaries: number,
): PaginationItem[] {
  const startPages = range(1, Math.min(boundaries, total));
  const endPages = range(Math.max(total - boundaries + 1, boundaries + 1), total);

  // The window around the current page, slid inward near either end so it
  // keeps its full width.
  const windowStart = Math.max(
    Math.min(page - siblings, total - boundaries - siblings * 2 - 1),
    boundaries + 2,
  );
  const windowEnd = Math.min(
    Math.max(page + siblings, boundaries + siblings * 2 + 2),
    total - boundaries - 1,
  );

  const items: PaginationItem[] = [...startPages];

  if (windowStart > boundaries + 2) {
    items.push("start-ellipsis");
  } else if (boundaries + 1 < total - boundaries) {
    items.push(boundaries + 1);
  }

  items.push(...range(windowStart, windowEnd));

  if (windowEnd < total - boundaries - 1) {
    items.push("end-ellipsis");
  } else if (total - boundaries > boundaries) {
    items.push(total - boundaries);
  }

  items.push(...endPages);
  return items;
}

/** The page count for `count` items at `perPage` a page: at least one, so an empty list is page 1 of 1. */
export const pageCount = (count: number, perPage: number): number =>
  Math.max(1, Math.ceil(Math.max(0, count) / Math.max(1, perPage)));

/**
 * Labels over their defaults, skipping any given as `undefined`: a wrapper
 * that forwards `{ previous: labels?.previous }` must not blank the default
 * and leave a button with no name.
 */
export function withDefaultLabels<L extends object>(defaults: L, labels?: Partial<L>): L {
  const merged = { ...defaults };
  for (const [key, value] of Object.entries(labels ?? {})) {
    if (value !== undefined) (merged as Record<string, unknown>)[key] = value;
  }
  return merged;
}
