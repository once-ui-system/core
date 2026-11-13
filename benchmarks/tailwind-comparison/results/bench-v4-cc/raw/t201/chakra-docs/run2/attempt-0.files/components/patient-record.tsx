"use client"

import NextLink from "next/link"
import { Badge, Box, Button, Card, Flex, Grid, Heading, HStack, Icon, Link, SimpleGrid, Stack, Text } from "@chakra-ui/react"
import { Chart, useChart } from "@chakra-ui/charts"
import { CartesianGrid, LabelList, Line, LineChart, Tooltip, XAxis, YAxis } from "recharts"
import { LuArrowLeft, LuPawPrint, LuPhone, LuPill, LuSyringe, LuTriangleAlert } from "react-icons/lu"
import { AlertChips } from "@/components/alert-chips"
import { BookAppointmentButton } from "@/components/book-appointment"
import { useSchedule } from "@/lib/schedule-context"
import {
  RECORDS,
  STATUS_LABEL,
  ageText,
  daysBetween,
  endTime,
  formatClock,
  formatDate,
  formatMoney,
  ownerById,
  patientById,
  shortMonthYear,
  vaccineState,
  vetById,
} from "@/lib/data"

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Box>
      <Text fontSize="xs" fontWeight="semibold" letterSpacing="0.04em" textTransform="uppercase" color="fg.muted">
        {label}
      </Text>
      <Text fontWeight="medium">{children}</Text>
    </Box>
  )
}

function Section({
  id,
  title,
  icon,
  badge,
  children,
}: {
  id: string
  title: string
  icon?: React.ReactNode
  badge?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <Card.Root asChild>
      <section aria-labelledby={id}>
        <Card.Body gap="4">
          <HStack justify="space-between" gap="3" wrap="wrap">
            <HStack gap="2">
              {icon}
              <Heading id={id} size="lg">
                {title}
              </Heading>
            </HStack>
            {badge}
          </HStack>
          {children}
        </Card.Body>
      </section>
    </Card.Root>
  )
}

function WeightTrend({ points }: { points: { date: string; kg: number }[] }) {
  const data = points.map((p) => ({ label: shortMonthYear(p.date), kg: p.kg, date: formatDate(p.date) }))
  const chart = useChart({ data, series: [{ name: "kg", color: "teal.solid" }] })
  const first = points[0]
  const last = points[points.length - 1]
  const prev = points[points.length - 2]
  const lost = first.kg - last.kg
  const pct = (lost / first.kg) * 100

  return (
    <Stack gap="3">
      <Text color="fg.muted">
        {last.kg} kg on {formatDate(last.date)}, down {lost.toFixed(1)} kg ({pct.toFixed(0)}%) since{" "}
        {formatDate(first.date)}
        {prev ? ` and ${(prev.kg - last.kg).toFixed(1)} kg since the visit on ${formatDate(prev.date)}` : ""}.
      </Text>
      <Box role="img" aria-label={`Weight in kilograms over ${points.length} visits: ${points.map((p) => `${p.kg} on ${formatDate(p.date)}`).join(", ")}`}>
        <Chart.Root chart={chart} aspectRatio="auto" h="260px" w="full">
          <LineChart data={chart.data} responsive margin={{ top: 24, right: 24, left: 0, bottom: 0 }}>
            <CartesianGrid stroke={chart.color("border")} vertical={false} />
            <XAxis dataKey={chart.key("label")} axisLine={false} tickMargin={8} stroke={chart.color("border")} />
            <YAxis
              axisLine={false}
              tickLine={false}
              tickMargin={8}
              width={40}
              domain={[27, 33]}
              unit=" kg"
              stroke={chart.color("border")}
            />
            <Tooltip animationDuration={100} cursor={{ stroke: chart.color("border") }} content={<Chart.Tooltip />} />
            <Line
              isAnimationActive={false}
              dataKey={chart.key("kg")}
              stroke={chart.color("teal.solid")}
              fill={chart.color("teal.solid")}
              strokeWidth={3}
              dot={{ r: 4 }}
            >
              <LabelList
                dataKey={chart.key("kg")}
                position="top"
                offset={10}
                style={{ fontWeight: "600", fontSize: "12px", fill: chart.color("fg") }}
              />
            </Line>
          </LineChart>
        </Chart.Root>
      </Box>
    </Stack>
  )
}

export function PatientRecord({ patientId }: { patientId: string }) {
  const { appointments } = useSchedule()
  const patient = patientById(patientId)
  const owner = ownerById(patient.owner)
  const record = RECORDS[patientId]
  const todays = appointments
    .filter((a) => a.patient === patientId && a.status !== "cancelled")
    .sort((a, b) => a.start.localeCompare(b.start))

  const vaccines = record
    ? [...record.vaccinations]
        .map((v) => ({ ...v, ...vaccineState(v.due) }))
        .sort((a, b) => a.due.localeCompare(b.due))
    : []
  const overdue = vaccines.filter((v) => v.state === "overdue")

  return (
    <Stack gap="6">
      <Box>
        <Link asChild color="fg.muted" width="fit-content" minH="10" display="inline-flex" alignItems="center" gap="2">
          <NextLink href="/">
            <LuArrowLeft aria-hidden="true" />
            Today’s schedule
          </NextLink>
        </Link>
      </Box>

      {patient.alerts.length > 0 && (
        <Box
          asChild
          bg="red.subtle"
          borderWidth="3px"
          borderColor="red.solid"
          rounded="xl"
          p={{ base: "4", md: "5" }}
        >
          <section aria-label="Medical alerts" role="region">
            <HStack gap="3" align="start">
              <Icon boxSize="8" color="red.solid" flexShrink="0" mt="0.5">
                <LuTriangleAlert aria-hidden="true" />
              </Icon>
              <Stack gap="2">
                <Heading size="md" color="red.fg" textTransform="uppercase" letterSpacing="0.04em">
                  Medical alerts for {patient.name}
                </Heading>
                <Box asChild listStyleType="none" m="0" p="0">
                  <ul>
                    {patient.alerts.map((a) => (
                      <li key={a}>
                        <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="bold" color="red.fg">
                          {a}
                        </Text>
                      </li>
                    ))}
                  </ul>
                </Box>
              </Stack>
            </HStack>
          </section>
        </Box>
      )}

      <Card.Root>
        <Card.Body>
          <Flex direction={{ base: "column", md: "row" }} gap="5" justify="space-between" align={{ base: "stretch", md: "start" }}>
            <HStack gap="4" align="start">
              <Flex boxSize="16" rounded="2xl" bg="teal.subtle" color="teal.fg" align="center" justify="center" flexShrink="0">
                <Icon boxSize="8">
                  <LuPawPrint aria-hidden="true" />
                </Icon>
              </Flex>
              <Stack gap="1">
                <Heading asChild size="3xl">
                  <h1>{patient.name}</h1>
                </Heading>
                <Text color="fg.muted">
                  {patient.species}, {patient.breed} · {ageText(patient.born)} · {patient.sex}
                </Text>
                <HStack gap="2" wrap="wrap" mt="1">
                  <Badge variant="outline" size="md">
                    ID {patient.id}
                  </Badge>
                  {overdue.length > 0 && (
                    <Badge colorPalette="orange" variant="solid" size="md">
                      <LuSyringe aria-hidden="true" />
                      {overdue.length} vaccination{overdue.length === 1 ? "" : "s"} overdue
                    </Badge>
                  )}
                </HStack>
              </Stack>
            </HStack>
            <BookAppointmentButton patientId={patientId} label="Book follow-up" />
          </Flex>

          <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} gap="4" mt="6" pt="5" borderTopWidth="1px">
            <Detail label="Born">{formatDate(patient.born)}</Detail>
            <Detail label="Owner">{owner.name}</Detail>
            <Detail label="Owner phone">
              <Link href={`tel:${owner.phone.replace(/\s/g, "")}`} display="inline-flex" alignItems="center" gap="2" minH="8">
                <LuPhone aria-hidden="true" />
                {owner.phone}
              </Link>
            </Detail>
            <Detail label="Today">
              {todays.length === 0 ? (
                "No appointment"
              ) : (
                <Stack gap="1" as="span">
                  {todays.map((a) => (
                    <span key={a.id}>
                      {formatClock(a.start)} to {formatClock(endTime(a))}, {a.reason} ({STATUS_LABEL[a.status]})
                    </span>
                  ))}
                </Stack>
              )}
            </Detail>
          </SimpleGrid>
        </Card.Body>
      </Card.Root>

      {!record ? (
        <Card.Root>
          <Card.Body>
            <Heading size="lg">No clinical history on file</Heading>
            <Text color="fg.muted" mt="2">
              Weights, vaccinations, medications and visit notes for {patient.name} have not been entered yet.
            </Text>
          </Card.Body>
        </Card.Root>
      ) : (
        <Grid templateColumns={{ base: "1fr", xl: "minmax(0,1.3fr) minmax(0,1fr)" }} gap="6" alignItems="start">
          <Stack gap="6" minW="0">
            <Section id="weight-title" title="Weight trend">
              <WeightTrend points={record.weights_kg} />
            </Section>

            <Section id="visits-title" title="Visit history" badge={<Text color="fg.muted">{record.visits.length} visits</Text>}>
              <Box asChild listStyleType="none" m="0" p="0">
                <ol>
                  {record.visits.map((v, i) => (
                    <li key={v.date}>
                      <Stack gap="1.5" py="4" borderTopWidth={i === 0 ? "0" : "1px"}>
                        <HStack justify="space-between" align="start" gap="3" wrap="wrap">
                          <Text fontWeight="semibold" fontSize="lg">
                            {v.reason}
                          </Text>
                          <Text color="fg.muted" fontVariantNumeric="tabular-nums">
                            {formatDate(v.date)}
                          </Text>
                        </HStack>
                        <Text fontSize="sm" color="fg.muted">
                          {vetById(v.vet).name} · Invoice {formatMoney(v.invoice_usd)}
                        </Text>
                        <Text>{v.notes}</Text>
                      </Stack>
                    </li>
                  ))}
                </ol>
              </Box>
            </Section>
          </Stack>

          <Stack gap="6" minW="0">
            <Section
              id="vacc-title"
              title="Vaccinations"
              icon={<LuSyringe aria-hidden="true" />}
              badge={
                overdue.length > 0 ? (
                  <Badge colorPalette="red" variant="solid" size="md">
                    {overdue.length} overdue
                  </Badge>
                ) : (
                  <Badge colorPalette="green" variant="subtle" size="md">
                    All current
                  </Badge>
                )
              }
            >
              <Box asChild listStyleType="none" m="0" p="0">
                <ul>
                  {vaccines.map((v, i) => (
                    <li key={v.name}>
                      <Flex
                        justify="space-between"
                        align="center"
                        gap="3"
                        py="3"
                        px={v.state === "overdue" ? "3" : "0"}
                        mx={v.state === "overdue" ? "-3" : "0"}
                        rounded="lg"
                        bg={v.state === "overdue" ? "red.subtle" : "transparent"}
                        borderTopWidth={i === 0 || v.state === "overdue" ? "0" : "1px"}
                      >
                        <Box minW="0">
                          <Text fontWeight="semibold">{v.name}</Text>
                          <Text fontSize="sm" color="fg.muted">
                            Given {formatDate(v.given)} · Due {formatDate(v.due)}
                          </Text>
                        </Box>
                        {v.state === "overdue" ? (
                          <Badge colorPalette="red" variant="solid" size="md" flexShrink="0">
                            <LuTriangleAlert aria-hidden="true" />
                            Overdue {v.days} {v.days === 1 ? "day" : "days"}
                          </Badge>
                        ) : v.state === "soon" ? (
                          <Badge colorPalette="orange" variant="subtle" size="md" flexShrink="0">
                            Due in {v.days} days
                          </Badge>
                        ) : (
                          <Badge colorPalette="green" variant="subtle" size="md" flexShrink="0">
                            Current
                          </Badge>
                        )}
                      </Flex>
                    </li>
                  ))}
                </ul>
              </Box>
            </Section>

            <Section id="meds-title" title="Current medications" icon={<LuPill aria-hidden="true" />}>
              <Box asChild listStyleType="none" m="0" p="0">
                <ul>
                  {record.medications.map((m, i) => (
                    <li key={m.name}>
                      <Stack gap="0.5" py="3" borderTopWidth={i === 0 ? "0" : "1px"}>
                        <Text fontWeight="semibold">{m.name}</Text>
                        <Text>{m.dose}</Text>
                        <Text fontSize="sm" color="fg.muted">
                          Since {formatDate(m.since)} ({Math.round(daysBetween(m.since, "2026-11-12") / 30.4)} months)
                        </Text>
                      </Stack>
                    </li>
                  ))}
                </ul>
              </Box>
            </Section>
          </Stack>
        </Grid>
      )}
    </Stack>
  )
}
