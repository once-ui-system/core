"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { CalendarDays, Clock, DoorOpen, Hourglass, LogIn, CircleCheck, Plus, Siren } from "lucide-react";
import { AlertChips } from "@/components/alerts";
import { BookDialog } from "@/components/book-dialog";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  NOW_MINUTES,
  TODAY,
  appointments,
  endClock,
  formatLongDate,
  initialArrivals,
  ownerOf,
  patientOf,
  toClock,
  toMinutes,
  vetOf,
  vets,
  type Appointment,
  type Status,
} from "@/lib/data";
import { cn } from "@/lib/utils";

const LONG_WAIT = 15;

export function ScheduleBoard() {
  const [appts, setAppts] = useState<Appointment[]>(appointments);
  const [arrivals, setArrivals] = useState<Record<string, number>>(initialArrivals);
  const [now, setNow] = useState(NOW_MINUTES);
  const [vetFilter, setVetFilter] = useState("all");
  const [hideFinished, setHideFinished] = useState(false);
  const [bookOpen, setBookOpen] = useState(false);
  const [fresh, setFresh] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setInterval(() => setNow((n) => n + 1), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const sorted = useMemo(
    () =>
      [...appts].sort(
        (a, b) => toMinutes(a.start) - toMinutes(b.start) || a.vet.localeCompare(b.vet)
      ),
    [appts]
  );

  const visible = sorted.filter(
    (a) =>
      (vetFilter === "all" || a.vet === vetFilter) &&
      !(hideFinished && (a.status === "done" || a.status === "cancelled"))
  );

  const waiting = appts
    .filter((a) => a.status === "checked_in")
    .sort((a, b) => (arrivals[a.id] ?? now) - (arrivals[b.id] ?? now));
  const arrivingNext = sorted.filter((a) => a.status === "booked").slice(0, 3);

  const count = (s: Status) => appts.filter((a) => a.status === s).length;
  const activeTotal = appts.filter((a) => a.status !== "cancelled").length;

  function setStatus(id: string, status: Status) {
    setAppts((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
  }

  function checkIn(a: Appointment) {
    const patient = patientOf(a);
    setStatus(a.id, "checked_in");
    setArrivals((prev) => ({ ...prev, [a.id]: now }));
    toast.success(`${patient.name} checked in`, {
      description:
        patient.alerts.length > 0
          ? `Alert: ${patient.alerts.join("; ")}`
          : `${vetOf(a).name} at ${a.start}`,
      action: {
        label: "Undo",
        onClick: () => {
          setStatus(a.id, "booked");
          setArrivals((prev) => {
            const next = { ...prev };
            delete next[a.id];
            return next;
          });
        },
      },
    });
  }

  function sendToExam(a: Appointment) {
    setStatus(a.id, "in_exam");
    toast(`${patientOf(a).name} sent to ${vetOf(a).room}`, { description: vetOf(a).name });
  }

  function markDone(a: Appointment) {
    setStatus(a.id, "done");
    toast.success(`${patientOf(a).name} is done`);
  }

  function handleBook(a: Appointment) {
    setAppts((prev) => [...prev, a]);
    if (vetFilter !== "all" && vetFilter !== a.vet) setVetFilter("all");
    setFresh(a.id);
    window.setTimeout(() => setFresh(null), 6000);
    window.setTimeout(
      () => document.getElementById(`appt-${a.id}`)?.scrollIntoView({ block: "center", behavior: "smooth" }),
      100
    );
    toast.success(`Booked ${patientOf(a).name} with ${vetOf(a).name}`, {
      description: `Today at ${a.start}, ${a.minutes} minutes`,
    });
  }

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Today&rsquo;s schedule</h1>
          <p className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
            <CalendarDays className="size-4" aria-hidden="true" />
            {formatLongDate(TODAY)}
            <span aria-hidden="true">&middot;</span>
            <Clock className="size-4" aria-hidden="true" />
            <span className="tabular-nums">{toClock(now)} now</span>
          </p>
        </div>
        <Button size="lg" className="h-12 px-5 text-base" onClick={() => setBookOpen(true)}>
          <Plus aria-hidden="true" />
          New appointment
        </Button>
      </div>

      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Waiting" value={count("checked_in")} tone="bg-amber-500" />
        <Stat label="In exam" value={count("in_exam")} tone="bg-sky-500" />
        <Stat label="Still to arrive" value={count("booked")} tone="bg-slate-400" />
        <Stat label="Done" value={count("done")} suffix={`of ${activeTotal}`} tone="bg-emerald-500" />
      </dl>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <aside aria-label="Waiting room and arrivals" className="grid gap-4 xl:sticky xl:top-24 xl:order-2">
          <section aria-labelledby="waiting-heading" className="rounded-xl border bg-card shadow-xs">
            <div className="flex items-center justify-between gap-2 border-b px-4 py-3">
              <h2 id="waiting-heading" className="flex items-center gap-2 font-semibold">
                <Hourglass className="size-4 text-amber-600" aria-hidden="true" />
                Waiting room
              </h2>
              <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-sm font-semibold text-amber-950 tabular-nums dark:bg-amber-500/20 dark:text-amber-100">
                {waiting.length}
              </span>
            </div>
            {waiting.length === 0 ? (
              <p className="px-4 py-6 text-sm text-muted-foreground">Nobody is waiting right now.</p>
            ) : (
              <ol className="divide-y">
                {waiting.map((a, i) => {
                  const p = patientOf(a);
                  const mins = Math.max(0, now - (arrivals[a.id] ?? now));
                  const long = mins >= LONG_WAIT;
                  return (
                    <li key={a.id} className="grid gap-2 px-4 py-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="flex items-baseline gap-2">
                            <span className="text-xs font-medium text-muted-foreground tabular-nums">
                              #{i + 1}
                            </span>
                            <Link
                              href={`/patients/${p.id}`}
                              className="truncate text-base font-semibold underline-offset-4 hover:underline focus-visible:underline"
                            >
                              {p.name}
                            </Link>
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {vetOf(a).name} &middot; booked {a.start}
                          </p>
                        </div>
                        <div
                          className={cn(
                            "shrink-0 rounded-lg px-2.5 py-1 text-right",
                            long
                              ? "bg-amber-100 text-amber-950 dark:bg-amber-500/20 dark:text-amber-100"
                              : "bg-muted"
                          )}
                        >
                          <p className="text-lg leading-none font-semibold tabular-nums">{mins} min</p>
                          <p className="mt-0.5 text-[11px] leading-none">
                            since {toClock(arrivals[a.id] ?? now)}
                          </p>
                        </div>
                      </div>
                      <AlertChips alerts={p.alerts} />
                      <Button
                        variant="secondary"
                        className="h-11 w-full"
                        onClick={() => sendToExam(a)}
                        aria-label={`Send ${p.name} to ${vetOf(a).room}`}
                      >
                        <DoorOpen aria-hidden="true" />
                        Send to {vetOf(a).room}
                      </Button>
                    </li>
                  );
                })}
              </ol>
            )}
          </section>

          <section aria-labelledby="next-heading" className="rounded-xl border bg-card shadow-xs">
            <div className="border-b px-4 py-3">
              <h2 id="next-heading" className="font-semibold">
                Arriving next
              </h2>
            </div>
            {arrivingNext.length === 0 ? (
              <p className="px-4 py-6 text-sm text-muted-foreground">No more arrivals expected.</p>
            ) : (
              <ul className="divide-y">
                {arrivingNext.map((a) => {
                  const p = patientOf(a);
                  return (
                    <li key={a.id} className="grid gap-2 px-4 py-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <Link
                            href={`/patients/${p.id}`}
                            className="text-base font-semibold underline-offset-4 hover:underline focus-visible:underline"
                          >
                            {p.name}
                          </Link>
                          <p className="text-sm text-muted-foreground">
                            {ownerOf(p).name} &middot; {vetOf(a).name}
                          </p>
                        </div>
                        <p className="text-lg font-semibold tabular-nums">{a.start}</p>
                      </div>
                      {a.urgent && <UrgentTag />}
                      <AlertChips alerts={p.alerts} />
                      <Button
                        variant="outline"
                        className="h-11 w-full"
                        onClick={() => checkIn(a)}
                        aria-label={`Check in ${p.name}`}
                      >
                        <LogIn aria-hidden="true" />
                        Check in
                      </Button>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </aside>

        <section aria-labelledby="all-heading" className="min-w-0 xl:order-1">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <h2 id="all-heading" className="text-lg font-semibold">
              All appointments
            </h2>
            <div className="flex items-center gap-2">
              <Switch id="hide-finished" checked={hideFinished} onCheckedChange={setHideFinished} />
              <Label htmlFor="hide-finished" className="text-sm">
                Hide done and cancelled
              </Label>
            </div>
          </div>

          <div role="group" aria-label="Filter by vet" className="mb-3 flex gap-2 overflow-x-auto pb-1">
            <FilterButton active={vetFilter === "all"} onClick={() => setVetFilter("all")}>
              All vets
            </FilterButton>
            {vets.map((v) => (
              <FilterButton key={v.id} active={vetFilter === v.id} onClick={() => setVetFilter(v.id)}>
                {v.name}
                <span className="font-normal opacity-75"> &middot; {v.room}</span>
              </FilterButton>
            ))}
          </div>

          <div className="overflow-hidden rounded-xl border bg-card shadow-xs">
            <div
              aria-hidden="true"
              className="hidden grid-cols-[5rem_minmax(0,1.3fr)_minmax(0,1fr)_7rem_8.5rem] gap-4 border-b bg-muted/50 px-4 py-2 text-xs font-medium tracking-wide text-muted-foreground uppercase lg:grid"
            >
              <span>Time</span>
              <span>Patient and owner</span>
              <span>Reason and vet</span>
              <span>Status</span>
              <span />
            </div>
            {visible.length === 0 ? (
              <p className="px-4 py-10 text-center text-sm text-muted-foreground">
                No appointments match this filter.
              </p>
            ) : (
              <ul>
                {visible.map((a) => (
                  <AppointmentRow
                    key={a.id}
                    a={a}
                    now={now}
                    isNew={fresh === a.id}
                    onCheckIn={() => checkIn(a)}
                    onExam={() => sendToExam(a)}
                    onDone={() => markDone(a)}
                  />
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>

      <BookDialog open={bookOpen} onOpenChange={setBookOpen} appts={appts} now={now} onBook={handleBook} />
    </div>
  );
}

function Stat({
  label,
  value,
  suffix,
  tone,
}: {
  label: string;
  value: number;
  suffix?: string;
  tone: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-4 shadow-xs">
      <dt className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className={cn("size-2.5 rounded-full", tone)} aria-hidden="true" />
        {label}
      </dt>
      <dd className="mt-1 flex items-baseline gap-2">
        <span className="text-3xl font-semibold tabular-nums">{value}</span>
        {suffix && <span className="text-sm text-muted-foreground">{suffix}</span>}
      </dd>
    </div>
  );
}

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Button
      type="button"
      variant={active ? "default" : "outline"}
      aria-pressed={active}
      onClick={onClick}
      className="h-11 shrink-0 px-4"
    >
      {children}
    </Button>
  );
}

function UrgentTag() {
  return (
    <span className="inline-flex w-fit items-center gap-1 rounded-md bg-red-600 px-2 py-0.5 text-xs font-bold tracking-wide text-white uppercase">
      <Siren className="size-3.5" aria-hidden="true" />
      Urgent
    </span>
  );
}

function AppointmentRow({
  a,
  now,
  isNew,
  onCheckIn,
  onExam,
  onDone,
}: {
  a: Appointment;
  now: number;
  isNew: boolean;
  onCheckIn: () => void;
  onExam: () => void;
  onDone: () => void;
}) {
  const p = patientOf(a);
  const owner = ownerOf(p);
  const vet = vetOf(a);
  const finished = a.status === "done" || a.status === "cancelled";
  const late = a.status === "booked" && toMinutes(a.start) < now;
  const urgentOpen = a.urgent && !finished;

  return (
    <li
      id={`appt-${a.id}`}
      className={cn(
        "grid scroll-mt-28 grid-cols-[4.5rem_minmax(0,1fr)_auto] gap-x-3 gap-y-2 border-b border-l-4 border-l-transparent px-4 py-3.5 last:border-b-0",
        "lg:grid-cols-[5rem_minmax(0,1.3fr)_minmax(0,1fr)_7rem_8.5rem] lg:items-center lg:gap-x-4 lg:gap-y-0",
        urgentOpen && "border-l-red-600 bg-red-50 dark:bg-red-950/30",
        finished && "bg-muted/40",
        isNew && "ring-2 ring-primary ring-inset"
      )}
    >
      <div className="col-start-1 row-span-3 row-start-1 lg:col-start-1 lg:row-span-1 lg:row-start-1">
        <p className={cn("text-lg font-semibold tabular-nums", finished && "text-muted-foreground")}>{a.start}</p>
        <p className="text-xs text-muted-foreground tabular-nums">
          {a.minutes} min
          <span className="hidden lg:inline"> &middot; to {endClock(a)}</span>
        </p>
        {late && <p className="mt-1 text-xs font-semibold text-red-700 dark:text-red-300">{now - toMinutes(a.start)} min late</p>}
      </div>

      <div className="col-start-2 row-start-1 min-w-0 lg:col-start-2">
        <p className="flex flex-wrap items-baseline gap-x-2">
          <Link
            href={`/patients/${p.id}`}
            className={cn(
              "text-base font-semibold underline-offset-4 hover:underline focus-visible:underline",
              a.status === "cancelled" && "text-muted-foreground line-through"
            )}
          >
            {p.name}
          </Link>
          <span className="text-sm text-muted-foreground">
            {p.species}, {p.breed}
          </span>
        </p>
        <p className="text-sm text-muted-foreground">Owner: {owner.name}</p>
        <AlertChips alerts={p.alerts} className="mt-1.5" />
      </div>

      <div className="col-start-2 col-span-2 row-start-2 min-w-0 lg:col-span-1 lg:col-start-3 lg:row-start-1">
        <p className={cn("text-sm", finished && "text-muted-foreground")}>{a.reason}</p>
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
          {urgentOpen && <UrgentTag />}
          <span className="text-sm text-muted-foreground">
            {vet.name} &middot; {vet.room}
          </span>
        </div>
      </div>

      <div className="col-start-3 row-start-1 justify-self-end lg:col-start-4 lg:justify-self-start">
        <StatusBadge status={a.status} />
      </div>

      <div className="col-start-2 col-span-2 row-start-3 empty:hidden lg:col-span-1 lg:col-start-5 lg:row-start-1">
        {a.status === "booked" && (
          <Button className="h-11 w-full lg:h-10" onClick={onCheckIn} aria-label={`Check in ${p.name}`}>
            <LogIn aria-hidden="true" />
            Check in
          </Button>
        )}
        {a.status === "checked_in" && (
          <Button variant="secondary" className="h-11 w-full lg:h-10" onClick={onExam} aria-label={`Send ${p.name} to ${vet.room}`}>
            <DoorOpen aria-hidden="true" />
            To exam
          </Button>
        )}
        {a.status === "in_exam" && (
          <Button variant="outline" className="h-11 w-full lg:h-10" onClick={onDone} aria-label={`Mark ${p.name} done`}>
            <CircleCheck aria-hidden="true" />
            Mark done
          </Button>
        )}
      </div>
    </li>
  );
}
