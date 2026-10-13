"use client";

import { useMemo, useState } from "react";
import { Badge, Button, Column, Heading, Input, Row, Text } from "@once-ui-system/core";

type Status = "paid" | "pending" | "overdue";
type StatusFilter = "all" | Status;
type SortKey = "invoice" | "customer" | "date" | "amount" | "status";
type SortDir = "asc" | "desc";

interface Invoice {
  invoice: string;
  customer: string;
  date: string; // ISO yyyy-mm-dd
  amount: number;
  status: Status;
}

const INVOICES: Invoice[] = [
  { invoice: "INV-1042", customer: "Northwind Logistics", date: "2026-09-28", amount: 4820.5, status: "paid" },
  { invoice: "INV-1041", customer: "Harbor & Pine Studio", date: "2026-09-26", amount: 1290, status: "pending" },
  { invoice: "INV-1040", customer: "Lumen Health Partners", date: "2026-09-22", amount: 9340.75, status: "paid" },
  { invoice: "INV-1039", customer: "Alder Street Bakery", date: "2026-09-19", amount: 312.4, status: "overdue" },
  { invoice: "INV-1038", customer: "Brightwave Energy", date: "2026-09-15", amount: 15600, status: "pending" },
  { invoice: "INV-1037", customer: "Cobalt Robotics", date: "2026-09-12", amount: 7425, status: "paid" },
  { invoice: "INV-1036", customer: "Fernhill Veterinary", date: "2026-09-09", amount: 860.2, status: "paid" },
  { invoice: "INV-1035", customer: "Granite Peak Outfitters", date: "2026-09-05", amount: 2210, status: "overdue" },
  { invoice: "INV-1034", customer: "Meridian Legal Group", date: "2026-09-02", amount: 5400, status: "paid" },
  { invoice: "INV-1033", customer: "Saltmarsh Coffee Co.", date: "2026-08-30", amount: 645.9, status: "pending" },
  { invoice: "INV-1032", customer: "Oakline Architects", date: "2026-08-27", amount: 11200, status: "paid" },
  { invoice: "INV-1031", customer: "Quartz Analytics", date: "2026-08-24", amount: 3875.35, status: "overdue" },
  { invoice: "INV-1030", customer: "Willow Creek School", date: "2026-08-20", amount: 1980, status: "paid" },
  { invoice: "INV-1029", customer: "Redwood Fitness", date: "2026-08-17", amount: 730, status: "pending" },
  { invoice: "INV-1028", customer: "Tidewater Marine", date: "2026-08-13", amount: 8640.1, status: "paid" },
  { invoice: "INV-1027", customer: "Juniper Textiles", date: "2026-08-10", amount: 2495, status: "paid" },
  { invoice: "INV-1026", customer: "Vantage Freight", date: "2026-08-06", amount: 13050, status: "overdue" },
  { invoice: "INV-1025", customer: "Lark & Finch Florals", date: "2026-08-02", amount: 418.6, status: "paid" },
  { invoice: "INV-1024", customer: "Summit Dental Care", date: "2026-07-29", amount: 2760, status: "pending" },
  { invoice: "INV-1023", customer: "Copperline Brewing", date: "2026-07-25", amount: 1534.8, status: "paid" },
  { invoice: "INV-1022", customer: "Ironbridge Capital", date: "2026-07-21", amount: 19800, status: "paid" },
  { invoice: "INV-1021", customer: "Marigold Kitchens", date: "2026-07-18", amount: 972.25, status: "overdue" },
  { invoice: "INV-1020", customer: "Polar Cloud Systems", date: "2026-07-14", amount: 6120, status: "paid" },
  { invoice: "INV-1019", customer: "Evergreen Realty", date: "2026-07-10", amount: 3340, status: "pending" },
];

const PAGE_SIZE = 8;

const STATUS_LABEL: Record<Status, string> = { paid: "Paid", pending: "Pending", overdue: "Overdue" };
const STATUS_COLOR: Record<Status, "success" | "warning" | "danger"> = {
  paid: "success",
  pending: "warning",
  overdue: "danger",
};

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "paid", label: "Paid" },
  { value: "pending", label: "Pending" },
  { value: "overdue", label: "Overdue" },
];

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const formatDate = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });

const COLUMNS: { key: SortKey; label: string; align: "left" | "right" }[] = [
  { key: "invoice", label: "Invoice", align: "left" },
  { key: "customer", label: "Customer", align: "left" },
  { key: "date", label: "Date", align: "left" },
  { key: "amount", label: "Amount", align: "right" },
  { key: "status", label: "Status", align: "left" },
];

export default function Page() {
  const [status, setStatus] = useState<StatusFilter>("all");
  const [query, setQuery] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const rows = INVOICES.filter((r) => {
      if (status !== "all" && r.status !== status) return false;
      if (from && r.date < from) return false;
      if (to && r.date > to) return false;
      if (q && !r.customer.toLowerCase().includes(q) && !r.invoice.toLowerCase().includes(q)) return false;
      return true;
    });
    const dir = sortDir === "asc" ? 1 : -1;
    return [...rows].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === "number" && typeof bv === "number") return (av - bv) * dir;
      return String(av).localeCompare(String(bv)) * dir;
    });
  }, [status, query, from, to, sortKey, sortDir]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pageCount);
  const start = (current - 1) * PAGE_SIZE;
  const visible = filtered.slice(start, start + PAGE_SIZE);
  const rangeInvalid = from !== "" && to !== "" && from > to;

  const toggleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "amount" || key === "date" ? "desc" : "asc");
    }
    setPage(1);
  };

  const reset = () => {
    setStatus("all");
    setQuery("");
    setFrom("");
    setTo("");
    setPage(1);
  };

  const hasFilters = status !== "all" || query !== "" || from !== "" || to !== "";

  return (
    <Column as="main" fillWidth horizontal="center" paddingX="m" paddingY="xl">
      <Column fillWidth maxWidth={64} gap="24">
        <Column gap="8">
          <Heading as="h1" variant="display-strong-s">
            Invoices
          </Heading>
          <Text variant="body-default-m" onBackground="neutral-weak">
            Track what customers have paid, what is still open and what is past due.
          </Text>
        </Column>

        <Column
          as="section"
          aria-label="Filters"
          gap="16"
          padding="16"
          radius="l"
          border="neutral-medium"
          background="surface"
        >
          <Row fillWidth gap="16" wrap vertical="end">
            <Column gap="8" style={{ flex: "1 1 260px" }}>
              <Text as="span" variant="label-default-s" onBackground="neutral-weak" id="status-label">
                Status
              </Text>
              <div
                role="radiogroup"
                aria-labelledby="status-label"
                style={{
                  display: "inline-flex",
                  maxWidth: "100%",
                  overflowX: "auto",
                  padding: 4,
                  gap: 4,
                  borderRadius: "var(--radius-m)",
                  border: "1px solid var(--neutral-border-medium)",
                  background: "var(--neutral-alpha-weak)",
                  alignSelf: "flex-start",
                }}
              >
                {STATUS_OPTIONS.map((opt) => {
                  const selected = opt.value === status;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => {
                        setStatus(opt.value);
                        setPage(1);
                      }}
                      style={{
                        cursor: "pointer",
                        border: "none",
                        borderRadius: "var(--radius-s)",
                        padding: "8px 14px",
                        minHeight: 36,
                        font: "inherit",
                        fontSize: 14,
                        fontWeight: selected ? 600 : 500,
                        whiteSpace: "nowrap",
                        color: "var(--neutral-on-background-strong)",
                        background: selected ? "var(--surface-background)" : "transparent",
                        boxShadow: selected ? "0 0 0 1px var(--neutral-border-strong)" : "none",
                      }}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </Column>
            <div style={{ flex: "1 1 240px", minWidth: 0 }}>
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

          <Row fillWidth gap="16" wrap vertical="end">
            <div style={{ flex: "1 1 160px", minWidth: 0 }}>
              <Input
                id="date-from"
                label="From date"
                type="date"
                value={from}
                max={to || undefined}
                onChange={(e) => {
                  setFrom(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <div style={{ flex: "1 1 160px", minWidth: 0 }}>
              <Input
                id="date-to"
                label="To date"
                type="date"
                value={to}
                min={from || undefined}
                onChange={(e) => {
                  setTo(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <Button variant="secondary" size="m" onClick={reset} disabled={!hasFilters}>
              Clear filters
            </Button>
          </Row>
          {rangeInvalid && (
            <Text role="alert" variant="body-default-s" onBackground="danger-weak">
              The start date must be on or before the end date.
            </Text>
          )}
        </Column>

        <Text variant="body-default-s" onBackground="neutral-weak" aria-live="polite">
          {filtered.length === 0
            ? "No invoices match these filters."
            : `Showing ${start + 1}–${start + visible.length} of ${filtered.length} invoices`}
        </Text>

        <div
          role="region"
          aria-label="Invoices table"
          tabIndex={0}
          style={{
            overflowX: "auto",
            border: "1px solid var(--neutral-border-medium)",
            borderRadius: "var(--radius-l)",
            background: "var(--surface-background)",
          }}
        >
          <table style={{ width: "100%", minWidth: 640, borderCollapse: "collapse" }}>
            <caption style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>
              Invoices, sortable by column
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
                        textAlign: col.align,
                        padding: 0,
                        borderBottom: "1px solid var(--neutral-border-medium)",
                        background: "var(--neutral-alpha-weak)",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => toggleSort(col.key)}
                        style={{
                          all: "unset",
                          boxSizing: "border-box",
                          width: "100%",
                          cursor: "pointer",
                          padding: "12px 16px",
                          display: "flex",
                          gap: 6,
                          justifyContent: col.align === "right" ? "flex-end" : "flex-start",
                          fontSize: 13,
                          fontWeight: 600,
                          color: "var(--neutral-on-background-strong)",
                        }}
                      >
                        {col.label}
                        <span aria-hidden="true" style={{ opacity: active ? 1 : 0.35 }}>
                          {active ? (sortDir === "asc" ? "↑" : "↓") : "↕"}
                        </span>
                      </button>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {visible.length === 0 ? (
                <tr>
                  <td colSpan={COLUMNS.length} style={{ padding: 32, textAlign: "center" }}>
                    <Text onBackground="neutral-weak">Try widening the date range or clearing the search.</Text>
                  </td>
                </tr>
              ) : (
                visible.map((r) => (
                  <tr key={r.invoice} style={{ borderTop: "1px solid var(--neutral-border-weak)" }}>
                    <th scope="row" style={{ textAlign: "left", padding: "12px 16px", fontWeight: 600 }}>
                      <Text variant="label-default-s">{r.invoice}</Text>
                    </th>
                    <td style={{ padding: "12px 16px" }}>
                      <Text variant="body-default-s">{r.customer}</Text>
                    </td>
                    <td style={{ padding: "12px 16px", whiteSpace: "nowrap" }}>
                      <Text variant="body-default-s">{formatDate(r.date)}</Text>
                    </td>
                    <td style={{ padding: "12px 16px", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                      <Text variant="body-default-s">{currency.format(r.amount)}</Text>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <Badge
                        title={STATUS_LABEL[r.status]}
                        arrow={false}
                        effect={false}
                        textVariant="label-default-s"
                        onBackground={`${STATUS_COLOR[r.status]}-strong`}
                        background={`${STATUS_COLOR[r.status]}-alpha-weak`}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <nav aria-label="Pagination">
          <Row fillWidth horizontal="between" vertical="center" gap="16" wrap>
            <Text variant="body-default-s" onBackground="neutral-weak">
              Page {current} of {pageCount}
            </Text>
            <Row gap="8" wrap>
              <Button
                variant="secondary"
                size="s"
                disabled={current <= 1}
                onClick={() => setPage(current - 1)}
                aria-label="Previous page"
              >
                Previous
              </Button>
              {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
                <Button
                  key={n}
                  size="s"
                  variant={n === current ? "primary" : "tertiary"}
                  onClick={() => setPage(n)}
                  aria-label={`Page ${n}`}
                  aria-current={n === current ? "page" : undefined}
                >
                  {n}
                </Button>
              ))}
              <Button
                variant="secondary"
                size="s"
                disabled={current >= pageCount}
                onClick={() => setPage(current + 1)}
                aria-label="Next page"
              >
                Next
              </Button>
            </Row>
          </Row>
        </nav>
      </Column>
    </Column>
  );
}
