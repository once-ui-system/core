import Link from "next/link";
import { notFound } from "next/navigation";
import { Shell } from "@/components/Shell";
import { AlertList, StatusPill } from "@/components/ui";
import {
  ageText,
  appointments,
  daysBetween,
  formatDate,
  fromMin,
  money,
  ownerById,
  patientById,
  patients,
  records,
  today,
  toMin,
  vetById,
} from "@/lib/data";

export const metadata = { title: "Patient record · Pawpoint" };

export function generateStaticParams() {
  return patients.map((p) => ({ id: p.id }));
}

function WeightChart({ points }: { points: { date: string; kg: number }[] }) {
  const W = 640;
  const H = 250;
  const L = 44;
  const R = 24;
  const T = 28;
  const B = 36;
  const t = points.map((p) => Date.parse(`${p.date}T00:00:00Z`));
  const t0 = Math.min(...t);
  const t1 = Math.max(...t);
  const kgs = points.map((p) => p.kg);
  const lo = Math.floor(Math.min(...kgs) - 0.5);
  const hi = Math.ceil(Math.max(...kgs) + 0.5);
  const x = (v: number) => L + ((v - t0) / (t1 - t0 || 1)) * (W - L - R);
  const y = (kg: number) => T + (1 - (kg - lo) / (hi - lo)) * (H - T - B);
  const ticks: number[] = [];
  for (let k = lo; k <= hi; k++) ticks.push(k);
  const label = (d: string) =>
    new Intl.DateTimeFormat("en-US", { month: "short", year: "2-digit", timeZone: "UTC" }).format(new Date(`${d}T00:00:00Z`));
  const summary = points.map((p) => `${formatDate(p.date)}: ${p.kg} kg`).join("; ");
  return (
    <svg className="pp-chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Weight in kilograms over visits. ${summary}`}>
      {ticks.map((k) => (
        <g key={k}>
          <line x1={L} x2={W - R} y1={y(k)} y2={y(k)} stroke="#d8e1de" strokeWidth="1" />
          <text x={L - 8} y={y(k) + 4} textAnchor="end">
            {k}
          </text>
        </g>
      ))}
      <polyline fill="none" stroke="#0f6b63" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" points={points.map((p, i) => `${x(t[i])},${y(p.kg)}`).join(" ")} />
      {points.map((p, i) => (
        <g key={p.date}>
          <circle cx={x(t[i])} cy={y(p.kg)} r="5" fill="#fff" stroke="#0f6b63" strokeWidth="3" />
          <text className="val" x={x(t[i])} y={y(p.kg) - 12} textAnchor="middle">
            {p.kg}
          </text>
          <text x={x(t[i])} y={H - 10} textAnchor="middle">
            {label(p.date)}
          </text>
        </g>
      ))}
    </svg>
  );
}

export default async function PatientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const patient = patientById(id);
  if (!patient) notFound();
  const owner = ownerById(patient.owner);
  const record = records[patient.id];
  const todays = appointments.filter((a) => a.patient === patient.id).sort((a, b) => toMin(a.start) - toMin(b.start));

  const first = record?.weights_kg[0];
  const last = record?.weights_kg[record.weights_kg.length - 1];
  const delta = first && last ? last.kg - first.kg : 0;
  const pct = first ? (delta / first.kg) * 100 : 0;

  return (
    <Shell>
      <Link href="/" className="pp-back">
        ← Today’s schedule
      </Link>

      {patient.alerts.length > 0 && (
        <section className="pp-banner" aria-label="Medical alerts">
          <h2>Medical alerts: read before handling</h2>
          <AlertList alerts={patient.alerts} large />
        </section>
      )}

      <section className="pp-card">
        <div className="pp-id">
          <div className="pp-pet" aria-hidden="true">
            {patient.name[0]}
          </div>
          <div>
            <h1>{patient.name}</h1>
            <p className="pp-sub">
              {patient.breed} · {patient.species}
            </p>
          </div>
        </div>
        <dl className="pp-facts">
          <div>
            <dt>Age</dt>
            <dd>{ageText(patient.born)}</dd>
          </div>
          <div>
            <dt>Born</dt>
            <dd>{formatDate(patient.born)}</dd>
          </div>
          <div>
            <dt>Sex</dt>
            <dd>{patient.sex}</dd>
          </div>
          <div>
            <dt>Owner</dt>
            <dd>{owner.name}</dd>
          </div>
          <div>
            <dt>Owner phone</dt>
            <dd>
              <a href={`tel:${owner.phone.replace(/\s/g, "")}`}>{owner.phone}</a>
            </dd>
          </div>
          <div>
            <dt>Patient ID</dt>
            <dd>{patient.id}</dd>
          </div>
        </dl>
      </section>

      {todays.length > 0 && (
        <section className="pp-card" style={{ marginTop: 18 }} aria-labelledby="today-h">
          <div className="pp-card-head">
            <h2 id="today-h">Today, {formatDate(today)}</h2>
          </div>
          <ul className="pp-meds">
            {todays.map((a) => (
              <li key={a.id}>
                <span>
                  <b>
                    {a.start}–{fromMin(toMin(a.start) + a.minutes)}
                  </b>{" "}
                  {a.reason} · {vetById(a.vet).name}, {vetById(a.vet).room}
                </span>
                <StatusPill status={a.status} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {!record ? (
        <section className="pp-card" style={{ marginTop: 18 }}>
          <p className="pp-empty">No weight, vaccination or visit history is loaded for {patient.name} in this demo.</p>
        </section>
      ) : (
        <div className="pp-grid2">
          <div className="pp-stack">
            <section className="pp-card" aria-labelledby="w-h">
              <div className="pp-card-head">
                <h2 id="w-h">Weight trend</h2>
                <span className="pp-sub">
                  {first && last && (
                    <>
                      <span className="pp-trend">
                        {delta > 0 ? "+" : "−"}
                        {Math.abs(delta).toFixed(1)} kg ({Math.abs(pct).toFixed(0)}%)
                      </span>{" "}
                      since {formatDate(first.date)}
                    </>
                  )}
                </span>
              </div>
              <div className="pp-scroll">
                <WeightChart points={record.weights_kg} />
              </div>
            </section>

            <section className="pp-card" aria-labelledby="v-h">
              <div className="pp-card-head">
                <h2 id="v-h">Visit history</h2>
                <span className="pp-sub">{record.visits.length} visits</span>
              </div>
              <ol className="pp-visits">
                {record.visits.map((v) => (
                  <li className="pp-visit" key={v.date}>
                    <header>
                      <b>{formatDate(v.date)}</b>
                      <span>{v.reason}</span>
                      <span className="meta">
                        {vetById(v.vet).name} · {money(v.invoice_usd)}
                      </span>
                    </header>
                    <p>{v.notes}</p>
                  </li>
                ))}
              </ol>
            </section>
          </div>

          <div className="pp-stack">
            <section className="pp-card" aria-labelledby="vx-h">
              <div className="pp-card-head">
                <h2 id="vx-h">Vaccinations</h2>
                <span className="pp-sub">checked against {formatDate(today)}</span>
              </div>
              <ul className="pp-vax">
                {record.vaccinations.map((v) => {
                  const left = daysBetween(today, v.due);
                  const cls = left < 0 ? "over" : left <= 30 ? "soon" : "";
                  return (
                    <li key={v.name} className={cls}>
                      <b>{v.name}</b>
                      <span className="st">{left < 0 ? `OVERDUE ${-left} days` : left <= 30 ? `Due in ${left} days` : "Up to date"}</span>
                      <small>
                        Given {formatDate(v.given)} · due {formatDate(v.due)}
                      </small>
                    </li>
                  );
                })}
              </ul>
            </section>

            <section className="pp-card" aria-labelledby="m-h">
              <div className="pp-card-head">
                <h2 id="m-h">Current medications</h2>
              </div>
              <ul className="pp-meds">
                {record.medications.map((m) => (
                  <li key={m.name}>
                    <span>
                      <b>{m.name}</b>
                      <br />
                      <span className="pp-sub">{m.dose}</span>
                    </span>
                    <span className="pp-sub">since {formatDate(m.since)}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      )}
    </Shell>
  );
}
