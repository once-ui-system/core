"use client";

import {
  Button,
  Column,
  Dialog,
  Heading,
  Icon,
  Input,
  Row,
  SegmentedControl,
  Select,
  Tag,
  Text,
  useToast,
} from "@once-ui-system/core";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  type Appointment,
  type Status,
  appointments as seed,
  findClash,
  getOwner,
  getPatient,
  getVet,
  nowMinutes,
  patients,
  statusLabel,
  toClock,
  toMinutes,
  vets,
} from "@/lib/data";
import { AlertTags } from "./Alerts";

const statusScheme: { [S in Status]: "neutral" | "info" | "brand" | "success" | "danger" } = {
  booked: "neutral",
  checked_in: "info",
  in_exam: "brand",
  done: "success",
  cancelled: "danger",
};

const slots = Array.from({ length: 40 }, (_, i) => toClock(8 * 60 + i * 15)).map((t) => ({
  value: t,
  label: t,
}));
const durations = [15, 20, 30, 45, 60].map((m) => ({ value: String(m), label: `${m} min` }));

function Stat({ label, value, tone }: { label: string; value: number; tone?: "info" | "brand" }) {
  return (
    <Column
      background="surface"
      border
      radius="l"
      padding="16"
      gap="4"
      flex={1}
      minWidth={8}
    >
      <Text variant="label-default-s" onBackground="neutral-weak">
        {label}
      </Text>
      <Text variant="display-strong-xs" onBackground={tone ? `${tone}-strong` : "neutral-strong"}>
        {value}
      </Text>
    </Column>
  );
}

export function Schedule() {
  const { addToast } = useToast();
  const [list, setList] = useState<Appointment[]>(seed);
  const [now, setNow] = useState(nowMinutes);
  const [vetFilter, setVetFilter] = useState("all");
  const [bookOpen, setBookOpen] = useState(false);

  const [patientId, setPatientId] = useState("");
  const [vetId, setVetId] = useState("");
  const [time, setTime] = useState("");
  const [minutes, setMinutes] = useState("20");
  const [reason, setReason] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // The clinic clock moves a minute at a time so waiting times keep counting.
  useEffect(() => {
    const id = setInterval(() => setNow((n) => n + 1), 60_000);
    return () => clearInterval(id);
  }, []);

  const sorted = useMemo(
    () =>
      [...list]
        .filter((a) => vetFilter === "all" || a.vet === vetFilter)
        .sort((a, b) => toMinutes(a.start) - toMinutes(b.start) || a.vet.localeCompare(b.vet)),
    [list, vetFilter],
  );

  const waiting = list
    .filter((a) => a.status === "checked_in")
    .sort((a, b) => (a.checkedInAt ?? 0) - (b.checkedInAt ?? 0));

  const count = (s: Status) => list.filter((a) => a.status === s).length;
  const remaining = count("booked");

  const clash =
    vetId && time ? findClash(list, vetId, time, Number(minutes)) : undefined;
  const clashPatient = clash ? getPatient(clash.patient) : undefined;
  const ready = Boolean(patientId && vetId && time && reason.trim());

  const setStatus = (id: string, status: Status, extra?: Partial<Appointment>) =>
    setList((prev) => prev.map((a) => (a.id === id ? { ...a, status, ...extra } : a)));

  const checkIn = (a: Appointment) => {
    setStatus(a.id, "checked_in", { checkedInAt: now });
    addToast({
      variant: "success",
      message: `${getPatient(a.patient)?.name} checked in for ${getVet(a.vet)?.name}.`,
    });
  };

  const resetForm = () => {
    setPatientId("");
    setVetId("");
    setTime("");
    setMinutes("20");
    setReason("");
    setSubmitted(false);
  };

  const book = () => {
    setSubmitted(true);
    if (!ready || clash) return;
    const next: Appointment = {
      id: `a-${String(list.length + 1).padStart(2, "0")}`,
      patient: patientId,
      vet: vetId,
      start: time,
      minutes: Number(minutes),
      reason: reason.trim(),
      status: "booked",
    };
    setList((prev) => [...prev, next]);
    addToast({
      variant: "success",
      message: `Booked ${getPatient(patientId)?.name} with ${getVet(vetId)?.name} at ${time}.`,
    });
    setBookOpen(false);
    resetForm();
  };

  return (
    <Column gap="24">
      <Row horizontal="between" vertical="center" wrap gap="16">
        <Heading as="h1" variant="display-strong-xs">
          Today&apos;s schedule
        </Heading>
        <Button prefixIcon="plus" label="Book appointment" onClick={() => setBookOpen(true)} />
      </Row>

      <Row gap="12" wrap>
        <Stat label="Waiting now" value={waiting.length} tone="info" />
        <Stat label="In exam" value={count("in_exam")} tone="brand" />
        <Stat label="Still to arrive" value={remaining} />
        <Stat label="Done" value={count("done")} />
      </Row>

      <Row gap="24" m={{ direction: "column" }} vertical="start">
        <Column flex={3} gap="12" fillWidth minWidth={20}>
          <SegmentedControl
            aria-label="Filter by vet"
            value={vetFilter}
            onChange={setVetFilter}
            buttons={[
              { value: "all", label: "All vets" },
              ...vets.map((v) => ({ value: v.id, label: v.name.replace("Dr. ", "Dr. ") })),
            ]}
          />
          <Column as="ul" gap="8" margin="0" padding="0" style={{ listStyle: "none" }}>
            {sorted.map((a) => {
              const p = getPatient(a.patient);
              const o = p ? getOwner(p.owner) : undefined;
              const v = getVet(a.vet);
              if (!p) return null;
              const muted = a.status === "done" || a.status === "cancelled";
              return (
                <Column
                  as="li"
                  key={a.id}
                  background={a.urgent && !muted ? "danger-alpha-weak" : "surface"}
                  border={a.urgent && !muted ? "danger-alpha-strong" : true}
                  borderWidth={a.urgent && !muted ? 2 : 1}
                  radius="l"
                  padding="16"
                  gap="12"
                  style={muted ? { opacity: 0.7 } : undefined}
                >
                  <Row gap="16" vertical="start" s={{ direction: "column" }}>
                    <Column minWidth={6} gap="2">
                      <Text variant="heading-strong-l">{a.start}</Text>
                      <Text variant="body-default-xs" onBackground="neutral-weak">
                        {a.minutes} min · {v?.room}
                      </Text>
                    </Column>
                    <Column flex={1} gap="4" minWidth={12}>
                      <Row gap="8" vertical="center" wrap>
                        <Link
                          href={`/patients/${p.id}`}
                          style={{ color: "inherit", textDecoration: "none" }}
                        >
                          <Text variant="heading-strong-m">{p.name}</Text>
                        </Link>
                        <Text variant="body-default-s" onBackground="neutral-weak">
                          {p.species}, {p.breed}
                        </Text>
                        {a.urgent && (
                          <Tag scheme="danger" prefixIcon="bolt" label="Urgent" size="m" />
                        )}
                      </Row>
                      <Text variant="body-default-m">{a.reason}</Text>
                      <Text variant="body-default-s" onBackground="neutral-weak">
                        {o?.name} · {o?.phone} · {v?.name}
                      </Text>
                      <AlertTags alerts={p.alerts} />
                    </Column>
                    <Row gap="8" vertical="center" wrap>
                      <Tag
                        scheme={statusScheme[a.status]}
                        label={statusLabel[a.status]}
                        size="m"
                      />
                      {a.status === "booked" && (
                        <Button
                          size="s"
                          prefixIcon="check"
                          label="Check in"
                          aria-label={`Check in ${p.name}`}
                          onClick={() => checkIn(a)}
                        />
                      )}
                      {a.status === "checked_in" && (
                        <Button
                          size="s"
                          variant="secondary"
                          label="Start exam"
                          aria-label={`Start exam for ${p.name}`}
                          onClick={() => setStatus(a.id, "in_exam")}
                        />
                      )}
                    </Row>
                  </Row>
                </Column>
              );
            })}
          </Column>
        </Column>

        <Column
          flex={2}
          gap="12"
          fillWidth
          minWidth={16}
          background="surface"
          border
          radius="l"
          padding="20"
          position="sticky"
          top="80"
          aria-labelledby="waiting-title"
          as="section"
        >
          <Row gap="8" vertical="center">
            <Icon name="time" onBackground="info-strong" />
            <Heading as="h2" id="waiting-title" variant="heading-strong-l">
              Waiting room
            </Heading>
            <Tag scheme="info" label={String(waiting.length)} size="s" />
          </Row>
          {waiting.length === 0 && (
            <Text variant="body-default-s" onBackground="neutral-weak">
              Nobody is waiting. Check a patient in from the schedule.
            </Text>
          )}
          <Column as="ol" gap="8" margin="0" padding="0" style={{ listStyle: "none" }}>
            {waiting.map((a, i) => {
              const p = getPatient(a.patient);
              if (!p) return null;
              const mins = Math.max(0, now - (a.checkedInAt ?? now));
              const late = mins >= 15;
              return (
                <Column
                  as="li"
                  key={a.id}
                  background="neutral-alpha-weak"
                  radius="m"
                  padding="12"
                  gap="4"
                >
                  <Row horizontal="between" vertical="center" gap="8">
                    <Text variant="label-strong-m">
                      {i === 0 ? "Next: " : `${i + 1}. `}
                      {p.name}
                    </Text>
                    <Text
                      variant="label-strong-s"
                      onBackground={late ? "warning-strong" : "neutral-medium"}
                    >
                      {mins} min waiting
                    </Text>
                  </Row>
                  <Text variant="body-default-s" onBackground="neutral-weak">
                    {getVet(a.vet)?.name} · booked {a.start} · in at {toClock(a.checkedInAt ?? now)}
                  </Text>
                  <AlertTags alerts={p.alerts} compact />
                </Column>
              );
            })}
          </Column>
        </Column>
      </Row>

      <Dialog
        open={bookOpen}
        onClose={() => {
          setBookOpen(false);
          resetForm();
        }}
        title="Book an appointment"
        description="Pick a patient, a vet and a time. A vet cannot be booked twice at the same time."
        footer={
          <Row gap="8" horizontal="end" fillWidth>
            <Button
              variant="tertiary"
              label="Cancel"
              onClick={() => {
                setBookOpen(false);
                resetForm();
              }}
            />
            <Button label="Book" onClick={book} />
          </Row>
        }
      >
        <Column gap="16" paddingTop="8">
          <Select
            id="book-patient"
            label="Patient"
            value={patientId}
            onSelect={(v) => setPatientId(v as string)}
            searchable
            options={patients.map((p) => ({
              value: p.id,
              label: `${p.name} (${getOwner(p.owner)?.name})${p.alerts.length ? " ⚠" : ""}`,
            }))}
            error={submitted && !patientId}
          />
          {patientId && (
            <AlertTags alerts={getPatient(patientId)?.alerts ?? []} />
          )}
          <Select
            id="book-vet"
            label="Vet"
            value={vetId}
            onSelect={(v) => setVetId(v as string)}
            options={vets.map((v) => ({ value: v.id, label: `${v.name} · ${v.room}` }))}
            error={submitted && !vetId}
          />
          <Row gap="12" s={{ direction: "column" }}>
            <Select
              id="book-time"
              label="Time"
              value={time}
              onSelect={(v) => setTime(v as string)}
              options={slots}
              error={submitted && !time}
            />
            <Select
              id="book-length"
              label="Length"
              value={minutes}
              onSelect={(v) => setMinutes(v as string)}
              options={durations}
            />
          </Row>
          <Input
            id="book-reason"
            label="Reason for visit"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            error={submitted && !reason.trim()}
          />
          {clash && (
            <Row
              role="alert"
              gap="8"
              padding="12"
              radius="m"
              background="danger-alpha-medium"
              vertical="center"
            >
              <Icon name="danger" onBackground="danger-strong" />
              <Text variant="body-default-s" onBackground="danger-strong">
                {getVet(vetId)?.name} already has {clashPatient?.name} from {clash.start} to{" "}
                {toClock(toMinutes(clash.start) + clash.minutes)}. Choose another time or vet.
              </Text>
            </Row>
          )}
          {submitted && !ready && (
            <Text role="alert" variant="body-default-s" onBackground="danger-strong">
              Fill in the patient, vet, time and reason.
            </Text>
          )}
        </Column>
      </Dialog>
    </Column>
  );
}
