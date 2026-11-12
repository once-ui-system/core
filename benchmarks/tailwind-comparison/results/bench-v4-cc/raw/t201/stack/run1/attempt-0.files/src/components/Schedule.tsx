"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  appointments as seed,
  findClash,
  formatLongDate,
  fromMin,
  ownerById,
  patientById,
  patients,
  today,
  toMin,
  vetById,
  vets,
  type Appointment,
} from "@/lib/data";
import { AlertList, StatusPill } from "./ui";

const NOW_START = 9 * 60 + 52;
const DAY_START = 8 * 60;
const DAY_END = 18 * 60;
const slots: string[] = [];
for (let m = DAY_START; m < DAY_END; m += 15) slots.push(fromMin(m));
const durations = [15, 20, 30, 45, 60];

function firstFree(list: Appointment[], vet: string, minutes: number, from: number): string {
  const start = Math.ceil(from / 15) * 15;
  for (const s of slots) {
    if (toMin(s) >= start && !findClash(list, vet, s, minutes) && toMin(s) + minutes <= DAY_END) return s;
  }
  return slots[0];
}

export function Schedule() {
  const [appts, setAppts] = useState<Appointment[]>(seed);
  const [now, setNow] = useState(NOW_START);
  const [vetFilter, setVetFilter] = useState<string>("all");
  const [message, setMessage] = useState("");
  const [justAdded, setJustAdded] = useState<string | null>(null);

  const [patient, setPatient] = useState("p-101");
  const [vet, setVet] = useState("v-1");
  const [minutes, setMinutes] = useState(20);
  const [time, setTime] = useState(() => firstFree(seed, "v-1", 20, NOW_START));
  const [reason, setReason] = useState("");
  const [urgent, setUrgent] = useState(false);

  useEffect(() => {
    const id = window.setInterval(() => setNow((n) => n + 1), 60000);
    return () => window.clearInterval(id);
  }, []);

  const rows = useMemo(
    () =>
      [...appts]
        .filter((a) => vetFilter === "all" || a.vet === vetFilter)
        .sort((a, b) => toMin(a.start) - toMin(b.start) || a.vet.localeCompare(b.vet)),
    [appts, vetFilter],
  );

  const waiting = useMemo(
    () =>
      appts
        .filter((a) => a.status === "checked_in")
        .sort((a, b) => toMin(a.checkedInAt ?? a.start) - toMin(b.checkedInAt ?? b.start)),
    [appts],
  );

  const count = (s: Appointment["status"]) => appts.filter((a) => a.status === s).length;
  const remaining = appts.filter((a) => a.status === "booked").length;

  const clash = findClash(appts, vet, time, minutes);
  const overrun = toMin(time) + minutes > DAY_END;
  const chosen = patientById(patient);

  const setStatus = (id: string, status: Appointment["status"]) => {
    const a = appts.find((x) => x.id === id);
    if (!a) return;
    const p = patientById(a.patient);
    setAppts((list) =>
      list.map((x) => (x.id === id ? { ...x, status, checkedInAt: status === "checked_in" ? fromMin(now) : x.checkedInAt } : x)),
    );
    const verb = status === "checked_in" ? "checked in" : status === "in_exam" ? "moved to the exam room" : "marked done";
    setMessage(`${p?.name ?? "Patient"} ${verb}.`);
  };

  const book = (e: React.FormEvent) => {
    e.preventDefault();
    if (clash || overrun) return;
    const id = `a-${String(appts.length + 1).padStart(2, "0")}`;
    const next: Appointment = {
      id,
      patient,
      vet,
      start: time,
      minutes,
      reason: reason.trim() || "Follow-up visit",
      status: "booked",
      urgent: urgent || undefined,
    };
    setAppts((l) => [...l, next]);
    setJustAdded(id);
    setMessage(`Booked ${chosen?.name} with ${vetById(vet).name} at ${time}.`);
    setReason("");
    setUrgent(false);
    setTime(firstFree([...appts, next], vet, minutes, toMin(time) + minutes));
  };

  const changeVet = (v: string) => {
    setVet(v);
    setTime(firstFree(appts, v, minutes, now));
  };
  const changeMinutes = (m: number) => {
    setMinutes(m);
    if (findClash(appts, vet, time, m)) setTime(firstFree(appts, vet, m, now));
  };

  return (
    <>
      <div className="pp-head">
        <div>
          <h1>Today’s schedule</h1>
          <p>{formatLongDate(today)} · Hillside Veterinary Clinic</p>
        </div>
        <p>Clock {fromMin(now)}</p>
      </div>

      <div className="pp-stats" role="group" aria-label="Today at a glance">
        <div className="pp-stat">
          <b>{waiting.length}</b>
          <span>Waiting now</span>
        </div>
        <div className="pp-stat">
          <b>{count("in_exam")}</b>
          <span>In exam</span>
        </div>
        <div className="pp-stat">
          <b>{remaining}</b>
          <span>Still to arrive</span>
        </div>
        <div className="pp-stat">
          <b>{count("done")}</b>
          <span>Done</span>
        </div>
      </div>

      <p className="pp-live" role="status" aria-live="polite">
        {message && <span className="pp-ok" style={{ display: "block", marginBottom: 14 }}>{message}</span>}
      </p>

      <div className="pp-layout">
        <div className="pp-aside">
          <section className="pp-card" aria-labelledby="wait-h">
            <div className="pp-card-head">
              <h2 id="wait-h">Waiting room</h2>
              <span className="pp-sub">{waiting.length} waiting</span>
            </div>
            {waiting.length === 0 ? (
              <p className="pp-empty">Nobody is waiting. Check in a patient from the schedule.</p>
            ) : (
              <ol className="pp-wait">
                {waiting.map((a, i) => {
                  const p = patientById(a.patient);
                  const mins = Math.max(0, now - toMin(a.checkedInAt ?? a.start));
                  return (
                    <li key={a.id}>
                      <Link className="n" href={`/patients/${a.patient}`}>
                        {i === 0 ? "Next: " : ""}
                        {p?.name}
                      </Link>
                      <span className={`m${mins >= 30 ? " long" : ""}`}>{mins} min</span>
                      <small>
                        {vetById(a.vet).name} · {a.reason} · in at {a.checkedInAt}
                      </small>
                      {p && p.alerts.length > 0 && (
                        <div style={{ gridColumn: "1 / -1" }}>
                          <AlertList alerts={p.alerts} />
                        </div>
                      )}
                    </li>
                  );
                })}
              </ol>
            )}
          </section>

          <section className="pp-card" aria-labelledby="book-h">
            <div className="pp-card-head">
              <h2 id="book-h">Book an appointment</h2>
            </div>
            <form className="pp-form" onSubmit={book} noValidate>
              <div className="pp-field">
                <label htmlFor="b-patient">Patient</label>
                <select id="b-patient" value={patient} onChange={(e) => setPatient(e.target.value)}>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.species}) · {ownerById(p.owner).name}
                      {p.alerts.length ? " · ALERT" : ""}
                    </option>
                  ))}
                </select>
                {chosen && chosen.alerts.length > 0 && <AlertList alerts={chosen.alerts} />}
              </div>
              <div className="pp-field">
                <label htmlFor="b-vet">Vet</label>
                <select id="b-vet" value={vet} onChange={(e) => changeVet(e.target.value)}>
                  {vets.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} · {v.room}
                    </option>
                  ))}
                </select>
              </div>
              <div className="pp-two">
                <div className="pp-field">
                  <label htmlFor="b-time">Time</label>
                  <select id="b-time" value={time} onChange={(e) => setTime(e.target.value)}>
                    {slots.map((s) => {
                      const taken = !!findClash(appts, vet, s, minutes) || toMin(s) + minutes > DAY_END;
                      return (
                        <option key={s} value={s} disabled={taken}>
                          {s}
                          {taken ? " (taken)" : ""}
                        </option>
                      );
                    })}
                  </select>
                </div>
                <div className="pp-field">
                  <label htmlFor="b-len">Length</label>
                  <select id="b-len" value={minutes} onChange={(e) => changeMinutes(Number(e.target.value))}>
                    {durations.map((d) => (
                      <option key={d} value={d}>
                        {d} min
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="pp-field">
                <label htmlFor="b-reason">Reason</label>
                <input id="b-reason" type="text" value={reason} placeholder="Follow-up visit" onChange={(e) => setReason(e.target.value)} />
              </div>
              <label className="pp-check">
                <input type="checkbox" checked={urgent} onChange={(e) => setUrgent(e.target.checked)} />
                Urgent visit
              </label>
              {(clash || overrun) && (
                <p className="pp-error" role="alert">
                  {clash
                    ? `${vetById(vet).name} already has ${patientById(clash.patient)?.name} from ${clash.start} to ${fromMin(toMin(clash.start) + clash.minutes)}. Pick another time or vet.`
                    : "That visit would run past closing time (18:00)."}
                </p>
              )}
              <button className="pp-btn wide" type="submit" disabled={!!clash || overrun}>
                Book appointment
              </button>
            </form>
          </section>
        </div>

        <section className="pp-sched" aria-labelledby="sched-h">
          <div className="pp-card-head">
            <h2 id="sched-h" style={{ fontSize: 20 }}>
              All appointments <span className="pp-sub">({rows.length})</span>
            </h2>
            <div className="pp-chips" role="group" aria-label="Filter by vet">
              <button type="button" className="pp-chip" aria-pressed={vetFilter === "all"} onClick={() => setVetFilter("all")}>
                All vets
              </button>
              {vets.map((v) => (
                <button key={v.id} type="button" className="pp-chip" aria-pressed={vetFilter === v.id} onClick={() => setVetFilter(v.id)}>
                  {v.name.replace("Dr. ", "Dr ")}
                </button>
              ))}
            </div>
          </div>
          <div className="pp-cols" aria-hidden="true">
            <span>Time</span>
            <span>Patient</span>
            <span>Reason</span>
            <span>Vet</span>
            <span>Status</span>
            <span />
          </div>
          <ul className="pp-list">
            {rows.map((a) => {
              const p = patientById(a.patient);
              if (!p) return null;
              const v = vetById(a.vet);
              return (
                <li key={a.id} className={`pp-row pp-s-${a.status}${a.urgent ? " pp-urgent" : ""}${justAdded === a.id ? " pp-new" : ""}`}>
                  <div className="pp-time">
                    {a.start}
                    <span>{a.minutes} min</span>
                  </div>
                  <div className="pp-who">
                    <Link href={`/patients/${p.id}`}>{p.name}</Link>
                    <small>
                      {p.species} · {ownerById(p.owner).name}
                    </small>
                    <AlertList alerts={p.alerts} />
                  </div>
                  <div className="pp-reason">
                    {a.urgent && <span className="pp-tag-urgent">Urgent</span>}
                    {a.reason}
                  </div>
                  <div className="pp-vet">
                    {v.name}
                    <br />
                    {v.room}
                  </div>
                  <div className="pp-state">
                    <StatusPill status={a.status} />
                  </div>
                  <div className="pp-act">
                    {a.status === "booked" && (
                      <button type="button" className="pp-btn" onClick={() => setStatus(a.id, "checked_in")} aria-label={`Check in ${p.name}`}>
                        Check in
                      </button>
                    )}
                    {a.status === "checked_in" && (
                      <button type="button" className="pp-btn ghost" onClick={() => setStatus(a.id, "in_exam")} aria-label={`Start exam for ${p.name}`}>
                        Start exam
                      </button>
                    )}
                    {a.status === "in_exam" && (
                      <button type="button" className="pp-btn ghost" onClick={() => setStatus(a.id, "done")} aria-label={`Mark ${p.name} done`}>
                        Mark done
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </>
  );
}
