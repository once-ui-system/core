"use client";

import * as React from "react";
import {
  addDays,
  endOfDay,
  format,
  isAfter,
  isBefore,
  startOfDay,
  subDays,
} from "date-fns";
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
  DownloadIcon,
  InboxIcon,
  SearchIcon,
  XIcon,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
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

/* ------------------------------------------------------------------ */
/* Data                                                                */
/* ------------------------------------------------------------------ */

type OrderStatus = "paid" | "pending" | "refunded" | "failed";
type StatusFilter = "all" | OrderStatus;

interface Order {
  id: string;
  customer: string;
  email: string;
  plan: string;
  status: OrderStatus;
  amount: number;
  date: Date;
}

const TODAY = startOfDay(new Date(2025, 5, 18));

const CUSTOMERS: ReadonlyArray<readonly [string, string]> = [
  ["Amara Okafor", "amara@northwind.example"],
  ["Lucas Meyer", "lucas.meyer@brightloop.example"],
  ["Sofia Marchetti", "sofia@tavolo.example"],
  ["Daniel Kim", "dkim@orbitlabs.example"],
  ["Priya Raman", "priya@lumenworks.example"],
  ["Tomás Herrera", "tomas@casaverde.example"],
  ["Hannah Fischer", "hannah@kestrel.example"],
  ["Yuki Tanaka", "yuki@paperkite.example"],
  ["Oliver Grant", "oliver@harborline.example"],
  ["Fatima Zahra", "fatima@atlasgrid.example"],
  ["Noah Bergström", "noah@fjordworks.example"],
  ["Chloé Dubois", "chloe@maisonclair.example"],
  ["Ethan Walker", "ethan@summitpath.example"],
  ["Mei Lin", "mei@quillstack.example"],
  ["Rafael Costa", "rafael@solmar.example"],
  ["Isla Campbell", "isla@thistle.example"],
];

const PLANS: ReadonlyArray<readonly [string, number]> = [
  ["Starter", 29],
  ["Team", 149],
  ["Business", 499],
  ["Enterprise", 1290],
];

const STATUS_CYCLE: ReadonlyArray<OrderStatus> = [
  "paid",
  "paid",
  "pending",
  "paid",
  "failed",
  "paid",
  "refunded",
  "pending",
  "paid",
  "paid",
];

const ORDERS: ReadonlyArray<Order> = Array.from({ length: 64 }, (_, i) => {
  const [customer, email] = CUSTOMERS[(i * 5 + 3) % CUSTOMERS.length];
  const [plan, base] = PLANS[(i * 7 + 1) % PLANS.length];
  const seats = 1 + ((i * 3) % 5);
  return {
    id: `ORD-${String(10420 + i * 7).padStart(5, "0")}`,
    customer,
    email,
    plan,
    status: STATUS_CYCLE[(i * 3 + 1) % STATUS_CYCLE.length],
    amount: base * seats + ((i * 13) % 40),
    date: subDays(TODAY, (i * 11) % 88),
  };
});

const STATUS_OPTIONS: ReadonlyArray<{ value: StatusFilter; label: string }> = [
  { value: "all", label: "All" },
  { value: "paid", label: "Paid" },
  { value: "pending", label: "Pending" },
  { value: "refunded", label: "Refunded" },
  { value: "failed", label: "Failed" },
];

const STATUS_STYLES: Record<OrderStatus, string> = {
  paid: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  pending: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  refunded: "bg-sky-500/10 text-sky-700 dark:text-sky-400",
  failed: "bg-destructive/10 text-destructive",
};

const STATUS_DOT: Record<OrderStatus, string> = {
  paid: "bg-emerald-500",
  pending: "bg-amber-500",
  refunded: "bg-sky-500",
  failed: "bg-destructive",
};

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

/* ------------------------------------------------------------------ */
/* Sorting                                                             */
/* ------------------------------------------------------------------ */

type SortKey = "id" | "customer" | "plan" | "status" | "date" | "amount";
type SortDir = "asc" | "desc";

interface Column {
  key: SortKey;
  label: string;
  align?: "right";
  className?: string;
}

const COLUMNS: ReadonlyArray<Column> = [
  { key: "id", label: "Order" },
  { key: "customer", label: "Customer" },
  { key: "plan", label: "Plan", className: "hidden md:table-cell" },
  { key: "status", label: "Status" },
  { key: "date", label: "Date", className: "hidden sm:table-cell" },
  { key: "amount", label: "Amount", align: "right" },
];

function compareOrders(a: Order, b: Order, key: SortKey): number {
  switch (key) {
    case "date":
      return a.date.getTime() - b.date.getTime();
    case "amount":
      return a.amount - b.amount;
    default:
      return a[key].localeCompare(b[key]);
  }
}

const PAGE_SIZES = ["5", "10", "20"] as const;

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function Page() {
  const [status, setStatus] = React.useState<StatusFilter>("all");
  const [range, setRange] = React.useState<DateRange | undefined>(undefined);
  const [query, setQuery] = React.useState("");
  const [sort, setSort] = React.useState<{ key: SortKey; dir: SortDir }>({
    key: "date",
    dir: "desc",
  });
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState<string>("10");

  const searchId = React.useId();

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    const rows = ORDERS.filter((o) => {
      if (status !== "all" && o.status !== status) return false;
      if (range?.from && isBefore(o.date, startOfDay(range.from))) return false;
      if (range?.from && isAfter(o.date, endOfDay(range.to ?? range.from)))
        return false;
      if (
        q &&
        !(
          o.customer.toLowerCase().includes(q) ||
          o.email.toLowerCase().includes(q) ||
          o.id.toLowerCase().includes(q)
        )
      )
        return false;
      return true;
    });
    const factor = sort.dir === "asc" ? 1 : -1;
    return [...rows].sort(
      (a, b) =>
        factor * compareOrders(a, b, sort.key) ||
        a.id.localeCompare(b.id) * factor,
    );
  }, [status, range, query, sort]);

  const size = Number(pageSize);
  const pageCount = Math.max(1, Math.ceil(filtered.length / size));
  const currentPage = Math.min(page, pageCount);
  const startIndex = (currentPage - 1) * size;
  const pageRows = filtered.slice(startIndex, startIndex + size);

  const totalAmount = filtered.reduce((sum, o) => sum + o.amount, 0);
  const hasFilters = status !== "all" || !!range?.from || query.trim() !== "";

  function toggleSort(key: SortKey) {
    setSort((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { key, dir: key === "amount" || key === "date" ? "desc" : "asc" },
    );
    setPage(1);
  }

  function clearFilters() {
    setStatus("all");
    setRange(undefined);
    setQuery("");
    setPage(1);
  }

  const rangeLabel = range?.from
    ? range.to
      ? `${format(range.from, "MMM d, yyyy")} – ${format(range.to, "MMM d, yyyy")}`
      : format(range.from, "MMM d, yyyy")
    : "Pick a date range";

  const presets: ReadonlyArray<{ label: string; days: number }> = [
    { label: "Last 7 days", days: 7 },
    { label: "Last 30 days", days: 30 },
    { label: "Last 90 days", days: 90 },
  ];

  const pageNumbers = React.useMemo(() => {
    const pages: Array<number | "gap-start" | "gap-end"> = [];
    const add = (n: number) => pages.push(n);
    if (pageCount <= 7) {
      for (let i = 1; i <= pageCount; i++) add(i);
    } else {
      add(1);
      if (currentPage > 3) pages.push("gap-start");
      const from = Math.max(2, currentPage - 1);
      const to = Math.min(pageCount - 1, currentPage + 1);
      for (let i = from; i <= to; i++) add(i);
      if (currentPage < pageCount - 2) pages.push("gap-end");
      add(pageCount);
    }
    return pages;
  }, [currentPage, pageCount]);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <header className="mb-6">
        <p className="text-sm font-medium text-muted-foreground">Billing</p>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Orders
        </h1>
        <p className="mt-1 max-w-prose text-sm text-muted-foreground">
          Review subscription payments across your workspace. Filter by status
          or date, search for a customer, and sort any column.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>
            <h2>Recent orders</h2>
          </CardTitle>
          <CardDescription>
            {filtered.length} {filtered.length === 1 ? "order" : "orders"} ·{" "}
            {currency.format(totalAmount)} total
          </CardDescription>
          <CardAction>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                toast.success("Export started", {
                  description: `${filtered.length} orders will be emailed to you as a CSV.`,
                })
              }
            >
              <DownloadIcon />
              <span className="hidden sm:inline">Export CSV</span>
              <span className="sr-only sm:hidden">Export CSV</span>
            </Button>
          </CardAction>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          {/* Filters row */}
          <div
            role="search"
            aria-label="Filter orders"
            className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"
          >
            <div className="max-w-full overflow-x-auto pb-1 lg:pb-0">
              <ToggleGroup
                type="single"
                variant="outline"
                spacing={0}
                value={status}
                onValueChange={(v) => {
                  if (!v) return;
                  setStatus(v as StatusFilter);
                  setPage(1);
                }}
                aria-label="Filter by status"
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

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    data-empty={!range?.from}
                    aria-label={`Date range: ${rangeLabel}`}
                    className="w-full justify-start font-normal data-[empty=true]:text-muted-foreground sm:w-64"
                  >
                    <CalendarIcon />
                    <span className="truncate">{rangeLabel}</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  align="end"
                  className="w-auto max-w-[calc(100vw-2rem)] p-0"
                >
                  <div className="flex flex-wrap gap-1 border-b p-2">
                    {presets.map((p) => (
                      <Button
                        key={p.label}
                        variant="ghost"
                        size="xs"
                        onClick={() => {
                          setRange({
                            from: subDays(TODAY, p.days - 1),
                            to: TODAY,
                          });
                          setPage(1);
                        }}
                      >
                        {p.label}
                      </Button>
                    ))}
                    <Button
                      variant="ghost"
                      size="xs"
                      disabled={!range}
                      onClick={() => {
                        setRange(undefined);
                        setPage(1);
                      }}
                    >
                      Clear
                    </Button>
                  </div>
                  <Calendar
                    mode="range"
                    numberOfMonths={1}
                    defaultMonth={range?.from ?? addDays(TODAY, -30)}
                    selected={range}
                    onSelect={(r) => {
                      setRange(r);
                      setPage(1);
                    }}
                    disabled={{ after: TODAY }}
                  />
                </PopoverContent>
              </Popover>

              <div className="sm:w-64">
                <label htmlFor={searchId} className="sr-only">
                  Search orders by customer, email or order number
                </label>
                <InputGroup>
                  <InputGroupAddon>
                    <SearchIcon aria-hidden />
                  </InputGroupAddon>
                  <InputGroupInput
                    id={searchId}
                    type="search"
                    placeholder="Search customer or order"
                    value={query}
                    autoComplete="off"
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setPage(1);
                    }}
                    className="[&::-webkit-search-cancel-button]:hidden"
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
                        <XIcon />
                      </InputGroupButton>
                    </InputGroupAddon>
                  )}
                </InputGroup>
              </div>
            </div>
          </div>

          {hasFilters && (
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="text-muted-foreground">Active filters:</span>
              {status !== "all" && (
                <Badge variant="secondary" className="capitalize">
                  {status}
                </Badge>
              )}
              {range?.from && <Badge variant="secondary">{rangeLabel}</Badge>}
              {query.trim() && (
                <Badge variant="secondary">“{query.trim()}”</Badge>
              )}
              <Button variant="link" size="xs" onClick={clearFilters}>
                Reset all
              </Button>
            </div>
          )}

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow className="hover:bg-transparent">
                  {COLUMNS.map((col) => {
                    const active = sort.key === col.key;
                    const ariaSort = active
                      ? sort.dir === "asc"
                        ? "ascending"
                        : "descending"
                      : "none";
                    const Icon = !active
                      ? ArrowUpDownIcon
                      : sort.dir === "asc"
                        ? ArrowUpIcon
                        : ArrowDownIcon;
                    return (
                      <TableHead
                        key={col.key}
                        aria-sort={ariaSort}
                        className={cn(
                          "px-3",
                          col.align === "right" && "text-right",
                          col.className,
                        )}
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleSort(col.key)}
                          className={cn(
                            "-mx-2 h-8 px-2 font-medium",
                            col.align === "right" && "ml-auto flex",
                            active ? "text-foreground" : "text-muted-foreground",
                          )}
                        >
                          {col.label}
                          <Icon
                            aria-hidden
                            className={cn("size-3.5", !active && "opacity-60")}
                          />
                          <span className="sr-only">
                            {active
                              ? `, sorted ${ariaSort}. Activate to reverse.`
                              : ", not sorted. Activate to sort."}
                          </span>
                        </Button>
                      </TableHead>
                    );
                  })}
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageRows.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell className="px-3 font-mono text-xs">
                      {o.id}
                    </TableCell>
                    <TableCell className="px-3">
                      <div className="flex min-w-0 flex-col">
                        <span className="font-medium">{o.customer}</span>
                        <span className="max-w-[12rem] truncate text-xs text-muted-foreground sm:max-w-[16rem]">
                          {o.email}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden px-3 md:table-cell">
                      {o.plan}
                    </TableCell>
                    <TableCell className="px-3">
                      <Badge
                        variant="outline"
                        className={cn(
                          "border-transparent capitalize",
                          STATUS_STYLES[o.status],
                        )}
                      >
                        <span
                          aria-hidden
                          className={cn(
                            "size-1.5 rounded-full",
                            STATUS_DOT[o.status],
                          )}
                        />
                        {o.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden px-3 text-muted-foreground sm:table-cell">
                      <time dateTime={format(o.date, "yyyy-MM-dd")}>
                        {format(o.date, "MMM d, yyyy")}
                      </time>
                    </TableCell>
                    <TableCell className="px-3 text-right tabular-nums">
                      {currency.format(o.amount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {pageRows.length === 0 && (
              <Empty className="border-t">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <InboxIcon />
                  </EmptyMedia>
                  <EmptyTitle>No orders match your filters</EmptyTitle>
                  <EmptyDescription>
                    Try a different status, widen the date range, or check the
                    spelling of your search.
                  </EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  <Button variant="outline" size="sm" onClick={clearFilters}>
                    Reset filters
                  </Button>
                </EmptyContent>
              </Empty>
            )}
          </div>

          <p className="sr-only" role="status" aria-live="polite">
            Showing {pageRows.length} of {filtered.length} orders, page{" "}
            {currentPage} of {pageCount}.
          </p>
        </CardContent>

        <CardFooter className="flex-col gap-4 lg:flex-row lg:justify-between">
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
            <span aria-hidden>
              {filtered.length === 0
                ? "0 results"
                : `${startIndex + 1}–${startIndex + pageRows.length} of ${filtered.length}`}
            </span>
            <div className="flex items-center gap-2">
              <span id="rows-per-page">Rows per page</span>
              <Select
                value={pageSize}
                onValueChange={(v) => {
                  setPageSize(v);
                  setPage(1);
                }}
              >
                <SelectTrigger
                  size="sm"
                  className="w-[4.5rem]"
                  aria-labelledby="rows-per-page"
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

          <nav aria-label="Pagination" className="max-w-full">
            <ul className="flex flex-wrap items-center justify-center gap-1">
              <li>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="First page"
                  disabled={currentPage === 1}
                  onClick={() => setPage(1)}
                  className="hidden sm:inline-flex"
                >
                  <ChevronsLeftIcon />
                </Button>
              </li>
              <li>
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label="Previous page"
                  disabled={currentPage === 1}
                  onClick={() => setPage(currentPage - 1)}
                >
                  <ChevronLeftIcon />
                  <span className="hidden sm:inline">Previous</span>
                </Button>
              </li>
              {pageNumbers.map((p) =>
                typeof p === "number" ? (
                  <li key={p} className="hidden sm:block">
                    <Button
                      variant={p === currentPage ? "outline" : "ghost"}
                      size="icon-sm"
                      aria-label={`Page ${p}`}
                      aria-current={p === currentPage ? "page" : undefined}
                      onClick={() => setPage(p)}
                    >
                      {p}
                    </Button>
                  </li>
                ) : (
                  <li
                    key={p}
                    aria-hidden
                    className="hidden size-8 items-center justify-center text-muted-foreground sm:flex"
                  >
                    …
                  </li>
                ),
              )}
              <li className="px-2 text-sm text-muted-foreground sm:hidden">
                Page {currentPage} of {pageCount}
              </li>
              <li>
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label="Next page"
                  disabled={currentPage === pageCount}
                  onClick={() => setPage(currentPage + 1)}
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRightIcon />
                </Button>
              </li>
              <li>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Last page"
                  disabled={currentPage === pageCount}
                  onClick={() => setPage(pageCount)}
                  className="hidden sm:inline-flex"
                >
                  <ChevronsRightIcon />
                </Button>
              </li>
            </ul>
          </nav>
        </CardFooter>
      </Card>
    </main>
  );
}
