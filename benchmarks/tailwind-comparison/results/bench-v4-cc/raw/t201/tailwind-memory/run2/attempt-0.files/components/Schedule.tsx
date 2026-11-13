"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { CalendarPlus, CircleCheck, Clock, EyeOff, Siren, Stethoscope, UserCheck, X } from "lucide-react";
import { minutesWaiting, useClinic } from "@/lib/clinic-context";
import {
  TODAY,
  firstFreeSlot,
  fmtClock,
  fmtLongDate,
  fromMin,
  getOwner,
  getPatient,
  getVet,
  patients,
  slotProblem,
  toMin,
  vets,
  DAY_CLOSE,
  DAY_OPEN,
  telHref,
  type Appointment,
  type Status,
} from "@/lib/data";
import { cx } from "@/lib/cx";
import { AlertBadges, AlertBanner } from "@/components/AlertBadges";
import { StatusBadge } from "@/components/StatusBadge";

const btnPrimary =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 text-sm font-semibold text-white shadow-sm hover:bg-teal-800 active:bg-teal-900 disabled:bg-stone-300 disabled:text-stone-600";
const btnSecondary =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-stone-300 bg-white px-4 text-sm font-semibold text-stone-900 hover:bg-stone-100 active:bg-stone-200";

export function Schedule() {
  const { appointments, now, checkIn, setStatus } = useClinic();
  const [vetFilter, setVetFilter] = useState<string>("all");
  const [hideFinished, setHideFinished] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [notice, setNotice] = useState<string>("");
  const [highlight, setHighlight] = useState<string | null>(null);
  const noticeTimer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(noticeTimer.current), []);

  function say(message: string) {
    setNotice(message);
    window.clearTimeout(noticeTimer.current);
    noticeTimer.current = window.setTimeout(() => setNotice(""), 8000);
  }

  const counts = useMemo(() => {
    const c: Record<Status, number> = { booked: 0, checked_in: 0, in_exam: 0, done: 0, cancelled: 0 };
    for (const a of appointments) c[a.status] += 1;
    return c;
  }, [appointments]);

  const sorted = useMemo(
    () =>
      [...appointments].sort(
        (a, b) => toMin(a.start) - toMin(b.start) || a.vet.localeCompare(b.vet),
      ),
    [appointments],
  );
  const visible = sorted.filter(
    (a) =>
      (vetFilter === "all" || a.vet === vetFilter) &&
      !(hideFinished && (a.status === "done" || a.status === "cancelled")),
  );

  const waiting = useMemo(
    () =>
      appointments
        .filter((a) => a.status === "checked_in")
        .sort((a, b) => Number(!!b.urgent) - Number(!!a.urgent) || toMin(a.checkedInAt ?? a.start) - toMin(b.checkedInAt ?? b.start)),
    [appointments],
  );
  const inExam = appointments.filter((a) => a.status === "in_exam");

  function act(a: Appointment, next: Status) {
    const name = getPatient(a.patient)?.name ?? "Patient";
    if (next === "checked_in") {
      checkIn(a.id);
      say(`${name} is checked in. ${waiting.length + 1} waiting.`);
    } else {
      setStatus(a.id, next);
      if (next === "in_exam") say(`${name} is in ${getVet(a.vet).room} with ${getVet(a.vet).name}.`);
      if (next === "done") say(`${name}'s visit is marked done.`);
    }
  }

  return (
    <main id="main" className="mx-auto max-w-7xl px-4 pb-16 pt-5 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-stone-600">{fmtLongDate(TODAY)}</p>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Today&rsquo;s schedule</h1>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-stone-600">
            <Clock className="size-4" aria-hidden /> Front desk clock <span className="font-semibold tabular-nums text-stone-900">{fmtClock(now)}</span>
          </p>
        </div>
        <button type="button" className={cx(btnPrimary, "min-h-12 px-5 text-base")} onClick={() => setBookingOpen(true)}>
          <CalendarPlus className="size-5" aria-hidden />
          Book appointment
        </button>
      </div>

      <dl className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        <Stat label="Booked" value={counts.booked} />
        <Stat label="Waiting" value={counts.checked_in} tone="sky" />
        <Stat label="In exam" value={counts.in_exam} tone="teal" />
        <Stat label="Done" value={counts.done} />
      </dl>

      <div role="status" aria-live="polite" className="mt-4 empty:hidden">
        {notice && (
          <p className="flex items-start gap-2 rounded-xl border border-teal-300 bg-teal-50 px-4 py-3 text-sm font-medium text-teal-950">
            <CircleCheck className="mt-0.5 size-5 shrink-0 text-teal-700" aria-hidden />
            <span className="flex-1">{notice}</span>
            <button type="button" aria-label="Dismiss message" className="-m-2 grid size-10 place-items-center rounded-lg hover:bg-teal-100" onClick={() => setNotice("")}>
              <X className="size-4" aria-hidden />
            </button>
          </p>
        )}
      </div>

      <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
        <section aria-labelledby="all-appts" className="min-w-0">
          <h2 id="all-appts" className="sr-only">
            All appointments
          </h2>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div role="group" aria-label="Filter by vet" className="flex flex-wrap gap-1.5">
              <FilterChip pressed={vetFilter === "all"} onClick={() => setVetFilter("all")}>
                All vets
              </FilterChip>
              {vets.map((v) => (
                <FilterChip key={v.id} pressed={vetFilter === v.id} onClick={() => setVetFilter(v.id)}>
                  {v.name.replace("Dr. ", "Dr. ").split(" ").slice(0, 2).join(" ")}
                  <span className="hidden text-stone-500 sm:inline"> &middot; {v.room}</span>
                </FilterChip>
              ))}
            </div>
            <button
              type="button"
              aria-pressed={hideFinished}
              onClick={() => setHideFinished((v) => !v)}
              className={cx(
                "inline-flex min-h-11 items-center gap-2 rounded-xl border px-3.5 text-sm font-medium",
                hideFinished ? "border-teal-700 bg-teal-700 text-white" : "border-stone-300 bg-white text-stone-800 hover:bg-stone-100",
              )}
            >
              <EyeOff className="size-4" aria-hidden />
              Hide done and cancelled
            </button>
          </div>

          {visible.length === 0 ? (
            <p className="rounded-xl border border-dashed border-stone-300 bg-white p-8 text-center text-stone-600">Nothing to show with these filters.</p>
          ) : (
            <ol className="space-y-2.5">
              {visible.map((a) => (
                <AppointmentRow key={a.id} a={a} now={now} highlighted={highlight === a.id} onAct={act} />
              ))}
            </ol>
          )}
        </section>

        <aside aria-label="Waiting room and exams" className="space-y-5 max-lg:order-first lg:sticky lg:top-24">
          <section aria-labelledby="waiting-h" className="rounded-2xl border border-stone-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-stone-200 px-4 py-3">
              <h2 id="waiting-h" className="text-lg font-bold">
                Waiting room
              </h2>
              <span className="rounded-full bg-sky-100 px-2.5 py-0.5 text-sm font-bold text-sky-900">{waiting.length}</span>
            </div>
            {waiting.length === 0 ? (
              <p className="px-4 py-6 text-sm text-stone-600">Nobody is waiting. Check in a booked patient from the schedule.</p>
            ) : (
              <ol className="divide-y divide-stone-200">
                {waiting.map((a, i) => {
                  const p = getPatient(a.patient);
                  const vet = getVet(a.vet);
                  const mins = minutesWaiting(a, now);
                  return (
                    <li key={a.id} className="px-4 py-3">
                      <div className="flex items-start gap-3">
                        <span
                          className={cx(
                            "mt-0.5 grid size-7 shrink-0 place-items-center rounded-full text-sm font-bold",
                            i === 0 ? "bg-teal-700 text-white" : "bg-stone-200 text-stone-800",
                          )}
                          aria-hidden
                        >
                          {i + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="flex flex-wrap items-center gap-x-2 font-semibold">
                            <Link href={`/patients/${a.patient}`} className="underline-offset-2 hover:underline">
                              {p?.name}
                            </Link>
                            {i === 0 && <span className="rounded bg-teal-100 px-1.5 py-0.5 text-xs font-bold uppercase tracking-wide text-teal-900">Next</span>}
                            {a.urgent && <UrgentTag />}
                          </p>
                          <p className="text-sm text-stone-600">
                            {getOwner(p?.owner ?? "").name} &middot; {a.reason}
                          </p>
                          <p className="text-sm text-stone-600">
                            {vet.name} &middot; {vet.room} &middot; booked {fmtClock(a.start)}
                          </p>
                          <AlertBadges alerts={p?.alerts ?? []} className="mt-1.5" />
                        </div>
                        <div className="text-right">
                          <p className={cx("text-xl font-bold tabular-nums leading-none", mins >= 20 ? "text-orange-700" : "text-stone-900")}>{mins}</p>
                          <p className="text-xs text-stone-600">min waiting</p>
                        </div>
                      </div>
                      <div className="mt-2 flex justify-end">
                        <button type="button" className={btnSecondary} onClick={() => act(a, "in_exam")} aria-label={`Start exam for ${p?.name} in ${vet.room}`}>
                          <Stethoscope className="size-4" aria-hidden />
                          Start exam
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}
          </section>

          <section aria-labelledby="exam-h" className="rounded-2xl border border-stone-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-stone-200 px-4 py-3">
              <h2 id="exam-h" className="text-lg font-bold">
                In exam now
              </h2>
              <span className="rounded-full bg-teal-100 px-2.5 py-0.5 text-sm font-bold text-teal-900">{inExam.length}</span>
            </div>
            {inExam.length === 0 ? (
              <p className="px-4 py-5 text-sm text-stone-600">All rooms are free.</p>
            ) : (
              <ul className="divide-y divide-stone-200">
                {inExam.map((a) => {
                  const p = getPatient(a.patient);
                  const vet = getVet(a.vet);
                  return (
                    <li key={a.id} className="px-4 py-3">
                      <p className="font-semibold">
                        <Link href={`/patients/${a.patient}`} className="underline-offset-2 hover:underline">
                          {p?.name}
                        </Link>{" "}
                        <span className="font-normal text-stone-600">&middot; {vet.room}</span>
                      </p>
                      <p className="text-sm text-stone-600">
                        {vet.name} &middot; {a.reason}
                      </p>
                      <AlertBadges alerts={p?.alerts ?? []} className="mt-1.5" />
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </aside>
      </div>

      <BookingDialog
        open={bookingOpen}
        onClose={() => setBookingOpen(false)}
        onBooked={(a) => {
          setBookingOpen(false);
          setVetFilter("all");
          setHideFinished(false);
          setHighlight(a.id);
          window.setTimeout(() => setHighlight(null), 3500);
          say(`Booked ${getPatient(a.patient)?.name} with ${getVet(a.vet).name} at ${fmtClock(a.start)}.`);
          window.setTimeout(() => document.getElementById(`appt-${a.id}`)?.scrollIntoView({ block: "center", behavior: "smooth" }), 50);
        }}
      />
    </main>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone?: "sky" | "teal" }) {
  return (
    <div
      className={cx(
        "rounded-xl border px-4 py-3",
        tone === "sky" && "border-sky-200 bg-sky-50",
        tone === "teal" && "border-teal-200 bg-teal-50",
        !tone && "border-stone-200 bg-white",
      )}
    >
      <dt className="text-sm font-medium text-stone-700">{label}</dt>
      <dd className="text-3xl font-bold tabular-nums leading-tight">{value}</dd>
    </div>
  );
}

function FilterChip({ pressed, onClick, children }: { pressed: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={cx(
        "min-h-11 rounded-xl border px-3.5 text-sm font-semibold",
        pressed ? "border-stone-900 bg-stone-900 text-white" : "border-stone-300 bg-white text-stone-800 hover:bg-stone-100",
      )}
    >
      {children}
    </button>
  );
}

function UrgentTag() {
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-orange-500 px-2 py-0.5 text-xs font-extrabold uppercase tracking-wide text-stone-950">
      <Siren className="size-3.5" aria-hidden />
      Urgent
    </span>
  );
}

function AppointmentRow({
  a,
  now,
  highlighted,
  onAct,
}: {
  a: Appointment;
  now: number;
  highlighted: boolean;
  onAct: (a: Appointment, next: Status) => void;
}) {
  const p = getPatient(a.patient);
  const owner = getOwner(p?.owner ?? "");
  const vet = getVet(a.vet);
  const muted = a.status === "done" || a.status === "cancelled";
  const end = toMin(a.start) + a.minutes;
  const name = p?.name ?? "patient";

  return (
    <li
      id={`appt-${a.id}`}
      className={cx(
        "scroll-mt-28 rounded-xl border p-3.5 sm:p-4",
        a.urgent && !muted ? "border-orange-400 border-l-[6px] border-l-orange-500 bg-orange-50" : "border-stone-200 bg-white",
        a.status === "in_exam" && "border-teal-300 bg-teal-50/60",
        muted && "bg-stone-100/70 text-stone-600",
        highlighted && "just-booked ring-2 ring-teal-600",
      )}
    >
      <div className="grid gap-3 sm:grid-cols-[6.5rem_minmax(0,1fr)_auto] sm:items-center">
        <div className="flex items-baseline gap-2 sm:block">
          <p className="text-lg font-bold tabular-nums">{fmtClock(a.start)}</p>
          <p className="text-xs text-stone-600">
            {a.minutes} min<span className="hidden sm:inline">, to {fmtClock(end)}</span>
          </p>
        </div>

        <div className="min-w-0">
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <Link
              href={`/patients/${a.patient}`}
              className={cx("text-lg font-bold underline-offset-2 hover:underline", a.status === "cancelled" && "line-through")}
            >
              {name}
            </Link>
            <span className="text-sm text-stone-600">
              {p?.species}, {p?.breed}
            </span>
            {a.urgent && !muted && <UrgentTag />}
          </p>
          <p className={cx("mt-0.5 text-base font-medium", muted ? "text-stone-600" : "text-stone-900")}>{a.reason}</p>
          <p className="mt-0.5 text-sm text-stone-600">
            Owner {owner.name} &middot;{" "}
            <a href={telHref(owner.phone)} className="underline underline-offset-2">
              {owner.phone}
            </a>
          </p>
          <p className="text-sm text-stone-600">
            {vet.name} &middot; {vet.room}
          </p>
          <AlertBadges alerts={p?.alerts ?? []} className="mt-2" />
        </div>

        <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end sm:justify-center">
          <div className="text-right">
            <StatusBadge status={a.status} />
            {a.status === "checked_in" && (
              <p className="mt-1 text-xs font-medium text-stone-700">
                Waiting {minutesWaiting(a, now)} min
              </p>
            )}
          </div>
          {a.status === "booked" && (
            <button type="button" className={btnPrimary} onClick={() => onAct(a, "checked_in")} aria-label={`Check in ${name}, ${fmtClock(a.start)} with ${vet.name}`}>
              <UserCheck className="size-4" aria-hidden />
              Check in
            </button>
          )}
          {a.status === "checked_in" && (
            <button type="button" className={btnSecondary} onClick={() => onAct(a, "in_exam")} aria-label={`Start exam for ${name}`}>
              <Stethoscope className="size-4" aria-hidden />
              Start exam
            </button>
          )}
          {a.status === "in_exam" && (
            <button type="button" className={btnSecondary} onClick={() => onAct(a, "done")} aria-label={`Mark ${name} done`}>
              <CircleCheck className="size-4" aria-hidden />
              Mark done
            </button>
          )}
        </div>
      </div>
    </li>
  );
}

/* ------------------------------ booking ------------------------------ */

const DURATIONS = [15, 20, 30, 45, 60];
const fieldClass =
  "mt-1.5 block min-h-12 w-full rounded-xl border border-stone-300 bg-white px-3 text-base focus:border-teal-600";

function BookingDialog({ open, onClose, onBooked }: { open: boolean; onClose: () => void; onBooked: (a: Appointment) => void }) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby="book-h"
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      className="m-auto max-h-[calc(100dvh-1.5rem)] w-[min(34rem,calc(100vw-1.5rem))] overflow-y-auto rounded-2xl bg-white p-0 text-stone-900 shadow-2xl backdrop:bg-stone-900/60"
    >
      {open && <BookingForm onClose={onClose} onBooked={onBooked} />}
    </dialog>
  );
}

function BookingForm({ onClose, onBooked }: { onClose: () => void; onBooked: (a: Appointment) => void }) {
  const { appointments, now, book } = useClinic();
  const [patientId, setPatientId] = useState("");
  const [vetId, setVetId] = useState(vets[0].id);
  const [minutes, setMinutes] = useState(20);
  const [start, setStart] = useState<number>(() => firstFreeSlot(appointments, vets[0].id, 20, now) ?? DAY_OPEN);
  const [reason, setReason] = useState("");
  const [urgent, setUrgent] = useState(false);
  const [moved, setMoved] = useState(false);
  const [error, setError] = useState("");

  const patient = getPatient(patientId);
  const slots: number[] = [];
  for (let m = DAY_OPEN; m < DAY_CLOSE; m += 15) slots.push(m);
  const problem = slotProblem(appointments, vetId, start, minutes, now);
  const nextFree = firstFreeSlot(appointments, vetId, minutes, now);

  function keepValid(nextVet: string, nextMinutes: number) {
    if (slotProblem(appointments, nextVet, start, nextMinutes, now)) {
      const free = firstFreeSlot(appointments, nextVet, nextMinutes, now);
      if (free !== null) {
        setStart(free);
        setMoved(true);
        return;
      }
    }
    setMoved(false);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const clash = slotProblem(appointments, vetId, start, minutes, now);
    if (!patientId) return setError("Choose a patient.");
    if (clash) {
      return setError(
        clash.kind === "taken" && clash.with
          ? `${getVet(vetId).name} already has ${getPatient(clash.with.patient)?.name} at ${fmtClock(clash.with.start)}. Pick another time.`
          : clash.kind === "passed"
            ? "That time has already passed."
            : "That visit would run past closing time.",
      );
    }
    const created = book({ patient: patientId, vet: vetId, start: fromMin(start), minutes, reason: reason.trim(), urgent });
    onBooked(created);
  }

  const optionLabel = (m: number) => {
    const pr = slotProblem(appointments, vetId, m, minutes, now);
    const suffix = !pr ? "" : pr.kind === "taken" ? " (taken)" : pr.kind === "passed" ? " (passed)" : " (after closing)";
    return `${fmtClock(m)}${suffix}`;
  };

  return (
    <form onSubmit={submit} className="p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 id="book-h" className="text-xl font-bold">
            Book an appointment
          </h2>
          <p className="mt-0.5 text-sm text-stone-600">Today, {fmtLongDate(TODAY)}</p>
        </div>
        <button type="button" onClick={onClose} aria-label="Close" className="-m-2 grid size-11 place-items-center rounded-xl hover:bg-stone-100">
          <X className="size-5" aria-hidden />
        </button>
      </div>

      <div className="mt-5 space-y-4">
        <div>
          <label htmlFor="b-patient" className="text-sm font-semibold">
            Patient
          </label>
          <select
            id="b-patient"
            required
            value={patientId}
            onChange={(e) => {
              setPatientId(e.target.value);
              setError("");
            }}
            className={fieldClass}
          >
            <option value="">Choose a patient</option>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.species}), {getOwner(p.owner).name}
                {p.alerts.length ? "  ⚠ alert" : ""}
              </option>
            ))}
          </select>
        </div>

        {patient && <AlertBanner alerts={patient.alerts} name={patient.name} />}

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="b-vet" className="text-sm font-semibold">
              Vet
            </label>
            <select
              id="b-vet"
              value={vetId}
              onChange={(e) => {
                setVetId(e.target.value);
                keepValid(e.target.value, minutes);
                setError("");
              }}
              className={fieldClass}
            >
              {vets.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} &middot; {v.room}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="b-time" className="text-sm font-semibold">
              Start time
            </label>
            <select
              id="b-time"
              value={start}
              onChange={(e) => {
                setStart(Number(e.target.value));
                setMoved(false);
                setError("");
              }}
              className={fieldClass}
              aria-describedby="b-time-help"
            >
              {slots.map((m) => (
                <option key={m} value={m} disabled={!!slotProblem(appointments, vetId, m, minutes, now)}>
                  {optionLabel(m)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="b-len" className="text-sm font-semibold">
              Length
            </label>
            <select
              id="b-len"
              value={minutes}
              onChange={(e) => {
                const n = Number(e.target.value);
                setMinutes(n);
                keepValid(vetId, n);
                setError("");
              }}
              className={fieldClass}
            >
              {DURATIONS.map((d) => (
                <option key={d} value={d}>
                  {d} minutes
                </option>
              ))}
            </select>
          </div>
        </div>

        <p id="b-time-help" aria-live="polite" className="text-sm text-stone-600">
          {moved
            ? `Moved to ${fmtClock(start)}, the next free time for ${getVet(vetId).name}.`
            : problem
              ? "This time is not available."
              : `${getVet(vetId).name} is free ${fmtClock(start)} to ${fmtClock(start + minutes)}. Times already taken are greyed out.`}
          {problem && nextFree !== null && (
            <>
              {" "}
              <button type="button" className="font-semibold text-teal-800 underline" onClick={() => setStart(nextFree)}>
                Use {fmtClock(nextFree)}
              </button>
            </>
          )}
        </p>

        <div>
          <label htmlFor="b-reason" className="text-sm font-semibold">
            Reason for visit
          </label>
          <input
            id="b-reason"
            required
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="For example: Vaccine booster"
            className={fieldClass}
            autoComplete="off"
          />
        </div>

        <label className="flex min-h-11 items-center gap-3 text-base font-medium">
          <input type="checkbox" checked={urgent} onChange={(e) => setUrgent(e.target.checked)} className="size-5 accent-orange-600" />
          Urgent visit
        </label>

        <div role="alert" className="empty:hidden">
          {error && <p className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm font-medium text-red-900">{error}</p>}
        </div>
      </div>

      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button type="button" onClick={onClose} className={btnSecondary}>
          Cancel
        </button>
        <button type="submit" disabled={!!problem} className={cx(btnPrimary, "min-h-12 px-6")}>
          <CalendarPlus className="size-4" aria-hidden />
          Book appointment
        </button>
      </div>
    </form>
  );
}
