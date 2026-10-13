The errors show that `SegmentedControl` has no `selected` prop and that `onToggle` receives an event rather than a value. I can't inspect the package types, so I'm replacing it with a native accessible segmented control built from buttons with `aria-pressed`, which doesn't depend on the library's API.

```tsx
"use client";

import { useMemo, useState, useId } from "react";
import type { CSSProperties } from "react";
import { Column, Row, Heading, Text, Button } from "@once-ui-system/core";

type Status = "Paid" | "Pending" | "Overdue" | "Refunded";
type StatusFilter = "all" | Status;

interface Invoice {
  id: string;
  customer: string;
  email: string;
  plan: string;
  amount: number;
  status: Status;
  date: string; // ISO yyyy-mm-dd
}

const CUSTOMERS: Array<[string, string, string]> = [
  ["Marta Kowalski", "marta@northwind.example", "Team"],
  ["Devon Okafor", "devon@brightlabs.example", "Business"],
  ["Priya Raman", "priya@lumenworks.example", "Starter"],
  ["Lucas Ferreira", "lucas@oakandpine.example", "Team"],
  ["Hannah Berg", "hannah@fjordstudio.example", "Enterprise"],
  ["Tomás Herrera", "tomas@solaris.example", "Business"],
  ["Aiko Tanaka", "aiko@kitebridge.example", "Starter"],
  ["Samuel Reyes", "samuel@harborpoint.example", "Team"],
  ["Imogen Clarke", "imogen@copperkettle.example", "Business"],
  ["Yusuf Demir", "yusuf@bluepeak.example", "Enterprise"],
  ["Chloe Martin", "chloe@wildroot.example", "Starter"],
  ["Nikolai Petrov", "nikolai@greystone.example", "Team"],
];

const STATUSES: Status[] = ["Paid", "Paid", "Pending", "Paid", "Overdue", "Paid", "Refunded", "Pending"];

const INVOICES: Invoice[] = Array.from({ length: 48 }, (_, i) => {
  const [customer, email, plan] = CUSTOMERS[(i * 5 + 3) % CUSTOMERS.length];
  const day = new Date(Date.UTC(2025, 4, 30));
  day.setUTCDate(day.getUTCDate() - i * 3 - (i % 4));
  const base = plan === "Enterprise" ? 1890 : plan === "Business" ? 640 : plan === "Team" ? 249 : 49;
  return {
    id: `INV-${String(2048 - i).padStart(4, "0")}`,
    customer,
    email,
    plan,
    amount: base + ((i * 37) % 11) * (base > 200 ? 12 : 3),
    status: STATUSES[(i * 3 + (i % 5)) % STATUSES.length],
    date: day.toISOString().slice(0, 10),
  };
});

type SortKey = "id" | "customer" | "plan" | "amount" | "status" | "date";
type SortDir = "asc" | "desc";

const COLUMNS: Array<{ key: SortKey; label: string; numeric?: boolean }> = [
  { key: "id", label: "Invoice" },
  { key: "customer", label: "Customer" },
  { key: "plan", label: "Plan" },
  { key: "status", label: "Status" },
  { key: "date", label: "Date" },
  { key: "amount", label: "Amount", numeric: true },
];

const STATUS_OPTIONS: Array<{ value: StatusFilter; label: string }> = [
  { value: "all", label: "All" },
  { value: "Paid", label: "Paid" },
  { value: "Pending", label: "Pending" },
  { value: "Overdue", label: "Overdue" },
  { value: "Refunded", label: "Refunded" },
];

const PAGE_SIZES = [5, 10, 20];

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

const STATUS_COLORS: Record<Status, { fg: string; bg: string }> = {
  Paid: { fg: "var(--success-on-background-strong)", bg: "var(--success-alpha-weak)" },
  Pending: { fg: "var(--warning-on-background-strong)", bg: "var(--warning-alpha-weak)" },
  Overdue: { fg: "var(--danger-on-background-strong)", bg: "var(--danger-alpha-weak)" },
  Refunded: { fg: "var(--neutral-on-background-strong)", bg: "var(--neutral-alpha-medium)" },
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
  width: "100%",
};

const thButtonStyle: CSSProperties = {
  all: "unset",
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  gap: "0.375rem",
  padding: "0.25rem 0.25rem",
  borderRadius: "0.25rem",
  fontWeight: 600,
  fontSize: "0.8125rem",
  color: "var(--neutral-on-background-strong)",
  whiteSpace: "nowrap",
};

const cellStyle: CSSProperties = {
  padding: "0.875rem 1rem",
  borderBottom: "1px solid var(--neutral-alpha-weak)",
  fontSize: "0.875rem",
  color: "var(--neutral-on-background-strong)",
  verticalAlign: "middle",
};

const segmentGroupStyle: CSSProperties = {
  display: "inline-flex",
  padding: "0.25rem",
  gap: "0.125rem",
  borderRadius: "var(--radius-l, 0.75rem)",
  border: "1px solid var(--neutral-alpha-medium)",
  background: "var(--neutral-alpha-weak)",
};

function segmentStyle(active: boolean): CSSProperties {
  return {
    all: "unset",
    cursor: "pointer",
    boxSizing: "border-box",
    padding: "0.375rem 0.875rem",
    minHeight: "1.75rem",
    display: "inline-flex",
    alignItems: "center",
    borderRadius: "var(--radius-m, 0.5rem)",
    fontSize: "0.8125rem",
    fontWeight: 600,
    whiteSpace: "nowrap",
    color: active ? "var(--neutral-on-background-strong)" : "var(--neutral-on-background-weak)",
    background: active ? "var(--surface-background, var(--page-background))" : "transparent",
    boxShadow: active ? "0 0 0 1px var(--neutral-alpha-medium)" : "none",
  };
}

export default function Page() {
  const uid = useId();
  const [status, setStatus] = useState<StatusFilter>("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return INVOICES.filter((inv) => {
      if (status !== "all" && inv.status !== status) return false;
      if (from && inv.date < from) return false;
      if (to && inv.date > to) return false;
      if (q) {
        const hay = `${inv.id} ${inv.customer} ${inv.email} ${inv.plan}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [status, from, to, query]);

  const sorted = useMemo(() => {
    const dir = sortDir === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === "number" && typeof bv === "number") return (av - bv) * dir;
      return String(av).localeCompare(String(bv)) * dir;
    });
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIdx = (currentPage - 1) * pageSize;
  const rows = sorted.slice(startIdx, startIdx + pageSize);
  const total = useMemo(() => filtered.reduce((sum, inv) => sum + inv.amount, 0), [filtered]);

  const hasFilters = status !== "all" || from !== "" || to !== "" || query !== "";
  const dateInvalid = from !== "" && to !== "" && from > to;

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
    setStatus("all");
    setFrom("");
    setTo("");
    setQuery("");
    setPage(1);
  }

  const pageNumbers = useMemo(() => {
    const pages: Array<number | "gap-l" | "gap-r"> = [];
    for (let p = 1; p <= totalPages; p++) {
      if (p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1) {
        pages.push(p);
      } else if (p < currentPage && pages[pages.length - 1] !== "gap-l") {
        pages.push("gap-l");
      } else if (p > currentPage && pages[pages.length - 1] !== "gap-r") {
        pages.push("gap-r");
      }
    }
    return pages;
  }, [totalPages, currentPage]);

  const searchId = `${uid}-search`;
  const fromId = `${uid}-from`;
  const toId = `${uid}-to`;
  const sizeId = `${uid}-size`;
  const statusLabelId = `${uid}-status-label`;

  return (
    <Column
      as="main"
      fillWidth
      horizontal="center"
      paddingX="16"
      paddingY="32"
      style={{ minHeight: "100vh" }}
    >
      <Column fillWidth gap="24" style={{ maxWidth: "72rem" }}>
        <Column gap="8">
          <Heading as="h1" variant="display-strong-xs">
            Invoices
          </Heading>
          <Text variant="body-default-m" onBackground="neutral-weak">
            Track billing activity across every customer account. Sort columns, narrow by status
            or date, and search by name, email or invoice number.
          </Text>
        </Column>

        <Column
          as="section"
          aria-label="Filters"
          gap="16"
          padding="16"
          radius="l"
          border="neutral-alpha-weak"
          background="surface"
        >
          <Row fillWidth gap="16" wrap vertical="end">
            <Column gap="8" style={{ flex: "1 1 100%", minWidth: 0 }}>
              <Text as="span" variant="label-default-s" onBackground="neutral-weak" id={statusLabelId}>
                Status
              </Text>
              <div style={{ overflowX: "auto", maxWidth: "100%" }}>
                <div role="group" aria-labelledby={statusLabelId} style={segmentGroupStyle}>
                  {STATUS_OPTIONS.map((opt) => {
                    const active = opt.value === status;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        aria-pressed={active}
                        onClick={() => {
                          setStatus(opt.value);
                          setPage(1);
                        }}
                        style={segmentStyle(active)}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </Column>

            <Column gap="8" style={{ flex: "1 1 9rem", minWidth: 0 }}>
              <label htmlFor={fromId}>
                <Text as="span" variant="label-default-s" onBackground="neutral-weak">
                  From
                </Text>
              </label>
              <input
                id={fromId}
                type="date"
                value={from}
                max={to || undefined}
                onChange={(e) => {
                  setFrom(e.target.value);
                  setPage(1);
                }}
                style={inputStyle}
              />
            </Column>

            <Column gap="8" style={{ flex: "1 1 9rem", minWidth: 0 }}>
              <label htmlFor={toId}>
                <Text as="span" variant="label-default-s" onBackground="neutral-weak">
                  To
                </Text>
              </label>
              <input
                id={toId}
                type="date"
                value={to}
                min={from || undefined}
                onChange={(e) => {
                  setTo(e.target.value);
                  setPage(1);
                }}
                style={inputStyle}
              />
            </Column>

            <Column gap="8" style={{ flex: "2 1 14rem", minWidth: 0 }}>
              <label htmlFor={searchId}>
                <Text as="span" variant="label-default-s" onBackground="neutral-weak">
                  Search
                </Text>
              </label>
              <input
                id={searchId}
                type="search"
                value={query}
                placeholder="Customer, email or invoice no."
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(1);
                }}
                style={inputStyle}
              />
            </Column>

            <Button
              variant="tertiary"
              size="m"
              onClick={resetFilters}
              disabled={!hasFilters}
              aria-label="Reset all filters"
            >
              Reset
            </Button>
          </Row>
          {dateInvalid && (
            <Text variant="body-default-s" onBackground="danger-strong" role="alert">
              The start date is after the end date, so no invoices can match.
            </Text>
          )}
        </Column>

        <Row fillWidth horizontal="between" vertical="center" gap="8" wrap>
          <Text variant="body-default-s" onBackground="neutral-weak" aria-live="polite">
            {sorted.length === 0
              ? "No invoices match"
              : `Showing ${startIdx + 1}–${startIdx + rows.length} of ${sorted.length} invoices`}
          </Text>
          <Text variant="label-default-s" onBackground="neutral-strong">
            Total: {currency.format(total)}
          </Text>
        </Row>

        <Column
          fillWidth
          radius="l"
          border="neutral-alpha-weak"
          background="surface"
          style={{ overflow: "hidden" }}
        >
          <div style={{ overflowX: "auto" }} tabIndex={0} role="region" aria-label="Invoices table, scrollable">
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "44rem" }}>
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
                <tr>
                  {COLUMNS.map((col) => {
                    const active = col.key === sortKey;
                    return (
                      <th
                        key={col.key}
                        scope="col"
                        aria-sort={active ? (sortDir === "asc" ? "ascending" : "descending") : "none"}
                        style={{
                          ...cellStyle,
                          textAlign: col.numeric ? "right" : "left",
                          background: "var(--neutral-alpha-weak)",
                          padding: "0.5rem 1rem",
                        }}
                      >
                        <button type="button" onClick={() => toggleSort(col.key)} style={thButtonStyle}>
                          {col.label}
                          <span aria-hidden="true" style={{ opacity: active ? 1 : 0.35, fontSize: "0.75rem" }}>
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
                    <td colSpan={COLUMNS.length} style={{ ...cellStyle, textAlign: "center", padding: "3rem 1rem" }}>
                      <Column gap="12" horizontal="center">
                        <Text variant="heading-strong-m">No invoices found</Text>
                        <Text variant="body-default-s" onBackground="neutral-weak">
                          Try widening the date range or clearing your search.
                        </Text>
                        {hasFilters && (
                          <Button variant="secondary" size="s" onClick={resetFilters}>
                            Clear filters
                          </Button>
                        )}
                      </Column>
                    </td>
                  </tr>
                ) : (
                  rows.map((inv) => {
                    const c = STATUS_COLORS[inv.status];
                    return (
                      <tr key={inv.id}>
                        <td style={{ ...cellStyle, fontFamily: "var(--font-code)", whiteSpace: "nowrap" }}>
                          {inv.id}
                        </td>
                        <td style={cellStyle}>
                          <div style={{ fontWeight: 600 }}>{inv.customer}</div>
                          <div style={{ fontSize: "0.75rem", color: "var(--neutral-on-background-weak)" }}>
                            {inv.email}
                          </div>
                        </td>
                        <td style={cellStyle}>{inv.plan}</td>
                        <td style={cellStyle}>
                          <span
                            style={{
                              display: "inline-block",
                              padding: "0.125rem 0.625rem",
                              borderRadius: "999px",
                              fontSize: "0.75rem",
                              fontWeight: 600,
                              color: c.fg,
                              background: c.bg,
                            }}
                          >
                            {inv.status}
                          </span>
                        </td>
                        <td style={{ ...cellStyle, whiteSpace: "nowrap" }}>
                          <time dateTime={inv.date}>{formatDate(inv.date)}</time>
                        </td>
                        <td
                          style={{
                            ...cellStyle,
                            textAlign: "right",
                            fontVariantNumeric: "tabular-nums",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {currency.format(inv.amount)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Column>

        <Row fillWidth horizontal="between" vertical="center" gap="16" wrap>
          <Row vertical="center" gap="8">
            <label htmlFor={sizeId}>
              <Text as="span" variant="body-default-s" onBackground="neutral-weak">
                Rows per page
              </Text>
            </label>
            <select
              id={sizeId}
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              style={{ ...inputStyle, width: "auto", paddingRight: "0.5rem" }}
            >
              {PAGE_SIZES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </Row>

          <nav aria-label="Pagination">
            <Row gap="4" vertical="center" wrap>
              <Button
                variant="secondary"
                size="s"
                disabled={currentPage <= 1}
                onClick={() => setPage(currentPage - 1)}
                aria-label="Previous page"
              >
                Prev
              </Button>
              {pageNumbers.map((p) =>
                typeof p === "number" ? (
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
                ) : (
                  <Text key={p} as="span" onBackground="neutral-weak" aria-hidden="true">
                    …
                  </Text>
                ),
              )}
              <Button
                variant="secondary"
                size="s"
                disabled={currentPage >= totalPages}
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
  );
}
```