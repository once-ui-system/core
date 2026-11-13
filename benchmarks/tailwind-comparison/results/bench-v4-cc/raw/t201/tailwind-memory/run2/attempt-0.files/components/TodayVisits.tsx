"use client";

import { CalendarClock } from "lucide-react";
import { useClinic } from "@/lib/clinic-context";
import { fmtClock, getVet } from "@/lib/data";
import { StatusBadge } from "@/components/StatusBadge";

/** Today's appointments for this patient, live from the front desk schedule. */
export function TodayVisits({ patientId }: { patientId: string }) {
  const { appointments } = useClinic();
  const mine = appointments.filter((a) => a.patient === patientId).sort((a, b) => a.start.localeCompare(b.start));
  return (
    <section aria-labelledby="today-h" className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-5">
      <h2 id="today-h" className="flex items-center gap-2 text-lg font-bold">
        <CalendarClock className="size-5 text-teal-700" aria-hidden />
        At the clinic today
      </h2>
      {mine.length === 0 ? (
        <p className="mt-2 text-sm text-stone-600">No appointments today.</p>
      ) : (
        <ul className="mt-3 space-y-3">
          {mine.map((a) => (
            <li key={a.id} className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold tabular-nums">
                  {fmtClock(a.start)} <span className="font-normal text-stone-700">{a.reason}</span>
                </p>
                <p className="text-sm text-stone-600">
                  {getVet(a.vet).name} &middot; {getVet(a.vet).room}
                </p>
              </div>
              <StatusBadge status={a.status} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
