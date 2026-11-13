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
