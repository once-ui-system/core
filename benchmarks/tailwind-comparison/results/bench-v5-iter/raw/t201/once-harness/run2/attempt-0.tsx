```tsx app/layout.tsx
import "@once-ui-system/core/css/styles.css";
import "@once-ui-system/core/css/tokens.css";
import "./fonts.css";

import type { Metadata } from "next";
import { Column, Flex } from "@once-ui-system/core";
import { AppHeader } from "@/components/AppHeader";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Pawpoint — Hillside Veterinary Clinic front desk",
  description: "Front-desk schedule, check-in and patient records for Hillside Veterinary Clinic.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <Flex as="html" lang="en" suppressHydrationWarning>
      <Column as="body" background="page" fillWidth margin="0" padding="0" minHeight="100vh">
        <Providers>
          <AppHeader />
          {children}
        </Providers>
      </Column>
    </Flex>
  );
}
```

```tsx app/page.tsx
import { Schedule } from "@/components/Schedule";

export default function Page() {
  return <Schedule />;
}
```

```tsx app/patients/[id]/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { Column, Grid, Heading, Icon, Row, Tag, Text } from "@once-ui-system/core";
import { AlertTags } from "@/components/AlertTags";
import { WeightTrend } from "@/components/WeightTrend";
import {
  STATUS_LABEL,
  TODAY,
  ageLabel,
  appointments,
  daysBetween,
  formatDate,
  getOwner,
  getPatient,
  getVet,
  patients,
  records,
} from "@/lib/data";

export function generateStaticParams() {
  return patients.map((p) => ({ id: p.id }));
}

function Panel({ title, icon, aside, children }: { title: string; icon: "paw" | "trend" | "security" | "clipboard" | "calendar" | "document"; aside?: ReactNode; children: ReactNode }) {
  return (
    <Column as="section" background="surface" border radius="l" padding="24" gap="16" s={{ padding: "16" }}>
      <Row horizontal="between" vertical="center" gap="12" wrap>
        <Row gap="8" vertical="center">
          <Icon name={icon} size="s" onBackground="neutral-weak" />
          <Heading as="h2" textVariant="heading-strong-l">
            {title}
          </Heading>
        </Row>
        {aside}
      </Row>
      {children}
    </Column>
  );
}

function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Column gap="2">
      <Text textVariant="label-default-s" onBackground="neutral-weak">
        {label}
      </Text>
      <Text textVariant="body-strong-m" as="div">
        {children}
      </Text>
    </Column>
  );
}

export default async function PatientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const patient = getPatient(id);
  if (!patient) notFound();
  const owner = getOwner(patient.owner);
  const record = records[patient.id];
  const todays = appointments.filter((a) => a.patient === patient.id);

  const vaccinations = (record?.vaccinations ?? []).map((v) => {
    const left = daysBetween(TODAY, v.due);
    return { ...v, left, overdue: left < 0, soon: left >= 0 && left <= 60 };
  });
  const overdue = vaccinations.filter((v) => v.overdue);

  return (
    <Column as="main" id="main" fillWidth horizontal="center" padding="24" s={{ padding: "12" }}>
      <Column fillWidth maxWidth="xl" gap="24">
        <Row>
          <Link href="/" style={{ color: "inherit", textDecoration: "none" }}>
            <Row gap="4" vertical="center" onBackground="neutral-weak">
              <Icon name="chevronLeft" size="s" />
              <Text textVariant="label-strong-m">Today’s schedule</Text>
            </Row>
          </Link>
        </Row>

        {(patient.alerts.length > 0 || overdue.length > 0) && (
          <Column
            as="section"
            aria-label="Medical alerts"
            role="region"
            background="danger-alpha-weak"
            border="danger-strong"
            borderWidth={2}
            radius="l"
            padding="20"
            gap="12">
            <Row gap="8" vertical="center">
              <Icon name="warning" onBackground="danger-strong" />
              <Text textVariant="label-strong-l" onBackground="danger-strong">
                Read before handling {patient.name}
              </Text>
            </Row>
            <AlertTags alerts={patient.alerts} size="l" />
            {overdue.length > 0 && (
              <Text textVariant="body-strong-m" onBackground="danger-strong">
                Overdue vaccinations: {overdue.map((v) => v.name).join(", ")}
              </Text>
            )}
          </Column>
        )}

        <Column background="surface" border radius="l" padding="24" gap="24" s={{ padding: "16" }}>
          <Row horizontal="between" vertical="start" gap="16" wrap>
            <Column gap="4">
              <Heading as="h1" textVariant="display-strong-s">
                {patient.name}
              </Heading>
              <Text textVariant="body-default-l" onBackground="neutral-weak">
                {patient.species} · {patient.breed}
              </Text>
            </Column>
            <Tag tone="neutral" label={`Patient ${patient.id}`} />
          </Row>
          <Grid columns="4" m={{ columns: "2" }} gap="16">
            <Fact label="Age">
              {ageLabel(patient.born)} <Text onBackground="neutral-weak" textVariant="body-default-s">(born {formatDate(patient.born)})</Text>
            </Fact>
            <Fact label="Sex">{patient.sex}</Fact>
            <Fact label="Owner">{owner?.name}</Fact>
            <Fact label="Owner phone">
              <a href={`tel:${owner?.phone.replace(/\s/g, "")}`} style={{ color: "inherit" }}>
                {owner?.phone}
              </a>
            </Fact>
          </Grid>
          {todays.length > 0 && (
            <Column gap="8">
              <Text textVariant="label-default-s" onBackground="neutral-weak">
                Today at the clinic
              </Text>
              <Row gap="8" wrap>
                {todays.map((a) => (
                  <Row key={a.id} gap="8" vertical="center" padding="8" paddingX="12" radius="m" background="neutral-alpha-weak" fit>
                    <Icon name="calendar" size="xs" />
                    <Text textVariant="body-default-s">
                      {a.start} · {a.reason} · {getVet(a.vet)?.name}
                    </Text>
                    <Tag size="s" tone={a.status === "done" ? "success" : "neutral"} label={STATUS_LABEL[a.status]} />
                  </Row>
                ))}
              </Row>
            </Column>
          )}
        </Column>

        {record ? (
          <>
            <Grid columns="2" m={{ columns: "1" }} gap="24">
              <Panel title="Weight trend" icon="trend">
                <WeightTrend points={record.weights_kg} />
              </Panel>

              <Panel
                title="Vaccinations"
                icon="security"
                aside={overdue.length > 0 ? <Tag tone="danger" prefixIcon="warning" label={`${overdue.length} overdue`} /> : undefined}>
                <Column as="ul" gap="8" margin="0" padding="0" style={{ listStyle: "none" }}>
                  {vaccinations.map((v) => (
                    <Row
                      as="li"
                      key={v.name}
                      horizontal="between"
                      vertical="center"
                      gap="12"
                      wrap
                      padding="12"
                      radius="m"
                      background={v.overdue ? "danger-alpha-weak" : "neutral-alpha-weak"}
                      border={v.overdue ? "danger-alpha-strong" : "transparent"}>
                      <Column gap="2">
                        <Text textVariant="label-strong-m">{v.name}</Text>
                        <Text textVariant="body-default-s" onBackground="neutral-weak">
                          Given {formatDate(v.given)} · due {formatDate(v.due)}
                        </Text>
                      </Column>
                      {v.overdue ? (
                        <Tag tone="danger" prefixIcon="warning" label={`Overdue ${-v.left} days`} />
                      ) : v.soon ? (
                        <Tag tone="warning" prefixIcon="time" label={`Due in ${v.left} days`} />
                      ) : (
                        <Tag tone="success" prefixIcon="check" label="Up to date" />
                      )}
                    </Row>
                  ))}
                </Column>
              </Panel>
            </Grid>

            <Panel title="Current medications" icon="clipboard">
              <Column as="ul" gap="8" margin="0" padding="0" style={{ listStyle: "none" }}>
                {record.medications.map((m) => (
                  <Row as="li" key={m.name} horizontal="between" vertical="center" gap="12" wrap padding="12" radius="m" background="neutral-alpha-weak">
                    <Column gap="2">
                      <Text textVariant="label-strong-m">{m.name}</Text>
                      <Text textVariant="body-default-s">{m.dose}</Text>
                    </Column>
                    <Text textVariant="body-default-s" onBackground="neutral-weak">
                      Since {formatDate(m.since)}
                    </Text>
                  </Row>
                ))}
              </Column>
            </Panel>

            <Panel title="Visit history" icon="document">
              <Column as="ol" gap="16" margin="0" padding="0" style={{ listStyle: "none" }}>
                {record.visits.map((v) => (
                  <Column as="li" key={v.date} gap="8" paddingBottom="16" borderBottom>
                    <Row horizontal="between" vertical="center" gap="12" wrap>
                      <Row gap="12" vertical="center" wrap>
                        <Text textVariant="label-strong-l">{formatDate(v.date)}</Text>
                        <Text textVariant="body-strong-m">{v.reason}</Text>
                      </Row>
                      <Text textVariant="body-default-s" onBackground="neutral-weak">
                        {getVet(v.vet)?.name} · ${v.invoice_usd.toFixed(2)}
                      </Text>
                    </Row>
                    <Text textVariant="body-default-m">{v.notes}</Text>
                  </Column>
                ))}
              </Column>
            </Panel>
          </>
        ) : (
          <Panel title="Clinical record" icon="document">
            <Text textVariant="body-default-m" onBackground="neutral-weak">
              No weights, vaccinations, medications or visit notes are on file for {patient.name} in this demo.
            </Text>
          </Panel>
        )}
      </Column>
    </Column>
  );
}
```

```tsx components/AlertTags.tsx
import { Row, Tag } from "@once-ui-system/core";

/** Medical alerts: always red, always with a warning icon, never collapsed. */
export function AlertTags({ alerts, size = "m" }: { alerts: string[]; size?: "s" | "m" | "l" }) {
  if (alerts.length === 0) return null;
  return (
    <Row gap="4" wrap role="list" aria-label="Medical alerts">
      {alerts.map((alert) => (
        <Row key={alert} fit role="listitem">
          <Tag tone="danger" size={size} prefixIcon="warning" label={alert} />
        </Row>
      ))}
    </Row>
  );
}
```

```tsx components/AppHeader.tsx
"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Avatar, Column, Heading, Icon, Input, Row, Text, VisuallyHidden } from "@once-ui-system/core";
import { AlertTags } from "@/components/AlertTags";
import { CLINIC, PRODUCT, TODAY, USER, getOwner, patients } from "@/lib/data";

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2);
}

export function AppHeader() {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();

  const results = useMemo(() => {
    if (!q) return [];
    return patients
      .map((p) => ({ p, owner: getOwner(p.owner) }))
      .filter(({ p, owner }) => p.name.toLowerCase().includes(q) || (owner?.name.toLowerCase().includes(q) ?? false));
  }, [q]);

  const dateLabel = new Date(`${TODAY}T00:00:00Z`).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });

  return (
    <Row
      as="header"
      fillWidth
      background="surface"
      borderBottom
      paddingX="16"
      paddingY="12"
      gap="16"
      vertical="center"
      position="sticky"
      top="0"
      zIndex={5}
      s={{ gap: "8", paddingX: "12" }}>
      <VisuallyHidden as="a" href="#main" focusable>
        Skip to content
      </VisuallyHidden>
      <Link href="/" aria-label={`${PRODUCT} home`} style={{ textDecoration: "none", color: "inherit" }}>
        <Row gap="8" vertical="center" fit>
          <Row center radius="m" background="brand-medium" width="40" height="40" onBackground="brand-strong">
            <Icon name="paw" size="m" />
          </Row>
          <Column gap="0" s={{ hide: true }}>
            <Heading as="span" textVariant="heading-strong-m">
              {PRODUCT}
            </Heading>
            <Text onBackground="neutral-weak" as="span" textVariant="body-default-xs">
              {CLINIC}
            </Text>
          </Column>
        </Row>
      </Link>

      <Column
        flex={1}
        maxWidth="28rem"
        position="relative"
        marginX="auto"
        role="search"
        onKeyDown={(e: React.KeyboardEvent) => {
          if (e.key === "Escape") setQuery("");
        }}>
        <Input
          id="patient-search"
          label="Search patient or owner"
          size="s"
          prefix={<Icon name="search" size="s" onBackground="neutral-weak" />}
          value={query}
          onValueChange={setQuery}
          autoComplete="off"
        />
        <VisuallyHidden>
          <span role="status" aria-live="polite">
            {q ? `${results.length} ${results.length === 1 ? "match" : "matches"}` : ""}
          </span>
        </VisuallyHidden>
        {q && (
          <Column
            position="absolute"
            top="56"
            left="0"
            fillWidth
            background="overlay"
            border
            radius="l"
            shadow="l"
            padding="8"
            gap="4"
            maxHeight="24rem"
            overflowY="auto">
            {results.length === 0 ? (
              <Row padding="8">
                <Text onBackground="neutral-weak" textVariant="body-default-s">
                  No patient or owner matches “{query.trim()}”.
                </Text>
              </Row>
            ) : (
              results.map(({ p, owner }) => (
                <Link
                  key={p.id}
                  href={`/patients/${p.id}`}
                  onClick={() => setQuery("")}
                  style={{ textDecoration: "none", color: "inherit" }}>
                  <Column padding="8" radius="m" gap="4" background="neutral-alpha-weak">
                    <Row gap="8" vertical="center" wrap>
                      <Text textVariant="label-strong-m">{p.name}</Text>
                      <Text textVariant="body-default-s" onBackground="neutral-weak">
                        {p.species}, {p.breed} · Owner {owner?.name}
                      </Text>
                    </Row>
                    <AlertTags alerts={p.alerts} size="s" />
                  </Column>
                </Link>
              ))
            )}
          </Column>
        )}
      </Column>

      <Row gap="12" vertical="center" fit>
        <Column gap="0" horizontal="end" m={{ hide: true }}>
          <Text textVariant="label-strong-s">{dateLabel}</Text>
          <Text textVariant="body-default-xs" onBackground="neutral-weak">
            Front desk
          </Text>
        </Column>
        <Row gap="8" vertical="center" fit>
          <Avatar value={initials(USER.name)} size="m" />
          <Column gap="0" s={{ hide: true }}>
            <Text textVariant="label-strong-s">{USER.name}</Text>
            <Text textVariant="body-default-xs" onBackground="neutral-weak">
              {USER.role}
            </Text>
          </Column>
        </Row>
      </Row>
    </Row>
  );
}
```

```tsx components/BookDialog.tsx
"use client";

import { useState } from "react";
import { Button, Column, Dialog, Icon, Input, Row, Select, Text } from "@once-ui-system/core";
import { AlertTags } from "@/components/AlertTags";
import {
  type Appointment,
  findClash,
  getOwner,
  getPatient,
  getVet,
  patients,
  toClock,
  toMinutes,
  vets,
} from "@/lib/data";

const SLOTS = Array.from({ length: 37 }, (_, i) => toClock(8 * 60 + i * 15)); // 08:00 - 17:00
const DURATIONS = [15, 20, 30, 45, 60];

export interface NewBooking {
  patient: string;
  vet: string;
  start: string;
  minutes: number;
  reason: string;
}

export function BookDialog({
  open,
  onClose,
  appointments,
  onBook,
}: {
  open: boolean;
  onClose: () => void;
  appointments: Appointment[];
  onBook: (b: NewBooking) => void;
}) {
  const [patient, setPatient] = useState("");
  const [vet, setVet] = useState("");
  const [start, setStart] = useState("");
  const [minutes, setMinutes] = useState("20");
  const [reason, setReason] = useState("");

  const chosen = patient ? getPatient(patient) : undefined;
  const clash = vet && start ? findClash(appointments, vet, toMinutes(start), Number(minutes)) : undefined;
  const clashPatient = clash ? getPatient(clash.patient) : undefined;
  const ready = Boolean(patient && vet && start && !clash);

  const submit = () => {
    if (!ready) return;
    onBook({ patient, vet, start, minutes: Number(minutes), reason: reason.trim() || "Follow-up" });
    setPatient("");
    setVet("");
    setStart("");
    setMinutes("20");
    setReason("");
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Book an appointment"
      description="Pick the patient, the vet and a time. A vet cannot be booked twice at once."
      footer={
        <Row gap="8" horizontal="end" fillWidth wrap>
          <Button variant="tertiary" onClick={onClose}>
            Cancel
          </Button>
          <Button prefixIcon="calendar" disabled={!ready} onClick={submit}>
            Book appointment
          </Button>
        </Row>
      }>
      <Column gap="16" paddingTop="8">
        <Select
          id="book-patient"
          label="Patient"
          searchable
          value={patient}
          onValueChange={(v) => setPatient(String(v))}
          options={patients.map((p) => ({
            value: p.id,
            label: `${p.name} (${p.species}) · ${getOwner(p.owner)?.name ?? ""}`,
          }))}
        />
        {chosen && chosen.alerts.length > 0 && <AlertTags alerts={chosen.alerts} size="s" />}
        <Select
          id="book-vet"
          label="Vet"
          value={vet}
          onValueChange={(v) => setVet(String(v))}
          options={vets.map((v) => ({ value: v.id, label: `${v.name} · ${v.room}` }))}
        />
        <Row gap="12" s={{ direction: "column" }}>
          <Select
            id="book-time"
            label="Time"
            value={start}
            onValueChange={(v) => setStart(String(v))}
            options={SLOTS.map((s) => ({ value: s, label: s }))}
          />
          <Select
            id="book-duration"
            label="Length"
            value={minutes}
            onValueChange={(v) => setMinutes(String(v))}
            options={DURATIONS.map((d) => ({ value: String(d), label: `${d} minutes` }))}
          />
        </Row>
        <Input id="book-reason" label="Reason for visit" value={reason} onValueChange={setReason} />
        {clash && (
          <Row
            role="alert"
            gap="8"
            padding="12"
            radius="m"
            background="danger-alpha-weak"
            border="danger-alpha-medium"
            vertical="start">
            <Icon name="danger" onBackground="danger-strong" />
            <Text textVariant="body-default-s" onBackground="danger-strong">
              {getVet(clash.vet)?.name} already has {clashPatient?.name} from {clash.start} to{" "}
              {toClock(toMinutes(clash.start) + clash.minutes)}. Choose another time or another vet.
            </Text>
          </Row>
        )}
      </Column>
    </Dialog>
  );
}
```

```tsx components/Schedule.tsx
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Column,
  Grid,
  Heading,
  Icon,
  Row,
  SegmentedControl,
  Tag,
  Text,
  useToast,
} from "@once-ui-system/core";
import { AlertTags } from "@/components/AlertTags";
import { BookDialog, type NewBooking } from "@/components/BookDialog";
import {
  type Appointment,
  NOW_START,
  STATUS_LABEL,
  type Status,
  appointments as initialAppointments,
  getOwner,
  getPatient,
  getVet,
  toClock,
  toMinutes,
} from "@/lib/data";

const STATUS_TONE: Record<Status, "neutral" | "brand" | "accent" | "success" | "info"> = {
  booked: "neutral",
  checked_in: "accent",
  in_exam: "brand",
  done: "success",
  cancelled: "neutral",
};

const NEXT_ACTION: Partial<Record<Status, { label: string; next: Status; icon: "check" | "enter" | "checkbox" }>> = {
  booked: { label: "Check in", next: "checked_in", icon: "check" },
  checked_in: { label: "Send to exam", next: "in_exam", icon: "enter" },
  in_exam: { label: "Mark done", next: "done", icon: "checkbox" },
};

function waitLabel(min: number) {
  if (min < 1) return "just now";
  if (min < 60) return `${min} min`;
  return `${Math.floor(min / 60)} h ${min % 60} min`;
}

function AppointmentCard({
  a,
  now,
  onAdvance,
}: {
  a: Appointment;
  now: number;
  onAdvance: (id: string, next: Status) => void;
}) {
  const patient = getPatient(a.patient);
  const owner = patient ? getOwner(patient.owner) : undefined;
  const vet = getVet(a.vet);
  const action = NEXT_ACTION[a.status];
  const end = toClock(toMinutes(a.start) + a.minutes);
  const cancelled = a.status === "cancelled";
  const late = a.status === "booked" && toMinutes(a.start) < now;

  return (
    <Column
      as="li"
      background={a.urgent ? "danger-alpha-weak" : "surface"}
      border={a.urgent ? "danger-strong" : true}
      borderWidth={a.urgent ? 2 : 1}
      radius="l"
      padding="16"
      gap="12"
      opacity={cancelled ? 60 : 100}
      style={{ listStyle: "none" }}>
      <Row gap="16" vertical="start" s={{ direction: "column", gap: "12" }}>
        <Column fit gap="2" minWidth="5rem">
          <Text textVariant="heading-strong-l">{a.start}</Text>
          <Text textVariant="body-default-xs" onBackground="neutral-weak">
            to {end} · {a.minutes} min
          </Text>
        </Column>

        <Column flex={1} gap="8">
          <Row gap="8" vertical="center" wrap>
            {patient && (
              <Link href={`/patients/${patient.id}`} style={{ color: "inherit" }}>
                <Text textVariant="heading-strong-m">{patient.name}</Text>
              </Link>
            )}
            <Text textVariant="body-default-s" onBackground="neutral-weak">
              {patient?.species}, {patient?.breed}
            </Text>
            {a.urgent && <Tag tone="danger" prefixIcon="bolt" label="Urgent" />}
          </Row>
          <Text textVariant="body-default-m">
            {cancelled ? <s>{a.reason}</s> : a.reason}
          </Text>
          <Text textVariant="body-default-s" onBackground="neutral-weak">
            Owner {owner?.name} · {owner?.phone}
          </Text>
          {patient && <AlertTags alerts={patient.alerts} size="s" />}
        </Column>

        <Column gap="8" horizontal="end" s={{ horizontal: "start", direction: "row", wrap: true, vertical: "center" }}>
          <Row gap="8" vertical="center" wrap>
            {late && <Tag tone="warning" label="Running late" prefixIcon="time" />}
            <Tag tone={STATUS_TONE[a.status]} dot label={STATUS_LABEL[a.status]} />
          </Row>
          <Text textVariant="body-default-xs" onBackground="neutral-weak">
            {vet?.name} · {vet?.room}
          </Text>
          {action && (
            <Button
              size="m"
              variant={a.status === "booked" ? "primary" : "secondary"}
              prefixIcon={action.icon}
              onClick={() => onAdvance(a.id, action.next)}>
              {action.label}
            </Button>
          )}
        </Column>
      </Row>
    </Column>
  );
}

export function Schedule() {
  const [list, setList] = useState<Appointment[]>(initialAppointments);
  const [now, setNow] = useState(NOW_START);
  const [view, setView] = useState("time");
  const [bookOpen, setBookOpen] = useState(false);
  const { addToast } = useToast();

  // The counter clock runs live from the demo start time.
  useEffect(() => {
    const started = Date.now();
    const id = window.setInterval(() => setNow(NOW_START + Math.floor((Date.now() - started) / 60000)), 15000);
    return () => window.clearInterval(id);
  }, []);

  const advance = (id: string, next: Status) => {
    const target = list.find((a) => a.id === id);
    setList((cur) =>
      cur.map((a) => (a.id === id ? { ...a, status: next, checkedInAt: next === "checked_in" ? now : a.checkedInAt } : a)),
    );
    const p = target ? getPatient(target.patient) : undefined;
    if (next === "checked_in" && p) {
      addToast({ tone: "success", message: `${p.name} is checked in and on the waiting list.` });
    }
  };

  const book = (b: NewBooking) => {
    const id = `a-${String(list.length + 1).padStart(2, "0")}`;
    setList((cur) => [...cur, { id, status: "booked", ...b }]);
    setBookOpen(false);
    const p = getPatient(b.patient);
    addToast({ tone: "success", message: `${p?.name} booked with ${getVet(b.vet)?.name} at ${b.start}.` });
  };

  const sorted = useMemo(
    () => [...list].sort((x, y) => toMinutes(x.start) - toMinutes(y.start) || x.vet.localeCompare(y.vet)),
    [list],
  );
  const waiting = useMemo(
    () =>
      list
        .filter((a) => a.status === "checked_in")
        .sort((x, y) => (x.checkedInAt ?? 0) - (y.checkedInAt ?? 0)),
    [list],
  );
  const inExam = list.filter((a) => a.status === "in_exam").length;
  const upcoming = sorted.filter((a) => a.status === "booked");
  const next = upcoming.find((a) => toMinutes(a.start) >= now) ?? upcoming[0];
  const nextPatient = next ? getPatient(next.patient) : undefined;

  const dayStats = [
    { label: "Waiting now", value: String(waiting.length), icon: "time" as const },
    { label: "In exam", value: String(inExam), icon: "paw" as const },
    { label: "Still to arrive", value: String(upcoming.length), icon: "calendar" as const },
    {
      label: "Next arrival",
      value: next ? `${nextPatient?.name} · ${next.start}` : "None",
      icon: "bell" as const,
    },
  ];

  return (
    <Column as="main" id="main" fillWidth horizontal="center" padding="24" s={{ padding: "12" }}>
      <Column fillWidth maxWidth="xl" gap="24">
        <Row horizontal="between" vertical="end" gap="16" wrap>
          <Column gap="4">
            <Heading as="h1" textVariant="display-strong-xs">
              Today’s schedule
            </Heading>
            <Text textVariant="body-default-m" onBackground="neutral-weak">
              Counter time {toClock(now)} · {list.filter((a) => a.status !== "cancelled").length} appointments across
              three vets
            </Text>
          </Column>
          <Button size="l" prefixIcon="plus" onClick={() => setBookOpen(true)}>
            Book appointment
          </Button>
        </Row>

        <Grid columns="4" m={{ columns: "2" }} gap="12">
          {dayStats.map((s) => (
            <Column key={s.label} background="surface" border radius="l" padding="16" gap="8">
              <Row gap="8" vertical="center" onBackground="neutral-weak">
                <Icon name={s.icon} size="s" />
                <Text textVariant="label-default-s">{s.label}</Text>
              </Row>
              <Text textVariant="heading-strong-l">{s.value}</Text>
            </Column>
          ))}
        </Grid>

        <Row gap="24" vertical="start" m={{ direction: "column" }}>
          <Column
            as="section"
            aria-labelledby="waiting-title"
            background="surface"
            border
            radius="l"
            padding="16"
            gap="16"
            width="22rem"
            m={{ fillWidth: true, width: "auto" }}
            fitHeight>
            <Row horizontal="between" vertical="center">
              <Heading as="h2" id="waiting-title" textVariant="heading-strong-l">
                Waiting room
              </Heading>
              <Tag tone={waiting.length ? "accent" : "neutral"} label={`${waiting.length} waiting`} />
            </Row>
            {waiting.length === 0 ? (
              <Text textVariant="body-default-s" onBackground="neutral-weak">
                Nobody is waiting. Check patients in as they arrive.
              </Text>
            ) : (
              <Column as="ol" gap="8" margin="0" padding="0" style={{ listStyle: "none" }}>
                {waiting.map((a, i) => {
                  const p = getPatient(a.patient);
                  const mins = Math.max(0, now - (a.checkedInAt ?? now));
                  return (
                    <Column
                      as="li"
                      key={a.id}
                      padding="12"
                      radius="m"
                      gap="8"
                      background="neutral-alpha-weak">
                      <Row horizontal="between" vertical="center" gap="8">
                        <Row gap="8" vertical="center">
                          <Text textVariant="label-strong-s" onBackground="neutral-weak">
                            {i + 1}
                          </Text>
                          <Link href={`/patients/${a.patient}`} style={{ color: "inherit" }}>
                            <Text textVariant="heading-strong-s">{p?.name}</Text>
                          </Link>
                        </Row>
                        <Tag
                          tone={mins >= 30 ? "danger" : mins >= 15 ? "warning" : "neutral"}
                          prefixIcon="time"
                          label={waitLabel(mins)}
                        />
                      </Row>
                      <Text textVariant="body-default-s" onBackground="neutral-weak">
                        {a.reason} · {getVet(a.vet)?.name}, {getVet(a.vet)?.room}
                      </Text>
                      {p && <AlertTags alerts={p.alerts} size="s" />}
                    </Column>
                  );
                })}
              </Column>
            )}
          </Column>

          <Column as="section" aria-labelledby="sched-title" flex={1} gap="16" fillWidth>
            <Row horizontal="between" vertical="center" gap="12" wrap>
              <Heading as="h2" id="sched-title" textVariant="heading-strong-l">
                All appointments
              </Heading>
              <Row maxWidth="20rem" fillWidth>
                <SegmentedControl
                  value={view}
                  onValueChange={setView}
                  buttons={[
                    { value: "time", label: "By time" },
                    { value: "vet", label: "By vet" },
                  ]}
                />
              </Row>
            </Row>

            {view === "time" ? (
              <Column as="ul" gap="12" margin="0" padding="0">
                {sorted.map((a) => (
                  <AppointmentCard key={a.id} a={a} now={now} onAdvance={advance} />
                ))}
              </Column>
            ) : (
              <Column gap="24">
                {["v-1", "v-2", "v-3"].map((vid) => {
                  const v = getVet(vid);
                  return (
                    <Column key={vid} gap="12">
                      <Row gap="8" vertical="center">
                        <Icon name="person" size="s" />
                        <Text textVariant="label-strong-m">
                          {v?.name} · {v?.room}
                        </Text>
                      </Row>
                      <Column as="ul" gap="12" margin="0" padding="0">
                        {sorted
                          .filter((a) => a.vet === vid)
                          .map((a) => (
                            <AppointmentCard key={a.id} a={a} now={now} onAdvance={advance} />
                          ))}
                      </Column>
                    </Column>
                  );
                })}
              </Column>
            )}
          </Column>
        </Row>
      </Column>

      <BookDialog open={bookOpen} onClose={() => setBookOpen(false)} appointments={list} onBook={book} />
    </Column>
  );
}
```

```tsx components/WeightTrend.tsx
import { Column, Grid, Row, Text } from "@once-ui-system/core";
import { daysBetween, formatDate } from "@/lib/data";

const W = 600;
const H = 180;
const PAD = 16;

export function WeightTrend({ points }: { points: { date: string; kg: number }[] }) {
  if (points.length === 0) return null;
  const first = points[0];
  const last = points[points.length - 1];
  const span = Math.max(1, daysBetween(first.date, last.date));
  const kgs = points.map((p) => p.kg);
  const lo = Math.min(...kgs) - 0.6;
  const hi = Math.max(...kgs) + 0.6;
  const xy = points.map((p) => ({
    x: PAD + (daysBetween(first.date, p.date) / span) * (W - PAD * 2),
    y: PAD + (1 - (p.kg - lo) / (hi - lo)) * (H - PAD * 2),
  }));
  const line = xy.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const area = `${PAD},${H - PAD} ${line} ${W - PAD},${H - PAD}`;
  const change = last.kg - first.kg;
  const pct = (change / first.kg) * 100;

  return (
    <Column gap="16">
      <Row gap="12" vertical="end" wrap>
        <Text textVariant="display-strong-xs">{last.kg.toFixed(1)} kg</Text>
        <Text textVariant="label-strong-m" onBackground="warning-strong">
          {change.toFixed(1)} kg ({pct.toFixed(1)}%) since {formatDate(first.date)}
        </Text>
      </Row>
      <Row fillWidth onBackground="brand-strong">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          width="100%"
          role="img"
          aria-label={`Weight over ${points.length} visits, from ${first.kg} kg on ${formatDate(first.date)} to ${last.kg} kg on ${formatDate(last.date)}`}
          style={{ display: "block", height: "auto" }}>
          <polygon points={area} fill="currentColor" opacity={0.12} />
          <polyline points={line} fill="none" stroke="currentColor" strokeWidth={3} strokeLinejoin="round" strokeLinecap="round" />
          {xy.map((p, i) => (
            <circle
              key={points[i].date}
              cx={p.x}
              cy={p.y}
              r={i === xy.length - 1 ? 7 : 5}
              fill="currentColor"
              stroke="var(--surface-background)"
              strokeWidth={2}
            />
          ))}
        </svg>
      </Row>
      <Grid columns="6" s={{ columns: "3" }} gap="8" as="ol" margin="0" padding="0" style={{ listStyle: "none" }}>
        {points.map((p) => (
          <Column as="li" key={p.date} gap="2">
            <Text textVariant="label-strong-m">{p.kg.toFixed(1)} kg</Text>
            <Text textVariant="body-default-xs" onBackground="neutral-weak">
              {formatDate(p.date)}
            </Text>
          </Column>
        ))}
      </Grid>
    </Column>
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

export const CLINIC = "Hillside Veterinary Clinic";
export const PRODUCT = "Pawpoint";
export const TODAY = "2026-11-12";
/** The counter clock starts here (minutes since midnight) and then runs live. */
export const NOW_START = 9 * 60 + 52;

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

export const appointments: Appointment[] = [
  { id: "a-01", patient: "p-101", vet: "v-1", start: "08:30", minutes: 20, reason: "Annual vaccination", status: "done" },
  { id: "a-02", patient: "p-104", vet: "v-2", start: "08:30", minutes: 30, reason: "Kidney panel recheck", status: "done" },
  { id: "a-03", patient: "p-108", vet: "v-3", start: "08:00", minutes: 120, reason: "Soft palate surgery", status: "in_exam" },
  { id: "a-04", patient: "p-102", vet: "v-1", start: "09:00", minutes: 30, reason: "Limping, left hind leg", status: "in_exam" },
  { id: "a-05", patient: "p-107", vet: "v-2", start: "09:15", minutes: 20, reason: "Glucose curve", status: "checked_in", checkedInAt: 9 * 60 + 8 },
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

export const STATUS_LABEL: Record<Status, string> = {
  booked: "Booked",
  checked_in: "Checked in",
  in_exam: "In exam",
  done: "Done",
  cancelled: "Cancelled",
};

export const getPatient = (id: string) => patients.find((p) => p.id === id);
export const getOwner = (id: string) => owners.find((o) => o.id === id);
export const getVet = (id: string) => vets.find((v) => v.id === id);

export function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}
export function toClock(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** Whole days from ISO date a to ISO date b (UTC, so no DST drift). */
export function daysBetween(a: string, b: string): number {
  return Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86400000);
}

export function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function ageLabel(born: string, today: string = TODAY): string {
  const b = new Date(`${born}T00:00:00Z`);
  const t = new Date(`${today}T00:00:00Z`);
  let years = t.getUTCFullYear() - b.getUTCFullYear();
  let months = t.getUTCMonth() - b.getUTCMonth();
  if (t.getUTCDate() < b.getUTCDate()) months -= 1;
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  if (years <= 0) return `${months} mo`;
  return `${years} yr${years === 1 ? "" : "s"}${months ? `, ${months} mo` : ""}`;
}

/** Clash rule: two live bookings for one vet may not overlap in time. */
export function findClash(
  list: Appointment[],
  vet: string,
  start: number,
  minutes: number,
): Appointment | undefined {
  return list.find((a) => {
    if (a.vet !== vet || a.status === "cancelled") return false;
    const s = toMinutes(a.start);
    return start < s + a.minutes && s < start + minutes;
  });
}
```

