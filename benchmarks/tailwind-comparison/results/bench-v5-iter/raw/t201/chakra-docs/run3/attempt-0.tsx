```tsx app/layout.tsx
import type { Metadata } from "next";
import { EmotionRegistry } from "@/components/ui/emotion-registry";
import { Provider } from "@/components/ui/provider";
import { Toaster } from "@/components/ui/toaster";
import { AppShell } from "@/components/AppShell";

export const metadata: Metadata = {
  title: "Pawpoint | Hillside Veterinary Clinic front desk",
  description: "Front-desk and records software for Hillside Veterinary Clinic.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <EmotionRegistry>
          <Provider>
            <AppShell>{children}</AppShell>
            <Toaster />
          </Provider>
        </EmotionRegistry>
      </body>
    </html>
  );
}
```

```tsx app/page.tsx
import { Schedule } from "@/components/Schedule"

export default function Page() {
  return <Schedule />
}
```

```tsx app/patients/[id]/page.tsx
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { PatientRecordView } from "@/components/PatientRecordView"
import { PATIENTS, getPatient } from "@/lib/data"

export function generateStaticParams() {
  return PATIENTS.map((p) => ({ id: p.id }))
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const patient = getPatient(id)
  return { title: patient ? `${patient.name} | Pawpoint` : "Patient not found | Pawpoint" }
}

export default async function PatientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const patient = getPatient(id)
  if (!patient) notFound()
  return <PatientRecordView patientId={patient.id} />
}
```

```tsx components/Alerts.tsx
import { Badge, Box, Flex, Heading, Icon, Stack, Text, VisuallyHidden } from "@chakra-ui/react"
import { LuTriangleAlert } from "react-icons/lu"

/** Compact, solid red chips: used wherever a patient appears. */
export function AlertChips({ alerts, size = "md" }: { alerts: string[]; size?: "sm" | "md" | "lg" }) {
  if (alerts.length === 0) return null
  return (
    <Flex gap="1.5" wrap="wrap" role="list" aria-label="Medical alerts">
      {alerts.map((alert) => (
        <Badge
          key={alert}
          role="listitem"
          colorPalette="red"
          variant="solid"
          size={size}
          gap="1.5"
          textTransform="none"
          fontWeight="semibold"
          whiteSpace="normal"
          textAlign="start"
        >
          <Icon aria-hidden boxSize="3.5" flexShrink={0}>
            <LuTriangleAlert />
          </Icon>
          <VisuallyHidden>Medical alert: </VisuallyHidden>
          {alert}
        </Badge>
      ))}
    </Flex>
  )
}

/** Full-width banner on the patient record. */
export function AlertBanner({ name, alerts }: { name: string; alerts: string[] }) {
  if (alerts.length === 0) return null
  return (
    <Box
      role="region"
      aria-label={`Medical alerts for ${name}`}
      bg="red.solid"
      color="red.contrast"
      borderRadius="xl"
      px={{ base: "4", md: "6" }}
      py="4"
      boxShadow="md"
    >
      <Flex align="center" gap="3" mb="3">
        <Icon aria-hidden boxSize="7" flexShrink={0}>
          <LuTriangleAlert />
        </Icon>
        <Heading as="h2" size="lg" letterSpacing="wide" textTransform="uppercase">
          Medical alerts
        </Heading>
      </Flex>
      <Stack as="ul" gap="2" listStyle="none" m="0" p="0">
        {alerts.map((alert) => (
          <Box
            as="li"
            key={alert}
            bg="whiteAlpha.300"
            borderRadius="lg"
            px="4"
            py="2.5"
            borderWidth="1px"
            borderColor="whiteAlpha.500"
          >
            <Text fontSize={{ base: "lg", md: "xl" }} fontWeight="bold" lineHeight="short">
              {alert}
            </Text>
          </Box>
        ))}
      </Stack>
    </Box>
  )
}
```

```tsx components/AppShell.tsx
"use client"

import * as React from "react"
import NextLink from "next/link"
import { Avatar, Box, Button, Container, Flex, HStack, Icon, Link, Text } from "@chakra-ui/react"
import { LuCalendarPlus, LuClock, LuPawPrint } from "react-icons/lu"
import { ColorModeButton } from "@/components/ui/color-mode"
import { PatientSearch } from "@/components/PatientSearch"
import { BookingDialog } from "@/components/BookingDialog"
import { ClinicProvider, useClinic } from "@/lib/clinic"
import { CLINIC, USER, fmtMin } from "@/lib/data"

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <ClinicProvider>
      <Link
        href="#main"
        position="absolute"
        left="-9999px"
        top="2"
        zIndex="skipNav"
        bg="bg.panel"
        px="4"
        py="2"
        borderRadius="md"
        _focus={{ left: "2" }}
      >
        Skip to content
      </Link>
      <Header />
      <Box as="main" id="main" tabIndex={-1} outline="none" pb="12">
        <Container maxW="7xl" px={{ base: "4", md: "6" }} pt={{ base: "4", md: "6" }}>
          {children}
        </Container>
      </Box>
      <BookingDialog />
    </ClinicProvider>
  )
}

function Header() {
  const { nowMin, openBooking } = useClinic()
  return (
    <Box
      as="header"
      position="sticky"
      top="0"
      zIndex="sticky"
      bg="bg.panel"
      borderBottomWidth="1px"
      boxShadow="xs"
    >
      <Container maxW="7xl" px={{ base: "4", md: "6" }} py="3">
        <Flex align="center" gap={{ base: "3", md: "5" }} wrap="wrap">
          <Link asChild variant="plain" _hover={{ textDecoration: "none" }}>
            <NextLink href="/">
              <HStack gap="2.5">
                <Flex boxSize="10" align="center" justify="center" borderRadius="lg" bg="teal.solid" color="teal.contrast">
                  <Icon boxSize="6" aria-hidden>
                    <LuPawPrint />
                  </Icon>
                </Flex>
                <Box lineHeight="1.15">
                  <Text fontWeight="bold" fontSize="lg" color="fg">
                    {CLINIC.product}
                  </Text>
                  <Text fontSize="xs" color="fg.muted" display={{ base: "none", sm: "block" }}>
                    {CLINIC.name}
                  </Text>
                </Box>
              </HStack>
            </NextLink>
          </Link>

          <Box order={{ base: 3, md: 2 }} flex={{ base: "1 0 100%", md: "1" }} maxW={{ md: "lg" }}>
            <PatientSearch />
          </Box>

          <HStack order={{ base: 2, md: 3 }} gap="3" ms="auto">
            <HStack gap="1.5" color="fg.muted" fontSize="sm" display={{ base: "none", lg: "flex" }}>
              <Icon aria-hidden>
                <LuClock />
              </Icon>
              <Text as="span" fontVariantNumeric="tabular-nums">
                {fmtMin(nowMin)}
              </Text>
            </HStack>
            <Button colorPalette="teal" bg="teal.700" _hover={{ bg: "teal.800" }} onClick={() => openBooking()} size={{ base: "md", md: "md" }}>
              <LuCalendarPlus aria-hidden />
              <Text as="span" display={{ base: "none", sm: "inline" }}>
                New appointment
              </Text>
              <Text as="span" display={{ base: "inline", sm: "none" }}>
                Book
              </Text>
            </Button>
            <ColorModeButton />
            <HStack gap="2.5" display={{ base: "none", xl: "flex" }}>
              <Avatar.Root size="sm" colorPalette="teal">
                <Avatar.Fallback name={USER.name} />
              </Avatar.Root>
              <Box lineHeight="1.15">
                <Text fontSize="sm" fontWeight="medium">
                  {USER.name}
                </Text>
                <Text fontSize="xs" color="fg.muted">
                  {USER.role}
                </Text>
              </Box>
            </HStack>
          </HStack>
        </Flex>
      </Container>
    </Box>
  )
}
```

```tsx components/BookingDialog.tsx
"use client"

import * as React from "react"
import { Button, Flex, Input, Stack, Text } from "@chakra-ui/react"
import { LuCalendarPlus } from "react-icons/lu"
import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field } from "@/components/ui/field"
import { Checkbox } from "@/components/ui/checkbox"
import { NativeSelectField, NativeSelectRoot } from "@/components/ui/native-select"
import { toaster } from "@/components/ui/toaster"
import { AlertChips } from "@/components/Alerts"
import { useClinic } from "@/lib/clinic"
import {
  CLOSE_MIN,
  OPEN_MIN,
  PATIENTS,
  VETS,
  fmtDuration,
  fmtMin,
  findClash,
  getOwner,
  getPatient,
  getVet,
  endMin,
  fmtTime,
  minToHHMM,
} from "@/lib/data"

const DURATIONS = [15, 20, 30, 45, 60, 90]
const STEP = 15

export function BookingDialog() {
  const { bookingOpen, closeBooking } = useClinic()
  return (
    <DialogRoot
      open={bookingOpen}
      onOpenChange={(e) => {
        if (!e.open) closeBooking()
      }}
      lazyMount
      unmountOnExit
      placement="center"
      scrollBehavior="inside"
      size={{ base: "full", md: "md" }}
    >
      <DialogContent>
        <BookingForm />
      </DialogContent>
    </DialogRoot>
  )
}

function BookingForm() {
  const { appointments, nowMin, bookingPatient, book, closeBooking } = useClinic()

  const firstFree = React.useCallback(
    (vetId: string, minutes: number) => {
      const from = Math.max(OPEN_MIN, Math.ceil(nowMin / STEP) * STEP)
      for (let t = from; t + minutes <= CLOSE_MIN; t += STEP) {
        if (!findClash(appointments, vetId, t, minutes)) return t
      }
      return from
    },
    [appointments, nowMin],
  )

  const [patientId, setPatientId] = React.useState(bookingPatient ?? "")
  const [vetId, setVetId] = React.useState(VETS[0].id)
  const [minutes, setMinutes] = React.useState(20)
  const [start, setStart] = React.useState(() => firstFree(VETS[0].id, 20))
  const [reason, setReason] = React.useState("")
  const [urgent, setUrgent] = React.useState(false)
  const [submitted, setSubmitted] = React.useState(false)

  const patient = getPatient(patientId)
  const clash = findClash(appointments, vetId, start, minutes)
  const clashPatient = clash ? getPatient(clash.patient) : undefined
  const pastClose = start + minutes > CLOSE_MIN
  const inPast = start < nowMin - 5
  const slotError = clash
    ? `${getVet(vetId).name} already has ${clashPatient?.name ?? "a booking"} from ${fmtTime(clash.start)} to ${fmtMin(endMin(clash))}. Pick another time or vet.`
    : pastClose
      ? "That visit would run past closing time (6:00 PM)."
      : inPast
        ? "That time has already passed."
        : undefined

  const timeOptions: { value: string; label: string; disabled: boolean }[] = []
  for (let t = OPEN_MIN; t < CLOSE_MIN; t += STEP) {
    const taken = findClash(appointments, vetId, t, minutes)
    const late = t + minutes > CLOSE_MIN
    const past = t < nowMin - 5
    timeOptions.push({
      value: String(t),
      disabled: Boolean(taken) || late || past,
      label: `${fmtMin(t)}${taken ? "  (booked)" : past ? "  (passed)" : late ? "  (too late)" : ""}`,
    })
  }

  const changeVet = (id: string) => {
    setVetId(id)
    if (findClash(appointments, id, start, minutes)) setStart(firstFree(id, minutes))
  }
  const changeMinutes = (m: number) => {
    setMinutes(m)
    if (findClash(appointments, vetId, start, m) || start + m > CLOSE_MIN) setStart(firstFree(vetId, m))
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    if (!patient || !reason.trim() || slotError) return
    const res = book({ patient: patient.id, vet: vetId, start: minToHHMM(start), minutes, reason, urgent })
    if (res.ok) {
      toaster.create({
        type: "success",
        title: `Booked ${patient.name} at ${fmtMin(start)}`,
        description: `${getVet(vetId).name}, ${getVet(vetId).room}. ${reason.trim()}`,
        closable: true,
      })
      closeBooking()
    } else {
      toaster.create({ type: "error", title: "Could not book", description: res.error })
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      <DialogHeader>
        <DialogTitle display="flex" alignItems="center" gap="2">
          <LuCalendarPlus aria-hidden /> New appointment
        </DialogTitle>
      </DialogHeader>
      <DialogBody>
        <Stack gap="4">
          <Field
            label="Patient"
            required
            invalid={submitted && !patient}
            errorText="Pick the patient this visit is for."
          >
            <NativeSelectRoot>
              <NativeSelectField
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                placeholder="Select a patient"
              >
                {PATIENTS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.species}, {getOwner(p.owner).name}){p.alerts.length > 0 ? " - ALERT" : ""}
                  </option>
                ))}
              </NativeSelectField>
            </NativeSelectRoot>
          </Field>
          {patient && patient.alerts.length > 0 && <AlertChips alerts={patient.alerts} />}

          <Flex gap="3" direction={{ base: "column", sm: "row" }}>
            <Field label="Vet" flex="1">
              <NativeSelectRoot>
                <NativeSelectField value={vetId} onChange={(e) => changeVet(e.target.value)}>
                  {VETS.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.room})
                    </option>
                  ))}
                </NativeSelectField>
              </NativeSelectRoot>
            </Field>
            <Field label="Length" w={{ sm: "40%" }}>
              <NativeSelectRoot>
                <NativeSelectField value={String(minutes)} onChange={(e) => changeMinutes(Number(e.target.value))}>
                  {DURATIONS.map((d) => (
                    <option key={d} value={d}>
                      {fmtDuration(d)}
                    </option>
                  ))}
                </NativeSelectField>
              </NativeSelectRoot>
            </Field>
          </Flex>

          <Field
            label="Time"
            invalid={Boolean(slotError)}
            errorText={slotError}
            helperText="Times that clash with this vet's other bookings are greyed out."
          >
            <NativeSelectRoot>
              <NativeSelectField value={String(start)} onChange={(e) => setStart(Number(e.target.value))}>
                {timeOptions.map((o) => (
                  <option key={o.value} value={o.value} disabled={o.disabled}>
                    {o.label}
                  </option>
                ))}
              </NativeSelectField>
            </NativeSelectRoot>
          </Field>

          <Field
            label="Reason for visit"
            required
            invalid={submitted && !reason.trim()}
            errorText="Add a short reason so the vet knows what to prepare."
          >
            <Input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Follow-up: ear infection"
              autoComplete="off"
            />
          </Field>

          <Checkbox checked={urgent} onCheckedChange={(e) => setUrgent(e.checked === true)} colorPalette="red">
            Urgent: flag this visit on the schedule
          </Checkbox>
          <Text fontSize="sm" color="fg.muted">
            {patient
              ? `Owner: ${getOwner(patient.owner).name} · ${getOwner(patient.owner).phone}`
              : "Owner details appear once a patient is picked."}
          </Text>
        </Stack>
      </DialogBody>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={closeBooking}>
          Cancel
        </Button>
        <Button type="submit" colorPalette="teal" bg="teal.700" _hover={{ bg: "teal.800" }} disabled={Boolean(slotError)}>
          Book appointment
        </Button>
      </DialogFooter>
      <DialogCloseTrigger />
    </form>
  )
}
```

```tsx components/PatientRecordView.tsx
"use client"

import * as React from "react"
import NextLink from "next/link"
import { Chart, useChart } from "@chakra-ui/charts"
import { CartesianGrid, Line, LineChart, Tooltip, XAxis, YAxis } from "recharts"
import {
  Avatar,
  Badge,
  Box,
  Button,
  Flex,
  Grid,
  GridItem,
  Heading,
  HStack,
  Icon,
  Link,
  Stack,
  Text,
} from "@chakra-ui/react"
import {
  LuArrowLeft,
  LuCalendarPlus,
  LuClipboardList,
  LuPhone,
  LuPill,
  LuStethoscope,
  LuSyringe,
  LuTrendingDown,
} from "react-icons/lu"
import { AlertBanner } from "@/components/Alerts"
import { StatusBadge } from "@/components/StatusBadge"
import { useClinic } from "@/lib/clinic"
import {
  RECORDS,
  TODAY,
  ageOn,
  daysBetween,
  fmtDate,
  fmtDateShort,
  fmtMoney,
  fmtTime,
  fmtMin,
  endMin,
  getOwner,
  getPatient,
  getVet,
  toMin,
  vaccineState,
} from "@/lib/data"

function Panel({
  id,
  title,
  icon,
  aside,
  children,
}: {
  id: string
  title: string
  icon: React.ReactNode
  aside?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <Box as="section" aria-labelledby={id} borderWidth="1px" borderRadius="xl" bg="bg.panel" overflow="hidden">
      <Flex align="center" justify="space-between" gap="3" px={{ base: "4", md: "5" }} py="3.5" borderBottomWidth="1px">
        <HStack gap="2.5">
          <Icon boxSize="5" color="fg.muted" aria-hidden>
            {icon}
          </Icon>
          <Heading as="h2" id={id} size="md">
            {title}
          </Heading>
        </HStack>
        {aside}
      </Flex>
      <Box px={{ base: "4", md: "5" }} py="4">
        {children}
      </Box>
    </Box>
  )
}

export function PatientRecordView({ patientId }: { patientId: string }) {
  const patient = getPatient(patientId)
  const { appointments, openBooking } = useClinic()
  if (!patient) return null
  const owner = getOwner(patient.owner)
  const record = RECORDS[patient.id]
  const mine = appointments
    .filter((a) => a.patient === patient.id)
    .sort((a, b) => toMin(a.start) - toMin(b.start))

  return (
    <Stack gap={{ base: "4", md: "5" }}>
      <Link asChild color="fg.muted" fontSize="sm" w="fit-content" display="inline-flex" alignItems="center" gap="1.5">
        <NextLink href="/">
          <LuArrowLeft aria-hidden /> Today&rsquo;s schedule
        </NextLink>
      </Link>

      <Flex
        borderWidth="1px"
        borderRadius="xl"
        bg="bg.panel"
        p={{ base: "4", md: "6" }}
        gap={{ base: "4", md: "6" }}
        direction={{ base: "column", lg: "row" }}
        justify="space-between"
      >
        <HStack gap={{ base: "3", md: "5" }} align="center" minW="0">
          <Avatar.Root size="2xl" colorPalette="teal" flexShrink={0}>
            <Avatar.Fallback name={patient.name} />
          </Avatar.Root>
          <Box minW="0">
            <Heading as="h1" size={{ base: "3xl", md: "4xl" }} lineHeight="1.1">
              {patient.name}
            </Heading>
            <Text color="fg.muted" fontSize={{ base: "md", md: "lg" }}>
              {patient.breed} · {patient.species}
            </Text>
            <Text color="fg.muted" fontSize="sm">
              {patient.sex} · {ageOn(patient.born, TODAY)} old (born {fmtDate(patient.born)})
            </Text>
            <Text color="fg.subtle" fontSize="xs">
              Patient ID {patient.id}
            </Text>
          </Box>
        </HStack>

        <Flex
          direction={{ base: "column", sm: "row" }}
          gap="4"
          align={{ base: "stretch", sm: "center" }}
          justify="space-between"
          borderTopWidth={{ base: "1px", lg: "0" }}
          borderStartWidth={{ lg: "1px" }}
          ps={{ lg: "6" }}
          pt={{ base: "4", lg: "0" }}
        >
          <Box>
            <Text fontSize="xs" fontWeight="semibold" textTransform="uppercase" letterSpacing="wider" color="fg.muted">
              Owner
            </Text>
            <Text fontWeight="semibold" fontSize="lg">
              {owner.name}
            </Text>
            <Link href={`tel:${owner.phone.replace(/\s/g, "")}`} fontSize="md" fontVariantNumeric="tabular-nums" display="inline-flex" alignItems="center" gap="1.5">
              <LuPhone aria-hidden /> {owner.phone}
            </Link>
          </Box>
          <Button colorPalette="teal" bg="teal.700" _hover={{ bg: "teal.800" }} size="lg" onClick={() => openBooking(patient.id)}>
            <LuCalendarPlus aria-hidden /> Book follow-up
          </Button>
        </Flex>
      </Flex>

      <AlertBanner name={patient.name} alerts={patient.alerts} />

      <Grid templateColumns={{ base: "minmax(0,1fr)", lg: "minmax(0,1.45fr) minmax(0,1fr)" }} gap={{ base: "4", md: "5" }} alignItems="start">
        <GridItem order={{ base: 2, lg: 1 }}>
          <Stack gap={{ base: "4", md: "5" }}>
            {record ? (
              <>
                <WeightPanel weights={record.weights_kg} />
                <VisitsPanel visits={record.visits} />
              </>
            ) : (
              <Panel id="nohistory" title="Clinical history" icon={<LuClipboardList />}>
                <Text color="fg.muted">
                  No weights, vaccinations or visit notes have been entered for {patient.name} yet. They appear here
                  once the vet records the first visit.
                </Text>
              </Panel>
            )}
          </Stack>
        </GridItem>

        <GridItem order={{ base: 1, lg: 2 }}>
          <Stack gap={{ base: "4", md: "5" }}>
            <Panel id="today-h" title="Today" icon={<LuStethoscope />}>
              {mine.length === 0 ? (
                <Text color="fg.muted">No appointments today.</Text>
              ) : (
                <Stack as="ul" listStyle="none" m="0" p="0" gap="3">
                  {mine.map((a) => (
                    <Flex as="li" key={a.id} justify="space-between" align="start" gap="3">
                      <Box minW="0">
                        <Text fontWeight="semibold">
                          {fmtTime(a.start)} to {fmtMin(endMin(a))}
                          {a.urgent && (
                            <Badge colorPalette="red" variant="solid" ms="2">
                              Urgent
                            </Badge>
                          )}
                        </Text>
                        <Text fontSize="sm" color="fg.muted">
                          {a.reason} · {getVet(a.vet).name}, {getVet(a.vet).room}
                        </Text>
                      </Box>
                      <StatusBadge status={a.status} />
                    </Flex>
                  ))}
                </Stack>
              )}
            </Panel>
            {record && (
              <>
                <VaccinationsPanel vaccinations={record.vaccinations} />
                <MedicationsPanel medications={record.medications} />
              </>
            )}
          </Stack>
        </GridItem>
      </Grid>
    </Stack>
  )
}

function WeightPanel({ weights }: { weights: { date: string; kg: number }[] }) {
  const data = weights.map((w) => ({ label: fmtDateShort(w.date), kg: w.kg }))
  const chart = useChart({ data, series: [{ name: "kg", color: "teal.solid" }] })
  const first = weights[0]
  const last = weights[weights.length - 1]
  const prev = weights[weights.length - 2]
  const change = last.kg - first.kg
  const pct = (change / first.kg) * 100
  const months = Math.round(daysBetween(first.date, last.date) / 30.4)
  const min = Math.floor(Math.min(...weights.map((w) => w.kg)) - 1)
  const max = Math.ceil(Math.max(...weights.map((w) => w.kg)) + 1)

  return (
    <Panel
      id="weight-h"
      title="Weight trend"
      icon={<LuTrendingDown />}
      aside={
        pct <= -5 ? (
          <Badge colorPalette="orange" variant="subtle" size="md">
            Down {Math.abs(pct).toFixed(0)}% in {months} months
          </Badge>
        ) : undefined
      }
    >
      <Flex gap={{ base: "5", md: "8" }} mb="4" wrap="wrap">
        <Box>
          <Text fontSize="xs" color="fg.muted" textTransform="uppercase" letterSpacing="wider" fontWeight="semibold">
            Today
          </Text>
          <Text fontSize="3xl" fontWeight="bold" lineHeight="1.1">
            {last.kg.toFixed(1)} <Text as="span" fontSize="md" fontWeight="medium" color="fg.muted">kg</Text>
          </Text>
        </Box>
        <Box>
          <Text fontSize="xs" color="fg.muted" textTransform="uppercase" letterSpacing="wider" fontWeight="semibold">
            Since last visit
          </Text>
          <Text fontSize="xl" fontWeight="semibold" lineHeight="1.5">
            {(last.kg - prev.kg).toFixed(1)} kg
          </Text>
        </Box>
        <Box>
          <Text fontSize="xs" color="fg.muted" textTransform="uppercase" letterSpacing="wider" fontWeight="semibold">
            Since {fmtDate(first.date)}
          </Text>
          <Text fontSize="xl" fontWeight="semibold" lineHeight="1.5" color="orange.fg">
            {change.toFixed(1)} kg ({pct.toFixed(1)}%)
          </Text>
        </Box>
      </Flex>
      <Box role="img" aria-label={`Weight in kilograms over ${weights.length} visits, from ${first.kg} kg in ${fmtDate(first.date)} to ${last.kg} kg on ${fmtDate(last.date)}`}>
        <Chart.Root chart={chart} h="240px" w="full">
          <LineChart data={chart.data} responsive width="100%" height="100%" margin={{ left: 0, right: 12, top: 8, bottom: 0 }}>
            <CartesianGrid stroke={chart.color("border")} vertical={false} />
            <XAxis axisLine={false} dataKey={chart.key("label")} stroke={chart.color("border")} tickMargin={8} />
            <YAxis
              axisLine={false}
              tickLine={false}
              tickMargin={8}
              width={36}
              domain={[min, max]}
              stroke={chart.color("border")}
              tickFormatter={(v: number) => `${v}`}
            />
            <Tooltip animationDuration={100} cursor={false} content={<Chart.Tooltip />} />
            {chart.series.map((s) => (
              <Line
                key={s.name}
                isAnimationActive={false}
                dataKey={chart.key(s.name)}
                stroke={chart.color(s.color)}
                strokeWidth={3}
                dot={{ r: 4, fill: chart.color(s.color) }}
              />
            ))}
          </LineChart>
        </Chart.Root>
      </Box>
      <Flex as="ul" listStyle="none" m="0" p="0" mt="3" wrap="wrap" columnGap="4" rowGap="1" fontSize="sm" color="fg.muted">
        {weights.map((w) => (
          <Box as="li" key={w.date} fontVariantNumeric="tabular-nums">
            {fmtDateShort(w.date)}: <Text as="span" fontWeight="semibold" color="fg">{w.kg.toFixed(1)}</Text>
          </Box>
        ))}
      </Flex>
    </Panel>
  )
}

function VaccinationsPanel({ vaccinations }: { vaccinations: { name: string; given: string; due: string }[] }) {
  const rows = vaccinations
    .map((v) => ({ ...v, ...vaccineState(v.due) }))
    .sort((a, b) => a.due.localeCompare(b.due))
  const overdue = rows.filter((r) => r.state === "overdue").length
  return (
    <Panel
      id="vacc-h"
      title="Vaccinations"
      icon={<LuSyringe />}
      aside={
        overdue > 0 ? (
          <Badge colorPalette="red" variant="solid" size="md">
            {overdue} overdue
          </Badge>
        ) : (
          <Badge colorPalette="green" variant="subtle" size="md">
            All up to date
          </Badge>
        )
      }
    >
      <Stack as="ul" listStyle="none" m="0" p="0" gap="2.5">
        {rows.map((r) => (
          <Flex
            as="li"
            key={r.name}
            justify="space-between"
            align="center"
            gap="3"
            borderWidth="1px"
            borderColor={r.state === "overdue" ? "red.solid" : "border"}
            borderStartWidth={r.state === "overdue" ? "4px" : "1px"}
            bg={r.state === "overdue" ? "red.subtle" : undefined}
            borderRadius="lg"
            px="3.5"
            py="2.5"
          >
            <Box minW="0">
              <Text fontWeight="semibold">{r.name}</Text>
              <Text fontSize="sm" color="fg.muted">
                Given {fmtDate(r.given)}
              </Text>
              <Text fontSize="sm" color={r.state === "overdue" ? "red.fg" : "fg.muted"} fontWeight={r.state === "overdue" ? "semibold" : undefined}>
                Due {fmtDate(r.due)}
              </Text>
            </Box>
            <Box textAlign="end" flexShrink={0}>
              {r.state === "overdue" && (
                <Badge colorPalette="red" variant="solid" size="md">
                  Overdue
                </Badge>
              )}
              {r.state === "soon" && (
                <Badge colorPalette="orange" variant="solid" size="md">
                  Due soon
                </Badge>
              )}
              {r.state === "ok" && (
                <Badge colorPalette="green" variant="subtle" size="md">
                  Up to date
                </Badge>
              )}
              <Text fontSize="xs" color={r.state === "overdue" ? "red.fg" : "fg.muted"} mt="1">
                {r.state === "overdue" ? `${r.days} days overdue` : `in ${r.days} days`}
              </Text>
            </Box>
          </Flex>
        ))}
      </Stack>
    </Panel>
  )
}

function MedicationsPanel({ medications }: { medications: { name: string; dose: string; since: string }[] }) {
  return (
    <Panel id="meds-h" title="Current medications" icon={<LuPill />}>
      <Stack as="ul" listStyle="none" m="0" p="0" gap="2.5">
        {medications.map((m) => (
          <Box as="li" key={m.name} borderWidth="1px" borderRadius="lg" px="3.5" py="2.5">
            <Text fontWeight="semibold">{m.name}</Text>
            <Text fontSize="sm">{m.dose}</Text>
            <Text fontSize="xs" color="fg.muted">
              Since {fmtDate(m.since)}
            </Text>
          </Box>
        ))}
      </Stack>
    </Panel>
  )
}

function VisitsPanel({ visits }: { visits: { date: string; vet: string; reason: string; notes: string; invoice_usd: number }[] }) {
  return (
    <Panel id="visits-h" title="Visit history" icon={<LuClipboardList />} aside={<Text fontSize="sm" color="fg.muted">{visits.length} visits</Text>}>
      <Stack as="ol" listStyle="none" m="0" p="0" gap="0">
        {visits.map((v, i) => (
          <Box
            as="li"
            key={v.date}
            position="relative"
            ps="5"
            pb={i === visits.length - 1 ? "0" : "5"}
            borderStartWidth="2px"
            borderStartColor="border"
            ms="1"
          >
            <Box position="absolute" insetStart="-7px" top="1.5" boxSize="3" borderRadius="full" bg={v.date === TODAY ? "teal.solid" : "bg.emphasized"} borderWidth="2px" borderColor="bg.panel" />
            <Flex justify="space-between" gap="3" wrap="wrap">
              <Text fontWeight="semibold">
                {fmtDate(v.date)}
                {v.date === TODAY && (
                  <Badge colorPalette="teal" variant="subtle" ms="2">
                    Today
                  </Badge>
                )}
              </Text>
              <Text fontSize="sm" color="fg.muted" fontVariantNumeric="tabular-nums">
                Invoice {fmtMoney(v.invoice_usd)}
              </Text>
            </Flex>
            <Text fontWeight="medium">{v.reason}</Text>
            <Text fontSize="sm" color="fg.muted" mb="1.5">
              {getVet(v.vet).name}
            </Text>
            <Text fontSize="sm">{v.notes}</Text>
          </Box>
        ))}
      </Stack>
    </Panel>
  )
}
```

```tsx components/PatientSearch.tsx
"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Box, Flex, Input, Text, VisuallyHidden } from "@chakra-ui/react"
import { LuSearch } from "react-icons/lu"
import { InputGroup } from "@/components/ui/input-group"
import { AlertChips } from "@/components/Alerts"
import { PATIENTS, getOwner, type Patient } from "@/lib/data"

function matches(p: Patient, q: string): boolean {
  const needle = q.trim().toLowerCase()
  if (!needle) return false
  const owner = getOwner(p.owner)
  return (
    p.name.toLowerCase().includes(needle) ||
    owner.name.toLowerCase().includes(needle) ||
    owner.phone.replace(/\s/g, "").includes(needle.replace(/\s/g, ""))
  )
}

export function PatientSearch() {
  const router = useRouter()
  const [query, setQuery] = React.useState("")
  const [open, setOpen] = React.useState(false)
  const [active, setActive] = React.useState(0)
  const wrapRef = React.useRef<HTMLDivElement>(null)
  const listId = React.useId()

  const results = React.useMemo(() => PATIENTS.filter((p) => matches(p, query)), [query])
  const showPanel = open && query.trim().length > 0

  const go = (id: string) => {
    setOpen(false)
    setQuery("")
    router.push(`/patients/${id}`)
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setOpen(true)
      setActive((i) => (results.length === 0 ? 0 : (i + 1) % results.length))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setActive((i) => (results.length === 0 ? 0 : (i - 1 + results.length) % results.length))
    } else if (e.key === "Enter") {
      const hit = results[active] ?? results[0]
      if (hit) {
        e.preventDefault()
        go(hit.id)
      }
    } else if (e.key === "Escape") {
      setOpen(false)
    }
  }

  const optionId = (id: string) => `${listId}-${id}`
  const activePatient = results[active]

  return (
    <Box
      ref={wrapRef}
      position="relative"
      w="full"
      onBlur={(e) => {
        if (!wrapRef.current?.contains(e.relatedTarget as Node | null)) setOpen(false)
      }}
    >
      <InputGroup
        w="full"
        startElement={<LuSearch aria-hidden />}
        endElement={
          query ? (
            <Text as="span" fontSize="xs" color="fg.muted" pe="2" display={{ base: "none", md: "inline" }}>
              {results.length} found
            </Text>
          ) : undefined
        }
      >
        <Input
          role="combobox"
          aria-label="Search patients and owners"
          aria-expanded={showPanel}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={showPanel && activePatient ? optionId(activePatient.id) : undefined}
          placeholder="Search patient or owner"
          autoComplete="off"
          value={query}
          size="md"
          bg="bg.panel"
          onChange={(e) => {
            setQuery(e.target.value)
            setActive(0)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
        />
      </InputGroup>
      {showPanel && (
        <Box
          id={listId}
          role="listbox"
          aria-label="Matching patients"
          position="absolute"
          top="calc(100% + 6px)"
          insetInline="0"
          zIndex="dropdown"
          bg="bg.panel"
          borderWidth="1px"
          borderRadius="lg"
          boxShadow="lg"
          maxH="22rem"
          overflowY="auto"
          p="1"
        >
          {results.length === 0 ? (
            <Text px="3" py="3" color="fg.muted" fontSize="sm">
              No patient or owner matches &ldquo;{query.trim()}&rdquo;
            </Text>
          ) : (
            results.map((p, i) => {
              const owner = getOwner(p.owner)
              return (
                <Box
                  key={p.id}
                  id={optionId(p.id)}
                  role="option"
                  aria-selected={i === active}
                  tabIndex={-1}
                  px="3"
                  py="2.5"
                  borderRadius="md"
                  cursor="pointer"
                  bg={i === active ? "bg.muted" : undefined}
                  _hover={{ bg: "bg.muted" }}
                  onMouseDown={(e) => e.preventDefault()}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => go(p.id)}
                >
                  <Flex justify="space-between" align="baseline" gap="3">
                    <Text fontWeight="semibold">{p.name}</Text>
                    <Text fontSize="xs" color="fg.muted">
                      {p.species} · {p.breed}
                    </Text>
                  </Flex>
                  <Text fontSize="sm" color="fg.muted">
                    Owner: {owner.name} · {owner.phone}
                  </Text>
                  {p.alerts.length > 0 && (
                    <Box mt="1.5">
                      <AlertChips alerts={p.alerts} size="sm" />
                    </Box>
                  )}
                </Box>
              )
            })
          )}
        </Box>
      )}
      <VisuallyHidden aria-live="polite">
        {showPanel ? `${results.length} ${results.length === 1 ? "match" : "matches"}` : ""}
      </VisuallyHidden>
    </Box>
  )
}
```

```tsx components/Schedule.tsx
"use client"

import * as React from "react"
import NextLink from "next/link"
import {
  Badge,
  Box,
  Button,
  Flex,
  Grid,
  Heading,
  HStack,
  Icon,
  Link,
  SimpleGrid,
  Stack,
  Text,
} from "@chakra-ui/react"
import { LuArrowRight, LuCheck, LuCoffee, LuSiren, LuStethoscope } from "react-icons/lu"
import { SegmentedControl } from "@/components/ui/segmented-control"
import { toaster } from "@/components/ui/toaster"
import { AlertChips } from "@/components/Alerts"
import { StatusBadge } from "@/components/StatusBadge"
import { useClinic } from "@/lib/clinic"
import {
  TODAY,
  VETS,
  endMin,
  fmtDuration,
  fmtLongToday,
  fmtMin,
  fmtTime,
  getOwner,
  getPatient,
  getVet,
  toMin,
  type Appointment,
} from "@/lib/data"

export function Schedule() {
  const { appointments, nowMin } = useClinic()
  const [vetFilter, setVetFilter] = React.useState("all")

  const sorted = React.useMemo(
    () => [...appointments].sort((a, b) => toMin(a.start) - toMin(b.start) || a.id.localeCompare(b.id)),
    [appointments],
  )
  const visible = vetFilter === "all" ? sorted : sorted.filter((a) => a.vet === vetFilter)
  const waiting = appointments
    .filter((a) => a.status === "checked_in")
    .sort((a, b) => (a.checkedInAt ?? 0) - (b.checkedInAt ?? 0))
  const inExam = appointments.filter((a) => a.status === "in_exam")
  const upcoming = sorted.filter((a) => a.status === "booked")
  const urgent = upcoming.filter((a) => a.urgent)
  const next = upcoming[0]
  const nextPatient = next ? getPatient(next.patient) : undefined

  return (
    <Stack gap={{ base: "5", md: "6" }}>
      <Flex justify="space-between" align={{ base: "start", md: "end" }} gap="2" direction={{ base: "column", md: "row" }}>
        <Box>
          <Text color="fg.muted" fontSize="sm">
            {fmtLongToday(TODAY)}
          </Text>
          <Heading as="h1" size={{ base: "2xl", md: "3xl" }}>
            Today&rsquo;s schedule
          </Heading>
        </Box>
        <Text color="fg.muted" fontSize="sm">
          {VETS.length} vets · {appointments.filter((a) => a.status !== "cancelled").length} appointments ·{" "}
          {appointments.filter((a) => a.status === "done").length} done
        </Text>
      </Flex>

      <SimpleGrid columns={{ base: 2, lg: 4 }} gap={{ base: "3", md: "4" }}>
        <Tile label="In exam" value={String(inExam.length)} hint={inExam.map((a) => getPatient(a.patient)?.name).join(", ") || "Nobody"} />
        <Tile
          label="Waiting"
          value={String(waiting.length)}
          hint={waiting.length ? `Longest ${waiting.length ? nowMin - (waiting[0].checkedInAt ?? nowMin) : 0} min` : "Waiting room is clear"}
          accent={waiting.length > 0 ? "blue" : undefined}
        />
        <Tile
          label="Up next"
          value={next ? fmtTime(next.start) : "None"}
          hint={next && nextPatient ? `${nextPatient.name} with ${getVet(next.vet).short}` : "No more bookings"}
        />
        <Tile
          label="Urgent"
          value={String(urgent.length)}
          hint={urgent.map((a) => `${getPatient(a.patient)?.name} ${fmtTime(a.start)}`).join(", ") || "None booked"}
          accent={urgent.length > 0 ? "red" : undefined}
        />
      </SimpleGrid>

      <WaitingList waiting={waiting} nowMin={nowMin} />

      <Box as="section" aria-labelledby="sched-h">
        <Flex justify="space-between" align={{ base: "stretch", md: "center" }} gap="3" mb="3" direction={{ base: "column", md: "row" }}>
          <Heading as="h2" id="sched-h" size="lg">
            All appointments
          </Heading>
          <Box overflowX="auto" maxW="full">
            <SegmentedControl
              aria-label="Filter by vet"
              value={vetFilter}
              onValueChange={(e) => setVetFilter(e.value ?? "all")}
              items={[
                { value: "all", label: "All vets" },
                ...VETS.map((v) => ({ value: v.id, label: v.short })),
              ]}
            />
          </Box>
        </Flex>
        <Box borderWidth="1px" borderRadius="xl" bg="bg.panel" overflow="hidden">
          <Grid
            display={{ base: "none", lg: "grid" }}
            templateColumns="96px minmax(0,1.3fr) minmax(0,1.4fr) minmax(0,1fr) 170px"
            gap="4"
            px="4"
            py="2.5"
            bg="bg.muted"
            borderBottomWidth="1px"
            fontSize="xs"
            fontWeight="semibold"
            color="fg.muted"
            textTransform="uppercase"
            letterSpacing="wider"
            aria-hidden
          >
            <Text>Time</Text>
            <Text>Patient and owner</Text>
            <Text>Reason</Text>
            <Text>Vet</Text>
            <Text>Status</Text>
          </Grid>
          <Box as="ul" listStyle="none" m="0" p="0">
            {visible.length === 0 && (
              <Text p="6" color="fg.muted" textAlign="center">
                No appointments for this vet today.
              </Text>
            )}
            {visible.map((a) => (
              <ScheduleRow key={a.id} appt={a} nowMin={nowMin} />
            ))}
          </Box>
        </Box>
      </Box>
    </Stack>
  )
}

function Tile({ label, value, hint, accent }: { label: string; value: string; hint: string; accent?: "blue" | "red" }) {
  return (
    <Box
      borderWidth="1px"
      borderRadius="xl"
      bg={accent ? `${accent}.subtle` : "bg.panel"}
      borderColor={accent ? `${accent}.muted` : "border"}
      px="4"
      py="3"
      minW="0"
    >
      <Text fontSize="xs" fontWeight="semibold" textTransform="uppercase" letterSpacing="wider" color={accent ? `${accent}.fg` : "fg.muted"}>
        {label}
      </Text>
      <Text fontSize={{ base: "2xl", md: "3xl" }} fontWeight="bold" lineHeight="1.15" color={accent ? `${accent}.fg` : "fg"}>
        {value}
      </Text>
      <Text fontSize="sm" color="fg.muted" truncate>
        {hint}
      </Text>
    </Box>
  )
}

function WaitingList({ waiting, nowMin }: { waiting: Appointment[]; nowMin: number }) {
  const { setStatus } = useClinic()
  return (
    <Box as="section" aria-labelledby="wait-h">
      <HStack mb="3" gap="3">
        <Heading as="h2" id="wait-h" size="lg">
          Waiting room
        </Heading>
        <Badge colorPalette="blue" variant="solid" size="md">
          {waiting.length}
        </Badge>
      </HStack>
      {waiting.length === 0 ? (
        <Flex
          align="center"
          gap="3"
          borderWidth="1px"
          borderStyle="dashed"
          borderRadius="xl"
          px="5"
          py="5"
          color="fg.muted"
          bg="bg.panel"
        >
          <Icon boxSize="6" aria-hidden>
            <LuCoffee />
          </Icon>
          <Text>Nobody is waiting. Checked-in patients appear here with how long they have waited.</Text>
        </Flex>
      ) : (
        <SimpleGrid as="ul" listStyle="none" m="0" p="0" columns={{ base: 1, md: 2, xl: 3 }} gap="3">
          {waiting.map((a, i) => {
            const patient = getPatient(a.patient)
            const waited = Math.max(0, nowMin - (a.checkedInAt ?? nowMin))
            const tone = waited >= 30 ? "red" : waited >= 15 ? "orange" : "fg"
            const vet = getVet(a.vet)
            if (!patient) return null
            return (
              <Box
                as="li"
                key={a.id}
                borderWidth="1px"
                borderRadius="xl"
                bg="bg.panel"
                p="4"
                borderTopWidth="4px"
                borderTopColor={patient.alerts.length ? "red.solid" : "blue.solid"}
              >
                <Flex justify="space-between" align="start" gap="3">
                  <Box minW="0">
                    <Text fontSize="xs" color="fg.muted" fontWeight="semibold">
                      {i === 0 ? "Longest wait" : `#${i + 1} in line`}
                    </Text>
                    <Link asChild fontWeight="bold" fontSize="xl" lineHeight="1.2">
                      <NextLink href={`/patients/${patient.id}`}>{patient.name}</NextLink>
                    </Link>
                    <Text fontSize="sm" color="fg.muted">
                      {patient.species} · {getOwner(patient.owner).name}
                    </Text>
                  </Box>
                  <Box textAlign="end" flexShrink={0}>
                    <Text
                      fontSize="2xl"
                      fontWeight="bold"
                      lineHeight="1.1"
                      color={tone === "fg" ? "fg" : `${tone}.fg`}
                      fontVariantNumeric="tabular-nums"
                    >
                      {waited} min
                    </Text>
                    <Text fontSize="xs" color="fg.muted">
                      waiting since {fmtMin(a.checkedInAt ?? nowMin)}
                    </Text>
                  </Box>
                </Flex>
                {patient.alerts.length > 0 && (
                  <Box mt="2.5">
                    <AlertChips alerts={patient.alerts} />
                  </Box>
                )}
                <Flex mt="3" justify="space-between" align="center" gap="2" wrap="wrap">
                  <Text fontSize="sm">
                    {fmtTime(a.start)} · {a.reason}
                    <Text as="span" color="fg.muted">
                      {" "}
                      · {vet.short}, {vet.room}
                    </Text>
                  </Text>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setStatus(a.id, "in_exam")
                      toaster.create({ type: "info", title: `${patient.name} sent to ${vet.room}`, description: vet.name })
                    }}
                    aria-label={`To exam: ${patient.name}`}
                  >
                    <LuStethoscope aria-hidden /> To exam
                  </Button>
                </Flex>
              </Box>
            )
          })}
        </SimpleGrid>
      )}
    </Box>
  )
}

function ScheduleRow({ appt, nowMin }: { appt: Appointment; nowMin: number }) {
  const { checkIn, setStatus, highlightId } = useClinic()
  const patient = getPatient(appt.patient)
  if (!patient) return null
  const owner = getOwner(patient.owner)
  const vet = getVet(appt.vet)
  const inactive = appt.status === "cancelled"
  const finished = appt.status === "done"
  const isNew = highlightId === appt.id
  const late = appt.status === "booked" && toMin(appt.start) < nowMin - 5

  return (
    <Grid
      as="li"
      templateColumns={{
        base: "minmax(0,1fr) auto",
        md: "96px minmax(0,1fr) 170px",
        lg: "96px minmax(0,1.3fr) minmax(0,1.4fr) minmax(0,1fr) 170px",
      }}
      templateAreas={{
        base: `"time action" "patient action" "reason reason" "vet vet"`,
        md: `"time patient action" "time reason action" "time vet action"`,
        lg: `"time patient reason vet action"`,
      }}
      columnGap="4"
      rowGap="1.5"
      alignItems={{ lg: "center" }}
      px="4"
      py="3.5"
      borderTopWidth="1px"
      borderStartWidth="4px"
      borderStartColor={appt.urgent && !inactive ? "red.solid" : appt.status === "in_exam" ? "purple.solid" : appt.status === "checked_in" ? "blue.solid" : "transparent"}
      bg={appt.urgent && !inactive ? "red.subtle" : isNew ? "teal.subtle" : appt.status === "in_exam" ? "purple.subtle" : inactive ? "bg.muted" : undefined}
      _first={{ borderTopWidth: "0" }}
      aria-label={`${fmtTime(appt.start)} ${patient.name}, ${appt.status.replace("_", " ")}`}
    >
      <Box gridArea="time">
        <Text fontWeight="bold" fontSize="lg" lineHeight="1.2" fontVariantNumeric="tabular-nums">
          {fmtTime(appt.start)}
        </Text>
        <Text fontSize="xs" color="fg.muted">
          to {fmtMin(endMin(appt))} · {fmtDuration(appt.minutes)}
        </Text>
      </Box>

      <Box gridArea="patient" minW="0">
        <HStack gap="2" wrap="wrap">
          <Link asChild fontWeight="bold" fontSize="md" textDecoration={inactive ? "line-through" : undefined}>
            <NextLink href={`/patients/${patient.id}`}>{patient.name}</NextLink>
          </Link>
          <Text as="span" fontSize="sm" color="fg.muted">
            {patient.species}, {patient.breed}
          </Text>
        </HStack>
        <Text fontSize="sm" color="fg.muted">
          {owner.name} · {owner.phone}
        </Text>
        {patient.alerts.length > 0 && !finished && !inactive && (
          <Box mt="1.5">
            <AlertChips alerts={patient.alerts} size="sm" />
          </Box>
        )}
      </Box>

      <Box gridArea="reason" minW="0">
        {appt.urgent && !inactive && (
          <Badge colorPalette="red" variant="solid" size="md" gap="1" mb="1" textTransform="uppercase">
            <LuSiren aria-hidden /> Urgent
          </Badge>
        )}
        <Text fontWeight={appt.urgent ? "semibold" : "normal"} textDecoration={inactive ? "line-through" : undefined}>
          {appt.reason}
        </Text>
      </Box>

      <Box gridArea="vet" minW="0">
        <Text fontSize="sm" fontWeight="medium">
          {vet.name}
        </Text>
        <Text fontSize="xs" color="fg.muted">
          {vet.room}
        </Text>
      </Box>

      <Stack gridArea="action" gap="2" align={{ base: "end", lg: "start" }}>
        <StatusBadge status={appt.status} />
        {late && (
          <Text fontSize="xs" color="orange.fg" fontWeight="semibold">
            Not arrived
          </Text>
        )}
        {appt.status === "booked" && (
          <Button
            size="sm"
            colorPalette="teal" bg="teal.700" _hover={{ bg: "teal.800" }}
            onClick={() => {
              checkIn(appt.id)
              toaster.create({
                type: "success",
                title: `${patient.name} checked in`,
                description: `${owner.name} is in the waiting room for ${vet.name}.`,
              })
            }}
            aria-label={`Check in ${patient.name}`}
          >
            <LuCheck aria-hidden /> Check in
          </Button>
        )}
        {appt.status === "checked_in" && (
          <Button size="sm" variant="outline" onClick={() => setStatus(appt.id, "in_exam")} aria-label={`To exam: ${patient.name}`}>
            <LuArrowRight aria-hidden /> To exam
          </Button>
        )}
        {appt.status === "in_exam" && (
          <Button size="sm" variant="outline" onClick={() => setStatus(appt.id, "done")} aria-label={`Mark done: ${patient.name}`}>
            <LuCheck aria-hidden /> Mark done
          </Button>
        )}
      </Stack>
    </Grid>
  )
}
```

```tsx components/StatusBadge.tsx
import { Badge } from "@chakra-ui/react"
import { statusLabel, type Status } from "@/lib/data"

const palette: Record<Status, { colorPalette: string; variant: "solid" | "subtle" | "outline" }> = {
  booked: { colorPalette: "gray", variant: "outline" },
  checked_in: { colorPalette: "blue", variant: "solid" },
  in_exam: { colorPalette: "purple", variant: "solid" },
  done: { colorPalette: "green", variant: "subtle" },
  cancelled: { colorPalette: "gray", variant: "subtle" },
}

export function StatusBadge({ status }: { status: Status }) {
  const p = palette[status]
  return (
    <Badge colorPalette={p.colorPalette} variant={p.variant} size="md" textTransform="none">
      {statusLabel[status]}
    </Badge>
  )
}
```

```tsx lib/clinic.tsx
"use client"

import * as React from "react"
import {
  APPOINTMENTS,
  CLOSE_MIN,
  START_NOW_MIN,
  findClash,
  getPatient,
  minToHHMM,
  toMin,
  type Appointment,
  type Status,
} from "./data"

export interface BookingInput {
  patient: string
  vet: string
  start: string
  minutes: number
  reason: string
  urgent: boolean
}

export type BookResult = { ok: true; appointment: Appointment } | { ok: false; error: string }

interface ClinicState {
  appointments: Appointment[]
  nowMin: number
  highlightId: string | null
  bookingOpen: boolean
  bookingPatient: string | undefined
  checkIn: (id: string) => void
  setStatus: (id: string, status: Status) => void
  book: (input: BookingInput) => BookResult
  openBooking: (patientId?: string) => void
  closeBooking: () => void
}

const ClinicContext = React.createContext<ClinicState | null>(null)

export function ClinicProvider({ children }: { children: React.ReactNode }) {
  const [appointments, setAppointments] = React.useState<Appointment[]>(APPOINTMENTS)
  const [nowMin, setNowMin] = React.useState(START_NOW_MIN)
  const [highlightId, setHighlightId] = React.useState<string | null>(null)
  const [bookingOpen, setBookingOpen] = React.useState(false)
  const [bookingPatient, setBookingPatient] = React.useState<string | undefined>(undefined)
  const nowRef = React.useRef(nowMin)
  const apptsRef = React.useRef(appointments)

  React.useEffect(() => {
    nowRef.current = nowMin
  }, [nowMin])
  React.useEffect(() => {
    apptsRef.current = appointments
  }, [appointments])

  // The desk clock runs one clinic minute per real minute from 9:40 AM.
  React.useEffect(() => {
    const t = window.setInterval(() => setNowMin((n) => n + 1), 60000)
    return () => window.clearInterval(t)
  }, [])

  React.useEffect(() => {
    if (!highlightId) return
    const t = window.setTimeout(() => setHighlightId(null), 6000)
    return () => window.clearTimeout(t)
  }, [highlightId])

  const checkIn = React.useCallback((id: string) => {
    setAppointments((list) =>
      list.map((a) =>
        a.id === id && a.status === "booked"
          ? { ...a, status: "checked_in" as Status, checkedInAt: nowRef.current }
          : a,
      ),
    )
  }, [])

  const setStatus = React.useCallback((id: string, status: Status) => {
    setAppointments((list) => list.map((a) => (a.id === id ? { ...a, status } : a)))
  }, [])

  const book = React.useCallback((input: BookingInput): BookResult => {
    const patient = getPatient(input.patient)
    if (!patient) return { ok: false, error: "Pick a patient first." }
    const startM = toMin(input.start)
    if (startM + input.minutes > CLOSE_MIN) {
      return { ok: false, error: "That visit would run past closing time." }
    }
    const clash = findClash(apptsRef.current, input.vet, startM, input.minutes)
    if (clash) {
      return { ok: false, error: "That vet already has a booking in this time." }
    }
    const appointment: Appointment = {
      id: `a-${String(apptsRef.current.length + 1).padStart(2, "0")}`,
      patient: input.patient,
      vet: input.vet,
      start: minToHHMM(startM),
      minutes: input.minutes,
      reason: input.reason.trim(),
      status: "booked",
      ...(input.urgent ? { urgent: true } : {}),
    }
    apptsRef.current = [...apptsRef.current, appointment]
    setAppointments(apptsRef.current)
    setHighlightId(appointment.id)
    return { ok: true, appointment }
  }, [])

  const openBooking = React.useCallback((patientId?: string) => {
    setBookingPatient(patientId)
    setBookingOpen(true)
  }, [])
  const closeBooking = React.useCallback(() => setBookingOpen(false), [])

  const value = React.useMemo<ClinicState>(
    () => ({
      appointments,
      nowMin,
      highlightId,
      bookingOpen,
      bookingPatient,
      checkIn,
      setStatus,
      book,
      openBooking,
      closeBooking,
    }),
    [appointments, nowMin, highlightId, bookingOpen, bookingPatient, checkIn, setStatus, book, openBooking, closeBooking],
  )

  return <ClinicContext.Provider value={value}>{children}</ClinicContext.Provider>
}

export function useClinic(): ClinicState {
  const ctx = React.useContext(ClinicContext)
  if (!ctx) throw new Error("useClinic must be used inside ClinicProvider")
  return ctx
}
```

```ts lib/data.ts
export type Status = "booked" | "checked_in" | "in_exam" | "done" | "cancelled"

export interface Vet {
  id: string
  name: string
  short: string
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
  /** Minutes since midnight at which the patient was checked in. */
  checkedInAt?: number
}

export interface Weight {
  date: string
  kg: number
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

export interface PatientRecord {
  weights_kg: Weight[]
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

/** The clinic clock the desk starts the day on: 9:40 AM. */
export const START_NOW_MIN = 9 * 60 + 40

export const OPEN_MIN = 8 * 60
export const CLOSE_MIN = 18 * 60

export const USER = { name: "Rosa Lindqvist", role: "Receptionist" }

export const VETS: Vet[] = [
  { id: "v-1", name: "Dr. Amara Osei", short: "Osei", room: "Exam 1" },
  { id: "v-2", name: "Dr. Tomás Reyes", short: "Reyes", room: "Exam 2" },
  { id: "v-3", name: "Dr. Helen Park", short: "Park", room: "Surgery" },
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
]

export const APPOINTMENTS: Appointment[] = [
  { id: "a-01", patient: "p-101", vet: "v-1", start: "08:30", minutes: 20, reason: "Annual vaccination", status: "done" },
  { id: "a-02", patient: "p-104", vet: "v-2", start: "08:30", minutes: 30, reason: "Kidney panel recheck", status: "done" },
  { id: "a-03", patient: "p-108", vet: "v-3", start: "08:00", minutes: 120, reason: "Soft palate surgery", status: "in_exam" },
  { id: "a-04", patient: "p-102", vet: "v-1", start: "09:00", minutes: 30, reason: "Limping, left hind leg", status: "in_exam" },
  { id: "a-05", patient: "p-107", vet: "v-2", start: "09:15", minutes: 20, reason: "Glucose curve", status: "checked_in", checkedInAt: 9 * 60 + 8 },
  { id: "a-06", patient: "p-105", vet: "v-1", start: "09:45", minutes: 20, reason: "Beak and nail trim", status: "checked_in", checkedInAt: 9 * 60 + 31 },
  { id: "a-07", patient: "p-103", vet: "v-2", start: "10:00", minutes: 30, reason: "Senior wellness exam", status: "booked" },
  { id: "a-08", patient: "p-106", vet: "v-1", start: "10:30", minutes: 20, reason: "Not eating since yesterday", status: "booked", urgent: true },
  { id: "a-09", patient: "p-104", vet: "v-3", start: "11:00", minutes: 45, reason: "Dental cleaning", status: "booked" },
  { id: "a-10", patient: "p-101", vet: "v-2", start: "11:30", minutes: 20, reason: "Ear infection follow-up", status: "booked" },
  { id: "a-11", patient: "p-107", vet: "v-1", start: "13:30", minutes: 30, reason: "Dental check", status: "booked" },
  { id: "a-12", patient: "p-103", vet: "v-3", start: "14:00", minutes: 60, reason: "Lump removal", status: "cancelled" },
  { id: "a-13", patient: "p-102", vet: "v-2", start: "15:00", minutes: 20, reason: "X-ray results", status: "booked" },
]

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
      {
        date: "2026-11-12",
        vet: "v-2",
        reason: "Kidney panel recheck",
        notes:
          "Creatinine 2.1 mg/dL (was 2.0). Weight down 0.6 kg. Continue benazepril, recheck in 3 months.",
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
}

export const statusLabel: Record<Status, string> = {
  booked: "Booked",
  checked_in: "Checked in",
  in_exam: "In exam",
  done: "Done",
  cancelled: "Cancelled",
}

export function getPatient(id: string): Patient | undefined {
  return PATIENTS.find((p) => p.id === id)
}

export function getOwner(id: string): Owner {
  return OWNERS.find((o) => o.id === id) ?? { id, name: "Unknown owner", phone: "" }
}

export function getVet(id: string): Vet {
  return VETS.find((v) => v.id === id) ?? { id, name: "Unassigned", short: "?", room: "" }
}

export function toMin(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number)
  return h * 60 + m
}

export function fmtMin(total: number): string {
  const h24 = Math.floor(total / 60)
  const m = total % 60
  const suffix = h24 >= 12 ? "PM" : "AM"
  const h = h24 % 12 === 0 ? 12 : h24 % 12
  return `${h}:${String(m).padStart(2, "0")} ${suffix}`
}

export function fmtTime(hhmm: string): string {
  return fmtMin(toMin(hhmm))
}

export function endMin(a: Pick<Appointment, "start" | "minutes">): number {
  return toMin(a.start) + a.minutes
}

export function minToHHMM(total: number): string {
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
const MONTHS_LONG = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
]

function parts(iso: string): [number, number, number] {
  const [y, m, d] = iso.split("-").map(Number)
  return [y, m, d]
}

export function fmtDate(iso: string): string {
  const [y, m, d] = parts(iso)
  return `${MONTHS[m - 1]} ${d}, ${y}`
}

export function fmtDateShort(iso: string): string {
  const [y, m] = parts(iso)
  return `${MONTHS[m - 1]} ${String(y).slice(2)}`
}

export function fmtLongToday(iso: string): string {
  const [y, m, d] = parts(iso)
  const dow = new Date(Date.UTC(y, m - 1, d)).getUTCDay()
  return `${DAYS[dow]}, ${MONTHS_LONG[m - 1]} ${d}, ${y}`
}

export function daysBetween(fromIso: string, toIso: string): number {
  const [fy, fm, fd] = parts(fromIso)
  const [ty, tm, td] = parts(toIso)
  return Math.round((Date.UTC(ty, tm - 1, td) - Date.UTC(fy, fm - 1, fd)) / 86400000)
}

export function ageOn(born: string, onIso: string): string {
  const [by, bm, bd] = parts(born)
  const [ty, tm, td] = parts(onIso)
  let months = (ty - by) * 12 + (tm - bm)
  if (td < bd) months -= 1
  const years = Math.floor(months / 12)
  const rest = months % 12
  if (years === 0) return `${rest} month${rest === 1 ? "" : "s"}`
  if (rest === 0) return `${years} year${years === 1 ? "" : "s"}`
  return `${years} year${years === 1 ? "" : "s"} ${rest} mo`
}

export function fmtDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m === 0 ? `${h} h` : `${h} h ${m} min`
}

export function fmtMoney(v: number): string {
  return `$${v.toFixed(2)}`
}

export type VaccineState = "overdue" | "soon" | "ok"

export function vaccineState(due: string, today: string = TODAY): { state: VaccineState; days: number } {
  const days = daysBetween(today, due)
  if (days < 0) return { state: "overdue", days: -days }
  if (days <= 45) return { state: "soon", days }
  return { state: "ok", days }
}

/** The appointment of the same vet that overlaps the given slot, if any. Cancelled bookings never block. */
export function findClash(
  appointments: Appointment[],
  vetId: string,
  startMin: number,
  minutes: number,
  ignoreId?: string,
): Appointment | undefined {
  const endM = startMin + minutes
  return appointments.find(
    (a) =>
      a.vet === vetId &&
      a.id !== ignoreId &&
      a.status !== "cancelled" &&
      startMin < endMin(a) &&
      toMin(a.start) < endM,
  )
}
```

