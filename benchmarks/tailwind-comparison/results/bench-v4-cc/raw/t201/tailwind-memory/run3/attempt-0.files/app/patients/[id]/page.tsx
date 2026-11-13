import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CalendarClock,
  ClipboardList,
  CircleCheck,
  Phone,
  Pill,
  Scale,
  Syringe,
  TriangleAlert,
} from "lucide-react";
import { AlertBanner } from "@/components/AlertList";
import { StatusBadge } from "@/components/StatusBadge";
import { WeightChart } from "@/components/WeightChart";
import {
  TODAY,
  ageLabel,
  dayDiff,
  endTime,
  fmtDate,
  fmtTime,
  getOwner,
  getPatient,
  getVet,
  initialAppointments,
  patients,
  records,
  toMinutes,
} from "@/lib/data";

export function generateStaticParams() {
  return patients.map((p) => ({ id: p.id }));
}

const card = "rounded-2xl border border-slate-200 bg-white p-5";

function SectionTitle({ icon, children, id }: { icon: React.ReactNode; children: React.ReactNode; id: string }) {
  return (
    <h2 id={id} className="mb-3 flex items-center gap-2 text-lg font-bold text-slate-900">
      <span aria-hidden="true" className="text-teal-700">
        {icon}
      </span>
      {children}
    </h2>
  );
}

export default async function PatientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const patient = getPatient(id);
  if (!patient) notFound();

  const owner = getOwner(patient.owner);
  const record = records[patient.id];
  const todays = initialAppointments
    .filter((a) => a.patient === patient.id)
    .sort((a, b) => toMinutes(a.start) - toMinutes(b.start));

  const vaccines = record
    ? [...record.vaccinations]
        .map((v) => {
          const days = dayDiff(TODAY, v.due);
          const state = days < 0 ? "overdue" : days <= 60 ? "soon" : "current";
          return { ...v, days, state };
        })
        .sort((a, b) => a.due.localeCompare(b.due))
    : [];
  const overdue = vaccines.filter((v) => v.state === "overdue");

  const weights = record?.weights_kg ?? [];
  const firstW = weights[0];
  const lastW = weights[weights.length - 1];
  const delta = firstW && lastW ? lastW.kg - firstW.kg : 0;
  const pct = firstW && lastW ? (delta / firstW.kg) * 100 : 0;

  const details: [string, string][] = [
    ["Species", patient.species],
    ["Breed", patient.breed],
    ["Born", `${fmtDate(patient.born)} (${ageLabel(patient.born, TODAY)})`],
    ["Sex", patient.sex],
    ["Patient ID", patient.id],
  ];

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:py-8">
      <Link
        href="/"
        className="inline-flex min-h-11 items-center gap-2 rounded-lg text-sm font-semibold text-teal-800 hover:underline"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        Today&rsquo;s schedule
      </Link>

      <section aria-labelledby="patient-name" className={`${card} mt-1`}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-slate-600">
              {patient.species} &middot; {patient.breed}
            </p>
            <h1 id="patient-name" className="text-3xl font-extrabold tracking-tight text-slate-900">
              {patient.name}
            </h1>
          </div>
          {overdue.length > 0 && (
            <p className="inline-flex items-center gap-2 rounded-lg bg-orange-100 px-3 py-2 text-sm font-bold text-orange-900 ring-1 ring-orange-300">
              <Syringe aria-hidden="true" className="size-4" />
              {overdue.length} vaccination{overdue.length > 1 ? "s" : ""} overdue
            </p>
          )}
        </div>

        {patient.alerts.length > 0 && (
          <div className="mt-4">
            <AlertBanner alerts={patient.alerts} name={patient.name} />
          </div>
        )}

        <div className="mt-5 grid gap-6 md:grid-cols-2">
          <dl className="grid grid-cols-[7rem_1fr] gap-x-3 gap-y-2 text-sm">
            {details.map(([k, v]) => (
              <div key={k} className="contents">
                <dt className="text-slate-600">{k}</dt>
                <dd className="font-semibold text-slate-900">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="rounded-xl bg-slate-50 p-4">
            <h2 className="text-xs font-bold uppercase tracking-wide text-slate-600">Owner</h2>
            <p className="mt-1 text-lg font-bold text-slate-900">{owner?.name}</p>
            {owner && (
              <a
                href={`tel:${owner.phone.replace(/\s/g, "")}`}
                className="mt-2 inline-flex h-11 items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 font-semibold text-slate-900 hover:bg-slate-50"
              >
                <Phone aria-hidden="true" className="size-4" />
                {owner.phone}
              </a>
            )}
          </div>
        </div>
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <div className="space-y-6">
          <section aria-labelledby="weight-title" className={card}>
            <SectionTitle id="weight-title" icon={<Scale className="size-5" />}>
              Weight trend
            </SectionTitle>
            {weights.length > 1 && firstW && lastW ? (
              <>
                <p className="mb-2 text-sm text-slate-700">
                  <span className="text-2xl font-extrabold text-slate-900">{lastW.kg} kg</span>{" "}
                  now, <span className="font-bold text-red-700">{delta.toFixed(1)} kg ({pct.toFixed(0)}%)</span> since{" "}
                  {fmtDate(firstW.date, { month: "short", year: "numeric", timeZone: "UTC" })} over {weights.length}{" "}
                  visits.
                </p>
                <WeightChart points={weights} />
              </>
            ) : (
              <p className="text-sm text-slate-600">No weights recorded for {patient.name} yet.</p>
            )}
          </section>

          <section aria-labelledby="visits-title" className={card}>
            <SectionTitle id="visits-title" icon={<ClipboardList className="size-5" />}>
              Visit history
            </SectionTitle>
            {record && record.visits.length > 0 ? (
              <ol className="space-y-4">
                {record.visits.map((v) => (
                  <li key={v.date} className="rounded-xl border border-slate-200 p-4">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                      <p className="font-bold text-slate-900">
                        {fmtDate(v.date)}
                        {v.date === TODAY && (
                          <span className="ml-2 rounded bg-teal-700 px-1.5 py-0.5 text-xs font-bold uppercase text-white">
                            Today
                          </span>
                        )}
                      </p>
                      <p className="text-sm tabular-nums text-slate-600">Invoice ${v.invoice_usd.toFixed(2)}</p>
                    </div>
                    <p className="mt-0.5 text-base font-semibold text-slate-900">{v.reason}</p>
                    <p className="text-sm text-slate-600">{getVet(v.vet)?.name}</p>
                    <p className="mt-2 text-base leading-relaxed text-slate-800">{v.notes}</p>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-sm text-slate-600">
                No past visits are on file for {patient.name} in this demo. Only Olive&rsquo;s full record is loaded.
              </p>
            )}
          </section>
        </div>

        <div className="space-y-6">
          <section aria-labelledby="today-title" className={card}>
            <SectionTitle id="today-title" icon={<CalendarClock className="size-5" />}>
              Today at the clinic
            </SectionTitle>
            {todays.length === 0 ? (
              <p className="text-sm text-slate-600">No appointments today.</p>
            ) : (
              <ul className="space-y-2">
                {todays.map((a) => (
                  <li key={a.id} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 p-3">
                    <div>
                      <p className="font-semibold text-slate-900">
                        {fmtTime(a.start)} to {fmtTime(endTime(a.start, a.minutes))}
                      </p>
                      <p className="text-sm text-slate-600">
                        {a.reason} with {getVet(a.vet)?.name}
                      </p>
                    </div>
                    <StatusBadge status={a.status} />
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section aria-labelledby="vax-title" className={card}>
            <SectionTitle id="vax-title" icon={<Syringe className="size-5" />}>
              Vaccinations
            </SectionTitle>
            {vaccines.length > 0 ? (
              <ul className="space-y-2">
                {vaccines.map((v) => (
                  <li
                    key={v.name}
                    className={`rounded-xl p-3 ${
                      v.state === "overdue"
                        ? "border-2 border-red-600 bg-red-50"
                        : v.state === "soon"
                          ? "border border-amber-300 bg-amber-50"
                          : "border border-slate-200"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-bold text-slate-900">{v.name}</p>
                      {v.state === "overdue" ? (
                        <span className="inline-flex items-center gap-1 rounded-md bg-red-600 px-2 py-0.5 text-xs font-bold text-white">
                          <TriangleAlert aria-hidden="true" className="size-3.5" />
                          Overdue {Math.abs(v.days)} days
                        </span>
                      ) : v.state === "soon" ? (
                        <span className="rounded-md bg-amber-200 px-2 py-0.5 text-xs font-bold text-amber-950">
                          Due in {v.days} days
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800">
                          <CircleCheck aria-hidden="true" className="size-3.5" />
                          Up to date
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-slate-700">
                      Given {fmtDate(v.given)}. Due{" "}
                      <span className={v.state === "overdue" ? "font-bold text-red-800" : "font-semibold"}>
                        {fmtDate(v.due)}
                      </span>
                      .
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-600">No vaccinations on file.</p>
            )}
          </section>

          <section aria-labelledby="meds-title" className={card}>
            <SectionTitle id="meds-title" icon={<Pill className="size-5" />}>
              Current medications
            </SectionTitle>
            {record && record.medications.length > 0 ? (
              <ul className="divide-y divide-slate-200">
                {record.medications.map((m) => (
                  <li key={m.name} className="py-2.5 first:pt-0 last:pb-0">
                    <p className="font-bold text-slate-900">{m.name}</p>
                    <p className="text-sm text-slate-700">
                      {m.dose} &middot; since {fmtDate(m.since)}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-600">No current medications on file.</p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
