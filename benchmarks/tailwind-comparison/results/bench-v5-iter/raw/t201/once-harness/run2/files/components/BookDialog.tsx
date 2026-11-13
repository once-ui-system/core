"use client";

import { useState } from "react";
import { Button, Column, Dialog, Icon, Input, Row, Select, Text } from "@once-ui-system/core";
import { AlertTags } from "@/components/AlertTags";
import {
  type Appointment,
  findClash,
  getOwner,
  getPatient,
  getVet,
  patients,
  toClock,
  toMinutes,
  vets,
} from "@/lib/data";

const SLOTS = Array.from({ length: 37 }, (_, i) => toClock(8 * 60 + i * 15)); // 08:00 - 17:00
const DURATIONS = [15, 20, 30, 45, 60];

export interface NewBooking {
  patient: string;
  vet: string;
  start: string;
  minutes: number;
  reason: string;
}

export function BookDialog({
  open,
  onClose,
  appointments,
  onBook,
}: {
  open: boolean;
  onClose: () => void;
  appointments: Appointment[];
  onBook: (b: NewBooking) => void;
}) {
  const [patient, setPatient] = useState("");
  const [vet, setVet] = useState("");
  const [start, setStart] = useState("");
  const [minutes, setMinutes] = useState("20");
  const [reason, setReason] = useState("");

  const chosen = patient ? getPatient(patient) : undefined;
  const clash = vet && start ? findClash(appointments, vet, toMinutes(start), Number(minutes)) : undefined;
  const clashPatient = clash ? getPatient(clash.patient) : undefined;
  const ready = Boolean(patient && vet && start && !clash);

  const submit = () => {
    if (!ready) return;
    onBook({ patient, vet, start, minutes: Number(minutes), reason: reason.trim() || "Follow-up" });
    setPatient("");
    setVet("");
    setStart("");
    setMinutes("20");
    setReason("");
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Book an appointment"
      description="Pick the patient, the vet and a time. A vet cannot be booked twice at once."
      footer={
        <Row gap="8" horizontal="end" fillWidth wrap>
          <Button variant="tertiary" onClick={onClose}>
            Cancel
          </Button>
          <Button prefixIcon="calendar" disabled={!ready} onClick={submit}>
            Book appointment
          </Button>
        </Row>
      }>
      <Column gap="16" paddingTop="8">
        <Select
          id="book-patient"
          label="Patient"
          searchable
          value={patient}
          onValueChange={(v) => setPatient(String(v))}
          options={patients.map((p) => ({
            value: p.id,
            label: `${p.name} (${p.species}) · ${getOwner(p.owner)?.name ?? ""}`,
          }))}
        />
        {chosen && chosen.alerts.length > 0 && <AlertTags alerts={chosen.alerts} size="s" />}
        <Select
          id="book-vet"
          label="Vet"
          value={vet}
          onValueChange={(v) => setVet(String(v))}
          options={vets.map((v) => ({ value: v.id, label: `${v.name} · ${v.room}` }))}
        />
        <Row gap="12" s={{ direction: "column" }}>
          <Select
            id="book-time"
            label="Time"
            value={start}
            onValueChange={(v) => setStart(String(v))}
            options={SLOTS.map((s) => ({ value: s, label: s }))}
          />
          <Select
            id="book-duration"
            label="Length"
            value={minutes}
            onValueChange={(v) => setMinutes(String(v))}
            options={DURATIONS.map((d) => ({ value: String(d), label: `${d} minutes` }))}
          />
        </Row>
        <Input id="book-reason" label="Reason for visit" value={reason} onValueChange={setReason} />
        {clash && (
          <Row
            role="alert"
            gap="8"
            padding="12"
            radius="m"
            background="danger-alpha-weak"
            border="danger-alpha-medium"
            vertical="start">
            <Icon name="danger" onBackground="danger-strong" />
            <Text textVariant="body-default-s" onBackground="danger-strong">
              {getVet(clash.vet)?.name} already has {clashPatient?.name} from {clash.start} to{" "}
              {toClock(toMinutes(clash.start) + clash.minutes)}. Choose another time or another vet.
            </Text>
          </Row>
        )}
      </Column>
    </Dialog>
  );
}
