"use client";

import { useMemo, useState } from "react";
import { Box, Button, Stack, Text, Input, SimpleGrid } from "@chakra-ui/react";
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
import { AlertChips } from "@/components/patient-alerts";
import {
  type Appointment,
  fmtRange,
  fmtTime,
  fromMinutes,
  ownerById,
  patientById,
  patients,
  vetById,
  vets,
} from "@/lib/data";
import { findClash, slotsFor } from "@/lib/schedule";

const DURATIONS = [15, 20, 30, 45, 60, 90];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointments: Appointment[];
  now: number;
  onBook: (appt: Omit<Appointment, "id">) => void;
}

export function BookingDialog({ open, onOpenChange, appointments, now, onBook }: Props) {
  return (
    <DialogRoot
      open={open}
      onOpenChange={(e) => onOpenChange(e.open)}
      placement="center"
      scrollBehavior="inside"
      lazyMount
      unmountOnExit
    >
      <DialogContent mx="4">
        <BookingForm appointments={appointments} now={now} onBook={onBook} />
      </DialogContent>
    </DialogRoot>
  );
}

function BookingForm({
  appointments,
  now,
  onBook,
}: {
  appointments: Appointment[];
  now: number;
  onBook: Props["onBook"];
}) {
  const [patientId, setPatientId] = useState(patients[0].id);
  const [vetId, setVetId] = useState(vets[0].id);
  const [minutes, setMinutes] = useState(20);
  const [reason, setReason] = useState("Follow-up visit");
  const [start, setStart] = useState<number>(() => {
    const slots = slotsFor(20);
    return (
      slots.find((t) => t >= now && !findClash(appointments, vets[0].id, t, 20)) ??
      slots.find((t) => !findClash(appointments, vets[0].id, t, 20)) ??
      slots[0]
    );
  });

  const slots = useMemo(() => slotsFor(minutes), [minutes]);
  const startValue = slots.includes(start) ? start : slots[slots.length - 1];
  const clash = findClash(appointments, vetId, startValue, minutes);
  const patient = patientById(patientId);
  const vet = vetById(vetId);

  const nextFree = clash
    ? slots.find((t) => t > startValue && !findClash(appointments, vetId, t, minutes))
    : undefined;

  const timeItems = slots.map((t) => ({
    value: String(t),
    label: findClash(appointments, vetId, t, minutes) ? `${fmtTime(t)} · taken` : fmtTime(t),
  }));

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        if (clash) return;
        onBook({
          patient: patientId,
          vet: vetId,
          start: fromMinutes(startValue),
          minutes,
          reason: reason.trim() || "Follow-up visit",
          status: "booked",
        });
      }}
    >
      <DialogHeader>
        <DialogTitle>Book an appointment</DialogTitle>
      </DialogHeader>
      <DialogCloseTrigger />
      <DialogBody>
        <Stack gap="4">
          <Field label="Patient">
            <NativeSelectRoot>
              <NativeSelectField
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                items={patients.map((p) => ({
                  value: p.id,
                  label: `${p.name} (${p.species}) · ${ownerById(p.owner).name}`,
                }))}
              />
            </NativeSelectRoot>
          </Field>
          {patient && patient.alerts.length > 0 && <AlertChips alerts={patient.alerts} />}

          <Field label="Vet">
            <NativeSelectRoot>
              <NativeSelectField
                value={vetId}
                onChange={(e) => setVetId(e.target.value)}
                items={vets.map((v) => ({ value: v.id, label: `${v.name} · ${v.room}` }))}
              />
            </NativeSelectRoot>
          </Field>

          <SimpleGrid columns={2} gap="3">
            <Field
              label="Time"
              invalid={Boolean(clash)}
              errorText={
                clash
                  ? `${vet.name} already has ${patientById(clash.patient)?.name ?? "a patient"} (${clash.reason}) booked ${fmtRange(clash.start, clash.minutes)}.`
                  : undefined
              }
            >
              <NativeSelectRoot>
                <NativeSelectField
                  value={String(startValue)}
                  onChange={(e) => setStart(Number(e.target.value))}
                  items={timeItems}
                />
              </NativeSelectRoot>
            </Field>
            <Field label="Length">
              <NativeSelectRoot>
                <NativeSelectField
                  value={String(minutes)}
                  onChange={(e) => setMinutes(Number(e.target.value))}
                  items={DURATIONS.map((d) => ({ value: String(d), label: `${d} min` }))}
                />
              </NativeSelectRoot>
            </Field>
          </SimpleGrid>

          {clash && (
            <Box role="alert" bg="bg.error" color="fg.error" rounded="md" p="3" fontSize="sm">
              That slot clashes with an existing booking.{" "}
              {nextFree !== undefined ? (
                <>
                  Next free time for {vet.short}: <strong>{fmtTime(nextFree)}</strong>.{" "}
                  <Button
                    type="button"
                    size="xs"
                    variant="outline"
                    colorPalette="red"
                    onClick={() => setStart(nextFree)}
                  >
                    Use {fmtTime(nextFree)}
                  </Button>
                </>
              ) : (
                <>Pick another time or another vet.</>
              )}
            </Box>
          )}

          <Field label="Reason for visit">
            <Input value={reason} onChange={(e) => setReason(e.target.value)} />
          </Field>

          <Text fontSize="sm" color="fg.muted" aria-live="polite">
            {clash
              ? "Choose a free time to book."
              : `${patient?.name} with ${vet.name}, ${fmtRange(fromMinutes(startValue), minutes)}.`}
          </Text>
        </Stack>
      </DialogBody>
      <DialogFooter>
        <DialogActionTrigger asChild>
          <Button type="button" variant="outline">
            Cancel
          </Button>
        </DialogActionTrigger>
        <Button type="submit" colorPalette="teal" disabled={Boolean(clash)}>
          Book appointment
        </Button>
      </DialogFooter>
    </form>
  );
}
