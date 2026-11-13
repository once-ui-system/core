"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CalendarPlus, Hourglass, Phone, Siren } from "lucide-react";
import { AlertChips } from "@/components/AlertList";
import { BookingDialog } from "@/components/BookingDialog";
import { StatusBadge } from "@/components/StatusBadge";
import {
  NOW_START,
  TODAY,
  endTime,
  fmtDate,
  fmtTime,
  fromMinutes,
  getOwner,
  getPatient,
  getVet,
  initialAppointments,
  toMinutes,
  vets,
  type Appointment,
  type Status,
} from "@/lib/data";

interface BookingState {
  patientId?: string;
  reason?: string;
}

const btnPrimary =
  "inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-teal-700 px-4 text-sm font-semibold text-white hover:bg-teal-800";
const btnSecondary =
  "inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-800 hover:bg-slate-50";

export function Schedule() {
  const [appts, setAppts] = useState<Appointment[]>(initialAppointments);
  const [nowMin, setNowMin] = useState(() => toMinutes(NOW_START));
  const [vetFilter, setVetFilter] = useState("all");
  const [booking, setBooking] = useState<BookingState | null>(null);
  const [notice, setNotice] = useState("");

  // The desk clock: starts at the demo time and moves a minute at a time.
  useEffect(() => {
    const id = window.setInterval(() => setNowMin((m) => m + 1), 60_000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (!notice) return;
    const id = window.setTimeout(() => setNotice(""), 6000);
    return () => window.clearTimeout(id);
  }, [notice]);

  const visible = useMemo(
    () =>
      appts
        .filter((a) => vetFilter === "all" || a.vet === vetFilter)
        .sort((a, b) => toMinutes(a.start) - toMinutes(b.start) || a.vet.localeCompare(b.vet)),
    [appts, vetFilter],
  );

  const waiting = useMemo(
    () =>
      appts
        .filter((a) => a.status === "checked_in")
        .sort((a, b) => toMinutes(a.checkedInAt ?? a.start) - toMinutes(b.checkedInAt ?? b.start)),
    [appts],
  );

  const counts = {
    booked: appts.filter((a) => a.status === "booked").length,
    waiting: waiting.length,
    inExam: appts.filter((a) => a.status === "in_exam").length,
    done: appts.filter((a) => a.status === "done").length,
  };

  function setStatus(id: string, status: Status, message: string) {
    setAppts((list) =>
      list.map((a) =>
        a.id === id
          ? { ...a, status, checkedInAt: status === "checked_in" ? fromMinutes(nowMin) : a.checkedInAt }
          : a,
      ),
    );
    setNotice(message);
  }

  function nextAction(a: Appointment) {
    const p = getPatient(a.patient);
    const name = p?.name ?? "Patient";
    switch (a.status) {
      case "booked":
        return (
          <button
            type="button"
            className={btnPrimary}
            aria-label={`Check in ${name}`}
            onClick={() => setStatus(a.id, "checked_in", `${name} is checked in and added to the waiting list.`)}
          >
            Check in
          </button>
        );
      case "checked_in":
        return (
          <button
            type="button"
            className={btnSecondary}
            aria-label={`Send ${name} to exam`}
            onClick={() => setStatus(a.id, "in_exam", `${name} has gone in to see ${getVet(a.vet)?.name}.`)}
          >
            Send to exam
          </button>
        );
      case "in_exam":
        return (
          <button
            type="button"
            className={btnSecondary}
            aria-label={`Mark ${name} done`}
            onClick={() => setStatus(a.id, "done", `${name}'s visit is marked done.`)}
          >
            Mark done
          </button>
        );
      case "done":
        return (
          <button
            type="button"
            className={btnSecondary}
            aria-label={`Book a follow-up for ${name}`}
            onClick={() => setBooking({ patientId: a.patient, reason: `Follow-up: ${a.reason}` })}
          >
            Book follow-up
          </button>
        );
      default:
        return null;
    }
  }

  const dateLabel = fmtDate(TODAY, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-600">{dateLabel}</p>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Today&rsquo;s schedule</h1>
          <p className="mt-1 text-sm text-slate-600">
            Desk time <span className="font-semibold text-slate-900">{fmtTime(fromMinutes(nowMin))}</span> &middot;{" "}
            {vets.length} vets on
          </p>
        </div>
        <button type="button" className={`${btnPrimary} sm:h-12 sm:px-5 sm:text-base`} onClick={() => setBooking({})}>
          <CalendarPlus aria-hidden="true" className="size-5" />
          Book appointment
        </button>
      </div>

      <dl className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Still to arrive", value: counts.booked },
          { label: "Waiting now", value: counts.waiting },
          { label: "In exam", value: counts.inExam },
          { label: "Done today", value: counts.done },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-slate-200 bg-white px-4 py-3">
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-600">{s.label}</dt>
            <dd className="text-2xl font-bold text-slate-900">{s.value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_21rem]">
        <aside aria-labelledby="waiting-title" className="order-first xl:order-last">
          <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 xl:sticky xl:top-24">
            <h2 id="waiting-title" className="flex items-center gap-2 text-lg font-bold text-amber-950">
              <Hourglass aria-hidden="true" className="size-5" />
              Waiting room
              <span className="ml-auto rounded-full bg-amber-900 px-2.5 py-0.5 text-sm font-bold text-white">
                {waiting.length}
              </span>
            </h2>
            {waiting.length === 0 ? (
              <p className="mt-3 text-sm text-amber-950">Nobody is waiting. Check patients in as they arrive.</p>
            ) : (
              <ol className="mt-3 space-y-2">
                {waiting.map((a, i) => {
                  const p = getPatient(a.patient);
                  const v = getVet(a.vet);
                  const waited = Math.max(0, nowMin - toMinutes(a.checkedInAt ?? a.start));
                  return (
                    <li key={a.id} className="rounded-xl bg-white p-3 shadow-sm ring-1 ring-amber-200">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="flex flex-wrap items-center gap-2">
                            <Link
                              href={`/patients/${a.patient}`}
                              className="truncate font-bold text-slate-900 underline-offset-2 hover:underline"
                            >
                              {p?.name}
                            </Link>
                            {i === 0 && (
                              <span className="rounded bg-teal-700 px-1.5 py-0.5 text-xs font-bold uppercase text-white">
                                Next
                              </span>
                            )}
                          </p>
                          <p className="text-sm text-slate-600">
                            For {v?.name}, {v?.room}
                          </p>
                        </div>
                        <p className="shrink-0 text-right">
                          <span
                            className={`block text-lg font-bold leading-none ${waited >= 30 ? "text-red-700" : "text-slate-900"}`}
                          >
                            {waited} min
                          </span>
                          <span className="text-xs text-slate-600">since {fmtTime(a.checkedInAt ?? a.start)}</span>
                        </p>
                      </div>
                      {p && p.alerts.length > 0 && (
                        <div className="mt-2">
                          <AlertChips alerts={p.alerts} />
                        </div>
                      )}
                    </li>
                  );
                })}
              </ol>
            )}
          </div>
        </aside>

        <section aria-labelledby="appts-title" className="min-w-0">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 id="appts-title" className="text-lg font-bold text-slate-900">
              Appointments
              <span className="ml-2 text-sm font-medium text-slate-600">{visible.length} shown</span>
            </h2>
            <div role="group" aria-label="Filter by vet" className="flex flex-wrap gap-2">
              {[{ id: "all", name: "All vets" }, ...vets].map((v) => (
                <button
                  key={v.id}
                  type="button"
                  aria-pressed={vetFilter === v.id}
                  onClick={() => setVetFilter(v.id)}
                  className={`h-11 rounded-full px-4 text-sm font-semibold ring-1 ring-inset ${
                    vetFilter === v.id
                      ? "bg-slate-900 text-white ring-slate-900"
                      : "bg-white text-slate-800 ring-slate-300 hover:bg-slate-50"
                  }`}
                >
                  {v.name}
                </button>
              ))}
            </div>
          </div>

          <ul className="mt-3 space-y-3">
            {visible.map((a) => {
              const p = getPatient(a.patient);
              const o = p ? getOwner(p.owner) : undefined;
              const v = getVet(a.vet);
              const cancelled = a.status === "cancelled";
              const tone = a.urgent && !cancelled
                ? "border-orange-300 border-l-8 border-l-orange-500 bg-orange-50"
                : a.status === "in_exam"
                  ? "border-teal-200 bg-teal-50/60"
                  : "border-slate-200 bg-white";
              return (
                <li
                  key={a.id}
                  className={`rounded-xl border p-4 ${tone} ${cancelled || a.status === "done" ? "opacity-80" : ""}`}
                >
                  <div className="grid gap-3 md:grid-cols-[6.5rem_minmax(0,1fr)_11rem_10.5rem] md:items-center">
                    <div>
                      <p className="text-lg font-bold tabular-nums text-slate-900">{fmtTime(a.start)}</p>
                      <p className="text-xs text-slate-600">
                        {a.minutes} min, to {fmtTime(endTime(a.start, a.minutes))}
                      </p>
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={`/patients/${a.patient}`}
                          className={`text-lg font-bold text-slate-900 underline-offset-2 hover:underline ${
                            cancelled ? "line-through" : ""
                          }`}
                        >
                          {p?.name}
                        </Link>
                        <span className="text-sm text-slate-600">
                          {p?.species}, {p?.breed}
                        </span>
                        {a.urgent && !cancelled && (
                          <span className="inline-flex items-center gap-1 rounded-md bg-orange-600 px-2 py-0.5 text-xs font-extrabold uppercase tracking-wide text-white">
                            <Siren aria-hidden="true" className="size-3.5" />
                            Urgent
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-base text-slate-900">{a.reason}</p>
                      <p className="mt-0.5 flex flex-wrap items-center gap-x-3 text-sm text-slate-600">
                        <span>{o?.name}</span>
                        {o && (
                          <a
                            href={`tel:${o.phone.replace(/\s/g, "")}`}
                            className="inline-flex items-center gap-1 underline-offset-2 hover:underline"
                          >
                            <Phone aria-hidden="true" className="size-3.5" />
                            {o.phone}
                          </a>
                        )}
                      </p>
                      {p && p.alerts.length > 0 && !cancelled && (
                        <div className="mt-2">
                          <AlertChips alerts={p.alerts} />
                        </div>
                      )}
                    </div>

                    <div className="text-sm">
                      <p className="font-semibold text-slate-900">{v?.name}</p>
                      <p className="text-slate-600">{v?.room}</p>
                    </div>

                    <div className="flex items-center justify-between gap-2 md:flex-col md:items-stretch">
                      <StatusBadge status={a.status} />
                      {nextAction(a)}
                    </div>
                  </div>
                </li>
              );
            })}
            {visible.length === 0 && (
              <li className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-slate-600">
                No appointments for this vet today.
              </li>
            )}
          </ul>
        </section>
      </div>

      <div
        role="status"
        aria-live="polite"
        className={
          notice
            ? "fixed inset-x-4 bottom-4 z-40 mx-auto max-w-md rounded-xl bg-slate-900 px-4 py-3 text-center text-sm font-medium text-white shadow-xl"
            : "sr-only"
        }
      >
        {notice}
      </div>

      {booking && (
        <BookingDialog
          appts={appts}
          nowMin={nowMin}
          initialPatientId={booking.patientId}
          initialReason={booking.reason}
          onClose={() => setBooking(null)}
          onBook={(appt) => {
            setAppts((list) => [...list, appt]);
            setBooking(null);
            const p = getPatient(appt.patient);
            setNotice(
              `Booked ${p?.name} with ${getVet(appt.vet)?.name} at ${fmtTime(appt.start)}. It is on the schedule.`,
            );
          }}
        />
      )}
    </div>
  );
}
