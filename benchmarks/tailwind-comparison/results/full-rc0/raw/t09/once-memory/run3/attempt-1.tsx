"use client";

import { useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { Button, Column, Flex, Heading, Row, Text } from "@once-ui-system/core";

type Status = "Paid" | "Pending" | "Overdue" | "Refunded";
type SortKey = "id" | "customer" | "date" | "amount" | "status";
type SortDir = "asc" | "desc";

interface Invoice {
  id: string;
  customer: string;
  email: string;
  date: string; // ISO yyyy-mm-dd
  amount: number;
  status: Status;
}

const INVOICES: Invoice[] = [
  { id: "INV-1042", customer: "Marta Kowalski", email: "marta@northwind.example", date: "2025-01-04", amount: 1240.5, status: "Paid" },
  { id: "INV-1043", customer: "Devon Clarke", email: "devon@brightlabs.example", date: "2025-01-09", amount: 389.0, status: "Pending" },
  { id: "INV-1044", customer: "Aiko Tanaka", email: "aiko@sakura.example", date: "2025-01-13", amount: 2210.0, status: "Paid" },
  { id: "INV-1045", customer: "Luis Herrera", email: "luis@herrera.example", date: "2025-01-18", amount: 95.75, status: "Overdue" },
  { id: "INV-1046", customer: "Priya Nair", email: "priya@cobalt.example", date: "2025-01-22", amount: 760.0, status: "Paid" },
  { id: "INV-1047", customer: "Tomas Berg", email: "tomas@fjord.example", date: "2025-01-27", amount: 1480.25, status: "Refunded" },
  { id: "INV-1048", customer: "Hannah Okafor", email: "hannah@lumen.example", date: "2025-02-02", amount: 530.0, status: "Pending" },
  { id: "INV-1049", customer: "Samir Haddad", email: "samir@oasis.example", date: "2025-02-06", amount: 3120.0, status: "Paid" },
  { id: "INV-1050", customer: "Chloe Martin", email: "chloe@atelier.example", date: "2025-02-11", amount: 215.4, status: "Overdue" },
  { id: "INV-1051", customer: "Jonas Weber", email: "jonas@kettle.example", date: "2025-02-15", amount: 945.0, status: "Paid" },
  { id: "INV-1052", customer: "Elena Petrova", email: "elena@polaris.example", date: "2025-02-19", amount: 1675.9, status: "Pending" },
  { id: "INV-1053", customer: "Marcus Lee", email: "marcus@harbor.example", date: "2025-02-24", amount: 420.0, status: "Paid" },
  { id: "INV-1054", customer: "Sofia Rossi", email: "sofia@verona.example", date: "2025-03-01", amount: 2890.0, status: "Paid" },
  { id: "INV-1055", customer: "Idris Mensah", email: "idris@savanna.example", date: "2025-03-05", amount: 150.0, status: "Refunded" },
  { id: "INV-1056", customer: "Greta Lindqvist", email: "greta@nordic.example", date: "2025-03-09", amount: 1105.0, status: "Overdue" },
  { id: "INV-1057", customer: "Omar Farouk", email: "omar@delta.example", date: "2025-03-14", amount: 640.8, status: "Paid" },
  { id: "INV-1058", customer: "Yuki Sato", email: "yuki@kumo.example", date: "2025-03-18", amount: 1999.0, status: "Pending" },
  { id: "INV-1059", customer: "Bianca Costa", email: "bianca@mar.example", date: "2025-03-23", amount: 310.25, status: "Paid" },
  { id: "INV-1060", customer: "Nils Andersen", email: "nils@vik.example", date: "2025-03-28", amount: 875.0, status: "Overdue" },
  { id: "INV-1061", customer: "Amara Diallo", email: "amara@sahel.example", date: "2025-04-02", amount: 2450.0, status: "Paid" },
  { id: "INV-1062", customer: "Felix Braun", email: "felix@zahn.example", date: "2025-04-07", amount: 58.9, status: "Pending" },
  { id: "INV-1063", customer: "Rhea Kapoor", email: "rhea@indigo.example", date: "2025-04-12", amount: 1320.0, status: "Paid" },
  { id: "INV-1064", customer: "Lars Nilsson", email: "lars@birch.example", date: "2025-04-16", amount: 705.5, status: "Refunded" },
  { id: "INV-1065", customer: "Camila Reyes", email: "camila@sol.example", date: "2025-04-21", amount: 1840.0, status: "Paid" },
];

const STATUS_FILTERS = ["All", "Paid", "Pending", "Overdue", "Refunded"] as const;
type StatusFilter = (typeof STATUS_FILTERS)[number];

const PAGE_SIZE = 8;

const COLUMNS: { key: SortKey; label: string; align?: "right" }[] = [
  { key: "id", label: "Invoice" },
  { key: "customer", label: "Customer" },
  { key: "date", label: "Date" },
  { key: "amount", label: "Amount", align: "right" },
  { key: "status", label: "Status" },
];

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const dateFmt = new Intl.DateTimeFormat("en-US", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" });

function formatDate(iso: string): string {
  return dateFmt.format(new Date(`${iso}T00:00:00Z`));
}

const STATUS_COLORS: Record<Status, { bg: string; fg: string }> = {
  Paid: { bg: "var(--success-alpha-weak)", fg: "var(--success-on-background-strong)" },
  Pending: { bg: "var(--warning-alpha-weak)", fg: "var(--warning-on-background-strong)" },
  Overdue: { bg: "var(--danger-alpha-weak)", fg: "var(--danger-on-background-strong)" },
  Refunded: { bg: "var(--neutral-alpha-weak)", fg: "var(--neutral-on-background-strong)" },
};

const inputStyle: CSSProperties = {
  height: "2.5rem",
  padding: "0 0.75rem",
  borderRadius: "var(--radius-m, 0.5rem)",
  border: "1px solid var(--neutral-alpha-medium)",
  background: "var(--surface-background, transparent)",
  color: "var(--neutral-on-background-strong)",
  font: "inherit",
  fontSize: "0.875rem",
  minWidth: 0,
};

const thBase: CSSProperties = {
  padding: 0,
  borderBottom: "1px solid var(--neutral-alpha-medium)",
  background: "var(--neutral-alpha-weak)",
  whiteSpace: "nowrap",
};

const tdBase: CSSProperties = {
  padding: "0.875rem 1rem",
  borderBottom: "1px solid var(--neutral-alpha-weak)",
  fontSize: "0.875rem",
  color: "var(--neutral-on-background-strong)",
  verticalAlign: "middle",
};

export default function Page() {
  const [status, setStatus] = useState<StatusFilter>("All");
  const [query, setQuery] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return INVOICES.filter((inv) => {
      if (status !== "All" && inv.status !== status) return false;
      if (from && inv.date < from) return false;
      if (to && inv.date > to) return false;
      if (q && !`${inv.id} ${inv.customer} ${inv.email}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [status, query, from, to]);

  const sorted = useMemo(() => {
    const dir = sortDir === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === "number" && typeof bv === "number") return (av - bv) * dir;
      return String(av).localeCompare(String(bv)) * dir;
    });
  }, [filtered, sortKey, sortDir]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const startIdx = (currentPage - 1) * PAGE_SIZE;
  const rows = sorted.slice(startIdx, startIdx + PAGE_SIZE);

  const totalAmount = filtered.reduce((sum, inv) => sum + inv.amount, 0);
  const dateInvalid = Boolean(from && to && from > to);
  const hasFilters = status !== "All" || query !== "" || from !== "" || to !== "";

  function toggleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "amount" || key === "date" ? "desc" : "asc");
    }
    setPage(1);
  }

  function resetFilters() {
    setStatus("All");
    setQuery("");
    setFrom("");
    setTo("");
    setPage(1);
  }

  const pageNumbers = Array.from({ length: pageCount }, (_, i) => i + 1);

  return (
    <Flex fillWidth horizontal="center" paddingX="m" paddingY="l">
      <Column as="main" fillWidth maxWidth={72} gap="24">
        <Column gap="8">
          <Heading as="h1" variant="display-strong-s">
            Invoices
          </Heading>
          <Text as="p" variant="body-default-m" onBackground="neutral-weak">
            Track billing activity across your customers. Filter by status or date, search by name, and sort any column.
          </Text>
        </Column>

        {/* Filters */}
        <Column
          as="section"
          aria-label="Filters"
          gap="16"
          padding="16"
          radius="l"
          border="neutral-alpha-medium"
          background="surface"
        >
          <Column gap="8">
            <Text as="span" id="status-label" variant="label-default-s" onBackground="neutral-weak">
              Status
            </Text>
            <div
              role="radiogroup"
              aria-labelledby="status-label"
              style={{
                display: "flex",
                maxWidth: "100%",
                overflowX: "auto",
                alignSelf: "flex-start",
                padding: "0.25rem",
                gap: "0.25rem",
                borderRadius: "var(--radius-l, 0.75rem)",
                border: "1px solid var(--neutral-alpha-medium)",
                background: "var(--neutral-alpha-weak)",
              }}
            >
              {STATUS_FILTERS.map((s) => {
                const checked = status === s;
                return (
                  <label
                    key={s}
                    style={{
                      position: "relative",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "0.375rem 0.875rem",
                      borderRadius: "var(--radius-m, 0.5rem)",
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      whiteSpace: "nowrap",
                      cursor: "pointer",
                      background: checked ? "var(--brand-solid-strong, var(--brand-alpha-strong))" : "transparent",
                      color: checked ? "var(--brand-on-solid-strong, #fff)" : "var(--neutral-on-background-strong)",
                    }}
                  >
                    <input
                      type="radio"
                      name="status-filter"
                      value={s}
                      checked={checked}
                      onChange={() => {
                        setStatus(s);
                        setPage(1);
                      }}
                      style={{
                        position: "absolute",
                        inset: 0,
                        width: "100%",
                        height: "100%",
                        margin: 0,
                        opacity: 0,
                        cursor: "pointer",
                      }}
                    />
                    {s}
                  </label>
                );
              })}
            </div>
          </Column>

          <div
            style={{
              display: "grid",
              gap: "1rem",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 14rem), 1fr))",
              alignItems: "end",
            }}
          >
            <label style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
              <Text as="span" variant="label-default-s" onBackground="neutral-weak">
                Search
              </Text>
              <input
                type="search"
                value={query}
                placeholder="Invoice, customer or email"
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(1);
                }}
                style={inputStyle}
              />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
              <Text as="span" variant="label-default-s" onBackground="neutral-weak">
                From date
              </Text>
              <input
                type="date"
                value={from}
                max={to || undefined}
                onChange={(e) => {
                  setFrom(e.target.value);
                  setPage(1);
                }}
                aria-invalid={dateInvalid}
                style={inputStyle}
              />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
              <Text as="span" variant="label-default-s" onBackground="neutral-weak">
                To date
              </Text>
              <input
                type="date"
                value={to}
                min={from || undefined}
                onChange={(e) => {
                  setTo(e.target.value);
                  setPage(1);
                }}
                aria-invalid={dateInvalid}
                style={inputStyle}
              />
            </label>
            <div>
              <Button variant="secondary" size="m" onClick={resetFilters} disabled={!hasFilters}>
                Reset filters
              </Button>
            </div>
          </div>
          {dateInvalid && (
            <Text as="p" role="alert" variant="body-default-s" onBackground="danger-strong">
              The start date must be on or before the end date.
            </Text>
          )}
        </Column>

        {/* Summary */}
        <Row fillWidth horizontal="between" vertical="center" gap="12" wrap>
          <Text as="p" variant="body-default-s" onBackground="neutral-weak" aria-live="polite">
            {filtered.length === 0
              ? "No invoices match your filters"
              : `Showing ${startIdx + 1}–${startIdx + rows.length} of ${filtered.length} invoices`}
          </Text>
          <Text as="p" variant="label-default-s" onBackground="neutral-strong">
            Total: {currency.format(totalAmount)}
          </Text>
        </Row>

        {/* Table */}
        <div
          style={{
            width: "100%",
            overflowX: "auto",
            borderRadius: "var(--radius-l, 0.75rem)",
            border: "1px solid var(--neutral-alpha-medium)",
            background: "var(--surface-background, transparent)",
          }}
        >
          <table style={{ width: "100%", minWidth: "40rem", borderCollapse: "collapse", textAlign: "left" }}>
            <caption
              style={{
                position: "absolute",
                width: 1,
                height: 1,
                overflow: "hidden",
                clip: "rect(0 0 0 0)",
                whiteSpace: "nowrap",
              }}
            >
              Invoices, sortable by column
            </caption>
            <thead>
              <tr>
                {COLUMNS.map((col) => {
                  const active = sortKey === col.key;
                  const ariaSort = active ? (sortDir === "asc" ? "ascending" : "descending") : "none";
                  return (
                    <th
                      key={col.key}
                      scope="col"
                      aria-sort={ariaSort}
                      style={{ ...thBase, textAlign: col.align ?? "left" }}
                    >
                      <button
                        type="button"
                        onClick={() => toggleSort(col.key)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: col.align === "right" ? "flex-end" : "flex-start",
                          gap: "0.375rem",
                          width: "100%",
                          padding: "0.75rem 1rem",
                          background: "transparent",
                          border: 0,
                          cursor: "pointer",
                          font: "inherit",
                          fontSize: "0.8125rem",
                          fontWeight: 600,
                          color: active
                            ? "var(--brand-on-background-strong)"
                            : "var(--neutral-on-background-strong)",
                        }}
                      >
                        {col.label}
                        <span aria-hidden="true" style={{ display: "inline-block", width: "1em", opacity: active ? 1 : 0.35 }}>
                          {active ? (sortDir === "asc" ? "↑" : "↓") : "↕"}
                        </span>
                      </button>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={COLUMNS.length} style={{ ...tdBase, textAlign: "center", padding: "3rem 1rem" }}>
                    <Column gap="8" horizontal="center">
                      <Text variant="heading-strong-s">No results found</Text>
                      <Text variant="body-default-s" onBackground="neutral-weak">
                        Try widening the date range or clearing the search.
                      </Text>
                    </Column>
                  </td>
                </tr>
              ) : (
                rows.map((inv) => {
                  const colors = STATUS_COLORS[inv.status];
                  return (
                    <tr key={inv.id}>
                      <td style={{ ...tdBase, fontFamily: "var(--font-code)", whiteSpace: "nowrap" }}>{inv.id}</td>
                      <td style={tdBase}>
                        <div style={{ fontWeight: 600 }}>{inv.customer}</div>
                        <div style={{ color: "var(--neutral-on-background-weak)", fontSize: "0.8125rem" }}>
                          {inv.email}
                        </div>
                      </td>
                      <td style={{ ...tdBase, whiteSpace: "nowrap" }}>
                        <time dateTime={inv.date}>{formatDate(inv.date)}</time>
                      </td>
                      <td style={{ ...tdBase, textAlign: "right", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>
                        {currency.format(inv.amount)}
                      </td>
                      <td style={tdBase}>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "0.125rem 0.625rem",
                            borderRadius: "999px",
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            background: colors.bg,
                            color: colors.fg,
                          }}
                        >
                          {inv.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <Row as="nav" aria-label="Pagination" fillWidth horizontal="between" vertical="center" gap="12" wrap>
          <Text as="span" variant="body-default-s" onBackground="neutral-weak">
            Page {currentPage} of {pageCount}
          </Text>
          <Row gap="8" vertical="center" wrap>
            <Button
              variant="secondary"
              size="s"
              onClick={() => setPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              aria-label="Previous page"
            >
              Previous
            </Button>
            {pageNumbers.map((n) => (
              <Button
                key={n}
                variant={n === currentPage ? "primary" : "tertiary"}
                size="s"
                onClick={() => setPage(n)}
                aria-label={`Page ${n}`}
                aria-current={n === currentPage ? "page" : undefined}
              >
                {String(n)}
              </Button>
            ))}
            <Button
              variant="secondary"
              size="s"
              onClick={() => setPage(Math.min(pageCount, currentPage + 1))}
              disabled={currentPage === pageCount}
              aria-label="Next page"
            >
              Next
            </Button>
          </Row>
        </Row>
      </Column>
    </Flex>
  );
}
