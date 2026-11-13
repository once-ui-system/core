"use client";

import { useMemo, useSyncExternalStore } from "react";
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

/*
 * The desk state lives in a small module-level store, so every page shares it
 * (a check-in made on the schedule is still there on a patient record) without
 * needing a provider in the layout.
 */
interface StoreState {
  appointments: Appointment[];
  now: number;
}

let state: StoreState = { appointments: initialAppointments, now: CLOCK_START };
const initialState = state;
const listeners = new Set<() => void>();
let timer: number | null = null;
let t0 = 0;

function emit(next: StoreState) {
  state = next;
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (timer === null && typeof window !== "undefined") {
    if (!t0) t0 = Date.now();
    timer = window.setInterval(() => {
      const now = CLOCK_START + Math.floor((Date.now() - t0) / 60000);
      if (now !== state.now) emit({ ...state, now });
    }, 15000);
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && timer !== null) {
      window.clearInterval(timer);
      timer = null;
    }
  };
}

const getSnapshot = () => state;
const getServerSnapshot = () => initialState;

function checkIn(id: string) {
  const appt = state.appointments.find((a) => a.id === id);
  if (!appt || appt.status !== "booked") return;
  const now = state.now;
  emit({
    ...state,
    appointments: state.appointments.map((a) =>
      a.id === id ? { ...a, status: "checked_in" as const, checkedInAt: now } : a,
    ),
  });
  const patient = getPatient(appt.patient);
  const vet = getVet(appt.vet);
  toaster.create({
    type: "success",
    title: `${patient.name} is checked in`,
    description:
      `Waiting for ${vet.name}, ${vet.room}.` +
      (patient.alerts.length ? ` Alert: ${patient.alerts.join("; ")}.` : ""),
  });
}

function setStatus(id: string, status: Status) {
  const appt = state.appointments.find((a) => a.id === id);
  if (!appt) return;
  emit({ ...state, appointments: state.appointments.map((a) => (a.id === id ? { ...a, status } : a)) });
  const patient = getPatient(appt.patient);
  const vet = getVet(appt.vet);
  if (status === "in_exam") {
    toaster.create({ type: "info", title: `${patient.name} is in ${vet.room}`, description: `With ${vet.name}.` });
  } else if (status === "done") {
    toaster.create({ type: "success", title: `${patient.name}'s visit is done` });
  }
}

function conflictFor(slot: Slot): string | null {
  return findConflict(state.appointments, slot);
}

function book(input: BookInput): BookResult {
  const conflict = findConflict(state.appointments, input);
  if (conflict) return { ok: false, error: conflict };
  const h = String(Math.floor(input.start / 60)).padStart(2, "0");
  const m = String(input.start % 60).padStart(2, "0");
  const appointment: Appointment = {
    id: `a-${String(state.appointments.length + 1).padStart(2, "0")}`,
    patient: input.patient,
    vet: input.vet,
    start: `${h}:${m}`,
    minutes: input.minutes,
    reason: input.reason.trim(),
    status: "booked",
    urgent: input.urgent || undefined,
  };
  emit({ ...state, appointments: [...state.appointments, appointment] });
  toaster.create({
    type: "success",
    title: "Appointment booked",
    description: `${getPatient(input.patient).name} with ${getVet(input.vet).name} at ${fmtClock(input.start)}.`,
  });
  return { ok: true, appointment };
}

export interface Desk {
  appointments: Appointment[];
  /** Front desk clock, minutes since midnight. */
  now: number;
  checkIn: (id: string) => void;
  setStatus: (id: string, status: Status) => void;
  book: (input: BookInput) => BookResult;
  conflictFor: (slot: Slot) => string | null;
}

export function useDesk(): Desk {
  const snap = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return useMemo(
    () => ({ appointments: snap.appointments, now: snap.now, checkIn, setStatus, book, conflictFor }),
    [snap],
  );
}
