import { useState } from "react";
import { useTheme } from "../theme/ThemeProvider";
import { Button } from "./Button";
import { type FlexProps, Row } from "./Flex";
import { IconButton } from "./IconButton";
import { Select } from "./Select";
import { Text } from "./Text";

export interface PaginationLabels {
  /** The previous-page button's accessible name. */
  previous: string;
  /** The next-page button's accessible name. */
  next: string;
  /** The first-page button's accessible name, with `showFirstLast`. */
  first: string;
  /** The last-page button's accessible name, with `showFirstLast`. */
  last: string;
  /** The per-page select's label, with `perPageOptions`. */
  perPage: string;
}

const DEFAULT_LABELS: PaginationLabels = {
  previous: "Previous page",
  next: "Next page",
  first: "First page",
  last: "Last page",
  perPage: "Per page",
};

// Buttons and icon buttons share a height one size apart: an `s` page button
// is 32pt, as an `m` icon button is. The field is the closest height above.
const ICON_BUTTON_SIZE = { s: "m", m: "l", l: "xl" } as const;
const SELECT_SIZE = { s: "xs", m: "xs", l: "s" } as const;
// Pagination.module.scss: page buttons at least as wide as they are tall.
const MIN_WIDTH = { s: "32", m: "40", l: "48" } as const;

export interface PaginationProps extends Omit<FlexProps, "children"> {
  /** The current page, from 1, when the host owns the state. Pair with `onPageChange`. */
  page?: number;
  /** The page shown first when Pagination manages its own state. */
  defaultPage?: number;
  /** Called with the new page. Not called for the page already shown. */
  onPageChange?: (page: number) => void;
  /** How many pages there are. Or pass `count` and `perPage` and let Pagination work it out. */
  total?: number;
  /** How many items there are across all pages. With `perPage`, gives the page count. */
  count?: number;
  /** Items per page, when the host owns it. Pair with `onPerPageChange`. */
  perPage?: number;
  /** Items per page when Pagination manages it. */
  defaultPerPage?: number;
  /** Offer these page sizes in a select before the pages. Without it there is no select. */
  perPageOptions?: number[];
  /**
   * Called with the new page size. The page then moves so the first item on
   * screen stays on screen, and `onPageChange` reports that move.
   */
  onPerPageChange?: (perPage: number) => void;
  /** Pages drawn on each side of the current page. */
  siblings?: number;
  /** Pages always drawn at each end. */
  boundaries?: number;
  /** Add buttons that jump to the first and the last page. */
  showFirstLast?: boolean;
  /** The buttons' size. */
  size?: "s" | "m" | "l";
  /** Disable every control, such as while the next page loads. */
  disabled?: boolean;
  /** The buttons' names and the per-page label, to translate them. */
  labels?: Partial<PaginationLabels>;
}

/** A page number, or a gap standing for the pages left out on that side. */
type PaginationItem = number | "start-ellipsis" | "end-ellipsis";

const range = (start: number, end: number): number[] =>
  end < start ? [] : Array.from({ length: end - start + 1 }, (_, index) => start + index);

/**
 * Core's `paginationItems`: `boundaries` pages at each end, `siblings` on
 * each side of the current page, and an ellipsis for each run left out. The
 * count stays the same wherever the current page is, so the row keeps its width.
 */
function paginationItems(
  page: number,
  total: number,
  siblings: number,
  boundaries: number,
): PaginationItem[] {
  const startPages = range(1, Math.min(boundaries, total));
  const endPages = range(Math.max(total - boundaries + 1, boundaries + 1), total);
  const windowStart = Math.max(
    Math.min(page - siblings, total - boundaries - siblings * 2 - 1),
    boundaries + 2,
  );
  const windowEnd = Math.min(
    Math.max(page + siblings, boundaries + siblings * 2 + 2),
    total - boundaries - 1,
  );
  const items: PaginationItem[] = [...startPages];
  if (windowStart > boundaries + 2) items.push("start-ellipsis");
  else if (boundaries + 1 < total - boundaries) items.push(boundaries + 1);
  items.push(...range(windowStart, windowEnd));
  if (windowEnd < total - boundaries - 1) items.push("end-ellipsis");
  else if (total - boundaries > boundaries) items.push(total - boundaries);
  items.push(...endPages);
  return items;
}

const pageCount = (count: number, perPage: number) =>
  Math.max(1, Math.ceil(Math.max(0, count) / Math.max(1, perPage)));

/**
 * Core's `Pagination`: previous and next, the first and last pages, the
 * pages around the current one, and an ellipsis for the rest. Works on its
 * own state (`defaultPage`) or the host's (`page` and `onPageChange`).
 */
export function Pagination({
  page,
  defaultPage = 1,
  onPageChange,
  total,
  count,
  perPage,
  defaultPerPage = 10,
  perPageOptions,
  onPerPageChange,
  siblings = 1,
  boundaries = 1,
  showFirstLast = false,
  size = "m",
  disabled = false,
  labels,
  ...flex
}: PaginationProps) {
  const theme = useTheme();
  // Labels over their defaults, skipping any given as `undefined`.
  const text = { ...DEFAULT_LABELS };
  for (const [key, value] of Object.entries(labels ?? {})) {
    if (value !== undefined) text[key as keyof PaginationLabels] = value;
  }

  const [uncontrolledPerPage, setUncontrolledPerPage] = useState(defaultPerPage);
  const currentPerPage = Math.max(1, Math.floor(perPage ?? uncontrolledPerPage));
  const pages =
    total !== undefined
      ? Math.max(1, Math.floor(total))
      : count !== undefined
        ? pageCount(count, currentPerPage)
        : 1;

  const controlled = page !== undefined;
  const [uncontrolledPage, setUncontrolledPage] = useState(defaultPage);
  const current = Math.min(
    pages,
    Math.max(1, Math.floor((controlled ? page : uncontrolledPage) || 1)),
  );

  const goTo = (target: number) => {
    const next = Math.min(pages, Math.max(1, target));
    if (next === current) return;
    if (!controlled) setUncontrolledPage(next);
    onPageChange?.(next);
  };

  const changePerPage = (value: string | string[]) => {
    const next = Number(Array.isArray(value) ? value[0] : value);
    if (!Number.isFinite(next) || next <= 0 || next === currentPerPage) return;
    if (perPage === undefined) setUncontrolledPerPage(next);
    onPerPageChange?.(next);
    // Keep the first item on screen in view at the new size.
    const target = Math.floor(((current - 1) * currentPerPage) / next) + 1;
    const nextPages =
      total !== undefined ? pages : count !== undefined ? pageCount(count, next) : 1;
    const clamped = Math.min(nextPages, Math.max(1, target));
    if (clamped !== current) {
      if (!controlled) setUncontrolledPage(clamped);
      onPageChange?.(clamped);
    }
  };

  const atStart = disabled || current <= 1;
  const atEnd = disabled || current >= pages;
  const arrow = (
    key: string,
    icon: "chevronDoubleLeft" | "chevronLeft" | "chevronRight" | "chevronDoubleRight",
    label: string,
    target: number,
    off: boolean,
  ) => (
    <IconButton
      key={key}
      icon={icon}
      size={ICON_BUTTON_SIZE[size]}
      variant="secondary"
      aria-label={label}
      disabled={off}
      onPress={() => goTo(target)}
    />
  );

  return (
    <Row gap="16" vertical="center" wrap {...flex}>
      {perPageOptions && perPageOptions.length > 0 && (
        <Row width="8rem">
          <Select
            label={text.perPage}
            size={SELECT_SIZE[size]}
            value={String(currentPerPage)}
            disabled={disabled}
            onValueChange={changePerPage}
            options={perPageOptions.map((option) => ({
              label: String(option),
              value: String(option),
            }))}
          />
        </Row>
      )}
      {/* Shrinks to the screen so the buttons wrap instead of running off it. */}
      <Row gap="4" vertical="center" wrap style={{ flexShrink: 1 }}>
        {showFirstLast && arrow("first", "chevronDoubleLeft", text.first, 1, atStart)}
        {arrow("previous", "chevronLeft", text.previous, current - 1, atStart)}
        {paginationItems(current, pages, Math.max(0, siblings), Math.max(0, boundaries)).map(
          (item) =>
            typeof item === "number" ? (
              <Button
                key={item}
                size={size}
                variant={item === current ? "primary" : "tertiary"}
                label={String(item)}
                accessibilityLabel={`Page ${item}`}
                // Announced as selected, as core's `aria-current="page"`.
                accessibilityState={{ selected: item === current, disabled }}
                disabled={disabled}
                onPress={() => goTo(item)}
                style={{ minWidth: theme.space(MIN_WIDTH[size]) }}
              />
            ) : (
              <Row key={item} center minWidth={MIN_WIDTH[size]}>
                <Text textVariant="label-default-s" onBackground="neutral-weak">
                  …
                </Text>
              </Row>
            ),
        )}
        {arrow("next", "chevronRight", text.next, current + 1, atEnd)}
        {showFirstLast && arrow("last", "chevronDoubleRight", text.last, pages, atEnd)}
      </Row>
    </Row>
  );
}
