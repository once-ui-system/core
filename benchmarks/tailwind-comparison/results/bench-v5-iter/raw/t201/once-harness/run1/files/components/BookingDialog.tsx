"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, Checkbox, Column, Dialog, Input, Row, Select, Text, useToast } from "@once-ui-system/core";
import { AlertBanner } from "./AlertTags";
import { useClinic } from "@/lib/clinic";
import { SLOTS, endTime, findClash, getOwner, getPatient, getVet, patients, toMin, vets } from "@/lib/data";

const DURATIONS = ["15", "20", "30", "45", "60"];

export function BookingDialog() {
  const { bookingOpen, bookingPatient, closeBooking, appointments, book, now } = useClinic();
  const { addToast } = useToast();
  const [patient, setPatient] = useState("");
  const [vet, setVet] = useState("");
  const [minutes, setMinutes] = useState("20");
  const [start, setStart] = useState("");
  const [reason, setReason] = useState("");
  const [urgent, setUrgent] = useState(false);
  const [tried, setTried] = useState(false);

  // A fresh form each time the dialog opens, with the patient preselected when we know them.
  useEffect(() => {
    if (bookingOpen) {
      setPatient(bookingPatient ?? "");
      setVet("");
      setMinutes("20");
      setStart("");
      setReason("");
      setUrgent(false);
      setTried(false);
    }
  }, [bookingOpen, bookingPatient]);

  const dur = Number(minutes);
  const chosen = getPatient(patient);

  const slotOptions = useMemo(
    () =>
      SLOTS.map((s) => {
        const past = toMin(s) < toMin(now);
        const clash = vet ? findClash(appointments, vet, s, dur) : undefined;
        const disabled = past || Boolean(clash);
        return {
          value: s,
          label: `${s} – ${endTime({ start: s, minutes: dur })}`,
          disabled,
          description: past ? "Already passed" : clash ? "Taken" : undefined,
        };
      }),
    [appointments, vet, dur, now],
  );

  const clash = vet && start ? findClash(appointments, vet, start, dur) : undefined;
  const startError = tried && !start ? "Pick a time" : clash ? "That time overlaps another booking for this vet." : undefined;

  function submit() {
    setTried(true);
    if (!patient || !vet || !start || !reason.trim() || clash) return;
    const res = book({ patient, vet, start, minutes: dur, reason, urgent });
    if (res.ok) {
      const p = getPatient(patient);
      addToast({
        variant: "success",
        message: `Booked ${p?.name} with ${getVet(vet)?.name} at ${start}.`,
      });
      closeBooking();
    } else {
      addToast({ variant: "danger", message: res.error });
    }
  }

  return (
    <Dialog
      open={bookingOpen}
      onClose={closeBooking}
      title="Book an appointment"
      description="Today, Thursday 12 November. Times that clash with the vet's other bookings are not offered."
      footer={
        <Row gap="8" horizontal="end" fillWidth>
          <Button variant="tertiary" onClick={closeBooking}>
            Cancel
          </Button>
          <Button prefixIcon="calendar" onClick={submit}>
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
          error={tried && !patient}
          errorMessage={tried && !patient ? "Pick a patient" : undefined}
          options={patients.map((p) => ({
            value: p.id,
            label: `${p.name} · ${p.species}, ${getOwner(p.owner)?.name}`,
          }))}
        />
        {chosen && <AlertBanner name={chosen.name} alerts={chosen.alerts} />}
        <Select
          id="book-vet"
          label="Vet"
          value={vet}
          onValueChange={(v) => setVet(String(v))}
          error={tried && !vet}
          errorMessage={tried && !vet ? "Pick a vet" : undefined}
          options={vets.map((v) => ({ value: v.id, label: `${v.name} · ${v.room}` }))}
        />
        <Row gap="12" s={{ direction: "column" }}>
          <Select
            id="book-length"
            label="Length"
            value={minutes}
            onValueChange={(v) => setMinutes(String(v))}
            options={DURATIONS.map((d) => ({ value: d, label: `${d} minutes` }))}
          />
          <Select
            id="book-time"
            label="Time"
            value={start}
            onValueChange={(v) => setStart(String(v))}
            error={Boolean(startError)}
            errorMessage={startError}
            options={slotOptions}
          />
        </Row>
        <Input
          id="book-reason"
          label="Reason for visit"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          error={tried && !reason.trim()}
          errorMessage={tried && !reason.trim() ? "Add a short reason" : undefined}
        />
        <Checkbox
          id="book-urgent"
          label="Urgent visit"
          checked={urgent}
          onCheckedChange={setUrgent}
        />
        {!vet && (
          <Text textVariant="body-default-s" onBackground="neutral-weak">
            Choose a vet to see which times are free.
          </Text>
        )}
      </Column>
    </Dialog>
  );
}
