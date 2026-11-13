```css app/globals.css
@import "tailwindcss";

@theme {
  --color-brand-50: #eefaf8;
  --color-brand-100: #d3f3ee;
  --color-brand-600: #0f766e;
  --color-brand-700: #0b5f59;
  --color-brand-800: #0a4b47;
  --color-ink: #16212b;
  --color-canvas: #f3f5f7;
}

html {
  background: var(--color-canvas);
  color: var(--color-ink);
}

body {
  min-height: 100dvh;
  background: var(--color-canvas);
}

:focus-visible {
  outline: 3px solid #0f766e;
  outline-offset: 2px;
  border-radius: 6px;
}

dialog::backdrop {
  background: rgb(15 23 42 / 0.5);
}

@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.001ms !important;
    transition-duration: 0.001ms !important;
  }
}
```

```tsx app/layout.tsx
import "./globals.css";

import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Pawpoint | Hillside Veterinary Clinic",
  description: "Front-desk and records software for Hillside Veterinary Clinic",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
```

```tsx app/page.tsx
import { AppHeader } from "@/components/AppHeader";
import { Schedule } from "@/components/Schedule";

export default function Home() {
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2">
        Skip to content
      </a>
      <AppHeader />
      <Schedule />
    </>
  );
}
```

```tsx app/patients/[id]/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CircleAlert, CircleCheck, Pill, Phone, Syringe, TriangleAlert } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { WeightChart } from "@/components/WeightChart";
import {
  PATIENTS,
  RECORDS,
  TODAY,
  ageOn,
  daysBetween,
  fmtDate,
  fmtMoney,
  getOwner,
  getPatient,
  getVet,
} from "@/lib/data";

export function generateStaticParams() {
  return PATIENTS.map((p) => ({ id: p.id }));
}

export default async function PatientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const patient = getPatient(id);
  if (!patient) notFound();
  const owner = getOwner(patient.owner);
  const record = RECORDS[patient.id];

  const vaccinations = record
    ? [...record.vaccinations].sort((a, b) => a.due.localeCompare(b.due))
    : [];
  const overdueCount = vaccinations.filter((v) => daysBetween(TODAY, v.due) < 0).length;

  const card = "rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200";

  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2">
        Skip to content
      </a>
      <AppHeader />
      <main id="main" className="mx-auto max-w-7xl px-4 pb-16 pt-5 sm:px-6">
        <Link href="/" className="inline-flex h-11 items-center gap-2 rounded-lg pr-3 text-sm font-semibold text-brand-700 hover:underline">
          <ArrowLeft aria-hidden className="size-4" />
          Today&rsquo;s schedule
        </Link>

        <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">{patient.name}</h1>
            <p className="mt-1 text-base text-slate-700">
              {patient.breed} &middot; {patient.species} &middot; {patient.sex} &middot; {ageOn(patient.born, TODAY)}
            </p>
          </div>
          <p className="rounded-lg bg-white px-3 py-1.5 text-sm font-medium text-slate-700 ring-1 ring-slate-200">
            Patient ID <span className="font-semibold tabular-nums">{patient.id}</span>
          </p>
        </div>

        {patient.alerts.length > 0 && (
          <section aria-labelledby="alerts-h" className="mt-5 rounded-2xl border-2 border-red-700 bg-red-50 p-4 sm:p-5">
            <h2 id="alerts-h" className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-red-800">
              <TriangleAlert aria-hidden className="size-5" />
              Medical alerts ({patient.alerts.length})
            </h2>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {patient.alerts.map((a) => (
                <li key={a} className="flex items-center gap-3 rounded-xl bg-red-700 px-4 py-3 text-lg font-bold text-white">
                  <TriangleAlert aria-hidden className="size-6 shrink-0" />
                  {a}
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="mt-5 grid gap-5 lg:grid-cols-3">
          <section aria-labelledby="details-h" className={card}>
            <h2 id="details-h" className="text-lg font-bold text-slate-900">
              Patient and owner
            </h2>
            <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-5 gap-y-2 text-base">
              <dt className="text-slate-600">Species</dt>
              <dd className="font-medium text-slate-900">{patient.species}</dd>
              <dt className="text-slate-600">Breed</dt>
              <dd className="font-medium text-slate-900">{patient.breed}</dd>
              <dt className="text-slate-600">Sex</dt>
              <dd className="font-medium text-slate-900">{patient.sex}</dd>
              <dt className="text-slate-600">Born</dt>
              <dd className="font-medium text-slate-900">
                {fmtDate(patient.born)} ({ageOn(patient.born, TODAY)})
              </dd>
              <dt className="border-t border-slate-200 pt-2 text-slate-600">Owner</dt>
              <dd className="border-t border-slate-200 pt-2 font-medium text-slate-900">{owner?.name}</dd>
              <dt className="text-slate-600">Phone</dt>
              <dd>
                <a href={`tel:${owner?.phone.replace(/\s/g, "")}`} className="inline-flex min-h-11 items-center gap-2 font-semibold text-brand-700 hover:underline">
                  <Phone aria-hidden className="size-4" />
                  {owner?.phone}
                </a>
              </dd>
            </dl>
          </section>

          <section aria-labelledby="weight-h" className={`${card} lg:col-span-2`}>
            <h2 id="weight-h" className="mb-2 text-lg font-bold text-slate-900">
              Weight trend
            </h2>
            {record ? (
              <WeightChart points={record.weights_kg} />
            ) : (
              <p className="text-slate-600">No weights recorded yet.</p>
            )}
          </section>

          <section aria-labelledby="vax-h" className={`${card} lg:col-span-2`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 id="vax-h" className="flex items-center gap-2 text-lg font-bold text-slate-900">
                <Syringe aria-hidden className="size-5 text-slate-600" />
                Vaccinations
              </h2>
              {overdueCount > 0 && (
                <p className="rounded-md bg-red-700 px-2.5 py-1 text-sm font-bold text-white">{overdueCount} overdue</p>
              )}
            </div>
            {vaccinations.length === 0 ? (
              <p className="mt-3 text-slate-600">No vaccinations on file.</p>
            ) : (
              <ul className="mt-3 divide-y divide-slate-200">
                {vaccinations.map((v) => {
                  const left = daysBetween(TODAY, v.due);
                  const overdue = left < 0;
                  const soon = !overdue && left <= 60;
                  return (
                    <li key={v.name} className={`flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-3 ${overdue ? "-mx-2 rounded-lg bg-red-50 px-2" : ""}`}>
                      <div>
                        <p className="text-base font-semibold text-slate-900">{v.name}</p>
                        <p className="text-sm text-slate-600">Given {fmtDate(v.given)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-slate-700">Due {fmtDate(v.due)}</p>
                        {overdue ? (
                          <p className="inline-flex items-center gap-1 text-sm font-bold text-red-800">
                            <CircleAlert aria-hidden className="size-4" />
                            Overdue by {Math.abs(left)} days
                          </p>
                        ) : soon ? (
                          <p className="text-sm font-bold text-amber-800">Due in {left} days</p>
                        ) : (
                          <p className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-800">
                            <CircleCheck aria-hidden className="size-4" />
                            Up to date
                          </p>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section aria-labelledby="meds-h" className={card}>
            <h2 id="meds-h" className="flex items-center gap-2 text-lg font-bold text-slate-900">
              <Pill aria-hidden className="size-5 text-slate-600" />
              Current medications
            </h2>
            {!record || record.medications.length === 0 ? (
              <p className="mt-3 text-slate-600">No current medications.</p>
            ) : (
              <ul className="mt-3 space-y-3">
                {record.medications.map((m) => (
                  <li key={m.name} className="rounded-xl bg-slate-50 p-3">
                    <p className="font-semibold text-slate-900">{m.name}</p>
                    <p className="text-sm text-slate-700">{m.dose}</p>
                    <p className="text-xs text-slate-600">Since {fmtDate(m.since)}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section aria-labelledby="visits-h" className={`${card} lg:col-span-3`}>
            <h2 id="visits-h" className="text-lg font-bold text-slate-900">
              Visit history
            </h2>
            {!record || record.visits.length === 0 ? (
              <p className="mt-3 text-slate-600">No visits on file.</p>
            ) : (
              <ol className="mt-4 space-y-5 border-l-2 border-slate-200 pl-5">
                {record.visits.map((v) => (
                  <li key={v.date} className="relative">
                    <span aria-hidden className="absolute -left-[1.72rem] top-1.5 size-3 rounded-full bg-brand-600 ring-4 ring-white" />
                    <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                      <p className="text-base font-bold text-slate-900">
                        {fmtDate(v.date)} <span className="font-semibold text-slate-700">&middot; {v.reason}</span>
                      </p>
                      <p className="text-sm text-slate-600">
                        {getVet(v.vet)?.name} &middot; {fmtMoney(v.invoice_usd)}
                      </p>
                    </div>
                    <p className="mt-1 max-w-3xl text-base leading-relaxed text-slate-800">{v.notes}</p>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>
      </main>
    </>
  );
}
```

```tsx components/AlertChips.tsx
import { TriangleAlert } from "lucide-react";

/** Medical alerts: solid red so they cannot be missed wherever a patient appears. */
export function AlertChips({ alerts, size = "sm" }: { alerts: string[]; size?: "sm" | "lg" }) {
  if (alerts.length === 0) return null;
  const cls =
    size === "lg"
      ? "gap-2 px-3 py-1.5 text-base"
      : "gap-1 px-2 py-0.5 text-xs";
  return (
    <ul className="flex flex-wrap gap-1.5" aria-label="Medical alerts">
      {alerts.map((a) => (
        <li
          key={a}
          className={`inline-flex items-center rounded-md bg-red-700 font-semibold text-white ${cls}`}
        >
          <TriangleAlert aria-hidden className={size === "lg" ? "size-5 shrink-0" : "size-3.5 shrink-0"} />
          <span className="sr-only">Alert: </span>
          {a}
        </li>
      ))}
    </ul>
  );
}
```

```tsx components/AppHeader.tsx
import Link from "next/link";
import { PawPrint } from "lucide-react";
import { CLINIC, USER } from "@/lib/data";
import { PatientSearch } from "./PatientSearch";

export function AppHeader() {
  const initials = USER.name
    .split(" ")
    .map((n) => n[0])
    .join("");
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-xl bg-brand-600 text-white">
            <PawPrint aria-hidden className="size-6" />
          </span>
          <span className="leading-tight">
            <span className="block text-lg font-bold tracking-tight text-slate-900">Pawpoint</span>
            <span className="block text-xs text-slate-600">{CLINIC.name}</span>
          </span>
        </Link>
        <div className="order-3 w-full md:order-none md:max-w-md md:flex-1 lg:max-w-lg">
          <PatientSearch />
        </div>
        <div className="ml-auto flex items-center gap-3">
          <div className="hidden text-right leading-tight sm:block">
            <p className="text-sm font-semibold text-slate-900">{USER.name}</p>
            <p className="text-xs text-slate-600">{USER.role}</p>
          </div>
          <span
            aria-hidden
            className="grid size-11 place-items-center rounded-full bg-slate-800 text-sm font-semibold text-white"
          >
            {initials}
          </span>
        </div>
      </div>
    </header>
  );
}
```

```tsx components/PatientSearch.tsx
"use client";

import { useId, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, TriangleAlert } from "lucide-react";
import { OWNERS, PATIENTS, getOwner } from "@/lib/data";

export function PatientSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const listId = useId();
  const wrapRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return PATIENTS.filter((p) => {
      const owner = getOwner(p.owner);
      return p.name.toLowerCase().includes(q) || (owner?.name.toLowerCase().includes(q) ?? false);
    });
  }, [query]);

  const showList = open && query.trim().length > 0;

  function go(id: string) {
    setOpen(false);
    setQuery("");
    router.push(`/patients/${id}`);
  }

  return (
    <div
      ref={wrapRef}
      className="relative w-full"
      onBlur={(e) => {
        if (!wrapRef.current?.contains(e.relatedTarget as Node | null)) setOpen(false);
      }}
    >
      <label htmlFor="patient-search" className="sr-only">
        Search patients or owners
      </label>
      <Search aria-hidden className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-slate-500" />
      <input
        id="patient-search"
        type="search"
        role="combobox"
        aria-expanded={showList}
        aria-controls={listId}
        aria-autocomplete="list"
        autoComplete="off"
        placeholder="Find a patient or owner"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setActive(0);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setActive((i) => Math.min(i + 1, results.length - 1));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActive((i) => Math.max(i - 1, 0));
          } else if (e.key === "Enter" && results[active]) {
            e.preventDefault();
            go(results[active].id);
          } else if (e.key === "Escape") {
            setOpen(false);
          }
        }}
        className="h-12 w-full rounded-xl border border-slate-300 bg-white pl-11 pr-3 text-base text-slate-900 placeholder:text-slate-500 shadow-sm"
      />
      {showList && (
        <ul
          id={listId}
          aria-label="Search results"
          className="absolute left-0 right-0 top-full z-30 mt-2 max-h-96 overflow-auto rounded-xl border border-slate-200 bg-white p-1 shadow-xl"
        >
          {results.length === 0 && (
            <li className="px-3 py-3 text-sm text-slate-600">
              No patient or owner matches &ldquo;{query.trim()}&rdquo;.
            </li>
          )}
          {results.map((p, i) => {
            const owner = OWNERS.find((o) => o.id === p.owner);
            return (
              <li key={p.id}>
                <Link
                  href={`/patients/${p.id}`}
                  onClick={() => {
                    setOpen(false);
                    setQuery("");
                  }}
                  className={`flex min-h-14 items-center justify-between gap-3 rounded-lg px-3 py-2 ${
                    i === active ? "bg-brand-50" : "hover:bg-slate-50"
                  }`}
                >
                  <span className="min-w-0">
                    <span className="block truncate font-semibold text-slate-900">{p.name}</span>
                    <span className="block truncate text-sm text-slate-600">
                      {p.species} &middot; {p.breed} &middot; {owner?.name}
                    </span>
                  </span>
                  {p.alerts.length > 0 && (
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-red-700 px-2 py-0.5 text-xs font-semibold text-white">
                      <TriangleAlert aria-hidden className="size-3.5" />
                      {p.alerts.length} alert{p.alerts.length > 1 ? "s" : ""}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
```

```tsx components/Schedule.tsx
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
```

```tsx components/WeightChart.tsx
import { daysBetween, fmtDate } from "@/lib/data";

const W = 440;
const H = 240;
const PAD = { l: 44, r: 22, t: 28, b: 36 };
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function shortLabel(iso: string) {
  const [y, m] = iso.split("-").map(Number);
  return `${MONTHS[m - 1]} ${String(y).slice(2)}`;
}

export function WeightChart({ points }: { points: { date: string; kg: number }[] }) {
  if (points.length === 0) return null;
  const first = points[0];
  const last = points[points.length - 1];
  const span = Math.max(1, daysBetween(first.date, last.date));
  const lo = Math.floor(Math.min(...points.map((p) => p.kg)) - 0.5);
  const hi = Math.ceil(Math.max(...points.map((p) => p.kg)) + 0.5);
  const x = (d: string) => PAD.l + (daysBetween(first.date, d) / span) * (W - PAD.l - PAD.r);
  const y = (kg: number) => PAD.t + (1 - (kg - lo) / (hi - lo)) * (H - PAD.t - PAD.b);
  const ticks: number[] = [];
  for (let v = lo; v <= hi; v += 1) ticks.push(v);
  const path = points.map((p, i) => `${i === 0 ? "M" : "L"}${x(p.date).toFixed(1)},${y(p.kg).toFixed(1)}`).join(" ");
  const change = last.kg - first.kg;
  const pct = (change / first.kg) * 100;

  return (
    <figure>
      <figcaption className="flex flex-wrap items-baseline gap-x-3">
        <span className="text-3xl font-bold tabular-nums text-slate-900">{last.kg.toFixed(1)} kg</span>
        <span className="text-sm font-semibold text-red-800">
          {change.toFixed(1)} kg ({pct.toFixed(0)}%) since {fmtDate(first.date)}
        </span>
      </figcaption>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`Weight over ${points.length} visits, from ${first.kg} kg on ${fmtDate(first.date)} to ${last.kg} kg on ${fmtDate(last.date)}`}
        className="mt-2 h-auto w-full"
      >
        {ticks.map((v) => (
          <g key={v}>
            <line x1={PAD.l} x2={W - PAD.r} y1={y(v)} y2={y(v)} stroke="#e2e8f0" strokeWidth={1} />
            <text x={PAD.l - 8} y={y(v) + 4} textAnchor="end" fontSize={12} fill="#475569">
              {v}
            </text>
          </g>
        ))}
        <path d={path} fill="none" stroke="#0f766e" strokeWidth={3} strokeLinejoin="round" strokeLinecap="round" />
        {points.map((p, i) => {
          const isLast = i === points.length - 1;
          return (
            <g key={p.date}>
              <circle cx={x(p.date)} cy={y(p.kg)} r={isLast ? 6 : 4.5} fill={isLast ? "#0f766e" : "#fff"} stroke="#0f766e" strokeWidth={2.5} />
              <text x={x(p.date)} y={y(p.kg) - 11} textAnchor={i === 0 ? "start" : isLast ? "end" : "middle"} fontSize={12} fontWeight={600} fill="#16212b">
                {p.kg}
              </text>
              <text x={x(p.date)} y={H - 12} textAnchor={i === 0 ? "start" : isLast ? "end" : "middle"} fontSize={11.5} fill="#475569">
                {shortLabel(p.date)}
              </text>
            </g>
          );
        })}
      </svg>
      <table className="sr-only">
        <caption>Weight by visit</caption>
        <thead>
          <tr>
            <th>Date</th>
            <th>Weight (kg)</th>
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
    </figure>
  );
}
```

```ts lib/data.ts
export type VetId = "v-1" | "v-2" | "v-3";
export type Status = "booked" | "checked_in" | "in_exam" | "done" | "cancelled";

export interface Vet {
  id: VetId;
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
  vet: VetId;
  start: string;
  minutes: number;
  reason: string;
  status: Status;
  urgent?: boolean;
  /** Minutes since midnight at which the patient checked in. */
  checkedInAt?: number;
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
  vet: VetId;
  reason: string;
  notes: string;
  invoice_usd: number;
}
export interface PatientRecord {
  weights_kg: { date: string; kg: number }[];
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
/** The clock the desk is showing, in minutes since midnight (09:50). */
export const NOW_MINUTES = 9 * 60 + 50;
export const DAY_START = 8 * 60;
export const DAY_END = 17 * 60;

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
  { id: "a-05", patient: "p-107", vet: "v-2", start: "09:15", minutes: 20, reason: "Glucose curve", status: "checked_in", checkedInAt: 9 * 60 + 8 },
  { id: "a-06", patient: "p-105", vet: "v-1", start: "09:45", minutes: 20, reason: "Beak and nail trim", status: "checked_in", checkedInAt: 9 * 60 + 41 },
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

export const STATUS_LABEL: Record<Status, string> = {
  booked: "Booked",
  checked_in: "Checked in",
  in_exam: "In exam",
  done: "Done",
  cancelled: "Cancelled",
};

export function getPatient(id: string): Patient | undefined {
  return PATIENTS.find((p) => p.id === id);
}
export function getOwner(id: string): Owner | undefined {
  return OWNERS.find((o) => o.id === id);
}
export function getVet(id: string): Vet | undefined {
  return VETS.find((v) => v.id === id);
}

/* ---------- time helpers ---------- */

export function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}
export function toHHMM(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
export function fmtTime(hhmmOrMinutes: string | number): string {
  const mins = typeof hhmmOrMinutes === "number" ? hhmmOrMinutes : toMinutes(hhmmOrMinutes);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  const suffix = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${suffix}`;
}

/** Two appointments for one vet clash when their time ranges overlap. */
export function findClash(
  appointments: Appointment[],
  vet: VetId,
  start: number,
  minutes: number,
): Appointment | undefined {
  return appointments.find((a) => {
    if (a.vet !== vet || a.status === "cancelled") return false;
    const s = toMinutes(a.start);
    return start < s + a.minutes && s < start + minutes;
  });
}

/* ---------- date helpers (calendar days, no time zones) ---------- */

function dayNumber(iso: string): number {
  const [y, m, d] = iso.split("-").map(Number);
  return Math.round(Date.UTC(y, m - 1, d) / 86400000);
}
export function daysBetween(fromIso: string, toIso: string): number {
  return dayNumber(toIso) - dayNumber(fromIso);
}
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export function fmtDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}
export function fmtShortDate(iso: string): string {
  const [, m, d] = iso.split("-").map(Number);
  return `${d} ${MONTHS[m - 1]}`;
}
export function ageOn(bornIso: string, todayIso: string): string {
  const [by, bm, bd] = bornIso.split("-").map(Number);
  const [ty, tm, td] = todayIso.split("-").map(Number);
  let years = ty - by;
  let months = tm - bm;
  if (td < bd) months -= 1;
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  if (years < 1) return `${months} mo`;
  return `${years} yr${years === 1 ? "" : "s"}`;
}
export function fmtMoney(usd: number): string {
  return `$${usd.toFixed(2)}`;
}
```

