"use client";

import { useMemo, useState } from "react";
import { Alert, Button, Group, Modal, Select, Stack, Text, TextInput } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconCalendarPlus, IconCheck, IconAlertCircle } from "@tabler/icons-react";
import { AlertBadges } from "@/components/AlertBadges";
import { useAppState } from "@/components/AppState";
import { findClash, fromMinutes, getOwner, getPatient, getVet, patients, vets } from "@/lib/data";

const times = Array.from({ length: 40 }, (_, i) => fromMinutes(8 * 60 + i * 15));
const durations = [
  { value: "15", label: "15 min" },
  { value: "20", label: "20 min" },
  { value: "30", label: "30 min" },
  { value: "45", label: "45 min" },
  { value: "60", label: "1 hour" },
  { value: "120", label: "2 hours" },
];

export function BookingModal({
  opened,
  onClose,
  defaultPatient,
}: {
  opened: boolean;
  onClose: () => void;
  defaultPatient?: string | null;
}) {
  const { appointments, book } = useAppState();
  const [patient, setPatient] = useState<string | null>(defaultPatient ?? null);
  const [vet, setVet] = useState<string | null>(null);
  const [start, setStart] = useState<string | null>(null);
  const [minutes, setMinutes] = useState<string>("20");
  const [reason, setReason] = useState("");
  const [touched, setTouched] = useState(false);

  const clash = useMemo(
    () => (vet && start ? findClash(appointments, vet, start, Number(minutes)) : undefined),
    [appointments, vet, start, minutes],
  );

  const timeData = useMemo(
    () =>
      times.map((t) => ({
        value: t,
        label: t,
        disabled: vet ? Boolean(findClash(appointments, vet, t, Number(minutes))) : false,
      })),
    [appointments, vet, minutes],
  );

  const selected = patient ? getPatient(patient) : undefined;
  const missing = {
    patient: !patient,
    vet: !vet,
    start: !start,
    reason: reason.trim().length === 0,
  };

  const reset = () => {
    setPatient(defaultPatient ?? null);
    setVet(null);
    setStart(null);
    setMinutes("20");
    setReason("");
    setTouched(false);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (missing.patient || missing.vet || missing.start || missing.reason || !patient || !vet || !start) return;
    const result = book({ patient, vet, start, minutes: Number(minutes), reason: reason.trim() });
    if (!result.ok) return;
    notifications.show({
      color: "teal",
      icon: <IconCheck size={18} />,
      title: "Appointment booked",
      message: `${getPatient(patient)?.name} with ${getVet(vet)?.name} at ${start}`,
    });
    reset();
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={() => {
        reset();
        onClose();
      }}
      title={
        <Group gap="xs">
          <IconCalendarPlus size={22} aria-hidden />
          <Text fw={700} fz="lg">
            Book an appointment
          </Text>
        </Group>
      }
      size="lg"
      fullScreen={false}
      centered
      trapFocus
    >
      <form onSubmit={submit} noValidate>
        <Stack gap="md">
          <Select
            label="Patient"
            placeholder="Search by pet or owner"
            searchable
            size="md"
            data={patients.map((p) => ({
              value: p.id,
              label: `${p.name} (${p.species}, ${getOwner(p.owner)?.name})`,
            }))}
            value={patient}
            onChange={setPatient}
            error={touched && missing.patient ? "Choose a patient" : undefined}
            nothingFoundMessage="No match"
            comboboxProps={{ withinPortal: true }}
          />
          {selected && selected.alerts.length > 0 && <AlertBadges alerts={selected.alerts} size="md" />}
          <Select
            label="Vet"
            placeholder="Choose a vet"
            size="md"
            data={vets.map((v) => ({ value: v.id, label: `${v.name} (${v.room})` }))}
            value={vet}
            onChange={setVet}
            error={touched && missing.vet ? "Choose a vet" : undefined}
          />
          <Group grow align="flex-start">
            <Select
              label="Time"
              placeholder="Pick a time"
              size="md"
              data={timeData}
              value={start}
              onChange={setStart}
              maxDropdownHeight={240}
              error={touched && missing.start ? "Pick a time" : undefined}
              description={vet ? "Taken times are greyed out" : undefined}
            />
            <Select
              label="Length"
              size="md"
              data={durations}
              value={minutes}
              onChange={(v) => v && setMinutes(v)}
              allowDeselect={false}
            />
          </Group>
          <TextInput
            label="Reason for visit"
            placeholder="e.g. Booster vaccination"
            size="md"
            value={reason}
            onChange={(e) => setReason(e.currentTarget.value)}
            error={touched && missing.reason ? "Add a reason" : undefined}
          />
          {clash && (
            <Alert color="red" variant="light" icon={<IconAlertCircle size={20} />} title="That time is taken" role="alert">
              {getVet(clash.vet)?.name} has {getPatient(clash.patient)?.name} from {clash.start} to{" "}
              {fromMinutes(
                Number(clash.start.slice(0, 2)) * 60 + Number(clash.start.slice(3)) + clash.minutes,
              )}
              . Choose another time or vet.
            </Alert>
          )}
          <Group justify="flex-end" mt="xs">
            <Button
              variant="default"
              onClick={() => {
                reset();
                onClose();
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={Boolean(clash)} leftSection={<IconCalendarPlus size={18} />}>
              Book appointment
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
