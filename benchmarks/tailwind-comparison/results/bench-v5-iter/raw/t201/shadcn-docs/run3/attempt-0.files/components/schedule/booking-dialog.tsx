"use client";

import * as React from "react";
import { CalendarPlus, TriangleAlert } from "lucide-react";
import { AlertBadges } from "@/components/alert-badges";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  CLOSE_AT,
  SLOT_TIMES,
  endTime,
  findConflict,
  fromMin,
  getOwner,
  getPatient,
  getVet,
  patients,
  toMin,
  vets,
  type Appointment,
} from "@/lib/data";

const DURATIONS = [15, 20, 30, 45, 60];

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointments: Appointment[];
  now: number;
  onBook: (input: { patient: string; vet: string; start: string; minutes: number; reason: string }) => void;
};

export function BookingDialog({ open, onOpenChange, appointments, now, onBook }: Props) {
  const [patientId, setPatientId] = React.useState("");
  const [vetId, setVetId] = React.useState("");
  const [time, setTime] = React.useState("");
  const [minutes, setMinutes] = React.useState("20");
  const [reason, setReason] = React.useState("");
  const [submitted, setSubmitted] = React.useState(false);

  const patient = patientId ? getPatient(patientId) : undefined;
  const mins = Number(minutes);

  function slotIssue(t: string): string | null {
    const s = toMin(t);
    if (s < now) return "already passed";
    if (s + mins > toMin(CLOSE_AT)) return `ends after ${CLOSE_AT}`;
    const c = findConflict(appointments, { vet: vetId || undefined, patient: patientId || undefined, start: t, minutes: mins });
    if (c?.kind === "vet") return "vet busy";
    if (c?.kind === "patient") return "patient busy";
    return null;
  }

  const timeIssue = time ? slotIssue(time) : null;
  const conflict = time ? findConflict(appointments, { vet: vetId || undefined, patient: patientId || undefined, start: time, minutes: mins }) : null;

  function conflictMessage() {
    if (!time) return null;
    if (conflict) {
      const other = conflict.appointment;
      const otherPatient = getPatient(other.patient)!;
      const range = `${other.start}–${endTime(other)}`;
      return conflict.kind === "vet"
        ? `${getVet(other.vet).name} already has ${otherPatient.name} (${other.reason}) from ${range}. Pick another time or another vet.`
        : `${otherPatient.name} is already booked from ${range} with ${getVet(other.vet).name}. A patient cannot be in two places at once.`;
    }
    if (timeIssue === "already passed") return "That time has already passed. Pick a later slot.";
    if (timeIssue) return `That visit would end after closing at ${CLOSE_AT}. Pick an earlier time or a shorter visit.`;
    return null;
  }
  const problem = conflictMessage();

  function reset() {
    setPatientId("");
    setVetId("");
    setTime("");
    setMinutes("20");
    setReason("");
    setSubmitted(false);
  }

  function handleOpenChange(next: boolean) {
    if (!next) reset();
    onOpenChange(next);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    if (!patientId || !vetId || !time || problem) return;
    onBook({ patient: patientId, vet: vetId, start: time, minutes: mins, reason: reason.trim() || "Follow-up visit" });
    reset();
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[92dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Book an appointment</DialogTitle>
          <DialogDescription>Pick the patient, the vet and a free time. Taken times cannot be chosen.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="grid gap-4" noValidate>
          <div className="grid gap-2">
            <Label htmlFor="book-patient">Patient</Label>
            <Select value={patientId} onValueChange={setPatientId}>
              <SelectTrigger id="book-patient" className="h-11 w-full" aria-invalid={submitted && !patientId}>
                <SelectValue placeholder="Choose a patient" />
              </SelectTrigger>
              <SelectContent position="popper">
                {patients.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name} · {getOwner(p.owner).name}
                    {p.alerts.length > 0 && <TriangleAlert aria-label="has medical alert" className="!text-red-700" />}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {submitted && !patientId && <p className="text-sm text-destructive">Choose a patient.</p>}
            {patient && (
              <div className="rounded-lg border bg-muted/40 p-3 text-sm">
                <p>
                  <span className="font-semibold">{patient.name}</span>
                  <span className="text-muted-foreground">
                    {" "}
                    · {patient.species}, {patient.breed} · owner {getOwner(patient.owner).name}
                  </span>
                </p>
                <AlertBadges alerts={patient.alerts} className="mt-2" />
              </div>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="book-vet">Vet</Label>
              <Select value={vetId} onValueChange={setVetId}>
                <SelectTrigger id="book-vet" className="h-11 w-full" aria-invalid={submitted && !vetId}>
                  <SelectValue placeholder="Choose a vet" />
                </SelectTrigger>
                <SelectContent position="popper">
                  {vets.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.name} · {v.room}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {submitted && !vetId && <p className="text-sm text-destructive">Choose a vet.</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="book-minutes">Length</Label>
              <Select value={minutes} onValueChange={setMinutes}>
                <SelectTrigger id="book-minutes" className="h-11 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent position="popper">
                  {DURATIONS.map((d) => (
                    <SelectItem key={d} value={String(d)}>
                      {d} minutes
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="book-time">Time</Label>
            <Select value={time} onValueChange={setTime}>
              <SelectTrigger id="book-time" className="h-11 w-full" aria-invalid={submitted && !time}>
                <SelectValue placeholder="Choose a time" />
              </SelectTrigger>
              <SelectContent position="popper" className="max-h-72">
                {SLOT_TIMES.map((t) => {
                  const issue = slotIssue(t);
                  return (
                    <SelectItem key={t} value={t} disabled={issue !== null && t !== time}>
                      <span className="tabular-nums">
                        {t}–{fromMin(toMin(t) + mins)}
                      </span>
                      {issue && <span className="text-muted-foreground">· {issue}</span>}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            {submitted && !time && <p className="text-sm text-destructive">Choose a time.</p>}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="book-reason">Reason for visit</Label>
            <Input
              id="book-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="For example: Ear infection recheck"
              className="h-11"
              autoComplete="off"
            />
          </div>

          {problem && (
            <Alert variant="destructive" role="alert" className="border-red-300 bg-red-50">
              <TriangleAlert aria-hidden />
              <AlertTitle className="line-clamp-none">This time does not work</AlertTitle>
              <AlertDescription className="text-red-900">{problem}</AlertDescription>
            </Alert>
          )}

          <DialogFooter className="gap-2 sm:gap-2">
            <Button type="button" variant="outline" className="h-11" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="h-11" disabled={Boolean(problem)}>
              <CalendarPlus aria-hidden />
              Book appointment
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
