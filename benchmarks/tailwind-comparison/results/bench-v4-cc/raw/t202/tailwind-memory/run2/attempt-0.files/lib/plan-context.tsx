"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { guests, type Guest } from "./data";
import { evaluateRules, guestById, initialSeating, tableById, tableMap, type RuleResult, type Seating } from "./plan";

export interface Notice {
  id: number;
  text: string;
  tone: "ok" | "warn";
}

interface PlanStats {
  seated: number;
  confirmed: number;
  confirmedSeated: number;
  toSeat: Guest[];
  unconfirmed: Guest[];
  brokenCount: number;
  openCount: number;
  okCount: number;
}

interface PlanContextValue {
  seating: Seating;
  tableOf: Map<string, string>;
  results: RuleResult[];
  stats: PlanStats;
  notice: Notice | null;
  assign: (guestId: string, tableId: string, index?: number) => boolean;
  unseat: (guestId: string) => void;
  reset: () => void;
}

const PlanContext = createContext<PlanContextValue | null>(null);

export function usePlan(): PlanContextValue {
  const ctx = useContext(PlanContext);
  if (!ctx) throw new Error("usePlan must be used inside PlanProvider");
  return ctx;
}

export function PlanProvider({ children }: { children: ReactNode }) {
  const [seating, setSeating] = useState<Seating>(initialSeating);
  const [notice, setNotice] = useState<Notice | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const say = useCallback((text: string, tone: Notice["tone"] = "ok") => {
    setNotice({ id: Date.now(), text, tone });
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setNotice(null), 4500);
  }, []);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const tableOf = useMemo(() => tableMap(seating), [seating]);
  const results = useMemo(() => evaluateRules(tableOf), [tableOf]);

  const stats = useMemo<PlanStats>(() => {
    const confirmedGuests = guests.filter((g) => g.rsvp === "yes");
    return {
      seated: tableOf.size,
      confirmed: confirmedGuests.length,
      confirmedSeated: confirmedGuests.filter((g) => tableOf.has(g.id)).length,
      toSeat: confirmedGuests.filter((g) => !tableOf.has(g.id)),
      unconfirmed: guests.filter((g) => (g.rsvp === "maybe" || g.rsvp === "pending") && !tableOf.has(g.id)),
      brokenCount: results.filter((r) => r.status === "broken").length,
      openCount: results.filter((r) => r.status === "open").length,
      okCount: results.filter((r) => r.status === "ok").length,
    };
  }, [tableOf, results]);

  const assign = useCallback(
    (guestId: string, tableId: string, index?: number): boolean => {
      const g = guestById[guestId];
      const t = tableById[tableId];
      if (!g || !t) return false;
      if (g.rsvp === "no") {
        say(`${g.name} has declined, so they cannot be seated.`, "warn");
        return false;
      }
      const next: Seating = Object.fromEntries(Object.entries(seating).map(([k, v]) => [k, [...v]]));
      const fromTable = tableOf.get(guestId) ?? null;
      const fromIndex = fromTable ? next[fromTable].indexOf(guestId) : -1;
      const row = next[tableId];
      let target = index ?? -1;

      if (target < 0 || target >= row.length) {
        if (fromTable === tableId) {
          say(`${g.name} is already at ${t.name}.`);
          return true;
        }
        target = row.indexOf(null);
        if (target < 0) {
          say(`${t.name} is full. Unseat someone or choose another table.`, "warn");
          return false;
        }
      }

      const occupantId = row[target];
      if (occupantId === guestId) return true;

      if (occupantId) {
        const occupant = guestById[occupantId];
        if (fromTable) {
          next[fromTable][fromIndex] = occupantId;
          row[target] = guestId;
          say(`${g.name} and ${occupant.name} swapped seats.`);
        } else {
          const free = row.indexOf(null);
          if (free < 0) {
            say(`${t.name} is full. Drag a seated guest onto a seat to swap, or unseat someone first.`, "warn");
            return false;
          }
          row[free] = guestId;
          say(`${g.name} seated at ${t.name}.`);
        }
      } else {
        if (fromTable) next[fromTable][fromIndex] = null;
        row[target] = guestId;
        say(
          fromTable && fromTable !== tableId
            ? `${g.name} moved from ${tableById[fromTable].name} to ${t.name}.`
            : `${g.name} seated at ${t.name}.`,
        );
      }
      setSeating(next);
      return true;
    },
    [seating, tableOf, say],
  );

  const unseat = useCallback(
    (guestId: string) => {
      const from = tableOf.get(guestId);
      if (!from) return;
      setSeating((prev) => ({ ...prev, [from]: prev[from].map((id) => (id === guestId ? null : id)) }));
      say(`${guestById[guestId].name} unseated from ${tableById[from].name}.`);
    },
    [tableOf, say],
  );

  const reset = useCallback(() => {
    setSeating(initialSeating());
    say("Plan reset to the starting arrangement.");
  }, [say]);

  const value = useMemo<PlanContextValue>(
    () => ({ seating, tableOf, results, stats, notice, assign, unseat, reset }),
    [seating, tableOf, results, stats, notice, assign, unseat, reset],
  );

  return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>;
}
