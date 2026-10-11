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
import type { DateRange } from "@once-ui-system/core";
import { useMemo, useState } from "react";

type Status = "paid" | "pending" | "overdue";

type Invoice = {
  id: string;
  customer: string;
  email: string;
  plan: string;
  issued: string; // ISO date (YYYY-MM-DD)
  amount: number;
  status: Status;
};

const INVOICES: Invoice[] = [
  { id: "INV-2041", customer: "Northwind Logistics", email: "billing@northwind.example", plan: "Enterprise", issued: "2026-09-28", amount: 4800, status: "paid" },
  { id: "INV-2040", customer: "Fernhill Studio", email: "accounts@fernhill.example", plan: "Team", issued: "2026-09-27", amount: 390, status: "pending" },
  { id: "INV-2039", customer: "Marlow & Finch", email: "finance@marlowfinch.example", plan: "Business", issued: "2026-09-24", amount: 1290, status: "paid" },
  { id: "INV-2038", customer: "Quayside Analytics", email: "ap@quayside.example", plan: "Enterprise", issued: "2026-09-22", amount: 5200, status: "overdue" },
  { id: "INV-2037", customer: "Little Bear Bakery", email: "hello@littlebear.example", plan: "Starter", issued: "2026-09-19", amount: 49, status: "paid" },
  { id: "INV-2036", customer: "Halden Robotics", email: "billing@halden.example", plan: "Business", issued: "2026-09-17", amount: 1490, status: "pending" },
  { id: "INV-2035", customer: "Olive & Ash Interiors", email: "studio@oliveash.example", plan: "Team", issued: "2026-09-15", amount: 390, status: "paid" },
  { id: "INV-2034", customer: "Brightwater Clinics", email: "payables@brightwater.example", plan: "Enterprise", issued: "2026-09-12", amount: 6100, status: "paid" },
  { id: "INV-2033", customer: "Tidewell Co-op", email: "treasurer@tidewell.example", plan: "Starter", issued: "2026-09-10", amount: 49, status: "overdue" },
  { id: "INV-2032", customer: "Kestrel Aerospace", email: "ap@kestrel.example", plan: "Enterprise", issued: "2026-09-08", amount: 7450, status: "paid" },
  { id: "INV-2031", customer: "Juniper Learning", email: "finance@juniper.example", plan: "Business", issued: "2026-09-05", amount: 1290, status: "pending" },
  { id: "INV-2030", customer: "Copperline Foods", email: "billing@copperline.example", plan: "Team", issued: "2026-09-03", amount: 390, status: "paid" },
  { id: "INV-2029", customer: "Saltmarsh Press", email: "office@saltmarsh.example", plan: "Starter", issued: "2026-08-30", amount: 49, status: "paid" },
  { id: "INV-2028", customer: "Vantage Freight", email: "ap@vantagefreight.example", plan: "Business", issued: "2026-08-27", amount: 1490, status: "overdue" },
  { id: "INV-2027", customer: "Ellery Architects", email: "accounts@ellery.example", plan: "Team", issued: "2026-08-25", amount: 390, status: "paid" },
  { id: "INV-2026", customer: "Pinecrest Health", email: "billing@pinecrest.example", plan: "Enterprise", issued: "2026-08-21", amount: 5900, status: "pending" },
  { id: "INV-2025", customer: "Orchard Lane Games", email: "pay@orchardlane.example", plan: "Starter", issued: "2026-08-19", amount: 49, status: "paid" },
  { id: "INV-2024", customer: "Redfern Utilities", email: "ap@redfern.example", plan: "Business", issued: "2026-08-16", amount: 1290, status: "paid" },
  { id: "INV-2023", customer: "Lumen Photography", email: "hello@lumenphoto.example", plan: "Team", issued: "2026-08-13", amount: 390, status: "overdue" },
  { id: "INV-2022", customer: "Stonebridge Capital", email: "finance@stonebridge.example", plan: "Enterprise", issued: "2026-08-11", amount: 8200, status: "paid" },
  { id: "INV-2021", customer: "Wren & Co. Legal", email: "accounts@wrenlegal.example", plan: "Business", issued: "2026-08-07", amount: 1490, status: "paid" },
  { id: "INV-2020", customer: "Harbourlight Hotels", email: "ap@harbourlight.example", plan: "Enterprise", issued: "2026-08-04", amount: 4300, status: "pending" },
  { id: "INV-2019", customer: "Mossgiel Farms", email: "office@mossgiel.example", plan: "Starter", issued: "2026-08-02", amount: 49, status: "paid" },
  { id: "INV-2018", customer: "Atlas Cycle Works", email: "billing@atlascycle.example", plan: "Team", issued: "2026-07-29", amount: 390, status: "paid" },
  { id: "INV-2017", customer: "Birchwood Schools", email: "bursar@birchwood.example", plan: "Business", issued: "2026-07-25", amount: 1290, status: "overdue" },
  { id: "INV-2016", customer: "Cinder Coffee Roasters", email: "hello@cinder.example", plan: "Starter", issued: "2026-07-22", amount: 49, status: "paid" },
  { id: "INV-2015", customer: "Drummond Textiles", email: "ap@drummond.example", plan: "Team", issued: "2026-07-18", amount: 390, status: "paid" },
  { id: "INV-2014", customer: "Eastgate Medical", email: "payables@eastgate.example", plan: "Enterprise", issued: "2026-07-14", amount: 5600, status: "paid" },
];

const STATUS_SCHEME: Record<Status, "success" | "warning" | "danger"> = {
  paid: "success",
  pending: "warning",
  overdue: "danger",
};

const STATUS_LABEL: Record<Status, string> = {
  paid: "Paid",
  pending: "Pending",
  overdue: "Overdue",
};

const STATUS_BUTTONS = [
  { value: "all", label: "All" },
  { value: "paid", label: "Paid" },
  { value: "pending", label: "Pending" },
  { value: "overdue", label: "Overdue" },
];

const PER_PAGE_OPTIONS = [5, 10, 25];

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

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
  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
}

export default function Page() {
  const [status, setStatus] = useState("all");
  const [query, setQuery] = useState("");
  const [range, setRange] = useState<DateRange>({ startDate: undefined, endDate: undefined });
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(5);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const from = range.startDate ? startOfDay(range.startDate) : null;
    const to = range.endDate ? startOfDay(range.endDate) : null;
    return INVOICES.filter((inv) => {
      if (status !== "all" && inv.status !== status) return false;
      if (q && !`${inv.id} ${inv.customer} ${inv.email} ${inv.plan}`.toLowerCase().includes(q)) {
        return false;
      }
      const t = toTime(inv.issued);
      if (from !== null && t < from) return false;
      if (to !== null && t > to) return false;
      return true;
    });
  }, [status, query, range]);

  const hasFilters =
    status !== "all" || query.trim() !== "" || !!range.startDate || !!range.endDate;

  const outstanding = useMemo(
    () => filtered.filter((i) => i.status !== "paid").reduce((sum, i) => sum + i.amount, 0),
    [filtered],
  );

  const resetFilters = () => {
    setStatus("all");
    setQuery("");
    setRange({ startDate: undefined, endDate: undefined });
    setPage(1);
  };

  const columns = [
    {
      key: "id",
      header: "Invoice",
      sortable: true,
      width: "110px",
      cell: (row: Invoice) => (
        <Text variant="label-strong-s" wrap="nowrap">
          {row.id}
        </Text>
      ),
    },
    {
      key: "customer",
      header: "Customer",
      sortable: true,
      sort: (a: Invoice, b: Invoice) => a.customer.localeCompare(b.customer),
      cell: (row: Invoice) => (
        <Column gap="2">
          <Text variant="label-default-m">{row.customer}</Text>
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
      sort: (a: Invoice, b: Invoice) => a.plan.localeCompare(b.plan),
      cell: (row: Invoice) => <Text variant="body-default-s">{row.plan}</Text>,
    },
    {
      key: "issued",
      header: "Issued",
      sortable: true,
      sort: (a: Invoice, b: Invoice) => toTime(a.issued) - toTime(b.issued),
      cell: (row: Invoice) => (
        <Text variant="body-default-s" wrap="nowrap">
          {dateFormat.format(new Date(`${row.issued}T00:00:00Z`))}
        </Text>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      sort: (a: Invoice, b: Invoice) => a.status.localeCompare(b.status),
      cell: (row: Invoice) => <Tag scheme={STATUS_SCHEME[row.status]} label={STATUS_LABEL[row.status]} />,
    },
    {
      key: "amount",
      header: "Amount",
      sortable: true,
      align: "right" as const,
      sort: (a: Invoice, b: Invoice) => a.amount - b.amount,
      cell: (row: Invoice) => (
        <Text variant="label-strong-s" wrap="nowrap">
          {currency.format(row.amount)}
        </Text>
      ),
    },
  ];

  return (
    <Column as="main" fillWidth horizontal="center" paddingX="m" paddingY="40" s={{ paddingY: "24" }}>
      <Column maxWidth="l" fillWidth gap="24">
        <Column gap="8">
          <Heading as="h1" variant="display-strong-xs">
            Invoices
          </Heading>
          <Text variant="body-default-m" onBackground="neutral-weak">
            Track what customers have paid and what is still outstanding. Sort any column, narrow
            the list with the filters, and page through the results.
          </Text>
        </Column>

        <Column background="surface" border radius="l" padding="24" gap="16" s={{ padding: "16" }}>
          <Row gap="16" vertical="end" wrap fillWidth>
            <Column gap="8" flex={1} minWidth={16}>
              <Text as="span" id="status-filter-label" variant="label-default-s" onBackground="neutral-weak">
                Status
              </Text>
              <div role="group" aria-labelledby="status-filter-label">
                <SegmentedControl
                  buttons={STATUS_BUTTONS}
                  value={status}
                  onChange={(value) => {
                    setStatus(value);
                    setPage(1);
                  }}
                />
              </div>
            </Column>

            <Column gap="8" flex={1} minWidth={16}>
              <DateRangeInput
                id="issued-range"
                startLabel="Issued from"
                endLabel="Issued to"
                value={range}
                onChange={(next) => {
                  setRange(next);
                  setPage(1);
                }}
              />
            </Column>

            <Column gap="8" flex={1} minWidth={16}>
              <Input
                id="invoice-search"
                label="Search invoices"
                type="search"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(1);
                }}
                prefix={<Icon name="search" size="s" onBackground="neutral-weak" />}
                suffix={
                  query.length > 0 ? (
                    <IconButton
                      icon="close"
                      size="s"
                      variant="ghost"
                      tooltip="Clear search"
                      aria-label="Clear search"
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

          <Row horizontal="between" vertical="center" gap="16" wrap>
            <Text variant="body-default-s" onBackground="neutral-weak" role="status" aria-live="polite">
              {filtered.length === 1 ? "1 invoice" : `${filtered.length} invoices`}
              {filtered.length > 0 ? ` · ${currency.format(outstanding)} outstanding` : ""}
            </Text>
            {hasFilters && (
              <Button size="s" variant="tertiary" prefixIcon="close" onClick={resetFilters}>
                Reset filters
              </Button>
            )}
          </Row>
        </Column>

        <DataTable<Invoice>
          aria-label="Invoices"
          columns={columns}
          rows={filtered}
          getRowId={(row) => row.id}
          defaultSort={{ key: "issued", direction: "desc" }}
          paginated
          page={page}
          onPageChange={setPage}
          perPage={perPage}
          onPerPageChange={(next) => {
            setPerPage(next);
            setPage(1);
          }}
          perPageOptions={PER_PAGE_OPTIONS}
          emptyState={
            <Column center gap="16" padding="40">
              <Icon name="search" size="l" onBackground="neutral-weak" />
              <Text variant="label-default-m">No invoices match these filters</Text>
              <Text variant="body-default-s" onBackground="neutral-weak">
                Try a different status, widen the date range or clear the search.
              </Text>
              <Button size="s" variant="secondary" onClick={resetFilters}>
                Reset filters
              </Button>
            </Column>
          }
        />
      </Column>
    </Column>
  );
}
