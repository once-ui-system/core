```ts src/lib/data.ts
export type Status = "booked" | "checked_in" | "in_exam" | "done" | "cancelled";

export interface Vet {
  id: string;
  name: string;
  room: string;
}
export interface Owner {
  id: string;
  name: string;
  phone: string;
}
export interface Patient {
  id: string;
  name: string;
  species: string;
  breed: string;
  born: string;
  sex: string;
  owner: string;
  alerts: string[];
}
export interface Appointment {
  id: string;
  patient: string;
  vet: string;
  start: string;
  minutes: number;
  reason: string;
  status: Status;
  urgent?: boolean;
  checkedInAt?: string;
}
export interface Weight {
  date: string;
  kg: number;
}
export interface Vaccination {
  name: string;
  given: string;
  due: string;
}
export interface Medication {
  name: string;
  dose: string;
  since: string;
}
export interface Visit {
  date: string;
  vet: string;
  reason: string;
  notes: string;
  invoice_usd: number;
}
export interface PatientRecord {
  weights_kg: Weight[];
  vaccinations: Vaccination[];
  medications: Medication[];
  visits: Visit[];
}

export const clinic = "Pawpoint, front-desk and records software for Hillside Veterinary Clinic";
export const today = "2026-11-12";
export const user = { name: "Rosa Lindqvist", role: "Receptionist" };

export const vets: Vet[] = [
  { id: "v-1", name: "Dr. Amara Osei", room: "Exam 1" },
  { id: "v-2", name: "Dr. Tomás Reyes", room: "Exam 2" },
  { id: "v-3", name: "Dr. Helen Park", room: "Surgery" },
];

export const owners: Owner[] = [
  { id: "o-1", name: "Daniel Kim", phone: "+1 555 0142" },
  { id: "o-2", name: "Priya Natarajan", phone: "+1 555 0178" },
  { id: "o-3", name: "Lucas Moreau", phone: "+1 555 0119" },
  { id: "o-4", name: "Grace Whitfield", phone: "+1 555 0163" },
  { id: "o-5", name: "Sam Oduya", phone: "+1 555 0190" },
  { id: "o-6", name: "Elena Rossi", phone: "+1 555 0105" },
];

export const patients: Patient[] = [
  { id: "p-101", name: "Biscuit", species: "Dog", breed: "Beagle", born: "2019-04-02", sex: "Male, neutered", owner: "o-1", alerts: [] },
  { id: "p-102", name: "Mochi", species: "Cat", breed: "Domestic shorthair", born: "2021-07-15", sex: "Female, spayed", owner: "o-2", alerts: ["Bites when restrained"] },
  { id: "p-103", name: "Pepper", species: "Dog", breed: "Border collie", born: "2016-01-20", sex: "Female, spayed", owner: "o-3", alerts: [] },
  { id: "p-104", name: "Olive", species: "Dog", breed: "Labrador retriever", born: "2014-09-08", sex: "Female, spayed", owner: "o-4", alerts: ["Penicillin allergy", "Chronic kidney disease, stage 2"] },
  { id: "p-105", name: "Kiwi", species: "Bird", breed: "Budgerigar", born: "2023-03-11", sex: "Male", owner: "o-5", alerts: [] },
  { id: "p-106", name: "Tofu", species: "Rabbit", breed: "Holland lop", born: "2022-05-30", sex: "Female", owner: "o-6", alerts: [] },
  { id: "p-107", name: "Ziggy", species: "Cat", breed: "Maine coon", born: "2018-11-02", sex: "Male, neutered", owner: "o-2", alerts: ["Diabetic: insulin twice daily"] },
  { id: "p-108", name: "Bruno", species: "Dog", breed: "French bulldog", born: "2022-02-14", sex: "Male", owner: "o-5", alerts: ["Brachycephalic: sedation risk"] },
];

export const appointments: Appointment[] = [
  { id: "a-01", patient: "p-101", vet: "v-1", start: "08:30", minutes: 20, reason: "Annual vaccination", status: "done" },
  { id: "a-02", patient: "p-104", vet: "v-2", start: "08:30", minutes: 30, reason: "Kidney panel recheck", status: "done" },
  { id: "a-03", patient: "p-108", vet: "v-3", start: "08:00", minutes: 120, reason: "Soft palate surgery", status: "in_exam" },
  { id: "a-04", patient: "p-102", vet: "v-1", start: "09:00", minutes: 30, reason: "Limping, left hind leg", status: "in_exam" },
  { id: "a-05", patient: "p-107", vet: "v-2", start: "09:15", minutes: 20, reason: "Glucose curve", status: "checked_in", checkedInAt: "09:10" },
  { id: "a-06", patient: "p-105", vet: "v-1", start: "09:45", minutes: 20, reason: "Beak and nail trim", status: "checked_in", checkedInAt: "09:38" },
  { id: "a-07", patient: "p-103", vet: "v-2", start: "10:00", minutes: 30, reason: "Senior wellness exam", status: "booked" },
  { id: "a-08", patient: "p-106", vet: "v-1", start: "10:30", minutes: 20, reason: "Not eating since yesterday", status: "booked", urgent: true },
  { id: "a-09", patient: "p-104", vet: "v-3", start: "11:00", minutes: 45, reason: "Dental cleaning", status: "booked" },
  { id: "a-10", patient: "p-101", vet: "v-2", start: "11:30", minutes: 20, reason: "Ear infection follow-up", status: "booked" },
  { id: "a-11", patient: "p-107", vet: "v-1", start: "13:30", minutes: 30, reason: "Dental check", status: "booked" },
  { id: "a-12", patient: "p-103", vet: "v-3", start: "14:00", minutes: 60, reason: "Lump removal", status: "cancelled" },
  { id: "a-13", patient: "p-102", vet: "v-2", start: "15:00", minutes: 20, reason: "X-ray results", status: "booked" },
];

export const records: Record<string, PatientRecord> = {
  "p-104": {
    weights_kg: [
      { date: "2025-05-14", kg: 31.8 },
      { date: "2025-08-20", kg: 31.1 },
      { date: "2025-11-03", kg: 30.4 },
      { date: "2026-02-11", kg: 29.9 },
      { date: "2026-06-17", kg: 29.2 },
      { date: "2026-11-12", kg: 28.6 },
    ],
    vaccinations: [
      { name: "Rabies", given: "2024-10-02", due: "2027-10-02" },
      { name: "DHPP", given: "2025-10-15", due: "2026-10-15" },
      { name: "Leptospirosis", given: "2025-10-15", due: "2026-10-15" },
      { name: "Bordetella", given: "2026-04-08", due: "2027-04-08" },
    ],
    medications: [
      { name: "Benazepril 5 mg", dose: "1 tablet daily", since: "2025-08-20" },
      { name: "Renal diet (dry)", dose: "2.5 cups daily", since: "2025-08-20" },
    ],
    visits: [
      { date: "2026-11-12", vet: "v-2", reason: "Kidney panel recheck", notes: "Creatinine 2.1 mg/dL (was 2.0). Weight down 0.6 kg. Continue benazepril, recheck in 3 months.", invoice_usd: 186.0 },
      { date: "2026-06-17", vet: "v-2", reason: "Kidney panel recheck", notes: "Stable. Appetite good. Owner reports more drinking in hot weather.", invoice_usd: 172.5 },
      { date: "2026-02-11", vet: "v-1", reason: "Coughing", notes: "Mild kennel cough. Supportive care; no antibiotics given (penicillin allergy).", invoice_usd: 94.0 },
      { date: "2025-11-03", vet: "v-2", reason: "Senior wellness exam", notes: "Grade 2 dental tartar. Dental cleaning recommended.", invoice_usd: 148.0 },
    ],
  },
};

export const statusLabel: Record<Status, string> = {
  booked: "Booked",
  checked_in: "Checked in",
  in_exam: "In exam",
  done: "Done",
  cancelled: "Cancelled",
};

export const vetById = (id: string): Vet => vets.find((v) => v.id === id) ?? vets[0];
export const ownerById = (id: string): Owner => owners.find((o) => o.id === id) ?? owners[0];
export const patientById = (id: string): Patient | undefined => patients.find((p) => p.id === id);

export const toMin = (t: string): number => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};
export const fromMin = (n: number): string =>
  `${String(Math.floor(n / 60)).padStart(2, "0")}:${String(n % 60).padStart(2, "0")}`;

/** Returns the booking that overlaps the proposed slot for this vet, if any (cancelled ones do not block). */
export function findClash(list: Appointment[], vet: string, start: string, minutes: number): Appointment | undefined {
  const s = toMin(start);
  const e = s + minutes;
  return list.find((a) => a.vet === vet && a.status !== "cancelled" && s < toMin(a.start) + a.minutes && toMin(a.start) < e);
}

const utc = (d: string): number => Date.parse(`${d}T00:00:00Z`);
export const daysBetween = (from: string, to: string): number => Math.round((utc(to) - utc(from)) / 86400000);

export const formatDate = (d: string, withYear = true): string =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: withYear ? "numeric" : undefined,
    timeZone: "UTC",
  }).format(new Date(utc(d)));

export const formatLongDate = (d: string): string =>
  new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric", timeZone: "UTC" }).format(
    new Date(utc(d)),
  );

export function ageText(born: string, on: string = today): string {
  const [by, bm, bd] = born.split("-").map(Number);
  const [ty, tm, td] = on.split("-").map(Number);
  let months = (ty - by) * 12 + (tm - bm);
  if (td < bd) months -= 1;
  const years = Math.floor(months / 12);
  const rem = months % 12;
  if (years < 2) return `${months} months`;
  return rem ? `${years} years ${rem} months` : `${years} years`;
}

export const money = (n: number): string => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
```

```css src/components/pawpoint.css
.pp {
  --pp-bg: #f2f5f4;
  --pp-surface: #ffffff;
  --pp-ink: #14231f;
  --pp-muted: #53635e;
  --pp-line: #d8e1de;
  --pp-brand: #0f6b63;
  --pp-brand-soft: #e1f2ef;
  --pp-alert: #b42318;
  --pp-alert-soft: #fdecea;
  --pp-urgent: #b54708;
  --pp-urgent-soft: #fff3e3;
  --pp-radius: 14px;
  color-scheme: light;
  width: 100%;
  min-height: 100vh;
  background: var(--pp-bg);
  color: var(--pp-ink);
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  font-size: 16px;
  line-height: 1.45;
  font-variant-numeric: tabular-nums;
}
.pp *, .pp *::before, .pp *::after { box-sizing: border-box; }
.pp a { color: inherit; }
.pp :focus-visible { outline: 3px solid #1d6fe0; outline-offset: 2px; border-radius: 6px; }
.pp h1, .pp h2, .pp h3, .pp p, .pp ul, .pp ol { margin: 0; padding: 0; }
.pp ul, .pp ol { list-style: none; }

.pp-skip { position: absolute; left: -999px; top: 8px; background: #fff; padding: 10px 14px; border-radius: 8px; z-index: 50; }
.pp-skip:focus { left: 8px; }

/* header */
.pp-header { position: sticky; top: 0; z-index: 20; background: var(--pp-surface); border-bottom: 1px solid var(--pp-line); }
.pp-header-in { max-width: 1280px; margin: 0 auto; padding: 10px 16px; display: grid; grid-template-columns: auto 1fr auto; gap: 12px 20px; align-items: center; }
.pp-brand { display: flex; align-items: center; gap: 10px; text-decoration: none; min-height: 44px; }
.pp-logo { width: 38px; height: 38px; border-radius: 11px; background: var(--pp-brand); color: #fff; display: grid; place-items: center; flex: none; }
.pp-brand b { display: block; font-size: 18px; letter-spacing: -0.01em; line-height: 1.1; }
.pp-brand small { display: block; font-size: 12px; color: var(--pp-muted); }
.pp-search { position: relative; max-width: 520px; width: 100%; justify-self: center; }
.pp-search input { width: 100%; height: 46px; border: 1.5px solid var(--pp-line); border-radius: 12px; padding: 0 14px 0 42px; font: inherit; background: var(--pp-bg); color: inherit; }
.pp-search input:focus { background: #fff; border-color: var(--pp-brand); }
.pp-search svg { position: absolute; left: 13px; top: 13px; color: var(--pp-muted); pointer-events: none; }
.pp-results { position: absolute; left: 0; right: 0; top: 52px; background: #fff; border: 1px solid var(--pp-line); border-radius: 12px; box-shadow: 0 12px 32px rgba(20, 35, 31, 0.16); padding: 6px; max-height: 60vh; overflow: auto; z-index: 30; }
.pp-results a { display: flex; flex-wrap: wrap; align-items: center; gap: 4px 10px; min-height: 52px; padding: 8px 10px; border-radius: 9px; text-decoration: none; }
.pp-results a:hover, .pp-results a:focus-visible { background: var(--pp-brand-soft); }
.pp-results small { color: var(--pp-muted); font-size: 13px; }
.pp-results .pp-none { padding: 12px; color: var(--pp-muted); }
.pp-me { display: flex; align-items: center; gap: 10px; text-align: right; }
.pp-me span { display: block; font-size: 12px; color: var(--pp-muted); }
.pp-me b { display: block; font-size: 14px; }
.pp-avatar { width: 40px; height: 40px; border-radius: 50%; background: var(--pp-brand-soft); color: var(--pp-brand); display: grid; place-items: center; font-weight: 700; flex: none; }

.pp-main { max-width: 1280px; margin: 0 auto; padding: 20px 16px 56px; }

/* page head */
.pp-head { display: flex; flex-wrap: wrap; align-items: end; justify-content: space-between; gap: 8px 16px; margin-bottom: 16px; }
.pp-head h1 { font-size: 28px; letter-spacing: -0.02em; line-height: 1.15; }
.pp-head p { color: var(--pp-muted); }
.pp-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 18px; }
.pp-stat { background: var(--pp-surface); border: 1px solid var(--pp-line); border-radius: var(--pp-radius); padding: 12px 14px; }
.pp-stat b { display: block; font-size: 28px; line-height: 1.1; }
.pp-stat span { font-size: 13px; color: var(--pp-muted); }

.pp-layout { display: grid; gap: 18px; grid-template-columns: minmax(0, 1fr); grid-template-areas: "aside" "sched"; align-items: start; }
.pp-aside { grid-area: aside; display: grid; gap: 18px; }
.pp-sched { grid-area: sched; }
@media (min-width: 1040px) {
  .pp-layout { grid-template-columns: minmax(0, 1fr) 360px; grid-template-areas: "sched aside"; }
  .pp-aside { position: sticky; top: 84px; }
}

.pp-card { background: var(--pp-surface); border: 1px solid var(--pp-line); border-radius: var(--pp-radius); padding: 16px; }
.pp-card h2 { font-size: 18px; letter-spacing: -0.01em; }
.pp-card-head { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 12px; flex-wrap: wrap; }
.pp-sub { color: var(--pp-muted); font-size: 14px; }

/* buttons */
.pp-btn { min-height: 44px; padding: 0 16px; border-radius: 11px; border: 1.5px solid var(--pp-brand); background: var(--pp-brand); color: #fff; font: inherit; font-weight: 600; cursor: pointer; white-space: nowrap; }
.pp-btn:hover:not(:disabled) { filter: brightness(1.08); }
.pp-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.pp-btn.ghost { background: #fff; color: var(--pp-brand); }
.pp-btn.wide { width: 100%; }
.pp-chips { display: flex; flex-wrap: wrap; gap: 8px; }
.pp-chip { min-height: 40px; padding: 0 14px; border-radius: 999px; border: 1.5px solid var(--pp-line); background: #fff; font: inherit; font-size: 14px; cursor: pointer; color: var(--pp-ink); }
.pp-chip[aria-pressed="true"] { background: var(--pp-ink); border-color: var(--pp-ink); color: #fff; }

/* schedule rows */
.pp-cols { display: none; }
@media (min-width: 900px) {
  .pp-cols, .pp-row { grid-template-columns: 96px minmax(0, 1.5fr) minmax(0, 1.2fr) minmax(0, 1fr) 112px 124px; }
  .pp-cols { display: grid; gap: 12px; padding: 0 16px 8px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.06em; color: var(--pp-muted); }
}
.pp-list { display: grid; gap: 8px; }
.pp-row { display: grid; gap: 6px 12px; align-items: center; background: var(--pp-surface); border: 1px solid var(--pp-line); border-left: 6px solid var(--pp-line); border-radius: 12px; padding: 12px 14px; grid-template-columns: 76px minmax(0, 1fr) auto; grid-template-areas: "time who state" "time reason act" "time vet act"; }
@media (min-width: 900px) { .pp-row { grid-template-areas: none; align-items: center; } .pp-row > * { grid-area: auto !important; } }
.pp-time { grid-area: time; font-weight: 700; }
.pp-time span { display: block; font-weight: 400; font-size: 13px; color: var(--pp-muted); }
.pp-who { grid-area: who; min-width: 0; }
.pp-who a { font-weight: 700; font-size: 17px; text-decoration: none; }
.pp-who a:hover { text-decoration: underline; }
.pp-who small { display: block; color: var(--pp-muted); font-size: 13px; }
.pp-reason { grid-area: reason; min-width: 0; }
.pp-vet { grid-area: vet; font-size: 14px; color: var(--pp-muted); }
.pp-state { grid-area: state; justify-self: end; }
.pp-act { grid-area: act; justify-self: end; }
@media (min-width: 900px) { .pp-state, .pp-act { justify-self: start; } }
.pp-row .pp-btn { min-height: 44px; padding: 0 12px; font-size: 14px; }
.pp-s-in_exam { border-left-color: #1f6fd1; }
.pp-s-checked_in { border-left-color: #d49a00; }
.pp-s-done { border-left-color: #3b8a4b; background: #fafcfb; }
.pp-s-done .pp-reason, .pp-s-done .pp-who a { color: var(--pp-muted); }
.pp-s-cancelled { border-left-color: #9aa5a1; background: #f6f7f7; color: var(--pp-muted); }
.pp-s-cancelled .pp-reason { text-decoration: line-through; }
.pp-urgent { border-left-color: var(--pp-urgent); background: var(--pp-urgent-soft); border-color: #f0c48f; box-shadow: 0 0 0 1px #f0c48f; }
.pp-new { animation: pp-flash 2.4s ease-out; }
@keyframes pp-flash { from { background: #d6f0e4; } }
@media (prefers-reduced-motion: reduce) { .pp-new { animation: none; } }
.pp-tag-urgent { display: inline-flex; align-items: center; gap: 4px; background: var(--pp-urgent); color: #fff; font-size: 12px; font-weight: 800; letter-spacing: 0.06em; text-transform: uppercase; padding: 2px 8px; border-radius: 6px; margin-right: 8px; }

.pp-pill { display: inline-block; font-size: 13px; font-weight: 700; padding: 4px 10px; border-radius: 999px; white-space: nowrap; }
.pp-pill-booked { background: #ebebfb; color: #35398a; }
.pp-pill-checked_in { background: #fff1cc; color: #7a5200; }
.pp-pill-in_exam { background: #dcecff; color: #0b4f9e; }
.pp-pill-done { background: #e0f3e4; color: #1f5f2c; }
.pp-pill-cancelled { background: #e8ebea; color: #4b5753; }

/* medical alerts */
.pp-alerts { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px; }
.pp-alert { display: inline-flex; align-items: center; gap: 6px; background: var(--pp-alert); color: #fff; font-weight: 700; font-size: 13px; line-height: 1.25; padding: 4px 10px 4px 7px; border-radius: 8px; }
.pp-alert svg { flex: none; }
.pp-alerts.lg .pp-alert { font-size: 17px; padding: 8px 14px 8px 10px; border-radius: 10px; }

/* waiting */
.pp-wait { display: grid; gap: 8px; }
.pp-wait li { display: grid; grid-template-columns: 1fr auto; gap: 2px 10px; align-items: center; padding: 10px 12px; border-radius: 10px; background: #fff8e6; border: 1px solid #f0dca0; }
.pp-wait .n { font-weight: 700; text-decoration: none; }
.pp-wait .m { font-weight: 800; color: #7a5200; text-align: right; }
.pp-wait .m.long { color: var(--pp-alert); }
.pp-wait small { color: var(--pp-muted); grid-column: 1 / -1; }
.pp-empty { color: var(--pp-muted); padding: 10px 0; }

/* form */
.pp-form { display: grid; gap: 12px; }
.pp-field label, .pp-field legend { display: block; font-size: 14px; font-weight: 600; margin-bottom: 4px; }
.pp-field select, .pp-field input[type="text"] { width: 100%; min-height: 46px; border: 1.5px solid var(--pp-line); border-radius: 10px; padding: 0 10px; font: inherit; background: #fff; color: inherit; }
.pp-two { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.pp-check { display: flex; align-items: center; gap: 10px; min-height: 44px; font-weight: 600; }
.pp-check input { width: 22px; height: 22px; accent-color: var(--pp-urgent); }
.pp-error { background: var(--pp-alert-soft); color: #7a1a12; border: 1px solid #f2b8b2; border-radius: 10px; padding: 10px 12px; font-size: 14px; font-weight: 600; }
.pp-ok { background: #e0f3e4; color: #1f5f2c; border: 1px solid #a9d9b4; border-radius: 10px; padding: 10px 12px; font-size: 14px; font-weight: 600; }
.pp-live { min-height: 0; }

/* patient record */
.pp-back { display: inline-flex; align-items: center; min-height: 44px; color: var(--pp-brand); font-weight: 600; text-decoration: none; }
.pp-back:hover { text-decoration: underline; }
.pp-banner { background: var(--pp-alert-soft); border: 2px solid var(--pp-alert); border-radius: var(--pp-radius); padding: 14px 16px; margin: 6px 0 18px; }
.pp-banner h2 { color: var(--pp-alert); font-size: 13px; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 4px; }
.pp-banner .pp-alerts { margin-top: 4px; }
.pp-id { display: flex; flex-wrap: wrap; gap: 16px; align-items: center; }
.pp-pet { width: 72px; height: 72px; border-radius: 20px; background: var(--pp-brand-soft); color: var(--pp-brand); display: grid; place-items: center; font-size: 30px; font-weight: 800; flex: none; }
.pp-id h1 { font-size: 32px; line-height: 1.1; letter-spacing: -0.02em; }
.pp-facts { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px 20px; margin-top: 16px; }
.pp-facts dt { font-size: 12px; text-transform: uppercase; letter-spacing: 0.06em; color: var(--pp-muted); }
.pp-facts dd { margin: 0; font-weight: 600; }
.pp-facts a { color: var(--pp-brand); }
.pp-grid2 { display: grid; gap: 18px; grid-template-columns: minmax(0, 1fr); margin-top: 18px; }
@media (min-width: 960px) { .pp-grid2 { grid-template-columns: minmax(0, 1.25fr) minmax(0, 1fr); } }
.pp-stack { display: grid; gap: 18px; align-content: start; }
.pp-scroll { overflow-x: auto; }
.pp-chart { min-width: 500px; width: 100%; height: auto; display: block; }
.pp-chart text { font-family: inherit; fill: var(--pp-muted); font-size: 13px; }
.pp-chart .val { fill: var(--pp-ink); font-weight: 700; }
.pp-trend { font-weight: 700; color: var(--pp-urgent); }
.pp-vax { display: grid; gap: 8px; }
.pp-vax li { display: grid; grid-template-columns: 1fr auto; gap: 2px 10px; align-items: center; padding: 10px 12px; border: 1px solid var(--pp-line); border-radius: 10px; }
.pp-vax li.over { border: 2px solid var(--pp-alert); background: var(--pp-alert-soft); }
.pp-vax small { grid-column: 1 / -1; color: var(--pp-muted); }
.pp-vax .st { font-weight: 800; font-size: 13px; padding: 3px 9px; border-radius: 999px; background: #e0f3e4; color: #1f5f2c; }
.pp-vax li.over .st { background: var(--pp-alert); color: #fff; }
.pp-vax li.soon .st { background: #fff1cc; color: #7a5200; }
.pp-meds li { display: flex; justify-content: space-between; gap: 12px; flex-wrap: wrap; padding: 10px 0; border-bottom: 1px solid var(--pp-line); }
.pp-meds li:last-child { border-bottom: 0; }
.pp-visits { display: grid; gap: 12px; }
.pp-visit { border-left: 3px solid var(--pp-brand); padding: 2px 0 2px 14px; }
.pp-visit header { display: flex; flex-wrap: wrap; gap: 4px 12px; align-items: baseline; }
.pp-visit b { font-size: 16px; }
.pp-visit .meta { color: var(--pp-muted); font-size: 14px; }
.pp-visit p { margin-top: 4px; }

@media (max-width: 760px) {
  .pp-header-in { grid-template-columns: 1fr auto; }
  .pp-search { grid-column: 1 / -1; grid-row: 2; max-width: none; }
  .pp-me div { display: none; }
  .pp-stats { grid-template-columns: repeat(2, 1fr); }
  .pp-head h1 { font-size: 24px; }
  .pp-id h1 { font-size: 26px; }
}
```

```tsx src/components/ui.tsx
import type { Status } from "@/lib/data";
import { statusLabel } from "@/lib/data";

export function WarnIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 3 2 21h20L12 3Z" fill="#fff" />
      <path d="M12 9v5.5" stroke="#b42318" strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="12" cy="17.6" r="1.4" fill="#b42318" />
    </svg>
  );
}

export function PawIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <ellipse cx="6" cy="10" rx="2.1" ry="2.8" />
      <ellipse cx="10" cy="5.8" rx="2.1" ry="2.8" />
      <ellipse cx="14" cy="5.8" rx="2.1" ry="2.8" />
      <ellipse cx="18" cy="10" rx="2.1" ry="2.8" />
      <path d="M12 11c-3 0-5.5 3-5.5 5.4 0 1.9 1.6 2.6 3 2.3 1-.2 1.6-.5 2.5-.5s1.5.3 2.5.5c1.4.3 3-.4 3-2.3C17.5 14 15 11 12 11Z" />
    </svg>
  );
}

export function AlertList({ alerts, large = false }: { alerts: string[]; large?: boolean }) {
  if (alerts.length === 0) return null;
  return (
    <ul className={`pp-alerts${large ? " lg" : ""}`} aria-label="Medical alerts">
      {alerts.map((a) => (
        <li key={a} className="pp-alert">
          <WarnIcon size={large ? 20 : 16} />
          <span>{a}</span>
        </li>
      ))}
    </ul>
  );
}

export function StatusPill({ status }: { status: Status }) {
  return <span className={`pp-pill pp-pill-${status}`}>{statusLabel[status]}</span>;
}
```

```tsx src/components/Shell.tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import "./pawpoint.css";
import { ownerById, patients, user, formatLongDate, today } from "@/lib/data";
import { AlertList, PawIcon } from "./ui";

function Search() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  const matches = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return [];
    return patients.filter((p) => p.name.toLowerCase().includes(t) || ownerById(p.owner).name.toLowerCase().includes(t));
  }, [q]);

  const close = () => {
    setOpen(false);
  };

  return (
    <div
      className="pp-search"
      ref={box}
      role="search"
      onBlur={(e) => {
        if (!box.current?.contains(e.relatedTarget as Node | null)) close();
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape") close();
      }}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </svg>
      <input
        type="search"
        value={q}
        placeholder="Find a patient or owner"
        aria-label="Find a patient or owner by name"
        autoComplete="off"
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && matches[0]) {
            router.push(`/patients/${matches[0].id}`);
            setQ("");
            close();
          }
        }}
      />
      <p className="sr-only" role="status" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>
        {q.trim() ? `${matches.length} ${matches.length === 1 ? "match" : "matches"}` : ""}
      </p>
      {open && q.trim() && (
        <div className="pp-results">
          {matches.length === 0 ? (
            <p className="pp-none">No patient or owner matches “{q.trim()}”.</p>
          ) : (
            <ul>
              {matches.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/patients/${p.id}`}
                    onClick={() => {
                      setQ("");
                      close();
                    }}
                  >
                    <b>{p.name}</b>
                    <small>
                      {p.species} · {ownerById(p.owner).name}
                    </small>
                    <AlertList alerts={p.alerts} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export function Shell({ children }: { children: React.ReactNode }) {
  const initials = user.name
    .split(" ")
    .map((w) => w[0])
    .join("");
  return (
    <div className="pp">
      <a className="pp-skip" href="#main">
        Skip to content
      </a>
      <header className="pp-header">
        <div className="pp-header-in">
          <Link href="/" className="pp-brand" aria-label="Pawpoint, today's schedule">
            <span className="pp-logo">
              <PawIcon />
            </span>
            <span>
              <b>Pawpoint</b>
              <small>Hillside Veterinary Clinic</small>
            </span>
          </Link>
          <Search />
          <div className="pp-me">
            <div>
              <b>{user.name}</b>
              <span>{user.role}</span>
            </div>
            <span className="pp-avatar" aria-hidden="true">
              {initials}
            </span>
          </div>
        </div>
      </header>
      <main id="main" className="pp-main">
        {children}
      </main>
      <p style={{ display: "none" }}>{formatLongDate(today)}</p>
    </div>
  );
}
```

```tsx src/components/Schedule.tsx
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  appointments as seed,
  findClash,
  formatLongDate,
  fromMin,
  ownerById,
  patientById,
  patients,
  today,
  toMin,
  vetById,
  vets,
  type Appointment,
} from "@/lib/data";
import { AlertList, StatusPill } from "./ui";

const NOW_START = 9 * 60 + 52;
const DAY_START = 8 * 60;
const DAY_END = 18 * 60;
const slots: string[] = [];
for (let m = DAY_START; m < DAY_END; m += 15) slots.push(fromMin(m));
const durations = [15, 20, 30, 45, 60];

function firstFree(list: Appointment[], vet: string, minutes: number, from: number): string {
  const start = Math.ceil(from / 15) * 15;
  for (const s of slots) {
    if (toMin(s) >= start && !findClash(list, vet, s, minutes) && toMin(s) + minutes <= DAY_END) return s;
  }
  return slots[0];
}

export function Schedule() {
  const [appts, setAppts] = useState<Appointment[]>(seed);
  const [now, setNow] = useState(NOW_START);
  const [vetFilter, setVetFilter] = useState<string>("all");
  const [message, setMessage] = useState("");
  const [justAdded, setJustAdded] = useState<string | null>(null);

  const [patient, setPatient] = useState("p-101");
  const [vet, setVet] = useState("v-1");
  const [minutes, setMinutes] = useState(20);
  const [time, setTime] = useState(() => firstFree(seed, "v-1", 20, NOW_START));
  const [reason, setReason] = useState("");
  const [urgent, setUrgent] = useState(false);

  useEffect(() => {
    const id = window.setInterval(() => setNow((n) => n + 1), 60000);
    return () => window.clearInterval(id);
  }, []);

  const rows = useMemo(
    () =>
      [...appts]
        .filter((a) => vetFilter === "all" || a.vet === vetFilter)
        .sort((a, b) => toMin(a.start) - toMin(b.start) || a.vet.localeCompare(b.vet)),
    [appts, vetFilter],
  );

  const waiting = useMemo(
    () =>
      appts
        .filter((a) => a.status === "checked_in")
        .sort((a, b) => toMin(a.checkedInAt ?? a.start) - toMin(b.checkedInAt ?? b.start)),
    [appts],
  );

  const count = (s: Appointment["status"]) => appts.filter((a) => a.status === s).length;
  const remaining = appts.filter((a) => a.status === "booked").length;

  const clash = findClash(appts, vet, time, minutes);
  const overrun = toMin(time) + minutes > DAY_END;
  const chosen = patientById(patient);

  const setStatus = (id: string, status: Appointment["status"]) => {
    const a = appts.find((x) => x.id === id);
    if (!a) return;
    const p = patientById(a.patient);
    setAppts((list) =>
      list.map((x) => (x.id === id ? { ...x, status, checkedInAt: status === "checked_in" ? fromMin(now) : x.checkedInAt } : x)),
    );
    const verb = status === "checked_in" ? "checked in" : status === "in_exam" ? "moved to the exam room" : "marked done";
    setMessage(`${p?.name ?? "Patient"} ${verb}.`);
  };

  const book = (e: React.FormEvent) => {
    e.preventDefault();
    if (clash || overrun) return;
    const id = `a-${String(appts.length + 1).padStart(2, "0")}`;
    const next: Appointment = {
      id,
      patient,
      vet,
      start: time,
      minutes,
      reason: reason.trim() || "Follow-up visit",
      status: "booked",
      urgent: urgent || undefined,
    };
    setAppts((l) => [...l, next]);
    setJustAdded(id);
    setMessage(`Booked ${chosen?.name} with ${vetById(vet).name} at ${time}.`);
    setReason("");
    setUrgent(false);
    setTime(firstFree([...appts, next], vet, minutes, toMin(time) + minutes));
  };

  const changeVet = (v: string) => {
    setVet(v);
    setTime(firstFree(appts, v, minutes, now));
  };
  const changeMinutes = (m: number) => {
    setMinutes(m);
    if (findClash(appts, vet, time, m)) setTime(firstFree(appts, vet, m, now));
  };

  return (
    <>
      <div className="pp-head">
        <div>
          <h1>Today’s schedule</h1>
          <p>{formatLongDate(today)} · Hillside Veterinary Clinic</p>
        </div>
        <p>Clock {fromMin(now)}</p>
      </div>

      <div className="pp-stats" role="group" aria-label="Today at a glance">
        <div className="pp-stat">
          <b>{waiting.length}</b>
          <span>Waiting now</span>
        </div>
        <div className="pp-stat">
          <b>{count("in_exam")}</b>
          <span>In exam</span>
        </div>
        <div className="pp-stat">
          <b>{remaining}</b>
          <span>Still to arrive</span>
        </div>
        <div className="pp-stat">
          <b>{count("done")}</b>
          <span>Done</span>
        </div>
      </div>

      <p className="pp-live" role="status" aria-live="polite">
        {message && <span className="pp-ok" style={{ display: "block", marginBottom: 14 }}>{message}</span>}
      </p>

      <div className="pp-layout">
        <div className="pp-aside">
          <section className="pp-card" aria-labelledby="wait-h">
            <div className="pp-card-head">
              <h2 id="wait-h">Waiting room</h2>
              <span className="pp-sub">{waiting.length} waiting</span>
            </div>
            {waiting.length === 0 ? (
              <p className="pp-empty">Nobody is waiting. Check in a patient from the schedule.</p>
            ) : (
              <ol className="pp-wait">
                {waiting.map((a, i) => {
                  const p = patientById(a.patient);
                  const mins = Math.max(0, now - toMin(a.checkedInAt ?? a.start));
                  return (
                    <li key={a.id}>
                      <Link className="n" href={`/patients/${a.patient}`}>
                        {i === 0 ? "Next: " : ""}
                        {p?.name}
                      </Link>
                      <span className={`m${mins >= 30 ? " long" : ""}`}>{mins} min</span>
                      <small>
                        {vetById(a.vet).name} · {a.reason} · in at {a.checkedInAt}
                      </small>
                      {p && p.alerts.length > 0 && (
                        <div style={{ gridColumn: "1 / -1" }}>
                          <AlertList alerts={p.alerts} />
                        </div>
                      )}
                    </li>
                  );
                })}
              </ol>
            )}
          </section>

          <section className="pp-card" aria-labelledby="book-h">
            <div className="pp-card-head">
              <h2 id="book-h">Book an appointment</h2>
            </div>
            <form className="pp-form" onSubmit={book} noValidate>
              <div className="pp-field">
                <label htmlFor="b-patient">Patient</label>
                <select id="b-patient" value={patient} onChange={(e) => setPatient(e.target.value)}>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.species}) · {ownerById(p.owner).name}
                      {p.alerts.length ? " · ALERT" : ""}
                    </option>
                  ))}
                </select>
                {chosen && chosen.alerts.length > 0 && <AlertList alerts={chosen.alerts} />}
              </div>
              <div className="pp-field">
                <label htmlFor="b-vet">Vet</label>
                <select id="b-vet" value={vet} onChange={(e) => changeVet(e.target.value)}>
                  {vets.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} · {v.room}
                    </option>
                  ))}
                </select>
              </div>
              <div className="pp-two">
                <div className="pp-field">
                  <label htmlFor="b-time">Time</label>
                  <select id="b-time" value={time} onChange={(e) => setTime(e.target.value)}>
                    {slots.map((s) => {
                      const taken = !!findClash(appts, vet, s, minutes) || toMin(s) + minutes > DAY_END;
                      return (
                        <option key={s} value={s} disabled={taken}>
                          {s}
                          {taken ? " (taken)" : ""}
                        </option>
                      );
                    })}
                  </select>
                </div>
                <div className="pp-field">
                  <label htmlFor="b-len">Length</label>
                  <select id="b-len" value={minutes} onChange={(e) => changeMinutes(Number(e.target.value))}>
                    {durations.map((d) => (
                      <option key={d} value={d}>
                        {d} min
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="pp-field">
                <label htmlFor="b-reason">Reason</label>
                <input id="b-reason" type="text" value={reason} placeholder="Follow-up visit" onChange={(e) => setReason(e.target.value)} />
              </div>
              <label className="pp-check">
                <input type="checkbox" checked={urgent} onChange={(e) => setUrgent(e.target.checked)} />
                Urgent visit
              </label>
              {(clash || overrun) && (
                <p className="pp-error" role="alert">
                  {clash
                    ? `${vetById(vet).name} already has ${patientById(clash.patient)?.name} from ${clash.start} to ${fromMin(toMin(clash.start) + clash.minutes)}. Pick another time or vet.`
                    : "That visit would run past closing time (18:00)."}
                </p>
              )}
              <button className="pp-btn wide" type="submit" disabled={!!clash || overrun}>
                Book appointment
              </button>
            </form>
          </section>
        </div>

        <section className="pp-sched" aria-labelledby="sched-h">
          <div className="pp-card-head">
            <h2 id="sched-h" style={{ fontSize: 20 }}>
              All appointments <span className="pp-sub">({rows.length})</span>
            </h2>
            <div className="pp-chips" role="group" aria-label="Filter by vet">
              <button type="button" className="pp-chip" aria-pressed={vetFilter === "all"} onClick={() => setVetFilter("all")}>
                All vets
              </button>
              {vets.map((v) => (
                <button key={v.id} type="button" className="pp-chip" aria-pressed={vetFilter === v.id} onClick={() => setVetFilter(v.id)}>
                  {v.name.replace("Dr. ", "Dr ")}
                </button>
              ))}
            </div>
          </div>
          <div className="pp-cols" aria-hidden="true">
            <span>Time</span>
            <span>Patient</span>
            <span>Reason</span>
            <span>Vet</span>
            <span>Status</span>
            <span />
          </div>
          <ul className="pp-list">
            {rows.map((a) => {
              const p = patientById(a.patient);
              if (!p) return null;
              const v = vetById(a.vet);
              return (
                <li key={a.id} className={`pp-row pp-s-${a.status}${a.urgent ? " pp-urgent" : ""}${justAdded === a.id ? " pp-new" : ""}`}>
                  <div className="pp-time">
                    {a.start}
                    <span>{a.minutes} min</span>
                  </div>
                  <div className="pp-who">
                    <Link href={`/patients/${p.id}`}>{p.name}</Link>
                    <small>
                      {p.species} · {ownerById(p.owner).name}
                    </small>
                    <AlertList alerts={p.alerts} />
                  </div>
                  <div className="pp-reason">
                    {a.urgent && <span className="pp-tag-urgent">Urgent</span>}
                    {a.reason}
                  </div>
                  <div className="pp-vet">
                    {v.name}
                    <br />
                    {v.room}
                  </div>
                  <div className="pp-state">
                    <StatusPill status={a.status} />
                  </div>
                  <div className="pp-act">
                    {a.status === "booked" && (
                      <button type="button" className="pp-btn" onClick={() => setStatus(a.id, "checked_in")} aria-label={`Check in ${p.name}`}>
                        Check in
                      </button>
                    )}
                    {a.status === "checked_in" && (
                      <button type="button" className="pp-btn ghost" onClick={() => setStatus(a.id, "in_exam")} aria-label={`Start exam for ${p.name}`}>
                        Start exam
                      </button>
                    )}
                    {a.status === "in_exam" && (
                      <button type="button" className="pp-btn ghost" onClick={() => setStatus(a.id, "done")} aria-label={`Mark ${p.name} done`}>
                        Mark done
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </>
  );
}
```

```tsx src/app/page.tsx
import { Shell } from "@/components/Shell";
import { Schedule } from "@/components/Schedule";

export const metadata = { title: "Today’s schedule · Pawpoint" };

export default function Page() {
  return (
    <Shell>
      <Schedule />
    </Shell>
  );
}
```

```tsx src/app/patients/[id]/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { Shell } from "@/components/Shell";
import { AlertList, StatusPill } from "@/components/ui";
import {
  ageText,
  appointments,
  daysBetween,
  formatDate,
  fromMin,
  money,
  ownerById,
  patientById,
  patients,
  records,
  today,
  toMin,
  vetById,
} from "@/lib/data";

export const metadata = { title: "Patient record · Pawpoint" };

export function generateStaticParams() {
  return patients.map((p) => ({ id: p.id }));
}

function WeightChart({ points }: { points: { date: string; kg: number }[] }) {
  const W = 640;
  const H = 250;
  const L = 44;
  const R = 24;
  const T = 28;
  const B = 36;
  const t = points.map((p) => Date.parse(`${p.date}T00:00:00Z`));
  const t0 = Math.min(...t);
  const t1 = Math.max(...t);
  const kgs = points.map((p) => p.kg);
  const lo = Math.floor(Math.min(...kgs) - 0.5);
  const hi = Math.ceil(Math.max(...kgs) + 0.5);
  const x = (v: number) => L + ((v - t0) / (t1 - t0 || 1)) * (W - L - R);
  const y = (kg: number) => T + (1 - (kg - lo) / (hi - lo)) * (H - T - B);
  const ticks: number[] = [];
  for (let k = lo; k <= hi; k++) ticks.push(k);
  const label = (d: string) =>
    new Intl.DateTimeFormat("en-US", { month: "short", year: "2-digit", timeZone: "UTC" }).format(new Date(`${d}T00:00:00Z`));
  const summary = points.map((p) => `${formatDate(p.date)}: ${p.kg} kg`).join("; ");
  return (
    <svg className="pp-chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Weight in kilograms over visits. ${summary}`}>
      {ticks.map((k) => (
        <g key={k}>
          <line x1={L} x2={W - R} y1={y(k)} y2={y(k)} stroke="#d8e1de" strokeWidth="1" />
          <text x={L - 8} y={y(k) + 4} textAnchor="end">
            {k}
          </text>
        </g>
      ))}
      <polyline fill="none" stroke="#0f6b63" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" points={points.map((p, i) => `${x(t[i])},${y(p.kg)}`).join(" ")} />
      {points.map((p, i) => (
        <g key={p.date}>
          <circle cx={x(t[i])} cy={y(p.kg)} r="5" fill="#fff" stroke="#0f6b63" strokeWidth="3" />
          <text className="val" x={x(t[i])} y={y(p.kg) - 12} textAnchor="middle">
            {p.kg}
          </text>
          <text x={x(t[i])} y={H - 10} textAnchor="middle">
            {label(p.date)}
          </text>
        </g>
      ))}
    </svg>
  );
}

export default async function PatientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const patient = patientById(id);
  if (!patient) notFound();
  const owner = ownerById(patient.owner);
  const record = records[patient.id];
  const todays = appointments.filter((a) => a.patient === patient.id).sort((a, b) => toMin(a.start) - toMin(b.start));

  const first = record?.weights_kg[0];
  const last = record?.weights_kg[record.weights_kg.length - 1];
  const delta = first && last ? last.kg - first.kg : 0;
  const pct = first ? (delta / first.kg) * 100 : 0;

  return (
    <Shell>
      <Link href="/" className="pp-back">
        ← Today’s schedule
      </Link>

      {patient.alerts.length > 0 && (
        <section className="pp-banner" aria-label="Medical alerts">
          <h2>Medical alerts: read before handling</h2>
          <AlertList alerts={patient.alerts} large />
        </section>
      )}

      <section className="pp-card">
        <div className="pp-id">
          <div className="pp-pet" aria-hidden="true">
            {patient.name[0]}
          </div>
          <div>
            <h1>{patient.name}</h1>
            <p className="pp-sub">
              {patient.breed} · {patient.species}
            </p>
          </div>
        </div>
        <dl className="pp-facts">
          <div>
            <dt>Age</dt>
            <dd>{ageText(patient.born)}</dd>
          </div>
          <div>
            <dt>Born</dt>
            <dd>{formatDate(patient.born)}</dd>
          </div>
          <div>
            <dt>Sex</dt>
            <dd>{patient.sex}</dd>
          </div>
          <div>
            <dt>Owner</dt>
            <dd>{owner.name}</dd>
          </div>
          <div>
            <dt>Owner phone</dt>
            <dd>
              <a href={`tel:${owner.phone.replace(/\s/g, "")}`}>{owner.phone}</a>
            </dd>
          </div>
          <div>
            <dt>Patient ID</dt>
            <dd>{patient.id}</dd>
          </div>
        </dl>
      </section>

      {todays.length > 0 && (
        <section className="pp-card" style={{ marginTop: 18 }} aria-labelledby="today-h">
          <div className="pp-card-head">
            <h2 id="today-h">Today, {formatDate(today)}</h2>
          </div>
          <ul className="pp-meds">
            {todays.map((a) => (
              <li key={a.id}>
                <span>
                  <b>
                    {a.start}–{fromMin(toMin(a.start) + a.minutes)}
                  </b>{" "}
                  {a.reason} · {vetById(a.vet).name}, {vetById(a.vet).room}
                </span>
                <StatusPill status={a.status} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {!record ? (
        <section className="pp-card" style={{ marginTop: 18 }}>
          <p className="pp-empty">No weight, vaccination or visit history is loaded for {patient.name} in this demo.</p>
        </section>
      ) : (
        <div className="pp-grid2">
          <div className="pp-stack">
            <section className="pp-card" aria-labelledby="w-h">
              <div className="pp-card-head">
                <h2 id="w-h">Weight trend</h2>
                <span className="pp-sub">
                  {first && last && (
                    <>
                      <span className="pp-trend">
                        {delta > 0 ? "+" : "−"}
                        {Math.abs(delta).toFixed(1)} kg ({Math.abs(pct).toFixed(0)}%)
                      </span>{" "}
                      since {formatDate(first.date)}
                    </>
                  )}
                </span>
              </div>
              <div className="pp-scroll">
                <WeightChart points={record.weights_kg} />
              </div>
            </section>

            <section className="pp-card" aria-labelledby="v-h">
              <div className="pp-card-head">
                <h2 id="v-h">Visit history</h2>
                <span className="pp-sub">{record.visits.length} visits</span>
              </div>
              <ol className="pp-visits">
                {record.visits.map((v) => (
                  <li className="pp-visit" key={v.date}>
                    <header>
                      <b>{formatDate(v.date)}</b>
                      <span>{v.reason}</span>
                      <span className="meta">
                        {vetById(v.vet).name} · {money(v.invoice_usd)}
                      </span>
                    </header>
                    <p>{v.notes}</p>
                  </li>
                ))}
              </ol>
            </section>
          </div>

          <div className="pp-stack">
            <section className="pp-card" aria-labelledby="vx-h">
              <div className="pp-card-head">
                <h2 id="vx-h">Vaccinations</h2>
                <span className="pp-sub">checked against {formatDate(today)}</span>
              </div>
              <ul className="pp-vax">
                {record.vaccinations.map((v) => {
                  const left = daysBetween(today, v.due);
                  const cls = left < 0 ? "over" : left <= 30 ? "soon" : "";
                  return (
                    <li key={v.name} className={cls}>
                      <b>{v.name}</b>
                      <span className="st">{left < 0 ? `OVERDUE ${-left} days` : left <= 30 ? `Due in ${left} days` : "Up to date"}</span>
                      <small>
                        Given {formatDate(v.given)} · due {formatDate(v.due)}
                      </small>
                    </li>
                  );
                })}
              </ul>
            </section>

            <section className="pp-card" aria-labelledby="m-h">
              <div className="pp-card-head">
                <h2 id="m-h">Current medications</h2>
              </div>
              <ul className="pp-meds">
                {record.medications.map((m) => (
                  <li key={m.name}>
                    <span>
                      <b>{m.name}</b>
                      <br />
                      <span className="pp-sub">{m.dose}</span>
                    </span>
                    <span className="pp-sub">since {formatDate(m.since)}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      )}
    </Shell>
  );
}
```
