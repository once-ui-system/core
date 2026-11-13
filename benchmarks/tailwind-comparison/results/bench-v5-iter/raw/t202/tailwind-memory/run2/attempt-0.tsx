```css app/globals.css
@import "tailwindcss";

@theme {
  --font-sans: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  --font-display: "Iowan Old Style", "Palatino Linotype", Palatino, "Book Antiqua", Georgia, serif;
  --color-paper: #f6f3ec;
  --color-ink: #1c2320;
  --color-brand-50: #eef6f1;
  --color-brand-100: #d5eadd;
  --color-brand-200: #acd4bd;
  --color-brand-500: #2f8460;
  --color-brand-600: #256a4e;
  --color-brand-700: #1d5540;
  --color-brand-800: #17432f;
  --color-brand-900: #10321f;
}

html {
  background: var(--color-paper);
  color: var(--color-ink);
}

body {
  min-height: 100dvh;
  background: var(--color-paper);
}

button,
select,
input {
  font: inherit;
}

@media (prefers-reduced-motion: reduce) {
  * {
    transition: none !important;
    animation: none !important;
  }
}

@media print {
  body {
    background: white;
  }
}
```

```tsx app/guests/page.tsx
import type { Metadata } from "next";
import GuestsView from "@/components/GuestsView";

export const metadata: Metadata = { title: "Guest list | Seatwise" };

export default function Page() {
  return <GuestsView />;
}
```

```tsx app/layout.tsx
import "./globals.css";

import type { Metadata } from "next";
import AppHeader from "@/components/AppHeader";
import { PlanProvider } from "@/components/PlanProvider";

export const metadata: Metadata = {
  title: "Seatwise: seating plan for Ines & Mateo",
  description: "A seating planner for wedding and event planners.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-paper font-sans text-ink antialiased">
        <PlanProvider>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:shadow-lg"
          >
            Skip to content
          </a>
          <AppHeader />
          <main id="main">{children}</main>
        </PlanProvider>
      </body>
    </html>
  );
}
```

```tsx app/page.tsx
import PlanView from "@/components/PlanView";

export default function Page() {
  return <PlanView />;
}
```

```tsx components/AppHeader.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, LayoutGrid, MapPin, Users } from "lucide-react";
import { event, formatEventDate, planner } from "@/lib/data";

const NAV = [
  { href: "/", label: "Seating plan", icon: LayoutGrid },
  { href: "/guests", label: "Guest list", icon: Users },
];

export default function AppHeader() {
  const pathname = usePathname();
  return (
    <header className="border-b border-stone-200 bg-white/90 backdrop-blur print:border-0">
      <div className="mx-auto flex w-full max-w-[1500px] flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600">
          <span aria-hidden="true" className="grid size-9 place-items-center rounded-xl bg-brand-700">
            <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="white" strokeWidth="1.8">
              <circle cx="12" cy="12" r="3.6" />
              {[0, 60, 120, 180, 240, 300].map((a) => (
                <circle
                  key={a}
                  cx={12 + 8 * Math.cos((a * Math.PI) / 180)}
                  cy={12 + 8 * Math.sin((a * Math.PI) / 180)}
                  r="1.4"
                  fill="white"
                  stroke="none"
                />
              ))}
            </svg>
          </span>
          <span className="font-display text-xl font-semibold tracking-tight">Seatwise</span>
        </Link>

        <nav aria-label="Main" className="order-3 flex w-full gap-1 sm:order-none sm:w-auto print:hidden">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 sm:flex-none ${
                  active ? "bg-brand-50 text-brand-800" : "text-stone-600 hover:bg-stone-100"
                }`}
              >
                <Icon className="size-4" aria-hidden="true" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-4">
          <div className="hidden text-right md:block">
            <p className="text-sm font-semibold leading-tight">{event.name}</p>
            <p className="mt-0.5 flex items-center justify-end gap-3 text-xs text-stone-600">
              <span className="inline-flex items-center gap-1">
                <CalendarDays className="size-3.5" aria-hidden="true" />
                {formatEventDate(event.date)}
              </span>
              <span className="inline-flex items-center gap-1">
                <MapPin className="size-3.5" aria-hidden="true" />
                {event.venue}
              </span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span aria-hidden="true" className="grid size-9 place-items-center rounded-full bg-stone-800 text-xs font-semibold text-white">
              HB
            </span>
            <span className="hidden text-sm font-medium lg:inline">{planner.name}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
```

```tsx components/GuestsView.tsx
"use client";

import { useMemo, useState } from "react";
import { Printer, Search, SearchX, Utensils } from "lucide-react";
import { diets, guests, parties, rsvpLabel, tableById, tables, type Guest, type Rsvp } from "@/lib/data";
import { filled } from "@/lib/plan";
import { usePlan } from "./PlanProvider";
import { Card, DietBadge, PartyDot, RsvpBadge } from "./ui";

const STANDARD = "No dietary need";

const selectCls =
  "min-h-11 w-full rounded-lg border border-stone-300 bg-white px-3 text-sm text-stone-900 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand-600";

function Field({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-xs font-medium tracking-wide text-stone-600 uppercase">
        {label}
      </label>
      {children}
    </div>
  );
}

function MealCounts() {
  const { loc } = usePlan();
  const rows = useMemo(() => {
    const names = [STANDARD, ...diets];
    const meal = (g: Guest) => g.diet ?? STANDARD;
    return names
      .map((name) => {
        const mine = guests.filter((g) => meal(g) === name);
        return {
          name,
          yes: mine.filter((g) => g.rsvp === "yes").length,
          unsure: mine.filter((g) => g.rsvp === "maybe" || g.rsvp === "pending").length,
          seated: mine.filter((g) => g.rsvp === "yes" && loc[g.id]).length,
        };
      })
      .sort((a, b) => (a.name === STANDARD ? -1 : b.name === STANDARD ? 1 : b.yes - a.yes || a.name.localeCompare(b.name)));
  }, [loc]);
  const total = rows.reduce(
    (acc, r) => ({ yes: acc.yes + r.yes, unsure: acc.unsure + r.unsure, seated: acc.seated + r.seated }),
    { yes: 0, unsure: 0, seated: 0 },
  );
  const declined = guests.filter((g) => g.rsvp === "no").length;

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2">
        <Utensils className="size-5 text-brand-700" aria-hidden="true" />
        <h2 className="font-display text-lg font-semibold">Meals for the caterer</h2>
      </div>
      <p className="mt-1 text-xs text-stone-600">
        Order for the confirmed guests. Maybe and awaiting-reply guests are listed separately.
      </p>
      <table className="mt-3 w-full text-sm">
        <caption className="sr-only">Meal counts by dietary need</caption>
        <thead>
          <tr className="border-b border-stone-200 text-left text-xs text-stone-600">
            <th scope="col" className="py-2 pr-2 font-medium">Meal</th>
            <th scope="col" className="px-2 py-2 text-right font-medium">Confirmed</th>
            <th scope="col" className="px-2 py-2 text-right font-medium">Not confirmed</th>
            <th scope="col" className="py-2 pl-2 text-right font-medium">Seated</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-100">
          {rows.map((r) => (
            <tr key={r.name}>
              <th scope="row" className="py-2 pr-2 text-left font-medium">{r.name}</th>
              <td className="px-2 py-2 text-right font-semibold tabular-nums">{r.yes}</td>
              <td className="px-2 py-2 text-right text-stone-600 tabular-nums">{r.unsure}</td>
              <td className="py-2 pl-2 text-right text-stone-600 tabular-nums">{r.seated}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-stone-300 font-semibold">
            <th scope="row" className="py-2 pr-2 text-left">Total</th>
            <td className="px-2 py-2 text-right tabular-nums">{total.yes}</td>
            <td className="px-2 py-2 text-right tabular-nums">{total.unsure}</td>
            <td className="py-2 pl-2 text-right tabular-nums">{total.seated}</td>
          </tr>
        </tfoot>
      </table>
      <p className="mt-2 text-xs text-stone-600">{declined} declined and not counted.</p>
    </Card>
  );
}

export default function GuestsView() {
  const { loc, seatMap, seatGuest, unseatGuest } = usePlan();
  const [q, setQ] = useState("");
  const [party, setParty] = useState("");
  const [rsvp, setRsvp] = useState("");
  const [diet, setDiet] = useState("");
  const [seating, setSeating] = useState("");

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return guests.filter((g) => {
      if (needle && !`${g.name} ${g.party} ${g.diet ?? ""}`.toLowerCase().includes(needle)) return false;
      if (party && g.party !== party) return false;
      if (rsvp && g.rsvp !== rsvp) return false;
      if (diet === "none" ? g.diet !== null : diet && g.diet !== diet) return false;
      if (seating === "seated" && !loc[g.id]) return false;
      if (seating === "unseated" && loc[g.id]) return false;
      return true;
    });
  }, [q, party, rsvp, diet, seating, loc]);

  const filtering = !!(q || party || rsvp || diet || seating);
  const reset = () => {
    setQ("");
    setParty("");
    setRsvp("");
    setDiet("");
    setSeating("");
  };

  const onTable = (g: Guest, value: string) => {
    if (value === "") unseatGuest(g.id);
    else seatGuest(g.id, value);
  };

  return (
    <div className="mx-auto w-full max-w-[1500px] px-4 pt-5 pb-12 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold">Guest list</h1>
          <p className="text-sm text-stone-600">
            {guests.length} invited · {guests.filter((g) => g.rsvp === "yes").length} attending ·{" "}
            {guests.filter((g) => !loc[g.id] && g.rsvp === "yes").length} still need a seat
          </p>
        </div>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-stone-300 bg-white px-4 text-sm font-semibold hover:bg-stone-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 print:hidden"
        >
          <Printer className="size-4" aria-hidden="true" /> Print for venue and caterer
        </button>
      </div>

      <div className="mt-4 grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="min-w-0 space-y-4">
          <Card className="p-4 print:hidden">
            <div className="relative">
              <label htmlFor="guest-search" className="sr-only">Search guests</label>
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-stone-500" aria-hidden="true" />
              <input
                id="guest-search"
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search by name, party or diet"
                className="min-h-11 w-full rounded-lg border border-stone-300 bg-white pr-3 pl-9 text-sm focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand-600"
              />
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Field id="f-party" label="Party">
                <select id="f-party" className={selectCls} value={party} onChange={(e) => setParty(e.target.value)}>
                  <option value="">All parties</option>
                  {parties.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </Field>
              <Field id="f-rsvp" label="RSVP">
                <select id="f-rsvp" className={selectCls} value={rsvp} onChange={(e) => setRsvp(e.target.value)}>
                  <option value="">Any reply</option>
                  {(Object.keys(rsvpLabel) as Rsvp[]).map((r) => (
                    <option key={r} value={r}>{rsvpLabel[r]}</option>
                  ))}
                </select>
              </Field>
              <Field id="f-diet" label="Diet">
                <select id="f-diet" className={selectCls} value={diet} onChange={(e) => setDiet(e.target.value)}>
                  <option value="">Any diet</option>
                  <option value="none">{STANDARD}</option>
                  {diets.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </Field>
              <Field id="f-seat" label="Seating">
                <select id="f-seat" className={selectCls} value={seating} onChange={(e) => setSeating(e.target.value)}>
                  <option value="">Seated and unseated</option>
                  <option value="seated">Seated</option>
                  <option value="unseated">Unseated</option>
                </select>
              </Field>
            </div>
            <div className="mt-3 flex items-center justify-between gap-3 text-sm">
              <p aria-live="polite" className="text-stone-700">
                Showing <span className="font-semibold tabular-nums">{shown.length}</span> of {guests.length} guests
              </p>
              {filtering && (
                <button
                  type="button"
                  onClick={reset}
                  className="min-h-10 rounded-lg px-3 font-semibold text-brand-700 hover:bg-brand-50 focus-visible:outline-2 focus-visible:outline-brand-600"
                >
                  Clear filters
                </button>
              )}
            </div>
          </Card>

          <Card>
            <div
              aria-hidden="true"
              className="hidden grid-cols-[minmax(0,2.2fr)_minmax(0,1.4fr)_minmax(0,1.2fr)_minmax(0,1.3fr)_minmax(0,1.6fr)] gap-3 border-b border-stone-200 px-4 py-2.5 text-xs font-medium tracking-wide text-stone-600 uppercase md:grid"
            >
              <span>Guest</span>
              <span>Reply</span>
              <span>Diet</span>
              <span>Table</span>
              <span className="print:hidden">Move to</span>
            </div>
            {shown.length === 0 ? (
              <div className="flex flex-col items-center gap-2 px-4 py-12 text-center">
                <SearchX className="size-8 text-stone-400" aria-hidden="true" />
                <p className="font-semibold">No guests match these filters</p>
                <button
                  type="button"
                  onClick={reset}
                  className="min-h-11 rounded-lg bg-brand-700 px-4 text-sm font-semibold text-white hover:bg-brand-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <ul className="divide-y divide-stone-100">
                {shown.map((g) => {
                  const l = loc[g.id];
                  const tname = l ? `${tableById[l.tableId].name}, seat ${l.seat + 1}` : null;
                  return (
                    <li
                      key={g.id}
                      className="grid grid-cols-2 items-center gap-x-3 gap-y-2 px-4 py-3 md:grid-cols-[minmax(0,2.2fr)_minmax(0,1.4fr)_minmax(0,1.2fr)_minmax(0,1.3fr)_minmax(0,1.6fr)]"
                    >
                      <div className="col-span-2 min-w-0 md:col-span-1">
                        <p className="truncate text-sm font-semibold">{g.name}</p>
                        <p className="mt-0.5 flex items-center gap-1.5 text-xs text-stone-600">
                          <PartyDot party={g.party} />
                          <span className="truncate">{g.party}</span>
                        </p>
                      </div>
                      <div>
                        <RsvpBadge rsvp={g.rsvp} />
                      </div>
                      <div>{g.diet ? <DietBadge diet={g.diet} /> : <span className="text-xs text-stone-500">None</span>}</div>
                      <div className="text-sm">
                        {tname ? (
                          <span className="font-medium">{tname}</span>
                        ) : (
                          <span className={g.rsvp === "yes" ? "font-medium text-amber-800" : "text-stone-500"}>
                            {g.rsvp === "yes" ? "Needs a seat" : "Not seated"}
                          </span>
                        )}
                      </div>
                      <div className="print:hidden">
                        {g.rsvp === "no" ? (
                          <span className="text-xs text-stone-500">Declined</span>
                        ) : (
                          <>
                            <label htmlFor={`mv-${g.id}`} className="sr-only">
                              Move {g.name} to a table
                            </label>
                            <select
                              id={`mv-${g.id}`}
                              className={selectCls}
                              value={l?.tableId ?? ""}
                              onChange={(e) => onTable(g, e.target.value)}
                            >
                              <option value="">Not seated</option>
                              {tables.map((t) => {
                                const free = t.seats - filled(seatMap, t.id);
                                return (
                                  <option key={t.id} value={t.id} disabled={free === 0 && l?.tableId !== t.id}>
                                    {t.name} ({free} free)
                                  </option>
                                );
                              })}
                            </select>
                          </>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        </div>

        <div className="min-w-0 xl:sticky xl:top-4">
          <MealCounts />
        </div>
      </div>
    </div>
  );
}
```

```tsx components/PlanProvider.tsx
"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { guestById, tableById } from "@/lib/data";
import {
  evaluateRules,
  initialSeatMap,
  locate,
  seatGuest as seatGuestInMap,
  unseatGuest as unseatGuestInMap,
  type Location,
  type RuleResult,
  type SeatMap,
} from "@/lib/plan";

interface PlanCtx {
  seatMap: SeatMap;
  loc: Record<string, Location>;
  rules: RuleResult[];
  brokenTables: Set<string>;
  brokenGuests: Set<string>;
  selectedGuestId: string | null;
  selectedTableId: string | null;
  dragId: string | null;
  setDragId: (id: string | null) => void;
  selectGuest: (id: string | null) => void;
  selectTable: (id: string | null) => void;
  seatGuest: (guestId: string, tableId: string, seat?: number) => void;
  unseatGuest: (guestId: string) => void;
  clickSeat: (tableId: string, seat: number) => void;
  clickTable: (tableId: string) => void;
}

const Ctx = createContext<PlanCtx | null>(null);

export function usePlan(): PlanCtx {
  const c = useContext(Ctx);
  if (!c) throw new Error("usePlan must be used inside PlanProvider");
  return c;
}

export function PlanProvider({ children }: { children: React.ReactNode }) {
  const [seatMap, setSeatMap] = useState<SeatMap>(initialSeatMap);
  const [selectedGuestId, setSelectedGuestId] = useState<string | null>(null);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");

  const loc = useMemo(() => locate(seatMap), [seatMap]);
  const rules = useMemo(() => evaluateRules(seatMap), [seatMap]);
  const { brokenTables, brokenGuests } = useMemo(() => {
    const bt = new Set<string>();
    const bg = new Set<string>();
    for (const r of rules) {
      if (r.status !== "broken") continue;
      r.tableIds.forEach((t) => bt.add(t));
      r.guestIds.forEach((g) => bg.add(g));
    }
    return { brokenTables: bt, brokenGuests: bg };
  }, [rules]);

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(""), 3800);
    return () => clearTimeout(t);
  }, [notice]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedGuestId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const seatGuest = useCallback(
    (guestId: string, tableId: string, seat?: number) => {
      const g = guestById[guestId];
      const t = tableById[tableId];
      if (!g || !t) return;
      const res = seatGuestInMap(seatMap, guestId, tableId, seat);
      if (!res.ok) {
        setNotice(`${t.name} is full. Pick another table or seat.`);
        return;
      }
      setSeatMap(res.map);
      setSelectedTableId(tableId);
      setSelectedGuestId(null);
      const extra = res.displaced ? `, ${guestById[res.displaced].name} is now unseated` : "";
      setNotice(`${g.name} seated at ${t.name}${extra}.`);
    },
    [seatMap],
  );

  const unseatGuest = useCallback(
    (guestId: string) => {
      const g = guestById[guestId];
      if (!g || !loc[guestId]) return;
      setSeatMap(unseatGuestInMap(seatMap, guestId));
      setSelectedGuestId((cur) => (cur === guestId ? null : cur));
      setNotice(`${g.name} is now unseated.`);
    },
    [seatMap, loc],
  );

  const selectGuest = useCallback(
    (id: string | null) => {
      setSelectedGuestId(id);
      if (id && loc[id]) setSelectedTableId(loc[id].tableId);
    },
    [loc],
  );

  const clickSeat = useCallback(
    (tableId: string, seat: number) => {
      const occupant = seatMap[tableId]?.[seat] ?? null;
      if (selectedGuestId) {
        if (occupant === selectedGuestId) setSelectedGuestId(null);
        else seatGuest(selectedGuestId, tableId, seat);
        return;
      }
      setSelectedTableId(tableId);
      if (occupant) setSelectedGuestId(occupant);
    },
    [seatMap, selectedGuestId, seatGuest],
  );

  const clickTable = useCallback(
    (tableId: string) => {
      if (selectedGuestId) seatGuest(selectedGuestId, tableId);
      else setSelectedTableId((cur) => (cur === tableId ? null : tableId));
    },
    [selectedGuestId, seatGuest],
  );

  const value: PlanCtx = {
    seatMap,
    loc,
    rules,
    brokenTables,
    brokenGuests,
    selectedGuestId,
    selectedTableId,
    dragId,
    setDragId,
    selectGuest,
    selectTable: setSelectedTableId,
    seatGuest,
    unseatGuest,
    clickSeat,
    clickTable,
  };

  return (
    <Ctx.Provider value={value}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className={`pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-4 transition-opacity duration-200 print:hidden ${
          notice ? "opacity-100" : "opacity-0"
        }`}
      >
        {notice && (
          <p className="rounded-full bg-stone-900 px-4 py-2 text-sm font-medium text-white shadow-lg">{notice}</p>
        )}
      </div>
    </Ctx.Provider>
  );
}
```

```tsx components/PlanView.tsx
"use client";

import { CircleCheck, Clock, Hand, TriangleAlert, UserMinus, X } from "lucide-react";
import { guestById, guests, tableById, tables, type Guest } from "@/lib/data";
import { filled } from "@/lib/plan";
import { usePlan } from "./PlanProvider";
import RoomPlan from "./RoomPlan";
import { Card, DietBadge, PartyDot } from "./ui";

function Stat({ label, value, sub, tone = "default" }: { label: string; value: string; sub?: string; tone?: "default" | "bad" | "good" }) {
  const toneCls =
    tone === "bad" ? "text-red-700" : tone === "good" ? "text-brand-700" : "text-stone-900";
  return (
    <div className="rounded-2xl border border-stone-200 bg-white px-4 py-3 shadow-sm">
      <p className="text-xs font-medium tracking-wide text-stone-600 uppercase">{label}</p>
      <p className={`font-display mt-0.5 text-3xl font-semibold tabular-nums ${toneCls}`}>{value}</p>
      {sub && <p className="text-xs text-stone-600">{sub}</p>}
    </div>
  );
}

function SelectionBar() {
  const { selectedGuestId, loc, seatMap, seatGuest, unseatGuest, selectGuest } = usePlan();
  if (!selectedGuestId) return null;
  const g = guestById[selectedGuestId];
  const cur = loc[selectedGuestId];
  return (
    <div
      role="region"
      aria-label="Selected guest"
      className="sticky top-2 z-30 mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl bg-stone-900 px-4 py-3 text-white shadow-lg print:hidden"
    >
      <Hand className="size-5 shrink-0 text-amber-300" aria-hidden="true" />
      <p className="min-w-0 flex-1 text-sm">
        <span className="font-semibold">{g.name}</span> selected.{" "}
        <span className="text-stone-300">
          {cur ? `At ${tableById[cur.tableId].name}. ` : "Not seated. "}Tap a seat or table on the plan, or choose below.
        </span>
      </p>
      <label className="flex items-center gap-2 text-sm">
        <span className="sr-only sm:not-sr-only">Seat at</span>
        <select
          value=""
          onChange={(e) => e.target.value && seatGuest(g.id, e.target.value)}
          className="min-h-10 rounded-lg border border-stone-600 bg-stone-800 px-2 text-sm text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300"
        >
          <option value="">Choose a table…</option>
          {tables.map((t) => {
            const free = t.seats - filled(seatMap, t.id);
            return (
              <option key={t.id} value={t.id} disabled={free === 0 && cur?.tableId !== t.id}>
                {t.name} ({free} free)
              </option>
            );
          })}
        </select>
      </label>
      {cur && (
        <button
          type="button"
          onClick={() => unseatGuest(g.id)}
          className="inline-flex min-h-10 items-center gap-1.5 rounded-lg bg-white/10 px-3 text-sm font-medium hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300"
        >
          <UserMinus className="size-4" aria-hidden="true" /> Unseat
        </button>
      )}
      <button
        type="button"
        onClick={() => selectGuest(null)}
        className="inline-flex min-h-10 items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-stone-200 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300"
      >
        <X className="size-4" aria-hidden="true" /> Cancel
      </button>
    </div>
  );
}

function TablesStrip() {
  const { seatMap, selectedTableId, clickTable, brokenTables } = usePlan();
  return (
    <Card className="p-4">
      <h2 className="font-display text-lg font-semibold">Tables</h2>
      <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-7">
        {tables.map((t) => {
          const n = filled(seatMap, t.id);
          const sel = selectedTableId === t.id;
          const bad = brokenTables.has(t.id);
          return (
            <li key={t.id}>
              <button
                type="button"
                onClick={() => clickTable(t.id)}
                aria-pressed={sel}
                className={`flex min-h-16 w-full flex-col justify-between rounded-xl border px-3 py-2 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 ${
                  sel ? "border-brand-600 bg-brand-50" : "border-stone-200 bg-white hover:bg-stone-50"
                }`}
              >
                <span className="flex items-center justify-between gap-1 text-sm font-semibold">
                  {t.name}
                  {bad && (
                    <>
                      <TriangleAlert className="size-4 text-red-600" aria-hidden="true" />
                      <span className="sr-only">Rule broken</span>
                    </>
                  )}
                </span>
                <span className="text-xs text-stone-600 tabular-nums">
                  {n} of {t.seats} seated{n === t.seats ? " (full)" : ""}
                </span>
                <span aria-hidden="true" className="mt-1 block h-1 overflow-hidden rounded-full bg-stone-200">
                  <span className="block h-full bg-brand-500" style={{ width: `${(n / t.seats) * 100}%` }} />
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

function RulesCard() {
  const { rules, selectTable } = usePlan();
  const broken = rules.filter((r) => r.status === "broken").length;
  const waiting = rules.filter((r) => r.status === "waiting").length;
  const ok = rules.filter((r) => r.status === "ok").length;
  return (
    <Card className="p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-display text-lg font-semibold">The couple&apos;s rules</h2>
        <p className="text-sm text-stone-700" aria-live="polite">
          <span className={broken ? "font-semibold text-red-700" : "font-semibold text-brand-700"}>{broken} broken</span>
          {" · "}
          {waiting} waiting · {ok} kept
        </p>
      </div>
      <ul className="mt-3 divide-y divide-stone-200">
        {rules.map((r) => {
          const Icon = r.status === "broken" ? TriangleAlert : r.status === "ok" ? CircleCheck : Clock;
          const color = r.status === "broken" ? "text-red-600" : r.status === "ok" ? "text-brand-600" : "text-stone-500";
          const statusText = r.status === "broken" ? "Broken" : r.status === "ok" ? "Kept" : "Waiting";
          return (
            <li key={r.id} className="py-3 first:pt-0 last:pb-0">
              <button
                type="button"
                disabled={r.tableIds.length === 0}
                onClick={() => selectTable(r.tableIds[0])}
                className="flex w-full gap-3 rounded-lg text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 enabled:hover:bg-stone-50"
              >
                <Icon className={`mt-0.5 size-5 shrink-0 ${color}`} aria-hidden="true" />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold">
                    <span className="sr-only">{statusText}: </span>
                    {r.label}: {r.title}
                  </span>
                  <span className="mt-0.5 block text-sm text-stone-700">{r.detail}</span>
                  <span className="mt-0.5 block text-xs text-stone-600 italic">{r.note}</span>
                </span>
              </button>
              {r.warning && (
                <p className="mt-1.5 ml-8 rounded-lg bg-amber-50 px-3 py-1.5 text-xs text-amber-900 ring-1 ring-amber-200">
                  Data check: {r.warning}
                </p>
              )}
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

function TableDetail() {
  const { selectedTableId, seatMap, selectedGuestId, selectGuest, unseatGuest, rules, brokenGuests } = usePlan();
  if (!selectedTableId) {
    return (
      <Card className="p-4">
        <h2 className="font-display text-lg font-semibold">Table details</h2>
        <p className="mt-2 text-sm text-stone-600">
          Select a table on the plan to see who is sitting there and what they eat.
        </p>
      </Card>
    );
  }
  const t = tableById[selectedTableId];
  const seats = seatMap[t.id];
  const seated = seats.filter((x): x is string => !!x).map((id) => guestById[id]);
  const dietCounts = new Map<string, number>();
  seated.forEach((g) => g.diet && dietCounts.set(g.diet, (dietCounts.get(g.diet) ?? 0) + 1));
  const problems = rules.filter((r) => r.status === "broken" && r.tableIds.includes(t.id));
  return (
    <Card className="p-4">
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="font-display text-lg font-semibold">{t.name}</h2>
        <p className="text-sm text-stone-600 tabular-nums">
          {seated.length} of {t.seats} seated
        </p>
      </div>

      {problems.length > 0 && (
        <ul className="mt-2 space-y-1">
          {problems.map((p) => (
            <li key={p.id} className="flex gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-900 ring-1 ring-red-200">
              <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <span>
                <span className="font-semibold">{p.label}:</span> {p.detail}
              </span>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-3">
        <h3 className="text-xs font-medium tracking-wide text-stone-600 uppercase">Dietary needs here</h3>
        {dietCounts.size === 0 ? (
          <p className="mt-1 text-sm text-stone-600">No special diets at this table.</p>
        ) : (
          <ul className="mt-1.5 flex flex-wrap gap-1.5">
            {Array.from(dietCounts).map(([d, n]) => (
              <li key={d} className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-900 ring-1 ring-amber-300/70">
                {n} × {d}
              </li>
            ))}
          </ul>
        )}
      </div>

      <ol className="mt-3 divide-y divide-stone-100">
        {seats.map((gid, i) => {
          const g: Guest | null = gid ? guestById[gid] : null;
          return (
            <li key={i} className="flex min-h-11 items-center gap-3 py-1.5">
              <span className="grid size-6 shrink-0 place-items-center rounded-full bg-stone-100 text-xs font-semibold text-stone-700 tabular-nums">
                {i + 1}
              </span>
              {g ? (
                <>
                  <button
                    type="button"
                    onClick={() => selectGuest(selectedGuestId === g.id ? null : g.id)}
                    aria-pressed={selectedGuestId === g.id}
                    className={`flex min-w-0 flex-1 flex-col items-start rounded-lg px-2 py-1 text-left focus-visible:outline-2 focus-visible:outline-brand-600 ${
                      selectedGuestId === g.id ? "bg-stone-900 text-white" : "hover:bg-stone-50"
                    }`}
                  >
                    <span className="flex items-center gap-2 text-sm font-medium">
                      <PartyDot party={g.party} />
                      <span className="truncate">{g.name}</span>
                      {brokenGuests.has(g.id) && <TriangleAlert className="size-3.5 text-red-500" aria-label="Rule broken" />}
                    </span>
                    <span className={`text-xs ${selectedGuestId === g.id ? "text-stone-300" : "text-stone-600"}`}>
                      {g.party}
                      {g.rsvp !== "yes" ? ` · ${g.rsvp}` : ""}
                    </span>
                  </button>
                  <DietBadge diet={g.diet} />
                  <button
                    type="button"
                    onClick={() => unseatGuest(g.id)}
                    aria-label={`Unseat ${g.name}`}
                    className="grid size-10 shrink-0 place-items-center rounded-lg text-stone-600 hover:bg-stone-100 hover:text-red-700 focus-visible:outline-2 focus-visible:outline-brand-600"
                  >
                    <UserMinus className="size-4" aria-hidden="true" />
                  </button>
                </>
              ) : (
                <span className="px-2 text-sm text-stone-500 italic">Empty seat</span>
              )}
            </li>
          );
        })}
      </ol>
    </Card>
  );
}

function GuestRow({ g }: { g: Guest }) {
  const { selectedGuestId, selectGuest, setDragId } = usePlan();
  const sel = selectedGuestId === g.id;
  return (
    <li
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", g.id);
        e.dataTransfer.effectAllowed = "move";
        setDragId(g.id);
      }}
      onDragEnd={() => setDragId(null)}
    >
      <button
        type="button"
        onClick={() => selectGuest(sel ? null : g.id)}
        aria-pressed={sel}
        className={`flex min-h-12 w-full cursor-grab items-center gap-3 rounded-xl border px-3 py-2 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 ${
          sel ? "border-stone-900 bg-stone-900 text-white" : "border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50"
        }`}
      >
        <PartyDot party={g.party} className="size-3" />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium">{g.name}</span>
          <span className={`block truncate text-xs ${sel ? "text-stone-300" : "text-stone-600"}`}>{g.party}</span>
        </span>
        <DietBadge diet={g.diet} />
      </button>
    </li>
  );
}

function UnseatedCard() {
  const { loc, dragId, unseatGuest, setDragId } = usePlan();
  const open = guests.filter((g) => !loc[g.id]);
  const attending = open.filter((g) => g.rsvp === "yes");
  const unsure = open.filter((g) => g.rsvp === "maybe" || g.rsvp === "pending");
  return (
    <Card className="p-4">
      <div
        onDragOver={(e) => dragId && loc[dragId] && e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const id = e.dataTransfer.getData("text/plain") || dragId;
          if (id) unseatGuest(id);
          setDragId(null);
        }}
      >
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="font-display text-lg font-semibold">Needs a seat</h2>
          <p className="text-sm font-semibold tabular-nums text-stone-700">{attending.length} attending</p>
        </div>
        <p className="mt-1 text-xs text-stone-600">
          Drag a guest onto a seat or table, or tap a guest and then a seat. Drop a seated guest here to unseat them.
        </p>
        {attending.length === 0 ? (
          <p className="mt-3 flex items-center gap-2 rounded-xl bg-brand-50 px-3 py-3 text-sm font-medium text-brand-800">
            <CircleCheck className="size-5" aria-hidden="true" /> Every attending guest has a seat.
          </p>
        ) : (
          <ul className="mt-3 space-y-1.5">
            {attending.map((g) => (
              <GuestRow key={g.id} g={g} />
            ))}
          </ul>
        )}
        {unsure.length > 0 && (
          <>
            <h3 className="mt-4 text-xs font-medium tracking-wide text-stone-600 uppercase">
              Not confirmed ({unsure.length})
            </h3>
            <ul className="mt-1.5 space-y-1.5">
              {unsure.map((g) => (
                <GuestRow key={g.id} g={g} />
              ))}
            </ul>
          </>
        )}
      </div>
    </Card>
  );
}

export default function PlanView() {
  const { loc, rules } = usePlan();
  const attending = guests.filter((g) => g.rsvp === "yes");
  const seatedAttending = attending.filter((g) => loc[g.id]).length;
  const seatedOthers = Object.keys(loc).length - seatedAttending;
  const broken = rules.filter((r) => r.status === "broken").length;

  return (
    <div className="mx-auto w-full max-w-[1500px] px-4 pt-5 pb-12 sm:px-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Attending" value={String(attending.length)} sub="confirmed yes" />
        <Stat
          label="Seated"
          value={String(seatedAttending)}
          sub={seatedOthers > 0 ? `plus ${seatedOthers} not yet confirmed` : `of ${attending.length} attending`}
          tone="good"
        />
        <Stat
          label="Unseated"
          value={String(attending.length - seatedAttending)}
          sub="attending, no seat yet"
          tone={attending.length - seatedAttending > 0 ? "default" : "good"}
        />
        <Stat
          label="Rules"
          value={broken === 0 ? "All kept" : `${broken} broken`}
          sub={`${rules.length} from the couple`}
          tone={broken > 0 ? "bad" : "good"}
        />
      </div>

      <SelectionBar />

      <div className="mt-4 grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="min-w-0 space-y-4">
          <Card className="p-3 sm:p-4">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-1 pb-3">
              <h1 className="font-display text-xl font-semibold">Seating plan</h1>
              <p className="text-sm text-stone-600">The Orangery, drawn to scale: 24 × 14 m. Scroll sideways on a small screen.</p>
            </div>
            <RoomPlan />
          </Card>
          <TablesStrip />
          <RulesCard />
        </div>
        <div className="min-w-0 space-y-4">
          <TableDetail />
          <UnseatedCard />
        </div>
      </div>
    </div>
  );
}
```

```tsx components/RoomPlan.tsx
"use client";

import { useState } from "react";
import { TriangleAlert } from "lucide-react";
import { event, fixtures, guestById, parties, partyColor, tables, type Fixture, type Table } from "@/lib/data";
import { filled, initials, longTableLength, tableDiameter } from "@/lib/plan";
import { usePlan } from "./PlanProvider";

const W = event.room_m.width;
const D = event.room_m.depth;
const SEAT = 0.8;

const pctX = (m: number) => `${(m / W) * 100}%`;
const pctY = (m: number) => `${(m / D) * 100}%`;

function seatPositions(t: Table): { x: number; y: number }[] {
  const rad = ((t.rotation ?? 0) * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const at = (dx: number, dy: number) => ({ x: t.x + dx * cos - dy * sin, y: t.y + dx * sin + dy * cos });
  if (t.shape === "long") {
    const half = t.seats / 2;
    return Array.from({ length: t.seats }, (_, i) => {
      const side = i < half ? -1 : 1;
      const col = i % half;
      return at((col - (half - 1) / 2) * 1.1, side * 1.1);
    });
  }
  const r = tableDiameter(t) / 2 + 0.7;
  return Array.from({ length: t.seats }, (_, i) => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / t.seats;
    return at(Math.cos(a) * r, Math.sin(a) * r);
  });
}

function FixtureShape({ f }: { f: Fixture }) {
  const base: React.CSSProperties = { left: pctX(f.x), top: pctY(f.y), width: pctX(f.w), height: pctY(f.h) };
  if (f.kind === "door") {
    return (
      <div role="img" aria-label={f.label} className="absolute" style={base}>
        <div className="size-full rounded-sm bg-brand-600" />
        <span
          className="absolute left-full top-1/2 ml-1 -translate-y-1/2 text-[10px] font-semibold tracking-wide text-brand-800 uppercase"
          style={{ writingMode: "vertical-rl", transform: "translateY(-50%) rotate(180deg)" }}
        >
          {f.label}
        </span>
      </div>
    );
  }
  const style: Record<Exclude<Fixture["kind"], "door">, string> = {
    stage: "bg-stone-800 text-white",
    dancefloor:
      "bg-[repeating-conic-gradient(#efe6d3_0%_25%,#f8f2e5_0%_50%)] bg-[length:28px_28px] text-stone-700 ring-1 ring-stone-300",
    bar: "bg-amber-800 text-amber-50",
  };
  return (
    <div
      role="img"
      aria-label={f.label}
      className={`absolute grid place-items-center rounded-md text-[11px] font-semibold tracking-wide uppercase ${style[f.kind]}`}
      style={base}
    >
      {f.label}
    </div>
  );
}

export default function RoomPlan() {
  const {
    seatMap, brokenTables, brokenGuests, selectedGuestId, selectedTableId, dragId, setDragId,
    clickSeat, clickTable, seatGuest,
  } = usePlan();
  const [over, setOver] = useState<string | null>(null);

  const onDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.effectAllowed = "move";
    setDragId(id);
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-stone-200 bg-stone-100 p-2 sm:p-3">
      <div
        className="relative aspect-[24/14] min-w-[680px] overflow-hidden rounded-lg border-2 border-stone-400 bg-[#fbf9f4]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(60,50,30,.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(60,50,30,.06) 1px, transparent 1px)",
          backgroundSize: `${100 / W}% ${100 / D}%`,
        }}
      >
        {fixtures.map((f) => (
          <FixtureShape key={f.id} f={f} />
        ))}

        {tables.map((t) => {
          const isLong = t.shape === "long";
          const w = isLong ? longTableLength(t) : tableDiameter(t);
          const h = isLong ? 1.1 : tableDiameter(t);
          const selected = selectedTableId === t.id;
          const broken = brokenTables.has(t.id);
          const count = filled(seatMap, t.id);
          const full = count === t.seats;
          const key = `table:${t.id}`;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => clickTable(t.id)}
              onDragOver={(e) => {
                if (dragId) {
                  e.preventDefault();
                  setOver(key);
                }
              }}
              onDragLeave={() => setOver((o) => (o === key ? null : o))}
              onDrop={(e) => {
                e.preventDefault();
                setOver(null);
                const id = e.dataTransfer.getData("text/plain") || dragId;
                if (id) seatGuest(id, t.id);
                setDragId(null);
              }}
              aria-pressed={selected}
              className={`absolute flex flex-col items-center justify-center border-2 text-center shadow-sm transition-shadow focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-600 ${
                isLong ? "rounded-md" : "rounded-full"
              } ${
                broken ? "border-red-500 bg-red-50" : selected ? "border-brand-600 bg-brand-50" : "border-stone-300 bg-white"
              } ${selected ? "shadow-md ring-4 ring-brand-500/25" : ""} ${over === key ? "ring-4 ring-brand-500/50" : ""}`}
              style={{
                left: pctX(t.x),
                top: pctY(t.y),
                width: pctX(w),
                height: pctY(h),
                transform: `translate(-50%, -50%) rotate(${t.rotation ?? 0}deg)`,
              }}
            >
              <span className="text-[11px] font-semibold leading-tight text-stone-800">{t.name}</span>
              <span className={`text-[10px] leading-tight tabular-nums ${full ? "font-semibold text-brand-700" : "text-stone-600"}`}>
                {count}/{t.seats}
              </span>
              <span className="sr-only">
                seats filled{broken ? ", a rule is broken here" : ""}
              </span>
            </button>
          );
        })}

        {tables.map((t) => {
          if (!brokenTables.has(t.id)) return null;
          const dx = t.shape === "long" ? longTableLength(t) / 2 : (tableDiameter(t) / 2) * 0.72;
          const dy = t.shape === "long" ? -0.55 : -(tableDiameter(t) / 2) * 0.72;
          return (
            <span
              key={`flag-${t.id}`}
              aria-hidden="true"
              className="pointer-events-none absolute z-20 grid size-5 place-items-center rounded-full bg-red-600 text-white shadow ring-2 ring-white"
              style={{ left: pctX(t.x + dx), top: pctY(t.y + dy), transform: "translate(-50%, -50%)" }}
            >
              <TriangleAlert className="size-3" />
            </span>
          );
        })}

        {tables.flatMap((t) => {
          const pos = seatPositions(t);
          return pos.map((p, i) => {
            const gid = seatMap[t.id]?.[i] ?? null;
            const g = gid ? guestById[gid] : null;
            const key = `${t.id}:${i}`;
            const isSel = !!gid && gid === selectedGuestId;
            const isBroken = !!gid && brokenGuests.has(gid);
            const label = g
              ? `${t.name}, seat ${i + 1}: ${g.name}${g.diet ? `, ${g.diet}` : ""}${isBroken ? ", rule broken" : ""}`
              : `${t.name}, seat ${i + 1}: empty${selectedGuestId ? ", place selected guest here" : ""}`;
            return (
              <button
                key={key}
                type="button"
                draggable={!!g}
                onDragStart={g ? (e) => onDragStart(e, g.id) : undefined}
                onDragEnd={() => {
                  setDragId(null);
                  setOver(null);
                }}
                onDragOver={(e) => {
                  if (dragId) {
                    e.preventDefault();
                    setOver(key);
                  }
                }}
                onDragLeave={() => setOver((o) => (o === key ? null : o))}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setOver(null);
                  const id = e.dataTransfer.getData("text/plain") || dragId;
                  if (id) seatGuest(id, t.id, i);
                  setDragId(null);
                }}
                onClick={() => clickSeat(t.id, i)}
                aria-label={label}
                data-i={g ? initials(g.name) : undefined}
                title={g ? `${g.name}${g.diet ? ` (${g.diet})` : ""}` : `${t.name}, seat ${i + 1} (empty)`}
                className={`absolute z-10 grid place-items-center rounded-full text-[9px] font-bold leading-none transition-transform after:content-[attr(data-i)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 ${
                  g
                    ? "cursor-grab text-white shadow-sm"
                    : "border-2 border-dashed border-stone-400 bg-white/90 text-stone-400 hover:border-brand-600"
                } ${isBroken ? "ring-2 ring-red-600 ring-offset-1" : ""} ${isSel ? "scale-125 ring-2 ring-stone-900 ring-offset-2" : ""} ${
                  over === key ? "scale-125 ring-2 ring-brand-500 ring-offset-2" : ""
                }`}
                style={{
                  left: pctX(p.x),
                  top: pctY(p.y),
                  width: pctX(SEAT),
                  height: pctY(SEAT),
                  translate: "-50% -50%",
                  background: g ? partyColor(g.party) : undefined,
                }}
              >
                {g?.diet && (
                  <span
                    aria-hidden="true"
                    className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full border border-white bg-amber-400"
                  />
                )}
              </button>
            );
          });
        })}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 px-1 text-xs text-stone-700">
        {parties.map((p) => (
          <span key={p} className="inline-flex items-center gap-1.5">
            <span aria-hidden="true" className="size-3 rounded-full" style={{ background: partyColor(p) }} />
            {p}
          </span>
        ))}
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden="true" className="size-3 rounded-full border-2 border-dashed border-stone-400 bg-white" />
          Empty seat
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden="true" className="size-2.5 rounded-full border border-white bg-amber-400 ring-1 ring-stone-300" />
          Dietary need
        </span>
        <span className="ml-auto inline-flex items-center gap-2">
          <span aria-hidden="true" className="h-1.5 w-16 border-x-2 border-b-2 border-stone-600" />
          5 m
        </span>
      </div>
    </div>
  );
}
```

```tsx components/ui.tsx
import { partyColor, rsvpLabel, type Rsvp } from "@/lib/data";

export function PartyDot({ party, className = "" }: { party: string; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block size-2.5 shrink-0 rounded-full ${className}`}
      style={{ background: partyColor(party) }}
    />
  );
}

export function DietBadge({ diet }: { diet: string | null }) {
  if (!diet) return null;
  return (
    <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900 ring-1 ring-amber-300/70">
      {diet}
    </span>
  );
}

const RSVP_STYLE: Record<Rsvp, string> = {
  yes: "bg-emerald-100 text-emerald-900 ring-emerald-300/70",
  maybe: "bg-amber-100 text-amber-900 ring-amber-300/70",
  pending: "bg-sky-100 text-sky-900 ring-sky-300/70",
  no: "bg-rose-100 text-rose-900 ring-rose-300/70",
};

export function RsvpBadge({ rsvp }: { rsvp: Rsvp }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ${RSVP_STYLE[rsvp]}`}
    >
      {rsvpLabel[rsvp]}
    </span>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-2xl border border-stone-200 bg-white shadow-sm print:shadow-none ${className}`}>
      {children}
    </section>
  );
}
```

```ts lib/data.ts
export type Rsvp = "yes" | "maybe" | "pending" | "no";

export interface Guest {
  id: string;
  name: string;
  party: string;
  rsvp: Rsvp;
  diet: string | null;
  table: string | null;
}

export interface Fixture {
  id: string;
  kind: "stage" | "dancefloor" | "bar" | "door";
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Table {
  id: string;
  name: string;
  shape: "long" | "round";
  seats: number;
  x: number;
  y: number;
  rotation?: number;
}

export interface Rule {
  kind: "together" | "apart" | "near";
  guests: string[];
  note: string;
}

export const app = "Seatwise, a seating planner for wedding and event planners";

export const event = {
  name: "Ines & Mateo's wedding dinner",
  date: "2027-06-19",
  venue: "The Orangery, Hollin Hall",
  room_m: { width: 24, depth: 14 },
};

export const planner = { name: "Hannah Brook" };

export const fixtures: Fixture[] = [
  { id: "f-1", kind: "stage", label: "Band", x: 10, y: 0.5, w: 4, h: 2 },
  { id: "f-2", kind: "dancefloor", label: "Dance floor", x: 8.5, y: 3, w: 7, h: 4 },
  { id: "f-3", kind: "bar", label: "Bar", x: 21, y: 10, w: 2.5, h: 3.5 },
  { id: "f-4", kind: "door", label: "Garden doors", x: 0, y: 6, w: 0.5, h: 2.5 },
];

export const tables: Table[] = [
  { id: "t-head", name: "Top table", shape: "long", seats: 8, x: 8, y: 8.2, rotation: 0 },
  { id: "t-1", name: "Table 1", shape: "round", seats: 8, x: 3, y: 2.5 },
  { id: "t-2", name: "Table 2", shape: "round", seats: 8, x: 3, y: 7 },
  { id: "t-3", name: "Table 3", shape: "round", seats: 8, x: 3, y: 11.5 },
  { id: "t-4", name: "Table 4", shape: "round", seats: 8, x: 19, y: 2.5 },
  { id: "t-5", name: "Table 5", shape: "round", seats: 8, x: 19, y: 7 },
  { id: "t-6", name: "Table 6", shape: "round", seats: 6, x: 12, y: 12 },
];

export const guests: Guest[] = [
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

export const rules: Rule[] = [
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

export const guestById: Record<string, Guest> = Object.fromEntries(guests.map((g) => [g.id, g]));
export const tableById: Record<string, Table> = Object.fromEntries(tables.map((t) => [t.id, t]));

export const parties: string[] = Array.from(new Set(guests.map((g) => g.party)));

const PARTY_COLORS: Record<string, string> = {
  Couple: "#be123c",
  "Bride's family": "#b45309",
  "Groom's family": "#0369a1",
  "University friends": "#047857",
  "Work friends": "#6d28d9",
  "Groom's football club": "#c2410c",
  "Plus-ones": "#475569",
};

export function partyColor(party: string): string {
  return PARTY_COLORS[party] ?? "#475569";
}

export const rsvpLabel: Record<Rsvp, string> = {
  yes: "Attending",
  maybe: "Maybe",
  pending: "Awaiting reply",
  no: "Declined",
};

export const diets: string[] = Array.from(
  new Set(guests.map((g) => g.diet).filter((d): d is string => d !== null)),
);

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function formatEventDate(iso: string): string {
  const d = new Date(`${iso}T12:00:00Z`);
  return `${DAYS[d.getUTCDay()]} ${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}
```

```ts lib/plan.ts
import { fixtures, guestById, guests, rules, tableById, tables, type Table } from "./data";

export type SeatMap = Record<string, (string | null)[]>;
export type Location = { tableId: string; seat: number };

const HEAD_ORDER = [1, 2, 0, 3, 5, 6, 4, 7];

export function initialSeatMap(): SeatMap {
  const map: SeatMap = {};
  for (const t of tables) {
    const seats: (string | null)[] = Array.from({ length: t.seats }, () => null);
    const order = t.shape === "long" ? HEAD_ORDER : seats.map((_, i) => i);
    guests
      .filter((g) => g.table === t.id)
      .forEach((g, n) => {
        seats[order[n]] = g.id;
      });
    map[t.id] = seats;
  }
  return map;
}

export function locate(map: SeatMap): Record<string, Location> {
  const out: Record<string, Location> = {};
  for (const [tableId, seats] of Object.entries(map)) {
    seats.forEach((gid, seat) => {
      if (gid) out[gid] = { tableId, seat };
    });
  }
  return out;
}

function cloneMap(map: SeatMap): SeatMap {
  const next: SeatMap = {};
  for (const [k, v] of Object.entries(map)) next[k] = [...v];
  return next;
}

export interface SeatResult {
  map: SeatMap;
  ok: boolean;
  displaced?: string;
}

export function seatGuest(map: SeatMap, guestId: string, tableId: string, seat?: number): SeatResult {
  const target = map[tableId];
  if (!target) return { map, ok: false };
  const from = locate(map)[guestId];
  let idx = seat;
  if (idx === undefined) {
    if (from && from.tableId === tableId) return { map, ok: true };
    idx = target.indexOf(null);
    if (idx < 0) return { map, ok: false };
  }
  if (from && from.tableId === tableId && from.seat === idx) return { map, ok: true };
  const next = cloneMap(map);
  const occupant = next[tableId][idx];
  if (from) next[from.tableId][from.seat] = occupant;
  next[tableId][idx] = guestId;
  return { map: next, ok: true, displaced: !from && occupant ? occupant : undefined };
}

export function unseatGuest(map: SeatMap, guestId: string): SeatMap {
  const from = locate(map)[guestId];
  if (!from) return map;
  const next = cloneMap(map);
  next[from.tableId][from.seat] = null;
  return next;
}

export function initials(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function tableDiameter(t: Table): number {
  return t.seats > 6 ? 1.7 : 1.4;
}

export function longTableLength(t: Table): number {
  return (t.seats / 2) * 1.1 + 0.2;
}

export function filled(map: SeatMap, tableId: string): number {
  return (map[tableId] ?? []).filter(Boolean).length;
}

// ---- rules ----

export type RuleStatus = "ok" | "broken" | "waiting";

export interface RuleResult {
  id: string;
  kind: "together" | "apart" | "near";
  label: string;
  title: string;
  note: string;
  status: RuleStatus;
  detail: string;
  guestIds: string[];
  tableIds: string[];
  warning?: string;
}

const NEAR_DOOR_M = 4;
const FAR_BAND_M = 6;

function fixtureCentre(kind: string) {
  const f = fixtures.find((x) => x.kind === kind);
  return f ? { x: f.x + f.w / 2, y: f.y + f.h / 2 } : { x: 0, y: 0 };
}

function dist(t: Table, p: { x: number; y: number }): number {
  return Math.hypot(t.x - p.x, t.y - p.y);
}

function noteWarning(ruleGuests: string[], note: string): string | undefined {
  const missing: string[] = [];
  for (const g of guests) {
    if (ruleGuests.includes(g.id)) continue;
    const first = g.name.split(" ")[0];
    if (first.length > 2 && new RegExp(`\\b${first}\\b`).test(note)) missing.push(g.name);
  }
  if (missing.length === 0) return undefined;
  return `The note mentions ${missing.join(", ")}, who is not part of this rule. Check the rule with the couple.`;
}

export function evaluateRules(map: SeatMap): RuleResult[] {
  const loc = locate(map);
  const door = fixtureCentre("door");
  const band = fixtureCentre("stage");
  const where = (id: string) => {
    const l = loc[id];
    return l ? tableById[l.tableId].name : "not seated";
  };

  return rules.map((r, i) => {
    const names = r.guests.map((id) => guestById[id].name);
    const base = {
      id: `rule-${i}`,
      kind: r.kind,
      note: r.note,
      guestIds: r.guests,
      warning: noteWarning(r.guests, r.note),
    };

    if (r.kind === "near") {
      const id = r.guests[0];
      const l = loc[id];
      const label = "Seat near the garden doors";
      if (!l) {
        return { ...base, label, title: names[0], status: "waiting" as const, tableIds: [], detail: `${names[0]} is not seated yet.` };
      }
      const t = tableById[l.tableId];
      const dd = dist(t, door);
      const db = dist(t, band);
      const ok = dd <= NEAR_DOOR_M && db >= FAR_BAND_M;
      if (ok) {
        return {
          ...base, label, title: names[0], status: "ok" as const, tableIds: [t.id],
          detail: `${names[0]} is at ${t.name}, ${dd.toFixed(1)} m from the garden doors and ${db.toFixed(1)} m from the band.`,
        };
      }
      const best = tables
        .filter((x) => dist(x, door) <= NEAR_DOOR_M && dist(x, band) >= FAR_BAND_M)
        .sort((a, b) => dist(a, door) - dist(b, door))[0];
      const tail = best ? ` ${best.name} is ${dist(best, door).toFixed(1)} m from the doors.` : "";
      return {
        ...base, label, title: names[0], status: "broken" as const, tableIds: [t.id],
        detail: `${names[0]} is at ${t.name}, ${dd.toFixed(1)} m from the garden doors${db < FAR_BAND_M ? ` and only ${db.toFixed(1)} m from the band` : ""}.${tail}`,
      };
    }

    const [a, b] = r.guests;
    const la = loc[a];
    const lb = loc[b];
    const label = r.kind === "together" ? "Keep together" : "Keep apart";
    const title = `${names[0]} & ${names[1]}`;
    const tableIds = Array.from(new Set([la?.tableId, lb?.tableId].filter((x): x is string => !!x)));

    if (!la || !lb) {
      const detail =
        !la && !lb
          ? "Neither is seated yet."
          : `${names[la ? 0 : 1]} is at ${where(la ? a : b)}; ${names[la ? 1 : 0]} is not seated yet.`;
      return { ...base, label, title, status: "waiting" as const, tableIds: [], detail };
    }
    const same = la.tableId === lb.tableId;
    if (r.kind === "together") {
      return same
        ? { ...base, label, title, status: "ok" as const, tableIds, detail: `Both at ${where(a)}.` }
        : { ...base, label, title, status: "broken" as const, tableIds, detail: `${names[0]} is at ${where(a)} and ${names[1]} at ${where(b)}.` };
    }
    return same
      ? { ...base, label, title, status: "broken" as const, tableIds, detail: `Both are at ${where(a)}.` }
      : { ...base, label, title, status: "ok" as const, tableIds, detail: `${names[0]} at ${where(a)}, ${names[1]} at ${where(b)}.` };
  });
}
```

