"use client";

import Link from "next/link";
import { LineChart } from "@mantine/charts";
import {
  Alert,
  Anchor,
  Avatar,
  Badge,
  Box,
  Grid,
  Group,
  Paper,
  SimpleGrid,
  Stack,
  Table,
  Text,
  Title,
} from "@mantine/core";
import {
  IconAlertTriangleFilled,
  IconArrowLeft,
  IconPaw,
  IconPhone,
  IconPill,
  IconStethoscope,
  IconVaccine,
} from "@tabler/icons-react";
import {
  TODAY,
  ageText,
  daysBetween,
  endOf,
  fmt12,
  fmtDate,
  fmtMonthYear,
  fmtUsd,
  getOwner,
  getPatient,
  getVet,
  initialAppointments,
  records,
  statusMeta,
} from "@/lib/data";
import { AlertFlags } from "./AlertFlags";

function Section({
  title,
  icon,
  children,
  id,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  id: string;
}) {
  return (
    <Paper withBorder p={{ base: "sm", sm: "md" }} radius="md" component="section" aria-labelledby={id}>
      <Group gap="xs" mb="sm">
        {icon}
        <Title order={2} size="h4" id={id}>
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
      <Text size="xs" c="dimmed" fw={600} tt="uppercase" style={{ letterSpacing: 0.4 }}>
        {label}
      </Text>
      <Text fw={600}>{children}</Text>
    </Box>
  );
}

export function PatientRecord({ patientId }: { patientId: string }) {
  const patient = getPatient(patientId);
  if (!patient) return null;
  const owner = getOwner(patient.owner);
  const record = records[patient.id];
  const todays = initialAppointments.filter((a) => a.patient === patient.id && a.status !== "cancelled");

  const weights = record?.weights_kg ?? [];
  const chartData = weights.map((w) => ({ date: fmtMonthYear(w.date), kg: w.kg }));
  const first = weights[0];
  const last = weights[weights.length - 1];
  const previous = weights[weights.length - 2];
  const totalChange = first && last ? last.kg - first.kg : 0;
  const lastChange = previous && last ? last.kg - previous.kg : 0;
  const sign = (n: number) => (n > 0 ? "+" : n < 0 ? "−" : "");

  const vaccinations = (record?.vaccinations ?? []).map((v) => {
    const days = daysBetween(TODAY, v.due);
    const state = days < 0 ? "overdue" : days <= 60 ? "soon" : "current";
    return { ...v, days, state } as const;
  });
  const overdue = vaccinations.filter((v) => v.state === "overdue");

  return (
    <Stack gap="md" pb="xl">
      <Anchor component={Link} href="/" size="sm" fw={600}>
        <Group gap={4}>
          <IconArrowLeft size={16} aria-hidden />
          Back to today&rsquo;s schedule
        </Group>
      </Anchor>

      <Group gap="md" wrap="nowrap">
        <Avatar size={64} color="teal.8" variant="filled" radius="xl" aria-hidden>
          <IconPaw size={34} />
        </Avatar>
        <Box>
          <Title order={1} size="h1">
            {patient.name}
          </Title>
          <Text c="dimmed">
            {patient.breed}, {patient.species.toLowerCase()} &middot; {ageText(patient.born)} old
          </Text>
        </Box>
      </Group>

      {patient.alerts.length > 0 && (
        <Box style={{ position: "sticky", top: 76, zIndex: 20 }}>
          <Alert
            variant="filled"
            color="red.9"
            radius="md"
            icon={<IconAlertTriangleFilled size={26} aria-hidden />}
            title="Medical alerts"
            role="region"
            aria-label={`Medical alerts for ${patient.name}`}
            styles={{ title: { fontSize: 18, fontWeight: 800 } }}
          >
            <Stack gap={2}>
              {patient.alerts.map((a) => (
                <Text key={a} fw={700} size="lg" c="white">
                  {a}
                </Text>
              ))}
            </Stack>
          </Alert>
        </Box>
      )}

      <Paper withBorder p={{ base: "sm", sm: "md" }} radius="md" component="section" aria-label="Patient and owner details">
        <SimpleGrid cols={{ base: 2, sm: 3, lg: 6 }} spacing="md">
          <Fact label="Species">{patient.species}</Fact>
          <Fact label="Breed">{patient.breed}</Fact>
          <Fact label="Born">
            {fmtDate(patient.born)}
            <Text span size="sm" c="dimmed" fw={400}>
              {" "}
              ({ageText(patient.born)})
            </Text>
          </Fact>
          <Fact label="Sex">{patient.sex}</Fact>
          <Fact label="Owner">{owner?.name}</Fact>
          <Fact label="Phone">
            {owner && (
              <Anchor href={`tel:${owner.phone.replace(/\s/g, "")}`} fw={600}>
                <Group gap={4} wrap="nowrap">
                  <IconPhone size={16} aria-hidden />
                  {owner.phone}
                </Group>
              </Anchor>
            )}
          </Fact>
        </SimpleGrid>
        <Text size="xs" c="dimmed" mt="sm">
          Patient ID {patient.id}
        </Text>
      </Paper>

      <Grid gap="md">
        <Grid.Col span={{ base: 12, lg: 7 }}>
          <Stack gap="md">
            {todays.length > 0 && (
              <Section id="today-title" title="At the clinic today" icon={<IconStethoscope size={20} aria-hidden />}>
                <Stack gap="xs">
                  {todays.map((a) => {
                    const vet = getVet(a.vet);
                    const meta = statusMeta[a.status];
                    return (
                      <Group key={a.id} justify="space-between" gap="xs">
                        <Box>
                          <Text fw={700}>
                            {fmt12(a.start)} to {fmt12(endOf(a))}, {a.reason}
                          </Text>
                          <Text size="sm" c="dimmed">
                            {vet?.name}, {vet?.room}
                          </Text>
                        </Box>
                        <Badge
                          size="lg"
                          variant="light"
                          color={meta.color}
                          c={`light-dark(var(--mantine-color-${meta.color}-9), var(--mantine-color-${meta.color}-2))`}
                        >
                          {meta.label}
                        </Badge>
                      </Group>
                    );
                  })}
                </Stack>
              </Section>
            )}

            <Section id="weight-title" title="Weight trend" icon={<IconStethoscope size={20} aria-hidden />}>
              {chartData.length === 0 ? (
                <Text c="dimmed">No weights on file yet.</Text>
              ) : (
                <>
                  <SimpleGrid cols={{ base: 1, xs: 3 }} spacing="sm" mb="md">
                    <Fact label="Latest">{last?.kg.toFixed(1)} kg</Fact>
                    <Fact label="Since last visit">
                      {sign(lastChange)}
                      {Math.abs(lastChange).toFixed(1)} kg
                    </Fact>
                    <Fact label={`Since ${first ? fmtDate(first.date) : ""}`}>
                      {sign(totalChange)}
                      {Math.abs(totalChange).toFixed(1)} kg
                      {first ? ` (${((totalChange / first.kg) * 100).toFixed(1).replace("-", "−")}%)` : ""}
                    </Fact>
                  </SimpleGrid>
                  <Box
                    role="img"
                    aria-label={`Line chart of ${patient.name}'s weight at ${weights.length} visits, from ${first?.kg} kg on ${first ? fmtDate(first.date) : ""} down to ${last?.kg} kg on ${last ? fmtDate(last.date) : ""}.`}
                  >
                    <LineChart
                      h={250}
                      data={chartData}
                      dataKey="date"
                      series={[{ name: "kg", label: "Weight", color: "teal.8" }]}
                      curveType="linear"
                      withDots
                      yAxisProps={{ domain: [26, 34] }}
                      valueFormatter={(v) => `${v} kg`}
                      tickLine="xy"
                    />
                  </Box>
                </>
              )}
            </Section>

            <Section id="visits-title" title="Visit history" icon={<IconStethoscope size={20} aria-hidden />}>
              {!record || record.visits.length === 0 ? (
                <Text c="dimmed">No past visits on file.</Text>
              ) : (
                <Stack gap="sm" component="ol" m={0} p={0} style={{ listStyle: "none" }}>
                  {record.visits.map((v) => (
                    <Paper key={v.date} component="li" withBorder p="sm" radius="md">
                      <Group justify="space-between" gap="xs" align="flex-start">
                        <Box>
                          <Text fw={700}>{v.reason}</Text>
                          <Text size="sm" c="dimmed">
                            {fmtDate(v.date)} &middot; {getVet(v.vet)?.name}
                          </Text>
                        </Box>
                        <Text size="sm" fw={600}>
                          {fmtUsd(v.invoice_usd)}
                        </Text>
                      </Group>
                      <Text size="sm" mt={6}>
                        {v.notes}
                      </Text>
                    </Paper>
                  ))}
                </Stack>
              )}
            </Section>
          </Stack>
        </Grid.Col>

        <Grid.Col span={{ base: 12, lg: 5 }}>
          <Stack gap="md">
            <Section id="vax-title" title="Vaccinations" icon={<IconVaccine size={20} aria-hidden />}>
              {vaccinations.length === 0 ? (
                <Text c="dimmed">No vaccinations on file yet.</Text>
              ) : (
                <>
                  {overdue.length > 0 && (
                    <Text c="red.9" fw={800} mb="sm">
                      {overdue.length} overdue as of {fmtDate(TODAY)}: {overdue.map((v) => v.name).join(", ")}
                    </Text>
                  )}
                  <Table.ScrollContainer minWidth={420}>
                    <Table verticalSpacing="xs">
                      <Table.Thead>
                        <Table.Tr>
                          <Table.Th scope="col">Vaccine</Table.Th>
                          <Table.Th scope="col">Given</Table.Th>
                          <Table.Th scope="col">Due</Table.Th>
                          <Table.Th scope="col">Status</Table.Th>
                        </Table.Tr>
                      </Table.Thead>
                      <Table.Tbody>
                        {vaccinations.map((v) => (
                          <Table.Tr
                            key={v.name}
                            style={{ background: v.state === "overdue" ? "var(--mantine-color-red-light)" : undefined }}
                          >
                            <Table.Td fw={700}>{v.name}</Table.Td>
                            <Table.Td>{fmtDate(v.given)}</Table.Td>
                            <Table.Td>{fmtDate(v.due)}</Table.Td>
                            <Table.Td>
                              {v.state === "overdue" ? (
                                <Badge color="red.9" variant="filled" size="lg">
                                  Overdue {Math.abs(v.days)} days
                                </Badge>
                              ) : v.state === "soon" ? (
                                <Badge color="yellow" variant="light" c="yellow.9" size="lg">
                                  Due in {v.days} days
                                </Badge>
                              ) : (
                                <Badge color="green" variant="light" c="green.9" size="lg">
                                  Up to date
                                </Badge>
                              )}
                            </Table.Td>
                          </Table.Tr>
                        ))}
                      </Table.Tbody>
                    </Table>
                  </Table.ScrollContainer>
                </>
              )}
            </Section>

            <Section id="meds-title" title="Current medications" icon={<IconPill size={20} aria-hidden />}>
              {!record || record.medications.length === 0 ? (
                <Text c="dimmed">No current medications.</Text>
              ) : (
                <Stack gap="xs" component="ul" m={0} p={0} style={{ listStyle: "none" }}>
                  {record.medications.map((m) => (
                    <Paper key={m.name} component="li" withBorder p="sm" radius="md">
                      <Text fw={700}>{m.name}</Text>
                      <Text size="sm">{m.dose}</Text>
                      <Text size="xs" c="dimmed">
                        Since {fmtDate(m.since)}
                      </Text>
                    </Paper>
                  ))}
                </Stack>
              )}
            </Section>

            {patient.alerts.length > 0 && (
              <Paper withBorder p="sm" radius="md" aria-label="Alerts summary">
                <Text size="xs" c="dimmed" fw={600} tt="uppercase" mb={6} style={{ letterSpacing: 0.4 }}>
                  Alerts on this record
                </Text>
                <AlertFlags alerts={patient.alerts} size="sm" />
              </Paper>
            )}
          </Stack>
        </Grid.Col>
      </Grid>
    </Stack>
  );
}
