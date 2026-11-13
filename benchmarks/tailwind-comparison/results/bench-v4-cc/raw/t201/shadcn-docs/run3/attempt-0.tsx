```ts lib/data.ts
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
```

```tsx components/alerts.tsx
import { TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";

/** Compact, high-contrast chips used wherever a patient appears in a list. */
export function AlertChips({ alerts, className }: { alerts: string[]; className?: string }) {
  if (alerts.length === 0) return null;
  return (
    <ul className={cn("flex flex-wrap gap-1.5", className)} aria-label="Medical alerts">
      {alerts.map((alert) => (
        <li key={alert}>
          <span className="inline-flex items-center gap-1 rounded-md bg-red-600 px-2 py-0.5 text-xs font-semibold text-white">
            <TriangleAlert className="size-3.5 shrink-0" aria-hidden="true" />
            <span className="sr-only">Medical alert: </span>
            {alert}
          </span>
        </li>
      ))}
    </ul>
  );
}

/** Large banner for the top of a patient record. */
export function AlertBanner({ name, alerts }: { name: string; alerts: string[] }) {
  if (alerts.length === 0) return null;
  return (
    <section
      aria-labelledby="medical-alerts-heading"
      className="rounded-xl border-2 border-red-600 bg-red-50 p-4 dark:bg-red-950/40"
    >
      <h2
        id="medical-alerts-heading"
        className="flex items-center gap-2 text-sm font-bold tracking-wide text-red-700 uppercase dark:text-red-300"
      >
        <TriangleAlert className="size-5" aria-hidden="true" />
        Medical alerts for {name}
      </h2>
      <ul className="mt-3 grid gap-2 sm:grid-cols-2">
        {alerts.map((alert) => (
          <li
            key={alert}
            className="flex items-center gap-3 rounded-lg bg-red-600 px-4 py-3 text-base font-semibold text-white sm:text-lg"
          >
            <TriangleAlert className="size-6 shrink-0" aria-hidden="true" />
            {alert}
          </li>
        ))}
      </ul>
    </section>
  );
}
```

```tsx components/status-badge.tsx
import { Ban, CalendarDays, CircleCheck, Hourglass, Stethoscope } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Status } from "@/lib/data";

const CONFIG: Record<Status, { label: string; className: string; Icon: typeof Hourglass }> = {
  booked: {
    label: "Booked",
    className: "border-border bg-background text-foreground",
    Icon: CalendarDays,
  },
  checked_in: {
    label: "Checked in",
    className:
      "bg-amber-100 text-amber-950 dark:bg-amber-500/20 dark:text-amber-100",
    Icon: Hourglass,
  },
  in_exam: {
    label: "In exam",
    className: "bg-sky-100 text-sky-950 dark:bg-sky-500/20 dark:text-sky-100",
    Icon: Stethoscope,
  },
  done: {
    label: "Done",
    className:
      "bg-emerald-100 text-emerald-950 dark:bg-emerald-500/20 dark:text-emerald-100",
    Icon: CircleCheck,
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-muted text-muted-foreground",
    Icon: Ban,
  },
};

export function statusLabel(status: Status): string {
  return CONFIG[status].label;
}

export function StatusBadge({ status, className }: { status: Status; className?: string }) {
  const { label, className: tone, Icon } = CONFIG[status];
  return (
    <Badge variant="outline" className={cn("gap-1.5 px-2.5 py-1 text-xs", tone, className)}>
      <Icon aria-hidden="true" />
      {label}
    </Badge>
  );
}
```

```tsx components/app-shell.tsx
import Link from "next/link";
import { PawPrint } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PatientSearch } from "@/components/patient-search";
import { CLINIC_NAME, PRODUCT_NAME, initials, user } from "@/lib/data";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-background">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Skip to main content
      </a>
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-[1400px] flex-wrap items-center gap-x-4 gap-y-3 px-4 py-3 sm:px-6">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-lg outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            <span className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground">
              <PawPrint className="size-5" aria-hidden="true" />
            </span>
            <span className="leading-tight">
              <span className="block text-base font-semibold tracking-tight">{PRODUCT_NAME}</span>
              <span className="hidden text-xs text-muted-foreground sm:block">{CLINIC_NAME}</span>
            </span>
          </Link>

          <div className="order-3 w-full md:order-none md:mx-auto md:w-auto md:max-w-lg md:flex-1">
            <PatientSearch />
          </div>

          <div className="ml-auto flex items-center gap-3 md:ml-0">
            <div className="hidden text-right leading-tight sm:block">
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.role}</p>
            </div>
            <Avatar className="size-10">
              <AvatarFallback className="bg-secondary text-sm font-semibold">
                {initials(user.name)}
              </AvatarFallback>
            </Avatar>
            <span className="sr-only sm:hidden">
              Signed in as {user.name}, {user.role}
            </span>
          </div>
        </div>
      </header>
      <main id="main" tabIndex={-1} className="mx-auto w-full max-w-[1400px] px-4 py-6 outline-none sm:px-6 sm:py-8">
        {children}
      </main>
    </div>
  );
}
```

```tsx components/patient-search.tsx
"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Command as CommandPrimitive } from "cmdk";
import { SearchIcon } from "lucide-react";
import { AlertChips } from "@/components/alerts";
import { Command, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { getOwner, searchPatients } from "@/lib/data";

export function PatientSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const results = useMemo(() => searchPatients(query), [query]);
  const showResults = open && query.trim().length > 0;

  function openRecord(id: string) {
    setOpen(false);
    setQuery("");
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    router.push(`/patients/${id}`);
  }

  return (
    <div
      className="relative"
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOpen(false);
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          setOpen(false);
          setQuery("");
        }
      }}
    >
      <Command shouldFilter={false} loop className="h-auto overflow-visible bg-transparent">
        <div className="relative">
          <SearchIcon
            className="pointer-events-none absolute top-1/2 left-3.5 size-5 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <CommandPrimitive.Input
            value={query}
            onValueChange={(v) => {
              setQuery(v);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            aria-label="Search patients or owners"
            placeholder="Search patient or owner"
            className="h-11 w-full rounded-lg border border-input bg-card pr-3 pl-11 text-base shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
          />
        </div>
        {showResults && (
          <div
            className="absolute inset-x-0 top-full z-50 mt-2 overflow-hidden rounded-xl border bg-popover shadow-lg"
            onMouseDown={(e) => e.preventDefault()}
          >
            {results.length === 0 ? (
              <p role="status" className="px-4 py-6 text-center text-sm text-muted-foreground">
                No patient or owner matches &ldquo;{query.trim()}&rdquo;.
              </p>
            ) : (
              <CommandList className="max-h-[60dvh]">
                <CommandGroup heading={`Patients (${results.length})`}>
                  {results.map((p) => {
                    const owner = getOwner(p.owner);
                    return (
                      <CommandItem
                        key={p.id}
                        value={p.id}
                        onSelect={() => openRecord(p.id)}
                        className="min-h-14 flex-col items-start gap-1 py-2.5"
                      >
                        <span className="flex w-full items-baseline gap-2">
                          <span className="text-base font-semibold">{p.name}</span>
                          <span className="truncate text-sm text-muted-foreground">
                            {p.species} &middot; {p.breed}
                          </span>
                        </span>
                        <span className="text-sm text-muted-foreground">
                          Owner: {owner?.name ?? "Unknown"}
                        </span>
                        <AlertChips alerts={p.alerts} />
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </CommandList>
            )}
          </div>
        )}
      </Command>
    </div>
  );
}
```

```tsx components/weight-chart.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { formatDate, formatMonthYear, type WeightPoint } from "@/lib/data";

const HEIGHT = 240;
const PAD = { left: 42, right: 22, top: 30, bottom: 36 };

export function WeightChart({ points, name }: { points: WeightPoint[]; name: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(560);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width;
      if (w) setWidth(Math.max(280, Math.round(w)));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const values = points.map((p) => p.kg);
  const lo = Math.floor(Math.min(...values) - 0.5);
  const hi = Math.ceil(Math.max(...values) + 0.5);
  const innerW = width - PAD.left - PAD.right;
  const innerH = HEIGHT - PAD.top - PAD.bottom;
  const x = (i: number) => PAD.left + (points.length === 1 ? innerW / 2 : (i / (points.length - 1)) * innerW);
  const y = (kg: number) => PAD.top + (1 - (kg - lo) / (hi - lo)) * innerH;

  const ticks: number[] = [];
  for (let t = lo; t <= hi; t += 1) ticks.push(t);

  const line = points.map((p, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(p.kg).toFixed(1)}`).join(" ");
  const area = `${line} L${x(points.length - 1).toFixed(1)},${(PAD.top + innerH).toFixed(1)} L${x(0).toFixed(1)},${(PAD.top + innerH).toFixed(1)} Z`;
  const first = points[0];
  const last = points[points.length - 1];

  return (
    <div ref={wrapRef} className="w-full">
      <svg
        role="img"
        aria-labelledby="weight-chart-title weight-chart-desc"
        width={width}
        height={HEIGHT}
        viewBox={`0 0 ${width} ${HEIGHT}`}
        className="block max-w-full"
      >
        <title id="weight-chart-title">{`${name}'s weight over ${points.length} visits`}</title>
        <desc id="weight-chart-desc">
          {`From ${first.kg} kilograms on ${formatDate(first.date)} to ${last.kg} kilograms on ${formatDate(last.date)}.`}
        </desc>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={PAD.left} x2={width - PAD.right} y1={y(t)} y2={y(t)} className="stroke-border" strokeDasharray="3 4" />
            <text x={PAD.left - 8} y={y(t)} dy="0.32em" textAnchor="end" className="fill-muted-foreground text-[11px] tabular-nums">
              {t}
            </text>
          </g>
        ))}
        <path d={area} className="fill-primary/10" />
        <path d={line} className="fill-none stroke-primary" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
        {points.map((p, i) => {
          const isLast = i === points.length - 1;
          return (
            <g key={p.date}>
              <circle cx={x(i)} cy={y(p.kg)} r={isLast ? 6 : 4} className={isLast ? "fill-primary stroke-background" : "fill-background stroke-primary"} strokeWidth={2} />
              <text
                x={x(i)}
                y={y(p.kg) - 12}
                textAnchor="middle"
                className={isLast ? "fill-foreground text-[12px] font-semibold tabular-nums" : "fill-muted-foreground text-[11px] tabular-nums"}
              >
                {p.kg.toFixed(1)}
              </text>
              <text x={x(i)} y={HEIGHT - 12} textAnchor="middle" className="fill-muted-foreground text-[11px]">
                {formatMonthYear(p.date)}
              </text>
            </g>
          );
        })}
      </svg>
      <table className="sr-only">
        <caption>{`${name}'s weight by visit date, in kilograms`}</caption>
        <thead>
          <tr>
            <th scope="col">Date</th>
            <th scope="col">Weight (kg)</th>
          </tr>
        </thead>
        <tbody>
          {points.map((p) => (
            <tr key={p.date}>
              <td>{formatDate(p.date)}</td>
              <td>{p.kg}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

```tsx components/book-dialog.tsx
"use client";

import { useMemo, useState } from "react";
import { TriangleAlert } from "lucide-react";
import { AlertChips } from "@/components/alerts";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  CLOSING,
  OPENING,
  TODAY,
  findPatientConflict,
  findVetConflict,
  formatLongDate,
  getOwner,
  getPatient,
  getVet,
  patients,
  toClock,
  toMinutes,
  vets,
  type Appointment,
} from "@/lib/data";

const DURATIONS = [20, 30, 45, 60];

type Problem = { short: string; message: string };

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appts: Appointment[];
  now: number;
  onBook: (appointment: Appointment) => void;
};

export function BookDialog({ open, onOpenChange, appts, now, onBook }: Props) {
  const [patientId, setPatientId] = useState("");
  const [vetId, setVetId] = useState("");
  const [minutes, setMinutes] = useState("20");
  const [time, setTime] = useState("");
  const [reason, setReason] = useState("");
  const [urgent, setUrgent] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const duration = Number(minutes);
  const patient = patientId ? getPatient(patientId) : undefined;

  function check(slot: number): Problem | null {
    if (slot < now) return { short: "passed", message: "That time has already passed." };
    if (slot + duration > CLOSING) {
      return { short: "after closing", message: `Appointments must finish by ${toClock(CLOSING)}.` };
    }
    if (vetId) {
      const c = findVetConflict(appts, vetId, slot, duration);
      if (c) {
        const who = getPatient(c.patient)?.name ?? "another patient";
        const end = toClock(toMinutes(c.start) + c.minutes);
        return {
          short: "taken",
          message: `${getVet(vetId)?.name ?? "This vet"} is already booked ${c.start} to ${end} (${who}). Pick a free time.`,
        };
      }
    }
    if (patientId) {
      const c = findPatientConflict(appts, patientId, slot, duration);
      if (c) {
        const end = toClock(toMinutes(c.start) + c.minutes);
        return {
          short: "patient busy",
          message: `${patient?.name ?? "This patient"} already has an appointment ${c.start} to ${end}.`,
        };
      }
    }
    return null;
  }

  const slots = useMemo(() => {
    const list: number[] = [];
    for (let m = OPENING; m < CLOSING; m += 15) list.push(m);
    return list;
  }, []);

  const selectedProblem = time ? check(toMinutes(time)) : null;

  function reset() {
    setPatientId("");
    setVetId("");
    setMinutes("20");
    setTime("");
    setReason("");
    setUrgent(false);
    setSubmitted(false);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
    if (!patientId || !vetId || !time) return;
    if (check(toMinutes(time))) return;
    onBook({
      id: `a-${String(appts.length + 1).padStart(2, "0")}`,
      patient: patientId,
      vet: vetId,
      start: time,
      minutes: duration,
      reason: reason.trim() || "Follow-up visit",
      status: "booked",
      ...(urgent ? { urgent: true } : {}),
    });
    reset();
    onOpenChange(false);
  }

  const missing = (value: string) => submitted && !value;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-xl">New appointment</DialogTitle>
          <DialogDescription>
            {formatLongDate(TODAY)}. Times that clash with the vet&rsquo;s schedule are switched off.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} noValidate className="grid gap-5">
          <div className="grid gap-2">
            <Label htmlFor="book-patient">Patient</Label>
            <Select value={patientId} onValueChange={setPatientId}>
              <SelectTrigger
                id="book-patient"
                className="h-11 w-full"
                aria-invalid={missing(patientId) || undefined}
              >
                <SelectValue placeholder="Choose a patient" />
              </SelectTrigger>
              <SelectContent>
                {patients.map((p) => (
                  <SelectItem key={p.id} value={p.id} className="py-2.5">
                    {p.alerts.length > 0 && (
                      <TriangleAlert className="text-red-600" aria-label="Has medical alerts" />
                    )}
                    {p.name} &middot; {p.species} &middot; {getOwner(p.owner)?.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {missing(patientId) && <p className="text-sm text-destructive">Choose a patient.</p>}
            {patient && patient.alerts.length > 0 && (
              <div className="rounded-lg border-2 border-red-600 bg-red-50 p-3 dark:bg-red-950/40">
                <p className="mb-2 text-sm font-semibold text-red-800 dark:text-red-200">
                  Medical alerts for {patient.name}
                </p>
                <AlertChips alerts={patient.alerts} />
              </div>
            )}
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="book-vet">Vet</Label>
              <Select value={vetId} onValueChange={setVetId}>
                <SelectTrigger id="book-vet" className="h-11 w-full" aria-invalid={missing(vetId) || undefined}>
                  <SelectValue placeholder="Choose a vet" />
                </SelectTrigger>
                <SelectContent>
                  {vets.map((v) => (
                    <SelectItem key={v.id} value={v.id} className="py-2.5">
                      {v.name} &middot; {v.room}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {missing(vetId) && <p className="text-sm text-destructive">Choose a vet.</p>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="book-length">Length</Label>
              <Select value={minutes} onValueChange={setMinutes}>
                <SelectTrigger id="book-length" className="h-11 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DURATIONS.map((d) => (
                    <SelectItem key={d} value={String(d)} className="py-2.5">
                      {d} minutes
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="book-time">Time</Label>
            <Select value={time} onValueChange={setTime}>
              <SelectTrigger
                id="book-time"
                className="h-11 w-full"
                aria-invalid={missing(time) || !!selectedProblem || undefined}
                aria-describedby="book-time-help"
              >
                <SelectValue placeholder={vetId ? "Choose a free time" : "Choose a vet first, then a time"} />
              </SelectTrigger>
              <SelectContent className="max-h-72">
                {slots.map((s) => {
                  const problem = check(s);
                  return (
                    <SelectItem
                      key={s}
                      value={toClock(s)}
                      disabled={!!problem}
                      className="py-2.5 tabular-nums"
                    >
                      {toClock(s)}
                      {problem ? ` (${problem.short})` : ""}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            <p id="book-time-help" className="text-sm text-muted-foreground">
              Open {toClock(OPENING)} to {toClock(CLOSING)}, every 15 minutes.
            </p>
            {selectedProblem && (
              <p role="alert" className="text-sm font-medium text-destructive">
                {selectedProblem.message}
              </p>
            )}
            {missing(time) && <p className="text-sm text-destructive">Choose a time.</p>}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="book-reason">Reason for visit</Label>
            <Input
              id="book-reason"
              className="h-11"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Follow-up visit"
              autoComplete="off"
            />
          </div>

          <div className="flex items-center justify-between gap-4 rounded-lg border p-3">
            <div>
              <Label htmlFor="book-urgent" className="text-base">
                Urgent visit
              </Label>
              <p className="text-sm text-muted-foreground">Highlighted on the schedule for the vets.</p>
            </div>
            <Switch id="book-urgent" checked={urgent} onCheckedChange={setUrgent} />
          </div>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button type="button" variant="outline" className="h-11" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="h-11 px-6" disabled={!!selectedProblem}>
              Book appointment
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

```tsx components/schedule-board.tsx
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { CalendarDays, Clock, DoorOpen, Hourglass, LogIn, CircleCheck, Plus, Siren } from "lucide-react";
import { AlertChips } from "@/components/alerts";
import { BookDialog } from "@/components/book-dialog";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  NOW_MINUTES,
  TODAY,
  appointments,
  endClock,
  formatLongDate,
  initialArrivals,
  ownerOf,
  patientOf,
  toClock,
  toMinutes,
  vetOf,
  vets,
  type Appointment,
  type Status,
} from "@/lib/data";
import { cn } from "@/lib/utils";

const LONG_WAIT = 15;

export function ScheduleBoard() {
  const [appts, setAppts] = useState<Appointment[]>(appointments);
  const [arrivals, setArrivals] = useState<Record<string, number>>(initialArrivals);
  const [now, setNow] = useState(NOW_MINUTES);
  const [vetFilter, setVetFilter] = useState("all");
  const [hideFinished, setHideFinished] = useState(false);
  const [bookOpen, setBookOpen] = useState(false);
  const [fresh, setFresh] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setInterval(() => setNow((n) => n + 1), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const sorted = useMemo(
    () =>
      [...appts].sort(
        (a, b) => toMinutes(a.start) - toMinutes(b.start) || a.vet.localeCompare(b.vet)
      ),
    [appts]
  );

  const visible = sorted.filter(
    (a) =>
      (vetFilter === "all" || a.vet === vetFilter) &&
      !(hideFinished && (a.status === "done" || a.status === "cancelled"))
  );

  const waiting = appts
    .filter((a) => a.status === "checked_in")
    .sort((a, b) => (arrivals[a.id] ?? now) - (arrivals[b.id] ?? now));
  const arrivingNext = sorted.filter((a) => a.status === "booked").slice(0, 3);

  const count = (s: Status) => appts.filter((a) => a.status === s).length;
  const activeTotal = appts.filter((a) => a.status !== "cancelled").length;

  function setStatus(id: string, status: Status) {
    setAppts((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
  }

  function checkIn(a: Appointment) {
    const patient = patientOf(a);
    setStatus(a.id, "checked_in");
    setArrivals((prev) => ({ ...prev, [a.id]: now }));
    toast.success(`${patient.name} checked in`, {
      description:
        patient.alerts.length > 0
          ? `Alert: ${patient.alerts.join("; ")}`
          : `${vetOf(a).name} at ${a.start}`,
      action: {
        label: "Undo",
        onClick: () => {
          setStatus(a.id, "booked");
          setArrivals((prev) => {
            const next = { ...prev };
            delete next[a.id];
            return next;
          });
        },
      },
    });
  }

  function sendToExam(a: Appointment) {
    setStatus(a.id, "in_exam");
    toast(`${patientOf(a).name} sent to ${vetOf(a).room}`, { description: vetOf(a).name });
  }

  function markDone(a: Appointment) {
    setStatus(a.id, "done");
    toast.success(`${patientOf(a).name} is done`);
  }

  function handleBook(a: Appointment) {
    setAppts((prev) => [...prev, a]);
    if (vetFilter !== "all" && vetFilter !== a.vet) setVetFilter("all");
    setFresh(a.id);
    window.setTimeout(() => setFresh(null), 6000);
    window.setTimeout(
      () => document.getElementById(`appt-${a.id}`)?.scrollIntoView({ block: "center", behavior: "smooth" }),
      100
    );
    toast.success(`Booked ${patientOf(a).name} with ${vetOf(a).name}`, {
      description: `Today at ${a.start}, ${a.minutes} minutes`,
    });
  }

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Today&rsquo;s schedule</h1>
          <p className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
            <CalendarDays className="size-4" aria-hidden="true" />
            {formatLongDate(TODAY)}
            <span aria-hidden="true">&middot;</span>
            <Clock className="size-4" aria-hidden="true" />
            <span className="tabular-nums">{toClock(now)} now</span>
          </p>
        </div>
        <Button size="lg" className="h-12 px-5 text-base" onClick={() => setBookOpen(true)}>
          <Plus aria-hidden="true" />
          New appointment
        </Button>
      </div>

      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Waiting" value={count("checked_in")} tone="bg-amber-500" />
        <Stat label="In exam" value={count("in_exam")} tone="bg-sky-500" />
        <Stat label="Still to arrive" value={count("booked")} tone="bg-slate-400" />
        <Stat label="Done" value={count("done")} suffix={`of ${activeTotal}`} tone="bg-emerald-500" />
      </dl>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <aside aria-label="Waiting room and arrivals" className="grid gap-4 xl:sticky xl:top-24 xl:order-2">
          <section aria-labelledby="waiting-heading" className="rounded-xl border bg-card shadow-xs">
            <div className="flex items-center justify-between gap-2 border-b px-4 py-3">
              <h2 id="waiting-heading" className="flex items-center gap-2 font-semibold">
                <Hourglass className="size-4 text-amber-600" aria-hidden="true" />
                Waiting room
              </h2>
              <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-sm font-semibold text-amber-950 tabular-nums dark:bg-amber-500/20 dark:text-amber-100">
                {waiting.length}
              </span>
            </div>
            {waiting.length === 0 ? (
              <p className="px-4 py-6 text-sm text-muted-foreground">Nobody is waiting right now.</p>
            ) : (
              <ol className="divide-y">
                {waiting.map((a, i) => {
                  const p = patientOf(a);
                  const mins = Math.max(0, now - (arrivals[a.id] ?? now));
                  const long = mins >= LONG_WAIT;
                  return (
                    <li key={a.id} className="grid gap-2 px-4 py-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="flex items-baseline gap-2">
                            <span className="text-xs font-medium text-muted-foreground tabular-nums">
                              #{i + 1}
                            </span>
                            <Link
                              href={`/patients/${p.id}`}
                              className="truncate text-base font-semibold underline-offset-4 hover:underline focus-visible:underline"
                            >
                              {p.name}
                            </Link>
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {vetOf(a).name} &middot; booked {a.start}
                          </p>
                        </div>
                        <div
                          className={cn(
                            "shrink-0 rounded-lg px-2.5 py-1 text-right",
                            long
                              ? "bg-amber-100 text-amber-950 dark:bg-amber-500/20 dark:text-amber-100"
                              : "bg-muted"
                          )}
                        >
                          <p className="text-lg leading-none font-semibold tabular-nums">{mins} min</p>
                          <p className="mt-0.5 text-[11px] leading-none">
                            since {toClock(arrivals[a.id] ?? now)}
                          </p>
                        </div>
                      </div>
                      <AlertChips alerts={p.alerts} />
                      <Button
                        variant="secondary"
                        className="h-11 w-full"
                        onClick={() => sendToExam(a)}
                        aria-label={`Send ${p.name} to ${vetOf(a).room}`}
                      >
                        <DoorOpen aria-hidden="true" />
                        Send to {vetOf(a).room}
                      </Button>
                    </li>
                  );
                })}
              </ol>
            )}
          </section>

          <section aria-labelledby="next-heading" className="rounded-xl border bg-card shadow-xs">
            <div className="border-b px-4 py-3">
              <h2 id="next-heading" className="font-semibold">
                Arriving next
              </h2>
            </div>
            {arrivingNext.length === 0 ? (
              <p className="px-4 py-6 text-sm text-muted-foreground">No more arrivals expected.</p>
            ) : (
              <ul className="divide-y">
                {arrivingNext.map((a) => {
                  const p = patientOf(a);
                  return (
                    <li key={a.id} className="grid gap-2 px-4 py-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <Link
                            href={`/patients/${p.id}`}
                            className="text-base font-semibold underline-offset-4 hover:underline focus-visible:underline"
                          >
                            {p.name}
                          </Link>
                          <p className="text-sm text-muted-foreground">
                            {ownerOf(p).name} &middot; {vetOf(a).name}
                          </p>
                        </div>
                        <p className="text-lg font-semibold tabular-nums">{a.start}</p>
                      </div>
                      {a.urgent && <UrgentTag />}
                      <AlertChips alerts={p.alerts} />
                      <Button
                        variant="outline"
                        className="h-11 w-full"
                        onClick={() => checkIn(a)}
                        aria-label={`Check in ${p.name}`}
                      >
                        <LogIn aria-hidden="true" />
                        Check in
                      </Button>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </aside>

        <section aria-labelledby="all-heading" className="min-w-0 xl:order-1">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <h2 id="all-heading" className="text-lg font-semibold">
              All appointments
            </h2>
            <div className="flex items-center gap-2">
              <Switch id="hide-finished" checked={hideFinished} onCheckedChange={setHideFinished} />
              <Label htmlFor="hide-finished" className="text-sm">
                Hide done and cancelled
              </Label>
            </div>
          </div>

          <div role="group" aria-label="Filter by vet" className="mb-3 flex gap-2 overflow-x-auto pb-1">
            <FilterButton active={vetFilter === "all"} onClick={() => setVetFilter("all")}>
              All vets
            </FilterButton>
            {vets.map((v) => (
              <FilterButton key={v.id} active={vetFilter === v.id} onClick={() => setVetFilter(v.id)}>
                {v.name}
                <span className="font-normal opacity-75"> &middot; {v.room}</span>
              </FilterButton>
            ))}
          </div>

          <div className="overflow-hidden rounded-xl border bg-card shadow-xs">
            <div
              aria-hidden="true"
              className="hidden grid-cols-[5rem_minmax(0,1.3fr)_minmax(0,1fr)_7rem_8.5rem] gap-4 border-b bg-muted/50 px-4 py-2 text-xs font-medium tracking-wide text-muted-foreground uppercase lg:grid"
            >
              <span>Time</span>
              <span>Patient and owner</span>
              <span>Reason and vet</span>
              <span>Status</span>
              <span />
            </div>
            {visible.length === 0 ? (
              <p className="px-4 py-10 text-center text-sm text-muted-foreground">
                No appointments match this filter.
              </p>
            ) : (
              <ul>
                {visible.map((a) => (
                  <AppointmentRow
                    key={a.id}
                    a={a}
                    now={now}
                    isNew={fresh === a.id}
                    onCheckIn={() => checkIn(a)}
                    onExam={() => sendToExam(a)}
                    onDone={() => markDone(a)}
                  />
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>

      <BookDialog open={bookOpen} onOpenChange={setBookOpen} appts={appts} now={now} onBook={handleBook} />
    </div>
  );
}

function Stat({
  label,
  value,
  suffix,
  tone,
}: {
  label: string;
  value: number;
  suffix?: string;
  tone: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-4 shadow-xs">
      <dt className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className={cn("size-2.5 rounded-full", tone)} aria-hidden="true" />
        {label}
      </dt>
      <dd className="mt-1 flex items-baseline gap-2">
        <span className="text-3xl font-semibold tabular-nums">{value}</span>
        {suffix && <span className="text-sm text-muted-foreground">{suffix}</span>}
      </dd>
    </div>
  );
}

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Button
      type="button"
      variant={active ? "default" : "outline"}
      aria-pressed={active}
      onClick={onClick}
      className="h-11 shrink-0 px-4"
    >
      {children}
    </Button>
  );
}

function UrgentTag() {
  return (
    <span className="inline-flex w-fit items-center gap-1 rounded-md bg-red-600 px-2 py-0.5 text-xs font-bold tracking-wide text-white uppercase">
      <Siren className="size-3.5" aria-hidden="true" />
      Urgent
    </span>
  );
}

function AppointmentRow({
  a,
  now,
  isNew,
  onCheckIn,
  onExam,
  onDone,
}: {
  a: Appointment;
  now: number;
  isNew: boolean;
  onCheckIn: () => void;
  onExam: () => void;
  onDone: () => void;
}) {
  const p = patientOf(a);
  const owner = ownerOf(p);
  const vet = vetOf(a);
  const finished = a.status === "done" || a.status === "cancelled";
  const late = a.status === "booked" && toMinutes(a.start) < now;
  const urgentOpen = a.urgent && !finished;

  return (
    <li
      id={`appt-${a.id}`}
      className={cn(
        "grid scroll-mt-28 grid-cols-[4.5rem_minmax(0,1fr)_auto] gap-x-3 gap-y-2 border-b border-l-4 border-l-transparent px-4 py-3.5 last:border-b-0",
        "lg:grid-cols-[5rem_minmax(0,1.3fr)_minmax(0,1fr)_7rem_8.5rem] lg:items-center lg:gap-x-4 lg:gap-y-0",
        urgentOpen && "border-l-red-600 bg-red-50 dark:bg-red-950/30",
        finished && "bg-muted/40",
        isNew && "ring-2 ring-primary ring-inset"
      )}
    >
      <div className="col-start-1 row-span-3 row-start-1 lg:col-start-1 lg:row-span-1 lg:row-start-1">
        <p className={cn("text-lg font-semibold tabular-nums", finished && "text-muted-foreground")}>{a.start}</p>
        <p className="text-xs text-muted-foreground tabular-nums">
          {a.minutes} min
          <span className="hidden lg:inline"> &middot; to {endClock(a)}</span>
        </p>
        {late && <p className="mt-1 text-xs font-semibold text-red-700 dark:text-red-300">{now - toMinutes(a.start)} min late</p>}
      </div>

      <div className="col-start-2 row-start-1 min-w-0 lg:col-start-2">
        <p className="flex flex-wrap items-baseline gap-x-2">
          <Link
            href={`/patients/${p.id}`}
            className={cn(
              "text-base font-semibold underline-offset-4 hover:underline focus-visible:underline",
              a.status === "cancelled" && "text-muted-foreground line-through"
            )}
          >
            {p.name}
          </Link>
          <span className="text-sm text-muted-foreground">
            {p.species}, {p.breed}
          </span>
        </p>
        <p className="text-sm text-muted-foreground">Owner: {owner.name}</p>
        <AlertChips alerts={p.alerts} className="mt-1.5" />
      </div>

      <div className="col-start-2 col-span-2 row-start-2 min-w-0 lg:col-span-1 lg:col-start-3 lg:row-start-1">
        <p className={cn("text-sm", finished && "text-muted-foreground")}>{a.reason}</p>
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
          {urgentOpen && <UrgentTag />}
          <span className="text-sm text-muted-foreground">
            {vet.name} &middot; {vet.room}
          </span>
        </div>
      </div>

      <div className="col-start-3 row-start-1 justify-self-end lg:col-start-4 lg:justify-self-start">
        <StatusBadge status={a.status} />
      </div>

      <div className="col-start-2 col-span-2 row-start-3 empty:hidden lg:col-span-1 lg:col-start-5 lg:row-start-1">
        {a.status === "booked" && (
          <Button className="h-11 w-full lg:h-10" onClick={onCheckIn} aria-label={`Check in ${p.name}`}>
            <LogIn aria-hidden="true" />
            Check in
          </Button>
        )}
        {a.status === "checked_in" && (
          <Button variant="secondary" className="h-11 w-full lg:h-10" onClick={onExam} aria-label={`Send ${p.name} to ${vet.room}`}>
            <DoorOpen aria-hidden="true" />
            To exam
          </Button>
        )}
        {a.status === "in_exam" && (
          <Button variant="outline" className="h-11 w-full lg:h-10" onClick={onDone} aria-label={`Mark ${p.name} done`}>
            <CircleCheck aria-hidden="true" />
            Mark done
          </Button>
        )}
      </div>
    </li>
  );
}
```

```tsx app/page.tsx
import { AppShell } from "@/components/app-shell";
import { ScheduleBoard } from "@/components/schedule-board";

export default function Page() {
  return (
    <AppShell>
      <ScheduleBoard />
    </AppShell>
  );
}
```

```tsx app/patients/[id]/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CalendarDays,
  ChevronLeft,
  CircleCheck,
  Pill,
  Phone,
  PawPrint,
  Scale,
  Stethoscope,
  Syringe,
  TriangleAlert,
  TrendingDown,
} from "lucide-react";
import { AlertBanner } from "@/components/alerts";
import { AppShell } from "@/components/app-shell";
import { StatusBadge } from "@/components/status-badge";
import { WeightChart } from "@/components/weight-chart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  TODAY,
  ageLabel,
  appointments,
  endClock,
  formatDate,
  formatUsd,
  getPatient,
  getVet,
  ownerOf,
  patients,
  records,
  vaccinationState,
  vets,
  type PatientRecord,
} from "@/lib/data";
import { cn } from "@/lib/utils";

type Props = { params: Promise<{ id: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return patients.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const patient = getPatient(id);
  return { title: patient ? `${patient.name} · Pawpoint` : "Patient · Pawpoint" };
}

export default async function PatientPage({ params }: Props) {
  const { id } = await params;
  const patient = getPatient(id);
  if (!patient) notFound();

  const owner = ownerOf(patient);
  const record: PatientRecord | undefined = records[id];
  const todays = appointments
    .filter((a) => a.patient === id)
    .sort((a, b) => a.start.localeCompare(b.start));

  const vaccines = record
    ? record.vaccinations.map((v) => ({ ...v, state: vaccinationState(v.due) }))
    : [];
  const overdue = vaccines.filter((v) => v.state.kind === "overdue");

  const weights = record?.weights_kg ?? [];
  const firstW = weights[0];
  const lastW = weights[weights.length - 1];
  const delta = firstW && lastW ? lastW.kg - firstW.kg : 0;
  const pct = firstW ? (delta / firstW.kg) * 100 : 0;

  return (
    <AppShell>
      <div className="grid gap-6">
        <Link
          href="/"
          className="inline-flex min-h-11 w-fit items-center gap-1 rounded-md pr-2 text-sm font-medium text-muted-foreground hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
          Today&rsquo;s schedule
        </Link>

        <header className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground">
              <PawPrint className="size-8" aria-hidden="true" />
            </span>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">{patient.name}</h1>
              <p className="text-muted-foreground">
                {patient.breed} &middot; {patient.species} &middot; {ageLabel(patient.born)} &middot; {patient.sex}
              </p>
            </div>
          </div>
          <a
            href={`tel:${owner.phone.replace(/\s+/g, "")}`}
            className="inline-flex h-12 items-center gap-3 rounded-lg border bg-card px-4 shadow-xs hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
          >
            <Phone className="size-5 text-primary" aria-hidden="true" />
            <span className="leading-tight">
              <span className="block text-xs text-muted-foreground">Owner &middot; {owner.name}</span>
              <span className="block font-semibold tabular-nums">{owner.phone}</span>
            </span>
          </a>
        </header>

        <AlertBanner name={patient.name} alerts={patient.alerts} />

        {overdue.length > 0 && (
          <section
            aria-labelledby="overdue-heading"
            className="flex items-start gap-3 rounded-xl border border-amber-400 bg-amber-50 p-4 text-amber-950 dark:border-amber-600 dark:bg-amber-950/30 dark:text-amber-100"
          >
            <Syringe className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
            <div>
              <h2 id="overdue-heading" className="font-semibold">
                {overdue.length} {overdue.length === 1 ? "vaccination is" : "vaccinations are"} overdue
              </h2>
              <p className="text-sm">
                {overdue.map((v) => `${v.name} (${v.state.label.toLowerCase()})`).join(", ")}
              </p>
            </div>
          </section>
        )}

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="grid min-w-0 gap-6">
            {record ? (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Syringe className="size-5 text-primary" aria-hidden="true" />
                      Vaccinations
                    </CardTitle>
                    <CardDescription>Checked against today, {formatDate(TODAY)}.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="grid gap-2">
                      {vaccines.map((v) => (
                        <li
                          key={v.name}
                          className={cn(
                            "flex flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-lg border p-3",
                            v.state.kind === "overdue" &&
                              "border-red-400 bg-red-50 dark:border-red-700 dark:bg-red-950/30",
                            v.state.kind === "soon" &&
                              "border-amber-400 bg-amber-50 dark:border-amber-700 dark:bg-amber-950/30"
                          )}
                        >
                          <div>
                            <p className="font-semibold">{v.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Given {formatDate(v.given)} &middot; due {formatDate(v.due)}
                            </p>
                          </div>
                          {v.state.kind === "overdue" ? (
                            <span className="inline-flex items-center gap-1.5 rounded-md bg-red-600 px-2.5 py-1 text-sm font-semibold text-white">
                              <TriangleAlert className="size-4" aria-hidden="true" />
                              {v.state.label}
                            </span>
                          ) : v.state.kind === "soon" ? (
                            <span className="inline-flex items-center gap-1.5 rounded-md bg-amber-200 px-2.5 py-1 text-sm font-semibold text-amber-950">
                              {v.state.label}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-800 dark:text-emerald-300">
                              <CircleCheck className="size-4" aria-hidden="true" />
                              {v.state.label}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Scale className="size-5 text-primary" aria-hidden="true" />
                      Weight trend
                    </CardTitle>
                    <CardDescription>
                      {weights.length} visits, {formatDate(firstW.date)} to {formatDate(lastW.date)}, in kilograms.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-4">
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                      <p>
                        <span className="text-3xl font-semibold tabular-nums">{lastW.kg.toFixed(1)}</span>
                        <span className="ml-1 text-muted-foreground">kg today</span>
                      </p>
                      <p className="flex items-center gap-1.5 text-sm font-medium">
                        <TrendingDown className="size-4 text-amber-700" aria-hidden="true" />
                        <span className="tabular-nums">
                          {delta.toFixed(1)} kg ({pct.toFixed(0)}%) since {formatDate(firstW.date)}
                        </span>
                      </p>
                    </div>
                    <WeightChart points={weights} name={patient.name} />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Stethoscope className="size-5 text-primary" aria-hidden="true" />
                      Visit history
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ol className="grid gap-4">
                      {record.visits.map((v) => (
                        <li key={v.date} className="grid gap-1 border-l-2 border-primary/40 pl-4">
                          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                            <p className="font-semibold">
                              {formatDate(v.date)}
                              <span className="font-normal text-muted-foreground"> &middot; {v.reason}</span>
                            </p>
                            <p className="text-sm text-muted-foreground tabular-nums">
                              {getVet(v.vet)?.name} &middot; {formatUsd(v.invoice_usd)}
                            </p>
                          </div>
                          <p className="text-sm leading-relaxed">{v.notes}</p>
                        </li>
                      ))}
                    </ol>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>No detailed history on file</CardTitle>
                  <CardDescription>
                    Vaccinations, weights, medications and visit notes for {patient.name} have not been loaded
                    in this workspace yet.
                  </CardDescription>
                </CardHeader>
              </Card>
            )}
          </div>

          <div className="grid min-w-0 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Patient and owner</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
                  <Detail label="Species" value={patient.species} />
                  <Detail label="Breed" value={patient.breed} />
                  <Detail label="Born" value={`${formatDate(patient.born)} (${ageLabel(patient.born)})`} />
                  <Detail label="Sex" value={patient.sex} />
                  <Detail label="Patient ID" value={patient.id} />
                  <Detail label="Owner" value={owner.name} />
                  <Detail label="Phone" value={owner.phone} />
                </dl>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarDays className="size-5 text-primary" aria-hidden="true" />
                  Today
                </CardTitle>
                <CardDescription>{formatDate(TODAY)}</CardDescription>
              </CardHeader>
              <CardContent>
                {todays.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No appointments today.</p>
                ) : (
                  <ul className="grid gap-3">
                    {todays.map((a) => (
                      <li key={a.id} className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium tabular-nums">
                            {a.start} to {endClock(a)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {a.reason} &middot; {vets.find((v) => v.id === a.vet)?.name}
                          </p>
                        </div>
                        <StatusBadge status={a.status} />
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            {record && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Pill className="size-5 text-primary" aria-hidden="true" />
                    Current medications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="grid gap-3">
                    {record.medications.map((m) => (
                      <li key={m.name} className="rounded-lg border p-3">
                        <p className="font-semibold">{m.name}</p>
                        <p className="text-sm">{m.dose}</p>
                        <p className="text-xs text-muted-foreground">Since {formatDate(m.since)}</p>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </>
  );
}
```

```tsx app/layout.tsx
import "./globals.css";

import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "Pawpoint · Hillside Veterinary Clinic",
  description: "Front-desk and records software for Hillside Veterinary Clinic",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
```

```css app/globals.css
@import "tailwindcss";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

@theme inline {
  --radius-sm: calc(var(--radius) * 0.6);
  --radius-md: calc(var(--radius) * 0.8);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) * 1.4);
  --radius-2xl: calc(var(--radius) * 1.8);
  --radius-3xl: calc(var(--radius) * 2.2);
  --radius-4xl: calc(var(--radius) * 2.6);
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);
  --color-sidebar: var(--sidebar);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-ring: var(--sidebar-ring);
}

:root {
  --radius: 0.625rem;
  --background: oklch(0.982 0.005 190);
  --foreground: oklch(0.2 0.02 220);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.2 0.02 220);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.2 0.02 220);
  --primary: oklch(0.42 0.085 200);
  --primary-foreground: oklch(0.985 0.005 190);
  --secondary: oklch(0.955 0.015 195);
  --secondary-foreground: oklch(0.28 0.05 205);
  --muted: oklch(0.953 0.008 200);
  --muted-foreground: oklch(0.47 0.02 215);
  --accent: oklch(0.94 0.025 195);
  --accent-foreground: oklch(0.28 0.05 205);
  --destructive: oklch(0.577 0.245 27.325);
  --border: oklch(0.9 0.01 200);
  --input: oklch(0.86 0.012 200);
  --ring: oklch(0.55 0.09 200);
  --chart-1: oklch(0.646 0.222 41.116);
  --chart-2: oklch(0.6 0.118 184.704);
  --chart-3: oklch(0.398 0.07 227.392);
  --chart-4: oklch(0.828 0.189 84.429);
  --chart-5: oklch(0.769 0.188 70.08);
  --sidebar: oklch(0.985 0 0);
  --sidebar-foreground: oklch(0.145 0 0);
  --sidebar-primary: oklch(0.42 0.085 200);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.97 0 0);
  --sidebar-accent-foreground: oklch(0.205 0 0);
  --sidebar-border: oklch(0.922 0 0);
  --sidebar-ring: oklch(0.708 0 0);
}

.dark {
  --background: oklch(0.17 0.015 220);
  --foreground: oklch(0.975 0.005 200);
  --card: oklch(0.22 0.018 220);
  --card-foreground: oklch(0.975 0.005 200);
  --popover: oklch(0.22 0.018 220);
  --popover-foreground: oklch(0.975 0.005 200);
  --primary: oklch(0.78 0.1 195);
  --primary-foreground: oklch(0.2 0.03 220);
  --secondary: oklch(0.3 0.03 215);
  --secondary-foreground: oklch(0.975 0.005 200);
  --muted: oklch(0.28 0.02 220);
  --muted-foreground: oklch(0.74 0.02 210);
  --accent: oklch(0.3 0.03 215);
  --accent-foreground: oklch(0.975 0.005 200);
  --destructive: oklch(0.704 0.191 22.216);
  --border: oklch(1 0 0 / 10%);
  --input: oklch(1 0 0 / 15%);
  --ring: oklch(0.65 0.08 200);
  --chart-1: oklch(0.488 0.243 264.376);
  --chart-2: oklch(0.696 0.17 162.48);
  --chart-3: oklch(0.769 0.188 70.08);
  --chart-4: oklch(0.627 0.265 303.9);
  --chart-5: oklch(0.645 0.246 16.439);
  --sidebar: oklch(0.205 0 0);
  --sidebar-foreground: oklch(0.985 0 0);
  --sidebar-primary: oklch(0.488 0.243 264.376);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.269 0 0);
  --sidebar-accent-foreground: oklch(0.985 0 0);
  --sidebar-border: oklch(1 0 0 / 10%);
  --sidebar-ring: oklch(0.556 0 0);
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
  }
  @media (prefers-reduced-motion: reduce) {
    html {
      scroll-behavior: auto;
    }
    *,
    ::before,
    ::after {
      animation-duration: 0.01ms !important;
      transition-duration: 0.01ms !important;
    }
  }
}
```
