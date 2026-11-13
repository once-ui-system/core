"use client";

import { MousePointerClick, UserMinus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Progress } from "@/components/ui/progress";
import { tables } from "@/lib/data";
import { usePlan } from "@/lib/plan-store";
import { PartyDot } from "./guest-chip";

export function TablePanel() {
  const { selectedTable, occupancy, guests, place, unseat, ruleResults } = usePlan();
  const table = tables.find((t) => t.id === selectedTable);

  if (!table) {
    return (
      <Card className="gap-2 py-4">
        <CardHeader className="px-4">
          <CardTitle className="font-display text-lg">Table details</CardTitle>
          <CardDescription>
            <MousePointerClick className="mr-1.5 inline size-4 align-text-bottom" aria-hidden />
            Select a table in the room to see who sits there and what they eat.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4">
          <ul className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
            {tables.map((t) => {
              const n = (occupancy[t.id] ?? []).filter(Boolean).length;
              return (
                <li key={t.id}>
                  <TableJump id={t.id} label={t.name} count={`${n}/${t.seats}`} />
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>
    );
  }

  const seats = occupancy[table.id] ?? [];
  const seated = seats.filter((g): g is NonNullable<typeof g> => g !== null);
  const free = table.seats - seated.length;
  const unseatedList = guests.filter((g) => !g.table && g.rsvp !== "no");
  const dietCounts = new Map<string, number>();
  for (const g of seated) if (g.diet) dietCounts.set(g.diet, (dietCounts.get(g.diet) ?? 0) + 1);
  const noDiet = seated.filter((g) => !g.diet).length;
  const tableRules = ruleResults.filter((r) => r.status === "broken" && r.tables.includes(table.id));

  return (
    <Card className="gap-3 py-4">
      <CardHeader className="px-4">
        <CardTitle className="font-display text-lg">{table.name}</CardTitle>
        <CardDescription>
          {seated.length} of {table.seats} seats filled · {free === 0 ? "full" : `${free} free`}
        </CardDescription>
        <Progress
          value={(seated.length / table.seats) * 100}
          aria-label={`${table.name} seats filled`}
          className="mt-1 h-1.5"
        />
      </CardHeader>
      <CardContent className="space-y-4 px-4">
        {tableRules.length > 0 && (
          <div role="alert" className="rounded-lg border border-destructive/40 bg-destructive/[0.06] p-3 text-sm">
            <p className="font-medium text-destructive">Broken here</p>
            <ul className="mt-1 space-y-1">
              {tableRules.map((r) => (
                <li key={r.rule.id}>{r.detail}</li>
              ))}
            </ul>
          </div>
        )}

        {seated.length === 0 ? (
          <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
            Nobody is seated here yet. Drag a guest onto the table, or pick one below.
          </p>
        ) : (
          <ul className="divide-y rounded-lg border">
            {seats.map((g, i) =>
              g ? (
                <li key={g.id} className="flex flex-wrap items-center gap-x-3 gap-y-2 p-2.5">
                  <span className="grid size-6 shrink-0 place-items-center rounded-full bg-secondary text-xs font-medium tabular-nums">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1 basis-32">
                    <div className="flex items-center gap-1.5 text-sm font-medium">
                      <PartyDot party={g.party} />
                      <span className="truncate">{g.name}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-1.5 text-xs text-muted-foreground">
                      <span>{g.party}</span>
                      {g.diet && (
                        <Badge variant="secondary" className="bg-warn text-warn-foreground">
                          {g.diet}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <NativeSelect
                      size="sm"
                      aria-label={`Move ${g.name} to another table`}
                      value=""
                      onChange={(e) => {
                        if (e.target.value) place(g.id, e.target.value);
                      }}
                    >
                      <NativeSelectOption value="">Move to…</NativeSelectOption>
                      {tables
                        .filter((t) => t.id !== table.id)
                        .map((t) => {
                          const n = (occupancy[t.id] ?? []).filter(Boolean).length;
                          return (
                            <NativeSelectOption key={t.id} value={t.id} disabled={n >= t.seats}>
                              {t.name} ({n}/{t.seats})
                            </NativeSelectOption>
                          );
                        })}
                    </NativeSelect>
                    <Button
                      variant="outline"
                      size="icon-sm"
                      aria-label={`Unseat ${g.name}`}
                      title="Unseat"
                      onClick={() => unseat(g.id)}
                    >
                      <UserMinus />
                    </Button>
                  </div>
                </li>
              ) : null,
            )}
          </ul>
        )}

        {seated.length > 0 && (
          <div>
            <h3 className="text-sm font-medium">Dietary needs</h3>
            {dietCounts.size === 0 ? (
              <p className="mt-1 text-sm text-muted-foreground">No dietary needs at this table.</p>
            ) : (
              <ul className="mt-1.5 flex flex-wrap gap-1.5">
                {[...dietCounts.entries()].map(([d, n]) => (
                  <li key={d}>
                    <Badge variant="secondary" className="bg-warn px-2.5 py-1 text-warn-foreground">
                      {d} × {n}
                    </Badge>
                  </li>
                ))}
                <li>
                  <Badge variant="outline" className="px-2.5 py-1">
                    Standard × {noDiet}
                  </Badge>
                </li>
              </ul>
            )}
          </div>
        )}

        {free > 0 && unseatedList.length > 0 && (
          <div>
            <label htmlFor="seat-here" className="text-sm font-medium">
              Seat a guest here
            </label>
            <NativeSelect
              id="seat-here"
              className="mt-1.5"
              value=""
              onChange={(e) => {
                if (e.target.value) place(e.target.value, table.id);
              }}
            >
              <NativeSelectOption value="">Choose an unseated guest…</NativeSelectOption>
              {unseatedList.map((g) => (
                <NativeSelectOption key={g.id} value={g.id}>
                  {g.name}
                  {g.rsvp !== "yes" ? " (not confirmed)" : ""}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function TableJump({ id, label, count }: { id: string; label: string; count: string }) {
  const { selectTable } = usePlan();
  return (
    <button
      type="button"
      onClick={() => selectTable(id)}
      className="flex min-h-9 w-full items-center justify-between rounded-md border px-2.5 text-left outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50"
    >
      <span>{label}</span>
      <span className="text-muted-foreground tabular-nums">{count}</span>
    </button>
  );
}
