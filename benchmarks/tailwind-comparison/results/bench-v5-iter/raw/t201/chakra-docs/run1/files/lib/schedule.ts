import { type Appointment, toMinutes } from "@/lib/data";

export const DAY_START = 8 * 60;
export const DAY_END = 17 * 60;
export const SLOT_STEP = 15;

/** The existing (not cancelled) booking that overlaps the given window for a vet, if any. */
export function findClash(
  appointments: Appointment[],
  vetId: string,
  start: number,
  minutes: number,
): Appointment | undefined {
  const end = start + minutes;
  return appointments.find((a) => {
    if (a.vet !== vetId || a.status === "cancelled") return false;
    const aStart = toMinutes(a.start);
    const aEnd = aStart + a.minutes;
    return start < aEnd && aStart < end;
  });
}

export function slotsFor(minutes: number): number[] {
  const slots: number[] = [];
  for (let t = DAY_START; t + minutes <= DAY_END; t += SLOT_STEP) slots.push(t);
  return slots;
}

export function sortAppointments(list: Appointment[]): Appointment[] {
  return [...list].sort((a, b) => toMinutes(a.start) - toMinutes(b.start) || a.vet.localeCompare(b.vet));
}
