"use client"

import * as React from "react"
import { GripVertical } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { Guest, Rsvp } from "@/lib/data"
import { RSVP_LABEL, initials, partyStyle } from "@/lib/seating"
import { cn } from "@/lib/utils"
import { usePlan } from "./plan-provider"

export function GuestAvatar({ guest, className }: { guest: Guest; className?: string }) {
  return (
    <span
      aria-hidden
      style={partyStyle(guest.party)}
      className={cn(
        "grid size-8 shrink-0 place-items-center rounded-full border-[1.5px] text-[11px] leading-none font-semibold",
        className
      )}
    >
      {initials(guest.name)}
    </span>
  )
}

export function DietBadge({ diet, className }: { diet: string; className?: string }) {
  return (
    <Badge
      variant="outline"
      className={cn("border-amber-300 bg-amber-50 text-amber-900 dark:bg-amber-950 dark:text-amber-100", className)}
    >
      {diet}
    </Badge>
  )
}

const RSVP_STYLE: Record<Rsvp, string> = {
  yes: "border-emerald-300 bg-emerald-50 text-emerald-900",
  maybe: "border-sky-300 bg-sky-50 text-sky-900",
  pending: "border-slate-300 bg-slate-50 text-slate-800",
  no: "border-rose-300 bg-rose-50 text-rose-900",
}

export function RsvpBadge({ rsvp, className }: { rsvp: Rsvp; className?: string }) {
  return (
    <Badge variant="outline" className={cn(RSVP_STYLE[rsvp], className)}>
      {RSVP_LABEL[rsvp]}
    </Badge>
  )
}

/** A guest without a seat: tap to pick them up, or drag them onto the plan. */
export function GuestRow({ guest }: { guest: Guest }) {
  const { armed, setArmed, setDragging } = usePlan()
  const isArmed = armed === guest.id
  const toggle = () => setArmed(isArmed ? null : guest.id)
  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={isArmed}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", guest.id)
        e.dataTransfer.effectAllowed = "move"
        setDragging(guest.id)
      }}
      onDragEnd={() => setDragging(null)}
      onClick={toggle}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          toggle()
        }
      }}
      className={cn(
        "flex cursor-grab items-center gap-2.5 rounded-lg border bg-card px-2 py-2 text-left outline-none transition-colors select-none hover:bg-muted/60 focus-visible:ring-[3px] focus-visible:ring-ring/50 active:cursor-grabbing",
        isArmed && "border-primary bg-accent ring-2 ring-primary"
      )}
    >
      <GripVertical aria-hidden className="size-4 shrink-0 text-muted-foreground/60" />
      <GuestAvatar guest={guest} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium">{guest.name}</span>
        <span className="block truncate text-xs text-muted-foreground">{guest.party}</span>
      </span>
      {guest.diet ? <DietBadge diet={guest.diet} /> : null}
      {guest.rsvp !== "yes" ? <RsvpBadge rsvp={guest.rsvp} /> : null}
    </div>
  )
}
