"use client";

import { CircleCheck, Clock, Hand, TriangleAlert, UserMinus, X } from "lucide-react";
import { guestById, guests, tableById, tables, type Guest } from "@/lib/data";
import { filled } from "@/lib/plan";
import { usePlan } from "./PlanProvider";
import RoomPlan from "./RoomPlan";
import { Card, DietBadge, PartyDot } from "./ui";

function Stat({ label, value, sub, tone = "default" }: { label: string; value: string; sub?: string; tone?: "default" | "bad" | "good" }) {
  const toneCls =
    tone === "bad" ? "text-red-700" : tone === "good" ? "text-brand-700" : "text-stone-900";
  return (
    <div className="rounded-2xl border border-stone-200 bg-white px-4 py-3 shadow-sm">
      <p className="text-xs font-medium tracking-wide text-stone-600 uppercase">{label}</p>
      <p className={`font-display mt-0.5 text-3xl font-semibold tabular-nums ${toneCls}`}>{value}</p>
      {sub && <p className="text-xs text-stone-600">{sub}</p>}
    </div>
  );
}

function SelectionBar() {
  const { selectedGuestId, loc, seatMap, seatGuest, unseatGuest, selectGuest } = usePlan();
  if (!selectedGuestId) return null;
  const g = guestById[selectedGuestId];
  const cur = loc[selectedGuestId];
  return (
    <div
      role="region"
      aria-label="Selected guest"
      className="sticky top-2 z-30 mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl bg-stone-900 px-4 py-3 text-white shadow-lg print:hidden"
    >
      <Hand className="size-5 shrink-0 text-amber-300" aria-hidden="true" />
      <p className="min-w-0 flex-1 text-sm">
        <span className="font-semibold">{g.name}</span> selected.{" "}
        <span className="text-stone-300">
          {cur ? `At ${tableById[cur.tableId].name}. ` : "Not seated. "}Tap a seat or table on the plan, or choose below.
        </span>
      </p>
      <label className="flex items-center gap-2 text-sm">
        <span className="sr-only sm:not-sr-only">Seat at</span>
        <select
          value=""
          onChange={(e) => e.target.value && seatGuest(g.id, e.target.value)}
          className="min-h-10 rounded-lg border border-stone-600 bg-stone-800 px-2 text-sm text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300"
        >
          <option value="">Choose a table…</option>
          {tables.map((t) => {
            const free = t.seats - filled(seatMap, t.id);
            return (
              <option key={t.id} value={t.id} disabled={free === 0 && cur?.tableId !== t.id}>
                {t.name} ({free} free)
              </option>
            );
          })}
        </select>
      </label>
      {cur && (
        <button
          type="button"
          onClick={() => unseatGuest(g.id)}
          className="inline-flex min-h-10 items-center gap-1.5 rounded-lg bg-white/10 px-3 text-sm font-medium hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300"
        >
          <UserMinus className="size-4" aria-hidden="true" /> Unseat
        </button>
      )}
      <button
        type="button"
        onClick={() => selectGuest(null)}
        className="inline-flex min-h-10 items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-stone-200 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300"
      >
        <X className="size-4" aria-hidden="true" /> Cancel
      </button>
    </div>
  );
}

function TablesStrip() {
  const { seatMap, selectedTableId, clickTable, brokenTables } = usePlan();
  return (
    <Card className="p-4">
      <h2 className="font-display text-lg font-semibold">Tables</h2>
      <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-7">
        {tables.map((t) => {
          const n = filled(seatMap, t.id);
          const sel = selectedTableId === t.id;
          const bad = brokenTables.has(t.id);
          return (
            <li key={t.id}>
              <button
                type="button"
                onClick={() => clickTable(t.id)}
                aria-pressed={sel}
                className={`flex min-h-16 w-full flex-col justify-between rounded-xl border px-3 py-2 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 ${
                  sel ? "border-brand-600 bg-brand-50" : "border-stone-200 bg-white hover:bg-stone-50"
                }`}
              >
                <span className="flex items-center justify-between gap-1 text-sm font-semibold">
                  {t.name}
                  {bad && (
                    <>
                      <TriangleAlert className="size-4 text-red-600" aria-hidden="true" />
                      <span className="sr-only">Rule broken</span>
                    </>
                  )}
                </span>
                <span className="text-xs text-stone-600 tabular-nums">
                  {n} of {t.seats} seated{n === t.seats ? " (full)" : ""}
                </span>
                <span aria-hidden="true" className="mt-1 block h-1 overflow-hidden rounded-full bg-stone-200">
                  <span className="block h-full bg-brand-500" style={{ width: `${(n / t.seats) * 100}%` }} />
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

function RulesCard() {
  const { rules, selectTable } = usePlan();
  const broken = rules.filter((r) => r.status === "broken").length;
  const waiting = rules.filter((r) => r.status === "waiting").length;
  const ok = rules.filter((r) => r.status === "ok").length;
  return (
    <Card className="p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-display text-lg font-semibold">The couple&apos;s rules</h2>
        <p className="text-sm text-stone-700" aria-live="polite">
          <span className={broken ? "font-semibold text-red-700" : "font-semibold text-brand-700"}>{broken} broken</span>
          {" · "}
          {waiting} waiting · {ok} kept
        </p>
      </div>
      <ul className="mt-3 divide-y divide-stone-200">
        {rules.map((r) => {
          const Icon = r.status === "broken" ? TriangleAlert : r.status === "ok" ? CircleCheck : Clock;
          const color = r.status === "broken" ? "text-red-600" : r.status === "ok" ? "text-brand-600" : "text-stone-500";
          const statusText = r.status === "broken" ? "Broken" : r.status === "ok" ? "Kept" : "Waiting";
          return (
            <li key={r.id} className="py-3 first:pt-0 last:pb-0">
              <button
                type="button"
                disabled={r.tableIds.length === 0}
                onClick={() => selectTable(r.tableIds[0])}
                className="flex w-full gap-3 rounded-lg text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 enabled:hover:bg-stone-50"
              >
                <Icon className={`mt-0.5 size-5 shrink-0 ${color}`} aria-hidden="true" />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold">
                    <span className="sr-only">{statusText}: </span>
                    {r.label}: {r.title}
                  </span>
                  <span className="mt-0.5 block text-sm text-stone-700">{r.detail}</span>
                  <span className="mt-0.5 block text-xs text-stone-600 italic">{r.note}</span>
                </span>
              </button>
              {r.warning && (
                <p className="mt-1.5 ml-8 rounded-lg bg-amber-50 px-3 py-1.5 text-xs text-amber-900 ring-1 ring-amber-200">
                  Data check: {r.warning}
                </p>
              )}
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

function TableDetail() {
  const { selectedTableId, seatMap, selectedGuestId, selectGuest, unseatGuest, rules, brokenGuests } = usePlan();
  if (!selectedTableId) {
    return (
      <Card className="p-4">
        <h2 className="font-display text-lg font-semibold">Table details</h2>
        <p className="mt-2 text-sm text-stone-600">
          Select a table on the plan to see who is sitting there and what they eat.
        </p>
      </Card>
    );
  }
  const t = tableById[selectedTableId];
  const seats = seatMap[t.id];
  const seated = seats.filter((x): x is string => !!x).map((id) => guestById[id]);
  const dietCounts = new Map<string, number>();
  seated.forEach((g) => g.diet && dietCounts.set(g.diet, (dietCounts.get(g.diet) ?? 0) + 1));
  const problems = rules.filter((r) => r.status === "broken" && r.tableIds.includes(t.id));
  return (
    <Card className="p-4">
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="font-display text-lg font-semibold">{t.name}</h2>
        <p className="text-sm text-stone-600 tabular-nums">
          {seated.length} of {t.seats} seated
        </p>
      </div>

      {problems.length > 0 && (
        <ul className="mt-2 space-y-1">
          {problems.map((p) => (
            <li key={p.id} className="flex gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-900 ring-1 ring-red-200">
              <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <span>
                <span className="font-semibold">{p.label}:</span> {p.detail}
              </span>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-3">
        <h3 className="text-xs font-medium tracking-wide text-stone-600 uppercase">Dietary needs here</h3>
        {dietCounts.size === 0 ? (
          <p className="mt-1 text-sm text-stone-600">No special diets at this table.</p>
        ) : (
          <ul className="mt-1.5 flex flex-wrap gap-1.5">
            {Array.from(dietCounts).map(([d, n]) => (
              <li key={d} className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-900 ring-1 ring-amber-300/70">
                {n} × {d}
              </li>
            ))}
          </ul>
        )}
      </div>

      <ol className="mt-3 divide-y divide-stone-100">
        {seats.map((gid, i) => {
          const g: Guest | null = gid ? guestById[gid] : null;
          return (
            <li key={i} className="flex min-h-11 items-center gap-3 py-1.5">
              <span className="grid size-6 shrink-0 place-items-center rounded-full bg-stone-100 text-xs font-semibold text-stone-700 tabular-nums">
                {i + 1}
              </span>
              {g ? (
                <>
                  <button
                    type="button"
                    onClick={() => selectGuest(selectedGuestId === g.id ? null : g.id)}
                    aria-pressed={selectedGuestId === g.id}
                    className={`flex min-w-0 flex-1 flex-col items-start rounded-lg px-2 py-1 text-left focus-visible:outline-2 focus-visible:outline-brand-600 ${
                      selectedGuestId === g.id ? "bg-stone-900 text-white" : "hover:bg-stone-50"
                    }`}
                  >
                    <span className="flex items-center gap-2 text-sm font-medium">
                      <PartyDot party={g.party} />
                      <span className="truncate">{g.name}</span>
                      {brokenGuests.has(g.id) && <TriangleAlert className="size-3.5 text-red-500" aria-label="Rule broken" />}
                    </span>
                    <span className={`text-xs ${selectedGuestId === g.id ? "text-stone-300" : "text-stone-600"}`}>
                      {g.party}
                      {g.rsvp !== "yes" ? ` · ${g.rsvp}` : ""}
                    </span>
                  </button>
                  <DietBadge diet={g.diet} />
                  <button
                    type="button"
                    onClick={() => unseatGuest(g.id)}
                    aria-label={`Unseat ${g.name}`}
                    className="grid size-10 shrink-0 place-items-center rounded-lg text-stone-600 hover:bg-stone-100 hover:text-red-700 focus-visible:outline-2 focus-visible:outline-brand-600"
                  >
                    <UserMinus className="size-4" aria-hidden="true" />
                  </button>
                </>
              ) : (
                <span className="px-2 text-sm text-stone-500 italic">Empty seat</span>
              )}
            </li>
          );
        })}
      </ol>
    </Card>
  );
}

function GuestRow({ g }: { g: Guest }) {
  const { selectedGuestId, selectGuest, setDragId } = usePlan();
  const sel = selectedGuestId === g.id;
  return (
    <li
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", g.id);
        e.dataTransfer.effectAllowed = "move";
        setDragId(g.id);
      }}
      onDragEnd={() => setDragId(null)}
    >
      <button
        type="button"
        onClick={() => selectGuest(sel ? null : g.id)}
        aria-pressed={sel}
        className={`flex min-h-12 w-full cursor-grab items-center gap-3 rounded-xl border px-3 py-2 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 ${
          sel ? "border-stone-900 bg-stone-900 text-white" : "border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50"
        }`}
      >
        <PartyDot party={g.party} className="size-3" />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium">{g.name}</span>
          <span className={`block truncate text-xs ${sel ? "text-stone-300" : "text-stone-600"}`}>{g.party}</span>
        </span>
        <DietBadge diet={g.diet} />
      </button>
    </li>
  );
}

function UnseatedCard() {
  const { loc, dragId, unseatGuest, setDragId } = usePlan();
  const open = guests.filter((g) => !loc[g.id]);
  const attending = open.filter((g) => g.rsvp === "yes");
  const unsure = open.filter((g) => g.rsvp === "maybe" || g.rsvp === "pending");
  return (
    <Card className="p-4">
      <div
        onDragOver={(e) => dragId && loc[dragId] && e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const id = e.dataTransfer.getData("text/plain") || dragId;
          if (id) unseatGuest(id);
          setDragId(null);
        }}
      >
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="font-display text-lg font-semibold">Needs a seat</h2>
          <p className="text-sm font-semibold tabular-nums text-stone-700">{attending.length} attending</p>
        </div>
        <p className="mt-1 text-xs text-stone-600">
          Drag a guest onto a seat or table, or tap a guest and then a seat. Drop a seated guest here to unseat them.
        </p>
        {attending.length === 0 ? (
          <p className="mt-3 flex items-center gap-2 rounded-xl bg-brand-50 px-3 py-3 text-sm font-medium text-brand-800">
            <CircleCheck className="size-5" aria-hidden="true" /> Every attending guest has a seat.
          </p>
        ) : (
          <ul className="mt-3 space-y-1.5">
            {attending.map((g) => (
              <GuestRow key={g.id} g={g} />
            ))}
          </ul>
        )}
        {unsure.length > 0 && (
          <>
            <h3 className="mt-4 text-xs font-medium tracking-wide text-stone-600 uppercase">
              Not confirmed ({unsure.length})
            </h3>
            <ul className="mt-1.5 space-y-1.5">
              {unsure.map((g) => (
                <GuestRow key={g.id} g={g} />
              ))}
            </ul>
          </>
        )}
      </div>
    </Card>
  );
}

export default function PlanView() {
  const { loc, rules } = usePlan();
  const attending = guests.filter((g) => g.rsvp === "yes");
  const seatedAttending = attending.filter((g) => loc[g.id]).length;
  const seatedOthers = Object.keys(loc).length - seatedAttending;
  const broken = rules.filter((r) => r.status === "broken").length;

  return (
    <div className="mx-auto w-full max-w-[1500px] px-4 pt-5 pb-12 sm:px-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Attending" value={String(attending.length)} sub="confirmed yes" />
        <Stat
          label="Seated"
          value={String(seatedAttending)}
          sub={seatedOthers > 0 ? `plus ${seatedOthers} not yet confirmed` : `of ${attending.length} attending`}
          tone="good"
        />
        <Stat
          label="Unseated"
          value={String(attending.length - seatedAttending)}
          sub="attending, no seat yet"
          tone={attending.length - seatedAttending > 0 ? "default" : "good"}
        />
        <Stat
          label="Rules"
          value={broken === 0 ? "All kept" : `${broken} broken`}
          sub={`${rules.length} from the couple`}
          tone={broken > 0 ? "bad" : "good"}
        />
      </div>

      <SelectionBar />

      <div className="mt-4 grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="min-w-0 space-y-4">
          <Card className="p-3 sm:p-4">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-1 pb-3">
              <h1 className="font-display text-xl font-semibold">Seating plan</h1>
              <p className="text-sm text-stone-600">The Orangery, drawn to scale: 24 × 14 m. Scroll sideways on a small screen.</p>
            </div>
            <RoomPlan />
          </Card>
          <TablesStrip />
          <RulesCard />
        </div>
        <div className="min-w-0 space-y-4">
          <TableDetail />
          <UnseatedCard />
        </div>
      </div>
    </div>
  );
}
