"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  APPOINTMENTS,
  CLOSE_MIN,
  START_NOW,
  findConflict,
  fmtTime,
  fromMin,
  getPatient,
  toMin,
  type Appointment,
} from "./data";

export interface BookingInput {
  patient: string;
  vet: string;
  start: string;
  minutes: number;
  reason: string;
}
export type BookingResult = { ok: true; id: string } | { ok: false; error: string };

interface Store {
  appointments: Appointment[];
  now: number;
  notice: string;
  highlightId: string | null;
  checkIn: (id: string) => void;
  book: (input: BookingInput) => BookingResult;
  dismissNotice: () => void;
}

const Ctx = createContext<Store | null>(null);

export function ClinicProvider({ children }: { children: React.ReactNode }) {
  const [appointments, setAppointments] = useState<Appointment[]>(APPOINTMENTS);
  const [now, setNow] = useState(START_NOW);
  const [notice, setNotice] = useState("");
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const counter = useRef(14);
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const hlTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    const id = setInterval(() => setNow((n) => n + 1), 60000);
    return () => clearInterval(id);
  }, []);

  const say = useCallback((text: string) => {
    setNotice(text);
    clearTimeout(noticeTimer.current);
    noticeTimer.current = setTimeout(() => setNotice(""), 5000);
  }, []);

  const checkIn = useCallback(
    (id: string) => {
      const target = appointments.find((a) => a.id === id);
      if (!target || target.status !== "booked") return;
      setAppointments((list) =>
        list.map((a) => (a.id === id && a.status === "booked" ? { ...a, status: "checked_in", checkedInAt: fromMin(now) } : a)),
      );
      say(`${getPatient(target.patient)?.name ?? "Patient"} checked in at ${fmtTime(fromMin(now))}.`);
    },
    [appointments, now, say],
  );

  const book = useCallback(
    (input: BookingInput): BookingResult => {
      const startMin = toMin(input.start);
      if (startMin < now) return { ok: false, error: "That time has already passed." };
      if (startMin + input.minutes > CLOSE_MIN) return { ok: false, error: "The visit would run past closing time." };
      const clash = findConflict(appointments, input.vet, startMin, input.minutes);
      if (clash) {
        return {
          ok: false,
          error: `This vet is already booked ${fmtTime(clash.start)} to ${fmtTime(fromMin(toMin(clash.start) + clash.minutes))} (${clash.reason}).`,
        };
      }
      const id = `a-${counter.current++}`;
      const appt: Appointment = {
        id,
        patient: input.patient,
        vet: input.vet,
        start: input.start,
        minutes: input.minutes,
        reason: input.reason.trim() || "Follow-up visit",
        status: "booked",
      };
      setAppointments((list) => [...list, appt]);
      setHighlightId(id);
      clearTimeout(hlTimer.current);
      hlTimer.current = setTimeout(() => setHighlightId(null), 6000);
      say(`Booked ${getPatient(input.patient)?.name ?? "patient"} at ${fmtTime(input.start)}.`);
      return { ok: true, id };
    },
    [appointments, now, say],
  );

  const dismissNotice = useCallback(() => setNotice(""), []);

  const value = useMemo(
    () => ({ appointments, now, notice, highlightId, checkIn, book, dismissNotice }),
    [appointments, now, notice, highlightId, checkIn, book, dismissNotice],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useClinic(): Store {
  const v = useContext(Ctx);
  if (!v) throw new Error("useClinic must be used inside ClinicProvider");
  return v;
}
