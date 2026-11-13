import type { Metadata } from "next";
import NextLink from "next/link";
import { notFound } from "next/navigation";
import { Badge, Box, Flex, Grid, Heading, HStack, Icon, Stack, Table, Text } from "@chakra-ui/react";
import { FiArrowLeft, FiPhone } from "react-icons/fi";
import { AppShell } from "@/components/app-shell";
import { AlertBanner } from "@/components/patient-alerts";
import { WeightChart } from "@/components/weight-chart";
import {
  STATUS_LABEL,
  TODAY,
  ageOf,
  fmtDate,
  fmtMoney,
  fmtRange,
  initialAppointments,
  ownerById,
  patientById,
  patients,
  records,
  vaccineState,
  vetById,
} from "@/lib/data";

export function generateStaticParams() {
  return patients.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const p = patientById(id);
  return { title: p ? `${p.name} · Pawpoint` : "Patient · Pawpoint" };
}

function Panel({
  title,
  id,
  children,
  aside,
}: {
  title: string;
  id: string;
  children: React.ReactNode;
  aside?: React.ReactNode;
}) {
  return (
    <Box as="section" aria-labelledby={id} bg="bg.panel" borderWidth="1px" borderColor="border" rounded="xl" p={{ base: "4", md: "5" }}>
      <Flex justify="space-between" align="center" gap="3" mb="3" wrap="wrap">
        <Heading as="h2" size="md" id={id}>
          {title}
        </Heading>
        {aside}
      </Flex>
      {children}
    </Box>
  );
}

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Box minW="0">
      <Text fontSize="xs" color="fg.muted" textTransform="uppercase" letterSpacing="0.06em" fontWeight="semibold">
        {label}
      </Text>
      <Text fontWeight="medium">{children}</Text>
    </Box>
  );
}

export default async function PatientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const patient = patientById(id);
  if (!patient) notFound();

  const owner = ownerById(patient.owner);
  const record = records[patient.id];
  const todays = initialAppointments.filter((a) => a.patient === patient.id && a.status !== "cancelled");

  const vaccinations = record?.vaccinations ?? [];
  const overdue = vaccinations.filter((v) => vaccineState(v.due).kind === "overdue");
  const extraAlerts = overdue.map((v) => `${v.name} vaccination overdue`);

  const weights = record?.weights_kg ?? [];
  const first = weights[0];
  const last = weights[weights.length - 1];
  const change = first && last ? last.kg - first.kg : 0;
  const changePct = first && last ? (change / first.kg) * 100 : 0;

  return (
    <AppShell>
      <Stack gap={{ base: "4", md: "5" }}>
        <NextLink href="/" style={{ width: "fit-content" }}>
          <HStack gap="1.5" color="fg.muted" _hover={{ color: "fg" }}>
            <Icon aria-hidden>
              <FiArrowLeft />
            </Icon>
            <Text fontSize="sm">Today’s schedule</Text>
          </HStack>
        </NextLink>

        <Flex justify="space-between" align="flex-end" gap="4" wrap="wrap">
          <Box>
            <Text fontSize="sm" color="fg.muted">
              Patient record · {patient.id.toUpperCase()}
            </Text>
            <Heading as="h1" size="3xl">
              {patient.name}
            </Heading>
            <Text color="fg.muted">
              {patient.breed} · {patient.species} · {patient.sex} · {ageOf(patient.born)}
            </Text>
          </Box>
          {todays.length > 0 && (
            <Box bg="bg.panel" borderWidth="1px" borderColor="border" rounded="lg" px="4" py="3" minW={{ md: "16rem" }}>
              <Text fontSize="xs" color="fg.muted" textTransform="uppercase" letterSpacing="0.06em" fontWeight="semibold">
                Today
              </Text>
              {todays.map((a) => (
                <Flex key={a.id} justify="space-between" gap="3" align="center" mt="1">
                  <Box>
                    <Text fontWeight="medium" fontSize="sm">
                      {a.reason}
                    </Text>
                    <Text fontSize="xs" color="fg.muted">
                      {fmtRange(a.start, a.minutes)} · {vetById(a.vet).short}
                    </Text>
                  </Box>
                  <Badge colorPalette={a.status === "booked" ? "blue" : a.status === "done" ? "green" : "orange"}>
                    {STATUS_LABEL[a.status]}
                  </Badge>
                </Flex>
              ))}
            </Box>
          )}
        </Flex>

        <AlertBanner alerts={patient.alerts} extra={extraAlerts} />

        <Grid templateColumns={{ base: "1fr", lg: "minmax(0,1.6fr) minmax(0,1fr)" }} gap={{ base: "4", md: "5" }} alignItems="start">
          <Stack gap={{ base: "4", md: "5" }} minW="0">
            {record ? (
              <>
                <Panel
                  id="weight-heading"
                  title="Weight trend"
                  aside={
                    <HStack gap="2">
                      <Text fontWeight="bold" fontSize="xl">
                        {last.kg} kg
                      </Text>
                      <Badge colorPalette="orange" size="md">
                        {change.toFixed(1)} kg ({changePct.toFixed(0)}%) since {fmtDate(first.date)}
                      </Badge>
                    </HStack>
                  }
                >
                  <WeightChart weights={weights} />
                </Panel>

                <Panel id="visits-heading" title="Visit history">
                  <Stack as="ol" gap="0" listStyleType="none" m="0" p="0">
                    {record.visits.map((v, i) => (
                      <Box
                        as="li"
                        key={v.date}
                        py="4"
                        borderTopWidth={i === 0 ? "0" : "1px"}
                        borderColor="border"
                        pt={i === 0 ? "0" : "4"}
                      >
                        <Flex justify="space-between" gap="3" wrap="wrap">
                          <Text fontWeight="semibold">
                            {v.reason}
                          </Text>
                          <Text fontSize="sm" color="fg.muted">
                            {fmtDate(v.date)} · {vetById(v.vet).name}
                          </Text>
                        </Flex>
                        <Text mt="1" fontSize="sm">
                          {v.notes}
                        </Text>
                        <Text mt="1" fontSize="xs" color="fg.muted">
                          Invoice {fmtMoney(v.invoice_usd)}
                        </Text>
                      </Box>
                    ))}
                  </Stack>
                </Panel>
              </>
            ) : (
              <Panel id="norecord-heading" title="Clinical record">
                <Text color="fg.muted">
                  No weights, vaccinations or visits are on file for {patient.name} in this view yet.
                </Text>
              </Panel>
            )}
          </Stack>

          <Stack gap={{ base: "4", md: "5" }} minW="0">
            <Panel id="owner-heading" title="Owner">
              <Stack gap="3">
                <Fact label="Name">{owner.name}</Fact>
                <Fact label="Phone">
                  <HStack asChild gap="1.5" display="inline-flex">
                    <a href={`tel:${owner.phone.replace(/\s/g, "")}`}>
                      <Icon aria-hidden boxSize="3.5">
                        <FiPhone />
                      </Icon>
                      {owner.phone}
                    </a>
                  </HStack>
                </Fact>
                <Fact label="Other pets">
                  {patients
                    .filter((p) => p.owner === owner.id && p.id !== patient.id)
                    .map((p) => p.name)
                    .join(", ") || "None on file"}
                </Fact>
              </Stack>
            </Panel>

            {record && (
              <>
                <Panel
                  id="vax-heading"
                  title="Vaccinations"
                  aside={
                    overdue.length > 0 ? (
                      <Badge colorPalette="red" variant="solid" size="md">
                        {overdue.length} overdue
                      </Badge>
                    ) : undefined
                  }
                >
                  <Table.ScrollArea>
                    <Table.Root size="sm" variant="line">
                      <Table.Header>
                        <Table.Row>
                          <Table.ColumnHeader>Vaccine</Table.ColumnHeader>
                          <Table.ColumnHeader>Given</Table.ColumnHeader>
                          <Table.ColumnHeader>Due</Table.ColumnHeader>
                          <Table.ColumnHeader>Status</Table.ColumnHeader>
                        </Table.Row>
                      </Table.Header>
                      <Table.Body>
                        {record.vaccinations.map((v) => {
                          const s = vaccineState(v.due);
                          return (
                            <Table.Row key={v.name} bg={s.kind === "overdue" ? "bg.error" : undefined}>
                              <Table.Cell fontWeight="semibold">{v.name}</Table.Cell>
                              <Table.Cell whiteSpace="nowrap">{fmtDate(v.given)}</Table.Cell>
                              <Table.Cell whiteSpace="nowrap">{fmtDate(v.due)}</Table.Cell>
                              <Table.Cell>
                                {s.kind === "overdue" ? (
                                  <Badge colorPalette="red" variant="solid" whiteSpace="nowrap">
                                    Overdue {s.days} days
                                  </Badge>
                                ) : s.kind === "soon" ? (
                                  <Badge colorPalette="orange" whiteSpace="nowrap">
                                    Due in {s.days} days
                                  </Badge>
                                ) : (
                                  <Badge colorPalette="green" whiteSpace="nowrap">
                                    Up to date
                                  </Badge>
                                )}
                              </Table.Cell>
                            </Table.Row>
                          );
                        })}
                      </Table.Body>
                    </Table.Root>
                  </Table.ScrollArea>
                  <Text mt="2" fontSize="xs" color="fg.muted">
                    Checked against today, {fmtDate(TODAY)}.
                  </Text>
                </Panel>

                <Panel id="meds-heading" title="Current medications">
                  <Stack as="ul" gap="3" listStyleType="none" m="0" p="0">
                    {record.medications.map((m) => (
                      <Box as="li" key={m.name}>
                        <Text fontWeight="semibold">{m.name}</Text>
                        <Text fontSize="sm">{m.dose}</Text>
                        <Text fontSize="xs" color="fg.muted">
                          Since {fmtDate(m.since)}
                        </Text>
                      </Box>
                    ))}
                  </Stack>
                </Panel>
              </>
            )}
          </Stack>
        </Grid>
      </Stack>
    </AppShell>
  );
}
