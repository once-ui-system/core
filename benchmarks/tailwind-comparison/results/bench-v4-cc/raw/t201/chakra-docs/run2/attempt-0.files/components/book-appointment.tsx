"use client"

import { useState, type FormEvent } from "react"
import { Button, HStack, Input, Stack, Text } from "@chakra-ui/react"
import { LuCalendarPlus } from "react-icons/lu"
import { AlertChips } from "@/components/alert-chips"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DialogActionTrigger,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Field } from "@/components/ui/field"
import { NativeSelectField, NativeSelectRoot } from "@/components/ui/native-select"
import { toaster } from "@/components/ui/toaster"
import { useSchedule } from "@/lib/schedule-context"
import {
  PATIENTS,
  VETS,
  endTime,
  findConflict,
  formatClock,
  fromMinutes,
  ownerById,
  patientById,
  toMinutes,
  vetById,
} from "@/lib/data"

const DAY_END = 18 * 60
const SLOTS: string[] = Array.from({ length: 40 }, (_, i) => fromMinutes(8 * 60 + i * 15))
const DURATIONS = [15, 20, 30, 45, 60, 90, 120]
const SORTED_PATIENTS = [...PATIENTS].sort((a, b) => a.name.localeCompare(b.name))

export function BookAppointmentButton({
  patientId,
  label = "Book appointment",
  variant = "solid",
}: {
  patientId?: string
  label?: string
  variant?: "solid" | "outline"
}) {
  const { appointments, now, book } = useSchedule()
  const [open, setOpen] = useState(false)
  const [pid, setPid] = useState(patientId ?? "")
  const [vetId, setVetId] = useState(VETS[0].id)
  const [time, setTime] = useState("")
  const [minutes, setMinutes] = useState("20")
  const [reason, setReason] = useState("")
  const [urgent, setUrgent] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const dur = Number(minutes)

  function slotProblem(slot: string): string | null {
    const start = toMinutes(slot)
    if (start < now) return "passed"
    if (start + dur > DAY_END) return "too late"
    if (findConflict(appointments, vetId, start, dur)) return "booked"
    return null
  }

  function timeError(): string | null {
    if (!time) return submitted ? "Choose a time." : null
    const start = toMinutes(time)
    if (start < now) return "That time has already passed."
    if (start + dur > DAY_END) return "The clinic closes at 6:00 PM; shorten the visit or pick an earlier time."
    const c = findConflict(appointments, vetId, start, dur)
    if (c) {
      return `${vetById(vetId).name} is already booked ${formatClock(c.start)} to ${formatClock(endTime(c))} with ${patientById(c.patient).name}. Pick another time or vet.`
    }
    return null
  }

  const tErr = timeError()
  const patient = pid ? patientById(pid) : undefined

  function handleOpenChange(next: boolean) {
    if (next) {
      setPid(patientId ?? "")
      setVetId(VETS[0].id)
      setTime("")
      setMinutes("20")
      setReason("")
      setUrgent(false)
      setSubmitted(false)
    }
    setOpen(next)
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitted(true)
    if (!pid || !time || !reason.trim() || tErr) return
    const res = book({ patientId: pid, vetId, start: time, minutes: dur, reason, urgent })
    if (!res.ok) {
      toaster.create({ title: "Could not book", description: res.error, type: "error" })
      return
    }
    toaster.create({
      title: "Appointment booked",
      description: `${patientById(pid).name} with ${vetById(vetId).name} at ${formatClock(time)}.`,
      type: "success",
    })
    setOpen(false)
  }

  return (
    <DialogRoot
      open={open}
      onOpenChange={(e) => handleOpenChange(e.open)}
      placement="center"
      scrollBehavior="inside"
      size={{ base: "full", md: "md" }}
    >
      <DialogTrigger asChild>
        <Button size="lg" colorPalette="teal" variant={variant}>
          <LuCalendarPlus aria-hidden="true" />
          {label}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Book an appointment</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <form id="book-form" onSubmit={onSubmit} noValidate>
            <Stack gap="4">
              <Field label="Patient" required invalid={submitted && !pid} errorText="Choose a patient.">
                <NativeSelectRoot size="lg">
                  <NativeSelectField value={pid} onChange={(e) => setPid(e.target.value)}>
                    <option value="">Choose a patient</option>
                    {SORTED_PATIENTS.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.species}), owner {ownerById(p.owner).name}
                        {p.alerts.length > 0 ? " - MEDICAL ALERT" : ""}
                      </option>
                    ))}
                  </NativeSelectField>
                </NativeSelectRoot>
              </Field>
              {patient && patient.alerts.length > 0 && <AlertChips alerts={patient.alerts} />}

              <Field label="Vet" required>
                <NativeSelectRoot size="lg">
                  <NativeSelectField value={vetId} onChange={(e) => setVetId(e.target.value)}>
                    {VETS.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name} ({v.room})
                      </option>
                    ))}
                  </NativeSelectField>
                </NativeSelectRoot>
              </Field>

              <HStack gap="3" align="start">
                <Field label="Length" required flex="1">
                  <NativeSelectRoot size="lg">
                    <NativeSelectField value={minutes} onChange={(e) => setMinutes(e.target.value)}>
                      {DURATIONS.map((d) => (
                        <option key={d} value={d}>
                          {d} min
                        </option>
                      ))}
                    </NativeSelectField>
                  </NativeSelectRoot>
                </Field>
                <Field label="Time" required invalid={!!tErr} errorText={tErr} flex="1.3">
                  <NativeSelectRoot size="lg">
                    <NativeSelectField value={time} onChange={(e) => setTime(e.target.value)}>
                      <option value="">Choose a time</option>
                      {SLOTS.map((s) => {
                        const problem = slotProblem(s)
                        return (
                          <option key={s} value={s} disabled={problem !== null}>
                            {formatClock(s)}
                            {problem ? ` (${problem})` : ""}
                          </option>
                        )
                      })}
                    </NativeSelectField>
                  </NativeSelectRoot>
                </Field>
              </HStack>

              <Field
                label="Reason"
                required
                invalid={submitted && !reason.trim()}
                errorText="Add a reason for the visit."
              >
                <Input
                  size="lg"
                  value={reason}
                  placeholder="e.g. Vaccine booster"
                  onChange={(e) => setReason(e.target.value)}
                />
              </Field>

              <Checkbox checked={urgent} onCheckedChange={(e) => setUrgent(e.checked === true)}>
                Urgent visit
              </Checkbox>
              <Text fontSize="sm" color="fg.muted">
                Times already taken for this vet are greyed out, so a booking cannot clash.
              </Text>
            </Stack>
          </form>
        </DialogBody>
        <DialogFooter>
          <DialogActionTrigger asChild>
            <Button variant="outline" size="lg">
              Cancel
            </Button>
          </DialogActionTrigger>
          <Button type="submit" form="book-form" size="lg" colorPalette="teal" disabled={!!tErr && !!time}>
            Book appointment
          </Button>
        </DialogFooter>
        <DialogCloseTrigger />
      </DialogContent>
    </DialogRoot>
  )
}
