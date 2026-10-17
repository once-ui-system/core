"use client";

import {
  Button,
  Column,
  DateRangeInput,
  Heading,
  Icon,
  Input,
  Pagination,
  Row,
  SegmentedControl,
  Tag,
  Text,
} from "@once-ui-system/core";
import { useMemo, useState } from "react";

type Status = "paid" | "pending" | "overdue" | "draft";

type Invoice = {
  id: string;
  customer: string;
  email: string;
  amount: number;
  status: Status;
  issued: string; // ISO date yyyy-mm-dd
  due: string;
};

const invoices: Invoice[] = [
  { id: "INV-2041", customer: "Northwind Traders", email: "billing@northwind.example", amount: 12480, status: "paid", issued: "2025-09-02", due: "2025-10-02" },
  { id: "INV-2042", customer: "Lumen Robotics", email: "ap@lumenrobotics.example", amount: 3250.5, status: "pending", issued: "2025-09-05", due: "2025-10-05" },
  { id: "INV-2043", customer: "Harbor & Pine Co.", email: "accounts@harborpine.example", amount: 890, status: "overdue", issued: "2025-08-11", due: "2025-09-10" },
  { id: "INV-2044", customer: "Alder Health", email: "finance@alderhealth.example", amount: 21900, status: "paid", issued: "2025-09-09", due: "2025-10-09" },
  { id: "INV-2045", customer: "Quill Studio", email: "hello@quillstudio.example", amount: 1475, status: "draft", issued: "2025-09-12", due: "2025-10-12" },
  { id: "INV-2046", customer: "Meridian Freight", email: "pay@meridianfreight.example", amount: 7620.75, status: "pending", issued: "2025-09-14", due: "2025-10-14" },
  { id: "INV-2047", customer: "Saffron Kitchen Group", email: "office@saffronkitchen.example", amount: 640, status: "paid", issued: "2025-09-16", due: "2025-10-16" },
  { id: "INV-2048", customer: "Tidewater Labs", email: "ap@tidewaterlabs.example", amount: 15300, status: "overdue", issued: "2025-08-03", due: "2025-09-02" },
  { id: "INV-2049", customer: "Blue Ledger Partners", email: "billing@blueledger.example", amount: 4980, status: "paid", issued: "2025-09-19", due: "2025-10-19" },
  { id: "INV-2050", customer: "Fernhill Academy", email: "bursar@fernhill.example", amount: 2210, status: "pending", issued: "2025-09-21", due: "2025-10-21" },
  { id: "INV-2051", customer: "Copperline Energy", email: "payables@copperline.example", amount: 38750, status: "paid", issued: "2025-09-23", due: "2025-10-23" },
  { id: "INV-2052", customer: "Orchard Digital", email: "team@orcharddigital.example", amount: 1180, status: "draft", issued: "2025-09-25", due: "2025-10-25" },
  { id: "INV-2053", customer: "Kestrel Aviation", email: "ap@kestrelaviation.example", amount: 9420, status: "pending", issued: "2025-09-27", due: "2025-10-27" },
  { id: "INV-2054", customer: "Willow & Reed Legal", email: "accounts@willowreed.example", amount: 5600, status: "overdue", issued: "2025-08-19", due: "2025-09-18" },
  { id: "INV-2055", customer: "Granite Peak Outfitters", email: "finance@granitepeak.example", amount: 2875, status: "paid", issued: "2025-10-01", due: "2025-10-31" },
  { id: "INV-2056", customer: "Nimbus Cloud Services", email: "billing@nimbus.example", amount: 18640, status: "pending", issued: "2025-10-03", due: "2025-11-02" },
  { id: "INV-2057", customer: "Velvet Roast Coffee", email: "owner@velvetroast.example", amount: 415.25, status: "paid", issued: "2025-10-05", due: "2025-11-04" },
  { id: "INV-2058", customer: "Atlas Surveying", email: "ap@atlassurvey.example", amount: 6730, status: "draft", issued: "2025-10-07", due: "2025-11-06" },
  { id: "INV-2059", customer: "Juniper Design House", email: "pay@juniperdesign.example", amount: 3090, status: "overdue", issued: "2025-08-28", due: "2025-09-27" },
  { id: "INV-2060", customer: "Summit Dental Group", email: "office@summitdental.example", amount: 11250, status: "paid", issued: "2025-10-09", due: "2025-11-08" },
  { id: "INV-2061", customer: "Cobalt Analytics", email: "finance@cobaltanalytics.example", amount: 27400, status: "pending", issued: "2025-10-11", due: "2025-11-10" },
  { id: "INV-2062", customer: "Marlow Bakery", email: "hello@marlowbakery.example", amount: 520, status: "paid", issued: "2025-10-13", due: "2025-11-12" },
  { id: "INV-2063", customer: "Ironbridge Logistics", email: "ap@ironbridge.example", amount: 14890, status: "pending", issued: "2025-10-15", due: "2025-11-14" },
  { id: "INV-2064", customer: "Seaglass Hotels", email: "accounts@seaglass.example", amount: 33200, status: "paid", issued: "2025-10-17", due: "2025-11-16" },
  { id: "INV-2065", customer: "Pinecone Pediatrics", email: "billing@pineconeped.example", amount: 1960, status: "draft", issued: "2025-10-19", due: "2025-11-18" },
];

const statusTag: Record<Status, { scheme: "success" | "warning" | "danger" | "neutral"; label: string }> = {
  paid: { scheme: "success", label: "Paid" },
  pending: { scheme: "warning", label: "Pending" },
  overdue: { scheme: "danger", label: "Overdue" },
  draft: { scheme: "neutral", label: "Draft" },
};

type StatusFilter = "all" | Status;
type SortKey = "id" | "customer" | "status" | "issued" | "amount";
type SortDir = "asc" | "desc";

type Column_ = {
  key: SortKey;
  label: string;
  align: "left" | "right";
  hideOnSmall?: boolean;
};

const columns: Column_[] = [
  { key: "id", label: "Invoice", align: "left" },
  { key: "customer", label: "Customer", align: "left" },
  { key: "status", label: "Status", align: "left" },
  { key: "issued", label: "Issued", align: "left" },
  { key: "amount", label: "Amount", align: "right" },
];

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const dateFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

function formatIso(iso: string): string {
  return dateFormat.format(new Date(`${iso}T00:00:00Z`));
}

function toIsoDay(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

const statusOrder: Record<Status, number> = { paid: 0, pending: 1, overdue: 2, draft: 3 };

const cellStyle: React.CSSProperties = {
  padding: "12px 16px",
  textAlign: "left",
  verticalAlign: "middle",
  borderBottom: "1px solid var(--neutral-alpha-weak)",
  whiteSpace: "nowrap",
};

export default function Page() {
  const [status, setStatus] = useState<StatusFilter>("all");
  const [query, setQuery] = useState("");
  const [range, setRange] = useState<{ startDate: Date | undefined; endDate: Date | undefined }>({
    startDate: undefined,
    endDate: undefined,
  });
  const [sortKey, setSortKey] = useState<SortKey>("issued");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(8);

  const counts = useMemo(() => {
    const c: Record<StatusFilter, number> = { all: invoices.length, paid: 0, pending: 0, overdue: 0, draft: 0 };
    for (const inv of invoices) c[inv.status] += 1;
    return c;
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const start = range.startDate ? toIsoDay(range.startDate) : undefined;
    const end = range.endDate ? toIsoDay(range.endDate) : undefined;
    const list = invoices.filter((inv) => {
      if (status !== "all" && inv.status !== status) return false;
      if (start && inv.issued < start) return false;
      if (end && inv.issued > end) return false;
      if (q && !`${inv.id} ${inv.customer} ${inv.email}`.toLowerCase().includes(q)) return false;
      return true;
    });
    const dir = sortDir === "asc" ? 1 : -1;
    return [...list].sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "amount":
          cmp = a.amount - b.amount;
          break;
        case "status":
          cmp = statusOrder[a.status] - statusOrder[b.status];
          break;
        case "issued":
          cmp = a.issued.localeCompare(b.issued);
          break;
        case "customer":
          cmp = a.customer.localeCompare(b.customer);
          break;
        default:
          cmp = a.id.localeCompare(b.id);
      }
      return cmp * dir || a.id.localeCompare(b.id);
    });
  }, [status, query, range, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * perPage;
  const pageRows = filtered.slice(startIndex, startIndex + perPage);
  const filtersActive =
    status !== "all" || query.trim() !== "" || range.startDate !== undefined || range.endDate !== undefined;

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "amount" || key === "issued" ? "desc" : "asc");
    }
    setPage(1);
  };

  const clearFilters = () => {
    setStatus("all");
    setQuery("");
    setRange({ startDate: undefined, endDate: undefined });
    setPage(1);
  };

  const totalShown = filtered.reduce((sum, inv) => sum + inv.amount, 0);

  return (
    <Column as="main" fillWidth horizontal="center" paddingY="48" paddingX="24" s={{ paddingY: "24", paddingX: "16" }}>
      <Column maxWidth="l" gap="24">
        <Row
          fillWidth
          horizontal="between"
          vertical="end"
          gap="16"
          s={{ direction: "column", horizontal: "start", vertical: "start" }}
        >
          <Column gap="8">
            <Heading as="h1" variant="display-strong-xs">
              Invoices
            </Heading>
            <Text variant="body-default-s" onBackground="neutral-weak">
              Track what has been billed, paid and is still outstanding across your customers.
            </Text>
          </Column>
          <Button prefixIcon="plus">New invoice</Button>
        </Row>

        <Column background="surface" border radius="l" padding="16" gap="16" s={{ padding: "12" }}>
          <Row fillWidth gap="16" vertical="end" wrap s={{ direction: "column", vertical: "stretch" }}>
            <Column gap="8" s={{ fillWidth: true }}>
              <Text as="span" id="status-filter-label" variant="label-default-s" onBackground="neutral-weak">
                Status
              </Text>
              <div role="group" aria-labelledby="status-filter-label">
                <SegmentedControl
                  fillWidth={false}
                  compact
                  value={status}
                  onChange={(value) => {
                    setStatus(value as StatusFilter);
                    setPage(1);
                  }}
                  buttons={[
                    { value: "all", label: `All (${counts.all})` },
                    { value: "paid", label: `Paid (${counts.paid})` },
                    { value: "pending", label: `Pending (${counts.pending})` },
                    { value: "overdue", label: `Overdue (${counts.overdue})` },
                    { value: "draft", label: `Draft (${counts.draft})` },
                  ]}
                />
              </div>
            </Column>

            <Column flex={1} minWidth={16} gap="8" s={{ fillWidth: true }}>
              <DateRangeInput
                id="issued-range"
                startLabel="Issued from"
                endLabel="Issued to"
                value={range}
                onChange={(next) => {
                  setRange(next);
                  setPage(1);
                }}
              />
            </Column>

            <Column flex={1} minWidth={16} s={{ fillWidth: true }}>
              <Input
                id="invoice-search"
                label="Search invoices"
                type="search"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setPage(1);
                }}
                prefix={<Icon name="search" size="xs" onBackground="neutral-weak" />}
              />
            </Column>
          </Row>

          <Row fillWidth horizontal="between" vertical="center" gap="12" wrap>
            <Text variant="body-default-s" onBackground="neutral-weak" aria-live="polite" role="status">
              {filtered.length === 0
                ? "No invoices to show"
                : `${filtered.length} ${filtered.length === 1 ? "invoice" : "invoices"} · ${currency.format(totalShown)} total`}
            </Text>
            {filtersActive && (
              <Button size="s" variant="tertiary" prefixIcon="close" onClick={clearFilters}>
                Clear filters
              </Button>
            )}
          </Row>
        </Column>

        <Column background="surface" border radius="l" overflow="hidden">
          <div
            style={{ overflowX: "auto", width: "100%" }}
            tabIndex={0}
            role="region"
            aria-label="Invoices table, scrollable"
          >
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 640 }}>
              <caption style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>
                Invoices, sorted by {columns.find((c) => c.key === sortKey)?.label.toLowerCase()}{" "}
                {sortDir === "asc" ? "ascending" : "descending"}
              </caption>
              <thead>
                <tr>
                  {columns.map((col) => {
                    const active = col.key === sortKey;
                    return (
                      <th
                        key={col.key}
                        scope="col"
                        aria-sort={active ? (sortDir === "asc" ? "ascending" : "descending") : "none"}
                        style={{
                          ...cellStyle,
                          textAlign: col.align,
                          background: "var(--neutral-alpha-weak)",
                          padding: 0,
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => handleSort(col.key)}
                          style={{
                            all: "unset",
                            boxSizing: "border-box",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: col.align === "right" ? "flex-end" : "flex-start",
                            gap: 6,
                            width: "100%",
                            padding: "12px 16px",
                            cursor: "pointer",
                            fontSize: "var(--font-size-label-s)",
                            fontWeight: 600,
                            color: active ? "var(--neutral-on-background-strong)" : "var(--neutral-on-background-medium)",
                          }}
                        >
                          <span>{col.label}</span>
                          <Icon
                            name={active ? (sortDir === "asc" ? "chevronUp" : "chevronDown") : "chevronsLeftRight"}
                            size="xs"
                            style={{ opacity: active ? 1 : 0.5, transform: active ? undefined : "rotate(90deg)" }}
                          />
                          <span
                            style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}
                          >
                            {active
                              ? `, sorted ${sortDir === "asc" ? "ascending" : "descending"}. Activate to reverse.`
                              : ", not sorted. Activate to sort."}
                          </span>
                        </button>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {pageRows.map((inv) => (
                  <tr key={inv.id}>
                    <td style={cellStyle}>
                      <Text variant="code-default-s">{inv.id}</Text>
                    </td>
                    <td style={cellStyle}>
                      <Column gap="4">
                        <Text variant="label-default-s">{inv.customer}</Text>
                        <Text variant="body-default-xs" onBackground="neutral-weak">
                          {inv.email}
                        </Text>
                      </Column>
                    </td>
                    <td style={cellStyle}>
                      <Tag size="s" scheme={statusTag[inv.status].scheme}>
                        {statusTag[inv.status].label}
                      </Tag>
                    </td>
                    <td style={cellStyle}>
                      <Column gap="4">
                        <Text variant="body-default-s">{formatIso(inv.issued)}</Text>
                        <Text variant="body-default-xs" onBackground="neutral-weak">
                          Due {formatIso(inv.due)}
                        </Text>
                      </Column>
                    </td>
                    <td style={{ ...cellStyle, textAlign: "right" }}>
                      <Text variant="label-default-s" style={{ fontVariantNumeric: "tabular-nums" }}>
                        {currency.format(inv.amount)}
                      </Text>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pageRows.length === 0 && (
            <Column center gap="12" padding="40">
              <Icon name="inbox" size="l" onBackground="neutral-weak" />
              <Text variant="body-default-s" onBackground="neutral-weak" align="center">
                No invoices match your filters.
              </Text>
              <Button size="s" variant="secondary" onClick={clearFilters}>
                Clear filters
              </Button>
            </Column>
          )}

          <Row
            fillWidth
            horizontal="between"
            vertical="center"
            gap="16"
            padding="16"
            borderTop
            wrap
            s={{ direction: "column", horizontal: "center" }}
          >
            <Text variant="body-default-s" onBackground="neutral-weak">
              {filtered.length === 0
                ? "Showing 0 of 0"
                : `Showing ${startIndex + 1}–${Math.min(startIndex + perPage, filtered.length)} of ${filtered.length}`}
            </Text>
            <Pagination
              aria-label="Invoices pagination"
              page={currentPage}
              total={totalPages}
              onChange={setPage}
              perPage={perPage}
              perPageOptions={[5, 8, 12]}
              onPerPageChange={(value) => {
                setPerPage(value);
                setPage(1);
              }}
              size="s"
            />
          </Row>
        </Column>
      </Column>
    </Column>
  );
}
