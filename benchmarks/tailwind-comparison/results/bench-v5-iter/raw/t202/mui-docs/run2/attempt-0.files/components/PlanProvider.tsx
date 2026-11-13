"use client";

import * as React from "react";
import Button from "@mui/material/Button";
import Snackbar from "@mui/material/Snackbar";
import {
  type Assign,
  type RuleResult,
  type Stats,
  computeStats,
  evaluateRules,
  firstFreeSeat,
  firstName,
  guestById,
  initialAssign,
  seatsByTable,
  tableById,
} from "@/lib/plan";

interface Toast {
  key: number;
  text: string;
  undo: boolean;
}

interface PlanContextValue {
  assign: Assign;
  seats: Record<string, (string | null)[]>;
  stats: Stats;
  rules: RuleResult[];
  brokenTables: Set<string>;
  flaggedGuests: Set<string>;
  holding: string | null;
  setHolding: (id: string | null) => void;
  selectedTable: string | null;
  selectTable: (id: string | null) => void;
  focusGuest: string | null;
  setFocusGuest: (id: string | null) => void;
  dragId: string | null;
  setDragId: (id: string | null) => void;
  moveGuest: (guestId: string, tableId: string, seat?: number) => boolean;
  unseat: (guestId: string) => void;
  place: (tableId: string, seat?: number) => void;
  undo: () => void;
  canUndo: boolean;
}

const PlanContext = React.createContext<PlanContextValue | null>(null);

export function usePlan(): PlanContextValue {
  const v = React.useContext(PlanContext);
  if (!v) throw new Error("usePlan must be used inside PlanProvider");
  return v;
}

export function PlanProvider({ children }: { children: React.ReactNode }) {
  const [assign, setAssign] = React.useState<Assign>(() => initialAssign());
  const [history, setHistory] = React.useState<Assign[]>([]);
  const [holding, setHolding] = React.useState<string | null>(null);
  const [selectedTable, setSelectedTable] = React.useState<string | null>(null);
  const [focusGuest, setFocusGuest] = React.useState<string | null>(null);
  const [dragId, setDragId] = React.useState<string | null>(null);
  const [toast, setToast] = React.useState<Toast | null>(null);
  const [toastOpen, setToastOpen] = React.useState(false);

  const say = React.useCallback((text: string, undo: boolean) => {
    setToast({ key: Date.now(), text, undo });
    setToastOpen(true);
  }, []);

  const seats = React.useMemo(() => seatsByTable(assign), [assign]);
  const stats = React.useMemo(() => computeStats(assign), [assign]);
  const rules = React.useMemo(() => evaluateRules(assign), [assign]);
  const brokenTables = React.useMemo(() => {
    const s = new Set<string>();
    for (const r of rules) if (r.status === "broken") r.tables.forEach((t) => s.add(t));
    return s;
  }, [rules]);
  const flaggedGuests = React.useMemo(() => {
    const s = new Set<string>();
    for (const r of rules) if (r.status === "broken") r.guestIds.forEach((g) => s.add(g));
    return s;
  }, [rules]);

  const moveGuest = React.useCallback(
    (guestId: string, tableId: string, seat?: number): boolean => {
      const guest = guestById[guestId];
      const table = tableById[tableId];
      if (!guest || !table) return false;
      const row = seats[tableId];
      if (!row) return false;
      const current = assign[guestId] ?? null;

      let target = seat;
      if (target === undefined) {
        if (current?.table === tableId) {
          say(`${firstName(guest.name)} is already at ${table.name}`, false);
          return false;
        }
        target = firstFreeSeat(row, guestId);
        if (target < 0) {
          say(`${table.name} is full. Unseat someone or pick another table.`, false);
          return false;
        }
      }
      if (current && current.table === tableId && current.seat === target) return false;

      const occupantId = row[target] ?? null;
      const next: Assign = { ...assign };
      let text: string;
      if (occupantId && occupantId !== guestId) {
        next[occupantId] = current;
        const other = guestById[occupantId];
        text = current
          ? `${firstName(guest.name)} and ${firstName(other?.name ?? "guest")} swapped seats`
          : `${firstName(guest.name)} seated at ${table.name}, ${firstName(other?.name ?? "guest")} now needs a seat`;
      } else if (current && current.table !== tableId) {
        text = `${firstName(guest.name)} moved to ${table.name}, seat ${target + 1}`;
      } else if (current) {
        text = `${firstName(guest.name)} moved to seat ${target + 1}`;
      } else {
        text = `${firstName(guest.name)} seated at ${table.name}, seat ${target + 1}`;
      }
      next[guestId] = { table: tableId, seat: target };
      setHistory((h) => [...h.slice(-19), assign]);
      setAssign(next);
      say(text, true);
      return true;
    },
    [assign, seats, say],
  );

  const unseat = React.useCallback(
    (guestId: string) => {
      const guest = guestById[guestId];
      if (!guest || !assign[guestId]) return;
      setHistory((h) => [...h.slice(-19), assign]);
      setAssign({ ...assign, [guestId]: null });
      say(`${firstName(guest.name)} unseated`, true);
    },
    [assign, say],
  );

  const place = React.useCallback(
    (tableId: string, seat?: number) => {
      if (!holding) return;
      const ok = moveGuest(holding, tableId, seat);
      if (ok) {
        setHolding(null);
        setSelectedTable(tableId);
      }
    },
    [holding, moveGuest],
  );

  const undo = React.useCallback(() => {
    const prev = history[history.length - 1];
    if (!prev) return;
    setAssign(prev);
    setHistory(history.slice(0, -1));
    setToastOpen(false);
  }, [history]);

  React.useEffect(() => {
    if (!holding) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setHolding(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [holding]);

  const value = React.useMemo<PlanContextValue>(
    () => ({
      assign,
      seats,
      stats,
      rules,
      brokenTables,
      flaggedGuests,
      holding,
      setHolding,
      selectedTable,
      selectTable: setSelectedTable,
      focusGuest,
      setFocusGuest,
      dragId,
      setDragId,
      moveGuest,
      unseat,
      place,
      undo,
      canUndo: history.length > 0,
    }),
    [assign, seats, stats, rules, brokenTables, flaggedGuests, holding, selectedTable, focusGuest, dragId, moveGuest, unseat, place, undo, history.length],
  );

  return (
    <PlanContext.Provider value={value}>
      {children}
      <Snackbar
        key={toast?.key}
        open={toastOpen}
        autoHideDuration={4500}
        onClose={(_, reason) => {
          if (reason !== "clickaway") setToastOpen(false);
        }}
        message={toast?.text}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        action={
          toast?.undo ? (
            <Button color="inherit" size="small" onClick={undo} sx={{ fontWeight: 700 }}>
              Undo
            </Button>
          ) : undefined
        }
      />
    </PlanContext.Provider>
  );
}
