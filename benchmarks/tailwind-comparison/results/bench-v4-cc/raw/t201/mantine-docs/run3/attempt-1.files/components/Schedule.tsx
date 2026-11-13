"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Alert,
  Anchor,
  Badge,
  Box,
  Button,
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
import { useMediaQuery } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { IconAlertTriangle, IconPlus, IconUserCheck } from "@tabler/icons-react";
import { PatientAlerts } from "@/components/PatientAlerts";
import {
  type Appointment,
  type Status,
  OPENED_AT_MINUTES,
  TODAY,
  endTime,
  findClash,
  formatDate,
  fromMinutes,
  initialAppointments,
  overdueVaccineCount,
  ownerById,
  patientById,
  patients,
  toMinutes,
  vetById,
  vets,
} from "@/lib/data";

const STATUS: Record<Status, { label: string; color: string }> = {
  booked: { label: "Booked", color: "gray" },
  checked_in: { label: "Checked in", color: "orange" },
  in_exam: { label: "In exam", color: "blue" },
  done: { label: "Done", color: "teal" },
  cancelled: { label: "Cancelled", color: "gray" },
};

const SLOTS: string[] = [];
for (let m = 8 * 60; m <= 16 * 60 + 45; m += 15) SLOTS.push(fromMinutes(m));

interface Prefill {
  patientId?: string;
  vetId?: string;
}

export function Schedule() {
  const [appts, setAppts] = useState<Appointment[]>(initialAppointments);
  const [elapsed, setElapsed] = useState(0);
  const [vetFilter, setVetFilter] = useState("all");
  const [hideFinished, setHideFinished] = useState(false);
  const [booking, setBooking] = useState<Prefill | null>(null);

  useEffect(() => {
    const t = setInterval(() => setElapsed((e) => e + 1), 60000);
    return () => clearInterval(t);
  }, []);
  const nowMin = OPENED_AT_MINUTES + elapsed;

  const sorted = useMemo(
    () => [...appts].sort((a, b) => toMinutes(a.start) - toMinutes(b.start) || a.vet.localeCompare(b.vet)),
    [appts],
  );
  const visible = sorted.filter(
    (a) =>
      (vetFilter === "all" || a.vet === vetFilter) &&
      !(hideFinished && (a.status === "done" || a.status === "cancelled")),
  );
  const waiting = appts
    .filter((a) => a.status === "checked_in")
    .sort((a, b) => toMinutes(a.checkedInAt ?? "00:00") - toMinutes(b.checkedInAt ?? "00:00"));
  const upcoming = sorted.filter((a) => a.status === "booked");
  const nextId = upcoming[0]?.id;
  const count = (s: Status) => appts.filter((a) => a.status === s).length;

  const checkIn = (id: string) => {
    const a = appts.find((x) => x.id === id);
    if (!a) return;
    setAppts((list) =>
      list.map((x) => (x.id === id ? { ...x, status: "checked_in", checkedInAt: fromMinutes(nowMin) } : x)),
    );
    const p = patientById(a.patient);
    notifications.show({
      title: "Checked in",
      message: `${p?.name ?? "Patient"} is in the waiting room for ${vetById(a.vet).name}.`,
      color: "teal",
    });
  };

  const book = (a: Omit<Appointment, "id" | "status">) => {
    setAppts((list) => {
      const id = `a-${String(list.length + 1).padStart(2, "0")}`;
      return [...list, { ...a, id, status: "booked" }];
    });
    const p = patientById(a.patient);
    notifications.show({
      title: "Appointment booked",
      message: `${p?.name ?? "Patient"} with ${vetById(a.vet).name} at ${a.start}.`,
      color: "teal",
    });
    setBooking(null);
  };

  return (
    <Stack gap="lg">
      <Group justify="space-between" align="flex-end" wrap="wrap">
        <Box>
          <Title order={1} size="h2">
            Today&apos;s schedule
          </Title>
          <Text c="dimmed">
            {formatDate(TODAY, { weekday: "long", month: "long" })} · now {fromMinutes(nowMin)}
          </Text>
        </Box>
        <Button size="lg" leftSection={<IconPlus size={20} aria-hidden="true" />} onClick={() => setBooking({})}>
          Book appointment
        </Button>
      </Group>

      <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="sm">
        <Stat label="Waiting" value={count("checked_in")} color="orange" />
        <Stat label="In exam" value={count("in_exam")} color="blue" />
        <Stat label="Still to come" value={count("booked")} color="gray" />
        <Stat label="Done" value={count("done")} color="teal" />
      </SimpleGrid>

      <Grid gap="lg">
        <Grid.Col span={{ base: 12, lg: 4 }} order={{ base: 1, lg: 2 }}>
          <Stack gap="md">
            <Paper withBorder p="md" radius="md" component="section" aria-labelledby="waiting-h">
              <Title order={2} size="h4" id="waiting-h" mb="sm">
                Waiting room ({waiting.length})
              </Title>
              {waiting.length === 0 ? (
                <Text c="dimmed">Nobody is waiting.</Text>
              ) : (
                <Stack gap="sm" component="ol" style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {waiting.map((a) => {
                    const p = patientById(a.patient);
                    const mins = Math.max(0, nowMin - toMinutes(a.checkedInAt ?? fromMinutes(nowMin)));
                    return (
                      <Paper key={a.id} component="li" p="sm" radius="md" bg="orange.0" style={{ borderLeft: "5px solid var(--mantine-color-orange-6)" }}>
                        <Group justify="space-between" wrap="nowrap" align="flex-start">
                          <Box style={{ minWidth: 0 }}>
                            <Anchor component={Link} href={`/patients/${a.patient}`} fw={700} size="lg" c="dark.9">
                              {p?.name}
                            </Anchor>
                            <Text size="sm" c="dark.6">
                              {ownerById(p?.owner ?? "").name} · {vetById(a.vet).name}, {vetById(a.vet).room}
                            </Text>
                            <Text size="sm" c="dark.6">
                              {a.reason} · booked {a.start}
                            </Text>
                          </Box>
                          <Box ta="right" style={{ flexShrink: 0 }}>
                            <Text fw={800} size="xl" lh={1} c={mins >= 20 ? "red.8" : "orange.9"}>
                              {mins} min
                            </Text>
                            <Text size="xs" c="dark.6">
                              since {a.checkedInAt}
                            </Text>
                          </Box>
                        </Group>
                        {p && p.alerts.length > 0 ? (
                          <Box mt={6}>
                            <PatientAlerts alerts={p.alerts} size="sm" />
                          </Box>
                        ) : null}
                      </Paper>
                    );
                  })}
                </Stack>
              )}
            </Paper>

            <Paper withBorder p="md" radius="md" component="section" aria-labelledby="next-h">
              <Title order={2} size="h4" id="next-h" mb="sm">
                Next up
              </Title>
              {upcoming.length === 0 ? (
                <Text c="dimmed">Nothing else booked today.</Text>
              ) : (
                <Stack gap="xs" component="ol" style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {upcoming.slice(0, 4).map((a) => (
                    <li key={a.id}>
                      <Group gap="sm" wrap="nowrap">
                        <Text fw={800} w={52}>
                          {a.start}
                        </Text>
                        <Box style={{ minWidth: 0 }}>
                          <Text fw={600} size="sm">
                            {patientById(a.patient)?.name}
                            {a.urgent ? (
                              <Text span c="red.7" fw={800}>
                                {" "}
                                · URGENT
                              </Text>
                            ) : null}
                          </Text>
                          <Text size="xs" c="dimmed">
                            {vetById(a.vet).name} · {a.reason}
                          </Text>
                        </Box>
                      </Group>
                    </li>
                  ))}
                </Stack>
              )}
            </Paper>
          </Stack>
        </Grid.Col>

        <Grid.Col span={{ base: 12, lg: 8 }} order={{ base: 2, lg: 1 }}>
          <Stack gap="sm">
            <Group justify="space-between" wrap="wrap" gap="sm">
              <SegmentedControl
                aria-label="Filter by vet"
                value={vetFilter}
                onChange={setVetFilter}
                data={[
                  { value: "all", label: "All vets" },
                  ...vets.map((v) => ({ value: v.id, label: v.name })),
                ]}
                styles={{ root: { maxWidth: "100%", overflowX: "auto" } }}
              />
              <Switch
                label="Hide done and cancelled"
                checked={hideFinished}
                onChange={(e) => setHideFinished(e.currentTarget.checked)}
              />
            </Group>

            <Stack gap="sm" component="ul" aria-label="Appointments" style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {visible.length === 0 ? (
                <Text c="dimmed" py="lg">
                  No appointments match this filter.
                </Text>
              ) : null}
              {visible.map((a) => (
                <ApptRow
                  key={a.id}
                  a={a}
                  isNext={a.id === nextId}
                  onCheckIn={() => checkIn(a.id)}
                  onFollowUp={() => setBooking({ patientId: a.patient, vetId: a.vet })}
                />
              ))}
            </Stack>
          </Stack>
        </Grid.Col>
      </Grid>

      <BookingModal
        prefill={booking}
        onClose={() => setBooking(null)}
        appts={appts}
        nowMin={nowMin}
        onBook={book}
      />
    </Stack>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <Paper withBorder p="sm" radius="md">
      <Text size="sm" c="dimmed" fw={600}>
        {label}
      </Text>
      <Text fw={800} fz={32} lh={1.1} c={`${color}.${color === "gray" ? 8 : 7}`}>
        {value}
      </Text>
    </Paper>
  );
}

function ApptRow({
  a,
  isNext,
  onCheckIn,
  onFollowUp,
}: {
  a: Appointment;
  isNext: boolean;
  onCheckIn: () => void;
  onFollowUp: () => void;
}) {
  const p = patientById(a.patient);
  const o = ownerById(p?.owner ?? "");
  const vet = vetById(a.vet);
  const st = STATUS[a.status];
  const overdue = overdueVaccineCount(a.patient);
  const border = a.urgent
    ? "var(--mantine-color-red-7)"
    : a.status === "checked_in"
      ? "var(--mantine-color-orange-6)"
      : a.status === "in_exam"
        ? "var(--mantine-color-blue-6)"
        : "transparent";
  const finished = a.status === "done" || a.status === "cancelled";

  return (
    <Paper
      component="li"
      withBorder
      p="md"
      radius="md"
      style={{
        borderLeft: `6px solid ${border}`,
        opacity: finished ? 0.78 : 1,
        background: a.urgent ? "light-dark(var(--mantine-color-red-0), var(--mantine-color-dark-6))" : undefined,
      }}
    >
      <Flex direction={{ base: "column", sm: "row" }} gap="sm" align={{ base: "stretch", sm: "center" }}>
        <Box w={{ base: "auto", sm: 84 }} style={{ flexShrink: 0 }}>
          <Text fw={800} fz={24} lh={1.1}>
            {a.start}
          </Text>
          <Text size="xs" c="dimmed">
            to {endTime(a)} · {a.minutes} min
          </Text>
        </Box>

        <Box style={{ flex: 1, minWidth: 0 }}>
          <Group gap="xs" align="center">
            <Anchor component={Link} href={`/patients/${a.patient}`} fw={800} size="lg">
              {p?.name}
            </Anchor>
            <Text size="sm" c="dimmed">
              {p?.species}, {p?.breed}
            </Text>
            {a.urgent ? (
              <Badge color="red" variant="filled" leftSection={<IconAlertTriangle size={14} aria-hidden="true" />}>
                Urgent
              </Badge>
            ) : null}
            {isNext ? (
              <Badge color="teal" variant="light">
                Next
              </Badge>
            ) : null}
          </Group>
          <Text size="sm">
            {o.name} · <a href={`tel:${o.phone.replace(/\s/g, "")}`}>{o.phone}</a>
          </Text>
          <Text fw={600} td={a.status === "cancelled" ? "line-through" : undefined}>
            {a.reason}
          </Text>
          {p && p.alerts.length > 0 ? (
            <Box mt={6}>
              <PatientAlerts alerts={p.alerts} size="sm" />
            </Box>
          ) : null}
          {overdue > 0 ? (
            <Badge mt={6} color="orange" variant="light">
              {overdue} vaccinations overdue
            </Badge>
          ) : null}
        </Box>

        <Box w={{ base: "auto", sm: 150 }} style={{ flexShrink: 0 }}>
          <Text size="sm" fw={600}>
            {vet.name}
          </Text>
          <Text size="xs" c="dimmed">
            {vet.room}
          </Text>
        </Box>

        <Flex
          direction="column"
          gap={6}
          w={{ base: "auto", sm: 150 }}
          align={{ base: "flex-start", sm: "stretch" }}
          style={{ flexShrink: 0 }}
        >
          <Badge color={st.color} variant={a.status === "booked" || finished ? "light" : "filled"} size="lg" radius="sm">
            {st.label}
            {a.status === "checked_in" && a.checkedInAt ? ` ${a.checkedInAt}` : ""}
          </Badge>
          {a.status === "booked" ? (
            <Button
              h={44}
              leftSection={<IconUserCheck size={20} aria-hidden="true" />}
              onClick={onCheckIn}
              aria-label={`Check in ${p?.name}`}
            >
              Check in
            </Button>
          ) : null}
          {a.status === "done" ? (
            <Button h={44} variant="default" onClick={onFollowUp} aria-label={`Book a follow-up for ${p?.name}`}>
              Book follow-up
            </Button>
          ) : null}
        </Flex>
      </Flex>
    </Paper>
  );
}

function BookingModal({
  prefill,
  onClose,
  appts,
  nowMin,
  onBook,
}: {
  prefill: Prefill | null;
  onClose: () => void;
  appts: Appointment[];
  nowMin: number;
  onBook: (a: Omit<Appointment, "id" | "status">) => void;
}) {
  const small = useMediaQuery("(max-width: 48em)");
  return (
    <Modal
      opened={prefill !== null}
      onClose={onClose}
      title={
        <Text fw={800} size="lg">
          Book an appointment
        </Text>
      }
      fullScreen={!!small}
      size="lg"
      radius="md"
    >
      {prefill ? <BookingForm prefill={prefill} appts={appts} nowMin={nowMin} onBook={onBook} onCancel={onClose} /> : null}
    </Modal>
  );
}

function BookingForm({
  prefill,
  appts,
  nowMin,
  onBook,
  onCancel,
}: {
  prefill: Prefill;
  appts: Appointment[];
  nowMin: number;
  onBook: (a: Omit<Appointment, "id" | "status">) => void;
  onCancel: () => void;
}) {
  const [patientId, setPatientId] = useState<string | null>(prefill.patientId ?? null);
  const [vetId, setVetId] = useState<string | null>(prefill.vetId ?? null);
  const [time, setTime] = useState<string | null>(null);
  const [minutes, setMinutes] = useState<string>("20");
  const [reason, setReason] = useState(prefill.patientId ? "Follow-up" : "");
  const [urgent, setUrgent] = useState(false);
  const [tried, setTried] = useState(false);

  const patient = patientId ? patientById(patientId) : undefined;
  const dur = Number(minutes);

  const slotData = SLOTS.map((t) => {
    const m = toMinutes(t);
    const clash = vetId ? findClash(appts, vetId, m, dur) : undefined;
    const past = m < nowMin;
    return {
      value: t,
      label: clash ? `${t} · taken` : past ? `${t} · passed` : t,
      disabled: !!clash || past,
    };
  });

  const clash = vetId && time ? findClash(appts, vetId, toMinutes(time), dur) : undefined;
  const timeError = clash
    ? `${vetById(clash.vet).name} already has ${patientById(clash.patient)?.name} from ${clash.start} to ${endTime(clash)}. Pick another time or vet.`
    : tried && !time
      ? "Choose a time"
      : undefined;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setTried(true);
    if (!patientId || !vetId || !time || !reason.trim() || clash) return;
    onBook({
      patient: patientId,
      vet: vetId,
      start: time,
      minutes: dur,
      reason: reason.trim(),
      ...(urgent ? { urgent: true } : {}),
    });
  };

  return (
    <form onSubmit={submit} noValidate>
      <Stack gap="md">
        <Text size="sm" c="dimmed">
          Adds to today&apos;s schedule, {formatDate(TODAY, { weekday: "long", month: "long" })}.
        </Text>
        <Select
          label="Patient"
          placeholder="Search by pet or owner"
          searchable
          required
          data={patients.map((p) => ({
            value: p.id,
            label: `${p.name} (${p.species}) · ${ownerById(p.owner).name}`,
          }))}
          value={patientId}
          onChange={setPatientId}
          error={tried && !patientId ? "Choose a patient" : undefined}
          size="md"
        />
        {patient ? (
          patient.alerts.length > 0 ? (
            <Alert color="red" variant="light" icon={<IconAlertTriangle aria-hidden="true" />} title="Medical alerts">
              <PatientAlerts alerts={patient.alerts} />
            </Alert>
          ) : (
            <Text size="sm" c="dimmed">
              No medical alerts on file for {patient.name}.
            </Text>
          )
        ) : null}
        <Select
          label="Vet"
          placeholder="Choose a vet"
          required
          data={vets.map((v) => ({ value: v.id, label: `${v.name} · ${v.room}` }))}
          value={vetId}
          onChange={setVetId}
          error={tried && !vetId ? "Choose a vet" : undefined}
          size="md"
        />
        <SimpleGrid cols={{ base: 1, xs: 2 }}>
          <Select
            label="Length"
            required
            allowDeselect={false}
            data={["15", "20", "30", "45", "60"].map((m) => ({ value: m, label: `${m} minutes` }))}
            value={minutes}
            onChange={(v) => setMinutes(v ?? "20")}
            size="md"
          />
          <Select
            label="Time"
            placeholder={vetId ? "Choose a free time" : "Choose a vet first"}
            required
            searchable
            data={slotData}
            value={time}
            onChange={setTime}
            disabled={!vetId}
            error={timeError}
            size="md"
            maxDropdownHeight={260}
          />
        </SimpleGrid>
        <TextInput
          label="Reason for visit"
          required
          value={reason}
          onChange={(e) => setReason(e.currentTarget.value)}
          error={tried && !reason.trim() ? "Enter a reason" : undefined}
          size="md"
        />
        <Switch
          label="Urgent: the vet should see this patient first"
          checked={urgent}
          onChange={(e) => setUrgent(e.currentTarget.checked)}
        />
        <Group justify="flex-end" mt="sm">
          <Button variant="default" h={44} onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" h={44} leftSection={<IconPlus size={20} aria-hidden="true" />}>
            Book appointment
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
