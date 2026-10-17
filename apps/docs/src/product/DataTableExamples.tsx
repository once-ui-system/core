"use client";

import {
  Button,
  Column,
  DataTable,
  type DataTableColumn,
  type DataTableSort,
  Row,
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

const columns: DataTableColumn<Invoice>[] = [
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
  return <DataTable aria-label="Invoices" columns={columns} rows={INVOICES.slice(0, 6)} />;
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
      <DataTable
        aria-label="Invoices"
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
function fetchInvoices(page: number, perPage: number, sort: DataTableSort | null) {
  const sorted = [...INVOICES];
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
  const [sort, setSort] = useState<DataTableSort | null>(null);
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
    <DataTable
      aria-label="Invoices"
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
