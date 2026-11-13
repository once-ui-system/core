"use client";

import * as React from "react";
import Link from "next/link";
import { Printer, Search, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { cn } from "@/lib/utils";
import { diets, event, parties, rsvpLabel, tables, type Rsvp } from "@/lib/data";
import { usePlan } from "@/lib/plan-store";
import { PartyDot } from "@/components/plan/guest-chip";

const tableName = new Map(tables.map((t) => [t.id, t.name]));

const rsvpStyle: Record<Rsvp, string> = {
  yes: "border-primary/30 bg-accent text-accent-foreground",
  maybe: "border-transparent bg-warn text-warn-foreground",
  pending: "text-muted-foreground",
  no: "border-destructive/40 bg-destructive/10 text-destructive",
};

export function GuestsView() {
  const { guests } = usePlan();
  const [q, setQ] = React.useState("");
  const [party, setParty] = React.useState("all");
  const [rsvp, setRsvp] = React.useState("all");
  const [diet, setDiet] = React.useState("all");

  const filtered = React.useMemo(() => {
    const needle = q.trim().toLowerCase();
    return guests.filter((g) => {
      if (party !== "all" && g.party !== party) return false;
      if (rsvp !== "all" && g.rsvp !== rsvp) return false;
      if (diet === "none" ? g.diet !== null : diet !== "all" && g.diet !== diet) return false;
      if (needle) {
        const hay = `${g.name} ${g.party} ${g.diet ?? ""} ${g.table ? tableName.get(g.table) : "unseated"}`.toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      return true;
    });
  }, [guests, q, party, rsvp, diet]);

  const meals = React.useMemo(() => {
    const rows = ["Standard", ...diets].map((meal) => {
      const match = (d: string | null) => (meal === "Standard" ? d === null : d === meal);
      return {
        meal,
        confirmed: guests.filter((g) => g.rsvp === "yes" && match(g.diet)).length,
        possible: guests.filter((g) => (g.rsvp === "maybe" || g.rsvp === "pending") && match(g.diet)).length,
      };
    });
    return {
      rows,
      confirmed: rows.reduce((n, r) => n + r.confirmed, 0),
      possible: rows.reduce((n, r) => n + r.possible, 0),
    };
  }, [guests]);

  const filtersActive = q !== "" || party !== "all" || rsvp !== "all" || diet !== "all";
  const reset = () => {
    setQ("");
    setParty("all");
    setRsvp("all");
    setDiet("all");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">Guest list</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {event.name} · {guests.length} invited
          </p>
        </div>
        <Button variant="outline" onClick={() => window.print()} className="no-print">
          <Printer /> Print for caterer
        </Button>
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <section aria-label="Guests" className="min-w-0 space-y-3">
          <div className="no-print grid gap-2 sm:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_repeat(3,11rem)]">
            <div className="relative sm:col-span-2 xl:col-span-1">
              <Search
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search name, party, table or diet"
                aria-label="Search guests"
                className="h-10 bg-card pl-9"
              />
            </div>
            <Select value={party} onValueChange={setParty}>
              <SelectTrigger aria-label="Filter by party" className="h-10 w-full bg-card">
                <SelectValue placeholder="Party" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All parties</SelectItem>
                {parties.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={rsvp} onValueChange={setRsvp}>
              <SelectTrigger aria-label="Filter by RSVP" className="h-10 w-full bg-card">
                <SelectValue placeholder="RSVP" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any RSVP</SelectItem>
                {(Object.keys(rsvpLabel) as Rsvp[]).map((r) => (
                  <SelectItem key={r} value={r}>
                    {rsvpLabel[r]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={diet} onValueChange={setDiet}>
              <SelectTrigger aria-label="Filter by diet" className="h-10 w-full bg-card">
                <SelectValue placeholder="Diet" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any diet</SelectItem>
                <SelectItem value="none">No dietary needs</SelectItem>
                {diets.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex min-h-8 items-center justify-between gap-2 text-sm text-muted-foreground">
            <p role="status" aria-live="polite">
              Showing <span className="font-medium text-foreground tabular-nums">{filtered.length}</span> of{" "}
              {guests.length} guests
            </p>
            {filtersActive && (
              <Button variant="ghost" size="sm" onClick={reset} className="no-print">
                <X /> Clear filters
              </Button>
            )}
          </div>

          <div className="overflow-hidden rounded-xl border bg-card shadow-xs">
            <Table>
              <TableHeader className="bg-secondary/60">
                <TableRow>
                  <TableHead className="pl-4">Guest</TableHead>
                  <TableHead className="hidden md:table-cell">Party</TableHead>
                  <TableHead>RSVP</TableHead>
                  <TableHead className="hidden sm:table-cell">Diet</TableHead>
                  <TableHead className="pr-4">Table</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                      No guest matches these filters.
                    </TableCell>
                  </TableRow>
                )}
                {filtered.map((g) => (
                  <TableRow key={g.id}>
                    <TableCell className="py-3 pl-4">
                      <div className="font-medium">{g.name}</div>
                      <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground md:hidden">
                        <PartyDot party={g.party} />
                        {g.party}
                        {g.diet && <span className="sm:hidden">· {g.diet}</span>}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <span className="inline-flex items-center gap-2">
                        <PartyDot party={g.party} />
                        {g.party}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={rsvpStyle[g.rsvp]}>
                        {rsvpLabel[g.rsvp]}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {g.diet ? (
                        <Badge variant="secondary" className="bg-warn text-warn-foreground">
                          {g.diet}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">None</span>
                      )}
                    </TableCell>
                    <TableCell className="pr-4">
                      {g.table ? (
                        <Link
                          href="/"
                          className="rounded-sm font-medium underline-offset-4 outline-none hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/50"
                        >
                          {tableName.get(g.table)}
                          {g.seat !== null && (
                            <span className="font-normal text-muted-foreground"> · seat {g.seat + 1}</span>
                          )}
                        </Link>
                      ) : g.rsvp === "no" ? (
                        <span className="text-muted-foreground">Not needed</span>
                      ) : (
                        <Badge variant="outline" className="border-destructive/40 text-destructive">
                          Unseated
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </section>

        <aside aria-label="Meal counts" className="lg:sticky lg:top-20">
          <Card className="gap-3 py-4">
            <CardHeader className="px-4">
              <CardTitle className="font-display text-lg">Meals for the caterer</CardTitle>
              <CardDescription>
                {meals.confirmed} confirmed
                {meals.possible > 0 ? `, plus ${meals.possible} who may still come` : ""}. Declined guests are left
                out.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="px-0">Meal</TableHead>
                    <TableHead className="px-2 text-right">Confirmed</TableHead>
                    <TableHead className="px-0 text-right">Maybe</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {meals.rows.map((r) => (
                    <TableRow key={r.meal}>
                      <TableCell className="px-0 py-2">
                        <button
                          type="button"
                          onClick={() => setDiet(r.meal === "Standard" ? "none" : r.meal)}
                          aria-label={`Filter the list to ${r.meal}`}
                          className={cn(
                            "no-print -mx-1 rounded-sm px-1 text-left outline-none hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/50",
                          )}
                        >
                          {r.meal}
                        </button>
                      </TableCell>
                      <TableCell className="px-2 py-2 text-right font-semibold tabular-nums">{r.confirmed}</TableCell>
                      <TableCell className="px-0 py-2 text-right text-muted-foreground tabular-nums">
                        {r.possible}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="border-t-2 font-semibold hover:bg-transparent">
                    <TableCell className="px-0 py-2">Total</TableCell>
                    <TableCell className="px-2 py-2 text-right tabular-nums">{meals.confirmed}</TableCell>
                    <TableCell className="px-0 py-2 text-right text-muted-foreground tabular-nums">
                      {meals.possible}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
              <p className="mt-3 text-xs text-muted-foreground">
                "Maybe" counts guests who answered maybe or have not replied. Tap a meal to filter the list.
              </p>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
