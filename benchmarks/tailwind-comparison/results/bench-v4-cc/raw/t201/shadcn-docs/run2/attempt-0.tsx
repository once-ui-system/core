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
  /** Minutes since midnight when the patient was checked in. */
  checkedInAt?: number;
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

export const clinic = "Pawpoint";
export const clinicTagline = "Hillside Veterinary Clinic";
export const today = "2026-11-12";
/** The simulated clock when the page first opens (minutes since midnight): 09:52. */
export const openingClock = 9 * 60 + 52;

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

export function getPatient(id: string): Patient | undefined {
  return patients.find((p) => p.id === id);
}
export function getOwner(id: string): Owner | undefined {
  return owners.find((o) => o.id === id);
}
export function getVet(id: string): Vet | undefined {
  return vets.find((v) => v.id === id);
}

export function toMin(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}
export function fromMin(total: number): string {
  const h = Math.floor(total / 60);
  const m = Math.floor(total % 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
export function endTime(a: { start: string; minutes: number }): string {
  return fromMin(toMin(a.start) + a.minutes);
}

function utc(iso: string): number {
  return new Date(`${iso}T00:00:00Z`).getTime();
}
export function daysBetween(fromIso: string, toIso: string): number {
  return Math.round((utc(toIso) - utc(fromIso)) / 86400000);
}
export function formatDate(
  iso: string,
  opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" },
): string {
  return new Intl.DateTimeFormat("en-US", { ...opts, timeZone: "UTC" }).format(new Date(`${iso}T00:00:00Z`));
}
export function ageText(born: string, on: string = today): string {
  const b = new Date(`${born}T00:00:00Z`);
  const t = new Date(`${on}T00:00:00Z`);
  let months = (t.getUTCFullYear() - b.getUTCFullYear()) * 12 + (t.getUTCMonth() - b.getUTCMonth());
  if (t.getUTCDate() < b.getUTCDate()) months -= 1;
  const y = Math.floor(months / 12);
  const m = months % 12;
  const parts: string[] = [];
  if (y > 0) parts.push(`${y} ${y === 1 ? "year" : "years"}`);
  if (m > 0 || y === 0) parts.push(`${m} ${m === 1 ? "month" : "months"}`);
  return parts.join(" ");
}

/** Two appointments for the same vet clash when their time ranges overlap. */
export function findClash(
  appts: Appointment[],
  vetId: string,
  start: number,
  minutes: number,
): Appointment | undefined {
  return appts.find((a) => {
    if (a.vet !== vetId || a.status === "cancelled") return false;
    const s = toMin(a.start);
    return start < s + a.minutes && s < start + minutes;
  });
}
```

```tsx components/alert-badges.tsx
import { TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";

/** Medical alerts: solid red pills that read as warnings in every place a patient appears. */
export function AlertBadges({
  alerts,
  className,
  size = "sm",
}: {
  alerts: string[];
  className?: string;
  size?: "sm" | "md";
}) {
  if (alerts.length === 0) return null;
  return (
    <ul
      aria-label={alerts.length === 1 ? "Medical alert" : "Medical alerts"}
      className={cn("flex flex-wrap gap-1.5", className)}
    >
      {alerts.map((alert) => (
        <li
          key={alert}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md bg-red-600 font-semibold text-white shadow-xs ring-1 ring-red-700/40",
            size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-sm",
          )}
        >
          <TriangleAlert aria-hidden className={size === "sm" ? "size-3.5 shrink-0" : "size-4 shrink-0"} />
          <span className="sr-only">Alert: </span>
          {alert}
        </li>
      ))}
    </ul>
  );
}
```

```tsx components/app-shell.tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { PawPrint, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { AlertBadges } from "@/components/alert-badges";
import { clinic, clinicTagline, getOwner, patients, user } from "@/lib/data";

function PatientSearch() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const term = q.trim().toLowerCase();

  const results = useMemo(() => {
    if (!term) return [];
    return patients.filter((p) => {
      const owner = getOwner(p.owner);
      return p.name.toLowerCase().includes(term) || (owner?.name.toLowerCase().includes(term) ?? false);
    });
  }, [term]);

  return (
    <div
      className="relative w-full sm:max-w-md"
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setQ("");
      }}
    >
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          if (results[0]) {
            router.push(`/patients/${results[0].id}`);
            setQ("");
          }
        }}
      >
        <label htmlFor="patient-search" className="sr-only">
          Find a patient or owner by name
        </label>
        <Search aria-hidden className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id="patient-search"
          type="search"
          autoComplete="off"
          placeholder="Find a patient or owner"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setQ("");
          }}
          className="h-11 bg-background pr-10 pl-9 text-base"
        />
        {q && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => setQ("")}
            className="absolute top-1/2 right-1.5 flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-accent"
          >
            <X aria-hidden className="size-4" />
          </button>
        )}
      </form>
      <p className="sr-only" role="status">
        {term ? `${results.length} ${results.length === 1 ? "match" : "matches"}` : ""}
      </p>
      {term && (
        <div className="absolute inset-x-0 top-full z-40 mt-1.5 overflow-hidden rounded-lg border bg-popover text-popover-foreground shadow-lg">
          {results.length === 0 ? (
            <p className="px-4 py-3 text-sm text-muted-foreground">No patient or owner matches “{q.trim()}”.</p>
          ) : (
            <ul className="max-h-[60vh] divide-y overflow-y-auto">
              {results.map((p) => {
                const owner = getOwner(p.owner);
                return (
                  <li key={p.id}>
                    <Link
                      href={`/patients/${p.id}`}
                      onClick={() => setQ("")}
                      className="flex flex-col gap-1.5 px-4 py-3 outline-none hover:bg-accent focus-visible:bg-accent"
                    >
                      <span className="flex items-baseline justify-between gap-3">
                        <span className="font-medium">{p.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {p.species} · {p.breed}
                        </span>
                      </span>
                      <span className="text-sm text-muted-foreground">Owner: {owner?.name}</span>
                      <AlertBadges alerts={p.alerts} />
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

export function AppShell({ children }: { children: React.ReactNode }) {
  const initials = user.name
    .split(" ")
    .map((w) => w[0])
    .join("");
  return (
    <div className="min-h-screen bg-muted/40">
      <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5 rounded-md outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50">
            <span className="flex size-10 items-center justify-center rounded-xl bg-teal-700 text-white">
              <PawPrint aria-hidden className="size-5" />
            </span>
            <span className="leading-tight">
              <span className="block text-base font-semibold tracking-tight">{clinic}</span>
              <span className="block text-xs text-muted-foreground">{clinicTagline}</span>
            </span>
          </Link>
          <div className="order-last w-full sm:order-none sm:ml-auto sm:w-auto sm:flex-1 sm:max-w-md">
            <PatientSearch />
          </div>
          <div className="ml-auto flex items-center gap-3 sm:ml-0">
            <div className="hidden text-right leading-tight md:block">
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.role}</p>
            </div>
            <span
              aria-label={`${user.name}, ${user.role}`}
              role="img"
              className="flex size-10 items-center justify-center rounded-full bg-teal-100 text-sm font-semibold text-teal-900 dark:bg-teal-900 dark:text-teal-100"
            >
              {initials}
            </span>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-7">{children}</main>
    </div>
  );
}
```

```tsx components/book-dialog.tsx
"use client";

import { useMemo, useState } from "react";
import { CalendarPlus, CircleAlert } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertBadges } from "@/components/alert-badges";
import { type Appointment, endTime, findClash, fromMin, getOwner, getPatient, getVet, patients, toMin, vets } from "@/lib/data";

const SLOTS: number[] = [];
for (let m = 8 * 60; m <= 16 * 60 + 45; m += 15) SLOTS.push(m);
const DURATIONS = [15, 20, 30, 45, 60];

export function BookDialog({
  open,
  onOpenChange,
  appointments,
  nowMin,
  onBook,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointments: Appointment[];
  nowMin: number;
  onBook: (draft: Omit<Appointment, "id" | "status">) => void;
}) {
  const [patientId, setPatientId] = useState("");
  const [vetId, setVetId] = useState("");
  const [minutes, setMinutes] = useState("20");
  const [time, setTime] = useState("");
  const [reason, setReason] = useState("");

  const patient = getPatient(patientId);
  const dur = Number(minutes);

  const slotState = useMemo(() => {
    const map = new Map<number, string | null>();
    for (const m of SLOTS) {
      if (m + 1 <= nowMin) {
        map.set(m, "passed");
      } else if (vetId && findClash(appointments, vetId, m, dur)) {
        map.set(m, "taken");
      } else {
        map.set(m, null);
      }
    }
    return map;
  }, [appointments, vetId, dur, nowMin]);

  const chosen = time ? toMin(time) : null;
  const clash = chosen !== null && vetId ? findClash(appointments, vetId, chosen, dur) : undefined;
  const pastChosen = chosen !== null && chosen <= nowMin;
  const complete = Boolean(patientId && vetId && time && reason.trim());
  const canSubmit = complete && !clash && !pastChosen;

  function reset() {
    setPatientId("");
    setVetId("");
    setMinutes("20");
    setTime("");
    setReason("");
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) reset();
        onOpenChange(o);
      }}
    >
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Book an appointment</DialogTitle>
          <DialogDescription>Pick the patient, the vet and a free time. Taken times are disabled.</DialogDescription>
        </DialogHeader>
        <form
          className="grid gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!canSubmit) return;
            onBook({ patient: patientId, vet: vetId, start: time, minutes: dur, reason: reason.trim() });
            reset();
          }}
        >
          <div className="grid gap-2">
            <Label htmlFor="book-patient">Patient</Label>
            <Select value={patientId} onValueChange={setPatientId}>
              <SelectTrigger id="book-patient" className="h-11 w-full">
                <SelectValue placeholder="Choose a patient" />
              </SelectTrigger>
              <SelectContent>
                {patients.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name} ({p.species}) · {getOwner(p.owner)?.name}
                    {p.alerts.length > 0 ? " · ALERT" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {patient && patient.alerts.length > 0 && <AlertBadges alerts={patient.alerts} size="md" />}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="book-vet">Vet</Label>
            <Select value={vetId} onValueChange={setVetId}>
              <SelectTrigger id="book-vet" className="h-11 w-full">
                <SelectValue placeholder="Choose a vet" />
              </SelectTrigger>
              <SelectContent>
                {vets.map((v) => (
                  <SelectItem key={v.id} value={v.id}>
                    {v.name} · {v.room}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="book-time">Start time</Label>
              <Select value={time} onValueChange={setTime}>
                <SelectTrigger id="book-time" className="h-11 w-full">
                  <SelectValue placeholder="Time" />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  {SLOTS.map((m) => {
                    const state = slotState.get(m) ?? null;
                    return (
                      <SelectItem key={m} value={fromMin(m)} disabled={state !== null}>
                        {fromMin(m)}
                        {state === "taken" ? " · taken" : state === "passed" ? " · passed" : ""}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="book-duration">Length</Label>
              <Select value={minutes} onValueChange={setMinutes}>
                <SelectTrigger id="book-duration" className="h-11 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DURATIONS.map((d) => (
                    <SelectItem key={d} value={String(d)}>
                      {d} min
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="book-reason">Reason for visit</Label>
            <Input
              id="book-reason"
              className="h-11"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Booster vaccination"
              maxLength={80}
            />
          </div>

          {clash && vetId && (
            <p role="alert" className="flex items-start gap-2 rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-100">
              <CircleAlert aria-hidden className="mt-0.5 size-4 shrink-0" />
              <span>
                {getVet(vetId)?.name} already has {getPatient(clash.patient)?.name} from {clash.start} to {endTime(clash)}. Choose another time or vet.
              </span>
            </p>
          )}
          {complete && !clash && !pastChosen && (
            <p className="text-sm text-muted-foreground">
              {patient?.name} with {getVet(vetId)?.name}, {time} to {fromMin(toMin(time) + dur)}.
            </p>
          )}

          <DialogFooter className="gap-2 sm:gap-2">
            <Button type="button" variant="outline" className="h-11" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!canSubmit} className="h-11 bg-teal-700 text-white hover:bg-teal-800">
              <CalendarPlus aria-hidden /> Book appointment
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

```tsx components/schedule.tsx
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { CalendarPlus, Clock, DoorOpen, LogIn, Siren, UserRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertBadges } from "@/components/alert-badges";
import { BookDialog } from "@/components/book-dialog";
import { cn } from "@/lib/utils";
import {
  type Appointment,
  type Status,
  endTime,
  fromMin,
  formatDate,
  getOwner,
  getPatient,
  getVet,
  initialAppointments,
  openingClock,
  statusLabel,
  toMin,
  today,
  vets,
} from "@/lib/data";

const statusStyle: Record<Status, string> = {
  booked: "bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-600",
  checked_in: "bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950 dark:text-amber-100 dark:border-amber-700",
  in_exam: "bg-sky-100 text-sky-900 border-sky-300 dark:bg-sky-950 dark:text-sky-100 dark:border-sky-700",
  done: "bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-100 dark:border-emerald-700",
  cancelled: "bg-muted text-muted-foreground border-border",
};

function StatusBadge({ status }: { status: Status }) {
  return (
    <Badge variant="outline" className={cn("px-2.5 py-1 text-xs font-semibold", statusStyle[status])}>
      {statusLabel[status]}
    </Badge>
  );
}

function waitText(minutes: number): string {
  if (minutes < 1) return "just arrived";
  if (minutes < 60) return `${minutes} min`;
  return `${Math.floor(minutes / 60)} h ${minutes % 60} min`;
}

export function Schedule() {
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const [vetFilter, setVetFilter] = useState<string>("all");
  const [bookOpen, setBookOpen] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const started = Date.now();
    const id = window.setInterval(() => setElapsed(Math.floor((Date.now() - started) / 60000)), 10000);
    return () => window.clearInterval(id);
  }, []);
  const nowMin = openingClock + elapsed;

  const sorted = useMemo(
    () => [...appointments].sort((a, b) => toMin(a.start) - toMin(b.start) || a.vet.localeCompare(b.vet)),
    [appointments],
  );
  const visible = sorted.filter((a) => vetFilter === "all" || a.vet === vetFilter);

  const waiting = useMemo(
    () =>
      appointments
        .filter((a) => a.status === "checked_in")
        .sort((a, b) => (a.checkedInAt ?? 0) - (b.checkedInAt ?? 0)),
    [appointments],
  );

  const counts = {
    booked: appointments.filter((a) => a.status === "booked").length,
    checked_in: waiting.length,
    in_exam: appointments.filter((a) => a.status === "in_exam").length,
    done: appointments.filter((a) => a.status === "done").length,
  };

  function setStatus(id: string, status: Status, extra?: Partial<Appointment>) {
    setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, status, ...extra } : a)));
  }

  function checkIn(a: Appointment) {
    setStatus(a.id, "checked_in", { checkedInAt: nowMin });
    const p = getPatient(a.patient);
    toast.success(`${p?.name} checked in`, {
      description: p && p.alerts.length > 0 ? `Alert: ${p.alerts.join("; ")}` : `Waiting for ${getVet(a.vet)?.name}`,
    });
  }

  function startExam(a: Appointment) {
    setStatus(a.id, "in_exam");
    const p = getPatient(a.patient);
    toast(`${p?.name} sent to ${getVet(a.vet)?.room}`);
  }

  function book(draft: Omit<Appointment, "id" | "status">) {
    const next: Appointment = { ...draft, id: `a-${String(appointments.length + 1).padStart(2, "0")}`, status: "booked" };
    setAppointments((prev) => [...prev, next]);
    setBookOpen(false);
    toast.success(`Booked ${getPatient(draft.patient)?.name}`, {
      description: `${getVet(draft.vet)?.name}, ${draft.start} to ${endTime(draft)}`,
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
      <section aria-labelledby="schedule-title" className="min-w-0 space-y-4 lg:order-1">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 id="schedule-title" className="text-2xl font-semibold tracking-tight">
              Today’s schedule
            </h1>
            <p className="text-sm text-muted-foreground">
              {formatDate(today, { weekday: "long", day: "numeric", month: "long", year: "numeric" })} · clock{" "}
              <span className="font-medium text-foreground tabular-nums">{fromMin(nowMin)}</span>
            </p>
          </div>
          <Button size="lg" className="h-11 bg-teal-700 px-5 text-white hover:bg-teal-800" onClick={() => setBookOpen(true)}>
            <CalendarPlus aria-hidden /> Book appointment
          </Button>
        </div>

        <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {(
            [
              ["Still to come", counts.booked],
              ["Waiting", counts.checked_in],
              ["In exam", counts.in_exam],
              ["Done", counts.done],
            ] as const
          ).map(([label, n]) => (
            <div key={label} className="rounded-lg border bg-card px-3 py-2.5">
              <dt className="text-xs text-muted-foreground">{label}</dt>
              <dd className="text-2xl font-semibold tabular-nums">{n}</dd>
            </div>
          ))}
        </dl>

        <div role="group" aria-label="Filter by vet" className="flex gap-2 overflow-x-auto pb-1">
          {[{ id: "all", name: "All vets" }, ...vets].map((v) => {
            const active = vetFilter === v.id;
            return (
              <button
                key={v.id}
                type="button"
                aria-pressed={active}
                onClick={() => setVetFilter(v.id)}
                className={cn(
                  "h-10 shrink-0 rounded-full border px-4 text-sm font-medium outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50",
                  active ? "border-teal-700 bg-teal-700 text-white" : "bg-card hover:bg-accent",
                )}
              >
                {v.name}
              </button>
            );
          })}
        </div>

        <ol className="space-y-2.5" aria-label="Appointments">
          {visible.map((a) => {
            const p = getPatient(a.patient);
            const owner = p ? getOwner(p.owner) : undefined;
            const vet = getVet(a.vet);
            const cancelled = a.status === "cancelled";
            return (
              <li
                key={a.id}
                className={cn(
                  "rounded-xl border bg-card p-3.5 shadow-xs sm:p-4",
                  a.urgent && !cancelled && a.status !== "done" && "border-red-500 bg-red-50 ring-1 ring-red-500/60 dark:bg-red-950/40",
                  cancelled && "opacity-70",
                )}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                  <div className="flex shrink-0 items-baseline gap-2 sm:w-24 sm:flex-col sm:gap-0">
                    <p className="text-xl font-semibold tabular-nums">{a.start}</p>
                    <p className="text-xs text-muted-foreground tabular-nums">
                      to {endTime(a)} · {a.minutes} min
                    </p>
                  </div>

                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      {p ? (
                        <Link
                          href={`/patients/${p.id}`}
                          className={cn(
                            "rounded-sm text-base font-semibold underline-offset-4 outline-none hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/50",
                            cancelled && "line-through",
                          )}
                        >
                          {p.name}
                        </Link>
                      ) : null}
                      <span className="text-sm text-muted-foreground">
                        {p?.species}, {p?.breed}
                      </span>
                      {a.urgent && !cancelled && (
                        <Badge className="gap-1 bg-red-600 px-2 text-xs font-bold tracking-wide text-white uppercase">
                          <Siren aria-hidden /> Urgent
                        </Badge>
                      )}
                    </div>
                    <p className={cn("text-sm", cancelled && "line-through")}>{a.reason}</p>
                    <p className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-sm text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <UserRound aria-hidden className="size-3.5" /> {owner?.name}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <DoorOpen aria-hidden className="size-3.5" /> {vet?.name} · {vet?.room}
                      </span>
                    </p>
                    {p && <AlertBadges alerts={p.alerts} />}
                  </div>

                  <div className="flex items-center justify-between gap-3 sm:w-36 sm:flex-col sm:items-end">
                    <StatusBadge status={a.status} />
                    {a.status === "booked" && (
                      <Button
                        className="h-11 bg-teal-700 px-4 text-white hover:bg-teal-800"
                        onClick={() => checkIn(a)}
                        aria-label={`Check in ${p?.name}`}
                      >
                        <LogIn aria-hidden /> Check in
                      </Button>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
          {visible.length === 0 && <li className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">No appointments for this vet.</li>}
        </ol>
      </section>

      <aside aria-labelledby="waiting-title" className="lg:sticky lg:top-28 lg:order-2">
        <div className="rounded-xl border bg-card shadow-xs">
          <div className="flex items-center justify-between gap-2 border-b px-4 py-3">
            <h2 id="waiting-title" className="text-base font-semibold">
              Waiting room
            </h2>
            <Badge variant="secondary" className="tabular-nums">
              {waiting.length} waiting
            </Badge>
          </div>
          {waiting.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">Nobody is waiting. Check patients in as they arrive.</p>
          ) : (
            <ol className="divide-y">
              {waiting.map((a, i) => {
                const p = getPatient(a.patient);
                const vet = getVet(a.vet);
                const waited = Math.max(0, nowMin - (a.checkedInAt ?? nowMin));
                const long = waited >= 20;
                return (
                  <li key={a.id} className="space-y-2 px-4 py-3.5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="flex flex-wrap items-center gap-2">
                          <Link
                            href={`/patients/${a.patient}`}
                            className="rounded-sm font-semibold underline-offset-4 hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
                          >
                            {p?.name}
                          </Link>
                          {i === 0 && <Badge className="bg-teal-700 text-white">Next</Badge>}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {a.reason} · {vet?.name}
                        </p>
                      </div>
                      <p
                        className={cn(
                          "flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-sm font-semibold tabular-nums",
                          long ? "bg-red-100 text-red-900 dark:bg-red-950 dark:text-red-100" : "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-100",
                        )}
                      >
                        <Clock aria-hidden className="size-3.5" />
                        <span className="sr-only">Waiting </span>
                        {waitText(waited)}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground tabular-nums">
                      Arrived {fromMin(a.checkedInAt ?? nowMin)} · booked {a.start}
                    </p>
                    {p && <AlertBadges alerts={p.alerts} />}
                    <Button variant="outline" className="h-10 w-full" onClick={() => startExam(a)}>
                      Send to {vet?.room}
                    </Button>
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      </aside>

      <BookDialog open={bookOpen} onOpenChange={setBookOpen} appointments={appointments} nowMin={nowMin} onBook={book} />
    </div>
  );
}
```

```tsx app/page.tsx
import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";
import { Schedule } from "@/components/schedule";

export const metadata: Metadata = { title: "Today’s schedule · Pawpoint" };

export default function Page() {
  return (
    <AppShell>
      <Schedule />
    </AppShell>
  );
}
```

```tsx components/weight-chart.tsx
import { formatDate } from "@/lib/data";

export function WeightChart({ points }: { points: { date: string; kg: number }[] }) {
  const W = 640;
  const H = 240;
  const pad = { l: 44, r: 28, t: 28, b: 38 };
  const times = points.map((p) => new Date(`${p.date}T00:00:00Z`).getTime());
  const t0 = Math.min(...times);
  const t1 = Math.max(...times);
  const kgs = points.map((p) => p.kg);
  const lo = Math.floor(Math.min(...kgs) - 0.6);
  const hi = Math.ceil(Math.max(...kgs) + 0.4);
  const x = (t: number) => pad.l + ((t - t0) / (t1 - t0 || 1)) * (W - pad.l - pad.r);
  const y = (kg: number) => pad.t + (1 - (kg - lo) / (hi - lo || 1)) * (H - pad.t - pad.b);
  const ticks: number[] = [];
  for (let v = lo; v <= hi; v += 1) ticks.push(v);
  const path = points.map((p, i) => `${i === 0 ? "M" : "L"}${x(times[i]).toFixed(1)} ${y(p.kg).toFixed(1)}`).join(" ");
  const first = points[0];
  const last = points[points.length - 1];
  const summary = `Weight in kilograms over ${points.length} visits: ${points
    .map((p) => `${formatDate(p.date, { month: "short", year: "numeric" })} ${p.kg}`)
    .join(", ")}.`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={summary} className="h-auto w-full text-foreground">
      {ticks.map((v) => (
        <g key={v}>
          <line x1={pad.l} x2={W - pad.r} y1={y(v)} y2={y(v)} className="stroke-border" strokeWidth={1} />
          <text x={pad.l - 8} y={y(v) + 4} textAnchor="end" className="fill-muted-foreground text-[11px]">
            {v}
          </text>
        </g>
      ))}
      <path d={path} fill="none" className="stroke-teal-700 dark:stroke-teal-400" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
      {points.map((p, i) => {
        const isLast = p === last;
        const anchor = p === first ? "start" : isLast ? "end" : "middle";
        return (
          <g key={p.date}>
            <circle cx={x(times[i])} cy={y(p.kg)} r={isLast ? 6 : 4.5} className={isLast ? "fill-teal-700 stroke-background dark:fill-teal-400" : "fill-background stroke-teal-700 dark:stroke-teal-400"} strokeWidth={2.5} />
            <text x={x(times[i])} y={y(p.kg) - 12} textAnchor={anchor} className="fill-foreground text-[12px] font-semibold">
              {p.kg}
            </text>
            <text x={x(times[i])} y={H - 14} textAnchor={anchor} className="fill-muted-foreground text-[11px]">
              {formatDate(p.date, { month: "short", year: "2-digit" })}
            </text>
          </g>
        );
      })}
      <text x={4} y={14} className="fill-muted-foreground text-[11px]">
        kg
      </text>
    </svg>
  );
}
```

```tsx app/patients/[id]/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarClock, CircleCheck, Phone, Pill, Syringe, TriangleAlert } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { AlertBadges } from "@/components/alert-badges";
import { WeightChart } from "@/components/weight-chart";
import { Badge } from "@/components/ui/badge";
import {
  ageText,
  daysBetween,
  endTime,
  formatDate,
  getOwner,
  getPatient,
  getVet,
  initialAppointments,
  patients,
  records,
  statusLabel,
  today,
} from "@/lib/data";

export const dynamicParams = false;

export function generateStaticParams() {
  return patients.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const p = getPatient(id);
  return { title: p ? `${p.name} · Pawpoint` : "Patient · Pawpoint" };
}

function Section({ id, title, icon, children }: { id: string; title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section aria-labelledby={id} className="rounded-xl border bg-card p-4 shadow-xs sm:p-5">
      <h2 id={id} className="mb-3 flex items-center gap-2 text-base font-semibold">
        {icon}
        {title}
      </h2>
      {children}
    </section>
  );
}

export default async function PatientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const patient = getPatient(id);
  if (!patient) notFound();
  const owner = getOwner(patient.owner);
  const record = records[patient.id];
  const todays = initialAppointments.filter((a) => a.patient === patient.id).sort((a, b) => a.start.localeCompare(b.start));

  const first = record?.weights_kg[0];
  const last = record?.weights_kg[record.weights_kg.length - 1];
  const delta = first && last ? last.kg - first.kg : 0;
  const pct = first ? (delta / first.kg) * 100 : 0;

  return (
    <AppShell>
      <div className="space-y-5">
        <Link href="/" className="inline-flex h-10 items-center gap-1.5 rounded-md text-sm font-medium text-muted-foreground outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50">
          <ArrowLeft aria-hidden className="size-4" /> Today’s schedule
        </Link>

        <header className="rounded-xl border bg-card p-4 shadow-xs sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">{patient.name}</h1>
              <p className="text-muted-foreground">
                {patient.breed} · {patient.species}
              </p>
            </div>
            {owner && (
              <a
                href={`tel:${owner.phone.replace(/\s/g, "")}`}
                className="inline-flex h-11 items-center gap-2 rounded-md border px-4 text-sm font-medium hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
              >
                <Phone aria-hidden className="size-4" /> Call {owner.name.split(" ")[0]} · {owner.phone}
              </a>
            )}
          </div>

          {patient.alerts.length > 0 && (
            <div role="region" aria-label="Medical alerts" className="mt-4 rounded-lg border-2 border-red-600 bg-red-50 p-3 dark:bg-red-950/50">
              <p className="mb-2 flex items-center gap-2 text-sm font-bold tracking-wide text-red-800 uppercase dark:text-red-200">
                <TriangleAlert aria-hidden className="size-5" /> Medical alerts
              </p>
              <AlertBadges alerts={patient.alerts} size="md" />
            </div>
          )}

          <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-4 text-sm sm:grid-cols-4">
            {[
              ["Age", `${ageText(patient.born)} (born ${formatDate(patient.born)})`],
              ["Sex", patient.sex],
              ["Owner", owner?.name ?? "Not given"],
              ["Owner phone", owner?.phone ?? "Not given"],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="text-xs text-muted-foreground">{k}</dt>
                <dd className="font-medium">{v}</dd>
              </div>
            ))}
          </dl>
        </header>

        {todays.length > 0 && (
          <Section id="today-title" title="Today at the clinic" icon={<CalendarClock aria-hidden className="size-4" />}>
            <ul className="divide-y">
              {todays.map((a) => (
                <li key={a.id} className="flex flex-wrap items-center justify-between gap-2 py-2 first:pt-0 last:pb-0">
                  <span>
                    <span className="font-medium tabular-nums">
                      {a.start} to {endTime(a)}
                    </span>{" "}
                    · {a.reason} · {getVet(a.vet)?.name}
                  </span>
                  <Badge variant="secondary">{statusLabel[a.status]}</Badge>
                </li>
              ))}
            </ul>
          </Section>
        )}

        {!record ? (
          <Section id="no-record" title="Clinical record">
            <p className="text-sm text-muted-foreground">No weights, vaccinations, medications or visit history are on file for {patient.name} in this demo.</p>
          </Section>
        ) : (
          <div className="grid gap-5 lg:grid-cols-2">
            <div className="lg:col-span-2">
              <Section id="weight-title" title="Weight trend">
                <div className="mb-2 flex flex-wrap items-baseline gap-x-4 gap-y-1">
                  <p className="text-3xl font-semibold tabular-nums">{last?.kg} kg</p>
                  <p className="text-sm text-muted-foreground">
                    {delta < 0 ? "Down" : "Up"} {Math.abs(delta).toFixed(1)} kg ({Math.abs(pct).toFixed(0)}%) since {first && formatDate(first.date, { month: "short", year: "numeric" })}, {record.weights_kg.length} visits
                  </p>
                </div>
                <WeightChart points={record.weights_kg} />
              </Section>
            </div>

            <Section id="vax-title" title="Vaccinations" icon={<Syringe aria-hidden className="size-4" />}>
              <ul className="divide-y">
                {record.vaccinations.map((v) => {
                  const overdueBy = daysBetween(v.due, today);
                  const overdue = overdueBy > 0;
                  const soon = !overdue && overdueBy > -30;
                  return (
                    <li key={v.name} className="flex flex-wrap items-center justify-between gap-2 py-3 first:pt-0 last:pb-0">
                      <div>
                        <p className="font-medium">{v.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Given {formatDate(v.given)} · due {formatDate(v.due)}
                        </p>
                      </div>
                      {overdue ? (
                        <Badge className="gap-1 bg-red-600 px-2.5 py-1 text-white">
                          <TriangleAlert aria-hidden /> Overdue {overdueBy} {overdueBy === 1 ? "day" : "days"}
                        </Badge>
                      ) : soon ? (
                        <Badge className="bg-amber-500 px-2.5 py-1 text-amber-950">Due in {-overdueBy} days</Badge>
                      ) : (
                        <Badge variant="outline" className="gap-1 border-emerald-400 px-2.5 py-1 text-emerald-800 dark:text-emerald-300">
                          <CircleCheck aria-hidden /> Up to date
                        </Badge>
                      )}
                    </li>
                  );
                })}
              </ul>
            </Section>

            <Section id="meds-title" title="Current medications" icon={<Pill aria-hidden className="size-4" />}>
              <ul className="divide-y">
                {record.medications.map((m) => (
                  <li key={m.name} className="py-3 first:pt-0 last:pb-0">
                    <p className="font-medium">{m.name}</p>
                    <p className="text-sm">{m.dose}</p>
                    <p className="text-xs text-muted-foreground">Since {formatDate(m.since)}</p>
                  </li>
                ))}
              </ul>
            </Section>

            <div className="lg:col-span-2">
              <Section id="visits-title" title="Visit history">
                <ol className="space-y-4">
                  {record.visits.map((v) => (
                    <li key={v.date} className="grid gap-1 border-l-2 border-teal-700/60 pl-4">
                      <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                        <p className="font-medium">
                          {formatDate(v.date)} · {v.reason}
                        </p>
                        <p className="text-sm text-muted-foreground tabular-nums">${v.invoice_usd.toFixed(2)}</p>
                      </div>
                      <p className="text-sm text-muted-foreground">{getVet(v.vet)?.name}</p>
                      <p className="text-sm">{v.notes}</p>
                    </li>
                  ))}
                </ol>
              </Section>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
```
