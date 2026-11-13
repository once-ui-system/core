"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Anchor,
  Badge,
  Box,
  Button,
  Container,
  Grid,
  Group,
  Paper,
  SegmentedControl,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconBolt, IconCalendarPlus, IconClock, IconLogin2, IconStethoscope } from "@tabler/icons-react";
import { AlertBadges } from "@/components/AlertBadges";
import { clockLabel, useAppState } from "@/components/AppState";
import { BookingModal } from "@/components/BookingModal";
import {
  type Appointment,
  STATUS_LABEL,
  type Status,
  fromMinutes,
  getOwner,
  getPatient,
  getVet,
  toMinutes,
  vets,
} from "@/lib/data";

const STATUS_COLOR: Record<Status, string> = {
  booked: "gray",
  checked_in: "yellow",
  in_exam: "blue",
  done: "teal",
  cancelled: "gray",
};

function StatusBadge({ status }: { status: Status }) {
  const strong = status === "checked_in" || status === "in_exam";
  return (
    <Badge
      color={STATUS_COLOR[status]}
      variant={strong ? "filled" : status === "cancelled" ? "outline" : "light"}
      c={status === "checked_in" ? "dark" : undefined}
      size="lg"
      radius="sm"
      style={status === "cancelled" ? { textDecoration: "line-through" } : undefined}
    >
      {STATUS_LABEL[status]}
    </Badge>
  );
}

const waitColor = (m: number) => (m >= 30 ? "red.8" : m >= 15 ? "orange.8" : "dark.4");

function AppointmentRow({ a, onCheckIn }: { a: Appointment; onCheckIn: (a: Appointment) => void }) {
  const patient = getPatient(a.patient);
  const owner = patient ? getOwner(patient.owner) : undefined;
  const vet = getVet(a.vet);
  const muted = a.status === "done" || a.status === "cancelled";
  const end = fromMinutes(toMinutes(a.start) + a.minutes);
  if (!patient) return null;

  return (
    <Paper
      component="li"
      p="md"
      radius="md"
      style={{
        listStyle: "none",
        borderLeft: a.urgent ? "6px solid var(--mantine-color-red-8)" : undefined,
        background: a.urgent ? "var(--mantine-color-red-0)" : undefined,
        opacity: muted ? 0.72 : 1,
      }}
    >
      <Group align="flex-start" wrap="nowrap" gap="md">
        <Box w={64} style={{ flexShrink: 0 }}>
          <Text fw={800} fz="xl" lh={1.1} style={{ fontVariantNumeric: "tabular-nums" }}>
            {a.start}
          </Text>
          <Text fz="xs" c="dimmed">
            to {end}
          </Text>
        </Box>
        <Stack gap={6} style={{ flex: 1, minWidth: 0 }}>
          <Group gap="xs" align="center">
            <Anchor component={Link} href={`/patients/${patient.id}`} fw={700} fz="lg" c="dark.9">
              {patient.name}
            </Anchor>
            <Text fz="sm" c="dimmed">
              {patient.species}, {patient.breed}
            </Text>
            {a.urgent && (
              <Badge color="red.8" variant="filled" size="md" leftSection={<IconBolt size={13} aria-hidden />}>
                Urgent
              </Badge>
            )}
          </Group>
          <AlertBadges alerts={patient.alerts} />
          <Text fz="sm">{a.reason}</Text>
          <Text fz="sm" c="dimmed">
            Owner {owner?.name} · {vet?.name}, {vet?.room}
          </Text>
        </Stack>
        <Stack gap={8} align="flex-end" style={{ flexShrink: 0 }}>
          <StatusBadge status={a.status} />
          {a.status === "booked" && (
            <Button
              size="sm"
              leftSection={<IconLogin2 size={18} aria-hidden />}
              onClick={() => onCheckIn(a)}
              aria-label={`Check in ${patient.name}`}
              mih={44}
            >
              Check in
            </Button>
          )}
        </Stack>
      </Group>
    </Paper>
  );
}

export function Dashboard() {
  const { appointments, now, checkIn } = useAppState();
  const [vetFilter, setVetFilter] = useState("all");
  const [booking, setBooking] = useState(false);

  const schedule = useMemo(
    () =>
      appointments
        .filter((a) => vetFilter === "all" || a.vet === vetFilter)
        .slice()
        .sort((x, y) => toMinutes(x.start) - toMinutes(y.start) || x.vet.localeCompare(y.vet)),
    [appointments, vetFilter],
  );

  const waiting = useMemo(
    () =>
      appointments
        .filter((a) => a.status === "checked_in")
        .slice()
        .sort((x, y) => (x.checkedInAt ?? 0) - (y.checkedInAt ?? 0)),
    [appointments],
  );

  const counts = {
    waiting: waiting.length,
    inExam: appointments.filter((a) => a.status === "in_exam").length,
    todo: appointments.filter((a) => a.status === "booked").length,
    done: appointments.filter((a) => a.status === "done").length,
  };

  const handleCheckIn = (a: Appointment) => {
    checkIn(a.id);
    notifications.show({
      color: "teal",
      title: "Checked in",
      message: `${getPatient(a.patient)?.name} is now on the waiting list`,
    });
  };

  return (
    <Container size="xl" py={{ base: "md", sm: "xl" }} px={{ base: "sm", sm: "lg" }}>
      <Group justify="space-between" align="flex-end" mb="lg" gap="md">
        <Box>
          <Text fz="sm" c="dimmed" fw={600} tt="uppercase" style={{ letterSpacing: 0.6 }}>
            Thursday 12 November 2026 · {clockLabel(now)}
          </Text>
          <Title order={1} fz={{ base: 28, sm: 34 }}>
            Today&apos;s schedule
          </Title>
        </Box>
        <Button size="lg" leftSection={<IconCalendarPlus size={22} aria-hidden />} onClick={() => setBooking(true)}>
          Book appointment
        </Button>
      </Group>

      <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="sm" mb="lg">
        <Stat label="Waiting" value={counts.waiting} accent />
        <Stat label="In exam" value={counts.inExam} />
        <Stat label="Still to arrive" value={counts.todo} />
        <Stat label="Done" value={counts.done} />
      </SimpleGrid>

      <Grid gap="lg">
        <Grid.Col span={{ base: 12, lg: 4 }} order={{ base: 1, lg: 2 }}>
          <Paper p="md" radius="md" component="section" aria-labelledby="waiting-h" style={{ position: "sticky", top: 80 }}>
            <Group justify="space-between" mb="sm">
              <Title order={2} fz="xl" id="waiting-h">
                Waiting list
              </Title>
              <Badge size="lg" color="yellow.6" c="dark" variant="filled" aria-label={`${waiting.length} waiting`}>
                {waiting.length}
              </Badge>
            </Group>
            {waiting.length === 0 ? (
              <Text c="dimmed" fz="sm">
                Nobody is waiting. Check patients in as they arrive.
              </Text>
            ) : (
              <Stack gap="sm" component="ol" m={0} p={0} style={{ listStyle: "none" }} aria-live="polite">
                {waiting.map((a, i) => {
                  const p = getPatient(a.patient);
                  const mins = Math.max(0, now - (a.checkedInAt ?? now));
                  const v = getVet(a.vet);
                  return (
                    <Paper component="li" key={a.id} p="sm" radius="md" bg="gray.0">
                      <Group justify="space-between" wrap="nowrap" align="flex-start">
                        <Box style={{ minWidth: 0 }}>
                          <Group gap={6}>
                            <Text fw={800} fz="sm" c="dimmed" aria-label={`Position ${i + 1}`}>
                              {i + 1}.
                            </Text>
                            <Anchor component={Link} href={`/patients/${a.patient}`} fw={700} c="dark.9">
                              {p?.name}
                            </Anchor>
                            {a.urgent && (
                              <Badge color="red.8" variant="filled" size="sm">
                                Urgent
                              </Badge>
                            )}
                          </Group>
                          <Text fz="xs" c="dimmed" mb={4}>
                            {a.reason} · {v?.name}
                          </Text>
                          {p && <AlertBadges alerts={p.alerts} />}
                        </Box>
                        <Box ta="right" style={{ flexShrink: 0 }}>
                          <Group gap={4} justify="flex-end" wrap="nowrap">
                            <IconClock size={16} aria-hidden />
                            <Text fw={800} fz="lg" c={waitColor(mins)} style={{ fontVariantNumeric: "tabular-nums" }}>
                              {mins} min
                            </Text>
                          </Group>
                          <Text fz="xs" c="dimmed">
                            since {fromMinutes(a.checkedInAt ?? now)}
                          </Text>
                        </Box>
                      </Group>
                    </Paper>
                  );
                })}
              </Stack>
            )}
          </Paper>
        </Grid.Col>

        <Grid.Col span={{ base: 12, lg: 8 }} order={{ base: 2, lg: 1 }}>
          <Group justify="space-between" mb="sm" gap="sm">
            <Group gap="xs">
              <IconStethoscope size={22} aria-hidden />
              <Title order={2} fz="xl">
                Appointments
              </Title>
              <Text c="dimmed" fz="sm">
                {schedule.length} shown
              </Text>
            </Group>
            <SegmentedControl
              size="md"
              value={vetFilter}
              onChange={setVetFilter}
              aria-label="Filter by vet"
              data={[
                { value: "all", label: "All vets" },
                ...vets.map((v) => ({ value: v.id, label: `Dr. ${v.name.split(" ").pop()}` })),
              ]}
              style={{ maxWidth: "100%", overflowX: "auto" }}
            />
          </Group>
          <Stack gap="sm" component="ul" m={0} p={0}>
            {schedule.map((a) => (
              <AppointmentRow key={a.id} a={a} onCheckIn={handleCheckIn} />
            ))}
          </Stack>
        </Grid.Col>
      </Grid>

      <BookingModal opened={booking} onClose={() => setBooking(false)} />
    </Container>
  );
}

function Stat({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <Paper p="md" radius="md" bg={accent ? "yellow.1" : undefined}>
      <Text fz="xs" c="dimmed" fw={700} tt="uppercase" style={{ letterSpacing: 0.5 }}>
        {label}
      </Text>
      <Text fz={32} fw={800} lh={1.1}>
        {value}
      </Text>
    </Paper>
  );
}
