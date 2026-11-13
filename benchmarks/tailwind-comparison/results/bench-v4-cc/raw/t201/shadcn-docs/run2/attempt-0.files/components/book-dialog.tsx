"use client";

import { useMemo, useState } from "react";
import { CalendarPlus, CircleAlert } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertBadges } from "@/components/alert-badges";
import { type Appointment, endTime, findClash, fromMin, getOwner, getPatient, getVet, patients, toMin, vets } from "@/lib/data";

const SLOTS: number[] = [];
for (let m = 8 * 60; m <= 16 * 60 + 45; m += 15) SLOTS.push(m);
const DURATIONS = [15, 20, 30, 45, 60];

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
  onBook: (draft: Omit<Appointment, "id" | "status">) => void;
}) {
  const [patientId, setPatientId] = useState("");
  const [vetId, setVetId] = useState("");
  const [minutes, setMinutes] = useState("20");
  const [time, setTime] = useState("");
  const [reason, setReason] = useState("");

  const patient = getPatient(patientId);
  const dur = Number(minutes);

  const slotState = useMemo(() => {
    const map = new Map<number, string | null>();
    for (const m of SLOTS) {
      if (m + 1 <= nowMin) {
        map.set(m, "passed");
      } else if (vetId && findClash(appointments, vetId, m, dur)) {
        map.set(m, "taken");
      } else {
        map.set(m, null);
      }
    }
    return map;
  }, [appointments, vetId, dur, nowMin]);

  const chosen = time ? toMin(time) : null;
  const clash = chosen !== null && vetId ? findClash(appointments, vetId, chosen, dur) : undefined;
  const pastChosen = chosen !== null && chosen <= nowMin;
  const complete = Boolean(patientId && vetId && time && reason.trim());
  const canSubmit = complete && !clash && !pastChosen;

  function reset() {
    setPatientId("");
    setVetId("");
    setMinutes("20");
    setTime("");
    setReason("");
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) reset();
        onOpenChange(o);
      }}
    >
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Book an appointment</DialogTitle>
          <DialogDescription>Pick the patient, the vet and a free time. Taken times are disabled.</DialogDescription>
        </DialogHeader>
        <form
          className="grid gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!canSubmit) return;
            onBook({ patient: patientId, vet: vetId, start: time, minutes: dur, reason: reason.trim() });
            reset();
          }}
        >
          <div className="grid gap-2">
            <Label htmlFor="book-patient">Patient</Label>
            <Select value={patientId} onValueChange={setPatientId}>
              <SelectTrigger id="book-patient" className="h-11 w-full">
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
            {patient && patient.alerts.length > 0 && <AlertBadges alerts={patient.alerts} size="md" />}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="book-vet">Vet</Label>
            <Select value={vetId} onValueChange={setVetId}>
              <SelectTrigger id="book-vet" className="h-11 w-full">
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
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="book-time">Start time</Label>
              <Select value={time} onValueChange={setTime}>
                <SelectTrigger id="book-time" className="h-11 w-full">
                  <SelectValue placeholder="Time" />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  {SLOTS.map((m) => {
                    const state = slotState.get(m) ?? null;
                    return (
                      <SelectItem key={m} value={fromMin(m)} disabled={state !== null}>
                        {fromMin(m)}
                        {state === "taken" ? " · taken" : state === "passed" ? " · passed" : ""}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="book-duration">Length</Label>
              <Select value={minutes} onValueChange={setMinutes}>
                <SelectTrigger id="book-duration" className="h-11 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DURATIONS.map((d) => (
                    <SelectItem key={d} value={String(d)}>
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
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Booster vaccination"
              maxLength={80}
            />
          </div>

          {clash && vetId && (
            <p role="alert" className="flex items-start gap-2 rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-100">
              <CircleAlert aria-hidden className="mt-0.5 size-4 shrink-0" />
              <span>
                {getVet(vetId)?.name} already has {getPatient(clash.patient)?.name} from {clash.start} to {endTime(clash)}. Choose another time or vet.
              </span>
            </p>
          )}
          {complete && !clash && !pastChosen && (
            <p className="text-sm text-muted-foreground">
              {patient?.name} with {getVet(vetId)?.name}, {time} to {fromMin(toMin(time) + dur)}.
            </p>
          )}

          <DialogFooter className="gap-2 sm:gap-2">
            <Button type="button" variant="outline" className="h-11" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!canSubmit} className="h-11 bg-teal-700 text-white hover:bg-teal-800">
              <CalendarPlus aria-hidden /> Book appointment
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
