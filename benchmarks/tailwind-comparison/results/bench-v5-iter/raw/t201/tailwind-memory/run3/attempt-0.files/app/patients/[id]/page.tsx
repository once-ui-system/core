import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ChevronLeft,
  CircleCheck,
  ClipboardList,
  Phone,
  Pill,
  Scale,
  Syringe,
  TriangleAlert,
  TrendingDown,
} from "lucide-react";
import {
  TODAY,
  ageText,
  daysBetween,
  fmtDate,
  fmtTime,
  getOwner,
  getPatient,
  getVet,
  initialAppointments,
  money,
  patients,
  records,
  byTime,
} from "@/lib/data";
import { Header } from "@/components/Header";
import { AlertBanner, SpeciesIcon } from "@/components/Alerts";
import { StatusBadge } from "@/components/StatusBadge";
import { WeightChart } from "@/components/WeightChart";

export function generateStaticParams() {
  return patients.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const p = getPatient(id);
  return { title: p ? `${p.name}, patient record` : "Patient not found" };
}

function Card({
  id,
  title,
  icon,
  aside,
  children,
}: {
  id: string;
  title: string;
  icon: React.ReactNode;
  aside?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section aria-labelledby={id} className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-4 py-3 sm:px-5">
        <h2 id={id} className="flex items-center gap-2 text-lg font-extrabold tracking-tight">
          <span className="text-teal-700">{icon}</span>
          {title}
        </h2>
        {aside}
      </header>
      <div className="px-4 py-4 sm:px-5">{children}</div>
    </section>
  );
}

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-bold uppercase tracking-wide text-slate-600">{label}</dt>
      <dd className="mt-0.5 text-base font-medium">{children}</dd>
    </div>
  );
}

export default async function PatientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const patient = getPatient(id);
  if (!patient) notFound();

  const owner = getOwner(patient.owner);
  const record = records[patient.id];
  const todays = initialAppointments.filter((a) => a.patient === patient.id).sort(byTime);

  const vaccinations = record
    ? record.vaccinations.map((v) => {
        const days = daysBetween(TODAY, v.due);
        return { ...v, days, overdue: days < 0, soon: days >= 0 && days <= 30 };
      })
    : [];
  const overdueCount = vaccinations.filter((v) => v.overdue).length;

  const weights = record?.weights_kg ?? [];
  const firstW = weights[0];
  const lastW = weights[weights.length - 1];
  const delta = firstW && lastW ? lastW.kg - firstW.kg : 0;
  const pct = firstW ? (delta / firstW.kg) * 100 : 0;

  return (
    <>
      <Header />
      <main id="main" className="mx-auto max-w-7xl px-4 pb-16 pt-4 sm:px-6">
        <Link
          href="/"
          className="inline-flex min-h-11 items-center gap-1 rounded-lg pr-3 text-sm font-bold text-teal-800 hover:underline"
        >
          <ChevronLeft aria-hidden className="size-5" />
          Today&rsquo;s schedule
        </Link>

        <div className="mt-1 flex flex-wrap items-center gap-4">
          <span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-teal-700 text-white shadow-sm">
            <SpeciesIcon species={patient.species} className="size-9" />
          </span>
          <div className="min-w-0">
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{patient.name}</h1>
            <p className="text-base text-slate-700">
              {patient.breed} &middot; {patient.species} &middot; {ageText(patient.born, TODAY)} &middot; {patient.sex}
            </p>
            <p className="text-sm text-slate-600">
              Patient {patient.id} &middot; Owner {owner.name}
            </p>
          </div>
        </div>

        <div className="mt-4">
          <AlertBanner name={patient.name} alerts={patient.alerts} />
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:items-start">
          <div className="grid min-w-0 gap-5">
            {record ? (
              <>
                <Card
                  id="weight-h"
                  title="Weight trend"
                  icon={<Scale aria-hidden className="size-5" />}
                  aside={
                    <p className="flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-sm font-bold text-red-800 ring-1 ring-red-200">
                      <TrendingDown aria-hidden className="size-4" />
                      {delta.toFixed(1)} kg ({pct.toFixed(0)}%) since {fmtDate(firstW.date)}
                    </p>
                  }
                >
                  <WeightChart points={weights} name={patient.name} />
                  <p className="mt-2 text-sm text-slate-700">
                    Now <strong>{lastW.kg.toFixed(1)} kg</strong>, down {Math.abs(lastW.kg - weights[weights.length - 2].kg).toFixed(1)} kg since{" "}
                    {fmtDate(weights[weights.length - 2].date)}. Weighed at {weights.length} visits.
                  </p>
                </Card>

                <Card
                  id="vax-h"
                  title="Vaccinations"
                  icon={<Syringe aria-hidden className="size-5" />}
                  aside={
                    overdueCount > 0 ? (
                      <p className="flex items-center gap-1.5 rounded-full bg-red-700 px-3 py-1 text-sm font-bold text-white">
                        <TriangleAlert aria-hidden className="size-4" />
                        {overdueCount} overdue
                      </p>
                    ) : (
                      <p className="flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-sm font-bold text-emerald-900">
                        <CircleCheck aria-hidden className="size-4" />
                        All up to date
                      </p>
                    )
                  }
                >
                  <ul className="grid gap-2">
                    {vaccinations.map((v) => (
                      <li
                        key={v.name}
                        className={`grid gap-x-4 gap-y-1 rounded-xl px-3.5 py-3 sm:grid-cols-[1fr_auto] sm:items-center ${
                          v.overdue
                            ? "border-2 border-red-700 bg-red-50"
                            : "border border-slate-200 bg-slate-50"
                        }`}
                      >
                        <div>
                          <p className="text-base font-bold">{v.name}</p>
                          <p className="text-sm text-slate-700">
                            Given {fmtDate(v.given)} &middot; due {fmtDate(v.due)}
                          </p>
                        </div>
                        {v.overdue ? (
                          <p className="inline-flex w-fit items-center gap-1.5 rounded-lg bg-red-700 px-2.5 py-1.5 text-sm font-extrabold text-white">
                            <TriangleAlert aria-hidden className="size-4" />
                            Overdue by {-v.days} days
                          </p>
                        ) : v.soon ? (
                          <p className="inline-flex w-fit rounded-lg bg-amber-200 px-2.5 py-1.5 text-sm font-extrabold text-amber-950">
                            Due in {v.days} days
                          </p>
                        ) : (
                          <p className="inline-flex w-fit items-center gap-1.5 rounded-lg bg-emerald-100 px-2.5 py-1.5 text-sm font-bold text-emerald-900">
                            <CircleCheck aria-hidden className="size-4" />
                            Up to date
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 text-xs text-slate-600">Checked against today, {fmtDate(TODAY)}.</p>
                </Card>

                <Card id="visits-h" title="Visit history" icon={<ClipboardList aria-hidden className="size-5" />}>
                  <ol className="relative grid gap-4 border-l-2 border-teal-100 pl-5">
                    {record.visits.map((v) => (
                      <li key={v.date} className="relative">
                        <span
                          aria-hidden
                          className="absolute -left-[1.78rem] top-1.5 size-3 rounded-full border-2 border-teal-700 bg-white"
                        />
                        <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                          <h3 className="text-base font-bold">
                            {fmtDate(v.date)} <span className="font-medium text-slate-700">&middot; {v.reason}</span>
                          </h3>
                          <p className="text-sm tabular-nums text-slate-600">{money(v.invoice_usd)}</p>
                        </div>
                        <p className="text-sm text-slate-600">{getVet(v.vet).name}</p>
                        <p className="mt-1.5 rounded-lg bg-slate-50 px-3 py-2 text-[15px] leading-relaxed">{v.notes}</p>
                      </li>
                    ))}
                  </ol>
                </Card>
              </>
            ) : (
              <Card id="norec-h" title="Clinical record" icon={<ClipboardList aria-hidden className="size-5" />}>
                <p className="text-base text-slate-700">
                  No weights, vaccinations, medications or visit notes are on file for {patient.name} in this workspace.
                </p>
              </Card>
            )}
          </div>

          <div className="grid min-w-0 gap-5">
            <Card id="pt-h" title="Patient" icon={<SpeciesIcon species={patient.species} />}>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
                <Fact label="Species">{patient.species}</Fact>
                <Fact label="Breed">{patient.breed}</Fact>
                <Fact label="Born">{fmtDate(patient.born)}</Fact>
                <Fact label="Age">{ageText(patient.born, TODAY)}</Fact>
                <Fact label="Sex">{patient.sex}</Fact>
                <Fact label="Patient ID">{patient.id}</Fact>
              </dl>
            </Card>

            <Card id="owner-h" title="Owner" icon={<Phone aria-hidden className="size-5" />}>
              <p className="text-lg font-bold">{owner.name}</p>
              <a
                href={`tel:${owner.phone.replace(/\s/g, "")}`}
                className="mt-2 inline-flex min-h-11 items-center gap-2 rounded-xl border border-teal-700 px-4 font-bold text-teal-900 hover:bg-teal-50"
              >
                <Phone aria-hidden className="size-4" />
                {owner.phone}
              </a>
            </Card>

            {record && (
              <Card id="meds-h" title="Current medications" icon={<Pill aria-hidden className="size-5" />}>
                <ul className="grid gap-2">
                  {record.medications.map((m) => (
                    <li key={m.name} className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3">
                      <p className="font-bold">{m.name}</p>
                      <p className="text-sm text-slate-700">{m.dose}</p>
                      <p className="text-xs text-slate-600">Since {fmtDate(m.since)}</p>
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            <Card id="today-h" title="Today" icon={<ClipboardList aria-hidden className="size-5" />}>
              {todays.length === 0 ? (
                <p className="text-slate-700">No appointments today.</p>
              ) : (
                <ul className="grid gap-2">
                  {todays.map((a) => (
                    <li key={a.id} className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-bold tabular-nums">{fmtTime(a.start)}</p>
                        <p className="text-sm text-slate-700">
                          {a.reason} &middot; {getVet(a.vet).name}
                        </p>
                      </div>
                      <StatusBadge status={a.status} />
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
        </div>
      </main>
    </>
  );
}
