"use client";

import * as React from "react";
import { CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { usePlan } from "@/lib/plan-store";
import { GuestChip } from "./guest-chip";

export function UnseatedStrip() {
  const { guests, unseat, dragging, setDragging, counts } = usePlan();
  const [over, setOver] = React.useState(false);
  const attending = guests.filter((g) => g.rsvp === "yes" && !g.table);
  const awaiting = guests.filter((g) => (g.rsvp === "maybe" || g.rsvp === "pending") && !g.table);
  const draggingSeated = Boolean(dragging && guests.find((g) => g.id === dragging)?.table);

  return (
    <section
      aria-labelledby="unseated-title"
      className={cn(
        "rounded-xl border bg-card p-3.5 shadow-xs transition-colors sm:p-4",
        draggingSeated && "border-dashed border-primary bg-accent/50",
        over && "ring-[3px] ring-primary",
      )}
      onDragOver={(e) => {
        if (!draggingSeated) return;
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        const id = dragging ?? e.dataTransfer.getData("text/plain");
        if (id) unseat(id);
        setDragging(null);
      }}
    >
      <div className="flex flex-wrap items-center gap-2">
        <h2 id="unseated-title" className="font-display text-lg font-semibold">
          Unseated
        </h2>
        <Badge variant="secondary" className="tabular-nums">
          {counts.unseated} attending
        </Badge>
        <p className="text-sm text-muted-foreground">
          {draggingSeated
            ? "Drop here to unseat."
            : "Tap a guest, then a seat or table. Or drag them onto the room."}
        </p>
      </div>

      {attending.length === 0 ? (
        <p className="mt-3 flex items-center gap-2 rounded-lg bg-accent px-3 py-2.5 text-sm text-accent-foreground">
          <CheckCircle2 className="size-4 shrink-0" aria-hidden />
          Everyone who is attending has a seat.
        </p>
      ) : (
        <ul className="mt-3 flex flex-wrap gap-2">
          {attending.map((g) => (
            <li key={g.id} className="max-w-full">
              <GuestChip guest={g} />
            </li>
          ))}
        </ul>
      )}

      {awaiting.length > 0 && (
        <div className="mt-4 border-t pt-3">
          <h3 className="text-sm font-medium text-muted-foreground">
            Not confirmed yet ({awaiting.length}). You can hold a seat for them.
          </h3>
          <ul className="mt-2 flex flex-wrap gap-2">
            {awaiting.map((g) => (
              <li key={g.id} className="max-w-full">
                <GuestChip guest={g} muted />
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
