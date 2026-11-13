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

export interface PatientRecordData {
  weights_kg: Weight[];
  vaccinations: Vaccination[];
  medications: Medication[];
  visits: Visit[];
}

export const CLINIC = {
  name: "Pawpoint",
  tagline: "Front-desk and records software for Hillside Veterinary Clinic",
  site: "Hillside Veterinary Clinic",
};

export const TODAY = "2026-11-12";

/** The clinic clock when the page first opens (minutes after midnight): 9:22 AM. */
export const CLINIC_NOW = 9 * 60 + 22;
export const OPEN_MIN = 8 * 60;
export const CLOSE_MIN = 18 * 60;

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
  {
    id: "p-101",
    name: "Biscuit",
    species: "Dog",
    breed: "Beagle",
    born: "2019-04-02",
    sex: "Male, neutered",
    owner: "o-1",
    alerts: [],
  },
  {
    id: "p-102",
    name: "Mochi",
    species: "Cat",
    breed: "Domestic shorthair",
    born: "2021-07-15",
    sex: "Female, spayed",
    owner: "o-2",
    alerts: ["Bites when restrained"],
  },
  {
    id: "p-103",
    name: "Pepper",
    species: "Dog",
    breed: "Border collie",
    born: "2016-01-20",
    sex: "Female, spayed",
    owner: "o-3",
    alerts: [],
  },
  {
    id: "p-104",
    name: "Olive",
    species: "Dog",
    breed: "Labrador retriever",
    born: "2014-09-08",
    sex: "Female, spayed",
    owner: "o-4",
    alerts: ["Penicillin allergy", "Chronic kidney disease, stage 2"],
  },
  {
    id: "p-105",
    name: "Kiwi",
    species: "Bird",
    breed: "Budgerigar",
    born: "2023-03-11",
    sex: "Male",
    owner: "o-5",
    alerts: [],
  },
  {
    id: "p-106",
    name: "Tofu",
    species: "Rabbit",
    breed: "Holland lop",
    born: "2022-05-30",
    sex: "Female",
    owner: "o-6",
    alerts: [],
  },
  {
    id: "p-107",
    name: "Ziggy",
    species: "Cat",
    breed: "Maine coon",
    born: "2018-11-02",
    sex: "Male, neutered",
    owner: "o-2",
    alerts: ["Diabetic: insulin twice daily"],
  },
  {
    id: "p-108",
    name: "Bruno",
    species: "Dog",
    breed: "French bulldog",
    born: "2022-02-14",
    sex: "Male",
    owner: "o-5",
    alerts: ["Brachycephalic: sedation risk"],
  },
];

export const appointments: Appointment[] = [
  { id: "a-01", patient: "p-101", vet: "v-1", start: "08:30", minutes: 20, reason: "Annual vaccination", status: "done" },
  { id: "a-02", patient: "p-104", vet: "v-2", start: "08:30", minutes: 30, reason: "Kidney panel recheck", status: "done" },
  { id: "a-03", patient: "p-108", vet: "v-3", start: "08:00", minutes: 120, reason: "Soft palate surgery", status: "in_exam" },
  { id: "a-04", patient: "p-102", vet: "v-1", start: "09:00", minutes: 30, reason: "Limping, left hind leg", status: "in_exam" },
  { id: "a-05", patient: "p-107", vet: "v-2", start: "09:15", minutes: 20, reason: "Glucose curve", status: "checked_in" },
  { id: "a-06", patient: "p-105", vet: "v-1", start: "09:45", minutes: 20, reason: "Beak and nail trim", status: "checked_in" },
  { id: "a-07", patient: "p-103", vet: "v-2", start: "10:00", minutes: 30, reason: "Senior wellness exam", status: "booked" },
  { id: "a-08", patient: "p-106", vet: "v-1", start: "10:30", minutes: 20, reason: "Not eating since yesterday", status: "booked", urgent: true },
  { id: "a-09", patient: "p-104", vet: "v-3", start: "11:00", minutes: 45, reason: "Dental cleaning", status: "booked" },
  { id: "a-10", patient: "p-101", vet: "v-2", start: "11:30", minutes: 20, reason: "Ear infection follow-up", status: "booked" },
  { id: "a-11", patient: "p-107", vet: "v-1", start: "13:30", minutes: 30, reason: "Dental check", status: "booked" },
  { id: "a-12", patient: "p-103", vet: "v-3", start: "14:00", minutes: 60, reason: "Lump removal", status: "cancelled" },
  { id: "a-13", patient: "p-102", vet: "v-2", start: "15:00", minutes: 20, reason: "X-ray results", status: "booked" },
];

/** When the patients who are already checked in arrived (the check-in is not part of the appointment data). */
export const checkedInSeed: Record<string, string> = {
  "a-05": "09:05",
  "a-06": "09:18",
};

export const records: Record<string, PatientRecordData | undefined> = {
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
      {
        date: "2026-11-12",
        vet: "v-2",
        reason: "Kidney panel recheck",
        notes: "Creatinine 2.1 mg/dL (was 2.0). Weight down 0.6 kg. Continue benazepril, recheck in 3 months.",
        invoice_usd: 186.0,
      },
      {
        date: "2026-06-17",
        vet: "v-2",
        reason: "Kidney panel recheck",
        notes: "Stable. Appetite good. Owner reports more drinking in hot weather.",
        invoice_usd: 172.5,
      },
      {
        date: "2026-02-11",
        vet: "v-1",
        reason: "Coughing",
        notes: "Mild kennel cough. Supportive care; no antibiotics given (penicillin allergy).",
        invoice_usd: 94.0,
      },
      {
        date: "2025-11-03",
        vet: "v-2",
        reason: "Senior wellness exam",
        notes: "Grade 2 dental tartar. Dental cleaning recommended.",
        invoice_usd: 148.0,
      },
    ],
  },
};

/* ---------- lookups ---------- */

export function getPatient(id: string): Patient | undefined {
  return patients.find((p) => p.id === id);
}

export function getOwner(id: string): Owner | undefined {
  return owners.find((o) => o.id === id);
}

export function getVet(id: string): Vet | undefined {
  return vets.find((v) => v.id === id);
}

export function ownerOf(patient: Patient): Owner {
  return getOwner(patient.owner) ?? { id: "", name: "Unknown owner", phone: "" };
}

/* ---------- time and date ---------- */

export function toMin(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function minToTime(total: number): string {
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function fmtMin(total: number): string {
  const h = Math.floor(total / 60);
  const m = total % 60;
  const suffix = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${suffix}`;
}

export function fmtTime(time: string): string {
  return fmtMin(toMin(time));
}

export function fmtDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h} h` : `${h} h ${m} min`;
}

function parseDate(date: string): number {
  const [y, m, d] = date.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
}

export function fmtDate(date: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(parseDate(date));
}

export function fmtDateLong(date: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(parseDate(date));
}

export function fmtMonthYear(date: string): string {
  const d = new Date(parseDate(date));
  const month = new Intl.DateTimeFormat("en-US", { timeZone: "UTC", month: "short" }).format(d);
  return `${month} '${String(d.getUTCFullYear()).slice(2)}`;
}

export function daysBetween(from: string, to: string): number {
  return Math.round((parseDate(to) - parseDate(from)) / 86_400_000);
}

export function ageLabel(born: string, today: string): string {
  const [by, bm, bd] = born.split("-").map(Number);
  const [ty, tm, td] = today.split("-").map(Number);
  let months = (ty - by) * 12 + (tm - bm);
  if (td < bd) months -= 1;
  const years = Math.floor(months / 12);
  const rest = months % 12;
  const y = years === 1 ? "1 year" : `${years} years`;
  if (rest === 0) return y;
  return `${y}, ${rest === 1 ? "1 month" : `${rest} months`}`;
}

export type VaccinationState = "overdue" | "soon" | "current";

export function vaccinationStatus(due: string, today: string): { state: VaccinationState; days: number } {
  const days = daysBetween(today, due);
  if (days < 0) return { state: "overdue", days: -days };
  if (days <= 30) return { state: "soon", days };
  return { state: "current", days };
}

export function fmtUsd(value: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
}

/* ---------- booking rules ---------- */

export function endMin(a: { start: string; minutes: number }): number {
  return toMin(a.start) + a.minutes;
}

function overlaps(aStart: number, aEnd: number, b: Appointment): boolean {
  return aStart < endMin(b) && toMin(b.start) < aEnd;
}

/** An existing, non-cancelled booking for the same vet that overlaps the requested slot. */
export function findVetConflict(
  list: Appointment[],
  vetId: string,
  start: number,
  minutes: number,
): Appointment | undefined {
  return list.find((a) => a.vet === vetId && a.status !== "cancelled" && overlaps(start, start + minutes, a));
}

/** An existing, non-cancelled booking for the same patient that overlaps the requested slot. */
export function findPatientConflict(
  list: Appointment[],
  patientId: string,
  start: number,
  minutes: number,
): Appointment | undefined {
  return list.find((a) => a.patient === patientId && a.status !== "cancelled" && overlaps(start, start + minutes, a));
}

export function describeVetConflict(a: Appointment): string {
  const vet = getVet(a.vet)?.name ?? "This vet";
  const patient = getPatient(a.patient)?.name ?? "another patient";
  return `${vet} is already booked ${fmtMin(toMin(a.start))} to ${fmtMin(endMin(a))} (${patient}, ${a.reason.toLowerCase()}).`;
}

export function describePatientConflict(a: Appointment): string {
  const patient = getPatient(a.patient)?.name ?? "This patient";
  const vet = getVet(a.vet)?.name ?? "another vet";
  return `${patient} already has an appointment ${fmtMin(toMin(a.start))} to ${fmtMin(endMin(a))} with ${vet}.`;
}

export function nextFreeStart(
  list: Appointment[],
  vetId: string,
  minutes: number,
  from: number,
): string | undefined {
  for (let t = Math.max(OPEN_MIN, Math.ceil(from / 15) * 15); t + minutes <= CLOSE_MIN; t += 15) {
    if (!findVetConflict(list, vetId, t, minutes)) return minToTime(t);
  }
  return undefined;
}

/* ---------- search ---------- */

export function searchPatients(query: string): Patient[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const digits = q.replace(/\D/g, "");
  const scored = patients
    .map((p) => {
      const owner = ownerOf(p);
      const name = p.name.toLowerCase();
      const ownerName = owner.name.toLowerCase();
      let score = 0;
      if (name.startsWith(q)) score = 4;
      else if (ownerName.split(" ").some((part) => part.startsWith(q)) || ownerName.startsWith(q)) score = 3;
      else if (name.includes(q)) score = 2;
      else if (ownerName.includes(q)) score = 1;
      else if (digits.length >= 3 && owner.phone.replace(/\D/g, "").includes(digits)) score = 1;
      return { p, score };
    })
    .filter((x) => x.score > 0);
  scored.sort((a, b) => b.score - a.score || a.p.name.localeCompare(b.p.name));
  return scored.map((x) => x.p);
}
