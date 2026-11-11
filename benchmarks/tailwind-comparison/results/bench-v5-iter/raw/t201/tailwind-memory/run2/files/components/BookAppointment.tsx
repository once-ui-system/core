"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { CalendarPlus, TriangleAlert, X } from "lucide-react";
import {
  CLOSE_MIN,
  OPEN_MIN,
  PATIENTS,
  TODAY,
  VETS,
  findConflict,
  fmtDate,
  fmtTime,
  fromMin,
  getOwner,
  getPatient,
} from "@/lib/data";
import { useClinic } from "@/lib/store";
import { AlertChips } from "./AlertChips";

const DURATIONS = [15, 20, 30, 45, 60];
const SLOT_STEP = 15;

function BookingForm({ defaultPatientId, onDone }: { defaultPatientId?: string; onDone: () => void }) {
  const { appointments, now, book } = useClinic();
  const uid = useId();
  const [patientId, setPatientId] = useState(defaultPatientId ?? "");
  const [vetId, setVetId] = useState(VETS[0].id);
  const [minutes, setMinutes] = useState(20);
  const [time, setTime] = useState("");
  const [reason, setReason] = useState(defaultPatientId ? "Follow-up visit" : "");
  const [error, setError] = useState("");

  const slots = useMemo(() => {
    const out: { value: string; label: string; reason: "" | "taken" | "past" | "late" }[] = [];
    for (let m = OPEN_MIN; m < CLOSE_MIN; m += SLOT_STEP) {
      let why: "" | "taken" | "past" | "late" = "";
      if (m < now) why = "past";
      else if (m + minutes > CLOSE_MIN) why = "late";
      else if (findConflict(appointments, vetId, m, minutes)) why = "taken";
      out.push({ value: fromMin(m), label: fmtTime(fromMin(m)), reason: why });
    }
    return out;
  }, [appointments, now, vetId, minutes]);

  const selectedSlot = slots.find((s) => s.value === time);
  const timeOk = !!selectedSlot && selectedSlot.reason === "";
  const patient = getPatient(patientId);
  const canSubmit = !!patient && timeOk;
  const freeCount = slots.filter((s) => s.reason === "").length;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patient) return;
    const res = book({ patient: patient.id, vet: vetId, start: time, minutes, reason });
    if (res.ok) onDone();
    else {
      setError(res.error);
      setTime("");
    }
  };

  const field = "h-12 w-full rounded-lg border border-slate-300 bg-white px-3 text-base text-slate-900 hover:border-slate-400 focus:border-teal-700";
  const label = "mb-1.5 block text-sm font-semibold text-slate-800";

  return (
    <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-5">
        <div>
          <label htmlFor={`${uid}-patient`} className={label}>
            Patient
          </label>
          <select
            id={`${uid}-patient`}
            value={patientId}
            onChange={(e) => {
              setPatientId(e.target.value);
              setError("");
            }}
            className={field}
          >
            <option value="">Choose a patient</option>
            {PATIENTS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.species}) · {getOwner(p.owner).name}
                {p.alerts.length ? " · ALERT" : ""}
              </option>
            ))}
          </select>
          {patient && patient.alerts.length > 0 && <AlertChips alerts={patient.alerts} size="md" className="mt-2" />}
        </div>

        <fieldset>
          <legend className={label}>Vet</legend>
          <div className="grid gap-2 sm:grid-cols-3">
            {VETS.map((v) => (
              <label
                key={v.id}
                className={`flex min-h-14 cursor-pointer flex-col justify-center rounded-lg border px-3 py-2 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-teal-700 ${
                  vetId === v.id ? "border-teal-700 bg-teal-50 ring-1 ring-teal-700" : "border-slate-300 bg-white hover:border-slate-400"
                }`}
              >
                <input
                  type="radio"
                  name={`${uid}-vet`}
                  value={v.id}
                  checked={vetId === v.id}
                  onChange={() => {
                    setVetId(v.id);
                    setTime("");
                    setError("");
                  }}
                  className="sr-only"
                />
                <span className="text-sm font-semibold text-slate-900">{v.name}</span>
                <span className="text-xs text-slate-600">{v.room}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor={`${uid}-len`} className={label}>
              Length
            </label>
            <select
              id={`${uid}-len`}
              value={minutes}
              onChange={(e) => {
                setMinutes(Number(e.target.value));
                setTime("");
                setError("");
              }}
              className={field}
            >
              {DURATIONS.map((d) => (
                <option key={d} value={d}>
                  {d} minutes
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor={`${uid}-reason`} className={label}>
              Reason
            </label>
            <input id={`${uid}-reason`} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Follow-up visit" className={field} />
          </div>
        </div>

        <fieldset>
          <legend className={label}>
            Time today, {fmtDate(TODAY, { weekday: "short", month: "short", day: "numeric" })}
            <span className="ml-2 font-normal text-slate-600">{freeCount} free for this vet</span>
          </legend>
          <div className="grid max-h-60 grid-cols-3 gap-2 overflow-y-auto rounded-lg border border-slate-200 bg-slate-50 p-2 sm:grid-cols-4 md:grid-cols-6">
            {slots.map((s) => {
              const disabled = s.reason !== "";
              const on = time === s.value;
              return (
                <label
                  key={s.value}
                  className={`grid h-11 place-items-center rounded-md border text-sm font-semibold tabular-nums has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-1 has-[:focus-visible]:outline-teal-700 ${
                    disabled
                      ? "cursor-not-allowed border-transparent bg-transparent text-slate-400 line-through"
                      : on
                        ? "cursor-pointer border-teal-800 bg-teal-700 text-white"
                        : "cursor-pointer border-slate-300 bg-white text-slate-900 hover:border-teal-600"
                  }`}
                  title={s.reason === "taken" ? "Clashes with another booking" : s.reason === "past" ? "Already passed" : s.reason === "late" ? "Runs past closing" : undefined}
                >
                  <input
                    type="radio"
                    name={`${uid}-time`}
                    value={s.value}
                    disabled={disabled}
                    checked={on}
                    onChange={() => {
                      setTime(s.value);
                      setError("");
                    }}
                    className="sr-only"
                  />
                  {s.label}
                  {disabled && <span className="sr-only"> (unavailable)</span>}
                </label>
              );
            })}
          </div>
          <p className="mt-1.5 text-xs text-slate-600">Struck-through times clash with this vet&apos;s other bookings, have passed, or run past {fmtTime(fromMin(CLOSE_MIN))}.</p>
        </fieldset>

        {error && (
          <p role="alert" className="flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-sm font-medium text-red-900 ring-1 ring-red-300">
            <TriangleAlert aria-hidden className="mt-0.5 size-4 shrink-0" />
            {error}
          </p>
        )}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-white px-5 py-4">
        <p className="min-w-0 text-sm text-slate-700" aria-live="polite">
          {canSubmit && patient ? (
            <>
              <strong>{patient.name}</strong> with {VETS.find((v) => v.id === vetId)?.name} at <strong>{fmtTime(time)}</strong>
            </>
          ) : (
            "Choose a patient and a free time."
          )}
        </p>
        <button
          type="submit"
          disabled={!canSubmit}
          className="inline-flex h-12 items-center gap-2 rounded-lg bg-teal-700 px-5 text-base font-semibold text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600"
        >
          <CalendarPlus aria-hidden className="size-5" />
          Book appointment
        </button>
      </div>
    </form>
  );
}

export function BookAppointment({
  patientId,
  label = "Book appointment",
  variant = "primary",
}: {
  patientId?: string;
  label?: string;
  variant?: "primary" | "secondary";
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  const btn =
    variant === "primary"
      ? "bg-teal-700 text-white hover:bg-teal-800"
      : "border border-slate-300 bg-white text-slate-900 hover:bg-slate-50";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`inline-flex h-12 items-center justify-center gap-2 rounded-xl px-5 text-base font-semibold shadow-sm ${btn}`}
      >
        <CalendarPlus aria-hidden className="size-5" />
        {label}
      </button>
      <dialog
        ref={ref}
        aria-labelledby={titleId}
        onClose={() => setOpen(false)}
        onClick={(e) => {
          if (e.target === ref.current) setOpen(false);
        }}
        className="m-0 h-dvh max-h-none w-full max-w-none overflow-hidden bg-white p-0 text-slate-900 backdrop:bg-slate-900/50 sm:m-auto sm:h-[min(46rem,92dvh)] sm:max-h-[92dvh] sm:max-w-2xl sm:rounded-2xl sm:shadow-2xl"
      >
        {open && (
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <h2 id={titleId} className="text-xl font-bold tracking-tight">
                Book an appointment
              </h2>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="grid size-11 place-items-center rounded-lg text-slate-600 hover:bg-slate-100">
                <X aria-hidden className="size-5" />
              </button>
            </div>
            <BookingForm defaultPatientId={patientId} onDone={() => setOpen(false)} />
          </div>
        )}
      </dialog>
    </>
  );
}
