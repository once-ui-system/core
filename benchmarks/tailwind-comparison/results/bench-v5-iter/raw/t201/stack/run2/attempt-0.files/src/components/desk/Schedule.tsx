"use client";

import { useMemo, useState } from "react";
import { Button, Column, Heading, Row, SegmentedControl, SmartLink, Tag, Text } from "@once-ui-system/core";
import {
  type Appointment,
  type Status,
  fmtTime,
  getOwner,
  getPatient,
  getVet,
  statusLabel,
  toMin,
  vets,
} from "@/lib/data";
import { AlertTags } from "./AlertTags";
import { BookDialog } from "./BookDialog";
import { useDesk } from "./DeskProvider";

const statusScheme: Record<Status, "neutral" | "warning" | "accent" | "success"> = {
  booked: "neutral",
  checked_in: "warning",
  in_exam: "accent",
  done: "success",
  cancelled: "neutral",
};

function Stat({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <Column background="surface" border radius="l" padding="16" gap="4" flex={1} minWidth={10}>
      <Text variant="label-default-s" onBackground="neutral-medium">
        {label}
      </Text>
      <Text variant="display-strong-xs">{value}</Text>
      <Text variant="body-default-xs" onBackground="neutral-medium">
        {hint}
      </Text>
    </Column>
  );
}

function AppointmentRow({ a }: { a: Appointment }) {
  const { checkIn } = useDesk();
  const patient = getPatient(a.patient);
  const owner = getOwner(patient?.owner ?? "");
  const vet = getVet(a.vet);
  if (!patient) return null;
  const end = fmtTime(toMin(a.start) + a.minutes);
  const cancelled = a.status === "cancelled";

  return (
    <Row
      as="li"
      background={a.urgent ? "danger-alpha-weak" : "surface"}
      border={a.urgent ? "danger-alpha-strong" : true}
      radius="l"
      padding="16"
      gap="16"
      vertical="start"
      wrap
      style={{ listStyle: "none", borderLeft: a.urgent ? "6px solid var(--danger-solid-strong)" : undefined }}
    >
      <Column width="80" gap="0">
        <Text variant="heading-strong-l">{a.start}</Text>
        <Text variant="body-default-xs" onBackground="neutral-medium">
          to {end}
        </Text>
      </Column>

      <Column flex={1} gap="8" minWidth={12}>
        <Row gap="8" vertical="center" wrap>
          <SmartLink href={`/patients/${patient.id}`}>
            <Text variant="heading-strong-m">{patient.name}</Text>
          </SmartLink>
          <Text variant="body-default-s" onBackground="neutral-medium">
            {patient.species}, {patient.breed} · {owner.name}
          </Text>
        </Row>
        <Row gap="8" vertical="center" wrap>
          {a.urgent && (
            <Tag scheme="danger" size="m" prefixIcon="bolt">
              <strong>Urgent</strong>
            </Tag>
          )}
          <Text variant="body-default-m" style={{ textDecoration: cancelled ? "line-through" : undefined }}>
            {a.reason}
          </Text>
        </Row>
        <AlertTags alerts={patient.alerts} size="s" />
        <Text variant="label-default-s" onBackground="neutral-medium">
          {vet.name} · {vet.room} · {a.minutes} min
        </Text>
      </Column>

      <Row gap="12" vertical="center" wrap>
        <Tag scheme={statusScheme[a.status]} size="l" label={statusLabel[a.status]} />
        {a.status === "booked" && (
          <Button
            size="m"
            variant="primary"
            prefixIcon="check"
            label="Check in"
            onClick={() => checkIn(a.id)}
          />
        )}
      </Row>
    </Row>
  );
}

function WaitingList() {
  const { appointments, now } = useDesk();
  const waiting = appointments
    .filter((a) => a.status === "checked_in")
    .sort((x, y) => (x.checkedInAt ?? 0) - (y.checkedInAt ?? 0));

  return (
    <Column background="surface" border radius="l" padding="20" gap="16" as="section" aria-labelledby="waiting-title">
      <Row horizontal="between" vertical="center">
        <Heading as="h2" id="waiting-title" variant="heading-strong-l">
          Waiting room
        </Heading>
        <Tag scheme={waiting.length ? "warning" : "neutral"} size="l" label={String(waiting.length)} />
      </Row>
      {waiting.length === 0 ? (
        <Text variant="body-default-s" onBackground="neutral-medium">
          Nobody is waiting. Checked-in patients appear here.
        </Text>
      ) : (
        <Column as="ol" gap="12" margin="0" padding="0" aria-live="polite">
          {waiting.map((a, i) => {
            const p = getPatient(a.patient);
            if (!p) return null;
            const mins = Math.max(0, now - (a.checkedInAt ?? now));
            const long = mins >= 30;
            return (
              <Column
                as="li"
                key={a.id}
                gap="8"
                padding="12"
                radius="m"
                background="neutral-alpha-weak"
                style={{ listStyle: "none" }}
              >
                <Row horizontal="between" vertical="center" gap="8">
                  <Text variant="label-strong-m">
                    {i === 0 ? "Next: " : `${i + 1}. `}
                    {p.name}
                  </Text>
                  <Tag
                    scheme={long ? "danger" : "warning"}
                    size="m"
                    prefixIcon="time"
                    label={`${mins} min`}
                  />
                </Row>
                <Text variant="body-default-s" onBackground="neutral-medium">
                  {getVet(a.vet).name} · {a.reason}
                </Text>
                <AlertTags alerts={p.alerts} size="s" />
              </Column>
            );
          })}
        </Column>
      )}
    </Column>
  );
}

export function Schedule() {
  const { appointments, now } = useDesk();
  const [vetFilter, setVetFilter] = useState("all");
  const [open, setOpen] = useState(false);
  const [notice, setNotice] = useState("");

  const sorted = useMemo(
    () =>
      [...appointments]
        .filter((a) => vetFilter === "all" || a.vet === vetFilter)
        .sort((a, b) => toMin(a.start) - toMin(b.start) || a.vet.localeCompare(b.vet)),
    [appointments, vetFilter],
  );

  const live = appointments.filter((a) => a.status !== "cancelled");
  const waiting = live.filter((a) => a.status === "checked_in").length;
  const inExam = live.filter((a) => a.status === "in_exam").length;
  const done = live.filter((a) => a.status === "done").length;
  const nextBooked = live
    .filter((a) => a.status === "booked")
    .sort((a, b) => toMin(a.start) - toMin(b.start))[0];
  const nextPatient = nextBooked ? getPatient(nextBooked.patient) : undefined;

  return (
    <>
      <Row horizontal="between" vertical="end" gap="16" wrap>
        <Column gap="4">
          <Text variant="label-default-s" onBackground="brand-strong">
            Thursday 12 November 2026 · {fmtTime(now)}
          </Text>
          <Heading as="h1" variant="display-strong-xs">
            Today’s schedule
          </Heading>
        </Column>
        <Button size="l" prefixIcon="plus" label="Book appointment" onClick={() => setOpen(true)} />
      </Row>

      {notice && (
        <Row
          role="status"
          background="success-alpha-weak"
          border="success-alpha-medium"
          radius="m"
          padding="12"
          horizontal="between"
          vertical="center"
          gap="12"
        >
          <Text variant="body-default-m" onBackground="success-strong">
            {notice}
          </Text>
          <Button size="s" variant="tertiary" label="Dismiss" onClick={() => setNotice("")} />
        </Row>
      )}

      <Row gap="12" wrap s={{ gap: "8" }}>
        <Stat label="Waiting now" value={String(waiting)} hint="checked in, not yet seen" />
        <Stat label="In exam" value={String(inExam)} hint="with a vet or in surgery" />
        <Stat
          label="Next booked"
          value={nextBooked ? nextBooked.start : "None"}
          hint={nextBooked && nextPatient ? `${nextPatient.name} · ${getVet(nextBooked.vet).name}` : "nothing left today"}
        />
        <Stat label="Done" value={`${done} of ${live.length}`} hint="cancelled visits not counted" />
      </Row>

      <Row gap="24" vertical="start" direction="row-reverse" m={{ direction: "column" }}>
        <Column flex={1} fillWidth gap="16" position="sticky" top="80">
          <WaitingList />
        </Column>
        <Column flex={2} gap="16" fillWidth as="section" aria-label="Appointments">
          <SegmentedControl
            aria-label="Filter by vet"
            fillWidth={false}
            value={vetFilter}
            onChange={(v) => setVetFilter(v)}
            buttons={[
              { value: "all", label: "All vets" },
              ...vets.map((v) => ({ value: v.id, label: v.name })),
            ]}
          />
          <Column as="ul" gap="12" margin="0" padding="0">
            {sorted.map((a) => (
              <AppointmentRow key={a.id} a={a} />
            ))}
          </Column>
        </Column>
      </Row>

      <BookDialog
        open={open}
        onClose={() => setOpen(false)}
        onBooked={(a) => {
          const p = getPatient(a.patient);
          setNotice(`Booked ${p?.name ?? "patient"} with ${getVet(a.vet).name} at ${a.start}.`);
          setVetFilter("all");
          setOpen(false);
        }}
      />
    </>
  );
}
