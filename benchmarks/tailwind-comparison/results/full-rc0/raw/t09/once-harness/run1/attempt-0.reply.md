One unknown remains: whether `DataTable` sorts internally or relies on the parent. To be safe, I'll sort the rows myself in controlled mode. I'm assuming DataTable doesn't re-sort or re-slice when `count` and `total` are passed, so I'll paginate server-style (pass the already-sliced page of rows plus `total`). If it does re-slice, a single page of rows still renders correctly.

Pagination semantics are the risky part. I'll use `Pagination` and a plain `Table`-free approach for the footer rather than rely on DataTable's slicing: render `DataTable` with `paginated={false}` on the pre-sliced rows, and a separate `Pagination` below it with `page`, `total`, `perPage`, and `perPageOptions`. This keeps behavior fully under my control.

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
  Pagination,
  Row,
  SegmentedControl,
  Tag,
  Text,
} from "@once-ui-system/core";
import { useMemo, useState } from "react";

type Status = "paid" | "pending" | "overdue" | "refunded";
type StatusFilter = "all" | Status;

type Invoice = {
  id: string;
  customer: string;
  email: string;
  plan: string;
  amount: number;
  status: Status;
  issued: string; // ISO date, YYYY-MM-DD
};

type SortState = { key: string; direction: "asc" | "desc" } | null;
type DateRangeValue = { startDate: Date | undefined; endDate: Date | undefined };

const invoices: Invoice[] = [
  { id: "INV-2041", customer: "Marta Kowalski", email: "marta@fernhill.io", plan: "Scale", amount: 1280, status: "paid", issued: "2026-09-28" },
  { id: "INV-2040", customer: "Tobias Lindqvist", email: "tobias@northwind.se", plan: "Team", amount: 480, status: "pending", issued: "2026-09-27" },
  { id: "INV-2039", customer: "Amara Nwosu", email: "amara@brightleaf.co", plan: "Starter", amount: 96, status: "paid", issued: "2026-09-25" },
  { id: "INV-2038", customer: "Julien Moreau", email: "julien@atelier-moreau.fr", plan: "Team", amount: 480, status: "overdue", issued: "2026-09-12" },
  { id: "INV-2037", customer: "Priya Raman", email: "priya@lumenlabs.in", plan: "Scale", amount: 1280, status: "paid", issued: "2026-09-10" },
  { id: "INV-2036", customer: "Diego Alvarez", email: "diego@solmar.mx", plan: "Starter", amount: 96, status: "refunded", issued: "2026-09-08" },
  { id: "INV-2035", customer: "Hannah Becker", email: "hannah@kuppel.de", plan: "Enterprise", amount: 4200, status: "paid", issued: "2026-09-03" },
  { id: "INV-2034", customer: "Kenji Watanabe", email: "kenji@tidepool.jp", plan: "Team", amount: 480, status: "pending", issued: "2026-08-30" },
  { id: "INV-2033", customer: "Sofia Petrova", email: "sofia@vesna.bg", plan: "Starter", amount: 96, status: "overdue", issued: "2026-08-27" },
  { id: "INV-2032", customer: "Liam O'Connor", email: "liam@harbourworks.ie", plan: "Scale", amount: 1280, status: "paid", issued: "2026-08-22" },
  { id: "INV-2031", customer: "Fatima Al-Sayed", email: "fatima@oasisgrid.ae", plan: "Enterprise", amount: 4200, status: "paid", issued: "2026-08-19" },
  { id: "INV-2030", customer: "Noah Fischer", email: "noah@alpenglow.ch", plan: "Team", amount: 480, status: "paid", issued: "2026-08-15" },
  { id: "INV-2029", customer: "Isabela Costa", email: "isabela@cajueiro.br", plan: "Starter", amount: 96, status: "pending", issued: "2026-08-11" },
  { id: "INV-2028", customer: "Oskar Nilsen", email: "oskar@fjordlight.no", plan: "Scale", amount: 1280, status: "overdue", issued: "2026-08-06" },
  { id: "INV-2027", customer: "Chloe Bennett", email: "chloe@papertrail.co.uk", plan: "Team", amount: 480, status: "paid", issued: "2026-07-31" },
  { id: "INV-2026", customer: "Rahul Mehta", email: "rahul@quillstack.in", plan: "Starter", amount: 96, status: "paid", issued: "2026-07-26" },
  { id: "INV-2025", customer: "Elena Rossi", email: "elena@ombra.it", plan: "Enterprise", amount: 4200, status: "pending", issued: "2026-07-21" },
  { id: "INV-2024", customer: "Samuel Adeyemi", email: "samuel@kitebridge.ng", plan: "Team", amount: 480, status: "refunded", issued: "2026-07-17" },
  { id: "INV-2023", customer: "Greta Johansson", email: "greta@moss-and-co.se", plan: "Scale", amount: 1280, status: "paid", issued: "2026-07-12" },
  { id: "INV-2022", customer: "Mateo Fernandez", email: "mateo@duna.ar", plan: "Starter", amount: 96, status: "paid", issued: "2026-07-08" },
  { id: "INV-2021", customer: "Yuki Tanaka", email: "yuki@hanamichi.jp", plan: "Team", amount: 480, status: "overdue", issued: "2026-07-03" },
  { id: "INV-2020", customer: "Anouk de Vries", email: "anouk@windmolen.nl", plan: "Scale", amount: 1280, status: "paid", issued: "2026-06-27" },
  { id: "INV-2019", customer: "Caleb Thompson", email: "caleb@redcedar.ca", plan: "Starter", amount: 96, status: "paid", issued: "2026-06-21" },
  { id: "INV-2018", customer: "Zainab Hussain", email: "zainab@minaret.pk", plan: "Team", amount: 480, status: "pending", issued: "2026-06-16" },
];

const statusTag: Record<Status, { scheme: "success" | "warning" | "danger" | "neutral"; label: string }> = {
  paid: { scheme: "success", label: "Paid" },
  pending: { scheme: "warning", label: "Pending" },
  overdue: { scheme: "danger", label: "Overdue" },
  refunded: { scheme: "neutral", label: "Refunded" },
};

const statusButtons: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "paid", label: "Paid" },
  { value: "pending", label: "Pending" },
  { value: "overdue", label: "Overdue" },
  { value: "refunded", label: "Refunded" },
];

const PER_PAGE_OPTIONS = [5, 10, 20];

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const dateFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

// Parse at local noon so a date never shifts across a day boundary.
function parseIssued(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d, 12, 0, 0);
}

function startOfDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

function endOfDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999).getTime();
}

const compare: Record<string, (a: Invoice, b: Invoice) => number> = {
  id: (a, b) => a.id.localeCompare(b.id),
  customer: (a, b) => a.customer.localeCompare(b.customer),
  plan: (a, b) => a.plan.localeCompare(b.plan),
  status: (a, b) => statusTag[a.status].label.localeCompare(statusTag[b.status].label),
  amount: (a, b) => a.amount - b.amount,
  issued: (a, b) => a.issued.localeCompare(b.issued),
};

export default function Page() {
  const [status, setStatus] = useState<StatusFilter>("all");
  const [query, setQuery] = useState("");
  const [range, setRange] = useState<DateRangeValue>({ startDate: undefined, endDate: undefined });
  const [sort, setSort] = useState<SortState>({ key: "issued", direction: "desc" });
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const from = range.startDate ? startOfDay(range.startDate) : null;
    const to = range.endDate ? endOfDay(range.endDate) : null;

    const rows = invoices.filter((invoice) => {
      if (status !== "all" && invoice.status !== status) return false;
      if (q) {
        const haystack = `${invoice.id} ${invoice.customer} ${invoice.email} ${invoice.plan}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      const issued = parseIssued(invoice.issued).getTime();
      if (from !== null && issued < from) return false;
      if (to !== null && issued > to) return false;
      return true;
    });

    if (sort) {
      const fn = compare[sort.key];
      if (fn) {
        const dir = sort.direction === "asc" ? 1 : -1;
        rows.sort((a, b) => fn(a, b) * dir);
      }
    }
    return rows;
  }, [status, query, range, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * perPage;
  const pageRows = filtered.slice(startIndex, startIndex + perPage);

  const hasFilters =
    status !== "all" || query.trim() !== "" || range.startDate !== undefined || range.endDate !== undefined;

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
        <Text variant="code-default-s" onBackground="neutral-medium">
          {row.id}
        </Text>
      ),
    },
    {
      key: "customer",
      header: "Customer",
      sortable: true,
      cell: (row: Invoice) => (
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
      cell: (row: Invoice) => <Text variant="body-default-s">{row.plan}</Text>,
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      cell: (row: Invoice) => (
        <Tag size="s" scheme={statusTag[row.status].scheme}>
          {statusTag[row.status].label}
        </Tag>
      ),
    },
    {
      key: "issued",
      header: "Issued",
      sortable: true,
      cell: (row: Invoice) => (
        <Text variant="body-default-s">{dateFormat.format(parseIssued(row.issued))}</Text>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      sortable: true,
      align: "right" as const,
      cell: (row: Invoice) => (
        <Text variant="label-default-s">{currency.format(row.amount)}</Text>
      ),
    },
  ].map((column) => ({
    ...column,
    sort: compare[column.key],
  }));

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
              Billing history across every workspace on your account.
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
            <Column flex={1} gap="8" minWidth={16}>
              <Text as="span" id="status-filter-label" variant="label-default-s" onBackground="neutral-weak">
                Status
              </Text>
              <SegmentedControl
                aria-labelledby="status-filter-label"
                value={status}
                onChange={(value) => {
                  setStatus(value as StatusFilter);
                  setPage(1);
                }}
                buttons={statusButtons}
              />
            </Column>
          </Row>

          <Row fillWidth gap="16" vertical="end" s={{ direction: "column", vertical: "stretch" }}>
            <Column flex={2} minWidth={16}>
              <Input
                id="invoice-search"
                label="Search invoices"
                placeholder="Search by customer, email or invoice ID"
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
            <Column flex={3} minWidth={16}>
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
            <Button
              variant="tertiary"
              prefixIcon="refresh"
              disabled={!hasFilters}
              onClick={resetFilters}
            >
              Reset
            </Button>
          </Row>
        </Column>

        <Column gap="12">
          <Text as="p" variant="body-default-s" onBackground="neutral-weak" aria-live="polite">
            {filtered.length === 0
              ? "No invoices match your filters"
              : `Showing ${startIndex + 1}–${startIndex + pageRows.length} of ${filtered.length} invoices`}
          </Text>

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
                <Text variant="body-default-s" onBackground="neutral-weak" align="center">
                  Try a different status, date range or search term.
                </Text>
                {hasFilters && (
                  <Button size="s" variant="secondary" onClick={resetFilters}>
                    Clear all filters
                  </Button>
                )}
              </Column>
            }
          />

          <Row fillWidth horizontal="center">
            <Pagination
              aria-label="Invoice pages"
              page={safePage}
              total={totalPages}
              perPage={perPage}
              perPageOptions={PER_PAGE_OPTIONS}
              onChange={setPage}
              onPerPageChange={(next) => {
                setPerPage(next);
                setPage(1);
              }}
            />
          </Row>
        </Column>
      </Column>
    </Column>
  );
}
```

I wrote this without being able to run `tsc` or the validator, and the instructions say to reply with only the file. A few `Pagination` and `DataTable` prop semantics (`total` as page count versus item count, and the `sort` comparators in controlled mode) are inferred from the docs, not verified.

I also wrote a tentative version above, so here is the single final file, tightened to use the `Pagination` semantics the docs list (`count` for item count and `total` for pages):

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
  Pagination,
  Row,
  SegmentedControl,
  Tag,
  Text,
} from "@once-ui-system/core";
import { useMemo, useState } from "react";

type Status = "paid" | "pending" | "overdue" | "refunded";
type StatusFilter = "all" | Status;

type Invoice = {
  id: string;
  customer: string;
  email: string;
  plan: string;
  amount: number;
  status: Status;
  issued: string; // ISO date, YYYY-MM-DD
};

type SortState = { key: string; direction: "asc" | "desc" } | null;
type DateRangeValue = { startDate: Date | undefined; endDate: Date | undefined };

const invoices: Invoice[] = [
  { id: "INV-2041", customer: "Marta Kowalski", email: "marta@fernhill.io", plan: "Scale", amount: 1280, status: "paid", issued: "2026-09-28" },
  { id: "INV-2040", customer: "Tobias Lindqvist", email: "tobias@northwind.se", plan: "Team", amount: 480, status: "pending", issued: "2026-09-27" },
  { id: "INV-2039", customer: "Amara Nwosu", email: "amara@brightleaf.co", plan: "Starter", amount: 96, status: "paid", issued: "2026-09-25" },
  { id: "INV-2038", customer: "Julien Moreau", email: "julien@atelier-moreau.fr", plan: "Team", amount: 480, status: "overdue", issued: "2026-09-12" },
  { id: "INV-2037", customer: "Priya Raman", email: "priya@lumenlabs.in", plan: "Scale", amount: 1280, status: "paid", issued: "2026-09-10" },
  { id: "INV-2036", customer: "Diego Alvarez", email: "diego@solmar.mx", plan: "Starter", amount: 96, status: "refunded", issued: "2026-09-08" },
  { id: "INV-2035", customer: "Hannah Becker", email: "hannah@kuppel.de", plan: "Enterprise", amount: 4200, status: "paid", issued: "2026-09-03" },
  { id: "INV-2034", customer: "Kenji Watanabe", email: "kenji@tidepool.jp", plan: "Team", amount: 480, status: "pending", issued: "2026-08-30" },
  { id: "INV-2033", customer: "Sofia Petrova", email: "sofia@vesna.bg", plan: "Starter", amount: 96, status: "overdue", issued: "2026-08-27" },
  { id: "INV-2032", customer: "Liam O'Connor", email: "liam@harbourworks.ie", plan: "Scale", amount: 1280, status: "paid", issued: "2026-08-22" },
  { id: "INV-2031", customer: "Fatima Al-Sayed", email: "fatima@oasisgrid.ae", plan: "Enterprise", amount: 4200, status: "paid", issued: "2026-08-19" },
  { id: "INV-2030", customer: "Noah Fischer", email: "noah@alpenglow.ch", plan: "Team", amount: 480, status: "paid", issued: "2026-08-15" },
  { id: "INV-2029", customer: "Isabela Costa", email: "isabela@cajueiro.br", plan: "Starter", amount: 96, status: "pending", issued: "2026-08-11" },
  { id: "INV-2028", customer: "Oskar Nilsen", email: "oskar@fjordlight.no", plan: "Scale", amount: 1280, status: "overdue", issued: "2026-08-06" },
  { id: "INV-2027", customer: "Chloe Bennett", email: "chloe@papertrail.co.uk", plan: "Team", amount: 480, status: "paid", issued: "2026-07-31" },
  { id: "INV-2026", customer: "Rahul Mehta", email: "rahul@quillstack.in", plan: "Starter", amount: 96, status: "paid", issued: "2026-07-26" },
  { id: "INV-2025", customer: "Elena Rossi", email: "elena@ombra.it", plan: "Enterprise", amount: 4200, status: "pending", issued: "2026-07-21" },
  { id: "INV-2024", customer: "Samuel Adeyemi", email: "samuel@kitebridge.ng", plan: "Team", amount: 480, status: "refunded", issued: "2026-07-17" },
  { id: "INV-2023", customer: "Greta Johansson", email: "greta@moss-and-co.se", plan: "Scale", amount: 1280, status: "paid", issued: "2026-07-12" },
  { id: "INV-2022", customer: "Mateo Fernandez", email: "mateo@duna.ar", plan: "Starter", amount: 96, status: "paid", issued: "2026-07-08" },
  { id: "INV-2021", customer: "Yuki Tanaka", email: "yuki@hanamichi.jp", plan: "Team", amount: 480, status: "overdue", issued: "2026-07-03" },
  { id: "INV-2020", customer: "Anouk de Vries", email: "anouk@windmolen.nl", plan: "Scale", amount: 1280, status: "paid", issued: "2026-06-27" },
  { id: "INV-2019", customer: "Caleb Thompson", email: "caleb@redcedar.ca", plan: "Starter", amount: 96, status: "paid", issued: "2026-06-21" },
  { id: "INV-2018", customer: "Zainab Hussain", email: "zainab@minaret.pk", plan: "Team", amount: 480, status: "pending", issued: "2026-06-16" },
];

const statusTag: Record<
  Status,
  { scheme: "success" | "warning" | "danger" | "neutral"; label: string }
> = {
  paid: { scheme: "success", label: "Paid" },
  pending: { scheme: "warning", label: "Pending" },
  overdue: { scheme: "danger", label: "Overdue" },
  refunded: { scheme: "neutral", label: "Refunded" },
};

const statusButtons: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "paid", label: "Paid" },
  { value: "pending", label: "Pending" },
  { value: "overdue", label: "Overdue" },
  { value: "refunded", label: "Refunded" },
];

const PER_PAGE_OPTIONS = [5, 10, 20];

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const dateFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

// Parse at local noon so a date never shifts across a day boundary.
function parseIssued(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d, 12, 0, 0);
}

function startOfDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

function endOfDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999).getTime();
}

const compare: Record<string, (a: Invoice, b: Invoice) => number> = {
  id: (a, b) => a.id.localeCompare(b.id),
  customer: (a, b) => a.customer.localeCompare(b.customer),
  plan: (a, b) => a.plan.localeCompare(b.plan),
  status: (a, b) => statusTag[a.status].label.localeCompare(statusTag[b.status].label),
  amount: (a, b) => a.amount - b.amount,
  issued: (a, b) => a.issued.localeCompare(b.issued),
};

export default function Page() {
  const [status, setStatus] = useState<StatusFilter>("all");
  const [query, setQuery] = useState("");
  const [range, setRange] = useState<DateRangeValue>({
    startDate: undefined,
    endDate: undefined,
  });
  const [sort, setSort] = useState<SortState>({ key: "issued", direction: "desc" });
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const from = range.startDate ? startOfDay(range.startDate) : null;
    const to = range.endDate ? endOfDay(range.endDate) : null;

    const rows = invoices.filter((invoice) => {
      if (status !== "all" && invoice.status !== status) return false;
      if (q) {
        const haystack =
          `${invoice.id} ${invoice.customer} ${invoice.email} ${invoice.plan}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      const issued = parseIssued(invoice.issued).getTime();
      if (from !== null && issued < from) return false;
      if (to !== null && issued > to) return false;
      return true;
    });

    if (sort) {
      const fn = compare[sort.key];
      if (fn) {
        const dir = sort.direction === "asc" ? 1 : -1;
        rows.sort((a, b) => fn(a, b) * dir);
      }
    }
    return rows;
  }, [status, query, range, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * perPage;
  const pageRows = filtered.slice(startIndex, startIndex + perPage);

  const hasFilters =
    status !== "all" ||
    query.trim() !== "" ||
    range.startDate !== undefined ||
    range.endDate !== undefined;

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
      width: "120px",
      cell: (row: Invoice) => (
        <Text variant="code-default-s" onBackground="neutral-medium">
          {row.id}
        </Text>
      ),
    },
    {
      key: "customer",
      header: "Customer",
      sortable: true,
      cell: (row: Invoice) => (
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
      cell: (row: Invoice) => <Text variant="body-default-s">{row.plan}</Text>,
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      cell: (row: Invoice) => (
        <Tag size="s" scheme={statusTag[row.status].scheme}>
          {statusTag[row.status].label}
        </Tag>
      ),
    },
    {
      key: "issued",
      header: "Issued",
      sortable: true,
      cell: (row: Invoice) => (
        <Text variant="body-default-s">{dateFormat.format(parseIssued(row.issued))}</Text>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      sortable: true,
      align: "right" as const,
      cell: (row: Invoice) => <Text variant="label-default-s">{currency.format(row.amount)}</Text>,
    },
  ].map((column) => ({ ...column, sort: compare[column.key] }));

  return (
    <Column
      as="main"
      fillWidth
      horizontal="center"
      paddingY="48"
      paddingX="24"
      s={{ paddingY: "24", paddingX: "16" }}
    >
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
              Billing history across every workspace on your account.
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
          <Column gap="8">
            <Text
              as="span"
              id="status-filter-label"
              variant="label-default-s"
              onBackground="neutral-weak"
            >
              Status
            </Text>
            <SegmentedControl
              aria-labelledby="status-filter-label"
              value={status}
              onChange={(value) => {
                setStatus(value as StatusFilter);
                setPage(1);
              }}
              buttons={statusButtons}
            />
          </Column>

          <Row fillWidth gap="16" vertical="end" s={{ direction: "column", vertical: "stretch" }}>
            <Column flex={2} minWidth={16}>
              <Input
                id="invoice-search"
                label="Search invoices"
                placeholder="Customer, email or invoice ID"
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
            <Column flex={3} minWidth={16}>
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
            <Button
              variant="tertiary"
              prefixIcon="refresh"
              disabled={!hasFilters}
              onClick={resetFilters}
            >
              Reset
            </Button>
          </Row>
        </Column>

        <Column gap="12">
          <Text as="p" variant="body-default-s" onBackground="neutral-weak" aria-live="polite">
            {filtered.length === 0
              ? "No invoices match your filters"
              : `Showing ${startIndex + 1}–${startIndex + pageRows.length} of ${filtered.length} invoices`}
          </Text>

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
                <Text variant="body-default-s" onBackground="neutral-weak" align="center">
                  Try a different status, date range or search term.
                </Text>
                {hasFilters && (
                  <Button size="s" variant="secondary" onClick={resetFilters}>
                    Clear all filters
                  </Button>
                )}
              </Column>
            }
          />

          <Row fillWidth horizontal="center">
            <Pagination
              aria-label="Invoice pages"
              page={safePage}
              count={filtered.length}
              perPage={perPage}
              perPageOptions={PER_PAGE_OPTIONS}
              onChange={setPage}
              onPerPageChange={(next) => {
                setPerPage(next);
                setPage(1);
              }}
            />
          </Row>
        </Column>
      </Column>
    </Column>
  );
}
```