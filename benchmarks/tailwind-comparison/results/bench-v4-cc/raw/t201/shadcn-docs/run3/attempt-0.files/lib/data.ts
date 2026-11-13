export type Status = "booked" | "checked_in" | "in_exam" | "done" | "cancelled";

export type Vet = { id: string; name: string; room: string };
export type Owner = { id: string; name: string; phone: string };
export type Patient = {
  id: string;
  name: string;
  species: string;
  breed: string;
  born: string;
  sex: string;
  owner: string;
  alerts: string[];
};
export type Appointment = {
  id: string;
  patient: string;
  vet: string;
  start: string;
  minutes: number;
  reason: string;
  status: Status;
  urgent?: boolean;
};
export type WeightPoint = { date: string; kg: number };
export type Vaccination = { name: string; given: string; due: string };
export type Medication = { name: string; dose: string; since: string };
export type Visit = {
  date: string;
  vet: string;
  reason: string;
  notes: string;
  invoice_usd: number;
};
export type PatientRecord = {
  weights_kg: WeightPoint[];
  vaccinations: Vaccination[];
  medications: Medication[];
  visits: Visit[];
};

export const CLINIC_NAME = "Hillside Veterinary Clinic";
export const PRODUCT_NAME = "Pawpoint";
export const TODAY = "2026-11-12";
/** The front desk clock at the moment the page opens (09:30). */
export const NOW_MINUTES = 9 * 60 + 30;
export const OPENING = 8 * 60;
export const CLOSING = 17 * 60;

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

/** Minutes since midnight at which each already checked-in patient arrived. */
export const initialArrivals: Record<string, number> = {
  "a-05": 9 * 60 + 10,
  "a-06": 9 * 60 + 24,
};

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

/* ------------------------------------------------------------------ */
/* Lookups                                                            */
/* ------------------------------------------------------------------ */

export function getPatient(id: string): Patient | undefined {
  return patients.find((p) => p.id === id);
}
export function getOwner(id: string): Owner | undefined {
  return owners.find((o) => o.id === id);
}
export function getVet(id: string): Vet | undefined {
  return vets.find((v) => v.id === id);
}
export function patientOf(a: Appointment): Patient {
  const p = getPatient(a.patient);
  if (!p) throw new Error(`Unknown patient ${a.patient}`);
  return p;
}
export function ownerOf(p: Patient): Owner {
  const o = getOwner(p.owner);
  if (!o) throw new Error(`Unknown owner ${p.owner}`);
  return o;
}
export function vetOf(a: Appointment): Vet {
  const v = getVet(a.vet);
  if (!v) throw new Error(`Unknown vet ${a.vet}`);
  return v;
}

export function searchPatients(query: string): Patient[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return patients.filter((p) => {
    const owner = getOwner(p.owner);
    return (
      p.name.toLowerCase().includes(q) ||
      (owner?.name.toLowerCase().includes(q) ?? false) ||
      p.breed.toLowerCase().includes(q) ||
      p.species.toLowerCase().includes(q)
    );
  });
}

/* ------------------------------------------------------------------ */
/* Time helpers                                                       */
/* ------------------------------------------------------------------ */

export function toMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}
export function toClock(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
export function endClock(a: { start: string; minutes: number }): string {
  return toClock(toMinutes(a.start) + a.minutes);
}

function dayNumber(iso: string): number {
  const [y, m, d] = iso.split("-").map(Number);
  return Math.round(Date.UTC(y, m - 1, d) / 86_400_000);
}
export function daysBetween(from: string, to: string): number {
  return dayNumber(to) - dayNumber(from);
}

function utcDate(iso: string): Date {
  return new Date(`${iso}T00:00:00Z`);
}
export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "UTC",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(utcDate(iso));
}
export function formatLongDate(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "UTC",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(utcDate(iso));
}
export function formatMonthYear(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "UTC",
    month: "short",
    year: "2-digit",
  }).format(utcDate(iso));
}
export function formatUsd(value: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
}

export function ageLabel(born: string): string {
  const [by, bm, bd] = born.split("-").map(Number);
  const [ty, tm, td] = TODAY.split("-").map(Number);
  let months = (ty - by) * 12 + (tm - bm);
  if (td < bd) months -= 1;
  const years = Math.floor(months / 12);
  const rest = months % 12;
  if (years === 0) return `${rest} mo`;
  return rest ? `${years} yr ${rest} mo` : `${years} yr`;
}

export type VaccinationState = {
  kind: "overdue" | "soon" | "current";
  label: string;
  days: number;
};
export function vaccinationState(due: string): VaccinationState {
  const days = daysBetween(TODAY, due);
  if (days < 0) {
    const n = -days;
    return { kind: "overdue", days, label: `Overdue by ${n} ${n === 1 ? "day" : "days"}` };
  }
  if (days <= 60) {
    return { kind: "soon", days, label: `Due in ${days} ${days === 1 ? "day" : "days"}` };
  }
  return { kind: "current", days, label: "Up to date" };
}

/* ------------------------------------------------------------------ */
/* Booking rules                                                      */
/* ------------------------------------------------------------------ */

function overlaps(a: Appointment, start: number, minutes: number): boolean {
  const aStart = toMinutes(a.start);
  return start < aStart + a.minutes && aStart < start + minutes;
}
export function findVetConflict(
  list: Appointment[],
  vetId: string,
  start: number,
  minutes: number
): Appointment | undefined {
  return list.find((a) => a.status !== "cancelled" && a.vet === vetId && overlaps(a, start, minutes));
}
export function findPatientConflict(
  list: Appointment[],
  patientId: string,
  start: number,
  minutes: number
): Appointment | undefined {
  return list.find((a) => a.status !== "cancelled" && a.patient === patientId && overlaps(a, start, minutes));
}

export function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}
