"use client"

import * as React from "react"
import { ArrowLeftIcon, CircleCheckIcon, TriangleAlertIcon, UtensilsIcon } from "lucide-react"

import { GuestRow } from "@/components/seatwise/guest-row"
import { usePlan } from "@/components/seatwise/plan-provider"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { guests, tables } from "@/lib/data"
import { RSVP_LABEL, partyColor, tableById } from "@/lib/plan"
import { cn } from "@/lib/utils"

export type SidebarTab = "seat" | "table"

interface Props {
  tab: SidebarTab
  onTabChange: (t: SidebarTab) => void
  selectedTable: string | null
  onSelectTable: (id: string | null) => void
  heldGuest: string | null
  onHold: (id: string) => void
  dragging: string | null
  onDragStart: (id: string) => void
  onDragEnd: () => void
  brokenGuests: Set<string>
  brokenTables: Set<string>
}

export function PlanSidebar(p: Props) {
  const { placements, totals, unseat, seatMap, place } = usePlan()
  const [dropActive, setDropActive] = React.useState(false)

  const unseated = guests.filter((g) => g.rsvp === "yes" && !placements[g.id])
  const awaiting = guests.filter((g) => (g.rsvp === "maybe" || g.rsvp === "pending") && !placements[g.id])

  const rowProps = {
    onHold: p.onHold,
    onDragStart: p.onDragStart,
    onDragEnd: () => {
      setDropActive(false)
      p.onDragEnd()
    },
  }

  return (
    <Tabs value={p.tab} onValueChange={(v) => p.onTabChange(v as SidebarTab)} className="h-full min-h-0 gap-3">
      <TabsList className="grid w-full grid-cols-2 [&_[role=tab]:not([data-state=active])]:text-muted-foreground">
        <TabsTrigger value="seat">
          To seat
          <Badge variant={unseated.length ? "default" : "secondary"} className="h-5 min-w-5 px-1.5">
            {unseated.length}
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="table">
          {p.selectedTable ? tableById[p.selectedTable].name : "Tables"}
        </TabsTrigger>
      </TabsList>

      {/* ---------- guests without a seat ---------- */}
      <TabsContent
        value="seat"
        className={cn(
          "min-h-0 rounded-xl transition-colors",
          dropActive && "bg-primary/5 ring-2 ring-primary/40 ring-dashed",
        )}
        onDragOver={(e) => {
          if (!p.dragging || !placements[p.dragging]) return
          e.preventDefault()
          setDropActive(true)
        }}
        onDragLeave={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setDropActive(false)
        }}
        onDrop={(e) => {
          e.preventDefault()
          setDropActive(false)
          const id = e.dataTransfer.getData("text/plain")
          if (id && placements[id]) unseat(id)
        }}
      >
        <ScrollArea className="h-[min(26rem,55dvh)] lg:h-[calc(100dvh-17.5rem)]">
          <div className="space-y-4 pr-3">
            <section aria-labelledby="unseated-h">
              <div className="mb-2 flex items-baseline justify-between">
                <h2 id="unseated-h" className="text-sm font-semibold">
                  Attending, no seat
                </h2>
                <span className="text-xs text-muted-foreground">{totals.freeSeats} seats free</span>
              </div>
              {unseated.length ? (
                <ul className="space-y-1.5">
                  {unseated.map((g) => (
                    <GuestRow
                      key={g.id}
                      guest={g}
                      held={p.heldGuest === g.id}
                      flagged={p.brokenGuests.has(g.id)}
                      {...rowProps}
                    />
                  ))}
                </ul>
              ) : (
                <Empty className="border border-dashed p-6">
                  <EmptyHeader>
                    <EmptyTitle className="flex items-center gap-2 text-base">
                      <CircleCheckIcon className="size-4 text-ok" aria-hidden /> Everyone attending has a seat
                    </EmptyTitle>
                    <EmptyDescription>Drag a guest here to unseat them.</EmptyDescription>
                  </EmptyHeader>
                </Empty>
              )}
            </section>

            {awaiting.length > 0 && (
              <section aria-labelledby="awaiting-h">
                <Separator className="mb-3" />
                <h2 id="awaiting-h" className="text-sm font-semibold">
                  Not confirmed yet
                </h2>
                <p className="mb-2 text-xs text-muted-foreground">You can hold seats for them, but they have not said yes.</p>
                <ul className="space-y-1.5">
                  {awaiting.map((g) => (
                    <GuestRow
                      key={g.id}
                      guest={g}
                      held={p.heldGuest === g.id}
                      flagged={p.brokenGuests.has(g.id)}
                      {...rowProps}
                    />
                  ))}
                </ul>
              </section>
            )}
          </div>
        </ScrollArea>
      </TabsContent>

      {/* ---------- tables ---------- */}
      <TabsContent value="table" className="min-h-0">
        <ScrollArea className="h-[min(30rem,60dvh)] lg:h-[calc(100dvh-17.5rem)]">
          <div className="pr-3">
            {p.selectedTable ? (
              <TableDetail {...p} tableId={p.selectedTable} rowProps={rowProps} />
            ) : (
              <ul className="space-y-1.5">
                {tables.map((t) => {
                  const filled = seatMap[t.id].filter(Boolean).length
                  const broken = p.brokenTables.has(t.id)
                  return (
                    <li key={t.id}>
                      <button
                        type="button"
                        onClick={() => {
                          if (p.heldGuest) {
                            place(p.heldGuest, t.id)
                            p.onHold(p.heldGuest)
                          }
                          p.onSelectTable(t.id)
                        }}
                        className={cn(
                          "flex min-h-14 w-full items-center gap-3 rounded-lg border bg-card px-3 py-2 text-left outline-none transition-colors hover:bg-secondary/60 focus-visible:ring-[3px] focus-visible:ring-ring/50",
                          broken && "border-destructive/50",
                        )}
                      >
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center gap-1.5 text-sm font-medium">
                            {t.name}
                            {broken && <TriangleAlertIcon className="size-3.5 text-destructive" aria-label="Breaks a rule" />}
                          </span>
                          <Progress value={(filled / t.seats) * 100} className="mt-1.5 h-1.5" aria-label={`${t.name} filled`} />
                        </span>
                        <span className="text-sm tabular-nums text-muted-foreground">
                          {filled}/{t.seats}
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </ScrollArea>
      </TabsContent>
    </Tabs>
  )
}

function TableDetail(
  p: Props & {
    tableId: string
    rowProps: { onHold: (id: string) => void; onDragStart: (id: string) => void; onDragEnd: () => void }
  },
) {
  const { seatMap, results, place } = usePlan()
  const t = tableById[p.tableId]
  const seats = seatMap[t.id]
  const filled = seats.filter(Boolean).length
  const issues = results.filter((r) => r.status === "broken" && r.tables.includes(t.id))

  const diets = new Map<string, number>()
  for (const g of seats) if (g?.diet) diets.set(g.diet, (diets.get(g.diet) ?? 0) + 1)

  return (
    <div className="space-y-4">
      <div>
        <Button variant="ghost" size="sm" className="-ml-2 mb-1" onClick={() => p.onSelectTable(null)}>
          <ArrowLeftIcon /> All tables
        </Button>
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="font-serif text-xl">{t.name}</h2>
          <span className="text-sm text-muted-foreground tabular-nums">
            {filled} of {t.seats} seats · {t.seats - filled} free
          </span>
        </div>
        <Progress value={(filled / t.seats) * 100} className="mt-2 h-1.5" aria-label={`${t.name} filled`} />
      </div>

      {issues.map((r) => (
        <Alert key={r.index} variant="destructive">
          <TriangleAlertIcon />
          <AlertTitle>Rule broken</AlertTitle>
          <AlertDescription>
            {r.message}
            <span className="mt-1 block text-xs opacity-80">{r.rule.note}</span>
          </AlertDescription>
        </Alert>
      ))}

      <section aria-labelledby="seated-h">
        <h3 id="seated-h" className="mb-2 text-sm font-semibold">
          Seats
        </h3>
        <ol className="space-y-1.5">
          {seats.map((g, i) =>
            g ? (
              <GuestRow
                key={g.id}
                guest={g}
                seatNumber={i + 1}
                held={p.heldGuest === g.id}
                flagged={p.brokenGuests.has(g.id)}
                {...p.rowProps}
              />
            ) : (
              <li key={`empty-${i}`}>
                <button
                  type="button"
                  disabled={!p.heldGuest}
                  onClick={() => {
                    if (p.heldGuest && place(p.heldGuest, t.id, i)) p.onHold(p.heldGuest)
                  }}
                  className="flex min-h-12 w-full items-center gap-2.5 rounded-lg border border-dashed px-3 text-left text-sm text-muted-foreground outline-none enabled:hover:border-primary enabled:hover:bg-primary/5 enabled:hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-default"
                >
                  <span aria-hidden className="grid size-7 place-items-center rounded-full border border-dashed text-[0.65rem]">
                    {i + 1}
                  </span>
                  Empty seat{p.heldGuest ? ": place held guest here" : ""}
                </button>
              </li>
            ),
          )}
        </ol>
      </section>

      <section aria-labelledby="diet-h">
        <h3 id="diet-h" className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
          <UtensilsIcon className="size-3.5" aria-hidden /> Dietary needs
        </h3>
        {diets.size ? (
          <ul className="space-y-1.5">
            {seats
              .filter((g) => g?.diet)
              .map((g) => (
                <li key={g!.id} className="flex items-center justify-between gap-2 rounded-md bg-secondary/60 px-3 py-2 text-sm">
                  <span className="flex min-w-0 items-center gap-2">
                    <span aria-hidden className="size-2 shrink-0 rounded-full" style={{ background: partyColor(g!.party, 0.7, 0.12) }} />
                    <span className="truncate">{g!.name}</span>
                  </span>
                  <Badge variant="outline" className="bg-background">
                    {g!.diet}
                  </Badge>
                </li>
              ))}
          </ul>
        ) : (
          <p className="rounded-md bg-secondary/60 px-3 py-2 text-sm text-muted-foreground">
            No dietary needs at this table. {filled ? "All standard menu." : ""}
          </p>
        )}
        {filled > 0 && (
          <p className="mt-2 text-xs text-muted-foreground">
            {Array.from(
              seats
                .filter((g) => g)
                .reduce((m, g) => m.set(RSVP_LABEL[g!.rsvp], (m.get(RSVP_LABEL[g!.rsvp]) ?? 0) + 1), new Map<string, number>()),
            )
              .map(([k, v]) => `${v} ${k.toLowerCase()}`)
              .join(" · ")}
          </p>
        )}
      </section>
    </div>
  )
}
