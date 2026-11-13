"use client";

import Link from "next/link";
import { Anchor, Badge, Box, Button, Grid, Group, Paper, Stack, Table, Text, Title } from "@mantine/core";
import { IconArrowLeft, IconPhone, IconPill, IconStethoscope, IconVaccine } from "@tabler/icons-react";
import {
  STATUS_META,
  TODAY,
  ageText,
  appointments,
  daysBetween,
  fmtClock,
  fmtDate,
  money,
  ownerById,
  patientById,
  records,
  toMin,
  vetById,
} from "@/lib/data";
import { AlertBadges, AlertBanner } from "./Alerts";
import { WeightChart } from "./WeightChart";

const longDate: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" };

function Section({ id, title, icon, children }: { id: string; title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <Paper withBorder radius="md" p="md" component="section" aria-labelledby={id}>
      <Group gap="xs" mb="sm">
        {icon}
        <Title order={2} fz="lg" id={id}>
          {title}
        </Title>
      </Group>
      {children}
    </Paper>
  );
}

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Box>
      <Text fz="xs" fw={700} tt="uppercase" lts="0.06em" c="gray.7">
        {label}
      </Text>
      <Text fw={600}>{children}</Text>
    </Box>
  );
}

export function PatientRecord({ patientId }: { patientId: string }) {
  const patient = patientById(patientId);
  if (!patient) return null;
  const owner = ownerById(patient.owner);
  const record = records[patientId];
  const todays = appointments.filter((a) => a.patient === patientId).sort((a, b) => toMin(a.start) - toMin(b.start));

  const weights = record?.weights ?? [];
  const first = weights[0];
  const last = weights[weights.length - 1];
  const change = first && last ? Math.round((last.kg - first.kg) * 10) / 10 : 0;
  const pct = first && last ? ((last.kg - first.kg) / first.kg) * 100 : 0;
  const chartData = weights.map((w) => ({ label: fmtDate(w.date, { month: "short", year: "numeric" }), kg: w.kg }));
  const weightSummary =
    first && last
      ? `Weight trend: ${first.kg} kilograms in ${fmtDate(first.date, { month: "long", year: "numeric" })} to ${last.kg} kilograms on ${fmtDate(last.date, longDate)}, ${weights.length} readings.`
      : "No weight readings";

  const overdue = (record?.vaccinations ?? []).filter((v) => v.due < TODAY);

  return (
    <Stack gap="lg">
      <Box>
        <Button
          component={Link}
          href="/"
          variant="subtle"
          size="md"
          px={0}
          leftSection={<IconArrowLeft size={18} aria-hidden="true" />}
        >
          Today&apos;s schedule
        </Button>
        <Group justify="space-between" align="flex-end" gap="xs">
          <Box>
            <Title order={1} fz={{ base: 32, sm: 40 }} lh={1.1}>
              {patient.name}
            </Title>
            <Text c="gray.7" fz="md">
              {patient.breed} · {patient.sex} · {ageText(patient.born, TODAY)} · ID {patient.id}
            </Text>
          </Box>
        </Group>
      </Box>

      <AlertBanner name={patient.name} alerts={patient.alerts} />

      {overdue.length > 0 && (
        <Paper
          role="note"
          p="md"
          radius="md"
          bg="orange.1"
          style={{ border: "2px solid var(--mantine-color-orange-7)" }}
          aria-label="Overdue vaccinations"
        >
          <Text fw={800} c="orange.9">
            {overdue.length} {overdue.length === 1 ? "vaccination is" : "vaccinations are"} overdue: {overdue.map((v) => v.name).join(", ")}
          </Text>
        </Paper>
      )}

      <Grid gap="md">
        <Grid.Col span={{ base: 12, md: 7 }}>
          <Stack gap="md">
            <Section id="details-title" title="Patient and owner">
              <Grid gap="md">
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <Stack gap="sm">
                    <Fact label="Species">{patient.species}</Fact>
                    <Fact label="Breed">{patient.breed}</Fact>
                    <Fact label="Sex">{patient.sex}</Fact>
                    <Fact label="Born">
                      {fmtDate(patient.born, longDate)} ({ageText(patient.born, TODAY)})
                    </Fact>
                  </Stack>
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <Stack gap="sm">
                    <Fact label="Owner">{owner.name}</Fact>
                    <Fact label="Phone">
                      <Anchor href={`tel:${owner.phone.replace(/\s/g, "")}`} fw={600}>
                        <IconPhone size={16} aria-hidden="true" style={{ verticalAlign: "-3px" }} /> {owner.phone}
                      </Anchor>
                    </Fact>
                    {last && <Fact label="Latest weight">{last.kg} kg</Fact>}
                    <Box>
                      <Text fz="xs" fw={700} tt="uppercase" lts="0.06em" c="gray.7">
                        Alerts
                      </Text>
                      {patient.alerts.length ? <AlertBadges alerts={patient.alerts} /> : <Text fw={600}>None on file</Text>}
                    </Box>
                  </Stack>
                </Grid.Col>
              </Grid>
            </Section>

            <Section id="weight-title" title="Weight trend">
              {chartData.length > 0 ? (
                <Stack gap="sm">
                  <Group gap="lg">
                    <Fact label="First reading">
                      {first.kg} kg
                    </Fact>
                    <Fact label="Latest">{last.kg} kg</Fact>
                    <Fact label={`Change over ${weights.length} visits`}>
                      <Text span fw={800} c={change < 0 ? "red.8" : "teal.8"}>
                        {change > 0 ? "+" : ""}
                        {change} kg ({pct.toFixed(1)}%)
                      </Text>
                    </Fact>
                  </Group>
                  <WeightChart data={chartData} summary={weightSummary} />
                </Stack>
              ) : (
                <Text c="gray.7">No weights recorded yet.</Text>
              )}
            </Section>

            <Section id="visits-title" title="Visit history" icon={<IconStethoscope size={20} aria-hidden="true" />}>
              {record && record.visits.length > 0 ? (
                <Stack gap="sm" component="ol" m={0} p={0} style={{ listStyle: "none" }}>
                  {record.visits.map((v) => (
                    <Paper key={v.date} component="li" p="sm" radius="md" bg="gray.0" withBorder>
                      <Group justify="space-between" gap="xs" align="flex-start">
                        <Box>
                          <Text fw={800}>
                            <time dateTime={v.date}>{fmtDate(v.date, longDate)}</time> · {v.reason}
                          </Text>
                          <Text fz="sm" c="gray.7">
                            {vetById(v.vet).name}
                          </Text>
                        </Box>
                        <Text fz="sm" fw={600} c="gray.7">
                          Invoice {money(v.invoice)}
                        </Text>
                      </Group>
                      <Text mt={6}>{v.notes}</Text>
                    </Paper>
                  ))}
                </Stack>
              ) : (
                <Text c="gray.7">No visits on file yet.</Text>
              )}
            </Section>
          </Stack>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 5 }}>
          <Stack gap="md">
            <Section id="vax-title" title="Vaccinations" icon={<IconVaccine size={20} aria-hidden="true" />}>
              {record && record.vaccinations.length > 0 ? (
                <Table.ScrollContainer minWidth={380}>
                  <Table verticalSpacing="xs">
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>Vaccine</Table.Th>
                        <Table.Th>Given</Table.Th>
                        <Table.Th>Due</Table.Th>
                        <Table.Th>Status</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {record.vaccinations.map((v) => {
                        const late = daysBetween(v.due, TODAY);
                        const isOverdue = late > 0;
                        return (
                          <Table.Tr key={v.name} bg={isOverdue ? "red.0" : undefined}>
                            <Table.Td fw={700}>{v.name}</Table.Td>
                            <Table.Td>{fmtDate(v.given, longDate)}</Table.Td>
                            <Table.Td fw={isOverdue ? 800 : 400} c={isOverdue ? "red.9" : undefined}>
                              {fmtDate(v.due, longDate)}
                            </Table.Td>
                            <Table.Td>
                              {isOverdue ? (
                                <Badge color="red.8" variant="filled" tt="none">
                                  Overdue {late} days
                                </Badge>
                              ) : (
                                <Badge color="teal" variant="light" tt="none">
                                  Up to date
                                </Badge>
                              )}
                            </Table.Td>
                          </Table.Tr>
                        );
                      })}
                    </Table.Tbody>
                  </Table>
                </Table.ScrollContainer>
              ) : (
                <Text c="gray.7">No vaccinations recorded.</Text>
              )}
            </Section>

            <Section id="meds-title" title="Current medications" icon={<IconPill size={20} aria-hidden="true" />}>
              {record && record.medications.length > 0 ? (
                <Stack gap="xs" component="ul" m={0} p={0} style={{ listStyle: "none" }}>
                  {record.medications.map((m) => (
                    <Paper key={m.name} component="li" p="sm" radius="md" bg="gray.0" withBorder>
                      <Text fw={700}>{m.name}</Text>
                      <Text fz="sm">{m.dose}</Text>
                      <Text fz="xs" c="gray.7">
                        Since {fmtDate(m.since, longDate)}
                      </Text>
                    </Paper>
                  ))}
                </Stack>
              ) : (
                <Text c="gray.7">No current medications.</Text>
              )}
            </Section>

            <Section id="today-title" title="At the clinic today">
              {todays.length > 0 ? (
                <Stack gap="xs" component="ul" m={0} p={0} style={{ listStyle: "none" }}>
                  {todays.map((a) => (
                    <Group key={a.id} component="li" justify="space-between" wrap="nowrap" gap="xs">
                      <Box>
                        <Text fw={700}>
                          {fmtClock(toMin(a.start))} · {a.reason}
                        </Text>
                        <Text fz="sm" c="gray.7">
                          {vetById(a.vet).name} · {vetById(a.vet).room}
                        </Text>
                      </Box>
                      <Badge color={STATUS_META[a.status].color} variant="light" size="lg">
                        {STATUS_META[a.status].label}
                      </Badge>
                    </Group>
                  ))}
                </Stack>
              ) : (
                <Text c="gray.7">No appointments today.</Text>
              )}
            </Section>
          </Stack>
        </Grid.Col>
      </Grid>
    </Stack>
  );
}
