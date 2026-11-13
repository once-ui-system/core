"use client";

import { useMemo, useState } from "react";
import { Alert, Button, Group, Modal, Select, Stack, Text, TextInput } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { IconCalendarPlus, IconCircleX } from "@tabler/icons-react";
import { DAY_END, DAY_START, type Appointment, getOwner, getPatient, getVet, patients, vets } from "@/lib/data";
import { clashes, endOf, fromMin, toMin } from "@/lib/utils";
import { AlertBadges } from "./AlertBadges";

type Props = {
  opened: boolean;
  onClose: () => void;
  appointments: Appointment[];
  onBook: (a: { patient: string; vet: string; start: string; minutes: number; reason: string }) => void;
};

const durations = [15, 20, 30, 45, 60].map((m) => ({ value: String(m), label: `${m} minutes` }));

const patientData = patients.map((p) => ({
  value: p.id,
  label: `${p.name} (${p.species}) · ${getOwner(p.owner)?.name ?? ""}`,
}));

const vetData = vets.map((v) => ({ value: v.id, label: `${v.name} · ${v.room}` }));

export function BookingModal({ opened, onClose, appointments, onBook }: Props) {
  const isPhone = useMediaQuery("(max-width: 36em)");
  const [patient, setPatient] = useState<string | null>(null);
  const [vet, setVet] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [minutes, setMinutes] = useState<string>("20");
  const [reason, setReason] = useState("Follow-up visit");
  const [submitted, setSubmitted] = useState(false);

  const length = Number(minutes);

  const timeData = useMemo(() => {
    const out: { value: string; label: string; disabled?: boolean }[] = [];
    for (let t = DAY_START; t + 15 <= DAY_END; t += 15) {
      const taken = vet ? clashes(appointments, vet, t, length) !== undefined : false;
      const tooLate = t + length > DAY_END;
      out.push({
        value: fromMin(t),
        label: taken ? `${fromMin(t)} · taken` : tooLate ? `${fromMin(t)} · after closing` : fromMin(t),
        disabled: taken || tooLate,
      });
    }
    return out;
  }, [appointments, vet, length]);

  const clash = vet && time ? clashes(appointments, vet, toMin(time), length) : undefined;
  const clashPatient = clash ? getPatient(clash.patient) : undefined;
  const chosenPatient = patient ? getPatient(patient) : undefined;
  const chosenVet = vet ? getVet(vet) : undefined;

  const reset = () => {
    setPatient(null);
    setVet(null);
    setTime(null);
    setMinutes("20");
    setReason("Follow-up visit");
    setSubmitted(false);
  };

  const close = () => {
    reset();
    onClose();
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (!patient || !vet || !time || clash || reason.trim() === "") return;
    onBook({ patient, vet, start: time, minutes: length, reason: reason.trim() });
    reset();
  };

  return (
    <Modal
      opened={opened}
      onClose={close}
      title={
        <Text fw={700} size="lg" component="span">
          Book an appointment
        </Text>
      }
      size="lg"
      fullScreen={isPhone}
      centered
    >
      <form onSubmit={submit} noValidate>
        <Stack gap="md">
          <Select
            label="Patient"
            placeholder="Search by pet or owner name"
            data={patientData}
            value={patient}
            onChange={setPatient}
            searchable
            size="md"
            withAsterisk
            nothingFoundMessage="No patient found"
            error={submitted && !patient ? "Choose a patient" : undefined}
            comboboxProps={{ withinPortal: true }}
          />
          {chosenPatient && chosenPatient.alerts.length > 0 && <AlertBadges alerts={chosenPatient.alerts} />}

          <Group grow align="flex-start" gap="md" wrap="wrap">
            <Select
              label="Vet"
              placeholder="Choose a vet"
              data={vetData}
              value={vet}
              onChange={(v) => {
                setVet(v);
                setTime(null);
              }}
              size="md"
              withAsterisk
              miw={220}
              allowDeselect={false}
              error={submitted && !vet ? "Choose a vet" : undefined}
              comboboxProps={{ withinPortal: true }}
            />
            <Select
              label="Length"
              data={durations}
              value={minutes}
              onChange={(v) => {
                setMinutes(v ?? "20");
                setTime(null);
              }}
              size="md"
              miw={140}
              allowDeselect={false}
              comboboxProps={{ withinPortal: true }}
            />
          </Group>

          <Select
            label="Start time"
            placeholder={vet ? "Pick a free time" : "Choose a vet first"}
            description={vet ? "Times already taken for this vet are greyed out." : undefined}
            data={timeData}
            value={time}
            onChange={setTime}
            disabled={!vet}
            searchable
            size="md"
            withAsterisk
            maxDropdownHeight={260}
            allowDeselect={false}
            error={submitted && vet && !time ? "Choose a time" : undefined}
            comboboxProps={{ withinPortal: true }}
          />

          <TextInput
            label="Reason for visit"
            value={reason}
            onChange={(e) => setReason(e.currentTarget.value)}
            size="md"
            withAsterisk
            error={submitted && reason.trim() === "" ? "Add a reason" : undefined}
          />

          {clash && chosenVet && (
            <Alert color="red" variant="light" icon={<IconCircleX aria-hidden />} title="That time clashes" role="alert">
              {chosenVet.name} already has {clashPatient?.name ?? "a patient"} ({clash.reason}) from {clash.start} to{" "}
              {endOf(clash)}. Pick another time or vet.
            </Alert>
          )}

          <Group justify="flex-end" mt="xs">
            <Button variant="default" size="lg" onClick={close} type="button">
              Cancel
            </Button>
            <Button size="lg" type="submit" leftSection={<IconCalendarPlus size={20} aria-hidden />} disabled={Boolean(clash)}>
              Book appointment
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
