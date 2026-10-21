"use client";

import {
  Button,
  Column,
  Row,
  Table,
  type TableColumn,
  type TableQuery,
  type TableSort,
  Tag,
  Text,
} from "@once-ui-system/core";
import { useEffect, useState } from "react";

type Invoice = {
  id: string;
  customer: string;
  status: "paid" | "pending" | "overdue";
  amount: number;
  issued: string;
};

const STATUS_SCHEME = { paid: "success", pending: "warning", overdue: "danger" } as const;

const CUSTOMERS = ["Acme", "Globex", "Initech", "Umbrella", "Hooli", "Stark", "Wayne", "Wonka"];
const STATUSES: Invoice["status"][] = ["paid", "pending", "paid", "overdue", "paid"];

const INVOICES: Invoice[] = Array.from({ length: 48 }, (_, index) => ({
  id: `INV-${String(1001 + index)}`,
  customer: CUSTOMERS[(index * 5) % CUSTOMERS.length],
  status: STATUSES[index % STATUSES.length],
  amount: ((index * 7919) % 4800) + 120,
  issued: `2026-${String((index % 9) + 1).padStart(2, "0")}-${String((index % 27) + 1).padStart(2, "0")}`,
}));

const money = (amount: number) => `$${amount.toLocaleString("en-US")}`;

const columns: TableColumn<Invoice>[] = [
  { key: "id", header: "Invoice", sortable: true },
  { key: "customer", header: "Customer", sortable: true },
  {
    key: "status",
    header: "Status",
    cell: (invoice) => (
      <Tag size="s" tone={STATUS_SCHEME[invoice.status]}>
        {invoice.status}
      </Tag>
    ),
  },
  { key: "issued", header: "Issued", sortable: true },
  {
    key: "amount",
    header: "Amount",
    align: "right",
    sortable: true,
    cell: (invoice) => money(invoice.amount),
  },
];

export function DataTableExample() {
  return <Table aria-label="Invoices" columns={columns} rows={INVOICES.slice(0, 6)} />;
}

export function DataTableSelectionExample() {
  const [selected, setSelected] = useState<string[]>([]);

  return (
    <Column fillWidth gap="12">
      <Row fillWidth horizontal="between" vertical="center" paddingX="4">
        <Text textVariant="label-default-m">
          {selected.length > 0 ? `${selected.length} selected` : "Invoices"}
        </Text>
        <Button
          size="s"
          variant="secondary"
          disabled={selected.length === 0}
          onClick={() => setSelected([])}
        >
          Clear selection
        </Button>
      </Row>
      <Table
        aria-label="Selectable invoices"
        columns={columns}
        rows={INVOICES}
        getRowId={(invoice) => invoice.id}
        getRowLabel={(invoice) => `Select ${invoice.id}`}
        selectable
        selected={selected}
        onSelectionChange={setSelected}
        paginated
        defaultPerPage={5}
        perPageOptions={[5, 10, 25]}
      />
    </Column>
  );
}

/** Stands in for an API: sorts and slices on the "server", after a delay. */
function fetchInvoices(
  page: number,
  perPage: number,
  sort: TableSort | null,
  source: Invoice[] = INVOICES,
) {
  const sorted = [...source];
  if (sort) {
    const key = sort.key as keyof Invoice;
    sorted.sort((a, b) => {
      const order = a[key] < b[key] ? -1 : a[key] > b[key] ? 1 : 0;
      return sort.direction === "asc" ? order : -order;
    });
  }
  return new Promise<{ rows: Invoice[]; count: number }>((resolve) =>
    setTimeout(
      () =>
        resolve({ rows: sorted.slice((page - 1) * perPage, page * perPage), count: sorted.length }),
      600,
    ),
  );
}

export function DataTableServerExample() {
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<TableSort | null>(null);
  const [data, setData] = useState<{ rows: Invoice[]; count: number }>({ rows: [], count: 0 });
  const [loading, setLoading] = useState(true);
  const perPage = 5;

  useEffect(() => {
    let current = true;
    setLoading(true);
    fetchInvoices(page, perPage, sort).then((result) => {
      if (!current) return;
      setData(result);
      setLoading(false);
    });
    return () => {
      current = false;
    };
  }, [page, sort]);

  return (
    <Table
      aria-label="Server-paginated invoices"
      columns={columns}
      rows={data.rows}
      count={data.count}
      perPage={perPage}
      page={page}
      onPageChange={setPage}
      sort={sort}
      onSortChange={setSort}
      loading={loading}
    />
  );
}

const STATUS_OPTIONS = [
  { value: "paid", label: "Paid" },
  { value: "pending", label: "Pending" },
  { value: "overdue", label: "Overdue" },
];

// The same columns, with a status filter, and the less important columns
// dropping out on narrow screens.
const toolbarColumns: TableColumn<Invoice>[] = columns.map((column) =>
  column.key === "status"
    ? { ...column, filter: { options: STATUS_OPTIONS } }
    : column.key === "issued"
      ? { ...column, hide: { s: true } }
      : column.key === "customer"
        ? { ...column, hide: { xs: true } }
        : column,
);

export function DataTableToolbarExample() {
  return (
    <Table
      aria-label="Filterable invoices"
      columns={toolbarColumns}
      rows={INVOICES}
      searchable
      columnsMenu
      toolbar={
        <Button size="s" variant="secondary" prefixIcon="download">
          Export
        </Button>
      }
      paginated
      defaultPerPage={5}
    />
  );
}

/** Stands in for an API that searches and filters as well. */
function queryInvoices({ page, perPage, sort, search, filters }: TableQuery) {
  const query = search.trim().toLowerCase();
  const status = filters.status;
  const matching = INVOICES.filter(
    (invoice) =>
      (!query || `${invoice.id} ${invoice.customer}`.toLowerCase().includes(query)) &&
      (!status || invoice.status === status),
  );
  return fetchInvoices(page, perPage, sort, matching);
}

export function DataTableServerQueryExample() {
  const [query, setQuery] = useState<TableQuery>({
    page: 1,
    perPage: 5,
    sort: null,
    search: "",
    filters: {},
  });
  const [data, setData] = useState<{ rows: Invoice[]; count: number }>({ rows: [], count: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let current = true;
    setLoading(true);
    queryInvoices(query).then((result) => {
      if (!current) return;
      setData(result);
      setLoading(false);
    });
    return () => {
      current = false;
    };
  }, [query]);

  return (
    <Table
      aria-label="Server-searched invoices"
      columns={toolbarColumns}
      rows={data.rows}
      count={data.count}
      page={query.page}
      perPage={query.perPage}
      sort={query.sort}
      search={query.search}
      filters={query.filters}
      onQueryChange={setQuery}
      searchable
      loading={loading}
      keepRowsWhileLoading
    />
  );
}
