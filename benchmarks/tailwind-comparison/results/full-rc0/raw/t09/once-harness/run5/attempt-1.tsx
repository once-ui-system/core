"use client";

import {
  Button,
  Column,
  DataTable,
  DateRangeInput,
  Heading,
  Input,
  Row,
  SegmentedControl,
  Tag,
  Text,
} from "@once-ui-system/core";
import type { DataTableColumn, DataTableSort } from "@once-ui-system/core";
import { useMemo, useState } from "react";

type Status = "open" | "pending" | "resolved" | "escalated";
type Priority = "low" | "medium" | "high" | "urgent";

type Ticket = {
  id: string;
  subject: string;
  requester: string;
  email: string;
  status: Status;
  priority: Priority;
  assignee: string;
  updated: string; // ISO date (yyyy-mm-dd)
};

type StatusFilter = "all" | Status;

const tickets: Ticket[] = [
  { id: "TCK-2041", subject: "Cannot export invoices to CSV", requester: "Maya Lindqvist", email: "maya@northwind.io", status: "open", priority: "high", assignee: "Jonas Weber", updated: "2026-10-12" },
  { id: "TCK-2040", subject: "SSO login loop on Safari 19", requester: "Daniel Okoye", email: "daniel@brightpath.co", status: "escalated", priority: "urgent", assignee: "Priya Raman", updated: "2026-10-12" },
  { id: "TCK-2039", subject: "Update billing contact for Q4", requester: "Sofia Marchetti", email: "sofia@lumenlabs.eu", status: "resolved", priority: "low", assignee: "Tomás Herrera", updated: "2026-10-11" },
  { id: "TCK-2038", subject: "Webhook retries not firing", requester: "Ethan Caldwell", email: "ethan@stackforge.dev", status: "pending", priority: "high", assignee: "Priya Raman", updated: "2026-10-11" },
  { id: "TCK-2037", subject: "Add seats to the Team plan", requester: "Aiko Tanaka", email: "aiko@kitebox.jp", status: "open", priority: "medium", assignee: "Jonas Weber", updated: "2026-10-10" },
  { id: "TCK-2036", subject: "Dashboard charts show empty state", requester: "Lucas Moreau", email: "lucas@fernhill.fr", status: "open", priority: "medium", assignee: "Hannah Brooks", updated: "2026-10-10" },
  { id: "TCK-2035", subject: "Request for data processing addendum", requester: "Nora Eriksen", email: "nora@fjordworks.no", status: "pending", priority: "low", assignee: "Tomás Herrera", updated: "2026-10-09" },
  { id: "TCK-2034", subject: "API rate limit raised unexpectedly", requester: "Kwame Mensah", email: "kwame@oakridge.gh", status: "resolved", priority: "medium", assignee: "Priya Raman", updated: "2026-10-09" },
  { id: "TCK-2033", subject: "Two-factor codes arrive late", requester: "Isabella Rossi", email: "isabella@vantagepoint.it", status: "escalated", priority: "urgent", assignee: "Hannah Brooks", updated: "2026-10-08" },
  { id: "TCK-2032", subject: "Cannot invite users with plus-addresses", requester: "Oliver Smith", email: "oliver@harborlight.uk", status: "resolved", priority: "low", assignee: "Jonas Weber", updated: "2026-10-08" },
  { id: "TCK-2031", subject: "Mobile app crashes on upload", requester: "Chen Wei", email: "chen@riverstone.cn", status: "open", priority: "high", assignee: "Hannah Brooks", updated: "2026-10-07" },
  { id: "TCK-2030", subject: "Refund for duplicate charge", requester: "Amara Nwosu", email: "amara@sunbeam.ng", status: "pending", priority: "medium", assignee: "Tomás Herrera", updated: "2026-10-07" },
  { id: "TCK-2029", subject: "Custom domain stuck on verifying", requester: "Felix Berger", email: "felix@papertrail.de", status: "open", priority: "medium", assignee: "Priya Raman", updated: "2026-10-06" },
  { id: "TCK-2028", subject: "Audit log missing role changes", requester: "Grace Holloway", email: "grace@clearview.com", status: "escalated", priority: "high", assignee: "Jonas Weber", updated: "2026-10-05" },
  { id: "TCK-2027", subject: "Export scheduled reports as PDF", requester: "Mateo Alvarez", email: "mateo@solmar.es", status: "resolved", priority: "low", assignee: "Hannah Brooks", updated: "2026-10-05" },
  { id: "TCK-2026", subject: "Slack integration posts duplicates", requester: "Yuki Nakamura", email: "yuki@orbitdesk.jp", status: "pending", priority: "medium", assignee: "Tomás Herrera", updated: "2026-10-03" },
  { id: "TCK-2025", subject: "Timezone wrong in weekly digest", requester: "Priscilla Adeyemi", email: "priscilla@greenleaf.org", status: "resolved", priority: "low", assignee: "Priya Raman", updated: "2026-10-02" },
  { id: "TCK-2024", subject: "Bulk import fails at row 1,204", requester: "Henrik Sandberg", email: "henrik@nordlicht.se", status: "open", priority: "high", assignee: "Jonas Weber", updated: "2026-10-01" },
  { id: "TCK-2023", subject: "Need invoice in EUR instead of USD", requester: "Camille Dubois", email: "camille@atelier9.fr", status: "resolved", priority: "low", assignee: "Hannah Brooks", updated: "2026-09-29" },
  { id: "TCK-2022", subject: "Permission denied on shared folder", requester: "Rahul Mehta", email: "rahul@indigoworks.in", status: "pending", priority: "medium", assignee: "Tomás Herrera", updated: "2026-09-27" },
  { id: "TCK-2021", subject: "Search results ignore archived items", requester: "Elena Petrova", email: "elena@tundra.ru", status: "open", priority: "low", assignee: "Priya Raman", updated: "2026-09-25" },
  { id: "TCK-2020", subject: "Downtime during scheduled maintenance", requester: "Marcus Webb", email: "marcus@trailhead.us", status: "escalated", priority: "urgent", assignee: "Jonas Weber", updated: "2026-09-22" },
];

const statusMeta: Record<Status, { scheme: "info" | "warning" | "success" | "danger"; label: string }> = {
  open: { scheme: "info", label: "Open" },
  pending: { scheme: "warning", label: "Pending" },
  resolved: { scheme: "success", label: "Resolved" },
  escalated: { scheme: "danger", label: "Escalated" },
};

const priorityMeta: Record<Priority, { scheme: "neutral" | "info" | "warning" | "danger"; label: string; rank: number }> = {
  low: { scheme: "neutral", label: "Low", rank: 1 },
  medium: { scheme: "info", label: "Medium", rank: 2 },
  high: { scheme: "warning", label: "High", rank: 3 },
  urgent: { scheme: "danger", label: "Urgent", rank: 4 },
};

const statusOrder: Record<Status, number> = { escalated: 1, open: 2, pending: 3, resolved: 4 };

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

function formatDate(iso: string): string {
  return dateFormatter.format(new Date(`${iso}T00:00:00Z`));
}

/** Parse yyyy-mm-dd as a UTC-midnight timestamp, for stable comparisons. */
function isoToTime(iso: string): number {
  return new Date(`${iso}T00:00:00Z`).getTime();
}

/** A picked Date (local midnight) as the UTC timestamp of the same calendar day. */
function localDayToTime(date: Date): number {
  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
}

type Range = { startDate: Date | undefined; endDate: Date | undefined };

const columns: DataTableColumn<Ticket>[] = [
  {
    key: "subject",
    header: "Ticket",
    sortable: true,
    sort: (a, b) => a.subject.localeCompare(b.subject),
    cell: (row) => (
      <Column gap="4">
        <Text variant="label-default-s">{row.subject}</Text>
        <Text variant="body-default-xs" onBackground="neutral-weak">
          {row.id} · {row.requester}
        </Text>
      </Column>
    ),
  },
  {
    key: "status",
    header: "Status",
    sortable: true,
    sort: (a, b) => statusOrder[a.status] - statusOrder[b.status],
    cell: (row) => (
      <Tag size="s" scheme={statusMeta[row.status].scheme}>
        {statusMeta[row.status].label}
      </Tag>
    ),
  },
  {
    key: "priority",
    header: "Priority",
    sortable: true,
    sort: (a, b) => priorityMeta[a.priority].rank - priorityMeta[b.priority].rank,
    cell: (row) => (
      <Tag size="s" scheme={priorityMeta[row.priority].scheme}>
        {priorityMeta[row.priority].label}
      </Tag>
    ),
  },
  {
    key: "assignee",
    header: "Assignee",
    sortable: true,
    sort: (a, b) => a.assignee.localeCompare(b.assignee),
    cell: (row) => <Text variant="body-default-s">{row.assignee}</Text>,
  },
  {
    key: "updated",
    header: "Updated",
    sortable: true,
    align: "right",
    sort: (a, b) => a.updated.localeCompare(b.updated),
    cell: (row) => (
      <Text variant="body-default-s" onBackground="neutral-weak">
        {formatDate(row.updated)}
      </Text>
    ),
  },
];

export default function Page() {
  const [status, setStatus] = useState<StatusFilter>("all");
  const [query, setQuery] = useState("");
  const [range, setRange] = useState<Range>({ startDate: undefined, endDate: undefined });
  const [sort, setSort] = useState<DataTableSort | null>({ key: "updated", direction: "desc" });
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(8);

  const hasFilters =
    status !== "all" || query.trim() !== "" || range.startDate !== undefined || range.endDate !== undefined;

  const statusCounts = useMemo(() => {
    const counts: Record<StatusFilter, number> = { all: tickets.length, open: 0, pending: 0, resolved: 0, escalated: 0 };
    for (const ticket of tickets) counts[ticket.status] += 1;
    return counts;
  }, []);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const start = range.startDate ? localDayToTime(range.startDate) : undefined;
    const end = range.endDate ? localDayToTime(range.endDate) : undefined;

    return tickets.filter((ticket) => {
      if (status !== "all" && ticket.status !== status) return false;
      if (needle) {
        const haystack = `${ticket.subject} ${ticket.id} ${ticket.requester} ${ticket.email} ${ticket.assignee}`.toLowerCase();
        if (!haystack.includes(needle)) return false;
      }
      const time = isoToTime(ticket.updated);
      if (start !== undefined && time < start) return false;
      if (end !== undefined && time > end) return false;
      return true;
    });
  }, [status, query, range]);

  const sorted = useMemo(() => {
    if (!sort) return filtered;
    const column = columns.find((c) => c.key === sort.key);
    if (!column?.sort) return filtered;
    const compare = column.sort;
    const factor = sort.direction === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => compare(a, b) * factor);
  }, [filtered, sort]);

  const pageRows = useMemo(() => {
    const startIndex = (page - 1) * perPage;
    return sorted.slice(startIndex, startIndex + perPage);
  }, [sorted, page, perPage]);

  const clearFilters = () => {
    setStatus("all");
    setQuery("");
    setRange({ startDate: undefined, endDate: undefined });
    setPage(1);
  };

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
              Support tickets
            </Heading>
            <Text variant="body-default-s" onBackground="neutral-weak">
              Track, filter and triage customer requests across your support queue.
            </Text>
          </Column>
          <Button prefixIcon="plus">New ticket</Button>
        </Row>

        <Column background="surface" border radius="l" padding="16" gap="16" s={{ padding: "12" }}>
          <Column gap="8" fillWidth>
            <Text as="span" id="status-filter-label" variant="label-default-s" onBackground="neutral-weak">
              Status
            </Text>
            <SegmentedControl
              aria-labelledby="status-filter-label"
              compact
              value={status}
              onChange={(value) => {
                setStatus(value as StatusFilter);
                setPage(1);
              }}
              buttons={[
                { value: "all", label: `All (${statusCounts.all})` },
                { value: "open", label: `Open (${statusCounts.open})` },
                { value: "pending", label: `Pending (${statusCounts.pending})` },
                { value: "escalated", label: `Escalated (${statusCounts.escalated})` },
                { value: "resolved", label: `Resolved (${statusCounts.resolved})` },
              ]}
            />
          </Column>

          <Row fillWidth gap="16" vertical="end" s={{ direction: "column", vertical: "stretch" }}>
            <Column flex={1} fillWidth>
              <Input
                id="ticket-search"
                label="Search tickets"
                type="search"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setPage(1);
                }}
                description="Search by subject, ID, requester or assignee"
              />
            </Column>
            <Column flex={1} fillWidth>
              <DateRangeInput
                id="ticket-date-range"
                startLabel="Updated from"
                endLabel="Updated to"
                value={range}
                onChange={(next) => {
                  setRange({ startDate: next.startDate, endDate: next.endDate });
                  setPage(1);
                }}
              />
            </Column>
            <Row fit vertical="end" s={{ fillWidth: true, horizontal: "stretch" }}>
              <Button
                variant="secondary"
                prefixIcon="close"
                onClick={clearFilters}
                disabled={!hasFilters}
                fillWidth
              >
                Clear filters
              </Button>
            </Row>
          </Row>
        </Column>

        <Text variant="body-default-s" onBackground="neutral-weak" role="status" aria-live="polite">
          {sorted.length === 1 ? "1 ticket found" : `${sorted.length} tickets found`}
        </Text>

        <DataTable<Ticket>
          aria-label="Support tickets"
          columns={columns}
          rows={pageRows}
          getRowId={(row) => row.id}
          sort={sort}
          onSortChange={setSort}
          paginated
          page={page}
          onPageChange={setPage}
          perPage={perPage}
          onPerPageChange={(next) => {
            setPerPage(next);
            setPage(1);
          }}
          perPageOptions={[5, 8, 10, 20]}
          count={sorted.length}
          total={sorted.length}
          stickyHeader
          emptyState={
            <Column center gap="12" padding="32">
              <Text variant="label-default-m">No tickets match these filters</Text>
              <Text variant="body-default-s" onBackground="neutral-weak" align="center">
                Try a different status, widen the date range, or search for something else.
              </Text>
              <Button size="s" variant="secondary" onClick={clearFilters}>
                Clear all filters
              </Button>
            </Column>
          }
        />
      </Column>
    </Column>
  );
}
