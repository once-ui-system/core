"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { CalendarPlus, X } from "lucide-react";
import { AlertBanner } from "@/components/AlertList";
import {
  endTime,
  findClash,
  fmtTime,
  fromMinutes,
  getOwner,
  getPatient,
  getVet,
  patients,
  toMinutes,
  vets,
  type Appointment,
} from "@/lib/data";

const FIRST_SLOT = 8 * 60;
const LAST_END = 17 * 60 + 30;
const DURATIONS = [15, 20, 30, 45, 60];

const SLOTS: string[] = [];
for (let m = FIRST_SLOT; m < LAST_END; m += 15) SLOTS.push(fromMinutes(m));

const control =
  "h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-base text-slate-900 disabled:bg-slate-100";

function slotState(appts: Appointment[], vetId: string, start: string, minutes: number, nowMin: number) {
  if (toMinutes(start) + minutes > LAST_END) return "late" as const;
  if (toMinutes(start) < nowMin) return "past" as const;
  if (findClash(appts, vetId, start, minutes)) return "taken" as const;
  return "free" as const;
}

function firstFree(appts: Appointment[], vetId: string, minutes: number, nowMin: number): string {
  return SLOTS.find((s) => slotState(appts, vetId, s, minutes, nowMin) === "free") ?? SLOTS[0];
}

interface Props {
  appts: Appointment[];
  nowMin: number;
  initialPatientId?: string;
  initialReason?: string;
  onBook: (appt: Appointment) => void;
  onClose: () => void;
}

export function BookingDialog({ appts, nowMin, initialPatientId, initialReason, onBook, onClose }: Props) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const firstRef = useRef<HTMLSelectElement>(null);
  const [patientId, setPatientId] = useState(initialPatientId ?? "");
  const [vetId, setVetId] = useState("v-1");
  const [minutes, setMinutes] = useState(20);
  const [start, setStart] = useState(() => firstFree(appts, "v-1", 20, nowMin));
  const [reason, setReason] = useState(initialReason ?? "");
  const [tried, setTried] = useState(false);

  // Focus management: move focus in, restore it on close, close on Escape, keep Tab inside.
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    firstRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
      opener?.focus?.();
    };
  }, []);

  function onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === "Escape") {
      e.stopPropagation();
      onClose();
      return;
    }
    if (e.key !== "Tab" || !panelRef.current) return;
    const focusable = panelRef.current.querySelectorAll<HTMLElement>(
      "button:not([disabled]), select:not([disabled]), input:not([disabled]), a[href]",
    );
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  const patient = getPatient(patientId);
  const clash = useMemo(() => findClash(appts, vetId, start, minutes), [appts, vetId, start, minutes]);
  const clashPatient = clash ? getPatient(clash.patient) : undefined;
  const state = slotState(appts, vetId, start, minutes, nowMin);

  const errors: string[] = [];
  if (!patient) errors.push("Choose a patient.");
  if (!reason.trim()) errors.push("Add a reason for the visit.");
  if (clash)
    errors.push(
      `${getVet(vetId)?.name} already has ${clashPatient?.name ?? "a patient"} from ${fmtTime(clash.start)} to ${fmtTime(
        endTime(clash.start, clash.minutes),
      )}. Pick another time or another vet.`,
    );
  else if (state === "late") errors.push("That visit would run past closing time (5:30 PM).");
  else if (state === "past") errors.push("That time has already passed today.");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setTried(true);
    if (errors.length > 0 || !patient) return;
    const next = String(appts.length + 1).padStart(2, "0");
    onBook({
      id: `a-${next}`,
      patient: patient.id,
      vet: vetId,
      start,
      minutes,
      reason: reason.trim(),
      status: "booked",
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 sm:items-center sm:p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onKeyDown={onKeyDown}
        className="max-h-[94dvh] w-full overflow-y-auto rounded-t-2xl bg-white shadow-2xl sm:max-w-xl sm:rounded-2xl"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
          <h2 id={titleId} className="flex items-center gap-2 text-lg font-bold text-slate-900">
            <CalendarPlus aria-hidden="true" className="size-5 text-teal-700" />
            Book an appointment
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close booking form"
            className="inline-flex size-11 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100"
          >
            <X aria-hidden="true" className="size-5" />
          </button>
        </div>

        <form onSubmit={submit} noValidate className="space-y-4 px-5 py-5">
          <div>
            <label htmlFor="bk-patient" className="mb-1 block text-sm font-semibold text-slate-800">
              Patient
            </label>
            <select
              id="bk-patient"
              ref={firstRef}
              className={control}
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              aria-invalid={tried && !patient}
            >
              <option value="">Select a patient</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.species}), {getOwner(p.owner)?.name}
                  {p.alerts.length > 0 ? " - ALERT" : ""}
                </option>
              ))}
            </select>
          </div>

          {patient && <AlertBanner alerts={patient.alerts} name={patient.name} />}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="bk-vet" className="mb-1 block text-sm font-semibold text-slate-800">
                Vet
              </label>
              <select
                id="bk-vet"
                className={control}
                value={vetId}
                onChange={(e) => setVetId(e.target.value)}
              >
                {vets.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.room})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="bk-length" className="mb-1 block text-sm font-semibold text-slate-800">
                Length
              </label>
              <select
                id="bk-length"
                className={control}
                value={minutes}
                onChange={(e) => setMinutes(Number(e.target.value))}
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
            <label htmlFor="bk-time" className="mb-1 block text-sm font-semibold text-slate-800">
              Start time
            </label>
            <select
              id="bk-time"
              className={control}
              value={start}
              onChange={(e) => setStart(e.target.value)}
              aria-invalid={Boolean(clash)}
            >
              {SLOTS.map((s) => {
                const st = slotState(appts, vetId, s, minutes, nowMin);
                const note = st === "taken" ? " (taken)" : st === "past" ? " (passed)" : st === "late" ? " (too late)" : "";
                return (
                  <option key={s} value={s} disabled={st !== "free" && s !== start}>
                    {fmtTime(s)}
                    {note}
                  </option>
                );
              })}
            </select>
            <p className="mt-1 text-sm text-slate-600">
              Ends at {fmtTime(endTime(start, minutes))}. Times taken for this vet are marked.
            </p>
          </div>

          <div>
            <label htmlFor="bk-reason" className="mb-1 block text-sm font-semibold text-slate-800">
              Reason for visit
            </label>
            <input
              id="bk-reason"
              type="text"
              className={control}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Follow-up, recheck, vaccination"
              aria-invalid={tried && !reason.trim()}
            />
          </div>

          {(tried || clash) && errors.length > 0 && (
            <div role="alert" className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm font-medium text-red-900">
              <ul className="list-disc space-y-1 pl-5">
                {errors.map((er) => (
                  <li key={er}>{er}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="h-11 rounded-lg border border-slate-300 bg-white px-5 font-semibold text-slate-800 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={Boolean(clash)}
              className="h-11 rounded-lg bg-teal-700 px-5 font-semibold text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600"
            >
              Book appointment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
