"use client"

import * as React from "react"
import { Button, Flex, Input, Stack, Text } from "@chakra-ui/react"
import { LuCalendarPlus } from "react-icons/lu"
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
import { Checkbox } from "@/components/ui/checkbox"
import { NativeSelectField, NativeSelectRoot } from "@/components/ui/native-select"
import { toaster } from "@/components/ui/toaster"
import { AlertChips } from "@/components/Alerts"
import { useClinic } from "@/lib/clinic"
import {
  CLOSE_MIN,
  OPEN_MIN,
  PATIENTS,
  VETS,
  fmtDuration,
  fmtMin,
  findClash,
  getOwner,
  getPatient,
  getVet,
  endMin,
  fmtTime,
  minToHHMM,
} from "@/lib/data"

const DURATIONS = [15, 20, 30, 45, 60, 90]
const STEP = 15

export function BookingDialog() {
  const { bookingOpen, closeBooking } = useClinic()
  return (
    <DialogRoot
      open={bookingOpen}
      onOpenChange={(e) => {
        if (!e.open) closeBooking()
      }}
      lazyMount
      unmountOnExit
      placement="center"
      scrollBehavior="inside"
      size={{ base: "full", md: "md" }}
    >
      <DialogContent>
        <BookingForm />
      </DialogContent>
    </DialogRoot>
  )
}

function BookingForm() {
  const { appointments, nowMin, bookingPatient, book, closeBooking } = useClinic()

  const firstFree = React.useCallback(
    (vetId: string, minutes: number) => {
      const from = Math.max(OPEN_MIN, Math.ceil(nowMin / STEP) * STEP)
      for (let t = from; t + minutes <= CLOSE_MIN; t += STEP) {
        if (!findClash(appointments, vetId, t, minutes)) return t
      }
      return from
    },
    [appointments, nowMin],
  )

  const [patientId, setPatientId] = React.useState(bookingPatient ?? "")
  const [vetId, setVetId] = React.useState(VETS[0].id)
  const [minutes, setMinutes] = React.useState(20)
  const [start, setStart] = React.useState(() => firstFree(VETS[0].id, 20))
  const [reason, setReason] = React.useState("")
  const [urgent, setUrgent] = React.useState(false)
  const [submitted, setSubmitted] = React.useState(false)

  const patient = getPatient(patientId)
  const clash = findClash(appointments, vetId, start, minutes)
  const clashPatient = clash ? getPatient(clash.patient) : undefined
  const pastClose = start + minutes > CLOSE_MIN
  const inPast = start < nowMin - 5
  const slotError = clash
    ? `${getVet(vetId).name} already has ${clashPatient?.name ?? "a booking"} from ${fmtTime(clash.start)} to ${fmtMin(endMin(clash))}. Pick another time or vet.`
    : pastClose
      ? "That visit would run past closing time (6:00 PM)."
      : inPast
        ? "That time has already passed."
        : undefined

  const timeOptions: { value: string; label: string; disabled: boolean }[] = []
  for (let t = OPEN_MIN; t < CLOSE_MIN; t += STEP) {
    const taken = findClash(appointments, vetId, t, minutes)
    const late = t + minutes > CLOSE_MIN
    const past = t < nowMin - 5
    timeOptions.push({
      value: String(t),
      disabled: Boolean(taken) || late || past,
      label: `${fmtMin(t)}${taken ? "  (booked)" : past ? "  (passed)" : late ? "  (too late)" : ""}`,
    })
  }

  const changeVet = (id: string) => {
    setVetId(id)
    if (findClash(appointments, id, start, minutes)) setStart(firstFree(id, minutes))
  }
  const changeMinutes = (m: number) => {
    setMinutes(m)
    if (findClash(appointments, vetId, start, m) || start + m > CLOSE_MIN) setStart(firstFree(vetId, m))
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    if (!patient || !reason.trim() || slotError) return
    const res = book({ patient: patient.id, vet: vetId, start: minToHHMM(start), minutes, reason, urgent })
    if (res.ok) {
      toaster.create({
        type: "success",
        title: `Booked ${patient.name} at ${fmtMin(start)}`,
        description: `${getVet(vetId).name}, ${getVet(vetId).room}. ${reason.trim()}`,
        closable: true,
      })
      closeBooking()
    } else {
      toaster.create({ type: "error", title: "Could not book", description: res.error })
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      <DialogHeader>
        <DialogTitle display="flex" alignItems="center" gap="2">
          <LuCalendarPlus aria-hidden /> New appointment
        </DialogTitle>
      </DialogHeader>
      <DialogBody>
        <Stack gap="4">
          <Field
            label="Patient"
            required
            invalid={submitted && !patient}
            errorText="Pick the patient this visit is for."
          >
            <NativeSelectRoot>
              <NativeSelectField
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                placeholder="Select a patient"
              >
                {PATIENTS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.species}, {getOwner(p.owner).name}){p.alerts.length > 0 ? " - ALERT" : ""}
                  </option>
                ))}
              </NativeSelectField>
            </NativeSelectRoot>
          </Field>
          {patient && patient.alerts.length > 0 && <AlertChips alerts={patient.alerts} />}

          <Flex gap="3" direction={{ base: "column", sm: "row" }}>
            <Field label="Vet" flex="1">
              <NativeSelectRoot>
                <NativeSelectField value={vetId} onChange={(e) => changeVet(e.target.value)}>
                  {VETS.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.room})
                    </option>
                  ))}
                </NativeSelectField>
              </NativeSelectRoot>
            </Field>
            <Field label="Length" w={{ sm: "40%" }}>
              <NativeSelectRoot>
                <NativeSelectField value={String(minutes)} onChange={(e) => changeMinutes(Number(e.target.value))}>
                  {DURATIONS.map((d) => (
                    <option key={d} value={d}>
                      {fmtDuration(d)}
                    </option>
                  ))}
                </NativeSelectField>
              </NativeSelectRoot>
            </Field>
          </Flex>

          <Field
            label="Time"
            invalid={Boolean(slotError)}
            errorText={slotError}
            helperText="Times that clash with this vet's other bookings are greyed out."
          >
            <NativeSelectRoot>
              <NativeSelectField value={String(start)} onChange={(e) => setStart(Number(e.target.value))}>
                {timeOptions.map((o) => (
                  <option key={o.value} value={o.value} disabled={o.disabled}>
                    {o.label}
                  </option>
                ))}
              </NativeSelectField>
            </NativeSelectRoot>
          </Field>

          <Field
            label="Reason for visit"
            required
            invalid={submitted && !reason.trim()}
            errorText="Add a short reason so the vet knows what to prepare."
          >
            <Input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Follow-up: ear infection"
              autoComplete="off"
            />
          </Field>

          <Checkbox checked={urgent} onCheckedChange={(e) => setUrgent(e.checked === true)} colorPalette="red">
            Urgent: flag this visit on the schedule
          </Checkbox>
          <Text fontSize="sm" color="fg.muted">
            {patient
              ? `Owner: ${getOwner(patient.owner).name} · ${getOwner(patient.owner).phone}`
              : "Owner details appear once a patient is picked."}
          </Text>
        </Stack>
      </DialogBody>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={closeBooking}>
          Cancel
        </Button>
        <Button type="submit" colorPalette="teal" bg="teal.700" _hover={{ bg: "teal.800" }} disabled={Boolean(slotError)}>
          Book appointment
        </Button>
      </DialogFooter>
      <DialogCloseTrigger />
    </form>
  )
}
