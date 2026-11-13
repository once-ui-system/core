"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
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
} from "@once-ui-system/core";
import { AlertTags } from "@/components/AlertTags";
import { BookDialog, type NewBooking } from "@/components/BookDialog";
import {
  type Appointment,
  NOW_START,
  STATUS_LABEL,
  type Status,
  appointments as initialAppointments,
  getOwner,
  getPatient,
  getVet,
  toClock,
  toMinutes,
} from "@/lib/data";

const STATUS_TONE: Record<Status, "neutral" | "brand" | "accent" | "success" | "info"> = {
  booked: "neutral",
  checked_in: "accent",
  in_exam: "brand",
  done: "success",
  cancelled: "neutral",
};

const NEXT_ACTION: Partial<Record<Status, { label: string; next: Status; icon: "check" | "enter" | "checkbox" }>> = {
  booked: { label: "Check in", next: "checked_in", icon: "check" },
  checked_in: { label: "Send to exam", next: "in_exam", icon: "enter" },
  in_exam: { label: "Mark done", next: "done", icon: "checkbox" },
};

function waitLabel(min: number) {
  if (min < 1) return "just now";
  if (min < 60) return `${min} min`;
  return `${Math.floor(min / 60)} h ${min % 60} min`;
}

function AppointmentCard({
  a,
  now,
  onAdvance,
}: {
  a: Appointment;
  now: number;
  onAdvance: (id: string, next: Status) => void;
}) {
  const patient = getPatient(a.patient);
  const owner = patient ? getOwner(patient.owner) : undefined;
  const vet = getVet(a.vet);
  const action = NEXT_ACTION[a.status];
  const end = toClock(toMinutes(a.start) + a.minutes);
  const cancelled = a.status === "cancelled";
  const late = a.status === "booked" && toMinutes(a.start) < now;

  return (
    <Column
      as="li"
      background={a.urgent ? "danger-alpha-weak" : "surface"}
      border={a.urgent ? "danger-strong" : true}
      borderWidth={a.urgent ? 2 : 1}
      radius="l"
      padding="16"
      gap="12"
      opacity={cancelled ? 60 : 100}
      style={{ listStyle: "none" }}>
      <Row gap="16" vertical="start" s={{ direction: "column", gap: "12" }}>
        <Column fit gap="2" minWidth="5rem">
          <Text textVariant="heading-strong-l">{a.start}</Text>
          <Text textVariant="body-default-xs" onBackground="neutral-weak">
            to {end} · {a.minutes} min
          </Text>
        </Column>

        <Column flex={1} gap="8">
          <Row gap="8" vertical="center" wrap>
            {patient && (
              <Link href={`/patients/${patient.id}`} style={{ color: "inherit" }}>
                <Text textVariant="heading-strong-m">{patient.name}</Text>
              </Link>
            )}
            <Text textVariant="body-default-s" onBackground="neutral-weak">
              {patient?.species}, {patient?.breed}
            </Text>
            {a.urgent && <Tag tone="danger" prefixIcon="bolt" label="Urgent" />}
          </Row>
          <Text textVariant="body-default-m">
            {cancelled ? <s>{a.reason}</s> : a.reason}
          </Text>
          <Text textVariant="body-default-s" onBackground="neutral-weak">
            Owner {owner?.name} · {owner?.phone}
          </Text>
          {patient && <AlertTags alerts={patient.alerts} size="s" />}
        </Column>

        <Column gap="8" horizontal="end" s={{ horizontal: "start", direction: "row", wrap: true, vertical: "center" }}>
          <Row gap="8" vertical="center" wrap>
            {late && <Tag tone="warning" label="Running late" prefixIcon="time" />}
            <Tag tone={STATUS_TONE[a.status]} dot label={STATUS_LABEL[a.status]} />
          </Row>
          <Text textVariant="body-default-xs" onBackground="neutral-weak">
            {vet?.name} · {vet?.room}
          </Text>
          {action && (
            <Button
              size="m"
              variant={a.status === "booked" ? "primary" : "secondary"}
              prefixIcon={action.icon}
              onClick={() => onAdvance(a.id, action.next)}>
              {action.label}
            </Button>
          )}
        </Column>
      </Row>
    </Column>
  );
}

export function Schedule() {
  const [list, setList] = useState<Appointment[]>(initialAppointments);
  const [now, setNow] = useState(NOW_START);
  const [view, setView] = useState("time");
  const [bookOpen, setBookOpen] = useState(false);
  const { addToast } = useToast();

  // The counter clock runs live from the demo start time.
  useEffect(() => {
    const started = Date.now();
    const id = window.setInterval(() => setNow(NOW_START + Math.floor((Date.now() - started) / 60000)), 15000);
    return () => window.clearInterval(id);
  }, []);

  const advance = (id: string, next: Status) => {
    const target = list.find((a) => a.id === id);
    setList((cur) =>
      cur.map((a) => (a.id === id ? { ...a, status: next, checkedInAt: next === "checked_in" ? now : a.checkedInAt } : a)),
    );
    const p = target ? getPatient(target.patient) : undefined;
    if (next === "checked_in" && p) {
      addToast({ tone: "success", message: `${p.name} is checked in and on the waiting list.` });
    }
  };

  const book = (b: NewBooking) => {
    const id = `a-${String(list.length + 1).padStart(2, "0")}`;
    setList((cur) => [...cur, { id, status: "booked", ...b }]);
    setBookOpen(false);
    const p = getPatient(b.patient);
    addToast({ tone: "success", message: `${p?.name} booked with ${getVet(b.vet)?.name} at ${b.start}.` });
  };

  const sorted = useMemo(
    () => [...list].sort((x, y) => toMinutes(x.start) - toMinutes(y.start) || x.vet.localeCompare(y.vet)),
    [list],
  );
  const waiting = useMemo(
    () =>
      list
        .filter((a) => a.status === "checked_in")
        .sort((x, y) => (x.checkedInAt ?? 0) - (y.checkedInAt ?? 0)),
    [list],
  );
  const inExam = list.filter((a) => a.status === "in_exam").length;
  const upcoming = sorted.filter((a) => a.status === "booked");
  const next = upcoming.find((a) => toMinutes(a.start) >= now) ?? upcoming[0];
  const nextPatient = next ? getPatient(next.patient) : undefined;

  const dayStats = [
    { label: "Waiting now", value: String(waiting.length), icon: "time" as const },
    { label: "In exam", value: String(inExam), icon: "paw" as const },
    { label: "Still to arrive", value: String(upcoming.length), icon: "calendar" as const },
    {
      label: "Next arrival",
      value: next ? `${nextPatient?.name} · ${next.start}` : "None",
      icon: "bell" as const,
    },
  ];

  return (
    <Column as="main" id="main" fillWidth horizontal="center" padding="24" s={{ padding: "12" }}>
      <Column fillWidth maxWidth="xl" gap="24">
        <Row horizontal="between" vertical="end" gap="16" wrap>
          <Column gap="4">
            <Heading as="h1" textVariant="display-strong-xs">
              Today’s schedule
            </Heading>
            <Text textVariant="body-default-m" onBackground="neutral-weak">
              Counter time {toClock(now)} · {list.filter((a) => a.status !== "cancelled").length} appointments across
              three vets
            </Text>
          </Column>
          <Button size="l" prefixIcon="plus" onClick={() => setBookOpen(true)}>
            Book appointment
          </Button>
        </Row>

        <Grid columns="4" m={{ columns: "2" }} gap="12">
          {dayStats.map((s) => (
            <Column key={s.label} background="surface" border radius="l" padding="16" gap="8">
              <Row gap="8" vertical="center" onBackground="neutral-weak">
                <Icon name={s.icon} size="s" />
                <Text textVariant="label-default-s">{s.label}</Text>
              </Row>
              <Text textVariant="heading-strong-l">{s.value}</Text>
            </Column>
          ))}
        </Grid>

        <Row gap="24" vertical="start" m={{ direction: "column" }}>
          <Column
            as="section"
            aria-labelledby="waiting-title"
            background="surface"
            border
            radius="l"
            padding="16"
            gap="16"
            width="22rem"
            m={{ fillWidth: true, width: "auto" }}
            fitHeight>
            <Row horizontal="between" vertical="center">
              <Heading as="h2" id="waiting-title" textVariant="heading-strong-l">
                Waiting room
              </Heading>
              <Tag tone={waiting.length ? "accent" : "neutral"} label={`${waiting.length} waiting`} />
            </Row>
            {waiting.length === 0 ? (
              <Text textVariant="body-default-s" onBackground="neutral-weak">
                Nobody is waiting. Check patients in as they arrive.
              </Text>
            ) : (
              <Column as="ol" gap="8" margin="0" padding="0" style={{ listStyle: "none" }}>
                {waiting.map((a, i) => {
                  const p = getPatient(a.patient);
                  const mins = Math.max(0, now - (a.checkedInAt ?? now));
                  return (
                    <Column
                      as="li"
                      key={a.id}
                      padding="12"
                      radius="m"
                      gap="8"
                      background="neutral-alpha-weak">
                      <Row horizontal="between" vertical="center" gap="8">
                        <Row gap="8" vertical="center">
                          <Text textVariant="label-strong-s" onBackground="neutral-weak">
                            {i + 1}
                          </Text>
                          <Link href={`/patients/${a.patient}`} style={{ color: "inherit" }}>
                            <Text textVariant="heading-strong-s">{p?.name}</Text>
                          </Link>
                        </Row>
                        <Tag
                          tone={mins >= 30 ? "danger" : mins >= 15 ? "warning" : "neutral"}
                          prefixIcon="time"
                          label={waitLabel(mins)}
                        />
                      </Row>
                      <Text textVariant="body-default-s" onBackground="neutral-weak">
                        {a.reason} · {getVet(a.vet)?.name}, {getVet(a.vet)?.room}
                      </Text>
                      {p && <AlertTags alerts={p.alerts} size="s" />}
                    </Column>
                  );
                })}
              </Column>
            )}
          </Column>

          <Column as="section" aria-labelledby="sched-title" flex={1} gap="16" fillWidth>
            <Row horizontal="between" vertical="center" gap="12" wrap>
              <Heading as="h2" id="sched-title" textVariant="heading-strong-l">
                All appointments
              </Heading>
              <Row maxWidth="20rem" fillWidth>
                <SegmentedControl
                  value={view}
                  onValueChange={setView}
                  buttons={[
                    { value: "time", label: "By time" },
                    { value: "vet", label: "By vet" },
                  ]}
                />
              </Row>
            </Row>

            {view === "time" ? (
              <Column as="ul" gap="12" margin="0" padding="0">
                {sorted.map((a) => (
                  <AppointmentCard key={a.id} a={a} now={now} onAdvance={advance} />
                ))}
              </Column>
            ) : (
              <Column gap="24">
                {["v-1", "v-2", "v-3"].map((vid) => {
                  const v = getVet(vid);
                  return (
                    <Column key={vid} gap="12">
                      <Row gap="8" vertical="center">
                        <Icon name="person" size="s" />
                        <Text textVariant="label-strong-m">
                          {v?.name} · {v?.room}
                        </Text>
                      </Row>
                      <Column as="ul" gap="12" margin="0" padding="0">
                        {sorted
                          .filter((a) => a.vet === vid)
                          .map((a) => (
                            <AppointmentCard key={a.id} a={a} now={now} onAdvance={advance} />
                          ))}
                      </Column>
                    </Column>
                  );
                })}
              </Column>
            )}
          </Column>
        </Row>
      </Column>

      <BookDialog open={bookOpen} onClose={() => setBookOpen(false)} appointments={list} onBook={book} />
    </Column>
  );
}
