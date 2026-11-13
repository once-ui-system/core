export const CLINIC = {
  name: "Pawpoint",
  tagline: "Hillside Veterinary Clinic",
  description:
    "Pawpoint, front-desk and records software for Hillside Veterinary Clinic",
};

export const TODAY = "2026-11-12";
/** The front desk clock the demo starts at, in minutes after midnight (09:52). */
export const START_CLOCK = 9 * 60 + 52;

export const USER = { name: "Rosa Lindqvist", role: "Receptionist" };

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
export type Status =
  | "booked"
  | "checked_in"
  | "in_exam"
  | "done"
  | "cancelled";
export type Appointment = {
  id: string;
  patient: string;
  vet: string;
  start: string;
  minutes: number;
  reason: string;
  status: Status;
  urgent?: boolean;
  /** Minutes after midnight when the patient was checked in. */
  checkedInAt?: number;
};

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
  { id: "a-05", patient: "p-107", vet: "v-2", start: "09:15", minutes: 20, reason: "Glucose curve", status: "checked_in", checkedInAt: 9 * 60 + 8 },
  { id: "a-06", patient: "p-105", vet: "v-1", start: "09:45", minutes: 20, reason: "Beak and nail trim", status: "checked_in", checkedInAt: 9 * 60 + 40 },
  { id: "a-07", patient: "p-103", vet: "v-2", start: "10:00", minutes: 30, reason: "Senior wellness exam", status: "booked" },
  { id: "a-08", patient: "p-106", vet: "v-1", start: "10:30", minutes: 20, reason: "Not eating since yesterday", status: "booked", urgent: true },
  { id: "a-09", patient: "p-104", vet: "v-3", start: "11:00", minutes: 45, reason: "Dental cleaning", status: "booked" },
  { id: "a-10", patient: "p-101", vet: "v-2", start: "11:30", minutes: 20, reason: "Ear infection follow-up", status: "booked" },
  { id: "a-11", patient: "p-107", vet: "v-1", start: "13:30", minutes: 30, reason: "Dental check", status: "booked" },
  { id: "a-12", patient: "p-103", vet: "v-3", start: "14:00", minutes: 60, reason: "Lump removal", status: "cancelled" },
  { id: "a-13", patient: "p-102", vet: "v-2", start: "15:00", minutes: 20, reason: "X-ray results", status: "booked" },
];

export type PatientRecord = {
  weights_kg: { date: string; kg: number }[];
  vaccinations: { name: string; given: string; due: string }[];
  medications: { name: string; dose: string; since: string }[];
  visits: {
    date: string;
    vet: string;
    reason: string;
    notes: string;
    invoice_usd: number;
  }[];
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
        notes:
          "Creatinine 2.1 mg/dL (was 2.0). Weight down 0.6 kg. Continue benazepril, recheck in 3 months.",
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
        notes:
          "Mild kennel cough. Supportive care; no antibiotics given (penicillin allergy).",
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

/* ---------- helpers ---------- */

export const getPatient = (id: string) => patients.find((p) => p.id === id);
export const getOwner = (id: string) => owners.find((o) => o.id === id);
export const getVet = (id: string) => vets.find((v) => v.id === id);

export const toMin = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};
export const fromMin = (min: number) =>
  `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;
export const endTime = (a: { start: string; minutes: number }) =>
  fromMin(toMin(a.start) + a.minutes);

/** True when [start, start+minutes) overlaps a live booking of the same vet. */
export function findClash(
  list: Appointment[],
  vetId: string,
  start: string,
  minutes: number,
): Appointment | undefined {
  const s = toMin(start);
  const e = s + minutes;
  return list.find(
    (a) =>
      a.vet === vetId &&
      a.status !== "cancelled" &&
      s < toMin(a.start) + a.minutes &&
      toMin(a.start) < e,
  );
}

const dateFmt = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});
const shortFmt = new Intl.DateTimeFormat("en-GB", {
  month: "short",
  year: "2-digit",
  timeZone: "UTC",
});
const longFmt = new Intl.DateTimeFormat("en-GB", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});
const utc = (iso: string) => new Date(`${iso}T00:00:00Z`);
export const formatDate = (iso: string) => dateFmt.format(utc(iso));
export const formatMonth = (iso: string) => shortFmt.format(utc(iso));
export const formatLongDate = (iso: string) => longFmt.format(utc(iso));
export const formatUsd = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

const DAY = 86_400_000;
export const daysBetween = (fromIso: string, toIso: string) =>
  Math.round((utc(toIso).getTime() - utc(fromIso).getTime()) / DAY);

export function ageText(born: string, today = TODAY) {
  const b = utc(born);
  const t = utc(today);
  let months =
    (t.getUTCFullYear() - b.getUTCFullYear()) * 12 +
    (t.getUTCMonth() - b.getUTCMonth());
  if (t.getUTCDate() < b.getUTCDate()) months -= 1;
  const y = Math.floor(months / 12);
  const m = months % 12;
  if (y === 0) return `${m} mo`;
  return m ? `${y} yr ${m} mo` : `${y} yr`;
}

export type VaccineState = "overdue" | "due-soon" | "current";
export function vaccineState(due: string, today = TODAY) {
  const days = daysBetween(today, due);
  const state: VaccineState =
    days < 0 ? "overdue" : days <= 60 ? "due-soon" : "current";
  return { state, days };
}

export const STATUS_LABEL: Record<Status, string> = {
  booked: "Booked",
  checked_in: "Checked in",
  in_exam: "In exam",
  done: "Done",
  cancelled: "Cancelled",
};
