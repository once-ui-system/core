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
