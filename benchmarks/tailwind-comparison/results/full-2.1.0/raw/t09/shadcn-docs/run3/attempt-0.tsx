"use client";

import * as React from "react";
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";
import {
  ArrowDownIcon,
  ArrowUpDownIcon,
  ArrowUpIcon,
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  SearchIcon,
  SearchXIcon,
  XIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";

type OrderStatus = "paid" | "pending" | "refunded" | "failed";
type StatusFilter = "all" | OrderStatus;

type Order = {
  id: string;
  customer: string;
  email: string;
  plan: string;
  status: OrderStatus;
  amount: number;
  date: string; // ISO yyyy-mm-dd
};

type SortKey = "id" | "customer" | "plan" | "status" | "amount" | "date";
type SortDir = "asc" | "desc";

const ORDERS: Order[] = [
  { id: "INV-2041", customer: "Amara Okafor", email: "amara@northwind.example", plan: "Team", status: "paid", amount: 480, date: "2025-06-02" },
  { id: "INV-2042", customer: "Lukas Brandt", email: "lukas@brandtworks.example", plan: "Starter", status: "paid", amount: 29, date: "2025-06-03" },
  { id: "INV-2043", customer: "Priya Raman", email: "priya@lumen.example", plan: "Business", status: "pending", amount: 1290, date: "2025-06-04" },
  { id: "INV-2044", customer: "Mateo Silva", email: "mateo@casasilva.example", plan: "Team", status: "failed", amount: 480, date: "2025-06-05" },
  { id: "INV-2045", customer: "Hannah Fischer", email: "hannah@fischer.example", plan: "Starter", status: "refunded", amount: 29, date: "2025-06-06" },
  { id: "INV-2046", customer: "Yuki Tanaka", email: "yuki@kumo.example", plan: "Business", status: "paid", amount: 1290, date: "2025-06-09" },
  { id: "INV-2047", customer: "Olivia Bennett", email: "olivia@harbor.example", plan: "Team", status: "paid", amount: 480, date: "2025-06-10" },
  { id: "INV-2048", customer: "Noah Petrov", email: "noah@petrovlabs.example", plan: "Enterprise", status: "pending", amount: 4200, date: "2025-06-11" },
  { id: "INV-2049", customer: "Sofia Marino", email: "sofia@marino.example", plan: "Starter", status: "paid", amount: 29, date: "2025-06-12" },
  { id: "INV-2050", customer: "Daniel Osei", email: "daniel@oseigroup.example", plan: "Business", status: "failed", amount: 1290, date: "2025-06-13" },
  { id: "INV-2051", customer: "Chloe Martin", email: "chloe@atelier.example", plan: "Team", status: "paid", amount: 480, date: "2025-06-16" },
  { id: "INV-2052", customer: "Ravi Menon", email: "ravi@menon.example", plan: "Enterprise", status: "paid", amount: 4200, date: "2025-06-17" },
  { id: "INV-2053", customer: "Elena Volkova", email: "elena@volkova.example", plan: "Starter", status: "pending", amount: 29, date: "2025-06-18" },
  { id: "INV-2054", customer: "Tomás Herrera", email: "tomas@herrera.example", plan: "Team", status: "refunded", amount: 480, date: "2025-06-19" },
  { id: "INV-2055", customer: "Grace Liu", email: "grace@liustudio.example", plan: "Business", status: "paid", amount: 1290, date: "2025-06-20" },
  { id: "INV-2056", customer: "Isaac Cohen", email: "isaac@cohen.example", plan: "Starter", status: "paid", amount: 29, date: "2025-06-23" },
  { id: "INV-2057", customer: "Fatima Zahra", email: "fatima@zahra.example", plan: "Team", status: "paid", amount: 480, date: "2025-06-24" },
  { id: "INV-2058", customer: "Oscar Lindqvist", email: "oscar@lindqvist.example", plan: "Business", status: "pending", amount: 1290, date: "2025-06-25" },
  { id: "INV-2059", customer: "Mei Chen", email: "mei@chenco.example", plan: "Enterprise", status: "paid", amount: 4200, date: "2025-06-26" },
  { id: "INV-2060", customer: "Jonas Weber", email: "jonas@weber.example", plan: "Starter", status: "failed", amount: 29, date: "2025-06-27" },
  { id: "INV-2061", customer: "Aisha Khan", email: "aisha@khanventures.example", plan: "Team", status: "paid", amount: 480, date: "2025-06-30" },
  { id: "INV-2062", customer: "Liam O'Connor", email: "liam@oconnor.example", plan: "Business", status: "paid", amount: 1290, date: "2025-07-01" },
  { id: "INV-2063", customer: "Zara Ahmed", email: "zara@ahmed.example", plan: "Starter", status: "refunded", amount: 29, date: "2025-07-02" },
  { id: "INV-2064", customer: "Pedro Alves", email: "pedro@alves.example", plan: "Team", status: "pending", amount: 480, date: "2025-07-03" },
  { id: "INV-2065", customer: "Ingrid Solberg", email: "ingrid@solberg.example", plan: "Enterprise", status: "paid", amount: 4200, date: "2025-07-04" },
  { id: "INV-2066", customer: "Kofi Mensah", email: "kofi@mensah.example", plan: "Starter", status: "paid", amount: 29, date: "2025-07-07" },
  { id: "INV-2067", customer: "Camille Dubois", email: "camille@dubois.example", plan: "Business", status: "failed", amount: 1290, date: "2025-07-08" },
  { id: "INV-2068", customer: "Arjun Patel", email: "arjun@patel.example", plan: "Team", status: "paid", amount: 480, date: "2025-07-09" },
];

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "paid", label: "Paid" },
  { value: "pending", label: "Pending" },
  { value: "refunded", label: "Refunded" },
  { value: "failed", label: "Failed" },
];

const STATUS_STYLES: Record<OrderStatus, string> = {
  paid: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300",
  pending: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
  refunded: "bg-sky-100 text-sky-800 dark:bg-sky-500/15 dark:text-sky-300",
  failed: "bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-300",
};

const PAGE_SIZES = ["5", "10", "15"];

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

/** Parse an ISO yyyy-mm-dd string as a local date (avoids timezone shifts). */
function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function startOfDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

function compare(a: Order, b: Order, key: SortKey): number {
  switch (key) {
    case "amount":
      return a.amount - b.amount;
    case "date":
      return a.date.localeCompare(b.date);
    default:
      return a[key].localeCompare(b[key], "en", { numeric: true });
  }
}

/** Build a compact list of page numbers with ellipses, e.g. 1 … 4 5 6 … 12 */
function getPageItems(current: number, total: number): (number | "ellipsis-start" | "ellipsis-end")[] {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
  const items: (number | "ellipsis-start" | "ellipsis-end")[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) items.push("ellipsis-start");
  for (let p = start; p <= end; p++) items.push(p);
  if (end < total - 1) items.push("ellipsis-end");
  items.push(total);
  return items;
}

type SortableHeadProps = {
  label: string;
  sortKey: SortKey;
  activeKey: SortKey;
  dir: SortDir;
  onSort: (key: SortKey) => void;
  align?: "left" | "right";
  className?: string;
};

function SortableHead({
  label,
  sortKey,
  activeKey,
  dir,
  onSort,
  align = "left",
  className,
}: SortableHeadProps) {
  const isActive = activeKey === sortKey;
  const ariaSort: React.AriaAttributes["aria-sort"] = isActive
    ? dir === "asc"
      ? "ascending"
      : "descending"
    : "none";
  const Icon = !isActive ? ArrowUpDownIcon : dir === "asc" ? ArrowUpIcon : ArrowDownIcon;

  return (
    <TableHead
      aria-sort={ariaSort}
      className={cn(align === "right" && "text-right", className)}
    >
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => onSort(sortKey)}
        className={cn(
          "-mx-1 h-8 gap-1.5 px-2 font-medium",
          align === "right" && "flex-row-reverse",
          isActive ? "text-foreground" : "text-muted-foreground"
        )}
      >
        {label}
        <Icon aria-hidden="true" className={cn("size-3.5", !isActive && "opacity-60")} />
        <span className="sr-only">
          {isActive
            ? `, sorted ${dir === "asc" ? "ascending" : "descending"}. Activate to reverse.`
            : ", not sorted. Activate to sort ascending."}
        </span>
      </Button>
    </TableHead>
  );
}

export default function Page() {
  const [status, setStatus] = React.useState<StatusFilter>("all");
  const [query, setQuery] = React.useState("");
  const [range, setRange] = React.useState<DateRange | undefined>(undefined);
  const [sortKey, setSortKey] = React.useState<SortKey>("date");
  const [sortDir, setSortDir] = React.useState<SortDir>("desc");
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "amount" || key === "date" ? "desc" : "asc");
    }
    setPage(1);
  };

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    const from = range?.from ? startOfDay(range.from) : null;
    const to = range?.to ? startOfDay(range.to) : from;
    return ORDERS.filter((o) => {
      if (status !== "all" && o.status !== status) return false;
      if (q && !`${o.id} ${o.customer} ${o.email} ${o.plan}`.toLowerCase().includes(q)) {
        return false;
      }
      if (from !== null) {
        const t = startOfDay(parseISODate(o.date));
        if (t < from || (to !== null && t > to)) return false;
      }
      return true;
    });
  }, [status, query, range]);

  const sorted = React.useMemo(() => {
    const dirMul = sortDir === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      const result = compare(a, b, sortKey) * dirMul;
      return result !== 0 ? result : a.id.localeCompare(b.id);
    });
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const rows = sorted.slice(startIndex, startIndex + pageSize);
  const rangeStart = sorted.length === 0 ? 0 : startIndex + 1;
  const rangeEnd = startIndex + rows.length;

  const hasFilters = status !== "all" || query.trim() !== "" || range?.from !== undefined;

  const clearFilters = () => {
    setStatus("all");
    setQuery("");
    setRange(undefined);
    setPage(1);
  };

  const dateLabel = range?.from
    ? range.to && range.to.getTime() !== range.from.getTime()
      ? `${format(range.from, "MMM d, yyyy")} – ${format(range.to, "MMM d, yyyy")}`
      : format(range.from, "MMM d, yyyy")
    : "Any date";

  const totalShown = sorted.reduce((sum, o) => sum + (o.status === "paid" ? o.amount : 0), 0);
  const pageItems = getPageItems(currentPage, totalPages);

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-12">
        <header className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Invoices</h1>
          <p className="text-sm text-muted-foreground">
            Track payments across every workspace. Filter by status, narrow down by date, or search
            for a customer.
          </p>
        </header>

        {/* Filters row */}
        <section aria-label="Filters" className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:overflow-visible sm:px-0">
            <ToggleGroup
              type="single"
              variant="outline"
              value={status}
              onValueChange={(value) => {
                if (!value) return;
                setStatus(value as StatusFilter);
                setPage(1);
              }}
              aria-label="Filter by status"
            >
              {STATUS_OPTIONS.map((opt) => (
                <ToggleGroupItem key={opt.value} value={opt.value} aria-label={`${opt.label} invoices`}>
                  {opt.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>

          <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center lg:justify-end">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  data-empty={!range?.from}
                  aria-label={`Filter by date range: ${dateLabel}`}
                  className="w-full justify-start font-normal data-[empty=true]:text-muted-foreground sm:w-64"
                >
                  <CalendarIcon aria-hidden="true" />
                  <span className="truncate">{dateLabel}</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-auto p-0">
                <Calendar
                  mode="range"
                  numberOfMonths={1}
                  defaultMonth={range?.from ?? new Date(2025, 5, 1)}
                  selected={range}
                  onSelect={(next) => {
                    setRange(next);
                    setPage(1);
                  }}
                />
                <div className="flex items-center justify-between gap-2 border-t p-2">
                  <p className="px-1 text-xs text-muted-foreground">
                    {range?.from ? "Showing invoices in range" : "Select a start and end date"}
                  </p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={!range?.from}
                    onClick={() => {
                      setRange(undefined);
                      setPage(1);
                    }}
                  >
                    Reset
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

            <InputGroup className="sm:max-w-xs">
              <InputGroupAddon>
                <SearchIcon aria-hidden="true" />
              </InputGroupAddon>
              <InputGroupInput
                type="search"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(1);
                }}
                placeholder="Search customer, email or ID"
                aria-label="Search invoices"
                autoComplete="off"
              />
              {query && (
                <InputGroupAddon align="inline-end">
                  <InputGroupButton
                    size="icon-xs"
                    aria-label="Clear search"
                    onClick={() => {
                      setQuery("");
                      setPage(1);
                    }}
                  >
                    <XIcon aria-hidden="true" />
                  </InputGroupButton>
                </InputGroupAddon>
              )}
            </InputGroup>
          </div>
        </section>

        {/* Summary */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
          <p className="text-muted-foreground" role="status" aria-live="polite">
            <span className="font-medium text-foreground">{sorted.length}</span>{" "}
            {sorted.length === 1 ? "invoice" : "invoices"}
            {hasFilters ? " match your filters" : " in total"}
            {" · "}
            <span className="font-medium text-foreground">{currency.format(totalShown)}</span> collected
          </p>
          {hasFilters && (
            <Button type="button" variant="ghost" size="sm" onClick={clearFilters}>
              <XIcon aria-hidden="true" />
              Clear filters
            </Button>
          )}
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-lg border bg-card">
          <Table>
            <caption className="sr-only">
              Invoices sorted by {sortKey} in {sortDir === "asc" ? "ascending" : "descending"} order.
              Showing {rangeStart} to {rangeEnd} of {sorted.length}.
            </caption>
            <TableHeader className="bg-muted/40">
              <TableRow className="hover:bg-transparent">
                <SortableHead label="Invoice" sortKey="id" activeKey={sortKey} dir={sortDir} onSort={handleSort} className="pl-4" />
                <SortableHead label="Customer" sortKey="customer" activeKey={sortKey} dir={sortDir} onSort={handleSort} />
                <SortableHead label="Plan" sortKey="plan" activeKey={sortKey} dir={sortDir} onSort={handleSort} className="hidden md:table-cell" />
                <SortableHead label="Status" sortKey="status" activeKey={sortKey} dir={sortDir} onSort={handleSort} />
                <SortableHead label="Date" sortKey="date" activeKey={sortKey} dir={sortDir} onSort={handleSort} className="hidden sm:table-cell" />
                <SortableHead label="Amount" sortKey="amount" activeKey={sortKey} dir={sortDir} onSort={handleSort} align="right" className="pr-4" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="pl-4 font-mono text-xs text-muted-foreground">
                    {order.id}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{order.customer}</span>
                      <span className="max-w-[12rem] truncate text-xs text-muted-foreground sm:max-w-none">
                        {order.email}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{order.plan}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={cn("capitalize", STATUS_STYLES[order.status])}>
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground sm:table-cell">
                    <time dateTime={order.date}>
                      {format(parseISODate(order.date), "MMM d, yyyy")}
                    </time>
                  </TableCell>
                  <TableCell className="pr-4 text-right font-medium tabular-nums">
                    {currency.format(order.amount)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {rows.length === 0 && (
            <Empty className="border-t">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <SearchXIcon aria-hidden="true" />
                </EmptyMedia>
                <EmptyTitle>No invoices found</EmptyTitle>
                <EmptyDescription>
                  Nothing matches the current filters. Try a different status, widen the date range,
                  or check the spelling of your search.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button type="button" variant="outline" size="sm" onClick={clearFilters}>
                  Clear all filters
                </Button>
              </EmptyContent>
            </Empty>
          )}
        </div>

        {/* Pagination */}
        <div className="flex flex-col items-center gap-4 md:flex-row md:justify-between">
          <div className="flex w-full items-center justify-between gap-4 md:w-auto md:justify-start">
            <p className="text-sm text-muted-foreground">
              {rangeStart}–{rangeEnd} of {sorted.length}
            </p>
            <div className="flex items-center gap-2">
              <span id="rows-per-page-label" className="text-sm text-muted-foreground">
                Rows per page
              </span>
              <Select
                value={String(pageSize)}
                onValueChange={(value) => {
                  setPageSize(Number(value));
                  setPage(1);
                }}
              >
                <SelectTrigger size="sm" className="w-[4.5rem]" aria-labelledby="rows-per-page-label">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAGE_SIZES.map((size) => (
                    <SelectItem key={size} value={size}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <nav aria-label="Pagination" className="flex items-center gap-1">
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              aria-label="Go to first page"
              disabled={currentPage === 1}
              onClick={() => setPage(1)}
              className="hidden sm:inline-flex"
            >
              <ChevronsLeftIcon aria-hidden="true" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              aria-label="Go to previous page"
              disabled={currentPage === 1}
              onClick={() => setPage(currentPage - 1)}
            >
              <ChevronLeftIcon aria-hidden="true" />
            </Button>

            <ul className="flex items-center gap-1">
              {pageItems.map((item) =>
                typeof item === "number" ? (
                  <li key={item} className={cn(item !== currentPage && "hidden sm:block")}>
                    <Button
                      type="button"
                      variant={item === currentPage ? "default" : "ghost"}
                      size="icon-sm"
                      aria-label={`Page ${item}`}
                      aria-current={item === currentPage ? "page" : undefined}
                      onClick={() => setPage(item)}
                      className="tabular-nums"
                    >
                      {item}
                    </Button>
                  </li>
                ) : (
                  <li key={item} aria-hidden="true" className="hidden px-1 text-muted-foreground sm:block">
                    …
                  </li>
                )
              )}
            </ul>

            <span className="px-2 text-sm text-muted-foreground sm:hidden" aria-hidden="true">
              of {totalPages}
            </span>

            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              aria-label="Go to next page"
              disabled={currentPage === totalPages}
              onClick={() => setPage(currentPage + 1)}
            >
              <ChevronRightIcon aria-hidden="true" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              aria-label="Go to last page"
              disabled={currentPage === totalPages}
              onClick={() => setPage(totalPages)}
              className="hidden sm:inline-flex"
            >
              <ChevronsRightIcon aria-hidden="true" />
            </Button>
          </nav>
        </div>
      </div>
    </main>
  );
}
