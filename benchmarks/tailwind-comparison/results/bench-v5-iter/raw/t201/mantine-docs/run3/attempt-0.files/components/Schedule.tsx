"use client";

import { useEffect, useMemo, useState } from "react";
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
  Text,
  Title,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import {
  IconAlarm,
  IconCalendarPlus,
  IconCheck,
  IconClockHour4,
  IconFlame,
  IconLogin2,
  IconPlayerPlay,
  IconStethoscope,
} from "@tabler/icons-react";
import {
  type Appointment,
  NOW_START,
  TODAY,
  getOwner,
  getPatient,
  getVet,
  initialAppointments,
  vets,
} from "@/lib/data";
import { endOf, fmtDate, fmtWait, fromMin, statusColor, statusLabel, toMin } from "@/lib/utils";
import { AlertBadges } from "./AlertBadges";
import { BookingModal } from "./BookingModal";

const LONG_WAIT = 30;

export function Schedule() {
  const [appts, setAppts] = useState<Appointment[]>(initialAppointments);
  const [now, setNow] = useState(NOW_START);
  const [vetFilter, setVetFilter] = useState("all");
  const [hideFinished, setHideFinished] = useState(false);
  const [lastAdded, setLastAdded] = useState<string | null>(null);
  const [opened, { open, close }] = useDisclosure(false);

  useEffect(() => {
    const id = window.setInterval(() => setNow((n) => n + 1), 60_000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (!lastAdded) return;
    const id = window.setTimeout(() => setLastAdded(null), 6000);
    return () => window.clearTimeout(id);
  }, [lastAdded]);

  const setStatus = (id: string, status: Appointment["status"]) =>
    setAppts((list) =>
      list.map((a) =>
        a.id === id ? { ...a, status, checkedInAt: status === "checked_in" ? now : a.checkedInAt } : a,
      ),
    );

  const checkIn = (a: Appointment) => {
    setStatus(a.id, "checked_in");
    const p = getPatient(a.patient);
    notifications.show({
      title: `${p?.name ?? "Patient"} checked in`,
      message: `Added to the waiting list for ${getVet(a.vet)?.name}.`,
      color: "teal",
      icon: <IconCheck size={18} aria-hidden />,
    });
  };

  const book = (n: { patient: string; vet: string; start: string; minutes: number; reason: string }) => {
    const id = `a-${String(appts.length + 1).padStart(2, "0")}`;
    setAppts((list) => [...list, { id, ...n, status: "booked" }]);
    setLastAdded(id);
    close();
    notifications.show({
      title: "Appointment booked",
      message: `${getPatient(n.patient)?.name} with ${getVet(n.vet)?.name} at ${n.start}.`,
      color: "teal",
      icon: <IconCalendarPlus size={18} aria-hidden />,
    });
  };

  const sorted = useMemo(
    () => [...appts].sort((a, b) => toMin(a.start) - toMin(b.start) || a.vet.localeCompare(b.vet)),
    [appts],
  );
  const visible = sorted.filter(
    (a) =>
      (vetFilter === "all" || a.vet === vetFilter) && !(hideFinished && (a.status === "done" || a.status === "cancelled")),
  );
  const waiting = appts
    .filter((a) => a.status === "checked_in")
    .sort((a, b) => (a.checkedInAt ?? 0) - (b.checkedInAt ?? 0));
  const inExam = appts.filter((a) => a.status === "in_exam").length;
  const toCome = appts.filter((a) => a.status === "booked").length;
  const longest = waiting.length ? now - (waiting[0].checkedInAt ?? now) : 0;

  return (
    <Stack gap="lg">
      <Group justify="space-between" align="flex-end" wrap="wrap" gap="md">
        <div>
          <Title order={1} size="h2">
            Today&apos;s schedule
          </Title>
          <Text c="dimmed" size="sm">
            {fmtDate(TODAY, { weekday: "long", month: "long" })} · clock {fromMin(now)}
          </Text>
        </div>
        <Button size="lg" leftSection={<IconCalendarPlus size={22} aria-hidden />} onClick={open} h={48}>
          Book appointment
        </Button>
      </Group>

      <SimpleGrid cols={{ base: 2, md: 4 }} spacing="sm">
        <Stat icon={<IconClockHour4 size={20} aria-hidden />} label="Waiting now" value={String(waiting.length)} color="orange" />
        <Stat icon={<IconStethoscope size={20} aria-hidden />} label="In exam" value={String(inExam)} color="blue" />
        <Stat icon={<IconAlarm size={20} aria-hidden />} label="Still to arrive" value={String(toCome)} color="gray" />
        <Stat
          icon={<IconClockHour4 size={20} aria-hidden />}
          label="Longest wait"
          value={waiting.length ? fmtWait(longest) : "None"}
          color={longest >= LONG_WAIT ? "red" : "teal"}
        />
      </SimpleGrid>

      <Grid gap="lg">
        <Grid.Col span={{ base: 12, lg: 4 }} order={{ base: 1, lg: 2 }}>
          <WaitingList waiting={waiting} now={now} />
        </Grid.Col>

        <Grid.Col span={{ base: 12, lg: 8 }} order={{ base: 2, lg: 1 }}>
        <Stack gap="sm">
          <Group justify="space-between" wrap="wrap" gap="sm">
            <Title order={2} size="h3">
              Appointments{" "}
              <Text span c="dimmed" fw={500} size="md">
                ({visible.length})
              </Text>
            </Title>
            <Switch
              label="Hide done and cancelled"
              checked={hideFinished}
              onChange={(e) => setHideFinished(e.currentTarget.checked)}
              size="md"
            />
          </Group>
          <SegmentedControl
            aria-label="Filter by vet"
            size="md"
            fullWidth
            value={vetFilter}
            onChange={setVetFilter}
            data={[
              { value: "all", label: "All vets" },
              ...vets.map((v) => ({ value: v.id, label: v.name.replace(/^Dr\. \S+ /, "") })),
            ]}
          />
          <Stack gap="sm" component="ul" p={0} m={0} style={{ listStyle: "none" }} aria-label="Appointments today">
            {visible.map((a) => (
              <li key={a.id}>
                <Row
                  a={a}
                  highlight={a.id === lastAdded}
                  onCheckIn={() => checkIn(a)}
                  onStart={() => setStatus(a.id, "in_exam")}
                  onDone={() => setStatus(a.id, "done")}
                />
              </li>
            ))}
            {visible.length === 0 && (
              <Paper withBorder p="lg">
                <Text c="dimmed">No appointments match this view.</Text>
              </Paper>
            )}
          </Stack>
        </Stack>
        </Grid.Col>
      </Grid>

      <BookingModal opened={opened} onClose={close} appointments={appts} onBook={book} />
    </Stack>
  );
}

function Stat({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <Paper withBorder p="md">
      <Group gap="xs" c={`${color}.8`} wrap="nowrap">
        {icon}
        <Text size="sm" fw={600} c="dimmed">
          {label}
        </Text>
      </Group>
      <Text fz={28} fw={750} lh={1.2} mt={4}>
        {value}
      </Text>
    </Paper>
  );
}

function WaitingList({ waiting, now }: { waiting: Appointment[]; now: number }) {
  return (
    <Paper withBorder p="md" component="section" aria-labelledby="waiting-title">
      <Group justify="space-between" mb="sm">
        <Title order={2} size="h3" id="waiting-title">
          Waiting room
        </Title>
        <Badge color="orange" variant="light" size="lg">
          {waiting.length} waiting
        </Badge>
      </Group>
      {waiting.length === 0 ? (
        <Text c="dimmed" size="sm">
          Nobody is waiting. Check in a patient from the schedule when they arrive.
        </Text>
      ) : (
        <Stack gap="xs" component="ol" p={0} m={0} style={{ listStyle: "none" }}>
          {waiting.map((a, i) => {
            const p = getPatient(a.patient);
            const wait = now - (a.checkedInAt ?? now);
            const long = wait >= LONG_WAIT;
            return (
              <Paper
                component="li"
                key={a.id}
                p="sm"
                bg={long ? "var(--mantine-color-orange-light)" : "var(--mantine-color-default-hover)"}
              >
                <Group justify="space-between" wrap="nowrap" align="flex-start" gap="xs">
                  <div style={{ minWidth: 0 }}>
                    <Group gap={6} wrap="wrap">
                      {i === 0 && (
                        <Badge size="sm" color="teal" variant="filled">
                          Next
                        </Badge>
                      )}
                      <Anchor component={Link} href={`/patients/${a.patient}`} fw={700} c="inherit">
                        {p?.name}
                      </Anchor>
                      <Text size="sm" c="dimmed">
                        {getOwner(p?.owner ?? "")?.name}
                      </Text>
                    </Group>
                    <Text size="sm">
                      {a.reason} · {getVet(a.vet)?.name}, {getVet(a.vet)?.room}
                    </Text>
                    <Text size="xs" c="dimmed">
                      Appointment {a.start}, checked in {fromMin(a.checkedInAt ?? now)}
                    </Text>
                  </div>
                  <Text fw={750} size="md" c={long ? "orange.9" : undefined} style={{ whiteSpace: "nowrap" }}>
                    {fmtWait(wait)}
                  </Text>
                </Group>
                {p && p.alerts.length > 0 && (
                  <Box mt={6}>
                    <AlertBadges alerts={p.alerts} size="sm" />
                  </Box>
                )}
              </Paper>
            );
          })}
        </Stack>
      )}
    </Paper>
  );
}

function Row({
  a,
  highlight,
  onCheckIn,
  onStart,
  onDone,
}: {
  a: Appointment;
  highlight: boolean;
  onCheckIn: () => void;
  onStart: () => void;
  onDone: () => void;
}) {
  const p = getPatient(a.patient);
  const owner = getOwner(p?.owner ?? "");
  const vet = getVet(a.vet);
  const inactive = a.status === "cancelled" || a.status === "done";
  const name = p?.name ?? "patient";

  return (
    <Paper
      withBorder
      p="md"
      style={{
        borderLeft: a.urgent ? "6px solid var(--mantine-color-red-7)" : undefined,
        borderColor: highlight ? "var(--mantine-color-teal-6)" : undefined,
        boxShadow: highlight ? "0 0 0 2px var(--mantine-color-teal-6)" : undefined,
        background: a.urgent ? "light-dark(var(--mantine-color-red-0), var(--mantine-color-dark-6))" : undefined,
        opacity: a.status === "cancelled" ? 0.7 : 1,
      }}
    >
      <Group align="flex-start" wrap="wrap" gap="md" justify="space-between">
        <Group align="flex-start" wrap="nowrap" gap="md" style={{ flex: "1 1 300px", minWidth: 0 }}>
          <div style={{ width: 62, flexShrink: 0 }}>
            <Text fw={750} fz={20} lh={1.1} td={a.status === "cancelled" ? "line-through" : undefined}>
              {a.start}
            </Text>
            <Text size="xs" c="dimmed">
              to {endOf(a)}
            </Text>
          </div>
          <Stack gap={4} style={{ minWidth: 0, flex: 1 }}>
            <Group gap="xs" align="center">
              <Anchor component={Link} href={`/patients/${a.patient}`} fw={750} fz="lg" c="inherit" underline="hover">
                {name}
              </Anchor>
              <Text size="sm" c="dimmed">
                {p?.species}, {p?.breed}
              </Text>
              {a.urgent && (
                <Badge color="red.7" variant="filled" leftSection={<IconFlame size={13} aria-hidden />}>
                  Urgent
                </Badge>
              )}
            </Group>
            <Text size="md" fw={500}>
              {a.reason}
            </Text>
            <Text size="sm" c="dimmed">
              {vet?.name} · {vet?.room} · Owner {owner?.name}, {owner?.phone}
            </Text>
            {p && p.alerts.length > 0 && !inactive && (
              <Box mt={4}>
                <AlertBadges alerts={p.alerts} size="md" />
              </Box>
            )}
            {p && p.alerts.length > 0 && inactive && (
              <Box mt={4}>
                <AlertBadges alerts={p.alerts} size="sm" />
              </Box>
            )}
          </Stack>
        </Group>

        <Group
          gap="sm"
          justify="space-between"
          wrap="nowrap"
          w={{ base: "100%", sm: 270 }}
          style={{ flexDirection: "row" }}
        >
          <Badge color={statusColor[a.status]} variant={a.status === "in_exam" ? "filled" : "light"} size="lg">
            {statusLabel[a.status]}
          </Badge>
          {a.status === "booked" && (
            <Button
              size="md"
              h={44}
              leftSection={<IconLogin2 size={18} aria-hidden />}
              onClick={onCheckIn}
              aria-label={`Check in ${name}`}
            >
              Check in
            </Button>
          )}
          {a.status === "checked_in" && (
            <Button
              size="md"
              h={44}
              variant="light"
              leftSection={<IconPlayerPlay size={18} aria-hidden />}
              onClick={onStart}
              aria-label={`Start exam for ${name}`}
            >
              Start exam
            </Button>
          )}
          {a.status === "in_exam" && (
            <Button
              size="md"
              h={44}
              variant="light"
              color="teal"
              leftSection={<IconCheck size={18} aria-hidden />}
              onClick={onDone}
              aria-label={`Mark done, ${name}`}
            >
              Mark done
            </Button>
          )}
        </Group>
      </Group>
    </Paper>
  );
}
