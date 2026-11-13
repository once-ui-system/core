```tsx app/layout.tsx
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/charts/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/spotlight/styles.css";

import type { Metadata } from "next";
import { ColorSchemeScript, MantineProvider, mantineHtmlProps } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { Notifications } from "@mantine/notifications";
import { AppFrame } from "@/components/AppFrame";
import { AppStateProvider } from "@/components/AppState";
import { theme } from "./theme";

export const metadata: Metadata = {
  title: "Pawpoint | Front desk, Hillside Veterinary Clinic",
  description: "Front-desk and records software for Hillside Veterinary Clinic",
};

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
            <AppStateProvider>
              <AppFrame>{children}</AppFrame>
            </AppStateProvider>
          </ModalsProvider>
        </MantineProvider>
      </body>
    </html>
  );
}
```

```tsx app/page.tsx
import { Dashboard } from "@/components/Dashboard";

export default function Page() {
  return <Dashboard />;
}
```

```tsx app/patients/[id]/page.tsx
import { notFound } from "next/navigation";
import { PatientView } from "@/components/PatientView";
import { getPatient, patients } from "@/lib/data";

export function generateStaticParams() {
  return patients.map((p) => ({ id: p.id }));
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!getPatient(id)) notFound();
  return <PatientView id={id} />;
}
```

```ts app/theme.ts
import { createTheme } from "@mantine/core";

// System font stack, identical in every arm (no network font fetch at build).
export const theme = createTheme({
  fontFamily: "ui-sans-serif, system-ui, sans-serif",
  headings: { fontFamily: "ui-sans-serif, system-ui, sans-serif", fontWeight: "700" },
  primaryColor: "teal",
  primaryShade: { light: 9, dark: 5 },
  colors: {
    // Slightly darker grey 6 so "dimmed" text keeps AA contrast.
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
  defaultRadius: "md",
  components: {
    Button: { defaultProps: { size: "md" } },
    Paper: { defaultProps: { withBorder: true } },
  },
});
```

```tsx components/AlertBadges.tsx
import { Badge, Group } from "@mantine/core";
import { IconAlertTriangleFilled } from "@tabler/icons-react";

/** Medical alerts: solid red, with an icon and the full text so they never rely on colour alone. */
export function AlertBadges({ alerts, size = "sm" }: { alerts: string[]; size?: "sm" | "md" | "lg" }) {
  if (alerts.length === 0) return null;
  return (
    <Group gap={6} role="list" aria-label="Medical alerts">
      {alerts.map((a) => (
        <Badge
          key={a}
          role="listitem"
          color="red.8"
          variant="filled"
          size={size}
          radius="sm"
          tt="none"
          leftSection={<IconAlertTriangleFilled size={size === "lg" ? 16 : 12} aria-hidden />}
          styles={{ label: { whiteSpace: "normal", fontWeight: 700 } }}
          h="auto"
          py={3}
        >
          {a}
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
import { Anchor, AppShell, Avatar, Box, Group, Text, UnstyledButton } from "@mantine/core";
import { Spotlight, type SpotlightActionData, spotlight } from "@mantine/spotlight";
import { IconPaw, IconSearch, IconAlertTriangleFilled } from "@tabler/icons-react";
import { CLINIC, CLINIC_LONG, USER, getOwner, patients } from "@/lib/data";

export function AppFrame({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const actions = useMemo<SpotlightActionData[]>(
    () =>
      patients.map((p) => {
        const owner = getOwner(p.owner);
        return {
          id: p.id,
          label: p.alerts.length ? `${p.name} (alert: ${p.alerts.join("; ")})` : p.name,
          description: `${p.species}, ${p.breed} · Owner ${owner?.name ?? ""} · ${owner?.phone ?? ""}`,
          keywords: [owner?.name ?? "", p.species, p.breed],
          leftSection: p.alerts.length ? (
            <IconAlertTriangleFilled size={22} color="var(--mantine-color-red-8)" aria-hidden />
          ) : (
            <IconPaw size={22} aria-hidden />
          ),
          onClick: () => router.push(`/patients/${p.id}`),
        };
      }),
    [router],
  );

  return (
    <AppShell header={{ height: 64 }} padding={0}>
      <Anchor
        href="#main"
        style={{ position: "absolute", left: -9999 }}
        onFocus={(e) => (e.currentTarget.style.left = "8px")}
        onBlur={(e) => (e.currentTarget.style.left = "-9999px")}
        c="white"
        bg="teal.9"
        p="xs"
        fz="sm"
        // visible only on keyboard focus
        styles={{ root: { zIndex: 1000, top: 8 } }}
      >
        Skip to content
      </Anchor>
      <AppShell.Header bg="teal.9" style={{ border: 0 }}>
        <Group h="100%" px={{ base: "sm", sm: "lg" }} justify="space-between" wrap="nowrap" gap="sm">
          <Anchor component={Link} href="/" c="white" underline="never">
            <Group gap={10} wrap="nowrap">
              <Box
                w={36}
                h={36}
                bg="white"
                style={{ borderRadius: 10, display: "grid", placeItems: "center", flexShrink: 0 }}
              >
                <IconPaw size={22} color="var(--mantine-color-teal-9)" aria-hidden />
              </Box>
              <Box>
                <Text fw={800} fz="lg" lh={1.1} c="white">
                  {CLINIC}
                </Text>
                <Text fz="xs" c="teal.1" lh={1.2} visibleFrom="sm">
                  {CLINIC_LONG}
                </Text>
              </Box>
            </Group>
          </Anchor>

          <Group gap="sm" wrap="nowrap" style={{ flex: 1, justifyContent: "flex-end" }}>
            <UnstyledButton
              onClick={spotlight.open}
              aria-keyshortcuts="Control+K"
              style={{
                background: "rgba(255,255,255,0.16)",
                border: "1px solid rgba(255,255,255,0.35)",
                borderRadius: 10,
                color: "white",
                height: 42,
                padding: "0 14px",
                flex: "1 1 auto",
                maxWidth: 380,
                minWidth: 0,
              }}
            >
              <Group gap={10} wrap="nowrap">
                <IconSearch size={18} aria-hidden />
                <Text fz="sm" c="white" truncate>
                  Search patient or owner
                </Text>
              </Group>
            </UnstyledButton>
            <Group gap="xs" wrap="nowrap" visibleFrom="md">
              <Avatar color="teal.1" variant="filled" radius="xl" size={36}>
                RL
              </Avatar>
              <Box>
                <Text fz="sm" fw={600} c="white" lh={1.2}>
                  {USER.name}
                </Text>
                <Text fz="xs" c="teal.1" lh={1.2}>
                  {USER.role}
                </Text>
              </Box>
            </Group>
          </Group>
        </Group>
      </AppShell.Header>

      <Spotlight
        actions={actions}
        shortcut={["mod + K", "/"]}
        nothingFound="No patient or owner found"
        highlightQuery
        limit={8}
        searchProps={{
          leftSection: <IconSearch size={20} aria-hidden />,
          placeholder: "Search by pet or owner name",
          "aria-label": "Search patients or owners",
        }}
      />

      <AppShell.Main id="main" bg="gray.0">
        {children}
      </AppShell.Main>
    </AppShell>
  );
}
```

```tsx components/AppState.tsx
"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  type Appointment,
  NOW_START,
  fromMinutes,
  findClash,
  initialAppointments,
} from "@/lib/data";

interface NewAppointment {
  patient: string;
  vet: string;
  start: string;
  minutes: number;
  reason: string;
}

interface AppState {
  appointments: Appointment[];
  /** Simulated clock, minutes since midnight. */
  now: number;
  checkIn: (id: string) => void;
  /** Returns the clashing appointment, or the created one. */
  book: (a: NewAppointment) => { ok: true; appointment: Appointment } | { ok: false; clash: Appointment };
}

const Ctx = createContext<AppState | null>(null);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const [now, setNow] = useState(NOW_START);

  useEffect(() => {
    const t = window.setInterval(() => setNow((n) => n + 1), 60000);
    return () => window.clearInterval(t);
  }, []);

  const checkIn = useCallback(
    (id: string) =>
      setAppointments((list) =>
        list.map((a) =>
          a.id === id && a.status === "booked" ? { ...a, status: "checked_in", checkedInAt: now } : a,
        ),
      ),
    [now],
  );

  const book = useCallback<AppState["book"]>(
    (input) => {
      const clash = findClash(appointments, input.vet, input.start, input.minutes);
      if (clash) return { ok: false, clash };
      const appointment: Appointment = {
        id: `a-${String(appointments.length + 1).padStart(2, "0")}`,
        status: "booked",
        ...input,
      };
      setAppointments((list) => [...list, appointment]);
      return { ok: true, appointment };
    },
    [appointments],
  );

  const value = useMemo(() => ({ appointments, now, checkIn, book }), [appointments, now, checkIn, book]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAppState() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAppState must be used inside AppStateProvider");
  return v;
}

export const clockLabel = (n: number) => fromMinutes(n);
```

```tsx components/BookingModal.tsx
"use client";

import { useMemo, useState } from "react";
import { Alert, Button, Group, Modal, Select, Stack, Text, TextInput } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconCalendarPlus, IconCheck, IconAlertCircle } from "@tabler/icons-react";
import { AlertBadges } from "@/components/AlertBadges";
import { useAppState } from "@/components/AppState";
import { findClash, fromMinutes, getOwner, getPatient, getVet, patients, vets } from "@/lib/data";

const times = Array.from({ length: 40 }, (_, i) => fromMinutes(8 * 60 + i * 15));
const durations = [
  { value: "15", label: "15 min" },
  { value: "20", label: "20 min" },
  { value: "30", label: "30 min" },
  { value: "45", label: "45 min" },
  { value: "60", label: "1 hour" },
  { value: "120", label: "2 hours" },
];

export function BookingModal({
  opened,
  onClose,
  defaultPatient,
}: {
  opened: boolean;
  onClose: () => void;
  defaultPatient?: string | null;
}) {
  const { appointments, book } = useAppState();
  const [patient, setPatient] = useState<string | null>(defaultPatient ?? null);
  const [vet, setVet] = useState<string | null>(null);
  const [start, setStart] = useState<string | null>(null);
  const [minutes, setMinutes] = useState<string>("20");
  const [reason, setReason] = useState("");
  const [touched, setTouched] = useState(false);

  const clash = useMemo(
    () => (vet && start ? findClash(appointments, vet, start, Number(minutes)) : undefined),
    [appointments, vet, start, minutes],
  );

  const timeData = useMemo(
    () =>
      times.map((t) => ({
        value: t,
        label: t,
        disabled: vet ? Boolean(findClash(appointments, vet, t, Number(minutes))) : false,
      })),
    [appointments, vet, minutes],
  );

  const selected = patient ? getPatient(patient) : undefined;
  const missing = {
    patient: !patient,
    vet: !vet,
    start: !start,
    reason: reason.trim().length === 0,
  };

  const reset = () => {
    setPatient(defaultPatient ?? null);
    setVet(null);
    setStart(null);
    setMinutes("20");
    setReason("");
    setTouched(false);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (missing.patient || missing.vet || missing.start || missing.reason || !patient || !vet || !start) return;
    const result = book({ patient, vet, start, minutes: Number(minutes), reason: reason.trim() });
    if (!result.ok) return;
    notifications.show({
      color: "teal",
      icon: <IconCheck size={18} />,
      title: "Appointment booked",
      message: `${getPatient(patient)?.name} with ${getVet(vet)?.name} at ${start}`,
    });
    reset();
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={() => {
        reset();
        onClose();
      }}
      title={
        <Group gap="xs">
          <IconCalendarPlus size={22} aria-hidden />
          <Text fw={700} fz="lg">
            Book an appointment
          </Text>
        </Group>
      }
      size="lg"
      fullScreen={false}
      centered
      trapFocus
    >
      <form onSubmit={submit} noValidate>
        <Stack gap="md">
          <Select
            label="Patient"
            placeholder="Search by pet or owner"
            searchable
            size="md"
            data={patients.map((p) => ({
              value: p.id,
              label: `${p.name} (${p.species}, ${getOwner(p.owner)?.name})`,
            }))}
            value={patient}
            onChange={setPatient}
            error={touched && missing.patient ? "Choose a patient" : undefined}
            nothingFoundMessage="No match"
            comboboxProps={{ withinPortal: true }}
          />
          {selected && selected.alerts.length > 0 && <AlertBadges alerts={selected.alerts} size="md" />}
          <Select
            label="Vet"
            placeholder="Choose a vet"
            size="md"
            data={vets.map((v) => ({ value: v.id, label: `${v.name} (${v.room})` }))}
            value={vet}
            onChange={setVet}
            error={touched && missing.vet ? "Choose a vet" : undefined}
          />
          <Group grow align="flex-start">
            <Select
              label="Time"
              placeholder="Pick a time"
              size="md"
              data={timeData}
              value={start}
              onChange={setStart}
              maxDropdownHeight={240}
              error={touched && missing.start ? "Pick a time" : undefined}
              description={vet ? "Taken times are greyed out" : undefined}
            />
            <Select
              label="Length"
              size="md"
              data={durations}
              value={minutes}
              onChange={(v) => v && setMinutes(v)}
              allowDeselect={false}
            />
          </Group>
          <TextInput
            label="Reason for visit"
            placeholder="e.g. Booster vaccination"
            size="md"
            value={reason}
            onChange={(e) => setReason(e.currentTarget.value)}
            error={touched && missing.reason ? "Add a reason" : undefined}
          />
          {clash && (
            <Alert color="red" variant="light" icon={<IconAlertCircle size={20} />} title="That time is taken" role="alert">
              {getVet(clash.vet)?.name} has {getPatient(clash.patient)?.name} from {clash.start} to{" "}
              {fromMinutes(
                Number(clash.start.slice(0, 2)) * 60 + Number(clash.start.slice(3)) + clash.minutes,
              )}
              . Choose another time or vet.
            </Alert>
          )}
          <Group justify="flex-end" mt="xs">
            <Button
              variant="default"
              onClick={() => {
                reset();
                onClose();
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={Boolean(clash)} leftSection={<IconCalendarPlus size={18} />}>
              Book appointment
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
```

```tsx components/Dashboard.tsx
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
```

```tsx components/PatientView.tsx
"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Anchor,
  Badge,
  Box,
  Button,
  Container,
  Grid,
  Group,
  List,
  Paper,
  Stack,
  Table,
  Text,
  Title,
} from "@mantine/core";
import { LineChart } from "@mantine/charts";
import {
  IconAlertTriangleFilled,
  IconArrowLeft,
  IconCalendarPlus,
  IconCircleCheck,
  IconPhone,
  IconPill,
  IconVaccine,
} from "@tabler/icons-react";
import { useAppState } from "@/components/AppState";
import { BookingModal } from "@/components/BookingModal";
import {
  STATUS_LABEL,
  TODAY,
  ageLabel,
  daysBetween,
  formatDate,
  getOwner,
  getPatient,
  getVet,
  records,
} from "@/lib/data";

function Section({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <Paper p="md" radius="md" component="section">
      <Group gap="xs" mb="sm">
        {icon}
        <Title order={2} fz="xl">
          {title}
        </Title>
      </Group>
      {children}
    </Paper>
  );
}

export function PatientView({ id }: { id: string }) {
  const patient = getPatient(id);
  const { appointments } = useAppState();
  const [booking, setBooking] = useState(false);
  if (!patient) return null;
  const owner = getOwner(patient.owner);
  const record = records[id];
  const todays = appointments
    .filter((a) => a.patient === id && a.status !== "cancelled")
    .sort((a, b) => a.start.localeCompare(b.start));

  const weights = record?.weights_kg ?? [];
  const first = weights[0];
  const last = weights[weights.length - 1];
  const chartData = weights.map((w) => ({ date: formatDate(w.date).replace(/, \d{4}$/, " ’" + w.date.slice(2, 4)), kg: w.kg }));
  const overdueCount = record?.vaccinations.filter((v) => v.due < TODAY).length ?? 0;

  return (
    <Container size="xl" py={{ base: "md", sm: "xl" }} px={{ base: "sm", sm: "lg" }}>
      <Anchor component={Link} href="/" fz="sm" fw={600} mb="sm" display="inline-block">
        <Group gap={4} wrap="nowrap">
          <IconArrowLeft size={16} aria-hidden /> Back to today&apos;s schedule
        </Group>
      </Anchor>

      <Paper p={{ base: "md", sm: "lg" }} radius="md" mb="md" component="header">
        <Group justify="space-between" align="flex-start" gap="md">
          <Box>
            <Title order={1} fz={{ base: 30, sm: 38 }} lh={1.1}>
              {patient.name}
            </Title>
            <Text fz="lg" c="dimmed">
              {patient.breed} · {patient.species}
            </Text>
          </Box>
          <Button size="lg" leftSection={<IconCalendarPlus size={22} aria-hidden />} onClick={() => setBooking(true)}>
            Book follow-up
          </Button>
        </Group>

        <Grid mt="md" gap="md">
          <Grid.Col span={{ base: 6, sm: 3 }}>
            <Fact label="Age" value={`${ageLabel(patient.born)} (born ${formatDate(patient.born)})`} />
          </Grid.Col>
          <Grid.Col span={{ base: 6, sm: 3 }}>
            <Fact label="Sex" value={patient.sex} />
          </Grid.Col>
          <Grid.Col span={{ base: 6, sm: 3 }}>
            <Fact label="Owner" value={owner?.name ?? ""} />
          </Grid.Col>
          <Grid.Col span={{ base: 6, sm: 3 }}>
            <Fact
              label="Phone"
              value={
                owner ? (
                  <Anchor href={`tel:${owner.phone.replace(/\s/g, "")}`} fw={600} c="dark.9">
                    <Group gap={4} wrap="nowrap">
                      <IconPhone size={16} aria-hidden />
                      {owner.phone}
                    </Group>
                  </Anchor>
                ) : null
              }
            />
          </Grid.Col>
        </Grid>
      </Paper>

      {patient.alerts.length > 0 && (
        <Paper
          role="region"
          aria-label="Medical alerts"
          p="md"
          radius="md"
          mb="md"
          bg="red.8"
          c="white"
          style={{ borderColor: "var(--mantine-color-red-9)", borderWidth: 2 }}
        >
          <Group gap="xs" mb={8}>
            <IconAlertTriangleFilled size={24} aria-hidden />
            <Text fw={800} fz="lg" tt="uppercase" style={{ letterSpacing: 0.6 }}>
              Medical alerts
            </Text>
          </Group>
          <Stack gap={6} component="ul" m={0} p={0} style={{ listStyle: "none" }}>
            {patient.alerts.map((a) => (
              <Text component="li" key={a} fw={700} fz={{ base: "lg", sm: 22 }} lh={1.25}>
                {a}
              </Text>
            ))}
          </Stack>
        </Paper>
      )}

      <Grid gap="md">
        <Grid.Col span={{ base: 12, lg: 7 }}>
          <Stack gap="md">
            {record ? (
              <>
                <Section title="Weight trend">
                  <Text fz="sm" c="dimmed" mb="sm">
                    {first && last && (
                      <>
                        {last.kg} kg on {formatDate(last.date)}, down {(first.kg - last.kg).toFixed(1)} kg (
                        {(((first.kg - last.kg) / first.kg) * 100).toFixed(0)}%) since {formatDate(first.date)}.
                      </>
                    )}
                  </Text>
                  <div role="img" aria-label={`Weight in kilograms over ${weights.length} visits: ${weights.map((w) => `${w.kg} on ${w.date}`).join(", ")}`}>
                    <LineChart
                      h={240}
                      data={chartData}
                      dataKey="date"
                      series={[{ name: "kg", label: "Weight (kg)", color: "teal.7" }]}
                      curveType="linear"
                      yAxisProps={{ domain: [27, 33] }}
                      unit=" kg"
                      dotProps={{ r: 4 }}
                      tickLine="xy"
                      gridAxis="xy"
                    />
                  </div>
                </Section>

                <Section title="Visit history">
                  <Stack gap="sm" component="ol" m={0} p={0} style={{ listStyle: "none" }}>
                    {record.visits.map((v) => (
                      <Paper component="li" key={v.date} p="sm" radius="md" bg="gray.0">
                        <Group justify="space-between" gap="xs" mb={2}>
                          <Text fw={700}>
                            {formatDate(v.date)} · {v.reason}
                          </Text>
                          <Text fz="sm" c="dimmed">
                            {getVet(v.vet)?.name} · ${v.invoice_usd.toFixed(2)}
                          </Text>
                        </Group>
                        <Text fz="sm">{v.notes}</Text>
                      </Paper>
                    ))}
                  </Stack>
                </Section>
              </>
            ) : (
              <Section title="Medical record">
                <Text c="dimmed">No weights, vaccinations or visit notes are on file for {patient.name} yet.</Text>
              </Section>
            )}
          </Stack>
        </Grid.Col>

        <Grid.Col span={{ base: 12, lg: 5 }}>
          <Stack gap="md">
            <Section title="Today" icon={<IconCalendarPlus size={22} aria-hidden />}>
              {todays.length === 0 ? (
                <Text c="dimmed" fz="sm">
                  No appointments today.
                </Text>
              ) : (
                <Stack gap="xs" component="ul" m={0} p={0} style={{ listStyle: "none" }}>
                  {todays.map((a) => (
                    <Group component="li" key={a.id} justify="space-between" wrap="nowrap" gap="xs">
                      <Text fz="sm">
                        <b>{a.start}</b> · {a.reason} · {getVet(a.vet)?.name}
                      </Text>
                      <Badge variant="light" color={a.status === "checked_in" ? "yellow" : "gray"} style={{ flexShrink: 0 }}>
                        {STATUS_LABEL[a.status]}
                      </Badge>
                    </Group>
                  ))}
                </Stack>
              )}
            </Section>

            {record && (
              <>
                <Section title="Vaccinations" icon={<IconVaccine size={22} aria-hidden />}>
                  {overdueCount > 0 && (
                    <Text fz="sm" fw={700} c="red.8" mb="xs">
                      {overdueCount} overdue as of {formatDate(TODAY)}
                    </Text>
                  )}
                  <Table.ScrollContainer minWidth={320}>
                    <Table verticalSpacing="xs">
                      <Table.Thead>
                        <Table.Tr>
                          <Table.Th>Vaccine</Table.Th>
                          <Table.Th>Given</Table.Th>
                          <Table.Th>Due</Table.Th>
                        </Table.Tr>
                      </Table.Thead>
                      <Table.Tbody>
                        {record.vaccinations.map((v) => {
                          const late = daysBetween(v.due, TODAY);
                          const overdue = late > 0;
                          return (
                            <Table.Tr key={v.name} bg={overdue ? "red.0" : undefined}>
                              <Table.Td fw={600}>{v.name}</Table.Td>
                              <Table.Td>{formatDate(v.given)}</Table.Td>
                              <Table.Td>
                                <Text fz="sm">{formatDate(v.due)}</Text>
                                {overdue ? (
                                  <Badge color="red.8" variant="filled" size="sm" leftSection={<IconAlertTriangleFilled size={11} aria-hidden />}>
                                    Overdue {late} days
                                  </Badge>
                                ) : (
                                  <Badge color="teal" variant="light" size="sm" leftSection={<IconCircleCheck size={11} aria-hidden />}>
                                    Up to date
                                  </Badge>
                                )}
                              </Table.Td>
                            </Table.Tr>
                          );
                        })}
                      </Table.Tbody>
                    </Table>
                  </Table.ScrollContainer>
                </Section>

                <Section title="Current medications" icon={<IconPill size={22} aria-hidden />}>
                  <List spacing="sm" listStyleType="none" styles={{ itemWrapper: { width: "100%" } }}>
                    {record.medications.map((m) => (
                      <List.Item key={m.name}>
                        <Text fw={700}>{m.name}</Text>
                        <Text fz="sm">
                          {m.dose} · since {formatDate(m.since)}
                        </Text>
                      </List.Item>
                    ))}
                  </List>
                </Section>
              </>
            )}
          </Stack>
        </Grid.Col>
      </Grid>

      <BookingModal opened={booking} onClose={() => setBooking(false)} defaultPatient={id} />
    </Container>
  );
}

function Fact({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Box>
      <Text fz="xs" c="dimmed" fw={700} tt="uppercase" style={{ letterSpacing: 0.5 }}>
        {label}
      </Text>
      <Box fw={600}>{value}</Box>
    </Box>
  );
}
```

```ts lib/data.ts
export type Status = "booked" | "checked_in" | "in_exam" | "done" | "cancelled";

export interface Vet {
  id: string;
  name: string;
  room: string;
}
export interface Owner {
  id: string;
  name: string;
  phone: string;
}
export interface Patient {
  id: string;
  name: string;
  species: string;
  breed: string;
  born: string;
  sex: string;
  owner: string;
  alerts: string[];
}
export interface Appointment {
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
}
export interface Vaccination {
  name: string;
  given: string;
  due: string;
}
export interface Medication {
  name: string;
  dose: string;
  since: string;
}
export interface Visit {
  date: string;
  vet: string;
  reason: string;
  notes: string;
  invoice_usd: number;
}
export interface PatientRecord {
  weights_kg: { date: string; kg: number }[];
  vaccinations: Vaccination[];
  medications: Medication[];
  visits: Visit[];
}

export const CLINIC = "Pawpoint";
export const CLINIC_LONG = "Hillside Veterinary Clinic";
export const TODAY = "2026-11-12";
/** Simulated clock at the counter, minutes since midnight (09:50). */
export const NOW_START = 9 * 60 + 50;

export const USER = { name: "Rosa Lindqvist", role: "Receptionist" };

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
  { id: "a-05", patient: "p-107", vet: "v-2", start: "09:15", minutes: 20, reason: "Glucose curve", status: "checked_in", checkedInAt: 9 * 60 + 12 },
  { id: "a-06", patient: "p-105", vet: "v-1", start: "09:45", minutes: 20, reason: "Beak and nail trim", status: "checked_in", checkedInAt: 9 * 60 + 41 },
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
      { date: "2026-11-12", vet: "v-2", reason: "Kidney panel recheck", notes: "Creatinine 2.1 mg/dL (was 2.0). Weight down 0.6 kg. Continue benazepril, recheck in 3 months.", invoice_usd: 186.0 },
      { date: "2026-06-17", vet: "v-2", reason: "Kidney panel recheck", notes: "Stable. Appetite good. Owner reports more drinking in hot weather.", invoice_usd: 172.5 },
      { date: "2026-02-11", vet: "v-1", reason: "Coughing", notes: "Mild kennel cough. Supportive care; no antibiotics given (penicillin allergy).", invoice_usd: 94.0 },
      { date: "2025-11-03", vet: "v-2", reason: "Senior wellness exam", notes: "Grade 2 dental tartar. Dental cleaning recommended.", invoice_usd: 148.0 },
    ],
  },
};

export const getPatient = (id: string) => patients.find((p) => p.id === id);
export const getOwner = (id: string) => owners.find((o) => o.id === id);
export const getVet = (id: string) => vets.find((v) => v.id === id);

export const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};
export const fromMinutes = (n: number) =>
  `${String(Math.floor(n / 60)).padStart(2, "0")}:${String(n % 60).padStart(2, "0")}`;

export const STATUS_LABEL: Record<Status, string> = {
  booked: "Booked",
  checked_in: "Checked in",
  in_exam: "In exam",
  done: "Done",
  cancelled: "Cancelled",
};

/** Appointment that overlaps the proposed slot for the same vet, if any. */
export function findClash(
  list: Appointment[],
  vet: string,
  start: string,
  minutes: number,
): Appointment | undefined {
  const s = toMinutes(start);
  const e = s + minutes;
  return list.find(
    (a) =>
      a.vet === vet &&
      a.status !== "cancelled" &&
      s < toMinutes(a.start) + a.minutes &&
      toMinutes(a.start) < e,
  );
}

const DAY = 86400000;
export const daysBetween = (from: string, to: string) =>
  Math.round((Date.parse(to) - Date.parse(from)) / DAY);

export function ageLabel(born: string) {
  const [by, bm, bd] = born.split("-").map(Number);
  const [ty, tm, td] = TODAY.split("-").map(Number);
  let months = (ty - by) * 12 + (tm - bm);
  if (td < bd) months -= 1;
  const y = Math.floor(months / 12);
  const m = months % 12;
  if (y === 0) return `${m} mo`;
  return m === 0 ? `${y} yr` : `${y} yr ${m} mo`;
}

export function formatDate(iso: string) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}
```

