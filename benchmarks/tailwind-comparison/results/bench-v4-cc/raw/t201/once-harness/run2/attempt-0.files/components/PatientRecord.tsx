"use client";

import type { ReactNode } from "react";
import { Button, Column, Grid, Heading, Icon, Row, SmartLink, Tag, Text } from "@once-ui-system/core";
import { AlertBanner } from "@/components/Alerts";
import { AppHeader } from "@/components/AppHeader";
import { WeightChart } from "@/components/WeightChart";
import {
  ageLabel,
  APPOINTMENTS,
  daysBetween,
  fmtDate,
  fmtDuration,
  fmtMoney,
  fmtTime,
  ownerById,
  type Patient,
  RECORDS,
  STATUS_LABEL,
  TODAY,
  vetById,
} from "@/lib/data";

function Panel({ id, title, icon, children }: { id: string; title: string; icon: "heart" | "clipboard" | "trend" | "document" | "calendar"; children: ReactNode }) {
  return (
    <Column as="section" aria-labelledby={id} background="surface" border radius="l" padding="20" gap="16" fillWidth>
      <Row gap="8" vertical="center">
        <Icon name={icon} size="m" onBackground="neutral-weak" />
        <Heading as="h2" id={id} textVariant="heading-strong-l">
          {title}
        </Heading>
      </Row>
      {children}
    </Column>
  );
}

function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Column gap="4">
      <Text textVariant="label-default-s" onBackground="neutral-weak">
        {label}
      </Text>
      <Text textVariant="body-strong-m">{children}</Text>
    </Column>
  );
}

export function PatientRecord({ patient }: { patient: Patient }) {
  const owner = ownerById(patient.owner);
  const record = RECORDS[patient.id];
  const todays = APPOINTMENTS.filter((a) => a.patient === patient.id).sort((a, b) => a.start.localeCompare(b.start));
  const lastWeight = record?.weights_kg[record.weights_kg.length - 1];

  const vaccines = record
    ? record.vaccinations
        .map((v) => ({ ...v, overdueBy: daysBetween(v.due, TODAY) }))
        .sort((a, b) => b.overdueBy - a.overdueBy)
    : [];
  const overdue = vaccines.filter((v) => v.overdueBy > 0);

  return (
    <Column fillWidth minHeight="100vh">
      <AppHeader />
      <Column as="main" id="main" fillWidth horizontal="center" paddingX="16" paddingY="24">
        <Column fillWidth gap="24" style={{ maxWidth: "80rem" }}>
          <SmartLink href="/" prefixIcon="arrowLeft">
            Today’s schedule
          </SmartLink>

          <AlertBanner name={patient.name} alerts={patient.alerts} />

          <Column as="section" aria-label="Patient and owner details" background="surface" border radius="l" padding="20" gap="20" fillWidth>
            <Row wrap gap="16" vertical="center" horizontal="between">
              <Row gap="16" vertical="center">
                <Row center width={56} height={56} radius="full" background="brand-alpha-weak">
                  <Icon name="paw" size="l" onBackground="brand-strong" />
                </Row>
                <Column gap="4">
                  <Heading as="h1" textVariant="display-strong-xs">
                    {patient.name}
                  </Heading>
                  <Text onBackground="neutral-weak">
                    {patient.species}, {patient.breed}
                  </Text>
                </Column>
              </Row>
              <Row gap="8" wrap>
                {overdue.length > 0 && (
                  <Tag tone="danger" prefixIcon="warning" label={`${overdue.length} vaccinations overdue`} />
                )}
              </Row>
            </Row>
            <Grid minColumnWidth="12rem" gap="20" fillWidth>
              <Fact label="Born">
                {fmtDate(patient.born)} ({ageLabel(patient.born, TODAY)})
              </Fact>
              <Fact label="Sex">{patient.sex}</Fact>
              {lastWeight && <Fact label={`Weight, ${fmtDate(lastWeight.date)}`}>{lastWeight.kg} kg</Fact>}
              <Fact label="Owner">{owner.name}</Fact>
              <Column gap="4">
                <Text textVariant="label-default-s" onBackground="neutral-weak">
                  Owner phone
                </Text>
                <Row>
                  <Button href={`tel:${owner.phone.replace(/\s+/g, "")}`} variant="secondary" size="s" prefixIcon="phone">
                    {owner.phone}
                  </Button>
                </Row>
              </Column>
            </Grid>
          </Column>

          {todays.length > 0 && (
            <Panel id="today-title" title="Today at the clinic" icon="calendar">
              <Column as="ul" gap="8" style={{ margin: 0, padding: 0, listStyle: "none" }}>
                {todays.map((a) => (
                  <Row as="li" key={a.id} gap="12" wrap vertical="center" padding="12" radius="m" background="neutral-alpha-weak">
                    <Text textVariant="label-strong-m" style={{ minWidth: "5rem" }}>
                      {fmtTime(a.start)}
                    </Text>
                    <Text flex="1" textVariant="body-default-m" style={{ minWidth: "12rem" }}>
                      {a.reason} with {vetById(a.vet).name} ({vetById(a.vet).room}), {fmtDuration(a.minutes)}
                    </Text>
                    <Tag tone={a.status === "done" ? "success" : "neutral"} label={STATUS_LABEL[a.status]} />
                  </Row>
                ))}
              </Column>
            </Panel>
          )}

          {!record ? (
            <Column background="surface" border radius="l" padding="24" gap="8" fillWidth>
              <Text textVariant="heading-strong-m">No detailed record in this demo</Text>
              <Text onBackground="neutral-weak">
                Weights, vaccinations, medications and visit notes are shown for Olive (p-104) in this build.
              </Text>
            </Column>
          ) : (
            <Row fillWidth wrap gap="24" vertical="start">
              <Column gap="24" style={{ flex: "1 1 26rem", minWidth: 0 }}>
                <Panel id="vax-title" title="Vaccinations" icon="heart">
                  <Column as="ul" gap="8" style={{ margin: 0, padding: 0, listStyle: "none" }}>
                    {vaccines.map((v) => {
                      const late = v.overdueBy > 0;
                      const soon = !late && v.overdueBy > -30;
                      return (
                        <Row
                          as="li"
                          key={v.name}
                          wrap
                          gap="12"
                          vertical="center"
                          horizontal="between"
                          padding="12"
                          radius="m"
                          background={late ? "danger-alpha-weak" : "neutral-alpha-weak"}
                          border={late ? "danger-alpha-strong" : false}
                          borderWidth={late ? 2 : 1}
                        >
                          <Column gap="4">
                            <Text textVariant="body-strong-m">{v.name}</Text>
                            <Text textVariant="body-default-s" onBackground="neutral-weak">
                              Given {fmtDate(v.given)} · due {fmtDate(v.due)}
                            </Text>
                          </Column>
                          {late ? (
                            <Tag tone="danger" prefixIcon="warning" label={`Overdue ${v.overdueBy} days`} />
                          ) : soon ? (
                            <Tag tone="warning" label={`Due in ${-v.overdueBy} days`} />
                          ) : (
                            <Tag tone="success" prefixIcon="check" label="Up to date" />
                          )}
                        </Row>
                      );
                    })}
                  </Column>
                </Panel>

                <Panel id="meds-title" title="Current medications" icon="clipboard">
                  <Column as="ul" gap="8" style={{ margin: 0, padding: 0, listStyle: "none" }}>
                    {record.medications.map((m) => (
                      <Row as="li" key={m.name} wrap gap="12" horizontal="between" padding="12" radius="m" background="neutral-alpha-weak">
                        <Column gap="4">
                          <Text textVariant="body-strong-m">{m.name}</Text>
                          <Text textVariant="body-default-s" onBackground="neutral-weak">
                            {m.dose}
                          </Text>
                        </Column>
                        <Text textVariant="label-default-s" onBackground="neutral-weak">
                          Since {fmtDate(m.since)}
                        </Text>
                      </Row>
                    ))}
                  </Column>
                </Panel>

                <Panel id="weight-title" title="Weight trend (kg)" icon="trend">
                  <WeightChart points={record.weights_kg} />
                </Panel>
              </Column>

              <Column style={{ flex: "1.2 1 28rem", minWidth: 0 }}>
                <Panel id="visits-title" title="Visit history" icon="document">
                  <Column as="ol" gap="16" style={{ margin: 0, padding: 0, listStyle: "none" }}>
                    {record.visits.map((v) => (
                      <Column as="li" key={v.date} gap="8" padding="16" radius="m" background="neutral-alpha-weak">
                        <Row wrap gap="8" horizontal="between" vertical="center">
                          <Text textVariant="body-strong-m">{v.reason}</Text>
                          <Text textVariant="label-default-s" onBackground="neutral-weak">
                            {fmtDate(v.date)}
                          </Text>
                        </Row>
                        <Text textVariant="label-default-s" onBackground="neutral-weak">
                          {vetById(v.vet).name} · Invoice {fmtMoney(v.invoice_usd)}
                        </Text>
                        <Text textVariant="body-default-m">{v.notes}</Text>
                      </Column>
                    ))}
                  </Column>
                </Panel>
              </Column>
            </Row>
          )}
        </Column>
      </Column>
    </Column>
  );
}
