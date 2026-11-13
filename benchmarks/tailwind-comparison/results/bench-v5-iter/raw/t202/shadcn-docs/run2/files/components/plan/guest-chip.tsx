"use client";

import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { partyColors } from "@/lib/data";
import { usePlan, type PlacedGuest } from "@/lib/plan-store";

export function PartyDot({ party, className }: { party: string; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn("inline-block size-2.5 shrink-0 rounded-full", className)}
      style={{ backgroundColor: partyColors(party).dot }}
    />
  );
}

/** A guest without a seat: tap to pick up, then tap a seat or table; or drag. */
export function GuestChip({ guest, muted = false }: { guest: PlacedGuest; muted?: boolean }) {
  const { armed, arm, setDragging } = usePlan();
  const isArmed = armed === guest.id;
  const colors = partyColors(guest.party);
  return (
    <button
      type="button"
      draggable
      aria-pressed={isArmed}
      onClick={() => arm(isArmed ? null : guest.id)}
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", guest.id);
        e.dataTransfer.effectAllowed = "move";
        setDragging(guest.id);
        arm(null);
      }}
      onDragEnd={() => setDragging(null)}
      className={cn(
        "group inline-flex min-h-11 max-w-full cursor-grab touch-manipulation items-center gap-2 rounded-lg border bg-card py-1.5 pr-3 pl-1.5 text-left text-sm shadow-xs outline-none transition-[box-shadow,background-color,border-color] hover:border-foreground/30 focus-visible:ring-[3px] focus-visible:ring-ring/50 active:cursor-grabbing",
        isArmed && "border-primary bg-accent ring-2 ring-primary",
        muted && "border-dashed bg-transparent",
      )}
      style={{ borderLeftColor: isArmed ? undefined : colors.edge, borderLeftWidth: 4 }}
    >
      <GripVertical className="size-4 shrink-0 text-muted-foreground/60" aria-hidden />
      <span className="min-w-0">
        <span className="block truncate font-medium leading-tight">{guest.name}</span>
        <span className="block truncate text-xs leading-tight text-muted-foreground">
          {guest.party}
          {guest.diet ? ` · ${guest.diet}` : ""}
        </span>
      </span>
    </button>
  );
}
