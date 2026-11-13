"use client"

import { Chart, useChart } from "@chakra-ui/charts"
import {
  Badge,
  Box,
  Button,
  Flex,
  Heading,
  SimpleGrid,
  Stack,
  Table,
  Text,
  VisuallyHidden,
} from "@chakra-ui/react"
import NextLink from "next/link"
import * as React from "react"
import { LuArrowLeft, LuCalendarPlus, LuCheck, LuPhone, LuPill, LuSyringe, LuTriangleAlert } from "react-icons/lu"
import { CartesianGrid, Line, LineChart, Tooltip, XAxis, YAxis } from "recharts"
import { Avatar } from "@/components/ui/avatar"
import { toaster } from "@/components/ui/toaster"
import { useClinic } from "@/lib/clinic-store"
import {
  PATIENTS,
  RECORDS,
  TODAY,
  ageLabel,
  formatDate,
  formatTime,
  ownerById,
  patientById,
  usd,
  vaccineState,
  vetById,
} from "@/lib/data"
import { BookingDialog } from "./BookingDialog"
import { StatusBadge } from "./Schedule"

function Panel({
  title,
  icon,
  children,
  id,
}: {
  title: string
  icon?: React.ReactNode
  children: React.ReactNode
  id: string
}) {
  return (
    <Box as="section" aria-labelledby={id} bg="bg.panel" borderWidth="1px" borderRadius="lg" overflow="hidden">
      <Flex px={{ base: "4", md: "5" }} py="3" borderBottomWidth="1px" align="center" gap="2">
        {icon}
        <Heading as="h2" id={id} size="md">
          {title}
        </Heading>
      </Flex>
      <Box p={{ base: "4", md: "5" }}>{children}</Box>
    </Box>
  )
}

export function PatientView({ id }: { id: string }) {
  const patient = patientById(id)
  const record = RECORDS[id]
  const { appointments, checkIn, now } = useClinic()
  const [bookOpen, setBookOpen] = React.useState(false)

  if (!patient) return null
  const owner = ownerById(patient.owner)
  const siblings = PATIENTS.filter((p) => p.owner === patient.owner && p.id !== patient.id)
  const todays = appointments.filter((a) => a.patient === patient.id && a.status !== "cancelled")
  const overdue = record?.vaccinations.filter((v) => vaccineState(v.due).state === "overdue") ?? []

  return (
    <Stack gap="5">
      <Box asChild alignSelf="flex-start" color="fg.muted" _hover={{ color: "fg" }}>
        <NextLink href="/">
          <Flex align="center" gap="2" minH="8">
            <LuArrowLeft aria-hidden="true" /> Today&rsquo;s schedule
          </Flex>
        </NextLink>
      </Box>

      <Flex
        bg="bg.panel"
        borderWidth="1px"
        borderRadius="lg"
        p={{ base: "4", md: "6" }}
        gap="5"
        direction={{ base: "column", md: "row" }}
        justify="space-between"
        align={{ md: "center" }}
      >
        <Flex gap="4" align="center">
          <Avatar name={patient.name} size="2xl" colorPalette="teal" />
          <Box>
            <Heading as="h1" size={{ base: "3xl", md: "4xl" }} letterSpacing="-0.02em">
              {patient.name}
            </Heading>
            <Text color="fg.muted">
              {patient.breed} | {patient.species} | {patient.sex}
            </Text>
            <Text color="fg.muted" fontSize="sm">
              {ageLabel(patient.born)} old, born {formatDate(patient.born)}
            </Text>
          </Box>
        </Flex>
        <Flex gap="3" wrap="wrap">
          <Button size="lg" colorPalette="teal" bg="teal.700" _hover={{ bg: "teal.800" }} onClick={() => setBookOpen(true)}>
            <LuCalendarPlus /> Book follow-up
          </Button>
        </Flex>
      </Flex>

      {patient.alerts.length > 0 && (
        <Box
          role="region"
          aria-label="Medical alerts"
          bg="red.solid"
          color="red.contrast"
          borderRadius="lg"
          p={{ base: "4", md: "5" }}
          borderWidth="2px"
          borderColor="red.emphasized"
        >
          <Flex align="center" gap="2" mb="3">
            <LuTriangleAlert size={26} aria-hidden="true" />
            <Heading as="h2" size="lg" textTransform="uppercase" letterSpacing="0.04em">
              Medical alerts
            </Heading>
          </Flex>
          <Stack as="ul" listStyleType="none" m="0" p="0" gap="2">
            {patient.alerts.map((alert) => (
              <Box as="li" key={alert} fontSize={{ base: "xl", md: "2xl" }} fontWeight="bold" lineHeight="1.2">
                {alert}
              </Box>
            ))}
          </Stack>
        </Box>
      )}

      {overdue.length > 0 && (
        <Flex
          role="status"
          bg="orange.subtle"
          color="orange.fg"
          borderWidth="1px"
          borderColor="orange.muted"
          borderRadius="lg"
          px="4"
          py="3"
          gap="3"
          align="center"
        >
          <LuSyringe aria-hidden="true" />
          <Text fontWeight="semibold">
            {overdue.length} {overdue.length === 1 ? "vaccination is" : "vaccinations are"} overdue as of{" "}
            {formatDate(TODAY)}: {overdue.map((v) => v.name).join(", ")}.
          </Text>
        </Flex>
      )}

      <Flex gap="5" direction={{ base: "column", lg: "row" }} align="flex-start">
        <Stack gap="5" flex="1" minW="0" w="full">
          {record ? (
            <>
              <WeightPanel weights={record.weights_kg} />
              <VisitHistory visits={record.visits} />
            </>
          ) : (
            <Panel title="Medical record" id="norec">
              <Text color="fg.muted">
                No weight, vaccination or visit history is on file for {patient.name} in this workspace.
              </Text>
            </Panel>
          )}
        </Stack>

        <Stack gap="5" w={{ base: "full", lg: "380px" }} flexShrink="0">
          <Panel title="Today" id="today-h">
            {todays.length === 0 ? (
              <Text color="fg.muted">No appointment today.</Text>
            ) : (
              <Stack gap="4">
                {todays.map((a) => (
                  <Box key={a.id}>
                    <Flex justify="space-between" gap="3" align="center">
                      <Text fontWeight="bold">
                        {formatTime(a.start)} | {a.reason}
                      </Text>
                      <StatusBadge status={a.status} />
                    </Flex>
                    <Text fontSize="sm" color="fg.muted">
                      {vetById(a.vet)?.name}, {vetById(a.vet)?.room}
                    </Text>
                    {a.status === "booked" && (
                      <Button
                        mt="2"
                        size="md"
                        colorPalette="teal"
                        bg="teal.700"
                        _hover={{ bg: "teal.800" }}
                        onClick={() => {
                          checkIn(a.id)
                          toaster.create({ type: "success", title: `${patient.name} is checked in`, closable: true })
                        }}
                      >
                        <LuCheck /> Check in
                      </Button>
                    )}
                    {a.status === "checked_in" && (
                      <Text fontSize="sm" mt="1" color="orange.fg" fontWeight="semibold">
                        Waiting {Math.max(0, now - (a.checkedInAt ?? now))} min
                      </Text>
                    )}
                  </Box>
                ))}
              </Stack>
            )}
          </Panel>

          <Panel title="Owner" id="owner-h">
            <Text fontWeight="bold" fontSize="lg">
              {owner?.name}
            </Text>
            <Box asChild color="colorPalette.fg" fontWeight="medium">
              <a href={`tel:${owner?.phone.replace(/\s/g, "")}`}>
                <Flex align="center" gap="2" minH="8">
                  <LuPhone aria-hidden="true" /> {owner?.phone}
                </Flex>
              </a>
            </Box>
            {siblings.length > 0 && (
              <Box mt="3" pt="3" borderTopWidth="1px">
                <Text fontSize="sm" color="fg.muted" mb="2">
                  Other pets
                </Text>
                <Stack gap="2">
                  {siblings.map((s) => (
                    <Box key={s.id}>
                      <Box asChild fontWeight="semibold" _hover={{ textDecoration: "underline" }}>
                        <NextLink href={`/patients/${s.id}`}>
                          {s.name} <Text as="span" color="fg.muted" fontWeight="normal">({s.species})</Text>
                        </NextLink>
                      </Box>
                      {s.alerts.length > 0 && (
                        <Box mt="1">
                          <Badge colorPalette="red" variant="solid" size="xs" whiteSpace="normal" gap="1">
                            <LuTriangleAlert aria-hidden="true" />
                            <VisuallyHidden>Medical alert: </VisuallyHidden>
                            {s.alerts.join("; ")}
                          </Badge>
                        </Box>
                      )}
                    </Box>
                  ))}
                </Stack>
              </Box>
            )}
          </Panel>

          {record && (
            <>
              <Panel title="Vaccinations" id="vacc-h" icon={<LuSyringe aria-hidden="true" />}>
                <Stack as="ul" listStyleType="none" m="0" p="0" gap="2.5">
                  {record.vaccinations.map((v) => {
                    const s = vaccineState(v.due)
                    const palette = s.state === "overdue" ? "red" : s.state === "soon" ? "orange" : "green"
                    return (
                      <Flex
                        as="li"
                        key={v.name}
                        justify="space-between"
                        gap="3"
                        align="center"
                        p="3"
                        borderRadius="md"
                        borderWidth="1px"
                        borderColor={s.state === "overdue" ? "red.muted" : "border"}
                        bg={s.state === "overdue" ? "red.subtle" : "transparent"}
                      >
                        <Box>
                          <Text fontWeight="bold">{v.name}</Text>
                          <Text fontSize="sm" color="fg.muted">
                            Given {formatDate(v.given)}
                          </Text>
                          <Text fontSize="sm" color="fg.muted">
                            Due {formatDate(v.due)}
                          </Text>
                        </Box>
                        <Badge colorPalette={palette} variant={s.state === "overdue" ? "solid" : "subtle"} size="md" textAlign="center" whiteSpace="normal">
                          {s.state === "overdue"
                            ? `Overdue ${s.days} days`
                            : s.state === "soon"
                              ? `Due in ${s.days} days`
                              : "Up to date"}
                        </Badge>
                      </Flex>
                    )
                  })}
                </Stack>
              </Panel>

              <Panel title="Current medications" id="meds-h" icon={<LuPill aria-hidden="true" />}>
                <Stack as="ul" listStyleType="none" m="0" p="0" gap="3">
                  {record.medications.map((m) => (
                    <Box as="li" key={m.name}>
                      <Text fontWeight="bold">{m.name}</Text>
                      <Text fontSize="sm">{m.dose}</Text>
                      <Text fontSize="sm" color="fg.muted">
                        Since {formatDate(m.since)}
                      </Text>
                    </Box>
                  ))}
                </Stack>
              </Panel>
            </>
          )}
        </Stack>
      </Flex>

      <BookingDialog open={bookOpen} onOpenChange={setBookOpen} defaultPatient={patient.id} />
    </Stack>
  )
}

function WeightPanel({ weights }: { weights: { date: string; kg: number }[] }) {
  const data = weights.map((w) => ({
    label: `${formatDate(w.date, { month: "short", year: undefined, day: undefined })} '${w.date.slice(2, 4)}`,
    kg: w.kg,
  }))
  const chart = useChart({
    data,
    series: [{ name: "kg", color: "teal.solid" }],
  })
  const first = weights[0]
  const last = weights[weights.length - 1]
  const delta = last.kg - first.kg
  const pct = (delta / first.kg) * 100

  return (
    <Panel title="Weight trend" id="weight-h">
      <Flex gap={{ base: "4", md: "8" }} wrap="wrap" mb="4" align="baseline">
        <Box>
          <Text fontSize="4xl" fontWeight="bold" lineHeight="1" fontVariantNumeric="tabular-nums">
            {last.kg.toFixed(1)} <Text as="span" fontSize="lg" color="fg.muted" fontWeight="medium">kg</Text>
          </Text>
          <Text fontSize="sm" color="fg.muted">
            Latest, {formatDate(last.date)}
          </Text>
        </Box>
        <Box>
          <Text fontSize="2xl" fontWeight="bold" color={delta < 0 ? "orange.fg" : "fg"} fontVariantNumeric="tabular-nums">
            {delta > 0 ? "+" : ""}
            {delta.toFixed(1)} kg ({pct.toFixed(0)}%)
          </Text>
          <Text fontSize="sm" color="fg.muted">
            Since {formatDate(first.date)}, {weights.length} visits
          </Text>
        </Box>
      </Flex>
      <Chart.Root chart={chart} h={{ base: "220px", md: "280px" }} aria-hidden="true">
        <LineChart data={chart.data} responsive margin={{ left: 0, right: 16, top: 8 }}>
          <CartesianGrid stroke={chart.color("border")} vertical={false} />
          <XAxis axisLine={false} dataKey={chart.key("label")} stroke={chart.color("border")} tick={{ fontSize: 12 }} tickMargin={8} interval="preserveStartEnd" />
          <YAxis
            axisLine={false}
            tickLine={false}
            tickMargin={8}
            width={36}
            domain={[(min: number) => Math.floor(min - 1), (max: number) => Math.ceil(max + 1)]}
            stroke={chart.color("border")}
            tick={{ fontSize: 12 }}
          />
          <Tooltip animationDuration={100} cursor={false} content={<Chart.Tooltip />} />
          {chart.series.map((item) => (
            <Line
              key={item.name}
              isAnimationActive={false}
              dataKey={chart.key(item.name)}
              stroke={chart.color(item.color)}
              strokeWidth={3}
              dot={{ r: 4, fill: chart.color(item.color) }}
            />
          ))}
        </LineChart>
      </Chart.Root>
      <VisuallyHidden>
        <Table.Root>
          <Table.Caption>Weight in kilograms at each visit</Table.Caption>
          <Table.Body>
            {weights.map((w) => (
              <Table.Row key={w.date}>
                <Table.Cell>{formatDate(w.date)}</Table.Cell>
                <Table.Cell>{w.kg} kg</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </VisuallyHidden>
    </Panel>
  )
}

function VisitHistory({ visits }: { visits: { date: string; vet: string; reason: string; notes: string; invoice_usd: number }[] }) {
  return (
    <Panel title="Visit history" id="visits-h">
      <Stack as="ol" listStyleType="none" m="0" p="0" gap="0">
        {visits.map((v, i) => (
          <Box
            as="li"
            key={v.date}
            position="relative"
            ps="6"
            pb={i === visits.length - 1 ? "0" : "5"}
            borderStartWidth="2px"
            borderStartColor="border"
            ms="1.5"
          >
            <Box position="absolute" left="-7px" top="1.5" boxSize="3" borderRadius="full" bg={i === 0 ? "colorPalette.solid" : "bg.emphasized"} borderWidth="2px" borderColor="bg.panel" />
            <Flex justify="space-between" gap="3" wrap="wrap" align="baseline">
              <Text fontWeight="bold">
                {formatDate(v.date)} | {v.reason}
              </Text>
              <Text fontSize="sm" color="fg.muted" fontVariantNumeric="tabular-nums">
                {usd(v.invoice_usd)}
              </Text>
            </Flex>
            <Text fontSize="sm" color="fg.muted" mb="1.5">
              {vetById(v.vet)?.name}
            </Text>
            <Text>{v.notes}</Text>
          </Box>
        ))}
      </Stack>
    </Panel>
  )
}
