```ts lib/data.ts
export const TODAY = "2026-11-12";
export const CLINIC_NAME = "Hillside Veterinary Clinic";
export const USER = { name: "Rosa Lindqvist", role: "Receptionist" };

/** The demo clock starts at 09:40 and ticks forward a minute at a time. */
export const NOW_START = 9 * 60 + 40;
export const OPEN_MIN = 8 * 60;
export const CLOSE_MIN = 17 * 60;

export type Status = "booked" | "checked_in" | "in_exam" | "done" | "cancelled";

export const STATUS_LABEL: Record<Status, string> = {
  booked: "Booked",
  checked_in: "Checked in",
  in_exam: "In exam",
  done: "Done",
  cancelled: "Cancelled",
};

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
  species: "Dog" | "Cat" | "Bird" | "Rabbit";
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

export const VETS: Vet[] = [
  { id: "v-1", name: "Dr. Amara Osei", room: "Exam 1" },
  { id: "v-2", name: "Dr. Tomás Reyes", room: "Exam 2" },
  { id: "v-3", name: "Dr. Helen Park", room: "Surgery" },
];

export const OWNERS: Owner[] = [
  { id: "o-1", name: "Daniel Kim", phone: "+1 555 0142" },
  { id: "o-2", name: "Priya Natarajan", phone: "+1 555 0178" },
  { id: "o-3", name: "Lucas Moreau", phone: "+1 555 0119" },
  { id: "o-4", name: "Grace Whitfield", phone: "+1 555 0163" },
  { id: "o-5", name: "Sam Oduya", phone: "+1 555 0190" },
  { id: "o-6", name: "Elena Rossi", phone: "+1 555 0105" },
];

export const PATIENTS: Patient[] = [
  { id: "p-101", name: "Biscuit", species: "Dog", breed: "Beagle", born: "2019-04-02", sex: "Male, neutered", owner: "o-1", alerts: [] },
  { id: "p-102", name: "Mochi", species: "Cat", breed: "Domestic shorthair", born: "2021-07-15", sex: "Female, spayed", owner: "o-2", alerts: ["Bites when restrained"] },
  { id: "p-103", name: "Pepper", species: "Dog", breed: "Border collie", born: "2016-01-20", sex: "Female, spayed", owner: "o-3", alerts: [] },
  { id: "p-104", name: "Olive", species: "Dog", breed: "Labrador retriever", born: "2014-09-08", sex: "Female, spayed", owner: "o-4", alerts: ["Penicillin allergy", "Chronic kidney disease, stage 2"] },
  { id: "p-105", name: "Kiwi", species: "Bird", breed: "Budgerigar", born: "2023-03-11", sex: "Male", owner: "o-5", alerts: [] },
  { id: "p-106", name: "Tofu", species: "Rabbit", breed: "Holland lop", born: "2022-05-30", sex: "Female", owner: "o-6", alerts: [] },
  { id: "p-107", name: "Ziggy", species: "Cat", breed: "Maine coon", born: "2018-11-02", sex: "Male, neutered", owner: "o-2", alerts: ["Diabetic: insulin twice daily"] },
  { id: "p-108", name: "Bruno", species: "Dog", breed: "French bulldog", born: "2022-02-14", sex: "Male", owner: "o-5", alerts: ["Brachycephalic: sedation risk"] },
];

export const APPOINTMENTS: Appointment[] = [
  { id: "a-01", patient: "p-101", vet: "v-1", start: "08:30", minutes: 20, reason: "Annual vaccination", status: "done" },
  { id: "a-02", patient: "p-104", vet: "v-2", start: "08:30", minutes: 30, reason: "Kidney panel recheck", status: "done" },
  { id: "a-03", patient: "p-108", vet: "v-3", start: "08:00", minutes: 120, reason: "Soft palate surgery", status: "in_exam" },
  { id: "a-04", patient: "p-102", vet: "v-1", start: "09:00", minutes: 30, reason: "Limping, left hind leg", status: "in_exam" },
  { id: "a-05", patient: "p-107", vet: "v-2", start: "09:15", minutes: 20, reason: "Glucose curve", status: "checked_in", checkedInAt: "09:12" },
  { id: "a-06", patient: "p-105", vet: "v-1", start: "09:45", minutes: 20, reason: "Beak and nail trim", status: "checked_in", checkedInAt: "09:34" },
  { id: "a-07", patient: "p-103", vet: "v-2", start: "10:00", minutes: 30, reason: "Senior wellness exam", status: "booked" },
  { id: "a-08", patient: "p-106", vet: "v-1", start: "10:30", minutes: 20, reason: "Not eating since yesterday", status: "booked", urgent: true },
  { id: "a-09", patient: "p-104", vet: "v-3", start: "11:00", minutes: 45, reason: "Dental cleaning", status: "booked" },
  { id: "a-10", patient: "p-101", vet: "v-2", start: "11:30", minutes: 20, reason: "Ear infection follow-up", status: "booked" },
  { id: "a-11", patient: "p-107", vet: "v-1", start: "13:30", minutes: 30, reason: "Dental check", status: "booked" },
  { id: "a-12", patient: "p-103", vet: "v-3", start: "14:00", minutes: 60, reason: "Lump removal", status: "cancelled" },
  { id: "a-13", patient: "p-102", vet: "v-2", start: "15:00", minutes: 20, reason: "X-ray results", status: "booked" },
];

export const RECORDS: Record<string, PatientRecord> = {
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

/* ---------- helpers ---------- */

export function patientById(id: string): Patient {
  const p = PATIENTS.find((x) => x.id === id);
  if (!p) throw new Error(`Unknown patient ${id}`);
  return p;
}
export function ownerById(id: string): Owner {
  const o = OWNERS.find((x) => x.id === id);
  if (!o) throw new Error(`Unknown owner ${id}`);
  return o;
}
export function vetById(id: string): Vet {
  const v = VETS.find((x) => x.id === id);
  if (!v) throw new Error(`Unknown vet ${id}`);
  return v;
}

export function toMin(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}
export function fromMin(total: number): string {
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
export function endTime(a: { start: string; minutes: number }): string {
  return fromMin(toMin(a.start) + a.minutes);
}

/** Every 15 minutes from opening to the last quarter hour before closing. */
export const SLOTS: string[] = (() => {
  const out: string[] = [];
  for (let t = OPEN_MIN; t < CLOSE_MIN; t += 15) out.push(fromMin(t));
  return out;
})();

export const DURATIONS = [15, 20, 30, 45, 60, 90];

/** The existing booking (not cancelled) that overlaps the proposed one for the same vet. */
export function findConflict(
  appts: Appointment[],
  vetId: string,
  start: string,
  minutes: number,
): Appointment | undefined {
  const s = toMin(start);
  const e = s + minutes;
  return appts.find((a) => {
    if (a.vet !== vetId || a.status === "cancelled") return false;
    const as = toMin(a.start);
    const ae = as + a.minutes;
    return s < ae && as < e;
  });
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}
export function formatShortDate(iso: string): string {
  const [y, m] = iso.split("-").map(Number);
  return `${MONTHS[m - 1]} ${String(y).slice(2)}`;
}

export function daysBetween(fromIso: string, toIso: string): number {
  const [fy, fm, fd] = fromIso.split("-").map(Number);
  const [ty, tm, td] = toIso.split("-").map(Number);
  return Math.round((Date.UTC(ty, tm - 1, td) - Date.UTC(fy, fm - 1, fd)) / 86400000);
}

export function ageText(born: string, today: string = TODAY): string {
  const [by, bm, bd] = born.split("-").map(Number);
  const [ty, tm, td] = today.split("-").map(Number);
  let months = (ty - by) * 12 + (tm - bm);
  if (td < bd) months -= 1;
  const years = Math.floor(months / 12);
  const rest = months % 12;
  const y = `${years} ${years === 1 ? "year" : "years"}`;
  const m = `${rest} ${rest === 1 ? "month" : "months"}`;
  if (years === 0) return m;
  return rest === 0 ? y : `${y} ${m}`;
}

export type VaccState = "overdue" | "soon" | "ok";
export function vaccinationState(due: string): { state: VaccState; days: number } {
  const days = daysBetween(TODAY, due);
  if (days < 0) return { state: "overdue", days: -days };
  if (days <= 60) return { state: "soon", days };
  return { state: "ok", days };
}

export function usd(n: number): string {
  return `$${n.toFixed(2)}`;
}
```

```tsx components/pawpoint/alert-chips.tsx
import { TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Medical alerts. Solid red with white text and an icon so they cannot be missed,
 * and never rely on colour alone (icon + the words "Medical alert" for screen readers).
 */
export function AlertChips({
  alerts,
  size = "sm",
  className,
}: {
  alerts: string[];
  size?: "sm" | "lg";
  className?: string;
}) {
  if (alerts.length === 0) return null;
  return (
    <ul className={cn("flex flex-wrap gap-1.5", className)} aria-label="Medical alerts">
      {alerts.map((alert) => (
        <li
          key={alert}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md bg-red-600 font-semibold text-white shadow-sm ring-1 ring-red-700/40",
            size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1.5 text-base",
          )}
        >
          <TriangleAlert className={size === "sm" ? "size-3.5" : "size-5"} aria-hidden="true" />
          <span className="sr-only">Medical alert: </span>
          {alert}
        </li>
      ))}
    </ul>
  );
}
```

```tsx components/pawpoint/app-header.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PawPrint, Search, TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { CLINIC_NAME, PATIENTS, USER, ownerById } from "@/lib/data";

export function AppHeader() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const initials = USER.name
    .split(" ")
    .map((p) => p[0])
    .join("");

  return (
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-2 focus:z-50 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
      >
        Skip to content
      </a>
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2.5 rounded-lg outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <PawPrint className="size-5" aria-hidden="true" />
          </span>
          <span className="leading-tight">
            <span className="block text-base font-semibold tracking-tight">Pawpoint</span>
            <span className="hidden text-xs text-muted-foreground sm:block">{CLINIC_NAME}</span>
          </span>
        </Link>

        <div className="ml-auto flex min-w-0 flex-1 justify-end sm:justify-center">
          <Button
            variant="outline"
            onClick={() => setOpen(true)}
            className="h-11 w-11 justify-center gap-2 px-0 text-muted-foreground sm:w-full sm:max-w-md sm:justify-start sm:px-3"
            aria-label="Search patients or owners"
          >
            <Search aria-hidden="true" />
            <span className="hidden sm:inline">Search patient or owner</span>
            <kbd className="ml-auto hidden rounded border bg-muted px-1.5 py-0.5 font-sans text-[11px] md:inline">Ctrl K</kbd>
          </Button>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <div className="hidden text-right leading-tight md:block">
            <p className="text-sm font-medium">{USER.name}</p>
            <p className="text-xs text-muted-foreground">{USER.role}</p>
          </div>
          <span
            className="flex size-9 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-secondary-foreground"
            role="img"
            aria-label={`${USER.name}, ${USER.role}`}
          >
            {initials}
          </span>
        </div>
      </div>

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="Find a patient"
        description="Search by patient name or owner name, then open the record."
      >
        <CommandInput placeholder="Patient or owner name" />
        <CommandList>
          <CommandEmpty>No patient or owner found.</CommandEmpty>
          <CommandGroup heading="Patients">
            {PATIENTS.map((p) => {
              const owner = ownerById(p.owner);
              return (
                <CommandItem
                  key={p.id}
                  value={`${p.name} ${owner.name} ${p.species} ${p.breed} ${p.id}`}
                  onSelect={() => {
                    setOpen(false);
                    router.push(`/patients/${p.id}`);
                  }}
                  className="items-start"
                >
                  <PawPrint aria-hidden="true" className="mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">
                      {p.name}{" "}
                      <span className="font-normal text-muted-foreground">
                        {p.species}, {p.breed}
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground">Owner: {owner.name}</p>
                    {p.alerts.length > 0 && (
                      <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-semibold text-red-700">
                        <TriangleAlert className="size-3.5 !text-red-600" aria-hidden="true" />
                        <span className="sr-only">Medical alert: </span>
                        {p.alerts.join(" / ")}
                      </p>
                    )}
                  </div>
                </CommandItem>
              );
            })}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </header>
  );
}
```

```tsx components/pawpoint/book-dialog.tsx
"use client";

import * as React from "react";
import { CalendarPlus, TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertChips } from "@/components/pawpoint/alert-chips";
import {
  CLOSE_MIN,
  DURATIONS,
  PATIENTS,
  SLOTS,
  VETS,
  endTime,
  findConflict,
  fromMin,
  ownerById,
  patientById,
  toMin,
  vetById,
  type Appointment,
} from "@/lib/data";

export interface NewBooking {
  patient: string;
  vet: string;
  start: string;
  minutes: number;
  reason: string;
  urgent: boolean;
}

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
  onBook: (booking: NewBooking) => void;
}) {
  const [patientId, setPatientId] = React.useState("");
  const [vetId, setVetId] = React.useState("");
  const [time, setTime] = React.useState("");
  const [minutes, setMinutes] = React.useState(20);
  const [reason, setReason] = React.useState("");
  const [urgent, setUrgent] = React.useState(false);

  const patient = patientId ? patientById(patientId) : null;
  const conflict = vetId && time ? findConflict(appointments, vetId, time, minutes) : undefined;
  const overrun = time !== "" && toMin(time) + minutes > CLOSE_MIN;
  const passed = time !== "" && toMin(time) < nowMin;
  const ready = Boolean(patientId && vetId && time && reason.trim() && !conflict && !overrun && !passed);

  function slotState(slot: string): "ok" | "taken" | "past" | "late" {
    if (toMin(slot) < nowMin) return "past";
    if (toMin(slot) + minutes > CLOSE_MIN) return "late";
    if (vetId && findConflict(appointments, vetId, slot, minutes)) return "taken";
    return "ok";
  }

  function reset() {
    setPatientId("");
    setVetId("");
    setTime("");
    setMinutes(20);
    setReason("");
    setUrgent(false);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!ready) return;
    onBook({ patient: patientId, vet: vetId, start: time, minutes, reason: reason.trim(), urgent });
    reset();
    onOpenChange(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) reset();
      }}
    >
      <DialogContent className="max-h-[92dvh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Book an appointment</DialogTitle>
          <DialogDescription>
            Pick the patient, the vet and a time. Times that clash with that vet&apos;s bookings are greyed out.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="grid gap-4" noValidate>
          <div className="grid gap-2">
            <Label htmlFor="book-patient">Patient</Label>
            <Select value={patientId} onValueChange={setPatientId}>
              <SelectTrigger id="book-patient" className="h-11 w-full">
                <SelectValue placeholder="Choose a patient" />
              </SelectTrigger>
              <SelectContent>
                {PATIENTS.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.alerts.length > 0 && (
                      <TriangleAlert className="!text-red-600" aria-label="Has medical alerts" />
                    )}
                    {p.name} · {p.species}, owner {ownerById(p.owner).name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {patient && patient.alerts.length > 0 && (
              <div className="rounded-lg border border-red-300 bg-red-50 p-2.5">
                <AlertChips alerts={patient.alerts} />
              </div>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="book-vet">Vet</Label>
              <Select value={vetId} onValueChange={setVetId}>
                <SelectTrigger id="book-vet" className="h-11 w-full">
                  <SelectValue placeholder="Choose a vet" />
                </SelectTrigger>
                <SelectContent>
                  {VETS.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.name} · {v.room}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="book-length">Length</Label>
              <Select value={String(minutes)} onValueChange={(v) => setMinutes(Number(v))}>
                <SelectTrigger id="book-length" className="h-11 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DURATIONS.map((d) => (
                    <SelectItem key={d} value={String(d)}>
                      {d} minutes
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="book-time">Start time</Label>
            <Select value={time} onValueChange={setTime}>
              <SelectTrigger id="book-time" className="h-11 w-full" aria-describedby="book-time-hint">
                <SelectValue placeholder="Choose a time" />
              </SelectTrigger>
              <SelectContent className="max-h-72">
                {SLOTS.map((slot) => {
                  const state = slotState(slot);
                  return (
                    <SelectItem key={slot} value={slot} disabled={state !== "ok"}>
                      {slot}
                      {state === "taken" && <span className="text-muted-foreground">booked</span>}
                      {state === "past" && <span className="text-muted-foreground">passed</span>}
                      {state === "late" && <span className="text-muted-foreground">after closing</span>}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            <p id="book-time-hint" className="text-xs text-muted-foreground">
              {vetId
                ? `Showing ${vetById(vetId).name}'s availability for ${minutes} minutes.`
                : "Choose a vet to see which times are free."}
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="book-reason">Reason for visit</Label>
            <Input
              id="book-reason"
              className="h-11"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="For example: Vaccination booster"
              autoComplete="off"
            />
          </div>

          <div className="flex items-center gap-3">
            <Checkbox id="book-urgent" checked={urgent} onCheckedChange={(c) => setUrgent(c === true)} className="size-5" />
            <Label htmlFor="book-urgent">Urgent visit (stands out on the schedule)</Label>
          </div>

          <div aria-live="polite">
            {conflict && (
              <p role="alert" className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-900">
                <strong>That time clashes.</strong> {vetById(conflict.vet).name} already has{" "}
                {patientById(conflict.patient).name} ({conflict.reason}) from {conflict.start} to {endTime(conflict)}.
                Choose another time or vet.
              </p>
            )}
            {!conflict && overrun && (
              <p role="alert" className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-900">
                That visit would end after closing at {fromMin(CLOSE_MIN)}.
              </p>
            )}
            {!conflict && passed && (
              <p role="alert" className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
                That time has already passed today.
              </p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" className="h-11" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="h-11" disabled={!ready}>
              <CalendarPlus aria-hidden="true" />
              Book appointment
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

```tsx components/pawpoint/schedule-view.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Ban,
  CalendarPlus,
  CircleCheck,
  Clock,
  Hourglass,
  LogIn,
  Phone,
  Siren,
  Stethoscope,
  UserCheck,
  type LucideIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertChips } from "@/components/pawpoint/alert-chips";
import { BookDialog, type NewBooking } from "@/components/pawpoint/book-dialog";
import {
  APPOINTMENTS,
  NOW_START,
  STATUS_LABEL,
  TODAY,
  VETS,
  endTime,
  formatDate,
  fromMin,
  ownerById,
  patientById,
  toMin,
  vetById,
  type Appointment,
  type Status,
} from "@/lib/data";
import { cn } from "@/lib/utils";

const STATUS_STYLE: Record<Status, { icon: LucideIcon; className: string }> = {
  booked: { icon: Clock, className: "border-border bg-muted text-foreground" },
  checked_in: { icon: UserCheck, className: "border-sky-300 bg-sky-100 text-sky-900" },
  in_exam: { icon: Stethoscope, className: "border-violet-300 bg-violet-100 text-violet-900" },
  done: { icon: CircleCheck, className: "border-emerald-300 bg-emerald-100 text-emerald-900" },
  cancelled: { icon: Ban, className: "border-border bg-background text-muted-foreground" },
};

function StatusBadge({ status }: { status: Status }) {
  const { icon: Icon, className } = STATUS_STYLE[status];
  return (
    <Badge variant="outline" className={cn("px-2.5 py-1 text-xs", className)}>
      <Icon aria-hidden="true" />
      {STATUS_LABEL[status]}
    </Badge>
  );
}

function waitMinutes(a: Appointment, now: number): number {
  return a.checkedInAt ? Math.max(0, now - toMin(a.checkedInAt)) : 0;
}

function Stat({ label, value, hint, tone }: { label: string; value: number; hint?: string; tone?: "warn" }) {
  return (
    <div className={cn("rounded-xl border bg-card p-3 sm:p-4", tone === "warn" && "border-amber-300 bg-amber-50")}>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums leading-none">{value}</p>
      {hint && <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function ScheduleView() {
  const [appts, setAppts] = React.useState<Appointment[]>(APPOINTMENTS);
  const [now, setNow] = React.useState(NOW_START);
  const [vetFilter, setVetFilter] = React.useState("all");
  const [bookOpen, setBookOpen] = React.useState(false);
  const [highlight, setHighlight] = React.useState<string | null>(null);

  React.useEffect(() => {
    const t = setInterval(() => setNow((n) => n + 1), 60_000);
    return () => clearInterval(t);
  }, []);

  React.useEffect(() => {
    if (!highlight) return;
    const t = setTimeout(() => setHighlight(null), 5000);
    return () => clearTimeout(t);
  }, [highlight]);

  const sorted = React.useMemo(
    () =>
      [...appts].sort(
        (a, b) => toMin(a.start) - toMin(b.start) || a.vet.localeCompare(b.vet) || a.id.localeCompare(b.id),
      ),
    [appts],
  );
  const visible = vetFilter === "all" ? sorted : sorted.filter((a) => a.vet === vetFilter);
  const waiting = appts
    .filter((a) => a.status === "checked_in")
    .sort((a, b) => toMin(a.checkedInAt ?? "00:00") - toMin(b.checkedInAt ?? "00:00"));
  const nextUp = sorted.filter((a) => a.status === "booked").slice(0, 3);
  const inExam = appts.filter((a) => a.status === "in_exam");
  const laterCount = appts.filter((a) => a.status === "booked").length;
  const doneCount = appts.filter((a) => a.status === "done").length;
  const longestWait = waiting.reduce((m, a) => Math.max(m, waitMinutes(a, now)), 0);

  function update(id: string, patch: Partial<Appointment>) {
    setAppts((list) => list.map((a) => (a.id === id ? { ...a, ...patch } : a)));
  }

  function checkIn(a: Appointment) {
    update(a.id, { status: "checked_in", checkedInAt: fromMin(now) });
    const p = patientById(a.patient);
    toast.success(`${p.name} checked in`, {
      description: `Waiting for ${vetById(a.vet).name}${p.alerts.length ? ` · Alert: ${p.alerts.join(", ")}` : ""}`,
    });
  }
  function toExam(a: Appointment) {
    update(a.id, { status: "in_exam" });
    toast(`${patientById(a.patient).name} sent to ${vetById(a.vet).room}`);
  }
  function finish(a: Appointment) {
    update(a.id, { status: "done" });
    toast(`${patientById(a.patient).name} marked done`);
  }

  function book(b: NewBooking) {
    const id = `a-${String(appts.length + 1).padStart(2, "0")}`;
    setAppts((list) => [...list, { id, ...b, status: "booked" }]);
    setHighlight(id);
    toast.success(`Booked ${patientById(b.patient).name}`, {
      description: `${vetById(b.vet).name} at ${b.start}`,
    });
  }

  function actionFor(a: Appointment) {
    const name = patientById(a.patient).name;
    if (a.status === "booked") {
      return (
        <Button className="h-11 min-w-32" onClick={() => checkIn(a)} aria-label={`Check in ${name}`}>
          <LogIn aria-hidden="true" />
          Check in
        </Button>
      );
    }
    if (a.status === "checked_in") {
      return (
        <Button variant="outline" className="h-11 min-w-32" onClick={() => toExam(a)} aria-label={`Send ${name} to exam`}>
          <Stethoscope aria-hidden="true" />
          To exam
        </Button>
      );
    }
    if (a.status === "in_exam") {
      return (
        <Button variant="outline" className="h-11 min-w-32" onClick={() => finish(a)} aria-label={`Mark ${name} done`}>
          <CircleCheck aria-hidden="true" />
          Mark done
        </Button>
      );
    }
    return null;
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">{formatDate(TODAY)} · Thursday</p>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Today&apos;s schedule</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            It is {fromMin(now)}. {waiting.length === 0 ? "Nobody is waiting." : `${waiting.length} waiting.`}
          </p>
        </div>
        <Button size="lg" className="h-12 px-5 text-base" onClick={() => setBookOpen(true)}>
          <CalendarPlus aria-hidden="true" />
          Book appointment
        </Button>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Waiting" value={waiting.length} hint={waiting.length ? `Longest ${longestWait} min` : "Room is clear"} tone={longestWait >= 20 ? "warn" : undefined} />
        <Stat label="In exam" value={inExam.length} hint={inExam.map((a) => vetById(a.vet).room).join(", ") || "None"} />
        <Stat label="Still to come" value={laterCount} hint="Booked, not arrived" />
        <Stat label="Done today" value={doneCount} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        {/* Waiting room first in reading order, beside the schedule on wide screens */}
        <aside className="grid content-start gap-4 lg:col-start-2 lg:row-start-1" aria-label="Waiting room and next arrivals">
          <section className="rounded-xl border bg-card" aria-labelledby="waiting-title">
            <div className="flex items-center justify-between border-b p-4">
              <h2 id="waiting-title" className="flex items-center gap-2 text-base font-semibold">
                <Hourglass className="size-4" aria-hidden="true" />
                Waiting room
              </h2>
              <Badge variant="secondary">{waiting.length}</Badge>
            </div>
            {waiting.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground">Nobody is checked in right now.</p>
            ) : (
              <ol className="divide-y">
                {waiting.map((a, i) => {
                  const p = patientById(a.patient);
                  const wait = waitMinutes(a, now);
                  const long = wait >= 20;
                  return (
                    <li key={a.id} className="grid gap-2 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground">#{i + 1} in line</p>
                          <Link href={`/patients/${p.id}`} className="text-base font-semibold underline-offset-4 hover:underline focus-visible:underline">
                            {p.name}
                          </Link>
                          <p className="text-sm text-muted-foreground">
                            {ownerById(p.owner).name} · {a.reason}
                          </p>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className={cn("text-xl font-semibold tabular-nums leading-none", long && "text-amber-700")}>
                            {wait}
                            <span className="ml-0.5 text-sm font-medium"> min</span>
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">since {a.checkedInAt}</p>
                        </div>
                      </div>
                      <AlertChips alerts={p.alerts} />
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs text-muted-foreground">
                          {vetById(a.vet).name} · booked {a.start}
                          {long && <span className="ml-1.5 font-semibold text-amber-700">Over 20 min</span>}
                        </p>
                        {actionFor(a)}
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}
          </section>

          <section className="rounded-xl border bg-card" aria-labelledby="next-title">
            <div className="border-b p-4">
              <h2 id="next-title" className="text-base font-semibold">Arriving next</h2>
            </div>
            {nextUp.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground">No more bookings today.</p>
            ) : (
              <ul className="divide-y">
                {nextUp.map((a) => {
                  const p = patientById(a.patient);
                  return (
                    <li key={a.id} className="grid gap-2 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm tabular-nums text-muted-foreground">
                            {a.start} · {vetById(a.vet).name}
                          </p>
                          <Link href={`/patients/${p.id}`} className="font-semibold underline-offset-4 hover:underline focus-visible:underline">
                            {p.name}
                          </Link>
                          <span className="text-sm text-muted-foreground"> · {ownerById(p.owner).name}</span>
                        </div>
                        {a.urgent && (
                          <Badge className="bg-orange-600 text-white">
                            <Siren aria-hidden="true" />
                            Urgent
                          </Badge>
                        )}
                      </div>
                      <AlertChips alerts={p.alerts} />
                      <div className="flex justify-end">{actionFor(a)}</div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section className="rounded-xl border bg-card" aria-labelledby="vets-title">
            <div className="border-b p-4">
              <h2 id="vets-title" className="text-base font-semibold">Vets right now</h2>
            </div>
            <ul className="divide-y">
              {VETS.map((v) => {
                const current = inExam.find((a) => a.vet === v.id);
                return (
                  <li key={v.id} className="flex items-center justify-between gap-3 p-4 text-sm">
                    <div>
                      <p className="font-medium">{v.name}</p>
                      <p className="text-xs text-muted-foreground">{v.room}</p>
                    </div>
                    {current ? (
                      <span className="text-right">
                        <span className="block font-medium">{patientById(current.patient).name}</span>
                        <span className="block text-xs text-muted-foreground">until about {endTime(current)}</span>
                      </span>
                    ) : (
                      <Badge variant="outline" className="border-emerald-300 bg-emerald-50 text-emerald-900">Free</Badge>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        </aside>

        <section className="min-w-0 lg:col-start-1 lg:row-start-1" aria-labelledby="sched-title">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <h2 id="sched-title" className="text-lg font-semibold">
              All appointments <span className="text-sm font-normal text-muted-foreground">({visible.length})</span>
            </h2>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by vet">
              {[{ id: "all", name: "All vets" }, ...VETS].map((v) => (
                <Button
                  key={v.id}
                  size="sm"
                  variant={vetFilter === v.id ? "default" : "outline"}
                  className="h-10 px-3.5"
                  aria-pressed={vetFilter === v.id}
                  onClick={() => setVetFilter(v.id)}
                >
                  {v.id === "all" ? v.name : v.name.split(" ").slice(0, 2).join(" ")}
                </Button>
              ))}
            </div>
          </div>

          <ul className="grid gap-3">
            {visible.map((a) => {
              const p = patientById(a.patient);
              const owner = ownerById(p.owner);
              const vet = vetById(a.vet);
              const cancelled = a.status === "cancelled";
              return (
                <li
                  key={a.id}
                  className={cn(
                    "grid gap-3 rounded-xl border bg-card p-4 transition-shadow sm:grid-cols-[5.5rem_minmax(0,1fr)_auto] sm:items-start",
                    a.urgent && !cancelled && "border-l-[6px] border-orange-500 bg-orange-50 ring-1 ring-orange-300",
                    a.status === "in_exam" && "border-violet-300",
                    highlight === a.id && "ring-2 ring-primary",
                    cancelled && "bg-muted/40 opacity-70",
                  )}
                  aria-label={`${a.start} ${p.name}, ${STATUS_LABEL[a.status]}${a.urgent ? ", urgent" : ""}`}
                >
                  <div className="flex items-baseline gap-2 sm:block">
                    <p className="text-xl font-semibold tabular-nums leading-none">{a.start}</p>
                    <p className="text-xs text-muted-foreground sm:mt-1">
                      to {endTime(a)} · {a.minutes} min
                    </p>
                  </div>

                  <div className="min-w-0 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <Link
                        href={`/patients/${p.id}`}
                        className="text-lg font-semibold leading-tight underline-offset-4 hover:underline focus-visible:underline"
                      >
                        {p.name}
                      </Link>
                      <span className="text-sm text-muted-foreground">
                        {p.species}, {p.breed}
                      </span>
                      {a.urgent && (
                        <Badge className="bg-orange-600 text-white">
                          <Siren aria-hidden="true" />
                          Urgent
                        </Badge>
                      )}
                    </div>
                    <p className={cn("text-sm", cancelled && "line-through")}>{a.reason}</p>
                    <p className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-sm text-muted-foreground">
                      <span>{owner.name}</span>
                      <a href={`tel:${owner.phone.replace(/\s/g, "")}`} className="inline-flex items-center gap-1 underline-offset-4 hover:underline">
                        <Phone className="size-3.5" aria-hidden="true" />
                        {owner.phone}
                      </a>
                      <span>
                        {vet.name} · {vet.room}
                      </span>
                    </p>
                    <AlertChips alerts={p.alerts} />
                  </div>

                  <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
                    <StatusBadge status={a.status} />
                    {a.status === "checked_in" && (
                      <span className="text-xs font-medium text-sky-900">Waiting {waitMinutes(a, now)} min</span>
                    )}
                    {actionFor(a)}
                  </div>
                </li>
              );
            })}
            {visible.length === 0 && (
              <li className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                No appointments for this vet today.
              </li>
            )}
          </ul>
        </section>
      </div>

      <BookDialog open={bookOpen} onOpenChange={setBookOpen} appointments={appts} nowMin={now} onBook={book} />
    </div>
  );
}
```

```tsx components/pawpoint/weight-chart.tsx
import { formatDate, formatShortDate, type Weight } from "@/lib/data";

export function WeightChart({ points, name }: { points: Weight[]; name: string }) {
  const W = 600;
  const H = 180;
  const padX = 14;
  const padY = 18;

  const times = points.map((p) => Date.parse(p.date));
  const tMin = Math.min(...times);
  const tMax = Math.max(...times);
  const kgs = points.map((p) => p.kg);
  const lo = Math.floor(Math.min(...kgs) - 0.5);
  const hi = Math.ceil(Math.max(...kgs) + 0.5);

  const x = (t: number) => padX + ((t - tMin) / (tMax - tMin || 1)) * (W - padX * 2);
  const y = (kg: number) => padY + ((hi - kg) / (hi - lo || 1)) * (H - padY * 2);

  const coords = points.map((p) => ({ ...p, cx: x(Date.parse(p.date)), cy: y(p.kg) }));
  const line = coords.map((c) => `${c.cx.toFixed(1)},${c.cy.toFixed(1)}`).join(" ");
  const area = `${coords[0].cx.toFixed(1)},${H - padY} ${line} ${coords[coords.length - 1].cx.toFixed(1)},${H - padY}`;
  const ticks: number[] = [];
  for (let t = lo; t <= hi; t += 2) ticks.push(t);

  const first = points[0];
  const last = points[points.length - 1];
  const change = last.kg - first.kg;
  const pct = (change / first.kg) * 100;

  const chartTitle = `${name}'s weight over ${points.length} visits`;
  const chartDesc = points.map((p) => `${formatDate(p.date)}: ${p.kg} kilograms`).join(". ") + ".";

  return (
    <div>
      <p className="text-sm">
        <span className="text-2xl font-semibold tabular-nums">{last.kg.toFixed(1)} kg</span>{" "}
        <span className="font-medium text-amber-800">
          {`down ${Math.abs(change).toFixed(1)} kg (${Math.abs(pct).toFixed(1)}%) since ${formatDate(first.date)}`}
        </span>
      </p>

      <div className="relative mt-3">
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={chartTitle} aria-description={chartDesc}>
          {ticks.map((t) => (
            <line key={t} x1={0} x2={W} y1={y(t)} y2={y(t)} className="stroke-border" strokeWidth={1} strokeDasharray="4 4" />
          ))}
          <polygon points={area} className="fill-primary/10" />
          <polyline points={line} fill="none" className="stroke-primary" strokeWidth={3} strokeLinejoin="round" strokeLinecap="round" />
          {coords.map((c, i) => (
            <circle
              key={c.date}
              cx={c.cx}
              cy={c.cy}
              r={i === coords.length - 1 ? 7 : 5}
              className={i === coords.length - 1 ? "fill-primary stroke-background" : "fill-background stroke-primary"}
              strokeWidth={3}
            />
          ))}
        </svg>
        {ticks.map((t) => (
          <span
            key={t}
            aria-hidden="true"
            className="absolute left-0 -translate-y-full rounded bg-card/80 px-1 text-[11px] tabular-nums text-muted-foreground"
            style={{ top: `${((y(t) / H) * 100).toFixed(2)}%` }}
          >
            {`${t} kg`}
          </span>
        ))}
      </div>

      <ol className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6">
        {points.map((p, i) => {
          const delta = i === 0 ? null : p.kg - points[i - 1].kg;
          const isLast = i === points.length - 1;
          return (
            <li key={p.date} className={`rounded-lg border p-2 text-center ${isLast ? "border-primary bg-primary/5" : "bg-background"}`}>
              <p className="text-[11px] text-muted-foreground">{formatShortDate(p.date)}</p>
              <p className="text-sm font-semibold tabular-nums">{p.kg.toFixed(1)}</p>
              <p className="text-[11px] tabular-nums text-muted-foreground">
                {delta === null ? "first" : `${delta > 0 ? "+" : "−"}${Math.abs(delta).toFixed(1)}`}
              </p>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
```

```tsx app/patients/[id]/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Bird,
  Cat,
  ChevronLeft,
  Clock,
  Dog,
  PawPrint,
  Phone,
  Pill,
  Rabbit,
  Scale,
  Stethoscope,
  Syringe,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";

import { AppHeader } from "@/components/pawpoint/app-header";
import { AlertChips } from "@/components/pawpoint/alert-chips";
import { WeightChart } from "@/components/pawpoint/weight-chart";
import { Badge } from "@/components/ui/badge";
import {
  APPOINTMENTS,
  PATIENTS,
  RECORDS,
  STATUS_LABEL,
  TODAY,
  ageText,
  endTime,
  formatDate,
  ownerById,
  patientById,
  toMin,
  usd,
  vaccinationState,
  vetById,
} from "@/lib/data";
import { cn } from "@/lib/utils";

const SPECIES_ICON: Record<string, LucideIcon> = { Dog, Cat, Bird, Rabbit };

export function generateStaticParams() {
  return PATIENTS.map((p) => ({ id: p.id }));
}

function Section({
  title,
  icon: Icon,
  children,
  aside,
  id,
}: {
  title: string;
  icon: LucideIcon;
  children: React.ReactNode;
  aside?: React.ReactNode;
  id: string;
}) {
  return (
    <section className="rounded-xl border bg-card" aria-labelledby={id}>
      <div className="flex items-center justify-between gap-3 border-b px-4 py-3 sm:px-5">
        <h2 id={id} className="flex items-center gap-2 text-base font-semibold">
          <Icon className="size-4 text-muted-foreground" aria-hidden="true" />
          {title}
        </h2>
        {aside}
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </section>
  );
}

export default async function PatientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!PATIENTS.some((p) => p.id === id)) notFound();

  const patient = patientById(id);
  const owner = ownerById(patient.owner);
  const record = RECORDS[id];
  const SpeciesIcon = SPECIES_ICON[patient.species] ?? PawPrint;
  const today = APPOINTMENTS.filter((a) => a.patient === id).sort((a, b) => toMin(a.start) - toMin(b.start));

  const vaccinations = record
    ? record.vaccinations
        .map((v) => ({ ...v, ...vaccinationState(v.due) }))
        .sort((a, b) => (a.state === "overdue" ? 0 : 1) - (b.state === "overdue" ? 0 : 1) || a.due.localeCompare(b.due))
    : [];
  const overdue = vaccinations.filter((v) => v.state === "overdue");

  return (
    <>
      <AppHeader />
      <main id="main" className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-8">
        <Link
          href="/"
          className="mb-4 inline-flex h-10 items-center gap-1 rounded-md pr-3 text-sm font-medium text-muted-foreground hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
          Today&apos;s schedule
        </Link>

        {/* Hero */}
        <section className="overflow-hidden rounded-2xl border bg-card" aria-labelledby="patient-name">
          {patient.alerts.length > 0 && (
            <div className="border-b border-red-700 bg-red-600 px-4 py-3 text-white sm:px-6" role="region" aria-label="Medical alerts">
              <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide">
                <TriangleAlert className="size-5" aria-hidden="true" />
                Medical alerts: read before handling
              </p>
              <ul className="mt-2 flex flex-wrap gap-2">
                {patient.alerts.map((a) => (
                  <li key={a} className="rounded-md bg-white px-3 py-1.5 text-base font-bold text-red-700 sm:text-lg">
                    <span className="sr-only">Medical alert: </span>
                    {a}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid gap-5 p-4 sm:p-6 md:grid-cols-[minmax(0,1fr)_auto]">
            <div className="flex items-start gap-4">
              <span className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary sm:size-20">
                <SpeciesIcon className="size-9 sm:size-11" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <h1 id="patient-name" className="text-3xl font-semibold tracking-tight">
                  {patient.name}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {patient.species}, {patient.breed}
                </p>
                <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-3">
                  <div>
                    <dt className="text-xs text-muted-foreground">Age</dt>
                    <dd className="font-medium">{ageText(patient.born)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Born</dt>
                    <dd className="font-medium">{formatDate(patient.born)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Sex</dt>
                    <dd className="font-medium">{patient.sex}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Patient ID</dt>
                    <dd className="font-medium tabular-nums">{patient.id}</dd>
                  </div>
                </dl>
                {overdue.length > 0 && (
                  <p className="mt-3 inline-flex items-center gap-1.5 rounded-md border border-amber-400 bg-amber-100 px-2.5 py-1 text-sm font-semibold text-amber-900">
                    <Syringe className="size-4" aria-hidden="true" />
                    {`${overdue.length} vaccinations overdue: ${overdue.map((v) => v.name).join(", ")}`}
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-xl border bg-muted/40 p-4 md:min-w-64">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Owner</p>
              <p className="mt-1 text-lg font-semibold">{owner.name}</p>
              <a
                href={`tel:${owner.phone.replace(/\s/g, "")}`}
                className="mt-1 inline-flex h-10 items-center gap-2 text-base font-medium text-primary underline-offset-4 hover:underline"
              >
                <Phone className="size-4" aria-hidden="true" />
                {owner.phone}
              </a>
            </div>
          </div>
        </section>

        {!record && (
          <div className="mt-6 rounded-xl border border-dashed bg-card p-8 text-center">
            <p className="font-medium">No clinical history on file for {patient.name} in this demo.</p>
            <p className="mt-1 text-sm text-muted-foreground">Weights, vaccinations, medications and visit notes appear here once recorded.</p>
          </div>
        )}

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
          <div className="grid content-start gap-6">
            {record && (
              <Section id="weight-title" title="Weight trend" icon={Scale}>
                <WeightChart points={record.weights_kg} name={patient.name} />
              </Section>
            )}

            {record && (
              <Section id="visits-title" title="Visit history" icon={Stethoscope} aside={<Badge variant="secondary">{`${record.visits.length} visits`}</Badge>}>
                <ol className="grid gap-4">
                  {record.visits.map((v) => (
                    <li key={v.date} className="grid gap-1 border-l-2 border-primary/30 pl-4">
                      <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                        <p className="font-semibold">
                          {v.reason}
                          {v.date === TODAY && <Badge className="ml-2 align-middle">Today</Badge>}
                        </p>
                        <p className="text-sm tabular-nums text-muted-foreground">{formatDate(v.date)}</p>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {vetById(v.vet).name} · Invoice {usd(v.invoice_usd)}
                      </p>
                      <p className="text-sm leading-relaxed">{v.notes}</p>
                    </li>
                  ))}
                </ol>
              </Section>
            )}
          </div>

          <div className="grid content-start gap-6">
            <Section id="today-title" title="Today" icon={Clock}>
              {today.length === 0 ? (
                <p className="text-sm text-muted-foreground">No appointments today.</p>
              ) : (
                <ul className="grid gap-3">
                  {today.map((a) => (
                    <li key={a.id} className="flex items-start justify-between gap-3 text-sm">
                      <div>
                        <p className="font-medium tabular-nums">
                          {a.start} to {endTime(a)}
                        </p>
                        <p className="text-muted-foreground">
                          {a.reason} · {vetById(a.vet).name}
                        </p>
                      </div>
                      <Badge variant="outline">{STATUS_LABEL[a.status]}</Badge>
                    </li>
                  ))}
                </ul>
              )}
              {patient.alerts.length > 0 && <AlertChips alerts={patient.alerts} className="mt-3" />}
            </Section>

            {record && (
              <Section
                id="vacc-title"
                title="Vaccinations"
                icon={Syringe}
                aside={overdue.length > 0 ? <Badge className="bg-red-600 text-white">{`${overdue.length} overdue`}</Badge> : undefined}
              >
                <ul className="grid gap-3">
                  {vaccinations.map((v) => (
                    <li
                      key={v.name}
                      className={cn(
                        "flex items-start justify-between gap-3 rounded-lg border p-3",
                        v.state === "overdue" && "border-red-300 bg-red-50",
                        v.state === "soon" && "border-amber-300 bg-amber-50",
                      )}
                    >
                      <div>
                        <p className="font-semibold">{v.name}</p>
                        <p className="text-xs text-muted-foreground">Given {formatDate(v.given)}</p>
                        <p className="text-xs text-muted-foreground">Due {formatDate(v.due)}</p>
                      </div>
                      <div className="text-right">
                        {v.state === "overdue" && (
                          <p className="inline-flex items-center gap-1 rounded-md bg-red-600 px-2 py-0.5 text-xs font-bold text-white">
                            <TriangleAlert className="size-3.5" aria-hidden="true" />
                            Overdue
                          </p>
                        )}
                        {v.state === "soon" && <p className="text-xs font-bold text-amber-900">Due soon</p>}
                        {v.state === "ok" && <p className="text-xs font-medium text-emerald-800">Up to date</p>}
                        <p className="mt-1 text-xs tabular-nums text-muted-foreground">
                          {v.state === "overdue" ? `${v.days} days late` : `in ${v.days} days`}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {record && (
              <Section id="meds-title" title="Current medications" icon={Pill}>
                <ul className="grid gap-3">
                  {record.medications.map((m) => (
                    <li key={m.name} className="rounded-lg border bg-background p-3">
                      <p className="font-semibold">{m.name}</p>
                      <p className="text-sm">{m.dose}</p>
                      <p className="text-xs text-muted-foreground">Since {formatDate(m.since)}</p>
                    </li>
                  ))}
                </ul>
              </Section>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
```

```tsx app/page.tsx
import { AppHeader } from "@/components/pawpoint/app-header";
import { ScheduleView } from "@/components/pawpoint/schedule-view";

export default function Page() {
  return (
    <>
      <AppHeader />
      <main id="main">
        <ScheduleView />
      </main>
    </>
  );
}
```

```tsx app/layout.tsx
import "./globals.css";

import type { Metadata, Viewport } from "next";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "Pawpoint | Hillside Veterinary Clinic",
  description: "Front-desk and records software for Hillside Veterinary Clinic",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-dvh font-sans antialiased">
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
  --radius: 0.75rem;
  --background: oklch(0.975 0.006 190);
  --foreground: oklch(0.2 0.02 200);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.2 0.02 200);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.2 0.02 200);
  --primary: oklch(0.45 0.09 195);
  --primary-foreground: oklch(0.985 0.005 190);
  --secondary: oklch(0.94 0.015 190);
  --secondary-foreground: oklch(0.28 0.04 195);
  --muted: oklch(0.955 0.008 190);
  --muted-foreground: oklch(0.47 0.02 200);
  --accent: oklch(0.94 0.02 190);
  --accent-foreground: oklch(0.28 0.04 195);
  --destructive: oklch(0.577 0.245 27.325);
  --border: oklch(0.89 0.01 190);
  --input: oklch(0.85 0.012 190);
  --ring: oklch(0.58 0.09 195);
  --chart-1: oklch(0.646 0.222 41.116);
  --chart-2: oklch(0.6 0.118 184.704);
  --chart-3: oklch(0.398 0.07 227.392);
  --chart-4: oklch(0.828 0.189 84.429);
  --chart-5: oklch(0.769 0.188 70.08);
  --sidebar: oklch(0.985 0 0);
  --sidebar-foreground: oklch(0.145 0 0);
  --sidebar-primary: oklch(0.205 0 0);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.97 0 0);
  --sidebar-accent-foreground: oklch(0.205 0 0);
  --sidebar-border: oklch(0.922 0 0);
  --sidebar-ring: oklch(0.708 0 0);
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --card: oklch(0.205 0 0);
  --card-foreground: oklch(0.985 0 0);
  --popover: oklch(0.205 0 0);
  --popover-foreground: oklch(0.985 0 0);
  --primary: oklch(0.922 0 0);
  --primary-foreground: oklch(0.205 0 0);
  --secondary: oklch(0.269 0 0);
  --secondary-foreground: oklch(0.985 0 0);
  --muted: oklch(0.269 0 0);
  --muted-foreground: oklch(0.708 0 0);
  --accent: oklch(0.269 0 0);
  --accent-foreground: oklch(0.985 0 0);
  --destructive: oklch(0.704 0.191 22.216);
  --border: oklch(1 0 0 / 10%);
  --input: oklch(1 0 0 / 15%);
  --ring: oklch(0.556 0 0);
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
}
```
