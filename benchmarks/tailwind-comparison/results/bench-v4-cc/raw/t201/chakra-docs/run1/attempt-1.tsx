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

export interface WeightEntry {
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
  weights_kg: WeightEntry[];
  vaccinations: Vaccination[];
  medications: Medication[];
  visits: Visit[];
}

export const CLINIC = "Pawpoint, front-desk and records software for Hillside Veterinary Clinic";
export const TODAY = "2026-11-12";
export const TODAY_LONG = "Thursday 12 November 2026";

/** The front desk clock when the page opens (9:52 AM), in minutes since midnight. */
export const CLOCK_START = 9 * 60 + 52;

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

export function getPatient(id: string): Patient {
  const p = patients.find((x) => x.id === id);
  if (!p) throw new Error(`Unknown patient ${id}`);
  return p;
}

export function getOwner(id: string): Owner {
  const o = owners.find((x) => x.id === id);
  if (!o) throw new Error(`Unknown owner ${id}`);
  return o;
}

export function getVet(id: string): Vet {
  const v = vets.find((x) => x.id === id);
  if (!v) throw new Error(`Unknown vet ${id}`);
  return v;
}

export function toMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

export function fmtClock(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
}

export function fmtWait(min: number): string {
  if (min < 1) return "just now";
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h} h ${m} min` : `${h} h`;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function fmtDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

export function fmtMonth(iso: string): string {
  const [y, m] = iso.split("-").map(Number);
  return `${MONTHS[m - 1]} ’${String(y).slice(2)}`;
}

export function fmtUsd(n: number): string {
  return `$${n.toFixed(2)}`;
}

export function daysBetween(fromIso: string, toIso: string): number {
  const [fy, fm, fd] = fromIso.split("-").map(Number);
  const [ty, tm, td] = toIso.split("-").map(Number);
  return Math.round((Date.UTC(ty, tm - 1, td) - Date.UTC(fy, fm - 1, fd)) / 86400000);
}

export function ageText(born: string): string {
  const [by, bm, bd] = born.split("-").map(Number);
  const [ty, tm, td] = TODAY.split("-").map(Number);
  let months = (ty - by) * 12 + (tm - bm);
  if (td < bd) months -= 1;
  const y = Math.floor(months / 12);
  const m = months % 12;
  if (y < 1) return `${m} mo`;
  return m ? `${y} yr ${m} mo` : `${y} yr`;
}

export type VaccinationState =
  | { kind: "overdue"; days: number }
  | { kind: "soon"; days: number }
  | { kind: "ok"; days: number };

/** Compares a due date with today's date (TODAY). */
export function vaccinationState(due: string): VaccinationState {
  const days = daysBetween(TODAY, due);
  if (days < 0) return { kind: "overdue", days: -days };
  if (days <= 60) return { kind: "soon", days };
  return { kind: "ok", days };
}

export function searchPatients(query: string): Patient[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return patients
    .filter((p) => p.name.toLowerCase().includes(q) || getOwner(p.owner).name.toLowerCase().includes(q))
    .sort((a, b) => {
      const as = a.name.toLowerCase().startsWith(q) ? 0 : 1;
      const bs = b.name.toLowerCase().startsWith(q) ? 0 : 1;
      return as - bs || a.name.localeCompare(b.name);
    });
}
```

```tsx components/desk-provider.tsx
"use client";

import { useMemo, useSyncExternalStore } from "react";
import { toaster } from "@/components/ui/toaster";
import {
  CLOCK_START,
  fmtClock,
  getPatient,
  getVet,
  initialAppointments,
  toMinutes,
  type Appointment,
  type Status,
} from "@/lib/data";

export interface Slot {
  patient: string;
  vet: string;
  start: number;
  minutes: number;
}

export interface BookInput extends Slot {
  reason: string;
  urgent: boolean;
}

export type BookResult = { ok: true; appointment: Appointment } | { ok: false; error: string };

/** Returns a message when the slot overlaps a live booking for the same vet (or the same patient). */
export function findConflict(list: Appointment[], slot: Slot): string | null {
  const end = slot.start + slot.minutes;
  let patientClash: string | null = null;
  for (const a of list) {
    if (a.status === "cancelled") continue;
    const s = toMinutes(a.start);
    const e = s + a.minutes;
    if (!(slot.start < e && end > s)) continue;
    if (a.vet === slot.vet) {
      return `${getVet(a.vet).name} is already booked ${fmtClock(s)} to ${fmtClock(e)} (${getPatient(a.patient).name}, ${a.reason}).`;
    }
    if (a.patient === slot.patient && !patientClash) {
      patientClash = `${getPatient(a.patient).name} already has an appointment with ${getVet(a.vet).name} at ${fmtClock(s)}.`;
    }
  }
  return patientClash;
}

/*
 * The desk state lives in a small module-level store, so every page shares it
 * (a check-in made on the schedule is still there on a patient record) without
 * needing a provider in the layout.
 */
interface StoreState {
  appointments: Appointment[];
  now: number;
}

let state: StoreState = { appointments: initialAppointments, now: CLOCK_START };
const initialState = state;
const listeners = new Set<() => void>();
let timer: number | null = null;
let t0 = 0;

function emit(next: StoreState) {
  state = next;
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (timer === null && typeof window !== "undefined") {
    if (!t0) t0 = Date.now();
    timer = window.setInterval(() => {
      const now = CLOCK_START + Math.floor((Date.now() - t0) / 60000);
      if (now !== state.now) emit({ ...state, now });
    }, 15000);
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && timer !== null) {
      window.clearInterval(timer);
      timer = null;
    }
  };
}

const getSnapshot = () => state;
const getServerSnapshot = () => initialState;

function checkIn(id: string) {
  const appt = state.appointments.find((a) => a.id === id);
  if (!appt || appt.status !== "booked") return;
  const now = state.now;
  emit({
    ...state,
    appointments: state.appointments.map((a) =>
      a.id === id ? { ...a, status: "checked_in" as const, checkedInAt: now } : a,
    ),
  });
  const patient = getPatient(appt.patient);
  const vet = getVet(appt.vet);
  toaster.create({
    type: "success",
    title: `${patient.name} is checked in`,
    description:
      `Waiting for ${vet.name}, ${vet.room}.` +
      (patient.alerts.length ? ` Alert: ${patient.alerts.join("; ")}.` : ""),
  });
}

function setStatus(id: string, status: Status) {
  const appt = state.appointments.find((a) => a.id === id);
  if (!appt) return;
  emit({ ...state, appointments: state.appointments.map((a) => (a.id === id ? { ...a, status } : a)) });
  const patient = getPatient(appt.patient);
  const vet = getVet(appt.vet);
  if (status === "in_exam") {
    toaster.create({ type: "info", title: `${patient.name} is in ${vet.room}`, description: `With ${vet.name}.` });
  } else if (status === "done") {
    toaster.create({ type: "success", title: `${patient.name}'s visit is done` });
  }
}

function conflictFor(slot: Slot): string | null {
  return findConflict(state.appointments, slot);
}

function book(input: BookInput): BookResult {
  const conflict = findConflict(state.appointments, input);
  if (conflict) return { ok: false, error: conflict };
  const h = String(Math.floor(input.start / 60)).padStart(2, "0");
  const m = String(input.start % 60).padStart(2, "0");
  const appointment: Appointment = {
    id: `a-${String(state.appointments.length + 1).padStart(2, "0")}`,
    patient: input.patient,
    vet: input.vet,
    start: `${h}:${m}`,
    minutes: input.minutes,
    reason: input.reason.trim(),
    status: "booked",
    urgent: input.urgent || undefined,
  };
  emit({ ...state, appointments: [...state.appointments, appointment] });
  toaster.create({
    type: "success",
    title: "Appointment booked",
    description: `${getPatient(input.patient).name} with ${getVet(input.vet).name} at ${fmtClock(input.start)}.`,
  });
  return { ok: true, appointment };
}

export interface Desk {
  appointments: Appointment[];
  /** Front desk clock, minutes since midnight. */
  now: number;
  checkIn: (id: string) => void;
  setStatus: (id: string, status: Status) => void;
  book: (input: BookInput) => BookResult;
  conflictFor: (slot: Slot) => string | null;
}

export function useDesk(): Desk {
  const snap = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return useMemo(
    () => ({ appointments: snap.appointments, now: snap.now, checkIn, setStatus, book, conflictFor }),
    [snap],
  );
}
```

```tsx components/alerts.tsx
import { Badge, Box, Flex, VisuallyHidden } from "@chakra-ui/react";
import type { Status } from "@/lib/data";

export function AlertIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      style={{ flexShrink: 0 }}
    >
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  );
}

/** Medical alerts as solid red pills: used everywhere a patient appears. */
export function AlertPills({ alerts, large = false }: { alerts: string[]; large?: boolean }) {
  if (alerts.length === 0) return null;
  return (
    <Flex as="ul" aria-label="Medical alerts" listStyleType="none" m="0" p="0" gap="1.5" wrap="wrap">
      {alerts.map((alert) => (
        <Flex
          as="li"
          key={alert}
          align="center"
          gap={large ? "2" : "1.5"}
          bg="red.solid"
          color="red.contrast"
          fontWeight="semibold"
          fontSize={large ? "md" : "sm"}
          lineHeight="short"
          px={large ? "3.5" : "2.5"}
          py={large ? "2" : "1"}
          rounded="md"
        >
          <AlertIcon size={large ? 20 : 15} />
          <VisuallyHidden>Medical alert: </VisuallyHidden>
          <Box as="span">{alert}</Box>
        </Flex>
      ))}
    </Flex>
  );
}

const STATUS_META: Record<Status, { label: string; palette: string }> = {
  booked: { label: "Booked", palette: "gray" },
  checked_in: { label: "Checked in", palette: "blue" },
  in_exam: { label: "In exam", palette: "purple" },
  done: { label: "Done", palette: "green" },
  cancelled: { label: "Cancelled", palette: "gray" },
};

export function StatusBadge({ status }: { status: Status }) {
  const meta = STATUS_META[status];
  return (
    <Badge colorPalette={meta.palette} variant={status === "in_exam" ? "solid" : "subtle"} size="md">
      {meta.label}
    </Badge>
  );
}
```

```tsx components/patient-search.tsx
"use client";

import { useId, useMemo, useState, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { Box, Flex, Input, Text } from "@chakra-ui/react";
import { LuSearch } from "react-icons/lu";
import { InputGroup } from "@/components/ui/input-group";
import { AlertPills } from "@/components/alerts";
import { getOwner, searchPatients } from "@/lib/data";

export function PatientSearch() {
  const router = useRouter();
  const listId = useId();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const results = useMemo(() => searchPatients(query), [query]);
  const showPanel = open && query.trim().length > 0;

  const go = (id: string) => {
    router.push(`/patients/${id}`);
    setQuery("");
    setOpen(false);
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
    }
  };

  return (
    <Box
      position="relative"
      role="search"
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOpen(false);
      }}
    >
      <InputGroup startElement={<LuSearch />} w="full">
        <Input
          size="lg"
          type="text"
          role="combobox"
          autoComplete="off"
          placeholder="Find a patient or owner"
          aria-label="Search patients or owners by name"
          aria-expanded={showPanel}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={showPanel && results[active] ? `${listId}-${active}` : undefined}
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
          left="0"
          right="0"
          zIndex="dropdown"
          bg="bg.panel"
          borderWidth="1px"
          rounded="lg"
          shadow="lg"
          maxH="70dvh"
          overflowY="auto"
        >
          {results.length === 0 ? (
            <Text role="status" p="4" color="fg.muted">
              No patient or owner matches &ldquo;{query.trim()}&rdquo;.
            </Text>
          ) : (
            <Box as="ul" id={listId} role="listbox" aria-label="Matching patients" listStyleType="none" m="0" p="1">
              {results.map((p, i) => {
                const owner = getOwner(p.owner);
                return (
                  <Box
                    as="li"
                    key={p.id}
                    id={`${listId}-${i}`}
                    role="option"
                    aria-selected={i === active}
                    cursor="pointer"
                    rounded="md"
                    px="3"
                    py="2.5"
                    bg={i === active ? "bg.muted" : undefined}
                    _hover={{ bg: "bg.muted" }}
                    onMouseDown={(e) => e.preventDefault()}
                    onMouseEnter={() => setActive(i)}
                    onClick={() => go(p.id)}
                  >
                    <Flex justify="space-between" align="flex-start" gap="3" wrap="wrap">
                      <Box minW="0">
                        <Text fontWeight="semibold">
                          {p.name}{" "}
                          <Text as="span" fontWeight="normal" color="fg.muted">
                            {p.species} &middot; {p.breed}
                          </Text>
                        </Text>
                        <Text fontSize="sm" color="fg.muted">
                          Owner {owner.name} &middot; {owner.phone}
                        </Text>
                      </Box>
                      <AlertPills alerts={p.alerts} />
                    </Flex>
                  </Box>
                );
              })}
            </Box>
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
import { Box, Flex, HStack, Text, chakra } from "@chakra-ui/react";
import { Avatar } from "@/components/ui/avatar";
import { ColorModeButton } from "@/components/ui/color-mode";
import { PatientSearch } from "@/components/patient-search";
import { user } from "@/lib/data";

function PawMark() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true" focusable="false">
      <circle cx="5.5" cy="11" r="2" />
      <circle cx="9.5" cy="6.5" r="2" />
      <circle cx="14.5" cy="6.5" r="2" />
      <circle cx="18.5" cy="11" r="2" />
      <path d="M12 12c-3 0-5.5 3-5.5 5.5 0 1.5 1 2.5 2.5 2.5 1 0 1.8-.6 3-.6s2 .6 3 .6c1.5 0 2.5-1 2.5-2.5C17.5 15 15 12 12 12z" />
    </svg>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <Box minH="100dvh" bg="bg.subtle">
      <chakra.a
        href="#main"
        position="absolute"
        left="-9999px"
        top="2"
        zIndex="toast"
        bg="bg.panel"
        px="4"
        py="2"
        rounded="md"
        _focus={{ left: "3" }}
      >
        Skip to content
      </chakra.a>
      <Box as="header" position="sticky" top="0" zIndex="sticky" bg="bg" borderBottomWidth="1px">
        <Flex maxW="1400px" mx="auto" px={{ base: "3", md: "6" }} py="3" gap="3" align="center" wrap="wrap">
          <NextLink href="/" aria-label="Pawpoint home">
            <HStack gap="2.5">
              <Flex boxSize="10" rounded="lg" bg="teal.solid" color="teal.contrast" align="center" justify="center">
                <PawMark />
              </Flex>
              <Box lineHeight="short">
                <Text fontWeight="bold" fontSize="lg">
                  Pawpoint
                </Text>
                <Text fontSize="xs" color="fg.muted" display={{ base: "none", sm: "block" }}>
                  Hillside Veterinary Clinic
                </Text>
              </Box>
            </HStack>
          </NextLink>
          <Box flex={{ base: "1 1 100%", md: "1 1 320px" }} order={{ base: 3, md: 0 }} maxW={{ md: "560px" }} mx={{ md: "auto" }}>
            <PatientSearch />
          </Box>
          <HStack ml="auto" gap="3">
            <ColorModeButton />
            <HStack gap="2.5">
              <Avatar name={user.name} size="sm" colorPalette="teal" />
              <Box display={{ base: "none", md: "block" }} lineHeight="short">
                <Text fontSize="sm" fontWeight="medium">
                  {user.name}
                </Text>
                <Text fontSize="xs" color="fg.muted">
                  {user.role}
                </Text>
              </Box>
            </HStack>
          </HStack>
        </Flex>
      </Box>
      <Box as="main" id="main" maxW="1400px" mx="auto" px={{ base: "3", md: "6" }} py={{ base: "4", md: "6" }}>
        {children}
      </Box>
    </Box>
  );
}
```

```tsx components/booking-dialog.tsx
"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Box, Button, Heading, Input, Stack, Text, chakra } from "@chakra-ui/react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DialogActionTrigger,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { NativeSelectField, NativeSelectRoot } from "@/components/ui/native-select";
import { AlertPills } from "@/components/alerts";
import { useDesk } from "@/components/desk-provider";
import { fmtClock, getOwner, getPatient, patients, vets, type Appointment } from "@/lib/data";

const OPEN_FROM = 8 * 60;
const LAST_START = 16 * 60 + 45;
const CLOSING = 17 * 60 + 30;
const DURATIONS = [15, 20, 30, 45, 60, 90];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultPatientId?: string;
  onBooked?: (appointment: Appointment) => void;
}

export function BookingDialog({ open, onOpenChange, defaultPatientId, onBooked }: Props) {
  return (
    <DialogRoot
      open={open}
      onOpenChange={(e) => onOpenChange(e.open)}
      placement="center"
      scrollBehavior="inside"
      lazyMount
      unmountOnExit
    >
      <DialogContent mx="3">
        <BookingForm
          defaultPatientId={defaultPatientId}
          onDone={(a) => {
            onOpenChange(false);
            onBooked?.(a);
          }}
        />
      </DialogContent>
    </DialogRoot>
  );
}

function BookingForm({ defaultPatientId, onDone }: { defaultPatientId?: string; onDone: (a: Appointment) => void }) {
  const { now, book, conflictFor } = useDesk();
  const [patientId, setPatientId] = useState(defaultPatientId ?? "");
  const [vetId, setVetId] = useState("");
  const [start, setStart] = useState("");
  const [minutes, setMinutes] = useState("20");
  const [reason, setReason] = useState("");
  const [urgent, setUrgent] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sortedPatients = useMemo(() => [...patients].sort((a, b) => a.name.localeCompare(b.name)), []);
  const patient = patientId ? getPatient(patientId) : null;
  const duration = Number(minutes);

  const slotItems = useMemo(() => {
    const items: { value: string; label: string; disabled?: boolean }[] = [];
    for (let m = OPEN_FROM; m <= LAST_START; m += 15) {
      let note = "";
      if (m + 15 <= now) note = " (passed)";
      else if (m + duration > CLOSING) note = " (after closing)";
      else if (vetId && patientId && conflictFor({ patient: patientId, vet: vetId, start: m, minutes: duration })) {
        note = " (unavailable)";
      }
      items.push({ value: String(m), label: `${fmtClock(m)}${note}`, disabled: note !== "" });
    }
    return items;
  }, [now, duration, vetId, patientId, conflictFor]);

  const liveConflict =
    start && vetId && patientId
      ? conflictFor({ patient: patientId, vet: vetId, start: Number(start), minutes: duration })
      : null;
  const message = error ?? liveConflict;

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (!patientId || !vetId || !start || !reason.trim()) return;
    const result = book({ patient: patientId, vet: vetId, start: Number(start), minutes: duration, reason, urgent });
    if (!result.ok) {
      setError(result.error);
      return;
    }
    onDone(result.appointment);
  };

  return (
    <chakra.form display="contents" onSubmit={onSubmit} noValidate>
      <DialogHeader>
        <DialogTitle>Book an appointment</DialogTitle>
      </DialogHeader>
      <DialogBody>
        <Stack gap="4">
          <Field label="Patient" required invalid={submitted && !patientId} errorText="Choose a patient">
            <NativeSelectRoot size="lg">
              <NativeSelectField
                placeholder="Choose a patient"
                value={patientId}
                onChange={(e) => {
                  setPatientId(e.target.value);
                  setError(null);
                }}
                items={sortedPatients.map((p) => ({
                  value: p.id,
                  label: `${p.name} (${p.species}) · ${getOwner(p.owner).name}${p.alerts.length ? " · ALERT" : ""}`,
                }))}
              />
            </NativeSelectRoot>
          </Field>
          {patient && patient.alerts.length > 0 && (
            <Box>
              <AlertPills alerts={patient.alerts} />
            </Box>
          )}
          <Field label="Vet" required invalid={submitted && !vetId} errorText="Choose a vet">
            <NativeSelectRoot size="lg">
              <NativeSelectField
                placeholder="Choose a vet"
                value={vetId}
                onChange={(e) => {
                  setVetId(e.target.value);
                  setError(null);
                }}
                items={vets.map((v) => ({ value: v.id, label: `${v.name} · ${v.room}` }))}
              />
            </NativeSelectRoot>
          </Field>
          <Stack direction={{ base: "column", sm: "row" }} gap="4">
            <Field label="Time" required invalid={submitted && !start} errorText="Choose a time">
              <NativeSelectRoot size="lg">
                <NativeSelectField
                  placeholder="Choose a time"
                  value={start}
                  onChange={(e) => {
                    setStart(e.target.value);
                    setError(null);
                  }}
                  items={slotItems}
                />
              </NativeSelectRoot>
            </Field>
            <Field label="Length">
              <NativeSelectRoot size="lg">
                <NativeSelectField
                  value={minutes}
                  onChange={(e) => {
                    setMinutes(e.target.value);
                    setError(null);
                  }}
                  items={DURATIONS.map((d) => ({ value: String(d), label: `${d} min` }))}
                />
              </NativeSelectRoot>
            </Field>
          </Stack>
          <Field label="Reason for visit" required invalid={submitted && !reason.trim()} errorText="Add a reason">
            <Input size="lg" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="For example: Vaccine booster" />
          </Field>
          <Checkbox checked={urgent} onCheckedChange={(e) => setUrgent(e.checked === true)}>
            Urgent visit
          </Checkbox>
          {message && (
            <Box role="alert" bg="red.subtle" color="red.fg" borderWidth="1px" borderColor="red.muted" rounded="md" p="3">
              <Heading as="h3" size="sm" mb="1">
                That time is not available
              </Heading>
              <Text fontSize="sm">{message} Pick another time or vet.</Text>
            </Box>
          )}
        </Stack>
      </DialogBody>
      <DialogFooter>
        <DialogActionTrigger asChild>
          <Button variant="outline" size="lg">
            Cancel
          </Button>
        </DialogActionTrigger>
        <Button type="submit" colorPalette="teal" size="lg" disabled={!!liveConflict}>
          Book appointment
        </Button>
      </DialogFooter>
      <DialogCloseTrigger />
    </chakra.form>
  );
}
```

```tsx components/schedule.tsx
"use client";

import { useMemo, useState } from "react";
import NextLink from "next/link";
import { Badge, Box, Button, Flex, Grid, Heading, HStack, Link as ChakraLink, Stack, Text } from "@chakra-ui/react";
import { LuClock, LuPhone, LuPlus } from "react-icons/lu";
import { AlertPills, StatusBadge } from "@/components/alerts";
import { BookingDialog } from "@/components/booking-dialog";
import { useDesk } from "@/components/desk-provider";
import {
  TODAY_LONG,
  fmtClock,
  fmtWait,
  getOwner,
  getPatient,
  getVet,
  toMinutes,
  vets,
  type Appointment,
  type Status,
} from "@/lib/data";

const ACCENT: Record<Status, string> = {
  booked: "border.emphasized",
  checked_in: "blue.solid",
  in_exam: "purple.solid",
  done: "green.solid",
  cancelled: "border",
};

function Tile({ label, value, hint, palette }: { label: string; value: number; hint?: string; palette: string }) {
  return (
    <Box bg="bg.panel" borderWidth="1px" rounded="xl" p={{ base: "3", md: "4" }} borderTopWidth="4px" borderTopColor={`${palette}.solid`}>
      <Text fontSize="sm" color="fg.muted">
        {label}
      </Text>
      <Text fontSize="3xl" fontWeight="bold" lineHeight="1.1">
        {value}
      </Text>
      {hint && (
        <Text fontSize="xs" color="fg.muted" mt="0.5">
          {hint}
        </Text>
      )}
    </Box>
  );
}

function AppointmentRow({ appt, highlighted }: { appt: Appointment; highlighted: boolean }) {
  const { checkIn, setStatus } = useDesk();
  const patient = getPatient(appt.patient);
  const owner = getOwner(patient.owner);
  const vet = getVet(appt.vet);
  const start = toMinutes(appt.start);
  const cancelled = appt.status === "cancelled";
  const urgent = appt.urgent && !cancelled;

  return (
    <Box
      as="li"
      bg={urgent ? "orange.subtle" : "bg.panel"}
      borderWidth="1px"
      borderColor={highlighted ? "teal.solid" : "border"}
      borderLeftWidth="6px"
      borderLeftColor={urgent ? "orange.solid" : ACCENT[appt.status]}
      rounded="lg"
      p={{ base: "3", md: "4" }}
      opacity={cancelled || appt.status === "done" ? 0.72 : 1}
    >
      <Grid templateColumns={{ base: "minmax(0,1fr)", md: "88px minmax(0,1.4fr) minmax(0,1fr) 150px" }} gap={{ base: "2", md: "4" }} alignItems="start">
        <Flex direction={{ base: "row", md: "column" }} align={{ base: "baseline", md: "flex-start" }} gap={{ base: "2", md: "0" }}>
          <Text fontWeight="bold" fontSize="lg" lineHeight="short">
            {fmtClock(start)}
          </Text>
          <Text fontSize="sm" color="fg.muted">
            {appt.minutes} min
          </Text>
        </Flex>

        <Box minW="0">
          <ChakraLink
            asChild
            variant="plain"
            fontWeight="semibold"
            fontSize="lg"
            textDecoration={cancelled ? "line-through" : undefined}
            _hover={{ textDecoration: "underline" }}
          >
            <NextLink href={`/patients/${patient.id}`}>{patient.name}</NextLink>
          </ChakraLink>
          <Text as="span" color="fg.muted" fontSize="sm">
            {" "}
            {patient.species} &middot; {patient.breed}
          </Text>
          <HStack gap="1.5" color="fg.muted" fontSize="sm" mt="0.5">
            <LuPhone aria-hidden="true" />
            <Text>
              {owner.name} &middot; {owner.phone}
            </Text>
          </HStack>
          {patient.alerts.length > 0 && (
            <Box mt="2">
              <AlertPills alerts={patient.alerts} />
            </Box>
          )}
        </Box>

        <Box minW="0">
          <Text fontWeight="medium">{appt.reason}</Text>
          <Text fontSize="sm" color="fg.muted">
            {vet.name} &middot; {vet.room}
          </Text>
          {urgent && (
            <Badge colorPalette="orange" variant="solid" size="md" mt="1.5">
              Urgent
            </Badge>
          )}
        </Box>

        <Stack align={{ base: "flex-start", md: "stretch" }} gap="2">
          <Box>
            <StatusBadge status={appt.status} />
          </Box>
          {appt.status === "booked" && (
            <Button colorPalette="teal" size="md" onClick={() => checkIn(appt.id)} aria-label={`Check in ${patient.name}`}>
              Check in
            </Button>
          )}
          {appt.status === "checked_in" && (
            <Button variant="outline" size="md" onClick={() => setStatus(appt.id, "in_exam")} aria-label={`Send ${patient.name} to exam`}>
              Send to exam
            </Button>
          )}
          {appt.status === "in_exam" && (
            <Button variant="outline" size="md" onClick={() => setStatus(appt.id, "done")} aria-label={`Mark ${patient.name}'s visit done`}>
              Mark done
            </Button>
          )}
        </Stack>
      </Grid>
    </Box>
  );
}

function WaitingRoom() {
  const { appointments, now, setStatus } = useDesk();
  const waiting = useMemo(
    () =>
      appointments
        .filter((a) => a.status === "checked_in")
        .sort((a, b) => (a.checkedInAt ?? 0) - (b.checkedInAt ?? 0)),
    [appointments],
  );

  return (
    <Box as="section" aria-labelledby="waiting-title" bg="bg.panel" borderWidth="1px" rounded="xl" p={{ base: "3", md: "4" }}>
      <Flex justify="space-between" align="center" mb="3">
        <Heading as="h2" id="waiting-title" size="lg">
          Waiting room
        </Heading>
        <Badge colorPalette="blue" variant="solid" size="lg">
          {waiting.length}
        </Badge>
      </Flex>
      {waiting.length === 0 ? (
        <Text color="fg.muted">Nobody is waiting. Checked-in patients appear here.</Text>
      ) : (
        <Stack as="ol" listStyleType="none" m="0" p="0" gap="3">
          {waiting.map((a, i) => {
            const patient = getPatient(a.patient);
            const vet = getVet(a.vet);
            const waited = Math.max(0, now - (a.checkedInAt ?? now));
            const long = waited >= 30;
            return (
              <Box as="li" key={a.id} borderWidth="1px" rounded="lg" p="3" bg="bg.subtle">
                <Flex justify="space-between" align="flex-start" gap="3">
                  <Box minW="0">
                    <Text fontWeight="semibold">
                      <Text as="span" color="fg.muted" fontWeight="normal">
                        {i + 1}.{" "}
                      </Text>
                      <ChakraLink asChild variant="plain" _hover={{ textDecoration: "underline" }}>
                        <NextLink href={`/patients/${patient.id}`}>{patient.name}</NextLink>
                      </ChakraLink>
                    </Text>
                    <Text fontSize="sm" color="fg.muted">
                      {a.reason}
                    </Text>
                    <Text fontSize="sm" color="fg.muted">
                      {vet.name} &middot; {vet.room} &middot; booked {fmtClock(toMinutes(a.start))}
                    </Text>
                  </Box>
                  <Box textAlign="right" flexShrink={0}>
                    <HStack gap="1" justify="flex-end" color={long ? "orange.fg" : "fg"} fontWeight="bold">
                      <LuClock aria-hidden="true" />
                      <Text>{fmtWait(waited)}</Text>
                    </HStack>
                    <Text fontSize="xs" color={long ? "orange.fg" : "fg.muted"}>
                      {long ? "Long wait" : "waiting"}
                    </Text>
                  </Box>
                </Flex>
                {patient.alerts.length > 0 && (
                  <Box mt="2">
                    <AlertPills alerts={patient.alerts} />
                  </Box>
                )}
                <Button mt="3" size="md" variant="outline" w="full" onClick={() => setStatus(a.id, "in_exam")} aria-label={`Send ${patient.name} to exam`}>
                  Send to exam
                </Button>
              </Box>
            );
          })}
        </Stack>
      )}
    </Box>
  );
}

export function Schedule() {
  const { appointments, now } = useDesk();
  const [vetFilter, setVetFilter] = useState("all");
  const [bookOpen, setBookOpen] = useState(false);
  const [highlight, setHighlight] = useState<string | null>(null);

  const sorted = useMemo(
    () =>
      [...appointments].sort(
        (a, b) => toMinutes(a.start) - toMinutes(b.start) || a.vet.localeCompare(b.vet),
      ),
    [appointments],
  );
  const visible = vetFilter === "all" ? sorted : sorted.filter((a) => a.vet === vetFilter);

  const count = (s: Status) => appointments.filter((a) => a.status === s).length;
  const waiting = appointments.filter((a) => a.status === "checked_in");
  const longest = waiting.reduce((max, a) => Math.max(max, now - (a.checkedInAt ?? now)), 0);

  return (
    <Stack gap={{ base: "4", md: "5" }}>
      <Flex justify="space-between" align={{ base: "stretch", sm: "center" }} direction={{ base: "column", sm: "row" }} gap="3">
        <Box>
          <Heading as="h1" size="2xl">
            Today&rsquo;s schedule
          </Heading>
          <Text color="fg.muted">
            {TODAY_LONG} &middot; {fmtClock(now)}
          </Text>
        </Box>
        <Button colorPalette="teal" size="xl" onClick={() => setBookOpen(true)}>
          <LuPlus /> Book appointment
        </Button>
      </Flex>

      <Grid templateColumns={{ base: "repeat(2, minmax(0,1fr))", md: "repeat(4, minmax(0,1fr))" }} gap={{ base: "2", md: "4" }}>
        <Tile label="Waiting" value={count("checked_in")} hint={waiting.length ? `Longest ${fmtWait(longest)}` : "Nobody waiting"} palette="blue" />
        <Tile label="In exam" value={count("in_exam")} palette="purple" />
        <Tile label="Still to come" value={count("booked")} hint={`${count("cancelled")} cancelled`} palette="gray" />
        <Tile label="Done" value={count("done")} palette="green" />
      </Grid>

      <Grid
        gap={{ base: "4", md: "5" }}
        templateColumns={{ base: "minmax(0,1fr)", xl: "minmax(0,1fr) 380px" }}
        templateAreas={{ base: '"waiting" "schedule"', xl: '"schedule waiting"' }}
        alignItems="start"
      >
        <Box gridArea="waiting" position={{ xl: "sticky" }} top={{ xl: "96px" }}>
          <WaitingRoom />
        </Box>

        <Box as="section" aria-labelledby="schedule-title" gridArea="schedule" minW="0">
          <Flex justify="space-between" align="center" wrap="wrap" gap="3" mb="3">
            <Heading as="h2" id="schedule-title" size="lg">
              All appointments{" "}
              <Text as="span" color="fg.muted" fontWeight="normal">
                ({visible.length})
              </Text>
            </Heading>
            <Flex role="group" aria-label="Filter by vet" gap="2" wrap="wrap">
              <Button size="md" variant={vetFilter === "all" ? "solid" : "outline"} aria-pressed={vetFilter === "all"} onClick={() => setVetFilter("all")}>
                All vets
              </Button>
              {vets.map((v) => (
                <Button key={v.id} size="md" variant={vetFilter === v.id ? "solid" : "outline"} aria-pressed={vetFilter === v.id} onClick={() => setVetFilter(v.id)}>
                  {`Dr. ${v.name.split(" ").slice(-1)[0]} · ${v.room}`}
                </Button>
              ))}
            </Flex>
          </Flex>
          <Stack as="ol" listStyleType="none" m="0" p="0" gap="2.5">
            {visible.map((a) => (
              <AppointmentRow key={a.id} appt={a} highlighted={a.id === highlight} />
            ))}
          </Stack>
        </Box>
      </Grid>

      <BookingDialog open={bookOpen} onOpenChange={setBookOpen} onBooked={(a) => setHighlight(a.id)} />
    </Stack>
  );
}
```

```tsx components/patient-record.tsx
"use client";

import { useState, type ReactNode } from "react";
import NextLink from "next/link";
import { Badge, Box, Button, Flex, Grid, Heading, HStack, Link as ChakraLink, Stack, Text, VisuallyHidden } from "@chakra-ui/react";
import { Chart, useChart } from "@chakra-ui/charts";
import { CartesianGrid, Line, LineChart, Tooltip, XAxis, YAxis } from "recharts";
import { LuArrowLeft, LuPhone, LuPlus } from "react-icons/lu";
import { Avatar } from "@/components/ui/avatar";
import { AlertIcon, AlertPills, StatusBadge } from "@/components/alerts";
import { BookingDialog } from "@/components/booking-dialog";
import { useDesk } from "@/components/desk-provider";
import {
  TODAY,
  ageText,
  fmtClock,
  fmtDate,
  fmtMonth,
  fmtUsd,
  getOwner,
  getPatient,
  getVet,
  records,
  toMinutes,
  vaccinationState,
  type WeightEntry,
} from "@/lib/data";

function Card({ id, title, aside, area, children }: { id: string; title: string; aside?: ReactNode; area?: string; children: ReactNode }) {
  return (
    <Box as="section" aria-labelledby={id} gridArea={area} bg="bg.panel" borderWidth="1px" rounded="xl" p={{ base: "4", md: "5" }} minW="0">
      <Flex justify="space-between" align="center" gap="3" wrap="wrap" mb="3">
        <Heading as="h2" id={id} size="lg">
          {title}
        </Heading>
        {aside}
      </Flex>
      {children}
    </Box>
  );
}

function WeightChart({ weights }: { weights: WeightEntry[] }) {
  const chart = useChart({
    data: weights.map((w) => ({ label: fmtMonth(w.date), kg: w.kg })),
    series: [{ name: "kg", color: "teal.solid" }],
  });

  return (
    <Chart.Root maxH="300px" aspectRatio={{ base: "4 / 3", md: "16 / 9" }} chart={chart}>
      <LineChart data={chart.data} responsive margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
        <CartesianGrid stroke={chart.color("border")} vertical={false} />
        <XAxis axisLine={false} dataKey={chart.key("label")} stroke={chart.color("border")} />
        <YAxis
          axisLine={false}
          tickLine={false}
          tickMargin={8}
          width={36}
          stroke={chart.color("border")}
          domain={[(min: number) => Math.floor(min - 1), (max: number) => Math.ceil(max + 1)]}
        />
        <Tooltip animationDuration={100} cursor={false} content={<Chart.Tooltip />} />
        {chart.series.map((item) => (
          <Line
            key={item.name}
            isAnimationActive={false}
            dataKey={chart.key(item.name)}
            stroke={chart.color(item.color)}
            strokeWidth={3}
            dot={{ r: 4, strokeWidth: 2 }}
          />
        ))}
      </LineChart>
    </Chart.Root>
  );
}

export function PatientRecord({ patientId }: { patientId: string }) {
  const patient = getPatient(patientId);
  const owner = getOwner(patient.owner);
  const record = records[patientId];
  const { appointments, checkIn } = useDesk();
  const [bookOpen, setBookOpen] = useState(false);

  const todays = appointments
    .filter((a) => a.patient === patientId)
    .sort((a, b) => toMinutes(a.start) - toMinutes(b.start));

  const rank = { overdue: 0, soon: 1, ok: 2 } as const;
  const vaccinations = (record?.vaccinations ?? [])
    .map((v) => ({ ...v, state: vaccinationState(v.due) }))
    .sort((a, b) => rank[a.state.kind] - rank[b.state.kind]);
  const overdue = vaccinations.filter((v) => v.state.kind === "overdue");

  const weights = record?.weights_kg ?? [];
  const first = weights[0];
  const last = weights[weights.length - 1];
  const diff = first && last ? last.kg - first.kg : 0;
  const pct = first && last ? (diff / first.kg) * 100 : 0;

  return (
    <Stack gap={{ base: "4", md: "5" }}>
      <Box>
        <ChakraLink asChild variant="plain" color="fg.muted" _hover={{ color: "fg" }}>
          <NextLink href="/">
            <LuArrowLeft aria-hidden="true" /> Today&rsquo;s schedule
          </NextLink>
        </ChakraLink>
      </Box>

      <Box bg="bg.panel" borderWidth="1px" rounded="xl" p={{ base: "4", md: "6" }}>
        <Flex direction={{ base: "column", md: "row" }} justify="space-between" gap="5">
          <HStack gap="4" align="flex-start">
            <Avatar name={patient.name} size="xl" colorPalette="teal" />
            <Box>
              <Heading as="h1" size="3xl">
                {patient.name}
              </Heading>
              <Text color="fg.muted">
                {patient.species} &middot; {patient.breed}
              </Text>
              <Text fontSize="sm" color="fg.muted">
                Patient {patient.id}
              </Text>
            </Box>
          </HStack>
          <Button colorPalette="teal" size="xl" alignSelf={{ base: "stretch", md: "flex-start" }} onClick={() => setBookOpen(true)}>
            <LuPlus /> Book follow-up
          </Button>
        </Flex>

        <Grid as="dl" templateColumns="repeat(auto-fit, minmax(170px, 1fr))" gap="4" mt="5" pt="5" borderTopWidth="1px">
          {[
            ["Sex", patient.sex],
            ["Born", `${fmtDate(patient.born)} (${ageText(patient.born)})`],
            ["Owner", owner.name],
          ].map(([label, value]) => (
            <Box key={label}>
              <Text as="dt" fontSize="sm" color="fg.muted">
                {label}
              </Text>
              <Text as="dd" fontWeight="medium">
                {value}
              </Text>
            </Box>
          ))}
          <Box>
            <Text as="dt" fontSize="sm" color="fg.muted">
              Owner phone
            </Text>
            <Text as="dd" fontWeight="medium">
              <ChakraLink href={`tel:${owner.phone.replace(/\s/g, "")}`}>
                <LuPhone aria-hidden="true" /> {owner.phone}
              </ChakraLink>
            </Text>
          </Box>
        </Grid>
      </Box>

      {patient.alerts.length > 0 ? (
        <Box role="region" aria-label="Medical alerts" bg="red.subtle" borderWidth="3px" borderColor="red.solid" rounded="xl" p={{ base: "4", md: "5" }}>
          <HStack gap="2" color="red.fg" mb="3">
            <AlertIcon size={26} />
            <Heading as="h2" size="xl">
              Medical alerts
            </Heading>
          </HStack>
          <AlertPills alerts={patient.alerts} large />
        </Box>
      ) : (
        <Text color="fg.muted">No medical alerts on file.</Text>
      )}

      {overdue.length > 0 && (
        <Box role="region" aria-label="Overdue vaccinations" bg="orange.subtle" borderWidth="2px" borderColor="orange.solid" rounded="xl" p="4">
          <Text fontWeight="semibold" color="orange.fg">
            {overdue.length} vaccination{overdue.length > 1 ? "s" : ""} overdue: {overdue.map((v) => v.name).join(", ")}.{" "}
            <ChakraLink href="#vaccinations-title" color="orange.fg" textDecoration="underline">
              See vaccinations
            </ChakraLink>
          </Text>
        </Box>
      )}

      {todays.length > 0 && (
        <Card id="today-title" title="Today at the clinic">
          <Stack as="ul" listStyleType="none" m="0" p="0" gap="2">
            {todays.map((a) => (
              <Flex as="li" key={a.id} justify="space-between" align="center" gap="3" wrap="wrap" borderWidth="1px" rounded="lg" p="3">
                <Box>
                  <Text fontWeight="semibold">
                    {fmtClock(toMinutes(a.start))} &middot; {a.reason}
                  </Text>
                  <Text fontSize="sm" color="fg.muted">
                    {getVet(a.vet).name} &middot; {getVet(a.vet).room}
                  </Text>
                </Box>
                <HStack gap="3">
                  <StatusBadge status={a.status} />
                  {a.status === "booked" && (
                    <Button colorPalette="teal" size="md" onClick={() => checkIn(a.id)} aria-label={`Check in ${patient.name} for ${a.reason}`}>
                      Check in
                    </Button>
                  )}
                </HStack>
              </Flex>
            ))}
          </Stack>
        </Card>
      )}

      <Grid
        gap={{ base: "4", md: "5" }}
        templateColumns={{ base: "minmax(0,1fr)", lg: "minmax(0,1.25fr) minmax(0,1fr)" }}
        templateAreas={{
          base: '"weight" "vacc" "meds" "visits"',
          lg: '"weight vacc" "weight meds" "visits visits"',
        }}
        alignItems="start"
      >
        <Card
          id="weight-title"
          title="Weight trend"
          area="weight"
          aside={
            last && first ? (
              <Box textAlign="right">
                <Text fontSize="2xl" fontWeight="bold" lineHeight="1">
                  {last.kg.toFixed(1)} kg
                </Text>
                <Text fontSize="sm" color="fg.muted">
                  {diff < 0 ? "Down" : "Up"} {Math.abs(diff).toFixed(1)} kg ({Math.abs(pct).toFixed(0)}%) since {fmtDate(first.date)}
                </Text>
              </Box>
            ) : undefined
          }
        >
          {weights.length >= 2 ? (
            <>
              <Box
                role="img"
                aria-label={`Line chart of ${patient.name}'s weight over ${weights.length} visits, from ${first.kg} kg on ${fmtDate(first.date)} to ${last.kg} kg on ${fmtDate(last.date)}.`}
              >
                <WeightChart weights={weights} />
              </Box>
              <VisuallyHidden>
                <table>
                  <caption>Weight at each visit</caption>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Weight (kg)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {weights.map((w) => (
                      <tr key={w.date}>
                        <td>{fmtDate(w.date)}</td>
                        <td>{w.kg}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </VisuallyHidden>
            </>
          ) : (
            <Text color="fg.muted">Not enough weights recorded to draw a trend.</Text>
          )}
        </Card>

        <Card
          id="vaccinations-title"
          title="Vaccinations"
          area="vacc"
          aside={
            overdue.length > 0 ? (
              <Badge colorPalette="red" variant="solid" size="lg">
                {overdue.length} overdue
              </Badge>
            ) : undefined
          }
        >
          {vaccinations.length === 0 ? (
            <Text color="fg.muted">No vaccinations on file.</Text>
          ) : (
            <Stack as="ul" listStyleType="none" m="0" p="0" gap="2">
              {vaccinations.map((v) => {
                const isOverdue = v.state.kind === "overdue";
                return (
                  <Flex
                    as="li"
                    key={v.name}
                    justify="space-between"
                    align="center"
                    gap="3"
                    wrap="wrap"
                    rounded="lg"
                    p="3"
                    borderWidth="1px"
                    borderLeftWidth="6px"
                    borderColor={isOverdue ? "red.solid" : "border"}
                    bg={isOverdue ? "red.subtle" : undefined}
                  >
                    <Box>
                      <Text fontWeight="semibold">{v.name}</Text>
                      <Text fontSize="sm" color="fg.muted">
                        Given {fmtDate(v.given)} &middot; due {fmtDate(v.due)}
                      </Text>
                    </Box>
                    {v.state.kind === "overdue" && (
                      <Badge colorPalette="red" variant="solid" size="md">
                        Overdue {v.state.days} days
                      </Badge>
                    )}
                    {v.state.kind === "soon" && (
                      <Badge colorPalette="orange" variant="subtle" size="md">
                        Due in {v.state.days} days
                      </Badge>
                    )}
                    {v.state.kind === "ok" && (
                      <Badge colorPalette="green" variant="subtle" size="md">
                        Up to date
                      </Badge>
                    )}
                  </Flex>
                );
              })}
            </Stack>
          )}
          <Text fontSize="xs" color="fg.muted" mt="3">
            Checked against today, {fmtDate(TODAY)}.
          </Text>
        </Card>

        <Card id="meds-title" title="Current medications" area="meds">
          {!record || record.medications.length === 0 ? (
            <Text color="fg.muted">No current medications.</Text>
          ) : (
            <Stack as="ul" listStyleType="none" m="0" p="0" gap="2">
              {record.medications.map((m) => (
                <Box as="li" key={m.name} borderWidth="1px" rounded="lg" p="3">
                  <Text fontWeight="semibold">{m.name}</Text>
                  <Text fontSize="sm">{m.dose}</Text>
                  <Text fontSize="sm" color="fg.muted">
                    Since {fmtDate(m.since)}
                  </Text>
                </Box>
              ))}
            </Stack>
          )}
        </Card>

        <Card id="visits-title" title="Visit history" area="visits">
          {!record || record.visits.length === 0 ? (
            <Text color="fg.muted">No past visits on file.</Text>
          ) : (
            <Stack as="ol" listStyleType="none" m="0" p="0" gap="3">
              {record.visits.map((v) => (
                <Box as="li" key={v.date} borderWidth="1px" rounded="lg" p="4">
                  <Flex justify="space-between" align="flex-start" gap="3" wrap="wrap">
                    <Box>
                      <HStack gap="2" wrap="wrap">
                        <Text fontWeight="bold">{fmtDate(v.date)}</Text>
                        {v.date === TODAY && (
                          <Badge colorPalette="teal" size="md">
                            Today
                          </Badge>
                        )}
                      </HStack>
                      <Text fontWeight="medium">{v.reason}</Text>
                      <Text fontSize="sm" color="fg.muted">
                        {getVet(v.vet).name}
                      </Text>
                    </Box>
                    <Text fontSize="sm" color="fg.muted">
                      Invoice {fmtUsd(v.invoice_usd)}
                    </Text>
                  </Flex>
                  <Text mt="2">{v.notes}</Text>
                </Box>
              ))}
            </Stack>
          )}
        </Card>
      </Grid>

      <BookingDialog open={bookOpen} onOpenChange={setBookOpen} defaultPatientId={patientId} />
    </Stack>
  );
}
```

```tsx app/page.tsx
import { AppShell } from "@/components/app-shell";
import { Schedule } from "@/components/schedule";

export default function Page() {
  return (
    <AppShell>
      <Schedule />
    </AppShell>
  );
}
```

```tsx app/patients/p-104/page.tsx
import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";
import { PatientRecord } from "@/components/patient-record";

export const metadata: Metadata = { title: "Olive's record" };

export default function Page() {
  return (
    <AppShell>
      <PatientRecord patientId="p-104" />
    </AppShell>
  );
}
```

```tsx app/patients/[id]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { PatientRecord } from "@/components/patient-record";
import { patients } from "@/lib/data";

export const dynamicParams = false;

export function generateStaticParams() {
  return patients.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const patient = patients.find((p) => p.id === id);
  return { title: patient ? `${patient.name}'s record` : "Patient record" };
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!patients.some((p) => p.id === id)) notFound();
  return (
    <AppShell>
      <PatientRecord patientId={id} />
    </AppShell>
  );
}
```

```tsx app/layout.tsx
import type { Metadata } from "next";
import { EmotionRegistry } from "@/components/ui/emotion-registry";
import { Provider } from "@/components/ui/provider";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: { default: "Pawpoint", template: "%s | Pawpoint" },
  description: "Front-desk and records software for Hillside Veterinary Clinic",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <EmotionRegistry>
          <Provider>
            {children}
            <Toaster />
          </Provider>
        </EmotionRegistry>
      </body>
    </html>
  );
}
```
