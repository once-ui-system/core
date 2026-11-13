"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { Box } from "@chakra-ui/react";
import { guests, partyPalette, type Guest } from "@/lib/data";
import {
  brokenSets,
  evaluateRules,
  guestById,
  initialSeating,
  occupancy,
  tableById,
  type RuleResult,
  type Seating,
} from "@/lib/plan";

interface DragState {
  guestId: string;
  x: number;
  y: number;
}

export interface Notice {
  id: number;
  text: string;
  tone: "ok" | "warn";
}

interface PlanContextValue {
  seating: Seating;
  occ: Record<string, (string | null)[]>;
  results: RuleResult[];
  brokenTables: Set<string>;
  brokenGuests: Set<string>;
  selectedGuestId: string | null;
  selectedTableId: string | null;
  activeGuestId: string | null;
  drag: DragState | null;
  dropTarget: string | null;
  notice: Notice | null;
  canUndo: boolean;
  seatedCount: number;
  attendingCount: number;
  toPlace: Guest[];
  undecidedUnseated: Guest[];
  selectGuest: (id: string | null) => void;
  selectTable: (id: string | null) => void;
  placeGuest: (guestId: string, tableId: string, seat?: number) => void;
  unseat: (guestId: string) => void;
  activateTable: (tableId: string) => void;
  activateSeat: (tableId: string, seat: number) => void;
  beginPress: (e: ReactPointerEvent, guestId: string) => void;
  consumeClick: () => boolean;
  undo: () => void;
  reset: () => void;
}

const PlanContext = createContext<PlanContextValue | null>(null);

export function usePlan(): PlanContextValue {
  const ctx = useContext(PlanContext);
  if (!ctx) throw new Error("usePlan must be used inside PlanProvider");
  return ctx;
}

function targetAt(x: number, y: number): string | null {
  const el = document.elementFromPoint(x, y);
  if (!el) return null;
  const seat = el.closest("[data-seat]");
  if (seat) return `seat:${seat.getAttribute("data-seat")}`;
  const table = el.closest("[data-table]");
  if (table) return `table:${table.getAttribute("data-table")}`;
  if (el.closest("[data-unseat-zone]")) return "unseat";
  return null;
}

export function PlanProvider({ children }: { children: ReactNode }) {
  const [seating, setSeating] = useState<Seating>(initialSeating);
  const [history, setHistory] = useState<Seating[]>([]);
  const [selectedGuestId, setSelectedGuestId] = useState<string | null>(null);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [drag, setDrag] = useState<DragState | null>(null);
  const [dropTarget, setDropTarget] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);

  const seatingRef = useRef(seating);
  seatingRef.current = seating;
  const historyRef = useRef(history);
  historyRef.current = history;
  const selectedGuestRef = useRef(selectedGuestId);
  selectedGuestRef.current = selectedGuestId;
  const noticeId = useRef(0);
  const lastDragEnd = useRef(0);

  const say = useCallback((text: string, tone: "ok" | "warn" = "ok") => {
    noticeId.current += 1;
    setNotice({ id: noticeId.current, text, tone });
  }, []);

  const commit = useCallback(
    (next: Seating, message: string) => {
      const prevBroken = new Set(
        evaluateRules(seatingRef.current)
          .filter((r) => r.status === "broken")
          .map((r) => r.id),
      );
      const fresh = evaluateRules(next).filter((r) => r.status === "broken" && !prevBroken.has(r.id));
      setHistory((h) => [...h.slice(-29), seatingRef.current]);
      seatingRef.current = next;
      setSeating(next);
      if (fresh.length) {
        say(`${message} Rule broken: ${fresh.map((r) => r.title).join("; ")}.`, "warn");
      } else {
        say(message, "ok");
      }
    },
    [say],
  );

  const placeGuest = useCallback(
    (guestId: string, tableId: string, seat?: number) => {
      const cur = seatingRef.current;
      const guest = guestById.get(guestId);
      const table = tableById.get(tableId);
      if (!guest || !table) return;
      if (guest.rsvp === "no") {
        say(`${guest.name} has declined, so there is no seat to give.`, "warn");
        return;
      }
      const row = occupancy(cur)[tableId];
      const from = cur[guestId];
      let target = seat;
      if (target !== undefined && row[target] && row[target] !== guestId) {
        const other = row[target] as string;
        if (from) {
          commit(
            {
              ...cur,
              [guestId]: { table: tableId, seat: target },
              [other]: { table: from.table, seat: from.seat },
            },
            `Swapped ${guest.name} and ${guestById.get(other)?.name ?? "a guest"}.`,
          );
          setSelectedGuestId(null);
          setSelectedTableId(tableId);
          return;
        }
        target = undefined;
      }
      if (target === undefined) {
        if (from && from.table === tableId) {
          say(`${guest.name} is already at ${table.name}.`);
          return;
        }
        target = row.findIndex((s) => s === null);
        if (target < 0) {
          say(`${table.name} is full. Unseat someone or choose another table.`, "warn");
          return;
        }
      }
      if (from && from.table === tableId && from.seat === target) return;
      commit(
        { ...cur, [guestId]: { table: tableId, seat: target } },
        from
          ? `Moved ${guest.name} from ${tableById.get(from.table)?.name} to ${table.name}.`
          : `Seated ${guest.name} at ${table.name}.`,
      );
      setSelectedGuestId(null);
      setSelectedTableId(tableId);
    },
    [commit, say],
  );

  const unseat = useCallback(
    (guestId: string) => {
      const cur = seatingRef.current;
      const from = cur[guestId];
      const guest = guestById.get(guestId);
      if (!from || !guest) return;
      const next = { ...cur };
      delete next[guestId];
      commit(next, `Unseated ${guest.name} from ${tableById.get(from.table)?.name}.`);
      setSelectedGuestId(null);
    },
    [commit],
  );

  const selectGuest = useCallback((id: string | null) => {
    setSelectedGuestId(id);
    if (id) {
      const s = seatingRef.current[id];
      setSelectedTableId(s ? s.table : null);
    }
  }, []);

  const selectTable = useCallback((id: string | null) => {
    setSelectedTableId(id);
    setSelectedGuestId(null);
  }, []);

  const activateTable = useCallback(
    (tableId: string) => {
      const g = selectedGuestRef.current;
      if (g) placeGuest(g, tableId);
      else setSelectedTableId((cur) => (cur === tableId ? null : tableId));
    },
    [placeGuest],
  );

  const activateSeat = useCallback(
    (tableId: string, seat: number) => {
      const g = selectedGuestRef.current;
      const occupant = occupancy(seatingRef.current)[tableId][seat];
      if (g && occupant !== g) {
        placeGuest(g, tableId, seat);
        return;
      }
      if (occupant) {
        setSelectedGuestId((cur) => (cur === occupant ? null : occupant));
        setSelectedTableId(tableId);
      } else {
        setSelectedGuestId(null);
        setSelectedTableId(tableId);
      }
    },
    [placeGuest],
  );

  const apply = useCallback(
    (guestId: string, target: string | null) => {
      if (!target) return;
      if (target === "unseat") {
        unseat(guestId);
        return;
      }
      // "seat:t-1:3" or "table:t-1"
      const parts = target.split(":");
      if (parts[0] === "seat" && parts.length === 3) {
        placeGuest(guestId, parts[1], Number(parts[2]));
      } else if (parts[0] === "table" && parts.length === 2) {
        placeGuest(guestId, parts[1]);
      }
    },
    [placeGuest, unseat],
  );

  const beginPress = useCallback(
    (e: ReactPointerEvent, guestId: string) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      const sx = e.clientX;
      const sy = e.clientY;
      let dragging = false;

      const move = (ev: PointerEvent) => {
        if (!dragging && Math.hypot(ev.clientX - sx, ev.clientY - sy) > 6) dragging = true;
        if (dragging) {
          setDrag({ guestId, x: ev.clientX, y: ev.clientY });
          setDropTarget(targetAt(ev.clientX, ev.clientY));
        }
      };
      const stop = () => {
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", up);
        window.removeEventListener("pointercancel", cancel);
      };
      const up = (ev: PointerEvent) => {
        stop();
        if (!dragging) return;
        lastDragEnd.current = performance.now();
        const target = targetAt(ev.clientX, ev.clientY);
        setDrag(null);
        setDropTarget(null);
        apply(guestId, target);
      };
      const cancel = () => {
        stop();
        if (dragging) lastDragEnd.current = performance.now();
        setDrag(null);
        setDropTarget(null);
      };
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);
      window.addEventListener("pointercancel", cancel);
    },
    [apply],
  );

  const consumeClick = useCallback(() => performance.now() - lastDragEnd.current < 350, []);

  const undo = useCallback(() => {
    const h = historyRef.current;
    if (!h.length) return;
    const prev = h[h.length - 1];
    seatingRef.current = prev;
    setSeating(prev);
    setHistory(h.slice(0, -1));
    say("Undid the last change.");
  }, [say]);

  const reset = useCallback(() => {
    const start = initialSeating();
    setHistory((h) => [...h.slice(-29), seatingRef.current]);
    seatingRef.current = start;
    setSeating(start);
    setSelectedGuestId(null);
    say("Plan reset to the starting arrangement.");
  }, [say]);

  const value = useMemo<PlanContextValue>(() => {
    const results = evaluateRules(seating);
    const sets = brokenSets(results);
    const attending = guests.filter((g) => g.rsvp === "yes");
    return {
      seating,
      occ: occupancy(seating),
      results,
      brokenTables: sets.tables,
      brokenGuests: sets.guests,
      selectedGuestId,
      selectedTableId,
      activeGuestId: drag?.guestId ?? selectedGuestId,
      drag,
      dropTarget,
      notice,
      canUndo: history.length > 0,
      seatedCount: Object.keys(seating).length,
      attendingCount: attending.length,
      toPlace: attending.filter((g) => !seating[g.id]),
      undecidedUnseated: guests.filter((g) => (g.rsvp === "maybe" || g.rsvp === "pending") && !seating[g.id]),
      selectGuest,
      selectTable,
      placeGuest,
      unseat,
      activateTable,
      activateSeat,
      beginPress,
      consumeClick,
      undo,
      reset,
    };
  }, [
    seating, selectedGuestId, selectedTableId, drag, dropTarget, notice, history,
    selectGuest, selectTable, placeGuest, unseat, activateTable, activateSeat, beginPress, consumeClick, undo, reset,
  ]);

  const dragGuest = drag ? guestById.get(drag.guestId) : null;
  const dragPalette = dragGuest ? (partyPalette[dragGuest.party] ?? "gray") : "gray";

  return (
    <PlanContext.Provider value={value}>
      {children}
      {drag && dragGuest ? (
        <Box
          aria-hidden
          position="fixed"
          zIndex="toast"
          pointerEvents="none"
          left={`${drag.x + 14}px`}
          top={`${drag.y + 10}px`}
          px="3"
          py="1.5"
          rounded="full"
          bg={`${dragPalette}.solid`}
          color={`${dragPalette}.contrast`}
          fontSize="sm"
          fontWeight="semibold"
          shadow="lg"
          whiteSpace="nowrap"
        >
          {dragGuest.name}
        </Box>
      ) : null}
    </PlanContext.Provider>
  );
}
