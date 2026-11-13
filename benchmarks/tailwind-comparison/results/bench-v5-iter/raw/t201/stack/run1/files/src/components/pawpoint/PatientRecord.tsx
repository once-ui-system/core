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
