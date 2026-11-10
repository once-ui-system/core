"use client";

import { useState } from "react";
import { CircleCheck, Clock, TriangleAlert, X } from "lucide-react";

import { GUESTS, PARTIES, TABLES } from "@/lib/data";
import { GUEST_BY_ID, TABLE_BY_ID } from "@/lib/plan";
import { DietBadge, GuestLine, PartyDot } from "./GuestBits";
import { usePlan } from "./PlanProvider";

const card = "rounded-xl border border-stone-200 bg-white shadow-sm";

export function TablePanel({
  tableId,
  heldId,
  onHold,
  onClose,
  onDragStart,
  onDragEnd,
}: {
  tableId: string;
  heldId: string | null;
  onHold: (id: string) => void;
  onClose: () => void;
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
}) {
  const plan = usePlan();
  const table = TABLE_BY_ID.get(tableId);
  if (!table) return null;
  const row = plan.seats[tableId];
  const filled = row.filter(Boolean).length;
  const broken = plan.brokenByTable[tableId] ?? [];
  const diets = new Map<string, number>();
  for (const gid of row) {
    const d = gid ? GUEST_BY_ID.get(gid)?.diet : null;
    if (d) diets.set(d, (diets.get(d) ?? 0) + 1);
  }
  const standard = filled - Array.from(diets.values()).reduce((a, b) => a + b, 0);
  const heldName = heldId ? GUEST_BY_ID.get(heldId)?.name : null;

  return (
    <section aria-labelledby="table-panel-title" className={card}>
      <div className="flex items-start justify-between gap-2 border-b border-stone-200 px-4 py-3">
        <div>
          <h2 id="table-panel-title" className="text-base font-semibold text-stone-900">
            {table.name}
          </h2>
          <p className="text-sm text-stone-600">
            <span className="tabular-nums">
              {filled} of {table.seats}
            </span>{" "}
            seats filled
            {table.seats - filled > 0 && <span> · {table.seats - filled} free</span>}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close table details"
          className="grid size-10 place-items-center rounded-lg text-stone-500 hover:bg-stone-100"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      </div>

      {broken.length > 0 && (
        <ul className="space-y-1.5 border-b border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
          {broken.map((r) => (
            <li key={r.index} className="flex gap-2">
              <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <span>
                <span className="font-semibold">{r.title}.</span> {r.message}
              </span>
            </li>
          ))}
        </ul>
      )}

      <div className="border-b border-stone-200 px-4 py-3">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-stone-500">Dietary needs at this table</h3>
        {filled === 0 ? (
          <p className="mt-1 text-sm text-stone-500">Nobody seated yet.</p>
        ) : (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {Array.from(diets.entries()).map(([d, n]) => (
              <span key={d} className="inline-flex items-center gap-1">
                <DietBadge diet={d} />
                <span className="text-xs tabular-nums text-stone-600">×{n}</span>
              </span>
            ))}
            <span className="inline-flex items-center rounded-full bg-stone-100 px-2 py-0.5 text-[11px] font-medium text-stone-700 ring-1 ring-stone-200">
              Standard menu ×{standard}
            </span>
          </div>
        )}
      </div>

      <ol className="divide-y divide-stone-100 px-2 py-1">
        {row.map((gid, i) => {
          const g = gid ? GUEST_BY_ID.get(gid) : undefined;
          return (
            <li key={i} className="flex items-center gap-1 py-1">
              <span className="w-6 shrink-0 text-center text-xs tabular-nums text-stone-400" aria-hidden="true">
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                {g ? (
                  <GuestLine guest={g} held={heldId === g.id} onHold={onHold} onDragStart={onDragStart} onDragEnd={onDragEnd} />
                ) : (
                  <div className="flex min-h-11 items-center justify-between gap-2 rounded-lg border border-dashed border-stone-300 px-3 text-sm text-stone-500">
                    <span>Seat {i + 1} is empty</span>
                    {heldId && heldName && (
                      <button
                        type="button"
                        onClick={() => plan.place(heldId, tableId, i)}
                        className="min-h-9 rounded-lg bg-sky-600 px-3 text-sm font-medium text-white hover:bg-sky-700"
                      >
                        Seat {heldName.split(" ")[0]} here
                      </button>
                    )}
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

export function UnseatedPanel({
  heldId,
  dragId,
  onHold,
  onDragStart,
  onDragEnd,
  onDropUnseat,
}: {
  heldId: string | null;
  dragId: string | null;
  onHold: (id: string) => void;
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
  onDropUnseat: (guestId: string) => void;
}) {
  const plan = usePlan();
  const [over, setOver] = useState(false);
  const rank = (p: string) => PARTIES.indexOf(p);
  const sorted = (list: typeof GUESTS) =>
    list.slice().sort((a, b) => rank(a.party) - rank(b.party) || a.name.localeCompare(b.name));
  const unseated = sorted(GUESTS.filter((g) => g.rsvp === "yes" && !plan.locations.has(g.id)));
  const awaiting = sorted(GUESTS.filter((g) => (g.rsvp === "maybe" || g.rsvp === "pending") && !plan.locations.has(g.id)));

  return (
    <section
      aria-labelledby="unseated-title"
      className={`${card} ${over ? "ring-2 ring-sky-500" : ""}`}
      onDragOver={(e) => {
        if (!dragId || !plan.locations.has(dragId)) return;
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOver(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        const id = dragId ?? e.dataTransfer.getData("text/plain");
        if (id) onDropUnseat(id);
      }}
    >
      <div className="flex items-center justify-between gap-2 border-b border-stone-200 px-4 py-3">
        <h2 id="unseated-title" className="text-base font-semibold text-stone-900">
          Still to seat
        </h2>
        <span className="rounded-full bg-stone-900 px-2.5 py-0.5 text-sm font-semibold tabular-nums text-white">{unseated.length}</span>
      </div>
      <div className="px-2 py-2">
        {unseated.length === 0 ? (
          <p className="flex items-center gap-2 px-2 py-3 text-sm text-emerald-800">
            <CircleCheck className="size-4" aria-hidden="true" />
            Everyone attending has a seat.
          </p>
        ) : (
          <ul className="space-y-0.5">
            {unseated.map((g) => (
              <li key={g.id}>
                <GuestLine guest={g} held={heldId === g.id} onHold={onHold} onDragStart={onDragStart} onDragEnd={onDragEnd} />
              </li>
            ))}
          </ul>
        )}
        <p className="px-2 pt-2 text-xs text-stone-500">Drop a seated guest here to unseat them.</p>
      </div>
      {awaiting.length > 0 && (
        <div className="border-t border-stone-200 px-2 py-2">
          <h3 className="px-2 pb-1 pt-1 text-xs font-semibold uppercase tracking-wide text-stone-500">
            Not confirmed yet ({awaiting.length})
          </h3>
          <ul className="space-y-0.5">
            {awaiting.map((g) => (
              <li key={g.id}>
                <GuestLine guest={g} held={heldId === g.id} onHold={onHold} onDragStart={onDragStart} onDragEnd={onDragEnd} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

export function RulesPanel({ onShowTable }: { onShowTable: (tableId: string) => void }) {
  const plan = usePlan();
  const order = { broken: 0, open: 1, ok: 2 } as const;
  const sorted = plan.rules.slice().sort((a, b) => order[a.status] - order[b.status] || a.index - b.index);
  const broken = plan.rules.filter((r) => r.status === "broken").length;
  const ok = plan.rules.filter((r) => r.status === "ok").length;
  const open = plan.rules.length - broken - ok;
  return (
    <section aria-labelledby="rules-title" className={card}>
      <div className="border-b border-stone-200 px-4 py-3">
        <h2 id="rules-title" className="text-base font-semibold text-stone-900">
          The couple's rules
        </h2>
        <p className="text-sm text-stone-600">
          <span className={broken ? "font-semibold text-red-700" : ""}>{broken} broken</span> · {ok} kept · {open} waiting on seating
        </p>
      </div>
      <ul className="divide-y divide-stone-100">
        {sorted.map((r) => {
          const Icon = r.status === "broken" ? TriangleAlert : r.status === "ok" ? CircleCheck : Clock;
          const tone =
            r.status === "broken" ? "text-red-700" : r.status === "ok" ? "text-emerald-700" : "text-stone-500";
          const statusText = r.status === "broken" ? "Broken" : r.status === "ok" ? "Kept" : "Waiting";
          return (
            <li key={r.index} className={`px-4 py-3 text-sm ${r.status === "broken" ? "bg-red-50" : ""}`}>
              <div className="flex items-start gap-2.5">
                <Icon className={`mt-0.5 size-4 shrink-0 ${tone}`} aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-stone-900">
                    <span className={`mr-1.5 text-xs font-semibold uppercase ${tone}`}>{statusText}</span>
                    {r.title}: {r.guestIds.map((id) => GUEST_BY_ID.get(id)?.name ?? id).join(" and ")}
                  </p>
                  <p className="mt-0.5 text-stone-700">{r.message}</p>
                  <p className="mt-0.5 text-xs italic text-stone-500">“{r.rule.note}”</p>
                  {r.status === "broken" && r.tableIds.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {r.tableIds.map((tid) => (
                        <button
                          key={tid}
                          type="button"
                          onClick={() => onShowTable(tid)}
                          className="min-h-9 rounded-lg border border-red-300 bg-white px-3 text-xs font-medium text-red-800 hover:bg-red-100"
                        >
                          Show {TABLES.find((t) => t.id === tid)?.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export { PartyDot };
