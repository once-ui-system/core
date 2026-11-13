```css app/globals.css
@import "tailwindcss";

@theme {
  --font-sans: "Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}

:root {
  color-scheme: light;
}

html {
  -webkit-text-size-adjust: 100%;
  scroll-padding-top: 6rem;
}

:focus-visible {
  outline: 3px solid #0f766e;
  outline-offset: 2px;
}

input:focus-visible,
select:focus-visible {
  outline-offset: 0;
}

button:not(:disabled),
summary,
select {
  cursor: pointer;
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    scroll-behavior: auto !important;
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
  }
}
```

```tsx app/layout.tsx
import "./globals.css";

import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { ClinicProvider } from "@/lib/store";

export const metadata: Metadata = {
  title: "Pawpoint · Hillside Veterinary Clinic",
  description: "Front-desk and records software for Hillside Veterinary Clinic",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-dvh bg-slate-100 font-sans text-slate-900 antialiased">
        <ClinicProvider>
          <AppShell>{children}</AppShell>
        </ClinicProvider>
      </body>
    </html>
  );
}
```

```tsx app/page.tsx
import { Schedule } from "@/components/Schedule";

export default function Page() {
  return <Schedule />;
}
```

```tsx app/patients/[id]/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, CircleCheck, Phone, Pill, Scale, Stethoscope, Syringe, TriangleAlert } from "lucide-react";
import { AlertChips } from "@/components/AlertChips";
import { BookAppointment } from "@/components/BookAppointment";
import { PatientToday } from "@/components/PatientToday";
import { WeightChart } from "@/components/WeightChart";
import { PATIENTS, RECORDS, TODAY, ageText, daysBetween, fmtDate, getOwner, getPatient, getVet } from "@/lib/data";

export function generateStaticParams() {
  return PATIENTS.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const p = getPatient(id);
  return { title: p ? `${p.name} · Pawpoint` : "Patient · Pawpoint" };
}

function Card({ title, icon, children, id }: { title: string; icon: React.ReactNode; children: React.ReactNode; id: string }) {
  return (
    <section aria-labelledby={id} className="rounded-2xl border border-slate-200 bg-white">
      <h2 id={id} className="flex items-center gap-2 border-b border-slate-100 px-5 py-3.5 text-lg font-bold">
        <span aria-hidden className="text-teal-700">
          {icon}
        </span>
        {title}
      </h2>
      <div className="px-5 py-4">{children}</div>
    </section>
  );
}

const usd = (n: number) => `$${n.toFixed(2)}`;

export default async function PatientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const patient = getPatient(id);
  if (!patient) notFound();
  const owner = getOwner(patient.owner);
  const record = RECORDS[patient.id];

  const vaccines = record?.vaccinations.map((v) => ({ ...v, overdueDays: daysBetween(v.due, TODAY) })) ?? [];
  const overdue = vaccines.filter((v) => v.overdueDays > 0);

  return (
    <div className="space-y-5">
      <Link href="/" className="inline-flex h-11 items-center gap-2 rounded-lg pr-3 text-sm font-semibold text-teal-800 hover:underline">
        <ArrowLeft aria-hidden className="size-4" />
        Today&apos;s schedule
      </Link>

      <header className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-4">
            <span aria-hidden className="grid size-16 shrink-0 place-items-center rounded-2xl bg-teal-700 text-3xl font-bold text-white">
              {patient.name[0]}
            </span>
            <div className="min-w-0">
              <h1 className="text-3xl font-bold tracking-tight">{patient.name}</h1>
              <p className="text-base text-slate-700">
                {patient.species} · {patient.breed}
              </p>
            </div>
          </div>
          <BookAppointment patientId={patient.id} label="Book follow-up" />
        </div>

        <dl className="mt-5 grid gap-x-8 gap-y-4 border-t border-slate-100 pt-5 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-600">Age</dt>
            <dd className="text-base font-medium">
              {ageText(patient.born)} <span className="text-slate-600">(born {fmtDate(patient.born)})</span>
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-600">Sex</dt>
            <dd className="text-base font-medium">{patient.sex}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-600">Owner</dt>
            <dd className="text-base font-medium">{owner.name}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-600">Owner phone</dt>
            <dd>
              <a href={`tel:${owner.phone.replace(/\s/g, "")}`} className="inline-flex min-h-11 items-center gap-2 text-base font-medium text-teal-800 hover:underline">
                <Phone aria-hidden className="size-4" />
                {owner.phone}
              </a>
            </dd>
          </div>
        </dl>
      </header>

      {patient.alerts.length > 0 && (
        <section aria-labelledby="alerts-h" className="rounded-2xl border-2 border-red-700 bg-red-50 p-5">
          <h2 id="alerts-h" className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-red-800">
            <TriangleAlert aria-hidden className="size-5" strokeWidth={2.5} />
            Medical alerts · read before handling
          </h2>
          <AlertChips alerts={patient.alerts} size="md" className="mt-3 [&_li]:text-base sm:[&_li]:text-lg [&_li]:px-4 [&_li]:py-2" />
        </section>
      )}

      {overdue.length > 0 && (
        <p role="note" className="flex items-start gap-2 rounded-xl bg-amber-100 px-4 py-3 text-sm font-semibold text-amber-950 ring-1 ring-amber-400">
          <Syringe aria-hidden className="mt-0.5 size-4 shrink-0" />
          {overdue.length} vaccination{overdue.length === 1 ? "" : "s"} overdue: {overdue.map((v) => v.name).join(", ")}. Offer to book today.
        </p>
      )}

      <Card id="today-h" title="Today" icon={<Stethoscope className="size-5" />}>
        <PatientToday patientId={patient.id} />
      </Card>

      {!record ? (
        <p className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-8 text-center text-slate-600">
          No weights, vaccinations, medications or visit notes are on file for {patient.name} yet.
        </p>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
          <div className="space-y-5">
            <Card id="weight-h" title="Weight trend" icon={<Scale className="size-5" />}>
              <WeightChart points={record.weights_kg} name={patient.name} />
            </Card>

            <Card id="visits-h" title="Visit history" icon={<Stethoscope className="size-5" />}>
              <ol className="space-y-5">
                {record.visits.map((v, i) => (
                  <li key={v.date} className="relative border-l-2 border-slate-200 pl-5">
                    <span aria-hidden className={`absolute -left-[7px] top-1.5 size-3 rounded-full border-2 border-white ${i === 0 ? "bg-teal-700" : "bg-slate-400"}`} />
                    <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                      <p className="text-base font-bold">
                        {v.reason}
                        {v.date === TODAY && <span className="ml-2 rounded bg-teal-100 px-1.5 py-0.5 align-middle text-xs font-bold text-teal-900">Today</span>}
                      </p>
                      <p className="text-sm tabular-nums text-slate-600">{fmtDate(v.date)}</p>
                    </div>
                    <p className="text-sm text-slate-600">
                      {getVet(v.vet).name} · invoice {usd(v.invoice_usd)}
                    </p>
                    <p className="mt-1.5 text-base leading-relaxed text-slate-800">{v.notes}</p>
                  </li>
                ))}
              </ol>
            </Card>
          </div>

          <div className="space-y-5">
            <Card id="vacc-h" title="Vaccinations" icon={<Syringe className="size-5" />}>
              <ul className="space-y-2.5">
                {vaccines.map((v) => {
                  const late = v.overdueDays > 0;
                  return (
                    <li
                      key={v.name}
                      className={`rounded-lg border px-3.5 py-3 ${late ? "border-red-600 bg-red-50" : "border-slate-200 bg-white"}`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-base font-bold">{v.name}</p>
                        {late ? (
                          <span className="inline-flex items-center gap-1.5 rounded-md bg-red-700 px-2 py-0.5 text-xs font-bold text-white">
                            <TriangleAlert aria-hidden className="size-3.5" />
                            Overdue {v.overdueDays} days
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-900">
                            <CircleCheck aria-hidden className="size-3.5" />
                            Up to date
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-sm text-slate-700">
                        Given {fmtDate(v.given)} · <span className={late ? "font-semibold text-red-800" : ""}>due {fmtDate(v.due)}</span>
                      </p>
                    </li>
                  );
                })}
              </ul>
            </Card>

            <Card id="meds-h" title="Current medications" icon={<Pill className="size-5" />}>
              <ul className="divide-y divide-slate-100">
                {record.medications.map((m) => (
                  <li key={m.name} className="py-2.5 first:pt-0 last:pb-0">
                    <p className="text-base font-bold">{m.name}</p>
                    <p className="text-sm text-slate-700">
                      {m.dose} · since {fmtDate(m.since)}
                    </p>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
```

```tsx components/AlertChips.tsx
import { TriangleAlert } from "lucide-react";

/** Medical alerts: always solid red with an icon and the word "Alert" for screen readers. */
export function AlertChips({ alerts, size = "sm", className = "" }: { alerts: string[]; size?: "sm" | "md"; className?: string }) {
  if (alerts.length === 0) return null;
  const cls = size === "md" ? "px-3 py-1.5 text-sm" : "px-2 py-0.5 text-xs";
  return (
    <ul aria-label="Medical alerts" className={`flex flex-wrap gap-1.5 ${className}`}>
      {alerts.map((a) => (
        <li
          key={a}
          className={`inline-flex items-center gap-1.5 rounded-md bg-red-700 font-semibold leading-snug text-white ring-1 ring-red-900/20 ${cls}`}
        >
          <TriangleAlert aria-hidden className={size === "md" ? "size-4 shrink-0" : "size-3.5 shrink-0"} strokeWidth={2.5} />
          <span className="sr-only">Medical alert: </span>
          {a}
        </li>
      ))}
    </ul>
  );
}
```

```tsx components/AppShell.tsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { CircleCheck, PawPrint, Search, X } from "lucide-react";
import { CLINIC, OWNERS, PATIENTS, PRODUCT, USER, getOwner } from "@/lib/data";
import { useClinic } from "@/lib/store";
import { AlertChips } from "./AlertChips";

function PatientSearch() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const listId = useId();

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return [];
    return PATIENTS.filter((p) => {
      const owner = OWNERS.find((o) => o.id === p.owner);
      return p.name.toLowerCase().includes(term) || (owner?.name.toLowerCase().includes(term) ?? false);
    });
  }, [q]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      const typing = el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT");
      if (e.key === "/" && !typing) {
        e.preventDefault();
        input.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const go = (id: string) => {
    setQ("");
    setOpen(false);
    router.push(`/patients/${id}`);
  };
  const showPanel = open && q.trim().length > 0;

  return (
    <div
      ref={wrap}
      role="search"
      className="relative w-full"
      onBlur={(e) => {
        if (!wrap.current?.contains(e.relatedTarget as Node | null)) setOpen(false);
      }}
    >
      <label htmlFor={`${listId}-input`} className="sr-only">
        Find a patient or owner
      </label>
      <Search aria-hidden className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
      <input
        ref={input}
        id={`${listId}-input`}
        type="search"
        value={q}
        autoComplete="off"
        placeholder="Find a patient or owner"
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            setQ("");
            setOpen(false);
          }
          if (e.key === "Enter" && results[0]) go(results[0].id);
        }}
        className="h-12 w-full rounded-xl border border-slate-300 bg-slate-50 pl-11 pr-14 text-base text-slate-900 placeholder:text-slate-500 hover:border-slate-400 focus:border-teal-700 focus:bg-white md:h-11"
      />
      <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded border border-slate-300 bg-white px-1.5 text-xs font-medium text-slate-500 lg:block">/</kbd>
      <div id={listId} className={showPanel ? "absolute inset-x-0 top-full z-40 mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10" : "hidden"}>
        {showPanel && (
          <>
            <p className="sr-only" role="status">
              {results.length} {results.length === 1 ? "match" : "matches"}
            </p>
            {results.length === 0 ? (
              <p className="px-4 py-3 text-sm text-slate-600">No patient or owner matches “{q.trim()}”.</p>
            ) : (
              <ul className="max-h-[60vh] divide-y divide-slate-100 overflow-y-auto">
                {results.map((p) => (
                  <li key={p.id}>
                    <Link
                      href={`/patients/${p.id}`}
                      onClick={() => {
                        setQ("");
                        setOpen(false);
                      }}
                      className="block px-4 py-3 hover:bg-teal-50 focus-visible:bg-teal-50"
                    >
                      <span className="flex items-baseline justify-between gap-3">
                        <span className="text-base font-semibold text-slate-900">{p.name}</span>
                        <span className="text-sm text-slate-600">{p.species} · {p.breed}</span>
                      </span>
                      <span className="block text-sm text-slate-600">Owner: {getOwner(p.owner).name}</span>
                      <AlertChips alerts={p.alerts} className="mt-1.5" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function Toast() {
  const { notice, dismissNotice } = useClinic();
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-4" role="status" aria-live="polite">
      {notice && (
        <div className="pointer-events-auto flex items-center gap-3 rounded-xl bg-slate-900 py-3 pl-4 pr-2 text-sm font-medium text-white shadow-xl">
          <CircleCheck aria-hidden className="size-5 shrink-0 text-emerald-400" />
          <span>{notice}</span>
          <button type="button" onClick={dismissNotice} aria-label="Dismiss message" className="grid size-9 place-items-center rounded-lg hover:bg-white/10">
            <X aria-hidden className="size-4" />
          </button>
        </div>
      )}
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const onSchedule = path === "/";
  const initials = USER.name.split(" ").map((s) => s[0]).join("");
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:font-semibold focus:shadow-lg">
        Skip to content
      </a>
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2.5 md:flex-nowrap md:px-6">
          <Link href="/" className="flex shrink-0 items-center gap-2.5 rounded-lg pr-1">
            <span className="grid size-10 place-items-center rounded-xl bg-teal-700 text-white">
              <PawPrint aria-hidden className="size-6" />
            </span>
            <span className="leading-tight">
              <span className="block text-lg font-bold tracking-tight text-slate-900">{PRODUCT}</span>
              <span className="hidden text-xs text-slate-600 sm:block">{CLINIC}</span>
            </span>
          </Link>
          <nav aria-label="Main" className="ml-1 hidden md:block">
            <Link
              href="/"
              aria-current={onSchedule ? "page" : undefined}
              className={`rounded-lg px-3 py-2 text-sm font-semibold ${onSchedule ? "bg-teal-50 text-teal-800" : "text-slate-600 hover:bg-slate-100"}`}
            >
              Schedule
            </Link>
          </nav>
          <div className="order-last w-full md:order-none md:mx-auto md:max-w-md md:flex-1">
            <PatientSearch />
          </div>
          <div className="ml-auto flex items-center gap-3 md:ml-0">
            <div className="hidden text-right leading-tight lg:block">
              <p className="text-sm font-semibold text-slate-900">{USER.name}</p>
              <p className="text-xs text-slate-600">{USER.role}</p>
            </div>
            <span aria-hidden className="grid size-10 place-items-center rounded-full bg-slate-800 text-sm font-semibold text-white">
              {initials}
            </span>
            <span className="sr-only">{USER.name}, {USER.role}</span>
          </div>
        </div>
      </header>
      <main id="main" className="mx-auto w-full max-w-7xl px-4 pb-24 pt-5 md:px-6 md:pt-7">
        {children}
      </main>
      <Toast />
    </>
  );
}
```

```tsx components/BookAppointment.tsx
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
```

```tsx components/PatientToday.tsx
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
```

```tsx components/Schedule.tsx
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Clock, DoorOpen, Siren, UserCheck } from "lucide-react";
import { TODAY, VETS, fmtDate, fmtTime, fromMin, getOwner, getPatient, getVet, toMin, type Appointment } from "@/lib/data";
import { useClinic } from "@/lib/store";
import { AlertChips } from "./AlertChips";
import { BookAppointment } from "./BookAppointment";
import { StatusBadge } from "./StatusBadge";

const endTime = (a: Appointment) => fromMin(toMin(a.start) + a.minutes);

function waitText(mins: number): string {
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min`;
  return `${Math.floor(mins / 60)} h ${mins % 60} min`;
}

function Stat({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
      <p className={`text-3xl font-bold tabular-nums ${tone}`}>{value}</p>
      <p className="text-sm font-medium text-slate-600">{label}</p>
    </div>
  );
}

function WaitingList() {
  const { appointments, now } = useClinic();
  const waiting = appointments
    .filter((a) => a.status === "checked_in")
    .sort((a, b) => toMin(a.start) - toMin(b.start));
  const inExam = appointments.filter((a) => a.status === "in_exam");

  return (
    <aside aria-labelledby="waiting-h" className="grid gap-4 md:grid-cols-2 xl:sticky xl:top-24 xl:grid-cols-1 xl:self-start">
      <section className="rounded-2xl border border-slate-200 bg-white">
        <header className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <h2 id="waiting-h" className="flex items-center gap-2 text-lg font-bold">
            <Clock aria-hidden className="size-5 text-amber-600" />
            Waiting room
          </h2>
          <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-sm font-bold tabular-nums text-amber-900">{waiting.length}</span>
        </header>
        {waiting.length === 0 ? (
          <p className="px-4 py-6 text-sm text-slate-600">Nobody is waiting. Checked-in patients appear here.</p>
        ) : (
          <ol className="divide-y divide-slate-100">
            {waiting.map((a, i) => {
              const p = getPatient(a.patient);
              if (!p) return null;
              const since = a.checkedInAt ? toMin(a.checkedInAt) : now;
              const mins = Math.max(0, now - since);
              const long = mins >= 30;
              return (
                <li key={a.id} className="px-4 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="flex flex-wrap items-center gap-2">
                        <Link href={`/patients/${p.id}`} className="text-base font-semibold text-slate-900 underline-offset-2 hover:underline">
                          {p.name}
                        </Link>
                        {i === 0 && <span className="rounded bg-teal-700 px-1.5 py-0.5 text-xs font-bold uppercase tracking-wide text-white">Next</span>}
                      </p>
                      <p className="text-sm text-slate-600">
                        {getOwner(p.owner).name} · {a.reason}
                      </p>
                      <p className="text-sm text-slate-600">
                        {getVet(a.vet).name} · {getVet(a.vet).room} · booked {fmtTime(a.start)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold tabular-nums leading-tight ${long ? "text-red-700" : "text-slate-900"}`}>{waitText(mins)}</p>
                      <p className="text-xs text-slate-600">since {a.checkedInAt ? fmtTime(a.checkedInAt) : "now"}</p>
                    </div>
                  </div>
                  <AlertChips alerts={p.alerts} className="mt-2" />
                </li>
              );
            })}
          </ol>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white" aria-labelledby="exam-h">
        <header className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <h2 id="exam-h" className="flex items-center gap-2 text-lg font-bold">
            <DoorOpen aria-hidden className="size-5 text-sky-700" />
            In exam now
          </h2>
          <span className="rounded-full bg-sky-100 px-2.5 py-0.5 text-sm font-bold tabular-nums text-sky-900">{inExam.length}</span>
        </header>
        <ul className="divide-y divide-slate-100">
          {inExam.map((a) => {
            const p = getPatient(a.patient);
            if (!p) return null;
            return (
              <li key={a.id} className="px-4 py-3">
                <p className="flex items-baseline justify-between gap-3">
                  <Link href={`/patients/${p.id}`} className="font-semibold underline-offset-2 hover:underline">
                    {p.name}
                  </Link>
                  <span className="text-sm text-slate-600">{getVet(a.vet).room}</span>
                </p>
                <p className="text-sm text-slate-600">
                  {getVet(a.vet).name} · {a.reason}
                </p>
                <AlertChips alerts={p.alerts} className="mt-2" />
              </li>
            );
          })}
        </ul>
      </section>
    </aside>
  );
}

function Row({ a, highlighted }: { a: Appointment; highlighted: boolean }) {
  const { checkIn } = useClinic();
  const p = getPatient(a.patient);
  const vet = getVet(a.vet);
  const done = a.status === "done" || a.status === "cancelled";

  useEffect(() => {
    if (highlighted) document.getElementById(`appt-${a.id}`)?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [highlighted, a.id]);

  if (!p) return null;
  const owner = getOwner(p.owner);
  const tone = a.urgent && !done
    ? "border-l-red-600 bg-red-50"
    : a.status === "in_exam"
      ? "border-l-sky-500 bg-sky-50"
      : a.status === "checked_in"
        ? "border-l-amber-500 bg-white"
        : done
          ? "border-l-transparent bg-slate-50"
          : "border-l-transparent bg-white";

  return (
    <li
      id={`appt-${a.id}`}
      className={`grid gap-x-4 gap-y-2 border-l-4 px-4 py-3.5 md:grid-cols-[6.5rem_minmax(0,1fr)_auto] xl:grid-cols-[6.5rem_minmax(0,1.3fr)_minmax(0,1.2fr)_11rem_9.5rem] xl:items-center ${tone} ${highlighted ? "ring-2 ring-inset ring-teal-600" : ""}`}
    >
      <div className="flex items-baseline gap-2 md:col-start-1 md:row-span-3 md:row-start-1 md:block xl:row-span-1">
        <p className={`text-lg font-bold tabular-nums leading-tight ${a.status === "cancelled" ? "line-through" : ""}`}>{fmtTime(a.start)}</p>
        <p className="text-xs text-slate-600 tabular-nums">
          {a.minutes} min · to {fmtTime(endTime(a))}
        </p>
      </div>
      <div className="min-w-0 md:col-start-2 md:row-start-1 xl:col-start-2">
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <Link href={`/patients/${p.id}`} className="text-lg font-semibold text-slate-900 underline-offset-2 hover:underline">
            {p.name}
          </Link>
          <span className="text-sm text-slate-600">
            {p.species}, {p.breed}
          </span>
        </p>
        <p className="text-sm text-slate-700">Owner: {owner.name}</p>
        <AlertChips alerts={p.alerts} className="mt-1.5" />
      </div>
      <div className="min-w-0 md:col-start-2 md:row-start-2 xl:col-start-3 xl:row-start-1">
        {a.urgent && (
          <p className="mb-1 inline-flex items-center gap-1.5 rounded-md bg-red-600 px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-white">
            <Siren aria-hidden className="size-3.5" />
            Urgent
          </p>
        )}
        <p className="text-base text-slate-900">{a.reason}</p>
        <p className="text-sm text-slate-600">
          {vet.name} · {vet.room}
        </p>
      </div>
      <div className="md:col-start-3 md:row-start-1 md:text-right xl:col-start-4 xl:text-left">
        <StatusBadge status={a.status} />
        {a.status === "checked_in" && a.checkedInAt && <p className="mt-1 text-xs text-slate-600">in at {fmtTime(a.checkedInAt)}</p>}
      </div>
      <div className="md:col-start-3 md:row-start-2 md:text-right xl:col-start-5 xl:row-start-1">
        {a.status === "booked" && (
          <button
            type="button"
            onClick={() => checkIn(a.id)}
            aria-label={`Check in ${p.name}`}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-teal-700 px-4 text-base font-semibold text-white hover:bg-teal-800 md:w-auto"
          >
            <UserCheck aria-hidden className="size-5" />
            Check in
          </button>
        )}
      </div>
    </li>
  );
}

export function Schedule() {
  const { appointments, now, highlightId } = useClinic();
  const [vetFilter, setVetFilter] = useState<string>("all");

  const sorted = useMemo(
    () =>
      [...appointments]
        .filter((a) => vetFilter === "all" || a.vet === vetFilter)
        .sort((x, y) => toMin(x.start) - toMin(y.start) || x.vet.localeCompare(y.vet)),
    [appointments, vetFilter],
  );
  const count = (s: Appointment["status"]) => appointments.filter((a) => a.status === s).length;

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-600">
            {fmtDate(TODAY, { weekday: "long", month: "long", day: "numeric", year: "numeric" })} · now {fmtTime(fromMin(now))}
          </p>
          <h1 className="text-3xl font-bold tracking-tight">Today&apos;s schedule</h1>
        </div>
        <BookAppointment />
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Waiting" value={count("checked_in")} tone="text-amber-700" />
        <Stat label="In exam" value={count("in_exam")} tone="text-sky-700" />
        <Stat label="Still to arrive" value={count("booked")} tone="text-slate-900" />
        <Stat label="Done" value={count("done")} tone="text-emerald-700" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="order-2 xl:order-1">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-bold">All appointments</h2>
            <div role="group" aria-label="Filter by vet" className="flex flex-wrap gap-2">
              {[{ id: "all", name: "All vets" }, ...VETS].map((v) => (
                <button
                  key={v.id}
                  type="button"
                  aria-pressed={vetFilter === v.id}
                  onClick={() => setVetFilter(v.id)}
                  className={`h-11 rounded-full border px-4 text-sm font-semibold ${
                    vetFilter === v.id ? "border-teal-800 bg-teal-700 text-white" : "border-slate-300 bg-white text-slate-800 hover:bg-slate-50"
                  }`}
                >
                  {v.name}
                </button>
              ))}
            </div>
          </div>
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div aria-hidden className="hidden grid-cols-[6.5rem_minmax(0,1.3fr)_minmax(0,1.2fr)_11rem_9.5rem] gap-x-4 border-b border-slate-200 bg-slate-50 px-4 py-2 pl-5 text-xs font-semibold uppercase tracking-wide text-slate-600 xl:grid">
              <span>Time</span>
              <span>Patient and owner</span>
              <span>Reason and vet</span>
              <span>Status</span>
              <span />
            </div>
            <ul aria-label="Appointments today" className="divide-y divide-slate-100">
              {sorted.map((a) => (
                <Row key={a.id} a={a} highlighted={a.id === highlightId} />
              ))}
            </ul>
            {sorted.length === 0 && <p className="px-4 py-8 text-center text-sm text-slate-600">No appointments for this vet.</p>}
          </div>
        </div>
        <div className="order-1 xl:order-2">
          <WaitingList />
        </div>
      </div>
    </div>
  );
}
```

```tsx components/StatusBadge.tsx
import { Ban, CircleCheck, Hourglass, Stethoscope, CalendarClock } from "lucide-react";
import { STATUS_LABEL, type Status } from "@/lib/data";

const STYLE: Record<Status, string> = {
  booked: "bg-slate-100 text-slate-700 ring-slate-300",
  checked_in: "bg-amber-100 text-amber-900 ring-amber-300",
  in_exam: "bg-sky-100 text-sky-900 ring-sky-300",
  done: "bg-emerald-100 text-emerald-900 ring-emerald-300",
  cancelled: "bg-white text-slate-500 ring-slate-300 line-through",
};
const ICON = {
  booked: CalendarClock,
  checked_in: Hourglass,
  in_exam: Stethoscope,
  done: CircleCheck,
  cancelled: Ban,
};

export function StatusBadge({ status }: { status: Status }) {
  const Icon = ICON[status];
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${STYLE[status]}`}>
      <Icon aria-hidden className="size-3.5" />
      {STATUS_LABEL[status]}
    </span>
  );
}
```

```tsx components/WeightChart.tsx
import { TrendingDown, TrendingUp } from "lucide-react";
import { fmtDate } from "@/lib/data";

interface Point {
  date: string;
  kg: number;
}

const W = 420;
const H = 250;
const PAD = { l: 62, r: 40, t: 26, b: 34 };

export function WeightChart({ points, name }: { points: Point[]; name: string }) {
  if (points.length === 0) return <p className="text-sm text-slate-600">No weights recorded.</p>;

  const t = (d: string) => new Date(`${d}T00:00:00Z`).getTime();
  const t0 = t(points[0].date);
  const t1 = t(points[points.length - 1].date);
  const kgs = points.map((p) => p.kg);
  const lo = Math.floor(Math.min(...kgs) - 0.5);
  const hi = Math.ceil(Math.max(...kgs) + 0.5);
  const x = (d: string) => PAD.l + (t1 === t0 ? 0.5 : (t(d) - t0) / (t1 - t0)) * (W - PAD.l - PAD.r);
  const y = (kg: number) => PAD.t + (1 - (kg - lo) / (hi - lo)) * (H - PAD.t - PAD.b);

  const ticks: number[] = [];
  for (let v = lo; v <= hi; v += 1) ticks.push(v);

  const line = points.map((p) => `${x(p.date).toFixed(1)},${y(p.kg).toFixed(1)}`).join(" ");
  const base = H - PAD.b;
  const area = `${x(points[0].date).toFixed(1)},${base} ${line} ${x(points[points.length - 1].date).toFixed(1)},${base}`;

  const first = points[0];
  const last = points[points.length - 1];
  const prev = points[points.length - 2];
  const delta = last.kg - first.kg;
  const pct = (delta / first.kg) * 100;
  const Trend = delta <= 0 ? TrendingDown : TrendingUp;
  const sign = (n: number) => (n > 0 ? "+" : n < 0 ? "−" : "");
  const short = (d: string) => fmtDate(d, { month: "short", year: "2-digit" }).replace(" ", " '");

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-x-6 gap-y-2">
        <p className="text-4xl font-bold tabular-nums tracking-tight">
          {last.kg.toFixed(1)}
          <span className="ml-1 text-lg font-semibold text-slate-600">kg today</span>
        </p>
        <p className="flex items-center gap-2 text-sm font-semibold text-amber-900">
          <span className="inline-flex items-center gap-1.5 rounded-md bg-amber-100 px-2 py-1 ring-1 ring-amber-300">
            <Trend aria-hidden className="size-4" />
            {sign(delta)}
            {Math.abs(delta).toFixed(1)} kg ({sign(pct)}
            {Math.abs(pct).toFixed(1)}%)
          </span>
          <span className="font-normal text-slate-600">since {fmtDate(first.date, { month: "short", year: "numeric" })}</span>
        </p>
        {prev && (
          <p className="text-sm text-slate-600">
            {sign(last.kg - prev.kg)}
            {Math.abs(last.kg - prev.kg).toFixed(1)} kg since last visit
          </p>
        )}
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${name}'s weight over ${points.length} visits, from ${first.kg} kg to ${last.kg} kg`} className="h-auto w-full max-w-2xl">
        {ticks.map((v) => (
          <g key={v}>
            <line x1={PAD.l - 30} x2={W - PAD.r + 20} y1={y(v)} y2={y(v)} stroke="#e2e8f0" strokeWidth={1} />
            <text x={PAD.l - 36} y={y(v) + 4} textAnchor="end" fontSize={11} fill="#475569">
              {v}
            </text>
          </g>
        ))}
        <polygon points={area} fill="#0f766e" opacity={0.1} />
        <polyline points={line} fill="none" stroke="#0f766e" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
        {points.map((p, i) => {
          const isLast = i === points.length - 1;
          return (
            <g key={p.date}>
              <circle cx={x(p.date)} cy={y(p.kg)} r={isLast ? 6 : 4.5} fill={isLast ? "#0f766e" : "#fff"} stroke="#0f766e" strokeWidth={2.5} />
              <text x={x(p.date)} y={y(p.kg) - 11} textAnchor="middle" fontSize={12} fontWeight={isLast ? 700 : 600} fill="#0f172a">
                {p.kg.toFixed(1)}
              </text>
              <text x={x(p.date)} y={H - 12} textAnchor="middle" fontSize={11} fill="#475569">
                {short(p.date)}
              </text>
            </g>
          );
        })}
      </svg>

      <table className="sr-only">
        <caption>Weight history for {name}</caption>
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
              <td>{p.kg.toFixed(1)}</td>
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
  checkedInAt?: string;
}
export interface Visit {
  date: string;
  vet: string;
  reason: string;
  notes: string;
  invoice_usd: number;
}
export interface PatientRecord {
  weights_kg: { date: string; kg: number }[];
  vaccinations: { name: string; given: string; due: string }[];
  medications: { name: string; dose: string; since: string }[];
  visits: Visit[];
}

export const CLINIC = "Hillside Veterinary Clinic";
export const PRODUCT = "Pawpoint";
export const TODAY = "2026-11-12";
/** The demo clock starts here (minutes after midnight): 9:52 AM on TODAY. */
export const START_NOW = 9 * 60 + 52;
export const OPEN_MIN = 8 * 60;
export const CLOSE_MIN = 17 * 60;

export const USER = { name: "Rosa Lindqvist", role: "Receptionist" };

export const VETS: Vet[] = [
  { id: "v-1", name: "Dr. Amara Osei", room: "Exam 1" },
  { id: "v-2", name: "Dr. Tomás Reyes", room: "Exam 2" },
  { id: "v-3", name: "Dr. Helen Park", room: "Surgery" },
];

export const OWNERS: Owner[] = [
  { id: "o-1", name: "Daniel Kim", phone: "+1 555 0142" },
  { id: "o-2", name: "Priya Natarajan", phone: "+1 555 0178" },
  { id: "o-3", name: "Lucas Moreau", phone: "+1 555 0119" },
  { id: "o-4", name: "Grace Whitfield", phone: "+1 555 0163" },
  { id: "o-5", name: "Sam Oduya", phone: "+1 555 0190" },
  { id: "o-6", name: "Elena Rossi", phone: "+1 555 0105" },
];

export const PATIENTS: Patient[] = [
  { id: "p-101", name: "Biscuit", species: "Dog", breed: "Beagle", born: "2019-04-02", sex: "Male, neutered", owner: "o-1", alerts: [] },
  { id: "p-102", name: "Mochi", species: "Cat", breed: "Domestic shorthair", born: "2021-07-15", sex: "Female, spayed", owner: "o-2", alerts: ["Bites when restrained"] },
  { id: "p-103", name: "Pepper", species: "Dog", breed: "Border collie", born: "2016-01-20", sex: "Female, spayed", owner: "o-3", alerts: [] },
  { id: "p-104", name: "Olive", species: "Dog", breed: "Labrador retriever", born: "2014-09-08", sex: "Female, spayed", owner: "o-4", alerts: ["Penicillin allergy", "Chronic kidney disease, stage 2"] },
  { id: "p-105", name: "Kiwi", species: "Bird", breed: "Budgerigar", born: "2023-03-11", sex: "Male", owner: "o-5", alerts: [] },
  { id: "p-106", name: "Tofu", species: "Rabbit", breed: "Holland lop", born: "2022-05-30", sex: "Female", owner: "o-6", alerts: [] },
  { id: "p-107", name: "Ziggy", species: "Cat", breed: "Maine coon", born: "2018-11-02", sex: "Male, neutered", owner: "o-2", alerts: ["Diabetic: insulin twice daily"] },
  { id: "p-108", name: "Bruno", species: "Dog", breed: "French bulldog", born: "2022-02-14", sex: "Male", owner: "o-5", alerts: ["Brachycephalic: sedation risk"] },
];

export const APPOINTMENTS: Appointment[] = [
  { id: "a-01", patient: "p-101", vet: "v-1", start: "08:30", minutes: 20, reason: "Annual vaccination", status: "done" },
  { id: "a-02", patient: "p-104", vet: "v-2", start: "08:30", minutes: 30, reason: "Kidney panel recheck", status: "done" },
  { id: "a-03", patient: "p-108", vet: "v-3", start: "08:00", minutes: 120, reason: "Soft palate surgery", status: "in_exam" },
  { id: "a-04", patient: "p-102", vet: "v-1", start: "09:00", minutes: 30, reason: "Limping, left hind leg", status: "in_exam" },
  { id: "a-05", patient: "p-107", vet: "v-2", start: "09:15", minutes: 20, reason: "Glucose curve", status: "checked_in", checkedInAt: "09:08" },
  { id: "a-06", patient: "p-105", vet: "v-1", start: "09:45", minutes: 20, reason: "Beak and nail trim", status: "checked_in", checkedInAt: "09:41" },
  { id: "a-07", patient: "p-103", vet: "v-2", start: "10:00", minutes: 30, reason: "Senior wellness exam", status: "booked" },
  { id: "a-08", patient: "p-106", vet: "v-1", start: "10:30", minutes: 20, reason: "Not eating since yesterday", status: "booked", urgent: true },
  { id: "a-09", patient: "p-104", vet: "v-3", start: "11:00", minutes: 45, reason: "Dental cleaning", status: "booked" },
  { id: "a-10", patient: "p-101", vet: "v-2", start: "11:30", minutes: 20, reason: "Ear infection follow-up", status: "booked" },
  { id: "a-11", patient: "p-107", vet: "v-1", start: "13:30", minutes: 30, reason: "Dental check", status: "booked" },
  { id: "a-12", patient: "p-103", vet: "v-3", start: "14:00", minutes: 60, reason: "Lump removal", status: "cancelled" },
  { id: "a-13", patient: "p-102", vet: "v-2", start: "15:00", minutes: 20, reason: "X-ray results", status: "booked" },
];

export const RECORDS: Record<string, PatientRecord> = {
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
      { date: "2026-11-12", vet: "v-2", reason: "Kidney panel recheck", notes: "Creatinine 2.1 mg/dL (was 2.0). Weight down 0.6 kg. Continue benazepril, recheck in 3 months.", invoice_usd: 186.0 },
      { date: "2026-06-17", vet: "v-2", reason: "Kidney panel recheck", notes: "Stable. Appetite good. Owner reports more drinking in hot weather.", invoice_usd: 172.5 },
      { date: "2026-02-11", vet: "v-1", reason: "Coughing", notes: "Mild kennel cough. Supportive care; no antibiotics given (penicillin allergy).", invoice_usd: 94.0 },
      { date: "2025-11-03", vet: "v-2", reason: "Senior wellness exam", notes: "Grade 2 dental tartar. Dental cleaning recommended.", invoice_usd: 148.0 },
    ],
  },
};

/* ---------- helpers ---------- */

export const getVet = (id: string): Vet => VETS.find((v) => v.id === id) ?? VETS[0];
export const getOwner = (id: string): Owner => OWNERS.find((o) => o.id === id) ?? OWNERS[0];
export const getPatient = (id: string): Patient | undefined => PATIENTS.find((p) => p.id === id);

export const toMin = (hhmm: string): number => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};
export const fromMin = (n: number): string =>
  `${String(Math.floor(n / 60)).padStart(2, "0")}:${String(n % 60).padStart(2, "0")}`;

/** "13:30" -> "1:30 PM" */
export const fmtTime = (hhmm: string): string => {
  const n = toMin(hhmm);
  const h = Math.floor(n / 60);
  const m = n % 60;
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
};

const utc = (iso: string): Date => new Date(`${iso}T00:00:00Z`);

export const fmtDate = (iso: string, opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" }): string =>
  utc(iso).toLocaleDateString("en-US", { timeZone: "UTC", ...opts });

export const daysBetween = (fromIso: string, toIso: string): number =>
  Math.round((utc(toIso).getTime() - utc(fromIso).getTime()) / 86400000);

export const ageText = (born: string, today: string = TODAY): string => {
  const b = utc(born);
  const t = utc(today);
  let months = (t.getUTCFullYear() - b.getUTCFullYear()) * 12 + (t.getUTCMonth() - b.getUTCMonth());
  if (t.getUTCDate() < b.getUTCDate()) months -= 1;
  const y = Math.floor(months / 12);
  const m = months % 12;
  if (y === 0) return `${m} mo`;
  return `${y} yr${y === 1 ? "" : "s"}`;
};

export const STATUS_LABEL: Record<Status, string> = {
  booked: "Booked",
  checked_in: "Checked in",
  in_exam: "In exam",
  done: "Done",
  cancelled: "Cancelled",
};

/** Active (non-cancelled) appointment of the same vet that overlaps the window. */
export const findConflict = (
  list: Appointment[],
  vetId: string,
  startMin: number,
  minutes: number,
): Appointment | undefined =>
  list.find((a) => {
    if (a.vet !== vetId || a.status === "cancelled") return false;
    const s = toMin(a.start);
    return startMin < s + a.minutes && s < startMin + minutes;
  });
```

```tsx lib/store.tsx
"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  APPOINTMENTS,
  CLOSE_MIN,
  START_NOW,
  findConflict,
  fmtTime,
  fromMin,
  getPatient,
  toMin,
  type Appointment,
} from "./data";

export interface BookingInput {
  patient: string;
  vet: string;
  start: string;
  minutes: number;
  reason: string;
}
export type BookingResult = { ok: true; id: string } | { ok: false; error: string };

interface Store {
  appointments: Appointment[];
  now: number;
  notice: string;
  highlightId: string | null;
  checkIn: (id: string) => void;
  book: (input: BookingInput) => BookingResult;
  dismissNotice: () => void;
}

const Ctx = createContext<Store | null>(null);

export function ClinicProvider({ children }: { children: React.ReactNode }) {
  const [appointments, setAppointments] = useState<Appointment[]>(APPOINTMENTS);
  const [now, setNow] = useState(START_NOW);
  const [notice, setNotice] = useState("");
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const counter = useRef(14);
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const hlTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    const id = setInterval(() => setNow((n) => n + 1), 60000);
    return () => clearInterval(id);
  }, []);

  const say = useCallback((text: string) => {
    setNotice(text);
    clearTimeout(noticeTimer.current);
    noticeTimer.current = setTimeout(() => setNotice(""), 5000);
  }, []);

  const checkIn = useCallback(
    (id: string) => {
      const target = appointments.find((a) => a.id === id);
      if (!target || target.status !== "booked") return;
      setAppointments((list) =>
        list.map((a) => (a.id === id && a.status === "booked" ? { ...a, status: "checked_in", checkedInAt: fromMin(now) } : a)),
      );
      say(`${getPatient(target.patient)?.name ?? "Patient"} checked in at ${fmtTime(fromMin(now))}.`);
    },
    [appointments, now, say],
  );

  const book = useCallback(
    (input: BookingInput): BookingResult => {
      const startMin = toMin(input.start);
      if (startMin < now) return { ok: false, error: "That time has already passed." };
      if (startMin + input.minutes > CLOSE_MIN) return { ok: false, error: "The visit would run past closing time." };
      const clash = findConflict(appointments, input.vet, startMin, input.minutes);
      if (clash) {
        return {
          ok: false,
          error: `This vet is already booked ${fmtTime(clash.start)} to ${fmtTime(fromMin(toMin(clash.start) + clash.minutes))} (${clash.reason}).`,
        };
      }
      const id = `a-${counter.current++}`;
      const appt: Appointment = {
        id,
        patient: input.patient,
        vet: input.vet,
        start: input.start,
        minutes: input.minutes,
        reason: input.reason.trim() || "Follow-up visit",
        status: "booked",
      };
      setAppointments((list) => [...list, appt]);
      setHighlightId(id);
      clearTimeout(hlTimer.current);
      hlTimer.current = setTimeout(() => setHighlightId(null), 6000);
      say(`Booked ${getPatient(input.patient)?.name ?? "patient"} at ${fmtTime(input.start)}.`);
      return { ok: true, id };
    },
    [appointments, now, say],
  );

  const dismissNotice = useCallback(() => setNotice(""), []);

  const value = useMemo(
    () => ({ appointments, now, notice, highlightId, checkIn, book, dismissNotice }),
    [appointments, now, notice, highlightId, checkIn, book, dismissNotice],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useClinic(): Store {
  const v = useContext(Ctx);
  if (!v) throw new Error("useClinic must be used inside ClinicProvider");
  return v;
}
```

