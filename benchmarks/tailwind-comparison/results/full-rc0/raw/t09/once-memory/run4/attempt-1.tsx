"use client";

import { useMemo, useState } from "react";
import type { ChangeEvent } from "react";
import {
  Badge,
  Button,
  Column,
  Heading,
  Input,
  Row,
  Text,
} from "@once-ui-system/core";

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

const STATUS_FILTERS: { value: string; label: string }[] = [
  { value: "All", label: "All" },
  { value: "Paid", label: "Paid" },
  { value: "Pending", label: "Pending" },
  { value: "Overdue", label: "Overdue" },
  { value: "Refunded", label: "Refunded" },
];

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

const dateInputStyle: React.CSSProperties = {
  height: "3rem",
  padding: "0 0.75rem",
  borderRadius: "var(--radius-m)",
  border: "1px solid var(--neutral-alpha-medium)",
  background: "var(--surface-background)",
  color: "var(--neutral-on-background-strong)",
  font: "inherit",
  fontSize: "0.875rem",
  minWidth: 0,
  width: "100%",
};

const selectStyle: React.CSSProperties = {
  ...dateInputStyle,
  width: "auto",
  height: "2.25rem",
  padding: "0 0.5rem",
};

const labelStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "0.25rem",
  flex: "1 1 9rem",
  minWidth: 0,
};

interface SegmentedProps {
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}

function Segmented({ label, options, value, onChange }: SegmentedProps) {
  return (
    <div
      role="group"
      aria-label={label}
      style={{
        display: "inline-flex",
        flexWrap: "wrap",
        gap: "0.25rem",
        padding: "0.25rem",
        borderRadius: "var(--radius-l)",
        border: "1px solid var(--neutral-alpha-medium)",
        background: "var(--neutral-alpha-weak)",
        maxWidth: "100%",
      }}
    >
      {options.map((opt) => {
        const selected = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(opt.value)}
            style={{
              cursor: "pointer",
              border: "none",
              font: "inherit",
              fontSize: "0.875rem",
              fontWeight: 600,
              padding: "0.375rem 0.875rem",
              minHeight: "2rem",
              borderRadius: "var(--radius-m)",
              background: selected ? "var(--brand-solid-strong)" : "transparent",
              color: selected
                ? "var(--brand-on-solid-strong)"
                : "var(--neutral-on-background-medium)",
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
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

  const hasFilters = status !== "All" || query !== "" || from !== "" || to !== "";

  const pageButtons: number[] = [];
  const windowStart = Math.max(1, Math.min(currentPage - 1, pageCount - 2));
  for (let p = windowStart; p <= Math.min(pageCount, windowStart + 2); p++) pageButtons.push(p);

  return (
    <Column
      as="main"
      fillWidth
      horizontal="center"
      paddingX="16"
      paddingY="32"
      gap="24"
    >
      <Column fillWidth gap="24" style={{ maxWidth: "72rem" }}>
        <Column gap="8">
          <Row gap="12" vertical="center" wrap>
            <Heading as="h1" variant="display-strong-xs">
              Invoices
            </Heading>
            <Badge title={`${filtered.length} results`} />
          </Row>
          <Text variant="body-default-m" onBackground="neutral-weak">
            Track billing across customers. Sort by any column, narrow results with filters, and
            page through the list.
          </Text>
        </Column>

        <Column
          fillWidth
          gap="16"
          padding="16"
          radius="l"
          border="neutral-alpha-medium"
          background="surface"
          role="search"
          aria-label="Invoice filters"
        >
          <Row fillWidth gap="16" wrap vertical="end">
            <div style={{ flex: "2 1 14rem", minWidth: 0 }}>
              <Input
                id="invoice-search"
                label="Search invoices"
                placeholder="Invoice, customer or company"
                value={query}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  setQuery(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <label style={labelStyle} htmlFor="date-from">
              <Text variant="label-default-s" onBackground="neutral-weak">
                Issued from
              </Text>
              <input
                id="date-from"
                type="date"
                value={from}
                max={to || undefined}
                style={dateInputStyle}
                aria-invalid={rangeInvalid}
                onChange={(e) => {
                  setFrom(e.target.value);
                  setPage(1);
                }}
              />
            </label>
            <label style={labelStyle} htmlFor="date-to">
              <Text variant="label-default-s" onBackground="neutral-weak">
                Issued to
              </Text>
              <input
                id="date-to"
                type="date"
                value={to}
                min={from || undefined}
                style={dateInputStyle}
                aria-invalid={rangeInvalid}
                onChange={(e) => {
                  setTo(e.target.value);
                  setPage(1);
                }}
              />
            </label>
          </Row>

          <Row fillWidth gap="16" wrap vertical="center" horizontal="between">
            <Segmented
              label="Filter by status"
              options={STATUS_FILTERS}
              value={status}
              onChange={(value) => {
                setStatus(value);
                setPage(1);
              }}
            />
            <Button
              variant="tertiary"
              size="s"
              onClick={clearFilters}
              disabled={!hasFilters}
            >
              Clear filters
            </Button>
          </Row>
          {rangeInvalid && (
            <Text variant="body-default-s" onBackground="danger-strong" role="alert">
              The start date must be on or before the end date.
            </Text>
          )}
        </Column>

        <Column
          fillWidth
          radius="l"
          border="neutral-alpha-medium"
          background="surface"
          overflow="hidden"
        >
          <div style={{ overflowX: "auto" }} tabIndex={0} role="region" aria-label="Invoices table">
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                minWidth: "40rem",
                fontSize: "0.9375rem",
              }}
            >
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
                Invoices, sorted by {COLUMNS.find((c) => c.key === sortKey)?.label}{" "}
                {sortDir === "asc" ? "ascending" : "descending"}
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
                            all: "unset",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.375rem",
                            padding: "0.5rem 0.5rem",
                            borderRadius: "var(--radius-s)",
                            fontWeight: 600,
                            fontSize: "0.8125rem",
                            color: active
                              ? "var(--neutral-on-background-strong)"
                              : "var(--neutral-on-background-medium)",
                            outlineOffset: 2,
                          }}
                          onFocus={(e) => {
                            e.currentTarget.style.outline = "2px solid var(--brand-solid-strong)";
                          }}
                          onBlur={(e) => {
                            e.currentTarget.style.outline = "none";
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
                    <td colSpan={COLUMNS.length} style={{ padding: "3rem 1rem", textAlign: "center" }}>
                      <Column gap="8" horizontal="center">
                        <Text variant="heading-strong-m">No invoices match</Text>
                        <Text variant="body-default-s" onBackground="neutral-weak">
                          Try a different search term, status or date range.
                        </Text>
                        <Button variant="secondary" size="s" onClick={clearFilters}>
                          Reset filters
                        </Button>
                      </Column>
                    </td>
                  </tr>
                ) : (
                  rows.map((inv) => (
                    <tr
                      key={inv.id}
                      style={{ borderTop: "1px solid var(--neutral-alpha-weak)" }}
                    >
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
                        <div
                          style={{
                            fontSize: "0.8125rem",
                            color: "var(--neutral-on-background-weak)",
                          }}
                        >
                          {inv.company}
                        </div>
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
                  <tr style={{ borderTop: "1px solid var(--neutral-alpha-medium)" }}>
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

          <Row
            fillWidth
            padding="12"
            gap="12"
            wrap
            vertical="center"
            horizontal="between"
            style={{ borderTop: "1px solid var(--neutral-alpha-weak)" }}
          >
            <Row gap="12" vertical="center" wrap>
              <Text variant="body-default-s" onBackground="neutral-weak" aria-live="polite">
                {sorted.length === 0
                  ? "0 results"
                  : `Showing ${startIdx + 1}–${Math.min(startIdx + pageSize, sorted.length)} of ${sorted.length}`}
              </Text>
              <label
                htmlFor="page-size"
                style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
              >
                <Text variant="body-default-s" onBackground="neutral-weak">
                  Rows per page
                </Text>
                <select
                  id="page-size"
                  value={pageSize}
                  style={selectStyle}
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
            </Row>

            <nav aria-label="Pagination">
              <Row gap="4" vertical="center">
                <Button
                  variant="tertiary"
                  size="s"
                  disabled={currentPage <= 1}
                  onClick={() => setPage(currentPage - 1)}
                  aria-label="Previous page"
                >
                  Prev
                </Button>
                {pageButtons.map((p) => (
                  <Button
                    key={p}
                    variant={p === currentPage ? "primary" : "tertiary"}
                    size="s"
                    onClick={() => setPage(p)}
                    aria-label={`Page ${p}`}
                    aria-current={p === currentPage ? "page" : undefined}
                  >
                    {String(p)}
                  </Button>
                ))}
                <Button
                  variant="tertiary"
                  size="s"
                  disabled={currentPage >= pageCount}
                  onClick={() => setPage(currentPage + 1)}
                  aria-label="Next page"
                >
                  Next
                </Button>
              </Row>
            </nav>
          </Row>
        </Column>
      </Column>
    </Column>
  );
}
