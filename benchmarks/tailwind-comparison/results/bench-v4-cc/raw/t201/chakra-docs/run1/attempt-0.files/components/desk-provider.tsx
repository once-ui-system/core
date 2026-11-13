"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { toaster } from "@/components/ui/toaster";
import {
  CLOCK_START,
  fmtClock,
  getPatient,
  getVet,
  initialAppointments,
  toMinutes,
  type Appointment,
  type Status,
} from "@/lib/data";

export interface Slot {
  patient: string;
  vet: string;
  start: number;
  minutes: number;
}

export interface BookInput extends Slot {
  reason: string;
  urgent: boolean;
}

export type BookResult = { ok: true; appointment: Appointment } | { ok: false; error: string };

/** Returns a message when the slot overlaps a live booking for the same vet (or the same patient). */
export function findConflict(list: Appointment[], slot: Slot): string | null {
  const end = slot.start + slot.minutes;
  let patientClash: string | null = null;
  for (const a of list) {
    if (a.status === "cancelled") continue;
    const s = toMinutes(a.start);
    const e = s + a.minutes;
    if (!(slot.start < e && end > s)) continue;
    if (a.vet === slot.vet) {
      return `${getVet(a.vet).name} is already booked ${fmtClock(s)} to ${fmtClock(e)} (${getPatient(a.patient).name}, ${a.reason}).`;
    }
    if (a.patient === slot.patient && !patientClash) {
      patientClash = `${getPatient(a.patient).name} already has an appointment with ${getVet(a.vet).name} at ${fmtClock(s)}.`;
    }
  }
  return patientClash;
}

interface Desk {
  appointments: Appointment[];
  /** Front desk clock, minutes since midnight. */
  now: number;
  checkIn: (id: string) => void;
  setStatus: (id: string, status: Status) => void;
  book: (input: BookInput) => BookResult;
  conflictFor: (slot: Slot) => string | null;
}

const DeskContext = createContext<Desk | null>(null);

export function useDesk(): Desk {
  const ctx = useContext(DeskContext);
  if (!ctx) throw new Error("useDesk must be used inside DeskProvider");
  return ctx;
}

export function DeskProvider({ children }: { children: ReactNode }) {
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const [now, setNow] = useState(CLOCK_START);

  useEffect(() => {
    const t0 = Date.now();
    const id = window.setInterval(() => {
      setNow(CLOCK_START + Math.floor((Date.now() - t0) / 60000));
    }, 15000);
    return () => window.clearInterval(id);
  }, []);

  const checkIn = useCallback(
    (id: string) => {
      const appt = appointments.find((a) => a.id === id);
      if (!appt || appt.status !== "booked") return;
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: "checked_in" as const, checkedInAt: now } : a)),
      );
      const patient = getPatient(appt.patient);
      const vet = getVet(appt.vet);
      toaster.create({
        type: "success",
        title: `${patient.name} is checked in`,
        description:
          `Waiting for ${vet.name}, ${vet.room}.` +
          (patient.alerts.length ? ` Alert: ${patient.alerts.join("; ")}.` : ""),
      });
    },
    [appointments, now],
  );

  const setStatus = useCallback(
    (id: string, status: Status) => {
      const appt = appointments.find((a) => a.id === id);
      if (!appt) return;
      setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
      const patient = getPatient(appt.patient);
      const vet = getVet(appt.vet);
      if (status === "in_exam") {
        toaster.create({ type: "info", title: `${patient.name} is in ${vet.room}`, description: `With ${vet.name}.` });
      } else if (status === "done") {
        toaster.create({ type: "success", title: `${patient.name}'s visit is done` });
      }
    },
    [appointments],
  );

  const conflictFor = useCallback((slot: Slot) => findConflict(appointments, slot), [appointments]);

  const book = useCallback(
    (input: BookInput): BookResult => {
      const conflict = findConflict(appointments, input);
      if (conflict) return { ok: false, error: conflict };
      const h = String(Math.floor(input.start / 60)).padStart(2, "0");
      const m = String(input.start % 60).padStart(2, "0");
      const appointment: Appointment = {
        id: `a-${String(appointments.length + 1).padStart(2, "0")}`,
        patient: input.patient,
        vet: input.vet,
        start: `${h}:${m}`,
        minutes: input.minutes,
        reason: input.reason.trim(),
        status: "booked",
        urgent: input.urgent || undefined,
      };
      setAppointments((prev) => [...prev, appointment]);
      toaster.create({
        type: "success",
        title: "Appointment booked",
        description: `${getPatient(input.patient).name} with ${getVet(input.vet).name} at ${fmtClock(input.start)}.`,
      });
      return { ok: true, appointment };
    },
    [appointments],
  );

  const value = useMemo<Desk>(
    () => ({ appointments, now, checkIn, setStatus, book, conflictFor }),
    [appointments, now, checkIn, setStatus, book, conflictFor],
  );

  return <DeskContext.Provider value={value}>{children}</DeskContext.Provider>;
}
