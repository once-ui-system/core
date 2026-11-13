```ts lib/data.ts
export type Status = "booked" | "checked_in" | "in_exam" | "done" | "cancelled";

export type Vet = { id: string; name: string; room: string; short: string };
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
export type PatientRecordData = {
  weights: { date: string; kg: number }[];
  vaccinations: { name: string; given: string; due: string }[];
  medications: { name: string; dose: string; since: string }[];
  visits: { date: string; vet: string; reason: string; notes: string; invoice: number }[];
};

export const CLINIC = "Pawpoint";
export const CLINIC_LONG = "Hillside Veterinary Clinic";
export const TODAY = "2026-11-12";
/** The front desk clock at first render (09:52), so the page renders identically on server and client. */
export const START_NOW_MIN = 9 * 60 + 52;
export const DAY_START_MIN = 8 * 60;
export const DAY_END_MIN = 17 * 60;

export const user = { name: "Rosa Lindqvist", role: "Receptionist" };

export const vets: Vet[] = [
  { id: "v-1", name: "Dr. Amara Osei", room: "Exam 1", short: "Osei" },
  { id: "v-2", name: "Dr. Tomás Reyes", room: "Exam 2", short: "Reyes" },
  { id: "v-3", name: "Dr. Helen Park", room: "Surgery", short: "Park" },
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
  { id: "p-105", name: "Kiwi", species: "Bird", breed: "Budgerigar", born: "2023-03-11", sex: "Male", owner: "o-5", alerts: [] },
  { id: "p-106", name: "Tofu", species: "Rabbit", breed: "Holland lop", born: "2022-05-30", sex: "Female", owner: "o-6", alerts: [] },
  { id: "p-107", name: "Ziggy", species: "Cat", breed: "Maine coon", born: "2018-11-02", sex: "Male, neutered", owner: "o-2", alerts: ["Diabetic: insulin twice daily"] },
  { id: "p-108", name: "Bruno", species: "Dog", breed: "French bulldog", born: "2022-02-14", sex: "Male", owner: "o-5", alerts: ["Brachycephalic: sedation risk"] },
];

export const appointments: Appointment[] = [
  { id: "a-01", patient: "p-101", vet: "v-1", start: "08:30", minutes: 20, reason: "Annual vaccination", status: "done" },
  { id: "a-02", patient: "p-104", vet: "v-2", start: "08:30", minutes: 30, reason: "Kidney panel recheck", status: "done" },
  { id: "a-03", patient: "p-108", vet: "v-3", start: "08:00", minutes: 120, reason: "Soft palate surgery", status: "in_exam" },
  { id: "a-04", patient: "p-102", vet: "v-1", start: "09:00", minutes: 30, reason: "Limping, left hind leg", status: "in_exam" },
  { id: "a-05", patient: "p-107", vet: "v-2", start: "09:15", minutes: 20, reason: "Glucose curve", status: "checked_in", checkedInAt: 9 * 60 + 8 },
  { id: "a-06", patient: "p-105", vet: "v-1", start: "09:45", minutes: 20, reason: "Beak and nail trim", status: "checked_in", checkedInAt: 9 * 60 + 38 },
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
    weights: [
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
        invoice: 186.0,
      },
      {
        date: "2026-06-17",
        vet: "v-2",
        reason: "Kidney panel recheck",
        notes: "Stable. Appetite good. Owner reports more drinking in hot weather.",
        invoice: 172.5,
      },
      {
        date: "2026-02-11",
        vet: "v-1",
        reason: "Coughing",
        notes: "Mild kennel cough. Supportive care; no antibiotics given (penicillin allergy).",
        invoice: 94.0,
      },
      {
        date: "2025-11-03",
        vet: "v-2",
        reason: "Senior wellness exam",
        notes: "Grade 2 dental tartar. Dental cleaning recommended.",
        invoice: 148.0,
      },
    ],
  },
};

export const vetById = (id: string): Vet => vets.find((v) => v.id === id) ?? vets[0];
export const ownerById = (id: string): Owner => owners.find((o) => o.id === id) ?? owners[0];
export const patientById = (id: string): Patient | undefined => patients.find((p) => p.id === id);

export const STATUS_META: Record<Status, { label: string; color: string }> = {
  booked: { label: "Booked", color: "blue" },
  checked_in: { label: "Checked in", color: "orange" },
  in_exam: { label: "In exam", color: "teal" },
  done: { label: "Done", color: "gray" },
  cancelled: { label: "Cancelled", color: "gray" },
};

export function toMin(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function fmtClock(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  const suffix = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${suffix}`;
}

export function fmtDate(iso: string, options: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat("en-US", { timeZone: "UTC", ...options }).format(new Date(`${iso}T00:00:00Z`));
}

export function daysBetween(from: string, to: string): number {
  return Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86400000);
}

export function ageText(born: string, today: string): string {
  const [by, bm, bd] = born.split("-").map(Number);
  const [ty, tm, td] = today.split("-").map(Number);
  let months = (ty - by) * 12 + (tm - bm);
  if (td < bd) months -= 1;
  const y = Math.floor(months / 12);
  const m = months % 12;
  if (y === 0) return `${m} mo`;
  return m ? `${y} y ${m} mo` : `${y} y`;
}

export const money = (n: number): string =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

/** Returns the existing booking that overlaps the proposed slot for this vet, if any. */
export function findClash(list: Appointment[], vet: string, startMin: number, minutes: number): Appointment | undefined {
  const end = startMin + minutes;
  return list.find(
    (a) => a.vet === vet && a.status !== "cancelled" && startMin < toMin(a.start) + a.minutes && toMin(a.start) < end,
  );
}
```

```tsx components/Alerts.tsx
"use client";

import { Badge, Group, Paper, Stack, Text, VisuallyHidden } from "@mantine/core";
import { IconAlertTriangle } from "@tabler/icons-react";

/** Compact, high-contrast medical alert chips used wherever a patient appears. */
export function AlertBadges({ alerts, size = "md" }: { alerts: string[]; size?: "sm" | "md" | "lg" }) {
  if (alerts.length === 0) return null;
  return (
    <Group gap={6} role="list" aria-label="Medical alerts">
      {alerts.map((alert) => (
        <Badge
          key={alert}
          role="listitem"
          color="red.8"
          variant="filled"
          size={size}
          tt="none"
          fw={700}
          leftSection={<IconAlertTriangle size={14} aria-hidden="true" />}
        >
          <VisuallyHidden>Medical alert: </VisuallyHidden>
          {alert}
        </Badge>
      ))}
    </Group>
  );
}

/** Full-width banner for the top of a record. */
export function AlertBanner({ name, alerts }: { name: string; alerts: string[] }) {
  if (alerts.length === 0) return null;
  return (
    <Paper
      component="section"
      aria-label={`Medical alerts for ${name}`}
      p="md"
      radius="md"
      bg="red.8"
      c="white"
      style={{ border: "3px solid var(--mantine-color-red-9)" }}
    >
      <Group gap="sm" align="flex-start" wrap="nowrap">
        <IconAlertTriangle size={32} aria-hidden="true" style={{ flexShrink: 0 }} />
        <Stack gap={4}>
          <Text fw={800} tt="uppercase" fz="sm" lts="0.08em" c="white">
            Medical alerts
          </Text>
          <Stack gap={2} component="ul" m={0} p={0} style={{ listStyle: "none" }}>
            {alerts.map((a) => (
              <Text key={a} component="li" fz={{ base: "lg", sm: "xl" }} fw={700} c="white" lh={1.3}>
                {a}
              </Text>
            ))}
          </Stack>
        </Stack>
      </Group>
    </Paper>
  );
}
```

```tsx components/PatientSearch.tsx
"use client";

import { useId, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge, Box, Group, Paper, Text, TextInput, UnstyledButton, VisuallyHidden } from "@mantine/core";
import { IconAlertTriangle, IconSearch } from "@tabler/icons-react";
import { ownerById, patients } from "@/lib/data";

export function PatientSearch() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const listId = useId();

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return patients.filter((p) => p.name.toLowerCase().includes(q) || ownerById(p.owner).name.toLowerCase().includes(q));
  }, [query]);

  const showList = open && query.trim().length > 0;

  return (
    <Box
      pos="relative"
      w="100%"
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOpen(false);
      }}
    >
      <TextInput
        type="search"
        size="md"
        placeholder="Find a patient or owner"
        aria-label="Search patients and owners"
        aria-controls={showList ? listId : undefined}
        leftSection={<IconSearch size={18} aria-hidden="true" />}
        value={query}
        onChange={(e) => {
          setQuery(e.currentTarget.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            setOpen(false);
          }
          if (e.key === "Enter" && results.length > 0) {
            setOpen(false);
            router.push(`/patients/${results[0].id}`);
          }
        }}
      />
      <VisuallyHidden aria-live="polite">
        {showList ? `${results.length} ${results.length === 1 ? "match" : "matches"}` : ""}
      </VisuallyHidden>
      {showList && (
        <Paper
          id={listId}
          withBorder
          shadow="lg"
          radius="md"
          pos="absolute"
          top="calc(100% + 6px)"
          left={0}
          right={0}
          p={4}
          style={{ zIndex: 400 }}
        >
          {results.length === 0 ? (
            <Text c="dimmed" fz="sm" p="sm">
              No patient or owner matches “{query.trim()}”.
            </Text>
          ) : (
            <Box component="ul" m={0} p={0} style={{ listStyle: "none" }}>
              {results.map((p) => (
                <li key={p.id}>
                  <UnstyledButton
                    component={Link}
                    href={`/patients/${p.id}`}
                    onClick={() => setOpen(false)}
                    w="100%"
                    p="sm"
                    style={{ borderRadius: "var(--mantine-radius-sm)", display: "block", minHeight: 48 }}
                  >
                    <Group justify="space-between" wrap="nowrap" gap="xs">
                      <Box style={{ minWidth: 0 }}>
                        <Text fw={700} fz="md" c="dark.9">
                          {p.name}{" "}
                          <Text span c="dimmed" fw={400} fz="sm">
                            {p.species} · {p.breed}
                          </Text>
                        </Text>
                        <Text fz="sm" c="gray.7">
                          Owner: {ownerById(p.owner).name}
                        </Text>
                      </Box>
                      {p.alerts.length > 0 && (
                        <Badge color="red.8" variant="filled" tt="none" leftSection={<IconAlertTriangle size={12} aria-hidden="true" />}>
                          {p.alerts.length === 1 ? "Alert" : `${p.alerts.length} alerts`}
                        </Badge>
                      )}
                    </Group>
                  </UnstyledButton>
                </li>
              ))}
            </Box>
          )}
        </Paper>
      )}
    </Box>
  );
}
```

```tsx components/Frame.tsx
"use client";

import Link from "next/link";
import { Avatar, Box, Container, Flex, Group, Text, UnstyledButton } from "@mantine/core";
import { IconPaw } from "@tabler/icons-react";
import { CLINIC, CLINIC_LONG, user } from "@/lib/data";
import { PatientSearch } from "./PatientSearch";

export function Frame({ children }: { children: React.ReactNode }) {
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("");
  return (
    <Box mih="100vh" bg="gray.0">
      <Box component="header" bg="teal.9" c="white" pos="sticky" top={0} style={{ zIndex: 300 }}>
        <Container size="xl" py="sm">
          <Flex direction={{ base: "column", sm: "row" }} gap="sm" align={{ base: "stretch", sm: "center" }}>
            <Group justify="space-between" wrap="nowrap" style={{ flexShrink: 0 }}>
              <UnstyledButton component={Link} href="/" aria-label={`${CLINIC}, today's schedule`} c="white">
                <Group gap="xs" wrap="nowrap">
                  <Box
                    w={40}
                    h={40}
                    style={{
                      display: "grid",
                      placeItems: "center",
                      borderRadius: "var(--mantine-radius-md)",
                      background: "var(--mantine-color-teal-6)",
                    }}
                  >
                    <IconPaw size={24} aria-hidden="true" />
                  </Box>
                  <Box>
                    <Text fw={800} fz="lg" lh={1.1} c="white">
                      {CLINIC}
                    </Text>
                    <Text fz="xs" c="teal.1" lh={1.2}>
                      {CLINIC_LONG}
                    </Text>
                  </Box>
                </Group>
              </UnstyledButton>
              <Group gap="xs" wrap="nowrap" hiddenFrom="sm">
                <Avatar color="teal.2" variant="filled" radius="xl" size={36} aria-hidden="true" c="teal.9">
                  {initials}
                </Avatar>
              </Group>
            </Group>
            <Box style={{ flex: 1, maxWidth: 560 }} w="100%" mx={{ sm: "auto" }}>
              <PatientSearch />
            </Box>
            <Group gap="sm" wrap="nowrap" visibleFrom="sm" style={{ flexShrink: 0 }}>
              <Box ta="right">
                <Text fw={700} fz="sm" c="white" lh={1.2}>
                  {user.name}
                </Text>
                <Text fz="xs" c="teal.1" lh={1.2}>
                  {user.role}
                </Text>
              </Box>
              <Avatar color="teal.2" variant="filled" radius="xl" size={40} aria-hidden="true" c="teal.9">
                {initials}
              </Avatar>
            </Group>
          </Flex>
        </Container>
      </Box>
      <Box component="main" id="main">
        <Container size="xl" py="lg">
          {children}
        </Container>
      </Box>
    </Box>
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
```

```tsx components/WeightChart.tsx
"use client";

import { LineChart } from "@mantine/charts";
import { Box } from "@mantine/core";

export function WeightChart({ data, summary }: { data: { label: string; kg: number }[]; summary: string }) {
  const values = data.map((d) => d.kg);
  const min = Math.floor(Math.min(...values) - 1);
  const max = Math.ceil(Math.max(...values) + 1);
  return (
    <Box role="img" aria-label={summary}>
      <LineChart
        h={260}
        data={data}
        dataKey="label"
        series={[{ name: "kg", label: "Weight (kg)", color: "teal.7" }]}
        curveType="linear"
        withDots
        gridAxis="xy"
        yAxisProps={{ domain: [min, max] }}
        valueFormatter={(v) => `${v} kg`}
      />
    </Box>
  );
}
```

```tsx components/PatientRecord.tsx
"use client";

import Link from "next/link";
import { Anchor, Badge, Box, Button, Grid, Group, Paper, Stack, Table, Text, Title } from "@mantine/core";
import { IconArrowLeft, IconPhone, IconPill, IconStethoscope, IconVaccine } from "@tabler/icons-react";
import {
  STATUS_META,
  TODAY,
  ageText,
  appointments,
  daysBetween,
  fmtClock,
  fmtDate,
  money,
  ownerById,
  patientById,
  records,
  toMin,
  vetById,
} from "@/lib/data";
import { AlertBadges, AlertBanner } from "./Alerts";
import { WeightChart } from "./WeightChart";

const longDate: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" };

function Section({ id, title, icon, children }: { id: string; title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <Paper withBorder radius="md" p="md" component="section" aria-labelledby={id}>
      <Group gap="xs" mb="sm">
        {icon}
        <Title order={2} fz="lg" id={id}>
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
      <Text fz="xs" fw={700} tt="uppercase" lts="0.06em" c="gray.7">
        {label}
      </Text>
      <Text fw={600}>{children}</Text>
    </Box>
  );
}

export function PatientRecord({ patientId }: { patientId: string }) {
  const patient = patientById(patientId);
  if (!patient) return null;
  const owner = ownerById(patient.owner);
  const record = records[patientId];
  const todays = appointments.filter((a) => a.patient === patientId).sort((a, b) => toMin(a.start) - toMin(b.start));

  const weights = record?.weights ?? [];
  const first = weights[0];
  const last = weights[weights.length - 1];
  const change = first && last ? Math.round((last.kg - first.kg) * 10) / 10 : 0;
  const pct = first && last ? ((last.kg - first.kg) / first.kg) * 100 : 0;
  const chartData = weights.map((w) => ({ label: fmtDate(w.date, { month: "short", year: "numeric" }), kg: w.kg }));
  const weightSummary =
    first && last
      ? `Weight trend: ${first.kg} kilograms in ${fmtDate(first.date, { month: "long", year: "numeric" })} to ${last.kg} kilograms on ${fmtDate(last.date, longDate)}, ${weights.length} readings.`
      : "No weight readings";

  const overdue = (record?.vaccinations ?? []).filter((v) => v.due < TODAY);

  return (
    <Stack gap="lg">
      <Box>
        <Button
          component={Link}
          href="/"
          variant="subtle"
          size="md"
          px={0}
          leftSection={<IconArrowLeft size={18} aria-hidden="true" />}
        >
          Today&apos;s schedule
        </Button>
        <Group justify="space-between" align="flex-end" gap="xs">
          <Box>
            <Title order={1} fz={{ base: 32, sm: 40 }} lh={1.1}>
              {patient.name}
            </Title>
            <Text c="gray.7" fz="md">
              {patient.breed} · {patient.sex} · {ageText(patient.born, TODAY)} · ID {patient.id}
            </Text>
          </Box>
        </Group>
      </Box>

      <AlertBanner name={patient.name} alerts={patient.alerts} />

      {overdue.length > 0 && (
        <Paper
          role="note"
          p="md"
          radius="md"
          bg="orange.1"
          style={{ border: "2px solid var(--mantine-color-orange-7)" }}
          aria-label="Overdue vaccinations"
        >
          <Text fw={800} c="orange.9">
            {overdue.length} {overdue.length === 1 ? "vaccination is" : "vaccinations are"} overdue: {overdue.map((v) => v.name).join(", ")}
          </Text>
        </Paper>
      )}

      <Grid gap="md">
        <Grid.Col span={{ base: 12, md: 7 }}>
          <Stack gap="md">
            <Section id="details-title" title="Patient and owner">
              <Grid gap="md">
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <Stack gap="sm">
                    <Fact label="Species">{patient.species}</Fact>
                    <Fact label="Breed">{patient.breed}</Fact>
                    <Fact label="Sex">{patient.sex}</Fact>
                    <Fact label="Born">
                      {fmtDate(patient.born, longDate)} ({ageText(patient.born, TODAY)})
                    </Fact>
                  </Stack>
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <Stack gap="sm">
                    <Fact label="Owner">{owner.name}</Fact>
                    <Fact label="Phone">
                      <Anchor href={`tel:${owner.phone.replace(/\s/g, "")}`} fw={600}>
                        <IconPhone size={16} aria-hidden="true" style={{ verticalAlign: "-3px" }} /> {owner.phone}
                      </Anchor>
                    </Fact>
                    {last && <Fact label="Latest weight">{last.kg} kg</Fact>}
                    <Box>
                      <Text fz="xs" fw={700} tt="uppercase" lts="0.06em" c="gray.7">
                        Alerts
                      </Text>
                      {patient.alerts.length ? <AlertBadges alerts={patient.alerts} /> : <Text fw={600}>None on file</Text>}
                    </Box>
                  </Stack>
                </Grid.Col>
              </Grid>
            </Section>

            <Section id="weight-title" title="Weight trend">
              {chartData.length > 0 ? (
                <Stack gap="sm">
                  <Group gap="lg">
                    <Fact label="First reading">
                      {first.kg} kg
                    </Fact>
                    <Fact label="Latest">{last.kg} kg</Fact>
                    <Fact label={`Change over ${weights.length} visits`}>
                      <Text span fw={800} c={change < 0 ? "red.8" : "teal.8"}>
                        {change > 0 ? "+" : ""}
                        {change} kg ({pct.toFixed(1)}%)
                      </Text>
                    </Fact>
                  </Group>
                  <WeightChart data={chartData} summary={weightSummary} />
                </Stack>
              ) : (
                <Text c="gray.7">No weights recorded yet.</Text>
              )}
            </Section>

            <Section id="visits-title" title="Visit history" icon={<IconStethoscope size={20} aria-hidden="true" />}>
              {record && record.visits.length > 0 ? (
                <Stack gap="sm" component="ol" m={0} p={0} style={{ listStyle: "none" }}>
                  {record.visits.map((v) => (
                    <Paper key={v.date} component="li" p="sm" radius="md" bg="gray.0" withBorder>
                      <Group justify="space-between" gap="xs" align="flex-start">
                        <Box>
                          <Text fw={800}>
                            <time dateTime={v.date}>{fmtDate(v.date, longDate)}</time> · {v.reason}
                          </Text>
                          <Text fz="sm" c="gray.7">
                            {vetById(v.vet).name}
                          </Text>
                        </Box>
                        <Text fz="sm" fw={600} c="gray.7">
                          Invoice {money(v.invoice)}
                        </Text>
                      </Group>
                      <Text mt={6}>{v.notes}</Text>
                    </Paper>
                  ))}
                </Stack>
              ) : (
                <Text c="gray.7">No visits on file yet.</Text>
              )}
            </Section>
          </Stack>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 5 }}>
          <Stack gap="md">
            <Section id="vax-title" title="Vaccinations" icon={<IconVaccine size={20} aria-hidden="true" />}>
              {record && record.vaccinations.length > 0 ? (
                <Table.ScrollContainer minWidth={380}>
                  <Table verticalSpacing="xs">
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
                        const late = daysBetween(v.due, TODAY);
                        const isOverdue = late > 0;
                        return (
                          <Table.Tr key={v.name} bg={isOverdue ? "red.0" : undefined}>
                            <Table.Td fw={700}>{v.name}</Table.Td>
                            <Table.Td>{fmtDate(v.given, longDate)}</Table.Td>
                            <Table.Td fw={isOverdue ? 800 : 400} c={isOverdue ? "red.9" : undefined}>
                              {fmtDate(v.due, longDate)}
                            </Table.Td>
                            <Table.Td>
                              {isOverdue ? (
                                <Badge color="red.8" variant="filled" tt="none">
                                  Overdue {late} days
                                </Badge>
                              ) : (
                                <Badge color="teal" variant="light" tt="none">
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
              ) : (
                <Text c="gray.7">No vaccinations recorded.</Text>
              )}
            </Section>

            <Section id="meds-title" title="Current medications" icon={<IconPill size={20} aria-hidden="true" />}>
              {record && record.medications.length > 0 ? (
                <Stack gap="xs" component="ul" m={0} p={0} style={{ listStyle: "none" }}>
                  {record.medications.map((m) => (
                    <Paper key={m.name} component="li" p="sm" radius="md" bg="gray.0" withBorder>
                      <Text fw={700}>{m.name}</Text>
                      <Text fz="sm">{m.dose}</Text>
                      <Text fz="xs" c="gray.7">
                        Since {fmtDate(m.since, longDate)}
                      </Text>
                    </Paper>
                  ))}
                </Stack>
              ) : (
                <Text c="gray.7">No current medications.</Text>
              )}
            </Section>

            <Section id="today-title" title="At the clinic today">
              {todays.length > 0 ? (
                <Stack gap="xs" component="ul" m={0} p={0} style={{ listStyle: "none" }}>
                  {todays.map((a) => (
                    <Group key={a.id} component="li" justify="space-between" wrap="nowrap" gap="xs">
                      <Box>
                        <Text fw={700}>
                          {fmtClock(toMin(a.start))} · {a.reason}
                        </Text>
                        <Text fz="sm" c="gray.7">
                          {vetById(a.vet).name} · {vetById(a.vet).room}
                        </Text>
                      </Box>
                      <Badge color={STATUS_META[a.status].color} variant="light" size="lg">
                        {STATUS_META[a.status].label}
                      </Badge>
                    </Group>
                  ))}
                </Stack>
              ) : (
                <Text c="gray.7">No appointments today.</Text>
              )}
            </Section>
          </Stack>
        </Grid.Col>
      </Grid>
    </Stack>
  );
}
```

```tsx app/page.tsx
import type { Metadata } from "next";
import { Frame } from "@/components/Frame";
import { Schedule } from "@/components/Schedule";

export const metadata: Metadata = { title: "Today's schedule · Pawpoint" };

export default function Page() {
  return (
    <Frame>
      <Schedule />
    </Frame>
  );
}
```

```tsx app/patients/[id]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Frame } from "@/components/Frame";
import { PatientRecord } from "@/components/PatientRecord";
import { patientById, patients } from "@/lib/data";

export const metadata: Metadata = { title: "Patient record · Pawpoint" };

export function generateStaticParams() {
  return patients.map((p) => ({ id: p.id }));
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!patientById(id)) notFound();
  return (
    <Frame>
      <PatientRecord patientId={id} />
    </Frame>
  );
}
```

```ts app/theme.ts
import { createTheme } from "@mantine/core";

// System font stack, identical in every arm (no network font fetch at build).
export const theme = createTheme({
  fontFamily: "ui-sans-serif, system-ui, sans-serif",
  headings: { fontFamily: "ui-sans-serif, system-ui, sans-serif" },
  primaryColor: "teal",
  primaryShade: 8,
  defaultRadius: "md",
});
```
