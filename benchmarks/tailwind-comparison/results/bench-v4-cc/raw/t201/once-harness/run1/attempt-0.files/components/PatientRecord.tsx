"use client";

import Link from "next/link";
import { Avatar, Button, Column, Grid, Heading, Icon, Row, Tag, Text, VisuallyHidden } from "@once-ui-system/core";
import {
  TODAY,
  ageText,
  daysBetween,
  findOwner,
  findVet,
  formatDate,
  formatLongDate,
  formatMonthYear,
  formatTime,
  formatUsd,
  initialAppointments,
  initials,
  patients,
  records,
  type Weight,
} from "@/lib/data";
import { AlertBanner } from "./Alerts";
import { Panel } from "./Panel";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Row horizontal="between" gap="16" wrap>
      <Text textVariant="body-default-m" onBackground="neutral-weak">
        {label}
      </Text>
      <Text textVariant="label-strong-m" align="right">
        {children}
      </Text>
    </Row>
  );
}

export function PatientRecord({ id }: { id: string }) {
  const patient = patients.find((p) => p.id === id);
  if (!patient) return null;
  const owner = findOwner(patient.owner);
  const record = records[id];
  const otherPets = patients.filter((p) => p.owner === patient.owner && p.id !== patient.id);
  const todays = initialAppointments.filter((a) => a.patient === id && a.status !== "cancelled");
  const overdue = record ? record.vaccinations.filter((v) => v.due < TODAY) : [];

  return (
    <Column fillWidth gap="24">
      <Row gap="16" vertical="center" wrap>
        <Button variant="tertiary" size="s" prefixIcon="arrowLeft" href="/">
          Schedule
        </Button>
      </Row>

      <Row gap="16" vertical="center" wrap>
        <Avatar value={initials(patient.name)} size="xl" />
        <Column gap="4">
          <Heading as="h1" textVariant="display-strong-xs">
            {patient.name}
          </Heading>
          <Text textVariant="body-default-l" onBackground="neutral-weak">
            {patient.breed} · {patient.species} · {ageText(patient.born)} · {patient.sex}
          </Text>
        </Column>
      </Row>

      <AlertBanner alerts={patient.alerts} patientName={patient.name} />

      {overdue.length > 0 ? (
        <Row
          role="note"
          fillWidth
          background="warning-alpha-weak"
          border="warning-alpha-strong"
          radius="l"
          padding="12"
          gap="12"
          vertical="center"
        >
          <Icon name="warning" size="m" onBackground="warning-strong" decorative />
          <Text textVariant="label-strong-m">
            {overdue.length} vaccinations overdue: {overdue.map((v) => v.name).join(", ")}
          </Text>
        </Row>
      ) : null}

      {todays.length > 0 ? (
        <Panel id="today-heading" title="At the clinic today">
          <Column as="ul" gap="8" padding="0" margin="0">
            {todays.map((a) => (
              <Row as="li" key={a.id} gap="12" vertical="center" wrap>
                <Text textVariant="label-strong-m">{formatTime(a.start)}</Text>
                <Text>
                  {a.reason} with {findVet(a.vet)?.name}
                </Text>
                <Tag
                  size="s"
                  tone={a.status === "done" ? "success" : "neutral"}
                  label={a.status === "done" ? "Done" : a.status === "booked" ? "Booked" : a.status === "checked_in" ? "Checked in" : "In exam"}
                />
              </Row>
            ))}
          </Column>
        </Panel>
      ) : null}

      <Grid columns="2" m={{ columns: 1 }} gap="24" fillWidth>
        <Panel id="patient-heading" title="Patient">
          <Column gap="12">
            <Field label="Species">{patient.species}</Field>
            <Field label="Breed">{patient.breed}</Field>
            <Field label="Born">
              {formatDate(patient.born)} ({ageText(patient.born)})
            </Field>
            <Field label="Sex">{patient.sex}</Field>
            <Field label="Patient ID">{patient.id}</Field>
          </Column>
        </Panel>
        <Panel id="owner-heading" title="Owner">
          <Column gap="12">
            <Field label="Name">{owner?.name}</Field>
            <Field label="Phone">
              <a href={`tel:${owner?.phone.replace(/\s/g, "")}`} style={{ color: "inherit" }}>
                {owner?.phone}
              </a>
            </Field>
            {otherPets.length > 0 ? (
              <Field label="Other pets">
                {otherPets.map((p, i) => (
                  <span key={p.id}>
                    {i > 0 ? ", " : ""}
                    <Link href={`/patients/${p.id}`} style={{ color: "inherit" }}>
                      {p.name}
                    </Link>
                  </span>
                ))}
              </Field>
            ) : null}
          </Column>
        </Panel>
      </Grid>

      {record ? (
        <>
          <WeightPanel weights={record.weights_kg} />

          <Panel
            id="vax-heading"
            title="Vaccinations"
            aside={overdue.length > 0 ? <Tag tone="danger" size="s" prefixIcon="warning" label={`${overdue.length} overdue`} /> : undefined}
          >
            <Column as="ul" gap="12" padding="0" margin="0">
              {record.vaccinations.map((v) => {
                const left = daysBetween(TODAY, v.due);
                const status =
                  left < 0
                    ? { tone: "danger" as const, label: `Overdue by ${-left} days`, icon: "warning" as const }
                    : left <= 60
                      ? { tone: "warning" as const, label: `Due in ${left} days`, icon: "time" as const }
                      : { tone: "success" as const, label: "Up to date", icon: "check" as const };
                return (
                  <Row
                    as="li"
                    key={v.name}
                    gap="16"
                    wrap
                    vertical="center"
                    horizontal="between"
                    padding="12"
                    radius="m"
                    background={left < 0 ? "danger-alpha-weak" : "neutral-alpha-weak"}
                    border={left < 0 ? "danger-alpha-medium" : undefined}
                  >
                    <Column gap="0">
                      <Text textVariant="label-strong-m">{v.name}</Text>
                      <Text textVariant="body-default-s" onBackground="neutral-weak">
                        Given {formatDate(v.given)} · due {formatDate(v.due)}
                      </Text>
                    </Column>
                    <Tag tone={status.tone} prefixIcon={status.icon} label={status.label} />
                  </Row>
                );
              })}
            </Column>
            <Text textVariant="body-default-xs" onBackground="neutral-weak">
              Checked against today, {formatLongDate(TODAY)}.
            </Text>
          </Panel>

          <Panel id="meds-heading" title="Current medications">
            <Column as="ul" gap="12" padding="0" margin="0">
              {record.medications.map((m) => (
                <Row as="li" key={m.name} gap="16" wrap horizontal="between" vertical="center">
                  <Column gap="0">
                    <Text textVariant="label-strong-m">{m.name}</Text>
                    <Text textVariant="body-default-s" onBackground="neutral-weak">
                      {m.dose}
                    </Text>
                  </Column>
                  <Text textVariant="body-default-s" onBackground="neutral-weak">
                    Since {formatDate(m.since)}
                  </Text>
                </Row>
              ))}
            </Column>
          </Panel>

          <Panel id="visits-heading" title="Visit history">
            <Column as="ol" gap="16" padding="0" margin="0">
              {record.visits.map((v) => (
                <Column as="li" key={v.date} gap="8" padding="16" radius="m" background="neutral-alpha-weak">
                  <Row horizontal="between" gap="12" wrap vertical="center">
                    <Row gap="8" vertical="center" wrap>
                      <Text textVariant="label-strong-m">{formatDate(v.date)}</Text>
                      {v.date === TODAY ? <Tag tone="brand" size="s" label="Today" /> : null}
                      <Text textVariant="body-default-m">{v.reason}</Text>
                    </Row>
                    <Text textVariant="body-default-s" onBackground="neutral-weak">
                      {findVet(v.vet)?.name} · {formatUsd(v.invoice_usd)}
                    </Text>
                  </Row>
                  <Text textVariant="body-default-m">{v.notes}</Text>
                </Column>
              ))}
            </Column>
          </Panel>
        </>
      ) : (
        <Panel id="empty-heading" title="Chart">
          <Text onBackground="neutral-weak">
            No weights, vaccinations or visit notes are on file for {patient.name} yet.
          </Text>
        </Panel>
      )}
    </Column>
  );
}

function WeightPanel({ weights }: { weights: Weight[] }) {
  const W = 480;
  const H = 240;
  const padL = 36;
  const padR = 28;
  const padT = 32;
  const padB = 40;
  const t = (d: string) => Date.parse(`${d}T00:00:00Z`);
  const t0 = t(weights[0].date);
  const t1 = t(weights[weights.length - 1].date);
  const kgs = weights.map((w) => w.kg);
  const lo = Math.floor(Math.min(...kgs) - 0.5);
  const hi = Math.ceil(Math.max(...kgs) + 0.5);
  const x = (d: string) => padL + ((t(d) - t0) / (t1 - t0)) * (W - padL - padR);
  const y = (kg: number) => padT + (1 - (kg - lo) / (hi - lo)) * (H - padT - padB);
  const ticks = [lo, lo + (hi - lo) / 2, hi];
  const path = weights.map((w, i) => `${i === 0 ? "M" : "L"}${x(w.date).toFixed(1)} ${y(w.kg).toFixed(1)}`).join(" ");
  const first = weights[0];
  const last = weights[weights.length - 1];
  const change = last.kg - first.kg;
  const pct = (change / first.kg) * 100;

  return (
    <Panel
      id="weight-heading"
      title="Weight trend"
      aside={
        <Tag
          tone="warning"
          size="m"
          prefixIcon="trendDown"
          label={`${change.toFixed(1)} kg (${pct.toFixed(1)}%) since ${formatDate(first.date)}`}
        />
      }
    >
      <Row gap="8" vertical="end">
        <Text textVariant="display-strong-xs">{last.kg.toFixed(1)} kg</Text>
        <Text textVariant="body-default-m" onBackground="neutral-weak" marginBottom="4">
          on {formatDate(last.date)}
        </Text>
      </Row>
      <Row fillWidth onBackground="neutral-medium">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label={`Weight over ${weights.length} visits, from ${first.kg} kilograms to ${last.kg} kilograms`}
          style={{ width: "100%", height: "auto", display: "block", color: "currentColor" }}
        >
          {ticks.map((tk) => (
            <g key={tk}>
              <line x1={padL} x2={W - padR + 8} y1={y(tk)} y2={y(tk)} stroke="currentColor" strokeOpacity={0.2} />
              <text x={padL - 8} y={y(tk) + 4} textAnchor="end" fontSize={12} fill="currentColor">
                {Number.isInteger(tk) ? tk : tk.toFixed(1)}
              </text>
            </g>
          ))}
          <path d={path} fill="none" stroke="var(--brand-solid-strong)" strokeWidth={3} strokeLinejoin="round" strokeLinecap="round" />
          {weights.map((w, i) => (
            <g key={w.date}>
              <circle cx={x(w.date)} cy={y(w.kg)} r={i === weights.length - 1 ? 6 : 4} fill="var(--brand-solid-strong)" />
              <text x={x(w.date)} y={y(w.kg) - 12} textAnchor="middle" fontSize={13} fontWeight={600} fill="currentColor">
                {w.kg.toFixed(1)}
              </text>
              <text x={x(w.date)} y={H - 14} textAnchor="middle" fontSize={12} fill="currentColor">
                {formatMonthYear(w.date)}
              </text>
            </g>
          ))}
        </svg>
      </Row>
      <VisuallyHidden>
        <ul>
          {weights.map((w) => (
            <li key={w.date}>
              {formatDate(w.date)}: {w.kg} kg
            </li>
          ))}
        </ul>
      </VisuallyHidden>
      <Text textVariant="body-default-s" onBackground="neutral-weak">
        Weight in kg at each visit. Steady loss across all six visits; flagged for the vet alongside the kidney alert.
      </Text>
    </Panel>
  );
}
