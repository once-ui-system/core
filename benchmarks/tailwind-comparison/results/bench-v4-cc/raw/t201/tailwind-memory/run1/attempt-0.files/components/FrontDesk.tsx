"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CalendarPlus, CircleCheck, Clock, LogIn, Zap } from "lucide-react";
import { AlertBadges, AlertMark } from "@/components/AlertBadges";
import BookingDialog from "@/components/BookingDialog";
import { StatusPill } from "@/components/StatusPill";
import {
  type Appointment,
  NOW_MINUTES,
  TODAY,
  appointments as seed,
  getOwner,
  getPatient,
  getVet,
  vets,
} from "@/lib/data";
import { formatLongDate, fromMinutes, time12, toMinutes } from "@/lib/format";

function waitTone(min: number): string {
  if (min >= 30) return "bg-red-50 text-red-800 ring-red-300";
  if (min >= 15) return "bg-amber-50 text-amber-900 ring-amber-300";
  return "bg-slate-100 text-slate-800 ring-slate-300";
}

export default function FrontDesk() {
  const [appts, setAppts] = useState<Appointment[]>(seed);
  const [now, setNow] = useState(NOW_MINUTES);
  const [vetFilter, setVetFilter] = useState("all");
  const [activeOnly, setActiveOnly] = useState(false);
  const [bookOpen, setBookOpen] = useState(false);
  const [notice, setNotice] = useState<{ id: number; text: string } | null>(null);
  const [flashId, setFlashId] = useState<string | null>(null);

  useEffect(() => {
    const t = setInterval(() => setNow((n) => n + 1), 60000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(null), 8000);
    return () => clearTimeout(t);
  }, [notice]);

  useEffect(() => {
    if (!flashId) return;
    const t = setTimeout(() => setFlashId(null), 3500);
    return () => clearTimeout(t);
  }, [flashId]);

  const sorted = useMemo(
    () => [...appts].sort((a, b) => toMinutes(a.start) - toMinutes(b.start) || a.vet.localeCompare(b.vet)),
    [appts],
  );

  const visible = sorted.filter(
    (a) =>
      (vetFilter === "all" || a.vet === vetFilter) && (!activeOnly || (a.status !== "done" && a.status !== "cancelled")),
  );

  const waiting = useMemo(
    () =>
      appts
        .filter((a) => a.status === "checked_in")
        .sort(
          (a, b) =>
            Number(Boolean(b.urgent)) - Number(Boolean(a.urgent)) ||
            toMinutes(a.checkedInAt ?? a.start) - toMinutes(b.checkedInAt ?? b.start),
        ),
    [appts],
  );

  const counts = {
    waiting: appts.filter((a) => a.status === "checked_in").length,
    exam: appts.filter((a) => a.status === "in_exam").length,
    toArrive: appts.filter((a) => a.status === "booked").length,
    done: appts.filter((a) => a.status === "done").length,
  };

  function checkIn(a: Appointment) {
    const p = getPatient(a.patient);
    setAppts((list) =>
      list.map((x) => (x.id === a.id ? { ...x, status: "checked_in", checkedInAt: fromMinutes(now) } : x)),
    );
    setNotice({
      id: Date.now(),
      text: `${p.name} is checked in for ${getVet(a.vet).name}.${p.alerts.length ? ` Alert: ${p.alerts.join("; ")}.` : ""}`,
    });
  }

  function handleBook(a: Appointment) {
    setAppts((list) => [...list, a]);
    setFlashId(a.id);
    setNotice({
      id: Date.now(),
      text: `Booked ${getPatient(a.patient).name} with ${getVet(a.vet).name} at ${time12(a.start)}.`,
    });
  }

  const board = vets.map((v) => {
    const mine = appts.filter((a) => a.vet === v.id);
    return {
      vet: v,
      inExam: mine.filter((a) => a.status === "in_exam"),
      waiting: mine.filter((a) => a.status === "checked_in"),
      next: mine
        .filter((a) => a.status === "booked")
        .sort((a, b) => toMinutes(a.start) - toMinutes(b.start))[0],
    };
  });

  return (
    <main id="main" className="mx-auto w-full max-w-[1400px] px-4 py-5 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Today&rsquo;s schedule</h1>
          <p className="mt-1 text-slate-600">
            {formatLongDate(TODAY)} &middot; <span className="tabular-nums">{time12(now)}</span> &middot;{" "}
            <span className="font-medium text-slate-800">{counts.waiting} waiting</span>, {counts.exam} in exam,{" "}
            {counts.toArrive} still to arrive, {counts.done} done
          </p>
        </div>
        <button
          type="button"
          onClick={() => setBookOpen(true)}
          className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-teal-700 px-5 text-base font-semibold text-white shadow-sm hover:bg-teal-800"
        >
          <CalendarPlus aria-hidden className="size-5" />
          Book appointment
        </button>
      </div>

      <section aria-labelledby="board-h" className="mt-5">
        <h2 id="board-h" className="sr-only">
          Vets right now
        </h2>
        <ul className="grid gap-3 md:grid-cols-3">
          {board.map(({ vet, inExam, waiting: w, next }) => (
            <li key={vet.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-baseline justify-between gap-2">
                <p className="font-bold text-slate-900">{vet.name}</p>
                <p className="text-sm text-slate-600">{vet.room}</p>
              </div>
              <dl className="mt-3 space-y-1.5 text-sm">
                <div className="flex gap-2">
                  <dt className="w-16 shrink-0 font-semibold text-indigo-800">In exam</dt>
                  <dd className="text-slate-800">
                    {inExam.length === 0
                      ? "Free"
                      : inExam.map((a) => (
                          <span key={a.id} className="mr-2 inline-flex items-center gap-1">
                            {getPatient(a.patient).name}
                            <AlertMark alerts={getPatient(a.patient).alerts} />
                          </span>
                        ))}
                  </dd>
                </div>
                <div className="flex gap-2">
                  <dt className="w-16 shrink-0 font-semibold text-teal-800">Waiting</dt>
                  <dd className="text-slate-800">
                    {w.length === 0
                      ? "No one"
                      : w.map((a) => (
                          <span key={a.id} className="mr-2 inline-flex items-center gap-1">
                            {getPatient(a.patient).name}
                            <AlertMark alerts={getPatient(a.patient).alerts} />
                          </span>
                        ))}
                  </dd>
                </div>
                <div className="flex gap-2">
                  <dt className="w-16 shrink-0 font-semibold text-slate-700">Next</dt>
                  <dd className="text-slate-800">
                    {next ? (
                      <span className="inline-flex items-center gap-1">
                        {time12(next.start)} {getPatient(next.patient).name}
                        <AlertMark alerts={getPatient(next.patient).alerts} />
                      </span>
                    ) : (
                      "Nothing booked"
                    )}
                  </dd>
                </div>
              </dl>
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_21rem]">
        <section aria-labelledby="sched-h" className="min-w-0 lg:col-start-1 lg:row-start-1">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="sched-h" className="text-xl font-bold text-slate-900">
              Appointments <span className="font-medium text-slate-600">({visible.length})</span>
            </h2>
            <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter appointments">
              {[{ id: "all", label: "All vets" }, ...vets.map((v) => ({ id: v.id, label: v.name.replace("Dr. ", "") }))].map(
                (f) => (
                  <button
                    key={f.id}
                    type="button"
                    aria-pressed={vetFilter === f.id}
                    onClick={() => setVetFilter(f.id)}
                    className={`min-h-11 rounded-full px-4 text-sm font-semibold ring-1 ring-inset ${
                      vetFilter === f.id
                        ? "bg-slate-900 text-white ring-slate-900"
                        : "bg-white text-slate-700 ring-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    {f.label}
                  </button>
                ),
              )}
              <button
                type="button"
                aria-pressed={activeOnly}
                onClick={() => setActiveOnly((v) => !v)}
                className={`min-h-11 rounded-full px-4 text-sm font-semibold ring-1 ring-inset ${
                  activeOnly
                    ? "bg-teal-700 text-white ring-teal-700"
                    : "bg-white text-slate-700 ring-slate-300 hover:bg-slate-50"
                }`}
              >
                Hide done and cancelled
              </button>
            </div>
          </div>

          {visible.length === 0 ? (
            <p className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">
              No appointments match this filter.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-slate-200 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              {visible.map((a) => {
                const p = getPatient(a.patient);
                const owner = getOwner(p.owner);
                const vet = getVet(a.vet);
                const end = toMinutes(a.start) + a.minutes;
                const inactive = a.status === "done" || a.status === "cancelled";
                const late = a.status === "booked" && toMinutes(a.start) + 10 < now;
                return (
                  <li
                    key={a.id}
                    className={`grid grid-cols-[4.75rem_minmax(0,1fr)] gap-x-3 gap-y-3 border-l-4 p-4 transition-colors sm:grid-cols-[5.5rem_minmax(0,1fr)_auto] ${
                      a.urgent && !inactive ? "border-l-amber-500 bg-amber-50" : "border-l-transparent"
                    } ${flashId === a.id ? "bg-teal-50 ring-2 ring-inset ring-teal-500" : ""}`}
                  >
                    <div className="tabular-nums">
                      <p className={`font-bold ${inactive ? "text-slate-600" : "text-slate-900"}`}>{time12(a.start)}</p>
                      <p className="text-xs text-slate-600">
                        to {time12(end)}
                        <br />
                        {a.minutes} min
                      </p>
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <Link
                          href={`/patients/${p.id}`}
                          className="text-lg font-bold text-slate-900 underline-offset-2 hover:text-teal-800 hover:underline"
                        >
                          {p.name}
                        </Link>
                        <span className="text-sm text-slate-600">
                          {p.species}, {p.breed}
                        </span>
                        {a.urgent && (
                          <span className="inline-flex items-center gap-1 rounded-md bg-amber-500 px-2 py-0.5 text-xs font-extrabold uppercase tracking-wide text-slate-950">
                            <Zap aria-hidden className="size-3.5" />
                            Urgent
                          </span>
                        )}
                      </div>
                      <AlertBadges alerts={p.alerts} className="mt-1.5" />
                      <p className={`mt-1.5 font-medium ${a.status === "cancelled" ? "text-slate-600 line-through" : "text-slate-800"}`}>
                        {a.reason}
                      </p>
                      <p className="mt-0.5 text-sm text-slate-600">
                        {owner.name} &middot; {vet.name} &middot; {vet.room}
                      </p>
                    </div>

                    <div className="col-start-2 flex flex-wrap items-center gap-2 sm:col-start-3 sm:flex-col sm:items-end">
                      <StatusPill status={a.status} />
                      {a.status === "checked_in" && a.checkedInAt && (
                        <span className="text-xs text-slate-600">since {time12(a.checkedInAt)}</span>
                      )}
                      {late && <span className="text-xs font-semibold text-amber-800">Running late</span>}
                      {a.status === "booked" && (
                        <button
                          type="button"
                          onClick={() => checkIn(a)}
                          aria-label={`Check in ${p.name}`}
                          className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-teal-700 px-4 text-sm font-semibold text-white hover:bg-teal-800"
                        >
                          <LogIn aria-hidden className="size-4" />
                          Check in
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <aside
          aria-labelledby="wait-h"
          className="order-first lg:order-none lg:col-start-2 lg:row-start-1"
        >
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:sticky lg:top-24">
            <div className="flex items-center justify-between gap-2">
              <h2 id="wait-h" className="flex items-center gap-2 text-xl font-bold text-slate-900">
                <Clock aria-hidden className="size-5 text-teal-700" />
                Waiting room
              </h2>
              <span className="rounded-full bg-teal-700 px-2.5 py-0.5 text-sm font-bold text-white">{waiting.length}</span>
            </div>
            <p className="mt-0.5 text-sm text-slate-600">Urgent first, then by arrival.</p>

            {waiting.length === 0 ? (
              <p className="mt-4 flex items-center gap-2 rounded-xl bg-slate-50 p-4 text-slate-700">
                <CircleCheck aria-hidden className="size-5 text-emerald-700" />
                Nobody is waiting.
              </p>
            ) : (
              <ol className="mt-3 space-y-3">
                {waiting.map((a) => {
                  const p = getPatient(a.patient);
                  const since = toMinutes(a.checkedInAt ?? a.start);
                  const mins = Math.max(0, now - since);
                  return (
                    <li key={a.id} className="rounded-xl border border-slate-200 p-3">
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          href={`/patients/${p.id}`}
                          className="text-lg font-bold text-slate-900 underline-offset-2 hover:text-teal-800 hover:underline"
                        >
                          {p.name}
                        </Link>
                        <span
                          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold tabular-nums ring-1 ring-inset ${waitTone(mins)}`}
                        >
                          {mins} min
                        </span>
                      </div>
                      <AlertBadges alerts={p.alerts} className="mt-1.5" />
                      <p className="mt-1.5 text-sm text-slate-800">{a.reason}</p>
                      <p className="text-sm text-slate-600">
                        {getVet(a.vet).name} &middot; in at {time12(since)}, booked {time12(a.start)}
                      </p>
                      {a.urgent && (
                        <p className="mt-1 text-xs font-bold uppercase text-amber-800">Urgent</p>
                      )}
                    </li>
                  );
                })}
              </ol>
            )}
          </div>
        </aside>
      </div>

      <BookingDialog
        open={bookOpen}
        onClose={() => setBookOpen(false)}
        appointments={appts}
        now={now}
        onBook={handleBook}
      />

      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-4 bottom-4 z-50 sm:left-auto sm:right-6 sm:w-96"
      >
        {notice && (
          <p
            key={notice.id}
            className="pointer-events-auto rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white shadow-xl"
          >
            {notice.text}
          </p>
        )}
      </div>
    </main>
  );
}
