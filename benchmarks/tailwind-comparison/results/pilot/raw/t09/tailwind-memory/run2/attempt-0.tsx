"use client";

import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, ChevronsUpDown, Search } from "lucide-react";

type Status = "Paid" | "Pending" | "Overdue";
type StatusFilter = "All" | Status;
type SortKey = "invoice" | "customer" | "issued" | "amount" | "status";
type SortDir = "asc" | "desc";

interface Invoice {
  id: string;
  invoice: string;
  customer: string;
  email: string;
  issued: string; // ISO yyyy-mm-dd
  amount: number;
  status: Status;
}

const INVOICES: Invoice[] = [
  { id: "1", invoice: "INV-2041", customer: "Harbor & Pine Coffee", email: "billing@harborpine.example", issued: "2026-01-06", amount: 1280.5, status: "Paid" },
  { id: "2", invoice: "INV-2042", customer: "Northwind Logistics", email: "ap@northwindlog.example", issued: "2026-01-14", amount: 8420, status: "Paid" },
  { id: "3", invoice: "INV-2043", customer: "Alder Street Dental", email: "office@alderdental.example", issued: "2026-01-22", amount: 960, status: "Overdue" },
  { id: "4", invoice: "INV-2044", customer: "Juniper Analytics", email: "finance@juniperdata.example", issued: "2026-02-02", amount: 15750, status: "Paid" },
  { id: "5", invoice: "INV-2045", customer: "Kestrel Outfitters", email: "accounts@kestrelgear.example", issued: "2026-02-09", amount: 2310.75, status: "Paid" },
  { id: "6", invoice: "INV-2046", customer: "Marlow Architecture", email: "studio@marlowarch.example", issued: "2026-02-17", amount: 5400, status: "Overdue" },
  { id: "7", invoice: "INV-2047", customer: "Bluebell Bakery", email: "hello@bluebellbakes.example", issued: "2026-02-25", amount: 430.2, status: "Paid" },
  { id: "8", invoice: "INV-2048", customer: "Tideline Marine Supply", email: "ap@tidelinemarine.example", issued: "2026-03-03", amount: 7125, status: "Pending" },
  { id: "9", invoice: "INV-2049", customer: "Copperleaf Studios", email: "pay@copperleaf.example", issued: "2026-03-11", amount: 3890, status: "Paid" },
  { id: "10", invoice: "INV-2050", customer: "Summit Physio Group", email: "admin@summitphysio.example", issued: "2026-03-18", amount: 1675, status: "Paid" },
  { id: "11", invoice: "INV-2051", customer: "Ridgeway Hardware", email: "ap@ridgewayhw.example", issued: "2026-03-27", amount: 12040.9, status: "Overdue" },
  { id: "12", invoice: "INV-2052", customer: "Lumen Optics", email: "billing@lumenoptics.example", issued: "2026-04-04", amount: 6200, status: "Paid" },
  { id: "13", invoice: "INV-2053", customer: "Fernhill Veterinary", email: "reception@fernhillvet.example", issued: "2026-04-10", amount: 845, status: "Paid" },
  { id: "14", invoice: "INV-2054", customer: "Oakmont Legal Partners", email: "accounts@oakmontlegal.example", issued: "2026-04-19", amount: 21500, status: "Pending" },
  { id: "15", invoice: "INV-2055", customer: "Saffron Table", email: "owner@saffrontable.example", issued: "2026-04-28", amount: 1120.35, status: "Paid" },
  { id: "16", invoice: "INV-2056", customer: "Westbrook Printing", email: "ap@westbrookprint.example", issued: "2026-05-05", amount: 2985, status: "Overdue" },
  { id: "17", invoice: "INV-2057", customer: "Quartz Fitness", email: "billing@quartzfit.example", issued: "2026-05-13", amount: 4350, status: "Paid" },
  { id: "18", invoice: "INV-2058", customer: "Pelican Travel Co.", email: "finance@pelicantravel.example", issued: "2026-05-21", amount: 9780, status: "Paid" },
  { id: "19", invoice: "INV-2059", customer: "Granite Peak Builders", email: "ap@granitepeak.example", issued: "2026-05-30", amount: 33200, status: "Pending" },
  { id: "20", invoice: "INV-2060", customer: "Willow & Wren Florals", email: "shop@willowwren.example", issued: "2026-06-04", amount: 575.6, status: "Paid" },
  { id: "21", invoice: "INV-2061", customer: "Delta Freight Systems", email: "ap@deltafreight.example", issued: "2026-06-12", amount: 18400, status: "Paid" },
  { id: "22", invoice: "INV-2062", customer: "Evergreen Montessori", email: "office@evergreenmont.example", issued: "2026-06-20", amount: 2240, status: "Overdue" },
  { id: "23", invoice: "INV-2063", customer: "Cinder Brewing", email: "accounts@cinderbrew.example", issued: "2026-06-29", amount: 3615.4, status: "Paid" },
  { id: "24", invoice: "INV-2064", customer: "Atlas Cycle Works", email: "pay@atlascycle.example", issued: "2026-07-07", amount: 1895, status: "Paid" },
  { id: "25", invoice: "INV-2065", customer: "Brightwater Clinics", email: "ap@brightwaterhealth.example", issued: "2026-07-15", amount: 27600, status: "Pending" },
  { id: "26", invoice: "INV-2066", customer: "Maple Row Realty", email: "billing@maplerow.example", issued: "2026-07-23", amount: 4100, status: "Paid" },
  { id: "27", invoice: "INV-2067", customer: "Foxglove Design Lab", email: "hi@foxglovelab.example", issued: "2026-08-01", amount: 7350, status: "Pending" },
  { id: "28", invoice: "INV-2068", customer: "Ironbark Welding", email: "office@ironbarkweld.example", issued: "2026-08-09", amount: 2670.25, status: "Overdue" },
  { id: "29", invoice: "INV-2069", customer: "Starling Robotics", email: "finance@starlingrobotics.example", issued: "2026-08-18", amount: 41250, status: "Paid" },
  { id: "30", invoice: "INV-2070", customer: "Mossy Stone Cafe", email: "hello@mossystone.example", issued: "2026-08-26", amount: 690, status: "Paid" },
  { id: "31", invoice: "INV-2071", customer: "Beacon Credit Union", email: "vendors@beaconcu.example", issued: "2026-09-02", amount: 14900, status: "Pending" },
  { id: "32", invoice: "INV-2072", customer: "Thistle Textiles", email: "ap@thistletextiles.example", issued: "2026-09-10", amount: 5185, status: "Pending" },
  { id: "33", invoice: "INV-2073", customer: "Corvid Security", email: "billing@corvidsec.example", issued: "2026-09-17", amount: 8800, status: "Paid" },
  { id: "34", invoice: "INV-2074", customer: "Lantern Yoga House", email: "studio@lanternyoga.example", issued: "2026-09-24", amount: 1340, status: "Pending" },
  { id: "35", invoice: "INV-2075", customer: "Redwood Pediatrics", email: "ap@redwoodpeds.example", issued: "2026-10-01", amount: 6420.8, status: "Pending" },
  { id: "36", invoice: "INV-2076", customer: "Nimbus Cloud Hosting", email: "accounts@nimbushost.example", issued: "2026-10-06", amount: 12600, status: "Pending" },
];

const STATUS_OPTIONS: StatusFilter[] = ["All", "Paid", "Pending", "Overdue"];
const PAGE_SIZE = 8;

const COLUMNS: { key: SortKey; label: string; align: "left" | "right" }[] = [
  { key: "invoice", label: "Invoice", align: "left" },
  { key: "customer", label: "Customer", align: "left" },
  { key: "issued", label: "Issued", align: "left" },
  { key: "amount", label: "Amount", align: "right" },
  { key: "status", label: "Status", align: "left" },
];

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const dateFormat = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

function formatDate(iso: string): string {
  return dateFormat.format(new Date(`${iso}T00:00:00Z`));
}

const STATUS_STYLES: Record<Status, string> = {
  Paid: "bg-emerald-50 text-emerald-800 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-400/30",
  Pending: "bg-amber-50 text-amber-800 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-400/30",
  Overdue: "bg-rose-50 text-rose-800 ring-rose-600/20 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-400/30",
};

const STATUS_DOT: Record<Status, string> = {
  Paid: "bg-emerald-500",
  Pending: "bg-amber-500",
  Overdue: "bg-rose-500",
};

function compare(a: Invoice, b: Invoice, key: SortKey): number {
  switch (key) {
    case "amount":
      return a.amount - b.amount;
    case "issued":
      return a.issued.localeCompare(b.issued);
    case "invoice":
      return a.invoice.localeCompare(b.invoice, "en", { numeric: true });
    case "customer":
      return a.customer.localeCompare(b.customer, "en");
    case "status":
      return a.status.localeCompare(b.status, "en");
  }
}

export default function Page() {
  const [status, setStatus] = useState<StatusFilter>("All");
  const [query, setQuery] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("issued");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);

  const rangeInvalid = from !== "" && to !== "" && from > to;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const rows = INVOICES.filter((row) => {
      if (status !== "All" && row.status !== status) return false;
      if (q && !`${row.invoice} ${row.customer} ${row.email}`.toLowerCase().includes(q)) return false;
      if (!rangeInvalid) {
        if (from && row.issued < from) return false;
        if (to && row.issued > to) return false;
      }
      return true;
    });
    const dir = sortDir === "asc" ? 1 : -1;
    return rows.sort((a, b) => compare(a, b, sortKey) * dir);
  }, [status, query, from, to, rangeInvalid, sortKey, sortDir]);

  const total = filtered.length;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const current = Math.min(page, pageCount);
  const start = (current - 1) * PAGE_SIZE;
  const visible = filtered.slice(start, start + PAGE_SIZE);

  const statusCounts = useMemo(() => {
    const counts: Record<StatusFilter, number> = { All: INVOICES.length, Paid: 0, Pending: 0, Overdue: 0 };
    for (const row of INVOICES) counts[row.status] += 1;
    return counts;
  }, []);

  const filtersActive = status !== "All" || query !== "" || from !== "" || to !== "";

  function toggleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "amount" || key === "issued" ? "desc" : "asc");
    }
    setPage(1);
  }

  function resetFilters() {
    setStatus("All");
    setQuery("");
    setFrom("");
    setTo("");
    setPage(1);
  }

  const inputClass =
    "h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500";

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:px-6 lg:px-8 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto w-full max-w-6xl">
        <header className="mb-6">
          <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">Billing</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">Invoices</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-600 dark:text-slate-400">
            Track what has been billed, what is still outstanding, and which accounts need a reminder.
          </p>
        </header>

        <section
          aria-label="Invoice filters"
          className="mb-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/60"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
            <div role="group" aria-labelledby="status-label" className="lg:shrink-0">
              <span id="status-label" className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-400">
                Status
              </span>
              <div className="inline-flex w-full flex-wrap gap-1 rounded-lg bg-slate-100 p-1 sm:w-auto sm:flex-nowrap dark:bg-slate-800">
                {STATUS_OPTIONS.map((option) => {
                  const active = option === status;
                  return (
                    <button
                      key={option}
                      type="button"
                      aria-pressed={active}
                      onClick={() => {
                        setStatus(option);
                        setPage(1);
                      }}
                      className={`flex-1 whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 sm:flex-none ${
                        active
                          ? "bg-white text-slate-900 shadow-sm dark:bg-slate-950 dark:text-white"
                          : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                      }`}
                    >
                      {option}
                      <span className="ml-1.5 text-xs tabular-nums text-slate-500 dark:text-slate-400">
                        {statusCounts[option]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <fieldset className="min-w-0 lg:shrink-0">
              <legend className="mb-1.5 text-xs font-medium text-slate-600 dark:text-slate-400">Issued between</legend>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <label className="sr-only" htmlFor="date-from">
                  From date
                </label>
                <input
                  id="date-from"
                  type="date"
                  value={from}
                  max={to || undefined}
                  onChange={(e) => {
                    setFrom(e.target.value);
                    setPage(1);
                  }}
                  aria-invalid={rangeInvalid}
                  className={`${inputClass} sm:w-40`}
                />
                <span aria-hidden="true" className="hidden text-slate-400 sm:inline">
                  to
                </span>
                <label className="sr-only" htmlFor="date-to">
                  To date
                </label>
                <input
                  id="date-to"
                  type="date"
                  value={to}
                  min={from || undefined}
                  onChange={(e) => {
                    setTo(e.target.value);
                    setPage(1);
                  }}
                  aria-invalid={rangeInvalid}
                  className={`${inputClass} sm:w-40`}
                />
              </div>
            </fieldset>

            <div className="min-w-0 flex-1">
              <label htmlFor="invoice-search" className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-400">
                Search
              </label>
              <div className="relative">
                <Search
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
                />
                <input
                  id="invoice-search"
                  type="search"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Invoice, customer or email"
                  autoComplete="off"
                  className={`${inputClass} pl-9`}
                />
              </div>
            </div>

            <button
              type="button"
              onClick={resetFilters}
              disabled={!filtersActive}
              className="h-10 rounded-lg px-3 text-sm font-medium text-indigo-700 hover:bg-indigo-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:text-slate-400 disabled:hover:bg-transparent dark:text-indigo-300 dark:hover:bg-indigo-500/10 dark:disabled:text-slate-600"
            >
              Clear filters
            </button>
          </div>
          {rangeInvalid && (
            <p role="alert" className="mt-3 text-sm text-rose-700 dark:text-rose-400">
              The start date is after the end date, so the date filter is ignored until you fix the range.
            </p>
          )}
        </section>

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
              <caption className="sr-only">
                Invoices, sorted by {COLUMNS.find((c) => c.key === sortKey)?.label}{" "}
                {sortDir === "asc" ? "ascending" : "descending"}. Use the column header buttons to change the sort.
              </caption>
              <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
                <tr>
                  {COLUMNS.map((col) => {
                    const active = col.key === sortKey;
                    const ariaSort = active ? (sortDir === "asc" ? "ascending" : "descending") : "none";
                    const Icon = active ? (sortDir === "asc" ? ArrowUp : ArrowDown) : ChevronsUpDown;
                    return (
                      <th
                        key={col.key}
                        scope="col"
                        aria-sort={ariaSort}
                        className={`px-2 py-1 font-medium ${col.align === "right" ? "text-right" : "text-left"}`}
                      >
                        <button
                          type="button"
                          onClick={() => toggleSort(col.key)}
                          className={`inline-flex items-center gap-1.5 rounded-md px-2 py-2 text-xs font-semibold uppercase tracking-wide hover:bg-slate-200/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:hover:bg-slate-800 ${
                            active ? "text-slate-900 dark:text-white" : "text-slate-600 dark:text-slate-400"
                          }`}
                        >
                          {col.label}
                          <Icon aria-hidden="true" className={`size-3.5 ${active ? "" : "opacity-50"}`} />
                        </button>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {visible.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-xs font-medium text-slate-700 dark:text-slate-300">
                      {row.invoice}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900 dark:text-slate-100">{row.customer}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{row.email}</div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-700 dark:text-slate-300">
                      <time dateTime={row.issued}>{formatDate(row.issued)}</time>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right font-medium tabular-nums">
                      {currency.format(row.amount)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${STATUS_STYLES[row.status]}`}
                      >
                        <span aria-hidden="true" className={`size-1.5 rounded-full ${STATUS_DOT[row.status]}`} />
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {visible.length === 0 && (
                  <tr>
                    <td colSpan={COLUMNS.length} className="px-4 py-14 text-center">
                      <p className="font-medium text-slate-900 dark:text-slate-100">No invoices match these filters</p>
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                        Try a different search term or widen the date range.
                      </p>
                      <button
                        type="button"
                        onClick={resetFilters}
                        className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
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
            className="flex flex-col items-center justify-between gap-3 border-t border-slate-200 px-4 py-3 sm:flex-row dark:border-slate-800"
          >
            <p role="status" aria-live="polite" className="text-sm text-slate-600 dark:text-slate-400">
              {total === 0 ? (
                "Showing 0 of 0 invoices"
              ) : (
                <>
                  Showing <span className="font-medium text-slate-900 dark:text-slate-100">{start + 1}</span> to{" "}
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    {Math.min(start + PAGE_SIZE, total)}
                  </span>{" "}
                  of <span className="font-medium text-slate-900 dark:text-slate-100">{total}</span> invoices
                </>
              )}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage(current - 1)}
                disabled={current <= 1}
                className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <ChevronLeft aria-hidden="true" className="size-4" />
                Previous
              </button>
              <span className="min-w-24 text-center text-sm tabular-nums text-slate-600 dark:text-slate-400">
                Page {current} of {pageCount}
              </span>
              <button
                type="button"
                onClick={() => setPage(current + 1)}
                disabled={current >= pageCount}
                className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Next
                <ChevronRight aria-hidden="true" className="size-4" />
              </button>
            </div>
          </nav>
        </section>
      </div>
    </main>
  );
}
