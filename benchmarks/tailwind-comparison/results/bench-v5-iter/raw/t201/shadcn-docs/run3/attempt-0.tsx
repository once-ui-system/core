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

/* Pawpoint: calm clinical teal on a soft warm-grey canvas; red is reserved for alerts and urgency. */
:root {
  --radius: 0.75rem;
  --background: oklch(0.975 0.004 190);
  --foreground: oklch(0.2 0.02 220);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.2 0.02 220);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.2 0.02 220);
  --primary: oklch(0.43 0.09 195);
  --primary-foreground: oklch(0.985 0 0);
  --secondary: oklch(0.95 0.015 195);
  --secondary-foreground: oklch(0.3 0.06 200);
  --muted: oklch(0.955 0.008 200);
  --muted-foreground: oklch(0.47 0.02 220);
  --accent: oklch(0.94 0.02 195);
  --accent-foreground: oklch(0.28 0.06 200);
  --destructive: oklch(0.577 0.245 27.325);
  --border: oklch(0.9 0.01 200);
  --input: oklch(0.86 0.012 200);
  --ring: oklch(0.55 0.09 195);
  --chart-1: oklch(0.646 0.222 41.116);
  --chart-2: oklch(0.5 0.1 195);
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
  /* Comfortable touch targets on the counter tablet */
  button,
  [role="button"],
  [role="combobox"] {
    touch-action: manipulation;
  }
}
```

```tsx app/layout.tsx
import "./globals.css";

import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "Pawpoint · Hillside Veterinary Clinic",
  description: "Front-desk and records software for Hillside Veterinary Clinic",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-dvh bg-background font-sans antialiased">
        <a
          href="#main"
          className="sr-only z-50 rounded-md bg-primary px-3 py-2 text-primary-foreground focus:not-sr-only focus:fixed focus:left-3 focus:top-3"
        >
          Skip to main content
        </a>
        <SiteHeader />
        <main id="main" className="mx-auto w-full max-w-[1400px] px-4 pb-16 pt-5 sm:px-6 lg:px-8">
          {children}
        </main>
        <Toaster />
      </body>
    </html>
  );
}
```

```tsx app/page.tsx
import { ScheduleView } from "@/components/schedule/schedule-view";

export default function Page() {
  return <ScheduleView />;
}
```

```tsx app/patients/[id]/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CalendarClock,
  ClipboardList,
  Pill,
  Phone,
  ShieldCheck,
  Syringe,
  TrendingDown,
  TriangleAlert,
  Scale,
} from "lucide-react";
import { AlertBadges } from "@/components/alert-badges";
import { StatusBadge } from "@/components/status-badge";
import { WeightChart } from "@/components/patient/weight-chart";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  TODAY,
  ageText,
  endTime,
  formatDate,
  formatUsd,
  getOwner,
  getPatient,
  getVet,
  initialAppointments,
  patients,
  patientsOfOwner,
  records,
  vaccineState,
} from "@/lib/data";
import { cn } from "@/lib/utils";

export function generateStaticParams() {
  return patients.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const p = getPatient(id);
  return { title: p ? `${p.name} · Pawpoint` : "Patient not found · Pawpoint" };
}

export default async function PatientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const patient = getPatient(id);
  if (!patient) notFound();

  const owner = getOwner(patient.owner);
  const record = records[patient.id];
  const otherPets = patientsOfOwner(owner.id).filter((p) => p.id !== patient.id);
  const todays = initialAppointments
    .filter((a) => a.patient === patient.id)
    .sort((a, b) => a.start.localeCompare(b.start));

  const weights = record?.weights ?? [];
  const first = weights[0];
  const last = weights[weights.length - 1];
  const prev = weights[weights.length - 2];
  const totalChange = first && last ? last.kg - first.kg : 0;
  const pct = first && last ? (totalChange / first.kg) * 100 : 0;
  const lastChange = prev && last ? last.kg - prev.kg : 0;

  const overdue = record?.vaccinations.filter((v) => vaccineState(v.due).kind === "overdue") ?? [];

  const facts = [
    { label: "Species and breed", value: `${patient.species} · ${patient.breed}` },
    { label: "Sex", value: patient.sex },
    { label: "Born", value: `${formatDate(patient.born)} (${ageText(patient.born)})` },
    { label: "Weight", value: last ? `${last.kg} kg on ${formatDate(last.date)}` : "Not recorded" },
  ];

  return (
    <div className="space-y-5">
      <nav aria-label="Breadcrumb" className="text-sm">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded-sm py-1 text-muted-foreground underline-offset-4 outline-none hover:text-foreground hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          <ArrowLeft aria-hidden className="size-4" />
          Today&apos;s schedule
        </Link>
      </nav>

      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
        <div>
          <p className="text-sm text-muted-foreground">Patient record · {patient.id.toUpperCase()}</p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{patient.name}</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Owner <span className="font-medium text-foreground">{owner.name}</span>
        </p>
      </div>

      {patient.alerts.length > 0 ? (
        <div className="sticky top-16 z-20 -mx-4 bg-background/95 px-4 py-2 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          <Alert
            variant="destructive"
            role="region"
            aria-label="Medical alerts"
            className="border-2 border-red-600 bg-red-50 shadow-sm"
          >
            <TriangleAlert aria-hidden className="!size-5" />
            <AlertTitle className="line-clamp-none text-base font-bold uppercase tracking-wide">
              Medical alerts ({patient.alerts.length})
            </AlertTitle>
            <AlertDescription className="text-red-950">
              <ul className="grid gap-1 sm:grid-cols-2">
                {patient.alerts.map((a) => (
                  <li key={a} className="flex items-start gap-2 text-base font-semibold text-red-950">
                    <span aria-hidden className="mt-2 size-2 shrink-0 rounded-full bg-red-600" />
                    {a}
                  </li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        </div>
      ) : (
        <p className="inline-flex items-center gap-2 rounded-lg border bg-card px-3 py-2 text-sm text-muted-foreground">
          <ShieldCheck aria-hidden className="size-4" />
          No medical alerts on file
        </p>
      )}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <Card className="gap-4 py-5">
          <CardHeader className="px-5">
            <CardTitle className="text-base">Patient details</CardTitle>
          </CardHeader>
          <CardContent className="px-5">
            <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
              {facts.map((f) => (
                <div key={f.label}>
                  <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{f.label}</dt>
                  <dd className="mt-0.5 font-medium">{f.value}</dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>

        <Card className="gap-4 py-5">
          <CardHeader className="px-5">
            <CardTitle className="text-base">Owner</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 px-5">
            <p className="text-lg font-semibold leading-tight">{owner.name}</p>
            <a
              href={`tel:${owner.phone.replace(/\s/g, "")}`}
              className="inline-flex min-h-11 items-center gap-2 rounded-lg border px-3 text-sm font-medium outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              <Phone aria-hidden className="size-4" />
              {owner.phone}
            </a>
            {otherPets.length > 0 && (
              <div className="text-sm">
                <p className="text-muted-foreground">Also owns</p>
                <ul className="mt-1 space-y-1.5">
                  {otherPets.map((p) => (
                    <li key={p.id} className="flex flex-wrap items-center gap-2">
                      <Link href={`/patients/${p.id}`} className="font-medium underline underline-offset-4">
                        {p.name}
                      </Link>
                      <span className="text-muted-foreground">{p.species}</span>
                      <AlertBadges alerts={p.alerts} />
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="gap-3 py-5">
        <CardHeader className="px-5">
          <CardTitle className="flex items-center gap-2 text-base">
            <CalendarClock aria-hidden className="size-4 text-muted-foreground" />
            Today at the clinic
          </CardTitle>
          <CardDescription>{formatDate(TODAY, true)}</CardDescription>
        </CardHeader>
        <CardContent className="px-5">
          {todays.length === 0 ? (
            <p className="text-sm text-muted-foreground">No appointments today.</p>
          ) : (
            <ul className="divide-y">
              {todays.map((a) => (
                <li key={a.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-2.5 first:pt-0 last:pb-0">
                  <span className="w-28 font-semibold tabular-nums">
                    {a.start}–{endTime(a)}
                  </span>
                  <span className="min-w-0 flex-1 text-sm">
                    {a.reason}
                    <span className="text-muted-foreground">
                      {" "}
                      · {getVet(a.vet).name}, {getVet(a.vet).room}
                    </span>
                  </span>
                  <StatusBadge status={a.status} />
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {record ? (
        <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]">
          <div className="space-y-4">
            <Card className="gap-3 py-5">
              <CardHeader className="px-5">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Scale aria-hidden className="size-4 text-muted-foreground" />
                  Weight trend
                </CardTitle>
                <CardDescription>
                  {weights.length} visits, {formatDate(first.date)} to {formatDate(last.date)}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 px-5">
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-lg bg-muted/60 px-4 py-3">
                  <p>
                    <span className="text-3xl font-bold tabular-nums">{last.kg}</span>
                    <span className="ml-1 text-sm text-muted-foreground">kg now</span>
                  </p>
                  <p className="flex items-center gap-1.5 text-sm font-medium text-amber-900">
                    <TrendingDown aria-hidden className="size-4" />
                    {lastChange.toFixed(1)} kg since last visit
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {totalChange.toFixed(1)} kg ({pct.toFixed(1)}%) since {formatDate(first.date)}
                  </p>
                </div>
                <WeightChart weights={weights} />
              </CardContent>
            </Card>

            <Card className="gap-3 py-5">
              <CardHeader className="px-5">
                <CardTitle className="flex items-center gap-2 text-base">
                  <ClipboardList aria-hidden className="size-4 text-muted-foreground" />
                  Visit history
                </CardTitle>
                <CardDescription>Newest first</CardDescription>
              </CardHeader>
              <CardContent className="px-5">
                <ol className="space-y-5 border-l-2 pl-5">
                  {record.visits.map((v) => (
                    <li key={v.date} className="relative">
                      <span
                        aria-hidden
                        className={cn(
                          "absolute -left-[1.62rem] top-1.5 size-3 rounded-full border-2 border-background",
                          v.date === TODAY ? "bg-primary" : "bg-muted-foreground/60",
                        )}
                      />
                      <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                        <p className="font-semibold">
                          {v.reason}
                          {v.date === TODAY && (
                            <Badge variant="secondary" className="ml-2 align-middle">
                              Today
                            </Badge>
                          )}
                        </p>
                        <p className="text-sm tabular-nums text-muted-foreground">{formatUsd(v.invoice)}</p>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(v.date)} · {getVet(v.vet).name}
                      </p>
                      <p className="mt-1.5 text-sm leading-relaxed">{v.notes}</p>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="gap-3 py-5">
              <CardHeader className="px-5">
                <CardTitle className="flex flex-wrap items-center gap-2 text-base">
                  <Syringe aria-hidden className="size-4 text-muted-foreground" />
                  Vaccinations
                  {overdue.length > 0 && (
                    <Badge className="bg-red-700 text-white">{overdue.length} overdue</Badge>
                  )}
                </CardTitle>
                <CardDescription>Checked against today, {formatDate(TODAY)}</CardDescription>
              </CardHeader>
              <CardContent className="px-2 sm:px-3">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vaccine</TableHead>
                      <TableHead>Given</TableHead>
                      <TableHead>Due</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {record.vaccinations.map((v) => {
                      const s = vaccineState(v.due);
                      return (
                        <TableRow key={v.name} className={cn(s.kind === "overdue" && "bg-red-50 hover:bg-red-50")}>
                          <TableCell className="font-medium">{v.name}</TableCell>
                          <TableCell className="whitespace-normal tabular-nums text-muted-foreground">
                            {formatDate(v.given)}
                          </TableCell>
                          <TableCell className="whitespace-normal">
                            <p className="tabular-nums">{formatDate(v.due)}</p>
                            {s.kind === "overdue" ? (
                              <p className="mt-1 inline-flex items-center gap-1 rounded-md bg-red-700 px-1.5 py-0.5 text-xs font-bold text-white">
                                <TriangleAlert aria-hidden className="size-3" />
                                Overdue by {s.days} days
                              </p>
                            ) : s.kind === "soon" ? (
                              <p className="mt-1 text-xs font-semibold text-amber-900">Due in {s.days} days</p>
                            ) : (
                              <p className="mt-1 text-xs text-emerald-800">Up to date</p>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card className="gap-3 py-5">
              <CardHeader className="px-5">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Pill aria-hidden className="size-4 text-muted-foreground" />
                  Current medications
                </CardTitle>
              </CardHeader>
              <CardContent className="px-5">
                <ul className="divide-y">
                  {record.medications.map((m) => (
                    <li key={m.name} className="py-2.5 first:pt-0 last:pb-0">
                      <p className="font-semibold">{m.name}</p>
                      <p className="text-sm">{m.dose}</p>
                      <p className="text-xs text-muted-foreground">Since {formatDate(m.since)}</p>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <Card className="py-8">
          <CardContent className="text-center text-sm text-muted-foreground">
            No weights, vaccinations or visit notes are on file for {patient.name} yet.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
```

```tsx components/alert-badges.tsx
import { TriangleAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/** Medical alerts: solid red, icon plus text, so they are never colour-only and never truncated. */
export function AlertBadges({ alerts, className }: { alerts: string[]; className?: string }) {
  if (alerts.length === 0) return null;
  return (
    <ul aria-label="Medical alerts" className={cn("flex flex-wrap gap-1.5", className)}>
      {alerts.map((alert) => (
        <li key={alert}>
          <Badge
            variant="destructive"
            className="h-auto items-start gap-1 rounded-md bg-red-700 px-2 py-1 text-left text-xs font-semibold leading-snug whitespace-normal text-white dark:bg-red-700"
          >
            <TriangleAlert aria-hidden className="mt-px size-3.5 shrink-0" />
            <span>
              <span className="sr-only">Medical alert: </span>
              {alert}
            </span>
          </Badge>
        </li>
      ))}
    </ul>
  );
}
```

```tsx components/patient-search.tsx
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { getOwner, patients } from "@/lib/data";

export function PatientSearch() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  function go(id: string) {
    setOpen(false);
    router.push(`/patients/${id}`);
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={() => setOpen(true)}
        className="h-11 min-w-0 flex-1 justify-start gap-2 px-3 font-normal text-muted-foreground sm:max-w-md"
      >
        <Search aria-hidden />
        <span className="truncate">Search patient or owner</span>
        <kbd className="pointer-events-none ml-auto hidden rounded border bg-muted px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground md:inline">
          Ctrl K
        </kbd>
      </Button>
      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="Search patients and owners"
        description="Type a pet or owner name, then choose a result to open the record."
      >
        <CommandInput placeholder="Pet or owner name" />
        <CommandList className="max-h-[min(60vh,420px)]">
          <CommandEmpty>No patient or owner matches that name.</CommandEmpty>
          <CommandGroup heading="Patients">
            {patients.map((p) => {
              const owner = getOwner(p.owner);
              return (
                <CommandItem
                  key={p.id}
                  value={`${p.name} ${owner.name} ${p.id}`}
                  keywords={[p.species, p.breed, owner.phone]}
                  onSelect={() => go(p.id)}
                  className="items-start gap-3 py-2.5"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">
                      {p.name}
                      <span className="ml-2 font-normal text-muted-foreground">
                        {p.species} · {p.breed}
                      </span>
                    </p>
                    <p className="text-sm text-muted-foreground">Owner: {owner.name}</p>
                  </div>
                  {p.alerts.length > 0 && (
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-red-700 px-2 py-1 text-xs font-semibold text-white">
                      <TriangleAlert aria-hidden className="size-3.5 !text-white" />
                      {p.alerts.length === 1 ? "1 alert" : `${p.alerts.length} alerts`}
                    </span>
                  )}
                </CommandItem>
              );
            })}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
```

```tsx components/patient/weight-chart.tsx
"use client";

import { CartesianGrid, LabelList, Line, LineChart, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { formatDate } from "@/lib/data";

const config = {
  kg: { label: "Weight (kg)", color: "var(--chart-2)" },
} satisfies ChartConfig;

const monthYear = (iso: string) =>
  new Intl.DateTimeFormat("en-US", { timeZone: "UTC", month: "short", year: "2-digit" }).format(
    new Date(`${iso}T12:00:00Z`),
  );

export function WeightChart({ weights }: { weights: { date: string; kg: number }[] }) {
  const data = weights.map((w) => ({ ...w, label: monthYear(w.date), full: formatDate(w.date) }));
  const min = Math.floor(Math.min(...weights.map((w) => w.kg)) - 1);
  const max = Math.ceil(Math.max(...weights.map((w) => w.kg)) + 1);
  return (
    <div>
      <ChartContainer config={config} className="aspect-auto h-60 w-full sm:h-64">
        <LineChart accessibilityLayer data={data} margin={{ top: 22, right: 20, left: 0, bottom: 0 }}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} interval={0} />
          <YAxis domain={[min, max]} tickLine={false} axisLine={false} width={34} tickCount={5} />
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent labelFormatter={(_, payload) => payload?.[0]?.payload?.full ?? ""} />}
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
            <LabelList dataKey="kg" position="top" offset={10} className="fill-foreground text-xs font-medium" />
          </Line>
        </LineChart>
      </ChartContainer>
      <table className="sr-only">
        <caption>Weight in kilograms at each visit</caption>
        <thead>
          <tr>
            <th scope="col">Date</th>
            <th scope="col">Weight (kg)</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d) => (
            <tr key={d.date}>
              <td>{d.full}</td>
              <td>{d.kg}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

```tsx components/schedule/appointment-row.tsx
import Link from "next/link";
import { Check, Siren, Stethoscope } from "lucide-react";
import { AlertBadges } from "@/components/alert-badges";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { endTime, type Appointment, type Owner, type Patient, type Vet } from "@/lib/data";
import { cn } from "@/lib/utils";

export const vetDot: Record<string, string> = {
  "v-1": "bg-sky-600",
  "v-2": "bg-violet-600",
  "v-3": "bg-emerald-600",
};

type Props = {
  appointment: Appointment;
  patient: Patient;
  owner: Owner;
  vet: Vet;
  highlighted: boolean;
  onCheckIn: () => void;
  onStartExam: () => void;
  onFinish: () => void;
};

export function AppointmentRow({ appointment: a, patient, owner, vet, highlighted, onCheckIn, onStartExam, onFinish }: Props) {
  const closed = a.status === "done" || a.status === "cancelled";
  return (
    <li
      id={`appt-${a.id}`}
      data-status={a.status}
      data-urgent={a.urgent ? "true" : undefined}
      className={cn(
        "relative grid gap-x-4 gap-y-3 border-b px-4 py-4 transition-colors last:border-b-0 md:grid-cols-[9rem_minmax(0,1.05fr)_minmax(0,1.4fr)_10.5rem]",
        a.urgent && !closed && "bg-red-50 before:absolute before:inset-y-0 before:left-0 before:w-1.5 before:bg-red-600",
        a.status === "in_exam" && !a.urgent && "bg-sky-50/60",
        closed && "bg-muted/40",
        highlighted && "bg-primary/10 ring-2 ring-inset ring-primary",
      )}
    >
      <div className="flex items-baseline gap-3 md:block">
        <p className={cn("text-xl font-semibold leading-none tabular-nums", closed && "text-muted-foreground")}>
          {a.start}
        </p>
        <p className="text-xs tabular-nums text-muted-foreground md:mt-1.5">
          to {endTime(a)} · {a.minutes} min
        </p>
        <p className="ml-auto flex items-center gap-1.5 text-xs font-medium md:ml-0 md:mt-1.5">
          <span aria-hidden className={cn("size-2 rounded-full", vetDot[vet.id])} />
          <span>
            {vet.short}
            <span className="font-normal text-muted-foreground"> · {vet.room}</span>
          </span>
        </p>
      </div>

      <div className="min-w-0">
        <Link
          href={`/patients/${patient.id}`}
          className={cn(
            "rounded-sm text-lg font-semibold leading-tight underline-offset-4 outline-none hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/50",
            closed && "text-muted-foreground",
          )}
        >
          {patient.name}
        </Link>
        <p className="text-sm text-muted-foreground">
          {patient.species} · {patient.breed}
        </p>
        <p className="mt-0.5 text-sm">
          <span className="text-muted-foreground">Owner </span>
          {owner.name}
        </p>
      </div>

      <div className="min-w-0 space-y-2">
        <p className={cn("text-sm font-medium", a.status === "cancelled" && "text-muted-foreground line-through")}>
          {a.urgent && (
            <span className="mr-2 inline-flex items-center gap-1 rounded-md bg-red-600 px-2 py-0.5 align-middle text-xs font-bold uppercase tracking-wide text-white">
              <Siren aria-hidden className="size-3.5" />
              Urgent
            </span>
          )}
          {a.reason}
        </p>
        <AlertBadges alerts={patient.alerts} />
      </div>

      <div className="flex flex-row items-center justify-between gap-2 md:flex-col md:items-stretch md:justify-start">
        <StatusBadge status={a.status} className="self-start md:self-end" />
        {a.status === "booked" && (
          <Button onClick={onCheckIn} className="h-11 flex-1 md:flex-none" aria-label={`Check in ${patient.name}`}>
            <Check aria-hidden />
            Check in
          </Button>
        )}
        {a.status === "checked_in" && (
          <Button onClick={onStartExam} variant="outline" className="h-11 flex-1 md:flex-none" aria-label={`Start exam for ${patient.name}`}>
            <Stethoscope aria-hidden />
            Start exam
          </Button>
        )}
        {a.status === "in_exam" && (
          <Button onClick={onFinish} variant="outline" className="h-11 flex-1 md:flex-none" aria-label={`Mark done, ${patient.name}`}>
            <Check aria-hidden />
            Mark done
          </Button>
        )}
      </div>
    </li>
  );
}
```

```tsx components/schedule/booking-dialog.tsx
"use client";

import * as React from "react";
import { CalendarPlus, TriangleAlert } from "lucide-react";
import { AlertBadges } from "@/components/alert-badges";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  CLOSE_AT,
  SLOT_TIMES,
  endTime,
  findConflict,
  fromMin,
  getOwner,
  getPatient,
  getVet,
  patients,
  toMin,
  vets,
  type Appointment,
} from "@/lib/data";

const DURATIONS = [15, 20, 30, 45, 60];

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointments: Appointment[];
  now: number;
  onBook: (input: { patient: string; vet: string; start: string; minutes: number; reason: string }) => void;
};

export function BookingDialog({ open, onOpenChange, appointments, now, onBook }: Props) {
  const [patientId, setPatientId] = React.useState("");
  const [vetId, setVetId] = React.useState("");
  const [time, setTime] = React.useState("");
  const [minutes, setMinutes] = React.useState("20");
  const [reason, setReason] = React.useState("");
  const [submitted, setSubmitted] = React.useState(false);

  const patient = patientId ? getPatient(patientId) : undefined;
  const mins = Number(minutes);

  function slotIssue(t: string): string | null {
    const s = toMin(t);
    if (s < now) return "already passed";
    if (s + mins > toMin(CLOSE_AT)) return `ends after ${CLOSE_AT}`;
    const c = findConflict(appointments, { vet: vetId || undefined, patient: patientId || undefined, start: t, minutes: mins });
    if (c?.kind === "vet") return "vet busy";
    if (c?.kind === "patient") return "patient busy";
    return null;
  }

  const timeIssue = time ? slotIssue(time) : null;
  const conflict = time ? findConflict(appointments, { vet: vetId || undefined, patient: patientId || undefined, start: time, minutes: mins }) : null;

  function conflictMessage() {
    if (!time) return null;
    if (conflict) {
      const other = conflict.appointment;
      const otherPatient = getPatient(other.patient)!;
      const range = `${other.start}–${endTime(other)}`;
      return conflict.kind === "vet"
        ? `${getVet(other.vet).name} already has ${otherPatient.name} (${other.reason}) from ${range}. Pick another time or another vet.`
        : `${otherPatient.name} is already booked from ${range} with ${getVet(other.vet).name}. A patient cannot be in two places at once.`;
    }
    if (timeIssue === "already passed") return "That time has already passed. Pick a later slot.";
    if (timeIssue) return `That visit would end after closing at ${CLOSE_AT}. Pick an earlier time or a shorter visit.`;
    return null;
  }
  const problem = conflictMessage();

  function reset() {
    setPatientId("");
    setVetId("");
    setTime("");
    setMinutes("20");
    setReason("");
    setSubmitted(false);
  }

  function handleOpenChange(next: boolean) {
    if (!next) reset();
    onOpenChange(next);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    if (!patientId || !vetId || !time || problem) return;
    onBook({ patient: patientId, vet: vetId, start: time, minutes: mins, reason: reason.trim() || "Follow-up visit" });
    reset();
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[92dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Book an appointment</DialogTitle>
          <DialogDescription>Pick the patient, the vet and a free time. Taken times cannot be chosen.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="grid gap-4" noValidate>
          <div className="grid gap-2">
            <Label htmlFor="book-patient">Patient</Label>
            <Select value={patientId} onValueChange={setPatientId}>
              <SelectTrigger id="book-patient" className="h-11 w-full" aria-invalid={submitted && !patientId}>
                <SelectValue placeholder="Choose a patient" />
              </SelectTrigger>
              <SelectContent position="popper">
                {patients.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name} · {getOwner(p.owner).name}
                    {p.alerts.length > 0 && <TriangleAlert aria-label="has medical alert" className="!text-red-700" />}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {submitted && !patientId && <p className="text-sm text-destructive">Choose a patient.</p>}
            {patient && (
              <div className="rounded-lg border bg-muted/40 p-3 text-sm">
                <p>
                  <span className="font-semibold">{patient.name}</span>
                  <span className="text-muted-foreground">
                    {" "}
                    · {patient.species}, {patient.breed} · owner {getOwner(patient.owner).name}
                  </span>
                </p>
                <AlertBadges alerts={patient.alerts} className="mt-2" />
              </div>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="book-vet">Vet</Label>
              <Select value={vetId} onValueChange={setVetId}>
                <SelectTrigger id="book-vet" className="h-11 w-full" aria-invalid={submitted && !vetId}>
                  <SelectValue placeholder="Choose a vet" />
                </SelectTrigger>
                <SelectContent position="popper">
                  {vets.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.name} · {v.room}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {submitted && !vetId && <p className="text-sm text-destructive">Choose a vet.</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="book-minutes">Length</Label>
              <Select value={minutes} onValueChange={setMinutes}>
                <SelectTrigger id="book-minutes" className="h-11 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent position="popper">
                  {DURATIONS.map((d) => (
                    <SelectItem key={d} value={String(d)}>
                      {d} minutes
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="book-time">Time</Label>
            <Select value={time} onValueChange={setTime}>
              <SelectTrigger id="book-time" className="h-11 w-full" aria-invalid={submitted && !time}>
                <SelectValue placeholder="Choose a time" />
              </SelectTrigger>
              <SelectContent position="popper" className="max-h-72">
                {SLOT_TIMES.map((t) => {
                  const issue = slotIssue(t);
                  return (
                    <SelectItem key={t} value={t} disabled={issue !== null && t !== time}>
                      <span className="tabular-nums">
                        {t}–{fromMin(toMin(t) + mins)}
                      </span>
                      {issue && <span className="text-muted-foreground">· {issue}</span>}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            {submitted && !time && <p className="text-sm text-destructive">Choose a time.</p>}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="book-reason">Reason for visit</Label>
            <Input
              id="book-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="For example: Ear infection recheck"
              className="h-11"
              autoComplete="off"
            />
          </div>

          {problem && (
            <Alert variant="destructive" role="alert" className="border-red-300 bg-red-50">
              <TriangleAlert aria-hidden />
              <AlertTitle className="line-clamp-none">This time does not work</AlertTitle>
              <AlertDescription className="text-red-900">{problem}</AlertDescription>
            </Alert>
          )}

          <DialogFooter className="gap-2 sm:gap-2">
            <Button type="button" variant="outline" className="h-11" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="h-11" disabled={Boolean(problem)}>
              <CalendarPlus aria-hidden />
              Book appointment
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

```tsx components/schedule/schedule-view.tsx
"use client";

import * as React from "react";
import { CalendarPlus, Clock } from "lucide-react";
import { toast } from "sonner";
import { AppointmentRow } from "@/components/schedule/appointment-row";
import { BookingDialog } from "@/components/schedule/booking-dialog";
import { RoomsPanel, WaitingList } from "@/components/schedule/side-panels";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  NOW_START,
  TODAY,
  formatDate,
  fromMin,
  getOwner,
  getPatient,
  getVet,
  initialAppointments,
  toMin,
  vets,
  type Appointment,
} from "@/lib/data";
import { cn } from "@/lib/utils";

export function ScheduleView() {
  const [appointments, setAppointments] = React.useState<Appointment[]>(initialAppointments);
  const [now, setNow] = React.useState(toMin(NOW_START));
  const [vetFilter, setVetFilter] = React.useState("all");
  const [hideClosed, setHideClosed] = React.useState(false);
  const [bookOpen, setBookOpen] = React.useState(false);
  const [highlight, setHighlight] = React.useState<string | null>(null);

  // The counter clock advances one minute per real minute so waiting times keep counting.
  React.useEffect(() => {
    const id = window.setInterval(() => setNow((n) => n + 1), 60_000);
    return () => window.clearInterval(id);
  }, []);

  React.useEffect(() => {
    if (!highlight) return;
    document.getElementById(`appt-${highlight}`)?.scrollIntoView({ block: "center", behavior: "smooth" });
    const t = window.setTimeout(() => setHighlight(null), 4000);
    return () => window.clearTimeout(t);
  }, [highlight]);

  const patch = (id: string, changes: Partial<Appointment>) =>
    setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, ...changes } : a)));

  function checkIn(a: Appointment) {
    const p = getPatient(a.patient)!;
    patch(a.id, { status: "checked_in", checkedInAt: fromMin(now) });
    toast.success(`${p.name} checked in`, {
      description:
        p.alerts.length > 0
          ? `Medical alert: ${p.alerts.join("; ")}`
          : `${getVet(a.vet).name} will see them from ${a.start}.`,
    });
  }

  function startExam(a: Appointment) {
    const p = getPatient(a.patient)!;
    patch(a.id, { status: "in_exam" });
    toast(`${p.name} is in ${getVet(a.vet).room}`);
  }

  function finish(a: Appointment) {
    const p = getPatient(a.patient)!;
    patch(a.id, { status: "done" });
    toast(`${p.name}'s visit is done`);
  }

  function book(input: { patient: string; vet: string; start: string; minutes: number; reason: string }) {
    const id = `a-${String(appointments.length + 1).padStart(2, "0")}`;
    setAppointments((prev) => [...prev, { id, ...input, status: "booked" }]);
    setBookOpen(false);
    setVetFilter("all");
    setHideClosed(false);
    setHighlight(id);
    const p = getPatient(input.patient)!;
    toast.success(`Booked ${p.name} at ${input.start}`, { description: `${getVet(input.vet).name} · ${input.reason}` });
  }

  const sorted = [...appointments].sort((a, b) => toMin(a.start) - toMin(b.start) || a.vet.localeCompare(b.vet));
  const visible = sorted.filter(
    (a) => (vetFilter === "all" || a.vet === vetFilter) && !(hideClosed && (a.status === "done" || a.status === "cancelled")),
  );

  const waiting = appointments.filter((a) => a.status === "checked_in");
  const inExam = appointments.filter((a) => a.status === "in_exam");
  const toCome = appointments.filter((a) => a.status === "booked");
  const urgent = appointments.filter((a) => a.urgent && (a.status === "booked" || a.status === "checked_in"));
  const longest = waiting.reduce((m, a) => Math.max(m, now - toMin(a.checkedInAt ?? a.start)), 0);

  const stats = [
    { label: "Waiting", value: waiting.length, note: waiting.length ? `longest ${longest} min` : "nobody waiting", tone: "text-amber-800" },
    { label: "In exam", value: inExam.length, note: "with a vet now", tone: "text-sky-900" },
    { label: "Still to arrive", value: toCome.length, note: "booked today", tone: "text-foreground" },
    { label: "Urgent", value: urgent.length, note: urgent.length ? "needs a slot first" : "none open", tone: "text-red-700" },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Today&apos;s schedule</h1>
          <p className="mt-1 flex flex-wrap items-center gap-x-3 text-sm text-muted-foreground">
            <span>{formatDate(TODAY, true)}</span>
            <span className="inline-flex items-center gap-1 font-medium text-foreground">
              <Clock aria-hidden className="size-4 text-muted-foreground" />
              <span className="sr-only">Clinic time</span>
              <span className="tabular-nums">{fromMin(now)}</span>
            </span>
          </p>
        </div>
        <Button size="lg" className="h-12 px-5 text-base" onClick={() => setBookOpen(true)}>
          <CalendarPlus aria-hidden />
          Book appointment
        </Button>
      </div>

      <dl className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border bg-card p-4">
            <dt className="text-sm text-muted-foreground">{s.label}</dt>
            <dd className={cn("mt-1 text-3xl font-bold leading-none tabular-nums", s.tone)}>{s.value}</dd>
            <dd className="mt-1.5 text-xs text-muted-foreground">{s.note}</dd>
          </div>
        ))}
      </dl>

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_23rem]">
        <aside aria-label="Waiting room and vets" className="grid gap-4 md:grid-cols-2 xl:order-2 xl:grid-cols-1">
          <WaitingList appointments={appointments} now={now} />
          <RoomsPanel appointments={appointments} />
        </aside>

        <Card className="gap-0 overflow-hidden py-0 xl:order-1">
          <CardHeader className="gap-3 border-b px-4 py-4">
            <CardTitle className="flex flex-wrap items-center justify-between gap-3 text-base">
              <span>
                All appointments{" "}
                <span className="font-normal text-muted-foreground" aria-live="polite">
                  ({visible.length} shown)
                </span>
              </span>
              <span className="flex items-center gap-2">
                <Switch id="hide-closed" checked={hideClosed} onCheckedChange={setHideClosed} />
                <Label htmlFor="hide-closed" className="text-sm font-normal">
                  Hide done and cancelled
                </Label>
              </span>
            </CardTitle>
            <ToggleGroup
              type="single"
              variant="outline"
              value={vetFilter}
              onValueChange={(v) => setVetFilter(v || "all")}
              aria-label="Filter by vet"
              className="flex-wrap justify-start"
            >
              <ToggleGroupItem value="all" className="h-10 px-4">
                All vets
              </ToggleGroupItem>
              {vets.map((v) => (
                <ToggleGroupItem key={v.id} value={v.id} className="h-10 px-4">
                  {v.short}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </CardHeader>
          <CardContent className="p-0">
            <div
              aria-hidden
              className="hidden grid-cols-[9rem_minmax(0,1.05fr)_minmax(0,1.4fr)_10.5rem] gap-x-4 border-b bg-muted/50 px-4 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground md:grid"
            >
              <span>Time and vet</span>
              <span>Patient and owner</span>
              <span>Reason and alerts</span>
              <span className="text-right">Status</span>
            </div>
            {visible.length === 0 ? (
              <p className="p-8 text-center text-sm text-muted-foreground">No appointments match these filters.</p>
            ) : (
              <ul aria-label="Appointments">
                {visible.map((a) => (
                  <AppointmentRow
                    key={a.id}
                    appointment={a}
                    patient={getPatient(a.patient)!}
                    owner={getOwner(getPatient(a.patient)!.owner)}
                    vet={getVet(a.vet)}
                    highlighted={highlight === a.id}
                    onCheckIn={() => checkIn(a)}
                    onStartExam={() => startExam(a)}
                    onFinish={() => finish(a)}
                  />
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <BookingDialog open={bookOpen} onOpenChange={setBookOpen} appointments={appointments} now={now} onBook={book} />
    </div>
  );
}
```

```tsx components/schedule/side-panels.tsx
import Link from "next/link";
import { Hourglass } from "lucide-react";
import { AlertBadges } from "@/components/alert-badges";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getPatient, getVet, toMin, vets, type Appointment } from "@/lib/data";
import { vetDot } from "@/components/schedule/appointment-row";
import { cn } from "@/lib/utils";

const LONG_WAIT = 30;

export function WaitingList({ appointments, now }: { appointments: Appointment[]; now: number }) {
  const waiting = appointments
    .filter((a) => a.status === "checked_in")
    .sort((a, b) => toMin(a.checkedInAt ?? a.start) - toMin(b.checkedInAt ?? b.start));

  return (
    <Card className="gap-3 py-4">
      <CardHeader className="px-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <Hourglass aria-hidden className="size-4 text-amber-700" />
          Waiting room
          <Badge variant="secondary" className="ml-auto tabular-nums" aria-label={`${waiting.length} waiting`}>
            {waiting.length}
          </Badge>
        </CardTitle>
        <CardDescription>Checked in, longest wait first</CardDescription>
      </CardHeader>
      <CardContent className="px-4">
        {waiting.length === 0 ? (
          <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
            Nobody is waiting. Check a patient in from the schedule.
          </p>
        ) : (
          <ol className="space-y-2" aria-label="Waiting list">
            {waiting.map((a, i) => {
              const p = getPatient(a.patient)!;
              const v = getVet(a.vet);
              const waited = Math.max(0, now - toMin(a.checkedInAt ?? a.start));
              const long = waited >= LONG_WAIT;
              return (
                <li
                  key={a.id}
                  className={cn("rounded-lg border p-3", long ? "border-amber-300 bg-amber-50" : "bg-background")}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="flex flex-wrap items-center gap-2">
                        <Link
                          href={`/patients/${p.id}`}
                          className="rounded-sm font-semibold underline-offset-4 outline-none hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/50"
                        >
                          {p.name}
                        </Link>
                        {i === 0 && (
                          <Badge className="bg-primary/10 text-primary hover:bg-primary/10" variant="outline">
                            Next up
                          </Badge>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {a.start} with {v.short} · {v.room}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p
                        className={cn(
                          "text-lg font-semibold leading-none tabular-nums",
                          long && "text-amber-800",
                        )}
                      >
                        {waited} min
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {long ? "long wait · " : ""}in at {a.checkedInAt}
                      </p>
                    </div>
                  </div>
                  <AlertBadges alerts={p.alerts} className="mt-2" />
                </li>
              );
            })}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}

export function RoomsPanel({ appointments }: { appointments: Appointment[] }) {
  return (
    <Card className="gap-3 py-4">
      <CardHeader className="px-4">
        <CardTitle className="text-base">Vets and rooms</CardTitle>
        <CardDescription>Who is with whom right now</CardDescription>
      </CardHeader>
      <CardContent className="px-4">
        <ul className="divide-y">
          {vets.map((v) => {
            const current = appointments.find((a) => a.vet === v.id && a.status === "in_exam");
            const next = appointments
              .filter((a) => a.vet === v.id && (a.status === "booked" || a.status === "checked_in"))
              .sort((a, b) => toMin(a.start) - toMin(b.start))[0];
            const cur = current ? getPatient(current.patient) : undefined;
            const nxt = next ? getPatient(next.patient) : undefined;
            return (
              <li key={v.id} className="py-2.5 first:pt-0 last:pb-0">
                <p className="flex items-center gap-2 text-sm font-semibold">
                  <span aria-hidden className={cn("size-2.5 rounded-full", vetDot[v.id])} />
                  {v.name}
                  <span className="font-normal text-muted-foreground">· {v.room}</span>
                </p>
                <p className="mt-0.5 text-sm">
                  {cur ? (
                    <>
                      <span className="font-medium text-sky-900">In exam:</span> {cur.name}
                      {cur.alerts.length > 0 && (
                        <span className="ml-1.5 rounded bg-red-700 px-1.5 py-0.5 text-[11px] font-semibold text-white">
                          Alert
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="text-muted-foreground">Free right now</span>
                  )}
                </p>
                {next && nxt && (
                  <p className="text-xs text-muted-foreground">
                    Next: {next.start} {nxt.name}
                    {next.status === "checked_in" ? " (waiting)" : ""}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
```

```tsx components/site-header.tsx
import Link from "next/link";
import { PawPrint } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PatientSearch } from "@/components/patient-search";
import { user } from "@/lib/data";

export function SiteHeader() {
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("");
  return (
    <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-16 w-full max-w-[1400px] items-center gap-3 px-4 sm:gap-5 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2.5 rounded-md outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground">
            <PawPrint aria-hidden className="size-5" />
          </span>
          <span className="hidden leading-tight sm:block">
            <span className="block text-base font-bold tracking-tight">Pawpoint</span>
            <span className="block text-[11px] text-muted-foreground">Hillside Veterinary Clinic</span>
          </span>
          <span className="sr-only sm:hidden">Pawpoint, Hillside Veterinary Clinic</span>
        </Link>
        <PatientSearch />
        <div className="ml-auto flex shrink-0 items-center gap-3">
          <div className="hidden text-right leading-tight md:block">
            <p className="text-sm font-medium">{user.name}</p>
            <p className="text-xs text-muted-foreground">{user.role}</p>
          </div>
          <Avatar className="size-9">
            <AvatarFallback className="bg-secondary text-xs font-semibold">{initials}</AvatarFallback>
          </Avatar>
          <span className="sr-only md:hidden">
            Signed in as {user.name}, {user.role}
          </span>
        </div>
      </div>
    </header>
  );
}
```

```tsx components/status-badge.tsx
import { Ban, CalendarClock, CircleCheck, Stethoscope, UserCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { STATUS_LABEL, type Status } from "@/lib/data";
import { cn } from "@/lib/utils";

const styles: Record<Status, { icon: typeof Ban; className: string }> = {
  booked: { icon: CalendarClock, className: "border-slate-300 bg-slate-50 text-slate-800" },
  checked_in: { icon: UserCheck, className: "border-amber-300 bg-amber-100 text-amber-950" },
  in_exam: { icon: Stethoscope, className: "border-sky-300 bg-sky-100 text-sky-950" },
  done: { icon: CircleCheck, className: "border-emerald-300 bg-emerald-100 text-emerald-950" },
  cancelled: { icon: Ban, className: "border-border bg-muted text-muted-foreground" },
};

export function StatusBadge({ status, className }: { status: Status; className?: string }) {
  const { icon: Icon, className: tone } = styles[status];
  return (
    <Badge variant="outline" className={cn("gap-1.5 px-2.5 py-1 text-xs font-semibold", tone, className)}>
      <Icon aria-hidden />
      {STATUS_LABEL[status]}
    </Badge>
  );
}
```

```ts lib/data.ts
export const CLINIC_NAME = "Pawpoint";
export const CLINIC_FULL =
  "Pawpoint, front-desk and records software for Hillside Veterinary Clinic";
export const TODAY = "2026-11-12";
/** Simulated "current time" at the counter when the app opens (it then ticks once a minute). */
export const NOW_START = "09:52";
export const OPEN_AT = "08:00";
export const CLOSE_AT = "17:00";

export const user = { name: "Rosa Lindqvist", role: "Receptionist" };

export type Vet = { id: string; name: string; short: string; room: string };
export type Owner = { id: string; name: string; phone: string };
export type Patient = {
  id: string;
  name: string;
  species: string;
  breed: string;
  born: string;
  sex: string;
  owner: string;
  alerts: string[];
};
export type Status = "booked" | "checked_in" | "in_exam" | "done" | "cancelled";
export type Appointment = {
  id: string;
  patient: string;
  vet: string;
  start: string;
  minutes: number;
  reason: string;
  status: Status;
  urgent?: boolean;
  /** Clock time the patient was checked in (set when status is checked_in). */
  checkedInAt?: string;
};

export const vets: Vet[] = [
  { id: "v-1", name: "Dr. Amara Osei", short: "Dr. Osei", room: "Exam 1" },
  { id: "v-2", name: "Dr. Tomás Reyes", short: "Dr. Reyes", room: "Exam 2" },
  { id: "v-3", name: "Dr. Helen Park", short: "Dr. Park", room: "Surgery" },
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
  { id: "a-05", patient: "p-107", vet: "v-2", start: "09:15", minutes: 20, reason: "Glucose curve", status: "checked_in", checkedInAt: "09:08" },
  { id: "a-06", patient: "p-105", vet: "v-1", start: "09:45", minutes: 20, reason: "Beak and nail trim", status: "checked_in", checkedInAt: "09:40" },
  { id: "a-07", patient: "p-103", vet: "v-2", start: "10:00", minutes: 30, reason: "Senior wellness exam", status: "booked" },
  { id: "a-08", patient: "p-106", vet: "v-1", start: "10:30", minutes: 20, reason: "Not eating since yesterday", status: "booked", urgent: true },
  { id: "a-09", patient: "p-104", vet: "v-3", start: "11:00", minutes: 45, reason: "Dental cleaning", status: "booked" },
  { id: "a-10", patient: "p-101", vet: "v-2", start: "11:30", minutes: 20, reason: "Ear infection follow-up", status: "booked" },
  { id: "a-11", patient: "p-107", vet: "v-1", start: "13:30", minutes: 30, reason: "Dental check", status: "booked" },
  { id: "a-12", patient: "p-103", vet: "v-3", start: "14:00", minutes: 60, reason: "Lump removal", status: "cancelled" },
  { id: "a-13", patient: "p-102", vet: "v-2", start: "15:00", minutes: 20, reason: "X-ray results", status: "booked" },
];

export type PatientRecord = {
  weights: { date: string; kg: number }[];
  vaccinations: { name: string; given: string; due: string }[];
  medications: { name: string; dose: string; since: string }[];
  visits: { date: string; vet: string; reason: string; notes: string; invoice: number }[];
};

export const records: Record<string, PatientRecord> = {
  "p-104": {
    weights: [
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
        invoice: 186.0,
      },
      {
        date: "2026-06-17",
        vet: "v-2",
        reason: "Kidney panel recheck",
        notes: "Stable. Appetite good. Owner reports more drinking in hot weather.",
        invoice: 172.5,
      },
      {
        date: "2026-02-11",
        vet: "v-1",
        reason: "Coughing",
        notes: "Mild kennel cough. Supportive care; no antibiotics given (penicillin allergy).",
        invoice: 94.0,
      },
      {
        date: "2025-11-03",
        vet: "v-2",
        reason: "Senior wellness exam",
        notes: "Grade 2 dental tartar. Dental cleaning recommended.",
        invoice: 148.0,
      },
    ],
  },
};

/* ---------- lookups ---------- */

export const getVet = (id: string) => vets.find((v) => v.id === id)!;
export const getOwner = (id: string) => owners.find((o) => o.id === id)!;
export const getPatient = (id: string) => patients.find((p) => p.id === id);
export const patientsOfOwner = (ownerId: string) => patients.filter((p) => p.owner === ownerId);

/* ---------- time helpers ---------- */

export const toMin = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};
export const fromMin = (n: number) =>
  `${String(Math.floor(n / 60)).padStart(2, "0")}:${String(n % 60).padStart(2, "0")}`;
export const endTime = (a: { start: string; minutes: number }) => fromMin(toMin(a.start) + a.minutes);

const utc = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
};
export const daysBetween = (from: string, to: string) => Math.round((utc(to) - utc(from)) / 86_400_000);

export const formatDate = (iso: string, long = false) =>
  new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    ...(long
      ? { weekday: "long", month: "long", day: "numeric", year: "numeric" }
      : { month: "short", day: "numeric", year: "numeric" }),
  }).format(new Date(utc(iso)));

export const formatUsd = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

export function ageText(born: string, on = TODAY) {
  const [by, bm, bd] = born.split("-").map(Number);
  const [ty, tm, td] = on.split("-").map(Number);
  let months = (ty - by) * 12 + (tm - bm);
  if (td < bd) months -= 1;
  const y = Math.floor(months / 12);
  const m = months % 12;
  if (y === 0) return `${m} mo`;
  return m === 0 ? `${y} yr` : `${y} yr ${m} mo`;
}

/* ---------- scheduling rules ---------- */

export const STATUS_LABEL: Record<Status, string> = {
  booked: "Booked",
  checked_in: "Checked in",
  in_exam: "In exam",
  done: "Done",
  cancelled: "Cancelled",
};

export type Conflict = { kind: "vet" | "patient"; appointment: Appointment };

/** An appointment clashes when its time range overlaps another live booking for the same vet (or the same patient). */
export function findConflict(
  appointments: Appointment[],
  c: { vet?: string; patient?: string; start: string; minutes: number },
): Conflict | null {
  const s = toMin(c.start);
  const e = s + c.minutes;
  for (const a of appointments) {
    if (a.status === "cancelled") continue;
    const as = toMin(a.start);
    const ae = as + a.minutes;
    if (!(s < ae && as < e)) continue;
    if (c.vet && a.vet === c.vet) return { kind: "vet", appointment: a };
    if (c.patient && a.patient === c.patient) return { kind: "patient", appointment: a };
  }
  return null;
}

export const SLOT_TIMES: string[] = Array.from(
  { length: (toMin(CLOSE_AT) - toMin(OPEN_AT)) / 15 },
  (_, i) => fromMin(toMin(OPEN_AT) + i * 15),
);

/* ---------- vaccinations ---------- */

export type VaccineState = { kind: "overdue" | "soon" | "current"; days: number };
export function vaccineState(due: string): VaccineState {
  const days = daysBetween(TODAY, due);
  if (days < 0) return { kind: "overdue", days: -days };
  if (days <= 60) return { kind: "soon", days };
  return { kind: "current", days };
}
```

