"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Anchor,
  Badge,
  Box,
  Button,
  Chip,
  ColorSwatch,
  Grid,
  Group,
  Paper,
  Flex,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import {
  IconCalendarPlus,
  IconCheck,
  IconClockHour4,
  IconDoorEnter,
  IconFlag3Filled,
  IconStethoscope,
} from "@tabler/icons-react";
import {
  type Appointment,
  NOW_START,
  endTime,
  fmtLongToday,
  getOwner,
  getPatient,
  getVet,
  initialAppointments,
  statusColor,
  statusLabel,
  toClock,
  toMinutes,
} from "@/lib/data";
import { AlertBadges } from "./AlertBadges";
import { BookingModal, type NewBooking } from "./BookingModal";

const sortAppts = (a: Appointment, b: Appointment) =>
  toMinutes(a.start) - toMinutes(b.start) || a.vet.localeCompare(b.vet);

function useClock() {
  const [now, setNow] = useState(NOW_START);
  useEffect(() => {
    const t0 = Date.now();
    const id = window.setInterval(() => setNow(NOW_START + Math.floor((Date.now() - t0) / 60000)), 10000);
    return () => window.clearInterval(id);
  }, []);
  return now;
}

export function Schedule() {
  const [appts, setAppts] = useState<Appointment[]>(initialAppointments);
  const [vetFilter, setVetFilter] = useState("all");
  const [opened, { open, close }] = useDisclosure(false);
  const now = useClock();

  const visible = useMemo(
    () => [...appts].filter((a) => vetFilter === "all" || a.vet === vetFilter).sort(sortAppts),
    [appts, vetFilter],
  );

  const waiting = useMemo(
    () =>
      appts
        .filter((a) => a.status === "checked_in")
        .sort((a, b) => (a.checkedInAt ?? 0) - (b.checkedInAt ?? 0)),
    [appts],
  );

  const count = (s: Appointment["status"]) => appts.filter((a) => a.status === s).length;

  const setStatus = (id: string, status: Appointment["status"]) =>
    setAppts((list) =>
      list.map((a) => (a.id === id ? { ...a, status, checkedInAt: status === "checked_in" ? now : a.checkedInAt } : a)),
    );

  const checkIn = (a: Appointment) => {
    setStatus(a.id, "checked_in");
    const p = getPatient(a.patient);
    notifications.show({
      color: "teal",
      title: `${p?.name} is checked in`,
      message: `Waiting for ${getVet(a.vet).name}, ${getVet(a.vet).room}.`,
      icon: <IconCheck size={18} aria-hidden />,
    });
  };

  const book = (b: NewBooking) => {
    const id = `a-${String(appts.length + 1).padStart(2, "0")}`;
    setAppts((list) => [...list, { id, status: "booked", ...b }]);
    close();
    notifications.show({
      color: "teal",
      title: "Appointment booked",
      message: `${getPatient(b.patient)?.name} with ${getVet(b.vet).name} at ${b.start}.`,
      icon: <IconCheck size={18} aria-hidden />,
    });
  };

  return (
    <Stack gap="md">
      <Group justify="space-between" align="flex-end" wrap="wrap" gap="sm">
        <Box>
          <Title order={1} fz={{ base: 24, sm: 30 }}>
            Today&apos;s schedule
          </Title>
          <Text c="gray.7">
            {fmtLongToday()} · It is {toClock(now)}
          </Text>
        </Box>
        <Button size="lg" leftSection={<IconCalendarPlus size={22} aria-hidden />} onClick={open} fullWidth={false}>
          Book appointment
        </Button>
      </Group>

      <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="sm" aria-label="Day summary">
        <Stat label="Waiting" value={count("checked_in")} color="orange" />
        <Stat label="In exam" value={count("in_exam")} color="blue" />
        <Stat label="Still to come" value={count("booked")} color="gray" />
        <Stat label="Done" value={count("done")} color="teal" />
      </SimpleGrid>

      <Grid gap="md">
        <Grid.Col span={{ base: 12, lg: 4 }}>
          <Box component="section" aria-labelledby="waiting-title">
            <WaitingList waiting={waiting} now={now} onStart={(a) => setStatus(a.id, "in_exam")} />
          </Box>
        </Grid.Col>

        <Grid.Col span={{ base: 12, lg: 8 }}>
        <Stack gap="sm" component="section" aria-labelledby="sched-title">
          <Group justify="space-between" wrap="wrap" gap="xs">
            <Title order={2} fz="lg" id="sched-title">
              Appointments
            </Title>
            <Chip.Group multiple={false} value={vetFilter} onChange={(v) => setVetFilter(v as string)}>
              <Group gap={6} aria-label="Filter by vet">
                <Chip value="all" size="md">
                  All vets
                </Chip>
                {["v-1", "v-2", "v-3"].map((id) => (
                  <Chip key={id} value={id} size="md">
                    {getVet(id).name.replace("Dr. ", "")}
                  </Chip>
                ))}
              </Group>
            </Chip.Group>
          </Group>

          <Stack gap="xs" component="ul" m={0} p={0} style={{ listStyle: "none" }}>
            {visible.map((a) => (
              <li key={a.id}>
                <AppointmentRow a={a} now={now} onCheckIn={() => checkIn(a)} onStart={() => setStatus(a.id, "in_exam")} onDone={() => setStatus(a.id, "done")} />
              </li>
            ))}
          </Stack>
        </Stack>
        </Grid.Col>
      </Grid>

      <BookingModal opened={opened} onClose={close} appointments={appts} nowMin={now} onBook={book} />
    </Stack>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <Paper withBorder p="sm" style={{ borderLeft: `5px solid var(--mantine-color-${color}-6)` }}>
      <Text fz="xs" tt="uppercase" fw={700} c="gray.7" lh={1.2}>
        {label}
      </Text>
      <Text fz={32} fw={800} lh={1.1}>
        {value}
      </Text>
    </Paper>
  );
}

function WaitingList({
  waiting,
  now,
  onStart,
}: {
  waiting: Appointment[];
  now: number;
  onStart: (a: Appointment) => void;
}) {
  return (
    <Paper withBorder p="md" shadow="xs">
      <Group gap="xs" mb="sm" justify="space-between">
        <Group gap="xs">
          <IconClockHour4 size={22} aria-hidden />
          <Title order={2} fz="lg" id="waiting-title">
            Waiting room
          </Title>
        </Group>
        <Badge size="lg" color="orange" variant="light" circle aria-label={`${waiting.length} waiting`}>
          {waiting.length}
        </Badge>
      </Group>
      {waiting.length === 0 ? (
        <Text c="gray.7" py="md">
          Nobody is waiting. Check patients in as they arrive.
        </Text>
      ) : (
        <Stack gap="sm" component="ol" m={0} p={0} style={{ listStyle: "none" }}>
          {waiting.map((a, i) => {
            const p = getPatient(a.patient);
            const wait = Math.max(0, now - (a.checkedInAt ?? now));
            const v = getVet(a.vet);
            return (
              <li key={a.id}>
                <Paper p="sm" bg="orange.0" withBorder>
                  <Group justify="space-between" align="flex-start" wrap="nowrap" gap="xs">
                    <Box style={{ minWidth: 0 }}>
                      <Text fw={700} fz="md" component="div">
                        {i === 0 && (
                          <Badge size="sm" color="teal.7" mr={6} variant="filled">
                            Next
                          </Badge>
                        )}
                        <Anchor component={Link} href={`/patients/${a.patient}`} c="inherit" underline="hover">
                          {p?.name}
                        </Anchor>
                      </Text>
                      <Text fz="sm" c="gray.7">
                        {getOwner(p?.owner ?? "").name} · {v.name}, {v.room}
                      </Text>
                    </Box>
                    <Box ta="right" style={{ flexShrink: 0 }}>
                      <Text fw={800} fz="xl" lh={1} c={wait >= 30 ? "red.8" : "orange.9"}>
                        {wait} min
                      </Text>
                      <Text fz="xs" c="gray.7">
                        since {toClock(a.checkedInAt ?? now)}
                      </Text>
                    </Box>
                  </Group>
                  {p && p.alerts.length > 0 && (
                    <Box mt={8}>
                      <AlertBadges alerts={p.alerts} size="sm" />
                    </Box>
                  )}
                  <Button mt="sm" size="sm" variant="white" color="dark" fullWidth leftSection={<IconDoorEnter size={18} aria-hidden />} onClick={() => onStart(a)} aria-label={`Send to exam: ${p?.name}`}>
                    Send to exam
                  </Button>
                </Paper>
              </li>
            );
          })}
        </Stack>
      )}
    </Paper>
  );
}

function AppointmentRow({
  a,
  now,
  onCheckIn,
  onStart,
  onDone,
}: {
  a: Appointment;
  now: number;
  onCheckIn: () => void;
  onStart: () => void;
  onDone: () => void;
}) {
  const p = getPatient(a.patient);
  const o = getOwner(p?.owner ?? "");
  const v = getVet(a.vet);
  const cancelled = a.status === "cancelled";
  const done = a.status === "done";
  const urgent = Boolean(a.urgent) && !cancelled && !done;
  const late = a.status === "booked" && toMinutes(a.start) + 5 < now;

  return (
    <Paper
      withBorder
      p="sm"
      bg={urgent ? "red.0" : cancelled || done ? "gray.0" : "white"}
      style={{
        borderLeft: `6px solid ${
          urgent ? "var(--mantine-color-red-7)" : `var(--mantine-color-${statusColor[a.status]}-${a.status === "booked" ? 4 : 6})`
        }`,
        opacity: cancelled ? 0.65 : 1,
      }}
    >
      <Flex direction={{ base: "column", sm: "row" }} align={{ base: "stretch", sm: "flex-start" }} gap="sm">
      <Group align="flex-start" wrap="nowrap" gap="sm" style={{ flex: 1, minWidth: 0 }}>
        <Box w={{ base: 60, sm: 78 }} style={{ flexShrink: 0 }}>
          <Text fw={800} fz={{ base: "lg", sm: "xl" }} lh={1.1} td={cancelled ? "line-through" : undefined}>
            {a.start}
          </Text>
          <Text fz="xs" c="gray.7">
            to {endTime(a)}
          </Text>
        </Box>

        <Stack gap={6} style={{ flex: 1, minWidth: 0 }}>
          <Group gap="xs" align="center">
            <Text fw={700} fz="lg" lh={1.2}>
              <Anchor component={Link} href={`/patients/${a.patient}`} c="inherit" underline="hover">
                {p?.name}
              </Anchor>
            </Text>
            <Text c="gray.7" fz="sm">
              {p?.species} · {o.name}
            </Text>
            {urgent && (
              <Badge color="red.8" variant="filled" leftSection={<IconFlag3Filled size={12} aria-hidden />}>
                Urgent
              </Badge>
            )}
          </Group>
          <Text fz="md" fw={urgent ? 700 : 400}>
            {a.reason}
          </Text>
          {p && p.alerts.length > 0 && <AlertBadges alerts={p.alerts} size="sm" />}
          <Group gap={6}>
            <ColorSwatch size={10} color={`var(--mantine-color-${v.color}-6)`} aria-hidden />
            <Text fz="sm" c="gray.7">
              {v.name} · {v.room} · {a.minutes} min
            </Text>
          </Group>
        </Stack>

      </Group>
        <Flex direction={{ base: "row", sm: "column" }} gap={8} align={{ base: "center", sm: "flex-end" }} justify={{ base: "space-between", sm: "flex-start" }} wrap="wrap" style={{ flexShrink: 0 }}>
          <Badge color={statusColor[a.status]} variant={a.status === "booked" || cancelled ? "outline" : "light"} size="lg">
            {statusLabel[a.status]}
          </Badge>
          {late && (
            <Text fz="xs" c="red.8" fw={700}>
              Not arrived
            </Text>
          )}
          {a.status === "booked" && (
            <Button size="sm" h={40} leftSection={<IconCheck size={18} aria-hidden />} onClick={onCheckIn} aria-label={`Check in: ${p?.name}`}>
              Check in
            </Button>
          )}
          {a.status === "checked_in" && (
            <Button size="sm" h={40} variant="light" color="blue" leftSection={<IconDoorEnter size={18} aria-hidden />} onClick={onStart} aria-label={`To exam: ${p?.name}`}>
              To exam
            </Button>
          )}
          {a.status === "in_exam" && (
            <Button size="sm" h={40} variant="light" color="teal" leftSection={<IconStethoscope size={18} aria-hidden />} onClick={onDone} aria-label={`Mark done: ${p?.name}`}>
              Mark done
            </Button>
          )}
        </Flex>
      </Flex>
    </Paper>
  );
}
