"use client";

import { Table2, UserMinus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GUEST_BY_ID, TABLE_BY_ID } from "@/lib/data";
import { usePlan } from "@/components/plan-provider";
import { DietBadge, GuestAvatar } from "@/components/guest-bits";

export function TableDetail() {
  const plan = usePlan();
  const table = plan.selectedTable ? TABLE_BY_ID[plan.selectedTable] : null;

  if (!table) {
    return (
      <section aria-live="polite" className="flex items-center gap-3 rounded-xl border border-dashed bg-card/50 px-4 py-5 text-sm text-muted-foreground">
        <Table2 className="size-5 shrink-0" aria-hidden="true" />
        Select a table on the plan to see who sits there and what they can eat.
      </section>
    );
  }

  const guests = plan.seats[table.id].flatMap((id, seat) => (id ? [{ guest: GUEST_BY_ID[id], seat }] : []));
  const diets = new Map<string, number>();
  for (const { guest } of guests) if (guest.diet) diets.set(guest.diet, (diets.get(guest.diet) ?? 0) + 1);
  const issues = plan.brokenRules.filter((r) => r.tables.includes(table.id));
  const pickedGuest = plan.picked ? GUEST_BY_ID[plan.picked] : null;
  const pickedHere = pickedGuest ? plan.tableOf[pickedGuest.id] === table.id : false;

  return (
    <section aria-live="polite" aria-labelledby="detail-h" className="rounded-xl border bg-card">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b px-4 py-3">
        <h2 id="detail-h" className="text-base font-semibold">
          {table.name}
        </h2>
        <span className="text-sm tabular-nums text-muted-foreground">
          {guests.length} of {table.seats} seats filled · {table.seats - guests.length} open
        </span>
        <div className="ml-auto flex items-center gap-2">
          {pickedGuest && !pickedHere && (
            <Button size="sm" onClick={() => plan.activateTable(table.id)}>
              Seat {pickedGuest.name.split(" ")[0]} here
            </Button>
          )}
          <Button variant="ghost" size="icon-sm" aria-label="Close table details" onClick={() => plan.selectTable(null)}>
            <X />
          </Button>
        </div>
      </div>

      <div className="grid gap-4 p-4 md:grid-cols-[minmax(0,1fr)_minmax(0,15rem)]">
        <div>
          {guests.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nobody is seated here yet.</p>
          ) : (
            <ul className="grid gap-1.5 sm:grid-cols-2">
              {guests.map(({ guest, seat }) => (
                <li key={guest.id} className="flex min-h-12 items-center gap-2.5 rounded-lg border px-2 py-1.5">
                  <GuestAvatar guest={guest} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{guest.name}</span>
                    <span className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
                      Seat {seat + 1}
                      {guest.diet && <DietBadge diet={guest.diet} />}
                    </span>
                  </span>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Unseat ${guest.name}`}
                    title="Unseat"
                    onClick={() => plan.unseat(guest.id)}
                  >
                    <UserMinus />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="flex flex-col gap-3 text-sm">
          <div>
            <h3 className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">Dietary needs</h3>
            {diets.size === 0 ? (
              <p className="text-muted-foreground">None at this table.</p>
            ) : (
              <ul className="flex flex-col gap-1">
                {Array.from(diets).map(([d, n]) => (
                  <li key={d} className="flex items-center justify-between gap-2">
                    <DietBadge diet={d} />
                    <span className="tabular-nums">{n}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {issues.length > 0 && (
            <div>
              <h3 className="mb-1 text-xs font-medium uppercase tracking-wide text-destructive">Broken here</h3>
              <ul className="flex flex-col gap-1 text-xs text-destructive">
                {issues.map((r) => (
                  <li key={r.index}>{r.detail}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
