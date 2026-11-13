"use client";

import { useMemo, useState } from "react";
import {
  Button,
  Column,
  Grid,
  Heading,
  Icon,
  type IconName,
  Row,
  SegmentedControl,
  SmartLink,
  Tag,
  Text,
  useToast,
} from "@once-ui-system/core";
import { AlertChips } from "./AlertTags";
import { useClinic } from "@/lib/clinic";
import {
  type Appointment,
  type Status,
  getOwner,
  getPatient,
  getVet,
  minutesWaiting,
  statusLabel,
  toMin,
  vets,
  waitText,
} from "@/lib/data";

const statusTone: Record<Status, "neutral" | "warning" | "info" | "success" | "danger"> = {
  booked: "neutral",
  checked_in: "warning",
  in_exam: "info",
  done: "success",
  cancelled: "neutral",
};
const statusIcon: Record<Status, IconName> = {
  booked: "calendar",
  checked_in: "time",
  in_exam: "paw",
  done: "check",
  cancelled: "close",
};

function StatusTag({ status }: { status: Status }) {
  return <Tag tone={statusTone[status]} prefixIcon={statusIcon[status]} label={statusLabel[status]} />;
}

function Stat({ value, label, tone }: { value: number; label: string; tone?: "warning-strong" | "info-strong" }) {
  return (
    <Column background="neutral-alpha-weak" radius="l" padding="16" gap="4">
      <Text textVariant="display-strong-xs" onBackground={tone}>
        {value}
      </Text>
      <Text textVariant="label-default-s" onBackground="neutral-weak">
        {label}
      </Text>
    </Column>
  );
}

function ApptRow({ a, first, highlight }: { a: Appointment; first: boolean; highlight: boolean }) {
  const { checkIn, setStatus } = useClinic();
  const { addToast } = useToast();
  const p = getPatient(a.patient);
  const owner = p ? getOwner(p.owner) : undefined;
  const vet = getVet(a.vet);
  if (!p) return null;
  const finished = a.status === "done" || a.status === "cancelled";

  return (
    <Row
      as="li"
      gap="16"
      padding="16"
      vertical="center"
      wrap
      borderTop={!first}
      background={a.urgent && !finished ? "danger-alpha-weak" : highlight ? "brand-alpha-weak" : "transparent"}
      style={{ listStyle: "none" }}>
      <Column width="5rem" gap="0">
        <Text textVariant="heading-strong-m" onBackground={finished ? "neutral-weak" : "neutral-strong"}>
          {a.start}
        </Text>
        <Text textVariant="label-default-xs" onBackground="neutral-weak">
          {a.minutes} min
        </Text>
      </Column>
      <Column flex={1} minWidth="14rem" gap="4">
        <Row gap="8" vertical="center" wrap>
          <SmartLink href={`/patients/${p.id}`}>
            <Text textVariant="heading-strong-m">{p.name}</Text>
          </SmartLink>
          <Text textVariant="body-default-s" onBackground="neutral-weak">
            {p.species}, {p.breed}
          </Text>
          {a.urgent && <Tag tone="danger" prefixIcon="bolt" label="Urgent" />}
          {highlight && <Tag tone="brand" label="New" />}
        </Row>
        <Text textVariant="body-default-m">{a.reason}</Text>
        <Text textVariant="body-default-s" onBackground="neutral-weak">
          {owner?.name} · {owner?.phone}
        </Text>
        <AlertChips alerts={p.alerts} />
      </Column>
      <Row gap="12" vertical="center" wrap>
        <Column gap="0" width="6.5rem">
          <Text textVariant="label-strong-s">{vet?.name}</Text>
          <Text textVariant="label-default-xs" onBackground="neutral-weak">
            {vet?.room}
          </Text>
        </Column>
        <Row width="7.5rem">
          <StatusTag status={a.status} />
        </Row>
        <Row width="7.5rem" horizontal="end">
          {a.status === "booked" && (
            <Button
              prefixIcon="check"
              aria-label={`Check in ${p.name}`}
              onClick={() => {
                checkIn(a.id);
                addToast({ variant: "success", message: `${p.name} is checked in and waiting for ${vet?.name}.` });
              }}>
              Check in
            </Button>
          )}
          {a.status === "checked_in" && (
            <Button
              variant="secondary"
              aria-label={`Start exam for ${p.name}`}
              onClick={() => setStatus(a.id, "in_exam")}>
              Start exam
            </Button>
          )}
          {a.status === "in_exam" && (
            <Button variant="secondary" aria-label={`Finish visit for ${p.name}`} onClick={() => setStatus(a.id, "done")}>
              Finish
            </Button>
          )}
        </Row>
      </Row>
    </Row>
  );
}

function WaitingPanel() {
  const { appointments, now, setStatus } = useClinic();
  const waiting = appointments
    .filter((a) => a.status === "checked_in")
    .sort((x, y) => toMin(x.checkedInAt ?? now) - toMin(y.checkedInAt ?? now));

  return (
    <Column
      width="22rem"
      m={{ width: "100%" }}
      gap="12"
      padding="16"
      radius="l"
      border
      background="neutral-alpha-weak"
      fitHeight
      as="section"
      aria-labelledby="waiting-title">
      <Row horizontal="between" vertical="center">
        <Heading as="h2" id="waiting-title" textVariant="heading-strong-l">
          Waiting room
        </Heading>
        <Tag tone={waiting.length > 0 ? "warning" : "neutral"} label={`${waiting.length} waiting`} />
      </Row>
      <Column gap="8" as="ol" aria-live="polite">
        {waiting.length === 0 && (
          <Text onBackground="neutral-weak" textVariant="body-default-m">
            Nobody is waiting. Check patients in as they arrive.
          </Text>
        )}
        {waiting.map((a, i) => {
          const p = getPatient(a.patient);
          const vet = getVet(a.vet);
          if (!p) return null;
          const mins = minutesWaiting(a.checkedInAt ?? now, now);
          return (
            <Column
              as="li"
              key={a.id}
              gap="8"
              padding="12"
              radius="m"
              background="surface"
              border
              style={{ listStyle: "none" }}>
              <Row horizontal="between" vertical="center" gap="8">
                <Row gap="8" vertical="center" wrap>
                  <SmartLink href={`/patients/${p.id}`}>
                    <Text textVariant="heading-strong-m">{p.name}</Text>
                  </SmartLink>
                  {i === 0 && <Tag tone="brand" label="Next" />}
                </Row>
                <Tag
                  tone={mins >= 15 ? "danger" : mins >= 8 ? "warning" : "neutral"}
                  prefixIcon="time"
                  label={waitText(mins)}
                />
              </Row>
              <Text textVariant="body-default-s" onBackground="neutral-weak">
                {a.reason} · for {vet?.name}, {vet?.room} · booked {a.start}
              </Text>
              <AlertChips alerts={p.alerts} />
              <Row>
                <Button
                  size="s"
                  variant="secondary"
                  aria-label={`Start exam for ${p.name}`}
                  onClick={() => setStatus(a.id, "in_exam")}>
                  Start exam
                </Button>
              </Row>
            </Column>
          );
        })}
      </Column>
    </Column>
  );
}

export function Schedule() {
  const { appointments, lastAddedId, openBooking, now } = useClinic();
  const [vetFilter, setVetFilter] = useState("all");
  const [view, setView] = useState("all");

  const rows = useMemo(() => {
    return appointments
      .filter((a) => vetFilter === "all" || a.vet === vetFilter)
      .filter((a) => view === "all" || a.status === "booked" || a.status === "checked_in" || a.status === "in_exam")
      .sort((x, y) => toMin(x.start) - toMin(y.start) || x.vet.localeCompare(y.vet));
  }, [appointments, vetFilter, view]);

  const count = (s: Status) => appointments.filter((a) => a.status === s).length;

  return (
    <>
      <Row horizontal="between" vertical="end" gap="16" wrap>
        <Column gap="4">
          <Text textVariant="label-default-s" onBackground="neutral-weak">
            Thursday 12 November 2026 · desk time {now}
          </Text>
          <Heading as="h1" textVariant="display-strong-xs">
            Today&apos;s schedule
          </Heading>
        </Column>
        <Button prefixIcon="plus" onClick={() => openBooking()}>
          Book appointment
        </Button>
      </Row>

      <Grid columns="4" s={{ columns: "2" }} gap="12">
        <Stat value={count("checked_in")} label="Waiting now" tone="warning-strong" />
        <Stat value={count("in_exam")} label="In exam" tone="info-strong" />
        <Stat value={count("booked")} label="Still to arrive" />
        <Stat value={count("done")} label="Done today" />
      </Grid>

      <Row gap="24" direction="row-reverse" m={{ direction: "column" }} vertical="start">
        <WaitingPanel />
        <Column flex={1} gap="12" minWidth="0">
          <Row gap="12" wrap vertical="center">
            <Column flex={1} minWidth="18rem">
              <SegmentedControl
                aria-label="Filter by vet"
                value={vetFilter}
                onValueChange={setVetFilter}
                buttons={[
                  { value: "all", label: "All vets" },
                  ...vets.map((v) => ({ value: v.id, label: v.short })),
                ]}
              />
            </Column>
            <Row maxWidth="14rem" fillWidth s={{ maxWidth: "100%" }}>
              <SegmentedControl
                aria-label="Which appointments to show"
                value={view}
                onValueChange={setView}
                buttons={[
                  { value: "all", label: "All" },
                  { value: "open", label: "Open" },
                ]}
              />
            </Row>
          </Row>
          <Column as="ul" border radius="l" overflow="hidden" margin="0" padding="0" aria-label="Appointments">
            {rows.length === 0 && (
              <Row padding="24" gap="8" vertical="center">
                <Icon name="calendar" onBackground="neutral-weak" />
                <Text onBackground="neutral-weak">No appointments match this view.</Text>
              </Row>
            )}
            {rows.map((a, i) => (
              <ApptRow key={a.id} a={a} first={i === 0} highlight={a.id === lastAddedId} />
            ))}
          </Column>
          <Text textVariant="body-default-xs" onBackground="neutral-weak">
            {rows.length} of {appointments.length} appointments shown.
          </Text>
        </Column>
      </Row>
    </>
  );
}
