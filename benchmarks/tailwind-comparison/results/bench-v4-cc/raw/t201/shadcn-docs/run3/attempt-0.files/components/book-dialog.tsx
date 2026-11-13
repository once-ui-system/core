"use client";

import { useMemo, useState } from "react";
import { TriangleAlert } from "lucide-react";
import { AlertChips } from "@/components/alerts";
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
import { Switch } from "@/components/ui/switch";
import {
  CLOSING,
  OPENING,
  TODAY,
  findPatientConflict,
  findVetConflict,
  formatLongDate,
  getOwner,
  getPatient,
  getVet,
  patients,
  toClock,
  toMinutes,
  vets,
  type Appointment,
} from "@/lib/data";

const DURATIONS = [20, 30, 45, 60];

type Problem = { short: string; message: string };

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appts: Appointment[];
  now: number;
  onBook: (appointment: Appointment) => void;
};

export function BookDialog({ open, onOpenChange, appts, now, onBook }: Props) {
  const [patientId, setPatientId] = useState("");
  const [vetId, setVetId] = useState("");
  const [minutes, setMinutes] = useState("20");
  const [time, setTime] = useState("");
  const [reason, setReason] = useState("");
  const [urgent, setUrgent] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const duration = Number(minutes);
  const patient = patientId ? getPatient(patientId) : undefined;

  function check(slot: number): Problem | null {
    if (slot < now) return { short: "passed", message: "That time has already passed." };
    if (slot + duration > CLOSING) {
      return { short: "after closing", message: `Appointments must finish by ${toClock(CLOSING)}.` };
    }
    if (vetId) {
      const c = findVetConflict(appts, vetId, slot, duration);
      if (c) {
        const who = getPatient(c.patient)?.name ?? "another patient";
        const end = toClock(toMinutes(c.start) + c.minutes);
        return {
          short: "taken",
          message: `${getVet(vetId)?.name ?? "This vet"} is already booked ${c.start} to ${end} (${who}). Pick a free time.`,
        };
      }
    }
    if (patientId) {
      const c = findPatientConflict(appts, patientId, slot, duration);
      if (c) {
        const end = toClock(toMinutes(c.start) + c.minutes);
        return {
          short: "patient busy",
          message: `${patient?.name ?? "This patient"} already has an appointment ${c.start} to ${end}.`,
        };
      }
    }
    return null;
  }

  const slots = useMemo(() => {
    const list: number[] = [];
    for (let m = OPENING; m < CLOSING; m += 15) list.push(m);
    return list;
  }, []);

  const selectedProblem = time ? check(toMinutes(time)) : null;

  function reset() {
    setPatientId("");
    setVetId("");
    setMinutes("20");
    setTime("");
    setReason("");
    setUrgent(false);
    setSubmitted(false);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
    if (!patientId || !vetId || !time) return;
    if (check(toMinutes(time))) return;
    onBook({
      id: `a-${String(appts.length + 1).padStart(2, "0")}`,
      patient: patientId,
      vet: vetId,
      start: time,
      minutes: duration,
      reason: reason.trim() || "Follow-up visit",
      status: "booked",
      ...(urgent ? { urgent: true } : {}),
    });
    reset();
    onOpenChange(false);
  }

  const missing = (value: string) => submitted && !value;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-xl">New appointment</DialogTitle>
          <DialogDescription>
            {formatLongDate(TODAY)}. Times that clash with the vet&rsquo;s schedule are switched off.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} noValidate className="grid gap-5">
          <div className="grid gap-2">
            <Label htmlFor="book-patient">Patient</Label>
            <Select value={patientId} onValueChange={setPatientId}>
              <SelectTrigger
                id="book-patient"
                className="h-11 w-full"
                aria-invalid={missing(patientId) || undefined}
              >
                <SelectValue placeholder="Choose a patient" />
              </SelectTrigger>
              <SelectContent>
                {patients.map((p) => (
                  <SelectItem key={p.id} value={p.id} className="py-2.5">
                    {p.alerts.length > 0 && (
                      <TriangleAlert className="text-red-600" aria-label="Has medical alerts" />
                    )}
                    {p.name} &middot; {p.species} &middot; {getOwner(p.owner)?.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {missing(patientId) && <p className="text-sm text-destructive">Choose a patient.</p>}
            {patient && patient.alerts.length > 0 && (
              <div className="rounded-lg border-2 border-red-600 bg-red-50 p-3 dark:bg-red-950/40">
                <p className="mb-2 text-sm font-semibold text-red-800 dark:text-red-200">
                  Medical alerts for {patient.name}
                </p>
                <AlertChips alerts={patient.alerts} />
              </div>
            )}
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="book-vet">Vet</Label>
              <Select value={vetId} onValueChange={setVetId}>
                <SelectTrigger id="book-vet" className="h-11 w-full" aria-invalid={missing(vetId) || undefined}>
                  <SelectValue placeholder="Choose a vet" />
                </SelectTrigger>
                <SelectContent>
                  {vets.map((v) => (
                    <SelectItem key={v.id} value={v.id} className="py-2.5">
                      {v.name} &middot; {v.room}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {missing(vetId) && <p className="text-sm text-destructive">Choose a vet.</p>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="book-length">Length</Label>
              <Select value={minutes} onValueChange={setMinutes}>
                <SelectTrigger id="book-length" className="h-11 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DURATIONS.map((d) => (
                    <SelectItem key={d} value={String(d)} className="py-2.5">
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
              <SelectTrigger
                id="book-time"
                className="h-11 w-full"
                aria-invalid={missing(time) || !!selectedProblem || undefined}
                aria-describedby="book-time-help"
              >
                <SelectValue placeholder={vetId ? "Choose a free time" : "Choose a vet first, then a time"} />
              </SelectTrigger>
              <SelectContent className="max-h-72">
                {slots.map((s) => {
                  const problem = check(s);
                  return (
                    <SelectItem
                      key={s}
                      value={toClock(s)}
                      disabled={!!problem}
                      className="py-2.5 tabular-nums"
                    >
                      {toClock(s)}
                      {problem ? ` (${problem.short})` : ""}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            <p id="book-time-help" className="text-sm text-muted-foreground">
              Open {toClock(OPENING)} to {toClock(CLOSING)}, every 15 minutes.
            </p>
            {selectedProblem && (
              <p role="alert" className="text-sm font-medium text-destructive">
                {selectedProblem.message}
              </p>
            )}
            {missing(time) && <p className="text-sm text-destructive">Choose a time.</p>}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="book-reason">Reason for visit</Label>
            <Input
              id="book-reason"
              className="h-11"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Follow-up visit"
              autoComplete="off"
            />
          </div>

          <div className="flex items-center justify-between gap-4 rounded-lg border p-3">
            <div>
              <Label htmlFor="book-urgent" className="text-base">
                Urgent visit
              </Label>
              <p className="text-sm text-muted-foreground">Highlighted on the schedule for the vets.</p>
            </div>
            <Switch id="book-urgent" checked={urgent} onCheckedChange={setUrgent} />
          </div>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button type="button" variant="outline" className="h-11" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="h-11 px-6" disabled={!!selectedProblem}>
              Book appointment
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
