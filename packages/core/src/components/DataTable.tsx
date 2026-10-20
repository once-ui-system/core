"use client";

import classNames from "clsx";
import type React from "react";
import { isValidElement, type ReactNode, useEffect, useId, useMemo, useRef, useState } from "react";
import { type ColumnHide, columnHideClasses } from "../internal/columnHide";
import { pageCount, withDefaultLabels } from "../internal/pagination";
import { useScrollableTabStop } from "../internal/scrollableTabStop";
import { dev } from "../utils/devLogger";
import { Button } from "./Button";
import { Checkbox } from "./Checkbox";
import { Column } from "./Column";
import styles from "./DataTable.module.scss";
import { DropdownWrapper } from "./DropdownWrapper";
import { Flex } from "./Flex";
import { Icon } from "./Icon";
import { Input } from "./Input";
import { Pagination, type PaginationLabels } from "./Pagination";
import { Row } from "./Row";
import { Select } from "./Select";
import { Skeleton } from "./Skeleton";
import tableStyles from "./Table.module.scss";
import { Text } from "./Text";
import { VisuallyHidden } from "./VisuallyHidden";

/** A filter's value: one option's value, or several for a `multiple` filter. */
type DataTableFilterValue = string | string[];

/** The active filters, by column `key`. A column without an entry is unfiltered. */
type DataTableFilters = Record<string, DataTableFilterValue>;

interface DataTableColumnFilter<T> {
  /** The values to filter by, offered in a select in the toolbar. */
  options: { value: string; label: ReactNode }[];
  /** Let the reader pick several values; a row then matches any of them. */
  multiple?: boolean;
  /**
   * Whether a row passes the filter. Without it a row passes when `row[key]`
   * is the value (or one of them), or, for an array field, contains it.
   */
  match?: (row: T, value: DataTableFilterValue) => boolean;
}

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
  /**
   * The column's name in plain text, for its filter and the columns menu.
   * Defaults to `header` when that is text, and to `key` otherwise.
   */
  label?: string;
  /** Add a select to the toolbar that filters the rows by this column. */
  filter?: DataTableColumnFilter<T>;
  /**
   * Hide the column at a breakpoint and below, such as `{ s: true }`. CSS
   * only, so it holds in the server render; `false` shows it again under a
   * wider breakpoint's hide.
   */
  hide?: ColumnHide;
}

interface DataTableSort {
  /** The `key` of the sorted column. */
  key: string;
  direction: "asc" | "desc";
}

/** Everything a server needs to fetch the rows on screen, as `onQueryChange` reports it. */
interface DataTableQuery {
  page: number;
  perPage: number;
  sort: DataTableSort | null;
  /** The search text as typed; trim it before querying. */
  search: string;
  filters: DataTableFilters;
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
  /** The search field's name and placeholder. Defaults to "Search". */
  search?: string;
  /** The filter option that clears a filter. Defaults to "All". */
  filterAll?: string;
  /** The columns menu's button. Defaults to "Columns". */
  columns?: string;
  /** The heading of the empty state when a search or filter matches nothing. */
  noResults?: string;
  /** The line under that heading. */
  noResultsHint?: string;
  /** The button in that state which clears the search and the filters. */
  clearFilters?: string;
  /** What a screen reader hears after the search or a filter changes. */
  results?: (count: number) => string;
}

const DEFAULT_LABELS: Pick<
  DataTableLabels,
  | "selectRow"
  | "pagination"
  | "perPage"
  | "search"
  | "filterAll"
  | "columns"
  | "noResults"
  | "noResultsHint"
  | "clearFilters"
  | "results"
> = {
  selectRow: "Select row",
  pagination: "Pagination",
  perPage: "Rows per page",
  search: "Search",
  filterAll: "All",
  columns: "Columns",
  noResults: "No results",
  noResultsHint: "Try a different search or filter",
  clearFilters: "Clear filters",
  results: (count) => (count === 1 ? "1 result" : `${count} results`),
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
   * only the current page: DataTable then neither sorts, filters nor slices
   * the rows itself, and reports page, sort, search and filter changes for
   * the host to fetch.
   */
  count?: number;
  /** The number of pages on the server, when it reports pages rather than rows. As `count`. */
  total?: number;

  /**
   * Add a search field to the toolbar above the table. DataTable filters the
   * rows by it, or with `count` or `total` reports it for the server.
   */
  searchable?: boolean;
  /** The search text, when the host owns it. */
  search?: string;
  /** The search text to start with when DataTable owns it. */
  defaultSearch?: string;
  /** Called with the search text on each change. */
  onSearchChange?: (search: string) => void;
  /**
   * Whether a row matches the search, given the trimmed, lowercased query.
   * Without it a row matches when any column's `row[key]` contains the query.
   */
  matchSearch?: (row: T, query: string) => boolean;

  /** The active filters by column key, when the host owns them. */
  filters?: DataTableFilters;
  /** The filters to start with when DataTable owns them. */
  defaultFilters?: DataTableFilters;
  /** Called with every active filter after each change. */
  onFiltersChange?: (filters: DataTableFilters) => void;

  /**
   * Which columns show, by key, when the host owns it: `false` hides that
   * column. A column not listed shows.
   */
  columnVisibility?: Record<string, boolean>;
  /** The column visibility to start with when DataTable owns it. */
  defaultColumnVisibility?: Record<string, boolean>;
  /** Called with the new column visibility. */
  onColumnVisibilityChange?: (visibility: Record<string, boolean>) => void;
  /** Add a menu to the toolbar that shows and hides columns. */
  columnsMenu?: boolean;
  /** Your own controls, at the end of the toolbar: an export button, say. */
  toolbar?: ReactNode;

  /**
   * Called once for each change of the page, page size, sort, search or
   * filters, with all five: the one handler a server-side table needs.
   */
  onQueryChange?: (query: DataTableQuery) => void;

  /** Swap the rows for skeleton rows, and disable the controls, while data loads. */
  loading?: boolean;
  /**
   * While `loading`, keep the rows on screen, dimmed, instead of skeleton
   * rows, so a server table does not jump on each page or search. Skeleton
   * rows still stand in while there are no rows yet.
   */
  keepRowsWhileLoading?: boolean;
  /** What to show when there are no rows. */
  emptyState?: ReactNode;
  /**
   * What to show when the search or the filters match no rows. By default a
   * "No results" state with a button that clears them.
   */
  noResultsState?: ReactNode;

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
  /** The names of the controls and the states, to translate them. */
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

/** A field as text to search: "" for what has none to read, such as a React element. */
function fieldText(value: unknown): string {
  if (value === null || value === undefined || isValidElement(value)) return "";
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? "" : value.toISOString().slice(0, 10);
  }
  if (Array.isArray(value)) return value.map(fieldText).join(" ");
  if (typeof value === "object") return "";
  return String(value);
}

/** A filter's values as a list, leaving out empty ones. */
const filterValues = (value: DataTableFilterValue | undefined): string[] =>
  (Array.isArray(value) ? value : value === undefined ? [] : [value]).filter(
    (candidate) => candidate !== "",
  );

/** Whether `row[key]` is one of `values`, or for an array field holds one. */
function fieldMatches(field: unknown, values: string[]): boolean {
  const candidates = Array.isArray(field) ? field : [field];
  return candidates.some((candidate) => values.includes(fieldText(candidate)));
}

const columnName = <T,>(column: DataTableColumn<T>) =>
  column.label ??
  (typeof column.header === "string" || typeof column.header === "number"
    ? String(column.header)
    : column.key);

/** The option a filter select clears itself with; never a value of its own. */
const CLEAR_FILTER = "__once-ui-filter-all__";

const ALIGN = {
  left: { th: tableStyles.thAlignLeft, td: tableStyles.tdAlignLeft, row: "start" },
  center: { th: tableStyles.thAlignCenter, td: tableStyles.tdAlignCenter, row: "center" },
  right: { th: tableStyles.thAlignRight, td: tableStyles.tdAlignRight, row: "end" },
} as const;

const SKELETON_WIDTHS = [8, 6, 10, 5, 7];

/**
 * A table of typed rows: column definitions instead of pre-rendered cells,
 * sorting, search and filters, row selection, pagination, column visibility,
 * and empty and loading states.
 *
 * Sorting, search, filters, selection and the page each work on DataTable's
 * own state or the host's (`sort`, `search`, `filters`, `selected`, `page`
 * with their change handlers). With `count` or `total` the rows are one
 * server page, and DataTable leaves sorting, filtering and slicing to the
 * host. It draws the same table as `Table`, with sortable headers as buttons
 * and `aria-sort` on the sorted one.
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
  searchable = false,
  search,
  defaultSearch = "",
  onSearchChange,
  matchSearch,
  filters,
  defaultFilters,
  onFiltersChange,
  columnVisibility,
  defaultColumnVisibility,
  onColumnVisibilityChange,
  columnsMenu = false,
  toolbar,
  onQueryChange,
  loading = false,
  keepRowsWhileLoading = false,
  emptyState,
  noResultsState,
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
  const controlsId = useId();

  const [uncontrolledSort, setUncontrolledSort] = useState<DataTableSort | null>(defaultSort);
  const sortControlled = sort !== undefined;
  const currentSort = (sortControlled ? sort : uncontrolledSort) ?? null;

  const [uncontrolledSearch, setUncontrolledSearch] = useState(defaultSearch);
  const currentSearch = search ?? uncontrolledSearch;
  const query = currentSearch.trim().toLowerCase();

  const [uncontrolledFilters, setUncontrolledFilters] = useState<DataTableFilters>(
    () => defaultFilters ?? {},
  );
  const currentFilters = filters ?? uncontrolledFilters;
  const filterColumns = useMemo(
    () => columns.filter((column) => column.filter && column.key),
    [columns],
  );
  const activeFilters = useMemo(
    () =>
      filterColumns
        .map((column) => ({ column, values: filterValues(currentFilters[column.key]) }))
        .filter(({ values }) => values.length > 0),
    [filterColumns, currentFilters],
  );
  const filtering = query !== "" || activeFilters.length > 0;

  const [uncontrolledVisibility, setUncontrolledVisibility] = useState<Record<string, boolean>>(
    () => defaultColumnVisibility ?? {},
  );
  const currentVisibility = columnVisibility ?? uncontrolledVisibility;
  const shownColumns = columns.filter((column) => currentVisibility[column.key] !== false);

  const [uncontrolledSelected, setUncontrolledSelected] = useState<string[]>(
    () => defaultSelected ?? [],
  );
  const selectionControlled = selected !== undefined;
  const currentSelected = selectionControlled ? selected : uncontrolledSelected;
  const scrollRef = useScrollableTabStop<HTMLDivElement>();
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

  // A server page arrives filtered; on the client the search and every
  // active filter must all pass.
  const filteredEntries = useMemo(() => {
    if (server || (query === "" && activeFilters.length === 0)) return entries;
    return entries.filter(({ row }) => {
      if (query !== "") {
        const found = matchSearch
          ? matchSearch(row, query)
          : columns.some((column) =>
              fieldText(fieldOf(row, column.key)).toLowerCase().includes(query),
            );
        if (!found) return false;
      }
      return activeFilters.every(({ column, values }) => {
        const match = column.filter?.match;
        const value = column.filter?.multiple ? values : values[0];
        return match ? match(row, value) : fieldMatches(fieldOf(row, column.key), values);
      });
    });
  }, [entries, server, query, activeFilters, columns, matchSearch]);

  const sortedEntries = useMemo(() => {
    if (server || currentSort === null) return filteredEntries;
    const column = columns.find(
      (candidate) => Boolean(candidate.key) && candidate.key === currentSort.key,
    );
    if (!column) return filteredEntries;
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
    return [...filteredEntries].sort(compare);
  }, [filteredEntries, columns, currentSort, server]);

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

  const currentQuery: DataTableQuery = {
    page: currentPage,
    perPage: currentPerPage,
    sort: currentSort,
    search: currentSearch,
    filters: currentFilters,
  };
  const reportQuery = (change: Partial<DataTableQuery>) =>
    onQueryChange?.({ ...currentQuery, ...change });

  // Pagination follows a new page size with the page that keeps the first
  // row in view; that page belongs to the same change, reported once.
  const pageFromPerPage = useRef<number | null>(null);

  const setPage = (next: number, report = true) => {
    if (next === currentPage) return;
    if (!pageControlled) setUncontrolledPage(next);
    onPageChange?.(next);
    if (pageFromPerPage.current === next) pageFromPerPage.current = null;
    else if (report) reportQuery({ page: next });
  };

  const setPerPage = (next: number) => {
    if (perPage === undefined) setUncontrolledPerPage(next);
    onPerPageChange?.(next);
    const firstRow = (currentPage - 1) * currentPerPage;
    const nextPages = total !== undefined ? pages : pageCount(count ?? sortedEntries.length, next);
    const nextPage = Math.min(nextPages, Math.max(1, Math.floor(firstRow / next) + 1));
    pageFromPerPage.current = nextPage !== currentPage ? nextPage : null;
    reportQuery({ perPage: next, page: nextPage });
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
    if (paged) setPage(1, false);
    reportQuery({ sort: next, page: paged ? 1 : currentPage });
  };

  // A new search or filter also starts from the first page.
  const commitSearch = (next: string) => {
    if (search === undefined) setUncontrolledSearch(next);
    onSearchChange?.(next);
    if (paged) setPage(1, false);
    reportQuery({ search: next, page: paged ? 1 : currentPage });
  };

  const commitFilters = (next: DataTableFilters) => {
    if (filters === undefined) setUncontrolledFilters(next);
    onFiltersChange?.(next);
    if (paged) setPage(1, false);
    reportQuery({ filters: next, page: paged ? 1 : currentPage });
  };

  const setFilter = (column: DataTableColumn<T>, picked: string | string[]) => {
    const values = (Array.isArray(picked) ? picked : [picked]).filter(
      (value) => value !== "" && value !== CLEAR_FILTER,
    );
    const cleared = !Array.isArray(picked)
      ? picked === CLEAR_FILTER
      : picked.includes(CLEAR_FILTER);
    const next = { ...currentFilters };
    if (cleared || values.length === 0) delete next[column.key];
    else next[column.key] = column.filter?.multiple ? values : values[0];
    commitFilters(next);
  };

  const clearQuery = () => {
    const nextFilters = { ...currentFilters };
    for (const { column } of activeFilters) delete nextFilters[column.key];
    if (search === undefined) setUncontrolledSearch("");
    if (filters === undefined) setUncontrolledFilters(nextFilters);
    if (currentSearch !== "") onSearchChange?.("");
    if (activeFilters.length > 0) onFiltersChange?.(nextFilters);
    if (paged) setPage(1, false);
    reportQuery({ search: "", filters: nextFilters, page: paged ? 1 : currentPage });
  };

  const setColumnShown = (key: string, shown: boolean) => {
    const next = { ...currentVisibility, [key]: shown };
    if (columnVisibility === undefined) setUncontrolledVisibility(next);
    onColumnVisibilityChange?.(next);
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

  const columnCount = shownColumns.length + (selectable ? 1 : 0);
  const rowTotal = server ? (count ?? (total ?? 0) * currentPerPage) : sortedEntries.length;
  const showPagination = paged && rowTotal > 0 && (pages > 1 || (perPageOptions?.length ?? 0) > 0);
  // Rows kept on screen while the next ones load; without rows yet, skeletons.
  const dimmed = loading && keepRowsWhileLoading && visible.length > 0;
  // "No results" is for rows the search or filters left out. On a server
  // page there is no telling, so an empty page under a query counts as one.
  const noResults = filtering && visible.length === 0 && (server || entries.length > 0);
  const hasOwnControls = toolbar !== undefined && toolbar !== null && toolbar !== false;
  const hasToolbar = searchable || filterColumns.length > 0 || columnsMenu || hasOwnControls;

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
        className={classNames(
          tableStyles.th,
          align.th,
          {
            [tableStyles.thSortable]: sortable,
            [tableStyles.thActive]: active,
            [styles.sortableTh]: sortable,
          },
          columnHideClasses(column.hide),
        )}
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

  const cellClass = (column: DataTableColumn<T>) =>
    classNames(tableStyles.td, ALIGN[column.align ?? "left"].td, columnHideClasses(column.hide));

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
              disabled={dimmed || undefined}
              onToggle={() => toggleRow(entry.id)}
            />
          </td>
        )}
        {shownColumns.map((column, columnIndex) => (
          <td key={column.key || columnIndex} className={cellClass(column)}>
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
        {shownColumns.map((column, columnIndex) => (
          <td key={column.key || columnIndex} className={cellClass(column)}>
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
        {noResults
          ? (noResultsState ?? (
              <Column center padding="xl" gap="m">
                <Icon name="search" size="l" onBackground="neutral-weak" />
                <Column center gap="4">
                  <Text variant="heading-strong-s">{text.noResults}</Text>
                  <Text variant="body-default-s" onBackground="neutral-weak">
                    {text.noResultsHint}
                  </Text>
                </Column>
                <Button size="s" variant="secondary" onClick={clearQuery}>
                  {text.clearFilters}
                </Button>
              </Column>
            ))
          : (emptyState ?? (
              <Column center padding="xl" gap="m">
                <Icon name="inbox" size="l" onBackground="neutral-weak" />
                <Column center gap="4">
                  <Text variant="heading-strong-s">No data available</Text>
                  <Text variant="body-default-s" onBackground="neutral-weak">
                    There are no items to display
                  </Text>
                </Column>
              </Column>
            ))}
      </td>
    </tr>
  );

  const renderFilter = (column: DataTableColumn<T>) => {
    const filter = column.filter as DataTableColumnFilter<T>;
    const values = filterValues(currentFilters[column.key]);
    return (
      <Row key={column.key} minWidth={8} maxWidth={12}>
        <Select
          id={`${controlsId}-filter-${column.key}`}
          size="xxs"
          label={columnName(column)}
          multiple={filter.multiple}
          // Unfiltered, the select is empty and shows its label: "Status"
          // reads better than a row of selects that each say "All".
          value={filter.multiple ? values : (values[0] ?? "")}
          onSelect={(picked) => setFilter(column, picked)}
          options={[{ value: CLEAR_FILTER, label: text.filterAll }, ...filter.options]}
        />
      </Row>
    );
  };

  const columnsDropdown = columnsMenu && (
    <DropdownWrapper
      placement="bottom-end"
      closeAfterClick={false}
      handleArrowNavigation={false}
      trigger={
        <Button size="s" variant="secondary" suffixIcon="chevronDown">
          {text.columns}
        </Button>
      }
      dropdown={
        <Column padding="8" gap="4" minWidth={10}>
          {columns.map((column, index) => {
            const shown = currentVisibility[column.key] !== false;
            return (
              <Checkbox
                key={column.key || index}
                label={columnName(column)}
                checked={shown}
                // The last column on screen stays: a table of no columns is no table.
                disabled={shown && shownColumns.length === 1}
                onToggle={() => setColumnShown(column.key, !shown)}
              />
            );
          })}
        </Column>
      }
    />
  );

  return (
    <Column fillWidth gap="m" {...flex}>
      {hasToolbar && (
        <Row fillWidth gap="8" vertical="center" wrap>
          {searchable && (
            <Row flex={1} minWidth={10} maxWidth={16}>
              <Input
                id={`${controlsId}-search`}
                size="xxs"
                label={text.search}
                value={currentSearch}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  commitSearch(event.target.value)
                }
                prefix={<Icon name="search" size="xs" onBackground="neutral-weak" />}
              />
            </Row>
          )}
          {filterColumns.map(renderFilter)}
          {(hasOwnControls || columnsMenu) && (
            <Row gap="8" vertical="center" style={{ marginLeft: "auto" }}>
              {toolbar}
              {columnsDropdown}
            </Row>
          )}
          {/* What the search or filters left, for a screen reader to hear. */}
          <VisuallyHidden role="status">
            {filtering && !loading && text.results ? text.results(rowTotal) : ""}
          </VisuallyHidden>
        </Row>
      )}

      <Flex
        // A table wider than its box scrolls, and a keyboard can only scroll
        // what it can focus: a tab stop while it overflows, as Table has.
        ref={scrollRef}
        fillWidth
        radius="l"
        border="neutral-alpha-medium"
        background="surface"
        overflowX="auto"
        overflowY={maxHeight !== undefined ? "auto" : "visible"}
        maxHeight={maxHeight}
        className={classNames(tableStyles.container, "focus-ring")}
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
                    onToggle={toggleAll}
                  />
                </th>
              )}
              {shownColumns.map(renderHeader)}
            </tr>
          </thead>
          <tbody className={classNames(tableStyles.tbody, { [styles.dimmedBody]: dimmed })}>
            {dimmed
              ? visible.map(renderRow)
              : loading
                ? skeletonRows
                : visible.length === 0
                  ? emptyRow
                  : visible.map(renderRow)}
          </tbody>
        </table>
      </Flex>

      {showPagination && (
        <Pagination
          fillWidth
          paddingX="s"
          horizontal={perPageOptions?.length ? "between" : "end"}
          size="s"
          // Named after the table it pages, so two tables on one page do not
          // give two landmarks the same name (axe: landmark-unique).
          aria-label={
            ariaLabel && text.pagination
              ? `${ariaLabel} ${text.pagination.toLowerCase()}`
              : text.pagination
          }
          labels={{
            previous: text.previous,
            next: text.next,
            first: text.first,
            last: text.last,
            perPage: text.perPage,
          }}
          page={currentPage}
          onChange={setPage}
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

export type {
  DataTableColumn,
  DataTableColumnFilter,
  DataTableFilters,
  DataTableFilterValue,
  DataTableLabels,
  DataTableProps,
  DataTableQuery,
  DataTableSort,
};
export { DataTable };
