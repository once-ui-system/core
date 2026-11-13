"use client";

import { useEffect, useMemo, useState } from "react";
import NextLink from "next/link";
import {
  Badge,
  Box,
  Button,
  Flex,
  Grid,
  GridItem,
  Heading,
  HStack,
  Icon,
  SimpleGrid,
  Text,
} from "@chakra-ui/react";
import { FiAlertCircle, FiCheck, FiClock, FiPlus } from "react-icons/fi";
import { toaster } from "@/components/ui/toaster";
import { BookingDialog } from "@/components/booking-dialog";
import { AlertChips } from "@/components/patient-alerts";
import {
  type Appointment,
  NOW_START,
  STATUS_LABEL,
  type Status,
  TODAY,
  fmtDate,
  fmtRange,
  fmtTime,
  initialAppointments,
  ownerById,
  patientById,
  vetById,
  vets,
} from "@/lib/data";
import { sortAppointments } from "@/lib/schedule";

const STATUS_PALETTE: Record<Status, string> = {
  booked: "gray",
  checked_in: "orange",
  in_exam: "purple",
  done: "green",
  cancelled: "gray",
};

const COLUMNS = {
  base: "1fr",
  md: "92px minmax(0,1.2fr) minmax(0,1.2fr) 150px",
  lg: "100px minmax(0,1.35fr) minmax(0,1fr) minmax(0,1.3fr) minmax(0,1fr) 112px 128px",
};

const AREAS = {
  base: '"time status" "patient patient" "reason reason" "owner owner" "vet vet" "action action"',
  md: '"time patient reason status" "time owner vet action"',
  lg: '"time patient owner reason vet status action"',
};

function StatusBadge({ status }: { status: Status }) {
  return (
    <Badge
      colorPalette={STATUS_PALETTE[status]}
      variant={status === "cancelled" ? "outline" : "subtle"}
      size="md"
      whiteSpace="nowrap"
      fontWeight="semibold"
    >
      {STATUS_LABEL[status]}
    </Badge>
  );
}

function waitText(minutes: number): string {
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min`;
  return `${Math.floor(minutes / 60)} h ${minutes % 60} min`;
}

export function Schedule() {
  const [appts, setAppts] = useState<Appointment[]>(initialAppointments);
  const [now, setNow] = useState(NOW_START);
  const [vetFilter, setVetFilter] = useState<string>("all");
  const [bookingOpen, setBookingOpen] = useState(false);
  const [highlight, setHighlight] = useState<string | null>(null);

  useEffect(() => {
    const t = window.setInterval(() => setNow((n) => n + 1), 60_000);
    return () => window.clearInterval(t);
  }, []);

  function update(id: string, patch: Partial<Appointment>) {
    setAppts((list) => list.map((a) => (a.id === id ? { ...a, ...patch } : a)));
  }

  function checkIn(a: Appointment) {
    update(a.id, { status: "checked_in", checkedInAt: now });
    const p = patientById(a.patient);
    toaster.create({
      type: "success",
      title: `${p?.name ?? "Patient"} checked in`,
      description: p && p.alerts.length > 0 ? `Alert: ${p.alerts.join("; ")}` : `Waiting for ${vetById(a.vet).short}.`,
    });
  }

  function book(draft: Omit<Appointment, "id">) {
    const id = `a-${String(appts.length + 1).padStart(2, "0")}`;
    setAppts((list) => [...list, { ...draft, id }]);
    setBookingOpen(false);
    setHighlight(id);
    const p = patientById(draft.patient);
    toaster.create({
      type: "success",
      title: "Appointment booked",
      description: `${p?.name ?? "Patient"} with ${vetById(draft.vet).name}, ${fmtRange(draft.start, draft.minutes)}.`,
    });
  }

  const sorted = useMemo(() => sortAppointments(appts), [appts]);
  const visible = sorted.filter((a) => vetFilter === "all" || a.vet === vetFilter);
  const waiting = useMemo(
    () =>
      appts
        .filter((a) => a.status === "checked_in")
        .sort((a, b) => (a.checkedInAt ?? 0) - (b.checkedInAt ?? 0)),
    [appts],
  );

  const count = (s: Status) => appts.filter((a) => a.status === s).length;

  return (
    <Flex direction="column" gap={{ base: "5", md: "6" }}>
      <Flex justify="space-between" align={{ base: "stretch", sm: "flex-end" }} gap="4" wrap="wrap" direction={{ base: "column", sm: "row" }}>
        <Box>
          <Text color="fg.muted" fontSize="sm">
            {fmtDate(TODAY)} · Thursday · {fmtTime(now)}
          </Text>
          <Heading as="h1" size="2xl">
            Today’s schedule
          </Heading>
        </Box>
        <Button colorPalette="teal" size="lg" onClick={() => setBookingOpen(true)}>
          <FiPlus /> Book appointment
        </Button>
      </Flex>

      <SimpleGrid columns={{ base: 2, md: 4 }} gap="3" aria-label="Today at a glance" role="list">
        <Tally label="Waiting" value={count("checked_in")} palette="orange" />
        <Tally label="In exam" value={count("in_exam")} palette="purple" />
        <Tally label="Still to arrive" value={count("booked")} palette="blue" />
        <Tally label="Done" value={count("done")} palette="green" />
      </SimpleGrid>

      <Box as="section" aria-labelledby="waiting-heading">
        <HStack mb="3" gap="2">
          <Icon color="orange.fg" aria-hidden>
            <FiClock />
          </Icon>
          <Heading as="h2" size="lg" id="waiting-heading">
            Waiting room
          </Heading>
          <Badge bg="orange.700" color="white" size="md">
            {waiting.length}
          </Badge>
        </HStack>
        {waiting.length === 0 ? (
          <Box bg="bg.panel" borderWidth="1px" borderStyle="dashed" borderColor="border" rounded="lg" p="5" color="fg.muted">
            Nobody is waiting. Check in a booked patient from the schedule below.
          </Box>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} gap="3" as="ol" listStyleType="none" m="0" p="0">
            {waiting.map((a, i) => {
              const p = patientById(a.patient);
              const owner = p ? ownerById(p.owner) : undefined;
              const vet = vetById(a.vet);
              const waited = Math.max(0, now - (a.checkedInAt ?? now));
              const late = waited >= 30;
              return (
                <Box
                  as="li"
                  key={a.id}
                  bg="bg.panel"
                  borderWidth="1px"
                  borderColor={i === 0 ? "orange.solid" : "border"}
                  borderTopWidth={i === 0 ? "4px" : "1px"}
                  rounded="lg"
                  p="4"
                >
                  <Flex justify="space-between" align="flex-start" gap="3">
                    <Box minW="0">
                      {i === 0 && (
                        <Badge bg="orange.700" color="white" mb="1">
                          Next up
                        </Badge>
                      )}
                      <Text fontWeight="bold" fontSize="lg" lineHeight="1.2">
                        <PatientLink id={a.patient} />
                      </Text>
                      <Text fontSize="sm" color="fg.muted">
                        {p?.species} · {owner?.name}
                      </Text>
                    </Box>
                    <Box textAlign="end" flexShrink={0}>
                      <Text
                        fontWeight="bold"
                        fontSize="xl"
                        lineHeight="1.1"
                        color={late ? "red.fg" : "fg"}
                        style={{ fontVariantNumeric: "tabular-nums" }}
                      >
                        {waitText(waited)}
                      </Text>
                      <Text fontSize="xs" color="fg.muted">
                        waiting
                      </Text>
                    </Box>
                  </Flex>
                  {p && p.alerts.length > 0 && (
                    <Box mt="3">
                      <AlertChips alerts={p.alerts} />
                    </Box>
                  )}
                  <Text mt="3" fontSize="sm">
                    {a.reason}
                  </Text>
                  <Text fontSize="sm" color="fg.muted">
                    {vet.name} · {vet.room} · booked {fmtTime(a.start)}
                  </Text>
                  <Button
                    mt="3"
                    size="sm"
                    variant="outline"
                    colorPalette="purple"
                    onClick={() => update(a.id, { status: "in_exam" })}
                    aria-label={`Start exam for ${p?.name}`}
                  >
                    Start exam
                  </Button>
                </Box>
              );
            })}
          </SimpleGrid>
        )}
      </Box>

      <Box as="section" aria-labelledby="schedule-heading">
        <Flex justify="space-between" align={{ base: "flex-start", md: "center" }} gap="3" mb="3" wrap="wrap" direction={{ base: "column", md: "row" }}>
          <Heading as="h2" size="lg" id="schedule-heading">
            All appointments
          </Heading>
          <Flex gap="2" wrap="wrap" role="group" aria-label="Filter by vet">
            <FilterButton active={vetFilter === "all"} onClick={() => setVetFilter("all")}>
              All vets
            </FilterButton>
            {vets.map((v) => (
              <FilterButton key={v.id} active={vetFilter === v.id} onClick={() => setVetFilter(v.id)}>
                {v.short}
                <Text as="span" color="fg.muted" fontWeight="normal" display={{ base: "none", sm: "inline" }}>
                  {" "}
                  · {v.room}
                </Text>
              </FilterButton>
            ))}
          </Flex>
        </Flex>

        <Grid
          display={{ base: "none", lg: "grid" }}
          templateColumns={COLUMNS.lg}
          gap="3"
          px="4"
          pb="2"
          color="fg.muted"
          fontSize="xs"
          fontWeight="semibold"
          textTransform="uppercase"
          letterSpacing="0.06em"
          aria-hidden
        >
          <Text>Time</Text>
          <Text>Patient</Text>
          <Text>Owner</Text>
          <Text>Reason</Text>
          <Text>Vet</Text>
          <Text>Status</Text>
          <Text />
        </Grid>

        <Flex as="ul" direction="column" gap="2" listStyleType="none" m="0" p="0">
          {visible.map((a) => {
            const p = patientById(a.patient);
            const owner = p ? ownerById(p.owner) : undefined;
            const vet = vetById(a.vet);
            const inactive = a.status === "cancelled";
            const finished = a.status === "done";
            return (
              <Box
                as="li"
                key={a.id}
                bg={a.urgent && !finished && !inactive ? "red.subtle" : "bg.panel"}
                borderWidth="1px"
                borderColor={highlight === a.id ? "teal.solid" : a.urgent ? "red.muted" : "border"}
                borderStartWidth="4px"
                borderStartColor={
                  a.urgent && !inactive ? "red.solid" : a.status === "in_exam" ? "purple.solid" : a.status === "checked_in" ? "orange.solid" : "transparent"
                }
                outline={highlight === a.id ? "2px solid" : undefined}
                outlineColor="teal.solid"
                rounded="lg"
                px="4"
                py="3"
                data-status={a.status}
              >
                <Grid
                  templateColumns={COLUMNS}
                  templateAreas={AREAS}
                  columnGap="3"
                  rowGap="1.5"
                  alignItems="start"
                >
                  <GridItem area="time">
                    <Text fontWeight="bold" whiteSpace="nowrap" style={{ fontVariantNumeric: "tabular-nums" }} textDecoration={inactive ? "line-through" : undefined}>
                      {fmtTime(a.start)}
                    </Text>
                    <Text fontSize="xs" color="fg.muted" whiteSpace="nowrap">
                      {a.minutes} min
                    </Text>
                  </GridItem>

                  <GridItem area="patient" minW="0">
                    <HStack gap="2" wrap="wrap">
                      <Text fontWeight="semibold" fontSize="md">
                        <PatientLink id={a.patient} />
                      </Text>
                      <Text as="span" fontSize="sm" color="fg.muted">
                        {p?.species}
                      </Text>
                      {a.urgent && (
                        <Badge colorPalette="red" variant="solid" size="md">
                          <FiAlertCircle /> Urgent
                        </Badge>
                      )}
                    </HStack>
                    {p && p.alerts.length > 0 && (
                      <Box mt="1.5">
                        <AlertChips alerts={p.alerts} />
                      </Box>
                    )}
                  </GridItem>

                  <GridItem area="owner" minW="0">
                    <Text fontSize="sm">{owner?.name}</Text>
                    <Text fontSize="xs" color="fg.muted">
                      {owner?.phone}
                    </Text>
                  </GridItem>

                  <GridItem area="reason" minW="0">
                    <Text fontSize="sm" fontWeight={a.urgent ? "semibold" : "normal"}>
                      {a.reason}
                    </Text>
                  </GridItem>

                  <GridItem area="vet" minW="0">
                    <Text fontSize="sm">{vet.name}</Text>
                    <Text fontSize="xs" color="fg.muted">
                      {vet.room}
                    </Text>
                  </GridItem>

                  <GridItem area="status" justifySelf={{ base: "end", md: "start" }}>
                    <StatusBadge status={a.status} />
                  </GridItem>

                  <GridItem area="action" justifySelf={{ base: "stretch", md: "start" }}>
                    {a.status === "booked" && (
                      <Button
                        size="sm"
                        colorPalette="teal"
                        w={{ base: "full", md: "auto" }}
                        onClick={() => checkIn(a)}
                        aria-label={`Check in ${p?.name}`}
                      >
                        <FiCheck /> Check in
                      </Button>
                    )}
                    {a.status === "checked_in" && (
                      <Button
                        size="sm"
                        variant="outline"
                        colorPalette="purple"
                        w={{ base: "full", md: "auto" }}
                        onClick={() => update(a.id, { status: "in_exam" })}
                        aria-label={`Start exam for ${p?.name}`}
                      >
                        Start exam
                      </Button>
                    )}
                    {a.status === "in_exam" && (
                      <Button
                        size="sm"
                        variant="outline"
                        w={{ base: "full", md: "auto" }}
                        onClick={() => update(a.id, { status: "done" })}
                        aria-label={`Mark done: ${p?.name}`}
                      >
                        Mark done
                      </Button>
                    )}
                  </GridItem>
                </Grid>
              </Box>
            );
          })}
          {visible.length === 0 && (
            <Box as="li" bg="bg.panel" rounded="lg" p="5" color="fg.muted">
              No appointments for this vet today.
            </Box>
          )}
        </Flex>
      </Box>

      <BookingDialog
        open={bookingOpen}
        onOpenChange={setBookingOpen}
        appointments={appts}
        now={now}
        onBook={book}
      />
    </Flex>
  );
}

function PatientLink({ id }: { id: string }) {
  const p = patientById(id);
  return (
    <NextLink
      href={`/patients/${id}`}
      style={{ textDecoration: "underline", textDecorationColor: "var(--chakra-colors-border-emphasized)", textUnderlineOffset: "3px" }}
    >
      {p?.name ?? id}
    </NextLink>
  );
}

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
      size="sm"
      variant={active ? "solid" : "outline"}
      colorPalette={active ? "teal" : "gray"}
      aria-pressed={active}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}

function Tally({ label, value, palette }: { label: string; value: number; palette: string }) {
  return (
    <Box
      role="listitem"
      bg="bg.panel"
      borderWidth="1px"
      borderColor="border"
      borderTopWidth="3px"
      borderTopColor={`${palette}.solid`}
      rounded="lg"
      px="4"
      py="3"
    >
      <Text fontSize="sm" color="fg.muted">
        {label}
      </Text>
      <Text fontSize="3xl" fontWeight="bold" lineHeight="1.1" style={{ fontVariantNumeric: "tabular-nums" }}>
        {value}
      </Text>
    </Box>
  );
}
