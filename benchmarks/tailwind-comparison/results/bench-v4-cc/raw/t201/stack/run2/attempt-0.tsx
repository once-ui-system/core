```ts src/lib/data.ts
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

export const CLINIC = "Pawpoint, front-desk and records software for Hillside Veterinary Clinic";
export const TODAY = "2026-11-12";
/** The demo clock starts here (minutes after midnight) and then ticks once a minute. */
export const NOW_MINUTES = 9 * 60 + 55;
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
      { date: "2026-11-12", vet: "v-2", reason: "Kidney panel recheck", notes: "Creatinine 2.1 mg/dL (was 2.0). Weight down 0.6 kg. Continue benazepril, recheck in 3 months.", invoice_usd: 186.0 },
      { date: "2026-06-17", vet: "v-2", reason: "Kidney panel recheck", notes: "Stable. Appetite good. Owner reports more drinking in hot weather.", invoice_usd: 172.5 },
      { date: "2026-02-11", vet: "v-1", reason: "Coughing", notes: "Mild kennel cough. Supportive care; no antibiotics given (penicillin allergy).", invoice_usd: 94.0 },
      { date: "2025-11-03", vet: "v-2", reason: "Senior wellness exam", notes: "Grade 2 dental tartar. Dental cleaning recommended.", invoice_usd: 148.0 },
    ],
  },
};

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

export function getOwner(id: string): Owner {
  return owners.find((o) => o.id === id) ?? { id, name: "Unknown owner", phone: "" };
}

export function getVet(id: string): Vet {
  return vets.find((v) => v.id === id) ?? { id, name: "Unassigned", room: "" };
}

export function toMinutes(clock: string): number {
  const [h, m] = clock.split(":").map(Number);
  return h * 60 + m;
}

export function toClock(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function dayNumber(iso: string): number {
  const [y, m, d] = iso.split("-").map(Number);
  return Date.UTC(y, m - 1, d) / 86400000;
}

export function daysBetween(from: string, to: string): number {
  return Math.round(dayNumber(to) - dayNumber(from));
}

export function formatDate(iso: string, style: "long" | "short" | "month" = "short"): string {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  const options: Intl.DateTimeFormatOptions =
    style === "long"
      ? { weekday: "long", month: "long", day: "numeric", year: "numeric" }
      : style === "month"
        ? { month: "short", year: "2-digit" }
        : { month: "short", day: "numeric", year: "numeric" };
  return new Intl.DateTimeFormat("en-US", { timeZone: "UTC", ...options }).format(date);
}

export function ageLabel(born: string, today: string = TODAY): string {
  const days = daysBetween(born, today);
  const years = Math.floor(days / 365.25);
  if (years >= 2) return `${years} years`;
  const months = Math.floor(days / 30.44);
  return `${months} months`;
}

export function timeRange(a: { start: string; minutes: number }): string {
  const s = toMinutes(a.start);
  return `${a.start}–${toClock(s + a.minutes)}`;
}

export function overlaps(a: Appointment, start: number, minutes: number): boolean {
  if (a.status === "cancelled") return false;
  const s = toMinutes(a.start);
  return start < s + a.minutes && s < start + minutes;
}

/** An existing booking for the same vet that overlaps the proposed slot. */
export function findVetConflict(
  list: Appointment[],
  vetId: string,
  start: number,
  minutes: number,
): Appointment | undefined {
  return list.find((a) => a.vet === vetId && overlaps(a, start, minutes));
}

export type VaccinationState = { kind: "overdue"; days: number } | { kind: "soon"; days: number } | { kind: "ok"; days: number };

export function vaccinationState(due: string, today: string = TODAY): VaccinationState {
  const days = daysBetween(today, due);
  if (days < 0) return { kind: "overdue", days: -days };
  if (days <= 30) return { kind: "soon", days };
  return { kind: "ok", days };
}

export function searchPatients(query: string): Patient[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return patients.filter((p) => {
    const owner = getOwner(p.owner).name.toLowerCase();
    return p.name.toLowerCase().includes(q) || owner.includes(q);
  });
}
```

```tsx src/components/pawpoint/Alerts.tsx
import { Column, Icon, Row, Tag, Text } from "@once-ui-system/core";

/** Compact alert chips, for rows, lists and search results. Icon plus text, never colour alone. */
export function AlertTags({ alerts }: { alerts: string[] }) {
  if (alerts.length === 0) return null;
  return (
    <Row gap="4" wrap role="group" aria-label="Medical alerts">
      {alerts.map((alert) => (
        <Tag key={alert} scheme="danger" size="m" prefixIcon="warning">
          <span style={{ fontWeight: 700 }}>{alert}</span>
        </Tag>
      ))}
    </Row>
  );
}

/** Full-width banner for the places where an alert must not be missed. */
export function AlertBanner({ alerts, name }: { alerts: string[]; name?: string }) {
  if (alerts.length === 0) return null;
  return (
    <Column
      role="group"
      aria-label={name ? `Medical alerts for ${name}` : "Medical alerts"}
      background="danger-alpha-weak"
      border="danger-strong"
      borderWidth={2}
      radius="l"
      padding="16"
      gap="8"
      fillWidth
    >
      <Row gap="8" vertical="center">
        <Icon name="warning" onBackground="danger-strong" size="m" />
        <Text variant="label-strong-s" onBackground="danger-strong" style={{ letterSpacing: "0.08em", textTransform: "uppercase" }}>
          {alerts.length === 1 ? "Medical alert" : "Medical alerts"}
        </Text>
      </Row>
      <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
        {alerts.map((alert) => (
          <li key={alert}>
            <Text variant="heading-strong-m" onBackground="danger-strong">
              {alert}
            </Text>
          </li>
        ))}
      </ul>
    </Column>
  );
}
```

```tsx src/components/pawpoint/AppHeader.tsx
import Link from "next/link";
import { Avatar, Column, Icon, Row, Text, VisuallyHidden } from "@once-ui-system/core";
import { USER } from "@/lib/data";

export function SkipLink() {
  return (
    <VisuallyHidden as="a" href="#main" focusable>
      Skip to main content
    </VisuallyHidden>
  );
}

export function AppHeader() {
  return (
    <Row
      as="header"
      fillWidth
      background="surface"
      borderBottom
      paddingX="16"
      paddingY="12"
      horizontal="between"
      vertical="center"
      gap="16"
      position="sticky"
      top="0"
      zIndex={10}
    >
      <Link href="/" aria-label="Pawpoint, today's schedule" style={{ textDecoration: "none", color: "inherit" }}>
        <Row gap="12" vertical="center">
          <Row center width="40" height="40" radius="m" background="brand-medium" border="brand-medium">
            <Icon name="paw" size="m" onBackground="brand-strong" />
          </Row>
          <Column>
            <Text variant="heading-strong-l">Pawpoint</Text>
            <Text variant="body-default-xs" onBackground="neutral-weak" s={{ hide: true }}>
              Hillside Veterinary Clinic
            </Text>
          </Column>
        </Row>
      </Link>
      <Row gap="12" vertical="center">
        <Column horizontal="end" gap="2" s={{ hide: true }}>
          <Text variant="label-strong-s">{USER.name}</Text>
          <Text variant="body-default-xs" onBackground="neutral-weak">
            {USER.role}
          </Text>
        </Column>
        <Avatar value="RL" size="m" aria-label={`${USER.name}, ${USER.role}`} />
      </Row>
    </Row>
  );
}
```

```tsx src/components/pawpoint/WeightChart.tsx
import { dayNumber, formatDate, type Weight } from "@/lib/data";

/** Weight over visits, drawn as inline SVG so it needs no chart library. */
export function WeightChart({ points, name }: { points: Weight[]; name: string }) {
  const W = 560;
  const H = 260;
  const padL = 44;
  const padR = 28;
  const padT = 36;
  const padB = 48;

  const kgs = points.map((p) => p.kg);
  const lo = Math.floor(Math.min(...kgs) - 1);
  const hi = Math.ceil(Math.max(...kgs) + 1);
  const d0 = dayNumber(points[0].date);
  const d1 = dayNumber(points[points.length - 1].date);

  const x = (date: string) => padL + ((dayNumber(date) - d0) / (d1 - d0 || 1)) * (W - padL - padR);
  const y = (kg: number) => padT + ((hi - kg) / (hi - lo)) * (H - padT - padB);

  const ticks: number[] = [];
  for (let t = lo; t <= hi; t += 2) ticks.push(t);

  const line = points.map((p, i) => `${i === 0 ? "M" : "L"}${x(p.date).toFixed(1)} ${y(p.kg).toFixed(1)}`).join(" ");
  const area = `${line} L${x(points[points.length - 1].date).toFixed(1)} ${H - padB} L${x(points[0].date).toFixed(1)} ${H - padB} Z`;

  const first = points[0];
  const last = points[points.length - 1];
  const summary = `${name}'s weight fell from ${first.kg.toFixed(1)} kilograms on ${formatDate(first.date)} to ${last.kg.toFixed(1)} kilograms on ${formatDate(last.date)} across ${points.length} visits.`;

  return (
    <div
      role="region"
      aria-label={`Weight trend for ${name}, scrollable`}
      tabIndex={0}
      style={{ overflowX: "auto", maxWidth: "100%" }}
    >
      <svg
        role="img"
        aria-label={summary}
        viewBox={`0 0 ${W} ${H}`}
        style={{ display: "block", width: "100%", minWidth: "26rem", height: "auto" }}
      >
        <title>{summary}</title>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={padL} x2={W - padR} y1={y(t)} y2={y(t)} stroke="var(--neutral-alpha-medium)" strokeDasharray="3 4" />
            <text x={padL - 8} y={y(t) + 4} textAnchor="end" fontSize="12" fill="var(--neutral-on-background-weak)">
              {t}
            </text>
          </g>
        ))}
        <path d={area} fill="var(--brand-alpha-weak)" />
        <path d={line} fill="none" stroke="var(--brand-solid-strong)" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
        {points.map((p, i) => {
          const isLast = i === points.length - 1;
          return (
            <g key={p.date}>
              <circle cx={x(p.date)} cy={y(p.kg)} r={isLast ? 6 : 4.5} fill="var(--brand-solid-strong)" />
              <text
                x={x(p.date)}
                y={y(p.kg) - 12}
                textAnchor="middle"
                fontSize="14"
                fontWeight={isLast ? 700 : 500}
                fill="var(--neutral-on-background-strong)"
              >
                {p.kg.toFixed(1)}
              </text>
              <text x={x(p.date)} y={H - padB + 22} textAnchor="middle" fontSize="12" fill="var(--neutral-on-background-weak)">
                {formatDate(p.date, "month")}
              </text>
            </g>
          );
        })}
        <text x={padL} y={14} fontSize="12" fill="var(--neutral-on-background-weak)">
          kg
        </text>
      </svg>
    </div>
  );
}
```

```tsx src/components/pawpoint/ScheduleClient.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Button,
  Checkbox,
  Column,
  Dialog,
  Grid,
  Heading,
  Icon,
  Input,
  Row,
  SegmentedControl,
  Tag,
  Text,
} from "@once-ui-system/core";
import {
  CLOSE_MINUTES,
  NOW_MINUTES,
  OPEN_MINUTES,
  STATUS_LABEL,
  TODAY,
  findVetConflict,
  formatDate,
  getOwner,
  getPatient,
  getVet,
  initialAppointments,
  overlaps,
  patients,
  searchPatients,
  timeRange,
  toClock,
  toMinutes,
  vets,
  type Appointment,
  type Patient,
  type Status,
} from "@/lib/data";
import { AlertBanner, AlertTags } from "./Alerts";

const STATUS_SCHEME: Record<Status, "neutral" | "info" | "brand" | "success"> = {
  booked: "neutral",
  checked_in: "info",
  in_exam: "brand",
  done: "success",
  cancelled: "neutral",
};

const SLOTS: number[] = [];
for (let m = OPEN_MINUTES; m < CLOSE_MINUTES; m += 15) SLOTS.push(m);
const DURATIONS = [15, 20, 30, 45, 60];

const controlStyle: React.CSSProperties = {
  width: "100%",
  minHeight: "3rem",
  padding: "0 0.75rem",
  borderRadius: "var(--radius-m)",
  border: "1px solid var(--neutral-alpha-strong)",
  background: "var(--surface-background)",
  color: "var(--neutral-on-background-strong)",
  font: "inherit",
  fontSize: "1rem",
};

const listReset: React.CSSProperties = { listStyle: "none", margin: 0, padding: 0 };

function patientOf(id: string): Patient {
  return getPatient(id) ?? patients[0];
}

/* ---------- search ---------- */

function PatientSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const results = useMemo(() => searchPatients(query), [query]);
  const active = query.trim().length > 0;

  return (
    <Column gap="8" fillWidth style={{ flex: "1 1 18rem", minWidth: 0 }}>
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          if (results[0]) router.push(`/patients/${results[0].id}`);
        }}
      >
        <Input
          id="patient-search"
          type="search"
          label="Search patient or owner by name"
          value={query}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
          autoComplete="off"
        />
      </form>
      {active && (
        <Column background="surface" border radius="l" padding="8" gap="4" fillWidth aria-live="polite">
          {results.length === 0 ? (
            <Text variant="body-default-m" onBackground="neutral-weak" padding="8">
              No patient or owner matches &ldquo;{query.trim()}&rdquo;.
            </Text>
          ) : (
            <ul style={{ ...listReset, display: "flex", flexDirection: "column", gap: "0.25rem" }}>
              {results.slice(0, 6).map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/patients/${p.id}`}
                    style={{ display: "block", textDecoration: "none", color: "inherit", padding: "0.5rem 0.75rem", borderRadius: "var(--radius-m)" }}
                  >
                    <Row gap="12" vertical="center" wrap horizontal="between">
                      <Column gap="2">
                        <Text variant="label-strong-m">
                          {p.name}{" "}
                          <Text as="span" variant="body-default-s" onBackground="neutral-weak">
                            {p.species}, {p.breed}
                          </Text>
                        </Text>
                        <Text variant="body-default-s" onBackground="neutral-weak">
                          Owner: {getOwner(p.owner).name}
                        </Text>
                      </Column>
                      <Row gap="8" vertical="center">
                        <AlertTags alerts={p.alerts} />
                        <Icon name="chevronRight" size="s" onBackground="neutral-weak" />
                      </Row>
                    </Row>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Column>
      )}
    </Column>
  );
}

/* ---------- booking ---------- */

interface NewBooking {
  patient: string;
  vet: string;
  start: string;
  minutes: number;
  reason: string;
  urgent: boolean;
}

function slotProblem(list: Appointment[], now: number, vetId: string, patientId: string, start: number, minutes: number): string | null {
  if (start < now) return "That time has already passed. Pick a later slot.";
  if (start + minutes > CLOSE_MINUTES) return `That visit would run past closing at ${toClock(CLOSE_MINUTES)}.`;
  const vetClash = findVetConflict(list, vetId, start, minutes);
  if (vetClash) {
    return `${getVet(vetId).name} is already booked ${timeRange(vetClash)} with ${patientOf(vetClash.patient).name}.`;
  }
  if (patientId) {
    const own = list.find((a) => a.patient === patientId && overlaps(a, start, minutes));
    if (own) return `${patientOf(patientId).name} already has a visit ${timeRange(own)} with ${getVet(own.vet).name}.`;
  }
  return null;
}

const selectLabel: React.CSSProperties = { fontSize: "0.875rem", fontWeight: 600 };

function BookingDialog({
  open,
  onClose,
  appts,
  now,
  onBook,
}: {
  open: boolean;
  onClose: () => void;
  appts: Appointment[];
  now: number;
  onBook: (b: NewBooking) => void;
}) {
  const [patientId, setPatientId] = useState("");
  const [vetId, setVetId] = useState("v-1");
  const [minutes, setMinutes] = useState(20);
  const [reason, setReason] = useState("");
  const [urgent, setUrgent] = useState(false);
  const [start, setStart] = useState<number>(() => {
    const free = SLOTS.find((s) => !slotProblem(appts, now, "v-1", "", s, 20));
    return free ?? SLOTS[0];
  });

  const patient = patients.find((p) => p.id === patientId);
  const problem = slotProblem(appts, now, vetId, patientId, start, minutes);
  const vetDay = appts
    .filter((a) => a.vet === vetId && a.status !== "cancelled")
    .sort((a, b) => toMinutes(a.start) - toMinutes(b.start));
  const canBook = Boolean(patient) && !problem;

  const submit = () => {
    if (!patient || problem) return;
    onBook({ patient: patient.id, vet: vetId, start: toClock(start), minutes, reason: reason.trim() || "Follow-up", urgent });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Book an appointment"
      description={`Today, ${formatDate(TODAY, "long")}. A vet cannot be double-booked.`}
      footer={
        <Row gap="8" horizontal="end" fillWidth wrap>
          <Button variant="secondary" label="Cancel" onClick={onClose} />
          <Button prefixIcon="calendar" label="Book appointment" onClick={submit} disabled={!canBook} />
        </Row>
      }
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <Column gap="16" fillWidth>
          <Column gap="8" fillWidth>
            <label htmlFor="book-patient" style={selectLabel}>
              Patient
            </label>
            <select id="book-patient" style={controlStyle} value={patientId} onChange={(e) => setPatientId(e.target.value)}>
              <option value="">Choose a patient</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.species}) · {getOwner(p.owner).name}
                  {p.alerts.length ? " · ALERT" : ""}
                </option>
              ))}
            </select>
          </Column>

          {patient && <AlertBanner alerts={patient.alerts} name={patient.name} />}

          <Column gap="8" fillWidth>
            <label htmlFor="book-vet" style={selectLabel}>
              Vet
            </label>
            <select id="book-vet" style={controlStyle} value={vetId} onChange={(e) => setVetId(e.target.value)}>
              {vets.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} · {v.room}
                </option>
              ))}
            </select>
          </Column>

          <Row gap="16" wrap fillWidth>
            <Column gap="8" style={{ flex: "1 1 10rem" }}>
              <label htmlFor="book-time" style={selectLabel}>
                Start time
              </label>
              <select id="book-time" style={controlStyle} value={start} onChange={(e) => setStart(Number(e.target.value))}>
                {SLOTS.map((s) => {
                  const p = slotProblem(appts, now, vetId, patientId, s, minutes);
                  return (
                    <option key={s} value={s} disabled={Boolean(p)}>
                      {toClock(s)}
                      {p ? (s < now ? " (passed)" : " (not free)") : ""}
                    </option>
                  );
                })}
              </select>
            </Column>
            <Column gap="8" style={{ flex: "1 1 10rem" }}>
              <label htmlFor="book-length" style={selectLabel}>
                Length
              </label>
              <select id="book-length" style={controlStyle} value={minutes} onChange={(e) => setMinutes(Number(e.target.value))}>
                {DURATIONS.map((d) => (
                  <option key={d} value={d}>
                    {d} minutes
                  </option>
                ))}
              </select>
            </Column>
          </Row>

          <Input id="book-reason" label="Reason for visit" value={reason} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setReason(e.target.value)} />
          <Checkbox label="Urgent visit" description="Highlights the booking on the schedule." checked={urgent} onToggle={setUrgent} />

          <Column gap="4" aria-live="polite">
            {problem ? (
              <Row gap="8" vertical="start" role="alert">
                <Icon name="danger" onBackground="danger-strong" size="s" />
                <Text variant="label-strong-s" onBackground="danger-strong">
                  {problem}
                </Text>
              </Row>
            ) : (
              <Text variant="body-default-s" onBackground="success-strong">
                {toClock(start)}&ndash;{toClock(start + minutes)} is free for {getVet(vetId).name}.
              </Text>
            )}
            <Text variant="body-default-xs" onBackground="neutral-weak">
              {getVet(vetId).name} today:{" "}
              {vetDay.length === 0 ? "nothing booked." : vetDay.map((a) => `${timeRange(a)} ${patientOf(a.patient).name}`).join(" · ")}
            </Text>
          </Column>
        </Column>
      </form>
    </Dialog>
  );
}

/* ---------- schedule rows ---------- */

function AppointmentItem({
  a,
  isNew,
  onCheckIn,
}: {
  a: Appointment;
  isNew: boolean;
  onCheckIn: (id: string) => void;
}) {
  const patient = patientOf(a.patient);
  const owner = getOwner(patient.owner);
  const vet = getVet(a.vet);
  const cancelled = a.status === "cancelled";

  return (
    <li style={listReset}>
      <Column
        background={a.urgent && !cancelled ? "danger-alpha-weak" : "surface"}
        border
        radius="l"
        padding="16"
        gap="12"
        opacity={cancelled ? 70 : 100}
        style={a.urgent && !cancelled ? { borderLeft: "6px solid var(--danger-solid-strong)" } : undefined}
      >
        <Row gap="16" wrap vertical="start">
          <Column gap="2" style={{ flex: "0 0 5.5rem" }}>
            <Text variant="heading-strong-l">{a.start}</Text>
            <Text variant="body-default-xs" onBackground="neutral-weak">
              {a.minutes} min
            </Text>
          </Column>

          <Column gap="8" style={{ flex: "1 1 15rem", minWidth: 0 }}>
            <Row gap="8" vertical="center" wrap>
              <Link href={`/patients/${patient.id}`} style={{ color: "inherit", textDecoration: "underline", textUnderlineOffset: "3px" }}>
                <Text variant="heading-strong-m" style={cancelled ? { textDecoration: "line-through" } : undefined}>
                  {patient.name}
                </Text>
              </Link>
              <Text variant="body-default-s" onBackground="neutral-weak">
                {patient.species}, {patient.breed}
              </Text>
              {a.urgent && (
                <Tag scheme="danger" prefixIcon="bolt" size="m">
                  <span style={{ fontWeight: 700 }}>Urgent</span>
                </Tag>
              )}
              {isNew && (
                <Tag scheme="success" size="m">
                  Just booked
                </Tag>
              )}
            </Row>
            <Text variant="body-default-m">{a.reason}</Text>
            <Text variant="body-default-s" onBackground="neutral-weak">
              Owner: {owner.name} · {owner.phone}
            </Text>
            <AlertTags alerts={patient.alerts} />
          </Column>

          <Column gap="8" style={{ flex: "1 1 12rem" }} horizontal="start">
            <Row gap="8" vertical="center" wrap>
              <Tag scheme={STATUS_SCHEME[a.status]} size="m">
                {STATUS_LABEL[a.status]}
                {a.status === "checked_in" && a.checkedInAt ? ` ${a.checkedInAt}` : ""}
              </Tag>
            </Row>
            <Text variant="body-default-s">
              {vet.name}
              <Text as="span" variant="body-default-s" onBackground="neutral-weak">
                {" "}
                · {vet.room}
              </Text>
            </Text>
            {a.status === "booked" && (
              <Button
                size="m"
                prefixIcon="check"
                label="Check in"
                aria-label={`Check in ${patient.name}`}
                onClick={() => onCheckIn(a.id)}
              />
            )}
          </Column>
        </Row>
      </Column>
    </li>
  );
}

function StatTile({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <Column background="surface" border radius="l" padding="16" gap="4">
      <Text variant="label-default-s" onBackground="neutral-weak">
        {label}
      </Text>
      <Text variant="display-strong-xs">{value}</Text>
      <Text variant="body-default-xs" onBackground="neutral-weak">
        {hint}
      </Text>
    </Column>
  );
}

/* ---------- page ---------- */

export function ScheduleClient() {
  const [appts, setAppts] = useState<Appointment[]>(initialAppointments);
  const [now, setNow] = useState<number>(NOW_MINUTES);
  const [filter, setFilter] = useState("all");
  const [dialogKey, setDialogKey] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [addedId, setAddedId] = useState("");

  useEffect(() => {
    const t = setInterval(() => setNow((n) => n + 1), 60000);
    return () => clearInterval(t);
  }, []);

  const visible = useMemo(
    () =>
      appts
        .filter((a) => filter === "all" || a.vet === filter)
        .slice()
        .sort((a, b) => toMinutes(a.start) - toMinutes(b.start) || a.vet.localeCompare(b.vet)),
    [appts, filter],
  );

  const waiting = useMemo(
    () =>
      appts
        .filter((a) => a.status === "checked_in")
        .slice()
        .sort((a, b) => toMinutes(a.checkedInAt ?? a.start) - toMinutes(b.checkedInAt ?? b.start)),
    [appts],
  );

  const inExam = appts.filter((a) => a.status === "in_exam").length;
  const upcoming = appts
    .filter((a) => a.status === "booked")
    .slice()
    .sort((a, b) => toMinutes(a.start) - toMinutes(b.start));
  const next = upcoming[0];
  const urgentLeft = upcoming.filter((a) => a.urgent);
  const longest = waiting.length ? Math.max(...waiting.map((a) => now - toMinutes(a.checkedInAt ?? a.start))) : 0;

  const checkIn = (id: string) => {
    const a = appts.find((x) => x.id === id);
    if (!a) return;
    setAppts((list) => list.map((x) => (x.id === id ? { ...x, status: "checked_in", checkedInAt: toClock(now) } : x)));
    setNotice(`${patientOf(a.patient).name} checked in at ${toClock(now)} for ${getVet(a.vet).name}.`);
  };

  const book = (b: NewBooking) => {
    const id = `a-${String(appts.length + 1).padStart(2, "0")}`;
    setAppts((list) => [...list, { id, patient: b.patient, vet: b.vet, start: b.start, minutes: b.minutes, reason: b.reason, status: "booked", urgent: b.urgent || undefined }]);
    setNotice(`Booked ${patientOf(b.patient).name} with ${getVet(b.vet).name} at ${b.start}.`);
    setAddedId(id);
    if (filter !== "all" && filter !== b.vet) setFilter("all");
    setDialogOpen(false);
  };

  const openBooking = () => {
    setDialogKey((k) => k + 1);
    setDialogOpen(true);
  };

  return (
    <Column fillWidth maxWidth={80} padding="16" gap="24" paddingBottom="40">
      <Row fillWidth horizontal="between" vertical="end" gap="16" wrap>
        <Column gap="4">
          <Text variant="label-default-s" onBackground="neutral-weak">
            {formatDate(TODAY, "long")} · Now {toClock(now)}
          </Text>
          <Heading as="h1" variant="display-strong-xs">
            Today&rsquo;s schedule
          </Heading>
        </Column>
      </Row>

      <Row fillWidth gap="16" vertical="start" wrap>
        <PatientSearch />
        <Button prefixIcon="plus" label="Book appointment" size="l" onClick={openBooking} />
      </Row>

      {notice && (
        <Row role="status" background="success-alpha-weak" border="success-medium" radius="m" padding="12" gap="8" vertical="center" fillWidth>
          <Icon name="check" onBackground="success-strong" size="s" />
          <Text variant="label-strong-s" onBackground="success-strong">
            {notice}
          </Text>
        </Row>
      )}

      <Grid columns="4" s={{ columns: "2" }} gap="12" fillWidth>
        <StatTile
          label="Waiting now"
          value={String(waiting.length)}
          hint={waiting.length ? `Longest wait ${longest} min` : "Waiting room is clear"}
        />
        <StatTile label="In exam" value={String(inExam)} hint="With a vet or in surgery" />
        <StatTile label="Next up" value={next ? next.start : "None"} hint={next ? `${patientOf(next.patient).name} with ${getVet(next.vet).name}` : "No more booked visits"} />
        <StatTile
          label="Urgent still to come"
          value={String(urgentLeft.length)}
          hint={urgentLeft.length ? urgentLeft.map((a) => `${patientOf(a.patient).name} ${a.start}`).join(", ") : "None"}
        />
      </Grid>

      <Row fillWidth gap="24" vertical="start" m={{ direction: "column" }}>
        <Column
          as="section"
          aria-labelledby="waiting-title"
          gap="12"
          width="24rem"
          m={{ width: "auto", fillWidth: true }}
          style={{ flexShrink: 0 }}
        >
          <Heading as="h2" id="waiting-title" variant="heading-strong-l">
            Waiting room
          </Heading>
          {waiting.length === 0 ? (
            <Column background="surface" border radius="l" padding="16">
              <Text variant="body-default-m" onBackground="neutral-weak">
                No one is waiting. Check a patient in from the schedule.
              </Text>
            </Column>
          ) : (
            <ol style={{ ...listReset, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {waiting.map((a, i) => {
                const p = patientOf(a.patient);
                const waited = now - toMinutes(a.checkedInAt ?? a.start);
                const long = waited >= 30;
                return (
                  <li key={a.id}>
                    <Column background="surface" border radius="l" padding="16" gap="8">
                      <Row horizontal="between" vertical="center" gap="8" wrap>
                        <Text variant="heading-strong-m">
                          {i + 1}. {p.name}
                        </Text>
                        <Tag scheme={long ? "warning" : "neutral"} prefixIcon="time" size="m">
                          {waited} min
                        </Tag>
                      </Row>
                      <Text variant="body-default-s" onBackground="neutral-weak">
                        In at {a.checkedInAt} for {getVet(a.vet).name} ({getVet(a.vet).room}) · {a.reason}
                      </Text>
                      <Text variant="body-default-s" onBackground="neutral-weak">
                        Owner: {getOwner(p.owner).name}
                      </Text>
                      <AlertTags alerts={p.alerts} />
                    </Column>
                  </li>
                );
              })}
            </ol>
          )}
        </Column>

        <Column as="section" aria-labelledby="schedule-title" gap="12" fillWidth style={{ minWidth: 0 }}>
          <Row horizontal="between" vertical="center" gap="12" wrap fillWidth>
            <Heading as="h2" id="schedule-title" variant="heading-strong-l">
              Appointments{" "}
              <Text as="span" variant="body-default-m" onBackground="neutral-weak">
                ({visible.length})
              </Text>
            </Heading>
            <SegmentedControl
              buttons={[
                { value: "all", label: "All vets" },
                ...vets.map((v) => ({ value: v.id, label: v.name.replace("Dr. ", "") })),
              ]}
              value={filter}
              onChange={(v) => setFilter(v)}
            />
          </Row>
          <ul style={{ ...listReset, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {visible.map((a) => (
              <AppointmentItem key={a.id} a={a} isNew={a.id === addedId} onCheckIn={checkIn} />
            ))}
          </ul>
        </Column>
      </Row>

      <BookingDialog key={dialogKey} open={dialogOpen} onClose={() => setDialogOpen(false)} appts={appts} now={now} onBook={book} />
    </Column>
  );
}
```

```tsx src/app/page.tsx
import type { Metadata } from "next";
import { Column } from "@once-ui-system/core";
import { AppHeader, SkipLink } from "@/components/pawpoint/AppHeader";
import { ScheduleClient } from "@/components/pawpoint/ScheduleClient";

export const metadata: Metadata = {
  title: "Today's schedule | Pawpoint",
  description: "Front desk schedule, check-in and waiting room for Hillside Veterinary Clinic.",
};

export default function Page() {
  return (
    <Column fillWidth horizontal="center">
      <SkipLink />
      <AppHeader />
      <Column as="main" id="main" fillWidth horizontal="center">
        <ScheduleClient />
      </Column>
    </Column>
  );
}
```

```tsx src/app/patients/[id]/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Avatar, Button, Column, Grid, Heading, Icon, Row, Tag, Text } from "@once-ui-system/core";
import { AppHeader, SkipLink } from "@/components/pawpoint/AppHeader";
import { AlertBanner } from "@/components/pawpoint/Alerts";
import { WeightChart } from "@/components/pawpoint/WeightChart";
import {
  STATUS_LABEL,
  TODAY,
  ageLabel,
  formatDate,
  getOwner,
  getPatient,
  getVet,
  initialAppointments,
  patients,
  records,
  timeRange,
  vaccinationState,
} from "@/lib/data";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const patient = getPatient(id);
  return { title: patient ? `${patient.name} | Pawpoint` : "Patient not found | Pawpoint" };
}

const listReset: React.CSSProperties = { listStyle: "none", margin: 0, padding: 0 };

function Panel({ title, id, children }: { title: string; id: string; children: React.ReactNode }) {
  return (
    <Column as="section" aria-labelledby={id} background="surface" border radius="l" padding="20" gap="16" fillWidth style={{ minWidth: 0 }}>
      <Heading as="h2" id={id} variant="heading-strong-l">
        {title}
      </Heading>
      {children}
    </Column>
  );
}

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Column gap="2">
      <Text variant="label-default-s" onBackground="neutral-weak">
        {label}
      </Text>
      <Text variant="body-default-m">{children}</Text>
    </Column>
  );
}

export default async function PatientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const patient = getPatient(id);
  if (!patient) notFound();

  const owner = getOwner(patient.owner);
  const record = records[patient.id];
  const otherPets = patients.filter((p) => p.owner === owner.id && p.id !== patient.id);
  const today = initialAppointments
    .filter((a) => a.patient === patient.id)
    .sort((a, b) => a.start.localeCompare(b.start));

  const vaccinations = record ? [...record.vaccinations].sort((a, b) => a.due.localeCompare(b.due)) : [];
  const overdue = vaccinations.filter((v) => vaccinationState(v.due).kind === "overdue");

  const weights = record?.weights_kg ?? [];
  const firstW = weights[0];
  const lastW = weights[weights.length - 1];
  const delta = firstW && lastW ? lastW.kg - firstW.kg : 0;
  const deltaPct = firstW && lastW ? (delta / firstW.kg) * 100 : 0;

  return (
    <Column fillWidth horizontal="center">
      <SkipLink />
      <AppHeader />
      <Column as="main" id="main" fillWidth maxWidth={72} padding="16" gap="24" paddingBottom="40">
        <Row>
          <Button href="/" variant="tertiary" size="s" prefixIcon="chevronLeft" label="Back to schedule" />
        </Row>

        <Row gap="16" vertical="center" wrap>
          <Avatar value={patient.name.slice(0, 1)} size="xl" aria-hidden />
          <Column gap="4">
            <Heading as="h1" variant="display-strong-s">
              {patient.name}
            </Heading>
            <Text variant="body-default-l" onBackground="neutral-weak">
              {patient.breed} · {patient.species} · {ageLabel(patient.born)} · {patient.sex}
            </Text>
            <Text variant="body-default-s" onBackground="neutral-weak">
              Patient {patient.id} · Owner {owner.name}
            </Text>
          </Column>
          {overdue.length > 0 && (
            <Row style={{ marginLeft: "auto" }}>
              <a href="#vaccinations" style={{ textDecoration: "none" }}>
                <Tag scheme="warning" prefixIcon="warning" size="l">
                  {overdue.length} vaccination{overdue.length === 1 ? "" : "s"} overdue
                </Tag>
              </a>
            </Row>
          )}
        </Row>

        <AlertBanner alerts={patient.alerts} name={patient.name} />

        {today.length > 0 && (
          <Panel title="At the clinic today" id="today-title">
            <ul style={{ ...listReset, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {today.map((a) => (
                <li key={a.id}>
                  <Row gap="12" wrap vertical="center" horizontal="between">
                    <Column gap="2">
                      <Text variant="label-strong-m">
                        {timeRange(a)} · {a.reason}
                      </Text>
                      <Text variant="body-default-s" onBackground="neutral-weak">
                        {getVet(a.vet).name} · {getVet(a.vet).room}
                      </Text>
                    </Column>
                    <Tag scheme={a.status === "done" ? "success" : "neutral"} size="m">
                      {STATUS_LABEL[a.status]}
                    </Tag>
                  </Row>
                </li>
              ))}
            </ul>
          </Panel>
        )}

        <Grid columns="2" s={{ columns: "1" }} gap="16" fillWidth>
          <Panel title="Patient" id="patient-title">
            <Grid columns="2" gap="16" fillWidth>
              <Fact label="Species">{patient.species}</Fact>
              <Fact label="Breed">{patient.breed}</Fact>
              <Fact label="Born">
                {formatDate(patient.born)} ({ageLabel(patient.born)})
              </Fact>
              <Fact label="Sex">{patient.sex}</Fact>
            </Grid>
          </Panel>
          <Panel title="Owner" id="owner-title">
            <Grid columns="2" gap="16" fillWidth>
              <Fact label="Name">{owner.name}</Fact>
              <Fact label="Phone">
                <a href={`tel:${owner.phone.replace(/\s/g, "")}`} style={{ color: "inherit" }}>
                  {owner.phone}
                </a>
              </Fact>
              {otherPets.length > 0 && (
                <Fact label="Other pets">
                  {otherPets.map((p, i) => (
                    <span key={p.id}>
                      {i > 0 ? ", " : ""}
                      <Link href={`/patients/${p.id}`} style={{ color: "inherit" }}>
                        {p.name}
                      </Link>
                    </span>
                  ))}
                </Fact>
              )}
            </Grid>
          </Panel>
        </Grid>

        {!record && (
          <Column background="surface" border radius="l" padding="20">
            <Text variant="body-default-m" onBackground="neutral-weak">
              No weights, vaccinations or visit history are loaded for {patient.name} in this demo.
            </Text>
          </Column>
        )}

        {record && (
          <>
            <Panel title="Weight trend" id="weight-title">
              <Row gap="32" wrap>
                <Fact label="Latest">
                  <span style={{ fontWeight: 700 }}>{lastW.kg.toFixed(1)} kg</span> on {formatDate(lastW.date)}
                </Fact>
                <Fact label={`Since ${formatDate(firstW.date)}`}>
                  <span style={{ fontWeight: 700 }}>
                    {delta > 0 ? "+" : "−"}
                    {Math.abs(delta).toFixed(1)} kg ({deltaPct > 0 ? "+" : "−"}
                    {Math.abs(deltaPct).toFixed(1)}%)
                  </span>
                </Fact>
                <Fact label="Readings">{weights.length} visits</Fact>
              </Row>
              <WeightChart points={weights} name={patient.name} />
            </Panel>

            <Panel title="Vaccinations" id="vaccinations">
              {overdue.length > 0 && (
                <Row role="status" background="warning-alpha-weak" border="warning-strong" radius="m" padding="12" gap="8" vertical="center">
                  <Icon name="warning" onBackground="warning-strong" size="s" />
                  <Text variant="label-strong-s" onBackground="warning-strong">
                    Overdue as of {formatDate(TODAY)}: {overdue.map((v) => v.name).join(", ")}
                  </Text>
                </Row>
              )}
              <ul style={{ ...listReset, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {vaccinations.map((v) => {
                  const state = vaccinationState(v.due);
                  return (
                    <li key={v.name}>
                      <Row
                        gap="12"
                        wrap
                        vertical="center"
                        horizontal="between"
                        padding="12"
                        radius="m"
                        background={state.kind === "overdue" ? "warning-alpha-weak" : "transparent"}
                        border={state.kind === "overdue" ? "warning-medium" : true}
                      >
                        <Column gap="2" style={{ flex: "1 1 10rem" }}>
                          <Text variant="label-strong-m">{v.name}</Text>
                          <Text variant="body-default-s" onBackground="neutral-weak">
                            Given {formatDate(v.given)}
                          </Text>
                        </Column>
                        <Text variant="body-default-m" style={{ flex: "1 1 9rem" }}>
                          Due {formatDate(v.due)}
                        </Text>
                        {state.kind === "overdue" ? (
                          <Tag scheme="warning" prefixIcon="warning" size="m">
                            <span style={{ fontWeight: 700 }}>Overdue {state.days} days</span>
                          </Tag>
                        ) : state.kind === "soon" ? (
                          <Tag scheme="info" prefixIcon="time" size="m">
                            Due in {state.days} days
                          </Tag>
                        ) : (
                          <Tag scheme="success" prefixIcon="check" size="m">
                            Up to date
                          </Tag>
                        )}
                      </Row>
                    </li>
                  );
                })}
              </ul>
            </Panel>

            <Panel title="Current medications" id="meds-title">
              <ul style={{ ...listReset, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {record.medications.map((m) => (
                  <li key={m.name}>
                    <Row gap="12" wrap vertical="center" horizontal="between">
                      <Column gap="2">
                        <Text variant="label-strong-m">{m.name}</Text>
                        <Text variant="body-default-m">{m.dose}</Text>
                      </Column>
                      <Text variant="body-default-s" onBackground="neutral-weak">
                        Since {formatDate(m.since)}
                      </Text>
                    </Row>
                  </li>
                ))}
              </ul>
            </Panel>

            <Panel title="Visit history" id="visits-title">
              <ol style={{ ...listReset, display: "flex", flexDirection: "column", gap: "1rem" }}>
                {record.visits.map((v) => (
                  <li key={v.date}>
                    <Column gap="4" paddingLeft="16" style={{ borderLeft: "3px solid var(--neutral-alpha-strong)" }}>
                      <Row gap="8" wrap vertical="center" horizontal="between">
                        <Text variant="label-strong-m">
                          {formatDate(v.date)} · {v.reason}
                        </Text>
                        <Row gap="8" vertical="center">
                          {v.date === TODAY && (
                            <Tag scheme="brand" size="m">
                              Today
                            </Tag>
                          )}
                          <Text variant="body-default-s" onBackground="neutral-weak">
                            ${v.invoice_usd.toFixed(2)}
                          </Text>
                        </Row>
                      </Row>
                      <Text variant="body-default-s" onBackground="neutral-weak">
                        {getVet(v.vet).name}
                      </Text>
                      <Text variant="body-default-m">{v.notes}</Text>
                    </Column>
                  </li>
                ))}
              </ol>
            </Panel>
          </>
        )}
      </Column>
    </Column>
  );
}
```
