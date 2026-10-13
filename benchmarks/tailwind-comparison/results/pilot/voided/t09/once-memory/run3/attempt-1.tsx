"use client";

import { useMemo, useState } from "react";
import { Button, Column, Flex, Heading, Input, Row, SegmentedControl, Text } from "@once-ui-system/core";

type Status = "Paid" | "Pending" | "Overdue";
type SortKey = "invoice" | "customer" | "date" | "amount" | "status";
type SortDir = "asc" | "desc";

interface Invoice {
  invoice: string;
  customer: string;
  date: string;
  amount: number;
  status: Status;
}

const customers = [
  "Northwind Logistics",
  "Fernhill Bakery",
  "Quillstone Legal",
  "Harbor & Pine Outfitters",
  "Lumen Dental Group",
  "Copperleaf Studio",
  "Redwater Analytics",
  "Alder Street Cafe",
  "Tidewell Marine",
  "Brightpath Tutoring",
  "Marlow Architects",
  "Sundial Fitness",
];
const statuses: Status[] = ["Paid", "Pending", "Overdue", "Paid", "Paid", "Pending"];

const invoices: Invoice[] = Array.from({ length: 48 }, (_, i) => {
  const day = 1 + ((i * 7) % 28);
  const month = 1 + ((i * 5) % 9);
  return {
    invoice: `INV-${String(2401 + i)}`,
    customer: customers[(i * 5) % customers.length],
    date: `2026-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
    amount: Math.round((180 + ((i * 937) % 7400) + (i % 4) * 0.5) * 100) / 100,
    status: statuses[(i * 7) % statuses.length],
  };
});

const PAGE_SIZE = 8;

const statusBackground: Record<Status, "success-alpha-weak" | "warning-alpha-weak" | "danger-alpha-weak"> = {
  Paid: "success-alpha-weak",
  Pending: "warning-alpha-weak",
  Overdue: "danger-alpha-weak",
};

const columns: { key: SortKey; label: string; numeric?: boolean }[] = [
  { key: "invoice", label: "Invoice" },
  { key: "customer", label: "Customer" },
  { key: "date", label: "Issued" },
  { key: "status", label: "Status" },
  { key: "amount", label: "Amount", numeric: true },
];

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const dateFmt = new Intl.DateTimeFormat("en-US", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" });

const cellStyle: React.CSSProperties = {
  padding: "12px 16px",
  textAlign: "left",
  borderBottom: "1px solid var(--neutral-alpha-weak)",
  whiteSpace: "nowrap",
};

export default function Page() {
  const [filter, setFilter] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = invoices.filter((r) => {
      if (filter !== "all" && r.status.toLowerCase() !== filter) return false;
      if (q && !r.customer.toLowerCase().includes(q) && !r.invoice.toLowerCase().includes(q)) return false;
      if (from && r.date < from) return false;
      if (to && r.date > to) return false;
      return true;
    });
    const dir = sortDir === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === "number" && typeof bv === "number") return (av - bv) * dir;
      return String(av).localeCompare(String(bv)) * dir;
    });
  }, [filter, query, from, to, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const start = (current - 1) * PAGE_SIZE;
  const visible = rows.slice(start, start + PAGE_SIZE);

  const onSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(1);
  };

  const reset = () => {
    setFilter("all");
    setQuery("");
    setFrom("");
    setTo("");
    setPage(1);
  };

  return (
    <Column as="main" fillWidth horizontal="center" paddingX="m" paddingY="xl">
      <Column fillWidth maxWidth={64} gap="24">
        <Column gap="8">
          <Heading as="h1" variant="display-strong-s">
            Invoices
          </Heading>
          <Text variant="body-default-m" onBackground="neutral-weak">
            Track billing across your customers. Sort by any column, narrow by status or issue date, and search by
            customer or invoice number.
          </Text>
        </Column>

        <Flex
          as="section"
          aria-label="Filters"
          fillWidth
          gap="16"
          wrap
          vertical="end"
          padding="16"
          radius="l"
          border="neutral-alpha-weak"
          background="surface"
        >
          <Column gap="8">
            <Text as="span" id="status-label" variant="label-default-s" onBackground="neutral-weak">
              Status
            </Text>
            <SegmentedControl
              aria-labelledby="status-label"
              buttons={(["all", "paid", "pending", "overdue"] as const).map((value) => ({
                value,
                label: value.charAt(0).toUpperCase() + value.slice(1),
                onClick: () => {
                  setFilter(value);
                  setPage(1);
                },
              }))}
              selected={filter}
            />
          </Column>
          <Row gap="8" wrap>
            <Input
              id="date-from"
              label="Issued from"
              type="date"
              value={from}
              max={to || undefined}
              onChange={(e) => {
                setFrom(e.target.value);
                setPage(1);
              }}
            />
            <Input
              id="date-to"
              label="Issued to"
              type="date"
              value={to}
              min={from || undefined}
              onChange={(e) => {
                setTo(e.target.value);
                setPage(1);
              }}
            />
          </Row>
          <Flex flex={1} minWidth={16}>
            <Input
              id="search"
              label="Search customer or invoice"
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
            />
          </Flex>
          <Button variant="tertiary" size="m" label="Reset" onClick={reset} />
        </Flex>

        <Column fillWidth radius="l" border="neutral-alpha-weak" background="surface" overflow="hidden">
          <div style={{ overflowX: "auto" }} tabIndex={0} role="region" aria-label="Invoices table, scrollable">
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 640 }}>
              <caption style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>
                Invoices, sorted by {columns.find((c) => c.key === sortKey)?.label.toLowerCase()}{" "}
                {sortDir === "asc" ? "ascending" : "descending"}
              </caption>
              <thead>
                <tr>
                  {columns.map((c) => {
                    const active = c.key === sortKey;
                    return (
                      <th
                        key={c.key}
                        scope="col"
                        aria-sort={active ? (sortDir === "asc" ? "ascending" : "descending") : "none"}
                        style={{ ...cellStyle, textAlign: c.numeric ? "right" : "left", padding: 4 }}
                      >
                        <button
                          type="button"
                          onClick={() => onSort(c.key)}
                          style={{
                            all: "unset",
                            cursor: "pointer",
                            boxSizing: "border-box",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            padding: "8px 12px",
                            borderRadius: 8,
                            fontSize: 13,
                            fontWeight: 600,
                            color: active ? "var(--neutral-on-background-strong)" : "var(--neutral-on-background-weak)",
                          }}
                        >
                          {c.label}
                          <span aria-hidden="true">{active ? (sortDir === "asc" ? "↑" : "↓") : "↕"}</span>
                        </button>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {visible.map((r) => (
                  <tr key={r.invoice}>
                    <td style={cellStyle}>
                      <Text variant="body-strong-s">{r.invoice}</Text>
                    </td>
                    <td style={cellStyle}>
                      <Text variant="body-default-s">{r.customer}</Text>
                    </td>
                    <td style={cellStyle}>
                      <Text variant="body-default-s">{dateFmt.format(new Date(`${r.date}T00:00:00Z`))}</Text>
                    </td>
                    <td style={cellStyle}>
                      <Row
                        as="span"
                        background={statusBackground[r.status]}
                        paddingX="8"
                        paddingY="4"
                        radius="full"
                        style={{ display: "inline-flex" }}
                      >
                        <Text variant="label-default-s">{r.status}</Text>
                      </Row>
                    </td>
                    <td style={{ ...cellStyle, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                      <Text variant="body-strong-s">{money.format(r.amount)}</Text>
                    </td>
                  </tr>
                ))}
                {visible.length === 0 && (
                  <tr>
                    <td colSpan={columns.length} style={{ ...cellStyle, textAlign: "center", padding: 40, whiteSpace: "normal" }}>
                      <Text variant="body-default-m" onBackground="neutral-weak">
                        No invoices match these filters. Try widening the date range or clearing the search.
                      </Text>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Column>

        <Flex as="nav" aria-label="Pagination" fillWidth horizontal="between" vertical="center" gap="12" wrap>
          <Text variant="body-default-s" onBackground="neutral-weak" aria-live="polite">
            {rows.length === 0
              ? "0 results"
              : `Showing ${start + 1}–${Math.min(start + PAGE_SIZE, rows.length)} of ${rows.length}`}
          </Text>
          <Row gap="8" vertical="center">
            <Button
              variant="secondary"
              size="s"
              label="Previous"
              disabled={current <= 1}
              onClick={() => setPage(current - 1)}
            />
            <Text variant="label-default-s" aria-current="page">
              Page {current} of {totalPages}
            </Text>
            <Button
              variant="secondary"
              size="s"
              label="Next"
              disabled={current >= totalPages}
              onClick={() => setPage(current + 1)}
            />
          </Row>
        </Flex>
      </Column>
    </Column>
  );
}
