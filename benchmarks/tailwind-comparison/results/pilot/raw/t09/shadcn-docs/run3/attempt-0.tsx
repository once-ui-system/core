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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

type Status = "paid" | "pending" | "overdue" | "refunded"
type StatusFilter = "all" | Status
type SortKey = "invoice" | "customer" | "status" | "date" | "amount"
type SortDir = "asc" | "desc"

type Invoice = {
  id: string
  customer: string
  email: string
  status: Status
  date: string // ISO yyyy-mm-dd
  amount: number
}

const INVOICES: Invoice[] = [
  { id: "INV-2041", customer: "Marta Kowalska", email: "marta@northwind.io", status: "paid", date: "2026-09-28", amount: 1249.0 },
  { id: "INV-2040", customer: "Daniel Okafor", email: "daniel@brightlane.co", status: "pending", date: "2026-09-27", amount: 389.5 },
  { id: "INV-2039", customer: "Priya Raman", email: "priya@helioslabs.com", status: "paid", date: "2026-09-25", amount: 2780.0 },
  { id: "INV-2038", customer: "Lucas Moreau", email: "lucas@atelier-moreau.fr", status: "overdue", date: "2026-09-22", amount: 645.25 },
  { id: "INV-2037", customer: "Hannah Becker", email: "hannah@kielwerk.de", status: "paid", date: "2026-09-20", amount: 912.0 },
  { id: "INV-2036", customer: "Tomás Herrera", email: "tomas@solcito.mx", status: "refunded", date: "2026-09-18", amount: 220.0 },
  { id: "INV-2035", customer: "Aiko Tanaka", email: "aiko@kumo-design.jp", status: "paid", date: "2026-09-16", amount: 1830.75 },
  { id: "INV-2034", customer: "Oliver Grant", email: "oliver@grantandsons.uk", status: "pending", date: "2026-09-14", amount: 479.99 },
  { id: "INV-2033", customer: "Fatima Zahra", email: "fatima@riadtech.ma", status: "paid", date: "2026-09-12", amount: 3150.0 },
  { id: "INV-2032", customer: "Sven Lindqvist", email: "sven@fjordsoft.se", status: "overdue", date: "2026-09-09", amount: 758.4 },
  { id: "INV-2031", customer: "Chloe Martin", email: "chloe@lumenstudio.ca", status: "paid", date: "2026-09-07", amount: 1099.0 },
  { id: "INV-2030", customer: "Rafael Costa", email: "rafael@portomar.pt", status: "pending", date: "2026-09-05", amount: 540.0 },
  { id: "INV-2029", customer: "Ingrid Haugen", email: "ingrid@nordlys.no", status: "paid", date: "2026-09-02", amount: 2210.5 },
  { id: "INV-2028", customer: "Kwame Mensah", email: "kwame@accrabyte.gh", status: "refunded", date: "2026-08-30", amount: 180.0 },
  { id: "INV-2027", customer: "Elena Petrova", email: "elena@zvezda.dev", status: "paid", date: "2026-08-28", amount: 1675.0 },
  { id: "INV-2026", customer: "Noah Fischer", email: "noah@alpenbyte.ch", status: "overdue", date: "2026-08-25", amount: 892.3 },
  { id: "INV-2025", customer: "Sofia Rossi", email: "sofia@bottegadigitale.it", status: "paid", date: "2026-08-23", amount: 1320.0 },
  { id: "INV-2024", customer: "Liam O'Connor", email: "liam@emeraldworks.ie", status: "pending", date: "2026-08-21", amount: 415.75 },
  { id: "INV-2023", customer: "Yuki Nakamura", email: "yuki@sakura-ops.jp", status: "paid", date: "2026-08-19", amount: 2640.0 },
  { id: "INV-2022", customer: "Camila Reyes", email: "camila@andesflow.cl", status: "paid", date: "2026-08-16", amount: 735.0 },
  { id: "INV-2021", customer: "Arjun Mehta", email: "arjun@kaveri.in", status: "overdue", date: "2026-08-13", amount: 1180.0 },
  { id: "INV-2020", customer: "Emma Johansson", email: "emma@polarlight.se", status: "paid", date: "2026-08-11", amount: 968.5 },
  { id: "INV-2019", customer: "Mateo García", email: "mateo@vegaweb.es", status: "pending", date: "2026-08-08", amount: 305.0 },
  { id: "INV-2018", customer: "Zoe Williams", email: "zoe@harborlane.au", status: "paid", date: "2026-08-05", amount: 1540.0 },
  { id: "INV-2017", customer: "Piotr Nowak", email: "piotr@wislaworks.pl", status: "refunded", date: "2026-08-02", amount: 275.0 },
  { id: "INV-2016", customer: "Amara Diallo", email: "amara@teranga.sn", status: "paid", date: "2026-07-30", amount: 2025.0 },
  { id: "INV-2015", customer: "Jonas Weber", email: "jonas@rheinpixel.de", status: "paid", date: "2026-07-27", amount: 849.0 },
  { id: "INV-2014", customer: "Isabella Conti", email: "isabella@contiarch.it", status: "overdue", date: "2026-07-24", amount: 1410.6 },
  { id: "INV-2013", customer: "Ethan Brooks", email: "ethan@brooksbuild.us", status: "paid", date: "2026-07-21", amount: 3320.0 },
  { id: "INV-2012", customer: "Mei Lin", email: "mei@jadecircuit.sg", status: "pending", date: "2026-07-18", amount: 596.0 },
  { id: "INV-2011", customer: "Gabriel Santos", email: "gabriel@tropicode.br", status: "paid", date: "2026-07-15", amount: 1115.0 },
  { id: "INV-2010", customer: "Anna Kovács", email: "anna@duna-labs.hu", status: "paid", date: "2026-07-12", amount: 702.8 },
  { id: "INV-2009", customer: "Victor Alves", email: "victor@alvesmedia.pt", status: "overdue", date: "2026-07-09", amount: 433.0 },
  { id: "INV-2008", customer: "Sara Haddad", email: "sara@cedarpoint.lb", status: "paid", date: "2026-07-06", amount: 1890.0 },
  { id: "INV-2007", customer: "Henrik Nilsen", email: "henrik@fjellkraft.no", status: "refunded", date: "2026-07-03", amount: 360.0 },
  { id: "INV-2006", customer: "Julia Schmidt", email: "julia@spreeform.de", status: "paid", date: "2026-06-30", amount: 2475.0 },
  { id: "INV-2005", customer: "Omar Farouk", email: "omar@nilebridge.eg", status: "pending", date: "2026-06-26", amount: 519.0 },
  { id: "INV-2004", customer: "Grace Kim", email: "grace@seoulstack.kr", status: "paid", date: "2026-06-22", amount: 1260.0 },
  { id: "INV-2003", customer: "Pedro Almeida", email: "pedro@minhoapps.pt", status: "paid", date: "2026-06-18", amount: 645.0 },
  { id: "INV-2002", customer: "Leila Karimi", email: "leila@persepolis.dev", status: "overdue", date: "2026-06-14", amount: 974.0 },
  { id: "INV-2001", customer: "Marcus Webb", email: "marcus@webbandco.us", status: "paid", date: "2026-06-10", amount: 1735.0 },
]

const STATUS_LABEL: Record<Status, string> = {
  paid: "Paid",
  pending: "Pending",
  overdue: "Overdue",
  refunded: "Refunded",
}

const STATUS_ORDER: Record<Status, number> = {
  paid: 0,
  pending: 1,
  overdue: 2,
  refunded: 3,
}

const STATUS_CLASS: Record<Status, string> = {
  paid: "border-transparent bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200",
  pending: "border-transparent bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200",
  overdue: "border-transparent bg-red-100 text-red-900 dark:bg-red-950 dark:text-red-200",
  refunded: "border-transparent bg-muted text-muted-foreground",
}

const PAGE_SIZES = ["5", "10", "20"]

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
})

function parseDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number)
  return new Date(y, m - 1, d)
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function SortHeader({
  label,
  sortKey,
  active,
  dir,
  onSort,
  align = "left",
}: {
  label: string
  sortKey: SortKey
  active: SortKey
  dir: SortDir
  onSort: (key: SortKey) => void
  align?: "left" | "right"
}) {
  const isActive = active === sortKey
  const Icon = !isActive ? ArrowUpDownIcon : dir === "asc" ? ArrowUpIcon : ArrowDownIcon
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className={align === "right" ? "-mr-3 ml-auto flex" : "-ml-3"}
      onClick={() => onSort(sortKey)}
    >
      {label}
      <Icon
        aria-hidden="true"
        className={isActive ? "" : "text-muted-foreground"}
      />
      <span className="sr-only">
        {isActive
          ? `, sorted ${dir === "asc" ? "ascending" : "descending"}. Activate to reverse.`
          : ", not sorted. Activate to sort ascending."}
      </span>
    </Button>
  )
}

export default function Page() {
  const [status, setStatus] = React.useState<StatusFilter>("all")
  const [query, setQuery] = React.useState("")
  const [range, setRange] = React.useState<DateRange | undefined>(undefined)
  const [sortKey, setSortKey] = React.useState<SortKey>("date")
  const [sortDir, setSortDir] = React.useState<SortDir>("desc")
  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState("10")

  const pageSizeNum = Number(pageSize)

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    const from = range?.from ? range.from.getTime() : null
    const to = range?.to
      ? range.to.getTime()
      : range?.from
        ? range.from.getTime()
        : null
    return INVOICES.filter((inv) => {
      if (status !== "all" && inv.status !== status) return false
      if (q) {
        const hay = `${inv.id} ${inv.customer} ${inv.email}`.toLowerCase()
        if (!hay.includes(q)) return false
      }
      if (from !== null && to !== null) {
        const t = parseDate(inv.date).getTime()
        if (t < from || t > to) return false
      }
      return true
    })
  }, [status, query, range])

  const sorted = React.useMemo(() => {
    const factor = sortDir === "asc" ? 1 : -1
    return [...filtered].sort((a, b) => {
      let cmp = 0
      switch (sortKey) {
        case "invoice":
          cmp = a.id.localeCompare(b.id)
          break
        case "customer":
          cmp = a.customer.localeCompare(b.customer)
          break
        case "status":
          cmp = STATUS_ORDER[a.status] - STATUS_ORDER[b.status]
          break
        case "date":
          cmp = a.date.localeCompare(b.date)
          break
        case "amount":
          cmp = a.amount - b.amount
          break
      }
      return cmp * factor
    })
  }, [filtered, sortKey, sortDir])

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSizeNum))
  const currentPage = Math.min(page, pageCount)
  const startIndex = (currentPage - 1) * pageSizeNum
  const rows = sorted.slice(startIndex, startIndex + pageSizeNum)
  const total = filtered.reduce((sum, inv) => sum + inv.amount, 0)

  const hasFilters = status !== "all" || query !== "" || range !== undefined

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortKey(key)
      setSortDir(key === "amount" || key === "date" ? "desc" : "asc")
    }
    setPage(1)
  }

  function clearFilters() {
    setStatus("all")
    setQuery("")
    setRange(undefined)
    setPage(1)
  }

  const ariaSort = (key: SortKey): "ascending" | "descending" | "none" =>
    sortKey === key ? (sortDir === "asc" ? "ascending" : "descending") : "none"

  const rangeLabel = range?.from
    ? range.to
      ? `${formatDate(range.from)} – ${formatDate(range.to)}`
      : formatDate(range.from)
    : "Pick a date range"

  // Compact page-number list with ellipses.
  const pageItems: (number | "gap-start" | "gap-end")[] = []
  for (let p = 1; p <= pageCount; p++) {
    if (p === 1 || p === pageCount || Math.abs(p - currentPage) <= 1) {
      pageItems.push(p)
    } else if (p === 2 && currentPage > 3) {
      pageItems.push("gap-start")
    } else if (p === pageCount - 1 && currentPage < pageCount - 2) {
      pageItems.push("gap-end")
    } else if (p === 2 || p === pageCount - 1) {
      pageItems.push(p)
    }
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <header className="mb-6 flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Invoices
        </h1>
        <p className="text-muted-foreground text-sm">
          Track billing across customers. Filter by status or date, search, and
          sort any column.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>All invoices</CardTitle>
          <CardDescription>
            {filtered.length} of {INVOICES.length} invoices ·{" "}
            {currency.format(total)} total
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div
            role="search"
            aria-label="Filter invoices"
            className="flex flex-col gap-3 lg:flex-row lg:items-end"
          >
            <div className="flex flex-col gap-1.5">
              <Label id="status-label">Status</Label>
              <div className="max-w-full overflow-x-auto">
                <ToggleGroup
                  type="single"
                  variant="outline"
                  size="sm"
                  value={status}
                  aria-labelledby="status-label"
                  onValueChange={(v) => {
                    if (v) {
                      setStatus(v as StatusFilter)
                      setPage(1)
                    }
                  }}
                >
                  <ToggleGroupItem value="all">All</ToggleGroupItem>
                  <ToggleGroupItem value="paid">Paid</ToggleGroupItem>
                  <ToggleGroupItem value="pending">Pending</ToggleGroupItem>
                  <ToggleGroupItem value="overdue">Overdue</ToggleGroupItem>
                  <ToggleGroupItem value="refunded">Refunded</ToggleGroupItem>
                </ToggleGroup>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="date-range">Date range</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="date-range"
                    variant="outline"
                    className="w-full justify-start font-normal lg:w-64"
                  >
                    <CalendarIcon aria-hidden="true" />
                    <span
                      className={range?.from ? "" : "text-muted-foreground"}
                    >
                      {rangeLabel}
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    selected={range}
                    onSelect={(r) => {
                      setRange(r)
                      setPage(1)
                    }}
                    defaultMonth={range?.from ?? new Date(2026, 8, 1)}
                    numberOfMonths={1}
                  />
                  <div className="flex justify-end border-t p-2">
                    <Button
                      type="button"
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
              <div className="relative">
                <SearchIcon
                  aria-hidden="true"
                  className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
                />
                <Input
                  id="invoice-search"
                  type="search"
                  placeholder="Invoice, customer or email"
                  className="pl-9"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value)
                    setPage(1)
                  }}
                />
              </div>
            </div>

            {hasFilters && (
              <Button
                type="button"
                variant="ghost"
                onClick={clearFilters}
                className="lg:self-end"
              >
                <XIcon aria-hidden="true" />
                Reset
              </Button>
            )}
          </div>

          <div className="rounded-md border">
            <Table>
              <TableCaption className="sr-only">
                Invoices sorted by {sortKey}{" "}
                {sortDir === "asc" ? "ascending" : "descending"}. Showing{" "}
                {rows.length} of {sorted.length} matching invoices.
              </TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead aria-sort={ariaSort("invoice")}>
                    <SortHeader label="Invoice" sortKey="invoice" active={sortKey} dir={sortDir} onSort={handleSort} />
                  </TableHead>
                  <TableHead aria-sort={ariaSort("customer")}>
                    <SortHeader label="Customer" sortKey="customer" active={sortKey} dir={sortDir} onSort={handleSort} />
                  </TableHead>
                  <TableHead aria-sort={ariaSort("status")}>
                    <SortHeader label="Status" sortKey="status" active={sortKey} dir={sortDir} onSort={handleSort} />
                  </TableHead>
                  <TableHead
                    aria-sort={ariaSort("date")}
                    className="hidden sm:table-cell"
                  >
                    <SortHeader label="Date" sortKey="date" active={sortKey} dir={sortDir} onSort={handleSort} />
                  </TableHead>
                  <TableHead aria-sort={ariaSort("amount")} className="text-right">
                    <SortHeader label="Amount" sortKey="amount" active={sortKey} dir={sortDir} onSort={handleSort} align="right" />
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-muted-foreground h-32 text-center"
                    >
                      No invoices match your filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((inv) => (
                    <TableRow key={inv.id}>
                      <TableCell className="font-medium">{inv.id}</TableCell>
                      <TableCell>
                        <div className="font-medium">{inv.customer}</div>
                        <div className="text-muted-foreground max-w-[14rem] truncate text-xs">
                          {inv.email}
                        </div>
                        <div className="text-muted-foreground text-xs sm:hidden">
                          {formatDate(parseDate(inv.date))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={STATUS_CLASS[inv.status]}>
                          {STATUS_LABEL[inv.status]}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {formatDate(parseDate(inv.date))}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {currency.format(inv.amount)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-col items-center gap-3 md:flex-row md:justify-between">
            <div className="flex items-center gap-3">
              <p
                className="text-muted-foreground text-sm"
                role="status"
                aria-live="polite"
              >
                {sorted.length === 0
                  ? "0 results"
                  : `Showing ${startIndex + 1}–${startIndex + rows.length} of ${sorted.length}`}
              </p>
              <div className="flex items-center gap-2">
                <Label htmlFor="page-size" className="text-sm font-normal">
                  Rows
                </Label>
                <Select
                  value={pageSize}
                  onValueChange={(v) => {
                    setPageSize(v)
                    setPage(1)
                  }}
                >
                  <SelectTrigger id="page-size" size="sm" className="w-[4.5rem]">
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
              <ul className="flex flex-wrap items-center justify-center gap-1">
                <li>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    aria-label="First page"
                    disabled={currentPage === 1}
                    onClick={() => setPage(1)}
                    className="hidden sm:inline-flex"
                  >
                    <ChevronsLeftIcon aria-hidden="true" />
                  </Button>
                </li>
                <li>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    aria-label="Previous page"
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
                        type="button"
                        variant={item === currentPage ? "default" : "ghost"}
                        size="icon"
                        aria-label={`Page ${item}`}
                        aria-current={item === currentPage ? "page" : undefined}
                        onClick={() => setPage(item)}
                      >
                        {item}
                      </Button>
                    </li>
                  ) : (
                    <li
                      key={item}
                      aria-hidden="true"
                      className="text-muted-foreground flex size-9 items-center justify-center"
                    >
                      …
                    </li>
                  )
                )}
                <li>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    aria-label="Next page"
                    disabled={currentPage === pageCount}
                    onClick={() => setPage(currentPage + 1)}
                  >
                    <ChevronRightIcon aria-hidden="true" />
                  </Button>
                </li>
                <li>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    aria-label="Last page"
                    disabled={currentPage === pageCount}
                    onClick={() => setPage(pageCount)}
                    className="hidden sm:inline-flex"
                  >
                    <ChevronsRightIcon aria-hidden="true" />
                  </Button>
                </li>
              </ul>
            </nav>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
