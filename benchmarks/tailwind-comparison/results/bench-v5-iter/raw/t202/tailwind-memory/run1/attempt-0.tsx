```css app/globals.css
@import "tailwindcss";

@theme {
  --font-display: ui-serif, "Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif;
  --color-paper: #f7f5f0;
  --color-ink: #1c2321;
  --color-brand: #0f4c4a;
  --color-brand-strong: #0a3837;
}

:root {
  color-scheme: light;
}

html {
  background: var(--color-paper);
}

body {
  min-height: 100dvh;
  background: var(--color-paper);
  color: var(--color-ink);
  -webkit-tap-highlight-color: transparent;
}

:focus-visible {
  outline: 2px solid var(--color-brand);
  outline-offset: 2px;
}

@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}

.floor-grid {
  background-image:
    linear-gradient(to right, rgb(28 35 33 / 0.05) 1px, transparent 1px),
    linear-gradient(to bottom, rgb(28 35 33 / 0.05) 1px, transparent 1px);
  background-size: calc(100cqw / 24) calc(100cqw / 24);
}
```

```tsx app/guests/page.tsx
import type { Metadata } from "next";
import { GuestsView } from "@/components/GuestsView";

export const metadata: Metadata = { title: "Guest list, Seatwise" };

export default function Page() {
  return <GuestsView />;
}
```

```tsx app/layout.tsx
import "./globals.css";

import type { Metadata, Viewport } from "next";
import { AppShell } from "@/components/AppShell";

export const metadata: Metadata = {
  title: "Seatwise, seating plan for Ines & Mateo",
  description: "Seatwise, a seating planner for wedding and event planners.",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
```

```tsx app/page.tsx
import { Planner } from "@/components/Planner";

export default function Page() {
  return <Planner />;
}
```

```tsx components/AppShell.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, LayoutGrid, MapPin, Users } from "lucide-react";
import { PlanProvider, usePlan } from "./PlanProvider";
import { APP, EVENT, PLANNER, formatDate, initials } from "@/lib/data";

const NAV = [
  { href: "/", label: "Plan", icon: LayoutGrid },
  { href: "/guests", label: "Guests", icon: Users },
];

function Toast() {
  const { notice } = usePlan();
  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-4"
    >
      {notice ? (
        <p
          key={notice.id}
          className={`pointer-events-auto max-w-md rounded-xl px-4 py-2.5 text-sm font-medium shadow-lg ${
            notice.ok ? "bg-stone-900 text-white" : "bg-red-700 text-white"
          }`}
        >
          {notice.text}
        </p>
      ) : null}
    </div>
  );
}

function Header() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-40 border-b border-stone-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-[1500px] flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <span
            aria-hidden
            className="grid size-9 place-items-center rounded-xl bg-brand font-display text-lg font-semibold text-white"
          >
            S
          </span>
          <span className="font-display text-xl font-semibold tracking-tight">{APP}</span>
        </Link>

        <div className="order-3 flex min-w-0 basis-full flex-col sm:order-none sm:basis-auto sm:flex-1">
          <p className="truncate text-sm font-semibold">{EVENT.name}</p>
          <p className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-stone-600">
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="size-3.5" aria-hidden />
              {formatDate(EVENT.date)}
            </span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-3.5" aria-hidden />
              {EVENT.venue}
            </span>
          </p>
        </div>

        <nav aria-label="Main" className="ml-auto flex gap-1 rounded-xl bg-stone-100 p-1 sm:ml-0">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`inline-flex min-h-10 items-center gap-2 rounded-lg px-3.5 text-sm font-semibold transition-colors ${
                  active ? "bg-white text-brand shadow-sm" : "text-stone-600 hover:text-stone-900"
                }`}
              >
                <Icon className="size-4" aria-hidden />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2.5 md:flex">
          <span
            aria-hidden
            className="grid size-9 place-items-center rounded-full bg-stone-200 text-xs font-bold text-stone-700"
          >
            {initials(PLANNER.name)}
          </span>
          <span className="text-sm leading-tight">
            <span className="block font-semibold">{PLANNER.name}</span>
            <span className="block text-xs text-stone-600">Wedding planner</span>
          </span>
        </div>
      </div>
    </header>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <PlanProvider>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-white focus:px-3 focus:py-2"
      >
        Skip to content
      </a>
      <Header />
      <main id="main" className="mx-auto max-w-[1500px] px-4 py-5 sm:px-6">
        {children}
      </main>
      <Toast />
    </PlanProvider>
  );
}
```

```tsx components/Floor.tsx
"use client";

import type { CSSProperties } from "react";
import { AlertTriangle } from "lucide-react";
import { EVENT, FIXTURES, GUESTS, PARTIES, TABLES, initials, type Fixture, type Table } from "@/lib/data";
import { SEAT_R, filledCount, seatOffsets, tableSize, type RuleResult, type Seats } from "@/lib/plan";
import { partyStyle, PARTY_STYLE } from "@/lib/ui";

export interface PlanCtl {
  armed: string | null;
  selected: string | null;
  dragId: string | null;
  hover: string | null;
  onSeatClick: (tableId: string, seat: number) => void;
  onTableClick: (tableId: string) => void;
  onGuestPointerDown: (e: React.PointerEvent, guestId: string) => void;
}

const m = (v: number) => `calc(var(--m) * ${v})`;

function FixtureView({ f }: { f: Fixture }) {
  const base: CSSProperties = { left: m(f.x), top: m(f.y), width: m(f.w), height: m(f.h) };
  const fs: CSSProperties = { fontSize: "max(10px, calc(var(--m) * 0.42))" };
  if (f.kind === "door") {
    return (
      <>
        <div
          className="absolute rounded-sm bg-emerald-700"
          style={base}
          role="img"
          aria-label={f.label}
        />
        <span
          aria-hidden
          className="absolute grid place-items-center overflow-hidden font-semibold uppercase tracking-wider text-white [writing-mode:vertical-rl]"
          style={{ left: m(f.x), top: m(f.y), width: m(f.w), height: m(f.h), fontSize: "8px" }}
        >
          Doors
        </span>
      </>
    );
  }
  const styles: Record<string, string> = {
    stage: "bg-stone-800 text-white rounded-md",
    dancefloor: "bg-amber-100/80 border border-dashed border-amber-500 text-amber-900 rounded-md",
    bar: "bg-teal-800 text-white rounded-md",
  };
  return (
    <div
      className={`absolute grid place-items-center text-center font-semibold ${styles[f.kind] ?? ""}`}
      style={{ ...base, ...fs }}
      role="img"
      aria-label={f.label}
    >
      <span className={f.kind === "bar" ? "[writing-mode:vertical-rl]" : ""}>{f.label}</span>
    </div>
  );
}

interface TableViewProps {
  table: Table;
  seats: Seats;
  issues: RuleResult[];
  badGuests: Set<string>;
  ctl: PlanCtl;
}

function TableView({ table, seats, issues, badGuests, ctl }: TableViewProps) {
  const row = seats[table.id] ?? [];
  const filled = filledCount(seats, table.id);
  const size = tableSize(table);
  const offsets = seatOffsets(table);
  const selected = ctl.selected === table.id;
  const hasIssue = issues.length > 0;
  const dropHover = ctl.hover === `table:${table.id}`;
  const round = table.shape === "round";
  const pad = round ? 1.95 : 0;

  return (
    <>
      <div
        data-drop={`table:${table.id}`}
        aria-hidden
        className={`absolute transition-colors ${round ? "rounded-full" : "rounded-2xl"} ${
          dropHover ? "bg-teal-600/20" : selected ? "bg-teal-600/10" : ""
        }`}
        style={
          round
            ? { left: m(table.x - pad), top: m(table.y - pad), width: m(pad * 2), height: m(pad * 2) }
            : {
                left: m(table.x - size.w / 2 - 0.2),
                top: m(table.y - 1.55),
                width: m(size.w + 0.4),
                height: m(3.1),
              }
        }
      />
      <button
        type="button"
        data-drop={`table:${table.id}`}
        onClick={() => ctl.onTableClick(table.id)}
        aria-pressed={selected}
        className={`absolute flex flex-col items-center justify-center gap-px border-2 text-center leading-tight shadow-sm transition-colors ${
          round ? "rounded-full" : "rounded-xl"
        } ${
          hasIssue
            ? "border-red-600 bg-red-50 text-red-900"
            : selected
              ? "border-teal-700 bg-teal-50 text-teal-950"
              : "border-stone-300 bg-white text-stone-800 hover:border-stone-400"
        }`}
        style={{
          left: m(table.x - size.w / 2),
          top: m(table.y - size.h / 2),
          width: m(size.w),
          height: m(size.h),
          fontSize: "max(10px, calc(var(--m) * 0.36))",
        }}
      >
        <span className="font-semibold">{table.name}</span>
        <span className={`tabular-nums ${filled === table.seats ? "font-semibold" : "text-stone-600"}`}>
          {filled}/{table.seats}
          <span className="sr-only"> seats filled</span>
        </span>
        {hasIssue ? (
          <span className="inline-flex items-center gap-0.5 font-bold text-red-700">
            <AlertTriangle className="size-[1.1em]" aria-hidden />
            {issues.length}
            <span className="sr-only"> rule broken</span>
          </span>
        ) : null}
      </button>

      {offsets.map((o, i) => {
        const id = row[i] ?? null;
        const guest = id ? GUESTS.find((g) => g.id === id) : undefined;
        const key = `seat:${table.id}:${i}`;
        const over = ctl.hover === key;
        const armed = id !== null && ctl.armed === id;
        const bad = id !== null && badGuests.has(id);
        const dragging = id !== null && ctl.dragId === id;
        const label = guest
          ? `${table.name}, seat ${i + 1}: ${guest.name}${guest.diet ? `, ${guest.diet}` : ""}${bad ? ", rule broken" : ""}`
          : `${table.name}, seat ${i + 1}: empty`;
        return (
          <button
            key={key}
            type="button"
            data-drop={key}
            onClick={() => ctl.onSeatClick(table.id, i)}
            onPointerDown={guest ? (e) => ctl.onGuestPointerDown(e, guest.id) : undefined}
            className={`absolute grid -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full font-bold transition-transform select-none ${
              guest
                ? `${partyStyle(guest.party).seat} touch-none shadow-sm cursor-grab`
                : "border-[1.5px] border-dashed border-stone-400 bg-white/70 text-stone-400"
            } ${over ? "scale-125 ring-4 ring-teal-500" : ""} ${armed ? "ring-4 ring-teal-500 ring-offset-2" : ""} ${
              bad && !armed ? "ring-[3px] ring-red-600 ring-offset-1" : ""
            } ${dragging ? "opacity-40" : ""}`}
            style={{
              left: m(table.x + o.dx),
              top: m(table.y + o.dy),
              width: m(SEAT_R * 2),
              height: m(SEAT_R * 2),
              fontSize: "max(9px, calc(var(--m) * 0.29))",
            }}
          >
            <span className="sr-only">{label}</span>
            {guest ? (
              <span aria-hidden>{initials(guest.name)}</span>
            ) : (
              <span aria-hidden className="text-[1.3em] leading-none">+</span>
            )}
            {guest?.diet ? (
              <span
                aria-hidden
                className="absolute -right-0.5 -top-0.5 size-[0.75em] rounded-full border border-white bg-yellow-400"
              />
            ) : null}
          </button>
        );
      })}
    </>
  );
}

export function Floor({
  seats,
  rules,
  ctl,
}: {
  seats: Seats;
  rules: RuleResult[];
  ctl: PlanCtl;
}) {
  const broken = rules.filter((r) => r.status === "broken");
  const bad = new Set<string>();
  const byTable: Record<string, RuleResult[]> = {};
  for (const r of broken) {
    r.guests.forEach((g) => bad.add(g));
    r.tables.forEach((t) => (byTable[t] = [...(byTable[t] ?? []), r]));
  }
  const { width, depth } = EVENT.room_m;

  return (
    <div>
      <div className="overflow-x-auto rounded-xl border border-stone-300 bg-[#fcfbf8]">
        <div
          className="@container relative min-w-[680px]"
          style={{ aspectRatio: `${width} / ${depth}` }}
        >
          <div
            className="floor-grid absolute inset-0"
            style={{ "--m": `calc(100cqw / ${width})` } as CSSProperties}
            data-drop-area
          >
            {FIXTURES.map((f) => (
              <FixtureView key={f.id} f={f} />
            ))}
            {TABLES.map((t) => (
              <TableView
                key={t.id}
                table={t}
                seats={seats}
                issues={byTable[t.id] ?? []}
                badGuests={bad}
                ctl={ctl}
              />
            ))}
            <div
              className="absolute flex flex-col items-center text-stone-500"
              style={{ left: m(21.2), top: m(0.5), width: m(2), fontSize: "max(9px, calc(var(--m) * 0.32))" }}
              aria-hidden
            >
              <div className="h-1.5 w-full border-x border-b border-stone-500" />
              <span>2 m</span>
            </div>
          </div>
        </div>
      </div>

      <ul className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-stone-700" aria-label="Legend">
        {PARTIES.map((p) => (
          <li key={p} className="inline-flex items-center gap-1.5">
            <span className={`size-3 rounded-full ${PARTY_STYLE[p]?.dot ?? "bg-slate-700"}`} aria-hidden />
            {p}
          </li>
        ))}
        <li className="inline-flex items-center gap-1.5">
          <span className="size-3 rounded-full bg-yellow-400 ring-1 ring-stone-300" aria-hidden />
          Dietary need
        </li>
        <li className="inline-flex items-center gap-1.5">
          <span className="size-3 rounded-full border border-dashed border-stone-500" aria-hidden />
          Empty seat
        </li>
        <li className="inline-flex items-center gap-1.5">
          <span className="size-3 rounded-full ring-2 ring-red-600" aria-hidden />
          Rule broken
        </li>
      </ul>
    </div>
  );
}
```

```tsx components/GuestsView.tsx
"use client";

import { useMemo, useState } from "react";
import { Search, UtensilsCrossed, X } from "lucide-react";
import { GUESTS, PARTIES, RSVP_LABEL, STANDARD_MEAL, tableById, type Guest, type Rsvp } from "@/lib/data";
import { RSVP_STYLE, partyStyle } from "@/lib/ui";
import { usePlan } from "./PlanProvider";
import { Card } from "./Panels";

const ALL = "all";
const NONE = "none";
const RSVPS: Rsvp[] = ["yes", "maybe", "pending", "no"];
const DIETS = Array.from(new Set(GUESTS.map((g) => g.diet).filter((d): d is string => d !== null))).sort();

function Field({
  id,
  label,
  children,
}: {
  id: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      <label htmlFor={id} className="mb-1 block text-xs font-semibold text-stone-600">
        {label}
      </label>
      {children}
    </div>
  );
}

const control =
  "min-h-11 w-full rounded-xl border border-stone-300 bg-white px-3 text-sm text-stone-900 placeholder:text-stone-500";

function RsvpBadge({ rsvp }: { rsvp: Rsvp }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${RSVP_STYLE[rsvp]}`}>
      {RSVP_LABEL[rsvp]}
    </span>
  );
}

function TableCell({ guest, tableId }: { guest: Guest; tableId: string | undefined }) {
  if (tableId) return <span className="font-medium">{tableById(tableId).name}</span>;
  if (guest.rsvp === "yes") return <span className="font-medium text-amber-800">Not seated</span>;
  if (guest.rsvp === "no") return <span className="text-stone-500">None</span>;
  return <span className="text-stone-600">Not seated</span>;
}

export function GuestsView() {
  const { tableOf } = usePlan();
  const [q, setQ] = useState("");
  const [party, setParty] = useState(ALL);
  const [rsvp, setRsvp] = useState(ALL);
  const [diet, setDiet] = useState(ALL);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return GUESTS.filter((g) => {
      if (needle && !g.name.toLowerCase().includes(needle)) return false;
      if (party !== ALL && g.party !== party) return false;
      if (rsvp !== ALL && g.rsvp !== rsvp) return false;
      if (diet === NONE && g.diet !== null) return false;
      if (diet !== ALL && diet !== NONE && g.diet !== diet) return false;
      return true;
    });
  }, [q, party, rsvp, diet]);

  const meals = useMemo(() => {
    const rows = new Map<string, { yes: number; possible: number }>();
    for (const g of GUESTS) {
      if (g.rsvp === "no") continue;
      const key = g.diet ?? STANDARD_MEAL;
      const row = rows.get(key) ?? { yes: 0, possible: 0 };
      if (g.rsvp === "yes") row.yes += 1;
      else row.possible += 1;
      rows.set(key, row);
    }
    const list = Array.from(rows.entries()).map(([meal, v]) => ({ meal, ...v }));
    list.sort((a, b) => {
      if (a.meal === STANDARD_MEAL) return -1;
      if (b.meal === STANDARD_MEAL) return 1;
      return b.yes - a.yes || a.meal.localeCompare(b.meal);
    });
    const yes = list.reduce((n, r) => n + r.yes, 0);
    const possible = list.reduce((n, r) => n + r.possible, 0);
    return { list, yes, possible };
  }, []);

  const filtersOn = q !== "" || party !== ALL || rsvp !== ALL || diet !== ALL;
  const clear = () => {
    setQ("");
    setParty(ALL);
    setRsvp(ALL);
    setDiet(ALL);
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">Guest list</h1>
        <p className="text-sm text-stone-600">
          {GUESTS.length} invited · {meals.yes} attending · {meals.possible} not yet confirmed ·{" "}
          {GUESTS.filter((g) => g.rsvp === "no").length} declined
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="order-2 space-y-4 lg:order-1">
          <section aria-label="Filters" className="rounded-2xl border border-stone-200 bg-white p-3.5 shadow-sm">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <Field id="q" label="Search by name">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-stone-500" aria-hidden />
                  <input
                    id="q"
                    type="search"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Search guests"
                    className={`${control} pl-9`}
                  />
                </div>
              </Field>
              <Field id="party" label="Party">
                <select id="party" value={party} onChange={(e) => setParty(e.target.value)} className={control}>
                  <option value={ALL}>All parties</option>
                  {PARTIES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </Field>
              <Field id="rsvp" label="RSVP">
                <select id="rsvp" value={rsvp} onChange={(e) => setRsvp(e.target.value)} className={control}>
                  <option value={ALL}>Any RSVP</option>
                  {RSVPS.map((r) => (
                    <option key={r} value={r}>
                      {RSVP_LABEL[r]}
                    </option>
                  ))}
                </select>
              </Field>
              <Field id="diet" label="Diet">
                <select id="diet" value={diet} onChange={(e) => setDiet(e.target.value)} className={control}>
                  <option value={ALL}>Any diet</option>
                  <option value={NONE}>No dietary need</option>
                  {DIETS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <div className="mt-3 flex items-center justify-between gap-3 text-sm">
              <p role="status" aria-live="polite" className="text-stone-700">
                Showing <span className="font-semibold tabular-nums">{filtered.length}</span> of {GUESTS.length} guests
              </p>
              {filtersOn ? (
                <button
                  type="button"
                  onClick={clear}
                  className="inline-flex min-h-9 items-center gap-1 rounded-lg px-2.5 font-semibold text-teal-800 hover:bg-teal-50"
                >
                  <X className="size-4" aria-hidden /> Clear filters
                </button>
              ) : null}
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm" aria-label="Guests">
            {filtered.length === 0 ? (
              <p className="p-6 text-center text-sm text-stone-700">No guests match these filters.</p>
            ) : (
              <>
                <table className="hidden w-full text-left text-sm md:table">
                  <caption className="sr-only">Guests with party, RSVP, diet and table</caption>
                  <thead className="bg-stone-50 text-xs uppercase tracking-wide text-stone-600">
                    <tr>
                      <th scope="col" className="px-4 py-2.5 font-semibold">Guest</th>
                      <th scope="col" className="px-4 py-2.5 font-semibold">Party</th>
                      <th scope="col" className="px-4 py-2.5 font-semibold">RSVP</th>
                      <th scope="col" className="px-4 py-2.5 font-semibold">Diet</th>
                      <th scope="col" className="px-4 py-2.5 font-semibold">Table</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {filtered.map((g) => (
                      <tr key={g.id} className="hover:bg-stone-50">
                        <th scope="row" className="px-4 py-2.5 font-semibold">{g.name}</th>
                        <td className="px-4 py-2.5">
                          <span className="inline-flex items-center gap-2">
                            <span className={`size-2.5 rounded-full ${partyStyle(g.party).dot}`} aria-hidden />
                            {g.party}
                          </span>
                        </td>
                        <td className="px-4 py-2.5"><RsvpBadge rsvp={g.rsvp} /></td>
                        <td className="px-4 py-2.5">
                          {g.diet ? (
                            <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-900 ring-1 ring-inset ring-yellow-600/25">
                              {g.diet}
                            </span>
                          ) : (
                            <span className="text-stone-500">None</span>
                          )}
                        </td>
                        <td className="px-4 py-2.5"><TableCell guest={g} tableId={tableOf[g.id]} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <ul className="divide-y divide-stone-100 md:hidden">
                  {filtered.map((g) => (
                    <li key={g.id} className="space-y-1.5 px-4 py-3">
                      <div className="flex items-start justify-between gap-3">
                        <p className="font-semibold">{g.name}</p>
                        <RsvpBadge rsvp={g.rsvp} />
                      </div>
                      <p className="flex items-center gap-2 text-sm text-stone-700">
                        <span className={`size-2.5 rounded-full ${partyStyle(g.party).dot}`} aria-hidden />
                        {g.party}
                      </p>
                      <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                        <span>
                          <span className="text-stone-600">Table: </span>
                          <TableCell guest={g} tableId={tableOf[g.id]} />
                        </span>
                        {g.diet ? (
                          <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-900 ring-1 ring-inset ring-yellow-600/25">
                            {g.diet}
                          </span>
                        ) : null}
                      </p>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </section>
        </div>

        <aside className="order-1 lg:order-2 lg:self-start">
          <Card
            title="Meals for the caterer"
            aside={<UtensilsCrossed className="size-5 text-stone-500" aria-hidden />}
            className="lg:sticky lg:top-24"
          >
            <table className="w-full text-sm">
              <caption className="sr-only">Meal counts by dietary need</caption>
              <thead className="text-xs uppercase tracking-wide text-stone-600">
                <tr>
                  <th scope="col" className="px-4 py-2.5 text-left font-semibold">Meal</th>
                  <th scope="col" className="px-2 py-2.5 text-right font-semibold">Attending</th>
                  <th scope="col" className="px-4 py-2.5 text-right font-semibold">Not confirmed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {meals.list.map((r) => {
                  const value = r.meal === STANDARD_MEAL ? NONE : r.meal;
                  const active = diet === value;
                  return (
                    <tr key={r.meal} className={active ? "bg-teal-50" : ""}>
                      <th scope="row" className="px-4 py-0 text-left font-medium">
                        <button
                          type="button"
                          onClick={() => setDiet(active ? ALL : value)}
                          aria-pressed={active}
                          title="Filter the guest list by this meal"
                          className="min-h-11 w-full text-left hover:underline"
                        >
                          {r.meal}
                        </button>
                      </th>
                      <td className="px-2 text-right font-semibold tabular-nums">{r.yes}</td>
                      <td className="px-4 text-right tabular-nums text-stone-600">{r.possible > 0 ? `+${r.possible}` : "0"}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-stone-300 bg-stone-50 font-semibold">
                  <th scope="row" className="px-4 py-3 text-left">Total meals</th>
                  <td className="px-2 py-3 text-right tabular-nums">{meals.yes}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-stone-700">+{meals.possible}</td>
                </tr>
              </tfoot>
            </table>
            <p className="border-t border-stone-100 px-4 py-3 text-xs text-stone-600">
              Attending counts guests who replied yes. Not confirmed covers maybe and no reply. Declined guests are
              left out.
            </p>
          </Card>
        </aside>
      </div>
    </div>
  );
}
```

```tsx components/Panels.tsx
"use client";

import { AlertTriangle, ArrowRightLeft, CheckCircle2, Clock3, GripVertical, MoveRight, UserMinus, X } from "lucide-react";
import { GUESTS, RSVP_LABEL, TABLES, guestById, tableById, type Guest } from "@/lib/data";
import { filledCount, type RuleResult, type Seats } from "@/lib/plan";
import { RSVP_STYLE, partyStyle } from "@/lib/ui";
import type { PlanCtl } from "./Floor";

export function Card({
  title,
  aside,
  children,
  className = "",
  ...rest
}: {
  title: React.ReactNode;
  aside?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
} & Omit<React.ComponentProps<"section">, "title">) {
  return (
    <section {...rest} className={`rounded-2xl border border-stone-200 bg-white shadow-sm ${className}`}>
      <header className="flex items-center justify-between gap-3 border-b border-stone-100 px-4 py-3">
        <h2 className="font-display text-lg font-semibold tracking-tight">{title}</h2>
        {aside}
      </header>
      {children}
    </section>
  );
}

function DietPill({ diet }: { diet: string }) {
  return (
    <span className="inline-flex items-center rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-900 ring-1 ring-inset ring-yellow-600/25">
      {diet}
    </span>
  );
}

/* ---------------------------------------------------------------- unseated */

export function UnseatedPanel({
  tableOf,
  ctl,
  onChipClick,
}: {
  tableOf: Record<string, string>;
  ctl: PlanCtl;
  onChipClick: (guestId: string) => void;
}) {
  const open = GUESTS.filter((g) => g.rsvp === "yes" && !tableOf[g.id]);
  const unsure = GUESTS.filter((g) => (g.rsvp === "maybe" || g.rsvp === "pending") && !tableOf[g.id]);
  const declined = GUESTS.filter((g) => g.rsvp === "no").length;
  const hover = ctl.hover === "pool";

  const renderChip = (g: Guest) => (
    <GuestChipButton key={g.id} guest={g} ctl={ctl} onClick={() => onChipClick(g.id)} />
  );

  return (
    <Card
      title="Needs a seat"
      aside={
        <span className="rounded-full bg-stone-900 px-2.5 py-0.5 text-sm font-semibold tabular-nums text-white" aria-label={`${open.length} attending guests unseated`}>
          {open.length}
        </span>
      }
    >
      <div data-drop="pool" className={`space-y-3 p-3 transition-colors ${hover ? "bg-teal-50" : ""}`}>
        {open.length === 0 ? (
          <p className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-900">
            <CheckCircle2 className="size-4" aria-hidden /> Every attending guest has a seat.
          </p>
        ) : (
          <ul className="space-y-1.5">{open.map(renderChip)}</ul>
        )}
        {unsure.length > 0 ? (
          <div>
            <h3 className="mb-1.5 px-1 text-xs font-semibold uppercase tracking-wide text-stone-600">
              Not confirmed ({unsure.length})
            </h3>
            <ul className="space-y-1.5">{unsure.map(renderChip)}</ul>
          </div>
        ) : null}
        <p className="px-1 text-xs text-stone-600">
          Drag a guest onto a seat or table, or tap a guest and then a seat.
          {declined > 0 ? ` ${declined} declined guest is not listed.` : ""}
        </p>
      </div>
    </Card>
  );
}

function GuestChipButton({ guest, ctl, onClick }: { guest: Guest; ctl: PlanCtl; onClick: () => void }) {
  const armed = ctl.armed === guest.id;
  const dragging = ctl.dragId === guest.id;
  const style = partyStyle(guest.party);
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        aria-pressed={armed}
        onPointerDown={(e) => ctl.onGuestPointerDown(e, guest.id)}
        className={`flex min-h-12 w-full cursor-grab select-none items-center gap-2.5 rounded-xl border px-2.5 py-1.5 text-left transition-colors [touch-action:pan-y] ${
          armed ? "border-teal-700 bg-teal-50 ring-2 ring-teal-600" : "border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50"
        } ${dragging ? "opacity-40" : ""}`}
      >
        <GripVertical className="size-4 shrink-0 text-stone-400" aria-hidden />
        <span className={`size-2.5 shrink-0 rounded-full ${style.dot}`} aria-hidden />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold">{guest.name}</span>
          <span className="block truncate text-xs text-stone-600">{guest.party}</span>
        </span>
        {guest.diet ? <DietPill diet={guest.diet} /> : null}
        {guest.rsvp !== "yes" ? (
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${RSVP_STYLE[guest.rsvp]}`}>
            {RSVP_LABEL[guest.rsvp]}
          </span>
        ) : null}
      </button>
    </li>
  );
}

/* ------------------------------------------------------------------- rules */

const RULE_ICON = {
  broken: <AlertTriangle className="size-4 text-red-700" aria-hidden />,
  ok: <CheckCircle2 className="size-4 text-emerald-700" aria-hidden />,
  open: <Clock3 className="size-4 text-stone-500" aria-hidden />,
};
const RULE_WORD = { broken: "Broken", ok: "Kept", open: "Waiting" };

export function RulesPanel({
  rules,
  onPick,
}: {
  rules: RuleResult[];
  onPick: (tableId: string) => void;
}) {
  const broken = rules.filter((r) => r.status === "broken").length;
  const ok = rules.filter((r) => r.status === "ok").length;
  const open = rules.filter((r) => r.status === "open").length;
  return (
    <Card
      title="The couple's rules"
      aside={
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
            broken ? "bg-red-100 text-red-800" : "bg-emerald-100 text-emerald-800"
          }`}
        >
          {broken ? `${broken} broken` : "All kept"}
        </span>
      }
    >
      <p className="px-4 pt-3 text-sm text-stone-700" aria-live="polite">
        {broken} broken, {open} waiting for seats, {ok} kept.
      </p>
      <ul className="space-y-2 p-3">
        {rules.map((r) => {
          const target = r.tables[0];
          const check = r.rule.check;
          return (
            <li
              key={r.index}
              className={`rounded-xl border p-3 ${
                r.status === "broken" ? "border-red-300 bg-red-50" : "border-stone-200 bg-stone-50/60"
              }`}
            >
              <div className="flex items-start gap-2.5">
                <span className="mt-0.5 shrink-0">{RULE_ICON[r.status]}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold leading-snug">
                    <span className="sr-only">{RULE_WORD[r.status]}: </span>
                    {r.title}
                  </p>
                  <p className={`mt-0.5 text-sm ${r.status === "broken" ? "font-medium text-red-800" : "text-stone-700"}`}>
                    {r.detail}
                  </p>
                  <p className="mt-0.5 text-xs text-stone-600">{r.rule.note}</p>
                  {check ? <p className="mt-1.5 rounded-md bg-amber-50 px-2 py-1 text-xs text-amber-900">{check}</p> : null}
                  {target && r.status === "broken" ? (
                    <button
                      type="button"
                      onClick={() => onPick(target)}
                      className="mt-2 inline-flex min-h-9 items-center gap-1 rounded-lg bg-white px-2.5 text-xs font-semibold text-red-800 ring-1 ring-red-300 hover:bg-red-100"
                    >
                      Show {tableById(target).name} <MoveRight className="size-3.5" aria-hidden />
                    </button>
                  ) : null}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

/* ------------------------------------------------------------- table detail */

export function TablePanel({
  seats,
  rules,
  selected,
  ctl,
  onSelect,
  onMove,
  onUnseat,
  onClose,
  panelRef,
}: {
  seats: Seats;
  rules: RuleResult[];
  selected: string | null;
  ctl: PlanCtl;
  onSelect: (id: string) => void;
  onMove: (guestId: string, tableId: string) => void;
  onUnseat: (guestId: string) => void;
  onClose: () => void;
  panelRef: React.RefObject<HTMLElement | null>;
}) {
  if (!selected) {
    return (
      <Card title="Tables" id="table-panel" ref={panelRef}>
        <ul className="divide-y divide-stone-100">
          {TABLES.map((t) => {
            const filled = filledCount(seats, t.id);
            const issues = rules.filter((r) => r.status === "broken" && r.tables.includes(t.id)).length;
            return (
              <li key={t.id}>
                <button
                  type="button"
                  onClick={() => onSelect(t.id)}
                  className="flex min-h-12 w-full items-center gap-3 px-4 py-2 text-left hover:bg-stone-50"
                >
                  <span className="w-20 text-sm font-semibold">{t.name}</span>
                  <span className="h-2 flex-1 overflow-hidden rounded-full bg-stone-100" aria-hidden>
                    <span
                      className={`block h-full rounded-full ${filled === t.seats ? "bg-teal-700" : "bg-teal-500/70"}`}
                      style={{ width: `${(filled / t.seats) * 100}%` }}
                    />
                  </span>
                  <span className="w-12 text-right text-sm tabular-nums text-stone-700">
                    {filled}/{t.seats}
                  </span>
                  {issues > 0 ? <AlertTriangle className="size-4 text-red-700" aria-label="Rule broken" /> : <span className="size-4" />}
                </button>
              </li>
            );
          })}
        </ul>
        <p className="border-t border-stone-100 px-4 py-3 text-sm text-stone-600">
          Select a table on the plan, or here, to see its guests and dietary needs.
        </p>
      </Card>
    );
  }

  const table = tableById(selected);
  const row = seats[selected] ?? [];
  const filled = filledCount(seats, selected);
  const issues = rules.filter((r) => r.status === "broken" && r.tables.includes(selected));
  const diets: Record<string, number> = {};
  for (const id of row) {
    if (!id) continue;
    const d = guestById(id).diet;
    if (d) diets[d] = (diets[d] ?? 0) + 1;
  }
  const free = table.seats - filled;
  const otherTables = TABLES.filter((t) => t.id !== selected && filledCount(seats, t.id) < t.seats);

  return (
    <Card
      title={table.name}
      id="table-panel"
      ref={panelRef}
      aside={
        <div className="flex items-center gap-2">
          <span className="text-sm tabular-nums text-stone-700">
            {filled} of {table.seats} seats
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close table details"
            className="grid size-9 place-items-center rounded-lg text-stone-600 hover:bg-stone-100"
          >
            <X className="size-4" aria-hidden />
          </button>
        </div>
      }
    >
      <div className="space-y-3 p-3">
        {issues.length > 0 ? (
          <ul className="space-y-1.5">
            {issues.map((r) => (
              <li key={r.index} className="flex items-start gap-2 rounded-lg bg-red-50 p-2.5 text-sm text-red-900 ring-1 ring-red-200">
                <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
                <span>
                  <span className="font-semibold">{r.title}.</span> {r.detail}
                </span>
              </li>
            ))}
          </ul>
        ) : null}

        <div>
          <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-stone-600">Dietary needs at this table</h3>
          {Object.keys(diets).length === 0 ? (
            <p className="text-sm text-stone-700">No dietary needs recorded.</p>
          ) : (
            <ul className="flex flex-wrap gap-1.5">
              {Object.entries(diets).map(([d, n]) => (
                <li key={d} className="rounded-full bg-yellow-100 px-2.5 py-1 text-xs font-semibold text-yellow-900 ring-1 ring-inset ring-yellow-600/25">
                  {n} × {d}
                </li>
              ))}
            </ul>
          )}
        </div>

        <ol className="space-y-1.5">
          {row.map((id, i) => {
            if (!id) {
              return (
                <li
                  key={`free-${i}`}
                  className="flex min-h-11 items-center gap-3 rounded-xl border border-dashed border-stone-300 px-3 text-sm text-stone-500"
                >
                  <span className="w-5 text-xs tabular-nums">{i + 1}</span>
                  {ctl.armed ? (
                    <button
                      type="button"
                      onClick={() => ctl.onSeatClick(selected, i)}
                      className="font-semibold text-teal-800 underline underline-offset-2"
                    >
                      Seat {guestById(ctl.armed).name} here
                    </button>
                  ) : (
                    "Empty seat"
                  )}
                </li>
              );
            }
            const g = guestById(id);
            return (
              <li key={id} className="rounded-xl border border-stone-200 bg-white p-2.5">
                <div className="flex items-center gap-2.5">
                  <span className="w-5 text-xs tabular-nums text-stone-500">{i + 1}</span>
                  <span className={`size-2.5 shrink-0 rounded-full ${partyStyle(g.party).dot}`} aria-hidden />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">{g.name}</span>
                    <span className="block truncate text-xs text-stone-600">{g.party}</span>
                  </span>
                  {g.diet ? <DietPill diet={g.diet} /> : <span className="text-xs text-stone-500">No requirements</span>}
                </div>
                <div className="mt-2 flex items-center gap-2 pl-7">
                  <label className="sr-only" htmlFor={`mv-${g.id}`}>
                    Move {g.name} to another table
                  </label>
                  <span className="relative">
                    <ArrowRightLeft className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-stone-600" aria-hidden />
                    <select
                      id={`mv-${g.id}`}
                      value=""
                      onChange={(e) => e.target.value && onMove(g.id, e.target.value)}
                      className="min-h-10 rounded-lg border border-stone-300 bg-white py-1 pl-8 pr-2 text-sm font-medium text-stone-800"
                    >
                      <option value="">Move to…</option>
                      {otherTables.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name} ({t.seats - filledCount(seats, t.id)} free)
                        </option>
                      ))}
                    </select>
                  </span>
                  <button
                    type="button"
                    onClick={() => onUnseat(g.id)}
                    className="inline-flex min-h-10 items-center gap-1.5 rounded-lg px-3 text-sm font-semibold text-red-800 ring-1 ring-red-200 hover:bg-red-50"
                  >
                    <UserMinus className="size-4" aria-hidden /> Unseat
                  </button>
                </div>
              </li>
            );
          })}
        </ol>
        {free === 0 ? <p className="text-sm text-stone-600">This table is full.</p> : null}
      </div>
    </Card>
  );
}
```

```tsx components/PlanProvider.tsx
"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  evaluateRules,
  initialSeats,
  moveGuest,
  tableOfGuest,
  unseatGuest,
  type MoveResult,
  type RuleResult,
  type Seats,
} from "@/lib/plan";

interface Notice {
  id: number;
  text: string;
  ok: boolean;
}

interface PlanContextValue {
  seats: Seats;
  tableOf: Record<string, string>;
  rules: RuleResult[];
  notice: Notice | null;
  seat: (guestId: string, tableId: string, seatIndex?: number) => MoveResult;
  unseat: (guestId: string) => void;
  reset: () => void;
}

const PlanContext = createContext<PlanContextValue | null>(null);

export function PlanProvider({ children }: { children: React.ReactNode }) {
  const [seats, setSeats] = useState<Seats>(() => initialSeats());
  const [notice, setNotice] = useState<Notice | null>(null);
  const counter = useRef(0);
  const seatsRef = useRef(seats);
  seatsRef.current = seats;

  useEffect(() => {
    if (!notice) return;
    const t = window.setTimeout(() => setNotice(null), 4500);
    return () => window.clearTimeout(t);
  }, [notice]);

  const announce = useCallback((r: MoveResult) => {
    counter.current += 1;
    setNotice({ id: counter.current, text: r.message, ok: r.ok });
  }, []);

  const seat = useCallback(
    (guestId: string, tableId: string, seatIndex?: number) => {
      const r = moveGuest(seatsRef.current, guestId, tableId, seatIndex);
      if (r.ok) {
        seatsRef.current = r.seats;
        setSeats(r.seats);
      }
      announce(r);
      return r;
    },
    [announce],
  );

  const unseat = useCallback(
    (guestId: string) => {
      const r = unseatGuest(seatsRef.current, guestId);
      seatsRef.current = r.seats;
      setSeats(r.seats);
      announce(r);
    },
    [announce],
  );

  const reset = useCallback(() => {
    const s = initialSeats();
    seatsRef.current = s;
    setSeats(s);
    announce({ seats: s, ok: true, message: "Plan reset to the starting arrangement." });
  }, [announce]);

  const value = useMemo<PlanContextValue>(
    () => ({
      seats,
      tableOf: tableOfGuest(seats),
      rules: evaluateRules(seats),
      notice,
      seat,
      unseat,
      reset,
    }),
    [seats, notice, seat, unseat, reset],
  );

  return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>;
}

export function usePlan(): PlanContextValue {
  const ctx = useContext(PlanContext);
  if (!ctx) throw new Error("usePlan must be used inside PlanProvider");
  return ctx;
}
```

```tsx components/Planner.tsx
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, CheckCircle2, Armchair, RotateCcw, UserCheck, UserX, Users, X } from "lucide-react";
import { EVENT, GUESTS, TABLES, guestById, initials } from "@/lib/data";
import { partyStyle } from "@/lib/ui";
import { usePlan } from "./PlanProvider";
import { Floor, type PlanCtl } from "./Floor";
import { Card, RulesPanel, TablePanel, UnseatedPanel } from "./Panels";

function dropKey(x: number, y: number): string | null {
  const el = document.elementFromPoint(x, y);
  const target = el ? el.closest("[data-drop]") : null;
  return target ? target.getAttribute("data-drop") : null;
}

function Stat({
  label,
  value,
  sub,
  icon,
  tone = "neutral",
}: {
  label: string;
  value: React.ReactNode;
  sub: string;
  icon: React.ReactNode;
  tone?: "neutral" | "good" | "warn" | "bad";
}) {
  const tones = {
    neutral: "bg-stone-100 text-stone-700",
    good: "bg-emerald-100 text-emerald-800",
    warn: "bg-amber-100 text-amber-900",
    bad: "bg-red-100 text-red-800",
  };
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-white p-3.5 shadow-sm">
      <span className={`grid size-10 shrink-0 place-items-center rounded-xl ${tones[tone]}`} aria-hidden>
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-xs font-medium text-stone-600">{label}</p>
        <p className="font-display text-2xl font-semibold leading-none tabular-nums">{value}</p>
        <p className="mt-1 truncate text-xs text-stone-600">{sub}</p>
      </div>
    </div>
  );
}

export function Planner() {
  const { seats, tableOf, rules, seat, unseat, reset } = usePlan();
  const [armed, setArmed] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  const justDragged = useRef(false);
  const panelRef = useRef<HTMLElement | null>(null);
  const seatsRef = useRef(seats);
  seatsRef.current = seats;
  const armedRef = useRef(armed);
  armedRef.current = armed;

  const stats = useMemo(() => {
    const attending = GUESTS.filter((g) => g.rsvp === "yes");
    const seated = Object.keys(tableOf).length;
    const unseated = attending.filter((g) => !tableOf[g.id]).length;
    const capacity = TABLES.reduce((n, t) => n + t.seats, 0);
    const broken = rules.filter((r) => r.status === "broken").length;
    return { attending: attending.length, seated, unseated, capacity, broken };
  }, [tableOf, rules]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setArmed(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (selected && window.innerWidth < 1280) {
      panelRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [selected]);

  const place = useCallback(
    (guestId: string, tableId: string, seatIndex?: number) => {
      seat(guestId, tableId, seatIndex);
      setSelected(tableId);
      setArmed(null);
    },
    [seat],
  );

  const onSeatClick = useCallback(
    (tableId: string, idx: number) => {
      if (justDragged.current) return;
      const occupant = seatsRef.current[tableId]?.[idx] ?? null;
      const current = armedRef.current;
      if (current) {
        if (occupant === current) setArmed(null);
        else place(current, tableId, idx);
        return;
      }
      setSelected(tableId);
      if (occupant) setArmed(occupant);
    },
    [place],
  );

  const onTableClick = useCallback(
    (tableId: string) => {
      if (justDragged.current) return;
      const current = armedRef.current;
      if (current) place(current, tableId);
      else setSelected(tableId);
    },
    [place],
  );

  const onChipClick = useCallback((guestId: string) => {
    if (justDragged.current) return;
    setArmed((a) => (a === guestId ? null : guestId));
  }, []);

  const onGuestPointerDown = useCallback(
    (e: React.PointerEvent, guestId: string) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      const start = { x: e.clientX, y: e.clientY, started: false };

      const move = (ev: PointerEvent) => {
        if (!start.started) {
          if (Math.hypot(ev.clientX - start.x, ev.clientY - start.y) < 8) return;
          start.started = true;
          setDragId(guestId);
        }
        setPos({ x: ev.clientX, y: ev.clientY });
        setHover(dropKey(ev.clientX, ev.clientY));
      };
      const end = () => {
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", up);
        window.removeEventListener("pointercancel", end);
        setDragId(null);
        setPos(null);
        setHover(null);
      };
      function up(ev: PointerEvent) {
        end();
        if (!start.started) return;
        justDragged.current = true;
        window.setTimeout(() => {
          justDragged.current = false;
        }, 60);
        const key = dropKey(ev.clientX, ev.clientY);
        if (!key) return;
        const [kind, tableId, idx] = key.split(":");
        if (kind === "seat" && tableId) place(guestId, tableId, Number(idx));
        else if (kind === "table" && tableId) place(guestId, tableId);
        else if (kind === "pool") {
          unseat(guestId);
          setArmed(null);
        }
      }
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);
      window.addEventListener("pointercancel", end);
    },
    [place, unseat],
  );

  const ctl: PlanCtl = {
    armed,
    selected,
    dragId,
    hover,
    onSeatClick,
    onTableClick,
    onGuestPointerDown,
  };

  const armedGuest = armed ? guestById(armed) : null;
  const dragGuest = dragId ? guestById(dragId) : null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">Seating plan</h1>
          <p className="text-sm text-stone-600">
            Drag guests onto seats, or tap a guest and then a seat. Counts and rules update as you go.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat
          label="Seated"
          value={stats.seated}
          sub={`${stats.capacity - stats.seated} of ${stats.capacity} seats free`}
          icon={<UserCheck className="size-5" />}
          tone="good"
        />
        <Stat
          label="Still to seat"
          value={stats.unseated}
          sub={`of ${stats.attending} attending`}
          icon={<UserX className="size-5" />}
          tone={stats.unseated > 0 ? "warn" : "good"}
        />
        <Stat
          label="Tables"
          value={TABLES.length}
          sub={TABLES.map((t) => seats[t.id]?.filter(Boolean).length ?? 0).join(" · ") + " seated"}
          icon={<Armchair className="size-5" />}
        />
        <Stat
          label="Rules"
          value={stats.broken === 0 ? "All kept" : `${stats.broken} broken`}
          sub={`${rules.length} rules from the couple`}
          icon={stats.broken === 0 ? <CheckCircle2 className="size-5" /> : <AlertTriangle className="size-5" />}
          tone={stats.broken === 0 ? "good" : "bad"}
        />
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-4 xl:grid-cols-[minmax(0,1fr)_390px]">
        <Card
          title="Room plan"
          aside={
            <div className="flex items-center gap-3">
              <span className="hidden text-xs text-stone-600 sm:inline">
                {EVENT.room_m.width} m × {EVENT.room_m.depth} m, drawn to scale
              </span>
              <button
                type="button"
                onClick={() => {
                  reset();
                  setArmed(null);
                  setSelected(null);
                }}
                className="inline-flex min-h-9 items-center gap-1.5 rounded-lg px-2.5 text-sm font-semibold text-stone-700 ring-1 ring-stone-300 hover:bg-stone-50"
              >
                <RotateCcw className="size-4" aria-hidden /> Reset
              </button>
            </div>
          }
          className="min-w-0 self-start xl:col-start-1 xl:row-start-1"
        >
          <div className="space-y-3 p-3">
            {armedGuest ? (
              <div className="flex items-center justify-between gap-3 rounded-xl bg-teal-800 px-3.5 py-2.5 text-sm text-white">
                <p>
                  <span className="font-semibold">{armedGuest.name}</span> is picked up. Tap a seat or table to place
                  them.
                </p>
                <button
                  type="button"
                  onClick={() => setArmed(null)}
                  className="inline-flex min-h-9 shrink-0 items-center gap-1 rounded-lg bg-white/15 px-2.5 font-semibold hover:bg-white/25"
                >
                  <X className="size-4" aria-hidden /> Cancel
                </button>
              </div>
            ) : (
              <p className="flex items-center gap-2 text-sm text-stone-600">
                <Users className="size-4 shrink-0" aria-hidden />
                Tap a table to see its guests. Tap a seated guest to pick them up and move them.
              </p>
            )}
            <Floor seats={seats} rules={rules} ctl={ctl} />
          </div>
        </Card>

        <div className="grid grid-cols-[minmax(0,1fr)] content-start items-start gap-4 md:grid-cols-[repeat(2,minmax(0,1fr))] xl:col-start-2 xl:row-span-2 xl:row-start-1 xl:grid-cols-[minmax(0,1fr)]">
          <UnseatedPanel tableOf={tableOf} ctl={ctl} onChipClick={onChipClick} />
          <div className="min-w-0">
            <TablePanel
              seats={seats}
              rules={rules}
              selected={selected}
              ctl={ctl}
              onSelect={setSelected}
              onMove={(g, t) => place(g, t)}
              onUnseat={(g) => unseat(g)}
              onClose={() => setSelected(null)}
              panelRef={panelRef}
            />
          </div>
        </div>
        <div className="min-w-0 xl:col-start-1 xl:row-start-2">
          <RulesPanel rules={rules} onPick={setSelected} />
        </div>
      </div>

      {dragGuest && pos ? (
        <div
          aria-hidden
          className="pointer-events-none fixed z-50 flex -translate-x-1/2 -translate-y-[130%] items-center gap-2 rounded-full bg-white py-1 pl-1 pr-3 text-sm font-semibold shadow-xl ring-1 ring-stone-300"
          style={{ left: pos.x, top: pos.y }}
        >
          <span className={`grid size-7 place-items-center rounded-full text-xs ${partyStyle(dragGuest.party).seat}`}>
            {initials(dragGuest.name)}
          </span>
          {dragGuest.name}
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
  kind: "together" | "apart" | "near";
  guests: string[];
  note: string;
  /** For "near" rules: the fixture to sit close to and the one to stay away from. */
  near?: { to: string; awayFrom?: string };
  /** A data check worth confirming with the couple. */
  check?: string;
}

export const APP = "Seatwise";

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

const g = (
  n: string,
  name: string,
  party: string,
  rsvp: Rsvp,
  diet: string | null,
  table: string | null,
): Guest => ({ id: `g-${n}`, name, party, rsvp, diet, table });

export const GUESTS: Guest[] = [
  g("01", "Ines Carvalho", "Couple", "yes", null, "t-head"),
  g("02", "Mateo Alvarez", "Couple", "yes", "Vegetarian", "t-head"),
  g("03", "Rui Carvalho", "Bride's family", "yes", null, "t-head"),
  g("04", "Marta Carvalho", "Bride's family", "yes", "Gluten free", "t-head"),
  g("05", "Javier Alvarez", "Groom's family", "yes", null, "t-head"),
  g("06", "Lucia Alvarez", "Groom's family", "yes", null, "t-head"),
  g("07", "Sofia Carvalho", "Bride's family", "yes", null, "t-1"),
  g("08", "Tiago Carvalho", "Bride's family", "yes", null, "t-1"),
  g("09", "Avó Rosa Carvalho", "Bride's family", "yes", "Soft food", "t-1"),
  g("10", "Pedro Nunes", "Bride's family", "yes", null, "t-1"),
  g("11", "Ana Nunes", "Bride's family", "yes", "Vegan", "t-1"),
  g("12", "Carmen Alvarez", "Groom's family", "yes", null, "t-4"),
  g("13", "Diego Alvarez", "Groom's family", "yes", null, "t-4"),
  g("14", "Elena Ruiz", "Groom's family", "yes", "Nut allergy", "t-4"),
  g("15", "Pablo Ruiz", "Groom's family", "yes", null, "t-4"),
  g("16", "Isabel Ruiz", "Groom's family", "maybe", null, null),
  g("17", "Chloe Martin", "University friends", "yes", null, "t-2"),
  g("18", "Ben Okafor", "University friends", "yes", null, "t-2"),
  g("19", "Leila Haddad", "University friends", "yes", "Halal", "t-2"),
  g("20", "Omar Haddad", "University friends", "yes", "Halal", "t-2"),
  g("21", "Freya Lund", "University friends", "yes", "Vegetarian", null),
  g("22", "Jonas Lund", "University friends", "yes", null, null),
  g("23", "Grace Lee", "Work friends", "yes", null, "t-5"),
  g("24", "Marcus Webb", "Work friends", "yes", null, "t-5"),
  g("25", "Nadia Petrova", "Work friends", "yes", "Pescatarian", "t-5"),
  g("26", "Tom Fisher", "Work friends", "no", null, null),
  g("27", "Hana Sato", "Work friends", "yes", null, null),
  g("28", "Luis Ortega", "Groom's football club", "yes", null, "t-3"),
  g("29", "Kai Brennan", "Groom's football club", "yes", null, "t-3"),
  g("30", "Sean Doyle", "Groom's football club", "yes", null, "t-3"),
  g("31", "Ryan Doyle", "Groom's football club", "yes", null, null),
  g("32", "Hugo Carvalho", "Bride's family", "yes", "Children's menu", "t-1"),
  g("33", "Mia Carvalho", "Bride's family", "yes", "Children's menu", null),
  g("34", "Paula Mendes", "Bride's family", "pending", null, null),
  g("35", "Victor Mendes", "Bride's family", "pending", null, null),
  g("36", "Zoe Bennett", "Plus-ones", "yes", null, "t-2"),
  g("37", "Arjun Mehta", "Plus-ones", "yes", "Vegetarian", "t-5"),
  g("38", "Laura Svensson", "Plus-ones", "yes", null, null),
];

export const RULES: Rule[] = [
  { kind: "together", guests: ["g-21", "g-22"], note: "Couple" },
  { kind: "together", guests: ["g-32", "g-33"], note: "Siblings, under 10" },
  {
    kind: "apart",
    guests: ["g-29", "g-30"],
    note: "Brothers Sean and Ryan Doyle are not speaking",
    check:
      "The note names Sean and Ryan Doyle, but this rule lists Kai Brennan and Sean Doyle. Worth confirming with the couple.",
  },
  { kind: "apart", guests: ["g-12", "g-34"], note: "Ask the couple: old family dispute" },
  {
    kind: "near",
    guests: ["g-09"],
    note: "Avó Rosa uses a wheelchair: seat near the garden doors, away from the band",
    near: { to: "f-4", awayFrom: "f-1" },
  },
];

export const PARTIES = [
  "Couple",
  "Bride's family",
  "Groom's family",
  "University friends",
  "Work friends",
  "Groom's football club",
  "Plus-ones",
];

export const RSVP_LABEL: Record<Rsvp, string> = {
  yes: "Attending",
  maybe: "Maybe",
  pending: "No reply",
  no: "Declined",
};

export const STANDARD_MEAL = "Standard menu";

export function guestById(id: string): Guest {
  const found = GUESTS.find((x) => x.id === id);
  if (!found) throw new Error(`Unknown guest ${id}`);
  return found;
}

export function tableById(id: string): Table {
  const found = TABLES.find((x) => x.id === id);
  if (!found) throw new Error(`Unknown table ${id}`);
  return found;
}

export function initials(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return (first + last).toUpperCase();
}

export function formatDate(iso: string): string {
  const d = new Date(`${iso}T12:00:00Z`);
  return d.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}
```

```ts lib/plan.ts
import {
  FIXTURES,
  GUESTS,
  RULES,
  TABLES,
  guestById,
  tableById,
  type Fixture,
  type Rule,
  type Table,
} from "./data";

/** Seat map: for every table, one slot per seat holding a guest id or null. */
export type Seats = Record<string, (string | null)[]>;

export function initialSeats(): Seats {
  const seats: Seats = {};
  for (const t of TABLES) seats[t.id] = Array.from({ length: t.seats }, () => null);
  for (const guest of GUESTS) {
    if (!guest.table) continue;
    const row = seats[guest.table];
    if (!row) continue;
    const free = row.indexOf(null);
    if (free >= 0) row[free] = guest.id;
  }
  return seats;
}

export function locate(seats: Seats, guestId: string): { table: string; seat: number } | null {
  for (const tableId of Object.keys(seats)) {
    const idx = (seats[tableId] ?? []).indexOf(guestId);
    if (idx >= 0) return { table: tableId, seat: idx };
  }
  return null;
}

export function tableOfGuest(seats: Seats): Record<string, string> {
  const map: Record<string, string> = {};
  for (const tableId of Object.keys(seats)) {
    for (const id of seats[tableId] ?? []) if (id) map[id] = tableId;
  }
  return map;
}

export function filledCount(seats: Seats, tableId: string): number {
  return (seats[tableId] ?? []).filter(Boolean).length;
}

export interface MoveResult {
  seats: Seats;
  ok: boolean;
  message: string;
}

/** Seat a guest at a table (optionally at a chosen seat), moving or swapping as needed. */
export function moveGuest(
  seats: Seats,
  guestId: string,
  tableId: string,
  seatIndex?: number,
): MoveResult {
  const guest = guestById(guestId);
  const table = tableById(tableId);
  const next: Seats = {};
  for (const k of Object.keys(seats)) next[k] = [...(seats[k] ?? [])];
  const row = next[tableId];
  if (!row) return { seats, ok: false, message: "Unknown table." };

  const from = locate(next, guestId);

  if (seatIndex !== undefined && seatIndex >= 0 && seatIndex < row.length) {
    const occupant = row[seatIndex] ?? null;
    if (occupant === guestId) {
      return { seats, ok: true, message: `${guest.name} is already in that seat.` };
    }
    if (occupant === null) {
      if (from) (next[from.table] as (string | null)[])[from.seat] = null;
      row[seatIndex] = guestId;
      return {
        seats: next,
        ok: true,
        message: from
          ? `${guest.name} moved to ${table.name}, seat ${seatIndex + 1}.`
          : `${guest.name} seated at ${table.name}, seat ${seatIndex + 1}.`,
      };
    }
    if (from) {
      (next[from.table] as (string | null)[])[from.seat] = occupant;
      row[seatIndex] = guestId;
      return {
        seats: next,
        ok: true,
        message: `${guest.name} and ${guestById(occupant).name} swapped seats.`,
      };
    }
    // Dragged from the unseated list onto an occupied seat: use another free seat.
  }

  const alreadyHere = row.indexOf(guestId);
  if (alreadyHere >= 0) {
    return { seats, ok: true, message: `${guest.name} is already at ${table.name}.` };
  }
  const free = row.indexOf(null);
  if (free < 0) {
    return { seats, ok: false, message: `${table.name} is full (${table.seats} of ${table.seats} seats).` };
  }
  if (from) (next[from.table] as (string | null)[])[from.seat] = null;
  row[free] = guestId;
  return {
    seats: next,
    ok: true,
    message: from
      ? `${guest.name} moved to ${table.name}.`
      : `${guest.name} seated at ${table.name}.`,
  };
}

export function unseatGuest(seats: Seats, guestId: string): MoveResult {
  const from = locate(seats, guestId);
  if (!from) return { seats, ok: true, message: "Already unseated." };
  const next: Seats = {};
  for (const k of Object.keys(seats)) next[k] = [...(seats[k] ?? [])];
  (next[from.table] as (string | null)[])[from.seat] = null;
  return {
    seats: next,
    ok: true,
    message: `${guestById(guestId).name} unseated from ${tableById(from.table).name}.`,
  };
}

/* ------------------------------------------------------------------ geometry */

export interface SeatPos {
  dx: number;
  dy: number;
}

export const SEAT_R = 0.4;

/** Seat offsets (metres) from the table centre, already rotated. */
export function seatOffsets(table: Table): SeatPos[] {
  const rot = ((table.rotation ?? 0) * Math.PI) / 180;
  const out: SeatPos[] = [];
  if (table.shape === "round") {
    const r = 1.0 + SEAT_R + 0.08;
    for (let i = 0; i < table.seats; i++) {
      const a = -Math.PI / 2 + (i * 2 * Math.PI) / table.seats;
      out.push({ dx: Math.cos(a) * r, dy: Math.sin(a) * r });
    }
    return out;
  }
  const perSide = Math.ceil(table.seats / 2);
  const gap = 1.12;
  for (let i = 0; i < table.seats; i++) {
    const top = i < perSide;
    const idx = top ? i : i - perSide;
    const count = top ? perSide : table.seats - perSide;
    const x = (idx - (count - 1) / 2) * gap;
    const y = (top ? -1 : 1) * (0.45 + SEAT_R + 0.06);
    out.push({
      dx: x * Math.cos(rot) - y * Math.sin(rot),
      dy: x * Math.sin(rot) + y * Math.cos(rot),
    });
  }
  return out;
}

export function tableSize(table: Table): { w: number; h: number } {
  if (table.shape === "round") return { w: 2, h: 2 };
  const perSide = Math.ceil(table.seats / 2);
  return { w: perSide * 1.12 + 0.1, h: 0.9 };
}

function centre(f: Fixture): { x: number; y: number } {
  return { x: f.x + f.w / 2, y: f.y + f.h / 2 };
}

function dist(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function fixtureById(id: string): Fixture {
  const f = FIXTURES.find((x) => x.id === id);
  if (!f) throw new Error(`Unknown fixture ${id}`);
  return f;
}

/* --------------------------------------------------------------------- rules */

export type RuleStatus = "broken" | "ok" | "open";

export interface RuleResult {
  index: number;
  rule: Rule;
  kind: Rule["kind"];
  status: RuleStatus;
  title: string;
  detail: string;
  tables: string[];
  guests: string[];
}

const NEAR_MAX_M = 6.5;
const AWAY_MIN_M = 8;

export function evaluateRules(seats: Seats): RuleResult[] {
  const where = tableOfGuest(seats);
  return RULES.map((rule, index): RuleResult => {
    const names = rule.guests.map((id) => guestById(id).name);
    const seated = rule.guests.filter((id) => where[id]);
    const tables = Array.from(new Set(seated.map((id) => where[id] as string)));

    if (rule.kind === "together") {
      const title = `Keep ${names.join(" and ")} together`;
      if (seated.length === rule.guests.length) {
        if (tables.length === 1) {
          return { index, rule, kind: rule.kind, status: "ok", title, detail: `Both at ${tableById(tables[0] as string).name}.`, tables, guests: seated };
        }
        return {
          index, rule, kind: rule.kind, status: "broken", title,
          detail: `Split across ${tables.map((t) => tableById(t).name).join(" and ")}.`,
          tables, guests: seated,
        };
      }
      const missing = rule.guests.filter((id) => !where[id]).map((id) => guestById(id).name);
      return {
        index, rule, kind: rule.kind, status: "open", title,
        detail: seated.length === 0 ? "Neither is seated yet." : `${missing.join(", ")} still needs a seat.`,
        tables, guests: seated,
      };
    }

    if (rule.kind === "apart") {
      const title = `Keep ${names.join(" and ")} apart`;
      const [a, b] = rule.guests;
      const ta = a ? where[a] : undefined;
      const tb = b ? where[b] : undefined;
      if (ta && tb && ta === tb) {
        return {
          index, rule, kind: rule.kind, status: "broken", title,
          detail: `Both at ${tableById(ta).name}.`, tables: [ta], guests: seated,
        };
      }
      return {
        index, rule, kind: rule.kind, status: "ok", title,
        detail: ta && tb ? "At different tables." : "Not seated together.",
        tables, guests: seated,
      };
    }

    const to = rule.near ? fixtureById(rule.near.to) : null;
    const away = rule.near?.awayFrom ? fixtureById(rule.near.awayFrom) : null;
    const title = `Seat ${names.join(" and ")} near ${to ? to.label.toLowerCase() : "the group"}${away ? `, away from the ${away.label.toLowerCase()}` : ""}`;
    const tid = tables[0];
    if (!tid || !to) {
      return { index, rule, kind: rule.kind, status: "open", title, detail: "Not seated yet.", tables, guests: seated };
    }
    const t = tableById(tid);
    const dTo = dist(t, centre(to));
    const dAway = away ? dist(t, centre(away)) : Infinity;
    if (dTo > NEAR_MAX_M) {
      return {
        index, rule, kind: rule.kind, status: "broken", title,
        detail: `${t.name} is ${dTo.toFixed(0)} m from the ${to.label.toLowerCase()}.`, tables, guests: seated,
      };
    }
    if (away && dAway < AWAY_MIN_M) {
      return {
        index, rule, kind: rule.kind, status: "broken", title,
        detail: `${t.name} is only ${dAway.toFixed(0)} m from the ${away.label.toLowerCase()}.`, tables, guests: seated,
      };
    }
    return {
      index, rule, kind: rule.kind, status: "ok", title,
      detail: `${t.name} is ${dTo.toFixed(0)} m from the ${to.label.toLowerCase()}.`, tables, guests: seated,
    };
  });
}
```

```ts lib/ui.ts
import type { Rsvp } from "./data";

export const PARTY_STYLE: Record<string, { seat: string; dot: string; soft: string }> = {
  Couple: { seat: "bg-stone-900 text-white", dot: "bg-stone-900", soft: "bg-stone-200 text-stone-900" },
  "Bride's family": { seat: "bg-violet-700 text-white", dot: "bg-violet-700", soft: "bg-violet-100 text-violet-900" },
  "Groom's family": { seat: "bg-sky-700 text-white", dot: "bg-sky-700", soft: "bg-sky-100 text-sky-900" },
  "University friends": { seat: "bg-emerald-700 text-white", dot: "bg-emerald-700", soft: "bg-emerald-100 text-emerald-900" },
  "Work friends": { seat: "bg-amber-700 text-white", dot: "bg-amber-700", soft: "bg-amber-100 text-amber-900" },
  "Groom's football club": { seat: "bg-lime-800 text-white", dot: "bg-lime-800", soft: "bg-lime-100 text-lime-900" },
  "Plus-ones": { seat: "bg-pink-700 text-white", dot: "bg-pink-700", soft: "bg-pink-100 text-pink-900" },
};

export function partyStyle(party: string) {
  return (
    PARTY_STYLE[party] ?? { seat: "bg-slate-700 text-white", dot: "bg-slate-700", soft: "bg-slate-100 text-slate-900" }
  );
}

export const RSVP_STYLE: Record<Rsvp, string> = {
  yes: "bg-emerald-100 text-emerald-900 ring-emerald-600/20",
  maybe: "bg-amber-100 text-amber-900 ring-amber-600/20",
  pending: "bg-slate-100 text-slate-700 ring-slate-500/20",
  no: "bg-rose-100 text-rose-900 ring-rose-600/20",
};
```

