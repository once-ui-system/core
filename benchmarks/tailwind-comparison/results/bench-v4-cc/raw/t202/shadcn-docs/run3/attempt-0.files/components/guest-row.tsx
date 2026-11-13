"use client";

import { XIcon } from "lucide-react";
import { DietBadge } from "@/components/rsvp-badge";
import { usePlan } from "@/components/plan-provider";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TABLES, type Guest } from "@/lib/data";
import { initials, partyStyle } from "@/lib/format";
import { cn } from "@/lib/utils";

export function GuestAvatar({ guest, className }: { guest: Guest; className?: string }) {
  return (
    <span
      aria-hidden
      style={partyStyle(guest.party)}
      className={cn("grid size-8 shrink-0 place-items-center rounded-full border text-[11px] font-semibold", className)}
    >
      {initials(guest.name)}
    </span>
  );
}

export function GuestRow({ guest }: { guest: Guest }) {
  const plan = usePlan();
  const current = plan.placements[guest.id] ?? null;
  const held = plan.heldGuestId === guest.id;
  const flagged = plan.flaggedGuestIds.has(guest.id);
  const declined = guest.rsvp === "no";

  return (
    <div
      draggable={!declined}
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", guest.id);
        e.dataTransfer.effectAllowed = "move";
        plan.setDragId(guest.id);
      }}
      onDragEnd={() => plan.setDragId(null)}
      className={cn(
        "flex items-center gap-2 rounded-lg border bg-card p-2 transition-shadow",
        !declined && "cursor-grab active:cursor-grabbing",
        held && "ring-2 ring-primary",
        flagged && "border-destructive/50 bg-destructive/5",
      )}
    >
      <button
        type="button"
        disabled={declined}
        aria-pressed={held}
        aria-label={held ? `Stop placing ${guest.name}` : `Pick up ${guest.name}, then tap a seat`}
        onClick={() => plan.holdGuest(held ? null : guest.id)}
        className="flex min-w-0 flex-1 items-center gap-2 rounded-md text-left outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed"
      >
        <GuestAvatar guest={guest} />
        <span className="min-w-0">
          <span className="block truncate text-sm font-medium">{guest.name}</span>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="truncate">{guest.party}</span>
            {guest.diet && <DietBadge diet={guest.diet} className="px-1.5 py-0 text-[10px]" />}
          </span>
        </span>
      </button>
      <Select
        value={current?.table ?? ""}
        onValueChange={(tableId) => {
          if (plan.place(guest.id, tableId)) plan.selectTable(tableId);
        }}
        disabled={declined}
      >
        <SelectTrigger size="sm" className="w-[8.5rem] text-xs" aria-label={`Table for ${guest.name}`}>
          <SelectValue placeholder="Seat at…" />
        </SelectTrigger>
        <SelectContent>
          {TABLES.map((t) => {
            const filled = (plan.seatsByTable[t.id] ?? []).filter(Boolean).length;
            const full = filled >= t.seats && current?.table !== t.id;
            return (
              <SelectItem key={t.id} value={t.id} disabled={full}>
                {t.name}
                <span className="ml-1 text-muted-foreground">
                  {filled}/{t.seats}
                </span>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
      {current && (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={`Unseat ${guest.name}`}
          onClick={() => plan.unseat(guest.id)}
        >
          <XIcon />
        </Button>
      )}
    </div>
  );
}
