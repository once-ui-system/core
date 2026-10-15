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
  SearchIcon,
  SearchXIcon,
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

type Status = "Paid" | "Pending" | "Refunded" | "Failed";
type StatusFilter = "All" | Status;
type SortKey = "id" | "customer" | "date" | "status" | "amount";
type SortDir = "asc" | "desc";

interface Order {
  id: string;
  customer: string;
  email: string;
  /** ISO date (yyyy-mm-dd) */
  date: string;
  status: Status;
  amount: number;
}

const ORDERS: Order[] = [
  { id: "ORD-10482", customer: "Amara Okafor", email: "amara.okafor@northwind.example", date: "2025-05-28", status: "Paid", amount: 248.5 },
  { id: "ORD-10481", customer: "Liam Chen", email: "liam.chen@brightloop.example", date: "2025-05-28", status: "Pending", amount: 89.0 },
  { id: "ORD-10479", customer: "Sofia Marchetti", email: "sofia@marchetti-studio.example", date: "2025-05-27", status: "Paid", amount: 1320.0 },
  { id: "ORD-10477", customer: "Noah Williams", email: "noah.w@fernhill.example", date: "2025-05-26", status: "Failed", amount: 54.99 },
  { id: "ORD-10474", customer: "Priya Raman", email: "priya.raman@oakbridge.example", date: "2025-05-25", status: "Paid", amount: 612.75 },
  { id: "ORD-10471", customer: "Mateo García", email: "mateo.garcia@solenta.example", date: "2025-05-24", status: "Refunded", amount: 175.0 },
  { id: "ORD-10469", customer: "Hannah Becker", email: "h.becker@kleinwerk.example", date: "2025-05-23", status: "Paid", amount: 436.2 },
  { id: "ORD-10466", customer: "Yuki Tanaka", email: "yuki.tanaka@tidepool.example", date: "2025-05-22", status: "Pending", amount: 929.0 },
  { id: "ORD-10463", customer: "Oliver Hughes", email: "oliver.hughes@marlow.example", date: "2025-05-21", status: "Paid", amount: 72.4 },
  { id: "ORD-10460", customer: "Fatima Al-Sayed", email: "fatima@alsayed-trading.example", date: "2025-05-20", status: "Paid", amount: 2104.0 },
  { id: "ORD-10457", customer: "Lucas Moreau", email: "lucas.moreau@vignoble.example", date: "2025-05-19", status: "Failed", amount: 310.0 },
  { id: "ORD-10455", customer: "Emma Johansson", email: "emma.j@nordlys.example", date: "2025-05-18", status: "Paid", amount: 158.3 },
  { id: "ORD-10452", customer: "Diego Alvarez", email: "diego.alvarez@cobaltpath.example", date: "2025-05-17", status: "Pending", amount: 487.9 },
  { id: "ORD-10449", customer: "Chloe Dubois", email: "chloe.dubois@lumiere.example", date: "2025-05-16", status: "Refunded", amount: 96.0 },
  { id: "ORD-10446", customer: "Ethan Brooks", email: "ethan.brooks@gridiron.example", date: "2025-05-15", status: "Paid", amount: 744.6 },
  { id: "ORD-10443", customer: "Ingrid Larsen", email: "ingrid.larsen@fjordworks.example", date: "2025-05-14", status: "Paid", amount: 365.0 },
  { id: "ORD-10440", customer: "Kwame Mensah", email: "kwame.mensah@goldcoast.example", date: "2025-05-13", status: "Pending", amount: 1180.25 },
  { id: "ORD-10437", customer: "Isabella Rossi", email: "isabella.rossi@trattoria.example", date: "2025-05-12", status: "Paid", amount: 59.9 },
  { id: "ORD-10434", customer: "Jack Thompson", email: "jack.t@harborlight.example", date: "2025-05-11", status: "Failed", amount: 215.0 },
  { id: "ORD-10431", customer: "Aisha Khan", email: "aisha.khan@crescent.example", date: "2025-05-10", status: "Paid", amount: 882.0 },
  { id: "ORD-10428", customer: "Pedro Santos", email: "pedro.santos@vermelho.example", date: "2025-05-09", status: "Paid", amount: 143.75 },
  { id: "ORD-10425", customer: "Mia Novak", email: "mia.novak@brnolab.example", date: "2025-05-08", status: "Refunded", amount: 402.0 },
  { id: "ORD-10422", customer: "Oscar Lindqvist", email: "oscar.l@stenhus.example", date: "2025-05-07", status: "Paid", amount: 267.4 },
  { id: "ORD-10419", customer: "Zara Ahmed", email: "zara.ahmed@pinecone.example", date: "2025-05-06", status: "Pending", amount: 539.0 },
  { id: "ORD-10416", customer: "William Clarke", email: "will.clarke@stonegate.example", date: "2025-05-05", status: "Paid", amount: 1675.5 },
  { id: "ORD-10413", customer: "Lena Fischer", email: "lena.fischer@rheinblick.example", date: "2025-05-04", status: "Paid", amount: 98.2 },
  { id: "ORD-10410", customer: "Arjun Mehta", email: "arjun.mehta@saffron.example", date: "2025-05-03", status: "Failed", amount: 720.0 },
  { id: "ORD-10407", customer: "Camille Laurent", email: "camille.laurent@atelier.example", date: "2025-05-02", status: "Paid", amount: 189.0 },
  { id: "ORD-10404", customer: "Tomás Silva", email: "tomas.silva@alfama.example", date: "2025-05-01", status: "Paid", amount: 451.3 },
  { id: "ORD-10401", customer: "Grace Murphy", email: "grace.murphy@emeraldisle.example", date: "2025-04-30", status: "Pending", amount: 326.0 },
  { id: "ORD-10398", customer: "Hiro Sato", email: "hiro.sato@kitsune.example", date: "2025-04-29", status: "Paid", amount: 1042.0 },
  { id: "ORD-10395", customer: "Nadia Petrova", email: "nadia.petrova@volgaworks.example", date: "2025-04-28", status: "Refunded", amount: 233.5 },
  { id: "ORD-10392", customer: "Daniel Kim", email: "daniel.kim@hanriver.example", date: "2025-04-27", status: "Paid", amount: 615.0 },
  { id: "ORD-10389", customer: "Elena Popescu", email: "elena.popescu@carpathia.example", date: "2025-04-26", status: "Paid", amount: 77.0 },
  { id: "ORD-10386", customer: "Samuel Adeyemi", email: "sam.adeyemi@lagoon.example", date: "2025-04-25", status: "Failed", amount: 498.0 },
  { id: "ORD-10383", customer: "Olivia Bennett", email: "olivia.bennett@redwood.example", date: "2025-04-24", status: "Paid", amount: 361.8 },
  { id: "ORD-10380", customer: "Marco Bianchi", email: "marco.bianchi@lagomaggiore.example", date: "2025-04-23", status: "Pending", amount: 855.0 },
  { id: "ORD-10377", customer: "Sara Lindholm", email: "sara.lindholm@auroraco.example", date: "2025-04-22", status: "Paid", amount: 129.0 },
  { id: "ORD-10374", customer: "Ravi Patel", email: "ravi.patel@monsoon.example", date: "2025-04-21", status: "Paid", amount: 1499.0 },
  { id: "ORD-10371", customer: "Julia Wagner", email: "julia.wagner@alpenglow.example", date: "2025-04-20", status: "Refunded", amount: 64.5 },
  { id: "ORD-10368", customer: "Andre Costa", email: "andre.costa@tagus.example", date: "2025-04-19", status: "Paid", amount: 297.0 },
  { id: "ORD-10365", customer: "Leila Haddad", email: "leila.haddad@medina.example", date: "2025-04-18", status: "Paid", amount: 573.2 },
  { id: "ORD-10362", customer: "Finn O'Brien", email: "finn.obrien@shamrock.example", date: "2025-04-17", status: "Pending", amount: 208.0 },
  { id: "ORD-10359", customer: "Mei Lin", email: "mei.lin@jadegarden.example", date: "2025-04-16", status: "Paid", amount: 936.4 },
  { id: "ORD-10356", customer: "Victor Nilsson", email: "victor.nilsson@polarbear.example", date: "2025-04-15", status: "Failed", amount: 175.0 },
  { id: "ORD-10353", customer: "Amelia Foster", email: "amelia.foster@wrenhouse.example", date: "2025-04-14", status: "Paid", amount: 412.0 },
];

const STATUS_FILTERS: StatusFilter[] = ["All", "Paid", "Pending", "Refunded", "Failed"];
const PAGE_SIZES = ["5", "10", "20"] as const;

const STATUS_STYLES: Record<Status, string> = {
  Paid: "border-transparent bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300",
  Pending: "border-transparent bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
  Refunded: "border-transparent bg-sky-100 text-sky-800 dark:bg-sky-500/15 dark:text-sky-300",
  Failed: "border-transparent bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-300",
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

/** Parse an ISO yyyy-mm-dd string as a local date (no timezone drift). */
function parseISO(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function formatDate(date: Date): string {
  return `${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

function formatISO(iso: string): string {
  return formatDate(parseISO(iso));
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
    case "id":
      return a.id.localeCompare(b.id);
    case "customer":
      return a.customer.localeCompare(b.customer);
    case "status":
      return a.status.localeCompare(b.status);
  }
}

interface Column {
  key: SortKey;
  label: string;
  className?: string;
  numeric?: boolean;
}

const COLUMNS: Column[] = [
  { key: "id", label: "Order" },
  { key: "customer", label: "Customer" },
  { key: "date", label: "Date" },
  { key: "status", label: "Status" },
  { key: "amount", label: "Amount", numeric: true },
];

export default function Page() {
  const [status, setStatus] = React.useState<StatusFilter>("All");
  const [range, setRange] = React.useState<DateRange | undefined>(undefined);
  const [query, setQuery] = React.useState("");
  const [sortKey, setSortKey] = React.useState<SortKey>("date");
  const [sortDir, setSortDir] = React.useState<SortDir>("desc");
  const [pageSize, setPageSize] = React.useState<(typeof PAGE_SIZES)[number]>("10");
  const [page, setPage] = React.useState(1);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    const from = range?.from ? startOfDay(range.from) : null;
    const to = range?.to ? startOfDay(range.to) : from;

    const rows = ORDERS.filter((o) => {
      if (status !== "All" && o.status !== status) return false;
      if (q && !`${o.id} ${o.customer} ${o.email}`.toLowerCase().includes(q)) return false;
      if (from !== null) {
        const t = startOfDay(parseISO(o.date));
        if (t < from || (to !== null && t > to)) return false;
      }
      return true;
    });

    const dir = sortDir === "asc" ? 1 : -1;
    return rows.sort((a, b) => compare(a, b, sortKey) * dir || a.id.localeCompare(b.id));
  }, [status, query, range, sortKey, sortDir]);

  const size = Number(pageSize);
  const pageCount = Math.max(1, Math.ceil(filtered.length / size));
  const currentPage = Math.min(page, pageCount);
  const startIndex = (currentPage - 1) * size;
  const pageRows = filtered.slice(startIndex, startIndex + size);

  const hasFilters = status !== "All" || query !== "" || range?.from !== undefined;

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
    setStatus("All");
    setQuery("");
    setRange(undefined);
    setPage(1);
  }

  const rangeLabel = range?.from
    ? range.to && startOfDay(range.to) !== startOfDay(range.from)
      ? `${formatDate(range.from)} – ${formatDate(range.to)}`
      : formatDate(range.from)
    : "Any date";

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <header className="mb-6 flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Orders</h1>
        <p className="text-sm text-muted-foreground">
          Track payments, refunds and failed charges across your storefront.
        </p>
      </header>

      <Card className="gap-4 py-4 sm:py-6">
        <CardHeader className="px-4 sm:px-6">
          <CardTitle>
            <h2>Recent orders</h2>
          </CardTitle>
          <CardDescription>
            Filter by status or date, search by customer or order number, and click a column
            heading to sort.
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-4 px-4 sm:px-6">
          {/* Filters row */}
          <div
            role="search"
            aria-label="Filter orders"
            className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"
          >
            <div className="-mx-1 overflow-x-auto px-1 py-1">
              <ToggleGroup
                type="single"
                variant="outline"
                spacing={0}
                value={status}
                onValueChange={(value) => {
                  // Radix emits "" when the active item is clicked again; keep a selection.
                  if (value) {
                    setStatus(value as StatusFilter);
                    setPage(1);
                  }
                }}
                aria-label="Filter by status"
              >
                {STATUS_FILTERS.map((s) => (
                  <ToggleGroupItem key={s} value={s} aria-label={`${s} orders`}>
                    {s}
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
                    <CalendarIcon aria-hidden="true" />
                    <span className="truncate">{range?.from ? rangeLabel : "Pick a date range"}</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto max-w-[calc(100vw-2rem)] overflow-x-auto p-0" align="end">
                  <Calendar
                    mode="range"
                    numberOfMonths={1}
                    defaultMonth={range?.from ?? new Date(2025, 4, 1)}
                    selected={range}
                    onSelect={(next) => {
                      setRange(next);
                      setPage(1);
                    }}
                  />
                  <div className="flex items-center justify-between gap-2 border-t p-2">
                    <span className="px-2 text-xs text-muted-foreground">{rangeLabel}</span>
                    <Button
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

              <InputGroup className="sm:w-64">
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
                  placeholder="Search orders or customers"
                  aria-label="Search orders or customers"
                  autoComplete="off"
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

          {/* Result summary */}
          <div className="flex min-h-8 items-center justify-between gap-2 text-sm text-muted-foreground">
            <p role="status" aria-live="polite">
              {filtered.length === 0
                ? "No orders match"
                : `${filtered.length} ${filtered.length === 1 ? "order" : "orders"}`}
              {status !== "All" && (
                <Badge variant="outline" className="ml-2 align-middle">
                  {status}
                </Badge>
              )}
            </p>
            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <XIcon aria-hidden="true" />
                Clear filters
              </Button>
            )}
          </div>

          {/* Table */}
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  {COLUMNS.map((col) => {
                    const active = sortKey === col.key;
                    const ariaSort = active
                      ? sortDir === "asc"
                        ? "ascending"
                        : "descending"
                      : "none";
                    const Icon = !active ? ArrowUpDownIcon : sortDir === "asc" ? ArrowUpIcon : ArrowDownIcon;
                    return (
                      <TableHead
                        key={col.key}
                        aria-sort={ariaSort}
                        className={col.numeric ? "pr-3 text-right" : "pl-1"}
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleSort(col.key)}
                          className={
                            col.numeric ? "-mr-2 flex-row-reverse" : "-ml-1"
                          }
                        >
                          {col.label}
                          <Icon
                            aria-hidden="true"
                            className={active ? "opacity-100" : "opacity-40"}
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
                {pageRows.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell className="pl-3 font-mono text-xs sm:text-sm">{o.id}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{o.customer}</span>
                        <span className="text-xs text-muted-foreground">{o.email}</span>
                      </div>
                    </TableCell>
                    <TableCell className="tabular-nums">
                      <time dateTime={o.date}>{formatISO(o.date)}</time>
                    </TableCell>
                    <TableCell>
                      <Badge className={STATUS_STYLES[o.status]}>{o.status}</Badge>
                    </TableCell>
                    <TableCell className="pr-3 text-right font-medium tabular-nums">
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
                    <SearchXIcon aria-hidden="true" />
                  </EmptyMedia>
                  <EmptyTitle>No orders found</EmptyTitle>
                  <EmptyDescription>
                    Nothing matches the current filters. Try a different status, widen the date
                    range, or clear your search.
                  </EmptyDescription>
                </EmptyHeader>
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Clear filters
                </Button>
              </Empty>
            )}
          </div>

          {/* Pagination */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center justify-between gap-3 sm:justify-start">
              <label htmlFor="page-size" className="text-sm text-muted-foreground">
                Rows per page
              </label>
              <Select
                value={pageSize}
                onValueChange={(v) => {
                  setPageSize(v as (typeof PAGE_SIZES)[number]);
                  setPage(1);
                }}
              >
                <SelectTrigger id="page-size" size="sm" className="w-20">
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

            <nav
              aria-label="Table pagination"
              className="flex items-center justify-between gap-3 sm:justify-end"
            >
              <p className="text-sm text-muted-foreground" aria-live="polite">
                {filtered.length === 0
                  ? "0 of 0"
                  : `${startIndex + 1}–${Math.min(startIndex + size, filtered.length)} of ${filtered.length}`}
              </p>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon-sm"
                  aria-label="First page"
                  disabled={currentPage === 1}
                  onClick={() => setPage(1)}
                >
                  <ChevronsLeftIcon aria-hidden="true" />
                </Button>
                <Button
                  variant="outline"
                  size="icon-sm"
                  aria-label="Previous page"
                  disabled={currentPage === 1}
                  onClick={() => setPage(currentPage - 1)}
                >
                  <ChevronLeftIcon aria-hidden="true" />
                </Button>
                <span className="min-w-20 px-2 text-center text-sm tabular-nums">
                  Page {currentPage} of {pageCount}
                </span>
                <Button
                  variant="outline"
                  size="icon-sm"
                  aria-label="Next page"
                  disabled={currentPage === pageCount}
                  onClick={() => setPage(currentPage + 1)}
                >
                  <ChevronRightIcon aria-hidden="true" />
                </Button>
                <Button
                  variant="outline"
                  size="icon-sm"
                  aria-label="Last page"
                  disabled={currentPage === pageCount}
                  onClick={() => setPage(pageCount)}
                >
                  <ChevronsRightIcon aria-hidden="true" />
                </Button>
              </div>
            </nav>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
