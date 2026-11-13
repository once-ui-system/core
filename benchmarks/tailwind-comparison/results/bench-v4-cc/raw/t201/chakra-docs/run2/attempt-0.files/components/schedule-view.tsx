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
