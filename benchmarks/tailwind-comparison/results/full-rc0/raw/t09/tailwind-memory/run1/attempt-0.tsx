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
  { id: "INV-1042", customer: "Marta Kowalski", email: "marta@brightloop.io", plan: "Business", amount: 480, status: "Paid", date: "2025-06-02" },
  { id: "INV-1043", customer: "Daniel Okafor", email: "daniel@northwind.co", plan: "Starter", amount: 49, status: "Pending", date: "2025-06-03" },
  { id: "INV-1044", customer: "Priya Raghavan", email: "priya@lumenlabs.dev", plan: "Enterprise", amount: 2400, status: "Paid", date: "2025-06-05" },
  { id: "INV-1045", customer: "Tomás Herrera", email: "tomas@alderfield.com", plan: "Business", amount: 480, status: "Overdue", date: "2025-06-07" },
  { id: "INV-1046", customer: "Hannah Lindqvist", email: "hannah@fjordworks.se", plan: "Starter", amount: 49, status: "Paid", date: "2025-06-09" },
  { id: "INV-1047", customer: "Yusuf Demir", email: "yusuf@kestrelhq.com", plan: "Growth", amount: 190, status: "Refunded", date: "2025-06-10" },
  { id: "INV-1048", customer: "Chloe Bennett", email: "chloe@paperkite.studio", plan: "Growth", amount: 190, status: "Paid", date: "2025-06-12" },
  { id: "INV-1049", customer: "Kenji Watanabe", email: "kenji@morrowtech.jp", plan: "Enterprise", amount: 2400, status: "Pending", date: "2025-06-14" },
  { id: "INV-1050", customer: "Amara Nwosu", email: "amara@sundial.app", plan: "Starter", amount: 49, status: "Overdue", date: "2025-06-15" },
  { id: "INV-1051", customer: "Lucas Moreau", email: "lucas@verdant.fr", plan: "Business", amount: 480, status: "Paid", date: "2025-06-17" },
  { id: "INV-1052", customer: "Sofia Petrova", email: "sofia@cobaltmail.eu", plan: "Growth", amount: 190, status: "Paid", date: "2025-06-18" },
  { id: "INV-1053", customer: "Oliver Grant", email: "oliver@harborlane.co", plan: "Starter", amount: 49, status: "Pending", date: "2025-06-20" },
  { id: "INV-1054", customer: "Leila Haddad", email: "leila@zenithgrid.io", plan: "Enterprise", amount: 2400, status: "Paid", date: "2025-06-21" },
  { id: "INV-1055", customer: "Mateo Silva", email: "mateo@pinecrest.dev", plan: "Business", amount: 480, status: "Refunded", date: "2025-06-23" },
  { id: "INV-1056", customer: "Ingrid Solberg", email: "ingrid@auroraops.no", plan: "Growth", amount: 190, status: "Paid", date: "2025-06-24" },
  { id: "INV-1057", customer: "Ravi Menon", email: "ravi@tessellate.in", plan: "Starter", amount: 49, status: "Overdue", date: "2025-06-26" },
  { id: "INV-1058", customer: "Grace Tan", email: "grace@openharvest.sg", plan: "Business", amount: 480, status: "Paid", date: "2025-06-27" },
  { id: "INV-1059", customer: "Felix Baumann", email: "felix@riverbend.ch", plan: "Enterprise", amount: 2400, status: "Pending", date: "2025-06-29" },
  { id: "INV-1060", customer: "Nadia Rossi", email: "nadia@calderastudio.it", plan: "Growth", amount: 190, status: "Paid", date: "2025-07-01" },
  { id: "INV-1061", customer: "Ethan Brooks", email: "ethan@summitpath.com", plan: "Starter", amount: 49, status: "Paid", date: "2025-07-02" },
  { id: "INV-1062", customer: "Zainab Ali", email: "zainab@crescentlogic.ae", plan: "Business", amount: 480, status: "Overdue", date: "2025-07-04" },
  { id: "INV-1063", customer: "Jonas Weber", email: "jonas@stackhaus.de", plan: "Growth", amount: 190, status: "Pending", date: "2025-07-06" },
  { id: "INV-1064", customer: "Camila Torres", email: "camila@solmarket.mx", plan: "Enterprise", amount: 2400, status: "Paid", date: "2025-07-08" },
  { id: "INV-1065", customer: "Arjun Kapoor", email: "arjun@bluepeak.in", plan: "Starter", amount: 49, status: "Refunded", date: "2025-07-09" },
  { id: "INV-1066", customer: "Emily Carter", email: "emily@maplewood.ca", plan: "Business", amount: 480, status: "Paid", date: "2025-07-11" },
  { id: "INV-1067", customer: "Viktor Novak", email: "viktor@ironleaf.cz", plan: "Growth", amount: 190, status: "Paid", date: "2025-07-13" },
  { id: "INV-1068", customer: "Aisha Khan", email: "aisha@tidepool.pk", plan: "Starter", amount: 49, status: "Pending", date: "2025-07-14" },
  { id: "INV-1069", customer: "Noah Fischer", email: "noah@lanternhq.com", plan: "Enterprise", amount: 2400, status: "Overdue", date: "2025-07-16" },
  { id: "INV-1070", customer: "Maya Goldberg", email: "maya@quillandco.com", plan: "Business", amount: 480, status: "Paid", date: "2025-07-18" },
  { id: "INV-1071", customer: "Hugo Laurent", email: "hugo@brasserie.tech", plan: "Growth", amount: 190, status: "Paid", date: "2025-07-19" },
  { id: "INV-1072", customer: "Selin Aydin", email: "selin@marblearch.tr", plan: "Starter", amount: 49, status: "Paid", date: "2025-07-21" },
];

type Filter = "All" | Status;
const FILTERS: Filter[] = ["All", "Paid", "Pending", "Overdue", "Refunded"];
const PAGE_SIZES = [5, 10, 20];

type SortKey = "id" | "customer" | "plan" | "amount" | "status" | "date";
type SortDir = "asc" | "desc";

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
      return a.id.localeCompare(b.id, undefined, { numeric: true });
    default:
      return a[key].localeCompare(b[key]);
  }
}

export default function Page() {
  const [filter, setFilter] = useState<Filter>("All");
  const [query, setQuery] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const uid = useId();
  const searchId = `${uid}-search`;
  const fromId = `${uid}-from`;
  const toId = `${uid}-to`;
  const sizeId = `${uid}-size`;

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = INVOICES.filter((inv) => {
      if (filter !== "All" && inv.status !== filter) return false;
      if (from && inv.date < from) return false;
      if (to && inv.date > to) return false;
      if (q) {
        const hay = `${inv.id} ${inv.customer} ${inv.email} ${inv.plan}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    const sorted = [...filtered].sort((a, b) => {
      const c = compare(a, b, sortKey);
      return sortDir === "asc" ? c : -c;
    });
    return sorted;
  }, [filter, query, from, to, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIdx = (currentPage - 1) * pageSize;
  const pageRows = rows.slice(startIdx, startIdx + pageSize);
  const total = rows.reduce((sum, r) => sum + r.amount, 0);

  const hasFilters = filter !== "All" || query !== "" || from !== "" || to !== "";

  function toggleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "amount" || key === "date" ? "desc" : "asc");
    }
    setPage(1);
  }

  function resetFilters() {
    setFilter("All");
    setQuery("");
    setFrom("");
    setTo("");
    setPage(1);
  }

  const pageNumbers = useMemo(() => {
    const pages: (number | "gap-start" | "gap-end")[] = [];
    const add = (n: number) => pages.push(n);
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || Math.abs(i - currentPage) <= 1) add(i);
      else if (i < currentPage && !pages.includes("gap-start")) pages.push("gap-start");
      else if (i > currentPage && !pages.includes("gap-end")) pages.push("gap-end");
    }
    return pages;
  }, [totalPages, currentPage]);

  const inputBase =
    "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40";

  const pageBtn =
    "inline-flex h-9 min-w-9 items-center justify-center rounded-lg border border-slate-300 bg-white px-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white";

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Invoices</h1>
          <p className="mt-1 text-sm text-slate-600">
            Track billing across customers. Filter by status or date, search, and sort any column.
          </p>
        </header>

        <section aria-label="Filters" className="mb-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <span id={`${uid}-status-label`} className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
                Status
              </span>
              <div
                role="radiogroup"
                aria-labelledby={`${uid}-status-label`}
                className="flex w-full flex-wrap gap-1 rounded-lg bg-slate-100 p-1 sm:inline-flex sm:w-auto sm:flex-nowrap"
              >
                {FILTERS.map((f) => {
                  const active = filter === f;
                  return (
                    <button
                      key={f}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() => {
                        setFilter(f);
                        setPage(1);
                      }}
                      className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 sm:flex-none ${
                        active ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      {f}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:flex sm:items-end">
              <div>
                <label htmlFor={fromId} className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
                  From
                </label>
                <input
                  id={fromId}
                  type="date"
                  value={from}
                  max={to || undefined}
                  onChange={(e) => {
                    setFrom(e.target.value);
                    setPage(1);
                  }}
                  className={inputBase}
                />
              </div>
              <div>
                <label htmlFor={toId} className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
                  To
                </label>
                <input
                  id={toId}
                  type="date"
                  value={to}
                  min={from || undefined}
                  onChange={(e) => {
                    setTo(e.target.value);
                    setPage(1);
                  }}
                  className={inputBase}
                />
              </div>
            </div>

            <div className="lg:w-72">
              <label htmlFor={searchId} className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
                Search
              </label>
              <div className="relative">
                <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <input
                  id={searchId}
                  type="search"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Customer, email or invoice #"
                  className={`${inputBase} pl-9`}
                />
              </div>
            </div>
          </div>

          {hasFilters && (
            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm font-medium text-indigo-700 hover:bg-indigo-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                <X aria-hidden="true" className="size-4" />
                Clear filters
              </button>
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
                        className={`px-2 py-1 sm:px-3 ${col.align === "right" ? "text-right" : ""} ${
                          col.hideOnMobile ? "hidden md:table-cell" : ""
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => toggleSort(col.key)}
                          className={`inline-flex items-center gap-1.5 rounded-md px-2 py-2 text-xs font-semibold uppercase tracking-wide hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                            active ? "text-slate-900" : "text-slate-500"
                          }`}
                        >
                          {col.label}
                          <Icon aria-hidden="true" className={`size-3.5 ${active ? "" : "opacity-60"}`} />
                        </button>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pageRows.length === 0 ? (
                  <tr>
                    <td colSpan={COLUMNS.length} className="px-4 py-14 text-center">
                      <p className="font-medium text-slate-900">No invoices match your filters</p>
                      <p className="mt-1 text-slate-500">Try a different status, widen the date range, or clear the search.</p>
                      {hasFilters && (
                        <button
                          type="button"
                          onClick={resetFilters}
                          className="mt-4 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                        >
                          Clear filters
                        </button>
                      )}
                    </td>
                  </tr>
                ) : (
                  pageRows.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50/70">
                      <th scope="row" className="whitespace-nowrap px-4 py-3 font-medium text-slate-900">
                        {inv.id}
                        <span className="block text-xs font-normal text-slate-500 md:hidden">{formatDate(inv.date)}</span>
                      </th>
                      <td className="px-4 py-3">
                        <span className="block font-medium text-slate-900">{inv.customer}</span>
                        <span className="block max-w-[11rem] truncate text-xs text-slate-500 sm:max-w-none">{inv.email}</span>
                      </td>
                      <td className="hidden px-4 py-3 text-slate-700 md:table-cell">{inv.plan}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${STATUS_STYLES[inv.status]}`}
                        >
                          <span aria-hidden="true" className={`size-1.5 rounded-full ${STATUS_DOT[inv.status]}`} />
                          {inv.status}
                        </span>
                      </td>
                      <td className="hidden whitespace-nowrap px-4 py-3 text-slate-700 md:table-cell">{formatDate(inv.date)}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-right font-medium tabular-nums text-slate-900">
                        {currency.format(inv.amount)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-3 border-t border-slate-200 bg-white px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
            <p className="text-sm text-slate-600" role="status" aria-live="polite">
              {rows.length === 0 ? (
                "0 results"
              ) : (
                <>
                  Showing <span className="font-medium text-slate-900">{startIdx + 1}</span>–
                  <span className="font-medium text-slate-900">{Math.min(startIdx + pageSize, rows.length)}</span> of{" "}
                  <span className="font-medium text-slate-900">{rows.length}</span> invoices ·{" "}
                  <span className="font-medium text-slate-900">{currency.format(total)}</span> total
                </>
              )}
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <label htmlFor={sizeId} className="text-sm text-slate-600">
                  Rows per page
                </label>
                <select
                  id={sizeId}
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setPage(1);
                  }}
                  className="h-9 rounded-lg border border-slate-300 bg-white px-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                >
                  {PAGE_SIZES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <nav aria-label="Pagination" className="flex items-center gap-1">
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
                            p === currentPage ? "border-indigo-600 bg-indigo-600 text-white hover:bg-indigo-600" : ""
                          }`}
                        >
                          {p}
                        </button>
                      </li>
                    ) : (
                      <li key={p} aria-hidden="true" className="px-1 text-slate-400">
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
          </div>
        </section>
      </div>
    </main>
  );
}
