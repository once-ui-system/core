"use client";

import Link from "next/link";
import { Printer, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Card, DietBadge, PartyDot, RsvpBadge } from "@/components/ui";
import { diets, event, formatDate, guests, parties, tableById, tables, type Rsvp } from "@/lib/data";
import { usePlan } from "@/lib/plan";

const selectClass =
  "min-h-11 w-full rounded-lg border border-stone-300 bg-white px-3 text-sm text-stone-800";

export default function GuestsPage() {
  const plan = usePlan();
  const [query, setQuery] = useState("");
  const [party, setParty] = useState("all");
  const [rsvp, setRsvp] = useState<"all" | Rsvp>("all");
  const [diet, setDiet] = useState("all");
  const [table, setTable] = useState("all");
  const [includeUnconfirmed, setIncludeUnconfirmed] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return guests.filter((gst) => {
      if (q && !gst.name.toLowerCase().includes(q)) return false;
      if (party !== "all" && gst.party !== party) return false;
      if (rsvp !== "all" && gst.rsvp !== rsvp) return false;
      if (diet === "none" ? gst.diet !== null : diet !== "all" && gst.diet !== diet) return false;
      const seat = plan.seats[gst.id];
      if (table === "unseated" ? seat !== null : table !== "all" && seat?.table !== table) return false;
      return true;
    });
  }, [query, party, rsvp, diet, table, plan.seats]);

  const meals = useMemo(() => {
    const m = new Map<string, number>();
    for (const gst of guests) {
      const counts = gst.rsvp === "yes" || (includeUnconfirmed && (gst.rsvp === "maybe" || gst.rsvp === "pending"));
      if (!counts) continue;
      const key = gst.diet ?? "Standard menu";
      m.set(key, (m.get(key) ?? 0) + 1);
    }
    const rows = Array.from(m, ([name, count]) => ({ name, count }));
    rows.sort((a, b) =>
      a.name === "Standard menu" ? -1 : b.name === "Standard menu" ? 1 : b.count - a.count || a.name.localeCompare(b.name),
    );
    const total = rows.reduce((n, r) => n + r.count, 0);
    const special = rows.filter((r) => r.name !== "Standard menu").reduce((n, r) => n + r.count, 0);
    return { rows, total, special };
  }, [includeUnconfirmed]);

  const reset = () => {
    setQuery("");
    setParty("all");
    setRsvp("all");
    setDiet("all");
    setTable("all");
  };
  const filtering = query !== "" || party !== "all" || rsvp !== "all" || diet !== "all" || table !== "all";

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-stone-900">Guest list</h1>
          <p className="text-sm text-stone-600">
            {event.name} · {formatDate(event.date)}
          </p>
        </div>
        <button
          type="button"
          onClick={() => window.print()}
          className="flex min-h-11 items-center gap-2 rounded-lg border border-stone-300 bg-white px-4 text-sm font-medium text-stone-800 hover:bg-stone-50 print:hidden"
        >
          <Printer className="size-4" aria-hidden /> Print for the caterer
        </button>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-4">
          <Card className="p-4 print:hidden">
            <form role="search" onSubmit={(e) => e.preventDefault()} className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
              <div className="relative sm:col-span-2 xl:col-span-5">
                <label htmlFor="q" className="sr-only">
                  Search guests by name
                </label>
                <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-stone-400" aria-hidden />
                <input
                  id="q"
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by name"
                  className="min-h-11 w-full rounded-lg border border-stone-300 bg-white pr-3 pl-9 text-sm text-stone-900 placeholder:text-stone-400"
                />
              </div>
              <label className="text-xs font-medium text-stone-600">
                Party
                <select className={`${selectClass} mt-1`} value={party} onChange={(e) => setParty(e.target.value)}>
                  <option value="all">All parties</option>
                  {parties.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-xs font-medium text-stone-600">
                RSVP
                <select
                  className={`${selectClass} mt-1`}
                  value={rsvp}
                  onChange={(e) => setRsvp(e.target.value as "all" | Rsvp)}
                >
                  <option value="all">Any reply</option>
                  <option value="yes">Attending</option>
                  <option value="maybe">Maybe</option>
                  <option value="pending">Awaiting reply</option>
                  <option value="no">Declined</option>
                </select>
              </label>
              <label className="text-xs font-medium text-stone-600">
                Diet
                <select className={`${selectClass} mt-1`} value={diet} onChange={(e) => setDiet(e.target.value)}>
                  <option value="all">Any diet</option>
                  <option value="none">No dietary needs</option>
                  {diets.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-xs font-medium text-stone-600">
                Table
                <select className={`${selectClass} mt-1`} value={table} onChange={(e) => setTable(e.target.value)}>
                  <option value="all">Any table</option>
                  <option value="unseated">Not seated</option>
                  {tables.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </label>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={reset}
                  disabled={!filtering}
                  className="min-h-11 w-full rounded-lg border border-stone-300 px-3 text-sm font-medium text-stone-700 enabled:hover:bg-stone-50 disabled:opacity-40"
                >
                  Clear filters
                </button>
              </div>
            </form>
          </Card>

          <Card>
            <p className="border-b border-stone-100 px-4 py-3 text-sm text-stone-600" role="status" aria-live="polite">
              Showing <strong className="text-stone-900">{filtered.length}</strong> of {guests.length} guests
            </p>
            {filtered.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-stone-500">No guests match these filters.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <caption className="sr-only">Guests with party, reply, dietary need and table</caption>
                  <thead className="bg-stone-50 text-xs font-semibold tracking-wide text-stone-500 uppercase">
                    <tr>
                      <th scope="col" className="px-4 py-2.5">Guest</th>
                      <th scope="col" className="hidden px-3 py-2.5 md:table-cell">Party</th>
                      <th scope="col" className="px-3 py-2.5">RSVP</th>
                      <th scope="col" className="px-3 py-2.5">Diet</th>
                      <th scope="col" className="px-4 py-2.5">Table</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {filtered.map((gst) => {
                      const seat = plan.seats[gst.id];
                      const tbl = seat ? tableById.get(seat.table) : undefined;
                      return (
                        <tr key={gst.id} className="align-top">
                          <th scope="row" className="px-4 py-3 font-medium text-stone-900">
                            {gst.name}
                            <span className="mt-0.5 flex items-center gap-1.5 text-xs font-normal text-stone-500 md:hidden">
                              <PartyDot party={gst.party} />
                              {gst.party}
                            </span>
                          </th>
                          <td className="hidden px-3 py-3 text-stone-600 md:table-cell">
                            <span className="flex items-center gap-2">
                              <PartyDot party={gst.party} />
                              {gst.party}
                            </span>
                          </td>
                          <td className="px-3 py-3">
                            <RsvpBadge rsvp={gst.rsvp} />
                          </td>
                          <td className="px-3 py-3">
                            {gst.diet ? <DietBadge diet={gst.diet} /> : <span className="text-stone-400">None</span>}
                          </td>
                          <td className="px-4 py-3">
                            {tbl && seat ? (
                              <Link
                                href="/"
                                onClick={() => plan.select(tbl.id)}
                                className="font-medium text-teal-800 underline-offset-2 hover:underline"
                              >
                                {tbl.name}
                                <span className="font-normal text-stone-500"> · seat {seat.seat + 1}</span>
                              </Link>
                            ) : gst.rsvp === "no" ? (
                              <span className="text-stone-400">Not coming</span>
                            ) : (
                              <span className="font-medium text-amber-700">Not seated</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        <aside aria-label="Meal counts" className="lg:sticky lg:top-4 lg:self-start">
          <Card title="Meals for the caterer">
            <div className="px-4 pt-3">
              <p className="text-4xl font-semibold tabular-nums text-stone-900">{meals.total}</p>
              <p className="text-sm text-stone-600">
                {includeUnconfirmed ? "meals if every maybe and pending guest comes" : "meals for confirmed guests"},{" "}
                {meals.special} with a dietary need
              </p>
            </div>
            <ul className="space-y-2.5 px-4 py-4">
              {meals.rows.map((r) => (
                <li key={r.name}>
                  <div className="flex items-baseline justify-between text-sm">
                    <span className="text-stone-800">{r.name}</span>
                    <span className="font-semibold tabular-nums text-stone-900">{r.count}</span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-stone-100" aria-hidden>
                    <div
                      className={`h-full rounded-full ${r.name === "Standard menu" ? "bg-stone-400" : "bg-amber-500"}`}
                      style={{ width: `${(r.count / meals.total) * 100}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
            <label className="flex min-h-11 items-center gap-3 border-t border-stone-100 px-4 py-3 text-sm text-stone-700 print:hidden">
              <input
                type="checkbox"
                checked={includeUnconfirmed}
                onChange={(e) => setIncludeUnconfirmed(e.target.checked)}
                className="size-4 accent-teal-700"
              />
              Include maybe and awaiting-reply guests
            </label>
          </Card>
        </aside>
      </div>
    </div>
  );
}
