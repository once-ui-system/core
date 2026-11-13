"use client";

import { AlertTriangle, ArrowRightLeft, CheckCircle2, Clock3, GripVertical, MoveRight, UserMinus, X } from "lucide-react";
import { GUESTS, RSVP_LABEL, TABLES, guestById, tableById, type Guest } from "@/lib/data";
import { filledCount, type RuleResult, type Seats } from "@/lib/plan";
import { RSVP_STYLE, partyStyle } from "@/lib/ui";
import type { PlanCtl } from "./Floor";

export function Card({
  title,
  aside,
  children,
  className = "",
  ...rest
}: {
  title: React.ReactNode;
  aside?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
} & Omit<React.ComponentProps<"section">, "title">) {
  return (
    <section {...rest} className={`rounded-2xl border border-stone-200 bg-white shadow-sm ${className}`}>
      <header className="flex items-center justify-between gap-3 border-b border-stone-100 px-4 py-3">
        <h2 className="font-display text-lg font-semibold tracking-tight">{title}</h2>
        {aside}
      </header>
      {children}
    </section>
  );
}

function DietPill({ diet }: { diet: string }) {
  return (
    <span className="inline-flex items-center rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-900 ring-1 ring-inset ring-yellow-600/25">
      {diet}
    </span>
  );
}

/* ---------------------------------------------------------------- unseated */

export function UnseatedPanel({
  tableOf,
  ctl,
  onChipClick,
}: {
  tableOf: Record<string, string>;
  ctl: PlanCtl;
  onChipClick: (guestId: string) => void;
}) {
  const open = GUESTS.filter((g) => g.rsvp === "yes" && !tableOf[g.id]);
  const unsure = GUESTS.filter((g) => (g.rsvp === "maybe" || g.rsvp === "pending") && !tableOf[g.id]);
  const declined = GUESTS.filter((g) => g.rsvp === "no").length;
  const hover = ctl.hover === "pool";

  const renderChip = (g: Guest) => (
    <GuestChipButton key={g.id} guest={g} ctl={ctl} onClick={() => onChipClick(g.id)} />
  );

  return (
    <Card
      title="Needs a seat"
      aside={
        <span className="rounded-full bg-stone-900 px-2.5 py-0.5 text-sm font-semibold tabular-nums text-white" aria-label={`${open.length} attending guests unseated`}>
          {open.length}
        </span>
      }
    >
      <div data-drop="pool" className={`space-y-3 p-3 transition-colors ${hover ? "bg-teal-50" : ""}`}>
        {open.length === 0 ? (
          <p className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-900">
            <CheckCircle2 className="size-4" aria-hidden /> Every attending guest has a seat.
          </p>
        ) : (
          <ul className="space-y-1.5">{open.map(renderChip)}</ul>
        )}
        {unsure.length > 0 ? (
          <div>
            <h3 className="mb-1.5 px-1 text-xs font-semibold uppercase tracking-wide text-stone-600">
              Not confirmed ({unsure.length})
            </h3>
            <ul className="space-y-1.5">{unsure.map(renderChip)}</ul>
          </div>
        ) : null}
        <p className="px-1 text-xs text-stone-600">
          Drag a guest onto a seat or table, or tap a guest and then a seat.
          {declined > 0 ? ` ${declined} declined guest is not listed.` : ""}
        </p>
      </div>
    </Card>
  );
}

function GuestChipButton({ guest, ctl, onClick }: { guest: Guest; ctl: PlanCtl; onClick: () => void }) {
  const armed = ctl.armed === guest.id;
  const dragging = ctl.dragId === guest.id;
  const style = partyStyle(guest.party);
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        aria-pressed={armed}
        onPointerDown={(e) => ctl.onGuestPointerDown(e, guest.id)}
        className={`flex min-h-12 w-full cursor-grab select-none items-center gap-2.5 rounded-xl border px-2.5 py-1.5 text-left transition-colors [touch-action:pan-y] ${
          armed ? "border-teal-700 bg-teal-50 ring-2 ring-teal-600" : "border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50"
        } ${dragging ? "opacity-40" : ""}`}
      >
        <GripVertical className="size-4 shrink-0 text-stone-400" aria-hidden />
        <span className={`size-2.5 shrink-0 rounded-full ${style.dot}`} aria-hidden />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold">{guest.name}</span>
          <span className="block truncate text-xs text-stone-600">{guest.party}</span>
        </span>
        {guest.diet ? <DietPill diet={guest.diet} /> : null}
        {guest.rsvp !== "yes" ? (
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${RSVP_STYLE[guest.rsvp]}`}>
            {RSVP_LABEL[guest.rsvp]}
          </span>
        ) : null}
      </button>
    </li>
  );
}

/* ------------------------------------------------------------------- rules */

const RULE_ICON = {
  broken: <AlertTriangle className="size-4 text-red-700" aria-hidden />,
  ok: <CheckCircle2 className="size-4 text-emerald-700" aria-hidden />,
  open: <Clock3 className="size-4 text-stone-500" aria-hidden />,
};
const RULE_WORD = { broken: "Broken", ok: "Kept", open: "Waiting" };

export function RulesPanel({
  rules,
  onPick,
}: {
  rules: RuleResult[];
  onPick: (tableId: string) => void;
}) {
  const broken = rules.filter((r) => r.status === "broken").length;
  const ok = rules.filter((r) => r.status === "ok").length;
  const open = rules.filter((r) => r.status === "open").length;
  return (
    <Card
      title="The couple's rules"
      aside={
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
            broken ? "bg-red-100 text-red-800" : "bg-emerald-100 text-emerald-800"
          }`}
        >
          {broken ? `${broken} broken` : "All kept"}
        </span>
      }
    >
      <p className="px-4 pt-3 text-sm text-stone-700" aria-live="polite">
        {broken} broken, {open} waiting for seats, {ok} kept.
      </p>
      <ul className="space-y-2 p-3">
        {rules.map((r) => {
          const target = r.tables[0];
          const check = r.rule.check;
          return (
            <li
              key={r.index}
              className={`rounded-xl border p-3 ${
                r.status === "broken" ? "border-red-300 bg-red-50" : "border-stone-200 bg-stone-50/60"
              }`}
            >
              <div className="flex items-start gap-2.5">
                <span className="mt-0.5 shrink-0">{RULE_ICON[r.status]}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold leading-snug">
                    <span className="sr-only">{RULE_WORD[r.status]}: </span>
                    {r.title}
                  </p>
                  <p className={`mt-0.5 text-sm ${r.status === "broken" ? "font-medium text-red-800" : "text-stone-700"}`}>
                    {r.detail}
                  </p>
                  <p className="mt-0.5 text-xs text-stone-600">{r.rule.note}</p>
                  {check ? <p className="mt-1.5 rounded-md bg-amber-50 px-2 py-1 text-xs text-amber-900">{check}</p> : null}
                  {target && r.status === "broken" ? (
                    <button
                      type="button"
                      onClick={() => onPick(target)}
                      className="mt-2 inline-flex min-h-9 items-center gap-1 rounded-lg bg-white px-2.5 text-xs font-semibold text-red-800 ring-1 ring-red-300 hover:bg-red-100"
                    >
                      Show {tableById(target).name} <MoveRight className="size-3.5" aria-hidden />
                    </button>
                  ) : null}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

/* ------------------------------------------------------------- table detail */

export function TablePanel({
  seats,
  rules,
  selected,
  ctl,
  onSelect,
  onMove,
  onUnseat,
  onClose,
  panelRef,
}: {
  seats: Seats;
  rules: RuleResult[];
  selected: string | null;
  ctl: PlanCtl;
  onSelect: (id: string) => void;
  onMove: (guestId: string, tableId: string) => void;
  onUnseat: (guestId: string) => void;
  onClose: () => void;
  panelRef: React.RefObject<HTMLElement | null>;
}) {
  if (!selected) {
    return (
      <Card title="Tables" id="table-panel" ref={panelRef}>
        <ul className="divide-y divide-stone-100">
          {TABLES.map((t) => {
            const filled = filledCount(seats, t.id);
            const issues = rules.filter((r) => r.status === "broken" && r.tables.includes(t.id)).length;
            return (
              <li key={t.id}>
                <button
                  type="button"
                  onClick={() => onSelect(t.id)}
                  className="flex min-h-12 w-full items-center gap-3 px-4 py-2 text-left hover:bg-stone-50"
                >
                  <span className="w-20 text-sm font-semibold">{t.name}</span>
                  <span className="h-2 flex-1 overflow-hidden rounded-full bg-stone-100" aria-hidden>
                    <span
                      className={`block h-full rounded-full ${filled === t.seats ? "bg-teal-700" : "bg-teal-500/70"}`}
                      style={{ width: `${(filled / t.seats) * 100}%` }}
                    />
                  </span>
                  <span className="w-12 text-right text-sm tabular-nums text-stone-700">
                    {filled}/{t.seats}
                  </span>
                  {issues > 0 ? <AlertTriangle className="size-4 text-red-700" aria-label="Rule broken" /> : <span className="size-4" />}
                </button>
              </li>
            );
          })}
        </ul>
        <p className="border-t border-stone-100 px-4 py-3 text-sm text-stone-600">
          Select a table on the plan, or here, to see its guests and dietary needs.
        </p>
      </Card>
    );
  }

  const table = tableById(selected);
  const row = seats[selected] ?? [];
  const filled = filledCount(seats, selected);
  const issues = rules.filter((r) => r.status === "broken" && r.tables.includes(selected));
  const diets: Record<string, number> = {};
  for (const id of row) {
    if (!id) continue;
    const d = guestById(id).diet;
    if (d) diets[d] = (diets[d] ?? 0) + 1;
  }
  const free = table.seats - filled;
  const otherTables = TABLES.filter((t) => t.id !== selected && filledCount(seats, t.id) < t.seats);

  return (
    <Card
      title={table.name}
      id="table-panel"
      ref={panelRef}
      aside={
        <div className="flex items-center gap-2">
          <span className="text-sm tabular-nums text-stone-700">
            {filled} of {table.seats} seats
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close table details"
            className="grid size-9 place-items-center rounded-lg text-stone-600 hover:bg-stone-100"
          >
            <X className="size-4" aria-hidden />
          </button>
        </div>
      }
    >
      <div className="space-y-3 p-3">
        {issues.length > 0 ? (
          <ul className="space-y-1.5">
            {issues.map((r) => (
              <li key={r.index} className="flex items-start gap-2 rounded-lg bg-red-50 p-2.5 text-sm text-red-900 ring-1 ring-red-200">
                <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
                <span>
                  <span className="font-semibold">{r.title}.</span> {r.detail}
                </span>
              </li>
            ))}
          </ul>
        ) : null}

        <div>
          <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-stone-600">Dietary needs at this table</h3>
          {Object.keys(diets).length === 0 ? (
            <p className="text-sm text-stone-700">No dietary needs recorded.</p>
          ) : (
            <ul className="flex flex-wrap gap-1.5">
              {Object.entries(diets).map(([d, n]) => (
                <li key={d} className="rounded-full bg-yellow-100 px-2.5 py-1 text-xs font-semibold text-yellow-900 ring-1 ring-inset ring-yellow-600/25">
                  {n} × {d}
                </li>
              ))}
            </ul>
          )}
        </div>

        <ol className="space-y-1.5">
          {row.map((id, i) => {
            if (!id) {
              return (
                <li
                  key={`free-${i}`}
                  className="flex min-h-11 items-center gap-3 rounded-xl border border-dashed border-stone-300 px-3 text-sm text-stone-500"
                >
                  <span className="w-5 text-xs tabular-nums">{i + 1}</span>
                  {ctl.armed ? (
                    <button
                      type="button"
                      onClick={() => ctl.onSeatClick(selected, i)}
                      className="font-semibold text-teal-800 underline underline-offset-2"
                    >
                      Seat {guestById(ctl.armed).name} here
                    </button>
                  ) : (
                    "Empty seat"
                  )}
                </li>
              );
            }
            const g = guestById(id);
            return (
              <li key={id} className="rounded-xl border border-stone-200 bg-white p-2.5">
                <div className="flex items-center gap-2.5">
                  <span className="w-5 text-xs tabular-nums text-stone-500">{i + 1}</span>
                  <span className={`size-2.5 shrink-0 rounded-full ${partyStyle(g.party).dot}`} aria-hidden />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">{g.name}</span>
                    <span className="block truncate text-xs text-stone-600">{g.party}</span>
                  </span>
                  {g.diet ? <DietPill diet={g.diet} /> : <span className="text-xs text-stone-500">No requirements</span>}
                </div>
                <div className="mt-2 flex items-center gap-2 pl-7">
                  <label className="sr-only" htmlFor={`mv-${g.id}`}>
                    Move {g.name} to another table
                  </label>
                  <span className="relative">
                    <ArrowRightLeft className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-stone-600" aria-hidden />
                    <select
                      id={`mv-${g.id}`}
                      value=""
                      onChange={(e) => e.target.value && onMove(g.id, e.target.value)}
                      className="min-h-10 rounded-lg border border-stone-300 bg-white py-1 pl-8 pr-2 text-sm font-medium text-stone-800"
                    >
                      <option value="">Move to…</option>
                      {otherTables.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name} ({t.seats - filledCount(seats, t.id)} free)
                        </option>
                      ))}
                    </select>
                  </span>
                  <button
                    type="button"
                    onClick={() => onUnseat(g.id)}
                    className="inline-flex min-h-10 items-center gap-1.5 rounded-lg px-3 text-sm font-semibold text-red-800 ring-1 ring-red-200 hover:bg-red-50"
                  >
                    <UserMinus className="size-4" aria-hidden /> Unseat
                  </button>
                </div>
              </li>
            );
          })}
        </ol>
        {free === 0 ? <p className="text-sm text-stone-600">This table is full.</p> : null}
      </div>
    </Card>
  );
}
