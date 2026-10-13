"use client";

import {
  Button,
  Column,
  DataTable,
  DateRangeInput,
  Heading,
  Icon,
  Input,
  Row,
  SegmentedControl,
  Tag,
  Text,
} from "@once-ui-system/core";
import { useMemo, useState } from "react";

type Status = "paid" | "pending" | "overdue";

interface Invoice {
  id: string;
  number: string;
  customer: string;
  email: string;
  issued: string;
  amount: number;
  status: Status;
}

type Seed = [string, string, string, number, Status];

const seeds: Seed[] = [
  ["Northwind Logistics", "billing@northwind.example", "2026-09-28", 4820, "paid"],
  ["Harbor & Pine Studio", "ap@harborpine.example", "2026-09-26", 1260, "pending"],
  ["Kestrel Analytics", "finance@kestrel.example", "2026-09-22", 9400, "paid"],
  ["Lumen Health", "accounts@lumenhealth.example", "2026-09-19", 3150, "overdue"],
  ["Orbital Coffee Co.", "hello@orbitalcoffee.example", "2026-09-17", 540, "paid"],
  ["Fjord Mobility", "invoices@fjord.example", "2026-09-15", 7285, "pending"],
  ["Tidewater Legal", "office@tidewater.example", "2026-09-12", 2100, "paid"],
  ["Basalt Robotics", "ap@basalt.example", "2026-09-09", 12600, "overdue"],
  ["Cobalt Print House", "studio@cobalt.example", "2026-09-06", 890, "paid"],
  ["Meridian Travel", "pay@meridian.example", "2026-09-03", 3740, "pending"],
  ["Alder & Finch", "books@alderfinch.example", "2026-08-30", 1975, "paid"],
  ["Summit Outfitters", "finance@summit.example", "2026-08-27", 6110, "overdue"],
  ["Quartz Bio Labs", "ap@quartzbio.example", "2026-08-24", 15250, "paid"],
  ["Willow Education", "team@willow.example", "2026-08-21", 720, "paid"],
  ["Ironbridge Capital", "ops@ironbridge.example", "2026-08-18", 8800, "pending"],
  ["Saffron Kitchen Group", "ap@saffron.example", "2026-08-15", 2460, "paid"],
  ["Polar Freight", "billing@polarfreight.example", "2026-08-12", 5390, "overdue"],
  ["Marlow Architects", "studio@marlow.example", "2026-08-09", 3320, "paid"],
  ["Nimbus Telecom", "invoices@nimbus.example", "2026-08-06", 11040, "paid"],
  ["Greenfield Grocers", "accounts@greenfield.example", "2026-08-03", 1480, "pending"],
  ["Vantage Media", "pay@vantage.example", "2026-07-30", 4100, "paid"],
  ["Redwood Credit Union", "ap@redwoodcu.example", "2026-07-26", 9950, "overdue"],
  ["Echo Park Dental", "office@echopark.example", "2026-07-22", 635, "paid"],
  ["Atlas Surveying", "billing@atlas.example", "2026-07-18", 2890, "paid"],
];

const invoices: Invoice[] = seeds.map(([customer, email, issued, amount, status], index) => ({
  id: `inv-${index + 1}`,
  number: `INV-${String(2041 - index).padStart(4, "0")}`,
  customer,
  email,
  issued,
  amount,
  status,
}));

const statusMeta: Record<Status, { label: string; scheme: "success" | "warning" | "danger" }> = {
  paid: { label: "Paid", scheme: "success" },
  pending: { label: "Pending", scheme: "warning" },
  overdue: { label: "Overdue", scheme: "danger" },
};

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const dateFormat = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

function toTime(iso: string): number {
  return new Date(`${iso}T00:00:00Z`).getTime();
}

function dayStart(date: Date): number {
  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
}

interface RangeValue {
  startDate: Date | undefined;
  endDate: Date | undefined;
}

export default function Page() {
  const [status, setStatus] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [range, setRange] = useState<RangeValue>({ startDate: undefined, endDate: undefined });
  const [page, setPage] = useState(1);

  const counts = useMemo(() => {
    const result: Record<string, number> = { all: invoices.length, paid: 0, pending: 0, overdue: 0 };
    for (const invoice of invoices) result[invoice.status] += 1;
    return result;
  }, []);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    const from = range.startDate ? dayStart(range.startDate) : undefined;
    const to = range.endDate ? dayStart(range.endDate) : undefined;
    return invoices.filter((invoice) => {
      if (status !== "all" && invoice.status !== status) return false;
      if (term) {
        const haystack = `${invoice.number} ${invoice.customer} ${invoice.email}`.toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      const time = toTime(invoice.issued);
      if (from !== undefined && time < from) return false;
      if (to !== undefined && time > to) return false;
      return true;
    });
  }, [status, query, range]);

  const hasFilters =
    status !== "all" || query.trim() !== "" || Boolean(range.startDate) || Boolean(range.endDate);

  const resetFilters = () => {
    setStatus("all");
    setQuery("");
    setRange({ startDate: undefined, endDate: undefined });
    setPage(1);
  };

  const outstanding = filtered
    .filter((invoice) => invoice.status !== "paid")
    .reduce((sum, invoice) => sum + invoice.amount, 0);

  return (
    <Column as="main" fillWidth horizontal="center" paddingX="16" paddingY="32">
      <Column maxWidth="l" fillWidth gap="24">
        <Row fillWidth horizontal="between" vertical="end" gap="16" wrap>
          <Column gap="8" flex={1} minWidth={16}>
            <Text variant="label-default-s" onBackground="brand-medium">
              Billing
            </Text>
            <Heading as="h1" variant="display-strong-xs">
              Invoices
            </Heading>
            <Text variant="body-default-m" onBackground="neutral-weak">
              Track what has been paid, what is still open and what needs a reminder.
            </Text>
          </Column>
          <Button prefixIcon="download" variant="secondary" onClick={() => undefined}>
            Export CSV
          </Button>
        </Row>

        <Column
          background="surface"
          border
          radius="l"
          padding="16"
          gap="16"
          role="search"
          aria-label="Filter invoices"
        >
          <SegmentedControl
            aria-label="Invoice status"
            buttons={[
              { value: "all", label: `All (${counts.all})` },
              { value: "paid", label: `Paid (${counts.paid})` },
              { value: "pending", label: `Pending (${counts.pending})` },
              { value: "overdue", label: `Overdue (${counts.overdue})` },
            ]}
            value={status}
            onChange={(value) => {
              setStatus(value);
              setPage(1);
            }}
          />
          <Row gap="16" fillWidth s={{ direction: "column" }}>
            <Column flex={1} fillWidth>
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
              />
            </Column>
            <Column flex={1} fillWidth>
              <DateRangeInput
                id="invoice-dates"
                startLabel="Issued from"
                endLabel="Issued to"
                value={range}
                onChange={(next) => {
                  setRange({ startDate: next.startDate, endDate: next.endDate });
                  setPage(1);
                }}
              />
            </Column>
          </Row>
          <Row fillWidth horizontal="between" vertical="center" gap="12" wrap>
            <Text variant="body-default-s" onBackground="neutral-weak" aria-live="polite">
              {filtered.length} {filtered.length === 1 ? "invoice" : "invoices"}
              {" · "}
              {currency.format(outstanding)} outstanding
            </Text>
            {hasFilters && (
              <Button variant="tertiary" size="s" prefixIcon="close" onClick={resetFilters}>
                Clear filters
              </Button>
            )}
          </Row>
        </Column>

        <Column fillWidth overflowX="auto">
          <DataTable<Invoice>
            aria-label="Invoices"
            rows={filtered}
            getRowId={(row) => row.id}
            defaultSort={{ key: "issued", direction: "desc" }}
            paginated
            page={page}
            onPageChange={setPage}
            defaultPerPage={8}
            perPageOptions={[8, 16, 24]}
            stickyHeader
            columns={[
              {
                key: "number",
                header: "Invoice",
                sortable: true,
                sort: (a, b) => a.number.localeCompare(b.number),
                cell: (row) => <Text variant="label-default-s">{row.number}</Text>,
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
                key: "issued",
                header: "Issued",
                sortable: true,
                sort: (a, b) => toTime(a.issued) - toTime(b.issued),
                cell: (row) => (
                  <Text variant="body-default-s">{dateFormat.format(new Date(toTime(row.issued)))}</Text>
                ),
              },
              {
                key: "status",
                header: "Status",
                sortable: true,
                sort: (a, b) => statusMeta[a.status].label.localeCompare(statusMeta[b.status].label),
                cell: (row) => (
                  <Tag scheme={statusMeta[row.status].scheme} size="s">
                    {statusMeta[row.status].label}
                  </Tag>
                ),
              },
              {
                key: "amount",
                header: "Amount",
                align: "right",
                sortable: true,
                sort: (a, b) => a.amount - b.amount,
                cell: (row) => <Text variant="label-default-s">{currency.format(row.amount)}</Text>,
              },
            ]}
            emptyState={
              <Column center gap="12" padding="32">
                <Text variant="heading-strong-s">No invoices match these filters</Text>
                <Text variant="body-default-s" onBackground="neutral-weak">
                  Try a different search term or widen the date range.
                </Text>
                <Button variant="secondary" size="s" onClick={resetFilters}>
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
