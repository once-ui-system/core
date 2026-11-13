```tsx app/layout.tsx
import "@once-ui-system/core/css/styles.css";
import "@once-ui-system/core/css/tokens.css";
import "./fonts.css";

import type { Metadata } from "next";
import { Column, Flex } from "@once-ui-system/core";
import { Providers } from "./providers";
import { AppShell } from "@/components/AppShell";

export const metadata: Metadata = {
  title: "Pawpoint | Hillside Veterinary Clinic",
  description: "Front-desk and records software for Hillside Veterinary Clinic.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <Flex as="html" lang="en" suppressHydrationWarning>
      <Column as="body" background="page" fillWidth margin="0" padding="0" minHeight="100vh">
        <Providers>
          <AppShell>{children}</AppShell>
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
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PatientRecord } from "@/components/PatientRecord";
import { PATIENTS, getPatient } from "@/lib/data";

export function generateStaticParams() {
  return PATIENTS.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const patient = getPatient(id);
  return { title: patient ? `${patient.name} | Pawpoint` : "Patient | Pawpoint" };
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!getPatient(id)) notFound();
  return <PatientRecord id={id} />;
}
```

```tsx components/AlertTags.tsx
import { Row, Tag, VisuallyHidden } from "@once-ui-system/core";

/** Medical alerts, always in the danger tone with a warning icon and a spoken prefix. */
export function AlertTags({ alerts, size = "m" }: { alerts: string[]; size?: "s" | "m" | "l" }) {
  if (alerts.length === 0) return null;
  return (
    <Row gap="4" wrap role="group" aria-label="Medical alerts">
      <VisuallyHidden>Medical alert:</VisuallyHidden>
      {alerts.map((alert) => (
        <Tag key={alert} tone="danger" size={size} prefixIcon="warning" label={alert} />
      ))}
    </Row>
  );
}
```

```tsx components/AppShell.tsx
import Link from "next/link";
import { Avatar, Column, Icon, Row, Text, VisuallyHidden } from "@once-ui-system/core";
import { USER } from "@/lib/data";
import { PatientSearch } from "./PatientSearch";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <Column fillWidth minHeight="100vh">
      <VisuallyHidden as="a" href="#main" focusable>
        Skip to content
      </VisuallyHidden>
      <Column as="header" fillWidth background="surface" borderBottom horizontal="center">
        <Row fillWidth maxWidth="xl" paddingX="16" paddingY="12" gap="16" vertical="center" horizontal="between">
          <Link href="/" style={{ color: "inherit", textDecoration: "none" }}>
            <Row gap="12" vertical="center">
              <Row background="brand-alpha-medium" radius="m" center width={40} height={40}>
                <Icon name="paw" size="m" onBackground="brand-strong" />
              </Row>
              <Column>
                <Text textVariant="heading-strong-m">Pawpoint</Text>
                <Text textVariant="label-default-xs" onBackground="neutral-weak" s={{ hide: true }}>
                  Hillside Veterinary Clinic
                </Text>
              </Column>
            </Row>
          </Link>
          <Row gap="12" vertical="center">
            <Column horizontal="end" s={{ hide: true }}>
              <Text textVariant="label-strong-s">{USER.name}</Text>
              <Text textVariant="label-default-xs" onBackground="neutral-weak">
                {USER.role}
              </Text>
            </Column>
            <Avatar value="RL" size="m" aria-label={`${USER.name}, ${USER.role}`} />
          </Row>
        </Row>
      </Column>
      <Column as="main" id="main" fillWidth horizontal="center" paddingX="16" paddingY="24" flex={1}>
        <Column fillWidth maxWidth="xl" gap="24">
          <PatientSearch />
          {children}
        </Column>
      </Column>
    </Column>
  );
}
```

```tsx components/BookDialog.tsx
"use client";

import { useMemo, useState } from "react";
import { Button, Column, Dialog, Input, Row, Select, Text } from "@once-ui-system/core";
import {
  PATIENTS,
  SLOTS,
  VETS,
  endTime,
  findClash,
  getOwner,
  getPatient,
  getVet,
  nextFreeSlot,
  type Appointment,
} from "@/lib/data";
import { AlertTags } from "./AlertTags";

const DURATIONS = [15, 20, 30, 45, 60];
const one = (v: string | string[]) => (Array.isArray(v) ? (v[0] ?? "") : v);

export function BookDialog({
  open,
  onClose,
  appointments,
  now,
  onBook,
}: {
  open: boolean;
  onClose: () => void;
  appointments: Appointment[];
  now: number;
  onBook: (a: Appointment) => void;
}) {
  const [patientId, setPatientId] = useState("");
  const [vetId, setVetId] = useState("");
  const [start, setStart] = useState("");
  const [minutes, setMinutes] = useState("20");
  const [reason, setReason] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const patient = getPatient(patientId);
  const mins = Number(minutes);
  const clash = useMemo(
    () => (vetId && start ? findClash(appointments, vetId, patientId, start, mins) : null),
    [appointments, vetId, patientId, start, mins],
  );
  const suggestion = useMemo(
    () => (clash && vetId ? nextFreeSlot(appointments, vetId, patientId, mins, now) : null),
    [clash, appointments, vetId, patientId, mins, now],
  );

  const clashText = clash
    ? clash.kind === "vet"
      ? `${getVet(clash.with.vet)?.name} is already booked ${clash.with.start} to ${endTime(clash.with.start, clash.with.minutes)} (${getPatient(clash.with.patient)?.name}, ${clash.with.reason}).`
      : `${patient?.name} already has an appointment ${clash.with.start} to ${endTime(clash.with.start, clash.with.minutes)} with ${getVet(clash.with.vet)?.name}.`
    : "";

  const reset = () => {
    setPatientId("");
    setVetId("");
    setStart("");
    setMinutes("20");
    setReason("");
    setSubmitted(false);
  };
  const close = () => {
    reset();
    onClose();
  };

  const submit = () => {
    setSubmitted(true);
    if (!patientId || !vetId || !start || clash) return;
    onBook({
      id: `a-new-${appointments.length + 1}`,
      patient: patientId,
      vet: vetId,
      start,
      minutes: mins,
      reason: reason.trim() || "Follow-up",
      status: "booked",
      isNew: true,
    });
    close();
  };

  return (
    <Dialog
      open={open}
      onClose={close}
      title="Book an appointment"
      description="Pick a patient, a vet and a time. A vet cannot be booked twice at the same time."
      footer={
        <Row gap="8" horizontal="end" fillWidth>
          <Button variant="tertiary" onClick={close}>
            Cancel
          </Button>
          <Button prefixIcon="calendar" onClick={submit}>
            Book appointment
          </Button>
        </Row>
      }
    >
      <Column
        as="form"
        gap="16"
        onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
          e.preventDefault();
          submit();
        }}
        noValidate
      >
        <Select
          id="book-patient"
          label="Patient"
          searchable
          value={patientId}
          onValueChange={(v) => setPatientId(one(v))}
          options={PATIENTS.map((p) => ({
            value: p.id,
            label: `${p.name} (${p.species}, ${getOwner(p.owner)?.name})`,
          }))}
          error={submitted && !patientId}
          errorMessage={submitted && !patientId ? "Choose a patient" : undefined}
        />
        {patient && patient.alerts.length > 0 && (
          <Column gap="4" padding="12" radius="m" background="danger-alpha-weak" border="danger-medium">
            <Text textVariant="label-strong-s" onBackground="danger-strong">
              Medical alerts for {patient.name}
            </Text>
            <AlertTags alerts={patient.alerts} size="m" />
          </Column>
        )}
        <Select
          id="book-vet"
          label="Vet"
          value={vetId}
          onValueChange={(v) => setVetId(one(v))}
          options={VETS.map((v) => ({ value: v.id, label: `${v.name} (${v.room})` }))}
          error={submitted && !vetId}
          errorMessage={submitted && !vetId ? "Choose a vet" : undefined}
        />
        <Row gap="12" s={{ direction: "column" }}>
          <Select
            id="book-time"
            label="Time"
            value={start}
            onValueChange={(v) => setStart(one(v))}
            options={SLOTS.map((s) => ({ value: s, label: s }))}
            error={Boolean(clash) || (submitted && !start)}
            errorMessage={submitted && !start ? "Choose a time" : undefined}
          />
          <Select
            id="book-length"
            label="Length"
            value={minutes}
            onValueChange={(v) => setMinutes(one(v))}
            options={DURATIONS.map((d) => ({ value: String(d), label: `${d} minutes` }))}
          />
        </Row>
        {clash && (
          <Column role="alert" gap="8" padding="12" radius="m" background="danger-alpha-weak" border="danger-medium">
            <Text textVariant="label-strong-s" onBackground="danger-strong">
              That time clashes with an existing booking
            </Text>
            <Text textVariant="body-default-s">{clashText}</Text>
            {suggestion && (
              <Row>
                <Button size="s" variant="secondary" onClick={() => setStart(suggestion)}>
                  Use next free time, {suggestion}
                </Button>
              </Row>
            )}
          </Column>
        )}
        <Input id="book-reason" label="Reason for visit" value={reason} onValueChange={setReason} />
      </Column>
    </Dialog>
  );
}
```

```tsx components/PatientRecord.tsx
"use client";

import Link from "next/link";
import { Avatar, Button, Column, Grid, Heading, Icon, Row, Tag, Text } from "@once-ui-system/core";
import { LineChart } from "@once-ui-system/core/data";
import {
  APPOINTMENTS,
  RECORDS,
  STATUS_LABEL,
  TODAY,
  ageLabel,
  daysBetween,
  endTime,
  fmtDate,
  fmtShortDate,
  fmtUsd,
  getOwner,
  getPatient,
  getVet,
  telHref,
} from "@/lib/data";

function Panel({ title, id, aside, children }: { title: string; id: string; aside?: React.ReactNode; children: React.ReactNode }) {
  return (
    <Column as="section" aria-labelledby={id} background="surface" border radius="l" padding="20" gap="16" fillWidth>
      <Row horizontal="between" vertical="center" gap="8" wrap>
        <Heading as="h2" id={id} textVariant="heading-strong-l">
          {title}
        </Heading>
        {aside}
      </Row>
      {children}
    </Column>
  );
}

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Column gap="2">
      <Text textVariant="label-default-xs" onBackground="neutral-weak">
        {label}
      </Text>
      <Text textVariant="body-strong-m">{children}</Text>
    </Column>
  );
}

export function PatientRecord({ id }: { id: string }) {
  const patient = getPatient(id);
  if (!patient) return null;
  const owner = getOwner(patient.owner);
  const record = RECORDS[id];
  const today = APPOINTMENTS.filter((a) => a.patient === id).sort((a, b) => a.start.localeCompare(b.start));

  const vaccinations = record
    ? record.vaccinations
        .map((v) => ({ ...v, days: daysBetween(TODAY, v.due) }))
        .sort((a, b) => a.days - b.days)
    : [];
  const overdue = vaccinations.filter((v) => v.days < 0);

  const weights = record?.weights_kg ?? [];
  const first = weights[0];
  const last = weights[weights.length - 1];
  const change = first && last ? last.kg - first.kg : 0;
  const pct = first ? (change / first.kg) * 100 : 0;

  return (
    <Column gap="24">
      <Row>
        <Button href="/" variant="tertiary" size="s" prefixIcon="chevronLeft">
          Back to schedule
        </Button>
      </Row>

      <Column background="surface" border radius="l" padding="24" gap="20">
        <Row gap="24" horizontal="between" vertical="start" wrap>
          <Row gap="16" vertical="center">
            <Avatar value={patient.name.slice(0, 1)} size="l" />
            <Column gap="4">
              <Text textVariant="label-default-s" onBackground="neutral-weak">
                Patient {patient.id}
              </Text>
              <Heading as="h1" textVariant="display-strong-xs">
                {patient.name}
              </Heading>
              <Text onBackground="neutral-medium">
                {patient.species}, {patient.breed}
              </Text>
            </Column>
          </Row>
          <Column gap="4">
            <Text textVariant="label-default-xs" onBackground="neutral-weak">
              Owner
            </Text>
            <Text textVariant="heading-strong-m">{owner?.name}</Text>
            {owner && (
              <Button href={telHref(owner.phone)} variant="secondary" size="m" prefixIcon="phone">
                {owner.phone}
              </Button>
            )}
          </Column>
        </Row>
        <Grid columns="4" s={{ columns: "2" }} gap="16">
          <Fact label="Born">
            {fmtDate(patient.born)} ({ageLabel(patient.born)})
          </Fact>
          <Fact label="Sex">{patient.sex}</Fact>
          <Fact label="Species">{patient.species}</Fact>
          <Fact label="Last weight">{last ? `${last.kg} kg` : "Not recorded"}</Fact>
        </Grid>
      </Column>

      {patient.alerts.length > 0 && (
        <Column
          as="section"
          aria-labelledby="alerts-title"
          role="region"
          background="danger-alpha-weak"
          border="danger-strong"
          borderWidth={2}
          radius="l"
          padding="20"
          gap="12"
        >
          <Row gap="8" vertical="center">
            <Icon name="warning" size="m" onBackground="danger-strong" />
            <Heading as="h2" id="alerts-title" textVariant="heading-strong-l" onBackground="danger-strong">
              Medical alerts ({patient.alerts.length})
            </Heading>
          </Row>
          <Column as="ul" gap="8" margin="0" padding="0">
            {patient.alerts.map((alert) => (
              <Row as="li" key={alert} gap="12" vertical="center" paddingX="16" paddingY="12" radius="m" background="danger-alpha-medium">
                <Icon name="danger" size="m" onBackground="danger-strong" />
                <Text textVariant="heading-strong-m" onBackground="danger-strong">
                  {alert}
                </Text>
              </Row>
            ))}
          </Column>
          {overdue.length > 0 && (
            <Text textVariant="label-strong-s" onBackground="danger-strong">
              Also overdue: {overdue.map((v) => v.name).join(", ")} vaccination
              {overdue.length > 1 ? "s" : ""}
            </Text>
          )}
        </Column>
      )}

      <Row gap="24" vertical="start" m={{ direction: "column" }}>
        <Column gap="24" fillWidth maxWidth="28rem" m={{ maxWidth: "100%" }}>
          <Panel title="Today" id="today-title">
            {today.length === 0 ? (
              <Text onBackground="neutral-weak">No appointment today.</Text>
            ) : (
              <Column as="ul" gap="12" margin="0" padding="0">
                {today.map((a) => (
                  <Column as="li" key={a.id} gap="4">
                    <Row horizontal="between" vertical="center" gap="8" wrap>
                      <Text textVariant="label-strong-m">
                        {a.start} to {endTime(a.start, a.minutes)}
                      </Text>
                      <Tag
                        tone={a.status === "done" ? "success" : a.status === "checked_in" ? "warning" : a.status === "in_exam" ? "accent" : "neutral"}
                        label={STATUS_LABEL[a.status]}
                      />
                    </Row>
                    <Text textVariant="body-default-s" onBackground="neutral-medium">
                      {a.reason} · {getVet(a.vet)?.name}, {getVet(a.vet)?.room}
                    </Text>
                  </Column>
                ))}
              </Column>
            )}
          </Panel>

          <Panel
            title="Vaccinations"
            id="vacc-title"
            aside={
              overdue.length > 0 ? (
                <Tag tone="danger" prefixIcon="warning" label={`${overdue.length} overdue`} />
              ) : undefined
            }
          >
            {vaccinations.length === 0 ? (
              <Text onBackground="neutral-weak">No vaccinations on file.</Text>
            ) : (
              <Column as="ul" gap="8" margin="0" padding="0">
                {vaccinations.map((v) => {
                  const late = v.days < 0;
                  return (
                    <Row
                      as="li"
                      key={v.name}
                      gap="12"
                      padding="12"
                      radius="m"
                      horizontal="between"
                      vertical="center"
                      wrap
                      background={late ? "danger-alpha-weak" : "neutral-alpha-weak"}
                      border={late ? "danger-medium" : "transparent"}
                    >
                      <Column gap="2">
                        <Text textVariant="label-strong-m">{v.name}</Text>
                        <Text textVariant="body-default-s" onBackground="neutral-weak">
                          Given {fmtDate(v.given)} · due {fmtDate(v.due)}
                        </Text>
                      </Column>
                      {late ? (
                        <Tag tone="danger" prefixIcon="warning" label={`Overdue ${-v.days} days`} />
                      ) : (
                        <Tag tone="success" prefixIcon="check" label={v.days < 90 ? `Due in ${v.days} days` : "Up to date"} />
                      )}
                    </Row>
                  );
                })}
              </Column>
            )}
          </Panel>

          <Panel title="Current medications" id="meds-title">
            {!record || record.medications.length === 0 ? (
              <Text onBackground="neutral-weak">No current medications.</Text>
            ) : (
              <Column as="ul" gap="12" margin="0" padding="0">
                {record.medications.map((m) => (
                  <Row as="li" key={m.name} gap="12" vertical="start">
                    <Icon name="clipboard" size="s" onBackground="brand-medium" />
                    <Column gap="2">
                      <Text textVariant="label-strong-m">{m.name}</Text>
                      <Text textVariant="body-default-s" onBackground="neutral-medium">
                        {m.dose} · since {fmtDate(m.since)}
                      </Text>
                    </Column>
                  </Row>
                ))}
              </Column>
            )}
          </Panel>
        </Column>

        <Column gap="24" fillWidth>
          <Panel title="Weight trend" id="weight-title">
            {weights.length === 0 ? (
              <Text onBackground="neutral-weak">No weights recorded yet.</Text>
            ) : (
              <>
                <Row gap="32" wrap>
                  <Fact label="Latest">{last.kg} kg</Fact>
                  <Fact label={`Since ${fmtDate(first.date)}`}>
                    {change > 0 ? "+" : "−"}
                    {Math.abs(change).toFixed(1)} kg ({Math.abs(pct).toFixed(0)}%)
                  </Fact>
                  <Fact label="Weighed">{weights.length} visits</Fact>
                </Row>
                <LineChart
                  fillWidth
                  height="18rem"
                  curve="monotone"
                  aria-label="Weight in kilograms at each visit"
                  summary={`Weight fell from ${first.kg} kg on ${fmtDate(first.date)} to ${last.kg} kg on ${fmtDate(last.date)}.`}
                  data={weights.map((w) => ({ date: fmtShortDate(w.date), kg: w.kg }))}
                  series={[{ key: "kg", label: "Weight (kg)" }]}
                  legend={{ display: false }}
                />
              </>
            )}
          </Panel>

          <Panel title="Visit history" id="visits-title">
            {!record || record.visits.length === 0 ? (
              <Text onBackground="neutral-weak">No past visits on file.</Text>
            ) : (
              <Column as="ol" gap="0" margin="0" padding="0">
                {record.visits.map((v, i) => (
                  <Column
                    as="li"
                    key={v.date}
                    gap="4"
                    paddingY="16"
                    borderTop={i > 0}
                  >
                    <Row horizontal="between" vertical="center" gap="8" wrap>
                      <Row gap="8" vertical="center" wrap>
                        <Text textVariant="label-strong-m">{fmtDate(v.date)}</Text>
                        <Text textVariant="body-default-m">{v.reason}</Text>
                      </Row>
                      <Text textVariant="label-default-s" onBackground="neutral-weak">
                        {fmtUsd(v.invoice_usd)}
                      </Text>
                    </Row>
                    <Text textVariant="label-default-s" onBackground="neutral-weak">
                      {getVet(v.vet)?.name}
                    </Text>
                    <Text textVariant="body-default-m" onBackground="neutral-medium">
                      {v.notes}
                    </Text>
                  </Column>
                ))}
              </Column>
            )}
          </Panel>
        </Column>
      </Row>
      <Text textVariant="body-default-s" onBackground="neutral-weak">
        <Link href="/" style={{ color: "inherit" }}>
          Return to today&apos;s schedule
        </Link>
      </Text>
    </Column>
  );
}
```

```tsx components/PatientSearch.tsx
"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, Column, Icon, Input, Row, Text } from "@once-ui-system/core";
import { OWNERS, PATIENTS, getOwner } from "@/lib/data";
import { AlertTags } from "./AlertTags";

export function PatientSearch() {
  const router = useRouter();
  const box = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return PATIENTS.filter((p) => {
      const owner = OWNERS.find((o) => o.id === p.owner);
      return (
        p.name.toLowerCase().includes(q) ||
        (owner ? owner.name.toLowerCase().includes(q) : false)
      );
    });
  }, [query]);

  const showPanel = open && query.trim().length > 0;

  return (
    <Column
      ref={box}
      position="relative"
      fillWidth
      maxWidth="m"
      onBlur={(e: React.FocusEvent<HTMLDivElement>) => {
        if (!box.current?.contains(e.relatedTarget as Node | null)) setOpen(false);
      }}
      onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === "Escape") {
          setOpen(false);
          setQuery("");
        }
      }}
    >
      <Input
        id="patient-search"
        type="search"
        label="Search patient or owner"
        size="s"
        prefix={<Icon name="search" size="s" onBackground="neutral-weak" />}
        value={query}
        autoComplete="off"
        onValueChange={(v) => {
          setQuery(v);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
          if (e.key === "Enter" && results.length > 0) {
            e.preventDefault();
            setOpen(false);
            router.push(`/patients/${results[0].id}`);
          }
        }}
        aria-controls={showPanel ? "patient-search-results" : undefined}
      />
      {showPanel && (
        <Column
          id="patient-search-results"
          position="absolute"
          top="48"
          left="0"
          fillWidth
          zIndex={10}
          background="overlay"
          border
          radius="l"
          shadow="l"
          padding="8"
          gap="4"
          maxHeight="24rem"
          overflowY="auto"
          aria-label="Search results"
        >
          <Text as="p" textVariant="label-default-s" onBackground="neutral-weak" marginX="8" marginY="4" aria-live="polite">
            {results.length === 0
              ? "No patient or owner matches that name"
              : `${results.length} ${results.length === 1 ? "match" : "matches"}`}
          </Text>
          {results.map((p) => {
            const owner = getOwner(p.owner);
            return (
              <Card
                key={p.id}
                href={`/patients/${p.id}`}
                fillWidth
                padding="12"
                radius="m"
                gap="4"
                onClick={() => {
                  setOpen(false);
                  setQuery("");
                }}
              >
                <Row gap="12" vertical="center" horizontal="between" wrap>
                  <Row gap="8" vertical="center">
                    <Icon name="paw" size="s" onBackground="brand-medium" />
                    <Text textVariant="label-strong-m">{p.name}</Text>
                    <Text textVariant="body-default-s" onBackground="neutral-weak">
                      {p.species}, {p.breed}
                    </Text>
                  </Row>
                  <Text textVariant="body-default-s" onBackground="neutral-medium">
                    Owner: {owner?.name}
                  </Text>
                </Row>
                <AlertTags alerts={p.alerts} size="s" />
              </Card>
            );
          })}
        </Column>
      )}
    </Column>
  );
}
```

```tsx components/Schedule.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
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
  VisuallyHidden,
} from "@once-ui-system/core";
import {
  APPOINTMENTS,
  NOW_START,
  STATUS_LABEL,
  VETS,
  endTime,
  fromMin,
  getOwner,
  getPatient,
  getVet,
  toMin,
  type Appointment,
  type Status,
} from "@/lib/data";
import { AlertTags } from "./AlertTags";
import { BookDialog } from "./BookDialog";

const STATUS_TONE: Record<Status, "neutral" | "warning" | "accent" | "success" | "danger"> = {
  booked: "neutral",
  checked_in: "warning",
  in_exam: "accent",
  done: "success",
  cancelled: "neutral",
};

export function Schedule() {
  const { addToast } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>(APPOINTMENTS);
  const [now, setNow] = useState(NOW_START);
  const [vetFilter, setVetFilter] = useState("all");
  const [booking, setBooking] = useState(false);
  const [announce, setAnnounce] = useState("");

  useEffect(() => {
    const t = setInterval(() => setNow((n) => n + 1), 60000);
    return () => clearInterval(t);
  }, []);

  const sorted = useMemo(
    () =>
      [...appointments].sort(
        (a, b) => toMin(a.start) - toMin(b.start) || a.vet.localeCompare(b.vet),
      ),
    [appointments],
  );
  const visible = sorted.filter((a) => vetFilter === "all" || a.vet === vetFilter);

  const waiting = appointments
    .filter((a) => a.status === "checked_in")
    .sort((a, b) => toMin(a.checkedInAt ?? "00:00") - toMin(b.checkedInAt ?? "00:00"));
  const inExam = appointments.filter((a) => a.status === "in_exam").length;
  const nextArrival = sorted.find((a) => a.status === "booked" && toMin(a.start) >= now - 15);
  const urgentOpen = appointments.filter(
    (a) => a.urgent && (a.status === "booked" || a.status === "checked_in"),
  ).length;

  const checkIn = (id: string) => {
    const appt = appointments.find((a) => a.id === id);
    if (!appt) return;
    const patient = getPatient(appt.patient);
    setAppointments((list) =>
      list.map((a) => (a.id === id ? { ...a, status: "checked_in", checkedInAt: fromMin(now) } : a)),
    );
    const msg = `${patient?.name ?? "Patient"} checked in at ${fromMin(now)} for ${getVet(appt.vet)?.name}.`;
    setAnnounce(msg);
    addToast({ variant: "success", message: msg });
  };

  const addAppointment = (a: Appointment) => {
    setAppointments((list) => [...list, a]);
    setVetFilter("all");
    const msg = `Booked ${getPatient(a.patient)?.name} with ${getVet(a.vet)?.name} at ${a.start}.`;
    setAnnounce(msg);
    addToast({ variant: "success", message: msg });
  };

  return (
    <Column gap="24">
      <Row horizontal="between" vertical="end" gap="16" wrap>
        <Column gap="4">
          <Text textVariant="label-default-s" onBackground="neutral-weak">
            Thursday 12 Nov 2026 · {fromMin(now)} at the counter
          </Text>
          <Heading as="h1" textVariant="display-strong-xs">
            Today&apos;s schedule
          </Heading>
        </Column>
        <Button prefixIcon="plus" size="l" onClick={() => setBooking(true)}>
          Book appointment
        </Button>
      </Row>

      <VisuallyHidden aria-live="polite" role="status">
        {announce}
      </VisuallyHidden>

      <Grid columns="4" s={{ columns: "2" }} gap="12">
        <Stat label="Waiting" value={String(waiting.length)} hint={waiting.length ? `Longest ${now - toMin(waiting[0].checkedInAt ?? fromMin(now))} min` : "Nobody waiting"} icon="time" />
        <Stat label="In exam" value={String(inExam)} hint="Across three rooms" icon="people" />
        <Stat
          label="Next arrival"
          value={nextArrival ? nextArrival.start : "None"}
          hint={nextArrival ? `${getPatient(nextArrival.patient)?.name}, ${getVet(nextArrival.vet)?.name}` : "Day is clear"}
          icon="calendar"
        />
        <Stat label="Urgent open" value={String(urgentOpen)} hint="Not yet seen" icon="bolt" danger={urgentOpen > 0} />
      </Grid>

      <Column as="section" aria-labelledby="waiting-title" background="surface" border radius="l" padding="20" gap="16">
        <Row horizontal="between" vertical="center" gap="8">
          <Heading as="h2" id="waiting-title" textVariant="heading-strong-l">
            Waiting list
          </Heading>
          <Text textVariant="label-default-s" onBackground="neutral-weak">
            Longest wait first
          </Text>
        </Row>
        {waiting.length === 0 ? (
          <Text onBackground="neutral-weak">Nobody is waiting. Check in a patient from the schedule below.</Text>
        ) : (
          <Grid as="ol" columns="3" m={{ columns: "2" }} s={{ columns: "1" }} gap="12" margin="0" padding="0">
            {waiting.map((a, i) => {
              const patient = getPatient(a.patient);
              const mins = now - toMin(a.checkedInAt ?? fromMin(now));
              const long = mins >= 15;
              return (
                <Column
                  as="li"
                  key={a.id}
                  gap="8"
                  padding="16"
                  radius="m"
                  background={long ? "warning-alpha-weak" : "neutral-alpha-weak"}
                  border={long ? "warning-medium" : true}
                >
                  <Row horizontal="between" vertical="center" gap="8">
                    <Row gap="8" vertical="center">
                      <Tag tone={i === 0 ? "brand" : "neutral"} label={i === 0 ? "Next up" : `#${i + 1}`} />
                      <PatientLink id={a.patient} />
                    </Row>
                    <Column horizontal="end">
                      <Text textVariant="heading-strong-l" onBackground={long ? "warning-strong" : "neutral-strong"}>
                        {mins} min
                      </Text>
                      <Text textVariant="label-default-xs" onBackground="neutral-weak">
                        since {a.checkedInAt}
                      </Text>
                    </Column>
                  </Row>
                  <Text textVariant="body-default-s" onBackground="neutral-medium">
                    {a.reason} · {getVet(a.vet)?.name}, {getVet(a.vet)?.room}
                  </Text>
                  <AlertTags alerts={patient?.alerts ?? []} size="s" />
                </Column>
              );
            })}
          </Grid>
        )}
      </Column>

      <Column as="section" aria-labelledby="schedule-title" gap="16">
        <Row horizontal="between" vertical="center" gap="16" wrap>
          <Heading as="h2" id="schedule-title" textVariant="heading-strong-l">
            All appointments ({visible.length})
          </Heading>
          <SegmentedControl
            aria-label="Filter by vet"
            value={vetFilter}
            onValueChange={setVetFilter}
            buttons={[
              { value: "all", label: "All vets" },
              ...VETS.map((v) => ({ value: v.id, label: v.name.replace("Dr. ", "").split(" ").pop() ?? v.name })),
            ]}
          />
        </Row>
        <Column as="ul" gap="8" margin="0" padding="0">
          {visible.map((a) => (
            <AppointmentRow key={a.id} appt={a} onCheckIn={() => checkIn(a.id)} />
          ))}
        </Column>
      </Column>

      <BookDialog
        open={booking}
        onClose={() => setBooking(false)}
        appointments={appointments}
        now={now}
        onBook={addAppointment}
      />
    </Column>
  );
}

function Stat({
  label,
  value,
  hint,
  icon,
  danger,
}: {
  label: string;
  value: string;
  hint: string;
  icon: "time" | "people" | "calendar" | "bolt";
  danger?: boolean;
}) {
  return (
    <Column background={danger ? "danger-alpha-weak" : "surface"} border={danger ? "danger-medium" : true} radius="l" padding="16" gap="4">
      <Row gap="8" vertical="center">
        <Icon name={icon} size="s" onBackground={danger ? "danger-strong" : "neutral-weak"} />
        <Text textVariant="label-default-s" onBackground="neutral-weak">
          {label}
        </Text>
      </Row>
      <Text textVariant="display-strong-xs" onBackground={danger ? "danger-strong" : "neutral-strong"}>
        {value}
      </Text>
      <Text textVariant="body-default-s" onBackground="neutral-weak">
        {hint}
      </Text>
    </Column>
  );
}

function PatientLink({ id }: { id: string }) {
  const p = getPatient(id);
  if (!p) return null;
  return (
    <Link
      href={`/patients/${p.id}`}
      style={{ color: "inherit", textDecoration: "underline", textUnderlineOffset: 3, textDecorationThickness: 1 }}
    >
      <Text textVariant="label-strong-l">{p.name}</Text>
    </Link>
  );
}

function AppointmentRow({ appt, onCheckIn }: { appt: Appointment; onCheckIn: () => void }) {
  const patient = getPatient(appt.patient);
  const owner = patient ? getOwner(patient.owner) : undefined;
  const vet = getVet(appt.vet);
  const cancelled = appt.status === "cancelled";
  const strike = cancelled ? ({ textDecoration: "line-through" } as const) : undefined;

  return (
    <Row
      as="li"
      gap="16"
      padding="16"
      radius="l"
      vertical="start"
      s={{ direction: "column", gap: "8" }}
      background={appt.urgent ? "danger-alpha-weak" : "surface"}
      border={appt.urgent ? "danger-strong" : true}
      borderWidth={appt.urgent ? 2 : 1}
    >
      <Column width={80} s={{ width: "auto" }} gap="2" flex={0}>
        <Text textVariant="heading-strong-l" style={strike}>
          {appt.start}
        </Text>
        <Text textVariant="label-default-xs" onBackground="neutral-weak">
          to {endTime(appt.start, appt.minutes)} · {appt.minutes} min
        </Text>
      </Column>
      <Column flex={1} gap="4" fillWidth>
        <Row gap="8" vertical="center" wrap>
          {appt.urgent && <Tag tone="danger" variant="gradient" prefixIcon="bolt" label="Urgent" />}
          <PatientLink id={appt.patient} />
          <Text textVariant="body-default-s" onBackground="neutral-weak">
            {patient?.species}, {patient?.breed}
          </Text>
          {appt.isNew && <Tag tone="brand" label="Just booked" />}
        </Row>
        <Text textVariant="body-default-m" style={strike}>
          {appt.reason}
        </Text>
        <Text textVariant="body-default-s" onBackground="neutral-weak">
          Owner {owner?.name} · {owner?.phone}
        </Text>
        <AlertTags alerts={patient?.alerts ?? []} size="s" />
      </Column>
      <Column width={176} s={{ width: "auto" }} gap="2" flex={0}>
        <Text textVariant="label-strong-s">{vet?.name}</Text>
        <Text textVariant="label-default-s" onBackground="neutral-weak">
          {vet?.room}
        </Text>
      </Column>
      <Row width={176} s={{ width: "auto", fillWidth: true }} gap="8" vertical="center" horizontal="between" wrap flex={0}>
        <Tag tone={STATUS_TONE[appt.status]} label={STATUS_LABEL[appt.status]} dot={appt.status === "in_exam"} />
        {appt.status === "booked" && (
          <Button size="m" variant="secondary" prefixIcon="check" onClick={onCheckIn} aria-label={`Check in ${patient?.name}`}>
            Check in
          </Button>
        )}
      </Row>
    </Row>
  );
}
```

```ts lib/data.ts
export type Status = "booked" | "checked_in" | "in_exam" | "done" | "cancelled";

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
export type Appointment = {
  id: string;
  patient: string;
  vet: string;
  start: string;
  minutes: number;
  reason: string;
  status: Status;
  urgent?: boolean;
  checkedInAt?: string;
  isNew?: boolean;
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

export const CLINIC = "Pawpoint, front-desk and records software for Hillside Veterinary Clinic";
export const TODAY = "2026-11-12";
/** The counter clock the demo starts at (minutes after midnight): 09:41. */
export const NOW_START = 9 * 60 + 41;

export const USER = { name: "Rosa Lindqvist", role: "Receptionist" };

export const VETS: Vet[] = [
  { id: "v-1", name: "Dr. Amara Osei", room: "Exam 1" },
  { id: "v-2", name: "Dr. Tomás Reyes", room: "Exam 2" },
  { id: "v-3", name: "Dr. Helen Park", room: "Surgery" },
];

export const OWNERS: Owner[] = [
  { id: "o-1", name: "Daniel Kim", phone: "+1 555 0142" },
  { id: "o-2", name: "Priya Natarajan", phone: "+1 555 0178" },
  { id: "o-3", name: "Lucas Moreau", phone: "+1 555 0119" },
  { id: "o-4", name: "Grace Whitfield", phone: "+1 555 0163" },
  { id: "o-5", name: "Sam Oduya", phone: "+1 555 0190" },
  { id: "o-6", name: "Elena Rossi", phone: "+1 555 0105" },
];

export const PATIENTS: Patient[] = [
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

export const APPOINTMENTS: Appointment[] = [
  { id: "a-01", patient: "p-101", vet: "v-1", start: "08:30", minutes: 20, reason: "Annual vaccination", status: "done" },
  { id: "a-02", patient: "p-104", vet: "v-2", start: "08:30", minutes: 30, reason: "Kidney panel recheck", status: "done" },
  { id: "a-03", patient: "p-108", vet: "v-3", start: "08:00", minutes: 120, reason: "Soft palate surgery", status: "in_exam" },
  { id: "a-04", patient: "p-102", vet: "v-1", start: "09:00", minutes: 30, reason: "Limping, left hind leg", status: "in_exam" },
  { id: "a-05", patient: "p-107", vet: "v-2", start: "09:15", minutes: 20, reason: "Glucose curve", status: "checked_in", checkedInAt: "09:22" },
  { id: "a-06", patient: "p-105", vet: "v-1", start: "09:45", minutes: 20, reason: "Beak and nail trim", status: "checked_in", checkedInAt: "09:36" },
  { id: "a-07", patient: "p-103", vet: "v-2", start: "10:00", minutes: 30, reason: "Senior wellness exam", status: "booked" },
  { id: "a-08", patient: "p-106", vet: "v-1", start: "10:30", minutes: 20, reason: "Not eating since yesterday", status: "booked", urgent: true },
  { id: "a-09", patient: "p-104", vet: "v-3", start: "11:00", minutes: 45, reason: "Dental cleaning", status: "booked" },
  { id: "a-10", patient: "p-101", vet: "v-2", start: "11:30", minutes: 20, reason: "Ear infection follow-up", status: "booked" },
  { id: "a-11", patient: "p-107", vet: "v-1", start: "13:30", minutes: 30, reason: "Dental check", status: "booked" },
  { id: "a-12", patient: "p-103", vet: "v-3", start: "14:00", minutes: 60, reason: "Lump removal", status: "cancelled" },
  { id: "a-13", patient: "p-102", vet: "v-2", start: "15:00", minutes: 20, reason: "X-ray results", status: "booked" },
];

export const RECORDS: Record<string, PatientRecordData> = {
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

export const STATUS_LABEL: Record<Status, string> = {
  booked: "Booked",
  checked_in: "Checked in",
  in_exam: "In exam",
  done: "Done",
  cancelled: "Cancelled",
};

export const getPatient = (id: string) => PATIENTS.find((p) => p.id === id);
export const getOwner = (id: string) => OWNERS.find((o) => o.id === id);
export const getVet = (id: string) => VETS.find((v) => v.id === id);

/* ---------- time and date helpers (no locale or timezone dependence) ---------- */

export const toMin = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};
export const fromMin = (min: number) =>
  `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;
export const endTime = (start: string, minutes: number) => fromMin(toMin(start) + minutes);

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const dayNumber = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return Math.round(Date.UTC(y, m - 1, d) / 86400000);
};
export const daysBetween = (fromIso: string, toIso: string) => dayNumber(toIso) - dayNumber(fromIso);
export const fmtDate = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
};
export const fmtShortDate = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${MONTHS[m - 1]} ${String(y).slice(2)}`;
};
export const ageLabel = (born: string, today = TODAY) => {
  const [by, bm, bd] = born.split("-").map(Number);
  const [ty, tm, td] = today.split("-").map(Number);
  let months = (ty - by) * 12 + (tm - bm);
  if (td < bd) months -= 1;
  const years = Math.floor(months / 12);
  if (years >= 1) return `${years} ${years === 1 ? "year" : "years"}`;
  return `${months} ${months === 1 ? "month" : "months"}`;
};
export const fmtUsd = (n: number) => `$${n.toFixed(2)}`;
export const telHref = (phone: string) => `tel:${phone.replace(/[^+\d]/g, "")}`;

/* ---------- booking rules ---------- */

export type Clash = { kind: "vet" | "patient"; with: Appointment };

/** A booking clashes when it overlaps a live appointment of the same vet (or of the same patient). */
export function findClash(
  appointments: Appointment[],
  vetId: string,
  patientId: string,
  start: string,
  minutes: number,
): Clash | null {
  const s = toMin(start);
  const e = s + minutes;
  for (const a of appointments) {
    if (a.status === "cancelled") continue;
    const as = toMin(a.start);
    const ae = as + a.minutes;
    if (!(s < ae && as < e)) continue;
    if (a.vet === vetId) return { kind: "vet", with: a };
    if (patientId && a.patient === patientId) return { kind: "patient", with: a };
  }
  return null;
}

export const DAY_START = 8 * 60;
export const DAY_END = 17 * 60;

export function nextFreeSlot(
  appointments: Appointment[],
  vetId: string,
  patientId: string,
  minutes: number,
  fromMinute: number,
): string | null {
  const first = Math.ceil(Math.max(fromMinute, DAY_START) / 15) * 15;
  for (let t = first; t + minutes <= DAY_END; t += 15) {
    if (!findClash(appointments, vetId, patientId, fromMin(t), minutes)) return fromMin(t);
  }
  return null;
}

export const SLOTS: string[] = (() => {
  const out: string[] = [];
  for (let t = DAY_START; t < DAY_END; t += 15) out.push(fromMin(t));
  return out;
})();
```

