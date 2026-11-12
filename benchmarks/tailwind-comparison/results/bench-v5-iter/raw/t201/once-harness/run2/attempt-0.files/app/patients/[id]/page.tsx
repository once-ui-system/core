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
