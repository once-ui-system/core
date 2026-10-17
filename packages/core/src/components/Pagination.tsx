"use client";

import classNames from "clsx";
import type React from "react";
import { forwardRef, useCallback, useEffect, useId, useRef, useState } from "react";
import { pageCount, paginationItems, withDefaultLabels } from "../internal/pagination";
import { Button } from "./Button";
import { IconButton } from "./IconButton";
import styles from "./Pagination.module.scss";
import { Row } from "./Row";
import { Select } from "./Select";
import { Text } from "./Text";

interface PaginationLabels {
  /** The previous-page button's accessible name. */
  previous: string;
  /** The next-page button's accessible name. */
  next: string;
  /** The first-page button's accessible name, with `showFirstLast`. */
  first: string;
  /** The last-page button's accessible name, with `showFirstLast`. */
  last: string;
  /** The per-page select's visible label, with `perPageOptions`. */
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
// is 32px, as an `m` icon button is. The field is the closest height above.
const ICON_BUTTON_SIZE = { s: "m", m: "l", l: "xl" } as const;
const SELECT_SIZE = { s: "xs", m: "xs", l: "s" } as const;

interface PaginationProps
  extends Omit<React.ComponentProps<typeof Row>, "onChange" | "children" | "defaultValue"> {
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
  /** The landmark's name. Change it to translate it, or to tell two paginations apart. */
  "aria-label"?: string;
}

/**
 * Page through a long list: previous and next, the first and last pages, the
 * pages around the current one, and an ellipsis for the rest.
 *
 * A `nav` landmark holding a list of buttons; the current page carries
 * `aria-current="page"`. Pass `total` pages, or `count` items and `perPage`.
 * With `perPageOptions` it also offers a page-size select.
 *
 * Works on its own state (`defaultPage`) or the host's (`page` and
 * `onPageChange`), which is what server-side paging wants.
 */
const Pagination = forwardRef<HTMLDivElement, PaginationProps>(
  (
    {
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
      "aria-label": ariaLabel = "Pagination",
      ...flex
    },
    ref,
  ) => {
    const text = withDefaultLabels(DEFAULT_LABELS, labels);
    const perPageId = useId();
    const navRef = useRef<HTMLDivElement | null>(null);
    const refocusCurrent = useRef(false);

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

    const setRefs = useCallback(
      (node: HTMLDivElement | null) => {
        navRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      },
      [ref],
    );

    const goTo = (target: number, fromArrow = false) => {
      const next = Math.min(pages, Math.max(1, target));
      if (next === current) return;
      // The arrow that reaches either end disables itself; focus must not be
      // left on it, where the browser drops it to the page.
      if (fromArrow && (next === 1 || next === pages)) refocusCurrent.current = true;
      if (!controlled) setUncontrolledPage(next);
      onPageChange?.(next);
    };

    // Runs once the new page is drawn, controlled or not: `current` is the
    // trigger, and the button to focus is found by its aria-current.
    // biome-ignore lint/correctness/useExhaustiveDependencies: re-run on every page change, by design
    useEffect(() => {
      if (!refocusCurrent.current) return;
      refocusCurrent.current = false;
      const nav = navRef.current;
      const active = document.activeElement as HTMLButtonElement | null;
      if (nav && active && nav.contains(active) && !active.disabled) return;
      nav?.querySelector<HTMLElement>('[aria-current="page"]')?.focus();
    }, [current]);

    const changePerPage = (value: string | string[]) => {
      const next = Number(Array.isArray(value) ? value[0] : value);
      if (!Number.isFinite(next) || next <= 0 || next === currentPerPage) return;
      if (perPage === undefined) setUncontrolledPerPage(next);
      onPerPageChange?.(next);
      // Keep the first item on screen in view at the new size.
      const firstItem = (current - 1) * currentPerPage;
      const target = Math.floor(firstItem / next) + 1;
      const nextPages =
        total !== undefined ? pages : count !== undefined ? pageCount(count, next) : 1;
      const clamped = Math.min(nextPages, Math.max(1, target));
      if (clamped !== current) {
        if (!controlled) setUncontrolledPage(clamped);
        onPageChange?.(clamped);
      }
    };

    const iconSize = ICON_BUTTON_SIZE[size];
    const atStart = disabled || current <= 1;
    const atEnd = disabled || current >= pages;

    const arrow = (
      key: string,
      icon: "chevronDoubleLeft" | "chevronLeft" | "chevronRight" | "chevronDoubleRight",
      label: string,
      target: number,
      off: boolean,
    ) => (
      <Row as="li" key={key} vertical="center">
        <IconButton
          type="button"
          icon={icon}
          size={iconSize}
          variant="secondary"
          aria-label={label}
          disabled={off}
          onClick={() => goTo(target, true)}
        />
      </Row>
    );

    return (
      <Row ref={setRefs} as="nav" aria-label={ariaLabel} gap="16" vertical="center" wrap {...flex}>
        {perPageOptions && perPageOptions.length > 0 && (
          <Row gap="8" vertical="center">
            <Text id={`${perPageId}-label`} variant="label-default-s" onBackground="neutral-medium">
              {text.perPage}
            </Text>
            <Row width={5}>
              <Select
                id={`${perPageId}-select`}
                aria-labelledby={`${perPageId}-label`}
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
          </Row>
        )}
        <Row as="ul" margin="0" padding="0" gap="4" vertical="center" wrap>
          {showFirstLast && arrow("first", "chevronDoubleLeft", text.first, 1, atStart)}
          {arrow("previous", "chevronLeft", text.previous, current - 1, atStart)}
          {paginationItems(current, pages, Math.max(0, siblings), Math.max(0, boundaries)).map(
            (item) =>
              typeof item === "number" ? (
                <Row as="li" key={item} vertical="center">
                  <Button
                    type="button"
                    size={size}
                    variant={item === current ? "primary" : "tertiary"}
                    className={classNames(styles.item, styles[size])}
                    aria-current={item === current ? "page" : undefined}
                    disabled={disabled}
                    onClick={() => goTo(item)}
                  >
                    {item}
                  </Button>
                </Row>
              ) : (
                <Row
                  as="li"
                  key={item}
                  center
                  className={styles[size]}
                  textVariant="label-default-s"
                  onBackground="neutral-weak"
                >
                  …
                </Row>
              ),
          )}
          {arrow("next", "chevronRight", text.next, current + 1, atEnd)}
          {showFirstLast && arrow("last", "chevronDoubleRight", text.last, pages, atEnd)}
        </Row>
      </Row>
    );
  },
);

Pagination.displayName = "Pagination";

export type { PaginationLabels, PaginationProps };
export { Pagination };
