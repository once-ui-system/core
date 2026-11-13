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
  /** "HH:MM" the patient was checked in at the counter */
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
export interface PatientRecord {
  weights_kg: Weight[];
  vaccinations: Vaccination[];
  medications: Medication[];
  visits: Visit[];
}

export const clinic = "Pawpoint, front-desk and records software for Hillside Veterinary Clinic";
export const TODAY = "2026-11-12";
/** The front desk clock when the schedule is first opened (minutes since midnight, 09:52). */
export const OPENED_AT_MINUTES = 9 * 60 + 52;

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

export const initialAppointments: Appointment[] = [
  { id: "a-01", patient: "p-101", vet: "v-1", start: "08:30", minutes: 20, reason: "Annual vaccination", status: "done" },
  { id: "a-02", patient: "p-104", vet: "v-2", start: "08:30", minutes: 30, reason: "Kidney panel recheck", status: "done" },
  { id: "a-03", patient: "p-108", vet: "v-3", start: "08:00", minutes: 120, reason: "Soft palate surgery", status: "in_exam" },
  { id: "a-04", patient: "p-102", vet: "v-1", start: "09:00", minutes: 30, reason: "Limping, left hind leg", status: "in_exam" },
  { id: "a-05", patient: "p-107", vet: "v-2", start: "09:15", minutes: 20, reason: "Glucose curve", status: "checked_in", checkedInAt: "09:22" },
  { id: "a-06", patient: "p-105", vet: "v-1", start: "09:45", minutes: 20, reason: "Beak and nail trim", status: "checked_in", checkedInAt: "09:41" },
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

/* ---------- helpers ---------- */

export const vetById = (id: string): Vet => vets.find((v) => v.id === id) ?? vets[0];
export const ownerById = (id: string): Owner => owners.find((o) => o.id === id) ?? owners[0];
export const patientById = (id: string): Patient | undefined => patients.find((p) => p.id === id);

export function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}
export function fromMinutes(total: number): string {
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
export function endTime(a: { start: string; minutes: number }): string {
  return fromMinutes(toMinutes(a.start) + a.minutes);
}

/** The live (not cancelled) appointment of this vet that overlaps the proposed slot, if any. */
export function findClash(
  appts: Appointment[],
  vetId: string,
  startMin: number,
  minutes: number,
): Appointment | undefined {
  const endMin = startMin + minutes;
  return appts.find((a) => {
    if (a.vet !== vetId || a.status === "cancelled") return false;
    const s = toMinutes(a.start);
    return startMin < s + a.minutes && s < endMin;
  });
}

function parseUtc(iso: string): number {
  const [y, m, d] = iso.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
}
export function daysBetween(fromIso: string, toIso: string): number {
  return Math.round((parseUtc(toIso) - parseUtc(fromIso)) / 86400000);
}
export function formatDate(iso: string, opts?: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    day: "numeric",
    month: "short",
    year: "numeric",
    ...opts,
  }).format(new Date(parseUtc(iso)));
}
export function ageText(bornIso: string, todayIso: string = TODAY): string {
  const [by, bm, bd] = bornIso.split("-").map(Number);
  const [ty, tm, td] = todayIso.split("-").map(Number);
  let months = (ty - by) * 12 + (tm - bm);
  if (td < bd) months -= 1;
  const years = Math.floor(months / 12);
  const rest = months % 12;
  if (years === 0) return `${rest} mo`;
  return rest === 0 ? `${years} yr` : `${years} yr ${rest} mo`;
}

export type VaccineState = { state: "overdue" | "soon" | "ok"; days: number };
export function vaccineState(dueIso: string, todayIso: string = TODAY): VaccineState {
  const days = daysBetween(todayIso, dueIso);
  if (days < 0) return { state: "overdue", days: -days };
  if (days <= 30) return { state: "soon", days };
  return { state: "ok", days };
}
export function overdueVaccineCount(patientId: string): number {
  const rec = records[patientId];
  if (!rec) return 0;
  return rec.vaccinations.filter((v) => vaccineState(v.due).state === "overdue").length;
}

export const usd = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
```

```tsx components/PatientAlerts.tsx
"use client";

import { Alert, Badge, Group, List, Text } from "@mantine/core";
import { IconAlertTriangle } from "@tabler/icons-react";

/** Compact red alert flags, shown anywhere a patient appears. */
export function PatientAlerts({ alerts, size = "md" }: { alerts: string[]; size?: "sm" | "md" | "lg" }) {
  if (alerts.length === 0) return null;
  return (
    <Group gap={6} role="group" aria-label="Medical alerts">
      {alerts.map((alert) => (
        <Badge
          key={alert}
          color="red"
          variant="filled"
          size={size}
          tt="none"
          leftSection={<IconAlertTriangle size={14} aria-hidden="true" />}
          style={{ height: "auto", paddingBlock: 3 }}
          styles={{ label: { whiteSpace: "normal", fontWeight: 700 } }}
        >
          <span className="sr-only" style={srOnly}>
            Medical alert:{" "}
          </span>
          {alert}
        </Badge>
      ))}
    </Group>
  );
}

const srOnly: React.CSSProperties = {
  position: "absolute",
  width: 1,
  height: 1,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  whiteSpace: "nowrap",
};

/** Large banner for the top of a record. */
export function PatientAlertBanner({ name, alerts }: { name: string; alerts: string[] }) {
  if (alerts.length === 0) {
    return (
      <Text size="sm" c="dimmed">
        No medical alerts on file for {name}.
      </Text>
    );
  }
  return (
    <Alert
      color="red"
      variant="filled"
      radius="md"
      icon={<IconAlertTriangle size={26} aria-hidden="true" />}
      title={`Medical alerts for ${name}`}
      role="region"
      aria-label={`Medical alerts for ${name}`}
      styles={{ title: { fontSize: "var(--mantine-font-size-lg)", fontWeight: 800 } }}
    >
      <List size="md" spacing={2} styles={{ item: { color: "white", fontWeight: 600 } }}>
        {alerts.map((a) => (
          <List.Item key={a}>{a}</List.Item>
        ))}
      </List>
    </Alert>
  );
}
```

```tsx components/AppFrame.tsx
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Anchor, Autocomplete, Avatar, Box, Container, Group, Text, ThemeIcon } from "@mantine/core";
import { IconAlertTriangle, IconPaw, IconSearch } from "@tabler/icons-react";
import { owners, ownerById, patients, user } from "@/lib/data";

export function AppFrame({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const options = useMemo(() => {
    const map = new Map<string, string>();
    patients.forEach((p) => {
      const o = ownerById(p.owner);
      map.set(`${p.name} · ${p.species}, ${p.breed} · ${o.name}`, p.id);
    });
    return map;
  }, []);
  const data = useMemo(() => Array.from(options.keys()), [options]);

  const open = (label: string) => {
    const id = options.get(label);
    if (id) {
      setQuery("");
      router.push(`/patients/${id}`);
    }
  };

  return (
    <Box
      style={{
        minHeight: "100vh",
        background: "light-dark(var(--mantine-color-gray-0), var(--mantine-color-dark-8))",
      }}
    >
      <a
        href="#main"
        style={{ position: "absolute", left: -9999, top: 8, zIndex: 1000, background: "white", padding: 8 }}
        onFocus={(e) => (e.currentTarget.style.left = "8px")}
        onBlur={(e) => (e.currentTarget.style.left = "-9999px")}
      >
        Skip to content
      </a>
      <Box
        component="header"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: "light-dark(var(--mantine-color-white), var(--mantine-color-dark-7))",
          borderBottom: "1px solid light-dark(var(--mantine-color-gray-3), var(--mantine-color-dark-4))",
        }}
      >
        <Container size="xl" py="xs">
          <Group justify="space-between" wrap="wrap" gap="sm">
            <Anchor component={Link} href="/" underline="never" c="inherit" aria-label="Pawpoint, today's schedule">
              <Group gap="xs" wrap="nowrap">
                <ThemeIcon size={40} radius="md" color="teal" variant="filled">
                  <IconPaw size={26} aria-hidden="true" />
                </ThemeIcon>
                <Box>
                  <Text fw={800} size="lg" lh={1.1}>
                    Pawpoint
                  </Text>
                  <Text size="xs" c="dimmed" lh={1.2}>
                    Hillside Veterinary Clinic
                  </Text>
                </Box>
              </Group>
            </Anchor>

            <Box style={{ flex: "1 1 280px", maxWidth: 520, order: 3 }} role="search">
              <Autocomplete
                size="md"
                aria-label="Find a patient or owner by name"
                placeholder="Find a patient or owner…"
                leftSection={<IconSearch size={18} aria-hidden="true" />}
                data={data}
                value={query}
                onChange={setQuery}
                onOptionSubmit={open}
                limit={6}
                maxDropdownHeight={320}
                renderOption={({ option }) => {
                  const p = patients.find((x) => x.id === options.get(option.value));
                  return (
                    <Group gap="xs" wrap="nowrap" justify="space-between" w="100%">
                      <Text size="sm">{option.value}</Text>
                      {p && p.alerts.length > 0 ? (
                        <IconAlertTriangle size={18} color="var(--mantine-color-red-6)" aria-label="Has medical alerts" />
                      ) : null}
                    </Group>
                  );
                }}
              />
            </Box>

            <Group gap="xs" wrap="nowrap" style={{ order: 2 }}>
              <Avatar color="teal" radius="xl" aria-hidden="true">
                RL
              </Avatar>
              <Box visibleFrom="xs">
                <Text size="sm" fw={600} lh={1.2}>
                  {user.name}
                </Text>
                <Text size="xs" c="dimmed" lh={1.2}>
                  {user.role} · {owners.length} owners on file
                </Text>
              </Box>
            </Group>
          </Group>
        </Container>
      </Box>
      <Container size="xl" py="lg" component="main" id="main" tabIndex={-1} style={{ outline: "none" }}>
        {children}
      </Container>
    </Box>
  );
}
```

```tsx components/Schedule.tsx
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

        <Stack gap={6} w={{ base: "auto", sm: 150 }} align={{ base: "flex-start", sm: "stretch" }} style={{ flexShrink: 0 }}>
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
        </Stack>
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
```

```tsx components/PatientRecord.tsx
"use client";

import Link from "next/link";
import { LineChart } from "@mantine/charts";
import { Anchor, Badge, Box, Group, Paper, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import {
  IconArrowLeft,
  IconHistory,
  IconPhone,
  IconPill,
  IconScale,
  IconStethoscope,
  IconVaccine,
} from "@tabler/icons-react";
import { PatientAlertBanner, PatientAlerts } from "@/components/PatientAlerts";
import {
  TODAY,
  ageText,
  daysBetween,
  endTime,
  formatDate,
  initialAppointments,
  overdueVaccineCount,
  ownerById,
  patients,
  records,
  usd,
  vaccineState,
  vetById,
  type Patient,
} from "@/lib/data";

function SectionTitle({ icon, children, id }: { icon: React.ReactNode; children: React.ReactNode; id: string }) {
  return (
    <Group gap="xs" mb="sm">
      {icon}
      <Title order={2} size="h4" id={id}>
        {children}
      </Title>
    </Group>
  );
}

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Box>
      <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
        {label}
      </Text>
      <Text fw={600}>{children}</Text>
    </Box>
  );
}

const shortMonth = (iso: string) => formatDate(iso, { day: undefined, month: "short", year: "2-digit" }).replace(" ", " '");

export function PatientRecord({ patient }: { patient: Patient }) {
  const owner = ownerById(patient.owner);
  const rec = records[patient.id];
  const otherPets = patients.filter((p) => p.owner === owner.id && p.id !== patient.id);
  const overdue = overdueVaccineCount(patient.id);
  const todays = initialAppointments.filter((a) => a.patient === patient.id && a.status !== "cancelled");

  const weights = rec?.weights_kg ?? [];
  const first = weights[0];
  const last = weights[weights.length - 1];
  const prev = weights[weights.length - 2];
  const chartData = weights.map((w) => ({ date: shortMonth(w.date), kg: w.kg }));

  return (
    <Stack gap="lg">
      <Anchor component={Link} href="/" size="md" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
        <IconArrowLeft size={18} aria-hidden="true" /> Today&apos;s schedule
      </Anchor>

      <Group justify="space-between" align="flex-start" wrap="wrap">
        <Box>
          <Title order={1} size="h1">
            {patient.name}
          </Title>
          <Text c="dimmed" size="lg">
            {patient.species} · {patient.breed} · {ageText(patient.born)} old
          </Text>
        </Box>
        {overdue > 0 ? (
          <Badge color="orange" size="xl" variant="filled" tt="none">
            {overdue} vaccinations overdue
          </Badge>
        ) : null}
      </Group>

      <PatientAlertBanner name={patient.name} alerts={patient.alerts} />

      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
        <Paper withBorder p="md" radius="md" component="section" aria-label="Patient details">
          <Title order={2} size="h4" mb="sm">
            Patient
          </Title>
          <SimpleGrid cols={2} spacing="sm">
            <Fact label="Species">{patient.species}</Fact>
            <Fact label="Breed">{patient.breed}</Fact>
            <Fact label="Born">
              {formatDate(patient.born)} ({ageText(patient.born)})
            </Fact>
            <Fact label="Sex">{patient.sex}</Fact>
            <Fact label="Patient ID">{patient.id}</Fact>
          </SimpleGrid>
        </Paper>
        <Paper withBorder p="md" radius="md" component="section" aria-label="Owner details">
          <Title order={2} size="h4" mb="sm">
            Owner
          </Title>
          <SimpleGrid cols={2} spacing="sm">
            <Fact label="Name">{owner.name}</Fact>
            <Fact label="Phone">
              <Anchor href={`tel:${owner.phone.replace(/\s/g, "")}`} style={{ display: "inline-flex", gap: 4, alignItems: "center" }}>
                <IconPhone size={16} aria-hidden="true" /> {owner.phone}
              </Anchor>
            </Fact>
          </SimpleGrid>
          {otherPets.length > 0 ? (
            <Box mt="sm">
              <Text size="xs" c="dimmed" tt="uppercase" fw={700} mb={4}>
                Other pets
              </Text>
              <Stack gap={4}>
                {otherPets.map((p) => (
                  <Group key={p.id} gap="xs">
                    <Anchor component={Link} href={`/patients/${p.id}`} fw={600}>
                      {p.name}
                    </Anchor>
                    <Text size="sm" c="dimmed">
                      {p.species}
                    </Text>
                    <PatientAlerts alerts={p.alerts} size="sm" />
                  </Group>
                ))}
              </Stack>
            </Box>
          ) : null}
        </Paper>
      </SimpleGrid>

      {todays.length > 0 ? (
        <Paper withBorder p="md" radius="md" component="section" aria-labelledby="today-h">
          <SectionTitle id="today-h" icon={<IconStethoscope size={22} aria-hidden="true" />}>
            Today, {formatDate(TODAY, { weekday: "long", month: "long" })}
          </SectionTitle>
          <Stack gap="xs" component="ul" style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {todays.map((a) => (
              <Group key={a.id} component="li" gap="sm">
                <Text fw={800} w={110}>
                  {a.start} to {endTime(a)}
                </Text>
                <Text>
                  {a.reason} · {vetById(a.vet).name}, {vetById(a.vet).room}
                </Text>
                <Badge variant="light" color={a.status === "done" ? "teal" : "gray"}>
                  {a.status.replace("_", " ")}
                </Badge>
              </Group>
            ))}
          </Stack>
        </Paper>
      ) : null}

      {!rec ? (
        <Paper withBorder p="lg" radius="md">
          <Text c="dimmed">No clinical record has been imported for {patient.name} yet.</Text>
        </Paper>
      ) : (
        <>
          <Paper withBorder p="md" radius="md" component="section" aria-labelledby="weight-h">
            <SectionTitle id="weight-h" icon={<IconScale size={22} aria-hidden="true" />}>
              Weight trend
            </SectionTitle>
            <Group gap="xl" mb="md">
              <Fact label="Now">{last.kg} kg</Fact>
              <Fact label="Last visit change">{(last.kg - prev.kg).toFixed(1)} kg</Fact>
              <Fact label={`Since ${formatDate(first.date, { day: undefined })}`}>
                {(last.kg - first.kg).toFixed(1)} kg ({(((last.kg - first.kg) / first.kg) * 100).toFixed(0)}%)
              </Fact>
            </Group>
            <Box role="img" aria-label={`Weight over ${weights.length} visits: ${weights.map((w) => `${formatDate(w.date)} ${w.kg} kilograms`).join(", ")}`}>
              <LineChart
                h={260}
                data={chartData}
                dataKey="date"
                series={[{ name: "kg", label: "Weight (kg)", color: "teal.6" }]}
                curveType="linear"
                yAxisProps={{ domain: [27, 33] }}
                unit=" kg"
                withLegend={false}
              />
            </Box>
          </Paper>

          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
            <Paper withBorder p="md" radius="md" component="section" aria-labelledby="vax-h">
              <SectionTitle id="vax-h" icon={<IconVaccine size={22} aria-hidden="true" />}>
                Vaccinations
              </SectionTitle>
              <Stack gap="xs" component="ul" style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {rec.vaccinations.map((v) => {
                  const s = vaccineState(v.due);
                  const isOver = s.state === "overdue";
                  return (
                    <Paper
                      key={v.name}
                      component="li"
                      p="sm"
                      radius="md"
                      withBorder
                      style={{
                        borderColor: isOver ? "var(--mantine-color-red-6)" : undefined,
                        borderWidth: isOver ? 2 : 1,
                        background: isOver ? "light-dark(var(--mantine-color-red-0), var(--mantine-color-dark-6))" : undefined,
                      }}
                    >
                      <Group justify="space-between" wrap="nowrap" align="flex-start">
                        <Box>
                          <Text fw={700}>{v.name}</Text>
                          <Text size="sm" c="dimmed">
                            Given {formatDate(v.given)} · due {formatDate(v.due)}
                          </Text>
                        </Box>
                        {isOver ? (
                          <Badge color="red" variant="filled" size="lg" tt="none">
                            Overdue {s.days} days
                          </Badge>
                        ) : s.state === "soon" ? (
                          <Badge color="orange" variant="light" size="lg" tt="none">
                            Due in {s.days} days
                          </Badge>
                        ) : (
                          <Badge color="teal" variant="light" size="lg" tt="none">
                            Up to date · {Math.round(daysBetween(TODAY, v.due) / 30)} mo left
                          </Badge>
                        )}
                      </Group>
                    </Paper>
                  );
                })}
              </Stack>
            </Paper>

            <Paper withBorder p="md" radius="md" component="section" aria-labelledby="med-h">
              <SectionTitle id="med-h" icon={<IconPill size={22} aria-hidden="true" />}>
                Current medications
              </SectionTitle>
              <Stack gap="xs" component="ul" style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {rec.medications.map((m) => (
                  <Paper key={m.name} component="li" p="sm" radius="md" withBorder>
                    <Text fw={700}>{m.name}</Text>
                    <Text size="sm">{m.dose}</Text>
                    <Text size="xs" c="dimmed">
                      Since {formatDate(m.since)}
                    </Text>
                  </Paper>
                ))}
              </Stack>
            </Paper>
          </SimpleGrid>

          <Paper withBorder p="md" radius="md" component="section" aria-labelledby="visits-h">
            <SectionTitle id="visits-h" icon={<IconHistory size={22} aria-hidden="true" />}>
              Visit history
            </SectionTitle>
            <Stack gap="sm" component="ol" style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {rec.visits.map((v) => (
                <Paper key={v.date} component="li" p="sm" radius="md" withBorder>
                  <Group justify="space-between" align="flex-start" wrap="wrap" gap="xs">
                    <Box>
                      <Text fw={700}>
                        {formatDate(v.date)} · {v.reason}
                      </Text>
                      <Text size="sm" c="dimmed">
                        {vetById(v.vet).name}
                      </Text>
                    </Box>
                    <Text size="sm" fw={600}>
                      {usd(v.invoice_usd)}
                    </Text>
                  </Group>
                  <Text mt={6}>{v.notes}</Text>
                </Paper>
              ))}
            </Stack>
          </Paper>
        </>
      )}
    </Stack>
  );
}
```

```tsx app/patients/[id]/page.tsx
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PatientRecord } from "@/components/PatientRecord";
import { patientById, patients } from "@/lib/data";

export function generateStaticParams() {
  return patients.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const p = patientById(id);
  return { title: p ? `${p.name} · Pawpoint` : "Patient · Pawpoint" };
}

export default async function PatientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const patient = patientById(id);
  if (!patient) notFound();
  return <PatientRecord patient={patient} />;
}
```

```tsx app/page.tsx
import type { Metadata } from "next";
import { Schedule } from "@/components/Schedule";

export const metadata: Metadata = { title: "Today's schedule · Pawpoint" };

export default function Page() {
  return <Schedule />;
}
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
import { AppFrame } from "@/components/AppFrame";
import { theme } from "./theme";

export const metadata: Metadata = {
  title: "Pawpoint",
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
            <Notifications position="top-right" />
            <AppFrame>{children}</AppFrame>
          </ModalsProvider>
        </MantineProvider>
      </body>
    </html>
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
  defaultRadius: "md",
});
```
