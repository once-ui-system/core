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

export const CLINIC = {
  name: "Pawpoint",
  tagline: "Front-desk and records software for Hillside Veterinary Clinic",
  site: "Hillside Veterinary Clinic",
};

export const TODAY = "2026-11-12";

/** The clinic clock when the page first opens (minutes after midnight): 9:22 AM. */
export const CLINIC_NOW = 9 * 60 + 22;
export const OPEN_MIN = 8 * 60;
export const CLOSE_MIN = 18 * 60;

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

/** When the patients who are already checked in arrived (the check-in is not part of the appointment data). */
export const checkedInSeed: Record<string, string> = {
  "a-05": "09:05",
  "a-06": "09:18",
};

export const records: Record<string, PatientRecordData | undefined> = {
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

/* ---------- lookups ---------- */

export function getPatient(id: string): Patient | undefined {
  return patients.find((p) => p.id === id);
}

export function getOwner(id: string): Owner | undefined {
  return owners.find((o) => o.id === id);
}

export function getVet(id: string): Vet | undefined {
  return vets.find((v) => v.id === id);
}

export function ownerOf(patient: Patient): Owner {
  return getOwner(patient.owner) ?? { id: "", name: "Unknown owner", phone: "" };
}

/* ---------- time and date ---------- */

export function toMin(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function minToTime(total: number): string {
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function fmtMin(total: number): string {
  const h = Math.floor(total / 60);
  const m = total % 60;
  const suffix = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${suffix}`;
}

export function fmtTime(time: string): string {
  return fmtMin(toMin(time));
}

export function fmtDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h} h` : `${h} h ${m} min`;
}

function parseDate(date: string): number {
  const [y, m, d] = date.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
}

export function fmtDate(date: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(parseDate(date));
}

export function fmtDateLong(date: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(parseDate(date));
}

export function fmtMonthYear(date: string): string {
  const d = new Date(parseDate(date));
  const month = new Intl.DateTimeFormat("en-US", { timeZone: "UTC", month: "short" }).format(d);
  return `${month} '${String(d.getUTCFullYear()).slice(2)}`;
}

export function daysBetween(from: string, to: string): number {
  return Math.round((parseDate(to) - parseDate(from)) / 86_400_000);
}

export function ageLabel(born: string, today: string): string {
  const [by, bm, bd] = born.split("-").map(Number);
  const [ty, tm, td] = today.split("-").map(Number);
  let months = (ty - by) * 12 + (tm - bm);
  if (td < bd) months -= 1;
  const years = Math.floor(months / 12);
  const rest = months % 12;
  const y = years === 1 ? "1 year" : `${years} years`;
  if (rest === 0) return y;
  return `${y}, ${rest === 1 ? "1 month" : `${rest} months`}`;
}

export type VaccinationState = "overdue" | "soon" | "current";

export function vaccinationStatus(due: string, today: string): { state: VaccinationState; days: number } {
  const days = daysBetween(today, due);
  if (days < 0) return { state: "overdue", days: -days };
  if (days <= 30) return { state: "soon", days };
  return { state: "current", days };
}

export function fmtUsd(value: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
}

/* ---------- booking rules ---------- */

export function endMin(a: { start: string; minutes: number }): number {
  return toMin(a.start) + a.minutes;
}

function overlaps(aStart: number, aEnd: number, b: Appointment): boolean {
  return aStart < endMin(b) && toMin(b.start) < aEnd;
}

/** An existing, non-cancelled booking for the same vet that overlaps the requested slot. */
export function findVetConflict(
  list: Appointment[],
  vetId: string,
  start: number,
  minutes: number,
): Appointment | undefined {
  return list.find((a) => a.vet === vetId && a.status !== "cancelled" && overlaps(start, start + minutes, a));
}

/** An existing, non-cancelled booking for the same patient that overlaps the requested slot. */
export function findPatientConflict(
  list: Appointment[],
  patientId: string,
  start: number,
  minutes: number,
): Appointment | undefined {
  return list.find((a) => a.patient === patientId && a.status !== "cancelled" && overlaps(start, start + minutes, a));
}

export function describeVetConflict(a: Appointment): string {
  const vet = getVet(a.vet)?.name ?? "This vet";
  const patient = getPatient(a.patient)?.name ?? "another patient";
  return `${vet} is already booked ${fmtMin(toMin(a.start))} to ${fmtMin(endMin(a))} (${patient}, ${a.reason.toLowerCase()}).`;
}

export function describePatientConflict(a: Appointment): string {
  const patient = getPatient(a.patient)?.name ?? "This patient";
  const vet = getVet(a.vet)?.name ?? "another vet";
  return `${patient} already has an appointment ${fmtMin(toMin(a.start))} to ${fmtMin(endMin(a))} with ${vet}.`;
}

export function nextFreeStart(
  list: Appointment[],
  vetId: string,
  minutes: number,
  from: number,
): string | undefined {
  for (let t = Math.max(OPEN_MIN, Math.ceil(from / 15) * 15); t + minutes <= CLOSE_MIN; t += 15) {
    if (!findVetConflict(list, vetId, t, minutes)) return minToTime(t);
  }
  return undefined;
}

/* ---------- search ---------- */

export function searchPatients(query: string): Patient[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const digits = q.replace(/\D/g, "");
  const scored = patients
    .map((p) => {
      const owner = ownerOf(p);
      const name = p.name.toLowerCase();
      const ownerName = owner.name.toLowerCase();
      let score = 0;
      if (name.startsWith(q)) score = 4;
      else if (ownerName.split(" ").some((part) => part.startsWith(q)) || ownerName.startsWith(q)) score = 3;
      else if (name.includes(q)) score = 2;
      else if (ownerName.includes(q)) score = 1;
      else if (digits.length >= 3 && owner.phone.replace(/\D/g, "").includes(digits)) score = 1;
      return { p, score };
    })
    .filter((x) => x.score > 0);
  scored.sort((a, b) => b.score - a.score || a.p.name.localeCompare(b.p.name));
  return scored.map((x) => x.p);
}
```

```tsx components/clinic-provider.tsx
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  CLINIC_NOW,
  appointments as seedAppointments,
  checkedInSeed,
  describePatientConflict,
  describeVetConflict,
  findPatientConflict,
  findVetConflict,
  toMin,
  type Appointment,
} from "@/lib/data";

export type LiveAppointment = Appointment & { checkedInAt?: number };

export interface BookInput {
  patient: string;
  vet: string;
  start: string;
  minutes: number;
  reason: string;
  urgent: boolean;
}

export type BookResult = { ok: true; id: string } | { ok: false; error: string };

interface ClinicContextValue {
  /** Minutes after midnight on the clinic clock. */
  now: number;
  appointments: LiveAppointment[];
  checkIn: (id: string) => void;
  startExam: (id: string) => void;
  finish: (id: string) => void;
  book: (input: BookInput) => BookResult;
}

const ClinicContext = createContext<ClinicContextValue | null>(null);

export function ClinicProvider({ children }: { children: ReactNode }) {
  const [now, setNow] = useState(CLINIC_NOW);
  const [appointments, setAppointments] = useState<LiveAppointment[]>(() =>
    seedAppointments.map((a) => ({
      ...a,
      checkedInAt: checkedInSeed[a.id] ? toMin(checkedInSeed[a.id]) : undefined,
    })),
  );

  // The demo clock starts at 9:22 AM and moves forward a minute at a time.
  useEffect(() => {
    const timer = window.setInterval(() => setNow((n) => n + 1), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const patch = useCallback((id: string, changes: Partial<LiveAppointment>) => {
    setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, ...changes } : a)));
  }, []);

  const checkIn = useCallback((id: string) => patch(id, { status: "checked_in", checkedInAt: now }), [patch, now]);
  const startExam = useCallback((id: string) => patch(id, { status: "in_exam" }), [patch]);
  const finish = useCallback((id: string) => patch(id, { status: "done" }), [patch]);

  const book = useCallback(
    (input: BookInput): BookResult => {
      const start = toMin(input.start);
      if (start < now) return { ok: false, error: "That time has already passed." };
      const vetClash = findVetConflict(appointments, input.vet, start, input.minutes);
      if (vetClash) return { ok: false, error: describeVetConflict(vetClash) };
      const patientClash = findPatientConflict(appointments, input.patient, start, input.minutes);
      if (patientClash) return { ok: false, error: describePatientConflict(patientClash) };
      const next =
        appointments.reduce((max, a) => Math.max(max, Number(a.id.replace(/\D/g, "")) || 0), 0) + 1;
      const id = `a-${String(next).padStart(2, "0")}`;
      setAppointments((prev) => [
        ...prev,
        {
          id,
          patient: input.patient,
          vet: input.vet,
          start: input.start,
          minutes: input.minutes,
          reason: input.reason.trim(),
          status: "booked",
          urgent: input.urgent || undefined,
        },
      ]);
      return { ok: true, id };
    },
    [appointments, now],
  );

  const value = useMemo(
    () => ({ now, appointments, checkIn, startExam, finish, book }),
    [now, appointments, checkIn, startExam, finish, book],
  );

  return <ClinicContext.Provider value={value}>{children}</ClinicContext.Provider>;
}

export function useClinic(): ClinicContextValue {
  const ctx = useContext(ClinicContext);
  if (!ctx) throw new Error("useClinic must be used inside ClinicProvider");
  return ctx;
}
```

```tsx components/patient-alerts.tsx
import { Badge, Box, Heading, HStack, Stack, Text } from "@chakra-ui/react";
import { LuTriangleAlert } from "react-icons/lu";

/** Compact medical alerts: solid red chips with a warning icon, shown wherever a patient appears. */
export function AlertChips({ alerts }: { alerts: string[] }) {
  if (alerts.length === 0) return null;
  return (
    <HStack as="ul" role="list" aria-label="Medical alerts" gap="1.5" flexWrap="wrap" listStyleType="none" m="0" p="0">
      {alerts.map((alert) => (
        <Box as="li" key={alert} listStyleType="none">
          <Badge
            colorPalette="red"
            variant="solid"
            size="md"
            whiteSpace="normal"
            textAlign="start"
            gap="1.5"
            px="2"
            py="1"
          >
            <LuTriangleAlert aria-hidden="true" />
            {alert}
          </Badge>
        </Box>
      ))}
    </HStack>
  );
}

/** The large, hard-to-miss alert panel on a patient's record. */
export function AlertBanner({ name, alerts }: { name: string; alerts: string[] }) {
  if (alerts.length === 0) {
    return (
      <Box
        borderWidth="1px"
        borderColor="border.muted"
        bg="bg.panel"
        rounded="lg"
        px="4"
        py="3"
        color="fg.muted"
      >
        <Text fontSize="sm">No medical alerts on file for {name}.</Text>
      </Box>
    );
  }
  return (
    <Box
      as="section"
      aria-labelledby="medical-alerts-heading"
      bg="red.subtle"
      borderWidth="2px"
      borderColor="red.solid"
      borderStartWidth="8px"
      rounded="lg"
      p={{ base: "4", md: "5" }}
    >
      <HStack gap="2" color="red.fg" mb="2">
        <LuTriangleAlert size={24} aria-hidden="true" />
        <Heading
          id="medical-alerts-heading"
          as="h2"
          size="md"
          textTransform="uppercase"
          letterSpacing="wider"
        >
          Medical alerts for {name}
        </Heading>
      </HStack>
      <Stack as="ul" gap="1" listStyleType="none" m="0" p="0">
        {alerts.map((alert) => (
          <Text
            as="li"
            key={alert}
            fontSize={{ base: "xl", md: "2xl" }}
            fontWeight="bold"
            color="red.fg"
            lineHeight="short"
          >
            {alert}
          </Text>
        ))}
      </Stack>
    </Box>
  );
}
```

```tsx components/patient-search.tsx
"use client";

import { useId, useMemo, useState, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { Box, HStack, Input, Stack, Text } from "@chakra-ui/react";
import { LuSearch } from "react-icons/lu";
import { InputGroup } from "@/components/ui/input-group";
import { AlertChips } from "@/components/patient-alerts";
import { ownerOf, searchPatients } from "@/lib/data";

export function PatientSearch() {
  const router = useRouter();
  const listId = useId();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  const results = useMemo(() => searchPatients(query), [query]);
  const showPanel = open && query.trim().length > 0;

  const go = (id: string) => {
    setQuery("");
    setOpen(false);
    setActive(0);
    router.push(`/patients/${id}`);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
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
      setQuery("");
    }
  };

  return (
    <Box
      position="relative"
      w="full"
      maxW={{ md: "28rem" }}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOpen(false);
      }}
    >
      <InputGroup flex="1" w="full" startElement={<LuSearch aria-hidden="true" />}>
        <Input
          type="search"
          size="lg"
          placeholder="Find a patient or owner"
          aria-label="Search patients or owners by name"
          role="combobox"
          aria-expanded={showPanel}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={showPanel && results[active] ? `${listId}-${results[active].id}` : undefined}
          autoComplete="off"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
        />
      </InputGroup>

      {showPanel && (
        <Box
          position="absolute"
          top="calc(100% + 6px)"
          insetInline="0"
          zIndex="dropdown"
          bg="bg.panel"
          borderWidth="1px"
          borderColor="border"
          rounded="lg"
          shadow="lg"
          maxH="22rem"
          overflowY="auto"
          p="1"
        >
          <Stack id={listId} role="listbox" aria-label="Matching patients" gap="0">
            {results.map((p, i) => {
              const owner = ownerOf(p);
              return (
                <Box
                  key={p.id}
                  id={`${listId}-${p.id}`}
                  role="option"
                  aria-selected={i === active}
                  cursor="pointer"
                  rounded="md"
                  px="3"
                  py="2.5"
                  bg={i === active ? "bg.muted" : "transparent"}
                  _hover={{ bg: "bg.muted" }}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => go(p.id)}
                >
                  <HStack justify="space-between" gap="3">
                    <Text fontWeight="semibold">{p.name}</Text>
                    <Text fontSize="sm" color="fg.muted">
                      {p.species} · {p.breed}
                    </Text>
                  </HStack>
                  <Text fontSize="sm" color="fg.muted">
                    Owner: {owner.name} · {owner.phone}
                  </Text>
                  {p.alerts.length > 0 && (
                    <Box mt="1.5">
                      <AlertChips alerts={p.alerts} />
                    </Box>
                  )}
                </Box>
              );
            })}
          </Stack>
          {results.length === 0 && (
            <Text role="status" px="3" py="3" color="fg.muted" fontSize="sm">
              No patient or owner matches &ldquo;{query.trim()}&rdquo;.
            </Text>
          )}
        </Box>
      )}
    </Box>
  );
}
```

```tsx components/app-shell.tsx
"use client";

import type { ReactNode } from "react";
import NextLink from "next/link";
import { Box, Flex, Link, Text } from "@chakra-ui/react";
import { LuPawPrint } from "react-icons/lu";
import { Avatar } from "@/components/ui/avatar";
import { ColorModeButton } from "@/components/ui/color-mode";
import { PatientSearch } from "@/components/patient-search";
import { CLINIC, user } from "@/lib/data";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <Flex direction="column" minH="100dvh" bg="bg.subtle">
      <Link
        href="#main"
        css={{
          position: "absolute",
          left: "-9999px",
          "&:focus": {
            left: "4",
            top: "2",
            zIndex: "toast",
            background: "var(--chakra-colors-bg-panel)",
            padding: "8px 12px",
            borderRadius: "8px",
          },
        }}
      >
        Skip to main content
      </Link>

      <Box
        as="header"
        position="sticky"
        top="0"
        zIndex="sticky"
        bg="bg.panel"
        borderBottomWidth="1px"
        borderColor="border.muted"
      >
        <Flex
          maxW="96rem"
          mx="auto"
          px={{ base: "4", md: "6" }}
          py="3"
          align="center"
          gap={{ base: "3", md: "6" }}
          flexWrap="wrap"
        >
          <Link asChild variant="plain" _hover={{ textDecoration: "none" }} aria-label="Pawpoint, today's schedule">
            <NextLink href="/">
              <Flex align="center" gap="3">
                <Box
                  boxSize="10"
                  rounded="lg"
                  bg="teal.solid"
                  color="teal.contrast"
                  display="grid"
                  placeItems="center"
                >
                  <LuPawPrint size={22} aria-hidden="true" />
                </Box>
                <Box lineHeight="1.2">
                  <Text fontWeight="bold" fontSize="lg" color="fg">
                    {CLINIC.name}
                  </Text>
                  <Text fontSize="xs" color="fg.muted" hideBelow="sm">
                    {CLINIC.site}
                  </Text>
                </Box>
              </Flex>
            </NextLink>
          </Link>

          <Flex
            flex="1"
            order={{ base: 3, md: 0 }}
            flexBasis={{ base: "100%", md: "0" }}
            minW="0"
            justify={{ md: "center" }}
          >
            <PatientSearch />
          </Flex>

          <Flex align="center" gap="3" ms="auto">
            <ColorModeButton />
            <Flex align="center" gap="3">
              <Avatar name={user.name} size="sm" colorPalette="teal" />
              <Box lineHeight="1.25" hideBelow="md">
                <Text fontSize="sm" fontWeight="medium">
                  {user.name}
                </Text>
                <Text fontSize="xs" color="fg.muted">
                  {user.role}
                </Text>
              </Box>
            </Flex>
          </Flex>
        </Flex>
      </Box>

      <Box
        as="main"
        id="main"
        tabIndex={-1}
        w="full"
        maxW="96rem"
        mx="auto"
        px={{ base: "4", md: "6" }}
        py={{ base: "5", md: "7" }}
        flex="1"
        outline="none"
      >
        {children}
      </Box>
    </Flex>
  );
}
```

```tsx components/booking-dialog.tsx
"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Box, Button, chakra, Input, Stack, Text } from "@chakra-ui/react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DialogActionTrigger,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { NativeSelectField, NativeSelectRoot } from "@/components/ui/native-select";
import { AlertChips } from "@/components/patient-alerts";
import { useClinic } from "@/components/clinic-provider";
import {
  CLOSE_MIN,
  OPEN_MIN,
  describePatientConflict,
  describeVetConflict,
  findPatientConflict,
  findVetConflict,
  fmtDuration,
  fmtMin,
  getPatient,
  minToTime,
  nextFreeStart,
  ownerOf,
  patients,
  toMin,
  vets,
} from "@/lib/data";

const LENGTHS = [15, 20, 30, 45, 60, 90, 120];

interface BookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBooked: (id: string) => void;
}

export function BookingDialog({ open, onOpenChange, onBooked }: BookingDialogProps) {
  return (
    <DialogRoot
      open={open}
      onOpenChange={(e) => onOpenChange(e.open)}
      placement="center"
      scrollBehavior="inside"
      lazyMount
      unmountOnExit
    >
      <DialogContent>
        <BookingForm onClose={() => onOpenChange(false)} onBooked={onBooked} />
      </DialogContent>
    </DialogRoot>
  );
}

function BookingForm({ onClose, onBooked }: { onClose: () => void; onBooked: (id: string) => void }) {
  const { appointments, now, book } = useClinic();

  const [patientId, setPatientId] = useState("");
  const [vetId, setVetId] = useState(vets[0].id);
  const [minutes, setMinutes] = useState(20);
  const [time, setTime] = useState(() => nextFreeStart(appointments, vets[0].id, 20, now) ?? "");
  const [reason, setReason] = useState("");
  const [urgent, setUrgent] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const patient = patientId ? getPatient(patientId) : undefined;

  const sortedPatients = useMemo(
    () => [...patients].sort((a, b) => a.name.localeCompare(b.name)),
    [],
  );

  const patientItems = sortedPatients.map((p) => ({
    value: p.id,
    label: `${p.name} (${p.species}) · ${ownerOf(p).name}${p.alerts.length > 0 ? " · ALERT" : ""}`,
  }));

  const vetItems = vets.map((v) => ({ value: v.id, label: `${v.name} · ${v.room}` }));
  const lengthItems = LENGTHS.map((m) => ({ value: String(m), label: fmtDuration(m) }));

  const timeItems = useMemo(() => {
    const items: { value: string; label: string; disabled?: boolean }[] = [];
    for (let t = OPEN_MIN; t < CLOSE_MIN; t += 15) {
      const label = fmtMin(t);
      if (t < now) items.push({ value: minToTime(t), label: `${label} (passed)`, disabled: true });
      else if (t + minutes > CLOSE_MIN) items.push({ value: minToTime(t), label: `${label} (after closing)`, disabled: true });
      else if (findVetConflict(appointments, vetId, t, minutes))
        items.push({ value: minToTime(t), label: `${label} (taken)`, disabled: true });
      else items.push({ value: minToTime(t), label });
    }
    return items;
  }, [appointments, vetId, minutes, now]);

  const timeError = useMemo(() => {
    if (!time) return "There is no free time left today for this vet and length.";
    const start = toMin(time);
    if (start < now) return "That time has already passed.";
    if (start + minutes > CLOSE_MIN) return "That appointment would run past closing time.";
    const vetClash = findVetConflict(appointments, vetId, start, minutes);
    if (vetClash) return describeVetConflict(vetClash);
    if (patientId) {
      const patientClash = findPatientConflict(appointments, patientId, start, minutes);
      if (patientClash) return describePatientConflict(patientClash);
    }
    return "";
  }, [appointments, vetId, minutes, time, now, patientId]);

  const suggestion = timeError ? nextFreeStart(appointments, vetId, minutes, now) : undefined;

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
    if (!patientId || !reason.trim() || !time || timeError) return;
    const result = book({ patient: patientId, vet: vetId, start: time, minutes, reason, urgent });
    if (!result.ok) return;
    onBooked(result.id);
    onClose();
  };

  return (
    <chakra.form display="contents" onSubmit={onSubmit} noValidate>
      <DialogHeader>
        <Stack gap="1">
          <DialogTitle>Book an appointment</DialogTitle>
          <DialogDescription>
            Pick a patient, a vet and a time. A time that clashes with another booking for the same vet cannot be chosen.
          </DialogDescription>
        </Stack>
      </DialogHeader>
      <DialogCloseTrigger />
      <DialogBody>
        <Stack gap="4">
          <Field
            label="Patient"
            required
            invalid={submitted && !patientId}
            errorText="Choose a patient."
          >
            <NativeSelectRoot size="lg">
              <NativeSelectField
                placeholder="Choose a patient"
                items={patientItems}
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
              />
            </NativeSelectRoot>
          </Field>

          {patient && patient.alerts.length > 0 && (
            <Box>
              <Text fontSize="sm" fontWeight="medium" mb="1.5">
                Alerts for {patient.name}
              </Text>
              <AlertChips alerts={patient.alerts} />
            </Box>
          )}

          <Field label="Vet" required>
            <NativeSelectRoot size="lg">
              <NativeSelectField items={vetItems} value={vetId} onChange={(e) => setVetId(e.target.value)} />
            </NativeSelectRoot>
          </Field>

          <Stack direction={{ base: "column", sm: "row" }} gap="4">
            <Field
              label="Time"
              required
              invalid={Boolean(timeError)}
              errorText={timeError}
            >
              <NativeSelectRoot size="lg">
                <NativeSelectField items={timeItems} value={time} onChange={(e) => setTime(e.target.value)} />
              </NativeSelectRoot>
            </Field>
            <Field label="Length" required>
              <NativeSelectRoot size="lg">
                <NativeSelectField
                  items={lengthItems}
                  value={String(minutes)}
                  onChange={(e) => setMinutes(Number(e.target.value))}
                />
              </NativeSelectRoot>
            </Field>
          </Stack>

          {suggestion && (
            <Button
              type="button"
              variant="subtle"
              colorPalette="teal"
              alignSelf="flex-start"
              onClick={() => setTime(suggestion)}
            >
              Use next free time: {fmtMin(toMin(suggestion))}
            </Button>
          )}

          <Field
            label="Reason for visit"
            required
            invalid={submitted && !reason.trim()}
            errorText="Add a short reason."
          >
            <Input
              size="lg"
              value={reason}
              placeholder="For example: Ear infection follow-up"
              onChange={(e) => setReason(e.target.value)}
            />
          </Field>

          <Checkbox checked={urgent} onCheckedChange={(e) => setUrgent(e.checked === true)} colorPalette="orange">
            Urgent visit (stands out on the schedule)
          </Checkbox>
        </Stack>
      </DialogBody>
      <DialogFooter>
        <DialogActionTrigger asChild>
          <Button type="button" variant="outline" size="lg">
            Cancel
          </Button>
        </DialogActionTrigger>
        <Button type="submit" colorPalette="teal" size="lg" disabled={Boolean(timeError)}>
          Book appointment
        </Button>
      </DialogFooter>
    </chakra.form>
  );
}
```

```tsx components/schedule-board.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import NextLink from "next/link";
import { Badge, Box, Button, Flex, Grid, Heading, HStack, Link, Stack, Text } from "@chakra-ui/react";
import type { IconType } from "react-icons";
import {
  LuCalendarClock,
  LuCircleCheck,
  LuCircleX,
  LuClock,
  LuLogIn,
  LuPlus,
  LuStethoscope,
  LuZap,
} from "react-icons/lu";
import { Switch } from "@/components/ui/switch";
import { toaster } from "@/components/ui/toaster";
import { AlertChips } from "@/components/patient-alerts";
import { BookingDialog } from "@/components/booking-dialog";
import { useClinic, type LiveAppointment } from "@/components/clinic-provider";
import {
  TODAY,
  fmtDateLong,
  fmtDuration,
  fmtMin,
  fmtTime,
  getPatient,
  getVet,
  ownerOf,
  toMin,
  vets,
  type Status,
} from "@/lib/data";

const STATUS: Record<Status, { label: string; palette: string; icon: IconType; stripe: string }> = {
  booked: { label: "Booked", palette: "gray", icon: LuCalendarClock, stripe: "border.emphasized" },
  checked_in: { label: "Checked in", palette: "blue", icon: LuLogIn, stripe: "blue.solid" },
  in_exam: { label: "In exam", palette: "purple", icon: LuStethoscope, stripe: "purple.solid" },
  done: { label: "Done", palette: "green", icon: LuCircleCheck, stripe: "green.muted" },
  cancelled: { label: "Cancelled", palette: "gray", icon: LuCircleX, stripe: "border.muted" },
};

export function StatusBadge({ status }: { status: Status }) {
  const meta = STATUS[status];
  const Icon = meta.icon;
  return (
    <Badge colorPalette={meta.palette} variant="subtle" size="lg" gap="1.5">
      <Icon aria-hidden="true" />
      {meta.label}
    </Badge>
  );
}

interface Actions {
  onCheckIn: (a: LiveAppointment) => void;
  onStartExam: (a: LiveAppointment) => void;
  onFinish: (a: LiveAppointment) => void;
}

export function ScheduleBoard() {
  const { appointments, now, checkIn, startExam, finish } = useClinic();
  const [vetFilter, setVetFilter] = useState("all");
  const [hideFinished, setHideFinished] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [justBooked, setJustBooked] = useState<string | null>(null);

  useEffect(() => {
    if (!justBooked) return;
    const timer = window.setTimeout(() => setJustBooked(null), 8000);
    return () => window.clearTimeout(timer);
  }, [justBooked]);

  const actions: Actions = {
    onCheckIn: (a) => {
      const patient = getPatient(a.patient);
      const vet = getVet(a.vet);
      checkIn(a.id);
      toaster.create({
        type: "success",
        title: `${patient?.name ?? "Patient"} is checked in`,
        description: `${fmtMin(now)}. Waiting for ${vet?.name ?? "the vet"} (${vet?.room ?? ""}).`,
      });
    },
    onStartExam: (a) => {
      const vet = getVet(a.vet);
      startExam(a.id);
      toaster.create({
        type: "info",
        title: `${getPatient(a.patient)?.name ?? "Patient"} is in the exam room`,
        description: `${vet?.name ?? ""}, ${vet?.room ?? ""}`,
      });
    },
    onFinish: (a) => {
      finish(a.id);
      toaster.create({ type: "success", title: `${getPatient(a.patient)?.name ?? "Visit"} is done` });
    },
  };

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

  const waiting = appointments
    .filter((a) => a.status === "checked_in")
    .sort((a, b) => (a.checkedInAt ?? 0) - (b.checkedInAt ?? 0));

  const urgentOpen = sorted.filter((a) => a.urgent && (a.status === "booked" || a.status === "checked_in"));

  const count = (s: Status) => appointments.filter((a) => a.status === s).length;

  return (
    <Stack gap="5">
      <Flex justify="space-between" align={{ base: "stretch", md: "flex-end" }} gap="4" direction={{ base: "column", md: "row" }}>
        <Box>
          <Heading as="h1" size={{ base: "2xl", md: "3xl" }}>
            Today&rsquo;s schedule
          </Heading>
          <Text color="fg.muted" mt="1">
            {fmtDateLong(TODAY)} · {fmtMin(now)} · {appointments.filter((a) => a.status !== "cancelled").length} appointments
            across {vets.length} vets
          </Text>
        </Box>
        <Button size="lg" colorPalette="teal" onClick={() => setBookingOpen(true)}>
          <LuPlus aria-hidden="true" />
          Book appointment
        </Button>
      </Flex>

      {urgentOpen.map((a) => {
        const patient = getPatient(a.patient);
        const vet = getVet(a.vet);
        return (
          <Flex
            key={a.id}
            role="group"
            aria-label="Urgent visit"
            bg="orange.subtle"
            borderWidth="2px"
            borderColor="orange.solid"
            rounded="lg"
            p="4"
            gap="3"
            align={{ base: "stretch", md: "center" }}
            direction={{ base: "column", md: "row" }}
            justify="space-between"
          >
            <HStack gap="3" align="flex-start" color="orange.fg">
              <Box mt="1">
                <LuZap size={22} aria-hidden="true" />
              </Box>
              <Box>
                <Text fontWeight="bold" fontSize="lg">
                  Urgent: {patient?.name} ({patient ? ownerOf(patient).name : ""})
                </Text>
                <Text>
                  {a.reason} · {fmtTime(a.start)} with {vet?.name}
                  {a.status === "checked_in" ? " · already checked in" : ""}
                </Text>
              </Box>
            </HStack>
            {a.status === "booked" && (
              <Button
                size="lg"
                colorPalette="orange"
                onClick={() => actions.onCheckIn(a)}
                aria-label={`Check in ${patient?.name ?? "patient"} now`}
              >
                <LuLogIn aria-hidden="true" />
                Check in now
              </Button>
            )}
          </Flex>
        );
      })}

      <Grid templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }} gap="3">
        <Stat label="Waiting" value={count("checked_in")} palette="blue" />
        <Stat label="In exam" value={count("in_exam")} palette="purple" />
        <Stat label="Still to arrive" value={count("booked")} palette="gray" />
        <Stat label="Done" value={count("done")} palette="green" />
      </Grid>

      <Grid templateColumns={{ base: "minmax(0, 1fr)", xl: "minmax(0, 1fr) 24rem" }} gap="6" alignItems="start">
        <Box order={{ base: 2, xl: 1 }} minW="0">
          <Flex justify="space-between" align={{ base: "flex-start", md: "center" }} gap="3" mb="3" direction={{ base: "column", md: "row" }}>
            <Heading as="h2" size="lg">
              Appointments
            </Heading>
            <Flex gap="2" flexWrap="wrap" align="center">
              <HStack role="group" aria-label="Filter by vet" gap="2" flexWrap="wrap">
                <FilterButton active={vetFilter === "all"} onClick={() => setVetFilter("all")}>
                  All vets
                </FilterButton>
                {vets.map((v) => (
                  <FilterButton key={v.id} active={vetFilter === v.id} onClick={() => setVetFilter(v.id)}>
                    {v.name.replace("Dr. ", "Dr. ").split(" ").slice(0, 2).join(" ")}
                  </FilterButton>
                ))}
              </HStack>
              <Switch checked={hideFinished} onCheckedChange={(e) => setHideFinished(e.checked)}>
                Hide done and cancelled
              </Switch>
            </Flex>
          </Flex>

          <Box
            hideBelow="md"
            display="grid"
            gridTemplateColumns={ROW_COLUMNS.md}
            gap="4"
            px="4"
            pb="2"
            fontSize="xs"
            fontWeight="semibold"
            color="fg.muted"
            textTransform="uppercase"
            letterSpacing="wider"
            aria-hidden="true"
          >
            <span>Time</span>
            <span>Patient and owner</span>
            <span>Reason and vet</span>
            <span style={{ textAlign: "end" }}>Status</span>
          </Box>

          {visible.length === 0 ? (
            <Box bg="bg.panel" borderWidth="1px" borderColor="border.muted" rounded="lg" p="8" textAlign="center">
              <Text fontWeight="medium">No appointments match these filters.</Text>
            </Box>
          ) : (
            <Stack as="ul" gap="2" listStyleType="none" m="0" p="0">
              {visible.map((a) => (
                <AppointmentRow key={a.id} appt={a} now={now} actions={actions} highlighted={a.id === justBooked} />
              ))}
            </Stack>
          )}
        </Box>

        <Box order={{ base: 1, xl: 2 }} position={{ xl: "sticky" }} top={{ xl: "24" }}>
          <WaitingList waiting={waiting} now={now} actions={actions} />
        </Box>
      </Grid>

      <BookingDialog
        open={bookingOpen}
        onOpenChange={setBookingOpen}
        onBooked={(id) => {
          setJustBooked(id);
          setVetFilter("all");
          setHideFinished(false);
          toaster.create({
            type: "success",
            title: "Appointment booked",
            description: "It now shows on today’s schedule.",
          });
        }}
      />
    </Stack>
  );
}

const ROW_COLUMNS = {
  base: "minmax(0, 1fr)",
  md: "7rem minmax(0, 1.3fr) minmax(0, 1.2fr) 11rem",
};

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
      size="md"
      variant={active ? "solid" : "outline"}
      colorPalette={active ? "teal" : "gray"}
      aria-pressed={active}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}

function Stat({ label, value, palette }: { label: string; value: number; palette: string }) {
  return (
    <Box
      bg="bg.panel"
      borderWidth="1px"
      borderColor="border.muted"
      borderTopWidth="4px"
      borderTopColor={`${palette}.solid`}
      rounded="lg"
      px="4"
      py="3"
    >
      <Text fontSize="sm" color="fg.muted">
        {label}
      </Text>
      <Text fontSize="3xl" fontWeight="bold" lineHeight="1.1" fontVariantNumeric="tabular-nums">
        {value}
      </Text>
    </Box>
  );
}

function AppointmentRow({
  appt,
  now,
  actions,
  highlighted,
}: {
  appt: LiveAppointment;
  now: number;
  actions: Actions;
  highlighted: boolean;
}) {
  const patient = getPatient(appt.patient);
  const vet = getVet(appt.vet);
  if (!patient) return null;
  const owner = ownerOf(patient);
  const meta = STATUS[appt.status];
  const finished = appt.status === "done" || appt.status === "cancelled";
  const waited = appt.checkedInAt !== undefined ? now - appt.checkedInAt : undefined;

  return (
    <Grid
      as="li"
      templateColumns={ROW_COLUMNS}
      gap={{ base: "3", md: "4" }}
      alignItems="center"
      p="4"
      bg={appt.urgent && !finished ? "orange.subtle" : highlighted ? "teal.subtle" : "bg.panel"}
      borderWidth="1px"
      borderColor={highlighted ? "teal.solid" : appt.urgent && !finished ? "orange.solid" : "border.muted"}
      borderStartWidth="6px"
      borderStartColor={appt.urgent && !finished ? "orange.solid" : meta.stripe}
      rounded="lg"
      color={appt.status === "cancelled" ? "fg.muted" : "fg"}
    >
      <Flex direction={{ base: "row", md: "column" }} align={{ base: "baseline", md: "flex-start" }} gap={{ base: "2", md: "0" }}>
        <Text fontSize="lg" fontWeight="semibold" fontVariantNumeric="tabular-nums" lineHeight="1.2">
          {fmtTime(appt.start)}
        </Text>
        <Text fontSize="sm" color="fg.muted">
          {fmtDuration(appt.minutes)}
        </Text>
      </Flex>

      <Box minW="0">
        <HStack gap="2" flexWrap="wrap">
          <Link asChild variant="plain" fontWeight="semibold" fontSize="lg" _hover={{ textDecoration: "underline" }}>
            <NextLink href={`/patients/${patient.id}`}>{patient.name}</NextLink>
          </Link>
          <Text fontSize="sm" color="fg.muted">
            {patient.species} · {patient.breed}
          </Text>
        </HStack>
        <Text fontSize="sm" color="fg.muted">
          {owner.name} · {owner.phone}
        </Text>
        {patient.alerts.length > 0 && (
          <Box mt="2">
            <AlertChips alerts={patient.alerts} />
          </Box>
        )}
      </Box>

      <Box minW="0">
        <HStack gap="2" flexWrap="wrap" align="center">
          {appt.urgent && !finished && (
            <Badge colorPalette="orange" variant="solid" size="md" gap="1">
              <LuZap aria-hidden="true" />
              Urgent
            </Badge>
          )}
          <Text fontWeight="medium" textDecoration={appt.status === "cancelled" ? "line-through" : undefined}>
            {appt.reason}
          </Text>
        </HStack>
        <Text fontSize="sm" color="fg.muted">
          {vet?.name} · {vet?.room}
        </Text>
      </Box>

      <Flex
        direction={{ base: "row", md: "column" }}
        align={{ base: "center", md: "flex-end" }}
        justify={{ base: "space-between", md: "center" }}
        gap="2"
        flexWrap="wrap"
      >
        <Stack gap="1" align={{ base: "flex-start", md: "flex-end" }}>
          <StatusBadge status={appt.status} />
          {appt.status === "checked_in" && waited !== undefined && (
            <Text fontSize="sm" color="fg.muted">
              Waiting {fmtDuration(Math.max(waited, 0))}
            </Text>
          )}
        </Stack>
        {appt.status === "booked" && (
          <Button
            colorPalette="teal"
            size="lg"
            onClick={() => actions.onCheckIn(appt)}
            aria-label={`Check in ${patient.name}`}
          >
            <LuLogIn aria-hidden="true" />
            Check in
          </Button>
        )}
        {appt.status === "checked_in" && (
          <Button variant="outline" size="lg" onClick={() => actions.onStartExam(appt)} aria-label={`Start exam for ${patient.name}`}>
            <LuStethoscope aria-hidden="true" />
            Start exam
          </Button>
        )}
        {appt.status === "in_exam" && (
          <Button variant="outline" size="lg" onClick={() => actions.onFinish(appt)} aria-label={`Mark ${patient.name} done`}>
            <LuCircleCheck aria-hidden="true" />
            Mark done
          </Button>
        )}
      </Flex>
    </Grid>
  );
}

function WaitingList({
  waiting,
  now,
  actions,
}: {
  waiting: LiveAppointment[];
  now: number;
  actions: Actions;
}) {
  return (
    <Box
      as="section"
      aria-labelledby="waiting-heading"
      bg="bg.panel"
      borderWidth="1px"
      borderColor="border.muted"
      rounded="lg"
      p="4"
    >
      <Flex justify="space-between" align="center" mb="3">
        <Heading id="waiting-heading" as="h2" size="lg">
          Waiting room
        </Heading>
        <Badge colorPalette="blue" variant="solid" size="lg">
          {waiting.length}
        </Badge>
      </Flex>

      {waiting.length === 0 ? (
        <Text color="fg.muted" py="4">
          Nobody is waiting. Check in a patient from the schedule when they arrive.
        </Text>
      ) : (
        <Stack as="ul" gap="3" listStyleType="none" m="0" p="0">
          {waiting.map((a, index) => {
            const patient = getPatient(a.patient);
            const vet = getVet(a.vet);
            if (!patient) return null;
            const waited = Math.max(now - (a.checkedInAt ?? now), 0);
            const long = waited >= 20;
            return (
              <Box
                as="li"
                key={a.id}
                borderWidth="1px"
                borderColor={long ? "orange.solid" : "border.muted"}
                bg={long ? "orange.subtle" : "bg.subtle"}
                rounded="md"
                p="3"
              >
                <Flex justify="space-between" gap="3" align="flex-start">
                  <Box minW="0">
                    <Text fontSize="xs" fontWeight="semibold" color="fg.muted" textTransform="uppercase" letterSpacing="wider">
                      {index === 0 ? "Next in line" : `Position ${index + 1}`}
                    </Text>
                    <Link asChild variant="plain" fontWeight="semibold" fontSize="lg" _hover={{ textDecoration: "underline" }}>
                      <NextLink href={`/patients/${patient.id}`}>{patient.name}</NextLink>
                    </Link>
                    <Text fontSize="sm" color="fg.muted">
                      {ownerOf(patient).name} · for {vet?.name}, {vet?.room}
                    </Text>
                  </Box>
                  <Box textAlign="end" flexShrink="0">
                    <HStack gap="1" justify="flex-end" color={long ? "orange.fg" : "fg"}>
                      <LuClock aria-hidden="true" />
                      <Text fontWeight="bold" fontSize="xl" fontVariantNumeric="tabular-nums">
                        {fmtDuration(waited)}
                      </Text>
                    </HStack>
                    <Text fontSize="xs" color="fg.muted">
                      since {a.checkedInAt !== undefined ? fmtMin(a.checkedInAt) : ""}
                    </Text>
                  </Box>
                </Flex>
                {patient.alerts.length > 0 && (
                  <Box mt="2">
                    <AlertChips alerts={patient.alerts} />
                  </Box>
                )}
                <Text fontSize="sm" mt="2">
                  {a.reason} · booked {fmtTime(a.start)}
                </Text>
                <Button
                  mt="3"
                  size="lg"
                  w="full"
                  variant="outline"
                  onClick={() => actions.onStartExam(a)}
                  aria-label={`Start exam for ${patient.name}`}
                >
                  <LuStethoscope aria-hidden="true" />
                  Start exam
                </Button>
              </Box>
            );
          })}
        </Stack>
      )}
    </Box>
  );
}
```

```tsx components/patient-record.tsx
"use client";

import NextLink from "next/link";
import {
  Badge,
  Box,
  Flex,
  Grid,
  Heading,
  HStack,
  Link,
  Stack,
  Text,
  VisuallyHidden,
} from "@chakra-ui/react";
import { Chart, useChart } from "@chakra-ui/charts";
import { CartesianGrid, LabelList, Line, LineChart, Tooltip, XAxis, YAxis } from "recharts";
import {
  LuArrowLeft,
  LuCircleCheck,
  LuClipboardList,
  LuPhone,
  LuPill,
  LuScale,
  LuSyringe,
  LuTriangleAlert,
} from "react-icons/lu";
import { Avatar } from "@/components/ui/avatar";
import { AlertBanner } from "@/components/patient-alerts";
import { StatusBadge } from "@/components/schedule-board";
import { useClinic } from "@/components/clinic-provider";
import {
  TODAY,
  ageLabel,
  fmtDate,
  fmtMonthYear,
  fmtTime,
  fmtUsd,
  getPatient,
  getVet,
  ownerOf,
  records,
  toMin,
  vaccinationStatus,
  type Vaccination,
  type Weight,
} from "@/lib/data";

export function PatientRecord({ patientId }: { patientId: string }) {
  const { appointments } = useClinic();
  const patient = getPatient(patientId);
  if (!patient) return null;
  const owner = ownerOf(patient);
  const record = records[patientId];

  const today = appointments
    .filter((a) => a.patient === patientId && a.status !== "cancelled")
    .sort((a, b) => toMin(a.start) - toMin(b.start));

  const vaccinations = record
    ? [...record.vaccinations].sort((a, b) => a.due.localeCompare(b.due))
    : [];
  const overdue = vaccinations.filter((v) => vaccinationStatus(v.due, TODAY).state === "overdue");

  return (
    <Stack gap="5">
      <Link asChild variant="plain" color="fg.muted" alignSelf="flex-start" _hover={{ color: "fg" }}>
        <NextLink href="/">
          <LuArrowLeft aria-hidden="true" />
          Back to today&rsquo;s schedule
        </NextLink>
      </Link>

      <Box bg="bg.panel" borderWidth="1px" borderColor="border.muted" rounded="lg" p={{ base: "4", md: "6" }}>
        <Flex gap={{ base: "4", md: "6" }} direction={{ base: "column", md: "row" }} align={{ md: "center" }}>
          <HStack gap="4" align="center">
            <Avatar name={patient.name} size="2xl" colorPalette="teal" />
            <Box>
              <Heading as="h1" size={{ base: "3xl", md: "4xl" }}>
                {patient.name}
              </Heading>
              <Text color="fg.muted">
                {patient.species} · {patient.breed}
              </Text>
            </Box>
          </HStack>

          <Grid
            as="dl"
            flex="1"
            templateColumns={{ base: "repeat(2, minmax(0, 1fr))", lg: "repeat(4, minmax(0, 1fr))" }}
            gap="4"
            m="0"
          >
            <Fact label="Sex" value={patient.sex} />
            <Fact label="Age" value={ageLabel(patient.born, TODAY)} sub={`Born ${fmtDate(patient.born)}`} />
            <Fact label="Owner" value={owner.name} />
            <Fact
              label="Owner phone"
              value={
                <Link
                  href={`tel:${owner.phone.replace(/\s/g, "")}`}
                  fontWeight="medium"
                  aria-label={`Call ${owner.name} at ${owner.phone}`}
                >
                  <LuPhone aria-hidden="true" />
                  {owner.phone}
                </Link>
              }
            />
          </Grid>
        </Flex>
      </Box>

      <AlertBanner name={patient.name} alerts={patient.alerts} />

      {overdue.length > 0 && (
        <Flex
          role="group"
          aria-label="Overdue vaccinations"
          align="center"
          gap="3"
          bg="orange.subtle"
          borderWidth="1px"
          borderColor="orange.solid"
          rounded="lg"
          px="4"
          py="3"
          color="orange.fg"
        >
          <LuSyringe aria-hidden="true" size={20} />
          <Text fontWeight="semibold">
            {overdue.length} {overdue.length === 1 ? "vaccination is" : "vaccinations are"} overdue:{" "}
            {overdue.map((v) => v.name).join(", ")}
          </Text>
        </Flex>
      )}

      {today.length > 0 && (
        <Section title="Today at the clinic" icon={<LuClipboardList aria-hidden="true" />}>
          <Stack as="ul" gap="2" listStyleType="none" m="0" p="0">
            {today.map((a) => (
              <Flex
                as="li"
                key={a.id}
                justify="space-between"
                align="center"
                gap="3"
                flexWrap="wrap"
                borderWidth="1px"
                borderColor="border.muted"
                rounded="md"
                px="3"
                py="2.5"
              >
                <Box>
                  <Text fontWeight="semibold">
                    {fmtTime(a.start)} · {a.reason}
                  </Text>
                  <Text fontSize="sm" color="fg.muted">
                    {getVet(a.vet)?.name} · {getVet(a.vet)?.room}
                  </Text>
                </Box>
                <StatusBadge status={a.status} />
              </Flex>
            ))}
          </Stack>
        </Section>
      )}

      {!record ? (
        <Box bg="bg.panel" borderWidth="1px" borderColor="border.muted" rounded="lg" p="8" textAlign="center">
          <Text fontWeight="medium">No weights, vaccinations, medications or visit notes are on file for {patient.name} yet.</Text>
        </Box>
      ) : (
        <Grid templateColumns={{ base: "minmax(0, 1fr)", lg: "minmax(0, 1fr) 26rem" }} gap="5" alignItems="start">
          <Stack gap="5" order={{ base: 2, lg: 1 }} minW="0">
            <Section title="Weight trend" icon={<LuScale aria-hidden="true" />}>
              <WeightTrend weights={record.weights_kg} />
            </Section>

            <Section title="Visit history" icon={<LuClipboardList aria-hidden="true" />}>
              <Stack as="ul" gap="3" listStyleType="none" m="0" p="0">
                {record.visits.map((v) => (
                  <Box
                    as="li"
                    key={v.date + v.reason}
                    borderWidth="1px"
                    borderColor="border.muted"
                    rounded="md"
                    p="4"
                  >
                    <Flex justify="space-between" gap="3" flexWrap="wrap" align="baseline">
                      <HStack gap="2" flexWrap="wrap">
                        <Text fontWeight="semibold" fontSize="lg">
                          {fmtDate(v.date)}
                        </Text>
                        {v.date === TODAY && (
                          <Badge colorPalette="teal" variant="solid">
                            Today
                          </Badge>
                        )}
                      </HStack>
                      <Text color="fg.muted" fontVariantNumeric="tabular-nums">
                        Invoice {fmtUsd(v.invoice_usd)}
                      </Text>
                    </Flex>
                    <Text fontWeight="medium">{v.reason}</Text>
                    <Text fontSize="sm" color="fg.muted" mb="2">
                      {getVet(v.vet)?.name}
                    </Text>
                    <Text>{v.notes}</Text>
                  </Box>
                ))}
              </Stack>
            </Section>
          </Stack>

          <Stack gap="5" order={{ base: 1, lg: 2 }} minW="0">
            <Section title="Vaccinations" icon={<LuSyringe aria-hidden="true" />}>
              <Stack as="ul" gap="2" listStyleType="none" m="0" p="0">
                {vaccinations.map((v) => (
                  <VaccinationRow key={v.name} vaccination={v} />
                ))}
              </Stack>
            </Section>

            <Section title="Current medications" icon={<LuPill aria-hidden="true" />}>
              <Stack as="ul" gap="2" listStyleType="none" m="0" p="0">
                {record.medications.map((m) => (
                  <Box as="li" key={m.name} borderWidth="1px" borderColor="border.muted" rounded="md" px="3" py="2.5">
                    <Text fontWeight="semibold">{m.name}</Text>
                    <Text>{m.dose}</Text>
                    <Text fontSize="sm" color="fg.muted">
                      Since {fmtDate(m.since)}
                    </Text>
                  </Box>
                ))}
              </Stack>
            </Section>
          </Stack>
        </Grid>
      )}
    </Stack>
  );
}

function Fact({ label, value, sub }: { label: string; value: React.ReactNode; sub?: string }) {
  return (
    <Box>
      <Text as="dt" fontSize="xs" color="fg.muted" textTransform="uppercase" letterSpacing="wider">
        {label}
      </Text>
      <Text as="dd" m="0" fontWeight="medium" fontSize="md">
        {value}
      </Text>
      {sub && (
        <Text as="dd" m="0" fontSize="sm" color="fg.muted">
          {sub}
        </Text>
      )}
    </Box>
  );
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Box as="section" bg="bg.panel" borderWidth="1px" borderColor="border.muted" rounded="lg" p={{ base: "4", md: "5" }}>
      <HStack gap="2" mb="4" color="fg">
        <Box color="teal.fg">{icon}</Box>
        <Heading as="h2" size="lg">
          {title}
        </Heading>
      </HStack>
      {children}
    </Box>
  );
}

function VaccinationRow({ vaccination }: { vaccination: Vaccination }) {
  const status = vaccinationStatus(vaccination.due, TODAY);
  const overdue = status.state === "overdue";
  const soon = status.state === "soon";
  return (
    <Flex
      as="li"
      justify="space-between"
      align="center"
      gap="3"
      flexWrap="wrap"
      bg={overdue ? "red.subtle" : "transparent"}
      borderWidth={overdue ? "2px" : "1px"}
      borderColor={overdue ? "red.solid" : "border.muted"}
      rounded="md"
      px="3"
      py="2.5"
    >
      <Box>
        <Text fontWeight="semibold" color={overdue ? "red.fg" : "fg"}>
          {vaccination.name}
        </Text>
        <Text fontSize="sm" color="fg.muted">
          Given {fmtDate(vaccination.given)}
        </Text>
        <Text fontSize="sm" color={overdue ? "red.fg" : "fg.muted"} fontWeight={overdue ? "semibold" : undefined}>
          Due {fmtDate(vaccination.due)}
        </Text>
      </Box>
      {overdue ? (
        <Badge colorPalette="red" variant="solid" size="lg" gap="1.5">
          <LuTriangleAlert aria-hidden="true" />
          Overdue {status.days} {status.days === 1 ? "day" : "days"}
        </Badge>
      ) : soon ? (
        <Badge colorPalette="orange" variant="subtle" size="lg">
          Due in {status.days} {status.days === 1 ? "day" : "days"}
        </Badge>
      ) : (
        <Badge colorPalette="green" variant="subtle" size="lg" gap="1.5">
          <LuCircleCheck aria-hidden="true" />
          Up to date
        </Badge>
      )}
    </Flex>
  );
}

function WeightTrend({ weights }: { weights: Weight[] }) {
  const data = weights.map((w) => ({ date: w.date, label: fmtMonthYear(w.date), kg: w.kg }));
  const chart = useChart({
    data,
    series: [{ name: "kg", color: "teal.solid" }],
  });

  const first = weights[0];
  const last = weights[weights.length - 1];
  const prev = weights[weights.length - 2];
  const total = last.kg - first.kg;
  const lastChange = prev ? last.kg - prev.kg : 0;
  const pct = (total / first.kg) * 100;
  const signed = (n: number) => `${n > 0 ? "+" : n < 0 ? "−" : ""}${Math.abs(n).toFixed(1)} kg`;

  return (
    <Stack gap="4">
      <Grid templateColumns="repeat(3, minmax(0, 1fr))" gap="3">
        <Box>
          <Text fontSize="xs" color="fg.muted" textTransform="uppercase" letterSpacing="wider">
            Latest
          </Text>
          <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="bold">
            {last.kg.toFixed(1)} kg
          </Text>
          <Text fontSize="sm" color="fg.muted">
            {fmtDate(last.date)}
          </Text>
        </Box>
        <Box>
          <Text fontSize="xs" color="fg.muted" textTransform="uppercase" letterSpacing="wider">
            Since last visit
          </Text>
          <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="bold">
            {signed(lastChange)}
          </Text>
        </Box>
        <Box>
          <Text fontSize="xs" color="fg.muted" textTransform="uppercase" letterSpacing="wider">
            Since {fmtMonthYear(first.date)}
          </Text>
          <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="bold">
            {signed(total)}
          </Text>
          <Text fontSize="sm" color="fg.muted">
            {pct.toFixed(1).replace("-", "−")}%
          </Text>
        </Box>
      </Grid>

      <Box
        role="img"
        aria-label={`Weight trend line chart across ${weights.length} visits, from ${first.kg} kilograms in ${fmtDate(first.date)} to ${last.kg} kilograms on ${fmtDate(last.date)}.`}
      >
        <Chart.Root height="64" chart={chart}>
          <LineChart data={chart.data} responsive margin={{ top: 20, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid stroke={chart.color("border")} vertical={false} />
            <XAxis
              axisLine={false}
              tickLine={false}
              tickMargin={8}
              dataKey={chart.key("label")}
              stroke={chart.color("border")}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tickMargin={8}
              width={36}
              allowDecimals={false}
              domain={[(min: number) => Math.floor(min) - 1, (max: number) => Math.ceil(max) + 1]}
              stroke={chart.color("border")}
            />
            <Tooltip animationDuration={100} cursor={false} content={<Chart.Tooltip />} />
            <Line
              isAnimationActive={false}
              dataKey={chart.key("kg")}
              stroke={chart.color("teal.solid")}
              strokeWidth={3}
              dot={{ r: 4, fill: chart.color("teal.solid") }}
            >
              <LabelList dataKey={chart.key("kg")} position="top" offset={10} fontSize={12} />
            </Line>
          </LineChart>
        </Chart.Root>
      </Box>

      <VisuallyHidden>
        <ul>
          {weights.map((w) => (
            <li key={w.date}>
              {fmtDate(w.date)}: {w.kg} kg
            </li>
          ))}
        </ul>
      </VisuallyHidden>
    </Stack>
  );
}
```

```tsx app/page.tsx
import { ScheduleBoard } from "@/components/schedule-board";

export default function Page() {
  return <ScheduleBoard />;
}
```

```tsx app/patients/[id]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PatientRecord } from "@/components/patient-record";
import { getPatient, patients } from "@/lib/data";

export function generateStaticParams() {
  return patients.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const patient = getPatient(id);
  return { title: patient ? `${patient.name}'s record` : "Patient not found" };
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!getPatient(id)) notFound();
  return <PatientRecord patientId={id} />;
}
```

```tsx app/layout.tsx
import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";
import { ClinicProvider } from "@/components/clinic-provider";
import { EmotionRegistry } from "@/components/ui/emotion-registry";
import { Provider } from "@/components/ui/provider";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: { default: "Pawpoint", template: "%s · Pawpoint" },
  description: "Front-desk and records software for Hillside Veterinary Clinic",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <EmotionRegistry>
          <Provider>
            <ClinicProvider>
              <AppShell>{children}</AppShell>
            </ClinicProvider>
            <Toaster />
          </Provider>
        </EmotionRegistry>
      </body>
    </html>
  );
}
```
