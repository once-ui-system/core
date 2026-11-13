"use client";

import * as React from "react";
import { CalendarPlus, Clock } from "lucide-react";
import { toast } from "sonner";
import { AppointmentRow } from "@/components/schedule/appointment-row";
import { BookingDialog } from "@/components/schedule/booking-dialog";
import { RoomsPanel, WaitingList } from "@/components/schedule/side-panels";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  NOW_START,
  TODAY,
  formatDate,
  fromMin,
  getOwner,
  getPatient,
  getVet,
  initialAppointments,
  toMin,
  vets,
  type Appointment,
} from "@/lib/data";
import { cn } from "@/lib/utils";

export function ScheduleView() {
  const [appointments, setAppointments] = React.useState<Appointment[]>(initialAppointments);
  const [now, setNow] = React.useState(toMin(NOW_START));
  const [vetFilter, setVetFilter] = React.useState("all");
  const [hideClosed, setHideClosed] = React.useState(false);
  const [bookOpen, setBookOpen] = React.useState(false);
  const [highlight, setHighlight] = React.useState<string | null>(null);

  // The counter clock advances one minute per real minute so waiting times keep counting.
  React.useEffect(() => {
    const id = window.setInterval(() => setNow((n) => n + 1), 60_000);
    return () => window.clearInterval(id);
  }, []);

  React.useEffect(() => {
    if (!highlight) return;
    document.getElementById(`appt-${highlight}`)?.scrollIntoView({ block: "center", behavior: "smooth" });
    const t = window.setTimeout(() => setHighlight(null), 4000);
    return () => window.clearTimeout(t);
  }, [highlight]);

  const patch = (id: string, changes: Partial<Appointment>) =>
    setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, ...changes } : a)));

  function checkIn(a: Appointment) {
    const p = getPatient(a.patient)!;
    patch(a.id, { status: "checked_in", checkedInAt: fromMin(now) });
    toast.success(`${p.name} checked in`, {
      description:
        p.alerts.length > 0
          ? `Medical alert: ${p.alerts.join("; ")}`
          : `${getVet(a.vet).name} will see them from ${a.start}.`,
    });
  }

  function startExam(a: Appointment) {
    const p = getPatient(a.patient)!;
    patch(a.id, { status: "in_exam" });
    toast(`${p.name} is in ${getVet(a.vet).room}`);
  }

  function finish(a: Appointment) {
    const p = getPatient(a.patient)!;
    patch(a.id, { status: "done" });
    toast(`${p.name}'s visit is done`);
  }

  function book(input: { patient: string; vet: string; start: string; minutes: number; reason: string }) {
    const id = `a-${String(appointments.length + 1).padStart(2, "0")}`;
    setAppointments((prev) => [...prev, { id, ...input, status: "booked" }]);
    setBookOpen(false);
    setVetFilter("all");
    setHideClosed(false);
    setHighlight(id);
    const p = getPatient(input.patient)!;
    toast.success(`Booked ${p.name} at ${input.start}`, { description: `${getVet(input.vet).name} · ${input.reason}` });
  }

  const sorted = [...appointments].sort((a, b) => toMin(a.start) - toMin(b.start) || a.vet.localeCompare(b.vet));
  const visible = sorted.filter(
    (a) => (vetFilter === "all" || a.vet === vetFilter) && !(hideClosed && (a.status === "done" || a.status === "cancelled")),
  );

  const waiting = appointments.filter((a) => a.status === "checked_in");
  const inExam = appointments.filter((a) => a.status === "in_exam");
  const toCome = appointments.filter((a) => a.status === "booked");
  const urgent = appointments.filter((a) => a.urgent && (a.status === "booked" || a.status === "checked_in"));
  const longest = waiting.reduce((m, a) => Math.max(m, now - toMin(a.checkedInAt ?? a.start)), 0);

  const stats = [
    { label: "Waiting", value: waiting.length, note: waiting.length ? `longest ${longest} min` : "nobody waiting", tone: "text-amber-800" },
    { label: "In exam", value: inExam.length, note: "with a vet now", tone: "text-sky-900" },
    { label: "Still to arrive", value: toCome.length, note: "booked today", tone: "text-foreground" },
    { label: "Urgent", value: urgent.length, note: urgent.length ? "needs a slot first" : "none open", tone: "text-red-700" },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Today&apos;s schedule</h1>
          <p className="mt-1 flex flex-wrap items-center gap-x-3 text-sm text-muted-foreground">
            <span>{formatDate(TODAY, true)}</span>
            <span className="inline-flex items-center gap-1 font-medium text-foreground">
              <Clock aria-hidden className="size-4 text-muted-foreground" />
              <span className="sr-only">Clinic time</span>
              <span className="tabular-nums">{fromMin(now)}</span>
            </span>
          </p>
        </div>
        <Button size="lg" className="h-12 px-5 text-base" onClick={() => setBookOpen(true)}>
          <CalendarPlus aria-hidden />
          Book appointment
        </Button>
      </div>

      <dl className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border bg-card p-4">
            <dt className="text-sm text-muted-foreground">{s.label}</dt>
            <dd className={cn("mt-1 text-3xl font-bold leading-none tabular-nums", s.tone)}>{s.value}</dd>
            <dd className="mt-1.5 text-xs text-muted-foreground">{s.note}</dd>
          </div>
        ))}
      </dl>

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_23rem]">
        <aside aria-label="Waiting room and vets" className="grid gap-4 md:grid-cols-2 xl:order-2 xl:grid-cols-1">
          <WaitingList appointments={appointments} now={now} />
          <RoomsPanel appointments={appointments} />
        </aside>

        <Card className="gap-0 overflow-hidden py-0 xl:order-1">
          <CardHeader className="gap-3 border-b px-4 py-4">
            <CardTitle className="flex flex-wrap items-center justify-between gap-3 text-base">
              <span>
                All appointments{" "}
                <span className="font-normal text-muted-foreground" aria-live="polite">
                  ({visible.length} shown)
                </span>
              </span>
              <span className="flex items-center gap-2">
                <Switch id="hide-closed" checked={hideClosed} onCheckedChange={setHideClosed} />
                <Label htmlFor="hide-closed" className="text-sm font-normal">
                  Hide done and cancelled
                </Label>
              </span>
            </CardTitle>
            <ToggleGroup
              type="single"
              variant="outline"
              value={vetFilter}
              onValueChange={(v) => setVetFilter(v || "all")}
              aria-label="Filter by vet"
              className="flex-wrap justify-start"
            >
              <ToggleGroupItem value="all" className="h-10 px-4">
                All vets
              </ToggleGroupItem>
              {vets.map((v) => (
                <ToggleGroupItem key={v.id} value={v.id} className="h-10 px-4">
                  {v.short}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </CardHeader>
          <CardContent className="p-0">
            <div
              aria-hidden
              className="hidden grid-cols-[9rem_minmax(0,1.05fr)_minmax(0,1.4fr)_10.5rem] gap-x-4 border-b bg-muted/50 px-4 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground md:grid"
            >
              <span>Time and vet</span>
              <span>Patient and owner</span>
              <span>Reason and alerts</span>
              <span className="text-right">Status</span>
            </div>
            {visible.length === 0 ? (
              <p className="p-8 text-center text-sm text-muted-foreground">No appointments match these filters.</p>
            ) : (
              <ul aria-label="Appointments">
                {visible.map((a) => (
                  <AppointmentRow
                    key={a.id}
                    appointment={a}
                    patient={getPatient(a.patient)!}
                    owner={getOwner(getPatient(a.patient)!.owner)}
                    vet={getVet(a.vet)}
                    highlighted={highlight === a.id}
                    onCheckIn={() => checkIn(a)}
                    onStartExam={() => startExam(a)}
                    onFinish={() => finish(a)}
                  />
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <BookingDialog open={bookOpen} onOpenChange={setBookOpen} appointments={appointments} now={now} onBook={book} />
    </div>
  );
}
