"use client";

import NextLink from "next/link";
import {
  Badge,
  Box,
  Flex,
  Grid,
  Heading,
  HStack,
  Link,
  Stack,
  Text,
  VisuallyHidden,
} from "@chakra-ui/react";
import { Chart, useChart } from "@chakra-ui/charts";
import { CartesianGrid, LabelList, Line, LineChart, Tooltip, XAxis, YAxis } from "recharts";
import {
  LuArrowLeft,
  LuCircleCheck,
  LuClipboardList,
  LuPhone,
  LuPill,
  LuScale,
  LuSyringe,
  LuTriangleAlert,
} from "react-icons/lu";
import { Avatar } from "@/components/ui/avatar";
import { AlertBanner } from "@/components/patient-alerts";
import { StatusBadge } from "@/components/schedule-board";
import { useClinic } from "@/components/clinic-provider";
import {
  TODAY,
  ageLabel,
  fmtDate,
  fmtMonthYear,
  fmtTime,
  fmtUsd,
  getPatient,
  getVet,
  ownerOf,
  records,
  toMin,
  vaccinationStatus,
  type Vaccination,
  type Weight,
} from "@/lib/data";

export function PatientRecord({ patientId }: { patientId: string }) {
  const { appointments } = useClinic();
  const patient = getPatient(patientId);
  if (!patient) return null;
  const owner = ownerOf(patient);
  const record = records[patientId];

  const today = appointments
    .filter((a) => a.patient === patientId && a.status !== "cancelled")
    .sort((a, b) => toMin(a.start) - toMin(b.start));

  const vaccinations = record
    ? [...record.vaccinations].sort((a, b) => a.due.localeCompare(b.due))
    : [];
  const overdue = vaccinations.filter((v) => vaccinationStatus(v.due, TODAY).state === "overdue");

  return (
    <Stack gap="5">
      <Link asChild variant="plain" color="fg.muted" alignSelf="flex-start" _hover={{ color: "fg" }}>
        <NextLink href="/">
          <LuArrowLeft aria-hidden="true" />
          Back to today&rsquo;s schedule
        </NextLink>
      </Link>

      <Box bg="bg.panel" borderWidth="1px" borderColor="border.muted" rounded="lg" p={{ base: "4", md: "6" }}>
        <Flex gap={{ base: "4", md: "6" }} direction={{ base: "column", md: "row" }} align={{ md: "center" }}>
          <HStack gap="4" align="center">
            <Avatar name={patient.name} size="2xl" colorPalette="teal" />
            <Box>
              <Heading as="h1" size={{ base: "3xl", md: "4xl" }}>
                {patient.name}
              </Heading>
              <Text color="fg.muted">
                {patient.species} · {patient.breed}
              </Text>
            </Box>
          </HStack>

          <Grid
            as="dl"
            flex="1"
            templateColumns={{ base: "repeat(2, minmax(0, 1fr))", lg: "repeat(4, minmax(0, 1fr))" }}
            gap="4"
            m="0"
          >
            <Fact label="Sex" value={patient.sex} />
            <Fact label="Age" value={ageLabel(patient.born, TODAY)} sub={`Born ${fmtDate(patient.born)}`} />
            <Fact label="Owner" value={owner.name} />
            <Fact
              label="Owner phone"
              value={
                <Link
                  href={`tel:${owner.phone.replace(/\s/g, "")}`}
                  fontWeight="medium"
                  aria-label={`Call ${owner.name} at ${owner.phone}`}
                >
                  <LuPhone aria-hidden="true" />
                  {owner.phone}
                </Link>
              }
            />
          </Grid>
        </Flex>
      </Box>

      <AlertBanner name={patient.name} alerts={patient.alerts} />

      {overdue.length > 0 && (
        <Flex
          role="group"
          aria-label="Overdue vaccinations"
          align="center"
          gap="3"
          bg="orange.subtle"
          borderWidth="1px"
          borderColor="orange.solid"
          rounded="lg"
          px="4"
          py="3"
          color="orange.fg"
        >
          <LuSyringe aria-hidden="true" size={20} />
          <Text fontWeight="semibold">
            {overdue.length} {overdue.length === 1 ? "vaccination is" : "vaccinations are"} overdue:{" "}
            {overdue.map((v) => v.name).join(", ")}
          </Text>
        </Flex>
      )}

      {today.length > 0 && (
        <Section title="Today at the clinic" icon={<LuClipboardList aria-hidden="true" />}>
          <Stack as="ul" gap="2" listStyleType="none" m="0" p="0">
            {today.map((a) => (
              <Flex
                as="li"
                key={a.id}
                justify="space-between"
                align="center"
                gap="3"
                flexWrap="wrap"
                borderWidth="1px"
                borderColor="border.muted"
                rounded="md"
                px="3"
                py="2.5"
              >
                <Box>
                  <Text fontWeight="semibold">
                    {fmtTime(a.start)} · {a.reason}
                  </Text>
                  <Text fontSize="sm" color="fg.muted">
                    {getVet(a.vet)?.name} · {getVet(a.vet)?.room}
                  </Text>
                </Box>
                <StatusBadge status={a.status} />
              </Flex>
            ))}
          </Stack>
        </Section>
      )}

      {!record ? (
        <Box bg="bg.panel" borderWidth="1px" borderColor="border.muted" rounded="lg" p="8" textAlign="center">
          <Text fontWeight="medium">No weights, vaccinations, medications or visit notes are on file for {patient.name} yet.</Text>
        </Box>
      ) : (
        <Grid templateColumns={{ base: "minmax(0, 1fr)", lg: "minmax(0, 1fr) 26rem" }} gap="5" alignItems="start">
          <Stack gap="5" order={{ base: 2, lg: 1 }} minW="0">
            <Section title="Weight trend" icon={<LuScale aria-hidden="true" />}>
              <WeightTrend weights={record.weights_kg} />
            </Section>

            <Section title="Visit history" icon={<LuClipboardList aria-hidden="true" />}>
              <Stack as="ul" gap="3" listStyleType="none" m="0" p="0">
                {record.visits.map((v) => (
                  <Box
                    as="li"
                    key={v.date + v.reason}
                    borderWidth="1px"
                    borderColor="border.muted"
                    rounded="md"
                    p="4"
                  >
                    <Flex justify="space-between" gap="3" flexWrap="wrap" align="baseline">
                      <HStack gap="2" flexWrap="wrap">
                        <Text fontWeight="semibold" fontSize="lg">
                          {fmtDate(v.date)}
                        </Text>
                        {v.date === TODAY && (
                          <Badge colorPalette="teal" variant="solid">
                            Today
                          </Badge>
                        )}
                      </HStack>
                      <Text color="fg.muted" fontVariantNumeric="tabular-nums">
                        Invoice {fmtUsd(v.invoice_usd)}
                      </Text>
                    </Flex>
                    <Text fontWeight="medium">{v.reason}</Text>
                    <Text fontSize="sm" color="fg.muted" mb="2">
                      {getVet(v.vet)?.name}
                    </Text>
                    <Text>{v.notes}</Text>
                  </Box>
                ))}
              </Stack>
            </Section>
          </Stack>

          <Stack gap="5" order={{ base: 1, lg: 2 }} minW="0">
            <Section title="Vaccinations" icon={<LuSyringe aria-hidden="true" />}>
              <Stack as="ul" gap="2" listStyleType="none" m="0" p="0">
                {vaccinations.map((v) => (
                  <VaccinationRow key={v.name} vaccination={v} />
                ))}
              </Stack>
            </Section>

            <Section title="Current medications" icon={<LuPill aria-hidden="true" />}>
              <Stack as="ul" gap="2" listStyleType="none" m="0" p="0">
                {record.medications.map((m) => (
                  <Box as="li" key={m.name} borderWidth="1px" borderColor="border.muted" rounded="md" px="3" py="2.5">
                    <Text fontWeight="semibold">{m.name}</Text>
                    <Text>{m.dose}</Text>
                    <Text fontSize="sm" color="fg.muted">
                      Since {fmtDate(m.since)}
                    </Text>
                  </Box>
                ))}
              </Stack>
            </Section>
          </Stack>
        </Grid>
      )}
    </Stack>
  );
}

function Fact({ label, value, sub }: { label: string; value: React.ReactNode; sub?: string }) {
  return (
    <Box>
      <Text as="dt" fontSize="xs" color="fg.muted" textTransform="uppercase" letterSpacing="wider">
        {label}
      </Text>
      <Text as="dd" m="0" fontWeight="medium" fontSize="md">
        {value}
      </Text>
      {sub && (
        <Text as="dd" m="0" fontSize="sm" color="fg.muted">
          {sub}
        </Text>
      )}
    </Box>
  );
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Box as="section" bg="bg.panel" borderWidth="1px" borderColor="border.muted" rounded="lg" p={{ base: "4", md: "5" }}>
      <HStack gap="2" mb="4" color="fg">
        <Box color="teal.fg">{icon}</Box>
        <Heading as="h2" size="lg">
          {title}
        </Heading>
      </HStack>
      {children}
    </Box>
  );
}

function VaccinationRow({ vaccination }: { vaccination: Vaccination }) {
  const status = vaccinationStatus(vaccination.due, TODAY);
  const overdue = status.state === "overdue";
  const soon = status.state === "soon";
  return (
    <Flex
      as="li"
      justify="space-between"
      align="center"
      gap="3"
      flexWrap="wrap"
      bg={overdue ? "red.subtle" : "transparent"}
      borderWidth={overdue ? "2px" : "1px"}
      borderColor={overdue ? "red.solid" : "border.muted"}
      rounded="md"
      px="3"
      py="2.5"
    >
      <Box>
        <Text fontWeight="semibold" color={overdue ? "red.fg" : "fg"}>
          {vaccination.name}
        </Text>
        <Text fontSize="sm" color="fg.muted">
          Given {fmtDate(vaccination.given)}
        </Text>
        <Text fontSize="sm" color={overdue ? "red.fg" : "fg.muted"} fontWeight={overdue ? "semibold" : undefined}>
          Due {fmtDate(vaccination.due)}
        </Text>
      </Box>
      {overdue ? (
        <Badge colorPalette="red" variant="solid" size="lg" gap="1.5">
          <LuTriangleAlert aria-hidden="true" />
          Overdue {status.days} {status.days === 1 ? "day" : "days"}
        </Badge>
      ) : soon ? (
        <Badge colorPalette="orange" variant="subtle" size="lg">
          Due in {status.days} {status.days === 1 ? "day" : "days"}
        </Badge>
      ) : (
        <Badge colorPalette="green" variant="subtle" size="lg" gap="1.5">
          <LuCircleCheck aria-hidden="true" />
          Up to date
        </Badge>
      )}
    </Flex>
  );
}

function WeightTrend({ weights }: { weights: Weight[] }) {
  const data = weights.map((w) => ({ date: w.date, label: fmtMonthYear(w.date), kg: w.kg }));
  const chart = useChart({
    data,
    series: [{ name: "kg", color: "teal.solid" }],
  });

  const first = weights[0];
  const last = weights[weights.length - 1];
  const prev = weights[weights.length - 2];
  const total = last.kg - first.kg;
  const lastChange = prev ? last.kg - prev.kg : 0;
  const pct = (total / first.kg) * 100;
  const signed = (n: number) => `${n > 0 ? "+" : n < 0 ? "−" : ""}${Math.abs(n).toFixed(1)} kg`;

  return (
    <Stack gap="4">
      <Grid templateColumns="repeat(3, minmax(0, 1fr))" gap="3">
        <Box>
          <Text fontSize="xs" color="fg.muted" textTransform="uppercase" letterSpacing="wider">
            Latest
          </Text>
          <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="bold">
            {last.kg.toFixed(1)} kg
          </Text>
          <Text fontSize="sm" color="fg.muted">
            {fmtDate(last.date)}
          </Text>
        </Box>
        <Box>
          <Text fontSize="xs" color="fg.muted" textTransform="uppercase" letterSpacing="wider">
            Since last visit
          </Text>
          <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="bold">
            {signed(lastChange)}
          </Text>
        </Box>
        <Box>
          <Text fontSize="xs" color="fg.muted" textTransform="uppercase" letterSpacing="wider">
            Since {fmtMonthYear(first.date)}
          </Text>
          <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="bold">
            {signed(total)}
          </Text>
          <Text fontSize="sm" color="fg.muted">
            {pct.toFixed(1).replace("-", "−")}%
          </Text>
        </Box>
      </Grid>

      <Box
        role="img"
        aria-label={`Weight trend line chart across ${weights.length} visits, from ${first.kg} kilograms in ${fmtDate(first.date)} to ${last.kg} kilograms on ${fmtDate(last.date)}.`}
      >
        <Chart.Root height="64" chart={chart}>
          <LineChart data={chart.data} responsive margin={{ top: 20, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid stroke={chart.color("border")} vertical={false} />
            <XAxis
              axisLine={false}
              tickLine={false}
              tickMargin={8}
              dataKey={chart.key("label")}
              stroke={chart.color("border")}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tickMargin={8}
              width={36}
              allowDecimals={false}
              domain={[(min: number) => Math.floor(min) - 1, (max: number) => Math.ceil(max) + 1]}
              stroke={chart.color("border")}
            />
            <Tooltip animationDuration={100} cursor={false} content={<Chart.Tooltip />} />
            <Line
              isAnimationActive={false}
              dataKey={chart.key("kg")}
              stroke={chart.color("teal.solid")}
              strokeWidth={3}
              dot={{ r: 4, fill: chart.color("teal.solid") }}
            >
              <LabelList dataKey={chart.key("kg")} position="top" offset={10} fontSize={12} />
            </Line>
          </LineChart>
        </Chart.Root>
      </Box>

      <VisuallyHidden>
        <ul>
          {weights.map((w) => (
            <li key={w.date}>
              {fmtDate(w.date)}: {w.kg} kg
            </li>
          ))}
        </ul>
      </VisuallyHidden>
    </Stack>
  );
}
