"use client"

import * as React from "react"
import Link from "next/link"
import { Copy, Search, Utensils } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { GUESTS, TABLES } from "@/lib/data"
import { DIETS, DIET_NONE, PARTIES, RSVP_LABEL, TABLE_BY_ID, partyDotStyle } from "@/lib/seating"
import { cn } from "@/lib/utils"
import { DietBadge, GuestAvatar, RsvpBadge } from "./guest-bits"
import { usePlan } from "./plan-provider"

const ALL = "all"
const NO_DIET = "__none"
const UNSEATED = "__unseated"

function mealOf(diet: string | null) {
  return diet ?? DIET_NONE
}

function MealCounts({ diet, onPick }: { diet: string; onPick: (d: string) => void }) {
  const meals = [DIET_NONE, ...DIETS]
  const rows = meals.map((meal) => {
    const confirmed = GUESTS.filter((g) => g.rsvp === "yes" && mealOf(g.diet) === meal).length
    const awaiting = GUESTS.filter(
      (g) => (g.rsvp === "maybe" || g.rsvp === "pending") && mealOf(g.diet) === meal
    ).length
    return { meal, confirmed, awaiting }
  })
  const totals = rows.reduce(
    (a, r) => ({ confirmed: a.confirmed + r.confirmed, awaiting: a.awaiting + r.awaiting }),
    { confirmed: 0, awaiting: 0 }
  )
  const declined = GUESTS.filter((g) => g.rsvp === "no").length

  function copy() {
    const text = [
      "Meals for Ines & Mateo's wedding dinner (attending guests)",
      ...rows.filter((r) => r.confirmed || r.awaiting).map(
        (r) => `${r.meal}: ${r.confirmed}${r.awaiting ? ` (+${r.awaiting} awaiting reply)` : ""}`
      ),
      `Total: ${totals.confirmed}`,
    ].join("\n")
    try {
      void navigator.clipboard.writeText(text).then(
        () => toast.success("Meal counts copied for the caterer."),
        () => toast.error("Could not copy. Select the table and copy it instead.")
      )
    } catch {
      toast.error("Could not copy. Select the table and copy it instead.")
    }
  }

  return (
    <section aria-labelledby="meals-title" className="rounded-xl border bg-card shadow-xs">
      <div className="flex items-start justify-between gap-3 px-4 pt-4">
        <div>
          <h2 id="meals-title" className="flex items-center gap-2 text-base font-semibold tracking-tight">
            <Utensils aria-hidden className="size-4 text-muted-foreground" /> Meals for the caterer
          </h2>
          <p className="text-xs text-muted-foreground">Attending guests. Select a meal to filter the list.</p>
        </div>
        <Button size="sm" variant="outline" onClick={copy}>
          <Copy /> Copy
        </Button>
      </div>
      <div className="px-2 pt-2 pb-2">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Meal</TableHead>
              <TableHead className="text-right">Attending</TableHead>
              <TableHead className="text-right">Awaiting</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => {
              const key = r.meal === DIET_NONE ? NO_DIET : r.meal
              const active = diet === key
              return (
                <TableRow key={r.meal} data-state={active ? "selected" : undefined}>
                  <TableCell className="p-0">
                    <button
                      type="button"
                      onClick={() => onPick(active ? ALL : key)}
                      aria-pressed={active}
                      className="w-full rounded-sm px-2 py-2 text-left text-sm outline-none hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/50"
                    >
                      {r.meal}
                    </button>
                  </TableCell>
                  <TableCell className="text-right font-medium tabular-nums">{r.confirmed}</TableCell>
                  <TableCell className="text-right text-muted-foreground tabular-nums">{r.awaiting || "–"}</TableCell>
                </TableRow>
              )
            })}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell>Total meals</TableCell>
              <TableCell className="text-right tabular-nums">{totals.confirmed}</TableCell>
              <TableCell className="text-right tabular-nums">{totals.awaiting}</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
        <p className="px-2 pt-2 text-xs text-muted-foreground">
          Awaiting is guests who answered maybe or have not replied. {declined} declined and are not counted.
        </p>
      </div>
    </section>
  )
}

function SeatSelect({ guestId }: { guestId: string }) {
  const { placement, counts, place, unseat } = usePlan()
  const guest = GUESTS.find((g) => g.id === guestId)!
  const current = placement[guestId]?.table ?? UNSEATED
  if (guest.rsvp === "no") return <span className="text-sm text-muted-foreground">Not coming</span>
  return (
    <Select
      value={current}
      onValueChange={(v) => {
        if (v === UNSEATED) unseat(guestId)
        else place(guestId, v)
      }}
    >
      <SelectTrigger size="sm" className="w-[140px]" aria-label={`Table for ${guest.name}`}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={UNSEATED}>Unseated</SelectItem>
        {TABLES.map((t) => {
          const full = counts.perTable[t.id].filled >= t.seats && current !== t.id
          return (
            <SelectItem key={t.id} value={t.id} disabled={full}>
              {t.name}
              {full ? " (full)" : ""}
            </SelectItem>
          )
        })}
      </SelectContent>
    </Select>
  )
}

export function GuestList() {
  const { placement, counts } = usePlan()
  const [q, setQ] = React.useState("")
  const [party, setParty] = React.useState(ALL)
  const [rsvp, setRsvp] = React.useState(ALL)
  const [diet, setDiet] = React.useState(ALL)
  const [seating, setSeating] = React.useState(ALL)

  const filtered = GUESTS.filter((g) => {
    if (q && !g.name.toLowerCase().includes(q.trim().toLowerCase())) return false
    if (party !== ALL && g.party !== party) return false
    if (rsvp !== ALL && g.rsvp !== rsvp) return false
    if (diet === NO_DIET && g.diet) return false
    if (diet !== ALL && diet !== NO_DIET && g.diet !== diet) return false
    if (seating === "seated" && !placement[g.id]) return false
    if (seating === "unseated" && placement[g.id]) return false
    return true
  })
  const filtering = q !== "" || party !== ALL || rsvp !== ALL || diet !== ALL || seating !== ALL

  function reset() {
    setQ("")
    setParty(ALL)
    setRsvp(ALL)
    setDiet(ALL)
    setSeating(ALL)
  }

  return (
    <div className="mx-auto max-w-[1500px] px-4 py-5 sm:px-6 sm:py-6">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Guest list</h1>
          <p className="text-sm text-muted-foreground tabular-nums">
            {GUESTS.length} invited · {counts.attending} attending · {counts.seated} seated ·{" "}
            {counts.unseated.length} attending without a seat
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/">Back to the plan</Link>
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)] lg:items-start">
        <MealCounts diet={diet} onPick={setDiet} />

        <section aria-labelledby="guests-title" className="rounded-xl border bg-card shadow-xs">
          <h2 id="guests-title" className="sr-only">
            Guests
          </h2>
          <form
            role="search"
            aria-label="Filter guests"
            onSubmit={(e) => e.preventDefault()}
            className="grid gap-2 border-b p-3 sm:grid-cols-2 sm:p-4 xl:grid-cols-[minmax(0,1.4fr)_repeat(4,minmax(0,1fr))]"
          >
            <div className="relative sm:col-span-2 xl:col-span-1">
              <Search aria-hidden className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search by name"
                aria-label="Search guests by name"
                className="pl-8"
              />
            </div>
            <Filter
              label="party"
              all="All parties"
              value={party}
              onChange={setParty}
              options={PARTIES.map((p): [string, string] => [p, p])}
            />
            <Filter
              label="RSVP"
              all="All RSVPs"
              value={rsvp}
              onChange={setRsvp}
              options={(["yes", "maybe", "pending", "no"] as const).map((r): [string, string] => [r, RSVP_LABEL[r]])}
            />
            <Filter
              label="diet"
              all="All diets"
              value={diet}
              onChange={setDiet}
              options={[[NO_DIET, DIET_NONE], ...DIETS.map((d): [string, string] => [d, d])]}
            />
            <Filter
              label="seating"
              all="All seating"
              value={seating}
              onChange={setSeating}
              options={[
                ["seated", "Seated"],
                ["unseated", "Unseated"],
              ]}
            />
          </form>

          <div className="flex items-center justify-between px-4 py-2 text-xs text-muted-foreground">
            <p aria-live="polite">
              Showing {filtered.length} of {GUESTS.length} guests
            </p>
            {filtering ? (
              <Button variant="link" size="xs" className="h-auto px-0" onClick={reset}>
                Clear filters
              </Button>
            ) : null}
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-4">Guest</TableHead>
                <TableHead className="hidden sm:table-cell">RSVP</TableHead>
                <TableHead className="hidden sm:table-cell">Diet</TableHead>
                <TableHead className="pr-4">Table</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">
                    No guests match these filters.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((g) => {
                  const ref = placement[g.id]
                  return (
                    <TableRow key={g.id}>
                      <TableCell className="pl-4">
                        <div className="flex items-center gap-2.5">
                          <GuestAvatar guest={g} />
                          <div className="min-w-0">
                            <p className="font-medium">{g.name}</p>
                            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <span className="size-2 rounded-full" style={partyDotStyle(g.party)} aria-hidden />
                              {g.party}
                            </p>
                            <p className="mt-1 flex flex-wrap gap-1 sm:hidden">
                              <RsvpBadge rsvp={g.rsvp} />
                              {g.diet ? <DietBadge diet={g.diet} /> : null}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <RsvpBadge rsvp={g.rsvp} />
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {g.diet ? <DietBadge diet={g.diet} /> : <span className="text-muted-foreground">None</span>}
                      </TableCell>
                      <TableCell className="pr-4">
                        <div className="flex flex-col items-start gap-1">
                          {ref ? (
                            <span className={cn("text-xs text-muted-foreground")}>
                              {TABLE_BY_ID[ref.table].name}, seat {ref.seat + 1}
                            </span>
                          ) : null}
                          <SeatSelect guestId={g.id} />
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </section>
      </div>
    </div>
  )
}

function Filter({
  label,
  all,
  value,
  onChange,
  options,
}: {
  label: string
  all: string
  value: string
  onChange: (v: string) => void
  options: ReadonlyArray<readonly [string, string]>
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full" aria-label={`Filter by ${label}`}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>{all}</SelectItem>
        {options.map(([v, l]) => (
          <SelectItem key={v} value={v}>
            {l}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
