"use client";

import { useMemo, useState } from "react";
import { Button, Column, Heading, Input, Row, SegmentedControl, Text } from "@once-ui-system/core";

type Status = "paid" | "pending" | "overdue";
type Invoice = {
  id: string;
  customer: string;
  plan: string;
  status: Status;
  date: string;
  amount: number;
};
type SortKey = "id" | "customer" | "status" | "date" | "amount";

const INVOICES: Invoice[] = [
  { id: "INV-1042", customer: "Northwind Logistics", plan: "Enterprise", status: "paid", date: "2026-09-28", amount: 4820 },
  { id: "INV-1041", customer: "Fjord Analytics", plan: "Team", status: "pending", date: "2026-09-26", amount: 1290 },
  { id: "INV-1040", customer: "Maple & Pine Studio", plan: "Starter", status: "paid", date: "2026-09-24", amount: 240 },
  { id: "INV-1039", customer: "Halcyon Health", plan: "Enterprise", status: "overdue", date: "2026-09-19", amount: 7350 },
  { id: "INV-1038", customer: "Brightwater Co-op", plan: "Team", status: "paid", date: "2026-09-17", amount: 980 },
  { id: "INV-1037", customer: "Lumen Robotics", plan: "Enterprise", status: "pending", date: "2026-09-14", amount: 5600 },
  { id: "INV-1036", customer: "Orchard Books", plan: "Starter", status: "paid", date: "2026-09-12", amount: 120 },
  { id: "INV-1035", customer: "Tidewater Energy", plan: "Team", status: "overdue", date: "2026-09-08", amount: 2150 },
  { id: "INV-1034", customer: "Paper Lantern Games", plan: "Team", status: "paid", date: "2026-09-05", amount: 760 },
  { id: "INV-1033", customer: "Granite Capital", plan: "Enterprise", status: "paid", date: "2026-09-02", amount: 9100 },
  { id: "INV-1032", customer: "Saffron Kitchens", plan: "Starter", status: "pending", date: "2026-08-30", amount: 310 },
  { id: "INV-1031", customer: "Cobalt Aerospace", plan: "Enterprise", status: "paid", date: "2026-08-27", amount: 12400 },
  { id: "INV-1030", customer: "Wildflower Dental", plan: "Team", status: "overdue", date: "2026-08-22", amount: 1480 },
  { id: "INV-1029", customer: "Nimbus Telecom", plan: "Enterprise", status: "paid", date: "2026-08-19", amount: 6720 },
  { id: "INV-1028", customer: "Juniper Schools", plan: "Team", status: "pending", date: "2026-08-15", amount: 1050 },
  { id: "INV-1027", customer: "Ember Coffee Roasters", plan: "Starter", status: "paid", date: "2026-08-11", amount: 180 },
  { id: "INV-1026", customer: "Atlas Freight", plan: "Team", status: "paid", date: "2026-08-07", amount: 1340 },
  { id: "INV-1025", customer: "Quartz Legal", plan: "Enterprise", status: "overdue", date: "2026-08-03", amount: 3890 },
];

const PAGE_SIZE = 6;

const STATUS_COLOR: Record<Status, string> = {
  paid: "var(--success-on-background-strong)",
  pending: "var(--warning-on-background-strong)",
  overdue: "var(--danger-on-background-strong)",
};

const COLUMNS: { key: SortKey; label: string; numeric?: boolean }[] = [
  { key: "id", label: "Invoice" },
  { key: "customer", label: "Customer" },
  { key: "status", label: "Status" },
  { key: "date", label: "Date" },
  { key: "amount", label: "Amount", numeric: true },
];

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const dateFmt = new Intl.DateTimeFormat("en-US", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" });

export default function Page() {
  const [status, setStatus] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const rows = INVOICES.filter((r) => {
      if (status !== "all" && r.status !== status) return false;
      if (q && !(r.customer.toLowerCase().includes(q) || r.id.toLowerCase().includes(q))) return false;
      if (from && r.date < from) return false;
      if (to && r.date > to) return false;
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
  const rows = filtered.slice(start, start + PAGE_SIZE);

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

  const cellStyle = {
    padding: "12px 16px",
    borderBottom: "1px solid var(--neutral-alpha-weak)",
    whiteSpace: "nowrap" as const,
  };

  return (
    <Column as="main" fillWidth horizontal="center" paddingX="m" paddingY="xl">
      <Column fillWidth maxWidth={64} gap="24">
        <Column gap="8">
          <Heading as="h1" variant="display-strong-s">
            Invoices
          </Heading>
          <Text variant="body-default-m" onBackground="neutral-weak">
            Billing activity across all customer accounts, updated daily.
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
          fillWidth
        >
          <Row fillWidth gap="16" wrap vertical="end">
            <Column gap="8" minWidth={16}>
              <Text as="span" variant="label-default-s" onBackground="neutral-weak" id="status-label">
                Status
              </Text>
              <div role="group" aria-labelledby="status-label">
                <SegmentedControl
                  buttons={[
                    { value: "all", label: "All" },
                    { value: "paid", label: "Paid" },
                    { value: "pending", label: "Pending" },
                    { value: "overdue", label: "Overdue" },
                  ]}
                  defaultSelected="all"
                  onToggle={(value: string) => {
                    setStatus(value);
                    setPage(1);
                  }}
                />
              </div>
            </Column>
            <Row flex={1} minWidth={16}>
              <Input
                id="search"
                label="Search customer or invoice"
                type="search"
                value={query}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setQuery(e.target.value);
                  setPage(1);
                }}
              />
            </Row>
          </Row>
          <Row fillWidth gap="16" wrap vertical="end">
            <Row flex={1} minWidth={12}>
              <Input
                id="from"
                label="From date"
                type="date"
                value={from}
                max={to || undefined}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setFrom(e.target.value);
                  setPage(1);
                }}
              />
            </Row>
            <Row flex={1} minWidth={12}>
              <Input
                id="to"
                label="To date"
                type="date"
                value={to}
                min={from || undefined}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setTo(e.target.value);
                  setPage(1);
                }}
              />
            </Row>
            <Button variant="secondary" size="l" onClick={resetFilters}>
              Reset filters
            </Button>
          </Row>
        </Column>

        <Column fillWidth gap="12">
          <Text variant="body-default-s" onBackground="neutral-weak" aria-live="polite">
            {filtered.length === 0
              ? "No invoices match these filters."
              : `Showing ${start + 1}-${start + rows.length} of ${filtered.length} invoices`}
          </Text>
          <div
            style={{
              overflowX: "auto",
              border: "1px solid var(--neutral-alpha-weak)",
              borderRadius: "var(--radius-l)",
              background: "var(--surface-background)",
            }}
          >
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 640 }}>
              <caption style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>
                Invoices, sortable by column
              </caption>
              <thead>
                <tr>
                  {COLUMNS.map((c) => {
                    const active = c.key === sortKey;
                    return (
                      <th
                        key={c.key}
                        scope="col"
                        aria-sort={active ? (sortDir === "asc" ? "ascending" : "descending") : "none"}
                        style={{
                          ...cellStyle,
                          textAlign: c.numeric ? "right" : "left",
                          background: "var(--neutral-alpha-weak)",
                        }}
                      >
                        <Button
                          variant="tertiary"
                          size="s"
                          onClick={() => toggleSort(c.key)}
                          aria-label={`Sort by ${c.label}`}
                        >
                          {c.label} {active ? (sortDir === "asc" ? "↑" : "↓") : "↕"}
                        </Button>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td style={cellStyle}>
                      <Text variant="label-default-s">{r.id}</Text>
                    </td>
                    <td style={cellStyle}>
                      <Column gap="4">
                        <Text variant="body-default-m">{r.customer}</Text>
                        <Text variant="body-default-xs" onBackground="neutral-weak">
                          {r.plan} plan
                        </Text>
                      </Column>
                    </td>
                    <td style={cellStyle}>
                      <span style={{ color: STATUS_COLOR[r.status], fontWeight: 600, textTransform: "capitalize" }}>
                        {r.status}
                      </span>
                    </td>
                    <td style={cellStyle}>
                      <Text variant="body-default-s">{dateFmt.format(new Date(`${r.date}T00:00:00Z`))}</Text>
                    </td>
                    <td style={{ ...cellStyle, textAlign: "right" }}>
                      <Text variant="label-default-m">{currency.format(r.amount)}</Text>
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={COLUMNS.length} style={{ ...cellStyle, textAlign: "center", whiteSpace: "normal" }}>
                      <Text variant="body-default-m" onBackground="neutral-weak">
                        Try widening the date range or clearing the search.
                      </Text>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Column>

        <Row as="nav" aria-label="Pagination" fillWidth horizontal="between" vertical="center" gap="12" wrap>
          <Text variant="body-default-s" onBackground="neutral-weak">
            Page {current} of {pageCount}
          </Text>
          <Row gap="8">
            <Button variant="secondary" size="m" disabled={current <= 1} onClick={() => setPage(current - 1)}>
              Previous
            </Button>
            <Button variant="secondary" size="m" disabled={current >= pageCount} onClick={() => setPage(current + 1)}>
              Next
            </Button>
          </Row>
        </Row>
      </Column>
    </Column>
  );
}
