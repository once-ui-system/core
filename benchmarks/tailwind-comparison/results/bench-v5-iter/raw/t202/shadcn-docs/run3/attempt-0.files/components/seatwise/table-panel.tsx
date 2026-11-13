"use client"

import { TriangleAlert, Utensils, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TABLES } from "@/lib/data"
import { GUEST_BY_ID, TABLE_BY_ID } from "@/lib/seating"
import { cn } from "@/lib/utils"
import { DietBadge, GuestAvatar } from "./guest-bits"
import { usePlan } from "./plan-provider"

export function TablePanel({ tableId }: { tableId: string }) {
  const { seats, counts, rules, armed, setArmed, place, unseat } = usePlan()
  const table = TABLE_BY_ID[tableId]
  const row = seats[tableId]
  const { filled } = counts.perTable[tableId]
  const guests = row.flatMap((gid) => (gid ? [GUEST_BY_ID[gid]] : []))
  const free = table.seats - filled
  const broken = rules.filter((r) => r.status === "broken" && r.tableIds.includes(tableId))

  const diets = new Map<string, string[]>()
  for (const g of guests) {
    if (!g.diet) continue
    diets.set(g.diet, [...(diets.get(g.diet) ?? []), g.name])
  }
  const others = TABLES.filter((t) => t.id !== tableId && counts.perTable[t.id].filled < t.seats)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold tracking-tight">{table.name}</h3>
          <p className="text-sm text-muted-foreground tabular-nums">
            {filled} of {table.seats} seats filled · {free} free
          </p>
        </div>
        {armed && free > 0 ? (
          <Button
            size="sm"
            onClick={() => {
              if (place(armed, tableId)) setArmed(null)
            }}
          >
            Seat {GUEST_BY_ID[armed].name.split(" ")[0]} here
          </Button>
        ) : null}
      </div>

      {broken.length ? (
        <div role="alert" className="rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm">
          <p className="flex items-center gap-1.5 font-medium text-destructive">
            <TriangleAlert aria-hidden className="size-4" /> Broken here
          </p>
          <ul className="mt-1 flex flex-col gap-1">
            {broken.map((r) => (
              <li key={r.id}>
                <span className="font-medium">{r.title}.</span>{" "}
                <span className="text-muted-foreground">{r.detail}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <section aria-label="Dietary needs at this table" className="rounded-lg bg-muted/60 p-3">
        <h4 className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          <Utensils aria-hidden className="size-3.5" /> Dietary needs
        </h4>
        {diets.size === 0 ? (
          <p className="mt-1 text-sm text-muted-foreground">None at this table.</p>
        ) : (
          <ul className="mt-1.5 flex flex-col gap-1 text-sm">
            {[...diets.entries()].map(([diet, names]) => (
              <li key={diet} className="flex items-baseline gap-2">
                <DietBadge diet={diet} />
                <span className="text-muted-foreground">{names.join(", ")}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-label={`Seats at ${table.name}`}>
        <h4 className="mb-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">Seats</h4>
        <ol className="flex flex-col gap-1.5">
          {row.map((gid, i) => {
            const g = gid ? GUEST_BY_ID[gid] : null
            return (
              <li
                key={i}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg border px-2 py-1.5",
                  g ? "bg-card" : "border-dashed bg-transparent"
                )}
              >
                <span className="w-4 shrink-0 text-center text-xs text-muted-foreground tabular-nums">{i + 1}</span>
                {g ? (
                  <>
                    <GuestAvatar guest={g} className="size-7 text-[10px]" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{g.name}</span>
                      <span className="flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
                        {g.party}
                        {g.diet ? <DietBadge diet={g.diet} className="px-1.5 py-0 text-[11px]" /> : null}
                      </span>
                    </span>
                    <Select value="" onValueChange={(v) => place(g.id, v)}>
                      <SelectTrigger size="sm" className="w-[88px] px-2 text-xs" aria-label={`Move ${g.name} to another table`}>
                        <SelectValue placeholder="Move to" />
                      </SelectTrigger>
                      <SelectContent>
                        {others.map((t) => (
                          <SelectItem key={t.id} value={t.id}>
                            {t.name} ({t.seats - counts.perTable[t.id].filled} free)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      aria-label={`Unseat ${g.name}`}
                      title="Unseat"
                      onClick={() => unseat(g.id)}
                    >
                      <X />
                    </Button>
                  </>
                ) : (
                  <span className="flex-1 py-1 text-sm text-muted-foreground">Empty seat</span>
                )}
              </li>
            )
          })}
        </ol>
      </section>
    </div>
  )
}
