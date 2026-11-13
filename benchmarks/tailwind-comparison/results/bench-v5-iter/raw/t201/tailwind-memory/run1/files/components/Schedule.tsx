"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  CalendarPlus,
  CircleCheck,
  Clock,
  DoorOpen,
  LogIn,
  Siren,
  Stethoscope,
  UserRound,
  X,
} from "lucide-react";
import {
  APPOINTMENTS,
  DAY_END,
  DAY_START,
  NOW_MINUTES,
  PATIENTS,
  STATUS_LABEL,
  VETS,
  findClash,
  fmtTime,
  getOwner,
  getPatient,
  getVet,
  toHHMM,
  toMinutes,
  type Appointment,
  type Status,
  type VetId,
} from "@/lib/data";
import { AlertChips } from "./AlertChips";

const STATUS_STYLE: Record<Status, string> = {
  booked: "bg-slate-100 text-slate-800 ring-slate-300",
  checked_in: "bg-amber-100 text-amber-900 ring-amber-400",
  in_exam: "bg-sky-100 text-sky-900 ring-sky-400",
  done: "bg-emerald-50 text-emerald-900 ring-emerald-300",
  cancelled: "bg-slate-100 text-slate-600 ring-slate-300 line-through",
};

const DURATIONS = [15, 20, 30, 45, 60];

function sortAppts(list: Appointment[]) {
  return [...list].sort(
    (a, b) => toMinutes(a.start) - toMinutes(b.start) || a.vet.localeCompare(b.vet),
  );
}

export function Schedule() {
  const [appts, setAppts] = useState<Appointment[]>(APPOINTMENTS);
  const [now, setNow] = useState(NOW_MINUTES);
  const [vetFilter, setVetFilter] = useState<VetId | "all">("all");
  const [bookOpen, setBookOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [fresh, setFresh] = useState<string | null>(null);

  useEffect(() => {
    const t = setInterval(() => setNow((n) => n + 1), 60000);
    return () => clearInterval(t);
  }, []);

  function setStatus(id: string, status: Status) {
    const a = appts.find((x) => x.id === id);
    if (!a) return;
    setAppts((list) =>
      list.map((x) =>
        x.id === id ? { ...x, status, checkedInAt: status === "checked_in" ? now : x.checkedInAt } : x,
      ),
    );
    const p = getPatient(a.patient);
    const msg: Record<string, string> = {
      checked_in: `${p?.name} is checked in and waiting.`,
      in_exam: `${p?.name} has gone in to see ${getVet(a.vet)?.name}.`,
      done: `${p?.name} is done.`,
    };
    setNotice(msg[status] ?? "");
  }

  const sorted = useMemo(() => sortAppts(appts), [appts]);
  const visible = sorted.filter((a) => vetFilter === "all" || a.vet === vetFilter);
  const waiting = appts
    .filter((a) => a.status === "checked_in")
    .sort((a, b) => (a.checkedInAt ?? 0) - (b.checkedInAt ?? 0));
  const counts = {
    waiting: waiting.length,
    inExam: appts.filter((a) => a.status === "in_exam").length,
    upcoming: appts.filter((a) => a.status === "booked").length,
    done: appts.filter((a) => a.status === "done").length,
  };

  return (
    <main id="main" className="mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-600">Thursday, 12 November 2026</p>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Today&rsquo;s schedule</h1>
        </div>
        <div className="flex items-center gap-3">
          <p className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm font-semibold text-slate-800 ring-1 ring-slate-200">
            <Clock aria-hidden className="size-4 text-slate-600" />
            <span className="sr-only">Clock: </span>
            <span className="tabular-nums">{fmtTime(now)}</span>
          </p>
          <button
            type="button"
            onClick={() => setBookOpen(true)}
            className="inline-flex h-12 items-center gap-2 rounded-xl bg-brand-600 px-5 text-base font-semibold text-white shadow-sm hover:bg-brand-700 active:bg-brand-800"
          >
            <CalendarPlus aria-hidden className="size-5" />
            Book appointment
          </button>
        </div>
      </div>

      <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Waiting" value={counts.waiting} tone="amber" />
        <Stat label="In exam" value={counts.inExam} tone="sky" />
        <Stat label="Still to come" value={counts.upcoming} tone="slate" />
        <Stat label="Done" value={counts.done} tone="emerald" />
      </dl>

      <p role="status" aria-live="polite" className={notice ? "mt-4 rounded-lg bg-brand-50 px-4 py-2.5 text-sm font-medium text-brand-800 ring-1 ring-brand-100" : "sr-only"}>
        {notice}
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
        <aside aria-labelledby="waiting-h" className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 lg:sticky lg:top-28 lg:order-2">
          <div className="flex items-center justify-between">
            <h2 id="waiting-h" className="flex items-center gap-2 text-lg font-bold text-slate-900">
              <DoorOpen aria-hidden className="size-5 text-amber-700" />
              Waiting room
            </h2>
            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-sm font-bold text-amber-900">{waiting.length}</span>
          </div>
          {waiting.length === 0 ? (
            <p className="mt-3 rounded-lg bg-slate-50 p-4 text-sm text-slate-600">Nobody is waiting. Check patients in as they arrive.</p>
          ) : (
            <ol className="mt-3 space-y-2">
              {waiting.map((a, i) => {
                const p = getPatient(a.patient);
                const mins = Math.max(0, now - (a.checkedInAt ?? now));
                const long = mins >= 30;
                return (
                  <li key={a.id} className="rounded-xl border border-slate-200 p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="flex items-center gap-2 font-semibold text-slate-900">
                          {i === 0 && <span className="rounded bg-brand-600 px-1.5 py-0.5 text-xs font-bold text-white">Next</span>}
                          <Link href={`/patients/${a.patient}`} className="truncate underline-offset-2 hover:underline">
                            {p?.name}
                          </Link>
                        </p>
                        <p className="text-sm text-slate-600">
                          {getOwner(p?.owner ?? "")?.name} &middot; {getVet(a.vet)?.name}
                        </p>
                      </div>
                      <p className={`shrink-0 rounded-md px-2 py-1 text-sm font-bold tabular-nums ${long ? "bg-red-100 text-red-900" : "bg-slate-100 text-slate-800"}`}>
                        <span className="sr-only">Waiting </span>
                        {mins} min
                      </p>
                    </div>
                    {p && p.alerts.length > 0 && (
                      <div className="mt-2">
                        <AlertChips alerts={p.alerts} />
                      </div>
                    )}
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <p className="text-xs text-slate-600">
                        Booked {fmtTime(a.start)} &middot; in at {fmtTime(a.checkedInAt ?? now)}
                      </p>
                      <button
                        type="button"
                        onClick={() => setStatus(a.id, "in_exam")}
                        className="inline-flex h-10 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg bg-slate-900 px-3 text-sm font-semibold text-white hover:bg-slate-700"
                      >
                        <Stethoscope aria-hidden className="size-4" />
                        Start exam
                        <span className="sr-only"> for {p?.name}</span>
                      </button>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </aside>

        <section aria-labelledby="sched-h" className="lg:order-1">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="sched-h" className="text-lg font-bold text-slate-900">
              All appointments <span className="font-medium text-slate-600">({visible.length})</span>
            </h2>
            <div role="group" aria-label="Filter by vet" className="flex flex-wrap gap-2">
              <FilterBtn active={vetFilter === "all"} onClick={() => setVetFilter("all")}>
                All vets
              </FilterBtn>
              {VETS.map((v) => (
                <FilterBtn key={v.id} active={vetFilter === v.id} onClick={() => setVetFilter(v.id)}>
                  {v.name}
                </FilterBtn>
              ))}
            </div>
          </div>
          <ul className="mt-3 space-y-3">
            {visible.map((a) => (
              <Row key={a.id} a={a} fresh={fresh === a.id} onStatus={setStatus} />
            ))}
          </ul>
        </section>
      </div>

      <BookDialog
        open={bookOpen}
        now={now}
        appts={appts}
        onClose={() => setBookOpen(false)}
        onBook={(a) => {
          setAppts((l) => [...l, a]);
          setFresh(a.id);
          setNotice(
            `Booked ${getPatient(a.patient)?.name} with ${getVet(a.vet)?.name} at ${fmtTime(a.start)}.`,
          );
          setBookOpen(false);
        }}
      />
    </main>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone: "amber" | "sky" | "slate" | "emerald" }) {
  const bar = { amber: "bg-amber-500", sky: "bg-sky-500", slate: "bg-slate-400", emerald: "bg-emerald-500" }[tone];
  return (
    <div className="relative overflow-hidden rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-slate-200">
      <span aria-hidden className={`absolute inset-y-0 left-0 w-1.5 ${bar}`} />
      <dt className="text-sm font-medium text-slate-600">{label}</dt>
      <dd className="text-3xl font-bold tabular-nums text-slate-900">{value}</dd>
    </div>
  );
}

function FilterBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`h-11 rounded-full px-4 text-sm font-semibold ring-1 ${
        active ? "bg-slate-900 text-white ring-slate-900" : "bg-white text-slate-800 ring-slate-300 hover:bg-slate-50"
      }`}
    >
      {children}
    </button>
  );
}

function Row({ a, fresh, onStatus }: { a: Appointment; fresh: boolean; onStatus: (id: string, s: Status) => void }) {
  const p = getPatient(a.patient);
  const owner = getOwner(p?.owner ?? "");
  const vet = getVet(a.vet);
  const end = toMinutes(a.start) + a.minutes;
  const muted = a.status === "done" || a.status === "cancelled";
  const action =
    a.status === "booked"
      ? { label: "Check in", next: "checked_in" as Status, icon: LogIn, cls: "bg-brand-600 text-white hover:bg-brand-700" }
      : a.status === "checked_in"
        ? { label: "Start exam", next: "in_exam" as Status, icon: Stethoscope, cls: "bg-slate-900 text-white hover:bg-slate-700" }
        : a.status === "in_exam"
          ? { label: "Mark done", next: "done" as Status, icon: CircleCheck, cls: "bg-white text-slate-900 ring-1 ring-slate-400 hover:bg-slate-50" }
          : null;

  return (
    <li
      className={`relative rounded-2xl p-4 shadow-sm ring-1 ${
        a.urgent && a.status !== "done" && a.status !== "cancelled"
          ? "bg-orange-50 ring-2 ring-orange-500"
          : muted
            ? "bg-slate-50 ring-slate-200"
            : "bg-white ring-slate-200"
      } ${fresh ? "outline-3 outline-offset-2 outline-brand-600" : ""}`}
    >
      <div className="grid gap-3 md:grid-cols-[9rem_minmax(0,1fr)_auto] md:items-center md:gap-5">
        <div className="flex items-baseline gap-2 md:block">
          <p className="text-xl font-bold tabular-nums text-slate-900">{fmtTime(a.start)}</p>
          <p className="whitespace-nowrap text-sm text-slate-600">
            {a.minutes} min <span className="hidden md:inline">&middot; to {fmtTime(end)}</span>
          </p>
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <Link href={`/patients/${a.patient}`} className="text-lg font-bold text-slate-900 underline-offset-2 hover:underline">
              {p?.name}
            </Link>
            <span className="text-sm text-slate-600">
              {p?.species}, {p?.breed}
            </span>
            {a.urgent && (
              <span className="inline-flex items-center gap-1 rounded-md bg-orange-700 px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-white">
                <Siren aria-hidden className="size-3.5" />
                Urgent
              </span>
            )}
          </div>
          <p className="mt-0.5 text-base text-slate-800">{a.reason}</p>
          <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-sm text-slate-600">
            <span className="inline-flex items-center gap-1">
              <UserRound aria-hidden className="size-4" />
              {owner?.name}
            </span>
            <span>
              {vet?.name} &middot; {vet?.room}
            </span>
          </p>
          {p && p.alerts.length > 0 && !muted && (
            <div className="mt-2">
              <AlertChips alerts={p.alerts} />
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 md:flex-col md:items-end">
          <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ring-1 ${STATUS_STYLE[a.status]}`}>
            {STATUS_LABEL[a.status]}
          </span>
          {action && (
            <button
              type="button"
              onClick={() => onStatus(a.id, action.next)}
              className={`inline-flex h-12 min-w-36 items-center justify-center gap-2 rounded-xl px-4 text-base font-semibold ${action.cls}`}
            >
              <action.icon aria-hidden className="size-5" />
              {action.label}
              <span className="sr-only"> {p?.name}</span>
            </button>
          )}
        </div>
      </div>
    </li>
  );
}

function BookDialog({
  open,
  now,
  appts,
  onClose,
  onBook,
}: {
  open: boolean;
  now: number;
  appts: Appointment[];
  onClose: () => void;
  onBook: (a: Appointment) => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [patientId, setPatientId] = useState(PATIENTS[0].id);
  const [vet, setVet] = useState<VetId>("v-1");
  const [minutes, setMinutes] = useState(20);
  const [time, setTime] = useState("");
  const [reason, setReason] = useState("");
  const [urgent, setUrgent] = useState(false);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      setTime("");
      d.showModal();
    }
    if (!open && d.open) d.close();
  }, [open]);

  const slots = useMemo(() => {
    const list: { value: string; label: string; clash?: Appointment; past: boolean }[] = [];
    for (let m = DAY_START; m + minutes <= DAY_END; m += 15) {
      const clash = findClash(appts, vet, m, minutes);
      list.push({ value: toHHMM(m), label: fmtTime(m), clash, past: m < now });
    }
    return list;
  }, [appts, vet, minutes, now]);

  const firstFree = slots.find((s) => !s.clash && !s.past)?.value ?? "";
  const chosen = time || firstFree;
  const selected = slots.find((s) => s.value === chosen);
  const problem = !selected
    ? "Pick a time for this appointment."
    : selected.past
      ? "That time has already passed."
      : selected.clash
        ? `${getVet(vet)?.name} already has ${getPatient(selected.clash.patient)?.name} from ${fmtTime(selected.clash.start)} to ${fmtTime(
            toMinutes(selected.clash.start) + selected.clash.minutes,
          )}.`
        : "";

  const patient = getPatient(patientId);
  const fieldCls = "mt-1.5 h-12 w-full rounded-xl border border-slate-300 bg-white px-3 text-base text-slate-900";

  return (
    <dialog
      ref={ref}
      aria-labelledby="book-h"
      onClose={onClose}
      onCancel={onClose}
      className="m-auto w-[calc(100%-1.5rem)] max-w-lg rounded-2xl bg-white p-0 text-slate-900 shadow-2xl"
    >
      {open && (
        <form
          key="book"
          onSubmit={(e) => {
            e.preventDefault();
            if (problem) return;
            onBook({
              id: `a-${String(appts.length + 1).padStart(2, "0")}`,
              patient: patientId,
              vet,
              start: chosen,
              minutes,
              reason: reason.trim() || "Appointment",
              status: "booked",
              urgent: urgent || undefined,
            });
            setReason("");
            setUrgent(false);
          }}
          className="p-5 sm:p-6"
        >
          <div className="flex items-start justify-between gap-4">
            <h2 id="book-h" className="text-xl font-bold">
              Book an appointment
            </h2>
            <button type="button" onClick={onClose} aria-label="Close" className="grid size-11 place-items-center rounded-lg text-slate-700 hover:bg-slate-100">
              <X aria-hidden className="size-5" />
            </button>
          </div>

          <div className="mt-4 space-y-4">
            <label className="block text-sm font-semibold text-slate-800">
              Patient
              <select value={patientId} onChange={(e) => setPatientId(e.target.value)} className={fieldCls}>
                {PATIENTS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.species}) &ndash; {getOwner(p.owner)?.name}
                    {p.alerts.length ? " ⚠" : ""}
                  </option>
                ))}
              </select>
            </label>
            {patient && patient.alerts.length > 0 && <AlertChips alerts={patient.alerts} />}

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-semibold text-slate-800">
                Vet
                <select value={vet} onChange={(e) => setVet(e.target.value as VetId)} className={fieldCls}>
                  {VETS.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} &ndash; {v.room}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm font-semibold text-slate-800">
                Length
                <select value={minutes} onChange={(e) => setMinutes(Number(e.target.value))} className={fieldCls}>
                  {DURATIONS.map((d) => (
                    <option key={d} value={d}>
                      {d} minutes
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="block text-sm font-semibold text-slate-800">
              Time
              <select
                value={chosen}
                onChange={(e) => setTime(e.target.value)}
                aria-describedby="time-problem"
                aria-invalid={Boolean(problem)}
                className={fieldCls}
              >
                <option value="" disabled>
                  Choose a time
                </option>
                {slots.map((s) => (
                  <option key={s.value} value={s.value} disabled={Boolean(s.clash) || s.past}>
                    {s.label}
                    {s.clash ? " – taken" : s.past ? " – passed" : ""}
                  </option>
                ))}
              </select>
            </label>
            <p id="time-problem" role="status" className={problem ? "text-sm font-medium text-red-800" : "text-sm text-slate-600"}>
              {problem || `${getVet(vet)?.name} is free at ${fmtTime(chosen)}. Taken and passed times are disabled.`}
            </p>

            <label className="block text-sm font-semibold text-slate-800">
              Reason
              <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Booster vaccination" className={fieldCls} />
            </label>
            <label className="flex min-h-11 items-center gap-3 text-sm font-semibold text-slate-800">
              <input type="checkbox" checked={urgent} onChange={(e) => setUrgent(e.target.checked)} className="size-5 accent-orange-600" />
              Mark as urgent
            </label>
          </div>

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button type="button" onClick={onClose} className="h-12 rounded-xl px-5 text-base font-semibold text-slate-800 ring-1 ring-slate-300 hover:bg-slate-50">
              Cancel
            </button>
            <button
              type="submit"
              disabled={Boolean(problem)}
              className="h-12 rounded-xl bg-brand-600 px-6 text-base font-semibold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-700"
            >
              Book appointment
            </button>
          </div>
        </form>
      )}
    </dialog>
  );
}
