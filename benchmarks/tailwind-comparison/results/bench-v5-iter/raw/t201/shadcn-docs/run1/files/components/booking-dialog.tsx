"use client";

import * as React from "react";
import { CircleAlert } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { AlertBadges } from "@/components/alert-badges";
import {
  type Appointment,
  endTime,
  findClash,
  fromMin,
  getOwner,
  getPatient,
  getVet,
  patients,
  vets,
} from "@/lib/data";

const SLOTS = Array.from({ length: 37 }, (_, i) => fromMin(8 * 60 + i * 15));
const DURATIONS = [15, 20, 30, 45, 60, 90];

export function BookingDialog({
  open,
  onOpenChange,
  appointments,
  onBook,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointments: Appointment[];
  onBook: (appointment: Appointment) => void;
}) {
  const [patientId, setPatientId] = React.useState("");
  const [vetId, setVetId] = React.useState("");
  const [start, setStart] = React.useState("");
  const [minutes, setMinutes] = React.useState("20");
  const [reason, setReason] = React.useState("Follow-up");
  const [urgent, setUrgent] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);

  React.useEffect(() => {
    if (!open) {
      setPatientId("");
      setVetId("");
      setStart("");
      setMinutes("20");
      setReason("Follow-up");
      setUrgent(false);
      setSubmitted(false);
    }
  }, [open]);

  const patient = getPatient(patientId);
  const duration = Number(minutes);
  const clash =
    vetId && start ? findClash(appointments, vetId, start, duration) : undefined;
  const clashPatient = clash ? getPatient(clash.patient) : undefined;

  const missing = {
    patient: submitted && !patientId,
    vet: submitted && !vetId,
    start: submitted && !start,
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (!patientId || !vetId || !start || clash) return;
    onBook({
      id: `a-${String(appointments.length + 1).padStart(2, "0")}`,
      patient: patientId,
      vet: vetId,
      start,
      minutes: duration,
      reason: reason.trim() || "Follow-up",
      status: "booked",
      urgent: urgent || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Book an appointment</DialogTitle>
          <DialogDescription>
            Pick the patient, the vet and a time. Times already taken for that
            vet are switched off.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="grid gap-4" noValidate>
          <div className="grid gap-2">
            <Label htmlFor="book-patient">Patient</Label>
            <Select value={patientId} onValueChange={setPatientId}>
              <SelectTrigger
                id="book-patient"
                className="h-11 w-full"
                aria-invalid={missing.patient}
                aria-describedby={missing.patient ? "err-patient" : undefined}
              >
                <SelectValue placeholder="Choose a patient" />
              </SelectTrigger>
              <SelectContent>
                {patients.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name} ({p.species}) · {getOwner(p.owner)?.name}
                    {p.alerts.length > 0 ? " · ALERT" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {missing.patient && (
              <p id="err-patient" className="text-sm text-destructive">
                Choose a patient.
              </p>
            )}
            {patient && patient.alerts.length > 0 && (
              <div className="rounded-lg border border-destructive/40 bg-red-50 p-2.5">
                <p className="mb-1.5 text-xs font-semibold tracking-wide text-destructive uppercase">
                  Medical alerts for {patient.name}
                </p>
                <AlertBadges alerts={patient.alerts} />
              </div>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="book-vet">Vet</Label>
              <Select value={vetId} onValueChange={setVetId}>
                <SelectTrigger
                  id="book-vet"
                  className="h-11 w-full"
                  aria-invalid={missing.vet}
                  aria-describedby={missing.vet ? "err-vet" : undefined}
                >
                  <SelectValue placeholder="Choose a vet" />
                </SelectTrigger>
                <SelectContent>
                  {vets.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.name} · {v.room}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {missing.vet && (
                <p id="err-vet" className="text-sm text-destructive">
                  Choose a vet.
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="book-length">Length</Label>
              <Select value={minutes} onValueChange={setMinutes}>
                <SelectTrigger id="book-length" className="h-11 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
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
            <Label htmlFor="book-time">Time today</Label>
            <Select value={start} onValueChange={setStart}>
              <SelectTrigger
                id="book-time"
                className="h-11 w-full"
                aria-invalid={missing.start || !!clash}
                aria-describedby={
                  clash ? "err-clash" : missing.start ? "err-time" : undefined
                }
              >
                <SelectValue placeholder="Choose a start time" />
              </SelectTrigger>
              <SelectContent className="max-h-72">
                {SLOTS.map((slot) => {
                  const busy = vetId
                    ? !!findClash(appointments, vetId, slot, duration)
                    : false;
                  return (
                    <SelectItem key={slot} value={slot} disabled={busy}>
                      {slot} to {fromMin(
                        Number(slot.slice(0, 2)) * 60 +
                          Number(slot.slice(3)) +
                          duration,
                      )}
                      {busy ? " · taken" : ""}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            {missing.start && (
              <p id="err-time" className="text-sm text-destructive">
                Choose a start time.
              </p>
            )}
            {clash && (
              <p
                id="err-clash"
                role="alert"
                className="flex items-start gap-2 rounded-md border border-destructive/40 bg-red-50 p-2.5 text-sm text-destructive"
              >
                <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
                <span>
                  {getVet(clash.vet)?.name} already has {clashPatient?.name} from{" "}
                  {clash.start} to {endTime(clash)}. Pick another time or vet.
                </span>
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="book-reason">Reason for visit</Label>
            <Input
              id="book-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="h-11"
              autoComplete="off"
            />
          </div>

          <div className="flex items-center justify-between gap-3 rounded-lg border p-3">
            <div>
              <Label htmlFor="book-urgent">Urgent visit</Label>
              <p className="text-xs text-muted-foreground">
                Marks the booking so it stands out on the schedule.
              </p>
            </div>
            <Switch
              id="book-urgent"
              checked={urgent}
              onCheckedChange={setUrgent}
            />
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              className="h-11"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" className="h-11" disabled={!!clash}>
              Book appointment
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
