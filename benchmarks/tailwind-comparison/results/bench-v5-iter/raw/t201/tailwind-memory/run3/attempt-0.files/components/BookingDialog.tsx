"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { CalendarPlus, TriangleAlert, X } from "lucide-react";
import {
  DAY_END,
  DAY_START,
  fmtMinutes,
  fmtTime,
  findClash,
  fromMinutes,
  getOwner,
  getPatient,
  getVet,
  patients,
  toMinutes,
  vets,
  type Appointment,
} from "@/lib/data";
import { AlertChips } from "@/components/Alerts";

const DURATIONS = [15, 20, 30, 45, 60, 90];
const STEP = 15;

interface Props {
  appointments: Appointment[];
  now: number;
  onClose: () => void;
  onBook: (a: Appointment) => void;
}

interface Slot {
  value: string;
  label: string;
  free: boolean;
  reason?: string;
}

function buildSlots(list: Appointment[], vetId: string, minutes: number, now: number): Slot[] {
  const out: Slot[] = [];
  for (let t = DAY_START; t + minutes <= DAY_END; t += STEP) {
    const value = fromMinutes(t);
    let reason: string | undefined;
    if (t < now) reason = "passed";
    else {
      const clash = findClash(list, vetId, t, minutes);
      if (clash) reason = `busy until ${fmtMinutes(toMinutes(clash.start) + clash.minutes)}`;
    }
    out.push({ value, label: reason ? `${fmtTime(value)} (${reason})` : fmtTime(value), free: !reason, reason });
  }
  return out;
}

export function BookingDialog({ appointments, now, onClose, onBook }: Props) {
  const uid = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [patientId, setPatientId] = useState("");
  const [vetId, setVetId] = useState(vets[0].id);
  const [minutes, setMinutes] = useState(20);
  const [reason, setReason] = useState("");
  const [urgent, setUrgent] = useState(false);
  const [time, setTime] = useState(() => buildSlots(appointments, vets[0].id, 20, now).find((s) => s.free)?.value ?? "");
  const [error, setError] = useState("");

  useEffect(() => {
    const d = dialogRef.current;
    if (d && !d.open) d.showModal();
  }, []);

  const slots = useMemo(() => buildSlots(appointments, vetId, minutes, now), [appointments, vetId, minutes, now]);
  const patient = patientId ? getPatient(patientId) : undefined;
  const vetDay = useMemo(
    () =>
      appointments
        .filter((a) => a.vet === vetId && a.status !== "cancelled")
        .sort((a, b) => toMinutes(a.start) - toMinutes(b.start)),
    [appointments, vetId],
  );

  function pickFirstFree(nextVet: string, nextMinutes: number, keep: string) {
    const list = buildSlots(appointments, nextVet, nextMinutes, now);
    const kept = list.find((s) => s.value === keep && s.free);
    setTime(kept ? kept.value : (list.find((s) => s.free)?.value ?? ""));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!patientId) return setError("Choose a patient first.");
    if (!time) return setError("There is no free time for this vet and length today. Try another vet or a shorter visit.");
    const start = toMinutes(time);
    const clash = findClash(appointments, vetId, start, minutes);
    if (clash) {
      const p = getPatient(clash.patient);
      return setError(
        `${getVet(vetId).name} already has ${p?.name ?? "a patient"} at ${fmtTime(clash.start)} (${clash.minutes} min). Pick another time.`,
      );
    }
    const next = String(appointments.length + 1).padStart(2, "0");
    onBook({
      id: `a-${next}`,
      patient: patientId,
      vet: vetId,
      start: time,
      minutes,
      reason: reason.trim() || "Follow-up visit",
      status: "booked",
      urgent: urgent || undefined,
    });
  }

  const field = "h-12 w-full rounded-xl border border-slate-300 bg-white px-3 text-base focus:border-teal-700";
  const label = "mb-1.5 block text-sm font-semibold text-slate-800";

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={`${uid}-title`}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === dialogRef.current) dialogRef.current?.close();
      }}
      className="m-auto max-h-[calc(100dvh-1.5rem)] w-[calc(100%-1.5rem)] max-w-xl overflow-y-auto rounded-2xl bg-white p-0 text-slate-900 shadow-2xl"
    >
      <form onSubmit={submit} noValidate>
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
          <h2 id={`${uid}-title`} className="flex items-center gap-2 text-xl font-extrabold tracking-tight">
            <CalendarPlus aria-hidden className="size-6 text-teal-700" />
            Book an appointment
          </h2>
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            aria-label="Close"
            className="grid size-11 place-items-center rounded-xl text-slate-600 hover:bg-slate-100"
          >
            <X aria-hidden className="size-5" />
          </button>
        </div>

        <div className="grid gap-4 px-5 py-5">
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
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.species}), owner {getOwner(p.owner).name}
                  {p.alerts.length ? " [ALERT]" : ""}
                </option>
              ))}
            </select>
            {patient && patient.alerts.length > 0 && (
              <div className="mt-2 rounded-xl border-2 border-red-700 bg-red-50 p-2.5">
                <AlertChips alerts={patient.alerts} />
              </div>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor={`${uid}-vet`} className={label}>
                Vet
              </label>
              <select
                id={`${uid}-vet`}
                value={vetId}
                onChange={(e) => {
                  setVetId(e.target.value);
                  pickFirstFree(e.target.value, minutes, time);
                  setError("");
                }}
                className={field}
              >
                {vets.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.room})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor={`${uid}-len`} className={label}>
                Length
              </label>
              <select
                id={`${uid}-len`}
                value={minutes}
                onChange={(e) => {
                  const m = Number(e.target.value);
                  setMinutes(m);
                  pickFirstFree(vetId, m, time);
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
          </div>

          <div>
            <label htmlFor={`${uid}-time`} className={label}>
              Time today
            </label>
            <select
              id={`${uid}-time`}
              value={time}
              onChange={(e) => {
                setTime(e.target.value);
                setError("");
              }}
              className={field}
            >
              {!time && <option value="">No free time</option>}
              {slots.map((s) => (
                <option key={s.value} value={s.value} disabled={!s.free}>
                  {s.label}
                </option>
              ))}
            </select>
            <p className="mt-2 text-sm text-slate-600">
              <span className="font-semibold">{getVet(vetId).name} today:</span>{" "}
              {vetDay.length === 0
                ? "nothing booked."
                : vetDay.map((a) => `${fmtTime(a.start)}–${fmtMinutes(toMinutes(a.start) + a.minutes)}`).join(", ")}
            </p>
          </div>

          <div>
            <label htmlFor={`${uid}-reason`} className={label}>
              Reason for visit
            </label>
            <input
              id={`${uid}-reason`}
              type="text"
              value={reason}
              placeholder="e.g. Suture removal"
              onChange={(e) => setReason(e.target.value)}
              className={field}
            />
          </div>

          <label className="flex min-h-11 items-center gap-3 text-base font-medium">
            <input
              type="checkbox"
              checked={urgent}
              onChange={(e) => setUrgent(e.target.checked)}
              className="size-5 accent-amber-600"
            />
            Mark as urgent
          </label>

          <div aria-live="polite">
            {error && (
              <p className="flex items-start gap-2 rounded-xl bg-red-50 px-3 py-2.5 text-sm font-semibold text-red-800 ring-1 ring-red-300">
                <TriangleAlert aria-hidden className="mt-0.5 size-4 shrink-0" />
                {error}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            className="h-12 rounded-xl border border-slate-300 bg-white px-5 font-semibold hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="h-12 rounded-xl bg-teal-700 px-6 font-bold text-white shadow-sm hover:bg-teal-800"
          >
            Book appointment
          </button>
        </div>
      </form>
    </dialog>
  );
}
