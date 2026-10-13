"use client";

import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, Search } from "lucide-react";

type Status = "Paid" | "Pending" | "Refunded";

type Order = {
  id: string;
  customer: string;
  email: string;
  date: string; // ISO yyyy-mm-dd
  status: Status;
  total: number;
};

const ORDERS: Order[] = [
  { id: "ORD-10482", customer: "Amara Okafor", email: "amara.okafor@northwind.example", date: "2026-09-28", status: "Paid", total: 1249.0 },
  { id: "ORD-10481", customer: "Liam Fischer", email: "liam.fischer@brightloop.example", date: "2026-09-27", status: "Pending", total: 389.5 },
  { id: "ORD-10480", customer: "Sofia Marchetti", email: "sofia@marchetti-design.example", date: "2026-09-27", status: "Paid", total: 74.99 },
  { id: "ORD-10479", customer: "Kenji Watanabe", email: "kenji.w@harborlabs.example", date: "2026-09-25", status: "Refunded", total: 219.0 },
  { id: "ORD-10478", customer: "Priya Raman", email: "priya.raman@lumenworks.example", date: "2026-09-24", status: "Paid", total: 2150.75 },
  { id: "ORD-10477", customer: "Mateo Alvarez", email: "mateo.alvarez@solstice.example", date: "2026-09-22", status: "Paid", total: 58.2 },
  { id: "ORD-10476", customer: "Hannah Becker", email: "hannah.becker@fernhill.example", date: "2026-09-21", status: "Pending", total: 912.4 },
  { id: "ORD-10475", customer: "Tomasz Nowak", email: "tomasz.nowak@kestrel.example", date: "2026-09-19", status: "Paid", total: 640.0 },
  { id: "ORD-10474", customer: "Elena Petrova", email: "elena.p@quartzbay.example", date: "2026-09-18", status: "Refunded", total: 129.99 },
  { id: "ORD-10473", customer: "Noah Bennett", email: "noah.bennett@tidepool.example", date: "2026-09-16", status: "Paid", total: 335.0 },
  { id: "ORD-10472", customer: "Chloe Dubois", email: "chloe.dubois@atelier-nord.example", date: "2026-09-15", status: "Paid", total: 1780.0 },
  { id: "ORD-10471", customer: "Rashid Khan", email: "rashid.khan@meridian.example", date: "2026-09-13", status: "Pending", total: 96.5 },
  { id: "ORD-10470", customer: "Isabella Rossi", email: "isabella.rossi@piazza.example", date: "2026-09-12", status: "Paid", total: 455.25 },
  { id: "ORD-10469", customer: "Oliver Grant", email: "oliver.grant@copperfield.example", date: "2026-09-10", status: "Paid", total: 27.0 },
  { id: "ORD-10468", customer: "Yuki Tanaka", email: "yuki.tanaka@mizuho-labs.example", date: "2026-09-09", status: "Refunded", total: 540.0 },
  { id: "ORD-10467", customer: "Fatima Zahra", email: "fatima.zahra@oasis.example", date: "2026-09-07", status: "Paid", total: 868.9 },
  { id: "ORD-10466", customer: "Lucas Martin", email: "lucas.martin@verdant.example", date: "2026-09-05", status: "Pending", total: 199.0 },
  { id: "ORD-10465", customer: "Grace Sullivan", email: "grace.sullivan@alder.example", date: "2026-09-04", status: "Paid", total: 3020.0 },
  { id: "ORD-10464", customer: "Daniel Kowalski", email: "daniel.k@ironbridge.example", date: "2026-09-02", status: "Paid", total: 142.8 },
  { id: "ORD-10463", customer: "Mei Lin", email: "mei.lin@jadeline.example", date: "2026-09-01", status: "Paid", total: 715.0 },
  { id: "ORD-10462", customer: "Samuel Adeyemi", email: "samuel.adeyemi@baobab.example", date: "2026-08-29", status: "Pending", total: 64.0 },
  { id: "ORD-10461", customer: "Clara Lindqvist", email: "clara.lindqvist@nordlys.example", date: "2026-08-27", status: "Paid", total: 1395.5 },
  { id: "ORD-10460", customer: "Ethan Brooks", email: "ethan.brooks@summitgrid.example", date: "2026-08-25", status: "Refunded", total: 89.0 },
  { id: "ORD-10459", customer: "Aaliyah Johnson", email: "aaliyah.j@riverstone.example", date: "2026-08-23", status: "Paid", total: 502.35 },
  { id: "ORD-10458", customer: "Viktor Horvat", email: "viktor.horvat@danube.example", date: "2026-08-21", status: "Paid", total: 233.0 },
  { id: "ORD-10457", customer: "Nina Schultz", email: "nina.schultz@kiln.example", date: "2026-08-19", status: "Pending", total: 1075.0 },
  { id: "ORD-10456", customer: "Omar Haddad", email: "omar.haddad@cedarpoint.example", date: "2026-08-17", status: "Paid", total: 48.5 },
  { id: "ORD-10455", customer: "Julia Andersson", email: "julia.andersson@birch.example", date: "2026-08-14", status: "Paid", total: 826.0 },
];

type SortKey = "id" | "customer" | "date" | "status" | "total";
type SortDir = "asc" | "desc";

const STATUS_FILTERS = ["All", "Paid", "Pending", "Refunded"] as const;
type StatusFilter = (typeof STATUS_FILTERS)[number];

const COLUMNS: { key: SortKey; label: string; align?: "right" }[] = [
  { key: "id", label: "Order" },
  { key: "customer", label: "Customer" },
  { key: "date", label: "Date" },
  { key: "status", label: "Status" },
  { key: "total", label: "Total", align: "right" },
];

const PAGE_SIZE = 8;

const STATUS_STYLES: Record<Status, string> = {
  Paid: "bg-emerald-50 text-emerald-800 ring-emerald-600/20",
  Pending: "bg-amber-50 text-amber-800 ring-amber-600/20",
  Refunded: "bg-slate-100 text-slate-700 ring-slate-500/20",
};

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

export default function Page() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("All");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const rows = ORDERS.filter((o) => {
      if (status !== "All" && o.status !== status) return false;
      if (from && o.date < from) return false;
      if (to && o.date > to) return false;
      if (q && !`${o.id} ${o.customer} ${o.email}`.toLowerCase().includes(q)) return false;
      return true;
    });
    const dir = sortDir === "asc" ? 1 : -1;
    return [...rows].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === "number" && typeof bv === "number") return (av - bv) * dir;
      return String(av).localeCompare(String(bv)) * dir;
    });
  }, [query, status, from, to, sortKey, sortDir]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const start = (currentPage - 1) * PAGE_SIZE;
  const visible = filtered.slice(start, start + PAGE_SIZE);
  const rangeInvalid = Boolean(from && to && from > to);

  function toggleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "total" || key === "date" ? "desc" : "asc");
    }
    setPage(1);
  }

  function resetFilters() {
    setQuery("");
    setStatus("All");
    setFrom("");
    setTo("");
    setPage(1);
  }

  const hasFilters = query !== "" || status !== "All" || from !== "" || to !== "";
  const inputClass =
    "h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 shadow-sm focus:border-indigo-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600/40";

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Orders</h1>
          <p className="mt-1 text-sm text-slate-600">
            Review recent storefront orders, filter by status or date, and sort by any column.
          </p>
        </header>

        <section aria-label="Filters" className="mb-4 flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm lg:flex-row lg:items-end">
          <div className="relative flex-1">
            <label htmlFor="order-search" className="mb-1 block text-xs font-medium text-slate-700">
              Search
            </label>
            <Search aria-hidden="true" className="pointer-events-none absolute bottom-3 left-3 size-4 text-slate-400" />
            <input
              id="order-search"
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Order ID, customer or email"
              className={`${inputClass} w-full pl-9`}
            />
          </div>

          <div role="group" aria-labelledby="status-label">
            <span id="status-label" className="mb-1 block text-xs font-medium text-slate-700">
              Status
            </span>
            <div className="inline-flex w-full rounded-lg bg-slate-100 p-1 lg:w-auto">
              {STATUS_FILTERS.map((s) => (
                <button
                  key={s}
                  type="button"
                  aria-pressed={status === s}
                  onClick={() => {
                    setStatus(s);
                    setPage(1);
                  }}
                  className={`h-8 flex-1 rounded-md px-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 lg:flex-none ${
                    status === s ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <fieldset className="min-w-0">
            <legend className="mb-1 text-xs font-medium text-slate-700">Order date</legend>
            <div className="flex items-center gap-2">
              <input
                type="date"
                aria-label="From date"
                value={from}
                max={to || undefined}
                onChange={(e) => {
                  setFrom(e.target.value);
                  setPage(1);
                }}
                className={`${inputClass} min-w-0 flex-1`}
              />
              <span aria-hidden="true" className="text-slate-400">
                to
              </span>
              <input
                type="date"
                aria-label="To date"
                value={to}
                min={from || undefined}
                onChange={(e) => {
                  setTo(e.target.value);
                  setPage(1);
                }}
                className={`${inputClass} min-w-0 flex-1`}
              />
            </div>
          </fieldset>

          <button
            type="button"
            onClick={resetFilters}
            disabled={!hasFilters}
            className="h-10 rounded-lg px-3 text-sm font-medium text-indigo-700 hover:bg-indigo-50 focus-visible:outline-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:text-slate-400 disabled:hover:bg-transparent"
          >
            Reset
          </button>
        </section>

        {rangeInvalid && (
          <p role="alert" className="mb-3 text-sm text-red-700">
            The start date is after the end date, so no orders can match.
          </p>
        )}

        <p className="mb-2 text-sm text-slate-600" role="status" aria-live="polite">
          {filtered.length === 0
            ? "No orders match your filters."
            : `Showing ${start + 1}–${start + visible.length} of ${filtered.length} orders`}
        </p>

        <div
          role="region"
          aria-label="Orders table"
          tabIndex={0}
          className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm focus-visible:outline-2 focus-visible:outline-indigo-600"
        >
          <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
            <caption className="sr-only">
              Orders, sorted by {COLUMNS.find((c) => c.key === sortKey)?.label} {sortDir === "asc" ? "ascending" : "descending"}
            </caption>
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                {COLUMNS.map((col) => {
                  const active = sortKey === col.key;
                  const Icon = !active ? ArrowUpDown : sortDir === "asc" ? ArrowUp : ArrowDown;
                  return (
                    <th
                      key={col.key}
                      scope="col"
                      aria-sort={active ? (sortDir === "asc" ? "ascending" : "descending") : "none"}
                      className={`px-4 py-2 font-medium text-slate-700 ${col.align === "right" ? "text-right" : ""}`}
                    >
                      <button
                        type="button"
                        onClick={() => toggleSort(col.key)}
                        className={`-mx-2 inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 hover:bg-slate-200/60 focus-visible:outline-2 focus-visible:outline-indigo-600 ${
                          col.align === "right" ? "flex-row-reverse" : ""
                        }`}
                      >
                        {col.label}
                        <Icon aria-hidden="true" className={`size-3.5 ${active ? "text-indigo-700" : "text-slate-400"}`} />
                      </button>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visible.length === 0 ? (
                <tr>
                  <td colSpan={COLUMNS.length} className="px-4 py-12 text-center text-slate-600">
                    <p className="font-medium text-slate-900">No orders found</p>
                    <p className="mt-1">Try a different search term or widen the date range.</p>
                  </td>
                </tr>
              ) : (
                visible.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50">
                    <th scope="row" className="whitespace-nowrap px-4 py-3 font-mono text-xs font-medium text-slate-900">
                      {o.id}
                    </th>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900">{o.customer}</div>
                      <div className="text-xs text-slate-500">{o.email}</div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-700">
                      <time dateTime={o.date}>{formatDate(o.date)}</time>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${STATUS_STYLES[o.status]}`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums text-slate-900">{currency.format(o.total)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <nav aria-label="Pagination" className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
          <p className="text-sm text-slate-600">
            Page {currentPage} of {pageCount}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage(currentPage - 1)}
              disabled={currentPage <= 1}
              className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronLeft aria-hidden="true" className="size-4" />
              Previous
            </button>
            <ul className="hidden items-center gap-1 sm:flex">
              {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
                <li key={n}>
                  <button
                    type="button"
                    onClick={() => setPage(n)}
                    aria-label={`Page ${n}`}
                    aria-current={n === currentPage ? "page" : undefined}
                    className={`size-9 rounded-lg text-sm font-medium focus-visible:outline-2 focus-visible:outline-indigo-600 ${
                      n === currentPage ? "bg-indigo-600 text-white" : "text-slate-700 hover:bg-slate-200/60"
                    }`}
                  >
                    {n}
                  </button>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => setPage(currentPage + 1)}
              disabled={currentPage >= pageCount}
              className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
              <ChevronRight aria-hidden="true" className="size-4" />
            </button>
          </div>
        </nav>
      </div>
    </main>
  );
}
