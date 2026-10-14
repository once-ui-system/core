The pagination component's links are anchors, so I'll use `Button` for page controls to keep them real buttons. Writing the file now.

```tsx
"use client";

import * as React from "react";
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
  FileSearchIcon,
  SearchIcon,
  XIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardAction,
} from "@/components/ui/card";
import {
  Empty,
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
import { toast } from "sonner";

type Status = "paid" | "pending" | "overdue" | "draft";
type StatusFilter = "all" | Status;

interface Invoice {
  id: string;
  customer: string;
  email: string;
  plan: string;
  status: Status;
  amount: number;
  issued: string; // ISO yyyy-mm-dd
}

type SortKey = "id" | "customer" | "plan" | "status" | "amount" | "issued";
type SortDir = "asc" | "desc";

const INVOICES: Invoice[] = [
  { id: "INV-2041", customer: "Marta Kowalski", email: "marta@northwind.io", plan: "Business", status: "paid", amount: 1280.0, issued: "2025-06-02" },
  { id: "INV-2042", customer: "Devon Okafor", email: "devon@brightlane.co", plan: "Starter", status: "pending", amount: 149.0, issued: "2025-06-03" },
  { id: "INV-2043", customer: "Priya Raman", email: "priya@helixlabs.dev", plan: "Enterprise", status: "paid", amount: 5400.0, issued: "2025-06-05" },
  { id: "INV-2044", customer: "Lukas Brandt", email: "lukas@feldmann.de", plan: "Business", status: "overdue", amount: 1280.0, issued: "2025-05-14" },
  { id: "INV-2045", customer: "Hana Watanabe", email: "hana@kumoworks.jp", plan: "Pro", status: "paid", amount: 480.0, issued: "2025-06-08" },
  { id: "INV-2046", customer: "Samuel Duarte", email: "sam@duartestudio.com", plan: "Starter", status: "draft", amount: 149.0, issued: "2025-06-09" },
  { id: "INV-2047", customer: "Isabelle Fontaine", email: "isabelle@maisonfi.fr", plan: "Pro", status: "pending", amount: 480.0, issued: "2025-06-10" },
  { id: "INV-2048", customer: "Omar Haddad", email: "omar@desertline.ae", plan: "Enterprise", status: "paid", amount: 7250.0, issued: "2025-06-11" },
  { id: "INV-2049", customer: "Grace Mitchell", email: "grace@pinecrest.org", plan: "Starter", status: "paid", amount: 149.0, issued: "2025-06-12" },
  { id: "INV-2050", customer: "Tomás Herrera", email: "tomas@sierra.mx", plan: "Business", status: "overdue", amount: 1280.0, issued: "2025-05-20" },
  { id: "INV-2051", customer: "Anika Sørensen", email: "anika@fjordtech.no", plan: "Pro", status: "paid", amount: 480.0, issued: "2025-06-15" },
  { id: "INV-2052", customer: "Callum Reid", email: "callum@reidandco.uk", plan: "Business", status: "pending", amount: 1280.0, issued: "2025-06-16" },
  { id: "INV-2053", customer: "Mei Lin Zhao", email: "meilin@lotusdata.cn", plan: "Enterprise", status: "paid", amount: 6100.0, issued: "2025-06-17" },
  { id: "INV-2054", customer: "Jonas Eriksson", email: "jonas@nordbyte.se", plan: "Starter", status: "draft", amount: 149.0, issued: "2025-06-18" },
  { id: "INV-2055", customer: "Fatima Zahra", email: "fatima@atlasgroup.ma", plan: "Pro", status: "paid", amount: 480.0, issued: "2025-06-19" },
  { id: "INV-2056", customer: "Noah Bennett", email: "noah@bennettbuilds.com", plan: "Business", status: "paid", amount: 1280.0, issued: "2025-06-21" },
  { id: "INV-2057", customer: "Chiara Romano", email: "chiara@romanodesign.it", plan: "Pro", status: "overdue", amount: 480.0, issued: "2025-05-28" },
  { id: "INV-2058", customer: "Ethan Park", email: "ethan@parkventures.kr", plan: "Enterprise", status: "pending", amount: 5400.0, issued: "2025-06-23" },
  { id: "INV-2059", customer: "Zoe Alvarez", email: "zoe@alvarezlaw.com", plan: "Starter", status: "paid", amount: 149.0, issued: "2025-06-24" },
  { id: "INV-2060", customer: "Rahul Mehta", email: "rahul@mehtalogistics.in", plan: "Business", status: "paid", amount: 1280.0, issued: "2025-06-25" },
  { id: "INV-2061", customer: "Sofia Petrova", email: "sofia@volgasoft.eu", plan: "Pro", status: "pending", amount: 480.0, issued: "2025-06-26" },
  { id: "INV-2062", customer: "Liam O'Connor", email: "liam@oconnorfoods.ie", plan: "Starter", status: "overdue", amount: 149.0, issued: "2025-05-30" },
  { id: "INV-2063", customer: "Aisha Bello", email: "aisha@lagosloop.ng", plan: "Business", status: "paid", amount: 1280.0, issued: "2025-06-27" },
  { id: "INV-2064", customer: "Felix Wagner", email: "felix@wagnerwerk.at", plan: "Enterprise", status: "draft", amount: 6900.0, issued: "2025-06-28" },
  { id: "INV-2065", customer: "Camila Torres", email: "camila@andescloud.cl", plan: "Pro", status: "paid", amount: 480.0, issued: "2025-06-29" },
  { id: "INV-2066", customer: "Yusuf Demir", email: "yusuf@bosphorus.tr", plan: "Starter", status: "pending", amount: 149.0, issued: "2025-06-30" },
];

const STATUS_LABEL: Record<Status, string> = {
  paid: "Paid",
  pending: "Pending",
  overdue: "Overdue",
  draft: "Draft",
};

const STATUS_ORDER: Record<Status, number> = {
  overdue: 0,
  pending: 1,
  draft: 2,
  paid: 3,
};

const STATUS_STYLE: Record<Status, string> = {
  paid: "border-emerald-600/20 bg-emerald-50 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-950/40 dark:text-emerald-300",
  pending:
    "border-amber-600/20 bg-amber-50 text-amber-700 dark:border-amber-400/20 dark:bg-amber-950/40 dark:text-amber-300",
  overdue:
    "border-red-600/20 bg-red-50 text-red-700 dark:border-red-400/20 dark:bg-red-950/40 dark:text-red-300",
  draft: "border-border bg-muted text-muted-foreground",
};

const PAGE_SIZES = ["5", "10", "25"];

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const dateFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

function parseISO(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function formatISO(iso: string): string {
  return dateFormat.format(parseISO(iso));
}

function toISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatLocalDate(date: Date): string {
  return dateFormat.format(
    new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())),
  );
}

function compare(a: Invoice, b: Invoice, key: SortKey): number {
  switch (key) {
    case "amount":
      return a.amount - b.amount;
    case "status":
      return STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
    case "issued":
      return a.issued.localeCompare(b.issued);
    case "id":
    case "customer":
    case "plan":
      return a[key].localeCompare(b[key]);
  }
}

function SortableHead({
  label,
  sortKey,
  active,
  dir,
  onSort,
  className,
  align = "left",
}: {
  label: string;
  sortKey: SortKey;
  active: SortKey;
  dir: SortDir;
  onSort: (key: SortKey) => void;
  className?: string;
  align?: "left" | "right";
}) {
  const isActive = active === sortKey;
  const Icon = !isActive
    ? ArrowUpDownIcon
    : dir === "asc"
      ? ArrowUpIcon
      : ArrowDownIcon;

  return (
    <TableHead
      aria-sort={
        isActive ? (dir === "asc" ? "ascending" : "descending") : "none"
      }
      className={cn(align === "right" && "text-right", className)}
    >
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => onSort(sortKey)}
        className={cn(
          "-mx-3 h-8 font-medium",
          align === "right" && "flex-row-reverse",
          isActive ? "text-foreground" : "text-muted-foreground",
        )}
      >
        {label}
        <Icon
          aria-hidden="true"
          className={cn("size-3.5", !isActive && "opacity-60")}
        />
        <span className="sr-only">
          {isActive
            ? `, sorted ${dir === "asc" ? "ascending" : "descending"}. Activate to reverse.`
            : ", not sorted. Activate to sort ascending."}
        </span>
      </Button>
    </TableHead>
  );
}

export default function InvoicesPage() {
  const [status, setStatus] = React.useState<StatusFilter>("all");
  const [query, setQuery] = React.useState("");
  const [range, setRange] = React.useState<DateRange | undefined>(undefined);
  const [dateOpen, setDateOpen] = React.useState(false);
  const [sortKey, setSortKey] = React.useState<SortKey>("issued");
  const [sortDir, setSortDir] = React.useState<SortDir>("desc");
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState("10");

  const size = Number(pageSize);

  // Rows matching search + date range (used for the status counts).
  const baseRows = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    const from = range?.from ? toISO(range.from) : null;
    const to = range?.to ? toISO(range.to) : from;
    return INVOICES.filter((inv) => {
      if (
        q &&
        !(
          inv.id.toLowerCase().includes(q) ||
          inv.customer.toLowerCase().includes(q) ||
          inv.email.toLowerCase().includes(q)
        )
      ) {
        return false;
      }
      if (from && inv.issued < from) return false;
      if (to && inv.issued > to) return false;
      return true;
    });
  }, [query, range]);

  const counts = React.useMemo(() => {
    const c: Record<StatusFilter, number> = {
      all: baseRows.length,
      paid: 0,
      pending: 0,
      overdue: 0,
      draft: 0,
    };
    for (const inv of baseRows) c[inv.status] += 1;
    return c;
  }, [baseRows]);

  const rows = React.useMemo(() => {
    const filtered =
      status === "all" ? baseRows : baseRows.filter((r) => r.status === status);
    const sorted = [...filtered].sort((a, b) => {
      const result = compare(a, b, sortKey);
      return sortDir === "asc" ? result : -result;
    });
    return sorted;
  }, [baseRows, status, sortKey, sortDir]);

  const pageCount = Math.max(1, Math.ceil(rows.length / size));
  const currentPage = Math.min(page, pageCount);
  const startIndex = (currentPage - 1) * size;
  const pageRows = rows.slice(startIndex, startIndex + size);

  const hasFilters = status !== "all" || query !== "" || range?.from != null;

  const totalShown = React.useMemo(
    () => rows.reduce((sum, r) => sum + r.amount, 0),
    [rows],
  );

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "amount" || key === "issued" ? "desc" : "asc");
    }
    setPage(1);
  }

  function clearFilters() {
    setStatus("all");
    setQuery("");
    setRange(undefined);
    setPage(1);
  }

  const rangeLabel = range?.from
    ? range.to && range.to.getTime() !== range.from.getTime()
      ? `${formatLocalDate(range.from)} – ${formatLocalDate(range.to)}`
      : formatLocalDate(range.from)
    : "Date range";

  // Compact page list: first, last, and neighbours of the current page.
  const pageItems = React.useMemo(() => {
    const items: (number | "gap-start" | "gap-end")[] = [];
    for (let p = 1; p <= pageCount; p++) {
      if (p === 1 || p === pageCount || Math.abs(p - currentPage) <= 1) {
        items.push(p);
      } else if (p < currentPage && items[items.length - 1] !== "gap-start") {
        items.push("gap-start");
      } else if (p > currentPage && items[items.length - 1] !== "gap-end") {
        items.push("gap-end");
      }
    }
    return items;
  }, [pageCount, currentPage]);

  const statusTabs: { value: StatusFilter; label: string }[] = [
    { value: "all", label: "All" },
    { value: "paid", label: "Paid" },
    { value: "pending", label: "Pending" },
    { value: "overdue", label: "Overdue" },
    { value: "draft", label: "Draft" },
  ];

  return (
    <main className="min-h-screen bg-muted/30">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-12">
        <header className="flex flex-col gap-1">
          <p className="text-sm font-medium text-muted-foreground">Billing</p>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Invoices
          </h1>
          <p className="text-sm text-muted-foreground">
            Track what has been billed, what is outstanding, and what needs a
            follow-up.
          </p>
        </header>

        <Card className="gap-4">
          <CardHeader>
            <CardTitle className="text-base">All invoices</CardTitle>
            <CardDescription>
              {rows.length} {rows.length === 1 ? "invoice" : "invoices"} ·{" "}
              {currency.format(totalShown)} total
            </CardDescription>
            <CardAction>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  toast.success("Export started", {
                    description: `${rows.length} invoices will be emailed to you as a CSV.`,
                  })
                }
              >
                <DownloadIcon aria-hidden="true" />
                <span className="hidden sm:inline">Export CSV</span>
                <span className="sr-only sm:hidden">Export CSV</span>
              </Button>
            </CardAction>
          </CardHeader>

          <CardContent className="flex flex-col gap-4">
            {/* Filters row */}
            <div
              role="search"
              aria-label="Filter invoices"
              className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"
            >
              <div className="-mx-1 overflow-x-auto px-1 pb-1 lg:mx-0 lg:overflow-visible lg:px-0 lg:pb-0">
                <ToggleGroup
                  type="single"
                  variant="outline"
                  spacing={0}
                  value={status}
                  onValueChange={(v) => {
                    // Radix emits "" when the active item is pressed again; keep a selection.
                    if (v) {
                      setStatus(v as StatusFilter);
                      setPage(1);
                    }
                  }}
                  aria-label="Filter by status"
                >
                  {statusTabs.map((tab) => (
                    <ToggleGroupItem
                      key={tab.value}
                      value={tab.value}
                      size="sm"
                      className="gap-1.5 data-[state=on]:bg-accent"
                    >
                      {tab.label}
                      <span
                        className="text-xs text-muted-foreground tabular-nums"
                        aria-label={`${counts[tab.value]} invoices`}
                      >
                        {counts[tab.value]}
                      </span>
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <Popover open={dateOpen} onOpenChange={setDateOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start font-normal sm:w-auto sm:min-w-56",
                        !range?.from && "text-muted-foreground",
                      )}
                      aria-label={
                        range?.from
                          ? `Issued date range: ${rangeLabel}. Change date range`
                          : "Choose issued date range"
                      }
                    >
                      <CalendarIcon aria-hidden="true" />
                      <span className="truncate">{rangeLabel}</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    align="end"
                    className="w-auto max-w-[calc(100vw-2rem)] p-0"
                  >
                    <Calendar
                      mode="range"
                      numberOfMonths={1}
                      defaultMonth={range?.from ?? new Date(2025, 5, 1)}
                      selected={range}
                      onSelect={(r) => {
                        setRange(r);
                        setPage(1);
                      }}
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
                        Clear
                      </Button>
                      <Button size="sm" onClick={() => setDateOpen(false)}>
                        Done
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>

                <InputGroup className="sm:w-64">
                  <InputGroupAddon>
                    <SearchIcon aria-hidden="true" />
                  </InputGroupAddon>
                  <InputGroupInput
                    type="search"
                    inputMode="search"
                    placeholder="Search invoice or customer"
                    aria-label="Search invoices by number, customer or email"
                    value={query}
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
                        <XIcon aria-hidden="true" />
                      </InputGroupButton>
                    </InputGroupAddon>
                  )}
                </InputGroup>
              </div>
            </div>

            {/* Table */}
            <div className="rounded-lg border">
              <Table>
                <caption className="sr-only">
                  Invoices, sorted by {sortKey}{" "}
                  {sortDir === "asc" ? "ascending" : "descending"}. Showing{" "}
                  {pageRows.length} of {rows.length}.
                </caption>
                <TableHeader className="bg-muted/50">
                  <TableRow className="hover:bg-transparent">
                    <SortableHead
                      label="Invoice"
                      sortKey="id"
                      active={sortKey}
                      dir={sortDir}
                      onSort={handleSort}
                      className="pl-4"
                    />
                    <SortableHead
                      label="Customer"
                      sortKey="customer"
                      active={sortKey}
                      dir={sortDir}
                      onSort={handleSort}
                    />
                    <SortableHead
                      label="Plan"
                      sortKey="plan"
                      active={sortKey}
                      dir={sortDir}
                      onSort={handleSort}
                      className="hidden md:table-cell"
                    />
                    <SortableHead
                      label="Status"
                      sortKey="status"
                      active={sortKey}
                      dir={sortDir}
                      onSort={handleSort}
                    />
                    <SortableHead
                      label="Issued"
                      sortKey="issued"
                      active={sortKey}
                      dir={sortDir}
                      onSort={handleSort}
                      className="hidden sm:table-cell"
                    />
                    <SortableHead
                      label="Amount"
                      sortKey="amount"
                      active={sortKey}
                      dir={sortDir}
                      onSort={handleSort}
                      align="right"
                      className="pr-4"
                    />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pageRows.map((inv) => (
                    <TableRow key={inv.id}>
                      <TableCell className="pl-4 font-mono text-xs font-medium">
                        {inv.id}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{inv.customer}</span>
                          <span className="max-w-40 truncate text-xs text-muted-foreground sm:max-w-none">
                            {inv.email}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden text-muted-foreground md:table-cell">
                        {inv.plan}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={STATUS_STYLE[inv.status]}
                        >
                          {STATUS_LABEL[inv.status]}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden text-muted-foreground sm:table-cell">
                        <time dateTime={inv.issued}>
                          {formatISO(inv.issued)}
                        </time>
                      </TableCell>
                      <TableCell className="pr-4 text-right font-medium tabular-nums">
                        {currency.format(inv.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {pageRows.length === 0 && (
                <Empty className="border-t py-12">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <FileSearchIcon aria-hidden="true" />
                    </EmptyMedia>
                    <EmptyTitle>No invoices found</EmptyTitle>
                    <EmptyDescription>
                      Nothing matches the current filters. Try a different
                      status, widen the date range, or search for something
                      else.
                    </EmptyDescription>
                  </EmptyHeader>
                  {hasFilters && (
                    <Button variant="outline" size="sm" onClick={clearFilters}>
                      Clear all filters
                    </Button>
                  )}
                </Empty>
              )}
            </div>

            {/* Pagination */}
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <p aria-live="polite" role="status">
                  {rows.length === 0
                    ? "0 results"
                    : `${startIndex + 1}–${Math.min(
                        startIndex + size,
                        rows.length,
                      )} of ${rows.length}`}
                </p>
                <div className="flex items-center gap-2">
                  <label htmlFor="page-size" className="whitespace-nowrap">
                    Rows per page
                  </label>
                  <Select
                    value={pageSize}
                    onValueChange={(v) => {
                      setPageSize(v);
                      setPage(1);
                    }}
                  >
                    <SelectTrigger id="page-size" size="sm" className="w-16">
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

              <nav aria-label="Pagination">
                <ul className="flex items-center gap-1">
                  <li className="hidden sm:block">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Go to first page"
                      disabled={currentPage === 1}
                      onClick={() => setPage(1)}
                    >
                      <ChevronsLeftIcon aria-hidden="true" />
                    </Button>
                  </li>
                  <li>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Go to previous page"
                      disabled={currentPage === 1}
                      onClick={() => setPage(currentPage - 1)}
                    >
                      <ChevronLeftIcon aria-hidden="true" />
                    </Button>
                  </li>
                  {pageItems.map((item) =>
                    typeof item === "number" ? (
                      <li key={item}>
                        <Button
                          variant={item === currentPage ? "outline" : "ghost"}
                          size="icon-sm"
                          aria-label={`Page ${item}`}
                          aria-current={
                            item === currentPage ? "page" : undefined
                          }
                          onClick={() => setPage(item)}
                          className="tabular-nums"
                        >
                          {item}
                        </Button>
                      </li>
                    ) : (
                      <li
                        key={item}
                        aria-hidden="true"
                        className="px-1 text-muted-foreground"
                      >
                        …
                      </li>
                    ),
                  )}
                  <li>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Go to next page"
                      disabled={currentPage === pageCount}
                      onClick={() => setPage(currentPage + 1)}
                    >
                      <ChevronRightIcon aria-hidden="true" />
                    </Button>
                  </li>
                  <li className="hidden sm:block">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Go to last page"
                      disabled={currentPage === pageCount}
                      onClick={() => setPage(pageCount)}
                    >
                      <ChevronsRightIcon aria-hidden="true" />
                    </Button>
                  </li>
                </ul>
              </nav>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
```