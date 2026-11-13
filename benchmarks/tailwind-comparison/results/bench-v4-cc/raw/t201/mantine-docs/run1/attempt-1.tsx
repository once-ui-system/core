```ts app/theme.ts
import { createTheme } from "@mantine/core";

// System font stack, identical in every arm (no network font fetch at build).
export const theme = createTheme({
  fontFamily: "ui-sans-serif, system-ui, sans-serif",
  headings: { fontFamily: "ui-sans-serif, system-ui, sans-serif", fontWeight: "700" },
  primaryColor: "teal",
  primaryShade: { light: 8, dark: 8 },
  defaultRadius: "md",
});
```

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
import { theme } from "./theme";

export const metadata: Metadata = {
  title: "Pawpoint",
  description: "Front-desk and records software for Hillside Veterinary Clinic",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript />
      </head>
      <body>
        <MantineProvider theme={theme}>
          <ModalsProvider>
            <Notifications />
            {children}
          </ModalsProvider>
        </MantineProvider>
      </body>
    </html>
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
  /** HH:MM at which the patient was checked in at the counter */
  checkedInAt?: string;
}

export interface Weight {
  date: string;
  kg: number;
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

export interface PatientRecordData {
  weights_kg: Weight[];
  vaccinations: Vaccination[];
  medications: Medication[];
  visits: Visit[];
}

export const CLINIC_NAME = "Hillside Veterinary Clinic";
export const TODAY = "2026-11-12";
/** The clock at the counter when the page opens (the app then moves it forward minute by minute). */
export const NOW_START = "09:50";
export const OPENING = "08:00";
export const CLOSING = "18:00";

export const currentUser = { name: "Rosa Lindqvist", role: "Receptionist" };

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
  { id: "a-05", patient: "p-107", vet: "v-2", start: "09:15", minutes: 20, reason: "Glucose curve", status: "checked_in", checkedInAt: "09:30" },
  { id: "a-06", patient: "p-105", vet: "v-1", start: "09:45", minutes: 20, reason: "Beak and nail trim", status: "checked_in", checkedInAt: "09:41" },
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

export const statusMeta: Record<Status, { label: string; color: string }> = {
  booked: { label: "Booked", color: "gray" },
  checked_in: { label: "Checked in", color: "orange" },
  in_exam: { label: "In exam", color: "blue" },
  done: { label: "Done", color: "green" },
  cancelled: { label: "Cancelled", color: "gray" },
};

export function getPatient(id: string): Patient | undefined {
  return patients.find((p) => p.id === id);
}

export function getOwner(id: string): Owner | undefined {
  return owners.find((o) => o.id === id);
}

export function getVet(id: string): Vet | undefined {
  return vets.find((v) => v.id === id);
}

export function toMin(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

export function fromMin(total: number): string {
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function fmt12(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${String(m).padStart(2, "0")} ${suffix}`;
}

export function endOf(a: { start: string; minutes: number }): string {
  return fromMin(toMin(a.start) + a.minutes);
}

function utc(iso: string): Date {
  return new Date(`${iso}T00:00:00Z`);
}

const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTHS_LONG = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// Hand-rolled formatting so server and browser always produce identical text.
export function fmtDate(iso: string): string {
  const d = utc(iso);
  return `${MONTHS_SHORT[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}

export function fmtDateLong(iso: string): string {
  const d = utc(iso);
  return `${WEEKDAYS[d.getUTCDay()]}, ${MONTHS_LONG[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}

export function fmtMonthYear(iso: string): string {
  const d = utc(iso);
  return `${MONTHS_SHORT[d.getUTCMonth()]} '${String(d.getUTCFullYear()).slice(2)}`;
}

export function fmtUsd(n: number): string {
  return `$${n.toFixed(2)}`;
}

/** Whole days from `from` to `to` (negative when `to` is earlier). */
export function daysBetween(from: string, to: string): number {
  return Math.round((utc(to).getTime() - utc(from).getTime()) / 86_400_000);
}

export function ageText(born: string, today: string = TODAY): string {
  const b = utc(born);
  const t = utc(today);
  let months = (t.getUTCFullYear() - b.getUTCFullYear()) * 12 + (t.getUTCMonth() - b.getUTCMonth());
  if (t.getUTCDate() < b.getUTCDate()) months -= 1;
  const years = Math.floor(months / 12);
  const rest = months % 12;
  const y = years > 0 ? `${years} ${years === 1 ? "year" : "years"}` : "";
  const m = rest > 0 ? `${rest} ${rest === 1 ? "month" : "months"}` : "";
  return [y, m].filter(Boolean).join(" ") || "Under a month";
}

/** The booking (not cancelled) that overlaps the proposed slot for that vet, if any. */
export function findClash(
  appointments: Appointment[],
  vetId: string,
  start: string,
  minutes: number,
): Appointment | undefined {
  const s = toMin(start);
  const e = s + minutes;
  return appointments.find(
    (a) =>
      a.vet === vetId &&
      a.status !== "cancelled" &&
      s < toMin(a.start) + a.minutes &&
      e > toMin(a.start),
  );
}
```

```tsx components/AlertFlags.tsx
import { Box, Group, VisuallyHidden } from "@mantine/core";
import { IconAlertTriangleFilled } from "@tabler/icons-react";

const iconSize = { xs: 12, sm: 14, md: 18 } as const;

/** Medical alerts as solid red flags. Used everywhere a patient appears. */
export function AlertFlags({
  alerts,
  size = "xs",
}: {
  alerts: string[];
  size?: "xs" | "sm" | "md";
}) {
  if (alerts.length === 0) return null;
  return (
    <Group gap={4} role="list" aria-label="Medical alerts">
      {alerts.map((alert) => (
        <Box
          key={alert}
          role="listitem"
          bg="red.9"
          c="white"
          fz={size}
          fw={700}
          px={size === "md" ? 12 : 8}
          py={size === "md" ? 6 : 2}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            borderRadius: 6,
            lineHeight: 1.3,
          }}
        >
          <IconAlertTriangleFilled size={iconSize[size]} aria-hidden style={{ flexShrink: 0 }} />
          <VisuallyHidden>Medical alert: </VisuallyHidden>
          {alert}
        </Box>
      ))}
    </Group>
  );
}
```

```tsx components/AppFrame.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Anchor,
  AppShell,
  Avatar,
  Box,
  Container,
  Group,
  Popover,
  Stack,
  Text,
  TextInput,
  UnstyledButton,
} from "@mantine/core";
import { IconPaw, IconSearch } from "@tabler/icons-react";
import { CLINIC_NAME, currentUser, getOwner, patients } from "@/lib/data";
import { AlertFlags } from "./AlertFlags";

function PatientSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const q = query.trim().toLowerCase();
  const results =
    q.length === 0
      ? []
      : patients
          .filter((p) => {
            const owner = getOwner(p.owner);
            return p.name.toLowerCase().includes(q) || (owner?.name.toLowerCase().includes(q) ?? false);
          })
          .slice(0, 6);

  const done = () => {
    setQuery("");
    setOpen(false);
  };

  return (
    <Popover
      opened={open && q.length > 0}
      onChange={setOpen}
      width="target"
      position="bottom-start"
      shadow="md"
      withinPortal={false}
      trapFocus={false}
    >
      <Popover.Target>
        <TextInput
          aria-label="Search patients or owners"
          placeholder="Search patient or owner"
          leftSection={<IconSearch size={16} aria-hidden />}
          value={query}
          size="md"
          onChange={(e) => {
            setQuery(e.currentTarget.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && results.length > 0) {
              e.preventDefault();
              router.push(`/patients/${results[0].id}`);
              done();
            }
          }}
        />
      </Popover.Target>
      <Popover.Dropdown p={6}>
        {results.length === 0 ? (
          <Text size="sm" c="dimmed" p="xs">
            No patient or owner matches &ldquo;{query.trim()}&rdquo;.
          </Text>
        ) : (
          <Stack gap={2} role="list" aria-label="Search results">
            {results.map((p) => {
              const owner = getOwner(p.owner);
              return (
                <UnstyledButton
                  key={p.id}
                  component={Link}
                  href={`/patients/${p.id}`}
                  role="listitem"
                  onClick={done}
                  p="xs"
                  style={{ borderRadius: 8 }}
                >
                  <Box>
                    <Text component="div" fw={700} size="sm">
                      {p.name}{" "}
                      <Text span c="dimmed" fw={400}>
                        {p.species}, {p.breed}
                      </Text>
                    </Text>
                    <Text component="div" size="xs" c="dimmed">
                      Owner: {owner?.name}
                    </Text>
                  </Box>
                  {p.alerts.length > 0 && (
                    <Box mt={4}>
                      <AlertFlags alerts={p.alerts} />
                    </Box>
                  )}
                </UnstyledButton>
              );
            })}
          </Stack>
        )}
      </Popover.Dropdown>
    </Popover>
  );
}

export function AppFrame({ children }: { children: React.ReactNode }) {
  return (
    <AppShell header={{ height: 68 }} padding={{ base: "sm", sm: "md" }}>
      <AppShell.Header>
        <Group h="100%" px="md" gap="md" wrap="nowrap">
          <Anchor
            component={Link}
            href="/"
            underline="never"
            c="inherit"
            aria-label="Pawpoint, today's schedule"
          >
            <Group gap="xs" wrap="nowrap">
              <Box
                bg="teal.8"
                c="white"
                w={38}
                h={38}
                style={{ borderRadius: 10, display: "grid", placeItems: "center", flexShrink: 0 }}
              >
                <IconPaw size={22} aria-hidden />
              </Box>
              <Box visibleFrom="sm">
                <Text component="div" fw={800} size="lg" lh={1.1}>
                  Pawpoint
                </Text>
                <Text component="div" size="xs" c="dimmed" lh={1.2}>
                  {CLINIC_NAME}
                </Text>
              </Box>
            </Group>
          </Anchor>
          <Box style={{ flex: 1, maxWidth: 520 }}>
            <PatientSearch />
          </Box>
          <Group gap="xs" ml="auto" wrap="nowrap">
            <Box visibleFrom="md" ta="right">
              <Text component="div" size="sm" fw={600} lh={1.2}>
                {currentUser.name}
              </Text>
              <Text component="div" size="xs" c="dimmed" lh={1.2}>
                {currentUser.role}
              </Text>
            </Box>
            <Avatar name={currentUser.name} color="initials" aria-label={`Signed in as ${currentUser.name}`} />
          </Group>
        </Group>
      </AppShell.Header>
      <AppShell.Main
        style={{ background: "light-dark(var(--mantine-color-gray-0), var(--mantine-color-dark-8))" }}
      >
        <Container size="xl" p={0}>
          {children}
        </Container>
      </AppShell.Main>
    </AppShell>
  );
}
```

```tsx components/BookingModal.tsx
"use client";

import { Alert, Button, Group, Modal, Select, SimpleGrid, Stack, Switch, Text, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useMediaQuery } from "@mantine/hooks";
import { IconAlertTriangleFilled, IconCalendarPlus } from "@tabler/icons-react";
import {
  type Appointment,
  CLOSING,
  OPENING,
  findClash,
  fmt12,
  fromMin,
  endOf,
  getOwner,
  getPatient,
  getVet,
  patients,
  toMin,
  vets,
} from "@/lib/data";
import { AlertFlags } from "./AlertFlags";

interface FormValues {
  patient: string;
  vet: string;
  start: string;
  minutes: string;
  reason: string;
  urgent: boolean;
}

const initialValues: FormValues = { patient: "", vet: "", start: "", minutes: "20", reason: "", urgent: false };

const durations = [15, 20, 30, 45, 60, 90, 120].map((m) => ({ value: String(m), label: `${m} min` }));

const patientOptions = patients.map((p) => ({
  value: p.id,
  label: `${p.name} (${p.species}), ${getOwner(p.owner)?.name ?? ""}`,
}));

const vetOptions = vets.map((v) => ({ value: v.id, label: `${v.name}, ${v.room}` }));

function clashMessage(c: Appointment): string {
  const vet = getVet(c.vet);
  const patient = getPatient(c.patient);
  return `${vet?.name ?? "This vet"} already has ${patient?.name ?? "a patient"} (${c.reason}) from ${fmt12(c.start)} to ${fmt12(endOf(c))}.`;
}

export function BookingModal({
  opened,
  onClose,
  appointments,
  nowMin,
  onBook,
}: {
  opened: boolean;
  onClose: () => void;
  appointments: Appointment[];
  nowMin: number;
  onBook: (a: Omit<Appointment, "id">) => void;
}) {
  const isPhone = useMediaQuery("(max-width: 48em)");

  const form = useForm<FormValues>({
    mode: "controlled",
    initialValues,
    validate: {
      patient: (v) => (v ? null : "Choose a patient"),
      vet: (v) => (v ? null : "Choose a vet"),
      start: (v, values) => {
        if (!v) return "Choose a time";
        if (!values.vet) return null;
        const clash = findClash(appointments, values.vet, v, Number(values.minutes));
        return clash ? clashMessage(clash) : null;
      },
      reason: (v) => (v.trim() ? null : "Add a reason for the visit"),
    },
  });

  const minutes = Number(form.values.minutes);
  const patient = form.values.patient ? getPatient(form.values.patient) : undefined;

  const slots: { value: string; label: string; disabled: boolean }[] = [];
  const openMin = toMin(OPENING);
  const closeMin = toMin(CLOSING);
  for (let m = openMin; m + 15 <= closeMin; m += 15) {
    const value = fromMin(m);
    const clash = form.values.vet ? findClash(appointments, form.values.vet, value, minutes) : undefined;
    const passed = m < nowMin;
    const tooLate = m + minutes > closeMin;
    const note = clash ? " (taken)" : passed ? " (passed)" : tooLate ? " (after closing)" : "";
    slots.push({ value, label: `${fmt12(value)}${note}`, disabled: Boolean(clash) || passed || tooLate });
  }

  // When the vet or the length changes, drop a chosen time that no longer fits.
  const changeVetOrLength = (field: "vet" | "minutes", value: string | null) => {
    const next = { ...form.values, [field]: value ?? "" };
    form.setFieldValue(field, value ?? "");
    if (next.start) {
      const s = toMin(next.start);
      const clash = next.vet ? findClash(appointments, next.vet, next.start, Number(next.minutes)) : undefined;
      if (clash || s + Number(next.minutes) > closeMin) form.setFieldValue("start", "");
    }
  };

  const close = () => {
    form.reset();
    onClose();
  };

  const submit = form.onSubmit((values) => {
    onBook({
      patient: values.patient,
      vet: values.vet,
      start: values.start,
      minutes: Number(values.minutes),
      reason: values.reason.trim(),
      status: "booked",
      urgent: values.urgent || undefined,
    });
    form.reset();
  });

  return (
    <Modal
      opened={opened}
      onClose={close}
      title={<Text fw={700} size="lg">Book an appointment</Text>}
      size="lg"
      centered
      fullScreen={Boolean(isPhone)}
    >
      <form onSubmit={submit} noValidate>
        <Stack gap="md">
          <Select
            label="Patient"
            description="Type a pet's or an owner's name"
            placeholder="Search patients"
            searchable
            withAsterisk
            nothingFoundMessage="No patient found"
            data={patientOptions}
            size="md"
            renderOption={({ option }) => {
              const p = getPatient(option.value);
              if (!p) return option.label;
              return (
                <Stack gap={3}>
                  <Text component="div" size="sm" fw={700}>
                    {p.name}{" "}
                    <Text span size="sm" c="dimmed" fw={400}>
                      {p.species}, owner {getOwner(p.owner)?.name}
                    </Text>
                  </Text>
                  <AlertFlags alerts={p.alerts} />
                </Stack>
              );
            }}
            {...form.getInputProps("patient")}
          />

          {patient && patient.alerts.length > 0 && (
            <Alert
              variant="filled"
              color="red.9"
              icon={<IconAlertTriangleFilled size={20} aria-hidden />}
              title={`Medical alerts for ${patient.name}`}
            >
              <Stack gap={2}>
                {patient.alerts.map((a) => (
                  <Text key={a} size="sm" fw={600} c="white">
                    {a}
                  </Text>
                ))}
              </Stack>
            </Alert>
          )}

          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            <Select
              label="Vet"
              placeholder="Choose a vet"
              withAsterisk
              allowDeselect={false}
              data={vetOptions}
              size="md"
              value={form.values.vet || null}
              onChange={(v) => changeVetOrLength("vet", v)}
              error={form.errors.vet}
            />
            <Select
              label="Length"
              allowDeselect={false}
              data={durations}
              size="md"
              value={form.values.minutes}
              onChange={(v) => changeVetOrLength("minutes", v)}
            />
          </SimpleGrid>

          <Select
            label="Time"
            description={
              form.values.vet
                ? "Times marked taken, passed or after closing cannot be chosen"
                : "Choose a vet first to see their free times"
            }
            placeholder="Choose a time"
            withAsterisk
            allowDeselect={false}
            data={slots}
            size="md"
            maxDropdownHeight={280}
            {...form.getInputProps("start")}
          />

          <TextInput
            label="Reason for the visit"
            placeholder="For example: Ear infection follow-up"
            withAsterisk
            size="md"
            {...form.getInputProps("reason")}
          />

          <Switch
            label="Urgent visit"
            description="Shows the booking in red on the schedule"
            size="md"
            {...form.getInputProps("urgent", { type: "checkbox" })}
          />

          <Group justify="flex-end" mt="xs">
            <Button variant="default" size="md" onClick={close} type="button">
              Cancel
            </Button>
            <Button size="md" type="submit" leftSection={<IconCalendarPlus size={18} aria-hidden />}>
              Book appointment
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
```

```tsx components/Schedule.tsx
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
        <Text component="div" size="sm" c="dimmed">
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
                          <Text component="div" size="sm" fw={700}>
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
                            <Text component="div" fw={700}>{fmt12(a.start)}</Text>
                            <Text component="div" size="xs" c="dimmed">
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
                            <Text component="div" size="sm" fw={600}>
                              {vet?.name}
                            </Text>
                            <Text component="div" size="xs" c="dimmed">
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
```

```tsx components/PatientRecord.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LineChart } from "@mantine/charts";
import {
  Alert,
  Anchor,
  Avatar,
  Badge,
  Box,
  Grid,
  Group,
  Paper,
  SimpleGrid,
  Stack,
  Table,
  Text,
  Title,
} from "@mantine/core";
import {
  IconAlertTriangleFilled,
  IconArrowLeft,
  IconPaw,
  IconPhone,
  IconPill,
  IconStethoscope,
  IconVaccine,
} from "@tabler/icons-react";
import {
  TODAY,
  ageText,
  daysBetween,
  endOf,
  fmt12,
  fmtDate,
  fmtMonthYear,
  fmtUsd,
  getOwner,
  getPatient,
  getVet,
  initialAppointments,
  records,
  statusMeta,
} from "@/lib/data";
import { AlertFlags } from "./AlertFlags";

function Section({
  title,
  icon,
  children,
  id,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  id: string;
}) {
  return (
    <Paper withBorder p={{ base: "sm", sm: "md" }} radius="md" component="section" aria-labelledby={id}>
      <Group gap="xs" mb="sm">
        {icon}
        <Title order={2} size="h4" id={id}>
          {title}
        </Title>
      </Group>
      {children}
    </Paper>
  );
}

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Box>
      <Text component="div" size="xs" c="dimmed" fw={600} tt="uppercase" style={{ letterSpacing: 0.4 }}>
        {label}
      </Text>
      <Text component="div" fw={600}>
        {children}
      </Text>
    </Box>
  );
}

export function PatientRecord({ patientId }: { patientId: string }) {
  // The chart measures its container, so it is drawn only in the browser.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const patient = getPatient(patientId);
  if (!patient) return null;
  const owner = getOwner(patient.owner);
  const record = records[patient.id];
  const todays = initialAppointments.filter((a) => a.patient === patient.id && a.status !== "cancelled");

  const weights = record?.weights_kg ?? [];
  const chartData = weights.map((w) => ({ date: fmtMonthYear(w.date), kg: w.kg }));
  const first = weights[0];
  const last = weights[weights.length - 1];
  const previous = weights[weights.length - 2];
  const totalChange = first && last ? last.kg - first.kg : 0;
  const lastChange = previous && last ? last.kg - previous.kg : 0;
  const sign = (n: number) => (n > 0 ? "+" : n < 0 ? "−" : "");

  const vaccinations = (record?.vaccinations ?? []).map((v) => {
    const days = daysBetween(TODAY, v.due);
    const state = days < 0 ? "overdue" : days <= 60 ? "soon" : "current";
    return { ...v, days, state } as const;
  });
  const overdue = vaccinations.filter((v) => v.state === "overdue");

  return (
    <Stack gap="md" pb="xl">
      <Anchor component={Link} href="/" size="sm" fw={600}>
        <Group gap={4}>
          <IconArrowLeft size={16} aria-hidden />
          Back to today&rsquo;s schedule
        </Group>
      </Anchor>

      <Group gap="md" wrap="nowrap">
        <Avatar size={64} color="teal.8" variant="filled" radius="xl" aria-hidden>
          <IconPaw size={34} />
        </Avatar>
        <Box>
          <Title order={1} size="h1">
            {patient.name}
          </Title>
          <Text c="dimmed">
            {patient.breed}, {patient.species.toLowerCase()} &middot; {ageText(patient.born)} old
          </Text>
        </Box>
      </Group>

      {patient.alerts.length > 0 && (
        <Box style={{ position: "sticky", top: 76, zIndex: 20 }}>
          <Alert
            variant="filled"
            color="red.9"
            radius="md"
            icon={<IconAlertTriangleFilled size={26} aria-hidden />}
            title="Medical alerts"
            role="region"
            aria-label={`Medical alerts for ${patient.name}`}
            styles={{ title: { fontSize: 18, fontWeight: 800 } }}
          >
            <Stack gap={2}>
              {patient.alerts.map((a) => (
                <Text key={a} fw={700} size="lg" c="white">
                  {a}
                </Text>
              ))}
            </Stack>
          </Alert>
        </Box>
      )}

      <Paper withBorder p={{ base: "sm", sm: "md" }} radius="md" component="section" aria-label="Patient and owner details">
        <SimpleGrid cols={{ base: 2, sm: 3, lg: 6 }} spacing="md">
          <Fact label="Species">{patient.species}</Fact>
          <Fact label="Breed">{patient.breed}</Fact>
          <Fact label="Born">
            {fmtDate(patient.born)}
            <Text span size="sm" c="dimmed" fw={400}>
              {" "}
              ({ageText(patient.born)})
            </Text>
          </Fact>
          <Fact label="Sex">{patient.sex}</Fact>
          <Fact label="Owner">{owner?.name}</Fact>
          <Fact label="Phone">
            {owner && (
              <Anchor href={`tel:${owner.phone.replace(/\s/g, "")}`} fw={600}>
                <Group gap={4} wrap="nowrap">
                  <IconPhone size={16} aria-hidden />
                  {owner.phone}
                </Group>
              </Anchor>
            )}
          </Fact>
        </SimpleGrid>
        <Text size="xs" c="dimmed" mt="sm">
          Patient ID {patient.id}
        </Text>
      </Paper>

      <Grid gap="md">
        <Grid.Col span={{ base: 12, lg: 7 }}>
          <Stack gap="md">
            {todays.length > 0 && (
              <Section id="today-title" title="At the clinic today" icon={<IconStethoscope size={20} aria-hidden />}>
                <Stack gap="xs">
                  {todays.map((a) => {
                    const vet = getVet(a.vet);
                    const meta = statusMeta[a.status];
                    return (
                      <Group key={a.id} justify="space-between" gap="xs">
                        <Box>
                          <Text component="div" fw={700}>
                            {fmt12(a.start)} to {fmt12(endOf(a))}, {a.reason}
                          </Text>
                          <Text component="div" size="sm" c="dimmed">
                            {vet?.name}, {vet?.room}
                          </Text>
                        </Box>
                        <Badge
                          size="lg"
                          variant="light"
                          color={meta.color}
                          c={`light-dark(var(--mantine-color-${meta.color}-9), var(--mantine-color-${meta.color}-2))`}
                        >
                          {meta.label}
                        </Badge>
                      </Group>
                    );
                  })}
                </Stack>
              </Section>
            )}

            <Section id="weight-title" title="Weight trend" icon={<IconStethoscope size={20} aria-hidden />}>
              {chartData.length === 0 ? (
                <Text c="dimmed">No weights on file yet.</Text>
              ) : (
                <>
                  <SimpleGrid cols={{ base: 1, xs: 3 }} spacing="sm" mb="md">
                    <Fact label="Latest">{last?.kg.toFixed(1)} kg</Fact>
                    <Fact label="Since last visit">
                      {sign(lastChange)}
                      {Math.abs(lastChange).toFixed(1)} kg
                    </Fact>
                    <Fact label={`Since ${first ? fmtDate(first.date) : ""}`}>
                      {sign(totalChange)}
                      {Math.abs(totalChange).toFixed(1)} kg
                      {first ? ` (${((totalChange / first.kg) * 100).toFixed(1).replace("-", "−")}%)` : ""}
                    </Fact>
                  </SimpleGrid>
                  <Box
                    role="img"
                    h={250}
                    aria-label={`Line chart of ${patient.name}'s weight at ${weights.length} visits, from ${first?.kg} kg on ${first ? fmtDate(first.date) : ""} down to ${last?.kg} kg on ${last ? fmtDate(last.date) : ""}.`}
                  >
                    {mounted && (
                      <LineChart
                        h={250}
                        data={chartData}
                        dataKey="date"
                        series={[{ name: "kg", label: "Weight", color: "teal.8" }]}
                        curveType="linear"
                        withDots
                        yAxisProps={{ domain: [26, 34] }}
                        valueFormatter={(v) => `${v} kg`}
                        tickLine="xy"
                      />
                    )}
                  </Box>
                </>
              )}
            </Section>

            <Section id="visits-title" title="Visit history" icon={<IconStethoscope size={20} aria-hidden />}>
              {!record || record.visits.length === 0 ? (
                <Text c="dimmed">No past visits on file.</Text>
              ) : (
                <Stack gap="sm" component="ol" m={0} p={0} style={{ listStyle: "none" }}>
                  {record.visits.map((v) => (
                    <Paper key={v.date} component="li" withBorder p="sm" radius="md">
                      <Group justify="space-between" gap="xs" align="flex-start">
                        <Box>
                          <Text component="div" fw={700}>{v.reason}</Text>
                          <Text component="div" size="sm" c="dimmed">
                            {fmtDate(v.date)} &middot; {getVet(v.vet)?.name}
                          </Text>
                        </Box>
                        <Text size="sm" fw={600}>
                          {fmtUsd(v.invoice_usd)}
                        </Text>
                      </Group>
                      <Text size="sm" mt={6}>
                        {v.notes}
                      </Text>
                    </Paper>
                  ))}
                </Stack>
              )}
            </Section>
          </Stack>
        </Grid.Col>

        <Grid.Col span={{ base: 12, lg: 5 }}>
          <Stack gap="md">
            <Section id="vax-title" title="Vaccinations" icon={<IconVaccine size={20} aria-hidden />}>
              {vaccinations.length === 0 ? (
                <Text c="dimmed">No vaccinations on file yet.</Text>
              ) : (
                <>
                  {overdue.length > 0 && (
                    <Text c="red.9" fw={800} mb="sm">
                      {overdue.length} overdue as of {fmtDate(TODAY)}: {overdue.map((v) => v.name).join(", ")}
                    </Text>
                  )}
                  <Table.ScrollContainer minWidth={420}>
                    <Table verticalSpacing="xs">
                      <Table.Thead>
                        <Table.Tr>
                          <Table.Th scope="col">Vaccine</Table.Th>
                          <Table.Th scope="col">Given</Table.Th>
                          <Table.Th scope="col">Due</Table.Th>
                          <Table.Th scope="col">Status</Table.Th>
                        </Table.Tr>
                      </Table.Thead>
                      <Table.Tbody>
                        {vaccinations.map((v) => (
                          <Table.Tr
                            key={v.name}
                            style={{ background: v.state === "overdue" ? "var(--mantine-color-red-light)" : undefined }}
                          >
                            <Table.Td fw={700}>{v.name}</Table.Td>
                            <Table.Td>{fmtDate(v.given)}</Table.Td>
                            <Table.Td>{fmtDate(v.due)}</Table.Td>
                            <Table.Td>
                              {v.state === "overdue" ? (
                                <Badge color="red.9" variant="filled" size="lg">
                                  Overdue {Math.abs(v.days)} days
                                </Badge>
                              ) : v.state === "soon" ? (
                                <Badge color="yellow" variant="light" c="yellow.9" size="lg">
                                  Due in {v.days} days
                                </Badge>
                              ) : (
                                <Badge color="green" variant="light" c="green.9" size="lg">
                                  Up to date
                                </Badge>
                              )}
                            </Table.Td>
                          </Table.Tr>
                        ))}
                      </Table.Tbody>
                    </Table>
                  </Table.ScrollContainer>
                </>
              )}
            </Section>

            <Section id="meds-title" title="Current medications" icon={<IconPill size={20} aria-hidden />}>
              {!record || record.medications.length === 0 ? (
                <Text c="dimmed">No current medications.</Text>
              ) : (
                <Stack gap="xs" component="ul" m={0} p={0} style={{ listStyle: "none" }}>
                  {record.medications.map((m) => (
                    <Paper key={m.name} component="li" withBorder p="sm" radius="md">
                      <Text component="div" fw={700}>{m.name}</Text>
                      <Text component="div" size="sm">{m.dose}</Text>
                      <Text component="div" size="xs" c="dimmed">
                        Since {fmtDate(m.since)}
                      </Text>
                    </Paper>
                  ))}
                </Stack>
              )}
            </Section>

            {patient.alerts.length > 0 && (
              <Paper withBorder p="sm" radius="md" aria-label="Alerts summary">
                <Text size="xs" c="dimmed" fw={600} tt="uppercase" mb={6} style={{ letterSpacing: 0.4 }}>
                  Alerts on this record
                </Text>
                <AlertFlags alerts={patient.alerts} size="sm" />
              </Paper>
            )}
          </Stack>
        </Grid.Col>
      </Grid>
    </Stack>
  );
}
```

```tsx app/page.tsx
import type { Metadata } from "next";
import { AppFrame } from "@/components/AppFrame";
import { Schedule } from "@/components/Schedule";

export const metadata: Metadata = { title: "Today's schedule | Pawpoint" };

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
import { notFound } from "next/navigation";
import { AppFrame } from "@/components/AppFrame";
import { PatientRecord } from "@/components/PatientRecord";
import { getPatient, patients } from "@/lib/data";

export function generateStaticParams() {
  return patients.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const patient = getPatient(id);
  return { title: patient ? `${patient.name} | Pawpoint` : "Patient | Pawpoint" };
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!getPatient(id)) notFound();
  return (
    <AppFrame>
      <PatientRecord patientId={id} />
    </AppFrame>
  );
}
```
