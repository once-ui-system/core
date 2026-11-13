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
export interface Vaccination {
  name: string;
  given: string;
  due: string;
}
export interface PatientRecord {
  weights_kg: { date: string; kg: number }[];
  vaccinations: Vaccination[];
  medications: { name: string; dose: string; since: string }[];
  visits: { date: string; vet: string; reason: string; notes: string; invoice_usd: number }[];
}

export const clinic = {
  name: "Pawpoint",
  tagline: "Hillside Veterinary Clinic",
  description: "Pawpoint, front-desk and records software for Hillside Veterinary Clinic",
};

export const TODAY = "2026-11-12";
/** The front desk clock starts here (minutes after midnight): 9:34 AM. */
export const NOW_START = 9 * 60 + 34;
export const DAY_OPEN = 8 * 60;
export const DAY_CLOSE = 18 * 60;

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
  { id: "a-05", patient: "p-107", vet: "v-2", start: "09:15", minutes: 20, reason: "Glucose curve", status: "checked_in", checkedInAt: "09:12" },
  { id: "a-06", patient: "p-105", vet: "v-1", start: "09:45", minutes: 20, reason: "Beak and nail trim", status: "checked_in", checkedInAt: "09:28" },
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

export const getPatient = (id: string): Patient | undefined => patients.find((p) => p.id === id);
export const getOwner = (id: string): Owner => owners.find((o) => o.id === id) ?? owners[0];
export const getVet = (id: string): Vet => vets.find((v) => v.id === id) ?? vets[0];
export const getRecord = (id: string): PatientRecord | undefined => records[id];

/* ---------- time and date helpers (all deterministic, UTC based) ---------- */

export function toMin(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}
export function fromMin(n: number): string {
  return `${String(Math.floor(n / 60)).padStart(2, "0")}:${String(n % 60).padStart(2, "0")}`;
}
/** "09:15" or minutes -> "9:15 AM" */
export function fmtClock(t: string | number): string {
  const m = typeof t === "number" ? t : toMin(t);
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return `${h % 12 || 12}:${String(mm).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
}
export function fmtDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", { timeZone: "UTC", month: "short", day: "numeric", year: "numeric" });
}
export function fmtLongDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", { timeZone: "UTC", weekday: "long", month: "long", day: "numeric", year: "numeric" });
}
export function fmtMonthYear(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  const month = d.toLocaleDateString("en-US", { timeZone: "UTC", month: "short" });
  return `${month} ’${String(d.getUTCFullYear()).slice(2)}`;
}
export function daysBetween(fromIso: string, toIso: string): number {
  return Math.round((Date.parse(`${toIso}T00:00:00Z`) - Date.parse(`${fromIso}T00:00:00Z`)) / 86400000);
}
export function ageLabel(born: string, on: string = TODAY): string {
  const b = new Date(`${born}T00:00:00Z`);
  const t = new Date(`${on}T00:00:00Z`);
  let months = (t.getUTCFullYear() - b.getUTCFullYear()) * 12 + (t.getUTCMonth() - b.getUTCMonth());
  if (t.getUTCDate() < b.getUTCDate()) months -= 1;
  const y = Math.floor(months / 12);
  const m = months % 12;
  if (y === 0) return `${m} mo`;
  return m === 0 ? `${y} yr` : `${y} yr ${m} mo`;
}
export const fmtMoney = (n: number): string => `$${n.toFixed(2)}`;
export const telHref = (phone: string): string => `tel:${phone.replace(/[^+\d]/g, "")}`;

/* ---------- booking rules ---------- */

export type SlotProblem = { kind: "passed" | "closed" | "taken"; with?: Appointment };

/** Overlap against any live (not cancelled) booking for the same vet. */
export function findClash(list: Appointment[], vetId: string, startMin: number, minutes: number): Appointment | undefined {
  return list.find(
    (a) =>
      a.vet === vetId &&
      a.status !== "cancelled" &&
      toMin(a.start) < startMin + minutes &&
      startMin < toMin(a.start) + a.minutes,
  );
}

export function slotProblem(list: Appointment[], vetId: string, startMin: number, minutes: number, now: number): SlotProblem | null {
  if (startMin < now) return { kind: "passed" };
  if (startMin + minutes > DAY_CLOSE) return { kind: "closed" };
  const clash = findClash(list, vetId, startMin, minutes);
  return clash ? { kind: "taken", with: clash } : null;
}

export function firstFreeSlot(list: Appointment[], vetId: string, minutes: number, now: number): number | null {
  for (let m = DAY_OPEN; m + minutes <= DAY_CLOSE; m += 15) {
    if (!slotProblem(list, vetId, m, minutes, now)) return m;
  }
  return null;
}
```

```ts lib/cx.ts
export const cx = (...parts: (string | false | null | undefined)[]): string => parts.filter(Boolean).join(" ");
```

```tsx lib/clinic-context.tsx
"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { initialAppointments, NOW_START, toMin, type Appointment, type Status, fromMin } from "@/lib/data";

export interface BookInput {
  patient: string;
  vet: string;
  start: string;
  minutes: number;
  reason: string;
  urgent: boolean;
}

interface ClinicState {
  appointments: Appointment[];
  /** Front desk clock, minutes after midnight. */
  now: number;
  checkIn: (id: string) => void;
  setStatus: (id: string, status: Status) => void;
  book: (input: BookInput) => Appointment;
}

const ClinicContext = createContext<ClinicState | null>(null);

export function ClinicProvider({ children }: { children: React.ReactNode }) {
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const [now, setNow] = useState(NOW_START);

  useEffect(() => {
    const t = window.setInterval(() => setNow((n) => n + 1), 60_000);
    return () => window.clearInterval(t);
  }, []);

  const setStatus = useCallback((id: string, status: Status) => {
    setAppointments((list) => list.map((a) => (a.id === id ? { ...a, status } : a)));
  }, []);

  const checkIn = useCallback(
    (id: string) => {
      setAppointments((list) =>
        list.map((a) => (a.id === id ? { ...a, status: "checked_in", checkedInAt: fromMin(now) } : a)),
      );
    },
    [now],
  );

  const book = useCallback(
    (input: BookInput): Appointment => {
      const appointment: Appointment = {
        id: `a-${String(appointments.length + 1).padStart(2, "0")}`,
        patient: input.patient,
        vet: input.vet,
        start: input.start,
        minutes: input.minutes,
        reason: input.reason,
        status: "booked",
        ...(input.urgent ? { urgent: true } : {}),
      };
      setAppointments((list) => [...list, appointment]);
      return appointment;
    },
    [appointments.length],
  );

  const value = useMemo(() => ({ appointments, now, checkIn, setStatus, book }), [appointments, now, checkIn, setStatus, book]);
  return <ClinicContext.Provider value={value}>{children}</ClinicContext.Provider>;
}

export function useClinic(): ClinicState {
  const ctx = useContext(ClinicContext);
  if (!ctx) throw new Error("useClinic must be used inside ClinicProvider");
  return ctx;
}

export const minutesWaiting = (a: Appointment, now: number): number =>
  a.checkedInAt ? Math.max(0, now - toMin(a.checkedInAt)) : 0;
```

```css app/globals.css
@import "tailwindcss";

@theme {
  --font-sans: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}

@layer base {
  html {
    -webkit-text-size-adjust: 100%;
  }
  body {
    background: var(--color-stone-50);
    color: var(--color-stone-900);
  }
  :focus-visible {
    outline: 3px solid var(--color-teal-600);
    outline-offset: 2px;
  }
  button:not(:disabled),
  summary,
  select {
    cursor: pointer;
  }
  button:disabled {
    cursor: not-allowed;
  }
}

@keyframes just-booked {
  0% {
    box-shadow: 0 0 0 0 rgb(13 148 136 / 0.6);
  }
  100% {
    box-shadow: 0 0 0 10px rgb(13 148 136 / 0);
  }
}

.just-booked {
  animation: just-booked 1.4s ease-out 2;
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

```tsx app/layout.tsx
import "./globals.css";

import type { Metadata, Viewport } from "next";
import { Header } from "@/components/Header";
import { ClinicProvider } from "@/lib/clinic-context";

export const metadata: Metadata = {
  title: "Pawpoint | Hillside Veterinary Clinic",
  description: "Pawpoint, front-desk and records software for Hillside Veterinary Clinic",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-dvh font-sans antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:font-semibold focus:shadow-lg"
        >
          Skip to content
        </a>
        <ClinicProvider>
          <Header />
          {children}
        </ClinicProvider>
      </body>
    </html>
  );
}
```

```tsx components/Header.tsx
import Link from "next/link";
import { PawPrint } from "lucide-react";
import { clinic, user } from "@/lib/data";
import { PatientSearch } from "@/components/PatientSearch";

export function Header() {
  const initials = user.name
    .split(" ")
    .map((w) => w[0])
    .join("");
  return (
    <header className="sticky top-0 z-30 border-b border-stone-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2.5 sm:px-6 md:flex-nowrap">
        <Link href="/" className="flex min-h-11 items-center gap-2.5 rounded-lg pr-2" aria-label="Pawpoint, today's schedule">
          <span className="grid size-9 place-items-center rounded-xl bg-teal-700 text-white">
            <PawPrint className="size-5" aria-hidden />
          </span>
          <span className="leading-tight">
            <span className="block text-base font-bold tracking-tight">{clinic.name}</span>
            <span className="hidden text-xs text-stone-500 sm:block">{clinic.tagline}</span>
          </span>
        </Link>

        <div className="order-last w-full md:order-none md:max-w-xl md:flex-1">
          <PatientSearch />
        </div>

        <div className="ml-auto flex items-center gap-3">
          <div className="hidden text-right leading-tight md:block">
            <p className="text-sm font-semibold">{user.name}</p>
            <p className="text-xs text-stone-500">{user.role}</p>
          </div>
          <span
            className="grid size-10 place-items-center rounded-full bg-stone-800 text-sm font-semibold text-white"
            role="img"
            aria-label={`${user.name}, ${user.role}`}
          >
            {initials}
          </span>
        </div>
      </div>
    </header>
  );
}
```

```tsx components/PatientSearch.tsx
"use client";

import { useId, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, TriangleAlert } from "lucide-react";
import { getOwner, patients } from "@/lib/data";
import { cx } from "@/lib/cx";

export function PatientSearch() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return [];
    return patients
      .filter((p) => p.name.toLowerCase().includes(s) || getOwner(p.owner).name.toLowerCase().includes(s))
      .slice(0, 8);
  }, [q]);

  const showList = open && q.trim().length > 0;

  function go(id: string) {
    setOpen(false);
    setQ("");
    inputRef.current?.blur();
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
      if (showList && hit) {
        e.preventDefault();
        go(hit.id);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div
      className="relative"
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOpen(false);
      }}
    >
      <label htmlFor="patient-search" className="sr-only">
        Find a patient or owner
      </label>
      <Search className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-stone-500" aria-hidden />
      <input
        ref={inputRef}
        id="patient-search"
        type="search"
        role="combobox"
        autoComplete="off"
        aria-expanded={showList}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={showList && results[active] ? `${listId}-${results[active].id}` : undefined}
        placeholder="Find a patient or owner"
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setActive(0);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        className="h-11 w-full rounded-xl border border-stone-300 bg-stone-50 pl-11 pr-3 text-base placeholder:text-stone-500 focus:border-teal-600 focus:bg-white"
      />
      {showList && (
        <ul
          id={listId}
          role="listbox"
          aria-label="Matching patients"
          onMouseDown={(e) => e.preventDefault()}
          className="absolute inset-x-0 top-full z-40 mt-2 max-h-[70dvh] overflow-auto rounded-xl border border-stone-200 bg-white p-1.5 shadow-xl"
        >
          {results.length === 0 && <li className="px-3 py-3 text-sm text-stone-600">No patient or owner matches &ldquo;{q.trim()}&rdquo;.</li>}
          {results.map((p, i) => {
            const owner = getOwner(p.owner);
            return (
              <li
                key={p.id}
                id={`${listId}-${p.id}`}
                role="option"
                aria-selected={i === active}
                onMouseEnter={() => setActive(i)}
                onClick={() => go(p.id)}
                className={cx("cursor-pointer rounded-lg px-3 py-2.5", i === active && "bg-teal-50")}
              >
                <div className="flex flex-wrap items-baseline gap-x-2">
                  <span className="font-semibold">{p.name}</span>
                  <span className="text-sm text-stone-600">
                    {p.species}, {p.breed}
                  </span>
                </div>
                <div className="text-sm text-stone-600">Owner: {owner.name}</div>
                {p.alerts.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {p.alerts.map((a) => (
                      <span key={a} className="inline-flex items-center gap-1 rounded bg-red-700 px-1.5 py-0.5 text-xs font-bold text-white">
                        <TriangleAlert className="size-3" aria-hidden />
                        <span className="sr-only">Medical alert: </span>
                        {a}
                      </span>
                    ))}
                  </div>
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

```tsx components/AlertBadges.tsx
import { TriangleAlert } from "lucide-react";
import { cx } from "@/lib/cx";

/** Medical alerts: solid red with an icon and the words in screen-reader text, never colour alone. */
export function AlertBadges({ alerts, className }: { alerts: string[]; className?: string }) {
  if (alerts.length === 0) return null;
  return (
    <ul className={cx("flex flex-wrap gap-1.5", className)} aria-label="Medical alerts">
      {alerts.map((a) => (
        <li
          key={a}
          className="inline-flex items-center gap-1.5 rounded-md bg-red-700 px-2 py-1 text-xs font-bold leading-tight text-white sm:text-sm"
        >
          <TriangleAlert className="size-4 shrink-0" aria-hidden />
          <span className="sr-only">Medical alert: </span>
          {a}
        </li>
      ))}
    </ul>
  );
}

/** Large banner used where a patient is the subject of the screen (record, booking form). */
export function AlertBanner({ alerts, name }: { alerts: string[]; name: string }) {
  if (alerts.length === 0) return null;
  return (
    <section aria-label={`Medical alerts for ${name}`} className="rounded-xl border-2 border-red-800 bg-red-700 p-4 text-white shadow-sm">
      <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider">
        <TriangleAlert className="size-5" aria-hidden />
        Medical alerts for {name}
      </h2>
      <ul className="mt-2 space-y-1 text-lg font-bold leading-snug sm:text-xl">
        {alerts.map((a) => (
          <li key={a} className="flex gap-2">
            <span aria-hidden>&bull;</span>
            <span>{a}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
```

```tsx components/StatusBadge.tsx
import { CircleCheck, Clock, DoorOpen, CalendarClock, Ban } from "lucide-react";
import type { Status } from "@/lib/data";
import { cx } from "@/lib/cx";

const config: Record<Status, { label: string; className: string; Icon: typeof Clock }> = {
  booked: { label: "Booked", className: "bg-stone-100 text-stone-800 ring-stone-300", Icon: CalendarClock },
  checked_in: { label: "Checked in", className: "bg-sky-100 text-sky-900 ring-sky-300", Icon: Clock },
  in_exam: { label: "In exam", className: "bg-teal-700 text-white ring-teal-800", Icon: DoorOpen },
  done: { label: "Done", className: "bg-emerald-50 text-emerald-900 ring-emerald-300", Icon: CircleCheck },
  cancelled: { label: "Cancelled", className: "bg-stone-100 text-stone-600 ring-stone-300 line-through", Icon: Ban },
};

export const statusLabel = (s: Status): string => config[s].label;

export function StatusBadge({ status }: { status: Status }) {
  const { label, className, Icon } = config[status];
  return (
    <span className={cx("inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset", className)}>
      <Icon className="size-3.5" aria-hidden />
      {label}
    </span>
  );
}
```

```tsx components/Schedule.tsx
"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { CalendarPlus, CircleCheck, Clock, EyeOff, Siren, Stethoscope, UserCheck, X } from "lucide-react";
import { minutesWaiting, useClinic } from "@/lib/clinic-context";
import {
  TODAY,
  firstFreeSlot,
  fmtClock,
  fmtLongDate,
  fromMin,
  getOwner,
  getPatient,
  getVet,
  patients,
  slotProblem,
  toMin,
  vets,
  DAY_CLOSE,
  DAY_OPEN,
  telHref,
  type Appointment,
  type Status,
} from "@/lib/data";
import { cx } from "@/lib/cx";
import { AlertBadges, AlertBanner } from "@/components/AlertBadges";
import { StatusBadge } from "@/components/StatusBadge";

const btnPrimary =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 text-sm font-semibold text-white shadow-sm hover:bg-teal-800 active:bg-teal-900 disabled:bg-stone-300 disabled:text-stone-600";
const btnSecondary =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-stone-300 bg-white px-4 text-sm font-semibold text-stone-900 hover:bg-stone-100 active:bg-stone-200";

export function Schedule() {
  const { appointments, now, checkIn, setStatus } = useClinic();
  const [vetFilter, setVetFilter] = useState<string>("all");
  const [hideFinished, setHideFinished] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [notice, setNotice] = useState<string>("");
  const [highlight, setHighlight] = useState<string | null>(null);
  const noticeTimer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(noticeTimer.current), []);

  function say(message: string) {
    setNotice(message);
    window.clearTimeout(noticeTimer.current);
    noticeTimer.current = window.setTimeout(() => setNotice(""), 8000);
  }

  const counts = useMemo(() => {
    const c: Record<Status, number> = { booked: 0, checked_in: 0, in_exam: 0, done: 0, cancelled: 0 };
    for (const a of appointments) c[a.status] += 1;
    return c;
  }, [appointments]);

  const sorted = useMemo(
    () =>
      [...appointments].sort(
        (a, b) => toMin(a.start) - toMin(b.start) || a.vet.localeCompare(b.vet),
      ),
    [appointments],
  );
  const visible = sorted.filter(
    (a) =>
      (vetFilter === "all" || a.vet === vetFilter) &&
      !(hideFinished && (a.status === "done" || a.status === "cancelled")),
  );

  const waiting = useMemo(
    () =>
      appointments
        .filter((a) => a.status === "checked_in")
        .sort((a, b) => Number(!!b.urgent) - Number(!!a.urgent) || toMin(a.checkedInAt ?? a.start) - toMin(b.checkedInAt ?? b.start)),
    [appointments],
  );
  const inExam = appointments.filter((a) => a.status === "in_exam");

  function act(a: Appointment, next: Status) {
    const name = getPatient(a.patient)?.name ?? "Patient";
    if (next === "checked_in") {
      checkIn(a.id);
      say(`${name} is checked in. ${waiting.length + 1} waiting.`);
    } else {
      setStatus(a.id, next);
      if (next === "in_exam") say(`${name} is in ${getVet(a.vet).room} with ${getVet(a.vet).name}.`);
      if (next === "done") say(`${name}'s visit is marked done.`);
    }
  }

  return (
    <main id="main" className="mx-auto max-w-7xl px-4 pb-16 pt-5 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-stone-600">{fmtLongDate(TODAY)}</p>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Today&rsquo;s schedule</h1>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-stone-600">
            <Clock className="size-4" aria-hidden /> Front desk clock <span className="font-semibold tabular-nums text-stone-900">{fmtClock(now)}</span>
          </p>
        </div>
        <button type="button" className={cx(btnPrimary, "min-h-12 px-5 text-base")} onClick={() => setBookingOpen(true)}>
          <CalendarPlus className="size-5" aria-hidden />
          Book appointment
        </button>
      </div>

      <dl className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        <Stat label="Booked" value={counts.booked} />
        <Stat label="Waiting" value={counts.checked_in} tone="sky" />
        <Stat label="In exam" value={counts.in_exam} tone="teal" />
        <Stat label="Done" value={counts.done} />
      </dl>

      <div role="status" aria-live="polite" className="mt-4 empty:hidden">
        {notice && (
          <p className="flex items-start gap-2 rounded-xl border border-teal-300 bg-teal-50 px-4 py-3 text-sm font-medium text-teal-950">
            <CircleCheck className="mt-0.5 size-5 shrink-0 text-teal-700" aria-hidden />
            <span className="flex-1">{notice}</span>
            <button type="button" aria-label="Dismiss message" className="-m-2 grid size-10 place-items-center rounded-lg hover:bg-teal-100" onClick={() => setNotice("")}>
              <X className="size-4" aria-hidden />
            </button>
          </p>
        )}
      </div>

      <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
        <section aria-labelledby="all-appts" className="min-w-0">
          <h2 id="all-appts" className="sr-only">
            All appointments
          </h2>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div role="group" aria-label="Filter by vet" className="flex flex-wrap gap-1.5">
              <FilterChip pressed={vetFilter === "all"} onClick={() => setVetFilter("all")}>
                All vets
              </FilterChip>
              {vets.map((v) => (
                <FilterChip key={v.id} pressed={vetFilter === v.id} onClick={() => setVetFilter(v.id)}>
                  {v.name.replace("Dr. ", "Dr. ").split(" ").slice(0, 2).join(" ")}
                  <span className="hidden text-stone-500 sm:inline"> &middot; {v.room}</span>
                </FilterChip>
              ))}
            </div>
            <button
              type="button"
              aria-pressed={hideFinished}
              onClick={() => setHideFinished((v) => !v)}
              className={cx(
                "inline-flex min-h-11 items-center gap-2 rounded-xl border px-3.5 text-sm font-medium",
                hideFinished ? "border-teal-700 bg-teal-700 text-white" : "border-stone-300 bg-white text-stone-800 hover:bg-stone-100",
              )}
            >
              <EyeOff className="size-4" aria-hidden />
              Hide done and cancelled
            </button>
          </div>

          {visible.length === 0 ? (
            <p className="rounded-xl border border-dashed border-stone-300 bg-white p-8 text-center text-stone-600">Nothing to show with these filters.</p>
          ) : (
            <ol className="space-y-2.5">
              {visible.map((a) => (
                <AppointmentRow key={a.id} a={a} now={now} highlighted={highlight === a.id} onAct={act} />
              ))}
            </ol>
          )}
        </section>

        <aside aria-label="Waiting room and exams" className="space-y-5 max-lg:order-first lg:sticky lg:top-24">
          <section aria-labelledby="waiting-h" className="rounded-2xl border border-stone-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-stone-200 px-4 py-3">
              <h2 id="waiting-h" className="text-lg font-bold">
                Waiting room
              </h2>
              <span className="rounded-full bg-sky-100 px-2.5 py-0.5 text-sm font-bold text-sky-900">{waiting.length}</span>
            </div>
            {waiting.length === 0 ? (
              <p className="px-4 py-6 text-sm text-stone-600">Nobody is waiting. Check in a booked patient from the schedule.</p>
            ) : (
              <ol className="divide-y divide-stone-200">
                {waiting.map((a, i) => {
                  const p = getPatient(a.patient);
                  const vet = getVet(a.vet);
                  const mins = minutesWaiting(a, now);
                  return (
                    <li key={a.id} className="px-4 py-3">
                      <div className="flex items-start gap-3">
                        <span
                          className={cx(
                            "mt-0.5 grid size-7 shrink-0 place-items-center rounded-full text-sm font-bold",
                            i === 0 ? "bg-teal-700 text-white" : "bg-stone-200 text-stone-800",
                          )}
                          aria-hidden
                        >
                          {i + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="flex flex-wrap items-center gap-x-2 font-semibold">
                            <Link href={`/patients/${a.patient}`} className="underline-offset-2 hover:underline">
                              {p?.name}
                            </Link>
                            {i === 0 && <span className="rounded bg-teal-100 px-1.5 py-0.5 text-xs font-bold uppercase tracking-wide text-teal-900">Next</span>}
                            {a.urgent && <UrgentTag />}
                          </p>
                          <p className="text-sm text-stone-600">
                            {getOwner(p?.owner ?? "").name} &middot; {a.reason}
                          </p>
                          <p className="text-sm text-stone-600">
                            {vet.name} &middot; {vet.room} &middot; booked {fmtClock(a.start)}
                          </p>
                          <AlertBadges alerts={p?.alerts ?? []} className="mt-1.5" />
                        </div>
                        <div className="text-right">
                          <p className={cx("text-xl font-bold tabular-nums leading-none", mins >= 20 ? "text-orange-700" : "text-stone-900")}>{mins}</p>
                          <p className="text-xs text-stone-600">min waiting</p>
                        </div>
                      </div>
                      <div className="mt-2 flex justify-end">
                        <button type="button" className={btnSecondary} onClick={() => act(a, "in_exam")} aria-label={`Start exam for ${p?.name} in ${vet.room}`}>
                          <Stethoscope className="size-4" aria-hidden />
                          Start exam
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}
          </section>

          <section aria-labelledby="exam-h" className="rounded-2xl border border-stone-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-stone-200 px-4 py-3">
              <h2 id="exam-h" className="text-lg font-bold">
                In exam now
              </h2>
              <span className="rounded-full bg-teal-100 px-2.5 py-0.5 text-sm font-bold text-teal-900">{inExam.length}</span>
            </div>
            {inExam.length === 0 ? (
              <p className="px-4 py-5 text-sm text-stone-600">All rooms are free.</p>
            ) : (
              <ul className="divide-y divide-stone-200">
                {inExam.map((a) => {
                  const p = getPatient(a.patient);
                  const vet = getVet(a.vet);
                  return (
                    <li key={a.id} className="px-4 py-3">
                      <p className="font-semibold">
                        <Link href={`/patients/${a.patient}`} className="underline-offset-2 hover:underline">
                          {p?.name}
                        </Link>{" "}
                        <span className="font-normal text-stone-600">&middot; {vet.room}</span>
                      </p>
                      <p className="text-sm text-stone-600">
                        {vet.name} &middot; {a.reason}
                      </p>
                      <AlertBadges alerts={p?.alerts ?? []} className="mt-1.5" />
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </aside>
      </div>

      <BookingDialog
        open={bookingOpen}
        onClose={() => setBookingOpen(false)}
        onBooked={(a) => {
          setBookingOpen(false);
          setVetFilter("all");
          setHideFinished(false);
          setHighlight(a.id);
          window.setTimeout(() => setHighlight(null), 3500);
          say(`Booked ${getPatient(a.patient)?.name} with ${getVet(a.vet).name} at ${fmtClock(a.start)}.`);
          window.setTimeout(() => document.getElementById(`appt-${a.id}`)?.scrollIntoView({ block: "center", behavior: "smooth" }), 50);
        }}
      />
    </main>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone?: "sky" | "teal" }) {
  return (
    <div
      className={cx(
        "rounded-xl border px-4 py-3",
        tone === "sky" && "border-sky-200 bg-sky-50",
        tone === "teal" && "border-teal-200 bg-teal-50",
        !tone && "border-stone-200 bg-white",
      )}
    >
      <dt className="text-sm font-medium text-stone-700">{label}</dt>
      <dd className="text-3xl font-bold tabular-nums leading-tight">{value}</dd>
    </div>
  );
}

function FilterChip({ pressed, onClick, children }: { pressed: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={cx(
        "min-h-11 rounded-xl border px-3.5 text-sm font-semibold",
        pressed ? "border-stone-900 bg-stone-900 text-white" : "border-stone-300 bg-white text-stone-800 hover:bg-stone-100",
      )}
    >
      {children}
    </button>
  );
}

function UrgentTag() {
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-orange-500 px-2 py-0.5 text-xs font-extrabold uppercase tracking-wide text-stone-950">
      <Siren className="size-3.5" aria-hidden />
      Urgent
    </span>
  );
}

function AppointmentRow({
  a,
  now,
  highlighted,
  onAct,
}: {
  a: Appointment;
  now: number;
  highlighted: boolean;
  onAct: (a: Appointment, next: Status) => void;
}) {
  const p = getPatient(a.patient);
  const owner = getOwner(p?.owner ?? "");
  const vet = getVet(a.vet);
  const muted = a.status === "done" || a.status === "cancelled";
  const end = toMin(a.start) + a.minutes;
  const name = p?.name ?? "patient";

  return (
    <li
      id={`appt-${a.id}`}
      className={cx(
        "scroll-mt-28 rounded-xl border p-3.5 sm:p-4",
        a.urgent && !muted ? "border-orange-400 border-l-[6px] border-l-orange-500 bg-orange-50" : "border-stone-200 bg-white",
        a.status === "in_exam" && "border-teal-300 bg-teal-50/60",
        muted && "bg-stone-100/70 text-stone-600",
        highlighted && "just-booked ring-2 ring-teal-600",
      )}
    >
      <div className="grid gap-3 sm:grid-cols-[6.5rem_minmax(0,1fr)_auto] sm:items-center">
        <div className="flex items-baseline gap-2 sm:block">
          <p className="text-lg font-bold tabular-nums">{fmtClock(a.start)}</p>
          <p className="text-xs text-stone-600">
            {a.minutes} min<span className="hidden sm:inline">, to {fmtClock(end)}</span>
          </p>
        </div>

        <div className="min-w-0">
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <Link
              href={`/patients/${a.patient}`}
              className={cx("text-lg font-bold underline-offset-2 hover:underline", a.status === "cancelled" && "line-through")}
            >
              {name}
            </Link>
            <span className="text-sm text-stone-600">
              {p?.species}, {p?.breed}
            </span>
            {a.urgent && !muted && <UrgentTag />}
          </p>
          <p className={cx("mt-0.5 text-base font-medium", muted ? "text-stone-600" : "text-stone-900")}>{a.reason}</p>
          <p className="mt-0.5 text-sm text-stone-600">
            Owner {owner.name} &middot;{" "}
            <a href={telHref(owner.phone)} className="underline underline-offset-2">
              {owner.phone}
            </a>
          </p>
          <p className="text-sm text-stone-600">
            {vet.name} &middot; {vet.room}
          </p>
          <AlertBadges alerts={p?.alerts ?? []} className="mt-2" />
        </div>

        <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end sm:justify-center">
          <div className="text-right">
            <StatusBadge status={a.status} />
            {a.status === "checked_in" && (
              <p className="mt-1 text-xs font-medium text-stone-700">
                Waiting {minutesWaiting(a, now)} min
              </p>
            )}
          </div>
          {a.status === "booked" && (
            <button type="button" className={btnPrimary} onClick={() => onAct(a, "checked_in")} aria-label={`Check in ${name}, ${fmtClock(a.start)} with ${vet.name}`}>
              <UserCheck className="size-4" aria-hidden />
              Check in
            </button>
          )}
          {a.status === "checked_in" && (
            <button type="button" className={btnSecondary} onClick={() => onAct(a, "in_exam")} aria-label={`Start exam for ${name}`}>
              <Stethoscope className="size-4" aria-hidden />
              Start exam
            </button>
          )}
          {a.status === "in_exam" && (
            <button type="button" className={btnSecondary} onClick={() => onAct(a, "done")} aria-label={`Mark ${name} done`}>
              <CircleCheck className="size-4" aria-hidden />
              Mark done
            </button>
          )}
        </div>
      </div>
    </li>
  );
}

/* ------------------------------ booking ------------------------------ */

const DURATIONS = [15, 20, 30, 45, 60];
const fieldClass =
  "mt-1.5 block min-h-12 w-full rounded-xl border border-stone-300 bg-white px-3 text-base focus:border-teal-600";

function BookingDialog({ open, onClose, onBooked }: { open: boolean; onClose: () => void; onBooked: (a: Appointment) => void }) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby="book-h"
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      className="m-auto max-h-[calc(100dvh-1.5rem)] w-[min(34rem,calc(100vw-1.5rem))] overflow-y-auto rounded-2xl bg-white p-0 text-stone-900 shadow-2xl backdrop:bg-stone-900/60"
    >
      {open && <BookingForm onClose={onClose} onBooked={onBooked} />}
    </dialog>
  );
}

function BookingForm({ onClose, onBooked }: { onClose: () => void; onBooked: (a: Appointment) => void }) {
  const { appointments, now, book } = useClinic();
  const [patientId, setPatientId] = useState("");
  const [vetId, setVetId] = useState(vets[0].id);
  const [minutes, setMinutes] = useState(20);
  const [start, setStart] = useState<number>(() => firstFreeSlot(appointments, vets[0].id, 20, now) ?? DAY_OPEN);
  const [reason, setReason] = useState("");
  const [urgent, setUrgent] = useState(false);
  const [moved, setMoved] = useState(false);
  const [error, setError] = useState("");

  const patient = getPatient(patientId);
  const slots: number[] = [];
  for (let m = DAY_OPEN; m < DAY_CLOSE; m += 15) slots.push(m);
  const problem = slotProblem(appointments, vetId, start, minutes, now);
  const nextFree = firstFreeSlot(appointments, vetId, minutes, now);

  function keepValid(nextVet: string, nextMinutes: number) {
    if (slotProblem(appointments, nextVet, start, nextMinutes, now)) {
      const free = firstFreeSlot(appointments, nextVet, nextMinutes, now);
      if (free !== null) {
        setStart(free);
        setMoved(true);
        return;
      }
    }
    setMoved(false);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const clash = slotProblem(appointments, vetId, start, minutes, now);
    if (!patientId) return setError("Choose a patient.");
    if (clash) {
      return setError(
        clash.kind === "taken" && clash.with
          ? `${getVet(vetId).name} already has ${getPatient(clash.with.patient)?.name} at ${fmtClock(clash.with.start)}. Pick another time.`
          : clash.kind === "passed"
            ? "That time has already passed."
            : "That visit would run past closing time.",
      );
    }
    const created = book({ patient: patientId, vet: vetId, start: fromMin(start), minutes, reason: reason.trim(), urgent });
    onBooked(created);
  }

  const optionLabel = (m: number) => {
    const pr = slotProblem(appointments, vetId, m, minutes, now);
    const suffix = !pr ? "" : pr.kind === "taken" ? " (taken)" : pr.kind === "passed" ? " (passed)" : " (after closing)";
    return `${fmtClock(m)}${suffix}`;
  };

  return (
    <form onSubmit={submit} className="p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 id="book-h" className="text-xl font-bold">
            Book an appointment
          </h2>
          <p className="mt-0.5 text-sm text-stone-600">Today, {fmtLongDate(TODAY)}</p>
        </div>
        <button type="button" onClick={onClose} aria-label="Close" className="-m-2 grid size-11 place-items-center rounded-xl hover:bg-stone-100">
          <X className="size-5" aria-hidden />
        </button>
      </div>

      <div className="mt-5 space-y-4">
        <div>
          <label htmlFor="b-patient" className="text-sm font-semibold">
            Patient
          </label>
          <select
            id="b-patient"
            required
            value={patientId}
            onChange={(e) => {
              setPatientId(e.target.value);
              setError("");
            }}
            className={fieldClass}
          >
            <option value="">Choose a patient</option>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.species}), {getOwner(p.owner).name}
                {p.alerts.length ? "  ⚠ alert" : ""}
              </option>
            ))}
          </select>
        </div>

        {patient && <AlertBanner alerts={patient.alerts} name={patient.name} />}

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="b-vet" className="text-sm font-semibold">
              Vet
            </label>
            <select
              id="b-vet"
              value={vetId}
              onChange={(e) => {
                setVetId(e.target.value);
                keepValid(e.target.value, minutes);
                setError("");
              }}
              className={fieldClass}
            >
              {vets.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} &middot; {v.room}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="b-time" className="text-sm font-semibold">
              Start time
            </label>
            <select
              id="b-time"
              value={start}
              onChange={(e) => {
                setStart(Number(e.target.value));
                setMoved(false);
                setError("");
              }}
              className={fieldClass}
              aria-describedby="b-time-help"
            >
              {slots.map((m) => (
                <option key={m} value={m} disabled={!!slotProblem(appointments, vetId, m, minutes, now)}>
                  {optionLabel(m)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="b-len" className="text-sm font-semibold">
              Length
            </label>
            <select
              id="b-len"
              value={minutes}
              onChange={(e) => {
                const n = Number(e.target.value);
                setMinutes(n);
                keepValid(vetId, n);
                setError("");
              }}
              className={fieldClass}
            >
              {DURATIONS.map((d) => (
                <option key={d} value={d}>
                  {d} minutes
                </option>
              ))}
            </select>
          </div>
        </div>

        <p id="b-time-help" aria-live="polite" className="text-sm text-stone-600">
          {moved
            ? `Moved to ${fmtClock(start)}, the next free time for ${getVet(vetId).name}.`
            : problem
              ? "This time is not available."
              : `${getVet(vetId).name} is free ${fmtClock(start)} to ${fmtClock(start + minutes)}. Times already taken are greyed out.`}
          {problem && nextFree !== null && (
            <>
              {" "}
              <button type="button" className="font-semibold text-teal-800 underline" onClick={() => setStart(nextFree)}>
                Use {fmtClock(nextFree)}
              </button>
            </>
          )}
        </p>

        <div>
          <label htmlFor="b-reason" className="text-sm font-semibold">
            Reason for visit
          </label>
          <input
            id="b-reason"
            required
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="For example: Vaccine booster"
            className={fieldClass}
            autoComplete="off"
          />
        </div>

        <label className="flex min-h-11 items-center gap-3 text-base font-medium">
          <input type="checkbox" checked={urgent} onChange={(e) => setUrgent(e.target.checked)} className="size-5 accent-orange-600" />
          Urgent visit
        </label>

        <div role="alert" className="empty:hidden">
          {error && <p className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm font-medium text-red-900">{error}</p>}
        </div>
      </div>

      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button type="button" onClick={onClose} className={btnSecondary}>
          Cancel
        </button>
        <button type="submit" disabled={!!problem} className={cx(btnPrimary, "min-h-12 px-6")}>
          <CalendarPlus className="size-4" aria-hidden />
          Book appointment
        </button>
      </div>
    </form>
  );
}
```

```tsx app/page.tsx
import { Schedule } from "@/components/Schedule";

export default function Page() {
  return <Schedule />;
}
```

```tsx components/WeightChart.tsx
import { fmtDate, fmtMonthYear } from "@/lib/data";

export function WeightChart({ points }: { points: { date: string; kg: number }[] }) {
  const W = 560;
  const H = 250;
  const pad = { l: 40, r: 28, t: 30, b: 42 };
  const times = points.map((p) => Date.parse(`${p.date}T00:00:00Z`));
  const t0 = Math.min(...times);
  const t1 = Math.max(...times);
  const kgs = points.map((p) => p.kg);
  const lo = Math.floor(Math.min(...kgs) - 0.5);
  const hi = Math.ceil(Math.max(...kgs) + 0.5);
  const x = (t: number) => pad.l + ((t - t0) / (t1 - t0 || 1)) * (W - pad.l - pad.r);
  const y = (v: number) => pad.t + ((hi - v) / (hi - lo)) * (H - pad.t - pad.b);
  const coords = points.map((p, i) => ({ ...p, cx: x(times[i]), cy: y(p.kg) }));
  const line = coords.map((c, i) => `${i === 0 ? "M" : "L"}${c.cx.toFixed(1)} ${c.cy.toFixed(1)}`).join(" ");
  const area = `${line} L${coords[coords.length - 1].cx.toFixed(1)} ${H - pad.b} L${coords[0].cx.toFixed(1)} ${H - pad.b} Z`;
  const grid: number[] = [];
  for (let v = lo; v <= hi; v += 1) grid.push(v);

  const first = points[0];
  const last = points[points.length - 1];
  const summary = `Weight fell from ${first.kg} kg on ${fmtDate(first.date)} to ${last.kg} kg on ${fmtDate(last.date)}.`;

  return (
    <figure>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={summary} className="h-auto w-full">
        {grid.map((v) => (
          <g key={v}>
            <line x1={pad.l} x2={W - pad.r} y1={y(v)} y2={y(v)} className="stroke-stone-200" strokeWidth={1} />
            <text x={pad.l - 8} y={y(v) + 4} textAnchor="end" fontSize={12} className="fill-stone-600">
              {v}
            </text>
          </g>
        ))}
        <path d={area} className="fill-teal-600/10" />
        <path d={line} fill="none" className="stroke-teal-700" strokeWidth={3} strokeLinejoin="round" strokeLinecap="round" />
        {coords.map((c, i) => {
          const isLast = i === coords.length - 1;
          return (
            <g key={c.date}>
              <circle cx={c.cx} cy={c.cy} r={isLast ? 6 : 4.5} className={isLast ? "fill-teal-700 stroke-white" : "fill-white stroke-teal-700"} strokeWidth={2.5} />
              <text x={c.cx} y={c.cy - 12} textAnchor="middle" fontSize={13} fontWeight={isLast ? 700 : 600} className="fill-stone-900">
                {c.kg}
              </text>
              <text x={c.cx} y={H - pad.b + 20} textAnchor="middle" fontSize={12} className="fill-stone-600">
                {fmtMonthYear(c.date)}
              </text>
            </g>
          );
        })}
        <text x={pad.l - 8} y={14} textAnchor="end" fontSize={12} className="fill-stone-600">
          kg
        </text>
      </svg>
      <figcaption className="sr-only">{summary}</figcaption>
    </figure>
  );
}
```

```tsx components/TodayVisits.tsx
"use client";

import { CalendarClock } from "lucide-react";
import { useClinic } from "@/lib/clinic-context";
import { fmtClock, getVet } from "@/lib/data";
import { StatusBadge } from "@/components/StatusBadge";

/** Today's appointments for this patient, live from the front desk schedule. */
export function TodayVisits({ patientId }: { patientId: string }) {
  const { appointments } = useClinic();
  const mine = appointments.filter((a) => a.patient === patientId).sort((a, b) => a.start.localeCompare(b.start));
  return (
    <section aria-labelledby="today-h" className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-5">
      <h2 id="today-h" className="flex items-center gap-2 text-lg font-bold">
        <CalendarClock className="size-5 text-teal-700" aria-hidden />
        At the clinic today
      </h2>
      {mine.length === 0 ? (
        <p className="mt-2 text-sm text-stone-600">No appointments today.</p>
      ) : (
        <ul className="mt-3 space-y-3">
          {mine.map((a) => (
            <li key={a.id} className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold tabular-nums">
                  {fmtClock(a.start)} <span className="font-normal text-stone-700">{a.reason}</span>
                </p>
                <p className="text-sm text-stone-600">
                  {getVet(a.vet).name} &middot; {getVet(a.vet).room}
                </p>
              </div>
              <StatusBadge status={a.status} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
```

```tsx app/patients/[id]/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, ClipboardList, Phone, Pill, Scale, Syringe, TriangleAlert, CircleCheck, TrendingDown } from "lucide-react";
import {
  TODAY,
  ageLabel,
  daysBetween,
  fmtDate,
  fmtLongDate,
  fmtMoney,
  getOwner,
  getPatient,
  getRecord,
  getVet,
  patients,
  telHref,
} from "@/lib/data";
import { cx } from "@/lib/cx";
import { AlertBanner } from "@/components/AlertBadges";
import { TodayVisits } from "@/components/TodayVisits";
import { WeightChart } from "@/components/WeightChart";

export function generateStaticParams() {
  return patients.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const p = getPatient(id);
  return { title: p ? `${p.name} | Pawpoint` : "Patient | Pawpoint" };
}

export default async function PatientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const patient = getPatient(id);
  if (!patient) notFound();
  const owner = getOwner(patient.owner);
  const record = getRecord(patient.id);

  const vaccinations = record
    ? record.vaccinations
        .map((v) => ({ ...v, left: daysBetween(TODAY, v.due) }))
        .sort((a, b) => a.left - b.left)
    : [];
  const overdue = vaccinations.filter((v) => v.left < 0);

  const weights = record?.weights_kg ?? [];
  const firstW = weights[0];
  const lastW = weights[weights.length - 1];
  const delta = firstW && lastW ? lastW.kg - firstW.kg : 0;
  const pct = firstW ? (delta / firstW.kg) * 100 : 0;

  return (
    <main id="main" className="mx-auto max-w-7xl px-4 pb-16 pt-5 sm:px-6">
      <Link href="/" className="inline-flex min-h-11 items-center gap-1.5 rounded-lg pr-3 text-sm font-semibold text-teal-800 hover:underline">
        <ArrowLeft className="size-4" aria-hidden />
        Today&rsquo;s schedule
      </Link>

      <header className="mt-1 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-x-8 gap-y-4">
          <div className="flex items-center gap-4">
            <span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-teal-100 text-3xl font-bold text-teal-900" aria-hidden>
              {patient.name[0]}
            </span>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{patient.name}</h1>
              <p className="text-base text-stone-700">
                {patient.breed} &middot; {patient.species}
              </p>
              <p className="text-sm text-stone-600">Patient {patient.id}</p>
            </div>
          </div>
          <dl className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm sm:grid-cols-3">
            <Fact label="Age" value={ageLabel(patient.born)} />
            <Fact label="Born" value={fmtDate(patient.born)} />
            <Fact label="Sex" value={patient.sex} />
            <Fact label="Owner" value={owner.name} />
            <div>
              <dt className="text-stone-600">Phone</dt>
              <dd className="font-semibold">
                <a href={telHref(owner.phone)} className="inline-flex min-h-8 items-center gap-1.5 underline underline-offset-2">
                  <Phone className="size-4" aria-hidden />
                  {owner.phone}
                </a>
              </dd>
            </div>
            {lastW && <Fact label="Last weight" value={`${lastW.kg} kg`} />}
          </dl>
        </div>
      </header>

      <div className="mt-4">
        {patient.alerts.length > 0 ? (
          <AlertBanner alerts={patient.alerts} name={patient.name} />
        ) : (
          <p className="rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-700">No medical alerts on file for {patient.name}.</p>
        )}
      </div>

      {!record && (
        <p className="mt-6 rounded-2xl border border-dashed border-stone-300 bg-white p-8 text-center text-stone-700">
          No weights, vaccinations or visit notes are on file yet for {patient.name} in this demo.
        </p>
      )}

      {record && (
        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-start">
          <div className="min-w-0 space-y-6 lg:order-last">
            <TodayVisits patientId={patient.id} />

            <section aria-labelledby="vax-h" className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 id="vax-h" className="flex items-center gap-2 text-lg font-bold">
                  <Syringe className="size-5 text-teal-700" aria-hidden />
                  Vaccinations
                </h2>
                {overdue.length > 0 && (
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-red-700 px-2 py-1 text-sm font-bold text-white">
                    <TriangleAlert className="size-4" aria-hidden />
                    {overdue.length} overdue
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-sm text-stone-600">Checked against today, {fmtLongDate(TODAY)}.</p>
              <ul className="mt-3 space-y-2">
                {vaccinations.map((v) => {
                  const isOverdue = v.left < 0;
                  const soon = !isOverdue && v.left <= 30;
                  return (
                    <li
                      key={v.name}
                      className={cx(
                        "rounded-xl border p-3",
                        isOverdue ? "border-red-300 border-l-[6px] border-l-red-700 bg-red-50" : soon ? "border-orange-300 bg-orange-50" : "border-stone-200",
                      )}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-semibold">{v.name}</p>
                        {isOverdue ? (
                          <span className="inline-flex items-center gap-1 rounded-md bg-red-700 px-2 py-0.5 text-xs font-bold text-white">
                            <TriangleAlert className="size-3.5" aria-hidden />
                            Overdue by {-v.left} days
                          </span>
                        ) : soon ? (
                          <span className="rounded-md bg-orange-500 px-2 py-0.5 text-xs font-bold text-stone-950">Due in {v.left} days</span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800">
                            <CircleCheck className="size-3.5" aria-hidden />
                            Up to date
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-sm text-stone-700">
                        Given {fmtDate(v.given)} &middot; <span className={cx(isOverdue && "font-bold text-red-800")}>due {fmtDate(v.due)}</span>
                      </p>
                    </li>
                  );
                })}
              </ul>
            </section>

            <section aria-labelledby="med-h" className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-5">
              <h2 id="med-h" className="flex items-center gap-2 text-lg font-bold">
                <Pill className="size-5 text-teal-700" aria-hidden />
                Current medications
              </h2>
              <ul className="mt-3 divide-y divide-stone-200">
                {record.medications.map((m) => (
                  <li key={m.name} className="py-2.5 first:pt-0 last:pb-0">
                    <p className="font-semibold">{m.name}</p>
                    <p className="text-sm text-stone-700">
                      {m.dose} &middot; since {fmtDate(m.since)}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <div className="min-w-0 space-y-6">
            <section aria-labelledby="wt-h" className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 id="wt-h" className="flex items-center gap-2 text-lg font-bold">
                    <Scale className="size-5 text-teal-700" aria-hidden />
                    Weight trend
                  </h2>
                  <p className="text-sm text-stone-600">
                    {weights.length} visits, {fmtDate(firstW.date)} to {fmtDate(lastW.date)}
                  </p>
                </div>
                <p className="inline-flex items-center gap-1.5 rounded-lg bg-orange-100 px-2.5 py-1.5 text-sm font-bold text-orange-950">
                  <TrendingDown className="size-4" aria-hidden />
                  {delta.toFixed(1)} kg ({pct.toFixed(0)}%) since {fmtDate(firstW.date)}
                </p>
              </div>
              <div className="mt-3">
                <WeightChart points={weights} />
              </div>
              <details className="mt-2 text-sm">
                <summary className="inline-flex min-h-11 items-center font-semibold text-teal-800 underline underline-offset-2">Show weights as a table</summary>
                <table className="mt-1 w-full text-left">
                  <caption className="sr-only">Olive&rsquo;s weight at each visit</caption>
                  <thead className="text-stone-600">
                    <tr>
                      <th scope="col" className="py-1 font-medium">Date</th>
                      <th scope="col" className="py-1 text-right font-medium">Weight</th>
                      <th scope="col" className="py-1 text-right font-medium">Change</th>
                    </tr>
                  </thead>
                  <tbody>
                    {weights.map((w, i) => (
                      <tr key={w.date} className="border-t border-stone-200">
                        <th scope="row" className="py-1.5 font-normal">{fmtDate(w.date)}</th>
                        <td className="py-1.5 text-right font-semibold tabular-nums">{w.kg} kg</td>
                        <td className="py-1.5 text-right tabular-nums text-stone-700">{i === 0 ? "-" : `${(w.kg - weights[i - 1].kg).toFixed(1)} kg`}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </details>
            </section>

            <section aria-labelledby="vis-h" className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-5">
              <h2 id="vis-h" className="flex items-center gap-2 text-lg font-bold">
                <ClipboardList className="size-5 text-teal-700" aria-hidden />
                Visit history
              </h2>
              <ol className="mt-4 space-y-5 border-l-2 border-stone-200 pl-4 sm:pl-5">
                {record.visits.map((v) => (
                  <li key={v.date} className="relative">
                    <span className="absolute -left-[1.4rem] top-1.5 size-3 rounded-full border-2 border-white bg-teal-700 ring-2 ring-teal-700 sm:-left-[1.65rem]" aria-hidden />
                    <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                      <p className="font-semibold">
                        <time dateTime={v.date}>{fmtDate(v.date)}</time> &middot; {v.reason}
                      </p>
                      <p className="text-sm tabular-nums text-stone-600">Invoice {fmtMoney(v.invoice_usd)}</p>
                    </div>
                    <p className="text-sm text-stone-600">{getVet(v.vet).name}</p>
                    <p className="mt-1.5 text-base leading-relaxed text-stone-800">{v.notes}</p>
                  </li>
                ))}
              </ol>
            </section>
          </div>
        </div>
      )}
    </main>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-stone-600">{label}</dt>
      <dd className="font-semibold">{value}</dd>
    </div>
  );
}
```
