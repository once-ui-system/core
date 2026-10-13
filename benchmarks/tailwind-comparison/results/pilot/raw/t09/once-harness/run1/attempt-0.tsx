"use client";

import {
  Button,
  Column,
  DataTable,
  type DataTableColumn,
  type DataTableSort,
  DateRangeInput,
  type DateRange,
  Heading,
  Icon,
  Input,
  Row,
  SegmentedControl,
  Tag,
  Text,
} from "@once-ui-system/core";
import { useMemo, useState } from "react";

type Status = "paid" | "pending" | "overdue" | "refunded";

interface Invoice {
  id: string;
  customer: string;
  email: string;
  plan: string;
  amount: number;
  status: Status;
  date: Date;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function d(month: number, day: number): Date {
  return new Date(2026, month - 1, day);
}

function formatDate(date: Date): string {
  return `${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

function formatAmount(amount: number): string {
  const [whole, cents] = amount.toFixed(2).split(".");
  return `$${whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}.${cents}`;
}

const INVOICES: Invoice[] = [
  { id: "INV-2041", customer: "Marta Kowalski", email: "marta@northwind.example", plan: "Team", amount: 480, status: "paid", date: d(9, 2) },
  { id: "INV-2042", customer: "Jonas Eriksson", email: "jonas@fjordlabs.example", plan: "Enterprise", amount: 2400, status: "paid", date: d(9, 4) },
  { id: "INV-2043", customer: "Priya Natarajan", email: "priya@lumen.example", plan: "Starter", amount: 49, status: "pending", date: d(9, 6) },
  { id: "INV-2044", customer: "Diego Alvarez", email: "diego@solana-works.example", plan: "Team", amount: 480, status: "overdue", date: d(9, 8) },
  { id: "INV-2045", customer: "Hannah Becker", email: "hannah@brightpath.example", plan: "Starter", amount: 49, status: "paid", date: d(9, 11) },
  { id: "INV-2046", customer: "Kenji Watanabe", email: "kenji@tsukuri.example", plan: "Enterprise", amount: 3200, status: "paid", date: d(9, 13) },
  { id: "INV-2047", customer: "Amara Okafor", email: "amara@kora.example", plan: "Team", amount: 480, status: "refunded", date: d(9, 15) },
  { id: "INV-2048", customer: "Lucas Moreau", email: "lucas@atelier-m.example", plan: "Starter", amount: 49, status: "paid", date: d(9, 17) },
  { id: "INV-2049", customer: "Sofia Rossi", email: "sofia@portolio.example", plan: "Team", amount: 960, status: "pending", date: d(9, 19) },
  { id: "INV-2050", customer: "Tomasz Nowak", email: "tomasz@stackyard.example", plan: "Enterprise", amount: 2400, status: "overdue", date: d(9, 21) },
  { id: "INV-2051", customer: "Elena Petrova", email: "elena@polar.example", plan: "Starter", amount: 49, status: "paid", date: d(9, 23) },
  { id: "INV-2052", customer: "Ravi Shah", email: "ravi@helio.example", plan: "Team", amount: 480, status: "paid", date: d(9, 25) },
  { id: "INV-2053", customer: "Chloe Martin", email: "chloe@oakstreet.example", plan: "Starter", amount: 49, status: "pending", date: d(9, 27) },
  { id: "INV-2054", customer: "Mateo Fernandez", email: "mateo@cielo.example", plan: "Enterprise", amount: 4800, status: "paid", date: d(9, 29) },
  { id: "INV-2055", customer: "Ingrid Larsen", email: "ingrid@nordlys.example", plan: "Team", amount: 480, status: "paid", date: d(10, 1) },
  { id: "INV-2056", customer: "Omar Haddad", email: "omar@desertrose.example", plan: "Starter", amount: 49, status: "overdue", date: d(10, 2) },
  { id: "INV-2057", customer: "Grace Liu", email: "grace@meridian.example", plan: "Team", amount: 960, status: "paid", date: d(10, 3) },
  { id: "INV-2058", customer: "Felix Hartmann", email: "felix@kupfer.example", plan: "Enterprise", amount: 2400, status: "pending", date: d(10, 5) },
  { id: "INV-2059", customer: "Nia Thompson", email: "nia@greenhaven.example", plan: "Starter", amount: 49, status: "paid", date: d(10, 6) },
  { id: "INV-2060", customer: "Andrei Popescu", email: "andrei@carpathia.example", plan: "Team", amount: 480, status: "refunded", date: d(10, 7) },
  { id: "INV-2061", customer: "Yuki Tanaka", email: "yuki@sakura-dev.example", plan: "Team", amount: 480, status: "paid", date: d(10, 8) },
  { id: "INV-2062", customer: "Beatriz Costa", email: "beatriz@mar-e-sol.example", plan: "Starter", amount: 49, status: "pending", date: d(10, 9) },
  { id: "INV-2063", customer: "Samuel Adeyemi", email: "samuel@lagoon.example", plan: "Enterprise", amount: 3200, status: "paid", date: d(10, 10) },
  { id: "INV-2064", customer: "Clara Dubois", email: "clara@maison-d.example", plan: "Team", amount: 480, status: "overdue", date: d(10, 10) },
];

const STATUS_SCHEME: Record<Status, "success" | "warning" | "danger" | "neutral"> = {
  paid: "success",
  pending: "warning",
  overdue: "danger",
  refunded: "neutral",
};

const STATUS_LABEL: Record<Status, string> = {
  paid: "Paid",
  pending: "Pending",
  overdue: "Overdue",
  refunded: "Refunded",
};

const STATUS_FILTERS = [
  { value: "all", label: "All" },
  { value: "paid", label: "Paid" },
  { value: "pending", label: "Pending" },
  { value: "overdue", label: "Overdue" },
  { value: "refunded", label: "Refunded" },
];

const COLUMNS: DataTableColumn<Invoice>[] = [
  {
    key: "id",
    header: "Invoice",
    sortable: true,
    cell: (row) => (
      <Text variant="label-default-s" onBackground="neutral-strong">
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
      <Column gap="2">
        <Text variant="label-default-s" onBackground="neutral-strong">
          {row.customer}
        </Text>
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
    cell: (row) => <Tag scheme={STATUS_SCHEME[row.status]} label={STATUS_LABEL[row.status]} />,
    sort: (a, b) => a.status.localeCompare(b.status),
  },
  {
    key: "date",
    header: "Issued",
    sortable: true,
    cell: (row) => <Text variant="body-default-s">{formatDate(row.date)}</Text>,
    sort: (a, b) => a.date.getTime() - b.date.getTime(),
  },
  {
    key: "amount",
    header: "Amount",
    sortable: true,
    align: "right",
    cell: (row) => (
      <Text variant="label-default-s" onBackground="neutral-strong">
        {formatAmount(row.amount)}
      </Text>
    ),
    sort: (a, b) => a.amount - b.amount,
  },
];

function startOfDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

export default function Page() {
  const [status, setStatus] = useState("all");
  const [query, setQuery] = useState("");
  const [range, setRange] = useState<DateRange>({ startDate: undefined, endDate: undefined });
  const [sort, setSort] = useState<DataTableSort | null>({ key: "date", direction: "desc" });
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(8);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const start = range.startDate ? startOfDay(range.startDate) : null;
    const end = range.endDate ? startOfDay(range.endDate) : null;
    return INVOICES.filter((row) => {
      if (status !== "all" && row.status !== status) return false;
      if (q && !`${row.id} ${row.customer} ${row.email}`.toLowerCase().includes(q)) return false;
      const time = startOfDay(row.date);
      if (start !== null && time < start) return false;
      if (end !== null && time > end) return false;
      return true;
    });
  }, [status, query, range]);

  const hasFilters =
    status !== "all" || query !== "" || range.startDate !== undefined || range.endDate !== undefined;

  const clearFilters = () => {
    setStatus("all");
    setQuery("");
    setRange({ startDate: undefined, endDate: undefined });
    setPage(1);
  };

  const total = useMemo(() => filtered.reduce((sum, row) => sum + row.amount, 0), [filtered]);

  return (
    <Column as="main" fillWidth horizontal="center" paddingX="16" paddingY="32">
      <Column maxWidth="l" fillWidth gap="24">
        <Row fillWidth gap="16" vertical="center" horizontal="between" wrap>
          <Column gap="4">
            <Heading as="h1" variant="display-strong-xs">
              Invoices
            </Heading>
            <Text variant="body-default-m" onBackground="neutral-weak">
              Track billing across customers, plans and payment status.
            </Text>
          </Column>
          <Button prefixIcon="download" variant="secondary" size="m">
            Export CSV
          </Button>
        </Row>

        <Column gap="12" role="search" aria-label="Filter invoices">
          <SegmentedControl
            buttons={STATUS_FILTERS}
            value={status}
            onChange={(value) => {
              setStatus(value);
              setPage(1);
            }}
          />
          <Row fillWidth gap="12" s={{ direction: "column" }}>
            <Column flex={1} fillWidth>
              <Input
                id="invoice-search"
                label="Search invoices"
                type="search"
                value={query}
                prefix={<Icon name="search" size="xs" onBackground="neutral-weak" />}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setPage(1);
                }}
              />
            </Column>
            <Column flex={1} fillWidth>
              <DateRangeInput
                id="invoice-dates"
                startLabel="From"
                endLabel="To"
                value={range}
                onChange={(next) => {
                  setRange(next);
                  setPage(1);
                }}
              />
            </Column>
          </Row>
        </Column>

        <Row fillWidth horizontal="between" vertical="center" gap="12" wrap>
          <Text variant="body-default-s" onBackground="neutral-weak" role="status" aria-live="polite">
            {filtered.length} {filtered.length === 1 ? "invoice" : "invoices"} totalling{" "}
            {formatAmount(total)}
          </Text>
          {hasFilters && (
            <Button variant="tertiary" size="s" prefixIcon="close" onClick={clearFilters}>
              Clear filters
            </Button>
          )}
        </Row>

        <DataTable<Invoice>
          aria-label="Invoices"
          columns={COLUMNS}
          rows={filtered}
          getRowId={(row) => row.id}
          sort={sort}
          onSortChange={setSort}
          paginated
          page={page}
          onPageChange={setPage}
          perPage={perPage}
          onPerPageChange={(next) => {
            setPerPage(next);
            setPage(1);
          }}
          perPageOptions={[5, 8, 10]}
          hoverable
          emptyState={
            <Column center gap="12" padding="32">
              <Text variant="heading-strong-m">No invoices match these filters</Text>
              <Text variant="body-default-s" onBackground="neutral-weak">
                Try a different search term, status or date range.
              </Text>
              <Button variant="secondary" size="s" onClick={clearFilters}>
                Clear filters
              </Button>
            </Column>
          }
        />
      </Column>
    </Column>
  );
}
