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
