import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CircleCheck,
  Phone,
  Pill,
  Stethoscope,
  Syringe,
  TrendingDown,
  TriangleAlert,
} from "lucide-react";
import AppHeader from "@/components/AppHeader";
import { TODAY, getOwner, getVet, patients, records } from "@/lib/data";
import {
  ageText,
  daysBetween,
  formatDate,
  formatMoney,
  formatMonthYear,
  utcMs,
} from "@/lib/format";

export const dynamicParams = false;

export function generateStaticParams() {
  return patients.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const p = patients.find((x) => x.id === id);
  return { title: p ? `${p.name} · Pawpoint` : "Patient · Pawpoint" };
}

const card = "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm";

export default async function PatientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const patient = patients.find((p) => p.id === id);
  if (!patient) notFound();

  const owner = getOwner(patient.owner);
  const record = records[patient.id];

  const weights = record ? [...record.weights_kg].sort((a, b) => utcMs(a.date) - utcMs(b.date)) : [];
  const firstW = weights[0];
  const lastW = weights[weights.length - 1];
  const delta = firstW && lastW ? lastW.kg - firstW.kg : 0;
  const deltaPct = firstW && lastW ? (delta / firstW.kg) * 100 : 0;

  const vaccinations = record
    ? record.vaccinations
        .map((v) => ({ ...v, days: daysBetween(TODAY, v.due) }))
        .sort((a, b) => a.days - b.days)
    : [];
  const overdueCount = vaccinations.filter((v) => v.days < 0).length;

  return (
    <>
      <AppHeader />
      <main id="main" className="mx-auto w-full max-w-[1400px] px-4 py-5 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="inline-flex min-h-11 items-center gap-2 rounded-lg pr-3 text-sm font-semibold text-teal-800 hover:underline"
        >
          <ArrowLeft aria-hidden className="size-4" />
          Today&rsquo;s schedule
        </Link>

        <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">{patient.name}</h1>
            <p className="text-slate-600">
              {patient.breed} &middot; {patient.species} &middot; {patient.sex} &middot; {ageText(patient.born, TODAY)}
            </p>
          </div>
          <p className="rounded-md bg-slate-200 px-2.5 py-1 text-sm font-semibold tabular-nums text-slate-800">
            Patient {patient.id}
          </p>
        </div>

        {patient.alerts.length > 0 && (
          <section
            aria-label="Medical alerts"
            className="mt-4 rounded-2xl border-2 border-red-800 bg-red-700 p-4 text-white shadow-md sm:p-5"
          >
            <h2 className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-widest">
              <TriangleAlert aria-hidden className="size-5" />
              Medical alerts
            </h2>
            <ul className="mt-2 space-y-1.5">
              {patient.alerts.map((alert) => (
                <li key={alert} className="text-xl font-bold leading-snug sm:text-2xl">
                  {alert}
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          <div className="space-y-6 lg:col-start-2 lg:row-start-1">
            <section className={card} aria-labelledby="details-h">
              <h2 id="details-h" className="text-lg font-bold text-slate-900">
                Patient and owner
              </h2>
              <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                <Item label="Species" value={patient.species} />
                <Item label="Breed" value={patient.breed} />
                <Item label="Born" value={`${formatDate(patient.born)}`} />
                <Item label="Age" value={ageText(patient.born, TODAY)} />
                <Item label="Sex" value={patient.sex} />
                {lastW && <Item label="Latest weight" value={`${lastW.kg.toFixed(1)} kg`} />}
              </dl>
              <div className="mt-4 rounded-xl bg-slate-50 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">Owner</p>
                <p className="text-base font-bold text-slate-900">{owner.name}</p>
                <a
                  href={`tel:${owner.phone.replace(/\s/g, "")}`}
                  className="mt-1 inline-flex min-h-11 items-center gap-2 font-semibold text-teal-800 hover:underline"
                >
                  <Phone aria-hidden className="size-4" />
                  {owner.phone}
                </a>
              </div>
            </section>

            <section className={card} aria-labelledby="vax-h">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 id="vax-h" className="flex items-center gap-2 text-lg font-bold text-slate-900">
                  <Syringe aria-hidden className="size-5 text-teal-700" />
                  Vaccinations
                </h2>
                {record &&
                  (overdueCount > 0 ? (
                    <span className="rounded-full bg-red-700 px-2.5 py-1 text-xs font-bold text-white">
                      {overdueCount} overdue
                    </span>
                  ) : (
                    <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-900">
                      All current
                    </span>
                  ))}
              </div>
              {record ? (
                <>
                  <p className="mt-1 text-sm text-slate-600">Checked against today, {formatDate(TODAY)}.</p>
                  <ul className="mt-3 space-y-2">
                    {vaccinations.map((v) => {
                      const overdue = v.days < 0;
                      const soon = v.days >= 0 && v.days <= 30;
                      return (
                        <li
                          key={v.name}
                          className={`flex flex-wrap items-center justify-between gap-x-3 gap-y-1 rounded-xl border-l-4 p-3 ${
                            overdue
                              ? "border-l-red-700 bg-red-50"
                              : soon
                                ? "border-l-amber-500 bg-amber-50"
                                : "border-l-emerald-600 bg-slate-50"
                          }`}
                        >
                          <div>
                            <p className="font-bold text-slate-900">{v.name}</p>
                            <p className="text-sm text-slate-700">
                              Given {formatDate(v.given)} &middot; due {formatDate(v.due)}
                            </p>
                          </div>
                          {overdue ? (
                            <span className="inline-flex items-center gap-1 rounded-md bg-red-700 px-2 py-1 text-xs font-bold text-white">
                              <TriangleAlert aria-hidden className="size-3.5" />
                              Overdue {Math.abs(v.days)} days
                            </span>
                          ) : soon ? (
                            <span className="rounded-md bg-amber-200 px-2 py-1 text-xs font-bold text-amber-950">
                              Due in {v.days} days
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800">
                              <CircleCheck aria-hidden className="size-4" />
                              Current
                            </span>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </>
              ) : (
                <p className="mt-2 text-sm text-slate-600">No vaccinations on file.</p>
              )}
            </section>

            <section className={card} aria-labelledby="meds-h">
              <h2 id="meds-h" className="flex items-center gap-2 text-lg font-bold text-slate-900">
                <Pill aria-hidden className="size-5 text-teal-700" />
                Current medications
              </h2>
              {record && record.medications.length > 0 ? (
                <ul className="mt-3 divide-y divide-slate-200">
                  {record.medications.map((m) => (
                    <li key={m.name} className="py-2.5 first:pt-0 last:pb-0">
                      <p className="font-bold text-slate-900">{m.name}</p>
                      <p className="text-sm text-slate-700">
                        {m.dose} &middot; since {formatDate(m.since)}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm text-slate-600">No current medications on file.</p>
              )}
            </section>
          </div>

          <div className="space-y-6 lg:col-start-1 lg:row-start-1">
            <section className={card} aria-labelledby="weight-h">
              <h2 id="weight-h" className="text-lg font-bold text-slate-900">
                Weight trend
              </h2>
              {firstW && lastW && weights.length > 1 ? (
                <>
                  <div className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <p className="text-3xl font-bold tabular-nums text-slate-900">{lastW.kg.toFixed(1)} kg</p>
                    <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-900">
                      <TrendingDown aria-hidden className="size-4" />
                      {delta.toFixed(1)} kg ({deltaPct.toFixed(1)}%) since {formatDate(firstW.date)}
                    </p>
                  </div>
                  <WeightChart points={weights} />
                  <table className="mt-3 w-full text-sm">
                    <caption className="sr-only">Weights by visit date</caption>
                    <thead>
                      <tr className="text-left text-xs uppercase tracking-wide text-slate-600">
                        <th scope="col" className="py-1.5 font-semibold">
                          Date
                        </th>
                        <th scope="col" className="py-1.5 text-right font-semibold">
                          Weight
                        </th>
                        <th scope="col" className="py-1.5 text-right font-semibold">
                          Change
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 tabular-nums">
                      {weights.map((w, i) => {
                        const prev = i > 0 ? weights[i - 1] : undefined;
                        const d = prev ? w.kg - prev.kg : null;
                        return (
                          <tr key={w.date}>
                            <td className="py-1.5 text-slate-800">{formatDate(w.date)}</td>
                            <td className="py-1.5 text-right font-semibold text-slate-900">{w.kg.toFixed(1)} kg</td>
                            <td className="py-1.5 text-right text-slate-700">
                              {d === null ? "—" : `${d > 0 ? "+" : "−"}${Math.abs(d).toFixed(1)} kg`}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </>
              ) : (
                <p className="mt-2 text-sm text-slate-600">No weights recorded yet.</p>
              )}
            </section>

            <section className={card} aria-labelledby="visits-h">
              <h2 id="visits-h" className="flex items-center gap-2 text-lg font-bold text-slate-900">
                <Stethoscope aria-hidden className="size-5 text-teal-700" />
                Visit history
              </h2>
              {record && record.visits.length > 0 ? (
                <ol className="mt-4 space-y-5 border-l-2 border-slate-200 pl-5">
                  {record.visits.map((v) => {
                    const vet = getVet(v.vet);
                    return (
                      <li key={v.date} className="relative">
                        <span aria-hidden className="absolute -left-[1.6rem] top-1.5 size-3 rounded-full bg-teal-700 ring-4 ring-white" />
                        <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                          <p className="font-bold text-slate-900">
                            {formatDate(v.date)} &middot; {v.reason}
                          </p>
                          <p className="text-sm tabular-nums text-slate-600">{formatMoney(v.invoice_usd)}</p>
                        </div>
                        <p className="text-sm text-slate-600">
                          {vet.name}, {vet.room}
                        </p>
                        <p className="mt-1 text-slate-800">{v.notes}</p>
                      </li>
                    );
                  })}
                </ol>
              ) : (
                <p className="mt-2 text-sm text-slate-600">No visits on file yet.</p>
              )}
            </section>
          </div>
        </div>
      </main>
    </>
  );
}

function Item({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-600">{label}</dt>
      <dd className="mt-0.5 font-medium text-slate-900">{value}</dd>
    </div>
  );
}

function WeightChart({ points }: { points: { date: string; kg: number }[] }) {
  const W = 420;
  const H = 230;
  const padL = 36;
  const padR = 18;
  const padT = 30;
  const padB = 34;
  const kgs = points.map((p) => p.kg);
  const lo = Math.floor(Math.min(...kgs) - 0.4);
  const hi = Math.ceil(Math.max(...kgs) + 0.4);
  const t0 = utcMs(points[0].date);
  const t1 = utcMs(points[points.length - 1].date);
  const x = (date: string) => padL + ((utcMs(date) - t0) / (t1 - t0)) * (W - padL - padR);
  const y = (kg: number) => padT + (1 - (kg - lo) / (hi - lo)) * (H - padT - padB);
  const ticks: number[] = [];
  for (let t = lo; t <= hi; t += 1) ticks.push(t);
  const path = points.map((p, i) => `${i === 0 ? "M" : "L"}${x(p.date).toFixed(1)},${y(p.kg).toFixed(1)}`).join(" ");
  const first = points[0];
  const last = points[points.length - 1];

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label={`Weight in kilograms over ${points.length} visits, from ${first.kg} in ${formatMonthYear(first.date)} down to ${last.kg} in ${formatMonthYear(last.date)}`}
      className="mt-3 h-auto w-full"
    >
      {ticks.map((t) => (
        <g key={t}>
          <line x1={padL} x2={W - padR} y1={y(t)} y2={y(t)} className="stroke-slate-200" strokeWidth={1} />
          <text x={padL - 6} y={y(t) + 3.5} textAnchor="end" fontSize={10} className="fill-slate-600">
            {t}
          </text>
        </g>
      ))}
      <path d={path} fill="none" className="stroke-teal-700" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
      {points.map((p, i) => {
        const isLast = i === points.length - 1;
        return (
          <g key={p.date}>
            <circle cx={x(p.date)} cy={y(p.kg)} r={isLast ? 5.5 : 4} className={isLast ? "fill-amber-500 stroke-white" : "fill-teal-700 stroke-white"} strokeWidth={2} />
            <text
              x={x(p.date)}
              y={y(p.kg) - 10}
              textAnchor={i === 0 ? "start" : isLast ? "end" : "middle"}
              fontSize={11}
              fontWeight={isLast ? 700 : 600}
              className="fill-slate-800"
            >
              {p.kg.toFixed(1)}
            </text>
            <text
              x={x(p.date)}
              y={H - 12}
              textAnchor={i === 0 ? "start" : isLast ? "end" : "middle"}
              fontSize={10}
              className="fill-slate-600"
            >
              {formatMonthYear(p.date)}
            </text>
          </g>
        );
      })}
      <text x={padL} y={12} fontSize={10} className="fill-slate-600">
        kg
      </text>
    </svg>
  );
}
