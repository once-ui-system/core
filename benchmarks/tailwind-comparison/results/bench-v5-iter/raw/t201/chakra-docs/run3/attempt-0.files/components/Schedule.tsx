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
