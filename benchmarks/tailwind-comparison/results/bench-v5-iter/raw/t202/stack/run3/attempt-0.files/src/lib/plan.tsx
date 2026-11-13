"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { fixtures, guests as allGuests, rules, tables, type Guest, type Rule, type Table } from "./data";

export type Spot = { table: string; seat: number };
export type SeatOf = Record<string, Spot | null>;

export const LONG_LENGTH = 8;
export const LONG_DEPTH = 1.2;
export const ROUND_RING = 1.45;
export const SEAT_SIZE = 0.85;
export const NEAR_DOOR_MAX_M = 5;
export const FAR_BAND_MIN_M = 6;

export const guestById = new Map<string, Guest>(allGuests.map((g) => [g.id, g]));
export const tableById = new Map<string, Table>(tables.map((t) => [t.id, t]));

export function tableCentre(t: Table): { x: number; y: number } {
  return t.shape === "long" ? { x: t.x + LONG_LENGTH / 2, y: t.y + LONG_DEPTH / 2 } : { x: t.x, y: t.y };
}

export function seatPoint(t: Table, i: number): { x: number; y: number } {
  if (t.shape === "long") {
    return { x: t.x + (i + 0.5) * (LONG_LENGTH / t.seats), y: t.y - 0.6 };
  }
  const a = -Math.PI / 2 + (i * 2 * Math.PI) / t.seats;
  return { x: t.x + Math.cos(a) * ROUND_RING, y: t.y + Math.sin(a) * ROUND_RING };
}

export function initials(name: string): string {
  const parts = name.replace(/^Avó\s+/, "").split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[parts.length - 1]?.[0] ?? "")).toUpperCase();
}

function initialSeating(): SeatOf {
  const next: SeatOf = {};
  const used: Record<string, number> = {};
  for (const g of allGuests) {
    if (g.table) {
      const n = used[g.table] ?? 0;
      used[g.table] = n + 1;
      next[g.id] = { table: g.table, seat: n };
    } else {
      next[g.id] = null;
    }
  }
  return next;
}

export type RuleStatus = "ok" | "broken" | "open";
export type RuleResult = {
  rule: Rule;
  status: RuleStatus;
  detail: string;
  tables: string[];
};

function dist(a: { x: number; y: number }, b: { x: number; y: number }) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function evaluateRules(seatOf: SeatOf): RuleResult[] {
  const door = fixtures.find((f) => f.kind === "door");
  const band = fixtures.find((f) => f.kind === "stage");
  return rules.map((rule) => {
    const gs = rule.guests.map((id) => guestById.get(id)!);
    const spots = rule.guests.map((id) => seatOf[id] ?? null);
    const seated = spots.filter((s): s is Spot => s !== null);
    const involved = [...new Set(seated.map((s) => s.table))];
    const names = gs.map((g) => g.name).join(" and ");
    const nameOf = (i: number) => gs[i]?.name ?? "";

    if (rule.kind === "together") {
      if (seated.length < spots.length) {
        const missing = gs.filter((_, i) => !spots[i]).map((g) => g.name).join(", ");
        return { rule, status: "open" as const, detail: `${missing} still to seat`, tables: involved };
      }
      if (involved.length > 1) {
        return {
          rule,
          status: "broken" as const,
          detail: `${names} are at different tables`,
          tables: involved,
        };
      }
      return { rule, status: "ok" as const, detail: `${names} share ${tableById.get(involved[0])?.name}`, tables: involved };
    }

    if (rule.kind === "apart") {
      if (seated.length === 2 && involved.length === 1) {
        return {
          rule,
          status: "broken" as const,
          detail: `${nameOf(0)} and ${nameOf(1)} are both at ${tableById.get(involved[0])?.name}`,
          tables: involved,
        };
      }
      return {
        rule,
        status: "ok" as const,
        detail: seated.length < 2 ? `${names}: kept apart (one is not seated yet)` : `${names}: kept apart`,
        tables: involved,
      };
    }

    // near: seat close to the garden doors and away from the band
    const spot = spots[0];
    if (!spot || !door || !band) {
      return { rule, status: "open" as const, detail: `${nameOf(0)} is not seated yet`, tables: [] };
    }
    const t = tableById.get(spot.table)!;
    const c = tableCentre(t);
    const dDoor = dist(c, { x: door.x + door.w / 2, y: door.y + door.h / 2 });
    const dBand = dist(c, { x: band.x + band.w / 2, y: band.y + band.h / 2 });
    const doorOk = dDoor <= NEAR_DOOR_MAX_M;
    const bandOk = dBand >= FAR_BAND_MIN_M;
    if (doorOk && bandOk) {
      return {
        rule,
        status: "ok" as const,
        detail: `${t.name} is ${dDoor.toFixed(1)} m from the garden doors and ${dBand.toFixed(1)} m from the band`,
        tables: [t.id],
      };
    }
    const why = !doorOk
      ? `${t.name} is ${dDoor.toFixed(1)} m from the garden doors (aim for ${NEAR_DOOR_MAX_M} m or less)`
      : `${t.name} is only ${dBand.toFixed(1)} m from the band`;
    return { rule, status: "broken" as const, detail: why, tables: [t.id] };
  });
}

type PlanState = {
  seatOf: SeatOf;
  picked: string | null;
  selectedTable: string | null;
  message: string;
  results: RuleResult[];
  occupant: (tableId: string, seat: number) => Guest | null;
  guestsAt: (tableId: string) => Guest[];
  seatedCount: number;
  toSeat: Guest[];
  undecided: Guest[];
  attendingCount: number;
  pick: (id: string | null) => void;
  selectTable: (id: string | null) => void;
  place: (guestId: string, tableId: string, seat?: number) => void;
  unseat: (guestId: string) => void;
};

const PlanContext = createContext<PlanState | null>(null);

export function PlanProvider({ children }: { children: React.ReactNode }) {
  const [seatOf, setSeatOf] = useState<SeatOf>(initialSeating);
  const [picked, setPicked] = useState<string | null>(null);
  const [selectedTable, setSelectedTable] = useState<string | null>("t-3");
  const [message, setMessage] = useState("");

  const results = useMemo(() => evaluateRules(seatOf), [seatOf]);

  const occupant = useCallback(
    (tableId: string, seat: number) => {
      for (const g of allGuests) {
        const s = seatOf[g.id];
        if (s && s.table === tableId && s.seat === seat) return g;
      }
      return null;
    },
    [seatOf],
  );

  const guestsAt = useCallback(
    (tableId: string) =>
      allGuests
        .filter((g) => seatOf[g.id]?.table === tableId)
        .sort((a, b) => (seatOf[a.id]?.seat ?? 0) - (seatOf[b.id]?.seat ?? 0)),
    [seatOf],
  );

  const place = useCallback(
    (guestId: string, tableId: string, seat?: number) => {
      const guest = guestById.get(guestId);
      const table = tableById.get(tableId);
      if (!guest || !table || guest.rsvp === "no") return;
      const current = seatOf[guestId] ?? null;
      const taken = new Map<number, string>();
      for (const g of allGuests) {
        const s = seatOf[g.id];
        if (s && s.table === tableId) taken.set(s.seat, g.id);
      }
      let target = seat;
      if (target === undefined) {
        if (current?.table === tableId) {
          setMessage(`${guest.name} is already at ${table.name}.`);
          return;
        }
        for (let i = 0; i < table.seats; i++) {
          if (!taken.has(i)) {
            target = i;
            break;
          }
        }
        if (target === undefined) {
          setMessage(`${table.name} is full. Unseat someone or pick another table.`);
          return;
        }
      }
      const occupantId = taken.get(target);
      if (occupantId === guestId) return;
      const next: SeatOf = { ...seatOf, [guestId]: { table: tableId, seat: target } };
      let msg = `${guest.name} seated at ${table.name}.`;
      if (occupantId) {
        const other = guestById.get(occupantId)!;
        if (current) {
          next[occupantId] = current;
          const from = tableById.get(current.table)?.name;
          msg = `${guest.name} and ${other.name} swapped seats (${table.name} and ${from}).`;
        } else {
          next[occupantId] = null;
          msg = `${guest.name} took ${other.name}'s seat at ${table.name}; ${other.name} is unseated.`;
        }
      } else if (current) {
        msg = `${guest.name} moved from ${tableById.get(current.table)?.name} to ${table.name}.`;
      }
      setSeatOf(next);
      setPicked(null);
      setSelectedTable(tableId);
      setMessage(msg);
    },
    [seatOf],
  );

  const unseat = useCallback(
    (guestId: string) => {
      const g = guestById.get(guestId);
      if (!g || !seatOf[guestId]) return;
      setSeatOf({ ...seatOf, [guestId]: null });
      setPicked(null);
      setMessage(`${g.name} unseated.`);
    },
    [seatOf],
  );

  const value = useMemo<PlanState>(() => {
    const seatedCount = allGuests.filter((g) => seatOf[g.id]).length;
    const toSeat = allGuests.filter((g) => g.rsvp === "yes" && !seatOf[g.id]);
    const undecided = allGuests.filter((g) => (g.rsvp === "maybe" || g.rsvp === "pending") && !seatOf[g.id]);
    return {
      seatOf,
      picked,
      selectedTable,
      message,
      results,
      occupant,
      guestsAt,
      seatedCount,
      toSeat,
      undecided,
      attendingCount: allGuests.filter((g) => g.rsvp === "yes").length,
      pick: setPicked,
      selectTable: setSelectedTable,
      place,
      unseat,
    };
  }, [seatOf, picked, selectedTable, message, results, occupant, guestsAt, place, unseat]);

  return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>;
}

export function usePlan(): PlanState {
  const ctx = useContext(PlanContext);
  if (!ctx) throw new Error("usePlan needs PlanProvider");
  return ctx;
}
