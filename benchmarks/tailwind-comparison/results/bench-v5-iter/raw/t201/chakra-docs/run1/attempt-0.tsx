```tsx app/page.tsx
import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";
import { Schedule } from "@/components/schedule";

export const metadata: Metadata = { title: "Today’s schedule · Pawpoint" };

export default function Page() {
  return (
    <AppShell>
      <Schedule />
    </AppShell>
  );
}
```

```tsx app/patients/[id]/page.tsx
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
```

```tsx components/app-shell.tsx
import NextLink from "next/link";
import { Avatar, Box, Flex, HStack, Text } from "@chakra-ui/react";
import { ColorModeButton } from "@/components/ui/color-mode";
import { PatientSearch } from "@/components/patient-search";
import { CLINIC_NAME, USER } from "@/lib/data";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <Box minH="100dvh" bg="bg.subtle">
      <Box
        as="header"
        bg="bg.panel"
        borderBottomWidth="1px"
        borderColor="border"
        position="sticky"
        top="0"
        zIndex="sticky"
      >
        <Flex
          maxW="1400px"
          mx="auto"
          px={{ base: "4", md: "6" }}
          py="3"
          gap={{ base: "3", md: "6" }}
          align="center"
          wrap="wrap"
        >
          <NextLink href="/">
            <HStack gap="2.5">
              <Flex
                boxSize="9"
                rounded="lg"
                bg="teal.600"
                color="white"
                align="center"
                justify="center"
                fontWeight="bold"
                fontSize="lg"
                aria-hidden
              >
                P
              </Flex>
              <Box lineHeight="1.15">
                <Text fontWeight="bold" fontSize="lg">
                  Pawpoint
                </Text>
                <Text fontSize="xs" color="fg.muted">
                  {CLINIC_NAME}
                </Text>
              </Box>
            </HStack>
          </NextLink>

          <Box order={{ base: 3, md: 2 }} flex={{ base: "1 1 100%", md: "1 1 0" }} maxW={{ md: "28rem" }} mx={{ md: "auto" }}>
            <PatientSearch />
          </Box>

          <HStack order={{ base: 2, md: 3 }} gap="3" ms="auto">
            <Box textAlign="end" lineHeight="1.2" display={{ base: "none", sm: "block" }}>
              <Text fontSize="sm" fontWeight="semibold">
                {USER.name}
              </Text>
              <Text fontSize="xs" color="fg.muted">
                {USER.role}
              </Text>
            </Box>
            <Avatar.Root size="sm" colorPalette="teal">
              <Avatar.Fallback name={USER.name} />
            </Avatar.Root>
            <ColorModeButton />
          </HStack>
        </Flex>
      </Box>
      <Box as="main" maxW="1400px" mx="auto" px={{ base: "4", md: "6" }} py={{ base: "4", md: "6" }}>
        {children}
      </Box>
    </Box>
  );
}
```

```tsx components/booking-dialog.tsx
"use client";

import { useMemo, useState } from "react";
import { Box, Button, Stack, Text, Input, SimpleGrid } from "@chakra-ui/react";
import {
  DialogActionTrigger,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { NativeSelectField, NativeSelectRoot } from "@/components/ui/native-select";
import { AlertChips } from "@/components/patient-alerts";
import {
  type Appointment,
  fmtRange,
  fmtTime,
  fromMinutes,
  ownerById,
  patientById,
  patients,
  vetById,
  vets,
} from "@/lib/data";
import { findClash, slotsFor } from "@/lib/schedule";

const DURATIONS = [15, 20, 30, 45, 60, 90];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointments: Appointment[];
  now: number;
  onBook: (appt: Omit<Appointment, "id">) => void;
}

export function BookingDialog({ open, onOpenChange, appointments, now, onBook }: Props) {
  return (
    <DialogRoot
      open={open}
      onOpenChange={(e) => onOpenChange(e.open)}
      placement="center"
      scrollBehavior="inside"
      lazyMount
      unmountOnExit
    >
      <DialogContent mx="4">
        <BookingForm appointments={appointments} now={now} onBook={onBook} />
      </DialogContent>
    </DialogRoot>
  );
}

function BookingForm({
  appointments,
  now,
  onBook,
}: {
  appointments: Appointment[];
  now: number;
  onBook: Props["onBook"];
}) {
  const [patientId, setPatientId] = useState(patients[0].id);
  const [vetId, setVetId] = useState(vets[0].id);
  const [minutes, setMinutes] = useState(20);
  const [reason, setReason] = useState("Follow-up visit");
  const [start, setStart] = useState<number>(() => {
    const slots = slotsFor(20);
    return (
      slots.find((t) => t >= now && !findClash(appointments, vets[0].id, t, 20)) ??
      slots.find((t) => !findClash(appointments, vets[0].id, t, 20)) ??
      slots[0]
    );
  });

  const slots = useMemo(() => slotsFor(minutes), [minutes]);
  const startValue = slots.includes(start) ? start : slots[slots.length - 1];
  const clash = findClash(appointments, vetId, startValue, minutes);
  const patient = patientById(patientId);
  const vet = vetById(vetId);

  const nextFree = clash
    ? slots.find((t) => t > startValue && !findClash(appointments, vetId, t, minutes))
    : undefined;

  const timeItems = slots.map((t) => ({
    value: String(t),
    label: findClash(appointments, vetId, t, minutes) ? `${fmtTime(t)} · taken` : fmtTime(t),
  }));

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        if (clash) return;
        onBook({
          patient: patientId,
          vet: vetId,
          start: fromMinutes(startValue),
          minutes,
          reason: reason.trim() || "Follow-up visit",
          status: "booked",
        });
      }}
    >
      <DialogHeader>
        <DialogTitle>Book an appointment</DialogTitle>
      </DialogHeader>
      <DialogCloseTrigger />
      <DialogBody>
        <Stack gap="4">
          <Field label="Patient">
            <NativeSelectRoot>
              <NativeSelectField
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                items={patients.map((p) => ({
                  value: p.id,
                  label: `${p.name} (${p.species}) · ${ownerById(p.owner).name}`,
                }))}
              />
            </NativeSelectRoot>
          </Field>
          {patient && patient.alerts.length > 0 && <AlertChips alerts={patient.alerts} />}

          <Field label="Vet">
            <NativeSelectRoot>
              <NativeSelectField
                value={vetId}
                onChange={(e) => setVetId(e.target.value)}
                items={vets.map((v) => ({ value: v.id, label: `${v.name} · ${v.room}` }))}
              />
            </NativeSelectRoot>
          </Field>

          <SimpleGrid columns={2} gap="3">
            <Field
              label="Time"
              invalid={Boolean(clash)}
              errorText={
                clash
                  ? `${vet.name} already has ${patientById(clash.patient)?.name ?? "a patient"} (${clash.reason}) booked ${fmtRange(clash.start, clash.minutes)}.`
                  : undefined
              }
            >
              <NativeSelectRoot>
                <NativeSelectField
                  value={String(startValue)}
                  onChange={(e) => setStart(Number(e.target.value))}
                  items={timeItems}
                />
              </NativeSelectRoot>
            </Field>
            <Field label="Length">
              <NativeSelectRoot>
                <NativeSelectField
                  value={String(minutes)}
                  onChange={(e) => setMinutes(Number(e.target.value))}
                  items={DURATIONS.map((d) => ({ value: String(d), label: `${d} min` }))}
                />
              </NativeSelectRoot>
            </Field>
          </SimpleGrid>

          {clash && (
            <Box role="alert" bg="bg.error" color="fg.error" rounded="md" p="3" fontSize="sm">
              That slot clashes with an existing booking.{" "}
              {nextFree !== undefined ? (
                <>
                  Next free time for {vet.short}: <strong>{fmtTime(nextFree)}</strong>.{" "}
                  <Button
                    type="button"
                    size="xs"
                    variant="outline"
                    colorPalette="red"
                    onClick={() => setStart(nextFree)}
                  >
                    Use {fmtTime(nextFree)}
                  </Button>
                </>
              ) : (
                <>Pick another time or another vet.</>
              )}
            </Box>
          )}

          <Field label="Reason for visit">
            <Input value={reason} onChange={(e) => setReason(e.target.value)} />
          </Field>

          <Text fontSize="sm" color="fg.muted" aria-live="polite">
            {clash
              ? "Choose a free time to book."
              : `${patient?.name} with ${vet.name}, ${fmtRange(fromMinutes(startValue), minutes)}.`}
          </Text>
        </Stack>
      </DialogBody>
      <DialogFooter>
        <DialogActionTrigger asChild>
          <Button type="button" variant="outline">
            Cancel
          </Button>
        </DialogActionTrigger>
        <Button type="submit" colorPalette="teal" disabled={Boolean(clash)}>
          Book appointment
        </Button>
      </DialogFooter>
    </form>
  );
}
```

```tsx components/patient-alerts.tsx
import { Box, Flex, HStack, Icon, Text } from "@chakra-ui/react";
import { FiAlertTriangle } from "react-icons/fi";

/** Compact alert chips: solid red so they read at a glance in lists and cards. */
export function AlertChips({ alerts }: { alerts: string[] }) {
  if (alerts.length === 0) return null;
  return (
    <Flex as="ul" listStyleType="none" m="0" p="0" gap="1.5" wrap="wrap" aria-label="Medical alerts">
      {alerts.map((alert) => (
        <HStack
          as="li"
          key={alert}
          gap="1.5"
          bg="red.600"
          color="white"
          _dark={{ bg: "red.500" }}
          px="2"
          py="0.5"
          rounded="md"
          fontSize="xs"
          fontWeight="semibold"
          lineHeight="1.3"
          alignItems="flex-start"
        >
          <Icon boxSize="3.5" mt="0.5" flexShrink={0} aria-hidden>
            <FiAlertTriangle />
          </Icon>
          <span>
            <Box as="span" srOnly>
              Alert:{" "}
            </Box>
            {alert}
          </span>
        </HStack>
      ))}
    </Flex>
  );
}

/** Large banner for the top of a record. */
export function AlertBanner({ alerts, extra = [] }: { alerts: string[]; extra?: string[] }) {
  const all = [...alerts, ...extra];
  if (all.length === 0) return null;
  return (
    <Box
      role="region"
      aria-label="Medical alerts"
      bg="red.600"
      color="white"
      _dark={{ bg: "red.700" }}
      rounded="lg"
      p={{ base: "3", md: "4" }}
      borderWidth="1px"
      borderColor="red.700"
    >
      <HStack gap="2" mb="2">
        <Icon boxSize="5" aria-hidden>
          <FiAlertTriangle />
        </Icon>
        <Text fontWeight="bold" fontSize="sm" letterSpacing="0.08em" textTransform="uppercase">
          Medical alerts
        </Text>
      </HStack>
      <Flex as="ul" listStyleType="none" m="0" p="0" gap="2" wrap="wrap">
        {all.map((alert) => (
          <Box
            as="li"
            key={alert}
            bg="white"
            color="red.700"
            px="3"
            py="1.5"
            rounded="md"
            fontWeight="bold"
            fontSize={{ base: "md", md: "lg" }}
          >
            {alert}
          </Box>
        ))}
      </Flex>
    </Box>
  );
}
```

```tsx components/patient-search.tsx
"use client";

import { useId, useMemo, useRef, useState } from "react";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { Box, Flex, HStack, Icon, Input, Text } from "@chakra-ui/react";
import { FiSearch } from "react-icons/fi";
import { AlertChips } from "@/components/patient-alerts";
import { ownerById, patients } from "@/lib/data";

export function PatientSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  const q = query.trim().toLowerCase();
  const results = useMemo(() => {
    if (!q) return [];
    return patients.filter((p) => {
      const owner = ownerById(p.owner);
      return p.name.toLowerCase().includes(q) || owner.name.toLowerCase().includes(q);
    });
  }, [q]);

  const showPanel = open && q.length > 0;

  function close() {
    setOpen(false);
  }

  return (
    <Box
      ref={wrapRef}
      position="relative"
      w="full"
      onBlur={(e) => {
        if (!wrapRef.current?.contains(e.relatedTarget as Node | null)) close();
      }}
    >
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          if (results[0]) {
            close();
            setQuery("");
            router.push(`/patients/${results[0].id}`);
          }
        }}
      >
        <Box position="relative">
          <Icon
            position="absolute"
            left="3"
            top="50%"
            transform="translateY(-50%)"
            color="fg.muted"
            boxSize="4"
            aria-hidden
            pointerEvents="none"
            zIndex="1"
          >
            <FiSearch />
          </Icon>
          <Input
            type="search"
            aria-label="Search patient or owner by name"
            placeholder="Search patient or owner"
            value={query}
            ps="9"
            size="md"
            bg="bg.panel"
            autoComplete="off"
            aria-controls={showPanel ? listId : undefined}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={(e) => {
              if (e.key === "Escape") close();
            }}
          />
        </Box>
      </form>

      {showPanel && (
        <Box
          id={listId}
          position="absolute"
          top="calc(100% + 6px)"
          left="0"
          right="0"
          zIndex="dropdown"
          bg="bg.panel"
          borderWidth="1px"
          borderColor="border"
          rounded="lg"
          shadow="lg"
          maxH="22rem"
          overflowY="auto"
          p="1"
        >
          <Text srOnly aria-live="polite">
            {results.length} {results.length === 1 ? "result" : "results"}
          </Text>
          {results.length === 0 ? (
            <Text p="3" color="fg.muted" fontSize="sm">
              No patient or owner matches “{query.trim()}”.
            </Text>
          ) : (
            <Box as="ul" listStyleType="none" m="0" p="0">
              {results.map((p) => {
                const owner = ownerById(p.owner);
                return (
                  <li key={p.id}>
                    <Flex
                      asChild
                      direction="column"
                      gap="1"
                      p="2.5"
                      rounded="md"
                      _hover={{ bg: "bg.muted" }}
                      _focusVisible={{ outline: "2px solid", outlineColor: "teal.focusRing" }}
                    >
                      <NextLink
                        href={`/patients/${p.id}`}
                        onClick={() => {
                          close();
                          setQuery("");
                        }}
                      >
                        <HStack justify="space-between" gap="3" wrap="wrap">
                          <Text fontWeight="semibold">{p.name}</Text>
                          <Text fontSize="sm" color="fg.muted">
                            {p.species} · {p.breed}
                          </Text>
                        </HStack>
                        <Text fontSize="sm" color="fg.muted">
                          Owner: {owner.name} · {owner.phone}
                        </Text>
                        <AlertChips alerts={p.alerts} />
                      </NextLink>
                    </Flex>
                  </li>
                );
              })}
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}
```

```tsx components/schedule.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import NextLink from "next/link";
import {
  Badge,
  Box,
  Button,
  Flex,
  Grid,
  GridItem,
  Heading,
  HStack,
  Icon,
  SimpleGrid,
  Text,
} from "@chakra-ui/react";
import { FiAlertCircle, FiCheck, FiClock, FiPlus } from "react-icons/fi";
import { toaster } from "@/components/ui/toaster";
import { BookingDialog } from "@/components/booking-dialog";
import { AlertChips } from "@/components/patient-alerts";
import {
  type Appointment,
  NOW_START,
  STATUS_LABEL,
  type Status,
  TODAY,
  fmtDate,
  fmtRange,
  fmtTime,
  initialAppointments,
  ownerById,
  patientById,
  vetById,
  vets,
} from "@/lib/data";
import { sortAppointments } from "@/lib/schedule";

const STATUS_PALETTE: Record<Status, string> = {
  booked: "gray",
  checked_in: "orange",
  in_exam: "purple",
  done: "green",
  cancelled: "gray",
};

const COLUMNS = {
  base: "1fr",
  md: "92px minmax(0,1.2fr) minmax(0,1.2fr) 150px",
  lg: "100px minmax(0,1.35fr) minmax(0,1fr) minmax(0,1.3fr) minmax(0,1fr) 112px 128px",
};

const AREAS = {
  base: '"time status" "patient patient" "reason reason" "owner owner" "vet vet" "action action"',
  md: '"time patient reason status" "time owner vet action"',
  lg: '"time patient owner reason vet status action"',
};

function StatusBadge({ status }: { status: Status }) {
  return (
    <Badge
      colorPalette={STATUS_PALETTE[status]}
      variant={status === "cancelled" ? "outline" : "subtle"}
      size="md"
      whiteSpace="nowrap"
      fontWeight="semibold"
    >
      {STATUS_LABEL[status]}
    </Badge>
  );
}

function waitText(minutes: number): string {
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min`;
  return `${Math.floor(minutes / 60)} h ${minutes % 60} min`;
}

export function Schedule() {
  const [appts, setAppts] = useState<Appointment[]>(initialAppointments);
  const [now, setNow] = useState(NOW_START);
  const [vetFilter, setVetFilter] = useState<string>("all");
  const [bookingOpen, setBookingOpen] = useState(false);
  const [highlight, setHighlight] = useState<string | null>(null);

  useEffect(() => {
    const t = window.setInterval(() => setNow((n) => n + 1), 60_000);
    return () => window.clearInterval(t);
  }, []);

  function update(id: string, patch: Partial<Appointment>) {
    setAppts((list) => list.map((a) => (a.id === id ? { ...a, ...patch } : a)));
  }

  function checkIn(a: Appointment) {
    update(a.id, { status: "checked_in", checkedInAt: now });
    const p = patientById(a.patient);
    toaster.create({
      type: "success",
      title: `${p?.name ?? "Patient"} checked in`,
      description: p && p.alerts.length > 0 ? `Alert: ${p.alerts.join("; ")}` : `Waiting for ${vetById(a.vet).short}.`,
    });
  }

  function book(draft: Omit<Appointment, "id">) {
    const id = `a-${String(appts.length + 1).padStart(2, "0")}`;
    setAppts((list) => [...list, { ...draft, id }]);
    setBookingOpen(false);
    setHighlight(id);
    const p = patientById(draft.patient);
    toaster.create({
      type: "success",
      title: "Appointment booked",
      description: `${p?.name ?? "Patient"} with ${vetById(draft.vet).name}, ${fmtRange(draft.start, draft.minutes)}.`,
    });
  }

  const sorted = useMemo(() => sortAppointments(appts), [appts]);
  const visible = sorted.filter((a) => vetFilter === "all" || a.vet === vetFilter);
  const waiting = useMemo(
    () =>
      appts
        .filter((a) => a.status === "checked_in")
        .sort((a, b) => (a.checkedInAt ?? 0) - (b.checkedInAt ?? 0)),
    [appts],
  );

  const count = (s: Status) => appts.filter((a) => a.status === s).length;

  return (
    <Flex direction="column" gap={{ base: "5", md: "6" }}>
      <Flex justify="space-between" align={{ base: "stretch", sm: "flex-end" }} gap="4" wrap="wrap" direction={{ base: "column", sm: "row" }}>
        <Box>
          <Text color="fg.muted" fontSize="sm">
            {fmtDate(TODAY)} · Thursday · {fmtTime(now)}
          </Text>
          <Heading as="h1" size="2xl">
            Today’s schedule
          </Heading>
        </Box>
        <Button colorPalette="teal" size="lg" onClick={() => setBookingOpen(true)}>
          <FiPlus /> Book appointment
        </Button>
      </Flex>

      <SimpleGrid columns={{ base: 2, md: 4 }} gap="3" aria-label="Today at a glance" role="list">
        <Tally label="Waiting" value={count("checked_in")} palette="orange" />
        <Tally label="In exam" value={count("in_exam")} palette="purple" />
        <Tally label="Still to arrive" value={count("booked")} palette="blue" />
        <Tally label="Done" value={count("done")} palette="green" />
      </SimpleGrid>

      <Box as="section" aria-labelledby="waiting-heading">
        <HStack mb="3" gap="2">
          <Icon color="orange.fg" aria-hidden>
            <FiClock />
          </Icon>
          <Heading as="h2" size="lg" id="waiting-heading">
            Waiting room
          </Heading>
          <Badge bg="orange.700" color="white" size="md">
            {waiting.length}
          </Badge>
        </HStack>
        {waiting.length === 0 ? (
          <Box bg="bg.panel" borderWidth="1px" borderStyle="dashed" borderColor="border" rounded="lg" p="5" color="fg.muted">
            Nobody is waiting. Check in a booked patient from the schedule below.
          </Box>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} gap="3" as="ol" listStyleType="none" m="0" p="0">
            {waiting.map((a, i) => {
              const p = patientById(a.patient);
              const owner = p ? ownerById(p.owner) : undefined;
              const vet = vetById(a.vet);
              const waited = Math.max(0, now - (a.checkedInAt ?? now));
              const late = waited >= 30;
              return (
                <Box
                  as="li"
                  key={a.id}
                  bg="bg.panel"
                  borderWidth="1px"
                  borderColor={i === 0 ? "orange.solid" : "border"}
                  borderTopWidth={i === 0 ? "4px" : "1px"}
                  rounded="lg"
                  p="4"
                >
                  <Flex justify="space-between" align="flex-start" gap="3">
                    <Box minW="0">
                      {i === 0 && (
                        <Badge bg="orange.700" color="white" mb="1">
                          Next up
                        </Badge>
                      )}
                      <Text fontWeight="bold" fontSize="lg" lineHeight="1.2">
                        <PatientLink id={a.patient} />
                      </Text>
                      <Text fontSize="sm" color="fg.muted">
                        {p?.species} · {owner?.name}
                      </Text>
                    </Box>
                    <Box textAlign="end" flexShrink={0}>
                      <Text
                        fontWeight="bold"
                        fontSize="xl"
                        lineHeight="1.1"
                        color={late ? "red.fg" : "fg"}
                        style={{ fontVariantNumeric: "tabular-nums" }}
                      >
                        {waitText(waited)}
                      </Text>
                      <Text fontSize="xs" color="fg.muted">
                        waiting
                      </Text>
                    </Box>
                  </Flex>
                  {p && p.alerts.length > 0 && (
                    <Box mt="3">
                      <AlertChips alerts={p.alerts} />
                    </Box>
                  )}
                  <Text mt="3" fontSize="sm">
                    {a.reason}
                  </Text>
                  <Text fontSize="sm" color="fg.muted">
                    {vet.name} · {vet.room} · booked {fmtTime(a.start)}
                  </Text>
                  <Button
                    mt="3"
                    size="sm"
                    variant="outline"
                    colorPalette="purple"
                    onClick={() => update(a.id, { status: "in_exam" })}
                    aria-label={`Start exam for ${p?.name}`}
                  >
                    Start exam
                  </Button>
                </Box>
              );
            })}
          </SimpleGrid>
        )}
      </Box>

      <Box as="section" aria-labelledby="schedule-heading">
        <Flex justify="space-between" align={{ base: "flex-start", md: "center" }} gap="3" mb="3" wrap="wrap" direction={{ base: "column", md: "row" }}>
          <Heading as="h2" size="lg" id="schedule-heading">
            All appointments
          </Heading>
          <Flex gap="2" wrap="wrap" role="group" aria-label="Filter by vet">
            <FilterButton active={vetFilter === "all"} onClick={() => setVetFilter("all")}>
              All vets
            </FilterButton>
            {vets.map((v) => (
              <FilterButton key={v.id} active={vetFilter === v.id} onClick={() => setVetFilter(v.id)}>
                {v.short}
                <Text as="span" color="fg.muted" fontWeight="normal" display={{ base: "none", sm: "inline" }}>
                  {" "}
                  · {v.room}
                </Text>
              </FilterButton>
            ))}
          </Flex>
        </Flex>

        <Grid
          display={{ base: "none", lg: "grid" }}
          templateColumns={COLUMNS.lg}
          gap="3"
          px="4"
          pb="2"
          color="fg.muted"
          fontSize="xs"
          fontWeight="semibold"
          textTransform="uppercase"
          letterSpacing="0.06em"
          aria-hidden
        >
          <Text>Time</Text>
          <Text>Patient</Text>
          <Text>Owner</Text>
          <Text>Reason</Text>
          <Text>Vet</Text>
          <Text>Status</Text>
          <Text />
        </Grid>

        <Flex as="ul" direction="column" gap="2" listStyleType="none" m="0" p="0">
          {visible.map((a) => {
            const p = patientById(a.patient);
            const owner = p ? ownerById(p.owner) : undefined;
            const vet = vetById(a.vet);
            const inactive = a.status === "cancelled";
            const finished = a.status === "done";
            return (
              <Box
                as="li"
                key={a.id}
                bg={a.urgent && !finished && !inactive ? "red.subtle" : "bg.panel"}
                borderWidth="1px"
                borderColor={highlight === a.id ? "teal.solid" : a.urgent ? "red.muted" : "border"}
                borderStartWidth="4px"
                borderStartColor={
                  a.urgent && !inactive ? "red.solid" : a.status === "in_exam" ? "purple.solid" : a.status === "checked_in" ? "orange.solid" : "transparent"
                }
                outline={highlight === a.id ? "2px solid" : undefined}
                outlineColor="teal.solid"
                rounded="lg"
                px="4"
                py="3"
                data-status={a.status}
              >
                <Grid
                  templateColumns={COLUMNS}
                  templateAreas={AREAS}
                  columnGap="3"
                  rowGap="1.5"
                  alignItems="start"
                >
                  <GridItem area="time">
                    <Text fontWeight="bold" whiteSpace="nowrap" style={{ fontVariantNumeric: "tabular-nums" }} textDecoration={inactive ? "line-through" : undefined}>
                      {fmtTime(a.start)}
                    </Text>
                    <Text fontSize="xs" color="fg.muted" whiteSpace="nowrap">
                      {a.minutes} min
                    </Text>
                  </GridItem>

                  <GridItem area="patient" minW="0">
                    <HStack gap="2" wrap="wrap">
                      <Text fontWeight="semibold" fontSize="md">
                        <PatientLink id={a.patient} />
                      </Text>
                      <Text as="span" fontSize="sm" color="fg.muted">
                        {p?.species}
                      </Text>
                      {a.urgent && (
                        <Badge colorPalette="red" variant="solid" size="md">
                          <FiAlertCircle /> Urgent
                        </Badge>
                      )}
                    </HStack>
                    {p && p.alerts.length > 0 && (
                      <Box mt="1.5">
                        <AlertChips alerts={p.alerts} />
                      </Box>
                    )}
                  </GridItem>

                  <GridItem area="owner" minW="0">
                    <Text fontSize="sm">{owner?.name}</Text>
                    <Text fontSize="xs" color="fg.muted">
                      {owner?.phone}
                    </Text>
                  </GridItem>

                  <GridItem area="reason" minW="0">
                    <Text fontSize="sm" fontWeight={a.urgent ? "semibold" : "normal"}>
                      {a.reason}
                    </Text>
                  </GridItem>

                  <GridItem area="vet" minW="0">
                    <Text fontSize="sm">{vet.name}</Text>
                    <Text fontSize="xs" color="fg.muted">
                      {vet.room}
                    </Text>
                  </GridItem>

                  <GridItem area="status" justifySelf={{ base: "end", md: "start" }}>
                    <StatusBadge status={a.status} />
                  </GridItem>

                  <GridItem area="action" justifySelf={{ base: "stretch", md: "start" }}>
                    {a.status === "booked" && (
                      <Button
                        size="sm"
                        colorPalette="teal"
                        w={{ base: "full", md: "auto" }}
                        onClick={() => checkIn(a)}
                        aria-label={`Check in ${p?.name}`}
                      >
                        <FiCheck /> Check in
                      </Button>
                    )}
                    {a.status === "checked_in" && (
                      <Button
                        size="sm"
                        variant="outline"
                        colorPalette="purple"
                        w={{ base: "full", md: "auto" }}
                        onClick={() => update(a.id, { status: "in_exam" })}
                        aria-label={`Start exam for ${p?.name}`}
                      >
                        Start exam
                      </Button>
                    )}
                    {a.status === "in_exam" && (
                      <Button
                        size="sm"
                        variant="outline"
                        w={{ base: "full", md: "auto" }}
                        onClick={() => update(a.id, { status: "done" })}
                        aria-label={`Mark done: ${p?.name}`}
                      >
                        Mark done
                      </Button>
                    )}
                  </GridItem>
                </Grid>
              </Box>
            );
          })}
          {visible.length === 0 && (
            <Box as="li" bg="bg.panel" rounded="lg" p="5" color="fg.muted">
              No appointments for this vet today.
            </Box>
          )}
        </Flex>
      </Box>

      <BookingDialog
        open={bookingOpen}
        onOpenChange={setBookingOpen}
        appointments={appts}
        now={now}
        onBook={book}
      />
    </Flex>
  );
}

function PatientLink({ id }: { id: string }) {
  const p = patientById(id);
  return (
    <NextLink
      href={`/patients/${id}`}
      style={{ textDecoration: "underline", textDecorationColor: "var(--chakra-colors-border-emphasized)", textUnderlineOffset: "3px" }}
    >
      {p?.name ?? id}
    </NextLink>
  );
}

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Button
      size="sm"
      variant={active ? "solid" : "outline"}
      colorPalette={active ? "teal" : "gray"}
      aria-pressed={active}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}

function Tally({ label, value, palette }: { label: string; value: number; palette: string }) {
  return (
    <Box
      role="listitem"
      bg="bg.panel"
      borderWidth="1px"
      borderColor="border"
      borderTopWidth="3px"
      borderTopColor={`${palette}.solid`}
      rounded="lg"
      px="4"
      py="3"
    >
      <Text fontSize="sm" color="fg.muted">
        {label}
      </Text>
      <Text fontSize="3xl" fontWeight="bold" lineHeight="1.1" style={{ fontVariantNumeric: "tabular-nums" }}>
        {value}
      </Text>
    </Box>
  );
}
```

```tsx components/weight-chart.tsx
"use client";

import { Chart, useChart } from "@chakra-ui/charts";
import { Box, VisuallyHidden } from "@chakra-ui/react";
import { CartesianGrid, Line, LineChart, Tooltip, XAxis, YAxis } from "recharts";
import { fmtDate, fmtShortDate } from "@/lib/data";

export function WeightChart({ weights }: { weights: { date: string; kg: number }[] }) {
  const chart = useChart({
    data: weights.map((w) => ({ label: fmtShortDate(w.date), kg: w.kg })),
    series: [{ name: "kg", color: "teal.solid" }],
  });

  const min = Math.floor(Math.min(...weights.map((w) => w.kg)) - 1);
  const max = Math.ceil(Math.max(...weights.map((w) => w.kg)) + 1);

  return (
    <Box>
      <VisuallyHidden>
        Weight readings:{" "}
        {weights.map((w) => `${fmtDate(w.date)}, ${w.kg} kilograms`).join("; ")}.
      </VisuallyHidden>
      <Chart.Root chart={chart} h="220px" w="full" aria-hidden>
        <LineChart data={chart.data} responsive margin={{ left: 0, right: 12, top: 8, bottom: 0 }}>
          <CartesianGrid stroke={chart.color("border")} vertical={false} />
          <XAxis axisLine={false} dataKey={chart.key("label")} stroke={chart.color("border")} tick={{ fill: chart.color("fg.muted"), fontSize: 12 }} />
          <YAxis
            axisLine={false}
            tickLine={false}
            tickMargin={8}
            width={40}
            domain={[min, max]}
            tickFormatter={(v: number) => `${v}`}
            stroke={chart.color("border")}
            tick={{ fill: chart.color("fg.muted"), fontSize: 12 }}
          />
          <Tooltip
            animationDuration={100}
            cursor={false}
            content={<Chart.Tooltip />}
          />
          {chart.series.map((item) => (
            <Line
              key={item.name}
              isAnimationActive={false}
              dataKey={chart.key(item.name)}
              stroke={chart.color(item.color)}
              strokeWidth={3}
              dot={{ r: 4, fill: chart.color(item.color) }}
              activeDot={{ r: 6 }}
            />
          ))}
        </LineChart>
      </Chart.Root>
    </Box>
  );
}
```

```ts lib/data.ts
export const CLINIC_NAME = "Hillside Veterinary Clinic";
export const TODAY = "2026-11-12";
/** The simulated "current time" at the counter, in minutes after midnight (9:55 AM). */
export const NOW_START = 9 * 60 + 55;

export const USER = { name: "Rosa Lindqvist", role: "Receptionist" };

export type Status = "booked" | "checked_in" | "in_exam" | "done" | "cancelled";

export interface Vet {
  id: string;
  name: string;
  short: string;
  room: string;
}

export interface Owner {
  id: string;
  name: string;
  phone: string;
}

export interface Patient {
  id: string;
  name: string;
  species: string;
  breed: string;
  born: string;
  sex: string;
  owner: string;
  alerts: string[];
}

export interface Appointment {
  id: string;
  patient: string;
  vet: string;
  /** "HH:MM", 24 hour clock */
  start: string;
  minutes: number;
  reason: string;
  status: Status;
  urgent?: boolean;
  /** minutes after midnight at which the patient was checked in */
  checkedInAt?: number;
}

export interface Visit {
  date: string;
  vet: string;
  reason: string;
  notes: string;
  invoice_usd: number;
}

export interface PatientRecord {
  weights_kg: { date: string; kg: number }[];
  vaccinations: { name: string; given: string; due: string }[];
  medications: { name: string; dose: string; since: string }[];
  visits: Visit[];
}

export const vets: Vet[] = [
  { id: "v-1", name: "Dr. Amara Osei", short: "Dr. Osei", room: "Exam 1" },
  { id: "v-2", name: "Dr. Tomás Reyes", short: "Dr. Reyes", room: "Exam 2" },
  { id: "v-3", name: "Dr. Helen Park", short: "Dr. Park", room: "Surgery" },
];

export const owners: Owner[] = [
  { id: "o-1", name: "Daniel Kim", phone: "+1 555 0142" },
  { id: "o-2", name: "Priya Natarajan", phone: "+1 555 0178" },
  { id: "o-3", name: "Lucas Moreau", phone: "+1 555 0119" },
  { id: "o-4", name: "Grace Whitfield", phone: "+1 555 0163" },
  { id: "o-5", name: "Sam Oduya", phone: "+1 555 0190" },
  { id: "o-6", name: "Elena Rossi", phone: "+1 555 0105" },
];

export const patients: Patient[] = [
  { id: "p-101", name: "Biscuit", species: "Dog", breed: "Beagle", born: "2019-04-02", sex: "Male, neutered", owner: "o-1", alerts: [] },
  { id: "p-102", name: "Mochi", species: "Cat", breed: "Domestic shorthair", born: "2021-07-15", sex: "Female, spayed", owner: "o-2", alerts: ["Bites when restrained"] },
  { id: "p-103", name: "Pepper", species: "Dog", breed: "Border collie", born: "2016-01-20", sex: "Female, spayed", owner: "o-3", alerts: [] },
  { id: "p-104", name: "Olive", species: "Dog", breed: "Labrador retriever", born: "2014-09-08", sex: "Female, spayed", owner: "o-4", alerts: ["Penicillin allergy", "Chronic kidney disease, stage 2"] },
  { id: "p-105", name: "Kiwi", species: "Bird", breed: "Budgerigar", born: "2023-03-11", sex: "Male", owner: "o-5", alerts: [] },
  { id: "p-106", name: "Tofu", species: "Rabbit", breed: "Holland lop", born: "2022-05-30", sex: "Female", owner: "o-6", alerts: [] },
  { id: "p-107", name: "Ziggy", species: "Cat", breed: "Maine coon", born: "2018-11-02", sex: "Male, neutered", owner: "o-2", alerts: ["Diabetic: insulin twice daily"] },
  { id: "p-108", name: "Bruno", species: "Dog", breed: "French bulldog", born: "2022-02-14", sex: "Male", owner: "o-5", alerts: ["Brachycephalic: sedation risk"] },
];

export const initialAppointments: Appointment[] = [
  { id: "a-01", patient: "p-101", vet: "v-1", start: "08:30", minutes: 20, reason: "Annual vaccination", status: "done" },
  { id: "a-02", patient: "p-104", vet: "v-2", start: "08:30", minutes: 30, reason: "Kidney panel recheck", status: "done" },
  { id: "a-03", patient: "p-108", vet: "v-3", start: "08:00", minutes: 120, reason: "Soft palate surgery", status: "in_exam" },
  { id: "a-04", patient: "p-102", vet: "v-1", start: "09:00", minutes: 30, reason: "Limping, left hind leg", status: "in_exam" },
  { id: "a-05", patient: "p-107", vet: "v-2", start: "09:15", minutes: 20, reason: "Glucose curve", status: "checked_in", checkedInAt: 9 * 60 + 8 },
  { id: "a-06", patient: "p-105", vet: "v-1", start: "09:45", minutes: 20, reason: "Beak and nail trim", status: "checked_in", checkedInAt: 9 * 60 + 41 },
  { id: "a-07", patient: "p-103", vet: "v-2", start: "10:00", minutes: 30, reason: "Senior wellness exam", status: "booked" },
  { id: "a-08", patient: "p-106", vet: "v-1", start: "10:30", minutes: 20, reason: "Not eating since yesterday", status: "booked", urgent: true },
  { id: "a-09", patient: "p-104", vet: "v-3", start: "11:00", minutes: 45, reason: "Dental cleaning", status: "booked" },
  { id: "a-10", patient: "p-101", vet: "v-2", start: "11:30", minutes: 20, reason: "Ear infection follow-up", status: "booked" },
  { id: "a-11", patient: "p-107", vet: "v-1", start: "13:30", minutes: 30, reason: "Dental check", status: "booked" },
  { id: "a-12", patient: "p-103", vet: "v-3", start: "14:00", minutes: 60, reason: "Lump removal", status: "cancelled" },
  { id: "a-13", patient: "p-102", vet: "v-2", start: "15:00", minutes: 20, reason: "X-ray results", status: "booked" },
];

export const records: Record<string, PatientRecord> = {
  "p-104": {
    weights_kg: [
      { date: "2025-05-14", kg: 31.8 },
      { date: "2025-08-20", kg: 31.1 },
      { date: "2025-11-03", kg: 30.4 },
      { date: "2026-02-11", kg: 29.9 },
      { date: "2026-06-17", kg: 29.2 },
      { date: "2026-11-12", kg: 28.6 },
    ],
    vaccinations: [
      { name: "Rabies", given: "2024-10-02", due: "2027-10-02" },
      { name: "DHPP", given: "2025-10-15", due: "2026-10-15" },
      { name: "Leptospirosis", given: "2025-10-15", due: "2026-10-15" },
      { name: "Bordetella", given: "2026-04-08", due: "2027-04-08" },
    ],
    medications: [
      { name: "Benazepril 5 mg", dose: "1 tablet daily", since: "2025-08-20" },
      { name: "Renal diet (dry)", dose: "2.5 cups daily", since: "2025-08-20" },
    ],
    visits: [
      { date: "2026-11-12", vet: "v-2", reason: "Kidney panel recheck", notes: "Creatinine 2.1 mg/dL (was 2.0). Weight down 0.6 kg. Continue benazepril, recheck in 3 months.", invoice_usd: 186.0 },
      { date: "2026-06-17", vet: "v-2", reason: "Kidney panel recheck", notes: "Stable. Appetite good. Owner reports more drinking in hot weather.", invoice_usd: 172.5 },
      { date: "2026-02-11", vet: "v-1", reason: "Coughing", notes: "Mild kennel cough. Supportive care; no antibiotics given (penicillin allergy).", invoice_usd: 94.0 },
      { date: "2025-11-03", vet: "v-2", reason: "Senior wellness exam", notes: "Grade 2 dental tartar. Dental cleaning recommended.", invoice_usd: 148.0 },
    ],
  },
};

/* ---------- helpers ---------- */

export const vetById = (id: string): Vet => vets.find((v) => v.id === id) ?? vets[0];
export const ownerById = (id: string): Owner => owners.find((o) => o.id === id) ?? owners[0];
export const patientById = (id: string): Patient | undefined => patients.find((p) => p.id === id);

export function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

export function fromMinutes(total: number): string {
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** "13:30" or 810 -> "1:30 PM" */
export function fmtTime(value: string | number): string {
  const total = typeof value === "number" ? value : toMinutes(value);
  const h = Math.floor(total / 60);
  const m = total % 60;
  const suffix = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${suffix}`;
}

export function fmtRange(start: string, minutes: number): string {
  const s = toMinutes(start);
  return `${fmtTime(s)} – ${fmtTime(s + minutes)}`;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function parts(iso: string): [number, number, number] {
  const [y, m, d] = iso.split("-").map(Number);
  return [y, m, d];
}

export function fmtDate(iso: string): string {
  const [y, m, d] = parts(iso);
  return `${MONTHS[m - 1]} ${d}, ${y}`;
}

export function fmtShortDate(iso: string): string {
  const [y, m] = parts(iso);
  return `${MONTHS[m - 1]} ’${String(y).slice(2)}`;
}

export function daysBetween(fromIso: string, toIso: string): number {
  const [fy, fm, fd] = parts(fromIso);
  const [ty, tm, td] = parts(toIso);
  return Math.round((Date.UTC(ty, tm - 1, td) - Date.UTC(fy, fm - 1, fd)) / 86400000);
}

export function ageOf(born: string, today: string = TODAY): string {
  const [by, bm, bd] = parts(born);
  const [ty, tm, td] = parts(today);
  let months = (ty - by) * 12 + (tm - bm);
  if (td < bd) months -= 1;
  const years = Math.floor(months / 12);
  const rest = months % 12;
  if (years === 0) return `${rest} mo`;
  if (years >= 8 || rest === 0) return `${years} yr`;
  return `${years} yr ${rest} mo`;
}

export function fmtMoney(n: number): string {
  return `$${n.toFixed(2)}`;
}

export type VaccineState =
  | { kind: "overdue"; days: number }
  | { kind: "soon"; days: number }
  | { kind: "current"; days: number };

export function vaccineState(due: string, today: string = TODAY): VaccineState {
  const days = daysBetween(today, due);
  if (days < 0) return { kind: "overdue", days: -days };
  if (days <= 60) return { kind: "soon", days };
  return { kind: "current", days };
}

export const STATUS_LABEL: Record<Status, string> = {
  booked: "Booked",
  checked_in: "Checked in",
  in_exam: "In exam",
  done: "Done",
  cancelled: "Cancelled",
};
```

```ts lib/schedule.ts
import { type Appointment, toMinutes } from "@/lib/data";

export const DAY_START = 8 * 60;
export const DAY_END = 17 * 60;
export const SLOT_STEP = 15;

/** The existing (not cancelled) booking that overlaps the given window for a vet, if any. */
export function findClash(
  appointments: Appointment[],
  vetId: string,
  start: number,
  minutes: number,
): Appointment | undefined {
  const end = start + minutes;
  return appointments.find((a) => {
    if (a.vet !== vetId || a.status === "cancelled") return false;
    const aStart = toMinutes(a.start);
    const aEnd = aStart + a.minutes;
    return start < aEnd && aStart < end;
  });
}

export function slotsFor(minutes: number): number[] {
  const slots: number[] = [];
  for (let t = DAY_START; t + minutes <= DAY_END; t += SLOT_STEP) slots.push(t);
  return slots;
}

export function sortAppointments(list: Appointment[]): Appointment[] {
  return [...list].sort((a, b) => toMinutes(a.start) - toMinutes(b.start) || a.vet.localeCompare(b.vet));
}
```

