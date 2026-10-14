```tsx
"use client";

import { useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  X,
} from "lucide-react";

type Status = "Paid" | "Pending" | "Overdue" | "Refunded";
type StatusFilter = "All" | Status;

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

const customers: Array<[string, string]> = [
  ["Amara Okafor", "amara@northwind.example"],
  ["Liam Chen", "liam.chen@brightloop.example"],
  ["Sofia Marquez", "sofia@casaverde.example"],
  ["Noah Fischer", "noah@fischerworks.example"],
  ["Priya Natarajan", "priya@lumenlabs.example"],
  ["Mateo Rossi", "mateo@rossi-studio.example"],
  ["Hannah Kowalski", "hannah@polarfreight.example"],
  ["Yusuf Demir", "yusuf@bosphorus.example"],
  ["Chloe Dubois", "chloe@atelierdubois.example"],
  ["Ethan Brooks", "ethan@summitpeak.example"],
  ["Mei Tanaka", "mei@kodamasoft.example"],
  ["Lucas Almeida", "lucas@tropicoapps.example"],
];

const plans = ["Starter", "Team", "Business", "Enterprise"];
const planPrice: Record<string, number> = {
  Starter: 29,
  Team: 149,
  Business: 499,
  Enterprise: 1890,
};
const statuses: Status[] = ["Paid", "Paid", "Pending", "Paid", "Overdue", "Paid", "Refunded", "Pending"];

function buildInvoices(): Invoice[] {
  const rows: Invoice[] = [];
  const start = Date.UTC(2025, 0, 6);
  for (let i = 0; i < 64; i++) {
    const [customer, email] = customers[(i * 5 + 3) % customers.length];
    const plan = plans[(i * 7 + (i >> 2)) % plans.length];
    const seats = 1 + ((i * 3) % 5);
    const amount = Math.round(planPrice[plan] * (plan === "Enterprise" ? 1 : seats) * 100) / 100 + (i % 4) * 0.5;
    const d = new Date(start + i * 4.3 * 86_400_000);
    rows.push({
      id: `INV-${String(2041 + i).padStart(5, "0")}`,
      customer,
      email,
      plan,
      amount,
      status: statuses[(i * 3 + (i >> 1)) % statuses.length],
      date: d.toISOString().slice(0, 10),
    });
  }
  return rows;
}

const INVOICES: Invoice[] = buildInvoices();

const statusOptions: StatusFilter[] = ["All", "Paid", "Pending", "Overdue", "Refunded"];

const statusStyles: Record<Status, string> = {
  Paid: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  Pending: "bg-amber-50 text-amber-800 ring-amber-600/20",
  Overdue: "bg-rose-50 text-rose-700 ring-rose-600/20",
  Refunded: "bg-slate-100 text-slate-700 ring-slate-500/20",
};

const statusDot: Record<Status, string> = {
  Paid: "bg-emerald-500",
  Pending: "bg-amber-500",
  Overdue: "bg-rose-500",
  Refunded: "bg-slate-400",
};

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(y, m - 1, d)));
}

const columns: Array<{ key: SortKey; label: string; align?: "right"; hideBelow?: "md" | "sm" }> = [
  { key: "id", label: "Invoice" },
  { key: "customer", label: "Customer" },
  { key: "plan", label: "Plan", hideBelow: "md" },
  { key: "status", label: "Status" },
  { key: "date", label: "Date", hideBelow: "sm" },
  { key: "amount", label: "Amount", align: "right" },
];

const PAGE_SIZES = [5, 10, 20];

export default function Page() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("All");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return INVOICES.filter((r) => {
      if (status !== "All" && r.status !== status) return false;
      if (from && r.date < from) return false;
      if (to && r.date > to) return false;
      if (q && !`${r.id} ${r.customer} ${r.email} ${r.plan}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [query, status, from, to]);

  const sorted = useMemo(() => {
    const dir = sortDir === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === "number" && typeof bv === "number") return (av - bv) * dir;
      return String(av).localeCompare(String(bv)) * dir;
    });
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIdx = (currentPage - 1) * pageSize;
  const pageRows = sorted.slice(startIdx, startIdx + pageSize);
  const totalAmount = filtered.reduce((sum, r) => sum + r.amount, 0);

  const hasFilters = query !== "" || status !== "All" || from !== "" || to !== "";
  const rangeInvalid = from !== "" && to !== "" && from > to;

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
    setQuery("");
    setStatus("All");
    setFrom("");
    setTo("");
    setPage(1);
  }

  const statusCounts = useMemo(() => {
    const counts: Record<StatusFilter, number> = { All: INVOICES.length, Paid: 0, Pending: 0, Overdue: 0, Refunded: 0 };
    for (const r of INVOICES) counts[r.status] += 1;
    return counts;
  }, []);

  const pageNumbers = useMemo(() => {
    const nums: Array<number | "gap-l" | "gap-r"> = [];
    const add = (n: number) => nums.push(n);
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) add(i);
    } else {
      add(1);
      if (currentPage > 3) nums.push("gap-l");
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) add(i);
      if (currentPage < totalPages - 2) nums.push("gap-r");
      add(totalPages);
    }
    return nums;
  }, [currentPage, totalPages]);

  const inputBase =
    "h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40";

  const pageBtn =
    "inline-flex h-9 min-w-9 items-center justify-center rounded-lg border border-slate-300 bg-white px-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white";

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6 flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Invoices</h1>
          <p className="text-sm text-slate-600">
            Track billing across customers, plans and payment status.
          </p>
        </header>

        <section
          aria-label="Filters"
          className="mb-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:gap-4">
            <div className="lg:flex-1">
              <label htmlFor="search" className="mb-1.5 block text-xs font-medium text-slate-600">
                Search
              </label>
              <div className="relative">
                <Search
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
                />
                <input
                  id="search"
                  type="search"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Invoice, customer, email or plan"
                  className={`${inputBase} pl-9`}
                  autoComplete="off"
                />
              </div>
            </div>

            <fieldset className="min-w-0">
              <legend className="mb-1.5 text-xs font-medium text-slate-600">Date range</legend>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <div className="relative">
                  <CalendarDays
                    aria-hidden="true"
                    className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="date"
                    aria-label="From date"
                    value={from}
                    max={to || undefined}
                    onChange={(e) => {
                      setFrom(e.target.value);
                      setPage(1);
                    }}
                    className={`${inputBase} pl-9 sm:w-44`}
                  />
                </div>
                <span aria-hidden="true" className="hidden text-slate-400 sm:inline">
                  –
                </span>
                <div className="relative">
                  <CalendarDays
                    aria-hidden="true"
                    className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="date"
                    aria-label="To date"
                    value={to}
                    min={from || undefined}
                    onChange={(e) => {
                      setTo(e.target.value);
                      setPage(1);
                    }}
                    className={`${inputBase} pl-9 sm:w-44`}
                  />
                </div>
              </div>
            </fieldset>
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div
              role="radiogroup"
              aria-label="Filter by status"
              className="-mx-1 flex max-w-full gap-1 overflow-x-auto rounded-lg bg-slate-100 p-1 sm:mx-0 sm:w-fit"
            >
              {statusOptions.map((opt) => {
                const active = status === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => {
                      setStatus(opt);
                      setPage(1);
                    }}
                    className={`inline-flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-indigo-600 ${
                      active
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {opt}
                    <span
                      className={`rounded-full px-1.5 text-xs tabular-nums ${
                        active ? "bg-slate-100 text-slate-700" : "bg-slate-200/70 text-slate-500"
                      }`}
                    >
                      {statusCounts[opt]}
                    </span>
                  </button>
                );
              })}
            </div>

            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center gap-1.5 self-start rounded-lg px-2 py-1.5 text-sm font-medium text-indigo-700 hover:bg-indigo-50 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-indigo-600 sm:self-auto"
              >
                <X aria-hidden="true" className="size-4" />
                Clear filters
              </button>
            )}
          </div>
          {rangeInvalid && (
            <p role="alert" className="mt-3 text-sm text-rose-700">
              The start date is after the end date, so no invoices can match.
            </p>
          )}
        </section>

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-4 py-3">
            <p className="text-sm text-slate-600" role="status" aria-live="polite">
              <span className="font-medium text-slate-900">{filtered.length}</span>{" "}
              {filtered.length === 1 ? "invoice" : "invoices"}
              {hasFilters ? " match your filters" : ""}
            </p>
            <p className="text-sm text-slate-600">
              Total <span className="font-medium tabular-nums text-slate-900">{currency.format(totalAmount)}</span>
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-full text-left text-sm">
              <caption className="sr-only">
                Invoices, sorted by {columns.find((c) => c.key === sortKey)?.label}{" "}
                {sortDir === "asc" ? "ascending" : "descending"}
              </caption>
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-600">
                <tr>
                  {columns.map((col) => {
                    const active = sortKey === col.key;
                    const hide =
                      col.hideBelow === "md" ? "hidden md:table-cell" : col.hideBelow === "sm" ? "hidden sm:table-cell" : "";
                    return (
                      <th
                        key={col.key}
                        scope="col"
                        aria-sort={active ? (sortDir === "asc" ? "ascending" : "descending") : "none"}
                        className={`px-4 py-2 font-semibold ${col.align === "right" ? "text-right" : ""} ${hide}`}
                      >
                        <button
                          type="button"
                          onClick={() => toggleSort(col.key)}
                          className={`group -mx-2 inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 uppercase tracking-wide hover:bg-slate-200/60 focus-visible:outline-2 focus-visible:outline-indigo-600 ${
                            active ? "text-slate-900" : ""
                          } ${col.align === "right" ? "flex-row-reverse" : ""}`}
                        >
                          {col.label}
                          {active ? (
                            sortDir === "asc" ? (
                              <ArrowUp aria-hidden="true" className="size-3.5" />
                            ) : (
                              <ArrowDown aria-hidden="true" className="size-3.5" />
                            )
                          ) : (
                            <ArrowUpDown aria-hidden="true" className="size-3.5 text-slate-400 group-hover:text-slate-600" />
                          )}
                          <span className="sr-only">
                            {active
                              ? `, sorted ${sortDir === "asc" ? "ascending" : "descending"}. Activate to reverse.`
                              : ", activate to sort"}
                          </span>
                        </button>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pageRows.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length} className="px-4 py-16 text-center">
                      <p className="font-medium text-slate-900">No invoices found</p>
                      <p className="mt-1 text-slate-600">Try a different search term, status or date range.</p>
                      {hasFilters && (
                        <button
                          type="button"
                          onClick={clearFilters}
                          className="mt-4 inline-flex h-9 items-center rounded-lg bg-indigo-600 px-3 text-sm font-medium text-white hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                        >
                          Clear filters
                        </button>
                      )}
                    </td>
                  </tr>
                ) : (
                  pageRows.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/70">
                      <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-slate-700">{r.id}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-900">{r.customer}</div>
                        <div className="max-w-[14rem] truncate text-xs text-slate-500 sm:max-w-none">{r.email}</div>
                        <div className="mt-0.5 text-xs text-slate-500 sm:hidden">{formatDate(r.date)}</div>
                      </td>
                      <td className="hidden px-4 py-3 text-slate-700 md:table-cell">{r.plan}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${statusStyles[r.status]}`}
                        >
                          <span aria-hidden="true" className={`size-1.5 rounded-full ${statusDot[r.status]}`} />
                          {r.status}
                        </span>
                      </td>
                      <td className="hidden whitespace-nowrap px-4 py-3 text-slate-700 sm:table-cell">
                        <time dateTime={r.date}>{formatDate(r.date)}</time>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right font-medium tabular-nums text-slate-900">
                        {currency.format(r.amount)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <nav
            aria-label="Pagination"
            className="flex flex-col gap-3 border-t border-slate-200 px-4 py-3 md:flex-row md:items-center md:justify-between"
          >
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-600">
              <p>
                {sorted.length === 0
                  ? "Showing 0 results"
                  : `Showing ${startIdx + 1}–${Math.min(startIdx + pageSize, sorted.length)} of ${sorted.length}`}
              </p>
              <div className="flex items-center gap-2">
                <label htmlFor="page-size">Rows per page</label>
                <select
                  id="page-size"
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setPage(1);
                  }}
                  className="h-9 rounded-lg border border-slate-300 bg-white px-2 text-sm text-slate-900 shadow-sm focus-visible:outline-2 focus-visible:outline-indigo-600"
                >
                  {PAGE_SIZES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
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

              <ul className="hidden items-center gap-1.5 sm:flex">
                {pageNumbers.map((n) =>
                  typeof n === "number" ? (
                    <li key={n}>
                      <button
                        type="button"
                        onClick={() => setPage(n)}
                        aria-label={`Page ${n}`}
                        aria-current={n === currentPage ? "page" : undefined}
                        className={`${pageBtn} ${
                          n === currentPage
                            ? "!border-indigo-600 !bg-indigo-600 !text-white hover:!bg-indigo-700"
                            : ""
                        }`}
                      >
                        {n}
                      </button>
                    </li>
                  ) : (
                    <li key={n} aria-hidden="true" className="px-1 text-slate-400">
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
            </div>
          </nav>
        </section>
      </div>
    </main>
  );
}
```