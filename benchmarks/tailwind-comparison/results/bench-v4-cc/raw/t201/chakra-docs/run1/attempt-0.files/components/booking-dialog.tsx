"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Box, Heading, Input, Stack, Text, chakra } from "@chakra-ui/react";
import { Button } from "@chakra-ui/react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DialogActionTrigger,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { NativeSelectField, NativeSelectRoot } from "@/components/ui/native-select";
import { AlertPills } from "@/components/alerts";
import { useDesk } from "@/components/desk-provider";
import { fmtClock, getOwner, getPatient, patients, vets, type Appointment } from "@/lib/data";

const OPEN_FROM = 8 * 60;
const LAST_START = 16 * 60 + 45;
const CLOSING = 17 * 60 + 30;
const DURATIONS = [15, 20, 30, 45, 60, 90];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultPatientId?: string;
  onBooked?: (appointment: Appointment) => void;
}

export function BookingDialog({ open, onOpenChange, defaultPatientId, onBooked }: Props) {
  return (
    <DialogRoot
      open={open}
      onOpenChange={(e) => onOpenChange(e.open)}
      placement="center"
      scrollBehavior="inside"
      lazyMount
      unmountOnExit
    >
      <DialogContent mx="3">
        <BookingForm defaultPatientId={defaultPatientId} onDone={(a) => { onOpenChange(false); onBooked?.(a); }} />
      </DialogContent>
    </DialogRoot>
  );
}

function BookingForm({ defaultPatientId, onDone }: { defaultPatientId?: string; onDone: (a: Appointment) => void }) {
  const { now, book, conflictFor } = useDesk();
  const [patientId, setPatientId] = useState(defaultPatientId ?? "");
  const [vetId, setVetId] = useState("");
  const [start, setStart] = useState("");
  const [minutes, setMinutes] = useState("20");
  const [reason, setReason] = useState("");
  const [urgent, setUrgent] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sortedPatients = useMemo(() => [...patients].sort((a, b) => a.name.localeCompare(b.name)), []);
  const patient = patientId ? getPatient(patientId) : null;
  const duration = Number(minutes);

  const slotItems = useMemo(() => {
    const items: { value: string; label: string; disabled?: boolean }[] = [];
    for (let m = OPEN_FROM; m <= LAST_START; m += 15) {
      let note = "";
      if (m + 15 <= now) note = " (passed)";
      else if (m + duration > CLOSING) note = " (after closing)";
      else if (vetId && patientId && conflictFor({ patient: patientId, vet: vetId, start: m, minutes: duration })) {
        note = " (unavailable)";
      }
      items.push({ value: String(m), label: `${fmtClock(m)}${note}`, disabled: note !== "" });
    }
    return items;
  }, [now, duration, vetId, patientId, conflictFor]);

  const liveConflict =
    start && vetId && patientId
      ? conflictFor({ patient: patientId, vet: vetId, start: Number(start), minutes: duration })
      : null;
  const message = error ?? liveConflict;

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (!patientId || !vetId || !start || !reason.trim()) return;
    const result = book({ patient: patientId, vet: vetId, start: Number(start), minutes: duration, reason, urgent });
    if (!result.ok) {
      setError(result.error);
      return;
    }
    onDone(result.appointment);
  };

  return (
    <chakra.form display="contents" onSubmit={onSubmit} noValidate>
      <DialogHeader>
        <DialogTitle>Book an appointment</DialogTitle>
      </DialogHeader>
      <DialogBody>
        <Stack gap="4">
          <Field label="Patient" required invalid={submitted && !patientId} errorText="Choose a patient">
            <NativeSelectRoot size="lg">
              <NativeSelectField
                placeholder="Choose a patient"
                value={patientId}
                onChange={(e) => {
                  setPatientId(e.target.value);
                  setError(null);
                }}
                items={sortedPatients.map((p) => ({
                  value: p.id,
                  label: `${p.name} (${p.species}) · ${getOwner(p.owner).name}${p.alerts.length ? " · ALERT" : ""}`,
                }))}
              />
            </NativeSelectRoot>
          </Field>
          {patient && patient.alerts.length > 0 && (
            <Box>
              <AlertPills alerts={patient.alerts} />
            </Box>
          )}
          <Field label="Vet" required invalid={submitted && !vetId} errorText="Choose a vet">
            <NativeSelectRoot size="lg">
              <NativeSelectField
                placeholder="Choose a vet"
                value={vetId}
                onChange={(e) => {
                  setVetId(e.target.value);
                  setError(null);
                }}
                items={vets.map((v) => ({ value: v.id, label: `${v.name} · ${v.room}` }))}
              />
            </NativeSelectRoot>
          </Field>
          <Stack direction={{ base: "column", sm: "row" }} gap="4">
            <Field label="Time" required invalid={submitted && !start} errorText="Choose a time">
              <NativeSelectRoot size="lg">
                <NativeSelectField
                  placeholder="Choose a time"
                  value={start}
                  onChange={(e) => {
                    setStart(e.target.value);
                    setError(null);
                  }}
                  items={slotItems}
                />
              </NativeSelectRoot>
            </Field>
            <Field label="Length">
              <NativeSelectRoot size="lg">
                <NativeSelectField
                  value={minutes}
                  onChange={(e) => {
                    setMinutes(e.target.value);
                    setError(null);
                  }}
                  items={DURATIONS.map((d) => ({ value: String(d), label: `${d} min` }))}
                />
              </NativeSelectRoot>
            </Field>
          </Stack>
          <Field label="Reason for visit" required invalid={submitted && !reason.trim()} errorText="Add a reason">
            <Input size="lg" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="For example: Vaccine booster" />
          </Field>
          <Checkbox checked={urgent} onCheckedChange={(e) => setUrgent(e.checked === true)}>
            Urgent visit
          </Checkbox>
          {message && (
            <Box role="alert" bg="red.subtle" color="red.fg" borderWidth="1px" borderColor="red.muted" rounded="md" p="3">
              <Heading as="h3" size="sm" mb="1">
                That time is not available
              </Heading>
              <Text fontSize="sm">{message} Pick another time or vet.</Text>
            </Box>
          )}
        </Stack>
      </DialogBody>
      <DialogFooter>
        <DialogActionTrigger asChild>
          <Button variant="outline" size="lg">
            Cancel
          </Button>
        </DialogActionTrigger>
        <Button type="submit" colorPalette="teal" size="lg" disabled={!!liveConflict}>
          Book appointment
        </Button>
      </DialogFooter>
      <DialogCloseTrigger />
    </chakra.form>
  );
}
