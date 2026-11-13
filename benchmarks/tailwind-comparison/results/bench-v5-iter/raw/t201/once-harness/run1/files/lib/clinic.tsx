"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  type Appointment,
  type Status,
  START_NOW,
  findClash,
  fromMin,
  initialAppointments,
  toMin,
} from "./data";

export type BookingInput = {
  patient: string;
  vet: string;
  start: string;
  minutes: number;
  reason: string;
  urgent: boolean;
};
export type BookingResult = { ok: true; id: string } | { ok: false; error: string };

type Clinic = {
  appointments: Appointment[];
  now: string;
  lastAddedId: string | null;
  checkIn: (id: string) => void;
  setStatus: (id: string, status: Status) => void;
  book: (input: BookingInput) => BookingResult;
  bookingOpen: boolean;
  bookingPatient: string | null;
  openBooking: (patientId?: string) => void;
  closeBooking: () => void;
};

const ClinicContext = createContext<Clinic | null>(null);

export function ClinicProvider({ children }: { children: React.ReactNode }) {
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const [now, setNow] = useState(START_NOW);
  const [lastAddedId, setLastAddedId] = useState<string | null>(null);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingPatient, setBookingPatient] = useState<string | null>(null);

  // The desk clock moves on a minute at a time so waiting times keep counting.
  useEffect(() => {
    const t = setInterval(() => setNow((n) => fromMin(Math.min(toMin(n) + 1, 23 * 60 + 59))), 60000);
    return () => clearInterval(t);
  }, []);

  const setStatus = useCallback(
    (id: string, status: Status) => {
      setAppointments((list) =>
        list.map((a) =>
          a.id === id ? { ...a, status, checkedInAt: status === "checked_in" ? now : a.checkedInAt } : a,
        ),
      );
    },
    [now],
  );

  const checkIn = useCallback((id: string) => setStatus(id, "checked_in"), [setStatus]);

  const book = useCallback(
    (input: BookingInput): BookingResult => {
      const clash = findClash(appointments, input.vet, input.start, input.minutes);
      if (clash) return { ok: false, error: "That time overlaps another booking for this vet." };
      const id = `a-${String(appointments.length + 1).padStart(2, "0")}`;
      const next: Appointment = {
        id,
        patient: input.patient,
        vet: input.vet,
        start: input.start,
        minutes: input.minutes,
        reason: input.reason.trim(),
        status: "booked",
        ...(input.urgent ? { urgent: true } : {}),
      };
      setAppointments((list) => [...list, next]);
      setLastAddedId(id);
      return { ok: true, id };
    },
    [appointments],
  );

  const value = useMemo<Clinic>(
    () => ({
      appointments,
      now,
      lastAddedId,
      checkIn,
      setStatus,
      book,
      bookingOpen,
      bookingPatient,
      openBooking: (patientId?: string) => {
        setBookingPatient(patientId ?? null);
        setBookingOpen(true);
      },
      closeBooking: () => setBookingOpen(false),
    }),
    [appointments, now, lastAddedId, checkIn, setStatus, book, bookingOpen, bookingPatient],
  );

  return <ClinicContext.Provider value={value}>{children}</ClinicContext.Provider>;
}

export function useClinic(): Clinic {
  const ctx = useContext(ClinicContext);
  if (!ctx) throw new Error("useClinic must be used inside ClinicProvider");
  return ctx;
}
