import type { Appointment, Status } from "@/lib/data";

export const STATUS_LABEL: Record<Status, string> = {
  booked: "Booked",
  checked_in: "Checked in",
  in_exam: "In exam",
  done: "Done",
  cancelled: "Cancelled",
};

export const DAY_START = 8 * 60;
export const DAY_END = 17 * 60;

export function toMin(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function fromMin(total: number): string {
  const h = Math.floor(total / 60);
  const m = Math.floor(total % 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function endTime(start: string, minutes: number): string {
  return fromMin(toMin(start) + minutes);
}

/** An active (not cancelled, not already finished early) booking blocks its slot. */
export function findVetConflict(
  appointments: Appointment[],
  vet: string,
  start: string,
  minutes: number,
): Appointment | undefined {
  const s = toMin(start);
  const e = s + minutes;
  return appointments.find(
    (a) =>
      a.vet === vet &&
      a.status !== "cancelled" &&
      toMin(a.start) < e &&
      s < toMin(a.start) + a.minutes,
  );
}

export function findPatientConflict(
  appointments: Appointment[],
  patient: string,
  start: string,
  minutes: number,
): Appointment | undefined {
  const s = toMin(start);
  const e = s + minutes;
  return appointments.find(
    (a) =>
      a.patient === patient &&
      a.status !== "cancelled" &&
      toMin(a.start) < e &&
      s < toMin(a.start) + a.minutes,
  );
}

export function timeSlots(): string[] {
  const slots: string[] = [];
  for (let m = DAY_START; m < DAY_END; m += 15) slots.push(fromMin(m));
  return slots;
}

const UTC = { timeZone: "UTC" } as const;

export function formatLongDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    ...UTC,
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${iso}T00:00:00Z`));
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    ...UTC,
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${iso}T00:00:00Z`));
}

export function formatShortDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", { ...UTC, month: "short", year: "2-digit" }).format(
    new Date(`${iso}T00:00:00Z`),
  );
}

export function daysBetween(fromIso: string, toIso: string): number {
  const a = Date.parse(`${fromIso}T00:00:00Z`);
  const b = Date.parse(`${toIso}T00:00:00Z`);
  return Math.round((b - a) / 86_400_000);
}

export function ageLabel(born: string, todayIso: string): string {
  const b = new Date(`${born}T00:00:00Z`);
  const t = new Date(`${todayIso}T00:00:00Z`);
  let months =
    (t.getUTCFullYear() - b.getUTCFullYear()) * 12 + (t.getUTCMonth() - b.getUTCMonth());
  if (t.getUTCDate() < b.getUTCDate()) months -= 1;
  if (months < 24) return `${months} months`;
  return `${Math.floor(months / 12)} years`;
}

export type VaccineState = "overdue" | "soon" | "ok";

export function vaccineStatus(due: string, todayIso: string): { state: VaccineState; days: number } {
  const days = daysBetween(todayIso, due);
  if (days < 0) return { state: "overdue", days: -days };
  if (days <= 30) return { state: "soon", days };
  return { state: "ok", days };
}

export const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
