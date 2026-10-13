"use client";

import { useId, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
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
  status: Status;
  amount: number;
}

type SortKey = "id" | "customer" | "date" | "status" | "amount";
type SortDir = "asc" | "desc";

const ORDERS: Order[] = [
  { id: "ORD-10482", customer: "Amara Okafor", email: "amara.okafor@northwind.example", date: "2026-10-09", status: "Paid", amount: 248.5 },
  { id: "ORD-10481", customer: "Lukas Brandt", email: "lukas.brandt@brandtworks.example", date: "2026-10-09", status: "Pending", amount: 89.0 },
  { id: "ORD-10480", customer: "Sofia Marchetti", email: "sofia@marchetti.example", date: "2026-10-08", status: "Paid", amount: 1120.0 },
  { id: "ORD-10479", customer: "Daniel Kim", email: "d.kim@helixlabs.example", date: "2026-10-07", status: "Failed", amount: 54.99 },
  { id: "ORD-10478", customer: "Priya Raman", email: "priya.raman@lumen.example", date: "2026-10-07", status: "Paid", amount: 432.25 },
  { id: "ORD-10477", customer: "Tomás Herrera", email: "tomas.herrera@plazaco.example", date: "2026-10-06", status: "Refunded", amount: 159.0 },
  { id: "ORD-10476", customer: "Hannah Weiss", email: "hweiss@alpenglow.example", date: "2026-10-05", status: "Paid", amount: 76.4 },
  { id: "ORD-10475", customer: "Yusuf Demir", email: "yusuf.demir@bosphorus.example", date: "2026-10-04", status: "Pending", amount: 305.0 },
  { id: "ORD-10474", customer: "Chloe Martin", email: "chloe.martin@atelier.example", date: "2026-10-03", status: "Paid", amount: 612.8 },
  { id: "ORD-10473", customer: "Mateo Silva", email: "mateo@silvaandsons.example", date: "2026-10-02", status: "Paid", amount: 38.0 },
  { id: "ORD-10472", customer: "Ingrid Larsen", email: "ingrid.larsen@fjordtech.example", date: "2026-10-01", status: "Failed", amount: 899.99 },
  { id: "ORD-10471", customer: "Kenji Watanabe", email: "k.watanabe@sakura.example", date: "2026-09-30", status: "Paid", amount: 214.0 },
  { id: "ORD-10470", customer: "Fatima Al-Sayed", email: "fatima.alsayed@oasis.example", date: "2026-09-29", status: "Pending", amount: 127.5 },
  { id: "ORD-10469", customer: "Oliver Grant", email: "oliver.grant@grantco.example", date: "2026-09-28", status: "Paid", amount: 540.0 },
  { id: "ORD-10468", customer: "Nadia Petrova", email: "nadia.petrova@volga.example", date: "2026-09-27", status: "Refunded", amount: 92.75 },
  { id: "ORD-10467", customer: "Carlos Mendes", email: "carlos.mendes@lisboa.example", date: "2026-09-26", status: "Paid", amount: 331.0 },
  { id: "ORD-10466", customer: "Emily Nguyen", email: "emily.nguyen@brightpath.example", date: "2026-09-25", status: "Paid", amount: 1499.0 },
  { id: "ORD-10465", customer: "Jonas Becker", email: "jonas.becker@kraftwerk.example", date: "2026-09-24", status: "Pending", amount: 66.2 },
  { id: "ORD-10464", customer: "Leila Haddad", email: "leila.haddad@medina.example", date: "2026-09-22", status: "Paid", amount: 187.9 },
  { id: "ORD-10463", customer: "Ethan Brooks", email: "ethan.brooks@summit.example", date: "2026-09-21", status: "Failed", amount: 420.0 },
  { id: "ORD-10462", customer: "Mei Lin", email: "mei.lin@jadegarden.example", date: "2026-09-20", status: "Paid", amount: 275.0 },
  { id: "ORD-10461", customer: "Rafael Costa", email: "rafael.costa@tropico.example", date: "2026-09-18", status: "Paid", amount: 98.6 },
  { id: "ORD-10460", customer: "Greta Johansson", email: "greta.j@nordlys.example", date: "2026-09-17", status: "Refunded", amount: 349.0 },
  { id: "ORD-10459", customer: "Samuel Adeyemi", email: "samuel.adeyemi@lagosworks.example", date: "2026-09-15", status: "Paid", amount: 760.5 },
  { id: "ORD-10458", customer: "Isabelle Dubois", email: "isabelle.dubois@maison.example", date: "2026-09-14", status: "Pending", amount: 215.0 },
  { id: "ORD-10457", customer: "Arjun Mehta", email: "arjun.mehta@kiteflow.example", date: "2026-09-12", status: "Paid", amount: 59.0 },
  { id: "ORD-10456", customer: "Zoe Campbell", email: "zoe.campbell@wavecrest.example", date: "2026-09-10", status: "Paid", amount: 934.0 },
  { id: "ORD-10455", customer: "Viktor Novak", email: "viktor.novak@praha.example", date: "2026-09-08", status: "Failed", amount: 143.3 },
  { id: "ORD-10454", customer: "Aisha Khan", email: "aisha.khan@crescent.example", date: "2026-09-06", status: "Paid", amount: 388.0 },
  { id: "ORD-10453", customer: "Benjamin Clarke", email: "ben.clarke@clarkeandco.example", date: "2026-09-04", status: "Paid", amount: 172.45 },
  { id: "ORD-10452", customer: "Lucia Romano", email: "lucia.romano@trevi.example", date: "2026-09-02", status: "Pending", amount: 505.0 },
  { id: "ORD-10451", customer: "Noah Fischer", email: "noah.fischer@rheinwerk.example", date: "2026-08-31", status: "Paid", amount: 79.9 },
  { id: "ORD-10450", customer: "Camila Reyes", email: "camila.reyes@solaris.example", date: "2026-08-29", status: "Refunded", amount: 266.0 },
];

const STATUS_OPTIONS: StatusFilter[] = ["All", "Paid", "Pending", "Refunded", "Failed"];
const PAGE_SIZES = [5, 10, 20];

const STATUS_STYLES: Record<Status, string> = {
  Paid: "bg-emerald-50 text-emerald-800 ring-emerald-600/20",
  Pending: "bg-amber-50 text-amber-800 ring-amber-600/20",
  Refunded: "bg-slate-100 text-slate-700 ring-slate-500/20",
  Failed: "bg-red-50 text-red-800 ring-red-600/20",
};

const STATUS_DOT: Record<Status, string> = {
  Paid: "bg-emerald-500",
  Pending: "bg-amber-500",
  Refunded: "bg-slate-400",
  Failed: "bg-red-500",
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

const COLUMNS: { key: SortKey; label: string; align: "left" | "right" }[] = [
  { key: "id", label: "Order", align: "left" },
  { key: "customer", label: "Customer", align: "left" },
  { key: "date", label: "Date", align: "left" },
  { key: "status", label: "Status", align: "left" },
  { key: "amount", label: "Amount", align: "right" },
];

export default function Page() {
  const uid = useId();
  const [status, setStatus] = useState<StatusFilter>("All");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const rangeInvalid = from !== "" && to !== "" && from > to;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ORDERS.filter((o) => {
      if (status !== "All" && o.status !== status) return false;
      if (!rangeInvalid) {
        if (from && o.date < from) return false;
        if (to && o.date > to) return false;
      }
      if (q && !`${o.id} ${o.customer} ${o.email}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [status, from, to, query, rangeInvalid]);

  const sorted = useMemo(() => {
    const dir = sortDir === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      let r: number;
      if (sortKey === "amount") r = a.amount - b.amount;
      else r = a[sortKey].localeCompare(b[sortKey]);
      if (r === 0) r = a.id.localeCompare(b.id);
      return r * dir;
    });
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIdx = (currentPage - 1) * pageSize;
  const rows = sorted.slice(startIdx, startIdx + pageSize);
  const total = filtered.reduce((sum, o) => sum + o.amount, 0);

  const hasFilters = status !== "All" || from !== "" || to !== "" || query !== "";

  function toggleSort(key: SortKey) {
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
    setFrom("");
    setTo("");
    setQuery("");
    setPage(1);
  }

  function handleRadioKey(e: React.KeyboardEvent<HTMLDivElement>) {
    const idx = STATUS_OPTIONS.indexOf(status);
    let next = idx;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = (idx + 1) % STATUS_OPTIONS.length;
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp")
      next = (idx - 1 + STATUS_OPTIONS.length) % STATUS_OPTIONS.length;
    else return;
    e.preventDefault();
    setStatus(STATUS_OPTIONS[next]);
    setPage(1);
    const buttons = e.currentTarget.querySelectorAll<HTMLButtonElement>('[role="radio"]');
    buttons[next]?.focus();
  }

  const pageNumbers = useMemo(() => {
    const pages: (number | "gap-l" | "gap-r")[] = [];
    const add = (n: number) => pages.push(n);
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) add(i);
    } else {
      add(1);
      if (currentPage > 3) pages.push("gap-l");
      for (
        let i = Math.max(2, currentPage - 1);
        i <= Math.min(totalPages - 1, currentPage + 1);
        i++
      )
        add(i);
      if (currentPage < totalPages - 2) pages.push("gap-r");
      add(totalPages);
    }
    return pages;
  }, [currentPage, totalPages]);

  const inputBase =
    "h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600/40";

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Orders</h1>
          <p className="mt-1 text-sm text-slate-600">
            Review recent store orders, filter by status or date, and sort by any column.
          </p>
        </header>

        <section
          aria-label="Filters"
          className="mb-4 grid gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm lg:grid-cols-[auto_1fr_minmax(0,18rem)] lg:items-end"
        >
          <div>
            <span id={`${uid}-status`} className="mb-1.5 block text-sm font-medium text-slate-700">
              Status
            </span>
            <div
              role="radiogroup"
              aria-labelledby={`${uid}-status`}
              onKeyDown={handleRadioKey}
              className="inline-flex max-w-full flex-wrap gap-1 rounded-lg bg-slate-100 p-1"
            >
              {STATUS_OPTIONS.map((opt) => {
                const active = opt === status;
                return (
                  <button
                    key={opt}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    tabIndex={active ? 0 : -1}
                    onClick={() => {
                      setStatus(opt);
                      setPage(1);
                    }}
                    className={`h-8 rounded-md px-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
                      active
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>

          <fieldset className="min-w-0">
            <legend className="mb-1.5 text-sm font-medium text-slate-700">Order date</legend>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="flex-1">
                <label htmlFor={`${uid}-from`} className="sr-only">
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
                  className={inputBase}
                />
              </div>
              <span aria-hidden="true" className="hidden text-slate-400 sm:block">
                to
              </span>
              <div className="flex-1">
                <label htmlFor={`${uid}-to`} className="sr-only">
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
                  className={inputBase}
                />
              </div>
            </div>
            {rangeInvalid && (
              <p id={`${uid}-range-error`} role="alert" className="mt-1.5 text-xs text-red-700">
                The start date must be on or before the end date.
              </p>
            )}
          </fieldset>

          <div>
            <label htmlFor={`${uid}-search`} className="mb-1.5 block text-sm font-medium text-slate-700">
              Search
            </label>
            <div className="relative">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
              />
              <input
                id={`${uid}-search`}
                type="search"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(1);
                }}
                placeholder="Order, name or email"
                autoComplete="off"
                className={`${inputBase} pl-9`}
              />
            </div>
          </div>
        </section>

        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-sm text-slate-600">
          <p role="status" aria-live="polite">
            {sorted.length === 0
              ? "No orders match"
              : `${sorted.length} ${sorted.length === 1 ? "order" : "orders"}`}
            {sorted.length > 0 && (
              <span className="text-slate-500"> &middot; {currency.format(total)} total</span>
            )}
          </p>
          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex h-8 items-center gap-1.5 rounded-md px-2 font-medium text-indigo-700 hover:bg-indigo-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              <X aria-hidden="true" className="size-4" />
              Clear filters
            </button>
          )}
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Orders table, scrollable">
            <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
              <caption className="sr-only">
                Orders, sorted by {COLUMNS.find((c) => c.key === sortKey)?.label}{" "}
                {sortDir === "asc" ? "ascending" : "descending"}
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
                        className={`px-2 py-1 font-medium text-slate-700 ${
                          col.align === "right" ? "text-right" : "text-left"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => toggleSort(col.key)}
                          className={`inline-flex h-9 items-center gap-1.5 rounded-md px-2 hover:bg-slate-200/60 focus-visible:outline-2 focus-visible:outline-indigo-600 ${
                            col.align === "right" ? "flex-row-reverse" : ""
                          }`}
                        >
                          {col.label}
                          <Icon
                            aria-hidden="true"
                            className={`size-3.5 ${active ? "text-indigo-700" : "text-slate-400"}`}
                          />
                          <span className="sr-only">
                            {active
                              ? `, sorted ${sortDir === "asc" ? "ascending" : "descending"}, activate to reverse`
                              : ", activate to sort"}
                          </span>
                        </button>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={COLUMNS.length} className="px-4 py-14 text-center">
                      <p className="font-medium text-slate-900">No orders found</p>
                      <p className="mt-1 text-slate-600">Try a different search or widen the date range.</p>
                      {hasFilters && (
                        <button
                          type="button"
                          onClick={clearFilters}
                          className="mt-4 inline-flex h-9 items-center rounded-lg bg-indigo-600 px-4 font-medium text-white hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                        >
                          Clear filters
                        </button>
                      )}
                    </td>
                  </tr>
                ) : (
                  rows.map((o) => (
                    <tr key={o.id} className="hover:bg-slate-50">
                      <th scope="row" className="whitespace-nowrap px-4 py-3 font-mono text-xs font-medium text-slate-900">
                        {o.id}
                      </th>
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-900">{o.customer}</div>
                        <div className="max-w-[16rem] truncate text-xs text-slate-500">{o.email}</div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-700">
                        <time dateTime={o.date}>{formatDate(o.date)}</time>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${STATUS_STYLES[o.status]}`}
                        >
                          <span aria-hidden="true" className={`size-1.5 rounded-full ${STATUS_DOT[o.status]}`} />
                          {o.status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right font-medium tabular-nums text-slate-900">
                        {currency.format(o.amount)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <nav
            aria-label="Pagination"
            className="flex flex-col gap-3 border-t border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-600">
              <p>
                {sorted.length === 0
                  ? "Showing 0 of 0"
                  : `Showing ${startIdx + 1}–${Math.min(startIdx + pageSize, sorted.length)} of ${sorted.length}`}
              </p>
              <div className="flex items-center gap-2">
                <label htmlFor={`${uid}-size`}>Rows per page</label>
                <select
                  id={`${uid}-size`}
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setPage(1);
                  }}
                  className="h-9 rounded-lg border border-slate-300 bg-white px-2 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600/40"
                >
                  {PAGE_SIZES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <ul className="flex items-center gap-1">
              <li>
                <button
                  type="button"
                  onClick={() => setPage(currentPage - 1)}
                  disabled={currentPage <= 1}
                  aria-label="Previous page"
                  className="inline-flex size-9 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white"
                >
                  <ChevronLeft aria-hidden="true" className="size-4" />
                </button>
              </li>
              {/* Compact indicator on phones */}
              <li className="px-2 text-sm text-slate-700 sm:hidden" aria-hidden="true">
                {currentPage} / {totalPages}
              </li>
              {pageNumbers.map((p) =>
                typeof p === "number" ? (
                  <li key={p} className="hidden sm:block">
                    <button
                      type="button"
                      onClick={() => setPage(p)}
                      aria-label={`Page ${p}`}
                      aria-current={p === currentPage ? "page" : undefined}
                      className={`inline-flex size-9 items-center justify-center rounded-lg text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
                        p === currentPage
                          ? "bg-indigo-600 text-white"
                          : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {p}
                    </button>
                  </li>
                ) : (
                  <li key={p} aria-hidden="true" className="hidden px-1 text-slate-400 sm:block">
                    &hellip;
                  </li>
                ),
              )}
              <li>
                <button
                  type="button"
                  onClick={() => setPage(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  aria-label="Next page"
                  className="inline-flex size-9 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white"
                >
                  <ChevronRight aria-hidden="true" className="size-4" />
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </main>
  );
}
