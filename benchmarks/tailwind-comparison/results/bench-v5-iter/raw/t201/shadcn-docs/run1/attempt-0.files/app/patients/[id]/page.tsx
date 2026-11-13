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
