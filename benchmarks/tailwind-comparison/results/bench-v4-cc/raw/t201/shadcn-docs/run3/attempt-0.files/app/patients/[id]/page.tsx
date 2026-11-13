import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CalendarDays,
  ChevronLeft,
  CircleCheck,
  Pill,
  Phone,
  PawPrint,
  Scale,
  Stethoscope,
  Syringe,
  TriangleAlert,
  TrendingDown,
} from "lucide-react";
import { AlertBanner } from "@/components/alerts";
import { AppShell } from "@/components/app-shell";
import { StatusBadge } from "@/components/status-badge";
import { WeightChart } from "@/components/weight-chart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  TODAY,
  ageLabel,
  appointments,
  endClock,
  formatDate,
  formatUsd,
  getPatient,
  getVet,
  ownerOf,
  patients,
  records,
  vaccinationState,
  vets,
  type PatientRecord,
} from "@/lib/data";
import { cn } from "@/lib/utils";

type Props = { params: Promise<{ id: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return patients.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const patient = getPatient(id);
  return { title: patient ? `${patient.name} · Pawpoint` : "Patient · Pawpoint" };
}

export default async function PatientPage({ params }: Props) {
  const { id } = await params;
  const patient = getPatient(id);
  if (!patient) notFound();

  const owner = ownerOf(patient);
  const record: PatientRecord | undefined = records[id];
  const todays = appointments
    .filter((a) => a.patient === id)
    .sort((a, b) => a.start.localeCompare(b.start));

  const vaccines = record
    ? record.vaccinations.map((v) => ({ ...v, state: vaccinationState(v.due) }))
    : [];
  const overdue = vaccines.filter((v) => v.state.kind === "overdue");

  const weights = record?.weights_kg ?? [];
  const firstW = weights[0];
  const lastW = weights[weights.length - 1];
  const delta = firstW && lastW ? lastW.kg - firstW.kg : 0;
  const pct = firstW ? (delta / firstW.kg) * 100 : 0;

  return (
    <AppShell>
      <div className="grid gap-6">
        <Link
          href="/"
          className="inline-flex min-h-11 w-fit items-center gap-1 rounded-md pr-2 text-sm font-medium text-muted-foreground hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
          Today&rsquo;s schedule
        </Link>

        <header className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground">
              <PawPrint className="size-8" aria-hidden="true" />
            </span>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">{patient.name}</h1>
              <p className="text-muted-foreground">
                {patient.breed} &middot; {patient.species} &middot; {ageLabel(patient.born)} &middot; {patient.sex}
              </p>
            </div>
          </div>
          <a
            href={`tel:${owner.phone.replace(/\s+/g, "")}`}
            className="inline-flex h-12 items-center gap-3 rounded-lg border bg-card px-4 shadow-xs hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
          >
            <Phone className="size-5 text-primary" aria-hidden="true" />
            <span className="leading-tight">
              <span className="block text-xs text-muted-foreground">Owner &middot; {owner.name}</span>
              <span className="block font-semibold tabular-nums">{owner.phone}</span>
            </span>
          </a>
        </header>

        <AlertBanner name={patient.name} alerts={patient.alerts} />

        {overdue.length > 0 && (
          <section
            aria-labelledby="overdue-heading"
            className="flex items-start gap-3 rounded-xl border border-amber-400 bg-amber-50 p-4 text-amber-950 dark:border-amber-600 dark:bg-amber-950/30 dark:text-amber-100"
          >
            <Syringe className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
            <div>
              <h2 id="overdue-heading" className="font-semibold">
                {overdue.length} {overdue.length === 1 ? "vaccination is" : "vaccinations are"} overdue
              </h2>
              <p className="text-sm">
                {overdue.map((v) => `${v.name} (${v.state.label.toLowerCase()})`).join(", ")}
              </p>
            </div>
          </section>
        )}

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="grid min-w-0 gap-6">
            {record ? (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Syringe className="size-5 text-primary" aria-hidden="true" />
                      Vaccinations
                    </CardTitle>
                    <CardDescription>Checked against today, {formatDate(TODAY)}.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="grid gap-2">
                      {vaccines.map((v) => (
                        <li
                          key={v.name}
                          className={cn(
                            "flex flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-lg border p-3",
                            v.state.kind === "overdue" &&
                              "border-red-400 bg-red-50 dark:border-red-700 dark:bg-red-950/30",
                            v.state.kind === "soon" &&
                              "border-amber-400 bg-amber-50 dark:border-amber-700 dark:bg-amber-950/30"
                          )}
                        >
                          <div>
                            <p className="font-semibold">{v.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Given {formatDate(v.given)} &middot; due {formatDate(v.due)}
                            </p>
                          </div>
                          {v.state.kind === "overdue" ? (
                            <span className="inline-flex items-center gap-1.5 rounded-md bg-red-600 px-2.5 py-1 text-sm font-semibold text-white">
                              <TriangleAlert className="size-4" aria-hidden="true" />
                              {v.state.label}
                            </span>
                          ) : v.state.kind === "soon" ? (
                            <span className="inline-flex items-center gap-1.5 rounded-md bg-amber-200 px-2.5 py-1 text-sm font-semibold text-amber-950">
                              {v.state.label}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-800 dark:text-emerald-300">
                              <CircleCheck className="size-4" aria-hidden="true" />
                              {v.state.label}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Scale className="size-5 text-primary" aria-hidden="true" />
                      Weight trend
                    </CardTitle>
                    <CardDescription>
                      {weights.length} visits, {formatDate(firstW.date)} to {formatDate(lastW.date)}, in kilograms.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-4">
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                      <p>
                        <span className="text-3xl font-semibold tabular-nums">{lastW.kg.toFixed(1)}</span>
                        <span className="ml-1 text-muted-foreground">kg today</span>
                      </p>
                      <p className="flex items-center gap-1.5 text-sm font-medium">
                        <TrendingDown className="size-4 text-amber-700" aria-hidden="true" />
                        <span className="tabular-nums">
                          {delta.toFixed(1)} kg ({pct.toFixed(0)}%) since {formatDate(firstW.date)}
                        </span>
                      </p>
                    </div>
                    <WeightChart points={weights} name={patient.name} />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Stethoscope className="size-5 text-primary" aria-hidden="true" />
                      Visit history
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ol className="grid gap-4">
                      {record.visits.map((v) => (
                        <li key={v.date} className="grid gap-1 border-l-2 border-primary/40 pl-4">
                          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                            <p className="font-semibold">
                              {formatDate(v.date)}
                              <span className="font-normal text-muted-foreground"> &middot; {v.reason}</span>
                            </p>
                            <p className="text-sm text-muted-foreground tabular-nums">
                              {getVet(v.vet)?.name} &middot; {formatUsd(v.invoice_usd)}
                            </p>
                          </div>
                          <p className="text-sm leading-relaxed">{v.notes}</p>
                        </li>
                      ))}
                    </ol>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>No detailed history on file</CardTitle>
                  <CardDescription>
                    Vaccinations, weights, medications and visit notes for {patient.name} have not been loaded
                    in this workspace yet.
                  </CardDescription>
                </CardHeader>
              </Card>
            )}
          </div>

          <div className="grid min-w-0 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Patient and owner</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
                  <Detail label="Species" value={patient.species} />
                  <Detail label="Breed" value={patient.breed} />
                  <Detail label="Born" value={`${formatDate(patient.born)} (${ageLabel(patient.born)})`} />
                  <Detail label="Sex" value={patient.sex} />
                  <Detail label="Patient ID" value={patient.id} />
                  <Detail label="Owner" value={owner.name} />
                  <Detail label="Phone" value={owner.phone} />
                </dl>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarDays className="size-5 text-primary" aria-hidden="true" />
                  Today
                </CardTitle>
                <CardDescription>{formatDate(TODAY)}</CardDescription>
              </CardHeader>
              <CardContent>
                {todays.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No appointments today.</p>
                ) : (
                  <ul className="grid gap-3">
                    {todays.map((a) => (
                      <li key={a.id} className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium tabular-nums">
                            {a.start} to {endClock(a)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {a.reason} &middot; {vets.find((v) => v.id === a.vet)?.name}
                          </p>
                        </div>
                        <StatusBadge status={a.status} />
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            {record && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Pill className="size-5 text-primary" aria-hidden="true" />
                    Current medications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="grid gap-3">
                    {record.medications.map((m) => (
                      <li key={m.name} className="rounded-lg border p-3">
                        <p className="font-semibold">{m.name}</p>
                        <p className="text-sm">{m.dose}</p>
                        <p className="text-xs text-muted-foreground">Since {formatDate(m.since)}</p>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </>
  );
}
