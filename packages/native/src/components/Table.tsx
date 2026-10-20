import { type ReactNode, useMemo, useState } from "react";
import { Pressable, ScrollView, View, type ViewStyle } from "react-native";
import { useTheme } from "../theme/ThemeProvider";
import { BREAKPOINTS, type Breakpoint, Column, type FlexProps, Row } from "./Flex";
import { Icon, type IconName } from "./Icon";
import { IconButton } from "./IconButton";
import { Input } from "./Input";
import { Pagination } from "./Pagination";
import { Skeleton } from "./Skeleton";
import { Text } from "./Text";

export type TableHeader = {
  content: ReactNode;
  key: string;
  sortable?: boolean;
  /** `"120px"` fixes the column, `"30%"` takes that share; without it columns share the rest. */
  width?: string;
  align?: "left" | "center" | "right";
  /** Hide the column at a breakpoint and below, such as `{ s: true }`; `false` shows it again. */
  hide?: Partial<Record<Breakpoint, boolean>>;
};

export type TableAction = {
  icon: IconName;
  label?: string;
  tooltip?: string;
  variant?: "primary" | "secondary" | "tertiary" | "danger";
  onClick: (rowIndex: number) => void;
  disabled?: (rowIndex: number) => boolean;
};

export interface TableProps extends Omit<FlexProps, "children"> {
  data: { headers: TableHeader[]; rows: ReactNode[][] };
  onRowClick?: (rowIndex: number) => void;
  searchable?: boolean;
  searchPlaceholder?: string;
  striped?: boolean;
  /** Core's hover highlight; on a phone, rows highlight while pressed. */
  hoverable?: boolean;
  compact?: boolean;
  loading?: boolean;
  emptyState?: ReactNode;
  actions?: TableAction[];
  /** Keeps the header in view while `maxHeight` scrolls the rows. */
  stickyHeader?: boolean;
  /** The rows scroll inside this height, in points or a spacing token. */
  maxHeight?: number;
  paginated?: boolean;
  defaultPageSize?: number;
  pageSizeOptions?: number[];
  loadingState?: ReactNode;
}

/** The text of a cell, for search and sort, as core reads it. */
export function extractText(node: ReactNode): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(extractText).join(" ");
  if (typeof node === "object" && "props" in node) {
    return extractText((node as { props?: { children?: ReactNode } }).props?.children);
  }
  return "";
}

/** Whether a column is hidden at a width, its `hide` read from xl down as the CSS cascade does. */
function hiddenAt(hide: TableHeader["hide"], width: number, limits: Record<Breakpoint, number>) {
  if (!hide) return false;
  let hidden = false;
  for (const bp of BREAKPOINTS) {
    if (hide[bp] !== undefined && width <= limits[bp]) hidden = hide[bp] as boolean;
  }
  return hidden;
}

const ALIGN = { left: "flex-start", center: "center", right: "flex-end" } as const;

function columnStyle(header: TableHeader): ViewStyle {
  const w = header.width;
  if (w?.endsWith("px")) return { width: Number.parseFloat(w) };
  if (w?.endsWith("%")) return { width: w as `${number}%` };
  return { flex: 1, minWidth: 0 };
}

/**
 * Core's `Table`: headers and rows as data, with search, sort, row taps,
 * row actions, loading and empty states, and pages. Columns can hide on
 * small screens with `hide`, as on the web.
 */
export function Table({
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
  paginated = false,
  defaultPageSize = 10,
  pageSizeOptions = [5, 10, 20, 50],
  loadingState,
  ...flex
}: TableProps) {
  const theme = useTheme();
  const [sort, setSort] = useState<{ key: string; direction: "asc" | "desc" } | null>(null);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  const columns = data.headers
    .map((header, index) => ({ header, index }))
    .filter(({ header }) => !hiddenAt(header.hide, theme.width, theme.breakpoints));

  const filtered = useMemo(() => {
    if (!searchable || !query.trim()) return data.rows.map((row, index) => ({ row, index }));
    const q = query.toLowerCase();
    return data.rows
      .map((row, index) => ({ row, index }))
      .filter(({ row }) => row.some((cell) => extractText(cell).toLowerCase().includes(q)));
  }, [data.rows, query, searchable]);

  const sorted = useMemo(() => {
    if (!sort) return filtered;
    const at = data.headers.findIndex((h) => h.key === sort.key);
    if (at === -1) return filtered;
    return [...filtered].sort((a, b) => {
      const c = extractText(a.row[at]).localeCompare(extractText(b.row[at]), undefined, {
        numeric: true,
        sensitivity: "base",
      });
      return sort.direction === "asc" ? c : -c;
    });
  }, [filtered, sort, data.headers]);

  const pages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const current = Math.min(page, pages);
  const shown = paginated ? sorted.slice((current - 1) * pageSize, current * pageSize) : sorted;

  const padX = theme.space(compact ? "12" : "16");
  const padY = theme.space(compact ? "8" : "12");
  const line = theme.color("neutral-border-medium");
  const cellBox = (header: TableHeader): ViewStyle => ({
    ...columnStyle(header),
    paddingHorizontal: padX,
    paddingVertical: padY,
    justifyContent: "center",
    alignItems: ALIGN[header.align ?? "left"],
  });

  const head = (
    <Row background="neutral-alpha-weak" borderBottom="neutral-medium" accessibilityRole="header">
      {columns.map(({ header }) => {
        const active = sort?.key === header.key;
        const label =
          typeof header.content === "string" ? (
            <Text variant="label-strong-s" onBackground="neutral-medium" numberOfLines={1}>
              {header.content}
            </Text>
          ) : (
            header.content
          );
        return header.sortable ? (
          <Pressable
            key={header.key}
            accessibilityRole="button"
            accessibilityHint="Sorts by this column"
            aria-sort={active ? (sort.direction === "asc" ? "ascending" : "descending") : "none"}
            onPress={() => {
              setSort({
                key: header.key,
                direction: active && sort.direction === "asc" ? "desc" : "asc",
              });
              setPage(1);
            }}
            style={[
              cellBox(header),
              {
                flexDirection: "row",
                // In a row, the column's alignment is the main axis.
                justifyContent: ALIGN[header.align ?? "left"],
                alignItems: "center",
                gap: theme.space("4"),
              },
            ]}
          >
            {label}
            <Icon
              name={active && sort.direction === "desc" ? "chevronDown" : "chevronUp"}
              size="xs"
              onBackground={active ? "neutral-strong" : "neutral-weak"}
            />
          </Pressable>
        ) : (
          <View key={header.key} style={cellBox(header)}>
            {label}
          </View>
        );
      })}
      {actions && <View style={{ width: theme.space("40") * actions.length + padX }} />}
    </Row>
  );

  const body = loading ? (
    (loadingState ?? (
      <Column gap="12" padding="16">
        {Array.from({ length: 3 }, (_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: placeholders
          <Skeleton key={i} shape="line" size="m" />
        ))}
      </Column>
    ))
  ) : shown.length === 0 ? (
    <Column padding="24" horizontal="center">
      {typeof emptyState === "string" || emptyState === undefined ? (
        <Text variant="body-default-s" onBackground="neutral-weak">
          {emptyState ?? "No results"}
        </Text>
      ) : (
        emptyState
      )}
    </Column>
  ) : (
    shown.map(({ row, index }, position) => (
      <Pressable
        key={index}
        disabled={!onRowClick}
        accessibilityRole={onRowClick ? "button" : undefined}
        onPress={onRowClick ? () => onRowClick(index) : undefined}
        style={({ pressed }) => ({
          flexDirection: "row",
          alignItems: "center",
          borderTopWidth: position === 0 ? 0 : 1,
          borderTopColor: line,
          backgroundColor:
            pressed && (hoverable || onRowClick)
              ? theme.color("neutral-alpha-medium")
              : striped && position % 2 === 1
                ? theme.color("neutral-alpha-weak")
                : "transparent",
        })}
      >
        {columns.map(({ header, index: at }) => (
          <View key={header.key} style={cellBox(header)}>
            {typeof row[at] === "string" || typeof row[at] === "number" ? (
              <Text variant="body-default-s">{row[at]}</Text>
            ) : (
              row[at]
            )}
          </View>
        ))}
        {actions && (
          <Row gap="4" paddingRight={compact ? "8" : "12"}>
            {actions.map((action) => (
              <IconButton
                key={action.icon + (action.label ?? "")}
                icon={action.icon}
                size="m"
                variant={action.variant ?? "tertiary"}
                ariaLabel={action.label ?? action.tooltip ?? action.icon}
                disabled={action.disabled?.(index)}
                onPress={() => action.onClick(index)}
              />
            ))}
          </Row>
        )}
      </Pressable>
    ))
  );

  return (
    <Column gap="12" fillWidth {...flex}>
      {searchable && (
        <Input
          label={searchPlaceholder}
          value={query}
          size="s"
          onChangeText={(text) => {
            setQuery(text);
            setPage(1);
          }}
          prefix={<Icon name="search" size="s" onBackground="neutral-weak" />}
        />
      )}
      <Column fillWidth radius="l" border="neutral-medium" overflow="hidden">
        {(stickyHeader || maxHeight === undefined) && head}
        {maxHeight !== undefined ? (
          <ScrollView style={{ maxHeight }} nestedScrollEnabled>
            {!stickyHeader && head}
            {body}
          </ScrollView>
        ) : (
          body
        )}
      </Column>
      {paginated && sorted.length > 0 && (
        <Pagination
          page={current}
          onChange={setPage}
          count={sorted.length}
          perPage={pageSize}
          perPageOptions={pageSizeOptions}
          onPerPageChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
          size="s"
        />
      )}
    </Column>
  );
}
