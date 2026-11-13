import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CircleAlert, CircleCheck, Pill, Phone, Syringe, TriangleAlert } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { WeightChart } from "@/components/WeightChart";
import {
  PATIENTS,
  RECORDS,
  TODAY,
  ageOn,
  daysBetween,
  fmtDate,
  fmtMoney,
  getOwner,
  getPatient,
  getVet,
} from "@/lib/data";

export function generateStaticParams() {
  return PATIENTS.map((p) => ({ id: p.id }));
}

export default async function PatientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const patient = getPatient(id);
  if (!patient) notFound();
  const owner = getOwner(patient.owner);
  const record = RECORDS[patient.id];

  const vaccinations = record
    ? [...record.vaccinations].sort((a, b) => a.due.localeCompare(b.due))
    : [];
  const overdueCount = vaccinations.filter((v) => daysBetween(TODAY, v.due) < 0).length;

  const card = "rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200";

  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2">
        Skip to content
      </a>
      <AppHeader />
      <main id="main" className="mx-auto max-w-7xl px-4 pb-16 pt-5 sm:px-6">
        <Link href="/" className="inline-flex h-11 items-center gap-2 rounded-lg pr-3 text-sm font-semibold text-brand-700 hover:underline">
          <ArrowLeft aria-hidden className="size-4" />
          Today&rsquo;s schedule
        </Link>

        <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">{patient.name}</h1>
            <p className="mt-1 text-base text-slate-700">
              {patient.breed} &middot; {patient.species} &middot; {patient.sex} &middot; {ageOn(patient.born, TODAY)}
            </p>
          </div>
          <p className="rounded-lg bg-white px-3 py-1.5 text-sm font-medium text-slate-700 ring-1 ring-slate-200">
            Patient ID <span className="font-semibold tabular-nums">{patient.id}</span>
          </p>
        </div>

        {patient.alerts.length > 0 && (
          <section aria-labelledby="alerts-h" className="mt-5 rounded-2xl border-2 border-red-700 bg-red-50 p-4 sm:p-5">
            <h2 id="alerts-h" className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-red-800">
              <TriangleAlert aria-hidden className="size-5" />
              Medical alerts ({patient.alerts.length})
            </h2>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {patient.alerts.map((a) => (
                <li key={a} className="flex items-center gap-3 rounded-xl bg-red-700 px-4 py-3 text-lg font-bold text-white">
                  <TriangleAlert aria-hidden className="size-6 shrink-0" />
                  {a}
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="mt-5 grid gap-5 lg:grid-cols-3">
          <section aria-labelledby="details-h" className={card}>
            <h2 id="details-h" className="text-lg font-bold text-slate-900">
              Patient and owner
            </h2>
            <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-5 gap-y-2 text-base">
              <dt className="text-slate-600">Species</dt>
              <dd className="font-medium text-slate-900">{patient.species}</dd>
              <dt className="text-slate-600">Breed</dt>
              <dd className="font-medium text-slate-900">{patient.breed}</dd>
              <dt className="text-slate-600">Sex</dt>
              <dd className="font-medium text-slate-900">{patient.sex}</dd>
              <dt className="text-slate-600">Born</dt>
              <dd className="font-medium text-slate-900">
                {fmtDate(patient.born)} ({ageOn(patient.born, TODAY)})
              </dd>
              <dt className="border-t border-slate-200 pt-2 text-slate-600">Owner</dt>
              <dd className="border-t border-slate-200 pt-2 font-medium text-slate-900">{owner?.name}</dd>
              <dt className="text-slate-600">Phone</dt>
              <dd>
                <a href={`tel:${owner?.phone.replace(/\s/g, "")}`} className="inline-flex min-h-11 items-center gap-2 font-semibold text-brand-700 hover:underline">
                  <Phone aria-hidden className="size-4" />
                  {owner?.phone}
                </a>
              </dd>
            </dl>
          </section>

          <section aria-labelledby="weight-h" className={`${card} lg:col-span-2`}>
            <h2 id="weight-h" className="mb-2 text-lg font-bold text-slate-900">
              Weight trend
            </h2>
            {record ? (
              <WeightChart points={record.weights_kg} />
            ) : (
              <p className="text-slate-600">No weights recorded yet.</p>
            )}
          </section>

          <section aria-labelledby="vax-h" className={`${card} lg:col-span-2`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 id="vax-h" className="flex items-center gap-2 text-lg font-bold text-slate-900">
                <Syringe aria-hidden className="size-5 text-slate-600" />
                Vaccinations
              </h2>
              {overdueCount > 0 && (
                <p className="rounded-md bg-red-700 px-2.5 py-1 text-sm font-bold text-white">{overdueCount} overdue</p>
              )}
            </div>
            {vaccinations.length === 0 ? (
              <p className="mt-3 text-slate-600">No vaccinations on file.</p>
            ) : (
              <ul className="mt-3 divide-y divide-slate-200">
                {vaccinations.map((v) => {
                  const left = daysBetween(TODAY, v.due);
                  const overdue = left < 0;
                  const soon = !overdue && left <= 60;
                  return (
                    <li key={v.name} className={`flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-3 ${overdue ? "-mx-2 rounded-lg bg-red-50 px-2" : ""}`}>
                      <div>
                        <p className="text-base font-semibold text-slate-900">{v.name}</p>
                        <p className="text-sm text-slate-600">Given {fmtDate(v.given)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-slate-700">Due {fmtDate(v.due)}</p>
                        {overdue ? (
                          <p className="inline-flex items-center gap-1 text-sm font-bold text-red-800">
                            <CircleAlert aria-hidden className="size-4" />
                            Overdue by {Math.abs(left)} days
                          </p>
                        ) : soon ? (
                          <p className="text-sm font-bold text-amber-800">Due in {left} days</p>
                        ) : (
                          <p className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-800">
                            <CircleCheck aria-hidden className="size-4" />
                            Up to date
                          </p>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section aria-labelledby="meds-h" className={card}>
            <h2 id="meds-h" className="flex items-center gap-2 text-lg font-bold text-slate-900">
              <Pill aria-hidden className="size-5 text-slate-600" />
              Current medications
            </h2>
            {!record || record.medications.length === 0 ? (
              <p className="mt-3 text-slate-600">No current medications.</p>
            ) : (
              <ul className="mt-3 space-y-3">
                {record.medications.map((m) => (
                  <li key={m.name} className="rounded-xl bg-slate-50 p-3">
                    <p className="font-semibold text-slate-900">{m.name}</p>
                    <p className="text-sm text-slate-700">{m.dose}</p>
                    <p className="text-xs text-slate-600">Since {fmtDate(m.since)}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section aria-labelledby="visits-h" className={`${card} lg:col-span-3`}>
            <h2 id="visits-h" className="text-lg font-bold text-slate-900">
              Visit history
            </h2>
            {!record || record.visits.length === 0 ? (
              <p className="mt-3 text-slate-600">No visits on file.</p>
            ) : (
              <ol className="mt-4 space-y-5 border-l-2 border-slate-200 pl-5">
                {record.visits.map((v) => (
                  <li key={v.date} className="relative">
                    <span aria-hidden className="absolute -left-[1.72rem] top-1.5 size-3 rounded-full bg-brand-600 ring-4 ring-white" />
                    <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                      <p className="text-base font-bold text-slate-900">
                        {fmtDate(v.date)} <span className="font-semibold text-slate-700">&middot; {v.reason}</span>
                      </p>
                      <p className="text-sm text-slate-600">
                        {getVet(v.vet)?.name} &middot; {fmtMoney(v.invoice_usd)}
                      </p>
                    </div>
                    <p className="mt-1 max-w-3xl text-base leading-relaxed text-slate-800">{v.notes}</p>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>
      </main>
    </>
  );
}
