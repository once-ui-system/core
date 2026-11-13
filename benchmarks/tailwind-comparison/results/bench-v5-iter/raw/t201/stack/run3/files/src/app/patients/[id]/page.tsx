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
