The layout has no dark-mode setup or special styles, so I'll build a light-themed page with Tailwind utilities.

```tsx
"use client";

import { useId, useMemo, useState } from "react";
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

type Invoice = {
  id: string;
  customer: string;
  email: string;
  plan: string;
  amount: number;
  status: Status;
  date: string; // ISO yyyy-mm-dd
};

const INVOICES: Invoice[] = [
  { id: "INV-2041", customer: "Marta Kowalski", email: "marta@northwind.io", plan: "Business", amount: 1290, status: "Paid", date: "2025-03-28" },
  { id: "INV-2040", customer: "Dev Patel", email: "dev@lumenlabs.co", plan: "Starter", amount: 49, status: "Pending", date: "2025-03-27" },
  { id: "INV-2039", customer: "Sofia Almeida", email: "sofia@brightpath.com", plan: "Business", amount: 1290, status: "Paid", date: "2025-03-25" },
  { id: "INV-2038", customer: "Liam O'Connor", email: "liam@harborworks.ie", plan: "Team", amount: 399, status: "Overdue", date: "2025-03-22" },
  { id: "INV-2037", customer: "Yuki Tanaka", email: "yuki@kitsune.jp", plan: "Enterprise", amount: 4800, status: "Paid", date: "2025-03-21" },
  { id: "INV-2036", customer: "Chloe Martin", email: "chloe@atelier-m.fr", plan: "Starter", amount: 49, status: "Refunded", date: "2025-03-19" },
  { id: "INV-2035", customer: "Omar Haddad", email: "omar@sandstone.ae", plan: "Team", amount: 399, status: "Paid", date: "2025-03-18" },
  { id: "INV-2034", customer: "Hannah Becker", email: "hannah@feldmann.de", plan: "Business", amount: 1290, status: "Pending", date: "2025-03-15" },
  { id: "INV-2033", customer: "Rafael Costa", email: "rafael@vertice.br", plan: "Enterprise", amount: 5200, status: "Paid", date: "2025-03-14" },
  { id: "INV-2032", customer: "Ingrid Larsen", email: "ingrid@fjordtech.no", plan: "Team", amount: 399, status: "Overdue", date: "2025-03-12" },
  { id: "INV-2031", customer: "Amara Okafor", email: "amara@zuriventures.ng", plan: "Starter", amount: 49, status: "Paid", date: "2025-03-11" },
  { id: "INV-2030", customer: "Tomás Rivera", email: "tomas@solmarket.mx", plan: "Business", amount: 1290, status: "Paid", date: "2025-03-09" },
  { id: "INV-2029", customer: "Priya Nair", email: "priya@cobaltsoft.in", plan: "Enterprise", amount: 4800, status: "Pending", date: "2025-03-07" },
  { id: "INV-2028", customer: "Jonas Weber", email: "jonas@alpenlicht.ch", plan: "Team", amount: 399, status: "Paid", date: "2025-03-05" },
  { id: "INV-2027", customer: "Elena Petrova", email: "elena@polarbyte.ru", plan: "Starter", amount: 49, status: "Overdue", date: "2025-03-03" },
  { id: "INV-2026", customer: "Noah Williams", email: "noah@clearwater.us", plan: "Business", amount: 1290, status: "Paid", date: "2025-02-28" },
  { id: "INV-2025", customer: "Aisha Rahman", email: "aisha@crescent.pk", plan: "Team", amount: 399, status: "Refunded", date: "2025-02-26" },
  { id: "INV-2024", customer: "Lucas Moreau", email: "lucas@maison-l.fr", plan: "Enterprise", amount: 5200, status: "Paid", date: "2025-02-24" },
  { id: "INV-2023", customer: "Grace Kim", email: "grace@tidepool.kr", plan: "Starter", amount: 49, status: "Paid", date: "2025-02-21" },
  { id: "INV-2022", customer: "Mateo Fernandez", email: "mateo@pampa.ar", plan: "Business", amount: 1290, status: "Pending", date: "2025-02-19" },
  { id: "INV-2021", customer: "Sara Lindqvist", email: "sara@nordlys.se", plan: "Team", amount: 399, status: "Paid", date: "2025-02-17" },
  { id: "INV-2020", customer: "Kwame Mensah", email: "kwame@goldcoast.gh", plan: "Starter", amount: 49, status: "Overdue", date: "2025-02-14" },
  { id: "INV-2019", customer: "Olivia Brown", email: "olivia@kestrel.co.uk", plan: "Enterprise", amount: 4800, status: "Paid", date: "2025-02-12" },
  { id: "INV-2018", customer: "Daniel Cohen", email: "daniel@olivegrove.il", plan: "Business", amount: 1290, status: "Paid", date: "2025-02-10" },
  { id: "INV-2017", customer: "Mei Lin", email: "mei@jadeline.sg", plan: "Team", amount: 399, status: "Pending", date: "2025-02-07" },
  { id: "INV-2016", customer: "Victor Novak", email: "victor@praguelabs.cz", plan: "Starter", amount: 49, status: "Paid", date: "2025-02-05" },
  { id: "INV-2015", customer: "Fatima Zahra", email: "fatima@atlasgroup.ma", plan: "Business", amount: 1290, status: "Refunded", date: "2025-02-03" },
  { id: "INV-2014", customer: "Ethan Clarke", email: "ethan@ridgeline.au", plan: "Enterprise", amount: 5200, status: "Paid", date: "2025-01-30" },
];

type SortKey = "id" | "customer" | "plan" | "amount" | "status" | "date";
type SortDir = "asc" | "desc";
type StatusFilter = "All" | Status;

const STATUS_OPTIONS: StatusFilter[] = ["All", "Paid", "Pending", "Overdue", "Refunded"];
const PAGE_SIZES = [5, 10, 15];

const COLUMNS: { key: SortKey; label: string; align?: "right"; hideOnMobile?: boolean }[] = [
  { key: "id", label: "Invoice" },
  { key: "customer", label: "Customer" },
  { key: "plan", label: "Plan", hideOnMobile: true },
  { key: "status", label: "Status" },
  { key: "date", label: "Date", hideOnMobile: true },
  { key: "amount", label: "Amount", align: "right" },
];

const STATUS_STYLES: Record<Status, string> = {
  Paid: "bg-emerald-50 text-emerald-800 ring-emerald-600/20",
  Pending: "bg-amber-50 text-amber-800 ring-amber-600/20",
  Overdue: "bg-red-50 text-red-800 ring-red-600/20",
  Refunded: "bg-slate-100 text-slate-700 ring-slate-500/20",
};

const STATUS_DOT: Record<Status, string> = {
  Paid: "bg-emerald-500",
  Pending: "bg-amber-500",
  Overdue: "bg-red-500",
  Refunded: "bg-slate-400",
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

function compare(a: Invoice, b: Invoice, key: SortKey): number {
  switch (key) {
    case "amount":
      return a.amount - b.amount;
    case "id":
      return a.id.localeCompare(b.id, "en", { numeric: true });
    default:
      return a[key].localeCompare(b[key]);
  }
}

export default function Page() {
  const uid = useId();
  const [status, setStatus] = useState<StatusFilter>("All");
  const [query, setQuery] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);

  const rangeInvalid = from !== "" && to !== "" && from > to;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return INVOICES.filter((inv) => {
      if (status !== "All" && inv.status !== status) return false;
      if (q && !`${inv.id} ${inv.customer} ${inv.email}`.toLowerCase().includes(q)) return false;
      if (!rangeInvalid) {
        if (from && inv.date < from) return false;
        if (to && inv.date > to) return false;
      }
      return true;
    });
  }, [status, query, from, to, rangeInvalid]);

  const sorted = useMemo(() => {
    const dir = sortDir === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => compare(a, b, sortKey) * dir);
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIdx = (currentPage - 1) * pageSize;
  const rows = sorted.slice(startIdx, startIdx + pageSize);
  const totalAmount = filtered.reduce((sum, inv) => sum + inv.amount, 0);

  const hasFilters = status !== "All" || query !== "" || from !== "" || to !== "";

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
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = (idx - 1 + STATUS_OPTIONS.length) % STATUS_OPTIONS.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = STATUS_OPTIONS.length - 1;
    else return;
    e.preventDefault();
    setStatus(STATUS_OPTIONS[next]);
    setPage(1);
    const buttons = e.currentTarget.querySelectorAll<HTMLButtonElement>("button");
    buttons[next]?.focus();
  }

  const inputClass =
    "h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40";

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <header className="mb-6 flex flex-col gap-1 sm:mb-8">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Invoices</h1>
          <p className="text-sm text-slate-600">
            Track billing across all customer accounts. Filter, sort and review payment status at a glance.
          </p>
        </header>

        <section
          aria-label="Filters"
          className="mb-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:gap-6">
            {/* Segmented control */}
            <div className="min-w-0">
              <span id={`${uid}-status`} className="mb-1.5 block text-xs font-medium text-slate-600">
                Status
              </span>
              <div
                role="radiogroup"
                aria-labelledby={`${uid}-status`}
                onKeyDown={onSegmentKey}
                className="flex w-full max-w-full overflow-x-auto rounded-lg bg-slate-100 p-1 lg:w-auto"
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
                      className={`h-8 flex-1 whitespace-nowrap rounded-md px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
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

            {/* Date range */}
            <fieldset className="min-w-0">
              <legend className="mb-1.5 text-xs font-medium text-slate-600">Invoice date</legend>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
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
                  className={inputClass}
                />
                <span aria-hidden="true" className="hidden text-slate-400 sm:inline">
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
                  className={inputClass}
                />
              </div>
            </fieldset>

            {/* Search */}
            <div className="min-w-0 flex-1">
              <label htmlFor={`${uid}-search`} className="mb-1.5 block text-xs font-medium text-slate-600">
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
                  placeholder="Invoice, customer or email"
                  className={`${inputClass} pl-9`}
                />
              </div>
            </div>
          </div>

          {(rangeInvalid || hasFilters) && (
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              <p role="alert" className="text-sm text-red-700">
                {rangeInvalid ? "The start date must be on or before the end date." : ""}
              </p>
              {hasFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="inline-flex h-8 items-center gap-1.5 rounded-md px-2 text-sm font-medium text-indigo-700 hover:bg-indigo-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                >
                  <X aria-hidden="true" className="size-4" />
                  Clear filters
                </button>
              )}
            </div>
          )}
        </section>

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-4 py-3">
            <p aria-live="polite" className="text-sm text-slate-600">
              <span className="font-medium text-slate-900">{sorted.length}</span>{" "}
              {sorted.length === 1 ? "invoice" : "invoices"} · {currency.format(totalAmount)} total
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-full border-collapse text-left text-sm">
              <caption className="sr-only">
                Invoices, sorted by {COLUMNS.find((c) => c.key === sortKey)?.label}{" "}
                {sortDir === "asc" ? "ascending" : "descending"}
              </caption>
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-600">
                <tr>
                  {COLUMNS.map((col) => {
                    const active = col.key === sortKey;
                    const Icon = !active ? ArrowUpDown : sortDir === "asc" ? ArrowUp : ArrowDown;
                    return (
                      <th
                        key={col.key}
                        scope="col"
                        aria-sort={active ? (sortDir === "asc" ? "ascending" : "descending") : "none"}
                        className={`px-4 py-2 font-medium ${col.align === "right" ? "text-right" : ""} ${
                          col.hideOnMobile ? "hidden md:table-cell" : ""
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => toggleSort(col.key)}
                          className={`-mx-2 inline-flex items-center gap-1.5 rounded-md px-2 py-1 uppercase tracking-wide hover:bg-slate-200/60 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                            active ? "text-slate-900" : ""
                          }`}
                        >
                          {col.label}
                          <Icon
                            aria-hidden="true"
                            className={`size-3.5 ${active ? "text-indigo-600" : "text-slate-400"}`}
                          />
                        </button>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={COLUMNS.length} className="px-4 py-16 text-center">
                      <p className="font-medium text-slate-900">No invoices match your filters</p>
                      <p className="mt-1 text-slate-600">Try a different status, date range or search term.</p>
                      {hasFilters && (
                        <button
                          type="button"
                          onClick={clearFilters}
                          className="mt-4 inline-flex h-9 items-center rounded-lg bg-indigo-600 px-4 text-sm font-medium text-white hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                        >
                          Clear filters
                        </button>
                      )}
                    </td>
                  </tr>
                ) : (
                  rows.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50/70">
                      <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-slate-700">{inv.id}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-900">{inv.customer}</div>
                        <div className="truncate text-xs text-slate-500">{inv.email}</div>
                        <div className="mt-0.5 text-xs text-slate-500 md:hidden">
                          {inv.plan} · {formatDate(inv.date)}
                        </div>
                      </td>
                      <td className="hidden whitespace-nowrap px-4 py-3 text-slate-700 md:table-cell">{inv.plan}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${STATUS_STYLES[inv.status]}`}
                        >
                          <span aria-hidden="true" className={`size-1.5 rounded-full ${STATUS_DOT[inv.status]}`} />
                          {inv.status}
                        </span>
                      </td>
                      <td className="hidden whitespace-nowrap px-4 py-3 text-slate-700 md:table-cell">
                        <time dateTime={inv.date}>{formatDate(inv.date)}</time>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right font-medium tabular-nums text-slate-900">
                        {currency.format(inv.amount)}
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
            <div className="flex items-center justify-between gap-4 sm:justify-start">
              <p className="text-sm text-slate-600">
                {sorted.length === 0
                  ? "Showing 0 results"
                  : `Showing ${startIdx + 1}–${Math.min(startIdx + pageSize, sorted.length)} of ${sorted.length}`}
              </p>
              <div className="flex items-center gap-2">
                <label htmlFor={`${uid}-size`} className="text-sm text-slate-600">
                  Rows
                </label>
                <select
                  id={`${uid}-size`}
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setPage(1);
                  }}
                  className="h-8 rounded-md border border-slate-300 bg-white px-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                >
                  {PAGE_SIZES.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between gap-1 sm:justify-end">
              <PageButton label="First page" disabled={currentPage === 1} onClick={() => setPage(1)}>
                <ChevronsLeft aria-hidden="true" className="size-4" />
              </PageButton>
              <PageButton label="Previous page" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>
                <ChevronLeft aria-hidden="true" className="size-4" />
              </PageButton>
              <p className="min-w-24 px-2 text-center text-sm text-slate-700" aria-live="polite">
                Page <span className="font-medium">{currentPage}</span> of {totalPages}
              </p>
              <PageButton
                label="Next page"
                disabled={currentPage === totalPages}
                onClick={() => setPage(currentPage + 1)}
              >
                <ChevronRight aria-hidden="true" className="size-4" />
              </PageButton>
              <PageButton
                label="Last page"
                disabled={currentPage === totalPages}
                onClick={() => setPage(totalPages)}
              >
                <ChevronsRight aria-hidden="true" className="size-4" />
              </PageButton>
            </div>
          </nav>
        </section>
      </div>
    </main>
  );
}

function PageButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="inline-flex size-9 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white"
    >
      {children}
    </button>
  );
}
```