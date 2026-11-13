import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Avatar, Button, Column, Grid, Heading, Icon, Row, Tag, Text } from "@once-ui-system/core";
import { AppHeader, SkipLink } from "@/components/pawpoint/AppHeader";
import { AlertBanner } from "@/components/pawpoint/Alerts";
import { WeightChart } from "@/components/pawpoint/WeightChart";
import {
  STATUS_LABEL,
  TODAY,
  ageLabel,
  formatDate,
  getOwner,
  getPatient,
  getVet,
  initialAppointments,
  patients,
  records,
  timeRange,
  vaccinationState,
} from "@/lib/data";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const patient = getPatient(id);
  return { title: patient ? `${patient.name} | Pawpoint` : "Patient not found | Pawpoint" };
}

const listReset: React.CSSProperties = { listStyle: "none", margin: 0, padding: 0 };

function Panel({ title, id, children }: { title: string; id: string; children: React.ReactNode }) {
  return (
    <Column as="section" aria-labelledby={id} background="surface" border radius="l" padding="20" gap="16" fillWidth style={{ minWidth: 0 }}>
      <Heading as="h2" id={id} variant="heading-strong-l">
        {title}
      </Heading>
      {children}
    </Column>
  );
}

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Column gap="2">
      <Text variant="label-default-s" onBackground="neutral-weak">
        {label}
      </Text>
      <Text variant="body-default-m">{children}</Text>
    </Column>
  );
}

export default async function PatientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const patient = getPatient(id);
  if (!patient) notFound();

  const owner = getOwner(patient.owner);
  const record = records[patient.id];
  const otherPets = patients.filter((p) => p.owner === owner.id && p.id !== patient.id);
  const today = initialAppointments
    .filter((a) => a.patient === patient.id)
    .sort((a, b) => a.start.localeCompare(b.start));

  const vaccinations = record ? [...record.vaccinations].sort((a, b) => a.due.localeCompare(b.due)) : [];
  const overdue = vaccinations.filter((v) => vaccinationState(v.due).kind === "overdue");

  const weights = record?.weights_kg ?? [];
  const firstW = weights[0];
  const lastW = weights[weights.length - 1];
  const delta = firstW && lastW ? lastW.kg - firstW.kg : 0;
  const deltaPct = firstW && lastW ? (delta / firstW.kg) * 100 : 0;

  return (
    <Column fillWidth horizontal="center">
      <SkipLink />
      <AppHeader />
      <Column as="main" id="main" fillWidth maxWidth={72} padding="16" gap="24" paddingBottom="40">
        <Row>
          <Button href="/" variant="tertiary" size="s" prefixIcon="chevronLeft" label="Back to schedule" />
        </Row>

        <Row gap="16" vertical="center" wrap>
          <Avatar value={patient.name.slice(0, 1)} size="xl" aria-hidden />
          <Column gap="4">
            <Heading as="h1" variant="display-strong-s">
              {patient.name}
            </Heading>
            <Text variant="body-default-l" onBackground="neutral-weak">
              {patient.breed} · {patient.species} · {ageLabel(patient.born)} · {patient.sex}
            </Text>
            <Text variant="body-default-s" onBackground="neutral-weak">
              Patient {patient.id} · Owner {owner.name}
            </Text>
          </Column>
          {overdue.length > 0 && (
            <Row style={{ marginLeft: "auto" }}>
              <a href="#vaccinations" style={{ textDecoration: "none" }}>
                <Tag scheme="warning" prefixIcon="warning" size="l">
                  {overdue.length} vaccination{overdue.length === 1 ? "" : "s"} overdue
                </Tag>
              </a>
            </Row>
          )}
        </Row>

        <AlertBanner alerts={patient.alerts} name={patient.name} />

        {today.length > 0 && (
          <Panel title="At the clinic today" id="today-title">
            <ul style={{ ...listReset, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {today.map((a) => (
                <li key={a.id}>
                  <Row gap="12" wrap vertical="center" horizontal="between">
                    <Column gap="2">
                      <Text variant="label-strong-m">
                        {timeRange(a)} · {a.reason}
                      </Text>
                      <Text variant="body-default-s" onBackground="neutral-weak">
                        {getVet(a.vet).name} · {getVet(a.vet).room}
                      </Text>
                    </Column>
                    <Tag scheme={a.status === "done" ? "success" : "neutral"} size="m">
                      {STATUS_LABEL[a.status]}
                    </Tag>
                  </Row>
                </li>
              ))}
            </ul>
          </Panel>
        )}

        <Grid columns="2" s={{ columns: "1" }} gap="16" fillWidth>
          <Panel title="Patient" id="patient-title">
            <Grid columns="2" gap="16" fillWidth>
              <Fact label="Species">{patient.species}</Fact>
              <Fact label="Breed">{patient.breed}</Fact>
              <Fact label="Born">
                {formatDate(patient.born)} ({ageLabel(patient.born)})
              </Fact>
              <Fact label="Sex">{patient.sex}</Fact>
            </Grid>
          </Panel>
          <Panel title="Owner" id="owner-title">
            <Grid columns="2" gap="16" fillWidth>
              <Fact label="Name">{owner.name}</Fact>
              <Fact label="Phone">
                <a href={`tel:${owner.phone.replace(/\s/g, "")}`} style={{ color: "inherit" }}>
                  {owner.phone}
                </a>
              </Fact>
              {otherPets.length > 0 && (
                <Fact label="Other pets">
                  {otherPets.map((p, i) => (
                    <span key={p.id}>
                      {i > 0 ? ", " : ""}
                      <Link href={`/patients/${p.id}`} style={{ color: "inherit" }}>
                        {p.name}
                      </Link>
                    </span>
                  ))}
                </Fact>
              )}
            </Grid>
          </Panel>
        </Grid>

        {!record && (
          <Column background="surface" border radius="l" padding="20">
            <Text variant="body-default-m" onBackground="neutral-weak">
              No weights, vaccinations or visit history are loaded for {patient.name} in this demo.
            </Text>
          </Column>
        )}

        {record && (
          <>
            <Panel title="Weight trend" id="weight-title">
              <Row gap="32" wrap>
                <Fact label="Latest">
                  <span style={{ fontWeight: 700 }}>{lastW.kg.toFixed(1)} kg</span> on {formatDate(lastW.date)}
                </Fact>
                <Fact label={`Since ${formatDate(firstW.date)}`}>
                  <span style={{ fontWeight: 700 }}>
                    {delta > 0 ? "+" : "−"}
                    {Math.abs(delta).toFixed(1)} kg ({deltaPct > 0 ? "+" : "−"}
                    {Math.abs(deltaPct).toFixed(1)}%)
                  </span>
                </Fact>
                <Fact label="Readings">{weights.length} visits</Fact>
              </Row>
              <WeightChart points={weights} name={patient.name} />
            </Panel>

            <Panel title="Vaccinations" id="vaccinations">
              {overdue.length > 0 && (
                <Row role="status" background="warning-alpha-weak" border="warning-strong" radius="m" padding="12" gap="8" vertical="center">
                  <Icon name="warning" onBackground="warning-strong" size="s" />
                  <Text variant="label-strong-s" onBackground="warning-strong">
                    Overdue as of {formatDate(TODAY)}: {overdue.map((v) => v.name).join(", ")}
                  </Text>
                </Row>
              )}
              <ul style={{ ...listReset, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {vaccinations.map((v) => {
                  const state = vaccinationState(v.due);
                  return (
                    <li key={v.name}>
                      <Row
                        gap="12"
                        wrap
                        vertical="center"
                        horizontal="between"
                        padding="12"
                        radius="m"
                        background={state.kind === "overdue" ? "warning-alpha-weak" : "transparent"}
                        border={state.kind === "overdue" ? "warning-medium" : true}
                      >
                        <Column gap="2" style={{ flex: "1 1 10rem" }}>
                          <Text variant="label-strong-m">{v.name}</Text>
                          <Text variant="body-default-s" onBackground="neutral-weak">
                            Given {formatDate(v.given)}
                          </Text>
                        </Column>
                        <Text variant="body-default-m" style={{ flex: "1 1 9rem" }}>
                          Due {formatDate(v.due)}
                        </Text>
                        {state.kind === "overdue" ? (
                          <Tag scheme="warning" prefixIcon="warning" size="m">
                            <span style={{ fontWeight: 700 }}>Overdue {state.days} days</span>
                          </Tag>
                        ) : state.kind === "soon" ? (
                          <Tag scheme="info" prefixIcon="time" size="m">
                            Due in {state.days} days
                          </Tag>
                        ) : (
                          <Tag scheme="success" prefixIcon="check" size="m">
                            Up to date
                          </Tag>
                        )}
                      </Row>
                    </li>
                  );
                })}
              </ul>
            </Panel>

            <Panel title="Current medications" id="meds-title">
              <ul style={{ ...listReset, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {record.medications.map((m) => (
                  <li key={m.name}>
                    <Row gap="12" wrap vertical="center" horizontal="between">
                      <Column gap="2">
                        <Text variant="label-strong-m">{m.name}</Text>
                        <Text variant="body-default-m">{m.dose}</Text>
                      </Column>
                      <Text variant="body-default-s" onBackground="neutral-weak">
                        Since {formatDate(m.since)}
                      </Text>
                    </Row>
                  </li>
                ))}
              </ul>
            </Panel>

            <Panel title="Visit history" id="visits-title">
              <ol style={{ ...listReset, display: "flex", flexDirection: "column", gap: "1rem" }}>
                {record.visits.map((v) => (
                  <li key={v.date}>
                    <Column gap="4" paddingLeft="16" style={{ borderLeft: "3px solid var(--neutral-alpha-strong)" }}>
                      <Row gap="8" wrap vertical="center" horizontal="between">
                        <Text variant="label-strong-m">
                          {formatDate(v.date)} · {v.reason}
                        </Text>
                        <Row gap="8" vertical="center">
                          {v.date === TODAY && (
                            <Tag scheme="brand" size="m">
                              Today
                            </Tag>
                          )}
                          <Text variant="body-default-s" onBackground="neutral-weak">
                            ${v.invoice_usd.toFixed(2)}
                          </Text>
                        </Row>
                      </Row>
                      <Text variant="body-default-s" onBackground="neutral-weak">
                        {getVet(v.vet).name}
                      </Text>
                      <Text variant="body-default-m">{v.notes}</Text>
                    </Column>
                  </li>
                ))}
              </ol>
            </Panel>
          </>
        )}
      </Column>
    </Column>
  );
}
