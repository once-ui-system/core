"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Music, TriangleAlert, Wine } from "lucide-react";

import { FIXTURES, PARTY_COLORS, ROOM, TABLES, type Fixture } from "@/lib/data";
import { GUEST_BY_ID, initials, tableGeometry } from "@/lib/plan";
import { usePlan } from "./PlanProvider";

const MIN_SCALE = 30;

type Props = {
  selectedId: string | null;
  heldId: string | null;
  dragId: string | null;
  onTable: (tableId: string) => void;
  onSeat: (tableId: string, index: number) => void;
  onDragStart: (guestId: string) => void;
  onDragEnd: () => void;
  onDropOn: (tableId: string, index: number | undefined, guestId: string) => void;
};

function FixtureBlock({ f, s }: { f: Fixture; s: number }) {
  const style: CSSProperties = { left: f.x * s, top: f.y * s, width: f.w * s, height: f.h * s, fontSize: Math.max(10, s * 0.3) };
  const base = "absolute flex select-none items-center justify-center gap-1.5 text-center font-medium";
  if (f.kind === "stage") {
    return (
      <div role="img" aria-label={f.label} className={`${base} rounded-md border border-stone-900 bg-stone-800 text-stone-100`} style={style}>
        <Music className="size-4" aria-hidden="true" />
        {f.label}
      </div>
    );
  }
  if (f.kind === "dancefloor") {
    return (
      <div
        role="img"
        aria-label={f.label}
        className={`${base} rounded-md border border-amber-300 text-amber-900`}
        style={{
          ...style,
          backgroundColor: "#fef3c7",
          backgroundImage: "repeating-conic-gradient(#fde68a 0% 25%, transparent 0% 50%)",
          backgroundSize: `${s * 0.7}px ${s * 0.7}px`,
        }}
      >
        <span className="rounded bg-amber-50/90 px-2 py-0.5">{f.label}</span>
      </div>
    );
  }
  if (f.kind === "bar") {
    return (
      <div role="img" aria-label={f.label} className={`${base} flex-col rounded-md border border-stone-500 bg-stone-300 text-stone-800`} style={style}>
        <Wine className="size-4" aria-hidden="true" />
        {f.label}
      </div>
    );
  }
  return (
    <div
      role="img"
      aria-label={f.label}
      className={`${base} rounded-sm border border-sky-400 bg-sky-200 text-sky-900 [writing-mode:vertical-rl]`}
      style={{ ...style, fontSize: Math.max(9, s * 0.27) }}
    >
      {f.label}
    </div>
  );
}

export function RoomPlan({ selectedId, heldId, dragId, onTable, onSeat, onDragStart, onDragEnd, onDropOn }: Props) {
  const plan = usePlan();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(960);
  const [over, setOver] = useState<string | null>(null);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    setWidth(el.clientWidth);
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width;
      if (w) setWidth(w);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const s = Math.max(width / ROOM.width, MIN_SCALE);
  const font = Math.max(10, s * 0.3);

  return (
    <div ref={wrapRef} className="overflow-x-auto rounded-xl border border-stone-300 bg-stone-100">
      <div
        className="relative"
        style={{
          width: ROOM.width * s,
          height: ROOM.depth * s,
          backgroundColor: "#f3eee3",
          backgroundImage:
            "linear-gradient(to right, rgba(120,113,108,0.13) 1px, transparent 1px), linear-gradient(to bottom, rgba(120,113,108,0.13) 1px, transparent 1px)",
          backgroundSize: `${s}px ${s}px`,
        }}
      >
        {FIXTURES.map((f) => (
          <FixtureBlock key={f.id} f={f} s={s} />
        ))}

        {TABLES.map((t) => {
          const geo = tableGeometry(t);
          const row = plan.seats[t.id];
          const filled = row.filter(Boolean).length;
          const broken = plan.brokenByTable[t.id] ?? [];
          const selected = selectedId === t.id;
          const round = t.shape === "round";
          const label = `${t.name}, ${filled} of ${t.seats} seats filled${broken.length ? `, ${broken.length} rule${broken.length > 1 ? "s" : ""} broken` : ""}`;
          return (
            <div
              key={t.id}
              role="group"
              aria-label={label}
              className={`absolute transition-colors ${round ? "rounded-full" : "rounded-2xl"} ${
                over === t.id ? "bg-sky-300/50 ring-2 ring-sky-500" : ""
              }`}
              style={{
                left: geo.box.x * s,
                top: geo.box.y * s,
                width: geo.box.w * s,
                height: geo.box.h * s,
                transform: t.rotation ? `rotate(${t.rotation}deg)` : undefined,
              }}
              onDragOver={(e) => {
                if (!dragId) return;
                e.preventDefault();
                e.dataTransfer.dropEffect = "move";
                setOver(t.id);
              }}
              onDragLeave={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOver(null);
              }}
              onDrop={(e) => {
                e.preventDefault();
                setOver(null);
                const id = dragId ?? e.dataTransfer.getData("text/plain");
                if (id) onDropOn(t.id, undefined, id);
              }}
            >
              <button
                type="button"
                onClick={() => onTable(t.id)}
                aria-pressed={selected}
                aria-label={`${label}. ${heldId ? "Place the picked-up guest here" : "Show guests"}`}
                className={`absolute flex items-center justify-center border-2 bg-white text-center shadow-sm transition-shadow hover:shadow-md ${
                  round ? "flex-col rounded-full" : "flex-row gap-3 rounded-lg"
                } ${
                  broken.length
                    ? "border-red-500"
                    : selected
                      ? "border-sky-600"
                      : "border-stone-300"
                } ${selected ? "ring-4 ring-sky-500/40" : ""}`}
                style={{
                  left: (geo.body.x - geo.box.x) * s,
                  top: (geo.body.y - geo.box.y) * s,
                  width: geo.body.w * s,
                  height: geo.body.h * s,
                }}
              >
                <span className="font-semibold leading-tight text-stone-900" style={{ fontSize: font }}>
                  {t.name}
                </span>
                <span
                  className={`tabular-nums leading-tight ${filled === t.seats ? "font-semibold text-emerald-700" : "text-stone-500"}`}
                  style={{ fontSize: font * 0.9 }}
                >
                  {filled}/{t.seats}
                </span>
                {broken.length > 0 && (
                  <span
                    aria-hidden="true"
                    className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-red-600 text-white shadow"
                    style={{ transform: round ? "translate(-0.35rem, 0.35rem)" : undefined }}
                  >
                    <TriangleAlert className="size-3" />
                  </span>
                )}
              </button>

              {geo.seats.map((p, i) => {
                const gid = row[i];
                const g = gid ? GUEST_BY_ID.get(gid) : undefined;
                const key = `${t.id}:${i}`;
                const size = 0.8 * s;
                const held = !!g && g.id === heldId;
                const flagged = !!g && plan.flaggedGuests.has(g.id);
                const seatLabel = g
                  ? `${t.name}, seat ${i + 1}: ${g.name}${g.diet ? `, ${g.diet}` : ""}${flagged ? ", breaks a rule" : ""}`
                  : `${t.name}, seat ${i + 1}: empty`;
                return (
                  <button
                    key={key}
                    type="button"
                    draggable={!!g}
                    title={g ? `${g.name}${g.diet ? ` · ${g.diet}` : ""}` : `Empty seat ${i + 1}`}
                    aria-label={seatLabel}
                    aria-pressed={held}
                    onClick={() => onSeat(t.id, i)}
                    onDragStart={(e) => {
                      if (!g) return;
                      e.dataTransfer.setData("text/plain", g.id);
                      e.dataTransfer.effectAllowed = "move";
                      onDragStart(g.id);
                    }}
                    onDragEnd={onDragEnd}
                    onDragOver={(e) => {
                      if (!dragId) return;
                      e.preventDefault();
                      e.stopPropagation();
                      e.dataTransfer.dropEffect = "move";
                      setOver(key);
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setOver(null);
                      const id = dragId ?? e.dataTransfer.getData("text/plain");
                      if (id) onDropOn(t.id, i, id);
                    }}
                    className={`absolute grid place-items-center rounded-full border-2 font-semibold leading-none transition-transform ${
                      g
                        ? "cursor-grab border-white text-white shadow active:cursor-grabbing"
                        : heldId
                          ? "border-sky-500 bg-sky-50 text-sky-700"
                          : "border-dashed border-stone-400 bg-white/80 text-stone-400"
                    } ${held ? "z-10 scale-110 ring-4 ring-sky-500" : ""} ${
                      flagged && !held ? "ring-2 ring-red-500 ring-offset-1" : ""
                    } ${over === key ? "scale-125 ring-4 ring-sky-500" : ""} ${dragId && dragId === g?.id ? "opacity-40" : ""}`}
                    style={{
                      left: (p.x - geo.box.x) * s - size / 2,
                      top: (p.y - geo.box.y) * s - size / 2,
                      width: size,
                      height: size,
                      fontSize: Math.max(9, s * 0.27),
                      backgroundColor: g ? (PARTY_COLORS[g.party] ?? "#57534e") : undefined,
                    }}
                  >
                    {g ? initials(g.name) : ""}
                    {g?.diet && (
                      <span
                        aria-hidden="true"
                        className="absolute -right-0.5 -top-0.5 size-3 rounded-full border-2 border-white bg-amber-400"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
