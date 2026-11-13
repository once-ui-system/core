"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Ban,
  CalendarPlus,
  CircleCheck,
  Clock,
  Hourglass,
  LogIn,
  Phone,
  Siren,
  Stethoscope,
  UserCheck,
  type LucideIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertChips } from "@/components/pawpoint/alert-chips";
import { BookDialog, type NewBooking } from "@/components/pawpoint/book-dialog";
import {
  APPOINTMENTS,
  NOW_START,
  STATUS_LABEL,
  TODAY,
  VETS,
  endTime,
  formatDate,
  fromMin,
  ownerById,
  patientById,
  toMin,
  vetById,
  type Appointment,
  type Status,
} from "@/lib/data";
import { cn } from "@/lib/utils";

const STATUS_STYLE: Record<Status, { icon: LucideIcon; className: string }> = {
  booked: { icon: Clock, className: "border-border bg-muted text-foreground" },
  checked_in: { icon: UserCheck, className: "border-sky-300 bg-sky-100 text-sky-900" },
  in_exam: { icon: Stethoscope, className: "border-violet-300 bg-violet-100 text-violet-900" },
  done: { icon: CircleCheck, className: "border-emerald-300 bg-emerald-100 text-emerald-900" },
  cancelled: { icon: Ban, className: "border-border bg-background text-muted-foreground" },
};

function StatusBadge({ status }: { status: Status }) {
  const { icon: Icon, className } = STATUS_STYLE[status];
  return (
    <Badge variant="outline" className={cn("px-2.5 py-1 text-xs", className)}>
      <Icon aria-hidden="true" />
      {STATUS_LABEL[status]}
    </Badge>
  );
}

function waitMinutes(a: Appointment, now: number): number {
  return a.checkedInAt ? Math.max(0, now - toMin(a.checkedInAt)) : 0;
}

function Stat({ label, value, hint, tone }: { label: string; value: number; hint?: string; tone?: "warn" }) {
  return (
    <div className={cn("rounded-xl border bg-card p-3 sm:p-4", tone === "warn" && "border-amber-300 bg-amber-50")}>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums leading-none">{value}</p>
      {hint && <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function ScheduleView() {
  const [appts, setAppts] = React.useState<Appointment[]>(APPOINTMENTS);
  const [now, setNow] = React.useState(NOW_START);
  const [vetFilter, setVetFilter] = React.useState("all");
  const [bookOpen, setBookOpen] = React.useState(false);
  const [highlight, setHighlight] = React.useState<string | null>(null);

  React.useEffect(() => {
    const t = setInterval(() => setNow((n) => n + 1), 60_000);
    return () => clearInterval(t);
  }, []);

  React.useEffect(() => {
    if (!highlight) return;
    const t = setTimeout(() => setHighlight(null), 5000);
    return () => clearTimeout(t);
  }, [highlight]);

  const sorted = React.useMemo(
    () =>
      [...appts].sort(
        (a, b) => toMin(a.start) - toMin(b.start) || a.vet.localeCompare(b.vet) || a.id.localeCompare(b.id),
      ),
    [appts],
  );
  const visible = vetFilter === "all" ? sorted : sorted.filter((a) => a.vet === vetFilter);
  const waiting = appts
    .filter((a) => a.status === "checked_in")
    .sort((a, b) => toMin(a.checkedInAt ?? "00:00") - toMin(b.checkedInAt ?? "00:00"));
  const nextUp = sorted.filter((a) => a.status === "booked").slice(0, 3);
  const inExam = appts.filter((a) => a.status === "in_exam");
  const laterCount = appts.filter((a) => a.status === "booked").length;
  const doneCount = appts.filter((a) => a.status === "done").length;
  const longestWait = waiting.reduce((m, a) => Math.max(m, waitMinutes(a, now)), 0);

  function update(id: string, patch: Partial<Appointment>) {
    setAppts((list) => list.map((a) => (a.id === id ? { ...a, ...patch } : a)));
  }

  function checkIn(a: Appointment) {
    update(a.id, { status: "checked_in", checkedInAt: fromMin(now) });
    const p = patientById(a.patient);
    toast.success(`${p.name} checked in`, {
      description: `Waiting for ${vetById(a.vet).name}${p.alerts.length ? ` · Alert: ${p.alerts.join(", ")}` : ""}`,
    });
  }
  function toExam(a: Appointment) {
    update(a.id, { status: "in_exam" });
    toast(`${patientById(a.patient).name} sent to ${vetById(a.vet).room}`);
  }
  function finish(a: Appointment) {
    update(a.id, { status: "done" });
    toast(`${patientById(a.patient).name} marked done`);
  }

  function book(b: NewBooking) {
    const id = `a-${String(appts.length + 1).padStart(2, "0")}`;
    setAppts((list) => [...list, { id, ...b, status: "booked" }]);
    setHighlight(id);
    toast.success(`Booked ${patientById(b.patient).name}`, {
      description: `${vetById(b.vet).name} at ${b.start}`,
    });
  }

  function actionFor(a: Appointment) {
    const name = patientById(a.patient).name;
    if (a.status === "booked") {
      return (
        <Button className="h-11 min-w-32" onClick={() => checkIn(a)} aria-label={`Check in ${name}`}>
          <LogIn aria-hidden="true" />
          Check in
        </Button>
      );
    }
    if (a.status === "checked_in") {
      return (
        <Button variant="outline" className="h-11 min-w-32" onClick={() => toExam(a)} aria-label={`Send ${name} to exam`}>
          <Stethoscope aria-hidden="true" />
          To exam
        </Button>
      );
    }
    if (a.status === "in_exam") {
      return (
        <Button variant="outline" className="h-11 min-w-32" onClick={() => finish(a)} aria-label={`Mark ${name} done`}>
          <CircleCheck aria-hidden="true" />
          Mark done
        </Button>
      );
    }
    return null;
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">{formatDate(TODAY)} · Thursday</p>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Today&apos;s schedule</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            It is {fromMin(now)}. {waiting.length === 0 ? "Nobody is waiting." : `${waiting.length} waiting.`}
          </p>
        </div>
        <Button size="lg" className="h-12 px-5 text-base" onClick={() => setBookOpen(true)}>
          <CalendarPlus aria-hidden="true" />
          Book appointment
        </Button>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Waiting" value={waiting.length} hint={waiting.length ? `Longest ${longestWait} min` : "Room is clear"} tone={longestWait >= 20 ? "warn" : undefined} />
        <Stat label="In exam" value={inExam.length} hint={inExam.map((a) => vetById(a.vet).room).join(", ") || "None"} />
        <Stat label="Still to come" value={laterCount} hint="Booked, not arrived" />
        <Stat label="Done today" value={doneCount} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        {/* Waiting room first in reading order, beside the schedule on wide screens */}
        <aside className="grid content-start gap-4 lg:col-start-2 lg:row-start-1" aria-label="Waiting room and next arrivals">
          <section className="rounded-xl border bg-card" aria-labelledby="waiting-title">
            <div className="flex items-center justify-between border-b p-4">
              <h2 id="waiting-title" className="flex items-center gap-2 text-base font-semibold">
                <Hourglass className="size-4" aria-hidden="true" />
                Waiting room
              </h2>
              <Badge variant="secondary">{waiting.length}</Badge>
            </div>
            {waiting.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground">Nobody is checked in right now.</p>
            ) : (
              <ol className="divide-y">
                {waiting.map((a, i) => {
                  const p = patientById(a.patient);
                  const wait = waitMinutes(a, now);
                  const long = wait >= 20;
                  return (
                    <li key={a.id} className="grid gap-2 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground">#{i + 1} in line</p>
                          <Link href={`/patients/${p.id}`} className="text-base font-semibold underline-offset-4 hover:underline focus-visible:underline">
                            {p.name}
                          </Link>
                          <p className="text-sm text-muted-foreground">
                            {ownerById(p.owner).name} · {a.reason}
                          </p>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className={cn("text-xl font-semibold tabular-nums leading-none", long && "text-amber-700")}>
                            {wait}
                            <span className="ml-0.5 text-sm font-medium"> min</span>
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">since {a.checkedInAt}</p>
                        </div>
                      </div>
                      <AlertChips alerts={p.alerts} />
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs text-muted-foreground">
                          {vetById(a.vet).name} · booked {a.start}
                          {long && <span className="ml-1.5 font-semibold text-amber-700">Over 20 min</span>}
                        </p>
                        {actionFor(a)}
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}
          </section>

          <section className="rounded-xl border bg-card" aria-labelledby="next-title">
            <div className="border-b p-4">
              <h2 id="next-title" className="text-base font-semibold">Arriving next</h2>
            </div>
            {nextUp.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground">No more bookings today.</p>
            ) : (
              <ul className="divide-y">
                {nextUp.map((a) => {
                  const p = patientById(a.patient);
                  return (
                    <li key={a.id} className="grid gap-2 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm tabular-nums text-muted-foreground">
                            {a.start} · {vetById(a.vet).name}
                          </p>
                          <Link href={`/patients/${p.id}`} className="font-semibold underline-offset-4 hover:underline focus-visible:underline">
                            {p.name}
                          </Link>
                          <span className="text-sm text-muted-foreground"> · {ownerById(p.owner).name}</span>
                        </div>
                        {a.urgent && (
                          <Badge className="bg-orange-600 text-white">
                            <Siren aria-hidden="true" />
                            Urgent
                          </Badge>
                        )}
                      </div>
                      <AlertChips alerts={p.alerts} />
                      <div className="flex justify-end">{actionFor(a)}</div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section className="rounded-xl border bg-card" aria-labelledby="vets-title">
            <div className="border-b p-4">
              <h2 id="vets-title" className="text-base font-semibold">Vets right now</h2>
            </div>
            <ul className="divide-y">
              {VETS.map((v) => {
                const current = inExam.find((a) => a.vet === v.id);
                return (
                  <li key={v.id} className="flex items-center justify-between gap-3 p-4 text-sm">
                    <div>
                      <p className="font-medium">{v.name}</p>
                      <p className="text-xs text-muted-foreground">{v.room}</p>
                    </div>
                    {current ? (
                      <span className="text-right">
                        <span className="block font-medium">{patientById(current.patient).name}</span>
                        <span className="block text-xs text-muted-foreground">until about {endTime(current)}</span>
                      </span>
                    ) : (
                      <Badge variant="outline" className="border-emerald-300 bg-emerald-50 text-emerald-900">Free</Badge>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        </aside>

        <section className="min-w-0 lg:col-start-1 lg:row-start-1" aria-labelledby="sched-title">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <h2 id="sched-title" className="text-lg font-semibold">
              All appointments <span className="text-sm font-normal text-muted-foreground">({visible.length})</span>
            </h2>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by vet">
              {[{ id: "all", name: "All vets" }, ...VETS].map((v) => (
                <Button
                  key={v.id}
                  size="sm"
                  variant={vetFilter === v.id ? "default" : "outline"}
                  className="h-10 px-3.5"
                  aria-pressed={vetFilter === v.id}
                  onClick={() => setVetFilter(v.id)}
                >
                  {v.id === "all" ? v.name : v.name.replace("Dr. ", "Dr. ").split(" ").slice(0, 2).join(" ")}
                </Button>
              ))}
            </div>
          </div>

          <ul className="grid gap-3">
            {visible.map((a) => {
              const p = patientById(a.patient);
              const owner = ownerById(p.owner);
              const vet = vetById(a.vet);
              const cancelled = a.status === "cancelled";
              return (
                <li
                  key={a.id}
                  className={cn(
                    "grid gap-3 rounded-xl border bg-card p-4 transition-shadow sm:grid-cols-[5.5rem_minmax(0,1fr)_auto] sm:items-start",
                    a.urgent && !cancelled && "border-l-[6px] border-orange-500 bg-orange-50 ring-1 ring-orange-300",
                    a.status === "in_exam" && "border-violet-300",
                    highlight === a.id && "ring-2 ring-primary",
                    cancelled && "bg-muted/40 opacity-70",
                  )}
                  aria-label={`${a.start} ${p.name}, ${STATUS_LABEL[a.status]}${a.urgent ? ", urgent" : ""}`}
                >
                  <div className="flex items-baseline gap-2 sm:block">
                    <p className="text-xl font-semibold tabular-nums leading-none">{a.start}</p>
                    <p className="text-xs text-muted-foreground sm:mt-1">
                      to {endTime(a)} · {a.minutes} min
                    </p>
                  </div>

                  <div className="min-w-0 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <Link
                        href={`/patients/${p.id}`}
                        className="text-lg font-semibold leading-tight underline-offset-4 hover:underline focus-visible:underline"
                      >
                        {p.name}
                      </Link>
                      <span className="text-sm text-muted-foreground">
                        {p.species}, {p.breed}
                      </span>
                      {a.urgent && (
                        <Badge className="bg-orange-600 text-white">
                          <Siren aria-hidden="true" />
                          Urgent
                        </Badge>
                      )}
                    </div>
                    <p className={cn("text-sm", cancelled && "line-through")}>{a.reason}</p>
                    <p className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-sm text-muted-foreground">
                      <span>{owner.name}</span>
                      <a href={`tel:${owner.phone.replace(/\s/g, "")}`} className="inline-flex items-center gap-1 underline-offset-4 hover:underline">
                        <Phone className="size-3.5" aria-hidden="true" />
                        {owner.phone}
                      </a>
                      <span>
                        {vet.name} · {vet.room}
                      </span>
                    </p>
                    <AlertChips alerts={p.alerts} />
                  </div>

                  <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
                    <StatusBadge status={a.status} />
                    {a.status === "checked_in" && (
                      <span className="text-xs font-medium text-sky-900">Waiting {waitMinutes(a, now)} min</span>
                    )}
                    {actionFor(a)}
                  </div>
                </li>
              );
            })}
            {visible.length === 0 && (
              <li className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                No appointments for this vet today.
              </li>
            )}
          </ul>
        </section>
      </div>

      <BookDialog open={bookOpen} onOpenChange={setBookOpen} appointments={appts} nowMin={now} onBook={book} />
    </div>
  );
}
