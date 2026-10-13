The page is a filterable, sortable, paginated order table with the filters kept as controlled state.

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
import type { DataTableColumn, DataTableSort, DateRange } from "@once-ui-system/core";
import { useMemo, useState } from "react";

type Status = "paid" | "pending" | "refunded" | "failed";
type StatusFilter = "all" | Status;

type Order = {
  id: string;
  customer: string;
  email: string;
  plan: string;
  amount: number;
  status: Status;
  date: string; // ISO yyyy-mm-dd
};

const orders: Order[] = [
  { id: "ORD-10482", customer: "Maya Lindqvist", email: "maya@northwind.io", plan: "Team annual", amount: 1188, status: "paid", date: "2026-10-12" },
  { id: "ORD-10481", customer: "Tobias Reyes", email: "tobias@fernlabs.dev", plan: "Pro monthly", amount: 49, status: "paid", date: "2026-10-11" },
  { id: "ORD-10480", customer: "Priya Nair", email: "priya@kestrel.co", plan: "Enterprise seat pack", amount: 4200, status: "pending", date: "2026-10-11" },
  { id: "ORD-10479", customer: "Jonas Whitfield", email: "jonas@brightpine.com", plan: "Pro monthly", amount: 49, status: "failed", date: "2026-10-10" },
  { id: "ORD-10478", customer: "Aiko Tanaka", email: "aiko@tanakadesign.jp", plan: "Team annual", amount: 1188, status: "paid", date: "2026-10-09" },
  { id: "ORD-10477", customer: "Samuel Okoye", email: "samuel@lagoonhq.com", plan: "Starter monthly", amount: 19, status: "refunded", date: "2026-10-08" },
  { id: "ORD-10476", customer: "Elena Marchetti", email: "elena@olivetree.it", plan: "Pro annual", amount: 468, status: "paid", date: "2026-10-07" },
  { id: "ORD-10475", customer: "Dmitri Volkov", email: "dmitri@stackyard.io", plan: "Enterprise seat pack", amount: 6300, status: "pending", date: "2026-10-06" },
  { id: "ORD-10474", customer: "Hannah Brooks", email: "hannah@cedarworks.co", plan: "Starter monthly", amount: 19, status: "paid", date: "2026-10-05" },
  { id: "ORD-10473", customer: "Luis Ortega", email: "luis@mesalabs.mx", plan: "Pro monthly", amount: 49, status: "failed", date: "2026-10-04" },
  { id: "ORD-10472", customer: "Freya Johansen", email: "freya@nordlys.no", plan: "Team annual", amount: 1188, status: "paid", date: "2026-10-03" },
  { id: "ORD-10471", customer: "Kwame Mensah", email: "kwame@goldcoastdev.gh", plan: "Pro annual", amount: 468, status: "paid", date: "2026-10-02" },
  { id: "ORD-10470", customer: "Chloe Dubois", email: "chloe@atelier-dubois.fr", plan: "Starter monthly", amount: 19, status: "refunded", date: "2026-10-01" },
  { id: "ORD-10469", customer: "Ravi Menon", email: "ravi@cobaltpay.in", plan: "Enterprise seat pack", amount: 8400, status: "paid", date: "2026-09-29" },
  { id: "ORD-10468", customer: "Sofia Alvarez", email: "sofia@tidepool.ar", plan: "Pro monthly", amount: 49, status: "pending", date: "2026-09-28" },
  { id: "ORD-10467", customer: "Noah Fischer", email: "noah@fischer-gmbh.de", plan: "Team annual", amount: 1188, status: "paid", date: "2026-09-26" },
  { id: "ORD-10466", customer: "Amara Eze", email: "amara@sunbird.ng", plan: "Starter monthly", amount: 19, status: "failed", date: "2026-09-25" },
  { id: "ORD-10465", customer: "Oliver Grant", email: "oliver@grantandsons.uk", plan: "Pro annual", amount: 468, status: "paid", date: "2026-09-23" },
  { id: "ORD-10464", customer: "Yuki Sato", email: "yuki@satostudio.jp", plan: "Pro monthly", amount: 49, status: "paid", date: "2026-09-21" },
  { id: "ORD-10463", customer: "Isabella Rossi", email: "isabella@rossi-ottica.it", plan: "Team annual", amount: 1188, status: "refunded", date: "2026-09-19" },
  { id: "ORD-10462", customer: "Callum Reid", email: "callum@reidmarine.co.uk", plan: "Starter monthly", amount: 19, status: "paid", date: "2026-09-17" },
  { id: "ORD-10461", customer: "Leila Haddad", email: "leila@oasisdata.ae", plan: "Enterprise seat pack", amount: 5250, status: "pending", date: "2026-09-15" },
  { id: "ORD-10460", customer: "Mateo Silva", email: "mateo@solmaker.br", plan: "Pro annual", amount: 468, status: "paid", date: "2026-09-12" },
  { id: "ORD-10459", customer: "Grace Kim", email: "grace@harborlight.kr", plan: "Pro monthly", amount: 49, status: "paid", date: "2026-09-09" },
  { id: "ORD-10458", customer: "Anders Berg", email: "anders@bergverk.se", plan: "Team annual", amount: 1188, status: "failed", date: "2026-09-06" },
  { id: "ORD-10457", customer: "Zainab Yusuf", email: "zainab@kanoworks.ng", plan: "Starter monthly", amount: 19, status: "paid", date: "2026-09-03" },
];

const statusTag: Record<Status, { scheme: "success" | "warning" | "danger" | "neutral"; label: string }> = {
  paid: { scheme: "success", label: "Paid" },
  pending: { scheme: "warning", label: "Pending" },
  failed: { scheme: "danger", label: "Failed" },
  refunded: { scheme: "neutral", label: "Refunded" },
};

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function isoToTime(iso: string): number {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).getTime();
}

function startOfDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

const columns: DataTableColumn<Order>[] = [
  {
    key: "id",
    header: "Order",
    sortable: true,
    width: "9rem",
    cell: (row) => (
      <Text variant="code-default-s" onBackground="neutral-strong">
        {row.id}
      </Text>
    ),
    sort: (a, b) => a.id.localeCompare(b.id),
  },
  {
    key: "customer",
    header: "Customer",
    sortable: true,
    cell: (row) => (
      <Column gap="4">
        <Text variant="label-default-s">{row.customer}</Text>
        <Text variant="body-default-xs" onBackground="neutral-weak">
          {row.email}
        </Text>
      </Column>
    ),
    sort: (a, b) => a.customer.localeCompare(b.customer),
  },
  {
    key: "plan",
    header: "Plan",
    sortable: true,
    cell: (row) => <Text variant="body-default-s">{row.plan}</Text>,
    sort: (a, b) => a.plan.localeCompare(b.plan),
  },
  {
    key: "status",
    header: "Status",
    sortable: true,
    cell: (row) => (
      <Tag size="s" scheme={statusTag[row.status].scheme}>
        {statusTag[row.status].label}
      </Tag>
    ),
    sort: (a, b) => a.status.localeCompare(b.status),
  },
  {
    key: "date",
    header: "Date",
    sortable: true,
    cell: (row) => <Text variant="body-default-s">{formatDate(row.date)}</Text>,
    sort: (a, b) => isoToTime(a.date) - isoToTime(b.date),
  },
  {
    key: "amount",
    header: "Amount",
    sortable: true,
    align: "right",
    cell: (row) => <Text variant="label-default-s">{currency.format(row.amount)}</Text>,
    sort: (a, b) => a.amount - b.amount,
  },
];

const statusButtons = [
  { value: "all", label: "All" },
  { value: "paid", label: "Paid" },
  { value: "pending", label: "Pending" },
  { value: "failed", label: "Failed" },
  { value: "refunded", label: "Refunded" },
];

const PER_PAGE_OPTIONS = [5, 10, 20];

export default function Page() {
  const [status, setStatus] = useState<StatusFilter>("all");
  const [query, setQuery] = useState("");
  const [range, setRange] = useState<DateRange>({ startDate: undefined, endDate: undefined });
  const [sort, setSort] = useState<DataTableSort | null>({ key: "date", direction: "desc" });
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(5);

  const hasFilters =
    status !== "all" || query.trim() !== "" || Boolean(range.startDate) || Boolean(range.endDate);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const start = range.startDate ? startOfDay(range.startDate) : null;
    const end = range.endDate ? startOfDay(range.endDate) : null;

    const rows = orders.filter((order) => {
      if (status !== "all" && order.status !== status) return false;
      if (q) {
        const haystack = `${order.id} ${order.customer} ${order.email} ${order.plan}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      const time = isoToTime(order.date);
      if (start !== null && time < start) return false;
      if (end !== null && time > end) return false;
      return true;
    });

    if (sort) {
      const column = columns.find((c) => c.key === sort.key);
      if (column?.sort) {
        const compare = column.sort;
        const factor = sort.direction === "asc" ? 1 : -1;
        rows.sort((a, b) => compare(a, b) * factor);
      }
    }
    return rows;
  }, [status, query, range, sort]);

  const totalRevenue = useMemo(
    () => filtered.filter((o) => o.status === "paid").reduce((sum, o) => sum + o.amount, 0),
    [filtered],
  );

  const resetFilters = () => {
    setStatus("all");
    setQuery("");
    setRange({ startDate: undefined, endDate: undefined });
    setPage(1);
  };

  return (
    <Column as="main" fillWidth horizontal="center" paddingY="48" paddingX="24" s={{ paddingY: "24", paddingX: "16" }}>
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
              Track subscriptions, payments and refunds across every workspace.
            </Text>
          </Column>
          <Button prefixIcon="download" variant="secondary">
            Export CSV
          </Button>
        </Row>

        <Column background="surface" border radius="l" padding="24" gap="16" s={{ padding: "16" }}>
          <Row fillWidth gap="16" vertical="end" wrap>
            <Column gap="8" minWidth={16} flex={1}>
              <Text as="span" id="status-filter-label" variant="label-default-s" onBackground="neutral-weak">
                Status
              </Text>
              <div role="group" aria-labelledby="status-filter-label">
                <SegmentedControl
                  value={status}
                  onChange={(value) => {
                    setStatus(value as StatusFilter);
                    setPage(1);
                  }}
                  buttons={statusButtons}
                />
              </div>
            </Column>
          </Row>

          <Row fillWidth gap="16" vertical="end" s={{ direction: "column", vertical: "stretch" }}>
            <Column flex={1} fillWidth>
              <Input
                id="order-search"
                label="Search orders"
                placeholder="Search by order, customer or plan"
                prefix={<span aria-hidden="true" />}
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setPage(1);
                }}
              />
            </Column>
            <Column flex={1} fillWidth>
              <DateRangeInput
                id="order-dates"
                startLabel="From date"
                endLabel="To date"
                value={range}
                onChange={(next) => {
                  setRange(next);
                  setPage(1);
                }}
              />
            </Column>
            <Button variant="tertiary" prefixIcon="close" onClick={resetFilters} disabled={!hasFilters}>
              Clear filters
            </Button>
          </Row>

          <Row fillWidth horizontal="between" vertical="center" gap="12" wrap>
            <Text variant="body-default-s" onBackground="neutral-weak" role="status" aria-live="polite">
              {filtered.length} {filtered.length === 1 ? "order" : "orders"}
            </Text>
            <Text variant="body-default-s" onBackground="neutral-weak">
              Paid revenue: <Text as="span" variant="label-default-s" onBackground="neutral-strong">{currency.format(totalRevenue)}</Text>
            </Text>
          </Row>

          <DataTable<Order>
            aria-label="Orders"
            columns={columns}
            rows={filtered}
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
            perPageOptions={PER_PAGE_OPTIONS}
            stickyHeader
            emptyState={
              <Column center gap="12" padding="32">
                <Text variant="body-default-s" onBackground="neutral-weak">
                  No orders match the current filters.
                </Text>
                <Button size="s" variant="secondary" onClick={resetFilters}>
                  Clear filters
                </Button>
              </Column>
            }
          />
        </Column>
      </Column>
    </Column>
  );
}
```