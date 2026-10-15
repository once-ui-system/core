I have what I need. Writing the page now.

Notes on the approach:
- `Input` is a controlled field; I'm assuming the standard `value`/`onChange` (`ChangeEvent<HTMLInputElement>`) props via its HTML input extension.
- Dates are fixed ISO strings, so there's no hydration mismatch from `Date.now()`.
- `DataTable` gets controlled `sort`, `page` and `perPage`. I filter and sort in state so the count and empty state are accurate.

```tsx
"use client";

import {
  Button,
  Column,
  DataTable,
  DateRangeInput,
  Heading,
  Input,
  Row,
  SegmentedControl,
  Tag,
  Text,
} from "@once-ui-system/core";
import { useMemo, useState } from "react";

type Status = "paid" | "pending" | "overdue" | "refunded";

type Invoice = {
  id: string;
  customer: string;
  email: string;
  plan: string;
  amount: number;
  status: Status;
  issued: string; // ISO yyyy-mm-dd
};

const invoices: Invoice[] = [
  { id: "INV-2041", customer: "Marlowe & Finch", email: "billing@marlowefinch.co", plan: "Business", amount: 1290, status: "paid", issued: "2026-09-02" },
  { id: "INV-2042", customer: "Northwind Logistics", email: "ap@northwind.example", plan: "Enterprise", amount: 4800, status: "pending", issued: "2026-09-04" },
  { id: "INV-2043", customer: "Tessellate Studio", email: "hello@tessellate.design", plan: "Starter", amount: 190, status: "paid", issued: "2026-09-05" },
  { id: "INV-2044", customer: "Brightwater Clinics", email: "finance@brightwater.health", plan: "Business", amount: 1290, status: "overdue", issued: "2026-08-14" },
  { id: "INV-2045", customer: "Ozer Robotics", email: "accounts@ozer.io", plan: "Enterprise", amount: 6200, status: "paid", issued: "2026-09-09" },
  { id: "INV-2046", customer: "Halden Books", email: "orders@haldenbooks.no", plan: "Starter", amount: 190, status: "refunded", issued: "2026-09-10" },
  { id: "INV-2047", customer: "Kestrel Aerospace", email: "ap@kestrel.aero", plan: "Enterprise", amount: 9400, status: "pending", issued: "2026-09-12" },
  { id: "INV-2048", customer: "Lumen Coffee Roasters", email: "owner@lumencoffee.com", plan: "Starter", amount: 190, status: "paid", issued: "2026-09-13" },
  { id: "INV-2049", customer: "Pinecrest Realty", email: "billing@pinecrest.homes", plan: "Business", amount: 1290, status: "overdue", issued: "2026-08-22" },
  { id: "INV-2050", customer: "Vantage Analytics", email: "ap@vantage.ai", plan: "Enterprise", amount: 5100, status: "paid", issued: "2026-09-15" },
  { id: "INV-2051", customer: "Cobalt Credit Union", email: "vendors@cobaltcu.org", plan: "Business", amount: 1290, status: "paid", issued: "2026-09-16" },
  { id: "INV-2052", customer: "Arbor & Vine", email: "hi@arborvine.shop", plan: "Starter", amount: 190, status: "pending", issued: "2026-09-18" },
  { id: "INV-2053", customer: "Solstice Energy", email: "payables@solstice.energy", plan: "Enterprise", amount: 7750, status: "paid", issued: "2026-09-19" },
  { id: "INV-2054", customer: "Quill Legal Group", email: "accounts@quill.law", plan: "Business", amount: 1290, status: "refunded", issued: "2026-09-21" },
  { id: "INV-2055", customer: "Drift Cycles", email: "team@driftcycles.cc", plan: "Starter", amount: 190, status: "paid", issued: "2026-09-22" },
  { id: "INV-2056", customer: "Fernhill Academy", email: "bursar@fernhill.edu", plan: "Business", amount: 1290, status: "pending", issued: "2026-09-24" },
  { id: "INV-2057", customer: "Meridian Freight", email: "ap@meridianfreight.com", plan: "Enterprise", amount: 8300, status: "overdue", issued: "2026-08-30" },
  { id: "INV-2058", customer: "Saffron Table", email: "kitchen@saffrontable.com", plan: "Starter", amount: 190, status: "paid", issued: "2026-09-26" },
  { id: "INV-2059", customer: "Ironbridge Capital", email: "finance@ironbridge.capital", plan: "Enterprise", amount: 12500, status: "paid", issued: "2026-09-27" },
  { id: "INV-2060", customer: "Wren Photography", email: "wren@wrenphoto.me", plan: "Starter", amount: 190, status: "pending", issued: "2026-09-29" },
  { id: "INV-2061", customer: "Bayline Marine", email: "ap@baylinemarine.com", plan: "Business", amount: 1290, status: "paid", issued: "2026-10-01" },
  { id: "INV-2062", customer: "Olive Grove Hotels", email: "accounts@olivegrove.hotel", plan: "Enterprise", amount: 6900, status: "pending", issued: "2026-10-02" },
  { id: "INV-2063", customer: "Paperkite Games", email: "money@paperkite.gg", plan: "Business", amount: 1290, status: "paid", issued: "2026-10-03" },
  { id: "INV-2064", customer: "Granite Peak Outfitters", email: "ap@granitepeak.outdoors", plan: "Business", amount: 1290, status: "overdue", issued: "2026-09-01" },
  { id: "INV-2065", customer: "Nimbus Cloud Labs", email: "billing@nimbuslabs.dev", plan: "Enterprise", amount: 5600, status: "paid", issued: "2026-10-05" },
];

type Filter = "all" | Status;

const statusMeta: Record<Status, { scheme: "success" | "warning" | "danger" | "neutral"; label: string }> = {
  paid: { scheme: "success", label: "Paid" },
  pending: { scheme: "warning", label: "Pending" },
  overdue: { scheme: "danger", label: "Overdue" },
  refunded: { scheme: "neutral", label: "Refunded" },
};

const statusButtons: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "paid", label: "Paid" },
  { value: "pending", label: "Pending" },
  { value: "overdue", label: "Overdue" },
  { value: "refunded", label: "Refunded" },
];

type SortState = { key: string; direction: "asc" | "desc" } | null;
type Range = { startDate: Date | undefined; endDate: Date | undefined };

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

// Fixed locale + UTC so server and client render identical text.
const dateFormat = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

function toTime(iso: string): number {
  return new Date(`${iso}T00:00:00Z`).getTime();
}

function startOfDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

function localTime(iso: string): number {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).getTime();
}

const sorters: Record<string, (a: Invoice, b: Invoice) => number> = {
  id: (a, b) => a.id.localeCompare(b.id),
  customer: (a, b) => a.customer.localeCompare(b.customer),
  plan: (a, b) => a.plan.localeCompare(b.plan),
  amount: (a, b) => a.amount - b.amount,
  status: (a, b) => a.status.localeCompare(b.status),
  issued: (a, b) => toTime(a.issued) - toTime(b.issued),
};

export default function Page() {
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [range, setRange] = useState<Range>({ startDate: undefined, endDate: undefined });
  const [sort, setSort] = useState<SortState>({ key: "issued", direction: "desc" });
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(8);

  const hasFilters =
    filter !== "all" || query.trim() !== "" || range.startDate !== undefined || range.endDate !== undefined;

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const start = range.startDate ? startOfDay(range.startDate) : undefined;
    const end = range.endDate ? startOfDay(range.endDate) : undefined;

    const rows = invoices.filter((inv) => {
      if (filter !== "all" && inv.status !== filter) return false;
      if (q && !`${inv.id} ${inv.customer} ${inv.email}`.toLowerCase().includes(q)) return false;
      const issued = localTime(inv.issued);
      if (start !== undefined && issued < start) return false;
      if (end !== undefined && issued > end) return false;
      return true;
    });

    if (sort && sorters[sort.key]) {
      const compare = sorters[sort.key];
      const dir = sort.direction === "asc" ? 1 : -1;
      rows.sort((a, b) => compare(a, b) * dir);
    }
    return rows;
  }, [filter, query, range, sort]);

  const totalOutstanding = useMemo(
    () =>
      visible
        .filter((inv) => inv.status === "pending" || inv.status === "overdue")
        .reduce((sum, inv) => sum + inv.amount, 0),
    [visible],
  );

  const resetFilters = () => {
    setFilter("all");
    setQuery("");
    setRange({ startDate: undefined, endDate: undefined });
    setPage(1);
  };

  return (
    <Column as="main" fillWidth horizontal="center" paddingY="40" paddingX="16">
      <Column maxWidth="l" gap="24">
        <Row
          fillWidth
          horizontal="between"
          vertical="end"
          gap="16"
          s={{ direction: "column", horizontal: "start", vertical: "start" }}
        >
          <Column gap="8">
            <Heading as="h1" variant="display-strong-xs">
              Invoices
            </Heading>
            <Text variant="body-default-s" onBackground="neutral-weak">
              Track what has been billed, what is outstanding and what was refunded.
            </Text>
          </Column>
          <Button prefixIcon="plus">New invoice</Button>
        </Row>

        <Column
          as="section"
          aria-label="Filters"
          gap="12"
          background="surface"
          border
          radius="l"
          padding="16"
        >
          <Row
            fillWidth
            gap="12"
            vertical="end"
            s={{ direction: "column", vertical: "stretch" }}
          >
            <Column flex={1} minWidth={16}>
              <Input
                id="invoice-search"
                label="Search invoices"
                placeholder="Customer, email or invoice number"
                type="search"
                value={query}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  setQuery(event.target.value);
                  setPage(1);
                }}
              />
            </Column>
            <Column flex={1} minWidth={16}>
              <DateRangeInput
                id="invoice-dates"
                startLabel="Issued from"
                endLabel="Issued to"
                value={range}
                onChange={(next) => {
                  setRange(next);
                  setPage(1);
                }}
              />
            </Column>
          </Row>

          <Row fillWidth horizontal="between" vertical="center" gap="12" wrap>
            <SegmentedControl
              fillWidth={false}
              compact
              value={filter}
              onChange={(value) => {
                setFilter(value as Filter);
                setPage(1);
              }}
              buttons={statusButtons}
            />
            {hasFilters ? (
              <Button size="s" variant="tertiary" prefixIcon="close" onClick={resetFilters}>
                Clear filters
              </Button>
            ) : null}
          </Row>
        </Column>

        <Row fillWidth horizontal="between" vertical="center" gap="8" wrap>
          <Text variant="label-default-s" onBackground="neutral-weak" aria-live="polite">
            {visible.length} {visible.length === 1 ? "invoice" : "invoices"}
          </Text>
          <Text variant="label-default-s" onBackground="neutral-weak">
            Outstanding: {currency.format(totalOutstanding)}
          </Text>
        </Row>

        <DataTable<Invoice>
          aria-label="Invoices"
          rows={visible}
          getRowId={(row) => row.id}
          sort={sort}
          onSortChange={(next) => {
            setSort(next);
            setPage(1);
          }}
          paginated
          page={page}
          onPageChange={setPage}
          perPage={perPage}
          onPerPageChange={(next) => {
            setPerPage(next);
            setPage(1);
          }}
          perPageOptions={[5, 8, 10, 25]}
          columns={[
            {
              key: "id",
              header: "Invoice",
              sortable: true,
              sort: sorters.id,
              cell: (row) => <Text variant="code-default-s">{row.id}</Text>,
            },
            {
              key: "customer",
              header: "Customer",
              sortable: true,
              sort: sorters.customer,
              cell: (row) => (
                <Column gap="4">
                  <Text variant="label-default-s">{row.customer}</Text>
                  <Text variant="body-default-xs" onBackground="neutral-weak">
                    {row.email}
                  </Text>
                </Column>
              ),
            },
            {
              key: "plan",
              header: "Plan",
              sortable: true,
              sort: sorters.plan,
              cell: (row) => row.plan,
            },
            {
              key: "status",
              header: "Status",
              sortable: true,
              sort: sorters.status,
              cell: (row) => (
                <Tag size="s" scheme={statusMeta[row.status].scheme}>
                  {statusMeta[row.status].label}
                </Tag>
              ),
            },
            {
              key: "issued",
              header: "Issued",
              sortable: true,
              sort: sorters.issued,
              cell: (row) => dateFormat.format(new Date(`${row.issued}T00:00:00Z`)),
            },
            {
              key: "amount",
              header: "Amount",
              sortable: true,
              sort: sorters.amount,
              align: "right",
              cell: (row) => currency.format(row.amount),
            },
          ]}
          emptyState={
            <Column center gap="12" padding="32">
              <Text variant="label-default-m">No invoices match these filters</Text>
              <Text variant="body-default-s" onBackground="neutral-weak" align="center">
                Try a different search term or widen the date range.
              </Text>
              <Button size="s" variant="secondary" onClick={resetFilters}>
                Clear all filters
              </Button>
            </Column>
          }
        />
      </Column>
    </Column>
  );
}
```