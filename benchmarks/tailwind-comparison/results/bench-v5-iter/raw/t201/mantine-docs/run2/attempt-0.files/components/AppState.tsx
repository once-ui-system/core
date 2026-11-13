"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  type Appointment,
  NOW_START,
  fromMinutes,
  findClash,
  initialAppointments,
} from "@/lib/data";

interface NewAppointment {
  patient: string;
  vet: string;
  start: string;
  minutes: number;
  reason: string;
}

interface AppState {
  appointments: Appointment[];
  /** Simulated clock, minutes since midnight. */
  now: number;
  checkIn: (id: string) => void;
  /** Returns the clashing appointment, or the created one. */
  book: (a: NewAppointment) => { ok: true; appointment: Appointment } | { ok: false; clash: Appointment };
}

const Ctx = createContext<AppState | null>(null);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const [now, setNow] = useState(NOW_START);

  useEffect(() => {
    const t = window.setInterval(() => setNow((n) => n + 1), 60000);
    return () => window.clearInterval(t);
  }, []);

  const checkIn = useCallback(
    (id: string) =>
      setAppointments((list) =>
        list.map((a) =>
          a.id === id && a.status === "booked" ? { ...a, status: "checked_in", checkedInAt: now } : a,
        ),
      ),
    [now],
  );

  const book = useCallback<AppState["book"]>(
    (input) => {
      const clash = findClash(appointments, input.vet, input.start, input.minutes);
      if (clash) return { ok: false, clash };
      const appointment: Appointment = {
        id: `a-${String(appointments.length + 1).padStart(2, "0")}`,
        status: "booked",
        ...input,
      };
      setAppointments((list) => [...list, appointment]);
      return { ok: true, appointment };
    },
    [appointments],
  );

  const value = useMemo(() => ({ appointments, now, checkIn, book }), [appointments, now, checkIn, book]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAppState() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAppState must be used inside AppStateProvider");
  return v;
}

export const clockLabel = (n: number) => fromMinutes(n);
