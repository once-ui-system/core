import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarClock, CircleCheck, Phone, Pill, Syringe, TriangleAlert } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { AlertBadges } from "@/components/alert-badges";
import { WeightChart } from "@/components/weight-chart";
import { Badge } from "@/components/ui/badge";
import {
  ageText,
  daysBetween,
  endTime,
  formatDate,
  getOwner,
  getPatient,
  getVet,
  initialAppointments,
  patients,
  records,
  statusLabel,
  today,
} from "@/lib/data";

export const dynamicParams = false;

export function generateStaticParams() {
  return patients.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const p = getPatient(id);
  return { title: p ? `${p.name} · Pawpoint` : "Patient · Pawpoint" };
}

function Section({ id, title, icon, children }: { id: string; title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section aria-labelledby={id} className="rounded-xl border bg-card p-4 shadow-xs sm:p-5">
      <h2 id={id} className="mb-3 flex items-center gap-2 text-base font-semibold">
        {icon}
        {title}
      </h2>
      {children}
    </section>
  );
}

export default async function PatientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const patient = getPatient(id);
  if (!patient) notFound();
  const owner = getOwner(patient.owner);
  const record = records[patient.id];
  const todays = initialAppointments.filter((a) => a.patient === patient.id).sort((a, b) => a.start.localeCompare(b.start));

  const first = record?.weights_kg[0];
  const last = record?.weights_kg[record.weights_kg.length - 1];
  const delta = first && last ? last.kg - first.kg : 0;
  const pct = first ? (delta / first.kg) * 100 : 0;

  return (
    <AppShell>
      <div className="space-y-5">
        <Link href="/" className="inline-flex h-10 items-center gap-1.5 rounded-md text-sm font-medium text-muted-foreground outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50">
          <ArrowLeft aria-hidden className="size-4" /> Today’s schedule
        </Link>

        <header className="rounded-xl border bg-card p-4 shadow-xs sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">{patient.name}</h1>
              <p className="text-muted-foreground">
                {patient.breed} · {patient.species}
              </p>
            </div>
            {owner && (
              <a
                href={`tel:${owner.phone.replace(/\s/g, "")}`}
                className="inline-flex h-11 items-center gap-2 rounded-md border px-4 text-sm font-medium hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
              >
                <Phone aria-hidden className="size-4" /> Call {owner.name.split(" ")[0]} · {owner.phone}
              </a>
            )}
          </div>

          {patient.alerts.length > 0 && (
            <div role="region" aria-label="Medical alerts" className="mt-4 rounded-lg border-2 border-red-600 bg-red-50 p-3 dark:bg-red-950/50">
              <p className="mb-2 flex items-center gap-2 text-sm font-bold tracking-wide text-red-800 uppercase dark:text-red-200">
                <TriangleAlert aria-hidden className="size-5" /> Medical alerts
              </p>
              <AlertBadges alerts={patient.alerts} size="md" />
            </div>
          )}

          <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-4 text-sm sm:grid-cols-4">
            {[
              ["Age", `${ageText(patient.born)} (born ${formatDate(patient.born)})`],
              ["Sex", patient.sex],
              ["Owner", owner?.name ?? "Not given"],
              ["Owner phone", owner?.phone ?? "Not given"],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="text-xs text-muted-foreground">{k}</dt>
                <dd className="font-medium">{v}</dd>
              </div>
            ))}
          </dl>
        </header>

        {todays.length > 0 && (
          <Section id="today-title" title="Today at the clinic" icon={<CalendarClock aria-hidden className="size-4" />}>
            <ul className="divide-y">
              {todays.map((a) => (
                <li key={a.id} className="flex flex-wrap items-center justify-between gap-2 py-2 first:pt-0 last:pb-0">
                  <span>
                    <span className="font-medium tabular-nums">
                      {a.start} to {endTime(a)}
                    </span>{" "}
                    · {a.reason} · {getVet(a.vet)?.name}
                  </span>
                  <Badge variant="secondary">{statusLabel[a.status]}</Badge>
                </li>
              ))}
            </ul>
          </Section>
        )}

        {!record ? (
          <Section id="no-record" title="Clinical record">
            <p className="text-sm text-muted-foreground">No weights, vaccinations, medications or visit history are on file for {patient.name} in this demo.</p>
          </Section>
        ) : (
          <div className="grid gap-5 lg:grid-cols-2">
            <div className="lg:col-span-2">
              <Section id="weight-title" title="Weight trend">
                <div className="mb-2 flex flex-wrap items-baseline gap-x-4 gap-y-1">
                  <p className="text-3xl font-semibold tabular-nums">{last?.kg} kg</p>
                  <p className="text-sm text-muted-foreground">
                    {delta < 0 ? "Down" : "Up"} {Math.abs(delta).toFixed(1)} kg ({Math.abs(pct).toFixed(0)}%) since {first && formatDate(first.date, { month: "short", year: "numeric" })}, {record.weights_kg.length} visits
                  </p>
                </div>
                <WeightChart points={record.weights_kg} />
              </Section>
            </div>

            <Section id="vax-title" title="Vaccinations" icon={<Syringe aria-hidden className="size-4" />}>
              <ul className="divide-y">
                {record.vaccinations.map((v) => {
                  const overdueBy = daysBetween(v.due, today);
                  const overdue = overdueBy > 0;
                  const soon = !overdue && overdueBy > -30;
                  return (
                    <li key={v.name} className="flex flex-wrap items-center justify-between gap-2 py-3 first:pt-0 last:pb-0">
                      <div>
                        <p className="font-medium">{v.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Given {formatDate(v.given)} · due {formatDate(v.due)}
                        </p>
                      </div>
                      {overdue ? (
                        <Badge className="gap-1 bg-red-600 px-2.5 py-1 text-white">
                          <TriangleAlert aria-hidden /> Overdue {overdueBy} {overdueBy === 1 ? "day" : "days"}
                        </Badge>
                      ) : soon ? (
                        <Badge className="bg-amber-500 px-2.5 py-1 text-amber-950">Due in {-overdueBy} days</Badge>
                      ) : (
                        <Badge variant="outline" className="gap-1 border-emerald-400 px-2.5 py-1 text-emerald-800 dark:text-emerald-300">
                          <CircleCheck aria-hidden /> Up to date
                        </Badge>
                      )}
                    </li>
                  );
                })}
              </ul>
            </Section>

            <Section id="meds-title" title="Current medications" icon={<Pill aria-hidden className="size-4" />}>
              <ul className="divide-y">
                {record.medications.map((m) => (
                  <li key={m.name} className="py-3 first:pt-0 last:pb-0">
                    <p className="font-medium">{m.name}</p>
                    <p className="text-sm">{m.dose}</p>
                    <p className="text-xs text-muted-foreground">Since {formatDate(m.since)}</p>
                  </li>
                ))}
              </ul>
            </Section>

            <div className="lg:col-span-2">
              <Section id="visits-title" title="Visit history">
                <ol className="space-y-4">
                  {record.visits.map((v) => (
                    <li key={v.date} className="grid gap-1 border-l-2 border-teal-700/60 pl-4">
                      <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                        <p className="font-medium">
                          {formatDate(v.date)} · {v.reason}
                        </p>
                        <p className="text-sm text-muted-foreground tabular-nums">${v.invoice_usd.toFixed(2)}</p>
                      </div>
                      <p className="text-sm text-muted-foreground">{getVet(v.vet)?.name}</p>
                      <p className="text-sm">{v.notes}</p>
                    </li>
                  ))}
                </ol>
              </Section>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
