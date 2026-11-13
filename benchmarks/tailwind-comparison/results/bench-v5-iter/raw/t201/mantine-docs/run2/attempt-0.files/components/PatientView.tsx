"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Anchor,
  Badge,
  Box,
  Button,
  Container,
  Grid,
  Group,
  List,
  Paper,
  Stack,
  Table,
  Text,
  Title,
} from "@mantine/core";
import { LineChart } from "@mantine/charts";
import {
  IconAlertTriangleFilled,
  IconArrowLeft,
  IconCalendarPlus,
  IconCircleCheck,
  IconPhone,
  IconPill,
  IconVaccine,
} from "@tabler/icons-react";
import { useAppState } from "@/components/AppState";
import { BookingModal } from "@/components/BookingModal";
import {
  STATUS_LABEL,
  TODAY,
  ageLabel,
  daysBetween,
  formatDate,
  getOwner,
  getPatient,
  getVet,
  records,
} from "@/lib/data";

function Section({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <Paper p="md" radius="md" component="section">
      <Group gap="xs" mb="sm">
        {icon}
        <Title order={2} fz="xl">
          {title}
        </Title>
      </Group>
      {children}
    </Paper>
  );
}

export function PatientView({ id }: { id: string }) {
  const patient = getPatient(id);
  const { appointments } = useAppState();
  const [booking, setBooking] = useState(false);
  if (!patient) return null;
  const owner = getOwner(patient.owner);
  const record = records[id];
  const todays = appointments
    .filter((a) => a.patient === id && a.status !== "cancelled")
    .sort((a, b) => a.start.localeCompare(b.start));

  const weights = record?.weights_kg ?? [];
  const first = weights[0];
  const last = weights[weights.length - 1];
  const chartData = weights.map((w) => ({ date: formatDate(w.date).replace(/, \d{4}$/, " ’" + w.date.slice(2, 4)), kg: w.kg }));
  const overdueCount = record?.vaccinations.filter((v) => v.due < TODAY).length ?? 0;

  return (
    <Container size="xl" py={{ base: "md", sm: "xl" }} px={{ base: "sm", sm: "lg" }}>
      <Anchor component={Link} href="/" fz="sm" fw={600} mb="sm" display="inline-block">
        <Group gap={4} wrap="nowrap">
          <IconArrowLeft size={16} aria-hidden /> Back to today&apos;s schedule
        </Group>
      </Anchor>

      <Paper p={{ base: "md", sm: "lg" }} radius="md" mb="md" component="header">
        <Group justify="space-between" align="flex-start" gap="md">
          <Box>
            <Title order={1} fz={{ base: 30, sm: 38 }} lh={1.1}>
              {patient.name}
            </Title>
            <Text fz="lg" c="dimmed">
              {patient.breed} · {patient.species}
            </Text>
          </Box>
          <Button size="lg" leftSection={<IconCalendarPlus size={22} aria-hidden />} onClick={() => setBooking(true)}>
            Book follow-up
          </Button>
        </Group>

        <Grid mt="md" gap="md">
          <Grid.Col span={{ base: 6, sm: 3 }}>
            <Fact label="Age" value={`${ageLabel(patient.born)} (born ${formatDate(patient.born)})`} />
          </Grid.Col>
          <Grid.Col span={{ base: 6, sm: 3 }}>
            <Fact label="Sex" value={patient.sex} />
          </Grid.Col>
          <Grid.Col span={{ base: 6, sm: 3 }}>
            <Fact label="Owner" value={owner?.name ?? ""} />
          </Grid.Col>
          <Grid.Col span={{ base: 6, sm: 3 }}>
            <Fact
              label="Phone"
              value={
                owner ? (
                  <Anchor href={`tel:${owner.phone.replace(/\s/g, "")}`} fw={600} c="dark.9">
                    <Group gap={4} wrap="nowrap">
                      <IconPhone size={16} aria-hidden />
                      {owner.phone}
                    </Group>
                  </Anchor>
                ) : null
              }
            />
          </Grid.Col>
        </Grid>
      </Paper>

      {patient.alerts.length > 0 && (
        <Paper
          role="region"
          aria-label="Medical alerts"
          p="md"
          radius="md"
          mb="md"
          bg="red.8"
          c="white"
          style={{ borderColor: "var(--mantine-color-red-9)", borderWidth: 2 }}
        >
          <Group gap="xs" mb={8}>
            <IconAlertTriangleFilled size={24} aria-hidden />
            <Text fw={800} fz="lg" tt="uppercase" style={{ letterSpacing: 0.6 }}>
              Medical alerts
            </Text>
          </Group>
          <Stack gap={6} component="ul" m={0} p={0} style={{ listStyle: "none" }}>
            {patient.alerts.map((a) => (
              <Text component="li" key={a} fw={700} fz={{ base: "lg", sm: 22 }} lh={1.25}>
                {a}
              </Text>
            ))}
          </Stack>
        </Paper>
      )}

      <Grid gap="md">
        <Grid.Col span={{ base: 12, lg: 7 }}>
          <Stack gap="md">
            {record ? (
              <>
                <Section title="Weight trend">
                  <Text fz="sm" c="dimmed" mb="sm">
                    {first && last && (
                      <>
                        {last.kg} kg on {formatDate(last.date)}, down {(first.kg - last.kg).toFixed(1)} kg (
                        {(((first.kg - last.kg) / first.kg) * 100).toFixed(0)}%) since {formatDate(first.date)}.
                      </>
                    )}
                  </Text>
                  <div role="img" aria-label={`Weight in kilograms over ${weights.length} visits: ${weights.map((w) => `${w.kg} on ${w.date}`).join(", ")}`}>
                    <LineChart
                      h={240}
                      data={chartData}
                      dataKey="date"
                      series={[{ name: "kg", label: "Weight (kg)", color: "teal.7" }]}
                      curveType="linear"
                      yAxisProps={{ domain: [27, 33] }}
                      unit=" kg"
                      dotProps={{ r: 4 }}
                      tickLine="xy"
                      gridAxis="xy"
                    />
                  </div>
                </Section>

                <Section title="Visit history">
                  <Stack gap="sm" component="ol" m={0} p={0} style={{ listStyle: "none" }}>
                    {record.visits.map((v) => (
                      <Paper component="li" key={v.date} p="sm" radius="md" bg="gray.0">
                        <Group justify="space-between" gap="xs" mb={2}>
                          <Text fw={700}>
                            {formatDate(v.date)} · {v.reason}
                          </Text>
                          <Text fz="sm" c="dimmed">
                            {getVet(v.vet)?.name} · ${v.invoice_usd.toFixed(2)}
                          </Text>
                        </Group>
                        <Text fz="sm">{v.notes}</Text>
                      </Paper>
                    ))}
                  </Stack>
                </Section>
              </>
            ) : (
              <Section title="Medical record">
                <Text c="dimmed">No weights, vaccinations or visit notes are on file for {patient.name} yet.</Text>
              </Section>
            )}
          </Stack>
        </Grid.Col>

        <Grid.Col span={{ base: 12, lg: 5 }}>
          <Stack gap="md">
            <Section title="Today" icon={<IconCalendarPlus size={22} aria-hidden />}>
              {todays.length === 0 ? (
                <Text c="dimmed" fz="sm">
                  No appointments today.
                </Text>
              ) : (
                <Stack gap="xs" component="ul" m={0} p={0} style={{ listStyle: "none" }}>
                  {todays.map((a) => (
                    <Group component="li" key={a.id} justify="space-between" wrap="nowrap" gap="xs">
                      <Text fz="sm">
                        <b>{a.start}</b> · {a.reason} · {getVet(a.vet)?.name}
                      </Text>
                      <Badge variant="light" color={a.status === "checked_in" ? "yellow" : "gray"} style={{ flexShrink: 0 }}>
                        {STATUS_LABEL[a.status]}
                      </Badge>
                    </Group>
                  ))}
                </Stack>
              )}
            </Section>

            {record && (
              <>
                <Section title="Vaccinations" icon={<IconVaccine size={22} aria-hidden />}>
                  {overdueCount > 0 && (
                    <Text fz="sm" fw={700} c="red.8" mb="xs">
                      {overdueCount} overdue as of {formatDate(TODAY)}
                    </Text>
                  )}
                  <Table.ScrollContainer minWidth={320}>
                    <Table verticalSpacing="xs">
                      <Table.Thead>
                        <Table.Tr>
                          <Table.Th>Vaccine</Table.Th>
                          <Table.Th>Given</Table.Th>
                          <Table.Th>Due</Table.Th>
                        </Table.Tr>
                      </Table.Thead>
                      <Table.Tbody>
                        {record.vaccinations.map((v) => {
                          const late = daysBetween(v.due, TODAY);
                          const overdue = late > 0;
                          return (
                            <Table.Tr key={v.name} bg={overdue ? "red.0" : undefined}>
                              <Table.Td fw={600}>{v.name}</Table.Td>
                              <Table.Td>{formatDate(v.given)}</Table.Td>
                              <Table.Td>
                                <Text fz="sm">{formatDate(v.due)}</Text>
                                {overdue ? (
                                  <Badge color="red.8" variant="filled" size="sm" leftSection={<IconAlertTriangleFilled size={11} aria-hidden />}>
                                    Overdue {late} days
                                  </Badge>
                                ) : (
                                  <Badge color="teal" variant="light" size="sm" leftSection={<IconCircleCheck size={11} aria-hidden />}>
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
                </Section>

                <Section title="Current medications" icon={<IconPill size={22} aria-hidden />}>
                  <List spacing="sm" listStyleType="none" styles={{ itemWrapper: { width: "100%" } }}>
                    {record.medications.map((m) => (
                      <List.Item key={m.name}>
                        <Text fw={700}>{m.name}</Text>
                        <Text fz="sm">
                          {m.dose} · since {formatDate(m.since)}
                        </Text>
                      </List.Item>
                    ))}
                  </List>
                </Section>
              </>
            )}
          </Stack>
        </Grid.Col>
      </Grid>

      <BookingModal opened={booking} onClose={() => setBooking(false)} defaultPatient={id} />
    </Container>
  );
}

function Fact({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Box>
      <Text fz="xs" c="dimmed" fw={700} tt="uppercase" style={{ letterSpacing: 0.5 }}>
        {label}
      </Text>
      <Box fw={600}>{value}</Box>
    </Box>
  );
}
