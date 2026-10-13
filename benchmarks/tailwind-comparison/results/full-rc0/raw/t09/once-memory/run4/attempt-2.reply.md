Nothing else is available, so I'll go with the defensive rewrite. It uses native elements for everything that carries ARIA or custom props, and keeps Once UI for layout and typography only. It also drops `all: "unset"` and the event-handler style mutations.

```tsx
"use client";

import { useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { Column, Flex, Heading, Text } from "@once-ui-system/core";

type Status = "Paid" | "Pending" | "Overdue" | "Refunded";

interface Invoice {
  id: string;
  customer: string;
  company: string;
  amount: number;
  status: Status;
  date: string; // ISO yyyy-mm-dd
}

type SortKey = "id" | "customer" | "amount" | "status" | "date";
type SortDir = "asc" | "desc";

const INVOICES: Invoice[] = [
  { id: "INV-2041", customer: "Amara Okafor", company: "Northwind Logistics", amount: 4820.5, status: "Paid", date: "2025-01-06" },
  { id: "INV-2042", customer: "Lucas Meyer", company: "Brightside Studio", amount: 1260, status: "Pending", date: "2025-01-09" },
  { id: "INV-2043", customer: "Priya Raman", company: "Cobalt Analytics", amount: 9300, status: "Paid", date: "2025-01-12" },
  { id: "INV-2044", customer: "Tomás Herrera", company: "Solana Foods", amount: 745.25, status: "Overdue", date: "2025-01-15" },
  { id: "INV-2045", customer: "Hannah Lindqvist", company: "Fjord Outfitters", amount: 2150, status: "Paid", date: "2025-01-18" },
  { id: "INV-2046", customer: "Kenji Watanabe", company: "Sakura Robotics", amount: 15800, status: "Pending", date: "2025-01-21" },
  { id: "INV-2047", customer: "Isabelle Moreau", company: "Atelier Moreau", amount: 389.99, status: "Refunded", date: "2025-01-24" },
  { id: "INV-2048", customer: "Declan O'Brien", company: "Emerald Freight", amount: 6720, status: "Paid", date: "2025-01-27" },
  { id: "INV-2049", customer: "Fatima Al-Sayed", company: "Oasis Hospitality", amount: 3340, status: "Overdue", date: "2025-02-01" },
  { id: "INV-2050", customer: "Marcus Johnson", company: "Ridgeline Fitness", amount: 1875.75, status: "Paid", date: "2025-02-03" },
  { id: "INV-2051", customer: "Sofia Rossi", company: "Trattoria Group", amount: 5210, status: "Pending", date: "2025-02-06" },
  { id: "INV-2052", customer: "Viktor Novak", company: "Praga Engineering", amount: 12450, status: "Paid", date: "2025-02-09" },
  { id: "INV-2053", customer: "Chloe Bennett", company: "Harbor Coffee Co.", amount: 614.4, status: "Paid", date: "2025-02-12" },
  { id: "INV-2054", customer: "Rahul Mehta", company: "Lotus Software", amount: 8900, status: "Overdue", date: "2025-02-14" },
  { id: "INV-2055", customer: "Elena Petrova", company: "Baikal Textiles", amount: 2780, status: "Pending", date: "2025-02-17" },
  { id: "INV-2056", customer: "James Carter", company: "Summit Roofing", amount: 4100, status: "Paid", date: "2025-02-20" },
  { id: "INV-2057", customer: "Noor Hassan", company: "Crescent Pharma", amount: 19250, status: "Pending", date: "2025-02-23" },
  { id: "INV-2058", customer: "Oliver Schmidt", company: "Alpenglow Travel", amount: 930, status: "Refunded", date: "2025-02-26" },
  { id: "INV-2059", customer: "Mei Lin", company: "Jade Interiors", amount: 3665.8, status: "Paid", date: "2025-03-02" },
  { id: "INV-2060", customer: "Gabriel Costa", company: "Verde Energia", amount: 7480, status: "Overdue", date: "2025-03-05" },
  { id: "INV-2061", customer: "Aisha Khan", company: "Pinnacle Legal", amount: 2290, status: "Paid", date: "2025-03-08" },
  { id: "INV-2062", customer: "Henrik Berg", company: "Nordlys Design", amount: 1540, status: "Pending", date: "2025-03-11" },
  { id: "INV-2063", customer: "Camila Torres", company: "Andes Coffee Traders", amount: 5980, status: "Paid", date: "2025-03-14" },
  { id: "INV-2064", customer: "Yusuf Demir", company: "Bosphorus Imports", amount: 10720, status: "Paid", date: "2025-03-17" },
  { id: "INV-2065", customer: "Grace Nguyen", company: "Lantern Education", amount: 845, status: "Overdue", date: "2025-03-20" },
  { id: "INV-2066", customer: "Anders Holm", company: "Kronborg Marine", amount: 13300, status: "Pending", date: "2025-03-23" },
  { id: "INV-2067", customer: "Zara Ahmed", company: "Meridian Health", amount: 4415, status: "Paid", date: "2025-03-26" },
  { id: "INV-2068", customer: "Pablo Ruiz", company: "Mesa Ceramics", amount: 1190, status: "Refunded", date: "2025-03-29" },
];

const PAGE_SIZES = [5, 10, 15];

const STATUS_FILTERS: string[] = ["All", "Paid", "Pending", "Overdue", "Refunded"];

const COLUMNS: { key: SortKey; label: string; numeric?: boolean }[] = [
  { key: "id", label: "Invoice" },
  { key: "customer", label: "Customer" },
  { key: "status", label: "Status" },
  { key: "date", label: "Issued" },
  { key: "amount", label: "Amount", numeric: true },
];

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

const STATUS_COLOR: Record<Status, string> = {
  Paid: "var(--success-on-background-strong)",
  Pending: "var(--warning-on-background-strong)",
  Overdue: "var(--danger-on-background-strong)",
  Refunded: "var(--neutral-on-background-medium)",
};

const STATUS_BG: Record<Status, string> = {
  Paid: "var(--success-alpha-weak)",
  Pending: "var(--warning-alpha-weak)",
  Overdue: "var(--danger-alpha-weak)",
  Refunded: "var(--neutral-alpha-weak)",
};

const BORDER = "1px solid var(--neutral-alpha-medium)";
const BORDER_WEAK = "1px solid var(--neutral-alpha-weak)";
const TEXT_STRONG = "var(--neutral-on-background-strong)";
const TEXT_MEDIUM = "var(--neutral-on-background-medium)";
const TEXT_WEAK = "var(--neutral-on-background-weak)";

const fieldStyle: CSSProperties = {
  height: "2.75rem",
  padding: "0 0.75rem",
  borderRadius: "0.75rem",
  border: BORDER,
  background: "var(--surface-background)",
  color: TEXT_STRONG,
  fontFamily: "inherit",
  fontSize: "0.875rem",
  minWidth: 0,
  width: "100%",
  boxSizing: "border-box",
};

const fieldWrapStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "0.25rem",
  flex: "1 1 10rem",
  minWidth: 0,
};

const fieldLabelStyle: CSSProperties = {
  fontSize: "0.75rem",
  fontWeight: 600,
  color: TEXT_MEDIUM,
};

const srOnly: CSSProperties = {
  position: "absolute",
  width: 1,
  height: 1,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  whiteSpace: "nowrap",
};

function pillButtonStyle(active: boolean, disabled = false): CSSProperties {
  return {
    cursor: disabled ? "not-allowed" : "pointer",
    border: active ? "1px solid transparent" : BORDER,
    fontFamily: "inherit",
    fontSize: "0.875rem",
    fontWeight: 600,
    padding: "0 0.75rem",
    minHeight: "2.25rem",
    minWidth: "2.25rem",
    borderRadius: "0.625rem",
    background: active ? "var(--brand-solid-strong)" : "var(--surface-background)",
    color: active ? "var(--brand-on-solid-strong)" : TEXT_STRONG,
    opacity: disabled ? 0.45 : 1,
  };
}

export default function Page() {
  const [status, setStatus] = useState<string>("All");
  const [query, setQuery] = useState<string>("");
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(5);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return INVOICES.filter((inv) => {
      if (status !== "All" && inv.status !== status) return false;
      if (from && inv.date < from) return false;
      if (to && inv.date > to) return false;
      if (q) {
        const hay = `${inv.id} ${inv.customer} ${inv.company}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [status, query, from, to]);

  const sorted = useMemo(() => {
    const dir = sortDir === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      let cmp: number;
      if (sortKey === "amount") cmp = a.amount - b.amount;
      else cmp = a[sortKey].localeCompare(b[sortKey]);
      return cmp * dir;
    });
  }, [filtered, sortKey, sortDir]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const startIdx = (currentPage - 1) * pageSize;
  const rows = sorted.slice(startIdx, startIdx + pageSize);
  const total = filtered.reduce((sum, inv) => sum + inv.amount, 0);
  const rangeInvalid = Boolean(from && to && from > to);
  const hasFilters = status !== "All" || query !== "" || from !== "" || to !== "";

  const toggleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "amount" || key === "date" ? "desc" : "asc");
    }
    setPage(1);
  };

  const clearFilters = () => {
    setStatus("All");
    setQuery("");
    setFrom("");
    setTo("");
    setPage(1);
  };

  const pageButtons: number[] = [];
  const windowStart = Math.max(1, Math.min(currentPage - 1, pageCount - 2));
  for (let p = windowStart; p <= Math.min(pageCount, windowStart + 2); p++) pageButtons.push(p);

  const sortLabel = COLUMNS.find((c) => c.key === sortKey)?.label ?? "";

  return (
    <main
      style={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
        padding: "2rem 1rem",
        boxSizing: "border-box",
      }}
    >
      <Column fillWidth gap="24" style={{ maxWidth: "72rem" }}>
        <Column gap="8">
          <Flex gap="12" vertical="center" wrap>
            <Heading as="h1" variant="display-strong-xs">
              Invoices
            </Heading>
            <span
              style={{
                padding: "0.125rem 0.625rem",
                borderRadius: "999px",
                fontSize: "0.75rem",
                fontWeight: 600,
                background: "var(--neutral-alpha-weak)",
                color: TEXT_MEDIUM,
              }}
            >
              {filtered.length} results
            </span>
          </Flex>
          <Text variant="body-default-m" onBackground="neutral-weak">
            Track billing across customers. Sort by any column, narrow results with filters, and
            page through the list.
          </Text>
        </Column>

        <section
          aria-label="Invoice filters"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            padding: "1rem",
            borderRadius: "1rem",
            border: BORDER,
            background: "var(--surface-background)",
          }}
        >
          <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", alignItems: "flex-end" }}>
            <div style={{ ...fieldWrapStyle, flex: "2 1 14rem" }}>
              <label htmlFor="invoice-search" style={fieldLabelStyle}>
                Search invoices
              </label>
              <input
                id="invoice-search"
                type="search"
                placeholder="Invoice, customer or company"
                value={query}
                style={fieldStyle}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <div style={fieldWrapStyle}>
              <label htmlFor="date-from" style={fieldLabelStyle}>
                Issued from
              </label>
              <input
                id="date-from"
                type="date"
                value={from}
                max={to || undefined}
                style={fieldStyle}
                aria-invalid={rangeInvalid}
                onChange={(e) => {
                  setFrom(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <div style={fieldWrapStyle}>
              <label htmlFor="date-to" style={fieldLabelStyle}>
                Issued to
              </label>
              <input
                id="date-to"
                type="date"
                value={to}
                min={from || undefined}
                style={fieldStyle}
                aria-invalid={rangeInvalid}
                onChange={(e) => {
                  setTo(e.target.value);
                  setPage(1);
                }}
              />
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "1rem",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div
              role="group"
              aria-label="Filter by status"
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "0.25rem",
                padding: "0.25rem",
                borderRadius: "0.875rem",
                border: BORDER,
                background: "var(--neutral-alpha-weak)",
                maxWidth: "100%",
              }}
            >
              {STATUS_FILTERS.map((opt) => {
                const selected = opt === status;
                return (
                  <button
                    key={opt}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => {
                      setStatus(opt);
                      setPage(1);
                    }}
                    style={{
                      cursor: "pointer",
                      border: "none",
                      fontFamily: "inherit",
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      padding: "0.375rem 0.875rem",
                      minHeight: "2rem",
                      borderRadius: "0.625rem",
                      background: selected ? "var(--brand-solid-strong)" : "transparent",
                      color: selected ? "var(--brand-on-solid-strong)" : TEXT_MEDIUM,
                    }}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              onClick={clearFilters}
              disabled={!hasFilters}
              style={pillButtonStyle(false, !hasFilters)}
            >
              Clear filters
            </button>
          </div>
          {rangeInvalid && (
            <p role="alert" style={{ margin: 0, fontSize: "0.875rem", color: "var(--danger-on-background-strong)" }}>
              The start date must be on or before the end date.
            </p>
          )}
        </section>

        <section
          aria-label="Invoice results"
          style={{
            borderRadius: "1rem",
            border: BORDER,
            background: "var(--surface-background)",
            overflow: "hidden",
          }}
        >
          <div style={{ overflowX: "auto" }} tabIndex={0} role="region" aria-label="Invoices table">
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                minWidth: "40rem",
                fontSize: "0.9375rem",
                color: TEXT_STRONG,
              }}
            >
              <caption style={srOnly}>
                Invoices, sorted by {sortLabel} {sortDir === "asc" ? "ascending" : "descending"}
              </caption>
              <thead>
                <tr style={{ background: "var(--neutral-alpha-weak)" }}>
                  {COLUMNS.map((col) => {
                    const active = sortKey === col.key;
                    return (
                      <th
                        key={col.key}
                        scope="col"
                        aria-sort={
                          active ? (sortDir === "asc" ? "ascending" : "descending") : "none"
                        }
                        style={{
                          textAlign: col.numeric ? "right" : "left",
                          padding: "0.25rem 0.5rem",
                          whiteSpace: "nowrap",
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => toggleSort(col.key)}
                          style={{
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.375rem",
                            padding: "0.5rem",
                            minHeight: "2.25rem",
                            border: "none",
                            background: "transparent",
                            borderRadius: "0.5rem",
                            fontFamily: "inherit",
                            fontWeight: 600,
                            fontSize: "0.8125rem",
                            color: active ? TEXT_STRONG : TEXT_MEDIUM,
                          }}
                        >
                          {col.label}
                          <span aria-hidden="true" style={{ opacity: active ? 1 : 0.4 }}>
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
                    <td
                      colSpan={COLUMNS.length}
                      style={{ padding: "3rem 1rem", textAlign: "center" }}
                    >
                      <p style={{ margin: "0 0 0.25rem", fontWeight: 600, fontSize: "1.125rem" }}>
                        No invoices match
                      </p>
                      <p style={{ margin: "0 0 1rem", color: TEXT_WEAK, fontSize: "0.875rem" }}>
                        Try a different search term, status or date range.
                      </p>
                      <button type="button" onClick={clearFilters} style={pillButtonStyle(false)}>
                        Reset filters
                      </button>
                    </td>
                  </tr>
                ) : (
                  rows.map((inv) => (
                    <tr key={inv.id} style={{ borderTop: BORDER_WEAK }}>
                      <th
                        scope="row"
                        style={{
                          textAlign: "left",
                          padding: "0.875rem 1rem",
                          fontWeight: 600,
                          fontFamily: "var(--font-code)",
                          fontSize: "0.8125rem",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {inv.id}
                      </th>
                      <td style={{ padding: "0.875rem 1rem" }}>
                        <div style={{ fontWeight: 500 }}>{inv.customer}</div>
                        <div style={{ fontSize: "0.8125rem", color: TEXT_WEAK }}>{inv.company}</div>
                      </td>
                      <td style={{ padding: "0.875rem 1rem" }}>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "0.125rem 0.625rem",
                            borderRadius: "999px",
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            color: STATUS_COLOR[inv.status],
                            background: STATUS_BG[inv.status],
                          }}
                        >
                          {inv.status}
                        </span>
                      </td>
                      <td style={{ padding: "0.875rem 1rem", whiteSpace: "nowrap" }}>
                        <time dateTime={inv.date}>{formatDate(inv.date)}</time>
                      </td>
                      <td
                        style={{
                          padding: "0.875rem 1rem",
                          textAlign: "right",
                          fontVariantNumeric: "tabular-nums",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {currency.format(inv.amount)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              {rows.length > 0 && (
                <tfoot>
                  <tr style={{ borderTop: BORDER }}>
                    <th
                      scope="row"
                      colSpan={4}
                      style={{ textAlign: "left", padding: "0.875rem 1rem", fontWeight: 600 }}
                    >
                      Total for {filtered.length} matching invoice{filtered.length === 1 ? "" : "s"}
                    </th>
                    <td
                      style={{
                        padding: "0.875rem 1rem",
                        textAlign: "right",
                        fontWeight: 600,
                        fontVariantNumeric: "tabular-nums",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {currency.format(total)}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "0.75rem",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0.75rem 1rem",
              borderTop: BORDER_WEAK,
            }}
          >
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", alignItems: "center" }}>
              <span aria-live="polite" style={{ fontSize: "0.875rem", color: TEXT_MEDIUM }}>
                {sorted.length === 0
                  ? "0 results"
                  : `Showing ${startIdx + 1}–${Math.min(startIdx + pageSize, sorted.length)} of ${sorted.length}`}
              </span>
              <label
                htmlFor="page-size"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  fontSize: "0.875rem",
                  color: TEXT_MEDIUM,
                }}
              >
                Rows per page
                <select
                  id="page-size"
                  value={pageSize}
                  style={{ ...fieldStyle, width: "auto", height: "2.25rem", padding: "0 0.5rem" }}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setPage(1);
                  }}
                >
                  {PAGE_SIZES.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <nav aria-label="Pagination">
              <div style={{ display: "flex", gap: "0.25rem", alignItems: "center" }}>
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setPage(currentPage - 1)}
                  aria-label="Previous page"
                  style={pillButtonStyle(false, currentPage <= 1)}
                >
                  Prev
                </button>
                {pageButtons.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPage(p)}
                    aria-label={`Page ${p}`}
                    aria-current={p === currentPage ? "page" : undefined}
                    style={pillButtonStyle(p === currentPage)}
                  >
                    {p}
                  </button>
                ))}
                <button
                  type="button"
                  disabled={currentPage >= pageCount}
                  onClick={() => setPage(currentPage + 1)}
                  aria-label="Next page"
                  style={pillButtonStyle(false, currentPage >= pageCount)}
                >
                  Next
                </button>
              </div>
            </nav>
          </div>
        </section>
      </Column>
    </main>
  );
}
```