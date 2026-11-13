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
