"use client";

import { useState } from "react";
import { Button, Checkbox, Column, Dialog, Input, Row, Select, Text } from "@once-ui-system/core";
import { AlertChips } from "@/components/Alerts";
import {
  type Appointment,
  CLINIC_CLOSE,
  fmtClock,
  fmtTime,
  findClash,
  firstFreeSlot,
  ownerById,
  PATIENTS,
  patientById,
  SLOTS,
  toMinutes,
  VETS,
  vetById,
} from "@/lib/data";

const DURATIONS = [15, 20, 30, 45, 60];

type Props = {
  open: boolean;
  onClose: () => void;
  appointments: Appointment[];
  now: number;
  onBook: (draft: Omit<Appointment, "id" | "status">) => void;
};

/** Mount with a fresh `key` each time it opens so the form starts clean. */
export function BookingDialog({ open, onClose, appointments, now, onBook }: Props) {
  const [patientId, setPatientId] = useState("");
  const [vetId, setVetId] = useState(VETS[0].id);
  const [minutes, setMinutes] = useState("20");
  const [start, setStart] = useState(() => firstFreeSlot(appointments, VETS[0].id, 20, now));
  const [reason, setReason] = useState("");
  const [urgent, setUrgent] = useState(false);
  const [tried, setTried] = useState(false);

  const dur = Number(minutes);
  const startMin = toMinutes(start);
  const clash = findClash(appointments, vetId, startMin, dur);
  const past = startMin < now;
  const afterClose = startMin + dur > CLINIC_CLOSE;
  const patient = patientById(patientId);

  let timeError: string | null = null;
  if (clash) {
    const who = patientById(clash.patient)?.name ?? "another patient";
    const end = fmtClock(toMinutes(clash.start) + clash.minutes);
    timeError = `${vetById(vetId).name} is already booked ${fmtTime(clash.start)} to ${end} (${who}, ${clash.reason}). Choose another time or vet.`;
  } else if (afterClose) {
    timeError = `This would end after closing at ${fmtClock(CLINIC_CLOSE)}.`;
  } else if (past) {
    timeError = "That time has already passed.";
  }

  const patientOptions = PATIENTS.map((p) => ({ value: p.id, label: `${p.name}, owner ${ownerById(p.owner).name}` }));
  const vetOptions = VETS.map((v) => ({ value: v.id, label: `${v.name} (${v.room})` }));
  const durationOptions = DURATIONS.map((d) => ({ value: String(d), label: `${d} minutes` }));
  const timeOptions = SLOTS.map((slot) => {
    const s = toMinutes(slot);
    const taken = !!findClash(appointments, vetId, s, dur);
    const late = s + dur > CLINIC_CLOSE;
    const gone = s < now;
    const note = taken ? " (booked)" : gone ? " (passed)" : late ? " (after close)" : "";
    return { value: slot, label: `${fmtTime(slot)}${note}`, disabled: taken || gone || late };
  });

  const submit = () => {
    setTried(true);
    if (!patientId || timeError) return;
    onBook({ patient: patientId, vet: vetId, start, minutes: dur, reason: reason.trim() || "Follow-up", urgent: urgent || undefined });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Book an appointment"
      description="Pick a patient, a vet and a time. Times already taken for that vet are greyed out."
      footer={
        <Row gap="8" horizontal="end" fillWidth wrap>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button prefixIcon="calendar" onClick={submit} disabled={!!timeError}>
            Book appointment
          </Button>
        </Row>
      }
    >
      <Column
        as="form"
        gap="16"
        paddingTop="8"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <Select
          id="book-patient"
          label="Patient"
          searchable
          options={patientOptions}
          value={patientId}
          onValueChange={(v) => setPatientId(String(v))}
          error={tried && !patientId}
          errorMessage={tried && !patientId ? "Choose a patient." : undefined}
        />
        {patient && (
          <Column gap="8">
            <Text textVariant="body-default-s" onBackground="neutral-weak">
              {patient.species}, {patient.breed}. Owner {ownerById(patient.owner).name}, {ownerById(patient.owner).phone}
            </Text>
            <AlertChips alerts={patient.alerts} size="m" />
          </Column>
        )}
        <Select
          id="book-vet"
          label="Vet"
          options={vetOptions}
          value={vetId}
          onValueChange={(v) => setVetId(String(v))}
        />
        <Row gap="12" wrap>
          <Column flex="1" style={{ minWidth: "12rem" }}>
            <Select
              id="book-time"
              label="Time"
              options={timeOptions}
              value={start}
              onValueChange={(v) => setStart(String(v))}
              error={!!timeError}
            />
          </Column>
          <Column flex="1" style={{ minWidth: "12rem" }}>
            <Select
              id="book-duration"
              label="Length"
              options={durationOptions}
              value={minutes}
              onValueChange={(v) => setMinutes(String(v))}
            />
          </Column>
        </Row>
        {timeError && (
          <Row role="alert" gap="8" padding="12" radius="m" background="danger-alpha-weak" border="danger-alpha-strong">
            <Text textVariant="label-default-m" onBackground="danger-strong">
              {timeError}
            </Text>
          </Row>
        )}
        <Input id="book-reason" label="Reason for visit" value={reason} onValueChange={setReason} placeholder="Follow-up" />
        <Checkbox label="Urgent visit" checked={urgent} onCheckedChange={setUrgent} />
      </Column>
    </Dialog>
  );
}
