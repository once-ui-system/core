"use client";

import {
  Button,
  Column,
  DateRangeInput,
  Heading,
  Input,
  Pagination,
  Row,
  SegmentedControl,
  Tag,
  Text,
  DataTable,
  Icon,
  IconButton,
} from "@once-ui-system/core";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";

type Status = "paid" | "pending" | "overdue" | "refunded";
type Plan = "Starter" | "Team" | "Business" | "Enterprise";

type Invoice = {
  id: string;
  customer: string;
  email: string;
  plan: Plan;
  status: Status;
  amount: number;
  issued: Date;
};

type StatusFilter = "all" | Status;

type SortState = { key: string; direction: "asc" | "desc" } | null;

type Range = { startDate: Date | undefined; endDate: Date | undefined };

const customers: { name: string; email: string; plan: Plan }[] = [
  { name: "Northwind Logistics", email: "billing@northwind.example", plan: "Enterprise" },
  { name: "Harbor & Pine Studio", email: "accounts@harborpine.example", plan: "Team" },
  { name: "Lumen Health", email: "finance@lumenhealth.example", plan: "Business" },
  { name: "Brightfield Schools", email: "ap@brightfield.example", plan: "Business" },
  { name: "Tidewater Coffee Co.", email: "owner@tidewater.example", plan: "Starter" },
  { name: "Alder Robotics", email: "ops@alderrobotics.example", plan: "Enterprise" },
  { name: "Paperkite Books", email: "hello@paperkite.example", plan: "Starter" },
  { name: "Cedar Ridge Dental", email: "office@cedarridge.example", plan: "Team" },
  { name: "Mosaic Analytics", email: "billing@mosaic.example", plan: "Business" },
  { name: "Foxglove Design", email: "studio@foxglove.example", plan: "Team" },
  { name: "Quarry Street Legal", email: "admin@quarrystreet.example", plan: "Team" },
  { name: "Solstice Energy", email: "payables@solstice.example", plan: "Enterprise" },
];

const statuses: Status[] = ["paid", "paid", "pending", "paid", "overdue", "paid", "refunded", "pending"];
const amounts = [49, 129, 349, 899, 1499, 249, 79, 599, 2199, 179];

const invoices: Invoice[] = Array.from({ length: 46 }, (_, i) => {
  const customer = customers[(i * 5 + 3) % customers.length];
  const issued = new Date(2025, 0, 1);
  issued.setDate(issued.getDate() + i * 5 + (i % 4));
  return {
    id: `INV-${String(2041 + i).padStart(4, "0")}`,
    customer: customer.name,
    email: customer.email,
    plan: customer.plan,
    status: statuses[(i * 3 + 1) % statuses.length],
    amount: amounts[(i * 7 + 2) % amounts.length] + (i % 3) * 10,
    issued,
  };
});

const statusMeta: Record<Status, { scheme: "success" | "warning" | "danger" | "neutral"; label: string }> = {
  paid: { scheme: "success", label: "Paid" },
  pending: { scheme: "warning", label: "Pending" },
  overdue: { scheme: "danger", label: "Overdue" },
  refunded: { scheme: "neutral", label: "Refunded" },
};

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const dateFormat = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });

function startOfDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

function compare(a: Invoice, b: Invoice, key: string): number {
  switch (key) {
    case "customer":
      return a.customer.localeCompare(b.customer);
    case "plan":
      return a.plan.localeCompare(b.plan);
    case "status":
      return a.status.localeCompare(b.status);
    case "amount":
      return a.amount - b.amount;
    case "issued":
      return a.issued.getTime() - b.issued.getTime();
    default:
      return a.id.localeCompare(b.id);
  }
}

const PER_PAGE_OPTIONS = [5, 10, 20];

export default function Page() {
  const [status, setStatus] = useState<StatusFilter>("all");
  const [range, setRange] = useState<Range>({ startDate: undefined, endDate: undefined });
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortState>({ key: "issued", direction: "desc" });
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const counts = useMemo(() => {
    const result: Record<StatusFilter, number> = {
      all: invoices.length,
      paid: 0,
      pending: 0,
      overdue: 0,
      refunded: 0,
    };
    for (const invoice of invoices) result[invoice.status] += 1;
    return result;
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const start = range.startDate ? startOfDay(range.startDate) : null;
    const end = range.endDate ? startOfDay(range.endDate) : null;
    const rows = invoices.filter((invoice) => {
      if (status !== "all" && invoice.status !== status) return false;
      const issued = startOfDay(invoice.issued);
      if (start !== null && issued < start) return false;
      if (end !== null && issued > end) return false;
      if (q) {
        const haystack = `${invoice.id} ${invoice.customer} ${invoice.email} ${invoice.plan}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
    if (sort) {
      const factor = sort.direction === "asc" ? 1 : -1;
      rows.sort((a, b) => factor * compare(a, b, sort.key));
    }
    return rows;
  }, [status, range, query, sort]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / perPage));
  const currentPage = Math.min(page, pageCount);
  const pageRows = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);
  const firstShown = filtered.length === 0 ? 0 : (currentPage - 1) * perPage + 1;
  const lastShown = Math.min(currentPage * perPage, filtered.length);

  const hasFilters =
    status !== "all" || query.trim() !== "" || range.startDate !== undefined || range.endDate !== undefined;

  const resetFilters = () => {
    setStatus("all");
    setQuery("");
    setRange({ startDate: undefined, endDate: undefined });
    setPage(1);
  };

  const totalShown = filtered.reduce(
    (sum, invoice) => (invoice.status === "refunded" ? sum : sum + invoice.amount),
    0,
  );

  const columns = [
    {
      key: "id",
      header: "Invoice",
      sortable: true,
      cell: (row: Invoice): ReactNode => <Text variant="code-default-s">{row.id}</Text>,
    },
    {
      key: "customer",
      header: "Customer",
      sortable: true,
      cell: (row: Invoice): ReactNode => (
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
      cell: (row: Invoice): ReactNode => <Text variant="body-default-s">{row.plan}</Text>,
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      cell: (row: Invoice): ReactNode => (
        <Tag size="s" scheme={statusMeta[row.status].scheme}>
          {statusMeta[row.status].label}
        </Tag>
      ),
    },
    {
      key: "issued",
      header: "Issued",
      sortable: true,
      cell: (row: Invoice): ReactNode => (
        <Text variant="body-default-s">{dateFormat.format(row.issued)}</Text>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      sortable: true,
      align: "right" as const,
      cell: (row: Invoice): ReactNode => (
        <Text variant="label-default-s">{currency.format(row.amount)}</Text>
      ),
    },
  ];

  return (
    <Column as="main" fillWidth horizontal="center" paddingY="48" paddingX="24" s={{ paddingX: "16", paddingY: "32" }}>
      <Column maxWidth="l" gap="32">
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
              Track billing across every customer account, filter by status or issue date, and
              export what you need.
            </Text>
          </Column>
          <Button prefixIcon="download" variant="secondary">
            Export CSV
          </Button>
        </Row>

        <Column gap="16" as="section" aria-label="Invoice filters">
          <Row
            fillWidth
            gap="16"
            vertical="end"
            s={{ direction: "column", vertical: "stretch" }}
          >
            <Column flex={1} gap="8">
              <Text as="span" variant="label-default-s" onBackground="neutral-weak" id="status-filter-label">
                Status
              </Text>
              <SegmentedControl
                aria-labelledby="status-filter-label"
                value={status}
                onChange={(value) => {
                  setStatus(value as StatusFilter);
                  setPage(1);
                }}
                buttons={[
                  { value: "all", label: `All (${counts.all})` },
                  { value: "paid", label: `Paid (${counts.paid})` },
                  { value: "pending", label: `Pending (${counts.pending})` },
                  { value: "overdue", label: `Overdue (${counts.overdue})` },
                  { value: "refunded", label: `Refunded (${counts.refunded})` },
                ]}
              />
            </Column>
          </Row>

          <Row
            fillWidth
            gap="16"
            vertical="end"
            s={{ direction: "column", vertical: "stretch" }}
          >
            <Column flex={1}>
              <DateRangeInput
                id="issued-range"
                startLabel="Issued from"
                endLabel="Issued to"
                value={range}
                onChange={(next) => {
                  setRange({ startDate: next.startDate, endDate: next.endDate });
                  setPage(1);
                }}
              />
            </Column>
            <Column flex={1}>
              <Input
                id="invoice-search"
                label="Search invoices"
                placeholder="Customer, email or invoice number"
                value={query}
                prefix={<Icon name="search" size="s" onBackground="neutral-weak" />}
                suffix={
                  query.length > 0 ? (
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
                onChange={(event) => {
                  setQuery(event.target.value);
                  setPage(1);
                }}
              />
            </Column>
          </Row>
        </Column>

        <Column gap="16">
          <Row fillWidth horizontal="between" vertical="center" gap="16" wrap>
            <Text variant="body-default-s" onBackground="neutral-weak" aria-live="polite">
              {filtered.length === 0
                ? "No invoices match"
                : `Showing ${firstShown}–${lastShown} of ${filtered.length} invoices · ${currency.format(totalShown)} billed`}
            </Text>
            {hasFilters && (
              <Button size="s" variant="tertiary" prefixIcon="close" onClick={resetFilters}>
                Clear filters
              </Button>
            )}
          </Row>

          <DataTable<Invoice>
            aria-label="Invoices"
            columns={columns}
            rows={pageRows}
            getRowId={(row) => row.id}
            sort={sort}
            onSortChange={(next) => {
              setSort(next);
              setPage(1);
            }}
            emptyState={
              <Column center gap="12" padding="32">
                <Text variant="label-default-m">No invoices found</Text>
                <Text variant="body-default-s" onBackground="neutral-weak">
                  Try a different status, widen the date range, or check the spelling in your
                  search.
                </Text>
                <Button size="s" variant="secondary" onClick={resetFilters}>
                  Clear all filters
                </Button>
              </Column>
            }
          />

          <Pagination
            aria-label="Invoice pages"
            page={currentPage}
            onChange={setPage}
            total={pageCount}
            perPage={perPage}
            perPageOptions={PER_PAGE_OPTIONS}
            onPerPageChange={(next) => {
              setPerPage(next);
              setPage(1);
            }}
            showFirstLast
          />
        </Column>
      </Column>
    </Column>
  );
}
