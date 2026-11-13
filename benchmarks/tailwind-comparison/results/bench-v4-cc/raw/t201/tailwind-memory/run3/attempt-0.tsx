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

export interface WeightPoint {
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
  weights_kg: WeightPoint[];
  vaccinations: Vaccination[];
  medications: Medication[];
  visits: Visit[];
}

export const CLINIC = "Pawpoint, front-desk and records software for Hillside Veterinary Clinic";
export const TODAY = "2026-11-12";
/** The desk clock when the app opens (it then advances a minute at a time). */
export const NOW_START = "09:52";

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
  { id: "a-05", patient: "p-107", vet: "v-2", start: "09:15", minutes: 20, reason: "Glucose curve", status: "checked_in", checkedInAt: "09:08" },
  { id: "a-06", patient: "p-105", vet: "v-1", start: "09:45", minutes: 20, reason: "Beak and nail trim", status: "checked_in", checkedInAt: "09:41" },
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

/* ---------- helpers ---------- */

export const STATUS_LABEL: Record<Status, string> = {
  booked: "Booked",
  checked_in: "Checked in",
  in_exam: "In exam",
  done: "Done",
  cancelled: "Cancelled",
};

export function getPatient(id: string): Patient | undefined {
  return patients.find((p) => p.id === id);
}
export function getOwner(id: string): Owner | undefined {
  return owners.find((o) => o.id === id);
}
export function getVet(id: string): Vet | undefined {
  return vets.find((v) => v.id === id);
}

export function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}
export function fromMinutes(total: number): string {
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
export function fmtTime(hhmm: string): string {
  const total = toMinutes(hhmm);
  const h = Math.floor(total / 60);
  const m = total % 60;
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
}
export function endTime(start: string, minutes: number): string {
  return fromMinutes(toMinutes(start) + minutes);
}

export function fmtDate(iso: string, opts?: Intl.DateTimeFormatOptions): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString(
    "en-US",
    opts ?? { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" },
  );
}

export function dayDiff(fromIso: string, toIso: string): number {
  const a = Date.parse(`${fromIso}T00:00:00Z`);
  const b = Date.parse(`${toIso}T00:00:00Z`);
  return Math.round((b - a) / 86_400_000);
}

export function ageLabel(born: string, today: string): string {
  const b = new Date(`${born}T00:00:00Z`);
  const t = new Date(`${today}T00:00:00Z`);
  let months = (t.getUTCFullYear() - b.getUTCFullYear()) * 12 + (t.getUTCMonth() - b.getUTCMonth());
  if (t.getUTCDate() < b.getUTCDate()) months -= 1;
  const years = Math.floor(months / 12);
  const rest = months % 12;
  if (years === 0) return `${rest} mo`;
  return rest === 0 ? `${years} yr` : `${years} yr ${rest} mo`;
}

/** The booking (not cancelled) for this vet that overlaps the proposed slot, if any. */
export function findClash(
  appts: Appointment[],
  vetId: string,
  start: string,
  minutes: number,
): Appointment | undefined {
  const s = toMinutes(start);
  const e = s + minutes;
  return appts.find((a) => {
    if (a.vet !== vetId || a.status === "cancelled") return false;
    const as = toMinutes(a.start);
    const ae = as + a.minutes;
    return s < ae && as < e;
  });
}
```

```tsx components/AlertList.tsx
import { TriangleAlert } from "lucide-react";

/** Compact solid-red chips: used wherever a patient appears in a list. */
export function AlertChips({ alerts }: { alerts: string[] }) {
  if (alerts.length === 0) return null;
  return (
    <ul aria-label="Medical alerts" className="flex flex-wrap gap-1.5">
      {alerts.map((alert) => (
        <li
          key={alert}
          className="inline-flex items-center gap-1 rounded-md bg-red-600 px-2 py-0.5 text-xs font-bold text-white"
        >
          <TriangleAlert aria-hidden="true" className="size-3.5 shrink-0" />
          <span className="sr-only">Alert: </span>
          {alert}
        </li>
      ))}
    </ul>
  );
}

/** Full-width banner for a patient's record or a booking form. */
export function AlertBanner({ alerts, name }: { alerts: string[]; name: string }) {
  if (alerts.length === 0) return null;
  return (
    <section
      aria-label={`Medical alerts for ${name}`}
      className="rounded-xl border-2 border-red-600 bg-red-50 p-4"
    >
      <h2 className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-wide text-red-700">
        <TriangleAlert aria-hidden="true" className="size-5" />
        Medical alerts
      </h2>
      <ul className="mt-2 grid gap-2 sm:grid-cols-2">
        {alerts.map((alert) => (
          <li
            key={alert}
            className="rounded-lg bg-red-600 px-3 py-2 text-base font-bold leading-snug text-white"
          >
            {alert}
          </li>
        ))}
      </ul>
    </section>
  );
}
```

```tsx components/StatusBadge.tsx
import { Ban, CalendarClock, CircleCheck, Stethoscope, UserCheck } from "lucide-react";
import { STATUS_LABEL, type Status } from "@/lib/data";

const STYLE: Record<Status, { cls: string; Icon: typeof Ban }> = {
  booked: { cls: "bg-slate-100 text-slate-700 ring-slate-300", Icon: CalendarClock },
  checked_in: { cls: "bg-amber-100 text-amber-900 ring-amber-300", Icon: UserCheck },
  in_exam: { cls: "bg-teal-100 text-teal-900 ring-teal-300", Icon: Stethoscope },
  done: { cls: "bg-emerald-50 text-emerald-800 ring-emerald-200", Icon: CircleCheck },
  cancelled: { cls: "bg-white text-slate-500 ring-slate-300", Icon: Ban },
};

export function StatusBadge({ status }: { status: Status }) {
  const { cls, Icon } = STYLE[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${cls}`}
    >
      <Icon aria-hidden="true" className="size-3.5" />
      {STATUS_LABEL[status]}
    </span>
  );
}
```

```tsx components/PatientSearch.tsx
"use client";

import { useId, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, TriangleAlert } from "lucide-react";
import { getOwner, patients } from "@/lib/data";

export function PatientSearch() {
  const router = useRouter();
  const listId = useId();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return patients
      .filter((p) => {
        const owner = getOwner(p.owner);
        return p.name.toLowerCase().includes(q) || (owner?.name.toLowerCase().includes(q) ?? false);
      })
      .slice(0, 6);
  }, [query]);

  const showList = open && query.trim().length > 0;

  function go(id: string) {
    setOpen(false);
    setQuery("");
    router.push(`/patients/${id}`);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActive((i) => Math.min(i + 1, Math.max(results.length - 1, 0)));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      const hit = results[active];
      if (hit) {
        e.preventDefault();
        go(hit.id);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div
      ref={wrapRef}
      className="relative w-full"
      onBlur={(e) => {
        if (!wrapRef.current?.contains(e.relatedTarget as Node | null)) setOpen(false);
      }}
    >
      <label htmlFor="patient-search" className="sr-only">
        Search patients or owners
      </label>
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-slate-400"
      />
      <input
        id="patient-search"
        type="search"
        role="combobox"
        aria-expanded={showList}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={showList && results[active] ? `${listId}-${results[active].id}` : undefined}
        autoComplete="off"
        placeholder="Find a patient or owner"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setActive(0);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        className="h-11 w-full rounded-xl border border-slate-300 bg-slate-50 pl-10 pr-3 text-base text-slate-900 placeholder:text-slate-500 focus:bg-white"
      />
      {showList && (
        <ul
          id={listId}
          role="listbox"
          aria-label="Matching patients"
          className="absolute left-0 right-0 top-full z-40 mt-2 max-h-96 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1 shadow-xl"
          onMouseDown={(e) => e.preventDefault()}
        >
          {results.length === 0 && (
            <li role="presentation" className="px-3 py-3 text-sm text-slate-600">
              No patient or owner matches &ldquo;{query.trim()}&rdquo;.
            </li>
          )}
          {results.map((p, i) => {
            const owner = getOwner(p.owner);
            return (
              <li
                key={p.id}
                id={`${listId}-${p.id}`}
                role="option"
                aria-selected={i === active}
                onClick={() => go(p.id)}
                onMouseEnter={() => setActive(i)}
                className={`flex min-h-12 cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2 ${
                  i === active ? "bg-teal-50" : ""
                }`}
              >
                <span className="min-w-0">
                  <span className="block truncate font-semibold text-slate-900">{p.name}</span>
                  <span className="block truncate text-sm text-slate-600">
                    {p.species}, {p.breed} &middot; {owner?.name}
                  </span>
                </span>
                {p.alerts.length > 0 && (
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-red-600 px-2 py-0.5 text-xs font-bold text-white">
                    <TriangleAlert aria-hidden="true" className="size-3.5" />
                    {p.alerts.length} {p.alerts.length === 1 ? "alert" : "alerts"}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
```

```tsx components/BookingDialog.tsx
"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { CalendarPlus, X } from "lucide-react";
import { AlertBanner } from "@/components/AlertList";
import {
  endTime,
  findClash,
  fmtTime,
  fromMinutes,
  getOwner,
  getPatient,
  getVet,
  patients,
  toMinutes,
  vets,
  type Appointment,
} from "@/lib/data";

const FIRST_SLOT = 8 * 60;
const LAST_END = 17 * 60 + 30;
const DURATIONS = [15, 20, 30, 45, 60];

const SLOTS: string[] = [];
for (let m = FIRST_SLOT; m < LAST_END; m += 15) SLOTS.push(fromMinutes(m));

const control =
  "h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-base text-slate-900 disabled:bg-slate-100";

function slotState(appts: Appointment[], vetId: string, start: string, minutes: number, nowMin: number) {
  if (toMinutes(start) + minutes > LAST_END) return "late" as const;
  if (toMinutes(start) < nowMin) return "past" as const;
  if (findClash(appts, vetId, start, minutes)) return "taken" as const;
  return "free" as const;
}

function firstFree(appts: Appointment[], vetId: string, minutes: number, nowMin: number): string {
  return SLOTS.find((s) => slotState(appts, vetId, s, minutes, nowMin) === "free") ?? SLOTS[0];
}

interface Props {
  appts: Appointment[];
  nowMin: number;
  initialPatientId?: string;
  initialReason?: string;
  onBook: (appt: Appointment) => void;
  onClose: () => void;
}

export function BookingDialog({ appts, nowMin, initialPatientId, initialReason, onBook, onClose }: Props) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const firstRef = useRef<HTMLSelectElement>(null);
  const [patientId, setPatientId] = useState(initialPatientId ?? "");
  const [vetId, setVetId] = useState("v-1");
  const [minutes, setMinutes] = useState(20);
  const [start, setStart] = useState(() => firstFree(appts, "v-1", 20, nowMin));
  const [reason, setReason] = useState(initialReason ?? "");
  const [tried, setTried] = useState(false);

  // Focus management: move focus in, restore it on close, close on Escape, keep Tab inside.
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    firstRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
      opener?.focus?.();
    };
  }, []);

  function onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === "Escape") {
      e.stopPropagation();
      onClose();
      return;
    }
    if (e.key !== "Tab" || !panelRef.current) return;
    const focusable = panelRef.current.querySelectorAll<HTMLElement>(
      "button:not([disabled]), select:not([disabled]), input:not([disabled]), a[href]",
    );
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  const patient = getPatient(patientId);
  const clash = useMemo(() => findClash(appts, vetId, start, minutes), [appts, vetId, start, minutes]);
  const clashPatient = clash ? getPatient(clash.patient) : undefined;
  const state = slotState(appts, vetId, start, minutes, nowMin);

  const errors: string[] = [];
  if (!patient) errors.push("Choose a patient.");
  if (!reason.trim()) errors.push("Add a reason for the visit.");
  if (clash)
    errors.push(
      `${getVet(vetId)?.name} already has ${clashPatient?.name ?? "a patient"} from ${fmtTime(clash.start)} to ${fmtTime(
        endTime(clash.start, clash.minutes),
      )}. Pick another time or another vet.`,
    );
  else if (state === "late") errors.push("That visit would run past closing time (5:30 PM).");
  else if (state === "past") errors.push("That time has already passed today.");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setTried(true);
    if (errors.length > 0 || !patient) return;
    const next = String(appts.length + 1).padStart(2, "0");
    onBook({
      id: `a-${next}`,
      patient: patient.id,
      vet: vetId,
      start,
      minutes,
      reason: reason.trim(),
      status: "booked",
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 sm:items-center sm:p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onKeyDown={onKeyDown}
        className="max-h-[94dvh] w-full overflow-y-auto rounded-t-2xl bg-white shadow-2xl sm:max-w-xl sm:rounded-2xl"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
          <h2 id={titleId} className="flex items-center gap-2 text-lg font-bold text-slate-900">
            <CalendarPlus aria-hidden="true" className="size-5 text-teal-700" />
            Book an appointment
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close booking form"
            className="inline-flex size-11 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100"
          >
            <X aria-hidden="true" className="size-5" />
          </button>
        </div>

        <form onSubmit={submit} noValidate className="space-y-4 px-5 py-5">
          <div>
            <label htmlFor="bk-patient" className="mb-1 block text-sm font-semibold text-slate-800">
              Patient
            </label>
            <select
              id="bk-patient"
              ref={firstRef}
              className={control}
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              aria-invalid={tried && !patient}
            >
              <option value="">Select a patient</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.species}), {getOwner(p.owner)?.name}
                  {p.alerts.length > 0 ? " - ALERT" : ""}
                </option>
              ))}
            </select>
          </div>

          {patient && <AlertBanner alerts={patient.alerts} name={patient.name} />}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="bk-vet" className="mb-1 block text-sm font-semibold text-slate-800">
                Vet
              </label>
              <select
                id="bk-vet"
                className={control}
                value={vetId}
                onChange={(e) => setVetId(e.target.value)}
              >
                {vets.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.room})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="bk-length" className="mb-1 block text-sm font-semibold text-slate-800">
                Length
              </label>
              <select
                id="bk-length"
                className={control}
                value={minutes}
                onChange={(e) => setMinutes(Number(e.target.value))}
              >
                {DURATIONS.map((d) => (
                  <option key={d} value={d}>
                    {d} minutes
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="bk-time" className="mb-1 block text-sm font-semibold text-slate-800">
              Start time
            </label>
            <select
              id="bk-time"
              className={control}
              value={start}
              onChange={(e) => setStart(e.target.value)}
              aria-invalid={Boolean(clash)}
            >
              {SLOTS.map((s) => {
                const st = slotState(appts, vetId, s, minutes, nowMin);
                const note = st === "taken" ? " (taken)" : st === "past" ? " (passed)" : st === "late" ? " (too late)" : "";
                return (
                  <option key={s} value={s} disabled={st !== "free" && s !== start}>
                    {fmtTime(s)}
                    {note}
                  </option>
                );
              })}
            </select>
            <p className="mt-1 text-sm text-slate-600">
              Ends at {fmtTime(endTime(start, minutes))}. Times taken for this vet are marked.
            </p>
          </div>

          <div>
            <label htmlFor="bk-reason" className="mb-1 block text-sm font-semibold text-slate-800">
              Reason for visit
            </label>
            <input
              id="bk-reason"
              type="text"
              className={control}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Follow-up, recheck, vaccination"
              aria-invalid={tried && !reason.trim()}
            />
          </div>

          {(tried || clash) && errors.length > 0 && (
            <div role="alert" className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm font-medium text-red-900">
              <ul className="list-disc space-y-1 pl-5">
                {errors.map((er) => (
                  <li key={er}>{er}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="h-11 rounded-lg border border-slate-300 bg-white px-5 font-semibold text-slate-800 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={Boolean(clash)}
              className="h-11 rounded-lg bg-teal-700 px-5 font-semibold text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600"
            >
              Book appointment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
```

```tsx components/Schedule.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CalendarPlus, Hourglass, Phone, Siren } from "lucide-react";
import { AlertChips } from "@/components/AlertList";
import { BookingDialog } from "@/components/BookingDialog";
import { StatusBadge } from "@/components/StatusBadge";
import {
  NOW_START,
  TODAY,
  endTime,
  fmtDate,
  fmtTime,
  fromMinutes,
  getOwner,
  getPatient,
  getVet,
  initialAppointments,
  toMinutes,
  vets,
  type Appointment,
  type Status,
} from "@/lib/data";

interface BookingState {
  patientId?: string;
  reason?: string;
}

const btnPrimary =
  "inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-teal-700 px-4 text-sm font-semibold text-white hover:bg-teal-800";
const btnSecondary =
  "inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-800 hover:bg-slate-50";

export function Schedule() {
  const [appts, setAppts] = useState<Appointment[]>(initialAppointments);
  const [nowMin, setNowMin] = useState(() => toMinutes(NOW_START));
  const [vetFilter, setVetFilter] = useState("all");
  const [booking, setBooking] = useState<BookingState | null>(null);
  const [notice, setNotice] = useState("");

  // The desk clock: starts at the demo time and moves a minute at a time.
  useEffect(() => {
    const id = window.setInterval(() => setNowMin((m) => m + 1), 60_000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (!notice) return;
    const id = window.setTimeout(() => setNotice(""), 6000);
    return () => window.clearTimeout(id);
  }, [notice]);

  const visible = useMemo(
    () =>
      appts
        .filter((a) => vetFilter === "all" || a.vet === vetFilter)
        .sort((a, b) => toMinutes(a.start) - toMinutes(b.start) || a.vet.localeCompare(b.vet)),
    [appts, vetFilter],
  );

  const waiting = useMemo(
    () =>
      appts
        .filter((a) => a.status === "checked_in")
        .sort((a, b) => toMinutes(a.checkedInAt ?? a.start) - toMinutes(b.checkedInAt ?? b.start)),
    [appts],
  );

  const counts = {
    booked: appts.filter((a) => a.status === "booked").length,
    waiting: waiting.length,
    inExam: appts.filter((a) => a.status === "in_exam").length,
    done: appts.filter((a) => a.status === "done").length,
  };

  function setStatus(id: string, status: Status, message: string) {
    setAppts((list) =>
      list.map((a) =>
        a.id === id
          ? { ...a, status, checkedInAt: status === "checked_in" ? fromMinutes(nowMin) : a.checkedInAt }
          : a,
      ),
    );
    setNotice(message);
  }

  function nextAction(a: Appointment) {
    const p = getPatient(a.patient);
    const name = p?.name ?? "Patient";
    switch (a.status) {
      case "booked":
        return (
          <button
            type="button"
            className={btnPrimary}
            aria-label={`Check in ${name}`}
            onClick={() => setStatus(a.id, "checked_in", `${name} is checked in and added to the waiting list.`)}
          >
            Check in
          </button>
        );
      case "checked_in":
        return (
          <button
            type="button"
            className={btnSecondary}
            aria-label={`Send ${name} to exam`}
            onClick={() => setStatus(a.id, "in_exam", `${name} has gone in to see ${getVet(a.vet)?.name}.`)}
          >
            Send to exam
          </button>
        );
      case "in_exam":
        return (
          <button
            type="button"
            className={btnSecondary}
            aria-label={`Mark ${name} done`}
            onClick={() => setStatus(a.id, "done", `${name}'s visit is marked done.`)}
          >
            Mark done
          </button>
        );
      case "done":
        return (
          <button
            type="button"
            className={btnSecondary}
            aria-label={`Book a follow-up for ${name}`}
            onClick={() => setBooking({ patientId: a.patient, reason: `Follow-up: ${a.reason}` })}
          >
            Book follow-up
          </button>
        );
      default:
        return null;
    }
  }

  const dateLabel = fmtDate(TODAY, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-600">{dateLabel}</p>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Today&rsquo;s schedule</h1>
          <p className="mt-1 text-sm text-slate-600">
            Desk time <span className="font-semibold text-slate-900">{fmtTime(fromMinutes(nowMin))}</span> &middot;{" "}
            {vets.length} vets on
          </p>
        </div>
        <button type="button" className={`${btnPrimary} sm:h-12 sm:px-5 sm:text-base`} onClick={() => setBooking({})}>
          <CalendarPlus aria-hidden="true" className="size-5" />
          Book appointment
        </button>
      </div>

      <dl className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Still to arrive", value: counts.booked },
          { label: "Waiting now", value: counts.waiting },
          { label: "In exam", value: counts.inExam },
          { label: "Done today", value: counts.done },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-slate-200 bg-white px-4 py-3">
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-600">{s.label}</dt>
            <dd className="text-2xl font-bold text-slate-900">{s.value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_21rem]">
        <aside aria-labelledby="waiting-title" className="order-first xl:order-last">
          <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 xl:sticky xl:top-24">
            <h2 id="waiting-title" className="flex items-center gap-2 text-lg font-bold text-amber-950">
              <Hourglass aria-hidden="true" className="size-5" />
              Waiting room
              <span className="ml-auto rounded-full bg-amber-900 px-2.5 py-0.5 text-sm font-bold text-white">
                {waiting.length}
              </span>
            </h2>
            {waiting.length === 0 ? (
              <p className="mt-3 text-sm text-amber-950">Nobody is waiting. Check patients in as they arrive.</p>
            ) : (
              <ol className="mt-3 space-y-2">
                {waiting.map((a, i) => {
                  const p = getPatient(a.patient);
                  const v = getVet(a.vet);
                  const waited = Math.max(0, nowMin - toMinutes(a.checkedInAt ?? a.start));
                  return (
                    <li key={a.id} className="rounded-xl bg-white p-3 shadow-sm ring-1 ring-amber-200">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="flex flex-wrap items-center gap-2">
                            <Link
                              href={`/patients/${a.patient}`}
                              className="truncate font-bold text-slate-900 underline-offset-2 hover:underline"
                            >
                              {p?.name}
                            </Link>
                            {i === 0 && (
                              <span className="rounded bg-teal-700 px-1.5 py-0.5 text-xs font-bold uppercase text-white">
                                Next
                              </span>
                            )}
                          </p>
                          <p className="text-sm text-slate-600">
                            For {v?.name}, {v?.room}
                          </p>
                        </div>
                        <p className="shrink-0 text-right">
                          <span
                            className={`block text-lg font-bold leading-none ${waited >= 30 ? "text-red-700" : "text-slate-900"}`}
                          >
                            {waited} min
                          </span>
                          <span className="text-xs text-slate-600">since {fmtTime(a.checkedInAt ?? a.start)}</span>
                        </p>
                      </div>
                      {p && p.alerts.length > 0 && (
                        <div className="mt-2">
                          <AlertChips alerts={p.alerts} />
                        </div>
                      )}
                    </li>
                  );
                })}
              </ol>
            )}
          </div>
        </aside>

        <section aria-labelledby="appts-title" className="min-w-0">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 id="appts-title" className="text-lg font-bold text-slate-900">
              Appointments
              <span className="ml-2 text-sm font-medium text-slate-600">{visible.length} shown</span>
            </h2>
            <div role="group" aria-label="Filter by vet" className="flex flex-wrap gap-2">
              {[{ id: "all", name: "All vets" }, ...vets].map((v) => (
                <button
                  key={v.id}
                  type="button"
                  aria-pressed={vetFilter === v.id}
                  onClick={() => setVetFilter(v.id)}
                  className={`h-11 rounded-full px-4 text-sm font-semibold ring-1 ring-inset ${
                    vetFilter === v.id
                      ? "bg-slate-900 text-white ring-slate-900"
                      : "bg-white text-slate-800 ring-slate-300 hover:bg-slate-50"
                  }`}
                >
                  {v.name}
                </button>
              ))}
            </div>
          </div>

          <ul className="mt-3 space-y-3">
            {visible.map((a) => {
              const p = getPatient(a.patient);
              const o = p ? getOwner(p.owner) : undefined;
              const v = getVet(a.vet);
              const cancelled = a.status === "cancelled";
              const tone = a.urgent && !cancelled
                ? "border-orange-300 border-l-8 border-l-orange-500 bg-orange-50"
                : a.status === "in_exam"
                  ? "border-teal-200 bg-teal-50/60"
                  : "border-slate-200 bg-white";
              return (
                <li
                  key={a.id}
                  className={`rounded-xl border p-4 ${tone} ${cancelled || a.status === "done" ? "opacity-80" : ""}`}
                >
                  <div className="grid gap-3 md:grid-cols-[6.5rem_minmax(0,1fr)_11rem_10.5rem] md:items-center">
                    <div>
                      <p className="text-lg font-bold tabular-nums text-slate-900">{fmtTime(a.start)}</p>
                      <p className="text-xs text-slate-600">
                        {a.minutes} min, to {fmtTime(endTime(a.start, a.minutes))}
                      </p>
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={`/patients/${a.patient}`}
                          className={`text-lg font-bold text-slate-900 underline-offset-2 hover:underline ${
                            cancelled ? "line-through" : ""
                          }`}
                        >
                          {p?.name}
                        </Link>
                        <span className="text-sm text-slate-600">
                          {p?.species}, {p?.breed}
                        </span>
                        {a.urgent && !cancelled && (
                          <span className="inline-flex items-center gap-1 rounded-md bg-orange-600 px-2 py-0.5 text-xs font-extrabold uppercase tracking-wide text-white">
                            <Siren aria-hidden="true" className="size-3.5" />
                            Urgent
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-base text-slate-900">{a.reason}</p>
                      <p className="mt-0.5 flex flex-wrap items-center gap-x-3 text-sm text-slate-600">
                        <span>{o?.name}</span>
                        {o && (
                          <a
                            href={`tel:${o.phone.replace(/\s/g, "")}`}
                            className="inline-flex items-center gap-1 underline-offset-2 hover:underline"
                          >
                            <Phone aria-hidden="true" className="size-3.5" />
                            {o.phone}
                          </a>
                        )}
                      </p>
                      {p && p.alerts.length > 0 && !cancelled && (
                        <div className="mt-2">
                          <AlertChips alerts={p.alerts} />
                        </div>
                      )}
                    </div>

                    <div className="text-sm">
                      <p className="font-semibold text-slate-900">{v?.name}</p>
                      <p className="text-slate-600">{v?.room}</p>
                    </div>

                    <div className="flex items-center justify-between gap-2 md:flex-col md:items-stretch">
                      <StatusBadge status={a.status} />
                      {nextAction(a)}
                    </div>
                  </div>
                </li>
              );
            })}
            {visible.length === 0 && (
              <li className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-slate-600">
                No appointments for this vet today.
              </li>
            )}
          </ul>
        </section>
      </div>

      <div
        role="status"
        aria-live="polite"
        className={
          notice
            ? "fixed inset-x-4 bottom-4 z-40 mx-auto max-w-md rounded-xl bg-slate-900 px-4 py-3 text-center text-sm font-medium text-white shadow-xl"
            : "sr-only"
        }
      >
        {notice}
      </div>

      {booking && (
        <BookingDialog
          appts={appts}
          nowMin={nowMin}
          initialPatientId={booking.patientId}
          initialReason={booking.reason}
          onClose={() => setBooking(null)}
          onBook={(appt) => {
            setAppts((list) => [...list, appt]);
            setBooking(null);
            const p = getPatient(appt.patient);
            setNotice(
              `Booked ${p?.name} with ${getVet(appt.vet)?.name} at ${fmtTime(appt.start)}. It is on the schedule.`,
            );
          }}
        />
      )}
    </div>
  );
}
```

```tsx components/WeightChart.tsx
import { fmtDate, type WeightPoint } from "@/lib/data";

const W = 420;
const H = 230;
const L = 40;
const R = 18;
const T = 28;
const B = 38;

export function WeightChart({ points }: { points: WeightPoint[] }) {
  const times = points.map((p) => Date.parse(`${p.date}T00:00:00Z`));
  const t0 = times[0];
  const t1 = times[times.length - 1];
  const kgs = points.map((p) => p.kg);
  const lo = Math.floor(Math.min(...kgs) - 0.5);
  const hi = Math.ceil(Math.max(...kgs) + 0.5);
  const x = (t: number) => L + ((t - t0) / (t1 - t0)) * (W - L - R);
  const y = (v: number) => T + ((hi - v) / (hi - lo)) * (H - T - B);

  const coords = points.map((p, i) => ({ ...p, cx: x(times[i]), cy: y(p.kg) }));
  const line = coords.map((c, i) => `${i === 0 ? "M" : "L"}${c.cx.toFixed(1)} ${c.cy.toFixed(1)}`).join(" ");
  const area = `${line} L${coords[coords.length - 1].cx.toFixed(1)} ${H - B} L${coords[0].cx.toFixed(1)} ${H - B} Z`;
  const ticks: number[] = [];
  for (let v = lo; v <= hi; v += 1) ticks.push(v);
  const last = coords[coords.length - 1];

  return (
    <figure>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`Weight trend: ${points
          .map((p) => `${p.kg} kilograms on ${fmtDate(p.date)}`)
          .join("; ")}.`}
        className="h-auto w-full"
      >
        {ticks.map((v) => (
          <g key={v}>
            <line x1={L} x2={W - R} y1={y(v)} y2={y(v)} className="stroke-slate-200" strokeWidth={1} />
            <text x={L - 6} y={y(v) + 4} textAnchor="end" className="fill-slate-600" fontSize={11}>
              {v}
            </text>
          </g>
        ))}
        <path d={area} className="fill-teal-600/10" />
        <path d={line} fill="none" className="stroke-teal-700" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
        {coords.map((c, i) => (
          <g key={c.date}>
            <circle
              cx={c.cx}
              cy={c.cy}
              r={i === coords.length - 1 ? 5.5 : 4}
              className={i === coords.length - 1 ? "fill-teal-800 stroke-white" : "fill-white stroke-teal-700"}
              strokeWidth={2}
            />
            <text x={c.cx} y={c.cy - 10} textAnchor="middle" className="fill-slate-900" fontSize={11} fontWeight={600}>
              {c.kg}
            </text>
            <text x={c.cx} y={H - B + 16} textAnchor="middle" className="fill-slate-600" fontSize={11}>
              {fmtDate(c.date, { month: "short", year: "2-digit", timeZone: "UTC" })}
            </text>
          </g>
        ))}
        <text x={L} y={12} className="fill-slate-600" fontSize={11}>
          kg
        </text>
        <title>{`Latest weight ${last.kg} kg`}</title>
      </svg>
    </figure>
  );
}
```

```tsx components/Header.tsx
import Link from "next/link";
import { PawPrint } from "lucide-react";
import { PatientSearch } from "@/components/PatientSearch";
import { user } from "@/lib/data";

export function Header() {
  const initials = user.name
    .split(" ")
    .map((w) => w[0])
    .join("");
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-4 gap-y-3 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5" aria-label="Pawpoint, today's schedule">
          <span className="flex size-10 items-center justify-center rounded-xl bg-teal-700 text-white">
            <PawPrint aria-hidden="true" className="size-6" />
          </span>
          <span className="leading-tight">
            <span className="block text-lg font-extrabold tracking-tight text-slate-900">Pawpoint</span>
            <span className="block text-xs text-slate-600">Hillside Veterinary Clinic</span>
          </span>
        </Link>

        <div className="order-3 w-full sm:order-2 sm:w-auto sm:min-w-0 sm:flex-1 sm:max-w-md sm:mx-auto">
          <PatientSearch />
        </div>

        <div className="order-2 ml-auto flex items-center gap-3 sm:order-3 sm:ml-0">
          <div className="hidden text-right leading-tight md:block">
            <p className="text-sm font-semibold text-slate-900">{user.name}</p>
            <p className="text-xs text-slate-600">{user.role}</p>
          </div>
          <span
            role="img"
            aria-label={`${user.name}, ${user.role}`}
            className="flex size-10 items-center justify-center rounded-full bg-slate-800 text-sm font-bold text-white"
          >
            {initials}
          </span>
        </div>
      </div>
    </header>
  );
}
```

```tsx app/layout.tsx
import "./globals.css";

import type { Metadata, Viewport } from "next";
import { Header } from "@/components/Header";

export const metadata: Metadata = {
  title: "Pawpoint | Hillside Veterinary Clinic",
  description: "Front-desk and records software for Hillside Veterinary Clinic.",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-dvh bg-slate-100 font-sans text-slate-900 antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:font-semibold focus:shadow-lg"
        >
          Skip to content
        </a>
        <Header />
        <main id="main">{children}</main>
      </body>
    </html>
  );
}
```

```css app/globals.css
@import "tailwindcss";

@layer base {
  :focus-visible {
    outline: 3px solid #0f766e;
    outline-offset: 2px;
  }
  html {
    -webkit-text-size-adjust: 100%;
  }
  button:not(:disabled),
  [role="option"],
  select {
    cursor: pointer;
  }
}

@media (prefers-reduced-motion: reduce) {
  * {
    scroll-behavior: auto !important;
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
  }
}
```

```tsx app/page.tsx
import { Schedule } from "@/components/Schedule";

export default function Page() {
  return <Schedule />;
}
```

```tsx app/patients/[id]/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CalendarClock,
  ClipboardList,
  CircleCheck,
  Phone,
  Pill,
  Scale,
  Syringe,
  TriangleAlert,
} from "lucide-react";
import { AlertBanner } from "@/components/AlertList";
import { StatusBadge } from "@/components/StatusBadge";
import { WeightChart } from "@/components/WeightChart";
import {
  TODAY,
  ageLabel,
  dayDiff,
  endTime,
  fmtDate,
  fmtTime,
  getOwner,
  getPatient,
  getVet,
  initialAppointments,
  patients,
  records,
  toMinutes,
} from "@/lib/data";

export function generateStaticParams() {
  return patients.map((p) => ({ id: p.id }));
}

const card = "rounded-2xl border border-slate-200 bg-white p-5";

function SectionTitle({ icon, children, id }: { icon: React.ReactNode; children: React.ReactNode; id: string }) {
  return (
    <h2 id={id} className="mb-3 flex items-center gap-2 text-lg font-bold text-slate-900">
      <span aria-hidden="true" className="text-teal-700">
        {icon}
      </span>
      {children}
    </h2>
  );
}

export default async function PatientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const patient = getPatient(id);
  if (!patient) notFound();

  const owner = getOwner(patient.owner);
  const record = records[patient.id];
  const todays = initialAppointments
    .filter((a) => a.patient === patient.id)
    .sort((a, b) => toMinutes(a.start) - toMinutes(b.start));

  const vaccines = record
    ? [...record.vaccinations]
        .map((v) => {
          const days = dayDiff(TODAY, v.due);
          const state = days < 0 ? "overdue" : days <= 60 ? "soon" : "current";
          return { ...v, days, state };
        })
        .sort((a, b) => a.due.localeCompare(b.due))
    : [];
  const overdue = vaccines.filter((v) => v.state === "overdue");

  const weights = record?.weights_kg ?? [];
  const firstW = weights[0];
  const lastW = weights[weights.length - 1];
  const delta = firstW && lastW ? lastW.kg - firstW.kg : 0;
  const pct = firstW && lastW ? (delta / firstW.kg) * 100 : 0;

  const details: [string, string][] = [
    ["Species", patient.species],
    ["Breed", patient.breed],
    ["Born", `${fmtDate(patient.born)} (${ageLabel(patient.born, TODAY)})`],
    ["Sex", patient.sex],
    ["Patient ID", patient.id],
  ];

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:py-8">
      <Link
        href="/"
        className="inline-flex min-h-11 items-center gap-2 rounded-lg text-sm font-semibold text-teal-800 hover:underline"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        Today&rsquo;s schedule
      </Link>

      <section aria-labelledby="patient-name" className={`${card} mt-1`}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-slate-600">
              {patient.species} &middot; {patient.breed}
            </p>
            <h1 id="patient-name" className="text-3xl font-extrabold tracking-tight text-slate-900">
              {patient.name}
            </h1>
          </div>
          {overdue.length > 0 && (
            <p className="inline-flex items-center gap-2 rounded-lg bg-orange-100 px-3 py-2 text-sm font-bold text-orange-900 ring-1 ring-orange-300">
              <Syringe aria-hidden="true" className="size-4" />
              {overdue.length} vaccination{overdue.length > 1 ? "s" : ""} overdue
            </p>
          )}
        </div>

        {patient.alerts.length > 0 && (
          <div className="mt-4">
            <AlertBanner alerts={patient.alerts} name={patient.name} />
          </div>
        )}

        <div className="mt-5 grid gap-6 md:grid-cols-2">
          <dl className="grid grid-cols-[7rem_1fr] gap-x-3 gap-y-2 text-sm">
            {details.map(([k, v]) => (
              <div key={k} className="contents">
                <dt className="text-slate-600">{k}</dt>
                <dd className="font-semibold text-slate-900">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="rounded-xl bg-slate-50 p-4">
            <h2 className="text-xs font-bold uppercase tracking-wide text-slate-600">Owner</h2>
            <p className="mt-1 text-lg font-bold text-slate-900">{owner?.name}</p>
            {owner && (
              <a
                href={`tel:${owner.phone.replace(/\s/g, "")}`}
                className="mt-2 inline-flex h-11 items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 font-semibold text-slate-900 hover:bg-slate-50"
              >
                <Phone aria-hidden="true" className="size-4" />
                {owner.phone}
              </a>
            )}
          </div>
        </div>
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <div className="space-y-6">
          <section aria-labelledby="weight-title" className={card}>
            <SectionTitle id="weight-title" icon={<Scale className="size-5" />}>
              Weight trend
            </SectionTitle>
            {weights.length > 1 && firstW && lastW ? (
              <>
                <p className="mb-2 text-sm text-slate-700">
                  <span className="text-2xl font-extrabold text-slate-900">{lastW.kg} kg</span>{" "}
                  now, <span className="font-bold text-red-700">{delta.toFixed(1)} kg ({pct.toFixed(0)}%)</span> since{" "}
                  {fmtDate(firstW.date, { month: "short", year: "numeric", timeZone: "UTC" })} over {weights.length}{" "}
                  visits.
                </p>
                <WeightChart points={weights} />
              </>
            ) : (
              <p className="text-sm text-slate-600">No weights recorded for {patient.name} yet.</p>
            )}
          </section>

          <section aria-labelledby="visits-title" className={card}>
            <SectionTitle id="visits-title" icon={<ClipboardList className="size-5" />}>
              Visit history
            </SectionTitle>
            {record && record.visits.length > 0 ? (
              <ol className="space-y-4">
                {record.visits.map((v) => (
                  <li key={v.date} className="rounded-xl border border-slate-200 p-4">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                      <p className="font-bold text-slate-900">
                        {fmtDate(v.date)}
                        {v.date === TODAY && (
                          <span className="ml-2 rounded bg-teal-700 px-1.5 py-0.5 text-xs font-bold uppercase text-white">
                            Today
                          </span>
                        )}
                      </p>
                      <p className="text-sm tabular-nums text-slate-600">Invoice ${v.invoice_usd.toFixed(2)}</p>
                    </div>
                    <p className="mt-0.5 text-base font-semibold text-slate-900">{v.reason}</p>
                    <p className="text-sm text-slate-600">{getVet(v.vet)?.name}</p>
                    <p className="mt-2 text-base leading-relaxed text-slate-800">{v.notes}</p>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-sm text-slate-600">
                No past visits are on file for {patient.name} in this demo. Only Olive&rsquo;s full record is loaded.
              </p>
            )}
          </section>
        </div>

        <div className="space-y-6">
          <section aria-labelledby="today-title" className={card}>
            <SectionTitle id="today-title" icon={<CalendarClock className="size-5" />}>
              Today at the clinic
            </SectionTitle>
            {todays.length === 0 ? (
              <p className="text-sm text-slate-600">No appointments today.</p>
            ) : (
              <ul className="space-y-2">
                {todays.map((a) => (
                  <li key={a.id} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 p-3">
                    <div>
                      <p className="font-semibold text-slate-900">
                        {fmtTime(a.start)} to {fmtTime(endTime(a.start, a.minutes))}
                      </p>
                      <p className="text-sm text-slate-600">
                        {a.reason} with {getVet(a.vet)?.name}
                      </p>
                    </div>
                    <StatusBadge status={a.status} />
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section aria-labelledby="vax-title" className={card}>
            <SectionTitle id="vax-title" icon={<Syringe className="size-5" />}>
              Vaccinations
            </SectionTitle>
            {vaccines.length > 0 ? (
              <ul className="space-y-2">
                {vaccines.map((v) => (
                  <li
                    key={v.name}
                    className={`rounded-xl p-3 ${
                      v.state === "overdue"
                        ? "border-2 border-red-600 bg-red-50"
                        : v.state === "soon"
                          ? "border border-amber-300 bg-amber-50"
                          : "border border-slate-200"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-bold text-slate-900">{v.name}</p>
                      {v.state === "overdue" ? (
                        <span className="inline-flex items-center gap-1 rounded-md bg-red-600 px-2 py-0.5 text-xs font-bold text-white">
                          <TriangleAlert aria-hidden="true" className="size-3.5" />
                          Overdue {Math.abs(v.days)} days
                        </span>
                      ) : v.state === "soon" ? (
                        <span className="rounded-md bg-amber-200 px-2 py-0.5 text-xs font-bold text-amber-950">
                          Due in {v.days} days
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800">
                          <CircleCheck aria-hidden="true" className="size-3.5" />
                          Up to date
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-slate-700">
                      Given {fmtDate(v.given)}. Due{" "}
                      <span className={v.state === "overdue" ? "font-bold text-red-800" : "font-semibold"}>
                        {fmtDate(v.due)}
                      </span>
                      .
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-600">No vaccinations on file.</p>
            )}
          </section>

          <section aria-labelledby="meds-title" className={card}>
            <SectionTitle id="meds-title" icon={<Pill className="size-5" />}>
              Current medications
            </SectionTitle>
            {record && record.medications.length > 0 ? (
              <ul className="divide-y divide-slate-200">
                {record.medications.map((m) => (
                  <li key={m.name} className="py-2.5 first:pt-0 last:pb-0">
                    <p className="font-bold text-slate-900">{m.name}</p>
                    <p className="text-sm text-slate-700">
                      {m.dose} &middot; since {fmtDate(m.since)}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-600">No current medications on file.</p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
```
