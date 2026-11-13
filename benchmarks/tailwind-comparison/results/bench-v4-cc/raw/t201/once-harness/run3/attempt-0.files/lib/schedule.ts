import type { Appointment } from "@/lib/data";
import { toMin } from "@/lib/time";

export const OPEN = 8 * 60;
export const CLOSE = 18 * 60;

/** The existing booking (not cancelled) that overlaps this slot for this vet, if any. */
export function findConflict(
  appointments: Appointment[],
  vetId: string,
  start: number,
  minutes: number,
): Appointment | undefined {
  return appointments.find((a) => {
    if (a.vet !== vetId || a.status === "cancelled") return false;
    const s = toMin(a.start);
    return start < s + a.minutes && s < start + minutes;
  });
}

/** First free start (on a 15 minute grid) at or after `from` that fits `minutes`. */
export function nextFree(
  appointments: Appointment[],
  vetId: string,
  minutes: number,
  from: number,
): number | null {
  const first = Math.ceil(from / 15) * 15;
  for (let t = first; t + minutes <= CLOSE; t += 15) {
    if (!findConflict(appointments, vetId, t, minutes)) return t;
  }
  return null;
}
