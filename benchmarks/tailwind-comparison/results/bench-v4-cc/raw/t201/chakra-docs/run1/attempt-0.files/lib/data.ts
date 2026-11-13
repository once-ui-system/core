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
  /** Minutes since midnight at which the patient was checked in. */
  checkedInAt?: number;
}

export interface WeightEntry {
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

export interface PatientRecordData {
  weights_kg: WeightEntry[];
  vaccinations: Vaccination[];
  medications: Medication[];
  visits: Visit[];
}

export const CLINIC = "Pawpoint, front-desk and records software for Hillside Veterinary Clinic";
export const TODAY = "2026-11-12";
export const TODAY_LONG = "Thursday 12 November 2026";

/** The front desk clock at the moment the page opens (9:52 AM), in minutes since midnight. */
export const CLOCK_START = 9 * 60 + 52;

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

export const initialAppointments: Appointment[] = [
  { id: "a-01", patient: "p-101", vet: "v-1", start: "08:30", minutes: 20, reason: "Annual vaccination", status: "done" },
  { id: "a-02", patient: "p-104", vet: "v-2", start: "08:30", minutes: 30, reason: "Kidney panel recheck", status: "done" },
  { id: "a-03", patient: "p-108", vet: "v-3", start: "08:00", minutes: 120, reason: "Soft palate surgery", status: "in_exam" },
  { id: "a-04", patient: "p-102", vet: "v-1", start: "09:00", minutes: 30, reason: "Limping, left hind leg", status: "in_exam" },
  { id: "a-05", patient: "p-107", vet: "v-2", start: "09:15", minutes: 20, reason: "Glucose curve", status: "checked_in", checkedInAt: 9 * 60 + 8 },
  { id: "a-06", patient: "p-105", vet: "v-1", start: "09:45", minutes: 20, reason: "Beak and nail trim", status: "checked_in", checkedInAt: 9 * 60 + 41 },
  { id: "a-07", patient: "p-103", vet: "v-2", start: "10:00", minutes: 30, reason: "Senior wellness exam", status: "booked" },
  { id: "a-08", patient: "p-106", vet: "v-1", start: "10:30", minutes: 20, reason: "Not eating since yesterday", status: "booked", urgent: true },
  { id: "a-09", patient: "p-104", vet: "v-3", start: "11:00", minutes: 45, reason: "Dental cleaning", status: "booked" },
  { id: "a-10", patient: "p-101", vet: "v-2", start: "11:30", minutes: 20, reason: "Ear infection follow-up", status: "booked" },
  { id: "a-11", patient: "p-107", vet: "v-1", start: "13:30", minutes: 30, reason: "Dental check", status: "booked" },
  { id: "a-12", patient: "p-103", vet: "v-3", start: "14:00", minutes: 60, reason: "Lump removal", status: "cancelled" },
  { id: "a-13", patient: "p-102", vet: "v-2", start: "15:00", minutes: 20, reason: "X-ray results", status: "booked" },
];

export const records: Record<string, PatientRecordData> = {
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

export function getPatient(id: string): Patient {
  const p = patients.find((x) => x.id === id);
  if (!p) throw new Error(`Unknown patient ${id}`);
  return p;
}

export function getOwner(id: string): Owner {
  const o = owners.find((x) => x.id === id);
  if (!o) throw new Error(`Unknown owner ${id}`);
  return o;
}

export function getVet(id: string): Vet {
  const v = vets.find((x) => x.id === id);
  if (!v) throw new Error(`Unknown vet ${id}`);
  return v;
}

export function toMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

export function fmtClock(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
}

export function fmtWait(min: number): string {
  if (min < 1) return "just now";
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h} h ${m} min` : `${h} h`;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function fmtDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

export function fmtMonth(iso: string): string {
  const [y, m] = iso.split("-").map(Number);
  return `${MONTHS[m - 1]} ’${String(y).slice(2)}`;
}

export function fmtUsd(n: number): string {
  return `$${n.toFixed(2)}`;
}

export function daysBetween(fromIso: string, toIso: string): number {
  const [fy, fm, fd] = fromIso.split("-").map(Number);
  const [ty, tm, td] = toIso.split("-").map(Number);
  return Math.round((Date.UTC(ty, tm - 1, td) - Date.UTC(fy, fm - 1, fd)) / 86400000);
}

export function ageText(born: string): string {
  const [by, bm, bd] = born.split("-").map(Number);
  const [ty, tm, td] = TODAY.split("-").map(Number);
  let months = (ty - by) * 12 + (tm - bm);
  if (td < bd) months -= 1;
  const y = Math.floor(months / 12);
  const m = months % 12;
  if (y < 1) return `${m} mo`;
  return m ? `${y} yr ${m} mo` : `${y} yr`;
}

export type VaccinationState =
  | { kind: "overdue"; days: number }
  | { kind: "soon"; days: number }
  | { kind: "ok"; days: number };

/** Compares a due date with today's date (TODAY). */
export function vaccinationState(due: string): VaccinationState {
  const days = daysBetween(TODAY, due);
  if (days < 0) return { kind: "overdue", days: -days };
  if (days <= 60) return { kind: "soon", days };
  return { kind: "ok", days };
}

export function searchPatients(query: string): Patient[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return patients
    .filter((p) => p.name.toLowerCase().includes(q) || getOwner(p.owner).name.toLowerCase().includes(q))
    .sort((a, b) => {
      const as = a.name.toLowerCase().startsWith(q) ? 0 : 1;
      const bs = b.name.toLowerCase().startsWith(q) ? 0 : 1;
      return as - bs || a.name.localeCompare(b.name);
    });
}
