"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Clock, DoorOpen, Hourglass, Siren, Stethoscope, UserCheck } from "lucide-react";
import { AlertChips } from "@/components/pawpoint/alert-chips";
import { BookingDialog } from "@/components/pawpoint/booking-dialog";
import { StatusBadge } from "@/components/pawpoint/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  type Appointment,
  initialAppointments,
  ownerById,
  patientById,
  today,
  vetById,
  vets,
} from "@/lib/data";
import { endTime, formatLongDate, fromMin, toMin } from "@/lib/schedule";
import { useClock } from "@/lib/use-clock";
import { cn } from "@/lib/utils";

const LONG_WAIT = 20;

function sortAppointments(list: Appointment[]): Appointment[] {
  return [...list].sort(
    (a, b) =>
      toMin(a.start) - toMin(b.start) ||
      vets.findIndex((v) => v.id === a.vet) - vets.findIndex((v) => v.id === b.vet),
  );
}

export function ScheduleView() {
  const now = useClock();
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const [vetFilter, setVetFilter] = useState("all");
  const [hideFinished, setHideFinished] = useState(false);
  const [recent, setRecent] = useState<string | null>(null);

  useEffect(() => {
    if (!recent) return;
    const id = window.setTimeout(() => setRecent(null), 5000);
    return () => window.clearTimeout(id);
  }, [recent]);

  const sorted = useMemo(() => sortAppointments(appointments), [appointments]);

  const visible = sorted.filter(
    (a) =>
      (vetFilter === "all" || a.vet === vetFilter) &&
      !(hideFinished && (a.status === "done" || a.status === "cancelled")),
  );

  const waiting = sorted
    .filter((a) => a.status === "checked_in")
    .sort((a, b) => toMin(a.start) - toMin(b.start));
  const count = (s: Appointment["status"]) => appointments.filter((a) => a.status === s).length;
  const waitMinutes = (a: Appointment) => Math.max(0, now - toMin(a.checkedInAt ?? fromMin(now)));
  const longest = waiting.reduce((max, a) => Math.max(max, waitMinutes(a)), 0);

  function setStatus(id: string, status: Appointment["status"]) {
    setAppointments((list) =>
      list.map((a) => (a.id === id ? { ...a, status, checkedInAt: status === "checked_in" ? fromMin(now) : a.checkedInAt } : a)),
    );
  }

  function checkIn(a: Appointment) {
    const patient = patientById(a.patient);
    setStatus(a.id, "checked_in");
    toast.success(`${patient?.name ?? "Patient"} checked in`, {
      description: `Added to the waiting list for ${vetById(a.vet).name}.`,
    });
  }

  function book(draft: Omit<Appointment, "id" | "status">) {
    const id = `a-${String(appointments.length + 1).padStart(2, "0")}`;
    setAppointments((list) => [...list, { ...draft, id, status: "booked" }]);
    setRecent(id);
    setVetFilter((f) => (f === "all" || f === draft.vet ? f : "all"));
    setHideFinished(false);
    toast.success(`Booked ${patientById(draft.patient)?.name ?? "patient"} at ${draft.start}`, {
      description: `${vetById(draft.vet).name} · ${draft.reason}`,
    });
  }

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Today’s schedule</h1>
          <p className="mt-1 flex flex-wrap items-center gap-x-3 text-sm text-muted-foreground">
            <span>{formatLongDate(today)}</span>
            <span className="inline-flex items-center gap-1 font-medium text-foreground tabular-nums">
              <Clock className="size-3.5" aria-hidden />
              <span className="sr-only">Desk time </span>
              {fromMin(now)}
            </span>
          </p>
        </div>
        <BookingDialog appointments={appointments} onBook={book} />
      </div>

      <dl className="grid grid-cols-2 gap-3 md:grid-cols-4" aria-label="Clinic status">
        <Stat label="Waiting now" value={count("checked_in")} icon={<DoorOpen className="size-4" aria-hidden />} tone="amber" live />
        <Stat label="In exam" value={count("in_exam")} icon={<Stethoscope className="size-4" aria-hidden />} tone="sky" />
        <Stat label="Still to arrive" value={count("booked")} icon={<Clock className="size-4" aria-hidden />} />
        <Stat label="Seen today" value={count("done")} icon={<UserCheck className="size-4" aria-hidden />} tone="emerald" />
      </dl>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
        <aside className="grid gap-5 lg:col-start-2 lg:row-start-1" aria-label="Waiting room and vets">
          <Card className="gap-3 py-4">
            <CardHeader className="px-4">
              <CardTitle className="flex items-center gap-2 text-base">
                <Hourglass className="size-4" aria-hidden />
                Waiting list
              </CardTitle>
              <CardDescription aria-live="polite">
                {waiting.length === 0
                  ? "Nobody is waiting."
                  : `${waiting.length} checked in${longest >= LONG_WAIT ? ` · longest wait ${longest} min` : ""}`}
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4">
              {waiting.length === 0 ? (
                <p className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
                  Check in a booked patient and they will appear here.
                </p>
              ) : (
                <ol className="grid gap-2" aria-label="Checked in, in order of appointment time">
                  {waiting.map((a, i) => {
                    const patient = patientById(a.patient);
                    const wait = waitMinutes(a);
                    const long = wait >= LONG_WAIT;
                    return (
                      <li key={a.id} className={cn("rounded-lg border p-3", long ? "border-amber-300 bg-amber-50" : "bg-card")}>
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-x-2">
                              <Link href={`/patients/${a.patient}`} className="font-semibold underline-offset-4 hover:underline">
                                {patient?.name}
                              </Link>
                              {i === 0 && (
                                <span className="rounded bg-primary px-1.5 py-0.5 text-[11px] font-semibold text-primary-foreground">NEXT</span>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {ownerById(patient?.owner ?? "").name} · {a.reason}
                            </p>
                          </div>
                          <div className="shrink-0 text-right">
                            <div className={cn("text-lg leading-none font-semibold tabular-nums", long && "text-amber-900")}>
                              {wait}
                              <span className="ml-0.5 text-xs font-medium"> min</span>
                            </div>
                            <div className="mt-1 text-[11px] text-muted-foreground">waiting</div>
                          </div>
                        </div>
                        <p className="mt-1.5 text-xs text-muted-foreground">
                          {vetById(a.vet).name} · {vetById(a.vet).room} · booked {a.start}
                          {long && <span className="ml-1 font-semibold text-amber-900">· Long wait</span>}
                        </p>
                        {patient && patient.alerts.length > 0 && <AlertChips alerts={patient.alerts} className="mt-2" />}
                      </li>
                    );
                  })}
                </ol>
              )}
            </CardContent>
          </Card>

          <Card className="gap-3 py-4">
            <CardHeader className="px-4">
              <CardTitle className="text-base">Vets right now</CardTitle>
            </CardHeader>
            <CardContent className="px-4">
              <ul className="divide-y">
                {vets.map((v) => {
                  const current = appointments.find((a) => a.vet === v.id && a.status === "in_exam");
                  const next = sorted.find((a) => a.vet === v.id && a.status === "booked" && toMin(a.start) >= now - 15);
                  return (
                    <li key={v.id} className="flex items-start justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
                      <div>
                        <div className="text-sm font-medium">{v.name}</div>
                        <div className="text-xs text-muted-foreground">{v.room}</div>
                      </div>
                      <div className="text-right text-sm">
                        {current ? (
                          <span className="font-medium text-sky-900">With {patientById(current.patient)?.name}</span>
                        ) : (
                          <span className="font-medium text-emerald-800">Free</span>
                        )}
                        <div className="text-xs text-muted-foreground">
                          {next ? `Next ${next.start} · ${patientById(next.patient)?.name}` : "Nothing more booked"}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </CardContent>
          </Card>
        </aside>

        <section className="min-w-0 lg:col-start-1 lg:row-start-1" aria-labelledby="appts-heading">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
            <h2 id="appts-heading" className="text-lg font-semibold">
              Appointments <span className="font-normal text-muted-foreground">({visible.length})</span>
            </h2>
            <div className="flex items-center gap-2">
              <Switch id="hide-finished" checked={hideFinished} onCheckedChange={setHideFinished} />
              <Label htmlFor="hide-finished" className="text-sm">
                Hide done and cancelled
              </Label>
            </div>
          </div>
          <div role="group" aria-label="Filter by vet" className="mb-3 flex flex-wrap gap-2">
            {[{ id: "all", label: "All vets" }, ...vets.map((v) => ({ id: v.id, label: `Dr. ${v.name.split(" ").slice(-1)[0]}` }))].map((f) => (
              <Button
                key={f.id}
                type="button"
                size="sm"
                variant={vetFilter === f.id ? "default" : "outline"}
                aria-pressed={vetFilter === f.id}
                className="h-10 px-4"
                onClick={() => setVetFilter(f.id)}
              >
                {f.label}
              </Button>
            ))}
          </div>

          {visible.length === 0 ? (
            <p className="rounded-xl border border-dashed bg-card p-8 text-center text-muted-foreground">No appointments match.</p>
          ) : (
            <ul className="grid gap-2.5">
              {visible.map((a) => (
                <AppointmentRow
                  key={a.id}
                  appointment={a}
                  highlight={a.id === recent}
                  now={now}
                  onCheckIn={() => checkIn(a)}
                  onToExam={() => setStatus(a.id, "in_exam")}
                  onDone={() => setStatus(a.id, "done")}
                />
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

const TONE: Record<string, string> = {
  amber: "text-amber-800",
  sky: "text-sky-800",
  emerald: "text-emerald-800",
  none: "text-muted-foreground",
};

function Stat({
  label,
  value,
  icon,
  tone = "none",
  live,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  tone?: "amber" | "sky" | "emerald" | "none";
  live?: boolean;
}) {
  return (
    <div className="rounded-xl border bg-card p-3.5 md:p-4">
      <dt className={cn("flex items-center gap-1.5 text-xs font-medium", TONE[tone])}>
        {icon}
        {label}
      </dt>
      <dd className="mt-1 text-3xl leading-none font-semibold tabular-nums" aria-live={live ? "polite" : undefined}>
        {value}
      </dd>
    </div>
  );
}

function AppointmentRow({
  appointment: a,
  highlight,
  now,
  onCheckIn,
  onToExam,
  onDone,
}: {
  appointment: Appointment;
  highlight: boolean;
  now: number;
  onCheckIn: () => void;
  onToExam: () => void;
  onDone: () => void;
}) {
  const patient = patientById(a.patient);
  const owner = ownerById(patient?.owner ?? "");
  const vet = vetById(a.vet);
  const finished = a.status === "done" || a.status === "cancelled";
  const late = a.status === "booked" && toMin(a.start) < now;
  return (
    <li
      data-status={a.status}
      data-urgent={a.urgent ? "true" : undefined}
      className={cn(
        "grid grid-cols-[4.25rem_minmax(0,1fr)] gap-x-3 gap-y-3 rounded-xl border bg-card p-3.5 sm:grid-cols-[4.75rem_minmax(0,1fr)_auto] sm:p-4",
        a.urgent && !finished && "border-l-[6px] border-l-orange-600 bg-orange-50 ring-1 ring-orange-200",
        finished && "bg-card/60 text-muted-foreground",
        a.status === "in_exam" && "border-sky-200",
        highlight && "ring-2 ring-primary",
      )}
    >
      <div className="tabular-nums">
        <div className={cn("text-lg leading-tight font-semibold", finished ? "text-muted-foreground" : "text-foreground")}>{a.start}</div>
        <div className="text-xs text-muted-foreground">to {endTime(a.start, a.minutes)}</div>
        <div className="text-xs text-muted-foreground">{a.minutes} min</div>
      </div>

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <Link
            href={`/patients/${a.patient}`}
            className={cn("text-base font-semibold underline-offset-4 hover:underline", finished ? "text-foreground/70" : "text-foreground")}
          >
            {patient?.name}
          </Link>
          <span className="text-sm text-muted-foreground">
            {patient?.species} · {patient?.breed}
          </span>
          {a.urgent && (
            <span className="inline-flex items-center gap-1 rounded-md bg-orange-700 px-2 py-0.5 text-xs font-bold tracking-wide text-white uppercase">
              <Siren className="size-3.5" aria-hidden />
              Urgent
            </span>
          )}
        </div>
        <p className={cn("mt-0.5 text-sm", a.status === "cancelled" && "line-through")}>
          <span className={finished ? "" : "font-medium text-foreground"}>{a.reason}</span>
        </p>
        <p className="text-sm text-muted-foreground">
          Owner {owner.name} · {vet.name}, {vet.room}
        </p>
        {patient && patient.alerts.length > 0 && <AlertChips alerts={patient.alerts} className="mt-2" />}
      </div>

      <div className="col-span-2 flex items-center justify-between gap-3 sm:col-span-1 sm:col-start-3 sm:row-start-1 sm:flex-col sm:items-end sm:justify-start">
        <div className="flex flex-col items-start gap-1 sm:items-end">
          <StatusBadge status={a.status} />
          {late && <span className="text-xs font-medium text-amber-900">Not arrived yet</span>}
        </div>
        {a.status === "booked" && (
          <Button onClick={onCheckIn} className="h-11 px-5" aria-label={`Check in ${patient?.name}`}>
            <UserCheck aria-hidden />
            Check in
          </Button>
        )}
        {a.status === "checked_in" && (
          <Button onClick={onToExam} variant="outline" className="h-11 px-4" aria-label={`To exam: ${patient?.name}`}>
            <Stethoscope aria-hidden />
            To exam
          </Button>
        )}
        {a.status === "in_exam" && (
          <Button onClick={onDone} variant="outline" className="h-11 px-4" aria-label={`Mark done: ${patient?.name}`}>
            Mark done
          </Button>
        )}
      </div>
    </li>
  );
}
