```css app/globals.css
@import "tailwindcss";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

@theme inline {
  --radius-sm: calc(var(--radius) * 0.6);
  --radius-md: calc(var(--radius) * 0.8);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) * 1.4);
  --radius-2xl: calc(var(--radius) * 1.8);
  --radius-3xl: calc(var(--radius) * 2.2);
  --radius-4xl: calc(var(--radius) * 2.6);
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);
  --color-sidebar: var(--sidebar);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-ring: var(--sidebar-ring);
}

:root {
  --radius: 0.75rem;
  --background: oklch(0.975 0.006 200);
  --foreground: oklch(0.2 0.02 220);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.2 0.02 220);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.2 0.02 220);
  --primary: oklch(0.45 0.09 195);
  --primary-foreground: oklch(0.985 0.01 195);
  --secondary: oklch(0.955 0.012 200);
  --secondary-foreground: oklch(0.28 0.04 210);
  --muted: oklch(0.955 0.01 200);
  --muted-foreground: oklch(0.47 0.02 220);
  --accent: oklch(0.94 0.025 195);
  --accent-foreground: oklch(0.28 0.06 200);
  --destructive: oklch(0.55 0.22 27);
  --border: oklch(0.9 0.01 205);
  --input: oklch(0.87 0.012 205);
  --ring: oklch(0.58 0.1 195);
  --chart-1: oklch(0.5 0.1 195);
  --chart-2: oklch(0.6 0.118 184.704);
  --chart-3: oklch(0.398 0.07 227.392);
  --chart-4: oklch(0.828 0.189 84.429);
  --chart-5: oklch(0.769 0.188 70.08);
  --sidebar: oklch(0.985 0 0);
  --sidebar-foreground: oklch(0.145 0 0);
  --sidebar-primary: oklch(0.205 0 0);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.97 0 0);
  --sidebar-accent-foreground: oklch(0.205 0 0);
  --sidebar-border: oklch(0.922 0 0);
  --sidebar-ring: oklch(0.708 0 0);
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --card: oklch(0.205 0 0);
  --card-foreground: oklch(0.985 0 0);
  --popover: oklch(0.205 0 0);
  --popover-foreground: oklch(0.985 0 0);
  --primary: oklch(0.922 0 0);
  --primary-foreground: oklch(0.205 0 0);
  --secondary: oklch(0.269 0 0);
  --secondary-foreground: oklch(0.985 0 0);
  --muted: oklch(0.269 0 0);
  --muted-foreground: oklch(0.708 0 0);
  --accent: oklch(0.269 0 0);
  --accent-foreground: oklch(0.985 0 0);
  --destructive: oklch(0.704 0.191 22.216);
  --border: oklch(1 0 0 / 10%);
  --input: oklch(1 0 0 / 15%);
  --ring: oklch(0.556 0 0);
  --chart-1: oklch(0.488 0.243 264.376);
  --chart-2: oklch(0.696 0.17 162.48);
  --chart-3: oklch(0.769 0.188 70.08);
  --chart-4: oklch(0.627 0.265 303.9);
  --chart-5: oklch(0.645 0.246 16.439);
  --sidebar: oklch(0.205 0 0);
  --sidebar-foreground: oklch(0.985 0 0);
  --sidebar-primary: oklch(0.488 0.243 264.376);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.269 0 0);
  --sidebar-accent-foreground: oklch(0.985 0 0);
  --sidebar-border: oklch(1 0 0 / 10%);
  --sidebar-ring: oklch(0.556 0 0);
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
  }
  button,
  [role="button"],
  [role="option"] {
    touch-action: manipulation;
  }
}
```

```tsx app/layout.tsx
import "./globals.css";

import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "Pawpoint — Hillside Veterinary Clinic",
  description: "Front-desk and records software for Hillside Veterinary Clinic.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
```

```tsx app/page.tsx
import { AppShell } from "@/components/pawpoint/app-shell";
import { ScheduleView } from "@/components/pawpoint/schedule-view";

export default function Page() {
  return (
    <AppShell>
      <ScheduleView />
    </AppShell>
  );
}
```

```tsx app/patients/[id]/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CalendarClock,
  CircleCheck,
  Phone,
  Pill,
  ShieldAlert,
  Syringe,
  TrendingDown,
  TrendingUp,
  TriangleAlert,
} from "lucide-react";
import { AppShell } from "@/components/pawpoint/app-shell";
import { StatusBadge } from "@/components/pawpoint/status-badge";
import { WeightChart } from "@/components/pawpoint/weight-chart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  initialAppointments,
  ownerById,
  patientById,
  patients,
  records,
  today,
  vetById,
} from "@/lib/data";
import {
  ageLabel,
  endTime,
  formatDate,
  formatLongDate,
  usd,
  vaccineStatus,
} from "@/lib/schedule";
import { cn } from "@/lib/utils";

export function generateStaticParams() {
  return patients.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const patient = patientById(id);
  return { title: patient ? `${patient.name} — Pawpoint` : "Patient — Pawpoint" };
}

export default async function PatientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const patient = patientById(id);
  if (!patient) notFound();

  const owner = ownerById(patient.owner);
  const record = records[patient.id];
  const todays = initialAppointments.filter((a) => a.patient === patient.id && a.status !== "cancelled");
  const overdue = record
    ? record.vaccinations.filter((v) => vaccineStatus(v.due, today).state === "overdue")
    : [];

  const weights = record?.weights_kg ?? [];
  const first = weights[0];
  const last = weights[weights.length - 1];
  const change = first && last ? last.kg - first.kg : 0;
  const changePct = first && last ? (change / first.kg) * 100 : 0;

  return (
    <AppShell>
      <div className="grid gap-5">
        <Link
          href="/"
          className="inline-flex min-h-11 w-fit items-center gap-1.5 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Today’s schedule
        </Link>

        {patient.alerts.length > 0 && (
          <section
            aria-labelledby="alerts-heading"
            className="rounded-2xl border-2 border-red-900 bg-red-700 p-4 text-white shadow-sm md:p-5"
          >
            <h2 id="alerts-heading" className="flex items-center gap-2 text-sm font-bold tracking-wider uppercase">
              <TriangleAlert className="size-5" aria-hidden />
              Medical alerts for {patient.name}
            </h2>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {patient.alerts.map((alert) => (
                <li key={alert} className="rounded-lg bg-white px-4 py-3 text-lg leading-snug font-bold text-red-900">
                  {alert}
                </li>
              ))}
            </ul>
          </section>
        )}

        <Card className="gap-0 py-0">
          <div className="grid gap-5 p-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:p-6">
            <div className="flex items-start gap-4">
              <div
                className="grid size-16 shrink-0 place-items-center rounded-2xl bg-accent text-2xl font-semibold text-accent-foreground"
                aria-hidden
              >
                {patient.name[0]}
              </div>
              <div className="min-w-0">
                <h1 className="text-3xl font-semibold tracking-tight">{patient.name}</h1>
                <p className="text-muted-foreground">
                  {patient.species} · {patient.breed}
                </p>
                <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
                  <dt className="text-muted-foreground">Sex</dt>
                  <dd className="font-medium">{patient.sex}</dd>
                  <dt className="text-muted-foreground">Born</dt>
                  <dd className="font-medium">
                    {formatDate(patient.born)} ({ageLabel(patient.born, today)})
                  </dd>
                  <dt className="text-muted-foreground">Patient ID</dt>
                  <dd className="font-medium tabular-nums">{patient.id}</dd>
                </dl>
              </div>
            </div>

            <div className="grid content-start gap-4 border-t pt-4 md:border-t-0 md:border-l md:pt-0 md:pl-6">
              <div>
                <h2 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">Owner</h2>
                <p className="mt-1 text-lg font-semibold">{owner.name}</p>
                <a
                  href={`tel:${owner.phone.replace(/\s/g, "")}`}
                  className="mt-1 inline-flex min-h-11 items-center gap-2 rounded-lg border bg-card px-3 text-sm font-medium tabular-nums hover:bg-accent"
                >
                  <Phone className="size-4" aria-hidden />
                  {owner.phone}
                </a>
              </div>
              <div>
                <h2 className="flex items-center gap-1.5 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  <CalendarClock className="size-3.5" aria-hidden />
                  Today, {formatLongDate(today)}
                </h2>
                {todays.length === 0 ? (
                  <p className="mt-1 text-sm text-muted-foreground">No appointments today.</p>
                ) : (
                  <ul className="mt-1.5 grid gap-1.5">
                    {todays.map((a) => (
                      <li key={a.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                        <span className="font-semibold tabular-nums">
                          {a.start}–{endTime(a.start, a.minutes)}
                        </span>
                        <span>
                          {a.reason} · {vetById(a.vet).name}
                        </span>
                        <StatusBadge status={a.status} />
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
          {overdue.length > 0 && (
            <div className="flex items-center gap-2 border-t bg-amber-100 px-4 py-3 text-sm font-semibold text-amber-950 md:px-6">
              <Syringe className="size-4 shrink-0" aria-hidden />
              {overdue.length} vaccinations overdue: {overdue.map((v) => v.name).join(", ")}
            </div>
          )}
        </Card>

        {!record ? (
          <Card>
            <CardHeader>
              <CardTitle>No clinical history on screen</CardTitle>
              <CardDescription>
                Weight, vaccination and visit records for {patient.name} are not loaded in this demo. Details above are current.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-start">
            <div className="grid content-start gap-5 lg:col-start-1 lg:row-start-1">
              <Card className="gap-3">
                <CardHeader>
                  <CardTitle>Weight trend</CardTitle>
                  <CardDescription>
                    {weights.length} visits, {formatDate(first.date)} to {formatDate(last.date)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-3">
                  <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                    <p className="text-3xl font-semibold tabular-nums">
                      {last.kg.toFixed(1)} <span className="text-base font-medium text-muted-foreground">kg now</span>
                    </p>
                    <p
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-sm font-semibold tabular-nums",
                        change < 0 ? "bg-amber-100 text-amber-950" : "bg-emerald-50 text-emerald-900",
                      )}
                    >
                      {change < 0 ? <TrendingDown className="size-4" aria-hidden /> : <TrendingUp className="size-4" aria-hidden />}
                      {change > 0 ? "+" : "−"}
                      {Math.abs(change).toFixed(1)} kg ({Math.abs(changePct).toFixed(1)}%) since {formatDate(first.date)}
                    </p>
                  </div>
                  <WeightChart points={weights} />
                </CardContent>
              </Card>

              <Card className="gap-3">
                <CardHeader>
                  <CardTitle>Visit history</CardTitle>
                  <CardDescription>Newest first</CardDescription>
                </CardHeader>
                <CardContent>
                  <ol className="relative grid gap-4 border-l-2 border-border pl-5">
                    {record.visits.map((v) => (
                      <li key={v.date} className="relative">
                        <span
                          className="absolute top-1.5 -left-[1.6rem] size-3 rounded-full border-2 border-primary bg-card"
                          aria-hidden
                        />
                        <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                          <h3 className="font-semibold">
                            {v.reason}
                            {v.date === today && (
                              <span className="ml-2 rounded bg-primary px-1.5 py-0.5 align-middle text-[11px] font-semibold text-primary-foreground">
                                TODAY
                              </span>
                            )}
                          </h3>
                          <span className="text-sm text-muted-foreground tabular-nums">{usd.format(v.invoice_usd)}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(v.date)} · {vetById(v.vet).name}
                        </p>
                        <p className="mt-1.5 rounded-lg bg-muted/70 p-3 text-sm leading-relaxed">{v.notes}</p>
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>
            </div>

            <div className="grid content-start gap-5 max-lg:order-first lg:col-start-2 lg:row-start-1">
              <Card className="gap-3">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Syringe className="size-4" aria-hidden />
                    Vaccinations
                  </CardTitle>
                  <CardDescription>Checked against {formatDate(today)}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="grid gap-2">
                    {record.vaccinations.map((v) => {
                      const s = vaccineStatus(v.due, today);
                      return (
                        <li
                          key={v.name}
                          data-state={s.state}
                          className={cn(
                            "rounded-lg border p-3",
                            s.state === "overdue" && "border-red-300 bg-red-50",
                            s.state === "soon" && "border-amber-300 bg-amber-50",
                          )}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-semibold">{v.name}</span>
                            {s.state === "overdue" ? (
                              <span className="inline-flex items-center gap-1 rounded-md bg-red-700 px-2 py-0.5 text-xs font-bold text-white">
                                <ShieldAlert className="size-3.5" aria-hidden />
                                OVERDUE {s.days} days
                              </span>
                            ) : s.state === "soon" ? (
                              <span className="rounded-md bg-amber-200 px-2 py-0.5 text-xs font-bold text-amber-950">Due in {s.days} days</span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-800">
                                <CircleCheck className="size-3.5" aria-hidden />
                                Up to date
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground">
                            Given {formatDate(v.given)} · due{" "}
                            <span className={cn(s.state === "overdue" && "font-semibold text-red-900")}>{formatDate(v.due)}</span>
                          </p>
                        </li>
                      );
                    })}
                  </ul>
                </CardContent>
              </Card>

              <Card className="gap-3">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Pill className="size-4" aria-hidden />
                    Current medications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="divide-y">
                    {record.medications.map((m) => (
                      <li key={m.name} className="py-2.5 first:pt-0 last:pb-0">
                        <div className="font-semibold">{m.name}</div>
                        <div className="text-sm">{m.dose}</div>
                        <div className="text-xs text-muted-foreground">Since {formatDate(m.since)}</div>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
```

```tsx components/pawpoint/alert-chips.tsx
import { TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Medical alerts. Solid red with a warning icon so they cannot be mistaken
 * for ordinary tags, wherever a patient appears.
 */
export function AlertChips({
  alerts,
  className,
  size = "sm",
}: {
  alerts: string[];
  className?: string;
  size?: "sm" | "lg";
}) {
  if (alerts.length === 0) return null;
  return (
    <ul className={cn("flex flex-wrap gap-1.5", className)} aria-label="Medical alerts">
      {alerts.map((alert) => (
        <li
          key={alert}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md bg-red-700 font-semibold text-white ring-1 ring-red-900/20",
            size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1.5 text-sm",
          )}
        >
          <TriangleAlert className={size === "sm" ? "size-3.5 shrink-0" : "size-4 shrink-0"} aria-hidden />
          <span className="sr-only">Medical alert: </span>
          {alert}
        </li>
      ))}
    </ul>
  );
}
```

```tsx components/pawpoint/app-shell.tsx
import Link from "next/link";
import { PawPrint } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PatientSearch } from "@/components/pawpoint/patient-search";
import { user } from "@/lib/data";

export function AppShell({ children }: { children: React.ReactNode }) {
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("");
  return (
    <div className="min-h-dvh">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
      >
        Skip to content
      </a>
      <header className="sticky top-0 z-40 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2.5 md:px-6">
          <Link href="/" className="flex items-center gap-2.5 rounded-md outline-offset-4">
            <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground">
              <PawPrint className="size-5" aria-hidden />
            </span>
            <span className="leading-tight">
              <span className="block text-base font-semibold tracking-tight">Pawpoint</span>
              <span className="hidden text-xs text-muted-foreground sm:block">Hillside Veterinary Clinic</span>
            </span>
          </Link>
          <div className="order-last w-full md:order-none md:ml-4 md:w-auto md:max-w-md md:flex-1">
            <PatientSearch />
          </div>
          <div className="ml-auto flex items-center gap-3">
            <div className="hidden text-right leading-tight sm:block">
              <div className="text-sm font-medium">{user.name}</div>
              <div className="text-xs text-muted-foreground">{user.role}</div>
            </div>
            <Avatar className="size-9">
              <AvatarFallback className="bg-accent text-sm font-semibold text-accent-foreground">{initials}</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>
      <main id="main" className="mx-auto max-w-7xl px-4 py-5 md:px-6 md:py-7">
        {children}
      </main>
    </div>
  );
}
```

```tsx components/pawpoint/booking-dialog.tsx
"use client";

import { useState } from "react";
import { CalendarPlus, CircleAlert } from "lucide-react";
import { AlertChips } from "@/components/pawpoint/alert-chips";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { type Appointment, ownerById, patientById, patients, today, vetById, vets } from "@/lib/data";
import {
  DAY_END,
  endTime,
  findPatientConflict,
  findVetConflict,
  formatLongDate,
  timeSlots,
  toMin,
} from "@/lib/schedule";

const DURATIONS = [15, 20, 30, 45, 60];
const SLOTS = timeSlots();

export function BookingDialog({
  appointments,
  onBook,
}: {
  appointments: Appointment[];
  onBook: (appointment: Omit<Appointment, "id" | "status">) => void;
}) {
  const [open, setOpen] = useState(false);
  const [patientId, setPatientId] = useState("");
  const [vetId, setVetId] = useState("");
  const [start, setStart] = useState("");
  const [minutes, setMinutes] = useState("20");
  const [reason, setReason] = useState("");
  const [touched, setTouched] = useState(false);

  const duration = Number(minutes);
  const patient = patientById(patientId);
  const vetConflict = vetId && start ? findVetConflict(appointments, vetId, start, duration) : undefined;
  const patientConflict = patientId && start ? findPatientConflict(appointments, patientId, start, duration) : undefined;
  const pastClose = start !== "" && toMin(start) + duration > DAY_END;
  const complete = patientId !== "" && vetId !== "" && start !== "";
  const blocked = Boolean(vetConflict || patientConflict || pastClose);

  function reset() {
    setPatientId("");
    setVetId("");
    setStart("");
    setMinutes("20");
    setReason("");
    setTouched(false);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (!complete || blocked) return;
    onBook({
      patient: patientId,
      vet: vetId,
      start,
      minutes: duration,
      reason: reason.trim() || "Follow-up visit",
    });
    setOpen(false);
    reset();
  }

  function slotBusy(slot: string): boolean {
    if (!vetId) return false;
    return Boolean(findVetConflict(appointments, vetId, slot, duration)) || toMin(slot) + duration > DAY_END;
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button size="lg" className="h-11 gap-2 px-5 text-base" aria-controls={open ? undefined : undefined}>
          <CalendarPlus aria-hidden />
          New appointment
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[92dvh] overflow-y-auto sm:max-w-lg">
        <form onSubmit={submit} noValidate className="grid gap-5">
          <DialogHeader>
            <DialogTitle>Book an appointment</DialogTitle>
            <DialogDescription>{formatLongDate(today)}. Pick a patient, a vet and a time.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-2">
            <Label htmlFor="book-patient">Patient</Label>
            <Select value={patientId} onValueChange={setPatientId}>
              <SelectTrigger id="book-patient" className="h-11 w-full" aria-invalid={touched && !patientId}>
                <SelectValue placeholder="Choose a patient" />
              </SelectTrigger>
              <SelectContent>
                {patients.map((p) => (
                  <SelectItem key={p.id} value={p.id} className="min-h-10">
                    {p.name} · {p.species} · {ownerById(p.owner).name}
                    {p.alerts.length > 0 ? " · ALERT" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {patient && patient.alerts.length > 0 && <AlertChips alerts={patient.alerts} />}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="book-vet">Vet</Label>
            <Select value={vetId} onValueChange={setVetId}>
              <SelectTrigger id="book-vet" className="h-11 w-full" aria-invalid={touched && !vetId}>
                <SelectValue placeholder="Choose a vet" />
              </SelectTrigger>
              <SelectContent>
                {vets.map((v) => (
                  <SelectItem key={v.id} value={v.id} className="min-h-10">
                    {v.name} · {v.room}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="book-time">Time</Label>
              <Select value={start} onValueChange={setStart}>
                <SelectTrigger id="book-time" className="h-11 w-full" aria-invalid={(touched && !start) || blocked}>
                  <SelectValue placeholder="Choose a time" />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  {SLOTS.map((slot) => (
                    <SelectItem key={slot} value={slot} className="min-h-10">
                      {slot}
                      {slotBusy(slot) ? " · busy" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="book-length">Length</Label>
              <Select value={minutes} onValueChange={setMinutes}>
                <SelectTrigger id="book-length" className="h-11 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DURATIONS.map((d) => (
                    <SelectItem key={d} value={String(d)} className="min-h-10">
                      {d} min
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="book-reason">Reason for visit</Label>
            <Input
              id="book-reason"
              className="h-11"
              placeholder="Follow-up visit"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>

          <div aria-live="polite" className="grid gap-2">
            {vetConflict && (
              <p role="alert" className="flex items-start gap-2 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-900">
                <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
                <span>
                  {vetById(vetId).name} is already booked {vetConflict.start}–{endTime(vetConflict.start, vetConflict.minutes)} (
                  {patientById(vetConflict.patient)?.name}, {vetConflict.reason}). Choose another time or vet.
                </span>
              </p>
            )}
            {!vetConflict && patientConflict && (
              <p role="alert" className="flex items-start gap-2 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-900">
                <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
                <span>
                  {patient?.name} already has an appointment {patientConflict.start}–
                  {endTime(patientConflict.start, patientConflict.minutes)} with {vetById(patientConflict.vet).name}.
                </span>
              </p>
            )}
            {pastClose && (
              <p role="alert" className="flex items-start gap-2 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-900">
                <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
                <span>The clinic closes at 17:00. Pick an earlier time or a shorter visit.</span>
              </p>
            )}
            {touched && !complete && (
              <p role="alert" className="text-sm text-red-800">
                Choose a patient, a vet and a time to book.
              </p>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button type="button" variant="outline" className="h-11" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="h-11" disabled={blocked}>
              Book appointment
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

```tsx components/pawpoint/patient-search.tsx
"use client";

import { useId, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, TriangleAlert } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ownerById, patients } from "@/lib/data";
import { cn } from "@/lib/utils";

export function PatientSearch({ className }: { className?: string }) {
  const router = useRouter();
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return patients
      .map((p) => ({ patient: p, owner: ownerById(p.owner) }))
      .filter(({ patient, owner }) =>
        [patient.name, owner.name, patient.species, patient.breed].some((s) => s.toLowerCase().includes(q)),
      );
  }, [query]);

  const showList = open && query.trim().length > 0;

  function go(id: string) {
    setOpen(false);
    setQuery("");
    inputRef.current?.blur();
    router.push(`/patients/${id}`);
  }

  return (
    <div
      className={cn("relative", className)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false);
      }}
    >
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
      <Input
        ref={inputRef}
        type="search"
        role="combobox"
        aria-label="Search patients or owners"
        aria-expanded={showList}
        aria-controls={showList ? listId : undefined}
        aria-autocomplete="list"
        aria-activedescendant={showList && results[active] ? `${listId}-${results[active].patient.id}` : undefined}
        placeholder="Search patient or owner"
        autoComplete="off"
        className="h-11 bg-card pl-9 text-base md:text-sm"
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
            setOpen(true);
            setActive((i) => Math.min(i + 1, Math.max(results.length - 1, 0)));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActive((i) => Math.max(i - 1, 0));
          } else if (e.key === "Enter" && showList && results[active]) {
            e.preventDefault();
            go(results[active].patient.id);
          } else if (e.key === "Escape") {
            setOpen(false);
          }
        }}
      />
      {showList && (
        <ul
          id={listId}
          role="listbox"
          aria-label="Matching patients"
          className="absolute top-full right-0 left-0 z-50 mt-1.5 max-h-[60vh] overflow-auto rounded-xl border bg-popover p-1 shadow-lg"
        >
          {results.length === 0 && (
            <li role="presentation" className="px-3 py-4 text-sm text-muted-foreground">
              No patient or owner matches “{query.trim()}”.
            </li>
          )}
          {results.map(({ patient, owner }, i) => (
            <li
              key={patient.id}
              id={`${listId}-${patient.id}`}
              role="option"
              aria-selected={i === active}
              tabIndex={-1}
              onMouseEnter={() => setActive(i)}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => go(patient.id)}
              className={cn(
                "flex min-h-12 cursor-pointer items-center gap-3 rounded-lg px-3 py-2",
                i === active && "bg-accent",
              )}
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2">
                  <span className="font-semibold">{patient.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {patient.species} · {patient.breed}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground">Owner: {owner.name}</div>
              </div>
              {patient.alerts.length > 0 && (
                <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-red-700 px-2 py-0.5 text-xs font-semibold text-white">
                  <TriangleAlert className="size-3.5" aria-hidden />
                  {patient.alerts.length === 1 ? "Alert" : `${patient.alerts.length} alerts`}
                  <span className="sr-only">: {patient.alerts.join("; ")}</span>
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

```tsx components/pawpoint/schedule-view.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Clock, DoorOpen, Hourglass, Siren, Stethoscope, UserCheck } from "lucide-react";
import { AlertChips } from "@/components/pawpoint/alert-chips";
import { BookingDialog } from "@/components/pawpoint/booking-dialog";
import { StatusBadge } from "@/components/pawpoint/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  type Appointment,
  initialAppointments,
  ownerById,
  patientById,
  today,
  vetById,
  vets,
} from "@/lib/data";
import { endTime, formatLongDate, fromMin, toMin } from "@/lib/schedule";
import { useClock } from "@/lib/use-clock";
import { cn } from "@/lib/utils";

const LONG_WAIT = 20;

function sortAppointments(list: Appointment[]): Appointment[] {
  return [...list].sort(
    (a, b) =>
      toMin(a.start) - toMin(b.start) ||
      vets.findIndex((v) => v.id === a.vet) - vets.findIndex((v) => v.id === b.vet),
  );
}

export function ScheduleView() {
  const now = useClock();
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const [vetFilter, setVetFilter] = useState("all");
  const [hideFinished, setHideFinished] = useState(false);
  const [recent, setRecent] = useState<string | null>(null);

  useEffect(() => {
    if (!recent) return;
    const id = window.setTimeout(() => setRecent(null), 5000);
    return () => window.clearTimeout(id);
  }, [recent]);

  const sorted = useMemo(() => sortAppointments(appointments), [appointments]);

  const visible = sorted.filter(
    (a) =>
      (vetFilter === "all" || a.vet === vetFilter) &&
      !(hideFinished && (a.status === "done" || a.status === "cancelled")),
  );

  const waiting = sorted
    .filter((a) => a.status === "checked_in")
    .sort((a, b) => toMin(a.start) - toMin(b.start));
  const count = (s: Appointment["status"]) => appointments.filter((a) => a.status === s).length;
  const waitMinutes = (a: Appointment) => Math.max(0, now - toMin(a.checkedInAt ?? fromMin(now)));
  const longest = waiting.reduce((max, a) => Math.max(max, waitMinutes(a)), 0);

  function setStatus(id: string, status: Appointment["status"]) {
    setAppointments((list) =>
      list.map((a) => (a.id === id ? { ...a, status, checkedInAt: status === "checked_in" ? fromMin(now) : a.checkedInAt } : a)),
    );
  }

  function checkIn(a: Appointment) {
    const patient = patientById(a.patient);
    setStatus(a.id, "checked_in");
    toast.success(`${patient?.name ?? "Patient"} checked in`, {
      description: `Added to the waiting list for ${vetById(a.vet).name}.`,
    });
  }

  function book(draft: Omit<Appointment, "id" | "status">) {
    const id = `a-${String(appointments.length + 1).padStart(2, "0")}`;
    setAppointments((list) => [...list, { ...draft, id, status: "booked" }]);
    setRecent(id);
    setVetFilter((f) => (f === "all" || f === draft.vet ? f : "all"));
    setHideFinished(false);
    toast.success(`Booked ${patientById(draft.patient)?.name ?? "patient"} at ${draft.start}`, {
      description: `${vetById(draft.vet).name} · ${draft.reason}`,
    });
  }

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Today’s schedule</h1>
          <p className="mt-1 flex flex-wrap items-center gap-x-3 text-sm text-muted-foreground">
            <span>{formatLongDate(today)}</span>
            <span className="inline-flex items-center gap-1 font-medium text-foreground tabular-nums">
              <Clock className="size-3.5" aria-hidden />
              <span className="sr-only">Desk time </span>
              {fromMin(now)}
            </span>
          </p>
        </div>
        <BookingDialog appointments={appointments} onBook={book} />
      </div>

      <dl className="grid grid-cols-2 gap-3 md:grid-cols-4" aria-label="Clinic status">
        <Stat label="Waiting now" value={count("checked_in")} icon={<DoorOpen className="size-4" aria-hidden />} tone="amber" live />
        <Stat label="In exam" value={count("in_exam")} icon={<Stethoscope className="size-4" aria-hidden />} tone="sky" />
        <Stat label="Still to arrive" value={count("booked")} icon={<Clock className="size-4" aria-hidden />} />
        <Stat label="Seen today" value={count("done")} icon={<UserCheck className="size-4" aria-hidden />} tone="emerald" />
      </dl>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
        <aside className="grid gap-5 lg:col-start-2 lg:row-start-1" aria-label="Waiting room and vets">
          <Card className="gap-3 py-4">
            <CardHeader className="px-4">
              <CardTitle className="flex items-center gap-2 text-base">
                <Hourglass className="size-4" aria-hidden />
                Waiting list
              </CardTitle>
              <CardDescription aria-live="polite">
                {waiting.length === 0
                  ? "Nobody is waiting."
                  : `${waiting.length} checked in${longest >= LONG_WAIT ? ` · longest wait ${longest} min` : ""}`}
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4">
              {waiting.length === 0 ? (
                <p className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
                  Check in a booked patient and they will appear here.
                </p>
              ) : (
                <ol className="grid gap-2" aria-label="Checked in, in order of appointment time">
                  {waiting.map((a, i) => {
                    const patient = patientById(a.patient);
                    const wait = waitMinutes(a);
                    const long = wait >= LONG_WAIT;
                    return (
                      <li key={a.id} className={cn("rounded-lg border p-3", long ? "border-amber-300 bg-amber-50" : "bg-card")}>
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-x-2">
                              <Link href={`/patients/${a.patient}`} className="font-semibold underline-offset-4 hover:underline">
                                {patient?.name}
                              </Link>
                              {i === 0 && (
                                <span className="rounded bg-primary px-1.5 py-0.5 text-[11px] font-semibold text-primary-foreground">NEXT</span>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {ownerById(patient?.owner ?? "").name} · {a.reason}
                            </p>
                          </div>
                          <div className="shrink-0 text-right">
                            <div className={cn("text-lg leading-none font-semibold tabular-nums", long && "text-amber-900")}>
                              {wait}
                              <span className="ml-0.5 text-xs font-medium"> min</span>
                            </div>
                            <div className="mt-1 text-[11px] text-muted-foreground">waiting</div>
                          </div>
                        </div>
                        <p className="mt-1.5 text-xs text-muted-foreground">
                          {vetById(a.vet).name} · {vetById(a.vet).room} · booked {a.start}
                          {long && <span className="ml-1 font-semibold text-amber-900">· Long wait</span>}
                        </p>
                        {patient && patient.alerts.length > 0 && <AlertChips alerts={patient.alerts} className="mt-2" />}
                      </li>
                    );
                  })}
                </ol>
              )}
            </CardContent>
          </Card>

          <Card className="gap-3 py-4">
            <CardHeader className="px-4">
              <CardTitle className="text-base">Vets right now</CardTitle>
            </CardHeader>
            <CardContent className="px-4">
              <ul className="divide-y">
                {vets.map((v) => {
                  const current = appointments.find((a) => a.vet === v.id && a.status === "in_exam");
                  const next = sorted.find((a) => a.vet === v.id && a.status === "booked" && toMin(a.start) >= now - 15);
                  return (
                    <li key={v.id} className="flex items-start justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
                      <div>
                        <div className="text-sm font-medium">{v.name}</div>
                        <div className="text-xs text-muted-foreground">{v.room}</div>
                      </div>
                      <div className="text-right text-sm">
                        {current ? (
                          <span className="font-medium text-sky-900">With {patientById(current.patient)?.name}</span>
                        ) : (
                          <span className="font-medium text-emerald-800">Free</span>
                        )}
                        <div className="text-xs text-muted-foreground">
                          {next ? `Next ${next.start} · ${patientById(next.patient)?.name}` : "Nothing more booked"}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </CardContent>
          </Card>
        </aside>

        <section className="min-w-0 lg:col-start-1 lg:row-start-1" aria-labelledby="appts-heading">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
            <h2 id="appts-heading" className="text-lg font-semibold">
              Appointments <span className="font-normal text-muted-foreground">({visible.length})</span>
            </h2>
            <div className="flex items-center gap-2">
              <Switch id="hide-finished" checked={hideFinished} onCheckedChange={setHideFinished} />
              <Label htmlFor="hide-finished" className="text-sm">
                Hide done and cancelled
              </Label>
            </div>
          </div>
          <div role="group" aria-label="Filter by vet" className="mb-3 flex flex-wrap gap-2">
            {[{ id: "all", label: "All vets" }, ...vets.map((v) => ({ id: v.id, label: `Dr. ${v.name.split(" ").slice(-1)[0]}` }))].map((f) => (
              <Button
                key={f.id}
                type="button"
                size="sm"
                variant={vetFilter === f.id ? "default" : "outline"}
                aria-pressed={vetFilter === f.id}
                className="h-10 px-4"
                onClick={() => setVetFilter(f.id)}
              >
                {f.label}
              </Button>
            ))}
          </div>

          {visible.length === 0 ? (
            <p className="rounded-xl border border-dashed bg-card p-8 text-center text-muted-foreground">No appointments match.</p>
          ) : (
            <ul className="grid gap-2.5">
              {visible.map((a) => (
                <AppointmentRow
                  key={a.id}
                  appointment={a}
                  highlight={a.id === recent}
                  now={now}
                  onCheckIn={() => checkIn(a)}
                  onToExam={() => setStatus(a.id, "in_exam")}
                  onDone={() => setStatus(a.id, "done")}
                />
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

const TONE: Record<string, string> = {
  amber: "text-amber-800",
  sky: "text-sky-800",
  emerald: "text-emerald-800",
  none: "text-muted-foreground",
};

function Stat({
  label,
  value,
  icon,
  tone = "none",
  live,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  tone?: "amber" | "sky" | "emerald" | "none";
  live?: boolean;
}) {
  return (
    <div className="rounded-xl border bg-card p-3.5 md:p-4">
      <dt className={cn("flex items-center gap-1.5 text-xs font-medium", TONE[tone])}>
        {icon}
        {label}
      </dt>
      <dd className="mt-1 text-3xl leading-none font-semibold tabular-nums" aria-live={live ? "polite" : undefined}>
        {value}
      </dd>
    </div>
  );
}

function AppointmentRow({
  appointment: a,
  highlight,
  now,
  onCheckIn,
  onToExam,
  onDone,
}: {
  appointment: Appointment;
  highlight: boolean;
  now: number;
  onCheckIn: () => void;
  onToExam: () => void;
  onDone: () => void;
}) {
  const patient = patientById(a.patient);
  const owner = ownerById(patient?.owner ?? "");
  const vet = vetById(a.vet);
  const finished = a.status === "done" || a.status === "cancelled";
  const late = a.status === "booked" && toMin(a.start) < now;
  return (
    <li
      data-status={a.status}
      data-urgent={a.urgent ? "true" : undefined}
      className={cn(
        "grid grid-cols-[4.25rem_minmax(0,1fr)] gap-x-3 gap-y-3 rounded-xl border bg-card p-3.5 sm:grid-cols-[4.75rem_minmax(0,1fr)_auto] sm:p-4",
        a.urgent && !finished && "border-l-[6px] border-l-orange-600 bg-orange-50 ring-1 ring-orange-200",
        finished && "bg-card/60 text-muted-foreground",
        a.status === "in_exam" && "border-sky-200",
        highlight && "ring-2 ring-primary",
      )}
    >
      <div className="tabular-nums">
        <div className={cn("text-lg leading-tight font-semibold", finished ? "text-muted-foreground" : "text-foreground")}>{a.start}</div>
        <div className="text-xs text-muted-foreground">to {endTime(a.start, a.minutes)}</div>
        <div className="text-xs text-muted-foreground">{a.minutes} min</div>
      </div>

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <Link
            href={`/patients/${a.patient}`}
            className={cn("text-base font-semibold underline-offset-4 hover:underline", finished ? "text-foreground/70" : "text-foreground")}
          >
            {patient?.name}
          </Link>
          <span className="text-sm text-muted-foreground">
            {patient?.species} · {patient?.breed}
          </span>
          {a.urgent && (
            <span className="inline-flex items-center gap-1 rounded-md bg-orange-700 px-2 py-0.5 text-xs font-bold tracking-wide text-white uppercase">
              <Siren className="size-3.5" aria-hidden />
              Urgent
            </span>
          )}
        </div>
        <p className={cn("mt-0.5 text-sm", a.status === "cancelled" && "line-through")}>
          <span className={finished ? "" : "font-medium text-foreground"}>{a.reason}</span>
        </p>
        <p className="text-sm text-muted-foreground">
          Owner {owner.name} · {vet.name}, {vet.room}
        </p>
        {patient && patient.alerts.length > 0 && <AlertChips alerts={patient.alerts} className="mt-2" />}
      </div>

      <div className="col-span-2 flex items-center justify-between gap-3 sm:col-span-1 sm:col-start-3 sm:row-start-1 sm:flex-col sm:items-end sm:justify-start">
        <div className="flex flex-col items-start gap-1 sm:items-end">
          <StatusBadge status={a.status} />
          {late && <span className="text-xs font-medium text-amber-900">Not arrived yet</span>}
        </div>
        {a.status === "booked" && (
          <Button onClick={onCheckIn} className="h-11 px-5" aria-label={`Check in ${patient?.name}`}>
            <UserCheck aria-hidden />
            Check in
          </Button>
        )}
        {a.status === "checked_in" && (
          <Button onClick={onToExam} variant="outline" className="h-11 px-4" aria-label={`To exam: ${patient?.name}`}>
            <Stethoscope aria-hidden />
            To exam
          </Button>
        )}
        {a.status === "in_exam" && (
          <Button onClick={onDone} variant="outline" className="h-11 px-4" aria-label={`Mark done: ${patient?.name}`}>
            Mark done
          </Button>
        )}
      </div>
    </li>
  );
}
```

```tsx components/pawpoint/status-badge.tsx
import { Check, CircleDashed, DoorOpen, Stethoscope, X } from "lucide-react";
import type { Status } from "@/lib/data";
import { STATUS_LABEL } from "@/lib/schedule";
import { cn } from "@/lib/utils";

const STYLE: Record<Status, string> = {
  booked: "border-slate-300 bg-white text-slate-700",
  checked_in: "border-amber-300 bg-amber-100 text-amber-950",
  in_exam: "border-sky-300 bg-sky-100 text-sky-950",
  done: "border-emerald-200 bg-emerald-50 text-emerald-900",
  cancelled: "border-slate-200 bg-slate-100 text-slate-600 line-through",
};

const ICON: Record<Status, typeof Check> = {
  booked: CircleDashed,
  checked_in: DoorOpen,
  in_exam: Stethoscope,
  done: Check,
  cancelled: X,
};

export function StatusBadge({ status, className }: { status: Status; className?: string }) {
  const Icon = ICON[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        STYLE[status],
        className,
      )}
    >
      <Icon className="size-3" aria-hidden />
      {STATUS_LABEL[status]}
    </span>
  );
}
```

```tsx components/pawpoint/weight-chart.tsx
"use client";

import { CartesianGrid, LabelList, Line, LineChart, XAxis, YAxis } from "recharts";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import type { WeightPoint } from "@/lib/data";
import { formatDate, formatShortDate } from "@/lib/schedule";

const config = {
  kg: { label: "Weight (kg)", color: "var(--chart-1)" },
} satisfies ChartConfig;

export function WeightChart({ points }: { points: WeightPoint[] }) {
  const data = points.map((p) => ({ ...p, label: formatShortDate(p.date) }));
  const values = points.map((p) => p.kg);
  const min = Math.floor(Math.min(...values) - 1);
  const max = Math.ceil(Math.max(...values) + 1);

  return (
    <div>
      <ChartContainer config={config} className="aspect-auto h-56 w-full sm:h-64" role="img" aria-label={`Weight in kilograms over ${points.length} visits, from ${points[0]?.kg} to ${points[points.length - 1]?.kg}`}>
        <LineChart data={data} margin={{ top: 22, right: 20, left: 0, bottom: 4 }}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} interval={0} padding={{ left: 16, right: 8 }} />
          <YAxis domain={[min, max]} width={34} tickLine={false} axisLine={false} tickCount={max - min + 1} />
          <ChartTooltip
            cursor={false}
            content={
              <ChartTooltipContent
                labelFormatter={(_, payload) => {
                  const date = (payload?.[0]?.payload as { date?: string } | undefined)?.date;
                  return date ? formatDate(date) : "";
                }}
              />
            }
          />
          <Line
            dataKey="kg"
            type="monotone"
            stroke="var(--color-kg)"
            strokeWidth={2.5}
            dot={{ r: 4, fill: "var(--color-kg)", strokeWidth: 0 }}
            activeDot={{ r: 6 }}
            isAnimationActive={false}
          >
            <LabelList dataKey="kg" position="top" offset={10} className="fill-foreground text-[11px] font-medium" />
          </Line>
        </LineChart>
      </ChartContainer>
      <table className="sr-only">
        <caption>Weight history</caption>
        <thead>
          <tr>
            <th>Date</th>
            <th>Weight (kg)</th>
          </tr>
        </thead>
        <tbody>
          {points.map((p) => (
            <tr key={p.date}>
              <td>{formatDate(p.date)}</td>
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
  /** Time the patient was checked in at the desk (HH:MM), for the waiting list. */
  checkedInAt?: string;
}

export interface WeightPoint {
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
  weights_kg: WeightPoint[];
  vaccinations: Vaccination[];
  medications: Medication[];
  visits: Visit[];
}

export const clinic = "Pawpoint";
export const clinicTagline = "Front desk and records for Hillside Veterinary Clinic";
export const today = "2026-11-12";
/** The desk clock when the page opens (HH:MM). It keeps running from here. */
export const clockStart = "09:40";

export const user = { name: "Rosa Lindqvist", role: "Receptionist" };

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
  { id: "p-101", name: "Biscuit", species: "Dog", breed: "Beagle", born: "2019-04-02", sex: "Male, neutered", owner: "o-1", alerts: [] },
  { id: "p-102", name: "Mochi", species: "Cat", breed: "Domestic shorthair", born: "2021-07-15", sex: "Female, spayed", owner: "o-2", alerts: ["Bites when restrained"] },
  { id: "p-103", name: "Pepper", species: "Dog", breed: "Border collie", born: "2016-01-20", sex: "Female, spayed", owner: "o-3", alerts: [] },
  { id: "p-104", name: "Olive", species: "Dog", breed: "Labrador retriever", born: "2014-09-08", sex: "Female, spayed", owner: "o-4", alerts: ["Penicillin allergy", "Chronic kidney disease, stage 2"] },
  { id: "p-105", name: "Kiwi", species: "Bird", breed: "Budgerigar", born: "2023-03-11", sex: "Male", owner: "o-5", alerts: [] },
  { id: "p-106", name: "Tofu", species: "Rabbit", breed: "Holland lop", born: "2022-05-30", sex: "Female", owner: "o-6", alerts: [] },
  { id: "p-107", name: "Ziggy", species: "Cat", breed: "Maine coon", born: "2018-11-02", sex: "Male, neutered", owner: "o-2", alerts: ["Diabetic: insulin twice daily"] },
  { id: "p-108", name: "Bruno", species: "Dog", breed: "French bulldog", born: "2022-02-14", sex: "Male", owner: "o-5", alerts: ["Brachycephalic: sedation risk"] },
];

export const initialAppointments: Appointment[] = [
  { id: "a-01", patient: "p-101", vet: "v-1", start: "08:30", minutes: 20, reason: "Annual vaccination", status: "done" },
  { id: "a-02", patient: "p-104", vet: "v-2", start: "08:30", minutes: 30, reason: "Kidney panel recheck", status: "done" },
  { id: "a-03", patient: "p-108", vet: "v-3", start: "08:00", minutes: 120, reason: "Soft palate surgery", status: "in_exam" },
  { id: "a-04", patient: "p-102", vet: "v-1", start: "09:00", minutes: 30, reason: "Limping, left hind leg", status: "in_exam" },
  { id: "a-05", patient: "p-107", vet: "v-2", start: "09:15", minutes: 20, reason: "Glucose curve", status: "checked_in", checkedInAt: "09:12" },
  { id: "a-06", patient: "p-105", vet: "v-1", start: "09:45", minutes: 20, reason: "Beak and nail trim", status: "checked_in", checkedInAt: "09:36" },
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
      { date: "2026-11-12", vet: "v-2", reason: "Kidney panel recheck", notes: "Creatinine 2.1 mg/dL (was 2.0). Weight down 0.6 kg. Continue benazepril, recheck in 3 months.", invoice_usd: 186.0 },
      { date: "2026-06-17", vet: "v-2", reason: "Kidney panel recheck", notes: "Stable. Appetite good. Owner reports more drinking in hot weather.", invoice_usd: 172.5 },
      { date: "2026-02-11", vet: "v-1", reason: "Coughing", notes: "Mild kennel cough. Supportive care; no antibiotics given (penicillin allergy).", invoice_usd: 94.0 },
      { date: "2025-11-03", vet: "v-2", reason: "Senior wellness exam", notes: "Grade 2 dental tartar. Dental cleaning recommended.", invoice_usd: 148.0 },
    ],
  },
};

export const vetById = (id: string): Vet => vets.find((v) => v.id === id) ?? vets[0];
export const ownerById = (id: string): Owner => owners.find((o) => o.id === id) ?? owners[0];
export const patientById = (id: string): Patient | undefined => patients.find((p) => p.id === id);
```

```ts lib/schedule.ts
import type { Appointment, Status } from "@/lib/data";

export const STATUS_LABEL: Record<Status, string> = {
  booked: "Booked",
  checked_in: "Checked in",
  in_exam: "In exam",
  done: "Done",
  cancelled: "Cancelled",
};

export const DAY_START = 8 * 60;
export const DAY_END = 17 * 60;

export function toMin(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function fromMin(total: number): string {
  const h = Math.floor(total / 60);
  const m = Math.floor(total % 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function endTime(start: string, minutes: number): string {
  return fromMin(toMin(start) + minutes);
}

/** An active (not cancelled, not already finished early) booking blocks its slot. */
export function findVetConflict(
  appointments: Appointment[],
  vet: string,
  start: string,
  minutes: number,
): Appointment | undefined {
  const s = toMin(start);
  const e = s + minutes;
  return appointments.find(
    (a) =>
      a.vet === vet &&
      a.status !== "cancelled" &&
      toMin(a.start) < e &&
      s < toMin(a.start) + a.minutes,
  );
}

export function findPatientConflict(
  appointments: Appointment[],
  patient: string,
  start: string,
  minutes: number,
): Appointment | undefined {
  const s = toMin(start);
  const e = s + minutes;
  return appointments.find(
    (a) =>
      a.patient === patient &&
      a.status !== "cancelled" &&
      toMin(a.start) < e &&
      s < toMin(a.start) + a.minutes,
  );
}

export function timeSlots(): string[] {
  const slots: string[] = [];
  for (let m = DAY_START; m < DAY_END; m += 15) slots.push(fromMin(m));
  return slots;
}

const UTC = { timeZone: "UTC" } as const;

export function formatLongDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    ...UTC,
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${iso}T00:00:00Z`));
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    ...UTC,
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${iso}T00:00:00Z`));
}

export function formatShortDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", { ...UTC, month: "short", year: "2-digit" }).format(
    new Date(`${iso}T00:00:00Z`),
  );
}

export function daysBetween(fromIso: string, toIso: string): number {
  const a = Date.parse(`${fromIso}T00:00:00Z`);
  const b = Date.parse(`${toIso}T00:00:00Z`);
  return Math.round((b - a) / 86_400_000);
}

export function ageLabel(born: string, todayIso: string): string {
  const b = new Date(`${born}T00:00:00Z`);
  const t = new Date(`${todayIso}T00:00:00Z`);
  let months =
    (t.getUTCFullYear() - b.getUTCFullYear()) * 12 + (t.getUTCMonth() - b.getUTCMonth());
  if (t.getUTCDate() < b.getUTCDate()) months -= 1;
  if (months < 24) return `${months} months`;
  return `${Math.floor(months / 12)} years`;
}

export type VaccineState = "overdue" | "soon" | "ok";

export function vaccineStatus(due: string, todayIso: string): { state: VaccineState; days: number } {
  const days = daysBetween(todayIso, due);
  if (days < 0) return { state: "overdue", days: -days };
  if (days <= 30) return { state: "soon", days };
  return { state: "ok", days };
}

export const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
```

```ts lib/use-clock.ts
"use client";

import { useEffect, useState } from "react";
import { clockStart } from "@/lib/data";
import { toMin } from "@/lib/schedule";

/**
 * The desk clock, in minutes since midnight. It starts at `clockStart` (so the
 * server and the first client render agree) and then keeps real time from there.
 */
export function useClock(): number {
  const [now, setNow] = useState(toMin(clockStart));

  useEffect(() => {
    const startedAt = Date.now();
    const base = toMin(clockStart);
    const id = window.setInterval(() => {
      setNow(base + Math.floor((Date.now() - startedAt) / 60_000));
    }, 10_000);
    return () => window.clearInterval(id);
  }, []);

  return now;
}
```

