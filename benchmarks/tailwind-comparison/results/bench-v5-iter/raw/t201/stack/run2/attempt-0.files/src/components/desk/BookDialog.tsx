"use client";

import { useMemo, useState } from "react";
import { Button, Column, Dialog, Input, Row, Select, Text } from "@once-ui-system/core";
import {
  type Appointment,
  findClash,
  fmtTime,
  getOwner,
  getPatient,
  getVet,
  patients,
  toMin,
  vets,
} from "@/lib/data";
import { AlertTags } from "./AlertTags";
import { useDesk } from "./DeskProvider";

const slots: { value: string; label: string }[] = [];
for (let m = 8 * 60; m < 17 * 60; m += 15) slots.push({ value: fmtTime(m), label: fmtTime(m) });

const durations = [15, 20, 30, 45, 60].map((d) => ({ value: String(d), label: `${d} minutes` }));

export function BookDialog({
  open,
  onClose,
  onBooked,
}: {
  open: boolean;
  onClose: () => void;
  onBooked: (a: Appointment) => void;
}) {
  const { appointments, book } = useDesk();
  const [patient, setPatient] = useState("");
  const [vet, setVet] = useState("v-1");
  const [start, setStart] = useState("10:00");
  const [minutes, setMinutes] = useState("20");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  const clash = useMemo(() => findClash(appointments, vet, start, Number(minutes)), [appointments, vet, start, minutes]);
  const picked = getPatient(patient);

  function clashText(c: Appointment): string {
    const p = getPatient(c.patient);
    return `${getVet(c.vet).name} already has ${p?.name ?? "a patient"} from ${c.start} to ${fmtTime(toMin(c.start) + c.minutes)}. Pick another time or vet.`;
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!picked) {
      setError("Choose a patient first.");
      return;
    }
    if (!reason.trim()) {
      setError("Add a reason for the visit.");
      return;
    }
    const res = book({ patient, vet, start, minutes: Number(minutes), reason: reason.trim() });
    if (!res.ok) {
      setError(clashText(res.clash));
      return;
    }
    onBooked({ id: res.id, status: "booked", patient, vet, start, minutes: Number(minutes), reason: reason.trim() });
    setPatient("");
    setReason("");
    setError("");
  }

  const message = error || (clash ? clashText(clash) : "");

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Book an appointment"
      description="Pick the patient, the vet and a free time."
    >
      <form onSubmit={submit} noValidate>
        <Column gap="16">
          <Select
            id="book-patient"
            label="Patient"
            value={patient}
            searchable
            options={patients.map((p) => ({
              value: p.id,
              label: `${p.name} (${p.species}) · ${getOwner(p.owner).name}`,
            }))}
            onSelect={(v) => {
              setPatient(String(v));
              setError("");
            }}
          />
          {picked && picked.alerts.length > 0 && <AlertTags alerts={picked.alerts} />}
          <Select
            id="book-vet"
            label="Vet"
            value={vet}
            options={vets.map((v) => ({ value: v.id, label: `${v.name} · ${v.room}` }))}
            onSelect={(v) => {
              setVet(String(v));
              setError("");
            }}
          />
          <Row gap="12" s={{ direction: "column" }}>
            <Select
              id="book-time"
              label="Start time"
              value={start}
              options={slots}
              onSelect={(v) => {
                setStart(String(v));
                setError("");
              }}
            />
            <Select
              id="book-length"
              label="Length"
              value={minutes}
              options={durations}
              onSelect={(v) => {
                setMinutes(String(v));
                setError("");
              }}
            />
          </Row>
          <Input
            id="book-reason"
            label="Reason for visit"
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              setError("");
            }}
          />
          <div role="alert" aria-live="assertive">
            {message && (
              <Row background="danger-alpha-weak" border="danger-alpha-medium" radius="m" padding="12" gap="8">
                <Text variant="body-default-s" onBackground="danger-strong">
                  {message}
                </Text>
              </Row>
            )}
          </div>
          <Row gap="8" horizontal="end">
            <Button type="button" variant="secondary" label="Cancel" onClick={onClose} />
            <Button type="submit" label="Book appointment" prefixIcon="calendar" disabled={Boolean(clash)} />
          </Row>
        </Column>
      </form>
    </Dialog>
  );
}
