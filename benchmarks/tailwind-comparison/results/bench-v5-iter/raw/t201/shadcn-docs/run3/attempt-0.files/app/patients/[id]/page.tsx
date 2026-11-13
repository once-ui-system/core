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
