"use client";

import { useMemo, useState } from "react";
import { Printer, Search } from "lucide-react";

import { DIETS, DIET_NOTES, GUESTS, PARTIES, RSVP_LABEL, type Rsvp } from "@/lib/data";
import { TABLE_BY_ID } from "@/lib/plan";
import { DietBadge, PartyDot, RsvpBadge, SeatSelect } from "./GuestBits";
import { usePlan } from "./PlanProvider";

const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const field =
  "min-h-11 w-full rounded-lg border border-stone-300 bg-white px-3 text-sm text-stone-900 shadow-sm";

function Filter({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-stone-500">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className={field}>
        {children}
      </select>
    </label>
  );
}

export default function GuestList() {
  const plan = usePlan();
  const [q, setQ] = useState("");
  const [party, setParty] = useState("all");
  const [rsvp, setRsvp] = useState("all");
  const [diet, setDiet] = useState("all");
  const [seat, setSeat] = useState("all");

  const tableName = (id: string) => TABLE_BY_ID.get(id)?.name ?? id;

  const filtered = useMemo(() => {
    const needle = norm(q.trim());
    return GUESTS.filter((g) => {
      if (party !== "all" && g.party !== party) return false;
      if (rsvp !== "all" && g.rsvp !== rsvp) return false;
      if (diet === "none" && g.diet) return false;
      if (diet === "any" && !g.diet) return false;
      if (diet !== "all" && diet !== "none" && diet !== "any" && g.diet !== diet) return false;
      const loc = plan.locations.get(g.id);
      if (seat === "seated" && !loc) return false;
      if (seat === "unseated" && loc) return false;
      if (needle) {
        const hay = norm([g.name, g.party, g.diet ?? "", loc ? tableName(loc.tableId) : "not seated"].join(" "));
        if (!hay.includes(needle)) return false;
      }
      return true;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, party, rsvp, diet, seat, plan.locations]);

  const filtersActive = q !== "" || party !== "all" || rsvp !== "all" || diet !== "all" || seat !== "all";
  const reset = () => {
    setQ("");
    setParty("all");
    setRsvp("all");
    setDiet("all");
    setSeat("all");
  };

  const rsvpCount = (r: Rsvp) => GUESTS.filter((g) => g.rsvp === r).length;

  const meals = useMemo(() => {
    const names = ["Standard menu", ...DIETS];
    return names.map((meal) => {
      const dietKey = meal === "Standard menu" ? null : meal;
      const match = GUESTS.filter((g) => g.diet === dietKey);
      const confirmed = match.filter((g) => g.rsvp === "yes");
      const possible = match.filter((g) => g.rsvp === "maybe" || g.rsvp === "pending");
      const tables = new Map<string, number>();
      for (const g of confirmed) {
        const loc = plan.locations.get(g.id);
        const label = loc ? tableName(loc.tableId) : "Not seated";
        tables.set(label, (tables.get(label) ?? 0) + 1);
      }
      return { meal, confirmed: confirmed.length, possible: possible.length, tables: Array.from(tables.entries()) };
    });
  }, [plan.locations]);

  const totalConfirmed = meals.reduce((a, m) => a + m.confirmed, 0);
  const totalPossible = meals.reduce((a, m) => a + m.possible, 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-stone-900">Guest list</h1>
          <p className="text-sm text-stone-600">{GUESTS.length} invited. Change a guest's table here or on the plan; both stay in step.</p>
        </div>
        <ul className="flex flex-wrap gap-2 text-xs" aria-label="Replies">
          {(["yes", "maybe", "pending", "no"] as Rsvp[]).map((r) => (
            <li key={r} className="flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-2.5 py-1">
              <RsvpBadge rsvp={r} />
              <span className="font-semibold tabular-nums text-stone-900">{rsvpCount(r)}</span>
            </li>
          ))}
          <li className="flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-2.5 py-1">
            <span className="text-stone-600">Seated</span>
            <span className="font-semibold tabular-nums text-stone-900">{plan.counts.seatedTotal}</span>
          </li>
        </ul>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_26rem]">
        <section aria-labelledby="guests-title" className="min-w-0 rounded-xl border border-stone-200 bg-white shadow-sm print:hidden">
          <h2 id="guests-title" className="sr-only">
            Guests
          </h2>
          <div className="space-y-3 border-b border-stone-200 p-4">
            <label className="relative block">
              <span className="sr-only">Search guests</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-stone-400" aria-hidden="true" />
              <input
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search by name, party, diet or table"
                className={`${field} pl-9`}
              />
            </label>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <Filter label="Party" value={party} onChange={setParty}>
                <option value="all">All parties</option>
                {PARTIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </Filter>
              <Filter label="Reply" value={rsvp} onChange={setRsvp}>
                <option value="all">Any reply</option>
                {(Object.keys(RSVP_LABEL) as Rsvp[]).map((r) => (
                  <option key={r} value={r}>
                    {RSVP_LABEL[r]}
                  </option>
                ))}
              </Filter>
              <Filter label="Diet" value={diet} onChange={setDiet}>
                <option value="all">Any diet</option>
                <option value="any">Has a dietary need</option>
                <option value="none">No dietary need</option>
                {DIETS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </Filter>
              <Filter label="Seat" value={seat} onChange={setSeat}>
                <option value="all">Seated or not</option>
                <option value="seated">Seated</option>
                <option value="unseated">Not seated</option>
              </Filter>
            </div>
            <div className="flex items-center justify-between gap-2 text-sm text-stone-600">
              <p role="status" aria-live="polite">
                Showing <strong className="tabular-nums text-stone-900">{filtered.length}</strong> of {GUESTS.length} guests
              </p>
              {filtersActive && (
                <button type="button" onClick={reset} className="min-h-10 rounded-lg px-3 font-medium text-sky-800 hover:bg-sky-50">
                  Clear filters
                </button>
              )}
            </div>
          </div>

          {filtered.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-stone-600">No guests match these filters.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <caption className="sr-only">Guest list with party, reply, diet and table</caption>
                <thead className="bg-stone-50 text-xs font-semibold uppercase tracking-wide text-stone-500">
                  <tr>
                    <th scope="col" className="px-4 py-2.5">
                      Guest
                    </th>
                    <th scope="col" className="hidden px-3 py-2.5 md:table-cell">
                      Party
                    </th>
                    <th scope="col" className="px-3 py-2.5">
                      Reply
                    </th>
                    <th scope="col" className="hidden px-3 py-2.5 md:table-cell">
                      Diet
                    </th>
                    <th scope="col" className="px-3 py-2.5 pr-4">
                      Table
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filtered.map((g) => (
                    <tr key={g.id} className="align-middle hover:bg-stone-50">
                      <th scope="row" className="px-4 py-2 font-medium text-stone-900">
                        <span className="flex items-center gap-2">
                          <PartyDot party={g.party} />
                          {g.name}
                        </span>
                        <span className="mt-1 flex flex-wrap items-center gap-1.5 text-xs font-normal text-stone-500 md:hidden">
                          {g.party}
                          {g.diet && <DietBadge diet={g.diet} />}
                        </span>
                      </th>
                      <td className="hidden px-3 py-2 text-stone-700 md:table-cell">{g.party}</td>
                      <td className="px-3 py-2">
                        <RsvpBadge rsvp={g.rsvp} />
                      </td>
                      <td className="hidden px-3 py-2 md:table-cell">
                        {g.diet ? <DietBadge diet={g.diet} /> : <span className="text-stone-400">None</span>}
                      </td>
                      <td className="px-3 py-2 pr-4">
                        <SeatSelect guestId={g.id} className="w-36" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section aria-labelledby="meals-title" className="min-w-0 self-start rounded-xl border border-stone-200 bg-white shadow-sm">
          <div className="flex items-start justify-between gap-2 border-b border-stone-200 px-4 py-3">
            <div>
              <h2 id="meals-title" className="text-base font-semibold text-stone-900">
                Meals for the caterer
              </h2>
              <p className="text-sm text-stone-600">
                <strong className="tabular-nums text-stone-900">{totalConfirmed}</strong> confirmed
                {totalPossible > 0 && <span> · up to {totalConfirmed + totalPossible} if every maybe says yes</span>}
              </p>
            </div>
            <button
              type="button"
              onClick={() => window.print()}
              className="flex min-h-10 items-center gap-1.5 rounded-lg border border-stone-300 px-3 text-sm font-medium text-stone-800 hover:bg-stone-50 print:hidden"
            >
              <Printer className="size-4" aria-hidden="true" />
              Print
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <caption className="sr-only">Meal counts, with the tables each confirmed meal goes to</caption>
              <thead className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                <tr>
                  <th scope="col" className="px-4 py-2">
                    Meal
                  </th>
                  <th scope="col" className="px-2 py-2 text-right">
                    Yes
                  </th>
                  <th scope="col" className="px-2 py-2 text-right">
                    Maybe
                  </th>
                  <th scope="col" className="px-4 py-2">
                    Where
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {meals.map((m) => (
                  <tr key={m.meal} className="align-top">
                    <th scope="row" className="px-4 py-2 font-medium text-stone-900">
                      {m.meal}
                      {DIET_NOTES[m.meal] && <span className="block text-xs font-normal text-stone-500">{DIET_NOTES[m.meal]}</span>}
                    </th>
                    <td className="px-2 py-2 text-right text-base font-semibold tabular-nums text-stone-900">{m.confirmed}</td>
                    <td className="px-2 py-2 text-right tabular-nums text-stone-500">{m.possible}</td>
                    <td className="px-4 py-2 text-xs text-stone-600">
                      {m.tables.length === 0
                        ? "–"
                        : m.tables.map(([name, n]) => `${name} ×${n}`).join(", ")}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-stone-300 font-semibold text-stone-900">
                  <th scope="row" className="px-4 py-2.5">
                    Total
                  </th>
                  <td className="px-2 py-2.5 text-right tabular-nums">{totalConfirmed}</td>
                  <td className="px-2 py-2.5 text-right tabular-nums text-stone-500">{totalPossible}</td>
                  <td className="px-4 py-2.5 text-xs font-normal text-stone-500">{rsvpCount("no")} declined, not counted</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
