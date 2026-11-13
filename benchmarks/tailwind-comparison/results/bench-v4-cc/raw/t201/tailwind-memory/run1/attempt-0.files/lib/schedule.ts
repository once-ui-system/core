import type { Appointment } from "@/lib/data";
import { toMinutes } from "@/lib/format";

export const DAY_START = 8 * 60;
export const DAY_END = 17 * 60;
export const SLOT_STEP = 15;

export const SLOTS: number[] = (() => {
  const out: number[] = [];
  for (let t = DAY_START; t < DAY_END; t += SLOT_STEP) out.push(t);
  return out;
})();

function overlaps(a: Appointment, start: number, end: number): boolean {
  const aStart = toMinutes(a.start);
  const aEnd = aStart + a.minutes;
  return aStart < end && start < aEnd;
}

/** An existing, non-cancelled booking for the same vet that overlaps the window. */
export function findVetConflict(
  list: Appointment[],
  vetId: string,
  start: number,
  minutes: number,
): Appointment | undefined {
  return list.find((a) => a.vet === vetId && a.status !== "cancelled" && overlaps(a, start, start + minutes));
}

/** The same patient cannot be in two places at once. */
export function findPatientConflict(
  list: Appointment[],
  patientId: string,
  start: number,
  minutes: number,
): Appointment | undefined {
  return list.find((a) => a.patient === patientId && a.status !== "cancelled" && overlaps(a, start, start + minutes));
}

/** First slot at or after `from` where the vet is free for `minutes` and the visit ends before closing. */
export function nextFreeStart(list: Appointment[], vetId: string, minutes: number, from: number): number | null {
  for (const t of SLOTS) {
    if (t < from) continue;
    if (t + minutes > DAY_END) return null;
    if (!findVetConflict(list, vetId, t, minutes)) return t;
  }
  return null;
}
