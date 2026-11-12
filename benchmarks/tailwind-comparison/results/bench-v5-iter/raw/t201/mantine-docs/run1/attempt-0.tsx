```tsx app/layout.tsx
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/charts/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/spotlight/styles.css";

import type { Metadata, Viewport } from "next";
import { ColorSchemeScript, MantineProvider, mantineHtmlProps } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { Notifications } from "@mantine/notifications";
import { theme } from "./theme";

export const metadata: Metadata = {
  title: "Pawpoint | Hillside Veterinary Clinic",
  description: "Front-desk and records software for Hillside Veterinary Clinic",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript defaultColorScheme="light" />
      </head>
      <body>
        <MantineProvider theme={theme} defaultColorScheme="light">
          <ModalsProvider>
            <Notifications position="bottom-center" />
            {children}
          </ModalsProvider>
        </MantineProvider>
      </body>
    </html>
  );
}
```

```tsx app/page.tsx
import { AppFrame } from "@/components/AppFrame";
import { Schedule } from "@/components/Schedule";

export default function Page() {
  return (
    <AppFrame>
      <Schedule />
    </AppFrame>
  );
}
```

```tsx app/patients/[id]/page.tsx
import type { Metadata } from "next";
import { AppFrame } from "@/components/AppFrame";
import { PatientRecord } from "@/components/PatientRecord";
import { getPatient, patients } from "@/lib/data";

export function generateStaticParams() {
  return patients.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const p = getPatient(id);
  return { title: p ? `${p.name} | Pawpoint` : "Patient | Pawpoint" };
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <AppFrame>
      <PatientRecord id={id} />
    </AppFrame>
  );
}
```

```ts app/theme.ts
import { createTheme } from "@mantine/core";

// System font stack, identical in every arm (no network font fetch at build).
export const theme = createTheme({
  fontFamily: "ui-sans-serif, system-ui, sans-serif",
  headings: { fontFamily: "ui-sans-serif, system-ui, sans-serif", fontWeight: "700" },
  primaryColor: "teal",
  primaryShade: { light: 7, dark: 6 },
  defaultRadius: "md",
  cursorType: "pointer",
  components: {
    Button: { defaultProps: { fw: 600 } },
    Paper: { defaultProps: { radius: "md" } },
  },
});
```

```tsx components/AlertBadges.tsx
"use client";

import { Badge, Group, VisuallyHidden } from "@mantine/core";
import { IconAlertTriangleFilled } from "@tabler/icons-react";

/** Medical alerts, drawn the same loud way everywhere a patient appears. */
export function AlertBadges({ alerts, size = "md" }: { alerts: string[]; size?: "sm" | "md" | "lg" }) {
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
          radius="sm"
          leftSection={<IconAlertTriangleFilled size={14} aria-hidden />}
          styles={{
            root: { height: "auto", paddingBlock: 3, maxWidth: "100%" },
            label: { textTransform: "none", whiteSpace: "normal", fontWeight: 700 },
          }}
        >
          <VisuallyHidden>Medical alert: </VisuallyHidden>
          {alert}
        </Badge>
      ))}
    </Group>
  );
}
```

```tsx components/AppFrame.tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { AppShell, Avatar, Badge, Button, Group, Text, UnstyledButton, ThemeIcon, Box } from "@mantine/core";
import { Spotlight, spotlight, type SpotlightActionData } from "@mantine/spotlight";
import { IconPaw, IconSearch, IconAlertTriangleFilled } from "@tabler/icons-react";
import { getOwner, patients, user, clinicName } from "@/lib/data";

export function AppFrame({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const actions = useMemo<SpotlightActionData[]>(
    () =>
      patients.map((p) => {
        const owner = getOwner(p.owner);
        return {
          id: p.id,
          label: p.name,
          description: `${p.species}, ${p.breed} · Owner ${owner.name} · ${owner.phone}`,
          keywords: [owner.name, p.species, p.breed],
          leftSection: <IconPaw size={22} aria-hidden />,
          rightSection:
            p.alerts.length > 0 ? (
              <Badge
                color="red.7"
                variant="filled"
                leftSection={<IconAlertTriangleFilled size={12} aria-hidden />}
                styles={{ label: { textTransform: "none" } }}
              >
                {p.alerts.length === 1 ? "Alert" : `${p.alerts.length} alerts`}
              </Badge>
            ) : undefined,
          onClick: () => router.push(`/patients/${p.id}`),
        };
      }),
    [router],
  );

  return (
    <AppShell header={{ height: 64 }} padding={{ base: "sm", sm: "md", lg: "lg" }} bg="gray.0">
      <AppShell.Header>
        <Group h="100%" px={{ base: "sm", sm: "md", lg: "lg" }} justify="space-between" wrap="nowrap" gap="sm">
          <UnstyledButton component={Link} href="/" aria-label="Pawpoint, today's schedule">
            <Group gap="xs" wrap="nowrap">
              <ThemeIcon size={38} radius="md" color="teal.7">
                <IconPaw size={24} aria-hidden />
              </ThemeIcon>
              <Box>
                <Text fw={800} fz="lg" lh={1.1}>
                  Pawpoint
                </Text>
                <Text fz="xs" c="gray.7" lh={1.1} visibleFrom="sm">
                  {clinicName}
                </Text>
              </Box>
            </Group>
          </UnstyledButton>

          <Button
            variant="default"
            size="md"
            h={44}
            onClick={spotlight.open}
            leftSection={<IconSearch size={18} aria-hidden />}
            aria-label="Search patients or owners"
            justify="space-between"
            style={{ flex: "0 1 420px", minWidth: 0 }}
            rightSection={
              <Text span fz="xs" c="gray.7" visibleFrom="md">
                Ctrl K
              </Text>
            }
          >
            <Text span c="gray.7" fw={400} truncate>
              Find a patient or owner
            </Text>
          </Button>

          <Group gap="xs" wrap="nowrap" visibleFrom="sm">
            <Avatar color="teal" radius="xl">
              RL
            </Avatar>
            <Box>
              <Text fz="sm" fw={600} lh={1.2}>
                {user.name}
              </Text>
              <Text fz="xs" c="gray.7" lh={1.2}>
                {user.role}
              </Text>
            </Box>
          </Group>
          <Avatar color="teal" radius="xl" hiddenFrom="sm" aria-label={`${user.name}, ${user.role}`}>
            RL
          </Avatar>
        </Group>
      </AppShell.Header>

      <Spotlight
        actions={actions}
        shortcut={["mod + K", "/"]}
        highlightQuery
        limit={8}
        nothingFound="No patient or owner with that name"
        searchProps={{
          leftSection: <IconSearch size={20} aria-hidden />,
          placeholder: "Search by pet or owner name",
          "aria-label": "Search by pet or owner name",
        }}
      />

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
```

```tsx components/BookingModal.tsx
"use client";

import { useMemo, useState } from "react";
import { Alert, Button, Group, Modal, Select, SegmentedControl, Stack, Text, TextInput, Input } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { IconAlertTriangleFilled, IconCalendarPlus } from "@tabler/icons-react";
import {
  type Appointment,
  fmtLongToday,
  findClash,
  getOwner,
  getPatient,
  getVet,
  patients,
  toClock,
  toMinutes,
  vets,
} from "@/lib/data";

const LENGTHS = ["15", "20", "30", "45", "60"];

export type NewBooking = { patient: string; vet: string; start: string; minutes: number; reason: string };

type Props = {
  opened: boolean;
  onClose: () => void;
  appointments: Appointment[];
  nowMin: number;
  onBook: (b: NewBooking) => void;
};

export function BookingModal({ opened, onClose, appointments, nowMin, onBook }: Props) {
  const isPhone = useMediaQuery("(max-width: 36em)");
  const [patient, setPatient] = useState<string | null>(null);
  const [vet, setVet] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [length, setLength] = useState("20");
  const [reason, setReason] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const minutes = Number(length);

  const patientData = useMemo(
    () =>
      patients.map((p) => ({
        value: p.id,
        label: `${p.name} (${p.species}) · ${getOwner(p.owner).name}${p.alerts.length ? " · ALERT" : ""}`,
      })),
    [],
  );
  const vetData = vets.map((v) => ({ value: v.id, label: `${v.name} · ${v.room}` }));

  const timeData = useMemo(() => {
    const out: { value: string; label: string; disabled?: boolean }[] = [];
    for (let m = 8 * 60; m <= 17 * 60 + 30; m += 15) {
      const clash = vet ? findClash(appointments, vet, m, minutes) : undefined;
      const past = m < nowMin;
      out.push({
        value: toClock(m),
        label: clash ? `${toClock(m)} · taken` : past ? `${toClock(m)} · passed` : toClock(m),
        disabled: Boolean(clash) || past,
      });
    }
    return out;
  }, [appointments, vet, minutes, nowMin]);

  // The chosen slot may stop being free when the vet or the length changes.
  const selectedClash = vet && time ? findClash(appointments, vet, toMinutes(time), minutes) : undefined;
  const patientBusy =
    patient && time
      ? appointments.find(
          (a) =>
            a.patient === patient &&
            a.status !== "cancelled" &&
            toMinutes(time) < toMinutes(a.start) + a.minutes &&
            toMinutes(a.start) < toMinutes(time) + minutes,
        )
      : undefined;

  const reset = () => {
    setPatient(null);
    setVet(null);
    setTime(null);
    setLength("20");
    setReason("");
    setSubmitted(false);
  };
  const close = () => {
    onClose();
    reset();
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (!patient || !vet || !time || !reason.trim() || selectedClash || patientBusy) return;
    onBook({ patient, vet, start: time, minutes, reason: reason.trim() });
    reset();
  };

  const picked = patient ? getPatient(patient) : undefined;

  return (
    <Modal
      opened={opened}
      onClose={close}
      title={<Text fw={700} fz="lg">Book an appointment</Text>}
      fullScreen={Boolean(isPhone)}
      size="lg"
      centered={!isPhone}
    >
      <form onSubmit={submit} noValidate>
        <Stack gap="md">
          <Text c="gray.7" fz="sm">
            {fmtLongToday()}. A vet cannot be booked twice at the same time.
          </Text>

          <Select
            label="Patient"
            placeholder="Search by pet or owner name"
            data={patientData}
            value={patient}
            onChange={setPatient}
            searchable
            nothingFoundMessage="No matching patient"
            size="md"
            error={submitted && !patient ? "Pick a patient" : undefined}
            withAsterisk
            comboboxProps={{ withinPortal: true }}
          />
          {picked && picked.alerts.length > 0 && (
            <Alert color="red.7" variant="filled" icon={<IconAlertTriangleFilled size={20} aria-hidden />} title="Medical alert">
              {picked.alerts.join(" · ")}
            </Alert>
          )}

          <Select
            label="Vet"
            placeholder="Choose a vet"
            data={vetData}
            value={vet}
            onChange={setVet}
            size="md"
            allowDeselect={false}
            error={submitted && !vet ? "Pick a vet" : undefined}
            withAsterisk
          />

          <Input.Wrapper label="Length">
            <SegmentedControl
              fullWidth
              size="md"
              data={LENGTHS.map((l) => ({ value: l, label: `${l} min` }))}
              value={length}
              onChange={setLength}
              aria-label="Appointment length"
            />
          </Input.Wrapper>

          <Select
            label="Time"
            placeholder={vet ? "Choose a free time" : "Choose a vet first"}
            description={vet ? `Times marked "taken" clash with ${getVet(vet).name}'s bookings` : undefined}
            data={timeData}
            value={time}
            onChange={setTime}
            size="md"
            searchable
            maxDropdownHeight={260}
            withAsterisk
            error={
              selectedClash
                ? `Clashes with ${selectedClash.start}–${toClock(toMinutes(selectedClash.start) + selectedClash.minutes)} (${selectedClash.reason}). Pick another time or length.`
                : patientBusy
                  ? `${getPatient(patientBusy.patient)?.name} is already booked then with ${getVet(patientBusy.vet).name}.`
                  : submitted && !time
                    ? "Pick a time"
                    : undefined
            }
          />

          <TextInput
            label="Reason for visit"
            placeholder="e.g. Booster vaccination"
            value={reason}
            onChange={(e) => setReason(e.currentTarget.value)}
            size="md"
            withAsterisk
            error={submitted && !reason.trim() ? "Add a reason" : undefined}
          />

          <Group justify="flex-end" mt="xs">
            <Button variant="default" size="md" onClick={close}>
              Cancel
            </Button>
            <Button type="submit" size="md" leftSection={<IconCalendarPlus size={18} aria-hidden />}>
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
  Anchor,
  Badge,
  Box,
  Divider,
  Grid,
  Group,
  List,
  Paper,
  Stack,
  Text,
  ThemeIcon,
  Timeline,
  Title,
} from "@mantine/core";
import { LineChart } from "@mantine/charts";
import {
  IconAlertTriangleFilled,
  IconArrowLeft,
  IconCalendarEvent,
  IconPaw,
  IconPhone,
  IconPill,
  IconStethoscope,
  IconShieldCheck,
  IconTrendingDown,
} from "@tabler/icons-react";
import {
  ageOf,
  fmtDate,
  fmtShort,
  getOwner,
  getVet,
  initialAppointments,
  records,
  type Patient,
  usd,
  vaccStatus,
  today,
  endTime,
  daysBetween,
} from "@/lib/data";
import { getPatient } from "@/lib/data";

function Section({ icon, title, children, id }: { icon: React.ReactNode; title: string; children: React.ReactNode; id: string }) {
  return (
    <Paper withBorder p={{ base: "md", sm: "lg" }} component="section" aria-labelledby={id}>
      <Group gap="xs" mb="md">
        <ThemeIcon variant="light" color="teal" size={32} radius="md">
          {icon}
        </ThemeIcon>
        <Title order={2} fz="lg" id={id}>
          {title}
        </Title>
      </Group>
      {children}
    </Paper>
  );
}

export function PatientRecord({ id }: { id: string }) {
  const patient = getPatient(id);
  if (!patient) {
    return (
      <Stack>
        <BackLink />
        <Title order={1}>Patient not found</Title>
        <Text c="gray.7">There is no patient with the id {id}. Use the search above to find the record.</Text>
      </Stack>
    );
  }
  const record = records[patient.id];
  return <Record patient={patient} record={record} />;
}

function BackLink() {
  return (
    <Anchor component={Link} href="/" fw={600} display="inline-flex" style={{ alignItems: "center", gap: 6, minHeight: 32 }}>
      <IconArrowLeft size={18} aria-hidden /> Today&apos;s schedule
    </Anchor>
  );
}

function Record({ patient, record }: { patient: Patient; record: (typeof records)[string] | undefined }) {
  const owner = getOwner(patient.owner);
  const todays = initialAppointments.filter((a) => a.patient === patient.id && a.status !== "cancelled");
  const overdue = record?.vaccinations.filter((v) => vaccStatus(v.due).kind === "overdue") ?? [];

  const weights = record?.weights_kg ?? [];
  const first = weights[0];
  const last = weights[weights.length - 1];
  const chartData = weights.map((w) => ({ date: fmtShort(w.date), "Weight (kg)": w.kg }));

  return (
    <Stack gap="md" maw={1200} mx="auto">
      <BackLink />

      {patient.alerts.length > 0 && (
        <Alert
          color="red.8"
          variant="filled"
          radius="md"
          icon={<IconAlertTriangleFilled size={28} aria-hidden />}
          title={
            <Text fw={800} fz="lg" tt="uppercase" lts={0.5}>
              Medical alerts
            </Text>
          }
          role="alert"
          styles={{ icon: { alignSelf: "flex-start" } }}
        >
          <List spacing={2} listStyleType="none" c="white" fz={{ base: "lg", sm: "xl" }} fw={700}>
            {patient.alerts.map((a) => (
              <List.Item key={a}>{a}</List.Item>
            ))}
          </List>
        </Alert>
      )}

      <Paper withBorder p={{ base: "md", sm: "lg" }}>
        <Group justify="space-between" align="flex-start" gap="md">
          <Group gap="md" wrap="nowrap" align="flex-start">
            <ThemeIcon size={64} radius="xl" color="teal" variant="light" visibleFrom="xs">
              <IconPaw size={36} aria-hidden />
            </ThemeIcon>
            <Box>
              <Title order={1} fz={{ base: 28, sm: 36 }} lh={1.1}>
                {patient.name}
              </Title>
              <Text c="gray.7" fz="lg">
                {patient.breed} · {patient.species}
              </Text>
              <Group gap="xs" mt={8}>
                {todays.map((a) => (
                  <Badge key={a.id} variant="light" color="teal" size="lg" leftSection={<IconCalendarEvent size={14} aria-hidden />}>
                    Today {a.start}–{endTime(a)}: {a.reason}
                  </Badge>
                ))}
              </Group>
            </Box>
          </Group>

          <Grid gap="md" style={{ flex: "1 1 340px", maxWidth: 560 }}>
            <Detail label="Age" value={`${ageOf(patient.born)} (born ${fmtDate(patient.born)})`} />
            <Detail label="Sex" value={patient.sex} />
            <Detail label="Owner" value={owner.name} />
            <Detail
              label="Phone"
              value={
                <Anchor href={`tel:${owner.phone.replace(/\s/g, "")}`} fw={600} display="inline-flex" style={{ alignItems: "center", gap: 4 }}>
                  <IconPhone size={16} aria-hidden /> {owner.phone}
                </Anchor>
              }
            />
          </Grid>
        </Group>
      </Paper>

      {!record ? (
        <Paper withBorder p="lg">
          <Text c="gray.7">No clinical history has been entered for {patient.name} yet.</Text>
        </Paper>
      ) : (
        <Grid gap="md">
          <Grid.Col span={{ base: 12, md: 7 }}>
            <Stack gap="md">
              <Section id="weight" title="Weight trend" icon={<IconTrendingDown size={20} aria-hidden />}>
                <Group gap="xl" mb="sm">
                  <Box>
                    <Text fz="xs" c="gray.7" tt="uppercase" fw={700}>
                      Latest
                    </Text>
                    <Text fz={28} fw={800} lh={1.1}>
                      {last.kg} kg
                    </Text>
                  </Box>
                  <Box>
                    <Text fz="xs" c="gray.7" tt="uppercase" fw={700}>
                      Since {fmtDate(first.date)}
                    </Text>
                    <Text fz={28} fw={800} lh={1.1} c="orange.8">
                      −{(first.kg - last.kg).toFixed(1)} kg
                      <Text span fz="md" fw={600}>
                        {" "}
                        ({(((first.kg - last.kg) / first.kg) * 100).toFixed(0)}%)
                      </Text>
                    </Text>
                  </Box>
                </Group>
                <LineChart
                  h={240}
                  data={chartData}
                  dataKey="date"
                  series={[{ name: "Weight (kg)", color: "teal.7" }]}
                  curveType="linear"
                  yAxisProps={{ domain: [27, 33] }}
                  unit=" kg"
                  withDots
                  gridAxis="xy"
                  tickLine="xy"
                  aria-label={`Weight in kilograms over ${weights.length} visits, from ${first.kg} on ${fmtDate(first.date)} to ${last.kg} on ${fmtDate(last.date)}`}
                />
              </Section>

              <Section id="visits" title="Visit history" icon={<IconStethoscope size={20} aria-hidden />}>
                <Timeline active={0} bulletSize={22} lineWidth={2} color="teal">
                  {record.visits.map((v) => (
                    <Timeline.Item
                      key={v.date}
                      title={
                        <Group gap="xs" justify="space-between" wrap="wrap">
                          <Text fw={700}>{v.reason}</Text>
                          <Text fz="sm" c="gray.7">
                            {fmtDate(v.date)}
                          </Text>
                        </Group>
                      }
                    >
                      <Text fz="sm" c="gray.7" mb={4}>
                        {getVet(v.vet).name} · Invoice {usd(v.invoice_usd)}
                      </Text>
                      <Text fz="md">{v.notes}</Text>
                    </Timeline.Item>
                  ))}
                </Timeline>
              </Section>
            </Stack>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 5 }}>
            <Stack gap="md">
              <Section id="vaccinations" title="Vaccinations" icon={<IconShieldCheck size={20} aria-hidden />}>
                {overdue.length > 0 && (
                  <Alert color="red" variant="light" mb="sm" icon={<IconAlertTriangleFilled size={18} aria-hidden />} title={`${overdue.length} overdue as of ${fmtDate(today)}`}>
                    {overdue.map((v) => v.name).join(" and ")} need a booster.
                  </Alert>
                )}
                <Stack gap="xs" component="ul" m={0} p={0} style={{ listStyle: "none" }}>
                  {record.vaccinations.map((v) => {
                    const s = vaccStatus(v.due);
                    const isOverdue = s.kind === "overdue";
                    return (
                      <Paper
                        key={v.name}
                        component="li"
                        p="sm"
                        withBorder
                        bg={isOverdue ? "red.0" : undefined}
                        style={isOverdue ? { borderColor: "var(--mantine-color-red-7)", borderWidth: 2 } : undefined}
                      >
                        <Group justify="space-between" wrap="wrap" gap="xs">
                          <Box>
                            <Text fw={700}>{v.name}</Text>
                            <Text fz="sm" c="gray.7">
                              Given {fmtDate(v.given)}
                            </Text>
                            <Text fz="sm" fw={isOverdue ? 700 : 400} c={isOverdue ? "red.8" : undefined}>
                              Due {fmtDate(v.due)}
                            </Text>
                          </Box>
                          {isOverdue ? (
                            <Badge color="red.8" variant="filled" size="lg" leftSection={<IconAlertTriangleFilled size={12} aria-hidden />}>
                              Overdue {s.days} days
                            </Badge>
                          ) : s.kind === "soon" ? (
                            <Badge color="yellow.8" variant="light" size="lg">
                              Due in {s.days} days
                            </Badge>
                          ) : (
                            <Badge color="teal" variant="light" size="lg">
                              Up to date
                            </Badge>
                          )}
                        </Group>
                      </Paper>
                    );
                  })}
                </Stack>
              </Section>

              <Section id="meds" title="Current medications" icon={<IconPill size={20} aria-hidden />}>
                <Stack gap="sm" component="ul" m={0} p={0} style={{ listStyle: "none" }}>
                  {record.medications.map((m, i) => (
                    <li key={m.name}>
                      {i > 0 && <Divider mb="sm" />}
                      <Text fw={700}>{m.name}</Text>
                      <Text>{m.dose}</Text>
                      <Text fz="sm" c="gray.7">
                        Since {fmtDate(m.since)} · {Math.round(daysBetween(m.since, today) / 30)} months
                      </Text>
                    </li>
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

function Detail({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Grid.Col span={{ base: 12, xs: 6 }}>
      <Text fz="xs" c="gray.7" tt="uppercase" fw={700}>
        {label}
      </Text>
      <Text fw={600} component="div">
        {value}
      </Text>
    </Grid.Col>
  );
}
```

```tsx components/Schedule.tsx
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
```

```ts lib/data.ts
export type Status = "booked" | "checked_in" | "in_exam" | "done" | "cancelled";

export type Vet = { id: string; name: string; room: string; color: string };
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
export type Visit = { date: string; vet: string; reason: string; notes: string; invoice_usd: number };
export type PatientRecordData = {
  weights_kg: { date: string; kg: number }[];
  vaccinations: Vaccination[];
  medications: Medication[];
  visits: Visit[];
};

export const clinic = "Pawpoint, front-desk and records software for Hillside Veterinary Clinic";
export const clinicName = "Hillside Veterinary Clinic";
export const today = "2026-11-12";
/** The simulated time of day at the counter when the app opens (minutes since midnight). */
export const NOW_START = 9 * 60 + 50;

export const user = { name: "Rosa Lindqvist", role: "Receptionist" };

export const vets: Vet[] = [
  { id: "v-1", name: "Dr. Amara Osei", room: "Exam 1", color: "violet" },
  { id: "v-2", name: "Dr. Tomás Reyes", room: "Exam 2", color: "cyan" },
  { id: "v-3", name: "Dr. Helen Park", room: "Surgery", color: "pink" },
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
  { id: "p-101", name: "Biscuit", species: "Dog", breed: "Beagle", born: "2019-04-02", sex: "Male, neutered", owner: "o-1", alerts: [] },
  { id: "p-102", name: "Mochi", species: "Cat", breed: "Domestic shorthair", born: "2021-07-15", sex: "Female, spayed", owner: "o-2", alerts: ["Bites when restrained"] },
  { id: "p-103", name: "Pepper", species: "Dog", breed: "Border collie", born: "2016-01-20", sex: "Female, spayed", owner: "o-3", alerts: [] },
  { id: "p-104", name: "Olive", species: "Dog", breed: "Labrador retriever", born: "2014-09-08", sex: "Female, spayed", owner: "o-4", alerts: ["Penicillin allergy", "Chronic kidney disease, stage 2"] },
  { id: "p-105", name: "Kiwi", species: "Bird", breed: "Budgerigar", born: "2023-03-11", sex: "Male", owner: "o-5", alerts: [] },
  { id: "p-106", name: "Tofu", species: "Rabbit", breed: "Holland lop", born: "2022-05-30", sex: "Female", owner: "o-6", alerts: [] },
  { id: "p-107", name: "Ziggy", species: "Cat", breed: "Maine coon", born: "2018-11-02", sex: "Male, neutered", owner: "o-2", alerts: ["Diabetic: insulin twice daily"] },
  { id: "p-108", name: "Bruno", species: "Dog", breed: "French bulldog", born: "2022-02-14", sex: "Male", owner: "o-5", alerts: ["Brachycephalic: sedation risk"] },
];

export const initialAppointments: Appointment[] = [
  { id: "a-01", patient: "p-101", vet: "v-1", start: "08:30", minutes: 20, reason: "Annual vaccination", status: "done" },
  { id: "a-02", patient: "p-104", vet: "v-2", start: "08:30", minutes: 30, reason: "Kidney panel recheck", status: "done" },
  { id: "a-03", patient: "p-108", vet: "v-3", start: "08:00", minutes: 120, reason: "Soft palate surgery", status: "in_exam" },
  { id: "a-04", patient: "p-102", vet: "v-1", start: "09:00", minutes: 30, reason: "Limping, left hind leg", status: "in_exam" },
  { id: "a-05", patient: "p-107", vet: "v-2", start: "09:15", minutes: 20, reason: "Glucose curve", status: "checked_in", checkedInAt: 9 * 60 + 14 },
  { id: "a-06", patient: "p-105", vet: "v-1", start: "09:45", minutes: 20, reason: "Beak and nail trim", status: "checked_in", checkedInAt: 9 * 60 + 41 },
  { id: "a-07", patient: "p-103", vet: "v-2", start: "10:00", minutes: 30, reason: "Senior wellness exam", status: "booked" },
  { id: "a-08", patient: "p-106", vet: "v-1", start: "10:30", minutes: 20, reason: "Not eating since yesterday", status: "booked", urgent: true },
  { id: "a-09", patient: "p-104", vet: "v-3", start: "11:00", minutes: 45, reason: "Dental cleaning", status: "booked" },
  { id: "a-10", patient: "p-101", vet: "v-2", start: "11:30", minutes: 20, reason: "Ear infection follow-up", status: "booked" },
  { id: "a-11", patient: "p-107", vet: "v-1", start: "13:30", minutes: 30, reason: "Dental check", status: "booked" },
  { id: "a-12", patient: "p-103", vet: "v-3", start: "14:00", minutes: 60, reason: "Lump removal", status: "cancelled" },
  { id: "a-13", patient: "p-102", vet: "v-2", start: "15:00", minutes: 20, reason: "X-ray results", status: "booked" },
];

export const records: Record<string, PatientRecordData> = {
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
      { date: "2026-11-12", vet: "v-2", reason: "Kidney panel recheck", notes: "Creatinine 2.1 mg/dL (was 2.0). Weight down 0.6 kg. Continue benazepril, recheck in 3 months.", invoice_usd: 186.0 },
      { date: "2026-06-17", vet: "v-2", reason: "Kidney panel recheck", notes: "Stable. Appetite good. Owner reports more drinking in hot weather.", invoice_usd: 172.5 },
      { date: "2026-02-11", vet: "v-1", reason: "Coughing", notes: "Mild kennel cough. Supportive care; no antibiotics given (penicillin allergy).", invoice_usd: 94.0 },
      { date: "2025-11-03", vet: "v-2", reason: "Senior wellness exam", notes: "Grade 2 dental tartar. Dental cleaning recommended.", invoice_usd: 148.0 },
    ],
  },
};

export function getPatient(id: string): Patient | undefined {
  return patients.find((p) => p.id === id);
}
export function getOwner(id: string): Owner {
  return owners.find((o) => o.id === id) ?? { id, name: "Unknown owner", phone: "" };
}
export function getVet(id: string): Vet {
  return vets.find((v) => v.id === id) ?? vets[0];
}

/* ---------- time and date helpers (deterministic, no locale dependence) ---------- */

export function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}
export function toClock(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
export function endTime(a: { start: string; minutes: number }): string {
  return toClock(toMinutes(a.start) + a.minutes);
}

/** Two bookings clash when they share a vet and their time ranges overlap. */
export function overlaps(startA: number, lenA: number, startB: number, lenB: number): boolean {
  return startA < startB + lenB && startB < startA + lenA;
}
export function findClash(
  list: Appointment[],
  vetId: string,
  start: number,
  minutes: number,
): Appointment | undefined {
  return list.find(
    (a) =>
      a.vet === vetId &&
      a.status !== "cancelled" &&
      overlaps(start, minutes, toMinutes(a.start), a.minutes),
  );
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function parts(iso: string): [number, number, number] {
  const [y, m, d] = iso.split("-").map(Number);
  return [y, m, d];
}
export function fmtDate(iso: string): string {
  const [y, m, d] = parts(iso);
  return `${MONTHS[m - 1]} ${d}, ${y}`;
}
export function fmtShort(iso: string): string {
  const [y, m] = parts(iso);
  return `${MONTHS[m - 1]} ${String(y).slice(2)}`;
}
export function fmtLongToday(): string {
  const [y, m, d] = parts(today);
  const wd = WEEKDAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
  return `${wd}, ${MONTHS[m - 1]} ${d}, ${y}`;
}
export function daysBetween(fromIso: string, toIso: string): number {
  const [y1, m1, d1] = parts(fromIso);
  const [y2, m2, d2] = parts(toIso);
  return Math.round((Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / 86400000);
}
export function ageOf(born: string): string {
  const [by, bm, bd] = parts(born);
  const [ty, tm, td] = parts(today);
  let years = ty - by;
  let months = tm - bm;
  if (td < bd) months -= 1;
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  if (years === 0) return `${months} mo`;
  return months > 0 ? `${years} yr ${months} mo` : `${years} yr`;
}
export function usd(n: number): string {
  return `$${n.toFixed(2)}`;
}

export type VaccStatus = { kind: "overdue" | "soon" | "current"; days: number };
export function vaccStatus(due: string): VaccStatus {
  const days = daysBetween(today, due);
  if (days < 0) return { kind: "overdue", days: -days };
  if (days <= 60) return { kind: "soon", days };
  return { kind: "current", days };
}

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
```

