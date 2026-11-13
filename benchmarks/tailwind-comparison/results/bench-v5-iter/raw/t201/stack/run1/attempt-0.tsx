```tsx src/app/page.tsx
import { Shell } from "@/components/pawpoint/Shell";
import { Schedule } from "@/components/pawpoint/Schedule";

export const metadata = {
  title: "Today's schedule · Pawpoint",
  description: "Front-desk schedule, check-in and waiting room for Hillside Veterinary Clinic.",
};

export default function Page() {
  return (
    <Shell>
      <Schedule />
    </Shell>
  );
}
```

```tsx src/app/patients/[id]/page.tsx
import { notFound } from "next/navigation";
import { Shell } from "@/components/pawpoint/Shell";
import { PatientRecordView } from "@/components/pawpoint/PatientRecord";
import { getPatient, patients } from "@/lib/data";

export function generateStaticParams() {
  return patients.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const patient = getPatient(id);
  return { title: `${patient?.name ?? "Patient"} · Pawpoint` };
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const patient = getPatient(id);
  if (!patient) notFound();
  return (
    <Shell>
      <PatientRecordView patient={patient} />
    </Shell>
  );
}
```

```tsx src/components/pawpoint/Alerts.tsx
import { Column, Icon, Row, Tag, Text } from "@once-ui-system/core";

/** Inline alert tags: used wherever a patient appears in a list. */
export function AlertTags({ alerts, compact }: { alerts: string[]; compact?: boolean }) {
  if (alerts.length === 0) return null;
  return (
    <Row gap="4" wrap role="list" aria-label="Medical alerts">
      {alerts.map((alert) => (
        <Tag
          key={alert}
          role="listitem"
          scheme="danger"
          size={compact ? "s" : "m"}
          prefixIcon="warning"
          label={alert}
        />
      ))}
    </Row>
  );
}

/** The loud version for the top of a record. */
export function AlertBanner({ name, alerts }: { name: string; alerts: string[] }) {
  if (alerts.length === 0) return null;
  return (
    <Row
      role="alert"
      background="danger-alpha-medium"
      border="danger-alpha-strong"
      borderWidth={2}
      radius="l"
      padding="16"
      gap="16"
      vertical="center"
      wrap
    >
      <Icon name="warning" size="l" onBackground="danger-strong" />
      <Column gap="4" flex={1} minWidth={14}>
        <Text variant="label-strong-s" onBackground="danger-strong">
          Medical alerts for {name}
        </Text>
        <Row gap="24" wrap>
          {alerts.map((alert) => (
            <Text key={alert} variant="heading-strong-m" onBackground="danger-strong">
              {alert}
            </Text>
          ))}
        </Row>
      </Column>
    </Row>
  );
}
```

```tsx src/components/pawpoint/PatientRecord.tsx
import { Avatar, Button, Column, Heading, Icon, Row, Tag, Text, VisuallyHidden } from "@once-ui-system/core";
import {
  type Patient,
  ageLabel,
  appointments,
  daysBetween,
  formatDate,
  getOwner,
  getVet,
  records,
  statusLabel,
  today,
} from "@/lib/data";
import { AlertBanner } from "./Alerts";

function Panel({
  title,
  icon,
  children,
  id,
}: {
  title: string;
  icon: "paw" | "clipboard" | "bolt" | "calendar" | "trend" | "heart";
  id: string;
  children: React.ReactNode;
}) {
  return (
    <Column
      as="section"
      aria-labelledby={id}
      background="surface"
      border
      radius="l"
      padding="20"
      gap="16"
      fillWidth
    >
      <Row gap="8" vertical="center">
        <Icon name={icon} size="s" onBackground="brand-strong" />
        <Heading as="h2" id={id} variant="heading-strong-l">
          {title}
        </Heading>
      </Row>
      {children}
    </Column>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <Column gap="2" minWidth={10} flex={1}>
      <Text variant="label-default-s" onBackground="neutral-weak">
        {label}
      </Text>
      <Text variant="body-strong-m">{value}</Text>
    </Column>
  );
}

function WeightChart({ points }: { points: { date: string; kg: number }[] }) {
  const w = 600;
  const h = 220;
  const pad = { l: 44, r: 16, t: 20, b: 32 };
  const t0 = Date.parse(points[0].date);
  const t1 = Date.parse(points[points.length - 1].date);
  const min = 28;
  const max = 32;
  const x = (d: string) => pad.l + ((Date.parse(d) - t0) / (t1 - t0)) * (w - pad.l - pad.r);
  const y = (kg: number) => pad.t + (1 - (kg - min) / (max - min)) * (h - pad.t - pad.b);
  const path = points.map((p, i) => `${i ? "L" : "M"}${x(p.date).toFixed(1)} ${y(p.kg).toFixed(1)}`).join(" ");
  const first = points[0];
  const last = points[points.length - 1];
  const delta = last.kg - first.kg;
  const pct = (delta / first.kg) * 100;

  return (
    <Column gap="12">
      <Row gap="8" vertical="center" wrap>
        <Text variant="display-strong-xs">{last.kg} kg</Text>
        <Tag
          scheme="warning"
          prefixIcon="trendDown"
          label={`${delta.toFixed(1)} kg (${pct.toFixed(1)}%) since ${formatDate(first.date)}`}
        />
      </Row>
      <Row onBackground="brand-strong" fillWidth>
        <svg
          viewBox={`0 0 ${w} ${h}`}
          role="img"
          aria-label={`Weight fell from ${first.kg} kg to ${last.kg} kg over ${points.length} visits`}
          style={{ width: "100%", height: "auto", maxHeight: 260 }}
        >
          {[28, 29, 30, 31, 32].map((v) => (
            <g key={v}>
              <line x1={pad.l} x2={w - pad.r} y1={y(v)} y2={y(v)} stroke="currentColor" opacity="0.12" />
              <text x={pad.l - 8} y={y(v) + 4} textAnchor="end" fontSize="12" fill="currentColor" opacity="0.7">
                {v}
              </text>
            </g>
          ))}
          <path d={path} fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
          {points.map((p, i) => (
            <g key={p.date}>
              <circle cx={x(p.date)} cy={y(p.kg)} r="5" fill="currentColor" />
              <text
                x={x(p.date)}
                y={y(p.kg) - 10}
                textAnchor={i === 0 ? "start" : i === points.length - 1 ? "end" : "middle"}
                fontSize="12"
                fontWeight="600"
                fill="currentColor"
              >
                {p.kg}
              </text>
              <text
                x={x(p.date)}
                y={h - 8}
                textAnchor={i === 0 ? "start" : i === points.length - 1 ? "end" : "middle"}
                fontSize="11"
                fill="currentColor"
                opacity="0.7"
              >
                {new Date(`${p.date}T00:00:00Z`).toLocaleDateString("en-US", { month: "short", year: "2-digit", timeZone: "UTC" })}
              </text>
            </g>
          ))}
        </svg>
      </Row>
      <VisuallyHidden>
        <ul>
          {points.map((p) => (
            <li key={p.date}>
              {formatDate(p.date)}: {p.kg} kg
            </li>
          ))}
        </ul>
      </VisuallyHidden>
    </Column>
  );
}

export function PatientRecordView({ patient }: { patient: Patient }) {
  const owner = getOwner(patient.owner);
  const record = records[patient.id];
  const todays = appointments.filter((a) => a.patient === patient.id && a.status !== "cancelled");
  const overdue = record?.vaccinations.filter((v) => v.due < today) ?? [];

  return (
    <Column gap="20">
      <Row gap="16" vertical="center" wrap>
        <Button href="/" variant="tertiary" size="s" prefixIcon="chevronLeft" label="Schedule" />
      </Row>

      <Row gap="16" vertical="center" wrap>
        <Avatar size="l" value={patient.name.charAt(0)} />
        <Column gap="4" flex={1} minWidth={14}>
          <Heading as="h1" variant="display-strong-s">
            {patient.name}
          </Heading>
          <Text variant="body-default-m" onBackground="neutral-weak">
            {patient.breed} · {patient.sex} · {ageLabel(patient.born)}
          </Text>
        </Column>
        {overdue.length > 0 && (
          <Tag scheme="warning" prefixIcon="warning" label={`${overdue.length} vaccinations overdue`} size="l" />
        )}
      </Row>

      <AlertBanner name={patient.name} alerts={patient.alerts} />

      <Row gap="20" m={{ direction: "column" }} vertical="start">
        <Column flex={1} gap="20" fillWidth minWidth={18}>
          <Panel id="details" title="Patient and owner" icon="paw">
            <Row gap="16" wrap>
              <Field label="Species" value={patient.species} />
              <Field label="Breed" value={patient.breed} />
              <Field label="Born" value={`${formatDate(patient.born)} (${ageLabel(patient.born)})`} />
              <Field label="Sex" value={patient.sex} />
            </Row>
            <Row gap="16" wrap borderTop paddingTop="16">
              <Field label="Owner" value={owner?.name ?? "Unknown"} />
              <Column gap="2" minWidth={10} flex={1}>
                <Text variant="label-default-s" onBackground="neutral-weak">
                  Phone
                </Text>
                <Button
                  href={`tel:${(owner?.phone ?? "").replace(/\s/g, "")}`}
                  variant="tertiary"
                  size="s"
                  prefixIcon="chat"
                  label={owner?.phone ?? ""}
                  horizontal="start"
                />
              </Column>
            </Row>
            {todays.length > 0 && (
              <Column gap="8" borderTop paddingTop="16">
                <Text variant="label-default-s" onBackground="neutral-weak">
                  On today&apos;s schedule
                </Text>
                {todays.map((a) => (
                  <Row key={a.id} gap="8" wrap vertical="center">
                    <Text variant="label-strong-m">{a.start}</Text>
                    <Text variant="body-default-m">
                      {a.reason} · {getVet(a.vet)?.name}
                    </Text>
                    <Tag size="s" label={statusLabel[a.status]} />
                  </Row>
                ))}
              </Column>
            )}
          </Panel>

          {record ? (
            <Panel id="weight" title="Weight trend" icon="trend">
              <WeightChart points={record.weights_kg} />
            </Panel>
          ) : null}

          {record ? (
            <Panel id="meds" title="Current medications" icon="heart">
              <Column gap="8" as="ul" margin="0" padding="0" style={{ listStyle: "none" }}>
                {record.medications.map((m) => (
                  <Row
                    as="li"
                    key={m.name}
                    horizontal="between"
                    gap="12"
                    wrap
                    background="neutral-alpha-weak"
                    radius="m"
                    padding="12"
                  >
                    <Column gap="2">
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
          ) : null}
        </Column>

        <Column flex={1} gap="20" fillWidth minWidth={18}>
          {record ? (
            <Panel id="vax" title="Vaccinations" icon="clipboard">
              <Column gap="8" as="ul" margin="0" padding="0" style={{ listStyle: "none" }}>
                {record.vaccinations.map((v) => {
                  const days = daysBetween(today, v.due);
                  const isOverdue = days < 0;
                  const soon = !isOverdue && days <= 90;
                  return (
                    <Row
                      as="li"
                      key={v.name}
                      horizontal="between"
                      vertical="center"
                      gap="12"
                      wrap
                      radius="m"
                      padding="12"
                      background={isOverdue ? "danger-alpha-medium" : "neutral-alpha-weak"}
                      border={isOverdue ? "danger-alpha-strong" : undefined}
                    >
                      <Column gap="2">
                        <Text variant="label-strong-m">{v.name}</Text>
                        <Text variant="body-default-s" onBackground="neutral-weak">
                          Given {formatDate(v.given)} · due {formatDate(v.due)}
                        </Text>
                      </Column>
                      {isOverdue ? (
                        <Tag scheme="danger" prefixIcon="warning" label={`Overdue ${-days} days`} />
                      ) : soon ? (
                        <Tag scheme="warning" label={`Due in ${days} days`} />
                      ) : (
                        <Tag scheme="success" prefixIcon="check" label="Up to date" />
                      )}
                    </Row>
                  );
                })}
              </Column>
            </Panel>
          ) : null}

          {record ? (
            <Panel id="visits" title="Visit history" icon="calendar">
              <Column gap="12" as="ol" margin="0" padding="0" style={{ listStyle: "none" }}>
                {record.visits.map((v) => (
                  <Column
                    as="li"
                    key={v.date}
                    gap="4"
                    paddingLeft="16"
                    style={{ borderLeft: "3px solid var(--brand-solid-medium)" }}
                  >
                    <Row horizontal="between" gap="8" wrap>
                      <Text variant="label-strong-m">
                        {formatDate(v.date)} · {v.reason}
                      </Text>
                      <Text variant="body-default-s" onBackground="neutral-weak">
                        ${v.invoice_usd.toFixed(2)}
                      </Text>
                    </Row>
                    <Text variant="body-default-s" onBackground="neutral-weak">
                      {getVet(v.vet)?.name}
                    </Text>
                    <Text variant="body-default-m">{v.notes}</Text>
                  </Column>
                ))}
              </Column>
            </Panel>
          ) : (
            <Panel id="no-record" title="Clinical record" icon="clipboard">
              <Text variant="body-default-m" onBackground="neutral-weak">
                No weights, vaccinations or visits are on file for {patient.name} in this demo.
              </Text>
            </Panel>
          )}
        </Column>
      </Row>
    </Column>
  );
}
```

```tsx src/components/pawpoint/Schedule.tsx
"use client";

import {
  Button,
  Column,
  Dialog,
  Heading,
  Icon,
  Input,
  Row,
  SegmentedControl,
  Select,
  Tag,
  Text,
  useToast,
} from "@once-ui-system/core";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  type Appointment,
  type Status,
  appointments as seed,
  findClash,
  getOwner,
  getPatient,
  getVet,
  nowMinutes,
  patients,
  statusLabel,
  toClock,
  toMinutes,
  vets,
} from "@/lib/data";
import { AlertTags } from "./Alerts";

const statusScheme: { [S in Status]: "neutral" | "info" | "brand" | "success" | "danger" } = {
  booked: "neutral",
  checked_in: "info",
  in_exam: "brand",
  done: "success",
  cancelled: "danger",
};

const slots = Array.from({ length: 40 }, (_, i) => toClock(8 * 60 + i * 15)).map((t) => ({
  value: t,
  label: t,
}));
const durations = [15, 20, 30, 45, 60].map((m) => ({ value: String(m), label: `${m} min` }));

function Stat({ label, value, tone }: { label: string; value: number; tone?: "info" | "brand" }) {
  return (
    <Column
      background="surface"
      border
      radius="l"
      padding="16"
      gap="4"
      flex={1}
      minWidth={8}
    >
      <Text variant="label-default-s" onBackground="neutral-weak">
        {label}
      </Text>
      <Text variant="display-strong-xs" onBackground={tone ? `${tone}-strong` : "neutral-strong"}>
        {value}
      </Text>
    </Column>
  );
}

export function Schedule() {
  const { addToast } = useToast();
  const [list, setList] = useState<Appointment[]>(seed);
  const [now, setNow] = useState(nowMinutes);
  const [vetFilter, setVetFilter] = useState("all");
  const [bookOpen, setBookOpen] = useState(false);

  const [patientId, setPatientId] = useState("");
  const [vetId, setVetId] = useState("");
  const [time, setTime] = useState("");
  const [minutes, setMinutes] = useState("20");
  const [reason, setReason] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // The clinic clock moves a minute at a time so waiting times keep counting.
  useEffect(() => {
    const id = setInterval(() => setNow((n) => n + 1), 60_000);
    return () => clearInterval(id);
  }, []);

  const sorted = useMemo(
    () =>
      [...list]
        .filter((a) => vetFilter === "all" || a.vet === vetFilter)
        .sort((a, b) => toMinutes(a.start) - toMinutes(b.start) || a.vet.localeCompare(b.vet)),
    [list, vetFilter],
  );

  const waiting = list
    .filter((a) => a.status === "checked_in")
    .sort((a, b) => (a.checkedInAt ?? 0) - (b.checkedInAt ?? 0));

  const count = (s: Status) => list.filter((a) => a.status === s).length;
  const remaining = count("booked");

  const clash =
    vetId && time ? findClash(list, vetId, time, Number(minutes)) : undefined;
  const clashPatient = clash ? getPatient(clash.patient) : undefined;
  const ready = Boolean(patientId && vetId && time && reason.trim());

  const setStatus = (id: string, status: Status, extra?: Partial<Appointment>) =>
    setList((prev) => prev.map((a) => (a.id === id ? { ...a, status, ...extra } : a)));

  const checkIn = (a: Appointment) => {
    setStatus(a.id, "checked_in", { checkedInAt: now });
    addToast({
      variant: "success",
      message: `${getPatient(a.patient)?.name} checked in for ${getVet(a.vet)?.name}.`,
    });
  };

  const resetForm = () => {
    setPatientId("");
    setVetId("");
    setTime("");
    setMinutes("20");
    setReason("");
    setSubmitted(false);
  };

  const book = () => {
    setSubmitted(true);
    if (!ready || clash) return;
    const next: Appointment = {
      id: `a-${String(list.length + 1).padStart(2, "0")}`,
      patient: patientId,
      vet: vetId,
      start: time,
      minutes: Number(minutes),
      reason: reason.trim(),
      status: "booked",
    };
    setList((prev) => [...prev, next]);
    addToast({
      variant: "success",
      message: `Booked ${getPatient(patientId)?.name} with ${getVet(vetId)?.name} at ${time}.`,
    });
    setBookOpen(false);
    resetForm();
  };

  return (
    <Column gap="24">
      <Row horizontal="between" vertical="center" wrap gap="16">
        <Heading as="h1" variant="display-strong-xs">
          Today&apos;s schedule
        </Heading>
        <Button prefixIcon="plus" label="Book appointment" onClick={() => setBookOpen(true)} />
      </Row>

      <Row gap="12" wrap>
        <Stat label="Waiting now" value={waiting.length} tone="info" />
        <Stat label="In exam" value={count("in_exam")} tone="brand" />
        <Stat label="Still to arrive" value={remaining} />
        <Stat label="Done" value={count("done")} />
      </Row>

      <Row gap="24" m={{ direction: "column" }} vertical="start">
        <Column flex={3} gap="12" fillWidth minWidth={20}>
          <SegmentedControl
            aria-label="Filter by vet"
            value={vetFilter}
            onChange={setVetFilter}
            buttons={[
              { value: "all", label: "All vets" },
              ...vets.map((v) => ({ value: v.id, label: v.name.replace("Dr. ", "Dr. ") })),
            ]}
          />
          <Column as="ul" gap="8" margin="0" padding="0" style={{ listStyle: "none" }}>
            {sorted.map((a) => {
              const p = getPatient(a.patient);
              const o = p ? getOwner(p.owner) : undefined;
              const v = getVet(a.vet);
              if (!p) return null;
              const muted = a.status === "done" || a.status === "cancelled";
              return (
                <Column
                  as="li"
                  key={a.id}
                  background={a.urgent && !muted ? "danger-alpha-weak" : "surface"}
                  border={a.urgent && !muted ? "danger-alpha-strong" : true}
                  borderWidth={a.urgent && !muted ? 2 : 1}
                  radius="l"
                  padding="16"
                  gap="12"
                  style={muted ? { opacity: 0.7 } : undefined}
                >
                  <Row gap="16" vertical="start" s={{ direction: "column" }}>
                    <Column minWidth={6} gap="2">
                      <Text variant="heading-strong-l">{a.start}</Text>
                      <Text variant="body-default-xs" onBackground="neutral-weak">
                        {a.minutes} min · {v?.room}
                      </Text>
                    </Column>
                    <Column flex={1} gap="4" minWidth={12}>
                      <Row gap="8" vertical="center" wrap>
                        <Link
                          href={`/patients/${p.id}`}
                          style={{ color: "inherit", textDecoration: "none" }}
                        >
                          <Text variant="heading-strong-m">{p.name}</Text>
                        </Link>
                        <Text variant="body-default-s" onBackground="neutral-weak">
                          {p.species}, {p.breed}
                        </Text>
                        {a.urgent && (
                          <Tag scheme="danger" prefixIcon="bolt" label="Urgent" size="m" />
                        )}
                      </Row>
                      <Text variant="body-default-m">{a.reason}</Text>
                      <Text variant="body-default-s" onBackground="neutral-weak">
                        {o?.name} · {o?.phone} · {v?.name}
                      </Text>
                      <AlertTags alerts={p.alerts} />
                    </Column>
                    <Row gap="8" vertical="center" wrap>
                      <Tag
                        scheme={statusScheme[a.status]}
                        label={statusLabel[a.status]}
                        size="m"
                      />
                      {a.status === "booked" && (
                        <Button
                          size="s"
                          prefixIcon="check"
                          label="Check in"
                          aria-label={`Check in ${p.name}`}
                          onClick={() => checkIn(a)}
                        />
                      )}
                      {a.status === "checked_in" && (
                        <Button
                          size="s"
                          variant="secondary"
                          label="Start exam"
                          aria-label={`Start exam for ${p.name}`}
                          onClick={() => setStatus(a.id, "in_exam")}
                        />
                      )}
                    </Row>
                  </Row>
                </Column>
              );
            })}
          </Column>
        </Column>

        <Column
          flex={2}
          gap="12"
          fillWidth
          minWidth={16}
          background="surface"
          border
          radius="l"
          padding="20"
          position="sticky"
          top="80"
          aria-labelledby="waiting-title"
          as="section"
        >
          <Row gap="8" vertical="center">
            <Icon name="time" onBackground="info-strong" />
            <Heading as="h2" id="waiting-title" variant="heading-strong-l">
              Waiting room
            </Heading>
            <Tag scheme="info" label={String(waiting.length)} size="s" />
          </Row>
          {waiting.length === 0 && (
            <Text variant="body-default-s" onBackground="neutral-weak">
              Nobody is waiting. Check a patient in from the schedule.
            </Text>
          )}
          <Column as="ol" gap="8" margin="0" padding="0" style={{ listStyle: "none" }}>
            {waiting.map((a, i) => {
              const p = getPatient(a.patient);
              if (!p) return null;
              const mins = Math.max(0, now - (a.checkedInAt ?? now));
              const late = mins >= 15;
              return (
                <Column
                  as="li"
                  key={a.id}
                  background="neutral-alpha-weak"
                  radius="m"
                  padding="12"
                  gap="4"
                >
                  <Row horizontal="between" vertical="center" gap="8">
                    <Text variant="label-strong-m">
                      {i === 0 ? "Next: " : `${i + 1}. `}
                      {p.name}
                    </Text>
                    <Text
                      variant="label-strong-s"
                      onBackground={late ? "warning-strong" : "neutral-medium"}
                    >
                      {mins} min waiting
                    </Text>
                  </Row>
                  <Text variant="body-default-s" onBackground="neutral-weak">
                    {getVet(a.vet)?.name} · booked {a.start} · in at {toClock(a.checkedInAt ?? now)}
                  </Text>
                  <AlertTags alerts={p.alerts} compact />
                </Column>
              );
            })}
          </Column>
        </Column>
      </Row>

      <Dialog
        open={bookOpen}
        onClose={() => {
          setBookOpen(false);
          resetForm();
        }}
        title="Book an appointment"
        description="Pick a patient, a vet and a time. A vet cannot be booked twice at the same time."
        footer={
          <Row gap="8" horizontal="end" fillWidth>
            <Button
              variant="tertiary"
              label="Cancel"
              onClick={() => {
                setBookOpen(false);
                resetForm();
              }}
            />
            <Button label="Book" onClick={book} />
          </Row>
        }
      >
        <Column gap="16" paddingTop="8">
          <Select
            id="book-patient"
            label="Patient"
            value={patientId}
            onSelect={(v) => setPatientId(v as string)}
            searchable
            options={patients.map((p) => ({
              value: p.id,
              label: `${p.name} (${getOwner(p.owner)?.name})${p.alerts.length ? " ⚠" : ""}`,
            }))}
            error={submitted && !patientId}
          />
          {patientId && (
            <AlertTags alerts={getPatient(patientId)?.alerts ?? []} />
          )}
          <Select
            id="book-vet"
            label="Vet"
            value={vetId}
            onSelect={(v) => setVetId(v as string)}
            options={vets.map((v) => ({ value: v.id, label: `${v.name} · ${v.room}` }))}
            error={submitted && !vetId}
          />
          <Row gap="12" s={{ direction: "column" }}>
            <Select
              id="book-time"
              label="Time"
              value={time}
              onSelect={(v) => setTime(v as string)}
              options={slots}
              error={submitted && !time}
            />
            <Select
              id="book-length"
              label="Length"
              value={minutes}
              onSelect={(v) => setMinutes(v as string)}
              options={durations}
            />
          </Row>
          <Input
            id="book-reason"
            label="Reason for visit"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            error={submitted && !reason.trim()}
          />
          {clash && (
            <Row
              role="alert"
              gap="8"
              padding="12"
              radius="m"
              background="danger-alpha-medium"
              vertical="center"
            >
              <Icon name="danger" onBackground="danger-strong" />
              <Text variant="body-default-s" onBackground="danger-strong">
                {getVet(vetId)?.name} already has {clashPatient?.name} from {clash.start} to{" "}
                {toClock(toMinutes(clash.start) + clash.minutes)}. Choose another time or vet.
              </Text>
            </Row>
          )}
          {submitted && !ready && (
            <Text role="alert" variant="body-default-s" onBackground="danger-strong">
              Fill in the patient, vet, time and reason.
            </Text>
          )}
        </Column>
      </Dialog>
    </Column>
  );
}
```

```tsx src/components/pawpoint/Shell.tsx
"use client";

import {
  Avatar,
  Button,
  Column,
  Icon,
  Input,
  Row,
  Text,
  VisuallyHidden,
} from "@once-ui-system/core";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { getOwner, owners, patients, today, user } from "@/lib/data";
import { AlertTags } from "./Alerts";

const dateLabel = new Date(`${today}T00:00:00Z`).toLocaleDateString("en-US", {
  weekday: "long",
  month: "long",
  day: "numeric",
  timeZone: "UTC",
});

function PatientSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();

  const results = useMemo(() => {
    if (!q) return [];
    return patients.filter((p) => {
      const owner = getOwner(p.owner);
      return p.name.toLowerCase().includes(q) || owner?.name.toLowerCase().includes(q);
    });
  }, [q]);

  const open = (id: string) => {
    setQuery("");
    router.push(`/patients/${id}`);
  };

  return (
    <Column

      fillWidth
      maxWidth={32}
      position="relative"
      role="search"
      onKeyDown={(e: React.KeyboardEvent) => {
        if (e.key === "Escape") setQuery("");
      }}
    >
      <Input
        id="patient-search"
        label="Find a patient or owner"
        size="s"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        prefix={<Icon name="search" size="xs" onBackground="neutral-weak" />}
        autoComplete="off"
        aria-controls="search-results"
      />
      {q && (
        <Column
          id="search-results"
          position="absolute"
          top="56"
          left="0"
          fillWidth
          background="overlay"
          border
          radius="l"
          shadow="l"
          padding="4"
          gap="2"
          zIndex={10}
          aria-live="polite"
        >
          {results.length === 0 && (
            <Text variant="body-default-s" onBackground="neutral-weak" padding="12">
              No patient or owner matches "{query}".
            </Text>
          )}
          {results.map((p) => (
            <Button
              key={p.id}
              variant="tertiary"
              fillWidth
              horizontal="start"
              weight="default"
              onClick={() => open(p.id)}
            >
              <Row gap="12" vertical="center" fillWidth wrap>
                <Text variant="label-strong-m">{p.name}</Text>
                <Text variant="body-default-s" onBackground="neutral-weak">
                  {p.breed} · {getOwner(p.owner)?.name}
                </Text>
                <AlertTags alerts={p.alerts} compact />
              </Row>
            </Button>
          ))}
        </Column>
      )}
    </Column>
  );
}

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "/";
  const onPatients = pathname.startsWith("/patients");

  return (
    <Column fillWidth minHeight="100vh" background="page">
      <VisuallyHidden as="a" href="#main" focusable>
        Skip to content
      </VisuallyHidden>
      <Row
        as="header"
        fillWidth
        background="surface"
        borderBottom
        paddingX="20"
        paddingY="12"
        gap="16"
        vertical="center"
        wrap
        position="sticky"
        top="0"
        zIndex={5}
      >
        <Row gap="12" vertical="center" minWidth={10}>
          <Row
            width="40"
            height="40"
            center
            radius="m"
            background="brand-medium"
            onBackground="brand-strong"
          >
            <Icon name="paw" size="m" />
          </Row>
          <Column>
            <Text variant="heading-strong-m">Pawpoint</Text>
            <Text variant="body-default-xs" onBackground="neutral-weak">
              Hillside Veterinary Clinic
            </Text>
          </Column>
        </Row>

        <Row as="nav" aria-label="Main" gap="4">
          <Button
            href="/"
            variant={onPatients ? "tertiary" : "secondary"}
            size="s"
            prefixIcon="calendar"
            label="Schedule"
            aria-current={onPatients ? undefined : "page"}
          />
          <Button
            href="/patients/p-104"
            variant={onPatients ? "secondary" : "tertiary"}
            size="s"
            prefixIcon="paw"
            label="Patients"
            aria-current={onPatients ? "page" : undefined}
          />
        </Row>

        <Row flex={1} minWidth={16} fillWidth>
          <PatientSearch />
        </Row>

        <Row gap="12" vertical="center" marginLeft="auto">
          <Column horizontal="end" s={{ hide: true }}>
            <Text variant="label-strong-s">{user.name}</Text>
            <Text variant="body-default-xs" onBackground="neutral-weak">
              {user.role}
            </Text>
          </Column>
          <Avatar size="s" value="RL" statusIndicator={{ color: "success" }} />
        </Row>
      </Row>

      <Column as="main" id="main" fillWidth horizontal="center" paddingX="16" paddingY="24">
        <Column fillWidth maxWidth="xl" gap="24">
          <Row horizontal="between" vertical="end" wrap gap="8">
            <Text variant="body-default-s" onBackground="neutral-weak">
              {dateLabel} · {owners.length} owners on file
            </Text>
          </Row>
          {children}
        </Column>
      </Column>
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
  /** Minutes since midnight when the patient was checked in. */
  checkedInAt?: number;
};

export const clinic = "Pawpoint, front-desk and records software for Hillside Veterinary Clinic";
export const today = "2026-11-12";
/** The clinic clock the demo starts at, in minutes since midnight (09:52). */
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

export const appointments: Appointment[] = [
  { id: "a-01", patient: "p-101", vet: "v-1", start: "08:30", minutes: 20, reason: "Annual vaccination", status: "done" },
  { id: "a-02", patient: "p-104", vet: "v-2", start: "08:30", minutes: 30, reason: "Kidney panel recheck", status: "done" },
  { id: "a-03", patient: "p-108", vet: "v-3", start: "08:00", minutes: 120, reason: "Soft palate surgery", status: "in_exam" },
  { id: "a-04", patient: "p-102", vet: "v-1", start: "09:00", minutes: 30, reason: "Limping, left hind leg", status: "in_exam" },
  { id: "a-05", patient: "p-107", vet: "v-2", start: "09:15", minutes: 20, reason: "Glucose curve", status: "checked_in", checkedInAt: 9 * 60 + 8 },
  { id: "a-06", patient: "p-105", vet: "v-1", start: "09:45", minutes: 20, reason: "Beak and nail trim", status: "checked_in", checkedInAt: 9 * 60 + 40 },
  { id: "a-07", patient: "p-103", vet: "v-2", start: "10:00", minutes: 30, reason: "Senior wellness exam", status: "booked" },
  { id: "a-08", patient: "p-106", vet: "v-1", start: "10:30", minutes: 20, reason: "Not eating since yesterday", status: "booked", urgent: true },
  { id: "a-09", patient: "p-104", vet: "v-3", start: "11:00", minutes: 45, reason: "Dental cleaning", status: "booked" },
  { id: "a-10", patient: "p-101", vet: "v-2", start: "11:30", minutes: 20, reason: "Ear infection follow-up", status: "booked" },
  { id: "a-11", patient: "p-107", vet: "v-1", start: "13:30", minutes: 30, reason: "Dental check", status: "booked" },
  { id: "a-12", patient: "p-103", vet: "v-3", start: "14:00", minutes: 60, reason: "Lump removal", status: "cancelled" },
  { id: "a-13", patient: "p-102", vet: "v-2", start: "15:00", minutes: 20, reason: "X-ray results", status: "booked" },
];

export type PatientRecord = {
  weights_kg: { date: string; kg: number }[];
  vaccinations: { name: string; given: string; due: string }[];
  medications: { name: string; dose: string; since: string }[];
  visits: { date: string; vet: string; reason: string; notes: string; invoice_usd: number }[];
};

export const records: { [patientId: string]: PatientRecord | undefined } = {
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

export const statusLabel: { [S in Status]: string } = {
  booked: "Booked",
  checked_in: "Checked in",
  in_exam: "In exam",
  done: "Done",
  cancelled: "Cancelled",
};

export const getPatient = (id: string) => patients.find((p) => p.id === id);
export const getOwner = (id: string) => owners.find((o) => o.id === id);
export const getVet = (id: string) => vets.find((v) => v.id === id);

export const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};
export const toClock = (min: number) =>
  `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;

const dayMs = 86_400_000;
export const daysBetween = (from: string, to: string) =>
  Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / dayMs);

export const formatDate = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });

export const ageLabel = (born: string) => {
  const months = Math.floor(daysBetween(born, today) / 30.4375);
  const y = Math.floor(months / 12);
  const m = months % 12;
  if (y === 0) return `${m} mo`;
  return m === 0 ? `${y} yr` : `${y} yr ${m} mo`;
};

/** Two appointments of one vet clash when their time ranges overlap. Cancelled ones free the slot. */
export const findClash = (list: Appointment[], vet: string, start: string, minutes: number) => {
  const s = toMinutes(start);
  const e = s + minutes;
  return list.find(
    (a) =>
      a.vet === vet &&
      a.status !== "cancelled" &&
      s < toMinutes(a.start) + a.minutes &&
      toMinutes(a.start) < e,
  );
};
```

