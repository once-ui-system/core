"use client";

import { useState } from "react";
import { CalendarPlus, CircleAlert } from "lucide-react";
import { AlertChips } from "@/components/pawpoint/alert-chips";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { type Appointment, ownerById, patientById, patients, today, vetById, vets } from "@/lib/data";
import {
  DAY_END,
  endTime,
  findPatientConflict,
  findVetConflict,
  formatLongDate,
  timeSlots,
  toMin,
} from "@/lib/schedule";

const DURATIONS = [15, 20, 30, 45, 60];
const SLOTS = timeSlots();

export function BookingDialog({
  appointments,
  onBook,
}: {
  appointments: Appointment[];
  onBook: (appointment: Omit<Appointment, "id" | "status">) => void;
}) {
  const [open, setOpen] = useState(false);
  const [patientId, setPatientId] = useState("");
  const [vetId, setVetId] = useState("");
  const [start, setStart] = useState("");
  const [minutes, setMinutes] = useState("20");
  const [reason, setReason] = useState("");
  const [touched, setTouched] = useState(false);

  const duration = Number(minutes);
  const patient = patientById(patientId);
  const vetConflict = vetId && start ? findVetConflict(appointments, vetId, start, duration) : undefined;
  const patientConflict = patientId && start ? findPatientConflict(appointments, patientId, start, duration) : undefined;
  const pastClose = start !== "" && toMin(start) + duration > DAY_END;
  const complete = patientId !== "" && vetId !== "" && start !== "";
  const blocked = Boolean(vetConflict || patientConflict || pastClose);

  function reset() {
    setPatientId("");
    setVetId("");
    setStart("");
    setMinutes("20");
    setReason("");
    setTouched(false);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (!complete || blocked) return;
    onBook({
      patient: patientId,
      vet: vetId,
      start,
      minutes: duration,
      reason: reason.trim() || "Follow-up visit",
    });
    setOpen(false);
    reset();
  }

  function slotBusy(slot: string): boolean {
    if (!vetId) return false;
    return Boolean(findVetConflict(appointments, vetId, slot, duration)) || toMin(slot) + duration > DAY_END;
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button size="lg" className="h-11 gap-2 px-5 text-base" aria-controls={open ? undefined : undefined}>
          <CalendarPlus aria-hidden />
          New appointment
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[92dvh] overflow-y-auto sm:max-w-lg">
        <form onSubmit={submit} noValidate className="grid gap-5">
          <DialogHeader>
            <DialogTitle>Book an appointment</DialogTitle>
            <DialogDescription>{formatLongDate(today)}. Pick a patient, a vet and a time.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-2">
            <Label htmlFor="book-patient">Patient</Label>
            <Select value={patientId} onValueChange={setPatientId}>
              <SelectTrigger id="book-patient" className="h-11 w-full" aria-invalid={touched && !patientId}>
                <SelectValue placeholder="Choose a patient" />
              </SelectTrigger>
              <SelectContent>
                {patients.map((p) => (
                  <SelectItem key={p.id} value={p.id} className="min-h-10">
                    {p.name} · {p.species} · {ownerById(p.owner).name}
                    {p.alerts.length > 0 ? " · ALERT" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {patient && patient.alerts.length > 0 && <AlertChips alerts={patient.alerts} />}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="book-vet">Vet</Label>
            <Select value={vetId} onValueChange={setVetId}>
              <SelectTrigger id="book-vet" className="h-11 w-full" aria-invalid={touched && !vetId}>
                <SelectValue placeholder="Choose a vet" />
              </SelectTrigger>
              <SelectContent>
                {vets.map((v) => (
                  <SelectItem key={v.id} value={v.id} className="min-h-10">
                    {v.name} · {v.room}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="book-time">Time</Label>
              <Select value={start} onValueChange={setStart}>
                <SelectTrigger id="book-time" className="h-11 w-full" aria-invalid={(touched && !start) || blocked}>
                  <SelectValue placeholder="Choose a time" />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  {SLOTS.map((slot) => (
                    <SelectItem key={slot} value={slot} className="min-h-10">
                      {slot}
                      {slotBusy(slot) ? " · busy" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="book-length">Length</Label>
              <Select value={minutes} onValueChange={setMinutes}>
                <SelectTrigger id="book-length" className="h-11 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DURATIONS.map((d) => (
                    <SelectItem key={d} value={String(d)} className="min-h-10">
                      {d} min
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="book-reason">Reason for visit</Label>
            <Input
              id="book-reason"
              className="h-11"
              placeholder="Follow-up visit"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>

          <div aria-live="polite" className="grid gap-2">
            {vetConflict && (
              <p role="alert" className="flex items-start gap-2 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-900">
                <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
                <span>
                  {vetById(vetId).name} is already booked {vetConflict.start}–{endTime(vetConflict.start, vetConflict.minutes)} (
                  {patientById(vetConflict.patient)?.name}, {vetConflict.reason}). Choose another time or vet.
                </span>
              </p>
            )}
            {!vetConflict && patientConflict && (
              <p role="alert" className="flex items-start gap-2 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-900">
                <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
                <span>
                  {patient?.name} already has an appointment {patientConflict.start}–
                  {endTime(patientConflict.start, patientConflict.minutes)} with {vetById(patientConflict.vet).name}.
                </span>
              </p>
            )}
            {pastClose && (
              <p role="alert" className="flex items-start gap-2 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-900">
                <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
                <span>The clinic closes at 17:00. Pick an earlier time or a shorter visit.</span>
              </p>
            )}
            {touched && !complete && (
              <p role="alert" className="text-sm text-red-800">
                Choose a patient, a vet and a time to book.
              </p>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button type="button" variant="outline" className="h-11" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="h-11" disabled={blocked}>
              Book appointment
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
