"use client"

import * as React from "react"
import NextLink from "next/link"
import { Chart, useChart } from "@chakra-ui/charts"
import { CartesianGrid, Line, LineChart, Tooltip, XAxis, YAxis } from "recharts"
import {
  Avatar,
  Badge,
  Box,
  Button,
  Flex,
  Grid,
  GridItem,
  Heading,
  HStack,
  Icon,
  Link,
  Stack,
  Text,
} from "@chakra-ui/react"
import {
  LuArrowLeft,
  LuCalendarPlus,
  LuClipboardList,
  LuPhone,
  LuPill,
  LuStethoscope,
  LuSyringe,
  LuTrendingDown,
} from "react-icons/lu"
import { AlertBanner } from "@/components/Alerts"
import { StatusBadge } from "@/components/StatusBadge"
import { useClinic } from "@/lib/clinic"
import {
  RECORDS,
  TODAY,
  ageOn,
  daysBetween,
  fmtDate,
  fmtDateShort,
  fmtMoney,
  fmtTime,
  fmtMin,
  endMin,
  getOwner,
  getPatient,
  getVet,
  toMin,
  vaccineState,
} from "@/lib/data"

function Panel({
  id,
  title,
  icon,
  aside,
  children,
}: {
  id: string
  title: string
  icon: React.ReactNode
  aside?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <Box as="section" aria-labelledby={id} borderWidth="1px" borderRadius="xl" bg="bg.panel" overflow="hidden">
      <Flex align="center" justify="space-between" gap="3" px={{ base: "4", md: "5" }} py="3.5" borderBottomWidth="1px">
        <HStack gap="2.5">
          <Icon boxSize="5" color="fg.muted" aria-hidden>
            {icon}
          </Icon>
          <Heading as="h2" id={id} size="md">
            {title}
          </Heading>
        </HStack>
        {aside}
      </Flex>
      <Box px={{ base: "4", md: "5" }} py="4">
        {children}
      </Box>
    </Box>
  )
}

export function PatientRecordView({ patientId }: { patientId: string }) {
  const patient = getPatient(patientId)
  const { appointments, openBooking } = useClinic()
  if (!patient) return null
  const owner = getOwner(patient.owner)
  const record = RECORDS[patient.id]
  const mine = appointments
    .filter((a) => a.patient === patient.id)
    .sort((a, b) => toMin(a.start) - toMin(b.start))

  return (
    <Stack gap={{ base: "4", md: "5" }}>
      <Link asChild color="fg.muted" fontSize="sm" w="fit-content" display="inline-flex" alignItems="center" gap="1.5">
        <NextLink href="/">
          <LuArrowLeft aria-hidden /> Today&rsquo;s schedule
        </NextLink>
      </Link>

      <Flex
        borderWidth="1px"
        borderRadius="xl"
        bg="bg.panel"
        p={{ base: "4", md: "6" }}
        gap={{ base: "4", md: "6" }}
        direction={{ base: "column", lg: "row" }}
        justify="space-between"
      >
        <HStack gap={{ base: "3", md: "5" }} align="center" minW="0">
          <Avatar.Root size="2xl" colorPalette="teal" flexShrink={0}>
            <Avatar.Fallback name={patient.name} />
          </Avatar.Root>
          <Box minW="0">
            <Heading as="h1" size={{ base: "3xl", md: "4xl" }} lineHeight="1.1">
              {patient.name}
            </Heading>
            <Text color="fg.muted" fontSize={{ base: "md", md: "lg" }}>
              {patient.breed} · {patient.species}
            </Text>
            <Text color="fg.muted" fontSize="sm">
              {patient.sex} · {ageOn(patient.born, TODAY)} old (born {fmtDate(patient.born)})
            </Text>
            <Text color="fg.subtle" fontSize="xs">
              Patient ID {patient.id}
            </Text>
          </Box>
        </HStack>

        <Flex
          direction={{ base: "column", sm: "row" }}
          gap="4"
          align={{ base: "stretch", sm: "center" }}
          justify="space-between"
          borderTopWidth={{ base: "1px", lg: "0" }}
          borderStartWidth={{ lg: "1px" }}
          ps={{ lg: "6" }}
          pt={{ base: "4", lg: "0" }}
        >
          <Box>
            <Text fontSize="xs" fontWeight="semibold" textTransform="uppercase" letterSpacing="wider" color="fg.muted">
              Owner
            </Text>
            <Text fontWeight="semibold" fontSize="lg">
              {owner.name}
            </Text>
            <Link href={`tel:${owner.phone.replace(/\s/g, "")}`} fontSize="md" fontVariantNumeric="tabular-nums" display="inline-flex" alignItems="center" gap="1.5">
              <LuPhone aria-hidden /> {owner.phone}
            </Link>
          </Box>
          <Button colorPalette="teal" bg="teal.700" _hover={{ bg: "teal.800" }} size="lg" onClick={() => openBooking(patient.id)}>
            <LuCalendarPlus aria-hidden /> Book follow-up
          </Button>
        </Flex>
      </Flex>

      <AlertBanner name={patient.name} alerts={patient.alerts} />

      <Grid templateColumns={{ base: "minmax(0,1fr)", lg: "minmax(0,1.45fr) minmax(0,1fr)" }} gap={{ base: "4", md: "5" }} alignItems="start">
        <GridItem order={{ base: 2, lg: 1 }}>
          <Stack gap={{ base: "4", md: "5" }}>
            {record ? (
              <>
                <WeightPanel weights={record.weights_kg} />
                <VisitsPanel visits={record.visits} />
              </>
            ) : (
              <Panel id="nohistory" title="Clinical history" icon={<LuClipboardList />}>
                <Text color="fg.muted">
                  No weights, vaccinations or visit notes have been entered for {patient.name} yet. They appear here
                  once the vet records the first visit.
                </Text>
              </Panel>
            )}
          </Stack>
        </GridItem>

        <GridItem order={{ base: 1, lg: 2 }}>
          <Stack gap={{ base: "4", md: "5" }}>
            <Panel id="today-h" title="Today" icon={<LuStethoscope />}>
              {mine.length === 0 ? (
                <Text color="fg.muted">No appointments today.</Text>
              ) : (
                <Stack as="ul" listStyle="none" m="0" p="0" gap="3">
                  {mine.map((a) => (
                    <Flex as="li" key={a.id} justify="space-between" align="start" gap="3">
                      <Box minW="0">
                        <Text fontWeight="semibold">
                          {fmtTime(a.start)} to {fmtMin(endMin(a))}
                          {a.urgent && (
                            <Badge colorPalette="red" variant="solid" ms="2">
                              Urgent
                            </Badge>
                          )}
                        </Text>
                        <Text fontSize="sm" color="fg.muted">
                          {a.reason} · {getVet(a.vet).name}, {getVet(a.vet).room}
                        </Text>
                      </Box>
                      <StatusBadge status={a.status} />
                    </Flex>
                  ))}
                </Stack>
              )}
            </Panel>
            {record && (
              <>
                <VaccinationsPanel vaccinations={record.vaccinations} />
                <MedicationsPanel medications={record.medications} />
              </>
            )}
          </Stack>
        </GridItem>
      </Grid>
    </Stack>
  )
}

function WeightPanel({ weights }: { weights: { date: string; kg: number }[] }) {
  const data = weights.map((w) => ({ label: fmtDateShort(w.date), kg: w.kg }))
  const chart = useChart({ data, series: [{ name: "kg", color: "teal.solid" }] })
  const first = weights[0]
  const last = weights[weights.length - 1]
  const prev = weights[weights.length - 2]
  const change = last.kg - first.kg
  const pct = (change / first.kg) * 100
  const months = Math.round(daysBetween(first.date, last.date) / 30.4)
  const min = Math.floor(Math.min(...weights.map((w) => w.kg)) - 1)
  const max = Math.ceil(Math.max(...weights.map((w) => w.kg)) + 1)

  return (
    <Panel
      id="weight-h"
      title="Weight trend"
      icon={<LuTrendingDown />}
      aside={
        pct <= -5 ? (
          <Badge colorPalette="orange" variant="subtle" size="md">
            Down {Math.abs(pct).toFixed(0)}% in {months} months
          </Badge>
        ) : undefined
      }
    >
      <Flex gap={{ base: "5", md: "8" }} mb="4" wrap="wrap">
        <Box>
          <Text fontSize="xs" color="fg.muted" textTransform="uppercase" letterSpacing="wider" fontWeight="semibold">
            Today
          </Text>
          <Text fontSize="3xl" fontWeight="bold" lineHeight="1.1">
            {last.kg.toFixed(1)} <Text as="span" fontSize="md" fontWeight="medium" color="fg.muted">kg</Text>
          </Text>
        </Box>
        <Box>
          <Text fontSize="xs" color="fg.muted" textTransform="uppercase" letterSpacing="wider" fontWeight="semibold">
            Since last visit
          </Text>
          <Text fontSize="xl" fontWeight="semibold" lineHeight="1.5">
            {(last.kg - prev.kg).toFixed(1)} kg
          </Text>
        </Box>
        <Box>
          <Text fontSize="xs" color="fg.muted" textTransform="uppercase" letterSpacing="wider" fontWeight="semibold">
            Since {fmtDate(first.date)}
          </Text>
          <Text fontSize="xl" fontWeight="semibold" lineHeight="1.5" color="orange.fg">
            {change.toFixed(1)} kg ({pct.toFixed(1)}%)
          </Text>
        </Box>
      </Flex>
      <Box role="img" aria-label={`Weight in kilograms over ${weights.length} visits, from ${first.kg} kg in ${fmtDate(first.date)} to ${last.kg} kg on ${fmtDate(last.date)}`}>
        <Chart.Root chart={chart} h="240px" w="full">
          <LineChart data={chart.data} responsive width="100%" height="100%" margin={{ left: 0, right: 12, top: 8, bottom: 0 }}>
            <CartesianGrid stroke={chart.color("border")} vertical={false} />
            <XAxis axisLine={false} dataKey={chart.key("label")} stroke={chart.color("border")} tickMargin={8} />
            <YAxis
              axisLine={false}
              tickLine={false}
              tickMargin={8}
              width={36}
              domain={[min, max]}
              stroke={chart.color("border")}
              tickFormatter={(v: number) => `${v}`}
            />
            <Tooltip animationDuration={100} cursor={false} content={<Chart.Tooltip />} />
            {chart.series.map((s) => (
              <Line
                key={s.name}
                isAnimationActive={false}
                dataKey={chart.key(s.name)}
                stroke={chart.color(s.color)}
                strokeWidth={3}
                dot={{ r: 4, fill: chart.color(s.color) }}
              />
            ))}
          </LineChart>
        </Chart.Root>
      </Box>
      <Flex as="ul" listStyle="none" m="0" p="0" mt="3" wrap="wrap" columnGap="4" rowGap="1" fontSize="sm" color="fg.muted">
        {weights.map((w) => (
          <Box as="li" key={w.date} fontVariantNumeric="tabular-nums">
            {fmtDateShort(w.date)}: <Text as="span" fontWeight="semibold" color="fg">{w.kg.toFixed(1)}</Text>
          </Box>
        ))}
      </Flex>
    </Panel>
  )
}

function VaccinationsPanel({ vaccinations }: { vaccinations: { name: string; given: string; due: string }[] }) {
  const rows = vaccinations
    .map((v) => ({ ...v, ...vaccineState(v.due) }))
    .sort((a, b) => a.due.localeCompare(b.due))
  const overdue = rows.filter((r) => r.state === "overdue").length
  return (
    <Panel
      id="vacc-h"
      title="Vaccinations"
      icon={<LuSyringe />}
      aside={
        overdue > 0 ? (
          <Badge colorPalette="red" variant="solid" size="md">
            {overdue} overdue
          </Badge>
        ) : (
          <Badge colorPalette="green" variant="subtle" size="md">
            All up to date
          </Badge>
        )
      }
    >
      <Stack as="ul" listStyle="none" m="0" p="0" gap="2.5">
        {rows.map((r) => (
          <Flex
            as="li"
            key={r.name}
            justify="space-between"
            align="center"
            gap="3"
            borderWidth="1px"
            borderColor={r.state === "overdue" ? "red.solid" : "border"}
            borderStartWidth={r.state === "overdue" ? "4px" : "1px"}
            bg={r.state === "overdue" ? "red.subtle" : undefined}
            borderRadius="lg"
            px="3.5"
            py="2.5"
          >
            <Box minW="0">
              <Text fontWeight="semibold">{r.name}</Text>
              <Text fontSize="sm" color="fg.muted">
                Given {fmtDate(r.given)}
              </Text>
              <Text fontSize="sm" color={r.state === "overdue" ? "red.fg" : "fg.muted"} fontWeight={r.state === "overdue" ? "semibold" : undefined}>
                Due {fmtDate(r.due)}
              </Text>
            </Box>
            <Box textAlign="end" flexShrink={0}>
              {r.state === "overdue" && (
                <Badge colorPalette="red" variant="solid" size="md">
                  Overdue
                </Badge>
              )}
              {r.state === "soon" && (
                <Badge colorPalette="orange" variant="solid" size="md">
                  Due soon
                </Badge>
              )}
              {r.state === "ok" && (
                <Badge colorPalette="green" variant="subtle" size="md">
                  Up to date
                </Badge>
              )}
              <Text fontSize="xs" color={r.state === "overdue" ? "red.fg" : "fg.muted"} mt="1">
                {r.state === "overdue" ? `${r.days} days overdue` : `in ${r.days} days`}
              </Text>
            </Box>
          </Flex>
        ))}
      </Stack>
    </Panel>
  )
}

function MedicationsPanel({ medications }: { medications: { name: string; dose: string; since: string }[] }) {
  return (
    <Panel id="meds-h" title="Current medications" icon={<LuPill />}>
      <Stack as="ul" listStyle="none" m="0" p="0" gap="2.5">
        {medications.map((m) => (
          <Box as="li" key={m.name} borderWidth="1px" borderRadius="lg" px="3.5" py="2.5">
            <Text fontWeight="semibold">{m.name}</Text>
            <Text fontSize="sm">{m.dose}</Text>
            <Text fontSize="xs" color="fg.muted">
              Since {fmtDate(m.since)}
            </Text>
          </Box>
        ))}
      </Stack>
    </Panel>
  )
}

function VisitsPanel({ visits }: { visits: { date: string; vet: string; reason: string; notes: string; invoice_usd: number }[] }) {
  return (
    <Panel id="visits-h" title="Visit history" icon={<LuClipboardList />} aside={<Text fontSize="sm" color="fg.muted">{visits.length} visits</Text>}>
      <Stack as="ol" listStyle="none" m="0" p="0" gap="0">
        {visits.map((v, i) => (
          <Box
            as="li"
            key={v.date}
            position="relative"
            ps="5"
            pb={i === visits.length - 1 ? "0" : "5"}
            borderStartWidth="2px"
            borderStartColor="border"
            ms="1"
          >
            <Box position="absolute" insetStart="-7px" top="1.5" boxSize="3" borderRadius="full" bg={v.date === TODAY ? "teal.solid" : "bg.emphasized"} borderWidth="2px" borderColor="bg.panel" />
            <Flex justify="space-between" gap="3" wrap="wrap">
              <Text fontWeight="semibold">
                {fmtDate(v.date)}
                {v.date === TODAY && (
                  <Badge colorPalette="teal" variant="subtle" ms="2">
                    Today
                  </Badge>
                )}
              </Text>
              <Text fontSize="sm" color="fg.muted" fontVariantNumeric="tabular-nums">
                Invoice {fmtMoney(v.invoice_usd)}
              </Text>
            </Flex>
            <Text fontWeight="medium">{v.reason}</Text>
            <Text fontSize="sm" color="fg.muted" mb="1.5">
              {getVet(v.vet).name}
            </Text>
            <Text fontSize="sm">{v.notes}</Text>
          </Box>
        ))}
      </Stack>
    </Panel>
  )
}
