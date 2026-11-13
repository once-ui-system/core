"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Anchor,
  Badge,
  Box,
  Button,
  Checkbox,
  Flex,
  Grid,
  Group,
  Modal,
  Paper,
  SegmentedControl,
  Select,
  SimpleGrid,
  Stack,
  Switch,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import {
  IconBolt,
  IconCalendarPlus,
  IconCheck,
  IconClock,
  IconStethoscope,
  IconUserCheck,
} from "@tabler/icons-react";
import {
  type Appointment,
  DAY_END_MIN,
  DAY_START_MIN,
  START_NOW_MIN,
  STATUS_META,
  TODAY,
  appointments as seedAppointments,
  findClash,
  fmtClock,
  fmtDate,
  ownerById,
  patientById,
  patients,
  toMin,
  vetById,
  vets,
} from "@/lib/data";
import { AlertBadges } from "./Alerts";

const DURATIONS = [15, 20, 30, 45, 60].map((m) => ({ value: String(m), label: `${m} minutes` }));

export function Schedule() {
  const [appts, setAppts] = useState<Appointment[]>(seedAppointments);
  const [nowMin, setNowMin] = useState(START_NOW_MIN);
  const [vetFilter, setVetFilter] = useState("all");
  const [hideFinished, setHideFinished] = useState(false);
  const [justBooked, setJustBooked] = useState<string | null>(null);
  const [opened, { open, close }] = useDisclosure(false);

  // The front desk clock moves on while the page stays open.
  useEffect(() => {
    const id = window.setInterval(() => setNowMin((n) => n + 1), 60_000);
    return () => window.clearInterval(id);
  }, []);

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
  const urgentOpen = appts.filter((a) => a.urgent && (a.status === "booked" || a.status === "checked_in")).length;
  const longestWait = waiting.length ? nowMin - (waiting[0].checkedInAt ?? nowMin) : 0;

  const checkIn = (id: string) => {
    const appt = appts.find((a) => a.id === id);
    if (!appt) return;
    setAppts((list) => list.map((a) => (a.id === id ? { ...a, status: "checked_in", checkedInAt: nowMin } : a)));
    const p = patientById(appt.patient);
    notifications.show({
      color: "teal",
      title: `${p?.name ?? "Patient"} checked in`,
      message: `Waiting for ${vetById(appt.vet).name} in ${vetById(appt.vet).room}.${
        p && p.alerts.length ? ` Alert: ${p.alerts.join("; ")}.` : ""
      }`,
    });
  };

  const addAppointment = (appt: Appointment) => {
    setAppts((list) => [...list, appt]);
    setJustBooked(appt.id);
    const p = patientById(appt.patient);
    notifications.show({
      color: "teal",
      title: "Appointment booked",
      message: `${p?.name ?? "Patient"} with ${vetById(appt.vet).name} at ${fmtClock(toMin(appt.start))}.`,
    });
  };

  return (
    <Stack gap="lg">
      <Flex justify="space-between" align={{ base: "stretch", sm: "flex-end" }} direction={{ base: "column", sm: "row" }} gap="sm">
        <Box>
          <Text c="gray.7" fw={600} fz="sm">
            {fmtDate(TODAY, { weekday: "long", month: "long", day: "numeric", year: "numeric" })} · {fmtClock(nowMin)}
          </Text>
          <Title order={1} fz={{ base: 26, sm: 32 }}>
            Today&apos;s schedule
          </Title>
        </Box>
        <Button size="lg" leftSection={<IconCalendarPlus size={20} aria-hidden="true" />} onClick={open}>
          Book appointment
        </Button>
      </Flex>

      <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="sm">
        <Tile label="Waiting" value={waiting.length} hint={waiting.length ? `Longest ${longestWait} min` : "Nobody waiting"} color="orange.8" />
        <Tile label="In exam" value={inExam} hint="With a vet now" color="teal.8" />
        <Tile label="Still to come" value={toCome} hint="Booked, not arrived" color="blue.8" />
        <Tile label="Urgent open" value={urgentOpen} hint="Needs a vet today" color={urgentOpen ? "red.8" : "gray.7"} />
      </SimpleGrid>

      <Grid gap="lg">
        <Grid.Col span={{ base: 12, lg: 8 }}>
          <Stack gap="sm">
            <Flex direction={{ base: "column", sm: "row" }} gap="sm" justify="space-between" align={{ base: "stretch", sm: "center" }}>
              <SegmentedControl
                aria-label="Filter by vet"
                value={vetFilter}
                onChange={setVetFilter}
                size="md"
                data={[{ value: "all", label: "All vets" }, ...vets.map((v) => ({ value: v.id, label: v.short }))]}
              />
              <Switch
                label="Hide done and cancelled"
                size="md"
                checked={hideFinished}
                onChange={(e) => setHideFinished(e.currentTarget.checked)}
              />
            </Flex>

            <Stack gap="xs" component="ul" m={0} p={0} style={{ listStyle: "none" }} aria-label="Appointments today">
              {visible.length === 0 && (
                <Paper withBorder p="lg" radius="md">
                  <Text c="gray.7">No appointments match this filter.</Text>
                </Paper>
              )}
              {visible.map((a) => (
                <li key={a.id}>
                  <AppointmentRow appt={a} highlight={a.id === justBooked} onCheckIn={() => checkIn(a.id)} />
                </li>
              ))}
            </Stack>
          </Stack>
        </Grid.Col>

        <Grid.Col span={{ base: 12, lg: 4 }}>
          <Paper withBorder radius="md" p="md" component="section" aria-labelledby="waiting-title" pos={{ lg: "sticky" }} top={{ lg: 96 }}>
            <Group justify="space-between" mb="sm">
              <Title order={2} fz="lg" id="waiting-title">
                Waiting room
              </Title>
              <Badge color="orange" variant="light" size="lg" aria-live="polite">
                {waiting.length} waiting
              </Badge>
            </Group>
            {waiting.length === 0 ? (
              <Text c="gray.7" fz="sm">
                Nobody is checked in right now. Patients appear here the moment you check them in.
              </Text>
            ) : (
              <Stack gap="xs" component="ol" m={0} p={0} style={{ listStyle: "none" }}>
                {waiting.map((a, i) => {
                  const p = patientById(a.patient);
                  const v = vetById(a.vet);
                  const mins = Math.max(0, nowMin - (a.checkedInAt ?? nowMin));
                  return (
                    <Paper key={a.id} component="li" p="sm" radius="md" bg={i === 0 ? "orange.0" : "gray.0"} withBorder>
                      <Group justify="space-between" wrap="nowrap" align="flex-start" gap="xs">
                        <Box style={{ minWidth: 0 }}>
                          <Group gap={6}>
                            {i === 0 && (
                              <Badge size="sm" color="orange.8" variant="filled">
                                Next
                              </Badge>
                            )}
                            <Anchor component={Link} href={`/patients/${a.patient}`} fw={700} c="dark.9">
                              {p?.name}
                            </Anchor>
                          </Group>
                          <Text fz="sm" c="gray.7">
                            {v.name} · {v.room}
                          </Text>
                          <Text fz="xs" c="gray.7">
                            Booked {fmtClock(toMin(a.start))} · in at {fmtClock(a.checkedInAt ?? nowMin)}
                          </Text>
                        </Box>
                        <Text fw={800} fz="lg" c={mins >= 30 ? "red.8" : "orange.9"} style={{ whiteSpace: "nowrap" }}>
                          <IconClock size={14} aria-hidden="true" style={{ verticalAlign: "-2px" }} /> {mins} min
                        </Text>
                      </Group>
                      {p && p.alerts.length > 0 && (
                        <Box mt="xs">
                          <AlertBadges alerts={p.alerts} size="sm" />
                        </Box>
                      )}
                    </Paper>
                  );
                })}
              </Stack>
            )}
          </Paper>
        </Grid.Col>
      </Grid>

      <BookingModal opened={opened} onClose={close} appts={appts} nowMin={nowMin} onBook={addAppointment} />
    </Stack>
  );
}

function Tile({ label, value, hint, color }: { label: string; value: number; hint: string; color: string }) {
  return (
    <Paper withBorder radius="md" p="md">
      <Text fz="xs" fw={700} tt="uppercase" lts="0.06em" c="gray.7">
        {label}
      </Text>
      <Text fz={32} fw={800} lh={1.1} c={color}>
        {value}
      </Text>
      <Text fz="xs" c="gray.7">
        {hint}
      </Text>
    </Paper>
  );
}

function AppointmentRow({
  appt,
  highlight,
  onCheckIn,
}: {
  appt: Appointment;
  highlight: boolean;
  onCheckIn: () => void;
}) {
  const p = patientById(appt.patient);
  const owner = p ? ownerById(p.owner) : undefined;
  const vet = vetById(appt.vet);
  const meta = STATUS_META[appt.status];
  const finished = appt.status === "done" || appt.status === "cancelled";
  const startMin = toMin(appt.start);
  const border = appt.urgent
    ? "var(--mantine-color-orange-7)"
    : highlight
      ? "var(--mantine-color-teal-6)"
      : "var(--mantine-color-gray-3)";

  return (
    <Paper
      withBorder
      radius="md"
      p="md"
      bg={finished ? "gray.1" : appt.urgent ? "orange.0" : "white"}
      style={{ borderLeft: `6px solid ${border}`, ...(highlight ? { outline: "2px solid var(--mantine-color-teal-6)" } : {}) }}
    >
      <Flex direction={{ base: "column", sm: "row" }} gap="sm" align={{ base: "stretch", sm: "flex-start" }}>
        <Box w={{ sm: 96 }} style={{ flexShrink: 0 }}>
          <Group gap={8} align="baseline" wrap="nowrap" display={{ base: "flex", sm: "block" } as never}>
            <Text fw={800} fz="lg" td={appt.status === "cancelled" ? "line-through" : undefined}>
              {fmtClock(startMin)}
            </Text>
            <Text fz="sm" c="gray.7">
              {appt.minutes} min
            </Text>
          </Group>
        </Box>

        <Box style={{ flex: 1, minWidth: 0 }}>
          <Group gap="xs" align="center">
            <Anchor component={Link} href={`/patients/${appt.patient}`} fw={800} fz="lg" c="dark.9">
              {p?.name}
            </Anchor>
            <Text fz="sm" c="gray.7">
              {p?.species} · {p?.breed}
            </Text>
            {appt.urgent && (
              <Badge color="orange.8" variant="filled" size="md" leftSection={<IconBolt size={14} aria-hidden="true" />}>
                Urgent
              </Badge>
            )}
          </Group>
          <Text fz="md" fw={500} td={appt.status === "cancelled" ? "line-through" : undefined}>
            {appt.reason}
          </Text>
          <Text fz="sm" c="gray.7">
            {owner?.name} · {owner?.phone}
          </Text>
          {p && p.alerts.length > 0 && (
            <Box mt={6}>
              <AlertBadges alerts={p.alerts} />
            </Box>
          )}
        </Box>

        <Flex
          direction={{ base: "row", sm: "column" }}
          justify={{ base: "space-between", sm: "flex-start" }}
          align={{ base: "center", sm: "flex-end" }}
          gap="xs"
          w={{ sm: 190 }}
          style={{ flexShrink: 0 }}
        >
          <Box ta={{ sm: "right" }}>
            <Text fz="sm" fw={600} lh={1.3}>
              <IconStethoscope size={14} aria-hidden="true" style={{ verticalAlign: "-2px" }} /> {vet.name}
            </Text>
            <Text fz="xs" c="gray.7">
              {vet.room}
            </Text>
          </Box>
          <Group gap="xs" wrap="nowrap">
            <Badge color={meta.color} variant={appt.status === "in_exam" ? "filled" : "light"} size="lg">
              {meta.label}
            </Badge>
            {appt.status === "booked" && (
              <Button
                size="md"
                leftSection={<IconUserCheck size={18} aria-hidden="true" />}
                onClick={onCheckIn}
                aria-label={`Check in ${p?.name ?? "patient"}`}
              >
                Check in
              </Button>
            )}
          </Group>
        </Flex>
      </Flex>
    </Paper>
  );
}

function BookingModal({
  opened,
  onClose,
  appts,
  nowMin,
  onBook,
}: {
  opened: boolean;
  onClose: () => void;
  appts: Appointment[];
  nowMin: number;
  onBook: (a: Appointment) => void;
}) {
  const isSmall = useMediaQuery("(max-width: 48em)");
  const [patientId, setPatientId] = useState<string | null>(null);
  const [vetId, setVetId] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [duration, setDuration] = useState<string>("20");
  const [reason, setReason] = useState("");
  const [urgent, setUrgent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const minutes = Number(duration);
  const patient = patientId ? patientById(patientId) : undefined;

  const timeOptions = useMemo(() => {
    const opts: { value: string; label: string; disabled?: boolean }[] = [];
    for (let m = DAY_START_MIN; m + minutes <= DAY_END_MIN; m += 15) {
      const past = m < nowMin;
      const clash = vetId ? findClash(appts, vetId, m, minutes) : undefined;
      opts.push({
        value: String(m),
        label: `${fmtClock(m)}${past ? " (past)" : clash ? " (taken)" : ""}`,
        disabled: past || Boolean(clash),
      });
    }
    return opts;
  }, [appts, vetId, minutes, nowMin]);

  const selectedClash = vetId && time ? findClash(appts, vetId, Number(time), minutes) : undefined;
  const timeValid = time ? timeOptions.some((o) => o.value === time && !o.disabled) : false;

  const reset = () => {
    setPatientId(null);
    setVetId(null);
    setTime(null);
    setDuration("20");
    setReason("");
    setUrgent(false);
    setErrors({});
  };

  const submit = () => {
    const next: Record<string, string> = {};
    if (!patientId) next.patient = "Choose a patient";
    if (!vetId) next.vet = "Choose a vet";
    if (!time) next.time = "Choose a time";
    else if (!timeValid) next.time = selectedClash ? `Clashes with ${patientById(selectedClash.patient)?.name} at ${fmtClock(toMin(selectedClash.start))}` : "Choose a time that has not passed";
    if (!reason.trim()) next.reason = "Add a reason for the visit";
    setErrors(next);
    if (Object.keys(next).length > 0 || !patientId || !vetId || !time) return;
    const start = Number(time);
    const hh = String(Math.floor(start / 60)).padStart(2, "0");
    const mm = String(start % 60).padStart(2, "0");
    onBook({
      id: `a-${String(appts.length + 1).padStart(2, "0")}`,
      patient: patientId,
      vet: vetId,
      start: `${hh}:${mm}`,
      minutes,
      reason: reason.trim(),
      status: "booked",
      ...(urgent ? { urgent: true } : {}),
    });
    reset();
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={() => {
        onClose();
        setErrors({});
      }}
      title={
        <Text fw={800} fz="lg" component="span">
          Book an appointment
        </Text>
      }
      fullScreen={Boolean(isSmall)}
      size="lg"
      centered
    >
      <Stack gap="md">
        <Select
          label="Patient"
          placeholder="Search by pet or owner"
          searchable
          size="md"
          data={patients.map((p) => ({ value: p.id, label: `${p.name} (${p.species}) · ${ownerById(p.owner).name}` }))}
          value={patientId}
          onChange={setPatientId}
          error={errors.patient}
          nothingFoundMessage="No patient found"
        />
        {patient && patient.alerts.length > 0 && (
          <Paper p="sm" radius="md" bg="red.8" c="white" role="note" aria-label={`Medical alerts for ${patient.name}`}>
            <Text fw={800} fz="sm" tt="uppercase" c="white">
              Medical alerts for {patient.name}
            </Text>
            {patient.alerts.map((a) => (
              <Text key={a} fw={700} c="white">
                {a}
              </Text>
            ))}
          </Paper>
        )}
        <Select
          label="Vet"
          placeholder="Choose a vet"
          size="md"
          data={vets.map((v) => ({ value: v.id, label: `${v.name} · ${v.room}` }))}
          value={vetId}
          onChange={(v) => {
            setVetId(v);
            setErrors((e) => ({ ...e, vet: "", time: "" }));
          }}
          error={errors.vet}
          allowDeselect={false}
        />
        <Group grow align="flex-start">
          <Select
            label="Length"
            size="md"
            data={DURATIONS}
            value={duration}
            onChange={(v) => setDuration(v ?? "20")}
            allowDeselect={false}
          />
          <Select
            label="Start time"
            placeholder={vetId ? "Choose a time" : "Choose a vet first"}
            size="md"
            searchable
            data={timeOptions}
            value={time}
            onChange={(v) => {
              setTime(v);
              setErrors((e) => ({ ...e, time: "" }));
            }}
            error={errors.time ?? (selectedClash ? "This time clashes with another booking" : undefined)}
            disabled={!vetId}
            allowDeselect={false}
            maxDropdownHeight={260}
          />
        </Group>
        <TextInput
          label="Reason for visit"
          placeholder="e.g. Vaccination booster"
          size="md"
          value={reason}
          onChange={(e) => setReason(e.currentTarget.value)}
          error={errors.reason}
        />
        <Checkbox label="Mark as urgent" checked={urgent} onChange={(e) => setUrgent(e.currentTarget.checked)} size="md" />
        <Group justify="flex-end" mt="xs">
          <Button
            variant="default"
            size="md"
            onClick={() => {
              reset();
              onClose();
            }}
          >
            Cancel
          </Button>
          <Button size="md" leftSection={<IconCheck size={18} aria-hidden="true" />} onClick={submit}>
            Book appointment
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
