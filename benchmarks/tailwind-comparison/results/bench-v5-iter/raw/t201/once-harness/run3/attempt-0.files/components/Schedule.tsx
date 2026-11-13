"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Button,
  Column,
  Grid,
  Heading,
  Icon,
  Row,
  SegmentedControl,
  Tag,
  Text,
  useToast,
  VisuallyHidden,
} from "@once-ui-system/core";
import {
  APPOINTMENTS,
  NOW_START,
  STATUS_LABEL,
  VETS,
  endTime,
  fromMin,
  getOwner,
  getPatient,
  getVet,
  toMin,
  type Appointment,
  type Status,
} from "@/lib/data";
import { AlertTags } from "./AlertTags";
import { BookDialog } from "./BookDialog";

const STATUS_TONE: Record<Status, "neutral" | "warning" | "accent" | "success" | "danger"> = {
  booked: "neutral",
  checked_in: "warning",
  in_exam: "accent",
  done: "success",
  cancelled: "neutral",
};

export function Schedule() {
  const { addToast } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>(APPOINTMENTS);
  const [now, setNow] = useState(NOW_START);
  const [vetFilter, setVetFilter] = useState("all");
  const [booking, setBooking] = useState(false);
  const [announce, setAnnounce] = useState("");

  useEffect(() => {
    const t = setInterval(() => setNow((n) => n + 1), 60000);
    return () => clearInterval(t);
  }, []);

  const sorted = useMemo(
    () =>
      [...appointments].sort(
        (a, b) => toMin(a.start) - toMin(b.start) || a.vet.localeCompare(b.vet),
      ),
    [appointments],
  );
  const visible = sorted.filter((a) => vetFilter === "all" || a.vet === vetFilter);

  const waiting = appointments
    .filter((a) => a.status === "checked_in")
    .sort((a, b) => toMin(a.checkedInAt ?? "00:00") - toMin(b.checkedInAt ?? "00:00"));
  const inExam = appointments.filter((a) => a.status === "in_exam").length;
  const nextArrival = sorted.find((a) => a.status === "booked" && toMin(a.start) >= now - 15);
  const urgentOpen = appointments.filter(
    (a) => a.urgent && (a.status === "booked" || a.status === "checked_in"),
  ).length;

  const checkIn = (id: string) => {
    const appt = appointments.find((a) => a.id === id);
    if (!appt) return;
    const patient = getPatient(appt.patient);
    setAppointments((list) =>
      list.map((a) => (a.id === id ? { ...a, status: "checked_in", checkedInAt: fromMin(now) } : a)),
    );
    const msg = `${patient?.name ?? "Patient"} checked in at ${fromMin(now)} for ${getVet(appt.vet)?.name}.`;
    setAnnounce(msg);
    addToast({ variant: "success", message: msg });
  };

  const addAppointment = (a: Appointment) => {
    setAppointments((list) => [...list, a]);
    setVetFilter("all");
    const msg = `Booked ${getPatient(a.patient)?.name} with ${getVet(a.vet)?.name} at ${a.start}.`;
    setAnnounce(msg);
    addToast({ variant: "success", message: msg });
  };

  return (
    <Column gap="24">
      <Row horizontal="between" vertical="end" gap="16" wrap>
        <Column gap="4">
          <Text textVariant="label-default-s" onBackground="neutral-weak">
            Thursday 12 Nov 2026 · {fromMin(now)} at the counter
          </Text>
          <Heading as="h1" textVariant="display-strong-xs">
            Today&apos;s schedule
          </Heading>
        </Column>
        <Button prefixIcon="plus" size="l" onClick={() => setBooking(true)}>
          Book appointment
        </Button>
      </Row>

      <VisuallyHidden aria-live="polite" role="status">
        {announce}
      </VisuallyHidden>

      <Grid columns="4" s={{ columns: "2" }} gap="12">
        <Stat label="Waiting" value={String(waiting.length)} hint={waiting.length ? `Longest ${now - toMin(waiting[0].checkedInAt ?? fromMin(now))} min` : "Nobody waiting"} icon="time" />
        <Stat label="In exam" value={String(inExam)} hint="Across three rooms" icon="people" />
        <Stat
          label="Next arrival"
          value={nextArrival ? nextArrival.start : "None"}
          hint={nextArrival ? `${getPatient(nextArrival.patient)?.name}, ${getVet(nextArrival.vet)?.name}` : "Day is clear"}
          icon="calendar"
        />
        <Stat label="Urgent open" value={String(urgentOpen)} hint="Not yet seen" icon="bolt" danger={urgentOpen > 0} />
      </Grid>

      <Column as="section" aria-labelledby="waiting-title" background="surface" border radius="l" padding="20" gap="16">
        <Row horizontal="between" vertical="center" gap="8">
          <Heading as="h2" id="waiting-title" textVariant="heading-strong-l">
            Waiting list
          </Heading>
          <Text textVariant="label-default-s" onBackground="neutral-weak">
            Longest wait first
          </Text>
        </Row>
        {waiting.length === 0 ? (
          <Text onBackground="neutral-weak">Nobody is waiting. Check in a patient from the schedule below.</Text>
        ) : (
          <Grid as="ol" columns="3" m={{ columns: "2" }} s={{ columns: "1" }} gap="12" margin="0" padding="0">
            {waiting.map((a, i) => {
              const patient = getPatient(a.patient);
              const mins = now - toMin(a.checkedInAt ?? fromMin(now));
              const long = mins >= 15;
              return (
                <Column
                  as="li"
                  key={a.id}
                  gap="8"
                  padding="16"
                  radius="m"
                  background={long ? "warning-alpha-weak" : "neutral-alpha-weak"}
                  border={long ? "warning-medium" : true}
                >
                  <Row horizontal="between" vertical="center" gap="8">
                    <Row gap="8" vertical="center">
                      <Tag tone={i === 0 ? "brand" : "neutral"} label={i === 0 ? "Next up" : `#${i + 1}`} />
                      <PatientLink id={a.patient} />
                    </Row>
                    <Column horizontal="end">
                      <Text textVariant="heading-strong-l" onBackground={long ? "warning-strong" : "neutral-strong"}>
                        {mins} min
                      </Text>
                      <Text textVariant="label-default-xs" onBackground="neutral-weak">
                        since {a.checkedInAt}
                      </Text>
                    </Column>
                  </Row>
                  <Text textVariant="body-default-s" onBackground="neutral-medium">
                    {a.reason} · {getVet(a.vet)?.name}, {getVet(a.vet)?.room}
                  </Text>
                  <AlertTags alerts={patient?.alerts ?? []} size="s" />
                </Column>
              );
            })}
          </Grid>
        )}
      </Column>

      <Column as="section" aria-labelledby="schedule-title" gap="16">
        <Row horizontal="between" vertical="center" gap="16" wrap>
          <Heading as="h2" id="schedule-title" textVariant="heading-strong-l">
            All appointments ({visible.length})
          </Heading>
          <SegmentedControl
            aria-label="Filter by vet"
            value={vetFilter}
            onValueChange={setVetFilter}
            buttons={[
              { value: "all", label: "All vets" },
              ...VETS.map((v) => ({ value: v.id, label: v.name.replace("Dr. ", "").split(" ").pop() ?? v.name })),
            ]}
          />
        </Row>
        <Column as="ul" gap="8" margin="0" padding="0">
          {visible.map((a) => (
            <AppointmentRow key={a.id} appt={a} onCheckIn={() => checkIn(a.id)} />
          ))}
        </Column>
      </Column>

      <BookDialog
        open={booking}
        onClose={() => setBooking(false)}
        appointments={appointments}
        now={now}
        onBook={addAppointment}
      />
    </Column>
  );
}

function Stat({
  label,
  value,
  hint,
  icon,
  danger,
}: {
  label: string;
  value: string;
  hint: string;
  icon: "time" | "people" | "calendar" | "bolt";
  danger?: boolean;
}) {
  return (
    <Column background={danger ? "danger-alpha-weak" : "surface"} border={danger ? "danger-medium" : true} radius="l" padding="16" gap="4">
      <Row gap="8" vertical="center">
        <Icon name={icon} size="s" onBackground={danger ? "danger-strong" : "neutral-weak"} />
        <Text textVariant="label-default-s" onBackground="neutral-weak">
          {label}
        </Text>
      </Row>
      <Text textVariant="display-strong-xs" onBackground={danger ? "danger-strong" : "neutral-strong"}>
        {value}
      </Text>
      <Text textVariant="body-default-s" onBackground="neutral-weak">
        {hint}
      </Text>
    </Column>
  );
}

function PatientLink({ id }: { id: string }) {
  const p = getPatient(id);
  if (!p) return null;
  return (
    <Link
      href={`/patients/${p.id}`}
      style={{ color: "inherit", textDecoration: "underline", textUnderlineOffset: 3, textDecorationThickness: 1 }}
    >
      <Text textVariant="label-strong-l">{p.name}</Text>
    </Link>
  );
}

function AppointmentRow({ appt, onCheckIn }: { appt: Appointment; onCheckIn: () => void }) {
  const patient = getPatient(appt.patient);
  const owner = patient ? getOwner(patient.owner) : undefined;
  const vet = getVet(appt.vet);
  const cancelled = appt.status === "cancelled";
  const strike = cancelled ? ({ textDecoration: "line-through" } as const) : undefined;

  return (
    <Row
      as="li"
      gap="16"
      padding="16"
      radius="l"
      vertical="start"
      s={{ direction: "column", gap: "8" }}
      background={appt.urgent ? "danger-alpha-weak" : "surface"}
      border={appt.urgent ? "danger-strong" : true}
      borderWidth={appt.urgent ? 2 : 1}
    >
      <Column width={80} s={{ width: "auto" }} gap="2" flex={0}>
        <Text textVariant="heading-strong-l" style={strike}>
          {appt.start}
        </Text>
        <Text textVariant="label-default-xs" onBackground="neutral-weak">
          to {endTime(appt.start, appt.minutes)} · {appt.minutes} min
        </Text>
      </Column>
      <Column flex={1} gap="4" fillWidth>
        <Row gap="8" vertical="center" wrap>
          {appt.urgent && <Tag tone="danger" variant="gradient" prefixIcon="bolt" label="Urgent" />}
          <PatientLink id={appt.patient} />
          <Text textVariant="body-default-s" onBackground="neutral-weak">
            {patient?.species}, {patient?.breed}
          </Text>
          {appt.isNew && <Tag tone="brand" label="Just booked" />}
        </Row>
        <Text textVariant="body-default-m" style={strike}>
          {appt.reason}
        </Text>
        <Text textVariant="body-default-s" onBackground="neutral-weak">
          Owner {owner?.name} · {owner?.phone}
        </Text>
        <AlertTags alerts={patient?.alerts ?? []} size="s" />
      </Column>
      <Column width={176} s={{ width: "auto" }} gap="2" flex={0}>
        <Text textVariant="label-strong-s">{vet?.name}</Text>
        <Text textVariant="label-default-s" onBackground="neutral-weak">
          {vet?.room}
        </Text>
      </Column>
      <Row width={176} s={{ width: "auto", fillWidth: true }} gap="8" vertical="center" horizontal="between" wrap flex={0}>
        <Tag tone={STATUS_TONE[appt.status]} label={STATUS_LABEL[appt.status]} dot={appt.status === "in_exam"} />
        {appt.status === "booked" && (
          <Button size="m" variant="secondary" prefixIcon="check" onClick={onCheckIn} aria-label={`Check in ${patient?.name}`}>
            Check in
          </Button>
        )}
      </Row>
    </Row>
  );
}
