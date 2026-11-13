"use client";

import * as React from "react";
import { toast } from "sonner";
import { GUESTS, TABLES, firstName, type Guest } from "@/lib/data";
import {
  GUESTS_BY_ID,
  TABLES_BY_ID,
  TOTAL_SEATS,
  evaluateRules,
  initialSeating,
  type RuleResult,
  type RuleStatus,
  type Seating,
} from "@/lib/plan";

export type Panel = "place" | "table" | "rules";

interface PlanContextValue {
  seating: Seating;
  tableOf: Record<string, string | undefined>;
  perTable: Record<string, number>;
  seatedCount: number;
  attendingCount: number;
  toPlace: Guest[];
  awaiting: Guest[];
  totalSeats: number;
  results: RuleResult[];
  tableFlags: Record<string, RuleStatus | undefined>;
  guestFlags: Set<string>;
  selectedTableId: string | null;
  pickedId: string | null;
  panel: Panel;
  setPanel: (p: Panel) => void;
  selectTable: (id: string | null) => void;
  pick: (id: string | null) => void;
  seat: (guestId: string, tableId: string, seatIndex?: number) => void;
  unseat: (guestId: string) => void;
}

const PlanContext = React.createContext<PlanContextValue | null>(null);

export function usePlan(): PlanContextValue {
  const ctx = React.useContext(PlanContext);
  if (!ctx) throw new Error("usePlan must be used inside PlanProvider");
  return ctx;
}

function cloneSeating(s: Seating): Seating {
  const next: Seating = {};
  for (const key of Object.keys(s)) next[key] = [...(s[key] ?? [])];
  return next;
}

export function PlanProvider({ children }: { children: React.ReactNode }) {
  const [seating, setSeating] = React.useState<Seating>(initialSeating);
  const [selectedTableId, setSelectedTableId] = React.useState<string | null>(null);
  const [pickedId, setPickedId] = React.useState<string | null>(null);
  const [panel, setPanel] = React.useState<Panel>("place");

  const tableOf = React.useMemo(() => {
    const map: Record<string, string | undefined> = {};
    for (const tid of Object.keys(seating)) {
      for (const gid of seating[tid] ?? []) if (gid) map[gid] = tid;
    }
    return map;
  }, [seating]);

  const perTable = React.useMemo(() => {
    const map: Record<string, number> = {};
    for (const tid of Object.keys(seating)) {
      map[tid] = (seating[tid] ?? []).filter(Boolean).length;
    }
    return map;
  }, [seating]);

  const results = React.useMemo(() => evaluateRules(tableOf), [tableOf]);

  const { tableFlags, guestFlags } = React.useMemo(() => {
    const tf: Record<string, RuleStatus | undefined> = {};
    const gf = new Set<string>();
    for (const r of results) {
      if (r.status === "ok") continue;
      for (const tid of r.tableIds) {
        if (r.status === "broken" || !tf[tid]) tf[tid] = r.status;
      }
      if (r.status === "broken") r.guestIds.forEach((id) => gf.add(id));
    }
    return { tableFlags: tf, guestFlags: gf };
  }, [results]);

  const seatedCount = Object.keys(tableOf).length;
  const attendingCount = GUESTS.filter((x) => x.rsvp === "yes").length;
  const toPlace = React.useMemo(
    () => GUESTS.filter((x) => x.rsvp === "yes" && !tableOf[x.id]),
    [tableOf],
  );
  const awaiting = React.useMemo(
    () => GUESTS.filter((x) => (x.rsvp === "maybe" || x.rsvp === "pending") && !tableOf[x.id]),
    [tableOf],
  );

  const commit = React.useCallback(
    (next: Seating, message: string, description?: string) => {
      const previous = seating;
      setSeating(next);
      toast.success(message, {
        description,
        action: { label: "Undo", onClick: () => setSeating(previous) },
      });
    },
    [seating],
  );

  const seat = React.useCallback(
    (guestId: string, tableId: string, seatIndex?: number) => {
      const guest = GUESTS_BY_ID[guestId];
      const table = TABLES_BY_ID[tableId];
      if (!guest || !table) return;
      if (guest.rsvp === "no") {
        toast.error(`${guest.name} has declined`, { description: "Declined guests do not get a seat." });
        return;
      }
      const next = cloneSeating(seating);
      let fromTable: string | undefined;
      let fromIndex = -1;
      for (const tid of Object.keys(next)) {
        const i = (next[tid] ?? []).indexOf(guestId);
        if (i >= 0) {
          fromTable = tid;
          fromIndex = i;
        }
      }
      const dest = next[tableId];
      if (!dest) return;
      let index = seatIndex;
      if (index === undefined) {
        if (fromTable === tableId) {
          setPickedId(null);
          return;
        }
        index = dest.indexOf(null);
        if (index < 0) {
          toast.error(`${table.name} is full`, {
            description: "Choose another table, or unseat someone first.",
          });
          return;
        }
      }
      const occupant = dest[index] ?? null;
      if (occupant === guestId) {
        setPickedId(null);
        return;
      }
      if (fromTable) (next[fromTable] as (string | null)[])[fromIndex] = null;
      dest[index] = guestId;
      let description: string | undefined;
      if (occupant) {
        const o = GUESTS_BY_ID[occupant];
        if (fromTable) {
          (next[fromTable] as (string | null)[])[fromIndex] = occupant;
          description = `${o ? firstName(o.name) : "Guest"} moved to ${TABLES_BY_ID[fromTable]?.name ?? "the other seat"}.`;
        } else {
          description = `${o ? firstName(o.name) : "Guest"} is now unseated.`;
        }
      }
      const verb = fromTable ? "moved to" : "seated at";
      commit(next, `${firstName(guest.name)} ${verb} ${table.name}`, description);
      setPickedId(null);
      setSelectedTableId(tableId);
    },
    [seating, commit],
  );

  const unseat = React.useCallback(
    (guestId: string) => {
      const guest = GUESTS_BY_ID[guestId];
      const next = cloneSeating(seating);
      let found = false;
      for (const tid of Object.keys(next)) {
        const list = next[tid] ?? [];
        const i = list.indexOf(guestId);
        if (i >= 0) {
          list[i] = null;
          found = true;
        }
      }
      setPickedId(null);
      if (!found || !guest) return;
      commit(next, `${firstName(guest.name)} unseated`, "Back in the list of guests to place.");
    },
    [seating, commit],
  );

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPickedId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const value = React.useMemo<PlanContextValue>(
    () => ({
      seating,
      tableOf,
      perTable,
      seatedCount,
      attendingCount,
      toPlace,
      awaiting,
      totalSeats: TOTAL_SEATS,
      results,
      tableFlags,
      guestFlags,
      selectedTableId,
      pickedId,
      panel,
      setPanel,
      selectTable: setSelectedTableId,
      pick: setPickedId,
      seat,
      unseat,
    }),
    [
      seating,
      tableOf,
      perTable,
      seatedCount,
      attendingCount,
      toPlace,
      awaiting,
      results,
      tableFlags,
      guestFlags,
      selectedTableId,
      pickedId,
      panel,
      seat,
      unseat,
    ],
  );

  return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>;
}

export const ALL_TABLES = TABLES;
