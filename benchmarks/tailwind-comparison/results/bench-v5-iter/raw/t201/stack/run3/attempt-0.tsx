```tsx src/app/page.tsx
import type { Metadata } from "next";
import { DeskShell } from "@/components/desk/DeskShell";
import { Schedule } from "@/components/desk/Schedule";

export const metadata: Metadata = {
  title: "Today's schedule | Pawpoint",
  description: "Front-desk schedule, waiting list and bookings for Hillside Veterinary Clinic.",
};

export default function Page() {
  return (
    <DeskShell>
      <Schedule />
    </DeskShell>
  );
}
```

```tsx src/app/patients/[id]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Button, Column, Grid, Heading, Icon, Row, Tag, Text } from "@once-ui-system/core";
import { DeskShell } from "@/components/desk/DeskShell";
import { AlertTags } from "@/components/desk/AlertTags";
import { WeightChart } from "@/components/desk/WeightChart";
import {
  ageLabel,
  daysFromToday,
  formatDate,
  getOwner,
  getPatient,
  getVet,
  money,
  patients,
  records,
  today,
} from "@/lib/data";

export function generateStaticParams() {
  return patients.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const p = getPatient(id);
  return { title: p ? `${p.name} | Pawpoint` : "Patient not found | Pawpoint" };
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Column as="section" aria-label={title} background="surface" border radius="l" padding="20" gap="16" fillWidth minWidth="0px">
      <Heading as="h2" variant="heading-strong-l">
        {title}
      </Heading>
      {children}
    </Column>
  );
}

export default async function PatientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const patient = getPatient(id);
  if (!patient) notFound();
  const owner = getOwner(patient.owner);
  const record = records[patient.id];

  const weights = record?.weights_kg ?? [];
  const first = weights[0];
  const last = weights[weights.length - 1];
  const delta = first && last ? last.kg - first.kg : 0;
  const pct = first ? (delta / first.kg) * 100 : 0;

  return (
    <DeskShell>
      <Row>
        <Button href="/" variant="tertiary" size="s" prefixIcon="chevronLeft">
          Today&rsquo;s schedule
        </Button>
      </Row>

      <Row fillWidth gap="24" wrap vertical="start" horizontal="between">
        <Row gap="16" vertical="center">
          <Row center width="72" height="72" radius="full" background="brand-alpha-weak" border="brand-alpha-medium">
            <Icon name="paw" size="l" onBackground="brand-strong" />
          </Row>
          <Column gap="4">
            <Heading as="h1" variant="display-strong-s">
              {patient.name}
            </Heading>
            <Text variant="body-default-m" onBackground="neutral-weak">
              {patient.species}, {patient.breed} &middot; {ageLabel(patient.born)} &middot; {patient.sex}
            </Text>
          </Column>
        </Row>
        <Column gap="0" background="surface" border radius="l" padding="16" minWidth="16rem">
          <Text variant="label-default-s" onBackground="neutral-weak">
            Owner
          </Text>
          <Text variant="label-strong-l">{owner?.name}</Text>
          <Button href={`tel:${owner?.phone.replace(/\s/g, "")}`} variant="link" size="s" prefixIcon="chat" aria-label={`Call ${owner?.name}`}>
            {owner?.phone}
          </Button>
        </Column>
      </Row>

      {patient.alerts.length > 0 && (
        <Column
          role="region"
          aria-label="Medical alerts"
          gap="12"
          padding="20"
          radius="l"
          background="danger-alpha-medium"
          border="danger-alpha-strong"
          borderWidth={2}
        >
          <Row gap="8" vertical="center">
            <Icon name="warning" size="m" onBackground="danger-strong" />
            <Heading as="h2" variant="heading-strong-l" onBackground="danger-strong">
              Medical alerts
            </Heading>
          </Row>
          <AlertTags alerts={patient.alerts} size="l" />
        </Column>
      )}

      {!record ? (
        <Panel title="Record">
          <Text variant="body-default-m" onBackground="neutral-weak">
            No visit history, vaccinations or medications are on file for {patient.name} yet.
          </Text>
        </Panel>
      ) : (
        <>
          <Grid columns="2" m={{ columns: "1" }} gap="24">
            <Panel title="Weight trend">
              <WeightChart points={weights} />
              <Text variant="body-default-m">
                {last?.kg} kg on {last ? formatDate(last.date) : ""}, down {Math.abs(delta).toFixed(1)} kg (
                {Math.abs(pct).toFixed(0)}%) since {first ? formatDate(first.date) : ""}.
              </Text>
            </Panel>

            <Column gap="24" minWidth="0px">
              <Panel title="Vaccinations">
                <Column as="ul" gap="0" margin="0" padding="0" style={{ listStyle: "none" }}>
                  {record.vaccinations.map((v, i) => {
                    const days = daysFromToday(v.due);
                    const overdue = days < 0;
                    const soon = !overdue && days <= 60;
                    return (
                      <Row
                        as="li"
                        key={v.name}
                        gap="12"
                        paddingY="12"
                        horizontal="between"
                        vertical="center"
                        wrap
                        borderTop={i === 0 ? undefined : true}
                      >
                        <Column gap="0">
                          <Text variant="label-strong-m">{v.name}</Text>
                          <Text variant="body-default-s" onBackground="neutral-weak">
                            Given {formatDate(v.given)} &middot; due {formatDate(v.due)}
                          </Text>
                        </Column>
                        {overdue ? (
                          <Tag scheme="danger" prefixIcon="warning" label={`Overdue by ${Math.abs(days)} days`} />
                        ) : soon ? (
                          <Tag scheme="warning" prefixIcon="time" label={`Due in ${days} days`} />
                        ) : (
                          <Tag scheme="success" prefixIcon="check" label="Up to date" />
                        )}
                      </Row>
                    );
                  })}
                </Column>
                <Text variant="body-default-xs" onBackground="neutral-weak">
                  Checked against today, {formatDate(today)}.
                </Text>
              </Panel>

              <Panel title="Current medications">
                <Column as="ul" gap="0" margin="0" padding="0" style={{ listStyle: "none" }}>
                  {record.medications.map((m, i) => (
                    <Row as="li" key={m.name} gap="12" paddingY="12" horizontal="between" wrap borderTop={i === 0 ? undefined : true}>
                      <Column gap="0">
                        <Text variant="label-strong-m">{m.name}</Text>
                        <Text variant="body-default-s">{m.dose}</Text>
                      </Column>
                      <Text variant="body-default-s" onBackground="neutral-weak">
                        Since {formatDate(m.since)}
                      </Text>
                    </Row>
                  ))}
                </Column>
              </Panel>
            </Column>
          </Grid>

          <Panel title="Visit history">
            <Column as="ol" gap="0" margin="0" padding="0" style={{ listStyle: "none" }}>
              {record.visits.map((v, i) => (
                <Column as="li" key={v.date} gap="8" paddingY="16" borderTop={i === 0 ? undefined : true}>
                  <Row horizontal="between" gap="12" wrap vertical="center">
                    <Row gap="12" vertical="center" wrap>
                      <Text variant="label-strong-l">{formatDate(v.date)}</Text>
                      <Text variant="label-default-m">{v.reason}</Text>
                    </Row>
                    <Text variant="body-default-s" onBackground="neutral-weak">
                      {getVet(v.vet)?.name} &middot; {money(v.invoice_usd)}
                    </Text>
                  </Row>
                  <Text variant="body-default-m" onBackground="neutral-strong">
                    {v.notes}
                  </Text>
                </Column>
              ))}
            </Column>
          </Panel>
        </>
      )}
    </DeskShell>
  );
}
```

```tsx src/components/desk/AlertTags.tsx
import { Row, Tag } from "@once-ui-system/core";

/**
 * Medical alerts: solid red tags with a warning icon. Used everywhere a
 * patient appears so an alert is never one click away.
 */
export function AlertTags({ alerts, size = "m" }: { alerts: string[]; size?: "s" | "m" | "l" }) {
  if (alerts.length === 0) return null;
  return (
    <Row gap="4" wrap role="list" aria-label="Medical alerts">
      {alerts.map((alert) => (
        <Row key={alert} role="listitem" fit>
          <Tag scheme="danger" size={size} prefixIcon="warning" label={alert} />
        </Row>
      ))}
    </Row>
  );
}
```

```tsx src/components/desk/DeskShell.tsx
import { Avatar, Column, Icon, Row, SmartLink, Text, VisuallyHidden } from "@once-ui-system/core";
import { clinic, user } from "@/lib/data";
import { PatientSearch } from "./PatientSearch";

export function DeskShell({ children }: { children: React.ReactNode }) {
  return (
    <Column fillWidth flex={1} background="page">
      <VisuallyHidden as="a" href="#main" focusable>
        Skip to content
      </VisuallyHidden>
      <Row
        as="header"
        fillWidth
        background="surface"
        borderBottom
        paddingX="16"
        paddingY="12"
        gap="16"
        vertical="center"
        wrap
        position="sticky"
        top="0"
        zIndex={5}
      >
        <SmartLink href="/">
          <Row gap="12" vertical="center" fit>
            <Row
              center
              width="40"
              height="40"
              radius="m"
              solid="brand-strong"
              onSolid="brand-strong"
            >
              <Icon name="paw" size="m" onSolid="brand-strong" />
            </Row>
            <Column gap="0">
              <Text variant="heading-strong-m">{clinic}</Text>
              <Text variant="body-default-xs" onBackground="neutral-weak" s={{ hide: true }}>
                Hillside Veterinary Clinic
              </Text>
            </Column>
          </Row>
        </SmartLink>
        <Row flex={1} minWidth="240px" maxWidth="l" role="search">
          <PatientSearch />
        </Row>
        <Row gap="12" vertical="center" fit marginLeft="auto">
          <Column gap="0" horizontal="end" s={{ hide: true }}>
            <Text variant="label-strong-s">{user.name}</Text>
            <Text variant="body-default-xs" onBackground="neutral-weak">
              {user.role}
            </Text>
          </Column>
          <Avatar value="RL" size="m" />
        </Row>
      </Row>
      <Column as="main" id="main" fillWidth horizontal="center" paddingX="16" paddingY="24" s={{ paddingY: "16" }}>
        <Column fillWidth maxWidth="xl" gap="24">
          {children}
        </Column>
      </Column>
    </Column>
  );
}
```

```tsx src/components/desk/PatientSearch.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, Column, Icon, Input, Row, Text } from "@once-ui-system/core";
import { getOwner, patients } from "@/lib/data";
import { AlertTags } from "./AlertTags";

export function PatientSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return patients.filter((p) => {
      const owner = getOwner(p.owner);
      return p.name.toLowerCase().includes(q) || (owner?.name.toLowerCase().includes(q) ?? false);
    });
  }, [query]);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const show = open && query.trim().length > 0;

  return (
    <div
      ref={wrapRef}
      style={{ position: "relative", width: "100%" }}
      onKeyDown={(e) => {
        if (e.key === "Escape") setOpen(false);
        if (e.key === "Enter" && results.length > 0) {
          e.preventDefault();
          setOpen(false);
          router.push(`/patients/${results[0].id}`);
        }
      }}
    >
      <Input
        id="patient-search"
        type="search"
        label="Search patient or owner"
        size="s"
        value={query}
        autoComplete="off"
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        prefix={<Icon name="search" size="s" onBackground="neutral-weak" />}
      />
      {show && (
        <Column
          background="overlay"
          border
          radius="l"
          shadow="l"
          padding="8"
          gap="4"
          fillWidth
          style={{ position: "absolute", top: "calc(100% + 8px)", left: 0, zIndex: 20, maxHeight: "70vh", overflowY: "auto" }}
          role="region"
          aria-label="Search results"
          aria-live="polite"
        >
          {results.length === 0 ? (
            <Text variant="body-default-s" onBackground="neutral-weak" padding="12">
              No patient or owner matches &ldquo;{query.trim()}&rdquo;.
            </Text>
          ) : (
            results.map((p) => {
              const owner = getOwner(p.owner);
              return (
                <Card
                  key={p.id}
                  href={`/patients/${p.id}`}
                  fillWidth
                  padding="12"
                  radius="m"
                  gap="8"
                  onClick={() => setOpen(false)}
                  aria-label={`Open record: ${p.name}, owner ${owner?.name ?? ""}`}
                >
                  <Row fillWidth horizontal="between" vertical="center" gap="12" wrap>
                    <Column gap="2">
                      <Text variant="label-strong-m">{p.name}</Text>
                      <Text variant="body-default-s" onBackground="neutral-weak">
                        {p.species}, {p.breed} &middot; {owner?.name}
                      </Text>
                    </Column>
                    <Icon name="chevronRight" size="s" onBackground="neutral-weak" />
                  </Row>
                  <AlertTags alerts={p.alerts} size="s" />
                </Card>
              );
            })
          )}
        </Column>
      )}
    </div>
  );
}
```

```tsx src/components/desk/Schedule.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Column,
  Dialog,
  Grid,
  Heading,
  Icon,
  Input,
  Row,
  SegmentedControl,
  Select,
  SmartLink,
  Tag,
  Text,
  useToast,
} from "@once-ui-system/core";
import {
  type Appointment,
  type Status,
  findClash,
  getOwner,
  getPatient,
  getVet,
  initialAppointments,
  nowMinutes,
  patients,
  statusLabel,
  toHHMM,
  toMinutes,
  vets,
} from "@/lib/data";
import { AlertTags } from "./AlertTags";

const CLOSING = 17 * 60;
const firstSlot = Math.ceil(nowMinutes / 15) * 15;
const slots: string[] = [];
for (let t = firstSlot; t < CLOSING; t += 15) slots.push(toHHMM(t));
const durations = [15, 20, 30, 45, 60];

const statusScheme: Record<Status, "neutral" | "info" | "accent" | "success"> = {
  booked: "neutral",
  checked_in: "info",
  in_exam: "accent",
  done: "success",
  cancelled: "neutral",
};

const nextStatus: Partial<Record<Status, { to: Status; label: string }>> = {
  booked: { to: "checked_in", label: "Check in" },
  checked_in: { to: "in_exam", label: "Start exam" },
  in_exam: { to: "done", label: "Mark done" },
};

function waitLabel(mins: number): string {
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min`;
  return `${Math.floor(mins / 60)} h ${mins % 60} min`;
}

export function Schedule() {
  const { addToast } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const [vetFilter, setVetFilter] = useState("all");
  const [now, setNow] = useState(nowMinutes);
  const [dialogOpen, setDialogOpen] = useState(false);

  // The desk clock moves on while the page is open, so waits keep counting.
  useEffect(() => {
    const start = Date.now();
    const id = window.setInterval(() => {
      setNow(nowMinutes + Math.floor((Date.now() - start) / 60000));
    }, 15000);
    return () => window.clearInterval(id);
  }, []);

  const sorted = useMemo(
    () =>
      [...appointments].sort(
        (a, b) => toMinutes(a.start) - toMinutes(b.start) || a.vet.localeCompare(b.vet),
      ),
    [appointments],
  );
  const visible = sorted.filter((a) => vetFilter === "all" || a.vet === vetFilter);

  const waiting = appointments
    .filter((a) => a.status === "checked_in")
    .sort((a, b) => (a.checkedInAt ?? 0) - (b.checkedInAt ?? 0));
  const inExam = appointments.filter((a) => a.status === "in_exam");
  const count = (s: Status) => appointments.filter((a) => a.status === s).length;

  const advance = (a: Appointment) => {
    const step = nextStatus[a.status];
    if (!step) return;
    setAppointments((list) =>
      list.map((x) =>
        x.id === a.id
          ? { ...x, status: step.to, checkedInAt: step.to === "checked_in" ? now : x.checkedInAt }
          : x,
      ),
    );
    const name = getPatient(a.patient)?.name ?? "Patient";
    addToast({
      variant: "success",
      message:
        step.to === "checked_in"
          ? `${name} checked in. Added to the waiting list.`
          : step.to === "in_exam"
            ? `${name} is in the exam room.`
            : `${name} is done.`,
    });
  };

  const addAppointment = (a: Omit<Appointment, "id">) => {
    const id = `a-${String(appointments.length + 1).padStart(2, "0")}`;
    setAppointments((list) => [...list, { ...a, id }]);
    const name = getPatient(a.patient)?.name ?? "Patient";
    addToast({
      variant: "success",
      message: `${name} booked with ${getVet(a.vet)?.name} at ${a.start}.`,
    });
  };

  return (
    <>
      <Row fillWidth horizontal="between" vertical="end" gap="16" wrap>
        <Column gap="4">
          <Heading as="h1" variant="display-strong-xs">
            Today&rsquo;s schedule
          </Heading>
          <Text variant="body-default-m" onBackground="neutral-weak">
            Thursday, 12 November 2026 &middot; desk clock {toHHMM(now)}
          </Text>
        </Column>
        <Button prefixIcon="plus" size="l" onClick={() => setDialogOpen(true)}>
          Book appointment
        </Button>
      </Row>

      <Grid columns="4" s={{ columns: "2" }} gap="12" role="list" aria-label="Today at a glance">
        <Stat label="Waiting" value={count("checked_in")} tone={count("checked_in") > 0 ? "info" : "neutral"} />
        <Stat label="In exam" value={count("in_exam")} tone="accent" />
        <Stat label="Still to arrive" value={count("booked")} tone="neutral" />
        <Stat label="Done" value={count("done")} tone="success" />
      </Grid>

      <Row fillWidth gap="24" direction="row-reverse" vertical="start" m={{ direction: "column" }}>
        <Column
          as="aside"
          aria-label="Waiting list"
          gap="16"
          width="24rem"
          minWidth="20rem"
          m={{ width: "100%", minWidth: "0px" }}
        >
          <Column background="surface" border radius="l" padding="20" gap="16">
            <Row horizontal="between" vertical="center">
              <Heading as="h2" variant="heading-strong-l">
                Waiting list
              </Heading>
              <Tag scheme="info" label={`${waiting.length} waiting`} />
            </Row>
            {waiting.length === 0 ? (
              <Text variant="body-default-m" onBackground="neutral-weak">
                Nobody is waiting. Checked-in patients appear here.
              </Text>
            ) : (
              <Column as="ol" gap="12" margin="0" padding="0" style={{ listStyle: "none" }}>
                {waiting.map((a, i) => {
                  const p = getPatient(a.patient);
                  const v = getVet(a.vet);
                  const waited = Math.max(0, now - (a.checkedInAt ?? now));
                  return (
                    <Column
                      as="li"
                      key={a.id}
                      gap="8"
                      padding="12"
                      radius="m"
                      border={i === 0 ? "brand-alpha-strong" : true}
                      background={i === 0 ? "brand-alpha-weak" : "page"}
                    >
                      <Row horizontal="between" vertical="center" gap="8" wrap>
                        <Row gap="8" vertical="center">
                          <Text variant="label-strong-s" onBackground="neutral-weak">
                            {i + 1}.
                          </Text>
                          <SmartLink href={`/patients/${a.patient}`}>
                            <Text variant="label-strong-l">{p?.name}</Text>
                          </SmartLink>
                          {i === 0 && <Tag scheme="brand" size="s" label="Next" />}
                        </Row>
                        <Row gap="4" vertical="center">
                          <Icon name="time" size="s" onBackground={waited >= 30 ? "warning-strong" : "neutral-weak"} />
                          <Text variant="label-strong-s" onBackground={waited >= 30 ? "warning-strong" : "neutral-strong"}>
                            Waiting {waitLabel(waited)}
                          </Text>
                        </Row>
                      </Row>
                      <Text variant="body-default-s" onBackground="neutral-weak">
                        {a.reason} &middot; {v?.name}, {v?.room}
                      </Text>
                      <AlertTags alerts={p?.alerts ?? []} size="s" />
                      <Row>
                        <Button size="s" variant="secondary" onClick={() => advance(a)} aria-label={`Start exam for ${p?.name}`}>
                          Start exam
                        </Button>
                      </Row>
                    </Column>
                  );
                })}
              </Column>
            )}
          </Column>

          <Column background="surface" border radius="l" padding="20" gap="12">
            <Heading as="h2" variant="heading-strong-l">
              In exam now
            </Heading>
            {inExam.length === 0 ? (
              <Text variant="body-default-m" onBackground="neutral-weak">
                No exams in progress.
              </Text>
            ) : (
              <Column as="ul" gap="12" margin="0" padding="0" style={{ listStyle: "none" }}>
                {inExam.map((a) => {
                  const p = getPatient(a.patient);
                  const v = getVet(a.vet);
                  return (
                    <Column as="li" key={a.id} gap="4">
                      <Row horizontal="between" gap="8" wrap>
                        <SmartLink href={`/patients/${a.patient}`}>
                          <Text variant="label-strong-m">{p?.name}</Text>
                        </SmartLink>
                        <Text variant="body-default-s" onBackground="neutral-weak">
                          {v?.room} &middot; {v?.name}
                        </Text>
                      </Row>
                      <AlertTags alerts={p?.alerts ?? []} size="s" />
                    </Column>
                  );
                })}
              </Column>
            )}
          </Column>
        </Column>

        <Column fillWidth gap="12" minWidth="0px">
          <Row fillWidth horizontal="between" vertical="center" gap="12" wrap>
            <Heading as="h2" variant="heading-strong-l">
              Appointments
            </Heading>
            <SegmentedControl
              defaultValue="all"
              onChange={(v) => setVetFilter(v)}
              buttons={[
                { value: "all", label: "All vets" },
                ...vets.map((v) => ({ value: v.id, label: v.name })),
              ]}
            />
          </Row>

          <Column as="ul" background="surface" border radius="l" margin="0" padding="0" overflow="hidden" style={{ listStyle: "none" }}>
            {visible.map((a, i) => (
              <AppointmentRow key={a.id} a={a} first={i === 0} onAdvance={advance} />
            ))}
            {visible.length === 0 && (
              <Text as="li" variant="body-default-m" onBackground="neutral-weak" padding="24">
                No appointments for this vet today.
              </Text>
            )}
          </Column>
        </Column>
      </Row>

      <BookDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        appointments={appointments}
        onBook={(a) => {
          addAppointment(a);
          setDialogOpen(false);
        }}
      />
    </>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone: "neutral" | "info" | "accent" | "success" }) {
  return (
    <Column as="div" role="listitem" background="surface" border radius="l" padding="16" gap="4">
      <Text variant="label-default-s" onBackground="neutral-weak">
        {label}
      </Text>
      <Text variant="display-strong-s" onBackground={tone === "neutral" ? "neutral-strong" : `${tone}-strong`}>
        {value}
      </Text>
    </Column>
  );
}

function AppointmentRow({
  a,
  first,
  onAdvance,
}: {
  a: Appointment;
  first: boolean;
  onAdvance: (a: Appointment) => void;
}) {
  const p = getPatient(a.patient);
  const o = p ? getOwner(p.owner) : undefined;
  const v = getVet(a.vet);
  const step = nextStatus[a.status];
  const cancelled = a.status === "cancelled";
  const end = toHHMM(toMinutes(a.start) + a.minutes);
  return (
    <Row
      as="li"
      fillWidth
      gap="16"
      padding="16"
      vertical="start"
      borderTop={first ? undefined : true}
      background={a.urgent && !cancelled ? "warning-alpha-weak" : undefined}
      s={{ direction: "column", gap: "8" }}
      style={{
        opacity: cancelled ? 0.6 : 1,
        boxShadow: a.urgent && !cancelled ? "inset 4px 0 0 var(--warning-solid-strong)" : undefined,
      }}
    >
      <Column width="6rem" gap="0" s={{ width: "100%" }}>
        <Text variant="heading-strong-l">{a.start}</Text>
        <Text variant="body-default-xs" onBackground="neutral-weak">
          until {end} &middot; {a.minutes} min
        </Text>
      </Column>

      <Column flex={1} gap="4" minWidth="0px">
        <Row gap="8" vertical="center" wrap>
          <SmartLink href={`/patients/${a.patient}`}>
            <Text variant="label-strong-l" onBackground="brand-strong" style={cancelled ? { textDecoration: "line-through" } : undefined}>
              {p?.name}
            </Text>
          </SmartLink>
          <Text variant="body-default-s" onBackground="neutral-weak">
            {p?.species}, {p?.breed}
          </Text>
          {a.urgent && !cancelled && <Tag scheme="warning" size="m" prefixIcon="bolt" label="Urgent" />}
        </Row>
        <Text variant="body-default-m">{a.reason}</Text>
        <Text variant="body-default-s" onBackground="neutral-weak">
          {o?.name} &middot; {o?.phone}
        </Text>
        <AlertTags alerts={p?.alerts ?? []} size="s" />
      </Column>

      <Column width="11rem" gap="0" s={{ width: "100%" }}>
        <Text variant="label-default-m">{v?.name}</Text>
        <Text variant="body-default-s" onBackground="neutral-weak">
          {v?.room}
        </Text>
      </Column>

      <Column width="10rem" gap="8" s={{ width: "100%" }} horizontal="start">
        <Tag scheme={statusScheme[a.status]} size="m" label={statusLabel[a.status]} />
        {step && (
          <Button
            size="m"
            variant={a.status === "booked" ? "primary" : "secondary"}
            onClick={() => onAdvance(a)}
            aria-label={`${step.label}: ${p?.name}, ${a.start}`}
          >
            {step.label}
          </Button>
        )}
      </Column>
    </Row>
  );
}

function BookDialog({
  open,
  onClose,
  appointments,
  onBook,
}: {
  open: boolean;
  onClose: () => void;
  appointments: Appointment[];
  onBook: (a: Omit<Appointment, "id">) => void;
}) {
  const [patient, setPatient] = useState("");
  const [vet, setVet] = useState("");
  const [time, setTime] = useState("");
  const [minutes, setMinutes] = useState("20");
  const [reason, setReason] = useState("");

  const mins = Number(minutes);
  const complete = Boolean(patient && vet && time && reason.trim());
  const clash = vet && time ? findClash(appointments, vet, time, mins) : undefined;
  const pastClosing = time ? toMinutes(time) + mins > CLOSING : false;
  const patientRecord = getPatient(patient);

  // Earliest slot for this vet, at or after the chosen time, that does not clash.
  const suggestion = useMemo(() => {
    if (!clash || !vet || !time) return undefined;
    return slots.find(
      (s) =>
        toMinutes(s) >= toMinutes(time) &&
        toMinutes(s) + mins <= CLOSING &&
        !findClash(appointments, vet, s, mins),
    );
  }, [clash, vet, time, mins, appointments]);

  const reset = () => {
    setPatient("");
    setVet("");
    setTime("");
    setMinutes("20");
    setReason("");
  };

  const canBook = complete && !clash && !pastClosing;

  return (
    <Dialog
      open={open}
      onClose={() => {
        onClose();
        reset();
      }}
      title="Book appointment"
      description="Pick the patient, the vet and a time. A vet cannot be booked twice at once."
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!canBook) return;
          onBook({ patient, vet, start: time, minutes: mins, reason: reason.trim(), status: "booked" });
          reset();
        }}
      >
        <Column gap="16" paddingTop="8">
          <Select
            id="book-patient"
            label="Patient"
            value={patient}
            onSelect={(v) => setPatient(String(v))}
            searchable
            options={patients.map((p) => ({
              value: p.id,
              label: `${p.name} (${p.species}), ${getOwner(p.owner)?.name}`,
            }))}
          />
          {patientRecord && patientRecord.alerts.length > 0 && <AlertTags alerts={patientRecord.alerts} />}
          <Select
            id="book-vet"
            label="Vet"
            value={vet}
            onSelect={(v) => setVet(String(v))}
            options={vets.map((v) => ({ value: v.id, label: `${v.name}, ${v.room}` }))}
          />
          <Row gap="12" s={{ direction: "column" }}>
            <Select
              id="book-time"
              label="Time"
              value={time}
              onSelect={(v) => setTime(String(v))}
              options={slots.map((s) => ({ value: s, label: s }))}
            />
            <Select
              id="book-length"
              label="Length"
              value={minutes}
              onSelect={(v) => setMinutes(String(v))}
              options={durations.map((d) => ({ value: String(d), label: `${d} min` }))}
            />
          </Row>
          <Input id="book-reason" label="Reason for visit" value={reason} onChange={(e) => setReason(e.target.value)} />

          {clash && (
            <Column
              role="alert"
              gap="8"
              padding="12"
              radius="m"
              background="danger-alpha-weak"
              border="danger-alpha-strong"
            >
              <Row gap="8" vertical="start">
                <Icon name="danger" size="s" onBackground="danger-strong" />
                <Text variant="body-default-s" onBackground="danger-strong">
                  {getVet(vet)?.name} already has {getPatient(clash.patient)?.name} at {clash.start} to{" "}
                  {toHHMM(toMinutes(clash.start) + clash.minutes)}. Choose another time or vet.
                </Text>
              </Row>
              {suggestion && (
                <Row>
                  <Button size="s" variant="secondary" type="button" onClick={() => setTime(suggestion)}>
                    Use {suggestion} instead
                  </Button>
                </Row>
              )}
            </Column>
          )}
          {!clash && pastClosing && (
            <Text role="alert" variant="body-default-s" onBackground="danger-strong">
              That runs past closing at 17:00. Pick an earlier time or a shorter visit.
            </Text>
          )}

          <Row gap="12" horizontal="end">
            <Button
              type="button"
              variant="tertiary"
              onClick={() => {
                onClose();
                reset();
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!canBook}>
              Book appointment
            </Button>
          </Row>
        </Column>
      </form>
    </Dialog>
  );
}
```

```tsx src/components/desk/WeightChart.tsx
"use client";

import { LineChart } from "@once-ui-system/core/data";

const fmt = new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric", timeZone: "UTC" });

export function WeightChart({ points }: { points: { date: string; kg: number }[] }) {
  const data = points.map((p) => ({ label: fmt.format(new Date(`${p.date}T00:00:00Z`)), kg: p.kg }));
  return (
    <LineChart
      fillWidth
      height={18}
      title="Weight (kg)"
      description="At each visit"
      series={[{ key: "kg" }]}
      data={data}
      curve="linear"
    />
  );
}
```

```ts src/lib/data.ts
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
export interface Visit {
  date: string;
  vet: string;
  reason: string;
  notes: string;
  invoice_usd: number;
}
export interface PatientRecord {
  weights_kg: { date: string; kg: number }[];
  vaccinations: { name: string; given: string; due: string }[];
  medications: { name: string; dose: string; since: string }[];
  visits: Visit[];
}

export const clinic = "Pawpoint";
export const clinicTagline = "Front-desk and records software for Hillside Veterinary Clinic";
export const today = "2026-11-12";
/** The desk clock for the demo, in minutes since midnight (09:52). */
export const nowMinutes = 9 * 60 + 52;

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
  { id: "a-05", patient: "p-107", vet: "v-2", start: "09:15", minutes: 20, reason: "Glucose curve", status: "checked_in", checkedInAt: 9 * 60 + 4 },
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
export function getOwner(id: string): Owner | undefined {
  return owners.find((o) => o.id === id);
}
export function getVet(id: string): Vet | undefined {
  return vets.find((v) => v.id === id);
}

export function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}
export function toHHMM(total: number): string {
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** Returns the booking that overlaps the proposed slot for this vet, if any. */
export function findClash(
  list: Appointment[],
  vetId: string,
  start: string,
  minutes: number,
): Appointment | undefined {
  const s = toMinutes(start);
  const e = s + minutes;
  return list.find((a) => {
    if (a.vet !== vetId || a.status === "cancelled") return false;
    const as = toMinutes(a.start);
    const ae = as + a.minutes;
    return s < ae && as < e;
  });
}

const dateFmt = new Intl.DateTimeFormat("en-US", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
export function formatDate(iso: string): string {
  return dateFmt.format(new Date(`${iso}T00:00:00Z`));
}
const shortFmt = new Intl.DateTimeFormat("en-US", { month: "short", year: "2-digit", timeZone: "UTC" });
export function formatMonth(iso: string): string {
  return shortFmt.format(new Date(`${iso}T00:00:00Z`));
}

export function ageLabel(born: string): string {
  const b = new Date(`${born}T00:00:00Z`);
  const t = new Date(`${today}T00:00:00Z`);
  let years = t.getUTCFullYear() - b.getUTCFullYear();
  const beforeBirthday =
    t.getUTCMonth() < b.getUTCMonth() ||
    (t.getUTCMonth() === b.getUTCMonth() && t.getUTCDate() < b.getUTCDate());
  if (beforeBirthday) years -= 1;
  if (years < 1) {
    const months = (t.getUTCFullYear() - b.getUTCFullYear()) * 12 + t.getUTCMonth() - b.getUTCMonth();
    return `${months} months`;
  }
  return `${years} years`;
}

/** Days between today and an ISO date: negative when the date has passed. */
export function daysFromToday(iso: string): number {
  const a = new Date(`${iso}T00:00:00Z`).getTime();
  const b = new Date(`${today}T00:00:00Z`).getTime();
  return Math.round((a - b) / 86400000);
}

export function money(n: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}
```

