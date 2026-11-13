"use client";

import { useEffect, useId, useRef, useState } from "react";
import { CalendarPlus, CircleAlert, X } from "lucide-react";
import { AlertBadges } from "@/components/AlertBadges";
import { type Appointment, getOwner, getPatient, getVet, patients, vets } from "@/lib/data";
import { fromMinutes, time12, toMinutes } from "@/lib/format";
import { DAY_END, SLOTS, findPatientConflict, findVetConflict, nextFreeStart } from "@/lib/schedule";

const DURATIONS = [15, 20, 30, 45, 60, 90];

const fieldClass =
  "mt-1.5 h-12 w-full rounded-lg border border-slate-300 bg-white px-3 text-base text-slate-900 focus:border-teal-600";

interface Props {
  open: boolean;
  onClose: () => void;
  appointments: Appointment[];
  now: number;
  onBook: (appointment: Appointment) => void;
}

export default function BookingDialog({ open, onClose, appointments, now, onBook }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="m-auto max-h-[calc(100dvh-1.5rem)] w-[calc(100%-1.5rem)] max-w-xl overflow-y-auto rounded-2xl bg-white p-0 text-slate-900 shadow-2xl backdrop:bg-slate-900/60"
    >
      {open && <BookingForm titleId={titleId} appointments={appointments} now={now} onBook={onBook} onClose={onClose} />}
    </dialog>
  );
}

function BookingForm({
  titleId,
  appointments,
  now,
  onBook,
  onClose,
}: {
  titleId: string;
  appointments: Appointment[];
  now: number;
  onBook: (appointment: Appointment) => void;
  onClose: () => void;
}) {
  const defaultStart = Math.min(DAY_END - 15, Math.ceil(now / 15) * 15);
  const [patientId, setPatientId] = useState("");
  const [vetId, setVetId] = useState(vets[0].id);
  const [start, setStart] = useState(defaultStart);
  const [minutes, setMinutes] = useState(20);
  const [reason, setReason] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const end = start + minutes;
  const vetClash = findVetConflict(appointments, vetId, start, minutes);
  const patientClash = patientId ? findPatientConflict(appointments, patientId, start, minutes) : undefined;
  const pastClosing = end > DAY_END;
  const blocked = Boolean(vetClash || patientClash || pastClosing);
  const suggestion = vetClash || pastClosing ? nextFreeStart(appointments, vetId, minutes, start) : null;

  const patient = patientId ? getPatient(patientId) : null;
  const missingPatient = submitted && !patientId;
  const missingReason = submitted && reason.trim() === "";

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    if (!patientId || reason.trim() === "" || blocked) return;
    const nextNum =
      appointments.reduce((max, a) => Math.max(max, Number(a.id.replace(/\D/g, "")) || 0), 0) + 1;
    onBook({
      id: `a-${String(nextNum).padStart(2, "0")}`,
      patient: patientId,
      vet: vetId,
      start: fromMinutes(start),
      minutes,
      reason: reason.trim(),
      status: "booked",
    });
    onClose();
  }

  return (
    <form onSubmit={submit} noValidate>
      <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
        <div>
          <h2 id={titleId} className="text-xl font-bold tracking-tight">
            Book an appointment
          </h2>
          <p className="text-sm text-slate-600">Pick a patient, a vet and a time. Clashes are blocked.</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="grid size-11 shrink-0 place-items-center rounded-lg text-slate-600 hover:bg-slate-100"
        >
          <X aria-hidden className="size-5" />
        </button>
      </div>

      <div className="space-y-4 px-5 py-5">
        <div>
          <label htmlFor="bk-patient" className="text-sm font-semibold">
            Patient
          </label>
          <select
            id="bk-patient"
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
            aria-invalid={missingPatient}
            aria-describedby={missingPatient ? "bk-patient-err" : undefined}
            className={fieldClass}
          >
            <option value="">Choose a patient&hellip;</option>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.species}) &mdash; {getOwner(p.owner).name}
                {p.alerts.length ? " ⚠ alert" : ""}
              </option>
            ))}
          </select>
          {missingPatient && (
            <p id="bk-patient-err" className="mt-1 text-sm font-medium text-red-700">
              Choose a patient to book.
            </p>
          )}
          {patient && (
            <div className="mt-2 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">
              <p>
                {patient.breed} &middot; owner {getOwner(patient.owner).name}, {getOwner(patient.owner).phone}
              </p>
              <AlertBadges alerts={patient.alerts} className="mt-1.5" />
            </div>
          )}
        </div>

        <div>
          <label htmlFor="bk-vet" className="text-sm font-semibold">
            Vet
          </label>
          <select id="bk-vet" value={vetId} onChange={(e) => setVetId(e.target.value)} className={fieldClass}>
            {vets.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name} &mdash; {v.room}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="bk-start" className="text-sm font-semibold">
              Start
            </label>
            <select
              id="bk-start"
              value={start}
              onChange={(e) => setStart(Number(e.target.value))}
              className={fieldClass}
            >
              {SLOTS.map((t) => (
                <option key={t} value={t}>
                  {time12(t)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="bk-min" className="text-sm font-semibold">
              Length
            </label>
            <select
              id="bk-min"
              value={minutes}
              onChange={(e) => setMinutes(Number(e.target.value))}
              className={fieldClass}
            >
              {DURATIONS.map((m) => (
                <option key={m} value={m}>
                  {m} min
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="bk-reason" className="text-sm font-semibold">
            Reason for visit
          </label>
          <input
            id="bk-reason"
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Ear infection follow-up"
            aria-invalid={missingReason}
            aria-describedby={missingReason ? "bk-reason-err" : undefined}
            className={fieldClass}
          />
          {missingReason && (
            <p id="bk-reason-err" className="mt-1 text-sm font-medium text-red-700">
              Add a short reason.
            </p>
          )}
        </div>

        <div aria-live="polite">
          {blocked ? (
            <div role="alert" className="flex gap-3 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-900">
              <CircleAlert aria-hidden className="mt-0.5 size-5 shrink-0" />
              <div className="space-y-1">
                {vetClash && (
                  <p>
                    <strong>{getVet(vetId).name}</strong> is already booked {time12(vetClash.start)} to{" "}
                    {time12(toMinutes(vetClash.start) + vetClash.minutes)} ({getPatient(vetClash.patient).name},{" "}
                    {vetClash.reason}).
                  </p>
                )}
                {patientClash && (
                  <p>
                    {patient?.name} already has an appointment at {time12(patientClash.start)} with{" "}
                    {getVet(patientClash.vet).name}.
                  </p>
                )}
                {pastClosing && <p>This would run past closing time ({time12(DAY_END)}).</p>}
                {(vetClash || pastClosing) &&
                  (suggestion !== null ? (
                    <button
                      type="button"
                      onClick={() => setStart(suggestion)}
                      className="mt-1 inline-flex min-h-10 items-center rounded-lg bg-white px-3 font-semibold text-red-900 ring-1 ring-red-300 hover:bg-red-100"
                    >
                      Use next free time: {time12(suggestion)}
                    </button>
                  ) : (
                    <p>No free time left today for {getVet(vetId).name} at this length.</p>
                  ))}
              </div>
            </div>
          ) : (
            <p className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-900">
              {getVet(vetId).name} is free {time12(start)} to {time12(end)}.
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col-reverse gap-2 border-t border-slate-200 px-5 py-4 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onClose}
          className="min-h-12 rounded-lg px-5 font-semibold text-slate-700 ring-1 ring-slate-300 hover:bg-slate-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={blocked}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-teal-700 px-5 font-semibold text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600"
        >
          <CalendarPlus aria-hidden className="size-5" />
          Book appointment
        </button>
      </div>
    </form>
  );
}
