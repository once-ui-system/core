"use client";

import { useMemo, useState } from "react";
import { Button, Column, Dialog, Input, Row, Select, Text } from "@once-ui-system/core";
import {
  PATIENTS,
  SLOTS,
  VETS,
  endTime,
  findClash,
  getOwner,
  getPatient,
  getVet,
  nextFreeSlot,
  type Appointment,
} from "@/lib/data";
import { AlertTags } from "./AlertTags";

const DURATIONS = [15, 20, 30, 45, 60];
const one = (v: string | string[]) => (Array.isArray(v) ? (v[0] ?? "") : v);

export function BookDialog({
  open,
  onClose,
  appointments,
  now,
  onBook,
}: {
  open: boolean;
  onClose: () => void;
  appointments: Appointment[];
  now: number;
  onBook: (a: Appointment) => void;
}) {
  const [patientId, setPatientId] = useState("");
  const [vetId, setVetId] = useState("");
  const [start, setStart] = useState("");
  const [minutes, setMinutes] = useState("20");
  const [reason, setReason] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const patient = getPatient(patientId);
  const mins = Number(minutes);
  const clash = useMemo(
    () => (vetId && start ? findClash(appointments, vetId, patientId, start, mins) : null),
    [appointments, vetId, patientId, start, mins],
  );
  const suggestion = useMemo(
    () => (clash && vetId ? nextFreeSlot(appointments, vetId, patientId, mins, now) : null),
    [clash, appointments, vetId, patientId, mins, now],
  );

  const clashText = clash
    ? clash.kind === "vet"
      ? `${getVet(clash.with.vet)?.name} is already booked ${clash.with.start} to ${endTime(clash.with.start, clash.with.minutes)} (${getPatient(clash.with.patient)?.name}, ${clash.with.reason}).`
      : `${patient?.name} already has an appointment ${clash.with.start} to ${endTime(clash.with.start, clash.with.minutes)} with ${getVet(clash.with.vet)?.name}.`
    : "";

  const reset = () => {
    setPatientId("");
    setVetId("");
    setStart("");
    setMinutes("20");
    setReason("");
    setSubmitted(false);
  };
  const close = () => {
    reset();
    onClose();
  };

  const submit = () => {
    setSubmitted(true);
    if (!patientId || !vetId || !start || clash) return;
    onBook({
      id: `a-new-${appointments.length + 1}`,
      patient: patientId,
      vet: vetId,
      start,
      minutes: mins,
      reason: reason.trim() || "Follow-up",
      status: "booked",
      isNew: true,
    });
    close();
  };

  return (
    <Dialog
      open={open}
      onClose={close}
      title="Book an appointment"
      description="Pick a patient, a vet and a time. A vet cannot be booked twice at the same time."
      footer={
        <Row gap="8" horizontal="end" fillWidth>
          <Button variant="tertiary" onClick={close}>
            Cancel
          </Button>
          <Button prefixIcon="calendar" onClick={submit}>
            Book appointment
          </Button>
        </Row>
      }
    >
      <Column
        as="form"
        gap="16"
        onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
          e.preventDefault();
          submit();
        }}
        noValidate
      >
        <Select
          id="book-patient"
          label="Patient"
          searchable
          value={patientId}
          onValueChange={(v) => setPatientId(one(v))}
          options={PATIENTS.map((p) => ({
            value: p.id,
            label: `${p.name} (${p.species}, ${getOwner(p.owner)?.name})`,
          }))}
          error={submitted && !patientId}
          errorMessage={submitted && !patientId ? "Choose a patient" : undefined}
        />
        {patient && patient.alerts.length > 0 && (
          <Column gap="4" padding="12" radius="m" background="danger-alpha-weak" border="danger-medium">
            <Text textVariant="label-strong-s" onBackground="danger-strong">
              Medical alerts for {patient.name}
            </Text>
            <AlertTags alerts={patient.alerts} size="m" />
          </Column>
        )}
        <Select
          id="book-vet"
          label="Vet"
          value={vetId}
          onValueChange={(v) => setVetId(one(v))}
          options={VETS.map((v) => ({ value: v.id, label: `${v.name} (${v.room})` }))}
          error={submitted && !vetId}
          errorMessage={submitted && !vetId ? "Choose a vet" : undefined}
        />
        <Row gap="12" s={{ direction: "column" }}>
          <Select
            id="book-time"
            label="Time"
            value={start}
            onValueChange={(v) => setStart(one(v))}
            options={SLOTS.map((s) => ({ value: s, label: s }))}
            error={Boolean(clash) || (submitted && !start)}
            errorMessage={submitted && !start ? "Choose a time" : undefined}
          />
          <Select
            id="book-length"
            label="Length"
            value={minutes}
            onValueChange={(v) => setMinutes(one(v))}
            options={DURATIONS.map((d) => ({ value: String(d), label: `${d} minutes` }))}
          />
        </Row>
        {clash && (
          <Column role="alert" gap="8" padding="12" radius="m" background="danger-alpha-weak" border="danger-medium">
            <Text textVariant="label-strong-s" onBackground="danger-strong">
              That time clashes with an existing booking
            </Text>
            <Text textVariant="body-default-s">{clashText}</Text>
            {suggestion && (
              <Row>
                <Button size="s" variant="secondary" onClick={() => setStart(suggestion)}>
                  Use next free time, {suggestion}
                </Button>
              </Row>
            )}
          </Column>
        )}
        <Input id="book-reason" label="Reason for visit" value={reason} onValueChange={setReason} />
      </Column>
    </Dialog>
  );
}
