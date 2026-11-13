"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  Clock,
  DoorOpen,
  Plus,
  Siren,
  Stethoscope,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertBadges } from "@/components/alert-badges";
import { BookingDialog } from "@/components/booking-dialog";
import {
  type Appointment,
  type Status,
  START_CLOCK,
  STATUS_LABEL,
  TODAY,
  appointments as initialAppointments,
  endTime,
  formatLongDate,
  fromMin,
  getOwner,
  getPatient,
  getVet,
  toMin,
  vets,
} from "@/lib/data";
import { cn } from "@/lib/utils";

const STATUS_STYLE: Record<Status, string> = {
  booked: "border-slate-300 bg-white text-slate-800",
  checked_in: "border-amber-300 bg-amber-100 text-amber-950",
  in_exam: "border-teal-300 bg-teal-100 text-teal-950",
  done: "border-transparent bg-muted text-muted-foreground",
  cancelled: "border-transparent bg-muted text-muted-foreground line-through",
};

function StatusBadge({ status }: { status: Status }) {
  return (
    <Badge variant="outline" className={cn("px-2.5 py-1 text-xs", STATUS_STYLE[status])}>
      {status === "done" && <Check aria-hidden />}
      {STATUS_LABEL[status]}
    </Badge>
  );
}

function waitText(mins: number) {
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min`;
  return `${Math.floor(mins / 60)} h ${mins % 60} min`;
}

export function Schedule() {
  const [appts, setAppts] = React.useState<Appointment[]>(initialAppointments);
  const [clock, setClock] = React.useState(START_CLOCK);
  const [vetFilter, setVetFilter] = React.useState("all");
  const [bookOpen, setBookOpen] = React.useState(false);
  const [freshId, setFreshId] = React.useState<string | null>(null);

  React.useEffect(() => {
    const t = window.setInterval(() => setClock((c) => c + 1), 60_000);
    return () => window.clearInterval(t);
  }, []);

  const advance = (a: Appointment) => {
    const next: Status | null =
      a.status === "booked"
        ? "checked_in"
        : a.status === "checked_in"
          ? "in_exam"
          : a.status === "in_exam"
            ? "done"
            : null;
    if (!next) return;
    setAppts((list) =>
      list.map((x) =>
        x.id === a.id
          ? { ...x, status: next, checkedInAt: next === "checked_in" ? clock : x.checkedInAt }
          : x,
      ),
    );
    const patient = getPatient(a.patient);
    const vet = getVet(a.vet);
    if (next === "checked_in") {
      toast.success(`${patient?.name} is checked in`, {
        description: `Waiting for ${vet?.name}.${
          patient?.alerts.length ? ` Alert: ${patient.alerts.join("; ")}.` : ""
        }`,
      });
    } else if (next === "in_exam") {
      toast(`${patient?.name} is in ${vet?.room}`);
    } else {
      toast(`${patient?.name}'s visit is done`);
    }
  };

  const book = (a: Appointment) => {
    setAppts((list) => [...list, a]);
    setFreshId(a.id);
    setBookOpen(false);
    const p = getPatient(a.patient);
    toast.success(`Booked ${p?.name} at ${a.start}`, {
      description: `${getVet(a.vet)?.name}, ${a.reason}`,
    });
    window.setTimeout(() => setFreshId(null), 6000);
  };

  const sorted = [...appts].sort(
    (a, b) => toMin(a.start) - toMin(b.start) || a.vet.localeCompare(b.vet),
  );
  const visible =
    vetFilter === "all" ? sorted : sorted.filter((a) => a.vet === vetFilter);
  const waiting = appts
    .filter((a) => a.status === "checked_in")
    .sort((a, b) => (a.checkedInAt ?? 0) - (b.checkedInAt ?? 0));

  const count = (s: Status) => appts.filter((a) => a.status === s).length;
  const stats = [
    { label: "Still to arrive", value: count("booked") },
    { label: "Waiting", value: count("checked_in"), hot: count("checked_in") > 0 },
    { label: "In exam", value: count("in_exam") },
    { label: "Done", value: count("done") },
  ];

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">
            <time dateTime={TODAY}>{formatLongDate(TODAY)}</time>
          </p>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Today&apos;s schedule
          </h1>
        </div>
        <Button size="lg" className="h-11 px-5" onClick={() => setBookOpen(true)}>
          <Plus aria-hidden />
          Book appointment
        </Button>
      </div>

      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className={cn(
              "rounded-xl border bg-card px-4 py-3",
              s.hot && "border-amber-300 bg-amber-50",
            )}
          >
            <dt className="text-xs font-medium text-muted-foreground">{s.label}</dt>
            <dd className="text-3xl font-semibold tabular-nums">{s.value}</dd>
          </div>
        ))}
      </dl>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_21rem]">
        <section aria-labelledby="waiting-title" className="lg:order-2 lg:sticky lg:top-24">
          <Card className="gap-0 py-0">
            <CardHeader className="flex flex-row items-center justify-between gap-2 border-b px-4 py-3">
              <CardTitle id="waiting-title" className="flex items-center gap-2 text-base">
                <Clock className="size-4 text-amber-700" aria-hidden />
                Waiting room
                <Badge variant="secondary" className="tabular-nums">
                  {waiting.length}
                </Badge>
              </CardTitle>
              <span className="text-xs text-muted-foreground tabular-nums">
                Clock {fromMin(clock)}
              </span>
            </CardHeader>
            <CardContent className="p-0">
              {waiting.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-muted-foreground">
                  Nobody is waiting. Check a patient in when they arrive.
                </p>
              ) : (
                <ol className="divide-y">
                  {waiting.map((a, i) => {
                    const p = getPatient(a.patient);
                    const vet = getVet(a.vet);
                    const mins = clock - (a.checkedInAt ?? clock);
                    return (
                      <li key={a.id} className="grid gap-2 p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="flex items-center gap-2">
                              {i === 0 && (
                                <Badge className="bg-amber-800 text-white">Next</Badge>
                              )}
                              <Link
                                href={`/patients/${a.patient}`}
                                className="truncate font-semibold underline-offset-4 hover:underline"
                              >
                                {p?.name}
                              </Link>
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {getOwner(p?.owner ?? "")?.name} · {a.reason}
                            </p>
                          </div>
                          <p
                            className={cn(
                              "shrink-0 rounded-md px-2 py-1 text-sm font-semibold tabular-nums",
                              mins >= 30
                                ? "bg-red-100 text-red-900"
                                : "bg-amber-100 text-amber-950",
                            )}
                          >
                            <span className="sr-only">Waiting </span>
                            {waitText(mins)}
                          </p>
                        </div>
                        {p && <AlertBadges alerts={p.alerts} />}
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs text-muted-foreground">
                            Booked {a.start} · {vet?.name} · {vet?.room}
                          </p>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-10"
                            onClick={() => advance(a)}
                            aria-label={`To exam: ${p?.name}, ${vet?.room}`}
                          >
                            <DoorOpen aria-hidden />
                            To exam
                          </Button>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              )}
            </CardContent>
          </Card>
        </section>

        <section aria-labelledby="list-title" className="grid gap-3 lg:order-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 id="list-title" className="text-lg font-semibold">
              Appointments
              <span className="ml-2 text-sm font-normal text-muted-foreground tabular-nums">
                {visible.length} shown
              </span>
            </h2>
            <div
              role="group"
              aria-label="Filter by vet"
              className="-mx-4 flex max-w-[calc(100%+2rem)] gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:max-w-full sm:px-0"
            >
              {[{ id: "all", label: "All vets" }].concat(
                vets.map((v) => ({ id: v.id, label: `Dr. ${v.name.split(" ").pop()}` })),
              ).map((f) => (
                <Button
                  key={f.id}
                  size="sm"
                  variant={vetFilter === f.id ? "default" : "outline"}
                  aria-pressed={vetFilter === f.id}
                  className="h-10 shrink-0 px-4"
                  onClick={() => setVetFilter(f.id)}
                >
                  {f.label}
                </Button>
              ))}
            </div>
          </div>

          <Card className="gap-0 overflow-hidden py-0">
            <ul className="divide-y">
              {visible.map((a) => {
                const p = getPatient(a.patient);
                const owner = getOwner(p?.owner ?? "");
                const vet = getVet(a.vet);
                const closed = a.status === "done" || a.status === "cancelled";
                const action =
                  a.status === "booked"
                    ? { label: "Check in", icon: UserCheck, primary: true }
                    : a.status === "checked_in"
                      ? { label: "Start exam", icon: Stethoscope, primary: false }
                      : a.status === "in_exam"
                        ? { label: "Mark done", icon: Check, primary: false }
                        : null;
                return (
                  <li
                    key={a.id}
                    data-urgent={a.urgent || undefined}
                    className={cn(
                      "grid gap-3 border-l-4 border-l-transparent p-4 sm:grid-cols-[5.5rem_minmax(0,1fr)_auto]",
                      closed && "bg-muted/40",
                      a.urgent && !closed && "border-l-red-600 bg-red-50",
                      a.id === freshId && "ring-2 ring-primary ring-inset",
                    )}
                  >
                    <div className="flex items-baseline gap-2 sm:block">
                      <p className="text-lg font-semibold tabular-nums">{a.start}</p>
                      <p className="text-xs text-muted-foreground tabular-nums">
                        to {endTime(a)} · {a.minutes} min
                      </p>
                    </div>

                    <div className="grid min-w-0 gap-1.5">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <Link
                          href={`/patients/${a.patient}`}
                          className={cn(
                            "text-base font-semibold underline-offset-4 hover:underline",
                            a.status === "cancelled" && "line-through",
                          )}
                        >
                          {p?.name}
                        </Link>
                        <span className="text-sm text-muted-foreground">
                          {p?.species} · {p?.breed}
                        </span>
                        {a.urgent && (
                          <Badge className="gap-1 bg-red-700 px-2 py-0.5 font-bold tracking-wide text-white uppercase">
                            <Siren aria-hidden />
                            Urgent
                          </Badge>
                        )}
                        {a.id === freshId && <Badge variant="secondary">New</Badge>}
                      </div>
                      {p && <AlertBadges alerts={p.alerts} />}
                      <p className="text-sm">{a.reason}</p>
                      <p className="text-sm text-muted-foreground">
                        {owner?.name} · {vet?.name} · {vet?.room}
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end sm:justify-start">
                      <StatusBadge status={a.status} />
                      {action && (
                        <Button
                          variant={action.primary ? "default" : "outline"}
                          className="h-11 px-4"
                          onClick={() => advance(a)}
                          aria-label={`${action.label}: ${p?.name}`}
                        >
                          <action.icon aria-hidden />
                          {action.label}
                        </Button>
                      )}
                    </div>
                  </li>
                );
              })}
              {visible.length === 0 && (
                <li className="p-8 text-center text-sm text-muted-foreground">
                  No appointments for this vet today.
                </li>
              )}
            </ul>
          </Card>
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            Tap a patient name to open the record <ArrowRight className="size-3" aria-hidden />
          </p>
        </section>
      </div>

      <BookingDialog
        open={bookOpen}
        onOpenChange={setBookOpen}
        appointments={appts}
        onBook={book}
      />
    </div>
  );
}
