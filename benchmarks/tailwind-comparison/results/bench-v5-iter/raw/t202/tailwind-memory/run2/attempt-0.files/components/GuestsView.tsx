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
