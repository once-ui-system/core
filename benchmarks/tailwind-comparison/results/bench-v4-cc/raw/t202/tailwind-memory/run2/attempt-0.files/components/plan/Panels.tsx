"use client";

import { CircleCheck, Clock, GripVertical, Link2, MapPin, TriangleAlert, Unlink, UserMinus } from "lucide-react";
import { tables, type Guest } from "@/lib/data";
import { guestById, tableById, type RuleResult, type Seating } from "@/lib/plan";
import { initials, partyStyle, RSVP } from "@/lib/ui";
import type { BeginDrag } from "./types";

const card = "rounded-2xl border border-line bg-card p-4 shadow-sm";

/* ---------- guests waiting for a seat ---------- */

function Chip({
  g,
  armed,
  onPick,
  beginDrag,
}: {
  g: Guest;
  armed: boolean;
  onPick: (id: string) => void;
  beginDrag: BeginDrag;
}) {
  return (
    <li>
      <button
        type="button"
        aria-pressed={armed}
        onPointerDown={(e) => beginDrag(e, g.id)}
        onClick={() => onPick(g.id)}
        style={{ touchAction: "pan-y" }}
        className={`flex min-h-12 w-full select-none items-center gap-2.5 rounded-xl border bg-white px-2.5 py-1.5 text-left transition-colors hover:border-brand-500 ${
          armed ? "border-brand-600 ring-2 ring-brand-600" : "border-line"
        }`}
      >
        <span
          className="grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 text-xs font-semibold"
          style={partyStyle(g.party)}
          aria-hidden
        >
          {initials(g.name)}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium">{g.name}</span>
          <span className="block truncate text-xs text-muted">
            {g.party}
            {g.diet ? ` · ${g.diet}` : ""}
            {g.rsvp !== "yes" ? ` · ${RSVP[g.rsvp].label}` : ""}
          </span>
        </span>
        <GripVertical className="h-4 w-4 shrink-0 text-stone-400" aria-hidden />
      </button>
    </li>
  );
}

export function Tray({
  toSeat,
  unconfirmed,
  armed,
  dropActive,
  beginDrag,
  onPick,
}: {
  toSeat: Guest[];
  unconfirmed: Guest[];
  armed: string | null;
  dropActive: boolean;
  beginDrag: BeginDrag;
  onPick: (id: string) => void;
}) {
  return (
    <section
      data-tray
      aria-labelledby="tray-h"
      className={`${card} transition-shadow ${dropActive ? "ring-4 ring-amber-400" : ""}`}
    >
      <div className="flex items-baseline justify-between gap-2">
        <h2 id="tray-h" className="font-display text-lg font-semibold">
          Still to seat
        </h2>
        <span className="rounded-full bg-accent-100 px-2.5 py-0.5 text-sm font-semibold tabular-nums text-accent-800">
          {toSeat.length}
        </span>
      </div>
      <p className="mt-0.5 text-xs text-muted">Attending guests without a seat. Drop a seated guest here to unseat them.</p>

      {toSeat.length === 0 ? (
        <p className="mt-3 flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-3 text-sm text-emerald-900">
          <CircleCheck className="h-4 w-4 shrink-0" aria-hidden /> Every attending guest has a seat.
        </p>
      ) : (
        <ul className="mt-3 grid gap-2 sm:grid-cols-2 xl:max-h-[22rem] xl:grid-cols-1 xl:overflow-y-auto xl:pr-1">
          {toSeat.map((g) => (
            <Chip key={g.id} g={g} armed={armed === g.id} onPick={onPick} beginDrag={beginDrag} />
          ))}
        </ul>
      )}

      {unconfirmed.length > 0 && (
        <details className="mt-4 group">
          <summary className="flex min-h-9 cursor-pointer items-center justify-between text-sm font-medium text-ink/80">
            <span>Not confirmed yet</span>
            <span className="text-xs tabular-nums text-muted">{unconfirmed.length}</span>
          </summary>
          <ul className="mt-2 grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
            {unconfirmed.map((g) => (
              <Chip key={g.id} g={g} armed={armed === g.id} onPick={onPick} beginDrag={beginDrag} />
            ))}
          </ul>
        </details>
      )}
    </section>
  );
}

/* ---------- tables overview ---------- */

export function TableList({
  seating,
  selected,
  flaggedTables,
  onSelect,
}: {
  seating: Seating;
  selected: string | null;
  flaggedTables: Set<string>;
  onSelect: (id: string) => void;
}) {
  return (
    <section aria-labelledby="tables-h" className={card}>
      <h2 id="tables-h" className="font-display text-lg font-semibold">
        Tables
      </h2>
      <ul className="mt-3 grid grid-cols-2 gap-2">
        {tables.map((t) => {
          const filled = seating[t.id].filter(Boolean).length;
          const flagged = flaggedTables.has(t.id);
          return (
            <li key={t.id}>
              <button
                type="button"
                aria-pressed={selected === t.id}
                onClick={() => onSelect(t.id)}
                className={`flex min-h-11 w-full items-center justify-between gap-2 rounded-xl border px-3 py-2 text-left text-sm transition-colors hover:border-brand-500 ${
                  selected === t.id ? "border-brand-600 bg-brand-50" : "border-line bg-white"
                }`}
              >
                <span className="flex items-center gap-1.5 font-medium">
                  {flagged && <TriangleAlert className="h-3.5 w-3.5 text-rose-600" aria-label="Breaks a rule" />}
                  {t.name}
                </span>
                <span className={`tabular-nums ${filled === t.seats ? "font-semibold text-brand-700" : "text-muted"}`}>
                  {filled}/{t.seats}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/* ---------- selected table ---------- */

export function TableDetail({
  tableId,
  seating,
  results,
  armed,
  beginDrag,
  onPick,
  onUnseat,
}: {
  tableId: string | null;
  seating: Seating;
  results: RuleResult[];
  armed: string | null;
  beginDrag: BeginDrag;
  onPick: (id: string) => void;
  onUnseat: (id: string) => void;
}) {
  if (!tableId) {
    return (
      <section aria-labelledby="detail-h" className={card}>
        <h2 id="detail-h" className="font-display text-lg font-semibold">
          Table details
        </h2>
        <p className="mt-2 text-sm text-muted">Select a table on the plan to see who is sitting there and what they eat.</p>
      </section>
    );
  }
  const t = tableById[tableId];
  const row = seating[tableId];
  const seated = row.filter((id): id is string => id !== null).map((id) => guestById[id]);
  const diets = new Map<string, number>();
  for (const g of seated) if (g.diet) diets.set(g.diet, (diets.get(g.diet) ?? 0) + 1);
  const issues = results.filter((r) => r.status === "broken" && r.tableIds.includes(tableId));

  return (
    <section aria-labelledby="detail-h" className={card}>
      <div className="flex items-baseline justify-between gap-2">
        <h2 id="detail-h" className="font-display text-lg font-semibold">
          {t.name}
        </h2>
        <span className="text-sm tabular-nums text-muted">
          {seated.length} of {t.seats} seats
        </span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-stone-200" aria-hidden>
        <div className="h-full rounded-full bg-brand-600" style={{ width: `${(seated.length / t.seats) * 100}%` }} />
      </div>

      {issues.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {issues.map((r) => (
            <li key={r.index} className="flex gap-2 rounded-lg bg-rose-50 px-2.5 py-2 text-xs text-rose-900">
              <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
              <span>
                <span className="font-semibold">{r.title}.</span> {r.detail}
              </span>
            </li>
          ))}
        </ul>
      )}

      <ol className="mt-3 divide-y divide-line">
        {row.map((id, i) => {
          const g = id ? guestById[id] : null;
          return (
            <li key={i} className="flex min-h-11 items-center gap-2 py-1.5">
              <span className="w-5 shrink-0 text-xs tabular-nums text-muted">{i + 1}</span>
              {g ? (
                <>
                  <button
                    type="button"
                    aria-pressed={armed === g.id}
                    onPointerDown={(e) => beginDrag(e, g.id)}
                    onClick={() => onPick(g.id)}
                    style={{ touchAction: "pan-y" }}
                    className={`min-w-0 flex-1 select-none rounded-lg px-1.5 py-1 text-left ${
                      armed === g.id ? "bg-brand-50 ring-2 ring-brand-600" : "hover:bg-stone-100"
                    }`}
                  >
                    <span className="block truncate text-sm font-medium">{g.name}</span>
                    <span className="block truncate text-xs text-muted">{g.party}</span>
                  </button>
                  {g.diet && (
                    <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900">
                      {g.diet}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => onUnseat(g.id)}
                    aria-label={`Unseat ${g.name}`}
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-muted hover:bg-rose-50 hover:text-rose-700"
                  >
                    <UserMinus className="h-4 w-4" aria-hidden />
                  </button>
                </>
              ) : (
                <span className="flex-1 px-1.5 text-sm italic text-stone-400">Empty seat</span>
              )}
            </li>
          );
        })}
      </ol>

      <div className="mt-3 rounded-xl bg-stone-100 px-3 py-2.5">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">Dietary needs at this table</h3>
        {diets.size === 0 ? (
          <p className="mt-1 text-sm">None noted.</p>
        ) : (
          <ul className="mt-1 flex flex-wrap gap-1.5">
            {Array.from(diets.entries()).map(([d, n]) => (
              <li key={d} className="rounded-full bg-amber-100 px-2.5 py-0.5 text-sm text-amber-900">
                {d} <span className="font-semibold tabular-nums">× {n}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

/* ---------- couple's rules ---------- */

const KIND_ICON = { together: Link2, apart: Unlink, near: MapPin } as const;

export function RulesCard({
  results,
  broken,
  open,
  ok,
  onSelectTable,
}: {
  results: RuleResult[];
  broken: number;
  open: number;
  ok: number;
  onSelectTable: (id: string) => void;
}) {
  const order = { broken: 0, open: 1, ok: 2 } as const;
  const sorted = [...results].sort((a, b) => order[a.status] - order[b.status] || a.index - b.index);
  return (
    <section aria-labelledby="rules-h" className={card}>
      <h2 id="rules-h" className="font-display text-lg font-semibold">
        The couple&apos;s rules
      </h2>
      <p className={`mt-1 text-sm ${broken ? "font-medium text-rose-700" : "text-muted"}`} role="status">
        {broken === 0 ? "No rule is broken." : `${broken} ${broken === 1 ? "rule is" : "rules are"} broken.`}{" "}
        <span className="font-normal text-muted">
          {open > 0 ? `${open} waiting for a seat. ` : ""}
          {ok} kept.
        </span>
      </p>
      <ul className="mt-3 space-y-2">
        {sorted.map((r) => {
          const Icon = KIND_ICON[r.kind];
          const tone =
            r.status === "broken"
              ? "border-rose-200 bg-rose-50"
              : r.status === "open"
                ? "border-amber-200 bg-amber-50"
                : "border-line bg-white";
          const StatusIcon = r.status === "broken" ? TriangleAlert : r.status === "open" ? Clock : CircleCheck;
          const statusCls =
            r.status === "broken" ? "text-rose-700" : r.status === "open" ? "text-amber-700" : "text-emerald-700";
          const statusText = r.status === "broken" ? "Broken" : r.status === "open" ? "Waiting" : "Kept";
          return (
            <li key={r.index} className={`rounded-xl border p-3 ${tone}`}>
              <div className="flex items-start gap-2">
                <Icon className="mt-0.5 h-4 w-4 shrink-0 text-ink/60" aria-hidden />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium leading-snug">{r.title}</p>
                  <p className="mt-0.5 text-xs text-ink/75">{r.note}</p>
                  <p className="mt-1 text-xs">{r.detail}</p>
                  {r.tableIds.length > 0 && (
                    <p className="mt-1.5 flex flex-wrap gap-1.5">
                      {r.tableIds.map((id) => (
                        <button
                          key={id}
                          type="button"
                          onClick={() => onSelectTable(id)}
                          className="rounded-full border border-ink/15 bg-white px-2.5 py-1 text-xs font-medium hover:border-brand-500"
                        >
                          Show {tableById[id].name}
                        </button>
                      ))}
                    </p>
                  )}
                </div>
                <span className={`flex shrink-0 items-center gap-1 text-xs font-semibold ${statusCls}`}>
                  <StatusIcon className="h-3.5 w-3.5" aria-hidden />
                  {statusText}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
