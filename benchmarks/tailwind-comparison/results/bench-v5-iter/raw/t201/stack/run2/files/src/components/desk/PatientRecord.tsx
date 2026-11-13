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
