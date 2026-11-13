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
  /** Minutes since midnight at which the patient was checked in. */
  checkedInAt?: number;
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

export const CLINIC = "Pawpoint";
export const CLINIC_FULL = "Pawpoint, front-desk and records software for Hillside Veterinary Clinic";
export const CLINIC_NAME = "Hillside Veterinary Clinic";
export const TODAY = "2026-11-12";
/** The front desk clock at the moment the page opens, in minutes since midnight (09:52). */
export const START_NOW = 9 * 60 + 52;

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

export const vetById: Record<string, Vet> = Object.fromEntries(vets.map((v) => [v.id, v]));
export const ownerById: Record<string, Owner> = Object.fromEntries(owners.map((o) => [o.id, o]));
export const patientById: Record<string, Patient> = Object.fromEntries(patients.map((p) => [p.id, p]));
```

```ts lib/time.ts
/** "09:15" to minutes since midnight. */
export function toMin(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

/** Minutes since midnight to "09:15". */
export function fmt(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function fmtRange(start: string, minutes: number): string {
  return `${start}–${fmt(toMin(start) + minutes)}`;
}

function dayNumber(iso: string): number {
  const [y, m, d] = iso.split("-").map(Number);
  return Date.UTC(y, m - 1, d) / 86400000;
}

/** Whole days from `from` to `to` (negative when `to` is earlier). */
export function daysBetween(from: string, to: string): number {
  return Math.round(dayNumber(to) - dayNumber(from));
}

function utcDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

export function formatDate(iso: string, withYear = true): string {
  return utcDate(iso).toLocaleDateString("en-GB", {
    timeZone: "UTC",
    day: "numeric",
    month: "short",
    year: withYear ? "numeric" : undefined,
  });
}

export function formatLongDate(iso: string): string {
  return utcDate(iso).toLocaleDateString("en-GB", {
    timeZone: "UTC",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function ageLabel(born: string, today: string): string {
  const [by, bm, bd] = born.split("-").map(Number);
  const [ty, tm, td] = today.split("-").map(Number);
  let months = (ty - by) * 12 + (tm - bm);
  if (td < bd) months -= 1;
  const years = Math.floor(months / 12);
  const rest = months % 12;
  if (years === 0) return `${rest} mo`;
  if (rest === 0) return `${years} yr`;
  return `${years} yr ${rest} mo`;
}

export function money(value: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
}
```

```ts lib/schedule.ts
import type { Appointment } from "@/lib/data";
import { toMin } from "@/lib/time";

export const OPEN = 8 * 60;
export const CLOSE = 18 * 60;

/** The existing booking (not cancelled) that overlaps this slot for this vet, if any. */
export function findConflict(
  appointments: Appointment[],
  vetId: string,
  start: number,
  minutes: number,
): Appointment | undefined {
  return appointments.find((a) => {
    if (a.vet !== vetId || a.status === "cancelled") return false;
    const s = toMin(a.start);
    return start < s + a.minutes && s < start + minutes;
  });
}

/** First free start (on a 15 minute grid) at or after `from` that fits `minutes`. */
export function nextFree(
  appointments: Appointment[],
  vetId: string,
  minutes: number,
  from: number,
): number | null {
  const first = Math.ceil(from / 15) * 15;
  for (let t = first; t + minutes <= CLOSE; t += 15) {
    if (!findConflict(appointments, vetId, t, minutes)) return t;
  }
  return null;
}
```

```tsx components/DeskProvider.tsx
"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useToast, VisuallyHidden } from "@once-ui-system/core";
import {
  initialAppointments,
  patientById,
  START_NOW,
  vetById,
  type Appointment,
} from "@/lib/data";
import { findConflict, CLOSE } from "@/lib/schedule";
import { toMin } from "@/lib/time";

export interface NewBooking {
  patient: string;
  vet: string;
  start: string;
  minutes: number;
  reason: string;
}

type BookResult = { ok: true; id: string } | { ok: false; error: string };

interface DeskContextValue {
  appointments: Appointment[];
  /** Clinic clock in minutes since midnight. */
  now: number;
  highlightId: string | null;
  checkIn: (id: string) => void;
  startExam: (id: string) => void;
  book: (input: NewBooking) => BookResult;
  bookingOpen: boolean;
  bookingPatientId: string | undefined;
  openBooking: (patientId?: string) => void;
  closeBooking: () => void;
}

const DeskContext = createContext<DeskContextValue | null>(null);

export function useDesk(): DeskContextValue {
  const ctx = useContext(DeskContext);
  if (!ctx) throw new Error("useDesk must be used inside DeskProvider");
  return ctx;
}

export function DeskProvider({ children }: { children: React.ReactNode }) {
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const [now, setNow] = useState(START_NOW);
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingPatientId, setBookingPatientId] = useState<string | undefined>(undefined);
  const [announcement, setAnnouncement] = useState("");
  const { addToast } = useToast();

  useEffect(() => {
    const timer = setInterval(() => setNow((n) => n + 1), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!highlightId) return;
    const timer = setTimeout(() => setHighlightId(null), 6000);
    return () => clearTimeout(timer);
  }, [highlightId]);

  const notify = useCallback(
    (message: string) => {
      setAnnouncement(message);
      addToast({ tone: "success", message });
    },
    [addToast],
  );

  const checkIn = useCallback(
    (id: string) => {
      const target = appointments.find((a) => a.id === id);
      if (!target || target.status !== "booked") return;
      setAppointments((prev) =>
        prev.map((a) => (a.id === id && a.status === "booked" ? { ...a, status: "checked_in", checkedInAt: now } : a)),
      );
      notify(`${patientById[target.patient]?.name ?? "Patient"} checked in. Added to the waiting list.`);
    },
    [appointments, now, notify],
  );

  const startExam = useCallback(
    (id: string) => {
      const target = appointments.find((a) => a.id === id);
      if (!target || target.status !== "checked_in") return;
      setAppointments((prev) =>
        prev.map((a) => (a.id === id && a.status === "checked_in" ? { ...a, status: "in_exam" } : a)),
      );
      notify(`${patientById[target.patient]?.name ?? "Patient"} sent to ${vetById[target.vet]?.room ?? "exam"}.`);
    },
    [appointments, notify],
  );

  const book = useCallback(
    (input: NewBooking): BookResult => {
      const start = toMin(input.start);
      if (start + input.minutes > CLOSE) return { ok: false, error: "That visit would run past closing time." };
      const clash = findConflict(appointments, input.vet, start, input.minutes);
      if (clash) {
        return { ok: false, error: "That time clashes with an existing booking for this vet." };
      }
      const id = `a-${String(appointments.length + 1).padStart(2, "0")}`;
      const created: Appointment = {
        id,
        patient: input.patient,
        vet: input.vet,
        start: input.start,
        minutes: input.minutes,
        reason: input.reason.trim(),
        status: "booked",
      };
      setAppointments((prev) => [...prev, created]);
      setHighlightId(id);
      notify(
        `Booked ${patientById[input.patient]?.name ?? "patient"} with ${vetById[input.vet]?.name ?? "vet"} at ${input.start}.`,
      );
      return { ok: true, id };
    },
    [appointments, notify],
  );

  const openBooking = useCallback((patientId?: string) => {
    setBookingPatientId(patientId);
    setBookingOpen(true);
  }, []);
  const closeBooking = useCallback(() => setBookingOpen(false), []);

  const value = useMemo<DeskContextValue>(
    () => ({
      appointments,
      now,
      highlightId,
      checkIn,
      startExam,
      book,
      bookingOpen,
      bookingPatientId,
      openBooking,
      closeBooking,
    }),
    [appointments, now, highlightId, checkIn, startExam, book, bookingOpen, bookingPatientId, openBooking, closeBooking],
  );

  return (
    <DeskContext.Provider value={value}>
      {children}
      <VisuallyHidden>
        <span role="status" aria-live="polite">
          {announcement}
        </span>
      </VisuallyHidden>
    </DeskContext.Provider>
  );
}
```

```tsx components/StatusTag.tsx
import { Icon, Tag } from "@once-ui-system/core";
import type { ComponentProps } from "react";
import type { Status } from "@/lib/data";

type IconName = NonNullable<ComponentProps<typeof Icon>["name"]>;
type Tone = "neutral" | "brand" | "accent" | "info" | "danger" | "warning" | "success";

export const STATUS: Record<Status, { label: string; tone: Tone; icon: IconName }> = {
  booked: { label: "Booked", tone: "neutral", icon: "calendar" },
  checked_in: { label: "Checked in", tone: "warning", icon: "time" },
  in_exam: { label: "In exam", tone: "info", icon: "paw" },
  done: { label: "Done", tone: "success", icon: "check" },
  cancelled: { label: "Cancelled", tone: "neutral", icon: "close" },
};

export function StatusTag({ status }: { status: Status }) {
  const s = STATUS[status];
  return <Tag tone={s.tone} prefixIcon={s.icon} label={s.label} />;
}
```

```tsx components/Alerts.tsx
import { Column, Icon, Row, Tag, Text } from "@once-ui-system/core";

/** Compact medical alert tags, for lists and cards. Text and icon, never colour alone. */
export function AlertTags({ alerts, size = "s" }: { alerts: string[]; size?: "s" | "m" }) {
  if (alerts.length === 0) return null;
  return (
    <Row gap="4" wrap role="group" aria-label="Medical alerts">
      {alerts.map((alert) => (
        <Tag key={alert} as="span" tone="danger" size={size} prefixIcon="warning" label={alert} />
      ))}
    </Row>
  );
}

/** Large, high-contrast block for a record header or a booking. */
export function AlertBanner({ alerts, compact = false }: { alerts: string[]; compact?: boolean }) {
  if (alerts.length === 0) return null;
  return (
    <Column
      as="section"
      aria-label="Medical alerts"
      background="danger-alpha-weak"
      border="danger-strong"
      borderWidth={2}
      radius="l"
      padding={compact ? "12" : "20"}
      gap={compact ? "8" : "12"}
      fillWidth
    >
      <Row gap="8" vertical="center" onBackground="danger-strong" textVariant="label-strong-s">
        <Icon name="warning" size="s" />
        <span style={{ textTransform: "uppercase", letterSpacing: "0.06em" }}>Medical alerts</span>
      </Row>
      <Column as="ul" gap="8">
        {alerts.map((alert) => (
          <Row as="li" key={alert} gap="8" vertical="center">
            <Icon name="warning" size={compact ? "xs" : "s"} onBackground="danger-strong" />
            <Text textVariant={compact ? "label-strong-m" : "heading-strong-m"} onBackground="danger-strong">
              {alert}
            </Text>
          </Row>
        ))}
      </Column>
    </Column>
  );
}
```

```tsx components/SearchBox.tsx
"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, Column, Input, Row, Text } from "@once-ui-system/core";
import { ownerById, patients } from "@/lib/data";
import { AlertTags } from "@/components/Alerts";

export function SearchBox() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return patients.filter((p) => {
      const owner = ownerById[p.owner];
      return p.name.toLowerCase().includes(q) || (owner?.name.toLowerCase().includes(q) ?? false);
    });
  }, [query]);

  const showPanel = open && query.trim().length > 0;

  function reset() {
    setQuery("");
    setOpen(false);
  }

  return (
    <div
      role="search"
      style={{ position: "relative", flex: "1 1 16rem", maxWidth: "30rem" }}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOpen(false);
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape") reset();
        if (e.key === "Enter" && results.length > 0) {
          e.preventDefault();
          const first = results[0];
          reset();
          router.push(`/patients/${first.id}`);
        }
      }}
    >
      <Input
        id="patient-search"
        label="Find a patient or owner"
        size="xs"
        value={query}
        onValueChange={(v) => {
          setQuery(v);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        autoComplete="off"
        aria-controls="patient-search-results"
      />
      <div aria-live="polite" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>
        {showPanel ? `${results.length} ${results.length === 1 ? "match" : "matches"}` : ""}
      </div>
      {showPanel && (
        <Column
          id="patient-search-results"
          position="absolute"
          background="surface"
          border
          radius="l"
          shadow="l"
          padding="8"
          gap="4"
          zIndex={1}
          style={{ top: "calc(100% + 0.25rem)", left: 0, right: 0, maxHeight: "70vh", overflowY: "auto" }}
        >
          {results.length === 0 ? (
            <Row padding="12">
              <Text onBackground="neutral-weak" textVariant="body-default-m">
                No patient or owner matches &ldquo;{query.trim()}&rdquo;.
              </Text>
            </Row>
          ) : (
            results.map((p) => {
              const owner = ownerById[p.owner];
              return (
                <Card key={p.id} href={`/patients/${p.id}`} onClick={reset} fillWidth padding="12" radius="m" gap="4">
                  <Row gap="8" vertical="center" wrap>
                    <Text textVariant="label-strong-m">{p.name}</Text>
                    <Text textVariant="body-default-s" onBackground="neutral-weak">
                      {p.species}, {p.breed}
                    </Text>
                  </Row>
                  <Text textVariant="body-default-s" onBackground="neutral-medium">
                    Owner: {owner?.name} &middot; {owner?.phone}
                  </Text>
                  <AlertTags alerts={p.alerts} />
                </Card>
              );
            })
          )}
        </Column>
      )}
    </div>
  );
}
```

```tsx components/AppHeader.tsx
"use client";

import { Avatar, Button, Column, Icon, Row, SmartLink, Text } from "@once-ui-system/core";
import { CLINIC, CLINIC_NAME, user } from "@/lib/data";
import { fmt } from "@/lib/time";
import { useDesk } from "@/components/DeskProvider";
import { SearchBox } from "@/components/SearchBox";

export function AppHeader() {
  const { now, openBooking } = useDesk();
  return (
    <Column
      as="header"
      fillWidth
      background="surface"
      borderBottom
      position="sticky"
      top="0"
      zIndex={5}
      paddingX="16"
      paddingY="12"
      horizontal="center"
    >
      <Row maxWidth="l" wrap gap="16" vertical="center" horizontal="between">
        <SmartLink href="/" unstyled aria-label={`${CLINIC}, ${CLINIC_NAME}. Today's schedule`}>
          <Row gap="12" vertical="center">
            <Row background="brand-alpha-weak" radius="m" padding="8" fit center>
              <Icon name="paw" size="m" onBackground="brand-strong" />
            </Row>
            <Column gap="2">
              <Text textVariant="heading-strong-m">{CLINIC}</Text>
              <Row s={{ hide: true }}>
                <Text textVariant="body-default-xs" onBackground="neutral-weak">
                  {CLINIC_NAME}
                </Text>
              </Row>
            </Column>
          </Row>
        </SmartLink>

        <SearchBox />

        <Row gap="16" vertical="center">
          <Button prefixIcon="plus" size="m" onClick={() => openBooking()}>
            New appointment
          </Button>
          <Row gap="8" vertical="center" s={{ hide: true }}>
            <Icon name="time" size="s" onBackground="neutral-weak" />
            <Text textVariant="label-strong-m" style={{ fontVariantNumeric: "tabular-nums" }} aria-label={`Clinic time ${fmt(now)}`}>
              {fmt(now)}
            </Text>
          </Row>
          <Row gap="8" vertical="center">
            <Avatar value="RL" size="s" />
            <Column gap="2" s={{ hide: true }}>
              <Text textVariant="label-strong-s">{user.name}</Text>
              <Text textVariant="body-default-xs" onBackground="neutral-weak">
                {user.role}
              </Text>
            </Column>
          </Row>
        </Row>
      </Row>
    </Column>
  );
}
```

```tsx components/BookingDialog.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, Column, Dialog, Grid, Icon, Input, Row, Select, Text } from "@once-ui-system/core";
import { ownerById, patientById, patients, vetById, vets } from "@/lib/data";
import { CLOSE, OPEN, findConflict, nextFree } from "@/lib/schedule";
import { fmt, fmtRange, toMin } from "@/lib/time";
import { AlertBanner } from "@/components/Alerts";
import { useDesk } from "@/components/DeskProvider";

const DURATIONS = [15, 20, 30, 45, 60];

function first(value: string | string[]): string {
  return Array.isArray(value) ? (value[0] ?? "") : value;
}

export function BookingDialog() {
  const { appointments, now, book, bookingOpen, bookingPatientId, closeBooking } = useDesk();
  const [patientId, setPatientId] = useState("");
  const [vetId, setVetId] = useState("");
  const [start, setStart] = useState("");
  const [minutes, setMinutes] = useState("20");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (bookingOpen) {
      setPatientId(bookingPatientId ?? "");
      setVetId("");
      setStart("");
      setMinutes("20");
      setReason("");
      setError("");
    }
  }, [bookingOpen, bookingPatientId]);

  const length = Number(minutes);
  const startMin = start ? toMin(start) : null;

  const conflict = useMemo(
    () => (vetId && startMin !== null ? findConflict(appointments, vetId, startMin, length) : undefined),
    [appointments, vetId, startMin, length],
  );
  const pastClose = startMin !== null && startMin + length > CLOSE;
  const suggestion = useMemo(
    () => (conflict && vetId && startMin !== null ? nextFree(appointments, vetId, length, startMin) : null),
    [conflict, appointments, vetId, startMin, length],
  );

  const timeOptions = useMemo(() => {
    const options: { value: string; label: string }[] = [];
    const from = Math.max(OPEN, Math.ceil(now / 15) * 15);
    for (let t = from; t < CLOSE; t += 15) {
      const busy = vetId ? findConflict(appointments, vetId, t, length) : undefined;
      options.push({ value: fmt(t), label: busy ? `${fmt(t)} (busy)` : fmt(t) });
    }
    return options;
  }, [appointments, now, vetId, length]);

  const patient = patientId ? patientById[patientId] : undefined;
  const vet = vetId ? vetById[vetId] : undefined;
  const canSubmit = Boolean(patient && vet && start && reason.trim() && !conflict && !pastClose);

  function submit() {
    if (!canSubmit) return;
    const result = book({ patient: patientId, vet: vetId, start, minutes: length, reason });
    if (result.ok) closeBooking();
    else setError(result.error);
  }

  return (
    <Dialog
      open={bookingOpen}
      onClose={closeBooking}
      title="Book an appointment"
      description="Pick the patient, the vet and a time. Times that clash with the vet's schedule are marked busy."
      footer={
        <Row gap="8" horizontal="end" wrap>
          <Button variant="secondary" onClick={closeBooking}>
            Cancel
          </Button>
          <Button prefixIcon="calendar" disabled={!canSubmit} onClick={submit}>
            Book appointment
          </Button>
        </Row>
      }
    >
      <Column gap="16" fillWidth paddingTop="8">
        <Select
          id="book-patient"
          label="Patient"
          value={patientId}
          onValueChange={(v) => setPatientId(first(v))}
          options={patients.map((p) => ({
            value: p.id,
            label: `${p.name} (${p.species}) · ${ownerById[p.owner]?.name ?? ""}${p.alerts.length ? " · medical alert" : ""}`,
          }))}
        />
        {patient && <AlertBanner alerts={patient.alerts} compact />}

        <Select
          id="book-vet"
          label="Vet"
          value={vetId}
          onValueChange={(v) => {
            setVetId(first(v));
            setError("");
          }}
          options={vets.map((v) => ({ value: v.id, label: `${v.name} · ${v.room}` }))}
        />

        <Grid columns="2" gap="12">
          <Select
            id="book-time"
            label="Start time"
            value={start}
            onValueChange={(v) => {
              setStart(first(v));
              setError("");
            }}
            options={timeOptions}
          />
          <Select
            id="book-length"
            label="Length"
            value={minutes}
            onValueChange={(v) => {
              setMinutes(first(v));
              setError("");
            }}
            options={DURATIONS.map((d) => ({ value: String(d), label: `${d} min` }))}
          />
        </Grid>

        <Input id="book-reason" label="Reason for visit" value={reason} onValueChange={setReason} />

        <div role="status" aria-live="polite">
          {conflict && vet && (
            <Column background="danger-alpha-weak" border="danger-strong" radius="m" padding="12" gap="8">
              <Row gap="8" vertical="start" onBackground="danger-strong" textVariant="label-strong-m">
                <Icon name="warning" size="s" />
                <span>
                  {vet.name} already has {patientById[conflict.patient]?.name} booked{" "}
                  {fmtRange(conflict.start, conflict.minutes)} ({conflict.reason}).
                </span>
              </Row>
              {suggestion !== null && (
                <Row>
                  <Button
                    size="s"
                    variant="secondary"
                    onClick={() => {
                      setStart(fmt(suggestion));
                      setError("");
                    }}
                  >
                    Use next free time, {fmt(suggestion)}
                  </Button>
                </Row>
              )}
            </Column>
          )}
          {!conflict && pastClose && (
            <Text textVariant="label-strong-m" onBackground="danger-strong">
              That visit would run past closing time ({fmt(CLOSE)}).
            </Text>
          )}
          {error && (
            <Text textVariant="label-strong-m" onBackground="danger-strong">
              {error}
            </Text>
          )}
          {!conflict && !pastClose && !error && vet && start && (
            <Text textVariant="body-default-s" onBackground="success-strong">
              {vet.name} is free {fmtRange(start, length)} in {vet.room}.
            </Text>
          )}
        </div>
      </Column>
    </Dialog>
  );
}
```

```tsx components/WaitingList.tsx
"use client";

import { Button, Column, Heading, Icon, Row, SmartLink, Tag, Text } from "@once-ui-system/core";
import { ownerById, patientById, vetById } from "@/lib/data";
import { fmt } from "@/lib/time";
import { AlertTags } from "@/components/Alerts";
import { useDesk } from "@/components/DeskProvider";

export function WaitingList() {
  const { appointments, now, startExam } = useDesk();
  const waiting = appointments
    .filter((a) => a.status === "checked_in")
    .sort((a, b) => (a.checkedInAt ?? 0) - (b.checkedInAt ?? 0));

  return (
    <Column as="section" aria-labelledby="waiting-title" gap="12" fillWidth>
      <Row gap="12" vertical="center" wrap>
        <Heading as="h2" id="waiting-title" textVariant="heading-strong-l">
          Waiting room
        </Heading>
        <Tag tone={waiting.length ? "warning" : "neutral"} label={`${waiting.length} waiting`} />
      </Row>

      {waiting.length === 0 ? (
        <Row background="surface" border radius="l" padding="20" gap="12" vertical="center">
          <Icon name="check" size="m" onBackground="success-strong" />
          <Text textVariant="body-default-m" onBackground="neutral-medium">
            Nobody is waiting. Checked-in patients appear here with how long they have waited.
          </Text>
        </Row>
      ) : (
        <Row as="ol" gap="12" wrap>
          {waiting.map((a, index) => {
            const patient = patientById[a.patient];
            const owner = patient ? ownerById[patient.owner] : undefined;
            const vet = vetById[a.vet];
            const waited = Math.max(0, now - (a.checkedInAt ?? now));
            const tone = waited >= 30 ? "danger" : waited >= 15 ? "warning" : "neutral";
            return (
              <Column
                as="li"
                key={a.id}
                background="surface"
                border={index === 0 ? "brand-strong" : true}
                radius="l"
                padding="16"
                gap="12"
                style={{ flex: "1 1 17rem", maxWidth: "26rem" }}
              >
                <Row horizontal="between" vertical="start" gap="8" wrap>
                  <Row gap="8" vertical="center">
                    <Row
                      background={index === 0 ? "brand-medium" : "neutral-alpha-weak"}
                      radius="full"
                      width={32}
                      height={32}
                      center
                      textVariant="label-strong-m"
                    >
                      {index + 1}
                    </Row>
                    <Column gap="2">
                      <SmartLink href={`/patients/${a.patient}`}>
                        <Text textVariant="heading-strong-m">{patient?.name}</Text>
                      </SmartLink>
                      <Text textVariant="body-default-s" onBackground="neutral-weak">
                        {owner?.name}
                      </Text>
                    </Column>
                  </Row>
                  {index === 0 && <Tag tone="brand" label="Next in line" />}
                </Row>
                <AlertTags alerts={patient?.alerts ?? []} />
                <Row gap="8" wrap vertical="center">
                  <Tag tone={tone} prefixIcon="time" label={`Waiting ${waited} min`} />
                  <Text textVariant="body-default-s" onBackground="neutral-weak">
                    since {fmt(a.checkedInAt ?? now)}
                  </Text>
                </Row>
                <Text textVariant="body-default-s" onBackground="neutral-medium">
                  {a.reason} &middot; {vet?.name}
                </Text>
                <Button
                  variant="secondary"
                  size="s"
                  prefixIcon="arrowRight"
                  onClick={() => startExam(a.id)}
                  aria-label={`Send ${patient?.name} to ${vet?.room}`}
                >
                  Send to {vet?.room}
                </Button>
              </Column>
            );
          })}
        </Row>
      )}
    </Column>
  );
}
```

```tsx components/ScheduleView.tsx
"use client";

import { useMemo, useState } from "react";
import { Button, Column, Grid, Heading, Row, SegmentedControl, SmartLink, Switch, Tag, Text } from "@once-ui-system/core";
import { TODAY, ownerById, patientById, vetById, vets } from "@/lib/data";
import { fmtRange, formatLongDate, toMin } from "@/lib/time";
import { AlertTags } from "@/components/Alerts";
import { useDesk } from "@/components/DeskProvider";
import { StatusTag } from "@/components/StatusTag";
import { WaitingList } from "@/components/WaitingList";

function Stat({ label, value, note }: { label: string; value: number; note?: string }) {
  return (
    <Column background="surface" border radius="l" padding="16" gap="4">
      <Text textVariant="label-default-s" onBackground="neutral-weak">
        {label}
      </Text>
      <Text textVariant="display-strong-xs" style={{ fontVariantNumeric: "tabular-nums" }}>
        {value}
      </Text>
      {note && (
        <Text textVariant="body-default-xs" onBackground="neutral-weak">
          {note}
        </Text>
      )}
    </Column>
  );
}

export function ScheduleView() {
  const { appointments, now, highlightId, checkIn, openBooking } = useDesk();
  const [vetFilter, setVetFilter] = useState("all");
  const [hideFinished, setHideFinished] = useState(false);

  const sorted = useMemo(
    () =>
      [...appointments].sort((a, b) => toMin(a.start) - toMin(b.start) || a.vet.localeCompare(b.vet)),
    [appointments],
  );
  const visible = sorted.filter(
    (a) =>
      (vetFilter === "all" || a.vet === vetFilter) &&
      !(hideFinished && (a.status === "done" || a.status === "cancelled")),
  );

  const waiting = appointments.filter((a) => a.status === "checked_in").length;
  const inExam = appointments.filter((a) => a.status === "in_exam").length;
  const upcoming = sorted.filter((a) => a.status === "booked");
  const done = appointments.filter((a) => a.status === "done").length;
  const next = upcoming[0];
  const nextNote = next ? `Next: ${patientById[next.patient]?.name} at ${next.start}` : "No more bookings";

  return (
    <Column as="main" id="main" fillWidth horizontal="center" paddingX="16" paddingY="24">
      <Column maxWidth="l" gap="32">
        <Row horizontal="between" vertical="end" gap="16" wrap>
          <Column gap="4">
            <Text textVariant="label-default-s" onBackground="neutral-weak">
              {formatLongDate(TODAY)}
            </Text>
            <Heading as="h1" textVariant="display-strong-xs">
              Today&rsquo;s schedule
            </Heading>
          </Column>
          <Button variant="secondary" prefixIcon="plus" onClick={() => openBooking()}>
            Book a follow-up
          </Button>
        </Row>

        <Grid columns="4" gap="12" m={{ columns: "2" }}>
          <Stat label="Waiting now" value={waiting} />
          <Stat label="In exam" value={inExam} />
          <Stat label="Still to arrive" value={upcoming.length} note={nextNote} />
          <Stat label="Finished" value={done} />
        </Grid>

        <WaitingList />

        <Column as="section" aria-labelledby="schedule-title" gap="16">
          <Row horizontal="between" vertical="center" gap="16" wrap>
            <Heading as="h2" id="schedule-title" textVariant="heading-strong-l">
              All appointments
            </Heading>
            <Switch
              label="Hide done and cancelled"
              checked={hideFinished}
              onCheckedChange={setHideFinished}
            />
          </Row>
          <SegmentedControl
            buttons={[
              { value: "all", label: "All vets" },
              ...vets.map((v) => ({ value: v.id, label: v.name })),
            ]}
            value={vetFilter}
            onValueChange={setVetFilter}
            aria-label="Filter by vet"
          />

          {visible.length === 0 ? (
            <Column background="surface" border radius="l" padding="24">
              <Text onBackground="neutral-medium">No appointments match this filter.</Text>
            </Column>
          ) : (
            <Column as="ul" gap="8">
              {visible.map((a) => {
                const patient = patientById[a.patient];
                const owner = patient ? ownerById[patient.owner] : undefined;
                const vet = vetById[a.vet];
                const finished = a.status === "done" || a.status === "cancelled";
                const waited = Math.max(0, now - (a.checkedInAt ?? now));
                return (
                  <Row
                    as="li"
                    key={a.id}
                    background={a.urgent ? "warning-alpha-weak" : a.id === highlightId ? "brand-alpha-weak" : "surface"}
                    border={a.urgent ? "warning-strong" : a.id === highlightId ? "brand-strong" : true}
                    borderWidth={a.urgent ? 2 : 1}
                    radius="l"
                    overflow="hidden"
                    vertical="stretch"
                  >
                    {a.urgent && <Row width={8} background="warning-strong" aria-hidden="true" />}
                    <Row fillWidth wrap gap="16" padding="16" vertical="center" opacity={finished ? 70 : 100}>
                      <Column gap="2" style={{ flex: "0 0 5.5rem" }}>
                        <Text textVariant="heading-strong-l" style={{ fontVariantNumeric: "tabular-nums" }}>
                          {a.start}
                        </Text>
                        <Text textVariant="body-default-xs" onBackground="neutral-weak">
                          {fmtRange(a.start, a.minutes).split("–")[1]} &middot; {a.minutes} min
                        </Text>
                      </Column>

                      <Column gap="4" style={{ flex: "1 1 14rem" }}>
                        <Row gap="8" vertical="center" wrap>
                          <SmartLink href={`/patients/${a.patient}`}>
                            <Text textVariant="heading-strong-m">{patient?.name}</Text>
                          </SmartLink>
                          <Text textVariant="body-default-s" onBackground="neutral-weak">
                            {patient?.species}
                          </Text>
                          {a.urgent && <Tag tone="warning" prefixIcon="bolt" label="Urgent" />}
                        </Row>
                        <Text textVariant="body-default-s" onBackground="neutral-medium">
                          {owner?.name} &middot; {owner?.phone}
                        </Text>
                        <AlertTags alerts={patient?.alerts ?? []} />
                      </Column>

                      <Column gap="2" style={{ flex: "1 1 11rem" }}>
                        <Text textVariant="label-strong-m">{a.reason}</Text>
                        <Text textVariant="body-default-s" onBackground="neutral-weak">
                          {vet?.name} &middot; {vet?.room}
                        </Text>
                      </Column>

                      <Row gap="12" vertical="center" wrap style={{ flex: "0 0 auto" }}>
                        <StatusTag status={a.status} />
                        {a.status === "booked" && (
                          <Button
                            size="s"
                            prefixIcon="check"
                            onClick={() => checkIn(a.id)}
                            aria-label={`Check in ${patient?.name}`}
                          >
                            Check in
                          </Button>
                        )}
                        {a.status === "checked_in" && (
                          <Text textVariant="label-strong-s" onBackground="warning-strong">
                            Waiting {waited} min
                          </Text>
                        )}
                      </Row>
                    </Row>
                  </Row>
                );
              })}
            </Column>
          )}
        </Column>
      </Column>
    </Column>
  );
}
```

```tsx components/Panel.tsx
"use client";

import { useId } from "react";
import { Column, Heading, Row } from "@once-ui-system/core";

export function Panel({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  const id = useId();
  return (
    <Column as="section" aria-labelledby={id} background="surface" border radius="l" padding="24" gap="16" fillWidth>
      <Row horizontal="between" vertical="center" gap="12" wrap>
        <Heading as="h2" id={id} textVariant="heading-strong-l">
          {title}
        </Heading>
        {action}
      </Row>
      {children}
    </Column>
  );
}
```

```tsx components/WeightChart.tsx
import { Column, Row, Text } from "@once-ui-system/core";
import type { Weight } from "@/lib/data";
import { daysBetween, formatDate } from "@/lib/time";

const W = 600;
const H = 180;
const PAD = 16;

export function WeightChart({ weights }: { weights: Weight[] }) {
  if (weights.length === 0) return null;
  const first = weights[0];
  const last = weights[weights.length - 1];
  const kgs = weights.map((w) => w.kg);
  const min = Math.floor(Math.min(...kgs) - 0.5);
  const max = Math.ceil(Math.max(...kgs) + 0.5);
  const span = Math.max(1, daysBetween(first.date, last.date));

  const points = weights.map((w) => ({
    x: PAD + (daysBetween(first.date, w.date) / span) * (W - PAD * 2),
    y: PAD + (1 - (w.kg - min) / (max - min)) * (H - PAD * 2),
    ...w,
  }));
  const line = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
  const area = `${line} L${points[points.length - 1].x.toFixed(1)} ${H - PAD} L${points[0].x.toFixed(1)} ${H - PAD} Z`;

  const change = last.kg - first.kg;
  const pct = (change / first.kg) * 100;
  const months = Math.round(span / 30.44);
  const summary = `Weight went from ${first.kg} kg on ${formatDate(first.date)} to ${last.kg} kg on ${formatDate(last.date)}, a change of ${change.toFixed(1)} kg over ${months} months.`;

  return (
    <Column gap="16" fillWidth>
      <Row horizontal="between" vertical="end" wrap gap="8">
        <Column gap="2">
          <Text textVariant="display-strong-xs" style={{ fontVariantNumeric: "tabular-nums" }}>
            {last.kg.toFixed(1)} kg
          </Text>
          <Text textVariant="body-default-s" onBackground="neutral-weak">
            on {formatDate(last.date)}
          </Text>
        </Column>
        <Text textVariant="label-strong-m" onBackground="danger-strong" style={{ fontVariantNumeric: "tabular-nums" }}>
          {change.toFixed(1).replace("-", "−")} kg ({pct.toFixed(1).replace("-", "−")}%) in {months} months
        </Text>
      </Row>

      <Row onBackground="brand-strong" fillWidth>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label={summary}
          style={{ width: "100%", height: "auto", display: "block" }}
        >
          {[0, 1, 2, 3].map((i) => {
            const y = PAD + (i / 3) * (H - PAD * 2);
            return <line key={i} x1={PAD} x2={W - PAD} y1={y} y2={y} stroke="currentColor" strokeOpacity="0.15" />;
          })}
          <path d={area} fill="currentColor" fillOpacity="0.12" />
          <path d={line} fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
          {points.map((p, i) => (
            <circle key={p.date} cx={p.x} cy={p.y} r={i === points.length - 1 ? 7 : 4.5} fill="currentColor" />
          ))}
        </svg>
      </Row>

      <Row horizontal="between">
        <Text textVariant="body-default-xs" onBackground="neutral-weak">
          Scale {min} to {max} kg
        </Text>
      </Row>

      <Column as="ul" gap="0">
        {[...weights].reverse().map((w, i, arr) => {
          const prev = arr[i + 1];
          const delta = prev ? w.kg - prev.kg : null;
          return (
            <Row
              as="li"
              key={w.date}
              horizontal="between"
              vertical="center"
              paddingY="8"
              borderTop={i === 0 ? false : true}
              gap="12"
            >
              <Text textVariant="body-default-m">{formatDate(w.date)}</Text>
              <Row gap="16" vertical="center">
                <Text textVariant="label-strong-m" style={{ fontVariantNumeric: "tabular-nums" }}>
                  {w.kg.toFixed(1)} kg
                </Text>
                <Text
                  textVariant="body-default-s"
                  onBackground={delta !== null && delta < 0 ? "danger-strong" : "neutral-weak"}
                  style={{ fontVariantNumeric: "tabular-nums", minWidth: "4.5rem", textAlign: "right" }}
                >
                  {delta === null ? "first" : `${delta > 0 ? "+" : "−"}${Math.abs(delta).toFixed(1)} kg`}
                </Text>
              </Row>
            </Row>
          );
        })}
      </Column>
    </Column>
  );
}
```

```tsx components/PatientRecord.tsx
"use client";

import { Button, Column, Grid, Heading, Icon, Row, SmartLink, Tag, Text } from "@once-ui-system/core";
import {
  TODAY,
  ownerById,
  patientById,
  records,
  vetById,
  type Vaccination,
} from "@/lib/data";
import { ageLabel, daysBetween, formatDate, fmtRange, money, toMin } from "@/lib/time";
import { AlertBanner } from "@/components/Alerts";
import { useDesk } from "@/components/DeskProvider";
import { Panel } from "@/components/Panel";
import { StatusTag } from "@/components/StatusTag";
import { WeightChart } from "@/components/WeightChart";

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Row gap="16" vertical="start" wrap>
      <Text textVariant="label-default-s" onBackground="neutral-weak" style={{ flex: "0 0 6.5rem" }}>
        {label}
      </Text>
      <Column flex="1" gap="2" style={{ minWidth: "10rem" }}>
        {children}
      </Column>
    </Row>
  );
}

function vaccinationState(v: Vaccination) {
  const days = daysBetween(TODAY, v.due);
  if (days < 0) {
    return { tone: "danger" as const, icon: "warning" as const, label: `Overdue by ${-days} ${-days === 1 ? "day" : "days"}`, overdue: true };
  }
  if (days <= 60) {
    return { tone: "warning" as const, icon: "time" as const, label: `Due in ${days} days`, overdue: false };
  }
  return { tone: "success" as const, icon: "check" as const, label: "Up to date", overdue: false };
}

export function PatientRecord({ id }: { id: string }) {
  const { appointments, checkIn, openBooking } = useDesk();
  const patient = patientById[id];
  if (!patient) return null;
  const owner = ownerById[patient.owner];
  const record = records[id];
  const todays = appointments
    .filter((a) => a.patient === id)
    .sort((a, b) => toMin(a.start) - toMin(b.start));

  const vaccinations = record
    ? record.vaccinations
        .map((v) => ({ v, state: vaccinationState(v) }))
        .sort((a, b) => Number(b.state.overdue) - Number(a.state.overdue) || a.v.due.localeCompare(b.v.due))
    : [];
  const overdue = vaccinations.filter((x) => x.state.overdue);
  const latestWeight = record?.weights_kg[record.weights_kg.length - 1];

  return (
    <Column as="main" id="main" fillWidth horizontal="center" paddingX="16" paddingY="24">
      <Column maxWidth="l" gap="24">
        <Row>
          <Button href="/" variant="tertiary" size="s" prefixIcon="arrowLeft">
            Today&rsquo;s schedule
          </Button>
        </Row>

        <Row horizontal="between" vertical="end" gap="16" wrap>
          <Column gap="8">
            <Row gap="12" vertical="center" wrap>
              <Heading as="h1" textVariant="display-strong-s">
                {patient.name}
              </Heading>
              <Tag tone="neutral" label={patient.species} />
            </Row>
            <Text textVariant="body-default-l" onBackground="neutral-medium">
              {patient.breed} &middot; {ageLabel(patient.born, TODAY)} &middot; {patient.sex}
            </Text>
          </Column>
          <Button prefixIcon="calendar" onClick={() => openBooking(patient.id)}>
            Book follow-up
          </Button>
        </Row>

        <AlertBanner alerts={patient.alerts} />

        {overdue.length > 0 && (
          <Row
            background="warning-alpha-weak"
            border="warning-strong"
            radius="l"
            padding="16"
            gap="12"
            vertical="start"
            role="note"
          >
            <Icon name="warning" size="m" onBackground="warning-strong" />
            <Column gap="2">
              <Text textVariant="label-strong-m" onBackground="warning-strong">
                {overdue.length} {overdue.length === 1 ? "vaccination is" : "vaccinations are"} overdue
              </Text>
              <Text textVariant="body-default-s" onBackground="neutral-medium">
                {overdue.map((x) => `${x.v.name} (due ${formatDate(x.v.due)})`).join(", ")}
              </Text>
            </Column>
          </Row>
        )}

        <Grid columns="2" gap="24" m={{ columns: "1" }}>
          <Column gap="24">
            <Panel title="Patient and owner">
              <Column gap="12">
                <Fact label="Patient">
                  <Text textVariant="label-strong-m">{patient.name}</Text>
                  <Text textVariant="body-default-s" onBackground="neutral-medium">
                    {patient.species}, {patient.breed}
                  </Text>
                </Fact>
                <Fact label="Born">
                  <Text textVariant="body-default-m">
                    {formatDate(patient.born)} ({ageLabel(patient.born, TODAY)})
                  </Text>
                </Fact>
                <Fact label="Sex">
                  <Text textVariant="body-default-m">{patient.sex}</Text>
                </Fact>
                {latestWeight && (
                  <Fact label="Weight">
                    <Text textVariant="body-default-m">
                      {latestWeight.kg.toFixed(1)} kg ({formatDate(latestWeight.date)})
                    </Text>
                  </Fact>
                )}
                <Fact label="Owner">
                  <Text textVariant="label-strong-m">{owner?.name}</Text>
                  {owner && (
                    <SmartLink href={`tel:${owner.phone.replace(/\s/g, "")}`} prefixIcon="phone">
                      {owner.phone}
                    </SmartLink>
                  )}
                </Fact>
              </Column>
            </Panel>

            <Panel title="At the clinic today">
              {todays.length === 0 ? (
                <Text onBackground="neutral-medium">No appointments today.</Text>
              ) : (
                <Column as="ul" gap="12">
                  {todays.map((a) => (
                    <Row as="li" key={a.id} gap="12" vertical="center" horizontal="between" wrap>
                      <Column gap="2">
                        <Text textVariant="label-strong-m">
                          {fmtRange(a.start, a.minutes)} &middot; {a.reason}
                        </Text>
                        <Text textVariant="body-default-s" onBackground="neutral-weak">
                          {vetById[a.vet]?.name} &middot; {vetById[a.vet]?.room}
                        </Text>
                      </Column>
                      <Row gap="8" vertical="center">
                        <StatusTag status={a.status} />
                        {a.status === "booked" && (
                          <Button size="s" prefixIcon="check" onClick={() => checkIn(a.id)}>
                            Check in
                          </Button>
                        )}
                      </Row>
                    </Row>
                  ))}
                </Column>
              )}
            </Panel>

            {record && (
              <Panel title="Vaccinations">
                <Column as="ul" gap="8">
                  {vaccinations.map(({ v, state }) => (
                    <Row
                      as="li"
                      key={v.name}
                      background={state.overdue ? "danger-alpha-weak" : "neutral-alpha-weak"}
                      border={state.overdue ? "danger-strong" : "transparent"}
                      radius="m"
                      padding="12"
                      gap="12"
                      horizontal="between"
                      vertical="center"
                      wrap
                    >
                      <Column gap="2">
                        <Text textVariant="label-strong-m">{v.name}</Text>
                        <Text textVariant="body-default-s" onBackground="neutral-medium">
                          Given {formatDate(v.given)} &middot; due {formatDate(v.due)}
                        </Text>
                      </Column>
                      <Tag tone={state.tone} prefixIcon={state.icon} label={state.label} />
                    </Row>
                  ))}
                </Column>
              </Panel>
            )}

            {record && (
              <Panel title="Current medications">
                <Column as="ul" gap="12">
                  {record.medications.map((m) => (
                    <Row as="li" key={m.name} gap="12" vertical="start">
                      <Icon name="bolt" size="s" onBackground="brand-strong" />
                      <Column gap="2">
                        <Text textVariant="label-strong-m">{m.name}</Text>
                        <Text textVariant="body-default-s" onBackground="neutral-medium">
                          {m.dose} &middot; since {formatDate(m.since)}
                        </Text>
                      </Column>
                    </Row>
                  ))}
                </Column>
              </Panel>
            )}
          </Column>

          <Column gap="24">
            {record ? (
              <>
                <Panel title="Weight trend">
                  <WeightChart weights={record.weights_kg} />
                </Panel>
                <Panel title="Visit history">
                  <Column as="ol" gap="16">
                    {[...record.visits]
                      .sort((a, b) => b.date.localeCompare(a.date))
                      .map((visit, i) => (
                        <Column
                          as="li"
                          key={visit.date}
                          gap="8"
                          paddingTop={i === 0 ? "0" : "16"}
                          borderTop={i === 0 ? false : true}
                        >
                          <Row horizontal="between" vertical="center" gap="8" wrap>
                            <Row gap="8" vertical="center" wrap>
                              <Text textVariant="label-strong-m">{formatDate(visit.date)}</Text>
                              {visit.date === TODAY && <Tag tone="brand" label="Today" />}
                            </Row>
                            <Text textVariant="body-default-s" onBackground="neutral-weak" style={{ fontVariantNumeric: "tabular-nums" }}>
                              {money(visit.invoice_usd)}
                            </Text>
                          </Row>
                          <Text textVariant="heading-strong-m">{visit.reason}</Text>
                          <Text textVariant="body-default-s" onBackground="neutral-weak">
                            {vetById[visit.vet]?.name}
                          </Text>
                          <Text textVariant="body-default-m" onBackground="neutral-strong">
                            {visit.notes}
                          </Text>
                        </Column>
                      ))}
                  </Column>
                </Panel>
              </>
            ) : (
              <Panel title="Clinical record">
                <Text textVariant="body-default-m" onBackground="neutral-medium">
                  No weights, vaccinations, medications or visit notes are on file for {patient.name} yet.
                </Text>
              </Panel>
            )}
          </Column>
        </Grid>
      </Column>
    </Column>
  );
}
```

```tsx app/page.tsx
import { ScheduleView } from "@/components/ScheduleView";

export default function Page() {
  return <ScheduleView />;
}
```

```tsx app/patients/[id]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { patientById, patients } from "@/lib/data";
import { PatientRecord } from "@/components/PatientRecord";

export function generateStaticParams() {
  return patients.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const patient = patientById[id];
  return { title: patient ? `${patient.name} | Pawpoint` : "Patient | Pawpoint" };
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!patientById[id]) notFound();
  return <PatientRecord id={id} />;
}
```

```tsx app/layout.tsx
import "@once-ui-system/core/css/styles.css";
import "@once-ui-system/core/css/tokens.css";
import "./fonts.css";

import type { Metadata } from "next";
import { Column, Flex, VisuallyHidden } from "@once-ui-system/core";
import { Providers } from "./providers";
import { DeskProvider } from "@/components/DeskProvider";
import { AppHeader } from "@/components/AppHeader";
import { BookingDialog } from "@/components/BookingDialog";

export const metadata: Metadata = {
  title: "Pawpoint | Hillside Veterinary Clinic",
  description: "Front-desk and records software for Hillside Veterinary Clinic.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <Flex as="html" lang="en" suppressHydrationWarning>
      <Column as="body" background="page" fillWidth margin="0" padding="0" minHeight="100vh">
        <Providers>
          <DeskProvider>
            <VisuallyHidden as="a" href="#main" focusable>
              Skip to main content
            </VisuallyHidden>
            <AppHeader />
            {children}
            <BookingDialog />
          </DeskProvider>
        </Providers>
      </Column>
    </Flex>
  );
}
```
