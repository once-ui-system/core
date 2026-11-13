"use client";

import { useState, type DragEvent } from "react";
import { CircleCheck, CircleDashed, TriangleAlert, UserMinus, Search, Armchair } from "lucide-react";
import { TABLES, type Guest } from "@/lib/data";
import { guestById, initials, partyColor, tableById } from "@/lib/plan";
import { usePlan } from "./PlanProvider";

const card = "rounded-2xl border border-stone-200 bg-white shadow-sm";

export function Avatar({ guest, size = "md" }: { guest: Guest; size?: "sm" | "md" }) {
  return (
    <span
      aria-hidden="true"
      className={`grid shrink-0 place-items-center rounded-full font-semibold text-white ${
        size === "sm" ? "size-8 text-[11px]" : "size-9 text-xs"
      }`}
      style={{ backgroundColor: partyColor(guest.party) }}
    >
      {initials(guest.name)}
    </span>
  );
}

export function DietBadge({ diet }: { diet: string }) {
  return (
    <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900">
      {diet}
    </span>
  );
}

/* ------------------------------------ stats ----------------------------------- */

export function StatsStrip() {
  const { seatedCount, unseatedAttending, totalSeats, results, perTable, selectedTable, selectTable } = usePlan();
  const broken = results.filter((r) => r.status === "broken").length;
  const free = totalSeats - seatedCount;

  const stats = [
    { label: "Seated", value: seatedCount, hint: `of ${totalSeats} seats` },
    { label: "Unseated", value: unseatedAttending.length, hint: "attending, need a seat" },
    { label: "Free seats", value: free, hint: "across all tables" },
    { label: "Broken rules", value: broken, hint: broken === 0 ? "all clear" : "need attention", alert: broken > 0 },
  ];

  return (
    <div className="mb-4 space-y-3">
      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className={`${card} px-4 py-3`}>
            <dt className="text-xs font-medium uppercase tracking-wide text-stone-500">{s.label}</dt>
            <dd className="mt-0.5 flex items-baseline gap-2">
              <span
                className={`text-3xl font-semibold tabular-nums ${s.alert ? "text-red-700" : "text-stone-900"}`}
              >
                {s.value}
              </span>
              <span className="truncate text-xs text-stone-600">{s.hint}</span>
            </dd>
          </div>
        ))}
      </dl>

      <ul aria-label="Guests per table" className="flex gap-2 overflow-x-auto pb-1">
        {TABLES.map((t) => {
          const n = perTable[t.id];
          const active = selectedTable === t.id;
          return (
            <li key={t.id} className="shrink-0">
              <button
                type="button"
                aria-pressed={active}
                onClick={() => selectTable(active ? null : t.id)}
                className={`flex min-h-11 items-center gap-2.5 rounded-xl border px-3 text-sm ${
                  active
                    ? "border-brand-600 bg-brand-50 text-brand-900"
                    : "border-stone-200 bg-white text-stone-700 hover:border-stone-300"
                }`}
              >
                <span className="font-medium">{t.name}</span>
                <span className="tabular-nums text-stone-600">
                  {n}/{t.seats}
                </span>
                <span aria-hidden="true" className="h-1.5 w-10 overflow-hidden rounded-full bg-stone-200">
                  <span
                    className={`block h-full rounded-full ${n >= t.seats ? "bg-brand-600" : "bg-brand-300"}`}
                    style={{ width: `${(n / t.seats) * 100}%` }}
                  />
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* -------------------------------- unseated list ------------------------------- */

function GuestChip({ guest }: { guest: Guest }) {
  const { selectedGuest, selectGuest } = usePlan();
  const active = selectedGuest === guest.id;
  return (
    <li>
      <button
        type="button"
        aria-pressed={active}
        draggable
        onDragStart={(e: DragEvent) => {
          e.dataTransfer.setData("text/plain", guest.id);
          e.dataTransfer.effectAllowed = "move";
        }}
        onClick={() => selectGuest(active ? null : guest.id)}
        className={`flex min-h-14 w-full items-center gap-3 rounded-xl border px-3 py-2 text-left transition-colors ${
          active
            ? "border-brand-600 bg-brand-50 ring-1 ring-brand-600"
            : "border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50"
        }`}
      >
        <Avatar guest={guest} />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-stone-900">{guest.name}</span>
          <span className="block truncate text-xs text-stone-500">
            {guest.party}
            {guest.rsvp !== "yes" ? ` · ${guest.rsvp === "maybe" ? "maybe" : "awaiting reply"}` : ""}
          </span>
        </span>
        {guest.diet ? <DietBadge diet={guest.diet} /> : null}
      </button>
    </li>
  );
}

export function UnseatedPanel() {
  const { unseatedAttending, unseatedUnconfirmed, where, unseat } = usePlan();
  const [q, setQ] = useState("");
  const [over, setOver] = useState(false);
  const match = (g: Guest) => !q.trim() || `${g.name} ${g.party}`.toLowerCase().includes(q.trim().toLowerCase());
  const list = unseatedAttending.filter(match);
  const more = unseatedUnconfirmed.filter(match);

  return (
    <section
      aria-labelledby="unseated-title"
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        const id = e.dataTransfer.getData("text/plain");
        if (where[id]) unseat(id);
      }}
      className={`${card} p-4 transition-colors ${over ? "border-brand-600 bg-brand-50" : ""}`}
    >
      <div className="flex items-center justify-between gap-2">
        <h2 id="unseated-title" className="text-base font-semibold text-stone-900">
          Needs a seat
        </h2>
        <span className="rounded-full bg-stone-900 px-2.5 py-0.5 text-xs font-semibold tabular-nums text-white">
          {unseatedAttending.length}
        </span>
      </div>
      <p className="mt-0.5 text-xs text-stone-500">
        {over ? "Drop to unseat this guest." : "Attending guests without a seat. Tap one, then tap a seat, or drag."}
      </p>

      <label className="relative mt-3 block">
        <span className="sr-only">Find an unseated guest</span>
        <Search size={15} aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Find a guest"
          className="min-h-10 w-full rounded-lg border border-stone-300 bg-white pl-9 pr-3 text-sm placeholder:text-stone-500"
        />
      </label>

      {list.length > 0 ? (
        <ul className="mt-3 max-h-80 space-y-2 overflow-y-auto pr-0.5">
          {list.map((g) => (
            <GuestChip key={g.id} guest={g} />
          ))}
        </ul>
      ) : (
        <p className="mt-3 flex items-center gap-2 rounded-xl bg-stone-50 px-3 py-3 text-sm text-stone-600">
          <CircleCheck size={16} aria-hidden="true" className="text-brand-600" />
          {q ? "No unseated guest matches." : "Every attending guest has a seat."}
        </p>
      )}

      {more.length > 0 ? (
        <details className="mt-3 group">
          <summary className="flex min-h-10 cursor-pointer items-center justify-between rounded-lg px-1 text-sm font-medium text-stone-700">
            Not confirmed yet
            <span className="text-xs tabular-nums text-stone-500">{more.length}</span>
          </summary>
          <ul className="mt-2 space-y-2">
            {more.map((g) => (
              <GuestChip key={g.id} guest={g} />
            ))}
          </ul>
        </details>
      ) : null}
    </section>
  );
}

/* --------------------------------- table detail -------------------------------- */

export function TablePanel() {
  const { selectedTable, seats, perTable, flagsByTable, selectedGuest, selectGuest, unseat, place } = usePlan();
  const table = selectedTable ? tableById[selectedTable] : null;

  if (!table) {
    return (
      <section aria-labelledby="table-title" className={`${card} p-4`}>
        <h2 id="table-title" className="text-base font-semibold text-stone-900">
          Table details
        </h2>
        <p className="mt-2 flex items-start gap-2 text-sm text-stone-500">
          <Armchair size={16} aria-hidden="true" className="mt-0.5 shrink-0" />
          Select a table to see who sits there and what they can eat.
        </p>
      </section>
    );
  }

  const guests = seats[table.id].flatMap((id) => (id ? [guestById[id]] : []));
  const free = table.seats - perTable[table.id];
  const flags = flagsByTable[table.id] ?? [];
  const dietCounts = new Map<string, number>();
  for (const g of guests) if (g.diet) dietCounts.set(g.diet, (dietCounts.get(g.diet) ?? 0) + 1);
  const targets = TABLES.filter((t) => t.id !== table.id && perTable[t.id] < t.seats);

  return (
    <section aria-labelledby="table-title" className={`${card} p-4`}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 id="table-title" className="text-base font-semibold text-stone-900">
            {table.name}
          </h2>
          <p className="text-xs text-stone-500">
            {guests.length} of {table.seats} seats filled · {free} free
          </p>
        </div>
        {free > 0 && selectedGuest ? (
          <button
            type="button"
            onClick={() => place(selectedGuest, table.id)}
            className="min-h-10 rounded-lg bg-brand-800 px-3 text-sm font-medium text-white hover:bg-brand-900"
          >
            Seat here
          </button>
        ) : null}
      </div>

      {flags.length > 0 ? (
        <ul className="mt-3 space-y-1.5">
          {flags.map((r) => (
            <li key={r.id} className="flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-900">
              <TriangleAlert size={14} aria-hidden="true" className="mt-0.5 shrink-0" />
              <span>
                <strong className="font-semibold">{r.title}.</strong> {r.detail}
              </span>
            </li>
          ))}
        </ul>
      ) : null}

      <h3 className="mt-4 text-xs font-semibold uppercase tracking-wide text-stone-500">Dietary needs</h3>
      {dietCounts.size > 0 ? (
        <ul className="mt-1.5 flex flex-wrap gap-1.5">
          {Array.from(dietCounts).map(([diet, n]) => (
            <li key={diet} className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-900">
              {n} × {diet}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-1 text-sm text-stone-500">None at this table.</p>
      )}

      <h3 className="mt-4 text-xs font-semibold uppercase tracking-wide text-stone-500">Guests</h3>
      {guests.length === 0 ? (
        <p className="mt-1 text-sm text-stone-500">Nobody is seated here yet.</p>
      ) : (
        <ul className="mt-1.5 divide-y divide-stone-100">
          {guests.map((g) => {
            const active = selectedGuest === g.id;
            return (
              <li key={g.id} className={`flex items-center gap-2 py-2 ${active ? "bg-brand-50" : ""}`}>
                <button
                  type="button"
                  aria-pressed={active}
                  onClick={() => selectGuest(active ? null : g.id)}
                  className="flex min-h-11 min-w-0 flex-1 items-center gap-3 rounded-lg text-left"
                >
                  <Avatar guest={g} size="sm" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-stone-900">{g.name}</span>
                    <span className="block truncate text-xs text-stone-500">
                      {g.diet ? <span className="font-medium text-amber-800">{g.diet}</span> : "No dietary needs"}
                      {" · "}
                      {g.party}
                    </span>
                  </span>
                </button>
                <select
                  aria-label={`Move ${g.name} to another table`}
                  value=""
                  onChange={(e) => {
                    if (e.target.value) place(g.id, e.target.value);
                  }}
                  className="min-h-10 w-24 rounded-lg border border-stone-300 bg-white px-1.5 text-xs text-stone-700"
                >
                  <option value="">Move to…</option>
                  {targets.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.seats - perTable[t.id]} free)
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => unseat(g.id)}
                  aria-label={`Unseat ${g.name}`}
                  title="Unseat"
                  className="grid size-10 shrink-0 place-items-center rounded-lg border border-stone-300 text-stone-600 hover:border-red-300 hover:bg-red-50 hover:text-red-700"
                >
                  <UserMinus size={16} aria-hidden="true" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
      {free > 0 ? (
        <p className="mt-3 rounded-lg bg-stone-50 px-3 py-2 text-xs text-stone-600">
          {free} empty {free === 1 ? "seat" : "seats"}. Pick a guest from the list, then tap an empty seat.
        </p>
      ) : null}
    </section>
  );
}

/* ----------------------------------- rules ------------------------------------ */

export function RulesPanel() {
  const { results, selectTable } = usePlan();
  const order = { broken: 0, open: 1, ok: 2 } as const;
  const sorted = [...results].sort((a, b) => order[a.status] - order[b.status]);
  const broken = results.filter((r) => r.status === "broken").length;
  const open = results.filter((r) => r.status === "open").length;
  const ok = results.filter((r) => r.status === "ok").length;

  return (
    <section aria-labelledby="rules-title" className={`${card} p-4`}>
      <h2 id="rules-title" className="text-base font-semibold text-stone-900">
        The couple&apos;s rules
      </h2>
      <p className="mt-0.5 text-xs text-stone-500" aria-live="polite">
        {broken > 0 ? (
          <span className="font-semibold text-red-700">
            {broken} broken
          </span>
        ) : (
          <span className="font-semibold text-brand-700">None broken</span>
        )}
        {" · "}
        {open} waiting for a seat · {ok} kept
      </p>
      <ul className="mt-3 space-y-2">
        {sorted.map((r) => {
          const Icon = r.status === "broken" ? TriangleAlert : r.status === "open" ? CircleDashed : CircleCheck;
          const tone =
            r.status === "broken"
              ? "border-red-200 bg-red-50 text-red-900"
              : r.status === "open"
                ? "border-stone-200 bg-stone-50 text-stone-800"
                : "border-brand-100 bg-brand-50 text-brand-900";
          const word = r.status === "broken" ? "Broken" : r.status === "open" ? "Open" : "Kept";
          const body = (
            <>
              <Icon size={16} aria-hidden="true" className="mt-0.5 shrink-0" />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium">
                  <span className="sr-only">{word}: </span>
                  {r.title}
                </span>
                <span className="block text-xs opacity-90">{r.detail}</span>
                <span className="mt-0.5 block text-xs italic opacity-70">{r.rule.note}</span>
              </span>
            </>
          );
          return (
            <li key={r.id}>
              {r.tableIds.length > 0 ? (
                <button
                  type="button"
                  onClick={() => selectTable(r.tableIds[0])}
                  className={`flex min-h-11 w-full items-start gap-2.5 rounded-xl border px-3 py-2.5 text-left ${tone}`}
                >
                  {body}
                </button>
              ) : (
                <div className={`flex items-start gap-2.5 rounded-xl border px-3 py-2.5 ${tone}`}>{body}</div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
