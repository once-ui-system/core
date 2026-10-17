"use client";

import classNames from "clsx";
import type React from "react";
import { isValidElement, type ReactNode, useEffect, useMemo, useState } from "react";
import { pageCount, withDefaultLabels } from "../internal/pagination";
import { dev } from "../utils/devLogger";
import { Checkbox } from "./Checkbox";
import { Column } from "./Column";
import styles from "./DataTable.module.scss";
import { Flex } from "./Flex";
import { Icon } from "./Icon";
import { Pagination, type PaginationLabels } from "./Pagination";
import { Row } from "./Row";
import { Skeleton } from "./Skeleton";
import tableStyles from "./Table.module.scss";
import { Text } from "./Text";

interface DataTableColumn<T> {
  /**
   * Names the column: its React key, the `key` a sort reports and, when the
   * column has no `cell`, the field of the row it shows and sorts by.
   */
  key: string;
  /** The header cell's content. */
  header: ReactNode;
  /** Renders this column's cell for a row. Without it the cell shows `row[key]`. */
  cell?: (row: T, index: number) => ReactNode;
  /** Let the reader sort by this column from its header. */
  sortable?: boolean;
  /**
   * Orders two rows, ascending; the table reverses it for descending. Without
   * it rows compare by `row[key]`: numbers, dates and text in natural order
   * ("Item 2" before "Item 10"), empty values last either way.
   */
  sort?: (a: T, b: T) => number;
  /** Aligns the header and the cells. */
  align?: "left" | "center" | "right";
  /** A CSS width for the column, such as `"12rem"` or `"20%"`. */
  width?: string;
}

interface DataTableSort {
  /** The `key` of the sorted column. */
  key: string;
  direction: "asc" | "desc";
}

interface DataTableLabels extends PaginationLabels {
  /**
   * The select-all checkbox's accessible name. Defaults to "Select all rows",
   * or "Select all rows on this page" when paginated, which is what it does.
   */
  selectAll: string;
  /** Each row checkbox's accessible name, unless `getRowLabel` names it. */
  selectRow: string;
  /** The pagination landmark's name. */
  pagination: string;
}

const DEFAULT_LABELS: Pick<DataTableLabels, "selectRow" | "pagination" | "perPage"> = {
  selectRow: "Select row",
  pagination: "Pagination",
  perPage: "Rows per page",
};

interface DataTableProps<T>
  extends Omit<React.ComponentProps<typeof Column>, "children" | "onChange" | "defaultValue"> {
  /** The columns, in order. */
  columns: DataTableColumn<T>[];
  /** The rows: every row, or with `count` or `total` only the current page's. */
  rows: T[];
  /**
   * A stable id for a row, which selection reports. Without it a row's `id`
   * field is used when it is a string or a number, and its index otherwise.
   */
  getRowId?: (row: T, index: number) => string;

  /** The sorted column and direction, when the host owns it; `null` for unsorted. */
  sort?: DataTableSort | null;
  /** The sort to start with when DataTable owns it. */
  defaultSort?: DataTableSort | null;
  /** Called with the new sort, or `null` when the reader clears it. */
  onSortChange?: (sort: DataTableSort | null) => void;

  /** Add a checkbox column, with a select-all checkbox for the rows on screen. */
  selectable?: boolean;
  /** The selected rows' ids, when the host owns them. */
  selected?: string[];
  /** The ids selected to start with when DataTable owns the selection. */
  defaultSelected?: string[];
  /** Called with every selected id after each change. */
  onSelectionChange?: (selected: string[]) => void;
  /** The accessible name of a row's checkbox, such as `row => \`Select ${row.name}\``. */
  getRowLabel?: (row: T) => string;

  /** Show the rows a page at a time, with Pagination below. */
  paginated?: boolean;
  /** The current page, from 1, when the host owns it. */
  page?: number;
  /** The page to start on when DataTable owns it. */
  defaultPage?: number;
  /** Called with the new page. */
  onPageChange?: (page: number) => void;
  /** Rows per page, when the host owns it. */
  perPage?: number;
  /** Rows per page when DataTable owns it. */
  defaultPerPage?: number;
  /** Page sizes to offer in a select beside the pages. */
  perPageOptions?: number[];
  /** Called with the new page size. */
  onPerPageChange?: (perPage: number) => void;
  /**
   * The number of rows on the server. Set it (or `total`) when `rows` holds
   * only the current page: DataTable then neither sorts nor slices the rows
   * itself, and reports page and sort changes for the host to fetch.
   */
  count?: number;
  /** The number of pages on the server, when it reports pages rather than rows. As `count`. */
  total?: number;

  /** Swap the rows for skeleton rows, and disable the controls, while data loads. */
  loading?: boolean;
  /** What to show when there are no rows. */
  emptyState?: ReactNode;

  /**
   * Keep the header row in view while the rows scroll. Pair with `maxHeight`,
   * which on DataTable caps the table's scroll area rather than the whole
   * component.
   */
  stickyHeader?: boolean;
  /** Alternate row backgrounds. */
  striped?: boolean;
  /** Highlight the row under the pointer. */
  hoverable?: boolean;
  /** Tighter rows, for dense data. */
  compact?: boolean;
  /** The checkbox, pagination and per-page names, to translate them. */
  labels?: Partial<DataTableLabels>;
  /** The table's accessible name. */
  "aria-label"?: string;
  /** The id of the element that names the table, such as a heading above it. */
  "aria-labelledby"?: string;
}

type Entry<T> = { row: T; index: number; id: string };

const fieldOf = (row: unknown, key: string): unknown =>
  row !== null && typeof row === "object" ? (row as Record<string, unknown>)[key] : undefined;

const defaultRowId = (row: unknown, index: number): string => {
  const id = fieldOf(row, "id");
  return typeof id === "string" || typeof id === "number" ? String(id) : String(index);
};

const isEmpty = (value: unknown) =>
  value === null ||
  value === undefined ||
  value === "" ||
  (typeof value === "number" && Number.isNaN(value)) ||
  (value instanceof Date && Number.isNaN(value.getTime()));

function compareValues(a: unknown, b: unknown): number {
  if (typeof a === "number" && typeof b === "number") return a - b;
  if (typeof a === "bigint" && typeof b === "bigint") return a < b ? -1 : a > b ? 1 : 0;
  if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime();
  if (typeof a === "boolean" && typeof b === "boolean") return Number(a) - Number(b);
  return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: "base" });
}

/** A field as cell content. Dates print as YYYY-MM-DD, the same on the server and in every locale. */
function renderField(value: unknown): ReactNode {
  if (value === null || value === undefined) return null;
  if (isValidElement(value)) return value;
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value.toISOString().slice(0, 10);
  }
  if (Array.isArray(value)) return value.map(String).join(", ");
  return String(value);
}

const ALIGN = {
  left: { th: tableStyles.thAlignLeft, td: tableStyles.tdAlignLeft, row: "start" },
  center: { th: tableStyles.thAlignCenter, td: tableStyles.tdAlignCenter, row: "center" },
  right: { th: tableStyles.thAlignRight, td: tableStyles.tdAlignRight, row: "end" },
} as const;

const SKELETON_WIDTHS = [8, 6, 10, 5, 7];

/**
 * A table of typed rows: column definitions instead of pre-rendered cells,
 * sorting, row selection, pagination, and empty and loading states.
 *
 * Sorting, selection and the page each work on DataTable's own state or the
 * host's (`sort`, `selected`, `page` with their change handlers). With `count`
 * or `total` the rows are one server page, and DataTable leaves sorting and
 * slicing to the host. It draws the same table as `Table`, with sortable
 * headers as buttons and `aria-sort` on the sorted one.
 */
function DataTable<T>({
  columns,
  rows,
  getRowId,
  sort,
  defaultSort = null,
  onSortChange,
  selectable = false,
  selected,
  defaultSelected,
  onSelectionChange,
  getRowLabel,
  paginated = false,
  page,
  defaultPage = 1,
  onPageChange,
  perPage,
  defaultPerPage = 10,
  perPageOptions,
  onPerPageChange,
  count,
  total,
  loading = false,
  emptyState,
  stickyHeader = false,
  maxHeight,
  striped = false,
  hoverable = true,
  compact = false,
  labels,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  ...flex
}: DataTableProps<T>) {
  const text = withDefaultLabels<Partial<DataTableLabels>>(DEFAULT_LABELS, labels);
  const server = count !== undefined || total !== undefined;
  const paged = paginated || server;

  const [uncontrolledSort, setUncontrolledSort] = useState<DataTableSort | null>(defaultSort);
  const sortControlled = sort !== undefined;
  const currentSort = (sortControlled ? sort : uncontrolledSort) ?? null;

  const [uncontrolledSelected, setUncontrolledSelected] = useState<string[]>(
    () => defaultSelected ?? [],
  );
  const selectionControlled = selected !== undefined;
  const currentSelected = selectionControlled ? selected : uncontrolledSelected;
  const selectedSet = useMemo(() => new Set(currentSelected), [currentSelected]);

  const [uncontrolledPage, setUncontrolledPage] = useState(defaultPage);
  const [uncontrolledPerPage, setUncontrolledPerPage] = useState(defaultPerPage);
  const pageControlled = page !== undefined;
  const currentPerPage = Math.max(1, Math.floor(perPage ?? uncontrolledPerPage));

  // An id that is missing would be shared by every row missing one, and
  // selecting one of them would select them all: those rows fall back to
  // their index instead.
  const { entries, missingIds, duplicateIds } = useMemo(() => {
    const seen = new Set<string>();
    let missing = 0;
    let duplicates = 0;
    const list = rows.map((row, index): Entry<T> => {
      const raw: unknown = (getRowId ?? defaultRowId)(row, index);
      const valid = (typeof raw === "string" && raw !== "") || typeof raw === "number";
      if (!valid) missing++;
      const id = valid ? String(raw) : String(index);
      if (seen.has(id)) duplicates++;
      seen.add(id);
      return { row, index, id };
    });
    return { entries: list, missingIds: missing, duplicateIds: duplicates };
  }, [rows, getRowId]);

  useEffect(() => {
    if (missingIds > 0) {
      dev.warn(
        `DataTable: getRowId returned no id for ${missingIds} row(s); they fall back to their index.`,
      );
    }
    if (duplicateIds > 0) {
      dev.warn(
        `DataTable: ${duplicateIds} row id(s) repeat; selecting one of those rows selects all of them.`,
      );
    }
  }, [missingIds, duplicateIds]);

  const sortedEntries = useMemo(() => {
    if (server || currentSort === null) return entries;
    const column = columns.find(
      (candidate) => Boolean(candidate.key) && candidate.key === currentSort.key,
    );
    if (!column) return entries;
    const direction = currentSort.direction === "desc" ? -1 : 1;
    const { sort: compareRows, key } = column;
    const compare = compareRows
      ? (a: Entry<T>, b: Entry<T>) => direction * compareRows(a.row, b.row)
      : (a: Entry<T>, b: Entry<T>) => {
          const left = fieldOf(a.row, key);
          const right = fieldOf(b.row, key);
          const leftEmpty = isEmpty(left);
          const rightEmpty = isEmpty(right);
          if (leftEmpty || rightEmpty) return leftEmpty === rightEmpty ? 0 : leftEmpty ? 1 : -1;
          return direction * compareValues(left, right);
        };
    return [...entries].sort(compare);
  }, [entries, columns, currentSort, server]);

  const pages =
    total !== undefined
      ? Math.max(1, Math.floor(total))
      : pageCount(count ?? sortedEntries.length, currentPerPage);
  const currentPage = Math.min(
    pages,
    Math.max(1, Math.floor((pageControlled ? page : uncontrolledPage) || 1)),
  );

  const visible =
    paged && !server
      ? sortedEntries.slice((currentPage - 1) * currentPerPage, currentPage * currentPerPage)
      : sortedEntries;

  const setPage = (next: number) => {
    if (next === currentPage) return;
    if (!pageControlled) setUncontrolledPage(next);
    onPageChange?.(next);
  };

  const setPerPage = (next: number) => {
    if (perPage === undefined) setUncontrolledPerPage(next);
    onPerPageChange?.(next);
  };

  // Ascending, then descending, then back to the rows' own order. A new
  // order starts again from the first page.
  const cycleSort = (key: string) => {
    const next: DataTableSort | null =
      currentSort === null || currentSort.key !== key
        ? { key, direction: "asc" }
        : currentSort.direction === "asc"
          ? { key, direction: "desc" }
          : null;
    if (!sortControlled) setUncontrolledSort(next);
    onSortChange?.(next);
    if (paged) setPage(1);
  };

  const commitSelection = (next: string[]) => {
    if (!selectionControlled) setUncontrolledSelected(next);
    onSelectionChange?.(next);
  };

  const toggleRow = (id: string) =>
    commitSelection(
      selectedSet.has(id)
        ? currentSelected.filter((candidate) => candidate !== id)
        : [...currentSelected, id],
    );

  // Select-all covers the rows on screen: the current page, or every row
  // when the table is not paginated.
  const visibleIds = loading ? [] : visible.map((entry) => entry.id);
  const selectedOnScreen = visibleIds.filter((id) => selectedSet.has(id)).length;
  const allSelected = visibleIds.length > 0 && selectedOnScreen === visibleIds.length;
  const someSelected = selectedOnScreen > 0 && !allSelected;

  const toggleAll = () => {
    if (allSelected) {
      const onScreen = new Set(visibleIds);
      commitSelection(currentSelected.filter((id) => !onScreen.has(id)));
    } else {
      commitSelection([...currentSelected, ...visibleIds.filter((id) => !selectedSet.has(id))]);
    }
  };

  const columnCount = columns.length + (selectable ? 1 : 0);
  const rowTotal = server ? (count ?? (total ?? 0) * currentPerPage) : sortedEntries.length;
  const showPagination = paged && rowTotal > 0 && (pages > 1 || (perPageOptions?.length ?? 0) > 0);

  const renderHeader = (column: DataTableColumn<T>, index: number) => {
    const sortable = Boolean(column.sortable && column.key);
    // A column without a key is never the sorted one, even before anything is sorted.
    const active = currentSort !== null && Boolean(column.key) && currentSort.key === column.key;
    const direction = active ? currentSort?.direction : undefined;
    const align = ALIGN[column.align ?? "left"];

    const content = (
      <Row gap="8" vertical="center" horizontal={align.row}>
        <Text variant="label-strong-s" onBackground={active ? "neutral-strong" : "neutral-medium"}>
          {column.header}
        </Text>
        {sortable && (
          <Icon
            name={direction === "desc" ? "chevronDown" : "chevronUp"}
            size="xs"
            onBackground={active ? "neutral-strong" : "neutral-weak"}
            style={{ transform: active ? undefined : "rotate(90deg)" }}
          />
        )}
      </Row>
    );

    return (
      <th
        key={column.key || index}
        scope="col"
        className={classNames(tableStyles.th, align.th, {
          [tableStyles.thSortable]: sortable,
          [tableStyles.thActive]: active,
          [styles.sortableTh]: sortable,
        })}
        style={{ width: column.width }}
        aria-sort={active ? (direction === "asc" ? "ascending" : "descending") : undefined}
      >
        {sortable ? (
          <button
            type="button"
            className={classNames(
              "reset-button-styles",
              "focus-ring",
              tableStyles.thButton,
              styles.sortButton,
            )}
            disabled={loading}
            onClick={() => cycleSort(column.key)}
          >
            {content}
          </button>
        ) : (
          content
        )}
      </th>
    );
  };

  const renderRow = (entry: Entry<T>) => {
    const isSelected = selectable && selectedSet.has(entry.id);
    return (
      <tr
        key={entry.id}
        className={classNames(tableStyles.row, { [styles.selectedRow]: isSelected })}
        data-selected={isSelected ? "true" : undefined}
      >
        {selectable && (
          <td className={classNames(tableStyles.td, styles.selectCell)}>
            <Checkbox
              aria-label={getRowLabel ? getRowLabel(entry.row) : text.selectRow}
              checked={isSelected}
              onCheckedChange={() => toggleRow(entry.id)}
            />
          </td>
        )}
        {columns.map((column, columnIndex) => (
          <td
            key={column.key || columnIndex}
            className={classNames(tableStyles.td, ALIGN[column.align ?? "left"].td)}
          >
            {column.cell
              ? column.cell(entry.row, entry.index)
              : renderField(fieldOf(entry.row, column.key))}
          </td>
        ))}
      </tr>
    );
  };

  // Placeholders with nothing to read: the table says it is busy, and the
  // rows stay out of the accessibility tree rather than reading as empty.
  const skeletonRows = Array.from({ length: paged ? currentPerPage : 5 }, (_, n) => n).map(
    (rowNumber) => (
      // biome-ignore lint/a11y/noAriaHiddenOnFocusable: a table row is not focusable, and these hold no controls
      <tr key={`skeleton-${rowNumber}`} className={tableStyles.row} aria-hidden="true">
        {selectable && <td className={classNames(tableStyles.td, styles.selectCell)} />}
        {columns.map((column, columnIndex) => (
          <td
            key={column.key || columnIndex}
            className={classNames(tableStyles.td, ALIGN[column.align ?? "left"].td)}
          >
            <Skeleton
              shape="line"
              size="s"
              width={SKELETON_WIDTHS[(rowNumber + columnIndex) % SKELETON_WIDTHS.length]}
              maxWidth="100%"
              delay={rowNumber * 80}
            />
          </td>
        ))}
      </tr>
    ),
  );

  const emptyRow = (
    <tr>
      <td colSpan={columnCount} className={tableStyles.empty}>
        {emptyState ?? (
          <Column center padding="xl" gap="m">
            <Icon name="inbox" size="l" onBackground="neutral-weak" />
            <Column center gap="4">
              <Text variant="heading-strong-s">No data available</Text>
              <Text variant="body-default-s" onBackground="neutral-weak">
                There are no items to display
              </Text>
            </Column>
          </Column>
        )}
      </td>
    </tr>
  );

  return (
    <Column fillWidth gap="m" {...flex}>
      <Flex
        fillWidth
        radius="l"
        border="neutral-alpha-medium"
        background="surface"
        overflowX="auto"
        overflowY={maxHeight !== undefined ? "auto" : "visible"}
        maxHeight={maxHeight}
        className={tableStyles.container}
      >
        <table
          className={classNames(tableStyles.table, {
            [tableStyles.striped]: striped,
            [tableStyles.hoverable]: hoverable,
            [tableStyles.compact]: compact,
            [tableStyles.stickyHeader]: stickyHeader,
          })}
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy}
          aria-busy={loading || undefined}
        >
          <thead className={tableStyles.thead}>
            <tr>
              {selectable && (
                <th scope="col" className={classNames(tableStyles.th, styles.selectCell)}>
                  <Checkbox
                    aria-label={
                      text.selectAll ?? (paged ? "Select all rows on this page" : "Select all rows")
                    }
                    checked={allSelected}
                    indeterminate={someSelected}
                    disabled={visibleIds.length === 0}
                    onCheckedChange={toggleAll}
                  />
                </th>
              )}
              {columns.map(renderHeader)}
            </tr>
          </thead>
          <tbody className={tableStyles.tbody}>
            {loading ? skeletonRows : visible.length === 0 ? emptyRow : visible.map(renderRow)}
          </tbody>
        </table>
      </Flex>

      {showPagination && (
        <Pagination
          fillWidth
          paddingX="s"
          horizontal={perPageOptions?.length ? "between" : "end"}
          size="s"
          aria-label={text.pagination}
          labels={{
            previous: text.previous,
            next: text.next,
            first: text.first,
            last: text.last,
            perPage: text.perPage,
          }}
          page={currentPage}
          onPageChange={setPage}
          count={server ? count : sortedEntries.length}
          total={server ? total : undefined}
          perPage={currentPerPage}
          perPageOptions={perPageOptions}
          onPerPageChange={setPerPage}
          disabled={loading}
        />
      )}
    </Column>
  );
}

DataTable.displayName = "DataTable";

export type { DataTableColumn, DataTableLabels, DataTableProps, DataTableSort };
export { DataTable };
