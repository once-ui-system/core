"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { guests, tables } from "@/lib/data";
import {
  evaluateRules,
  guestById,
  initialSeats,
  occupants,
  placeGuest,
  TOTAL_SEATS,
  unseatGuest,
  type Occupants,
  type RuleResult,
  type Seats,
} from "@/lib/plan";
import s from "./seatwise.module.css";

export interface DragState {
  guestId: string;
  x: number;
  y: number;
  over: string | null;
}

export interface Stats {
  attending: number;
  seated: number;
  seatedAttending: number;
  unseated: string[];
  awaiting: string[];
  freeSeats: number;
  totalSeats: number;
  unconfirmedSeated: number;
}

interface PlannerContextValue {
  seats: Seats;
  occ: Occupants;
  rules: RuleResult[];
  stats: Stats;
  selectedTable: string | null;
  picked: string | null;
  drag: DragState | null;
  place: (guestId: string, tableId: string, seatIdx?: number) => void;
  unseat: (guestId: string) => void;
  pick: (id: string | null) => void;
  togglePick: (id: string) => void;
  selectTable: (id: string | null) => void;
  beginDrag: (e: ReactPointerEvent<Element>, guestId: string) => void;
  wasDragged: () => boolean;
  announce: (msg: string) => void;
}

const PlannerContext = createContext<PlannerContextValue | null>(null);

export function usePlanner(): PlannerContextValue {
  const ctx = useContext(PlannerContext);
  if (!ctx) throw new Error("usePlanner must be used inside PlannerProvider");
  return ctx;
}

function targetAt(x: number, y: number): string | null {
  const el = document.elementFromPoint(x, y);
  const hit = el?.closest("[data-drop]");
  return hit ? hit.getAttribute("data-drop") : null;
}

export function PlannerProvider({ children }: { children: ReactNode }) {
  const [seats, setSeats] = useState<Seats>(() => initialSeats());
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [picked, setPicked] = useState<string | null>(null);
  const [drag, setDrag] = useState<DragState | null>(null);
  const [message, setMessage] = useState("");
  const seatsRef = useRef(seats);
  const suppress = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    seatsRef.current = seats;
  }, [seats]);

  const announce = useCallback((msg: string) => {
    setMessage(msg);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setMessage(""), 5000);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPicked(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const place = useCallback(
    (guestId: string, tableId: string, seatIdx?: number) => {
      const res = placeGuest(seatsRef.current, guestId, tableId, seatIdx);
      if (res.ok) {
        seatsRef.current = res.seats;
        setSeats(res.seats);
        setPicked(null);
        setSelectedTable(tableId);
      }
      announce(res.message);
    },
    [announce],
  );

  const unseat = useCallback(
    (guestId: string) => {
      const res = unseatGuest(seatsRef.current, guestId);
      if (res.ok) {
        seatsRef.current = res.seats;
        setSeats(res.seats);
        setPicked(null);
      }
      announce(res.message);
    },
    [announce],
  );

  const pick = useCallback((id: string | null) => setPicked(id), []);

  const togglePick = useCallback(
    (id: string) => {
      setPicked((p) => (p === id ? null : id));
      announce(`${guestById.get(id)?.name ?? "Guest"} picked. Choose a seat or table, or press Escape to cancel.`);
    },
    [announce],
  );

  const beginDrag = useCallback(
    (e: ReactPointerEvent<Element>, guestId: string) => {
      const target = e.target as Element;
      if (e.pointerType === "mouse" && e.button !== 0) return;
      if (target.closest("select, input, textarea")) return;
      if (e.pointerType !== "mouse" && !target.closest("[data-grip]")) return;
      const sx = e.clientX;
      const sy = e.clientY;
      let active = false;

      const onMove = (ev: PointerEvent) => {
        if (!active) {
          if (Math.hypot(ev.clientX - sx, ev.clientY - sy) < 6) return;
          active = true;
          document.body.style.userSelect = "none";
        }
        setDrag({ guestId, x: ev.clientX, y: ev.clientY, over: targetAt(ev.clientX, ev.clientY) });
      };
      const cleanup = () => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        window.removeEventListener("pointercancel", onCancel);
        document.body.style.userSelect = "";
      };
      const onCancel = () => {
        cleanup();
        if (active) {
          setDrag(null);
          suppress.current = true;
          setTimeout(() => {
            suppress.current = false;
          }, 0);
        }
      };
      const onUp = (ev: PointerEvent) => {
        cleanup();
        if (!active) return;
        const over = targetAt(ev.clientX, ev.clientY);
        setDrag(null);
        suppress.current = true;
        setTimeout(() => {
          suppress.current = false;
        }, 0);
        if (!over) return;
        if (over === "unseat") {
          unseat(guestId);
          return;
        }
        const [kind, tableId, seatIdx] = over.split(":");
        if (kind === "seat" && tableId && seatIdx !== undefined) place(guestId, tableId, Number(seatIdx));
        else if (kind === "table" && tableId) place(guestId, tableId);
      };
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
      window.addEventListener("pointercancel", onCancel);
    },
    [place, unseat],
  );

  const wasDragged = useCallback(() => suppress.current, []);

  const selectTable = useCallback((id: string | null) => setSelectedTable(id), []);

  const occ = useMemo(() => occupants(seats), [seats]);
  const rules = useMemo(() => evaluateRules(seats), [seats]);
  const stats = useMemo<Stats>(() => {
    const attendingGuests = guests.filter((g) => g.rsvp === "yes");
    const seated = Object.keys(seats).length;
    const seatedAttending = attendingGuests.filter((g) => seats[g.id]).length;
    return {
      attending: attendingGuests.length,
      seated,
      seatedAttending,
      unseated: attendingGuests.filter((g) => !seats[g.id]).map((g) => g.id),
      awaiting: guests
        .filter((g) => (g.rsvp === "maybe" || g.rsvp === "pending") && !seats[g.id])
        .map((g) => g.id),
      freeSeats: TOTAL_SEATS - seated,
      totalSeats: TOTAL_SEATS,
      unconfirmedSeated: seated - seatedAttending,
    };
  }, [seats]);

  const value = useMemo<PlannerContextValue>(
    () => ({
      seats,
      occ,
      rules,
      stats,
      selectedTable,
      picked,
      drag,
      place,
      unseat,
      pick,
      togglePick,
      selectTable,
      beginDrag,
      wasDragged,
      announce,
    }),
    [seats, occ, rules, stats, selectedTable, picked, drag, place, unseat, pick, togglePick, selectTable, beginDrag, wasDragged, announce],
  );

  const dragName = drag ? guestById.get(drag.guestId)?.name : null;

  return (
    <PlannerContext.Provider value={value}>
      {children}
      <div className={s.toastWrap} role="status" aria-live="polite">
        {message ? <div className={s.toast}>{message}</div> : null}
      </div>
      {drag && dragName ? (
        <div className={s.ghost} style={{ left: drag.x, top: drag.y }} aria-hidden="true">
          {dragName}
        </div>
      ) : null}
    </PlannerContext.Provider>
  );
}

export { tables };
