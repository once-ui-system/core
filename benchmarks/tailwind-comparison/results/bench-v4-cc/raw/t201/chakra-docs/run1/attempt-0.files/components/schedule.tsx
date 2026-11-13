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

  return (
    <Box
      as="li"
      bg={appt.urgent && !cancelled ? "orange.subtle" : "bg.panel"}
      borderWidth="1px"
      borderColor={highlighted ? "teal.solid" : "border"}
      borderLeftWidth="6px"
      borderLeftColor={appt.urgent && !cancelled ? "orange.solid" : ACCENT[appt.status]}
      rounded="lg"
      p={{ base: "3", md: "4" }}
      opacity={cancelled || appt.status === "done" ? 0.7 : 1}
    >
      <Grid templateColumns={{ base: "1fr", md: "88px minmax(0,1.4fr) minmax(0,1fr) 150px" }} gap={{ base: "2", md: "4" }} alignItems="start">
        <Flex direction={{ base: "row", md: "column" }} align={{ base: "baseline", md: "flex-start" }} gap={{ base: "2", md: "0" }}>
          <Text fontWeight="bold" fontSize="lg" lineHeight="short">
            {fmtClock(start)}
          </Text>
          <Text fontSize="sm" color="fg.muted">
            {appt.minutes} min
          </Text>
        </Flex>

        <Box minW="0">
          <ChakraLink asChild variant="plain" fontWeight="semibold" fontSize="lg" textDecoration={cancelled ? "line-through" : undefined} _hover={{ textDecoration: "underline" }}>
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
          {appt.urgent && !cancelled && (
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
        <Badge colorPalette="blue" variant="solid" size="lg" aria-label={`${waiting.length} waiting`}>
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

      <Grid templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }} gap={{ base: "2", md: "4" }}>
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
                  {v.name.replace("Dr. ", "Dr. ").split(" ").slice(0, 2).join(" ")}
                  <Text as="span" color={vetFilter === v.id ? undefined : "fg.muted"} fontWeight="normal">
                    &nbsp;&middot; {v.room}
                  </Text>
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
