"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { guests, tables } from "@/lib/data";
import { guestById, tableById } from "@/lib/plan";
import { evaluateRules, type RuleResult } from "@/lib/rules";

type Seats = Record<string, (string | null)[]>;
export type PanelTab = "toSeat" | "rules" | "table";

export interface Notice {
  id: number;
  message: string;
  undo: boolean;
}

export interface PlanApi {
  seats: Seats;
  guestTable: Record<string, string | null>;
  occupied: Record<string, number>;
  seatedConfirmed: number;
  confirmed: number;
  seatedUnconfirmed: number;
  totalSeats: number;
  seatedTotal: number;
  toSeat: string[];
  awaitingToSeat: string[];
  rules: RuleResult[];
  brokenByTable: Record<string, RuleResult[]>;
  brokenGuests: Set<string>;
  picked: string | null;
  selectedTable: string | null;
  dragId: string | null;
  panelTab: PanelTab;
  canUndo: boolean;
  notice: Notice | null;
  place: (guestId: string, tableId: string, seatIdx?: number) => void;
  unseat: (guestId: string) => void;
  pick: (guestId: string | null) => void;
  selectTable: (tableId: string | null) => void;
  setDragId: (id: string | null) => void;
  setPanelTab: (tab: PanelTab) => void;
  undo: () => void;
  clearNotice: () => void;
}

const PlanContext = createContext<PlanApi | null>(null);

export function usePlan(): PlanApi {
  const ctx = useContext(PlanContext);
  if (!ctx) throw new Error("usePlan must be used inside PlanProvider");
  return ctx;
}

function buildInitialSeats(): Seats {
  const s: Seats = {};
  for (const t of tables) s[t.id] = Array.from({ length: t.seats }, () => null as string | null);
  for (const g of guests) {
    if (!g.table) continue;
    const row = s[g.table];
    const i = row.indexOf(null);
    if (i >= 0) row[i] = g.id;
  }
  return s;
}

function cloneSeats(s: Seats): Seats {
  const n: Seats = {};
  for (const k of Object.keys(s)) n[k] = s[k].slice();
  return n;
}

function locate(s: Seats, id: string): { table: string; idx: number } | null {
  for (const tid of Object.keys(s)) {
    const i = s[tid].indexOf(id);
    if (i >= 0) return { table: tid, idx: i };
  }
  return null;
}

export default function PlanProvider({ children }: { children: ReactNode }) {
  const [seats, setSeats] = useState<Seats>(buildInitialSeats);
  const [history, setHistory] = useState<Seats[]>([]);
  const [picked, setPicked] = useState<string | null>(null);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [panelTab, setPanelTab] = useState<PanelTab>("toSeat");
  const [notice, setNotice] = useState<Notice | null>(null);

  const say = useCallback((message: string, undo: boolean) => {
    setNotice((n) => ({ id: (n?.id ?? 0) + 1, message, undo }));
  }, []);

  const commit = useCallback(
    (next: Seats, message: string) => {
      setHistory((h) => [...h.slice(-29), seats]);
      setSeats(next);
      say(message, true);
    },
    [seats, say],
  );

  const place = useCallback(
    (guestId: string, tableId: string, seatIdx?: number) => {
      const g = guestById[guestId];
      const t = tableById[tableId];
      const row = seats[tableId];
      if (!g || !t || !row) return;
      if (g.rsvp === "no") {
        say(`${g.name} has declined, so cannot be seated`, false);
        return;
      }
      const cur = locate(seats, guestId);
      let i: number;
      if (seatIdx === undefined) {
        if (cur && cur.table === tableId) {
          setPicked(null);
          setSelectedTable(tableId);
          return;
        }
        i = row.indexOf(null);
        if (i < 0) {
          say(`${t.name} is full. Move someone out first, or pick a seat to swap.`, false);
          return;
        }
      } else {
        i = seatIdx;
      }
      if (cur && cur.table === tableId && cur.idx === i) {
        setPicked(null);
        return;
      }
      const occId = row[i] ?? null;
      const occ = occId ? guestById[occId] : null;
      const next = cloneSeats(seats);
      let message: string;
      if (cur) {
        next[cur.table][cur.idx] = occId;
        message = occ
          ? `${g.name} and ${occ.name} swapped seats`
          : `${g.name} moved to ${t.name}, seat ${i + 1}`;
      } else {
        message = occ
          ? `${g.name} seated at ${t.name}; ${occ.name} is now unseated`
          : `${g.name} seated at ${t.name}, seat ${i + 1}`;
      }
      next[tableId][i] = guestId;
      commit(next, message);
      setPicked(null);
      setSelectedTable(tableId);
    },
    [seats, commit, say],
  );

  const unseat = useCallback(
    (guestId: string) => {
      const cur = locate(seats, guestId);
      if (!cur) return;
      const next = cloneSeats(seats);
      next[cur.table][cur.idx] = null;
      commit(next, `${guestById[guestId]?.name ?? "Guest"} unseated from ${tableById[cur.table]?.name ?? "table"}`);
      setPicked((p) => (p === guestId ? null : p));
    },
    [seats, commit],
  );

  const undo = useCallback(() => {
    setHistory((h) => {
      const prev = h[h.length - 1];
      if (!prev) return h;
      setSeats(prev);
      say("Last change undone", false);
      return h.slice(0, -1);
    });
  }, [say]);

  const selectTable = useCallback((tableId: string | null) => {
    setSelectedTable(tableId);
    if (tableId) setPanelTab("table");
  }, []);

  const pick = useCallback((id: string | null) => setPicked(id), []);
  const clearNotice = useCallback(() => setNotice(null), []);

  const value = useMemo<PlanApi>(() => {
    const guestTable: Record<string, string | null> = {};
    for (const g of guests) guestTable[g.id] = null;
    const occupied: Record<string, number> = {};
    for (const t of tables) {
      occupied[t.id] = 0;
      for (const id of seats[t.id]) {
        if (id) {
          guestTable[id] = t.id;
          occupied[t.id] += 1;
        }
      }
    }
    const rules = evaluateRules(guestTable);
    const brokenByTable: Record<string, RuleResult[]> = {};
    const brokenGuests = new Set<string>();
    for (const r of rules) {
      if (r.status !== "broken") continue;
      for (const tid of r.tableIds) (brokenByTable[tid] ??= []).push(r);
      for (const gid of r.guestIds) brokenGuests.add(gid);
    }
    const confirmedGuests = guests.filter((g) => g.rsvp === "yes");
    const seatedConfirmed = confirmedGuests.filter((g) => guestTable[g.id]).length;
    const seatedTotal = guests.filter((g) => guestTable[g.id]).length;
    return {
      seats,
      guestTable,
      occupied,
      seatedConfirmed,
      confirmed: confirmedGuests.length,
      seatedTotal,
      seatedUnconfirmed: seatedTotal - seatedConfirmed,
      totalSeats: tables.reduce((n, t) => n + t.seats, 0),
      toSeat: confirmedGuests.filter((g) => !guestTable[g.id]).map((g) => g.id),
      awaitingToSeat: guests
        .filter((g) => (g.rsvp === "maybe" || g.rsvp === "pending") && !guestTable[g.id])
        .map((g) => g.id),
      rules,
      brokenByTable,
      brokenGuests,
      picked,
      selectedTable,
      dragId,
      panelTab,
      canUndo: history.length > 0,
      notice,
      place,
      unseat,
      pick,
      selectTable,
      setDragId,
      setPanelTab,
      undo,
      clearNotice,
    };
  }, [seats, picked, selectedTable, dragId, panelTab, history, notice, place, unseat, pick, selectTable, undo, clearNotice]);

  return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>;
}
