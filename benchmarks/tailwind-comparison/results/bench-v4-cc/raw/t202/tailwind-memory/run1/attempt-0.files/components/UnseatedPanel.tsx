"use client";

import { GripVertical } from "lucide-react";
import type { PointerEvent } from "react";
import { guests, tables, type Guest } from "@/lib/data";
import { usePlan } from "@/lib/plan";
import { Card, DietBadge, PartyDot, RsvpBadge } from "./ui";

function GuestRow({ guest }: { guest: Guest }) {
  const plan = usePlan();
  const held = plan.holding === guest.id;
  const dragging = plan.drag?.guestId === guest.id;

  const onPointerDown = (e: PointerEvent<HTMLLIElement>) => {
    const el = e.target as Element;
    if (el.closest("button,select,option")) return;
    if (e.pointerType === "touch" && !el.closest("[data-handle]")) return;
    plan.startDrag(e, guest.id);
  };

  return (
    <li
      onPointerDown={onPointerDown}
      className={`flex items-center gap-2 rounded-xl px-1.5 py-2 ${
        held ? "bg-teal-50 ring-1 ring-teal-600" : "hover:bg-stone-50"
      } ${dragging ? "opacity-40" : ""}`}
    >
      <span
        data-handle
        aria-hidden
        className="grid size-9 shrink-0 cursor-grab place-items-center text-stone-400"
        style={{ touchAction: "none" }}
      >
        <GripVertical className="size-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5 text-sm font-medium text-stone-900">
          <PartyDot party={guest.party} />
          <span className="truncate">{guest.name}</span>
        </span>
        <span className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-stone-500">
          {guest.party}
          {guest.diet ? <DietBadge diet={guest.diet} /> : null}
          {guest.rsvp !== "yes" ? <RsvpBadge rsvp={guest.rsvp} /> : null}
        </span>
      </span>
      <select
        aria-label={`Seat ${guest.name} at a table`}
        value=""
        onChange={(e) => e.target.value && plan.place(guest.id, e.target.value)}
        className="min-h-11 w-24 rounded-lg border border-stone-200 bg-white px-1.5 text-xs text-stone-700"
      >
        <option value="">Seat at…</option>
        {tables.map((t) => {
          const free = t.seats - (plan.filled[t.id] ?? 0);
          return (
            <option key={t.id} value={t.id} disabled={free === 0}>
              {t.name} ({free} free)
            </option>
          );
        })}
      </select>
      <button
        type="button"
        aria-pressed={held}
        onClick={() => plan.hold(held ? null : guest.id)}
        className={`min-h-11 rounded-lg border px-3 text-xs font-medium ${
          held ? "border-teal-700 bg-teal-700 text-white" : "border-stone-200 text-stone-700 hover:bg-stone-100"
        }`}
      >
        {held ? "Placing" : "Place"}
      </button>
    </li>
  );
}

export default function UnseatedPanel() {
  const plan = usePlan();
  const toSeat = guests.filter((x) => x.rsvp === "yes" && !plan.seats[x.id]);
  const unconfirmed = guests.filter((x) => (x.rsvp === "maybe" || x.rsvp === "pending") && !plan.seats[x.id]);
  const overZone = plan.drag?.over?.kind === "unseat";

  return (
    <Card
      title={`Attending, not seated (${toSeat.length})`}
      data-drop="unseat"
      className={overZone ? "ring-2 ring-teal-500" : plan.drag ? "ring-1 ring-teal-300" : ""}
    >
      {toSeat.length === 0 ? (
        <p className="px-4 py-4 text-sm text-emerald-700">Everyone who is attending has a seat.</p>
      ) : (
        <ul className="p-1.5">
          {toSeat.map((gst) => (
            <GuestRow key={gst.id} guest={gst} />
          ))}
        </ul>
      )}
      {plan.drag ? (
        <p className="border-t border-stone-100 px-4 py-2 text-xs text-teal-800">Drop here to unseat.</p>
      ) : null}
      {unconfirmed.length > 0 ? (
        <details className="border-t border-stone-100">
          <summary className="flex min-h-11 cursor-pointer items-center px-4 text-sm font-medium text-stone-700">
            Not confirmed yet ({unconfirmed.length})
          </summary>
          <ul className="p-1.5 pt-0">
            {unconfirmed.map((gst) => (
              <GuestRow key={gst.id} guest={gst} />
            ))}
          </ul>
        </details>
      ) : null}
    </Card>
  );
}
