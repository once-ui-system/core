"use client";

import * as React from "react";
import { Copy, Search, X } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  EVENT,
  GUESTS,
  PARTIES,
  RSVP_LABEL,
  STANDARD_MENU,
  formatEventDate,
  partyDot,
  type Guest,
  type Rsvp,
} from "@/lib/data";
import { TABLES_BY_ID } from "@/lib/plan";
import { cn } from "@/lib/utils";
import { usePlan } from "@/components/plan-provider";

const DIETS: string[] = Array.from(
  new Set(GUESTS.map((g) => g.diet).filter((d): d is string => Boolean(d))),
).sort();

const RSVP_STYLE: Record<Rsvp, string> = {
  yes: "border-emerald-300 bg-emerald-50 text-emerald-900",
  maybe: "border-amber-300 bg-amber-50 text-amber-900",
  pending: "border-stone-300 bg-stone-100 text-stone-700",
  no: "border-red-300 bg-red-50 text-red-900",
};

interface MealRow {
  meal: string;
  filter: string;
  confirmed: number;
  awaiting: number;
}

function buildMeals(): MealRow[] {
  const rows: MealRow[] = [{ meal: STANDARD_MENU, filter: "none", confirmed: 0, awaiting: 0 }];
  for (const d of DIETS) rows.push({ meal: d, filter: d, confirmed: 0, awaiting: 0 });
  for (const g of GUESTS) {
    const row = rows.find((r) => r.meal === (g.diet ?? STANDARD_MENU));
    if (!row) continue;
    if (g.rsvp === "yes") row.confirmed += 1;
    else if (g.rsvp === "maybe" || g.rsvp === "pending") row.awaiting += 1;
  }
  return rows;
}

const MEALS = buildMeals();

export function GuestsView() {
  const { tableOf } = usePlan();
  const [query, setQuery] = React.useState("");
  const [party, setParty] = React.useState("all");
  const [rsvp, setRsvp] = React.useState("all");
  const [diet, setDiet] = React.useState("all");

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return GUESTS.filter((g: Guest) => {
      if (party !== "all" && g.party !== party) return false;
      if (rsvp !== "all" && g.rsvp !== rsvp) return false;
      if (diet === "any" && !g.diet) return false;
      if (diet === "none" && g.diet) return false;
      if (diet !== "all" && diet !== "any" && diet !== "none" && g.diet !== diet) return false;
      if (q) {
        const t = tableOf[g.id];
        const hay = `${g.name} ${g.party} ${g.diet ?? ""} ${t ? (TABLES_BY_ID[t]?.name ?? "") : ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [query, party, rsvp, diet, tableOf]);

  const filtersOn = query !== "" || party !== "all" || rsvp !== "all" || diet !== "all";
  const clear = () => {
    setQuery("");
    setParty("all");
    setRsvp("all");
    setDiet("all");
  };

  const counts = {
    yes: GUESTS.filter((g) => g.rsvp === "yes").length,
    maybe: GUESTS.filter((g) => g.rsvp === "maybe").length,
    pending: GUESTS.filter((g) => g.rsvp === "pending").length,
    no: GUESTS.filter((g) => g.rsvp === "no").length,
  };
  const totalConfirmed = MEALS.reduce((n, m) => n + m.confirmed, 0);
  const totalAwaiting = MEALS.reduce((n, m) => n + m.awaiting, 0);

  const copyMeals = async () => {
    const lines = [
      `Meal counts: ${EVENT.name}, ${formatEventDate(EVENT.date)}, ${EVENT.venue}`,
      `Confirmed guests: ${totalConfirmed}`,
      ...MEALS.filter((m) => m.confirmed > 0 || m.awaiting > 0).map(
        (m) => `${m.meal}: ${m.confirmed}${m.awaiting ? ` (+${m.awaiting} awaiting reply)` : ""}`,
      ),
    ];
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      toast.success("Meal counts copied", { description: "Ready to paste into an email to the caterer." });
    } catch {
      toast.error("Could not copy", { description: "Your browser blocked clipboard access." });
    }
  };

  return (
    <main id="main" className="mx-auto w-full max-w-[1600px] space-y-5 px-4 py-5 sm:px-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Guest list</h1>
        <p className="text-sm text-muted-foreground">
          {GUESTS.length} guests · {counts.yes} attending · {counts.maybe} maybe · {counts.pending} awaiting reply ·{" "}
          {counts.no} declined
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
        <section aria-label="Guests" className="min-w-0 space-y-3">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-[minmax(0,1fr)_repeat(3,minmax(0,11rem))]">
            <div className="relative col-span-2 sm:col-span-1">
              <Search
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search name, party, diet or table"
                aria-label="Search guests"
                className="pl-9"
              />
            </div>
            <Select value={party} onValueChange={setParty}>
              <SelectTrigger aria-label="Filter by party" className="w-full">
                <SelectValue placeholder="Party" />
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
              <SelectTrigger aria-label="Filter by RSVP" className="w-full">
                <SelectValue placeholder="RSVP" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any RSVP</SelectItem>
                {(Object.keys(RSVP_LABEL) as Rsvp[]).map((r) => (
                  <SelectItem key={r} value={r}>
                    {RSVP_LABEL[r]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={diet} onValueChange={setDiet}>
              <SelectTrigger aria-label="Filter by diet" className="w-full">
                <SelectValue placeholder="Diet" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any diet</SelectItem>
                <SelectItem value="any">Has a dietary need</SelectItem>
                <SelectItem value="none">No dietary need</SelectItem>
                {DIETS.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex min-h-8 items-center justify-between gap-2 text-sm text-muted-foreground">
            <p aria-live="polite">
              Showing {filtered.length} of {GUESTS.length} guests
            </p>
            {filtersOn ? (
              <Button type="button" variant="ghost" size="sm" onClick={clear}>
                <X /> Clear filters
              </Button>
            ) : null}
          </div>

          <div className="rounded-xl border bg-card shadow-xs">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Guest</TableHead>
                  <TableHead className="hidden md:table-cell">Party</TableHead>
                  <TableHead>RSVP</TableHead>
                  <TableHead>Diet</TableHead>
                  <TableHead>Table</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                      No guests match these filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((g) => {
                    const t = tableOf[g.id];
                    return (
                      <TableRow key={g.id}>
                        <TableCell className="font-medium">
                          {g.name}
                          <span className="mt-0.5 flex items-center gap-1.5 text-xs font-normal text-muted-foreground md:hidden">
                            <span
                              aria-hidden="true"
                              className="size-2 rounded-full"
                              style={{ backgroundColor: partyDot(g.party) }}
                            />
                            {g.party}
                          </span>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <span className="flex items-center gap-1.5">
                            <span
                              aria-hidden="true"
                              className="size-2 rounded-full"
                              style={{ backgroundColor: partyDot(g.party) }}
                            />
                            {g.party}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={RSVP_STYLE[g.rsvp]}>
                            {RSVP_LABEL[g.rsvp]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {g.diet ? (
                            <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-900">
                              {g.diet}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">None</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {t ? (
                            <span className="font-medium">{TABLES_BY_ID[t]?.name}</span>
                          ) : g.rsvp === "no" ? (
                            <span className="text-muted-foreground">Declined</span>
                          ) : (
                            <span className="text-amber-700">Not seated</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </section>

        <aside aria-labelledby="meals-heading" className="min-w-0 rounded-xl border bg-card p-4 shadow-xs lg:sticky lg:top-20">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h2 id="meals-heading" className="font-semibold">
                Meals for the caterer
              </h2>
              <p className="text-xs text-muted-foreground">Declined guests are not counted.</p>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={copyMeals}>
              <Copy /> Copy
            </Button>
          </div>

          <table className="mt-3 w-full text-sm">
            <caption className="sr-only">Meal counts by dietary need</caption>
            <thead>
              <tr className="border-b text-left text-xs text-muted-foreground">
                <th scope="col" className="py-1.5 font-medium">
                  Meal
                </th>
                <th scope="col" className="py-1.5 text-right font-medium">
                  Confirmed
                </th>
                <th scope="col" className="py-1.5 text-right font-medium">
                  Awaiting
                </th>
              </tr>
            </thead>
            <tbody>
              {MEALS.map((m) => (
                <tr key={m.meal} className="border-b last:border-0">
                  <th scope="row" className="py-0 text-left font-normal">
                    <button
                      type="button"
                      onClick={() => setDiet(diet === m.filter ? "all" : m.filter)}
                      aria-pressed={diet === m.filter}
                      title={`Filter the list to ${m.meal}`}
                      className={cn(
                        "w-full rounded-md py-2 pr-2 text-left outline-none hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/50",
                        diet === m.filter && "font-semibold text-primary",
                      )}
                    >
                      {m.meal}
                    </button>
                  </th>
                  <td className="py-2 text-right font-medium tabular-nums">{m.confirmed}</td>
                  <td className="py-2 text-right text-muted-foreground tabular-nums">{m.awaiting}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 font-semibold">
                <th scope="row" className="py-2 text-left">
                  Total
                </th>
                <td className="py-2 text-right tabular-nums">{totalConfirmed}</td>
                <td className="py-2 text-right text-muted-foreground tabular-nums">{totalAwaiting}</td>
              </tr>
            </tfoot>
          </table>
        </aside>
      </div>
    </main>
  );
}
