"use client";

import { TriangleAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { GUEST_BY_ID, TABLES, type PlanTable } from "@/lib/data";
import { usePlan } from "@/components/plan-provider";
import { startGuestDrag, useGuestDrop } from "@/components/use-drop";
import { DietBadge, GuestAvatar } from "@/components/guest-bits";

function SeatRow({ table, index }: { table: PlanTable; index: number }) {
  const plan = usePlan();
  const guestId = plan.seats[table.id][index];
  const guest = guestId ? GUEST_BY_ID[guestId] : null;
  const drop = useGuestDrop((id) => plan.place(id, table.id, index));
  const isPicked = !!guest && plan.picked === guest.id;
  const flagged = !!guest && plan.flaggedGuests.has(guest.id);

  return (
    <li>
      <button
        type="button"
        draggable={!!guest}
        onDragStart={guest ? (e) => startGuestDrag(e, guest.id) : undefined}
        {...drop.props}
        onClick={() => plan.activateSeat(table.id, index)}
        aria-pressed={guest ? isPicked : undefined}
        aria-label={`${table.name}, seat ${index + 1}: ${guest ? guest.name : "empty"}`}
        className={cn(
          "flex min-h-11 w-full items-center gap-2.5 rounded-lg border px-2 py-1 text-left text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
          guest ? "cursor-grab bg-background hover:bg-accent" : "border-dashed text-muted-foreground hover:bg-accent/60",
          !guest && plan.picked && "border-primary/60 bg-primary/5",
          flagged && "border-destructive/50 bg-destructive/5",
          isPicked && "border-primary bg-primary/10",
          drop.over && "border-primary bg-primary/10",
        )}
      >
        <span className="w-4 shrink-0 text-center text-xs tabular-nums text-muted-foreground">{index + 1}</span>
        {guest ? (
          <>
            <GuestAvatar guest={guest} className="size-7" />
            <span className="min-w-0 flex-1">
              <span className="block truncate font-medium">{guest.name}</span>
              <span className="block truncate text-xs text-muted-foreground">{guest.party}</span>
            </span>
            {guest.diet && <DietBadge diet={guest.diet} />}
          </>
        ) : (
          <span>Empty seat</span>
        )}
      </button>
    </li>
  );
}

function TableCard({ table }: { table: PlanTable }) {
  const plan = usePlan();
  const drop = useGuestDrop((id) => plan.place(id, table.id));
  const count = plan.filled(table.id);
  const flagged = plan.flaggedTables.has(table.id);
  const selected = plan.selectedTable === table.id;

  return (
    <section
      {...drop.props}
      aria-label={table.name}
      className={cn(
        "rounded-xl border bg-card p-2",
        flagged && "border-destructive/60",
        selected && "ring-2 ring-primary/40",
        drop.over && "border-primary ring-2 ring-primary/40",
      )}
    >
      <button
        type="button"
        onClick={() => plan.activateTable(table.id)}
        aria-pressed={selected}
        className="mb-1.5 flex min-h-11 w-full items-center gap-2 rounded-lg px-2 text-left outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50"
      >
        <span className="font-semibold">{table.name}</span>
        <span className="text-xs text-muted-foreground">{table.shape === "long" ? "Long table" : "Round table"}</span>
        {flagged && (
          <Badge variant="destructive" className="gap-1">
            <TriangleAlert aria-hidden="true" /> Rule broken
          </Badge>
        )}
        <span className="ml-auto text-sm tabular-nums text-muted-foreground">
          {count}/{table.seats}
        </span>
      </button>
      <ul className="flex flex-col gap-1">
        {Array.from({ length: table.seats }, (_, i) => (
          <SeatRow key={i} table={table} index={i} />
        ))}
      </ul>
    </section>
  );
}

export function TableList() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {TABLES.map((t) => (
        <TableCard key={t.id} table={t} />
      ))}
    </div>
  );
}
