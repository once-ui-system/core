```tsx app/layout.tsx
import type { Metadata, Viewport } from "next";
import { EmotionRegistry } from "@/components/ui/emotion-registry";
import { Provider } from "@/components/ui/provider";
import { Toaster } from "@/components/ui/toaster";
import { ClinicProvider } from "@/lib/clinic-store";

export const metadata: Metadata = {
  title: "Pawpoint - Hillside Veterinary Clinic front desk",
  description: "Front-desk and records software for Hillside Veterinary Clinic",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <EmotionRegistry>
          <Provider>
            <ClinicProvider>{children}</ClinicProvider>
            <Toaster />
          </Provider>
        </EmotionRegistry>
      </body>
    </html>
  );
}
```

```tsx app/page.tsx
import { AppShell } from "@/components/AppShell"
import { Schedule } from "@/components/Schedule"

export default function Page() {
  return (
    <AppShell>
      <Schedule />
    </AppShell>
  )
}
```

```tsx app/patients/[id]/page.tsx
import { notFound } from "next/navigation"
import { AppShell } from "@/components/AppShell"
import { PatientView } from "@/components/PatientView"
import { PATIENTS, patientById } from "@/lib/data"

export function generateStaticParams() {
  return PATIENTS.map((p) => ({ id: p.id }))
}

export default async function PatientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const patient = patientById(id)
  if (!patient) notFound()
  return (
    <AppShell>
      <PatientView id={id} />
    </AppShell>
  )
}
```

```tsx components/AlertBadges.tsx
"use client"

import { Badge, Flex, VisuallyHidden } from "@chakra-ui/react"
import { LuTriangleAlert } from "react-icons/lu"

/** Medical alerts as solid red chips: used wherever a patient shows up. */
export function AlertBadges({
  alerts,
  size = "sm",
}: {
  alerts: string[]
  size?: "xs" | "sm" | "md" | "lg"
}) {
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
          whiteSpace="normal"
          textAlign="start"
          gap="1.5"
          fontWeight="semibold"
        >
          <LuTriangleAlert aria-hidden="true" />
          <VisuallyHidden>Medical alert: </VisuallyHidden>
          {alert}
        </Badge>
      ))}
    </Flex>
  )
}
```

```tsx components/AppShell.tsx
"use client"

import { Box, Flex, Heading, Text } from "@chakra-ui/react"
import NextLink from "next/link"
import { LuPawPrint } from "react-icons/lu"
import { Avatar } from "@/components/ui/avatar"
import { ColorModeButton } from "@/components/ui/color-mode"
import { CLINIC, CLINIC_FULL, USER } from "@/lib/data"
import { PatientSearch } from "./PatientSearch"

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <Flex direction="column" minH="100dvh" bg="bg.muted" colorPalette="teal">
      <Box
        asChild
        position="absolute"
        left="-9999px"
        _focus={{ left: "4", top: "4", zIndex: "toast", bg: "bg.panel", px: "4", py: "2", borderRadius: "md", shadow: "lg" }}
      >
        <a href="#main">Skip to main content</a>
      </Box>

      <Box as="header" bg="bg.panel" borderBottomWidth="1px" position="sticky" top="0" zIndex="sticky">
        <Flex
          maxW="1440px"
          mx="auto"
          px={{ base: "4", md: "6" }}
          py="3"
          gap={{ base: "3", md: "6" }}
          align="center"
          wrap="wrap"
        >
          <Box asChild>
            <NextLink href="/">
              <Flex align="center" gap="3">
                <Flex boxSize="10" borderRadius="xl" bg="teal.700" color="white" align="center" justify="center">
                  <LuPawPrint size={22} aria-hidden="true" />
                </Flex>
                <Box lineHeight="1.1">
                  <Heading as="p" size="lg" fontWeight="bold" letterSpacing="-0.02em">
                    {CLINIC}
                  </Heading>
                  <Text fontSize="xs" color="fg.muted" display={{ base: "none", sm: "block" }}>
                    {CLINIC_FULL}
                  </Text>
                </Box>
              </Flex>
            </NextLink>
          </Box>

          <Box
            flex="1"
            minW={{ base: "100%", md: "0" }}
            maxW={{ md: "lg" }}
            order={{ base: 3, md: 0 }}
            ml={{ md: "auto" }}
          >
            <PatientSearch />
          </Box>

          <Flex align="center" gap="3" ml="auto">
            <ColorModeButton />
            <Flex align="center" gap="2.5">
              <Avatar name={USER.name} size="sm" colorPalette="teal" />
              <Box lineHeight="1.2" display={{ base: "none", sm: "block" }}>
                <Text fontSize="sm" fontWeight="medium">
                  {USER.name}
                </Text>
                <Text fontSize="xs" color="fg.muted">
                  {USER.role}
                </Text>
              </Box>
            </Flex>
          </Flex>
        </Flex>
      </Box>

      <Box as="main" id="main" flex="1" maxW="1440px" w="full" mx="auto" px={{ base: "4", md: "6" }} py={{ base: "4", md: "6" }}>
        {children}
      </Box>
    </Flex>
  )
}
```

```tsx components/BookingDialog.tsx
"use client"

import { Box, Button, Flex, Input, SimpleGrid, Stack, Text } from "@chakra-ui/react"
import * as React from "react"
import { Alert } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
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
import { NativeSelectField, NativeSelectRoot } from "@/components/ui/native-select"
import { toaster } from "@/components/ui/toaster"
import { useClinic } from "@/lib/clinic-store"
import {
  PATIENTS,
  SLOTS,
  VETS,
  findClash,
  formatTime,
  fromMinutes,
  nextFree,
  ownerById,
  patientById,
  toMinutes,
  vetById,
} from "@/lib/data"
import { AlertBadges } from "./AlertBadges"

const DURATIONS = [15, 20, 30, 45, 60, 90, 120]

export function BookingDialog({
  open,
  onOpenChange,
  defaultPatient = "",
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultPatient?: string
}) {
  return (
    <DialogRoot
      open={open}
      onOpenChange={(e) => onOpenChange(e.open)}
      placement="center"
      scrollBehavior="inside"
      lazyMount
      unmountOnExit
    >
      <DialogContent mx="4">
        <BookingForm defaultPatient={defaultPatient} onDone={() => onOpenChange(false)} />
      </DialogContent>
    </DialogRoot>
  )
}

function BookingForm({ defaultPatient, onDone }: { defaultPatient: string; onDone: () => void }) {
  const { appointments, book, now } = useClinic()
  const [patientId, setPatientId] = React.useState(defaultPatient)
  const [vetId, setVetId] = React.useState(VETS[0].id)
  const [minutes, setMinutes] = React.useState(20)
  const [start, setStart] = React.useState(
    () => nextFree(appointments, VETS[0].id, 20, now) ?? "16:00",
  )
  const [reason, setReason] = React.useState("Follow-up visit")
  const [urgent, setUrgent] = React.useState(false)
  const [submitted, setSubmitted] = React.useState(false)

  const patient = patientById(patientId)
  const owner = patient ? ownerById(patient.owner) : undefined
  const clash = findClash(appointments, vetId, start, minutes)
  const suggestion = clash ? nextFree(appointments, vetId, minutes, toMinutes(start)) : null

  const patientError = submitted && !patientId
  const reasonError = submitted && reason.trim() === ""

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    if (!patientId || reason.trim() === "" || clash) return
    const result = book({ patient: patientId, vet: vetId, start, minutes, reason: reason.trim(), urgent: urgent || undefined })
    if (!result.ok) return
    toaster.create({
      type: "success",
      title: `Booked ${patient?.name} at ${formatTime(start)}`,
      description: `${vetById(vetId)?.name}, ${vetById(vetId)?.room}. It is on today's schedule.`,
      closable: true,
    })
    onDone()
  }

  return (
    <form onSubmit={submit} noValidate>
      <DialogHeader>
        <DialogTitle>Book an appointment</DialogTitle>
        <Text color="fg.muted" fontSize="sm">
          Today, pick a patient, a vet and a time. Booked times for each vet are blocked.
        </Text>
      </DialogHeader>
      <DialogCloseTrigger />
      <DialogBody>
        <Stack gap="4">
          <Field label="Patient" invalid={patientError} errorText="Choose a patient to book.">
            <NativeSelectRoot>
              <NativeSelectField
                placeholder="Choose a patient"
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
              >
                {PATIENTS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.species}) - {ownerById(p.owner)?.name}
                  </option>
                ))}
              </NativeSelectField>
            </NativeSelectRoot>
          </Field>

          {patient && (
            <Box bg="bg.muted" borderRadius="md" p="3">
              <Text fontSize="sm" mb={patient.alerts.length ? "2" : "0"}>
                {patient.breed}. Owner {owner?.name}, {owner?.phone}.
              </Text>
              <AlertBadges alerts={patient.alerts} />
            </Box>
          )}

          <Field label="Vet">
            <NativeSelectRoot>
              <NativeSelectField value={vetId} onChange={(e) => setVetId(e.target.value)}>
                {VETS.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.room})
                  </option>
                ))}
              </NativeSelectField>
            </NativeSelectRoot>
          </Field>

          <SimpleGrid columns={2} gap="4">
            <Field label="Start time">
              <NativeSelectRoot>
                <NativeSelectField value={start} onChange={(e) => setStart(e.target.value)}>
                  {SLOTS.map((s) => {
                    const busy = !!findClash(appointments, vetId, s, minutes)
                    return (
                      <option key={s} value={s} disabled={busy && s !== start}>
                        {formatTime(s)}
                        {busy ? " (busy)" : ""}
                      </option>
                    )
                  })}
                </NativeSelectField>
              </NativeSelectRoot>
            </Field>
            <Field label="Length">
              <NativeSelectRoot>
                <NativeSelectField
                  value={String(minutes)}
                  onChange={(e) => setMinutes(Number(e.target.value))}
                >
                  {DURATIONS.map((d) => (
                    <option key={d} value={d}>
                      {d} min
                    </option>
                  ))}
                </NativeSelectField>
              </NativeSelectRoot>
            </Field>
          </SimpleGrid>

          {clash && (
            <Alert status="error" title="That time clashes" role="alert">
              {vetById(vetId)?.name} already has {patientById(clash.patient)?.name} ({clash.reason}) from{" "}
              {formatTime(clash.start)} to {formatTime(fromMinutes(toMinutes(clash.start) + clash.minutes))}.
              {suggestion ? (
                <Button size="xs" variant="outline" colorPalette="red" mt="2" display="flex" onClick={() => setStart(suggestion)}>
                  Use next free time, {formatTime(suggestion)}
                </Button>
              ) : (
                " No later free time today."
              )}
            </Alert>
          )}

          <Field label="Reason for visit" invalid={reasonError} errorText="Add a reason for the visit.">
            <Input value={reason} onChange={(e) => setReason(e.target.value)} />
          </Field>

          <Checkbox colorPalette="red" checked={urgent} onCheckedChange={(e) => setUrgent(!!e.checked)}>
            Urgent visit
          </Checkbox>
        </Stack>
      </DialogBody>
      <DialogFooter>
        <Flex gap="3" w="full" justify="flex-end" wrap="wrap">
          <Button variant="outline" type="button" onClick={onDone}>
            Cancel
          </Button>
          <Button type="submit" colorPalette="teal" bg="teal.700" _hover={{ bg: "teal.800" }} disabled={!!clash}>
            Book appointment
          </Button>
        </Flex>
      </DialogFooter>
    </form>
  )
}
```

```tsx components/PatientSearch.tsx
"use client"

import { Box, Flex, Input, Text, VisuallyHidden } from "@chakra-ui/react"
import NextLink from "next/link"
import { useRouter } from "next/navigation"
import * as React from "react"
import { LuSearch } from "react-icons/lu"
import { InputGroup } from "@/components/ui/input-group"
import { PATIENTS, ownerById } from "@/lib/data"
import { AlertBadges } from "./AlertBadges"

export function PatientSearch() {
  const router = useRouter()
  const [q, setQ] = React.useState("")
  const [open, setOpen] = React.useState(false)
  const wrapRef = React.useRef<HTMLDivElement>(null)
  const listId = React.useId()

  const query = q.trim().toLowerCase()
  const results = React.useMemo(() => {
    if (!query) return []
    return PATIENTS.filter((p) => {
      const owner = ownerById(p.owner)
      return (
        p.name.toLowerCase().includes(query) ||
        (owner?.name.toLowerCase().includes(query) ?? false)
      )
    })
  }, [query])

  const close = () => {
    setOpen(false)
  }

  const go = (id: string) => {
    close()
    setQ("")
    router.push(`/patients/${id}`)
  }

  return (
    <Box
      ref={wrapRef}
      position="relative"
      w="full"
      onBlur={(e) => {
        if (!wrapRef.current?.contains(e.relatedTarget as Node | null)) close()
      }}
    >
      <label htmlFor={`${listId}-input`}>
        <VisuallyHidden>Search patients or owners</VisuallyHidden>
      </label>
      <InputGroup w="full" startElement={<LuSearch aria-hidden="true" />}>
        <Input
          id={`${listId}-input`}
          type="search"
          autoComplete="off"
          placeholder="Search patient or owner"
          value={q}
          bg="bg.muted"
          borderRadius="full"
          size="md"
          onChange={(e) => {
            setQ(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Escape") close()
            if (e.key === "Enter" && results[0]) go(results[0].id)
          }}
        />
      </InputGroup>

      <div aria-live="polite" role="status">
        <VisuallyHidden>
          {query ? `${results.length} ${results.length === 1 ? "match" : "matches"}` : ""}
        </VisuallyHidden>
      </div>

      {open && query.length > 0 && (
        <Box
          id={listId}
          position="absolute"
          top="calc(100% + 6px)"
          insetX="0"
          zIndex="popover"
          bg="bg.panel"
          borderWidth="1px"
          borderRadius="lg"
          shadow="lg"
          overflow="hidden"
          maxH="70dvh"
          overflowY="auto"
        >
          {results.length === 0 ? (
            <Text p="4" color="fg.muted" fontSize="sm">
              No patient or owner matches &ldquo;{q.trim()}&rdquo;.
            </Text>
          ) : (
            <Box as="ul" listStyleType="none" m="0" p="0">
              {results.map((p) => {
                const owner = ownerById(p.owner)
                return (
                  <li key={p.id}>
                    <Box
                      asChild
                      display="block"
                      px="4"
                      py="3"
                      minH="12"
                      borderBottomWidth="1px"
                      _hover={{ bg: "bg.muted" }}
                      _focusVisible={{ bg: "bg.muted", outline: "2px solid", outlineColor: "colorPalette.focusRing" }}
                    >
                      <NextLink href={`/patients/${p.id}`} onClick={() => {
                          close()
                          setQ("")
                        }}>
                        <Flex justify="space-between" gap="3" align="baseline" wrap="wrap">
                          <Text fontWeight="semibold">{p.name}</Text>
                          <Text fontSize="sm" color="fg.muted">
                            {p.species}, {p.breed}
                          </Text>
                        </Flex>
                        <Text fontSize="sm" color="fg.muted" mb={p.alerts.length ? "1.5" : "0"}>
                          Owner: {owner?.name}
                        </Text>
                        <AlertBadges alerts={p.alerts} size="xs" />
                      </NextLink>
                    </Box>
                  </li>
                )
              })}
            </Box>
          )}
        </Box>
      )}
    </Box>
  )
}
```

```tsx components/PatientView.tsx
"use client"

import { Chart, useChart } from "@chakra-ui/charts"
import {
  Badge,
  Box,
  Button,
  Flex,
  Heading,
  SimpleGrid,
  Stack,
  Table,
  Text,
  VisuallyHidden,
} from "@chakra-ui/react"
import NextLink from "next/link"
import * as React from "react"
import { LuArrowLeft, LuCalendarPlus, LuCheck, LuPhone, LuPill, LuSyringe, LuTriangleAlert } from "react-icons/lu"
import { CartesianGrid, Line, LineChart, Tooltip, XAxis, YAxis } from "recharts"
import { Avatar } from "@/components/ui/avatar"
import { toaster } from "@/components/ui/toaster"
import { useClinic } from "@/lib/clinic-store"
import {
  PATIENTS,
  RECORDS,
  TODAY,
  ageLabel,
  formatDate,
  formatTime,
  ownerById,
  patientById,
  usd,
  vaccineState,
  vetById,
} from "@/lib/data"
import { BookingDialog } from "./BookingDialog"
import { StatusBadge } from "./Schedule"

function Panel({
  title,
  icon,
  children,
  id,
}: {
  title: string
  icon?: React.ReactNode
  children: React.ReactNode
  id: string
}) {
  return (
    <Box as="section" aria-labelledby={id} bg="bg.panel" borderWidth="1px" borderRadius="lg" overflow="hidden">
      <Flex px={{ base: "4", md: "5" }} py="3" borderBottomWidth="1px" align="center" gap="2">
        {icon}
        <Heading as="h2" id={id} size="md">
          {title}
        </Heading>
      </Flex>
      <Box p={{ base: "4", md: "5" }}>{children}</Box>
    </Box>
  )
}

export function PatientView({ id }: { id: string }) {
  const patient = patientById(id)
  const record = RECORDS[id]
  const { appointments, checkIn, now } = useClinic()
  const [bookOpen, setBookOpen] = React.useState(false)

  if (!patient) return null
  const owner = ownerById(patient.owner)
  const siblings = PATIENTS.filter((p) => p.owner === patient.owner && p.id !== patient.id)
  const todays = appointments.filter((a) => a.patient === patient.id && a.status !== "cancelled")
  const overdue = record?.vaccinations.filter((v) => vaccineState(v.due).state === "overdue") ?? []

  return (
    <Stack gap="5">
      <Box asChild alignSelf="flex-start" color="fg.muted" _hover={{ color: "fg" }}>
        <NextLink href="/">
          <Flex align="center" gap="2" minH="8">
            <LuArrowLeft aria-hidden="true" /> Today&rsquo;s schedule
          </Flex>
        </NextLink>
      </Box>

      <Flex
        bg="bg.panel"
        borderWidth="1px"
        borderRadius="lg"
        p={{ base: "4", md: "6" }}
        gap="5"
        direction={{ base: "column", md: "row" }}
        justify="space-between"
        align={{ md: "center" }}
      >
        <Flex gap="4" align="center">
          <Avatar name={patient.name} size="2xl" colorPalette="teal" />
          <Box>
            <Heading as="h1" size={{ base: "3xl", md: "4xl" }} letterSpacing="-0.02em">
              {patient.name}
            </Heading>
            <Text color="fg.muted">
              {patient.breed} | {patient.species} | {patient.sex}
            </Text>
            <Text color="fg.muted" fontSize="sm">
              {ageLabel(patient.born)} old, born {formatDate(patient.born)}
            </Text>
          </Box>
        </Flex>
        <Flex gap="3" wrap="wrap">
          <Button size="lg" colorPalette="teal" bg="teal.700" _hover={{ bg: "teal.800" }} onClick={() => setBookOpen(true)}>
            <LuCalendarPlus /> Book follow-up
          </Button>
        </Flex>
      </Flex>

      {patient.alerts.length > 0 && (
        <Box
          role="region"
          aria-label="Medical alerts"
          bg="red.solid"
          color="red.contrast"
          borderRadius="lg"
          p={{ base: "4", md: "5" }}
          borderWidth="2px"
          borderColor="red.emphasized"
        >
          <Flex align="center" gap="2" mb="3">
            <LuTriangleAlert size={26} aria-hidden="true" />
            <Heading as="h2" size="lg" textTransform="uppercase" letterSpacing="0.04em">
              Medical alerts
            </Heading>
          </Flex>
          <Stack as="ul" listStyleType="none" m="0" p="0" gap="2">
            {patient.alerts.map((alert) => (
              <Box as="li" key={alert} fontSize={{ base: "xl", md: "2xl" }} fontWeight="bold" lineHeight="1.2">
                {alert}
              </Box>
            ))}
          </Stack>
        </Box>
      )}

      {overdue.length > 0 && (
        <Flex
          role="status"
          bg="orange.subtle"
          color="orange.fg"
          borderWidth="1px"
          borderColor="orange.muted"
          borderRadius="lg"
          px="4"
          py="3"
          gap="3"
          align="center"
        >
          <LuSyringe aria-hidden="true" />
          <Text fontWeight="semibold">
            {overdue.length} {overdue.length === 1 ? "vaccination is" : "vaccinations are"} overdue as of{" "}
            {formatDate(TODAY)}: {overdue.map((v) => v.name).join(", ")}.
          </Text>
        </Flex>
      )}

      <Flex gap="5" direction={{ base: "column", lg: "row" }} align="flex-start">
        <Stack gap="5" flex="1" minW="0" w="full">
          {record ? (
            <>
              <WeightPanel weights={record.weights_kg} />
              <VisitHistory visits={record.visits} />
            </>
          ) : (
            <Panel title="Medical record" id="norec">
              <Text color="fg.muted">
                No weight, vaccination or visit history is on file for {patient.name} in this workspace.
              </Text>
            </Panel>
          )}
        </Stack>

        <Stack gap="5" w={{ base: "full", lg: "380px" }} flexShrink="0">
          <Panel title="Today" id="today-h">
            {todays.length === 0 ? (
              <Text color="fg.muted">No appointment today.</Text>
            ) : (
              <Stack gap="4">
                {todays.map((a) => (
                  <Box key={a.id}>
                    <Flex justify="space-between" gap="3" align="center">
                      <Text fontWeight="bold">
                        {formatTime(a.start)} | {a.reason}
                      </Text>
                      <StatusBadge status={a.status} />
                    </Flex>
                    <Text fontSize="sm" color="fg.muted">
                      {vetById(a.vet)?.name}, {vetById(a.vet)?.room}
                    </Text>
                    {a.status === "booked" && (
                      <Button
                        mt="2"
                        size="md"
                        colorPalette="teal"
                        bg="teal.700"
                        _hover={{ bg: "teal.800" }}
                        onClick={() => {
                          checkIn(a.id)
                          toaster.create({ type: "success", title: `${patient.name} is checked in`, closable: true })
                        }}
                      >
                        <LuCheck /> Check in
                      </Button>
                    )}
                    {a.status === "checked_in" && (
                      <Text fontSize="sm" mt="1" color="orange.fg" fontWeight="semibold">
                        Waiting {Math.max(0, now - (a.checkedInAt ?? now))} min
                      </Text>
                    )}
                  </Box>
                ))}
              </Stack>
            )}
          </Panel>

          <Panel title="Owner" id="owner-h">
            <Text fontWeight="bold" fontSize="lg">
              {owner?.name}
            </Text>
            <Box asChild color="colorPalette.fg" fontWeight="medium">
              <a href={`tel:${owner?.phone.replace(/\s/g, "")}`}>
                <Flex align="center" gap="2" minH="8">
                  <LuPhone aria-hidden="true" /> {owner?.phone}
                </Flex>
              </a>
            </Box>
            {siblings.length > 0 && (
              <Box mt="3" pt="3" borderTopWidth="1px">
                <Text fontSize="sm" color="fg.muted" mb="2">
                  Other pets
                </Text>
                <Stack gap="2">
                  {siblings.map((s) => (
                    <Box key={s.id}>
                      <Box asChild fontWeight="semibold" _hover={{ textDecoration: "underline" }}>
                        <NextLink href={`/patients/${s.id}`}>
                          {s.name} <Text as="span" color="fg.muted" fontWeight="normal">({s.species})</Text>
                        </NextLink>
                      </Box>
                      {s.alerts.length > 0 && (
                        <Box mt="1">
                          <Badge colorPalette="red" variant="solid" size="xs" whiteSpace="normal" gap="1">
                            <LuTriangleAlert aria-hidden="true" />
                            <VisuallyHidden>Medical alert: </VisuallyHidden>
                            {s.alerts.join("; ")}
                          </Badge>
                        </Box>
                      )}
                    </Box>
                  ))}
                </Stack>
              </Box>
            )}
          </Panel>

          {record && (
            <>
              <Panel title="Vaccinations" id="vacc-h" icon={<LuSyringe aria-hidden="true" />}>
                <Stack as="ul" listStyleType="none" m="0" p="0" gap="2.5">
                  {record.vaccinations.map((v) => {
                    const s = vaccineState(v.due)
                    const palette = s.state === "overdue" ? "red" : s.state === "soon" ? "orange" : "green"
                    return (
                      <Flex
                        as="li"
                        key={v.name}
                        justify="space-between"
                        gap="3"
                        align="center"
                        p="3"
                        borderRadius="md"
                        borderWidth="1px"
                        borderColor={s.state === "overdue" ? "red.muted" : "border"}
                        bg={s.state === "overdue" ? "red.subtle" : "transparent"}
                      >
                        <Box>
                          <Text fontWeight="bold">{v.name}</Text>
                          <Text fontSize="sm" color="fg.muted">
                            Given {formatDate(v.given)}
                          </Text>
                          <Text fontSize="sm" color="fg.muted">
                            Due {formatDate(v.due)}
                          </Text>
                        </Box>
                        <Badge colorPalette={palette} variant={s.state === "overdue" ? "solid" : "subtle"} size="md" textAlign="center" whiteSpace="normal">
                          {s.state === "overdue"
                            ? `Overdue ${s.days} days`
                            : s.state === "soon"
                              ? `Due in ${s.days} days`
                              : "Up to date"}
                        </Badge>
                      </Flex>
                    )
                  })}
                </Stack>
              </Panel>

              <Panel title="Current medications" id="meds-h" icon={<LuPill aria-hidden="true" />}>
                <Stack as="ul" listStyleType="none" m="0" p="0" gap="3">
                  {record.medications.map((m) => (
                    <Box as="li" key={m.name}>
                      <Text fontWeight="bold">{m.name}</Text>
                      <Text fontSize="sm">{m.dose}</Text>
                      <Text fontSize="sm" color="fg.muted">
                        Since {formatDate(m.since)}
                      </Text>
                    </Box>
                  ))}
                </Stack>
              </Panel>
            </>
          )}
        </Stack>
      </Flex>

      <BookingDialog open={bookOpen} onOpenChange={setBookOpen} defaultPatient={patient.id} />
    </Stack>
  )
}

function WeightPanel({ weights }: { weights: { date: string; kg: number }[] }) {
  const data = weights.map((w) => ({
    label: `${formatDate(w.date, { month: "short", year: undefined, day: undefined })} '${w.date.slice(2, 4)}`,
    kg: w.kg,
  }))
  const chart = useChart({
    data,
    series: [{ name: "kg", color: "teal.solid" }],
  })
  const first = weights[0]
  const last = weights[weights.length - 1]
  const delta = last.kg - first.kg
  const pct = (delta / first.kg) * 100

  return (
    <Panel title="Weight trend" id="weight-h">
      <Flex gap={{ base: "4", md: "8" }} wrap="wrap" mb="4" align="baseline">
        <Box>
          <Text fontSize="4xl" fontWeight="bold" lineHeight="1" fontVariantNumeric="tabular-nums">
            {last.kg.toFixed(1)} <Text as="span" fontSize="lg" color="fg.muted" fontWeight="medium">kg</Text>
          </Text>
          <Text fontSize="sm" color="fg.muted">
            Latest, {formatDate(last.date)}
          </Text>
        </Box>
        <Box>
          <Text fontSize="2xl" fontWeight="bold" color={delta < 0 ? "orange.fg" : "fg"} fontVariantNumeric="tabular-nums">
            {delta > 0 ? "+" : ""}
            {delta.toFixed(1)} kg ({pct.toFixed(0)}%)
          </Text>
          <Text fontSize="sm" color="fg.muted">
            Since {formatDate(first.date)}, {weights.length} visits
          </Text>
        </Box>
      </Flex>
      <Chart.Root chart={chart} h={{ base: "220px", md: "280px" }} aria-hidden="true">
        <LineChart data={chart.data} responsive margin={{ left: 0, right: 16, top: 8 }}>
          <CartesianGrid stroke={chart.color("border")} vertical={false} />
          <XAxis axisLine={false} dataKey={chart.key("label")} stroke={chart.color("border")} tick={{ fontSize: 12 }} tickMargin={8} interval="preserveStartEnd" />
          <YAxis
            axisLine={false}
            tickLine={false}
            tickMargin={8}
            width={36}
            domain={[(min: number) => Math.floor(min - 1), (max: number) => Math.ceil(max + 1)]}
            stroke={chart.color("border")}
            tick={{ fontSize: 12 }}
          />
          <Tooltip animationDuration={100} cursor={false} content={<Chart.Tooltip />} />
          {chart.series.map((item) => (
            <Line
              key={item.name}
              isAnimationActive={false}
              dataKey={chart.key(item.name)}
              stroke={chart.color(item.color)}
              strokeWidth={3}
              dot={{ r: 4, fill: chart.color(item.color) }}
            />
          ))}
        </LineChart>
      </Chart.Root>
      <VisuallyHidden>
        <Table.Root>
          <Table.Caption>Weight in kilograms at each visit</Table.Caption>
          <Table.Body>
            {weights.map((w) => (
              <Table.Row key={w.date}>
                <Table.Cell>{formatDate(w.date)}</Table.Cell>
                <Table.Cell>{w.kg} kg</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </VisuallyHidden>
    </Panel>
  )
}

function VisitHistory({ visits }: { visits: { date: string; vet: string; reason: string; notes: string; invoice_usd: number }[] }) {
  return (
    <Panel title="Visit history" id="visits-h">
      <Stack as="ol" listStyleType="none" m="0" p="0" gap="0">
        {visits.map((v, i) => (
          <Box
            as="li"
            key={v.date}
            position="relative"
            ps="6"
            pb={i === visits.length - 1 ? "0" : "5"}
            borderStartWidth="2px"
            borderStartColor="border"
            ms="1.5"
          >
            <Box position="absolute" left="-7px" top="1.5" boxSize="3" borderRadius="full" bg={i === 0 ? "colorPalette.solid" : "bg.emphasized"} borderWidth="2px" borderColor="bg.panel" />
            <Flex justify="space-between" gap="3" wrap="wrap" align="baseline">
              <Text fontWeight="bold">
                {formatDate(v.date)} | {v.reason}
              </Text>
              <Text fontSize="sm" color="fg.muted" fontVariantNumeric="tabular-nums">
                {usd(v.invoice_usd)}
              </Text>
            </Flex>
            <Text fontSize="sm" color="fg.muted" mb="1.5">
              {vetById(v.vet)?.name}
            </Text>
            <Text>{v.notes}</Text>
          </Box>
        ))}
      </Stack>
    </Panel>
  )
}
```

```tsx components/Schedule.tsx
"use client"

import {
  Badge,
  Box,
  Button,
  Flex,
  Heading,
  SimpleGrid,
  Stack,
  Text,
} from "@chakra-ui/react"
import NextLink from "next/link"
import * as React from "react"
import { LuCalendarPlus, LuCheck, LuClock, LuSiren, LuUsers } from "react-icons/lu"
import { SegmentedControl } from "@/components/ui/segmented-control"
import { toaster } from "@/components/ui/toaster"
import { useClinic } from "@/lib/clinic-store"
import {
  type Appointment,
  STATUS_LABEL,
  type Status,
  TODAY,
  VETS,
  formatClock,
  formatDate,
  formatTime,
  ownerById,
  patientById,
  toMinutes,
  vetById,
} from "@/lib/data"
import { AlertBadges } from "./AlertBadges"
import { BookingDialog } from "./BookingDialog"

const STATUS_PALETTE: Record<Status, string> = {
  booked: "gray",
  checked_in: "orange",
  in_exam: "blue",
  done: "green",
  cancelled: "gray",
}

export function StatusBadge({ status }: { status: Status }) {
  return (
    <Badge colorPalette={STATUS_PALETTE[status]} variant="subtle" size="md" fontWeight={status === "checked_in" ? "bold" : "medium"}>
      {STATUS_LABEL[status]}
    </Badge>
  )
}

function waitLabel(mins: number) {
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins} min`
  return `${Math.floor(mins / 60)} h ${mins % 60} min`
}

export function Schedule() {
  const { appointments, now, checkIn } = useClinic()
  const [bookOpen, setBookOpen] = React.useState(false)
  const [vetFilter, setVetFilter] = React.useState("all")
  const [stateFilter, setStateFilter] = React.useState("all")

  const sorted = React.useMemo(
    () =>
      [...appointments].sort(
        (a, b) => toMinutes(a.start) - toMinutes(b.start) || a.vet.localeCompare(b.vet),
      ),
    [appointments],
  )

  const visible = sorted.filter((a) => {
    if (vetFilter !== "all" && a.vet !== vetFilter) return false
    if (stateFilter === "upcoming") return a.status === "booked" || a.status === "checked_in" || a.status === "in_exam"
    if (stateFilter === "finished") return a.status === "done" || a.status === "cancelled"
    return true
  })

  const waiting = appointments
    .filter((a) => a.status === "checked_in")
    .sort((a, b) => (a.checkedInAt ?? 0) - (b.checkedInAt ?? 0))
  const firstPerVet = new Set<string>()
  const nextIds = new Set<string>()
  for (const a of waiting) {
    if (!firstPerVet.has(a.vet)) {
      firstPerVet.add(a.vet)
      nextIds.add(a.id)
    }
  }

  const count = (s: Status) => appointments.filter((a) => a.status === s).length

  const handleCheckIn = (a: Appointment) => {
    checkIn(a.id)
    const p = patientById(a.patient)
    toaster.create({
      type: "success",
      title: `${p?.name} is checked in`,
      description: `Waiting for ${vetById(a.vet)?.name}.${p?.alerts.length ? ` Alert: ${p.alerts.join("; ")}.` : ""}`,
      closable: true,
    })
  }

  return (
    <Stack gap="5">
      <Flex justify="space-between" align={{ base: "stretch", sm: "center" }} gap="3" direction={{ base: "column", sm: "row" }}>
        <Box>
          <Heading as="h1" size={{ base: "2xl", md: "3xl" }} letterSpacing="-0.02em">
            Today&rsquo;s schedule
          </Heading>
          <Text color="fg.muted" mt="1">
            {formatDate(TODAY, { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
            <Text as="span" mx="2" aria-hidden="true">
              |
            </Text>
            Desk clock {formatClock(now)}
          </Text>
        </Box>
        <Button size="lg" colorPalette="teal" bg="teal.700" _hover={{ bg: "teal.800" }} onClick={() => setBookOpen(true)}>
          <LuCalendarPlus /> Book appointment
        </Button>
      </Flex>

      <SimpleGrid columns={{ base: 2, md: 4 }} gap="3" as="ul" listStyleType="none" m="0" p="0">
        <Tally label="Waiting" value={count("checked_in")} palette="orange" />
        <Tally label="In exam" value={count("in_exam")} palette="blue" />
        <Tally label="Still to arrive" value={count("booked")} palette="gray" />
        <Tally label="Done" value={count("done")} palette="green" />
      </SimpleGrid>

      <Flex gap="5" direction={{ base: "column", lg: "row" }} align="flex-start">
        <Stack gap="5" w={{ base: "full", lg: "340px" }} flexShrink="0" order={{ base: 0, lg: 2 }}>
          <WaitingList waiting={waiting} nextIds={nextIds} now={now} />
          <VetStatus />
        </Stack>

        <Box flex="1" minW="0" w="full" order={{ base: 1, lg: 1 }} as="section" aria-labelledby="sched-h">
          <Flex justify="space-between" align="center" gap="3" wrap="wrap" mb="3">
            <Heading as="h2" id="sched-h" size="lg">
              All appointments
            </Heading>
            <Flex gap="3" wrap="wrap">
              <SegmentedControl
                aria-label="Filter by vet"
                size="sm"
                value={vetFilter}
                onValueChange={(e) => setVetFilter(e.value ?? "all")}
                items={[
                  { value: "all", label: "All vets" },
                  ...VETS.map((v) => ({ value: v.id, label: v.name.replace("Dr. ", "").split(" ")[0] })),
                ]}
              />
              <SegmentedControl
                aria-label="Filter by status"
                size="sm"
                value={stateFilter}
                onValueChange={(e) => setStateFilter(e.value ?? "all")}
                items={[
                  { value: "all", label: "All" },
                  { value: "upcoming", label: "Active" },
                  { value: "finished", label: "Finished" },
                ]}
              />
            </Flex>
          </Flex>

          {visible.length === 0 ? (
            <Box bg="bg.panel" borderWidth="1px" borderRadius="lg" p="8" textAlign="center" color="fg.muted">
              No appointments match these filters.
            </Box>
          ) : (
            <Stack as="ul" listStyleType="none" m="0" p="0" gap="2.5">
              {visible.map((a) => (
                <AppointmentRow key={a.id} a={a} onCheckIn={() => handleCheckIn(a)} />
              ))}
            </Stack>
          )}
        </Box>
      </Flex>

      <BookingDialog open={bookOpen} onOpenChange={setBookOpen} />
    </Stack>
  )
}

function Tally({ label, value, palette }: { label: string; value: number; palette: string }) {
  return (
    <Flex
      as="li"
      bg="bg.panel"
      borderWidth="1px"
      borderRadius="lg"
      px="4"
      py="3"
      align="center"
      gap="3"
      borderStartWidth="4px"
      borderStartColor={`${palette}.solid`}
    >
      <Text fontSize="3xl" fontWeight="bold" lineHeight="1" fontVariantNumeric="tabular-nums">
        {value}
      </Text>
      <Text fontSize="sm" color="fg.muted" lineHeight="1.2">
        {label}
      </Text>
    </Flex>
  )
}

function AppointmentRow({ a, onCheckIn }: { a: Appointment; onCheckIn: () => void }) {
  const patient = patientById(a.patient)
  const owner = patient ? ownerById(patient.owner) : undefined
  const vet = vetById(a.vet)
  const muted = a.status === "done" || a.status === "cancelled"
  const end = toMinutes(a.start) + a.minutes

  return (
    <Flex
      as="li"
      bg={a.urgent && !muted ? "red.subtle" : muted ? "bg.muted" : "bg.panel"}
      borderWidth="1px"
      borderColor={a.urgent && !muted ? "red.muted" : "border"}
      borderStartWidth="5px"
      borderStartColor={a.urgent ? "red.solid" : a.status === "checked_in" ? "orange.solid" : a.status === "in_exam" ? "blue.solid" : "border"}
      borderRadius="lg"
      p={{ base: "3", md: "4" }}
      gap={{ base: "2", md: "5" }}
      direction={{ base: "column", md: "row" }}
      align={{ md: "center" }}
    >
      <Flex w={{ md: "104px" }} flexShrink="0" direction={{ base: "row", md: "column" }} align={{ base: "baseline", md: "flex-start" }} gap={{ base: "2", md: "0" }}>
        <Text fontWeight="bold" fontSize="lg" fontVariantNumeric="tabular-nums" textDecoration={a.status === "cancelled" ? "line-through" : "none"}>
          {formatTime(a.start)}
        </Text>
        <Text fontSize="xs" color="fg.muted">
          {a.minutes} min, to {formatTime(`${String(Math.floor(end / 60)).padStart(2, "0")}:${String(end % 60).padStart(2, "0")}`)}
        </Text>
      </Flex>

      <Box flex="1" minW="0">
        <Flex gap="2" align="center" wrap="wrap">
          {patient && (
            <Box asChild fontWeight="bold" fontSize="lg" _hover={{ textDecoration: "underline" }} minH="6">
              <NextLink href={`/patients/${patient.id}`}>{patient.name}</NextLink>
            </Box>
          )}
          <Text fontSize="sm" color="fg.muted">
            {patient?.species}, {patient?.breed}
          </Text>
          {a.urgent && (
            <Badge colorPalette="red" variant="solid" size="md" gap="1">
              <LuSiren aria-hidden="true" /> Urgent
            </Badge>
          )}
        </Flex>
        <Text textDecoration={a.status === "cancelled" ? "line-through" : "none"} fontWeight={a.urgent ? "semibold" : "normal"}>
          {a.reason}
        </Text>
        <Text fontSize="sm" color="fg.muted" mb={patient?.alerts.length ? "2" : "0"}>
          {owner?.name} | {vet?.name}, {vet?.room}
        </Text>
        {patient && <AlertBadges alerts={patient.alerts} />}
      </Box>

      <Flex
        gap="3"
        align="center"
        justify={{ base: "space-between", md: "flex-end" }}
        w={{ md: "220px" }}
        flexShrink="0"
        wrap="wrap"
      >
        <StatusBadge status={a.status} />
        {a.status === "booked" && (
          <Button colorPalette="teal" bg="teal.700" _hover={{ bg: "teal.800" }} size="md" minH="11" onClick={onCheckIn} aria-label={`Check in ${patient?.name}`}>
            <LuCheck /> Check in
          </Button>
        )}
      </Flex>
    </Flex>
  )
}

function WaitingList({
  waiting,
  nextIds,
  now,
}: {
  waiting: Appointment[]
  nextIds: Set<string>
  now: number
}) {
  return (
    <Box as="section" aria-labelledby="wait-h" bg="bg.panel" borderWidth="1px" borderRadius="lg" overflow="hidden">
      <Flex px="4" py="3" justify="space-between" align="center" borderBottomWidth="1px" bg="orange.subtle">
        <Heading as="h2" id="wait-h" size="md" display="flex" alignItems="center" gap="2">
          <LuClock aria-hidden="true" /> Waiting room
        </Heading>
        <Badge colorPalette="orange" variant="subtle" size="lg" fontWeight="bold">
          {waiting.length}
        </Badge>
      </Flex>
      <div aria-live="polite">
        {waiting.length === 0 ? (
          <Text p="5" color="fg.muted" textAlign="center">
            Nobody is waiting. Check in a patient from the schedule.
          </Text>
        ) : (
          <Stack as="ol" listStyleType="none" m="0" p="0" gap="0">
            {waiting.map((a) => {
              const p = patientById(a.patient)
              const waited = now - (a.checkedInAt ?? now)
              const long = waited >= 20
              return (
                <Box as="li" key={a.id} px="4" py="3" borderBottomWidth="1px" _last={{ borderBottomWidth: 0 }}>
                  <Flex justify="space-between" align="baseline" gap="3">
                    <Box asChild fontWeight="bold" fontSize="md" _hover={{ textDecoration: "underline" }}>
                      <NextLink href={`/patients/${a.patient}`}>{p?.name}</NextLink>
                    </Box>
                    <Text fontWeight="bold" fontVariantNumeric="tabular-nums" color={long ? "red.fg" : "orange.fg"}>
                      {waitLabel(waited)}
                    </Text>
                  </Flex>
                  <Text fontSize="sm" color="fg.muted">
                    {a.reason} | {ownerById(p?.owner ?? "")?.name}
                  </Text>
                  <Text fontSize="sm" color="fg.muted" mb="2">
                    For {vetById(a.vet)?.name}, booked {formatTime(a.start)}, in at {formatClock(a.checkedInAt ?? now)}
                    {nextIds.has(a.id) && (
                      <Badge ml="2" colorPalette="teal" variant="subtle">
                        Next in line
                      </Badge>
                    )}
                  </Text>
                  {p && <AlertBadges alerts={p.alerts} size="xs" />}
                </Box>
              )
            })}
          </Stack>
        )}
      </div>
    </Box>
  )
}

function VetStatus() {
  const { appointments } = useClinic()
  return (
    <Box as="section" aria-labelledby="vets-h" bg="bg.panel" borderWidth="1px" borderRadius="lg" overflow="hidden">
      <Flex px="4" py="3" borderBottomWidth="1px" align="center" gap="2">
        <LuUsers aria-hidden="true" />
        <Heading as="h2" id="vets-h" size="md">
          Vets right now
        </Heading>
      </Flex>
      <Stack as="ul" listStyleType="none" m="0" p="0" gap="0">
        {VETS.map((v) => {
          const current = appointments.find((a) => a.vet === v.id && a.status === "in_exam")
          const p = current ? patientById(current.patient) : undefined
          return (
            <Flex as="li" key={v.id} px="4" py="3" justify="space-between" gap="3" borderBottomWidth="1px" _last={{ borderBottomWidth: 0 }} align="center">
              <Box>
                <Text fontWeight="semibold">{v.name}</Text>
                <Text fontSize="sm" color="fg.muted">
                  {v.room}
                </Text>
              </Box>
              {current ? (
                <Badge colorPalette="blue" size="md">
                  With {p?.name}
                </Badge>
              ) : (
                <Badge colorPalette="green" size="md">
                  Free
                </Badge>
              )}
            </Flex>
          )
        })}
      </Stack>
    </Box>
  )
}
```

```tsx lib/clinic-store.tsx
"use client"

import * as React from "react"
import {
  type Appointment,
  INITIAL_APPOINTMENTS,
  START_NOW,
  findClash,
} from "./data"

interface NewBooking {
  patient: string
  vet: string
  start: string
  minutes: number
  reason: string
  urgent?: boolean
}

interface ClinicStore {
  appointments: Appointment[]
  now: number
  checkIn: (id: string) => void
  book: (b: NewBooking) => { ok: true; id: string } | { ok: false; clashWith: Appointment }
}

const Ctx = React.createContext<ClinicStore | null>(null)

export function ClinicProvider({ children }: { children: React.ReactNode }) {
  const [appointments, setAppointments] = React.useState<Appointment[]>(INITIAL_APPOINTMENTS)
  const [now, setNow] = React.useState(START_NOW)

  // The desk clock advances a minute at a time so waiting times keep moving.
  React.useEffect(() => {
    const t = window.setInterval(() => setNow((n) => n + 1), 60_000)
    return () => window.clearInterval(t)
  }, [])

  const nowRef = React.useRef(now)
  nowRef.current = now
  const apptsRef = React.useRef(appointments)
  apptsRef.current = appointments

  const checkIn = React.useCallback((id: string) => {
    setAppointments((list) =>
      list.map((a) =>
        a.id === id && a.status === "booked"
          ? { ...a, status: "checked_in", checkedInAt: nowRef.current }
          : a,
      ),
    )
  }, [])

  const book = React.useCallback<ClinicStore["book"]>((b) => {
    const clash = findClash(apptsRef.current, b.vet, b.start, b.minutes)
    if (clash) return { ok: false, clashWith: clash }
    const id = `a-${String(apptsRef.current.length + 1).padStart(2, "0")}`
    setAppointments((list) => [...list, { id, ...b, status: "booked" }])
    return { ok: true, id }
  }, [])

  const value = React.useMemo(
    () => ({ appointments, now, checkIn, book }),
    [appointments, now, checkIn, book],
  )
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useClinic() {
  const v = React.useContext(Ctx)
  if (!v) throw new Error("useClinic must be used inside ClinicProvider")
  return v
}
```

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
  /** Minutes since midnight when the patient was checked in. */
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

export const CLINIC = "Pawpoint"
export const CLINIC_FULL = "Hillside Veterinary Clinic"
export const TODAY = "2026-11-12"
/** The front desk clock on the demo day, in minutes since midnight (09:50). */
export const START_NOW = 9 * 60 + 50

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

export const INITIAL_APPOINTMENTS: Appointment[] = [
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
      { date: "2026-11-12", vet: "v-2", reason: "Kidney panel recheck", notes: "Creatinine 2.1 mg/dL (was 2.0). Weight down 0.6 kg. Continue benazepril, recheck in 3 months.", invoice_usd: 186.0 },
      { date: "2026-06-17", vet: "v-2", reason: "Kidney panel recheck", notes: "Stable. Appetite good. Owner reports more drinking in hot weather.", invoice_usd: 172.5 },
      { date: "2026-02-11", vet: "v-1", reason: "Coughing", notes: "Mild kennel cough. Supportive care; no antibiotics given (penicillin allergy).", invoice_usd: 94.0 },
      { date: "2025-11-03", vet: "v-2", reason: "Senior wellness exam", notes: "Grade 2 dental tartar. Dental cleaning recommended.", invoice_usd: 148.0 },
    ],
  },
}

export const vetById = (id: string) => VETS.find((v) => v.id === id)
export const ownerById = (id: string) => OWNERS.find((o) => o.id === id)
export const patientById = (id: string) => PATIENTS.find((p) => p.id === id)

export const STATUS_LABEL: Record<Status, string> = {
  booked: "Booked",
  checked_in: "Checked in",
  in_exam: "In exam",
  done: "Done",
  cancelled: "Cancelled",
}

export const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number)
  return h * 60 + m
}

export const fromMinutes = (mins: number) => {
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
}

export const formatTime = (hhmm: string) => {
  const mins = toMinutes(hhmm)
  const h = Math.floor(mins / 60)
  const m = mins % 60
  const suffix = h >= 12 ? "PM" : "AM"
  const h12 = h % 12 === 0 ? 12 : h % 12
  return `${h12}:${String(m).padStart(2, "0")} ${suffix}`
}

export const formatClock = (mins: number) => formatTime(fromMinutes(mins))

export const formatDate = (iso: string, opts?: Intl.DateTimeFormatOptions) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-US", {
    timeZone: "UTC",
    month: "short",
    day: "numeric",
    year: "numeric",
    ...opts,
  })

export const daysBetween = (fromIso: string, toIso: string) =>
  Math.round(
    (new Date(`${toIso}T12:00:00Z`).getTime() - new Date(`${fromIso}T12:00:00Z`).getTime()) /
      86400000,
  )

export const ageLabel = (born: string, today = TODAY) => {
  const b = new Date(`${born}T12:00:00Z`)
  const t = new Date(`${today}T12:00:00Z`)
  let years = t.getUTCFullYear() - b.getUTCFullYear()
  let months = t.getUTCMonth() - b.getUTCMonth()
  if (t.getUTCDate() < b.getUTCDate()) months -= 1
  if (months < 0) {
    years -= 1
    months += 12
  }
  if (years < 1) return `${months} mo`
  return `${years} yr${years === 1 ? "" : "s"}${months ? ` ${months} mo` : ""}`
}

export const usd = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD" })

export type VaccineState = "overdue" | "soon" | "current"

export const vaccineState = (due: string, today = TODAY): { state: VaccineState; days: number } => {
  const days = daysBetween(today, due)
  if (days < 0) return { state: "overdue", days: -days }
  if (days <= 60) return { state: "soon", days }
  return { state: "current", days }
}

/** Finds an existing booking of the same vet that overlaps [start, start + minutes). */
export function findClash(
  appointments: Appointment[],
  vetId: string,
  start: string,
  minutes: number,
) {
  const s = toMinutes(start)
  const e = s + minutes
  return appointments.find((a) => {
    if (a.vet !== vetId || a.status === "cancelled") return false
    const as = toMinutes(a.start)
    const ae = as + a.minutes
    return s < ae && as < e
  })
}

/** First start time at or after `from` (15 minute grid) where the vet is free. */
export function nextFree(
  appointments: Appointment[],
  vetId: string,
  minutes: number,
  from: number,
) {
  for (let t = Math.ceil(from / 15) * 15; t <= 17 * 60 - minutes; t += 15) {
    if (!findClash(appointments, vetId, fromMinutes(t), minutes)) return fromMinutes(t)
  }
  return null
}

export const SLOTS: string[] = (() => {
  const out: string[] = []
  for (let t = 8 * 60; t <= 16 * 60 + 45; t += 15) out.push(fromMinutes(t))
  return out
})()
```

