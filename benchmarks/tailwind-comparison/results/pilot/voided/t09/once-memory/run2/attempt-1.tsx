"use client";

import { useMemo, useState } from "react";
import { Button, Column, Heading, Input, Row, Text } from "@once-ui-system/core";

type Status = "paid" | "pending" | "overdue";
type Invoice = {
  id: string;
  customer: string;
  plan: string;
  date: string; // ISO yyyy-mm-dd
  amount: number;
  status: Status;
};

const INVOICES: Invoice[] = [
  { id: "INV-2041", customer: "Northwind Logistics", plan: "Enterprise", date: "2026-09-28", amount: 4800, status: "paid" },
  { id: "INV-2040", customer: "Bluebird Studio", plan: "Team", date: "2026-09-26", amount: 640, status: "pending" },
  { id: "INV-2039", customer: "Harbor & Pine", plan: "Business", date: "2026-09-22", amount: 1250, status: "paid" },
  { id: "INV-2038", customer: "Quantum Tailors", plan: "Team", date: "2026-09-19", amount: 640, status: "overdue" },
  { id: "INV-2037", customer: "Lumen Health", plan: "Enterprise", date: "2026-09-15", amount: 5200, status: "paid" },
  { id: "INV-2036", customer: "Pixel Orchard", plan: "Starter", date: "2026-09-12", amount: 190, status: "paid" },
  { id: "INV-2035", customer: "Ridgeway Bank", plan: "Enterprise", date: "2026-09-09", amount: 7400, status: "pending" },
  { id: "INV-2034", customer: "Saffron Cafe Group", plan: "Business", date: "2026-09-03", amount: 1250, status: "overdue" },
  { id: "INV-2033", customer: "Tidal Robotics", plan: "Business", date: "2026-08-29", amount: 1250, status: "paid" },
  { id: "INV-2032", customer: "Aurora Books", plan: "Starter", date: "2026-08-25", amount: 190, status: "paid" },
  { id: "INV-2031", customer: "Copperline Energy", plan: "Enterprise", date: "2026-08-21", amount: 6100, status: "paid" },
  { id: "INV-2030", customer: "Willow Learning", plan: "Team", date: "2026-08-17", amount: 640, status: "pending" },
  { id: "INV-2029", customer: "Meridian Travel", plan: "Business", date: "2026-08-12", amount: 1250, status: "overdue" },
  { id: "INV-2028", customer: "Juniper Labs", plan: "Starter", date: "2026-08-08", amount: 190, status: "paid" },
  { id: "INV-2027", customer: "Foxglove Media", plan: "Team", date: "2026-08-04", amount: 640, status: "paid" },
  { id: "INV-2026", customer: "Granite Works", plan: "Enterprise", date: "2026-07-30", amount: 4800, status: "paid" },
  { id: "INV-2025", customer: "Seaside Dental", plan: "Starter", date: "2026-07-26", amount: 190, status: "pending" },
  { id: "INV-2024", customer: "Atlas Freight", plan: "Business", date: "2026-07-20", amount: 1250, status: "paid" },
];

type SortKey = "id" | "customer" | "plan" | "date" | "amount" | "status";
type SortDir = "asc" | "desc";

const PAGE_SIZE = 6;

const COLUMNS: { key: SortKey; label: string; align?: "right" }[] = [
  { key: "id", label: "Invoice" },
  { key: "customer", label: "Customer" },
  { key: "plan", label: "Plan" },
  { key: "date", label: "Date" },
  { key: "status", label: "Status" },
  { key: "amount", label: "Amount", align: "right" },
];

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "all", label: "All" },
  { value: "paid", label: "Paid" },
  { value: "pending", label: "Pending" },
  { value: "overdue", label: "Overdue" },
];

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const dateFmt = new Intl.DateTimeFormat("en-US", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" });

const STATUS_LABEL: Record<Status, string> = { paid: "Paid", pending: "Pending", overdue: "Overdue" };
const STATUS_STYLE: Record<Status, { bg: string; fg: string }> = {
  paid: { bg: "var(--success-alpha-weak)", fg: "var(--success-on-background-strong)" },
  pending: { bg: "var(--warning-alpha-weak)", fg: "var(--warning-on-background-strong)" },
  overdue: { bg: "var(--danger-alpha-weak)", fg: "var(--danger-on-background-strong)" },
};

const cellStyle: React.CSSProperties = {
  padding: "12px 16px",
  textAlign: "left",
  borderBottom: "1px solid var(--neutral-alpha-weak)",
  whiteSpace: "nowrap",
};

const dateInputStyle: React.CSSProperties = {
  height: 48,
  padding: "0 12px",
  borderRadius: "var(--radius-m)",
  border: "1px solid var(--neutral-alpha-medium)",
  background: "var(--page-background)",
  color: "var(--neutral-on-background-strong)",
  font: "inherit",
  minWidth: 0,
  width: "100%",
};

export default function Page() {
  const [status, setStatus] = useState<string>("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = INVOICES.filter((r) => {
      if (status !== "all" && r.status !== status) return false;
      if (from && r.date < from) return false;
      if (to && r.date > to) return false;
      if (q && !(r.customer.toLowerCase().includes(q) || r.id.toLowerCase().includes(q))) return false;
      return true;
    });
    const dir = sortDir === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === "number" && typeof bv === "number") return (av - bv) * dir;
      return String(av).localeCompare(String(bv)) * dir;
    });
  }, [status, from, to, query, sortKey, sortDir]);

  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const current = Math.min(page, pageCount);
  const visible = rows.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);
  const startIdx = rows.length === 0 ? 0 : (current - 1) * PAGE_SIZE + 1;
  const endIdx = Math.min(current * PAGE_SIZE, rows.length);

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
    setStatus("all");
    setFrom("");
    setTo("");
    setQuery("");
    setPage(1);
  };

  const filtersActive = status !== "all" || from !== "" || to !== "" || query !== "";

  return (
    <Column as="main" fillWidth horizontal="center" paddingX="16" paddingY="32" gap="24">
      <Column fillWidth maxWidth={64} gap="24">
        <Column gap="8">
          <Heading as="h1" variant="display-strong-s">
            Invoices
          </Heading>
          <Text variant="body-default-m" onBackground="neutral-weak">
            Billing history for all customer accounts. Sort by any column, narrow the list with filters, and page
            through the results.
          </Text>
        </Column>

        <Column
          as="section"
          aria-label="Filters"
          fillWidth
          gap="16"
          padding="16"
          radius="l"
          border="neutral-alpha-weak"
          background="surface"
        >
          <Row fillWidth gap="16" wrap vertical="end">
            <Column gap="8" style={{ flex: "1 1 280px" }}>
              <Text as="span" variant="label-default-s" onBackground="neutral-weak" id="status-label">
                Status
              </Text>
              <div role="group" aria-labelledby="status-label" style={{ overflowX: "auto" }}>
                <Row gap="4" padding="4" radius="m" border="neutral-alpha-weak" background="page">
                  {STATUS_OPTIONS.map((opt) => (
                    <Button
                      key={opt.value}
                      size="s"
                      variant={status === opt.value ? "primary" : "tertiary"}
                      aria-pressed={status === opt.value}
                      onClick={() => {
                        setStatus(opt.value);
                        setPage(1);
                      }}
                    >
                      {opt.label}
                    </Button>
                  ))}
                </Row>
              </div>
            </Column>

            <Column gap="8" style={{ flex: "1 1 120px", minWidth: 0 }}>
              <Text as="label" variant="label-default-s" onBackground="neutral-weak" htmlFor="date-from">
                From
              </Text>
              <input
                id="date-from"
                type="date"
                value={from}
                max={to || undefined}
                onChange={(e) => {
                  setFrom(e.target.value);
                  setPage(1);
                }}
                style={dateInputStyle}
              />
            </Column>

            <Column gap="8" style={{ flex: "1 1 120px", minWidth: 0 }}>
              <Text as="label" variant="label-default-s" onBackground="neutral-weak" htmlFor="date-to">
                To
              </Text>
              <input
                id="date-to"
                type="date"
                value={to}
                min={from || undefined}
                onChange={(e) => {
                  setTo(e.target.value);
                  setPage(1);
                }}
                style={dateInputStyle}
              />
            </Column>

            <div style={{ flex: "2 1 220px", minWidth: 0 }}>
              <Input
                id="invoice-search"
                label="Search customer or invoice"
                type="search"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(1);
                }}
              />
            </div>
          </Row>

          <Row fillWidth horizontal="between" vertical="center" gap="12" wrap>
            <Text variant="body-default-s" onBackground="neutral-weak" aria-live="polite">
              {rows.length} {rows.length === 1 ? "invoice" : "invoices"} match
            </Text>
            <Button variant="tertiary" size="s" onClick={resetFilters} disabled={!filtersActive}>
              Clear filters
            </Button>
          </Row>
        </Column>

        <Column fillWidth radius="l" border="neutral-alpha-weak" background="surface" overflow="hidden">
          <div style={{ overflowX: "auto" }} tabIndex={0} role="region" aria-label="Invoices table, scrollable">
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 680 }}>
              <caption
                style={{
                  position: "absolute",
                  width: 1,
                  height: 1,
                  overflow: "hidden",
                  clip: "rect(0 0 0 0)",
                }}
              >
                Invoices sorted by {sortKey} ({sortDir === "asc" ? "ascending" : "descending"})
              </caption>
              <thead>
                <tr>
                  {COLUMNS.map((col) => {
                    const active = sortKey === col.key;
                    return (
                      <th
                        key={col.key}
                        scope="col"
                        aria-sort={active ? (sortDir === "asc" ? "ascending" : "descending") : "none"}
                        style={{ ...cellStyle, textAlign: col.align ?? "left", padding: "4px 8px" }}
                      >
                        <Button
                          variant="tertiary"
                          size="s"
                          onClick={() => toggleSort(col.key)}
                          aria-label={`Sort by ${col.label}`}
                        >
                          {col.label}
                          {active ? (sortDir === "asc" ? " ▲" : " ▼") : ""}
                        </Button>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {visible.length === 0 ? (
                  <tr>
                    <td colSpan={COLUMNS.length} style={{ ...cellStyle, textAlign: "center", padding: 40 }}>
                      <Text onBackground="neutral-weak">No invoices match these filters.</Text>
                    </td>
                  </tr>
                ) : (
                  visible.map((r) => (
                    <tr key={r.id}>
                      <th scope="row" style={{ ...cellStyle, fontWeight: 600 }}>
                        {r.id}
                      </th>
                      <td style={cellStyle}>{r.customer}</td>
                      <td style={cellStyle}>{r.plan}</td>
                      <td style={cellStyle}>
                        <time dateTime={r.date}>{dateFmt.format(new Date(`${r.date}T00:00:00Z`))}</time>
                      </td>
                      <td style={cellStyle}>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "2px 10px",
                            borderRadius: 999,
                            fontSize: 13,
                            fontWeight: 600,
                            background: STATUS_STYLE[r.status].bg,
                            color: STATUS_STYLE[r.status].fg,
                          }}
                        >
                          {STATUS_LABEL[r.status]}
                        </span>
                      </td>
                      <td style={{ ...cellStyle, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                        {currency.format(r.amount)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Column>

        <Row as="nav" aria-label="Pagination" fillWidth horizontal="between" vertical="center" gap="12" wrap>
          <Text variant="body-default-s" onBackground="neutral-weak">
            Showing {startIdx}-{endIdx} of {rows.length}
          </Text>
          <Row gap="8" vertical="center">
            <Button
              variant="secondary"
              size="s"
              onClick={() => setPage(current - 1)}
              disabled={current <= 1}
              aria-label="Previous page"
            >
              Previous
            </Button>
            <Text variant="label-default-s" aria-current="page">
              Page {current} of {pageCount}
            </Text>
            <Button
              variant="secondary"
              size="s"
              onClick={() => setPage(current + 1)}
              disabled={current >= pageCount}
              aria-label="Next page"
            >
              Next
            </Button>
          </Row>
        </Row>
      </Column>
    </Column>
  );
}
