"use client";

import { useState, type ReactNode } from "react";
import NextLink from "next/link";
import { Badge, Box, Button, Flex, Grid, Heading, HStack, Link as ChakraLink, Stack, Text, VisuallyHidden } from "@chakra-ui/react";
import { Chart, useChart } from "@chakra-ui/charts";
import { CartesianGrid, Line, LineChart, Tooltip, XAxis, YAxis } from "recharts";
import { LuArrowLeft, LuPhone, LuPlus } from "react-icons/lu";
import { Avatar } from "@/components/ui/avatar";
import { AlertIcon, AlertPills, StatusBadge } from "@/components/alerts";
import { BookingDialog } from "@/components/booking-dialog";
import { useDesk } from "@/components/desk-provider";
import {
  TODAY,
  ageText,
  fmtClock,
  fmtDate,
  fmtMonth,
  fmtUsd,
  getOwner,
  getPatient,
  getVet,
  records,
  toMinutes,
  vaccinationState,
  type WeightEntry,
} from "@/lib/data";

function Card({ id, title, aside, area, children }: { id: string; title: string; aside?: ReactNode; area?: string; children: ReactNode }) {
  return (
    <Box as="section" aria-labelledby={id} gridArea={area} bg="bg.panel" borderWidth="1px" rounded="xl" p={{ base: "4", md: "5" }} minW="0">
      <Flex justify="space-between" align="center" gap="3" wrap="wrap" mb="3">
        <Heading as="h2" id={id} size="lg">
          {title}
        </Heading>
        {aside}
      </Flex>
      {children}
    </Box>
  );
}

function WeightChart({ weights }: { weights: WeightEntry[] }) {
  const chart = useChart({
    data: weights.map((w) => ({ label: fmtMonth(w.date), kg: w.kg })),
    series: [{ name: "kg", color: "teal.solid" }],
  });

  return (
    <Chart.Root maxH="300px" aspectRatio={{ base: "4 / 3", md: "16 / 9" }} chart={chart}>
      <LineChart data={chart.data} responsive margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
        <CartesianGrid stroke={chart.color("border")} vertical={false} />
        <XAxis axisLine={false} dataKey={chart.key("label")} stroke={chart.color("border")} />
        <YAxis
          axisLine={false}
          tickLine={false}
          tickMargin={8}
          width={36}
          stroke={chart.color("border")}
          domain={[(min: number) => Math.floor(min - 1), (max: number) => Math.ceil(max + 1)]}
        />
        <Tooltip animationDuration={100} cursor={false} content={<Chart.Tooltip />} />
        {chart.series.map((item) => (
          <Line
            key={item.name}
            isAnimationActive={false}
            dataKey={chart.key(item.name)}
            stroke={chart.color(item.color)}
            strokeWidth={3}
            dot={{ r: 4, strokeWidth: 2 }}
          />
        ))}
      </LineChart>
    </Chart.Root>
  );
}

export function PatientRecord({ patientId }: { patientId: string }) {
  const patient = getPatient(patientId);
  const owner = getOwner(patient.owner);
  const record = records[patientId];
  const { appointments, checkIn } = useDesk();
  const [bookOpen, setBookOpen] = useState(false);

  const todays = appointments
    .filter((a) => a.patient === patientId)
    .sort((a, b) => toMinutes(a.start) - toMinutes(b.start));

  const rank = { overdue: 0, soon: 1, ok: 2 } as const;
  const vaccinations = (record?.vaccinations ?? [])
    .map((v) => ({ ...v, state: vaccinationState(v.due) }))
    .sort((a, b) => rank[a.state.kind] - rank[b.state.kind]);
  const overdue = vaccinations.filter((v) => v.state.kind === "overdue");

  const weights = record?.weights_kg ?? [];
  const first = weights[0];
  const last = weights[weights.length - 1];
  const diff = first && last ? last.kg - first.kg : 0;
  const pct = first && last ? (diff / first.kg) * 100 : 0;

  return (
    <Stack gap={{ base: "4", md: "5" }}>
      <Box>
        <ChakraLink asChild variant="plain" color="fg.muted" _hover={{ color: "fg" }}>
          <NextLink href="/">
            <LuArrowLeft aria-hidden="true" /> Today&rsquo;s schedule
          </NextLink>
        </ChakraLink>
      </Box>

      <Box bg="bg.panel" borderWidth="1px" rounded="xl" p={{ base: "4", md: "6" }}>
        <Flex direction={{ base: "column", md: "row" }} justify="space-between" gap="5">
          <HStack gap="4" align="flex-start">
            <Avatar name={patient.name} size="xl" colorPalette="teal" />
            <Box>
              <Heading as="h1" size="3xl">
                {patient.name}
              </Heading>
              <Text color="fg.muted">
                {patient.species} &middot; {patient.breed}
              </Text>
              <Text fontSize="sm" color="fg.muted">
                Patient {patient.id}
              </Text>
            </Box>
          </HStack>
          <Button colorPalette="teal" size="xl" alignSelf={{ base: "stretch", md: "flex-start" }} onClick={() => setBookOpen(true)}>
            <LuPlus /> Book follow-up
          </Button>
        </Flex>

        <Grid as="dl" templateColumns="repeat(auto-fit, minmax(170px, 1fr))" gap="4" mt="5" pt="5" borderTopWidth="1px">
          {[
            ["Sex", patient.sex],
            ["Born", `${fmtDate(patient.born)} (${ageText(patient.born)})`],
            ["Owner", owner.name],
          ].map(([label, value]) => (
            <Box key={label}>
              <Text as="dt" fontSize="sm" color="fg.muted">
                {label}
              </Text>
              <Text as="dd" fontWeight="medium">
                {value}
              </Text>
            </Box>
          ))}
          <Box>
            <Text as="dt" fontSize="sm" color="fg.muted">
              Owner phone
            </Text>
            <Text as="dd" fontWeight="medium">
              <ChakraLink href={`tel:${owner.phone.replace(/\s/g, "")}`}>
                <LuPhone aria-hidden="true" /> {owner.phone}
              </ChakraLink>
            </Text>
          </Box>
        </Grid>
      </Box>

      {patient.alerts.length > 0 ? (
        <Box role="region" aria-label="Medical alerts" bg="red.subtle" borderWidth="3px" borderColor="red.solid" rounded="xl" p={{ base: "4", md: "5" }}>
          <HStack gap="2" color="red.fg" mb="3">
            <AlertIcon size={26} />
            <Heading as="h2" size="xl">
              Medical alerts
            </Heading>
          </HStack>
          <AlertPills alerts={patient.alerts} large />
        </Box>
      ) : (
        <Text color="fg.muted">No medical alerts on file.</Text>
      )}

      {overdue.length > 0 && (
        <Box role="region" aria-label="Overdue vaccinations" bg="orange.subtle" borderWidth="2px" borderColor="orange.solid" rounded="xl" p="4">
          <Text fontWeight="semibold" color="orange.fg">
            {overdue.length} vaccination{overdue.length > 1 ? "s" : ""} overdue: {overdue.map((v) => v.name).join(", ")}.{" "}
            <ChakraLink href="#vaccinations-title" color="orange.fg" textDecoration="underline">
              See vaccinations
            </ChakraLink>
          </Text>
        </Box>
      )}

      {todays.length > 0 && (
        <Card id="today-title" title="Today at the clinic">
          <Stack as="ul" listStyleType="none" m="0" p="0" gap="2">
            {todays.map((a) => (
              <Flex as="li" key={a.id} justify="space-between" align="center" gap="3" wrap="wrap" borderWidth="1px" rounded="lg" p="3">
                <Box>
                  <Text fontWeight="semibold">
                    {fmtClock(toMinutes(a.start))} &middot; {a.reason}
                  </Text>
                  <Text fontSize="sm" color="fg.muted">
                    {getVet(a.vet).name} &middot; {getVet(a.vet).room}
                  </Text>
                </Box>
                <HStack gap="3">
                  <StatusBadge status={a.status} />
                  {a.status === "booked" && (
                    <Button colorPalette="teal" size="md" onClick={() => checkIn(a.id)} aria-label={`Check in ${patient.name} for ${a.reason}`}>
                      Check in
                    </Button>
                  )}
                </HStack>
              </Flex>
            ))}
          </Stack>
        </Card>
      )}

      <Grid
        gap={{ base: "4", md: "5" }}
        templateColumns={{ base: "minmax(0,1fr)", lg: "minmax(0,1.25fr) minmax(0,1fr)" }}
        templateAreas={{
          base: '"weight" "vacc" "meds" "visits"',
          lg: '"weight vacc" "weight meds" "visits visits"',
        }}
        alignItems="start"
      >
        <Card
          id="weight-title"
          title="Weight trend"
          area="weight"
          aside={
            last && first ? (
              <Box textAlign="right">
                <Text fontSize="2xl" fontWeight="bold" lineHeight="1">
                  {last.kg.toFixed(1)} kg
                </Text>
                <Text fontSize="sm" color="fg.muted">
                  {diff < 0 ? "Down" : "Up"} {Math.abs(diff).toFixed(1)} kg ({Math.abs(pct).toFixed(0)}%) since {fmtDate(first.date)}
                </Text>
              </Box>
            ) : undefined
          }
        >
          {weights.length >= 2 ? (
            <>
              <Box
                role="img"
                aria-label={`Line chart of ${patient.name}'s weight over ${weights.length} visits, from ${first.kg} kg on ${fmtDate(first.date)} to ${last.kg} kg on ${fmtDate(last.date)}.`}
              >
                <WeightChart weights={weights} />
              </Box>
              <VisuallyHidden>
                <table>
                  <caption>Weight at each visit</caption>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Weight (kg)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {weights.map((w) => (
                      <tr key={w.date}>
                        <td>{fmtDate(w.date)}</td>
                        <td>{w.kg}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </VisuallyHidden>
            </>
          ) : (
            <Text color="fg.muted">Not enough weights recorded to draw a trend.</Text>
          )}
        </Card>

        <Card
          id="vaccinations-title"
          title="Vaccinations"
          area="vacc"
          aside={
            overdue.length > 0 ? (
              <Badge colorPalette="red" variant="solid" size="lg">
                {overdue.length} overdue
              </Badge>
            ) : undefined
          }
        >
          {vaccinations.length === 0 ? (
            <Text color="fg.muted">No vaccinations on file.</Text>
          ) : (
            <Stack as="ul" listStyleType="none" m="0" p="0" gap="2">
              {vaccinations.map((v) => {
                const isOverdue = v.state.kind === "overdue";
                return (
                  <Flex
                    as="li"
                    key={v.name}
                    justify="space-between"
                    align="center"
                    gap="3"
                    wrap="wrap"
                    rounded="lg"
                    p="3"
                    borderWidth="1px"
                    borderLeftWidth="6px"
                    borderColor={isOverdue ? "red.solid" : "border"}
                    bg={isOverdue ? "red.subtle" : undefined}
                  >
                    <Box>
                      <Text fontWeight="semibold">{v.name}</Text>
                      <Text fontSize="sm" color="fg.muted">
                        Given {fmtDate(v.given)} &middot; due {fmtDate(v.due)}
                      </Text>
                    </Box>
                    {v.state.kind === "overdue" && (
                      <Badge colorPalette="red" variant="solid" size="md">
                        Overdue {v.state.days} days
                      </Badge>
                    )}
                    {v.state.kind === "soon" && (
                      <Badge colorPalette="orange" variant="subtle" size="md">
                        Due in {v.state.days} days
                      </Badge>
                    )}
                    {v.state.kind === "ok" && (
                      <Badge colorPalette="green" variant="subtle" size="md">
                        Up to date
                      </Badge>
                    )}
                  </Flex>
                );
              })}
            </Stack>
          )}
          <Text fontSize="xs" color="fg.muted" mt="3">
            Checked against today, {fmtDate(TODAY)}.
          </Text>
        </Card>

        <Card id="meds-title" title="Current medications" area="meds">
          {!record || record.medications.length === 0 ? (
            <Text color="fg.muted">No current medications.</Text>
          ) : (
            <Stack as="ul" listStyleType="none" m="0" p="0" gap="2">
              {record.medications.map((m) => (
                <Box as="li" key={m.name} borderWidth="1px" rounded="lg" p="3">
                  <Text fontWeight="semibold">{m.name}</Text>
                  <Text fontSize="sm">{m.dose}</Text>
                  <Text fontSize="sm" color="fg.muted">
                    Since {fmtDate(m.since)}
                  </Text>
                </Box>
              ))}
            </Stack>
          )}
        </Card>

        <Card id="visits-title" title="Visit history" area="visits">
          {!record || record.visits.length === 0 ? (
            <Text color="fg.muted">No past visits on file.</Text>
          ) : (
            <Stack as="ol" listStyleType="none" m="0" p="0" gap="3">
              {record.visits.map((v) => (
                <Box as="li" key={v.date} borderWidth="1px" rounded="lg" p="4">
                  <Flex justify="space-between" align="flex-start" gap="3" wrap="wrap">
                    <Box>
                      <HStack gap="2" wrap="wrap">
                        <Text fontWeight="bold">{fmtDate(v.date)}</Text>
                        {v.date === TODAY && (
                          <Badge colorPalette="teal" size="md">
                            Today
                          </Badge>
                        )}
                      </HStack>
                      <Text fontWeight="medium">{v.reason}</Text>
                      <Text fontSize="sm" color="fg.muted">
                        {getVet(v.vet).name}
                      </Text>
                    </Box>
                    <Text fontSize="sm" color="fg.muted">
                      Invoice {fmtUsd(v.invoice_usd)}
                    </Text>
                  </Flex>
                  <Text mt="2">{v.notes}</Text>
                </Box>
              ))}
            </Stack>
          )}
        </Card>
      </Grid>

      <BookingDialog open={bookOpen} onOpenChange={setBookOpen} defaultPatientId={patientId} />
    </Stack>
  );
}
