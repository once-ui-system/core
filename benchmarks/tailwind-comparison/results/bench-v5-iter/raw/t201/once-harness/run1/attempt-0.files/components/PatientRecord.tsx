"use client";

import {
  Avatar,
  Breadcrumbs,
  Button,
  Column,
  Grid,
  Heading,
  Icon,
  Row,
  SmartLink,
  Tag,
  Text,
} from "@once-ui-system/core";
import { AlertBanner, AlertChips } from "./AlertTags";
import { WeightTrend } from "./WeightTrend";
import { useClinic } from "@/lib/clinic";
import {
  ageText,
  endTime,
  fmtDate,
  getOwner,
  getPatient,
  getVet,
  patients,
  records,
  statusLabel,
  usd,
  vaccineState,
} from "@/lib/data";

function Panel({
  title,
  id,
  aside,
  children,
  wide,
}: {
  title: string;
  id: string;
  aside?: React.ReactNode;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <Column
      as="section"
      aria-labelledby={id}
      background="surface"
      border
      radius="l"
      padding="24"
      s={{ padding: "16" }}
      gap="16"
      style={wide ? { gridColumn: "1 / -1" } : undefined}>
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
    <Row gap="16" horizontal="between" vertical="start" paddingY="8" borderBottom>
      <Text as="dt" textVariant="label-default-s" onBackground="neutral-weak">
        {label}
      </Text>
      <Text as="dd" textVariant="body-strong-m" align="right">
        {children}
      </Text>
    </Row>
  );
}

export function PatientRecord({ id }: { id: string }) {
  const { appointments, openBooking } = useClinic();
  const p = getPatient(id);
  if (!p) return null;
  const owner = getOwner(p.owner);
  const record = records[p.id];
  const today = appointments
    .filter((a) => a.patient === p.id)
    .sort((x, y) => x.start.localeCompare(y.start));
  const siblings = patients.filter((o) => o.owner === p.owner && o.id !== p.id);
  const overdue = record ? record.vaccinations.filter((v) => vaccineState(v.due).kind === "overdue") : [];

  return (
    <>
      <Breadcrumbs
        items={[
          { label: "Today's schedule", href: "/" },
          { label: "Patients" },
          { label: p.name },
        ]}
      />

      <Row gap="16" vertical="center" wrap horizontal="between">
        <Row gap="16" vertical="center">
          <Avatar icon="paw" size="l" />
          <Column gap="4">
            <Heading as="h1" textVariant="display-strong-xs">
              {p.name}
            </Heading>
            <Text onBackground="neutral-weak" textVariant="body-default-m">
              {p.breed} · {p.sex} · {ageText(p.born)}
            </Text>
          </Column>
        </Row>
        <Row gap="8" wrap>
          {owner && (
            <Button variant="secondary" prefixIcon="phone" href={`tel:${owner.phone.replace(/\s/g, "")}`}>
              Call {owner.name.split(" ")[0]}
            </Button>
          )}
          <Button prefixIcon="calendar" onClick={() => openBooking(p.id)}>
            Book follow-up
          </Button>
        </Row>
      </Row>

      <AlertBanner name={p.name} alerts={p.alerts} />
      {overdue.length > 0 && (
        <Row
          background="warning-alpha-weak"
          border="warning-alpha-medium"
          radius="l"
          padding="12"
          paddingX="16"
          gap="12"
          vertical="center">
          <Icon name="warning" onBackground="warning-strong" />
          <Text textVariant="label-strong-m" onBackground="warning-strong">
            {overdue.length} vaccinations overdue: {overdue.map((v) => v.name).join(", ")}
          </Text>
        </Row>
      )}

      <Grid columns="2" m={{ columns: "1" }} gap="16">
        <Panel title="Patient and owner" id="details-title">
          <Column as="dl" gap="0" margin="0">
            <Fact label="Species">{p.species}</Fact>
            <Fact label="Breed">{p.breed}</Fact>
            <Fact label="Born">
              {fmtDate(p.born)} ({ageText(p.born)})
            </Fact>
            <Fact label="Sex">{p.sex}</Fact>
            <Fact label="Owner">{owner?.name}</Fact>
            <Fact label="Phone">
              {owner && <SmartLink href={`tel:${owner.phone.replace(/\s/g, "")}`}>{owner.phone}</SmartLink>}
            </Fact>
            <Fact label="Patient ID">{p.id}</Fact>
          </Column>
          {siblings.length > 0 && (
            <Column gap="8">
              <Text textVariant="label-default-s" onBackground="neutral-weak">
                Other pets of {owner?.name}
              </Text>
              {siblings.map((s) => (
                <Row key={s.id} gap="8" vertical="center" wrap>
                  <SmartLink href={`/patients/${s.id}`}>
                    <Text textVariant="body-strong-m">{s.name}</Text>
                  </SmartLink>
                  <AlertChips alerts={s.alerts} />
                </Row>
              ))}
            </Column>
          )}
        </Panel>

        <Panel title="Today at the clinic" id="today-title">
          {today.length === 0 ? (
            <Text onBackground="neutral-weak">No appointments today.</Text>
          ) : (
            <Column as="ul" gap="8" margin="0" padding="0">
              {today.map((a) => (
                <Row
                  as="li"
                  key={a.id}
                  gap="12"
                  padding="12"
                  radius="m"
                  border
                  vertical="center"
                  wrap
                  style={{ listStyle: "none" }}>
                  <Column width="5rem" gap="0">
                    <Text textVariant="heading-strong-m">{a.start}</Text>
                    <Text textVariant="label-default-xs" onBackground="neutral-weak">
                      to {endTime(a)}
                    </Text>
                  </Column>
                  <Column flex={1} minWidth="10rem" gap="0">
                    <Text textVariant="body-strong-m">{a.reason}</Text>
                    <Text textVariant="body-default-s" onBackground="neutral-weak">
                      {getVet(a.vet)?.name} · {getVet(a.vet)?.room}
                    </Text>
                  </Column>
                  <Tag
                    tone={a.status === "done" ? "success" : a.status === "checked_in" ? "warning" : a.status === "in_exam" ? "info" : "neutral"}
                    label={statusLabel[a.status]}
                  />
                </Row>
              ))}
            </Column>
          )}
        </Panel>

        {record ? (
          <>
            <Panel title="Weight trend" id="weight-title" wide>
              <WeightTrend points={record.weights_kg} />
            </Panel>

            <Panel
              title="Vaccinations"
              id="vacc-title"
              aside={
                overdue.length > 0 ? (
                  <Tag tone="danger" prefixIcon="warning" label={`${overdue.length} overdue`} />
                ) : (
                  <Tag tone="success" prefixIcon="check" label="All up to date" />
                )
              }>
              <Column as="ul" gap="8" margin="0" padding="0">
                {record.vaccinations.map((v) => {
                  const st = vaccineState(v.due);
                  const bad = st.kind === "overdue";
                  return (
                    <Row
                      as="li"
                      key={v.name}
                      gap="12"
                      padding="12"
                      radius="m"
                      border={bad ? "danger-alpha-strong" : true}
                      background={bad ? "danger-alpha-weak" : "transparent"}
                      vertical="center"
                      horizontal="between"
                      wrap
                      style={{ listStyle: "none" }}>
                      <Column gap="0">
                        <Text textVariant="body-strong-m">{v.name}</Text>
                        <Text textVariant="body-default-s" onBackground="neutral-weak">
                          Given {fmtDate(v.given)} · due {fmtDate(v.due)}
                        </Text>
                      </Column>
                      {bad ? (
                        <Tag tone="danger" prefixIcon="warning" label={`Overdue by ${st.days} days`} />
                      ) : st.kind === "soon" ? (
                        <Tag tone="warning" prefixIcon="time" label={`Due in ${st.days} days`} />
                      ) : (
                        <Tag tone="success" prefixIcon="check" label="Up to date" />
                      )}
                    </Row>
                  );
                })}
              </Column>
            </Panel>

            <Panel title="Current medications" id="meds-title">
              <Column as="ul" gap="8" margin="0" padding="0">
                {record.medications.map((m) => (
                  <Row
                    as="li"
                    key={m.name}
                    gap="12"
                    padding="12"
                    radius="m"
                    border
                    vertical="center"
                    horizontal="between"
                    wrap
                    style={{ listStyle: "none" }}>
                    <Column gap="0">
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

            <Panel title="Visit history" id="visits-title" wide>
              <Column as="ol" gap="0" margin="0" padding="0">
                {record.visits.map((v, i) => (
                  <Row
                    as="li"
                    key={v.date}
                    gap="24"
                    paddingY="16"
                    borderTop={i > 0}
                    vertical="start"
                    wrap
                    style={{ listStyle: "none" }}>
                    <Column width="9rem" gap="0">
                      <Text textVariant="body-strong-m">{fmtDate(v.date)}</Text>
                      <Text textVariant="label-default-s" onBackground="neutral-weak">
                        {getVet(v.vet)?.name}
                      </Text>
                    </Column>
                    <Column flex={1} minWidth="16rem" gap="4">
                      <Text textVariant="heading-strong-m">{v.reason}</Text>
                      <Text textVariant="body-default-m">{v.notes}</Text>
                    </Column>
                    <Text textVariant="label-default-s" onBackground="neutral-weak">
                      Invoice {usd(v.invoice_usd)}
                    </Text>
                  </Row>
                ))}
              </Column>
            </Panel>
          </>
        ) : (
          <Panel title="Clinical record" id="no-record-title" wide>
            <Text onBackground="neutral-weak">
              No weights, vaccinations, medications or visit notes are stored for {p.name} in this demo.
            </Text>
          </Panel>
        )}
      </Grid>
    </>
  );
}
