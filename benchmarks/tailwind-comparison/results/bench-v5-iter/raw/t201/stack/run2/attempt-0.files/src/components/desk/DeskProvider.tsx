"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { type Appointment, clockStart, findClash, initialAppointments } from "@/lib/data";

type NewBooking = { patient: string; vet: string; start: string; minutes: number; reason: string };

type Desk = {
  appointments: Appointment[];
  now: number;
  checkIn: (id: string) => void;
  book: (b: NewBooking) => { ok: true; id: string } | { ok: false; clash: Appointment };
};

const DeskContext = createContext<Desk | null>(null);

export function DeskProvider({ children }: { children: React.ReactNode }) {
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const [now, setNow] = useState(clockStart);

  // The desk clock moves on by a minute every minute.
  useEffect(() => {
    const t = window.setInterval(() => setNow((n) => n + 1), 60000);
    return () => window.clearInterval(t);
  }, []);

  const checkIn = useCallback(
    (id: string) => {
      setAppointments((list) =>
        list.map((a) => (a.id === id && a.status === "booked" ? { ...a, status: "checked_in", checkedInAt: now } : a)),
      );
    },
    [now],
  );

  const book = useCallback(
    (b: NewBooking): { ok: true; id: string } | { ok: false; clash: Appointment } => {
      const clash = findClash(appointments, b.vet, b.start, b.minutes);
      if (clash) return { ok: false, clash };
      const id = `a-${String(appointments.length + 1).padStart(2, "0")}`;
      setAppointments((list) => [...list, { id, status: "booked", ...b }]);
      return { ok: true, id };
    },
    [appointments],
  );

  const value = useMemo(() => ({ appointments, now, checkIn, book }), [appointments, now, checkIn, book]);
  return <DeskContext.Provider value={value}>{children}</DeskContext.Provider>;
}

export function useDesk(): Desk {
  const ctx = useContext(DeskContext);
  if (!ctx) throw new Error("useDesk must be used inside DeskProvider");
  return ctx;
}
