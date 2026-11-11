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
  --background: oklch(0.975 0.006 190);
  --foreground: oklch(0.2 0.02 220);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.2 0.02 220);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.2 0.02 220);
  --primary: oklch(0.42 0.085 200);
  --primary-foreground: oklch(0.985 0.005 190);
  --secondary: oklch(0.955 0.012 195);
  --secondary-foreground: oklch(0.28 0.04 210);
  --muted: oklch(0.955 0.01 195);
  --muted-foreground: oklch(0.48 0.02 220);
  --accent: oklch(0.94 0.02 195);
  --accent-foreground: oklch(0.28 0.05 210);
  --destructive: oklch(0.55 0.22 27);
  --border: oklch(0.9 0.01 200);
  --input: oklch(0.88 0.012 200);
  --ring: oklch(0.55 0.09 200);
  --chart-1: oklch(0.5 0.09 200);
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
}
```

```tsx app/layout.tsx
import "./globals.css";

import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import { AppHeader } from "@/components/app-header";

export const metadata: Metadata = {
  title: "Pawpoint | Hillside Veterinary Clinic",
  description:
    "Pawpoint, front-desk and records software for Hillside Veterinary Clinic",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-dvh font-sans antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
        >
          Skip to content
        </a>
        <AppHeader />
        <main id="main" className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:py-8">
          {children}
        </main>
        <Toaster />
      </body>
    </html>
  );
}
```

```tsx app/page.tsx
import { Schedule } from "@/components/schedule";

export default function Page() {
  return <Schedule />;
}
```

```tsx app/patients/[id]/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CalendarClock,
  Phone,
  Pill,
  ShieldAlert,
  TrendingDown,
  TrendingUp,
  TriangleAlert,
  User,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AlertBadges } from "@/components/alert-badges";
import { WeightChart } from "@/components/weight-chart";
import {
  STATUS_LABEL,
  TODAY,
  ageText,
  appointments,
  endTime,
  formatDate,
  formatUsd,
  getOwner,
  getPatient,
  getVet,
  patients,
  records,
  vaccineState,
} from "@/lib/data";
import { cn } from "@/lib/utils";

export function generateStaticParams() {
  return patients.map((p) => ({ id: p.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const p = getPatient(id);
  return { title: p ? `${p.name} | Pawpoint` : "Patient | Pawpoint" };
}

export default async function PatientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const patient = getPatient(id);
  if (!patient) notFound();

  const owner = getOwner(patient.owner);
  const record = records[patient.id];
  const todays = appointments
    .filter((a) => a.patient === patient.id)
    .sort((a, b) => a.start.localeCompare(b.start));

  const vaccines = record
    ? record.vaccinations.map((v) => ({ ...v, ...vaccineState(v.due) }))
    : [];
  const overdue = vaccines.filter((v) => v.state === "overdue");

  const weights = record?.weights_kg ?? [];
  const latest = weights.at(-1);
  const first = weights[0];
  const previous = weights.at(-2);
  const totalDelta = latest && first ? latest.kg - first.kg : 0;
  const lastDelta = latest && previous ? latest.kg - previous.kg : 0;
  const signed = (n: number) => `${n > 0 ? "+" : "−"}${Math.abs(n).toFixed(1)} kg`;

  return (
    <div className="grid gap-5">
      <nav aria-label="Breadcrumb">
        <Link
          href="/"
          className="inline-flex h-10 items-center gap-1.5 rounded-md text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Today&apos;s schedule
        </Link>
      </nav>

      <header className="grid gap-4">
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
          <div>
            <p className="text-sm text-muted-foreground">Patient record · {patient.id}</p>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              {patient.name}
            </h1>
            <p className="mt-1 text-base text-muted-foreground">
              {patient.species} · {patient.breed} · {patient.sex} · {ageText(patient.born)}{" "}
              (born {formatDate(patient.born)})
            </p>
          </div>
          {owner && (
            <div className="flex items-center gap-3 rounded-xl border bg-card px-4 py-3">
              <span className="flex size-10 items-center justify-center rounded-full bg-accent text-accent-foreground">
                <User className="size-5" aria-hidden />
              </span>
              <div className="leading-tight">
                <p className="text-xs text-muted-foreground">Owner</p>
                <p className="font-semibold">{owner.name}</p>
                <a
                  href={`tel:${owner.phone.replace(/\s/g, "")}`}
                  className="inline-flex min-h-8 items-center gap-1 text-sm text-primary underline-offset-4 hover:underline"
                >
                  <Phone className="size-3.5" aria-hidden />
                  {owner.phone}
                </a>
              </div>
            </div>
          )}
        </div>

        {(patient.alerts.length > 0 || overdue.length > 0) && (
          <section
            aria-label="Medical alerts"
            className="rounded-xl border-2 border-red-600 bg-red-50 p-4"
          >
            {patient.alerts.length > 0 && (
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <h2 className="flex items-center gap-2 text-sm font-bold tracking-wide text-red-800 uppercase">
                  <ShieldAlert className="size-5" aria-hidden />
                  Medical alerts
                </h2>
                <AlertBadges alerts={patient.alerts} size="lg" />
              </div>
            )}
            {overdue.length > 0 && (
              <p
                className={cn(
                  "flex items-start gap-2 text-sm font-medium text-red-900",
                  patient.alerts.length > 0 && "mt-3 border-t border-red-200 pt-3",
                )}
              >
                <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
                <span>
                  {overdue.length} vaccination{overdue.length > 1 ? "s" : ""} overdue:{" "}
                  {overdue.map((v) => v.name).join(", ")}. Ask the vet before
                  booking boosters.
                </span>
              </p>
            )}
          </section>
        )}
      </header>

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <div className="grid gap-5">
          <Card>
            <CardHeader>
              <CardTitle>Weight trend</CardTitle>
              <CardDescription>
                {weights.length > 0
                  ? `${weights.length} weigh-ins from ${formatDate(weights[0].date)} to ${formatDate(weights[weights.length - 1].date)}`
                  : "No weigh-ins recorded yet"}
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              {latest ? (
                <>
                  <div className="flex flex-wrap items-end gap-x-6 gap-y-2">
                    <p>
                      <span className="text-4xl font-semibold tabular-nums">{latest.kg}</span>
                      <span className="ml-1 text-muted-foreground">kg now</span>
                    </p>
                    <p
                      className={cn(
                        "flex items-center gap-1.5 text-sm font-medium",
                        totalDelta < 0 ? "text-amber-800" : "text-foreground",
                      )}
                    >
                      {totalDelta < 0 ? (
                        <TrendingDown className="size-4" aria-hidden />
                      ) : (
                        <TrendingUp className="size-4" aria-hidden />
                      )}
                      {signed(totalDelta)} since {formatDate(first.date)}
                      <span className="font-normal text-muted-foreground">
                        ({signed(lastDelta)} at the last visit)
                      </span>
                    </p>
                  </div>
                  <WeightChart weights={weights} />
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Nothing to chart until the first weigh-in.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Visit history</CardTitle>
              <CardDescription>Newest first, with the vet&apos;s notes</CardDescription>
            </CardHeader>
            <CardContent>
              {record && record.visits.length > 0 ? (
                <ol className="grid gap-0">
                  {record.visits.map((v) => (
                    <li
                      key={v.date}
                      className="grid gap-1 border-l-2 border-border py-3 pl-4 first:pt-0 last:pb-0"
                    >
                      <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                        <p className="font-semibold">
                          <time dateTime={v.date}>{formatDate(v.date)}</time>
                          <span className="font-normal text-muted-foreground">
                            {" "}
                            · {v.reason}
                          </span>
                        </p>
                        <p className="text-sm text-muted-foreground tabular-nums">
                          {getVet(v.vet)?.name} · {formatUsd(v.invoice_usd)}
                        </p>
                      </div>
                      <p className="text-sm leading-relaxed">{v.notes}</p>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No past visits are on file for {patient.name}.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-5">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarClock className="size-4" aria-hidden />
                Today at the clinic
              </CardTitle>
            </CardHeader>
            <CardContent>
              {todays.length > 0 ? (
                <ul className="grid gap-3">
                  {todays.map((a) => (
                    <li key={a.id} className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium tabular-nums">
                          {a.start} to {endTime(a)} · {a.reason}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {getVet(a.vet)?.name} · {getVet(a.vet)?.room}
                        </p>
                      </div>
                      <Badge variant="outline">{STATUS_LABEL[a.status]}</Badge>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No appointments today.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Vaccinations</CardTitle>
              <CardDescription>
                Checked against today, {formatDate(TODAY)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {vaccines.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vaccine</TableHead>
                      <TableHead>Due</TableHead>
                      <TableHead className="text-right">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vaccines.map((v) => (
                      <TableRow
                        key={v.name}
                        className={cn(v.state === "overdue" && "bg-red-50 hover:bg-red-50")}
                      >
                        <TableCell>
                          <p className="font-medium">{v.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Given {formatDate(v.given)}
                          </p>
                        </TableCell>
                        <TableCell className="tabular-nums">{formatDate(v.due)}</TableCell>
                        <TableCell className="text-right">
                          {v.state === "overdue" ? (
                            <Badge variant="destructive" className="gap-1 font-bold dark:bg-destructive">
                              <TriangleAlert aria-hidden />
                              Overdue {Math.abs(v.days)} days
                            </Badge>
                          ) : v.state === "due-soon" ? (
                            <Badge className="border-amber-300 bg-amber-100 text-amber-950">
                              Due in {v.days} days
                            </Badge>
                          ) : (
                            <Badge variant="secondary">Up to date</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No vaccinations on file.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Pill className="size-4" aria-hidden />
                Current medications
              </CardTitle>
            </CardHeader>
            <CardContent>
              {record && record.medications.length > 0 ? (
                <ul className="divide-y">
                  {record.medications.map((m) => (
                    <li key={m.name} className="py-2.5 first:pt-0 last:pb-0">
                      <p className="font-medium">{m.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {m.dose} · since {formatDate(m.since)}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No current medications.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
```

```tsx components/alert-badges.tsx
import { TriangleAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/** Medical alerts, drawn the same loud way everywhere a patient appears. */
export function AlertBadges({
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
    <ul
      aria-label="Medical alerts"
      className={cn("flex flex-wrap gap-1.5", className)}
    >
      {alerts.map((alert) => (
        <li key={alert}>
          <Badge
            variant="destructive"
            className={cn(
              "gap-1.5 rounded-md font-bold dark:bg-destructive",
              size === "lg"
                ? "px-3 py-1.5 text-sm [&>svg]:size-4"
                : "px-2 py-0.5 text-xs [&>svg]:size-3.5",
            )}
          >
            <TriangleAlert aria-hidden />
            <span className="sr-only">Medical alert: </span>
            {alert}
          </Badge>
        </li>
      ))}
    </ul>
  );
}
```

```tsx components/app-header.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CalendarDays, PawPrint, Search } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { AlertBadges } from "@/components/alert-badges";
import {
  CLINIC,
  TODAY,
  USER,
  formatLongDate,
  getOwner,
  patients,
} from "@/lib/data";

export function AppHeader() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const typing =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const go = (id: string) => {
    setOpen(false);
    router.push(`/patients/${id}`);
  };

  return (
    <header className="sticky top-0 z-30 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-3 px-4 sm:px-6">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2.5 rounded-lg outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <PawPrint className="size-5" aria-hidden />
          </span>
          <span className="hidden leading-tight sm:block">
            <span className="block text-base font-semibold tracking-tight">
              {CLINIC.name}
            </span>
            <span className="block text-xs text-muted-foreground">
              {CLINIC.tagline}
            </span>
          </span>
          <span className="sr-only sm:hidden">Pawpoint home</span>
        </Link>

        <Button
          variant="outline"
          onClick={() => setOpen(true)}
          className="ml-auto h-11 min-w-0 flex-1 justify-start gap-2 px-3 font-normal text-muted-foreground sm:ml-4 sm:max-w-md"
          aria-label="Search patient or owner"
        >
          <Search aria-hidden />
          <span className="truncate">Search patient or owner</span>
          <Kbd className="ml-auto hidden lg:inline-flex">/</Kbd>
        </Button>

        <div className="hidden items-center gap-1 text-sm text-muted-foreground md:ml-auto md:flex">
          <CalendarDays className="size-4" aria-hidden />
          <time dateTime={TODAY}>{formatLongDate(TODAY)}</time>
        </div>

        <div className="flex shrink-0 items-center gap-2.5 md:border-l md:pl-4">
          <Avatar className="size-9">
            <AvatarFallback className="bg-accent text-sm font-semibold text-accent-foreground">
              RL
            </AvatarFallback>
          </Avatar>
          <div className="hidden leading-tight lg:block">
            <p className="text-sm font-medium">{USER.name}</p>
            <p className="text-xs text-muted-foreground">{USER.role}</p>
          </div>
        </div>
      </div>

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="Search patients and owners"
        description="Type a patient or owner name, then choose a result to open the record."
      >
        <CommandInput placeholder="Patient or owner name..." />
        <CommandList className="max-h-[60vh]">
          <CommandEmpty>No patient or owner matches that name.</CommandEmpty>
          <CommandGroup heading="Patients">
            {patients.map((p) => {
              const owner = getOwner(p.owner);
              return (
                <CommandItem
                  key={p.id}
                  value={`${p.name} ${owner?.name ?? ""} ${p.species} ${p.breed}`}
                  onSelect={() => go(p.id)}
                  className="min-h-14 flex-col items-start gap-1"
                >
                  <span className="flex w-full items-baseline gap-2">
                    <span className="font-semibold">{p.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {p.species} · {p.breed}
                    </span>
                    <span className="ml-auto text-xs text-muted-foreground">
                      Owner: {owner?.name}
                    </span>
                  </span>
                  <AlertBadges alerts={p.alerts} />
                </CommandItem>
              );
            })}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </header>
  );
}
```

```tsx components/booking-dialog.tsx
"use client";

import * as React from "react";
import { CircleAlert } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { AlertBadges } from "@/components/alert-badges";
import {
  type Appointment,
  endTime,
  findClash,
  fromMin,
  getOwner,
  getPatient,
  getVet,
  patients,
  vets,
} from "@/lib/data";

const SLOTS = Array.from({ length: 37 }, (_, i) => fromMin(8 * 60 + i * 15));
const DURATIONS = [15, 20, 30, 45, 60, 90];

export function BookingDialog({
  open,
  onOpenChange,
  appointments,
  onBook,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointments: Appointment[];
  onBook: (appointment: Appointment) => void;
}) {
  const [patientId, setPatientId] = React.useState("");
  const [vetId, setVetId] = React.useState("");
  const [start, setStart] = React.useState("");
  const [minutes, setMinutes] = React.useState("20");
  const [reason, setReason] = React.useState("Follow-up");
  const [urgent, setUrgent] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);

  React.useEffect(() => {
    if (!open) {
      setPatientId("");
      setVetId("");
      setStart("");
      setMinutes("20");
      setReason("Follow-up");
      setUrgent(false);
      setSubmitted(false);
    }
  }, [open]);

  const patient = getPatient(patientId);
  const duration = Number(minutes);
  const clash =
    vetId && start ? findClash(appointments, vetId, start, duration) : undefined;
  const clashPatient = clash ? getPatient(clash.patient) : undefined;

  const missing = {
    patient: submitted && !patientId,
    vet: submitted && !vetId,
    start: submitted && !start,
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (!patientId || !vetId || !start || clash) return;
    onBook({
      id: `a-${String(appointments.length + 1).padStart(2, "0")}`,
      patient: patientId,
      vet: vetId,
      start,
      minutes: duration,
      reason: reason.trim() || "Follow-up",
      status: "booked",
      urgent: urgent || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Book an appointment</DialogTitle>
          <DialogDescription>
            Pick the patient, the vet and a time. Times already taken for that
            vet are switched off.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="grid gap-4" noValidate>
          <div className="grid gap-2">
            <Label htmlFor="book-patient">Patient</Label>
            <Select value={patientId} onValueChange={setPatientId}>
              <SelectTrigger
                id="book-patient"
                className="h-11 w-full"
                aria-invalid={missing.patient}
                aria-describedby={missing.patient ? "err-patient" : undefined}
              >
                <SelectValue placeholder="Choose a patient" />
              </SelectTrigger>
              <SelectContent>
                {patients.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name} ({p.species}) · {getOwner(p.owner)?.name}
                    {p.alerts.length > 0 ? " · ALERT" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {missing.patient && (
              <p id="err-patient" className="text-sm text-destructive">
                Choose a patient.
              </p>
            )}
            {patient && patient.alerts.length > 0 && (
              <div className="rounded-lg border border-destructive/40 bg-red-50 p-2.5">
                <p className="mb-1.5 text-xs font-semibold tracking-wide text-destructive uppercase">
                  Medical alerts for {patient.name}
                </p>
                <AlertBadges alerts={patient.alerts} />
              </div>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="book-vet">Vet</Label>
              <Select value={vetId} onValueChange={setVetId}>
                <SelectTrigger
                  id="book-vet"
                  className="h-11 w-full"
                  aria-invalid={missing.vet}
                  aria-describedby={missing.vet ? "err-vet" : undefined}
                >
                  <SelectValue placeholder="Choose a vet" />
                </SelectTrigger>
                <SelectContent>
                  {vets.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.name} · {v.room}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {missing.vet && (
                <p id="err-vet" className="text-sm text-destructive">
                  Choose a vet.
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="book-length">Length</Label>
              <Select value={minutes} onValueChange={setMinutes}>
                <SelectTrigger id="book-length" className="h-11 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
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
            <Label htmlFor="book-time">Time today</Label>
            <Select value={start} onValueChange={setStart}>
              <SelectTrigger
                id="book-time"
                className="h-11 w-full"
                aria-invalid={missing.start || !!clash}
                aria-describedby={
                  clash ? "err-clash" : missing.start ? "err-time" : undefined
                }
              >
                <SelectValue placeholder="Choose a start time" />
              </SelectTrigger>
              <SelectContent className="max-h-72">
                {SLOTS.map((slot) => {
                  const busy = vetId
                    ? !!findClash(appointments, vetId, slot, duration)
                    : false;
                  return (
                    <SelectItem key={slot} value={slot} disabled={busy}>
                      {slot} to {fromMin(
                        Number(slot.slice(0, 2)) * 60 +
                          Number(slot.slice(3)) +
                          duration,
                      )}
                      {busy ? " · taken" : ""}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            {missing.start && (
              <p id="err-time" className="text-sm text-destructive">
                Choose a start time.
              </p>
            )}
            {clash && (
              <p
                id="err-clash"
                role="alert"
                className="flex items-start gap-2 rounded-md border border-destructive/40 bg-red-50 p-2.5 text-sm text-destructive"
              >
                <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
                <span>
                  {getVet(clash.vet)?.name} already has {clashPatient?.name} from{" "}
                  {clash.start} to {endTime(clash)}. Pick another time or vet.
                </span>
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="book-reason">Reason for visit</Label>
            <Input
              id="book-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="h-11"
              autoComplete="off"
            />
          </div>

          <div className="flex items-center justify-between gap-3 rounded-lg border p-3">
            <div>
              <Label htmlFor="book-urgent">Urgent visit</Label>
              <p className="text-xs text-muted-foreground">
                Marks the booking so it stands out on the schedule.
              </p>
            </div>
            <Switch
              id="book-urgent"
              checked={urgent}
              onCheckedChange={setUrgent}
            />
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              className="h-11"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" className="h-11" disabled={!!clash}>
              Book appointment
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

```tsx components/schedule.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  Clock,
  DoorOpen,
  Plus,
  Siren,
  Stethoscope,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertBadges } from "@/components/alert-badges";
import { BookingDialog } from "@/components/booking-dialog";
import {
  type Appointment,
  type Status,
  START_CLOCK,
  STATUS_LABEL,
  TODAY,
  appointments as initialAppointments,
  endTime,
  formatLongDate,
  fromMin,
  getOwner,
  getPatient,
  getVet,
  toMin,
  vets,
} from "@/lib/data";
import { cn } from "@/lib/utils";

const STATUS_STYLE: Record<Status, string> = {
  booked: "border-slate-300 bg-white text-slate-800",
  checked_in: "border-amber-300 bg-amber-100 text-amber-950",
  in_exam: "border-teal-300 bg-teal-100 text-teal-950",
  done: "border-transparent bg-muted text-muted-foreground",
  cancelled: "border-transparent bg-muted text-muted-foreground line-through",
};

function StatusBadge({ status }: { status: Status }) {
  return (
    <Badge variant="outline" className={cn("px-2.5 py-1 text-xs", STATUS_STYLE[status])}>
      {status === "done" && <Check aria-hidden />}
      {STATUS_LABEL[status]}
    </Badge>
  );
}

function waitText(mins: number) {
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min`;
  return `${Math.floor(mins / 60)} h ${mins % 60} min`;
}

export function Schedule() {
  const [appts, setAppts] = React.useState<Appointment[]>(initialAppointments);
  const [clock, setClock] = React.useState(START_CLOCK);
  const [vetFilter, setVetFilter] = React.useState("all");
  const [bookOpen, setBookOpen] = React.useState(false);
  const [freshId, setFreshId] = React.useState<string | null>(null);

  React.useEffect(() => {
    const t = window.setInterval(() => setClock((c) => c + 1), 60_000);
    return () => window.clearInterval(t);
  }, []);

  const advance = (a: Appointment) => {
    const next: Status | null =
      a.status === "booked"
        ? "checked_in"
        : a.status === "checked_in"
          ? "in_exam"
          : a.status === "in_exam"
            ? "done"
            : null;
    if (!next) return;
    setAppts((list) =>
      list.map((x) =>
        x.id === a.id
          ? { ...x, status: next, checkedInAt: next === "checked_in" ? clock : x.checkedInAt }
          : x,
      ),
    );
    const patient = getPatient(a.patient);
    const vet = getVet(a.vet);
    if (next === "checked_in") {
      toast.success(`${patient?.name} is checked in`, {
        description: `Waiting for ${vet?.name}.${
          patient?.alerts.length ? ` Alert: ${patient.alerts.join("; ")}.` : ""
        }`,
      });
    } else if (next === "in_exam") {
      toast(`${patient?.name} is in ${vet?.room}`);
    } else {
      toast(`${patient?.name}'s visit is done`);
    }
  };

  const book = (a: Appointment) => {
    setAppts((list) => [...list, a]);
    setFreshId(a.id);
    setBookOpen(false);
    const p = getPatient(a.patient);
    toast.success(`Booked ${p?.name} at ${a.start}`, {
      description: `${getVet(a.vet)?.name}, ${a.reason}`,
    });
    window.setTimeout(() => setFreshId(null), 6000);
  };

  const sorted = [...appts].sort(
    (a, b) => toMin(a.start) - toMin(b.start) || a.vet.localeCompare(b.vet),
  );
  const visible =
    vetFilter === "all" ? sorted : sorted.filter((a) => a.vet === vetFilter);
  const waiting = appts
    .filter((a) => a.status === "checked_in")
    .sort((a, b) => (a.checkedInAt ?? 0) - (b.checkedInAt ?? 0));

  const count = (s: Status) => appts.filter((a) => a.status === s).length;
  const stats = [
    { label: "Still to arrive", value: count("booked") },
    { label: "Waiting", value: count("checked_in"), hot: count("checked_in") > 0 },
    { label: "In exam", value: count("in_exam") },
    { label: "Done", value: count("done") },
  ];

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">
            <time dateTime={TODAY}>{formatLongDate(TODAY)}</time>
          </p>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Today&apos;s schedule
          </h1>
        </div>
        <Button size="lg" className="h-11 px-5" onClick={() => setBookOpen(true)}>
          <Plus aria-hidden />
          Book appointment
        </Button>
      </div>

      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className={cn(
              "rounded-xl border bg-card px-4 py-3",
              s.hot && "border-amber-300 bg-amber-50",
            )}
          >
            <dt className="text-xs font-medium text-muted-foreground">{s.label}</dt>
            <dd className="text-3xl font-semibold tabular-nums">{s.value}</dd>
          </div>
        ))}
      </dl>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_21rem]">
        <section aria-labelledby="waiting-title" className="lg:order-2 lg:sticky lg:top-24">
          <Card className="gap-0 py-0">
            <CardHeader className="flex flex-row items-center justify-between gap-2 border-b px-4 py-3">
              <CardTitle id="waiting-title" className="flex items-center gap-2 text-base">
                <Clock className="size-4 text-amber-700" aria-hidden />
                Waiting room
                <Badge variant="secondary" className="tabular-nums">
                  {waiting.length}
                </Badge>
              </CardTitle>
              <span className="text-xs text-muted-foreground tabular-nums">
                Clock {fromMin(clock)}
              </span>
            </CardHeader>
            <CardContent className="p-0">
              {waiting.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-muted-foreground">
                  Nobody is waiting. Check a patient in when they arrive.
                </p>
              ) : (
                <ol className="divide-y">
                  {waiting.map((a, i) => {
                    const p = getPatient(a.patient);
                    const vet = getVet(a.vet);
                    const mins = clock - (a.checkedInAt ?? clock);
                    return (
                      <li key={a.id} className="grid gap-2 p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="flex items-center gap-2">
                              {i === 0 && (
                                <Badge className="bg-amber-800 text-white">Next</Badge>
                              )}
                              <Link
                                href={`/patients/${a.patient}`}
                                className="truncate font-semibold underline-offset-4 hover:underline"
                              >
                                {p?.name}
                              </Link>
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {getOwner(p?.owner ?? "")?.name} · {a.reason}
                            </p>
                          </div>
                          <p
                            className={cn(
                              "shrink-0 rounded-md px-2 py-1 text-sm font-semibold tabular-nums",
                              mins >= 30
                                ? "bg-red-100 text-red-900"
                                : "bg-amber-100 text-amber-950",
                            )}
                          >
                            <span className="sr-only">Waiting </span>
                            {waitText(mins)}
                          </p>
                        </div>
                        {p && <AlertBadges alerts={p.alerts} />}
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs text-muted-foreground">
                            Booked {a.start} · {vet?.name} · {vet?.room}
                          </p>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-10"
                            onClick={() => advance(a)}
                            aria-label={`To exam: ${p?.name}, ${vet?.room}`}
                          >
                            <DoorOpen aria-hidden />
                            To exam
                          </Button>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              )}
            </CardContent>
          </Card>
        </section>

        <section aria-labelledby="list-title" className="grid gap-3 lg:order-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 id="list-title" className="text-lg font-semibold">
              Appointments
              <span className="ml-2 text-sm font-normal text-muted-foreground tabular-nums">
                {visible.length} shown
              </span>
            </h2>
            <div
              role="group"
              aria-label="Filter by vet"
              className="-mx-4 flex max-w-[calc(100%+2rem)] gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:max-w-full sm:px-0"
            >
              {[{ id: "all", label: "All vets" }].concat(
                vets.map((v) => ({ id: v.id, label: `Dr. ${v.name.split(" ").pop()}` })),
              ).map((f) => (
                <Button
                  key={f.id}
                  size="sm"
                  variant={vetFilter === f.id ? "default" : "outline"}
                  aria-pressed={vetFilter === f.id}
                  className="h-10 shrink-0 px-4"
                  onClick={() => setVetFilter(f.id)}
                >
                  {f.label}
                </Button>
              ))}
            </div>
          </div>

          <Card className="gap-0 overflow-hidden py-0">
            <ul className="divide-y">
              {visible.map((a) => {
                const p = getPatient(a.patient);
                const owner = getOwner(p?.owner ?? "");
                const vet = getVet(a.vet);
                const closed = a.status === "done" || a.status === "cancelled";
                const action =
                  a.status === "booked"
                    ? { label: "Check in", icon: UserCheck, primary: true }
                    : a.status === "checked_in"
                      ? { label: "Start exam", icon: Stethoscope, primary: false }
                      : a.status === "in_exam"
                        ? { label: "Mark done", icon: Check, primary: false }
                        : null;
                return (
                  <li
                    key={a.id}
                    data-urgent={a.urgent || undefined}
                    className={cn(
                      "grid gap-3 border-l-4 border-l-transparent p-4 sm:grid-cols-[5.5rem_minmax(0,1fr)_auto]",
                      closed && "bg-muted/40",
                      a.urgent && !closed && "border-l-red-600 bg-red-50",
                      a.id === freshId && "ring-2 ring-primary ring-inset",
                    )}
                  >
                    <div className="flex items-baseline gap-2 sm:block">
                      <p className="text-lg font-semibold tabular-nums">{a.start}</p>
                      <p className="text-xs text-muted-foreground tabular-nums">
                        to {endTime(a)} · {a.minutes} min
                      </p>
                    </div>

                    <div className="grid min-w-0 gap-1.5">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <Link
                          href={`/patients/${a.patient}`}
                          className={cn(
                            "text-base font-semibold underline-offset-4 hover:underline",
                            a.status === "cancelled" && "line-through",
                          )}
                        >
                          {p?.name}
                        </Link>
                        <span className="text-sm text-muted-foreground">
                          {p?.species} · {p?.breed}
                        </span>
                        {a.urgent && (
                          <Badge className="gap-1 bg-red-700 px-2 py-0.5 font-bold tracking-wide text-white uppercase">
                            <Siren aria-hidden />
                            Urgent
                          </Badge>
                        )}
                        {a.id === freshId && <Badge variant="secondary">New</Badge>}
                      </div>
                      {p && <AlertBadges alerts={p.alerts} />}
                      <p className="text-sm">{a.reason}</p>
                      <p className="text-sm text-muted-foreground">
                        {owner?.name} · {vet?.name} · {vet?.room}
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end sm:justify-start">
                      <StatusBadge status={a.status} />
                      {action && (
                        <Button
                          variant={action.primary ? "default" : "outline"}
                          className="h-11 px-4"
                          onClick={() => advance(a)}
                          aria-label={`${action.label}: ${p?.name}`}
                        >
                          <action.icon aria-hidden />
                          {action.label}
                        </Button>
                      )}
                    </div>
                  </li>
                );
              })}
              {visible.length === 0 && (
                <li className="p-8 text-center text-sm text-muted-foreground">
                  No appointments for this vet today.
                </li>
              )}
            </ul>
          </Card>
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            Tap a patient name to open the record <ArrowRight className="size-3" aria-hidden />
          </p>
        </section>
      </div>

      <BookingDialog
        open={bookOpen}
        onOpenChange={setBookOpen}
        appointments={appts}
        onBook={book}
      />
    </div>
  );
}
```

```tsx components/weight-chart.tsx
"use client";

import { CartesianGrid, LabelList, Line, LineChart, XAxis, YAxis } from "recharts";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { formatDate, formatMonth } from "@/lib/data";

const config = {
  kg: { label: "Weight (kg)", color: "var(--chart-1)" },
} satisfies ChartConfig;

export function WeightChart({
  weights,
}: {
  weights: { date: string; kg: number }[];
}) {
  const data = weights.map((w) => ({ ...w, label: formatMonth(w.date) }));
  const min = Math.floor(Math.min(...weights.map((w) => w.kg)) - 1);
  const max = Math.ceil(Math.max(...weights.map((w) => w.kg)) + 1);

  return (
    <div>
      <ChartContainer config={config} className="aspect-auto h-60 w-full">
        <LineChart
          accessibilityLayer
          data={data}
          margin={{ top: 24, right: 20, left: 0, bottom: 0 }}
        >
          <CartesianGrid vertical={false} />
          <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
          <YAxis
            domain={[min, max]}
            tickLine={false}
            axisLine={false}
            width={36}
            tickCount={5}
          />
          <ChartTooltip
            cursor={false}
            content={
              <ChartTooltipContent
                labelFormatter={(_value, payload) => {
                  const d = payload?.[0]?.payload as { date?: string } | undefined;
                  return d?.date ? formatDate(d.date) : "";
                }}
              />
            }
          />
          <Line
            dataKey="kg"
            type="monotone"
            stroke="var(--color-kg)"
            strokeWidth={2.5}
            dot={{ r: 4, fill: "var(--color-kg)" }}
            activeDot={{ r: 6 }}
          >
            <LabelList
              dataKey="kg"
              position="top"
              offset={10}
              className="fill-foreground text-xs font-medium"
            />
          </Line>
        </LineChart>
      </ChartContainer>
      <table className="sr-only">
        <caption>Weight in kilograms at each visit</caption>
        <thead>
          <tr>
            <th>Date</th>
            <th>Weight (kg)</th>
          </tr>
        </thead>
        <tbody>
          {weights.map((w) => (
            <tr key={w.date}>
              <td>{formatDate(w.date)}</td>
              <td>{w.kg}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

```ts lib/data.ts
export const CLINIC = {
  name: "Pawpoint",
  tagline: "Hillside Veterinary Clinic",
  description:
    "Pawpoint, front-desk and records software for Hillside Veterinary Clinic",
};

export const TODAY = "2026-11-12";
/** The front desk clock the demo starts at, in minutes after midnight (09:52). */
export const START_CLOCK = 9 * 60 + 52;

export const USER = { name: "Rosa Lindqvist", role: "Receptionist" };

export type Vet = { id: string; name: string; room: string };
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
export type Status =
  | "booked"
  | "checked_in"
  | "in_exam"
  | "done"
  | "cancelled";
export type Appointment = {
  id: string;
  patient: string;
  vet: string;
  start: string;
  minutes: number;
  reason: string;
  status: Status;
  urgent?: boolean;
  /** Minutes after midnight when the patient was checked in. */
  checkedInAt?: number;
};

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

export const appointments: Appointment[] = [
  { id: "a-01", patient: "p-101", vet: "v-1", start: "08:30", minutes: 20, reason: "Annual vaccination", status: "done" },
  { id: "a-02", patient: "p-104", vet: "v-2", start: "08:30", minutes: 30, reason: "Kidney panel recheck", status: "done" },
  { id: "a-03", patient: "p-108", vet: "v-3", start: "08:00", minutes: 120, reason: "Soft palate surgery", status: "in_exam" },
  { id: "a-04", patient: "p-102", vet: "v-1", start: "09:00", minutes: 30, reason: "Limping, left hind leg", status: "in_exam" },
  { id: "a-05", patient: "p-107", vet: "v-2", start: "09:15", minutes: 20, reason: "Glucose curve", status: "checked_in", checkedInAt: 9 * 60 + 8 },
  { id: "a-06", patient: "p-105", vet: "v-1", start: "09:45", minutes: 20, reason: "Beak and nail trim", status: "checked_in", checkedInAt: 9 * 60 + 40 },
  { id: "a-07", patient: "p-103", vet: "v-2", start: "10:00", minutes: 30, reason: "Senior wellness exam", status: "booked" },
  { id: "a-08", patient: "p-106", vet: "v-1", start: "10:30", minutes: 20, reason: "Not eating since yesterday", status: "booked", urgent: true },
  { id: "a-09", patient: "p-104", vet: "v-3", start: "11:00", minutes: 45, reason: "Dental cleaning", status: "booked" },
  { id: "a-10", patient: "p-101", vet: "v-2", start: "11:30", minutes: 20, reason: "Ear infection follow-up", status: "booked" },
  { id: "a-11", patient: "p-107", vet: "v-1", start: "13:30", minutes: 30, reason: "Dental check", status: "booked" },
  { id: "a-12", patient: "p-103", vet: "v-3", start: "14:00", minutes: 60, reason: "Lump removal", status: "cancelled" },
  { id: "a-13", patient: "p-102", vet: "v-2", start: "15:00", minutes: 20, reason: "X-ray results", status: "booked" },
];

export type PatientRecord = {
  weights_kg: { date: string; kg: number }[];
  vaccinations: { name: string; given: string; due: string }[];
  medications: { name: string; dose: string; since: string }[];
  visits: {
    date: string;
    vet: string;
    reason: string;
    notes: string;
    invoice_usd: number;
  }[];
};

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
        notes:
          "Creatinine 2.1 mg/dL (was 2.0). Weight down 0.6 kg. Continue benazepril, recheck in 3 months.",
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
        notes:
          "Mild kennel cough. Supportive care; no antibiotics given (penicillin allergy).",
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

/* ---------- helpers ---------- */

export const getPatient = (id: string) => patients.find((p) => p.id === id);
export const getOwner = (id: string) => owners.find((o) => o.id === id);
export const getVet = (id: string) => vets.find((v) => v.id === id);

export const toMin = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};
export const fromMin = (min: number) =>
  `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;
export const endTime = (a: { start: string; minutes: number }) =>
  fromMin(toMin(a.start) + a.minutes);

/** True when [start, start+minutes) overlaps a live booking of the same vet. */
export function findClash(
  list: Appointment[],
  vetId: string,
  start: string,
  minutes: number,
): Appointment | undefined {
  const s = toMin(start);
  const e = s + minutes;
  return list.find(
    (a) =>
      a.vet === vetId &&
      a.status !== "cancelled" &&
      s < toMin(a.start) + a.minutes &&
      toMin(a.start) < e,
  );
}

const dateFmt = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});
const shortFmt = new Intl.DateTimeFormat("en-GB", {
  month: "short",
  year: "2-digit",
  timeZone: "UTC",
});
const longFmt = new Intl.DateTimeFormat("en-GB", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});
const utc = (iso: string) => new Date(`${iso}T00:00:00Z`);
export const formatDate = (iso: string) => dateFmt.format(utc(iso));
export const formatMonth = (iso: string) => shortFmt.format(utc(iso));
export const formatLongDate = (iso: string) => longFmt.format(utc(iso));
export const formatUsd = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

const DAY = 86_400_000;
export const daysBetween = (fromIso: string, toIso: string) =>
  Math.round((utc(toIso).getTime() - utc(fromIso).getTime()) / DAY);

export function ageText(born: string, today = TODAY) {
  const b = utc(born);
  const t = utc(today);
  let months =
    (t.getUTCFullYear() - b.getUTCFullYear()) * 12 +
    (t.getUTCMonth() - b.getUTCMonth());
  if (t.getUTCDate() < b.getUTCDate()) months -= 1;
  const y = Math.floor(months / 12);
  const m = months % 12;
  if (y === 0) return `${m} mo`;
  return m ? `${y} yr ${m} mo` : `${y} yr`;
}

export type VaccineState = "overdue" | "due-soon" | "current";
export function vaccineState(due: string, today = TODAY) {
  const days = daysBetween(today, due);
  const state: VaccineState =
    days < 0 ? "overdue" : days <= 60 ? "due-soon" : "current";
  return { state, days };
}

export const STATUS_LABEL: Record<Status, string> = {
  booked: "Booked",
  checked_in: "Checked in",
  in_exam: "In exam",
  done: "Done",
  cancelled: "Cancelled",
};
```

