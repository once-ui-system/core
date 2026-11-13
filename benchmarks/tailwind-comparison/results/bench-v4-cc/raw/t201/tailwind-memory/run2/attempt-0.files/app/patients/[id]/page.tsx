import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, ClipboardList, Phone, Pill, Scale, Syringe, TriangleAlert, CircleCheck, TrendingDown } from "lucide-react";
import {
  TODAY,
  ageLabel,
  daysBetween,
  fmtDate,
  fmtLongDate,
  fmtMoney,
  getOwner,
  getPatient,
  getRecord,
  getVet,
  patients,
  telHref,
} from "@/lib/data";
import { cx } from "@/lib/cx";
import { AlertBanner } from "@/components/AlertBadges";
import { TodayVisits } from "@/components/TodayVisits";
import { WeightChart } from "@/components/WeightChart";

export function generateStaticParams() {
  return patients.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const p = getPatient(id);
  return { title: p ? `${p.name} | Pawpoint` : "Patient | Pawpoint" };
}

export default async function PatientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const patient = getPatient(id);
  if (!patient) notFound();
  const owner = getOwner(patient.owner);
  const record = getRecord(patient.id);

  const vaccinations = record
    ? record.vaccinations
        .map((v) => ({ ...v, left: daysBetween(TODAY, v.due) }))
        .sort((a, b) => a.left - b.left)
    : [];
  const overdue = vaccinations.filter((v) => v.left < 0);

  const weights = record?.weights_kg ?? [];
  const firstW = weights[0];
  const lastW = weights[weights.length - 1];
  const delta = firstW && lastW ? lastW.kg - firstW.kg : 0;
  const pct = firstW ? (delta / firstW.kg) * 100 : 0;

  return (
    <main id="main" className="mx-auto max-w-7xl px-4 pb-16 pt-5 sm:px-6">
      <Link href="/" className="inline-flex min-h-11 items-center gap-1.5 rounded-lg pr-3 text-sm font-semibold text-teal-800 hover:underline">
        <ArrowLeft className="size-4" aria-hidden />
        Today&rsquo;s schedule
      </Link>

      <header className="mt-1 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-x-8 gap-y-4">
          <div className="flex items-center gap-4">
            <span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-teal-100 text-3xl font-bold text-teal-900" aria-hidden>
              {patient.name[0]}
            </span>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{patient.name}</h1>
              <p className="text-base text-stone-700">
                {patient.breed} &middot; {patient.species}
              </p>
              <p className="text-sm text-stone-600">Patient {patient.id}</p>
            </div>
          </div>
          <dl className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm sm:grid-cols-3">
            <Fact label="Age" value={ageLabel(patient.born)} />
            <Fact label="Born" value={fmtDate(patient.born)} />
            <Fact label="Sex" value={patient.sex} />
            <Fact label="Owner" value={owner.name} />
            <div>
              <dt className="text-stone-600">Phone</dt>
              <dd className="font-semibold">
                <a href={telHref(owner.phone)} className="inline-flex min-h-8 items-center gap-1.5 underline underline-offset-2">
                  <Phone className="size-4" aria-hidden />
                  {owner.phone}
                </a>
              </dd>
            </div>
            {lastW && <Fact label="Last weight" value={`${lastW.kg} kg`} />}
          </dl>
        </div>
      </header>

      <div className="mt-4">
        {patient.alerts.length > 0 ? (
          <AlertBanner alerts={patient.alerts} name={patient.name} />
        ) : (
          <p className="rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-700">No medical alerts on file for {patient.name}.</p>
        )}
      </div>

      {!record && (
        <p className="mt-6 rounded-2xl border border-dashed border-stone-300 bg-white p-8 text-center text-stone-700">
          No weights, vaccinations or visit notes are on file yet for {patient.name} in this demo.
        </p>
      )}

      {record && (
        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-start">
          <div className="min-w-0 space-y-6 lg:order-last">
            <TodayVisits patientId={patient.id} />

            <section aria-labelledby="vax-h" className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 id="vax-h" className="flex items-center gap-2 text-lg font-bold">
                  <Syringe className="size-5 text-teal-700" aria-hidden />
                  Vaccinations
                </h2>
                {overdue.length > 0 && (
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-red-700 px-2 py-1 text-sm font-bold text-white">
                    <TriangleAlert className="size-4" aria-hidden />
                    {overdue.length} overdue
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-sm text-stone-600">Checked against today, {fmtLongDate(TODAY)}.</p>
              <ul className="mt-3 space-y-2">
                {vaccinations.map((v) => {
                  const isOverdue = v.left < 0;
                  const soon = !isOverdue && v.left <= 30;
                  return (
                    <li
                      key={v.name}
                      className={cx(
                        "rounded-xl border p-3",
                        isOverdue ? "border-red-300 border-l-[6px] border-l-red-700 bg-red-50" : soon ? "border-orange-300 bg-orange-50" : "border-stone-200",
                      )}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-semibold">{v.name}</p>
                        {isOverdue ? (
                          <span className="inline-flex items-center gap-1 rounded-md bg-red-700 px-2 py-0.5 text-xs font-bold text-white">
                            <TriangleAlert className="size-3.5" aria-hidden />
                            Overdue by {-v.left} days
                          </span>
                        ) : soon ? (
                          <span className="rounded-md bg-orange-500 px-2 py-0.5 text-xs font-bold text-stone-950">Due in {v.left} days</span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800">
                            <CircleCheck className="size-3.5" aria-hidden />
                            Up to date
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-sm text-stone-700">
                        Given {fmtDate(v.given)} &middot; <span className={cx(isOverdue && "font-bold text-red-800")}>due {fmtDate(v.due)}</span>
                      </p>
                    </li>
                  );
                })}
              </ul>
            </section>

            <section aria-labelledby="med-h" className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-5">
              <h2 id="med-h" className="flex items-center gap-2 text-lg font-bold">
                <Pill className="size-5 text-teal-700" aria-hidden />
                Current medications
              </h2>
              <ul className="mt-3 divide-y divide-stone-200">
                {record.medications.map((m) => (
                  <li key={m.name} className="py-2.5 first:pt-0 last:pb-0">
                    <p className="font-semibold">{m.name}</p>
                    <p className="text-sm text-stone-700">
                      {m.dose} &middot; since {fmtDate(m.since)}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <div className="min-w-0 space-y-6">
            <section aria-labelledby="wt-h" className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 id="wt-h" className="flex items-center gap-2 text-lg font-bold">
                    <Scale className="size-5 text-teal-700" aria-hidden />
                    Weight trend
                  </h2>
                  <p className="text-sm text-stone-600">
                    {weights.length} visits, {fmtDate(firstW.date)} to {fmtDate(lastW.date)}
                  </p>
                </div>
                <p className="inline-flex items-center gap-1.5 rounded-lg bg-orange-100 px-2.5 py-1.5 text-sm font-bold text-orange-950">
                  <TrendingDown className="size-4" aria-hidden />
                  {delta.toFixed(1)} kg ({pct.toFixed(0)}%) since {fmtDate(firstW.date)}
                </p>
              </div>
              <div className="mt-3">
                <WeightChart points={weights} />
              </div>
              <details className="mt-2 text-sm">
                <summary className="inline-flex min-h-11 items-center font-semibold text-teal-800 underline underline-offset-2">Show weights as a table</summary>
                <table className="mt-1 w-full text-left">
                  <caption className="sr-only">Olive&rsquo;s weight at each visit</caption>
                  <thead className="text-stone-600">
                    <tr>
                      <th scope="col" className="py-1 font-medium">Date</th>
                      <th scope="col" className="py-1 text-right font-medium">Weight</th>
                      <th scope="col" className="py-1 text-right font-medium">Change</th>
                    </tr>
                  </thead>
                  <tbody>
                    {weights.map((w, i) => (
                      <tr key={w.date} className="border-t border-stone-200">
                        <th scope="row" className="py-1.5 font-normal">{fmtDate(w.date)}</th>
                        <td className="py-1.5 text-right font-semibold tabular-nums">{w.kg} kg</td>
                        <td className="py-1.5 text-right tabular-nums text-stone-700">{i === 0 ? "-" : `${(w.kg - weights[i - 1].kg).toFixed(1)} kg`}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </details>
            </section>

            <section aria-labelledby="vis-h" className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-5">
              <h2 id="vis-h" className="flex items-center gap-2 text-lg font-bold">
                <ClipboardList className="size-5 text-teal-700" aria-hidden />
                Visit history
              </h2>
              <ol className="mt-4 space-y-5 border-l-2 border-stone-200 pl-4 sm:pl-5">
                {record.visits.map((v) => (
                  <li key={v.date} className="relative">
                    <span className="absolute -left-[1.4rem] top-1.5 size-3 rounded-full border-2 border-white bg-teal-700 ring-2 ring-teal-700 sm:-left-[1.65rem]" aria-hidden />
                    <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                      <p className="font-semibold">
                        <time dateTime={v.date}>{fmtDate(v.date)}</time> &middot; {v.reason}
                      </p>
                      <p className="text-sm tabular-nums text-stone-600">Invoice {fmtMoney(v.invoice_usd)}</p>
                    </div>
                    <p className="text-sm text-stone-600">{getVet(v.vet).name}</p>
                    <p className="mt-1.5 text-base leading-relaxed text-stone-800">{v.notes}</p>
                  </li>
                ))}
              </ol>
            </section>
          </div>
        </div>
      )}
    </main>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-stone-600">{label}</dt>
      <dd className="font-semibold">{value}</dd>
    </div>
  );
}
