The error is the `asChild={undefined}` prop I passed to `CardTitle`, which doesn't support it. I removed it and put the `<h1>` inside `CardTitle` with the `text-xl` class. I also tidied the amount calculation. Everything else is unchanged.

```tsx
"use client"

import * as React from "react"
import { format } from "date-fns"
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
  SearchXIcon,
  XIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Empty,
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
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

type Status = "Paid" | "Pending" | "Refunded" | "Failed"
type StatusFilter = "all" | Status
type SortKey = "id" | "customer" | "date" | "status" | "amount"
type SortDir = "asc" | "desc"

interface Order {
  id: string
  customer: string
  email: string
  date: Date
  status: Status
  amount: number
}

const ANCHOR = new Date(2025, 5, 18)

const CUSTOMERS: ReadonlyArray<readonly [string, string]> = [
  ["Amara Okafor", "amara.okafor@northwind.example"],
  ["Lucas Meyer", "lucas.meyer@harbor.example"],
  ["Priya Raman", "priya.raman@lumen.example"],
  ["Diego Alvarez", "diego.alvarez@pinecrest.example"],
  ["Hannah Cole", "hannah.cole@brightside.example"],
  ["Yuki Tanaka", "yuki.tanaka@kiln.example"],
  ["Sofia Rossi", "sofia.rossi@trattoria.example"],
  ["Noah Fischer", "noah.fischer@alpine.example"],
  ["Leila Haddad", "leila.haddad@oasis.example"],
  ["Ethan Brooks", "ethan.brooks@summit.example"],
  ["Mia Johansson", "mia.johansson@fjord.example"],
  ["Oliver Grant", "oliver.grant@cobalt.example"],
]

const STATUS_CYCLE: ReadonlyArray<Status> = [
  "Paid",
  "Paid",
  "Pending",
  "Paid",
  "Refunded",
  "Paid",
  "Failed",
  "Pending",
  "Paid",
  "Paid",
]

const ORDERS: Order[] = Array.from({ length: 64 }, (_, i) => {
  const [customer, email] = CUSTOMERS[(i * 7 + 3) % CUSTOMERS.length]
  const date = new Date(ANCHOR)
  date.setDate(ANCHOR.getDate() - ((i * 37) % 90) - (i % 3))
  const amount = (((i * 7919) % 48000) + 1900) / 100
  return {
    id: `ORD-${String(5120 - i).padStart(5, "0")}`,
    customer,
    email,
    date,
    status: STATUS_CYCLE[(i * 3 + 1) % STATUS_CYCLE.length],
    amount,
  }
})

const STATUS_FILTERS: ReadonlyArray<{ value: StatusFilter; label: string }> = [
  { value: "all", label: "All" },
  { value: "Paid", label: "Paid" },
  { value: "Pending", label: "Pending" },
  { value: "Refunded", label: "Refunded" },
  { value: "Failed", label: "Failed" },
]

const STATUS_STYLES: Record<Status, string> = {
  Paid: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900",
  Pending:
    "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900",
  Refunded:
    "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-900",
  Failed:
    "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900",
}

const PAGE_SIZES = ["5", "10", "20"] as const

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
})

function startOfDay(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
}

function compare(a: Order, b: Order, key: SortKey): number {
  switch (key) {
    case "id":
      return a.id.localeCompare(b.id)
    case "customer":
      return a.customer.localeCompare(b.customer)
    case "date":
      return a.date.getTime() - b.date.getTime()
    case "status":
      return a.status.localeCompare(b.status)
    case "amount":
      return a.amount - b.amount
  }
}

function getPageItems(page: number, total: number): Array<number | "gap"> {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const items: Array<number | "gap"> = [1]
  const start = Math.max(2, page - 1)
  const end = Math.min(total - 1, page + 1)
  if (start > 2) items.push("gap")
  for (let p = start; p <= end; p++) items.push(p)
  if (end < total - 1) items.push("gap")
  items.push(total)
  return items
}

interface SortHeadProps {
  label: string
  sortKey: SortKey
  active: SortKey
  dir: SortDir
  onSort: (key: SortKey) => void
  align?: "left" | "right"
  className?: string
}

function SortHead({
  label,
  sortKey,
  active,
  dir,
  onSort,
  align = "left",
  className,
}: SortHeadProps) {
  const isActive = active === sortKey
  const ariaSort: React.AriaAttributes["aria-sort"] = isActive
    ? dir === "asc"
      ? "ascending"
      : "descending"
    : "none"
  const Icon = isActive
    ? dir === "asc"
      ? ArrowUpIcon
      : ArrowDownIcon
    : ArrowUpDownIcon

  return (
    <TableHead aria-sort={ariaSort} className={className}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onSort(sortKey)}
        className={cn(
          "-mx-2 h-8 px-2 font-medium",
          align === "right" && "ml-auto flex"
        )}
      >
        {label}
        <Icon
          aria-hidden="true"
          className={cn("size-3.5", !isActive && "text-muted-foreground")}
        />
        <span className="sr-only">
          {isActive
            ? `, sorted ${dir === "asc" ? "ascending" : "descending"}. Activate to reverse.`
            : ", not sorted. Activate to sort ascending."}
        </span>
      </Button>
    </TableHead>
  )
}

export default function Page() {
  const [status, setStatus] = React.useState<StatusFilter>("all")
  const [range, setRange] = React.useState<DateRange | undefined>(undefined)
  const [rangeOpen, setRangeOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const [sortKey, setSortKey] = React.useState<SortKey>("date")
  const [sortDir, setSortDir] = React.useState<SortDir>("desc")
  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState<string>("10")

  const size = Number(pageSize)

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    const from = range?.from ? startOfDay(range.from) : null
    const to = range?.to
      ? startOfDay(range.to)
      : range?.from
        ? startOfDay(range.from)
        : null

    return ORDERS.filter((o) => {
      if (status !== "all" && o.status !== status) return false
      const day = startOfDay(o.date)
      if (from !== null && day < from) return false
      if (to !== null && day > to) return false
      if (
        q &&
        !(
          o.customer.toLowerCase().includes(q) ||
          o.email.toLowerCase().includes(q) ||
          o.id.toLowerCase().includes(q)
        )
      )
        return false
      return true
    })
  }, [status, range, query])

  const sorted = React.useMemo(() => {
    const factor = sortDir === "asc" ? 1 : -1
    return [...filtered].sort((a, b) => {
      const result = compare(a, b, sortKey)
      return result !== 0 ? result * factor : a.id.localeCompare(b.id)
    })
  }, [filtered, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(sorted.length / size))
  const currentPage = Math.min(page, totalPages)
  const startIndex = (currentPage - 1) * size
  const rows = sorted.slice(startIndex, startIndex + size)
  const firstShown = sorted.length === 0 ? 0 : startIndex + 1
  const lastShown = startIndex + rows.length

  const hasFilters = status !== "all" || range !== undefined || query !== ""

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortKey(key)
      setSortDir(key === "amount" || key === "date" ? "desc" : "asc")
    }
    setPage(1)
  }

  function resetFilters() {
    setStatus("all")
    setRange(undefined)
    setQuery("")
    setPage(1)
  }

  const rangeLabel = range?.from
    ? range.to
      ? `${format(range.from, "MMM d, yyyy")} – ${format(range.to, "MMM d, yyyy")}`
      : format(range.from, "MMM d, yyyy")
    : "Pick a date range"

  const pageItems = getPageItems(currentPage, totalPages)

  return (
    <main className="min-h-screen bg-muted/30 px-4 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto w-full max-w-6xl">
        <Card className="gap-4">
          <CardHeader>
            <CardTitle className="text-xl">
              <h1>Orders</h1>
            </CardTitle>
            <CardDescription>
              Review recent customer orders, filter by status or date, and sort
              by any column.
            </CardDescription>
          </CardHeader>

          <CardContent className="flex flex-col gap-4">
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
                  onValueChange={(v) => {
                    if (!v) return
                    setStatus(v as StatusFilter)
                    setPage(1)
                  }}
                  aria-label="Filter by status"
                >
                  {STATUS_FILTERS.map((f) => (
                    <ToggleGroupItem
                      key={f.value}
                      value={f.value}
                      aria-label={`${f.label} orders`}
                    >
                      {f.label}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Popover open={rangeOpen} onOpenChange={setRangeOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      data-empty={!range?.from}
                      aria-label={
                        range?.from
                          ? `Date range: ${rangeLabel}. Change date range`
                          : "Filter by date range"
                      }
                      className="w-full justify-start font-normal data-[empty=true]:text-muted-foreground sm:w-[270px]"
                    >
                      <CalendarIcon aria-hidden="true" />
                      <span className="truncate">{rangeLabel}</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="end" className="w-auto p-0">
                    <Calendar
                      mode="range"
                      numberOfMonths={1}
                      defaultMonth={range?.from ?? ANCHOR}
                      selected={range}
                      onSelect={(r) => {
                        setRange(r)
                        setPage(1)
                      }}
                      disabled={{ after: ANCHOR }}
                    />
                    <div className="flex items-center justify-between gap-2 border-t p-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={!range}
                        onClick={() => {
                          setRange(undefined)
                          setPage(1)
                        }}
                      >
                        Clear
                      </Button>
                      <Button size="sm" onClick={() => setRangeOpen(false)}>
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
                    placeholder="Search customer or order ID"
                    aria-label="Search orders by customer, email or order ID"
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value)
                      setPage(1)
                    }}
                    className="[&::-webkit-search-cancel-button]:hidden"
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
                        <XIcon aria-hidden="true" />
                      </InputGroupButton>
                    </InputGroupAddon>
                  )}
                </InputGroup>
              </div>
            </div>

            <div className="flex min-h-8 items-center justify-between gap-2 text-sm text-muted-foreground">
              <p aria-live="polite" role="status">
                {sorted.length === 0
                  ? "No orders match your filters"
                  : `${sorted.length} ${sorted.length === 1 ? "order" : "orders"}`}
              </p>
              {hasFilters && (
                <Button variant="ghost" size="sm" onClick={resetFilters}>
                  <XIcon aria-hidden="true" />
                  Reset filters
                </Button>
              )}
            </div>

            {/* Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow className="hover:bg-transparent">
                    <SortHead
                      label="Order"
                      sortKey="id"
                      active={sortKey}
                      dir={sortDir}
                      onSort={handleSort}
                      className="pl-4"
                    />
                    <SortHead
                      label="Customer"
                      sortKey="customer"
                      active={sortKey}
                      dir={sortDir}
                      onSort={handleSort}
                    />
                    <SortHead
                      label="Date"
                      sortKey="date"
                      active={sortKey}
                      dir={sortDir}
                      onSort={handleSort}
                    />
                    <SortHead
                      label="Status"
                      sortKey="status"
                      active={sortKey}
                      dir={sortDir}
                      onSort={handleSort}
                    />
                    <SortHead
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
                  {rows.map((o) => (
                    <TableRow key={o.id}>
                      <TableCell className="pl-4 font-mono text-xs">
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
                      <TableCell className="text-muted-foreground">
                        <time dateTime={format(o.date, "yyyy-MM-dd")}>
                          {format(o.date, "MMM d, yyyy")}
                        </time>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={STATUS_STYLES[o.status]}
                        >
                          {o.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="pr-4 text-right font-medium tabular-nums">
                        {currency.format(o.amount)}
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
                    <EmptyTitle>No orders found</EmptyTitle>
                    <EmptyDescription>
                      Try a different search term, widen the date range, or
                      choose another status.
                    </EmptyDescription>
                  </EmptyHeader>
                  <Button variant="outline" size="sm" onClick={resetFilters}>
                    Reset filters
                  </Button>
                </Empty>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex w-full items-center justify-between gap-4 lg:w-auto lg:justify-start">
              <p className="text-sm text-muted-foreground">
                Showing{" "}
                <span className="font-medium text-foreground tabular-nums">
                  {firstShown}–{lastShown}
                </span>{" "}
                of{" "}
                <span className="font-medium text-foreground tabular-nums">
                  {sorted.length}
                </span>
              </p>
              <div className="flex items-center gap-2">
                <span
                  id="page-size-label"
                  className="text-sm text-muted-foreground"
                >
                  Rows
                </span>
                <Select
                  value={pageSize}
                  onValueChange={(v) => {
                    setPageSize(v)
                    setPage(1)
                  }}
                >
                  <SelectTrigger
                    size="sm"
                    className="w-[72px]"
                    aria-labelledby="page-size-label"
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
              <ul className="flex items-center gap-1">
                <li className="hidden sm:block">
                  <Button
                    variant="outline"
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
                    variant="outline"
                    size="icon-sm"
                    aria-label="Go to previous page"
                    disabled={currentPage === 1}
                    onClick={() => setPage(currentPage - 1)}
                  >
                    <ChevronLeftIcon aria-hidden="true" />
                  </Button>
                </li>

                {/* Compact indicator on small screens */}
                <li className="px-2 text-sm text-muted-foreground tabular-nums sm:hidden">
                  Page {currentPage} of {totalPages}
                </li>

                {pageItems.map((item, idx) =>
                  item === "gap" ? (
                    <li
                      key={`gap-${idx}`}
                      aria-hidden="true"
                      className="hidden px-1 text-muted-foreground sm:block"
                    >
                      …
                    </li>
                  ) : (
                    <li key={item} className="hidden sm:block">
                      <Button
                        variant={item === currentPage ? "default" : "ghost"}
                        size="icon-sm"
                        aria-label={`Go to page ${item}`}
                        aria-current={item === currentPage ? "page" : undefined}
                        onClick={() => setPage(item)}
                        className="tabular-nums"
                      >
                        {item}
                      </Button>
                    </li>
                  )
                )}

                <li>
                  <Button
                    variant="outline"
                    size="icon-sm"
                    aria-label="Go to next page"
                    disabled={currentPage === totalPages}
                    onClick={() => setPage(currentPage + 1)}
                  >
                    <ChevronRightIcon aria-hidden="true" />
                  </Button>
                </li>
                <li className="hidden sm:block">
                  <Button
                    variant="outline"
                    size="icon-sm"
                    aria-label="Go to last page"
                    disabled={currentPage === totalPages}
                    onClick={() => setPage(totalPages)}
                  >
                    <ChevronsRightIcon aria-hidden="true" />
                  </Button>
                </li>
              </ul>
            </nav>
          </CardFooter>
        </Card>
      </div>
    </main>
  )
}
```