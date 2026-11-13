"use client";

import { useMemo, useState } from "react";
import { Alert, Button, Group, Modal, Select, SegmentedControl, Stack, Text, TextInput, Input } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { IconAlertTriangleFilled, IconCalendarPlus } from "@tabler/icons-react";
import {
  type Appointment,
  fmtLongToday,
  findClash,
  getOwner,
  getPatient,
  getVet,
  patients,
  toClock,
  toMinutes,
  vets,
} from "@/lib/data";

const LENGTHS = ["15", "20", "30", "45", "60"];

export type NewBooking = { patient: string; vet: string; start: string; minutes: number; reason: string };

type Props = {
  opened: boolean;
  onClose: () => void;
  appointments: Appointment[];
  nowMin: number;
  onBook: (b: NewBooking) => void;
};

export function BookingModal({ opened, onClose, appointments, nowMin, onBook }: Props) {
  const isPhone = useMediaQuery("(max-width: 36em)");
  const [patient, setPatient] = useState<string | null>(null);
  const [vet, setVet] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [length, setLength] = useState("20");
  const [reason, setReason] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const minutes = Number(length);

  const patientData = useMemo(
    () =>
      patients.map((p) => ({
        value: p.id,
        label: `${p.name} (${p.species}) · ${getOwner(p.owner).name}${p.alerts.length ? " · ALERT" : ""}`,
      })),
    [],
  );
  const vetData = vets.map((v) => ({ value: v.id, label: `${v.name} · ${v.room}` }));

  const timeData = useMemo(() => {
    const out: { value: string; label: string; disabled?: boolean }[] = [];
    for (let m = 8 * 60; m <= 17 * 60 + 30; m += 15) {
      const clash = vet ? findClash(appointments, vet, m, minutes) : undefined;
      const past = m < nowMin;
      out.push({
        value: toClock(m),
        label: clash ? `${toClock(m)} · taken` : past ? `${toClock(m)} · passed` : toClock(m),
        disabled: Boolean(clash) || past,
      });
    }
    return out;
  }, [appointments, vet, minutes, nowMin]);

  // The chosen slot may stop being free when the vet or the length changes.
  const selectedClash = vet && time ? findClash(appointments, vet, toMinutes(time), minutes) : undefined;
  const patientBusy =
    patient && time
      ? appointments.find(
          (a) =>
            a.patient === patient &&
            a.status !== "cancelled" &&
            toMinutes(time) < toMinutes(a.start) + a.minutes &&
            toMinutes(a.start) < toMinutes(time) + minutes,
        )
      : undefined;

  const reset = () => {
    setPatient(null);
    setVet(null);
    setTime(null);
    setLength("20");
    setReason("");
    setSubmitted(false);
  };
  const close = () => {
    onClose();
    reset();
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (!patient || !vet || !time || !reason.trim() || selectedClash || patientBusy) return;
    onBook({ patient, vet, start: time, minutes, reason: reason.trim() });
    reset();
  };

  const picked = patient ? getPatient(patient) : undefined;

  return (
    <Modal
      opened={opened}
      onClose={close}
      title={<Text fw={700} fz="lg">Book an appointment</Text>}
      fullScreen={Boolean(isPhone)}
      size="lg"
      centered={!isPhone}
    >
      <form onSubmit={submit} noValidate>
        <Stack gap="md">
          <Text c="gray.7" fz="sm">
            {fmtLongToday()}. A vet cannot be booked twice at the same time.
          </Text>

          <Select
            label="Patient"
            placeholder="Search by pet or owner name"
            data={patientData}
            value={patient}
            onChange={setPatient}
            searchable
            nothingFoundMessage="No matching patient"
            size="md"
            error={submitted && !patient ? "Pick a patient" : undefined}
            withAsterisk
            comboboxProps={{ withinPortal: true }}
          />
          {picked && picked.alerts.length > 0 && (
            <Alert color="red.7" variant="filled" icon={<IconAlertTriangleFilled size={20} aria-hidden />} title="Medical alert">
              {picked.alerts.join(" · ")}
            </Alert>
          )}

          <Select
            label="Vet"
            placeholder="Choose a vet"
            data={vetData}
            value={vet}
            onChange={setVet}
            size="md"
            allowDeselect={false}
            error={submitted && !vet ? "Pick a vet" : undefined}
            withAsterisk
          />

          <Input.Wrapper label="Length">
            <SegmentedControl
              fullWidth
              size="md"
              data={LENGTHS.map((l) => ({ value: l, label: `${l} min` }))}
              value={length}
              onChange={setLength}
              aria-label="Appointment length"
            />
          </Input.Wrapper>

          <Select
            label="Time"
            placeholder={vet ? "Choose a free time" : "Choose a vet first"}
            description={vet ? `Times marked "taken" clash with ${getVet(vet).name}'s bookings` : undefined}
            data={timeData}
            value={time}
            onChange={setTime}
            size="md"
            searchable
            maxDropdownHeight={260}
            withAsterisk
            error={
              selectedClash
                ? `Clashes with ${selectedClash.start}–${toClock(toMinutes(selectedClash.start) + selectedClash.minutes)} (${selectedClash.reason}). Pick another time or length.`
                : patientBusy
                  ? `${getPatient(patientBusy.patient)?.name} is already booked then with ${getVet(patientBusy.vet).name}.`
                  : submitted && !time
                    ? "Pick a time"
                    : undefined
            }
          />

          <TextInput
            label="Reason for visit"
            placeholder="e.g. Booster vaccination"
            value={reason}
            onChange={(e) => setReason(e.currentTarget.value)}
            size="md"
            withAsterisk
            error={submitted && !reason.trim() ? "Add a reason" : undefined}
          />

          <Group justify="flex-end" mt="xs">
            <Button variant="default" size="md" onClick={close}>
              Cancel
            </Button>
            <Button type="submit" size="md" leftSection={<IconCalendarPlus size={18} aria-hidden />}>
              Book appointment
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
