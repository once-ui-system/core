import type { Appointment, Status } from "./data";

export const toMin = (hhmm: string): number => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

export const fromMin = (min: number): string => {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

export const endOf = (a: { start: string; minutes: number }): string =>
  fromMin(toMin(a.start) + a.minutes);

const dayNumber = (iso: string): number => {
  const [y, m, d] = iso.split("-").map(Number);
  return Math.round(Date.UTC(y, m - 1, d) / 86400000);
};

/** Whole days from `a` to `b` (both YYYY-MM-DD). Positive when b is later. */
export const daysBetween = (a: string, b: string): number => dayNumber(b) - dayNumber(a);

export const fmtDate = (iso: string, opts?: Intl.DateTimeFormatOptions): string =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    timeZone: "UTC",
    day: "numeric",
    month: "short",
    year: "numeric",
    ...opts,
  });

export const ageString = (born: string, today: string): string => {
  const [by, bm, bd] = born.split("-").map(Number);
  const [ty, tm, td] = today.split("-").map(Number);
  let months = (ty - by) * 12 + (tm - bm);
  if (td < bd) months -= 1;
  const years = Math.floor(months / 12);
  const rest = months % 12;
  if (years === 0) return `${rest} mo`;
  return rest === 0 ? `${years} yr` : `${years} yr ${rest} mo`;
};

export const statusLabel: Record<Status, string> = {
  booked: "Booked",
  checked_in: "Checked in",
  in_exam: "In exam",
  done: "Done",
  cancelled: "Cancelled",
};

export const statusColor: Record<Status, string> = {
  booked: "gray",
  checked_in: "orange",
  in_exam: "blue",
  done: "teal",
  cancelled: "gray",
};

/** Does a candidate slot clash with an active booking of the same vet? */
export const clashes = (
  list: Appointment[],
  vet: string,
  start: number,
  minutes: number,
): Appointment | undefined =>
  list.find(
    (a) =>
      a.vet === vet &&
      a.status !== "cancelled" &&
      start < toMin(a.start) + a.minutes &&
      toMin(a.start) < start + minutes,
  );

export const fmtWait = (minutes: number): string => {
  const m = Math.max(0, Math.floor(minutes));
  if (m < 60) return `${m} min`;
  return `${Math.floor(m / 60)} h ${m % 60} min`;
};
