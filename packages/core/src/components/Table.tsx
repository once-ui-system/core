"use client";

import { cva } from "class-variance-authority";
import type { ChangeEvent, CSSProperties, MouseEvent, ReactNode } from "react";
import { forwardRef, useEffect, useMemo, useState } from "react";
import { cn } from "../classes/utils";
import type { IconName } from "../icons";
import { Button } from "./Button";
import { Column, type ColumnProps } from "./Column";
import { Flex } from "./Flex";
import { Icon } from "./Icon";
import { IconButton } from "./IconButton";
import { Input } from "./Input";
import { Row } from "./Row";
import { Select } from "./Select";
import { ShineFx } from "./ShineFx";
import { Text } from "./Text";

export const tableVariants = cva("w-full border-separate border-spacing-0 table-auto", {
  variants: {
    striped: {
      true: "[&>tbody>tr:nth-child(odd)]:bg-neutral-alpha-weak",
      false: "",
    },
    hoverable: {
      true: "[&>tbody>tr:hover]:bg-neutral-alpha-weak",
      false: "",
    },
    clickable: {
      true: "[&_.table-row]:cursor-pointer [&_.table-row:hover]:bg-neutral-alpha-medium",
      false: "",
    },
    compact: {
      true: "[&>thead>tr>th]:py-8 [&>thead>tr>th]:px-12 [&>tbody>tr>td]:py-8 [&>tbody>tr>td]:px-12",
      false:
        "[&>thead>tr>th]:py-12 [&>thead>tr>th]:px-16 [&>tbody>tr>td]:py-12 [&>tbody>tr>td]:px-16",
    },
    stickyHeader: {
      true: "[&>thead]:sticky [&>thead]:top-0 [&>thead]:z-10 [&>thead>tr>th]:bg-surface",
      false: "",
    },
  },
  defaultVariants: {
    striped: false,
    hoverable: true,
    clickable: false,
    compact: false,
    stickyHeader: false,
  },
});

export const tableContainerVariants = cva(
  "[&::-webkit-scrollbar]:w-8 [&::-webkit-scrollbar]:h-8 [&::-webkit-scrollbar-track]:bg-neutral-alpha-weak [&::-webkit-scrollbar-track]:rounded-s [&::-webkit-scrollbar-thumb]:bg-neutral-alpha-medium [&::-webkit-scrollbar-thumb]:rounded-s hover:[&::-webkit-scrollbar-thumb]:bg-neutral-alpha-strong",
);

export const tableHeaderCellVariants = cva(
  "select-none transition-colors duration-micro-medium border-b border-solid border-neutral-border-medium bg-surface whitespace-nowrap",
  {
    variants: {
      sortable: {
        true: "cursor-pointer hover:bg-neutral-alpha-weak",
        false: "",
      },
      active: {
        true: "bg-neutral-alpha-weak",
        false: "",
      },
      align: {
        left: "text-left",
        center: "text-center",
        right: "text-right",
      },
      actions: {
        true: "whitespace-nowrap max-s:sticky max-s:right-0 max-s:bg-surface",
        false: "",
      },
    },
    defaultVariants: {
      sortable: false,
      active: false,
      align: "left",
      actions: false,
    },
  },
);

export const tableCellVariants = cva(
  "transition-colors duration-micro-medium border-b border-solid border-neutral-border-weak align-middle whitespace-nowrap overflow-hidden text-ellipsis",
  {
    variants: {
      align: {
        left: "text-left",
        center: "text-center",
        right: "text-right",
      },
      actions: {
        true: "whitespace-nowrap align-middle max-s:sticky max-s:right-0 max-s:bg-surface",
        false: "",
      },
    },
    defaultVariants: {
      align: "left",
      actions: false,
    },
  },
);

export const tableRowVariants = cva("table-row transition-colors duration-micro-medium");

export type TableHeader = {
  content: ReactNode;
  key: string;
  sortable?: boolean;
  width?: string;
  align?: "left" | "center" | "right";
};

export type TableAction = {
  icon: IconName | string;
  label?: string;
  tooltip?: string;
  variant?: "primary" | "secondary" | "tertiary" | "danger";
  onClick: (rowIndex: number) => void;
  disabled?: (rowIndex: number) => boolean;
};

export interface TableProps extends Omit<ColumnProps, "maxHeight"> {
  data: {
    headers: TableHeader[];
    rows: ReactNode[][];
  };
  onRowClick?: (rowIndex: number) => void;
  searchable?: boolean;
  searchPlaceholder?: string;
  striped?: boolean;
  hoverable?: boolean;
  compact?: boolean;
  loading?: boolean;
  emptyState?: ReactNode;
  actions?: TableAction[];
  stickyHeader?: boolean;
  maxHeight?: string;
  rowClassName?: (rowIndex: number) => string;
  cellClassName?: (rowIndex: number, cellIndex: number) => string;
  paginated?: boolean;
  defaultPageSize?: number;
  pageSizeOptions?: number[];
  loadingState?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

function extractText(node: ReactNode): string {
  if (node == null) return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(extractText).join(" ");
  if (typeof node === "object" && "props" in node) {
    return extractText((node as { props?: { children?: ReactNode } }).props?.children);
  }
  return "";
}

const Table = forwardRef<HTMLDivElement, TableProps>(
  (
    {
      data,
      onRowClick,
      searchable = false,
      searchPlaceholder = "Search...",
      striped = false,
      hoverable = true,
      compact = false,
      loading = false,
      emptyState,
      actions,
      stickyHeader = false,
      maxHeight,
      rowClassName,
      cellClassName,
      paginated = false,
      defaultPageSize = 10,
      pageSizeOptions = [5, 10, 20, 50],
      loadingState,
      className,
      style,
      ...flex
    },
    ref,
  ) => {
    const [sortConfig, setSortConfig] = useState<{
      key: string;
      direction: "asc" | "desc";
    } | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(defaultPageSize);

    const handleSort = (key: string, sortable?: boolean) => {
      if (!sortable) return;

      let direction: "asc" | "desc" = "asc";
      if (sortConfig && sortConfig.key === key) {
        direction = sortConfig.direction === "asc" ? "desc" : "asc";
      }
      setSortConfig({ key, direction });
      setPage(1);
    };

    const filteredRows = useMemo(() => {
      if (!searchable || !searchQuery.trim()) return data.rows;

      const query = searchQuery.toLowerCase();
      return data.rows.filter((row) =>
        row.some((cell) => extractText(cell).toLowerCase().includes(query)),
      );
    }, [data.rows, searchQuery, searchable]);

    const sortedRows = useMemo(() => {
      if (!sortConfig) return filteredRows;

      const headerIndex = data.headers.findIndex((h) => h.key === sortConfig.key);
      if (headerIndex === -1) return filteredRows;

      return [...filteredRows].sort((a, b) => {
        const aValue = extractText(a[headerIndex]);
        const bValue = extractText(b[headerIndex]);

        const comparison = aValue.localeCompare(bValue, undefined, {
          numeric: true,
          sensitivity: "base",
        });

        return sortConfig.direction === "asc" ? comparison : -comparison;
      });
    }, [filteredRows, sortConfig, data.headers]);

    const paginatedRows = useMemo(() => {
      if (!paginated) return sortedRows;

      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      return sortedRows.slice(start, end);
    }, [sortedRows, paginated, page, pageSize]);

    const totalPages = Math.max(1, Math.ceil(sortedRows.length / pageSize));
    const currentPage = Math.min(page, totalPages);

    // biome-ignore lint/correctness/useExhaustiveDependencies: Reset page to 1 when search or sorting changes
    useEffect(() => {
      setPage(1);
    }, [searchQuery, sortConfig]);

    const tableClasses = cn(
      tableVariants({
        striped,
        hoverable,
        compact,
        clickable: Boolean(onRowClick),
        stickyHeader,
      }),
    );

    const renderHeader = (header: TableHeader) => {
      const isActive = sortConfig?.key === header.key;
      const thClasses = cn(
        tableHeaderCellVariants({
          sortable: header.sortable,
          active: isActive,
          align: header.align || "left",
        }),
      );

      return (
        <th
          key={header.key}
          className={thClasses}
          style={{ width: header.width }}
          onClick={() => handleSort(header.key, header.sortable)}
        >
          <Row
            gap="8"
            vertical="center"
            horizontal={
              header.align === "center" ? "center" : header.align === "right" ? "end" : "start"
            }
          >
            <Text
              variant="label-strong-s"
              onBackground={isActive ? "neutral-strong" : "neutral-medium"}
            >
              {header.content}
            </Text>
            {header.sortable && (
              <Icon
                name={
                  isActive
                    ? sortConfig.direction === "asc"
                      ? "chevronUp"
                      : "chevronDown"
                    : "chevronUp"
                }
                size="xs"
                onBackground={isActive ? "neutral-strong" : "neutral-weak"}
                className={cn(!isActive && "rotate-90")}
              />
            )}
          </Row>
        </th>
      );
    };

    const renderRow = (row: ReactNode[], originalIndex: number, displayIndex: number) => {
      const rowClasses = cn(tableRowVariants(), rowClassName?.(originalIndex));

      return (
        <tr
          key={displayIndex}
          className={rowClasses}
          onClick={onRowClick ? () => onRowClick(originalIndex) : undefined}
        >
          {row.map((cell, cellIndex) => {
            const header = data.headers[cellIndex];
            const tdClasses = cn(
              tableCellVariants({
                align: header?.align || "left",
              }),
              cellClassName?.(originalIndex, cellIndex),
            );

            return (
              // biome-ignore lint/suspicious/noArrayIndexKey: Table cell ordering is positional
              <td key={cellIndex} className={tdClasses}>
                {cell}
              </td>
            );
          })}
          {actions && actions.length > 0 && (
            <td
              className={tableCellVariants({ actions: true })}
              style={{ width: `${actions.length * 32}px`, minWidth: `${actions.length * 32}px` }}
            >
              <Row
                gap="8"
                horizontal="start"
                vertical="center"
                onClick={(e) => e.stopPropagation()}
              >
                {actions.map((action, actionIndex) => (
                  <IconButton
                    // biome-ignore lint/suspicious/noArrayIndexKey: Action items are static positional elements
                    key={actionIndex}
                    icon={action.icon as IconName}
                    size="l"
                    variant={action.variant || "tertiary"}
                    tooltip={action.tooltip || action.label}
                    onClick={(e: MouseEvent<HTMLButtonElement>) => {
                      e.stopPropagation();
                      action.onClick(originalIndex);
                    }}
                    disabled={action.disabled?.(originalIndex)}
                  />
                ))}
              </Row>
            </td>
          )}
        </tr>
      );
    };

    const renderEmptyState = () => (
      <tr>
        <td colSpan={data.headers.length + (actions?.length ? 1 : 0)} className="p-0 border-none">
          {emptyState || (
            <Column center padding="xl" gap="m">
              <Icon name="inbox" size="l" onBackground="neutral-weak" />
              <Column center gap="4">
                <Text variant="heading-strong-s">No data available</Text>
                <Text variant="body-default-s" onBackground="neutral-weak">
                  {searchQuery ? "Try adjusting your search" : "There are no items to display"}
                </Text>
              </Column>
            </Column>
          )}
        </td>
      </tr>
    );

    const renderLoadingState = () => (
      <tr>
        <td colSpan={data.headers.length + (actions?.length ? 1 : 0)} className="p-0 border-none">
          {loadingState || (
            <Column center padding="xl" gap="m">
              <ShineFx variant="label-default-s">Loading data...</ShineFx>
            </Column>
          )}
        </td>
      </tr>
    );

    return (
      <Column ref={ref} fillWidth gap="m" className={className} style={style} {...flex}>
        {/* Search Bar */}
        {searchable && (
          <Row horizontal="between" vertical="center" gap="m" maxWidth={12}>
            <Input
              id="table-search"
              placeholder={searchPlaceholder}
              value={searchQuery}
              height="xs"
              onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            />
            {sortedRows.length !== data.rows.length && (
              <Text onBackground="neutral-weak">
                {sortedRows.length} of {data.rows.length}
              </Text>
            )}
          </Row>
        )}

        {/* Table Container */}
        <Flex
          fillWidth
          radius="l"
          border="neutral-alpha-medium"
          background="surface"
          overflowX="auto"
          overflowY={maxHeight ? "auto" : "visible"}
          style={{ maxHeight }}
          className={tableContainerVariants()}
        >
          <table className={tableClasses}>
            <thead>
              <tr>
                {data.headers.map((header) => renderHeader(header))}
                {actions && actions.length > 0 && (
                  <th className={tableHeaderCellVariants({ actions: true })}>
                    <Text variant="label-strong-s" onBackground="neutral-medium">
                      Actions
                    </Text>
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="[&>tr:last-child>td]:border-b-0">
              {loading
                ? renderLoadingState()
                : sortedRows.length === 0
                  ? renderEmptyState()
                  : paginatedRows.map((row, index) => {
                      const originalIndex = data.rows.indexOf(row);
                      return renderRow(row, originalIndex, index);
                    })}
            </tbody>
          </table>
        </Flex>

        {/* Pagination */}
        {paginated && !loading && sortedRows.length > 0 && (
          <Row horizontal="between" vertical="center" paddingX="s" gap="m" wrap>
            <Row gap="8" vertical="center">
              <Row maxWidth={2}>
                <Select
                  id="page-size"
                  placeholder="Select page size"
                  value={String(pageSize)}
                  height="xs"
                  onSelect={(value) => {
                    setPageSize(Number(value));
                    setPage(1);
                  }}
                  options={pageSizeOptions.map((size) => ({
                    label: String(size),
                    value: String(size),
                  }))}
                />
              </Row>
              <Text variant="label-default-s" onBackground="neutral-medium">
                {currentPage} / {totalPages}
              </Text>
            </Row>

            {totalPages > 1 && (
              <Row gap="4" vertical="center">
                <IconButton
                  size="s"
                  variant="secondary"
                  icon="chevronDoubleLeft"
                  onClick={() => setPage(1)}
                  disabled={currentPage === 1}
                />
                <IconButton
                  size="s"
                  variant="secondary"
                  icon="chevronLeft"
                  onClick={() => setPage(currentPage - 1)}
                  disabled={currentPage === 1}
                />

                {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <Button
                      key={pageNum}
                      size="s"
                      variant={pageNum === currentPage ? "primary" : "tertiary"}
                      onClick={() => setPage(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}

                <IconButton
                  size="s"
                  variant="secondary"
                  icon="chevronRight"
                  onClick={() => setPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                />
                <IconButton
                  icon="chevronDoubleRight"
                  size="s"
                  variant="secondary"
                  onClick={() => setPage(totalPages)}
                  disabled={currentPage === totalPages}
                />
              </Row>
            )}
          </Row>
        )}

        {/* Footer Info */}
        {!paginated && !loading && sortedRows.length > 0 && sortConfig && (
          <Row horizontal="end" vertical="center" paddingX="s">
            <Row gap="4" vertical="center">
              <Text variant="body-default-s" onBackground="neutral-weak">
                Sorted by {data.headers.find((h) => h.key === sortConfig.key)?.content}
              </Text>
              <IconButton
                icon="close"
                size="s"
                variant="tertiary"
                onClick={() => setSortConfig(null)}
                tooltip="Clear sort"
              />
            </Row>
          </Row>
        )}
      </Column>
    );
  },
);

Table.displayName = "Table";

export { Table };
