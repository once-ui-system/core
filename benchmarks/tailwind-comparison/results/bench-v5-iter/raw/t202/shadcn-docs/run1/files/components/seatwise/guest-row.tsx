"use client"

import { EllipsisIcon, GripVerticalIcon, TriangleAlertIcon, UserMinusIcon } from "lucide-react"

import { usePlan } from "@/components/seatwise/plan-provider"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { tables, type Guest } from "@/lib/data"
import { partyColor } from "@/lib/plan"
import { cn } from "@/lib/utils"

interface GuestRowProps {
  guest: Guest
  held: boolean
  flagged?: boolean
  seatNumber?: number
  showParty?: boolean
  onHold: (id: string) => void
  onDragStart: (id: string) => void
  onDragEnd: () => void
}

export function GuestRow({ guest, held, flagged, seatNumber, showParty = true, onHold, onDragStart, onDragEnd }: GuestRowProps) {
  const { placements, seatMap, place, unseat } = usePlan()
  const current = placements[guest.id]?.table

  return (
    <li
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", guest.id)
        e.dataTransfer.effectAllowed = "move"
        onDragStart(guest.id)
      }}
      onDragEnd={onDragEnd}
      className={cn(
        "group flex items-center gap-1 rounded-lg border bg-card pr-1 pl-1 transition-colors",
        held ? "border-primary bg-accent ring-2 ring-primary/30" : "hover:bg-secondary/60",
        flagged && !held && "border-destructive/50",
      )}
    >
      <GripVerticalIcon className="size-4 shrink-0 text-muted-foreground/60" aria-hidden />
      <button
        type="button"
        onClick={() => onHold(guest.id)}
        aria-pressed={held}
        className="flex min-h-12 min-w-0 flex-1 items-center gap-2.5 rounded-md py-1.5 text-left outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
      >
        <span
          aria-hidden
          className="grid size-7 shrink-0 place-items-center rounded-full text-[0.65rem] font-semibold text-[oklch(0.25_0.03_165)]"
          style={{ background: partyColor(guest.party) }}
        >
          {seatNumber ?? guest.name.replace(/^Avó\s+/, "")[0]}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-1.5 text-sm leading-tight font-medium">
            <span className="truncate">{guest.name}</span>
            {flagged && <TriangleAlertIcon className="size-3.5 shrink-0 text-destructive" aria-label="Breaks a rule" />}
          </span>
          {showParty && <span className="block truncate text-xs text-muted-foreground">{guest.party}</span>}
        </span>
        {guest.diet && (
          <Badge variant="outline" className="shrink-0 bg-background">
            {guest.diet}
          </Badge>
        )}
      </button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm" aria-label={`Seat or move ${guest.name}`}>
            <EllipsisIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>{current ? "Move to" : "Seat at"}</DropdownMenuLabel>
          {tables.map((t) => {
            const free = seatMap[t.id].filter((s) => s === null).length
            return (
              <DropdownMenuItem key={t.id} disabled={t.id === current || free === 0} onSelect={() => place(guest.id, t.id)}>
                <span className="flex-1">{t.name}</span>
                <span className="text-xs text-muted-foreground">{t.id === current ? "here" : free === 0 ? "full" : `${free} free`}</span>
              </DropdownMenuItem>
            )
          })}
          {current && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onSelect={() => unseat(guest.id)}>
                <UserMinusIcon />
                Unseat
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </li>
  )
}
