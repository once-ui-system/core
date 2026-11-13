```css app/globals.css
@import "tailwindcss";

@theme {
  --font-sans: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  --color-canvas: #f3f6f6;
  --color-ink: #14262b;
}

@layer base {
  html {
    background: var(--color-canvas);
    color: var(--color-ink);
    -webkit-text-size-adjust: 100%;
  }

  body {
    min-height: 100dvh;
    background: var(--color-canvas);
  }

  :focus-visible {
    outline: 3px solid var(--color-teal-700);
    outline-offset: 2px;
    border-radius: 4px;
  }

  button,
  a,
  select,
  input {
    touch-action: manipulation;
  }

  dialog::backdrop {
    background: color-mix(in srgb, var(--color-ink) 55%, transparent);
  }
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

```tsx app/layout.tsx
import "./globals.css";

import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: { default: "Pawpoint | Hillside Veterinary Clinic", template: "%s | Pawpoint" },
  description: "Front-desk and records software for Hillside Veterinary Clinic.",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#0f766e" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:font-semibold focus:shadow-lg"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
```

```tsx app/page.tsx
import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Schedule } from "@/components/Schedule";

export const metadata: Metadata = { title: "Today's schedule" };

export default function HomePage() {
  return (
    <>
      <Header />
      <main id="main">
        <Schedule />
      </main>
    </>
  );
}
```

```tsx app/patients/[id]/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ChevronLeft,
  CircleCheck,
  ClipboardList,
  Phone,
  Pill,
  Scale,
  Syringe,
  TriangleAlert,
  TrendingDown,
} from "lucide-react";
import {
  TODAY,
  ageText,
  daysBetween,
  fmtDate,
  fmtTime,
  getOwner,
  getPatient,
  getVet,
  initialAppointments,
  money,
  patients,
  records,
  byTime,
} from "@/lib/data";
import { Header } from "@/components/Header";
import { AlertBanner, SpeciesIcon } from "@/components/Alerts";
import { StatusBadge } from "@/components/StatusBadge";
import { WeightChart } from "@/components/WeightChart";

export function generateStaticParams() {
  return patients.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const p = getPatient(id);
  return { title: p ? `${p.name}, patient record` : "Patient not found" };
}

function Card({
  id,
  title,
  icon,
  aside,
  children,
}: {
  id: string;
  title: string;
  icon: React.ReactNode;
  aside?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section aria-labelledby={id} className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-4 py-3 sm:px-5">
        <h2 id={id} className="flex items-center gap-2 text-lg font-extrabold tracking-tight">
          <span className="text-teal-700">{icon}</span>
          {title}
        </h2>
        {aside}
      </header>
      <div className="px-4 py-4 sm:px-5">{children}</div>
    </section>
  );
}

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-bold uppercase tracking-wide text-slate-600">{label}</dt>
      <dd className="mt-0.5 text-base font-medium">{children}</dd>
    </div>
  );
}

export default async function PatientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const patient = getPatient(id);
  if (!patient) notFound();

  const owner = getOwner(patient.owner);
  const record = records[patient.id];
  const todays = initialAppointments.filter((a) => a.patient === patient.id).sort(byTime);

  const vaccinations = record
    ? record.vaccinations.map((v) => {
        const days = daysBetween(TODAY, v.due);
        return { ...v, days, overdue: days < 0, soon: days >= 0 && days <= 30 };
      })
    : [];
  const overdueCount = vaccinations.filter((v) => v.overdue).length;

  const weights = record?.weights_kg ?? [];
  const firstW = weights[0];
  const lastW = weights[weights.length - 1];
  const delta = firstW && lastW ? lastW.kg - firstW.kg : 0;
  const pct = firstW ? (delta / firstW.kg) * 100 : 0;

  return (
    <>
      <Header />
      <main id="main" className="mx-auto max-w-7xl px-4 pb-16 pt-4 sm:px-6">
        <Link
          href="/"
          className="inline-flex min-h-11 items-center gap-1 rounded-lg pr-3 text-sm font-bold text-teal-800 hover:underline"
        >
          <ChevronLeft aria-hidden className="size-5" />
          Today&rsquo;s schedule
        </Link>

        <div className="mt-1 flex flex-wrap items-center gap-4">
          <span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-teal-700 text-white shadow-sm">
            <SpeciesIcon species={patient.species} className="size-9" />
          </span>
          <div className="min-w-0">
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{patient.name}</h1>
            <p className="text-base text-slate-700">
              {patient.breed} &middot; {patient.species} &middot; {ageText(patient.born, TODAY)} &middot; {patient.sex}
            </p>
            <p className="text-sm text-slate-600">
              Patient {patient.id} &middot; Owner {owner.name}
            </p>
          </div>
        </div>

        <div className="mt-4">
          <AlertBanner name={patient.name} alerts={patient.alerts} />
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:items-start">
          <div className="grid min-w-0 gap-5">
            {record ? (
              <>
                <Card
                  id="weight-h"
                  title="Weight trend"
                  icon={<Scale aria-hidden className="size-5" />}
                  aside={
                    <p className="flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-sm font-bold text-red-800 ring-1 ring-red-200">
                      <TrendingDown aria-hidden className="size-4" />
                      {delta.toFixed(1)} kg ({pct.toFixed(0)}%) since {fmtDate(firstW.date)}
                    </p>
                  }
                >
                  <WeightChart points={weights} name={patient.name} />
                  <p className="mt-2 text-sm text-slate-700">
                    Now <strong>{lastW.kg.toFixed(1)} kg</strong>, down {Math.abs(lastW.kg - weights[weights.length - 2].kg).toFixed(1)} kg since{" "}
                    {fmtDate(weights[weights.length - 2].date)}. Weighed at {weights.length} visits.
                  </p>
                </Card>

                <Card
                  id="vax-h"
                  title="Vaccinations"
                  icon={<Syringe aria-hidden className="size-5" />}
                  aside={
                    overdueCount > 0 ? (
                      <p className="flex items-center gap-1.5 rounded-full bg-red-700 px-3 py-1 text-sm font-bold text-white">
                        <TriangleAlert aria-hidden className="size-4" />
                        {overdueCount} overdue
                      </p>
                    ) : (
                      <p className="flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-sm font-bold text-emerald-900">
                        <CircleCheck aria-hidden className="size-4" />
                        All up to date
                      </p>
                    )
                  }
                >
                  <ul className="grid gap-2">
                    {vaccinations.map((v) => (
                      <li
                        key={v.name}
                        className={`grid gap-x-4 gap-y-1 rounded-xl px-3.5 py-3 sm:grid-cols-[1fr_auto] sm:items-center ${
                          v.overdue
                            ? "border-2 border-red-700 bg-red-50"
                            : "border border-slate-200 bg-slate-50"
                        }`}
                      >
                        <div>
                          <p className="text-base font-bold">{v.name}</p>
                          <p className="text-sm text-slate-700">
                            Given {fmtDate(v.given)} &middot; due {fmtDate(v.due)}
                          </p>
                        </div>
                        {v.overdue ? (
                          <p className="inline-flex w-fit items-center gap-1.5 rounded-lg bg-red-700 px-2.5 py-1.5 text-sm font-extrabold text-white">
                            <TriangleAlert aria-hidden className="size-4" />
                            Overdue by {-v.days} days
                          </p>
                        ) : v.soon ? (
                          <p className="inline-flex w-fit rounded-lg bg-amber-200 px-2.5 py-1.5 text-sm font-extrabold text-amber-950">
                            Due in {v.days} days
                          </p>
                        ) : (
                          <p className="inline-flex w-fit items-center gap-1.5 rounded-lg bg-emerald-100 px-2.5 py-1.5 text-sm font-bold text-emerald-900">
                            <CircleCheck aria-hidden className="size-4" />
                            Up to date
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 text-xs text-slate-600">Checked against today, {fmtDate(TODAY)}.</p>
                </Card>

                <Card id="visits-h" title="Visit history" icon={<ClipboardList aria-hidden className="size-5" />}>
                  <ol className="relative grid gap-4 border-l-2 border-teal-100 pl-5">
                    {record.visits.map((v) => (
                      <li key={v.date} className="relative">
                        <span
                          aria-hidden
                          className="absolute -left-[1.78rem] top-1.5 size-3 rounded-full border-2 border-teal-700 bg-white"
                        />
                        <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                          <h3 className="text-base font-bold">
                            {fmtDate(v.date)} <span className="font-medium text-slate-700">&middot; {v.reason}</span>
                          </h3>
                          <p className="text-sm tabular-nums text-slate-600">{money(v.invoice_usd)}</p>
                        </div>
                        <p className="text-sm text-slate-600">{getVet(v.vet).name}</p>
                        <p className="mt-1.5 rounded-lg bg-slate-50 px-3 py-2 text-[15px] leading-relaxed">{v.notes}</p>
                      </li>
                    ))}
                  </ol>
                </Card>
              </>
            ) : (
              <Card id="norec-h" title="Clinical record" icon={<ClipboardList aria-hidden className="size-5" />}>
                <p className="text-base text-slate-700">
                  No weights, vaccinations, medications or visit notes are on file for {patient.name} in this workspace.
                </p>
              </Card>
            )}
          </div>

          <div className="grid min-w-0 gap-5">
            <Card id="pt-h" title="Patient" icon={<SpeciesIcon species={patient.species} />}>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
                <Fact label="Species">{patient.species}</Fact>
                <Fact label="Breed">{patient.breed}</Fact>
                <Fact label="Born">{fmtDate(patient.born)}</Fact>
                <Fact label="Age">{ageText(patient.born, TODAY)}</Fact>
                <Fact label="Sex">{patient.sex}</Fact>
                <Fact label="Patient ID">{patient.id}</Fact>
              </dl>
            </Card>

            <Card id="owner-h" title="Owner" icon={<Phone aria-hidden className="size-5" />}>
              <p className="text-lg font-bold">{owner.name}</p>
              <a
                href={`tel:${owner.phone.replace(/\s/g, "")}`}
                className="mt-2 inline-flex min-h-11 items-center gap-2 rounded-xl border border-teal-700 px-4 font-bold text-teal-900 hover:bg-teal-50"
              >
                <Phone aria-hidden className="size-4" />
                {owner.phone}
              </a>
            </Card>

            {record && (
              <Card id="meds-h" title="Current medications" icon={<Pill aria-hidden className="size-5" />}>
                <ul className="grid gap-2">
                  {record.medications.map((m) => (
                    <li key={m.name} className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3">
                      <p className="font-bold">{m.name}</p>
                      <p className="text-sm text-slate-700">{m.dose}</p>
                      <p className="text-xs text-slate-600">Since {fmtDate(m.since)}</p>
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            <Card id="today-h" title="Today" icon={<ClipboardList aria-hidden className="size-5" />}>
              {todays.length === 0 ? (
                <p className="text-slate-700">No appointments today.</p>
              ) : (
                <ul className="grid gap-2">
                  {todays.map((a) => (
                    <li key={a.id} className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-bold tabular-nums">{fmtTime(a.start)}</p>
                        <p className="text-sm text-slate-700">
                          {a.reason} &middot; {getVet(a.vet).name}
                        </p>
                      </div>
                      <StatusBadge status={a.status} />
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
        </div>
      </main>
    </>
  );
}
```

```tsx components/Alerts.tsx
import { Bird, Cat, Dog, PawPrint, Rabbit, TriangleAlert } from "lucide-react";

/** Compact red chips used wherever a patient appears in a list. */
export function AlertChips({ alerts, className = "" }: { alerts: string[]; className?: string }) {
  if (alerts.length === 0) return null;
  return (
    <ul aria-label="Medical alerts" className={`flex flex-wrap gap-1.5 ${className}`}>
      {alerts.map((a) => (
        <li
          key={a}
          className="inline-flex items-center gap-1.5 rounded-md bg-red-700 px-2 py-1 text-xs font-bold leading-tight text-white"
        >
          <TriangleAlert aria-hidden className="size-3.5 shrink-0" strokeWidth={2.5} />
          <span>
            <span className="sr-only">Medical alert: </span>
            {a}
          </span>
        </li>
      ))}
    </ul>
  );
}

/** Large banner for the top of a record. */
export function AlertBanner({ name, alerts }: { name: string; alerts: string[] }) {
  if (alerts.length === 0) return null;
  return (
    <section
      aria-label={`Medical alerts for ${name}`}
      className="rounded-2xl border-2 border-red-700 bg-red-50 p-4 shadow-sm sm:p-5"
    >
      <div className="flex items-center gap-2 text-red-800">
        <TriangleAlert aria-hidden className="size-6" strokeWidth={2.5} />
        <h2 className="text-sm font-extrabold uppercase tracking-wider">
          Medical alert{alerts.length > 1 ? "s" : ""}
        </h2>
      </div>
      <ul className="mt-3 grid gap-2 sm:grid-cols-2">
        {alerts.map((a) => (
          <li
            key={a}
            className="flex items-start gap-3 rounded-xl bg-red-700 px-4 py-3 text-lg font-bold leading-snug text-white"
          >
            <TriangleAlert aria-hidden className="mt-1 size-5 shrink-0" strokeWidth={2.5} />
            <span>{a}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function SpeciesIcon({ species, className = "size-5" }: { species: string; className?: string }) {
  const props = { "aria-hidden": true, className } as const;
  switch (species) {
    case "Dog":
      return <Dog {...props} />;
    case "Cat":
      return <Cat {...props} />;
    case "Bird":
      return <Bird {...props} />;
    case "Rabbit":
      return <Rabbit {...props} />;
    default:
      return <PawPrint {...props} />;
  }
}
```

```tsx components/BookingDialog.tsx
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
```

```tsx components/Header.tsx
import Link from "next/link";
import { PawPrint } from "lucide-react";
import { CLINIC, TODAY, USER, fmtLongToday } from "@/lib/data";
import { SearchBox } from "@/components/SearchBox";

export function Header() {
  const initials = USER.name
    .split(" ")
    .map((w) => w[0])
    .join("");
  return (
    <header className="sticky top-0 z-30 border-b border-teal-900/10 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2.5 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5 rounded-lg pr-1">
          <span className="grid size-10 place-items-center rounded-xl bg-teal-700 text-white shadow-sm">
            <PawPrint aria-hidden className="size-6" />
          </span>
          <span className="leading-tight">
            <span className="block text-lg font-extrabold tracking-tight text-teal-900">{CLINIC.product}</span>
            <span className="hidden text-xs font-medium text-slate-600 sm:block">{CLINIC.name}</span>
          </span>
        </Link>

        <div className="order-3 w-full min-w-0 md:order-none md:w-auto md:flex-1 md:max-w-xl">
          <SearchBox />
        </div>

        <div className="ml-auto flex items-center gap-3">
          <p className="hidden text-right text-sm leading-tight lg:block">
            <span className="block font-semibold">{fmtLongToday(TODAY)}</span>
          </p>
          <div className="flex items-center gap-2.5">
            <span
              aria-hidden
              className="grid size-10 place-items-center rounded-full bg-teal-100 text-sm font-bold text-teal-900"
            >
              {initials}
            </span>
            <p className="hidden text-sm leading-tight sm:block">
              <span className="block font-semibold">{USER.name}</span>
              <span className="block text-xs text-slate-600">{USER.role}</span>
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
```

```tsx components/Schedule.tsx
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
```

```tsx components/SearchBox.tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { getOwner, searchPatients } from "@/lib/data";
import { AlertChips, SpeciesIcon } from "@/components/Alerts";

export function SearchBox() {
  const router = useRouter();
  const uid = useId();
  const listId = `${uid}-results`;
  const rootRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  const results = useMemo(() => searchPatients(query), [query]);
  const showPanel = open && query.trim().length > 0;

  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  function go(id: string) {
    setOpen(false);
    setQuery("");
    router.push(`/patients/${id}`);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      setOpen(false);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActive((i) => Math.min(i + 1, Math.max(results.length - 1, 0)));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && results.length > 0) {
      e.preventDefault();
      go(results[Math.min(active, results.length - 1)].id);
    }
  }

  return (
    <div ref={rootRef} role="search" className="relative">
      <label htmlFor={`${uid}-input`} className="sr-only">
        Search patients or owners by name
      </label>
      <Search aria-hidden className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-slate-500" />
      <input
        id={`${uid}-input`}
        type="text"
        role="combobox"
        aria-expanded={showPanel}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={showPanel && results.length > 0 ? `${uid}-opt-${active}` : undefined}
        autoComplete="off"
        value={query}
        placeholder="Find a patient or owner"
        onChange={(e) => {
          setQuery(e.target.value);
          setActive(0);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        className="h-11 w-full rounded-xl border border-slate-300 bg-slate-50 pl-11 pr-10 text-base placeholder:text-slate-500 focus:border-teal-700 focus:bg-white"
      />
      {query && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => {
            setQuery("");
            setOpen(false);
          }}
          className="absolute right-1.5 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-lg text-slate-600 hover:bg-slate-200"
        >
          <X aria-hidden className="size-4" />
        </button>
      )}

      <div
        id={listId}
        role="listbox"
        aria-label="Matching patients"
        hidden={!showPanel}
        className="absolute left-0 right-0 top-full z-40 mt-2 max-h-[70vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl"
      >
        {results.map((p, i) => {
          const owner = getOwner(p.owner);
          return (
            <Link
              key={p.id}
              id={`${uid}-opt-${i}`}
              role="option"
              aria-selected={i === active}
              href={`/patients/${p.id}`}
              onClick={() => {
                setOpen(false);
                setQuery("");
              }}
              onMouseEnter={() => setActive(i)}
              className={`flex items-start gap-3 rounded-xl px-3 py-2.5 ${i === active ? "bg-teal-50" : ""}`}
            >
              <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-full bg-teal-100 text-teal-900">
                <SpeciesIcon species={p.species} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-baseline gap-x-2">
                  <span className="font-bold">{p.name}</span>
                  <span className="text-sm text-slate-600">
                    {p.species}, {p.breed}
                  </span>
                </span>
                <span className="block text-sm text-slate-600">Owner: {owner.name}</span>
                <AlertChips alerts={p.alerts} className="mt-1.5" />
              </span>
            </Link>
          );
        })}
        {results.length === 0 && (
          <p role="status" className="px-3 py-4 text-sm text-slate-600">
            No patient or owner matches &ldquo;{query.trim()}&rdquo;.
          </p>
        )}
      </div>
    </div>
  );
}
```

```tsx components/StatusBadge.tsx
import { Ban, CircleCheck, Clock, Stethoscope, CalendarClock } from "lucide-react";
import type { Status } from "@/lib/data";

export const STATUS_LABEL: Record<Status, string> = {
  booked: "Booked",
  checked_in: "Checked in",
  in_exam: "In exam",
  done: "Done",
  cancelled: "Cancelled",
};

const STYLE: Record<Status, string> = {
  booked: "bg-slate-100 text-slate-800 ring-slate-300",
  checked_in: "bg-sky-100 text-sky-900 ring-sky-300",
  in_exam: "bg-violet-700 text-white ring-violet-700",
  done: "bg-emerald-100 text-emerald-900 ring-emerald-300",
  cancelled: "bg-white text-slate-500 ring-slate-300 line-through",
};

function StatusIcon({ status }: { status: Status }) {
  const cls = "size-3.5";
  switch (status) {
    case "booked":
      return <CalendarClock aria-hidden className={cls} />;
    case "checked_in":
      return <Clock aria-hidden className={cls} />;
    case "in_exam":
      return <Stethoscope aria-hidden className={cls} />;
    case "done":
      return <CircleCheck aria-hidden className={cls} />;
    case "cancelled":
      return <Ban aria-hidden className={cls} />;
  }
}

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset ${STYLE[status]}`}
    >
      <StatusIcon status={status} />
      {STATUS_LABEL[status]}
    </span>
  );
}
```

```tsx components/WeightChart.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { fmtDate, fmtMonthYear, type Weight } from "@/lib/data";

const MARGIN = { top: 30, right: 26, bottom: 34, left: 40 };

export function WeightChart({ points, name }: { points: Weight[]; name: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(640);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setWidth(Math.max(260, Math.round(entry.contentRect.width))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const height = width < 480 ? 220 : 270;
  const n = points.length;
  const time = points.map((p) => Date.parse(`${p.date}T00:00:00Z`));
  const t0 = time[0];
  const t1 = time[n - 1];
  const kgs = points.map((p) => p.kg);
  const yMin = Math.floor(Math.min(...kgs) - 0.5);
  const yMax = Math.ceil(Math.max(...kgs) + 0.5);
  const innerW = width - MARGIN.left - MARGIN.right;
  const innerH = height - MARGIN.top - MARGIN.bottom;
  const x = (i: number) => MARGIN.left + (t1 === t0 ? 0 : ((time[i] - t0) / (t1 - t0)) * innerW);
  const y = (kg: number) => MARGIN.top + (1 - (kg - yMin) / (yMax - yMin)) * innerH;
  const ticks: number[] = [];
  for (let v = yMin; v <= yMax; v += 1) ticks.push(v);

  const line = points.map((p, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)} ${y(p.kg).toFixed(1)}`).join(" ");
  const area = `${line} L${x(n - 1).toFixed(1)} ${MARGIN.top + innerH} L${x(0).toFixed(1)} ${MARGIN.top + innerH} Z`;
  const narrow = width < 480;
  const showX = (i: number) => !narrow || i === 0 || i === n - 1 || (i % 2 === 0 && i < n - 2);

  const first = points[0];
  const last = points[n - 1];

  return (
    <div>
      <div ref={ref} className="w-full">
        <svg
          role="img"
          aria-label={`${name}'s weight over ${n} visits: from ${first.kg} kilograms on ${fmtDate(first.date)} to ${last.kg} kilograms on ${fmtDate(last.date)}`}
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          className="block"
        >
          {ticks.map((v) => (
            <g key={v}>
              <line x1={MARGIN.left} x2={width - MARGIN.right} y1={y(v)} y2={y(v)} className="stroke-slate-200" strokeWidth={1} />
              <text x={MARGIN.left - 8} y={y(v) + 4} textAnchor="end" fontSize={12} className="fill-slate-600">
                {v}
              </text>
            </g>
          ))}
          <text x={MARGIN.left - 8} y={14} textAnchor="end" fontSize={11} fontWeight={700} className="fill-slate-600">
            kg
          </text>
          <path d={area} className="fill-teal-700/10" />
          <path d={line} fill="none" className="stroke-teal-700" strokeWidth={3} strokeLinejoin="round" strokeLinecap="round" />
          {points.map((p, i) => {
            const isLast = i === n - 1;
            return (
              <g key={p.date}>
                <circle
                  cx={x(i)}
                  cy={y(p.kg)}
                  r={isLast ? 6 : 4.5}
                  className={isLast ? "fill-red-700 stroke-red-700" : "fill-white stroke-teal-700"}
                  strokeWidth={2.5}
                />
                <text
                  x={i === 0 ? x(i) - 6 : x(i)}
                  y={y(p.kg) - 11}
                  textAnchor={i === 0 ? "start" : "middle"}
                  fontSize={12}
                  fontWeight={isLast ? 800 : 600}
                  className={isLast ? "fill-red-700" : "fill-slate-900"}
                >
                  {p.kg.toFixed(1)}
                </text>
                {showX(i) && (
                  <text x={x(i)} y={height - 10} textAnchor="middle" fontSize={12} className="fill-slate-600">
                    {fmtMonthYear(p.date)}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      <table className="sr-only">
        <caption>{name}&rsquo;s recorded weights</caption>
        <thead>
          <tr>
            <th scope="col">Date</th>
            <th scope="col">Weight (kg)</th>
          </tr>
        </thead>
        <tbody>
          {points.map((p) => (
            <tr key={p.date}>
              <td>{fmtDate(p.date)}</td>
              <td>{p.kg}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

```ts lib/data.ts
export type Status = "booked" | "checked_in" | "in_exam" | "done" | "cancelled";

export interface Vet {
  id: string;
  name: string;
  room: string;
}

export interface Owner {
  id: string;
  name: string;
  phone: string;
}

export interface Patient {
  id: string;
  name: string;
  species: string;
  breed: string;
  born: string;
  sex: string;
  owner: string;
  alerts: string[];
}

export interface Appointment {
  id: string;
  patient: string;
  vet: string;
  start: string;
  minutes: number;
  reason: string;
  status: Status;
  urgent?: boolean;
  /** Minutes since midnight at which the patient was checked in. */
  checkedInAt?: number;
}

export interface Weight {
  date: string;
  kg: number;
}

export interface Vaccination {
  name: string;
  given: string;
  due: string;
}

export interface Medication {
  name: string;
  dose: string;
  since: string;
}

export interface Visit {
  date: string;
  vet: string;
  reason: string;
  notes: string;
  invoice_usd: number;
}

export interface PatientRecord {
  weights_kg: Weight[];
  vaccinations: Vaccination[];
  medications: Medication[];
  visits: Visit[];
}

export const CLINIC = {
  product: "Pawpoint",
  name: "Hillside Veterinary Clinic",
  tagline: "Front-desk and records software for Hillside Veterinary Clinic",
};

export const TODAY = "2026-11-12";
/** The simulated clock at the counter: 9:52 AM. */
export const NOW_MINUTES = 9 * 60 + 52;

export const USER = { name: "Rosa Lindqvist", role: "Receptionist" };

export const vets: Vet[] = [
  { id: "v-1", name: "Dr. Amara Osei", room: "Exam 1" },
  { id: "v-2", name: "Dr. Tomás Reyes", room: "Exam 2" },
  { id: "v-3", name: "Dr. Helen Park", room: "Surgery" },
];

export const owners: Owner[] = [
  { id: "o-1", name: "Daniel Kim", phone: "+1 555 0142" },
  { id: "o-2", name: "Priya Natarajan", phone: "+1 555 0178" },
  { id: "o-3", name: "Lucas Moreau", phone: "+1 555 0119" },
  { id: "o-4", name: "Grace Whitfield", phone: "+1 555 0163" },
  { id: "o-5", name: "Sam Oduya", phone: "+1 555 0190" },
  { id: "o-6", name: "Elena Rossi", phone: "+1 555 0105" },
];

export const patients: Patient[] = [
  {
    id: "p-101",
    name: "Biscuit",
    species: "Dog",
    breed: "Beagle",
    born: "2019-04-02",
    sex: "Male, neutered",
    owner: "o-1",
    alerts: [],
  },
  {
    id: "p-102",
    name: "Mochi",
    species: "Cat",
    breed: "Domestic shorthair",
    born: "2021-07-15",
    sex: "Female, spayed",
    owner: "o-2",
    alerts: ["Bites when restrained"],
  },
  {
    id: "p-103",
    name: "Pepper",
    species: "Dog",
    breed: "Border collie",
    born: "2016-01-20",
    sex: "Female, spayed",
    owner: "o-3",
    alerts: [],
  },
  {
    id: "p-104",
    name: "Olive",
    species: "Dog",
    breed: "Labrador retriever",
    born: "2014-09-08",
    sex: "Female, spayed",
    owner: "o-4",
    alerts: ["Penicillin allergy", "Chronic kidney disease, stage 2"],
  },
  {
    id: "p-105",
    name: "Kiwi",
    species: "Bird",
    breed: "Budgerigar",
    born: "2023-03-11",
    sex: "Male",
    owner: "o-5",
    alerts: [],
  },
  {
    id: "p-106",
    name: "Tofu",
    species: "Rabbit",
    breed: "Holland lop",
    born: "2022-05-30",
    sex: "Female",
    owner: "o-6",
    alerts: [],
  },
  {
    id: "p-107",
    name: "Ziggy",
    species: "Cat",
    breed: "Maine coon",
    born: "2018-11-02",
    sex: "Male, neutered",
    owner: "o-2",
    alerts: ["Diabetic: insulin twice daily"],
  },
  {
    id: "p-108",
    name: "Bruno",
    species: "Dog",
    breed: "French bulldog",
    born: "2022-02-14",
    sex: "Male",
    owner: "o-5",
    alerts: ["Brachycephalic: sedation risk"],
  },
];

export const initialAppointments: Appointment[] = [
  { id: "a-01", patient: "p-101", vet: "v-1", start: "08:30", minutes: 20, reason: "Annual vaccination", status: "done" },
  { id: "a-02", patient: "p-104", vet: "v-2", start: "08:30", minutes: 30, reason: "Kidney panel recheck", status: "done" },
  { id: "a-03", patient: "p-108", vet: "v-3", start: "08:00", minutes: 120, reason: "Soft palate surgery", status: "in_exam" },
  { id: "a-04", patient: "p-102", vet: "v-1", start: "09:00", minutes: 30, reason: "Limping, left hind leg", status: "in_exam" },
  { id: "a-05", patient: "p-107", vet: "v-2", start: "09:15", minutes: 20, reason: "Glucose curve", status: "checked_in", checkedInAt: 9 * 60 + 8 },
  { id: "a-06", patient: "p-105", vet: "v-1", start: "09:45", minutes: 20, reason: "Beak and nail trim", status: "checked_in", checkedInAt: 9 * 60 + 38 },
  { id: "a-07", patient: "p-103", vet: "v-2", start: "10:00", minutes: 30, reason: "Senior wellness exam", status: "booked" },
  { id: "a-08", patient: "p-106", vet: "v-1", start: "10:30", minutes: 20, reason: "Not eating since yesterday", status: "booked", urgent: true },
  { id: "a-09", patient: "p-104", vet: "v-3", start: "11:00", minutes: 45, reason: "Dental cleaning", status: "booked" },
  { id: "a-10", patient: "p-101", vet: "v-2", start: "11:30", minutes: 20, reason: "Ear infection follow-up", status: "booked" },
  { id: "a-11", patient: "p-107", vet: "v-1", start: "13:30", minutes: 30, reason: "Dental check", status: "booked" },
  { id: "a-12", patient: "p-103", vet: "v-3", start: "14:00", minutes: 60, reason: "Lump removal", status: "cancelled" },
  { id: "a-13", patient: "p-102", vet: "v-2", start: "15:00", minutes: 20, reason: "X-ray results", status: "booked" },
];

export const records: Record<string, PatientRecord> = {
  "p-104": {
    weights_kg: [
      { date: "2025-05-14", kg: 31.8 },
      { date: "2025-08-20", kg: 31.1 },
      { date: "2025-11-03", kg: 30.4 },
      { date: "2026-02-11", kg: 29.9 },
      { date: "2026-06-17", kg: 29.2 },
      { date: "2026-11-12", kg: 28.6 },
    ],
    vaccinations: [
      { name: "Rabies", given: "2024-10-02", due: "2027-10-02" },
      { name: "DHPP", given: "2025-10-15", due: "2026-10-15" },
      { name: "Leptospirosis", given: "2025-10-15", due: "2026-10-15" },
      { name: "Bordetella", given: "2026-04-08", due: "2027-04-08" },
    ],
    medications: [
      { name: "Benazepril 5 mg", dose: "1 tablet daily", since: "2025-08-20" },
      { name: "Renal diet (dry)", dose: "2.5 cups daily", since: "2025-08-20" },
    ],
    visits: [
      {
        date: "2026-11-12",
        vet: "v-2",
        reason: "Kidney panel recheck",
        notes: "Creatinine 2.1 mg/dL (was 2.0). Weight down 0.6 kg. Continue benazepril, recheck in 3 months.",
        invoice_usd: 186.0,
      },
      {
        date: "2026-06-17",
        vet: "v-2",
        reason: "Kidney panel recheck",
        notes: "Stable. Appetite good. Owner reports more drinking in hot weather.",
        invoice_usd: 172.5,
      },
      {
        date: "2026-02-11",
        vet: "v-1",
        reason: "Coughing",
        notes: "Mild kennel cough. Supportive care; no antibiotics given (penicillin allergy).",
        invoice_usd: 94.0,
      },
      {
        date: "2025-11-03",
        vet: "v-2",
        reason: "Senior wellness exam",
        notes: "Grade 2 dental tartar. Dental cleaning recommended.",
        invoice_usd: 148.0,
      },
    ],
  },
};

/* ---------- lookups ---------- */

export const getVet = (id: string): Vet => vets.find((v) => v.id === id) ?? vets[0];
export const getOwner = (id: string): Owner => owners.find((o) => o.id === id) ?? owners[0];
export const getPatient = (id: string): Patient | undefined => patients.find((p) => p.id === id);

/* ---------- time and date helpers (deterministic, no locale or timezone) ---------- */

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

export function fromMinutes(total: number): string {
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** "13:30" becomes "1:30 PM". */
export function fmtTime(hhmm: string): string {
  const total = toMinutes(hhmm);
  const h = Math.floor(total / 60);
  const m = total % 60;
  const suffix = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${suffix}`;
}

export const fmtMinutes = (total: number): string => fmtTime(fromMinutes(total));

function parts(iso: string): [number, number, number] {
  const [y, m, d] = iso.split("-").map(Number);
  return [y, m, d];
}

/** "2026-11-12" becomes "Nov 12, 2026". */
export function fmtDate(iso: string): string {
  const [y, m, d] = parts(iso);
  return `${MONTHS[m - 1]} ${d}, ${y}`;
}

export function fmtMonthYear(iso: string): string {
  const [y, m] = parts(iso);
  return `${MONTHS[m - 1]} ’${String(y).slice(2)}`;
}

export function fmtLongToday(iso: string): string {
  const [y, m, d] = parts(iso);
  const wd = WEEKDAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
  return `${wd}, ${MONTHS[m - 1]} ${d}, ${y}`;
}

const dayNumber = (iso: string): number => {
  const [y, m, d] = parts(iso);
  return Math.round(Date.UTC(y, m - 1, d) / 86_400_000);
};

/** Whole days from a to b (positive when b is later). */
export const daysBetween = (a: string, b: string): number => dayNumber(b) - dayNumber(a);

export function ageText(born: string, today: string): string {
  const [by, bm, bd] = parts(born);
  const [ty, tm, td] = parts(today);
  let months = (ty - by) * 12 + (tm - bm);
  if (td < bd) months -= 1;
  const years = Math.floor(months / 12);
  const rest = months % 12;
  if (years < 1) return `${rest} mo`;
  return rest === 0 ? `${years} yr` : `${years} yr ${rest} mo`;
}

export function waitText(minutes: number): string {
  const m = Math.max(0, minutes);
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const r = m % 60;
  return r === 0 ? `${h} h` : `${h} h ${r} min`;
}

export const money = (n: number): string => `$${n.toFixed(2)}`;

/* ---------- scheduling ---------- */

export const DAY_START = 8 * 60;
export const DAY_END = 18 * 60;

/** The live appointment that overlaps [start, start + minutes) for the vet, if any. */
export function findClash(
  list: Appointment[],
  vetId: string,
  startMin: number,
  minutes: number,
): Appointment | undefined {
  const end = startMin + minutes;
  return list.find((a) => {
    if (a.vet !== vetId || a.status === "cancelled") return false;
    const s = toMinutes(a.start);
    return startMin < s + a.minutes && s < end;
  });
}

export const byTime = (a: Appointment, b: Appointment): number =>
  toMinutes(a.start) - toMinutes(b.start) || a.vet.localeCompare(b.vet) || a.id.localeCompare(b.id);

/* ---------- search ---------- */

export function searchPatients(query: string): Patient[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return patients.filter((p) => {
    const owner = getOwner(p.owner).name.toLowerCase();
    return p.name.toLowerCase().includes(q) || owner.includes(q);
  });
}
```

