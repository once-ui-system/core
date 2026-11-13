"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useToast, VisuallyHidden } from "@once-ui-system/core";
import {
  initialAppointments,
  patientById,
  START_NOW,
  vetById,
  type Appointment,
} from "@/lib/data";
import { findConflict, CLOSE } from "@/lib/schedule";
import { toMin } from "@/lib/time";

export interface NewBooking {
  patient: string;
  vet: string;
  start: string;
  minutes: number;
  reason: string;
}

type BookResult = { ok: true; id: string } | { ok: false; error: string };

interface DeskContextValue {
  appointments: Appointment[];
  /** Clinic clock in minutes since midnight. */
  now: number;
  highlightId: string | null;
  checkIn: (id: string) => void;
  startExam: (id: string) => void;
  book: (input: NewBooking) => BookResult;
  bookingOpen: boolean;
  bookingPatientId: string | undefined;
  openBooking: (patientId?: string) => void;
  closeBooking: () => void;
}

const DeskContext = createContext<DeskContextValue | null>(null);

export function useDesk(): DeskContextValue {
  const ctx = useContext(DeskContext);
  if (!ctx) throw new Error("useDesk must be used inside DeskProvider");
  return ctx;
}

export function DeskProvider({ children }: { children: React.ReactNode }) {
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const [now, setNow] = useState(START_NOW);
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingPatientId, setBookingPatientId] = useState<string | undefined>(undefined);
  const [announcement, setAnnouncement] = useState("");
  const { addToast } = useToast();

  useEffect(() => {
    const timer = setInterval(() => setNow((n) => n + 1), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!highlightId) return;
    const timer = setTimeout(() => setHighlightId(null), 6000);
    return () => clearTimeout(timer);
  }, [highlightId]);

  const notify = useCallback(
    (message: string) => {
      setAnnouncement(message);
      addToast({ tone: "success", message });
    },
    [addToast],
  );

  const checkIn = useCallback(
    (id: string) => {
      const target = appointments.find((a) => a.id === id);
      if (!target || target.status !== "booked") return;
      setAppointments((prev) =>
        prev.map((a) => (a.id === id && a.status === "booked" ? { ...a, status: "checked_in", checkedInAt: now } : a)),
      );
      notify(`${patientById[target.patient]?.name ?? "Patient"} checked in. Added to the waiting list.`);
    },
    [appointments, now, notify],
  );

  const startExam = useCallback(
    (id: string) => {
      const target = appointments.find((a) => a.id === id);
      if (!target || target.status !== "checked_in") return;
      setAppointments((prev) =>
        prev.map((a) => (a.id === id && a.status === "checked_in" ? { ...a, status: "in_exam" } : a)),
      );
      notify(`${patientById[target.patient]?.name ?? "Patient"} sent to ${vetById[target.vet]?.room ?? "exam"}.`);
    },
    [appointments, notify],
  );

  const book = useCallback(
    (input: NewBooking): BookResult => {
      const start = toMin(input.start);
      if (start + input.minutes > CLOSE) return { ok: false, error: "That visit would run past closing time." };
      const clash = findConflict(appointments, input.vet, start, input.minutes);
      if (clash) {
        return { ok: false, error: "That time clashes with an existing booking for this vet." };
      }
      const id = `a-${String(appointments.length + 1).padStart(2, "0")}`;
      const created: Appointment = {
        id,
        patient: input.patient,
        vet: input.vet,
        start: input.start,
        minutes: input.minutes,
        reason: input.reason.trim(),
        status: "booked",
      };
      setAppointments((prev) => [...prev, created]);
      setHighlightId(id);
      notify(
        `Booked ${patientById[input.patient]?.name ?? "patient"} with ${vetById[input.vet]?.name ?? "vet"} at ${input.start}.`,
      );
      return { ok: true, id };
    },
    [appointments, notify],
  );

  const openBooking = useCallback((patientId?: string) => {
    setBookingPatientId(patientId);
    setBookingOpen(true);
  }, []);
  const closeBooking = useCallback(() => setBookingOpen(false), []);

  const value = useMemo<DeskContextValue>(
    () => ({
      appointments,
      now,
      highlightId,
      checkIn,
      startExam,
      book,
      bookingOpen,
      bookingPatientId,
      openBooking,
      closeBooking,
    }),
    [appointments, now, highlightId, checkIn, startExam, book, bookingOpen, bookingPatientId, openBooking, closeBooking],
  );

  return (
    <DeskContext.Provider value={value}>
      {children}
      <VisuallyHidden>
        <span role="status" aria-live="polite">
          {announcement}
        </span>
      </VisuallyHidden>
    </DeskContext.Provider>
  );
}
