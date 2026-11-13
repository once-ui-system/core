"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Clock, DoorOpen, Siren, UserCheck } from "lucide-react";
import { TODAY, VETS, fmtDate, fmtTime, fromMin, getOwner, getPatient, getVet, toMin, type Appointment } from "@/lib/data";
import { useClinic } from "@/lib/store";
import { AlertChips } from "./AlertChips";
import { BookAppointment } from "./BookAppointment";
import { StatusBadge } from "./StatusBadge";

const endTime = (a: Appointment) => fromMin(toMin(a.start) + a.minutes);

function waitText(mins: number): string {
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min`;
  return `${Math.floor(mins / 60)} h ${mins % 60} min`;
}

function Stat({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
      <p className={`text-3xl font-bold tabular-nums ${tone}`}>{value}</p>
      <p className="text-sm font-medium text-slate-600">{label}</p>
    </div>
  );
}

function WaitingList() {
  const { appointments, now } = useClinic();
  const waiting = appointments
    .filter((a) => a.status === "checked_in")
    .sort((a, b) => toMin(a.start) - toMin(b.start));
  const inExam = appointments.filter((a) => a.status === "in_exam");

  return (
    <aside aria-labelledby="waiting-h" className="grid gap-4 md:grid-cols-2 xl:sticky xl:top-24 xl:grid-cols-1 xl:self-start">
      <section className="rounded-2xl border border-slate-200 bg-white">
        <header className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <h2 id="waiting-h" className="flex items-center gap-2 text-lg font-bold">
            <Clock aria-hidden className="size-5 text-amber-600" />
            Waiting room
          </h2>
          <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-sm font-bold tabular-nums text-amber-900">{waiting.length}</span>
        </header>
        {waiting.length === 0 ? (
          <p className="px-4 py-6 text-sm text-slate-600">Nobody is waiting. Checked-in patients appear here.</p>
        ) : (
          <ol className="divide-y divide-slate-100">
            {waiting.map((a, i) => {
              const p = getPatient(a.patient);
              if (!p) return null;
              const since = a.checkedInAt ? toMin(a.checkedInAt) : now;
              const mins = Math.max(0, now - since);
              const long = mins >= 30;
              return (
                <li key={a.id} className="px-4 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="flex flex-wrap items-center gap-2">
                        <Link href={`/patients/${p.id}`} className="text-base font-semibold text-slate-900 underline-offset-2 hover:underline">
                          {p.name}
                        </Link>
                        {i === 0 && <span className="rounded bg-teal-700 px-1.5 py-0.5 text-xs font-bold uppercase tracking-wide text-white">Next</span>}
                      </p>
                      <p className="text-sm text-slate-600">
                        {getOwner(p.owner).name} · {a.reason}
                      </p>
                      <p className="text-sm text-slate-600">
                        {getVet(a.vet).name} · {getVet(a.vet).room} · booked {fmtTime(a.start)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold tabular-nums leading-tight ${long ? "text-red-700" : "text-slate-900"}`}>{waitText(mins)}</p>
                      <p className="text-xs text-slate-600">since {a.checkedInAt ? fmtTime(a.checkedInAt) : "now"}</p>
                    </div>
                  </div>
                  <AlertChips alerts={p.alerts} className="mt-2" />
                </li>
              );
            })}
          </ol>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white" aria-labelledby="exam-h">
        <header className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <h2 id="exam-h" className="flex items-center gap-2 text-lg font-bold">
            <DoorOpen aria-hidden className="size-5 text-sky-700" />
            In exam now
          </h2>
          <span className="rounded-full bg-sky-100 px-2.5 py-0.5 text-sm font-bold tabular-nums text-sky-900">{inExam.length}</span>
        </header>
        <ul className="divide-y divide-slate-100">
          {inExam.map((a) => {
            const p = getPatient(a.patient);
            if (!p) return null;
            return (
              <li key={a.id} className="px-4 py-3">
                <p className="flex items-baseline justify-between gap-3">
                  <Link href={`/patients/${p.id}`} className="font-semibold underline-offset-2 hover:underline">
                    {p.name}
                  </Link>
                  <span className="text-sm text-slate-600">{getVet(a.vet).room}</span>
                </p>
                <p className="text-sm text-slate-600">
                  {getVet(a.vet).name} · {a.reason}
                </p>
                <AlertChips alerts={p.alerts} className="mt-2" />
              </li>
            );
          })}
        </ul>
      </section>
    </aside>
  );
}

function Row({ a, highlighted }: { a: Appointment; highlighted: boolean }) {
  const { checkIn } = useClinic();
  const p = getPatient(a.patient);
  const vet = getVet(a.vet);
  const done = a.status === "done" || a.status === "cancelled";

  useEffect(() => {
    if (highlighted) document.getElementById(`appt-${a.id}`)?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [highlighted, a.id]);

  if (!p) return null;
  const owner = getOwner(p.owner);
  const tone = a.urgent && !done
    ? "border-l-red-600 bg-red-50"
    : a.status === "in_exam"
      ? "border-l-sky-500 bg-sky-50"
      : a.status === "checked_in"
        ? "border-l-amber-500 bg-white"
        : done
          ? "border-l-transparent bg-slate-50"
          : "border-l-transparent bg-white";

  return (
    <li
      id={`appt-${a.id}`}
      className={`grid gap-x-4 gap-y-2 border-l-4 px-4 py-3.5 md:grid-cols-[6.5rem_minmax(0,1fr)_auto] xl:grid-cols-[6.5rem_minmax(0,1.3fr)_minmax(0,1.2fr)_11rem_9.5rem] xl:items-center ${tone} ${highlighted ? "ring-2 ring-inset ring-teal-600" : ""}`}
    >
      <div className="flex items-baseline gap-2 md:col-start-1 md:row-span-3 md:row-start-1 md:block xl:row-span-1">
        <p className={`text-lg font-bold tabular-nums leading-tight ${a.status === "cancelled" ? "line-through" : ""}`}>{fmtTime(a.start)}</p>
        <p className="text-xs text-slate-600 tabular-nums">
          {a.minutes} min · to {fmtTime(endTime(a))}
        </p>
      </div>
      <div className="min-w-0 md:col-start-2 md:row-start-1 xl:col-start-2">
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <Link href={`/patients/${p.id}`} className="text-lg font-semibold text-slate-900 underline-offset-2 hover:underline">
            {p.name}
          </Link>
          <span className="text-sm text-slate-600">
            {p.species}, {p.breed}
          </span>
        </p>
        <p className="text-sm text-slate-700">Owner: {owner.name}</p>
        <AlertChips alerts={p.alerts} className="mt-1.5" />
      </div>
      <div className="min-w-0 md:col-start-2 md:row-start-2 xl:col-start-3 xl:row-start-1">
        {a.urgent && (
          <p className="mb-1 inline-flex items-center gap-1.5 rounded-md bg-red-600 px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-white">
            <Siren aria-hidden className="size-3.5" />
            Urgent
          </p>
        )}
        <p className="text-base text-slate-900">{a.reason}</p>
        <p className="text-sm text-slate-600">
          {vet.name} · {vet.room}
        </p>
      </div>
      <div className="md:col-start-3 md:row-start-1 md:text-right xl:col-start-4 xl:text-left">
        <StatusBadge status={a.status} />
        {a.status === "checked_in" && a.checkedInAt && <p className="mt-1 text-xs text-slate-600">in at {fmtTime(a.checkedInAt)}</p>}
      </div>
      <div className="md:col-start-3 md:row-start-2 md:text-right xl:col-start-5 xl:row-start-1">
        {a.status === "booked" && (
          <button
            type="button"
            onClick={() => checkIn(a.id)}
            aria-label={`Check in ${p.name}`}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-teal-700 px-4 text-base font-semibold text-white hover:bg-teal-800 md:w-auto"
          >
            <UserCheck aria-hidden className="size-5" />
            Check in
          </button>
        )}
      </div>
    </li>
  );
}

export function Schedule() {
  const { appointments, now, highlightId } = useClinic();
  const [vetFilter, setVetFilter] = useState<string>("all");

  const sorted = useMemo(
    () =>
      [...appointments]
        .filter((a) => vetFilter === "all" || a.vet === vetFilter)
        .sort((x, y) => toMin(x.start) - toMin(y.start) || x.vet.localeCompare(y.vet)),
    [appointments, vetFilter],
  );
  const count = (s: Appointment["status"]) => appointments.filter((a) => a.status === s).length;

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-600">
            {fmtDate(TODAY, { weekday: "long", month: "long", day: "numeric", year: "numeric" })} · now {fmtTime(fromMin(now))}
          </p>
          <h1 className="text-3xl font-bold tracking-tight">Today&apos;s schedule</h1>
        </div>
        <BookAppointment />
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Waiting" value={count("checked_in")} tone="text-amber-700" />
        <Stat label="In exam" value={count("in_exam")} tone="text-sky-700" />
        <Stat label="Still to arrive" value={count("booked")} tone="text-slate-900" />
        <Stat label="Done" value={count("done")} tone="text-emerald-700" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="order-2 xl:order-1">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-bold">All appointments</h2>
            <div role="group" aria-label="Filter by vet" className="flex flex-wrap gap-2">
              {[{ id: "all", name: "All vets" }, ...VETS].map((v) => (
                <button
                  key={v.id}
                  type="button"
                  aria-pressed={vetFilter === v.id}
                  onClick={() => setVetFilter(v.id)}
                  className={`h-11 rounded-full border px-4 text-sm font-semibold ${
                    vetFilter === v.id ? "border-teal-800 bg-teal-700 text-white" : "border-slate-300 bg-white text-slate-800 hover:bg-slate-50"
                  }`}
                >
                  {v.name}
                </button>
              ))}
            </div>
          </div>
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div aria-hidden className="hidden grid-cols-[6.5rem_minmax(0,1.3fr)_minmax(0,1.2fr)_11rem_9.5rem] gap-x-4 border-b border-slate-200 bg-slate-50 px-4 py-2 pl-5 text-xs font-semibold uppercase tracking-wide text-slate-600 xl:grid">
              <span>Time</span>
              <span>Patient and owner</span>
              <span>Reason and vet</span>
              <span>Status</span>
              <span />
            </div>
            <ul aria-label="Appointments today" className="divide-y divide-slate-100">
              {sorted.map((a) => (
                <Row key={a.id} a={a} highlighted={a.id === highlightId} />
              ))}
            </ul>
            {sorted.length === 0 && <p className="px-4 py-8 text-center text-sm text-slate-600">No appointments for this vet.</p>}
          </div>
        </div>
        <div className="order-1 xl:order-2">
          <WaitingList />
        </div>
      </div>
    </div>
  );
}
