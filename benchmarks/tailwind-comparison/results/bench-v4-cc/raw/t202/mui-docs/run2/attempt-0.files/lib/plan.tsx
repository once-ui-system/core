"use client";

import * as React from "react";
import Button from "@mui/material/Button";
import Snackbar from "@mui/material/Snackbar";
import { guestById, guests, tableById, tables, type Guest } from "@/lib/data";
import { evaluateRules, seatsFor, type Assignment, type RuleResult } from "@/lib/rules";

type Notice = { key: number; text: string; undo?: Assignment };

export type PlanStats = {
  attending: number;
  seated: number;
  capacity: number;
  freeSeats: number;
  toSeat: number;
  awaiting: number;
  declined: number;
};

type PlanContextValue = {
  assign: Assignment;
  occupants: (tableId: string) => (Guest | null)[];
  filled: (tableId: string) => number;
  stats: PlanStats;
  unseatedAttending: Guest[];
  unseatedUnconfirmed: Guest[];
  place: (guestId: string, tableId: string, seat?: number) => void;
  unseat: (guestId: string) => void;
  heldId: string | null;
  pick: (guestId: string) => void;
  clearHeld: () => void;
  selectedTableId: string | null;
  selectTable: (tableId: string | null) => void;
  dragId: string | null;
  setDragId: (id: string | null) => void;
  rules: RuleResult[];
  tableFlags: Record<string, RuleResult[]>;
  guestFlags: Record<string, RuleResult[]>;
};

const PlanContext = React.createContext<PlanContextValue | null>(null);

function initialAssignment(): Assignment {
  const a: Assignment = {};
  const next: Record<string, number> = {};
  for (const g of guests) {
    if (g.table) {
      const seat = next[g.table] ?? 0;
      next[g.table] = seat + 1;
      a[g.id] = { tableId: g.table, seat };
    } else {
      a[g.id] = null;
    }
  }
  return a;
}

export function PlanProvider({ children }: { children: React.ReactNode }) {
  const [assign, setAssign] = React.useState<Assignment>(initialAssignment);
  const [heldId, setHeldId] = React.useState<string | null>(null);
  const [selectedTableId, setSelectedTableId] = React.useState<string | null>("t-1");
  const [dragId, setDragId] = React.useState<string | null>(null);
  const [notice, setNotice] = React.useState<Notice | null>(null);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setHeldId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const say = React.useCallback((text: string, undo?: Assignment) => {
    setNotice({ key: Date.now(), text, undo });
  }, []);

  const occupants = React.useCallback(
    (tableId: string) =>
      seatsFor(assign, tableId, tableById[tableId].seats).map((id) => (id ? guestById[id] : null)),
    [assign],
  );

  const filled = React.useCallback(
    (tableId: string) => seatsFor(assign, tableId, tableById[tableId].seats).filter(Boolean).length,
    [assign],
  );

  const place = React.useCallback(
    (guestId: string, tableId: string, seat?: number) => {
      const guest = guestById[guestId];
      const table = tableById[tableId];
      if (!guest || !table) return;
      if (guest.rsvp === "no") {
        say(`${guest.name} has declined, so they cannot be seated.`);
        return;
      }
      const cur = assign[guestId];
      if (cur && cur.tableId === tableId && (seat === undefined || seat === cur.seat)) {
        setHeldId(null);
        return;
      }
      const occ = seatsFor(assign, tableId, table.seats);
      const next: Assignment = { ...assign };
      let target = seat;
      if (target !== undefined && occ[target] && occ[target] !== guestId) {
        const otherId = occ[target] as string;
        if (cur) {
          next[otherId] = cur;
          next[guestId] = { tableId, seat: target };
          setAssign(next);
          setHeldId(null);
          setSelectedTableId(tableId);
          say(`Swapped ${guest.name} and ${guestById[otherId].name}.`, assign);
          return;
        }
        target = undefined;
      }
      if (target === undefined) {
        const free = occ.findIndex((o) => o === null);
        if (free < 0) {
          say(`${table.name} is full (${table.seats} of ${table.seats} seats).`);
          return;
        }
        target = free;
      }
      next[guestId] = { tableId, seat: target };
      setAssign(next);
      setHeldId(null);
      setSelectedTableId(tableId);
      say(
        cur
          ? `Moved ${guest.name} from ${tableById[cur.tableId].name} to ${table.name}.`
          : `Seated ${guest.name} at ${table.name}.`,
        assign,
      );
    },
    [assign, say],
  );

  const unseat = React.useCallback(
    (guestId: string) => {
      if (!assign[guestId]) {
        setHeldId(null);
        return;
      }
      setAssign({ ...assign, [guestId]: null });
      setHeldId(null);
      say(`Unseated ${guestById[guestId].name}.`, assign);
    },
    [assign, say],
  );

  const pick = React.useCallback(
    (guestId: string) => {
      const g = guestById[guestId];
      if (g.rsvp === "no") {
        say(`${g.name} has declined, so they cannot be seated.`);
        return;
      }
      setHeldId((prev) => (prev === guestId ? null : guestId));
    },
    [say],
  );

  const stats = React.useMemo<PlanStats>(() => {
    const capacity = tables.reduce((n, t) => n + t.seats, 0);
    const seated = guests.filter((g) => assign[g.id]).length;
    return {
      attending: guests.filter((g) => g.rsvp === "yes").length,
      seated,
      capacity,
      freeSeats: capacity - seated,
      toSeat: guests.filter((g) => g.rsvp === "yes" && !assign[g.id]).length,
      awaiting: guests.filter((g) => (g.rsvp === "maybe" || g.rsvp === "pending") && !assign[g.id]).length,
      declined: guests.filter((g) => g.rsvp === "no").length,
    };
  }, [assign]);

  const unseatedAttending = React.useMemo(
    () => guests.filter((g) => g.rsvp === "yes" && !assign[g.id]),
    [assign],
  );
  const unseatedUnconfirmed = React.useMemo(
    () => guests.filter((g) => (g.rsvp === "maybe" || g.rsvp === "pending") && !assign[g.id]),
    [assign],
  );

  const rules = React.useMemo(() => evaluateRules(assign), [assign]);
  const { tableFlags, guestFlags } = React.useMemo(() => {
    const tf: Record<string, RuleResult[]> = {};
    const gf: Record<string, RuleResult[]> = {};
    for (const r of rules) {
      if (r.status !== "broken") continue;
      for (const t of r.tableIds) (tf[t] ??= []).push(r);
      for (const g of r.guestIds) (gf[g] ??= []).push(r);
    }
    return { tableFlags: tf, guestFlags: gf };
  }, [rules]);

  const value = React.useMemo<PlanContextValue>(
    () => ({
      assign,
      occupants,
      filled,
      stats,
      unseatedAttending,
      unseatedUnconfirmed,
      place,
      unseat,
      heldId,
      pick,
      clearHeld: () => setHeldId(null),
      selectedTableId,
      selectTable: setSelectedTableId,
      dragId,
      setDragId,
      rules,
      tableFlags,
      guestFlags,
    }),
    [assign, occupants, filled, stats, unseatedAttending, unseatedUnconfirmed, place, unseat, heldId, pick, selectedTableId, dragId, rules, tableFlags, guestFlags],
  );

  return (
    <PlanContext.Provider value={value}>
      {children}
      <Snackbar
        key={notice?.key}
        open={notice !== null}
        autoHideDuration={6000}
        onClose={(_, reason) => {
          if (reason === "clickaway") return;
          setNotice(null);
        }}
        message={notice?.text}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        action={
          notice?.undo ? (
            <Button
              color="inherit"
              size="small"
              onClick={() => {
                if (notice.undo) setAssign(notice.undo);
                setNotice(null);
              }}
            >
              Undo
            </Button>
          ) : undefined
        }
      />
    </PlanContext.Provider>
  );
}

export function usePlan(): PlanContextValue {
  const ctx = React.useContext(PlanContext);
  if (!ctx) throw new Error("usePlan must be used inside PlanProvider");
  return ctx;
}
