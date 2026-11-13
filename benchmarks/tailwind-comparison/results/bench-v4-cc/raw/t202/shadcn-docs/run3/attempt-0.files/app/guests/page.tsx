"use client";

import Link from "next/link";
import * as React from "react";
import { toast } from "sonner";
import { GuestAvatar } from "@/components/guest-row";
import { usePlan } from "@/components/plan-provider";
import { DietBadge, RsvpBadge } from "@/components/rsvp-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EVENT, GUESTS, TABLE_BY_ID, type Rsvp } from "@/lib/data";
import { formatEventDate, RSVP_LABEL } from "@/lib/format";
import { cn } from "@/lib/utils";

const STANDARD = "Standard menu";
const PARTIES = Array.from(new Set(GUESTS.map((x) => x.party)));
const DIETS = Array.from(new Set(GUESTS.flatMap((x) => (x.diet ? [x.diet] : [])))).sort((a, b) => a.localeCompare(b));
const RSVPS: Rsvp[] = ["yes", "maybe", "pending", "no"];

function FilterSelect({
  id,
  label,
  value,
  onChange,
  children,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0 space-y-1.5">
      <Label htmlFor={id} className="text-xs text-muted-foreground">
        {label}
      </Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id={id} className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>{children}</SelectContent>
      </Select>
    </div>
  );
}

export default function GuestsPage() {
  const plan = usePlan();
  const [query, setQuery] = React.useState("");
  const [party, setParty] = React.useState("all");
  const [rsvp, setRsvp] = React.useState("all");
  const [diet, setDiet] = React.useState("all");
  const [seating, setSeating] = React.useState("all");

  const filtersActive = query !== "" || party !== "all" || rsvp !== "all" || diet !== "all" || seating !== "all";

  const rows = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return GUESTS.filter((guest) => {
      const placement = plan.placements[guest.id] ?? null;
      const tableName = placement ? (TABLE_BY_ID[placement.table]?.name ?? "") : "";
      if (party !== "all" && guest.party !== party) return false;
      if (rsvp !== "all" && guest.rsvp !== rsvp) return false;
      if (diet === "none" && guest.diet) return false;
      if (diet !== "all" && diet !== "none" && guest.diet !== diet) return false;
      if (seating === "seated" && !placement) return false;
      if (seating === "unseated" && placement) return false;
      if (q) {
        const haystack = `${guest.name} ${guest.party} ${guest.diet ?? ""} ${tableName}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    }).sort((a, b) => a.name.localeCompare(b.name));
  }, [plan.placements, query, party, rsvp, diet, seating]);

  const meals = React.useMemo(() => {
    const names = [STANDARD, ...DIETS];
    return names.map((meal) => {
      const match = (x: (typeof GUESTS)[number]) => (meal === STANDARD ? !x.diet : x.diet === meal);
      return {
        meal,
        confirmed: GUESTS.filter((x) => x.rsvp === "yes" && match(x)).length,
        open: GUESTS.filter((x) => (x.rsvp === "maybe" || x.rsvp === "pending") && match(x)).length,
      };
    });
  }, []);

  const confirmedTotal = meals.reduce((sum, m) => sum + m.confirmed, 0);
  const openTotal = meals.reduce((sum, m) => sum + m.open, 0);
  const declined = GUESTS.filter((x) => x.rsvp === "no").length;

  function clearFilters() {
    setQuery("");
    setParty("all");
    setRsvp("all");
    setDiet("all");
    setSeating("all");
  }

  async function copyMeals() {
    const text = [
      `${EVENT.name}, ${formatEventDate()}`,
      `${EVENT.venue}`,
      "",
      ...meals.filter((m) => m.confirmed > 0).map((m) => `${m.meal}: ${m.confirmed}`),
      `Total confirmed: ${confirmedTotal}`,
    ].join("\n");
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Meal counts copied", { description: "Paste them into your message to the caterer." });
    } catch {
      toast.error("Couldn't copy", { description: "Select the counts and copy them by hand." });
    }
  }

  function filterByMeal(meal: string) {
    setRsvp("yes");
    setDiet(meal === STANDARD ? "none" : meal);
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Guest list</h1>
        <p className="text-sm text-muted-foreground">
          {GUESTS.length} invited · {plan.counts.attending} attending · {plan.counts.awaiting} awaiting a reply · {declined} declined
        </p>
      </div>

      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <section aria-label="Caterer meal counts" className="order-first rounded-xl border bg-card p-4 shadow-xs xl:sticky xl:top-[4.5rem] xl:order-last">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold">Meals for the caterer</h2>
              <p className="text-xs text-muted-foreground">Guests who have said yes. Tap a meal to list who has it.</p>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={copyMeals}>
              Copy
            </Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Meal</TableHead>
                <TableHead className="text-right">Confirmed</TableHead>
                <TableHead className="text-right">Not yet</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {meals.map((m) => (
                <TableRow key={m.meal}>
                  <TableCell className="p-0">
                    <button
                      type="button"
                      onClick={() => filterByMeal(m.meal)}
                      className="w-full rounded-md px-2 py-2 text-left outline-none hover:bg-secondary focus-visible:ring-[3px] focus-visible:ring-ring/50"
                    >
                      {m.meal}
                    </button>
                  </TableCell>
                  <TableCell className="text-right font-medium tabular-nums">{m.confirmed}</TableCell>
                  <TableCell className="text-right text-muted-foreground tabular-nums">{m.open}</TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell className="font-semibold">Total</TableCell>
                <TableCell className="text-right font-semibold tabular-nums">{confirmedTotal}</TableCell>
                <TableCell className="text-right text-muted-foreground tabular-nums">{openTotal}</TableCell>
              </TableRow>
            </TableFooter>
          </Table>
          <p className="mt-3 text-xs text-muted-foreground">
            &ldquo;Not yet&rdquo; counts guests who are maybe or haven&apos;t replied. They are not in the confirmed total.
          </p>
        </section>

        <section aria-label="Guests" className="min-w-0 rounded-xl border bg-card shadow-xs">
          <div className="grid gap-3 border-b p-4 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.4fr)_repeat(4,minmax(0,1fr))]">
            <div className="min-w-0 space-y-1.5 sm:col-span-2 lg:col-span-1">
              <Label htmlFor="guest-search" className="text-xs text-muted-foreground">
                Search
              </Label>
              <Input
                id="guest-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Name, party, diet or table"
              />
            </div>
            <FilterSelect id="filter-party" label="Party" value={party} onChange={setParty}>
              <SelectItem value="all">All parties</SelectItem>
              {PARTIES.map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </FilterSelect>
            <FilterSelect id="filter-rsvp" label="RSVP" value={rsvp} onChange={setRsvp}>
              <SelectItem value="all">Any reply</SelectItem>
              {RSVPS.map((r) => (
                <SelectItem key={r} value={r}>
                  {RSVP_LABEL[r]}
                </SelectItem>
              ))}
            </FilterSelect>
            <FilterSelect id="filter-diet" label="Diet" value={diet} onChange={setDiet}>
              <SelectItem value="all">Any diet</SelectItem>
              <SelectItem value="none">No dietary need</SelectItem>
              {DIETS.map((d) => (
                <SelectItem key={d} value={d}>
                  {d}
                </SelectItem>
              ))}
            </FilterSelect>
            <FilterSelect id="filter-seating" label="Seating" value={seating} onChange={setSeating}>
              <SelectItem value="all">Seated or not</SelectItem>
              <SelectItem value="seated">Seated</SelectItem>
              <SelectItem value="unseated">Unseated</SelectItem>
            </FilterSelect>
          </div>

          <div className="flex items-center justify-between gap-3 px-4 py-2 text-sm text-muted-foreground">
            <p aria-live="polite">
              Showing {rows.length} of {GUESTS.length} guests
            </p>
            {filtersActive && (
              <Button type="button" variant="ghost" size="sm" onClick={clearFilters}>
                Clear filters
              </Button>
            )}
          </div>

          {rows.length === 0 ? (
            <div className="px-4 pb-8 pt-4 text-center">
              <p className="font-medium">No guests match</p>
              <p className="mt-1 text-sm text-muted-foreground">Try a different search or clear the filters.</p>
              <Button type="button" variant="outline" size="sm" className="mt-3" onClick={clearFilters}>
                Clear filters
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-4">Guest</TableHead>
                  <TableHead className="hidden md:table-cell">Party</TableHead>
                  <TableHead>RSVP</TableHead>
                  <TableHead className="hidden sm:table-cell">Diet</TableHead>
                  <TableHead className="pr-4">Table</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((guest) => {
                  const placement = plan.placements[guest.id] ?? null;
                  const table = placement ? TABLE_BY_ID[placement.table] : undefined;
                  return (
                    <TableRow key={guest.id}>
                      <TableCell className="pl-4">
                        <div className="flex items-center gap-2.5">
                          <GuestAvatar guest={guest} />
                          <div className="min-w-0">
                            <p className="truncate font-medium">{guest.name}</p>
                            <p className="truncate text-xs text-muted-foreground md:hidden">{guest.party}</p>
                            {guest.diet && <DietBadge diet={guest.diet} className="mt-0.5 sm:hidden" />}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden text-muted-foreground md:table-cell">{guest.party}</TableCell>
                      <TableCell>
                        <RsvpBadge rsvp={guest.rsvp} />
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {guest.diet ? <DietBadge diet={guest.diet} /> : <span className="text-muted-foreground">None</span>}
                      </TableCell>
                      <TableCell className="pr-4">
                        {table ? (
                          <Link
                            href="/"
                            onClick={() => plan.inspectTable(table.id)}
                            className="rounded font-medium underline-offset-4 outline-none hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/50"
                          >
                            {table.name}
                          </Link>
                        ) : (
                          <span className={cn(guest.rsvp === "no" ? "text-muted-foreground" : "font-medium text-amber-700")}>
                            {guest.rsvp === "no" ? "Not coming" : "Unseated"}
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </section>
      </div>
    </div>
  );
}
