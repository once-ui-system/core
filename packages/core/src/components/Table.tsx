"use client";

import {Flex, Row, Column, Icon, Text, IconButton, Input, Spinner, Tag, Select, Button} from ".";
import { useState, useMemo, ReactNode } from "react";
import styles from "./Table.module.scss";
import classNames from "classnames";

type TableHeader = {
  content: ReactNode;
  key: string;
  sortable?: boolean;
  width?: string;
  align?: "left" | "center" | "right";
};

type TableAction = {
  icon: string;
  label?: string;
  tooltip?: string;
  variant?: "primary" | "secondary" | "tertiary" | "danger";
  onClick: (rowIndex: number) => void;
  disabled?: (rowIndex: number) => boolean;
};

type TableProps = React.ComponentProps<typeof Flex> & {
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
};

function extractText(node: ReactNode): string {
  if (node == null) return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(extractText).join(" ");
  if (typeof node === "object" && "props" in node) {
    return extractText((node as any).props?.children);
  }
  return "";
}

function Table({ 
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
  ...flex 
}: TableProps) {
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
  };

  const filteredRows = useMemo(() => {
    if (!searchable || !searchQuery.trim()) return data.rows;
    
    const query = searchQuery.toLowerCase();
    return data.rows.filter(row => 
      row.some(cell => extractText(cell).toLowerCase().includes(query))
    );
  }, [data.rows, searchQuery, searchable]);

  const sortedRows = useMemo(() => {
    if (!sortConfig) return filteredRows;

    const headerIndex = data.headers.findIndex(h => h.key === sortConfig.key);
    if (headerIndex === -1) return filteredRows;

    return [...filteredRows].sort((a, b) => {
      const aValue = extractText(a[headerIndex]);
      const bValue = extractText(b[headerIndex]);
      
      const comparison = aValue.localeCompare(bValue, undefined, { 
        numeric: true, 
        sensitivity: "base" 
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

  useMemo(() => {
    setPage(1);
  }, [searchQuery, sortConfig]);

  const tableClasses = classNames(
    styles.table,
    {
      [styles["table--striped"]]: striped,
      [styles["table--hoverable"]]: hoverable,
      [styles["table--compact"]]: compact,
      [styles["table--clickable"]]: !!onRowClick,
      [styles["table--sticky-header"]]: stickyHeader,
    }
  );

  const renderHeader = (header: TableHeader, index: number) => {
    const isActive = sortConfig?.key === header.key;
    const thClasses = classNames(
      styles.table__th,
      {
        [styles["table__th--sortable"]]: header.sortable,
        [styles["table__th--active"]]: isActive,
        [styles[`table__th--align-${header.align || "left"}`]]: true,
      }
    );

    return (
      <th
        key={header.key}
        className={thClasses}
        style={{ width: header.width }}
        onClick={() => handleSort(header.key, header.sortable)}
      >
        <Row gap="8" vertical="center" horizontal={header.align === "center" ? "center" : header.align === "right" ? "end" : "start"}>
          <Text variant="label-strong-s" onBackground={isActive ? "neutral-strong" : "neutral-medium"}>
            {header.content}
          </Text>
          {header.sortable && (
            <Icon
              name={isActive 
                ? sortConfig.direction === "asc" ? "chevronUp" : "chevronDown"
                : "chevronUp"
              }
              size="xs"
              onBackground={isActive ? "neutral-strong" : "neutral-weak"}
              style={{
                transform: !isActive ? "rotate(90deg)" : undefined,
                transition: "all 0.2s ease",
              }}
            />
          )}
        </Row>
      </th>
    );
  };

  const renderRow = (row: ReactNode[], originalIndex: number, displayIndex: number) => {
    const rowClasses = classNames(
      styles.table__row,
      rowClassName?.(originalIndex)
    );

    return (
      <tr
        key={displayIndex}
        className={rowClasses}
        onClick={onRowClick ? () => onRowClick(originalIndex) : undefined}
      >
        {row.map((cell, cellIndex) => {
          const header = data.headers[cellIndex];
          const tdClasses = classNames(
            styles.table__td,
            styles[`table__td--align-${header?.align || "left"}`],
            cellClassName?.(originalIndex, cellIndex)
          );

          return (
            <td key={cellIndex} className={tdClasses}>
              {cell}
            </td>
          );
        })}
        {actions && actions.length > 0 && (
          <td 
            className={classNames(styles.table__td, styles["table__td--actions"])}
            style={{ width: `${actions.length * 32}px`, minWidth: `${actions.length * 32}px` }}
          >
            <Row gap="8" horizontal="start" vertical="center" onClick={(e) => e.stopPropagation()}>
              {actions.map((action, actionIndex) => (
                <IconButton
                  key={actionIndex}
                  icon={action.icon as any}
                  size="l"
                  variant={action.variant || "tertiary"}
                  tooltip={action.tooltip || action.label}
                  onClick={(e: React.MouseEvent) => {
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
      <td 
        colSpan={data.headers.length + (actions?.length ? 1 : 0)} 
        className={styles.table__empty}
      >
        {emptyState || (
          <Column center padding="xl" gap="m">
            <Icon name="inbox" size="l" onBackground="neutral-weak" />
            <Column center gap="4">
              <Text variant="heading-strong-s" onBackground="neutral-medium">
                No data available
              </Text>
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
      <td 
        colSpan={data.headers.length + (actions?.length ? 1 : 0)} 
        className={styles.table__loading}
      >
        {loadingState || (
          <Column center padding="xl" gap="m">
            <Spinner />
            <Text variant="body-default-s" onBackground="neutral-weak">
              Loading data...
            </Text>
          </Column>
        )}
      </td>
    </tr>
  );

  return (
    <Column fillWidth gap="m" {...flex}>
      {/* Search Bar */}
      {searchable && (
        <Row horizontal="between" vertical="center" gap="m">
          <Input
            id="table-search"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            style={{ maxWidth: "320px" }}
          />
          {sortedRows.length !== data.rows.length && (
            <Tag>
              {sortedRows.length} of {data.rows.length}
            </Tag>
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
        className={styles.table__container}
      >
        <table className={tableClasses}>
          <thead className={styles.table__thead}>
            <tr>
              {data.headers.map((header, index) => renderHeader(header, index))}
              {actions && actions.length > 0 && (
                <th className={classNames(styles.table__th, styles["table__th--actions"])}>
                  <Text variant="label-strong-s" onBackground="neutral-medium">
                    Actions
                  </Text>
                </th>
              )}
            </tr>
          </thead>
          <tbody className={styles.table__tbody}>
            {loading ? (
              renderLoadingState()
            ) : sortedRows.length === 0 ? (
              renderEmptyState()
            ) : (
              paginatedRows.map((row, index) => {
                const originalIndex = data.rows.indexOf(row);
                return renderRow(row, originalIndex, index);
              })
            )}
          </tbody>
        </table>
      </Flex>

      {/* Pagination */}
      {paginated && !loading && sortedRows.length > 0 && (
        <Row horizontal="between" vertical="center" paddingX="s" gap="m" wrap>
          <Row gap="s" vertical="center">
            <Text as="p" variant="label-default-s" onBackground="neutral-medium">
              Entries per page:
            </Text>
            <Select
              id="page-size"
              value={String(pageSize)}
              height="s"
              onSelect={(value) => {
                setPageSize(Number(value));
                setPage(1);
              }}
              options={pageSizeOptions.map(size => ({
                label: String(size),
                value: String(size)
              }))}
              style={{
                  width: "56px",
              }}
            />
            <Text variant="label-default-s" onBackground="neutral-medium">
              Page {currentPage} of {totalPages}
            </Text>
          </Row>

          <Row gap="4" vertical="center">
            <Button
              size="s"
              variant="secondary"
              onClick={() => setPage(1)}
              disabled={currentPage === 1}
            >
              <Icon name="chevronLeft" size="s" />
              <Icon name="chevronLeft" size="s" style={{ marginLeft: "-8px" }} />
            </Button>
            <Button
              size="s"
              variant="secondary"
              onClick={() => setPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <Icon name="chevronLeft" size="s" />
            </Button>
            
            {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
              let pageNum;
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

            <Button
              size="s"
              variant="secondary"
              onClick={() => setPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <Icon name="chevronRight" size="s" />
            </Button>
            <Button
              size="s"
              variant="secondary"
              onClick={() => setPage(totalPages)}
              disabled={currentPage === totalPages}
            >
              <Icon name="chevronRight" size="s" />
              <Icon name="chevronRight" size="s" style={{ marginLeft: "-8px" }} />
            </Button>
          </Row>
        </Row>
      )}

      {/* Footer Info */}
      {!paginated && !loading && sortedRows.length > 0 && sortConfig && (
        <Row horizontal="end" vertical="center" paddingX="s">
          <Row gap="4" vertical="center">
            <Text variant="body-default-s" onBackground="neutral-weak">
              Sorted by {data.headers.find(h => h.key === sortConfig.key)?.content}
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
}

export { Table };
export type { TableProps, TableHeader, TableAction };
