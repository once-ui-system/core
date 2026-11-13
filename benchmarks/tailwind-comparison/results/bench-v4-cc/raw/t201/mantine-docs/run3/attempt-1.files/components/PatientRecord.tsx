"use client";

import Link from "next/link";
import { LineChart } from "@mantine/charts";
import { Anchor, Badge, Box, Group, Paper, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import {
  IconArrowLeft,
  IconHistory,
  IconPhone,
  IconPill,
  IconScale,
  IconStethoscope,
  IconVaccine,
} from "@tabler/icons-react";
import { PatientAlertBanner, PatientAlerts } from "@/components/PatientAlerts";
import {
  TODAY,
  ageText,
  daysBetween,
  endTime,
  formatDate,
  initialAppointments,
  overdueVaccineCount,
  ownerById,
  patients,
  records,
  usd,
  vaccineState,
  vetById,
  type Patient,
} from "@/lib/data";

function SectionTitle({ icon, children, id }: { icon: React.ReactNode; children: React.ReactNode; id: string }) {
  return (
    <Group gap="xs" mb="sm">
      {icon}
      <Title order={2} size="h4" id={id}>
        {children}
      </Title>
    </Group>
  );
}

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Box>
      <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
        {label}
      </Text>
      <Text fw={600}>{children}</Text>
    </Box>
  );
}

const shortMonth = (iso: string) => formatDate(iso, { day: undefined, month: "short", year: "2-digit" }).replace(" ", " '");

export function PatientRecord({ patient }: { patient: Patient }) {
  const owner = ownerById(patient.owner);
  const rec = records[patient.id];
  const otherPets = patients.filter((p) => p.owner === owner.id && p.id !== patient.id);
  const overdue = overdueVaccineCount(patient.id);
  const todays = initialAppointments.filter((a) => a.patient === patient.id && a.status !== "cancelled");

  const weights = rec?.weights_kg ?? [];
  const first = weights[0];
  const last = weights[weights.length - 1];
  const prev = weights[weights.length - 2];
  const chartData = weights.map((w) => ({ date: shortMonth(w.date), kg: w.kg }));

  return (
    <Stack gap="lg">
      <Anchor component={Link} href="/" size="md" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
        <IconArrowLeft size={18} aria-hidden="true" /> Today&apos;s schedule
      </Anchor>

      <Group justify="space-between" align="flex-start" wrap="wrap">
        <Box>
          <Title order={1} size="h1">
            {patient.name}
          </Title>
          <Text c="dimmed" size="lg">
            {patient.species} · {patient.breed} · {ageText(patient.born)} old
          </Text>
        </Box>
        {overdue > 0 ? (
          <Badge color="orange" size="xl" variant="filled" tt="none">
            {overdue} vaccinations overdue
          </Badge>
        ) : null}
      </Group>

      <PatientAlertBanner name={patient.name} alerts={patient.alerts} />

      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
        <Paper withBorder p="md" radius="md" component="section" aria-label="Patient details">
          <Title order={2} size="h4" mb="sm">
            Patient
          </Title>
          <SimpleGrid cols={2} spacing="sm">
            <Fact label="Species">{patient.species}</Fact>
            <Fact label="Breed">{patient.breed}</Fact>
            <Fact label="Born">
              {formatDate(patient.born)} ({ageText(patient.born)})
            </Fact>
            <Fact label="Sex">{patient.sex}</Fact>
            <Fact label="Patient ID">{patient.id}</Fact>
          </SimpleGrid>
        </Paper>
        <Paper withBorder p="md" radius="md" component="section" aria-label="Owner details">
          <Title order={2} size="h4" mb="sm">
            Owner
          </Title>
          <SimpleGrid cols={2} spacing="sm">
            <Fact label="Name">{owner.name}</Fact>
            <Fact label="Phone">
              <Anchor href={`tel:${owner.phone.replace(/\s/g, "")}`} style={{ display: "inline-flex", gap: 4, alignItems: "center" }}>
                <IconPhone size={16} aria-hidden="true" /> {owner.phone}
              </Anchor>
            </Fact>
          </SimpleGrid>
          {otherPets.length > 0 ? (
            <Box mt="sm">
              <Text size="xs" c="dimmed" tt="uppercase" fw={700} mb={4}>
                Other pets
              </Text>
              <Stack gap={4}>
                {otherPets.map((p) => (
                  <Group key={p.id} gap="xs">
                    <Anchor component={Link} href={`/patients/${p.id}`} fw={600}>
                      {p.name}
                    </Anchor>
                    <Text size="sm" c="dimmed">
                      {p.species}
                    </Text>
                    <PatientAlerts alerts={p.alerts} size="sm" />
                  </Group>
                ))}
              </Stack>
            </Box>
          ) : null}
        </Paper>
      </SimpleGrid>

      {todays.length > 0 ? (
        <Paper withBorder p="md" radius="md" component="section" aria-labelledby="today-h">
          <SectionTitle id="today-h" icon={<IconStethoscope size={22} aria-hidden="true" />}>
            Today, {formatDate(TODAY, { weekday: "long", month: "long" })}
          </SectionTitle>
          <Stack gap="xs" component="ul" style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {todays.map((a) => (
              <Group key={a.id} component="li" gap="sm">
                <Text fw={800} w={110}>
                  {a.start} to {endTime(a)}
                </Text>
                <Text>
                  {a.reason} · {vetById(a.vet).name}, {vetById(a.vet).room}
                </Text>
                <Badge variant="light" color={a.status === "done" ? "teal" : "gray"}>
                  {a.status.replace("_", " ")}
                </Badge>
              </Group>
            ))}
          </Stack>
        </Paper>
      ) : null}

      {!rec ? (
        <Paper withBorder p="lg" radius="md">
          <Text c="dimmed">No clinical record has been imported for {patient.name} yet.</Text>
        </Paper>
      ) : (
        <>
          <Paper withBorder p="md" radius="md" component="section" aria-labelledby="weight-h">
            <SectionTitle id="weight-h" icon={<IconScale size={22} aria-hidden="true" />}>
              Weight trend
            </SectionTitle>
            <Group gap="xl" mb="md">
              <Fact label="Now">{last.kg} kg</Fact>
              <Fact label="Last visit change">{(last.kg - prev.kg).toFixed(1)} kg</Fact>
              <Fact label={`Since ${formatDate(first.date, { day: undefined })}`}>
                {(last.kg - first.kg).toFixed(1)} kg ({(((last.kg - first.kg) / first.kg) * 100).toFixed(0)}%)
              </Fact>
            </Group>
            <Box role="img" aria-label={`Weight over ${weights.length} visits: ${weights.map((w) => `${formatDate(w.date)} ${w.kg} kilograms`).join(", ")}`}>
              <LineChart
                h={260}
                data={chartData}
                dataKey="date"
                series={[{ name: "kg", label: "Weight (kg)", color: "teal.6" }]}
                curveType="linear"
                yAxisProps={{ domain: [27, 33] }}
                unit=" kg"
                withLegend={false}
              />
            </Box>
          </Paper>

          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
            <Paper withBorder p="md" radius="md" component="section" aria-labelledby="vax-h">
              <SectionTitle id="vax-h" icon={<IconVaccine size={22} aria-hidden="true" />}>
                Vaccinations
              </SectionTitle>
              <Stack gap="xs" component="ul" style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {rec.vaccinations.map((v) => {
                  const s = vaccineState(v.due);
                  const isOver = s.state === "overdue";
                  return (
                    <Paper
                      key={v.name}
                      component="li"
                      p="sm"
                      radius="md"
                      withBorder
                      style={{
                        borderColor: isOver ? "var(--mantine-color-red-6)" : undefined,
                        borderWidth: isOver ? 2 : 1,
                        background: isOver ? "light-dark(var(--mantine-color-red-0), var(--mantine-color-dark-6))" : undefined,
                      }}
                    >
                      <Group justify="space-between" wrap="nowrap" align="flex-start">
                        <Box>
                          <Text fw={700}>{v.name}</Text>
                          <Text size="sm" c="dimmed">
                            Given {formatDate(v.given)} · due {formatDate(v.due)}
                          </Text>
                        </Box>
                        {isOver ? (
                          <Badge color="red" variant="filled" size="lg" tt="none">
                            Overdue {s.days} days
                          </Badge>
                        ) : s.state === "soon" ? (
                          <Badge color="orange" variant="light" size="lg" tt="none">
                            Due in {s.days} days
                          </Badge>
                        ) : (
                          <Badge color="teal" variant="light" size="lg" tt="none">
                            Up to date · {Math.round(daysBetween(TODAY, v.due) / 30)} mo left
                          </Badge>
                        )}
                      </Group>
                    </Paper>
                  );
                })}
              </Stack>
            </Paper>

            <Paper withBorder p="md" radius="md" component="section" aria-labelledby="med-h">
              <SectionTitle id="med-h" icon={<IconPill size={22} aria-hidden="true" />}>
                Current medications
              </SectionTitle>
              <Stack gap="xs" component="ul" style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {rec.medications.map((m) => (
                  <Paper key={m.name} component="li" p="sm" radius="md" withBorder>
                    <Text fw={700}>{m.name}</Text>
                    <Text size="sm">{m.dose}</Text>
                    <Text size="xs" c="dimmed">
                      Since {formatDate(m.since)}
                    </Text>
                  </Paper>
                ))}
              </Stack>
            </Paper>
          </SimpleGrid>

          <Paper withBorder p="md" radius="md" component="section" aria-labelledby="visits-h">
            <SectionTitle id="visits-h" icon={<IconHistory size={22} aria-hidden="true" />}>
              Visit history
            </SectionTitle>
            <Stack gap="sm" component="ol" style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {rec.visits.map((v) => (
                <Paper key={v.date} component="li" p="sm" radius="md" withBorder>
                  <Group justify="space-between" align="flex-start" wrap="wrap" gap="xs">
                    <Box>
                      <Text fw={700}>
                        {formatDate(v.date)} · {v.reason}
                      </Text>
                      <Text size="sm" c="dimmed">
                        {vetById(v.vet).name}
                      </Text>
                    </Box>
                    <Text size="sm" fw={600}>
                      {usd(v.invoice_usd)}
                    </Text>
                  </Group>
                  <Text mt={6}>{v.notes}</Text>
                </Paper>
              ))}
            </Stack>
          </Paper>
        </>
      )}
    </Stack>
  );
}
