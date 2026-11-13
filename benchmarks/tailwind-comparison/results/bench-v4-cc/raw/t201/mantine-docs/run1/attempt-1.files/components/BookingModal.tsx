"use client";

import { Alert, Button, Group, Modal, Select, SimpleGrid, Stack, Switch, Text, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useMediaQuery } from "@mantine/hooks";
import { IconAlertTriangleFilled, IconCalendarPlus } from "@tabler/icons-react";
import {
  type Appointment,
  CLOSING,
  OPENING,
  findClash,
  fmt12,
  fromMin,
  endOf,
  getOwner,
  getPatient,
  getVet,
  patients,
  toMin,
  vets,
} from "@/lib/data";
import { AlertFlags } from "./AlertFlags";

interface FormValues {
  patient: string;
  vet: string;
  start: string;
  minutes: string;
  reason: string;
  urgent: boolean;
}

const initialValues: FormValues = { patient: "", vet: "", start: "", minutes: "20", reason: "", urgent: false };

const durations = [15, 20, 30, 45, 60, 90, 120].map((m) => ({ value: String(m), label: `${m} min` }));

const patientOptions = patients.map((p) => ({
  value: p.id,
  label: `${p.name} (${p.species}), ${getOwner(p.owner)?.name ?? ""}`,
}));

const vetOptions = vets.map((v) => ({ value: v.id, label: `${v.name}, ${v.room}` }));

function clashMessage(c: Appointment): string {
  const vet = getVet(c.vet);
  const patient = getPatient(c.patient);
  return `${vet?.name ?? "This vet"} already has ${patient?.name ?? "a patient"} (${c.reason}) from ${fmt12(c.start)} to ${fmt12(endOf(c))}.`;
}

export function BookingModal({
  opened,
  onClose,
  appointments,
  nowMin,
  onBook,
}: {
  opened: boolean;
  onClose: () => void;
  appointments: Appointment[];
  nowMin: number;
  onBook: (a: Omit<Appointment, "id">) => void;
}) {
  const isPhone = useMediaQuery("(max-width: 48em)");

  const form = useForm<FormValues>({
    mode: "controlled",
    initialValues,
    validate: {
      patient: (v) => (v ? null : "Choose a patient"),
      vet: (v) => (v ? null : "Choose a vet"),
      start: (v, values) => {
        if (!v) return "Choose a time";
        if (!values.vet) return null;
        const clash = findClash(appointments, values.vet, v, Number(values.minutes));
        return clash ? clashMessage(clash) : null;
      },
      reason: (v) => (v.trim() ? null : "Add a reason for the visit"),
    },
  });

  const minutes = Number(form.values.minutes);
  const patient = form.values.patient ? getPatient(form.values.patient) : undefined;

  const slots: { value: string; label: string; disabled: boolean }[] = [];
  const openMin = toMin(OPENING);
  const closeMin = toMin(CLOSING);
  for (let m = openMin; m + 15 <= closeMin; m += 15) {
    const value = fromMin(m);
    const clash = form.values.vet ? findClash(appointments, form.values.vet, value, minutes) : undefined;
    const passed = m < nowMin;
    const tooLate = m + minutes > closeMin;
    const note = clash ? " (taken)" : passed ? " (passed)" : tooLate ? " (after closing)" : "";
    slots.push({ value, label: `${fmt12(value)}${note}`, disabled: Boolean(clash) || passed || tooLate });
  }

  // When the vet or the length changes, drop a chosen time that no longer fits.
  const changeVetOrLength = (field: "vet" | "minutes", value: string | null) => {
    const next = { ...form.values, [field]: value ?? "" };
    form.setFieldValue(field, value ?? "");
    if (next.start) {
      const s = toMin(next.start);
      const clash = next.vet ? findClash(appointments, next.vet, next.start, Number(next.minutes)) : undefined;
      if (clash || s + Number(next.minutes) > closeMin) form.setFieldValue("start", "");
    }
  };

  const close = () => {
    form.reset();
    onClose();
  };

  const submit = form.onSubmit((values) => {
    onBook({
      patient: values.patient,
      vet: values.vet,
      start: values.start,
      minutes: Number(values.minutes),
      reason: values.reason.trim(),
      status: "booked",
      urgent: values.urgent || undefined,
    });
    form.reset();
  });

  return (
    <Modal
      opened={opened}
      onClose={close}
      title={<Text fw={700} size="lg">Book an appointment</Text>}
      size="lg"
      centered
      fullScreen={Boolean(isPhone)}
    >
      <form onSubmit={submit} noValidate>
        <Stack gap="md">
          <Select
            label="Patient"
            description="Type a pet's or an owner's name"
            placeholder="Search patients"
            searchable
            withAsterisk
            nothingFoundMessage="No patient found"
            data={patientOptions}
            size="md"
            renderOption={({ option }) => {
              const p = getPatient(option.value);
              if (!p) return option.label;
              return (
                <Stack gap={3}>
                  <Text component="div" size="sm" fw={700}>
                    {p.name}{" "}
                    <Text span size="sm" c="dimmed" fw={400}>
                      {p.species}, owner {getOwner(p.owner)?.name}
                    </Text>
                  </Text>
                  <AlertFlags alerts={p.alerts} />
                </Stack>
              );
            }}
            {...form.getInputProps("patient")}
          />

          {patient && patient.alerts.length > 0 && (
            <Alert
              variant="filled"
              color="red.9"
              icon={<IconAlertTriangleFilled size={20} aria-hidden />}
              title={`Medical alerts for ${patient.name}`}
            >
              <Stack gap={2}>
                {patient.alerts.map((a) => (
                  <Text key={a} size="sm" fw={600} c="white">
                    {a}
                  </Text>
                ))}
              </Stack>
            </Alert>
          )}

          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            <Select
              label="Vet"
              placeholder="Choose a vet"
              withAsterisk
              allowDeselect={false}
              data={vetOptions}
              size="md"
              value={form.values.vet || null}
              onChange={(v) => changeVetOrLength("vet", v)}
              error={form.errors.vet}
            />
            <Select
              label="Length"
              allowDeselect={false}
              data={durations}
              size="md"
              value={form.values.minutes}
              onChange={(v) => changeVetOrLength("minutes", v)}
            />
          </SimpleGrid>

          <Select
            label="Time"
            description={
              form.values.vet
                ? "Times marked taken, passed or after closing cannot be chosen"
                : "Choose a vet first to see their free times"
            }
            placeholder="Choose a time"
            withAsterisk
            allowDeselect={false}
            data={slots}
            size="md"
            maxDropdownHeight={280}
            {...form.getInputProps("start")}
          />

          <TextInput
            label="Reason for the visit"
            placeholder="For example: Ear infection follow-up"
            withAsterisk
            size="md"
            {...form.getInputProps("reason")}
          />

          <Switch
            label="Urgent visit"
            description="Shows the booking in red on the schedule"
            size="md"
            {...form.getInputProps("urgent", { type: "checkbox" })}
          />

          <Group justify="flex-end" mt="xs">
            <Button variant="default" size="md" onClick={close} type="button">
              Cancel
            </Button>
            <Button size="md" type="submit" leftSection={<IconCalendarPlus size={18} aria-hidden />}>
              Book appointment
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
