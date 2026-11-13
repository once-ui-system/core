import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Bird,
  Cat,
  ChevronLeft,
  Clock,
  Dog,
  PawPrint,
  Phone,
  Pill,
  Rabbit,
  Scale,
  Stethoscope,
  Syringe,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";

import { AppHeader } from "@/components/pawpoint/app-header";
import { AlertChips } from "@/components/pawpoint/alert-chips";
import { WeightChart } from "@/components/pawpoint/weight-chart";
import { Badge } from "@/components/ui/badge";
import {
  APPOINTMENTS,
  PATIENTS,
  RECORDS,
  STATUS_LABEL,
  TODAY,
  ageText,
  endTime,
  formatDate,
  ownerById,
  patientById,
  toMin,
  usd,
  vaccinationState,
  vetById,
} from "@/lib/data";
import { cn } from "@/lib/utils";

const SPECIES_ICON: Record<string, LucideIcon> = { Dog, Cat, Bird, Rabbit };

export function generateStaticParams() {
  return PATIENTS.map((p) => ({ id: p.id }));
}

function Section({
  title,
  icon: Icon,
  children,
  aside,
  id,
}: {
  title: string;
  icon: LucideIcon;
  children: React.ReactNode;
  aside?: React.ReactNode;
  id: string;
}) {
  return (
    <section className="rounded-xl border bg-card" aria-labelledby={id}>
      <div className="flex items-center justify-between gap-3 border-b px-4 py-3 sm:px-5">
        <h2 id={id} className="flex items-center gap-2 text-base font-semibold">
          <Icon className="size-4 text-muted-foreground" aria-hidden="true" />
          {title}
        </h2>
        {aside}
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </section>
  );
}

export default async function PatientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!PATIENTS.some((p) => p.id === id)) notFound();

  const patient = patientById(id);
  const owner = ownerById(patient.owner);
  const record = RECORDS[id];
  const SpeciesIcon = SPECIES_ICON[patient.species] ?? PawPrint;
  const today = APPOINTMENTS.filter((a) => a.patient === id).sort((a, b) => toMin(a.start) - toMin(b.start));

  const vaccinations = record
    ? record.vaccinations
        .map((v) => ({ ...v, ...vaccinationState(v.due) }))
        .sort((a, b) => (a.state === "overdue" ? 0 : 1) - (b.state === "overdue" ? 0 : 1) || a.due.localeCompare(b.due))
    : [];
  const overdue = vaccinations.filter((v) => v.state === "overdue");

  return (
    <>
      <AppHeader />
      <main id="main" className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-8">
        <Link
          href="/"
          className="mb-4 inline-flex h-10 items-center gap-1 rounded-md pr-3 text-sm font-medium text-muted-foreground hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
          Today&apos;s schedule
        </Link>

        {/* Hero */}
        <section className="overflow-hidden rounded-2xl border bg-card" aria-labelledby="patient-name">
          {patient.alerts.length > 0 && (
            <div className="border-b border-red-700 bg-red-600 px-4 py-3 text-white sm:px-6" role="region" aria-label="Medical alerts">
              <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide">
                <TriangleAlert className="size-5" aria-hidden="true" />
                Medical alerts: read before handling
              </p>
              <ul className="mt-2 flex flex-wrap gap-2">
                {patient.alerts.map((a) => (
                  <li key={a} className="rounded-md bg-white px-3 py-1.5 text-base font-bold text-red-700 sm:text-lg">
                    <span className="sr-only">Medical alert: </span>
                    {a}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid gap-5 p-4 sm:p-6 md:grid-cols-[minmax(0,1fr)_auto]">
            <div className="flex items-start gap-4">
              <span className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary sm:size-20">
                <SpeciesIcon className="size-9 sm:size-11" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <h1 id="patient-name" className="text-3xl font-semibold tracking-tight">
                  {patient.name}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {patient.species}, {patient.breed}
                </p>
                <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-3">
                  <div>
                    <dt className="text-xs text-muted-foreground">Age</dt>
                    <dd className="font-medium">{ageText(patient.born)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Born</dt>
                    <dd className="font-medium">{formatDate(patient.born)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Sex</dt>
                    <dd className="font-medium">{patient.sex}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Patient ID</dt>
                    <dd className="font-medium tabular-nums">{patient.id}</dd>
                  </div>
                </dl>
                {overdue.length > 0 && (
                  <p className="mt-3 inline-flex items-center gap-1.5 rounded-md border border-amber-400 bg-amber-100 px-2.5 py-1 text-sm font-semibold text-amber-900">
                    <Syringe className="size-4" aria-hidden="true" />
                    {overdue.length} vaccinations overdue: {overdue.map((v) => v.name).join(", ")}
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-xl border bg-muted/40 p-4 md:min-w-64">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Owner</p>
              <p className="mt-1 text-lg font-semibold">{owner.name}</p>
              <a
                href={`tel:${owner.phone.replace(/\s/g, "")}`}
                className="mt-1 inline-flex h-10 items-center gap-2 text-base font-medium text-primary underline-offset-4 hover:underline"
              >
                <Phone className="size-4" aria-hidden="true" />
                {owner.phone}
              </a>
            </div>
          </div>
        </section>

        {!record && (
          <div className="mt-6 rounded-xl border border-dashed bg-card p-8 text-center">
            <p className="font-medium">No clinical history on file for {patient.name} in this demo.</p>
            <p className="mt-1 text-sm text-muted-foreground">Weights, vaccinations, medications and visit notes appear here once recorded.</p>
          </div>
        )}

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
          <div className="grid content-start gap-6">
            {record && (
              <Section id="weight-title" title="Weight trend" icon={Scale}>
                <WeightChart points={record.weights_kg} name={patient.name} />
              </Section>
            )}

            {record && (
              <Section id="visits-title" title="Visit history" icon={Stethoscope} aside={<Badge variant="secondary">{record.visits.length} visits</Badge>}>
                <ol className="grid gap-4">
                  {record.visits.map((v) => (
                    <li key={v.date} className="grid gap-1 border-l-2 border-primary/30 pl-4">
                      <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                        <p className="font-semibold">
                          {v.reason}
                          {v.date === TODAY && <Badge className="ml-2 align-middle">Today</Badge>}
                        </p>
                        <p className="text-sm tabular-nums text-muted-foreground">{formatDate(v.date)}</p>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {vetById(v.vet).name} · Invoice {usd(v.invoice_usd)}
                      </p>
                      <p className="text-sm leading-relaxed">{v.notes}</p>
                    </li>
                  ))}
                </ol>
              </Section>
            )}
          </div>

          <div className="grid content-start gap-6">
            <Section id="today-title" title="Today" icon={Clock}>
              {today.length === 0 ? (
                <p className="text-sm text-muted-foreground">No appointments today.</p>
              ) : (
                <ul className="grid gap-3">
                  {today.map((a) => (
                    <li key={a.id} className="flex items-start justify-between gap-3 text-sm">
                      <div>
                        <p className="font-medium tabular-nums">
                          {a.start} to {endTime(a)}
                        </p>
                        <p className="text-muted-foreground">
                          {a.reason} · {vetById(a.vet).name}
                        </p>
                      </div>
                      <Badge variant="outline">{STATUS_LABEL[a.status]}</Badge>
                    </li>
                  ))}
                </ul>
              )}
              {patient.alerts.length > 0 && <AlertChips alerts={patient.alerts} className="mt-3" />}
            </Section>

            {record && (
              <Section
                id="vacc-title"
                title="Vaccinations"
                icon={Syringe}
                aside={overdue.length > 0 ? <Badge className="bg-red-600 text-white">{overdue.length} overdue</Badge> : undefined}
              >
                <ul className="grid gap-3">
                  {vaccinations.map((v) => (
                    <li
                      key={v.name}
                      className={cn(
                        "flex items-start justify-between gap-3 rounded-lg border p-3",
                        v.state === "overdue" && "border-red-300 bg-red-50",
                        v.state === "soon" && "border-amber-300 bg-amber-50",
                      )}
                    >
                      <div>
                        <p className="font-semibold">{v.name}</p>
                        <p className="text-xs text-muted-foreground">Given {formatDate(v.given)}</p>
                        <p className="text-xs text-muted-foreground">Due {formatDate(v.due)}</p>
                      </div>
                      <div className="text-right">
                        {v.state === "overdue" && (
                          <p className="inline-flex items-center gap-1 rounded-md bg-red-600 px-2 py-0.5 text-xs font-bold text-white">
                            <TriangleAlert className="size-3.5" aria-hidden="true" />
                            Overdue
                          </p>
                        )}
                        {v.state === "soon" && <p className="text-xs font-bold text-amber-900">Due soon</p>}
                        {v.state === "ok" && <p className="text-xs font-medium text-emerald-800">Up to date</p>}
                        <p className="mt-1 text-xs tabular-nums text-muted-foreground">
                          {v.state === "overdue" ? `${v.days} days late` : `in ${v.days} days`}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {record && (
              <Section id="meds-title" title="Current medications" icon={Pill}>
                <ul className="grid gap-3">
                  {record.medications.map((m) => (
                    <li key={m.name} className="rounded-lg border bg-background p-3">
                      <p className="font-semibold">{m.name}</p>
                      <p className="text-sm">{m.dose}</p>
                      <p className="text-xs text-muted-foreground">Since {formatDate(m.since)}</p>
                    </li>
                  ))}
                </ul>
              </Section>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
