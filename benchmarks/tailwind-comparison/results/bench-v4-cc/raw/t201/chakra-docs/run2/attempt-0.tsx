```ts lib/data.ts
export type Status = "booked" | "checked_in" | "in_exam" | "done" | "cancelled"

export interface Vet {
  id: string
  name: string
  room: string
}
export interface Owner {
  id: string
  name: string
  phone: string
}
export interface Patient {
  id: string
  name: string
  species: string
  breed: string
  born: string
  sex: string
  owner: string
  alerts: string[]
}
export interface Appointment {
  id: string
  patient: string
  vet: string
  start: string
  minutes: number
  reason: string
  status: Status
  urgent?: boolean
  /** Clock time (HH:MM) the patient was checked in at the desk. */
  checkedInAt?: string
}
export interface Vaccination {
  name: string
  given: string
  due: string
}
export interface Medication {
  name: string
  dose: string
  since: string
}
export interface Visit {
  date: string
  vet: string
  reason: string
  notes: string
  invoice_usd: number
}
export interface PatientRecordData {
  weights_kg: { date: string; kg: number }[]
  vaccinations: Vaccination[]
  medications: Medication[]
  visits: Visit[]
}

export const CLINIC = {
  product: "Pawpoint",
  name: "Hillside Veterinary Clinic",
  tagline: "Front-desk and records software for Hillside Veterinary Clinic",
}
export const TODAY = "2026-11-12"
export const START_CLOCK = "09:52"
export const USER = { name: "Rosa Lindqvist", role: "Receptionist" }

export const VETS: Vet[] = [
  { id: "v-1", name: "Dr. Amara Osei", room: "Exam 1" },
  { id: "v-2", name: "Dr. Tomás Reyes", room: "Exam 2" },
  { id: "v-3", name: "Dr. Helen Park", room: "Surgery" },
]

export const OWNERS: Owner[] = [
  { id: "o-1", name: "Daniel Kim", phone: "+1 555 0142" },
  { id: "o-2", name: "Priya Natarajan", phone: "+1 555 0178" },
  { id: "o-3", name: "Lucas Moreau", phone: "+1 555 0119" },
  { id: "o-4", name: "Grace Whitfield", phone: "+1 555 0163" },
  { id: "o-5", name: "Sam Oduya", phone: "+1 555 0190" },
  { id: "o-6", name: "Elena Rossi", phone: "+1 555 0105" },
]

export const PATIENTS: Patient[] = [
  { id: "p-101", name: "Biscuit", species: "Dog", breed: "Beagle", born: "2019-04-02", sex: "Male, neutered", owner: "o-1", alerts: [] },
  { id: "p-102", name: "Mochi", species: "Cat", breed: "Domestic shorthair", born: "2021-07-15", sex: "Female, spayed", owner: "o-2", alerts: ["Bites when restrained"] },
  { id: "p-103", name: "Pepper", species: "Dog", breed: "Border collie", born: "2016-01-20", sex: "Female, spayed", owner: "o-3", alerts: [] },
  { id: "p-104", name: "Olive", species: "Dog", breed: "Labrador retriever", born: "2014-09-08", sex: "Female, spayed", owner: "o-4", alerts: ["Penicillin allergy", "Chronic kidney disease, stage 2"] },
  { id: "p-105", name: "Kiwi", species: "Bird", breed: "Budgerigar", born: "2023-03-11", sex: "Male", owner: "o-5", alerts: [] },
  { id: "p-106", name: "Tofu", species: "Rabbit", breed: "Holland lop", born: "2022-05-30", sex: "Female", owner: "o-6", alerts: [] },
  { id: "p-107", name: "Ziggy", species: "Cat", breed: "Maine coon", born: "2018-11-02", sex: "Male, neutered", owner: "o-2", alerts: ["Diabetic: insulin twice daily"] },
  { id: "p-108", name: "Bruno", species: "Dog", breed: "French bulldog", born: "2022-02-14", sex: "Male", owner: "o-5", alerts: ["Brachycephalic: sedation risk"] },
]

export const APPOINTMENTS: Appointment[] = [
  { id: "a-01", patient: "p-101", vet: "v-1", start: "08:30", minutes: 20, reason: "Annual vaccination", status: "done" },
  { id: "a-02", patient: "p-104", vet: "v-2", start: "08:30", minutes: 30, reason: "Kidney panel recheck", status: "done" },
  { id: "a-03", patient: "p-108", vet: "v-3", start: "08:00", minutes: 120, reason: "Soft palate surgery", status: "in_exam" },
  { id: "a-04", patient: "p-102", vet: "v-1", start: "09:00", minutes: 30, reason: "Limping, left hind leg", status: "in_exam" },
  { id: "a-05", patient: "p-107", vet: "v-2", start: "09:15", minutes: 20, reason: "Glucose curve", status: "checked_in", checkedInAt: "09:10" },
  { id: "a-06", patient: "p-105", vet: "v-1", start: "09:45", minutes: 20, reason: "Beak and nail trim", status: "checked_in", checkedInAt: "09:41" },
  { id: "a-07", patient: "p-103", vet: "v-2", start: "10:00", minutes: 30, reason: "Senior wellness exam", status: "booked" },
  { id: "a-08", patient: "p-106", vet: "v-1", start: "10:30", minutes: 20, reason: "Not eating since yesterday", status: "booked", urgent: true },
  { id: "a-09", patient: "p-104", vet: "v-3", start: "11:00", minutes: 45, reason: "Dental cleaning", status: "booked" },
  { id: "a-10", patient: "p-101", vet: "v-2", start: "11:30", minutes: 20, reason: "Ear infection follow-up", status: "booked" },
  { id: "a-11", patient: "p-107", vet: "v-1", start: "13:30", minutes: 30, reason: "Dental check", status: "booked" },
  { id: "a-12", patient: "p-103", vet: "v-3", start: "14:00", minutes: 60, reason: "Lump removal", status: "cancelled" },
  { id: "a-13", patient: "p-102", vet: "v-2", start: "15:00", minutes: 20, reason: "X-ray results", status: "booked" },
]

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
      { date: "2026-11-12", vet: "v-2", reason: "Kidney panel recheck", notes: "Creatinine 2.1 mg/dL (was 2.0). Weight down 0.6 kg. Continue benazepril, recheck in 3 months.", invoice_usd: 186.0 },
      { date: "2026-06-17", vet: "v-2", reason: "Kidney panel recheck", notes: "Stable. Appetite good. Owner reports more drinking in hot weather.", invoice_usd: 172.5 },
      { date: "2026-02-11", vet: "v-1", reason: "Coughing", notes: "Mild kennel cough. Supportive care; no antibiotics given (penicillin allergy).", invoice_usd: 94.0 },
      { date: "2025-11-03", vet: "v-2", reason: "Senior wellness exam", notes: "Grade 2 dental tartar. Dental cleaning recommended.", invoice_usd: 148.0 },
    ],
  },
}

/* ---------- lookups ---------- */

export function findPatient(id: string): Patient | undefined {
  return PATIENTS.find((p) => p.id === id)
}
export function patientById(id: string): Patient {
  const p = findPatient(id)
  if (!p) throw new Error(`Unknown patient ${id}`)
  return p
}
export function ownerById(id: string): Owner {
  const o = OWNERS.find((x) => x.id === id)
  if (!o) throw new Error(`Unknown owner ${id}`)
  return o
}
export function vetById(id: string): Vet {
  const v = VETS.find((x) => x.id === id)
  if (!v) throw new Error(`Unknown vet ${id}`)
  return v
}

/* ---------- time and date helpers (locale independent, so server and client agree) ---------- */

export function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number)
  return h * 60 + m
}
export function fromMinutes(total: number): string {
  const h = Math.floor(total / 60)
  const m = total % 60
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
}
export function formatClock(hhmm: string): string {
  const total = toMinutes(hhmm)
  const h24 = Math.floor(total / 60)
  const m = total % 60
  const suffix = h24 >= 12 ? "PM" : "AM"
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12
  return `${h12}:${String(m).padStart(2, "0")} ${suffix}`
}
export function endTime(a: { start: string; minutes: number }): string {
  return fromMinutes(toMinutes(a.start) + a.minutes)
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
export function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number)
  return `${MONTHS[m - 1]} ${d}, ${y}`
}
export function shortMonthYear(iso: string): string {
  const [y, m] = iso.split("-").map(Number)
  return `${MONTHS[m - 1]} ’${String(y).slice(2)}`
}
export function daysBetween(fromIso: string, toIso: string): number {
  const [fy, fm, fd] = fromIso.split("-").map(Number)
  const [ty, tm, td] = toIso.split("-").map(Number)
  return Math.round((Date.UTC(ty, tm - 1, td) - Date.UTC(fy, fm - 1, fd)) / 86400000)
}
export function ageText(born: string): string {
  const [by, bm, bd] = born.split("-").map(Number)
  const [ty, tm, td] = TODAY.split("-").map(Number)
  let months = (ty - by) * 12 + (tm - bm)
  if (td < bd) months -= 1
  const years = Math.floor(months / 12)
  const rest = months % 12
  if (years < 1) return `${months} mo`
  return rest === 0 ? `${years} yr` : `${years} yr ${rest} mo`
}
export function formatMoney(n: number): string {
  return `$${n.toFixed(2)}`
}

export const STATUS_LABEL: Record<Status, string> = {
  booked: "Booked",
  checked_in: "Checked in",
  in_exam: "In exam",
  done: "Done",
  cancelled: "Cancelled",
}

export type VaccineState = "overdue" | "soon" | "current"
export function vaccineState(due: string): { state: VaccineState; days: number } {
  const days = daysBetween(TODAY, due)
  if (days < 0) return { state: "overdue", days: -days }
  if (days <= 30) return { state: "soon", days }
  return { state: "current", days }
}

/** The non-cancelled booking of this vet that overlaps the proposed slot, if any. */
export function findConflict(
  list: Appointment[],
  vetId: string,
  startMin: number,
  minutes: number,
  ignoreId?: string,
): Appointment | undefined {
  const endMin = startMin + minutes
  return list.find((a) => {
    if (a.id === ignoreId || a.vet !== vetId || a.status === "cancelled") return false
    const s = toMinutes(a.start)
    return startMin < s + a.minutes && s < endMin
  })
}
```

```tsx lib/schedule-context.tsx
"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import {
  APPOINTMENTS,
  START_CLOCK,
  endTime,
  findConflict,
  formatClock,
  fromMinutes,
  patientById,
  toMinutes,
  vetById,
  type Appointment,
  type Status,
} from "@/lib/data"

export interface BookInput {
  patientId: string
  vetId: string
  start: string
  minutes: number
  reason: string
  urgent: boolean
}
export type BookResult = { ok: true; appointment: Appointment } | { ok: false; error: string }

interface ScheduleValue {
  appointments: Appointment[]
  /** Minutes since midnight on the front-desk clock. */
  now: number
  checkIn: (id: string) => void
  setStatus: (id: string, status: Status) => void
  book: (input: BookInput) => BookResult
}

const ScheduleContext = createContext<ScheduleValue | null>(null)

export function ScheduleProvider({ children }: { children: ReactNode }) {
  const [appointments, setAppointments] = useState<Appointment[]>(APPOINTMENTS)
  const [now, setNow] = useState(() => toMinutes(START_CLOCK))

  useEffect(() => {
    const id = window.setInterval(() => setNow((n) => n + 1), 60000)
    return () => window.clearInterval(id)
  }, [])

  const setStatus = useCallback(
    (id: string, status: Status) => {
      setAppointments((list) =>
        list.map((a) =>
          a.id === id
            ? { ...a, status, checkedInAt: status === "checked_in" ? fromMinutes(now) : a.checkedInAt }
            : a,
        ),
      )
    },
    [now],
  )
  const checkIn = useCallback((id: string) => setStatus(id, "checked_in"), [setStatus])

  const book = useCallback(
    (input: BookInput): BookResult => {
      const start = toMinutes(input.start)
      const conflict = findConflict(appointments, input.vetId, start, input.minutes)
      if (conflict) {
        return {
          ok: false,
          error: `${vetById(input.vetId).name} is already booked ${formatClock(conflict.start)} to ${formatClock(endTime(conflict))} with ${patientById(conflict.patient).name}.`,
        }
      }
      const appointment: Appointment = {
        id: `a-${String(appointments.length + 1).padStart(2, "0")}`,
        patient: input.patientId,
        vet: input.vetId,
        start: input.start,
        minutes: input.minutes,
        reason: input.reason.trim(),
        status: "booked",
        urgent: input.urgent || undefined,
      }
      setAppointments((list) => [...list, appointment])
      return { ok: true, appointment }
    },
    [appointments],
  )

  const value = useMemo(
    () => ({ appointments, now, checkIn, setStatus, book }),
    [appointments, now, checkIn, setStatus, book],
  )
  return <ScheduleContext.Provider value={value}>{children}</ScheduleContext.Provider>
}

export function useSchedule(): ScheduleValue {
  const ctx = useContext(ScheduleContext)
  if (!ctx) throw new Error("useSchedule must be used inside ScheduleProvider")
  return ctx
}
```

```tsx components/alert-chips.tsx
"use client"

import { Badge, HStack, VisuallyHidden } from "@chakra-ui/react"
import { LuTriangleAlert } from "react-icons/lu"

/** Medical alerts: solid red, icon plus words, so they never depend on colour alone. */
export function AlertChips({
  alerts,
  size = "sm",
}: {
  alerts: string[]
  size?: "xs" | "sm" | "md" | "lg"
}) {
  if (alerts.length === 0) return null
  return (
    <HStack gap="1.5" wrap="wrap" role="list" aria-label="Medical alerts">
      {alerts.map((alert) => (
        <Badge
          key={alert}
          role="listitem"
          colorPalette="red"
          variant="solid"
          size={size}
          whiteSpace="normal"
          textAlign="start"
          gap="1.5"
        >
          <LuTriangleAlert aria-hidden="true" />
          <VisuallyHidden>Medical alert: </VisuallyHidden>
          {alert}
        </Badge>
      ))}
    </HStack>
  )
}
```

```tsx components/patient-search.tsx
"use client"

import { useMemo, useState } from "react"
import NextLink from "next/link"
import { Badge, Box, HStack, Input, Stack, Text } from "@chakra-ui/react"
import { LuSearch, LuTriangleAlert } from "react-icons/lu"
import { InputGroup } from "@/components/ui/input-group"
import { PATIENTS, ownerById } from "@/lib/data"

export function PatientSearch() {
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return PATIENTS.filter((p) => {
      const o = ownerById(p.owner)
      return [p.name, o.name, p.breed, p.species, o.phone].some((s) => s.toLowerCase().includes(q))
    }).slice(0, 6)
  }, [query])

  const showPanel = open && query.trim().length > 0

  return (
    <Box
      position="relative"
      role="search"
      w="full"
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOpen(false)
      }}
    >
      <InputGroup w="full" startElement={<LuSearch aria-hidden="true" />}>
        <Input
          type="search"
          size="lg"
          placeholder="Find a patient or owner"
          aria-label="Search patients and owners"
          value={query}
          autoComplete="off"
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setQuery("")
              setOpen(false)
            }
          }}
        />
      </InputGroup>
      <Text aria-live="polite" srOnly>
        {showPanel ? `${results.length} ${results.length === 1 ? "match" : "matches"}` : ""}
      </Text>
      {showPanel && (
        <Box
          position="absolute"
          top="100%"
          insetX="0"
          mt="2"
          zIndex="dropdown"
          bg="bg.panel"
          borderWidth="1px"
          rounded="xl"
          shadow="lg"
          maxH="70vh"
          overflowY="auto"
          p="1"
        >
          {results.length === 0 ? (
            <Text p="3" color="fg.muted">
              No patient or owner matches “{query.trim()}”.
            </Text>
          ) : (
            <Box asChild listStyleType="none" m="0" p="0">
              <ul>
                {results.map((p) => {
                  const owner = ownerById(p.owner)
                  return (
                    <li key={p.id}>
                      <Box
                        asChild
                        display="block"
                        p="3"
                        rounded="lg"
                        minH="12"
                        _hover={{ bg: "bg.muted" }}
                        _focusVisible={{ outline: "2px solid", outlineColor: "colorPalette.focusRing" }}
                      >
                        <NextLink
                          href={`/patients/${p.id}`}
                          onClick={() => {
                            setQuery("")
                            setOpen(false)
                          }}
                        >
                          <Stack gap="1">
                            <HStack justify="space-between" gap="3">
                              <Text fontWeight="semibold">{p.name}</Text>
                              {p.alerts.length > 0 && (
                                <Badge colorPalette="red" variant="solid" size="sm">
                                  <LuTriangleAlert aria-hidden="true" />
                                  {p.alerts.length === 1 ? "1 alert" : `${p.alerts.length} alerts`}
                                </Badge>
                              )}
                            </HStack>
                            <Text fontSize="sm" color="fg.muted">
                              {p.species}, {p.breed} · Owner {owner.name}
                            </Text>
                          </Stack>
                        </NextLink>
                      </Box>
                    </li>
                  )
                })}
              </ul>
            </Box>
          )}
        </Box>
      )}
    </Box>
  )
}
```

```tsx components/app-shell.tsx
"use client"

import type { ReactNode } from "react"
import NextLink from "next/link"
import { Box, Flex, HStack, Icon, Stack, Text } from "@chakra-ui/react"
import { LuPawPrint } from "react-icons/lu"
import { Avatar } from "@/components/ui/avatar"
import { ColorModeButton } from "@/components/ui/color-mode"
import { PatientSearch } from "@/components/patient-search"
import { CLINIC, USER } from "@/lib/data"

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <Box minH="100dvh" bg="bg.muted">
      <Box
        asChild
        position="absolute"
        left="-9999px"
        _focus={{ left: "4", top: "4", zIndex: "toast", bg: "bg.panel", p: "3", rounded: "md", shadow: "lg" }}
      >
        <a href="#main">Skip to content</a>
      </Box>
      <Box asChild position="sticky" top="0" zIndex="sticky" bg="bg.panel" borderBottomWidth="1px">
        <header>
          <Flex maxW="1440px" mx="auto" px={{ base: "4", md: "6" }} py="3" gap="3" align="center" wrap="wrap">
            <Box asChild order="1" rounded="md">
              <NextLink href="/" aria-label={`${CLINIC.product}, today's schedule`}>
                <HStack gap="3">
                  <Flex boxSize="10" rounded="lg" bg="teal.solid" color="teal.contrast" align="center" justify="center">
                    <Icon boxSize="5">
                      <LuPawPrint aria-hidden="true" />
                    </Icon>
                  </Flex>
                  <Stack gap="0">
                    <Text fontWeight="bold" fontSize="lg" lineHeight="1.1">
                      {CLINIC.product}
                    </Text>
                    <Text fontSize="xs" color="fg.muted" display={{ base: "none", sm: "block" }}>
                      {CLINIC.name}
                    </Text>
                  </Stack>
                </HStack>
              </NextLink>
            </Box>
            <Box order={{ base: "3", md: "2" }} flex={{ base: "1 1 100%", md: "1 1 0" }} maxW={{ md: "560px" }} mx={{ md: "auto" }}>
              <PatientSearch />
            </Box>
            <HStack order={{ base: "2", md: "3" }} ml="auto" gap="3">
              <Stack gap="0" textAlign="end" display={{ base: "none", sm: "flex" }}>
                <Text fontSize="sm" fontWeight="semibold">
                  {USER.name}
                </Text>
                <Text fontSize="xs" color="fg.muted">
                  {USER.role}
                </Text>
              </Stack>
              <Avatar name={USER.name} size="sm" colorPalette="teal" />
              <ColorModeButton />
            </HStack>
          </Flex>
        </header>
      </Box>
      <Box asChild maxW="1440px" mx="auto" px={{ base: "4", md: "6" }} py={{ base: "5", md: "8" }} display="block">
        <main id="main" tabIndex={-1}>
          {children}
        </main>
      </Box>
    </Box>
  )
}
```

```tsx components/book-appointment.tsx
"use client"

import { useState, type FormEvent } from "react"
import { Button, HStack, Input, Stack, Text } from "@chakra-ui/react"
import { LuCalendarPlus } from "react-icons/lu"
import { AlertChips } from "@/components/alert-chips"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DialogActionTrigger,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Field } from "@/components/ui/field"
import { NativeSelectField, NativeSelectRoot } from "@/components/ui/native-select"
import { toaster } from "@/components/ui/toaster"
import { useSchedule } from "@/lib/schedule-context"
import {
  PATIENTS,
  VETS,
  endTime,
  findConflict,
  formatClock,
  fromMinutes,
  ownerById,
  patientById,
  toMinutes,
  vetById,
} from "@/lib/data"

const DAY_END = 18 * 60
const SLOTS: string[] = Array.from({ length: 40 }, (_, i) => fromMinutes(8 * 60 + i * 15))
const DURATIONS = [15, 20, 30, 45, 60, 90, 120]
const SORTED_PATIENTS = [...PATIENTS].sort((a, b) => a.name.localeCompare(b.name))

export function BookAppointmentButton({
  patientId,
  label = "Book appointment",
  variant = "solid",
}: {
  patientId?: string
  label?: string
  variant?: "solid" | "outline"
}) {
  const { appointments, now, book } = useSchedule()
  const [open, setOpen] = useState(false)
  const [pid, setPid] = useState(patientId ?? "")
  const [vetId, setVetId] = useState(VETS[0].id)
  const [time, setTime] = useState("")
  const [minutes, setMinutes] = useState("20")
  const [reason, setReason] = useState("")
  const [urgent, setUrgent] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const dur = Number(minutes)

  function slotProblem(slot: string): string | null {
    const start = toMinutes(slot)
    if (start < now) return "passed"
    if (start + dur > DAY_END) return "too late"
    if (findConflict(appointments, vetId, start, dur)) return "booked"
    return null
  }

  function timeError(): string | null {
    if (!time) return submitted ? "Choose a time." : null
    const start = toMinutes(time)
    if (start < now) return "That time has already passed."
    if (start + dur > DAY_END) return "The clinic closes at 6:00 PM; shorten the visit or pick an earlier time."
    const c = findConflict(appointments, vetId, start, dur)
    if (c) {
      return `${vetById(vetId).name} is already booked ${formatClock(c.start)} to ${formatClock(endTime(c))} with ${patientById(c.patient).name}. Pick another time or vet.`
    }
    return null
  }

  const tErr = timeError()
  const patient = pid ? patientById(pid) : undefined

  function handleOpenChange(next: boolean) {
    if (next) {
      setPid(patientId ?? "")
      setVetId(VETS[0].id)
      setTime("")
      setMinutes("20")
      setReason("")
      setUrgent(false)
      setSubmitted(false)
    }
    setOpen(next)
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitted(true)
    if (!pid || !time || !reason.trim() || tErr) return
    const res = book({ patientId: pid, vetId, start: time, minutes: dur, reason, urgent })
    if (!res.ok) {
      toaster.create({ title: "Could not book", description: res.error, type: "error" })
      return
    }
    toaster.create({
      title: "Appointment booked",
      description: `${patientById(pid).name} with ${vetById(vetId).name} at ${formatClock(time)}.`,
      type: "success",
    })
    setOpen(false)
  }

  return (
    <DialogRoot
      open={open}
      onOpenChange={(e) => handleOpenChange(e.open)}
      placement="center"
      scrollBehavior="inside"
      size={{ base: "full", md: "md" }}
    >
      <DialogTrigger asChild>
        <Button size="lg" colorPalette="teal" variant={variant}>
          <LuCalendarPlus aria-hidden="true" />
          {label}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Book an appointment</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <form id="book-form" onSubmit={onSubmit} noValidate>
            <Stack gap="4">
              <Field label="Patient" required invalid={submitted && !pid} errorText="Choose a patient.">
                <NativeSelectRoot size="lg">
                  <NativeSelectField value={pid} onChange={(e) => setPid(e.target.value)}>
                    <option value="">Choose a patient</option>
                    {SORTED_PATIENTS.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.species}), owner {ownerById(p.owner).name}
                        {p.alerts.length > 0 ? " - MEDICAL ALERT" : ""}
                      </option>
                    ))}
                  </NativeSelectField>
                </NativeSelectRoot>
              </Field>
              {patient && patient.alerts.length > 0 && <AlertChips alerts={patient.alerts} />}

              <Field label="Vet" required>
                <NativeSelectRoot size="lg">
                  <NativeSelectField value={vetId} onChange={(e) => setVetId(e.target.value)}>
                    {VETS.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name} ({v.room})
                      </option>
                    ))}
                  </NativeSelectField>
                </NativeSelectRoot>
              </Field>

              <HStack gap="3" align="start">
                <Field label="Length" required flex="1">
                  <NativeSelectRoot size="lg">
                    <NativeSelectField value={minutes} onChange={(e) => setMinutes(e.target.value)}>
                      {DURATIONS.map((d) => (
                        <option key={d} value={d}>
                          {d} min
                        </option>
                      ))}
                    </NativeSelectField>
                  </NativeSelectRoot>
                </Field>
                <Field label="Time" required invalid={!!tErr} errorText={tErr} flex="1.3">
                  <NativeSelectRoot size="lg">
                    <NativeSelectField value={time} onChange={(e) => setTime(e.target.value)}>
                      <option value="">Choose a time</option>
                      {SLOTS.map((s) => {
                        const problem = slotProblem(s)
                        return (
                          <option key={s} value={s} disabled={problem !== null}>
                            {formatClock(s)}
                            {problem ? ` (${problem})` : ""}
                          </option>
                        )
                      })}
                    </NativeSelectField>
                  </NativeSelectRoot>
                </Field>
              </HStack>

              <Field
                label="Reason"
                required
                invalid={submitted && !reason.trim()}
                errorText="Add a reason for the visit."
              >
                <Input
                  size="lg"
                  value={reason}
                  placeholder="e.g. Vaccine booster"
                  onChange={(e) => setReason(e.target.value)}
                />
              </Field>

              <Checkbox checked={urgent} onCheckedChange={(e) => setUrgent(e.checked === true)}>
                Urgent visit
              </Checkbox>
              <Text fontSize="sm" color="fg.muted">
                Times already taken for this vet are greyed out, so a booking cannot clash.
              </Text>
            </Stack>
          </form>
        </DialogBody>
        <DialogFooter>
          <DialogActionTrigger asChild>
            <Button variant="outline" size="lg">
              Cancel
            </Button>
          </DialogActionTrigger>
          <Button type="submit" form="book-form" size="lg" colorPalette="teal" disabled={!!tErr && !!time}>
            Book appointment
          </Button>
        </DialogFooter>
        <DialogCloseTrigger />
      </DialogContent>
    </DialogRoot>
  )
}
```

```tsx components/schedule-view.tsx
"use client"

import { useMemo, useState } from "react"
import NextLink from "next/link"
import { Badge, Box, Button, Flex, Grid, Heading, HStack, Link, SimpleGrid, Stack, Text } from "@chakra-ui/react"
import { LuCircleCheck, LuClock, LuPlay, LuSiren, LuUserCheck } from "react-icons/lu"
import { AlertChips } from "@/components/alert-chips"
import { BookAppointmentButton } from "@/components/book-appointment"
import { useSchedule } from "@/lib/schedule-context"
import {
  STATUS_LABEL,
  TODAY,
  VETS,
  endTime,
  fromMinutes,
  formatClock,
  formatDate,
  ownerById,
  patientById,
  toMinutes,
  vetById,
  type Appointment,
  type Status,
} from "@/lib/data"

const STATUS_PALETTE: Record<Status, string> = {
  booked: "gray",
  checked_in: "orange",
  in_exam: "blue",
  done: "green",
  cancelled: "gray",
}

function StatusBadge({ status }: { status: Status }) {
  return (
    <Badge colorPalette={STATUS_PALETTE[status]} variant={status === "cancelled" ? "outline" : "subtle"} size="md">
      {STATUS_LABEL[status]}
    </Badge>
  )
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <Box bg="bg.panel" borderWidth="1px" rounded="xl" p="4">
      <Text fontSize="sm" color="fg.muted">
        {label}
      </Text>
      <Text fontSize="3xl" fontWeight="bold" lineHeight="1.2" fontVariantNumeric="tabular-nums">
        {value}
      </Text>
      {hint && (
        <Text fontSize="sm" color="fg.muted" truncate>
          {hint}
        </Text>
      )}
    </Box>
  )
}

function WaitingPanel() {
  const { appointments, now, setStatus } = useSchedule()
  const waiting = appointments
    .filter((a) => a.status === "checked_in")
    .sort((a, b) => toMinutes(a.checkedInAt ?? a.start) - toMinutes(b.checkedInAt ?? b.start))

  return (
    <Box bg="bg.panel" borderWidth="1px" rounded="xl" p="4" aria-labelledby="waiting-title" asChild>
      <section>
        <HStack justify="space-between" mb="3">
          <Heading id="waiting-title" size="md">
            Waiting room
          </Heading>
          <Badge colorPalette="orange" variant="solid" size="md">
            {waiting.length}
          </Badge>
        </HStack>
        <Box aria-live="polite">
          {waiting.length === 0 ? (
            <Text color="fg.muted" py="4">
              Nobody is waiting. Checked-in patients appear here with how long they have waited.
            </Text>
          ) : (
            <Box asChild listStyleType="none" m="0" p="0">
              <ol>
                {waiting.map((a, i) => {
                  const p = patientById(a.patient)
                  const v = vetById(a.vet)
                  const mins = Math.max(0, now - toMinutes(a.checkedInAt ?? a.start))
                  const long = mins >= 30
                  return (
                    <li key={a.id}>
                      <Stack gap="2" py="3" borderTopWidth={i === 0 ? "0" : "1px"}>
                        <HStack justify="space-between" align="start" gap="3">
                          <Box minW="0">
                            <Text fontWeight="semibold" fontSize="lg">
                              {i + 1}. {p.name}
                            </Text>
                            <Text fontSize="sm" color="fg.muted">
                              {a.reason} · {v.name}, {v.room}
                            </Text>
                          </Box>
                          <Stack gap="0" textAlign="end" flexShrink="0">
                            <Text
                              fontWeight="bold"
                              fontSize="xl"
                              color={long ? "orange.fg" : "fg"}
                              fontVariantNumeric="tabular-nums"
                            >
                              {mins} min
                            </Text>
                            <Text fontSize="xs" color="fg.muted">
                              since {formatClock(a.checkedInAt ?? a.start)}
                            </Text>
                          </Stack>
                        </HStack>
                        <AlertChips alerts={p.alerts} />
                        <Box>
                          <Button
                            size="sm"
                            minH="10"
                            variant="outline"
                            colorPalette="blue"
                            aria-label={`Start exam for ${p.name}`}
                            onClick={() => setStatus(a.id, "in_exam")}
                          >
                            <LuPlay aria-hidden="true" />
                            Start exam
                          </Button>
                        </Box>
                      </Stack>
                    </li>
                  )
                })}
              </ol>
            </Box>
          )}
        </Box>
      </section>
    </Box>
  )
}

function AppointmentRow({ appt }: { appt: Appointment }) {
  const { checkIn, setStatus } = useSchedule()
  const patient = patientById(appt.patient)
  const owner = ownerById(patient.owner)
  const vet = vetById(appt.vet)
  const finished = appt.status === "done" || appt.status === "cancelled"
  const urgent = appt.urgent && !finished

  return (
    <li>
      <Grid
        templateColumns={{ base: "1fr", md: "104px minmax(0,1.5fr) minmax(0,1.2fr) 150px" }}
        gap={{ base: "2", md: "4" }}
        alignItems="center"
        p="4"
        rounded="xl"
        borderWidth="1px"
        borderStartWidth="6px"
        borderColor={urgent ? "red.muted" : "border"}
        borderStartColor={urgent ? "red.solid" : appt.status === "in_exam" ? "blue.solid" : appt.status === "checked_in" ? "orange.solid" : "border"}
        bg={urgent ? "red.subtle" : finished ? "bg.muted" : "bg.panel"}
      >
        <Box>
          <Text
            fontWeight="bold"
            fontSize="xl"
            fontVariantNumeric="tabular-nums"
            textDecoration={appt.status === "cancelled" ? "line-through" : "none"}
          >
            {formatClock(appt.start)}
          </Text>
          <Text fontSize="sm" color="fg.muted">
            {appt.minutes} min, to {formatClock(endTime(appt))}
          </Text>
        </Box>

        <Stack gap="1.5" minW="0">
          <Link asChild fontWeight="semibold" fontSize="lg" width="fit-content">
            <NextLink href={`/patients/${patient.id}`}>{patient.name}</NextLink>
          </Link>
          <Text fontSize="sm" color="fg.muted">
            {patient.species}, {patient.breed} · Owner {owner.name}
          </Text>
          <AlertChips alerts={patient.alerts} />
        </Stack>

        <Stack gap="1.5" minW="0">
          {urgent && (
            <Badge colorPalette="red" variant="solid" size="md" width="fit-content">
              <LuSiren aria-hidden="true" />
              Urgent
            </Badge>
          )}
          <Text fontWeight="medium">{appt.reason}</Text>
          <Text fontSize="sm" color="fg.muted">
            {vet.name} · {vet.room}
          </Text>
        </Stack>

        <Flex direction={{ base: "row", md: "column" }} align={{ base: "center", md: "stretch" }} justify="space-between" gap="2">
          <StatusBadge status={appt.status} />
          {appt.status === "booked" && (
            <Button
              colorPalette="teal"
              minH="11"
              aria-label={`Check in ${patient.name}`}
              onClick={() => checkIn(appt.id)}
            >
              <LuUserCheck aria-hidden="true" />
              Check in
            </Button>
          )}
          {appt.status === "checked_in" && (
            <Button
              variant="outline"
              colorPalette="blue"
              minH="11"
              aria-label={`Start exam for ${patient.name}`}
              onClick={() => setStatus(appt.id, "in_exam")}
            >
              <LuPlay aria-hidden="true" />
              Start exam
            </Button>
          )}
          {appt.status === "in_exam" && (
            <Button
              variant="outline"
              colorPalette="green"
              minH="11"
              aria-label={`Mark ${patient.name} done`}
              onClick={() => setStatus(appt.id, "done")}
            >
              <LuCircleCheck aria-hidden="true" />
              Mark done
            </Button>
          )}
        </Flex>
      </Grid>
    </li>
  )
}

export function ScheduleView() {
  const { appointments, now } = useSchedule()
  const [vetFilter, setVetFilter] = useState("all")

  const sorted = useMemo(
    () =>
      [...appointments].sort(
        (a, b) => toMinutes(a.start) - toMinutes(b.start) || a.vet.localeCompare(b.vet),
      ),
    [appointments],
  )
  const visible = vetFilter === "all" ? sorted : sorted.filter((a) => a.vet === vetFilter)

  const count = (s: Status) => appointments.filter((a) => a.status === s).length
  const next = sorted.find((a) => a.status === "booked" && toMinutes(a.start) >= now - 15)

  return (
    <Stack gap="6">
      <Flex justify="space-between" align={{ base: "start", md: "center" }} direction={{ base: "column", md: "row" }} gap="4">
        <Box>
          <Heading asChild size="2xl">
            <h1>Today’s schedule</h1>
          </Heading>
          <HStack color="fg.muted" mt="1" gap="2">
            <LuClock aria-hidden="true" />
            <Text>
              Thursday, {formatDate(TODAY)} · now {formatClock(fromMinutes(now))}
            </Text>
          </HStack>
        </Box>
        <BookAppointmentButton />
      </Flex>

      <SimpleGrid columns={{ base: 2, md: 4 }} gap="3">
        <Stat label="Waiting" value={String(count("checked_in"))} hint="checked in" />
        <Stat label="In exam" value={String(count("in_exam"))} hint="with a vet now" />
        <Stat label="Still to come" value={String(count("booked"))} hint="booked, not arrived" />
        <Stat
          label="Next booked"
          value={next ? formatClock(next.start) : "None"}
          hint={next ? `${patientById(next.patient).name}, ${vetById(next.vet).name}` : "Nothing else today"}
        />
      </SimpleGrid>

      <Grid templateColumns={{ base: "1fr", lg: "360px minmax(0,1fr)" }} gap="6" alignItems="start">
        <Box position={{ lg: "sticky" }} top={{ lg: "112px" }}>
          <WaitingPanel />
        </Box>

        <Stack gap="4" asChild>
          <section aria-labelledby="sched-title">
            <Flex justify="space-between" align={{ base: "start", sm: "center" }} direction={{ base: "column", sm: "row" }} gap="3">
              <Heading id="sched-title" size="lg">
                All appointments
              </Heading>
              <HStack gap="2" wrap="wrap" role="group" aria-label="Filter by vet">
                <Button
                  size="sm"
                  minH="10"
                  variant={vetFilter === "all" ? "solid" : "outline"}
                  colorPalette="teal"
                  aria-pressed={vetFilter === "all"}
                  onClick={() => setVetFilter("all")}
                >
                  All vets
                </Button>
                {VETS.map((v) => (
                  <Button
                    key={v.id}
                    size="sm"
                    minH="10"
                    variant={vetFilter === v.id ? "solid" : "outline"}
                    colorPalette="teal"
                    aria-pressed={vetFilter === v.id}
                    onClick={() => setVetFilter(v.id)}
                  >
                    {v.name.replace("Dr. ", "")}
                  </Button>
                ))}
              </HStack>
            </Flex>
            {visible.length === 0 ? (
              <Text color="fg.muted">No appointments for this vet today.</Text>
            ) : (
              <Box asChild listStyleType="none" m="0" p="0">
                <ul>
                  <Stack gap="3">
                    {visible.map((a) => (
                      <AppointmentRow key={a.id} appt={a} />
                    ))}
                  </Stack>
                </ul>
              </Box>
            )}
          </section>
        </Stack>
      </Grid>
    </Stack>
  )
}
```

```tsx components/patient-record.tsx
"use client"

import NextLink from "next/link"
import { Badge, Box, Button, Card, Flex, Grid, Heading, HStack, Icon, Link, SimpleGrid, Stack, Text } from "@chakra-ui/react"
import { Chart, useChart } from "@chakra-ui/charts"
import { CartesianGrid, LabelList, Line, LineChart, Tooltip, XAxis, YAxis } from "recharts"
import { LuArrowLeft, LuPawPrint, LuPhone, LuPill, LuSyringe, LuTriangleAlert } from "react-icons/lu"
import { AlertChips } from "@/components/alert-chips"
import { BookAppointmentButton } from "@/components/book-appointment"
import { useSchedule } from "@/lib/schedule-context"
import {
  RECORDS,
  STATUS_LABEL,
  ageText,
  daysBetween,
  endTime,
  formatClock,
  formatDate,
  formatMoney,
  ownerById,
  patientById,
  shortMonthYear,
  vaccineState,
  vetById,
} from "@/lib/data"

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Box>
      <Text fontSize="xs" fontWeight="semibold" letterSpacing="0.04em" textTransform="uppercase" color="fg.muted">
        {label}
      </Text>
      <Text fontWeight="medium">{children}</Text>
    </Box>
  )
}

function Section({
  id,
  title,
  icon,
  badge,
  children,
}: {
  id: string
  title: string
  icon?: React.ReactNode
  badge?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <Card.Root asChild>
      <section aria-labelledby={id}>
        <Card.Body gap="4">
          <HStack justify="space-between" gap="3" wrap="wrap">
            <HStack gap="2">
              {icon}
              <Heading id={id} size="lg">
                {title}
              </Heading>
            </HStack>
            {badge}
          </HStack>
          {children}
        </Card.Body>
      </section>
    </Card.Root>
  )
}

function WeightTrend({ points }: { points: { date: string; kg: number }[] }) {
  const data = points.map((p) => ({ label: shortMonthYear(p.date), kg: p.kg, date: formatDate(p.date) }))
  const chart = useChart({ data, series: [{ name: "kg", color: "teal.solid" }] })
  const first = points[0]
  const last = points[points.length - 1]
  const prev = points[points.length - 2]
  const lost = first.kg - last.kg
  const pct = (lost / first.kg) * 100

  return (
    <Stack gap="3">
      <Text color="fg.muted">
        {last.kg} kg on {formatDate(last.date)}, down {lost.toFixed(1)} kg ({pct.toFixed(0)}%) since{" "}
        {formatDate(first.date)}
        {prev ? ` and ${(prev.kg - last.kg).toFixed(1)} kg since the visit on ${formatDate(prev.date)}` : ""}.
      </Text>
      <Box role="img" aria-label={`Weight in kilograms over ${points.length} visits: ${points.map((p) => `${p.kg} on ${formatDate(p.date)}`).join(", ")}`}>
        <Chart.Root chart={chart} aspectRatio="auto" h="260px" w="full">
          <LineChart data={chart.data} responsive margin={{ top: 24, right: 24, left: 0, bottom: 0 }}>
            <CartesianGrid stroke={chart.color("border")} vertical={false} />
            <XAxis dataKey={chart.key("label")} axisLine={false} tickMargin={8} stroke={chart.color("border")} />
            <YAxis
              axisLine={false}
              tickLine={false}
              tickMargin={8}
              width={40}
              domain={[27, 33]}
              unit=" kg"
              stroke={chart.color("border")}
            />
            <Tooltip animationDuration={100} cursor={{ stroke: chart.color("border") }} content={<Chart.Tooltip />} />
            <Line
              isAnimationActive={false}
              dataKey={chart.key("kg")}
              stroke={chart.color("teal.solid")}
              fill={chart.color("teal.solid")}
              strokeWidth={3}
              dot={{ r: 4 }}
            >
              <LabelList
                dataKey={chart.key("kg")}
                position="top"
                offset={10}
                style={{ fontWeight: "600", fontSize: "12px", fill: chart.color("fg") }}
              />
            </Line>
          </LineChart>
        </Chart.Root>
      </Box>
    </Stack>
  )
}

export function PatientRecord({ patientId }: { patientId: string }) {
  const { appointments } = useSchedule()
  const patient = patientById(patientId)
  const owner = ownerById(patient.owner)
  const record = RECORDS[patientId]
  const todays = appointments
    .filter((a) => a.patient === patientId && a.status !== "cancelled")
    .sort((a, b) => a.start.localeCompare(b.start))

  const vaccines = record
    ? [...record.vaccinations]
        .map((v) => ({ ...v, ...vaccineState(v.due) }))
        .sort((a, b) => a.due.localeCompare(b.due))
    : []
  const overdue = vaccines.filter((v) => v.state === "overdue")

  return (
    <Stack gap="6">
      <Box>
        <Link asChild color="fg.muted" width="fit-content" minH="10" display="inline-flex" alignItems="center" gap="2">
          <NextLink href="/">
            <LuArrowLeft aria-hidden="true" />
            Today’s schedule
          </NextLink>
        </Link>
      </Box>

      {patient.alerts.length > 0 && (
        <Box
          asChild
          bg="red.subtle"
          borderWidth="3px"
          borderColor="red.solid"
          rounded="xl"
          p={{ base: "4", md: "5" }}
        >
          <section aria-label="Medical alerts" role="region">
            <HStack gap="3" align="start">
              <Icon boxSize="8" color="red.solid" flexShrink="0" mt="0.5">
                <LuTriangleAlert aria-hidden="true" />
              </Icon>
              <Stack gap="2">
                <Heading size="md" color="red.fg" textTransform="uppercase" letterSpacing="0.04em">
                  Medical alerts for {patient.name}
                </Heading>
                <Box asChild listStyleType="none" m="0" p="0">
                  <ul>
                    {patient.alerts.map((a) => (
                      <li key={a}>
                        <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="bold" color="red.fg">
                          {a}
                        </Text>
                      </li>
                    ))}
                  </ul>
                </Box>
              </Stack>
            </HStack>
          </section>
        </Box>
      )}

      <Card.Root>
        <Card.Body>
          <Flex direction={{ base: "column", md: "row" }} gap="5" justify="space-between" align={{ base: "stretch", md: "start" }}>
            <HStack gap="4" align="start">
              <Flex boxSize="16" rounded="2xl" bg="teal.subtle" color="teal.fg" align="center" justify="center" flexShrink="0">
                <Icon boxSize="8">
                  <LuPawPrint aria-hidden="true" />
                </Icon>
              </Flex>
              <Stack gap="1">
                <Heading asChild size="3xl">
                  <h1>{patient.name}</h1>
                </Heading>
                <Text color="fg.muted">
                  {patient.species}, {patient.breed} · {ageText(patient.born)} · {patient.sex}
                </Text>
                <HStack gap="2" wrap="wrap" mt="1">
                  <Badge variant="outline" size="md">
                    ID {patient.id}
                  </Badge>
                  {overdue.length > 0 && (
                    <Badge colorPalette="orange" variant="solid" size="md">
                      <LuSyringe aria-hidden="true" />
                      {overdue.length} vaccination{overdue.length === 1 ? "" : "s"} overdue
                    </Badge>
                  )}
                </HStack>
              </Stack>
            </HStack>
            <BookAppointmentButton patientId={patientId} label="Book follow-up" />
          </Flex>

          <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} gap="4" mt="6" pt="5" borderTopWidth="1px">
            <Detail label="Born">{formatDate(patient.born)}</Detail>
            <Detail label="Owner">{owner.name}</Detail>
            <Detail label="Owner phone">
              <Link href={`tel:${owner.phone.replace(/\s/g, "")}`} display="inline-flex" alignItems="center" gap="2" minH="8">
                <LuPhone aria-hidden="true" />
                {owner.phone}
              </Link>
            </Detail>
            <Detail label="Today">
              {todays.length === 0 ? (
                "No appointment"
              ) : (
                <Stack gap="1" as="span">
                  {todays.map((a) => (
                    <span key={a.id}>
                      {formatClock(a.start)} to {formatClock(endTime(a))}, {a.reason} ({STATUS_LABEL[a.status]})
                    </span>
                  ))}
                </Stack>
              )}
            </Detail>
          </SimpleGrid>
        </Card.Body>
      </Card.Root>

      {!record ? (
        <Card.Root>
          <Card.Body>
            <Heading size="lg">No clinical history on file</Heading>
            <Text color="fg.muted" mt="2">
              Weights, vaccinations, medications and visit notes for {patient.name} have not been entered yet.
            </Text>
          </Card.Body>
        </Card.Root>
      ) : (
        <Grid templateColumns={{ base: "1fr", xl: "minmax(0,1.3fr) minmax(0,1fr)" }} gap="6" alignItems="start">
          <Stack gap="6" minW="0">
            <Section id="weight-title" title="Weight trend">
              <WeightTrend points={record.weights_kg} />
            </Section>

            <Section id="visits-title" title="Visit history" badge={<Text color="fg.muted">{record.visits.length} visits</Text>}>
              <Box asChild listStyleType="none" m="0" p="0">
                <ol>
                  {record.visits.map((v, i) => (
                    <li key={v.date}>
                      <Stack gap="1.5" py="4" borderTopWidth={i === 0 ? "0" : "1px"}>
                        <HStack justify="space-between" align="start" gap="3" wrap="wrap">
                          <Text fontWeight="semibold" fontSize="lg">
                            {v.reason}
                          </Text>
                          <Text color="fg.muted" fontVariantNumeric="tabular-nums">
                            {formatDate(v.date)}
                          </Text>
                        </HStack>
                        <Text fontSize="sm" color="fg.muted">
                          {vetById(v.vet).name} · Invoice {formatMoney(v.invoice_usd)}
                        </Text>
                        <Text>{v.notes}</Text>
                      </Stack>
                    </li>
                  ))}
                </ol>
              </Box>
            </Section>
          </Stack>

          <Stack gap="6" minW="0">
            <Section
              id="vacc-title"
              title="Vaccinations"
              icon={<LuSyringe aria-hidden="true" />}
              badge={
                overdue.length > 0 ? (
                  <Badge colorPalette="red" variant="solid" size="md">
                    {overdue.length} overdue
                  </Badge>
                ) : (
                  <Badge colorPalette="green" variant="subtle" size="md">
                    All current
                  </Badge>
                )
              }
            >
              <Box asChild listStyleType="none" m="0" p="0">
                <ul>
                  {vaccines.map((v, i) => (
                    <li key={v.name}>
                      <Flex
                        justify="space-between"
                        align="center"
                        gap="3"
                        py="3"
                        px={v.state === "overdue" ? "3" : "0"}
                        mx={v.state === "overdue" ? "-3" : "0"}
                        rounded="lg"
                        bg={v.state === "overdue" ? "red.subtle" : "transparent"}
                        borderTopWidth={i === 0 || v.state === "overdue" ? "0" : "1px"}
                      >
                        <Box minW="0">
                          <Text fontWeight="semibold">{v.name}</Text>
                          <Text fontSize="sm" color="fg.muted">
                            Given {formatDate(v.given)} · Due {formatDate(v.due)}
                          </Text>
                        </Box>
                        {v.state === "overdue" ? (
                          <Badge colorPalette="red" variant="solid" size="md" flexShrink="0">
                            <LuTriangleAlert aria-hidden="true" />
                            Overdue {v.days} {v.days === 1 ? "day" : "days"}
                          </Badge>
                        ) : v.state === "soon" ? (
                          <Badge colorPalette="orange" variant="subtle" size="md" flexShrink="0">
                            Due in {v.days} days
                          </Badge>
                        ) : (
                          <Badge colorPalette="green" variant="subtle" size="md" flexShrink="0">
                            Current
                          </Badge>
                        )}
                      </Flex>
                    </li>
                  ))}
                </ul>
              </Box>
            </Section>

            <Section id="meds-title" title="Current medications" icon={<LuPill aria-hidden="true" />}>
              <Box asChild listStyleType="none" m="0" p="0">
                <ul>
                  {record.medications.map((m, i) => (
                    <li key={m.name}>
                      <Stack gap="0.5" py="3" borderTopWidth={i === 0 ? "0" : "1px"}>
                        <Text fontWeight="semibold">{m.name}</Text>
                        <Text>{m.dose}</Text>
                        <Text fontSize="sm" color="fg.muted">
                          Since {formatDate(m.since)} ({Math.round(daysBetween(m.since, "2026-11-12") / 30.4)} months)
                        </Text>
                      </Stack>
                    </li>
                  ))}
                </ul>
              </Box>
            </Section>
          </Stack>
        </Grid>
      )}
    </Stack>
  )
}
```

```tsx app/layout.tsx
import type { Metadata } from "next"
import { EmotionRegistry } from "@/components/ui/emotion-registry"
import { Provider } from "@/components/ui/provider"
import { Toaster } from "@/components/ui/toaster"
import { ScheduleProvider } from "@/lib/schedule-context"

export const metadata: Metadata = {
  title: "Pawpoint | Hillside Veterinary Clinic",
  description: "Front-desk and records software for Hillside Veterinary Clinic",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <EmotionRegistry>
          <Provider>
            <ScheduleProvider>{children}</ScheduleProvider>
            <Toaster />
          </Provider>
        </EmotionRegistry>
      </body>
    </html>
  )
}
```

```tsx app/page.tsx
import { AppShell } from "@/components/app-shell"
import { ScheduleView } from "@/components/schedule-view"

export default function Page() {
  return (
    <AppShell>
      <ScheduleView />
    </AppShell>
  )
}
```

```tsx app/patients/[id]/page.tsx
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { AppShell } from "@/components/app-shell"
import { PatientRecord } from "@/components/patient-record"
import { PATIENTS, findPatient } from "@/lib/data"

export function generateStaticParams() {
  return PATIENTS.map((p) => ({ id: p.id }))
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const patient = findPatient(id)
  return { title: patient ? `${patient.name} | Pawpoint` : "Patient | Pawpoint" }
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!findPatient(id)) notFound()
  return (
    <AppShell>
      <PatientRecord patientId={id} />
    </AppShell>
  )
}
```
