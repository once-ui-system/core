"use client"

import * as React from "react"
import { format, isValid } from "date-fns"
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
  FileSearchIcon,
} from "lucide-react"
import { type DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
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

/* ----------------------------------------------------------------------------
 * Data
 * ------------------------------------------------------------------------- */

type InvoiceStatus = "paid" | "pending" | "overdue" | "draft"

type Invoice = {
  id: string
  customer: string
  email: string
  plan: string
  amount: number
  status: InvoiceStatus
  issued: Date
}

const CUSTOMERS: ReadonlyArray<{ name: string; email: string }> = [
  { name: "Northwind Traders", email: "billing@northwind.example" },
  { name: "Lumen Analytics", email: "accounts@lumen.example" },
  { name: "Harbor & Vale", email: "finance@harborvale.example" },
  { name: "Quill Studio", email: "hello@quillstudio.example" },
  { name: "Brightpath Logistics", email: "ap@brightpath.example" },
  { name: "Fernhill Dental", email: "office@fernhill.example" },
  { name: "Atlas Robotics", email: "payables@atlasrobotics.example" },
  { name: "Moss & Marlow", email: "books@mossmarlow.example" },
  { name: "Copperline Energy", email: "invoices@copperline.example" },
  { name: "Tidewater Cafe Group", email: "owner@tidewater.example" },
  { name: "Juniper Health", email: "billing@juniperhealth.example" },
  { name: "Pinecone Education", email: "admin@pineconeedu.example" },
]

const PLANS: ReadonlyArray<{ name: string; amount: number }> = [
  { name: "Starter", amount: 49 },
  { name: "Team", amount: 189 },
  { name: "Business", amount: 649 },
  { name: "Enterprise", amount: 2400 },
]

const STATUS_CYCLE: ReadonlyArray<InvoiceStatus> = [
  "paid",
  "paid",
  "pending",
  "paid",
  "overdue",
  "paid",
  "draft",
  "pending",
  "paid",
  "overdue",
]

// Deterministic data (no Math.random / new Date) so server and client agree.
const INVOICES: ReadonlyArray<Invoice> = Array.from({ length: 48 }, (_, i) => {
  const customer = CUSTOMERS[(i * 5 + 3) % CUSTOMERS.length]
  const plan = PLANS[(i * 7 + 1) % PLANS.length]
  const seats = 1 + ((i * 3) % 5)
  const issued = new Date(2025, 0, 6 + i * 3)
  return {
    id: `INV-${String(2401 + i).padStart(4, "0")}`,
    customer: customer.name,
    email: customer.email,
    plan: plan.name,
    amount: plan.amount * seats + (i % 4) * 12.5,
    status: STATUS_CYCLE[(i * 3 + 1) % STATUS_CYCLE.length],
    issued,
  }
})

const MIN_DATE = INVOICES.reduce(
  (min, inv) => (inv.issued < min ? inv.issued : min),
  INVOICES[0].issued
)
const MAX_DATE = INVOICES.reduce(
  (max, inv) => (inv.issued > max ? inv.issued : max),
  INVOICES[0].issued
)

/* ----------------------------------------------------------------------------
 * Helpers
 * ------------------------------------------------------------------------- */

type StatusFilter = "all" | InvoiceStatus
type SortKey = "id" | "customer" | "plan" | "status" | "issued" | "amount"
type SortDir = "asc" | "desc"

const STATUS_OPTIONS: ReadonlyArray<{ value: StatusFilter; label: string }> = [
  { value: "all", label: "All" },
  { value: "paid", label: "Paid" },
  { value: "pending", label: "Pending" },
  { value: "overdue", label: "Overdue" },
  { value: "draft", label: "Draft" },
]

const STATUS_STYLES: Record<InvoiceStatus, string> = {
  paid: "border-transparent bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  pending:
    "border-transparent bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  overdue:
    "border-transparent bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
  draft: "border-transparent bg-secondary text-secondary-foreground",
}

const STATUS_RANK: Record<InvoiceStatus, number> = {
  overdue: 0,
  pending: 1,
  draft: 2,
  paid: 3,
}

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
})

function startOfDay(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
}

function compareInvoices(a: Invoice, b: Invoice, key: SortKey): number {
  switch (key) {
    case "id":
      return a.id.localeCompare(b.id)
    case "customer":
      return a.customer.localeCompare(b.customer)
    case "plan":
      return PLANS.findIndex((p) => p.name === a.plan) -
        PLANS.findIndex((p) => p.name === b.plan)
    case "status":
      return STATUS_RANK[a.status] - STATUS_RANK[b.status]
    case "issued":
      return a.issued.getTime() - b.issued.getTime()
    case "amount":
      return a.amount - b.amount
  }
}

function getPageList(current: number, total: number): Array<number | "gap"> {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages: Array<number | "gap"> = [1]
  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)
  if (start > 2) pages.push("gap")
  for (let p = start; p <= end; p++) pages.push(p)
  if (end < total - 1) pages.push("gap")
  pages.push(total)
  return pages
}

function formatRange(range: DateRange | undefined): string | null {
  if (!range?.from || !isValid(range.from)) return null
  if (!range.to || !isValid(range.to)) return format(range.from, "MMM d, yyyy")
  return `${format(range.from, "MMM d, yyyy")} – ${format(range.to, "MMM d, yyyy")}`
}

/* ----------------------------------------------------------------------------
 * Sortable header
 * ------------------------------------------------------------------------- */

type SortableHeadProps = {
  label: string
  sortKey: SortKey
  activeKey: SortKey
  dir: SortDir
  onSort: (key: SortKey) => void
  align?: "left" | "right"
  className?: string
}

function SortableHead({
  label,
  sortKey,
  activeKey,
  dir,
  onSort,
  align = "left",
  className,
}: SortableHeadProps) {
  const active = activeKey === sortKey
  const ariaSort: React.AriaAttributes["aria-sort"] = active
    ? dir === "asc"
      ? "ascending"
      : "descending"
    : "none"
  const Icon = active ? (dir === "asc" ? ArrowUpIcon : ArrowDownIcon) : ArrowUpDownIcon

  return (
    <TableHead aria-sort={ariaSort} className={cn("px-1", className)}>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => onSort(sortKey)}
        className={cn(
          "-mx-1 h-8 gap-1.5 px-2 font-medium",
          align === "right" && "ml-auto flex"
        )}
      >
        {label}
        <Icon
          aria-hidden="true"
          className={cn("size-3.5", !active && "text-muted-foreground")}
        />
        <span className="sr-only">
          {active
            ? `, sorted ${dir === "asc" ? "ascending" : "descending"}. Activate to reverse.`
            : ", not sorted. Activate to sort ascending."}
        </span>
      </Button>
    </TableHead>
  )
}

/* ----------------------------------------------------------------------------
 * Page
 * ------------------------------------------------------------------------- */

export default function Page() {
  const [status, setStatus] = React.useState<StatusFilter>("all")
  const [range, setRange] = React.useState<DateRange | undefined>(undefined)
  const [query, setQuery] = React.useState("")
  const [sortKey, setSortKey] = React.useState<SortKey>("issued")
  const [sortDir, setSortDir] = React.useState<SortDir>("desc")
  const [pageSize, setPageSize] = React.useState(10)
  const [page, setPage] = React.useState(1)
  const [rangeOpen, setRangeOpen] = React.useState(false)

  const searchId = React.useId()
  const statusLabelId = React.useId()
  const rangeLabelId = React.useId()

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    const from = range?.from ? startOfDay(range.from) : null
    const to = range?.to ? startOfDay(range.to) : from
    return INVOICES.filter((inv) => {
      if (status !== "all" && inv.status !== status) return false
      if (from !== null && to !== null) {
        const t = startOfDay(inv.issued)
        if (t < from || t > to) return false
      }
      if (q) {
        const hay = `${inv.id} ${inv.customer} ${inv.email} ${inv.plan}`.toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    })
  }, [status, range, query])

  const sorted = React.useMemo(() => {
    const factor = sortDir === "asc" ? 1 : -1
    return [...filtered].sort((a, b) => {
      const primary = compareInvoices(a, b, sortKey) * factor
      return primary !== 0 ? primary : a.id.localeCompare(b.id)
    })
  }, [filtered, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const startIndex = (currentPage - 1) * pageSize
  const pageRows = sorted.slice(startIndex, startIndex + pageSize)
  const showingFrom = sorted.length === 0 ? 0 : startIndex + 1
  const showingTo = startIndex + pageRows.length

  const filteredTotal = React.useMemo(
    () => filtered.reduce((sum, inv) => sum + inv.amount, 0),
    [filtered]
  )

  const hasFilters = status !== "all" || Boolean(range?.from) || query !== ""
  const rangeText = formatRange(range)

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortKey(key)
      setSortDir(key === "amount" || key === "issued" ? "desc" : "asc")
    }
    setPage(1)
  }

  function resetFilters() {
    setStatus("all")
    setRange(undefined)
    setQuery("")
    setPage(1)
  }

  const pages = getPageList(currentPage, totalPages)

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <header className="mb-6 flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
          Invoices
        </h1>
        <p className="text-sm text-muted-foreground">
          Track billing across customers. Filter by status or issue date, search,
          and sort any column.
        </p>
      </header>

      {/* Filters row */}
      <section
        aria-label="Filter invoices"
        className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"
      >
        <div className="flex flex-col gap-1.5">
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
              value={status}
              onValueChange={(v) => {
                // Radix emits "" when the active item is clicked; keep a selection.
                if (!v) return
                setStatus(v as StatusFilter)
                setPage(1)
              }}
              aria-labelledby={statusLabelId}
            >
              {STATUS_OPTIONS.map((opt) => (
                <ToggleGroupItem
                  key={opt.value}
                  value={opt.value}
                  className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:hover:bg-primary/90"
                >
                  {opt.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex flex-col gap-1.5">
            <span
              id={rangeLabelId}
              className="text-xs font-medium text-muted-foreground"
            >
              Issued between
            </span>
            <div className="flex items-center gap-1">
              <Popover open={rangeOpen} onOpenChange={setRangeOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    aria-labelledby={rangeLabelId}
                    className={cn(
                      "w-full justify-start text-left font-normal sm:w-72",
                      !rangeText && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon aria-hidden="true" />
                    <span className="truncate">{rangeText ?? "Pick a date range"}</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  align="start"
                  className="w-auto max-w-[calc(100vw-2rem)] overflow-x-auto p-0"
                >
                  <Calendar
                    mode="range"
                    defaultMonth={range?.from ?? MIN_DATE}
                    selected={range}
                    onSelect={(next) => {
                      setRange(next)
                      setPage(1)
                    }}
                    numberOfMonths={2}
                    startMonth={new Date(MIN_DATE.getFullYear(), MIN_DATE.getMonth())}
                    endMonth={new Date(MAX_DATE.getFullYear(), MAX_DATE.getMonth())}
                  />
                </PopoverContent>
              </Popover>
              {range?.from ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setRange(undefined)
                    setPage(1)
                  }}
                >
                  <XIcon aria-hidden="true" />
                  <span className="sr-only">Clear date range</span>
                </Button>
              ) : null}
            </div>
          </div>

          <div className="flex flex-col gap-1.5 sm:w-64">
            <label
              htmlFor={searchId}
              className="text-xs font-medium text-muted-foreground"
            >
              Search
            </label>
            <InputGroup>
              <InputGroupAddon>
                <SearchIcon aria-hidden="true" />
              </InputGroupAddon>
              <InputGroupInput
                id={searchId}
                type="search"
                placeholder="Customer, email or invoice"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setPage(1)
                }}
                autoComplete="off"
              />
              {query ? (
                <InputGroupAddon align="inline-end">
                  <InputGroupButton
                    size="icon-xs"
                    onClick={() => {
                      setQuery("")
                      setPage(1)
                    }}
                    aria-label="Clear search"
                  >
                    <XIcon aria-hidden="true" />
                  </InputGroupButton>
                </InputGroupAddon>
              ) : null}
            </InputGroup>
          </div>
        </div>
      </section>

      {/* Result summary */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-sm">
        <p className="text-muted-foreground" role="status" aria-live="polite">
          <span className="font-medium text-foreground">{sorted.length}</span>{" "}
          {sorted.length === 1 ? "invoice" : "invoices"} ·{" "}
          <span className="font-medium text-foreground">
            {currency.format(filteredTotal)}
          </span>{" "}
          total
        </p>
        {hasFilters ? (
          <Button type="button" variant="ghost" size="sm" onClick={resetFilters}>
            <XIcon aria-hidden="true" />
            Reset filters
          </Button>
        ) : null}
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-card text-card-foreground shadow-xs">
        <Table>
          <TableCaption className="sr-only">
            Invoices sorted by {sortKey}, {sortDir === "asc" ? "ascending" : "descending"}.
            Showing {showingFrom} to {showingTo} of {sorted.length}.
          </TableCaption>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <SortableHead
                label="Invoice"
                sortKey="id"
                activeKey={sortKey}
                dir={sortDir}
                onSort={handleSort}
                className="pl-3"
              />
              <SortableHead
                label="Customer"
                sortKey="customer"
                activeKey={sortKey}
                dir={sortDir}
                onSort={handleSort}
              />
              <SortableHead
                label="Plan"
                sortKey="plan"
                activeKey={sortKey}
                dir={sortDir}
                onSort={handleSort}
                className="hidden md:table-cell"
              />
              <SortableHead
                label="Status"
                sortKey="status"
                activeKey={sortKey}
                dir={sortDir}
                onSort={handleSort}
              />
              <SortableHead
                label="Issued"
                sortKey="issued"
                activeKey={sortKey}
                dir={sortDir}
                onSort={handleSort}
                className="hidden sm:table-cell"
              />
              <SortableHead
                label="Amount"
                sortKey="amount"
                activeKey={sortKey}
                dir={sortDir}
                onSort={handleSort}
                align="right"
                className="pr-3 text-right"
              />
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageRows.length > 0 ? (
              pageRows.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell className="py-3 pl-3 font-mono text-xs sm:text-sm">
                    {inv.id}
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="flex max-w-[11rem] flex-col sm:max-w-none">
                      <span className="truncate font-medium">{inv.customer}</span>
                      <span className="truncate text-xs text-muted-foreground">
                        {inv.email}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden py-3 md:table-cell">
                    {inv.plan}
                  </TableCell>
                  <TableCell className="py-3">
                    <Badge className={STATUS_STYLES[inv.status]}>
                      {inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden py-3 text-muted-foreground sm:table-cell">
                    <time dateTime={format(inv.issued, "yyyy-MM-dd")}>
                      {format(inv.issued, "MMM d, yyyy")}
                    </time>
                  </TableCell>
                  <TableCell className="py-3 pr-3 text-right font-medium tabular-nums">
                    {currency.format(inv.amount)}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={6} className="whitespace-normal p-0">
                  <Empty className="py-12">
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <FileSearchIcon aria-hidden="true" />
                      </EmptyMedia>
                      <EmptyTitle>No invoices found</EmptyTitle>
                      <EmptyDescription>
                        Nothing matches the current filters. Try a different
                        status, widen the date range, or clear the search.
                      </EmptyDescription>
                    </EmptyHeader>
                    <EmptyContent>
                      <Button type="button" variant="outline" onClick={resetFilters}>
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

      {/* Pagination */}
      <div className="mt-4 flex flex-col items-center gap-4 lg:flex-row lg:justify-between">
        <div className="flex flex-col items-center gap-3 text-sm text-muted-foreground sm:flex-row sm:gap-6">
          <p>
            Showing{" "}
            <span className="font-medium text-foreground">
              {showingFrom}–{showingTo}
            </span>{" "}
            of <span className="font-medium text-foreground">{sorted.length}</span>
          </p>
          <div className="flex items-center gap-2">
            <label htmlFor="rows-per-page" className="whitespace-nowrap">
              Rows per page
            </label>
            <Select
              value={String(pageSize)}
              onValueChange={(v) => {
                setPageSize(Number(v))
                setPage(1)
              }}
            >
              <SelectTrigger id="rows-per-page" size="sm" className="w-[4.5rem]">
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
          </div>
        </div>

        <nav aria-label="Pagination" className="max-w-full">
          <ul className="flex flex-wrap items-center justify-center gap-1">
            <li>
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                onClick={() => setPage(1)}
                disabled={currentPage === 1}
                className="hidden sm:inline-flex"
              >
                <ChevronsLeftIcon aria-hidden="true" />
                <span className="sr-only">First page</span>
              </Button>
            </li>
            <li>
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                onClick={() => setPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeftIcon aria-hidden="true" />
                <span className="sr-only">Previous page</span>
              </Button>
            </li>
            {/* Compact indicator on phones */}
            <li className="px-2 text-sm text-muted-foreground sm:hidden">
              Page {currentPage} of {totalPages}
            </li>
            {pages.map((p, idx) =>
              p === "gap" ? (
                <li
                  key={`gap-${idx}`}
                  aria-hidden="true"
                  className="hidden size-8 items-center justify-center text-muted-foreground sm:flex"
                >
                  …
                </li>
              ) : (
                <li key={p} className="hidden sm:block">
                  <Button
                    type="button"
                    variant={p === currentPage ? "default" : "outline"}
                    size="icon-sm"
                    aria-current={p === currentPage ? "page" : undefined}
                    onClick={() => setPage(p)}
                    className="tabular-nums"
                  >
                    <span className="sr-only">Page </span>
                    {p}
                  </Button>
                </li>
              )
            )}
            <li>
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                onClick={() => setPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <ChevronRightIcon aria-hidden="true" />
                <span className="sr-only">Next page</span>
              </Button>
            </li>
            <li>
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                onClick={() => setPage(totalPages)}
                disabled={currentPage === totalPages}
                className="hidden sm:inline-flex"
              >
                <ChevronsRightIcon aria-hidden="true" />
                <span className="sr-only">Last page</span>
              </Button>
            </li>
          </ul>
        </nav>
      </div>
    </main>
  )
}
