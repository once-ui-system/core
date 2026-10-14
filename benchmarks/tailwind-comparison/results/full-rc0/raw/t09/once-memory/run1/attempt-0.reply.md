```tsx
"use client";

import { useId, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { Column, Row, Heading, Text, Button, Input, SegmentedControl } from "@once-ui-system/core";

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

type SortKey = "id" | "customer" | "plan" | "amount" | "status" | "date";
type SortDir = "asc" | "desc";

const INVOICES: Invoice[] = [
  { id: "INV-1048", customer: "Marta Kowalska", email: "marta@northwind.example", plan: "Business", amount: 480, status: "Paid", date: "2025-06-28" },
  { id: "INV-1047", customer: "Devon Clarke", email: "devon@harborlabs.example", plan: "Starter", amount: 49, status: "Pending", date: "2025-06-26" },
  { id: "INV-1046", customer: "Aiko Tanaka", email: "aiko@lumenworks.example", plan: "Enterprise", amount: 2400, status: "Paid", date: "2025-06-25" },
  { id: "INV-1045", customer: "Luca Ferrari", email: "luca@ferrarimotori.example", plan: "Business", amount: 480, status: "Overdue", date: "2025-06-21" },
  { id: "INV-1044", customer: "Priya Natarajan", email: "priya@cobaltsoft.example", plan: "Team", amount: 180, status: "Paid", date: "2025-06-19" },
  { id: "INV-1043", customer: "Samuel Okafor", email: "sam@brightpath.example", plan: "Starter", amount: 49, status: "Refunded", date: "2025-06-17" },
  { id: "INV-1042", customer: "Elena Petrova", email: "elena@glasshouse.example", plan: "Team", amount: 180, status: "Paid", date: "2025-06-14" },
  { id: "INV-1041", customer: "Jonas Lindqvist", email: "jonas@fjordtech.example", plan: "Enterprise", amount: 2400, status: "Pending", date: "2025-06-12" },
  { id: "INV-1040", customer: "Camila Reyes", email: "camila@solmarket.example", plan: "Business", amount: 480, status: "Paid", date: "2025-06-10" },
  { id: "INV-1039", customer: "Oliver Grant", email: "oliver@grantandco.example", plan: "Starter", amount: 49, status: "Overdue", date: "2025-06-08" },
  { id: "INV-1038", customer: "Nadia Haddad", email: "nadia@oasisdata.example", plan: "Team", amount: 180, status: "Paid", date: "2025-06-05" },
  { id: "INV-1037", customer: "Tobias Weber", email: "tobias@weberbau.example", plan: "Business", amount: 480, status: "Pending", date: "2025-06-03" },
  { id: "INV-1036", customer: "Hana Suzuki", email: "hana@kumoapps.example", plan: "Enterprise", amount: 2400, status: "Paid", date: "2025-05-30" },
  { id: "INV-1035", customer: "Ricardo Mendes", email: "ricardo@atlanticfreight.example", plan: "Team", amount: 180, status: "Refunded", date: "2025-05-27" },
  { id: "INV-1034", customer: "Freya Johansson", email: "freya@nordlicht.example", plan: "Starter", amount: 49, status: "Paid", date: "2025-05-24" },
  { id: "INV-1033", customer: "Ibrahim Yusuf", email: "ibrahim@savannacloud.example", plan: "Business", amount: 480, status: "Paid", date: "2025-05-21" },
  { id: "INV-1032", customer: "Chloe Martin", email: "chloe@atelierm.example", plan: "Team", amount: 180, status: "Overdue", date: "2025-05-18" },
  { id: "INV-1031", customer: "Mateo Silva", email: "mateo@vientodigital.example", plan: "Starter", amount: 49, status: "Paid", date: "2025-05-15" },
  { id: "INV-1030", customer: "Grace Liu", email: "grace@pinecrest.example", plan: "Enterprise", amount: 2400, status: "Paid", date: "2025-05-12" },
  { id: "INV-1029", customer: "Anders Holm", email: "anders@holmlogistics.example", plan: "Business", amount: 480, status: "Pending", date: "2025-05-09" },
  { id: "INV-1028", customer: "Sofia Greco", email: "sofia@grecodesign.example", plan: "Team", amount: 180, status: "Paid", date: "2025-05-06" },
  { id: "INV-1027", customer: "Kwame Mensah", email: "kwame@goldcoastpay.example", plan: "Starter", amount: 49, status: "Paid", date: "2025-05-03" },
  { id: "INV-1026", customer: "Isabel Duarte", email: "isabel@duartewines.example", plan: "Business", amount: 480, status: "Refunded", date: "2025-04-29" },
  { id: "INV-1025", customer: "Noah Fischer", email: "noah@fischeranalytics.example", plan: "Team", amount: 180, status: "Paid", date: "2025-04-25" },
];

const PAGE_SIZE = 8;

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "Paid", label: "Paid" },
  { value: "Pending", label: "Pending" },
  { value: "Overdue", label: "Overdue" },
  { value: "Refunded", label: "Refunded" },
];

const COLUMNS: { key: SortKey; label: string; align?: "right" }[] = [
  { key: "id", label: "Invoice" },
  { key: "customer", label: "Customer" },
  { key: "plan", label: "Plan" },
  { key: "status", label: "Status" },
  { key: "date", label: "Issued" },
  { key: "amount", label: "Amount", align: "right" },
];

const STATUS_COLOR: Record<Status, string> = {
  Paid: "var(--success-on-background-strong, #1a7f4b)",
  Pending: "var(--warning-on-background-strong, #9a6700)",
  Overdue: "var(--danger-on-background-strong, #c0332b)",
  Refunded: "var(--neutral-on-background-medium, #667085)",
};

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

const nativeFieldStyle: CSSProperties = {
  height: "2.5rem",
  padding: "0 0.75rem",
  borderRadius: "0.5rem",
  border: "1px solid var(--neutral-alpha-medium, rgba(128,128,128,0.4))",
  background: "var(--surface-background, transparent)",
  color: "var(--neutral-on-background-strong, inherit)",
  font: "inherit",
  fontSize: "0.875rem",
  minWidth: 0,
};

export default function Page() {
  const uid = useId();
  const [status, setStatus] = useState<StatusFilter>("all");
  const [query, setQuery] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return INVOICES.filter((inv) => {
      if (status !== "all" && inv.status !== status) return false;
      if (from && inv.date < from) return false;
      if (to && inv.date > to) return false;
      if (q && !`${inv.id} ${inv.customer} ${inv.email} ${inv.plan}`.toLowerCase().includes(q)) return false;
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
  const rangeError = from !== "" && to !== "" && from > to;

  const handleSort = (key: SortKey) => {
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
    setQuery("");
    setFrom("");
    setTo("");
    setPage(1);
  };

  const hasFilters = status !== "all" || query !== "" || from !== "" || to !== "";
  const totalShown = filtered.reduce((sum, inv) => sum + inv.amount, 0);

  return (
    <Column
      as="main"
      fillWidth
      horizontal="center"
      paddingX="16"
      paddingY="32"
      style={{ boxSizing: "border-box" }}
    >
      <Column fillWidth gap="24" style={{ maxWidth: "72rem" }}>
        <Column gap="8">
          <Heading as="h1" variant="display-strong-s">
            Invoices
          </Heading>
          <Text variant="body-default-m" onBackground="neutral-weak">
            Track billing across customers. Sort by any column, filter by status or issue date, and search by
            customer, email or invoice number.
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
          <Row gap="16" wrap vertical="end">
            <Column gap="8" style={{ flex: "1 1 16rem", minWidth: 0 }}>
              <Text as="span" variant="label-default-s" onBackground="neutral-weak" id={`${uid}-status`}>
                Status
              </Text>
              <div role="group" aria-labelledby={`${uid}-status`} style={{ maxWidth: "100%", overflowX: "auto" }}>
                <SegmentedControl
                  buttons={STATUS_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
                  selected={status}
                  onToggle={(value) => {
                    setStatus(value as StatusFilter);
                    setPage(1);
                  }}
                />
              </div>
            </Column>

            <Row gap="12" wrap vertical="end" style={{ flex: "1 1 18rem", minWidth: 0 }}>
              <Column gap="8" style={{ flex: "1 1 8rem", minWidth: 0 }}>
                <label htmlFor={`${uid}-from`}>
                  <Text as="span" variant="label-default-s" onBackground="neutral-weak">
                    From
                  </Text>
                </label>
                <input
                  id={`${uid}-from`}
                  type="date"
                  value={from}
                  max={to || undefined}
                  aria-invalid={rangeError}
                  onChange={(e) => {
                    setFrom(e.target.value);
                    setPage(1);
                  }}
                  style={nativeFieldStyle}
                />
              </Column>
              <Column gap="8" style={{ flex: "1 1 8rem", minWidth: 0 }}>
                <label htmlFor={`${uid}-to`}>
                  <Text as="span" variant="label-default-s" onBackground="neutral-weak">
                    To
                  </Text>
                </label>
                <input
                  id={`${uid}-to`}
                  type="date"
                  value={to}
                  min={from || undefined}
                  aria-invalid={rangeError}
                  onChange={(e) => {
                    setTo(e.target.value);
                    setPage(1);
                  }}
                  style={nativeFieldStyle}
                />
              </Column>
            </Row>
          </Row>

          <Row gap="12" wrap vertical="end">
            <div style={{ flex: "1 1 16rem", minWidth: 0 }}>
              <Input
                id={`${uid}-search`}
                label="Search invoices"
                type="search"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <Button variant="secondary" size="l" onClick={resetFilters} disabled={!hasFilters}>
              Reset filters
            </Button>
          </Row>

          {rangeError && (
            <Text role="alert" variant="body-default-s" onBackground="danger-strong">
              The start date must be on or before the end date.
            </Text>
          )}
        </Column>

        <Column gap="12">
          <Row horizontal="between" vertical="center" wrap gap="8">
            <Text variant="body-default-s" onBackground="neutral-weak" aria-live="polite">
              {filtered.length === 0
                ? "No invoices match"
                : `Showing ${startIdx + 1}–${startIdx + rows.length} of ${filtered.length} invoices`}
            </Text>
            <Text variant="body-strong-s">Total shown: {currency.format(totalShown)}</Text>
          </Row>

          <div
            role="region"
            aria-label="Invoices table"
            tabIndex={0}
            style={{
              overflowX: "auto",
              borderRadius: "1rem",
              border: "1px solid var(--neutral-alpha-medium, rgba(128,128,128,0.3))",
              background: "var(--surface-background, transparent)",
            }}
          >
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "44rem", fontSize: "0.875rem" }}>
              <caption style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>
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
                          textAlign: col.align ?? "left",
                          padding: 0,
                          borderBottom: "1px solid var(--neutral-alpha-medium, rgba(128,128,128,0.3))",
                          background: "var(--neutral-alpha-weak, rgba(128,128,128,0.08))",
                          whiteSpace: "nowrap",
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => handleSort(col.key)}
                          style={{
                            all: "unset",
                            boxSizing: "border-box",
                            width: "100%",
                            cursor: "pointer",
                            padding: "0.75rem 1rem",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.375rem",
                            justifyContent: col.align === "right" ? "flex-end" : "flex-start",
                            fontWeight: 600,
                            fontSize: "0.8125rem",
                            color: "var(--neutral-on-background-strong, inherit)",
                          }}
                        >
                          {col.label}
                          <span aria-hidden="true" style={{ opacity: active ? 1 : 0.35, width: "1ch" }}>
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
                      <Column gap="12" horizontal="center">
                        <Text variant="body-strong-m">No invoices found</Text>
                        <Text variant="body-default-s" onBackground="neutral-weak">
                          Try widening the date range or clearing your search.
                        </Text>
                        <Button variant="secondary" size="s" onClick={resetFilters}>
                          Reset filters
                        </Button>
                      </Column>
                    </td>
                  </tr>
                ) : (
                  rows.map((inv) => (
                    <tr
                      key={inv.id}
                      style={{ borderBottom: "1px solid var(--neutral-alpha-weak, rgba(128,128,128,0.15))" }}
                    >
                      <th
                        scope="row"
                        style={{ textAlign: "left", padding: "0.75rem 1rem", fontWeight: 600, whiteSpace: "nowrap" }}
                      >
                        {inv.id}
                      </th>
                      <td style={{ padding: "0.75rem 1rem" }}>
                        <div style={{ fontWeight: 500 }}>{inv.customer}</div>
                        <div style={{ fontSize: "0.75rem", opacity: 0.7 }}>{inv.email}</div>
                      </td>
                      <td style={{ padding: "0.75rem 1rem" }}>{inv.plan}</td>
                      <td style={{ padding: "0.75rem 1rem" }}>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.375rem",
                            fontWeight: 500,
                            color: STATUS_COLOR[inv.status],
                          }}
                        >
                          <span
                            aria-hidden="true"
                            style={{
                              width: "0.5rem",
                              height: "0.5rem",
                              borderRadius: "50%",
                              background: "currentColor",
                            }}
                          />
                          {inv.status}
                        </span>
                      </td>
                      <td style={{ padding: "0.75rem 1rem", whiteSpace: "nowrap" }}>
                        <time dateTime={inv.date}>{formatDate(inv.date)}</time>
                      </td>
                      <td
                        style={{
                          padding: "0.75rem 1rem",
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
            </table>
          </div>

          <nav aria-label="Pagination">
            <Row horizontal="between" vertical="center" gap="12" wrap>
              <Text variant="body-default-s" onBackground="neutral-weak">
                Page {currentPage} of {pageCount}
              </Text>
              <Row gap="8" vertical="center" wrap>
                <Button
                  variant="secondary"
                  size="s"
                  disabled={currentPage <= 1}
                  onClick={() => setPage(currentPage - 1)}
                  aria-label="Previous page"
                >
                  Previous
                </Button>
                {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
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
                  disabled={currentPage >= pageCount}
                  onClick={() => setPage(currentPage + 1)}
                  aria-label="Next page"
                >
                  Next
                </Button>
              </Row>
            </Row>
          </nav>
        </Column>
      </Column>
    </Column>
  );
}
```