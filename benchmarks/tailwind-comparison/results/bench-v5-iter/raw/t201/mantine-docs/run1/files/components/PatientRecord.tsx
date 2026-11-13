"use client";

import Link from "next/link";
import {
  Alert,
  Anchor,
  Badge,
  Box,
  Divider,
  Grid,
  Group,
  List,
  Paper,
  Stack,
  Text,
  ThemeIcon,
  Timeline,
  Title,
} from "@mantine/core";
import { LineChart } from "@mantine/charts";
import {
  IconAlertTriangleFilled,
  IconArrowLeft,
  IconCalendarEvent,
  IconPaw,
  IconPhone,
  IconPill,
  IconStethoscope,
  IconShieldCheck,
  IconTrendingDown,
} from "@tabler/icons-react";
import {
  ageOf,
  fmtDate,
  fmtShort,
  getOwner,
  getVet,
  initialAppointments,
  records,
  type Patient,
  usd,
  vaccStatus,
  today,
  endTime,
  daysBetween,
} from "@/lib/data";
import { getPatient } from "@/lib/data";

function Section({ icon, title, children, id }: { icon: React.ReactNode; title: string; children: React.ReactNode; id: string }) {
  return (
    <Paper withBorder p={{ base: "md", sm: "lg" }} component="section" aria-labelledby={id}>
      <Group gap="xs" mb="md">
        <ThemeIcon variant="light" color="teal" size={32} radius="md">
          {icon}
        </ThemeIcon>
        <Title order={2} fz="lg" id={id}>
          {title}
        </Title>
      </Group>
      {children}
    </Paper>
  );
}

export function PatientRecord({ id }: { id: string }) {
  const patient = getPatient(id);
  if (!patient) {
    return (
      <Stack>
        <BackLink />
        <Title order={1}>Patient not found</Title>
        <Text c="gray.7">There is no patient with the id {id}. Use the search above to find the record.</Text>
      </Stack>
    );
  }
  const record = records[patient.id];
  return <Record patient={patient} record={record} />;
}

function BackLink() {
  return (
    <Anchor component={Link} href="/" fw={600} display="inline-flex" style={{ alignItems: "center", gap: 6, minHeight: 32 }}>
      <IconArrowLeft size={18} aria-hidden /> Today&apos;s schedule
    </Anchor>
  );
}

function Record({ patient, record }: { patient: Patient; record: (typeof records)[string] | undefined }) {
  const owner = getOwner(patient.owner);
  const todays = initialAppointments.filter((a) => a.patient === patient.id && a.status !== "cancelled");
  const overdue = record?.vaccinations.filter((v) => vaccStatus(v.due).kind === "overdue") ?? [];

  const weights = record?.weights_kg ?? [];
  const first = weights[0];
  const last = weights[weights.length - 1];
  const chartData = weights.map((w) => ({ date: fmtShort(w.date), "Weight (kg)": w.kg }));

  return (
    <Stack gap="md" maw={1200} mx="auto">
      <BackLink />

      {patient.alerts.length > 0 && (
        <Alert
          color="red.8"
          variant="filled"
          radius="md"
          icon={<IconAlertTriangleFilled size={28} aria-hidden />}
          title={
            <Text fw={800} fz="lg" tt="uppercase" lts={0.5}>
              Medical alerts
            </Text>
          }
          role="alert"
          styles={{ icon: { alignSelf: "flex-start" } }}
        >
          <List spacing={2} listStyleType="none" c="white" fz={{ base: "lg", sm: "xl" }} fw={700}>
            {patient.alerts.map((a) => (
              <List.Item key={a}>{a}</List.Item>
            ))}
          </List>
        </Alert>
      )}

      <Paper withBorder p={{ base: "md", sm: "lg" }}>
        <Group justify="space-between" align="flex-start" gap="md">
          <Group gap="md" wrap="nowrap" align="flex-start">
            <ThemeIcon size={64} radius="xl" color="teal" variant="light" visibleFrom="xs">
              <IconPaw size={36} aria-hidden />
            </ThemeIcon>
            <Box>
              <Title order={1} fz={{ base: 28, sm: 36 }} lh={1.1}>
                {patient.name}
              </Title>
              <Text c="gray.7" fz="lg">
                {patient.breed} · {patient.species}
              </Text>
              <Group gap="xs" mt={8}>
                {todays.map((a) => (
                  <Badge key={a.id} variant="light" color="teal" size="lg" leftSection={<IconCalendarEvent size={14} aria-hidden />}>
                    Today {a.start}–{endTime(a)}: {a.reason}
                  </Badge>
                ))}
              </Group>
            </Box>
          </Group>

          <Grid gap="md" style={{ flex: "1 1 340px", maxWidth: 560 }}>
            <Detail label="Age" value={`${ageOf(patient.born)} (born ${fmtDate(patient.born)})`} />
            <Detail label="Sex" value={patient.sex} />
            <Detail label="Owner" value={owner.name} />
            <Detail
              label="Phone"
              value={
                <Anchor href={`tel:${owner.phone.replace(/\s/g, "")}`} fw={600} display="inline-flex" style={{ alignItems: "center", gap: 4 }}>
                  <IconPhone size={16} aria-hidden /> {owner.phone}
                </Anchor>
              }
            />
          </Grid>
        </Group>
      </Paper>

      {!record ? (
        <Paper withBorder p="lg">
          <Text c="gray.7">No clinical history has been entered for {patient.name} yet.</Text>
        </Paper>
      ) : (
        <Grid gap="md">
          <Grid.Col span={{ base: 12, md: 7 }}>
            <Stack gap="md">
              <Section id="weight" title="Weight trend" icon={<IconTrendingDown size={20} aria-hidden />}>
                <Group gap="xl" mb="sm">
                  <Box>
                    <Text fz="xs" c="gray.7" tt="uppercase" fw={700}>
                      Latest
                    </Text>
                    <Text fz={28} fw={800} lh={1.1}>
                      {last.kg} kg
                    </Text>
                  </Box>
                  <Box>
                    <Text fz="xs" c="gray.7" tt="uppercase" fw={700}>
                      Since {fmtDate(first.date)}
                    </Text>
                    <Text fz={28} fw={800} lh={1.1} c="orange.8">
                      −{(first.kg - last.kg).toFixed(1)} kg
                      <Text span fz="md" fw={600}>
                        {" "}
                        ({(((first.kg - last.kg) / first.kg) * 100).toFixed(0)}%)
                      </Text>
                    </Text>
                  </Box>
                </Group>
                <LineChart
                  h={240}
                  data={chartData}
                  dataKey="date"
                  series={[{ name: "Weight (kg)", color: "teal.7" }]}
                  curveType="linear"
                  yAxisProps={{ domain: [27, 33] }}
                  unit=" kg"
                  withDots
                  gridAxis="xy"
                  tickLine="xy"
                  aria-label={`Weight in kilograms over ${weights.length} visits, from ${first.kg} on ${fmtDate(first.date)} to ${last.kg} on ${fmtDate(last.date)}`}
                />
              </Section>

              <Section id="visits" title="Visit history" icon={<IconStethoscope size={20} aria-hidden />}>
                <Timeline active={0} bulletSize={22} lineWidth={2} color="teal">
                  {record.visits.map((v) => (
                    <Timeline.Item
                      key={v.date}
                      title={
                        <Group gap="xs" justify="space-between" wrap="wrap">
                          <Text fw={700}>{v.reason}</Text>
                          <Text fz="sm" c="gray.7">
                            {fmtDate(v.date)}
                          </Text>
                        </Group>
                      }
                    >
                      <Text fz="sm" c="gray.7" mb={4}>
                        {getVet(v.vet).name} · Invoice {usd(v.invoice_usd)}
                      </Text>
                      <Text fz="md">{v.notes}</Text>
                    </Timeline.Item>
                  ))}
                </Timeline>
              </Section>
            </Stack>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 5 }}>
            <Stack gap="md">
              <Section id="vaccinations" title="Vaccinations" icon={<IconShieldCheck size={20} aria-hidden />}>
                {overdue.length > 0 && (
                  <Alert color="red" variant="light" mb="sm" icon={<IconAlertTriangleFilled size={18} aria-hidden />} title={`${overdue.length} overdue as of ${fmtDate(today)}`}>
                    {overdue.map((v) => v.name).join(" and ")} need a booster.
                  </Alert>
                )}
                <Stack gap="xs" component="ul" m={0} p={0} style={{ listStyle: "none" }}>
                  {record.vaccinations.map((v) => {
                    const s = vaccStatus(v.due);
                    const isOverdue = s.kind === "overdue";
                    return (
                      <Paper
                        key={v.name}
                        component="li"
                        p="sm"
                        withBorder
                        bg={isOverdue ? "red.0" : undefined}
                        style={isOverdue ? { borderColor: "var(--mantine-color-red-7)", borderWidth: 2 } : undefined}
                      >
                        <Group justify="space-between" wrap="wrap" gap="xs">
                          <Box>
                            <Text fw={700}>{v.name}</Text>
                            <Text fz="sm" c="gray.7">
                              Given {fmtDate(v.given)}
                            </Text>
                            <Text fz="sm" fw={isOverdue ? 700 : 400} c={isOverdue ? "red.8" : undefined}>
                              Due {fmtDate(v.due)}
                            </Text>
                          </Box>
                          {isOverdue ? (
                            <Badge color="red.8" variant="filled" size="lg" leftSection={<IconAlertTriangleFilled size={12} aria-hidden />}>
                              Overdue {s.days} days
                            </Badge>
                          ) : s.kind === "soon" ? (
                            <Badge color="yellow.8" variant="light" size="lg">
                              Due in {s.days} days
                            </Badge>
                          ) : (
                            <Badge color="teal" variant="light" size="lg">
                              Up to date
                            </Badge>
                          )}
                        </Group>
                      </Paper>
                    );
                  })}
                </Stack>
              </Section>

              <Section id="meds" title="Current medications" icon={<IconPill size={20} aria-hidden />}>
                <Stack gap="sm" component="ul" m={0} p={0} style={{ listStyle: "none" }}>
                  {record.medications.map((m, i) => (
                    <li key={m.name}>
                      {i > 0 && <Divider mb="sm" />}
                      <Text fw={700}>{m.name}</Text>
                      <Text>{m.dose}</Text>
                      <Text fz="sm" c="gray.7">
                        Since {fmtDate(m.since)} · {Math.round(daysBetween(m.since, today) / 30)} months
                      </Text>
                    </li>
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

function Detail({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Grid.Col span={{ base: 12, xs: 6 }}>
      <Text fz="xs" c="gray.7" tt="uppercase" fw={700}>
        {label}
      </Text>
      <Text fw={600} component="div">
        {value}
      </Text>
    </Grid.Col>
  );
}
