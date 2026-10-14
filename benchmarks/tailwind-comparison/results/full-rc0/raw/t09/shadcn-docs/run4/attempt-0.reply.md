That's fine; I know the `react-day-picker` range API (`mode="range"`, `selected`, `onSelect`). Writing the page now.

```tsx
"use client";

import * as React from "react";
import {
  ArrowDownIcon,
  ArrowUpDownIcon,
  ArrowUpIcon,
  CalendarIcon,
  PackageSearchIcon,
  SearchIcon,
  XIcon,
} from "lucide-react";
import type { DateRange } from "react-day-picker";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Label } from "@/components/ui/label";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
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

/* ----------------------------------------------------------------------------
 * Data
 * ------------------------------------------------------------------------- */

type OrderStatus = "paid" | "pending" | "shipped" | "refunded";

type Order = {
  id: string;
  customer: string;
  email: string;
  product: string;
  status: OrderStatus;
  /** ISO date (UTC), yyyy-mm-dd */
  date: string;
  /** Amount in cents */
  amount: number;
};

const ORDERS: Order[] = [
  { id: "ORD-10482", customer: "Amara Okafor", email: "amara.okafor@northwind.example", product: "Trailhead 40L Backpack", status: "paid", date: "2025-03-28", amount: 18900 },
  { id: "ORD-10481", customer: "Lukas Brandt", email: "l.brandt@brandtworks.example", product: "Ridgeline Trekking Poles", status: "shipped", date: "2025-03-27", amount: 8450 },
  { id: "ORD-10480", customer: "Priya Raman", email: "priya@ramanstudio.example", product: "Summit Down Jacket", status: "pending", date: "2025-03-27", amount: 32000 },
  { id: "ORD-10479", customer: "Mateo Alvarez", email: "mateo.alvarez@fjordmail.example", product: "Basecamp 2P Tent", status: "paid", date: "2025-03-26", amount: 41900 },
  { id: "ORD-10478", customer: "Hannah Lindqvist", email: "hannah.l@lindqvist.example", product: "Alpine Headlamp 450", status: "refunded", date: "2025-03-25", amount: 5900 },
  { id: "ORD-10477", customer: "Kenji Watanabe", email: "kenji.w@kitakami.example", product: "Merino Base Layer Set", status: "shipped", date: "2025-03-24", amount: 12400 },
  { id: "ORD-10476", customer: "Sofia Rossi", email: "sofia.rossi@rossi-co.example", product: "Trailhead 40L Backpack", status: "paid", date: "2025-03-23", amount: 18900 },
  { id: "ORD-10475", customer: "Ethan Caldwell", email: "ethan@caldwell.example", product: "Titanium Camp Mug", status: "paid", date: "2025-03-22", amount: 2800 },
  { id: "ORD-10474", customer: "Zainab Hussein", email: "zainab.h@harbourpost.example", product: "Summit Down Jacket", status: "pending", date: "2025-03-21", amount: 32000 },
  { id: "ORD-10473", customer: "Oskar Nilsson", email: "oskar.n@nilsson.example", product: "Ridgeline Trekking Poles", status: "shipped", date: "2025-03-20", amount: 8450 },
  { id: "ORD-10472", customer: "Chloe Martin", email: "chloe.martin@lumen.example", product: "Basecamp 2P Tent", status: "refunded", date: "2025-03-19", amount: 41900 },
  { id: "ORD-10471", customer: "Daniel Osei", email: "d.osei@oseiandsons.example", product: "Alpine Headlamp 450", status: "paid", date: "2025-03-18", amount: 5900 },
  { id: "ORD-10470", customer: "Ingrid Haugen", email: "ingrid@haugen.example", product: "Merino Base Layer Set", status: "paid", date: "2025-03-17", amount: 12400 },
  { id: "ORD-10469", customer: "Rahul Mehta", email: "rahul.mehta@meridian.example", product: "Trailhead 40L Backpack", status: "pending", date: "2025-03-15", amount: 18900 },
  { id: "ORD-10468", customer: "Elena Petrova", email: "elena.p@petrova.example", product: "Titanium Camp Mug", status: "shipped", date: "2025-03-14", amount: 2800 },
  { id: "ORD-10467", customer: "Tomás Herrera", email: "tomas.herrera@sierra.example", product: "Summit Down Jacket", status: "paid", date: "2025-03-12", amount: 32000 },
  { id: "ORD-10466", customer: "Grace Kimani", email: "grace.k@kimani.example", product: "Basecamp 2P Tent", status: "shipped", date: "2025-03-11", amount: 41900 },
  { id: "ORD-10465", customer: "Noah Fischer", email: "noah.fischer@fischer.example", product: "Ridgeline Trekking Poles", status: "paid", date: "2025-03-09", amount: 8450 },
  { id: "ORD-10464", customer: "Mei Lin Chen", email: "meilin@chenatelier.example", product: "Alpine Headlamp 450", status: "pending", date: "2025-03-08", amount: 5900 },
  { id: "ORD-10463", customer: "Victor Dubois", email: "victor.dubois@dubois.example", product: "Merino Base Layer Set", status: "refunded", date: "2025-03-06", amount: 12400 },
  { id: "ORD-10462", customer: "Aisha Bello", email: "aisha.bello@bello.example", product: "Trailhead 40L Backpack", status: "paid", date: "2025-03-05", amount: 18900 },
  { id: "ORD-10461", customer: "Jonas Weber", email: "jonas@weberhaus.example", product: "Titanium Camp Mug", status: "paid", date: "2025-03-04", amount: 2800 },
  { id: "ORD-10460", customer: "Camila Torres", email: "camila.t@torres.example", product: "Summit Down Jacket", status: "shipped", date: "2025-03-03", amount: 32000 },
  { id: "ORD-10459", customer: "Liam O'Connor", email: "liam.oconnor@oconnor.example", product: "Basecamp 2P Tent", status: "pending", date: "2025-03-02", amount: 41900 },
  { id: "ORD-10458", customer: "Yuki Tanaka", email: "yuki.tanaka@tanaka.example", product: "Ridgeline Trekking Poles", status: "paid", date: "2025-03-01", amount: 8450 },
  { id: "ORD-10457", customer: "Fatima Zahra", email: "fatima.z@zahra.example", product: "Alpine Headlamp 450", status: "shipped", date: "2025-02-27", amount: 5900 },
  { id: "ORD-10456", customer: "Henrik Larsen", email: "henrik@larsen.example", product: "Merino Base Layer Set", status: "paid", date: "2025-02-25", amount: 12400 },
  { id: "ORD-10455", customer: "Isabelle Moreau", email: "isabelle.moreau@moreau.example", product: "Trailhead 40L Backpack", status: "refunded", date: "2025-02-22", amount: 18900 },
  { id: "ORD-10454", customer: "Samuel Adeyemi", email: "sam.adeyemi@adeyemi.example", product: "Titanium Camp Mug", status: "paid", date: "2025-02-20", amount: 2800 },
  { id: "ORD-10453", customer: "Nora Eriksen", email: "nora.eriksen@eriksen.example", product: "Summit Down Jacket", status: "paid", date: "2025-02-18", amount: 32000 },
  { id: "ORD-10452", customer: "Pedro Santos", email: "pedro.santos@santos.example", product: "Basecamp 2P Tent", status: "shipped", date: "2025-02-15", amount: 41900 },
  { id: "ORD-10451", customer: "Leila Haddad", email: "leila.haddad@haddad.example", product: "Ridgeline Trekking Poles", status: "pending", date: "2025-02-12", amount: 8450 },
  { id: "ORD-10450", customer: "Oliver Grant", email: "oliver.grant@grant.example", product: "Alpine Headlamp 450", status: "paid", date: "2025-02-10", amount: 5900 },
];

type StatusFilter = "all" | OrderStatus;

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "paid", label: "Paid" },
  { value: "pending", label: "Pending" },
  { value: "shipped", label: "Shipped" },
  { value: "refunded", label: "Refunded" },
];

const STATUS_STYLES: Record<OrderStatus, string> = {
  paid: "border-emerald-600/30 bg-emerald-600/10 text-emerald-800 dark:text-emerald-300",
  pending: "border-amber-600/30 bg-amber-600/10 text-amber-800 dark:text-amber-300",
  shipped: "border-sky-600/30 bg-sky-600/10 text-sky-800 dark:text-sky-300",
  refunded: "border-rose-600/30 bg-rose-600/10 text-rose-800 dark:text-rose-300",
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  paid: "Paid",
  pending: "Pending",
  shipped: "Shipped",
  refunded: "Refunded",
};

type SortKey = "id" | "customer" | "product" | "status" | "date" | "amount";
type SortDir = "asc" | "desc";

const COLUMNS: { key: SortKey; label: string; align?: "right" }[] = [
  { key: "id", label: "Order" },
  { key: "customer", label: "Customer" },
  { key: "product", label: "Product" },
  { key: "status", label: "Status" },
  { key: "date", label: "Date" },
  { key: "amount", label: "Amount", align: "right" },
];

const PAGE_SIZES = ["5", "10", "20"];

/* ----------------------------------------------------------------------------
 * Helpers (locale and time zone are fixed so server and client render the same)
 * ------------------------------------------------------------------------- */

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

/** Parse yyyy-mm-dd as a UTC date. */
function parseISO(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

/** Convert a local calendar-picked date to a UTC midnight timestamp for the same Y-M-D. */
function localToUTCDay(date: Date): number {
  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
}

function formatISO(iso: string): string {
  return dateFormatter.format(parseISO(iso));
}

function formatPickedDate(date: Date): string {
  return dateFormatter.format(new Date(localToUTCDay(date)));
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

/** Build the list of page numbers to show, with null standing for an ellipsis. */
function getPageItems(current: number, total: number): (number | null)[] {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
  const items: (number | null)[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) items.push(null);
  for (let p = start; p <= end; p++) items.push(p);
  if (end < total - 1) items.push(null);
  items.push(total);
  return items;
}

/* ----------------------------------------------------------------------------
 * Page
 * ------------------------------------------------------------------------- */

export default function OrdersPage() {
  const [status, setStatus] = React.useState<StatusFilter>("all");
  const [range, setRange] = React.useState<DateRange | undefined>(undefined);
  const [query, setQuery] = React.useState("");
  const [sortKey, setSortKey] = React.useState<SortKey>("date");
  const [sortDir, setSortDir] = React.useState<SortDir>("desc");
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [calendarOpen, setCalendarOpen] = React.useState(false);

  const searchId = React.useId();
  const statusLabelId = React.useId();
  const dateLabelId = React.useId();

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    const fromTs = range?.from ? localToUTCDay(range.from) : null;
    const toTs = range?.to
      ? localToUTCDay(range.to)
      : range?.from
        ? localToUTCDay(range.from)
        : null;

    return ORDERS.filter((o) => {
      if (status !== "all" && o.status !== status) return false;
      if (fromTs !== null && toTs !== null) {
        const ts = parseISO(o.date).getTime();
        if (ts < fromTs || ts > toTs) return false;
      }
      if (q) {
        const haystack = `${o.id} ${o.customer} ${o.email} ${o.product}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [status, range, query]);

  const sorted = React.useMemo(() => {
    const dir = sortDir === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      const result = compare(a, b, sortKey);
      return result !== 0 ? result * dir : b.id.localeCompare(a.id);
    });
  }, [filtered, sortKey, sortDir]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const startIndex = (currentPage - 1) * pageSize;
  const pageRows = sorted.slice(startIndex, startIndex + pageSize);

  const hasFilters = status !== "all" || range?.from !== undefined || query !== "";

  function toggleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "amount" || key === "date" ? "desc" : "asc");
    }
    setPage(1);
  }

  function clearFilters() {
    setStatus("all");
    setRange(undefined);
    setQuery("");
    setPage(1);
  }

  function goTo(p: number) {
    setPage(Math.min(Math.max(1, p), pageCount));
  }

  const rangeLabel = range?.from
    ? range.to && localToUTCDay(range.to) !== localToUTCDay(range.from)
      ? `${formatPickedDate(range.from)} – ${formatPickedDate(range.to)}`
      : formatPickedDate(range.from)
    : "Any date";

  const totalRevenue = React.useMemo(
    () =>
      filtered
        .filter((o) => o.status !== "refunded")
        .reduce((sum, o) => sum + o.amount, 0),
    [filtered],
  );

  const showingFrom = sorted.length === 0 ? 0 : startIndex + 1;
  const showingTo = Math.min(startIndex + pageSize, sorted.length);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <header className="mb-6 flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Orders
        </h1>
        <p className="text-sm text-muted-foreground">
          Track, filter and review recent orders from the Trailhead Outfitters
          storefront.
        </p>
      </header>

      <Card className="gap-4 py-4 sm:py-6">
        <CardHeader className="gap-4">
          <div className="flex flex-col gap-1">
            <CardTitle className="text-base">Order history</CardTitle>
            <CardDescription>
              {filtered.length} {filtered.length === 1 ? "order" : "orders"}
              {" · "}
              {currencyFormatter.format(totalRevenue / 100)} net revenue
            </CardDescription>
          </div>

          {/* Filters row */}
          <div
            role="search"
            aria-label="Filter orders"
            className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-end"
          >
            <div className="flex min-w-0 flex-col gap-1.5">
              <span
                id={statusLabelId}
                className="text-xs font-medium text-muted-foreground"
              >
                Status
              </span>
              <div className="max-w-full overflow-x-auto pb-1 -mb-1">
                <ToggleGroup
                  type="single"
                  variant="outline"
                  spacing={0}
                  value={status}
                  onValueChange={(value) => {
                    // Radix emits "" when the active item is clicked again; keep a selection.
                    if (!value) return;
                    setStatus(value as StatusFilter);
                    setPage(1);
                  }}
                  aria-labelledby={statusLabelId}
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <ToggleGroupItem
                      key={opt.value}
                      value={opt.value}
                      aria-label={`${opt.label} orders`}
                    >
                      {opt.label}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <span
                id={dateLabelId}
                className="text-xs font-medium text-muted-foreground"
              >
                Order date
              </span>
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    aria-labelledby={dateLabelId}
                    aria-haspopup="dialog"
                    className={cn(
                      "w-full justify-start font-normal lg:w-64",
                      !range?.from && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon aria-hidden="true" />
                    <span className="truncate">{rangeLabel}</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  align="start"
                  className="w-auto max-w-[calc(100vw-2rem)] p-0"
                >
                  <Calendar
                    mode="range"
                    numberOfMonths={1}
                    defaultMonth={range?.from ?? new Date(2025, 2, 1)}
                    selected={range}
                    onSelect={(next) => {
                      setRange(next);
                      setPage(1);
                    }}
                    autoFocus
                  />
                  <div className="flex items-center justify-between gap-2 border-t p-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={!range?.from}
                      onClick={() => {
                        setRange(undefined);
                        setPage(1);
                      }}
                    >
                      Clear dates
                    </Button>
                    <Button size="sm" onClick={() => setCalendarOpen(false)}>
                      Done
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex min-w-0 flex-1 flex-col gap-1.5 lg:min-w-60">
              <Label
                htmlFor={searchId}
                className="text-xs font-medium text-muted-foreground"
              >
                Search
              </Label>
              <InputGroup>
                <InputGroupAddon>
                  <SearchIcon aria-hidden="true" />
                </InputGroupAddon>
                <InputGroupInput
                  id={searchId}
                  type="search"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Order, customer, email or product"
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

            {hasFilters && (
              <Button
                variant="ghost"
                onClick={clearFilters}
                className="self-start lg:self-end"
              >
                <XIcon aria-hidden="true" />
                Reset filters
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="px-0 sm:px-6">
          <div className="border-y sm:rounded-md sm:border">
            <Table aria-describedby="orders-summary">
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  {COLUMNS.map((col) => {
                    const active = sortKey === col.key;
                    const ariaSort = active
                      ? sortDir === "asc"
                        ? "ascending"
                        : "descending"
                      : "none";
                    const Icon = !active
                      ? ArrowUpDownIcon
                      : sortDir === "asc"
                        ? ArrowUpIcon
                        : ArrowDownIcon;
                    return (
                      <TableHead
                        key={col.key}
                        aria-sort={ariaSort}
                        className={cn(
                          "px-2",
                          col.align === "right" && "text-right",
                          col.key === "id" && "pl-4 sm:pl-3",
                          col.key === "amount" && "pr-4 sm:pr-3",
                        )}
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleSort(col.key)}
                          className={cn(
                            "-mx-2 h-8 px-2 font-medium",
                            col.align === "right" && "flex-row-reverse",
                          )}
                        >
                          {col.label}
                          <Icon
                            aria-hidden="true"
                            className={cn(
                              "size-3.5",
                              active ? "opacity-100" : "opacity-40",
                            )}
                          />
                          <span className="sr-only">
                            {active
                              ? `, sorted ${sortDir === "asc" ? "ascending" : "descending"}. Activate to reverse.`
                              : ", not sorted. Activate to sort ascending."}
                          </span>
                        </Button>
                      </TableHead>
                    );
                  })}
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageRows.length > 0 ? (
                  pageRows.map((o) => (
                    <TableRow key={o.id}>
                      <TableCell className="pl-4 font-mono text-xs sm:pl-3">
                        {o.id}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{o.customer}</span>
                          <span className="text-xs text-muted-foreground">
                            {o.email}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{o.product}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={STATUS_STYLES[o.status]}
                        >
                          {STATUS_LABELS[o.status]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        <time dateTime={o.date}>{formatISO(o.date)}</time>
                      </TableCell>
                      <TableCell className="pr-4 text-right font-medium tabular-nums sm:pr-3">
                        {currencyFormatter.format(o.amount / 100)}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={COLUMNS.length} className="p-0">
                      <Empty className="py-10 md:py-14">
                        <EmptyHeader>
                          <EmptyMedia variant="icon">
                            <PackageSearchIcon aria-hidden="true" />
                          </EmptyMedia>
                          <EmptyTitle>No orders match your filters</EmptyTitle>
                          <EmptyDescription>
                            Try a different status, widen the date range, or
                            check the spelling of your search.
                          </EmptyDescription>
                        </EmptyHeader>
                        <EmptyContent>
                          <Button variant="outline" onClick={clearFilters}>
                            Reset filters
                          </Button>
                        </EmptyContent>
                      </Empty>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>

        {/* Footer: summary, page size, pagination */}
        <div className="flex flex-col gap-4 px-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
            <p
              id="orders-summary"
              role="status"
              aria-live="polite"
              className="text-sm text-muted-foreground"
            >
              {sorted.length === 0
                ? "No results"
                : `Showing ${showingFrom}–${showingTo} of ${sorted.length}`}
            </p>
            <div className="flex items-center gap-2">
              <Label
                htmlFor="orders-page-size"
                className="text-sm text-muted-foreground"
              >
                Rows per page
              </Label>
              <Select
                value={String(pageSize)}
                onValueChange={(v) => {
                  setPageSize(Number(v));
                  setPage(1);
                }}
              >
                <SelectTrigger
                  id="orders-page-size"
                  size="sm"
                  className="w-[4.5rem]"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAGE_SIZES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Pagination className="mx-0 w-auto justify-start lg:justify-end">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  aria-disabled={currentPage === 1}
                  tabIndex={currentPage === 1 ? -1 : undefined}
                  className={cn(
                    currentPage === 1 && "pointer-events-none opacity-50",
                  )}
                  onClick={(e) => {
                    e.preventDefault();
                    goTo(currentPage - 1);
                  }}
                />
              </PaginationItem>
              {getPageItems(currentPage, pageCount).map((p, i) =>
                p === null ? (
                  <PaginationItem key={`gap-${i}`} className="hidden sm:block">
                    <PaginationEllipsis />
                  </PaginationItem>
                ) : (
                  <PaginationItem
                    key={p}
                    className={cn(
                      p !== currentPage &&
                        p !== 1 &&
                        p !== pageCount &&
                        "hidden sm:block",
                    )}
                  >
                    <PaginationLink
                      href="#"
                      isActive={p === currentPage}
                      aria-label={`Go to page ${p}`}
                      onClick={(e) => {
                        e.preventDefault();
                        goTo(p);
                      }}
                    >
                      {p}
                    </PaginationLink>
                  </PaginationItem>
                ),
              )}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  aria-disabled={currentPage === pageCount}
                  tabIndex={currentPage === pageCount ? -1 : undefined}
                  className={cn(
                    currentPage === pageCount && "pointer-events-none opacity-50",
                  )}
                  onClick={(e) => {
                    e.preventDefault();
                    goTo(currentPage + 1);
                  }}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </Card>
    </main>
  );
}
```