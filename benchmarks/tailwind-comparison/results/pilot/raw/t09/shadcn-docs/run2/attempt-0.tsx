"use client"

import * as React from "react"
import type { DateRange } from "react-day-picker"
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
  XIcon,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Label } from "@/components/ui/label"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { cn } from "@/lib/utils"

type Status = "paid" | "pending" | "overdue"
type StatusFilter = "all" | Status
type SortKey = "id" | "customer" | "status" | "issued" | "amount"
type SortDir = "asc" | "desc"

type Invoice = {
  id: string
  customer: string
  email: string
  status: Status
  issued: Date
  amount: number
}

const RAW: [string, string, string, Status, string, number][] = [
  ["INV-2041", "Harbor & Pine Coffee", "billing@harborpine.example", "paid", "2026-07-03", 1280],
  ["INV-2042", "Northwind Logistics", "ap@northwindlog.example", "paid", "2026-07-08", 5430.5],
  ["INV-2043", "Bluebird Dental Group", "office@bluebirddental.example", "overdue", "2026-07-11", 860],
  ["INV-2044", "Kestrel Analytics", "finance@kestrel.example", "paid", "2026-07-15", 12400],
  ["INV-2045", "Marlow & Finch LLP", "accounts@marlowfinch.example", "paid", "2026-07-19", 3200],
  ["INV-2046", "Terrace Bakery", "hello@terracebakery.example", "pending", "2026-07-22", 415.75],
  ["INV-2047", "Quill Publishing", "payables@quill.example", "paid", "2026-07-26", 2750],
  ["INV-2048", "Sunridge Solar", "billing@sunridge.example", "overdue", "2026-07-30", 9800],
  ["INV-2049", "Lumen Photography", "studio@lumenphoto.example", "paid", "2026-08-02", 640],
  ["INV-2050", "Oakline Furniture", "ap@oakline.example", "paid", "2026-08-05", 4180],
  ["INV-2051", "Fernhill Veterinary", "admin@fernhillvet.example", "pending", "2026-08-07", 1175.2],
  ["INV-2052", "Atlas Freight Co.", "invoices@atlasfreight.example", "paid", "2026-08-10", 7320],
  ["INV-2053", "Nimbus Cloud Labs", "finance@nimbuslabs.example", "pending", "2026-08-12", 15600],
  ["INV-2054", "Willow Street Books", "orders@willowbooks.example", "paid", "2026-08-14", 288.4],
  ["INV-2055", "Copperfield Hotels", "ap@copperfield.example", "overdue", "2026-08-16", 6890],
  ["INV-2056", "Pixel & Ink Studio", "hi@pixelink.example", "paid", "2026-08-19", 1950],
  ["INV-2057", "Greenleaf Grocers", "accounts@greenleaf.example", "paid", "2026-08-21", 3340.9],
  ["INV-2058", "Summit Physio", "reception@summitphysio.example", "pending", "2026-08-24", 720],
  ["INV-2059", "Ridgeway Builders", "billing@ridgeway.example", "overdue", "2026-08-26", 18250],
  ["INV-2060", "Alder Tea House", "shop@aldertea.example", "paid", "2026-08-28", 365],
  ["INV-2061", "Vantage Insurance Brokers", "ap@vantagebrokers.example", "paid", "2026-08-31", 5100],
  ["INV-2062", "Moss & Stone Landscaping", "office@mossstone.example", "pending", "2026-09-02", 2240],
  ["INV-2063", "Helix Biotech", "finance@helixbio.example", "paid", "2026-09-04", 21900],
  ["INV-2064", "Cinder Roasters", "team@cinderroasters.example", "paid", "2026-09-06", 905.6],
  ["INV-2065", "Brightpath Tutoring", "admin@brightpath.example", "overdue", "2026-09-08", 480],
  ["INV-2066", "Tidewater Marine", "ap@tidewater.example", "paid", "2026-09-10", 8760],
  ["INV-2067", "Lantern Yoga", "hello@lanternyoga.example", "pending", "2026-09-12", 312.5],
  ["INV-2068", "Granite Peak Outfitters", "billing@granitepeak.example", "paid", "2026-09-14", 4625],
  ["INV-2069", "Orchard Lane Florist", "orders@orchardlane.example", "paid", "2026-09-16", 198],
  ["INV-2070", "Delta Wire & Cable", "payables@deltawire.example", "pending", "2026-09-18", 11080],
  ["INV-2071", "Saffron Kitchen", "owner@saffronkitchen.example", "paid", "2026-09-20", 1430],
  ["INV-2072", "Polaris Architects", "finance@polarisarch.example", "paid", "2026-09-22", 9200],
  ["INV-2073", "Juniper Pediatrics", "billing@juniperpeds.example", "pending", "2026-09-25", 1860],
  ["INV-2074", "Redwood Print Works", "ap@redwoodprint.example", "overdue", "2026-09-27", 2975],
  ["INV-2075", "Echo Valley Brewing", "accounts@echovalley.example", "paid", "2026-09-29", 3890],
  ["INV-2076", "Meridian Law Group", "billing@meridianlaw.example", "pending", "2026-10-01", 7500],
  ["INV-2077", "Foxglove Interiors", "studio@foxglove.example", "paid", "2026-10-03", 2310],
  ["INV-2078", "Cobalt Robotics", "finance@cobaltrobotics.example", "pending", "2026-10-05", 24800],
  ["INV-2079", "Seaglass Cafe", "hello@seaglasscafe.example", "paid", "2026-10-07", 520.3],
  ["INV-2080", "Ironbridge Cycles", "ap@ironbridge.example", "pending", "2026-10-09", 1675],
]

function parseDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number)
  return new Date(y, m - 1, d)
}

const INVOICES: Invoice[] = RAW.map(
  ([id, customer, email, status, issued, amount]) => ({
    id,
    customer,
    email,
    status,
    issued: parseDate(issued),
    amount,
  })
)

const STATUS_LABEL: Record<Status, string> = {
  paid: "Paid",
  pending: "Pending",
  overdue: "Overdue",
}

const STATUS_ORDER: Record<Status, number> = { overdue: 0, pending: 1, paid: 2 }

const dateFmt = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
})
const shortDateFmt = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
})
const moneyFmt = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
})

const PAGE_SIZES = [5, 10, 20]

const COLUMNS: { key: SortKey; label: string; numeric?: boolean; hide?: string }[] = [
  { key: "id", label: "Invoice" },
  { key: "customer", label: "Customer" },
  { key: "status", label: "Status" },
  { key: "issued", label: "Issued", hide: "hidden sm:table-cell" },
  { key: "amount", label: "Amount", numeric: true },
]

function StatusBadge({ status }: { status: Status }) {
  return (
    <Badge
      variant={status === "overdue" ? "destructive" : status === "paid" ? "secondary" : "outline"}
      className={cn(status === "paid" && "text-foreground")}
    >
      <span
        aria-hidden
        className={cn(
          "size-1.5 rounded-full",
          status === "paid" && "bg-emerald-500",
          status === "pending" && "bg-amber-500",
          status === "overdue" && "bg-white"
        )}
      />
      {STATUS_LABEL[status]}
    </Badge>
  )
}

export default function Page() {
  const [status, setStatus] = React.useState<StatusFilter>("all")
  const [query, setQuery] = React.useState("")
  const [range, setRange] = React.useState<DateRange | undefined>()
  const [sortKey, setSortKey] = React.useState<SortKey>("issued")
  const [sortDir, setSortDir] = React.useState<SortDir>("desc")
  const [pageSize, setPageSize] = React.useState(10)
  const [page, setPage] = React.useState(1)

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    const from = range?.from
    const to = range?.to ?? range?.from
    return INVOICES.filter((inv) => {
      if (status !== "all" && inv.status !== status) return false
      if (q && !`${inv.id} ${inv.customer} ${inv.email}`.toLowerCase().includes(q))
        return false
      if (from && inv.issued < from) return false
      if (to && inv.issued > to) return false
      return true
    })
  }, [status, query, range])

  const sorted = React.useMemo(() => {
    const dir = sortDir === "asc" ? 1 : -1
    return [...filtered].sort((a, b) => {
      let r = 0
      switch (sortKey) {
        case "id":
          r = a.id.localeCompare(b.id)
          break
        case "customer":
          r = a.customer.localeCompare(b.customer)
          break
        case "status":
          r = STATUS_ORDER[a.status] - STATUS_ORDER[b.status]
          break
        case "issued":
          r = a.issued.getTime() - b.issued.getTime()
          break
        case "amount":
          r = a.amount - b.amount
          break
      }
      return r * dir
    })
  }, [filtered, sortKey, sortDir])

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize))
  const current = Math.min(page, pageCount)
  const start = (current - 1) * pageSize
  const rows = sorted.slice(start, start + pageSize)
  const total = filtered.reduce((sum, inv) => sum + inv.amount, 0)

  const hasFilters = status !== "all" || query !== "" || range !== undefined

  function toggleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortKey(key)
      setSortDir(key === "amount" || key === "issued" ? "desc" : "asc")
    }
    setPage(1)
  }

  function clearFilters() {
    setStatus("all")
    setQuery("")
    setRange(undefined)
    setPage(1)
  }

  const rangeLabel = range?.from
    ? range.to
      ? `${shortDateFmt.format(range.from)} – ${dateFmt.format(range.to)}`
      : dateFmt.format(range.from)
    : "Pick a date range"

  const pageButtons = React.useMemo(() => {
    const pages: (number | "gap-start" | "gap-end")[] = []
    for (let p = 1; p <= pageCount; p++) {
      if (p === 1 || p === pageCount || Math.abs(p - current) <= 1) {
        pages.push(p)
      } else if (p < current && pages[pages.length - 1] !== "gap-start") {
        pages.push("gap-start")
      } else if (p > current && pages[pages.length - 1] !== "gap-end") {
        pages.push("gap-end")
      }
    }
    return pages
  }, [pageCount, current])

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <header className="mb-6 flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Invoices</h1>
        <p className="text-sm text-muted-foreground">
          Track what has been billed, what is outstanding and what is overdue.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>All invoices</CardTitle>
          <CardDescription aria-live="polite">
            {filtered.length} of {INVOICES.length} invoices &middot;{" "}
            {moneyFmt.format(total)} total
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {/* Filters row */}
          <div
            role="search"
            aria-label="Filter invoices"
            className="flex flex-col gap-3 lg:flex-row lg:items-end"
          >
            <div className="flex flex-col gap-1.5">
              <Label id="status-label">Status</Label>
              <ToggleGroup
                type="single"
                variant="outline"
                value={status}
                onValueChange={(v) => {
                  if (v) {
                    setStatus(v as StatusFilter)
                    setPage(1)
                  }
                }}
                aria-labelledby="status-label"
                className="w-full sm:w-fit"
              >
                <ToggleGroupItem value="all" className="flex-1 sm:flex-none">
                  All
                </ToggleGroupItem>
                <ToggleGroupItem value="paid" className="flex-1 sm:flex-none">
                  Paid
                </ToggleGroupItem>
                <ToggleGroupItem value="pending" className="flex-1 sm:flex-none">
                  Pending
                </ToggleGroupItem>
                <ToggleGroupItem value="overdue" className="flex-1 sm:flex-none">
                  Overdue
                </ToggleGroupItem>
              </ToggleGroup>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="date-range">Issued</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="date-range"
                    variant="outline"
                    className={cn(
                      "w-full justify-start font-normal sm:w-64",
                      !range?.from && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon aria-hidden />
                    <span className="truncate">{rangeLabel}</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    numberOfMonths={1}
                    defaultMonth={range?.from ?? new Date(2026, 8, 1)}
                    selected={range}
                    onSelect={(r) => {
                      setRange(r)
                      setPage(1)
                    }}
                  />
                  <div className="flex justify-end border-t p-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={!range}
                      onClick={() => {
                        setRange(undefined)
                        setPage(1)
                      }}
                    >
                      Clear dates
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex flex-1 flex-col gap-1.5">
              <Label htmlFor="invoice-search">Search</Label>
              <InputGroup>
                <InputGroupAddon>
                  <SearchIcon aria-hidden />
                </InputGroupAddon>
                <InputGroupInput
                  id="invoice-search"
                  type="search"
                  placeholder="Invoice, customer or email"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value)
                    setPage(1)
                  }}
                />
                {query && (
                  <InputGroupAddon align="inline-end">
                    <InputGroupButton
                      size="icon-xs"
                      aria-label="Clear search"
                      onClick={() => {
                        setQuery("")
                        setPage(1)
                      }}
                    >
                      <XIcon aria-hidden />
                    </InputGroupButton>
                  </InputGroupAddon>
                )}
              </InputGroup>
            </div>

            {hasFilters && (
              <Button variant="ghost" onClick={clearFilters} className="lg:mb-0">
                <XIcon aria-hidden />
                Reset
              </Button>
            )}
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  {COLUMNS.map((col) => {
                    const active = sortKey === col.key
                    const Icon = !active
                      ? ArrowUpDownIcon
                      : sortDir === "asc"
                        ? ArrowUpIcon
                        : ArrowDownIcon
                    return (
                      <TableHead
                        key={col.key}
                        scope="col"
                        aria-sort={
                          active
                            ? sortDir === "asc"
                              ? "ascending"
                              : "descending"
                            : "none"
                        }
                        className={cn(col.numeric && "text-right", col.hide)}
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleSort(col.key)}
                          className={cn(
                            "-mx-2 h-8 px-2 font-medium",
                            col.numeric && "flex-row-reverse"
                          )}
                        >
                          {col.label}
                          <Icon
                            aria-hidden
                            className={cn(!active && "opacity-50")}
                          />
                          <span className="sr-only">
                            {active
                              ? `, sorted ${sortDir === "asc" ? "ascending" : "descending"}. Activate to reverse.`
                              : ", activate to sort ascending"}
                          </span>
                        </Button>
                      </TableHead>
                    )
                  })}
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={COLUMNS.length}
                      className="h-32 text-center text-muted-foreground"
                    >
                      No invoices match these filters.{" "}
                      <Button variant="link" className="h-auto p-0" onClick={clearFilters}>
                        Reset filters
                      </Button>
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((inv) => (
                    <TableRow key={inv.id}>
                      <TableCell className="font-medium tabular-nums">
                        {inv.id}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{inv.customer}</div>
                        <div className="hidden max-w-[16rem] truncate text-xs text-muted-foreground md:block">
                          {inv.email}
                        </div>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={inv.status} />
                      </TableCell>
                      <TableCell className="hidden whitespace-nowrap sm:table-cell">
                        {dateFmt.format(inv.issued)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {moneyFmt.format(inv.amount)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Label htmlFor="page-size" className="font-normal">
                Rows per page
              </Label>
              <Select
                value={String(pageSize)}
                onValueChange={(v) => {
                  setPageSize(Number(v))
                  setPage(1)
                }}
              >
                <SelectTrigger id="page-size" size="sm" className="w-[4.5rem]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAGE_SIZES.map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span aria-live="polite" className="whitespace-nowrap">
                {sorted.length === 0
                  ? "0 results"
                  : `${start + 1}–${Math.min(start + pageSize, sorted.length)} of ${sorted.length}`}
              </span>
            </div>

            <Pagination className="mx-0 w-auto">
              <PaginationContent>
                <PaginationItem className="hidden sm:block">
                  <Button
                    variant="outline"
                    size="icon"
                    aria-label="Go to first page"
                    disabled={current === 1}
                    onClick={() => setPage(1)}
                  >
                    <ChevronsLeftIcon aria-hidden />
                  </Button>
                </PaginationItem>
                <PaginationItem>
                  <Button
                    variant="outline"
                    size="icon"
                    aria-label="Go to previous page"
                    disabled={current === 1}
                    onClick={() => setPage(current - 1)}
                  >
                    <ChevronLeftIcon aria-hidden />
                  </Button>
                </PaginationItem>
                {pageButtons.map((p) =>
                  typeof p === "number" ? (
                    <PaginationItem key={p} className="hidden sm:block">
                      <Button
                        variant={p === current ? "default" : "ghost"}
                        size="icon"
                        aria-label={`Page ${p}`}
                        aria-current={p === current ? "page" : undefined}
                        onClick={() => setPage(p)}
                      >
                        {p}
                      </Button>
                    </PaginationItem>
                  ) : (
                    <PaginationItem key={p} className="hidden sm:block">
                      <span
                        aria-hidden
                        className="flex size-9 items-center justify-center text-muted-foreground"
                      >
                        …
                      </span>
                    </PaginationItem>
                  )
                )}
                <PaginationItem className="px-2 text-sm sm:hidden">
                  Page {current} of {pageCount}
                </PaginationItem>
                <PaginationItem>
                  <Button
                    variant="outline"
                    size="icon"
                    aria-label="Go to next page"
                    disabled={current === pageCount}
                    onClick={() => setPage(current + 1)}
                  >
                    <ChevronRightIcon aria-hidden />
                  </Button>
                </PaginationItem>
                <PaginationItem className="hidden sm:block">
                  <Button
                    variant="outline"
                    size="icon"
                    aria-label="Go to last page"
                    disabled={current === pageCount}
                    onClick={() => setPage(pageCount)}
                  >
                    <ChevronsRightIcon aria-hidden />
                  </Button>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
