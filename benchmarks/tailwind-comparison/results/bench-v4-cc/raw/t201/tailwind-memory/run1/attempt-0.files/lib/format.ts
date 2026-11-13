const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTHS_LONG = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function parts(iso: string): { y: number; m: number; d: number } {
  const [y, m, d] = iso.split("-").map(Number);
  return { y, m, d };
}

export function utcMs(iso: string): number {
  const { y, m, d } = parts(iso);
  return Date.UTC(y, m - 1, d);
}

export function formatDate(iso: string): string {
  const { y, m, d } = parts(iso);
  return `${MONTHS[m - 1]} ${d}, ${y}`;
}

export function formatMonthYear(iso: string): string {
  const { y, m } = parts(iso);
  return `${MONTHS[m - 1]} ’${String(y).slice(2)}`;
}

export function formatLongDate(iso: string): string {
  const { y, m, d } = parts(iso);
  const wd = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return `${WEEKDAYS[wd]}, ${MONTHS_LONG[m - 1]} ${d}, ${y}`;
}

export function daysBetween(fromIso: string, toIso: string): number {
  return Math.round((utcMs(toIso) - utcMs(fromIso)) / 86400000);
}

export function ageText(born: string, today: string): string {
  const b = parts(born);
  const t = parts(today);
  let months = (t.y - b.y) * 12 + (t.m - b.m);
  if (t.d < b.d) months -= 1;
  const years = Math.floor(months / 12);
  const rest = months % 12;
  if (years === 0) return `${rest} mo`;
  return rest ? `${years} yr ${rest} mo` : `${years} yr`;
}

export function toMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

export function fromMinutes(n: number): string {
  const h = Math.floor(n / 60);
  const m = n % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function time12(value: string | number): string {
  const n = typeof value === "number" ? value : toMinutes(value);
  const h = Math.floor(n / 60);
  const m = n % 60;
  const suffix = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${suffix}`;
}

export function formatMoney(n: number): string {
  return `$${n.toFixed(2)}`;
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((p) => p.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
