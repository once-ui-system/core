"use client";

import { useMemo, useState } from "react";
import { Button, Column, Heading, Input, Row, SegmentedControl, Tag, Text } from "@once-ui-system/core";

type Status = "Paid" | "Pending" | "Overdue";

interface Invoice {
  id: string;
  customer: string;
  plan: string;
  date: string;
  amount: number;
  status: Status;
}

const INVOICES: Invoice[] = [
  { id: "INV-2041", customer: "Northwind Logistics", plan: "Enterprise", date: "2026-09-28", amount: 4800, status: "Paid" },
  { id: "INV-2040", customer: "Alder & Finch", plan: "Team", date: "2026-09-26", amount: 640, status: "Pending" },
  { id: "INV-2039", customer: "Brightwater Health", plan: "Enterprise", date: "2026-09-22", amount: 5200, status: "Paid" },
  { id: "INV-2038", customer: "Corvid Studio", plan: "Starter", date: "2026-09-19", amount: 120, status: "Overdue" },
  { id: "INV-2037", customer: "Dunmore Foods", plan: "Team", date: "2026-09-15", amount: 880, status: "Paid" },
  { id: "INV-2036", customer: "Eastgate Robotics", plan: "Enterprise", date: "2026-09-12", amount: 7350, status: "Pending" },
  { id: "INV-2035", customer: "Fernhill Academy", plan: "Team", date: "2026-09-09", amount: 420, status: "Paid" },
  { id: "INV-2034", customer: "Granite Peak Outfitters", plan: "Starter", date: "2026-09-05", amount: 95, status: "Overdue" },
  { id: "INV-2033", customer: "Harbor & Vine", plan: "Team", date: "2026-09-02", amount: 760, status: "Paid" },
  { id: "INV-2032", customer: "Ironbridge Capital", plan: "Enterprise", date: "2026-08-29", amount: 9100, status: "Paid" },
  { id: "INV-2031", customer: "Juniper Labs", plan: "Starter", date: "2026-08-25", amount: 150, status: "Pending" },
  { id: "INV-2030", customer: "Kestrel Aviation", plan: "Enterprise", date: "2026-08-21", amount: 6400, status: "Overdue" },
  { id: "INV-2029", customer: "Lumen Cooperative", plan: "Team", date: "2026-08-18", amount: 540, status: "Paid" },
  { id: "INV-2028", customer: "Marlow Textiles", plan: "Team", date: "2026-08-14", amount: 710, status: "Paid" },
  { id: "INV-2027", customer: "Nimbus Weather", plan: "Starter", date: "2026-08-10", amount: 110, status: "Pending" },
  { id: "INV-2026", customer: "Oakline Dental", plan: "Team", date: "2026-08-06", amount: 480, status: "Paid" },
  { id: "INV-2025", customer: "Pinecrest Realty", plan: "Enterprise", date: "2026-08-02", amount: 5600, status: "Overdue" },
  { id: "INV-2024", customer: "Quarry Street Press", plan: "Starter", date: "2026-07-30", amount: 85, status: "Paid" },
  { id: "INV-2023", customer: "Riverbend Energy", plan: "Enterprise", date: "2026-07-26", amount: 8200, status: "Paid" },
  { id: "INV-2022", customer: "Saltmarsh Bakery", plan: "Starter", date: "2026-07-22", amount: 130, status: "Pending" },
  { id: "INV-2021", customer: "Tidewater Marine", plan: "Team", date: "2026-07-18", amount: 920, status: "Paid" },
  { id: "INV-2020", customer: "Umber Design Co.", plan: "Team", date: "2026-07-14", amount: 390, status: "Overdue" },
];

type SortKey = "id" | "customer" | "plan" | "date" | "amount" | "status";
type SortDir = "asc" | "desc";

const PAGE_SIZE = 6;

const COLUMNS: { key: SortKey; label: string; numeric?: boolean }[] = [
  { key: "id", label: "Invoice" },
  { key: "customer", label: "Customer" },
  { key: "plan", label: "Plan" },
  { key: "date", label: "Date" },
  { key: "amount", label: "Amount", numeric: true },
  { key: "status", label: "Status" },
];

const STATUS_COLOR: Record<Status, "success" | "warning" | "danger"> = {
  Paid: "success",
  Pending: "warning",
  Overdue: "danger",
};

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const dateFmt = new Intl.DateTimeFormat("en-US", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" });

function formatDate(iso: string): string {
  return dateFmt.format(new Date(`${iso}T00:00:00Z`));
}

export default function Page() {
  const [status, setStatus] = useState<string>("all");
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
      if (q && !`${r.id} ${r.customer} ${r.plan}`.toLowerCase().includes(q)) return false;
      return true;
    });
    const dir = sortDir === "asc" ? 1 : -1;
    rows.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === "number" && typeof bv === "number") return (av - bv) * dir;
      return String(av).localeCompare(String(bv)) * dir;
    });
    return rows;
  }, [status, query, from, to, sortKey, sortDir]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pageCount);
  const start = (current - 1) * PAGE_SIZE;
  const visible = filtered.slice(start, start + PAGE_SIZE);
  const rangeInvalid = Boolean(from && to && from > to);

  const toggleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(1);
  };

  const resetFilters = () => {
    setStatus("all");
    setQuery("");
    setFrom("");
    setTo("");
    setPage(1);
  };

  const hasFilters = status !== "all" || query !== "" || from !== "" || to !== "";

  return (
    <Column as="main" fillWidth horizontal="center" paddingX="m" paddingY="xl">
      <Column fillWidth maxWidth={72} gap="l">
        <Column gap="4">
          <Heading as="h1" variant="display-strong-s">
            Invoices
          </Heading>
          <Text variant="body-default-m" onBackground="neutral-weak">
            Billing activity across all customer accounts. Sort by any column, or narrow the list with the filters.
          </Text>
        </Column>

        <Column
          as="section"
          aria-label="Filters"
          gap="12"
          padding="m"
          radius="l"
          border="neutral-medium"
          background="surface"
        >
          <Row fillWidth gap="16" wrap vertical="end">
            <Column gap="4" style={{ minWidth: 0 }}>
              <Text as="span" id="status-label" variant="label-default-s" onBackground="neutral-weak">
                Status
              </Text>
              <div role="group" aria-labelledby="status-label">
                <SegmentedControl
                  buttons={[
                    { value: "all", label: "All" },
                    { value: "Paid", label: "Paid" },
                    { value: "Pending", label: "Pending" },
                    { value: "Overdue", label: "Overdue" },
                  ]}
                  selected={status}
                  onToggle={(value) => {
                    setStatus(value);
                    setPage(1);
                  }}
                />
              </div>
            </Column>

            <Row gap="8" wrap style={{ minWidth: 0 }}>
              <Input
                id="date-from"
                type="date"
                label="From"
                value={from}
                max={to || undefined}
                onChange={(e) => {
                  setFrom(e.target.value);
                  setPage(1);
                }}
              />
              <Input
                id="date-to"
                type="date"
                label="To"
                value={to}
                min={from || undefined}
                onChange={(e) => {
                  setTo(e.target.value);
                  setPage(1);
                }}
              />
            </Row>

            <Column flex={1} style={{ minWidth: "14rem" }}>
              <Input
                id="search"
                type="search"
                label="Search invoices"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(1);
                }}
              />
            </Column>

            <Button variant="tertiary" size="m" onClick={resetFilters} disabled={!hasFilters}>
              Clear filters
            </Button>
          </Row>
          {rangeInvalid && (
            <Text role="alert" variant="body-default-s" onBackground="danger-weak">
              The start date is after the end date, so no invoices can match.
            </Text>
          )}
        </Column>

        <Column fillWidth gap="12">
          <div
            style={{
              overflowX: "auto",
              border: "1px solid var(--neutral-alpha-medium)",
              borderRadius: "var(--radius-l)",
              background: "var(--surface-background)",
            }}
          >
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "42rem" }}>
              <caption style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>
                Invoices, sorted by {COLUMNS.find((c) => c.key === sortKey)?.label.toLowerCase()}{" "}
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
                          textAlign: col.numeric ? "right" : "left",
                          padding: 0,
                          borderBottom: "1px solid var(--neutral-alpha-medium)",
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
                            alignItems: "center",
                            justifyContent: col.numeric ? "flex-end" : "flex-start",
                            fontSize: "var(--static-font-size-s, 0.875rem)",
                            fontWeight: 600,
                            color: active ? "var(--neutral-on-background-strong)" : "var(--neutral-on-background-medium)",
                          }}
                        >
                          {col.label}
                          <span aria-hidden="true">{active ? (sortDir === "asc" ? "▲" : "▼") : "↕"}</span>
                        </button>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {visible.length === 0 ? (
                  <tr>
                    <td colSpan={COLUMNS.length} style={{ padding: "40px 16px", textAlign: "center" }}>
                      <Text variant="body-default-m" onBackground="neutral-weak">
                        No invoices match these filters.
                      </Text>
                    </td>
                  </tr>
                ) : (
                  visible.map((row) => (
                    <tr key={row.id} style={{ borderBottom: "1px solid var(--neutral-alpha-weak)" }}>
                      <th scope="row" style={{ textAlign: "left", padding: "12px 16px", fontWeight: 500 }}>
                        <Text variant="code-default-s">{row.id}</Text>
                      </th>
                      <td style={{ padding: "12px 16px" }}>
                        <Text variant="body-default-s">{row.customer}</Text>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <Text variant="body-default-s" onBackground="neutral-weak">
                          {row.plan}
                        </Text>
                      </td>
                      <td style={{ padding: "12px 16px", whiteSpace: "nowrap" }}>
                        <Text variant="body-default-s">{formatDate(row.date)}</Text>
                      </td>
                      <td style={{ padding: "12px 16px", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                        <Text variant="body-default-s">{money.format(row.amount)}</Text>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <Tag variant={STATUS_COLOR[row.status]} size="s">
                          {row.status}
                        </Tag>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <Row fillWidth horizontal="between" vertical="center" gap="12" wrap>
            <Text variant="body-default-s" onBackground="neutral-weak" aria-live="polite">
              {filtered.length === 0
                ? "0 results"
                : `Showing ${start + 1}–${start + visible.length} of ${filtered.length}`}
            </Text>
            <Row as="nav" aria-label="Pagination" gap="4" vertical="center" wrap>
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
                  variant={n === current ? "primary" : "tertiary"}
                  size="s"
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
        </Column>
      </Column>
    </Column>
  );
}
