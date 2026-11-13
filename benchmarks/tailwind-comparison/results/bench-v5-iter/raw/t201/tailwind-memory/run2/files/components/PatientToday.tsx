"use client";

import { CalendarClock, UserCheck } from "lucide-react";
import { fmtTime, getVet, toMin } from "@/lib/data";
import { useClinic } from "@/lib/store";
import { StatusBadge } from "./StatusBadge";

/** Appointments this patient still has today, live from the schedule. */
export function PatientToday({ patientId }: { patientId: string }) {
  const { appointments, checkIn } = useClinic();
  const mine = appointments
    .filter((a) => a.patient === patientId && a.status !== "cancelled" && a.status !== "done")
    .sort((a, b) => toMin(a.start) - toMin(b.start));
  if (mine.length === 0) return <p className="text-sm text-slate-600">No more appointments today.</p>;
  return (
    <ul className="space-y-2">
      {mine.map((a) => (
        <li key={a.id} className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5">
          <CalendarClock aria-hidden className="size-5 text-teal-700" />
          <span className="font-bold tabular-nums">{fmtTime(a.start)}</span>
          <span className="min-w-0 flex-1 text-sm text-slate-700">
            {a.reason} · {getVet(a.vet).name}, {getVet(a.vet).room}
          </span>
          <StatusBadge status={a.status} />
          {a.status === "booked" && (
            <button
              type="button"
              onClick={() => checkIn(a.id)}
              className="inline-flex h-11 items-center gap-2 rounded-lg bg-teal-700 px-4 text-sm font-semibold text-white hover:bg-teal-800"
            >
              <UserCheck aria-hidden className="size-4" />
              Check in
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}
