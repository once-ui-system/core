```tsx
"use client";

import { useMemo, useState, useId } from "react";
import type { CSSProperties } from "react";
import { Column, Row, Heading, Text, Button } from "@once-ui-system/core";

type Status = "Paid" | "Pending" | "Overdue" | "Refunded";
type StatusFilter = "All" | Status;

interface Order {
  id: string;
  customer: string;
  company: string;
  date: string; // ISO yyyy-mm-dd
  amount: number;
  status: Status;
}

type SortKey = "id" | "customer" | "date" | "amount" | "status";
type SortDir = "asc" | "desc";

const CUSTOMERS: ReadonlyArray<readonly [string, string]> = [
  ["Amara Okafor", "Northwind Labs"],
  ["Liam Chen", "Brightside Dental"],
  ["Sofia Marquez", "Harbor & Pine"],
  ["Noah Becker", "Kestrel Logistics"],
  ["Priya Raman", "Lumen Analytics"],
  ["Mateo Rossi", "Trattoria Verde"],
  ["Hannah Fischer", "Alpenglow Outfitters"],
  ["Yusuf Demir", "Bosphorus Imports"],
  ["Elena Petrova", "Silverline Studio"],
  ["Jack Thompson", "Thompson Roofing"],
  ["Mei Tanaka", "Sakura Ceramics"],
  ["Oliver Grant", "Grant & Wells LLP"],
];

const STATUSES: ReadonlyArray<Status> = ["Paid", "Pending", "Overdue", "Refunded"];

function buildOrders(): Order[] {
  const orders: Order[] = [];
  let seed = 7;
  const next = () => {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    return seed / 2147483648;
  };
  for (let i = 0; i < 57; i++) {
    const [customer, company] = CUSTOMERS[Math.floor(next() * CUSTOMERS.length)];
    const day = Math.floor(next() * 180);
    const d = new Date(Date.UTC(2025, 0, 1 + day));
    const r = next();
    const status: Status = r < 0.5 ? "Paid" : r < 0.75 ? "Pending" : r < 0.9 ? "Overdue" : "Refunded";
    orders.push({
      id: `INV-${(2040 + i).toString()}`,
      customer,
      company,
      date: d.toISOString().slice(0, 10),
      amount: Math.round((120 + next() * 4880) * 100) / 100,
      status,
    });
  }
  return orders;
}

const ORDERS: Order[] = buildOrders();

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const dateFmt = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

function formatDate(iso: string): string {
  return dateFmt.format(new Date(`${iso}T00:00:00Z`));
}

const STATUS_COLORS: Record<Status, { bg: string; fg: string }> = {
  Paid: { bg: "var(--success-alpha-weak)", fg: "var(--success-on-background-strong)" },
  Pending: { bg: "var(--warning-alpha-weak)", fg: "var(--warning-on-background-strong)" },
  Overdue: { bg: "var(--danger-alpha-weak)", fg: "var(--danger-on-background-strong)" },
  Refunded: { bg: "var(--neutral-alpha-weak)", fg: "var(--neutral-on-background-strong)" },
};

const PAGE_SIZES = [5, 10, 20] as const;
const FILTERS: ReadonlyArray<StatusFilter> = ["All", ...STATUSES];

const controlStyle: CSSProperties = {
  height: "2.5rem",
  padding: "0 0.75rem",
  borderRadius: "var(--radius-m)",
  border: "1px solid var(--neutral-alpha-medium)",
  background: "var(--surface-background)",
  color: "var(--neutral-on-background-strong)",
  font: "inherit",
  fontSize: "var(--font-size-s)",
  minWidth: 0,
};

const thStyle: CSSProperties = {
  textAlign: "left",
  padding: "0.25rem 0.5rem",
  borderBottom: "1px solid var(--neutral-alpha-medium)",
  whiteSpace: "nowrap",
  fontWeight: 500,
};

const tdStyle: CSSProperties = {
  padding: "0.875rem 1rem",
  borderBottom: "1px solid var(--neutral-alpha-weak)",
  fontSize: "var(--font-size-s)",
  color: "var(--neutral-on-background-strong)",
  verticalAlign: "middle",
};

export default function Page() {
  const uid = useId();
  const [status, setStatus] = useState<StatusFilter>("All");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ORDERS.filter((o) => {
      if (status !== "All" && o.status !== status) return false;
      if (from && o.date < from) return false;
      if (to && o.date > to) return false;
      if (q) {
        const hay = `${o.id} ${o.customer} ${o.company}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [status, from, to, query]);

  const sorted = useMemo(() => {
    const dir = sortDir === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      let cmp: number;
      switch (sortKey) {
        case "amount":
          cmp = a.amount - b.amount;
          break;
        case "date":
          cmp = a.date.localeCompare(b.date);
          break;
        default:
          cmp = a[sortKey].localeCompare(b[sortKey], "en", { numeric: true });
      }
      if (cmp === 0) cmp = a.id.localeCompare(b.id, "en", { numeric: true });
      return cmp * dir;
    });
  }, [filtered, sortKey, sortDir]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const startIdx = (currentPage - 1) * pageSize;
  const rows = sorted.slice(startIdx, startIdx + pageSize);
  const total = filtered.reduce((sum, o) => sum + o.amount, 0);
  const hasFilters = status !== "All" || from !== "" || to !== "" || query !== "";
  const invalidRange = from !== "" && to !== "" && from > to;

  const toggleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "amount" || key === "date" ? "desc" : "asc");
    }
    setPage(1);
  };

  const resetFilters = () => {
    setStatus("All");
    setFrom("");
    setTo("");
    setQuery("");
    setPage(1);
  };

  const columns: ReadonlyArray<{ key: SortKey; label: string; align?: "right" }> = [
    { key: "id", label: "Invoice" },
    { key: "customer", label: "Customer" },
    { key: "date", label: "Issued" },
    { key: "status", label: "Status" },
    { key: "amount", label: "Amount", align: "right" },
  ];

  const pageButtons: number[] = [];
  const windowStart = Math.max(1, Math.min(currentPage - 1, pageCount - 2));
  for (let p = windowStart; p <= Math.min(pageCount, windowStart + 2); p++) pageButtons.push(p);

  const labelStyle: CSSProperties = { display: "flex", flexDirection: "column", gap: "0.25rem" };

  return (
    <Column
      as="main"
      fillWidth
      horizontal="center"
      paddingX="16"
      paddingY="32"
      style={{ minHeight: "100vh" }}
    >
      <Column fillWidth maxWidth={72} gap="24">
        <Column gap="8">
          <Heading as="h1" variant="display-strong-s">
            Invoices
          </Heading>
          <Text variant="body-default-m" onBackground="neutral-weak">
            Track billing across customers. Filter by status or issue date, search, and sort any column.
          </Text>
        </Column>

        <Column
          as="section"
          aria-label="Filters"
          gap="16"
          padding="16"
          radius="l"
          border="neutral-alpha-medium"
          background="surface"
        >
          <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", alignItems: "flex-end" }}>
            <div role="group" aria-labelledby={`${uid}-status`} style={{ ...labelStyle, flex: "1 1 100%" }}>
              <Text as="span" id={`${uid}-status`} variant="label-default-s" onBackground="neutral-weak">
                Status
              </Text>
              <div
                role="radiogroup"
                aria-labelledby={`${uid}-status`}
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "0.25rem",
                  padding: "0.25rem",
                  borderRadius: "var(--radius-m)",
                  background: "var(--neutral-alpha-weak)",
                  width: "fit-content",
                  maxWidth: "100%",
                }}
              >
                {FILTERS.map((f) => {
                  const active = status === f;
                  return (
                    <label
                      key={f}
                      style={{
                        position: "relative",
                        padding: "0.375rem 0.875rem",
                        borderRadius: "var(--radius-s)",
                        fontSize: "var(--font-size-s)",
                        cursor: "pointer",
                        background: active ? "var(--surface-background)" : "transparent",
                        color: active
                          ? "var(--neutral-on-background-strong)"
                          : "var(--neutral-on-background-weak)",
                        fontWeight: active ? 600 : 400,
                        boxShadow: active ? "0 1px 2px var(--neutral-alpha-medium)" : "none",
                      }}
                    >
                      <input
                        type="radio"
                        name={`${uid}-status-filter`}
                        value={f}
                        checked={active}
                        onChange={() => {
                          setStatus(f);
                          setPage(1);
                        }}
                        style={{
                          position: "absolute",
                          opacity: 0,
                          inset: 0,
                          margin: 0,
                          cursor: "pointer",
                        }}
                      />
                      {f}
                    </label>
                  );
                })}
              </div>
            </div>

            <label style={{ ...labelStyle, flex: "1 1 9rem" }}>
              <Text as="span" variant="label-default-s" onBackground="neutral-weak">
                Issued from
              </Text>
              <input
                type="date"
                value={from}
                max={to || undefined}
                aria-invalid={invalidRange}
                onChange={(e) => {
                  setFrom(e.target.value);
                  setPage(1);
                }}
                style={controlStyle}
              />
            </label>

            <label style={{ ...labelStyle, flex: "1 1 9rem" }}>
              <Text as="span" variant="label-default-s" onBackground="neutral-weak">
                Issued to
              </Text>
              <input
                type="date"
                value={to}
                min={from || undefined}
                aria-invalid={invalidRange}
                onChange={(e) => {
                  setTo(e.target.value);
                  setPage(1);
                }}
                style={controlStyle}
              />
            </label>

            <label style={{ ...labelStyle, flex: "2 1 14rem" }}>
              <Text as="span" variant="label-default-s" onBackground="neutral-weak">
                Search
              </Text>
              <input
                type="search"
                value={query}
                placeholder="Invoice, customer or company"
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(1);
                }}
                style={controlStyle}
              />
            </label>

            <Button
              variant="secondary"
              size="m"
              label="Reset"
              onClick={resetFilters}
              disabled={!hasFilters}
            />
          </div>
          {invalidRange && (
            <Text variant="body-default-s" onBackground="danger-strong" role="alert">
              The start date is after the end date, so no invoices can match.
            </Text>
          )}
        </Column>

        <Row fillWidth horizontal="between" vertical="center" gap="12" wrap>
          <Text variant="body-default-s" onBackground="neutral-weak" aria-live="polite">
            {filtered.length} {filtered.length === 1 ? "invoice" : "invoices"} · {currency.format(total)} total
          </Text>
        </Row>

        <Column
          fillWidth
          radius="l"
          border="neutral-alpha-medium"
          background="surface"
          style={{ overflow: "hidden" }}
        >
          <div style={{ overflowX: "auto" }} tabIndex={0} role="region" aria-label="Invoices table, scrollable">
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "40rem" }}>
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
                  {columns.map((c) => {
                    const active = sortKey === c.key;
                    return (
                      <th
                        key={c.key}
                        scope="col"
                        aria-sort={active ? (sortDir === "asc" ? "ascending" : "descending") : "none"}
                        style={{ ...thStyle, textAlign: c.align ?? "left" }}
                      >
                        <button
                          type="button"
                          onClick={() => toggleSort(c.key)}
                          style={{
                            all: "unset",
                            boxSizing: "border-box",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.375rem",
                            padding: "0.5rem",
                            borderRadius: "var(--radius-s)",
                            fontSize: "var(--font-size-xs)",
                            textTransform: "uppercase",
                            letterSpacing: "0.04em",
                            fontWeight: 600,
                            color: active
                              ? "var(--neutral-on-background-strong)"
                              : "var(--neutral-on-background-weak)",
                          }}
                        >
                          {c.label}
                          <span aria-hidden="true" style={{ width: "1ch", display: "inline-block" }}>
                            {active ? (sortDir === "asc" ? "▲" : "▼") : "↕"}
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
                    <td colSpan={columns.length} style={{ ...tdStyle, textAlign: "center", padding: "3rem 1rem" }}>
                      <Column gap="8" horizontal="center">
                        <Text variant="heading-strong-m">No invoices found</Text>
                        <Text variant="body-default-s" onBackground="neutral-weak">
                          Try widening the date range or clearing the search.
                        </Text>
                      </Column>
                    </td>
                  </tr>
                ) : (
                  rows.map((o) => (
                    <tr key={o.id}>
                      <td style={{ ...tdStyle, fontFamily: "var(--font-code)", whiteSpace: "nowrap" }}>{o.id}</td>
                      <td style={tdStyle}>
                        <div style={{ fontWeight: 600 }}>{o.customer}</div>
                        <div style={{ color: "var(--neutral-on-background-weak)", fontSize: "var(--font-size-xs)" }}>
                          {o.company}
                        </div>
                      </td>
                      <td style={{ ...tdStyle, whiteSpace: "nowrap" }}>
                        <time dateTime={o.date}>{formatDate(o.date)}</time>
                      </td>
                      <td style={tdStyle}>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "0.125rem 0.625rem",
                            borderRadius: "999px",
                            fontSize: "var(--font-size-xs)",
                            fontWeight: 600,
                            background: STATUS_COLORS[o.status].bg,
                            color: STATUS_COLORS[o.status].fg,
                          }}
                        >
                          {o.status}
                        </span>
                      </td>
                      <td
                        style={{
                          ...tdStyle,
                          textAlign: "right",
                          fontVariantNumeric: "tabular-nums",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {currency.format(o.amount)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Column>

        <nav aria-label="Pagination">
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "1rem",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Text as="span" variant="body-default-s" onBackground="neutral-weak">
                  Rows per page
                </Text>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setPage(1);
                  }}
                  style={{ ...controlStyle, height: "2.25rem" }}
                >
                  {PAGE_SIZES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </label>
              <Text variant="body-default-s" onBackground="neutral-weak" aria-live="polite">
                {sorted.length === 0
                  ? "0 results"
                  : `${startIdx + 1}–${Math.min(startIdx + pageSize, sorted.length)} of ${sorted.length}`}
              </Text>
            </div>

            <Row gap="4" vertical="center" wrap>
              <Button
                variant="tertiary"
                size="s"
                label="Previous"
                prefixIcon="chevronLeft"
                disabled={currentPage <= 1}
                onClick={() => setPage(currentPage - 1)}
              />
              {pageButtons.map((p) => (
                <Button
                  key={p}
                  variant={p === currentPage ? "primary" : "tertiary"}
                  size="s"
                  label={String(p)}
                  aria-label={`Page ${p}`}
                  aria-current={p === currentPage ? "page" : undefined}
                  onClick={() => setPage(p)}
                />
              ))}
              <Button
                variant="tertiary"
                size="s"
                label="Next"
                suffixIcon="chevronRight"
                disabled={currentPage >= pageCount}
                onClick={() => setPage(currentPage + 1)}
              />
            </Row>
          </div>
        </nav>
      </Column>
    </Column>
  );
}
```