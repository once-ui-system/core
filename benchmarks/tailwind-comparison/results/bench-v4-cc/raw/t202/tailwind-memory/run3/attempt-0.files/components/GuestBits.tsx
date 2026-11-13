"use client";

import { Utensils } from "lucide-react";

import { PARTY_COLORS, RSVP_LABEL, TABLES, type Guest, type Rsvp } from "@/lib/data";
import { GUEST_BY_ID } from "@/lib/plan";
import { usePlan } from "./PlanProvider";

export function PartyDot({ party }: { party: string }) {
  return (
    <span
      aria-hidden="true"
      className="inline-block size-2.5 shrink-0 rounded-full"
      style={{ backgroundColor: PARTY_COLORS[party] ?? "#57534e" }}
    />
  );
}

export function DietBadge({ diet }: { diet: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-900 ring-1 ring-amber-200">
      <Utensils className="size-3" aria-hidden="true" />
      {diet}
    </span>
  );
}

const RSVP_CLASS: Record<Rsvp, string> = {
  yes: "bg-emerald-100 text-emerald-900 ring-emerald-200",
  maybe: "bg-amber-100 text-amber-900 ring-amber-200",
  pending: "bg-stone-200 text-stone-800 ring-stone-300",
  no: "bg-rose-100 text-rose-900 ring-rose-200",
};

export function RsvpBadge({ rsvp }: { rsvp: Rsvp }) {
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ${RSVP_CLASS[rsvp]}`}>
      {RSVP_LABEL[rsvp]}
    </span>
  );
}

export function SeatSelect({ guestId, className = "" }: { guestId: string; className?: string }) {
  const plan = usePlan();
  const guest = GUEST_BY_ID.get(guestId);
  if (!guest) return null;
  if (guest.rsvp === "no") return <span className="text-sm text-stone-500">Declined</span>;
  const loc = plan.locations.get(guestId);
  return (
    <select
      aria-label={`Table for ${guest.name}`}
      value={loc?.tableId ?? ""}
      onChange={(e) => {
        const v = e.target.value;
        if (!v) plan.unseat(guestId);
        else plan.place(guestId, v);
      }}
      className={`min-h-10 rounded-lg border border-stone-300 bg-white px-2 text-sm text-stone-800 ${className}`}
    >
      <option value="">{loc ? "Unseat" : "Seat at…"}</option>
      {TABLES.map((t) => {
        const free = plan.seats[t.id].filter((x) => x === null).length;
        const label = loc && loc.tableId === t.id ? `${t.name} · seat ${loc.index + 1}` : `${t.name} · ${free} free`;
        return (
          <option key={t.id} value={t.id} disabled={free === 0 && loc?.tableId !== t.id}>
            {label}
          </option>
        );
      })}
    </select>
  );
}

/** A guest as a row: tap the name to pick them up, or use the table menu. */
export function GuestLine({
  guest,
  held,
  onHold,
  onDragStart,
  onDragEnd,
}: {
  guest: Guest;
  held: boolean;
  onHold: (id: string) => void;
  onDragStart?: (id: string) => void;
  onDragEnd?: () => void;
}) {
  const plan = usePlan();
  const flagged = plan.flaggedGuests.has(guest.id);
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        draggable
        aria-pressed={held}
        onClick={() => onHold(guest.id)}
        onDragStart={(e) => {
          e.dataTransfer.setData("text/plain", guest.id);
          e.dataTransfer.effectAllowed = "move";
          onDragStart?.(guest.id);
        }}
        onDragEnd={() => onDragEnd?.()}
        className={`min-h-11 min-w-0 flex-1 cursor-grab rounded-lg px-2 py-1 text-left transition-colors active:cursor-grabbing ${
          held ? "bg-sky-100 ring-2 ring-sky-500" : "hover:bg-stone-100"
        }`}
      >
        <span className="flex items-center gap-1.5">
          <PartyDot party={guest.party} />
          <span className="truncate text-sm font-medium text-stone-900">{guest.name}</span>
          {flagged && <span className="rounded bg-red-100 px-1 text-[10px] font-semibold uppercase text-red-800">Rule</span>}
        </span>
        <span className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-stone-500">
          {guest.party}
          {guest.rsvp !== "yes" && <RsvpBadge rsvp={guest.rsvp} />}
          {guest.diet && <DietBadge diet={guest.diet} />}
        </span>
      </button>
      <SeatSelect guestId={guest.id} className="w-[7.5rem] shrink-0" />
    </div>
  );
}
