"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Box, Button, chakra, Input, Stack, Text } from "@chakra-ui/react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DialogActionTrigger,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { NativeSelectField, NativeSelectRoot } from "@/components/ui/native-select";
import { AlertChips } from "@/components/patient-alerts";
import { useClinic } from "@/components/clinic-provider";
import {
  CLOSE_MIN,
  OPEN_MIN,
  describePatientConflict,
  describeVetConflict,
  findPatientConflict,
  findVetConflict,
  fmtDuration,
  fmtMin,
  getPatient,
  minToTime,
  nextFreeStart,
  ownerOf,
  patients,
  toMin,
  vets,
} from "@/lib/data";

const LENGTHS = [15, 20, 30, 45, 60, 90, 120];

interface BookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBooked: (id: string) => void;
}

export function BookingDialog({ open, onOpenChange, onBooked }: BookingDialogProps) {
  return (
    <DialogRoot
      open={open}
      onOpenChange={(e) => onOpenChange(e.open)}
      placement="center"
      scrollBehavior="inside"
      lazyMount
      unmountOnExit
    >
      <DialogContent>
        <BookingForm onClose={() => onOpenChange(false)} onBooked={onBooked} />
      </DialogContent>
    </DialogRoot>
  );
}

function BookingForm({ onClose, onBooked }: { onClose: () => void; onBooked: (id: string) => void }) {
  const { appointments, now, book } = useClinic();

  const [patientId, setPatientId] = useState("");
  const [vetId, setVetId] = useState(vets[0].id);
  const [minutes, setMinutes] = useState(20);
  const [time, setTime] = useState(() => nextFreeStart(appointments, vets[0].id, 20, now) ?? "");
  const [reason, setReason] = useState("");
  const [urgent, setUrgent] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const patient = patientId ? getPatient(patientId) : undefined;

  const sortedPatients = useMemo(
    () => [...patients].sort((a, b) => a.name.localeCompare(b.name)),
    [],
  );

  const patientItems = sortedPatients.map((p) => ({
    value: p.id,
    label: `${p.name} (${p.species}) · ${ownerOf(p).name}${p.alerts.length > 0 ? " · ALERT" : ""}`,
  }));

  const vetItems = vets.map((v) => ({ value: v.id, label: `${v.name} · ${v.room}` }));
  const lengthItems = LENGTHS.map((m) => ({ value: String(m), label: fmtDuration(m) }));

  const timeItems = useMemo(() => {
    const items: { value: string; label: string; disabled?: boolean }[] = [];
    for (let t = OPEN_MIN; t < CLOSE_MIN; t += 15) {
      const label = fmtMin(t);
      if (t < now) items.push({ value: minToTime(t), label: `${label} (passed)`, disabled: true });
      else if (t + minutes > CLOSE_MIN) items.push({ value: minToTime(t), label: `${label} (after closing)`, disabled: true });
      else if (findVetConflict(appointments, vetId, t, minutes))
        items.push({ value: minToTime(t), label: `${label} (taken)`, disabled: true });
      else items.push({ value: minToTime(t), label });
    }
    return items;
  }, [appointments, vetId, minutes, now]);

  const timeError = useMemo(() => {
    if (!time) return "There is no free time left today for this vet and length.";
    const start = toMin(time);
    if (start < now) return "That time has already passed.";
    if (start + minutes > CLOSE_MIN) return "That appointment would run past closing time.";
    const vetClash = findVetConflict(appointments, vetId, start, minutes);
    if (vetClash) return describeVetConflict(vetClash);
    if (patientId) {
      const patientClash = findPatientConflict(appointments, patientId, start, minutes);
      if (patientClash) return describePatientConflict(patientClash);
    }
    return "";
  }, [appointments, vetId, minutes, time, now, patientId]);

  const suggestion = timeError ? nextFreeStart(appointments, vetId, minutes, now) : undefined;

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
    if (!patientId || !reason.trim() || !time || timeError) return;
    const result = book({ patient: patientId, vet: vetId, start: time, minutes, reason, urgent });
    if (!result.ok) return;
    onBooked(result.id);
    onClose();
  };

  return (
    <chakra.form display="contents" onSubmit={onSubmit} noValidate>
      <DialogHeader>
        <Stack gap="1">
          <DialogTitle>Book an appointment</DialogTitle>
          <DialogDescription>
            Pick a patient, a vet and a time. A time that clashes with another booking for the same vet cannot be chosen.
          </DialogDescription>
        </Stack>
      </DialogHeader>
      <DialogCloseTrigger />
      <DialogBody>
        <Stack gap="4">
          <Field
            label="Patient"
            required
            invalid={submitted && !patientId}
            errorText="Choose a patient."
          >
            <NativeSelectRoot size="lg">
              <NativeSelectField
                placeholder="Choose a patient"
                items={patientItems}
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
              />
            </NativeSelectRoot>
          </Field>

          {patient && patient.alerts.length > 0 && (
            <Box>
              <Text fontSize="sm" fontWeight="medium" mb="1.5">
                Alerts for {patient.name}
              </Text>
              <AlertChips alerts={patient.alerts} />
            </Box>
          )}

          <Field label="Vet" required>
            <NativeSelectRoot size="lg">
              <NativeSelectField items={vetItems} value={vetId} onChange={(e) => setVetId(e.target.value)} />
            </NativeSelectRoot>
          </Field>

          <Stack direction={{ base: "column", sm: "row" }} gap="4">
            <Field
              label="Time"
              required
              invalid={Boolean(timeError)}
              errorText={timeError}
            >
              <NativeSelectRoot size="lg">
                <NativeSelectField items={timeItems} value={time} onChange={(e) => setTime(e.target.value)} />
              </NativeSelectRoot>
            </Field>
            <Field label="Length" required>
              <NativeSelectRoot size="lg">
                <NativeSelectField
                  items={lengthItems}
                  value={String(minutes)}
                  onChange={(e) => setMinutes(Number(e.target.value))}
                />
              </NativeSelectRoot>
            </Field>
          </Stack>

          {suggestion && (
            <Button
              type="button"
              variant="subtle"
              colorPalette="teal"
              alignSelf="flex-start"
              onClick={() => setTime(suggestion)}
            >
              Use next free time: {fmtMin(toMin(suggestion))}
            </Button>
          )}

          <Field
            label="Reason for visit"
            required
            invalid={submitted && !reason.trim()}
            errorText="Add a short reason."
          >
            <Input
              size="lg"
              value={reason}
              placeholder="For example: Ear infection follow-up"
              onChange={(e) => setReason(e.target.value)}
            />
          </Field>

          <Checkbox checked={urgent} onCheckedChange={(e) => setUrgent(e.checked === true)} colorPalette="orange">
            Urgent visit (stands out on the schedule)
          </Checkbox>
        </Stack>
      </DialogBody>
      <DialogFooter>
        <DialogActionTrigger asChild>
          <Button type="button" variant="outline" size="lg">
            Cancel
          </Button>
        </DialogActionTrigger>
        <Button type="submit" colorPalette="teal" size="lg" disabled={Boolean(timeError)}>
          Book appointment
        </Button>
      </DialogFooter>
    </chakra.form>
  );
}
