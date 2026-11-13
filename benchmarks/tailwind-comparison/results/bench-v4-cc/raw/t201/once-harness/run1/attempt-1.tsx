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

export const CLINIC = "Pawpoint, front-desk and records software for Hillside Veterinary Clinic";
export const TODAY = "2026-11-12";
/** The front-desk clock at page load (09:50). */
export const NOW_MINUTES = 9 * 60 + 50;
export const OPEN_MINUTES = 8 * 60;
export const CLOSE_MINUTES = 17 * 60;

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
      { date: "2026-11-12", vet: "v-2", reason: "Kidney panel recheck", notes: "Creatinine 2.1 mg/dL (was 2.0). Weight down 0.6 kg. Continue benazepril, recheck in 3 months.", invoice_usd: 186.0 },
      { date: "2026-06-17", vet: "v-2", reason: "Kidney panel recheck", notes: "Stable. Appetite good. Owner reports more drinking in hot weather.", invoice_usd: 172.5 },
      { date: "2026-02-11", vet: "v-1", reason: "Coughing", notes: "Mild kennel cough. Supportive care; no antibiotics given (penicillin allergy).", invoice_usd: 94.0 },
      { date: "2025-11-03", vet: "v-2", reason: "Senior wellness exam", notes: "Grade 2 dental tartar. Dental cleaning recommended.", invoice_usd: 148.0 },
    ],
  },
};

/* ---------- helpers ---------- */

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const FULL_MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function parts(date: string): [number, number, number] {
  const [y, m, d] = date.split("-").map(Number);
  return [y, m, d];
}

export function toMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function fromMinutes(total: number): string {
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function formatMinutes(total: number): string {
  const h = Math.floor(total / 60);
  const m = total % 60;
  const suffix = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${suffix}`;
}

export function formatTime(time: string): string {
  return formatMinutes(toMinutes(time));
}

export function formatDate(date: string): string {
  const [y, m, d] = parts(date);
  return `${MONTHS[m - 1]} ${d}, ${y}`;
}

export function formatMonthYear(date: string): string {
  const [y, m] = parts(date);
  return `${MONTHS[m - 1]} '${String(y).slice(2)}`;
}

export function formatLongDate(date: string): string {
  const [y, m, d] = parts(date);
  const dow = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return `${DAYS[dow]}, ${FULL_MONTHS[m - 1]} ${d}, ${y}`;
}

export function daysBetween(from: string, to: string): number {
  const [fy, fm, fd] = parts(from);
  const [ty, tm, td] = parts(to);
  return Math.round((Date.UTC(ty, tm - 1, td) - Date.UTC(fy, fm - 1, fd)) / 86400000);
}

export function ageText(born: string, today: string = TODAY): string {
  const [by, bm, bd] = parts(born);
  const [ty, tm, td] = parts(today);
  let months = (ty - by) * 12 + (tm - bm);
  if (td < bd) months -= 1;
  const years = Math.floor(months / 12);
  const rest = months % 12;
  if (years === 0) return `${rest} mo`;
  return rest === 0 ? `${years} yr` : `${years} yr ${rest} mo`;
}

export function formatDuration(total: number): string {
  if (total < 60) return `${total} min`;
  const h = Math.floor(total / 60);
  const m = total % 60;
  return m === 0 ? `${h} h` : `${h} h ${String(m).padStart(2, "0")} min`;
}

export function formatUsd(value: number): string {
  return `$${value.toFixed(2)}`;
}

export function initials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function findPatient(id: string): Patient | undefined {
  return patients.find((p) => p.id === id);
}
export function findOwner(id: string): Owner | undefined {
  return owners.find((o) => o.id === id);
}
export function findVet(id: string): Vet | undefined {
  return vets.find((v) => v.id === id);
}
```

```tsx components/Panel.tsx
import { Column, Heading, Row } from "@once-ui-system/core";

export function Panel({
  id,
  title,
  aside,
  children,
}: {
  id: string;
  title: string;
  aside?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Column as="section" aria-labelledby={id} background="surface" border radius="l" padding="24" gap="16" fillWidth>
      <Row horizontal="between" vertical="center" gap="12" wrap>
        <Heading as="h2" id={id} textVariant="heading-strong-l">
          {title}
        </Heading>
        {aside}
      </Row>
      {children}
    </Column>
  );
}
```

```tsx components/Alerts.tsx
import { Column, Icon, Row, Tag, Text } from "@once-ui-system/core";

/** Compact alert chips, used wherever a patient appears in a list. */
export function AlertTags({ alerts }: { alerts: string[] }) {
  if (alerts.length === 0) return null;
  return (
    <Row gap="4" wrap role="group" aria-label="Medical alerts">
      {alerts.map((a) => (
        <Tag key={a} tone="danger" prefixIcon="danger" size="s" label={`Alert: ${a}`} />
      ))}
    </Row>
  );
}

/** Large, high-contrast alert block, used on a patient record and in the booking form. */
export function AlertBanner({ alerts, patientName }: { alerts: string[]; patientName: string }) {
  if (alerts.length === 0) return null;
  return (
    <Row
      as="section"
      role="region"
      aria-label={`Medical alerts for ${patientName}`}
      fillWidth
      background="danger-alpha-weak"
      border="danger-alpha-strong"
      borderWidth={2}
      radius="l"
      padding="16"
      gap="16"
      vertical="center"
    >
      <Row fit>
        <Icon name="danger" size="xl" onBackground="danger-strong" decorative />
      </Row>
      <Column gap="4">
        <Text textVariant="label-strong-s" onBackground="danger-strong">
          MEDICAL ALERTS
        </Text>
        {alerts.map((a) => (
          <Text key={a} textVariant="heading-strong-m" onBackground="danger-strong">
            {a}
          </Text>
        ))}
      </Column>
    </Row>
  );
}
```

```tsx components/AppHeader.tsx
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Avatar, Column, Icon, Input, Row, Text, VisuallyHidden } from "@once-ui-system/core";
import { USER, findOwner, initials, patients } from "@/lib/data";
import { AlertTags } from "./Alerts";

export function AppHeader() {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();

  const matches = useMemo(() => {
    if (!q) return [];
    return patients
      .map((p) => ({ p, owner: findOwner(p.owner) }))
      .filter(({ p, owner }) => p.name.toLowerCase().includes(q) || (owner?.name.toLowerCase().includes(q) ?? false));
  }, [q]);

  return (
    <Row
      as="header"
      fillWidth
      background="surface"
      borderBottom
      horizontal="center"
      paddingX="16"
      paddingY="12"
    >
      <Row fillWidth maxWidth="80rem" gap="16" vertical="center" wrap>
        <Link href="/" style={{ color: "inherit", textDecoration: "none" }} aria-label="Pawpoint, today's schedule">
          <Row gap="12" vertical="center">
            <Row fit background="brand-alpha-weak" radius="m" padding="8">
              <Icon name="paw" size="l" onBackground="brand-strong" decorative />
            </Row>
            <Column gap="0">
              <Text textVariant="heading-strong-m">Pawpoint</Text>
              <Text textVariant="body-default-xs" onBackground="neutral-weak" s={{ hide: true }}>
                Hillside Veterinary Clinic
              </Text>
            </Column>
          </Row>
        </Link>

        <Column
          flex="1"
          minWidth="260px"
          maxWidth="32rem"
          position="relative"
          onKeyDown={(e: React.KeyboardEvent) => {
            if (e.key === "Escape") setQuery("");
          }}
        >
          <Input
            id="patient-search"
            label="Search patients or owners"
            size="s"
            type="search"
            autoComplete="off"
            value={query}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
            prefix={<Icon name="search" size="s" onBackground="neutral-weak" decorative />}
          />
          <VisuallyHidden>
            <span role="status" aria-live="polite">
              {q ? `${matches.length} ${matches.length === 1 ? "result" : "results"}` : ""}
            </span>
          </VisuallyHidden>
          {q ? (
            <Column
              position="absolute"
              top="100%"
              left="0"
              fillWidth
              marginTop="4"
              zIndex={10}
              background="surface"
              border
              radius="m"
              shadow="l"
              padding="8"
              gap="4"
            >
              {matches.length === 0 ? (
                <Row padding="12">
                  <Text onBackground="neutral-weak">No patient or owner matches “{query.trim()}”.</Text>
                </Row>
              ) : (
                matches.map(({ p, owner }) => (
                  <Link
                    key={p.id}
                    href={`/patients/${p.id}`}
                    style={{ color: "inherit", textDecoration: "none" }}
                    onClick={() => setQuery("")}
                  >
                    <Column padding="12" radius="s" gap="4" background="neutral-alpha-weak">
                      <Row gap="8" vertical="center" wrap>
                        <Text textVariant="label-strong-m">{p.name}</Text>
                        <Text textVariant="body-default-s" onBackground="neutral-weak">
                          {p.species}, {p.breed} · owner {owner?.name}
                        </Text>
                      </Row>
                      <AlertTags alerts={p.alerts} />
                    </Column>
                  </Link>
                ))
              )}
            </Column>
          ) : null}
        </Column>

        <Row gap="12" vertical="center" marginLeft="auto">
          <Column horizontal="end" gap="0" s={{ hide: true }}>
            <Text textVariant="label-strong-s">{USER.name}</Text>
            <Text textVariant="body-default-xs" onBackground="neutral-weak">
              {USER.role}
            </Text>
          </Column>
          <Avatar value={initials(USER.name)} size="m" />
        </Row>
      </Row>
    </Row>
  );
}
```

```tsx components/Schedule.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Button,
  Column,
  Dialog,
  Grid,
  Heading,
  Input,
  Row,
  SegmentedControl,
  Select,
  Tag,
  Text,
  useToast,
} from "@once-ui-system/core";
import {
  CLOSE_MINUTES,
  NOW_MINUTES,
  OPEN_MINUTES,
  TODAY,
  type Appointment,
  type Status,
  findOwner,
  findPatient,
  findVet,
  formatDuration,
  formatLongDate,
  formatMinutes,
  formatTime,
  fromMinutes,
  initialAppointments,
  patients,
  toMinutes,
  vets,
} from "@/lib/data";
import { AlertBanner, AlertTags } from "./Alerts";
import { Panel } from "./Panel";

type ToneName = "neutral" | "brand" | "accent" | "info" | "success" | "warning" | "danger";

const STATUS_LABEL: Record<Status, string> = {
  booked: "Booked",
  checked_in: "Checked in",
  in_exam: "In exam",
  done: "Done",
  cancelled: "Cancelled",
};
const STATUS_TONE: Record<Status, ToneName> = {
  booked: "neutral",
  checked_in: "warning",
  in_exam: "accent",
  done: "success",
  cancelled: "neutral",
};

const SLOT_OPTIONS = (() => {
  const out: { value: string; label: string }[] = [];
  for (let t = OPEN_MINUTES; t < CLOSE_MINUTES; t += 15) {
    out.push({ value: fromMinutes(t), label: formatMinutes(t) });
  }
  return out;
})();

const DURATION_OPTIONS = [15, 20, 30, 45, 60, 90].map((m) => ({ value: String(m), label: formatDuration(m) }));

function overlaps(aStart: number, aLen: number, bStart: number, bLen: number) {
  return aStart < bStart + bLen && bStart < aStart + aLen;
}

function findClash(list: Appointment[], vetId: string, start: number, len: number) {
  return list.find(
    (a) => a.vet === vetId && a.status !== "cancelled" && overlaps(start, len, toMinutes(a.start), a.minutes),
  );
}

function nextFree(list: Appointment[], vetId: string, from: number, len: number) {
  for (let t = from; t + len <= CLOSE_MINUTES; t += 15) {
    if (!findClash(list, vetId, t, len)) return t;
  }
  return null;
}

export function Schedule() {
  const { addToast } = useToast();
  const [appts, setAppts] = useState<Appointment[]>(initialAppointments);
  const [now, setNow] = useState(NOW_MINUTES);
  const [vetFilter, setVetFilter] = useState("all");

  const [open, setOpen] = useState(false);
  const [patientId, setPatientId] = useState("");
  const [vetId, setVetId] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState("20");
  const [reason, setReason] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const id = window.setInterval(() => setNow((n) => n + 1), 60000);
    return () => window.clearInterval(id);
  }, []);

  const sorted = useMemo(
    () =>
      [...appts].sort((a, b) => toMinutes(a.start) - toMinutes(b.start) || a.vet.localeCompare(b.vet)),
    [appts],
  );
  const visible = sorted.filter((a) => vetFilter === "all" || a.vet === vetFilter);
  const waiting = useMemo(
    () =>
      appts
        .filter((a) => a.status === "checked_in")
        .sort((a, b) => (a.checkedInAt ?? 0) - (b.checkedInAt ?? 0)),
    [appts],
  );
  const active = appts.filter((a) => a.status !== "cancelled");
  const counts = {
    total: active.length,
    waiting: waiting.length,
    inExam: appts.filter((a) => a.status === "in_exam").length,
    upcoming: appts.filter((a) => a.status === "booked").length,
  };

  function setStatus(id: string, status: Status) {
    setAppts((list) =>
      list.map((a) =>
        a.id === id ? { ...a, status, checkedInAt: status === "checked_in" ? now : a.checkedInAt } : a,
      ),
    );
  }

  function checkIn(a: Appointment) {
    setStatus(a.id, "checked_in");
    const p = findPatient(a.patient);
    addToast({ tone: "success", message: `${p?.name ?? "Patient"} checked in at ${formatMinutes(now)}.` });
  }

  /* ----- booking form ----- */
  const len = Number(duration);
  const start = time ? toMinutes(time) : null;
  const clash = start !== null && vetId ? findClash(appts, vetId, start, len) : undefined;
  const pastClose = start !== null && start + len > CLOSE_MINUTES;
  const suggestion = clash && start !== null ? nextFree(appts, vetId, start, len) : null;
  const selectedPatient = patientId ? findPatient(patientId) : undefined;

  let timeError = "";
  if (submitted && !time) timeError = "Pick a start time.";
  else if (pastClose) timeError = `Runs past closing time (${formatMinutes(CLOSE_MINUTES)}). Pick an earlier start or a shorter visit.`;
  else if (clash) {
    const cp = findPatient(clash.patient);
    const cv = findVet(clash.vet);
    timeError = `${cv?.name} already has ${cp?.name} from ${formatTime(clash.start)} to ${formatMinutes(
      toMinutes(clash.start) + clash.minutes,
    )}.${suggestion !== null ? ` Next free start: ${formatMinutes(suggestion)}.` : " No free slot left today."}`;
  }

  function resetForm() {
    setPatientId("");
    setVetId("");
    setTime("");
    setDuration("20");
    setReason("");
    setSubmitted(false);
  }

  function closeDialog() {
    setOpen(false);
    resetForm();
  }

  function submit() {
    setSubmitted(true);
    if (!patientId || !vetId || !time || !reason.trim() || clash || pastClose) return;
    const id = `a-${String(appts.length + 1).padStart(2, "0")}`;
    const created: Appointment = {
      id,
      patient: patientId,
      vet: vetId,
      start: time,
      minutes: len,
      reason: reason.trim(),
      status: "booked",
    };
    setAppts((list) => [...list, created]);
    addToast({
      tone: "success",
      message: `${selectedPatient?.name} booked with ${findVet(vetId)?.name} at ${formatTime(time)}.`,
    });
    setOpen(false);
    resetForm();
  }

  return (
    <Column fillWidth gap="24">
      <Row horizontal="between" vertical="end" gap="16" wrap>
        <Column gap="4">
          <Text textVariant="label-default-s" onBackground="neutral-weak">
            {formatLongDate(TODAY)}
          </Text>
          <Heading as="h1" textVariant="display-strong-xs">
            Today&apos;s schedule
          </Heading>
        </Column>
        <Row gap="12" vertical="center">
          <Text textVariant="label-default-s" onBackground="neutral-weak">
            Front desk time {formatMinutes(now)}
          </Text>
          <Button prefixIcon="plus" onClick={() => setOpen(true)}>
            Book appointment
          </Button>
        </Row>
      </Row>

      <Grid columns="4" s={{ columns: 2 }} gap="12" fillWidth>
        <Stat label="Appointments" value={counts.total} />
        <Stat label="Waiting" value={counts.waiting} tone={counts.waiting > 0 ? "warning" : undefined} />
        <Stat label="In exam" value={counts.inExam} />
        <Stat label="Still to arrive" value={counts.upcoming} />
      </Grid>

      <Row direction="row-reverse" gap="24" m={{ direction: "column" }} fillWidth vertical="start">
        <Column width={360} m={{ fillWidth: true }} gap="24">
          <Panel id="waiting-heading" title="Waiting room" aside={<Tag tone={waiting.length ? "warning" : "neutral"} size="s" label={`${waiting.length} waiting`} />}>
            <Column gap="12" aria-live="polite">
              {waiting.length === 0 ? (
                <Text onBackground="neutral-weak">Nobody is waiting. Checked-in patients appear here.</Text>
              ) : (
                <Column as="ol" gap="12" padding="0" margin="0">
                  {waiting.map((a, i) => {
                    const p = findPatient(a.patient);
                    const vet = findVet(a.vet);
                    const waited = Math.max(0, now - (a.checkedInAt ?? now));
                    const long = waited >= 20;
                    return (
                      <Column
                        as="li"
                        key={a.id}
                        gap="8"
                        padding="12"
                        radius="m"
                        background={long ? "warning-alpha-weak" : "neutral-alpha-weak"}
                        border={long ? "warning-alpha-medium" : undefined}
                      >
                        <Row horizontal="between" vertical="center" gap="8" wrap>
                          <Row gap="8" vertical="center">
                            <Text textVariant="label-strong-s" onBackground="neutral-weak">
                              {i + 1}.
                            </Text>
                            <Link href={`/patients/${p?.id}`} style={{ color: "inherit", textUnderlineOffset: "3px" }}>
                              <Text textVariant="heading-strong-m">{p?.name}</Text>
                            </Link>
                            {i === 0 ? <Tag tone="brand" size="s" label="Next" /> : null}
                          </Row>
                          <Text textVariant="label-strong-m" onBackground={long ? "warning-strong" : "neutral-strong"}>
                            {formatDuration(waited)}
                          </Text>
                        </Row>
                        <Text textVariant="body-default-s" onBackground="neutral-weak">
                          {a.reason} · {vet?.name}, {vet?.room} · booked {formatTime(a.start)}
                        </Text>
                        <AlertTags alerts={p?.alerts ?? []} />
                        <Row>
                          <Button
                            size="s"
                            variant="secondary"
                            prefixIcon="arrowRight"
                            aria-label={`Send ${p?.name} to ${vet?.room}`}
                            onClick={() => setStatus(a.id, "in_exam")}
                          >
                            Send to {vet?.room}
                          </Button>
                        </Row>
                      </Column>
                    );
                  })}
                </Column>
              )}
            </Column>
          </Panel>

          <Panel id="vets-heading" title="Vets today">
            <Column gap="12">
              {vets.map((v) => {
                const current = appts.find((a) => a.vet === v.id && a.status === "in_exam");
                const left = appts.filter((a) => a.vet === v.id && (a.status === "booked" || a.status === "checked_in")).length;
                return (
                  <Row key={v.id} horizontal="between" vertical="center" gap="12">
                    <Column gap="0">
                      <Text textVariant="label-strong-m">{v.name}</Text>
                      <Text textVariant="body-default-s" onBackground="neutral-weak">
                        {v.room} · {left} to see
                      </Text>
                    </Column>
                    <Tag
                      tone={current ? "accent" : "success"}
                      size="s"
                      dot
                      label={current ? `With ${findPatient(current.patient)?.name}` : "Free"}
                    />
                  </Row>
                );
              })}
            </Column>
          </Panel>
        </Column>

        <Column fillWidth gap="16">
          <SegmentedControl
            aria-label="Filter schedule by vet"
            value={vetFilter}
            onValueChange={setVetFilter}
            buttons={[
              { value: "all", label: "All vets" },
              ...vets.map((v) => ({ value: v.id, label: v.name })),
            ]}
          />
          <Column as="ul" gap="12" padding="0" margin="0" fillWidth>
            {visible.map((a) => (
              <AppointmentRow key={a.id} a={a} now={now} onCheckIn={checkIn} onStatus={setStatus} />
            ))}
            {visible.length === 0 ? (
              <Text onBackground="neutral-weak">No appointments for this vet today.</Text>
            ) : null}
          </Column>
        </Column>
      </Row>

      <Dialog
        open={open}
        onClose={closeDialog}
        title="Book appointment"
        description={`${formatLongDate(TODAY)}. A vet cannot be double-booked.`}
        footer={
          <Row gap="8" horizontal="end" fillWidth>
            <Button variant="secondary" onClick={closeDialog}>
              Cancel
            </Button>
            <Button onClick={submit}>Book appointment</Button>
          </Row>
        }
      >
        <Column gap="16" paddingY="8">
          <Select
            id="book-patient"
            label="Patient"
            value={patientId}
            onValueChange={(v) => setPatientId(v as string)}
            error={submitted && !patientId}
            errorMessage="Pick a patient."
            searchable
            options={patients.map((p) => ({
              value: p.id,
              label: `${p.name} (${p.species}), owner ${findOwner(p.owner)?.name}`,
            }))}
          />
          {selectedPatient ? <AlertBanner alerts={selectedPatient.alerts} patientName={selectedPatient.name} /> : null}
          <Select
            id="book-vet"
            label="Vet"
            value={vetId}
            onValueChange={(v) => setVetId(v as string)}
            error={submitted && !vetId}
            errorMessage="Pick a vet."
            options={vets.map((v) => ({ value: v.id, label: `${v.name}, ${v.room}` }))}
          />
          <Row gap="12" s={{ direction: "column" }}>
            <Select
              id="book-time"
              label="Start time"
              value={time}
              onValueChange={(v) => setTime(v as string)}
              error={!!timeError}
              errorMessage={timeError}
              options={SLOT_OPTIONS}
            />
            <Select
              id="book-duration"
              label="Length"
              value={duration}
              onValueChange={(v) => setDuration(v as string)}
              options={DURATION_OPTIONS}
            />
          </Row>
          <Input
            id="book-reason"
            label="Reason for visit"
            value={reason}
            error={submitted && !reason.trim()}
            errorMessage="Add a short reason."
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setReason(e.target.value)}
          />
        </Column>
      </Dialog>
    </Column>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone?: ToneName }) {
  return (
    <Column background="surface" border radius="l" padding="16" gap="4">
      <Text textVariant="label-default-s" onBackground="neutral-weak">
        {label}
      </Text>
      <Text textVariant="display-strong-xs" onBackground={tone === "warning" ? "warning-strong" : "neutral-strong"}>
        {value}
      </Text>
    </Column>
  );
}

function AppointmentRow({
  a,
  now,
  onCheckIn,
  onStatus,
}: {
  a: Appointment;
  now: number;
  onCheckIn: (a: Appointment) => void;
  onStatus: (id: string, s: Status) => void;
}) {
  const p = findPatient(a.patient);
  const owner = p ? findOwner(p.owner) : undefined;
  const vet = findVet(a.vet);
  const cancelled = a.status === "cancelled";
  const urgent = a.urgent && a.status !== "done" && !cancelled;
  const end = toMinutes(a.start) + a.minutes;
  const late = a.status === "booked" && toMinutes(a.start) < now;

  return (
    <Row
      as="li"
      fillWidth
      background={urgent ? "danger-alpha-weak" : "surface"}
      border={urgent ? "danger-alpha-strong" : true}
      borderWidth={urgent ? 2 : 1}
      radius="l"
      padding="16"
      gap="16"
      vertical="center"
      wrap
      opacity={cancelled ? 60 : 100}
    >
      <Column width="72" gap="0">
        <Text textVariant="label-strong-l">{formatTime(a.start)}</Text>
        <Text textVariant="body-default-xs" onBackground="neutral-weak">
          to {formatMinutes(end)}
        </Text>
      </Column>

      <Column flex="1" minWidth="220px" gap="4">
        <Row gap="8" vertical="center" wrap>
          <Link
            href={`/patients/${a.patient}`}
            style={{
              color: "inherit",
              textUnderlineOffset: "3px",
              textDecoration: cancelled ? "line-through" : "underline",
            }}
          >
            <Text textVariant="heading-strong-m">{p?.name}</Text>
          </Link>
          <Text textVariant="body-default-s" onBackground="neutral-weak">
            {p?.species}, {p?.breed}
          </Text>
          {urgent ? <Tag tone="danger" variant="gradient" prefixIcon="bolt" size="s" label="Urgent" /> : null}
        </Row>
        <Text textVariant="body-default-m">{a.reason}</Text>
        <Text textVariant="body-default-s" onBackground="neutral-weak">
          Owner {owner?.name} · {vet?.name}, {vet?.room}
        </Text>
        <AlertTags alerts={p?.alerts ?? []} />
      </Column>

      <Row gap="8" vertical="center" wrap marginLeft="auto">
        {late ? <Tag tone="warning" size="s" prefixIcon="time" label="Not here yet" /> : null}
        <Tag tone={STATUS_TONE[a.status]} size="m" dot label={STATUS_LABEL[a.status]} />
        {a.status === "booked" ? (
          <Button size="s" prefixIcon="check" aria-label={`Check in ${p?.name}`} onClick={() => onCheckIn(a)}>
            Check in
          </Button>
        ) : null}
        {a.status === "checked_in" ? (
          <Button size="s" variant="secondary" aria-label={`Start exam for ${p?.name}`} onClick={() => onStatus(a.id, "in_exam")}>
            Start exam
          </Button>
        ) : null}
        {a.status === "in_exam" ? (
          <Button size="s" variant="secondary" aria-label={`Mark ${p?.name} done`} onClick={() => onStatus(a.id, "done")}>
            Mark done
          </Button>
        ) : null}
      </Row>
    </Row>
  );
}
```

```tsx components/PatientRecord.tsx
"use client";

import Link from "next/link";
import { Avatar, Button, Column, Grid, Heading, Icon, Row, Tag, Text, VisuallyHidden } from "@once-ui-system/core";
import {
  TODAY,
  ageText,
  daysBetween,
  findOwner,
  findVet,
  formatDate,
  formatLongDate,
  formatMonthYear,
  formatTime,
  formatUsd,
  initialAppointments,
  initials,
  patients,
  records,
  type Weight,
} from "@/lib/data";
import { AlertBanner } from "./Alerts";
import { Panel } from "./Panel";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Row horizontal="between" gap="16" wrap>
      <Text textVariant="body-default-m" onBackground="neutral-weak">
        {label}
      </Text>
      <Text textVariant="label-strong-m" align="right">
        {children}
      </Text>
    </Row>
  );
}

export function PatientRecord({ id }: { id: string }) {
  const patient = patients.find((p) => p.id === id);
  if (!patient) return null;
  const owner = findOwner(patient.owner);
  const record = records[id];
  const otherPets = patients.filter((p) => p.owner === patient.owner && p.id !== patient.id);
  const todays = initialAppointments.filter((a) => a.patient === id && a.status !== "cancelled");
  const overdue = record ? record.vaccinations.filter((v) => v.due < TODAY) : [];

  return (
    <Column fillWidth gap="24">
      <Row gap="16" vertical="center" wrap>
        <Button variant="tertiary" size="s" prefixIcon="arrowLeft" href="/">
          Schedule
        </Button>
      </Row>

      <Row gap="16" vertical="center" wrap>
        <Avatar value={initials(patient.name)} size="xl" />
        <Column gap="4">
          <Heading as="h1" textVariant="display-strong-xs">
            {patient.name}
          </Heading>
          <Text textVariant="body-default-l" onBackground="neutral-weak">
            {patient.breed} · {patient.species} · {ageText(patient.born)} · {patient.sex}
          </Text>
        </Column>
      </Row>

      <AlertBanner alerts={patient.alerts} patientName={patient.name} />

      {overdue.length > 0 ? (
        <Row
          role="note"
          fillWidth
          background="warning-alpha-weak"
          border="warning-alpha-strong"
          radius="l"
          padding="12"
          gap="12"
          vertical="center"
        >
          <Row fit>
            <Icon name="warning" size="m" onBackground="warning-strong" decorative />
          </Row>
          <Text textVariant="label-strong-m">
            {overdue.length} vaccinations overdue: {overdue.map((v) => v.name).join(", ")}
          </Text>
        </Row>
      ) : null}

      {todays.length > 0 ? (
        <Panel id="today-heading" title="At the clinic today">
          <Column as="ul" gap="8" padding="0" margin="0">
            {todays.map((a) => (
              <Row as="li" key={a.id} gap="12" vertical="center" wrap>
                <Text textVariant="label-strong-m">{formatTime(a.start)}</Text>
                <Text>
                  {a.reason} with {findVet(a.vet)?.name}
                </Text>
                <Tag
                  size="s"
                  tone={a.status === "done" ? "success" : "neutral"}
                  label={a.status === "done" ? "Done" : a.status === "booked" ? "Booked" : a.status === "checked_in" ? "Checked in" : "In exam"}
                />
              </Row>
            ))}
          </Column>
        </Panel>
      ) : null}

      <Grid columns="2" m={{ columns: 1 }} gap="24" fillWidth>
        <Panel id="patient-heading" title="Patient">
          <Column gap="12">
            <Field label="Species">{patient.species}</Field>
            <Field label="Breed">{patient.breed}</Field>
            <Field label="Born">
              {formatDate(patient.born)} ({ageText(patient.born)})
            </Field>
            <Field label="Sex">{patient.sex}</Field>
            <Field label="Patient ID">{patient.id}</Field>
          </Column>
        </Panel>
        <Panel id="owner-heading" title="Owner">
          <Column gap="12">
            <Field label="Name">{owner?.name}</Field>
            <Field label="Phone">
              <a href={`tel:${owner?.phone.replace(/\s/g, "")}`} style={{ color: "inherit" }}>
                {owner?.phone}
              </a>
            </Field>
            {otherPets.length > 0 ? (
              <Field label="Other pets">
                {otherPets.map((p, i) => (
                  <span key={p.id}>
                    {i > 0 ? ", " : ""}
                    <Link href={`/patients/${p.id}`} style={{ color: "inherit" }}>
                      {p.name}
                    </Link>
                  </span>
                ))}
              </Field>
            ) : null}
          </Column>
        </Panel>
      </Grid>

      {record ? (
        <>
          <WeightPanel weights={record.weights_kg} />

          <Panel
            id="vax-heading"
            title="Vaccinations"
            aside={overdue.length > 0 ? <Tag tone="danger" size="s" prefixIcon="warning" label={`${overdue.length} overdue`} /> : undefined}
          >
            <Column as="ul" gap="12" padding="0" margin="0">
              {record.vaccinations.map((v) => {
                const left = daysBetween(TODAY, v.due);
                const status =
                  left < 0
                    ? { tone: "danger" as const, label: `Overdue by ${-left} days`, icon: "warning" as const }
                    : left <= 60
                      ? { tone: "warning" as const, label: `Due in ${left} days`, icon: "time" as const }
                      : { tone: "success" as const, label: "Up to date", icon: "check" as const };
                return (
                  <Row
                    as="li"
                    key={v.name}
                    gap="16"
                    wrap
                    vertical="center"
                    horizontal="between"
                    padding="12"
                    radius="m"
                    background={left < 0 ? "danger-alpha-weak" : "neutral-alpha-weak"}
                    border={left < 0 ? "danger-alpha-medium" : undefined}
                  >
                    <Column gap="0">
                      <Text textVariant="label-strong-m">{v.name}</Text>
                      <Text textVariant="body-default-s" onBackground="neutral-weak">
                        Given {formatDate(v.given)} · due {formatDate(v.due)}
                      </Text>
                    </Column>
                    <Tag tone={status.tone} prefixIcon={status.icon} label={status.label} />
                  </Row>
                );
              })}
            </Column>
            <Text textVariant="body-default-xs" onBackground="neutral-weak">
              Checked against today, {formatLongDate(TODAY)}.
            </Text>
          </Panel>

          <Panel id="meds-heading" title="Current medications">
            <Column as="ul" gap="12" padding="0" margin="0">
              {record.medications.map((m) => (
                <Row as="li" key={m.name} gap="16" wrap horizontal="between" vertical="center">
                  <Column gap="0">
                    <Text textVariant="label-strong-m">{m.name}</Text>
                    <Text textVariant="body-default-s" onBackground="neutral-weak">
                      {m.dose}
                    </Text>
                  </Column>
                  <Text textVariant="body-default-s" onBackground="neutral-weak">
                    Since {formatDate(m.since)}
                  </Text>
                </Row>
              ))}
            </Column>
          </Panel>

          <Panel id="visits-heading" title="Visit history">
            <Column as="ol" gap="16" padding="0" margin="0">
              {record.visits.map((v) => (
                <Column as="li" key={v.date} gap="8" padding="16" radius="m" background="neutral-alpha-weak">
                  <Row horizontal="between" gap="12" wrap vertical="center">
                    <Row gap="8" vertical="center" wrap>
                      <Text textVariant="label-strong-m">{formatDate(v.date)}</Text>
                      {v.date === TODAY ? <Tag tone="brand" size="s" label="Today" /> : null}
                      <Text textVariant="body-default-m">{v.reason}</Text>
                    </Row>
                    <Text textVariant="body-default-s" onBackground="neutral-weak">
                      {findVet(v.vet)?.name} · {formatUsd(v.invoice_usd)}
                    </Text>
                  </Row>
                  <Text textVariant="body-default-m">{v.notes}</Text>
                </Column>
              ))}
            </Column>
          </Panel>
        </>
      ) : (
        <Panel id="empty-heading" title="Chart">
          <Text onBackground="neutral-weak">
            No weights, vaccinations or visit notes are on file for {patient.name} yet.
          </Text>
        </Panel>
      )}
    </Column>
  );
}

function WeightPanel({ weights }: { weights: Weight[] }) {
  const W = 480;
  const H = 240;
  const padL = 36;
  const padR = 28;
  const padT = 32;
  const padB = 40;
  const t = (d: string) => Date.parse(`${d}T00:00:00Z`);
  const t0 = t(weights[0].date);
  const t1 = t(weights[weights.length - 1].date);
  const kgs = weights.map((w) => w.kg);
  const lo = Math.floor(Math.min(...kgs) - 0.5);
  const hi = Math.ceil(Math.max(...kgs) + 0.5);
  const x = (d: string) => padL + ((t(d) - t0) / (t1 - t0)) * (W - padL - padR);
  const y = (kg: number) => padT + (1 - (kg - lo) / (hi - lo)) * (H - padT - padB);
  const ticks = [lo, lo + (hi - lo) / 2, hi];
  const path = weights.map((w, i) => `${i === 0 ? "M" : "L"}${x(w.date).toFixed(1)} ${y(w.kg).toFixed(1)}`).join(" ");
  const first = weights[0];
  const last = weights[weights.length - 1];
  const change = last.kg - first.kg;
  const pct = (change / first.kg) * 100;

  return (
    <Panel
      id="weight-heading"
      title="Weight trend"
      aside={
        <Tag
          tone="warning"
          size="m"
          prefixIcon="trendDown"
          label={`${change.toFixed(1)} kg (${pct.toFixed(1)}%) since ${formatDate(first.date)}`}
        />
      }
    >
      <Row gap="8" vertical="end">
        <Text textVariant="display-strong-xs">{last.kg.toFixed(1)} kg</Text>
        <Text textVariant="body-default-m" onBackground="neutral-weak" marginBottom="4">
          on {formatDate(last.date)}
        </Text>
      </Row>
      <Row fillWidth onBackground="neutral-medium">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label={`Weight over ${weights.length} visits, from ${first.kg} kilograms to ${last.kg} kilograms`}
          style={{ width: "100%", height: "auto", display: "block", color: "currentColor" }}
        >
          {ticks.map((tk) => (
            <g key={tk}>
              <line x1={padL} x2={W - padR + 8} y1={y(tk)} y2={y(tk)} stroke="currentColor" strokeOpacity={0.2} />
              <text x={padL - 8} y={y(tk) + 4} textAnchor="end" fontSize={12} fill="currentColor">
                {Number.isInteger(tk) ? tk : tk.toFixed(1)}
              </text>
            </g>
          ))}
          <path d={path} fill="none" stroke="var(--brand-solid-strong)" strokeWidth={3} strokeLinejoin="round" strokeLinecap="round" />
          {weights.map((w, i) => (
            <g key={w.date}>
              <circle cx={x(w.date)} cy={y(w.kg)} r={i === weights.length - 1 ? 6 : 4} fill="var(--brand-solid-strong)" />
              <text x={x(w.date)} y={y(w.kg) - 12} textAnchor="middle" fontSize={13} fontWeight={600} fill="currentColor">
                {w.kg.toFixed(1)}
              </text>
              <text x={x(w.date)} y={H - 14} textAnchor="middle" fontSize={12} fill="currentColor">
                {formatMonthYear(w.date)}
              </text>
            </g>
          ))}
        </svg>
      </Row>
      <VisuallyHidden>
        <ul>
          {weights.map((w) => (
            <li key={w.date}>
              {formatDate(w.date)}: {w.kg} kg
            </li>
          ))}
        </ul>
      </VisuallyHidden>
      <Text textVariant="body-default-s" onBackground="neutral-weak">
        Weight in kg at each visit. Steady loss across all six visits; flagged for the vet alongside the kidney alert.
      </Text>
    </Panel>
  );
}
```

```tsx app/page.tsx
import type { Metadata } from "next";
import { Column } from "@once-ui-system/core";
import { AppHeader } from "@/components/AppHeader";
import { Schedule } from "@/components/Schedule";

export const metadata: Metadata = {
  title: "Today's schedule | Pawpoint",
  description: "Front desk schedule for Hillside Veterinary Clinic.",
};

export default function Page() {
  return (
    <Column fillWidth minHeight="100vh">
      <AppHeader />
      <Column as="main" id="main" fillWidth horizontal="center" paddingX="16" paddingY="24">
        <Column fillWidth maxWidth="80rem">
          <Schedule />
        </Column>
      </Column>
    </Column>
  );
}
```

```tsx app/patients/[id]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Column } from "@once-ui-system/core";
import { AppHeader } from "@/components/AppHeader";
import { PatientRecord } from "@/components/PatientRecord";
import { patients } from "@/lib/data";

export function generateStaticParams() {
  return patients.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const patient = patients.find((p) => p.id === id);
  return { title: patient ? `${patient.name} | Pawpoint` : "Patient | Pawpoint" };
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!patients.some((p) => p.id === id)) notFound();
  return (
    <Column fillWidth minHeight="100vh">
      <AppHeader />
      <Column as="main" id="main" fillWidth horizontal="center" paddingX="16" paddingY="24">
        <Column fillWidth maxWidth="64rem">
          <PatientRecord id={id} />
        </Column>
      </Column>
    </Column>
  );
}
```
