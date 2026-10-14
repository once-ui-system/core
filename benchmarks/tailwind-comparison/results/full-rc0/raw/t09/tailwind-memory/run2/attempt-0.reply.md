```tsx
"use client";

import { useId, useMemo, useState } from "react";
import type { ReactNode } from "react";
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

const CUSTOMERS: ReadonlyArray<readonly [string, string]> = [
  ["Amara Okafor", "amara@northwind.example"],
  ["Lucas Hartmann", "lucas@brightloop.example"],
  ["Priya Raman", "priya@lumenlabs.example"],
  ["Mateo Silva", "mateo@harborstack.example"],
  ["Chloe Dubois", "chloe@atelier42.example"],
  ["Noah Fischer", "noah@kestrel.example"],
  ["Yuki Tanaka", "yuki@sora.example"],
  ["Elena Petrova", "elena@polarbyte.example"],
  ["Samuel Adeyemi", "samuel@greenfield.example"],
  ["Hannah Berg", "hannah@fjordworks.example"],
  ["Diego Alvarez", "diego@solstice.example"],
  ["Isla Campbell", "isla@thistle.example"],
];

const PLANS: ReadonlyArray<{ name: string; amount: number }> = [
  { name: "Starter", amount: 29 },
  { name: "Team", amount: 149 },
  { name: "Business", amount: 399 },
  { name: "Enterprise", amount: 1290 },
];

const STATUSES: ReadonlyArray<Status> = [
  "Paid",
  "Paid",
  "Paid",
  "Pending",
  "Overdue",
  "Paid",
  "Refunded",
  "Pending",
];

function buildInvoices(): Invoice[] {
  const rows: Invoice[] = [];
  const base = Date.UTC(2025, 5, 28);
  for (let i = 0; i < 64; i++) {
    const [customer, email] = CUSTOMERS[(i * 5 + 3) % CUSTOMERS.length];
    const plan = PLANS[(i * 7 + (i % 3)) % PLANS.length];
    const seats = 1 + ((i * 3) % 4);
    const d = new Date(base - i * 2.6 * 86400000);
    rows.push({
      id: `INV-${String(2064 - i).padStart(4, "0")}`,
      customer,
      email,
      plan: plan.name,
      amount: plan.amount * (plan.name === "Enterprise" ? 1 : seats),
      status: STATUSES[(i * 5 + (i % 4)) % STATUSES.length],
      date: d.toISOString().slice(0, 10),
    });
  }
  return rows;
}

const INVOICES: Invoice[] = buildInvoices();
const STATUS_OPTIONS: ReadonlyArray<StatusFilter> = ["All", "Paid", "Pending", "Overdue", "Refunded"];
const PAGE_SIZES: ReadonlyArray<number> = [5, 10, 20];

const STATUS_STYLES: Record<Status, string> = {
  Paid: "bg-emerald-50 text-emerald-800 ring-emerald-600/20",
  Pending: "bg-amber-50 text-amber-800 ring-amber-600/20",
  Overdue: "bg-rose-50 text-rose-800 ring-rose-600/20",
  Refunded: "bg-slate-100 text-slate-700 ring-slate-500/20",
};

const STATUS_DOT: Record<Status, string> = {
  Paid: "bg-emerald-500",
  Pending: "bg-amber-500",
  Overdue: "bg-rose-500",
  Refunded: "bg-slate-400",
};

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

interface Column {
  key: SortKey;
  label: string;
  align?: "right";
  hideBelow?: "md" | "lg";
}

const COLUMNS: ReadonlyArray<Column> = [
  { key: "id", label: "Invoice" },
  { key: "customer", label: "Customer" },
  { key: "plan", label: "Plan", hideBelow: "lg" },
  { key: "date", label: "Date", hideBelow: "md" },
  { key: "status", label: "Status" },
  { key: "amount", label: "Amount", align: "right" },
];

function hideClass(h?: "md" | "lg"): string {
  if (h === "md") return "hidden md:table-cell";
  if (h === "lg") return "hidden lg:table-cell";
  return "";
}

function compare(a: Invoice, b: Invoice, key: SortKey): number {
  if (key === "amount") return a.amount - b.amount;
  return a[key].localeCompare(b[key]);
}

const fieldClass =
  "h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40";

function PageButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="inline-flex size-9 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-700 shadow-sm hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white"
    >
      {children}
    </button>
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
  const [pageSize, setPageSize] = useState(10);

  const counts = useMemo(() => {
    const c: Record<StatusFilter, number> = { All: INVOICES.length, Paid: 0, Pending: 0, Overdue: 0, Refunded: 0 };
    for (const inv of INVOICES) c[inv.status] += 1;
    return c;
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const rows = INVOICES.filter((inv) => {
      if (status !== "All" && inv.status !== status) return false;
      if (from && inv.date < from) return false;
      if (to && inv.date > to) return false;
      if (q) {
        const hay = `${inv.id} ${inv.customer} ${inv.email} ${inv.plan}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    const dir = sortDir === "asc" ? 1 : -1;
    return rows.sort((a, b) => {
      const r = compare(a, b, sortKey);
      return r !== 0 ? r * dir : a.id.localeCompare(b.id);
    });
  }, [status, query, from, to, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIdx = (currentPage - 1) * pageSize;
  const pageRows = filtered.slice(startIdx, startIdx + pageSize);
  const filtersActive = status !== "All" || query !== "" || from !== "" || to !== "";
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
    setStatus("All");
    setQuery("");
    setFrom("");
    setTo("");
    setPage(1);
  }

  function onSegmentKey(e: React.KeyboardEvent<HTMLDivElement>) {
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

  const showingFrom = filtered.length === 0 ? 0 : startIdx + 1;
  const showingTo = Math.min(startIdx + pageSize, filtered.length);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <header className="mb-6">
          <p className="text-sm font-medium text-indigo-700">Billing</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">Invoices</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-600">
            Review subscription invoices, track what is overdue, and filter by status or date.
          </p>
        </header>

        <section aria-label="Invoice filters" className="mb-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <span id={`${uid}-status`} className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
                Status
              </span>
              <div
                role="radiogroup"
                aria-labelledby={`${uid}-status`}
                onKeyDown={onSegmentKey}
                className="flex max-w-full overflow-x-auto rounded-lg bg-slate-100 p-1"
              >
                {STATUS_OPTIONS.map((opt) => {
                  const selected = opt === status;
                  return (
                    <button
                      key={opt}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      tabIndex={selected ? 0 : -1}
                      onClick={() => {
                        setStatus(opt);
                        setPage(1);
                      }}
                      className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-indigo-600 ${
                        selected ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      {opt}
                      <span
                        className={`rounded-full px-1.5 text-xs tabular-nums ${
                          selected ? "bg-indigo-100 text-indigo-800" : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {counts[opt]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:flex lg:items-end">
              <fieldset className="min-w-0">
                <legend className="mb-1.5 text-xs font-medium uppercase tracking-wide text-slate-500">
                  Invoice date
                </legend>
                <div className="flex items-center gap-2">
                  <label className="flex-1">
                    <span className="sr-only">From date</span>
                    <input
                      type="date"
                      value={from}
                      max={to || undefined}
                      onChange={(e) => {
                        setFrom(e.target.value);
                        setPage(1);
                      }}
                      className={`${fieldClass} w-full`}
                    />
                  </label>
                  <span aria-hidden="true" className="text-slate-400">
                    –
                  </span>
                  <label className="flex-1">
                    <span className="sr-only">To date</span>
                    <input
                      type="date"
                      value={to}
                      min={from || undefined}
                      onChange={(e) => {
                        setTo(e.target.value);
                        setPage(1);
                      }}
                      className={`${fieldClass} w-full`}
                    />
                  </label>
                </div>
              </fieldset>

              <div>
                <label htmlFor={`${uid}-search`} className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
                  Search
                </label>
                <div className="relative">
                  <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id={`${uid}-search`}
                    type="search"
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setPage(1);
                    }}
                    placeholder="Customer, invoice or plan"
                    autoComplete="off"
                    className={`${fieldClass} w-full pl-9 lg:w-64`}
                  />
                </div>
              </div>
            </div>
          </div>

          {(filtersActive || rangeInvalid) && (
            <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-3">
              {rangeInvalid && (
                <p role="alert" className="text-sm text-rose-700">
                  The start date is after the end date.
                </p>
              )}
              {filtersActive && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-sm font-medium text-indigo-700 hover:bg-indigo-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  <X aria-hidden="true" className="size-4" />
                  Clear all filters
                </button>
              )}
            </div>
          )}
        </section>

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-full text-left text-sm">
              <caption className="sr-only">
                Invoices, sorted by {COLUMNS.find((c) => c.key === sortKey)?.label}{" "}
                {sortDir === "asc" ? "ascending" : "descending"}
              </caption>
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  {COLUMNS.map((col) => {
                    const active = col.key === sortKey;
                    const ariaSort = active ? (sortDir === "asc" ? "ascending" : "descending") : "none";
                    const Icon = active ? (sortDir === "asc" ? ArrowUp : ArrowDown) : ArrowUpDown;
                    return (
                      <th
                        key={col.key}
                        scope="col"
                        aria-sort={ariaSort}
                        className={`px-4 py-2 font-semibold ${col.align === "right" ? "text-right" : ""} ${hideClass(col.hideBelow)}`}
                      >
                        <button
                          type="button"
                          onClick={() => toggleSort(col.key)}
                          className={`-mx-2 inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 uppercase tracking-wide hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-indigo-600 ${
                            active ? "text-slate-900" : ""
                          }`}
                        >
                          {col.label}
                          <Icon aria-hidden="true" className={`size-3.5 ${active ? "text-indigo-600" : "text-slate-400"}`} />
                        </button>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pageRows.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/70">
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-xs font-medium text-slate-700">{inv.id}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900">{inv.customer}</div>
                      <div className="text-xs text-slate-500">{inv.email}</div>
                      <div className="mt-0.5 text-xs text-slate-500 md:hidden">{formatDate(inv.date)}</div>
                    </td>
                    <td className="hidden px-4 py-3 text-slate-700 lg:table-cell">{inv.plan}</td>
                    <td className="hidden whitespace-nowrap px-4 py-3 text-slate-700 md:table-cell">
                      <time dateTime={inv.date}>{formatDate(inv.date)}</time>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${STATUS_STYLES[inv.status]}`}
                      >
                        <span aria-hidden="true" className={`size-1.5 rounded-full ${STATUS_DOT[inv.status]}`} />
                        {inv.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right font-medium tabular-nums text-slate-900">
                      {currency.format(inv.amount)}
                    </td>
                  </tr>
                ))}
                {pageRows.length === 0 && (
                  <tr>
                    <td colSpan={COLUMNS.length} className="px-4 py-16 text-center">
                      <p className="font-medium text-slate-900">No invoices match your filters</p>
                      <p className="mt-1 text-sm text-slate-500">Try a different search term or widen the date range.</p>
                      <button
                        type="button"
                        onClick={clearFilters}
                        className="mt-4 inline-flex h-9 items-center rounded-lg bg-indigo-600 px-3 text-sm font-medium text-white hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                      >
                        Clear filters
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <nav
            aria-label="Pagination"
            className="flex flex-col gap-3 border-t border-slate-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <p className="text-sm text-slate-600" aria-live="polite">
                Showing <span className="font-medium text-slate-900 tabular-nums">{showingFrom}–{showingTo}</span> of{" "}
                <span className="font-medium text-slate-900 tabular-nums">{filtered.length}</span> invoices
              </p>
              <div className="flex items-center gap-2">
                <label htmlFor={`${uid}-size`} className="text-sm text-slate-600">
                  Rows per page
                </label>
                <select
                  id={`${uid}-size`}
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setPage(1);
                  }}
                  className={`${fieldClass} h-9 py-0 pr-8`}
                >
                  {PAGE_SIZES.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <PageButton label="First page" disabled={currentPage === 1} onClick={() => setPage(1)}>
                <ChevronsLeft aria-hidden="true" className="size-4" />
              </PageButton>
              <PageButton label="Previous page" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>
                <ChevronLeft aria-hidden="true" className="size-4" />
              </PageButton>
              <span className="min-w-24 px-2 text-center text-sm text-slate-700 tabular-nums">
                Page {currentPage} of {totalPages}
              </span>
              <PageButton label="Next page" disabled={currentPage === totalPages} onClick={() => setPage(currentPage + 1)}>
                <ChevronRight aria-hidden="true" className="size-4" />
              </PageButton>
              <PageButton label="Last page" disabled={currentPage === totalPages} onClick={() => setPage(totalPages)}>
                <ChevronsRight aria-hidden="true" className="size-4" />
              </PageButton>
            </div>
          </nav>
        </section>
      </div>
    </main>
  );
}
```