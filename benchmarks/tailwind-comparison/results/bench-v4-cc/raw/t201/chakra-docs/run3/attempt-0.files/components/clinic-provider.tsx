"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  CLINIC_NOW,
  appointments as seedAppointments,
  checkedInSeed,
  describePatientConflict,
  describeVetConflict,
  findPatientConflict,
  findVetConflict,
  toMin,
  type Appointment,
} from "@/lib/data";

export type LiveAppointment = Appointment & { checkedInAt?: number };

export interface BookInput {
  patient: string;
  vet: string;
  start: string;
  minutes: number;
  reason: string;
  urgent: boolean;
}

export type BookResult = { ok: true; id: string } | { ok: false; error: string };

interface ClinicContextValue {
  /** Minutes after midnight on the clinic clock. */
  now: number;
  appointments: LiveAppointment[];
  checkIn: (id: string) => void;
  startExam: (id: string) => void;
  finish: (id: string) => void;
  book: (input: BookInput) => BookResult;
}

const ClinicContext = createContext<ClinicContextValue | null>(null);

export function ClinicProvider({ children }: { children: ReactNode }) {
  const [now, setNow] = useState(CLINIC_NOW);
  const [appointments, setAppointments] = useState<LiveAppointment[]>(() =>
    seedAppointments.map((a) => ({
      ...a,
      checkedInAt: checkedInSeed[a.id] ? toMin(checkedInSeed[a.id]) : undefined,
    })),
  );

  // The demo clock starts at 9:22 AM and moves forward a minute at a time.
  useEffect(() => {
    const timer = window.setInterval(() => setNow((n) => n + 1), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const patch = useCallback((id: string, changes: Partial<LiveAppointment>) => {
    setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, ...changes } : a)));
  }, []);

  const checkIn = useCallback((id: string) => patch(id, { status: "checked_in", checkedInAt: now }), [patch, now]);
  const startExam = useCallback((id: string) => patch(id, { status: "in_exam" }), [patch]);
  const finish = useCallback((id: string) => patch(id, { status: "done" }), [patch]);

  const book = useCallback(
    (input: BookInput): BookResult => {
      const start = toMin(input.start);
      if (start < now) return { ok: false, error: "That time has already passed." };
      const vetClash = findVetConflict(appointments, input.vet, start, input.minutes);
      if (vetClash) return { ok: false, error: describeVetConflict(vetClash) };
      const patientClash = findPatientConflict(appointments, input.patient, start, input.minutes);
      if (patientClash) return { ok: false, error: describePatientConflict(patientClash) };
      const next =
        appointments.reduce((max, a) => Math.max(max, Number(a.id.replace(/\D/g, "")) || 0), 0) + 1;
      const id = `a-${String(next).padStart(2, "0")}`;
      setAppointments((prev) => [
        ...prev,
        {
          id,
          patient: input.patient,
          vet: input.vet,
          start: input.start,
          minutes: input.minutes,
          reason: input.reason.trim(),
          status: "booked",
          urgent: input.urgent || undefined,
        },
      ]);
      return { ok: true, id };
    },
    [appointments, now],
  );

  const value = useMemo(
    () => ({ now, appointments, checkIn, startExam, finish, book }),
    [now, appointments, checkIn, startExam, finish, book],
  );

  return <ClinicContext.Provider value={value}>{children}</ClinicContext.Provider>;
}

export function useClinic(): ClinicContextValue {
  const ctx = useContext(ClinicContext);
  if (!ctx) throw new Error("useClinic must be used inside ClinicProvider");
  return ctx;
}
