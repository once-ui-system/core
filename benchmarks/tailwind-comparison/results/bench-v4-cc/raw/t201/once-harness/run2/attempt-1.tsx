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
  /** Minutes after midnight at which the patient checked in. */
  checkedInAt?: number;
};
export type Weight = { date: string; kg: number };
export type Vaccination = { name: string; given: string; due: string };
export type Medication = { name: string; dose: string; since: string };
export type Visit = { date: string; vet: string; reason: string; notes: string; invoice_usd: number };
export type PatientRecordData = {
  weights_kg: Weight[];
  vaccinations: Vaccination[];
  medications: Medication[];
  visits: Visit[];
};

export const CLINIC = "Pawpoint, front-desk and records software for Hillside Veterinary Clinic";
export const CLINIC_NAME = "Hillside Veterinary Clinic";
export const TODAY = "2026-11-12";
/** The desk clock when the page opens (minutes after midnight): 9:50 AM. */
export const CLOCK_START = 9 * 60 + 50;
export const CLINIC_OPEN = 8 * 60;
export const CLINIC_CLOSE = 18 * 60;

export const USER = { name: "Rosa Lindqvist", role: "Receptionist" };

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

export const APPOINTMENTS: Appointment[] = [
  { id: "a-01", patient: "p-101", vet: "v-1", start: "08:30", minutes: 20, reason: "Annual vaccination", status: "done" },
  { id: "a-02", patient: "p-104", vet: "v-2", start: "08:30", minutes: 30, reason: "Kidney panel recheck", status: "done" },
  { id: "a-03", patient: "p-108", vet: "v-3", start: "08:00", minutes: 120, reason: "Soft palate surgery", status: "in_exam" },
  { id: "a-04", patient: "p-102", vet: "v-1", start: "09:00", minutes: 30, reason: "Limping, left hind leg", status: "in_exam" },
  { id: "a-05", patient: "p-107", vet: "v-2", start: "09:15", minutes: 20, reason: "Glucose curve", status: "checked_in", checkedInAt: 9 * 60 + 10 },
  { id: "a-06", patient: "p-105", vet: "v-1", start: "09:45", minutes: 20, reason: "Beak and nail trim", status: "checked_in", checkedInAt: 9 * 60 + 41 },
  { id: "a-07", patient: "p-103", vet: "v-2", start: "10:00", minutes: 30, reason: "Senior wellness exam", status: "booked" },
  { id: "a-08", patient: "p-106", vet: "v-1", start: "10:30", minutes: 20, reason: "Not eating since yesterday", status: "booked", urgent: true },
  { id: "a-09", patient: "p-104", vet: "v-3", start: "11:00", minutes: 45, reason: "Dental cleaning", status: "booked" },
  { id: "a-10", patient: "p-101", vet: "v-2", start: "11:30", minutes: 20, reason: "Ear infection follow-up", status: "booked" },
  { id: "a-11", patient: "p-107", vet: "v-1", start: "13:30", minutes: 30, reason: "Dental check", status: "booked" },
  { id: "a-12", patient: "p-103", vet: "v-3", start: "14:00", minutes: 60, reason: "Lump removal", status: "cancelled" },
  { id: "a-13", patient: "p-102", vet: "v-2", start: "15:00", minutes: 20, reason: "X-ray results", status: "booked" },
];

export const RECORDS: Record<string, PatientRecordData> = {
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

export const STATUS_LABEL: Record<Status, string> = {
  booked: "Booked",
  checked_in: "Checked in",
  in_exam: "In exam",
  done: "Done",
  cancelled: "Cancelled",
};

export function patientById(id: string): Patient | undefined {
  return PATIENTS.find((p) => p.id === id);
}
export function ownerById(id: string): Owner {
  return OWNERS.find((o) => o.id === id) ?? { id, name: "Unknown owner", phone: "" };
}
export function vetById(id: string): Vet {
  return VETS.find((v) => v.id === id) ?? { id, name: "Unassigned", room: "" };
}

/** "08:30" -> 510 */
export function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}
/** 510 -> "08:30" */
export function toHHMM(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
/** 570 -> "9:30 AM" */
export function fmtClock(min: number): string {
  const h24 = Math.floor(min / 60);
  const m = min % 60;
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${h24 < 12 ? "AM" : "PM"}`;
}
export function fmtTime(hhmm: string): string {
  return fmtClock(toMinutes(hhmm));
}
export function fmtDuration(min: number): string {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m === 0 ? `${h} h` : `${h} h ${m} min`;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function parts(iso: string): [number, number, number] {
  const [y, m, d] = iso.split("-").map(Number);
  return [y, m, d];
}
export function dayNumber(iso: string): number {
  const [y, m, d] = parts(iso);
  return Math.round(Date.UTC(y, m - 1, d) / 86400000);
}
export function daysBetween(fromIso: string, toIso: string): number {
  return dayNumber(toIso) - dayNumber(fromIso);
}
export function fmtDate(iso: string): string {
  const [y, m, d] = parts(iso);
  return `${MONTHS[m - 1]} ${d}, ${y}`;
}
export function fmtShortDate(iso: string): string {
  const [y, m] = parts(iso);
  return `${MONTHS[m - 1]} '${String(y).slice(2)}`;
}
export function fmtLongToday(iso: string): string {
  const [y, m, d] = parts(iso);
  const wd = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return `${WEEKDAYS[wd]}, ${MONTHS[m - 1]} ${d}, ${y}`;
}
export function ageLabel(bornIso: string, todayIso: string): string {
  const [by, bm, bd] = parts(bornIso);
  const [ty, tm, td] = parts(todayIso);
  let years = ty - by;
  let months = tm - bm;
  if (td < bd) months -= 1;
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  const y = `${years} ${years === 1 ? "year" : "years"}`;
  if (years >= 3 || months === 0) return y;
  return `${y} ${months} ${months === 1 ? "month" : "months"}`;
}
export function fmtMoney(n: number): string {
  return `$${n.toFixed(2)}`;
}

export function searchPatients(query: string): Patient[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return PATIENTS.filter((p) => p.name.toLowerCase().includes(q) || ownerById(p.owner).name.toLowerCase().includes(q)).slice(0, 6);
}

/** Time slots offered when booking: every 15 minutes while the clinic is open. */
export const SLOTS: string[] = (() => {
  const out: string[] = [];
  for (let m = CLINIC_OPEN; m < CLINIC_CLOSE; m += 15) out.push(toHHMM(m));
  return out;
})();

/** The live booking this one would run into for the same vet, if any. Cancelled bookings free their slot. */
export function findClash(list: Appointment[], vetId: string, startMin: number, minutes: number): Appointment | undefined {
  const end = startMin + minutes;
  return list.find((a) => {
    if (a.vet !== vetId || a.status === "cancelled") return false;
    const s = toMinutes(a.start);
    return startMin < s + a.minutes && s < end;
  });
}

export function firstFreeSlot(list: Appointment[], vetId: string, minutes: number, nowMin: number): string {
  for (const slot of SLOTS) {
    const s = toMinutes(slot);
    if (s < nowMin || s + minutes > CLINIC_CLOSE) continue;
    if (!findClash(list, vetId, s, minutes)) return slot;
  }
  return SLOTS[0];
}
```

```tsx components/Alerts.tsx
"use client";

import { Column, Icon, Row, Text } from "@once-ui-system/core";

/** Medical alerts as red chips with a warning icon. Used everywhere a patient appears. */
export function AlertChips({ alerts, size = "s" }: { alerts: string[]; size?: "s" | "m" }) {
  if (alerts.length === 0) return null;
  return (
    <Row as="ul" wrap gap="4" aria-label="Medical alerts" style={{ margin: 0, padding: 0, listStyle: "none" }}>
      {alerts.map((alert) => (
        <Row
          as="li"
          key={alert}
          vertical="center"
          gap="4"
          paddingX={size === "m" ? "12" : "8"}
          paddingY={size === "m" ? "8" : "4"}
          radius="s"
          background="danger-alpha-weak"
          border="danger-alpha-strong"
          borderWidth={2}
        >
          <Icon name="warning" size="xs" onBackground="danger-strong" />
          <Text textVariant={size === "m" ? "label-strong-m" : "label-strong-s"} onBackground="danger-strong">
            <span style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)", whiteSpace: "nowrap" }}>
              Medical alert:{" "}
            </span>
            {alert}
          </Text>
        </Row>
      ))}
    </Row>
  );
}

/** A large banner for the record page: the alerts first, before anything else. */
export function AlertBanner({ name, alerts }: { name: string; alerts: string[] }) {
  if (alerts.length === 0) return null;
  return (
    <Column
      as="section"
      aria-label={`Medical alerts for ${name}`}
      fillWidth
      background="danger-alpha-weak"
      border="danger-alpha-strong"
      borderWidth={4}
      radius="l"
      padding="20"
      gap="12"
    >
      <Row gap="8" vertical="center">
        <Icon name="warning" size="l" onBackground="danger-strong" />
        <Text textVariant="label-strong-m" onBackground="danger-strong" style={{ letterSpacing: "0.08em", textTransform: "uppercase" }}>
          Medical alerts for {name}
        </Text>
      </Row>
      <Column as="ul" gap="8" style={{ margin: 0, padding: 0, listStyle: "none" }}>
        {alerts.map((alert) => (
          <Row as="li" key={alert} gap="8" vertical="center">
            <Icon name="danger" size="m" onBackground="danger-strong" />
            <Text textVariant="heading-strong-l" onBackground="danger-strong">
              {alert}
            </Text>
          </Row>
        ))}
      </Column>
    </Column>
  );
}
```

```tsx components/AppHeader.tsx
"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar, Column, Icon, Input, Row, SmartLink, Text, VisuallyHidden } from "@once-ui-system/core";
import { AlertChips } from "@/components/Alerts";
import { CLINIC_NAME, ownerById, searchPatients, USER } from "@/lib/data";

function PatientSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const results = useMemo(() => searchPatients(query), [query]);
  const showPanel = open && query.trim().length > 0;

  const go = (id: string) => {
    setOpen(false);
    setQuery("");
    router.push(`/patients/${id}`);
  };

  return (
    <div
      role="search"
      style={{ position: "relative", flex: "1 1 16rem", maxWidth: "32rem", minWidth: 0 }}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOpen(false);
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape") setOpen(false);
      }}
    >
      <Input
        id="patient-search"
        label="Search patient or owner"
        size="s"
        autoComplete="off"
        value={query}
        onValueChange={(v) => {
          setQuery(v);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && results[0]) {
            e.preventDefault();
            go(results[0].id);
          }
        }}
        prefix={<Icon name="search" size="s" onBackground="neutral-weak" />}
      />
      <div role="status" aria-live="polite" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>
        {showPanel ? `${results.length} ${results.length === 1 ? "match" : "matches"}` : ""}
      </div>
      {showPanel && (
        <Column
          id="search-results"
          position="absolute"
          top="100%"
          marginTop="8"
          fillWidth
          background="overlay"
          border
          radius="l"
          shadow="l"
          padding="8"
          gap="4"
          zIndex={10}
        >
          {results.length === 0 ? (
            <Row padding="12">
              <Text textVariant="body-default-m" onBackground="neutral-weak">
                No patient or owner matches “{query.trim()}”.
              </Text>
            </Row>
          ) : (
            results.map((p) => (
              <Row
                as="button"
                type="button"
                key={p.id}
                onClick={() => go(p.id)}
                gap="12"
                padding="12"
                radius="m"
                vertical="center"
                fillWidth
                cursor="interactive"
                style={{ textAlign: "left", background: "transparent", border: 0, color: "inherit", font: "inherit" }}
              >
                <Column flex="1" gap="4" minWidth={0}>
                  <Text textVariant="label-strong-m">{p.name}</Text>
                  <Text textVariant="body-default-s" onBackground="neutral-weak">
                    {p.species}, {p.breed} · Owner {ownerById(p.owner).name}
                  </Text>
                  <AlertChips alerts={p.alerts} />
                </Column>
                <Icon name="chevronRight" size="s" onBackground="neutral-weak" />
              </Row>
            ))
          )}
        </Column>
      )}
    </div>
  );
}

export function AppHeader() {
  return (
    <Row
      as="header"
      fillWidth
      position="sticky"
      top="0"
      zIndex={5}
      background="surface"
      borderBottom
      paddingX="16"
      paddingY="12"
      gap="16"
      wrap
      vertical="center"
    >
      <VisuallyHidden as="a" href="#main" focusable>
        Skip to content
      </VisuallyHidden>
      <SmartLink href="/" unstyled>
        <Row gap="12" vertical="center">
          <Row center width={40} height={40} radius="m" background="brand-medium">
            <Icon name="paw" size="m" onBackground="brand-strong" />
          </Row>
          <Column>
            <Text textVariant="heading-strong-m">Pawpoint</Text>
            <Text textVariant="label-default-s" onBackground="neutral-weak" s={{ hide: true }}>
              {CLINIC_NAME}
            </Text>
          </Column>
        </Row>
      </SmartLink>
      <PatientSearch />
      <Row gap="12" vertical="center" marginLeft="auto">
        <Row s={{ hide: true }} horizontal="end">
          <Column horizontal="end">
            <Text textVariant="label-strong-s">{USER.name}</Text>
            <Text textVariant="label-default-s" onBackground="neutral-weak">
              {USER.role}
            </Text>
          </Column>
        </Row>
        <Avatar size="m" value="RL" />
      </Row>
    </Row>
  );
}
```

```tsx components/BookingDialog.tsx
"use client";

import { useState } from "react";
import { Button, Checkbox, Column, Dialog, Input, Row, Select, Text } from "@once-ui-system/core";
import { AlertChips } from "@/components/Alerts";
import {
  type Appointment,
  CLINIC_CLOSE,
  fmtClock,
  fmtTime,
  findClash,
  firstFreeSlot,
  ownerById,
  PATIENTS,
  patientById,
  SLOTS,
  toMinutes,
  VETS,
  vetById,
} from "@/lib/data";

const DURATIONS = [15, 20, 30, 45, 60];

type Props = {
  open: boolean;
  onClose: () => void;
  appointments: Appointment[];
  now: number;
  onBook: (draft: Omit<Appointment, "id" | "status">) => void;
};

/** Mount with a fresh `key` each time it opens so the form starts clean. */
export function BookingDialog({ open, onClose, appointments, now, onBook }: Props) {
  const [patientId, setPatientId] = useState("");
  const [vetId, setVetId] = useState(VETS[0].id);
  const [minutes, setMinutes] = useState("20");
  const [start, setStart] = useState(() => firstFreeSlot(appointments, VETS[0].id, 20, now));
  const [reason, setReason] = useState("");
  const [urgent, setUrgent] = useState(false);
  const [tried, setTried] = useState(false);

  const dur = Number(minutes);
  const startMin = toMinutes(start);
  const clash = findClash(appointments, vetId, startMin, dur);
  const past = startMin < now;
  const afterClose = startMin + dur > CLINIC_CLOSE;
  const patient = patientById(patientId);

  let timeError: string | null = null;
  if (clash) {
    const who = patientById(clash.patient)?.name ?? "another patient";
    const end = fmtClock(toMinutes(clash.start) + clash.minutes);
    timeError = `${vetById(vetId).name} is already booked ${fmtTime(clash.start)} to ${end} (${who}, ${clash.reason}). Choose another time or vet.`;
  } else if (afterClose) {
    timeError = `This would end after closing at ${fmtClock(CLINIC_CLOSE)}.`;
  } else if (past) {
    timeError = "That time has already passed.";
  }

  const patientOptions = PATIENTS.map((p) => ({ value: p.id, label: `${p.name}, owner ${ownerById(p.owner).name}` }));
  const vetOptions = VETS.map((v) => ({ value: v.id, label: `${v.name} (${v.room})` }));
  const durationOptions = DURATIONS.map((d) => ({ value: String(d), label: `${d} minutes` }));
  const timeOptions = SLOTS.map((slot) => {
    const s = toMinutes(slot);
    const taken = !!findClash(appointments, vetId, s, dur);
    const late = s + dur > CLINIC_CLOSE;
    const gone = s < now;
    const note = taken ? " (booked)" : gone ? " (passed)" : late ? " (after close)" : "";
    return { value: slot, label: `${fmtTime(slot)}${note}`, disabled: taken || gone || late };
  });

  const submit = () => {
    setTried(true);
    if (!patientId || timeError) return;
    onBook({ patient: patientId, vet: vetId, start, minutes: dur, reason: reason.trim() || "Follow-up", urgent: urgent || undefined });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Book an appointment"
      description="Pick a patient, a vet and a time. Times already taken for that vet are greyed out."
      footer={
        <Row gap="8" horizontal="end" fillWidth wrap>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button prefixIcon="calendar" onClick={submit} disabled={!!timeError}>
            Book appointment
          </Button>
        </Row>
      }
    >
      <Column
        as="form"
        gap="16"
        paddingTop="8"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <Select
          id="book-patient"
          label="Patient"
          searchable
          options={patientOptions}
          value={patientId}
          onValueChange={(v) => setPatientId(String(v))}
          error={tried && !patientId}
          errorMessage={tried && !patientId ? "Choose a patient." : undefined}
        />
        {patient && (
          <Column gap="8">
            <Text textVariant="body-default-s" onBackground="neutral-weak">
              {patient.species}, {patient.breed}. Owner {ownerById(patient.owner).name}, {ownerById(patient.owner).phone}
            </Text>
            <AlertChips alerts={patient.alerts} size="m" />
          </Column>
        )}
        <Select
          id="book-vet"
          label="Vet"
          options={vetOptions}
          value={vetId}
          onValueChange={(v) => setVetId(String(v))}
        />
        <Row gap="12" wrap>
          <Column flex="1" style={{ minWidth: "12rem" }}>
            <Select
              id="book-time"
              label="Time"
              options={timeOptions}
              value={start}
              onValueChange={(v) => setStart(String(v))}
              error={!!timeError}
            />
          </Column>
          <Column flex="1" style={{ minWidth: "12rem" }}>
            <Select
              id="book-duration"
              label="Length"
              options={durationOptions}
              value={minutes}
              onValueChange={(v) => setMinutes(String(v))}
            />
          </Column>
        </Row>
        {timeError && (
          <Row role="alert" gap="8" padding="12" radius="m" background="danger-alpha-weak" border="danger-alpha-strong">
            <Text textVariant="label-default-m" onBackground="danger-strong">
              {timeError}
            </Text>
          </Row>
        )}
        <Input id="book-reason" label="Reason for visit" value={reason} onValueChange={setReason} placeholder="Follow-up" />
        <Checkbox label="Urgent visit" checked={urgent} onCheckedChange={setUrgent} />
      </Column>
    </Dialog>
  );
}
```

```tsx components/Schedule.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, Column, Grid, Heading, Icon, Row, SegmentedControl, SmartLink, Tag, Text } from "@once-ui-system/core";
import { AlertChips } from "@/components/Alerts";
import { AppHeader } from "@/components/AppHeader";
import { BookingDialog } from "@/components/BookingDialog";
import {
  type Appointment,
  APPOINTMENTS,
  CLOCK_START,
  fmtClock,
  fmtDuration,
  fmtLongToday,
  fmtTime,
  ownerById,
  patientById,
  STATUS_LABEL,
  type Status,
  toMinutes,
  TODAY,
  VETS,
  vetById,
} from "@/lib/data";

const STATUS_TONE: Record<Status, "neutral" | "warning" | "brand" | "success"> = {
  booked: "neutral",
  checked_in: "warning",
  in_exam: "brand",
  done: "success",
  cancelled: "neutral",
};

const LONG_WAIT = 20;

function StatusTag({ status }: { status: Status }) {
  return (
    <Tag
      tone={STATUS_TONE[status]}
      label={STATUS_LABEL[status]}
      dot={status !== "done" && status !== "cancelled"}
      prefixIcon={status === "done" ? "check" : status === "cancelled" ? "close" : undefined}
    />
  );
}

function AppointmentRow({ appt, now, justAdded, onCheckIn }: { appt: Appointment; now: number; justAdded: boolean; onCheckIn: (id: string) => void }) {
  const patient = patientById(appt.patient);
  const owner = patient ? ownerById(patient.owner) : undefined;
  const vet = vetById(appt.vet);
  const muted = appt.status === "done" || appt.status === "cancelled";
  const urgent = !!appt.urgent && !muted;

  return (
    <Row
      as="li"
      fillWidth
      wrap
      gap="16"
      padding="16"
      radius="l"
      vertical="start"
      background={urgent ? "warning-alpha-weak" : "surface"}
      border={urgent ? "warning-strong" : true}
      borderWidth={urgent ? 2 : 1}
    >
      <Column style={{ width: "5.5rem", flex: "none" }} gap="4">
        <Text textVariant="heading-strong-m" style={{ fontVariantNumeric: "tabular-nums" }} onBackground={muted ? "neutral-weak" : "neutral-strong"}>
          {fmtTime(appt.start)}
        </Text>
        <Text textVariant="label-default-s" onBackground="neutral-weak">
          {fmtDuration(appt.minutes)}
        </Text>
      </Column>

      <Column flex="1" gap="8" style={{ minWidth: "14rem" }}>
        <Row gap="8" vertical="center" wrap>
          <SmartLink href={`/patients/${appt.patient}`}>
            <Text
              textVariant="heading-strong-m"
              style={appt.status === "cancelled" ? { textDecoration: "line-through" } : undefined}
            >
              {patient?.name ?? "Unknown patient"}
            </Text>
          </SmartLink>
          {patient && (
            <Text textVariant="body-default-s" onBackground="neutral-weak">
              {patient.species}, {patient.breed}
            </Text>
          )}
          {urgent && <Tag tone="warning" variant="gradient" prefixIcon="bolt" label="Urgent" />}
          {justAdded && <Tag tone="success" label="New booking" />}
        </Row>
        <Text textVariant="body-strong-m">{appt.reason}</Text>
        {owner && (
          <Text textVariant="body-default-s" onBackground="neutral-weak">
            Owner {owner.name} · {owner.phone}
          </Text>
        )}
        {patient && <AlertChips alerts={patient.alerts} />}
      </Column>

      <Column gap="4" style={{ minWidth: "9rem" }}>
        <Text textVariant="label-strong-m">{vet.name}</Text>
        <Text textVariant="label-default-s" onBackground="neutral-weak">
          {vet.room}
        </Text>
      </Column>

      <Column gap="8" style={{ minWidth: "9rem" }} horizontal="start">
        <StatusTag status={appt.status} />
        {appt.status === "booked" && (
          <Button size="m" prefixIcon="check" onClick={() => onCheckIn(appt.id)} aria-label={`Check in ${patient?.name ?? "patient"} for ${fmtTime(appt.start)}`}>
            Check in
          </Button>
        )}
        {appt.status === "checked_in" && appt.checkedInAt !== undefined && (
          <Text textVariant="label-default-s" onBackground="neutral-weak">
            Waiting {fmtDuration(Math.max(0, now - appt.checkedInAt))}
          </Text>
        )}
      </Column>
    </Row>
  );
}

function WaitingList({ waiting, now }: { waiting: Appointment[]; now: number }) {
  return (
    <Column
      as="section"
      aria-labelledby="waiting-title"
      background="surface"
      border
      radius="l"
      padding="20"
      gap="16"
      style={{ flex: "1 1 20rem", minWidth: 0 }}
    >
      <Row horizontal="between" vertical="center" gap="8">
        <Heading as="h2" id="waiting-title" textVariant="heading-strong-l">
          Waiting room
        </Heading>
        <Tag tone={waiting.length ? "warning" : "neutral"} label={`${waiting.length} waiting`} />
      </Row>
      {waiting.length === 0 ? (
        <Column gap="8" paddingY="16" horizontal="center">
          <Icon name="smiley" size="l" onBackground="neutral-weak" />
          <Text onBackground="neutral-weak" align="center">
            Nobody is waiting. Check a patient in from the schedule when they arrive.
          </Text>
        </Column>
      ) : (
        <Column as="ol" gap="12" style={{ margin: 0, padding: 0, listStyle: "none" }} aria-live="polite">
          {waiting.map((a, i) => {
            const patient = patientById(a.patient);
            const vet = vetById(a.vet);
            const waited = Math.max(0, now - (a.checkedInAt ?? now));
            const long = waited >= LONG_WAIT;
            return (
              <Column
                as="li"
                key={a.id}
                gap="8"
                padding="12"
                radius="m"
                background={i === 0 ? "brand-alpha-weak" : "neutral-alpha-weak"}
                border={i === 0 ? "brand-alpha-medium" : false}
              >
                <Row horizontal="between" vertical="center" gap="8" wrap>
                  <Row gap="8" vertical="center" wrap>
                    <Text textVariant="label-strong-s" onBackground="neutral-weak">
                      {i + 1}
                    </Text>
                    <SmartLink href={`/patients/${a.patient}`}>
                      <Text textVariant="heading-strong-m">{patient?.name}</Text>
                    </SmartLink>
                    {i === 0 && <Tag tone="brand" label="Next up" size="s" />}
                  </Row>
                  <Tag tone={long ? "warning" : "neutral"} prefixIcon="time" label={fmtDuration(waited)} />
                </Row>
                <Text textVariant="body-default-s" onBackground="neutral-weak">
                  {a.reason} · {vet.name}, {vet.room} · booked {fmtTime(a.start)}
                </Text>
                {patient && <AlertChips alerts={patient.alerts} />}
              </Column>
            );
          })}
        </Column>
      )}
    </Column>
  );
}

export function Schedule() {
  const [appts, setAppts] = useState<Appointment[]>(APPOINTMENTS);
  const [now, setNow] = useState(CLOCK_START);
  const [vetFilter, setVetFilter] = useState("all");
  const [bookingKey, setBookingKey] = useState(0);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [lastAdded, setLastAdded] = useState<string | null>(null);

  useEffect(() => {
    const t = setInterval(() => setNow((n) => n + 1), 60000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(""), 6000);
    return () => clearTimeout(t);
  }, [notice]);

  const sorted = useMemo(
    () => [...appts].sort((a, b) => toMinutes(a.start) - toMinutes(b.start) || a.vet.localeCompare(b.vet)),
    [appts],
  );
  const visible = vetFilter === "all" ? sorted : sorted.filter((a) => a.vet === vetFilter);
  const waiting = useMemo(
    () => appts.filter((a) => a.status === "checked_in").sort((a, b) => (a.checkedInAt ?? 0) - (b.checkedInAt ?? 0)),
    [appts],
  );
  const count = (s: Status) => appts.filter((a) => a.status === s).length;

  const checkIn = (id: string) => {
    const a = appts.find((x) => x.id === id);
    if (!a || a.status !== "booked") return;
    setAppts((list) => list.map((x) => (x.id === id ? { ...x, status: "checked_in", checkedInAt: now } : x)));
    setNotice(`${patientById(a.patient)?.name ?? "Patient"} checked in at ${fmtClock(now)}. Added to the waiting room.`);
  };

  const book = (draft: Omit<Appointment, "id" | "status">) => {
    const id = `a-${String(appts.length + 1).padStart(2, "0")}`;
    setAppts((list) => [...list, { ...draft, id, status: "booked" }]);
    setLastAdded(id);
    setBookingOpen(false);
    setNotice(
      `Booked ${patientById(draft.patient)?.name ?? "patient"} with ${vetById(draft.vet).name} at ${fmtTime(draft.start)}.`,
    );
  };

  const stats: { label: string; value: number; icon: "time" | "paw" | "calendar" | "check" }[] = [
    { label: "Waiting", value: count("checked_in"), icon: "time" },
    { label: "In exam", value: count("in_exam"), icon: "paw" },
    { label: "Still to arrive", value: count("booked"), icon: "calendar" },
    { label: "Done today", value: count("done"), icon: "check" },
  ];

  const vetButtons = [
    { value: "all", label: "All vets" },
    ...VETS.map((v) => ({ value: v.id, label: v.name })),
  ];

  return (
    <Column fillWidth minHeight="100vh">
      <AppHeader />
      <Column as="main" id="main" fillWidth horizontal="center" paddingX="16" paddingY="24">
        <Column fillWidth gap="24" style={{ maxWidth: "80rem" }}>
          <Row fillWidth wrap gap="16" vertical="center" horizontal="between">
            <Column gap="4">
              <Heading as="h1" textVariant="display-strong-xs">
                Today’s schedule
              </Heading>
              <Text onBackground="neutral-weak" textVariant="body-default-m">
                {fmtLongToday(TODAY)} · desk time {fmtClock(now)} · 3 vets
              </Text>
            </Column>
            <Button
              size="l"
              prefixIcon="plus"
              onClick={() => {
                setBookingKey((k) => k + 1);
                setBookingOpen(true);
              }}
            >
              Book appointment
            </Button>
          </Row>

          <div role="status" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>
            {notice}
          </div>
          {notice && (
            <Row aria-hidden="true" gap="8" vertical="center" padding="12" radius="m" background="success-alpha-weak" border="success-alpha-medium">
              <Icon name="check" size="s" onBackground="success-strong" />
              <Text textVariant="label-strong-m" onBackground="success-strong">
                {notice}
              </Text>
            </Row>
          )}

          <Grid columns="4" s={{ columns: "2" }} gap="12" fillWidth>
            {stats.map((s) => (
              <Row key={s.label} background="surface" border radius="l" padding="16" gap="12" vertical="center">
                <Icon name={s.icon} size="m" onBackground="neutral-weak" />
                <Column>
                  <Text textVariant="display-strong-xs" style={{ fontVariantNumeric: "tabular-nums" }}>
                    {s.value}
                  </Text>
                  <Text textVariant="label-default-s" onBackground="neutral-weak">
                    {s.label}
                  </Text>
                </Column>
              </Row>
            ))}
          </Grid>

          <Row fillWidth wrap gap="24" vertical="start">
            <WaitingList waiting={waiting} now={now} />

            <Column as="section" aria-labelledby="schedule-title" gap="16" style={{ flex: "3 1 32rem", minWidth: 0 }}>
              <Row fillWidth wrap gap="12" vertical="center" horizontal="between">
                <Heading as="h2" id="schedule-title" textVariant="heading-strong-l">
                  All appointments ({visible.length})
                </Heading>
                <Row role="group" aria-label="Filter by vet" style={{ maxWidth: "100%" }}>
                  <SegmentedControl buttons={vetButtons} value={vetFilter} onValueChange={setVetFilter} />
                </Row>
              </Row>
              <Column as="ul" gap="12" style={{ margin: 0, padding: 0, listStyle: "none" }}>
                {visible.map((a) => (
                  <AppointmentRow key={a.id} appt={a} now={now} justAdded={a.id === lastAdded} onCheckIn={checkIn} />
                ))}
                {visible.length === 0 && (
                  <Column padding="24">
                    <Text onBackground="neutral-weak">No appointments for this vet today.</Text>
                  </Column>
                )}
              </Column>
            </Column>
          </Row>
        </Column>
      </Column>

      {bookingOpen && (
        <BookingDialog key={bookingKey} open={bookingOpen} onClose={() => setBookingOpen(false)} appointments={appts} now={now} onBook={book} />
      )}
    </Column>
  );
}
```

```tsx components/WeightChart.tsx
"use client";

import { Column, Row, Text } from "@once-ui-system/core";
import { dayNumber, fmtDate, fmtShortDate, type Weight } from "@/lib/data";

const W = 600;
const H = 260;
const L = 44;
const R = 28;
const T = 34;
const B = 44;

export function WeightChart({ points }: { points: Weight[] }) {
  if (points.length === 0) return null;
  const first = points[0];
  const last = points[points.length - 1];
  const kgs = points.map((p) => p.kg);
  const lo = Math.floor(Math.min(...kgs));
  let hi = Math.ceil(Math.max(...kgs));
  if (hi === lo) hi += 1;
  const d0 = dayNumber(first.date);
  const span = Math.max(1, dayNumber(last.date) - d0);
  const x = (iso: string) => L + ((dayNumber(iso) - d0) / span) * (W - L - R);
  const y = (kg: number) => T + (1 - (kg - lo) / (hi - lo)) * (H - T - B);
  const ticks: number[] = [];
  for (let t = lo; t <= hi; t += 1) ticks.push(t);

  const line = points.map((p) => `${x(p.date).toFixed(1)},${y(p.kg).toFixed(1)}`).join(" ");
  const area = `${x(first.date).toFixed(1)},${(H - B).toFixed(1)} ${line} ${x(last.date).toFixed(1)},${(H - B).toFixed(1)}`;
  const change = last.kg - first.kg;
  const pct = (change / first.kg) * 100;
  const summary = `Weight went from ${first.kg} kg on ${fmtDate(first.date)} to ${last.kg} kg on ${fmtDate(last.date)}.`;

  return (
    <Column gap="16" fillWidth>
      <Row gap="8" vertical="end" wrap>
        <Text textVariant="display-strong-xs" style={{ fontVariantNumeric: "tabular-nums" }}>
          {last.kg} kg
        </Text>
        <Text textVariant="label-strong-m" onBackground={change < 0 ? "warning-strong" : "neutral-medium"}>
          {change > 0 ? "+" : "−"}
          {Math.abs(change).toFixed(1)} kg ({Math.abs(pct).toFixed(1)}%) since {fmtShortDate(first.date)}
        </Text>
      </Row>
      <Row fillWidth onBackground="neutral-medium">
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label={summary} style={{ display: "block", height: "auto" }}>
          <title>{summary}</title>
          {ticks.map((t) => (
            <g key={t}>
              <line x1={L} x2={W - R} y1={y(t)} y2={y(t)} stroke="currentColor" strokeOpacity={0.18} />
              <text x={L - 8} y={y(t) + 4} textAnchor="end" fontSize={13} fill="currentColor">
                {t}
              </text>
            </g>
          ))}
          <polygon points={area} fill="var(--brand-solid-strong)" fillOpacity={0.1} />
          <polyline points={line} fill="none" stroke="var(--brand-solid-strong)" strokeWidth={3} strokeLinejoin="round" strokeLinecap="round" />
          {points.map((p, i) => {
            const isLast = i === points.length - 1;
            return (
              <g key={p.date}>
                <circle cx={x(p.date)} cy={y(p.kg)} r={isLast ? 6 : 4.5} fill="var(--brand-solid-strong)" />
                <text x={x(p.date)} y={y(p.kg) - 12} textAnchor={isLast ? "end" : "middle"} fontSize={14} fontWeight={isLast ? 700 : 500} fill="currentColor">
                  {p.kg}
                </text>
                <text x={x(p.date)} y={H - 16} textAnchor={i === 0 ? "start" : isLast ? "end" : "middle"} fontSize={14} fill="currentColor" fillOpacity={0.8}>
                  {fmtShortDate(p.date)}
                </text>
              </g>
            );
          })}
        </svg>
      </Row>
      <Column as="ul" gap="4" style={{ margin: 0, padding: 0, listStyle: "none" }} aria-label="Weight readings">
        {[...points].reverse().map((p, i, arr) => {
          const prev = arr[i + 1];
          const diff = prev ? p.kg - prev.kg : null;
          return (
            <Row as="li" key={p.date} horizontal="between" gap="12" paddingY="4" borderBottom={i < arr.length - 1 ? true : false}>
              <Text textVariant="body-default-s" onBackground="neutral-weak">
                {fmtDate(p.date)}
              </Text>
              <Text textVariant="label-strong-s" style={{ fontVariantNumeric: "tabular-nums" }}>
                {p.kg} kg
                {diff !== null ? ` (${diff < 0 ? "−" : "+"}${Math.abs(diff).toFixed(1)})` : ""}
              </Text>
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

import type { ReactNode } from "react";
import { Button, Column, Grid, Heading, Icon, Row, SmartLink, Tag, Text } from "@once-ui-system/core";
import { AlertBanner } from "@/components/Alerts";
import { AppHeader } from "@/components/AppHeader";
import { WeightChart } from "@/components/WeightChart";
import {
  ageLabel,
  APPOINTMENTS,
  daysBetween,
  fmtDate,
  fmtDuration,
  fmtMoney,
  fmtTime,
  ownerById,
  type Patient,
  RECORDS,
  STATUS_LABEL,
  TODAY,
  vetById,
} from "@/lib/data";

function Panel({ id, title, icon, children }: { id: string; title: string; icon: "heart" | "clipboard" | "trend" | "document" | "calendar"; children: ReactNode }) {
  return (
    <Column as="section" aria-labelledby={id} background="surface" border radius="l" padding="20" gap="16" fillWidth>
      <Row gap="8" vertical="center">
        <Icon name={icon} size="m" onBackground="neutral-weak" />
        <Heading as="h2" id={id} textVariant="heading-strong-l">
          {title}
        </Heading>
      </Row>
      {children}
    </Column>
  );
}

function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Column gap="4">
      <Text textVariant="label-default-s" onBackground="neutral-weak">
        {label}
      </Text>
      <Text textVariant="body-strong-m">{children}</Text>
    </Column>
  );
}

export function PatientRecord({ patient }: { patient: Patient }) {
  const owner = ownerById(patient.owner);
  const record = RECORDS[patient.id];
  const todays = APPOINTMENTS.filter((a) => a.patient === patient.id).sort((a, b) => a.start.localeCompare(b.start));
  const lastWeight = record?.weights_kg[record.weights_kg.length - 1];

  const vaccines = record
    ? record.vaccinations
        .map((v) => ({ ...v, overdueBy: daysBetween(v.due, TODAY) }))
        .sort((a, b) => b.overdueBy - a.overdueBy)
    : [];
  const overdue = vaccines.filter((v) => v.overdueBy > 0);

  return (
    <Column fillWidth minHeight="100vh">
      <AppHeader />
      <Column as="main" id="main" fillWidth horizontal="center" paddingX="16" paddingY="24">
        <Column fillWidth gap="24" style={{ maxWidth: "80rem" }}>
          <SmartLink href="/" prefixIcon="arrowLeft">
            Today’s schedule
          </SmartLink>

          <AlertBanner name={patient.name} alerts={patient.alerts} />

          <Column as="section" aria-label="Patient and owner details" background="surface" border radius="l" padding="20" gap="20" fillWidth>
            <Row wrap gap="16" vertical="center" horizontal="between">
              <Row gap="16" vertical="center">
                <Row center width={56} height={56} radius="full" background="brand-alpha-weak">
                  <Icon name="paw" size="l" onBackground="brand-strong" />
                </Row>
                <Column gap="4">
                  <Heading as="h1" textVariant="display-strong-xs">
                    {patient.name}
                  </Heading>
                  <Text onBackground="neutral-weak">
                    {patient.species}, {patient.breed}
                  </Text>
                </Column>
              </Row>
              <Row gap="8" wrap>
                {overdue.length > 0 && (
                  <Tag tone="danger" prefixIcon="warning" label={`${overdue.length} vaccinations overdue`} />
                )}
              </Row>
            </Row>
            <Grid minColumnWidth="12rem" gap="20" fillWidth>
              <Fact label="Born">
                {fmtDate(patient.born)} ({ageLabel(patient.born, TODAY)})
              </Fact>
              <Fact label="Sex">{patient.sex}</Fact>
              {lastWeight && <Fact label={`Weight, ${fmtDate(lastWeight.date)}`}>{lastWeight.kg} kg</Fact>}
              <Fact label="Owner">{owner.name}</Fact>
              <Column gap="4">
                <Text textVariant="label-default-s" onBackground="neutral-weak">
                  Owner phone
                </Text>
                <Row>
                  <Button href={`tel:${owner.phone.replace(/\s+/g, "")}`} variant="secondary" size="s" prefixIcon="phone">
                    {owner.phone}
                  </Button>
                </Row>
              </Column>
            </Grid>
          </Column>

          {todays.length > 0 && (
            <Panel id="today-title" title="Today at the clinic" icon="calendar">
              <Column as="ul" gap="8" style={{ margin: 0, padding: 0, listStyle: "none" }}>
                {todays.map((a) => (
                  <Row as="li" key={a.id} gap="12" wrap vertical="center" padding="12" radius="m" background="neutral-alpha-weak">
                    <Text textVariant="label-strong-m" style={{ minWidth: "5rem" }}>
                      {fmtTime(a.start)}
                    </Text>
                    <Text flex="1" textVariant="body-default-m" style={{ minWidth: "12rem" }}>
                      {a.reason} with {vetById(a.vet).name} ({vetById(a.vet).room}), {fmtDuration(a.minutes)}
                    </Text>
                    <Tag tone={a.status === "done" ? "success" : "neutral"} label={STATUS_LABEL[a.status]} />
                  </Row>
                ))}
              </Column>
            </Panel>
          )}

          {!record ? (
            <Column background="surface" border radius="l" padding="24" gap="8" fillWidth>
              <Text textVariant="heading-strong-m">No detailed record in this demo</Text>
              <Text onBackground="neutral-weak">
                Weights, vaccinations, medications and visit notes are shown for Olive (p-104) in this build.
              </Text>
            </Column>
          ) : (
            <Row fillWidth wrap gap="24" vertical="start">
              <Column gap="24" style={{ flex: "1 1 26rem", minWidth: 0 }}>
                <Panel id="vax-title" title="Vaccinations" icon="heart">
                  <Column as="ul" gap="8" style={{ margin: 0, padding: 0, listStyle: "none" }}>
                    {vaccines.map((v) => {
                      const late = v.overdueBy > 0;
                      const soon = !late && v.overdueBy > -30;
                      return (
                        <Row
                          as="li"
                          key={v.name}
                          wrap
                          gap="12"
                          vertical="center"
                          horizontal="between"
                          padding="12"
                          radius="m"
                          background={late ? "danger-alpha-weak" : "neutral-alpha-weak"}
                          border={late ? "danger-alpha-strong" : false}
                          borderWidth={late ? 2 : 1}
                        >
                          <Column gap="4">
                            <Text textVariant="body-strong-m">{v.name}</Text>
                            <Text textVariant="body-default-s" onBackground="neutral-weak">
                              Given {fmtDate(v.given)} · due {fmtDate(v.due)}
                            </Text>
                          </Column>
                          {late ? (
                            <Tag tone="danger" prefixIcon="warning" label={`Overdue ${v.overdueBy} days`} />
                          ) : soon ? (
                            <Tag tone="warning" label={`Due in ${-v.overdueBy} days`} />
                          ) : (
                            <Tag tone="success" prefixIcon="check" label="Up to date" />
                          )}
                        </Row>
                      );
                    })}
                  </Column>
                </Panel>

                <Panel id="meds-title" title="Current medications" icon="clipboard">
                  <Column as="ul" gap="8" style={{ margin: 0, padding: 0, listStyle: "none" }}>
                    {record.medications.map((m) => (
                      <Row as="li" key={m.name} wrap gap="12" horizontal="between" padding="12" radius="m" background="neutral-alpha-weak">
                        <Column gap="4">
                          <Text textVariant="body-strong-m">{m.name}</Text>
                          <Text textVariant="body-default-s" onBackground="neutral-weak">
                            {m.dose}
                          </Text>
                        </Column>
                        <Text textVariant="label-default-s" onBackground="neutral-weak">
                          Since {fmtDate(m.since)}
                        </Text>
                      </Row>
                    ))}
                  </Column>
                </Panel>

                <Panel id="weight-title" title="Weight trend (kg)" icon="trend">
                  <WeightChart points={record.weights_kg} />
                </Panel>
              </Column>

              <Column style={{ flex: "1.2 1 28rem", minWidth: 0 }}>
                <Panel id="visits-title" title="Visit history" icon="document">
                  <Column as="ol" gap="16" style={{ margin: 0, padding: 0, listStyle: "none" }}>
                    {record.visits.map((v) => (
                      <Column as="li" key={v.date} gap="8" padding="16" radius="m" background="neutral-alpha-weak">
                        <Row wrap gap="8" horizontal="between" vertical="center">
                          <Text textVariant="body-strong-m">{v.reason}</Text>
                          <Text textVariant="label-default-s" onBackground="neutral-weak">
                            {fmtDate(v.date)}
                          </Text>
                        </Row>
                        <Text textVariant="label-default-s" onBackground="neutral-weak">
                          {vetById(v.vet).name} · Invoice {fmtMoney(v.invoice_usd)}
                        </Text>
                        <Text textVariant="body-default-m">{v.notes}</Text>
                      </Column>
                    ))}
                  </Column>
                </Panel>
              </Column>
            </Row>
          )}
        </Column>
      </Column>
    </Column>
  );
}
```

```tsx app/page.tsx
import type { Metadata } from "next";
import { Schedule } from "@/components/Schedule";

export const metadata: Metadata = { title: "Today’s schedule · Pawpoint" };

export default function Page() {
  return <Schedule />;
}
```

```tsx app/patients/[id]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PatientRecord } from "@/components/PatientRecord";
import { PATIENTS, patientById } from "@/lib/data";

export function generateStaticParams() {
  return PATIENTS.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const patient = patientById(id);
  return { title: patient ? `${patient.name} · Pawpoint` : "Patient · Pawpoint" };
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const patient = patientById(id);
  if (!patient) notFound();
  return <PatientRecord patient={patient} />;
}
```
