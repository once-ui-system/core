"use client"

import { Box, Button, Flex, Input, SimpleGrid, Stack, Text } from "@chakra-ui/react"
import * as React from "react"
import { Alert } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field } from "@/components/ui/field"
import { NativeSelectField, NativeSelectRoot } from "@/components/ui/native-select"
import { toaster } from "@/components/ui/toaster"
import { useClinic } from "@/lib/clinic-store"
import {
  PATIENTS,
  SLOTS,
  VETS,
  findClash,
  formatTime,
  fromMinutes,
  nextFree,
  ownerById,
  patientById,
  toMinutes,
  vetById,
} from "@/lib/data"
import { AlertBadges } from "./AlertBadges"

const DURATIONS = [15, 20, 30, 45, 60, 90, 120]

export function BookingDialog({
  open,
  onOpenChange,
  defaultPatient = "",
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultPatient?: string
}) {
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
        <BookingForm defaultPatient={defaultPatient} onDone={() => onOpenChange(false)} />
      </DialogContent>
    </DialogRoot>
  )
}

function BookingForm({ defaultPatient, onDone }: { defaultPatient: string; onDone: () => void }) {
  const { appointments, book, now } = useClinic()
  const [patientId, setPatientId] = React.useState(defaultPatient)
  const [vetId, setVetId] = React.useState(VETS[0].id)
  const [minutes, setMinutes] = React.useState(20)
  const [start, setStart] = React.useState(
    () => nextFree(appointments, VETS[0].id, 20, now) ?? "16:00",
  )
  const [reason, setReason] = React.useState("Follow-up visit")
  const [urgent, setUrgent] = React.useState(false)
  const [submitted, setSubmitted] = React.useState(false)

  const patient = patientById(patientId)
  const owner = patient ? ownerById(patient.owner) : undefined
  const clash = findClash(appointments, vetId, start, minutes)
  const suggestion = clash ? nextFree(appointments, vetId, minutes, toMinutes(start)) : null

  const patientError = submitted && !patientId
  const reasonError = submitted && reason.trim() === ""

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    if (!patientId || reason.trim() === "" || clash) return
    const result = book({ patient: patientId, vet: vetId, start, minutes, reason: reason.trim(), urgent: urgent || undefined })
    if (!result.ok) return
    toaster.create({
      type: "success",
      title: `Booked ${patient?.name} at ${formatTime(start)}`,
      description: `${vetById(vetId)?.name}, ${vetById(vetId)?.room}. It is on today's schedule.`,
      closable: true,
    })
    onDone()
  }

  return (
    <form onSubmit={submit} noValidate>
      <DialogHeader>
        <DialogTitle>Book an appointment</DialogTitle>
        <Text color="fg.muted" fontSize="sm">
          Today, pick a patient, a vet and a time. Booked times for each vet are blocked.
        </Text>
      </DialogHeader>
      <DialogCloseTrigger />
      <DialogBody>
        <Stack gap="4">
          <Field label="Patient" invalid={patientError} errorText="Choose a patient to book.">
            <NativeSelectRoot>
              <NativeSelectField
                placeholder="Choose a patient"
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
              >
                {PATIENTS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.species}) - {ownerById(p.owner)?.name}
                  </option>
                ))}
              </NativeSelectField>
            </NativeSelectRoot>
          </Field>

          {patient && (
            <Box bg="bg.muted" borderRadius="md" p="3">
              <Text fontSize="sm" mb={patient.alerts.length ? "2" : "0"}>
                {patient.breed}. Owner {owner?.name}, {owner?.phone}.
              </Text>
              <AlertBadges alerts={patient.alerts} />
            </Box>
          )}

          <Field label="Vet">
            <NativeSelectRoot>
              <NativeSelectField value={vetId} onChange={(e) => setVetId(e.target.value)}>
                {VETS.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.room})
                  </option>
                ))}
              </NativeSelectField>
            </NativeSelectRoot>
          </Field>

          <SimpleGrid columns={2} gap="4">
            <Field label="Start time">
              <NativeSelectRoot>
                <NativeSelectField value={start} onChange={(e) => setStart(e.target.value)}>
                  {SLOTS.map((s) => {
                    const busy = !!findClash(appointments, vetId, s, minutes)
                    return (
                      <option key={s} value={s} disabled={busy && s !== start}>
                        {formatTime(s)}
                        {busy ? " (busy)" : ""}
                      </option>
                    )
                  })}
                </NativeSelectField>
              </NativeSelectRoot>
            </Field>
            <Field label="Length">
              <NativeSelectRoot>
                <NativeSelectField
                  value={String(minutes)}
                  onChange={(e) => setMinutes(Number(e.target.value))}
                >
                  {DURATIONS.map((d) => (
                    <option key={d} value={d}>
                      {d} min
                    </option>
                  ))}
                </NativeSelectField>
              </NativeSelectRoot>
            </Field>
          </SimpleGrid>

          {clash && (
            <Alert status="error" title="That time clashes" role="alert">
              {vetById(vetId)?.name} already has {patientById(clash.patient)?.name} ({clash.reason}) from{" "}
              {formatTime(clash.start)} to {formatTime(fromMinutes(toMinutes(clash.start) + clash.minutes))}.
              {suggestion ? (
                <Button size="xs" variant="outline" colorPalette="red" mt="2" display="flex" onClick={() => setStart(suggestion)}>
                  Use next free time, {formatTime(suggestion)}
                </Button>
              ) : (
                " No later free time today."
              )}
            </Alert>
          )}

          <Field label="Reason for visit" invalid={reasonError} errorText="Add a reason for the visit.">
            <Input value={reason} onChange={(e) => setReason(e.target.value)} />
          </Field>

          <Checkbox colorPalette="red" checked={urgent} onCheckedChange={(e) => setUrgent(!!e.checked)}>
            Urgent visit
          </Checkbox>
        </Stack>
      </DialogBody>
      <DialogFooter>
        <Flex gap="3" w="full" justify="flex-end" wrap="wrap">
          <Button variant="outline" type="button" onClick={onDone}>
            Cancel
          </Button>
          <Button type="submit" colorPalette="teal" bg="teal.700" _hover={{ bg: "teal.800" }} disabled={!!clash}>
            Book appointment
          </Button>
        </Flex>
      </DialogFooter>
    </form>
  )
}
