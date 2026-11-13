"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Anchor,
  Badge,
  Box,
  Button,
  Grid,
  Group,
  Paper,
  SegmentedControl,
  SimpleGrid,
  Stack,
  Switch,
  Table,
  Text,
  Title,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import {
  IconAlertCircleFilled,
  IconCalendarPlus,
  IconCheck,
  IconClock,
  IconUserCheck,
} from "@tabler/icons-react";
import {
  type Appointment,
  type Status,
  NOW_START,
  TODAY,
  endOf,
  fmt12,
  fmtDateLong,
  fromMin,
  getOwner,
  getPatient,
  getVet,
  initialAppointments,
  statusMeta,
  toMin,
  vets,
} from "@/lib/data";
import { AlertFlags } from "./AlertFlags";
import { BookingModal } from "./BookingModal";

function StatusBadge({ status }: { status: Status }) {
  const meta = statusMeta[status];
  return (
    <Badge
      size="lg"
      variant={status === "cancelled" ? "outline" : "light"}
      color={meta.color}
      c={`light-dark(var(--mantine-color-${meta.color}-9), var(--mantine-color-${meta.color}-2))`}
      style={{ flexShrink: 0 }}
    >
      {meta.label}
    </Badge>
  );
}

function UrgentBadge() {
  return (
    <Badge
      color="red.9"
      variant="filled"
      size="lg"
      leftSection={<IconAlertCircleFilled size={14} aria-hidden />}
    >
      Urgent
    </Badge>
  );
}

function PatientCell({ a }: { a: Appointment }) {
  const patient = getPatient(a.patient);
  const owner = patient ? getOwner(patient.owner) : undefined;
  if (!patient) return null;
  return (
    <Stack gap={4}>
      <Box>
        <Anchor component={Link} href={`/patients/${patient.id}`} fw={700} size="md" c="inherit">
          {patient.name}
        </Anchor>{" "}
        <Text span size="sm" c="dimmed">
          {patient.species}, {patient.breed}
        </Text>
        <Text size="sm" c="dimmed">
          {owner?.name}
        </Text>
      </Box>
      <AlertFlags alerts={patient.alerts} />
    </Stack>
  );
}

function CheckInButton({
  a,
  onCheckIn,
  fullWidth,
}: {
  a: Appointment;
  onCheckIn: (id: string) => void;
  fullWidth?: boolean;
}) {
  const patient = getPatient(a.patient);
  return (
    <Button
      size="md"
      fullWidth={fullWidth}
      leftSection={<IconUserCheck size={18} aria-hidden />}
      onClick={() => onCheckIn(a.id)}
      aria-label={`Check in ${patient?.name ?? "patient"}`}
    >
      Check in
    </Button>
  );
}

export function Schedule() {
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const [nowMin, setNowMin] = useState(() => toMin(NOW_START));
  const [vetFilter, setVetFilter] = useState("all");
  const [hideFinished, setHideFinished] = useState(false);
  const [bookingOpen, booking] = useDisclosure(false);
  const [highlight, setHighlight] = useState<string | null>(null);

  // The counter clock starts at 9:50 and moves on while the page stays open.
  useEffect(() => {
    const startedAt = Date.now();
    const base = toMin(NOW_START);
    const id = window.setInterval(() => {
      setNowMin(base + Math.floor((Date.now() - startedAt) / 60000));
    }, 15000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (!highlight) return;
    const id = window.setTimeout(() => setHighlight(null), 5000);
    return () => window.clearTimeout(id);
  }, [highlight]);

  const checkIn = (id: string) => {
    const appt = appointments.find((a) => a.id === id);
    if (!appt || appt.status !== "booked") return;
    setAppointments((list) =>
      list.map((a) => (a.id === id ? { ...a, status: "checked_in", checkedInAt: fromMin(nowMin) } : a)),
    );
    const patient = getPatient(appt.patient);
    const vet = getVet(appt.vet);
    const alerts = patient?.alerts ?? [];
    notifications.show({
      color: alerts.length > 0 ? "red.9" : "teal.8",
      icon: <IconCheck size={18} aria-hidden />,
      title: `${patient?.name ?? "Patient"} checked in`,
      message:
        alerts.length > 0
          ? `Waiting for ${vet?.name}. Medical alert: ${alerts.join("; ")}.`
          : `Waiting for ${vet?.name} (${vet?.room}).`,
    });
  };

  const book = (draft: Omit<Appointment, "id">) => {
    const id = `a-${String(appointments.length + 1).padStart(2, "0")}`;
    setAppointments((list) => [...list, { id, ...draft }]);
    setHighlight(id);
    booking.close();
    const patient = getPatient(draft.patient);
    const vet = getVet(draft.vet);
    notifications.show({
      color: "teal.8",
      icon: <IconCalendarPlus size={18} aria-hidden />,
      title: "Appointment booked",
      message: `${patient?.name} with ${vet?.name} at ${fmt12(draft.start)}.`,
    });
  };

  const sorted = [...appointments].sort(
    (a, b) => toMin(a.start) - toMin(b.start) || a.vet.localeCompare(b.vet),
  );
  const visible = sorted.filter(
    (a) =>
      (vetFilter === "all" || a.vet === vetFilter) &&
      !(hideFinished && (a.status === "done" || a.status === "cancelled")),
  );

  const waiting = appointments
    .filter((a) => a.status === "checked_in")
    .sort((a, b) => toMin(a.checkedInAt ?? "00:00") - toMin(b.checkedInAt ?? "00:00"));
  const comingUp = sorted.filter((a) => a.status === "booked").slice(0, 3);
  const count = (s: Status) => appointments.filter((a) => a.status === s).length;

  const rowStyle = (a: Appointment): React.CSSProperties => ({
    background: a.urgent && a.status !== "cancelled" ? "var(--mantine-color-red-light)" : undefined,
    opacity: a.status === "cancelled" ? 0.6 : a.status === "done" ? 0.78 : 1,
    outline: highlight === a.id ? "3px solid var(--mantine-color-teal-6)" : undefined,
    outlineOffset: -3,
  });

  const stats: { label: string; value: number }[] = [
    { label: "Waiting", value: count("checked_in") },
    { label: "In exam", value: count("in_exam") },
    { label: "Still to arrive", value: count("booked") },
    { label: "Done", value: count("done") },
  ];

  return (
    <Stack gap="md" pb="xl">
      <Group justify="space-between" align="flex-end" gap="sm">
        <Box>
          <Title order={1} size="h2">
            Today&rsquo;s schedule
          </Title>
          <Text c="dimmed" size="sm">
            {fmtDateLong(TODAY)}, now {fmt12(fromMin(nowMin))}
          </Text>
        </Box>
        <Button
          size="md"
          leftSection={<IconCalendarPlus size={20} aria-hidden />}
          onClick={booking.open}
        >
          Book appointment
        </Button>
      </Group>

      <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="sm">
        {stats.map((s) => (
          <Paper key={s.label} withBorder p="sm" radius="md">
            <Text size="xs" c="dimmed" fw={600} tt="uppercase" style={{ letterSpacing: 0.4 }}>
              {s.label}
            </Text>
            <Text fz={30} fw={800} lh={1.1}>
              {s.value}
            </Text>
          </Paper>
        ))}
      </SimpleGrid>

      <Grid gap="md">
        <Grid.Col span={{ base: 12, lg: 4 }} order={{ base: 1, lg: 2 }}>
          <Stack gap="md">
            <Paper withBorder p="md" radius="md" component="section" aria-labelledby="waiting-title">
              <Group justify="space-between" mb="sm">
                <Title order={2} size="h4" id="waiting-title">
                  Waiting room
                </Title>
                <Badge size="lg" color="orange" variant="light" c="orange.9">
                  {waiting.length} waiting
                </Badge>
              </Group>
              <Stack gap="xs" aria-live="polite" role="list">
                {waiting.length === 0 && (
                  <Text size="sm" c="dimmed" role="listitem">
                    No one is waiting. Check in a patient when they arrive.
                  </Text>
                )}
                {waiting.map((a, i) => {
                  const patient = getPatient(a.patient);
                  const vet = getVet(a.vet);
                  const owner = patient ? getOwner(patient.owner) : undefined;
                  const mins = Math.max(0, nowMin - toMin(a.checkedInAt ?? fromMin(nowMin)));
                  const long = mins >= 20;
                  return (
                    <Paper key={a.id} withBorder p="sm" radius="md" role="listitem">
                      <Group justify="space-between" align="flex-start" wrap="nowrap" gap="xs">
                        <Box>
                          <Group gap={6}>
                            {i === 0 && (
                              <Badge size="sm" color="teal.8" variant="filled">
                                Next
                              </Badge>
                            )}
                            <Anchor component={Link} href={`/patients/${a.patient}`} fw={700} c="inherit">
                              {patient?.name}
                            </Anchor>
                            <Text size="sm" c="dimmed">
                              {owner?.name}
                            </Text>
                          </Group>
                          <Text size="sm">{a.reason}</Text>
                          <Text size="sm" c="dimmed">
                            {vet?.name}, {vet?.room}
                          </Text>
                        </Box>
                        <Badge
                          size="lg"
                          variant={long ? "filled" : "light"}
                          color={long ? "orange.9" : "orange"}
                          c={long ? "white" : "orange.9"}
                          leftSection={<IconClock size={14} aria-hidden />}
                          style={{ flexShrink: 0 }}
                        >
                          {mins} min
                        </Badge>
                      </Group>
                      {patient && patient.alerts.length > 0 && (
                        <Box mt={6}>
                          <AlertFlags alerts={patient.alerts} />
                        </Box>
                      )}
                    </Paper>
                  );
                })}
              </Stack>
            </Paper>

            <Paper withBorder p="md" radius="md" component="section" aria-labelledby="next-title">
              <Title order={2} size="h4" id="next-title" mb="sm">
                Expected next
              </Title>
              <Stack gap="xs">
                {comingUp.length === 0 && (
                  <Text size="sm" c="dimmed">
                    No more bookings to arrive today.
                  </Text>
                )}
                {comingUp.map((a) => {
                  const patient = getPatient(a.patient);
                  return (
                    <Paper key={a.id} withBorder p="sm" radius="md">
                      <Group justify="space-between" wrap="nowrap" gap="xs">
                        <Box>
                          <Text size="sm" fw={700}>
                            {fmt12(a.start)}{" "}
                            <Text span fw={700}>
                              {patient?.name}
                            </Text>
                            {a.urgent && (
                              <Text span c="red.9" fw={800}>
                                {" "}
                                URGENT
                              </Text>
                            )}
                          </Text>
                          <Text size="sm" c="dimmed">
                            {a.reason}
                          </Text>
                        </Box>
                        <CheckInButton a={a} onCheckIn={checkIn} />
                      </Group>
                      {patient && patient.alerts.length > 0 && (
                        <Box mt={6}>
                          <AlertFlags alerts={patient.alerts} />
                        </Box>
                      )}
                    </Paper>
                  );
                })}
              </Stack>
            </Paper>
          </Stack>
        </Grid.Col>

        <Grid.Col span={{ base: 12, lg: 8 }} order={{ base: 2, lg: 1 }}>
          <Paper withBorder radius="md" p={{ base: "sm", sm: "md" }} component="section" aria-labelledby="sched-title">
            <Stack gap="md">
              <Group justify="space-between" gap="sm">
                <Title order={2} size="h4" id="sched-title">
                  All appointments
                </Title>
                <Switch
                  label="Hide done and cancelled"
                  checked={hideFinished}
                  onChange={(e) => setHideFinished(e.currentTarget.checked)}
                />
              </Group>
              <SegmentedControl
                fullWidth
                size="md"
                aria-label="Filter by vet"
                value={vetFilter}
                onChange={setVetFilter}
                data={[
                  { value: "all", label: "All vets" },
                  ...vets.map((v) => ({ value: v.id, label: v.name.replace("Dr. ", "").split(" ").pop() ?? v.name })),
                ]}
              />

              {visible.length === 0 && (
                <Text c="dimmed" ta="center" py="lg">
                  Nothing matches these filters.
                </Text>
              )}

              {visible.length > 0 && (
                <Table verticalSpacing="sm" visibleFrom="sm" aria-label="Today's appointments">
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th scope="col">Time</Table.Th>
                      <Table.Th scope="col">Patient</Table.Th>
                      <Table.Th scope="col">Reason</Table.Th>
                      <Table.Th scope="col">Vet</Table.Th>
                      <Table.Th scope="col">Status</Table.Th>
                      <Table.Th scope="col">
                        <span style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>
                          Action
                        </span>
                      </Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {visible.map((a) => {
                      const vet = getVet(a.vet);
                      return (
                        <Table.Tr key={a.id} style={rowStyle(a)}>
                          <Table.Td style={{ whiteSpace: "nowrap" }}>
                            <Text fw={700}>{fmt12(a.start)}</Text>
                            <Text size="xs" c="dimmed">
                              {a.minutes} min, to {fmt12(endOf(a))}
                            </Text>
                          </Table.Td>
                          <Table.Td>
                            <PatientCell a={a} />
                          </Table.Td>
                          <Table.Td>
                            <Stack gap={4} align="flex-start">
                              {a.urgent && a.status !== "cancelled" && <UrgentBadge />}
                              <Text
                                size="sm"
                                td={a.status === "cancelled" ? "line-through" : undefined}
                                fw={a.urgent ? 700 : 400}
                              >
                                {a.reason}
                              </Text>
                            </Stack>
                          </Table.Td>
                          <Table.Td>
                            <Text size="sm" fw={600}>
                              {vet?.name}
                            </Text>
                            <Text size="xs" c="dimmed">
                              {vet?.room}
                            </Text>
                          </Table.Td>
                          <Table.Td>
                            <StatusBadge status={a.status} />
                          </Table.Td>
                          <Table.Td style={{ textAlign: "right" }}>
                            {a.status === "booked" && <CheckInButton a={a} onCheckIn={checkIn} />}
                            {a.status === "checked_in" && (
                              <Text size="sm" c="dimmed" fw={600}>
                                Waiting {Math.max(0, nowMin - toMin(a.checkedInAt ?? fromMin(nowMin)))} min
                              </Text>
                            )}
                          </Table.Td>
                        </Table.Tr>
                      );
                    })}
                  </Table.Tbody>
                </Table>
              )}

              <Stack gap="sm" hiddenFrom="sm" role="list" aria-label="Today's appointments">
                {visible.map((a) => {
                  const vet = getVet(a.vet);
                  return (
                    <Paper
                      key={a.id}
                      withBorder
                      p="sm"
                      radius="md"
                      role="listitem"
                      style={{
                        ...rowStyle(a),
                        borderLeft: a.urgent && a.status !== "cancelled" ? "6px solid var(--mantine-color-red-9)" : undefined,
                      }}
                    >
                      <Stack gap="xs">
                        <Group justify="space-between" wrap="nowrap">
                          <Text fw={800} size="lg">
                            {fmt12(a.start)}
                            <Text span size="xs" c="dimmed" fw={400}>
                              {" "}
                              {a.minutes} min
                            </Text>
                          </Text>
                          <StatusBadge status={a.status} />
                        </Group>
                        <PatientCell a={a} />
                        <Group gap="xs">
                          {a.urgent && a.status !== "cancelled" && <UrgentBadge />}
                          <Text size="sm" td={a.status === "cancelled" ? "line-through" : undefined} fw={a.urgent ? 700 : 400}>
                            {a.reason}
                          </Text>
                        </Group>
                        <Text size="sm" c="dimmed">
                          {vet?.name}, {vet?.room}
                        </Text>
                        {a.status === "booked" && <CheckInButton a={a} onCheckIn={checkIn} fullWidth />}
                        {a.status === "checked_in" && (
                          <Text size="sm" c="dimmed" fw={600}>
                            Waiting {Math.max(0, nowMin - toMin(a.checkedInAt ?? fromMin(nowMin)))} min
                          </Text>
                        )}
                      </Stack>
                    </Paper>
                  );
                })}
              </Stack>
            </Stack>
          </Paper>
        </Grid.Col>
      </Grid>

      <BookingModal
        opened={bookingOpen}
        onClose={booking.close}
        appointments={appointments}
        nowMin={nowMin}
        onBook={book}
      />
    </Stack>
  );
}
