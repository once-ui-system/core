```tsx src/app/layout.tsx
import '@once-ui-system/core/css/styles.css';
import '@once-ui-system/core/css/tokens.css';
import '@/resources/custom.css'

import classNames from "classnames";

import { baseURL, fonts, style, dataStyle } from "@/resources";
import { Meta, Schema,  Column, Flex, ThemeInit } from "@once-ui-system/core";
import { LocaleProvider, Providers } from '@/components';
import { DeskProvider } from '@/components/desk/DeskProvider';
import { getLocale } from '@/lib/i18n/server';

const title = "Pawpoint: front desk for Hillside Veterinary Clinic";
const description = "Today's schedule, check-in, waiting room and patient records for Hillside Veterinary Clinic.";

export async function generateMetadata() {
  return Meta.generate({
    title,
    description,
    baseURL: baseURL,
    image: "/images/og/home.jpg",
  });
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  return (
    <Flex
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      as="html"
      lang={locale}
      fillWidth
      className={classNames(
        fonts.heading.variable,
        fonts.body.variable,
        fonts.label.variable,
        fonts.code.variable,
      )}
    >
      <head>
        <Schema
          as="webPage"
          baseURL={baseURL}
          title={title}
          description={description}
          path="/"
        />
        <ThemeInit
          config={{
            theme: 'system',
            brand: style.brand,
            accent: style.accent,
            neutral: style.neutral,
            solid: style.solid,
            'solid-style': style.solidStyle,
            border: style.border,
            surface: style.surface,
            transition: style.transition,
            scaling: style.scaling,
            'viz-style': dataStyle.variant,
          }}
        />
      </head>
      <LocaleProvider locale={locale}>
        <Providers>
          <DeskProvider>
            <Column as="body" background="page" fillWidth margin="0" padding="0" minHeight="100vh">
              <Column fillWidth horizontal="center" flex={1}>
                {children}
              </Column>
            </Column>
          </DeskProvider>
        </Providers>
      </LocaleProvider>
    </Flex>
  );
}
```

```tsx src/app/page.tsx
import { DeskShell } from "@/components/desk/DeskShell";
import { Schedule } from "@/components/desk/Schedule";

export default function Page() {
  return (
    <DeskShell>
      <Schedule />
    </DeskShell>
  );
}
```

```tsx src/app/patients/[id]/page.tsx
import { notFound } from "next/navigation";
import { DeskShell } from "@/components/desk/DeskShell";
import { PatientRecord } from "@/components/desk/PatientRecord";
import { getPatient, patients } from "@/lib/data";

export function generateStaticParams() {
  return patients.map((p) => ({ id: p.id }));
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const patient = getPatient(id);
  if (!patient) notFound();
  return (
    <DeskShell>
      <PatientRecord patient={patient} />
    </DeskShell>
  );
}
```

```tsx src/components/desk/AlertTags.tsx
import { Row, Tag } from "@once-ui-system/core";

/** Medical alerts: always danger-coloured with a warning icon, wherever a patient appears. */
export function AlertTags({ alerts, size = "m" }: { alerts: string[]; size?: "s" | "m" | "l" }) {
  if (alerts.length === 0) return null;
  return (
    <Row gap="4" wrap role="list" aria-label="Medical alerts">
      {alerts.map((a) => (
        <Tag key={a} scheme="danger" size={size} prefixIcon="warning" role="listitem">
          <strong>{a}</strong>
        </Tag>
      ))}
    </Row>
  );
}
```

```tsx src/components/desk/BookDialog.tsx
"use client";

import { useMemo, useState } from "react";
import { Button, Column, Dialog, Input, Row, Select, Text } from "@once-ui-system/core";
import {
  type Appointment,
  findClash,
  fmtTime,
  getOwner,
  getPatient,
  getVet,
  patients,
  toMin,
  vets,
} from "@/lib/data";
import { AlertTags } from "./AlertTags";
import { useDesk } from "./DeskProvider";

const slots: { value: string; label: string }[] = [];
for (let m = 8 * 60; m < 17 * 60; m += 15) slots.push({ value: fmtTime(m), label: fmtTime(m) });

const durations = [15, 20, 30, 45, 60].map((d) => ({ value: String(d), label: `${d} minutes` }));

export function BookDialog({
  open,
  onClose,
  onBooked,
}: {
  open: boolean;
  onClose: () => void;
  onBooked: (a: Appointment) => void;
}) {
  const { appointments, book } = useDesk();
  const [patient, setPatient] = useState("");
  const [vet, setVet] = useState("v-1");
  const [start, setStart] = useState("10:00");
  const [minutes, setMinutes] = useState("20");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  const clash = useMemo(() => findClash(appointments, vet, start, Number(minutes)), [appointments, vet, start, minutes]);
  const picked = getPatient(patient);

  function clashText(c: Appointment): string {
    const p = getPatient(c.patient);
    return `${getVet(c.vet).name} already has ${p?.name ?? "a patient"} from ${c.start} to ${fmtTime(toMin(c.start) + c.minutes)}. Pick another time or vet.`;
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!picked) {
      setError("Choose a patient first.");
      return;
    }
    if (!reason.trim()) {
      setError("Add a reason for the visit.");
      return;
    }
    const res = book({ patient, vet, start, minutes: Number(minutes), reason: reason.trim() });
    if (!res.ok) {
      setError(clashText(res.clash));
      return;
    }
    onBooked({ id: res.id, status: "booked", patient, vet, start, minutes: Number(minutes), reason: reason.trim() });
    setPatient("");
    setReason("");
    setError("");
  }

  const message = error || (clash ? clashText(clash) : "");

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Book an appointment"
      description="Pick the patient, the vet and a free time."
    >
      <form onSubmit={submit} noValidate>
        <Column gap="16">
          <Select
            id="book-patient"
            label="Patient"
            value={patient}
            searchable
            options={patients.map((p) => ({
              value: p.id,
              label: `${p.name} (${p.species}) · ${getOwner(p.owner).name}`,
            }))}
            onSelect={(v) => {
              setPatient(String(v));
              setError("");
            }}
          />
          {picked && picked.alerts.length > 0 && <AlertTags alerts={picked.alerts} />}
          <Select
            id="book-vet"
            label="Vet"
            value={vet}
            options={vets.map((v) => ({ value: v.id, label: `${v.name} · ${v.room}` }))}
            onSelect={(v) => {
              setVet(String(v));
              setError("");
            }}
          />
          <Row gap="12" s={{ direction: "column" }}>
            <Select
              id="book-time"
              label="Start time"
              value={start}
              options={slots}
              onSelect={(v) => {
                setStart(String(v));
                setError("");
              }}
            />
            <Select
              id="book-length"
              label="Length"
              value={minutes}
              options={durations}
              onSelect={(v) => {
                setMinutes(String(v));
                setError("");
              }}
            />
          </Row>
          <Input
            id="book-reason"
            label="Reason for visit"
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              setError("");
            }}
          />
          <div role="alert" aria-live="assertive">
            {message && (
              <Row background="danger-alpha-weak" border="danger-alpha-medium" radius="m" padding="12" gap="8">
                <Text variant="body-default-s" onBackground="danger-strong">
                  {message}
                </Text>
              </Row>
            )}
          </div>
          <Row gap="8" horizontal="end">
            <Button type="button" variant="secondary" label="Cancel" onClick={onClose} />
            <Button type="submit" label="Book appointment" prefixIcon="calendar" disabled={Boolean(clash)} />
          </Row>
        </Column>
      </form>
    </Dialog>
  );
}
```

```tsx src/components/desk/DeskHeader.tsx
"use client";

import { useMemo, useState } from "react";
import { Avatar, Card, Column, Icon, Input, Row, SmartLink, Text } from "@once-ui-system/core";
import { clinicName, getOwner, patients, user } from "@/lib/data";
import { AlertTags } from "./AlertTags";

export function DeskHeader() {
  const [q, setQ] = useState("");
  const query = q.trim().toLowerCase();

  const results = useMemo(() => {
    if (!query) return [];
    return patients.filter((p) => {
      const owner = getOwner(p.owner);
      return p.name.toLowerCase().includes(query) || owner.name.toLowerCase().includes(query);
    });
  }, [query]);

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
      horizontal="between"
      position="sticky"
      top="0"
      zIndex={5}
    >
      <SmartLink href="/">
        <Row gap="8" vertical="center">
          <Row center width="40" height="40" radius="m" background="brand-alpha-medium">
            <Icon name="paw" size="m" onBackground="brand-strong" />
          </Row>
          <Column gap="0" s={{ hide: true }}>
            <Text variant="heading-strong-m">Pawpoint</Text>
            <Text variant="label-default-xs" onBackground="neutral-medium">
              {clinicName}
            </Text>
          </Column>
        </Row>
      </SmartLink>

      <Column flex={1} maxWidth={32} position="relative">
        <Input
          id="patient-search"
          label="Search patient or owner"
          type="search"
          size="s"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          prefix={<Icon name="search" size="xs" />}
          autoComplete="off"
        />
        {query && (
          <Column
            position="absolute"
            top="56"
            left="0"
            fillWidth
            background="surface"
            border
            radius="l"
            shadow="l"
            padding="8"
            gap="4"
            zIndex={5}
            role="region"
            aria-label="Search results"
            aria-live="polite"
          >
            {results.length === 0 ? (
              <Text variant="body-default-s" onBackground="neutral-medium" padding="8">
                No patient or owner matches “{q.trim()}”.
              </Text>
            ) : (
              results.map((p) => (
                <Card key={p.id} href={`/patients/${p.id}`} padding="12" radius="m" fillWidth gap="4" direction="column">
                  <Row gap="8" vertical="center" wrap>
                    <Text variant="label-strong-m">{p.name}</Text>
                    <Text variant="body-default-s" onBackground="neutral-medium">
                      {p.species} · {getOwner(p.owner).name}
                    </Text>
                  </Row>
                  <AlertTags alerts={p.alerts} size="s" />
                </Card>
              ))
            )}
          </Column>
        )}
      </Column>

      <Row gap="12" vertical="center">
        <Column gap="0" horizontal="end" s={{ hide: true }}>
          <Text variant="label-strong-s">{user.name}</Text>
          <Text variant="label-default-xs" onBackground="neutral-medium">
            {user.role}
          </Text>
        </Column>
        <Avatar value="RL" size="m" />
      </Row>
    </Row>
  );
}
```

```tsx src/components/desk/DeskProvider.tsx
"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { type Appointment, clockStart, findClash, initialAppointments } from "@/lib/data";

type NewBooking = { patient: string; vet: string; start: string; minutes: number; reason: string };

type Desk = {
  appointments: Appointment[];
  now: number;
  checkIn: (id: string) => void;
  book: (b: NewBooking) => { ok: true; id: string } | { ok: false; clash: Appointment };
};

const DeskContext = createContext<Desk | null>(null);

export function DeskProvider({ children }: { children: React.ReactNode }) {
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const [now, setNow] = useState(clockStart);

  // The desk clock moves on by a minute every minute.
  useEffect(() => {
    const t = window.setInterval(() => setNow((n) => n + 1), 60000);
    return () => window.clearInterval(t);
  }, []);

  const checkIn = useCallback(
    (id: string) => {
      setAppointments((list) =>
        list.map((a) => (a.id === id && a.status === "booked" ? { ...a, status: "checked_in", checkedInAt: now } : a)),
      );
    },
    [now],
  );

  const book = useCallback(
    (b: NewBooking): { ok: true; id: string } | { ok: false; clash: Appointment } => {
      const clash = findClash(appointments, b.vet, b.start, b.minutes);
      if (clash) return { ok: false, clash };
      const id = `a-${String(appointments.length + 1).padStart(2, "0")}`;
      setAppointments((list) => [...list, { id, status: "booked", ...b }]);
      return { ok: true, id };
    },
    [appointments],
  );

  const value = useMemo(() => ({ appointments, now, checkIn, book }), [appointments, now, checkIn, book]);
  return <DeskContext.Provider value={value}>{children}</DeskContext.Provider>;
}

export function useDesk(): Desk {
  const ctx = useContext(DeskContext);
  if (!ctx) throw new Error("useDesk must be used inside DeskProvider");
  return ctx;
}
```

```tsx src/components/desk/DeskShell.tsx
import { Column, VisuallyHidden } from "@once-ui-system/core";
import { DeskHeader } from "./DeskHeader";

export function DeskShell({ children }: { children: React.ReactNode }) {
  return (
    <Column fillWidth minHeight="100vh">
      <VisuallyHidden as="a" href="#main" focusable>
        Skip to content
      </VisuallyHidden>
      <DeskHeader />
      <Column as="main" id="main" fillWidth horizontal="center" paddingX="16" paddingY="24" s={{ paddingY: "16" }}>
        <Column fillWidth maxWidth={80} gap="24">
          {children}
        </Column>
      </Column>
    </Column>
  );
}
```

```tsx src/components/desk/PatientRecord.tsx
import { Button, Column, Grid, Heading, Icon, Row, Tag, Text } from "@once-ui-system/core";
import {
  type Patient,
  ageOn,
  clinicName,
  daysBetween,
  fmtDate,
  getOwner,
  getVet,
  records,
  today,
} from "@/lib/data";
import { WeightChart } from "./WeightChart";

function Panel({ title, id, children }: { title: string; id: string; children: React.ReactNode }) {
  return (
    <Column as="section" aria-labelledby={id} background="surface" border radius="l" padding="20" gap="16" fillWidth>
      <Heading as="h2" id={id} variant="heading-strong-l">
        {title}
      </Heading>
      {children}
    </Column>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <Column gap="2" as="div">
      <Text as="dt" variant="label-default-s" onBackground="neutral-medium">
        {label}
      </Text>
      <Text as="dd" variant="body-strong-m" style={{ margin: 0 }}>
        {value}
      </Text>
    </Column>
  );
}

function vaccineStatus(due: string): { scheme: "danger" | "warning" | "success"; label: string } {
  const left = daysBetween(today, due);
  if (left < 0) return { scheme: "danger", label: `Overdue by ${-left} days` };
  if (left <= 60) return { scheme: "warning", label: `Due in ${left} days` };
  return { scheme: "success", label: "Up to date" };
}

export function PatientRecord({ patient }: { patient: Patient }) {
  const owner = getOwner(patient.owner);
  const rec = records[patient.id];
  const overdue = rec ? rec.vaccinations.filter((v) => daysBetween(today, v.due) < 0) : [];

  return (
    <>
      <Row>
        <Button href="/" variant="tertiary" size="s" prefixIcon="arrowLeft" label="Today’s schedule" />
      </Row>

      <Row gap="16" vertical="center" wrap horizontal="between">
        <Column gap="4">
          <Text variant="label-default-s" onBackground="brand-strong">
            Patient record · {clinicName}
          </Text>
          <Heading as="h1" variant="display-strong-s">
            {patient.name}
          </Heading>
          <Text variant="body-default-l" onBackground="neutral-medium">
            {patient.breed} · {patient.species} · {ageOn(patient.born, today)} old
          </Text>
        </Column>
      </Row>

      {patient.alerts.length > 0 && (
        <Row
          as="section"
          aria-label="Medical alerts"
          background="danger-alpha-medium"
          border="danger-alpha-strong"
          borderWidth={2}
          radius="l"
          padding="20"
          gap="16"
          vertical="start"
        >
          <Icon name="warning" size="xl" onBackground="danger-strong" />
          <Column gap="8">
            <Heading as="h2" variant="heading-strong-l" onBackground="danger-strong">
              Medical alerts
            </Heading>
            <Column as="ul" gap="4" margin="0" padding="0">
              {patient.alerts.map((a) => (
                <Text as="li" key={a} variant="heading-strong-m" onBackground="danger-strong" style={{ listStyle: "none" }}>
                  {a}
                </Text>
              ))}
            </Column>
          </Column>
        </Row>
      )}

      <Grid columns="2" gap="24" m={{ columns: "1" }}>
        <Panel title="Patient and owner" id="details-title">
          <Grid as="dl" columns="2" gap="16" margin="0">
            <Fact label="Species" value={patient.species} />
            <Fact label="Breed" value={patient.breed} />
            <Fact label="Born" value={fmtDate(patient.born)} />
            <Fact label="Sex" value={patient.sex} />
            <Fact label="Owner" value={owner.name} />
            <Fact label="Phone" value={owner.phone} />
          </Grid>
        </Panel>

        {rec ? (
          <Panel title="Current medications" id="meds-title">
            <Column as="ul" gap="12" margin="0" padding="0">
              {rec.medications.map((m) => (
                <Column as="li" key={m.name} gap="2" style={{ listStyle: "none" }}>
                  <Text variant="body-strong-m">{m.name}</Text>
                  <Text variant="body-default-s" onBackground="neutral-medium">
                    {m.dose} · since {fmtDate(m.since)}
                  </Text>
                </Column>
              ))}
            </Column>
          </Panel>
        ) : (
          <Panel title="Clinical record" id="norecord-title">
            <Text variant="body-default-m" onBackground="neutral-medium">
              No weights, vaccinations or visit notes are on file for {patient.name} in this desk view. Ask the vet for the
              full chart.
            </Text>
          </Panel>
        )}
      </Grid>

      {rec && (
        <>
          <Panel title="Weight trend" id="weight-title">
            <WeightChart points={rec.weights_kg} />
          </Panel>

          <Panel title="Vaccinations" id="vacc-title">
            {overdue.length > 0 && (
              <Row background="danger-alpha-weak" border="danger-alpha-medium" radius="m" padding="12" gap="8" vertical="center">
                <Icon name="warning" size="s" onBackground="danger-strong" />
                <Text variant="label-strong-m" onBackground="danger-strong">
                  {overdue.map((v) => v.name).join(" and ")} overdue as of {fmtDate(today)}
                </Text>
              </Row>
            )}
            <Column as="ul" gap="8" margin="0" padding="0">
              {rec.vaccinations.map((v) => {
                const s = vaccineStatus(v.due);
                return (
                  <Row
                    as="li"
                    key={v.name}
                    gap="12"
                    vertical="center"
                    horizontal="between"
                    wrap
                    padding="12"
                    radius="m"
                    background={s.scheme === "danger" ? "danger-alpha-weak" : "neutral-alpha-weak"}
                    style={{ listStyle: "none" }}
                  >
                    <Column gap="2">
                      <Text variant="body-strong-m">{v.name}</Text>
                      <Text variant="body-default-s" onBackground="neutral-medium">
                        Given {fmtDate(v.given)} · due {fmtDate(v.due)}
                      </Text>
                    </Column>
                    <Tag scheme={s.scheme} size="l" prefixIcon={s.scheme === "success" ? "check" : "warning"} label={s.label} />
                  </Row>
                );
              })}
            </Column>
          </Panel>

          <Panel title="Visit history" id="visits-title">
            <Column as="ol" gap="12" margin="0" padding="0">
              {rec.visits.map((v) => (
                <Column
                  as="li"
                  key={v.date}
                  gap="8"
                  padding="16"
                  radius="m"
                  background="neutral-alpha-weak"
                  style={{ listStyle: "none" }}
                >
                  <Row horizontal="between" gap="8" wrap>
                    <Text variant="body-strong-m">
                      {fmtDate(v.date)} · {v.reason}
                    </Text>
                    <Text variant="body-default-s" onBackground="neutral-medium">
                      {getVet(v.vet).name} · ${v.invoice_usd.toFixed(2)}
                    </Text>
                  </Row>
                  <Text variant="body-default-m">{v.notes}</Text>
                </Column>
              ))}
            </Column>
          </Panel>
        </>
      )}
    </>
  );
}
```

```tsx src/components/desk/Schedule.tsx
"use client";

import { useMemo, useState } from "react";
import { Button, Column, Heading, Row, SegmentedControl, SmartLink, Tag, Text } from "@once-ui-system/core";
import {
  type Appointment,
  type Status,
  fmtTime,
  getOwner,
  getPatient,
  getVet,
  statusLabel,
  toMin,
  vets,
} from "@/lib/data";
import { AlertTags } from "./AlertTags";
import { BookDialog } from "./BookDialog";
import { useDesk } from "./DeskProvider";

const statusScheme: Record<Status, "neutral" | "warning" | "accent" | "success"> = {
  booked: "neutral",
  checked_in: "warning",
  in_exam: "accent",
  done: "success",
  cancelled: "neutral",
};

function Stat({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <Column background="surface" border radius="l" padding="16" gap="4" flex={1} minWidth={10}>
      <Text variant="label-default-s" onBackground="neutral-medium">
        {label}
      </Text>
      <Text variant="display-strong-xs">{value}</Text>
      <Text variant="body-default-xs" onBackground="neutral-medium">
        {hint}
      </Text>
    </Column>
  );
}

function AppointmentRow({ a }: { a: Appointment }) {
  const { checkIn } = useDesk();
  const patient = getPatient(a.patient);
  const owner = getOwner(patient?.owner ?? "");
  const vet = getVet(a.vet);
  if (!patient) return null;
  const end = fmtTime(toMin(a.start) + a.minutes);
  const cancelled = a.status === "cancelled";

  return (
    <Row
      as="li"
      background={a.urgent ? "danger-alpha-weak" : "surface"}
      border={a.urgent ? "danger-alpha-strong" : true}
      radius="l"
      padding="16"
      gap="16"
      vertical="start"
      wrap
      style={{ listStyle: "none", borderLeft: a.urgent ? "6px solid var(--danger-solid-strong)" : undefined }}
    >
      <Column width="80" gap="0">
        <Text variant="heading-strong-l">{a.start}</Text>
        <Text variant="body-default-xs" onBackground="neutral-medium">
          to {end}
        </Text>
      </Column>

      <Column flex={1} gap="8" minWidth={12}>
        <Row gap="8" vertical="center" wrap>
          <SmartLink href={`/patients/${patient.id}`}>
            <Text variant="heading-strong-m">{patient.name}</Text>
          </SmartLink>
          <Text variant="body-default-s" onBackground="neutral-medium">
            {patient.species}, {patient.breed} · {owner.name}
          </Text>
        </Row>
        <Row gap="8" vertical="center" wrap>
          {a.urgent && (
            <Tag scheme="danger" size="m" prefixIcon="bolt">
              <strong>Urgent</strong>
            </Tag>
          )}
          <Text variant="body-default-m" style={{ textDecoration: cancelled ? "line-through" : undefined }}>
            {a.reason}
          </Text>
        </Row>
        <AlertTags alerts={patient.alerts} size="s" />
        <Text variant="label-default-s" onBackground="neutral-medium">
          {vet.name} · {vet.room} · {a.minutes} min
        </Text>
      </Column>

      <Row gap="12" vertical="center" wrap>
        <Tag scheme={statusScheme[a.status]} size="l" label={statusLabel[a.status]} />
        {a.status === "booked" && (
          <Button
            size="m"
            variant="primary"
            prefixIcon="check"
            label="Check in"
            onClick={() => checkIn(a.id)}
          />
        )}
      </Row>
    </Row>
  );
}

function WaitingList() {
  const { appointments, now } = useDesk();
  const waiting = appointments
    .filter((a) => a.status === "checked_in")
    .sort((x, y) => (x.checkedInAt ?? 0) - (y.checkedInAt ?? 0));

  return (
    <Column background="surface" border radius="l" padding="20" gap="16" as="section" aria-labelledby="waiting-title">
      <Row horizontal="between" vertical="center">
        <Heading as="h2" id="waiting-title" variant="heading-strong-l">
          Waiting room
        </Heading>
        <Tag scheme={waiting.length ? "warning" : "neutral"} size="l" label={String(waiting.length)} />
      </Row>
      {waiting.length === 0 ? (
        <Text variant="body-default-s" onBackground="neutral-medium">
          Nobody is waiting. Checked-in patients appear here.
        </Text>
      ) : (
        <Column as="ol" gap="12" margin="0" padding="0" aria-live="polite">
          {waiting.map((a, i) => {
            const p = getPatient(a.patient);
            if (!p) return null;
            const mins = Math.max(0, now - (a.checkedInAt ?? now));
            const long = mins >= 30;
            return (
              <Column
                as="li"
                key={a.id}
                gap="8"
                padding="12"
                radius="m"
                background="neutral-alpha-weak"
                style={{ listStyle: "none" }}
              >
                <Row horizontal="between" vertical="center" gap="8">
                  <Text variant="label-strong-m">
                    {i === 0 ? "Next: " : `${i + 1}. `}
                    {p.name}
                  </Text>
                  <Tag
                    scheme={long ? "danger" : "warning"}
                    size="m"
                    prefixIcon="time"
                    label={`${mins} min`}
                  />
                </Row>
                <Text variant="body-default-s" onBackground="neutral-medium">
                  {getVet(a.vet).name} · {a.reason}
                </Text>
                <AlertTags alerts={p.alerts} size="s" />
              </Column>
            );
          })}
        </Column>
      )}
    </Column>
  );
}

export function Schedule() {
  const { appointments, now } = useDesk();
  const [vetFilter, setVetFilter] = useState("all");
  const [open, setOpen] = useState(false);
  const [notice, setNotice] = useState("");

  const sorted = useMemo(
    () =>
      [...appointments]
        .filter((a) => vetFilter === "all" || a.vet === vetFilter)
        .sort((a, b) => toMin(a.start) - toMin(b.start) || a.vet.localeCompare(b.vet)),
    [appointments, vetFilter],
  );

  const live = appointments.filter((a) => a.status !== "cancelled");
  const waiting = live.filter((a) => a.status === "checked_in").length;
  const inExam = live.filter((a) => a.status === "in_exam").length;
  const done = live.filter((a) => a.status === "done").length;
  const nextBooked = live
    .filter((a) => a.status === "booked")
    .sort((a, b) => toMin(a.start) - toMin(b.start))[0];
  const nextPatient = nextBooked ? getPatient(nextBooked.patient) : undefined;

  return (
    <>
      <Row horizontal="between" vertical="end" gap="16" wrap>
        <Column gap="4">
          <Text variant="label-default-s" onBackground="brand-strong">
            Thursday 12 November 2026 · {fmtTime(now)}
          </Text>
          <Heading as="h1" variant="display-strong-xs">
            Today’s schedule
          </Heading>
        </Column>
        <Button size="l" prefixIcon="plus" label="Book appointment" onClick={() => setOpen(true)} />
      </Row>

      {notice && (
        <Row
          role="status"
          background="success-alpha-weak"
          border="success-alpha-medium"
          radius="m"
          padding="12"
          horizontal="between"
          vertical="center"
          gap="12"
        >
          <Text variant="body-default-m" onBackground="success-strong">
            {notice}
          </Text>
          <Button size="s" variant="tertiary" label="Dismiss" onClick={() => setNotice("")} />
        </Row>
      )}

      <Row gap="12" wrap s={{ gap: "8" }}>
        <Stat label="Waiting now" value={String(waiting)} hint="checked in, not yet seen" />
        <Stat label="In exam" value={String(inExam)} hint="with a vet or in surgery" />
        <Stat
          label="Next booked"
          value={nextBooked ? nextBooked.start : "None"}
          hint={nextBooked && nextPatient ? `${nextPatient.name} · ${getVet(nextBooked.vet).name}` : "nothing left today"}
        />
        <Stat label="Done" value={`${done} of ${live.length}`} hint="cancelled visits not counted" />
      </Row>

      <Row gap="24" vertical="start" direction="row-reverse" m={{ direction: "column" }}>
        <Column flex={1} fillWidth gap="16" position="sticky" top="80">
          <WaitingList />
        </Column>
        <Column flex={2} gap="16" fillWidth as="section" aria-label="Appointments">
          <SegmentedControl
            aria-label="Filter by vet"
            fillWidth={false}
            value={vetFilter}
            onChange={(v) => setVetFilter(v)}
            buttons={[
              { value: "all", label: "All vets" },
              ...vets.map((v) => ({ value: v.id, label: v.name })),
            ]}
          />
          <Column as="ul" gap="12" margin="0" padding="0">
            {sorted.map((a) => (
              <AppointmentRow key={a.id} a={a} />
            ))}
          </Column>
        </Column>
      </Row>

      <BookDialog
        open={open}
        onClose={() => setOpen(false)}
        onBooked={(a) => {
          const p = getPatient(a.patient);
          setNotice(`Booked ${p?.name ?? "patient"} with ${getVet(a.vet).name} at ${a.start}.`);
          setVetFilter("all");
          setOpen(false);
        }}
      />
    </>
  );
}
```

```tsx src/components/desk/WeightChart.tsx
import { Column, Row, Text } from "@once-ui-system/core";
import { fmtDate } from "@/lib/data";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
function short(iso: string): string {
  const [y, m] = iso.split("-").map(Number);
  return `${MONTHS[m - 1]} ${String(y).slice(2)}`;
}

export function WeightChart({ points }: { points: { date: string; kg: number }[] }) {
  const W = 640;
  const H = 240;
  const padL = 44;
  const padR = 24;
  const padT = 28;
  const padB = 36;
  const kgs = points.map((p) => p.kg);
  const min = Math.floor(Math.min(...kgs) - 0.5);
  const max = Math.ceil(Math.max(...kgs) + 0.5);
  const x = (i: number) => padL + (i * (W - padL - padR)) / Math.max(1, points.length - 1);
  const y = (kg: number) => padT + ((max - kg) * (H - padT - padB)) / (max - min);
  const line = points.map((p, i) => `${x(i)},${y(p.kg)}`).join(" ");
  const first = points[0];
  const last = points[points.length - 1];
  const diff = last.kg - first.kg;
  const ticks = [min, (min + max) / 2, max];

  return (
    <Column gap="12">
      <Row gap="8" vertical="end" wrap>
        <Text variant="display-strong-xs">{last.kg} kg</Text>
        <Text variant="body-default-m" onBackground="neutral-weak">
          {diff < 0 ? "down" : "up"} {Math.abs(diff).toFixed(1)} kg since {fmtDate(first.date)}
        </Text>
      </Row>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        role="img"
        aria-label={`Weight in kilograms: ${points.map((p) => `${fmtDate(p.date)} ${p.kg}`).join(", ")}`}
        style={{ color: "var(--neutral-on-background-weak)", display: "block" }}
      >
        {ticks.map((t) => (
          <g key={t}>
            <line x1={padL} x2={W - padR} y1={y(t)} y2={y(t)} stroke="var(--neutral-alpha-weak)" strokeWidth="1" />
            <text x={padL - 8} y={y(t) + 4} textAnchor="end" fontSize="12" fill="currentColor">
              {t}
            </text>
          </g>
        ))}
        <polyline fill="none" stroke="var(--brand-solid-strong)" strokeWidth="3" strokeLinejoin="round" points={line} />
        {points.map((p, i) => (
          <g key={p.date}>
            <circle cx={x(i)} cy={y(p.kg)} r="5" fill="var(--brand-solid-strong)" />
            <text x={x(i)} y={y(p.kg) - 12} textAnchor="middle" fontSize="12" fontWeight="600" fill="var(--neutral-on-background-strong)">
              {p.kg}
            </text>
            <text x={x(i)} y={H - 10} textAnchor="middle" fontSize="12" fill="currentColor">
              {short(p.date)}
            </text>
          </g>
        ))}
      </svg>
    </Column>
  );
}
```

```ts src/lib/data.ts
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
  /** Minutes since midnight at which the patient was checked in. */
  checkedInAt?: number;
};
export type PatientRecord = {
  weights_kg: { date: string; kg: number }[];
  vaccinations: { name: string; given: string; due: string }[];
  medications: { name: string; dose: string; since: string }[];
  visits: { date: string; vet: string; reason: string; notes: string; invoice_usd: number }[];
};

export const clinic = "Pawpoint";
export const clinicLong = "Pawpoint, front-desk and records software for Hillside Veterinary Clinic";
export const clinicName = "Hillside Veterinary Clinic";
export const today = "2026-11-12";
/** The desk clock starts here (minutes since midnight): 09:52. */
export const clockStart = 9 * 60 + 52;

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
  { id: "a-05", patient: "p-107", vet: "v-2", start: "09:15", minutes: 20, reason: "Glucose curve", status: "checked_in", checkedInAt: 9 * 60 + 21 },
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

export const statusLabel: Record<Status, string> = {
  booked: "Booked",
  checked_in: "Checked in",
  in_exam: "In exam",
  done: "Done",
  cancelled: "Cancelled",
};

export function getPatient(id: string): Patient | undefined {
  return patients.find((p) => p.id === id);
}
export function getOwner(id: string): Owner {
  return owners.find((o) => o.id === id) ?? { id, name: "Unknown owner", phone: "" };
}
export function getVet(id: string): Vet {
  return vets.find((v) => v.id === id) ?? { id, name: "Unassigned", room: "" };
}

export function toMin(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}
export function fmtTime(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** The existing live booking of the same vet that overlaps the slot, if any. */
export function findClash(
  list: Appointment[],
  vet: string,
  start: string,
  minutes: number,
): Appointment | undefined {
  const s = toMin(start);
  const e = s + minutes;
  return list.find(
    (a) => a.vet === vet && a.status !== "cancelled" && s < toMin(a.start) + a.minutes && toMin(a.start) < e,
  );
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export function fmtDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}
export function daysBetween(fromIso: string, toIso: string): number {
  const utc = (iso: string) => {
    const [y, m, d] = iso.split("-").map(Number);
    return Date.UTC(y, m - 1, d);
  };
  return Math.round((utc(toIso) - utc(fromIso)) / 86400000);
}
export function ageOn(born: string, on: string): string {
  const [by, bm, bd] = born.split("-").map(Number);
  const [y, m, d] = on.split("-").map(Number);
  let months = (y - by) * 12 + (m - bm);
  if (d < bd) months -= 1;
  const years = Math.floor(months / 12);
  if (years >= 1) return `${years} ${years === 1 ? "year" : "years"}`;
  return `${months} months`;
}
```

