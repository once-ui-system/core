"use client";

import { useMemo, useState } from "react";
import { Printer, Search, X } from "lucide-react";
import { guests, type Rsvp } from "@/lib/data";
import { tableById } from "@/lib/plan";
import { usePlan } from "@/lib/plan-context";
import { initials, partyStyle, PARTY_ORDER, RSVP } from "@/lib/ui";

const field =
  "min-h-11 w-full rounded-xl border border-line bg-white px-3 text-sm outline-offset-2 focus-visible:border-brand-600";

const diets = Array.from(new Set(guests.map((g) => g.diet).filter((d): d is string => d !== null))).sort();

const meals = ["Standard", ...diets].map((name) => {
  const key = name === "Standard" ? null : name;
  return {
    name,
    filter: key === null ? "none" : key,
    confirmed: guests.filter((g) => g.diet === key && g.rsvp === "yes").length,
    awaiting: guests.filter((g) => g.diet === key && (g.rsvp === "maybe" || g.rsvp === "pending")).length,
  };
});

export function GuestsView() {
  const { tableOf } = usePlan();
  const [q, setQ] = useState("");
  const [party, setParty] = useState("all");
  const [rsvp, setRsvp] = useState<"all" | Rsvp>("all");
  const [diet, setDiet] = useState("all");

  const tableName = (id: string) => {
    const t = tableOf.get(id);
    return t ? tableById[t].name : null;
  };

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return guests.filter((g) => {
      if (party !== "all" && g.party !== party) return false;
      if (rsvp !== "all" && g.rsvp !== rsvp) return false;
      if (diet === "none" && g.diet !== null) return false;
      if (diet !== "all" && diet !== "none" && g.diet !== diet) return false;
      if (!needle) return true;
      const t = tableOf.get(g.id);
      const hay = `${g.name} ${g.party} ${g.diet ?? ""} ${t ? tableById[t].name : "unseated"}`.toLowerCase();
      return hay.includes(needle);
    });
  }, [q, party, rsvp, diet, tableOf]);

  const filtersOn = q !== "" || party !== "all" || rsvp !== "all" || diet !== "all";
  const totalConfirmed = meals.reduce((n, m) => n + m.confirmed, 0);
  const totalAwaiting = meals.reduce((n, m) => n + m.awaiting, 0);
  const declined = guests.filter((g) => g.rsvp === "no").length;

  const rsvpBadge = (r: Rsvp) => (
    <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${RSVP[r].cls}`}>
      {RSVP[r].label}
    </span>
  );

  const seatCell = (id: string, r: Rsvp) => {
    const name = tableName(id);
    if (name) return <span className="font-medium">{name}</span>;
    if (r === "no") return <span className="text-muted">Not coming</span>;
    return <span className="text-amber-800">Unseated</span>;
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">Guest list</h1>
          <p className="text-sm text-muted">
            {guests.length} invited · {totalConfirmed} attending · {totalAwaiting} not confirmed · {declined} declined
          </p>
        </div>
        <button
          type="button"
          onClick={() => window.print()}
          className="flex min-h-11 items-center gap-2 rounded-xl border border-line bg-card px-3.5 text-sm font-medium hover:border-brand-500 print:hidden"
        >
          <Printer className="h-4 w-4" aria-hidden /> Print for the caterer
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <section aria-label="Guests" className="min-w-0">
          <form
            role="search"
            onSubmit={(e) => e.preventDefault()}
            className="mb-3 grid gap-3 rounded-2xl border border-line bg-card p-3 shadow-sm sm:grid-cols-2 xl:grid-cols-[minmax(0,1.6fr)_repeat(3,minmax(0,1fr))] print:hidden"
          >
            <div className="relative sm:col-span-2 xl:col-span-1">
              <label htmlFor="q" className="sr-only">
                Search guests
              </label>
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden />
              <input
                id="q"
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search name, party, diet or table"
                className={`${field} pl-9`}
              />
            </div>
            <div>
              <label htmlFor="party" className="sr-only">
                Party
              </label>
              <select id="party" value={party} onChange={(e) => setParty(e.target.value)} className={field}>
                <option value="all">All parties</option>
                {PARTY_ORDER.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="rsvp" className="sr-only">
                RSVP
              </label>
              <select id="rsvp" value={rsvp} onChange={(e) => setRsvp(e.target.value as "all" | Rsvp)} className={field}>
                <option value="all">Any RSVP</option>
                <option value="yes">Attending</option>
                <option value="maybe">Maybe</option>
                <option value="pending">Awaiting reply</option>
                <option value="no">Declined</option>
              </select>
            </div>
            <div>
              <label htmlFor="diet" className="sr-only">
                Diet
              </label>
              <select id="diet" value={diet} onChange={(e) => setDiet(e.target.value)} className={field}>
                <option value="all">Any diet</option>
                <option value="none">No dietary needs</option>
                {diets.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </form>

          <div className="mb-2 flex items-center justify-between px-1 text-sm" role="status">
            <span className="text-muted">
              Showing {filtered.length} of {guests.length} guests
            </span>
            {filtersOn && (
              <button
                type="button"
                onClick={() => {
                  setQ("");
                  setParty("all");
                  setRsvp("all");
                  setDiet("all");
                }}
                className="flex min-h-9 items-center gap-1 rounded-lg px-2 font-medium text-brand-700 hover:bg-brand-50 print:hidden"
              >
                <X className="h-3.5 w-3.5" aria-hidden /> Clear filters
              </button>
            )}
          </div>

          {filtered.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-line bg-card px-4 py-10 text-center text-sm text-muted">
              No guest matches these filters.
            </p>
          ) : (
            <>
              <div className="hidden overflow-hidden rounded-2xl border border-line bg-card shadow-sm md:block">
                <table className="w-full text-left text-sm">
                  <caption className="sr-only">Guest list with party, RSVP, diet and table</caption>
                  <thead className="bg-stone-100 text-xs uppercase tracking-wide text-muted">
                    <tr>
                      <th scope="col" className="px-4 py-2.5 font-medium">Guest</th>
                      <th scope="col" className="px-4 py-2.5 font-medium">Party</th>
                      <th scope="col" className="px-4 py-2.5 font-medium">RSVP</th>
                      <th scope="col" className="px-4 py-2.5 font-medium">Diet</th>
                      <th scope="col" className="px-4 py-2.5 font-medium">Table</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {filtered.map((g) => (
                      <tr key={g.id} className="hover:bg-brand-50/50">
                        <th scope="row" className="px-4 py-2.5 font-medium">
                          <span className="flex items-center gap-2.5">
                            <span
                              aria-hidden
                              className="grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 text-xs font-semibold"
                              style={partyStyle(g.party)}
                            >
                              {initials(g.name)}
                            </span>
                            {g.name}
                          </span>
                        </th>
                        <td className="px-4 py-2.5 text-ink/80">{g.party}</td>
                        <td className="px-4 py-2.5">{rsvpBadge(g.rsvp)}</td>
                        <td className="px-4 py-2.5">
                          {g.diet ? (
                            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-900">{g.diet}</span>
                          ) : (
                            <span className="text-muted">None</span>
                          )}
                        </td>
                        <td className="px-4 py-2.5">{seatCell(g.id, g.rsvp)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <ul className="grid gap-2 md:hidden">
                {filtered.map((g) => (
                  <li key={g.id} className="rounded-2xl border border-line bg-card p-3 shadow-sm">
                    <div className="flex items-start gap-3">
                      <span
                        aria-hidden
                        className="grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 text-xs font-semibold"
                        style={partyStyle(g.party)}
                      >
                        {initials(g.name)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium leading-snug">{g.name}</p>
                        <p className="text-xs text-muted">{g.party}</p>
                      </div>
                      {rsvpBadge(g.rsvp)}
                    </div>
                    <dl className="mt-2 grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <dt className="text-xs text-muted">Diet</dt>
                        <dd>{g.diet ?? "None"}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-muted">Table</dt>
                        <dd>{seatCell(g.id, g.rsvp)}</dd>
                      </div>
                    </dl>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>

        <aside aria-labelledby="meals-h" className="h-fit rounded-2xl border border-line bg-card p-4 shadow-sm lg:sticky lg:top-24">
          <h2 id="meals-h" className="font-display text-lg font-semibold">
            Meals for the caterer
          </h2>
          <p className="mt-0.5 text-xs text-muted">
            Count per meal. Confirmed means attending; awaiting means maybe or no reply yet. Declined guests are left out.
          </p>
          <table className="mt-3 w-full text-sm">
            <caption className="sr-only">Meal counts by dietary need</caption>
            <thead className="text-xs text-muted">
              <tr>
                <th scope="col" className="pb-1.5 text-left font-medium">Meal</th>
                <th scope="col" className="pb-1.5 text-right font-medium">Confirmed</th>
                <th scope="col" className="pb-1.5 text-right font-medium">Awaiting</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {meals.map((m) => {
                const active = diet === m.filter;
                return (
                  <tr key={m.name} className={active ? "bg-brand-50" : undefined}>
                    <th scope="row" className="py-0 text-left font-normal">
                      <button
                        type="button"
                        aria-pressed={active}
                        onClick={() => setDiet(active ? "all" : m.filter)}
                        className="min-h-10 w-full rounded-lg px-1.5 text-left hover:bg-brand-50 print:min-h-0"
                      >
                        {m.name}
                      </button>
                    </th>
                    <td className="py-2 text-right font-semibold tabular-nums">{m.confirmed}</td>
                    <td className="py-2 text-right tabular-nums text-muted">{m.awaiting}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="border-t-2 border-ink/20">
              <tr>
                <th scope="row" className="py-2 text-left font-semibold">Total</th>
                <td className="py-2 text-right font-semibold tabular-nums">{totalConfirmed}</td>
                <td className="py-2 text-right font-semibold tabular-nums text-muted">{totalAwaiting}</td>
              </tr>
            </tfoot>
          </table>
          <p className="mt-3 text-xs text-muted print:hidden">Select a meal to filter the guest list.</p>
        </aside>
      </div>
    </div>
  );
}
