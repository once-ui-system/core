"use client";

import * as React from "react";
import { CalendarPlus, TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { AlertChips } from "@/components/pawpoint/alert-chips";
import {
  CLOSE_MIN,
  DURATIONS,
  PATIENTS,
  SLOTS,
  VETS,
  endTime,
  findConflict,
  fromMin,
  ownerById,
  patientById,
  toMin,
  vetById,
  type Appointment,
} from "@/lib/data";

export interface NewBooking {
  patient: string;
  vet: string;
  start: string;
  minutes: number;
  reason: string;
  urgent: boolean;
}

export function BookDialog({
  open,
  onOpenChange,
  appointments,
  nowMin,
  onBook,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointments: Appointment[];
  nowMin: number;
  onBook: (booking: NewBooking) => void;
}) {
  const [patientId, setPatientId] = React.useState("");
  const [vetId, setVetId] = React.useState("");
  const [time, setTime] = React.useState("");
  const [minutes, setMinutes] = React.useState(20);
  const [reason, setReason] = React.useState("");
  const [urgent, setUrgent] = React.useState(false);

  const patient = patientId ? patientById(patientId) : null;
  const conflict = vetId && time ? findConflict(appointments, vetId, time, minutes) : undefined;
  const overrun = time !== "" && toMin(time) + minutes > CLOSE_MIN;
  const passed = time !== "" && toMin(time) < nowMin;
  const ready = Boolean(patientId && vetId && time && reason.trim() && !conflict && !overrun && !passed);

  function slotState(slot: string): "ok" | "taken" | "past" | "late" {
    if (toMin(slot) < nowMin) return "past";
    if (toMin(slot) + minutes > CLOSE_MIN) return "late";
    if (vetId && findConflict(appointments, vetId, slot, minutes)) return "taken";
    return "ok";
  }

  function reset() {
    setPatientId("");
    setVetId("");
    setTime("");
    setMinutes(20);
    setReason("");
    setUrgent(false);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!ready) return;
    onBook({ patient: patientId, vet: vetId, start: time, minutes, reason: reason.trim(), urgent });
    reset();
    onOpenChange(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) reset();
      }}
    >
      <DialogContent className="max-h-[92dvh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Book an appointment</DialogTitle>
          <DialogDescription>
            Pick the patient, the vet and a time. Times that clash with that vet&apos;s bookings are greyed out.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="grid gap-4" noValidate>
          <div className="grid gap-2">
            <Label htmlFor="book-patient">Patient</Label>
            <Select value={patientId} onValueChange={setPatientId}>
              <SelectTrigger id="book-patient" className="h-11 w-full">
                <SelectValue placeholder="Choose a patient" />
              </SelectTrigger>
              <SelectContent>
                {PATIENTS.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.alerts.length > 0 && (
                      <TriangleAlert className="!text-red-600" aria-label="Has medical alerts" />
                    )}
                    {p.name} · {p.species}, owner {ownerById(p.owner).name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {patient && patient.alerts.length > 0 && (
              <div className="rounded-lg border border-red-300 bg-red-50 p-2.5">
                <AlertChips alerts={patient.alerts} />
              </div>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="book-vet">Vet</Label>
              <Select value={vetId} onValueChange={setVetId}>
                <SelectTrigger id="book-vet" className="h-11 w-full">
                  <SelectValue placeholder="Choose a vet" />
                </SelectTrigger>
                <SelectContent>
                  {VETS.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.name} · {v.room}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="book-length">Length</Label>
              <Select value={String(minutes)} onValueChange={(v) => setMinutes(Number(v))}>
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
            <Label htmlFor="book-time">Start time</Label>
            <Select value={time} onValueChange={setTime}>
              <SelectTrigger id="book-time" className="h-11 w-full" aria-describedby="book-time-hint">
                <SelectValue placeholder="Choose a time" />
              </SelectTrigger>
              <SelectContent className="max-h-72">
                {SLOTS.map((slot) => {
                  const state = slotState(slot);
                  return (
                    <SelectItem key={slot} value={slot} disabled={state !== "ok"}>
                      {slot}
                      {state === "taken" && <span className="text-muted-foreground">booked</span>}
                      {state === "past" && <span className="text-muted-foreground">passed</span>}
                      {state === "late" && <span className="text-muted-foreground">after closing</span>}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            <p id="book-time-hint" className="text-xs text-muted-foreground">
              {vetId
                ? `Showing ${vetById(vetId).name}'s availability for ${minutes} minutes.`
                : "Choose a vet to see which times are free."}
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="book-reason">Reason for visit</Label>
            <Input
              id="book-reason"
              className="h-11"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="For example: Vaccination booster"
              autoComplete="off"
            />
          </div>

          <div className="flex items-center gap-3">
            <Checkbox id="book-urgent" checked={urgent} onCheckedChange={(c) => setUrgent(c === true)} className="size-5" />
            <Label htmlFor="book-urgent">Urgent visit (stands out on the schedule)</Label>
          </div>

          <div aria-live="polite">
            {conflict && (
              <p role="alert" className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-900">
                <strong>That time clashes.</strong> {vetById(conflict.vet).name} already has{" "}
                {patientById(conflict.patient).name} ({conflict.reason}) from {conflict.start} to {endTime(conflict)}.
                Choose another time or vet.
              </p>
            )}
            {!conflict && overrun && (
              <p role="alert" className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-900">
                That visit would end after closing at {fromMin(CLOSE_MIN)}.
              </p>
            )}
            {!conflict && passed && (
              <p role="alert" className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
                That time has already passed today.
              </p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" className="h-11" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="h-11" disabled={!ready}>
              <CalendarPlus aria-hidden="true" />
              Book appointment
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
