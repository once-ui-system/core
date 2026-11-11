"use client";

import Link from "next/link";
import {
  Alert,
  Avatar,
  Badge,
  Button,
  Grid,
  Group,
  List,
  Paper,
  Stack,
  Table,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import {
  IconAlertTriangleFilled,
  IconArrowLeft,
  IconCalendarEvent,
  IconPhone,
  IconPill,
  IconShieldCheck,
} from "@tabler/icons-react";
import {
  TODAY,
  getOwner,
  getVet,
  initialAppointments,
  records,
  type Patient,
} from "@/lib/data";
import { ageString, daysBetween, endOf, fmtDate, statusColor, statusLabel } from "@/lib/utils";
import { WeightChart } from "./WeightChart";

const SOON_DAYS = 60;

function vaccineState(due: string): { color: string; label: string; days: number } {
  const days = daysBetween(TODAY, due);
  if (days < 0) return { color: "red.7", label: `Overdue by ${-days} days`, days };
  if (days <= SOON_DAYS) return { color: "yellow", label: `Due in ${days} days`, days };
  return { color: "teal", label: "Up to date", days };
}

function Section({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <Paper withBorder p={{ base: "md", sm: "lg" }} component="section">
      <Group gap="xs" mb="md">
        {icon}
        <Title order={2} size="h4">
          {title}
        </Title>
      </Group>
      {children}
    </Paper>
  );
}

export function PatientRecord({ patient }: { patient: Patient }) {
  const owner = getOwner(patient.owner);
  const record = records[patient.id];
  const todays = initialAppointments.filter((a) => a.patient === patient.id);
  const overdue = record ? record.vaccinations.filter((v) => daysBetween(TODAY, v.due) < 0) : [];
  const weights = record?.weights_kg ?? [];
  const first = weights[0];
  const last = weights[weights.length - 1];
  const change = first && last ? last.kg - first.kg : 0;
  const pct = first && last ? (change / first.kg) * 100 : 0;

  return (
    <Stack gap="lg">
      <Button
        component={Link}
        href="/"
        variant="subtle"
        color="gray"
        leftSection={<IconArrowLeft size={18} aria-hidden />}
        w="fit-content"
        h={44}
      >
        Back to today&apos;s schedule
      </Button>

      <Paper withBorder p={{ base: "md", sm: "lg" }}>
        <Group align="flex-start" wrap="nowrap" gap="md">
          <Avatar size={64} radius="md" color="teal" aria-hidden>
            {patient.name.slice(0, 1)}
          </Avatar>
          <div style={{ minWidth: 0, flex: 1 }}>
            <Group gap="sm" align="center">
              <Title order={1} size="h2">
                {patient.name}
              </Title>
              <Badge variant="light" color="gray" size="lg">
                {patient.species}
              </Badge>
              {overdue.length > 0 && (
                <Badge color="red.7" variant="filled" size="lg">
                  {overdue.length} {overdue.length === 1 ? "vaccination" : "vaccinations"} overdue
                </Badge>
              )}
            </Group>
            <Text c="dimmed">
              {patient.breed} · {ageString(patient.born, TODAY)} · {patient.sex}
            </Text>
          </div>
        </Group>

        <Grid mt="lg" gap="md">
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Text size="xs" tt="uppercase" fw={700} c="dimmed">
              Patient
            </Text>
            <Text>Born {fmtDate(patient.born)}</Text>
            <Text c="dimmed" size="sm">
              Record {patient.id}
            </Text>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Text size="xs" tt="uppercase" fw={700} c="dimmed">
              Owner
            </Text>
            <Text fw={600}>{owner?.name}</Text>
            {owner && (
              <Button
                component="a"
                href={`tel:${owner.phone.replace(/\s/g, "")}`}
                variant="light"
                size="md"
                h={44}
                mt={4}
                leftSection={<IconPhone size={18} aria-hidden />}
              >
                {owner.phone}
              </Button>
            )}
          </Grid.Col>
        </Grid>
      </Paper>

      {patient.alerts.length > 0 && (
        <Alert
          color="red.7"
          variant="filled"
          radius="md"
          icon={<IconAlertTriangleFilled size={28} aria-hidden />}
          title="Medical alerts"
          role="region"
          aria-label="Medical alerts"
          styles={{ title: { fontSize: "var(--mantine-font-size-lg)" } }}
        >
          <List spacing={2} size="lg" fw={650} styles={{ item: { color: "white" } }}>
            {patient.alerts.map((a) => (
              <List.Item key={a}>{a}</List.Item>
            ))}
          </List>
        </Alert>
      )}

      {todays.length > 0 && (
        <Section title="Today" icon={<IconCalendarEvent size={22} aria-hidden />}>
          <Stack gap="xs">
            {todays.map((a) => (
              <Group key={a.id} justify="space-between" wrap="wrap" gap="xs">
                <Text>
                  <Text span fw={700}>
                    {a.start} to {endOf(a)}
                  </Text>{" "}
                  · {a.reason} · {getVet(a.vet)?.name}, {getVet(a.vet)?.room}
                </Text>
                <Badge color={statusColor[a.status]} variant="light" size="lg">
                  {statusLabel[a.status]}
                </Badge>
              </Group>
            ))}
          </Stack>
        </Section>
      )}

      {!record && (
        <Paper withBorder p="lg">
          <Text c="dimmed">
            No weights, vaccinations, medications or visit notes are loaded for {patient.name} in this workspace.
          </Text>
        </Paper>
      )}

      {record && (
        <Grid gap="lg">
          <Grid.Col span={{ base: 12, lg: 7 }}>
            <Stack gap="lg">
              <Section title="Weight trend">
                <Text size="sm" mb="sm">
                  <Text span fw={700}>
                    {last?.kg} kg
                  </Text>{" "}
                  at the last visit. {change < 0 ? "Down" : "Up"} {Math.abs(change).toFixed(1)} kg (
                  {Math.abs(pct).toFixed(0)}%) since {fmtDate(first.date, { day: undefined })}.
                </Text>
                <WeightChart weights={weights} name={patient.name} />
              </Section>

              <Section title="Visit history">
                <Stack gap="sm" component="ol" p={0} m={0} style={{ listStyle: "none" }}>
                  {record.visits.map((v) => (
                    <Paper component="li" key={v.date} withBorder p="md">
                      <Group justify="space-between" gap="xs" wrap="wrap">
                        <Group gap="xs">
                          <Text fw={700}>{fmtDate(v.date)}</Text>
                          {v.date === TODAY && (
                            <Badge size="sm" color="teal" variant="light">
                              Today
                            </Badge>
                          )}
                        </Group>
                        <Text size="sm" c="dimmed">
                          {getVet(v.vet)?.name} · ${v.invoice_usd.toFixed(2)}
                        </Text>
                      </Group>
                      <Text fw={600} size="sm" mt={2}>
                        {v.reason}
                      </Text>
                      <Text size="sm" mt={4}>
                        {v.notes}
                      </Text>
                    </Paper>
                  ))}
                </Stack>
              </Section>
            </Stack>
          </Grid.Col>

          <Grid.Col span={{ base: 12, lg: 5 }}>
            <Stack gap="lg">
              <Section title="Vaccinations" icon={<IconShieldCheck size={22} aria-hidden />}>
                <Table.ScrollContainer minWidth={380}>
                  <Table verticalSpacing="sm" aria-label="Vaccinations">
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
                        const s = vaccineState(v.due);
                        return (
                          <Table.Tr key={v.name} bg={s.days < 0 ? "var(--mantine-color-red-light)" : undefined}>
                            <Table.Td fw={650}>{v.name}</Table.Td>
                            <Table.Td>{fmtDate(v.given, { day: undefined })}</Table.Td>
                            <Table.Td>{fmtDate(v.due)}</Table.Td>
                            <Table.Td>
                              <Badge color={s.color} variant={s.days < 0 ? "filled" : "light"} tt="none">
                                {s.label}
                              </Badge>
                            </Table.Td>
                          </Table.Tr>
                        );
                      })}
                    </Table.Tbody>
                  </Table>
                </Table.ScrollContainer>
              </Section>

              <Section title="Current medications" icon={<IconPill size={22} aria-hidden />}>
                <Stack gap="sm" component="ul" p={0} m={0} style={{ listStyle: "none" }}>
                  {record.medications.map((m) => (
                    <Group key={m.name} component="li" wrap="nowrap" align="flex-start" gap="sm">
                      <ThemeIcon variant="light" color="teal" size="lg" aria-hidden>
                        <IconPill size={18} />
                      </ThemeIcon>
                      <div>
                        <Text fw={650}>{m.name}</Text>
                        <Text size="sm">{m.dose}</Text>
                        <Text size="xs" c="dimmed">
                          Since {fmtDate(m.since)}
                        </Text>
                      </div>
                    </Group>
                  ))}
                </Stack>
              </Section>
            </Stack>
          </Grid.Col>
        </Grid>
      )}
    </Stack>
  );
}
