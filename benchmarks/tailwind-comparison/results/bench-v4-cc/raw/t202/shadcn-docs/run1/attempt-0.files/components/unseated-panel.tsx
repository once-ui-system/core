"use client";

import { CircleCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { type Guest } from "@/lib/data";
import { usePlan } from "@/components/plan-provider";
import { startGuestDrag, useGuestDrop } from "@/components/use-drop";
import { DietBadge, GuestAvatar, RsvpBadge } from "@/components/guest-bits";

function UnseatedRow({ guest }: { guest: Guest }) {
  const plan = usePlan();
  const isPicked = plan.picked === guest.id;
  return (
    <li>
      <button
        type="button"
        draggable
        onDragStart={(e) => startGuestDrag(e, guest.id)}
        onClick={() => plan.pick(isPicked ? null : guest.id)}
        aria-pressed={isPicked}
        className={cn(
          "flex min-h-12 w-full cursor-grab items-center gap-2.5 rounded-lg border border-transparent px-2 py-1.5 text-left outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50",
          isPicked && "border-primary bg-primary/10",
        )}
      >
        <GuestAvatar guest={guest} />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium">{guest.name}</span>
          <span className="block truncate text-xs text-muted-foreground">{guest.party}</span>
        </span>
        <span className="flex flex-col items-end gap-1">
          {guest.rsvp !== "yes" && <RsvpBadge rsvp={guest.rsvp} />}
          {guest.diet && <DietBadge diet={guest.diet} />}
        </span>
      </button>
    </li>
  );
}

export function UnseatedPanel() {
  const plan = usePlan();
  const drop = useGuestDrop((id) => plan.unseat(id));
  const list = plan.unseatedAttending;
  const more = plan.unconfirmedUnseated;

  return (
    <section
      {...drop.props}
      aria-labelledby="unseated-h"
      className={cn("rounded-xl border bg-card", drop.over && "border-primary ring-2 ring-primary/30")}
    >
      <div className="flex items-center gap-2 border-b px-4 py-3">
        <h2 id="unseated-h" className="text-sm font-semibold">
          Needs a seat
        </h2>
        <Badge variant={list.length ? "secondary" : "outline"} className="tabular-nums">
          {list.length}
        </Badge>
        <span className="ml-auto text-xs text-muted-foreground">Drag, or tap then tap a seat</span>
      </div>
      <div className="max-h-[26rem] overflow-y-auto p-2">
        {list.length === 0 ? (
          <p className="flex items-center gap-2 px-2 py-4 text-sm text-muted-foreground">
            <CircleCheck className="size-4 text-emerald-600" aria-hidden="true" />
            Every attending guest has a seat.
          </p>
        ) : (
          <ul className="flex flex-col gap-0.5">
            {list.map((g) => (
              <UnseatedRow key={g.id} guest={g} />
            ))}
          </ul>
        )}
        {more.length > 0 && (
          <>
            <h3 className="mt-3 px-2 pb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Not confirmed yet
            </h3>
            <ul className="flex flex-col gap-0.5">
              {more.map((g) => (
                <UnseatedRow key={g.id} guest={g} />
              ))}
            </ul>
          </>
        )}
      </div>
      <p className="border-t px-4 py-2 text-xs text-muted-foreground">Drop a seated guest here to unseat them.</p>
    </section>
  );
}
