```tsx
"use client";

import { useId, useMemo, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  X,
} from "lucide-react";

type Status = "Paid" | "Pending" | "Refunded" | "Failed";
type StatusFilter = "All" | Status;

interface Order {
  id: string;
  customer: string;
  email: string;
  date: string; // ISO yyyy-mm-dd
  amount: number;
  status: Status;
  method: string;
}

type SortKey = "id" | "customer" | "date" | "amount" | "status";
type SortDir = "asc" | "desc";

const ORDERS: Order[] = [
  { id: "ORD-10482", customer: "Amara Okafor", email: "amara.okafor@brightwave.io", date: "2025-03-28", amount: 1249.0, status: "Paid", method: "Visa •• 4242" },
  { id: "ORD-10481", customer: "Liam Fischer", email: "liam.fischer@northpeak.de", date: "2025-03-28", amount: 86.5, status: "Pending", method: "PayPal" },
  { id: "ORD-10480", customer: "Sofia Marchetti", email: "sofia@marchetti-studio.it", date: "2025-03-27", amount: 432.9, status: "Paid", method: "Mastercard •• 1881" },
  { id: "ORD-10479", customer: "Noah Williams", email: "noah.w@harborlane.com", date: "2025-03-26", amount: 59.0, status: "Failed", method: "Visa •• 0019" },
  { id: "ORD-10478", customer: "Yuki Tanaka", email: "y.tanaka@kumo-labs.jp", date: "2025-03-25", amount: 2310.75, status: "Paid", method: "Bank transfer" },
  { id: "ORD-10477", customer: "Elena Petrova", email: "elena.petrova@volgatech.ru", date: "2025-03-24", amount: 178.2, status: "Refunded", method: "Visa •• 7733" },
  { id: "ORD-10476", customer: "Mateo Alvarez", email: "mateo@alvarezgroup.mx", date: "2025-03-23", amount: 645.0, status: "Paid", method: "Mastercard •• 5520" },
  { id: "ORD-10475", customer: "Priya Nair", email: "priya.nair@lumenworks.in", date: "2025-03-22", amount: 94.99, status: "Pending", method: "UPI" },
  { id: "ORD-10474", customer: "Oliver Grant", email: "oliver.grant@fernhill.co.uk", date: "2025-03-21", amount: 1520.0, status: "Paid", method: "Amex •• 3005" },
  { id: "ORD-10473", customer: "Chloé Dubois", email: "chloe.dubois@atelier-nord.fr", date: "2025-03-20", amount: 312.4, status: "Paid", method: "Visa •• 9921" },
  { id: "ORD-10472", customer: "Kwame Mensah", email: "kwame@accracraft.gh", date: "2025-03-19", amount: 47.25, status: "Failed", method: "Mastercard •• 6104" },
  { id: "ORD-10471", customer: "Hannah Lindqvist", email: "hannah.l@fjordsoft.se", date: "2025-03-18", amount: 889.0, status: "Paid", method: "Visa •• 1156" },
  { id: "ORD-10470", customer: "Diego Ramirez", email: "diego.ramirez@solcafe.es", date: "2025-03-17", amount: 205.8, status: "Refunded", method: "PayPal" },
  { id: "ORD-10469", customer: "Isabella Rossi", email: "isabella.rossi@casaviva.it", date: "2025-03-15", amount: 73.0, status: "Paid", method: "Apple Pay" },
  { id: "ORD-10468", customer: "Ethan Brooks", email: "ethan.brooks@tidalcore.com", date: "2025-03-14", amount: 1975.5, status: "Pending", method: "Bank transfer" },
  { id: "ORD-10467", customer: "Fatima Al-Sayed", email: "fatima@sandstone.ae", date: "2025-03-13", amount: 560.0, status: "Paid", method: "Visa •• 8842" },
  { id: "ORD-10466", customer: "Lucas Meyer", email: "lucas.meyer@alpenwerk.ch", date: "2025-03-12", amount: 129.9, status: "Paid", method: "Mastercard •• 2290" },
  { id: "ORD-10465", customer: "Grace Kim", email: "grace.kim@seoulbyte.kr", date: "2025-03-11", amount: 38.0, status: "Failed", method: "Visa •• 4410" },
  { id: "ORD-10464", customer: "Tomás Silva", email: "tomas.silva@lisbonloom.pt", date: "2025-03-10", amount: 742.35, status: "Paid", method: "Google Pay" },
  { id: "ORD-10463", customer: "Aisha Khan", email: "aisha.khan@crescentlogic.pk", date: "2025-03-08", amount: 261.0, status: "Pending", method: "Visa •• 3367" },
  { id: "ORD-10462", customer: "Jack Thompson", email: "jack.t@redwoodsupply.com", date: "2025-03-07", amount: 3120.0, status: "Paid", method: "Bank transfer" },
  { id: "ORD-10461", customer: "Marta Kowalska", email: "marta.kowalska@wislaworks.pl", date: "2025-03-05", amount: 99.0, status: "Refunded", method: "Mastercard •• 7015" },
  { id: "ORD-10460", customer: "Samuel Osei", email: "samuel@kumasidesign.gh", date: "2025-03-04", amount: 415.6, status: "Paid", method: "Visa •• 5588" },
  { id: "ORD-10459", customer: "Emma Johansson", email: "emma.j@nordlicht.se", date: "2025-03-03", amount: 68.4, status: "Paid", method: "Apple Pay" },
  { id: "ORD-10458", customer: "Rahul Mehta", email: "rahul.mehta@orbitlane.in", date: "2025-03-02", amount: 1089.0, status: "Pending", method: "UPI" },
  { id: "ORD-10457", customer: "Zoe Martin", email: "zoe.martin@pixelharbor.ca", date: "2025-03-01", amount: 224.75, status: "Paid", method: "Visa •• 6671" },
  { id: "ORD-10456", customer: "Andre Costa", email: "andre.costa@vertexrio.br", date: "2025-02-27", amount: 530.0, status: "Failed", method: "Mastercard •• 4123" },
  { id: "ORD-10455", customer: "Nina Haas", email: "nina.haas@kleinbauer.at", date: "2025-02-25", amount: 147.0, status: "Paid", method: "PayPal" },
  { id: "ORD-10454", customer: "Omar Haddad", email: "omar.haddad@medinaworks.ma", date: "2025-02-22", amount: 799.9, status: "Paid", method: "Visa •• 2048" },
  { id: "ORD-10453", customer: "Lena Schmidt", email: "lena.schmidt@rheinblick.de", date: "2025-02-20", amount: 52.5, status: "Refunded", method: "Mastercard •• 9037" },
  { id: "ORD-10452", customer: "Daniel Cohen", email: "daniel.cohen@telaviv-ops.il", date: "2025-02-18", amount: 1640.0, status: "Paid", method: "Amex •• 1009" },
  { id: "ORD-10451", customer: "Mei Lin", email: "mei.lin@jadepeak.sg", date: "2025-02-15", amount: 318.0, status: "Pending", method: "Visa •• 7710" },
  { id: "ORD-10450", customer: "Victor Novak", email: "victor.novak@praguepress.cz", date: "2025-02-12", amount: 91.2, status: "Paid", method: "Mastercard •• 3382" },
];

const STATUS_OPTIONS: StatusFilter[] = ["All", "Paid", "Pending", "Refunded", "Failed"];
const PAGE_SIZES = [5, 10, 20] as const;

const STATUS_STYLES: Record<Status, string> = {
  Paid: "bg-emerald-50 text-emerald-800 ring-emerald-600/20",
  Pending: "bg-amber-50 text-amber-800 ring-amber-600/25",
  Refunded: "bg-slate-100 text-slate-700 ring-slate-500/20",
  Failed: "bg-rose-50 text-rose-800 ring-rose-600/20",
};

const STATUS_DOT: Record<Status, string> = {
  Paid: "bg-emerald-500",
  Pending: "bg-amber-500",
  Refunded: "bg-slate-400",
  Failed: "bg-rose-500",
};

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const dateFmt = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

function formatDate(iso: string): string {
  return dateFmt.format(new Date(`${iso}T00:00:00Z`));
}

function compare(a: Order, b: Order, key: SortKey): number {
  switch (key) {
    case "amount":
      return a.amount - b.amount;
    case "date":
      return a.date.localeCompare(b.date);
    default:
      return a[key].localeCompare(b[key]);
  }
}

function StatusBadge({ status }: { status: Status }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${STATUS_STYLES[status]}`}
    >
      <span aria-hidden="true" className={`size-1.5 rounded-full ${STATUS_DOT[status]}`} />
      {status}
    </span>
  );
}

function Segmented({
  label,
  options,
  value,
  onChange,
  counts,
}: {
  label: string;
  options: StatusFilter[];
  value: StatusFilter;
  onChange: (v: StatusFilter) => void;
  counts: Record<StatusFilter, number>;
}) {
  const refs = useRef<Array<HTMLButtonElement | null>>([]);

  function onKeyDown(e: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next = index;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = (index + 1) % options.length;
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = (index - 1 + options.length) % options.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = options.length - 1;
    else return;
    e.preventDefault();
    onChange(options[next]);
    refs.current[next]?.focus();
  }

  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="flex w-full overflow-x-auto rounded-lg bg-slate-100 p-1 sm:w-auto"
    >
      {options.map((opt, i) => {
        const selected = opt === value;
        return (
          <button
            key={opt}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(opt)}
            onKeyDown={(e) => onKeyDown(e, i)}
            className={`flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:flex-none ${
              selected ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {opt}
            <span
              className={`rounded-full px-1.5 text-xs tabular-nums ${
                selected ? "bg-slate-100 text-slate-700" : "text-slate-500"
              }`}
            >
              {counts[opt]}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function SortHeader({
  label,
  sortKey,
  active,
  dir,
  onSort,
  align = "left",
}: {
  label: string;
  sortKey: SortKey;
  active: boolean;
  dir: SortDir;
  onSort: (k: SortKey) => void;
  align?: "left" | "right";
}) {
  const Icon = !active ? ArrowUpDown : dir === "asc" ? ArrowUp : ArrowDown;
  return (
    <th
      scope="col"
      aria-sort={active ? (dir === "asc" ? "ascending" : "descending") : "none"}
      className={`px-4 py-3 ${align === "right" ? "text-right" : "text-left"}`}
    >
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className={`group inline-flex items-center gap-1.5 rounded text-xs font-semibold uppercase tracking-wide hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
          active ? "text-slate-900" : "text-slate-600"
        } ${align === "right" ? "flex-row-reverse" : ""}`}
      >
        {label}
        <Icon
          aria-hidden="true"
          className={`size-3.5 ${active ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600"}`}
        />
      </button>
    </th>
  );
}

export default function Page() {
  const uid = useId();
  const [status, setStatus] = useState<StatusFilter>("All");
  const [query, setQuery] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const rangeInvalid = from !== "" && to !== "" && from > to;

  // Rows matching search + date range (status counts are derived from these).
  const baseFiltered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ORDERS.filter((o) => {
      if (q && !`${o.id} ${o.customer} ${o.email}`.toLowerCase().includes(q)) return false;
      if (!rangeInvalid) {
        if (from && o.date < from) return false;
        if (to && o.date > to) return false;
      }
      return true;
    });
  }, [query, from, to, rangeInvalid]);

  const counts = useMemo(() => {
    const c: Record<StatusFilter, number> = {
      All: baseFiltered.length,
      Paid: 0,
      Pending: 0,
      Refunded: 0,
      Failed: 0,
    };
    for (const o of baseFiltered) c[o.status] += 1;
    return c;
  }, [baseFiltered]);

  const rows = useMemo(() => {
    const filtered = status === "All" ? baseFiltered : baseFiltered.filter((o) => o.status === status);
    const sorted = [...filtered].sort((a, b) => {
      const r = compare(a, b, sortKey);
      if (r !== 0) return sortDir === "asc" ? r : -r;
      return b.id.localeCompare(a.id);
    });
    return sorted;
  }, [baseFiltered, status, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIdx = (currentPage - 1) * pageSize;
  const pageRows = rows.slice(startIdx, startIdx + pageSize);
  const shownFrom = rows.length === 0 ? 0 : startIdx + 1;
  const shownTo = startIdx + pageRows.length;

  const hasFilters = status !== "All" || query !== "" || from !== "" || to !== "";

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "amount" || key === "date" ? "desc" : "asc");
    }
    setPage(1);
  }

  function clearFilters() {
    setStatus("All");
    setQuery("");
    setFrom("");
    setTo("");
    setPage(1);
  }

  const pageNumbers = useMemo(() => {
    const pages: Array<number | "gap-start" | "gap-end"> = [];
    const windowStart = Math.max(2, currentPage - 1);
    const windowEnd = Math.min(totalPages - 1, currentPage + 1);
    pages.push(1);
    if (windowStart > 2) pages.push("gap-start");
    for (let p = windowStart; p <= windowEnd; p++) pages.push(p);
    if (windowEnd < totalPages - 1) pages.push("gap-end");
    if (totalPages > 1) pages.push(totalPages);
    return pages;
  }, [currentPage, totalPages]);

  const pageBtn =
    "inline-flex size-9 items-center justify-center rounded-md text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:text-slate-300 disabled:hover:bg-transparent";

  const inputBase =
    "h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-500 focus-visible:border-indigo-600 focus-visible:outline-2 focus-visible:outline-indigo-600";

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Orders</h1>
          <p className="mt-1 text-sm text-slate-600">
            Review recent payments, track their status and find a specific customer or order.
          </p>
        </header>

        <section
          aria-label="Orders table"
          className="rounded-xl border border-slate-200 bg-white shadow-sm"
        >
          {/* Filters row */}
          <div className="flex flex-col gap-4 border-b border-slate-200 p-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex flex-col gap-1.5">
              <span id={`${uid}-status`} className="text-xs font-medium text-slate-600">
                Status
              </span>
              <Segmented
                label="Filter by status"
                options={STATUS_OPTIONS}
                value={status}
                counts={counts}
                onChange={(v) => {
                  setStatus(v);
                  setPage(1);
                }}
              />
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <fieldset className="min-w-0">
                <legend className="mb-1.5 text-xs font-medium text-slate-600">Order date</legend>
                <div className="flex items-center gap-2">
                  <label className="sr-only" htmlFor={`${uid}-from`}>
                    From date
                  </label>
                  <input
                    id={`${uid}-from`}
                    type="date"
                    value={from}
                    max={to || undefined}
                    onChange={(e) => {
                      setFrom(e.target.value);
                      setPage(1);
                    }}
                    aria-invalid={rangeInvalid}
                    aria-describedby={rangeInvalid ? `${uid}-range-error` : undefined}
                    className={`${inputBase} min-w-0 sm:w-40`}
                  />
                  <span aria-hidden="true" className="text-slate-500">
                    –
                  </span>
                  <label className="sr-only" htmlFor={`${uid}-to`}>
                    To date
                  </label>
                  <input
                    id={`${uid}-to`}
                    type="date"
                    value={to}
                    min={from || undefined}
                    onChange={(e) => {
                      setTo(e.target.value);
                      setPage(1);
                    }}
                    aria-invalid={rangeInvalid}
                    aria-describedby={rangeInvalid ? `${uid}-range-error` : undefined}
                    className={`${inputBase} min-w-0 sm:w-40`}
                  />
                </div>
              </fieldset>

              <div className="sm:w-64">
                <label htmlFor={`${uid}-search`} className="mb-1.5 block text-xs font-medium text-slate-600">
                  Search
                </label>
                <div className="relative">
                  <Search
                    aria-hidden="true"
                    className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500"
                  />
                  <input
                    id={`${uid}-search`}
                    type="search"
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setPage(1);
                    }}
                    placeholder="Customer, email or order ID"
                    autoComplete="off"
                    className={`${inputBase} pl-9`}
                  />
                </div>
              </div>
            </div>
          </div>

          {rangeInvalid && (
            <p
              id={`${uid}-range-error`}
              role="alert"
              className="border-b border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-800"
            >
              The start date is after the end date, so the date filter is being ignored.
            </p>
          )}

          {/* Active filter summary */}
          <div className="flex min-h-12 flex-wrap items-center justify-between gap-2 px-4 py-2 text-sm text-slate-600">
            <p aria-live="polite" role="status">
              {rows.length === 0
                ? "No orders match your filters"
                : `Showing ${shownFrom}–${shownTo} of ${rows.length} ${rows.length === 1 ? "order" : "orders"}`}
            </p>
            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center gap-1 rounded-md px-2 py-1 font-medium text-indigo-700 hover:bg-indigo-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                <X aria-hidden="true" className="size-4" />
                Clear filters
              </button>
            )}
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <caption className="sr-only">
                Orders, sorted by {sortKey} {sortDir === "asc" ? "ascending" : "descending"}
              </caption>
              <thead className="hidden border-y border-slate-200 bg-slate-50 md:table-header-group">
                <tr>
                  <SortHeader label="Order" sortKey="id" active={sortKey === "id"} dir={sortDir} onSort={handleSort} />
                  <SortHeader
                    label="Customer"
                    sortKey="customer"
                    active={sortKey === "customer"}
                    dir={sortDir}
                    onSort={handleSort}
                  />
                  <SortHeader label="Date" sortKey="date" active={sortKey === "date"} dir={sortDir} onSort={handleSort} />
                  <SortHeader
                    label="Status"
                    sortKey="status"
                    active={sortKey === "status"}
                    dir={sortDir}
                    onSort={handleSort}
                  />
                  <SortHeader
                    label="Amount"
                    sortKey="amount"
                    active={sortKey === "amount"}
                    dir={sortDir}
                    onSort={handleSort}
                    align="right"
                  />
                </tr>
              </thead>
              <tbody className="block divide-y divide-slate-100 md:table-row-group">
                {pageRows.map((o) => (
                  <tr
                    key={o.id}
                    className="grid grid-cols-2 gap-x-4 gap-y-1 px-4 py-3 hover:bg-slate-50 md:table-row md:p-0"
                  >
                    <td className="col-span-1 font-mono text-xs font-medium text-slate-900 md:table-cell md:px-4 md:py-3.5">
                      {o.id}
                    </td>
                    <td className="col-span-1 row-start-1 justify-self-end md:table-cell md:px-4 md:py-3.5 md:text-left md:hidden">
                      <StatusBadge status={o.status} />
                    </td>
                    <td className="col-span-2 md:table-cell md:px-4 md:py-3.5">
                      <div className="font-medium text-slate-900">{o.customer}</div>
                      <div className="truncate text-slate-600">{o.email}</div>
                    </td>
                    <td className="col-span-1 text-slate-700 md:table-cell md:px-4 md:py-3.5 md:whitespace-nowrap">
                      <time dateTime={o.date}>{formatDate(o.date)}</time>
                    </td>
                    <td className="hidden md:table-cell md:px-4 md:py-3.5">
                      <StatusBadge status={o.status} />
                    </td>
                    <td className="col-span-1 text-right font-medium tabular-nums text-slate-900 md:table-cell md:px-4 md:py-3.5">
                      {currency.format(o.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {pageRows.length === 0 && (
              <div className="flex flex-col items-center gap-2 px-4 py-16 text-center">
                <div className="flex size-10 items-center justify-center rounded-full bg-slate-100">
                  <Search aria-hidden="true" className="size-5 text-slate-500" />
                </div>
                <h2 className="text-base font-semibold">No orders found</h2>
                <p className="max-w-sm text-sm text-slate-600">
                  Try a different search term, widen the date range or pick another status.
                </p>
                {hasFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="mt-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Pagination */}
          <div className="flex flex-col gap-3 border-t border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <label htmlFor={`${uid}-size`}>Rows per page</label>
              <select
                id={`${uid}-size`}
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                className="h-9 rounded-lg border border-slate-300 bg-white px-2 text-sm text-slate-900 focus-visible:outline-2 focus-visible:outline-indigo-600"
              >
                {PAGE_SIZES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <nav aria-label="Pagination" className="flex items-center justify-between gap-1 sm:justify-end">
              <button
                type="button"
                className={pageBtn}
                onClick={() => setPage(1)}
                disabled={currentPage === 1}
                aria-label="First page"
              >
                <ChevronsLeft aria-hidden="true" className="size-4" />
              </button>
              <button
                type="button"
                className={pageBtn}
                onClick={() => setPage(currentPage - 1)}
                disabled={currentPage === 1}
                aria-label="Previous page"
              >
                <ChevronLeft aria-hidden="true" className="size-4" />
              </button>

              <ul className="hidden items-center gap-1 sm:flex">
                {pageNumbers.map((p) =>
                  typeof p === "number" ? (
                    <li key={p}>
                      <button
                        type="button"
                        onClick={() => setPage(p)}
                        aria-label={`Page ${p}`}
                        aria-current={p === currentPage ? "page" : undefined}
                        className={`${pageBtn} ${
                          p === currentPage ? "bg-indigo-600 text-white hover:bg-indigo-600" : ""
                        }`}
                      >
                        {p}
                      </button>
                    </li>
                  ) : (
                    <li key={p} aria-hidden="true" className="px-1 text-slate-500">
                      …
                    </li>
                  ),
                )}
              </ul>
              <span className="px-2 text-sm text-slate-600 sm:hidden">
                Page {currentPage} of {totalPages}
              </span>

              <button
                type="button"
                className={pageBtn}
                onClick={() => setPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                aria-label="Next page"
              >
                <ChevronRight aria-hidden="true" className="size-4" />
              </button>
              <button
                type="button"
                className={pageBtn}
                onClick={() => setPage(totalPages)}
                disabled={currentPage === totalPages}
                aria-label="Last page"
              >
                <ChevronsRight aria-hidden="true" className="size-4" />
              </button>
            </nav>
          </div>
        </section>

        {/* Mobile sort control (headers are hidden below md) */}
        <MobileSort sortKey={sortKey} sortDir={sortDir} onSort={handleSort} uid={uid} />
      </div>
    </main>
  );
}

function MobileSort({
  sortKey,
  sortDir,
  onSort,
  uid,
}: {
  sortKey: SortKey;
  sortDir: SortDir;
  onSort: (k: SortKey) => void;
  uid: string;
}) {
  const options: Array<{ key: SortKey; label: string }> = [
    { key: "date", label: "Date" },
    { key: "amount", label: "Amount" },
    { key: "customer", label: "Customer" },
    { key: "status", label: "Status" },
    { key: "id", label: "Order" },
  ];
  return (
    <div className="mt-4 flex items-center gap-2 text-sm text-slate-600 md:hidden">
      <label htmlFor={`${uid}-msort`}>Sort by</label>
      <select
        id={`${uid}-msort`}
        value={sortKey}
        onChange={(e) => onSort(e.target.value as SortKey)}
        className="h-9 rounded-lg border border-slate-300 bg-white px-2 text-sm text-slate-900 focus-visible:outline-2 focus-visible:outline-indigo-600"
      >
        {options.map((o) => (
          <option key={o.key} value={o.key}>
            {o.label}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        aria-label={`Sort direction: ${sortDir === "asc" ? "ascending" : "descending"}. Activate to reverse.`}
        className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 font-medium text-slate-800 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-indigo-600"
      >
        {sortDir === "asc" ? (
          <ArrowUp aria-hidden="true" className="size-4" />
        ) : (
          <ArrowDown aria-hidden="true" className="size-4" />
        )}
        {sortDir === "asc" ? "Ascending" : "Descending"}
      </button>
    </div>
  );
}
```