"use client";

import { useMemo, useState } from "react";
import { Copy, Search, X } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { DIETS, EVENT, GUESTS, MEAL_STANDARD, PARTIES, TABLES, TABLE_BY_ID, type Guest } from "@/lib/data";
import { usePlan } from "@/components/plan-provider";
import { DietBadge, RsvpBadge } from "@/components/guest-bits";

const NONE = "__none";
const mealOf = (g: Guest) => g.diet ?? MEAL_STANDARD;

export default function GuestsPage() {
  const plan = usePlan();
  const [q, setQ] = useState("");
  const [party, setParty] = useState("all");
  const [rsvp, setRsvp] = useState("all");
  const [diet, setDiet] = useState("all");
  const [seating, setSeating] = useState("all");

  const tableName = (g: Guest) => {
    const t = plan.tableOf[g.id];
    return t ? TABLE_BY_ID[t].name : null;
  };

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return GUESTS.filter((g) => {
      const t = plan.tableOf[g.id];
      if (party !== "all" && g.party !== party) return false;
      if (rsvp !== "all" && g.rsvp !== rsvp) return false;
      if (diet === NONE && g.diet) return false;
      if (diet !== "all" && diet !== NONE && g.diet !== diet) return false;
      if (seating === "seated" && !t) return false;
      if (seating === "unseated" && t) return false;
      if (needle) {
        const hay = `${g.name} ${g.party} ${g.diet ?? ""} ${t ? TABLE_BY_ID[t].name : "unseated"}`.toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      return true;
    });
  }, [q, party, rsvp, diet, seating, plan.tableOf]);

  const filtersOn = q !== "" || party !== "all" || rsvp !== "all" || diet !== "all" || seating !== "all";
  const clear = () => {
    setQ("");
    setParty("all");
    setRsvp("all");
    setDiet("all");
    setSeating("all");
  };

  const counts = useMemo(() => {
    const meals = [MEAL_STANDARD, ...DIETS];
    return meals.map((m) => ({
      meal: m,
      yes: GUESTS.filter((g) => g.rsvp === "yes" && mealOf(g) === m).length,
      awaiting: GUESTS.filter((g) => (g.rsvp === "maybe" || g.rsvp === "pending") && mealOf(g) === m).length,
    }));
  }, []);
  const totalYes = counts.reduce((n, c) => n + c.yes, 0);
  const totalAwaiting = counts.reduce((n, c) => n + c.awaiting, 0);

  const byTable = TABLES.map((t) => {
    const here = plan.seats[t.id].flatMap((id) => (id ? [GUESTS.find((g) => g.id === id) as Guest] : []));
    const yes = here.filter((g) => g.rsvp === "yes");
    const tally = new Map<string, number>();
    for (const g of yes) tally.set(mealOf(g), (tally.get(mealOf(g)) ?? 0) + 1);
    return { table: t, total: yes.length, unconfirmed: here.length - yes.length, tally };
  });

  const invited = GUESTS.length;
  const declined = GUESTS.filter((g) => g.rsvp === "no").length;

  const copy = async () => {
    const lines = [
      `${EVENT.name}, ${EVENT.venue}`,
      `Meal counts (attending guests): ${totalYes}`,
      ...counts.filter((c) => c.yes > 0).map((c) => `${c.meal}: ${c.yes}`),
      "",
      "By table:",
      ...byTable
        .filter((b) => b.total > 0)
        .map((b) => `${b.table.name}: ${Array.from(b.tally, ([m, n]) => `${m} ${n}`).join(", ")}`),
    ];
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      toast.success("Meal counts copied for the caterer");
    } catch {
      toast.error("Could not copy. Select the counts and copy them by hand.");
    }
  };

  return (
    <main id="main" className="mx-auto max-w-[1500px] px-4 pb-10 pt-5 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-1">
        <div>
          <p className="text-sm text-muted-foreground">{EVENT.name}</p>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Guest list</h1>
        </div>
        <p className="text-sm tabular-nums text-muted-foreground">
          {invited} invited · {plan.attendingCount} attending · {totalAwaiting} awaiting reply · {declined} declined
        </p>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <section aria-label="Guests" className="min-w-0">
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-[minmax(0,1.6fr)_repeat(4,minmax(0,1fr))]">
            <div className="relative sm:col-span-2 xl:col-span-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <Input
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search name, party, table"
                aria-label="Search guests"
                className="h-10 bg-card pl-9"
              />
            </div>
            <Select value={party} onValueChange={setParty}>
              <SelectTrigger aria-label="Filter by party" className="h-10 w-full bg-card">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All parties</SelectItem>
                {PARTIES.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={rsvp} onValueChange={setRsvp}>
              <SelectTrigger aria-label="Filter by RSVP" className="h-10 w-full bg-card">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any RSVP</SelectItem>
                <SelectItem value="yes">Attending</SelectItem>
                <SelectItem value="maybe">Maybe</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="no">Declined</SelectItem>
              </SelectContent>
            </Select>
            <Select value={diet} onValueChange={setDiet}>
              <SelectTrigger aria-label="Filter by diet" className="h-10 w-full bg-card">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any meal</SelectItem>
                <SelectItem value={NONE}>{MEAL_STANDARD}</SelectItem>
                {DIETS.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={seating} onValueChange={setSeating}>
              <SelectTrigger aria-label="Filter by seating" className="h-10 w-full bg-card">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Seated or not</SelectItem>
                <SelectItem value="seated">Seated</SelectItem>
                <SelectItem value="unseated">Unseated</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="my-2 flex min-h-8 items-center justify-between text-sm text-muted-foreground">
            <p aria-live="polite" className="tabular-nums">
              Showing {filtered.length} of {invited} guests
            </p>
            {filtersOn && (
              <Button variant="ghost" size="sm" onClick={clear}>
                <X /> Clear filters
              </Button>
            )}
          </div>

          <div className="rounded-xl border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-4">Guest</TableHead>
                  <TableHead className="hidden md:table-cell">Party</TableHead>
                  <TableHead>RSVP</TableHead>
                  <TableHead>Meal</TableHead>
                  <TableHead className="pr-4">Table</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((g) => {
                  const tn = tableName(g);
                  return (
                    <TableRow key={g.id}>
                      <TableCell className="py-2.5 pl-4">
                        <span className="block font-medium">{g.name}</span>
                        <span className="block text-xs text-muted-foreground md:hidden">{g.party}</span>
                      </TableCell>
                      <TableCell className="hidden text-muted-foreground md:table-cell">{g.party}</TableCell>
                      <TableCell>
                        <RsvpBadge rsvp={g.rsvp} />
                      </TableCell>
                      <TableCell>
                        {g.diet ? <DietBadge diet={g.diet} /> : <span className="text-muted-foreground">{MEAL_STANDARD}</span>}
                      </TableCell>
                      <TableCell className="pr-4">
                        {tn ? (
                          <span className="font-medium">{tn}</span>
                        ) : g.rsvp === "no" ? (
                          <span className="text-muted-foreground">Not needed</span>
                        ) : (
                          <Badge variant="outline" className="border-amber-200 bg-amber-50 font-normal text-amber-900">
                            Unseated
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                      No guests match these filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </section>

        <aside aria-label="Catering" className="flex min-w-0 flex-col gap-4 lg:sticky lg:top-20 lg:self-start">
          <section aria-labelledby="meals-h" className="rounded-xl border bg-card">
            <div className="flex items-center gap-2 border-b px-4 py-3">
              <h2 id="meals-h" className="text-sm font-semibold">
                Meals for the caterer
              </h2>
              <Button variant="outline" size="sm" className="ml-auto" onClick={copy}>
                <Copy /> Copy
              </Button>
            </div>
            <table className="w-full text-sm">
              <caption className="sr-only">Meal counts from attending guests, with guests still to reply</caption>
              <thead>
                <tr className="text-left text-xs text-muted-foreground">
                  <th scope="col" className="px-4 py-2 font-medium">Meal</th>
                  <th scope="col" className="px-2 py-2 text-right font-medium">Attending</th>
                  <th scope="col" className="px-4 py-2 text-right font-medium">To reply</th>
                </tr>
              </thead>
              <tbody>
                {counts.map((c) => {
                  const value = c.meal === MEAL_STANDARD ? NONE : c.meal;
                  const active = diet === value;
                  return (
                    <tr key={c.meal} className="border-t">
                      <th scope="row" className="p-0 text-left font-normal">
                        <button
                          type="button"
                          aria-pressed={active}
                          onClick={() => setDiet(active ? "all" : value)}
                          className={cn(
                            "flex min-h-10 w-full items-center px-4 text-left outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50",
                            active && "bg-primary/10 font-medium",
                          )}
                        >
                          {c.meal}
                        </button>
                      </th>
                      <td className="px-2 text-right font-semibold tabular-nums">{c.yes}</td>
                      <td className="px-4 text-right tabular-nums text-muted-foreground">{c.awaiting || "–"}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t font-semibold">
                  <th scope="row" className="px-4 py-2.5 text-left">Total</th>
                  <td className="px-2 text-right tabular-nums">{totalYes}</td>
                  <td className="px-4 text-right tabular-nums text-muted-foreground">{totalAwaiting}</td>
                </tr>
              </tfoot>
            </table>
            <p className="border-t px-4 py-2 text-xs text-muted-foreground">
              Tap a meal to filter the list. Declined guests are not counted.
            </p>
          </section>

          <section aria-labelledby="bytable-h" className="rounded-xl border bg-card">
            <div className="border-b px-4 py-3">
              <h2 id="bytable-h" className="text-sm font-semibold">
                Meals by table
              </h2>
            </div>
            <ul className="divide-y text-sm">
              {byTable.map((b) => (
                <li key={b.table.id} className="px-4 py-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium">{b.table.name}</span>
                    <span className="text-xs tabular-nums text-muted-foreground">
                      {b.total} attending{b.unconfirmed ? ` · +${b.unconfirmed} to reply` : ""}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {b.total === 0
                      ? "No attending guests seated"
                      : Array.from(b.tally, ([m, n]) => `${m} ${n}`).join(" · ")}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </main>
  );
}
