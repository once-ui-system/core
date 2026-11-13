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
