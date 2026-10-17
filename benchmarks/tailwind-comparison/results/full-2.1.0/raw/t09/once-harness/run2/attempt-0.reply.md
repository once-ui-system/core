The page below is a sortable orders table with a status filter, date range, search and pagination. I haven't type-checked it, run `next build`, or viewed it in a browser. I also couldn't confirm how `DataTable` handles the `sort` prop, so the page filters, sorts and slices the rows itself and gives the table's sort comparators a no-op, to avoid double-sorting.

```tsx
"use client";

import {
  Button,
  Column,
  DataTable,
  DateRangeInput,
  Heading,
  Input,
  Pagination,
  Row,
  SegmentedControl,
  Tag,
  Text,
} from "@once-ui-system/core";
import { useMemo, useState } from "react";

type Status = "paid" | "pending" | "refunded" | "failed";
type Filter = "all" | Status;

type Order = {
  id: string;
  customer: string;
  email: string;
  plan: string;
  amount: number;
  status: Status;
  date: string; // ISO yyyy-mm-dd
};

type SortState = { key: string; direction: "asc" | "desc" } | null;
type Range = { startDate?: Date; endDate?: Date };

const orders: Order[] = [
  { id: "ORD-4821", customer: "Maya Hernandez", email: "maya@fernhollow.co", plan: "Team annual", amount: 1188, status: "paid", date: "2026-10-14" },
  { id: "ORD-4820", customer: "Jonas Lindqvist", email: "jonas@northpier.io", plan: "Pro monthly", amount: 49, status: "paid", date: "2026-10-14" },
  { id: "ORD-4819", customer: "Priya Natarajan", email: "priya@lumenlabs.dev", plan: "Team monthly", amount: 129, status: "pending", date: "2026-10-13" },
  { id: "ORD-4818", customer: "Tobias Weber", email: "tobias@kellerwerk.de", plan: "Enterprise", amount: 4800, status: "paid", date: "2026-10-12" },
  { id: "ORD-4817", customer: "Amara Okonkwo", email: "amara@sunbridge.ng", plan: "Pro annual", amount: 468, status: "refunded", date: "2026-10-11" },
  { id: "ORD-4816", customer: "Liam O'Sullivan", email: "liam@harborfreight.ie", plan: "Team monthly", amount: 129, status: "failed", date: "2026-10-10" },
  { id: "ORD-4815", customer: "Sofia Rossi", email: "sofia@vetrinadesign.it", plan: "Pro monthly", amount: 49, status: "paid", date: "2026-10-09" },
  { id: "ORD-4814", customer: "Kenji Watanabe", email: "kenji@tsukimi.jp", plan: "Team annual", amount: 1188, status: "paid", date: "2026-10-08" },
  { id: "ORD-4813", customer: "Elena Petrova", email: "elena@birchandco.eu", plan: "Pro annual", amount: 468, status: "pending", date: "2026-10-07" },
  { id: "ORD-4812", customer: "Marcus Bell", email: "marcus@tallpine.com", plan: "Starter", amount: 19, status: "paid", date: "2026-10-06" },
  { id: "ORD-4811", customer: "Noor Al-Farsi", email: "noor@dunesoft.ae", plan: "Enterprise", amount: 6200, status: "paid", date: "2026-10-05" },
  { id: "ORD-4810", customer: "Hannah Fischer", email: "hannah@wiesenhof.at", plan: "Pro monthly", amount: 49, status: "failed", date: "2026-10-04" },
  { id: "ORD-4809", customer: "Diego Alvarez", email: "diego@calleviva.mx", plan: "Team monthly", amount: 129, status: "paid", date: "2026-10-03" },
  { id: "ORD-4808", customer: "Chloe Dubois", email: "chloe@atelierdubois.fr", plan: "Starter", amount: 19, status: "refunded", date: "2026-10-02" },
  { id: "ORD-4807", customer: "Arjun Mehta", email: "arjun@paperkite.in", plan: "Team annual", amount: 1188, status: "paid", date: "2026-10-01" },
  { id: "ORD-4806", customer: "Freya Nilsen", email: "freya@fjordworks.no", plan: "Pro annual", amount: 468, status: "paid", date: "2026-09-30" },
  { id: "ORD-4805", customer: "Samuel Adeyemi", email: "samuel@brightcrate.co", plan: "Starter", amount: 19, status: "pending", date: "2026-09-28" },
  { id: "ORD-4804", customer: "Isabelle Martin", email: "isabelle@quaiouest.fr", plan: "Team monthly", amount: 129, status: "paid", date: "2026-09-27" },
  { id: "ORD-4803", customer: "Yusuf Demir", email: "yusuf@bosphorusit.tr", plan: "Enterprise", amount: 5400, status: "paid", date: "2026-09-25" },
  { id: "ORD-4802", customer: "Grace Thompson", email: "grace@oakleaf.org", plan: "Pro monthly", amount: 49, status: "refunded", date: "2026-09-24" },
  { id: "ORD-4801", customer: "Mateo Fernandez", email: "mateo@solcreativo.es", plan: "Pro monthly", amount: 49, status: "paid", date: "2026-09-22" },
  { id: "ORD-4800", customer: "Aisha Khan", email: "aisha@crescentlabs.pk", plan: "Team annual", amount: 1188, status: "failed", date: "2026-09-20" },
  { id: "ORD-4799", customer: "Oliver Grant", email: "oliver@stonebridge.uk", plan: "Starter", amount: 19, status: "paid", date: "2026-09-18" },
  { id: "ORD-4798", customer: "Lucia Moreau", email: "lucia@maisonmoreau.fr", plan: "Pro annual", amount: 468, status: "paid", date: "2026-09-15" },
  { id: "ORD-4797", customer: "Henrik Larsen", email: "henrik@nordlys.dk", plan: "Team monthly", amount: 129, status: "pending", date: "2026-09-12" },
  { id: "ORD-4796", customer: "Zara Ahmed", email: "zara@kitebrook.co", plan: "Starter", amount: 19, status: "paid", date: "2026-09-09" },
];

const statusTag: Record<Status, { scheme: "success" | "warning" | "danger" | "info"; label: string }> = {
  paid: { scheme: "success", label: "Paid" },
  pending: { scheme: "warning", label: "Pending" },
  refunded: { scheme: "info", label: "Refunded" },
  failed: { scheme: "danger", label: "Failed" },
};

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function toDay(iso: string): number {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).getTime();
}

function startOfDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

function compareOrders(a: Order, b: Order, key: string): number {
  switch (key) {
    case "id":
      return a.id.localeCompare(b.id);
    case "customer":
      return a.customer.localeCompare(b.customer);
    case "plan":
      return a.plan.localeCompare(b.plan);
    case "status":
      return statusTag[a.status].label.localeCompare(statusTag[b.status].label);
    case "amount":
      return a.amount - b.amount;
    case "date":
      return toDay(a.date) - toDay(b.date);
    default:
      return 0;
  }
}

// Sorting is done by the page before rows reach the table, so the table's own
// comparators must never reorder the data again.
const keepOrder = () => 0;

const filterOptions: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "paid", label: "Paid" },
  { value: "pending", label: "Pending" },
  { value: "refunded", label: "Refunded" },
  { value: "failed", label: "Failed" },
];

export default function Page() {
  const [filter, setFilter] = useState<Filter>("all");
  const [range, setRange] = useState<Range>({});
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortState>({ key: "date", direction: "desc" });
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(8);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const start = range.startDate ? startOfDay(range.startDate) : null;
    const end = range.endDate ? startOfDay(range.endDate) : null;
    return orders.filter((order) => {
      if (filter !== "all" && order.status !== filter) return false;
      const day = toDay(order.date);
      if (start !== null && day < start) return false;
      if (end !== null && day > end) return false;
      if (q) {
        const haystack = `${order.id} ${order.customer} ${order.email} ${order.plan}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [filter, range, query]);

  const sorted = useMemo(() => {
    if (!sort) return filtered;
    const factor = sort.direction === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => factor * compareOrders(a, b, sort.key));
  }, [filtered, sort]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / perPage));
  const currentPage = Math.min(page, pageCount);
  const pageRows = sorted.slice((currentPage - 1) * perPage, currentPage * perPage);
  const firstShown = sorted.length === 0 ? 0 : (currentPage - 1) * perPage + 1;
  const lastShown = Math.min(currentPage * perPage, sorted.length);

  const hasActiveFilters =
    filter !== "all" || query.trim() !== "" || !!range.startDate || !!range.endDate;

  const resetFilters = () => {
    setFilter("all");
    setQuery("");
    setRange({});
    setPage(1);
  };

  return (
    <Column as="main" fillWidth horizontal="center" paddingY="48" paddingX="24" s={{ paddingX: "16", paddingY: "24" }}>
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
              Orders
            </Heading>
            <Text variant="body-default-s" onBackground="neutral-weak">
              Every subscription charge across all plans, newest first by default.
            </Text>
          </Column>
          <Button prefixIcon="download" variant="secondary">
            Export CSV
          </Button>
        </Row>

        <Column background="surface" border radius="l" padding="16" gap="16" role="search" aria-label="Filter orders">
          <Row
            fillWidth
            gap="16"
            vertical="end"
            s={{ direction: "column", vertical: "stretch" }}
          >
            <Column gap="8" flex={1} minWidth={0}>
              <Text as="span" id="status-filter-label" variant="label-default-s" onBackground="neutral-weak">
                Status
              </Text>
              <div role="group" aria-labelledby="status-filter-label">
                <SegmentedControl
                  value={filter}
                  onChange={(value) => {
                    setFilter(value as Filter);
                    setPage(1);
                  }}
                  buttons={filterOptions}
                />
              </div>
            </Column>
          </Row>

          <Row
            fillWidth
            gap="16"
            vertical="end"
            s={{ direction: "column", vertical: "stretch" }}
          >
            <Column flex={1} minWidth={0}>
              <DateRangeInput
                id="order-date-range"
                startLabel="From"
                endLabel="To"
                value={range}
                onChange={(next) => {
                  setRange(next);
                  setPage(1);
                }}
              />
            </Column>
            <Column flex={1} minWidth={0}>
              <Input
                id="order-search"
                label="Search orders"
                type="search"
                placeholder="Search by order, customer or plan"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setPage(1);
                }}
              />
            </Column>
            <Button
              variant="tertiary"
              prefixIcon="refresh"
              onClick={resetFilters}
              disabled={!hasActiveFilters}
            >
              Reset
            </Button>
          </Row>
        </Column>

        <Text variant="body-default-s" onBackground="neutral-weak" aria-live="polite">
          {sorted.length === 0
            ? "No orders match your filters."
            : `Showing ${firstShown}–${lastShown} of ${sorted.length} ${sorted.length === 1 ? "order" : "orders"}`}
        </Text>

        <Column fillWidth overflowX="auto">
          <DataTable<Order>
            aria-label="Orders"
            stickyHeader
            sort={sort}
            onSortChange={(next) => setSort(next)}
            getRowId={(row) => row.id}
            columns={[
              {
                key: "id",
                header: "Order",
                sortable: true,
                sort: keepOrder,
                cell: (row) => (
                  <Text variant="code-default-s">{row.id}</Text>
                ),
              },
              {
                key: "customer",
                header: "Customer",
                sortable: true,
                sort: keepOrder,
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
                sort: keepOrder,
                cell: (row) => row.plan,
              },
              {
                key: "status",
                header: "Status",
                sortable: true,
                sort: keepOrder,
                cell: (row) => (
                  <Tag size="s" scheme={statusTag[row.status].scheme}>
                    {statusTag[row.status].label}
                  </Tag>
                ),
              },
              {
                key: "amount",
                header: "Amount",
                sortable: true,
                sort: keepOrder,
                align: "right",
                cell: (row) => currency.format(row.amount),
              },
              {
                key: "date",
                header: "Date",
                sortable: true,
                sort: keepOrder,
                align: "right",
                cell: (row) => formatDate(row.date),
              },
            ]}
            rows={pageRows}
            emptyState={
              <Column center gap="12" padding="32">
                <Text variant="body-default-s" onBackground="neutral-weak">
                  No orders match the current filters.
                </Text>
                <Button size="s" variant="secondary" onClick={resetFilters}>
                  Clear all filters
                </Button>
              </Column>
            }
          />
        </Column>

        <Row fillWidth horizontal="center">
          <Pagination
            aria-label="Orders pagination"
            page={currentPage}
            onChange={setPage}
            total={sorted.length}
            perPage={perPage}
            onPerPageChange={(next) => {
              setPerPage(next);
              setPage(1);
            }}
            perPageOptions={[8, 16, 24]}
            showFirstLast
          />
        </Row>
      </Column>
    </Column>
  );
}
```