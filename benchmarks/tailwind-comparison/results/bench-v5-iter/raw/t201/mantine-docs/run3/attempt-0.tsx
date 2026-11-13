```tsx app/page.tsx
import type { Metadata } from "next";
import { Schedule } from "@/components/Schedule";
import { Shell } from "@/components/Shell";

export const metadata: Metadata = { title: "Today's schedule | Pawpoint" };

export default function Page() {
  return (
    <Shell>
      <Schedule />
    </Shell>
  );
}
```

```tsx app/patients/[id]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PatientRecord } from "@/components/PatientRecord";
import { Shell } from "@/components/Shell";
import { getPatient, patients } from "@/lib/data";

type Props = { params: Promise<{ id: string }> };

export function generateStaticParams() {
  return patients.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const patient = getPatient(id);
  return { title: patient ? `${patient.name} | Pawpoint` : "Patient | Pawpoint" };
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  const patient = getPatient(id);
  if (!patient) notFound();
  return (
    <Shell>
      <PatientRecord patient={patient} />
    </Shell>
  );
}
```

```ts app/theme.ts
import { createTheme } from "@mantine/core";

// System font stack, identical in every arm (no network font fetch at build).
export const theme = createTheme({
  fontFamily: "ui-sans-serif, system-ui, sans-serif",
  headings: {
    fontFamily: "ui-sans-serif, system-ui, sans-serif",
    fontWeight: "650",
  },
  colors: {
    // Darker mid greys so dimmed text and placeholders keep AA contrast.
    gray: [
      "#f8f9fa",
      "#f1f3f5",
      "#e9ecef",
      "#dee2e6",
      "#ced4da",
      "#868e96",
      "#566069",
      "#495057",
      "#343a40",
      "#212529",
    ],
  },
  primaryColor: "teal",
  primaryShade: { light: 7, dark: 5 },
  defaultRadius: "md",
  cursorType: "pointer",
  components: {
    Button: { defaultProps: { fw: 600 } },
    Badge: { defaultProps: { fw: 650 } },
    Paper: { defaultProps: { radius: "md" } },
  },
});
```

```tsx components/AlertBadges.tsx
import { Badge, Group, VisuallyHidden } from "@mantine/core";
import { IconAlertTriangleFilled } from "@tabler/icons-react";

type Props = {
  alerts: string[];
  size?: "sm" | "md" | "lg";
};

/** Medical alerts: solid red, icon and text, never colour alone. */
export function AlertBadges({ alerts, size = "md" }: Props) {
  if (alerts.length === 0) return null;
  return (
    <Group gap={6} role="list" aria-label="Medical alerts">
      {alerts.map((alert) => (
        <Badge
          key={alert}
          role="listitem"
          color="red.7"
          variant="filled"
          size={size}
          tt="none"
          leftSection={<IconAlertTriangleFilled size={size === "lg" ? 16 : 13} aria-hidden />}
          styles={{ label: { overflow: "visible" }, root: { height: "auto", paddingBlock: 3 } }}
        >
          <VisuallyHidden>Medical alert: </VisuallyHidden>
          {alert}
        </Badge>
      ))}
    </Group>
  );
}
```

```tsx components/BookingModal.tsx
"use client";

import { useMemo, useState } from "react";
import { Alert, Button, Group, Modal, Select, Stack, Text, TextInput } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { IconCalendarPlus, IconCircleX } from "@tabler/icons-react";
import { DAY_END, DAY_START, type Appointment, getOwner, getPatient, getVet, patients, vets } from "@/lib/data";
import { clashes, endOf, fromMin, toMin } from "@/lib/utils";
import { AlertBadges } from "./AlertBadges";

type Props = {
  opened: boolean;
  onClose: () => void;
  appointments: Appointment[];
  onBook: (a: { patient: string; vet: string; start: string; minutes: number; reason: string }) => void;
};

const durations = [15, 20, 30, 45, 60].map((m) => ({ value: String(m), label: `${m} minutes` }));

const patientData = patients.map((p) => ({
  value: p.id,
  label: `${p.name} (${p.species}) · ${getOwner(p.owner)?.name ?? ""}`,
}));

const vetData = vets.map((v) => ({ value: v.id, label: `${v.name} · ${v.room}` }));

export function BookingModal({ opened, onClose, appointments, onBook }: Props) {
  const isPhone = useMediaQuery("(max-width: 36em)");
  const [patient, setPatient] = useState<string | null>(null);
  const [vet, setVet] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [minutes, setMinutes] = useState<string>("20");
  const [reason, setReason] = useState("Follow-up visit");
  const [submitted, setSubmitted] = useState(false);

  const length = Number(minutes);

  const timeData = useMemo(() => {
    const out: { value: string; label: string; disabled?: boolean }[] = [];
    for (let t = DAY_START; t + 15 <= DAY_END; t += 15) {
      const taken = vet ? clashes(appointments, vet, t, length) !== undefined : false;
      const tooLate = t + length > DAY_END;
      out.push({
        value: fromMin(t),
        label: taken ? `${fromMin(t)} · taken` : tooLate ? `${fromMin(t)} · after closing` : fromMin(t),
        disabled: taken || tooLate,
      });
    }
    return out;
  }, [appointments, vet, length]);

  const clash = vet && time ? clashes(appointments, vet, toMin(time), length) : undefined;
  const clashPatient = clash ? getPatient(clash.patient) : undefined;
  const chosenPatient = patient ? getPatient(patient) : undefined;
  const chosenVet = vet ? getVet(vet) : undefined;

  const reset = () => {
    setPatient(null);
    setVet(null);
    setTime(null);
    setMinutes("20");
    setReason("Follow-up visit");
    setSubmitted(false);
  };

  const close = () => {
    reset();
    onClose();
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (!patient || !vet || !time || clash || reason.trim() === "") return;
    onBook({ patient, vet, start: time, minutes: length, reason: reason.trim() });
    reset();
  };

  return (
    <Modal
      opened={opened}
      onClose={close}
      title={
        <Text fw={700} size="lg" component="span">
          Book an appointment
        </Text>
      }
      size="lg"
      fullScreen={isPhone}
      centered
    >
      <form onSubmit={submit} noValidate>
        <Stack gap="md">
          <Select
            label="Patient"
            placeholder="Search by pet or owner name"
            data={patientData}
            value={patient}
            onChange={setPatient}
            searchable
            size="md"
            withAsterisk
            nothingFoundMessage="No patient found"
            error={submitted && !patient ? "Choose a patient" : undefined}
            comboboxProps={{ withinPortal: true }}
          />
          {chosenPatient && chosenPatient.alerts.length > 0 && <AlertBadges alerts={chosenPatient.alerts} />}

          <Group grow align="flex-start" gap="md" wrap="wrap">
            <Select
              label="Vet"
              placeholder="Choose a vet"
              data={vetData}
              value={vet}
              onChange={(v) => {
                setVet(v);
                setTime(null);
              }}
              size="md"
              withAsterisk
              miw={220}
              allowDeselect={false}
              error={submitted && !vet ? "Choose a vet" : undefined}
              comboboxProps={{ withinPortal: true }}
            />
            <Select
              label="Length"
              data={durations}
              value={minutes}
              onChange={(v) => {
                setMinutes(v ?? "20");
                setTime(null);
              }}
              size="md"
              miw={140}
              allowDeselect={false}
              comboboxProps={{ withinPortal: true }}
            />
          </Group>

          <Select
            label="Start time"
            placeholder={vet ? "Pick a free time" : "Choose a vet first"}
            description={vet ? "Times already taken for this vet are greyed out." : undefined}
            data={timeData}
            value={time}
            onChange={setTime}
            disabled={!vet}
            searchable
            size="md"
            withAsterisk
            maxDropdownHeight={260}
            allowDeselect={false}
            error={submitted && vet && !time ? "Choose a time" : undefined}
            comboboxProps={{ withinPortal: true }}
          />

          <TextInput
            label="Reason for visit"
            value={reason}
            onChange={(e) => setReason(e.currentTarget.value)}
            size="md"
            withAsterisk
            error={submitted && reason.trim() === "" ? "Add a reason" : undefined}
          />

          {clash && chosenVet && (
            <Alert color="red" variant="light" icon={<IconCircleX aria-hidden />} title="That time clashes" role="alert">
              {chosenVet.name} already has {clashPatient?.name ?? "a patient"} ({clash.reason}) from {clash.start} to{" "}
              {endOf(clash)}. Pick another time or vet.
            </Alert>
          )}

          <Group justify="flex-end" mt="xs">
            <Button variant="default" size="lg" onClick={close} type="button">
              Cancel
            </Button>
            <Button size="lg" type="submit" leftSection={<IconCalendarPlus size={20} aria-hidden />} disabled={Boolean(clash)}>
              Book appointment
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
```

```tsx components/PatientRecord.tsx
"use client";

import Link from "next/link";
import {
  Alert,
  Avatar,
  Badge,
  Button,
  Grid,
  Group,
  List,
  Paper,
  Stack,
  Table,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import {
  IconAlertTriangleFilled,
  IconArrowLeft,
  IconCalendarEvent,
  IconPhone,
  IconPill,
  IconShieldCheck,
} from "@tabler/icons-react";
import {
  TODAY,
  getOwner,
  getVet,
  initialAppointments,
  records,
  type Patient,
} from "@/lib/data";
import { ageString, daysBetween, endOf, fmtDate, statusColor, statusLabel } from "@/lib/utils";
import { WeightChart } from "./WeightChart";

const SOON_DAYS = 60;

function vaccineState(due: string): { color: string; label: string; days: number } {
  const days = daysBetween(TODAY, due);
  if (days < 0) return { color: "red.7", label: `Overdue by ${-days} days`, days };
  if (days <= SOON_DAYS) return { color: "yellow", label: `Due in ${days} days`, days };
  return { color: "teal", label: "Up to date", days };
}

function Section({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <Paper withBorder p={{ base: "md", sm: "lg" }} component="section">
      <Group gap="xs" mb="md">
        {icon}
        <Title order={2} size="h4">
          {title}
        </Title>
      </Group>
      {children}
    </Paper>
  );
}

export function PatientRecord({ patient }: { patient: Patient }) {
  const owner = getOwner(patient.owner);
  const record = records[patient.id];
  const todays = initialAppointments.filter((a) => a.patient === patient.id);
  const overdue = record ? record.vaccinations.filter((v) => daysBetween(TODAY, v.due) < 0) : [];
  const weights = record?.weights_kg ?? [];
  const first = weights[0];
  const last = weights[weights.length - 1];
  const change = first && last ? last.kg - first.kg : 0;
  const pct = first && last ? (change / first.kg) * 100 : 0;

  return (
    <Stack gap="lg">
      <Button
        component={Link}
        href="/"
        variant="subtle"
        color="gray"
        leftSection={<IconArrowLeft size={18} aria-hidden />}
        w="fit-content"
        h={44}
      >
        Back to today&apos;s schedule
      </Button>

      <Paper withBorder p={{ base: "md", sm: "lg" }}>
        <Group align="flex-start" wrap="nowrap" gap="md">
          <Avatar size={64} radius="md" color="teal" aria-hidden>
            {patient.name.slice(0, 1)}
          </Avatar>
          <div style={{ minWidth: 0, flex: 1 }}>
            <Group gap="sm" align="center">
              <Title order={1} size="h2">
                {patient.name}
              </Title>
              <Badge variant="light" color="gray" size="lg">
                {patient.species}
              </Badge>
              {overdue.length > 0 && (
                <Badge color="red.7" variant="filled" size="lg">
                  {overdue.length} {overdue.length === 1 ? "vaccination" : "vaccinations"} overdue
                </Badge>
              )}
            </Group>
            <Text c="dimmed">
              {patient.breed} · {ageString(patient.born, TODAY)} · {patient.sex}
            </Text>
          </div>
        </Group>

        <Grid mt="lg" gap="md">
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Text size="xs" tt="uppercase" fw={700} c="dimmed">
              Patient
            </Text>
            <Text>Born {fmtDate(patient.born)}</Text>
            <Text c="dimmed" size="sm">
              Record {patient.id}
            </Text>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Text size="xs" tt="uppercase" fw={700} c="dimmed">
              Owner
            </Text>
            <Text fw={600}>{owner?.name}</Text>
            {owner && (
              <Button
                component="a"
                href={`tel:${owner.phone.replace(/\s/g, "")}`}
                variant="light"
                size="md"
                h={44}
                mt={4}
                leftSection={<IconPhone size={18} aria-hidden />}
              >
                {owner.phone}
              </Button>
            )}
          </Grid.Col>
        </Grid>
      </Paper>

      {patient.alerts.length > 0 && (
        <Alert
          color="red.7"
          variant="filled"
          radius="md"
          icon={<IconAlertTriangleFilled size={28} aria-hidden />}
          title="Medical alerts"
          role="region"
          aria-label="Medical alerts"
          styles={{ title: { fontSize: "var(--mantine-font-size-lg)" } }}
        >
          <List spacing={2} size="lg" fw={650} styles={{ item: { color: "white" } }}>
            {patient.alerts.map((a) => (
              <List.Item key={a}>{a}</List.Item>
            ))}
          </List>
        </Alert>
      )}

      {todays.length > 0 && (
        <Section title="Today" icon={<IconCalendarEvent size={22} aria-hidden />}>
          <Stack gap="xs">
            {todays.map((a) => (
              <Group key={a.id} justify="space-between" wrap="wrap" gap="xs">
                <Text>
                  <Text span fw={700}>
                    {a.start} to {endOf(a)}
                  </Text>{" "}
                  · {a.reason} · {getVet(a.vet)?.name}, {getVet(a.vet)?.room}
                </Text>
                <Badge color={statusColor[a.status]} variant="light" size="lg">
                  {statusLabel[a.status]}
                </Badge>
              </Group>
            ))}
          </Stack>
        </Section>
      )}

      {!record && (
        <Paper withBorder p="lg">
          <Text c="dimmed">
            No weights, vaccinations, medications or visit notes are loaded for {patient.name} in this workspace.
          </Text>
        </Paper>
      )}

      {record && (
        <Grid gap="lg">
          <Grid.Col span={{ base: 12, lg: 7 }}>
            <Stack gap="lg">
              <Section title="Weight trend">
                <Text size="sm" mb="sm">
                  <Text span fw={700}>
                    {last?.kg} kg
                  </Text>{" "}
                  at the last visit. {change < 0 ? "Down" : "Up"} {Math.abs(change).toFixed(1)} kg (
                  {Math.abs(pct).toFixed(0)}%) since {fmtDate(first.date, { day: undefined })}.
                </Text>
                <WeightChart weights={weights} name={patient.name} />
              </Section>

              <Section title="Visit history">
                <Stack gap="sm" component="ol" p={0} m={0} style={{ listStyle: "none" }}>
                  {record.visits.map((v) => (
                    <Paper component="li" key={v.date} withBorder p="md">
                      <Group justify="space-between" gap="xs" wrap="wrap">
                        <Group gap="xs">
                          <Text fw={700}>{fmtDate(v.date)}</Text>
                          {v.date === TODAY && (
                            <Badge size="sm" color="teal" variant="light">
                              Today
                            </Badge>
                          )}
                        </Group>
                        <Text size="sm" c="dimmed">
                          {getVet(v.vet)?.name} · ${v.invoice_usd.toFixed(2)}
                        </Text>
                      </Group>
                      <Text fw={600} size="sm" mt={2}>
                        {v.reason}
                      </Text>
                      <Text size="sm" mt={4}>
                        {v.notes}
                      </Text>
                    </Paper>
                  ))}
                </Stack>
              </Section>
            </Stack>
          </Grid.Col>

          <Grid.Col span={{ base: 12, lg: 5 }}>
            <Stack gap="lg">
              <Section title="Vaccinations" icon={<IconShieldCheck size={22} aria-hidden />}>
                <Table.ScrollContainer minWidth={380}>
                  <Table verticalSpacing="sm" aria-label="Vaccinations">
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>Vaccine</Table.Th>
                        <Table.Th>Given</Table.Th>
                        <Table.Th>Due</Table.Th>
                        <Table.Th>Status</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {record.vaccinations.map((v) => {
                        const s = vaccineState(v.due);
                        return (
                          <Table.Tr key={v.name} bg={s.days < 0 ? "var(--mantine-color-red-light)" : undefined}>
                            <Table.Td fw={650}>{v.name}</Table.Td>
                            <Table.Td>{fmtDate(v.given, { day: undefined })}</Table.Td>
                            <Table.Td>{fmtDate(v.due)}</Table.Td>
                            <Table.Td>
                              <Badge color={s.color} variant={s.days < 0 ? "filled" : "light"} tt="none">
                                {s.label}
                              </Badge>
                            </Table.Td>
                          </Table.Tr>
                        );
                      })}
                    </Table.Tbody>
                  </Table>
                </Table.ScrollContainer>
              </Section>

              <Section title="Current medications" icon={<IconPill size={22} aria-hidden />}>
                <Stack gap="sm" component="ul" p={0} m={0} style={{ listStyle: "none" }}>
                  {record.medications.map((m) => (
                    <Group key={m.name} component="li" wrap="nowrap" align="flex-start" gap="sm">
                      <ThemeIcon variant="light" color="teal" size="lg" aria-hidden>
                        <IconPill size={18} />
                      </ThemeIcon>
                      <div>
                        <Text fw={650}>{m.name}</Text>
                        <Text size="sm">{m.dose}</Text>
                        <Text size="xs" c="dimmed">
                          Since {fmtDate(m.since)}
                        </Text>
                      </div>
                    </Group>
                  ))}
                </Stack>
              </Section>
            </Stack>
          </Grid.Col>
        </Grid>
      )}
    </Stack>
  );
}
```

```tsx components/PatientSearch.tsx
"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Combobox, Group, Text, TextInput, useCombobox } from "@mantine/core";
import { IconAlertTriangleFilled, IconSearch } from "@tabler/icons-react";
import { getOwner, patients } from "@/lib/data";

export function PatientSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const combobox = useCombobox({ onDropdownClose: () => combobox.resetSelectedOption() });

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return patients
      .map((p) => ({ p, owner: getOwner(p.owner) }))
      .filter(({ p, owner }) => p.name.toLowerCase().includes(q) || (owner?.name.toLowerCase().includes(q) ?? false))
      .slice(0, 8);
  }, [query]);

  return (
    <Combobox
      store={combobox}
      withinPortal
      onOptionSubmit={(id) => {
        setQuery("");
        combobox.closeDropdown();
        router.push(`/patients/${id}`);
      }}
    >
      <Combobox.Target>
        <TextInput
          aria-label="Search patient or owner by name"
          placeholder="Search patient or owner"
          size="md"
          leftSection={<IconSearch size={18} aria-hidden />}
          value={query}
          autoComplete="off"
          onChange={(e) => {
            setQuery(e.currentTarget.value);
            combobox.openDropdown();
            combobox.selectFirstOption();
          }}
          onFocus={() => query && combobox.openDropdown()}
          onBlur={() => combobox.closeDropdown()}
        />
      </Combobox.Target>
      <Combobox.Dropdown>
        <Combobox.Options>
          {query.trim() === "" ? (
            <Combobox.Empty>Type a pet or owner name</Combobox.Empty>
          ) : results.length === 0 ? (
            <Combobox.Empty>No patient or owner found</Combobox.Empty>
          ) : (
            results.map(({ p, owner }) => (
              <Combobox.Option key={p.id} value={p.id} py="sm">
                <Group justify="space-between" wrap="nowrap" gap="sm">
                  <div>
                    <Text fw={650} size="sm">
                      {p.name}{" "}
                      <Text span c="dimmed" fw={400}>
                        {p.species}, {p.breed}
                      </Text>
                    </Text>
                    <Text size="xs" c="dimmed">
                      Owner: {owner?.name}
                    </Text>
                  </div>
                  {p.alerts.length > 0 && (
                    <IconAlertTriangleFilled
                      size={18}
                      color="var(--mantine-color-red-7)"
                      aria-label="Has medical alerts"
                      role="img"
                    />
                  )}
                </Group>
              </Combobox.Option>
            ))
          )}
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
}
```

```tsx components/Schedule.tsx
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
```

```tsx components/Shell.tsx
"use client";

import Link from "next/link";
import { Avatar, Box, Container, Group, Text, UnstyledButton } from "@mantine/core";
import { IconPaw } from "@tabler/icons-react";
import { CLINIC, PRODUCT, user } from "@/lib/data";
import { PatientSearch } from "./PatientSearch";

export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <Box
      mih="100dvh"
      style={{ background: "light-dark(var(--mantine-color-gray-0), var(--mantine-color-dark-8))" }}
    >
      <Box
        component="header"
        style={{
          background: "var(--mantine-color-body)",
          borderBottom: "1px solid var(--mantine-color-default-border)",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <Container size={1400} px={{ base: "md", sm: "lg" }} py="sm">
          <Group justify="space-between" wrap="wrap" gap="sm">
            <UnstyledButton component={Link} href="/" aria-label={`${PRODUCT}, today's schedule`}>
              <Group gap="sm" wrap="nowrap">
                <Box
                  w={40}
                  h={40}
                  style={{
                    background: "var(--mantine-color-teal-7)",
                    color: "white",
                    borderRadius: "var(--mantine-radius-md)",
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  <IconPaw size={24} aria-hidden />
                </Box>
                <div>
                  <Text fw={750} size="lg" lh={1.1}>
                    {PRODUCT}
                  </Text>
                  <Text size="xs" c="dimmed" lh={1.2}>
                    {CLINIC}
                  </Text>
                </div>
              </Group>
            </UnstyledButton>

            <Box visibleFrom="sm" w={340}>
              <PatientSearch />
            </Box>

            <Group gap="sm" wrap="nowrap">
              <Box visibleFrom="xs" ta="right">
                <Text size="sm" fw={650} lh={1.2}>
                  {user.name}
                </Text>
                <Text size="xs" c="dimmed" lh={1.2}>
                  {user.role}
                </Text>
              </Box>
              <Avatar color="teal" radius="xl" aria-label={`${user.name}, ${user.role}`}>
                RL
              </Avatar>
            </Group>
          </Group>
          <Box hiddenFrom="sm" mt="sm">
            <PatientSearch />
          </Box>
        </Container>
      </Box>
      <Container component="main" size={1400} px={{ base: "md", sm: "lg" }} py={{ base: "md", sm: "lg" }}>
        {children}
      </Container>
    </Box>
  );
}
```

```tsx components/WeightChart.tsx
"use client";

import { LineChart } from "@mantine/charts";
import { VisuallyHidden } from "@mantine/core";
import { fmtDate } from "@/lib/utils";

type Props = { weights: { date: string; kg: number }[]; name: string };

const label = (iso: string) => {
  const month = fmtDate(iso, { day: undefined, year: undefined, month: "short" });
  return `${month} ’${iso.slice(2, 4)}`;
};

export function WeightChart({ weights, name }: Props) {
  const data = weights.map((w) => ({ date: label(w.date), Weight: w.kg }));
  const values = weights.map((w) => w.kg);
  const min = Math.floor(Math.min(...values) - 1);
  const max = Math.ceil(Math.max(...values) + 1);
  return (
    <>
      <LineChart
        h={260}
        data={data}
        dataKey="date"
        series={[{ name: "Weight", color: "teal.7" }]}
        curveType="linear"
        yAxisProps={{ domain: [min, max], width: 44 }}
        valueFormatter={(v) => `${v} kg`}
        withDots
        dotProps={{ r: 5 }}
        activeDotProps={{ r: 7 }}
        gridAxis="xy"
        aria-hidden
      />
      <VisuallyHidden>
        <ul aria-label={`${name}'s weight by visit`}>
          {weights.map((w) => (
            <li key={w.date}>
              {fmtDate(w.date)}: {w.kg} kg
            </li>
          ))}
        </ul>
      </VisuallyHidden>
    </>
  );
}
```

```ts lib/data.ts
export type Vet = { id: string; name: string; room: string };
export type Owner = { id: string; name: string; phone: string };
export type Patient = {
  id: string;
  name: string;
  species: string;
  breed: string;
  born: string;
  sex: string;
  owner: string;
  alerts: string[];
};
export type Status = "booked" | "checked_in" | "in_exam" | "done" | "cancelled";
export type Appointment = {
  id: string;
  patient: string;
  vet: string;
  start: string;
  minutes: number;
  reason: string;
  status: Status;
  urgent?: boolean;
  /** Minutes since midnight at which the patient was checked in. */
  checkedInAt?: number;
};
export type Vaccination = { name: string; given: string; due: string };
export type Medication = { name: string; dose: string; since: string };
export type Visit = {
  date: string;
  vet: string;
  reason: string;
  notes: string;
  invoice_usd: number;
};
export type PatientRecord = {
  weights_kg: { date: string; kg: number }[];
  vaccinations: Vaccination[];
  medications: Medication[];
  visits: Visit[];
};

export const CLINIC = "Hillside Veterinary Clinic";
export const PRODUCT = "Pawpoint";
export const TODAY = "2026-11-12";
/** The simulated clock at the counter when the page opens: 09:50. */
export const NOW_START = 9 * 60 + 50;
export const DAY_START = 8 * 60;
export const DAY_END = 17 * 60 + 30;

export const user = { name: "Rosa Lindqvist", role: "Receptionist" };

export const vets: Vet[] = [
  { id: "v-1", name: "Dr. Amara Osei", room: "Exam 1" },
  { id: "v-2", name: "Dr. Tomás Reyes", room: "Exam 2" },
  { id: "v-3", name: "Dr. Helen Park", room: "Surgery" },
];

export const owners: Owner[] = [
  { id: "o-1", name: "Daniel Kim", phone: "+1 555 0142" },
  { id: "o-2", name: "Priya Natarajan", phone: "+1 555 0178" },
  { id: "o-3", name: "Lucas Moreau", phone: "+1 555 0119" },
  { id: "o-4", name: "Grace Whitfield", phone: "+1 555 0163" },
  { id: "o-5", name: "Sam Oduya", phone: "+1 555 0190" },
  { id: "o-6", name: "Elena Rossi", phone: "+1 555 0105" },
];

export const patients: Patient[] = [
  {
    id: "p-101",
    name: "Biscuit",
    species: "Dog",
    breed: "Beagle",
    born: "2019-04-02",
    sex: "Male, neutered",
    owner: "o-1",
    alerts: [],
  },
  {
    id: "p-102",
    name: "Mochi",
    species: "Cat",
    breed: "Domestic shorthair",
    born: "2021-07-15",
    sex: "Female, spayed",
    owner: "o-2",
    alerts: ["Bites when restrained"],
  },
  {
    id: "p-103",
    name: "Pepper",
    species: "Dog",
    breed: "Border collie",
    born: "2016-01-20",
    sex: "Female, spayed",
    owner: "o-3",
    alerts: [],
  },
  {
    id: "p-104",
    name: "Olive",
    species: "Dog",
    breed: "Labrador retriever",
    born: "2014-09-08",
    sex: "Female, spayed",
    owner: "o-4",
    alerts: ["Penicillin allergy", "Chronic kidney disease, stage 2"],
  },
  {
    id: "p-105",
    name: "Kiwi",
    species: "Bird",
    breed: "Budgerigar",
    born: "2023-03-11",
    sex: "Male",
    owner: "o-5",
    alerts: [],
  },
  {
    id: "p-106",
    name: "Tofu",
    species: "Rabbit",
    breed: "Holland lop",
    born: "2022-05-30",
    sex: "Female",
    owner: "o-6",
    alerts: [],
  },
  {
    id: "p-107",
    name: "Ziggy",
    species: "Cat",
    breed: "Maine coon",
    born: "2018-11-02",
    sex: "Male, neutered",
    owner: "o-2",
    alerts: ["Diabetic: insulin twice daily"],
  },
  {
    id: "p-108",
    name: "Bruno",
    species: "Dog",
    breed: "French bulldog",
    born: "2022-02-14",
    sex: "Male",
    owner: "o-5",
    alerts: ["Brachycephalic: sedation risk"],
  },
];

export const initialAppointments: Appointment[] = [
  { id: "a-01", patient: "p-101", vet: "v-1", start: "08:30", minutes: 20, reason: "Annual vaccination", status: "done" },
  { id: "a-02", patient: "p-104", vet: "v-2", start: "08:30", minutes: 30, reason: "Kidney panel recheck", status: "done" },
  { id: "a-03", patient: "p-108", vet: "v-3", start: "08:00", minutes: 120, reason: "Soft palate surgery", status: "in_exam" },
  { id: "a-04", patient: "p-102", vet: "v-1", start: "09:00", minutes: 30, reason: "Limping, left hind leg", status: "in_exam" },
  { id: "a-05", patient: "p-107", vet: "v-2", start: "09:15", minutes: 20, reason: "Glucose curve", status: "checked_in", checkedInAt: 9 * 60 + 5 },
  { id: "a-06", patient: "p-105", vet: "v-1", start: "09:45", minutes: 20, reason: "Beak and nail trim", status: "checked_in", checkedInAt: 9 * 60 + 38 },
  { id: "a-07", patient: "p-103", vet: "v-2", start: "10:00", minutes: 30, reason: "Senior wellness exam", status: "booked" },
  { id: "a-08", patient: "p-106", vet: "v-1", start: "10:30", minutes: 20, reason: "Not eating since yesterday", status: "booked", urgent: true },
  { id: "a-09", patient: "p-104", vet: "v-3", start: "11:00", minutes: 45, reason: "Dental cleaning", status: "booked" },
  { id: "a-10", patient: "p-101", vet: "v-2", start: "11:30", minutes: 20, reason: "Ear infection follow-up", status: "booked" },
  { id: "a-11", patient: "p-107", vet: "v-1", start: "13:30", minutes: 30, reason: "Dental check", status: "booked" },
  { id: "a-12", patient: "p-103", vet: "v-3", start: "14:00", minutes: 60, reason: "Lump removal", status: "cancelled" },
  { id: "a-13", patient: "p-102", vet: "v-2", start: "15:00", minutes: 20, reason: "X-ray results", status: "booked" },
];

export const records: Record<string, PatientRecord> = {
  "p-104": {
    weights_kg: [
      { date: "2025-05-14", kg: 31.8 },
      { date: "2025-08-20", kg: 31.1 },
      { date: "2025-11-03", kg: 30.4 },
      { date: "2026-02-11", kg: 29.9 },
      { date: "2026-06-17", kg: 29.2 },
      { date: "2026-11-12", kg: 28.6 },
    ],
    vaccinations: [
      { name: "Rabies", given: "2024-10-02", due: "2027-10-02" },
      { name: "DHPP", given: "2025-10-15", due: "2026-10-15" },
      { name: "Leptospirosis", given: "2025-10-15", due: "2026-10-15" },
      { name: "Bordetella", given: "2026-04-08", due: "2027-04-08" },
    ],
    medications: [
      { name: "Benazepril 5 mg", dose: "1 tablet daily", since: "2025-08-20" },
      { name: "Renal diet (dry)", dose: "2.5 cups daily", since: "2025-08-20" },
    ],
    visits: [
      {
        date: "2026-11-12",
        vet: "v-2",
        reason: "Kidney panel recheck",
        notes: "Creatinine 2.1 mg/dL (was 2.0). Weight down 0.6 kg. Continue benazepril, recheck in 3 months.",
        invoice_usd: 186.0,
      },
      {
        date: "2026-06-17",
        vet: "v-2",
        reason: "Kidney panel recheck",
        notes: "Stable. Appetite good. Owner reports more drinking in hot weather.",
        invoice_usd: 172.5,
      },
      {
        date: "2026-02-11",
        vet: "v-1",
        reason: "Coughing",
        notes: "Mild kennel cough. Supportive care; no antibiotics given (penicillin allergy).",
        invoice_usd: 94.0,
      },
      {
        date: "2025-11-03",
        vet: "v-2",
        reason: "Senior wellness exam",
        notes: "Grade 2 dental tartar. Dental cleaning recommended.",
        invoice_usd: 148.0,
      },
    ],
  },
};

export const getPatient = (id: string) => patients.find((p) => p.id === id);
export const getOwner = (id: string) => owners.find((o) => o.id === id);
export const getVet = (id: string) => vets.find((v) => v.id === id);
```

```ts lib/utils.ts
import type { Appointment, Status } from "./data";

export const toMin = (hhmm: string): number => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

export const fromMin = (min: number): string => {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

export const endOf = (a: { start: string; minutes: number }): string =>
  fromMin(toMin(a.start) + a.minutes);

const dayNumber = (iso: string): number => {
  const [y, m, d] = iso.split("-").map(Number);
  return Math.round(Date.UTC(y, m - 1, d) / 86400000);
};

/** Whole days from `a` to `b` (both YYYY-MM-DD). Positive when b is later. */
export const daysBetween = (a: string, b: string): number => dayNumber(b) - dayNumber(a);

export const fmtDate = (iso: string, opts?: Intl.DateTimeFormatOptions): string =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    timeZone: "UTC",
    day: "numeric",
    month: "short",
    year: "numeric",
    ...opts,
  });

export const ageString = (born: string, today: string): string => {
  const [by, bm, bd] = born.split("-").map(Number);
  const [ty, tm, td] = today.split("-").map(Number);
  let months = (ty - by) * 12 + (tm - bm);
  if (td < bd) months -= 1;
  const years = Math.floor(months / 12);
  const rest = months % 12;
  if (years === 0) return `${rest} mo`;
  return rest === 0 ? `${years} yr` : `${years} yr ${rest} mo`;
};

export const statusLabel: Record<Status, string> = {
  booked: "Booked",
  checked_in: "Checked in",
  in_exam: "In exam",
  done: "Done",
  cancelled: "Cancelled",
};

export const statusColor: Record<Status, string> = {
  booked: "gray",
  checked_in: "orange",
  in_exam: "blue",
  done: "teal",
  cancelled: "gray",
};

/** Does a candidate slot clash with an active booking of the same vet? */
export const clashes = (
  list: Appointment[],
  vet: string,
  start: number,
  minutes: number,
): Appointment | undefined =>
  list.find(
    (a) =>
      a.vet === vet &&
      a.status !== "cancelled" &&
      start < toMin(a.start) + a.minutes &&
      toMin(a.start) < start + minutes,
  );

export const fmtWait = (minutes: number): string => {
  const m = Math.max(0, Math.floor(minutes));
  if (m < 60) return `${m} min`;
  return `${Math.floor(m / 60)} h ${m % 60} min`;
};
```

