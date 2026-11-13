```css app/globals.css
@import "tailwindcss";

@theme {
  --color-brand-50: oklch(0.97 0.02 185);
  --color-brand-100: oklch(0.94 0.04 185);
  --color-brand-200: oklch(0.88 0.07 185);
  --color-brand-300: oklch(0.8 0.09 185);
  --color-brand-500: oklch(0.6 0.1 185);
  --color-brand-600: oklch(0.52 0.1 185);
  --color-brand-700: oklch(0.45 0.09 185);
  --color-brand-800: oklch(0.38 0.07 185);
  --color-brand-900: oklch(0.3 0.05 185);
}

html {
  background: var(--color-stone-50);
  color: var(--color-stone-900);
}

body {
  min-height: 100dvh;
  background: var(--color-stone-50);
}

:focus-visible {
  outline: 2px solid var(--color-brand-600);
  outline-offset: 2px;
}

button,
select,
input,
a {
  touch-action: manipulation;
}

@media (prefers-reduced-motion: reduce) {
  * {
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
  }
}

@media print {
  html,
  body {
    background: white;
  }
}
```

```tsx app/guests/page.tsx
import { GuestsScreen } from "@/components/GuestsScreen";

export const metadata = { title: "Guests · Seatwise" };

export default function Page() {
  return <GuestsScreen />;
}
```

```tsx app/layout.tsx
import "./globals.css";

import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { PlanProvider } from "@/components/PlanProvider";
import { Toast } from "@/components/Toast";

export const metadata: Metadata = {
  title: "Seatwise",
  description: "Seating planner for wedding and event planners",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:shadow"
        >
          Skip to content
        </a>
        <PlanProvider>
          <Header />
          <main id="main" className="mx-auto w-full max-w-[1600px] px-4 py-4 sm:px-6 sm:py-5">
            {children}
          </main>
          <Toast />
        </PlanProvider>
      </body>
    </html>
  );
}
```

```tsx app/page.tsx
import { PlanScreen } from "@/components/PlanScreen";

export default function Page() {
  return <PlanScreen />;
}
```

```tsx components/GuestsScreen.tsx
"use client";

import { useMemo, useState } from "react";
import { Printer, Search, UtensilsCrossed, X } from "lucide-react";
import { DIETS, GUESTS, PARTIES, RSVP_LABEL, type Guest, type Rsvp } from "@/lib/data";
import { STANDARD_MEAL, mealOf, tableById } from "@/lib/plan";
import { Avatar, DietBadge } from "./PlanPanels";
import { usePlan } from "./PlanProvider";

const RSVP_STYLE: Record<Rsvp, string> = {
  yes: "bg-brand-100 text-brand-900",
  maybe: "bg-sky-100 text-sky-900",
  pending: "bg-stone-200 text-stone-800",
  no: "bg-red-100 text-red-900",
};

const field =
  "min-h-11 w-full rounded-lg border border-stone-300 bg-white px-3 text-sm text-stone-900 placeholder:text-stone-400";

const ROW = "md:grid-cols-[minmax(0,2fr)_minmax(0,1.5fr)_8rem_minmax(0,1.2fr)_minmax(0,1fr)]";

export function GuestsScreen() {
  const { where } = usePlan();
  const [q, setQ] = useState("");
  const [party, setParty] = useState("all");
  const [rsvp, setRsvp] = useState("all");
  const [diet, setDiet] = useState("all");
  const [seating, setSeating] = useState("all");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return GUESTS.filter((g) => {
      if (needle && !`${g.name} ${g.party} ${g.diet ?? ""}`.toLowerCase().includes(needle)) return false;
      if (party !== "all" && g.party !== party) return false;
      if (rsvp !== "all" && g.rsvp !== rsvp) return false;
      if (diet === "any" && !g.diet) return false;
      if (diet === "none" && g.diet) return false;
      if (diet !== "all" && diet !== "any" && diet !== "none" && mealOf(g) !== diet) return false;
      if (seating === "seated" && !where[g.id]) return false;
      if (seating === "unseated" && where[g.id]) return false;
      return true;
    });
  }, [q, party, rsvp, diet, seating, where]);

  const filtering = q || party !== "all" || rsvp !== "all" || diet !== "all" || seating !== "all";
  const reset = () => {
    setQ("");
    setParty("all");
    setRsvp("all");
    setDiet("all");
    setSeating("all");
  };

  const count = (r: Rsvp) => GUESTS.filter((g) => g.rsvp === r).length;

  return (
    <>
      <div className="mb-4 flex flex-wrap items-end gap-x-6 gap-y-3">
        <div className="mr-auto">
          <h1 className="text-xl font-semibold tracking-tight text-stone-900">Guest list</h1>
          <p className="text-sm text-stone-500">
            {GUESTS.length} invited · {count("yes")} attending · {count("maybe") + count("pending")} not confirmed ·{" "}
            {count("no")} declined
          </p>
        </div>
        <button
          type="button"
          onClick={() => window.print()}
          className="flex min-h-11 items-center gap-2 rounded-lg border border-stone-300 bg-white px-3.5 text-sm font-medium text-stone-800 hover:bg-stone-50 print:hidden"
        >
          <Printer size={16} aria-hidden="true" />
          Print for venue and caterer
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_21rem] lg:items-start">
        <section aria-labelledby="list-title" className="min-w-0">
          <h2 id="list-title" className="sr-only">
            Guests
          </h2>
          <form
            role="search"
            aria-label="Filter guests"
            onSubmit={(e) => e.preventDefault()}
            className="mb-3 grid gap-3 rounded-2xl border border-stone-200 bg-white p-3 shadow-sm sm:grid-cols-2 xl:grid-cols-[minmax(0,1.6fr)_repeat(4,minmax(0,1fr))] print:hidden"
          >
            <label className="relative block sm:col-span-2 xl:col-span-1">
              <span className="sr-only">Search guests</span>
              <Search size={16} aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search name, party or diet"
                className={`${field} pl-9`}
              />
            </label>
            <label className="block">
              <span className="sr-only">Party</span>
              <select value={party} onChange={(e) => setParty(e.target.value)} className={field}>
                <option value="all">All parties</option>
                {PARTIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="sr-only">RSVP</span>
              <select value={rsvp} onChange={(e) => setRsvp(e.target.value)} className={field}>
                <option value="all">Any RSVP</option>
                {(Object.keys(RSVP_LABEL) as Rsvp[]).map((r) => (
                  <option key={r} value={r}>
                    {RSVP_LABEL[r]}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="sr-only">Diet</span>
              <select value={diet} onChange={(e) => setDiet(e.target.value)} className={field}>
                <option value="all">Any diet</option>
                <option value="any">Has a dietary need</option>
                <option value="none">{STANDARD_MEAL}</option>
                {DIETS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="sr-only">Seating</span>
              <select value={seating} onChange={(e) => setSeating(e.target.value)} className={field}>
                <option value="all">Seated or not</option>
                <option value="seated">Seated</option>
                <option value="unseated">Not seated</option>
              </select>
            </label>
          </form>

          <div className="mb-2 flex items-center justify-between px-1 text-sm text-stone-600" aria-live="polite">
            <span>
              Showing <strong className="font-semibold text-stone-900">{filtered.length}</strong> of {GUESTS.length}{" "}
              guests
            </span>
            {filtering ? (
              <button
                type="button"
                onClick={reset}
                className="flex min-h-10 items-center gap-1.5 rounded-lg px-2.5 font-medium text-brand-800 hover:bg-brand-50 print:hidden"
              >
                <X size={15} aria-hidden="true" />
                Clear filters
              </button>
            ) : null}
          </div>

          <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
            <div
              aria-hidden="true"
              className={`hidden gap-4 border-b border-stone-200 bg-stone-50 px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-stone-500 md:grid ${ROW}`}
            >
              <span>Guest</span>
              <span>Party</span>
              <span>RSVP</span>
              <span>Diet</span>
              <span>Table</span>
            </div>
            {filtered.length === 0 ? (
              <p className="px-4 py-10 text-center text-sm text-stone-500">No guest matches these filters.</p>
            ) : (
              <ul className="divide-y divide-stone-100">
                {filtered.map((g) => (
                  <GuestRow key={g.id} guest={g} tableName={where[g.id] ? tableById[where[g.id].tableId].name : null} />
                ))}
              </ul>
            )}
          </div>
        </section>

        <MealCounts diet={diet} setDiet={setDiet} />
      </div>
    </>
  );
}

function GuestRow({ guest: g, tableName }: { guest: Guest; tableName: string | null }) {
  return (
    <li className={`grid gap-x-4 gap-y-1.5 px-4 py-3 md:items-center ${ROW}`}>
      <div className="flex min-w-0 items-center gap-3">
        <Avatar guest={g} />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-stone-900">{g.name}</p>
          <p className="truncate text-xs text-stone-500 md:hidden">{g.party}</p>
        </div>
      </div>
      <p className="hidden truncate text-sm text-stone-700 md:block">{g.party}</p>
      <div className="flex flex-wrap items-center gap-2 pl-12 md:contents">
        <span>
          <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${RSVP_STYLE[g.rsvp]}`}>
            {RSVP_LABEL[g.rsvp]}
          </span>
        </span>
        <span>{g.diet ? <DietBadge diet={g.diet} /> : <span className="text-xs text-stone-400">No dietary need</span>}</span>
        <span className="text-sm">
          {tableName ? (
            <span className="font-medium text-stone-900">{tableName}</span>
          ) : g.rsvp === "no" ? (
            <span className="text-stone-400">Not coming</span>
          ) : (
            <span className="text-stone-500">Not seated</span>
          )}
        </span>
      </div>
    </li>
  );
}

function MealCounts({ diet, setDiet }: { diet: string; setDiet: (d: string) => void }) {
  const rows = useMemo(() => {
    const map = new Map<string, { confirmed: number; awaiting: number }>();
    for (const g of GUESTS) {
      if (g.rsvp === "no") continue;
      const meal = mealOf(g);
      const row = map.get(meal) ?? { confirmed: 0, awaiting: 0 };
      if (g.rsvp === "yes") row.confirmed += 1;
      else row.awaiting += 1;
      map.set(meal, row);
    }
    return Array.from(map, ([meal, v]) => ({ meal, ...v })).sort(
      (a, b) =>
        Number(b.meal === STANDARD_MEAL) - Number(a.meal === STANDARD_MEAL) ||
        b.confirmed - a.confirmed ||
        a.meal.localeCompare(b.meal),
    );
  }, []);
  const confirmed = rows.reduce((n, r) => n + r.confirmed, 0);
  const awaiting = rows.reduce((n, r) => n + r.awaiting, 0);
  const max = Math.max(...rows.map((r) => r.confirmed));

  return (
    <aside
      aria-labelledby="meals-title"
      className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm lg:sticky lg:top-4"
    >
      <div className="flex items-center gap-2">
        <UtensilsCrossed size={18} aria-hidden="true" className="text-brand-700" />
        <h2 id="meals-title" className="text-base font-semibold text-stone-900">
          Meals for the caterer
        </h2>
      </div>
      <p className="mt-1 text-xs text-stone-500">
        Confirmed guests per meal. Awaiting counts guests who have not said yes or no yet.
      </p>
      <table className="mt-3 w-full text-sm">
        <caption className="sr-only">Meal counts</caption>
        <thead>
          <tr className="text-left text-xs uppercase tracking-wide text-stone-500">
            <th scope="col" className="pb-1.5 font-semibold">
              Meal
            </th>
            <th scope="col" className="pb-1.5 text-right font-semibold">
              Confirmed
            </th>
            <th scope="col" className="pb-1.5 text-right font-semibold">
              Awaiting
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-100">
          {rows.map((r) => {
            const key = r.meal === STANDARD_MEAL ? "none" : r.meal;
            const active = diet === key;
            return (
              <tr key={r.meal}>
                <th scope="row" className="py-0.5 pr-2 text-left font-normal">
                  <button
                    type="button"
                    aria-pressed={active}
                    onClick={() => setDiet(active ? "all" : key)}
                    title={`Filter the list to ${r.meal}`}
                    className={`flex min-h-10 w-full flex-col justify-center rounded-lg px-2 text-left hover:bg-stone-50 ${
                      active ? "bg-brand-50 font-medium text-brand-900" : "text-stone-800"
                    }`}
                  >
                    {r.meal}
                    <span aria-hidden="true" className="mt-1 block h-1 rounded-full bg-stone-100">
                      <span
                        className="block h-full rounded-full bg-brand-500"
                        style={{ width: `${(r.confirmed / max) * 100}%` }}
                      />
                    </span>
                  </button>
                </th>
                <td className="text-right text-base font-semibold tabular-nums text-stone-900">{r.confirmed}</td>
                <td className="pl-3 text-right tabular-nums text-stone-500">{r.awaiting || "–"}</td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-stone-300">
            <th scope="row" className="pt-2.5 text-left font-semibold text-stone-900">
              Total meals
            </th>
            <td className="pt-2.5 text-right text-lg font-semibold tabular-nums text-stone-900">{confirmed}</td>
            <td className="pt-2.5 pl-3 text-right tabular-nums text-stone-500">{awaiting}</td>
          </tr>
        </tfoot>
      </table>
      <p className="mt-3 rounded-lg bg-stone-50 px-3 py-2 text-xs text-stone-600">
        {rows.filter((r) => r.meal !== STANDARD_MEAL).reduce((n, r) => n + r.confirmed, 0)} of {confirmed} confirmed
        meals have a dietary need.
      </p>
    </aside>
  );
}
```

```tsx components/Header.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Armchair, CalendarDays, LayoutGrid, MapPin, Users } from "lucide-react";
import { EVENT, PLANNER } from "@/lib/data";
import { initials } from "@/lib/plan";

const NAV = [
  { href: "/", label: "Plan", icon: LayoutGrid },
  { href: "/guests", label: "Guests", icon: Users },
];

const DATE = new Date(`${EVENT.date}T12:00:00Z`).toLocaleDateString("en-GB", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

export function Header() {
  const pathname = usePathname();
  return (
    <header className="border-b border-stone-200 bg-white print:border-0">
      <div className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5 rounded-lg pr-1">
          <span className="grid size-9 place-items-center rounded-xl bg-brand-800 text-white">
            <Armchair size={19} aria-hidden="true" />
          </span>
          <span className="text-lg font-semibold tracking-tight text-stone-900">Seatwise</span>
        </Link>

        <nav aria-label="Main" className="order-last flex w-full gap-1 sm:order-none sm:w-auto print:hidden">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium transition-colors sm:flex-none ${
                  active ? "bg-brand-50 text-brand-800" : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
                }`}
              >
                <Icon size={17} aria-hidden="true" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex min-w-0 items-center gap-4">
          <div className="hidden min-w-0 text-right md:block">
            <p className="truncate font-serif text-base font-semibold text-stone-900">{EVENT.name}</p>
            <p className="flex items-center justify-end gap-3 text-xs text-stone-500">
              <span className="flex items-center gap-1">
                <CalendarDays size={12} aria-hidden="true" />
                {DATE}
              </span>
              <span className="flex items-center gap-1">
                <MapPin size={12} aria-hidden="true" />
                {EVENT.venue}
              </span>
            </p>
          </div>
          <div className="flex items-center gap-2" title={`Planner: ${PLANNER.name}`}>
            <span
              aria-hidden="true"
              className="grid size-9 place-items-center rounded-full bg-stone-800 text-xs font-semibold text-white"
            >
              {initials(PLANNER.name)}
            </span>
            <span className="hidden text-sm text-stone-700 lg:inline">{PLANNER.name}</span>
          </div>
        </div>
      </div>
      <p className="border-t border-stone-100 px-4 py-2 text-center text-xs text-stone-500 md:hidden">
        <span className="font-medium text-stone-700">{EVENT.name}</span> · {EVENT.venue}
      </p>
    </header>
  );
}
```

```tsx components/PlanPanels.tsx
"use client";

import { useState, type DragEvent } from "react";
import { CircleCheck, CircleDashed, TriangleAlert, UserMinus, Search, Armchair } from "lucide-react";
import { TABLES, type Guest } from "@/lib/data";
import { guestById, initials, partyColor, tableById } from "@/lib/plan";
import { usePlan } from "./PlanProvider";

const card = "rounded-2xl border border-stone-200 bg-white shadow-sm";

export function Avatar({ guest, size = "md" }: { guest: Guest; size?: "sm" | "md" }) {
  return (
    <span
      aria-hidden="true"
      className={`grid shrink-0 place-items-center rounded-full font-semibold text-white ${
        size === "sm" ? "size-8 text-[11px]" : "size-9 text-xs"
      }`}
      style={{ backgroundColor: partyColor(guest.party) }}
    >
      {initials(guest.name)}
    </span>
  );
}

export function DietBadge({ diet }: { diet: string }) {
  return (
    <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900">
      {diet}
    </span>
  );
}

/* ------------------------------------ stats ----------------------------------- */

export function StatsStrip() {
  const { seatedCount, unseatedAttending, totalSeats, results, perTable, selectedTable, selectTable } = usePlan();
  const broken = results.filter((r) => r.status === "broken").length;
  const free = totalSeats - seatedCount;

  const stats = [
    { label: "Seated", value: seatedCount, hint: `of ${totalSeats} seats` },
    { label: "Unseated", value: unseatedAttending.length, hint: "attending, need a seat" },
    { label: "Free seats", value: free, hint: "across all tables" },
    { label: "Broken rules", value: broken, hint: broken === 0 ? "all clear" : "need attention", alert: broken > 0 },
  ];

  return (
    <div className="mb-4 space-y-3">
      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className={`${card} px-4 py-3`}>
            <dt className="text-xs font-medium uppercase tracking-wide text-stone-500">{s.label}</dt>
            <dd className="mt-0.5 flex items-baseline gap-2">
              <span
                className={`text-3xl font-semibold tabular-nums ${s.alert ? "text-red-700" : "text-stone-900"}`}
              >
                {s.value}
              </span>
              <span className="truncate text-xs text-stone-600">{s.hint}</span>
            </dd>
          </div>
        ))}
      </dl>

      <ul aria-label="Guests per table" className="flex gap-2 overflow-x-auto pb-1">
        {TABLES.map((t) => {
          const n = perTable[t.id];
          const active = selectedTable === t.id;
          return (
            <li key={t.id} className="shrink-0">
              <button
                type="button"
                aria-pressed={active}
                onClick={() => selectTable(active ? null : t.id)}
                className={`flex min-h-11 items-center gap-2.5 rounded-xl border px-3 text-sm ${
                  active
                    ? "border-brand-600 bg-brand-50 text-brand-900"
                    : "border-stone-200 bg-white text-stone-700 hover:border-stone-300"
                }`}
              >
                <span className="font-medium">{t.name}</span>
                <span className="tabular-nums text-stone-600">
                  {n}/{t.seats}
                </span>
                <span aria-hidden="true" className="h-1.5 w-10 overflow-hidden rounded-full bg-stone-200">
                  <span
                    className={`block h-full rounded-full ${n >= t.seats ? "bg-brand-600" : "bg-brand-300"}`}
                    style={{ width: `${(n / t.seats) * 100}%` }}
                  />
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* -------------------------------- unseated list ------------------------------- */

function GuestChip({ guest }: { guest: Guest }) {
  const { selectedGuest, selectGuest } = usePlan();
  const active = selectedGuest === guest.id;
  return (
    <li>
      <button
        type="button"
        aria-pressed={active}
        draggable
        onDragStart={(e: DragEvent) => {
          e.dataTransfer.setData("text/plain", guest.id);
          e.dataTransfer.effectAllowed = "move";
        }}
        onClick={() => selectGuest(active ? null : guest.id)}
        className={`flex min-h-14 w-full items-center gap-3 rounded-xl border px-3 py-2 text-left transition-colors ${
          active
            ? "border-brand-600 bg-brand-50 ring-1 ring-brand-600"
            : "border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50"
        }`}
      >
        <Avatar guest={guest} />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-stone-900">{guest.name}</span>
          <span className="block truncate text-xs text-stone-500">
            {guest.party}
            {guest.rsvp !== "yes" ? ` · ${guest.rsvp === "maybe" ? "maybe" : "awaiting reply"}` : ""}
          </span>
        </span>
        {guest.diet ? <DietBadge diet={guest.diet} /> : null}
      </button>
    </li>
  );
}

export function UnseatedPanel() {
  const { unseatedAttending, unseatedUnconfirmed, where, unseat } = usePlan();
  const [q, setQ] = useState("");
  const [over, setOver] = useState(false);
  const match = (g: Guest) => !q.trim() || `${g.name} ${g.party}`.toLowerCase().includes(q.trim().toLowerCase());
  const list = unseatedAttending.filter(match);
  const more = unseatedUnconfirmed.filter(match);

  return (
    <section
      aria-labelledby="unseated-title"
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        const id = e.dataTransfer.getData("text/plain");
        if (where[id]) unseat(id);
      }}
      className={`${card} p-4 transition-colors ${over ? "border-brand-600 bg-brand-50" : ""}`}
    >
      <div className="flex items-center justify-between gap-2">
        <h2 id="unseated-title" className="text-base font-semibold text-stone-900">
          Needs a seat
        </h2>
        <span className="rounded-full bg-stone-900 px-2.5 py-0.5 text-xs font-semibold tabular-nums text-white">
          {unseatedAttending.length}
        </span>
      </div>
      <p className="mt-0.5 text-xs text-stone-500">
        {over ? "Drop to unseat this guest." : "Attending guests without a seat. Tap one, then tap a seat, or drag."}
      </p>

      <label className="relative mt-3 block">
        <span className="sr-only">Find an unseated guest</span>
        <Search size={15} aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Find a guest"
          className="min-h-10 w-full rounded-lg border border-stone-300 bg-white pl-9 pr-3 text-sm placeholder:text-stone-500"
        />
      </label>

      {list.length > 0 ? (
        <ul className="mt-3 max-h-80 space-y-2 overflow-y-auto pr-0.5">
          {list.map((g) => (
            <GuestChip key={g.id} guest={g} />
          ))}
        </ul>
      ) : (
        <p className="mt-3 flex items-center gap-2 rounded-xl bg-stone-50 px-3 py-3 text-sm text-stone-600">
          <CircleCheck size={16} aria-hidden="true" className="text-brand-600" />
          {q ? "No unseated guest matches." : "Every attending guest has a seat."}
        </p>
      )}

      {more.length > 0 ? (
        <details className="mt-3 group">
          <summary className="flex min-h-10 cursor-pointer items-center justify-between rounded-lg px-1 text-sm font-medium text-stone-700">
            Not confirmed yet
            <span className="text-xs tabular-nums text-stone-500">{more.length}</span>
          </summary>
          <ul className="mt-2 space-y-2">
            {more.map((g) => (
              <GuestChip key={g.id} guest={g} />
            ))}
          </ul>
        </details>
      ) : null}
    </section>
  );
}

/* --------------------------------- table detail -------------------------------- */

export function TablePanel() {
  const { selectedTable, seats, perTable, flagsByTable, selectedGuest, selectGuest, unseat, place } = usePlan();
  const table = selectedTable ? tableById[selectedTable] : null;

  if (!table) {
    return (
      <section aria-labelledby="table-title" className={`${card} p-4`}>
        <h2 id="table-title" className="text-base font-semibold text-stone-900">
          Table details
        </h2>
        <p className="mt-2 flex items-start gap-2 text-sm text-stone-500">
          <Armchair size={16} aria-hidden="true" className="mt-0.5 shrink-0" />
          Select a table to see who sits there and what they can eat.
        </p>
      </section>
    );
  }

  const guests = seats[table.id].flatMap((id) => (id ? [guestById[id]] : []));
  const free = table.seats - perTable[table.id];
  const flags = flagsByTable[table.id] ?? [];
  const dietCounts = new Map<string, number>();
  for (const g of guests) if (g.diet) dietCounts.set(g.diet, (dietCounts.get(g.diet) ?? 0) + 1);
  const targets = TABLES.filter((t) => t.id !== table.id && perTable[t.id] < t.seats);

  return (
    <section aria-labelledby="table-title" className={`${card} p-4`}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 id="table-title" className="text-base font-semibold text-stone-900">
            {table.name}
          </h2>
          <p className="text-xs text-stone-500">
            {guests.length} of {table.seats} seats filled · {free} free
          </p>
        </div>
        {free > 0 && selectedGuest ? (
          <button
            type="button"
            onClick={() => place(selectedGuest, table.id)}
            className="min-h-10 rounded-lg bg-brand-800 px-3 text-sm font-medium text-white hover:bg-brand-900"
          >
            Seat here
          </button>
        ) : null}
      </div>

      {flags.length > 0 ? (
        <ul className="mt-3 space-y-1.5">
          {flags.map((r) => (
            <li key={r.id} className="flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-900">
              <TriangleAlert size={14} aria-hidden="true" className="mt-0.5 shrink-0" />
              <span>
                <strong className="font-semibold">{r.title}.</strong> {r.detail}
              </span>
            </li>
          ))}
        </ul>
      ) : null}

      <h3 className="mt-4 text-xs font-semibold uppercase tracking-wide text-stone-500">Dietary needs</h3>
      {dietCounts.size > 0 ? (
        <ul className="mt-1.5 flex flex-wrap gap-1.5">
          {Array.from(dietCounts).map(([diet, n]) => (
            <li key={diet} className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-900">
              {n} × {diet}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-1 text-sm text-stone-500">None at this table.</p>
      )}

      <h3 className="mt-4 text-xs font-semibold uppercase tracking-wide text-stone-500">Guests</h3>
      {guests.length === 0 ? (
        <p className="mt-1 text-sm text-stone-500">Nobody is seated here yet.</p>
      ) : (
        <ul className="mt-1.5 divide-y divide-stone-100">
          {guests.map((g) => {
            const active = selectedGuest === g.id;
            return (
              <li key={g.id} className={`flex items-center gap-2 py-2 ${active ? "bg-brand-50" : ""}`}>
                <button
                  type="button"
                  aria-pressed={active}
                  onClick={() => selectGuest(active ? null : g.id)}
                  className="flex min-h-11 min-w-0 flex-1 items-center gap-3 rounded-lg text-left"
                >
                  <Avatar guest={g} size="sm" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-stone-900">{g.name}</span>
                    <span className="block truncate text-xs text-stone-500">
                      {g.diet ? <span className="font-medium text-amber-800">{g.diet}</span> : "No dietary needs"}
                      {" · "}
                      {g.party}
                    </span>
                  </span>
                </button>
                <select
                  aria-label={`Move ${g.name} to another table`}
                  value=""
                  onChange={(e) => {
                    if (e.target.value) place(g.id, e.target.value);
                  }}
                  className="min-h-10 w-24 rounded-lg border border-stone-300 bg-white px-1.5 text-xs text-stone-700"
                >
                  <option value="">Move to…</option>
                  {targets.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.seats - perTable[t.id]} free)
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => unseat(g.id)}
                  aria-label={`Unseat ${g.name}`}
                  title="Unseat"
                  className="grid size-10 shrink-0 place-items-center rounded-lg border border-stone-300 text-stone-600 hover:border-red-300 hover:bg-red-50 hover:text-red-700"
                >
                  <UserMinus size={16} aria-hidden="true" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
      {free > 0 ? (
        <p className="mt-3 rounded-lg bg-stone-50 px-3 py-2 text-xs text-stone-600">
          {free} empty {free === 1 ? "seat" : "seats"}. Pick a guest from the list, then tap an empty seat.
        </p>
      ) : null}
    </section>
  );
}

/* ----------------------------------- rules ------------------------------------ */

export function RulesPanel() {
  const { results, selectTable } = usePlan();
  const order = { broken: 0, open: 1, ok: 2 } as const;
  const sorted = [...results].sort((a, b) => order[a.status] - order[b.status]);
  const broken = results.filter((r) => r.status === "broken").length;
  const open = results.filter((r) => r.status === "open").length;
  const ok = results.filter((r) => r.status === "ok").length;

  return (
    <section aria-labelledby="rules-title" className={`${card} p-4`}>
      <h2 id="rules-title" className="text-base font-semibold text-stone-900">
        The couple&apos;s rules
      </h2>
      <p className="mt-0.5 text-xs text-stone-500" aria-live="polite">
        {broken > 0 ? (
          <span className="font-semibold text-red-700">
            {broken} broken
          </span>
        ) : (
          <span className="font-semibold text-brand-700">None broken</span>
        )}
        {" · "}
        {open} waiting for a seat · {ok} kept
      </p>
      <ul className="mt-3 space-y-2">
        {sorted.map((r) => {
          const Icon = r.status === "broken" ? TriangleAlert : r.status === "open" ? CircleDashed : CircleCheck;
          const tone =
            r.status === "broken"
              ? "border-red-200 bg-red-50 text-red-900"
              : r.status === "open"
                ? "border-stone-200 bg-stone-50 text-stone-800"
                : "border-brand-100 bg-brand-50 text-brand-900";
          const word = r.status === "broken" ? "Broken" : r.status === "open" ? "Open" : "Kept";
          const body = (
            <>
              <Icon size={16} aria-hidden="true" className="mt-0.5 shrink-0" />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium">
                  <span className="sr-only">{word}: </span>
                  {r.title}
                </span>
                <span className="block text-xs opacity-90">{r.detail}</span>
                <span className="mt-0.5 block text-xs italic opacity-70">{r.rule.note}</span>
              </span>
            </>
          );
          return (
            <li key={r.id}>
              {r.tableIds.length > 0 ? (
                <button
                  type="button"
                  onClick={() => selectTable(r.tableIds[0])}
                  className={`flex min-h-11 w-full items-start gap-2.5 rounded-xl border px-3 py-2.5 text-left ${tone}`}
                >
                  {body}
                </button>
              ) : (
                <div className={`flex items-start gap-2.5 rounded-xl border px-3 py-2.5 ${tone}`}>{body}</div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
```

```tsx components/PlanProvider.tsx
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";
import { GUESTS, TABLES, type Guest } from "@/lib/data";
import {
  brokenByTable,
  brokenGuestSet,
  cloneSeats,
  evaluateRules,
  guestById,
  initialSeats,
  placementsOf,
  tableById,
  type Placement,
  type RuleResult,
  type Seats,
} from "@/lib/plan";

interface State {
  seats: Seats;
  history: Seats[];
  selectedGuest: string | null;
  selectedTable: string | null;
  note: string;
  noteId: number;
}

type Action =
  | { type: "place"; guestId: string; tableId: string; seat?: number }
  | { type: "unseat"; guestId: string }
  | { type: "undo" }
  | { type: "selectGuest"; guestId: string | null }
  | { type: "selectTable"; tableId: string | null }
  | { type: "clearNote" };

const initialState: State = {
  seats: initialSeats(),
  history: [],
  selectedGuest: null,
  selectedTable: "t-1",
  note: "",
  noteId: 0,
};

function say(state: State, note: string): State {
  return { ...state, note, noteId: state.noteId + 1 };
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "selectGuest":
      return { ...state, selectedGuest: action.guestId };
    case "selectTable":
      return { ...state, selectedTable: action.tableId };
    case "clearNote":
      return { ...state, note: "" };
    case "undo": {
      const prev = state.history[state.history.length - 1];
      if (!prev) return state;
      return say(
        { ...state, seats: prev, history: state.history.slice(0, -1), selectedGuest: null },
        "Last change undone",
      );
    }
    case "unseat": {
      const guest = guestById[action.guestId];
      const at = placementsOf(state.seats)[action.guestId];
      if (!guest || !at) return state;
      const seats = cloneSeats(state.seats);
      seats[at.tableId][at.seat] = null;
      return say(
        {
          ...state,
          seats,
          history: [...state.history.slice(-49), state.seats],
          selectedGuest: null,
        },
        `${guest.name} unseated from ${tableById[at.tableId].name}`,
      );
    }
    case "place": {
      const guest = guestById[action.guestId];
      const table = tableById[action.tableId];
      const row = state.seats[action.tableId];
      if (!guest || !table || !row || guest.rsvp === "no") return state;
      const cur = placementsOf(state.seats)[action.guestId];

      let idx = action.seat;
      if (idx === undefined || idx < 0 || idx >= row.length) idx = undefined;
      // An unseated guest dropped on someone else's seat takes a free seat instead, if there is one.
      if (idx !== undefined && !cur && row[idx] && row.includes(null)) idx = undefined;
      if (idx === undefined) {
        if (cur && cur.tableId === action.tableId) {
          return say({ ...state, selectedGuest: null }, `${guest.name} is already at ${table.name}`);
        }
        idx = row.indexOf(null);
        if (idx < 0) return say(state, `${table.name} is full`);
      }
      const occupantId = row[idx];
      if (occupantId === action.guestId) return { ...state, selectedGuest: null };

      const seats = cloneSeats(state.seats);
      if (cur) seats[cur.tableId][cur.seat] = occupantId;
      seats[action.tableId][idx] = action.guestId;

      let note: string;
      const occupant = occupantId ? guestById[occupantId] : null;
      if (occupant && cur) note = `${guest.name} and ${occupant.name} swapped seats`;
      else if (occupant) note = `${guest.name} seated at ${table.name}; ${occupant.name} is now unseated`;
      else if (cur) note = `${guest.name} moved to ${table.name}`;
      else note = `${guest.name} seated at ${table.name}`;

      return say(
        {
          ...state,
          seats,
          history: [...state.history.slice(-49), state.seats],
          selectedGuest: null,
          selectedTable: action.tableId,
        },
        note,
      );
    }
  }
}

interface PlanContextValue {
  seats: Seats;
  where: Record<string, Placement>;
  results: RuleResult[];
  flagsByTable: Record<string, RuleResult[]>;
  brokenGuests: Set<string>;
  /** Attending (RSVP yes) guests without a seat. */
  unseatedAttending: Guest[];
  /** Maybe / awaiting reply guests without a seat. */
  unseatedUnconfirmed: Guest[];
  seatedCount: number;
  attendingCount: number;
  totalSeats: number;
  perTable: Record<string, number>;
  selectedGuest: string | null;
  selectedTable: string | null;
  note: string;
  noteId: number;
  canUndo: boolean;
  place: (guestId: string, tableId: string, seat?: number) => void;
  unseat: (guestId: string) => void;
  undo: () => void;
  selectGuest: (guestId: string | null) => void;
  selectTable: (tableId: string | null) => void;
  dismissNote: () => void;
}

const PlanContext = createContext<PlanContextValue | null>(null);

export function PlanProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    if (!state.note) return;
    const timer = setTimeout(() => dispatch({ type: "clearNote" }), 6000);
    return () => clearTimeout(timer);
  }, [state.note, state.noteId]);

  const place = useCallback(
    (guestId: string, tableId: string, seat?: number) => dispatch({ type: "place", guestId, tableId, seat }),
    [],
  );
  const unseat = useCallback((guestId: string) => dispatch({ type: "unseat", guestId }), []);
  const undo = useCallback(() => dispatch({ type: "undo" }), []);
  const selectGuest = useCallback((guestId: string | null) => dispatch({ type: "selectGuest", guestId }), []);
  const selectTable = useCallback((tableId: string | null) => dispatch({ type: "selectTable", tableId }), []);
  const dismissNote = useCallback(() => dispatch({ type: "clearNote" }), []);

  const value = useMemo<PlanContextValue>(() => {
    const where = placementsOf(state.seats);
    const results = evaluateRules(state.seats);
    const sort = (a: Guest, b: Guest) => a.party.localeCompare(b.party) || a.name.localeCompare(b.name);
    const unseatedAttending = GUESTS.filter((g) => g.rsvp === "yes" && !where[g.id]).sort(sort);
    const unseatedUnconfirmed = GUESTS.filter(
      (g) => (g.rsvp === "maybe" || g.rsvp === "pending") && !where[g.id],
    ).sort(sort);
    const perTable: Record<string, number> = {};
    for (const t of TABLES) perTable[t.id] = state.seats[t.id].filter(Boolean).length;
    return {
      seats: state.seats,
      where,
      results,
      flagsByTable: brokenByTable(results),
      brokenGuests: brokenGuestSet(results),
      unseatedAttending,
      unseatedUnconfirmed,
      seatedCount: Object.keys(where).length,
      attendingCount: GUESTS.filter((g) => g.rsvp === "yes").length,
      totalSeats: TABLES.reduce((n, t) => n + t.seats, 0),
      perTable,
      selectedGuest: state.selectedGuest,
      selectedTable: state.selectedTable,
      note: state.note,
      noteId: state.noteId,
      canUndo: state.history.length > 0,
      place,
      unseat,
      undo,
      selectGuest,
      selectTable,
      dismissNote,
    };
  }, [state, place, unseat, undo, selectGuest, selectTable, dismissNote]);

  return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>;
}

export function usePlan(): PlanContextValue {
  const ctx = useContext(PlanContext);
  if (!ctx) throw new Error("usePlan must be used inside PlanProvider");
  return ctx;
}
```

```tsx components/PlanScreen.tsx
"use client";

import { RoomPlan } from "./RoomPlan";
import { RulesPanel, StatsStrip, TablePanel, UnseatedPanel } from "./PlanPanels";

export function PlanScreen() {
  return (
    <>
      <StatsStrip />
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_21rem] lg:items-start">
        <RoomPlan />
        <aside
          aria-label="Seating tools"
          className="space-y-4 lg:sticky lg:top-4 lg:max-h-[calc(100dvh-2rem)] lg:overflow-y-auto lg:pb-1"
        >
          <UnseatedPanel />
          <TablePanel />
          <RulesPanel />
        </aside>
      </div>
    </>
  );
}
```

```tsx components/RoomPlan.tsx
"use client";

import { useEffect, useState, type CSSProperties, type DragEvent } from "react";
import { TriangleAlert, Undo2, X, ZoomIn } from "lucide-react";
import { EVENT, FIXTURES, PARTIES, TABLES, type Fixture, type Table } from "@/lib/data";
import {
  LONG_H,
  ROUND_D,
  SEAT_D,
  firstName,
  guestById,
  initials,
  partyColor,
  seatPositions,
  tableCenter,
} from "@/lib/plan";
import { usePlan } from "./PlanProvider";

const { width: ROOM_W, depth: ROOM_D } = EVENT.room_m;
const pctX = (m: number) => `${(m / ROOM_W) * 100}%`;
const pctY = (m: number) => `${(m / ROOM_D) * 100}%`;

const ZOOMS = [
  { label: "Fit", value: 1 },
  { label: "150%", value: 1.5 },
  { label: "200%", value: 2 },
];

const FIXTURE_STYLE: Record<Fixture["kind"], string> = {
  stage: "rounded-md bg-stone-800 text-stone-100",
  dancefloor: "rounded-md border border-amber-300 bg-amber-100/70 text-amber-900",
  bar: "rounded-md bg-amber-900 text-amber-50",
  door: "rounded-sm bg-brand-700 text-white",
};

export function RoomPlan() {
  const plan = usePlan();
  const { seats, selectedGuest, selectedTable, canUndo, undo, selectGuest } = plan;
  const [zoom, setZoom] = useState(1);
  const [hover, setHover] = useState<string | null>(null);
  const held = selectedGuest ? guestById[selectedGuest] : null;

  useEffect(() => {
    if (!selectedGuest) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") selectGuest(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedGuest, selectGuest]);

  const readDrop = (e: DragEvent): string | null => {
    e.preventDefault();
    setHover(null);
    const id = e.dataTransfer.getData("text/plain");
    return guestById[id] ? id : null;
  };

  const startDrag = (e: DragEvent, guestId: string) => {
    e.dataTransfer.setData("text/plain", guestId);
    e.dataTransfer.effectAllowed = "move";
  };

  const allowDrop = (e: DragEvent, key: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (hover !== key) setHover(key);
  };

  return (
    <section aria-labelledby="plan-title" className="min-w-0">
      <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-2">
        <div className="mr-auto">
          <h1 id="plan-title" className="text-xl font-semibold tracking-tight text-stone-900">
            Room plan
          </h1>
          <p className="text-sm text-stone-500">
            {ROOM_W} × {ROOM_D} m, drawn to scale. Each grid square is 1 m.
          </p>
        </div>
        <div role="group" aria-label="Zoom" className="flex items-center rounded-lg bg-stone-200/70 p-1 print:hidden">
          <ZoomIn size={16} aria-hidden="true" className="mx-1.5 text-stone-500" />
          {ZOOMS.map((z) => (
            <button
              key={z.label}
              type="button"
              aria-pressed={zoom === z.value}
              onClick={() => setZoom(z.value)}
              className={`min-h-9 rounded-md px-3 text-sm font-medium ${
                zoom === z.value ? "bg-white text-stone-900 shadow-sm" : "text-stone-600 hover:text-stone-900"
              }`}
            >
              {z.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={undo}
          disabled={!canUndo}
          className="flex min-h-11 items-center gap-2 rounded-lg border border-stone-300 bg-white px-3.5 text-sm font-medium text-stone-800 hover:bg-stone-50 disabled:opacity-40 print:hidden"
        >
          <Undo2 size={16} aria-hidden="true" />
          Undo
        </button>
      </div>

      {held ? (
        <div
          role="status"
          className="mb-3 flex items-center gap-3 rounded-xl border border-brand-300 bg-brand-50 px-4 py-2.5 text-sm text-brand-900"
        >
          <span className="flex-1">
            Placing <strong className="font-semibold">{held.name}</strong>. Tap an empty seat or a table, or tap a
            seated guest to swap.
          </span>
          <button
            type="button"
            onClick={() => selectGuest(null)}
            className="flex min-h-9 items-center gap-1.5 rounded-lg px-2.5 font-medium hover:bg-brand-100"
          >
            <X size={15} aria-hidden="true" />
            Cancel
          </button>
        </div>
      ) : null}

      <div className="overflow-x-auto rounded-2xl border border-stone-200 bg-white shadow-sm">
        <div
          className="@container relative"
          style={{
            width: `${zoom * 100}%`,
            minWidth: 760 * zoom,
            aspectRatio: `${ROOM_W} / ${ROOM_D}`,
            backgroundColor: "oklch(0.975 0.008 85)",
            backgroundImage:
              "linear-gradient(to right, oklch(0.5 0.02 85 / 0.09) 1px, transparent 1px), linear-gradient(to bottom, oklch(0.5 0.02 85 / 0.09) 1px, transparent 1px)",
            backgroundSize: `${100 / ROOM_W}% ${100 / ROOM_D}%`,
          }}
        >
          {FIXTURES.map((f) => (
            <FixtureBox key={f.id} fixture={f} />
          ))}

          {TABLES.map((t) => (
            <TableView
              key={t.id}
              table={t}
              hover={hover}
              onDragStart={startDrag}
              allowDrop={allowDrop}
              clearHover={() => setHover(null)}
              readDrop={readDrop}
              selected={selectedTable === t.id}
              guestIds={seats[t.id]}
            />
          ))}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-stone-600">
        <span className="flex items-center gap-1.5">
          <span className="size-4 rounded-full border border-dashed border-stone-400 bg-white" /> Empty seat
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-3 rounded-full bg-amber-400 ring-1 ring-stone-300" /> Dietary need
        </span>
        <span className="flex items-center gap-1.5">
          <span className="grid size-4 place-items-center rounded-full bg-red-600 text-white">
            <TriangleAlert size={10} aria-hidden="true" />
          </span>
          Broken rule
        </span>
        <span className="hidden h-4 w-px bg-stone-300 sm:block" />
        {PARTIES.map((p) => (
          <span key={p} className="flex items-center gap-1.5">
            <span className="size-3 rounded-full" style={{ backgroundColor: partyColor(p) }} />
            {p}
          </span>
        ))}
      </div>
      <p className="mt-2 text-xs text-stone-500 sm:hidden">Swipe the plan sideways to see the whole room.</p>
    </section>
  );
}

function FixtureBox({ fixture: f }: { fixture: Fixture }) {
  const vertical = f.kind === "door";
  return (
    <div
      className={`absolute grid place-items-center overflow-hidden font-medium ${FIXTURE_STYLE[f.kind]}`}
      style={{
        left: pctX(f.x),
        top: pctY(f.y),
        width: pctX(f.w),
        height: pctY(f.h),
        fontSize: "max(9px, 1.05cqw)",
      }}
      role="img"
      aria-label={f.label}
    >
      <span
        className="whitespace-nowrap uppercase tracking-wider"
        style={vertical ? { writingMode: "vertical-rl", transform: "rotate(180deg)", fontSize: "max(8px, 0.8cqw)" } : undefined}
      >
        {f.label}
      </span>
    </div>
  );
}

interface TableViewProps {
  table: Table;
  guestIds: (string | null)[];
  selected: boolean;
  hover: string | null;
  onDragStart: (e: DragEvent, guestId: string) => void;
  allowDrop: (e: DragEvent, key: string) => void;
  clearHover: () => void;
  readDrop: (e: DragEvent) => string | null;
}

function TableView({ table, guestIds, selected, hover, onDragStart, allowDrop, clearHover, readDrop }: TableViewProps) {
  const { flagsByTable, brokenGuests, selectedGuest, perTable, place, selectGuest, selectTable } = usePlan();
  const flagCount = flagsByTable[table.id]?.length ?? 0;
  const broken = flagCount > 0;
  const count = perTable[table.id];
  const full = count >= table.seats;
  const c = tableCenter(table);
  const round = table.shape === "round";
  const w = round ? ROUND_D : table.seats;
  const h = round ? ROUND_D : LONG_H;
  const positions = seatPositions(table);
  const isHover = hover === `${table.id}:body`;

  const onTableTap = () => {
    if (selectedGuest) place(selectedGuest, table.id);
    else selectTable(selected ? null : table.id);
  };

  const label = `seats filled${
    broken ? `, ${flagCount} broken rule${flagCount > 1 ? "s" : ""}` : ""
  }`;

  return (
    <>
      <button
        type="button"
        aria-pressed={selected}
        onClick={onTableTap}
        onDragOver={(e) => allowDrop(e, `${table.id}:body`)}
        onDragLeave={clearHover}
        onDrop={(e) => {
          const id = readDrop(e);
          if (id) place(id, table.id);
        }}
        className={`absolute grid place-content-center border-2 text-center shadow-sm transition-colors ${
          round ? "rounded-full" : "rounded-lg"
        } ${
          isHover
            ? "border-brand-600 bg-brand-100"
            : selected
              ? "border-brand-600 bg-brand-50"
              : broken
                ? "border-red-500 bg-red-50"
                : "border-stone-300 bg-white hover:border-stone-400"
        }`}
        style={{
          left: pctX(c.x - w / 2),
          top: pctY(c.y - h / 2),
          width: pctX(w),
          height: pctY(h),
          fontSize: "max(9px, 1.05cqw)",
        }}
      >
        <span className="block font-semibold leading-tight text-stone-900">{table.name}</span>
        <span className="sr-only"> {label}</span>
        <span
          className={`block text-[0.85em] font-medium tabular-nums leading-tight ${
            full ? "text-brand-800" : "text-stone-600"
          }`}
        >
          {count}/{table.seats}
        </span>
        {broken ? (
          <span className="absolute -right-1.5 -top-1.5 grid size-[1.7em] place-items-center rounded-full bg-red-600 text-white ring-2 ring-white">
            <TriangleAlert style={{ width: "62%", height: "62%" }} aria-hidden="true" />
          </span>
        ) : null}
      </button>

      {positions.map((pos, i) => {
        const gid = guestIds[i];
        const guest = gid ? guestById[gid] : null;
        const key = `${table.id}:${i}`;
        const isHeld = Boolean(guest && selectedGuest === guest.id);
        const isBroken = Boolean(guest && brokenGuests.has(guest.id));
        const hovered = hover === key;
        const aria = guest
          ? `${initials(guest.name)} ${table.name}, seat ${i + 1}: ${guest.name}${guest.diet ? `, ${guest.diet}` : ""}${
              isBroken ? ", broken rule" : ""
            }`
          : `${table.name}, seat ${i + 1}: empty`;

        const onSeatTap = () => {
          if (selectedGuest) {
            if (guest && guest.id === selectedGuest) selectGuest(null);
            else place(selectedGuest, table.id, i);
          } else if (guest) {
            selectGuest(guest.id);
            selectTable(table.id);
          } else {
            selectTable(table.id);
          }
        };

        const seatStyle: CSSProperties = {
          left: pctX(pos.x),
          top: pctY(pos.y),
          width: pctX(SEAT_D),
          aspectRatio: "1",
          transform: "translate(-50%, -50%)",
          fontSize: "max(8px, 0.95cqw)",
          ...(guest ? { backgroundColor: partyColor(guest.party) } : null),
        };

        return (
          <div key={key}>
            <button
              type="button"
              aria-label={aria}
              aria-pressed={guest ? isHeld : undefined}
              title={guest ? `${guest.name}${guest.diet ? ` · ${guest.diet}` : ""}` : `${table.name}, seat ${i + 1}`}
              draggable={Boolean(guest)}
              onDragStart={guest ? (e) => onDragStart(e, guest.id) : undefined}
              onDragOver={(e) => allowDrop(e, key)}
              onDragLeave={clearHover}
              onDrop={(e) => {
                const id = readDrop(e);
                if (id) place(id, table.id, i);
              }}
              onClick={onSeatTap}
              className={`absolute grid place-items-center rounded-full font-semibold leading-none transition-transform ${
                guest
                  ? "text-white shadow"
                  : `border border-dashed bg-white/90 text-stone-400 ${
                      selectedGuest ? "border-brand-500 ring-2 ring-brand-200" : "border-stone-400"
                    } hover:border-brand-600 hover:bg-brand-50`
              } ${isBroken ? "ring-2 ring-red-600 ring-offset-1" : ""} ${
                isHeld ? "ring-[3px] ring-brand-900 ring-offset-2" : ""
              } ${hovered ? "scale-125 ring-2 ring-brand-600" : ""}`}
              style={seatStyle}
            >
              {guest ? <span aria-hidden="true">{initials(guest.name)}</span> : null}
              {guest?.diet ? (
                <span
                  aria-hidden="true"
                  className="absolute -right-[8%] -top-[8%] size-[34%] rounded-full bg-amber-400 ring-1 ring-white"
                />
              ) : null}
            </button>
            {guest ? (
              <span
                aria-hidden="true"
                className="pointer-events-none absolute hidden whitespace-nowrap font-medium text-stone-700 @min-[1300px]:block"
                style={{
                  left: pctX(pos.x + Math.cos(pos.angle) * (SEAT_D / 2 + 0.15)),
                  top: pctY(pos.y + Math.sin(pos.angle) * (SEAT_D / 2 + 0.15)),
                  transform: `translate(${-50 + 50 * Math.cos(pos.angle)}%, ${-50 + 50 * Math.sin(pos.angle)}%)`,
                  fontSize: "max(10px, 0.85cqw)",
                }}
              >
                {firstName(guest.name)}
              </span>
            ) : null}
          </div>
        );
      })}
    </>
  );
}
```

```tsx components/Toast.tsx
"use client";

import { Undo2, X } from "lucide-react";
import { usePlan } from "./PlanProvider";

export function Toast() {
  const { note, canUndo, undo, dismissNote } = usePlan();
  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-4 print:hidden"
    >
      {note ? (
        <div className="pointer-events-auto flex max-w-xl items-center gap-3 rounded-xl bg-stone-900 py-2 pl-4 pr-2 text-sm text-white shadow-lg">
          <span>{note}</span>
          {canUndo ? (
            <button
              type="button"
              onClick={undo}
              className="flex min-h-9 items-center gap-1.5 rounded-lg bg-white/10 px-3 font-medium hover:bg-white/20"
            >
              <Undo2 size={15} aria-hidden="true" />
              Undo
            </button>
          ) : null}
          <button
            type="button"
            onClick={dismissNote}
            aria-label="Dismiss message"
            className="grid size-9 place-items-center rounded-lg hover:bg-white/10"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>
      ) : null}
    </div>
  );
}
```

```ts lib/data.ts
export type Rsvp = "yes" | "maybe" | "pending" | "no";
export type FixtureKind = "stage" | "dancefloor" | "bar" | "door";
export type TableShape = "long" | "round";
export type RuleKind = "together" | "apart" | "near";

export interface Fixture {
  id: string;
  kind: FixtureKind;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Table {
  id: string;
  name: string;
  shape: TableShape;
  seats: number;
  x: number;
  y: number;
  rotation?: number;
}

export interface Guest {
  id: string;
  name: string;
  party: string;
  rsvp: Rsvp;
  diet: string | null;
  table: string | null;
}

export interface Rule {
  kind: RuleKind;
  guests: string[];
  note: string;
}

export const APP = "Seatwise, a seating planner for wedding and event planners";

export const EVENT = {
  name: "Ines & Mateo's wedding dinner",
  date: "2027-06-19",
  venue: "The Orangery, Hollin Hall",
  room_m: { width: 24, depth: 14 },
};

export const PLANNER = { name: "Hannah Brook" };

export const FIXTURES: Fixture[] = [
  { id: "f-1", kind: "stage", label: "Band", x: 10, y: 0.5, w: 4, h: 2 },
  { id: "f-2", kind: "dancefloor", label: "Dance floor", x: 8.5, y: 3, w: 7, h: 4 },
  { id: "f-3", kind: "bar", label: "Bar", x: 21, y: 10, w: 2.5, h: 3.5 },
  { id: "f-4", kind: "door", label: "Garden doors", x: 0, y: 6, w: 0.5, h: 2.5 },
];

export const TABLES: Table[] = [
  { id: "t-head", name: "Top table", shape: "long", seats: 8, x: 8, y: 8.2, rotation: 0 },
  { id: "t-1", name: "Table 1", shape: "round", seats: 8, x: 3, y: 2.5 },
  { id: "t-2", name: "Table 2", shape: "round", seats: 8, x: 3, y: 7 },
  { id: "t-3", name: "Table 3", shape: "round", seats: 8, x: 3, y: 11.5 },
  { id: "t-4", name: "Table 4", shape: "round", seats: 8, x: 19, y: 2.5 },
  { id: "t-5", name: "Table 5", shape: "round", seats: 8, x: 19, y: 7 },
  { id: "t-6", name: "Table 6", shape: "round", seats: 6, x: 12, y: 12 },
];

export const GUESTS: Guest[] = [
  { id: "g-01", name: "Ines Carvalho", party: "Couple", rsvp: "yes", diet: null, table: "t-head" },
  { id: "g-02", name: "Mateo Alvarez", party: "Couple", rsvp: "yes", diet: "Vegetarian", table: "t-head" },
  { id: "g-03", name: "Rui Carvalho", party: "Bride's family", rsvp: "yes", diet: null, table: "t-head" },
  { id: "g-04", name: "Marta Carvalho", party: "Bride's family", rsvp: "yes", diet: "Gluten free", table: "t-head" },
  { id: "g-05", name: "Javier Alvarez", party: "Groom's family", rsvp: "yes", diet: null, table: "t-head" },
  { id: "g-06", name: "Lucia Alvarez", party: "Groom's family", rsvp: "yes", diet: null, table: "t-head" },
  { id: "g-07", name: "Sofia Carvalho", party: "Bride's family", rsvp: "yes", diet: null, table: "t-1" },
  { id: "g-08", name: "Tiago Carvalho", party: "Bride's family", rsvp: "yes", diet: null, table: "t-1" },
  { id: "g-09", name: "Avó Rosa Carvalho", party: "Bride's family", rsvp: "yes", diet: "Soft food", table: "t-1" },
  { id: "g-10", name: "Pedro Nunes", party: "Bride's family", rsvp: "yes", diet: null, table: "t-1" },
  { id: "g-11", name: "Ana Nunes", party: "Bride's family", rsvp: "yes", diet: "Vegan", table: "t-1" },
  { id: "g-12", name: "Carmen Alvarez", party: "Groom's family", rsvp: "yes", diet: null, table: "t-4" },
  { id: "g-13", name: "Diego Alvarez", party: "Groom's family", rsvp: "yes", diet: null, table: "t-4" },
  { id: "g-14", name: "Elena Ruiz", party: "Groom's family", rsvp: "yes", diet: "Nut allergy", table: "t-4" },
  { id: "g-15", name: "Pablo Ruiz", party: "Groom's family", rsvp: "yes", diet: null, table: "t-4" },
  { id: "g-16", name: "Isabel Ruiz", party: "Groom's family", rsvp: "maybe", diet: null, table: null },
  { id: "g-17", name: "Chloe Martin", party: "University friends", rsvp: "yes", diet: null, table: "t-2" },
  { id: "g-18", name: "Ben Okafor", party: "University friends", rsvp: "yes", diet: null, table: "t-2" },
  { id: "g-19", name: "Leila Haddad", party: "University friends", rsvp: "yes", diet: "Halal", table: "t-2" },
  { id: "g-20", name: "Omar Haddad", party: "University friends", rsvp: "yes", diet: "Halal", table: "t-2" },
  { id: "g-21", name: "Freya Lund", party: "University friends", rsvp: "yes", diet: "Vegetarian", table: null },
  { id: "g-22", name: "Jonas Lund", party: "University friends", rsvp: "yes", diet: null, table: null },
  { id: "g-23", name: "Grace Lee", party: "Work friends", rsvp: "yes", diet: null, table: "t-5" },
  { id: "g-24", name: "Marcus Webb", party: "Work friends", rsvp: "yes", diet: null, table: "t-5" },
  { id: "g-25", name: "Nadia Petrova", party: "Work friends", rsvp: "yes", diet: "Pescatarian", table: "t-5" },
  { id: "g-26", name: "Tom Fisher", party: "Work friends", rsvp: "no", diet: null, table: null },
  { id: "g-27", name: "Hana Sato", party: "Work friends", rsvp: "yes", diet: null, table: null },
  { id: "g-28", name: "Luis Ortega", party: "Groom's football club", rsvp: "yes", diet: null, table: "t-3" },
  { id: "g-29", name: "Kai Brennan", party: "Groom's football club", rsvp: "yes", diet: null, table: "t-3" },
  { id: "g-30", name: "Sean Doyle", party: "Groom's football club", rsvp: "yes", diet: null, table: "t-3" },
  { id: "g-31", name: "Ryan Doyle", party: "Groom's football club", rsvp: "yes", diet: null, table: null },
  { id: "g-32", name: "Hugo Carvalho", party: "Bride's family", rsvp: "yes", diet: "Children's menu", table: "t-1" },
  { id: "g-33", name: "Mia Carvalho", party: "Bride's family", rsvp: "yes", diet: "Children's menu", table: null },
  { id: "g-34", name: "Paula Mendes", party: "Bride's family", rsvp: "pending", diet: null, table: null },
  { id: "g-35", name: "Victor Mendes", party: "Bride's family", rsvp: "pending", diet: null, table: null },
  { id: "g-36", name: "Zoe Bennett", party: "Plus-ones", rsvp: "yes", diet: null, table: "t-2" },
  { id: "g-37", name: "Arjun Mehta", party: "Plus-ones", rsvp: "yes", diet: "Vegetarian", table: "t-5" },
  { id: "g-38", name: "Laura Svensson", party: "Plus-ones", rsvp: "yes", diet: null, table: null },
];

export const RULES: Rule[] = [
  { kind: "together", guests: ["g-21", "g-22"], note: "Couple" },
  { kind: "together", guests: ["g-32", "g-33"], note: "Siblings, under 10" },
  { kind: "apart", guests: ["g-29", "g-30"], note: "Brothers Sean and Ryan Doyle are not speaking" },
  { kind: "apart", guests: ["g-12", "g-34"], note: "Ask the couple: old family dispute" },
  {
    kind: "near",
    guests: ["g-09"],
    note: "Avó Rosa uses a wheelchair: seat near the garden doors, away from the band",
  },
];

export const PARTIES: string[] = Array.from(new Set(GUESTS.map((g) => g.party)));
export const DIETS: string[] = Array.from(
  new Set(GUESTS.flatMap((g) => (g.diet ? [g.diet] : []))),
).sort((a, b) => a.localeCompare(b));

export const RSVP_LABEL: Record<Rsvp, string> = {
  yes: "Attending",
  maybe: "Maybe",
  pending: "Awaiting reply",
  no: "Declined",
};
```

```ts lib/plan.ts
import { FIXTURES, GUESTS, RULES, TABLES, type Guest, type Rule, type Table } from "./data";

/** For every table, one slot per seat holding a guest id or null. */
export type Seats = Record<string, (string | null)[]>;

export interface Placement {
  tableId: string;
  seat: number;
}

export const guestById: Record<string, Guest> = Object.fromEntries(GUESTS.map((g) => [g.id, g]));
export const tableById: Record<string, Table> = Object.fromEntries(TABLES.map((t) => [t.id, t]));

export function initialSeats(): Seats {
  const seats: Seats = {};
  for (const t of TABLES) seats[t.id] = Array.from({ length: t.seats }, () => null as string | null);
  for (const g of GUESTS) {
    if (!g.table) continue;
    const row = seats[g.table];
    const free = row ? row.indexOf(null) : -1;
    if (row && free >= 0) row[free] = g.id;
  }
  return seats;
}

export function cloneSeats(seats: Seats): Seats {
  const next: Seats = {};
  for (const key of Object.keys(seats)) next[key] = [...seats[key]];
  return next;
}

export function placementsOf(seats: Seats): Record<string, Placement> {
  const map: Record<string, Placement> = {};
  for (const tableId of Object.keys(seats)) {
    seats[tableId].forEach((gid, seat) => {
      if (gid) map[gid] = { tableId, seat };
    });
  }
  return map;
}

/* ------------------------------ geometry (metres) ------------------------------ */

export const SEAT_D = 0.82;
export const RING_R = 1.5;
export const ROUND_D = 1.7;
export const LONG_H = 1;

export interface SeatPos {
  x: number;
  y: number;
  /** direction pointing away from the table, radians */
  angle: number;
}

/** Round tables: x, y is the centre. Long tables: x, y is the top-left corner, seats on the room side. */
export function tableSize(t: Table): { w: number; h: number } {
  return t.shape === "round" ? { w: ROUND_D, h: ROUND_D } : { w: t.seats, h: LONG_H };
}

export function tableCenter(t: Table): { x: number; y: number } {
  return t.shape === "round" ? { x: t.x, y: t.y } : { x: t.x + t.seats / 2, y: t.y + LONG_H / 2 };
}

export function seatPositions(t: Table): SeatPos[] {
  if (t.shape === "round") {
    return Array.from({ length: t.seats }, (_, i) => {
      const angle = -Math.PI / 2 + (2 * Math.PI * i) / t.seats;
      return { x: t.x + Math.cos(angle) * RING_R, y: t.y + Math.sin(angle) * RING_R, angle };
    });
  }
  return Array.from({ length: t.seats }, (_, i) => ({
    x: t.x + i + 0.5,
    y: t.y - SEAT_D / 2 - 0.1,
    angle: -Math.PI / 2,
  }));
}

/* ---------------------------------- people ---------------------------------- */

export function initials(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0][0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1][0] ?? "") : "";
  return (first + last).toUpperCase();
}

export function firstName(name: string): string {
  const parts = name.split(/\s+/);
  // "Avó Rosa Carvalho" is known by "Avó Rosa"
  return parts[0] === "Avó" && parts[1] ? `${parts[0]} ${parts[1]}` : parts[0];
}

const PARTY_COLORS: Record<string, string> = {
  Couple: "oklch(0.44 0.15 15)",
  "Bride's family": "oklch(0.47 0.14 340)",
  "Groom's family": "oklch(0.46 0.12 255)",
  "University friends": "oklch(0.46 0.1 160)",
  "Work friends": "oklch(0.45 0.1 70)",
  "Groom's football club": "oklch(0.46 0.15 300)",
  "Plus-ones": "oklch(0.42 0.03 250)",
};

export function partyColor(party: string): string {
  return PARTY_COLORS[party] ?? "oklch(0.42 0.03 250)";
}

/* ----------------------------------- rules ----------------------------------- */

export type RuleStatus = "ok" | "broken" | "open";

export interface RuleResult {
  id: string;
  rule: Rule;
  status: RuleStatus;
  title: string;
  detail: string;
  tableIds: string[];
  guestIds: string[];
}

/** Seat-near rule for one guest: within this distance of the garden doors... */
export const NEAR_DOOR_M = 4;
/** ...and at least this far from the band. */
export const FAR_BAND_M = 8;
/** Seat-near rule between guests: table centres no further apart than this. */
export const NEAR_GUESTS_M = 6;

const door = FIXTURES.find((f) => f.kind === "door");
const stage = FIXTURES.find((f) => f.kind === "stage");

function fixtureCenter(f: { x: number; y: number; w: number; h: number } | undefined) {
  return f ? { x: f.x + f.w / 2, y: f.y + f.h / 2 } : null;
}

function dist(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

const m1 = (n: number) => `${n.toFixed(1)} m`;

export function evaluateRules(seats: Seats): RuleResult[] {
  const where = placementsOf(seats);
  const doorC = fixtureCenter(door);
  const stageC = fixtureCenter(stage);

  return RULES.map((rule, index): RuleResult => {
    const guests = rule.guests.map((id) => guestById[id]).filter((g): g is Guest => Boolean(g));
    const names = guests.map((g) => g.name);
    const placed = guests.map((g) => ({ g, p: where[g.id] }));
    const unseated = placed.filter((x) => !x.p).map((x) => x.g.name);
    const tableIds = Array.from(new Set(placed.flatMap((x) => (x.p ? [x.p.tableId] : []))));
    const tName = (id: string) => tableById[id]?.name ?? id;
    const base = { id: `rule-${index}`, rule, tableIds, guestIds: guests.map((g) => g.id) };

    if (rule.kind === "together") {
      const title = `${names.join(" & ")} together`;
      if (unseated.length > 0) {
        return { ...base, title, status: "open", detail: `${unseated.join(" and ")} not seated yet.`, tableIds };
      }
      if (tableIds.length > 1) {
        const where2 = placed.map((x) => `${x.g.name} at ${tName(x.p!.tableId)}`).join(", ");
        return { ...base, title, status: "broken", detail: `Split up: ${where2}.` };
      }
      return { ...base, title, status: "ok", detail: `Together at ${tName(tableIds[0])}.` };
    }

    if (rule.kind === "apart") {
      const title = `${names.join(" & ")} apart`;
      const seatedAll = placed.filter((x) => x.p);
      const clash = tableIds.find((tid) => seatedAll.filter((x) => x.p!.tableId === tid).length > 1);
      if (clash) {
        return { ...base, title, status: "broken", detail: `Both at ${tName(clash)}.`, tableIds: [clash] };
      }
      const detail =
        unseated.length > 0
          ? "No clash so far."
          : `At ${tableIds.map(tName).join(" and ")}.`;
      return { ...base, title, status: "ok", detail };
    }

    // near
    if (guests.length === 1) {
      const g = guests[0];
      const title = `${g.name} near the garden doors`;
      const p = where[g.id];
      if (!p) return { ...base, title, status: "open", detail: "Not seated yet." };
      const t = tableById[p.tableId];
      const c = tableCenter(t);
      const toDoor = doorC ? dist(c, doorC) : 0;
      const toBand = stageC ? dist(c, stageC) : Infinity;
      if (toDoor > NEAR_DOOR_M) {
        return {
          ...base,
          title,
          status: "broken",
          detail: `${t.name} is ${m1(toDoor)} from the garden doors (keep within ${NEAR_DOOR_M} m).`,
        };
      }
      if (toBand < FAR_BAND_M) {
        return {
          ...base,
          title,
          status: "broken",
          detail: `${t.name} is only ${m1(toBand)} from the band (keep ${FAR_BAND_M} m away).`,
        };
      }
      return { ...base, title, status: "ok", detail: `${t.name}: ${m1(toDoor)} from the doors, ${m1(toBand)} from the band.` };
    }

    const title = `${names.join(" & ")} near each other`;
    if (unseated.length > 0) return { ...base, title, status: "open", detail: `${unseated.join(" and ")} not seated yet.` };
    const centres = tableIds.map((id) => tableCenter(tableById[id]));
    let far = 0;
    for (const a of centres) for (const b of centres) far = Math.max(far, dist(a, b));
    return far > NEAR_GUESTS_M
      ? { ...base, title, status: "broken", detail: `Tables are ${m1(far)} apart.` }
      : { ...base, title, status: "ok", detail: "Close enough." };
  });
}

export function brokenByTable(results: RuleResult[]): Record<string, RuleResult[]> {
  const map: Record<string, RuleResult[]> = {};
  for (const r of results) {
    if (r.status !== "broken") continue;
    for (const tid of r.tableIds) (map[tid] ??= []).push(r);
  }
  return map;
}

export function brokenGuestSet(results: RuleResult[]): Set<string> {
  const set = new Set<string>();
  for (const r of results) if (r.status === "broken") for (const id of r.guestIds) set.add(id);
  return set;
}

/* ---------------------------------- meals ------------------------------------ */

export const STANDARD_MEAL = "Standard menu";

export function mealOf(g: Guest): string {
  return g.diet ?? STANDARD_MEAL;
}
```

