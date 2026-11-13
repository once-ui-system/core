"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, Column, Dialog, Grid, Icon, Input, Row, Select, Text } from "@once-ui-system/core";
import { owners, ownerById, patientById, patients, vetById, vets } from "@/lib/data";
import { CLOSE, OPEN, findConflict, nextFree } from "@/lib/schedule";
import { fmt, fmtRange, toMin } from "@/lib/time";
import { AlertBanner } from "@/components/Alerts";
import { useDesk } from "@/components/DeskProvider";

const DURATIONS = [15, 20, 30, 45, 60];

function first(value: string | string[]): string {
  return Array.isArray(value) ? (value[0] ?? "") : value;
}

export function BookingDialog() {
  const { appointments, now, book, bookingOpen, bookingPatientId, closeBooking } = useDesk();
  const [patientId, setPatientId] = useState("");
  const [vetId, setVetId] = useState("");
  const [start, setStart] = useState("");
  const [minutes, setMinutes] = useState("20");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (bookingOpen) {
      setPatientId(bookingPatientId ?? "");
      setVetId("");
      setStart("");
      setMinutes("20");
      setReason("");
      setError("");
    }
  }, [bookingOpen, bookingPatientId]);

  const length = Number(minutes);
  const startMin = start ? toMin(start) : null;

  const conflict = useMemo(
    () => (vetId && startMin !== null ? findConflict(appointments, vetId, startMin, length) : undefined),
    [appointments, vetId, startMin, length],
  );
  const pastClose = startMin !== null && startMin + length > CLOSE;
  const suggestion = useMemo(
    () => (conflict && vetId && startMin !== null ? nextFree(appointments, vetId, length, startMin) : null),
    [conflict, appointments, vetId, startMin, length],
  );

  const timeOptions = useMemo(() => {
    const options: { value: string; label: string }[] = [];
    const from = Math.max(OPEN, Math.ceil(now / 15) * 15);
    for (let t = from; t < CLOSE; t += 15) {
      const busy = vetId ? findConflict(appointments, vetId, t, length) : undefined;
      options.push({ value: fmt(t), label: busy ? `${fmt(t)} (busy)` : fmt(t) });
    }
    return options;
  }, [appointments, now, vetId, length]);

  const patient = patientId ? patientById[patientId] : undefined;
  const vet = vetId ? vetById[vetId] : undefined;
  const canSubmit = Boolean(patient && vet && start && reason.trim() && !conflict && !pastClose);

  function submit() {
    if (!canSubmit) return;
    const result = book({ patient: patientId, vet: vetId, start, minutes: length, reason });
    if (result.ok) closeBooking();
    else setError(result.error);
  }

  return (
    <Dialog
      open={bookingOpen}
      onClose={closeBooking}
      title="Book an appointment"
      description="Pick the patient, the vet and a time. Times that clash with the vet's schedule are marked busy."
      footer={
        <Row gap="8" horizontal="end" wrap>
          <Button variant="secondary" onClick={closeBooking}>
            Cancel
          </Button>
          <Button prefixIcon="calendar" disabled={!canSubmit} onClick={submit}>
            Book appointment
          </Button>
        </Row>
      }
    >
      <Column gap="16" fillWidth paddingTop="8">
        <Select
          id="book-patient"
          label="Patient"
          value={patientId}
          onValueChange={(v) => setPatientId(first(v))}
          options={patients.map((p) => ({
            value: p.id,
            label: `${p.name} (${p.species}) · ${ownerById[p.owner]?.name ?? ""}${p.alerts.length ? " · medical alert" : ""}`,
          }))}
        />
        {patient && <AlertBanner alerts={patient.alerts} compact />}

        <Select
          id="book-vet"
          label="Vet"
          value={vetId}
          onValueChange={(v) => {
            setVetId(first(v));
            setError("");
          }}
          options={vets.map((v) => ({ value: v.id, label: `${v.name} · ${v.room}` }))}
        />

        <Grid columns="2" gap="12">
          <Select
            id="book-time"
            label="Start time"
            value={start}
            onValueChange={(v) => {
              setStart(first(v));
              setError("");
            }}
            options={timeOptions}
          />
          <Select
            id="book-length"
            label="Length"
            value={minutes}
            onValueChange={(v) => {
              setMinutes(first(v));
              setError("");
            }}
            options={DURATIONS.map((d) => ({ value: String(d), label: `${d} min` }))}
          />
        </Grid>

        <Input id="book-reason" label="Reason for visit" value={reason} onValueChange={setReason} />

        <div role="status" aria-live="polite">
          {conflict && vet && (
            <Column background="danger-alpha-weak" border="danger-strong" radius="m" padding="12" gap="8">
              <Row gap="8" vertical="start" onBackground="danger-strong" textVariant="label-strong-m">
                <Icon name="warning" size="s" />
                <span>
                  {vet.name} already has {patientById[conflict.patient]?.name} booked{" "}
                  {fmtRange(conflict.start, conflict.minutes)} ({conflict.reason}).
                </span>
              </Row>
              {suggestion !== null && (
                <Row>
                  <Button
                    size="s"
                    variant="secondary"
                    onClick={() => {
                      setStart(fmt(suggestion));
                      setError("");
                    }}
                  >
                    Use next free time, {fmt(suggestion)}
                  </Button>
                </Row>
              )}
            </Column>
          )}
          {!conflict && pastClose && (
            <Text textVariant="label-strong-m" onBackground="danger-strong">
              That visit would run past closing time ({fmt(CLOSE)}).
            </Text>
          )}
          {error && (
            <Text textVariant="label-strong-m" onBackground="danger-strong">
              {error}
            </Text>
          )}
          {!conflict && !pastClose && !error && vet && start && (
            <Text textVariant="body-default-s" onBackground="success-strong">
              {vet.name} is free {fmtRange(start, length)} in {vet.room}.
            </Text>
          )}
        </div>
        {owners.length === 0 ? null : null}
      </Column>
    </Dialog>
  );
}
