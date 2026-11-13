"use client"

import * as React from "react"
import { ArrowLeft, TriangleAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TABLES } from "@/lib/data"
import { TABLE_BY_ID } from "@/lib/seating"
import { useMedia } from "@/lib/use-media"
import { cn } from "@/lib/utils"
import { GuestRow } from "./guest-bits"
import { usePlan } from "./plan-provider"
import { RulesList } from "./rules-view"
import { TablePanel } from "./table-panel"

export type SideTab = "seat" | "tables" | "rules"

function TablesOverview() {
  const { counts, brokenTables, selectTable, selectedTable } = usePlan()
  return (
    <ul className="flex flex-col gap-1.5">
      {TABLES.map((t) => {
        const { filled, seats } = counts.perTable[t.id]
        const broken = brokenTables.has(t.id)
        return (
          <li key={t.id}>
            <button
              type="button"
              onClick={() => selectTable(t.id)}
              aria-pressed={selectedTable === t.id}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg border bg-card px-3 py-2.5 text-left outline-none transition-colors hover:bg-muted/60 focus-visible:ring-[3px] focus-visible:ring-ring/50",
                broken && "border-destructive/40"
              )}
            >
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1.5 text-sm font-medium">
                  {t.name}
                  {broken ? (
                    <>
                      <TriangleAlert aria-hidden className="size-3.5 text-destructive" />
                      <span className="sr-only">Rule broken</span>
                    </>
                  ) : null}
                </span>
                <span className="mt-1.5 block h-1.5 overflow-hidden rounded-full bg-muted" aria-hidden>
                  <span
                    className={cn("block h-full rounded-full", filled === seats ? "bg-ok" : "bg-primary/70")}
                    style={{ width: `${(filled / seats) * 100}%` }}
                  />
                </span>
              </span>
              <span className="text-sm text-muted-foreground tabular-nums">
                {filled}/{seats}
              </span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}

export function SidePanel({ tab, onTabChange }: { tab: SideTab; onTabChange: (t: SideTab) => void }) {
  const { counts, rules, selectedTable, selectTable } = usePlan()
  const desktop = useMedia("(min-width: 1024px)")
  const brokenCount = rules.filter((r) => r.status === "broken").length
  const toSeat = counts.unseated.length

  React.useEffect(() => {
    if (selectedTable && desktop) onTabChange("tables")
  }, [selectedTable, desktop, onTabChange])

  return (
    <>
      <section aria-label="Guests, tables and rules" className="rounded-xl border bg-card shadow-xs">
        <Tabs value={tab} onValueChange={(v) => onTabChange(v as SideTab)} className="gap-0">
          <div className="border-b p-2.5">
            <TabsList className="w-full [&_[data-slot=tabs-trigger]]:text-foreground/80">
              <TabsTrigger value="seat">
                To seat
                <span className="rounded-full bg-primary px-1.5 text-[11px] leading-5 text-primary-foreground tabular-nums">
                  {toSeat}
                </span>
              </TabsTrigger>
              <TabsTrigger value="tables">Tables</TabsTrigger>
              <TabsTrigger value="rules">
                Rules
                {brokenCount ? (
                  <span className="rounded-full bg-destructive px-1.5 text-[11px] leading-5 text-white tabular-nums">
                    {brokenCount}
                  </span>
                ) : null}
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="seat" className="p-3">
            <h3 className="text-sm font-semibold">Attending, no seat yet</h3>
            <p className="mb-2 text-xs text-muted-foreground">
              {toSeat} {toSeat === 1 ? "guest" : "guests"} to place. Drag onto the plan, or tap a name then a seat.
            </p>
            {counts.unseated.length ? (
              <ul className="flex flex-col gap-1.5">
                {counts.unseated.map((g) => (
                  <li key={g.id}>
                    <GuestRow guest={g} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
                Everyone attending has a seat.
              </p>
            )}
            {counts.unconfirmed.length ? (
              <>
                <h3 className="mt-4 text-sm font-semibold">Not confirmed</h3>
                <p className="mb-2 text-xs text-muted-foreground">
                  Maybe or no reply yet. You can hold a seat for them.
                </p>
                <ul className="flex flex-col gap-1.5">
                  {counts.unconfirmed.map((g) => (
                    <li key={g.id}>
                      <GuestRow guest={g} />
                    </li>
                  ))}
                </ul>
              </>
            ) : null}
          </TabsContent>

          <TabsContent value="tables" className="p-3">
            {desktop && selectedTable ? (
              <div>
                <Button variant="ghost" size="sm" className="-ml-2 mb-2" onClick={() => selectTable(null)}>
                  <ArrowLeft /> All tables
                </Button>
                <TablePanel tableId={selectedTable} />
              </div>
            ) : (
              <>
                <p className="mb-2 text-xs text-muted-foreground">Choose a table to see its guests and diets.</p>
                <TablesOverview />
              </>
            )}
          </TabsContent>

          <TabsContent value="rules" className="p-3">
            <RulesList />
          </TabsContent>
        </Tabs>
      </section>

      <Sheet open={!desktop && selectedTable !== null} onOpenChange={(o) => !o && selectTable(null)}>
        <SheetContent side="right" className="w-full gap-0 overflow-y-auto sm:max-w-md">
          <SheetHeader className="border-b pr-12">
            <SheetTitle>{selectedTable ? TABLE_BY_ID[selectedTable].name : "Table"}</SheetTitle>
            <SheetDescription>Guests at this table and their dietary needs.</SheetDescription>
          </SheetHeader>
          <div className="p-4">{selectedTable ? <TablePanel tableId={selectedTable} /> : null}</div>
        </SheetContent>
      </Sheet>
    </>
  )
}
