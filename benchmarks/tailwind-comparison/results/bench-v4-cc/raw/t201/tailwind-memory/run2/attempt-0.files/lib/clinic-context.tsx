"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { initialAppointments, NOW_START, toMin, type Appointment, type Status, fromMin } from "@/lib/data";

export interface BookInput {
  patient: string;
  vet: string;
  start: string;
  minutes: number;
  reason: string;
  urgent: boolean;
}

interface ClinicState {
  appointments: Appointment[];
  /** Front desk clock, minutes after midnight. */
  now: number;
  checkIn: (id: string) => void;
  setStatus: (id: string, status: Status) => void;
  book: (input: BookInput) => Appointment;
}

const ClinicContext = createContext<ClinicState | null>(null);

export function ClinicProvider({ children }: { children: React.ReactNode }) {
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const [now, setNow] = useState(NOW_START);

  useEffect(() => {
    const t = window.setInterval(() => setNow((n) => n + 1), 60_000);
    return () => window.clearInterval(t);
  }, []);

  const setStatus = useCallback((id: string, status: Status) => {
    setAppointments((list) => list.map((a) => (a.id === id ? { ...a, status } : a)));
  }, []);

  const checkIn = useCallback(
    (id: string) => {
      setAppointments((list) =>
        list.map((a) => (a.id === id ? { ...a, status: "checked_in", checkedInAt: fromMin(now) } : a)),
      );
    },
    [now],
  );

  const book = useCallback(
    (input: BookInput): Appointment => {
      const appointment: Appointment = {
        id: `a-${String(appointments.length + 1).padStart(2, "0")}`,
        patient: input.patient,
        vet: input.vet,
        start: input.start,
        minutes: input.minutes,
        reason: input.reason,
        status: "booked",
        ...(input.urgent ? { urgent: true } : {}),
      };
      setAppointments((list) => [...list, appointment]);
      return appointment;
    },
    [appointments.length],
  );

  const value = useMemo(() => ({ appointments, now, checkIn, setStatus, book }), [appointments, now, checkIn, setStatus, book]);
  return <ClinicContext.Provider value={value}>{children}</ClinicContext.Provider>;
}

export function useClinic(): ClinicState {
  const ctx = useContext(ClinicContext);
  if (!ctx) throw new Error("useClinic must be used inside ClinicProvider");
  return ctx;
}

export const minutesWaiting = (a: Appointment, now: number): number =>
  a.checkedInAt ? Math.max(0, now - toMin(a.checkedInAt)) : 0;
