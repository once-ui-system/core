```ts lib/data.ts
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

export interface PatientRecord {
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
}

export const CLINIC_NAME = "Pawpoint";
export const CLINIC_SUBTITLE = "Hillside Veterinary Clinic";
export const TODAY = "2026-11-12";
/** The front-desk clock starts here (minutes after midnight): 9:52 AM. */
export const NOW_MINUTES = 9 * 60 + 52;

export const USER = { name: "Rosa Lindqvist", role: "Receptionist" };

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
  { id: "a-05", patient: "p-107", vet: "v-2", start: "09:15", minutes: 20, reason: "Glucose curve", status: "checked_in", checkedInAt: "09:22" },
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
```

```ts lib/format.ts
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
```

```ts lib/schedule.ts
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
```

```tsx components/AlertBadges.tsx
import { TriangleAlert } from "lucide-react";

/** Medical alerts: solid red, icon plus text, so they read at a glance and never rely on colour alone. */
export function AlertBadges({ alerts, className = "" }: { alerts: string[]; className?: string }) {
  if (alerts.length === 0) return null;
  return (
    <ul aria-label="Medical alerts" className={`flex flex-wrap gap-1.5 ${className}`}>
      {alerts.map((alert) => (
        <li
          key={alert}
          className="inline-flex items-center gap-1 rounded-md bg-red-700 px-2 py-0.5 text-xs font-bold text-white"
        >
          <TriangleAlert aria-hidden className="size-3.5 shrink-0" />
          <span className="sr-only">Medical alert: </span>
          {alert}
        </li>
      ))}
    </ul>
  );
}

/** Small marker for tight spaces (vet board, lists of names). */
export function AlertMark({ alerts }: { alerts: string[] }) {
  if (alerts.length === 0) return null;
  return (
    <span
      title={alerts.join("; ")}
      className="inline-flex items-center align-middle text-red-700"
    >
      <TriangleAlert aria-hidden className="size-4" />
      <span className="sr-only">Medical alert: {alerts.join("; ")}</span>
    </span>
  );
}
```

```tsx components/StatusPill.tsx
import type { Status } from "@/lib/data";

const LABELS: Record<Status, string> = {
  booked: "Booked",
  checked_in: "Checked in",
  in_exam: "In exam",
  done: "Done",
  cancelled: "Cancelled",
};

const STYLES: Record<Status, string> = {
  booked: "bg-slate-100 text-slate-700 ring-slate-300",
  checked_in: "bg-teal-50 text-teal-800 ring-teal-300",
  in_exam: "bg-indigo-50 text-indigo-800 ring-indigo-300",
  done: "bg-emerald-50 text-emerald-800 ring-emerald-300",
  cancelled: "bg-white text-slate-600 ring-slate-300 line-through",
};

export function StatusPill({ status }: { status: Status }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${STYLES[status]}`}
    >
      {LABELS[status]}
    </span>
  );
}
```

```tsx components/PatientSearch.tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { getOwner, patients } from "@/lib/data";
import { AlertBadges } from "@/components/AlertBadges";

export default function PatientSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const listId = useId();

  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return [];
    const digits = term.replace(/\D/g, "");
    return patients.filter((p) => {
      const owner = getOwner(p.owner);
      const phoneMatch = digits.length >= 3 && owner.phone.replace(/\D/g, "").includes(digits);
      return p.name.toLowerCase().includes(term) || owner.name.toLowerCase().includes(term) || phoneMatch;
    });
  }, [query]);

  const showPanel = open && query.trim().length > 0;

  function go(id: string) {
    setOpen(false);
    setQuery("");
    router.push(`/patients/${id}`);
  }

  return (
    <div
      className="relative w-full"
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOpen(false);
      }}
    >
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          if (results.length > 0) go(results[0].id);
        }}
      >
        <label htmlFor="patient-search" className="sr-only">
          Search patients or owners by name
        </label>
        <div className="relative">
          <Search aria-hidden className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-slate-500" />
          <input
            id="patient-search"
            type="search"
            autoComplete="off"
            value={query}
            placeholder="Find a patient or owner"
            aria-controls={listId}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setOpen(false);
                setQuery("");
              }
            }}
            className="h-12 w-full rounded-xl border border-slate-300 bg-slate-50 pl-11 pr-4 text-base text-slate-900 placeholder:text-slate-500 focus:border-teal-600 focus:bg-white"
          />
        </div>
      </form>

      <div role="status" className="sr-only">
        {showPanel ? `${results.length} ${results.length === 1 ? "match" : "matches"}` : ""}
      </div>

      {showPanel && (
        <div
          id={listId}
          className="absolute inset-x-0 top-full z-40 mt-2 max-h-[70vh] overflow-y-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl"
        >
          {results.length === 0 ? (
            <p className="px-3 py-4 text-sm text-slate-600">No patient or owner matches &ldquo;{query.trim()}&rdquo;.</p>
          ) : (
            <ul>
              {results.map((p) => {
                const owner = getOwner(p.owner);
                return (
                  <li key={p.id}>
                    <Link
                      href={`/patients/${p.id}`}
                      onClick={() => {
                        setOpen(false);
                        setQuery("");
                      }}
                      className="block rounded-lg px-3 py-2.5 hover:bg-teal-50 focus-visible:bg-teal-50"
                    >
                      <span className="flex flex-wrap items-baseline gap-x-2">
                        <span className="font-semibold text-slate-900">{p.name}</span>
                        <span className="text-sm text-slate-600">
                          {p.species}, {p.breed}
                        </span>
                      </span>
                      <span className="block text-sm text-slate-600">
                        {owner.name} &middot; {owner.phone}
                      </span>
                      <AlertBadges alerts={p.alerts} className="mt-1.5" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
```

```tsx components/AppHeader.tsx
import Link from "next/link";
import { PawPrint } from "lucide-react";
import PatientSearch from "@/components/PatientSearch";
import { CLINIC_NAME, CLINIC_SUBTITLE, USER } from "@/lib/data";
import { initials } from "@/lib/format";

export default function AppHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3 rounded-lg" aria-label={`${CLINIC_NAME} home, today's schedule`}>
          <span className="grid size-11 place-items-center rounded-xl bg-teal-700 text-white">
            <PawPrint aria-hidden className="size-6" />
          </span>
          <span className="leading-tight">
            <span className="block text-lg font-bold tracking-tight text-slate-900">{CLINIC_NAME}</span>
            <span className="block text-xs text-slate-600">{CLINIC_SUBTITLE}</span>
          </span>
        </Link>

        <div className="order-last w-full md:order-none md:max-w-xl md:flex-1">
          <PatientSearch />
        </div>

        <div className="ml-auto flex items-center gap-3">
          <div className="hidden text-right leading-tight sm:block">
            <p className="text-sm font-semibold text-slate-900">{USER.name}</p>
            <p className="text-xs text-slate-600">{USER.role}</p>
          </div>
          <span
            aria-label={`${USER.name}, ${USER.role}`}
            role="img"
            className="grid size-10 place-items-center rounded-full bg-slate-800 text-sm font-semibold text-white"
          >
            {initials(USER.name)}
          </span>
        </div>
      </div>
    </header>
  );
}
```

```tsx components/BookingDialog.tsx
"use client";

import { useEffect, useId, useRef, useState } from "react";
import { CalendarPlus, CircleAlert, X } from "lucide-react";
import { AlertBadges } from "@/components/AlertBadges";
import { type Appointment, getOwner, getPatient, getVet, patients, vets } from "@/lib/data";
import { fromMinutes, time12, toMinutes } from "@/lib/format";
import { DAY_END, SLOTS, findPatientConflict, findVetConflict, nextFreeStart } from "@/lib/schedule";

const DURATIONS = [15, 20, 30, 45, 60, 90];

const fieldClass =
  "mt-1.5 h-12 w-full rounded-lg border border-slate-300 bg-white px-3 text-base text-slate-900 focus:border-teal-600";

interface Props {
  open: boolean;
  onClose: () => void;
  appointments: Appointment[];
  now: number;
  onBook: (appointment: Appointment) => void;
}

export default function BookingDialog({ open, onClose, appointments, now, onBook }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="m-auto max-h-[calc(100dvh-1.5rem)] w-[calc(100%-1.5rem)] max-w-xl overflow-y-auto rounded-2xl bg-white p-0 text-slate-900 shadow-2xl backdrop:bg-slate-900/60"
    >
      {open && <BookingForm titleId={titleId} appointments={appointments} now={now} onBook={onBook} onClose={onClose} />}
    </dialog>
  );
}

function BookingForm({
  titleId,
  appointments,
  now,
  onBook,
  onClose,
}: {
  titleId: string;
  appointments: Appointment[];
  now: number;
  onBook: (appointment: Appointment) => void;
  onClose: () => void;
}) {
  const defaultStart = Math.min(DAY_END - 15, Math.ceil(now / 15) * 15);
  const [patientId, setPatientId] = useState("");
  const [vetId, setVetId] = useState(vets[0].id);
  const [start, setStart] = useState(defaultStart);
  const [minutes, setMinutes] = useState(20);
  const [reason, setReason] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const end = start + minutes;
  const vetClash = findVetConflict(appointments, vetId, start, minutes);
  const patientClash = patientId ? findPatientConflict(appointments, patientId, start, minutes) : undefined;
  const pastClosing = end > DAY_END;
  const blocked = Boolean(vetClash || patientClash || pastClosing);
  const suggestion = vetClash || pastClosing ? nextFreeStart(appointments, vetId, minutes, start) : null;

  const patient = patientId ? getPatient(patientId) : null;
  const missingPatient = submitted && !patientId;
  const missingReason = submitted && reason.trim() === "";

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    if (!patientId || reason.trim() === "" || blocked) return;
    const nextNum =
      appointments.reduce((max, a) => Math.max(max, Number(a.id.replace(/\D/g, "")) || 0), 0) + 1;
    onBook({
      id: `a-${String(nextNum).padStart(2, "0")}`,
      patient: patientId,
      vet: vetId,
      start: fromMinutes(start),
      minutes,
      reason: reason.trim(),
      status: "booked",
    });
    onClose();
  }

  return (
    <form onSubmit={submit} noValidate>
      <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
        <div>
          <h2 id={titleId} className="text-xl font-bold tracking-tight">
            Book an appointment
          </h2>
          <p className="text-sm text-slate-600">Pick a patient, a vet and a time. Clashes are blocked.</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="grid size-11 shrink-0 place-items-center rounded-lg text-slate-600 hover:bg-slate-100"
        >
          <X aria-hidden className="size-5" />
        </button>
      </div>

      <div className="space-y-4 px-5 py-5">
        <div>
          <label htmlFor="bk-patient" className="text-sm font-semibold">
            Patient
          </label>
          <select
            id="bk-patient"
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
            aria-invalid={missingPatient}
            aria-describedby={missingPatient ? "bk-patient-err" : undefined}
            className={fieldClass}
          >
            <option value="">Choose a patient&hellip;</option>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.species}) &mdash; {getOwner(p.owner).name}
                {p.alerts.length ? " ⚠ alert" : ""}
              </option>
            ))}
          </select>
          {missingPatient && (
            <p id="bk-patient-err" className="mt-1 text-sm font-medium text-red-700">
              Choose a patient to book.
            </p>
          )}
          {patient && (
            <div className="mt-2 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">
              <p>
                {patient.breed} &middot; owner {getOwner(patient.owner).name}, {getOwner(patient.owner).phone}
              </p>
              <AlertBadges alerts={patient.alerts} className="mt-1.5" />
            </div>
          )}
        </div>

        <div>
          <label htmlFor="bk-vet" className="text-sm font-semibold">
            Vet
          </label>
          <select id="bk-vet" value={vetId} onChange={(e) => setVetId(e.target.value)} className={fieldClass}>
            {vets.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name} &mdash; {v.room}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="bk-start" className="text-sm font-semibold">
              Start
            </label>
            <select
              id="bk-start"
              value={start}
              onChange={(e) => setStart(Number(e.target.value))}
              className={fieldClass}
            >
              {SLOTS.map((t) => (
                <option key={t} value={t}>
                  {time12(t)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="bk-min" className="text-sm font-semibold">
              Length
            </label>
            <select
              id="bk-min"
              value={minutes}
              onChange={(e) => setMinutes(Number(e.target.value))}
              className={fieldClass}
            >
              {DURATIONS.map((m) => (
                <option key={m} value={m}>
                  {m} min
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="bk-reason" className="text-sm font-semibold">
            Reason for visit
          </label>
          <input
            id="bk-reason"
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Ear infection follow-up"
            aria-invalid={missingReason}
            aria-describedby={missingReason ? "bk-reason-err" : undefined}
            className={fieldClass}
          />
          {missingReason && (
            <p id="bk-reason-err" className="mt-1 text-sm font-medium text-red-700">
              Add a short reason.
            </p>
          )}
        </div>

        <div aria-live="polite">
          {blocked ? (
            <div role="alert" className="flex gap-3 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-900">
              <CircleAlert aria-hidden className="mt-0.5 size-5 shrink-0" />
              <div className="space-y-1">
                {vetClash && (
                  <p>
                    <strong>{getVet(vetId).name}</strong> is already booked {time12(vetClash.start)} to{" "}
                    {time12(toMinutes(vetClash.start) + vetClash.minutes)} ({getPatient(vetClash.patient).name},{" "}
                    {vetClash.reason}).
                  </p>
                )}
                {patientClash && (
                  <p>
                    {patient?.name} already has an appointment at {time12(patientClash.start)} with{" "}
                    {getVet(patientClash.vet).name}.
                  </p>
                )}
                {pastClosing && <p>This would run past closing time ({time12(DAY_END)}).</p>}
                {(vetClash || pastClosing) &&
                  (suggestion !== null ? (
                    <button
                      type="button"
                      onClick={() => setStart(suggestion)}
                      className="mt-1 inline-flex min-h-10 items-center rounded-lg bg-white px-3 font-semibold text-red-900 ring-1 ring-red-300 hover:bg-red-100"
                    >
                      Use next free time: {time12(suggestion)}
                    </button>
                  ) : (
                    <p>No free time left today for {getVet(vetId).name} at this length.</p>
                  ))}
              </div>
            </div>
          ) : (
            <p className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-900">
              {getVet(vetId).name} is free {time12(start)} to {time12(end)}.
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col-reverse gap-2 border-t border-slate-200 px-5 py-4 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onClose}
          className="min-h-12 rounded-lg px-5 font-semibold text-slate-700 ring-1 ring-slate-300 hover:bg-slate-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={blocked}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-teal-700 px-5 font-semibold text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600"
        >
          <CalendarPlus aria-hidden className="size-5" />
          Book appointment
        </button>
      </div>
    </form>
  );
}
```

```tsx components/FrontDesk.tsx
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CalendarPlus, CircleCheck, Clock, LogIn, Zap } from "lucide-react";
import { AlertBadges, AlertMark } from "@/components/AlertBadges";
import BookingDialog from "@/components/BookingDialog";
import { StatusPill } from "@/components/StatusPill";
import {
  type Appointment,
  NOW_MINUTES,
  TODAY,
  appointments as seed,
  getOwner,
  getPatient,
  getVet,
  vets,
} from "@/lib/data";
import { formatLongDate, fromMinutes, time12, toMinutes } from "@/lib/format";

function waitTone(min: number): string {
  if (min >= 30) return "bg-red-50 text-red-800 ring-red-300";
  if (min >= 15) return "bg-amber-50 text-amber-900 ring-amber-300";
  return "bg-slate-100 text-slate-800 ring-slate-300";
}

export default function FrontDesk() {
  const [appts, setAppts] = useState<Appointment[]>(seed);
  const [now, setNow] = useState(NOW_MINUTES);
  const [vetFilter, setVetFilter] = useState("all");
  const [activeOnly, setActiveOnly] = useState(false);
  const [bookOpen, setBookOpen] = useState(false);
  const [notice, setNotice] = useState<{ id: number; text: string } | null>(null);
  const [flashId, setFlashId] = useState<string | null>(null);

  useEffect(() => {
    const t = setInterval(() => setNow((n) => n + 1), 60000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(null), 8000);
    return () => clearTimeout(t);
  }, [notice]);

  useEffect(() => {
    if (!flashId) return;
    const t = setTimeout(() => setFlashId(null), 3500);
    return () => clearTimeout(t);
  }, [flashId]);

  const sorted = useMemo(
    () => [...appts].sort((a, b) => toMinutes(a.start) - toMinutes(b.start) || a.vet.localeCompare(b.vet)),
    [appts],
  );

  const visible = sorted.filter(
    (a) =>
      (vetFilter === "all" || a.vet === vetFilter) && (!activeOnly || (a.status !== "done" && a.status !== "cancelled")),
  );

  const waiting = useMemo(
    () =>
      appts
        .filter((a) => a.status === "checked_in")
        .sort(
          (a, b) =>
            Number(Boolean(b.urgent)) - Number(Boolean(a.urgent)) ||
            toMinutes(a.checkedInAt ?? a.start) - toMinutes(b.checkedInAt ?? b.start),
        ),
    [appts],
  );

  const counts = {
    waiting: appts.filter((a) => a.status === "checked_in").length,
    exam: appts.filter((a) => a.status === "in_exam").length,
    toArrive: appts.filter((a) => a.status === "booked").length,
    done: appts.filter((a) => a.status === "done").length,
  };

  function checkIn(a: Appointment) {
    const p = getPatient(a.patient);
    setAppts((list) =>
      list.map((x) => (x.id === a.id ? { ...x, status: "checked_in", checkedInAt: fromMinutes(now) } : x)),
    );
    setNotice({
      id: Date.now(),
      text: `${p.name} is checked in for ${getVet(a.vet).name}.${p.alerts.length ? ` Alert: ${p.alerts.join("; ")}.` : ""}`,
    });
  }

  function handleBook(a: Appointment) {
    setAppts((list) => [...list, a]);
    setFlashId(a.id);
    setNotice({
      id: Date.now(),
      text: `Booked ${getPatient(a.patient).name} with ${getVet(a.vet).name} at ${time12(a.start)}.`,
    });
  }

  const board = vets.map((v) => {
    const mine = appts.filter((a) => a.vet === v.id);
    return {
      vet: v,
      inExam: mine.filter((a) => a.status === "in_exam"),
      waiting: mine.filter((a) => a.status === "checked_in"),
      next: mine
        .filter((a) => a.status === "booked")
        .sort((a, b) => toMinutes(a.start) - toMinutes(b.start))[0],
    };
  });

  return (
    <main id="main" className="mx-auto w-full max-w-[1400px] px-4 py-5 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Today&rsquo;s schedule</h1>
          <p className="mt-1 text-slate-600">
            {formatLongDate(TODAY)} &middot; <span className="tabular-nums">{time12(now)}</span> &middot;{" "}
            <span className="font-medium text-slate-800">{counts.waiting} waiting</span>, {counts.exam} in exam,{" "}
            {counts.toArrive} still to arrive, {counts.done} done
          </p>
        </div>
        <button
          type="button"
          onClick={() => setBookOpen(true)}
          className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-teal-700 px-5 text-base font-semibold text-white shadow-sm hover:bg-teal-800"
        >
          <CalendarPlus aria-hidden className="size-5" />
          Book appointment
        </button>
      </div>

      <section aria-labelledby="board-h" className="mt-5">
        <h2 id="board-h" className="sr-only">
          Vets right now
        </h2>
        <ul className="grid gap-3 md:grid-cols-3">
          {board.map(({ vet, inExam, waiting: w, next }) => (
            <li key={vet.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-baseline justify-between gap-2">
                <p className="font-bold text-slate-900">{vet.name}</p>
                <p className="text-sm text-slate-600">{vet.room}</p>
              </div>
              <dl className="mt-3 space-y-1.5 text-sm">
                <div className="flex gap-2">
                  <dt className="w-16 shrink-0 font-semibold text-indigo-800">In exam</dt>
                  <dd className="text-slate-800">
                    {inExam.length === 0
                      ? "Free"
                      : inExam.map((a) => (
                          <span key={a.id} className="mr-2 inline-flex items-center gap-1">
                            {getPatient(a.patient).name}
                            <AlertMark alerts={getPatient(a.patient).alerts} />
                          </span>
                        ))}
                  </dd>
                </div>
                <div className="flex gap-2">
                  <dt className="w-16 shrink-0 font-semibold text-teal-800">Waiting</dt>
                  <dd className="text-slate-800">
                    {w.length === 0
                      ? "No one"
                      : w.map((a) => (
                          <span key={a.id} className="mr-2 inline-flex items-center gap-1">
                            {getPatient(a.patient).name}
                            <AlertMark alerts={getPatient(a.patient).alerts} />
                          </span>
                        ))}
                  </dd>
                </div>
                <div className="flex gap-2">
                  <dt className="w-16 shrink-0 font-semibold text-slate-700">Next</dt>
                  <dd className="text-slate-800">
                    {next ? (
                      <span className="inline-flex items-center gap-1">
                        {time12(next.start)} {getPatient(next.patient).name}
                        <AlertMark alerts={getPatient(next.patient).alerts} />
                      </span>
                    ) : (
                      "Nothing booked"
                    )}
                  </dd>
                </div>
              </dl>
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_21rem]">
        <section aria-labelledby="sched-h" className="min-w-0 lg:col-start-1 lg:row-start-1">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="sched-h" className="text-xl font-bold text-slate-900">
              Appointments <span className="font-medium text-slate-600">({visible.length})</span>
            </h2>
            <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter appointments">
              {[{ id: "all", label: "All vets" }, ...vets.map((v) => ({ id: v.id, label: v.name.replace("Dr. ", "") }))].map(
                (f) => (
                  <button
                    key={f.id}
                    type="button"
                    aria-pressed={vetFilter === f.id}
                    onClick={() => setVetFilter(f.id)}
                    className={`min-h-11 rounded-full px-4 text-sm font-semibold ring-1 ring-inset ${
                      vetFilter === f.id
                        ? "bg-slate-900 text-white ring-slate-900"
                        : "bg-white text-slate-700 ring-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    {f.label}
                  </button>
                ),
              )}
              <button
                type="button"
                aria-pressed={activeOnly}
                onClick={() => setActiveOnly((v) => !v)}
                className={`min-h-11 rounded-full px-4 text-sm font-semibold ring-1 ring-inset ${
                  activeOnly
                    ? "bg-teal-700 text-white ring-teal-700"
                    : "bg-white text-slate-700 ring-slate-300 hover:bg-slate-50"
                }`}
              >
                Hide done and cancelled
              </button>
            </div>
          </div>

          {visible.length === 0 ? (
            <p className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">
              No appointments match this filter.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-slate-200 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              {visible.map((a) => {
                const p = getPatient(a.patient);
                const owner = getOwner(p.owner);
                const vet = getVet(a.vet);
                const end = toMinutes(a.start) + a.minutes;
                const inactive = a.status === "done" || a.status === "cancelled";
                const late = a.status === "booked" && toMinutes(a.start) + 10 < now;
                return (
                  <li
                    key={a.id}
                    className={`grid grid-cols-[4.75rem_minmax(0,1fr)] gap-x-3 gap-y-3 border-l-4 p-4 transition-colors sm:grid-cols-[5.5rem_minmax(0,1fr)_auto] ${
                      a.urgent && !inactive ? "border-l-amber-500 bg-amber-50" : "border-l-transparent"
                    } ${flashId === a.id ? "bg-teal-50 ring-2 ring-inset ring-teal-500" : ""}`}
                  >
                    <div className="tabular-nums">
                      <p className={`font-bold ${inactive ? "text-slate-600" : "text-slate-900"}`}>{time12(a.start)}</p>
                      <p className="text-xs text-slate-600">
                        to {time12(end)}
                        <br />
                        {a.minutes} min
                      </p>
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <Link
                          href={`/patients/${p.id}`}
                          className="text-lg font-bold text-slate-900 underline-offset-2 hover:text-teal-800 hover:underline"
                        >
                          {p.name}
                        </Link>
                        <span className="text-sm text-slate-600">
                          {p.species}, {p.breed}
                        </span>
                        {a.urgent && (
                          <span className="inline-flex items-center gap-1 rounded-md bg-amber-500 px-2 py-0.5 text-xs font-extrabold uppercase tracking-wide text-slate-950">
                            <Zap aria-hidden className="size-3.5" />
                            Urgent
                          </span>
                        )}
                      </div>
                      <AlertBadges alerts={p.alerts} className="mt-1.5" />
                      <p className={`mt-1.5 font-medium ${a.status === "cancelled" ? "text-slate-600 line-through" : "text-slate-800"}`}>
                        {a.reason}
                      </p>
                      <p className="mt-0.5 text-sm text-slate-600">
                        {owner.name} &middot; {vet.name} &middot; {vet.room}
                      </p>
                    </div>

                    <div className="col-start-2 flex flex-wrap items-center gap-2 sm:col-start-3 sm:flex-col sm:items-end">
                      <StatusPill status={a.status} />
                      {a.status === "checked_in" && a.checkedInAt && (
                        <span className="text-xs text-slate-600">since {time12(a.checkedInAt)}</span>
                      )}
                      {late && <span className="text-xs font-semibold text-amber-800">Running late</span>}
                      {a.status === "booked" && (
                        <button
                          type="button"
                          onClick={() => checkIn(a)}
                          aria-label={`Check in ${p.name}`}
                          className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-teal-700 px-4 text-sm font-semibold text-white hover:bg-teal-800"
                        >
                          <LogIn aria-hidden className="size-4" />
                          Check in
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <aside
          aria-labelledby="wait-h"
          className="order-first lg:order-none lg:col-start-2 lg:row-start-1"
        >
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:sticky lg:top-24">
            <div className="flex items-center justify-between gap-2">
              <h2 id="wait-h" className="flex items-center gap-2 text-xl font-bold text-slate-900">
                <Clock aria-hidden className="size-5 text-teal-700" />
                Waiting room
              </h2>
              <span className="rounded-full bg-teal-700 px-2.5 py-0.5 text-sm font-bold text-white">{waiting.length}</span>
            </div>
            <p className="mt-0.5 text-sm text-slate-600">Urgent first, then by arrival.</p>

            {waiting.length === 0 ? (
              <p className="mt-4 flex items-center gap-2 rounded-xl bg-slate-50 p-4 text-slate-700">
                <CircleCheck aria-hidden className="size-5 text-emerald-700" />
                Nobody is waiting.
              </p>
            ) : (
              <ol className="mt-3 space-y-3">
                {waiting.map((a) => {
                  const p = getPatient(a.patient);
                  const since = toMinutes(a.checkedInAt ?? a.start);
                  const mins = Math.max(0, now - since);
                  return (
                    <li key={a.id} className="rounded-xl border border-slate-200 p-3">
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          href={`/patients/${p.id}`}
                          className="text-lg font-bold text-slate-900 underline-offset-2 hover:text-teal-800 hover:underline"
                        >
                          {p.name}
                        </Link>
                        <span
                          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold tabular-nums ring-1 ring-inset ${waitTone(mins)}`}
                        >
                          {mins} min
                        </span>
                      </div>
                      <AlertBadges alerts={p.alerts} className="mt-1.5" />
                      <p className="mt-1.5 text-sm text-slate-800">{a.reason}</p>
                      <p className="text-sm text-slate-600">
                        {getVet(a.vet).name} &middot; in at {time12(since)}, booked {time12(a.start)}
                      </p>
                      {a.urgent && (
                        <p className="mt-1 text-xs font-bold uppercase text-amber-800">Urgent</p>
                      )}
                    </li>
                  );
                })}
              </ol>
            )}
          </div>
        </aside>
      </div>

      <BookingDialog
        open={bookOpen}
        onClose={() => setBookOpen(false)}
        appointments={appts}
        now={now}
        onBook={handleBook}
      />

      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-4 bottom-4 z-50 sm:left-auto sm:right-6 sm:w-96"
      >
        {notice && (
          <p
            key={notice.id}
            className="pointer-events-auto rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white shadow-xl"
          >
            {notice.text}
          </p>
        )}
      </div>
    </main>
  );
}
```

```tsx app/page.tsx
import AppHeader from "@/components/AppHeader";
import FrontDesk from "@/components/FrontDesk";

export default function Page() {
  return (
    <>
      <AppHeader />
      <FrontDesk />
    </>
  );
}
```

```tsx app/patients/[id]/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CircleCheck,
  Phone,
  Pill,
  Stethoscope,
  Syringe,
  TrendingDown,
  TriangleAlert,
} from "lucide-react";
import AppHeader from "@/components/AppHeader";
import { TODAY, getOwner, getVet, patients, records } from "@/lib/data";
import {
  ageText,
  daysBetween,
  formatDate,
  formatMoney,
  formatMonthYear,
  utcMs,
} from "@/lib/format";

export const dynamicParams = false;

export function generateStaticParams() {
  return patients.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const p = patients.find((x) => x.id === id);
  return { title: p ? `${p.name} · Pawpoint` : "Patient · Pawpoint" };
}

const card = "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm";

export default async function PatientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const patient = patients.find((p) => p.id === id);
  if (!patient) notFound();

  const owner = getOwner(patient.owner);
  const record = records[patient.id];

  const weights = record ? [...record.weights_kg].sort((a, b) => utcMs(a.date) - utcMs(b.date)) : [];
  const firstW = weights[0];
  const lastW = weights[weights.length - 1];
  const delta = firstW && lastW ? lastW.kg - firstW.kg : 0;
  const deltaPct = firstW && lastW ? (delta / firstW.kg) * 100 : 0;

  const vaccinations = record
    ? record.vaccinations
        .map((v) => ({ ...v, days: daysBetween(TODAY, v.due) }))
        .sort((a, b) => a.days - b.days)
    : [];
  const overdueCount = vaccinations.filter((v) => v.days < 0).length;

  return (
    <>
      <AppHeader />
      <main id="main" className="mx-auto w-full max-w-[1400px] px-4 py-5 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="inline-flex min-h-11 items-center gap-2 rounded-lg pr-3 text-sm font-semibold text-teal-800 hover:underline"
        >
          <ArrowLeft aria-hidden className="size-4" />
          Today&rsquo;s schedule
        </Link>

        <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">{patient.name}</h1>
            <p className="text-slate-600">
              {patient.breed} &middot; {patient.species} &middot; {patient.sex} &middot; {ageText(patient.born, TODAY)}
            </p>
          </div>
          <p className="rounded-md bg-slate-200 px-2.5 py-1 text-sm font-semibold tabular-nums text-slate-800">
            Patient {patient.id}
          </p>
        </div>

        {patient.alerts.length > 0 && (
          <section
            aria-label="Medical alerts"
            className="mt-4 rounded-2xl border-2 border-red-800 bg-red-700 p-4 text-white shadow-md sm:p-5"
          >
            <h2 className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-widest">
              <TriangleAlert aria-hidden className="size-5" />
              Medical alerts
            </h2>
            <ul className="mt-2 space-y-1.5">
              {patient.alerts.map((alert) => (
                <li key={alert} className="text-xl font-bold leading-snug sm:text-2xl">
                  {alert}
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          <div className="space-y-6 lg:col-start-2 lg:row-start-1">
            <section className={card} aria-labelledby="details-h">
              <h2 id="details-h" className="text-lg font-bold text-slate-900">
                Patient and owner
              </h2>
              <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                <Item label="Species" value={patient.species} />
                <Item label="Breed" value={patient.breed} />
                <Item label="Born" value={`${formatDate(patient.born)}`} />
                <Item label="Age" value={ageText(patient.born, TODAY)} />
                <Item label="Sex" value={patient.sex} />
                {lastW && <Item label="Latest weight" value={`${lastW.kg.toFixed(1)} kg`} />}
              </dl>
              <div className="mt-4 rounded-xl bg-slate-50 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">Owner</p>
                <p className="text-base font-bold text-slate-900">{owner.name}</p>
                <a
                  href={`tel:${owner.phone.replace(/\s/g, "")}`}
                  className="mt-1 inline-flex min-h-11 items-center gap-2 font-semibold text-teal-800 hover:underline"
                >
                  <Phone aria-hidden className="size-4" />
                  {owner.phone}
                </a>
              </div>
            </section>

            <section className={card} aria-labelledby="vax-h">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 id="vax-h" className="flex items-center gap-2 text-lg font-bold text-slate-900">
                  <Syringe aria-hidden className="size-5 text-teal-700" />
                  Vaccinations
                </h2>
                {record &&
                  (overdueCount > 0 ? (
                    <span className="rounded-full bg-red-700 px-2.5 py-1 text-xs font-bold text-white">
                      {overdueCount} overdue
                    </span>
                  ) : (
                    <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-900">
                      All current
                    </span>
                  ))}
              </div>
              {record ? (
                <>
                  <p className="mt-1 text-sm text-slate-600">Checked against today, {formatDate(TODAY)}.</p>
                  <ul className="mt-3 space-y-2">
                    {vaccinations.map((v) => {
                      const overdue = v.days < 0;
                      const soon = v.days >= 0 && v.days <= 30;
                      return (
                        <li
                          key={v.name}
                          className={`flex flex-wrap items-center justify-between gap-x-3 gap-y-1 rounded-xl border-l-4 p-3 ${
                            overdue
                              ? "border-l-red-700 bg-red-50"
                              : soon
                                ? "border-l-amber-500 bg-amber-50"
                                : "border-l-emerald-600 bg-slate-50"
                          }`}
                        >
                          <div>
                            <p className="font-bold text-slate-900">{v.name}</p>
                            <p className="text-sm text-slate-700">
                              Given {formatDate(v.given)} &middot; due {formatDate(v.due)}
                            </p>
                          </div>
                          {overdue ? (
                            <span className="inline-flex items-center gap-1 rounded-md bg-red-700 px-2 py-1 text-xs font-bold text-white">
                              <TriangleAlert aria-hidden className="size-3.5" />
                              Overdue {Math.abs(v.days)} days
                            </span>
                          ) : soon ? (
                            <span className="rounded-md bg-amber-200 px-2 py-1 text-xs font-bold text-amber-950">
                              Due in {v.days} days
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800">
                              <CircleCheck aria-hidden className="size-4" />
                              Current
                            </span>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </>
              ) : (
                <p className="mt-2 text-sm text-slate-600">No vaccinations on file.</p>
              )}
            </section>

            <section className={card} aria-labelledby="meds-h">
              <h2 id="meds-h" className="flex items-center gap-2 text-lg font-bold text-slate-900">
                <Pill aria-hidden className="size-5 text-teal-700" />
                Current medications
              </h2>
              {record && record.medications.length > 0 ? (
                <ul className="mt-3 divide-y divide-slate-200">
                  {record.medications.map((m) => (
                    <li key={m.name} className="py-2.5 first:pt-0 last:pb-0">
                      <p className="font-bold text-slate-900">{m.name}</p>
                      <p className="text-sm text-slate-700">
                        {m.dose} &middot; since {formatDate(m.since)}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm text-slate-600">No current medications on file.</p>
              )}
            </section>
          </div>

          <div className="space-y-6 lg:col-start-1 lg:row-start-1">
            <section className={card} aria-labelledby="weight-h">
              <h2 id="weight-h" className="text-lg font-bold text-slate-900">
                Weight trend
              </h2>
              {firstW && lastW && weights.length > 1 ? (
                <>
                  <div className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <p className="text-3xl font-bold tabular-nums text-slate-900">{lastW.kg.toFixed(1)} kg</p>
                    <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-900">
                      <TrendingDown aria-hidden className="size-4" />
                      {delta.toFixed(1)} kg ({deltaPct.toFixed(1)}%) since {formatDate(firstW.date)}
                    </p>
                  </div>
                  <WeightChart points={weights} />
                  <table className="mt-3 w-full text-sm">
                    <caption className="sr-only">Weights by visit date</caption>
                    <thead>
                      <tr className="text-left text-xs uppercase tracking-wide text-slate-600">
                        <th scope="col" className="py-1.5 font-semibold">
                          Date
                        </th>
                        <th scope="col" className="py-1.5 text-right font-semibold">
                          Weight
                        </th>
                        <th scope="col" className="py-1.5 text-right font-semibold">
                          Change
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 tabular-nums">
                      {weights.map((w, i) => {
                        const prev = i > 0 ? weights[i - 1] : undefined;
                        const d = prev ? w.kg - prev.kg : null;
                        return (
                          <tr key={w.date}>
                            <td className="py-1.5 text-slate-800">{formatDate(w.date)}</td>
                            <td className="py-1.5 text-right font-semibold text-slate-900">{w.kg.toFixed(1)} kg</td>
                            <td className="py-1.5 text-right text-slate-700">
                              {d === null ? "—" : `${d > 0 ? "+" : "−"}${Math.abs(d).toFixed(1)} kg`}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </>
              ) : (
                <p className="mt-2 text-sm text-slate-600">No weights recorded yet.</p>
              )}
            </section>

            <section className={card} aria-labelledby="visits-h">
              <h2 id="visits-h" className="flex items-center gap-2 text-lg font-bold text-slate-900">
                <Stethoscope aria-hidden className="size-5 text-teal-700" />
                Visit history
              </h2>
              {record && record.visits.length > 0 ? (
                <ol className="mt-4 space-y-5 border-l-2 border-slate-200 pl-5">
                  {record.visits.map((v) => {
                    const vet = getVet(v.vet);
                    return (
                      <li key={v.date} className="relative">
                        <span aria-hidden className="absolute -left-[1.6rem] top-1.5 size-3 rounded-full bg-teal-700 ring-4 ring-white" />
                        <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                          <p className="font-bold text-slate-900">
                            {formatDate(v.date)} &middot; {v.reason}
                          </p>
                          <p className="text-sm tabular-nums text-slate-600">{formatMoney(v.invoice_usd)}</p>
                        </div>
                        <p className="text-sm text-slate-600">
                          {vet.name}, {vet.room}
                        </p>
                        <p className="mt-1 text-slate-800">{v.notes}</p>
                      </li>
                    );
                  })}
                </ol>
              ) : (
                <p className="mt-2 text-sm text-slate-600">No visits on file yet.</p>
              )}
            </section>
          </div>
        </div>
      </main>
    </>
  );
}

function Item({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-600">{label}</dt>
      <dd className="mt-0.5 font-medium text-slate-900">{value}</dd>
    </div>
  );
}

function WeightChart({ points }: { points: { date: string; kg: number }[] }) {
  const W = 420;
  const H = 230;
  const padL = 36;
  const padR = 18;
  const padT = 30;
  const padB = 34;
  const kgs = points.map((p) => p.kg);
  const lo = Math.floor(Math.min(...kgs) - 0.4);
  const hi = Math.ceil(Math.max(...kgs) + 0.4);
  const t0 = utcMs(points[0].date);
  const t1 = utcMs(points[points.length - 1].date);
  const x = (date: string) => padL + ((utcMs(date) - t0) / (t1 - t0)) * (W - padL - padR);
  const y = (kg: number) => padT + (1 - (kg - lo) / (hi - lo)) * (H - padT - padB);
  const ticks: number[] = [];
  for (let t = lo; t <= hi; t += 1) ticks.push(t);
  const path = points.map((p, i) => `${i === 0 ? "M" : "L"}${x(p.date).toFixed(1)},${y(p.kg).toFixed(1)}`).join(" ");
  const first = points[0];
  const last = points[points.length - 1];

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label={`Weight in kilograms over ${points.length} visits, from ${first.kg} in ${formatMonthYear(first.date)} down to ${last.kg} in ${formatMonthYear(last.date)}`}
      className="mt-3 h-auto w-full"
    >
      {ticks.map((t) => (
        <g key={t}>
          <line x1={padL} x2={W - padR} y1={y(t)} y2={y(t)} className="stroke-slate-200" strokeWidth={1} />
          <text x={padL - 6} y={y(t) + 3.5} textAnchor="end" fontSize={10} className="fill-slate-600">
            {t}
          </text>
        </g>
      ))}
      <path d={path} fill="none" className="stroke-teal-700" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
      {points.map((p, i) => {
        const isLast = i === points.length - 1;
        return (
          <g key={p.date}>
            <circle cx={x(p.date)} cy={y(p.kg)} r={isLast ? 5.5 : 4} className={isLast ? "fill-amber-500 stroke-white" : "fill-teal-700 stroke-white"} strokeWidth={2} />
            <text
              x={x(p.date)}
              y={y(p.kg) - 10}
              textAnchor={i === 0 ? "start" : isLast ? "end" : "middle"}
              fontSize={11}
              fontWeight={isLast ? 700 : 600}
              className="fill-slate-800"
            >
              {p.kg.toFixed(1)}
            </text>
            <text
              x={x(p.date)}
              y={H - 12}
              textAnchor={i === 0 ? "start" : isLast ? "end" : "middle"}
              fontSize={10}
              className="fill-slate-600"
            >
              {formatMonthYear(p.date)}
            </text>
          </g>
        );
      })}
      <text x={padL} y={12} fontSize={10} className="fill-slate-600">
        kg
      </text>
    </svg>
  );
}
```

```tsx app/layout.tsx
import "./globals.css";

import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Pawpoint · Hillside Veterinary Clinic",
  description: "Front-desk and records software for Hillside Veterinary Clinic.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-dvh bg-slate-100 font-sans text-slate-900 antialiased">
        <a
          href="#main"
          className="sr-only z-50 rounded-lg bg-white px-4 py-2 font-semibold text-teal-800 focus:not-sr-only focus:fixed focus:left-3 focus:top-3"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
```

```css app/globals.css
@import "tailwindcss";

@theme {
  --font-sans: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}

:focus-visible {
  outline: 3px solid #0f766e;
  outline-offset: 2px;
}

input:focus-visible,
select:focus-visible {
  outline-offset: 0;
}

html {
  -webkit-text-size-adjust: 100%;
}

@media (prefers-reduced-motion: reduce) {
  * {
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
  }
}
```
