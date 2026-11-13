"use client";

import { MoveRight, UserMinus } from "lucide-react";
import { guestById, tableById, tables } from "@/lib/data";
import { seatKey, usePlan } from "@/lib/plan";
import { Card, DietBadge, PartyDot } from "./ui";

export default function TablePanel() {
  const plan = usePlan();
  const table = plan.selectedTable ? tableById.get(plan.selectedTable) : undefined;

  const rows = table
    ? Array.from({ length: table.seats }, (_, i) => {
        const gid = plan.occupants.get(seatKey(table.id, i));
        return { seat: i, guest: gid ? guestById.get(gid) : undefined };
      })
    : [];
  const seated = rows.flatMap((r) => (r.guest ? [r.guest] : []));
  const dietCounts = new Map<string, number>();
  for (const gst of seated) if (gst.diet) dietCounts.set(gst.diet, (dietCounts.get(gst.diet) ?? 0) + 1);
  const brokenHere = table
    ? plan.results.filter((r) => r.status === "broken" && r.tables.includes(table.id))
    : [];

  return (
    <Card title={table ? table.name : "Tables"}>
      <div className="flex flex-wrap gap-1.5 p-3" role="group" aria-label="Choose a table">
        {tables.map((t) => {
          const active = t.id === plan.selectedTable;
          const bad = plan.brokenTables.has(t.id);
          return (
            <button
              key={t.id}
              type="button"
              aria-pressed={active}
              onClick={() => plan.select(active ? null : t.id)}
              className={`min-h-11 rounded-lg border px-3 text-xs font-medium ${
                active
                  ? "border-teal-700 bg-teal-700 text-white"
                  : bad
                    ? "border-rose-300 bg-rose-50 text-rose-800"
                    : "border-stone-200 bg-white text-stone-700 hover:bg-stone-50"
              }`}
            >
              {t.name} <span className="opacity-70">{plan.filled[t.id]}/{t.seats}</span>
            </button>
          );
        })}
      </div>

      {!table ? (
        <p className="border-t border-stone-100 px-4 py-4 text-sm text-stone-500">
          Select a table on the plan to see who is sitting there and what they eat.
        </p>
      ) : (
        <div className="border-t border-stone-100">
          <div className="px-4 pt-3 text-sm text-stone-600">
            <p>
              <strong className="text-stone-900">{seated.length}</strong> of {table.seats} seats filled
              {seated.length < table.seats ? `, ${table.seats - seated.length} empty` : ", table is full"}.
            </p>
            <p className="mt-1">
              {dietCounts.size === 0
                ? "No dietary needs at this table."
                : `Dietary needs: ${Array.from(dietCounts, ([d, n]) => `${n} ${d}`).join(", ")}.`}
            </p>
          </div>

          {brokenHere.length > 0 ? (
            <ul className="mx-4 mt-3 space-y-1 rounded-xl bg-rose-50 p-3 text-xs text-rose-900">
              {brokenHere.map((r) => (
                <li key={r.index}>
                  <strong>{r.title}.</strong> {r.detail}
                </li>
              ))}
            </ul>
          ) : null}

          <ol className="mt-2 divide-y divide-stone-100 px-1.5 pb-1.5">
            {rows.map(({ seat, guest }) => (
              <li key={seat} className="flex items-center gap-2 px-2.5 py-2">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-stone-100 text-xs font-medium text-stone-600">
                  {seat + 1}
                </span>
                {guest ? (
                  <>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1.5 text-sm font-medium text-stone-900">
                        <PartyDot party={guest.party} />
                        <span className="truncate">{guest.name}</span>
                      </span>
                      <span className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-stone-500">
                        {guest.party}
                        {guest.diet ? <DietBadge diet={guest.diet} /> : null}
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={() => plan.hold(plan.holding === guest.id ? null : guest.id)}
                      aria-pressed={plan.holding === guest.id}
                      aria-label={`Move ${guest.name}`}
                      className={`grid size-11 place-items-center rounded-lg border ${
                        plan.holding === guest.id
                          ? "border-teal-700 bg-teal-50 text-teal-800"
                          : "border-stone-200 text-stone-600 hover:bg-stone-50"
                      }`}
                    >
                      <MoveRight className="size-4" aria-hidden />
                    </button>
                    <button
                      type="button"
                      onClick={() => plan.unseat(guest.id)}
                      aria-label={`Unseat ${guest.name}`}
                      className="grid size-11 place-items-center rounded-lg border border-stone-200 text-stone-600 hover:bg-rose-50 hover:text-rose-700"
                    >
                      <UserMinus className="size-4" aria-hidden />
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    disabled={!plan.holding}
                    onClick={() => plan.holding && plan.place(plan.holding, table.id, seat)}
                    className="min-h-11 flex-1 rounded-lg border border-dashed border-stone-300 px-3 text-left text-xs text-stone-500 enabled:border-teal-500 enabled:bg-teal-50 enabled:text-teal-800"
                  >
                    Empty seat{plan.holding ? ": seat held guest here" : ""}
                  </button>
                )}
              </li>
            ))}
          </ol>
        </div>
      )}
    </Card>
  );
}
