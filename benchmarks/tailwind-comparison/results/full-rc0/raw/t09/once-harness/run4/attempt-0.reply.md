One decision remains. The `DataTable` row type needs to be a generic record, and `DataTableColumn` and `DataTableSort` may not be exported types, so I'll infer them with `ComponentProps` rather than importing them by name.

```tsx
"use client";

import {
  Button,
  Column,
  DataTable,
  DateRangeInput,
  Heading,
  Icon,
  IconButton,
  Input,
  Row,
  SegmentedControl,
  Tag,
  Text,
} from "@once-ui-system/core";
import type { ComponentProps } from "react";
import { useCallback, useMemo, useState } from "react";

type OrderStatus = "paid" | "pending" | "refunded" | "failed";
type StatusFilter = "all" | OrderStatus;

type Order = {
  id: string;
  customer: string;
  email: string;
  plan: string;
  amount: number;
  status: OrderStatus;
  date: Date;
};

type DateRangeValue = { startDate: Date | undefined; endDate: Date | undefined };

type TableProps = ComponentProps<typeof DataTable<Order>>;
type Column = NonNullable<TableProps["columns"]>[number];
type SortState = NonNullable<TableProps["sort"]>;

const d = (iso: string) => new Date(`${iso}T12:00:00`);

const ORDERS: Order[] = [
  { id: "INV-2041", customer: "Marta Lindqvist", email: "marta@northwind.io", plan: "Team annual", amount: 1188, status: "paid", date: d("2026-09-28") },
  { id: "INV-2040", customer: "Kofi Mensah", email: "kofi@brightloop.co", plan: "Pro monthly", amount: 49, status: "paid", date: d("2026-09-27") },
  { id: "INV-2039", customer: "Aiko Tanabe", email: "aiko@tanabe.design", plan: "Pro annual", amount: 468, status: "pending", date: d("2026-09-26") },
  { id: "INV-2038", customer: "Lucas Moreau", email: "lucas@atelier-moreau.fr", plan: "Team monthly", amount: 129, status: "failed", date: d("2026-09-24") },
  { id: "INV-2037", customer: "Priya Raman", email: "priya@helixlabs.dev", plan: "Enterprise", amount: 4200, status: "paid", date: d("2026-09-22") },
  { id: "INV-2036", customer: "Tomás Ibarra", email: "tomas@ibarra.studio", plan: "Pro monthly", amount: 49, status: "refunded", date: d("2026-09-20") },
  { id: "INV-2035", customer: "Hannah Becker", email: "hannah@kiteworks.de", plan: "Team annual", amount: 1188, status: "paid", date: d("2026-09-18") },
  { id: "INV-2034", customer: "Samir Haddad", email: "samir@oasis-pay.com", plan: "Pro annual", amount: 468, status: "paid", date: d("2026-09-15") },
  { id: "INV-2033", customer: "Elena Petrova", email: "elena@polarstack.io", plan: "Team monthly", amount: 129, status: "pending", date: d("2026-09-13") },
  { id: "INV-2032", customer: "Dylan O'Connor", email: "dylan@greenfield.ie", plan: "Pro monthly", amount: 49, status: "paid", date: d("2026-09-11") },
  { id: "INV-2031", customer: "Yuki Sato", email: "yuki@sato-labs.jp", plan: "Enterprise", amount: 5400, status: "paid", date: d("2026-09-09") },
  { id: "INV-2030", customer: "Amara Okafor", email: "amara@lagosworks.ng", plan: "Team annual", amount: 1188, status: "failed", date: d("2026-09-07") },
  { id: "INV-2029", customer: "Noah Fischer", email: "noah@fischer-co.ch", plan: "Pro monthly", amount: 49, status: "paid", date: d("2026-09-04") },
  { id: "INV-2028", customer: "Sofia Alvarez", email: "sofia@mercadia.mx", plan: "Pro annual", amount: 468, status: "refunded", date: d("2026-09-02") },
  { id: "INV-2027", customer: "Jonas Eriksen", email: "jonas@fjordtech.no", plan: "Team monthly", amount: 129, status: "paid", date: d("2026-08-30") },
  { id: "INV-2026", customer: "Leila Karimi", email: "leila@parsa.dev", plan: "Pro monthly", amount: 49, status: "pending", date: d("2026-08-27") },
  { id: "INV-2025", customer: "Oliver Grant", email: "oliver@grantandsons.uk", plan: "Enterprise", amount: 3800, status: "paid", date: d("2026-08-24") },
  { id: "INV-2024", customer: "Mei Lin", email: "mei@lanternhq.com", plan: "Team annual", amount: 1188, status: "paid", date: d("2026-08-21") },
  { id: "INV-2023", customer: "Diego Santos", email: "diego@santos.studio", plan: "Pro annual", amount: 468, status: "failed", date: d("2026-08-18") },
  { id: "INV-2022", customer: "Freya Nilsson", email: "freya@nordlys.se", plan: "Pro monthly", amount: 49, status: "paid", date: d("2026-08-14") },
  { id: "INV-2021", customer: "Ibrahim Yusuf", email: "ibrahim@kanoworks.ng", plan: "Team monthly", amount: 129, status: "paid", date: d("2026-08-10") },
  { id: "INV-2020", customer: "Clara Dubois", email: "clara@maison-dubois.fr", plan: "Pro monthly", amount: 49, status: "refunded", date: d("2026-08-06") },
  { id: "INV-2019", customer: "Arjun Mehta", email: "arjun@vectorgrid.in", plan: "Team annual", amount: 1188, status: "paid", date: d("2026-08-03") },
  { id: "INV-2018", customer: "Ingrid Haugen", email: "ingrid@haugen.no", plan: "Pro annual", amount: 468, status: "pending", date: d("2026-07-29") },
];

const STATUS_TAG: Record<OrderStatus, { scheme: "success" | "warning" | "neutral" | "danger"; label: string }> = {
  paid: { scheme: "success", label: "Paid" },
  pending: { scheme: "warning", label: "Pending" },
  refunded: { scheme: "neutral", label: "Refunded" },
  failed: { scheme: "danger", label: "Failed" },
};

const STATUS_BUTTONS = [
  { value: "all", label: "All" },
  { value: "paid", label: "Paid" },
  { value: "pending", label: "Pending" },
  { value: "refunded", label: "Refunded" },
  { value: "failed", label: "Failed" },
];

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const dateFormat = new Intl.DateTimeFormat("en-US", { year: "numeric", month: "short", day: "numeric" });

const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();

const COLUMNS: Column[] = [
  {
    key: "id",
    header: "Invoice",
    sortable: true,
    sort: (a, b) => a.id.localeCompare(b.id),
    cell: (row) => <Text variant="code-default-s">{row.id}</Text>,
    width: "7rem",
  },
  {
    key: "customer",
    header: "Customer",
    sortable: true,
    sort: (a, b) => a.customer.localeCompare(b.customer),
    cell: (row) => (
      <Column gap="2">
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
    sort: (a, b) => a.plan.localeCompare(b.plan),
    cell: (row) => <Text variant="body-default-s">{row.plan}</Text>,
  },
  {
    key: "status",
    header: "Status",
    sortable: true,
    sort: (a, b) => a.status.localeCompare(b.status),
    cell: (row) => (
      <Tag size="s" scheme={STATUS_TAG[row.status].scheme}>
        {STATUS_TAG[row.status].label}
      </Tag>
    ),
  },
  {
    key: "date",
    header: "Date",
    sortable: true,
    sort: (a, b) => a.date.getTime() - b.date.getTime(),
    cell: (row) => <Text variant="body-default-s">{dateFormat.format(row.date)}</Text>,
  },
  {
    key: "amount",
    header: "Amount",
    align: "right",
    sortable: true,
    sort: (a, b) => a.amount - b.amount,
    cell: (row) => <Text variant="label-default-s">{currency.format(row.amount)}</Text>,
  },
];

export default function Page() {
  const [status, setStatus] = useState<StatusFilter>("all");
  const [query, setQuery] = useState("");
  const [range, setRange] = useState<DateRangeValue>({ startDate: undefined, endDate: undefined });
  const [sort, setSort] = useState<SortState | null>({ key: "date", direction: "desc" });
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(8);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const start = range.startDate ? startOfDay(range.startDate) : null;
    const end = range.endDate ? startOfDay(range.endDate) : null;
    return ORDERS.filter((order) => {
      if (status !== "all" && order.status !== status) return false;
      if (q && !`${order.id} ${order.customer} ${order.email} ${order.plan}`.toLowerCase().includes(q)) {
        return false;
      }
      const time = startOfDay(order.date);
      if (start !== null && time < start) return false;
      if (end !== null && time > end) return false;
      return true;
    });
  }, [status, query, range]);

  const hasFilters = status !== "all" || query.trim() !== "" || !!range.startDate || !!range.endDate;

  const clearFilters = useCallback(() => {
    setStatus("all");
    setQuery("");
    setRange({ startDate: undefined, endDate: undefined });
    setPage(1);
  }, []);

  const total = useMemo(() => filtered.reduce((sum, order) => sum + (order.status === "paid" ? order.amount : 0), 0), [filtered]);

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
              Invoices
            </Heading>
            <Text variant="body-default-s" onBackground="neutral-weak">
              Billing history across every workspace plan. Filter by status or date, then sort any column.
            </Text>
          </Column>
          <Button prefixIcon="download" variant="secondary">
            Export CSV
          </Button>
        </Row>

        <Column
          as="section"
          aria-label="Filters"
          background="surface"
          border
          radius="l"
          padding="16"
          gap="16"
        >
          <Row fillWidth gap="16" vertical="end" wrap s={{ direction: "column", vertical: "stretch" }}>
            <Column gap="8" flex={1} minWidth={16} s={{ minWidth: 0 }}>
              <Text as="span" variant="label-default-s" onBackground="neutral-weak" id="status-filter-label">
                Status
              </Text>
              <div role="group" aria-labelledby="status-filter-label" style={{ width: "100%" }}>
                <SegmentedControl
                  buttons={STATUS_BUTTONS}
                  value={status}
                  onChange={(value) => {
                    setStatus(value as StatusFilter);
                    setPage(1);
                  }}
                />
              </div>
            </Column>
            <Column flex={1} minWidth={16} s={{ minWidth: 0 }}>
              <DateRangeInput
                id="invoice-date-range"
                startLabel="From date"
                endLabel="To date"
                value={range}
                onChange={(next) => {
                  setRange({ startDate: next.startDate, endDate: next.endDate });
                  setPage(1);
                }}
              />
            </Column>
            <Column flex={1} minWidth={16} s={{ minWidth: 0 }}>
              <Input
                id="invoice-search"
                type="search"
                label="Search invoices"
                placeholder="Customer, email or invoice number"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setPage(1);
                }}
                prefix={<Icon name="search" size="s" onBackground="neutral-weak" />}
                suffix={
                  query ? (
                    <IconButton
                      icon="close"
                      size="s"
                      variant="ghost"
                      tooltip="Clear search"
                      ariaLabel="Clear search"
                      onClick={() => {
                        setQuery("");
                        setPage(1);
                      }}
                    />
                  ) : undefined
                }
              />
            </Column>
          </Row>

          <Row fillWidth horizontal="between" vertical="center" gap="12" wrap>
            <Text variant="body-default-s" onBackground="neutral-weak" aria-live="polite" role="status">
              {filtered.length} {filtered.length === 1 ? "invoice" : "invoices"} · {currency.format(total)} collected
            </Text>
            {hasFilters && (
              <Button size="s" variant="tertiary" prefixIcon="close" onClick={clearFilters}>
                Clear filters
              </Button>
            )}
          </Row>
        </Column>

        <DataTable<Order>
          aria-label="Invoices"
          columns={COLUMNS}
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
          perPageOptions={[8, 16, 24]}
          onPerPageChange={(next) => {
            setPerPage(next);
            setPage(1);
          }}
          emptyState={
            <Column center gap="12" padding="32">
              <Text variant="label-default-m">No invoices match these filters</Text>
              <Text variant="body-default-s" onBackground="neutral-weak" align="center">
                Try a different status, widen the date range, or search by another name.
              </Text>
              <Button size="s" variant="secondary" onClick={clearFilters}>
                Clear filters
              </Button>
            </Column>
          }
        />
      </Column>
    </Column>
  );
}
```