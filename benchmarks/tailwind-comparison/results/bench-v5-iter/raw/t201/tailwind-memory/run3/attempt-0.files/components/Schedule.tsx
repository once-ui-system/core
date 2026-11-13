"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  CalendarPlus,
  CircleCheck,
  Clock,
  Siren,
  Stethoscope,
  UserCheck,
  CircleX,
  Hourglass,
} from "lucide-react";
import {
  NOW_MINUTES,
  TODAY,
  byTime,
  fmtLongToday,
  fmtMinutes,
  fmtTime,
  getOwner,
  getPatient,
  getVet,
  initialAppointments,
  toMinutes,
  vets,
  waitText,
  type Appointment,
  type Status,
} from "@/lib/data";
import { AlertChips, SpeciesIcon } from "@/components/Alerts";
import { StatusBadge, STATUS_LABEL } from "@/components/StatusBadge";
import { BookingDialog } from "@/components/BookingDialog";

const STATUS_ORDER: Status[] = ["booked", "checked_in", "in_exam", "done", "cancelled"];

export function Schedule() {
  const [appts, setAppts] = useState<Appointment[]>(initialAppointments);
  const [now, setNow] = useState(NOW_MINUTES);
  const [vetFilter, setVetFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<Status | "all">("all");
  const [booking, setBooking] = useState(false);
  const [notice, setNotice] = useState("");
  const [flashId, setFlashId] = useState("");

  useEffect(() => {
    const t = setInterval(() => setNow((n) => n + 1), 60_000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(""), 6000);
    return () => clearTimeout(t);
  }, [notice]);

  function setStatus(id: string, status: Status) {
    const a = appts.find((x) => x.id === id);
    if (!a) return;
    const name = getPatient(a.patient)?.name ?? "Patient";
    setAppts((list) =>
      list.map((x) =>
        x.id === id ? { ...x, status, checkedInAt: status === "checked_in" ? now : x.checkedInAt } : x,
      ),
    );
    const verb: Record<Status, string> = {
      booked: "returned to booked",
      checked_in: "checked in and added to the waiting list",
      in_exam: `sent to ${getVet(a.vet).room}`,
      done: "marked done",
      cancelled: "cancelled",
    };
    setNotice(`${name} ${verb[status]}.`);
  }

  function onBook(a: Appointment) {
    setAppts((list) => [...list, a]);
    setBooking(false);
    setFlashId(a.id);
    setNotice(
      `Booked ${getPatient(a.patient)?.name} with ${getVet(a.vet).name} at ${fmtTime(a.start)}.`,
    );
  }

  const counts = useMemo(() => {
    const c: Record<Status, number> = { booked: 0, checked_in: 0, in_exam: 0, done: 0, cancelled: 0 };
    for (const a of appts) c[a.status] += 1;
    return c;
  }, [appts]);

  const sorted = useMemo(() => [...appts].sort(byTime), [appts]);
  const visible = sorted.filter(
    (a) => (vetFilter === "all" || a.vet === vetFilter) && (statusFilter === "all" || a.status === statusFilter),
  );

  const waiting = useMemo(
    () =>
      appts
        .filter((a) => a.status === "checked_in")
        .sort((a, b) => (a.checkedInAt ?? 0) - (b.checkedInAt ?? 0)),
    [appts],
  );
  const upNext = useMemo(
    () =>
      appts
        .filter((a) => a.status === "booked")
        .sort(byTime)
        .slice(0, 4),
    [appts],
  );

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-5 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-teal-800">{fmtLongToday(TODAY)}</p>
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Today&rsquo;s schedule</h1>
          <p className="mt-0.5 flex items-center gap-1.5 text-sm text-slate-600">
            <Clock aria-hidden className="size-4" />
            It is {fmtMinutes(now)} &middot; 3 vets &middot; {appts.length} appointments
          </p>
        </div>
        <button
          type="button"
          onClick={() => setBooking(true)}
          className="inline-flex h-12 items-center gap-2 rounded-xl bg-teal-700 px-5 text-base font-bold text-white shadow-sm hover:bg-teal-800 active:bg-teal-900"
        >
          <CalendarPlus aria-hidden className="size-5" />
          Book appointment
        </button>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
        {/* Waiting list and next up */}
        <aside
          aria-label="Waiting room"
          className="grid gap-4 md:grid-cols-2 lg:sticky lg:top-24 lg:col-start-2 lg:row-start-1 lg:grid-cols-1"
        >
          <section aria-labelledby="waiting-h" className="rounded-2xl border border-sky-200 bg-white shadow-sm">
            <header className="flex items-center justify-between gap-2 rounded-t-2xl bg-sky-700 px-4 py-3 text-white">
              <h2 id="waiting-h" className="flex items-center gap-2 text-base font-bold">
                <Hourglass aria-hidden className="size-5" />
                Waiting now
              </h2>
              <span className="rounded-full bg-white px-2.5 py-0.5 text-sm font-extrabold text-sky-900">
                <span className="sr-only">{waiting.length} waiting</span>
                <span aria-hidden>{waiting.length}</span>
              </span>
            </header>
            {waiting.length === 0 ? (
              <p className="px-4 py-6 text-sm text-slate-600">Nobody is waiting. Checked-in patients appear here.</p>
            ) : (
              <ol className="divide-y divide-slate-100">
                {waiting.map((a, i) => {
                  const p = getPatient(a.patient);
                  if (!p) return null;
                  const mins = now - (a.checkedInAt ?? now);
                  const long = mins >= 30;
                  return (
                    <li key={a.id} className="px-4 py-3">
                      <div className="flex items-start gap-3">
                        <span
                          aria-hidden
                          className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-sky-100 text-sm font-extrabold text-sky-900"
                        >
                          {i + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-baseline justify-between gap-2">
                            <Link href={`/patients/${p.id}`} className="font-bold underline-offset-2 hover:underline">
                              {p.name}
                            </Link>
                            <span
                              className={`whitespace-nowrap text-sm font-extrabold tabular-nums ${long ? "text-amber-800" : "text-slate-800"}`}
                            >
                              {waitText(mins)}
                              {long && <span className="sr-only"> (long wait)</span>}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600">
                            {getOwner(p.owner).name} &middot; {getVet(a.vet).name}, booked {fmtTime(a.start)}
                          </p>
                          <AlertChips alerts={p.alerts} className="mt-1.5" />
                          <button
                            type="button"
                            onClick={() => setStatus(a.id, "in_exam")}
                            className="mt-2 inline-flex h-10 items-center gap-1.5 rounded-lg border border-sky-700 px-3 text-sm font-bold text-sky-900 hover:bg-sky-50"
                          >
                            <Stethoscope aria-hidden className="size-4" />
                            Send to {getVet(a.vet).room}
                            <span className="sr-only"> : {p.name}</span>
                          </button>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}
          </section>

          <section aria-labelledby="next-h" className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <header className="flex items-center justify-between gap-2 border-b border-slate-100 px-4 py-3">
              <h2 id="next-h" className="flex items-center gap-2 text-base font-bold">
                <ArrowRight aria-hidden className="size-5 text-teal-700" />
                Up next
              </h2>
            </header>
            {upNext.length === 0 ? (
              <p className="px-4 py-6 text-sm text-slate-600">No more booked appointments today.</p>
            ) : (
              <ol className="divide-y divide-slate-100">
                {upNext.map((a) => {
                  const p = getPatient(a.patient);
                  if (!p) return null;
                  const inMin = toMinutes(a.start) - now;
                  return (
                    <li key={a.id} className="flex items-start gap-3 px-4 py-3">
                      <span className="w-[4.25rem] shrink-0 text-sm font-extrabold tabular-nums">{fmtTime(a.start)}</span>
                      <div className="min-w-0 flex-1">
                        <p className="flex flex-wrap items-center gap-x-2">
                          <Link href={`/patients/${p.id}`} className="font-bold underline-offset-2 hover:underline">
                            {p.name}
                          </Link>
                          {a.urgent && (
                            <span className="inline-flex items-center gap-1 rounded bg-amber-500 px-1.5 py-0.5 text-[11px] font-extrabold uppercase text-amber-950">
                              <Siren aria-hidden className="size-3" />
                              Urgent
                            </span>
                          )}
                        </p>
                        <p className="text-sm text-slate-600">
                          {getVet(a.vet).name} &middot; {inMin > 0 ? `in ${waitText(inMin)}` : "due now"}
                        </p>
                        <AlertChips alerts={p.alerts} className="mt-1.5" />
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}
          </section>
        </aside>

        {/* Schedule */}
        <section aria-labelledby="sched-h" className="min-w-0 lg:col-start-1 lg:row-start-1">
          <h2 id="sched-h" className="sr-only">
            Appointments
          </h2>

          <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {(["booked", "checked_in", "in_exam", "done"] as Status[]).map((s) => (
              <div key={s} className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5">
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-600">{STATUS_LABEL[s]}</dt>
                <dd className="text-2xl font-extrabold tabular-nums">{counts[s]}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-4 flex flex-col gap-2">
            <FilterBar label="Vet">
              <Chip active={vetFilter === "all"} onClick={() => setVetFilter("all")}>
                All vets
              </Chip>
              {vets.map((v) => (
                <Chip key={v.id} active={vetFilter === v.id} onClick={() => setVetFilter(v.id)}>
                  {v.name.replace("Dr. ", "Dr ")} <span className="font-normal">{v.room}</span>
                </Chip>
              ))}
            </FilterBar>
            <FilterBar label="Status">
              <Chip active={statusFilter === "all"} onClick={() => setStatusFilter("all")}>
                All
              </Chip>
              {STATUS_ORDER.map((s) => (
                <Chip key={s} active={statusFilter === s} onClick={() => setStatusFilter(s)}>
                  {STATUS_LABEL[s]} <span className="font-normal">{counts[s]}</span>
                </Chip>
              ))}
            </FilterBar>
          </div>

          <p role="status" className="sr-only">
            Showing {visible.length} of {appts.length} appointments
          </p>

          {visible.length === 0 ? (
            <p className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-10 text-center text-slate-600">
              No appointments match these filters.
            </p>
          ) : (
            <ul className="mt-4 grid gap-2.5">
              {visible.map((a) => (
                <AppointmentRow key={a.id} a={a} flash={flashId === a.id} onStatus={setStatus} />
              ))}
            </ul>
          )}
        </section>
      </div>

      {notice && (
        <div
          role="status"
          className="fixed inset-x-3 bottom-4 z-40 mx-auto flex max-w-md items-center gap-3 rounded-xl bg-teal-900 px-4 py-3 text-sm font-semibold text-white shadow-2xl"
        >
          <CircleCheck aria-hidden className="size-5 shrink-0 text-teal-300" />
          <span className="flex-1">{notice}</span>
          <button
            type="button"
            onClick={() => setNotice("")}
            className="rounded-lg px-2 py-1 text-teal-200 underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {booking && (
        <BookingDialog
          appointments={appts}
          now={now}
          onClose={() => setBooking(false)}
          onBook={onBook}
        />
      )}
    </div>
  );
}

function FilterBar({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div role="group" aria-label={`Filter by ${label.toLowerCase()}`} className="flex items-center gap-2">
      <span className="w-14 shrink-0 text-xs font-bold uppercase tracking-wide text-slate-600">{label}</span>
      <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 py-1">{children}</div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`h-10 shrink-0 whitespace-nowrap rounded-full border px-3.5 text-sm font-bold ${
        active
          ? "border-teal-800 bg-teal-800 text-white"
          : "border-slate-300 bg-white text-slate-800 hover:bg-slate-50"
      }`}
    >
      {children}
    </button>
  );
}

function AppointmentRow({
  a,
  flash,
  onStatus,
}: {
  a: Appointment;
  flash: boolean;
  onStatus: (id: string, s: Status) => void;
}) {
  const p = getPatient(a.patient);
  if (!p) return null;
  const owner = getOwner(p.owner);
  const vet = getVet(a.vet);
  const muted = a.status === "done" || a.status === "cancelled";
  const end = fmtMinutes(toMinutes(a.start) + a.minutes);

  const edge = a.urgent && !muted ? "border-l-amber-500" : a.status === "in_exam" ? "border-l-violet-700" : "border-l-transparent";
  const bg = a.urgent && !muted ? "bg-amber-50" : "bg-white";

  return (
    <li
      aria-label={`${fmtTime(a.start)}, ${p.name}, ${STATUS_LABEL[a.status]}${a.urgent ? ", urgent" : ""}`}
      className={`rounded-2xl border border-l-[6px] border-slate-200 ${edge} ${bg} p-3.5 shadow-sm sm:p-4 ${
        flash ? "ring-2 ring-teal-600" : ""
      }`}
    >
      <div className={`grid gap-x-4 gap-y-3 sm:grid-cols-[6.5rem_minmax(0,1fr)_auto] ${muted ? "text-slate-700" : ""}`}>
        <div className="flex items-baseline gap-2 sm:block">
          <p className="text-lg font-extrabold tabular-nums leading-tight">{fmtTime(a.start)}</p>
          <p className="text-xs text-slate-600">
            until {end} &middot; {a.minutes} min
          </p>
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
            <span className="grid size-8 place-items-center rounded-full bg-teal-100 text-teal-900">
              <SpeciesIcon species={p.species} className="size-4.5" />
            </span>
            <Link
              href={`/patients/${p.id}`}
              className={`text-lg font-extrabold underline-offset-2 hover:underline ${a.status === "cancelled" ? "line-through" : ""}`}
            >
              {p.name}
            </Link>
            <span className="text-sm text-slate-600">
              {p.species}, {p.breed}
            </span>
            {a.urgent && (
              <span className="inline-flex items-center gap-1 rounded-md bg-amber-500 px-2 py-0.5 text-xs font-extrabold uppercase tracking-wide text-amber-950">
                <Siren aria-hidden className="size-3.5" />
                Urgent
              </span>
            )}
          </div>
          <p className="mt-1 font-medium">{a.reason}</p>
          <p className="text-sm text-slate-600">
            Owner {owner.name} &middot; {owner.phone}
          </p>
          <AlertChips alerts={p.alerts} className="mt-2" />
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 sm:flex-col sm:items-end sm:justify-between">
          <div className="sm:text-right">
            <StatusBadge status={a.status} />
            <p className="mt-1 text-sm text-slate-700">
              {vet.name} <span className="text-slate-500">&middot; {vet.room}</span>
            </p>
          </div>
          <RowActions a={a} name={p.name} onStatus={onStatus} />
        </div>
      </div>
    </li>
  );
}

function RowActions({
  a,
  name,
  onStatus,
}: {
  a: Appointment;
  name: string;
  onStatus: (id: string, s: Status) => void;
}) {
  const base = "inline-flex h-11 items-center gap-1.5 rounded-xl px-4 text-sm font-bold";
  if (a.status === "booked") {
    return (
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onStatus(a.id, "checked_in")}
          className={`${base} bg-teal-700 text-white shadow-sm hover:bg-teal-800`}
        >
          <UserCheck aria-hidden className="size-4.5" />
          Check in<span className="sr-only"> {name}</span>
        </button>
        <button
          type="button"
          onClick={() => onStatus(a.id, "cancelled")}
          aria-label={`Cancel appointment for ${name}`}
          className="grid size-11 place-items-center rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-100"
        >
          <CircleX aria-hidden className="size-5" />
        </button>
      </div>
    );
  }
  if (a.status === "checked_in") {
    return (
      <button
        type="button"
        onClick={() => onStatus(a.id, "in_exam")}
        className={`${base} border border-sky-700 text-sky-900 hover:bg-sky-50`}
      >
        <Stethoscope aria-hidden className="size-4.5" />
        To exam<span className="sr-only"> {name}</span>
      </button>
    );
  }
  if (a.status === "in_exam") {
    return (
      <button
        type="button"
        onClick={() => onStatus(a.id, "done")}
        className={`${base} border border-emerald-700 text-emerald-900 hover:bg-emerald-50`}
      >
        <CircleCheck aria-hidden className="size-4.5" />
        Mark done<span className="sr-only"> {name}</span>
      </button>
    );
  }
  return null;
}
