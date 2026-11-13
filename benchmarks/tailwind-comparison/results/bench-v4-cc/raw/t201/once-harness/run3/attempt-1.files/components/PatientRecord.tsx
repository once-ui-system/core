"use client";

import { Button, Column, Grid, Heading, Icon, Row, SmartLink, Tag, Text } from "@once-ui-system/core";
import {
  TODAY,
  ownerById,
  patientById,
  records,
  vetById,
  type Vaccination,
} from "@/lib/data";
import { ageLabel, daysBetween, formatDate, fmtRange, money, toMin } from "@/lib/time";
import { AlertBanner } from "@/components/Alerts";
import { useDesk } from "@/components/DeskProvider";
import { Panel } from "@/components/Panel";
import { StatusTag } from "@/components/StatusTag";
import { WeightChart } from "@/components/WeightChart";

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Row gap="16" vertical="start" wrap>
      <Text textVariant="label-default-s" onBackground="neutral-weak" style={{ flex: "0 0 6.5rem" }}>
        {label}
      </Text>
      <Column flex="1" gap="2" style={{ minWidth: "10rem" }}>
        {children}
      </Column>
    </Row>
  );
}

function vaccinationState(v: Vaccination) {
  const days = daysBetween(TODAY, v.due);
  if (days < 0) {
    return { tone: "danger" as const, icon: "warning" as const, label: `Overdue by ${-days} ${-days === 1 ? "day" : "days"}`, overdue: true };
  }
  if (days <= 60) {
    return { tone: "warning" as const, icon: "time" as const, label: `Due in ${days} days`, overdue: false };
  }
  return { tone: "success" as const, icon: "check" as const, label: "Up to date", overdue: false };
}

export function PatientRecord({ id }: { id: string }) {
  const { appointments, checkIn, openBooking } = useDesk();
  const patient = patientById[id];
  if (!patient) return null;
  const owner = ownerById[patient.owner];
  const record = records[id];
  const todays = appointments
    .filter((a) => a.patient === id)
    .sort((a, b) => toMin(a.start) - toMin(b.start));

  const vaccinations = record
    ? record.vaccinations
        .map((v) => ({ v, state: vaccinationState(v) }))
        .sort((a, b) => Number(b.state.overdue) - Number(a.state.overdue) || a.v.due.localeCompare(b.v.due))
    : [];
  const overdue = vaccinations.filter((x) => x.state.overdue);
  const latestWeight = record?.weights_kg[record.weights_kg.length - 1];

  return (
    <Column as="main" id="main" fillWidth horizontal="center" paddingX="16" paddingY="24">
      <Column maxWidth="l" gap="24">
        <Row>
          <Button href="/" variant="tertiary" size="s" prefixIcon="arrowLeft">
            Today&rsquo;s schedule
          </Button>
        </Row>

        <Row horizontal="between" vertical="end" gap="16" wrap>
          <Column gap="8">
            <Row gap="12" vertical="center" wrap>
              <Heading as="h1" textVariant="display-strong-s">
                {patient.name}
              </Heading>
              <Tag tone="neutral" label={patient.species} />
            </Row>
            <Text textVariant="body-default-l" onBackground="neutral-medium">
              {patient.breed} &middot; {ageLabel(patient.born, TODAY)} &middot; {patient.sex}
            </Text>
          </Column>
          <Button prefixIcon="calendar" onClick={() => openBooking(patient.id)}>
            Book follow-up
          </Button>
        </Row>

        <AlertBanner alerts={patient.alerts} />

        {overdue.length > 0 && (
          <Row
            background="warning-alpha-weak"
            border="warning-strong"
            radius="l"
            padding="16"
            gap="12"
            vertical="start"
            role="note"
          >
            <Icon name="warning" size="m" onBackground="warning-strong" />
            <Column gap="2">
              <Text textVariant="label-strong-m" onBackground="warning-strong">
                {overdue.length} {overdue.length === 1 ? "vaccination is" : "vaccinations are"} overdue
              </Text>
              <Text textVariant="body-default-s" onBackground="neutral-medium">
                {overdue.map((x) => `${x.v.name} (due ${formatDate(x.v.due)})`).join(", ")}
              </Text>
            </Column>
          </Row>
        )}

        <Grid columns="2" gap="24" m={{ columns: "1" }}>
          <Column gap="24">
            <Panel title="Patient and owner">
              <Column gap="12">
                <Fact label="Patient">
                  <Text textVariant="label-strong-m">{patient.name}</Text>
                  <Text textVariant="body-default-s" onBackground="neutral-medium">
                    {patient.species}, {patient.breed}
                  </Text>
                </Fact>
                <Fact label="Born">
                  <Text textVariant="body-default-m">
                    {formatDate(patient.born)} ({ageLabel(patient.born, TODAY)})
                  </Text>
                </Fact>
                <Fact label="Sex">
                  <Text textVariant="body-default-m">{patient.sex}</Text>
                </Fact>
                {latestWeight && (
                  <Fact label="Weight">
                    <Text textVariant="body-default-m">
                      {latestWeight.kg.toFixed(1)} kg ({formatDate(latestWeight.date)})
                    </Text>
                  </Fact>
                )}
                <Fact label="Owner">
                  <Text textVariant="label-strong-m">{owner?.name}</Text>
                  {owner && (
                    <SmartLink href={`tel:${owner.phone.replace(/\s/g, "")}`} prefixIcon="phone">
                      {owner.phone}
                    </SmartLink>
                  )}
                </Fact>
              </Column>
            </Panel>

            <Panel title="At the clinic today">
              {todays.length === 0 ? (
                <Text onBackground="neutral-medium">No appointments today.</Text>
              ) : (
                <Column as="ul" gap="12">
                  {todays.map((a) => (
                    <Row as="li" key={a.id} gap="12" vertical="center" horizontal="between" wrap>
                      <Column gap="2">
                        <Text textVariant="label-strong-m">
                          {fmtRange(a.start, a.minutes)} &middot; {a.reason}
                        </Text>
                        <Text textVariant="body-default-s" onBackground="neutral-weak">
                          {vetById[a.vet]?.name} &middot; {vetById[a.vet]?.room}
                        </Text>
                      </Column>
                      <Row gap="8" vertical="center">
                        <StatusTag status={a.status} />
                        {a.status === "booked" && (
                          <Button size="s" prefixIcon="check" onClick={() => checkIn(a.id)}>
                            Check in
                          </Button>
                        )}
                      </Row>
                    </Row>
                  ))}
                </Column>
              )}
            </Panel>

            {record && (
              <Panel title="Vaccinations">
                <Column as="ul" gap="8">
                  {vaccinations.map(({ v, state }) => (
                    <Row
                      as="li"
                      key={v.name}
                      background={state.overdue ? "danger-alpha-weak" : "neutral-alpha-weak"}
                      border={state.overdue ? "danger-strong" : "transparent"}
                      radius="m"
                      padding="12"
                      gap="12"
                      horizontal="between"
                      vertical="center"
                      wrap
                    >
                      <Column gap="2">
                        <Text textVariant="label-strong-m">{v.name}</Text>
                        <Text textVariant="body-default-s" onBackground="neutral-medium">
                          Given {formatDate(v.given)} &middot; due {formatDate(v.due)}
                        </Text>
                      </Column>
                      <Tag tone={state.tone} prefixIcon={state.icon} label={state.label} />
                    </Row>
                  ))}
                </Column>
              </Panel>
            )}

            {record && (
              <Panel title="Current medications">
                <Column as="ul" gap="12">
                  {record.medications.map((m) => (
                    <Row as="li" key={m.name} gap="12" vertical="start">
                      <Icon name="bolt" size="s" onBackground="brand-strong" />
                      <Column gap="2">
                        <Text textVariant="label-strong-m">{m.name}</Text>
                        <Text textVariant="body-default-s" onBackground="neutral-medium">
                          {m.dose} &middot; since {formatDate(m.since)}
                        </Text>
                      </Column>
                    </Row>
                  ))}
                </Column>
              </Panel>
            )}
          </Column>

          <Column gap="24">
            {record ? (
              <>
                <Panel title="Weight trend">
                  <WeightChart weights={record.weights_kg} />
                </Panel>
                <Panel title="Visit history">
                  <Column as="ol" gap="16">
                    {[...record.visits]
                      .sort((a, b) => b.date.localeCompare(a.date))
                      .map((visit, i) => (
                        <Column
                          as="li"
                          key={visit.date}
                          gap="8"
                          paddingTop={i === 0 ? "0" : "16"}
                          borderTop={i === 0 ? false : true}
                        >
                          <Row horizontal="between" vertical="center" gap="8" wrap>
                            <Row gap="8" vertical="center" wrap>
                              <Text textVariant="label-strong-m">{formatDate(visit.date)}</Text>
                              {visit.date === TODAY && <Tag tone="brand" label="Today" />}
                            </Row>
                            <Text textVariant="body-default-s" onBackground="neutral-weak" style={{ fontVariantNumeric: "tabular-nums" }}>
                              {money(visit.invoice_usd)}
                            </Text>
                          </Row>
                          <Text textVariant="heading-strong-m">{visit.reason}</Text>
                          <Text textVariant="body-default-s" onBackground="neutral-weak">
                            {vetById[visit.vet]?.name}
                          </Text>
                          <Text textVariant="body-default-m" onBackground="neutral-strong">
                            {visit.notes}
                          </Text>
                        </Column>
                      ))}
                  </Column>
                </Panel>
              </>
            ) : (
              <Panel title="Clinical record">
                <Text textVariant="body-default-m" onBackground="neutral-medium">
                  No weights, vaccinations, medications or visit notes are on file for {patient.name} yet.
                </Text>
              </Panel>
            )}
          </Column>
        </Grid>
      </Column>
    </Column>
  );
}
