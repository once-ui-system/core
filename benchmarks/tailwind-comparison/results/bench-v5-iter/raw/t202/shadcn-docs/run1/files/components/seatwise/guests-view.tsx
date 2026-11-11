"use client"

import * as React from "react"
import { toast } from "sonner"
import { CopyIcon, PrinterIcon, SearchIcon, UtensilsIcon, XIcon } from "lucide-react"

import { usePlan } from "@/components/seatwise/plan-provider"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { event, guests, type Rsvp } from "@/lib/data"
import { DIETS, PARTIES, RSVP_LABEL, STANDARD_MEAL, mealCounts, mealOf, partyColor, tableById } from "@/lib/plan"
import { cn } from "@/lib/utils"

const RSVP_DOT: Record<Rsvp, string> = {
  yes: "bg-ok",
  maybe: "bg-gold",
  pending: "bg-muted-foreground/50",
  no: "bg-destructive",
}

const RSVP_SHORT: Record<Rsvp, string> = { yes: "Yes", maybe: "Maybe", pending: "Pending", no: "No" }

export function GuestsView() {
  const { placements, totals } = usePlan()
  const [query, setQuery] = React.useState("")
  const [party, setParty] = React.useState("all")
  const [rsvp, setRsvp] = React.useState("all")
  const [diet, setDiet] = React.useState("all")

  const meals = React.useMemo(() => mealCounts(), [])
  const confirmedTotal = meals.reduce((n, m) => n + m.confirmed, 0)
  const awaitingTotal = meals.reduce((n, m) => n + m.awaiting, 0)

  const rows = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    return guests
      .filter((g) => {
        if (party !== "all" && g.party !== party) return false
        if (rsvp !== "all" && g.rsvp !== rsvp) return false
        if (diet === "needs" && !g.diet) return false
        if (diet === "none" && g.diet) return false
        if (diet !== "all" && diet !== "needs" && diet !== "none" && g.diet !== diet) return false
        if (q) {
          const tableName = placements[g.id] ? tableById[placements[g.id].table].name : "no seat"
          const hay = `${g.name} ${g.party} ${g.diet ?? ""} ${tableName}`.toLowerCase()
          if (!hay.includes(q)) return false
        }
        return true
      })
      .sort((a, b) => a.name.localeCompare(b.name, "en"))
  }, [query, party, rsvp, diet, placements])

  const filtered = query !== "" || party !== "all" || rsvp !== "all" || diet !== "all"
  const clear = () => {
    setQuery("")
    setParty("all")
    setRsvp("all")
    setDiet("all")
  }

  const copyMeals = async () => {
    const lines = [
      `${event.name} · ${event.venue}`,
      `Meal counts (attending: ${confirmedTotal}${awaitingTotal ? `, awaiting reply: ${awaitingTotal}` : ""})`,
      ...meals.map((m) => `${m.meal}: ${m.confirmed}${m.awaiting ? ` (+${m.awaiting} awaiting)` : ""}`),
    ]
    try {
      await navigator.clipboard.writeText(lines.join("\n"))
      toast.success("Meal counts copied")
    } catch {
      toast.error("Could not copy. Use Print instead.")
    }
  }

  return (
    <div className="mx-auto max-w-[1500px] space-y-4 px-3 py-4 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
        <div>
          <h1 className="font-serif text-2xl tracking-tight sm:text-3xl">Guest list</h1>
          <p className="text-sm text-muted-foreground">
            {guests.length} invited · {totals.attending} attending · {totals.seated} seated · {totals.unseated} attending without a seat
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section aria-label="Guests" className="min-w-0 space-y-3 print:hidden">
          <Card className="gap-0 py-0">
            <CardContent className="grid gap-2 p-3 sm:grid-cols-2 xl:grid-cols-[minmax(12rem,1fr)_repeat(3,auto)]">
              <InputGroup className="sm:col-span-2 xl:col-span-1">
                <InputGroupInput
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search name, party, diet or table"
                  aria-label="Search guests"
                />
                <InputGroupAddon>
                  <SearchIcon aria-hidden />
                </InputGroupAddon>
              </InputGroup>

              <Select value={party} onValueChange={setParty}>
                <SelectTrigger className="w-full xl:w-48" aria-label="Filter by party">
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
                <SelectTrigger className="w-full xl:w-44" aria-label="Filter by RSVP">
                  <SelectValue />
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
                <SelectTrigger className="w-full xl:w-48" aria-label="Filter by diet">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any diet</SelectItem>
                  <SelectItem value="needs">Any dietary need</SelectItem>
                  <SelectItem value="none">{STANDARD_MEAL}</SelectItem>
                  {DIETS.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <div className="flex min-h-8 items-center justify-between px-1 text-sm text-muted-foreground" aria-live="polite">
            <span>
              Showing {rows.length} of {guests.length} guests
            </span>
            {filtered && (
              <Button variant="ghost" size="sm" onClick={clear}>
                <XIcon /> Clear filters
              </Button>
            )}
          </div>

          <Card className="gap-0 overflow-hidden py-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-4">Guest</TableHead>
                  <TableHead className="hidden md:table-cell">Party</TableHead>
                  <TableHead>RSVP</TableHead>
                  <TableHead className="hidden sm:table-cell">Diet</TableHead>
                  <TableHead className="pr-3 sm:pr-4">Table</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((g) => {
                  const p = placements[g.id]
                  return (
                    <TableRow key={g.id}>
                      <TableCell className="pl-4">
                        <div className="flex items-center gap-2.5">
                          <span aria-hidden className="size-2.5 shrink-0 rounded-full" style={{ background: partyColor(g.party, 0.78, 0.11) }} />
                          <div className="min-w-0">
                            <div className="font-medium">{g.name}</div>
                            <div className="text-xs text-muted-foreground md:hidden">{g.party}</div>
                            {g.diet && <div className="text-xs text-muted-foreground sm:hidden">{g.diet}</div>}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden text-muted-foreground md:table-cell">{g.party}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1.5 text-sm whitespace-nowrap">
                          <span aria-hidden className={cn("size-2 rounded-full", RSVP_DOT[g.rsvp])} />
                          <span className="sm:hidden">{RSVP_SHORT[g.rsvp]}</span>
                          <span className="hidden sm:inline">{RSVP_LABEL[g.rsvp]}</span>
                        </span>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {g.diet ? <Badge variant="outline">{g.diet}</Badge> : <span className="text-muted-foreground">{STANDARD_MEAL}</span>}
                      </TableCell>
                      <TableCell className="pr-3 sm:pr-4">
                        {p ? (
                          <Badge variant="secondary">{tableById[p.table].name}</Badge>
                        ) : g.rsvp === "no" ? (
                          <span className="text-muted-foreground">-</span>
                        ) : (
                          <Badge variant="outline" className="border-gold/60 bg-accent text-accent-foreground">
                            No seat
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
            {rows.length === 0 && (
              <Empty className="p-10">
                <EmptyHeader>
                  <EmptyTitle>No guests match</EmptyTitle>
                  <EmptyDescription>Try a different search or clear the filters.</EmptyDescription>
                </EmptyHeader>
                <Button variant="outline" size="sm" onClick={clear}>
                  Clear filters
                </Button>
              </Empty>
            )}
          </Card>
        </section>

        <aside aria-label="Meal counts for the caterer" className="print:col-span-2">
          <Card className="gap-3 py-4 lg:sticky lg:top-[4.5rem]">
            <CardHeader className="px-4">
              <CardTitle className="flex items-center gap-2 font-serif text-lg">
                <UtensilsIcon className="size-4" aria-hidden /> Meals for the caterer
              </CardTitle>
              <CardDescription>
                {event.name}, {event.venue}. Confirmed guests only; replies still open are shown separately.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-2">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-2">Meal</TableHead>
                    <TableHead className="text-right">Attending</TableHead>
                    <TableHead className="pr-2 text-right">Awaiting</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {meals.map((m) => {
                    const value = m.meal === STANDARD_MEAL ? "none" : m.meal
                    const active = diet === value
                    return (
                      <TableRow key={m.meal} data-state={active ? "selected" : undefined}>
                        <TableCell className="p-0">
                          <button
                            type="button"
                            aria-pressed={active}
                            title="Show these guests in the list"
                            onClick={() => setDiet(active ? "all" : value)}
                            className="w-full rounded-md py-2 pl-2 text-left font-medium outline-none hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/50 print:no-underline"
                          >
                            {m.meal}
                          </button>
                        </TableCell>
                        <TableCell className="text-right text-base font-semibold tabular-nums">{m.confirmed}</TableCell>
                        <TableCell className="pr-2 text-right tabular-nums text-muted-foreground">{m.awaiting || "-"}</TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell className="pl-2 font-semibold">Total meals</TableCell>
                    <TableCell className="text-right text-base font-semibold tabular-nums">{confirmedTotal}</TableCell>
                    <TableCell className="pr-2 text-right tabular-nums text-muted-foreground">{awaitingTotal}</TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
              <p className="mt-3 px-2 text-xs text-muted-foreground">
                {guests.filter((g) => g.rsvp === "no").length} declined, not counted.
              </p>
            </CardContent>
            <div className="flex gap-2 px-4 print:hidden">
              <Button variant="outline" size="sm" className="flex-1" onClick={copyMeals}>
                <CopyIcon /> Copy
              </Button>
              <Button variant="outline" size="sm" className="flex-1" onClick={() => window.print()}>
                <PrinterIcon /> Print
              </Button>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  )
}
