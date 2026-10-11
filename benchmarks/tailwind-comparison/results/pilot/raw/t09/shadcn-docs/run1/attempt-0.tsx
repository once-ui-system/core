"use client"

import * as React from "react"
import { format } from "date-fns"
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  X,
} from "lucide-react"
import type { DateRange } from "react-day-picker"

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
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

type Status = "paid" | "pending" | "overdue" | "refunded"
type StatusFilter = "all" | Status

type Invoice = {
  id: string
  customer: string
  email: string
  status: Status
  issued: string // ISO date (yyyy-mm-dd)
  amount: number
}

const INVOICES: Invoice[] = [
  { id: "INV-2041", customer: "Marta Kowalski", email: "marta@northwind.example", status: "paid", issued: "2026-09-29", amount: 1280.5 },
  { id: "INV-2040", customer: "Dev Patel", email: "dev@lumenlabs.example", status: "pending", issued: "2026-09-27", amount: 460 },
  { id: "INV-2039", customer: "Sofia Ribeiro", email: "sofia@casaverde.example", status: "paid", issued: "2026-09-24", amount: 2995 },
  { id: "INV-2038", customer: "Liam O'Connor", email: "liam@harborworks.example", status: "overdue", issued: "2026-09-12", amount: 740.25 },
  { id: "INV-2037", customer: "Aiko Tanaka", email: "aiko@kitsunedesign.example", status: "paid", issued: "2026-09-10", amount: 3150 },
  { id: "INV-2036", customer: "Noah Becker", email: "noah@bluepine.example", status: "refunded", issued: "2026-09-08", amount: 215.9 },
  { id: "INV-2035", customer: "Priya Nair", email: "priya@cardamom.example", status: "paid", issued: "2026-09-03", amount: 890 },
  { id: "INV-2034", customer: "Lucas Moreau", email: "lucas@atelier-moreau.example", status: "pending", issued: "2026-08-30", amount: 1675.75 },
  { id: "INV-2033", customer: "Hannah Schmidt", email: "hannah@feldbau.example", status: "paid", issued: "2026-08-28", amount: 520 },
  { id: "INV-2032", customer: "Omar Haddad", email: "omar@souqtech.example", status: "overdue", issued: "2026-08-19", amount: 2210.4 },
  { id: "INV-2031", customer: "Chloe Martin", email: "chloe@petitpain.example", status: "paid", issued: "2026-08-17", amount: 98.6 },
  { id: "INV-2030", customer: "Mateo Fernandez", email: "mateo@solaris.example", status: "paid", issued: "2026-08-14", amount: 4120 },
  { id: "INV-2029", customer: "Ingrid Larsen", email: "ingrid@fjordstudio.example", status: "pending", issued: "2026-08-11", amount: 335 },
  { id: "INV-2028", customer: "Tariq Rahman", email: "tariq@orbitpay.example", status: "paid", issued: "2026-08-06", amount: 1840 },
  { id: "INV-2027", customer: "Elena Popescu", email: "elena@danubedata.example", status: "refunded", issued: "2026-08-02", amount: 610 },
  { id: "INV-2026", customer: "Jack Thompson", email: "jack@ridgeline.example", status: "paid", issued: "2026-07-29", amount: 745.3 },
  { id: "INV-2025", customer: "Yuki Sato", email: "yuki@shirokuma.example", status: "overdue", issued: "2026-07-22", amount: 1390 },
  { id: "INV-2024", customer: "Amara Okafor", email: "amara@baobabworks.example", status: "paid", issued: "2026-07-19", amount: 2580 },
  { id: "INV-2023", customer: "Felix Wagner", email: "felix@kaiserwerk.example", status: "pending", issued: "2026-07-15", amount: 905.5 },
  { id: "INV-2022", customer: "Sara Lindqvist", email: "sara@nordlys.example", status: "paid", issued: "2026-07-11", amount: 312 },
  { id: "INV-2021", customer: "Diego Alvarez", email: "diego@mercadito.example", status: "paid", issued: "2026-07-07", amount: 1125 },
  { id: "INV-2020", customer: "Nina Petrova", email: "nina@volgasoft.example", status: "overdue", issued: "2026-07-01", amount: 3380.8 },
  { id: "INV-2019", customer: "Ben Carter", email: "ben@tidewater.example", status: "paid", issued: "2026-06-26", amount: 660 },
  { id: "INV-2018", customer: "Fatima Zahra", email: "fatima@atlasgroup.example", status: "refunded", issued: "2026-06-21", amount: 129.99 },
  { id: "INV-2017", customer: "Oliver Brown", email: "oliver@greenfield.example", status: "paid", issued: "2026-06-16", amount: 2045 },
  { id: "INV-2016", customer: "Mei Lin", email: "mei@jadeline.example", status: "pending", issued: "2026-06-12", amount: 789.4 },
  { id: "INV-2015", customer: "Andre Silva", email: "andre@praiadigital.example", status: "paid", issued: "2026-06-08", amount: 1510 },
  { id: "INV-2014", customer: "Zoe Hughes", email: "zoe@wildflower.example", status: "paid", issued: "2026-06-03", amount: 275.2 },
  { id: "INV-2013", customer: "Karim Benali", email: "karim@medinasoft.example", status: "overdue", issued: "2026-05-27", amount: 1960 },
  { id: "INV-2012", customer: "Eva Novak", email: "eva@vltava.example", status: "paid", issued: "2026-05-22", amount: 3475 },
  { id: "INV-2011", customer: "Samuel Adeyemi", email: "sam@lagoonlabs.example", status: "paid", issued: "2026-05-18", amount: 540 },
  { id: "INV-2010", customer: "Julia Rossi", email: "julia@trattoria-rossi.example", status: "pending", issued: "2026-05-13", amount: 428.75 },
  { id: "INV-2009", customer: "Henrik Berg", email: "henrik@skogen.example", status: "paid", issued: "2026-05-09", amount: 1999 },
  { id: "INV-2008", customer: "Camila Torres", email: "camila@andescloud.example", status: "refunded", issued: "2026-05-04", amount: 350 },
  { id: "INV-2007", customer: "Ravi Menon", email: "ravi@spicecoast.example", status: "paid", issued: "2026-04-29", amount: 815.6 },
]

const STATUS_LABEL: Record<Status, string> = {
  paid: "Paid",
  pending: "Pending",
  overdue: "Overdue",
  refunded: "Refunded",
}

const STATUS_CLASS: Record<Status, string> = {
  paid: "border-transparent bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  pending:
    "border-transparent bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  overdue:
    "border-transparent bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
  refunded: "border-transparent bg-secondary text-secondary-foreground",
}

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "paid", label: "Paid" },
  { value: "pending", label: "Pending" },
  { value: "overdue", label: "Overdue" },
  { value: "refunded", label: "Refunded" },
]

type SortKey = "id" | "customer" | "status" | "issued" | "amount"
type SortDir = "asc" | "desc"

const COLUMNS: { key: SortKey; label: string; numeric?: boolean; hideOnMobile?: boolean }[] = [
  { key: "id", label: "Invoice" },
  { key: "customer", label: "Customer" },
  { key: "status", label: "Status" },
  { key: "issued", label: "Issued", hideOnMobile: true },
  { key: "amount", label: "Amount", numeric: true },
]

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
})

function parseISO(value: string): Date {
  const [y, m, d] = value.split("-").map(Number)
  return new Date(y, m - 1, d)
}

function formatDate(value: string): string {
  return format(parseISO(value), "MMM d, yyyy")
}

function startOfDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
}

function compare(a: Invoice, b: Invoice, key: SortKey): number {
  switch (key) {
    case "amount":
      return a.amount - b.amount
    case "id":
    case "customer":
    case "status":
      return a[key].localeCompare(b[key], "en", { numeric: true })
    case "issued":
      return a.issued.localeCompare(b.issued)
  }
}

function pageList(current: number, total: number): (number | "gap-start" | "gap-end")[] {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1)
  const pages: (number | "gap-start" | "gap-end")[] = [1]
  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)
  if (start > 2) pages.push("gap-start")
  for (let p = start; p <= end; p++) pages.push(p)
  if (end < total - 1) pages.push("gap-end")
  pages.push(total)
  return pages
}

export default function Page() {
  const [status, setStatus] = React.useState<StatusFilter>("all")
  const [range, setRange] = React.useState<DateRange | undefined>(undefined)
  const [query, setQuery] = React.useState("")
  const [sort, setSort] = React.useState<{ key: SortKey; dir: SortDir }>({
    key: "issued",
    dir: "desc",
  })
  const [pageSize, setPageSize] = React.useState(10)
  const [page, setPage] = React.useState(1)

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    const from = range?.from ? startOfDay(range.from) : null
    const to = range?.to ? startOfDay(range.to) : from
    return INVOICES.filter((inv) => {
      if (status !== "all" && inv.status !== status) return false
      if (q) {
        const haystack = `${inv.id} ${inv.customer} ${inv.email}`.toLowerCase()
        if (!haystack.includes(q)) return false
      }
      if (from !== null && to !== null) {
        const t = parseISO(inv.issued).getTime()
        if (t < from || t > to) return false
      }
      return true
    })
  }, [status, query, range])

  const sorted = React.useMemo(() => {
    const factor = sort.dir === "asc" ? 1 : -1
    return [...filtered].sort((a, b) => factor * compare(a, b, sort.key))
  }, [filtered, sort])

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize))
  const currentPage = Math.min(page, pageCount)
  const startIndex = (currentPage - 1) * pageSize
  const rows = sorted.slice(startIndex, startIndex + pageSize)
  const total = filtered.reduce((sum, inv) => sum + inv.amount, 0)

  const hasFilters = status !== "all" || query !== "" || range?.from !== undefined

  function toggleSort(key: SortKey) {
    setSort((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { key, dir: key === "amount" || key === "issued" ? "desc" : "asc" }
    )
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
      ? `${format(range.from, "MMM d, yyyy")} – ${format(range.to, "MMM d, yyyy")}`
      : format(range.from, "MMM d, yyyy")
    : "Pick a date range"

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl">
            <h1>Invoices</h1>
          </CardTitle>
          <CardDescription>
            Review, search and filter invoices issued to customers.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {/* Filters row */}
          <div
            role="search"
            aria-label="Filter invoices"
            className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between"
          >
            <div className="flex flex-col gap-1.5">
              <span id="status-label" className="text-sm font-medium">
                Status
              </span>
              <div className="max-w-full overflow-x-auto pb-1">
                <ToggleGroup
                  type="single"
                  variant="outline"
                  value={status}
                  onValueChange={(value) => {
                    if (!value) return
                    setStatus(value as StatusFilter)
                    setPage(1)
                  }}
                  aria-labelledby="status-label"
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <ToggleGroupItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="date-range">Issued between</Label>
                <div className="flex items-center gap-1">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="date-range"
                        variant="outline"
                        className="w-full justify-start font-normal sm:w-[17rem]"
                      >
                        <CalendarIcon aria-hidden="true" />
                        <span className={range?.from ? "" : "text-muted-foreground"}>
                          {rangeLabel}
                        </span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="range"
                        numberOfMonths={2}
                        defaultMonth={range?.from ?? new Date(2026, 8, 1)}
                        selected={range}
                        onSelect={(next) => {
                          setRange(next)
                          setPage(1)
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                  {range?.from ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setRange(undefined)
                        setPage(1)
                      }}
                      aria-label="Clear date range"
                    >
                      <X aria-hidden="true" />
                    </Button>
                  ) : null}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="invoice-search">Search</Label>
                <div className="relative">
                  <Search
                    aria-hidden="true"
                    className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                  />
                  <Input
                    id="invoice-search"
                    type="search"
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value)
                      setPage(1)
                    }}
                    placeholder="Invoice, customer or email"
                    className="pl-9 sm:w-64"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
            <p role="status" aria-live="polite">
              {filtered.length} {filtered.length === 1 ? "invoice" : "invoices"} totaling{" "}
              <span className="font-medium text-foreground">{currency.format(total)}</span>
            </p>
            {hasFilters ? (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X aria-hidden="true" />
                Reset filters
              </Button>
            ) : null}
          </div>

          {/* Table */}
          <div className="overflow-hidden rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  {COLUMNS.map((col) => {
                    const active = sort.key === col.key
                    const ariaSort = active
                      ? sort.dir === "asc"
                        ? "ascending"
                        : "descending"
                      : "none"
                    const Icon = active
                      ? sort.dir === "asc"
                        ? ArrowUp
                        : ArrowDown
                      : ArrowUpDown
                    return (
                      <TableHead
                        key={col.key}
                        aria-sort={ariaSort}
                        className={[
                          col.numeric ? "text-right" : "",
                          col.hideOnMobile ? "hidden md:table-cell" : "",
                        ].join(" ")}
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          className={col.numeric ? "-mr-3 ml-auto" : "-ml-3"}
                          onClick={() => toggleSort(col.key)}
                        >
                          {col.label}
                          <Icon
                            aria-hidden="true"
                            className={active ? "" : "text-muted-foreground"}
                          />
                          <span className="sr-only">
                            {active
                              ? `, sorted ${ariaSort}. Activate to reverse.`
                              : ", activate to sort"}
                          </span>
                        </Button>
                      </TableHead>
                    )
                  })}
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length > 0 ? (
                  rows.map((inv) => (
                    <TableRow key={inv.id}>
                      <TableCell className="font-medium">{inv.id}</TableCell>
                      <TableCell>
                        <div className="font-medium">{inv.customer}</div>
                        <div className="hidden text-xs text-muted-foreground sm:block">
                          {inv.email}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={STATUS_CLASS[inv.status]}>
                          {STATUS_LABEL[inv.status]}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <time dateTime={inv.issued}>{formatDate(inv.issued)}</time>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {currency.format(inv.amount)}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={COLUMNS.length}
                      className="h-32 text-center text-muted-foreground"
                    >
                      No invoices match your filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-sm">
              <Label htmlFor="page-size" className="text-muted-foreground">
                Rows per page
              </Label>
              <Select
                value={String(pageSize)}
                onValueChange={(value) => {
                  setPageSize(Number(value))
                  setPage(1)
                }}
              >
                <SelectTrigger id="page-size" size="sm" className="w-[4.5rem]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[5, 10, 20].map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-muted-foreground" aria-live="polite">
                {sorted.length === 0
                  ? "0 results"
                  : `${startIndex + 1}–${Math.min(startIndex + pageSize, sorted.length)} of ${sorted.length}`}
              </span>
            </div>

            <nav aria-label="Pagination" className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="hidden sm:inline-flex"
                onClick={() => setPage(1)}
                disabled={currentPage === 1}
                aria-label="Go to first page"
              >
                <ChevronsLeft aria-hidden="true" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setPage(currentPage - 1)}
                disabled={currentPage === 1}
                aria-label="Go to previous page"
              >
                <ChevronLeft aria-hidden="true" />
              </Button>
              <ul className="hidden items-center gap-1 sm:flex">
                {pageList(currentPage, pageCount).map((p) =>
                  typeof p === "number" ? (
                    <li key={p}>
                      <Button
                        variant={p === currentPage ? "default" : "ghost"}
                        size="icon"
                        onClick={() => setPage(p)}
                        aria-label={`Page ${p}`}
                        aria-current={p === currentPage ? "page" : undefined}
                      >
                        {p}
                      </Button>
                    </li>
                  ) : (
                    <li key={p} aria-hidden="true" className="px-1 text-muted-foreground">
                      …
                    </li>
                  )
                )}
              </ul>
              <span className="px-2 text-sm text-muted-foreground sm:hidden">
                Page {currentPage} of {pageCount}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setPage(currentPage + 1)}
                disabled={currentPage === pageCount}
                aria-label="Go to next page"
              >
                <ChevronRight aria-hidden="true" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="hidden sm:inline-flex"
                onClick={() => setPage(pageCount)}
                disabled={currentPage === pageCount}
                aria-label="Go to last page"
              >
                <ChevronsRight aria-hidden="true" />
              </Button>
            </nav>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
