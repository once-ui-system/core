"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { CalendarPlus, Clock, DoorOpen, LogIn, Siren, UserRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertBadges } from "@/components/alert-badges";
import { BookDialog } from "@/components/book-dialog";
import { cn } from "@/lib/utils";
import {
  type Appointment,
  type Status,
  endTime,
  fromMin,
  formatDate,
  getOwner,
  getPatient,
  getVet,
  initialAppointments,
  openingClock,
  statusLabel,
  toMin,
  today,
  vets,
} from "@/lib/data";

const statusStyle: Record<Status, string> = {
  booked: "bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-600",
  checked_in: "bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950 dark:text-amber-100 dark:border-amber-700",
  in_exam: "bg-sky-100 text-sky-900 border-sky-300 dark:bg-sky-950 dark:text-sky-100 dark:border-sky-700",
  done: "bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-100 dark:border-emerald-700",
  cancelled: "bg-muted text-muted-foreground border-border",
};

function StatusBadge({ status }: { status: Status }) {
  return (
    <Badge variant="outline" className={cn("px-2.5 py-1 text-xs font-semibold", statusStyle[status])}>
      {statusLabel[status]}
    </Badge>
  );
}

function waitText(minutes: number): string {
  if (minutes < 1) return "just arrived";
  if (minutes < 60) return `${minutes} min`;
  return `${Math.floor(minutes / 60)} h ${minutes % 60} min`;
}

export function Schedule() {
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const [vetFilter, setVetFilter] = useState<string>("all");
  const [bookOpen, setBookOpen] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const started = Date.now();
    const id = window.setInterval(() => setElapsed(Math.floor((Date.now() - started) / 60000)), 10000);
    return () => window.clearInterval(id);
  }, []);
  const nowMin = openingClock + elapsed;

  const sorted = useMemo(
    () => [...appointments].sort((a, b) => toMin(a.start) - toMin(b.start) || a.vet.localeCompare(b.vet)),
    [appointments],
  );
  const visible = sorted.filter((a) => vetFilter === "all" || a.vet === vetFilter);

  const waiting = useMemo(
    () =>
      appointments
        .filter((a) => a.status === "checked_in")
        .sort((a, b) => (a.checkedInAt ?? 0) - (b.checkedInAt ?? 0)),
    [appointments],
  );

  const counts = {
    booked: appointments.filter((a) => a.status === "booked").length,
    checked_in: waiting.length,
    in_exam: appointments.filter((a) => a.status === "in_exam").length,
    done: appointments.filter((a) => a.status === "done").length,
  };

  function setStatus(id: string, status: Status, extra?: Partial<Appointment>) {
    setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, status, ...extra } : a)));
  }

  function checkIn(a: Appointment) {
    setStatus(a.id, "checked_in", { checkedInAt: nowMin });
    const p = getPatient(a.patient);
    toast.success(`${p?.name} checked in`, {
      description: p && p.alerts.length > 0 ? `Alert: ${p.alerts.join("; ")}` : `Waiting for ${getVet(a.vet)?.name}`,
    });
  }

  function startExam(a: Appointment) {
    setStatus(a.id, "in_exam");
    const p = getPatient(a.patient);
    toast(`${p?.name} sent to ${getVet(a.vet)?.room}`);
  }

  function book(draft: Omit<Appointment, "id" | "status">) {
    const next: Appointment = { ...draft, id: `a-${String(appointments.length + 1).padStart(2, "0")}`, status: "booked" };
    setAppointments((prev) => [...prev, next]);
    setBookOpen(false);
    toast.success(`Booked ${getPatient(draft.patient)?.name}`, {
      description: `${getVet(draft.vet)?.name}, ${draft.start} to ${endTime(draft)}`,
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
      <section aria-labelledby="schedule-title" className="min-w-0 space-y-4 lg:order-1">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 id="schedule-title" className="text-2xl font-semibold tracking-tight">
              Today’s schedule
            </h1>
            <p className="text-sm text-muted-foreground">
              {formatDate(today, { weekday: "long", day: "numeric", month: "long", year: "numeric" })} · clock{" "}
              <span className="font-medium text-foreground tabular-nums">{fromMin(nowMin)}</span>
            </p>
          </div>
          <Button size="lg" className="h-11 bg-teal-700 px-5 text-white hover:bg-teal-800" onClick={() => setBookOpen(true)}>
            <CalendarPlus aria-hidden /> Book appointment
          </Button>
        </div>

        <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {(
            [
              ["Still to come", counts.booked],
              ["Waiting", counts.checked_in],
              ["In exam", counts.in_exam],
              ["Done", counts.done],
            ] as const
          ).map(([label, n]) => (
            <div key={label} className="rounded-lg border bg-card px-3 py-2.5">
              <dt className="text-xs text-muted-foreground">{label}</dt>
              <dd className="text-2xl font-semibold tabular-nums">{n}</dd>
            </div>
          ))}
        </dl>

        <div role="group" aria-label="Filter by vet" className="flex gap-2 overflow-x-auto pb-1">
          {[{ id: "all", name: "All vets" }, ...vets].map((v) => {
            const active = vetFilter === v.id;
            return (
              <button
                key={v.id}
                type="button"
                aria-pressed={active}
                onClick={() => setVetFilter(v.id)}
                className={cn(
                  "h-10 shrink-0 rounded-full border px-4 text-sm font-medium outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50",
                  active ? "border-teal-700 bg-teal-700 text-white" : "bg-card hover:bg-accent",
                )}
              >
                {v.name}
              </button>
            );
          })}
        </div>

        <ol className="space-y-2.5" aria-label="Appointments">
          {visible.map((a) => {
            const p = getPatient(a.patient);
            const owner = p ? getOwner(p.owner) : undefined;
            const vet = getVet(a.vet);
            const cancelled = a.status === "cancelled";
            return (
              <li
                key={a.id}
                className={cn(
                  "rounded-xl border bg-card p-3.5 shadow-xs sm:p-4",
                  a.urgent && !cancelled && a.status !== "done" && "border-red-500 bg-red-50 ring-1 ring-red-500/60 dark:bg-red-950/40",
                  cancelled && "opacity-70",
                )}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                  <div className="flex shrink-0 items-baseline gap-2 sm:w-24 sm:flex-col sm:gap-0">
                    <p className="text-xl font-semibold tabular-nums">{a.start}</p>
                    <p className="text-xs text-muted-foreground tabular-nums">
                      to {endTime(a)} · {a.minutes} min
                    </p>
                  </div>

                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      {p ? (
                        <Link
                          href={`/patients/${p.id}`}
                          className={cn(
                            "rounded-sm text-base font-semibold underline-offset-4 outline-none hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/50",
                            cancelled && "line-through",
                          )}
                        >
                          {p.name}
                        </Link>
                      ) : null}
                      <span className="text-sm text-muted-foreground">
                        {p?.species}, {p?.breed}
                      </span>
                      {a.urgent && !cancelled && (
                        <Badge className="gap-1 bg-red-600 px-2 text-xs font-bold tracking-wide text-white uppercase">
                          <Siren aria-hidden /> Urgent
                        </Badge>
                      )}
                    </div>
                    <p className={cn("text-sm", cancelled && "line-through")}>{a.reason}</p>
                    <p className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-sm text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <UserRound aria-hidden className="size-3.5" /> {owner?.name}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <DoorOpen aria-hidden className="size-3.5" /> {vet?.name} · {vet?.room}
                      </span>
                    </p>
                    {p && <AlertBadges alerts={p.alerts} />}
                  </div>

                  <div className="flex items-center justify-between gap-3 sm:w-36 sm:flex-col sm:items-end">
                    <StatusBadge status={a.status} />
                    {a.status === "booked" && (
                      <Button
                        className="h-11 bg-teal-700 px-4 text-white hover:bg-teal-800"
                        onClick={() => checkIn(a)}
                        aria-label={`Check in ${p?.name}`}
                      >
                        <LogIn aria-hidden /> Check in
                      </Button>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
          {visible.length === 0 && <li className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">No appointments for this vet.</li>}
        </ol>
      </section>

      <aside aria-labelledby="waiting-title" className="lg:sticky lg:top-28 lg:order-2">
        <div className="rounded-xl border bg-card shadow-xs">
          <div className="flex items-center justify-between gap-2 border-b px-4 py-3">
            <h2 id="waiting-title" className="text-base font-semibold">
              Waiting room
            </h2>
            <Badge variant="secondary" className="tabular-nums">
              {waiting.length} waiting
            </Badge>
          </div>
          {waiting.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">Nobody is waiting. Check patients in as they arrive.</p>
          ) : (
            <ol className="divide-y">
              {waiting.map((a, i) => {
                const p = getPatient(a.patient);
                const vet = getVet(a.vet);
                const waited = Math.max(0, nowMin - (a.checkedInAt ?? nowMin));
                const long = waited >= 20;
                return (
                  <li key={a.id} className="space-y-2 px-4 py-3.5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="flex flex-wrap items-center gap-2">
                          <Link
                            href={`/patients/${a.patient}`}
                            className="rounded-sm font-semibold underline-offset-4 hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
                          >
                            {p?.name}
                          </Link>
                          {i === 0 && <Badge className="bg-teal-700 text-white">Next</Badge>}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {a.reason} · {vet?.name}
                        </p>
                      </div>
                      <p
                        className={cn(
                          "flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-sm font-semibold tabular-nums",
                          long ? "bg-red-100 text-red-900 dark:bg-red-950 dark:text-red-100" : "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-100",
                        )}
                      >
                        <Clock aria-hidden className="size-3.5" />
                        <span className="sr-only">Waiting </span>
                        {waitText(waited)}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground tabular-nums">
                      Arrived {fromMin(a.checkedInAt ?? nowMin)} · booked {a.start}
                    </p>
                    {p && <AlertBadges alerts={p.alerts} />}
                    <Button variant="outline" className="h-10 w-full" onClick={() => startExam(a)}>
                      Send to {vet?.room}
                    </Button>
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      </aside>

      <BookDialog open={bookOpen} onOpenChange={setBookOpen} appointments={appointments} nowMin={nowMin} onBook={book} />
    </div>
  );
}
