"use client";

import * as React from "react";
import { format } from "date-fns";
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
  SearchIcon,
  SearchXIcon,
  XIcon,
} from "lucide-react";
import { type DateRange } from "react-day-picker";
import { toast } from "sonner";

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
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*                                    Data                                    */
/* -------------------------------------------------------------------------- */

type Status = "paid" | "pending" | "overdue" | "draft";
type StatusFilter = "all" | Status;

type Invoice = {
  id: string;
  customer: string;
  email: string;
  status: Status;
  amount: number;
  issued: Date;
  due: Date;
};

const STATUS_LABEL: Record<Status, string> = {
  paid: "Paid",
  pending: "Pending",
  overdue: "Overdue",
  draft: "Draft",
};

const STATUS_STYLE: Record<Status, string> = {
  paid: "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300",
  pending:
    "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300",
  overdue:
    "border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-300",
  draft: "border-border bg-muted text-muted-foreground",
};

const STATUS_DOT: Record<Status, string> = {
  paid: "bg-emerald-500",
  pending: "bg-amber-500",
  overdue: "bg-red-500",
  draft: "bg-muted-foreground/60",
};

type Seed = [string, string, Status, number, string, number];

// [customer, email, status, amount, issued (YYYY-MM-DD), net days]
const SEEDS: Seed[] = [
  ["Northwind Logistics", "ap@northwind.example", "paid", 4820.5, "2025-01-06", 30],
  ["Alder & Finch Studio", "billing@alderfinch.example", "paid", 1260, "2025-01-09", 14],
  ["Brightwave Energy", "finance@brightwave.example", "overdue", 18450, "2025-01-14", 30],
  ["Harbor Street Bakery", "hello@harborstreet.example", "paid", 342.75, "2025-01-17", 7],
  ["Meridian Health Group", "payables@meridian.example", "pending", 9275, "2025-01-22", 45],
  ["Copperline Robotics", "ar@copperline.example", "paid", 22100, "2025-01-28", 30],
  ["Juniper Legal LLP", "accounts@juniperlegal.example", "overdue", 3150, "2025-02-03", 14],
  ["Tidewater Marine Co.", "ops@tidewater.example", "paid", 6780.25, "2025-02-05", 30],
  ["Pinecrest Schools", "bursar@pinecrest.example", "pending", 12400, "2025-02-10", 60],
  ["Lumen Photonics", "invoices@lumen.example", "draft", 5600, "2025-02-12", 30],
  ["Oakridge Dental", "office@oakridge.example", "paid", 875, "2025-02-14", 14],
  ["Saffron Table Catering", "events@saffrontable.example", "paid", 2290, "2025-02-19", 14],
  ["Granite Peak Outfitters", "ap@granitepeak.example", "overdue", 7340.8, "2025-02-24", 30],
  ["Velvet Moon Records", "label@velvetmoon.example", "pending", 1980, "2025-03-02", 30],
  ["Atlas Freight Partners", "billing@atlasfreight.example", "paid", 15620, "2025-03-04", 30],
  ["Sunbeam Childcare", "admin@sunbeam.example", "paid", 640, "2025-03-07", 7],
  ["Blue Heron Analytics", "finance@blueheron.example", "pending", 8900, "2025-03-11", 30],
  ["Fernhill Garden Centre", "shop@fernhill.example", "draft", 410.4, "2025-03-13", 14],
  ["Quarry Lane Architects", "studio@quarrylane.example", "paid", 11250, "2025-03-18", 30],
  ["Ironbridge Fabrication", "ap@ironbridge.example", "overdue", 26800, "2025-03-21", 30],
  ["Maple & Main Hardware", "orders@maplemain.example", "paid", 1715.6, "2025-03-25", 14],
  ["Skyline Rooftop Bar", "manager@skylinebar.example", "pending", 3420, "2025-03-28", 21],
  ["Cobalt Cloud Services", "billing@cobaltcloud.example", "paid", 19990, "2025-04-01", 30],
  ["Wren & Willow Florists", "hello@wrenwillow.example", "paid", 298, "2025-04-03", 7],
  ["Redwood Property Mgmt", "rent@redwoodpm.example", "pending", 7450, "2025-04-08", 30],
  ["Kestrel Aerospace", "ap@kestrelaero.example", "paid", 48200, "2025-04-10", 60],
  ["Paper Lantern Print", "jobs@paperlantern.example", "draft", 1180, "2025-04-14", 14],
  ["Summit Physio Clinic", "reception@summitphysio.example", "paid", 1540, "2025-04-17", 14],
  ["Evergreen Co-op Market", "finance@evergreencoop.example", "overdue", 5230.9, "2025-04-22", 30],
  ["Driftwood Surf School", "info@driftwoodsurf.example", "pending", 760, "2025-04-25", 14],
  ["Halcyon Pharmacy", "accounts@halcyonrx.example", "paid", 9640, "2025-05-02", 30],
  ["Vantage Point Media", "ap@vantagepoint.example", "pending", 13500, "2025-05-06", 45],
  ["Silverleaf Accounting", "team@silverleaf.example", "paid", 2100, "2025-05-09", 14],
  ["Bramble Ice Cream", "orders@bramble.example", "paid", 445.2, "2025-05-12", 7],
  ["Foxglove Veterinary", "clinic@foxglovevet.example", "draft", 920, "2025-05-15", 14],
  ["Lighthouse Software", "billing@lighthouse.example", "paid", 31400, "2025-05-20", 30],
  ["Orchard Bay Hotels", "payables@orchardbay.example", "overdue", 16780, "2025-05-23", 30],
  ["Terra Nova Surveying", "office@terranova.example", "pending", 4380, "2025-05-27", 30],
  ["Marlowe Bookshop", "shop@marlowebooks.example", "paid", 212.9, "2025-06-02", 7],
  ["Ember Wood Fired Pizza", "kitchen@emberwood.example", "paid", 1085, "2025-06-05", 14],
  ["Kingfisher Travel", "bookings@kingfisher.example", "pending", 6120, "2025-06-09", 30],
  ["Nimbus Weather Labs", "ap@nimbuslabs.example", "draft", 14250, "2025-06-12", 30],
];

const INVOICES: Invoice[] = SEEDS.map(
  ([customer, email, status, amount, issued, net], index) => {
    const [y, m, d] = issued.split("-").map(Number);
    const issuedDate = new Date(y, m - 1, d);
    const dueDate = new Date(y, m - 1, d + net);
    return {
      id: `INV-${String(2041 + index).padStart(5, "0")}`,
      customer,
      email,
      status,
      amount,
      issued: issuedDate,
      due: dueDate,
    };
  },
);

/* -------------------------------------------------------------------------- */
/*                                   Helpers                                  */
/* -------------------------------------------------------------------------- */

type SortKey = "id" | "customer" | "status" | "amount" | "issued" | "due";
type SortDir = "asc" | "desc";
type SortState = { key: SortKey; dir: SortDir } | null;

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const STATUS_ORDER: Record<Status, number> = {
  overdue: 0,
  pending: 1,
  draft: 2,
  paid: 3,
};

function compare(a: Invoice, b: Invoice, key: SortKey): number {
  switch (key) {
    case "id":
      return a.id.localeCompare(b.id);
    case "customer":
      return a.customer.localeCompare(b.customer);
    case "status":
      return STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
    case "amount":
      return a.amount - b.amount;
    case "issued":
      return a.issued.getTime() - b.issued.getTime();
    case "due":
      return a.due.getTime() - b.due.getTime();
  }
}

function startOfDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

function pageList(current: number, total: number): (number | "gap-start" | "gap-end")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "gap-start" | "gap-end")[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) pages.push("gap-start");
  for (let p = start; p <= end; p++) pages.push(p);
  if (end < total - 1) pages.push("gap-end");
  pages.push(total);
  return pages;
}

function formatRange(range: DateRange | undefined): string | null {
  if (!range?.from) return null;
  if (!range.to) return format(range.from, "LLL d, y");
  return `${format(range.from, "LLL d, y")} – ${format(range.to, "LLL d, y")}`;
}

/* -------------------------------------------------------------------------- */
/*                                    Page                                    */
/* -------------------------------------------------------------------------- */

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "paid", label: "Paid" },
  { value: "pending", label: "Pending" },
  { value: "overdue", label: "Overdue" },
  { value: "draft", label: "Draft" },
];

const PAGE_SIZES = ["5", "10", "20"];

const COLUMNS: { key: SortKey; label: string; align?: "right"; className?: string }[] = [
  { key: "id", label: "Invoice" },
  { key: "customer", label: "Customer" },
  { key: "status", label: "Status" },
  { key: "issued", label: "Issued", className: "hidden md:table-cell" },
  { key: "due", label: "Due", className: "hidden sm:table-cell" },
  { key: "amount", label: "Amount", align: "right" },
];

export default function Page() {
  const [status, setStatus] = React.useState<StatusFilter>("all");
  const [range, setRange] = React.useState<DateRange | undefined>(undefined);
  const [query, setQuery] = React.useState("");
  const [sort, setSort] = React.useState<SortState>({ key: "issued", dir: "desc" });
  const [pageSize, setPageSize] = React.useState("10");
  const [page, setPage] = React.useState(1);
  const [calendarOpen, setCalendarOpen] = React.useState(false);

  const searchId = React.useId();
  const normalizedQuery = query.trim().toLowerCase();

  // Rows matching search + date range, before status filter (used for segment counts).
  const baseRows = React.useMemo(() => {
    const from = range?.from ? startOfDay(range.from) : null;
    const to = range?.to ? startOfDay(range.to) : from;
    return INVOICES.filter((inv) => {
      if (normalizedQuery) {
        const haystack = `${inv.customer} ${inv.id} ${inv.email}`.toLowerCase();
        if (!haystack.includes(normalizedQuery)) return false;
      }
      if (from !== null && to !== null) {
        const t = startOfDay(inv.issued);
        if (t < from || t > to) return false;
      }
      return true;
    });
  }, [normalizedQuery, range]);

  const counts = React.useMemo(() => {
    const result: Record<StatusFilter, number> = {
      all: baseRows.length,
      paid: 0,
      pending: 0,
      overdue: 0,
      draft: 0,
    };
    for (const inv of baseRows) result[inv.status] += 1;
    return result;
  }, [baseRows]);

  const sortedRows = React.useMemo(() => {
    const rows = status === "all" ? baseRows : baseRows.filter((inv) => inv.status === status);
    if (!sort) return rows;
    const factor = sort.dir === "asc" ? 1 : -1;
    return [...rows].sort((a, b) => factor * compare(a, b, sort.key) || a.id.localeCompare(b.id));
  }, [baseRows, status, sort]);

  const size = Number(pageSize);
  const pageCount = Math.max(1, Math.ceil(sortedRows.length / size));
  const currentPage = Math.min(page, pageCount);
  const startIndex = (currentPage - 1) * size;
  const pageRows = sortedRows.slice(startIndex, startIndex + size);
  const total = sortedRows.reduce((sum, inv) => sum + inv.amount, 0);

  const hasFilters = status !== "all" || Boolean(range?.from) || normalizedQuery !== "";
  const rangeLabel = formatRange(range);

  function resetPage() {
    setPage(1);
  }

  function toggleSort(key: SortKey) {
    setSort((prev) => {
      if (!prev || prev.key !== key) return { key, dir: "asc" };
      if (prev.dir === "asc") return { key, dir: "desc" };
      return null;
    });
    resetPage();
  }

  function clearFilters() {
    setStatus("all");
    setRange(undefined);
    setQuery("");
    resetPage();
  }

  function exportCsv() {
    toast.success("Export started", {
      description: `${sortedRows.length} invoice${sortedRows.length === 1 ? "" : "s"} will be emailed to you as CSV.`,
    });
  }

  const pages = pageList(currentPage, pageCount);
  const pageButtonClass =
    "inline-flex size-9 shrink-0 items-center justify-center rounded-md text-sm font-medium transition-all outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground";

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 lg:py-12">
        {/* Header */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium text-muted-foreground">Billing</p>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Invoices</h1>
            <p className="max-w-prose text-sm text-muted-foreground">
              Track what has been billed, what is outstanding, and which customers are running
              late.
            </p>
          </div>
          <Button variant="outline" onClick={exportCsv} className="self-start sm:self-auto">
            <DownloadIcon aria-hidden="true" />
            Export CSV
          </Button>
        </header>

        {/* Filters */}
        <section
          aria-label="Filter invoices"
          className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"
        >
          <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
            <ToggleGroup
              type="single"
              variant="outline"
              value={status}
              onValueChange={(value) => {
                // Radix emits "" when the active item is pressed again; keep a selection.
                if (!value) return;
                setStatus(value as StatusFilter);
                resetPage();
              }}
              aria-label="Filter by status"
              className="w-max"
            >
              {STATUS_FILTERS.map((item) => (
                <ToggleGroupItem
                  key={item.value}
                  value={item.value}
                  aria-label={`${item.label}, ${counts[item.value]} invoices`}
                  className="gap-2"
                >
                  {item.value !== "all" && (
                    <span
                      aria-hidden="true"
                      className={cn("size-1.5 rounded-full", STATUS_DOT[item.value])}
                    />
                  )}
                  {item.label}
                  <span
                    aria-hidden="true"
                    className="text-xs font-normal tabular-nums text-muted-foreground"
                  >
                    {counts[item.value]}
                  </span>
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex items-center gap-1">
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    data-empty={!rangeLabel}
                    aria-label={
                      rangeLabel ? `Issue date range: ${rangeLabel}` : "Select issue date range"
                    }
                    className="min-w-0 flex-1 justify-start text-left font-normal data-[empty=true]:text-muted-foreground sm:w-64 sm:flex-none"
                  >
                    <CalendarIcon aria-hidden="true" />
                    <span className="truncate">{rangeLabel ?? "Issued between…"}</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto max-w-[calc(100vw-2rem)] p-0" align="end">
                  <Calendar
                    mode="range"
                    defaultMonth={range?.from ?? new Date(2025, 2, 1)}
                    selected={range}
                    onSelect={(next) => {
                      setRange(next);
                      resetPage();
                    }}
                    numberOfMonths={2}
                    startMonth={new Date(2025, 0, 1)}
                    endMonth={new Date(2025, 11, 31)}
                    className="[--cell-size:--spacing(9)] sm:[--cell-size:--spacing(8)]"
                  />
                  <div className="flex items-center justify-between gap-2 border-t p-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setRange(undefined);
                        resetPage();
                      }}
                      disabled={!range?.from}
                    >
                      Clear
                    </Button>
                    <Button size="sm" onClick={() => setCalendarOpen(false)}>
                      Done
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
              {range?.from && (
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Clear date range"
                  onClick={() => {
                    setRange(undefined);
                    resetPage();
                  }}
                >
                  <XIcon aria-hidden="true" />
                </Button>
              )}
            </div>

            <InputGroup className="sm:w-64">
              <InputGroupAddon>
                <SearchIcon aria-hidden="true" />
              </InputGroupAddon>
              <InputGroupInput
                id={searchId}
                type="search"
                inputMode="search"
                placeholder="Search customer or invoice…"
                aria-label="Search invoices by customer, invoice number or email"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  resetPage();
                }}
                autoComplete="off"
                className="[&::-webkit-search-cancel-button]:appearance-none"
              />
              {query && (
                <InputGroupAddon align="inline-end">
                  <InputGroupButton
                    size="icon-xs"
                    aria-label="Clear search"
                    onClick={() => {
                      setQuery("");
                      resetPage();
                    }}
                  >
                    <XIcon aria-hidden="true" />
                  </InputGroupButton>
                </InputGroupAddon>
              )}
            </InputGroup>
          </div>
        </section>

        {/* Table */}
        <section aria-label="Invoice results" className="overflow-hidden rounded-xl border bg-card">
          <Table>
            <TableCaption className="sr-only">
              Invoices, sorted
              {sort
                ? ` by ${COLUMNS.find((c) => c.key === sort.key)?.label ?? sort.key}, ${
                    sort.dir === "asc" ? "ascending" : "descending"
                  }`
                : " in original order"}
              . Showing {pageRows.length} of {sortedRows.length} invoices.
            </TableCaption>
            <TableHeader className="bg-muted/40">
              <TableRow className="hover:bg-transparent">
                {COLUMNS.map((col) => {
                  const active = sort?.key === col.key;
                  const ariaSort = active
                    ? sort.dir === "asc"
                      ? "ascending"
                      : "descending"
                    : "none";
                  const Icon = active ? (sort.dir === "asc" ? ArrowUpIcon : ArrowDownIcon) : ArrowUpDownIcon;
                  return (
                    <TableHead
                      key={col.key}
                      aria-sort={ariaSort}
                      className={cn("px-2 first:pl-4 last:pr-4", col.align === "right" && "text-right", col.className)}
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleSort(col.key)}
                        className={cn(
                          "-mx-2 h-8 gap-1.5 px-2 font-medium",
                          col.align === "right" && "flex-row-reverse",
                          !active && "text-muted-foreground",
                        )}
                      >
                        {col.label}
                        <Icon
                          aria-hidden="true"
                          className={cn("size-3.5", !active && "opacity-60")}
                        />
                        <span className="sr-only">
                          {active
                            ? `, sorted ${sort.dir === "asc" ? "ascending" : "descending"}. Activate to ${
                                sort.dir === "asc" ? "sort descending" : "clear sorting"
                              }`
                            : ", not sorted. Activate to sort ascending"}
                        </span>
                      </Button>
                    </TableHead>
                  );
                })}
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageRows.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell className="pl-4 font-mono text-xs text-muted-foreground">
                    {inv.id}
                  </TableCell>
                  <TableCell>
                    <div className="flex min-w-0 flex-col">
                      <span className="max-w-[10rem] truncate font-medium sm:max-w-[16rem]">
                        {inv.customer}
                      </span>
                      <span className="hidden max-w-[16rem] truncate text-xs text-muted-foreground sm:block">
                        {inv.email}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("gap-1.5", STATUS_STYLE[inv.status])}>
                      <span
                        aria-hidden="true"
                        className={cn("size-1.5 rounded-full", STATUS_DOT[inv.status])}
                      />
                      {STATUS_LABEL[inv.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground md:table-cell">
                    <time dateTime={format(inv.issued, "yyyy-MM-dd")}>
                      {format(inv.issued, "MMM d, y")}
                    </time>
                  </TableCell>
                  <TableCell
                    className={cn(
                      "hidden sm:table-cell",
                      inv.status === "overdue" ? "font-medium text-destructive" : "text-muted-foreground",
                    )}
                  >
                    <time dateTime={format(inv.due, "yyyy-MM-dd")}>{format(inv.due, "MMM d, y")}</time>
                  </TableCell>
                  <TableCell className="pr-4 text-right font-medium tabular-nums">
                    {currency.format(inv.amount)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {pageRows.length === 0 && (
            <Empty className="border-t">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <SearchXIcon aria-hidden="true" />
                </EmptyMedia>
                <EmptyTitle>No invoices match</EmptyTitle>
                <EmptyDescription>
                  Try a different search term, widen the date range, or switch the status filter.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button variant="outline" onClick={clearFilters}>
                  Clear all filters
                </Button>
              </EmptyContent>
            </Empty>
          )}
        </section>

        {/* Footer: summary + pagination */}
        <footer className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-1 text-sm text-muted-foreground sm:flex-row sm:items-center sm:gap-4">
            <p role="status" aria-live="polite">
              {sortedRows.length === 0
                ? "0 invoices"
                : `Showing ${startIndex + 1}–${startIndex + pageRows.length} of ${sortedRows.length} invoices`}
              {hasFilters && " (filtered)"}
            </p>
            <p className="tabular-nums">
              Total <span className="font-medium text-foreground">{currency.format(total)}</span>
            </p>
            {hasFilters && (
              <Button variant="link" size="sm" onClick={clearFilters} className="h-auto self-start p-0">
                Reset filters
              </Button>
            )}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between lg:justify-end lg:gap-6">
            <div className="flex items-center gap-2">
              <label htmlFor="rows-per-page" className="text-sm text-muted-foreground">
                Rows per page
              </label>
              <Select
                value={pageSize}
                onValueChange={(value) => {
                  setPageSize(value);
                  resetPage();
                }}
              >
                <SelectTrigger id="rows-per-page" size="sm" className="w-[4.5rem]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAGE_SIZES.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <nav aria-label="Pagination" className="flex items-center">
              <ul className="flex flex-row items-center gap-1">
                <li>
                  <button
                    type="button"
                    className={pageButtonClass}
                    aria-label="Go to first page"
                    disabled={currentPage === 1}
                    onClick={() => setPage(1)}
                  >
                    <ChevronsLeftIcon className="size-4" aria-hidden="true" />
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    className={pageButtonClass}
                    aria-label="Go to previous page"
                    disabled={currentPage === 1}
                    onClick={() => setPage(currentPage - 1)}
                  >
                    <ChevronLeftIcon className="size-4" aria-hidden="true" />
                  </button>
                </li>
                {/* Compact indicator on phones, numbered pages from sm up */}
                <li className="px-2 text-sm tabular-nums sm:hidden" aria-hidden="true">
                  {currentPage} / {pageCount}
                </li>
                {pages.map((p) =>
                  typeof p === "number" ? (
                    <li key={p} className="hidden sm:block">
                      <button
                        type="button"
                        aria-label={`Go to page ${p}`}
                        aria-current={p === currentPage ? "page" : undefined}
                        onClick={() => setPage(p)}
                        className={cn(
                          pageButtonClass,
                          p === currentPage && "border bg-background shadow-xs dark:border-input dark:bg-input/30",
                        )}
                      >
                        {p}
                      </button>
                    </li>
                  ) : (
                    <li
                      key={p}
                      aria-hidden="true"
                      className="hidden size-9 items-center justify-center text-muted-foreground sm:flex"
                    >
                      …
                    </li>
                  ),
                )}
                <li>
                  <button
                    type="button"
                    className={pageButtonClass}
                    aria-label="Go to next page"
                    disabled={currentPage === pageCount}
                    onClick={() => setPage(currentPage + 1)}
                  >
                    <ChevronRightIcon className="size-4" aria-hidden="true" />
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    className={pageButtonClass}
                    aria-label="Go to last page"
                    disabled={currentPage === pageCount}
                    onClick={() => setPage(pageCount)}
                  >
                    <ChevronsRightIcon className="size-4" aria-hidden="true" />
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </footer>
      </div>
    </main>
  );
}
