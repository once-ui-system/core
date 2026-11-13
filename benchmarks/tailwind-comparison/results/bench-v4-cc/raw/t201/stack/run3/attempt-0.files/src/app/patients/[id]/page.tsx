import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Shell from "@/components/pawpoint/Shell";
import WeightChart from "@/components/pawpoint/WeightChart";
import { AlertBadges, WarnIcon } from "@/components/pawpoint/Alerts";
import {
  APPOINTMENTS,
  PATIENTS,
  RECORDS,
  STATUS_LABEL,
  TODAY,
  ageText,
  daysBetween,
  formatDate,
  money,
  ownerOf,
  patientOf,
  vetOf,
} from "@/lib/data";

export function generateStaticParams() {
  return PATIENTS.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const p = patientOf(id);
  return { title: p ? `${p.name} · Pawpoint` : "Patient · Pawpoint" };
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const patient = patientOf(id);
  if (!patient) notFound();
  const owner = ownerOf(patient.owner);
  const record = RECORDS[patient.id];
  const todays = APPOINTMENTS.filter((a) => a.patient === patient.id && a.status !== "cancelled");

  const vaccines = record
    ? record.vaccinations
        .map((v) => ({ ...v, days: daysBetween(TODAY, v.due) }))
        .sort((a, b) => a.days - b.days)
    : [];
  const overdue = vaccines.filter((v) => v.days < 0);

  const weights = record?.weights_kg ?? [];
  const firstW = weights[0];
  const lastW = weights[weights.length - 1];
  const change = firstW && lastW ? lastW.kg - firstW.kg : 0;
  const pct = firstW && lastW ? (change / firstW.kg) * 100 : 0;

  return (
    <Shell current="patient">
      <p className="pp-crumb">
        <Link href="/">← Back to schedule</Link>
      </p>

      <section className="pp-card pp-pt-head" aria-labelledby="pt-name">
        <div className="pp-pt-id">
          <span className="pp-pt-avatar" aria-hidden="true">
            {patient.name[0]}
          </span>
          <div>
            <h1 id="pt-name" className="pp-h1">
              {patient.name}
            </h1>
            <p className="pp-sub">
              {patient.breed} · {patient.species} · {patient.sex}
            </p>
          </div>
        </div>
        <dl className="pp-facts">
          <div>
            <dt>Age</dt>
            <dd>{ageText(patient.born, TODAY)}</dd>
          </div>
          <div>
            <dt>Born</dt>
            <dd>{formatDate(patient.born)}</dd>
          </div>
          <div>
            <dt>Owner</dt>
            <dd>{owner?.name}</dd>
          </div>
          <div>
            <dt>Phone</dt>
            <dd>
              {owner && (
                <a href={`tel:${owner.phone.replace(/\s/g, "")}`} className="pp-tel">
                  {owner.phone}
                </a>
              )}
            </dd>
          </div>
          <div>
            <dt>Patient ID</dt>
            <dd>{patient.id}</dd>
          </div>
        </dl>
      </section>

      {patient.alerts.length > 0 && (
        <section className="pp-alert-banner" aria-labelledby="alerts-h">
          <h2 id="alerts-h" className="pp-alert-title">
            <WarnIcon /> Medical alerts for {patient.name}
          </h2>
          <AlertBadges alerts={patient.alerts} size="lg" />
        </section>
      )}

      {todays.length > 0 && (
        <section className="pp-card" aria-labelledby="today-h">
          <h2 id="today-h" className="pp-h2">
            On today’s schedule
          </h2>
          <ul className="pp-plain">
            {todays.map((a) => (
              <li key={a.id}>
                <strong>{a.start}</strong> · {a.reason} · {vetOf(a.vet)?.name} ({vetOf(a.vet)?.room}) ·{" "}
                <span className={`pp-badge pp-st-${a.status}`}>
                  <span className="pp-dot" aria-hidden="true" />
                  {STATUS_LABEL[a.status]}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {!record && (
        <section className="pp-card">
          <h2 className="pp-h2">Clinical history</h2>
          <p className="pp-empty">No weights, vaccinations, medications or visits are on file for {patient.name} in this demo.</p>
        </section>
      )}

      {record && (
        <div className="pp-cols">
          <section className="pp-card" aria-labelledby="w-h">
            <h2 id="w-h" className="pp-h2">
              Weight trend
            </h2>
            <p className="pp-sub">
              {lastW.kg.toFixed(1)} kg now, {change < 0 ? "down" : "up"} {Math.abs(change).toFixed(1)} kg (
              {Math.abs(pct).toFixed(0)}%) since {formatDate(firstW.date)}
            </p>
            <WeightChart points={weights} />
          </section>

          <section className="pp-card" aria-labelledby="v-h">
            <h2 id="v-h" className="pp-h2">
              Vaccinations
            </h2>
            {overdue.length > 0 && (
              <p className="pp-overdue-note" role="note">
                <WarnIcon /> {overdue.length} overdue as of {formatDate(TODAY)}: {overdue.map((v) => v.name).join(", ")}
              </p>
            )}
            <ul className="pp-vax">
              {vaccines.map((v) => {
                const kind = v.days < 0 ? "over" : v.days <= 60 ? "soon" : "ok";
                return (
                  <li key={v.name} className={`pp-vax-${kind}`}>
                    <div>
                      <strong>{v.name}</strong>
                      <span className="pp-muted">
                        Given {formatDate(v.given)} · due {formatDate(v.due)}
                      </span>
                    </div>
                    <span className={`pp-tag pp-tag-${kind}`}>
                      {kind === "over" ? `Overdue ${Math.abs(v.days)} days` : kind === "soon" ? `Due in ${v.days} days` : "Up to date"}
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>

          <section className="pp-card" aria-labelledby="m-h">
            <h2 id="m-h" className="pp-h2">
              Current medications
            </h2>
            <ul className="pp-meds">
              {record.medications.map((m) => (
                <li key={m.name}>
                  <strong>{m.name}</strong>
                  <span>{m.dose}</span>
                  <span className="pp-muted">Since {formatDate(m.since)}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="pp-card pp-wide" aria-labelledby="h-h">
            <h2 id="h-h" className="pp-h2">
              Visit history
            </h2>
            <ol className="pp-visits">
              {record.visits.map((v) => (
                <li key={v.date}>
                  <div className="pp-visit-head">
                    <strong>{formatDate(v.date)}</strong>
                    <span>{v.reason}</span>
                    <span className="pp-muted">{vetOf(v.vet)?.name}</span>
                    <span className="pp-invoice">{money(v.invoice_usd)}</span>
                  </div>
                  <p>{v.notes}</p>
                </li>
              ))}
            </ol>
          </section>
        </div>
      )}
    </Shell>
  );
}
