import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, CircleCheck, Phone, Pill, Scale, Stethoscope, Syringe, TriangleAlert } from "lucide-react";
import { AlertChips } from "@/components/AlertChips";
import { BookAppointment } from "@/components/BookAppointment";
import { PatientToday } from "@/components/PatientToday";
import { WeightChart } from "@/components/WeightChart";
import { PATIENTS, RECORDS, TODAY, ageText, daysBetween, fmtDate, getOwner, getPatient, getVet } from "@/lib/data";

export function generateStaticParams() {
  return PATIENTS.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const p = getPatient(id);
  return { title: p ? `${p.name} · Pawpoint` : "Patient · Pawpoint" };
}

function Card({ title, icon, children, id }: { title: string; icon: React.ReactNode; children: React.ReactNode; id: string }) {
  return (
    <section aria-labelledby={id} className="rounded-2xl border border-slate-200 bg-white">
      <h2 id={id} className="flex items-center gap-2 border-b border-slate-100 px-5 py-3.5 text-lg font-bold">
        <span aria-hidden className="text-teal-700">
          {icon}
        </span>
        {title}
      </h2>
      <div className="px-5 py-4">{children}</div>
    </section>
  );
}

const usd = (n: number) => `$${n.toFixed(2)}`;

export default async function PatientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const patient = getPatient(id);
  if (!patient) notFound();
  const owner = getOwner(patient.owner);
  const record = RECORDS[patient.id];

  const vaccines = record?.vaccinations.map((v) => ({ ...v, overdueDays: daysBetween(v.due, TODAY) })) ?? [];
  const overdue = vaccines.filter((v) => v.overdueDays > 0);

  return (
    <div className="space-y-5">
      <Link href="/" className="inline-flex h-11 items-center gap-2 rounded-lg pr-3 text-sm font-semibold text-teal-800 hover:underline">
        <ArrowLeft aria-hidden className="size-4" />
        Today&apos;s schedule
      </Link>

      <header className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-4">
            <span aria-hidden className="grid size-16 shrink-0 place-items-center rounded-2xl bg-teal-700 text-3xl font-bold text-white">
              {patient.name[0]}
            </span>
            <div className="min-w-0">
              <h1 className="text-3xl font-bold tracking-tight">{patient.name}</h1>
              <p className="text-base text-slate-700">
                {patient.species} · {patient.breed}
              </p>
            </div>
          </div>
          <BookAppointment patientId={patient.id} label="Book follow-up" />
        </div>

        <dl className="mt-5 grid gap-x-8 gap-y-4 border-t border-slate-100 pt-5 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-600">Age</dt>
            <dd className="text-base font-medium">
              {ageText(patient.born)} <span className="text-slate-600">(born {fmtDate(patient.born)})</span>
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-600">Sex</dt>
            <dd className="text-base font-medium">{patient.sex}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-600">Owner</dt>
            <dd className="text-base font-medium">{owner.name}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-600">Owner phone</dt>
            <dd>
              <a href={`tel:${owner.phone.replace(/\s/g, "")}`} className="inline-flex min-h-11 items-center gap-2 text-base font-medium text-teal-800 hover:underline">
                <Phone aria-hidden className="size-4" />
                {owner.phone}
              </a>
            </dd>
          </div>
        </dl>
      </header>

      {patient.alerts.length > 0 && (
        <section aria-labelledby="alerts-h" className="rounded-2xl border-2 border-red-700 bg-red-50 p-5">
          <h2 id="alerts-h" className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-red-800">
            <TriangleAlert aria-hidden className="size-5" strokeWidth={2.5} />
            Medical alerts · read before handling
          </h2>
          <AlertChips alerts={patient.alerts} size="md" className="mt-3 [&_li]:text-base sm:[&_li]:text-lg [&_li]:px-4 [&_li]:py-2" />
        </section>
      )}

      {overdue.length > 0 && (
        <p role="note" className="flex items-start gap-2 rounded-xl bg-amber-100 px-4 py-3 text-sm font-semibold text-amber-950 ring-1 ring-amber-400">
          <Syringe aria-hidden className="mt-0.5 size-4 shrink-0" />
          {overdue.length} vaccination{overdue.length === 1 ? "" : "s"} overdue: {overdue.map((v) => v.name).join(", ")}. Offer to book today.
        </p>
      )}

      <Card id="today-h" title="Today" icon={<Stethoscope className="size-5" />}>
        <PatientToday patientId={patient.id} />
      </Card>

      {!record ? (
        <p className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-8 text-center text-slate-600">
          No weights, vaccinations, medications or visit notes are on file for {patient.name} yet.
        </p>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
          <div className="space-y-5">
            <Card id="weight-h" title="Weight trend" icon={<Scale className="size-5" />}>
              <WeightChart points={record.weights_kg} name={patient.name} />
            </Card>

            <Card id="visits-h" title="Visit history" icon={<Stethoscope className="size-5" />}>
              <ol className="space-y-5">
                {record.visits.map((v, i) => (
                  <li key={v.date} className="relative border-l-2 border-slate-200 pl-5">
                    <span aria-hidden className={`absolute -left-[7px] top-1.5 size-3 rounded-full border-2 border-white ${i === 0 ? "bg-teal-700" : "bg-slate-400"}`} />
                    <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                      <p className="text-base font-bold">
                        {v.reason}
                        {v.date === TODAY && <span className="ml-2 rounded bg-teal-100 px-1.5 py-0.5 align-middle text-xs font-bold text-teal-900">Today</span>}
                      </p>
                      <p className="text-sm tabular-nums text-slate-600">{fmtDate(v.date)}</p>
                    </div>
                    <p className="text-sm text-slate-600">
                      {getVet(v.vet).name} · invoice {usd(v.invoice_usd)}
                    </p>
                    <p className="mt-1.5 text-base leading-relaxed text-slate-800">{v.notes}</p>
                  </li>
                ))}
              </ol>
            </Card>
          </div>

          <div className="space-y-5">
            <Card id="vacc-h" title="Vaccinations" icon={<Syringe className="size-5" />}>
              <ul className="space-y-2.5">
                {vaccines.map((v) => {
                  const late = v.overdueDays > 0;
                  return (
                    <li
                      key={v.name}
                      className={`rounded-lg border px-3.5 py-3 ${late ? "border-red-600 bg-red-50" : "border-slate-200 bg-white"}`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-base font-bold">{v.name}</p>
                        {late ? (
                          <span className="inline-flex items-center gap-1.5 rounded-md bg-red-700 px-2 py-0.5 text-xs font-bold text-white">
                            <TriangleAlert aria-hidden className="size-3.5" />
                            Overdue {v.overdueDays} days
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-900">
                            <CircleCheck aria-hidden className="size-3.5" />
                            Up to date
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-sm text-slate-700">
                        Given {fmtDate(v.given)} · <span className={late ? "font-semibold text-red-800" : ""}>due {fmtDate(v.due)}</span>
                      </p>
                    </li>
                  );
                })}
              </ul>
            </Card>

            <Card id="meds-h" title="Current medications" icon={<Pill className="size-5" />}>
              <ul className="divide-y divide-slate-100">
                {record.medications.map((m) => (
                  <li key={m.name} className="py-2.5 first:pt-0 last:pb-0">
                    <p className="text-base font-bold">{m.name}</p>
                    <p className="text-sm text-slate-700">
                      {m.dose} · since {fmtDate(m.since)}
                    </p>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
