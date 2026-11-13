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
