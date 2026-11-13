"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  CLOCK_START,
  DAY_END,
  DAY_START,
  findConflict,
  fromMin,
  initialAppointments,
  patientById,
  toMin,
  vetById,
  type Appointment,
  type Status,
} from "./data";

export interface BookingInput {
  patient: string;
  vet: string;
  start: string;
  minutes: number;
  reason: string;
  urgent: boolean;
}
export type BookResult = { ok: true; appointment: Appointment } | { ok: false; error: string };

interface ClinicState {
  appointments: Appointment[];
  /** Simulated clock, whole minutes since midnight. */
  now: number;
  setStatus: (id: string, status: Status) => void;
  checkIn: (id: string) => void;
  book: (input: BookingInput) => BookResult;
}

const ClinicContext = createContext<ClinicState | null>(null);

export function conflictMessage(appts: Appointment[], vet: string, start: string, minutes: number): string | null {
  const s = toMin(start);
  if (s < DAY_START || s + minutes > DAY_END) return "That time is outside clinic hours (08:00 to 17:00).";
  const c = findConflict(appts, vet, s, minutes);
  if (!c) return null;
  const end = fromMin(toMin(c.start) + c.minutes);
  return `${vetById(vet).name} already has ${patientById(c.patient).name} at ${c.start} to ${end}. Pick another time or vet.`;
}

export function ClinicProvider({ children }: { children: React.ReactNode }) {
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const [now, setNow] = useState(CLOCK_START);

  useEffect(() => {
    const t0 = Date.now();
    const id = window.setInterval(() => {
      setNow(CLOCK_START + Math.floor((Date.now() - t0) / 60000));
    }, 10000);
    return () => window.clearInterval(id);
  }, []);

  const setStatus = useCallback((id: string, status: Status) => {
    setAppointments((list) => list.map((a) => (a.id === id ? { ...a, status } : a)));
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
    (input: BookingInput): BookResult => {
      const error = conflictMessage(appointments, input.vet, input.start, input.minutes);
      if (error) return { ok: false, error };
      const appointment: Appointment = {
        id: `a-${String(appointments.length + 1).padStart(2, "0")}`,
        patient: input.patient,
        vet: input.vet,
        start: input.start,
        minutes: input.minutes,
        reason: input.reason.trim() || "Follow-up",
        status: "booked",
        urgent: input.urgent || undefined,
      };
      setAppointments((list) => [...list, appointment]);
      return { ok: true, appointment };
    },
    [appointments],
  );

  const value = useMemo(() => ({ appointments, now, setStatus, checkIn, book }), [appointments, now, setStatus, checkIn, book]);
  return <ClinicContext.Provider value={value}>{children}</ClinicContext.Provider>;
}

export function useClinic(): ClinicState {
  const ctx = useContext(ClinicContext);
  if (!ctx) throw new Error("useClinic must be used inside ClinicProvider");
  return ctx;
}

export function sortAppointments(list: Appointment[]): Appointment[] {
  return [...list].sort((a, b) => toMin(a.start) - toMin(b.start) || a.vet.localeCompare(b.vet));
}
